import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const [admin,sale,lead,head,director,outsider] = Array.from({length:6},(_,i)=>`00000000-0000-0000-0000-${String(i+1).padStart(12,'0')}`);
let sys='',dep='',team='';
async function actor(id:string){await db.query("select set_config('test.uid',$1,false)",[id]);}
async function scalar(sql:string,args:unknown[]=[]):Promise<any>{return (await db.query<{v:unknown}>(sql,args)).rows[0]?.v;}
async function org(action:string,data:unknown){return scalar('select biz_org_save($1,$2) v',[action,JSON.stringify(data)]);}
beforeAll(async () => {
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE app_roles(id text PRIMARY KEY,name text,permissions text[],updated_at timestamptz);CREATE TABLE user_roles(user_id uuid,role_id text);CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u IN ('${sale}'::uuid,'${lead}'::uuid,'${head}'::uuid,'${director}'::uuid,'${outsider}'::uuid) AND p IN ('biz.view_own','biz.view_dept','biz.goal_submit','biz.plan_submit','biz.report_submit','biz.goal_approve','biz.report_approve','biz.plan_request_revision'))$$;CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT u='${admin}'::uuid$$;CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
 for (const id of [admin,sale,lead,head,director,outsider]) await db.query('insert into profiles values($1,$2,$3)', [id,id,'Đang hoạt động']);
 const files = ['0088_biz_management_foundation','0089_biz_annual_goals_and_scoped_foundation','0090_biz_membership_serialized_boundaries','0091_biz_documents_foundation','0092_biz_document_workflow','0093_biz_document_aggregation_guards','0094_biz_base_notifications','0095_biz_notification_recipient_scope','0096_biz_deadline_and_reminder_access','0097_biz_report_baseline_scope','0098_biz_report_frozen_baselines','0099_biz_dashboard_scoped_months','0100_biz_dashboard_exact_aggregates','0101_biz_dashboard_trends','0102_biz_dashboard_completeness_summary','0103_biz_plan_revision_flow','0104_biz_organization_history','0105_biz_sequential_approvals','0106_biz_approval_decision_fences','0107_biz_approval_center','0108_biz_dashboard_hierarchy_scope','0109_biz_organization_guard_record_shapes','0110_biz_approval_history_and_guard_scope','0111_biz_positions_appointments','0112_biz_dynamic_position_workflows','0113_biz_role_scope_and_review_fences'];
 for (const file of [...files, '0114_biz_position_history_and_upward_guards', '0115_biz_isolated_demo', '0116_biz_demo_numeric_targets', '0117_biz_demo_submission_deadline']) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`, 'utf8'));
 await db.exec("insert into app_roles(id,permissions,biz_scope) values('staff',ARRAY['biz.view_dept','biz.goal_approve'],'assigned');");
 for (const id of [sale,lead,head,director,outsider]) await db.query("insert into user_roles values($1,'staff')",[id]);
 await db.exec("INSERT INTO biz_positions(code,name,level,unit_kind,sort_order) VALUES ('director','Giám Đốc',3,'system',0),('department_head','Trưởng Phòng',2,'department',1),('team_lead','Trưởng Nhóm',1,'team',2),('employee','Nhân viên Kinh doanh',0,'individual',3)");
 await actor(admin); sys = await org('system',{name:'Hệ thử tách biệt'}); dep = await org('department',{name:'Phòng thử',system_id:sys}); team = await org('team',{name:'Nhóm thử',department_id:dep}); await org('member',{user_id:sale,department_id:dep,team_id:team});
 // Lùi mốc hiệu lực về đầu năm để các kỳ 2026 trong kiểm thử luôn thuộc phòng, bất kể ngày chạy.
 await db.exec("update biz_department_members set started_at='2026-01-01T00:00:00Z' where user_id='"+sale+"';update biz_team_members set started_at='2026-01-01T00:00:00Z' where user_id='"+sale+"';update biz_department_system_history set started_at='2026-01-01T00:00:00Z' where department_id='"+dep+"';");
  for (let n=118;n<=148;n++) { const file=readdirSync('drizzle/migrations').find(f=>f.startsWith(String(n).padStart(4,'0')+'_')); if(file) await db.exec(readFileSync('drizzle/migrations/'+file,'utf8')); }
 await db.exec(readFileSync('drizzle/migrations/0300_biz_executive_deputy_parity.sql','utf8'));
 await db.exec(`CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=u AND status='Đang hoạt động')$$; CREATE FUNCTION private.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT u='${admin}'::uuid$$; CREATE TABLE crm_access_grants(id uuid); CREATE FUNCTION crm_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$; CREATE FUNCTION crm_owner_visible(_owner uuid,_department uuid DEFAULT null,_at timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$SELECT false$$; CREATE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;`);
 await db.exec(`CREATE FUNCTION sw_credential_save(uuid,text,text,text) RETURNS uuid LANGUAGE sql AS $$SELECT gen_random_uuid()$$; CREATE FUNCTION sw_reveal_password() RETURNS text LANGUAGE sql AS $$SELECT ''$$;`);
 for (let n=292;n<=314;n++) {const file=readdirSync('drizzle/migrations').find(f=>f.startsWith(String(n).padStart(4,'0')+'_'));if(file && n!==299 && n!==300 && n!==301 && n!==302 && n!==304) await db.exec(readFileSync('drizzle/migrations/'+file,'utf8'));}
 await db.exec(readFileSync('drizzle/migrations/0317_org_fingerprint_stable_profiles.sql','utf8'));
 await db.exec(readFileSync('drizzle/migrations/0318_appointment_role_verified_capabilities.sql','utf8'));
 await db.exec(readFileSync('drizzle/migrations/0319_appointment_role_dispatch_name_resolution.sql','utf8'));
 await db.exec(readFileSync('drizzle/migrations/0320_appointment_preview_effective_clock.sql','utf8'));
 await db.exec("INSERT INTO app_roles(id,name,permissions) VALUES('verified-designer','Designer',ARRAY['order.view','order.view_mine','order.submit'])");
 await db.exec("INSERT INTO base_permission_catalog(key,label,module) VALUES('order.view','Xem Thiết kế','Thiết kế'),('order.view_mine','Xem việc của mình','Thiết kế'),('order.submit','Gửi duyệt','Thiết kế') ON CONFLICT DO NOTHING");

}, 60000);
afterAll(()=>db.close());
async function preview(changes:unknown[]){return scalar("select org_change('preview',(select revision from private.org_control where id),$1) v",[JSON.stringify(changes)]);}
async function apply(p:any){return scalar("select org_change('apply',null,null,$1,'ÁP DỤNG CƠ CẤU','Kiểm thử tách biệt') v",[p.id]);}
it('preserves original business IDs and primary source meanings',async()=>{expect(await scalar('select source v from org_units where id=$1',[sys])).toBe('biz_systems');expect(await scalar('select count(*)::int v from org_assignments where category=$1',['primary'])).toBe(1);});
it('legacy public writers and direct DML cannot independently edit',async()=>{await actor(admin);await db.exec('SET ROLE authenticated');await expect(db.query("select biz_org_save('system',$1)", [{name:'bad'}])).rejects.toThrow();await expect(db.query("insert into biz_systems(name) values('bad')")).rejects.toThrow();await db.exec('RESET ROLE');});
it('preview rolls back all proposed structure and audits',async()=>{const p=await preview([{action:'unit',data:{id:'new-block',kind:'block',name:'New block',active:true}}]);expect(p.after.units.some((u:any)=>u.id==='new-block')).toBe(true);expect(await scalar("select count(*)::int v from org_units where id='new-block'")).toBe(0);expect(await scalar('select count(*)::int v from org_events')).toBe(0);});
it('apply is atomic, actor-bound and single-use',async()=>{const p=await preview([{action:'unit',data:{id:'marketing',kind:'block',name:'Marketing',active:true}}]);await actor(outsider);await expect(apply(p)).rejects.toThrow();await actor(admin);await apply(p);expect(await scalar("select name v from org_units where id='marketing'")).toBe('Marketing');await expect(apply(p)).rejects.toThrow();});
it('ordinary user cannot self appoint or edit outside scope',async()=>{await actor(outsider);await expect(preview([{action:'unit',data:{id:'bad',kind:'block',name:'bad'}}])).rejects.toThrow();await actor(admin);});
it('cycles fail without a partial write',async()=>{await expect(preview([{action:'unit',data:{id:sys,parent_id:dep,kind:'system',name:'bad',active:true}}])).rejects.toThrow('vòng');expect(await scalar('select parent_id v from org_units where id=$1',[sys])).toBe('biz-block');});
it('stale revision rejects the older preview',async()=>{const p=await preview([{action:'unit',data:{id:'s1',parent_id:'marketing',kind:'system',name:'S1',active:true}}]);const q=await preview([{action:'unit',data:{id:'s2',parent_id:'marketing',kind:'system',name:'S2',active:true}}]);await apply(q);await expect(apply(p)).rejects.toThrow('thay đổi');});
it('generic systems and teams are allowed outside business',async()=>{const p=await preview([{action:'unit',data:{id:'gd',parent_id:'s2',kind:'department',name:'D',active:true}},{action:'unit',data:{id:'gt',parent_id:'gd',kind:'team',name:'T',active:true}}]);await apply(p);expect(await scalar("select parent_id v from org_units where id='gt'")).toBe('gd');});
it('direct Role grants are unchanged by canonical structure updates',async()=>{expect(await scalar('select count(*)::int v from user_roles')).toBe(5);expect(await scalar('select role_id v from user_roles where user_id=$1',[sale])).toBe('staff');});
it('business title ID and business codes stay available in one list',async()=>{expect(await scalar("select code v from org_titles where id=(select id::text from biz_positions where code='director')")).toBe('director');});

it('expired preview rejects application',async()=>{const p=await preview([{action:'unit',data:{id:'expiry',kind:'block',name:'Expiry',active:true}}]);await db.query("update private.org_previews set expires_at=now()-interval '1 second' where id=$1",[p.id]);await expect(apply(p)).rejects.toThrow('hết hạn');});
it('invalid second command rolls back the first command',async()=>{await expect(preview([{action:'unit',data:{id:'rollback-unit',kind:'block',name:'Rollback',active:true}},{action:'assign',data:{unit_id:'rollback-unit',title_id:'missing',user_id:sale}}])).rejects.toThrow();expect(await scalar("select count(*)::int v from org_units where id='rollback-unit'")).toBe(0);});
it('required confirmation and reason are enforced server side',async()=>{const p=await preview([{action:'unit',data:{id:'confirmation',kind:'block',name:'Confirmation',active:true}}]);await expect(scalar("select org_change('apply',null,null,$1,'yes','reason') v",[p.id])).rejects.toThrow('xác nhận');});
it('inactive accounts cannot read or preview organization',async()=>{await db.query("update profiles set status='Tạm khóa' where id=$1",[outsider]);await actor(outsider);await expect(db.query('select org_workspace_read()')).rejects.toThrow();await expect(preview([{action:'unit',data:{id:'inactive',name:'Inactive',kind:'block'}}])).rejects.toThrow();await actor(admin);await db.query("update profiles set status='Đang hoạt động' where id=$1",[outsider]);});
it('scoped DENY wins against broad ALLOW',async()=>{await db.exec('BEGIN');try{await db.exec('ALTER TABLE base_org_state DISABLE TRIGGER org_canonical_fence');const c={units:[],titles:[],memberships:[],defaults:[],bundles:[],bindings:[],grants:[{id:'a',user_id:outsider,permission:'org.assign_staff',active:true,effect:'ALLOW',scope:'native'},{id:'b',user_id:outsider,permission:'org.assign_staff',active:true,effect:'DENY',scope:'native',unit_id:'marketing'}]};await db.query('insert into base_org_state(id,config) values(true,$1) on conflict(id) do update set config=excluded.config',[c]);expect(await scalar("select private.org_can($1,'org.assign_staff','gd') v",[outsider])).toBe(false);expect(await scalar("select private.org_can($1,'org.assign_staff',$2) v",[outsider,dep])).toBe(true);}finally{await db.exec('ROLLBACK');}});
it('cycle-safe traversal terminates and never enters an inactive branch',async()=>{expect(await scalar("select private.org_contains('marketing','gt') v")).toBe(true);expect(await scalar("select private.org_contains('missing','gt') v")).toBe(false);});
it('temporal preview rejects after an effectiveness boundary',async()=>{const p=await preview([{action:'unit',data:{id:'temporal',name:'Temporal',kind:'block',active:true}}]);await db.query("update private.org_previews set next_transition_at=now()-interval '1 second' where id=$1",[p.id]);await expect(apply(p)).rejects.toThrow('hiệu lực');});
it('unknown command fails closed',async()=>{await expect(preview([{action:'unknown',data:{}}])).rejects.toThrow('chưa được hỗ trợ');});
it('preserves raw historical start timestamps during backfill',async()=>{expect(await scalar("select starts_at v from org_assignments where source='biz_department_members' limit 1")).toEqual(await scalar('select started_at v from biz_department_members limit 1'));});
it('cannot grant an inherited administrative Role',async()=>{const id=await scalar("select id v from org_titles limit 1");await expect(preview([{action:'roles',data:{id,roles:[{role_id:'role-super-admin',is_primary:true}]}}])).rejects.toThrow();});
it('cannot activate an unverified inherited Role',async()=>{const id=await scalar("select id v from org_titles limit 1");await expect(preview([{action:'roles',data:{id,roles:[{role_id:'staff',is_primary:true,active:true}]}}])).rejects.toThrow();});
it('unused direct sources are not revoked when no assignment exists',async()=>{await actor(outsider);expect(await scalar('select count(*)::int v from user_roles where user_id=$1',[outsider])).toBe(1);await actor(admin);});
async function applyRoles(p:any){return scalar("select org_change('apply',null,null,$1,'ÁP DỤNG CƠ CẤU','ÁP DỤNG PHÂN QUYỀN:Kiểm thử tách biệt') v",[p.id]);}
it('full transaction previews Role sources, confirms and grants only after appointment',async()=>{
 await actor(admin);
 await apply(await preview([{action:'title',data:{id:'verified-title',unit_id:'gd',name:'Designer',code:'TEST_DESIGNER',level:0,kind:'staff',capacity:0,active:true}}]));
 const p=await preview([{action:'roles',data:{id:'verified-title',roles:[{role_id:'verified-designer',is_primary:true,scope_kind:'own',enabled_permissions:['order.view','order.view_mine','order.submit']}]}}]);
 expect(await scalar("select count(*)::int v from base_title_role_links where title_id='verified-title'")).toBe(0);
 await expect(apply(p)).rejects.toThrow('PHÂN QUYỀN');await applyRoles(p);
 expect(await scalar("select private.has_permission($1,'order.view') v",[outsider])).toBe(false);
 const a=await preview([{action:'assign',data:{unit_id:'gd',title_id:'verified-title',user_id:outsider,kind:'concurrent'}}]);
 expect(a.impact.some((i:any)=>i.user_id===outsider&&i.changes.some((c:any)=>c.key==='order.view'&&!c.before.allowed&&c.after.allowed))).toBe(true);
 expect(await scalar("select private.has_permission($1,'order.view') v",[outsider])).toBe(false);
 await apply(a);expect(await scalar("select private.has_permission($1,'order.view') v",[outsider])).toBe(true);
});
it('full transaction removes appointment rights and preserves original direct source',async()=>{
 const id=await scalar("select id v from org_assignments where title_id='verified-title' and user_id=$1",[outsider]);
 const p=await preview([{action:'end',data:{id,ends_at:new Date().toISOString()}}]);
 expect(p.impact.some((i:any)=>i.user_id===outsider)).toBe(true);
 await apply(p);expect(await scalar("select private.has_permission($1,'order.view') v",[outsider])).toBe(false);
 expect(await scalar('select role_id v from user_roles where user_id=$1',[outsider])).toBe('staff');
});
it('authenticated RPC and RLS reject unprivileged linking and hide configuration rows',async()=>{
 const revision=await scalar('select revision v from private.org_control where id');
 await actor(outsider);await db.exec('SET ROLE authenticated');
 try { expect(await scalar('select count(*)::int v from base_title_role_links')).toBe(0);
 await expect(db.query("select org_change('preview',$1,$2)",[revision,[{action:'roles',data:{id:'verified-title',roles:[]}}]])).rejects.toThrow('Super Admin');
 await expect(db.query("update base_title_role_links set enabled_permissions=ARRAY['settings.role']")).rejects.toThrow();
 }finally{await db.exec('RESET ROLE');await actor(admin);}
});
