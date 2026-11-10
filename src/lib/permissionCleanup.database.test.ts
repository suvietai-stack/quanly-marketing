import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Giai đoạn 3: kiểm kê/xem trước/thực thi/khôi phục làm sạch Role trực tiếp cũ (migration 0324).
const db = new PGlite();
const SA = '00000000-0000-0000-0000-0000000000f1';
const BIZU = '00000000-0000-0000-0000-0000000000e1';
const MKT = '00000000-0000-0000-0000-0000000000c1';
const CUSTOM = '00000000-0000-0000-0000-0000000000d1';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select u is not null $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u = '${SA}'::uuid $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select p = 'video.create' $$;
  create function private.base_tier1(u uuid, p text) returns text language sql as $$ select case when p = any(string_to_array(current_setting('test.allow',true),',')) then 'ALLOW' else 'NOT_CONFIGURED' end $$;
  create function private.base_config() returns jsonb language sql as $$ select '{}'::jsonb $$;
  create function private.org_role_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
  create function private.mkt_specialty_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, permissions text[]);
  create table user_roles(user_id uuid, role_id text, unique(user_id, role_id));
  create table user_permission_overrides(user_id uuid, use_custom boolean, permissions text[]);
  create table biz_appointments(user_id uuid, status text, ended_at timestamptz);
  create table org_units(id text primary key, name text);
  create table org_titles(id text primary key, name text);
  create table org_assignments(user_id uuid, unit_id text, title_id text, category text, starts_at timestamptz, ends_at timestamptz, status text);
  create function private.has_permission(_user_id uuid, _permission text) returns boolean language sql security definer set search_path = public as $$
    select private.is_active(_user_id) and (private.is_super_admin(_user_id) or case
      when private.base_tier1(_user_id, _permission) = 'DENY' then false
      when private.base_tier1(_user_id, _permission) = 'ALLOW' then true
      when exists(select 1 from user_permission_overrides where user_id = _user_id and use_custom = true) then exists(select 1 from user_permission_overrides where user_id = _user_id and _permission = any(permissions))
      else exists(select 1 from user_roles ur join app_roles r on r.id = ur.role_id where ur.user_id = _user_id and _permission = any(r.permissions)) end) $$;
  insert into profiles values
    ('${SA}','Admin','Đang hoạt động'),('${BIZU}','Kinh Doanh','Đang hoạt động'),
    ('${MKT}','Marketing','Đang hoạt động'),('${CUSTOM}','Tùy Chỉnh','Đang hoạt động');
  insert into app_roles values
    ('role-super-admin','Super Admin',array['settings.role']),
    ('role-biz','Kinh doanh',array['biz.plan_view','k3.view']),
    ('role-video','Video',array['video.create','video.approve']);
  insert into user_roles values ('${SA}','role-super-admin'),('${BIZU}','role-biz'),('${MKT}','role-video'),('${CUSTOM}','role-video');
  insert into biz_appointments values ('${BIZU}','active',null);
  insert into user_permission_overrides values ('${CUSTOM}',true,array['video.create']);`);
  await db.exec(readFileSync('drizzle/migrations/0324_permission_cleanup_preview_execute.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0325_permission_cleanup_preview_variable_shadowing.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());

async function asSuper<T>(fn: () => Promise<T>): Promise<T> {
  await db.query("select set_config('test.uid', $1, false)", [SA]);
  return fn();
}
type Preview = { fingerprint: string; accounts: { user_id: string; status: string; group: string; removable: string[]; lost: string[] }[]; totals: Record<string, number> };
async function preview(): Promise<Preview> {
  return asSuper(async () => (await db.query<{ p: Preview }>('select public.base_perm_cleanup_preview() p')).rows[0].p);
}

it('phân nhóm đúng: Super Admin bảo vệ, Kinh doanh bảo vệ, tùy chỉnh cần xác nhận, Marketing sẵn sàng gỡ', async () => {
  const p = await preview();
  const byId = Object.fromEntries(p.accounts.map(a => [a.user_id, a]));
  expect(byId[SA].status).toBe('protected_super');
  expect(byId[BIZU].status).toBe('protected');
  expect(byId[BIZU].group).toBe('B');
  expect(byId[CUSTOM].status).toBe('needs_confirm');
  expect(byId[MKT].status).toBe('review');
  expect(byId[MKT].removable).toEqual(['role-video']);
  expect(byId[MKT].lost).toEqual(['video.approve', 'video.create']);
});

it('quyền được nguồn mới thay thế thì không tính là mất', async () => {
  await db.query("select set_config('test.allow', 'video.create', false)");
  const p = await preview();
  const mkt = p.accounts.find(a => a.user_id === MKT)!;
  expect(mkt.lost).toEqual(['video.approve']);
  await db.query("select set_config('test.allow', 'video.create,video.approve', false)");
  const p2 = await preview();
  // video.approve chưa được kiểm chứng: nguồn tự động không thay thế được => vẫn tính là mất, cần xem lại.
  expect(p2.accounts.find(a => a.user_id === MKT)!.lost).toEqual(['video.approve']);
  expect(p2.accounts.find(a => a.user_id === MKT)!.status).toBe('review');
  await db.query("select set_config('test.allow', '', false)");
});

it('thực thi chỉ gỡ Role không được bảo vệ và lưu bản sao khôi phục', async () => {
  const p = await preview();
  const result = await asSuper(async () => (await db.query<{ r: { removed: { role_id: string }[]; skipped: unknown[] } }>(
    'select public.base_perm_cleanup_execute($1::uuid[], $2) r', [[SA, BIZU, MKT, CUSTOM], p.fingerprint])).rows[0].r);
  expect(result.removed.map(r => r.role_id)).toEqual(['role-video']);
  expect(result.skipped).toHaveLength(3);
  const remaining = await db.query('select user_id, role_id from user_roles order by user_id');
  expect(remaining.rows).toEqual([
    { user_id: CUSTOM, role_id: 'role-video' },
    { user_id: BIZU, role_id: 'role-biz' },
    { user_id: SA, role_id: 'role-super-admin' },
  ]);
  const runs = await db.query<{ removed: unknown[] }>('select removed from base_perm_cleanup_runs');
  expect(runs.rows[0].removed).toHaveLength(1);
});

it('vân tay thay đổi thì bắt buộc xem trước lại', async () => {
  const p = await preview();
  await db.query('insert into user_roles values ($1, $2)', [MKT, 'role-video']);
  await asSuper(async () => {
    await expect(db.query('select public.base_perm_cleanup_execute($1::uuid[], $2)', [[MKT], p.fingerprint])).rejects.toThrow(/xem trước lại/);
  });
  await db.query('delete from user_roles where user_id = $1', [MKT]);
});

it('khôi phục trả lại đúng các Role đã gỡ và không chạy lại được', async () => {
  const run = (await db.query<{ id: string }>('select id from base_perm_cleanup_runs limit 1')).rows[0];
  await asSuper(async () => {
    await db.query('select public.base_perm_cleanup_restore($1)', [run.id]);
    await expect(db.query('select public.base_perm_cleanup_restore($1)', [run.id])).rejects.toThrow(/đã được khôi phục/);
  });
  const rows = await db.query('select role_id from user_roles where user_id = $1', [MKT]);
  expect(rows.rows).toEqual([{ role_id: 'role-video' }]);
});

it('người không phải Super Admin không xem trước, thực thi hay khôi phục được', async () => {
  await db.query("select set_config('test.uid', $1, false)", [MKT]);
  await expect(db.query('select public.base_perm_cleanup_preview()')).rejects.toThrow(/Super Admin/);
  await expect(db.query('select public.base_perm_cleanup_execute($1::uuid[], $2)', [[MKT], 'x'])).rejects.toThrow(/Super Admin/);
  await expect(db.query('select public.base_perm_cleanup_restore($1)', ['00000000-0000-0000-0000-000000000000'])).rejects.toThrow(/Super Admin/);
});

it('chạy lại sau khi đã gỡ không xóa thêm gì', async () => {
  await db.query('delete from user_roles where user_id = $1', [MKT]);
  const p = await preview();
  const result = await asSuper(async () => (await db.query<{ r: { removed: unknown[]; skipped: unknown[] } }>(
    'select public.base_perm_cleanup_execute($1::uuid[], $2) r', [[MKT], p.fingerprint])).rows[0].r);
  expect(result.removed).toHaveLength(0);
  expect(result.skipped).toHaveLength(1);
});
