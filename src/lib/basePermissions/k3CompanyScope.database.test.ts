import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, afterEach, it, expect } from 'vitest';
const db = new PGlite();
const uid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const can = async (u: number, p: string, unit: string | null = null) => (await db.query<{ v: boolean }>('select private.k3_company_can($1,$2,$3) v', [uid(u), p, unit])).rows[0].v;
const scope = async (u: number, owner: number, unit: string | null = null) => (await db.query<{ v: boolean }>('select private.k3_company_scope($1,$2,$3) v', [uid(u), uid(owner), unit])).rows[0].v;
beforeAll(async () => {
  await db.exec(`create schema private;create role anon;create role authenticated;create role service_role;
    create table profiles(id uuid,status text);create table org_units(id text primary key,parent_id text,active boolean default true);
    create table org_titles(id text primary key,active boolean default true,kind text);
    create table app_roles(id text primary key,permissions text[],catalog_generation smallint default 2,catalog_state text default 'standard',role_kind text default 'position',is_system boolean default false);
    create table org_position_roles(unit_id text,title_id text,role_id text);
    create table org_assignments(id text,user_id uuid,unit_id text,title_id text,status text default 'active',starts_at timestamptz default now()-interval '1 day',ends_at timestamptz);
    create table k3_settings(id boolean,enabled boolean,company_effective_from date);
    alter table org_units add column source text,add column source_id text;
    create table k3_goals(id uuid,user_id uuid,org_unit_id text,department_id uuid);
    create table k3_goal_members(goal_id uuid,user_id uuid,status text);
    create table denies(user_id uuid,permission text);
    create function private.is_active(u uuid) returns boolean language sql as $$select exists(select 1 from profiles where id=u and status='active')$$;
    create function public.biz_admin(u uuid) returns boolean language sql as $$select u='${uid(1)}'::uuid$$;
    create function private.base_config() returns jsonb language sql as $$select '{}'::jsonb$$;
    create function private.base_valid_at(jsonb) returns boolean language sql as $$select true$$;
    create function private.base_rules(u uuid,c jsonb) returns jsonb language sql as $$select coalesce(jsonb_agg(jsonb_build_object('permission',permission,'effect','DENY')),'[]') from denies where user_id=u$$;
    create function private.org_unit_subtree(root text) returns table(id text) language sql as $$with recursive t(id) as(select root union select ou.id from org_units ou join t on ou.parent_id=t.id where ou.active) select id from t$$;
    insert into org_units values('company',null),('mkt','company'),('design','mkt'),('sales','company'),('team','sales'),('hr','company'),('accounting','company'),('delivery','company');
    insert into org_titles values('staff',true,'staff'),('manager',true,'manager');
    insert into app_roles(id,permissions) values('staff','{k3.use}'),('manager','{k3.use,k3.view_scope,k3.comment}'),('task','{k3.view_scope,k3.comment}');
    update app_roles set role_kind='marketing_task' where id='task';
    insert into org_position_roles values('mkt','manager','manager'),('sales','manager','manager'),('company','manager','manager'),('team','manager','manager'),('hr','staff','staff');
    insert into k3_settings values(true,true,null);`);
  for (let i = 1; i <= 12; i++) await db.query("insert into profiles values($1,'active')", [uid(i)]);
  for (const [n, unit, title] of [[2, 'mkt', 'manager'], [3, 'sales', 'manager'], [4, 'company', 'manager'], [5, 'team', 'manager'], [6, 'hr', 'staff'], [7, 'design', 'staff']] as const)
    await db.query('insert into org_assignments(id,user_id,unit_id,title_id) values($1,$2,$3,$4)', [`a${n}`, uid(n), unit, title]);
  await db.exec(readFileSync('docs/pending/k3_company_scope.sql', 'utf8'));
}, 30000);
beforeEach(() => db.exec('begin'));
afterEach(() => db.exec('rollback'));
afterAll(() => db.close());
it('active Marketing/Design/Sales/HR/accounting/delivery and unassigned staff all have only personal fallback', async () => {
  for (const n of [6, 7, 8, 9, 10, 11, 12]) {
    expect(await can(n, 'k3.use')).toBe(true);
    expect(await can(n, 'k3.view_scope')).toBe(false);
    expect(await can(n, 'k3.settings')).toBe(false);
    expect(await scope(n, n)).toBe(true);
    expect(await scope(n, 7, 'design')).toBe(n === 7);
  }
});
it('manager scope follows own unit subtree, not peers; company manager spans company', async () => {
  expect(await scope(2, 7)).toBe(true);
  expect(await scope(3, 7)).toBe(false);
  expect(await scope(5, 7, 'design')).toBe(false);
  expect(await scope(4, 7, 'design')).toBe(true);
  expect(await can(2, 'k3.comment', 'design')).toBe(true);
  expect(await can(2, 'k3.comment', 'hr')).toBe(false);
});
it('concurrent assignments cannot borrow manager permission into a staff unit; second manager source unions scope', async () => {
  await db.query("insert into org_assignments(id,user_id,unit_id,title_id) values('concurrent',$1,'hr','staff')", [uid(2)]);
  expect(await scope(2, 6, 'hr')).toBe(false);
  await db.exec("insert into org_position_roles values('hr','manager','manager')");
  await db.query("insert into org_assignments(id,user_id,unit_id,title_id) values('second-manager',$1,'hr','manager')", [uid(2)]);
  expect(await scope(2, 6, 'hr')).toBe(true);
  await db.exec("update org_assignments set ends_at=now() where id='second-manager'");
  expect(await scope(2, 6, 'hr')).toBe(false);
  expect(await scope(2, 7, 'design')).toBe(true);
});
it('DENY beats personal fallback and scoped Role grants; inactive admin also fails closed', async () => {
  await db.query("insert into denies values($1,'k3.use'),($2,'k3.view_scope')", [uid(8), uid(2)]);
  expect(await can(8, 'k3.use')).toBe(false);
  expect(await scope(2, 7, 'design')).toBe(false);
  await db.query("update profiles set status='locked' where id=$1", [uid(1)]);
  expect(await can(1, 'k3.use')).toBe(false);
});
it('Marketing task Role and non-manager titles cannot create 3K management access', async () => {
  await db.exec("update org_position_roles set role_id='task' where unit_id='mkt'; update app_roles set permissions='{k3.use,k3.view_scope,k3.comment}' where id='staff'");
  expect(await scope(2, 7, 'design')).toBe(false);
  expect(await can(6, 'k3.view_scope')).toBe(false);
});
it('frozen historical unit is authoritative, not current transfer destination', async () => {
  await db.exec("update org_assignments set unit_id='hr' where id='a7'");
  expect(await scope(2, 7, 'design')).toBe(true);
  expect(await scope(2, 7)).toBe(false);
});
it('new company obligation date is disabled until explicit cutover and never applies before its date', async () => {
  const obligation = async (d: string) => (await db.query<{ v: boolean }>('select private.k3_company_obligation_started($1) v', [d])).rows[0].v;
  expect(await obligation('2026-11-12')).toBe(false);
  await db.exec("update k3_settings set company_effective_from='2026-11-20'");
  expect(await obligation('2026-11-19')).toBe(false);
  expect(await obligation('2026-11-20')).toBe(true);
});
it('cross-unit invitation exposes only the invited KG, never other goals or owner unit scope', async () => {
  await db.query("insert into k3_goals values($1,$2,'hr',null),($3,$2,'hr',null)",[uid(101),uid(6),uid(102)]);
  await db.query("insert into k3_goal_members values($1,$2,'invited')",[uid(101),uid(7)]);
  const visible=async(n:number)=>(await db.query<{v:boolean}>('select private.k3_company_goal_visible($1,$2) v',[uid(7),uid(n)])).rows[0].v;
  expect(await visible(101)).toBe(true);
  expect(await visible(102)).toBe(false);
  expect(await scope(7,6,'hr')).toBe(false);
  await db.exec("update k3_goal_members set status='revoked'");
  expect(await visible(101)).toBe(false);
});
it('additive schema preserves old department attribution and keeps company activation NULL', async () => {
  await db.exec(`alter table k3_goals drop column org_unit_id;
    create table k3_days(id uuid,work_date date,department_id uuid);
    create table k3_period_summaries(id uuid,department_id uuid);
    create table k3_daily_closes(id uuid,department_id uuid);
    alter table k3_settings drop column company_effective_from;
    insert into k3_goals values('${uid(103)}','${uid(6)}','${uid(201)}');`);
  await db.exec(readFileSync('docs/pending/k3_company_schema.sql', 'utf8'));
  expect((await db.query('select department_id,org_unit_id from k3_goals')).rows).toEqual([{department_id:uid(201),org_unit_id:null}]);
  expect((await db.query('select company_effective_from from k3_settings')).rows).toEqual([{company_effective_from:null}]);
  await db.exec('savepoint inert_rollback;');
  await db.exec(readFileSync('docs/k3-company-2026-11-12/rollback.sql','utf8'));
  expect((await db.query('select count(*)::int n from k3_goals')).rows).toEqual([{n:1}]);
  await db.exec('rollback to inert_rollback');
});