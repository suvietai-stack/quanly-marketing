import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest';

// Per-action RLS/trigger tests with the real staged resolver; isolated PGlite replay of the staged role-permission-full (510/510) candidate against exact live definitions. Never touches production.
const dir = 'docs/role-permission-full-2026-11-12/';
const snapshot = JSON.parse(readFileSync(dir + 'snapshot.json', 'utf8'));
const keys = JSON.parse(readFileSync(dir + 'keys.json', 'utf8'));
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const person = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
const outsider = '00000000-0000-0000-0000-000000000004';
const K = 'ot.view_own';
const sample = ['ot.view_own', 'signal.create', 'web.view', 'task.view', 'finance.incoming.view', 'oq.create', 'att.edit_own'];
const definition = (name: string, schema = 'private'): string => {
  const row = snapshot.functions.find((f: { name: string; schema: string }) => f.name === name && f.schema === schema);
  if (!row) throw new Error(name);
  return row.definition;
};
const value = async (sql: string, args: unknown[] = []) => (await db.query<{ v: any }>(sql, args)).rows[0]?.v;
const candidate = readFileSync(dir + 'candidate.sql', 'utf8');
const rollback = readFileSync(dir + 'rollback.sql', 'utf8');
const bodies = candidate.slice(candidate.indexOf('-- ===== CHANGES'), candidate.lastIndexOf('COMMIT;'));
const config = {
  units: [{ id: 'company', kind: 'company', active: true }, { id: 'marketing', code: 'marketing', kind: 'block', active: true, parent_id: 'company' }, { id: 'sales', kind: 'block', active: true, parent_id: 'company' }],
  titles: [{ id: 'title', active: true }],
  memberships: [
    { id: 'appointment', user_id: person, unit_id: 'marketing', title_id: 'title', active: true, status: 'active', specialty_ids: ['seo'] },
    { id: 'appointment-other', user_id: other, unit_id: 'marketing', title_id: 'title', active: true, status: 'active', specialty_ids: ['seo'] },
  ],
};
const setRole = (id: string, perms: string[]) => db.query('update app_roles set permissions=$1 where id=$2', [perms, id]);
const has = (user: string, key: string) => value('select private.has_permission($1,$2) v', [user, key]);
const preview = (allow: string[], deny: string[] = [], target = person) => value('select account_supplement_preview($1,$2,$3) v', [target, allow, deny]);
const save = (p: { fingerprint: string }, allow: string[], deny: string[] = []) => value('select account_supplement_save($1,$2,$3,$4,$5,$6) v', [person, [], allow, deny, p.fingerprint, 'isolated test only']);
const personal = async (allow: string[], deny: string[] = []) => save(await preview(allow, deny), allow, deny);
const effective = async (user: string, key: string) => (await value('select private.base_effective($1,private.base_config()) v', [user])).find((p: any) => p.key === key);
let parityBefore: Record<string, boolean> = {};

async function seedParity() {
  await setRole('common', ['leave.create', 'leave.view_own', 'att.create', 'att.view_own', 'leave.edit_own', 'leave.recall', 'att.edit_own']);
  await setRole('position', ['ot.view_own', 'leave.view_unit', 'signal.sale', 'finance.incoming.view']);
  await setRole('task', ['web.view', 'web.content_view', 'task.view']);
  await db.query("insert into mkt_staff_specialties values($1,'seo','active',true)", [person]);
}
async function vector(user: string) {
  const out: Record<string, boolean> = {};
  for (const row of snapshot.catalog) out[row.key] = await has(user, row.key);
  return out;
}

beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema private; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.actor',true),'')::uuid$$;
    create table profiles(id uuid primary key,status text,is_system_admin boolean default false);
    create table app_roles(id text primary key,name text,permissions text[],role_kind text,catalog_generation int,catalog_state text,is_system boolean default false);
    create table user_roles(user_id uuid,role_id text,source_kind text);
    create table user_permission_overrides(user_id uuid primary key references auth.users(id) on delete cascade,use_custom boolean not null default false,permissions text[] not null default '{}',mode text not null default 'replace',source_kind text not null default 'legacy',updated_at timestamptz default now());
    create table base_permission_catalog(key text primary key,label text,module text);
    create table org_position_roles(unit_id text,title_id text,role_id text);
    create table org_assignments(id text,user_id uuid,unit_id text,status text,starts_at timestamptz,ends_at timestamptz);
    create table mkt_specialties(id text,role_id text,active boolean,name text);
    create table mkt_staff_specialties(user_id uuid,specialty_id text,state text,eligibility_enforced boolean);
    create table private.staff_permission_previews(id uuid primary key default gen_random_uuid(),actor_id uuid not null,target_id uuid not null,permissions text[] not null,baseline text not null,created_at timestamptz default now(),expires_at timestamptz default now()+interval '10 minutes',applied_at timestamptz);
    create table account_permission_changes(actor_id uuid,target_id uuid,before_data jsonb,after_data jsonb,reason text);
    create table biz_appointments(id text,user_id uuid,status text,started_at timestamptz,ended_at timestamptz,position_snapshot jsonb);create table biz_approval_runs(status text,steps jsonb,current_step int);create function private.biz_source_ok(uuid,timestamptz) returns boolean language sql as $$select false$$;create table biz_department_members(id text);create table biz_management_assignments(id text);create table biz_member_affiliations(id text);
    create table leave_requests(id uuid,owner_id uuid,approver_id uuid,status text,cancel_state text);
    create table attendance_explanations(id uuid,owner_id uuid,recalled boolean default false,reconciled boolean default false,recalled_at timestamptz,updated_at timestamptz);
    create table attendance_explanation_events(explanation_id uuid,actor_id uuid,action text);
    create table fixture(config jsonb);create table biz_admins(user_id uuid);
    create function private.cleanup_is_biz_staff(uuid) returns boolean language sql as $$select false$$;
    create function private.legacy_reset_applies(uuid) returns boolean language sql as $$select false$$;
    create function private.legacy_business_allowed(uuid) returns boolean language sql as $$select true$$;
    create function private.base_config() returns jsonb language sql as $$select config from fixture$$;
    create function public.biz_can(uuid,text) returns boolean language sql as $$select false$$;
    create function public.is_super_admin(u uuid) returns boolean language plpgsql as $$begin return private.is_super_admin(u); end$$;
    create function public.biz_admin(u uuid) returns boolean language sql as $$select exists(select 1 from biz_admins where user_id=u)$$;
    create function public.biz_manager(uuid) returns boolean language sql as $$select false$$;
    create function public.biz_all_scope(uuid) returns boolean language sql as $$select false$$;
    create function private.base_crm_legacy(uuid,text) returns boolean language sql as $$select false$$;
    create function public.biz_exception_ok(uuid,text) returns boolean language sql as $$select false$$;
    create function public.biz_participant(uuid) returns boolean language sql as $$select false$$;
    create table org_units(id text primary key,parent_id text,active boolean);
    insert into org_units values('company',null,true),('marketing','company',true),('sales','company',true);
    create function private.org_config() returns jsonb language sql as $$select config from fixture$$;`);
  for (const row of snapshot.catalog) await db.query('insert into base_permission_catalog values($1,$2,$3)', [row.key, row.label, row.module]);
  for (const name of ['is_active', 'is_super_admin', 'is_admin', 'base_valid_at', 'base_role_unit_contains', 'org_role_permission_ready', 'mkt_specialty_permission_ready', 'permission_editor_policy', 'common_permission_ready', 'common_role_rules', 'role_editor_validate', 'org_slot_rules', 'org_assignment_specialty_rules']) await db.exec(definition(name));
  await db.exec(`create function private.org_marketing_eligible(u uuid,c jsonb) returns boolean language sql as $$select exists(select 1 from jsonb_array_elements(c->'memberships') m where m->>'user_id'=u::text and private.base_valid_at(m))$$;`);
  for (const name of ['mkt_specialty_rules', 'org_role_previous_supported', 'mkt_prev_supported', 'base_supported']) await db.exec(definition(name));
  await db.exec(`create function private.org_role_rules(u uuid,c jsonb) returns jsonb language sql as $$select private.org_slot_rules(u,c)$$;
    create function private.reset_previous_base_rules(u uuid,c jsonb) returns jsonb language sql as $$select private.org_slot_rules(u,c)||private.org_assignment_specialty_rules(u,c)||private.mkt_specialty_rules(u,c)$$;`);
  for (const name of ['base_rules', 'base_decision', 'base_tier1', 'has_permission', 'base_legacy', 'base_effective', 'supplement_permission_guard', 'staff_permission_validate', 'supplement_permission_state', 'sig_can', 'k3_personal_denied', 'org_permission_unit_member', 'kpi_can', 'org_contains', 'org_can']) await db.exec(definition(name));
  for (const name of ['permission_editor_read', 'account_supplement_preview', 'account_supplement_save', 'account_supplement_read', 'k3_can', 'att_recall', 'biz_can']) await db.exec(definition(name, 'public'));
  await db.exec(`insert into auth.users values('${admin}'),('${person}'),('${other}'),('${outsider}');
    insert into profiles values('${admin}','Đang hoạt động',false),('${person}','Đang hoạt động',false),('${other}','Đang hoạt động',false),('${outsider}','Đang hoạt động',false);
    insert into user_roles values('${admin}','role-super-admin','system');
    insert into app_roles values('common','Common','{}','common',2,'standard',false),('position','Position','{}','position',2,'standard',false),('task','SEO','{}','marketing_task',2,'standard',false),('role-seo','Old SEO','{leave.approve}','marketing_task',1,'standard',false);
    insert into mkt_specialties values('old','role-seo',true,'Old'),('seo','task',true,'SEO');
    insert into org_position_roles values('marketing','title','position');
    insert into org_assignments values('appointment','${person}','marketing','active',now()-interval '1 day',null),('appointment-other','${other}','marketing','active',now()-interval '1 day',null),('a-out','${outsider}','sales','active',now()-interval '1 day',null);`);
  await db.query('insert into fixture values($1)', [config]);
  await db.query("select set_config('test.actor',$1,false)", [admin]);
  await seedParity();
  parityBefore = await vector(person);
  await db.exec(`delete from mkt_staff_specialties;update app_roles set permissions='{}' where id<>'role-seo';`);
}, 60000);
beforeAll(async () => {
 await db.exec(`alter table profiles add column full_name text;
  alter table profiles add column username text;
  grant usage on schema private,auth to authenticated;
  grant execute on function auth.uid() to authenticated;
  create function public.cw_uid(n text) returns uuid language sql stable security definer as $$select case when count(*)=1 then (array_agg(id))[1] end from profiles where status='Đang hoạt động' and full_name=n$$;
 `);
 await db.exec(`update profiles set full_name=case id when '${person}' then 'Worker' when '${other}' then 'Reviewer' else 'Outsider' end;
  create table tasks(id text primary key,data jsonb,created_by uuid,created_at timestamptz default now(),updated_at timestamptz default now(),is_demo boolean default false);
  create table social_posts(like tasks including all);create table socials(like tasks including all);create table websites(like tasks including all);`);
 for (const t of ['tasks','social_posts','socials','websites']) await db.exec(`grant select,insert,update,delete on ${t} to authenticated;alter table ${t} enable row level security;create policy active on ${t} for all to authenticated using(true) with check(true);`);
 await db.exec(readFileSync('docs/permission-actions-2026-11-12/implementation.sql','utf8'));
});
beforeEach(async () => {
 await db.exec('reset role;truncate tasks,social_posts,socials,websites;');
  await db.exec(bodies);
  await db.exec(`update profiles set status='Đang hoạt động';update app_roles set permissions='{}' where id<>'role-seo';delete from user_roles where role_id<>'role-super-admin';
    select set_config('base.personal_deny_write','on',false);delete from user_permission_overrides;select set_config('base.personal_deny_write','',false);
    delete from private.staff_permission_previews;delete from account_permission_changes;delete from attendance_explanations;delete from attendance_explanation_events;delete from mkt_staff_specialties;delete from leave_requests;delete from biz_admins;`);
  await db.query('update fixture set config=$1', [config]);
  await db.query("select set_config('test.actor',$1,false)", [admin]);
});
afterAll(() => db.close());

const actor = async (u = person) => { await db.exec('reset role'); await db.query("select set_config('test.actor',$1,false)", [u]); await db.exec('set role authenticated'); };
const system = async () => { await db.exec('reset role'); await db.query("select set_config('test.actor','',false)"); };
const seed = async (table = 'tasks', data: Record<string, unknown> = {}) => {
 await system(); await db.query(`insert into ${table}(id,created_by,data) values('item',$1,$2)`, [person, {title:'Original',status:table==='tasks'?'Đã giao':'Kế hoạch',assignee:'Worker',assigneeId:person,approver:'Reviewer',history:[],...data}]);
};
const patch = async (table: string, data: Record<string, unknown>) => db.query(`update ${table} set data=data||$1::jsonb where id='item' returning data`, [data]);
const grant = async (keys: string[], source = 'common') => { await db.exec('reset role'); await setRole(source, keys); };
const rows = async (table='tasks') => (await db.query(`select * from ${table}`)).rows;

it('no permission hides existing rows and rejects direct INSERT', async () => {
 await seed(); await actor(); expect(await rows()).toHaveLength(0);
 await expect(db.query('insert into tasks(id,created_by,data) values($1,$2,$3)', ['bad',person,{status:'Mới tạo'}])).rejects.toThrow('Missing permission');
});
it('same key opens real RLS reads via Common, position, Marketing or personal, then DENY hides rows', async () => {
 for (const source of ['common','position','task','personal']) {
  await seed(); await db.exec('reset role'); await setRole('common',[]); await setRole('position',[]); await setRole('task',[]);
  await db.query("select set_config('test.actor',$1,false)",[admin]);
  if (source==='task') await db.query("insert into mkt_staff_specialties values($1,'seo','active',true) on conflict do nothing",[person]);
  if (source==='personal') await personal(['task.view']); else await grant(['task.view'],source);
  await actor(); expect(await rows()).toHaveLength(1);
  await db.exec('reset role'); await db.query("select set_config('test.actor',$1,false)",[admin]); await personal([],['task.view']);
  await actor(); expect(await rows()).toHaveLength(0);
  await db.exec('reset role');await db.query("select set_config('test.actor',$1,false)",[admin]);await personal([],[]);
  await system();await db.exec('truncate tasks');
 }
});
it('view alone never opens another person’s resource, view_all does', async () => {
 await seed(); await grant(['task.view']); await actor(outsider); expect(await rows()).toHaveLength(0);
 await grant(['task.view','task.view_all']);await actor(outsider);expect(await rows()).toHaveLength(1);
});
it('generic edit cannot change deadline or assignee without the specific key', async () => {
 await seed();await grant(['task.view','task.edit']);await actor();
 expect((await patch('tasks',{title:'Edited'})).rows).toHaveLength(1);
 await expect(patch('tasks',{deadline:'2026-12-01'})).rejects.toThrow('task.edit_deadline');
 await expect(patch('tasks',{assignee:'Reviewer',assigneeId:other})).rejects.toThrow('task.edit_assignee');
});
it('a direct field write succeeds with its own key, and personal DENY wins over broad edit', async () => {
 await seed();await grant(['task.view','task.edit','task.edit_deadline']);await actor();
 expect((await patch('tasks',{deadline:'2026-12-01'})).rows).toHaveLength(1);
 await db.exec('reset role');await db.query("select set_config('test.actor',$1,false)",[admin]);await personal([],['task.edit_deadline']);await actor();
 await expect(patch('tasks',{deadline:'2026-12-02'})).rejects.toThrow('task.edit_deadline');
});
it('task start needs both chosen action permission and original assigned actor', async () => {
 await seed();await grant(['task.view','task.view_all','task.start']);await actor(outsider);
 await expect(patch('tasks',{status:'Đang làm'})).rejects.toThrow('Wrong workflow actor');
 await actor();expect((await patch('tasks',{status:'Đang làm'})).rows).toHaveLength(1);
});
it('wrong-stage completion cannot borrow approve_completion', async () => {
 await seed();await grant(['task.view','task.view_all','task.approve_completion']);await actor(other);
 await expect(patch('tasks',{status:'Hoàn thành'})).rejects.toThrow('task.force_status');
});
it('correct reviewer completes and server generates audit identity/time', async () => {
 await seed('tasks',{status:'Chờ xác nhận'});await grant(['task.view','task.approve_completion']);await actor(other);
 const result = await patch('tasks',{status:'Hoàn thành',completedAt:'1900-01-01',history:[{byId:outsider,at:'1900-01-01',action:'fake'}]});
 const d = (result.rows[0] as any).data;
 expect(d.history[0].byId).toBe(other);expect(d.history[0].action).toBe('approve_completion');expect(d.completedAt).not.toBe('1900-01-01');
});
it('self approval is refused even with approve permission', async () => {
 await seed('tasks',{status:'Chờ xác nhận',approver:'Worker',approverId:person});await grant(['task.view','task.approve_completion']);await actor();
 await expect(patch('tasks',{status:'Hoàn thành'})).rejects.toThrow('Self approval');
});
it('unknown JSON fields and changing immutable creator are refused', async () => {
 await seed();await grant(['task.view','task.edit']);await actor();
 await expect(patch('tasks',{futureGrant:true})).rejects.toThrow('Unknown field');
 await expect(db.query("update tasks set created_by=$1 where id='item'",[other])).rejects.toThrow('Immutable');
});
it('duplicate names do not let another person acquire the assignment', async () => {
 await seed('tasks',{assigneeId:null});await grant(['task.view']);await db.query('update profiles set full_name=$1 where id=$2',['Worker',outsider]);await actor(outsider);expect(await rows()).toHaveLength(0);
 await db.exec('reset role');await db.query('update profiles set full_name=$1 where id=$2',['Outsider',outsider]);
});
it('inactive accounts cannot read or write; Super Admin bootstrap still reads', async () => {
 await seed();await grant(['task.view','task.edit']);await db.query("update profiles set status='Tạm khóa' where id=$1",[person]);await actor();expect(await rows()).toHaveLength(0);
 await actor(admin);expect(await rows()).toHaveLength(1);
});
it('Social writer does not get implicit start permission', async () => {
 await seed('social_posts',{assignee:null,assigneeId:null,approver:null,writer:'Worker',writerId:person});await grant(['social.post_view']);await actor();
 await expect(patch('social_posts',{status:'Đang làm'})).rejects.toThrow('social.post_start');
 await grant(['social.post_view','social.post_start']);await actor();expect((await patch('social_posts',{status:'Đang làm'})).rows).toHaveLength(1);
});
it('Social reviewer action requires selected reviewer, and DENY blocks approval', async () => {
 await seed('social_posts',{assignee:null,assigneeId:null,approver:null,writer:'Worker',writerId:person,reviewer:'Reviewer',status:'Chờ duyệt'});
 await grant(['social.post_view','social.post_view_all','social.post_approve']);await actor(outsider);await expect(patch('social_posts',{status:'Đã duyệt'})).rejects.toThrow('Wrong workflow actor');
 await actor(other);expect((await patch('social_posts',{status:'Đã duyệt'})).rows).toHaveLength(1);
});
it('Social channel assignment cannot hide under general edit', async () => {
 await seed('socials',{assignee:null,assigneeId:null,approver:null,owner:'Worker'});await grant(['social.view','social.edit']);await actor();
 await expect(patch('socials',{owner:'Reviewer'})).rejects.toThrow('social.assign_owner');
});
it('core Web edit cannot reassign SEO without assign_seo; explicit key succeeds', async () => {
 await seed('websites',{assignee:null,assigneeId:null,approver:null,seoOwner:'Worker'});await grant(['web.view','web.edit']);await actor();
 await expect(patch('websites',{seoOwner:'Reviewer'})).rejects.toThrow('web.assign_seo');
 await grant(['web.view','web.assign_seo']);await actor();expect((await patch('websites',{seoOwner:'Reviewer'})).rows).toHaveLength(1);
});
it('history cannot be rewritten and deletes cannot erase workflow audit', async () => {
 await seed();await grant(['task.view','task.edit','task.delete']);await actor();await patch('tasks',{title:'Edited'});
 await expect(patch('tasks',{history:[]})).rejects.toThrow('append only');
 await expect(db.query("delete from tasks where id='item'")).rejects.toThrow('Cancel instead');
});
it('concurrent completion is checked against latest locked row, not old UI state', async () => {
 await seed('tasks',{status:'Chờ xác nhận'});await grant(['task.view','task.approve_completion','task.request_revision']);await actor(other);
 const r=await Promise.allSettled([patch('tasks',{status:'Hoàn thành'}),patch('tasks',{status:'Cần sửa',revisionNote:'Fix'})]);
 expect(r.filter(x=>x.status==='fulfilled')).toHaveLength(1);
});
it('cannot swap Task approver on a pending item, even with generic edit', async () => {
 await seed('tasks',{status:'Chờ xác nhận'});await grant(['task.view','task.edit','task.assign']);await actor();
 await expect(patch('tasks',{approver:'Worker',approverId:person})).rejects.toThrow('Cannot replace workflow actor');
});
it('Social publication requires the original publisher, not just a key', async () => {
 await seed('social_posts',{assignee:null,assigneeId:null,approver:null,writer:'Worker',writerId:person,publisher:'Reviewer',status:'Chờ đăng'});
 await grant(['social.post_view','social.post_confirm_published']);await actor();
 await expect(patch('social_posts',{publishedLink:'https://example.org/result'})).rejects.toThrow('Only publisher');
});
it('fresh create requires chosen permission and original creator, not arbitrary finished state', async () => {
 await grant(['task.create','task.view']);await actor();
 await expect(db.query('insert into tasks(id,created_by,data) values($1,$2,$3)', ['bad',person,{status:'Hoàn thành'}])).rejects.toThrow('Invalid initial');
 await expect(db.query('insert into tasks(id,created_by,data) values($1,$2,$3)', ['bad',other,{status:'Mới tạo'}])).rejects.toThrow('Creator spoofing');
 await db.query('insert into tasks(id,created_by,data) values($1,$2,$3)', ['created',person,{title:'Actual',status:'Mới tạo',history:[]}]);
 expect(await rows()).toHaveLength(1);
});
it('real Social approve is blocked by personal DENY without affecting another reviewer', async () => {
 await seed('social_posts',{assignee:null,assigneeId:null,approver:null,writer:'Worker',writerId:person,reviewer:'Reviewer',status:'Chờ duyệt'});
 await grant(['social.post_view','social.post_approve']);await db.query("select set_config('test.actor',$1,false)",[admin]);
 const p=await preview([],['social.post_approve'],other);
 await value('select account_supplement_save($1,$2,$3,$4,$5,$6) v',[other,[],[],['social.post_approve'],p.fingerprint,'isolated']);
 await actor(other);await expect(patch('social_posts',{status:'Đã duyệt'})).rejects.toThrow('social.post_approve');
});
it('rollback restores original permissive policies without touching rows; drift aborts', async () => {
 await seed();await system();
 const rollback=readFileSync('docs/permission-actions-2026-11-12/rollback.sql','utf8');
 await db.exec(`create or replace function private.content_require(u uuid,p text) returns void language plpgsql security definer set search_path=public,private as $$begin raise exception 'drift'; end;$$;`);
 await expect(db.exec(rollback)).rejects.toThrow('Rollback helper drift');await db.exec('rollback');
 // Restore all exact helpers without recreating policies/triggers.
 const implementation=readFileSync('docs/permission-actions-2026-11-12/implementation.sql','utf8');
 await db.exec(implementation.slice(0,implementation.indexOf('REVOKE ALL')).replaceAll('CREATE FUNCTION','CREATE OR REPLACE FUNCTION'));
 await db.exec(rollback);
 expect(await value("select count(*)::int v from tasks")).toBe(1);
 expect(await value("select count(*)::int v from pg_policies where policyname='content_action_read'")).toBe(0);
 expect(await value("select to_regprocedure('private.content_write_guard()') is null v")).toBe(true);
 await db.exec(implementation);
});
it('candidate preflight refuses a changed resolver rather than applying incompatible guards', async () => {
 await db.exec('reset role');
 await expect(db.exec(readFileSync('docs/permission-actions-2026-11-12/candidate.sql','utf8'))).rejects.toThrow('Dependency baseline/owner/ACL mismatch');
 await db.exec('rollback');
});

