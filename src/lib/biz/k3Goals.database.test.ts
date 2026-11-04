import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const staff = '00000000-0000-0000-0000-0000000000a1';
const other = '00000000-0000-0000-0000-0000000000a2';
const manager = '00000000-0000-0000-0000-0000000000a3';
const outsider = '00000000-0000-0000-0000-0000000000a4';
const dept = '40000000-0000-0000-0000-0000000000a1';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

async function val<T = unknown>(sql: string) { return (await db.query<{ v: T }>(sql)).rows[0]?.v as T; }
const as = async (uid: string) => db.exec(`SET test.uid='${uid}'`);
let goal: string; let action: string;

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
  INSERT INTO profiles VALUES ('${staff}','Nhân viên A','Đang hoạt động'),('${other}','Nhân viên B','Đang hoạt động'),('${manager}','Trưởng phòng','Đang hoạt động'),('${outsider}','Ngoài phạm vi','Đang hoạt động');
  INSERT INTO biz_departments VALUES ('${dept}','Phòng Kinh doanh');
  INSERT INTO biz_department_members VALUES ('${staff}','${dept}'),('${other}','${dept}'),('${manager}','${dept}');
  SET test.uid='${staff}';`);
  for (const file of ['0173_k3_daily_management_phase1.sql', '0174_k3_daily_integrity_and_summary_versions.sql', '0175_k3_period_entities.sql', '0176_k3_period_writes_and_task_links.sql', '0177_k3_period_reads_summaries_scope.sql', '0178_k3_summary_semantics_and_deadline_readback.sql', '0179_k3_unscheduled_creation_and_scope_fences.sql', '0180_k3_task_metadata_and_summary_integrity.sql', '0189_k3_cross_period_goal_model.sql', '0190_k3_goal_collaboration_rpcs.sql', '0191_k3_execution_integration.sql', '0192_k3_kpi_and_list_fixes.sql', '0193_k3_goal_detail_member_actuals_fix.sql'])
    await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  // Quyền 3K thống nhất theo Cơ cấu tổ chức (0185): k3_can không còn dùng Role tổng/sig_can.
  const m0185 = readFileSync('drizzle/migrations/0185_biz_permission_unification.sql', 'utf8');
  await db.exec(m0185.match(/CREATE OR REPLACE FUNCTION public\.k3_can[\s\S]*?\$function\$;/)![0]);
  await as(manager);
  await val(`SELECT k3_settings_save(true, '2020-01-01'::date, '08:45'::time, '18:00'::time, 3::smallint) v`);
  await as(staff);
}, 30000);

afterAll(() => db.close());

it('tạo KG tùy chỉnh kéo dài xuyên tháng, gửi lặp không nhân đôi', async () => {
  const payload = `{"name":"Phát triển 30 khách hàng tiềm năng","period_type":"custom","period_start":"2026-10-01","period_end":"2027-01-15","request_key":"10000000-0000-0000-0000-0000000000b1"}`;
  const g = await val<{ id: string; status: string; period_type: string }>(`SELECT k3_goal_save('${payload}') v`);
  goal = g.id;
  expect(g.period_type).toBe('custom');
  expect(g.status).toBe('draft');
  expect((await val<{ id: string }>(`SELECT k3_goal_save('${payload}') v`)).id).toBe(goal);
  expect(await val(`SELECT count(*)::int v FROM k3_goals WHERE id='${goal}'`)).toBe(1);
});

it('KG bắt đầu thực hiện cần ít nhất một KF', async () => {
  await expect(db.query(`SELECT k3_goal_status('${goal}','in_progress',NULL,0)`)).rejects.toThrow('ít nhất một KF');
  const a = await val<{ id: string; assignee_id: string }>(`SELECT k3_action_save('{"goal_id":"${goal}","name":"Liên hệ và tư vấn","request_key":"20000000-0000-0000-0000-0000000000b1"}') v`);
  action = a.id;
  expect(a.assignee_id).toBe(staff);
  const g = await val<{ status: string }>(`SELECT k3_goal_status('${goal}','in_progress',NULL,0) v`);
  expect(g.status).toBe('in_progress');
});

it('một KG có nhiều KPI kết quả, KPI tỷ lệ cần nguồn xác nhận', async () => {
  await val(`SELECT k3_kpi_save('{"goal_id":"${goal}","name":"30 khách đủ điều kiện","kind":"cumulative","target":30,"unit":"khách","request_key":"40000000-0000-0000-0000-0000000000b1"}') v`);
  await expect(db.query(`SELECT k3_kpi_save('{"goal_id":"${goal}","name":"Tỷ lệ phản hồi","kind":"ratio","target":60,"unit":"%","manual_actual":55,"request_key":"40000000-0000-0000-0000-0000000000b2"}')`)).rejects.toThrow('nguồn xác nhận');
  const k = await val<{ id: string }>(`SELECT k3_kpi_save('{"goal_id":"${goal}","name":"Tỷ lệ phản hồi","kind":"ratio","target":60,"unit":"%","manual_actual":55,"manual_source":"Đối chiếu CRM tuần 45","request_key":"40000000-0000-0000-0000-0000000000b2"}') v`);
  expect(k.id).toBeTruthy();
  expect(await val(`SELECT count(*)::int v FROM k3_kpis WHERE goal_id='${goal}'`)).toBe(2);
});

it('mời thành viên, từ chối phân công cho người chưa chấp nhận, chấp nhận rồi phân công được', async () => {
  await val(`SELECT k3_member_invite('${goal}', ARRAY['${other}']::uuid[]) v`);
  await expect(db.query(`SELECT k3_action_save('{"goal_id":"${goal}","name":"Sàng lọc khách","assignee_id":"${other}","request_key":"20000000-0000-0000-0000-0000000000b2"}')`)).rejects.toThrow('chấp nhận tham gia');
  await as(other);
  await val(`SELECT k3_member_respond('${goal}', true) v`);
  await as(staff);
  const a = await val<{ id: string; assignee_id: string }>(`SELECT k3_action_save('{"goal_id":"${goal}","name":"Sàng lọc khách","assignee_id":"${other}","request_key":"20000000-0000-0000-0000-0000000000b2"}') v`);
  expect(a.assignee_id).toBe(other);
});

it('người phụ trách ghi kết quả ngày vào KF chung, cộng dồn đa thành viên không trùng', async () => {
  await val(`SELECT k3_kpi_save('{"action_id":"${action}","name":"100 cuộc gọi","kind":"cumulative","target":100,"unit":"cuộc gọi","request_key":"40000000-0000-0000-0000-0000000000b3"}') v`);
  // Chủ trì ghi 10 cuộc hôm nay.
  await val(`SELECT k3_plan_task_save('{"name":"Gọi khách sáng","action_id":"${action}","work_date":"${today}","kpi_target":10,"kpi_unit":"cuộc gọi","kpi_actual":10,"status":"doing","request_key":"30000000-0000-0000-0000-0000000000b1"}') v`);
  // Người phụ trách KF khác (other) ghi phần của mình vào KF của chính mình.
  const action2 = await val<string>(`SELECT id::text v FROM k3_actions WHERE assignee_id='${other}'`);
  await as(other);
  await val(`SELECT k3_plan_task_save('{"name":"Sàng lọc 5 khách","action_id":"${action2}","work_date":"${today}","kpi_actual":5,"kpi_unit":"khách","status":"doing","request_key":"30000000-0000-0000-0000-0000000000b2"}') v`);
  await as(staff);
  const detail = await val<{ actions: { kpis: { actual: number }[] }[] }>(`SELECT k3_goal_detail('${goal}') v`);
  const kpi = detail.actions.find((a) => a.kpis.length)?.kpis[0];
  expect(Number(kpi?.actual)).toBe(10);
  // Sửa lại kết quả cũ (10 → 8) không tạo thêm lần ghi mới.
  const taskId = await val<string>(`SELECT id::text v FROM k3_tasks WHERE action_id='${action}' AND user_id='${staff}'`);
  await val(`SELECT k3_task_update('${taskId}','doing',8,NULL,'','','','') v`);
  const after = await val<{ actions: { kpis: { actual: number }[] }[] }>(`SELECT k3_goal_detail('${goal}') v`);
  expect(Number(after.actions.find((a) => a.kpis.length)?.kpis[0]?.actual)).toBe(8);
});

it('KF hoàn thành bị chặn khi chưa đạt KPI, kết thúc chưa đạt cần VNGB', async () => {
  const rev = await val<number>(`SELECT revision::int v FROM k3_actions WHERE id='${action}'`);
  await expect(db.query(`SELECT k3_action_status('${action}','done',NULL,NULL,NULL,${rev})`)).rejects.toThrow('Chưa đạt KPI');
  await expect(db.query(`SELECT k3_action_status('${action}','ended_missed',NULL,NULL,NULL,${rev})`)).rejects.toThrow('Vấn đề');
  const a = await val<{ status: string }>(`SELECT k3_action_status('${action}','ended_missed','Khách không nghe máy','Gọi sai giờ','Đổi khung giờ gọi',${rev}) v`);
  expect(a.status).toBe('ended_missed');
});

it('thu hồi thành viên thu hồi quyền xem nhưng giữ lịch sử', async () => {
  await val(`SELECT k3_member_revoke('${goal}','${other}') v`);
  await as(other);
  await expect(db.query(`SELECT k3_goal_detail('${goal}')`)).rejects.toThrow('không có quyền');
  await expect(db.query(`SELECT k3_plan_task_save('{"name":"X","action_id":"${action}","work_date":"${today}","request_key":"30000000-0000-0000-0000-0000000000b3"}')`)).rejects.toThrow();
  await as(staff);
  expect(await val(`SELECT count(*)::int v FROM k3_plan_events WHERE goal_id='${goal}' AND action='member_revoke'`)).toBe(1);
  expect(await val(`SELECT count(*)::int v FROM k3_tasks WHERE user_id='${other}'`)).toBeGreaterThan(0);
});

it('người ngoài cơ cấu không dùng được 3K, quản lý xem đúng phạm vi', async () => {
  await as(outsider);
  await expect(db.query(`SELECT k3_goal_list('all','')`)).rejects.toThrow('không có quyền');
  await expect(db.query(`SELECT k3_goal_save('{"name":"X","period_type":"custom","period_start":"${today}","period_end":"${today}","request_key":"10000000-0000-0000-0000-0000000000b9"}')`)).rejects.toThrow();
  await as(manager);
  const list = await val<{ id: string; owner_name: string }[]>(`SELECT k3_goal_list('scope','') v`);
  expect(list.some((g) => g.id === goal)).toBe(true);
  const detail = await val<{ goal: { name: string } }>(`SELECT k3_goal_detail('${goal}') v`);
  expect(detail.goal.name).toContain('30 khách');
  await as(staff);
});

it('lời mời từ chối không trở thành thành viên, mời lại được', async () => {
  await val(`SELECT k3_member_invite('${goal}', ARRAY['${other}']::uuid[]) v`);
  await as(other);
  await val(`SELECT k3_member_respond('${goal}', false) v`);
  const st = await val<string>(`SELECT status v FROM k3_goal_members WHERE goal_id='${goal}' AND user_id='${other}'`);
  expect(st).toBe('declined');
  await expect(db.query(`SELECT k3_member_respond('${goal}', true)`)).rejects.toThrow('đang chờ');
  await as(staff);
  await val(`SELECT k3_member_invite('${goal}', ARRAY['${other}']::uuid[]) v`);
  expect(await val<string>(`SELECT status v FROM k3_goal_members WHERE goal_id='${goal}' AND user_id='${other}'`)).toBe('invited');
});

it('góc nhìn Quý tính đúng khoảng và đọc được', async () => {
  expect(await val(`SELECT k3_period_start('quarter','2026-11-04')::text v`)).toBe('2026-10-01');
  expect(await val(`SELECT k3_period_end('quarter','2026-11-04')::text v`)).toBe('2026-12-31');
  const r = await val<{ period_start: string; period_end: string; goals: unknown[] }>(`SELECT k3_period_read('quarter','${today}') v`);
  expect(r.period_end > r.period_start).toBe(true);
});

it('đọc ngày kèm KG đang thực hiện và KF được phân công', async () => {
  // other đang ở trạng thái invited sau khi được mời lại — chấp nhận để trở thành thành viên hợp lệ.
  await as(other);
  await val(`SELECT k3_member_respond('${goal}', true) v`);
  await as(staff);
  const day = await val<{ active_goals: { id: string }[]; assigned_actions: { id: string; my_part: string }[] }>(`SELECT k3_day_read('${today}') v`);
  expect(day.active_goals.some((g) => g.id === goal)).toBe(true);
  // KF của staff đã kết thúc chưa đạt nên không còn trong danh sách cần làm; KF của other vẫn đang thực hiện.
  expect(day.assigned_actions.some((a) => a.id === action)).toBe(false);
  await as(other);
  const day2 = await val<{ assigned_actions: { id: string; my_part: string }[] }>(`SELECT k3_day_read('${today}') v`);
  expect(day2.assigned_actions.some((a) => a.my_part === 'assignee')).toBe(true);
  await as(staff);
});

it('cài đặt quyền nghiệp vụ ghi lịch sử và chặn tạo KG khi tắt', async () => {
  await as(manager);
  await val(`SELECT k3_module_settings_save('{"allow_personal_goal":false}') v`);
  await as(staff);
  await expect(db.query(`SELECT k3_goal_save('{"name":"Y","period_type":"custom","period_start":"${today}","period_end":"${today}","request_key":"10000000-0000-0000-0000-0000000000b8"}')`)).rejects.toThrow('đang tắt');
  await as(manager);
  await val(`SELECT k3_module_settings_save('{"allow_personal_goal":true}') v`);
  expect(await val(`SELECT count(*)::int v FROM k3_settings_log`)).toBeGreaterThanOrEqual(3);
  await as(staff);
});
