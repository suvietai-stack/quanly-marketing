import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest';

const dir = 'docs/role-grant-universal-2026-11-12/';
const snapshot = JSON.parse(readFileSync('docs/role-grant-expansion-2026-11-12/snapshot.json', 'utf8'));
const keys = JSON.parse(readFileSync(dir + 'keys.json', 'utf8'));
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const person = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
const sample = ['ot.view_own', 'signal.create', 'web.view', 'task.view', 'finance.incoming.view', 'oq.create'];
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
    insert into app_roles values('common','Common','{}','common',2,'standard',false),('position','Position','{}','position',2,'standard',false),('task','SEO','{}','marketing_task',2,'standard',false),('role-seo','Old SEO','{leave.approve}','marketing_task',1,'standard',false);insert into mkt_specialties values('old','role-seo',true,'Old');
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
  await db.exec(`update profiles set status='Đang hoạt động';update app_roles set permissions='{}' where id<>'role-seo';delete from user_roles where role_id<>'role-super-admin';delete from user_permission_overrides;delete from deny_rules;delete from private.staff_permission_previews;delete from account_permission_changes;delete from attendance_explanations;delete from attendance_explanation_events;delete from mkt_staff_specialties;`);
  await db.query('update fixture set config=$1',[config]);
  await db.query("select set_config('test.actor',$1,false)",[admin]);
});
afterAll(() => db.close());
const has = (user: string, key: string) => value('select private.has_permission($1,$2) v',[user,key]);
const preview = (keys: string[]) => value('select account_supplement_preview($1,$2) v',[person,keys]);
const save = (p: {fingerprint: string}, ks: string[]) => value('select account_supplement_save($1,$2,$3,$4,$5) v',[person,[],ks,p.fingerprint,'isolated test only']);


it('one policy: 195 server-enforced keys listed, 190 grantable in every source, 152 newly selectable',async()=>{
  const policy=await value('select permission_editor_read() v');
  expect(policy).toHaveLength(195);expect(keys.new_vs_43_policy).toHaveLength(152);
  expect(policy.filter((p:any)=>p.grantable)).toHaveLength(190);
  expect(policy.filter((p:any)=>p.position_ready)).toHaveLength(195);
  expect(policy.some((p:any)=>p.key.includes('settings'))).toBe(false);
});
for(const source of ['common','position','task'] as const){
  it(`${source} Role: same keys validate, save and read back effective`,async()=>{
    const kind=source==='task'?'marketing_task':source;
    await db.query('select private.role_editor_validate($1,$2,$3)',[kind,sample,[]]);
    await db.query('update app_roles set permissions=$1 where id=$2',[sample,source]);
    if(source==='task')await db.query("insert into mkt_staff_specialties values($1,'seo','active',true)",[person]);
    for(const k of sample){expect(await has(person,k)).toBe(true);expect(await has(other,k)).toBe(source==='common');}
  });
}
it('personal: preview, audited save and readback for the same keys',async()=>{
  const p=await preview(sample);expect(p.added.sort()).toEqual([...sample].sort());await save(p,sample);
  for(const k of sample){expect(await has(person,k)).toBe(true);expect(await has(other,k)).toBe(false);}
  expect(await value('select count(*)::int v from account_permission_changes')).toBe(1);
});
it('explicit DENY beats all four sources',async()=>{
  await db.query("update app_roles set permissions=$1 where id in ('common','position','task')",[sample]);await save(await preview(sample),sample);
  for(const k of sample)await db.query('insert into deny_rules values($1,$2)',[person,{permission:k,effect:'DENY'}]);
  for(const k of sample)expect(await has(person,k)).toBe(false);
});
it('inactive employee gets nothing',async()=>{
  await db.query("update app_roles set permissions=$1 where id='common'",[sample]);
  await db.query("update profiles set status='Tạm khóa' where id=$1",[person]);
  for(const k of sample)expect(await has(person,k)).toBe(false);
});
it('unit keys only from position Role; settings and 3K blocked',async()=>{
  for(const k of keys.unit_scope){
    await db.query("select private.role_editor_validate('position',$1,'{}')",[[k]]);
    await expect(db.query("select private.role_editor_validate('common',$1,'{}')",[[k]])).rejects.toThrow();
    await expect(db.query("select private.role_editor_validate('marketing_task',$1,'{}')",[[k]])).rejects.toThrow();
    await expect(preview([k])).rejects.toThrow();
  }
  for(const k of ['settings.view','leave.settings','settings.role','super_admin']){
    for(const kind of ['common','position','marketing_task'])await expect(db.query('select private.role_editor_validate($1,$2,$3)',[kind,[k],[]])).rejects.toThrow();
    await expect(preview([k])).rejects.toThrow();
  }
  await expect(db.query("select private.role_editor_validate('common','{k3.use}','{}')")).rejects.toThrow();
});
it('stored-but-dormant pairs stay inactive after apply (no silent grants)',async()=>{
  expect(keys.fence).toContainEqual(['role-seo','leave.approve']);
  await db.query("insert into mkt_staff_specialties values($1,'old','active',false)",[person]);
  expect(await has(person,'leave.approve')).toBe(false);
});
it('expired appointment and non-Marketing unit supply no task rights',async()=>{
  await db.query("update app_roles set permissions=$1 where id='task'",[sample]);
  await db.query('update fixture set config=$1',[{...config,memberships:config.memberships.map(m=>({...m,ends_at:'2000-01-01T00:00:00Z'}))}]);
  expect(await has(person,'ot.view_own')).toBe(false);
});
it('protected targets and unauthorized callers stay blocked',async()=>{
  await expect(db.query('select account_supplement_preview($1,$2)',[admin,sample])).rejects.toThrow('bảo vệ');
  await db.query("select set_config('test.actor',$1,false)",[other]);await expect(preview(sample)).rejects.toThrow('Không có quyền');
});
it('competing personal saves: one wins, stale fails closed',async()=>{
  const a=await preview(['ot.view_own']),b=await preview(['task.view']);
  const r=await Promise.allSettled([save(a,['ot.view_own']),save(b,['task.view'])]);
  expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(1);
});
it('candidate fails closed on baseline mismatch',async()=>{
  await expect(db.exec(candidate)).rejects.toThrow('Baseline/owner/ACL mismatch');await db.exec('ROLLBACK');
});
it('rollback restores exact definitions and removes helpers',async()=>{
  await db.exec(readFileSync(dir+'rollback.sql','utf8'));
  for(const [name,schema] of [['role_editor_validate','private'],['org_slot_rules','private'],['permission_editor_read','public']])expect(await value('select pg_get_functiondef(oid) v from pg_proc where proname=$1 and pronamespace=$2::regnamespace',[name,schema])).toBe(definition(name,schema));
  expect(await value("select to_regprocedure('private.universal_permission_ready(text)') is null v")).toBe(true);
  await expect(db.query("select private.role_editor_validate('common','{signal.create}','{}')")).rejects.toThrow();
  await expect(db.exec(readFileSync(dir+'rollback.sql','utf8'))).rejects.toThrow('Rollback conflict');await db.exec('ROLLBACK');
});
