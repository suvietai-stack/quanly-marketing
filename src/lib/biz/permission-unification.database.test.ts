import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// FIX P0: quyền Quản trị Kinh doanh/3K chỉ đến từ Cơ cấu tổ chức (bổ nhiệm) hoặc Admin/Super Admin.
// Role tổng có quyền biz.*/k3.* legacy KHÔNG còn cấp quyền Kinh doanh.
const db = new PGlite();
const [admin, sale, lead, legacy, outsider] = Array.from({ length: 5 }, (_, i) => `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`);
let sys = '', dep = '', team = '';
async function actor(id: string) { await db.query("select set_config('test.uid',$1,false)", [id]); }
async function scalar(sql: string, args: unknown[] = []) { return (await db.query<{ v: any }>(sql, args)).rows[0]?.v; }
async function org(action: string, data: unknown) { return scalar('select biz_org_save($1,$2) v', [action, JSON.stringify(data)]); }
async function appoint(data: unknown) { return scalar('select biz_appointment_save($1) v', [JSON.stringify(data)]); }

beforeAll(async () => {
  // sig_can giả lập Role tổng CŨ: cấp đủ quyền biz.*/k3.* cho `legacy` — sau thống nhất phải vô hiệu.
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
  CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
  CREATE TABLE app_roles(id text PRIMARY KEY,name text,permissions text[],updated_at timestamptz);
  CREATE TABLE user_roles(user_id uuid,role_id text);
  CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);
  CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u='${legacy}'::uuid AND (p LIKE 'biz.%' OR p LIKE 'k3.%'))$$;
  CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT u='${admin}'::uuid$$;
  CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
  for (const id of [admin, sale, lead, legacy, outsider]) await db.query('insert into profiles values($1,$2,$3)', [id, id, 'Đang hoạt động']);
  const files = ['0088_biz_management_foundation', '0089_biz_annual_goals_and_scoped_foundation', '0090_biz_membership_serialized_boundaries', '0091_biz_documents_foundation', '0092_biz_document_workflow', '0093_biz_document_aggregation_guards', '0094_biz_base_notifications', '0095_biz_notification_recipient_scope', '0096_biz_deadline_and_reminder_access', '0097_biz_report_baseline_scope', '0098_biz_report_frozen_baselines', '0099_biz_dashboard_scoped_months', '0100_biz_dashboard_exact_aggregates', '0101_biz_dashboard_trends', '0102_biz_dashboard_completeness_summary', '0103_biz_plan_revision_flow', '0104_biz_organization_history', '0105_biz_sequential_approvals', '0106_biz_approval_decision_fences', '0107_biz_approval_center', '0108_biz_dashboard_hierarchy_scope', '0109_biz_organization_guard_record_shapes', '0110_biz_approval_history_and_guard_scope', '0111_biz_positions_appointments', '0112_biz_dynamic_position_workflows', '0113_biz_role_scope_and_review_fences'];
  for (const file of [...files, '0114_biz_position_history_and_upward_guards', '0115_biz_isolated_demo', '0116_biz_demo_numeric_targets', '0117_biz_demo_submission_deadline']) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`, 'utf8'));
  for (let n = 118; n <= 148; n++) { const file = readdirSync('drizzle/migrations').find(f => f.startsWith(String(n).padStart(4, '0') + '_')); if (file) await db.exec(readFileSync('drizzle/migrations/' + file, 'utf8')); }
  // Migration thống nhất phân quyền — đối tượng kiểm thử chính.
  await db.exec(readFileSync('drizzle/migrations/0185_biz_permission_unification.sql', 'utf8'));
  // Role tổng legacy giữ quyền biz.*/k3.* (dữ liệu cũ được giữ để audit nhưng không còn hiệu lực).
  await db.exec("insert into app_roles(id,name,permissions) values('staff','Nhân viên',ARRAY['biz.view_own','biz.view_dept','biz.plan_submit','biz.goal_submit','biz.report_submit','biz.deadline_manage','k3.use','k3.view_scope','k3.settings'])");
  await db.query("insert into user_roles values($1,'staff')", [legacy]);
  await db.exec("INSERT INTO biz_positions(code,name,level,unit_kind,sort_order,business_policy) VALUES ('director','Giám Đốc',3,'system',0,'manager'),('department_head','Trưởng Phòng',2,'department',1,'manager'),('team_lead','Trưởng Nhóm',1,'team',2,'manager'),('employee','Nhân viên Kinh doanh',0,'individual',3,'personal')");
  await actor(admin); sys = await org('system', { name: 'Hệ thống nhất' }); dep = await org('department', { name: 'Phòng thống nhất', system_id: sys }); team = await org('team', { name: 'Nhóm thống nhất', department_id: dep });
  await org('member', { user_id: sale, department_id: dep, team_id: team });
}, 60000);
afterAll(() => db.close());

it('Role tổng có quyền biz.*/k3.* legacy nhưng không bổ nhiệm → bị chặn hoàn toàn', async () => {
  expect(await scalar('select biz_participant($1) v', [legacy])).toBe(false);
  for (const p of ['biz.view_own', 'biz.view_dept', 'biz.view_all', 'biz.plan_submit', 'biz.goal_submit', 'biz.report_submit', 'biz.dashboard_public', 'biz.deadline_manage', 'biz.org_manage'])
    expect(await scalar('select biz_can($1,$2) v', [legacy, p])).toBe(false);
  for (const p of ['k3.use', 'k3.view_scope', 'k3.comment', 'k3.settings'])
    expect(await scalar('select k3_can($1,$2) v', [legacy, p])).toBe(false);
  const access = await scalar('select biz_effective_access($1) v', [legacy]);
  expect(access.permissions).toEqual([]);
});

it('bổ nhiệm Nhân viên tự cấp quyền cá nhân và 3K mà không cần Role tổng', async () => {
  await actor(admin);
  await org('member', { user_id: outsider, department_id: dep, team_id: team });
  expect(await scalar('select biz_participant($1) v', [outsider])).toBe(true);
  expect(await scalar("select biz_can($1,'biz.view_own') v", [outsider])).toBe(true);
  expect(await scalar("select biz_can($1,'biz.plan_submit') v", [outsider])).toBe(true);
  expect(await scalar("select k3_can($1,'k3.use') v", [outsider])).toBe(true);
  expect(await scalar("select biz_can($1,'biz.view_dept') v", [outsider])).toBe(false);
  expect(await scalar("select k3_can($1,'k3.view_scope') v", [outsider])).toBe(false);
});

it('bổ nhiệm Trưởng Nhóm cấp quyền xem phạm vi; miễn nhiệm thu hồi', async () => {
  await actor(admin);
  const p = await scalar("select id v from biz_positions where code='team_lead'");
  const a = await appoint({ position_id: p, user_id: lead, scope_kind: 'team', system_id: sys, department_id: dep, team_id: team });
  expect(await scalar("select biz_can($1,'biz.view_dept') v", [lead])).toBe(true);
  expect(await scalar("select k3_can($1,'k3.view_scope') v", [lead])).toBe(true);
  expect(await scalar("select k3_can($1,'k3.comment') v", [lead])).toBe(true);
  expect(await scalar('select biz_scope_ok($1,$2,$3) v', [lead, sale, dep])).toBe(true);
  await appoint({ id: a, action: 'end', ended_at: new Date().toISOString() });
  expect(await scalar("select biz_can($1,'biz.view_dept') v", [lead])).toBe(false);
  expect(await scalar("select k3_can($1,'k3.view_scope') v", [lead])).toBe(false);
});

it('quyền cài đặt Kinh doanh không còn đến từ Role tổng, chỉ Admin hoặc ngoại lệ trong Kinh doanh', async () => {
  // legacy có biz.deadline_manage trong Role tổng nhưng vẫn bị chặn
  expect(await scalar("select biz_can($1,'biz.deadline_manage') v", [legacy])).toBe(false);
  // Admin (super admin) full quyền
  expect(await scalar("select biz_can($1,'biz.deadline_manage') v", [admin])).toBe(true);
  expect(await scalar("select k3_can($1,'k3.settings') v", [admin])).toBe(true);
  // Ngoại lệ được cấp trong chính Quản trị Kinh doanh thì có hiệu lực
  await actor(admin);
  await scalar('select biz_exception_save($1) v', [JSON.stringify({ user_id: sale, permission: 'biz.deadline_manage', scope_kind: 'all', reason: 'Phụ trách deadline' })]);
  expect(await scalar("select biz_can($1,'biz.deadline_manage') v", [sale])).toBe(true);
});

it('cờ xem toàn Khối trên Role tổng không còn cấp biz_all_scope', async () => {
  await db.exec("alter table app_roles add column if not exists biz_detail_exception boolean default false");
  await db.exec("update app_roles set biz_detail_exception=true where id='staff'");
  expect(await scalar('select biz_all_scope($1) v', [legacy])).toBe(false);
  expect(await scalar("select biz_can($1,'biz.view_all') v", [legacy])).toBe(false);
});

it('quyền hiệu lực bao gồm k3.* theo Cơ cấu tổ chức', async () => {
  const access = await scalar('select biz_effective_access($1) v', [sale]);
  expect(access.permissions).toContain('k3.use');
  expect(access.permissions).toContain('biz.view_own');
  expect(access.permissions).not.toContain('k3.settings');
  expect(access.role_exceptions).toBeUndefined();
});
