import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const U = (n: number) => `00000000-0000-0000-0000-00000000000${n}`;
const can = async (u: string, p: string, unit: string | null = null) => (await db.query<{ v: boolean }>('select private.position_can($1,$2,$3) v', [u, p, unit])).rows[0].v;
const assign = (id: string, u: string, unit: string, title: string) => db.query("insert into org_assignments values($1,$2,$3,$4,'active',now()-interval '1 day',null)", [id, u, unit, title]);
beforeAll(async () => {
  await db.exec(`create schema private;create schema auth;create role anon;create role authenticated;create role service_role;
  create function auth.uid() returns uuid language sql as $$select null::uuid$$;create function private.is_active(uuid) returns boolean language sql as $$select true$$;
  create table org_units(id text primary key,parent_id text,active boolean default true);
  create table org_titles(id text primary key,kind text,capacity int);
  create table app_roles(id text primary key,permissions text[]);
  create table org_assignments(id text primary key,user_id uuid,unit_id text,title_id text,status text,starts_at timestamptz,ends_at timestamptz);
  create table org_position_slots(id text,unit_id text,title_id text,role_id text,active boolean);
  insert into org_units values('sales',null),('d1','sales'),('t1','d1'),('t2','d1'),('d2','sales'),('mkt',null);
  insert into org_titles values('staff','staff',null),('team_lead','manager',1),('head','manager',1);
  insert into app_roles values('role-v2-sales-staff','{biz.crm_use}'),('role-v2-sales-team','{biz.crm_view_scope}'),('role-v2-sales-head','{biz.crm_view_scope}'),('role-v2-mkt-staff','{task.view}');
  insert into org_position_slots values('s1','t1','staff','role-v2-sales-staff',true),('s2','t1','staff','role-v2-sales-staff',true),('s3','mkt','staff','role-v2-mkt-staff',true);`);
  await db.exec(readFileSync('docs/pending/position_roles_model.sql', 'utf8'));
  await db.exec(`insert into org_position_roles(unit_id,title_id,role_id) values('t2','staff','role-v2-sales-staff'),('d2','staff','role-v2-sales-staff'),('t1','team_lead','role-v2-sales-team'),('d1','head','role-v2-sales-head')`);
}, 30000);
afterAll(() => db.close());
it('backfill merges per-person slots into one binding per (unit,title)', async () => {
  expect((await db.query("select count(*)::int n from org_position_roles where unit_id='t1' and title_id='staff'")).rows).toEqual([{ n: 1 }]);
});
it('one job position holds many staff with the same Role, no slot and no cap', async () => {
  for (let i = 1; i <= 5; i++) await assign(`a${i}`, U(i), 't1', 'staff');
  for (let i = 1; i <= 5; i++) expect(await can(U(i), 'biz.crm_use')).toBe(true);
});
it('new team and new department reuse the same Role without new Roles', async () => {
  await assign('b1', U(6), 't2', 'staff'); await assign('b2', U(7), 'd2', 'staff');
  expect(await can(U(6), 'biz.crm_use')).toBe(true); expect(await can(U(7), 'biz.crm_use')).toBe(true);
  expect((await db.query('select count(*)::int n from app_roles')).rows).toEqual([{ n: 4 }]);
});
it('team lead sees only own team, head sees whole department, staff no manager scope', async () => {
  await assign('l1', U(8), 't1', 'team_lead'); await assign('h1', U(9), 'd1', 'head');
  expect(await can(U(8), 'biz.crm_view_scope', 't1')).toBe(true);
  expect(await can(U(8), 'biz.crm_view_scope', 't2')).toBe(false);
  expect(await can(U(9), 'biz.crm_view_scope', 't2')).toBe(true);
  expect(await can(U(9), 'biz.crm_view_scope', 'd2')).toBe(false);
  expect(await can(U(1), 'biz.crm_view_scope', 't1')).toBe(false);
});
it('management title is single-holder only because capacity is set; replacing leader needs ending first', async () => {
  await expect(assign('l2', U(1), 't1', 'team_lead')).rejects.toThrow('đủ người');
  await db.exec("update org_assignments set ends_at=now() where id='l1'");
  await db.query("insert into org_assignments values('l2',$1,'t1','team_lead','active',now(),null)", [U(1)]);
  expect(await can(U(1), 'biz.crm_view_scope', 't1')).toBe(true);
  expect(await can(U(8), 'biz.crm_view_scope', 't1')).toBe(false);
});
it('concurrent positions union Roles; scope of one source never extends another', async () => {
  await assign('c1', U(2), 'mkt', 'staff');
  expect(await can(U(2), 'task.view')).toBe(true); expect(await can(U(2), 'biz.crm_use')).toBe(true);
  expect(await can(U(2), 'biz.crm_view_scope', 't1')).toBe(false);
});
it('ended assignment stops rights; unbound titles grant nothing', async () => {
  await db.exec("update org_assignments set ends_at=now() where id='a5'");
  expect(await can(U(5), 'biz.crm_use')).toBe(false);
  await assign('x1', U(5), 'sales', 'staff');
  expect(await can(U(5), 'biz.crm_use')).toBe(false);
});
it('clients cannot call resolver functions or write bindings', async () => {
  const r = (await db.query<{ v: boolean }>("select has_function_privilege('authenticated','private.position_can(uuid,text,text)','execute') v")).rows[0].v;
  const w = (await db.query<{ v: boolean }>("select has_table_privilege('authenticated','public.org_position_roles','insert') v")).rows[0].v;
  expect([r, w]).toEqual([false, false]);
});
it('rollback is additive removal: dropping new objects leaves slots and assignments intact', async () => {
  await db.exec('drop trigger org_manager_capacity_guard on org_assignments;drop function private.position_can(uuid,text,text);drop function private.position_role_sources(uuid,timestamptz);drop table org_position_roles');
  expect((await db.query('select count(*)::int n from org_position_slots')).rows).toEqual([{ n: 3 }]);
  expect((await db.query("select count(*)::int n from org_assignments")).rows[0]).toEqual({ n: 12 });
});
