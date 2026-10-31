import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const admin='00000000-0000-0000-0000-000000000001',sale='00000000-0000-0000-0000-000000000002',leader='00000000-0000-0000-0000-000000000003',other='00000000-0000-0000-0000-000000000004';const dept='10000000-0000-0000-0000-000000000001';
async function actor(id:string){await db.query("select set_config('test.uid',$1,false)",[id]);}
async function scalar(sql:string,args:unknown[]=[]){return(await db.query<{v:any}>(sql,args)).rows[0]?.v;}
async function saveCfg(kind:string,rule:unknown){await actor(admin);await db.query('select biz_deadline_save($1)',[JSON.stringify({[kind]:rule})]);}
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE app_roles(id text,permissions text[],updated_at timestamptz);CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid$$;CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u='${sale}'::uuid AND p IN ('biz.view_own','biz.plan_submit','biz.report_submit')) OR (u='${leader}'::uuid AND p IN ('biz.view_dept','biz.plan_approve','biz.report_approve','biz.view_own'))$$;INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${sale}','Sale','Đang hoạt động'),('${leader}','Leader','Đang hoạt động'),('${other}','Other','Đang hoạt động');CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
 for(const f of ['0088_biz_management_foundation','0089_biz_annual_goals_and_scoped_foundation','0090_biz_membership_serialized_boundaries','0091_biz_documents_foundation','0092_biz_document_workflow','0093_biz_document_aggregation_guards','0094_biz_base_notifications','0095_biz_notification_recipient_scope','0096_biz_deadline_and_reminder_access','0097_biz_report_baseline_scope','0098_biz_report_frozen_baselines','0099_biz_dashboard_scoped_months','0100_biz_dashboard_exact_aggregates','0101_biz_dashboard_trends','0102_biz_dashboard_completeness_summary','0103_biz_plan_revision_flow'])await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.exec(`CREATE TABLE biz_approval_runs(version_id uuid,status text);CREATE FUNCTION public.biz_scope_ok(uuid,uuid,uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;CREATE FUNCTION public.biz_approval_start(uuid,text,uuid,uuid,jsonb) RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;`);
 for(const f of ['0122_biz_report_instant_official','0123_biz_report_guard_instant_official','0124_biz_plan_link_requirement','0125_biz_attachment_url_regex_portable','0126_biz_plan_view_tracking','0127_biz_deadline_milestones','0128_biz_late_submit_requests','0129_biz_milestone_month_offset','0130_biz_deadline_auto_notify'])await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.exec(`INSERT INTO biz_departments(id,name) VALUES('${dept}','Quà tặng');INSERT INTO biz_department_members(department_id,user_id,is_manager,effective_from,started_at) VALUES('${dept}','${sale}',false,'2026-01-01','2026-01-01T00:00:00+07'),('${dept}','${leader}',true,'2026-01-01','2026-01-01T00:00:00+07');`);
},30000);afterAll(()=>db.close());

