import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest';

// Isolated PGlite replay of the staged role-permission-full (510/510) candidate against exact live definitions. Never touches production.
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
beforeEach(async () => {
  await db.exec(bodies);
  await db.exec(`update profiles set status='Đang hoạt động';update app_roles set permissions='{}' where id<>'role-seo';delete from user_roles where role_id<>'role-super-admin';
    select set_config('base.personal_deny_write','on',false);delete from user_permission_overrides;select set_config('base.personal_deny_write','',false);
    delete from private.staff_permission_previews;delete from account_permission_changes;delete from attendance_explanations;delete from attendance_explanation_events;delete from mkt_staff_specialties;delete from leave_requests;delete from biz_admins;`);
  await db.query('update fixture set config=$1', [config]);
  await db.query("select set_config('test.actor',$1,false)", [admin]);
});
afterAll(() => db.close());

it('counts: all 510 catalog keys are enabled in Common, position, task and personal, and deniable', async () => {
  const policy = await value('select permission_editor_read() v');
  expect(snapshot.catalog).toHaveLength(510);
  expect(policy).toHaveLength(510);
  for (const f of ['common_ready', 'position_ready', 'task_ready', 'personal', 'deny_ready', 'grantable']) expect(policy.filter((p: any) => p[f])).toHaveLength(510);
  expect(keys.newly_routed).toHaveLength(315);
  expect(policy.filter((p: any) => p.privileged).length).toBeGreaterThan(40);
});
it('every one of 510 keys validates in every Role kind and as personal ALLOW/DENY preview', async () => {
  const all = snapshot.catalog.map((c: any) => c.key);
  for (const kind of ['common', 'position', 'marketing_task']) await db.query('select private.role_editor_validate($1,$2,$3)', [kind, all, []]);
  const p = await preview(all.slice(0, 255), all.slice(255)); expect(p.added).toHaveLength(255); expect(p.deny_added).toHaveLength(255);
});
it('per module: Role grant opens the shared gate, personal DENY closes it, removing DENY restores it', async () => {
  const modules = new Map<string, string>();
  for (const c of snapshot.catalog) if (!modules.has(c.module) && !c.key.startsWith('org.') && !c.key.startsWith('biz.') && !c.key.startsWith('k3.')) modules.set(c.module, c.key);
  expect(modules.size).toBeGreaterThan(18);
  for (const [, key] of modules) {
    await setRole('common', [key]);
    expect(await has(person, key)).toBe(true);
    expect((await effective(person, key)).allowed).toBe(true);
  }
  await setRole('common', [...modules.values()]);
  await personal([], [...modules.values()]);
  for (const key of modules.values()) { expect(await has(person, key)).toBe(false); expect(await has(other, key)).toBe(true); }
  await personal([], []);
  for (const key of modules.values()) expect(await has(person, key)).toBe(true);
});
it('business, 3K and KPI gates honor Role ALLOW and personal DENY', async () => {
  expect(await value("select public.biz_can($1,'biz.view_all') v", [person])).toBe(false);
  await setRole('common', ['biz.view_all', 'k3.comment', 'kpi.goal_create']);
  expect(await value("select public.biz_can($1,'biz.view_all') v", [person])).toBe(true);
  expect(await value("select public.k3_can($1,'k3.comment') v", [person])).toBe(true);
  expect(await value("select private.kpi_can($1,'kpi.goal_create') v", [person])).toBe(true);
  await personal([], ['biz.view_all', 'k3.comment', 'kpi.goal_create']);
  expect(await value("select public.biz_can($1,'biz.view_all') v", [person])).toBe(false);
  expect(await value("select public.k3_can($1,'k3.comment') v", [person])).toBe(false);
  expect(await value("select private.kpi_can($1,'kpi.goal_create') v", [person])).toBe(false);
  expect(await value("select public.biz_can($1,'biz.view_all') v", [other])).toBe(true);
});
it('organization rights need a unit: Common/personal grant opens no unit, position grant opens only its unit', async () => {
  await setRole('common', ['org.view']);
  expect(await value("select private.org_can($1,'org.view','marketing') v", [person])).toBe(false);
  await setRole('position', ['org.view']);
  expect(await value("select private.org_can($1,'org.view','marketing') v", [person])).toBe(true);
  expect(await value("select private.org_can($1,'org.view','sales') v", [person])).toBe(false);
  await personal([], ['org.view']);
  expect(await value("select private.org_can($1,'org.view','marketing') v", [person])).toBe(false);
});
it('administration keys: only a Super Admin actor may grant them; Super Admin stays protected', async () => {
  await db.query("insert into user_roles values($1,'role-admin','system')", [other]);
  await db.exec("create or replace function private.is_admin(_user_id uuid) returns boolean language sql stable security definer set search_path to 'public' as $$select exists(select 1 from user_roles where user_id=_user_id and role_id in ('role-admin','role-super-admin'))$$");
  await setRole('common', ['settings.user_custom_perm']);
  await db.query("select set_config('test.actor',$1,false)", [other]);
  await expect(preview(['settings.role'])).rejects.toThrow('Chỉ Super Admin');
  await expect(db.query("select private.role_editor_validate('common','{settings.role}','{}')")).rejects.toThrow('Chỉ Super Admin');
  await preview(['task.view']);
  await expect(preview([], ['task.view'], admin)).rejects.toThrow('bảo vệ');
  await db.query("select set_config('test.actor',$1,false)", [admin]);
  await personal(['settings.role']);
  expect(await has(person, 'settings.role')).toBe(true);
  await db.exec(definition('is_admin'));
});
it('1) same key toggles in Common, position, Marketing task and personal ALLOW', async () => {
  for (const kind of ['common', 'position', 'marketing_task']) await db.query('select private.role_editor_validate($1,$2,$3)', [kind, sample, []]);
  await setRole('common', sample); for (const k of sample) expect(await has(outsider, k)).toBe(true);
  await setRole('common', []); await setRole('position', sample); for (const k of sample) { expect(await has(person, k)).toBe(true); expect(await has(outsider, k)).toBe(false); }
  await setRole('position', []); await setRole('task', sample); await db.query("insert into mkt_staff_specialties values($1,'seo','active',true)", [person]);
  for (const k of sample) { expect(await has(person, k)).toBe(true); expect(await has(outsider, k)).toBe(false); }
  await setRole('task', []); for (const k of sample) expect(await has(person, k)).toBe(false);
  await personal(sample); for (const k of sample) { expect(await has(person, k)).toBe(true); expect(await has(other, k)).toBe(false); }
});
it('1b) unit keys are selectable in any source, but only a position appointment yields unit rows', async () => {
  for (const kind of ['common', 'position', 'marketing_task']) await db.query("select private.role_editor_validate($1,'{leave.view_unit,ot.view_unit,finance.incoming.view_unit}','{}')", [kind]);
  await setRole('common', ['leave.view_unit']);
  expect(await has(person, 'leave.view_unit')).toBe(true);
  expect(await value("select private.org_permission_unit_member($1,$2,'leave.view_unit') v", [person, other])).toBe(false);
  await setRole('position', ['leave.view_unit']);
  expect(await value("select private.org_permission_unit_member($1,$2,'leave.view_unit') v", [person, other])).toBe(true);
  expect(await value("select private.org_permission_unit_member($1,$2,'leave.view_unit') v", [person, outsider])).toBe(false);
  expect(await value("select private.org_permission_unit_member($1,$2,'leave.view_unit') v", [outsider, person])).toBe(false);
});
it('2) removing a key from the position Role keeps access while Common still grants it', async () => {
  await setRole('common', [K]); await setRole('position', [K]);
  await setRole('position', []);
  expect(await has(person, K)).toBe(true);
  expect((await effective(person, K)).sources.map((s: any) => s.source_kind)).toEqual(['common']);
});
it('3) personal DENY overrides Common, position, task and personal-era Role grants at the backend', async () => {
  await setRole('common', [K]); await setRole('position', [K]); await setRole('task', [K]);
  await db.query("insert into mkt_staff_specialties values($1,'seo','active',true)", [person]);
  expect(await has(person, K)).toBe(true);
  const p = await preview([], [K]); expect(p.deny_added).toEqual([K]);
  expect(await has(person, K)).toBe(true); // preview never commits
  await save(p, [], [K]);
  expect(await has(person, K)).toBe(false);
  expect(await value('select private.sig_can($1,$2) v', [person, K])).toBe(false);
  const e = await effective(person, K); expect(e.decision).toBe('DENY'); expect(e.allowed).toBe(false);
  expect(e.sources.some((s: any) => s.source_kind === 'personal_deny')).toBe(true);
});
it('3b) DENY blocks a real workflow (attendance recall) and 3K use', async () => {
  await setRole('common', ['att.edit_own']);
  await db.query("insert into attendance_explanations(id,owner_id) values('10000000-0000-0000-0000-000000000001',$1)", [person]);
  await personal([], ['att.edit_own', 'k3.use']);
  await db.query("select set_config('test.actor',$1,false)", [person]);
  await expect(db.query("select att_recall('10000000-0000-0000-0000-000000000001')")).rejects.toThrow('không có quyền');
  expect(await value("select public.k3_can($1,'k3.use') v", [person])).toBe(false);
  expect(await value("select public.k3_can($1,'k3.use') v", [other])).toBe(true);
});
it('4) removing the personal DENY restores the inherited grant', async () => {
  await setRole('common', [K]); await personal([], [K]); expect(await has(person, K)).toBe(false);
  const p = await preview([], []); expect(p.deny_removed).toEqual([K]); await save(p, [], []);
  expect(await has(person, K)).toBe(true);
});
it('5) unchecking a personal ALLOW returns to inherited, never to an implicit deny', async () => {
  await setRole('common', [K]); await personal([K, 'task.view']);
  await personal([]);
  expect(await has(person, K)).toBe(true);
  expect(await has(person, 'task.view')).toBe(false);
  expect((await effective(person, K)).decision).toBe('ALLOW');
});
it('6) two users with the same Role: only the targeted one is denied', async () => {
  await setRole('position', [K]); await personal([], [K]);
  expect(await has(person, K)).toBe(false);
  expect(await has(other, K)).toBe(true);
});
it('7) personal ALLOW cannot coexist with DENY; admin-bypassed denies are refused instead of faked', async () => {
  await expect(preview([K], [K])).rejects.toThrow('vừa Cho phép');
  await expect(preview([], ['not.a.key'])).rejects.toThrow('danh mục');
  await db.query('insert into biz_admins values($1)', [person]);
  await expect(preview([], ['biz.crm_use'])).rejects.toThrow('Quản trị Kinh doanh');
});
it('8a) protected accounts, unauthorized callers and self-edit stay blocked', async () => {
  await expect(preview([], [K], admin)).rejects.toThrow('bảo vệ');
  await db.query("select set_config('test.actor',$1,false)", [other]);
  await expect(preview([], [K])).rejects.toThrow('Không có quyền');
});
it('8b) inactive account gets nothing; its DENY is kept for reactivation', async () => {
  await setRole('common', [K]); await personal(['task.view'], ['signal.create']);
  await db.query("update profiles set status='Tạm khóa' where id=$1", [person]);
  expect(await has(person, K)).toBe(false); expect(await has(person, 'task.view')).toBe(false);
  await db.query("update profiles set status='Đang hoạt động' where id=$1", [person]);
  await setRole('common', [K, 'signal.create']);
  expect(await has(person, 'signal.create')).toBe(false); expect(await has(person, 'task.view')).toBe(true);
});
it('8c) pending leave approvals block denying approval rights', async () => {
  await db.query("insert into leave_requests values(gen_random_uuid(),$1,$2,'pending',null)", [other, person]);
  await expect(preview([], ['leave.approve'])).rejects.toThrow('đơn chờ duyệt');
});
it('8d) audit stores before/after deny lists; direct table writes cannot change denies', async () => {
  await personal([], [K]);
  const audit = await value('select jsonb_build_object(\'before\',before_data,\'after\',after_data) v from account_permission_changes');
  expect(audit.after.override.denied_permissions).toEqual([K]);
  await expect(db.query("update user_permission_overrides set denied_permissions='{}' where user_id=$1", [person])).rejects.toThrow('Chặn quyền riêng');
  await expect(db.query('delete from user_permission_overrides where user_id=$1', [person])).rejects.toThrow('Chặn quyền riêng');
  await expect(db.query("insert into user_permission_overrides(user_id,denied_permissions) values($1,'{task.view}')", [other])).rejects.toThrow('Chặn quyền riêng');
  await db.query("update user_permission_overrides set mode='additive' where user_id=$1", [person]);
  expect(await has(person, K)).toBe(false);
});
it('8e) older clients (2-arg preview / 5-arg save) keep the existing DENY', async () => {
  await setRole('common', [K]); await personal([], [K]);
  const p = await value('select account_supplement_preview($1,$2) v', [person, ['task.view']]);
  await value('select account_supplement_save($1,$2,$3,$4,$5) v', [person, [], ['task.view'], p.fingerprint, 'old client']);
  expect(await has(person, K)).toBe(false); expect(await has(person, 'task.view')).toBe(true);
  await expect(value('select account_supplement_preview($1,$2) v', [person, [K]])).rejects.toThrow('vừa Cho phép');
});
it('8f) concurrent saves: one wins, the stale preview fails closed', async () => {
  const a = await preview([], [K]), b = await preview([], ['task.view']);
  const r = await Promise.allSettled([save(a, [], [K]), save(b, [], ['task.view'])]);
  expect(r.filter(x => x.status === 'fulfilled')).toHaveLength(1);
  await expect(save(a, [], ['web.view'])).rejects.toThrow();
});
it('8g) stored dormant pairs stay inactive; account deletion still cascades', async () => {
  await db.query("insert into mkt_staff_specialties values($1,'old','active',false)", [person]);
  expect(await has(person, 'leave.approve')).toBe(false);
  await personal([], [K]);
  await db.query('delete from auth.users where id=$1', [person]);
  expect(await value('select count(*)::int v from user_permission_overrides where user_id=$1', [person])).toBe(0);
  await db.query('insert into auth.users values($1)', [person]);
});
it('parity: with no personal rows, every one of 510 keys resolves exactly as before', async () => {
  await seedParity();
  expect(await vector(person)).toEqual(parityBefore);
});
it('candidate fails closed on baseline mismatch', async () => {
  await expect(db.exec(candidate)).rejects.toThrow('Baseline/owner/ACL mismatch'); await db.exec('ROLLBACK');
});
it('rollback refuses while a personal DENY exists, then restores exact definitions', async () => {
  await personal([], [K]);
  await expect(db.exec(rollback)).rejects.toThrow('Rollback blocked'); await db.exec('ROLLBACK');
  await personal([], []);
  await db.exec(rollback);
  for (const [name, schema] of [['role_editor_validate', 'private'], ['org_slot_rules', 'private'], ['base_rules', 'private'], ['permission_editor_read', 'public'], ['account_supplement_save', 'public'], ['has_permission', 'private'], ['biz_can', 'public'], ['org_can', 'private'], ['base_supported', 'private']]) expect(await value('select pg_get_functiondef(oid) v from pg_proc where proname=$1 and pronamespace=$2::regnamespace', [name, schema])).toBe(definition(name, schema));
  expect(await value("select to_regprocedure('private.grant_source_ready(text,text)') is null v")).toBe(true);
  expect(await value("select count(*)::int v from pg_attribute where attrelid='public.user_permission_overrides'::regclass and attname='denied_permissions' and not attisdropped")).toBe(0);
  await expect(db.exec(rollback)).rejects.toThrow('Rollback conflict'); await db.exec('ROLLBACK');
});
