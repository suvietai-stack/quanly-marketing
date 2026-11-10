import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const employee = '00000000-0000-0000-0000-000000000002';
const scalar = async (sql: string, args: unknown[] = []) => (await db.query<{ v: unknown }>(sql, args)).rows[0]?.v;
const save = (roles: unknown[], expected: unknown[] = []) => db.query('select base_title_roles_save($1,$2,$3,$4,$5)', ['base', 'design', roles, expected, 'Thiết lập theo yêu cầu']);
beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
create table profiles(id uuid primary key); insert into profiles values('${admin}'),('${employee}');
create table app_roles(id text primary key,name text,permissions text[]); insert into app_roles values('designer','Designer',array['order.view']),('role-super-admin','Super Admin',array['settings.role']),('role-admin','Admin',array['settings.role']);
create table user_roles(user_id uuid,role_id text); insert into user_roles values('${employee}','designer');
create table biz_positions(id uuid); create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u='${admin}'::uuid $$;
create function private.base_config() returns jsonb language sql as $$ select '{"titles":[{"id":"design"}]}'::jsonb $$;`);
  await db.exec(readFileSync('drizzle/migrations/0307_base_title_role_scope_drafts.sql', 'utf8'));
  await db.query("select set_config('test.uid',$1,false)", [admin]);
}, 30000);
afterAll(() => db.close());
it('scope covers descendants but not another department or missing target', async () => {
  const c = { units: [{ id: 'm', active: true }, { id: 'd', parent_id: 'm', active: true }, { id: 'x', active: true }] };
  expect(await scalar('select private.base_role_unit_contains($1,$2,$3) v', [c, 'm', 'd'])).toBe(true);
  expect(await scalar('select private.base_role_unit_contains($1,$2,$3) v', [c, 'm', 'x'])).toBe(false);
  expect(await scalar('select private.base_role_unit_contains($1,$2,$3) v', [c, 'm', null])).toBe(false);
});
it('disabled units never broaden scope', async () => expect(await scalar('select private.base_role_unit_contains($1,$2,$3) v', [{ units: [{ id: 'm', active: false }, { id: 'd', parent_id: 'm', active: true }] }, 'm', 'd'])).toBe(false));
it('rejects automatic activation until scope is verified', async () => await expect(save([{ role_id: 'designer', is_primary: true, active: true }])).rejects.toThrow('phạm vi'));
it('rejects Super Admin inheritance', async () => await expect(save([{ role_id: 'role-super-admin', is_primary: true }])).rejects.toThrow('quản trị'));
it('rejects Admin inheritance', async () => await expect(save([{ role_id: 'role-admin', is_primary: true }])).rejects.toThrow('quản trị'));
it('rejects duplicate Role references', async () => await expect(save([{ role_id: 'designer', is_primary: true }, { role_id: 'designer' }])).rejects.toThrow('trùng'));
it('saves only draft references with audit and preserves direct Role', async () => {
  await save([{ role_id: 'designer', is_primary: true, scope_kind: 'unit' }]);
  expect(await scalar('select active v from base_title_role_links')).toBe(false);
  expect(await scalar('select count(*)::int v from user_roles where user_id=$1', [employee])).toBe(1);
  expect(await scalar('select count(*)::int v from base_title_role_events')).toBe(1);
});
it('stale expected snapshot cannot overwrite saved configuration', async () => await expect(save([])).rejects.toThrow('thay đổi'));
it('ordinary user cannot configure own inherited Role', async () => {
  await db.query("select set_config('test.uid',$1,false)", [employee]);
  await expect(save([{ role_id: 'designer', is_primary: true }])).rejects.toThrow('Super Admin');
  await expect(db.query('select base_title_roles_read()')).rejects.toThrow('Super Admin');
});