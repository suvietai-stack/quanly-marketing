import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
const user = '10000000-0000-0000-0000-000000000001';
const goal = '10000000-0000-0000-0000-000000000002';
const action = '10000000-0000-0000-0000-000000000003';
const kpi = '10000000-0000-0000-0000-000000000004';
async function value<T>(sql: string) { return (await db.query<{v:T}>(sql)).rows[0]?.v; }
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth; CREATE SCHEMA private; CREATE SCHEMA cron; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
  CREATE TABLE cron.job(jobname text PRIMARY KEY,schedule text,command text);
  CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE plpgsql AS $$BEGIN INSERT INTO cron.job VALUES($1,$2,$3) ON CONFLICT(jobname) DO UPDATE SET schedule=$2,command=$3; RETURN 1; END$$;
  CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
  INSERT INTO profiles VALUES('${user}','Sale A','Đang hoạt động');
  CREATE TABLE biz_systems(id uuid PRIMARY KEY,name text);
  CREATE TABLE biz_departments(id uuid PRIMARY KEY,name text,system_id uuid);
  CREATE TABLE biz_appointments(user_id uuid,status text,started_at timestamptz,ended_at timestamptz);
  CREATE TABLE k3_settings(id boolean,enabled boolean,effective_from date);
  INSERT INTO k3_settings VALUES(true,true,'2026-01-01');
  CREATE TABLE k3_settings_log(id bigint GENERATED ALWAYS AS IDENTITY,changed_by uuid,snapshot jsonb);
  CREATE TABLE k3_goals(id uuid PRIMARY KEY,user_id uuid,period_start date,period_end date,status text,deleted_at timestamptz,department_id uuid);
  CREATE TABLE k3_actions(id uuid PRIMARY KEY,goal_id uuid,assignee_id uuid,start_date date,status text,deleted_at timestamptz,name text,due_date date);
  CREATE TABLE k3_kpis(id uuid PRIMARY KEY,goal_id uuid,action_id uuid,kind text,target numeric,name text);
  CREATE TABLE k3_plan_events(user_id uuid,goal_id uuid,action_id uuid,actor_id uuid,action text,detail jsonb);
  CREATE TABLE k3_tasks(kpi_id uuid,action_id uuid,kpi_actual numeric);
  CREATE FUNCTION biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
  CREATE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
  CREATE FUNCTION k3_goal_visible(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
  CREATE FUNCTION private.k3_action_worker_ok(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
  CREATE FUNCTION private.k3_write_guard(date) RETURNS void LANGUAGE plpgsql AS $$BEGIN RETURN; END$$;
  CREATE FUNCTION private.k3_goal_manage_ok(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
  CREATE FUNCTION biz_scope_ok(uuid,uuid,uuid,timestamptz) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
  CREATE FUNCTION biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$;
  CREATE FUNCTION private.k3_entity_metric(text,uuid) RETURNS jsonb LANGUAGE sql AS $$SELECT '{"status":"in_progress"}'::jsonb$$;
  CREATE FUNCTION k3_kpi_day_read(_date date) RETURNS jsonb LANGUAGE plpgsql AS $$DECLARE uid uuid:=auth.uid();rows jsonb:='[]';c record;BEGIN SELECT * INTO c FROM k3_kpi_day_confirmations WHERE user_id=uid AND work_date=_date ORDER BY confirmed_at DESC LIMIT 1; RETURN jsonb_build_object('date',_date,'confirmed_at',c.confirmed_at,'needs_confirmation',c.id IS NOT NULL AND c.snapshot<>rows);END$$;
  INSERT INTO k3_goals VALUES('${goal}','${user}','2026-01-01','2099-12-31','in_progress',NULL,NULL);
  INSERT INTO k3_actions VALUES('${action}','${goal}','${user}','2026-01-01','in_progress',NULL,'KF A','2099-12-31');
  INSERT INTO k3_kpis VALUES('${kpi}',NULL,'${action}','cumulative',200,'Đại lý');SET test.uid='${user}';`);
  await db.exec(readFileSync('drizzle/migrations/0202_k3_daily_kpi_result_foundation.sql','utf8'));
  await db.exec(`ALTER TABLE k3_kpis ALTER COLUMN id SET DEFAULT gen_random_uuid(),ADD COLUMN request_key uuid,ADD COLUMN unit text,ADD COLUMN created_by uuid,ADD COLUMN updated_at timestamptz,ADD COLUMN manual_actual numeric;`);
  for(const file of ['0203_k3_kpi_metric_and_configuration_guards.sql','0206_k3_result_privacy_and_configuration_fences.sql','0207_k3_configuration_module_and_legacy_history_guards.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`,'utf8'));
  await db.exec(`CREATE FUNCTION private.k3_goal_has_official(_goal uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM k3_tasks WHERE false)$$;CREATE FUNCTION private.k3_action_has_official(_action uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM k3_tasks WHERE false)$$;`);
  for(const file of ['0208_k3_canonical_official_delete_protection.sql','0209_k3_auto_close_and_zalo_reports.sql','0210_k3_system_close_history_safety.sql']) await db.exec(readFileSync(`drizzle/migrations/${file}`,'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0211_k3_scoped_measured_period_reads.sql','utf8'));
  await db.exec(`CREATE TABLE private.k3_kpi_upgrade_backups(id uuid PRIMARY KEY,created_at timestamptz,created_by uuid,snapshot jsonb,counts jsonb);
  CREATE TABLE k3_days(id uuid PRIMARY KEY,summarized_at timestamptz);
  ALTER TABLE k3_tasks ADD COLUMN id uuid,ADD COLUMN day_id uuid,ADD COLUMN user_id uuid,ADD COLUMN deleted_at timestamptz,ADD COLUMN deleted_by uuid;
  CREATE TABLE k3_summary_versions(snapshot jsonb);CREATE TABLE k3_period_summaries(snapshot jsonb);
  CREATE TABLE k3_task_events(day_id uuid,task_id uuid,actor_id uuid,action text,detail jsonb);
  CREATE FUNCTION k3_purge_expired(integer) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;`);
  await db.exec(readFileSync('drizzle/migrations/0212_k3_verified_legacy_task_archive.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0213_k3_existing_confirmations_close_fences.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0214_k3_archive_backup_alias_guard.sql','utf8'));
},30000);
afterAll(()=>db.close());
it('default automatic close is 18:00 Vietnam and Zalo remains off at 18:05',async()=>{
  expect(await value('SELECT k3_automation_read() v')).toMatchObject({auto_close:true,close_time:'18:00:00',send_time:'18:05:00',zalo_enabled:false});
  expect(await value("SELECT schedule v FROM cron.job WHERE jobname='k3-auto-close'")).toBe('0 11 * * *');
});
it('saving schedules keeps one job and converts Vietnam times across midnight',async()=>{
  for(const [time,expected] of [['06:00','0 23 * * *'],['18:00','0 11 * * *']]) {
    await db.query(`SELECT k3_automation_save('${JSON.stringify({auto_close:true,close_time:time,send_time:'18:05',scope_kind:'all',zalo_enabled:false})}')`);
    expect(await value("SELECT schedule v FROM cron.job WHERE jobname='k3-auto-close'")).toBe(expected);
  }
  expect(await value('SELECT count(*)::int v FROM cron.job')).toBe(1);
});
it('auto close freezes 20 without impersonating an employee and is idempotent',async()=>{
  await db.query(`SELECT k3_kpi_result_save('${JSON.stringify({kpi_id:kpi,work_date:'2026-11-01',value:20,revision:0,request_key:crypto.randomUUID()})}')`);
  await db.query(`SELECT private.k3_close_one('${user}','2026-11-01','auto')`);
  await db.query(`SELECT private.k3_close_one('${user}','2026-11-01','auto')`);
  expect(await value('SELECT count(*)::int v FROM k3_daily_closes')).toBe(1);
  expect(await value('SELECT actor_id v FROM k3_daily_closes')).toBeNull();
  expect(await value('SELECT count(*)::int v FROM k3_kpi_day_confirmations')).toBe(0);
  expect(Number(await value(`SELECT private.k3_result_metric('${kpi}',true)->>'actual' v`))).toBe(20);
  expect(await value(`SELECT private.k3_goal_has_official('${goal}') v`)).toBe(true);
});
it('after close a correction needs a reason and reconfirmation while the old 20 remains',async()=>{
  const payload={kpi_id:kpi,work_date:'2026-11-01',value:30,revision:1,request_key:crypto.randomUUID()};
  await expect(db.query(`SELECT k3_kpi_result_save('${JSON.stringify(payload)}')`)).rejects.toThrow('lý do');
  await db.query(`SELECT k3_kpi_result_save('${JSON.stringify({...payload,correction_reason:'Đối soát cuối ngày'})}')`);
  expect(await value(`SELECT private.k3_result_metric('${kpi}',true)->>'actual' v`)).toBeNull();
  expect(await value("SELECT snapshot->'results'->0->>'value' v FROM k3_daily_closes")).toBe('20');
  await db.query("SELECT k3_kpi_day_confirm('2026-11-01')");
  expect(Number(await value(`SELECT private.k3_result_metric('${kpi}',true)->>'actual' v`))).toBe(30);
});
it('Zalo send claims cannot be replayed or completed by another lease',async()=>{
  await db.exec("UPDATE k3_automation_config SET zalo_enabled=true,group_id='group';INSERT INTO k3_zalo_reports(work_date,group_id,scope_kind,snapshot) VALUES('2026-11-01','group','all','[]');");
  const claims=await db.query<{id:string;lease:string}>('SELECT * FROM k3_zalo_report_claim()');
  expect(claims.rows.length).toBe(1);
  expect((await db.query('SELECT * FROM k3_zalo_report_claim()')).rows.length).toBe(0);
  const r=claims.rows[0];if(!r) throw new Error('Missing claim');
  expect(await value(`SELECT k3_zalo_report_finish('${r.id}','${crypto.randomUUID()}','sent') v`)).toBe(false);
  expect(await value(`SELECT k3_zalo_report_finish('${r.id}','${r.lease}','unknown') v`)).toBe(true);
  expect((await db.query('SELECT * FROM k3_zalo_report_claim()')).rows.length).toBe(0);
});
it('period metrics only count dates in the requested range',async()=>{
  expect(Number(await value(`SELECT private.k3_result_metric_range('${kpi}',true,'2026-11-01','2026-11-01','${user}')->>'actual' v`))).toBe(30);
  expect(await value(`SELECT private.k3_result_metric_range('${kpi}',true,'2026-11-02','2026-11-02','${user}')->>'actual' v`)).toBeNull();
});
it('legacy archive requires an exact verified backup and expires after 15 days',async()=>{
  const tid=crypto.randomUUID(),day=crypto.randomUUID(),backup=crypto.randomUUID();
  await db.exec(`INSERT INTO k3_days VALUES('${day}',NULL);INSERT INTO k3_tasks(id,day_id,user_id,kpi_actual) VALUES('${tid}','${day}','${user}',7);`);
  await expect(db.query(`SELECT k3_legacy_task_archive('${tid}','Thiếu KPI')`)).rejects.toThrow('bản sao');
  await db.exec(`INSERT INTO private.k3_kpi_upgrade_backups VALUES('${backup}',now(),'${user}',jsonb_build_object('tasks',(SELECT jsonb_agg(to_jsonb(t)) FROM k3_tasks t)),jsonb_build_object('tasks',(SELECT count(*) FROM k3_tasks)));`);
  await db.query(`SELECT k3_legacy_task_archive('${tid}','Thiếu KPI')`);
  expect(await value(`SELECT extract(epoch FROM purge_at-archived_at)::int v FROM k3_data_reviews WHERE record_id='${tid}'`)).toBe(15*24*60*60);
  expect(Number(await value(`SELECT kpi_actual v FROM k3_tasks WHERE id='${tid}'`))).toBe(7);
  const rid=await value<string>(`SELECT id v FROM k3_data_reviews WHERE record_id='${tid}'`);
  await db.query(`SELECT k3_legacy_task_restore('${rid}')`);
  expect(await value(`SELECT deleted_at v FROM k3_tasks WHERE id='${tid}'`)).toBeNull();
});
it('official legacy history cannot be placed on a 15-day deletion clock',async()=>{
  const tid=crypto.randomUUID(),day=crypto.randomUUID();
  await db.exec(`INSERT INTO k3_days VALUES('${day}',now());INSERT INTO k3_tasks(id,day_id,user_id) VALUES('${tid}','${day}','${user}');`);
  await expect(db.query(`SELECT k3_legacy_task_archive('${tid}','Thiếu KPI')`)).rejects.toThrow('chốt sổ lịch sử');
  expect(await value(`SELECT deleted_at v FROM k3_tasks WHERE id='${tid}'`)).toBeNull();
});
it('expired archive purges only the unconfirmed source and retains backup and audit',async()=>{
  const tid=crypto.randomUUID(),day=crypto.randomUUID(),backup=crypto.randomUUID();
  await db.exec(`INSERT INTO k3_days VALUES('${day}',NULL);INSERT INTO k3_tasks(id,day_id,user_id) VALUES('${tid}','${day}','${user}');
  INSERT INTO private.k3_kpi_upgrade_backups VALUES('${backup}',now(),'${user}',jsonb_build_object('tasks',(SELECT jsonb_agg(to_jsonb(t)) FROM k3_tasks t)),jsonb_build_object('tasks',(SELECT count(*) FROM k3_tasks)));`);
  await db.query(`SELECT k3_legacy_task_archive('${tid}','Thiếu cấu trúc')`);
  expect(await value('SELECT private.k3_review_purge_expired() v')).toBe(0);
  await db.exec(`UPDATE k3_data_reviews SET purge_at=now()-interval '1 second' WHERE record_id='${tid}';`);
  expect(await value('SELECT private.k3_review_purge_expired() v')).toBe(1);
  expect(await value(`SELECT count(*)::int v FROM k3_tasks WHERE id='${tid}'`)).toBe(0);
  expect(await value(`SELECT count(*)::int v FROM private.k3_kpi_upgrade_backups WHERE id='${backup}'`)).toBe(1);
  expect(await value(`SELECT status v FROM k3_data_reviews WHERE record_id='${tid}'`)).toBe('delete_confirmed');
});