import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// 0358: unit-scoped visibility for Leave / Finance / Order-tracking derives the owning unit
// from the related user's active org membership; role-designer is retired to the standard
// design role; the resign trigger writes audit events with a real actor.
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const mgr = '00000000-0000-0000-0000-000000000002';
const staffIn = '00000000-0000-0000-0000-000000000003';
const staffOut = '00000000-0000-0000-0000-000000000004';
const noUnit = '00000000-0000-0000-0000-000000000005';
const scalar = async (sql: string, args: unknown[] = []) => (await db.query<{ v: unknown }>(sql, args)).rows[0]?.v;

beforeAll(async () => {
  await db.exec(`create schema private; create schema auth; create role anon; create role authenticated; create role service_role;
create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
create table profiles(id uuid primary key, status text);
create table org_units(id text primary key, name text, parent_id text, kind text, active boolean);
create table org_assignments(id text, unit_id text, title_id text, user_id uuid, category text, starts_at timestamptz, ends_at timestamptz, status text, source text, source_id text, data jsonb, revision bigint);
create table user_roles(user_id uuid, role_id text);
create table app_roles(id text primary key, name text, permissions text[], catalog_state text);
create table base_title_role_links(id uuid, title_source text, title_id text, role_id text, is_primary boolean, scope_kind text, active boolean, revision bigint, reason text, updated_by uuid, updated_at timestamptz, enabled_permissions text[], permission_signature text);
create table base_title_role_events(id uuid default gen_random_uuid(), actor_id uuid, title_source text, title_id text, reason text, before_data jsonb, after_data jsonb, created_at timestamptz default now());
create table base_permission_catalog(key text primary key, label text, module text, dependencies text[]);
create table mkt_specialties(id text primary key, name text, role_id text, active boolean);
create table leave_requests(id uuid primary key, owner_id uuid, created_by uuid, approver_id uuid);
create table bank_accounts(id uuid primary key, share_sale boolean);
create table bank_transactions(id uuid primary key, source text, claimed_by uuid, created_by uuid, confirmation_status text, operation_test boolean, bank_account_id uuid);
create table ot_orders(id uuid primary key, sale_id uuid, supply_id uuid, created_by uuid);
create table ot_tasks(order_id uuid, assignee_id uuid);
create table test_grants(user_id uuid, perm text);
create function private.is_active(u uuid) returns boolean language sql security definer as $$ select exists(select 1 from profiles where id=u and status='Đang hoạt động') $$;
create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u = '${admin}'::uuid $$;
create function private.fin_super(u uuid) returns boolean language sql as $$ select false $$;
create function private.has_permission(u uuid, p text) returns boolean language sql security definer as $$ select exists(select 1 from test_grants where user_id=u and perm=p) $$;
create function private.sig_can(u uuid, p text) returns boolean language sql security definer as $$ select u is not null and private.is_active(u) and (private.is_super_admin(u) or private.has_permission(u,p)) $$;
create function private.base_valid_at(m jsonb) returns boolean language sql immutable as $$ select (m->>'starts_at')::timestamptz <= now() and (m->>'ends_at' is null or (m->>'ends_at')::timestamptz > now()) $$;
create function private.base_config() returns jsonb language sql stable security definer as $$ select jsonb_build_object('units', coalesce((select jsonb_agg(to_jsonb(x)) from org_units x),'[]'), 'memberships', coalesce((select jsonb_agg(to_jsonb(m)) from org_assignments m),'[]'), 'titles', '[]'::jsonb, 'role_links', '[]'::jsonb) $$;
insert into profiles values ('${admin}','Đang hoạt động'),('${mgr}','Đang hoạt động'),('${staffIn}','Đang hoạt động'),('${staffOut}','Đang hoạt động'),('${noUnit}','Đang hoạt động');
insert into org_units values ('co','Công ty',null,'company',true),('ua','Kinh doanh','co','department',true),('ua1','Nhóm A','ua','team',true),('ub','Marketing','co','department',true);
insert into org_assignments(id,unit_id,user_id,starts_at,ends_at,status,data,revision) values
  ('m1','ua','${mgr}',now(),null,'active','{}',1),
  ('m2','ua1','${staffIn}',now(),null,'active','{}',1),
  ('m3','ub','${staffOut}',now(),null,'active','{}',1);
insert into user_roles values ('${admin}','role-super-admin');
insert into app_roles values
  ('role-standard-sales-head','Trưởng phòng Kinh doanh',array['ot.view_own'],'standard'),
  ('role-standard-design-staff','Nhân viên Thiết kế',array['order.view'],'standard'),
  ('role-designer','Designer / Chụp ảnh',array['order.view','leave.approve'],'compatibility');
insert into mkt_specialties values ('design','Thiết kế','role-designer',true),('photography','Chụp ảnh','role-designer',true);
insert into base_title_role_links values ('11111111-1111-1111-1111-111111111111','biz','t1','role-standard-sales-head',true,'own',false,1,'test',null,now(),array['ot.view_own'],md5((select permissions::text from app_roles where id='role-standard-sales-head')));
insert into test_grants values ('${mgr}','leave.view_unit'),('${mgr}','ot.view_unit'),('${mgr}','finance.incoming.view_unit');`);
  await db.exec(readFileSync('drizzle/migrations/0358_unit_scope_leave_finance_orders_retire_role_designer.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());

it('catalog and allowlist include the three unit-scope permissions', async () => {
  for (const p of ['leave.view_unit', 'ot.view_unit', 'finance.incoming.view_unit']) {
    expect(await scalar('select private.org_role_permission_ready($1) v', [p])).toBe(true);
    expect(await scalar('select exists(select 1 from base_permission_catalog where key=$1) v', [p])).toBe(true);
  }
});
it('unit membership: same unit and descendants in scope, other units and no-membership out', async () => {
  expect(await scalar('select private.base_unit_member($1,$2) v', [mgr, staffIn])).toBe(true);
  expect(await scalar('select private.base_unit_member($1,$2) v', [mgr, mgr])).toBe(true);
  expect(await scalar('select private.base_unit_member($1,$2) v', [mgr, staffOut])).toBe(false);
  expect(await scalar('select private.base_unit_member($1,$2) v', [mgr, noUnit])).toBe(false);
  expect(await scalar('select private.base_unit_member($1,$2) v', [staffIn, staffOut])).toBe(false);
});
it('leave visibility: manager sees unit member requests, denied outside the unit', async () => {
  expect(await scalar('select private.leave_unit_visible($1,$2) v', [mgr, staffIn])).toBe(true);
  expect(await scalar('select private.leave_unit_visible($1,$2) v', [mgr, staffOut])).toBe(false);
  expect(await scalar('select private.leave_unit_visible($1,$2) v', [staffIn, staffOut])).toBe(false);
});
it('finance: manager sees transactions claimed by unit members only', async () => {
  await db.query(`insert into bank_transactions values
    ('aaaaaaaa-0000-0000-0000-000000000001','bank','${staffIn}',null,'claimed',false,null),
    ('aaaaaaaa-0000-0000-0000-000000000002','bank','${staffOut}',null,'claimed',false,null),
    ('aaaaaaaa-0000-0000-0000-000000000003','bank',null,null,'unclaimed',false,null)`);
  expect(await scalar(`select private.fin_can_see($1,'aaaaaaaa-0000-0000-0000-000000000001') v`, [mgr])).toBe(true);
  expect(await scalar(`select private.fin_can_see($1,'aaaaaaaa-0000-0000-0000-000000000002') v`, [mgr])).toBe(false);
  expect(await scalar(`select private.fin_can_see($1,'aaaaaaaa-0000-0000-0000-000000000003') v`, [mgr])).toBe(false);
});
it('order tracking: manager sees orders owned by unit members only', async () => {
  await db.query(`insert into ot_orders values
    ('bbbbbbbb-0000-0000-0000-000000000001','${staffIn}',null,null),
    ('bbbbbbbb-0000-0000-0000-000000000002','${staffOut}',null,null)`);
  expect(await scalar(`select private.ot_can_view($1,'bbbbbbbb-0000-0000-0000-000000000001') v`, [mgr])).toBe(true);
  expect(await scalar(`select private.ot_can_view($1,'bbbbbbbb-0000-0000-0000-000000000002') v`, [mgr])).toBe(false);
});
it('role-designer retired: specialties point to the standard design role, old role archived', async () => {
  const rows = (await db.query<{ id: string; role_id: string }>(`select id, role_id from mkt_specialties where id in ('design','photography')`)).rows;
  expect(rows.every((r) => r.role_id === 'role-standard-design-staff')).toBe(true);
  expect((await db.query<{ catalog_state: string }>(`select catalog_state from app_roles where id='role-designer'`)).rows[0].catalog_state).toBe('archived');
});
it('manager roles gained unit permissions and links were re-signed with a real audit actor', async () => {
  const perms = (await db.query<{ permissions: string[] }>(`select permissions from app_roles where id='role-standard-sales-head'`)).rows[0].permissions;
  expect(perms).toEqual(expect.arrayContaining(['ot.view_unit', 'finance.incoming.view_unit', 'leave.view_unit']));
  const link = (await db.query<{ permission_signature: string }>(`select permission_signature from base_title_role_links where role_id='role-standard-sales-head'`)).rows[0];
  const sig = await scalar(`select md5(coalesce(permissions,'{}'::text[])::text) v from app_roles where id='role-standard-sales-head'`, []);
  expect(link.permission_signature).toBe(sig);
  const ev = (await db.query<{ actor_id: string }>(`select actor_id from base_title_role_events order by created_at desc limit 1`)).rows[0];
  expect(ev.actor_id).toBe(admin);
});
