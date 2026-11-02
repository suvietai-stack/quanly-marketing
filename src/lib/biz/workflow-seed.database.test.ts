import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db=new PGlite();
const admin='00000000-0000-0000-0000-000000000001';
const holder='00000000-0000-0000-0000-000000000002';
const employee='00000000-0000-0000-0000-000000000003';
const sysA='10000000-0000-0000-0000-000000000001';
const sysB='10000000-0000-0000-0000-000000000002';
const deptA='20000000-0000-0000-0000-000000000001';
const teamLeadPos='30000000-0000-0000-0000-000000000001';
const deptHeadPos='30000000-0000-0000-0000-000000000002';
const directorPos='30000000-0000-0000-0000-000000000003';
const deputyPos='30000000-0000-0000-0000-000000000004';
const execPos='30000000-0000-0000-0000-000000000005';
async function value(sql:string){return (await db.query<{v:any}>(sql)).rows[0]?.v;}
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT '${admin}'::uuid$$;
 CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
 CREATE TABLE biz_systems(id uuid PRIMARY KEY,name text,active boolean);
 CREATE TABLE biz_departments(id uuid PRIMARY KEY,name text,system_id uuid,active boolean);
 CREATE TABLE biz_teams(id uuid PRIMARY KEY,name text,department_id uuid,active boolean);
 CREATE TABLE biz_team_members(team_id uuid,user_id uuid,ended_at timestamptz);
 CREATE TABLE biz_positions(id uuid PRIMARY KEY,code text,name text,level integer,unit_kind text,active boolean,all_business boolean);
 CREATE TABLE biz_appointments(position_id uuid,user_id uuid,system_id uuid,department_id uuid,team_id uuid,scope_kind text,started_at timestamptz,ended_at timestamptz,status text);
 CREATE TABLE biz_management_assignments(position text,system_id uuid,department_id uuid,team_id uuid,user_id uuid,ended_at timestamptz);
 CREATE TABLE biz_org_events(actor_id uuid,action text,payload jsonb);
 CREATE FUNCTION public.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
 CREATE FUNCTION public.biz_workflow_manage() RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
 CREATE FUNCTION public.biz_department_at(uuid,date) RETURNS uuid LANGUAGE sql AS $$SELECT '${deptA}'::uuid$$;
 CREATE FUNCTION public.biz_resolve_position(_p uuid,_sys uuid,_dep uuid,_team uuid,_at timestamptz DEFAULT now()) RETURNS uuid LANGUAGE plpgsql AS $$BEGIN IF _p='${teamLeadPos}'::uuid THEN RETURN NULL;END IF;RETURN '${holder}'::uuid;END$$;
 INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${holder}','Holder','Đang hoạt động'),('${employee}','Nhân viên','Đang hoạt động');
 INSERT INTO biz_systems VALUES('${sysA}','Bán Lẻ',true),('${sysB}','Phân Phối',true);
 INSERT INTO biz_departments VALUES('${deptA}','Phòng A','${sysA}',true);
 INSERT INTO biz_positions VALUES
  ('${teamLeadPos}','team_lead','Trưởng Nhóm',1,'team',true,false),
  ('${deptHeadPos}','department_head','Trưởng Phòng',2,'department',true,false),
  ('${directorPos}','director','Giám Đốc',3,'system',true,false),
  ('${deputyPos}','deputy_executive_director','Phó Giám Đốc Điều hành',4,'system',true,true),
  ('${execPos}','executive_director','Giám Đốc Điều hành',5,'system',true,true);`);
 const sql=readFileSync('drizzle/migrations/0105_biz_sequential_approvals.sql','utf8');
 await db.exec(sql.slice(0,sql.indexOf('CREATE FUNCTION public.biz_workflow_manage')));
 await db.exec(`ALTER TABLE biz_approval_workflows DROP CONSTRAINT biz_approval_workflows_kind_check;ALTER TABLE biz_approval_workflows ADD CONSTRAINT biz_approval_workflows_kind_check CHECK(kind IN ('goal_year','rolling_plan','report_day','report_week','report_month','report_quarter','report_year','late_plan_month','late_plan_quarter','late_plan_year','late_report_day','late_report_week','late_report_month','late_report_quarter','late_report_year'));`);
 await db.exec(readFileSync('drizzle/migrations/0171_biz_default_workflow_templates.sql','utf8'));
},20000);
afterAll(()=>db.close());
it('seeds five template groups per active system with position-based steps',async()=>{
 const r=await value('SELECT biz_workflow_seed_defaults() v');
 expect(r.created.length).toBe(30);
 expect(r.skipped.length).toBe(0);
 const kinds=await value(`SELECT jsonb_agg(DISTINCT kind ORDER BY kind) v FROM biz_approval_workflows WHERE system_id='${sysA}'`);
 expect(kinds).toEqual(['goal_year','late_plan_month','late_plan_quarter','late_plan_year','late_report_day','late_report_month','late_report_quarter','late_report_week','late_report_year','report_day','report_month','report_quarter','report_week','report_year','rolling_plan']);
 const goalFlow=await value(`SELECT steps v FROM biz_approval_workflows WHERE system_id='${sysA}' AND kind='goal_year'`);
 expect(goalFlow.map((s:any)=>s.type)).toEqual(['position','position','position']);
 expect(goalFlow.every((s:any)=>s.skip_if_submitter===true)).toBe(true);
});
it('activates only flows whose positions all resolve; missing team lead keeps flows incomplete',async()=>{
 const rolling=await value(`SELECT active v FROM biz_approval_workflows WHERE system_id='${sysA}' AND kind='rolling_plan'`);
 expect(rolling).toBe(true);
 const goalYear=await value(`SELECT active v FROM biz_approval_workflows WHERE system_id='${sysA}' AND kind='goal_year'`);
 expect(goalYear).toBe(false);
 const latePlan=await value(`SELECT active v FROM biz_approval_workflows WHERE system_id='${sysA}' AND kind='late_plan_month'`);
 expect(latePlan).toBe(true);
});
it('second seed run is idempotent and never overwrites existing workflows',async()=>{
 const before=await value('SELECT count(*)::int v FROM biz_approval_workflows');
 const r=await value('SELECT biz_workflow_seed_defaults() v');
 expect(r.created.length).toBe(0);
 expect(r.skipped.length).toBe(30);
 expect(await value('SELECT count(*)::int v FROM biz_approval_workflows')).toBe(before);
});
it('simulate resolves the real approval chain for a chosen employee',async()=>{
 const r=await value(`SELECT biz_workflow_simulate('rolling_plan','${employee}') v`);
 expect(r.error).toBeUndefined();
 expect(r.steps.length).toBe(2);
 expect(r.steps[0].label).toBe('Trưởng Phòng');
 expect(r.steps[0].user_name).toBe('Holder');
 expect(r.steps.every((s:any)=>!s.missing)).toBe(true);
});
it('simulate reports a clear reason when no active workflow exists',async()=>{
 const inactive=await value(`SELECT biz_workflow_simulate('goal_year','${employee}') v`);
 expect(inactive.error).toContain('Chưa có luồng hoạt động');
 const none=await value(`SELECT biz_workflow_simulate('report_year','${employee}') v`);
 expect(none.error).toContain('Chưa có luồng hoạt động');
});
