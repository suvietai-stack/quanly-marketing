import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest';

const dir = 'docs/role-grant-expansion-2026-11-12/';
const snapshot = JSON.parse(readFileSync(dir + 'snapshot.json', 'utf8'));
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const person = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
const newKeys = ['att.edit_own', 'leave.edit_own'];
const definition = (name: string, schema = 'private'): string => {
  const row = snapshot.functions.find((f: { name: string; schema: string }) => f.name === name && f.schema === schema);
  if (!row) throw new Error(name);
  return row.definition;
};
const value = async (sql: string, args: unknown[] = []) => (await db.query<{ v: any }>(sql, args)).rows[0]?.v;
const candidate = readFileSync(dir + 'candidate.sql', 'utf8');
const bodies = candidate.slice(candidate.indexOf('CREATE OR REPLACE FUNCTION'), candidate.lastIndexOf('COMMIT;'));
const config = {
  units: [{ id: 'company', kind: 'company', active: true }, { id: 'marketing', code: 'marketing', kind: 'block', active: true, parent_id: 'company' }],
  titles: [{ id: 'title', active: true }],
  memberships: [{ id: 'appointment', user_id: person, unit_id: 'marketing', title_id: 'title', active: true, status: 'active', specialty_ids: ['seo'] }],
};
beforeAll(async () => {
  await db.exec(`create schema private; create schema auth;
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.actor',true),'')::uuid$$;
    create table profiles(id uuid primary key,status text,is_system_admin boolean default false);
    create table app_roles(id text primary key,name text,permissions text[],role_kind text,catalog_generation int,catalog_state text,is_system boolean default false);
    create table user_roles(user_id uuid,role_id text,source_kind text);
    create table user_permission_overrides(user_id uuid primary key,use_custom boolean,permissions text[],mode text,source_kind text,updated_at timestamptz default now());
    create table base_permission_catalog(key text primary key,label text,module text);
    create table org_position_roles(unit_id text,title_id text,role_id text);
    create table mkt_specialties(id text,role_id text,active boolean,name text);
    create table mkt_staff_specialties(user_id uuid,specialty_id text,state text,eligibility_enforced boolean);
    create table private.staff_permission_previews(id uuid primary key default gen_random_uuid(),actor_id uuid,target_id uuid,permissions text[],baseline text,created_at timestamptz default now(),expires_at timestamptz default now()+interval '10 minutes',applied_at timestamptz);
    create table account_permission_changes(actor_id uuid,target_id uuid,before_data jsonb,after_data jsonb,reason text);
    create table biz_appointments(id text);create table biz_department_members(id text);create table biz_management_assignments(id text);create table biz_member_affiliations(id text);
    create table fixture(config jsonb);create table deny_rules(user_id uuid,rule jsonb);
    create function private.cleanup_is_biz_staff(uuid) returns boolean language sql as $$select false$$;
    create function private.legacy_reset_applies(uuid) returns boolean language sql as $$select false$$;
    create function private.base_config() returns jsonb language sql as $$select config from fixture$$;
    create function public.biz_can(uuid,text) returns boolean language sql as $$select false$$;
    create function public.k3_can(uuid,text) returns boolean language sql as $$select false$$;
    create function public.biz_admin(uuid) returns boolean language sql as $$select false$$;
    create function private.base_crm_legacy(uuid,text) returns boolean language sql as $$select false$$;`);
  for (const row of snapshot.catalog) await db.query('insert into base_permission_catalog values($1,$2,$3)', [row.key,row.label,row.module]);
  for (const name of ['is_active','is_super_admin','is_admin','base_valid_at','base_role_unit_contains','org_role_permission_ready','mkt_specialty_permission_ready','permission_editor_policy','common_permission_ready','common_role_rules','role_editor_validate','org_slot_rules','org_assignment_specialty_rules']) await db.exec(definition(name));
  await db.exec(`create function private.org_marketing_eligible(u uuid,c jsonb) returns boolean language sql as $$select exists(select 1 from jsonb_array_elements(c->'memberships') m where m->>'user_id'=u::text and private.base_valid_at(m))$$;`);
  for (const name of ['mkt_specialty_rules','org_role_previous_supported','mkt_prev_supported','base_supported']) await db.exec(definition(name));
  await db.exec(`create function private.reset_previous_base_rules(u uuid,c jsonb) returns jsonb language sql as $$select private.org_slot_rules(u,c)||private.org_assignment_specialty_rules(u,c)||private.mkt_specialty_rules(u,c)||coalesce((select jsonb_agg(rule) from deny_rules where user_id=u),'[]')$$;`);
  for (const name of ['base_rules','base_decision','base_tier1','has_permission','base_legacy','base_effective','supplement_permission_guard','staff_permission_validate','supplement_permission_state','sig_can']) await db.exec(definition(name));
  for (const name of ['permission_editor_read','account_supplement_preview','account_supplement_save']) await db.exec(definition(name,'public'));
  await db.exec(`create table attendance_explanations(id uuid,owner_id uuid,recalled boolean default false,reconciled boolean default false,recalled_at timestamptz,updated_at timestamptz);
    create table attendance_explanation_events(explanation_id uuid,actor_id uuid,action text);
    insert into profiles values('${admin}','Đang hoạt động',false),('${person}','Đang hoạt động',false),('${other}','Đang hoạt động',false);
    insert into user_roles values('${admin}','role-super-admin','system');
    insert into app_roles values('common','Common','{}','common',2,'standard',false),('position','Position','{}','position',2,'standard',false),('task','SEO','{}','marketing_task',2,'standard',false);
    insert into org_position_roles values('marketing','title','position');insert into mkt_specialties values('seo','task',true,'SEO');`);
  await db.exec(definition('att_recall','public'));
  await db.exec(`create table leave_requests(id uuid,owner_id uuid,status text,type text,payload jsonb,reason_name text,detail text,approver_id uuid,calc jsonb,is_late boolean,late_reason text,mark_at timestamptz,applied jsonb,reason_id text,updated_at timestamptz,submission_no int);
    create table leave_request_submissions(request_id uuid,no int,payload jsonb,calc jsonb,reason_id text,reason_name text,detail text,approver_id uuid,is_late boolean,late_reason text);
    create function private.leave_prepare(uuid,text,jsonb,text,text,uuid,text) returns jsonb language sql as $$select '{"calc":{"mark_at":"2030-01-01T00:00:00Z"},"exception":false}'::jsonb$$;
    create function private.leave_log(uuid,text,jsonb) returns void language sql as $$select$$;`);
  await db.exec(definition('leave_update','public'));
  await db.query('insert into fixture values($1)',[config]);
},30000);
beforeEach(async () => {
  await db.exec(bodies);
  await db.exec(`update profiles set status='Đang hoạt động';update app_roles set permissions='{}';delete from user_roles where role_id<>'role-super-admin';delete from user_permission_overrides;delete from deny_rules;delete from private.staff_permission_previews;delete from account_permission_changes;delete from attendance_explanations;delete from attendance_explanation_events;delete from mkt_staff_specialties;`);
  await db.query('update fixture set config=$1',[config]);
  await db.query("select set_config('test.actor',$1,false)",[admin]);
});
afterAll(() => db.close());
const has = (user: string, key: string) => value('select private.has_permission($1,$2) v',[user,key]);
const preview = (keys: string[]) => value('select account_supplement_preview($1,$2) v',[person,keys]);
const save = (p: {fingerprint: string}, keys: string[]) => value('select account_supplement_save($1,$2,$3,$4,$5) v',[person,[],keys,p.fingerprint,'isolated test only']);

