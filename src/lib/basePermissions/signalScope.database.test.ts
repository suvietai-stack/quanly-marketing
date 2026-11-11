import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// 0357: signal group scope is honored from the role linked to the user's active appointment,
// and the legacy "no roles → allow all" fallback only applies when no linked appointment exists.
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const sales = '00000000-0000-0000-0000-000000000002';
const legacyUser = '00000000-0000-0000-0000-000000000003';
const exec = '00000000-0000-0000-0000-000000000004';
const ended = '00000000-0000-0000-0000-000000000005';
const scalar = async (sql: string, args: unknown[] = []) => (await db.query<{ v: unknown }>(sql, args)).rows[0]?.v;
const scope = (u: string, groups: string[]) => scalar('select private.sig_scope_ok($1,$2) v', [u, groups]);

beforeAll(async () => {
  await db.exec(`create schema private; create role anon; create role authenticated; create role service_role;
create table profiles(id uuid primary key);
create table app_roles(id text primary key, name text, description text, is_system boolean, permissions text[], signal_scope_all boolean, signal_scope text[], catalog_state text, catalog_group text);
create table user_roles(user_id uuid, role_id text);
create table org_assignments(id text, unit_id text, title_id text, user_id uuid, category text, starts_at timestamptz, ends_at timestamptz, status text, source text, source_id text, data jsonb, revision bigint);
create table base_title_role_links(id uuid, title_source text, title_id text, role_id text, is_primary boolean, scope_kind text, active boolean, revision bigint, reason text, updated_by uuid, updated_at timestamptz, enabled_permissions text[], permission_signature text);
create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u = '${admin}'::uuid $$;
create function private.is_admin(u uuid) returns boolean language sql as $$ select u = '${admin}'::uuid $$;
insert into profiles values ('${admin}'),('${sales}'),('${legacyUser}'),('${exec}'),('${ended}');`);
  await db.exec(readFileSync('drizzle/migrations/0357_sales_head_role_scope_fallback_tighten.sql', 'utf8'));
  // Executive viewer role (from 0355 links) and the signed title links under test.
  await db.query(`insert into app_roles values
    ('role-viewer','Viewer / Ban Giám Đốc','x',false,array['signal.view_all'],true,'{}','standard','Quản trị & Điều hành')`);
  await db.query(`insert into base_title_role_links values
    ('11111111-1111-1111-1111-111111111111','biz','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','role-standard-sales-staff',true,'own',false,1,'test',null,now(),'{}',md5((select permissions::text from app_roles where id='role-standard-sales-staff'))),
    ('22222222-2222-2222-2222-222222222222','biz','60dc2983-c41c-42dc-bcf6-14010beaa3dd','role-viewer',true,'own',false,1,'test',null,now(),'{}',md5((select permissions::text from app_roles where id='role-viewer')))`);
  // Sales staff: active appointment → role-standard-sales-staff (scope: 6 groups, not all).
  await db.query(`insert into org_assignments values
    ('a1','u1','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','${sales}','appointment',now(),null,'active','biz_appointments','x','{}',1),
    ('a2','u1','60dc2983-c41c-42dc-bcf6-14010beaa3dd','${exec}','appointment',now(),null,'active','biz_appointments','x','{}',1),
    ('a3','u1','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','${ended}','appointment',now() - interval '10 days',now() - interval '1 day','active','biz_appointments','x','{}',1)`);
}, 30000);
afterAll(() => db.close());

it('appointment-linked role scopes groups: in-scope allowed, out-of-scope denied', async () => {
  expect(await scope(sales, ['Sứ quà tặng'])).toBe(true);
  expect(await scope(sales, ['Nhóm Không Tồn Tại'])).toBe(false);
});
it('Khác subgroup matches the Khác scope entry', async () => {
  expect(await scope(sales, ['Khác:Nguồn lạ'])).toBe(true);
});
it('executive role with signal_scope_all sees every group via appointment', async () => {
  expect(await scope(exec, ['Bất kỳ nhóm nào'])).toBe(true);
});
it('legacy fallback only applies without roles and without linked appointments', async () => {
  expect(await scope(legacyUser, ['Nhóm Không Tồn Tại'])).toBe(true);
});
it('ended appointment falls back to legacy behavior', async () => {
  expect(await scope(ended, ['Nhóm Không Tồn Tại'])).toBe(true);
});
it('a broken link signature never honors appointment scope', async () => {
  await db.query(`update base_title_role_links set permission_signature='sai' where title_id='e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0'`);
  expect(await scope(sales, ['Sứ quà tặng'])).toBe(false);
});
