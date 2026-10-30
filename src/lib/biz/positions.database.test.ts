import { readFileSync } from 'node:fs';
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
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE app_roles(id text PRIMARY KEY,permissions text[],updated_at timestamptz);CREATE TABLE user_roles(user_id uuid,role_id text);CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u IN ('${sale}'::uuid,'${lead}'::uuid,'${head}'::uuid,'${director}'::uuid) AND p IN ('biz.view_own','biz.view_dept','biz.goal_submit','biz.plan_submit','biz.report_submit','biz.goal_approve','biz.report_approve','biz.plan_request_revision'))$$;CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT u='${admin}'::uuid$$;CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
 for (const id of [admin,sale,lead,head,director,outsider]) await db.query('insert into profiles values($1,$2,$3)', [id,id,'Đang hoạt động']);
 const files = ['0088_biz_management_foundation','0089_biz_annual_goals_and_scoped_foundation','0090_biz_membership_serialized_boundaries','0091_biz_documents_foundation','0092_biz_document_workflow','0093_biz_document_aggregation_guards','0094_biz_base_notifications','0095_biz_notification_recipient_scope','0096_biz_deadline_and_reminder_access','0097_biz_report_baseline_scope','0098_biz_report_frozen_baselines','0099_biz_dashboard_scoped_months','0100_biz_dashboard_exact_aggregates','0101_biz_dashboard_trends','0102_biz_dashboard_completeness_summary','0103_biz_plan_revision_flow','0104_biz_organization_history','0105_biz_sequential_approvals','0106_biz_approval_decision_fences','0107_biz_approval_center','0108_biz_dashboard_hierarchy_scope','0109_biz_organization_guard_record_shapes','0110_biz_approval_history_and_guard_scope','0111_biz_positions_appointments','0112_biz_dynamic_position_workflows','0113_biz_role_scope_and_review_fences'];
 for (const file of [...files, '0114_biz_position_history_and_upward_guards', '0115_biz_isolated_demo']) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`, 'utf8'));
 await db.exec("insert into app_roles(id,permissions,biz_scope) values('staff',ARRAY['biz.view_dept','biz.goal_approve'],'assigned');");
 for (const id of [sale,lead,head,director,outsider]) await db.query("insert into user_roles values($1,'staff')",[id]);
 await db.exec("INSERT INTO biz_positions(code,name,level,unit_kind,sort_order) VALUES ('director','Giám Đốc',3,'system',0),('department_head','Trưởng Phòng',2,'department',1),('team_lead','Trưởng Nhóm',1,'team',2),('employee','Nhân viên Kinh doanh',0,'individual',3)");
 await actor(admin); sys = await org('system',{name:'Hệ thử tách biệt'}); dep = await org('department',{name:'Phòng thử',system_id:sys}); team = await org('team',{name:'Nhóm thử',department_id:dep}); await org('member',{user_id:sale,department_id:dep,team_id:team});
}, 30000);
afterAll(() => db.close());
it('four initial titles have exact requested ranks and unit kinds', async () => {
 const rows = (await db.query('select code,level,unit_kind from biz_positions order by sort_order')).rows;
 expect(rows).toEqual([{code:'director',level:3,unit_kind:'system'},{code:'department_head',level:2,unit_kind:'department'},{code:'team_lead',level:1,unit_kind:'team'},{code:'employee',level:0,unit_kind:'individual'}]);
});
it('authorized administrators add and rename arbitrary titles', async () => {
 custom = await scalar('select biz_position_save($1) v',[JSON.stringify({name:'Phụ trách dự án',level:5,unit_kind:'team',sort_order:9})]);
 await scalar('select biz_position_save($1) v',[JSON.stringify({id:custom,name:'Phụ trách thị trường',description:'Phạm vi nhóm',level:4,unit_kind:'team',sort_order:8})]);
 expect(await scalar('select name v from biz_positions where id=$1',[custom])).toBe('Phụ trách thị trường');
});
it('unit compatibility is authoritative and concurrent director intervals cannot overlap', async () => {
 const p = await scalar("select id v from biz_positions where code='director'");
 await expect(appoint({position_id:p,user_id:director,scope_kind:'team',system_id:sys,department_id:dep,team_id:team})).rejects.toThrow('phạm vi');
 await appoint({position_id:p,user_id:director,scope_kind:'system',system_id:sys,started_at:'2026-01-01',ended_at:'2027-01-01'});
 await expect(appoint({position_id:p,user_id:head,scope_kind:'system',system_id:sys,started_at:'2026-12-01',ended_at:'2027-02-01'})).rejects.toThrow('mâu thuẫn');
 await appoint({position_id:p,user_id:head,scope_kind:'system',system_id:sys,started_at:'2027-01-01',ended_at:'2028-01-01'});
 expect(await scalar("select count(*)::int v from biz_appointments where position_id=$1",[p])).toBe(2);
});
it('one person can hold valid positions in distinct scopes', async () => {
 decision = await appoint({position_id:custom,user_id:lead,scope_kind:'team',system_id:sys,department_id:dep,team_id:team,started_at:'2026-01-01',ended_at:'2027-01-01'});
 const secondTeam = await org('team',{name:'Nhóm kiêm nhiệm',department_id:dep});
 await appoint({position_id:custom,user_id:lead,scope_kind:'team',system_id:sys,department_id:dep,team_id:secondTeam,started_at:'2026-01-01',ended_at:'2027-01-01'});
 expect(await scalar('select count(*)::int v from biz_appointments where user_id=$1',[lead])).toBe(2);
});
it('appointment snapshots survive renaming and structural history cannot be deleted or rewritten', async () => {
 await scalar('select biz_position_save($1) v',[JSON.stringify({id:custom,name:'Tên mới',level:7,unit_kind:'team'})]);
 expect(await scalar("select position_snapshot->>'name' v from biz_appointments where id=$1",[decision])).toBe('Phụ trách thị trường');
 await expect(db.query('update biz_appointments set started_at=now() where id=$1',[decision])).rejects.toThrow('bất biến');
 await expect(db.query('delete from biz_appointments where id=$1',[decision])).rejects.toThrow('lịch sử');
 await expect(db.query('delete from biz_positions where id=$1',[custom])).rejects.toThrow('Không xóa');
});
it('high position rank grants neither approval actions nor cross-role scope', async () => {
 const p = await scalar('select biz_position_save($1) v',[JSON.stringify({name:'Cấp rất cao',level:99,unit_kind:'system'})]);
 await appoint({position_id:p,user_id:outsider,scope_kind:'system',system_id:sys});
 await actor(outsider); expect(await scalar('select biz_goal_can_review($1,$2) v',[sale,dep])).toBe(false);
 await actor(admin); await db.exec("update app_roles set biz_scope='individual' where id='staff'");
 expect(await scalar('select biz_scope_ok($1,$2,$3) v',[lead,sale,dep])).toBe(false);
 await db.exec("update app_roles set biz_scope='assigned' where id='staff'");
});
it('dynamic workflow resolves a custom position and keeps the resolved snapshot', async () => {
 await actor(admin); const w = await scalar('select biz_workflow_save($1) v',[JSON.stringify({name:'Chức vụ động',system_id:sys,kind:'goal_year',active:true,steps:[{label:'Cấp chức vụ',type:'position',position_id:custom}]})]);
 await db.query("insert into biz_kr_metrics(department_id,name,unit,value_kind) values($1,'Đơn','Đơn','count')",[dep]);
 await actor(sale);const v = await scalar('select biz_goal_start(2027) v'); const metric = await scalar('select metric_id v from biz_goal_items where version_id=$1',[v]);
 await db.query('select biz_goal_save($1,0,$2,true)',[v,JSON.stringify([{metric_id:metric,annual:'12',months:Array(12).fill('1')}])]);
 const step = (await scalar('select steps v from biz_approval_runs where version_id=$1',[v]))[0]; expect(step.user_id).toBe(lead); expect(step.position_snapshot.level).toBe(7);
 await actor(lead); await db.query('select biz_goal_decide($1,1,true,null)',[v]); expect(await scalar('select status v from biz_approval_runs where version_id=$1',[v])).toBe('approved');
 await actor(admin); expect(await scalar('select id v from biz_approval_workflows where id=$1',[w])).toBe(w);
});
it('missing dynamic reviewer is warned by preview, unauthorized writes and direct DML are denied', async () => {
 const p = await scalar('select biz_position_save($1) v',[JSON.stringify({name:'Chưa bổ nhiệm',level:1,unit_kind:'department'})]);
 const preview = await scalar('select biz_workflow_preview($1) v',[JSON.stringify({system_id:sys,kind:'goal_year',steps:[{label:'Thiếu người',type:'position',position_id:p}]})]);
 expect(preview.length).toBeGreaterThan(0);expect(preview.every((x:any)=>x.missing)).toBe(true);
 await actor(sale); await expect(appoint({position_id:p,user_id:sale,scope_kind:'department',system_id:sys,department_id:dep})).rejects.toThrow('quyền');
 await db.exec('SET ROLE authenticated'); await expect(db.exec("insert into biz_positions(name,unit_kind) values('Tự cấp','system')")).rejects.toThrow('permission denied'); await db.exec('RESET ROLE');
});
it('DEMO reuses exact aggregation, regeneration and deletion never touch operational rows', async () => {
 await actor(admin);
 const before = await scalar("select jsonb_build_object('goals',(select count(*) from biz_annual_goals),'docs',(select count(*) from biz_documents),'notifications',(select count(*) from notifications),'members',(select count(*) from biz_department_members)) v");
 await db.query('select biz_demo_reset(false,true)');
 const demo = await scalar('select biz_demo_read() v');
 expect(demo.is_demo).toBe(true); expect(demo.goals.length).toBeGreaterThan(0);
 for (const g of demo.goals) expect(g.months.reduce((s:number,x:string)=>s+Number(x),0)).toBe(Number(g.annual));
 const summary = await scalar('select biz_demo_dashboard($1) v',[JSON.stringify({year:2026,kind:'month',period:2,department:'all',employee:'all',mode:'provisional'})]);
 expect(summary.totals.length).toBeGreaterThan(0);
 const metric = summary.totals[0]; expect(Number(metric.percent)).toBeCloseTo(Number(metric.actual)/Number(metric.target)*100,8);
 await db.query('select biz_demo_reset(false,true)'); expect(await scalar('select count(*)::int v from biz_demo_sets')).toBe(1);
 await db.query('select biz_demo_reset(true,true)'); expect(await scalar('select count(*)::int v from biz_demo_sets')).toBe(0);
 expect(await scalar("select jsonb_build_object('goals',(select count(*) from biz_annual_goals),'docs',(select count(*) from biz_documents),'notifications',(select count(*) from notifications),'members',(select count(*) from biz_department_members)) v")).toEqual(before);
 await actor(sale); await expect(db.query('select biz_demo_reset(false,true)')).rejects.toThrow('Super Admin'); await expect(db.query('select biz_demo_read()')).rejects.toThrow('quyền');
});