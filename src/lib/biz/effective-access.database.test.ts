import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const [admin, sale, lead, head, director, outsider] = Array.from({ length: 6 }, (_, i) => `00000000-0000-0000-0000-${String(i+1).padStart(12,'0')}`);
let sys = '', dep = '', team = '', custom = '', decision = '';
async function actor(id: string) { await db.query("select set_config('test.uid',$1,false)", [id]); }
async function scalar(sql: string, args: unknown[] = []) { return (await db.query<{ v: any }>(sql, args)).rows[0]?.v; }
async function org(action: string, data: unknown) { return scalar('select biz_org_save($1,$2) v', [action, JSON.stringify(data)]); }
async function appoint(data: unknown) { return scalar('select biz_appointment_save($1) v', [JSON.stringify(data)]); }
beforeAll(async () => {
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE app_roles(id text PRIMARY KEY,name text,permissions text[],updated_at timestamptz);CREATE TABLE user_roles(user_id uuid,role_id text);CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u IN ('${sale}'::uuid,'${lead}'::uuid,'${head}'::uuid,'${director}'::uuid) AND p IN ('biz.view_own','biz.view_dept','biz.goal_submit','biz.plan_submit','biz.report_submit','biz.goal_approve','biz.report_approve','biz.plan_request_revision'))$$;CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT u='${admin}'::uuid$$;CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
 for (const id of [admin,sale,lead,head,director,outsider]) await db.query('insert into profiles values($1,$2,$3)', [id,id,'Đang hoạt động']);
 const files = ['0088_biz_management_foundation','0089_biz_annual_goals_and_scoped_foundation','0090_biz_membership_serialized_boundaries','0091_biz_documents_foundation','0092_biz_document_workflow','0093_biz_document_aggregation_guards','0094_biz_base_notifications','0095_biz_notification_recipient_scope','0096_biz_deadline_and_reminder_access','0097_biz_report_baseline_scope','0098_biz_report_frozen_baselines','0099_biz_dashboard_scoped_months','0100_biz_dashboard_exact_aggregates','0101_biz_dashboard_trends','0102_biz_dashboard_completeness_summary','0103_biz_plan_revision_flow','0104_biz_organization_history','0105_biz_sequential_approvals','0106_biz_approval_decision_fences','0107_biz_approval_center','0108_biz_dashboard_hierarchy_scope','0109_biz_organization_guard_record_shapes','0110_biz_approval_history_and_guard_scope','0111_biz_positions_appointments','0112_biz_dynamic_position_workflows','0113_biz_role_scope_and_review_fences'];
 for (const file of [...files, '0114_biz_position_history_and_upward_guards', '0115_biz_isolated_demo', '0116_biz_demo_numeric_targets', '0117_biz_demo_submission_deadline']) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`, 'utf8'));
 await db.exec("insert into app_roles(id,permissions,biz_scope) values('staff',ARRAY['biz.view_dept','biz.goal_approve'],'assigned');");
 for (const id of [sale,lead,head,director,outsider]) await db.query("insert into user_roles values($1,'staff')",[id]);
 await db.exec("INSERT INTO biz_positions(code,name,level,unit_kind,sort_order) VALUES ('director','Giám Đốc',3,'system',0),('department_head','Trưởng Phòng',2,'department',1),('team_lead','Trưởng Nhóm',1,'team',2),('employee','Nhân viên Kinh doanh',0,'individual',3)");
 await actor(admin); sys = await org('system',{name:'Hệ thử tách biệt'}); dep = await org('department',{name:'Phòng thử',system_id:sys}); team = await org('team',{name:'Nhóm thử',department_id:dep}); await org('member',{user_id:sale,department_id:dep,team_id:team});
 for (let n=118;n<=140;n++) { const file=readdirSync('drizzle/migrations').find(f=>f.startsWith(String(n).padStart(4,'0')+'_')); if(file) await db.exec(readFileSync('drizzle/migrations/'+file,'utf8')); }
}, 60000);
afterAll(() => db.close());

it('appointment supplies management rights without a manual role grant',async()=>{
 await actor(admin);await db.exec("update app_roles set permissions=ARRAY[]::text[] where id='staff'");
 const p=await scalar("select id v from biz_positions where code='team_lead'");
 await appoint({position_id:p,user_id:lead,scope_kind:'team',system_id:sys,department_id:dep,team_id:team});
 expect(await scalar("select biz_can($1,'biz.view_dept') v",[lead])).toBe(true);
 expect(await scalar('select biz_scope_ok($1,$2,$3) v',[lead,sale,dep])).toBe(true);
 expect(await scalar('select biz_all_scope($1) v',[lead])).toBe(false);
});
it('personal dashboard access does not allow another employee document',async()=>{
 await actor(sale);expect(await scalar("select biz_can($1,'biz.dashboard_public') v",[sale])).toBe(true);
 expect(await scalar("select biz_doc_access($1,$2,'plan') v",[lead,dep])).toBe(false);
 const published=await scalar('select biz_dashboard_published(2026) v');
 expect(published.groups.map((g:any)=>g.name)).toContain('Toàn Khối');
 expect(Object.keys(published).sort()).toEqual(['evaluation_hi','groups','hi','lo','mode','ongoing','period','period_kind','server_now','year']);
 expect(JSON.stringify(published)).not.toContain(sale);
});
it('published reader cannot call private global detail reader',async()=>{
 await actor(sale);await db.exec('SET ROLE authenticated');
 await expect(db.query('select private.biz_dashboard_global_data(2026)')).rejects.toThrow();
 await db.exec('RESET ROLE');
});
it('future and ended appointments cannot grant a scope',async()=>{
 await actor(admin);const p=await scalar("select id v from biz_positions where code='department_head'");
 await appoint({position_id:p,user_id:head,scope_kind:'department',system_id:sys,department_id:dep,started_at:'2099-01-01'});
 expect(await scalar('select biz_manager($1) v',[head])).toBe(false);
 await db.exec("insert into biz_department_members(user_id,department_id,effective_from,effective_to,started_at,ended_at) values('"+outsider+"','"+dep+"','2001-01-01','2002-01-01','2001-01-01','2002-01-01')");
 expect(await scalar('select biz_participant($1) v',[outsider])).toBe(false);
});
it('unknown business permission returns false and never recurses',async()=>{
 expect(await scalar("select biz_can($1,'biz.unknown_permission') v",[lead])).toBe(false);
});
it('only administrators can grant exceptions and clients cannot write them',async()=>{
 await actor(sale);await expect(scalar('select biz_exception_save($1) v',[JSON.stringify({user_id:sale,permission:'biz.view_all',scope_kind:'all',reason:'test'})])).rejects.toThrow('quyền');
 await db.exec('SET ROLE authenticated');await expect(db.exec("insert into biz_access_exceptions(permission,scope_kind,granted_by,reason) values('biz.view_all','all','"+sale+"','test')")).rejects.toThrow();await db.exec('RESET ROLE');
});
it('an unassigned manager cannot approve just because they can view',async()=>{
 await actor(lead);expect(await scalar('select biz_goal_can_review($1,$2) v',[sale,dep])).toBe(false);
});
it('late permission uses sequential steps and only final approval enables submission',async()=>{
 await actor(admin);
 await scalar('select biz_deadline_save($1) v',[JSON.stringify({plan_month:{open:{day:1,offset:0,hour:0},due:{day:2,offset:0,hour:0},late_close:{day:28,offset:1,hour:23}}})]);
 await scalar('select biz_workflow_save($1) v',[JSON.stringify({name:'Nộp bù hai cấp',system_id:sys,kind:'late_plan_month',active:true,steps:[{label:'Cấp 1',type:'user',user_id:lead},{label:'Cấp 2',type:'user',user_id:director}]})]);
 await actor(sale);const request=await scalar("select biz_late_request_create('plan','month',2026,10,'Đi công tác') v");
 expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(false);
 await actor(director);expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(false);
 await actor(lead);expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(true);
 await db.query('select biz_late_request_decide($1,true,null)',[request]);
 expect(await scalar('select status v from biz_late_requests where id=$1',[request])).toBe('pending');
 await actor(director);expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(true);
 await db.query('select biz_late_request_decide($1,true,null)',[request]);
 expect(await scalar('select status v from biz_late_requests where id=$1',[request])).toBe('approved');
 expect(await scalar("select count(*)::int v from notifications where kind='biz_late_approved' and recipient_id=$1",[sale])).toBe(1);
});

it('level 5 executive and level 4 deputy hold block scope without a system assignment or personal obligation',async()=>{
 await actor(admin);
 const executive=await scalar('select biz_position_save($1) v',[JSON.stringify({name:'Giám Đốc Điều hành',level:5,unit_kind:'system',business_policy:'executive',all_business:true})]);
 const deputy=await scalar('select biz_position_save($1) v',[JSON.stringify({name:'Phó Giám Đốc Điều hành',level:4,unit_kind:'system',business_policy:'executive',all_business:true})]);
 await db.query("update biz_positions set code='executive_director' where id=$1",[executive]);
 await db.query("update biz_positions set code='deputy_executive_director' where id=$1",[deputy]);
 await appoint({position_id:executive,user_id:outsider,scope_kind:'system'});
 await appoint({position_id:deputy,user_id:head,scope_kind:'system'});
 expect(await scalar('select level v from biz_positions where id=$1',[executive])).toBe(5);
 expect(await scalar('select level v from biz_positions where id=$1',[deputy])).toBe(4);
 for(const id of [outsider,head]){
  expect(await scalar('select biz_all_scope($1) v',[id])).toBe(true);
  expect(await scalar("select biz_can($1,'biz.plan_submit') v",[id])).toBe(false);
  expect(await scalar('select biz_scope_ok($1,$2,$3) v',[id,sale,dep])).toBe(true);
 }
 expect(await scalar('select biz_resolve_position($1,$2,$3,$4) v',[executive,sys,dep,team])).toBe(outsider);
 expect(await scalar('select biz_resolve_position($1,$2,$3,$4) v',[deputy,sys,dep,team])).toBe(head);
 expect(await scalar("select biz_can($1,'biz.intervene') v",[outsider])).toBe(true);
 expect(await scalar("select biz_can($1,'biz.intervene') v",[head])).toBe(false);
 expect(await scalar("select biz_can($1,'biz.org_manage') v",[head])).toBe(false);
 await expect(appoint({position_id:deputy,user_id:director,scope_kind:'system'})).rejects.toThrow('mâu thuẫn');
});
it('trusted existing Admin has business administration without granting other modules',async()=>{
 await db.exec("insert into app_roles(id,name,permissions) values('role-admin','Tên được đổi',ARRAY[]::text[])");
 await db.query("insert into user_roles values($1,'role-admin')",[director]);
 for(const permission of ['biz.org_manage','biz.workflow_manage','biz.kr_manage','biz.deadline_manage','biz.intervene','biz.access_manage'])expect(await scalar('select biz_can($1,$2) v',[director,permission])).toBe(true);
 expect(await scalar('select biz_all_scope($1) v',[director])).toBe(true);
 expect(await scalar("select private.sig_can($1,'settings.role') v",[director])).toBe(false);
 await db.query("delete from user_roles where user_id=$1 and role_id='role-admin'",[director]);
 expect(await scalar("select biz_can($1,'biz.org_manage') v",[director])).toBe(false);
});
it('replacement retires old rights atomically and permits a different holder',async()=>{
 await actor(admin);const p=await scalar("select id v from biz_positions where code='team_lead'");
 const old=await scalar('select id v from biz_appointments where position_id=$1 and user_id=$2',[p,lead]);
 await expect(appoint({position_id:p,user_id:sale,scope_kind:'team',system_id:sys,department_id:dep,team_id:'00000000-0000-0000-0000-999999999999',replaces_id:old})).rejects.toThrow();
 expect(await scalar('select ended_at v from biz_appointments where id=$1',[old])).toBe(null);
 const next=await appoint({position_id:p,user_id:sale,scope_kind:'team',system_id:sys,department_id:dep,team_id:team,replaces_id:old});
 expect(await scalar('select replaces_id v from biz_appointments where id=$1',[next])).toBe(old);
 expect(await scalar('select biz_manager($1) v',[lead])).toBe(false);
 expect(await scalar('select biz_manager($1) v',[sale])).toBe(true);
 expect(await scalar('select count(*)::int v from biz_appointments where id=$1',[old])).toBe(1);
});
it('deputy cannot approve the mandatory executive step or self-approve',async()=>{
 await actor(admin);
 const executive=await scalar("select id v from biz_positions where code='executive_director'");
 const deputy=await scalar("select id v from biz_positions where code='deputy_executive_director'");
 await scalar('select biz_workflow_save($1) v',[JSON.stringify({name:'Nộp bù điều hành',system_id:sys,kind:'late_report_month',active:true,steps:[{label:'Phó điều hành',type:'position',position_id:deputy},{label:'Giám Đốc Điều hành',type:'position',position_id:executive}]})]);
 await scalar('select biz_deadline_save($1) v',[JSON.stringify({report_month:{open:{day:1,offset:0,hour:0},due:{day:2,offset:0,hour:0},late_close:{day:28,offset:1,hour:23}}})]);
 await actor(sale);const request=await scalar("select biz_late_request_create('report','month',2026,10,'Công tác') v");
 expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(false);
 await actor(outsider);expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(false);
 await actor(head);expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(true);
 await db.query('select biz_late_request_decide($1,true,null)',[request]);
 expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(false);
 await expect(db.query('select biz_late_request_decide($1,true,null)',[request])).rejects.toThrow();
 await actor(outsider);expect(await scalar('select biz_late_can_act($1) v',[request])).toBe(true);
 await db.query('select biz_late_request_decide($1,true,null)',[request]);
 expect(await scalar('select status v from biz_late_requests where id=$1',[request])).toBe('approved');
});
