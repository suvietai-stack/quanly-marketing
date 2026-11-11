import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Hợp đồng Kinh doanh chuẩn (0354): tài khoản đã reset legacy chỉ nhận quyền Kinh doanh
// từ bổ nhiệm chuẩn tạo SAU reset; bổ nhiệm legacy giữ làm lịch sử; miễn nhiệm thu hồi đúng nguồn.
const db = new PGlite();
const SA = '00000000-0000-0000-0000-000000000001';
const RESET = '00000000-0000-0000-0000-000000000002';
const FRESH = '00000000-0000-0000-0000-000000000003';
const TARGET = '00000000-0000-0000-0000-000000000004';
const D1 = '00000000-0000-0000-0000-0000000000d1';
const D2 = '00000000-0000-0000-0000-0000000000d2';
const RESET_AT = '2026-01-01T00:00:00Z';

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
  create table profiles(id uuid primary key, full_name text, status text);
  create table app_roles(id text primary key, name text, permissions text[], catalog_state text default 'standard');
  create table user_roles(user_id uuid, role_id text, source_kind text default 'legacy', created_at timestamptz default now());
  create table user_permission_overrides(user_id uuid primary key, use_custom boolean, permissions text[], mode text, source_kind text default 'legacy', updated_at timestamptz default now());
  create table biz_appointments(id uuid primary key default gen_random_uuid(), user_id uuid, status text default 'active', scope_kind text default 'individual', system_id uuid, department_id uuid, team_id uuid, started_at timestamptz, ended_at timestamptz, position_snapshot jsonb default '{}');
  create table biz_department_members(user_id uuid, department_id uuid, started_at timestamptz, ended_at timestamptz);
  create table biz_management_assignments(user_id uuid, position text, system_id uuid, department_id uuid, team_id uuid, started_at timestamptz, ended_at timestamptz);
  create table biz_team_members(user_id uuid, team_id uuid, started_at timestamptz, ended_at timestamptz);
  create table biz_member_affiliations(user_id uuid, team_id uuid, started_at timestamptz, ended_at timestamptz);
  create table biz_teams(id uuid primary key, department_id uuid);
  create table biz_department_system_history(department_id uuid, system_id uuid, started_at timestamptz, ended_at timestamptz);
  create table biz_access_exceptions(id uuid primary key default gen_random_uuid());
  create table biz_approval_runs(id uuid primary key default gen_random_uuid(), status text, current_step int, steps jsonb);
  create table base_perm_cleanup_runs(id uuid primary key default gen_random_uuid(), actor uuid, fingerprint text, removed jsonb, snapshot jsonb, final_transition boolean, result jsonb, restored boolean default false, created_at timestamptz default now());
  create function private.is_active(u uuid) returns boolean language sql as $$select u is not null$$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$select u='${SA}'::uuid$$;
  create function public.is_super_admin(u uuid) returns boolean language sql as $$select u='${SA}'::uuid$$;
  create function public.biz_admin(u uuid) returns boolean language sql as $$select false$$;
  create function public.biz_org_can_manage() returns boolean language sql as $$select false$$;
  create function private.sig_can(u uuid, p text) returns boolean language sql as $$select false$$;
  create function public.biz_exception_ok(_actor uuid, _permission text, _kind text default null, _unit uuid default null) returns boolean language sql as $$select false$$;
  create function private.base_rules(u uuid, c jsonb) returns jsonb language sql as $$select '[]'::jsonb$$;
  create function private.final_permission_fingerprint() returns text language sql as $$select 'x'$$;
  create function private.final_effective_snapshot() returns jsonb language sql as $$select '[]'::jsonb$$;
  create function public.biz_effective_access(u uuid) returns jsonb language sql as $$select '{}'::jsonb$$;
  create function private.base_config() returns jsonb language sql as $$select '{}'::jsonb$$;
  insert into profiles values('${SA}','Admin','Đang hoạt động'),('${RESET}','Đã reset','Đang hoạt động'),('${FRESH}','Chưa reset','Đang hoạt động'),('${TARGET}','Nhân viên','Đang hoạt động');`);

  // Các resolver gốc (như 0185/0135) để 0347 bọc, rồi 0354 thay bằng bản lọc theo mốc reset.
  await db.exec(`
  create function public.biz_participant(_actor uuid) returns boolean language sql stable security definer set search_path=public as $$
   SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=_actor AND p.status='Đang hoạt động') AND (
    EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()))
    OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()))
    OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()))) $$;
  create function public.biz_manager(_actor uuid) returns boolean language sql stable security definer set search_path=public as $$
   SELECT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive')
   OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()))) $$;
  create function public.biz_all_scope(_actor uuid) returns boolean language sql stable security definer set search_path=public as $$
   SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
    public.biz_admin(_actor) OR public.biz_exception_ok(_actor,'biz.view_all','all')
    OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND a.position_snapshot->>'business_policy'='executive')) $$;
  create function public.biz_appointment_scope(_id uuid, _user uuid, _dept uuid, _at timestamptz default now()) returns boolean language sql stable security definer set search_path=public as $$
   SELECT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.id=_id AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND ((a.scope_kind='individual' AND a.user_id=_user) OR (a.scope_kind='department' AND a.department_id=_dept))) $$;
  create function public.biz_scope_ok(_actor uuid, _user uuid, _dept uuid, _at timestamptz default now()) returns boolean language sql stable security definer set search_path=public as $$
   SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
    public.biz_all_scope(_actor)
    OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive') AND public.biz_appointment_scope(a.id,_user,_dept,_at))) $$;
  create function public.biz_can(_actor uuid, _permission text) returns boolean language plpgsql stable security definer set search_path=public as $$
  BEGIN
   IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false;END IF;
   IF public.is_super_admin(_actor) THEN RETURN true;END IF;
   IF _permission NOT LIKE 'biz.%' THEN RETURN private.sig_can(_actor,_permission);END IF;
   IF public.biz_admin(_actor) THEN RETURN true;END IF;
   IF _permission='biz.access_manage' THEN RETURN false;END IF;
   IF public.biz_exception_ok(_actor,_permission) THEN RETURN true;END IF;
   IF _permission='biz.view_all' THEN RETURN public.biz_all_scope(_actor);END IF;
   IF _permission='biz.dashboard_public' THEN RETURN public.biz_participant(_actor) OR public.biz_all_scope(_actor);END IF;
   IF _permission IN ('biz.view_dept','biz.approval_view') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor);END IF;
   IF _permission IN ('biz.view_own','biz.plan_submit','biz.goal_submit','biz.report_submit') THEN RETURN public.biz_participant(_actor) AND (NOT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'business_policy'='executive') OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy','personal')<>'executive'));END IF;
   IF _permission='biz.plan_request_revision' THEN RETURN public.biz_manager(_actor);END IF;
   IF _permission IN ('biz.goal_approve','biz.report_approve','biz.late_approve') THEN RETURN public.biz_manager(_actor);END IF;
   IF _permission='biz.plan_approve' THEN RETURN false;END IF;
   RETURN false;
  END $$;
  create function public.biz_executive_holder(_actor uuid) returns boolean language sql stable security definer set search_path=public as $$
   SELECT EXISTS(SELECT 1 FROM public.biz_appointments a JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động' WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'code' IN ('executive_director','deputy_executive_director') AND a.position_snapshot->>'business_policy'='executive' AND coalesce((a.position_snapshot->>'all_business')::boolean,false)) $$;
  create function public.biz_department_access(_department_id uuid) returns boolean language sql stable security definer set search_path=public as $$
   SELECT public.is_super_admin(auth.uid()) OR public.biz_org_can_manage() OR public.biz_all_scope(auth.uid()) OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND m.user_id=auth.uid() AND m.ended_at IS NULL AND public.biz_can(auth.uid(),'biz.view_own')) $$;
  create function public.k3_can(_actor uuid, _permission text) returns boolean language sql stable security definer set search_path=public as $$ SELECT public.biz_participant(_actor) $$;
  create function public.crm_can(_actor uuid, _permission text) returns boolean language sql stable security definer set search_path=public as $$ SELECT public.biz_participant(_actor) $$;
  create function public.k3_scope_ok(_actor uuid, _user uuid) returns boolean language sql stable security definer set search_path=public as $$
   SELECT _actor IS NOT NULL AND _user IS NOT NULL AND (public.biz_all_scope(_actor) OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_user AND public.biz_scope_ok(_actor,_user,m.department_id))) $$;`);

  await db.exec(readFileSync('drizzle/migrations/0347_legacy_reset_standard_only_contract.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0354_biz_standard_appointment_contract.sql', 'utf8'));

  // RESET bị reset tại RESET_AT; chỉ có bổ nhiệm legacy (trước reset). FRESH không bị reset.
  await db.query(`insert into private.legacy_reset_accounts(user_id, run_id, reset_at) values ('${RESET}', gen_random_uuid(), '${RESET_AT}')`);
  await db.query(`insert into biz_appointments(user_id, scope_kind, started_at) values
    ('${RESET}', 'individual', '2025-01-01'),
    ('${FRESH}', 'individual', '2025-01-01')`);
}, 30000);
afterAll(() => db.close());

const bool = async (sql: string, args: unknown[] = []) => (await db.query<{ v: boolean }>(sql, args)).rows[0].v;

it('tài khoản reset chỉ có bổ nhiệm legacy: mọi quyền Kinh doanh vẫn bị chặn', async () => {
  expect(await bool('select public.biz_participant($1) v', [RESET])).toBe(false);
  expect(await bool("select public.biz_can($1,'biz.view_own') v", [RESET])).toBe(false);
  expect(await bool("select public.k3_can($1,'k3.use') v", [RESET])).toBe(false);
  expect(await bool("select public.crm_can($1,'biz.crm_use') v", [RESET])).toBe(false);
});

it('tài khoản chưa reset: bổ nhiệm cũ vẫn là nguồn hợp lệ (không đổi hành vi)', async () => {
  expect(await bool('select public.biz_participant($1) v', [FRESH])).toBe(true);
  expect(await bool("select public.biz_can($1,'biz.view_own') v", [FRESH])).toBe(true);
});

it('bổ nhiệm chuẩn sau reset mở lại quyền Kinh doanh đúng phạm vi', async () => {
  await db.query(`insert into biz_appointments(user_id, scope_kind, department_id, started_at, position_snapshot) values
    ('${RESET}', 'department', '${D1}', '2026-06-01', '{"business_policy":"manager"}')`);
  expect(await bool('select public.biz_participant($1) v', [RESET])).toBe(true);
  expect(await bool("select public.biz_can($1,'biz.view_own') v", [RESET])).toBe(true);
  expect(await bool("select public.biz_can($1,'biz.view_dept') v", [RESET])).toBe(true);
  // Phạm vi: thấy phòng D1 (bổ nhiệm mới), KHÔNG thấy phòng D2.
  expect(await bool('select public.biz_scope_ok($1,$2,$3) v', [RESET, TARGET, D1])).toBe(true);
  expect(await bool('select public.biz_scope_ok($1,$2,$3) v', [RESET, TARGET, D2])).toBe(false);
});

it('bổ nhiệm legacy trước reset không tự phục hồi phạm vi', async () => {
  // Thêm bổ nhiệm quản lý legacy cho D2 (trước reset) — vẫn không được cấp scope D2.
  await db.query(`insert into biz_appointments(user_id, scope_kind, department_id, started_at, position_snapshot) values
    ('${RESET}', 'department', '${D2}', '2025-06-01', '{"business_policy":"manager"}')`);
  expect(await bool('select public.biz_scope_ok($1,$2,$3) v', [RESET, TARGET, D2])).toBe(false);
  expect(await bool('select public.biz_scope_ok($1,$2,$3) v', [RESET, TARGET, D1])).toBe(true);
});

it('miễn nhiệm (kết thúc bổ nhiệm chuẩn) thu hồi toàn bộ quyền Kinh doanh', async () => {
  await db.query(`update biz_appointments set ended_at=now() where user_id='${RESET}' and started_at='2026-06-01'`);
  expect(await bool('select public.biz_participant($1) v', [RESET])).toBe(false);
  expect(await bool("select public.biz_can($1,'biz.view_own') v", [RESET])).toBe(false);
  expect(await bool('select public.biz_scope_ok($1,$2,$3) v', [RESET, TARGET, D1])).toBe(false);
});

it('Super Admin không bị ảnh hưởng bởi reset', async () => {
  expect(await bool("select public.biz_can($1,'biz.view_all') v", [SA])).toBe(true);
});
