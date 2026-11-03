import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
const staff = '00000000-0000-0000-0000-0000000000a1';
const other = '00000000-0000-0000-0000-0000000000a2';
const manager = '00000000-0000-0000-0000-0000000000a3';
const outsider = '00000000-0000-0000-0000-0000000000a4';
const dept = '40000000-0000-0000-0000-0000000000a1';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

async function value(sql: string) { return (await db.query<{ v: unknown }>(sql)).rows[0]?.v; }
async function as(uid: string) { await db.exec(`SET test.uid='${uid}';`); }

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT current_setting('test.uid')::uuid$$;
  CREATE TABLE profiles(id uuid PRIMARY KEY, full_name text, status text);
  CREATE TABLE biz_departments(id uuid PRIMARY KEY, name text);
  CREATE TABLE biz_department_members(user_id uuid, department_id uuid);
  CREATE FUNCTION public.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
  CREATE FUNCTION private.sig_can(uuid, text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_participant(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM biz_department_members m WHERE m.user_id=$1)$$;
  CREATE FUNCTION public.biz_manager(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
  CREATE FUNCTION public.biz_all_scope(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION public.biz_scope_ok(uuid, uuid, uuid, timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid AND $2 IN ('${staff}'::uuid,'${other}'::uuid)$$;
  INSERT INTO profiles VALUES ('${staff}','Nhân viên A','Đang hoạt động'),('${other}','Nhân viên B','Đang hoạt động'),('${manager}','Trưởng phòng','Đang hoạt động'),('${outsider}','Ngoài phạm vi','Đang hoạt động');
  INSERT INTO biz_departments VALUES ('${dept}','Phòng Kinh doanh');
  INSERT INTO biz_department_members VALUES ('${staff}','${dept}'),('${other}','${dept}'),('${outsider}','${dept}');
  SET test.uid='${staff}';`);
  await db.exec(readFileSync('drizzle/migrations/0173_k3_daily_management_phase1.sql', 'utf8'));
  await db.exec(`CREATE FUNCTION public.biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT department_id FROM biz_department_members WHERE user_id=$1 LIMIT 1$$;`);
  await db.exec(readFileSync('drizzle/migrations/0174_k3_daily_integrity_and_summary_versions.sql', 'utf8'));
  // Quyền 3K thống nhất theo Cơ cấu tổ chức (0185): k3_can không còn dùng Role tổng/sig_can.
  const m0185 = readFileSync('drizzle/migrations/0185_biz_permission_unification.sql', 'utf8');
  await db.exec(m0185.match(/CREATE OR REPLACE FUNCTION public\.k3_can[\s\S]*?\$function\$;/)![0]);
  // Kích hoạt module bằng quyền cấu hình: quản lý có biz_admin → k3.settings.
  await as(manager);
  await db.query(`SELECT k3_settings_save(true, '2020-01-01'::date, '08:45'::time, '18:00'::time, 3::smallint)`);
  await as(staff);
}, 30000);

afterAll(() => db.close());

it('nhân viên lập 3K và thêm công việc nhanh', async () => {
  await value(`SELECT k3_day_save('${today}', 'Phát triển khách hàng mới') v`);
  const task = await value(`SELECT k3_task_save('{"work_date":"${today}","name":"Gọi 10 khách hàng tiềm năng","kpi_target":10,"kpi_unit":"khách","start_time":"08:30","end_time":"09:30"}') v`) as { id: string };
  expect(task.id).toBeTruthy();
  const day = await value(`SELECT k3_day_read('${today}') v`) as { day: { kg: string; planned_at: string }; tasks: unknown[] };
  expect(day.day.kg).toBe('Phát triển khách hàng mới');
  expect(day.day.planned_at).toBeTruthy();
  expect(day.tasks).toHaveLength(1);
});

it('KPI số lượng tự tính tỷ lệ và cho phép vượt kế hoạch', async () => {
  const t = await value(`SELECT id::text v FROM k3_tasks LIMIT 1`);
  const updated = await value(`SELECT k3_task_update('${t}', 'doing', 8, NULL, '', '', '', '') v`) as { progress: number; status: string };
  expect(updated.progress).toBe(80);
  expect(updated.status).toBe('doing');
  const over = await value(`SELECT k3_task_update('${t}', 'doing', 12, NULL, '', '', '', '') v`) as { progress: number; kpi_actual: string };
  expect(over.progress).toBe(100); // tiến độ lưu tối đa 100, tỷ lệ 120% hiển thị từ actual/target
  expect(Number(over.kpi_actual)).toBe(12);
});

it('không nhận số âm và không cho sửa công việc người khác', async () => {
  await expect(db.query(`SELECT k3_task_save('{"work_date":"${today}","name":"X","kpi_target":-1}')`)).rejects.toThrow('không được âm');
  const t = await value(`SELECT id::text v FROM k3_tasks LIMIT 1`);
  await as(other);
  await expect(db.query(`SELECT k3_task_update('${t}', 'done', NULL, 100, '', '', '', '')`)).rejects.toThrow('người khác');
  await expect(db.query(`SELECT k3_task_delete('${t}')`)).rejects.toThrow('người khác');
  await as(staff);
});

it('giới hạn tối đa 3 mũi khoan theo cấu hình', async () => {
  for (let i = 1; i <= 3; i++) await value(`SELECT k3_task_save('{"work_date":"${today}","name":"Việc ${i}","is_focus":true}') v`);
  await expect(db.query(`SELECT k3_task_save('{"work_date":"${today}","name":"Việc 4","is_focus":true}')`)).rejects.toThrow('tối đa 3');
});

it('tổng kết bắt buộc VNGB cho việc chưa hoàn thành, không nhận chuỗi trống', async () => {
  await expect(db.query(`SELECT k3_summary_confirm('${today}')`)).rejects.toThrow('Vấn đề - Nguyên nhân - Giải pháp');
  const t = await value(`SELECT id::text v FROM k3_tasks WHERE name='Việc 1'`);
  await value(`SELECT k3_task_update('${t}', 'incomplete', NULL, 50, 'Khách không nghe máy', 'Gọi giờ nghỉ trưa', 'Gọi lại sáng mai', '') v`);
  const t2 = await value(`SELECT id::text v FROM k3_tasks WHERE name='Việc 2'`);
  await value(`SELECT k3_task_update('${t2}', 'done', NULL, 100, '', '', '', '') v`);
  const t3 = await value(`SELECT id::text v FROM k3_tasks WHERE name='Việc 3'`);
  await value(`SELECT k3_task_update('${t3}', 'done', NULL, 100, '', '', '', '') v`);
  const t0 = await value(`SELECT id::text v FROM k3_tasks WHERE kpi_target=10`);
  await value(`SELECT k3_task_update('${t0}', 'done', 12, NULL, '', '', '', '') v`);
  const day = await value(`SELECT k3_summary_confirm('${today}') v`) as { summarized_at: string };
  expect(day.summarized_at).toBeTruthy();
});

it('xóa công việc vẫn giữ lịch sử sự kiện', async () => {
  const t = await value(`SELECT id::text v FROM k3_tasks WHERE name='Việc 3'`);
  await value(`SELECT k3_task_delete('${t}') v`);
  const ev = await value(`SELECT count(*)::int v FROM k3_task_events WHERE action='delete'`);
  expect(ev).toBe(1);
  expect(await value(`SELECT count(*)::int v FROM k3_tasks WHERE name='Việc 3' AND deleted_at IS NULL`)).toBe(0);
});

it('quản lý xem đúng phạm vi, người ngoài không xem được', async () => {
  await as(manager);
  const team = await value(`SELECT k3_team_read('${today}') v`) as { user_id: string; total: number }[];
  expect(team.some((r) => r.user_id === staff)).toBe(true);
  expect(team.find((r) => r.user_id === staff)?.total).toBeGreaterThan(0);
  const detail = await value(`SELECT k3_user_day_read('${staff}', '${today}') v`) as { tasks: unknown[]; can_comment: boolean };
  expect(detail.tasks.length).toBeGreaterThan(0);
  expect(detail.can_comment).toBe(true);
  await as(outsider);
  await expect(db.query(`SELECT k3_team_read('${today}')`)).rejects.toThrow('phạm vi quản lý');
  await expect(db.query(`SELECT k3_user_day_read('${staff}', '${today}')`)).rejects.toThrow('không có quyền');
  await as(staff);
});

it('quản lý nhận xét trong phạm vi, nhân viên đọc được nhận xét', async () => {
  await as(manager);
  const dayId = await value(`SELECT id::text v FROM k3_days WHERE user_id='${staff}'`);
  await value(`SELECT k3_comment_save('${dayId}', NULL, 'Ưu tiên gọi lại khách sáng mai') v`);
  await as(staff);
  const day = await value(`SELECT k3_day_read('${today}') v`) as { comments: { body: string }[] };
  expect(day.comments[0]?.body).toBe('Ưu tiên gọi lại khách sáng mai');
});

it('không tạo 3K trùng và cho chuẩn bị ngày tương lai', async () => {
  await value(`SELECT k3_day_save('${today}', 'Cập nhật KG') v`);
  expect(await value(`SELECT count(*)::int v FROM k3_days WHERE user_id='${staff}' AND work_date='${today}'`)).toBe(1);
  await expect(db.query(`SELECT k3_day_save('${today.slice(0, 8)}99', 'x')`)).rejects.toThrow();
  expect((await value(`SELECT k3_day_save('2099-01-01', 'Chuẩn bị tương lai') v`) as { work_date: string }).work_date).toBe('2099-01-01');
});

it('cấu hình ghi lịch sử và không đổi dữ liệu lịch sử', async () => {
  await db.exec(`CREATE OR REPLACE FUNCTION private.sig_can(uuid, text) RETURNS boolean LANGUAGE sql AS $$SELECT $2='k3.settings' AND $1='${manager}'::uuid$$;`);
  await as(manager);
  await value(`SELECT k3_settings_save(true, '2020-01-01'::date, '08:30'::time, '17:30'::time, 2::smallint) v`);
  const logs = await value(`SELECT count(*)::int v FROM k3_settings_log`);
  expect(logs).toBe(2);
  expect(await value(`SELECT max_focus::int v FROM k3_settings`)).toBe(2);
  expect(await value(`SELECT count(*)::int v FROM k3_tasks WHERE user_id='${staff}' AND deleted_at IS NULL`)).toBe(3);
  await db.exec(`CREATE OR REPLACE FUNCTION private.sig_can(uuid, text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;`);
  await as(staff);
});
