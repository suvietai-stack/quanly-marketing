import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Migration 0330: Role nền "Nhân sự mới" mặc định khi duyệt tài khoản + quyền bổ sung cộng thêm song song.
const db = new PGlite();
const ADMIN = '00000000-0000-0000-0000-0000000000a1';
const NEW = '00000000-0000-0000-0000-0000000000b1';
const NEW2 = '00000000-0000-0000-0000-0000000000b2';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select u is not null $$;
  create function private.is_admin(u uuid) returns boolean language sql as $$ select u = '${ADMIN}'::uuid $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select false $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.base_tier1(u uuid, p text) returns text language sql as $$ select case when p = 'video.approve' then 'DENY' else 'NOT_CONFIGURED' end $$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, description text, permissions text[], is_system boolean, biz_scope text, biz_detail_exception boolean, biz_settings_disabled boolean, signal_scope text[], signal_scope_all boolean);
  create table user_roles(user_id uuid, role_id text, unique(user_id, role_id));
  create table user_permission_overrides(user_id uuid, use_custom boolean, permissions text[]);
  create table account_security_logs(actor_id uuid, target_id uuid, action text);
  create table auth.users(id uuid primary key, email_confirmed_at timestamptz, encrypted_password text, banned_until timestamptz);
  insert into profiles values ('${ADMIN}','Admin','Đang hoạt động'),('${NEW}','Mới 1','Chờ duyệt'),('${NEW2}','Mới 2','Chờ duyệt');
  insert into app_roles values ('role-video','Video',null,array['video.create','video.approve'],false,'assigned',false,false,'{}',false);
  insert into auth.users values ('${NEW}',now(),'x',null),('${NEW2}',now(),'x',null);`);
  await db.exec(readFileSync('drizzle/migrations/0330_new_staff_role_default_and_additive_overrides.sql', 'utf8'));
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

it('quyền bổ sung cá nhân cộng thêm song song, không thay thế quyền Role', async () => {
  await db.query('insert into user_roles values ($1, $2)', [NEW2, 'role-nhan-su-moi']);
  await db.query('insert into user_permission_overrides values ($1, true, $2)', [NEW2, ['task.view_all']]);
  const has = async (p: string) => (await db.query<{ h: boolean }>('select private.has_permission($1, $2) h', [NEW2, p])).rows[0].h;
  // Quyền từ Role vẫn còn
  expect(await has('video.create')).toBe(true);
  expect(await has('task.view_mine')).toBe(true);
  // Quyền bổ sung được cộng thêm
  expect(await has('task.view_all')).toBe(true);
  // Quyền không thuộc nguồn nào vẫn bị từ chối
  expect(await has('settings.role')).toBe(false);
});
