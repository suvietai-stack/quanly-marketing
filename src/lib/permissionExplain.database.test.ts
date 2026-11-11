import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Giai đoạn 2.5:
// - 0334 account_permission_explain: một nguồn giải thích quyền, effective tính bằng chính has_permission.
// - 0335: 4 quyền ot.* cá nhân được kiểm chứng; liên kết chức vụ Đóng hàng kích hoạt đúng chữ ký.
const db = new PGlite();
const ADMIN = '00000000-0000-0000-0000-0000000000a1';
const VIEWER = '00000000-0000-0000-0000-0000000000a2';
const NOBODY = '00000000-0000-0000-0000-0000000000a3';
const MULTI = '00000000-0000-0000-0000-0000000000b1';
const REPLACE = '00000000-0000-0000-0000-0000000000b2';
const ADDITIVE = '00000000-0000-0000-0000-0000000000b3';
const DENIED = '00000000-0000-0000-0000-0000000000b4';
const VERIFIED_ROLE = '00000000-0000-0000-0000-0000000000b5';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select u is not null $$;
  create function private.is_admin(u uuid) returns boolean language sql as $$ select u = '${ADMIN}'::uuid $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u = '${ADMIN}'::uuid $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean immutable language sql as $$ select false $$;
  create function private.base_tier1(u uuid, p text) returns text language sql as $$ select case when p = 'ot.view_own' and u = '${DENIED}'::uuid then 'DENY' else 'NOT_CONFIGURED' end $$;
  create function private.base_config() returns jsonb language sql as $$ select '{}'::jsonb $$;
  create function private.base_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, description text, permissions text[], is_system boolean, biz_scope text, biz_detail_exception boolean, biz_settings_disabled boolean, signal_scope text[], signal_scope_all boolean);
  create table user_roles(user_id uuid, role_id text, unique(user_id, role_id));
  create table user_permission_overrides(user_id uuid, use_custom boolean, permissions text[], updated_at timestamptz default now());
  create table account_security_logs(actor_id uuid, target_id uuid, action text);
  create table org_titles(id uuid primary key, name text);
  create table base_title_role_links(title_source text, title_id uuid, role_id text, is_primary boolean, scope_kind text, active boolean, reason text, updated_by uuid, enabled_permissions text[], permission_signature text);
  create table base_title_role_events(actor_id uuid, title_source text, title_id uuid, reason text, before_data jsonb, after_data jsonb, created_at timestamptz default now());
  create table base_permission_catalog(key text primary key, label text, module text, dependencies text[]);
  create table auth.users(id uuid primary key, email_confirmed_at timestamptz, encrypted_password text, banned_until timestamptz);
  insert into profiles values
    ('${ADMIN}','Admin','Đang hoạt động'),('${VIEWER}','Xem quyền','Đang hoạt động'),('${NOBODY}','Thường','Đang hoạt động'),
    ('${MULTI}','Hai Role','Đang hoạt động'),('${REPLACE}','Replace','Đang hoạt động'),
    ('${ADDITIVE}','Additive','Đang hoạt động'),('${DENIED}','Bị chặn','Đang hoạt động'),
    ('${VERIFIED_ROLE}','Role quyền đã kiểm chứng','Đang hoạt động'),
    ('513712ca-d679-41aa-9c68-97c3bb6cd9df','Admin Hệ Thống','Đang hoạt động');
  insert into app_roles values
    ('role-video','Video',null,array['video.create','video.approve'],false,'assigned',false,false,'{}',false),
    ('role-content','Content',null,array['web.content_create','web.content_view'],false,'assigned',false,false,'{}',false),
    ('role-viewer','Xem quyền',null,array['settings.user_view'],false,'assigned',false,false,'{}',false);
  insert into user_roles values ('${MULTI}','role-video'),('${MULTI}','role-content'),('${VIEWER}','role-viewer'),('${DENIED}','role-dong-hang-pending');
  insert into org_titles values ('00000000-0000-0000-0000-0000000000d1','Nhân viên Đóng hàng');
  insert into base_permission_catalog(key,label,module) values
    ('video.create','Tạo video','Video'),('video.approve','Duyệt video','Video'),
    ('web.content_create','Tạo bài','Content'),('web.content_view','Xem bài','Content'),
    ('settings.user_view','Xem tài khoản','Cài đặt'),
    ('ot.view_own','Xem đơn của mình','Đơn hàng'),('ot.task_view','Xem việc được giao','Đơn hàng'),
    ('ot.task_update','Cập nhật việc được giao','Đơn hàng'),('ot.stage_update','Cập nhật công đoạn','Đơn hàng');`);
  await db.exec(readFileSync('drizzle/migrations/0330_new_staff_role_default_and_additive_overrides.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0331_override_mode_legacy_default.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0332_packing_staff_role.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0335_ot_packing_verified_permissions.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0351_account_permission_explain_set_based.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0353_unified_permission_resolver_parity.sql', 'utf8'));
  // Dữ liệu quyền riêng sau khi migration 0331 thêm cột mode.
  await db.query(`insert into user_permission_overrides(user_id, use_custom, permissions, mode) values
    ('${REPLACE}', true, array['web.content_view'], 'replace'),
    ('${ADDITIVE}', true, array['web.content_view'], 'additive')`);
  await db.query(`insert into user_roles values ('${REPLACE}','role-video'),('${ADDITIVE}','role-video')`);
  // Role cấp trực tiếp quyền ot.* đã kiểm chứng nhưng KHÔNG có rule nguồn nào:
  // has_permission phải rơi về Role trực tiếp (fallthrough), Debug phải khớp y hệt.
  await db.query(`insert into app_roles values ('role-dong-hang-truc-tiep','ĐH trực tiếp',null,array['ot.task_view','ot.task_update'],false,'assigned',false,false,'{}',false)`);
  await db.query(`insert into user_roles values ('${VERIFIED_ROLE}','role-dong-hang-truc-tiep')`);
}, 30000);
afterAll(() => db.close());

type Explain = {
  is_super_admin: boolean; use_custom: boolean; override_mode: string;
  direct_roles: { role_id: string; name: string; permissions: string[] }[];
  effective: string[];
};
async function explain(caller: string, target: string): Promise<Explain> {
  await db.query("select set_config('test.uid', $1, false)", [caller]);
  const r = await db.query<{ account_permission_explain: Explain }>('select public.account_permission_explain($1)', [target]);
  return r.rows[0].account_permission_explain;
}

it('tài khoản nhiều Role: effective là tổng hợp đã loại trùng từ cả hai Role', async () => {
  const e = await explain(ADMIN, MULTI);
  expect(e.direct_roles.map((r) => r.role_id).sort()).toEqual(['role-content', 'role-video']);
  for (const p of ['video.create', 'video.approve', 'web.content_create', 'web.content_view']) {
    expect(e.effective).toContain(p);
  }
});

it('chế độ replace: quyền riêng thay thế Role, không tự cộng quyền Role', async () => {
  const e = await explain(ADMIN, REPLACE);
  expect(e.override_mode).toBe('replace');
  expect(e.effective).toContain('web.content_view');
  expect(e.effective).not.toContain('video.create');
  expect(e.effective).not.toContain('video.approve');
});

it('chế độ additive: quyền Role và quyền bổ sung được tổng hợp', async () => {
  const e = await explain(ADMIN, ADDITIVE);
  expect(e.override_mode).toBe('additive');
  expect(e.effective).toContain('web.content_view');
  expect(e.effective).toContain('video.create');
  expect(e.effective).toContain('video.approve');
});

it('quyền đã kiểm chứng cấp trực tiếp qua Role (không rule nguồn) vẫn hiệu lực và Debug khớp backend', async () => {
  // has_permission: ot.task_view là quyền đã kiểm chứng, tier1 NOT_CONFIGURED → rơi về Role trực tiếp.
  const hp = (await db.query<{ has_permission: boolean }>("select private.has_permission($1, 'ot.task_view')", [VERIFIED_ROLE])).rows[0];
  expect(hp.has_permission).toBe(true);
  const e = await explain(ADMIN, VERIFIED_ROLE);
  expect(e.effective).toContain('ot.task_view');
  expect(e.effective).toContain('ot.task_update');
});

it('effective khớp tuyệt đối private.has_permission cho mọi quyền ứng viên', async () => {
  for (const target of [MULTI, REPLACE, ADDITIVE, VERIFIED_ROLE, DENIED]) {
    const e = await explain(ADMIN, target);
    const keys = (await db.query<{ key: string }>('select key from base_permission_catalog')).rows.map((r) => r.key);
    for (const k of keys) {
      const hp = (await db.query<{ has_permission: boolean }>('select private.has_permission($1, $2)', [target, k])).rows[0].has_permission;
      expect(e.effective.includes(k), `${target} / ${k}`).toBe(hp);
    }
  }
});

it('người có settings.user_view xem được; tài khoản thường bị chặn', async () => {
  const e = await explain(VIEWER, MULTI);
  expect(e.direct_roles.length).toBe(2);
  await expect(explain(NOBODY, MULTI)).rejects.toThrow(/Không có quyền/);
});

it('4 quyền ot.* cá nhân đã được kiểm chứng (ready)', async () => {
  for (const p of ['ot.view_own', 'ot.task_view', 'ot.task_update', 'ot.stage_update']) {
    const r = (await db.query<{ ready: boolean }>('select private.org_role_permission_ready($1) ready', [p])).rows[0];
    expect(r.ready, p).toBe(true);
  }
  const wide = (await db.query<{ ready: boolean }>("select private.org_role_permission_ready('ot.view_all') ready")).rows[0];
  expect(wide.ready).toBe(false);
});

it('liên kết chức vụ Đóng hàng kích hoạt đúng 4 quyền, chữ ký khớp Role, full-Role vẫn khóa', async () => {
  const l = (await db.query<{ enabled_permissions: string[]; active: boolean; sig_ok: boolean }>(
    `select l.enabled_permissions, l.active,
            l.permission_signature = (select md5(coalesce(a.permissions,'{}')::text) from app_roles a where a.id = l.role_id) sig_ok
     from base_title_role_links l where l.role_id = 'role-dong-hang'`)).rows[0];
  expect(l.enabled_permissions.sort()).toEqual(['ot.stage_update', 'ot.task_update', 'ot.task_view', 'ot.view_own']);
  expect(l.sig_ok).toBe(true);
  expect(l.active).toBe(false);
  const ev = (await db.query('select count(*)::int c from base_title_role_events')).rows[0] as { c: number };
  expect(ev.c).toBeGreaterThan(0);
});

it('DENY từ nguồn cấu hình vẫn thắng quyền ot.* đã kiểm chứng', async () => {
  await db.query(`insert into app_roles values ('role-dong-hang-pending','ĐH pending',null,array['ot.view_own'],false,'assigned',false,false,'{}',false) on conflict do nothing`);
  const r = (await db.query<{ has_permission: boolean }>("select private.has_permission($1, 'ot.view_own')", [DENIED])).rows[0];
  expect(r.has_permission).toBe(false);
  const e = await explain(ADMIN, DENIED);
  expect(e.effective).not.toContain('ot.view_own');
});

it('Super Admin có toàn quyền trong effective', async () => {
  const e = await explain(ADMIN, ADMIN);
  expect(e.is_super_admin).toBe(true);
  expect(e.effective).toContain('video.approve');
  expect(e.effective).toContain('ot.view_own');
});
