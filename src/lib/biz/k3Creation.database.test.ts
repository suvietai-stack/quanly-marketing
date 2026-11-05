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
  const can = m0185.match(/CREATE OR REPLACE FUNCTION public\.k3_can[\s\S]*?\$function\$;/)?.[0]; if (!can) throw new Error('Missing permission function'); await db.exec(can);
  await as(manager);
  await val(`SELECT k3_settings_save(true, '2020-01-01'::date, '08:45'::time, '18:00'::time, 3::smallint) v`);
  await as(staff);
  await db.exec(`CREATE SCHEMA cron; CREATE FUNCTION cron.unschedule(text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$; CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE sql AS $$SELECT 1::bigint$$;`);
  for(const file of ['0197_k3_soft_delete_trash.sql','0198_k3_trash_read_guards.sql','0199_k3_trash_guard_goal_save.sql','0200_k3_trash_guard_action_plan.sql','0201_k3_trash_guard_kpi_task.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  for (const file of ['0202_k3_daily_kpi_result_foundation.sql','0203_k3_kpi_metric_and_configuration_guards.sql','0206_k3_result_privacy_and_configuration_fences.sql','0207_k3_configuration_module_and_legacy_history_guards.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`, 'utf8'));
  const contract = readFileSync('drizzle/migrations/0216_k3_ten_measurement_contract_and_review_safety.sql', 'utf8');
  await db.exec(contract.slice(0, contract.indexOf('COMMENT ON TABLE')));
  await db.exec(readFileSync('drizzle/migrations/0217_k3_measurement_configuration_validation.sql', 'utf8'));
  await db.exec(`CREATE FUNCTION private.k3_employee_day_source(uuid,date) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$; CREATE FUNCTION k3_kpi_day_read(date) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;`);
  const creation = readFileSync('drizzle/migrations/0220_k3_configured_creation_and_date_preview.sql', 'utf8');
  await db.exec(creation.slice(0, creation.indexOf(" def:=pg_get_functiondef('public.k3_kpi_result_read")) + 'END $patch$;');
  await db.exec(readFileSync('drizzle/migrations/0231_k3_creation_timeline_personal_drafts.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0232_k3_atomic_timeline_write_and_personal_execution.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0233_k3_trash_alias_and_retention_guards.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0234_k3_draft_purge_config_history_safety.sql', 'utf8'));
  const evaluator = readFileSync('drizzle/migrations/0218_k3_shared_ten_mode_evaluator.sql','utf8');
  await db.exec(evaluator.slice(0,evaluator.indexOf('CREATE FUNCTION private.k3_measure_rows')));
  await db.exec(readFileSync('drizzle/migrations/0235_k3_authoritative_automatic_states.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0236_k3_valid_save_and_legacy_state_guards.sql','utf8'));
}, 30000);

afterAll(() => db.close());


const payload = (extra: Record<string, unknown> = {}) => ({request_key:crypto.randomUUID(),creation_mode:'basic',name:'Soạn báo giá khách sạn Vinh Nghệ An',expected_result:'Có file báo giá',period_start:'2026-11-05',period_end:'2026-11-05',start_time:'09:30',due_time:'11:00',kpi:{measure:'binary'},...extra});
const create = (p: Record<string, unknown>) => val<{goal_id:string;duplicated:boolean}>(`SELECT k3_quick_create('${JSON.stringify(p)}') v`);
it('basic atomically creates exactly one KG + KF + KPI with inherited name and exact criterion',async()=>{
 const p=payload(); const r=await create(p); quickGoal=r.goal_id;
 expect(await val(`SELECT count(*)::int v FROM k3_actions WHERE goal_id='${r.goal_id}'`)).toBe(1);
 expect(await val(`SELECT count(*)::int v FROM k3_kpis WHERE action_id IN(SELECT id FROM k3_actions WHERE goal_id='${r.goal_id}')`)).toBe(1);
 expect(await val(`SELECT name v FROM k3_actions WHERE goal_id='${r.goal_id}'`)).toBe(p.name);
 expect(await val(`SELECT config->>'valid_condition' v FROM k3_kpis WHERE action_id IN(SELECT id FROM k3_actions WHERE goal_id='${r.goal_id}')`)).toBe('Có file báo giá');
 expect(await val(`SELECT inherit_timeline v FROM k3_actions WHERE goal_id='${r.goal_id}'`)).toBe(true);
 expect((await create(p)).goal_id).toBe(r.goal_id);
 expect(await val(`SELECT count(*)::int v FROM k3_goals WHERE request_key='${p.request_key}'`)).toBe(1);
});
it('09:30–11:00 stores minute times while blank time stays NULL',async()=>{
 expect(await val(`SELECT start_time::text v FROM k3_goals WHERE id='${quickGoal}'`)).toBe('09:30:00');
 const r=await create(payload({start_time:'',due_time:''}));
 expect(await val(`SELECT due_time v FROM k3_goals WHERE id='${r.goal_id}'`)).toBeNull();
 expect(await val(`SELECT private.k3_timepoint('2026-11-05',NULL,true)>'2026-11-05T23:59:59+07'::timestamptz v`)).toBe(true);
});
it('end before start rolls back every new entity',async()=>{
 const before=await val('SELECT count(*)::int v FROM k3_goals');
 await expect(create(payload({due_time:'09:00'}))).rejects.toThrow('trước');
 expect(await val('SELECT count(*)::int v FROM k3_goals')).toBe(before);
});
it('KF override outside KG range is rejected and inside range persists',async()=>{
 await expect(val(`SELECT k3_action_save('${JSON.stringify({goal_id:quickGoal,name:'Ngoài khoảng',request_key:crypto.randomUUID(),inherit_timeline:false,start_date:'2026-11-05',due_date:'2026-11-05',start_time:'08:30',due_time:'10:00'})}') v`)).rejects.toThrow('ngoài');
 const a=await val<{id:string}>(`SELECT k3_action_save('${JSON.stringify({goal_id:quickGoal,name:'Xin duyệt',request_key:crypto.randomUUID(),inherit_timeline:false,start_date:'2026-11-05',due_date:'2026-11-05',start_time:'10:00',due_time:'10:30'})}') v`);
 expect(await val(`SELECT due_time::text v FROM k3_actions WHERE id='${a.id}'`)).toBe('10:30:00');
});
it('weekday route has one KF, includes Monday and excludes Sunday',async()=>{
 const r=await create(payload({creation_mode:'advanced',period_end:'2026-11-30',start_time:'',due_time:'',kfs:[{name:'Chăm sóc đại lý',inherit_timeline:true,execution_schedule:{mode:'weekdays',weekdays:[1,2,3,4,5],start_time:'08:30',end_time:'10:00'},kpis:[{name:'Chăm sóc',measure:'binary',config:{valid_condition:'Đã chăm sóc'}}]}]}));
 const a=await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${r.goal_id}'`);
 expect(await val(`SELECT private.k3_action_on_date('${a}','2026-11-09') v`)).toBe(true);
 expect(await val(`SELECT private.k3_action_on_date('${a}','2026-11-08') v`)).toBe(false);
 expect(await val(`SELECT count(*)::int v FROM k3_actions WHERE goal_id='${r.goal_id}'`)).toBe(1);
});
it('Admin personal list excludes employees but scope list still includes them',async()=>{
 await as(manager);
 const personal=await val<{id:string}[]>("SELECT k3_goal_list('all','') v");
 expect(personal.some((g)=>g.id===quickGoal)).toBe(false);
 const scope=await val<{id:string}[]>("SELECT k3_goal_list('scope','') v");
 expect(scope.some((g)=>g.id===quickGoal)).toBe(true);
 await as(staff);
});
it('delete draft soft-deletes structure and restore preserves exact IDs',async()=>{
 const r=await create(payload());
 const a=await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${r.goal_id}'`);
 const k=await val<string>(`SELECT id v FROM k3_kpis WHERE action_id='${a}'`);
 await val(`SELECT k3_draft_delete('goal','${r.goal_id}') v`);
 expect(await val(`SELECT deleted_at IS NOT NULL v FROM k3_goals WHERE id='${r.goal_id}'`)).toBe(true);
 expect(await val(`SELECT deleted_at IS NOT NULL v FROM k3_actions WHERE id='${a}'`)).toBe(true);
 await val(`SELECT k3_restore('goal','${r.goal_id}') v`);
 expect(await val(`SELECT deleted_at IS NULL v FROM k3_actions WHERE id='${a}'`)).toBe(true);
 expect(await val(`SELECT action_id v FROM k3_kpis WHERE id='${k}'`)).toBe(a);
});
it('restore deadline is exactly 15×24 hours, not scheduler-dependent',async()=>{
 const r=await create(payload()); await val(`SELECT k3_draft_delete('goal','${r.goal_id}') v`);
 await db.exec(`UPDATE k3_goals SET deleted_at=now()-interval '360 hours' WHERE id='${r.goal_id}'`);
 await expect(val(`SELECT k3_restore('goal','${r.goal_id}') v`)).rejects.toThrow('15 ngày');
});
it('employee cannot delete another owner draft',async()=>{
 await as(other);await expect(val(`SELECT k3_draft_delete('goal','${quickGoal}') v`)).rejects.toThrow('Admin');await as(staff);
});
it('protected result prevents simple draft deletion',async()=>{
 const r=await create(payload());const a=await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${r.goal_id}'`);const k=await val<string>(`SELECT id v FROM k3_kpis WHERE action_id='${a}'`);
 await db.exec(`INSERT INTO k3_kpi_results(kpi_id,goal_id,action_id,user_id,work_date,value,updated_by) VALUES('${k}','${r.goal_id}','${a}','${staff}','2026-11-05',1,'${staff}')`);
 await expect(val(`SELECT k3_draft_delete('goal','${r.goal_id}') v`)).rejects.toThrow('bảo vệ');
});
it('expired draft purge removes children with config history without orphaning', async () => {
 const r = await create(payload()); const a = await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${r.goal_id}'`);
 expect(await val(`SELECT count(*)::int v FROM k3_kpi_config_versions WHERE kpi_id IN(SELECT id FROM k3_kpis WHERE action_id='${a}')`)).toBe(1);
 await val(`SELECT k3_draft_delete('goal','${r.goal_id}') v`);
 await db.exec(`UPDATE k3_goals SET deleted_at=now()-interval '361 hours' WHERE id='${r.goal_id}'`);
 await as(manager); await val('SELECT k3_purge_expired(100) v'); await as(staff);
 expect(await val(`SELECT count(*)::int v FROM k3_goals WHERE id='${r.goal_id}'`)).toBe(0);
 expect(await val(`SELECT count(*)::int v FROM k3_actions WHERE id='${a}'`)).toBe(0);
});

