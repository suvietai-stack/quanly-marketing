import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const staff = '00000000-0000-0000-0000-0000000000a1';
const other = '00000000-0000-0000-0000-0000000000a2';
const manager = '00000000-0000-0000-0000-0000000000a3';
const dept = '40000000-0000-0000-0000-0000000000a1';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

async function val<T = unknown>(sql: string) { return (await db.query<{ v: T }>(sql)).rows[0]?.v as T; }
const as = async (uid: string) => db.exec(`SET test.uid='${uid}'`);
let quickGoal: string;

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT current_setting('test.uid')::uuid$$;
  CREATE TABLE profiles(id uuid PRIMARY KEY, full_name text, status text);
  CREATE TABLE biz_departments(id uuid PRIMARY KEY, name text);
  CREATE TABLE biz_department_members(user_id uuid, department_id uuid);
  CREATE FUNCTION public.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
  CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
  CREATE FUNCTION private.sig_can(uuid, text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_participant(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM biz_department_members m WHERE m.user_id=$1)$$;
  CREATE FUNCTION public.biz_manager(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
  CREATE FUNCTION public.biz_all_scope(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_scope_ok(uuid, uuid, uuid, timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid AND $2 IN ('${staff}'::uuid,'${other}'::uuid)$$;
  CREATE FUNCTION public.biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT department_id FROM biz_department_members WHERE user_id=$1 LIMIT 1$$;
  INSERT INTO profiles VALUES ('${staff}','Nhân viên A','Đang hoạt động'),('${other}','Nhân viên B','Đang hoạt động'),('${manager}','Trưởng phòng','Đang hoạt động');
  INSERT INTO biz_departments VALUES ('${dept}','Phòng Kinh doanh');
  INSERT INTO biz_department_members VALUES ('${staff}','${dept}'),('${other}','${dept}'),('${manager}','${dept}');
  SET test.uid='${staff}';`);
  for (const file of ['0173_k3_daily_management_phase1.sql', '0174_k3_daily_integrity_and_summary_versions.sql', '0175_k3_period_entities.sql', '0176_k3_period_writes_and_task_links.sql', '0177_k3_period_reads_summaries_scope.sql', '0178_k3_summary_semantics_and_deadline_readback.sql', '0179_k3_unscheduled_creation_and_scope_fences.sql', '0180_k3_task_metadata_and_summary_integrity.sql', '0189_k3_cross_period_goal_model.sql', '0190_k3_goal_collaboration_rpcs.sql', '0191_k3_execution_integration.sql', '0192_k3_kpi_and_list_fixes.sql', '0193_k3_goal_detail_member_actuals_fix.sql', '0194_k3_unify_fixes_revoke_dates_kpi_future.sql', '0195_k3_restore_vietnamese_messages.sql', '0196_k3_standardize_workflow.sql'])
    await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  const m0185 = readFileSync('drizzle/migrations/0185_biz_permission_unification.sql', 'utf8');
  await db.exec(m0185.match(/CREATE OR REPLACE FUNCTION public\.k3_can[\s\S]*?\$function\$;/)![0]);
  await as(manager);
  await val(`SELECT k3_settings_save(true, '2020-01-01'::date, '08:45'::time, '18:00'::time, 3::smallint) v`);
  await as(staff);
  for (const file of ['0202_k3_daily_kpi_result_foundation.sql','0203_k3_kpi_metric_and_configuration_guards.sql','0206_k3_result_privacy_and_configuration_fences.sql','0207_k3_configuration_module_and_legacy_history_guards.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  const contract = readFileSync('drizzle/migrations/0216_k3_ten_measurement_contract_and_review_safety.sql', 'utf8');
  await db.exec(contract.slice(0, contract.indexOf('COMMENT ON TABLE')));
  await db.exec(readFileSync('drizzle/migrations/0217_k3_measurement_configuration_validation.sql', 'utf8'));
  const creation = readFileSync('drizzle/migrations/0220_k3_configured_creation_and_date_preview.sql', 'utf8');
  await db.exec(creation.slice(0, creation.indexOf(" def:=pg_get_functiondef('public.k3_kpi_result_read")) + 'END $patch$;');
}, 30000);

afterAll(() => db.close());

it('tạo công việc nhanh: KG + KF + KPI trong một lần lưu, bắt đầu ngay', async () => {
  const payload = `{"request_key":"50000000-0000-0000-0000-0000000000a1","name":"Lập danh sách 100 đại lý tiềm năng miền Nam","period_start":"${today}","period_end":"${nextMonth}","start_now":true,"kfs":[{"name":"Tìm kiếm danh sách đại lý","due_date":"${nextMonth}","kpis":[{"name":"100 đại lý","kind":"cumulative","target":100,"unit":"đại lý"}]},{"name":"Xác minh thông tin đại lý","kpis":[{"name":"100 đại lý hợp lệ","kind":"cumulative","target":100,"unit":"đại lý"}]}]}`;
  const r = await val<{ goal_id: string; kf_count: number; duplicated: boolean }>(`SELECT k3_quick_create('${payload}') v`);
  quickGoal = r.goal_id;
  expect(r.kf_count).toBe(2);
  expect(r.duplicated).toBe(false);
  const g = await val<{ status: string }>(`SELECT jsonb_build_object('status',status) v FROM k3_goals WHERE id='${quickGoal}'`);
  expect(g.status).toBe('in_progress');
  expect(await val(`SELECT count(*)::int v FROM k3_actions WHERE goal_id='${quickGoal}'`)).toBe(2);
  expect(await val(`SELECT count(*)::int v FROM k3_kpis WHERE action_id IN (SELECT id FROM k3_actions WHERE goal_id='${quickGoal}')`)).toBe(2);
});

it('gửi lặp cùng request_key không tạo trùng KG', async () => {
  const payload = `{"request_key":"50000000-0000-0000-0000-0000000000a1","name":"Lập danh sách 100 đại lý tiềm năng miền Nam","period_start":"${today}","period_end":"${nextMonth}","start_now":true,"kfs":[{"name":"Tìm kiếm danh sách đại lý"}]}`;
  const r = await val<{ goal_id: string; duplicated: boolean }>(`SELECT k3_quick_create('${payload}') v`);
  expect(r.goal_id).toBe(quickGoal);
  expect(r.duplicated).toBe(true);
  expect(await val(`SELECT count(*)::int v FROM k3_goals WHERE user_id='${staff}'`)).toBe(1);
});

it('bắt đầu thực hiện cần ít nhất một KF; lưu nháp không cần KF', async () => {
  await expect(db.query(`SELECT k3_quick_create('{"request_key":"50000000-0000-0000-0000-0000000000a2","name":"Công việc thiếu KF","period_start":"${today}","period_end":"${nextMonth}","start_now":true,"kfs":[]}')`)).rejects.toThrow('ít nhất một bước KF');
  const r = await val<{ goal_id: string; kf_count: number }>(`SELECT k3_quick_create('{"request_key":"50000000-0000-0000-0000-0000000000a3","name":"Bản nháp chưa có KF","period_start":"${today}","period_end":"${nextMonth}","start_now":false,"kfs":[]}') v`);
  expect(r.kf_count).toBe(0);
  expect(await val<string>(`SELECT status v FROM k3_goals WHERE id='${r.goal_id}'`)).toBe('draft');
});

it('KF tên trống bị từ chối và toàn bộ giao dịch được hoàn tác', async () => {
  const before = await val<number>(`SELECT count(*)::int v FROM k3_goals`);
  await expect(db.query(`SELECT k3_quick_create('{"request_key":"50000000-0000-0000-0000-0000000000a4","name":"Công việc lỗi","period_start":"${today}","period_end":"${nextMonth}","kfs":[{"name":""}]}')`)).rejects.toThrow('KF');
  expect(await val<number>(`SELECT count(*)::int v FROM k3_goals`)).toBe(before);
});

it('tạo công việc nhóm kèm lời mời thành viên; lọc collab chỉ trả KG có phối hợp', async () => {
  const r = await val<{ goal_id: string }>(`SELECT k3_quick_create('{"request_key":"50000000-0000-0000-0000-0000000000a5","name":"Chiến dịch chào hàng đại lý Q4","period_start":"${today}","period_end":"${nextMonth}","start_now":true,"member_ids":["${other}"],"kfs":[{"name":"Chuẩn bị tài liệu chào hàng","kpis":[{"name":"Tài liệu","measure":"binary","config":{"valid_condition":"Đã chuẩn bị đủ"}}]}]}') v`);
  expect(await val<string>(`SELECT status v FROM k3_goal_members WHERE goal_id='${r.goal_id}' AND user_id='${other}'`)).toBe('invited');
  const collab = await val<{ id: string }[]>(`SELECT k3_goal_list('collab','') v`);
  expect(collab.some((g) => g.id === r.goal_id)).toBe(true);
  // KG cá nhân (không thành viên) không xuất hiện trong danh sách nhóm.
  expect(collab.some((g) => g.id === quickGoal)).toBe(false);
  // Người được mời cũng thấy KG nhóm trong danh sách collab của mình.
  await as(other);
  const collabOther = await val<{ id: string }[]>(`SELECT k3_goal_list('collab','') v`);
  expect(collabOther.some((g) => g.id === r.goal_id)).toBe(true);
  await as(staff);
});
it('one KF stores multiple typed required KPIs atomically', async () => {
  const payload = {request_key:crypto.randomUUID(),name:'Một KF nhiều KPI',period_start:today,period_end:nextMonth,start_now:true,kfs:[{name:'Tư vấn',kpis:[{name:'Gọi',measure:'cumulative',target:20,required:true},{name:'Hợp đồng',measure:'binary',required:true,config:{valid_condition:'Đã ký'}}]}]};
  const r = await val<{goal_id:string}>(`SELECT k3_quick_create('${JSON.stringify(payload)}') v`);
  expect(await val(`SELECT jsonb_agg(measure ORDER BY measure) v FROM k3_kpis WHERE action_id IN(SELECT id FROM k3_actions WHERE goal_id='${r.goal_id}')`)).toEqual(['binary','cumulative']);
});
it('starting KF without KPI rolls back its KG and KF together', async () => {
  const before = await val<number>('SELECT count(*)::int v FROM k3_goals');
  await expect(db.query(`SELECT k3_quick_create('${JSON.stringify({request_key:crypto.randomUUID(),name:'Thiếu KPI',period_start:today,period_end:nextMonth,start_now:true,kfs:[{name:'KF thiếu KPI'}]})}')`)).rejects.toThrow('ít nhất một KPI');
  expect(await val<number>('SELECT count(*)::int v FROM k3_goals')).toBe(before);
});

it('theo dõi nhân viên: trạng thái none → planned → updated → summarized và bộ đếm KG/KF', async () => {
  // other chưa có dữ liệu ngày → Chưa cập nhật hôm nay.
  await as(manager);
  let team = await val<{ user_id: string; status_key: string; goals_active: number; kf_active: number }[]>(`SELECT k3_team_read('${today}') v`);
  const rowOther = team.find((r) => r.user_id === other);
  expect(rowOther?.status_key).toBe('none');
  const rowStaff = team.find((r) => r.user_id === staff);
  expect(rowStaff?.status_key).toBe('none');
  expect(rowStaff?.goals_active).toBeGreaterThanOrEqual(2);
  expect(rowStaff?.kf_active).toBeGreaterThanOrEqual(2);

  // staff lập công việc đầu ngày → Đã lập nội dung thực thi.
  await as(staff);
  const t = await val<{ id: string }>(`SELECT k3_task_save('{"name":"Gọi 5 đại lý đầu tiên","work_date":"${today}","kpi_target":5,"kpi_unit":"cuộc gọi","request_key":"60000000-0000-0000-0000-0000000000a1"}') v`);
  await as(manager);
  team = await val<typeof team>(`SELECT k3_team_read('${today}') v`);
  expect(team.find((r) => r.user_id === staff)?.status_key).toBe('planned');

  // staff cập nhật kết quả → Đã cập nhật kết quả.
  await as(staff);
  await val(`SELECT k3_task_update('${t.id}','doing',3,NULL,'','','','') v`);
  await as(manager);
  team = await val<typeof team>(`SELECT k3_team_read('${today}') v`);
  expect(team.find((r) => r.user_id === staff)?.status_key).toBe('updated');

  // staff hoàn thành và chốt sổ → Đã chốt sổ.
  await as(staff);
  await val(`SELECT k3_task_update('${t.id}','done',5,NULL,'','','','') v`);
  await val(`SELECT k3_summary_confirm('${today}') v`);
  await as(manager);
  team = await val<typeof team>(`SELECT k3_team_read('${today}') v`);
  expect(team.find((r) => r.user_id === staff)?.status_key).toBe('summarized');
  await as(staff);
});

it('KF quá hạn được đếm trong theo dõi nhân viên', async () => {
  const past = '2026-01-10';
  await val(`SELECT k3_action_save('{"goal_id":"${quickGoal}","name":"KF đã quá hạn","due_date":"${past}","request_key":"20000000-0000-0000-0000-0000000000e1"}') v`);
  await as(manager);
  const team = await val<{ user_id: string; kf_overdue: number }[]>(`SELECT k3_team_read('${today}') v`);
  expect(team.find((r) => r.user_id === staff)?.kf_overdue).toBeGreaterThanOrEqual(1);
  await as(staff);
});
