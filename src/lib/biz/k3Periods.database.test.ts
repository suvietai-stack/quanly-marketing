import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll,afterAll,expect,it } from 'vitest';
const db=new PGlite();const staff='00000000-0000-0000-0000-0000000000a1';const other='00000000-0000-0000-0000-0000000000a2';const manager='00000000-0000-0000-0000-0000000000a3';const dept='40000000-0000-0000-0000-0000000000a1';
async function val<T=unknown>(sql:string){return (await db.query<{v:T}>(sql)).rows[0]?.v as T;}
const as=async(uid:string)=>db.exec(`SET test.uid='${uid}'`);
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let goal:string;let action:string;let task:string;
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT current_setting('test.uid')::uuid$$;
 CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE biz_departments(id uuid PRIMARY KEY,name text);CREATE TABLE biz_department_members(user_id uuid,department_id uuid);
 CREATE FUNCTION public.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
 CREATE FUNCTION private.sig_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid AND $2='k3.settings'$$;
 CREATE FUNCTION public.biz_participant(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM biz_department_members WHERE user_id=$1)$$;
 CREATE FUNCTION public.biz_manager(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid$$;
 CREATE FUNCTION public.biz_all_scope(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
 CREATE FUNCTION public.biz_scope_ok(uuid,uuid,uuid,timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${manager}'::uuid AND $2='${staff}'::uuid AND $3='${dept}'::uuid$$;
 CREATE FUNCTION public.biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT department_id FROM biz_department_members WHERE user_id=$1 LIMIT 1$$;
 INSERT INTO profiles VALUES('${staff}','A','Đang hoạt động'),('${other}','B','Đang hoạt động'),('${manager}','Quản lý','Đang hoạt động');INSERT INTO biz_departments VALUES('${dept}','Phòng cũ');INSERT INTO biz_department_members VALUES('${staff}','${dept}'),('${other}','${dept}');SET test.uid='${staff}';`);
 for(const file of ['0173_k3_daily_management_phase1.sql','0174_k3_daily_integrity_and_summary_versions.sql','0175_k3_period_entities.sql','0176_k3_period_writes_and_task_links.sql','0177_k3_period_reads_summaries_scope.sql','0178_k3_summary_semantics_and_deadline_readback.sql','0179_k3_unscheduled_creation_and_scope_fences.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`,'utf8'));
 await as(manager);await val(`SELECT k3_settings_save(true,'2020-01-01','08:45','18:00',3::smallint) v`);
 await val(`SELECT k3_period_settings_save('{"week_enabled":true,"month_enabled":true,"period_effective_from":"2020-01-01"}') v`);await as(staff);
},30000);afterAll(()=>db.close());
it('tạo KG tuần và gửi lặp không nhân đôi',async()=>{
 const payload=`{"name":"KG Tuần","period_type":"week","period_start":"${today}","request_key":"10000000-0000-0000-0000-000000000001"}`;
 const g=await val<{id:string}>(`SELECT k3_goal_save('${payload}') v`);goal=g.id;
 expect((await val<{id:string}>(`SELECT k3_goal_save('${payload}') v`)).id).toBe(goal);
 expect(await val(`SELECT count(*)::int v FROM k3_goals`)).toBe(1);
});
it('tạo KG tháng',async()=>{const g=await val<{period_type:string}>(`SELECT k3_goal_save('{"name":"KG Tháng","period_type":"month","period_start":"${today}","request_key":"10000000-0000-0000-0000-000000000002"}') v`);expect(g.period_type).toBe('month')});
it('KF thuộc KG và giữ KPI 10 khách',async()=>{const a=await val<{id:string;kpi_target:number}>(`SELECT k3_action_save('{"goal_id":"${goal}","name":"Gọi khách","kpi_target":10,"kpi_unit":"khách","request_key":"20000000-0000-0000-0000-000000000001"}') v`);action=a.id;expect(Number(a.kpi_target)).toBe(10)});
it('tạo việc từ tuần chỉ một nguồn, hiện đúng ngày',async()=>{
 const p=`{"name":"Gọi 10 khách","action_id":"${action}","work_date":"${today}","kpi_target":10,"kpi_unit":"khách","request_key":"30000000-0000-0000-0000-000000000001"}`;
 const t=await val<{id:string}>(`SELECT k3_plan_task_save('${p}') v`);task=t.id;expect((await val<{id:string}>(`SELECT k3_plan_task_save('${p}') v`)).id).toBe(task);
 expect((await val<{tasks:{id:string}[]}>(`SELECT k3_day_read('${today}') v`)).tasks.filter(t=>t.id===task)).toHaveLength(1);
});
it('cập nhật ngày 8/10 đồng bộ tuần và tháng 80%',async()=>{
 await val(`SELECT k3_task_update('${task}','doing',8,NULL,'','','','') v`);
 for(const type of ['week','month']){const r=await val<{tasks:{id:string;progress:number;kpi_actual:number}[]}>(`SELECT k3_period_read('${type}','${today}') v`);expect(r.tasks.find(t=>t.id===task)?.progress).toBe(80);expect(Number(r.tasks.find(t=>t.id===task)?.kpi_actual)).toBe(8)}
});
it('không cho hoàn thành dưới KPI và kết thúc chưa đạt có VNGB',async()=>{
 await expect(db.query(`SELECT k3_task_update('${task}','done',8,NULL,'','','','')`)).rejects.toThrow('Chưa đạt');
 await expect(db.query(`SELECT k3_task_update('${task}','incomplete',8,NULL,'','','','')`)).rejects.toThrow('Vấn đề');
 expect((await val<{status:string}>(`SELECT k3_task_update('${task}','incomplete',8,NULL,'Khách bận','Sai giờ','Gọi lại','') v`)).status).toBe('incomplete');
});
it('sửa sai ngày không tạo thêm ngày hay audit sai',async()=>{
 const count=await val(`SELECT count(*)::int v FROM k3_days`);
 await expect(db.query(`SELECT k3_task_save('{"id":"${task}","work_date":"2099-01-01","name":"Sai ngày"}')`)).rejects.toThrow('ngày gốc');
 expect(await val(`SELECT count(*)::int v FROM k3_days`)).toBe(count);
});
it('chống ghi đè phiên bản cũ',async()=>{await expect(db.query(`SELECT k3_task_save('{"id":"${task}","revision":0,"name":"Cũ"}')`)).rejects.toThrow('nơi khác')});
it('sửa sau tổng kết cần xác nhận lại, giữ snapshot và timestamp đầu',async()=>{
 const d=await val<{summarized_at:string;data_revision:number;confirmed_revision:number}>(`SELECT k3_summary_confirm('${today}') v`);
 await val(`SELECT k3_task_update('${task}','incomplete',7,NULL,'Khách bận','Sai giờ','Gọi lại','') v`);
 const r=await val<{day:{data_revision:number;confirmed_revision:number}}>(`SELECT k3_day_read('${today}') v`);expect(r.day.data_revision).toBeGreaterThan(r.day.confirmed_revision);
 const reconfirm=await val<{summarized_at:string;data_revision:number;confirmed_revision:number}>(`SELECT k3_summary_confirm('${today}') v`);expect(reconfirm.summarized_at).toBe(d.summarized_at);expect(reconfirm.confirmed_revision).toBe(reconfirm.data_revision);
 expect(await val(`SELECT count(*)::int v FROM k3_summary_versions`)).toBe(2);
});
it('nhận xét không làm mất hiệu lực tổng kết và từ chối sai task/day',async()=>{
 const id=await val<string>(`SELECT id::text v FROM k3_days WHERE work_date='${today}' AND user_id='${staff}'`);
 await as(manager);await val(`SELECT k3_comment_save('${id}','${task}','Nhận xét') v`);await as(staff);
 const d=await val<{day:{data_revision:number;confirmed_revision:number}}>(`SELECT k3_day_read('${today}') v`);expect(d.day.data_revision).toBe(d.day.confirmed_revision);
 await val(`SELECT k3_day_save('2099-01-01','Tương lai') v`);const future=await val<string>(`SELECT id::text v FROM k3_days WHERE work_date='2099-01-01'`);
 await as(manager);await expect(db.query(`SELECT k3_comment_save('${future}','${task}','Sai')`)).rejects.toThrow('đúng nhân viên');await as(staff);
});
it('chưa xếp lịch không xuất hiện ngày, xếp lịch giữ cùng ID',async()=>{
 const t=await val<{id:string;revision:number;is_unscheduled:boolean}>(`SELECT k3_plan_task_save('{"name":"Chưa xếp","action_id":"${action}","request_key":"30000000-0000-0000-0000-000000000002"}') v`);
 expect(t.is_unscheduled).toBe(true);expect((await val<{tasks:{id:string}[]}>(`SELECT k3_day_read('${today}') v`)).tasks.some(x=>x.id===t.id)).toBe(false);
 const before=await val(`SELECT count(*)::int v FROM k3_tasks`);
 expect((await val<{id:string}>(`SELECT k3_task_schedule('${t.id}','${today}',${t.revision}) v`)).id).toBe(t.id);expect(await val(`SELECT count(*)::int v FROM k3_tasks`)).toBe(before);
});
it('nhân viên không sửa/xem người khác, quản lý không sửa hộ',async()=>{
 await as(other);await expect(db.query(`SELECT k3_period_read('week','${today}','${staff}')`)).rejects.toThrow('không có quyền');await expect(db.query(`SELECT k3_goal_save('{"id":"${goal}","name":"Sai","revision":0}')`)).rejects.toThrow('người khác');await expect(db.query(`SELECT k3_task_schedule('${task}','${today}',1)`)).rejects.toThrow('người khác');
 await as(manager);expect((await val<{goals:unknown[]}>(`SELECT k3_period_read('week','${today}','${staff}') v`)).goals.length).toBeGreaterThan(0);await expect(db.query(`SELECT k3_task_update('${task}','done',10,NULL,'','','','')`)).rejects.toThrow('người khác');await as(staff);
});
it('khóa module chặn mọi ghi thường, vẫn đọc lịch sử',async()=>{
 await as(manager);await val(`SELECT k3_settings_save(false,'2020-01-01','08:45','18:00',3::smallint) v`);await as(staff);
 await expect(db.query(`SELECT k3_task_update('${task}','doing',8,NULL,'','','','')`)).rejects.toThrow('tạm khóa');await expect(db.query(`SELECT k3_task_delete('${task}')`)).rejects.toThrow('tạm khóa');await expect(db.query(`SELECT k3_summary_confirm('${today}')`)).rejects.toThrow('tạm khóa');
 expect((await val<{tasks:unknown[]}>(`SELECT k3_period_read('week','${today}') v`)).tasks.length).toBeGreaterThan(0);
 await as(manager);await val(`SELECT k3_settings_save(true,'2020-01-01','08:45','18:00',3::smallint) v`);await as(staff);
});
it('tuần giao năm tính đúng lịch, tháng chỉ đọc việc đúng tháng',async()=>{
 expect(await val(`SELECT k3_period_start('week','2027-01-01')::text v`)).toBe('2026-12-28');expect(await val(`SELECT k3_period_end('week','2027-01-01')::text v`)).toBe('2027-01-03');
 for(const dt of ['2026-12-31','2027-01-01'])await val(`SELECT k3_task_save('{"name":"Việc giao năm","work_date":"${dt}","kpi_target":10,"kpi_actual":10,"kpi_unit":"cuộc gọi","status":"done"}') v`);
 expect((await val<{tasks:unknown[]}>(`SELECT k3_period_read('week','2027-01-01') v`)).tasks).toHaveLength(2);
 expect((await val<{tasks:unknown[]}>(`SELECT k3_period_read('month','2026-12-01') v`)).tasks).toHaveLength(1);
 expect((await val<{tasks:unknown[]}>(`SELECT k3_period_read('month','2027-01-01') v`)).tasks).toHaveLength(1);
});
it('dữ liệu lịch sử giữ đơn vị cũ sau chuyển phòng',async()=>{
 await db.exec(`UPDATE biz_department_members SET department_id=NULL WHERE user_id='${staff}'`);await as(manager);
 const read=await val<{tasks:{id:string}[]}>(`SELECT k3_period_read('week','${today}','${staff}') v`);expect(read.tasks.some(t=>t.id===task)).toBe(true);
 expect(await val(`SELECT department_id::text v FROM k3_days WHERE work_date='${today}' AND user_id='${staff}'`)).toBe(dept);await as(staff);
});
it('tổng kết tuần/tháng giữ phiên bản, cập nhật kết quả cần xác nhận lại',async()=>{
 await db.exec(`UPDATE biz_department_members SET department_id='${dept}' WHERE user_id='${staff}'`);
 const t=await val<{id:string}>(`SELECT k3_task_save('{"name":"Kết quả kỳ cũ","work_date":"2020-02-10","kpi_target":10,"kpi_actual":10,"kpi_unit":"khách","status":"done"}') v`);
 for(const type of ['week','month'])await val(`SELECT k3_period_summary_confirm('${type}','2020-02-10','Tổng kết thật theo công việc') v`);
 await val(`SELECT k3_task_update('${t.id}','doing',8,NULL,'Thiếu 2 khách','Khách bận','Gọi bổ sung','') v`);
 for(const type of ['week','month']) {
  const before=await val<{needs_confirmation:boolean}>(`SELECT k3_period_read('${type}','2020-02-10') v`);expect(before.needs_confirmation).toBe(true);
  await val(`SELECT k3_period_summary_confirm('${type}','2020-02-10','Xác nhận lại') v`);
  const after=await val<{summaries:unknown[];needs_confirmation:boolean}>(`SELECT k3_period_read('${type}','2020-02-10') v`);expect(after.summaries).toHaveLength(2);expect(after.needs_confirmation).toBe(false);
 }
});
it('nhận xét tuần không vô hiệu tổng kết',async()=>{
 await as(manager);await val(`SELECT k3_period_comment_save('${staff}','week','2020-02-10','Hỗ trợ bổ sung') v`);await as(staff);
 expect((await val<{needs_confirmation:boolean}>(`SELECT k3_period_read('week','2020-02-10') v`)).needs_confirmation).toBe(false);
});
it('deadline trống không đánh dấu trễ, cấu hình đầy đủ tính đúng giờ VN',async()=>{
 expect((await val<{plan_deadline:string|null}>(`SELECT k3_period_read('week','${today}') v`)).plan_deadline).toBeNull();
 await as(manager);await val(`SELECT k3_period_settings_save('{"week_enabled":true,"month_enabled":true,"period_effective_from":"2020-01-01","period_deadlines":{"week_plan":{"offset":0,"time":"08:45","effective_from":"2020-01-01"}}}') v`);await as(staff);
 const future=await val<{plan_deadline:string}>(`SELECT k3_period_read('week','2099-01-05') v`);expect(future.plan_deadline).toContain('01:45:00');
});
it('link tài liệu từ chối javascript',async()=>{
 await expect(db.query(`SELECT k3_task_save('{"name":"Link sai","work_date":"${today}","links":[{"url":"javascript:alert(1)"}]}')`)).rejects.toThrow('https');
});