it('backfilled legacy config exposes only the due milestone',async()=>{
 await actor(admin);await db.query(`insert into biz_deadline_config(id,data) values(true,'{"plan_month":{"day":3,"phase":"during","hour":0,"minute":0}}') on conflict(id) do update set data=excluded.data`);
 await db.exec(`UPDATE public.biz_deadline_config c SET data = coalesce((SELECT jsonb_object_agg(k, CASE WHEN v ? 'due' OR v ? 'open' OR v ? 'late_close' THEN v ELSE jsonb_build_object('open', null, 'due', CASE WHEN v ? 'day' THEN jsonb_build_object('phase', coalesce(v->>'phase','during'), 'day', (v->>'day')::int, 'hour', coalesce((v->>'hour')::int,17), 'minute', coalesce((v->>'minute')::int,0)) ELSE null END, 'late_close', null, 'exceptions', coalesce((SELECT jsonb_object_agg(ek, jsonb_build_object('due', ev#>>'{}')) FROM jsonb_each(v->'exceptions') e(ek,ev)), '{}'::jsonb)) END) FROM jsonb_each(c.data) e(k,v)), '{}'::jsonb) WHERE id = true;`);
 const m=await scalar("select biz_deadline_milestones('plan_month',2026,11) v");
 expect(m.due).toContain('2026-11-02T17:00');expect(m.open).toBeNull();expect(m.late_close).toBeNull();
 expect(new Date(await scalar("select biz_deadline_at('plan_month',2026,11) v")).toISOString()).toContain('2026-11-02T17:00');
});
it('spec example: month 11/2026 opens 25/10, due 03/11, closes 15/11 (VN time, PGlite trả UTC)',async()=>{
 await saveCfg('plan_month',{open:{day:25,offset:-1,hour:0,minute:0},due:{day:3,offset:0,hour:23,minute:59},late_close:{day:15,offset:0,hour:23,minute:59}});
 const m=await scalar("select biz_deadline_milestones('plan_month',2026,11) v");
 expect(m.open).toContain('2026-10-24T17:00');expect(m.due).toContain('2026-11-03T16:59');expect(m.late_close).toContain('2026-11-15T16:59');
});
it('save rejects open after due and logs every change',async()=>{
 await expect(saveCfg('plan_month',{open:{day:5,offset:0},due:{day:3,offset:0}})).rejects.toThrow('mở nộp phải trước hạn cuối');
 expect(Number(await scalar('select count(*) v from biz_deadline_config_log'))).toBeGreaterThan(0);
});
it('phases follow open/due/close boundaries',async()=>{
 await saveCfg('plan_month',{open:{day:25,offset:-1,hour:0,minute:0},due:{day:3,offset:0,hour:23,minute:59},late_close:{day:15,offset:0,hour:23,minute:59}});
 expect(await scalar("select biz_deadline_phase('plan_month',2026,11,'2026-10-20T10:00:00+07') v")).toBe('not_open');
 expect(await scalar("select biz_deadline_phase('plan_month',2026,11,'2026-10-26T10:00:00+07') v")).toBe('open');
 expect(await scalar("select biz_deadline_phase('plan_month',2026,11,'2026-11-10T10:00:00+07') v")).toBe('overdue');
 expect(await scalar("select biz_deadline_phase('plan_month',2026,11,'2026-11-16T10:00:00+07') v")).toBe('closed');
});
it('not_open blocks creating a new document',async()=>{
 await saveCfg('plan_year',{open:{day:1,offset:0,hour:0,minute:0},due:{day:31,offset:0,hour:23,minute:59},late_close:{day:28,offset:1,hour:23,minute:59}});
 await actor(sale);
 await expect(db.query("select biz_document_start('plan','year',2027,1)")).rejects.toThrow('chưa mở');
});
it('overdue blocks direct submit; approved late request is consumed once and marks late',async()=>{
 await saveCfg('plan_month',{open:{day:25,offset:-1,hour:0,minute:0},due:{day:3,offset:0,hour:23,minute:59},late_close:{day:28,offset:1,hour:23,minute:59}});
 await actor(sale);
 const vid=await scalar("select biz_document_start('plan','month',2026,10) v");
 const rev=()=>scalar('select revision v from biz_document_versions where id=$1',[vid]);
 await expect(db.query('select biz_document_save($1,$2,$3,$4,$5,true)',[vid,await rev(),'https://docs.google.com/document/d/real_test/edit','','[]'])).rejects.toThrow('nộp bù');
 await expect(db.query("select biz_late_request_create('plan','month',2026,10,'')")).rejects.toThrow('lý do');
 const req=await scalar("select biz_late_request_create('plan','month',2026,10,'Bận công tác') v");
 await expect(db.query("select biz_late_request_create('plan','month',2026,10,'Lần hai')")).rejects.toThrow();
 await actor(other);await expect(db.query('select biz_late_request_decide($1,true,null)',[req])).rejects.toThrow();
 await actor(sale);await expect(db.query('select biz_late_request_decide($1,true,null)',[req])).rejects.toThrow('tự duyệt');
 await actor(leader);await db.query('select biz_late_request_decide($1,true,null)',[req]);
 expect(await scalar("select count(*)::int v from notifications where kind='biz_late_approved' and recipient_id=$1",[sale])).toBe(1);
 await actor(sale);
 await db.query('select biz_document_save($1,$2,$3,$4,$5,true)',[vid,await rev(),'https://docs.google.com/document/d/real_test/edit','','[]']);
 expect(await scalar('select late_submitted v from biz_documents where id=(select document_id from biz_document_versions where id=$1)',[vid])).toBe(true);
 expect(await scalar('select status v from biz_late_requests where id=$1',[req])).toBe('used');
});
it('closed period rejects late requests and expires pending ones',async()=>{
 await saveCfg('plan_quarter',{open:{day:1,offset:0,hour:0,minute:0},due:{day:5,offset:0,hour:23,minute:59},late_close:{day:10,offset:0,hour:23,minute:59}});
 await actor(sale);
 await expect(db.query("select biz_late_request_create('plan','quarter',2026,3,'Quá hạn')")).rejects.toThrow('đã đóng');
 await expect(db.query("select biz_document_start('plan','quarter',2026,3)")).rejects.toThrow('đã đóng');
});
it('auto notify sends overdue once per obligation and never repeats',async()=>{
 await saveCfg('report_month',{open:{day:25,offset:-1,hour:0,minute:0},due:{day:3,offset:0,hour:23,minute:59},late_close:{day:28,offset:1,hour:23,minute:59}});
 const first=await scalar('select biz_deadline_auto_notify() v');
 expect(first.sent).toBeGreaterThan(0);
 expect(await scalar("select count(*)::int v from notifications where kind='biz_deadline' and recipient_id=$1",[sale])).toBeGreaterThan(0);
 const second=await scalar('select biz_deadline_auto_notify() v');
 expect(second.sent).toBe(0);
});