it('valid Basic save automatically starts at 09:00 and completes KG/KF together from KPI', async () => {
 await as(staff); const r=await create(payload({start_time:'09:00',save_valid:true}));
 const a=await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${r.goal_id}'`);
 const k=await val<string>(`SELECT id v FROM k3_kpis WHERE action_id='${a}'`);
 const state=(kind:string,id:string,time:string)=>val<Record<string,unknown>>(`SELECT private.k3_entity_state('${kind}','${id}','2026-11-05T${time}+07') v`);
 expect(await state('goal',r.goal_id,'08:00')).toMatchObject({status:'not_started'});
 expect(await state('action',a,'09:00')).toMatchObject({status:'in_progress',kpi_met:0});
 expect(await state('action',a,'13:00')).toMatchObject({status:'in_progress',overdue:true,overdue_seconds:7200});
 await db.exec(`INSERT INTO k3_kpi_results(kpi_id,goal_id,action_id,user_id,work_date,value,updated_by,updated_at) VALUES('${k}','${r.goal_id}','${a}','${staff}','2026-11-05',1,'${staff}','2026-11-05T10:30+07')`);
 expect(await state('action',a,'10:30')).toMatchObject({status:'done',overdue:false});
 expect(await state('goal',r.goal_id,'11:00')).toMatchObject({status:'done',kf_done:1,kf_total:1});
 await db.exec(`UPDATE k3_kpi_results SET value=0,updated_at='2026-11-05T10:40+07' WHERE kpi_id='${k}'`);
 expect(await state('goal',r.goal_id,'11:00')).toMatchObject({status:'in_progress',kf_done:0});
});
it('legacy Done cannot force completion and ordinary status RPCs are blocked', async () => {
 const r=await create(payload({save_valid:true}));
 const a=await val<string>(`SELECT id v FROM k3_actions WHERE goal_id='${r.goal_id}'`);
 await db.exec(`UPDATE k3_goals SET status='done' WHERE id='${r.goal_id}'; UPDATE k3_actions SET status='done' WHERE id='${a}'`);
 expect(await val(`SELECT private.k3_entity_state('goal','${r.goal_id}','2026-11-05T10:00+07')->>'status' v`)).toBe('in_progress');
 await expect(val(`SELECT k3_goal_status('${r.goal_id}','done',NULL,1) v`)).rejects.toThrow('tự động');
 await expect(val(`SELECT k3_action_status('${a}','in_progress',NULL,NULL,NULL,1) v`)).rejects.toThrow('tự động');
});
it('date-only deadline is end of Vietnam day and drafts remain excluded',async()=>{
 const r=await create(payload({start_time:'',due_time:''}));
 expect(await val(`SELECT private.k3_entity_state('goal','${r.goal_id}','2026-11-05T13:00+07')->>'status' v`)).toBe('draft');
 await val(`SELECT k3_goal_activate('${r.goal_id}',1) v`);
 expect(await val(`SELECT private.k3_goal_overdue('${r.goal_id}','2026-11-05T23:59:59+07') v`)).toBe(false);
 expect(await val(`SELECT private.k3_goal_overdue('${r.goal_id}','2026-11-06T00:00+07') v`)).toBe(true);
});
