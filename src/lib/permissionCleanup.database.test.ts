import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Vá Giai đoạn 3 (migration 0327): 3 trạng thái, bảo vệ KD theo dữ liệu tổ chức,
// vân tay mở rộng, execute chỉ gỡ tài khoản "Sẵn sàng", khôi phục không ghi đè.
const db = new PGlite();
const SA = '00000000-0000-0000-0000-0000000000f1';
const BIZU = '00000000-0000-0000-0000-0000000000e1';
const BIZM = '00000000-0000-0000-0000-0000000000e2'; // kiêm nhiệm: Role ngoài KD + membership KD
const MKT = '00000000-0000-0000-0000-0000000000c1';
const CUSTOM = '00000000-0000-0000-0000-0000000000d1';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select u is not null $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select u = '${SA}'::uuid $$;
  create function private.org_role_permission_ready(p text) returns boolean language sql immutable as $$ select false $$;
  create function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select p = 'video.create' $$;
  create function private.base_tier1(u uuid, p text) returns text language sql as $$ select 'NOT_CONFIGURED' $$;
  create function private.base_config() returns jsonb language sql as $$ select '{}'::jsonb $$;
  create function private.base_rules(u uuid, c jsonb) returns jsonb language sql as $$ select coalesce(nullif(current_setting('test.rules',true),''),'[]')::jsonb $$;
  create function private.org_role_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
  create function private.mkt_specialty_rules(u uuid, c jsonb) returns jsonb language sql as $$ select '[]'::jsonb $$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, permissions text[]);
  create table user_roles(user_id uuid, role_id text, unique(user_id, role_id));
  create table user_permission_overrides(user_id uuid, use_custom boolean, permissions text[]);
  create table biz_appointments(user_id uuid, status text, ended_at timestamptz);
  create table biz_department_members(user_id uuid, ended_at timestamptz);
  create table biz_management_assignments(user_id uuid, ended_at timestamptz);
  create table biz_member_affiliations(user_id uuid, ended_at timestamptz);
  create table org_units(id text primary key, name text);
  create table org_titles(id text primary key, name text);
  create table org_assignments(id uuid default gen_random_uuid(), user_id uuid, unit_id text, title_id text, category text, starts_at timestamptz, ends_at timestamptz, status text);
  create table base_title_role_links(id uuid default gen_random_uuid(), title_id uuid, role_id text, active boolean, enabled_permissions text[]);
  create table mkt_staff_specialties(user_id uuid, specialty_id uuid, state text);
  create table leave_requests(status text, owner_id uuid, approver_id uuid);
  create table k3_tasks(user_id uuid, status text);
  create table fr_requests(requester_id uuid, status text);
  insert into profiles values
    ('${SA}','Admin','Đang hoạt động'),('${BIZU}','Kinh Doanh','Đang hoạt động'),
    ('${BIZM}','Kiêm Nhiệm','Đang hoạt động'),
    ('${MKT}','Marketing','Đang hoạt động'),('${CUSTOM}','Tùy Chỉnh','Đang hoạt động');
  insert into app_roles values
    ('role-super-admin','Super Admin',array['settings.role']),
    ('role-biz','Kinh doanh',array['biz.plan_view','k3.view']),
    ('role-video','Video',array['video.create','video.approve']);
  insert into user_roles values ('${SA}','role-super-admin'),('${BIZU}','role-biz'),('${BIZM}','role-video'),('${MKT}','role-video'),('${CUSTOM}','role-video');
  insert into biz_appointments values ('${BIZU}','active',null);
  insert into biz_department_members values ('${BIZM}',null);
  insert into user_permission_overrides values ('${CUSTOM}',true,array['video.create']);`);
  for (const f of ['0324_permission_cleanup_preview_execute', '0325_permission_cleanup_preview_variable_shadowing', '0326_permission_cleanup_preview_set_based', '0327_permission_cleanup_hardening', '0328_permission_cleanup_eval_reasons_array_fix', '0329_permission_cleanup_preview_concat_fix']) {
    await db.exec(readFileSync(`drizzle/migrations/${f}.sql`, 'utf8'));
  }
}, 30000);
afterAll(() => db.close());

async function asSuper<T>(fn: () => Promise<T>): Promise<T> {
  await db.query("select set_config('test.uid', $1, false)", [SA]);
  return fn();
}
type Account = { user_id: string; status: string; group: string; removable: string[]; lost: string[]; reasons: string[]; pending_work: number };
type Preview = { fingerprint: string; accounts: Account[]; totals: Record<string, number> };
async function preview(): Promise<Preview> {
  return asSuper(async () => (await db.query<{ p: Preview }>('select public.base_perm_cleanup_preview() p')).rows[0].p);
}
async function execute(users: string[], fp: string) {
  return asSuper(async () => (await db.query<{ r: { removed: { role_id: string }[]; skipped: { reason: string }[] } }>(
    'select public.base_perm_cleanup_execute($1::uuid[], $2) r', [users, fp])).rows[0].r);
}
// Đưa MKT về trạng thái sẵn sàng: nguồn ALLOW đã kiểm chứng cho cả hai quyền + nhiệm vụ Marketing hiệu lực.
async function makeMktReady() {
  await db.query("select set_config('test.rules', '[{\"permission\":\"video.create\",\"effect\":\"ALLOW\"},{\"permission\":\"video.approve\",\"effect\":\"ALLOW\"}]', false)");
  await db.query("create or replace function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select p in ('video.create','video.approve') $$");
  await db.query("insert into mkt_staff_specialties values ($1, gen_random_uuid(), 'active')", [MKT]);
}
async function resetMkt() {
  await db.query("select set_config('test.rules', '', false)");
  await db.query("create or replace function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$ select p = 'video.create' $$");
  await db.query('delete from mkt_staff_specialties where user_id = $1', [MKT]);
  await db.query('delete from leave_requests');
  await db.query('delete from k3_tasks');
}

it('ba trạng thái: Super Admin và toàn bộ nhân sự Kinh doanh được bảo vệ, tùy chỉnh và thiếu thay thế là Cần xử lý', async () => {
  const p = await preview();
  const byId = Object.fromEntries(p.accounts.map(a => [a.user_id, a]));
  expect(byId[SA].status).toBe('protected');
  expect(byId[BIZU].status).toBe('protected');
  expect(byId[BIZU].group).toBe('B');
  // Kiêm nhiệm: Role ngoài KD nhưng có membership KD => bảo vệ toàn bộ
  expect(byId[BIZM].status).toBe('protected');
  expect(byId[BIZM].group).toBe('D');
  expect(byId[CUSTOM].status).toBe('review');
  expect(byId[CUSTOM].reasons.join(' ')).toMatch(/quyền tùy chỉnh/);
  expect(byId[MKT].status).toBe('review');
  expect(byId[MKT].lost).toEqual(['video.approve', 'video.create']);
  expect(byId[MKT].reasons.join(' ')).toMatch(/Chưa được bổ nhiệm/);
  expect(p.totals.ready).toBe(0);
});

it('đủ nguồn thay thế đã kiểm chứng + nhiệm vụ hiệu lực => Sẵn sàng', async () => {
  await makeMktReady();
  const p = await preview();
  const mkt = p.accounts.find(a => a.user_id === MKT)!;
  expect(mkt.status).toBe('ready');
  expect(mkt.lost).toEqual([]);
  await resetMkt();
});

it('công việc đang chờ chặn trạng thái Sẵn sàng', async () => {
  await makeMktReady();
  await db.query("insert into leave_requests values ('pending', $1, null)", [MKT]);
  await db.query("insert into k3_tasks values ($1, 'doing')", [MKT]);
  const p = await preview();
  const mkt = p.accounts.find(a => a.user_id === MKT)!;
  expect(mkt.status).toBe('review');
  expect(mkt.pending_work).toBe(2);
  expect(mkt.reasons.join(' ')).toMatch(/công việc đang chờ/);
  await resetMkt();
});

it('execute từ chối tài khoản Cần xử lý/Được bảo vệ và hủy khi không có tài khoản Sẵn sàng', async () => {
  const p = await preview();
  await asSuper(async () => {
    await expect(db.query('select public.base_perm_cleanup_execute($1::uuid[], $2)', [[SA, BIZU, BIZM, MKT, CUSTOM], p.fingerprint]))
      .rejects.toThrow(/Không có tài khoản nào đủ điều kiện/);
  });
  // Không dòng nào bị xóa
  expect((await db.query('select count(*)::int c from user_roles')).rows[0].c).toBe(5);
});

it('execute chỉ gỡ tài khoản Sẵn sàng và lưu bản sao khôi phục', async () => {
  await makeMktReady();
  const p = await preview();
  const r = await execute([MKT, CUSTOM], p.fingerprint);
  expect(r.removed.map(x => x.role_id)).toEqual(['role-video']);
  expect(r.skipped).toHaveLength(1);
  expect(r.skipped[0].reason).toMatch(/quyền tùy chỉnh/);
  const remaining = await db.query('select user_id, role_id from user_roles order by user_id');
  expect(remaining.rows).toEqual([
    { user_id: CUSTOM, role_id: 'role-video' },
    { user_id: BIZU, role_id: 'role-biz' },
    { user_id: BIZM, role_id: 'role-video' },
    { user_id: SA, role_id: 'role-super-admin' },
  ]);
  expect((await db.query<{ removed: unknown[] }>('select removed from base_perm_cleanup_runs')).rows[0].removed).toHaveLength(1);
});

it('vân tay phát hiện thay đổi permission của Role, bổ nhiệm, nhiệm vụ Marketing và trạng thái tài khoản', async () => {
  const fp = (await preview()).fingerprint;
  const expectStale = async () => {
    await asSuper(async () => {
      await expect(db.query('select public.base_perm_cleanup_execute($1::uuid[], $2)', [[MKT], fp])).rejects.toThrow(/xem trước lại/);
    });
  };
  await db.query("update app_roles set permissions = array_append(permissions, 'video.delete') where id = 'role-video'");
  await expectStale();
  await db.query("update app_roles set permissions = array['video.create','video.approve'] where id = 'role-video'");
  await db.query("insert into org_assignments(user_id, status, starts_at) values ($1, 'active', now())", [MKT]);
  await expectStale();
  await db.query('delete from org_assignments where user_id = $1', [MKT]);
  await db.query("insert into mkt_staff_specialties values ($1, gen_random_uuid(), 'active')", [MKT]);
  await expectStale();
  await db.query('delete from mkt_staff_specialties where user_id = $1', [MKT]);
  await db.query("update profiles set status = 'Tạm khóa' where id = $1", [CUSTOM]);
  await expectStale();
  await db.query("update profiles set status = 'Đang hoạt động' where id = $1", [CUSTOM]);
  // Sau khi hoàn tác mọi thay đổi, vân tay trở lại như cũ
  expect((await preview()).fingerprint).toBe(fp);
});

it('khôi phục trả lại Role đã gỡ, không ghi đè quyền mới phát sinh và báo xung đột', async () => {
  const run = (await db.query<{ id: string }>('select id from base_perm_cleanup_runs limit 1')).rows[0];
  // Quyền mới phát sinh sau reset
  await db.query('insert into user_roles values ($1, $2)', [MKT, 'role-biz']);
  const r = await asSuper(async () => (await db.query<{ r: { restored_rows: number; conflicts: { role_id: string }[] } }>(
    'select public.base_perm_cleanup_restore($1) r', [run.id])).rows[0].r);
  expect(r.restored_rows).toBe(1);
  expect(r.conflicts.map(c => c.role_id)).toEqual(['role-biz']);
  const rows = await db.query('select role_id from user_roles where user_id = $1 order by role_id', [MKT]);
  expect(rows.rows).toEqual([{ role_id: 'role-biz' }, { role_id: 'role-video' }]);
  await asSuper(async () => {
    await expect(db.query('select public.base_perm_cleanup_restore($1)', [run.id])).rejects.toThrow(/đã được khôi phục/);
  });
  await db.query('delete from user_roles where user_id = $1', [MKT]);
});

it('người không phải Super Admin không xem trước, thực thi hay khôi phục được', async () => {
  await db.query("select set_config('test.uid', $1, false)", [MKT]);
  await expect(db.query('select public.base_perm_cleanup_preview()')).rejects.toThrow(/Super Admin/);
  await expect(db.query('select public.base_perm_cleanup_execute($1::uuid[], $2)', [[MKT], 'x'])).rejects.toThrow(/Super Admin/);
  await expect(db.query('select public.base_perm_cleanup_restore($1)', ['00000000-0000-0000-0000-000000000000'])).rejects.toThrow(/Super Admin/);
});
