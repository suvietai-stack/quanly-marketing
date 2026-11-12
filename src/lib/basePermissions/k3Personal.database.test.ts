import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';
const db = new PGlite();
const id = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const admin=id(1), marketing=id(2), design=id(3), hr=id(4), sales=id(5), locked=id(6), unassigned=id(7);
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const actor = (u:string)=>db.query("select set_config('test.uid',$1,false)",[u]);
const value = async <T>(sql:string,args:unknown[]=[]) => (await db.query<{v:T}>(sql,args)).rows[0]?.v;
beforeAll(async()=>{
  await db.exec(readFileSync('docs/k3-personal-2026-11-12/test-fixture.sql','utf8'));
  await db.exec(`insert into profiles values('${admin}','Admin','Đang hoạt động'),('${marketing}','Marketing','Đang hoạt động'),('${design}','Design','Đang hoạt động'),('${hr}','HR','Đang hoạt động'),('${sales}','Sales','Đang hoạt động'),('${locked}','Locked','Tạm khóa'),('${unassigned}','New','Đang hoạt động');
    insert into org_units values('mkt',true),('design',true),('hr',true);
    insert into org_assignments values('m','${marketing}','mkt','active','2026-01-01',null),('d','${design}','design','active','2026-01-01',null),('h','${hr}','hr','active','2026-01-01',null);
    insert into biz_departments values('${id(20)}','Sales');insert into biz_department_members values('${sales}','${id(20)}');`);
  await db.exec(readFileSync('drizzle/migrations/0383_k3_personal_company_access.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0384_k3_personal_invitation_guard.sql','utf8'));
},30000);
beforeEach(()=>db.exec('BEGIN'));
afterEach(()=>db.exec('ROLLBACK'));
afterAll(()=>db.close());
it.each([marketing,design,hr,unassigned])('active non-Biz %s uses personal K3 but gets no manager/settings/comment permission',async u=>{
  await actor(u);
  expect(await value<boolean>("select k3_can($1,'k3.use') v",[u])).toBe(true);
  for(const p of ['k3.view_scope','k3.comment','k3.settings']) expect(await value<boolean>('select k3_can($1,$2) v',[u,p])).toBe(false);
  expect(await value<boolean>('select private.k3_day_obligated($1,$2) v',[u,today])).toBe(false);
});
it('locked/null accounts fail closed and Admin DENY blocks self access',async()=>{
  expect(await value<boolean>("select k3_can($1,'k3.use') v",[locked])).toBe(false);
  expect(await value<boolean>("select k3_can(null,'k3.use') v")).toBe(false);
  await db.query("insert into test_denies values($1,'k3.use')",[marketing]);
  expect(await value<boolean>("select k3_can($1,'k3.use') v",[marketing])).toBe(false);
});
it('Marketing creates and updates a real own day, with org unit and no fabricated Biz department',async()=>{
  await actor(marketing);
  const day=await value<{id:string;org_unit_id:string;department_id:null}>('select k3_day_save($1,$2) v',[today,'Marketing day']);
  expect(day?.org_unit_id).toBe('mkt');expect(day?.department_id).toBeNull();
  await db.query('select k3_day_save($1,$2)',[today,'Updated day']);
  expect((await db.query('select kg from k3_days where id=$1',[day?.id])).rows).toEqual([{kg:'Updated day'}]);
  await actor(design);
  await expect(db.query('select k3_user_day_read($1,$2)',[marketing,today])).rejects.toThrow('không có quyền');
});
it('personal KG weekly creation and revision update works outside Biz, preserves owner and unit',async()=>{
  await actor(marketing);
  const goal=await value<{id:string;revision:number;org_unit_id:string;department_id:null}>('select k3_goal_save($1) v',[JSON.stringify({request_key:id(40),period_type:'week',period_start:today,name:'Marketing weekly KG'})]);
  expect(goal?.org_unit_id).toBe('mkt');expect(goal?.department_id).toBeNull();
  const updated=await value<{name:string}>('select k3_goal_save($1) v',[JSON.stringify({id:goal?.id,revision:goal?.revision,name:'Updated weekly KG'})]);
  expect(updated?.name).toBe('Updated weekly KG');
  await actor(hr);
  expect(await value<boolean>('select k3_goal_visible($1,$2) v',[hr,goal?.id])).toBe(false);
  await expect(db.query('select k3_goal_save($1)',[JSON.stringify({id:goal?.id,revision:goal?.revision,name:'Forbidden'})])).rejects.toThrow('không được sửa');
});
it('unassigned personal day remains unattributed; existing Sales department stays intact',async()=>{
  await actor(unassigned);const day=await value<{org_unit_id:null;department_id:null}>('select k3_day_save($1,$2) v',[today,'Personal']);
  expect(day?.org_unit_id).toBeNull();expect(day?.department_id).toBeNull();
  await actor(sales);const old=await value<{department_id:string}>('select k3_day_save($1,$2) v',[today,'Sales']);
  expect(old?.department_id).toBe(id(20));
  expect((await db.query('select company_effective_from,effective_from from k3_settings')).rows).toEqual([{company_effective_from:null,effective_from:new Date('2026-11-02')}]);
});
it('Marketing completes KG/KF/KPI result and personal review using real RPCs',async()=>{
  await actor(marketing);
  const g=await value<{id:string;revision:number}>('select k3_goal_save($1) v',[JSON.stringify({request_key:id(50),period_type:'custom',period_start:today,period_end:today,name:'Marketing work'})]);
  const a=await value<{id:string}>('select k3_action_save($1) v',[JSON.stringify({request_key:id(51),goal_id:g?.id,name:'Write content',start_date:today,due_date:today,inherit_timeline:true})]);
  const k=await value<{id:string}>('select k3_kpi_configure($1) v',[JSON.stringify({request_key:id(52),action_id:a?.id,name:'Content output',measure:'cumulative',target:2,unit:'pages',config:{}})]);
  await db.query('select k3_goal_activate($1,$2)',[g?.id,g?.revision]);
  await db.query('select k3_kpi_result_save($1)',[JSON.stringify({request_key:id(53),kpi_id:k?.id,work_date:today,value:2,revision:0})]);
  expect((await db.query('select user_id,value from k3_kpi_results where kpi_id=$1',[k?.id])).rows).toEqual([{user_id:marketing,value:'2'}]);
  const state=await value<{source_version:string;manual_status:string}>('select k3_employee_review_read($1) v',[today]);
  const source=await value<Record<string,unknown>>('select private.k3_employee_day_source($1,$2) v',[marketing,today]);
  const version=await value<string>('select private.k3_review_fingerprint($1) v',[JSON.stringify(source)]);
  await db.query('select k3_employee_review_confirm($1,$2,$3,true)',[today,version,id(54)]);
  expect((await db.query('select user_id,actor_id from k3_employee_reviews')).rows).toEqual([{user_id:marketing,actor_id:marketing}]);
  expect(state).toBeDefined();
  await actor(design);
  expect(await value<boolean>('select private.k3_result_can_write($1,$2) v',[design,k?.id])).toBe(false);
});
it('readiness admits personal k3.use only, rollback restores the old gate without deleting new history',async()=>{
  expect(await value<boolean>("select private.org_role_permission_ready('k3.use') v")).toBe(true);
  expect(await value<boolean>("select private.org_role_permission_ready('k3.view_scope') v")).toBe(false);
  await actor(marketing);await db.query('select k3_day_save($1,$2)',[today,'Keep history']);
  await db.exec(readFileSync('docs/k3-personal-2026-11-12/rollback.sql','utf8').replace('BEGIN;','').replace('COMMIT;',''));
  expect(await value<boolean>("select k3_can($1,'k3.use') v",[marketing])).toBe(false);
  expect((await db.query('select kg,org_unit_id from k3_days')).rows).toEqual([{kg:'Keep history',org_unit_id:'mkt'}]);
});
it('task save/update and day summary preserve owner-only behavior outside Biz',async()=>{
  await actor(hr);
  const t=await value<{id:string}>('select k3_task_save($1) v',[JSON.stringify({request_key:id(60),work_date:today,name:'HR task',kpi_target:1,kpi_actual:1,status:'done',progress:100})]);
  await db.query('select k3_task_update($1,$2,1,100,null,null,null,$3)',[t?.id,'done','Updated']);
  const d=await value<{confirmed_at:string}>('select k3_summary_confirm($1) v',[today]);expect(d?.confirmed_at).toBeTruthy();
  await actor(design);
  await expect(db.query('select k3_task_update($1,$2,1,100,null,null,null,null)',[t?.id,'done'])).rejects.toThrow('không được cập nhật');
});
it.each(['week','month'])('%s personal summary reads back outside Biz without exposing another employee',async type=>{
  await actor(marketing);
  const past='2026-10-01';
  await db.exec("update k3_settings set effective_from='2026-01-01',period_effective_from='2026-01-01'");
  await db.query('select k3_goal_save($1)',[JSON.stringify({request_key:id(80),period_type:type,period_start:past,name:'Completed period KG'})]);
  await db.query('select k3_period_summary_confirm($1,$2,$3)',[type,past,'Personal summary']);
  const result=await value<{user_id:string;summaries:{note:string;org_unit_id:string}[]}>('select k3_period_read($1,$2) v',[type,past]);
  expect(result?.user_id).toBe(marketing);
  expect(result?.summaries[0]?.note).toBe('Personal summary');
  expect(result?.summaries[0]?.org_unit_id).toBe('mkt');
  await actor(design);
  await expect(db.query('select k3_period_read($1,$2,$3)',[type,past,marketing])).rejects.toThrow('không có quyền');
});
it('quick-create used by the actual screen creates self-owned KG/KF/KPI and reads it back',async()=>{
  await actor(marketing);
  const result=await value<{goal_id:string}>('select k3_quick_create($1) v',[JSON.stringify({request_key:id(90),creation_mode:'basic',name:'Marketing screen flow',period_start:today,period_end:today,due_date:today,save_valid:true,expected_result:'Content ready',kpi:{name:'Ready',measure:'binary',target:1,unit:'work',config:{valid_condition:'Content ready'}}})]);
  expect(result?.goal_id).toBeTruthy();
  expect((await db.query('select user_id,org_unit_id,department_id from k3_goals where id=$1',[result?.goal_id])).rows).toEqual([{user_id:marketing,org_unit_id:'mkt',department_id:null}]);
  const day=await value<{actions:{name:string}[]}>('select k3_kpi_day_read($1) v',[today]);
  expect(day?.actions.map(a=>a.name)).toContain('Marketing screen flow');
  await actor(design);
  const other=await value<{actions:{name:string}[]}>('select k3_kpi_day_read($1) v',[today]);
  expect(other?.actions.map(a=>a.name)).not.toContain('Marketing screen flow');
});
it('personal-only Marketing cannot search or invite other employees',async()=>{
  await actor(marketing);
  const people=await value<{id:string}[]>('select k3_member_search($1) v',['']);
  expect(people?.map(p=>p.id)).toEqual([marketing]);
  const g=await value<{id:string}>('select k3_goal_save($1) v',[JSON.stringify({request_key:id(91),period_type:'week',period_start:today,name:'Personal only'})]);
  await expect(db.query('select k3_member_invite($1,$2)',[g?.id,[design]])).rejects.toThrow('chưa mở lời mời liên phòng');
});