it('actual expansion is exactly two newly universal keys; 43 policy and 15 personal stay unchanged',async()=>{
  const before: string[]=[];
  await db.exec(definition('mkt_specialty_permission_ready'));
  for(const row of snapshot.catalog) if(await value('select private.common_permission_ready($1) and private.mkt_specialty_permission_ready($1) v',[row.key])) before.push(row.key);
  expect(before).toHaveLength(12);await db.exec(bodies);
  const policy=await value('select permission_editor_read() v');
  expect(policy).toHaveLength(43);expect(policy.filter((p:any)=>p.personal)).toHaveLength(15);
  expect(policy.filter((p:any)=>p.grantable&&!before.includes(p.key)).map((p:any)=>p.key).sort()).toEqual(newKeys);
  expect(policy.filter((p:any)=>p.grantable)).toHaveLength(14);
});
it('common accepts both keys and actual evaluator emits common provenance without appointments',async()=>{
  await db.query('update fixture set config=$1',[{...config,memberships:[]}]);
  await db.query("select private.role_editor_validate('common',$1,'{}')",[newKeys]);
  await db.query("update app_roles set permissions=$1 where id='common'",[newKeys]);
  for(const k of newKeys) expect(await has(person,k)).toBe(true);
  const rows=await value('select private.base_effective($1,private.base_config()) v',[person]);
  expect(rows.find((r:any)=>r.key==='att.edit_own').sources[0].source_kind).toBe('common');
});
it('position accepts both keys and reads the actual unit/title binding',async()=>{
  await db.query("select private.role_editor_validate('position',$1,'{}')",[newKeys]);
  await db.query("update app_roles set permissions=$1 where id='position'",[newKeys]);
  for(const k of newKeys){expect(await has(person,k)).toBe(true);expect(await has(other,k)).toBe(false);}
});
it('Marketing task accepts both keys and canonical assignment source makes them effective',async()=>{
  await db.query("select private.role_editor_validate('marketing_task',$1,'{}')",[newKeys]);
  await db.query("update app_roles set permissions=$1 where id='task'",[newKeys]);
  for(const k of newKeys) expect(await has(person,k)).toBe(true);
});
it('personal preview/save uses exact validators and audited additive writer in isolated DB only',async()=>{
  const p=await preview(newKeys);expect(p.added.sort()).toEqual(newKeys);await save(p,newKeys);
  for(const k of newKeys){expect(await has(person,k)).toBe(true);expect(await has(other,k)).toBe(false);}
  expect(await value('select count(*)::int v from account_permission_changes')).toBe(1);
});
it('explicit DENY defeats all four simultaneous sources including personal fallback',async()=>{
  await db.query('update app_roles set permissions=$1',[newKeys]);await save(await preview(newKeys),newKeys);
  for(const k of newKeys)await db.query('insert into deny_rules values($1,$2)',[person,{permission:k,effect:'DENY'}]);
  for(const k of newKeys)expect(await has(person,k)).toBe(false);
});
it('inactive account has no permissions even with common/task/personal grants',async()=>{
  await db.query('update app_roles set permissions=$1',[newKeys]);await save(await preview(newKeys),newKeys);
  await db.query("update profiles set status='Tạm khóa' where id=$1",[person]);
  for(const k of newKeys)expect(await has(person,k)).toBe(false);
});
it('expired appointments and non-Marketing unit cannot supply task permissions',async()=>{
  await db.query("update app_roles set permissions=$1 where id='task'",[newKeys]);
  await db.query('update fixture set config=$1',[{...config,memberships:config.memberships.map(m=>({...m,ends_at:'2000-01-01T00:00:00Z'}))}]);
  expect(await has(person,'att.edit_own')).toBe(false);
  await db.query('update fixture set config=$1',[{...config,units:config.units.map(u=>u.id==='marketing'?{...u,code:'sales',kind:'department'}:u)}]);
  expect(await has(person,'att.edit_own')).toBe(false);
});
it('native own guard rejects cross-owner attendance recall despite grant',async()=>{
  await db.query("update app_roles set permissions='{att.edit_own}' where id='common'");
  await db.query("select set_config('test.actor',$1,false)",[person]);
  await db.query('insert into attendance_explanations(id,owner_id) values($1,$2)',[other,other]);
  await expect(db.query('select att_recall($1)',[other])).rejects.toThrow('quyền');
  await db.query('update attendance_explanations set owner_id=$1',[person]);
  await db.query('select att_recall($1)',[other]);expect(await value('select recalled v from attendance_explanations')).toBe(true);
});
it('native reconciled workflow guard still blocks own recall',async()=>{
  await db.query("update app_roles set permissions='{att.edit_own}' where id='common'");
  await db.query("select set_config('test.actor',$1,false)",[person]);
  await db.query('insert into attendance_explanations(id,owner_id,reconciled) values($1,$2,true)',[other,person]);
  await expect(db.query('select att_recall($1)',[other])).rejects.toThrow('đối chiếu');
});
it('exact leave_update enforces owner and pending state even with new universal grant',async()=>{
  await db.query("update app_roles set permissions='{leave.edit_own}' where id='common'");
  await db.query("select set_config('test.actor',$1,false)",[person]);
  await db.exec('delete from leave_requests');
  await db.query("insert into leave_requests(id,owner_id,status,type) values($1,$2,'pending','leave')",[other,other]);
  const call=()=>db.query("select leave_update($1,'{}','test','test',$2,null)",[other,admin]);
  await expect(call()).rejects.toThrow('quyền');
  await db.query("update leave_requests set owner_id=$1,status='approved'",[person]);
  await expect(call()).rejects.toThrow('Chờ duyệt');
  await db.exec("update leave_requests set status='pending'");await call();
  expect(await value('select payload v from leave_requests')).toEqual({});
});
it('privileged, company/unit and 3K keys remain blocked universally',async()=>{
  for(const k of ['settings.role','super_admin','leave.view_all','leave.view_unit','k3.use']){
    await expect(db.query("select private.role_editor_validate('common',$1,'{}')",[[k]])).rejects.toThrow();
    if(k!=='k3.use') await expect(preview([k])).rejects.toThrow();
  }
  // Existing personal k3.use policy is intentionally untouched: not newly universal.
  const policy=await value('select permission_editor_read() v');
  expect(policy.find((p:any)=>p.key==='k3.use').grantable).toBe(false);
  await expect(db.query("select private.role_editor_validate('marketing_task','{leave.view_unit}','{}')")).rejects.toThrow();
});
it('unauthorized caller, self and Super Admin targets stay protected',async()=>{
  await expect(db.query('select account_supplement_preview($1,$2)',[admin,newKeys])).rejects.toThrow('bảo vệ');
  await db.query("select set_config('test.actor',$1,false)",[other]);await expect(preview(newKeys)).rejects.toThrow('Không có quyền');
});
it('competing personal saves serialize and the second stale baseline fails closed',async()=>{
  const a=await preview(['att.edit_own']),b=await preview(['leave.edit_own']);
  const results=await Promise.allSettled([save(a,['att.edit_own']),save(b,['leave.edit_own'])]);
  expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1);
  expect(await value('select count(*)::int v from account_permission_changes')).toBe(1);
});
it('expired previews cannot save and replace legacy remains untouched',async()=>{
  const p=await preview(newKeys);await db.exec("update private.staff_permission_previews set expires_at=now()-interval '1 minute'");
  await expect(save(p,newKeys)).rejects.toThrow('xem trước');
  await db.query("insert into user_permission_overrides values($1,true,$2,'replace','legacy',now())",[person,newKeys]);
  await expect(preview(newKeys)).rejects.toThrow('cũ');expect(await value('select mode v from user_permission_overrides')).toBe('replace');
});
it('full executable candidate fails closed on mismatched preflight before changing functions',async()=>{
  const before=await value("select pg_get_functiondef('private.mkt_specialty_permission_ready(text)'::regprocedure) v");
  await expect(db.exec(candidate)).rejects.toThrow('Baseline/owner/ACL mismatch');await db.exec('ROLLBACK');
  expect(await value("select pg_get_functiondef('private.mkt_specialty_permission_ready(text)'::regprocedure) v")).toBe(before);
});
it('rollback restores exact live functions and rejects rollback after a concurrent function change',async()=>{
  await db.exec(readFileSync(dir+'rollback.sql','utf8'));
  for(const [name,schema] of [['mkt_specialty_permission_ready','private'],['permission_editor_read','public']])expect(await value('select pg_get_functiondef(oid) v from pg_proc where proname=$1 and pronamespace=$2::regnamespace',[name,schema])).toBe(definition(name,schema));
  await expect(db.query("select private.role_editor_validate('marketing_task',$1,'{}')",[newKeys])).rejects.toThrow();
  await db.exec(bodies);await db.exec("create or replace function private.mkt_specialty_permission_ready(p text) returns boolean language sql immutable as $$select false$$");
  await expect(db.exec(readFileSync(dir+'rollback.sql','utf8'))).rejects.toThrow('Rollback conflict');await db.exec('ROLLBACK');
});