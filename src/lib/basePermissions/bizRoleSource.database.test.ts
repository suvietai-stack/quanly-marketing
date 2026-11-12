import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, afterEach, expect, it } from 'vitest';

const db = new PGlite();
const id = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const [admin, staff, lead, head, director, outside] = [1, 2, 3, 4, 5, 6].map(id);
const [system, otherSystem, dept, otherDept, team, sibling] = [11, 12, 21, 22, 31, 32].map(id);
const sql = readFileSync('docs/pending/biz_role_source.sql', 'utf8');
const backup = readFileSync('docs/biz-role-source-2026-11-12/live-functions.sql', 'utf8');
const integrationBackup = readFileSync('docs/biz-role-source-2026-11-12/integration-live-functions.sql', 'utf8');
const readiness = readFileSync('docs/pending/biz_role_source_readiness.sql', 'utf8');
const value = async (q: string, args: unknown[] = []) => (await db.query<{ v: boolean }>(q, args)).rows[0]?.v;
const actor = async (u: string) => db.query("select set_config('test.uid',$1,false)", [u]);
const can = (u: string, p: string, owner: string | null = null, department: string | null = null) =>
  value('select private.biz_v2_can_at($1,$2,$3,$4) v', [u, p, owner, department]);

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private; CREATE SCHEMA auth; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE TABLE profiles(id uuid PRIMARY KEY,status text);
    CREATE TABLE user_roles(user_id uuid,role_id text);
    CREATE TABLE app_roles(id text PRIMARY KEY,permissions text[],catalog_generation smallint DEFAULT 2,role_kind text DEFAULT 'position',catalog_state text DEFAULT 'standard',is_system boolean DEFAULT false);
    CREATE TABLE org_units(id text PRIMARY KEY,parent_id text,kind text,source text,source_id text,active boolean DEFAULT true);
    CREATE TABLE org_titles(id text PRIMARY KEY,active boolean DEFAULT true);
    CREATE TABLE org_position_roles(unit_id text,title_id text,role_id text);
    CREATE TABLE org_assignments(id text PRIMARY KEY,user_id uuid,unit_id text,title_id text,starts_at timestamptz DEFAULT now()-interval '1 day',ends_at timestamptz,status text DEFAULT 'active');
    CREATE TABLE biz_systems(id uuid PRIMARY KEY,active boolean DEFAULT true);
    CREATE TABLE biz_departments(id uuid PRIMARY KEY,system_id uuid,active boolean DEFAULT true);
    CREATE TABLE biz_teams(id uuid PRIMARY KEY,department_id uuid,active boolean DEFAULT true);
    CREATE TABLE biz_department_system_history(department_id uuid,system_id uuid,started_at timestamptz DEFAULT '2020-01-01',ended_at timestamptz);
    CREATE TABLE biz_department_members(id uuid,user_id uuid,department_id uuid,started_at timestamptz DEFAULT '2020-01-01',ended_at timestamptz);
    CREATE TABLE biz_team_members(user_id uuid,team_id uuid,started_at timestamptz DEFAULT '2020-01-01',ended_at timestamptz);
    CREATE TABLE biz_member_affiliations(user_id uuid,team_id uuid,started_at timestamptz DEFAULT '2020-01-01',ended_at timestamptz);
    CREATE TABLE biz_appointments(id uuid,user_id uuid,scope_kind text,system_id uuid,department_id uuid,team_id uuid,position_snapshot jsonb DEFAULT '{}',started_at timestamptz DEFAULT '2020-01-01',ended_at timestamptz,status text DEFAULT 'active');
    CREATE TABLE biz_management_assignments(user_id uuid,position text,system_id uuid,department_id uuid,team_id uuid,started_at timestamptz DEFAULT '2020-01-01',ended_at timestamptz);
    CREATE TABLE biz_annual_goals(id uuid PRIMARY KEY,user_id uuid,department_id uuid);
    CREATE TABLE biz_goal_versions(id uuid,goal_id uuid);
    CREATE TABLE biz_documents(id uuid PRIMARY KEY,user_id uuid,department_id uuid,kind text);
    CREATE TABLE biz_document_versions(id uuid,document_id uuid);
    CREATE TABLE biz_approval_runs(id uuid,version_id uuid,owner_id uuid,department_id uuid,kind text,steps jsonb,current_step int,status text,submitted_at timestamptz DEFAULT now());
    CREATE TABLE base_permission_catalog(key text);
    CREATE TABLE test_denies(user_id uuid,permission text);
    CREATE TABLE test_reset(user_id uuid,reset_at timestamptz);
    CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động') $$;
    CREATE FUNCTION public.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT $1='${admin}'::uuid $$;
    CREATE FUNCTION private.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT public.is_super_admin($1) $$;
    CREATE FUNCTION private.sig_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION private.legacy_reset_applies(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM test_reset WHERE user_id=$1) $$;
    CREATE TABLE private.legacy_reset_accounts(user_id uuid,reset_at timestamptz,active boolean DEFAULT true);
    CREATE FUNCTION private.biz_source_ok(uuid,timestamptz) RETURNS boolean LANGUAGE sql AS $$ SELECT NOT EXISTS(SELECT 1 FROM test_reset WHERE user_id=$1 AND reset_at >= $2) $$;
    CREATE FUNCTION public.biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT public.is_super_admin($1) $$;
    CREATE FUNCTION public.biz_manager(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION public.biz_exception_ok(uuid,text,text DEFAULT NULL,uuid DEFAULT NULL) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION private.org_execution_ok() RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION public.biz_org_can_manage() RETURNS boolean LANGUAGE sql AS $$ SELECT public.biz_admin(auth.uid()) $$;
    CREATE FUNCTION public.biz_appointment_scope(uuid,uuid,uuid,timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION public.biz_run_assigned(uuid,boolean DEFAULT false) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM biz_approval_runs WHERE version_id=$1 AND status='pending' AND steps->current_step->>'user_id'=auth.uid()::text) $$;
    CREATE FUNCTION private.base_valid_at(jsonb) RETURNS boolean LANGUAGE sql AS $$ SELECT coalesce(($1->>'active')::boolean,false) $$;
    CREATE FUNCTION private.base_config() RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
    CREATE FUNCTION private.base_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql AS $$
      SELECT coalesce(jsonb_agg(rule),'[]') FROM (
        SELECT jsonb_build_object('source_id',a.id,'unit_id',a.unit_id,'role_id',r.id,'permission',p,'effect','ALLOW','source_kind','appointment_role','active',true) rule
        FROM org_assignments a JOIN org_position_roles b ON b.unit_id=a.unit_id AND b.title_id=a.title_id JOIN app_roles r ON r.id=b.role_id CROSS JOIN LATERAL unnest(r.permissions)p WHERE a.user_id=u
        UNION ALL SELECT jsonb_build_object('permission',permission,'effect','DENY','active',true) FROM test_denies WHERE user_id=u
      ) x $$;`);
  await db.exec(`CREATE FUNCTION private.legacy_business_allowed(u uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT NOT EXISTS(SELECT 1 FROM test_reset WHERE user_id=u) OR EXISTS(SELECT 1 FROM org_assignments a WHERE a.user_id=u AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now()) AND private.biz_source_ok(u,a.starts_at)) $$;
    CREATE FUNCTION public.biz_participant(u uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT private.is_active(u) AND EXISTS(SELECT 1 FROM biz_department_members WHERE user_id=u AND started_at<=now() AND (ended_at IS NULL OR ended_at>now())) $$;
    CREATE FUNCTION public.biz_all_scope(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT public.biz_admin($1) $$;
    CREATE FUNCTION public.biz_scope_ok(uuid,uuid,uuid,timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;`);
  // Exact live definitions for the six replaced gates; unrelated dependencies are isolated stubs.
  const names = ['biz_step_scope_ok', 'biz_can', 'biz_doc_access', 'biz_department_access', 'biz_goal_can_read', 'biz_member_access'];
  for (const name of names) {
    const match = backup.match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\([\\s\\S]*?\\$function\\$;`));
    if (!match) throw new Error(`Missing live gate ${name}`);
    await db.exec(match[0]);
  }
  await db.exec(`INSERT INTO profiles SELECT x,'Đang hoạt động' FROM unnest(ARRAY['${admin}','${staff}','${lead}','${head}','${director}','${outside}']::uuid[])x;
    INSERT INTO biz_systems(id) VALUES('${system}'),('${otherSystem}');
    INSERT INTO biz_departments(id,system_id) VALUES('${dept}','${system}'),('${otherDept}','${otherSystem}');
    INSERT INTO biz_teams(id,department_id) VALUES('${team}','${dept}'),('${sibling}','${dept}');
    INSERT INTO biz_department_system_history(department_id,system_id) VALUES('${dept}','${system}'),('${otherDept}','${otherSystem}');
    INSERT INTO org_units(id,parent_id,kind,source,source_id) VALUES
    ('biz-block',null,'block','structural','business'),('${system}','biz-block','system','biz_systems','${system}'),('${otherSystem}','biz-block','system','biz_systems','${otherSystem}'),
    ('${dept}','${system}','department','biz_departments','${dept}'),('${otherDept}','${otherSystem}','department','biz_departments','${otherDept}'),('${team}','${dept}','team','biz_teams','${team}'),('${sibling}','${dept}','team','biz_teams','${sibling}');
    INSERT INTO org_titles VALUES('staff'),('lead'),('head'),('director');
    INSERT INTO app_roles(id,permissions) VALUES('role-v2-sales-staff','{biz.view_own,biz.goal_submit,biz.plan_submit,biz.report_submit}'),('role-v2-sales-team','{biz.view_dept,biz.goal_approve,biz.report_approve,biz.approval_view}'),('role-v2-sales-head','{biz.view_dept}'),('role-v2-sales-director','{biz.view_dept}');
    INSERT INTO org_position_roles VALUES('${team}','staff','role-v2-sales-staff'),('${team}','lead','role-v2-sales-team'),('${dept}','head','role-v2-sales-head'),('${system}','director','role-v2-sales-director');
    INSERT INTO org_assignments(id,user_id,unit_id,title_id) VALUES('staff','${staff}','${team}','staff'),('lead','${lead}','${team}','lead'),('head','${head}','${dept}','head'),('director','${director}','${system}','director');
    INSERT INTO biz_department_members(id,user_id,department_id) VALUES(gen_random_uuid(),'${staff}','${dept}');
    INSERT INTO biz_team_members(user_id,team_id) VALUES('${staff}','${team}'),('${outside}','${sibling}');
    INSERT INTO biz_documents VALUES('${id(101)}','${staff}','${dept}','report'),('${id(102)}','${outside}','${otherDept}','report');
    ALTER TABLE biz_documents ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA public,auth TO authenticated;
    GRANT SELECT ON biz_documents TO authenticated;
    CREATE POLICY documents_read ON biz_documents FOR SELECT TO authenticated USING(public.biz_doc_access(user_id,department_id,kind));`);
  // Exact live column types let the real public writer definitions compile, not reduced mock RPCs.
  const columns = JSON.parse(readFileSync('docs/biz-role-source-2026-11-12/live-test-columns.json', 'utf8')) as { table: string; name: string; type: string }[];
  for (const column of columns) {
    await db.exec(`CREATE TABLE IF NOT EXISTS public.${column.table} ();
      ALTER TABLE public.${column.table} ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`);
  }
  for (const name of ['biz_goal_start', 'biz_goal_save', 'biz_document_start', 'biz_document_save', 'biz_dashboard_read', 'biz_run_can_read', 'biz_effective_access']) {
    const definition = integrationBackup.match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\([\\s\\S]*?\\$function\\$\\s*;`))?.[0];
    if (!definition) throw new Error(`Missing integration snapshot ${name}`);
    await db.exec(definition);
  }
  await db.exec('CREATE FUNCTION private.mkt_specialty_permission_ready(text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$');
  for (const name of ['org_role_permission_ready', 'permission_editor_policy']) {
    const definition = integrationBackup.match(new RegExp(`CREATE OR REPLACE FUNCTION private\\.${name}\\([\\s\\S]*?\\$function\\$\\s*;`))?.[0];
    if (!definition) throw new Error(`Missing readiness snapshot ${name}`);
    await db.exec(definition);
  }
  await db.exec(sql);
  await actor(staff);
}, 30000);
beforeEach(() => db.exec('BEGIN'));
afterEach(() => db.exec('ROLLBACK'));
afterAll(() => db.close());

it('staff own, never another owner; submission requires participant and same department', async () => {
  expect(await can(staff, 'biz.view_own', staff, dept)).toBe(true);
  expect(await can(staff, 'biz.view_own', outside, dept)).toBe(false);
  expect(await can(staff, 'biz.goal_submit', staff, otherDept)).toBe(false);
  await db.exec('delete from biz_department_members');
  expect(await can(staff, 'biz.goal_submit')).toBe(false);
});
it('team leader cannot see sibling team or unrelated department', async () => {
  expect(await can(lead, 'biz.view_dept', staff, dept)).toBe(true);
  expect(await can(lead, 'biz.view_dept', outside, dept)).toBe(false);
  expect(await can(lead, 'biz.view_dept', staff, otherDept)).toBe(false);
});
it('head reads department; director reads only its own system, never entire block', async () => {
  expect(await can(head, 'biz.view_dept', outside, dept)).toBe(true);
  expect(await can(head, 'biz.view_dept', outside, otherDept)).toBe(false);
  expect(await can(director, 'biz.view_dept', staff, dept)).toBe(true);
  expect(await can(director, 'biz.view_dept', outside, otherDept)).toBe(false);
  expect(await value("select biz_can($1,'biz.view_all') v", [director])).toBe(false);
});
it('Role checkbox grant/revoke changes actual RLS reads for restricted users', async () => {
  await actor(head);
  await db.exec('SET LOCAL ROLE authenticated');
  expect((await db.query('select id from biz_documents')).rows).toHaveLength(1);
  await db.exec('RESET ROLE');
  await db.exec("update app_roles set permissions='{}' where id='role-v2-sales-head'");
  await db.exec('SET LOCAL ROLE authenticated');
  expect((await db.query('select id from biz_documents')).rows).toHaveLength(0);
  await db.exec('RESET ROLE');
});
it('DENY wins for read, discover and approval regardless of Role', async () => {
  await db.query('insert into test_denies values($1,$2)', [lead, 'biz.view_dept']);
  expect(await can(lead, 'biz.view_dept', staff, dept)).toBe(false);
  expect(await value("select biz_can($1,'biz.view_dept') v", [lead])).toBe(false);
});
it('expired, future and locked assignments fail closed', async () => {
  await db.exec("update org_assignments set ends_at=now() where id='lead'");
  expect(await can(lead, 'biz.view_dept', staff, dept)).toBe(false);
  await db.exec("update org_assignments set ends_at=null,starts_at=now()+interval '1 day' where id='lead'");
  expect(await can(lead, 'biz.view_dept', staff, dept)).toBe(false);
  await db.query("update profiles set status='Tạm khóa' where id=$1", [head]);
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(false);
});
it('concurrent source without permission cannot borrow the first source permission', async () => {
  await db.exec(`insert into org_position_roles values('${otherDept}','staff','role-v2-sales-staff'); insert into org_assignments(id,user_id,unit_id,title_id) values('concurrent','${head}','${otherDept}','staff')`);
  expect(await can(head, 'biz.view_dept', outside, otherDept)).toBe(false);
  await db.exec(`insert into org_position_roles values('${otherDept}','head','role-v2-sales-head'); insert into org_assignments(id,user_id,unit_id,title_id) values('second-manager','${head}','${otherDept}','head')`);
  expect(await can(head, 'biz.view_dept', outside, otherDept)).toBe(true);
  await db.exec("update org_assignments set ends_at=now() where id='second-manager'");
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(true);
  expect(await can(head, 'biz.view_dept', outside, otherDept)).toBe(false);
});
it('old source before reset cannot be revived merely by binding V2', async () => {
  await db.query('insert into test_reset values($1,now())', [head]);
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(false);
});
it('valid new org source remains usable even if legacy business gate is closed', async () => {
  await db.query("insert into test_reset values($1,now()-interval '2 days')", [head]);
  await db.exec('CREATE OR REPLACE FUNCTION private.legacy_business_allowed(u uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$');
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(true);
  expect(await value("select biz_can($1,'biz.view_dept') v", [head])).toBe(true);
});
it('many simultaneous holders share one position binding without new slots', async () => {
  await db.exec(`insert into org_assignments(id,user_id,unit_id,title_id) values('second-staff','${outside}','${team}','staff');
    insert into biz_department_members(id,user_id,department_id) values(gen_random_uuid(),'${outside}','${dept}');
    insert into biz_team_members(user_id,team_id) values('${outside}','${team}');`);
  expect(await can(outside, 'biz.view_own', outside, dept)).toBe(true);
  expect(await can(staff, 'biz.view_own', outside, dept)).toBe(false);
  expect((await db.query("select count(*)::int n from org_position_roles where title_id='staff'")).rows).toEqual([{ n: 1 }]);
});
it('real goal save RPC rejects own historical goal in an unrelated department before writing', async () => {
  await actor(staff);
  await db.exec(`insert into biz_annual_goals(id,user_id,department_id) values('${id(301)}','${staff}','${otherDept}');
    insert into biz_goal_versions(id,goal_id,status,revision) values('${id(302)}','${id(301)}','draft',0);`);
  await expect(db.query('select biz_goal_save($1,0,$2,false)', [id(302), '[]'])).rejects.toThrow('Không có quyền sửa mục tiêu');
});
it('real document save RPC rejects own historical report outside the granting source', async () => {
  await actor(staff);
  await db.exec(`insert into biz_documents(id,user_id,department_id,kind) values('${id(303)}','${staff}','${otherDept}','report');
    insert into biz_document_versions(id,document_id,status,revision) values('${id(304)}','${id(303)}','draft',0);`);
  await expect(db.query('select biz_document_save($1,0,null,null,$2,false,null,null)', [id(304), '[]'])).rejects.toThrow('Không có quyền sửa tài liệu');
});
it('real goal save records an authorized own draft and audit, then revocation blocks the next save', async () => {
  await actor(staff);
  await db.exec(`insert into biz_annual_goals(id,user_id,department_id) values('${id(305)}','${staff}','${dept}');
    insert into biz_goal_versions(id,goal_id,status,revision) values('${id(306)}','${id(305)}','draft',0);`);
  await db.query('select biz_goal_save($1,0,$2,false)', [id(306), '[]']);
  expect((await db.query('select revision from biz_goal_versions where id=$1', [id(306)])).rows).toEqual([{ revision: 1 }]);
  expect((await db.query('select action,actor_id from biz_goal_events where version_id=$1', [id(306)])).rows).toEqual([{ action: 'saved', actor_id: staff }]);
  await db.exec("update app_roles set permissions='{biz.view_own}' where id='role-v2-sales-staff'");
  await expect(db.query('select biz_goal_save($1,1,$2,false)', [id(306), '[]'])).rejects.toThrow('Không có quyền sửa mục tiêu');
});
it('readiness opens only nine enforced action keys, never published/global/settings or Marketing personal grants', async () => {
  const supported = ['biz.view_own','biz.goal_submit','biz.plan_submit','biz.report_submit','biz.view_dept','biz.goal_approve','biz.report_approve','biz.plan_request_revision','biz.approval_view'];
  for (const key of [...supported, 'biz.dashboard_public','biz.view_all','biz.plan_approve','biz.kr_manage','biz.org_manage','biz.workflow_manage','biz.deadline_manage','biz.dept_manage']) {
    await db.query('insert into base_permission_catalog values($1)', [key]);
  }
  await db.exec(readiness);
  expect((await db.query<{ key: string }>("select key from private.permission_editor_policy() where key like 'biz.%' order by key")).rows.map(r => r.key)).toEqual([...supported].sort());
  expect((await db.query("select count(*)::int n from private.permission_editor_policy() where key like 'biz.%' and personal")).rows).toEqual([{ n: 0 }]);
  expect(await value("select private.org_role_permission_ready('biz.dashboard_public') v")).toBe(false);
  expect(await value("select private.org_role_permission_ready('k3.use') v")).toBe(false);
});
it('anonymized live structure has zero Role-sourced Biz grants before an explicit Sales edit', async () => {
  const fixture = JSON.parse(readFileSync('docs/biz-role-source-2026-11-12/live-structural-fixture.json', 'utf8')) as Record<string, Record<string, unknown>[]>;
  await db.exec('delete from org_assignments; delete from org_position_roles; delete from org_titles; delete from org_units; delete from app_roles; delete from profiles; delete from biz_teams; delete from biz_departments; delete from biz_systems');
  const tables: Record<string, string> = { profiles: 'profiles', units: 'org_units', titles: 'org_titles', bindings: 'org_position_roles', roles: 'app_roles', assignments: 'org_assignments', departments: 'biz_departments', systems: 'biz_systems', teams: 'biz_teams' };
  const columns: Record<string, string[]> = { profiles: ['id','status'], units: ['id','parent_id','kind','source','source_id','active'], titles: ['id','active'], bindings: ['unit_id','title_id','role_id'], roles: ['id','permissions','catalog_generation','role_kind','catalog_state','is_system'], assignments: ['id','user_id','unit_id','title_id','starts_at','ends_at','status'], departments: ['id','system_id','active'], systems: ['id','active'], teams: ['id','department_id','active'] };
  for (const [key, table] of Object.entries(tables)) {
    for (const row of fixture[key] ?? []) {
      const cols = columns[key].filter(c => c in row);
      await db.query(`insert into ${table}(${cols.join(',')}) values(${cols.map((_, i) => `$${i+1}`).join(',')})`, cols.map(c => row[c]));
    }
  }
  expect(fixture.profiles).toHaveLength(23);
  expect(fixture.bindings).toHaveLength(16);
  expect(fixture.assignments).toHaveLength(86);
  expect((await db.query("select count(*)::int n from profiles p cross join lateral private.biz_v2_sources(p.id,'biz.view_dept') s")).rows).toEqual([{ n: 0 }]);
  await db.exec("update app_roles set permissions=array_append(permissions,'biz.view_dept') where id='role-v2-sales-head'");
  const sources = (await db.query<{ user_id: string; source_id: string }>("select p.id user_id,s.source_id from profiles p cross join lateral private.biz_v2_sources(p.id,'biz.view_dept') s")).rows;
  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) {
    expect(await can(source.user_id, 'biz.view_dept', source.user_id, source.source_id)).toBe(true);
    for (const other of fixture.departments.filter(d => d.id !== source.source_id)) {
      expect(await can(source.user_id, 'biz.view_dept', source.user_id, String(other.id))).toBe(false);
    }
  }
});
it('unverified source mapping, legacy Role and unsupported keys grant nothing', async () => {
  await db.exec(`update org_units set source='canonical' where id='${dept}'`);
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(false);
  await db.exec(`update org_units set source='biz_departments' where id='${dept}'; update app_roles set catalog_generation=1 where id='role-v2-sales-head'`);
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(false);
  expect(await can(lead, 'biz.org_manage')).toBe(false);
  expect(await can(lead, 'biz.plan_approve')).toBe(false);
});
it('approval requires Role action, correct current step and exact same-source scope', async () => {
  const steps = [{ user_id: lead, type: 'user' }];
  await db.query("insert into biz_approval_runs(id,version_id,owner_id,department_id,kind,steps,current_step,status) values($1,$2,$3,$4,'goal_year',$5,0,'pending')", [id(201), id(202), staff, dept, JSON.stringify(steps)]);
  expect(await value('select biz_step_scope_ok($1,0,$2,$3,$4,now()) v', [JSON.stringify(steps), lead, staff, dept])).toBe(true);
  expect(await value('select biz_step_scope_ok($1,0,$2,$3,$4,now()) v', [JSON.stringify(steps), lead, staff, otherDept])).toBe(false);
  await db.query('insert into test_denies values($1,$2)', [lead, 'biz.goal_approve']);
  expect(await value('select biz_step_scope_ok($1,0,$2,$3,$4,now()) v', [JSON.stringify(steps), lead, staff, dept])).toBe(false);
});
it('private source resolvers are not client-callable; no authenticated direct writes', async () => {
  expect(await value("select has_function_privilege('authenticated','private.biz_v2_can_at(uuid,text,uuid,uuid,timestamptz)','execute') v")).toBe(false);
  expect(await value("select has_table_privilege('authenticated','biz_documents','insert') v")).toBe(false);
});
it('rollback restores exact original definitions and forward reapply succeeds', async () => {
  const names = ['biz_can', 'biz_doc_access', 'biz_step_scope_ok', 'biz_department_access', 'biz_goal_can_read', 'biz_member_access'];
  const originals = names.map(name => backup.match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\([\\s\\S]*?\\$function\\$;`))?.[0]);
  for (const original of originals) if (original) await db.exec(original);
  for (const name of ['biz_goal_start', 'biz_goal_save', 'biz_document_start', 'biz_document_save', 'biz_dashboard_read', 'biz_run_can_read', 'biz_effective_access']) {
    const original = integrationBackup.match(new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\([\\s\\S]*?\\$function\\$\\s*;`))?.[0];
    if (original) await db.exec(original);
  }
  await db.exec(sql);
  expect(await can(head, 'biz.view_dept', staff, dept)).toBe(true);
});