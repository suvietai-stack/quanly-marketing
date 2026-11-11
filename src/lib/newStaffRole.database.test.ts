import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Migration 0330: Role nền "Nhân sự mới" mặc định khi duyệt tài khoản.
// Migration 0331: quyền riêng cá nhân có chế độ 'replace' (legacy, mặc định) / 'additive' (sau xác nhận Admin).
// Migration 0332: Role tối thiểu "Nhân viên Đóng hàng".
const db = new PGlite();
const ADMIN = '00000000-0000-0000-0000-0000000000a1';
const NEW = '00000000-0000-0000-0000-0000000000b1';
const NEW2 = '00000000-0000-0000-0000-0000000000b2';
const OLD = '00000000-0000-0000-0000-0000000000c1';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select u is not null $$;
  create function private.is_admin(u uuid) returns boolean language sql as $$ select u = '${ADMIN}'::uuid $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u = '${ADMIN}'::uuid $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.base_tier1(u uuid, p text) returns text language sql as $$ select case when p = 'video.approve' then 'DENY' else 'NOT_CONFIGURED' end $$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, description text, permissions text[], is_system boolean, biz_scope text, biz_detail_exception boolean, biz_settings_disabled boolean, signal_scope text[], signal_scope_all boolean);
  create table user_roles(user_id uuid, role_id text, unique(user_id, role_id));
  create table user_permission_overrides(user_id uuid, use_custom boolean, permissions text[]);
  create table account_security_logs(actor_id uuid, target_id uuid, action text);
  create table org_titles(id uuid primary key, name text);
  create table base_title_role_links(title_source text, title_id uuid, role_id text, is_primary boolean, scope_kind text, active boolean, reason text, updated_by uuid, enabled_permissions text[], permission_signature text);
  create table auth.users(id uuid primary key, email_confirmed_at timestamptz, encrypted_password text, banned_until timestamptz);
  insert into profiles values ('${ADMIN}','Admin','Đang hoạt động'),('${NEW}','Mới 1','Chờ duyệt'),('${NEW2}','Mới 2','Chờ duyệt'),('${OLD}','Cũ','Đang hoạt động'),('513712ca-d679-41aa-9c68-97c3bb6cd9df','Admin Hệ Thống','Đang hoạt động');
  insert into app_roles values ('role-video','Video',null,array['video.create','video.approve'],false,'assigned',false,false,'{}',false);
  insert into org_titles values ('00000000-0000-0000-0000-0000000000t1','Nhân viên Đóng hàng');
  insert into auth.users values ('${NEW}',now(),'x',null),('${NEW2}',now(),'x',null);`);
  await db.exec(readFileSync('drizzle/migrations/0330_new_staff_role_default_and_additive_overrides.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0331_override_mode_legacy_default.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0332_packing_staff_role.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());

it('Role nền "Nhân sự mới" tồn tại với chỉ quyền cơ bản', async () => {
  const r = (await db.query<{ permissions: string[] }>("select permissions from app_roles where id = 'role-nhan-su-moi'")).rows[0];
  expect(r.permissions).toEqual(['task.view_mine', 'task.view_created_by_me', 'task.accept', 'task.update_status', 'task.complete', 'task.add_note']);
});

it('duyệt tài khoản không chỉ định Role => mặc định gán "Nhân sự mới"', async () => {
  await db.query("select set_config('test.uid', $1, false)", [ADMIN]);
  await db.query('select public.account_approve($1)', [NEW]);
  const roles = await db.query('select role_id from user_roles where user_id = $1', [NEW]);
  expect(roles.rows).toEqual([{ role_id: 'role-nhan-su-moi' }]);
  expect((await db.query<{ status: string }>('select status from profiles where id = $1', [NEW])).rows[0].status).toBe('Đang hoạt động');
});

it('duyệt tài khoản có chỉ định Role => gán đúng Role đó', async () => {
  await db.query("select set_config('test.uid', $1, false)", [ADMIN]);
  await db.query('select public.account_approve($1, $2)', [NEW2, 'role-video']);
  const roles = await db.query('select role_id from user_roles where user_id = $1', [NEW2]);
  expect(roles.rows).toEqual([{ role_id: 'role-video' }]);
});

it('tài khoản có quyền riêng từ trước: chế độ mặc định "thay thế" — KHÔNG tự nhận thêm quyền từ Role', async () => {
  // Mô phỏng tài khoản legacy: có Role Video nhưng quyền riêng đang ghi đè (hành vi trước 0330).
  await db.query('insert into user_roles values ($1, $2)', [OLD, 'role-video']);
  await db.query('insert into user_permission_overrides values ($1, true, $2)', [OLD, ['task.view_all']]);
  const has = async (p: string) => (await db.query<{ h: boolean }>('select private.has_permission($1, $2) h', [OLD, p])).rows[0].h;
  // Quyền riêng vẫn có
  expect(await has('task.view_all')).toBe(true);
  // Quyền Role KHÔNG được tự cộng thêm — đúng hành vi trước migration 0330
  expect(await has('video.create')).toBe(false);
  expect(await has('settings.role')).toBe(false);
  const mode = (await db.query<{ mode: string }>('select mode from user_permission_overrides where user_id = $1', [OLD])).rows[0].mode;
  expect(mode).toBe('replace');
});

it('chuyển chế độ sang "cộng thêm" qua RPC: quyền Role được cộng, có nhật ký và diff', async () => {
  await db.query("select set_config('test.uid', $1, false)", [ADMIN]);
  const res = (await db.query<{ account_override_mode_set: { ok: boolean; changed: boolean; added: string[] } }>('select public.account_override_mode_set($1, $2)', [OLD, 'additive'])).rows[0].account_override_mode_set;
  expect(res.ok).toBe(true);
  expect(res.changed).toBe(true);
  expect(res.added).toContain('video.create');
  const has = async (p: string) => (await db.query<{ h: boolean }>('select private.has_permission($1, $2) h', [OLD, p])).rows[0].h;
  // Sau xác nhận: quyền Role + quyền bổ sung cùng có
  expect(await has('video.create')).toBe(true);
  expect(await has('task.view_all')).toBe(true);
  const log = await db.query('select action from account_security_logs where target_id = $1', [OLD]);
  expect(log.rows.map(r => r.action)).toContain('override_mode_set:additive');
});

it('chuyển lại "thay thế" thu hồi đúng phần quyền đã cộng thêm (khả năng phục hồi)', async () => {
  await db.query("select set_config('test.uid', $1, false)", [ADMIN]);
  const res = (await db.query<{ account_override_mode_set: { ok: boolean; removed: string[] } }>('select public.account_override_mode_set($1, $2)', [OLD, 'replace'])).rows[0].account_override_mode_set;
  expect(res.ok).toBe(true);
  expect(res.removed).toContain('video.create');
  const has = async (p: string) => (await db.query<{ h: boolean }>('select private.has_permission($1, $2) h', [OLD, p])).rows[0].h;
  expect(await has('video.create')).toBe(false);
  expect(await has('task.view_all')).toBe(true);
});

it('người không có quyền quản trị không thể tự chuyển chế độ quyền riêng', async () => {
  await db.query("select set_config('test.uid', $1, false)", [OLD]);
  await expect(db.query('select public.account_override_mode_set($1, $2)', [OLD, 'additive'])).rejects.toThrow();
});

it('Role "Nhân viên Đóng hàng" chỉ có quyền nghiệp vụ Đóng hàng tối thiểu', async () => {
  const r = (await db.query<{ permissions: string[] }>("select permissions from app_roles where id = 'role-dong-hang'")).rows[0];
  expect(r.permissions).toEqual(['ot.view_own', 'ot.task_view', 'ot.task_update', 'ot.stage_update']);
  // Không có quyền Mua hàng, Kế toán hay Admin
  expect(r.permissions.some(p => p.startsWith('settings.') || p.startsWith('fr.') || p.startsWith('finance.'))).toBe(false);
});

it('liên kết chức vụ Đóng hàng — Role tồn tại nhưng chưa kích hoạt, chưa cấp quyền tự động', async () => {
  const l = (await db.query<{ active: boolean; enabled_permissions: string[] }>("select active, enabled_permissions from base_title_role_links where role_id = 'role-dong-hang'")).rows[0];
  expect(l.active).toBe(false);
  expect(l.enabled_permissions).toEqual([]);
});
