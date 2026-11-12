import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';
const db = new PGlite();
const user='10000000-0000-0000-0000-000000000001';
const goal='20000000-0000-0000-0000-000000000001';
const action='30000000-0000-0000-0000-000000000001';
async function val<T>(sql:string) { return (await db.query<{v:T}>(sql)).rows[0]?.v; }
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA private;CREATE SCHEMA auth;CREATE SCHEMA cron;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT '${user}'::uuid$$;
 CREATE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
 CREATE FUNCTION biz_participant(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
 CREATE FUNCTION biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
 CREATE FUNCTION biz_scope_ok(uuid,uuid,uuid,timestamptz) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
 CREATE FUNCTION biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$;
 CREATE TABLE profiles(id uuid,full_name text,status text);INSERT INTO profiles VALUES('${user}','Sale','Đang hoạt động');
 CREATE TABLE biz_departments(id uuid,name text);
 CREATE TABLE k3_settings(id boolean,enabled boolean,effective_from date,plan_by time,summary_by time);INSERT INTO k3_settings VALUES(true,true,'2020-01-01','08:45','18:00');
 CREATE TABLE k3_employee_reviews(user_id uuid,work_date date,summary_deadline_at_placeholder text);
 CREATE FUNCTION private.k3_close_discipline_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RETURN NEW;END$$;
 CREATE FUNCTION k3_settings_save(boolean,date,time,time,smallint) RETURNS jsonb LANGUAGE plpgsql AS $$BEGIN RETURN public.k3_settings_read();END$$;
 CREATE FUNCTION k3_settings_read() RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;
 CREATE TABLE cron.job(jobid bigint,jobname text);CREATE FUNCTION cron.unschedule(bigint) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE sql AS $$SELECT 1::bigint$$;
 CREATE TABLE leave_settings(id int,data jsonb);INSERT INTO leave_settings VALUES(1,'{"schedule":{"1":{"am":true,"pm":true},"2":{"am":true,"pm":true},"3":{"am":true,"pm":true},"4":{"am":true,"pm":true},"5":{"am":true,"pm":true},"6":{"am":true,"pm":true},"7":{"am":true,"pm":true}},"holidays":[]}');
 CREATE TABLE leave_requests(owner_id uuid,type text,status text,payload jsonb);
 CREATE TABLE k3_goals(id uuid,user_id uuid,period_start date,period_end date,status text,deleted_at timestamptz,created_at timestamptz,updated_at timestamptz);
 CREATE TABLE k3_actions(id uuid,goal_id uuid,revision bigint,status text,deleted_at timestamptz,created_at timestamptz,updated_at timestamptz);
 CREATE TABLE k3_goal_members(id uuid);CREATE TABLE k3_action_collaborators(id uuid);CREATE TABLE k3_data_reviews(record_id uuid,status text);
 CREATE FUNCTION private.k3_action_on_date(uuid,date) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
 CREATE FUNCTION private.k3_action_worker_ok(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${user}'::uuid$$;
 CREATE FUNCTION private.k3_employee_review_state(uuid,date) RETURNS jsonb LANGUAGE sql AS $$SELECT '{"manual_status":"none","confirmed_at":null,"system_status":"open","action_count":0,"result_count":0}'::jsonb$$;`);
 await db.exec(readFileSync('drizzle/migrations/0246_k3_morning_discipline_snapshots.sql','utf8'));
 await db.exec(readFileSync('drizzle/migrations/0248_k3_checkpoint_concurrency_and_exclusion_fences.sql','utf8'));
 expect(await val(`SELECT plan_by::text v FROM k3_settings`)).toBe('08:45:00');
 await db.exec(readFileSync('drizzle/migrations/0249_k3_frozen_employee_review_deadlines.sql','utf8'));
 await db.exec(`UPDATE k3_settings SET discipline_from=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,plan_by=((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')-interval '1 minute')::time`);
},30000);
afterAll(()=>db.close());
it('default checkpoint setting is exactly 08:45 Vietnam',async()=>{
 // The existing setting, not an independent hidden time, supplies the checkpoint.
 expect(await val(`SELECT position('plan_by' in pg_get_functiondef('private.k3_plan_schedule()'::regprocedure))>0 v`)).toBe(true);
});
it('checkpoint stores no plan then a later creation stays late, not on time',async()=>{
 await db.query(`SELECT private.k3_plan_capture('${user}')`);
 expect(await val(`SELECT initial_status v FROM k3_plan_checkpoints`)).toBe('none');
 await db.exec(`INSERT INTO k3_goals VALUES('${goal}','${user}',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,'in_progress',NULL,now(),now());INSERT INTO k3_actions VALUES('${action}','${goal}',1,'in_progress',NULL,now(),now());`);
 expect(await val(`SELECT current_status v FROM k3_plan_checkpoints`)).toBe('late');
 expect(await val(`SELECT initial_status v FROM k3_plan_checkpoints`)).toBe('none');
 expect(await val(`SELECT source v FROM k3_plan_checkpoints`)).toBe('self');
});
it('deleting after the checkpoint does not rewrite the initial checkpoint',async()=>{
 await db.exec(`UPDATE k3_goals SET deleted_at=now() WHERE id='${goal}'`);
 expect(await val(`SELECT current_status v FROM k3_plan_checkpoints`)).toBe('late');
 expect(await val(`SELECT initial_snapshot v FROM k3_plan_checkpoints`)).toEqual([]);
 await expect(db.exec(`UPDATE k3_plan_checkpoints SET initial_status='on_time'`)).rejects.toThrow('ghi đè');
});
it('a scheduled plan existing before cutoff counts as on time with scheduled source',async()=>{
 await db.exec(`DELETE FROM k3_plan_checkpoints;UPDATE k3_goals SET deleted_at=NULL,period_start=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-1,created_at=now()-interval '1 day',updated_at=now()-interval '1 day';UPDATE k3_actions SET created_at=now()-interval '1 day',updated_at=now()-interval '1 day';DELETE FROM k3_plan_checkpoints;`);
 await db.query(`SELECT private.k3_plan_capture('${user}')`);
 expect(await val(`SELECT current_status v FROM k3_plan_checkpoints`)).toBe('on_time');
 expect(await val(`SELECT source v FROM k3_plan_checkpoints`)).toBe('scheduled');
});
it('approved full-day leave is not a discipline obligation',async()=>{
 await db.exec(`INSERT INTO leave_requests VALUES('${user}','leave','approved',jsonb_build_object('start_date',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,'end_date',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,'start_half','am','end_half','pm'))`);
 expect(await val(`SELECT private.k3_day_obligated('${user}',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) v`)).toBe(false);
 await db.exec(`DELETE FROM leave_requests`);
});
it('partial leave does not exempt the remaining working session',async()=>{
 await db.exec(`INSERT INTO leave_requests VALUES('${user}','leave','approved',jsonb_build_object('start_date',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,'end_date',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,'start_half','am','end_half','am'))`);
 expect(await val(`SELECT private.k3_day_obligated('${user}',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) v`)).toBe(true);
 await db.exec(`DELETE FROM leave_requests`);
});
it('Sunday remains a working day when the actual schedule says so',async()=>{
 expect(await val(`SELECT private.k3_day_obligated('${user}','2099-11-08') v`)).toBe(true);
});
it('non-admin cannot silently exclude a checkpoint',async()=>{
 await expect(db.query(`SELECT k3_discipline_exclude('${user}',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,'Test')`)).rejects.toThrow('Admin');
});
it('summary deadline remains frozen when the current setting changes',async()=>{
 const deadline=await val<string>(`SELECT summary_deadline_at::text v FROM k3_plan_checkpoints LIMIT 1`);
 expect(deadline).toContain('11:00:00');
 await db.exec(`UPDATE k3_settings SET summary_by='20:00'`);
 expect(await val(`SELECT summary_deadline_at::text v FROM k3_plan_checkpoints LIMIT 1`)).toBe(deadline);
});

it('targeted trigger preserves real checkpoint snapshots while avoiding unrelated users and covers reassignment',async()=>{
 const snapshot=JSON.parse(readFileSync('docs/k3-create-p0-2026-11-12/functions.json','utf8'));
 await db.exec(snapshot.find((f:{signature:string})=>f.signature==='private.k3_plan_changed()').definition);
 await db.exec(`ALTER TABLE k3_actions ADD COLUMN user_id uuid DEFAULT '${user}',ADD COLUMN assignee_id uuid DEFAULT '${user}';
 ALTER TABLE k3_goal_members ADD COLUMN goal_id uuid,ADD COLUMN user_id uuid,ADD COLUMN status text;
 ALTER TABLE k3_action_collaborators ADD COLUMN action_id uuid,ADD COLUMN user_id uuid;
 CREATE OR REPLACE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
 CREATE OR REPLACE FUNCTION biz_participant(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
 INSERT INTO profiles SELECT ('10000000-0000-0000-0001-'||lpad(i::text,12,'0'))::uuid,'Fixture employee','Đang hoạt động' FROM generate_series(1,24) i;
 ALTER FUNCTION private.k3_plan_capture(uuid) RENAME TO original_capture;
 CREATE TABLE capture_calls(user_id uuid);
 CREATE FUNCTION private.k3_plan_capture(u uuid) RETURNS void LANGUAGE plpgsql AS $$BEGIN INSERT INTO capture_calls VALUES(u);PERFORM private.original_capture(u);END$$;`);
 // Establish everyone's checkpoint with the unchanged authoritative capture first.
 await db.exec('SELECT private.k3_plan_capture(id) FROM profiles;TRUNCATE capture_calls;');
 const initial=(await db.query('SELECT user_id,initial_status,initial_snapshot,deadline_at,summary_deadline_at FROM k3_plan_checkpoints ORDER BY user_id')).rows;
 const t=performance.now();
 for(let i=0;i<5;i++) await db.exec(`UPDATE k3_goals SET updated_at=updated_at WHERE id='${goal}'`);
 const before=performance.now()-t;
 expect(await val('SELECT count(*)::int v FROM capture_calls')).toBe(125);
 await db.exec('TRUNCATE capture_calls;');
 await db.exec(readFileSync('docs/pending/k3_plan_targeted_capture.sql','utf8'));
 const start=performance.now();
 for(let i=0;i<5;i++) await db.exec(`UPDATE k3_goals SET updated_at=updated_at WHERE id='${goal}'`);
 const after=performance.now()-start;
 expect(await val('SELECT count(*)::int v FROM capture_calls')).toBe(5);
 expect((await db.query('SELECT user_id,initial_status,initial_snapshot,deadline_at,summary_deadline_at FROM k3_plan_checkpoints ORDER BY user_id')).rows).toEqual(initial);
 const other='10000000-0000-0000-0001-000000000001';
 await db.exec(`TRUNCATE capture_calls;UPDATE k3_actions SET assignee_id='${other}' WHERE id='${action}';`);
 expect((await db.query('SELECT DISTINCT user_id FROM capture_calls ORDER BY user_id')).rows).toEqual([{user_id:user},{user_id:other}]);
 await db.exec(`TRUNCATE capture_calls;INSERT INTO k3_goal_members VALUES(gen_random_uuid(),'${goal}','${other}','accepted');DELETE FROM k3_goal_members WHERE user_id='${other}';`);
 expect(await val(`SELECT count(*)::int v FROM capture_calls WHERE user_id='${other}'`)).toBe(2);
 await db.exec(`TRUNCATE capture_calls;UPDATE k3_goals SET updated_at=updated_at WHERE id='${goal}' AND false;`);
 expect(await val('SELECT count(*)::int v FROM capture_calls')).toBe(0);
 // No broad eligibility changes; existing non-Biz/denied guards still exclude.
 await db.exec(`CREATE OR REPLACE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $1<>'${other}'::uuid$$;
 TRUNCATE capture_calls;UPDATE k3_actions SET revision=revision+1 WHERE id='${action}';`);
 expect(await val(`SELECT count(*)::int v FROM capture_calls WHERE user_id='${other}'`)).toBe(0);
 console.log('isolated 25-user five-statement checkpoint benchmark',Math.round(before),'->',Math.round(after),'ms; 125 -> 5 captures');
 await db.exec(readFileSync('docs/k3-create-p0-2026-11-12/rollback.sql','utf8'));
 expect(await val(`SELECT md5(pg_get_functiondef('private.k3_plan_changed()'::regprocedure)) v`)).toBe('747bba016fb854adde9ea58fe6e11336');
},60000);