import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const path = 'docs/role-v1-retirement-2026-11-12/';
const sql = readFileSync(path + 'candidate.sql','utf8');
const rollback = readFileSync(path + 'rollback.sql','utf8');
const originalApproval = readFileSync(path + 'account_approve.before.sql','utf8');
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const pending = '00000000-0000-0000-0000-000000000002';
const count = async (sql: string) => Number((await db.query<{n: number}>(sql)).rows[0]?.n ?? 0);

beforeAll(async () => {
  const ddl = [
    "CREATE ROLE authenticated", "CREATE ROLE anon", "CREATE SCHEMA auth", "CREATE SCHEMA private",
    "CREATE TABLE public.app_roles(id text PRIMARY KEY,name text NOT NULL,catalog_generation smallint NOT NULL,role_kind text NOT NULL DEFAULT 'position',is_system boolean NOT NULL DEFAULT false,catalog_state text NOT NULL DEFAULT 'standard',permissions text[] NOT NULL DEFAULT '{}')",
    "CREATE TABLE public.base_title_role_links(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),role_id text NOT NULL REFERENCES public.app_roles(id),title_id text NOT NULL,active boolean NOT NULL DEFAULT false)",
    "CREATE TABLE public.user_roles(user_id uuid NOT NULL,role_id text NOT NULL REFERENCES public.app_roles(id))",
    "CREATE TABLE public.org_position_roles(role_id text REFERENCES public.app_roles(id))",
    "CREATE TABLE public.org_position_slots(role_id text REFERENCES public.app_roles(id))",
    "CREATE TABLE public.mkt_specialties(role_id text REFERENCES public.app_roles(id))",
    "CREATE TABLE public.biz_access_exceptions(role_id text REFERENCES public.app_roles(id))",
    "CREATE TABLE public.profiles(id uuid PRIMARY KEY,status text NOT NULL)",
    "CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz,encrypted_password text,banned_until timestamptz)",
    "CREATE TABLE public.account_security_logs(actor_id uuid,target_id uuid,action text)",
    "CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.actor',true),'')::uuid $$",
    "CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=u AND status='Đang hoạt động') $$",
    "CREATE FUNCTION private.is_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u='00000000-0000-0000-0000-000000000001'::uuid $$",
    "CREATE FUNCTION private.has_permission(u uuid,k text) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$",
    "CREATE FUNCTION private.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u='00000000-0000-0000-0000-000000000001'::uuid $$",
    "INSERT INTO public.profiles VALUES('00000000-0000-0000-0000-000000000001','Đang hoạt động'),('00000000-0000-0000-0000-000000000002','Chờ duyệt')",
    "INSERT INTO auth.users VALUES('00000000-0000-0000-0000-000000000001',now(),'hash',null),('00000000-0000-0000-0000-000000000002',now(),'hash',null)",
    "INSERT INTO app_roles(id,name,catalog_generation,role_kind,is_system) VALUES ('role-super-admin','Super Admin',1,'system',true),('role-admin','Admin',1,'system',true)",
    "INSERT INTO user_roles VALUES('00000000-0000-0000-0000-000000000001','role-super-admin'),('00000000-0000-0000-0000-000000000005','role-super-admin')",
    "INSERT INTO app_roles(id,name,catalog_generation,role_kind,is_system) SELECT 'old-role-'||g,'Legacy '||g,1,'position',false FROM generate_series(1,29) g",
    "INSERT INTO app_roles(id,name,catalog_generation,role_kind) SELECT 'new-role-'||g,'Canonical '||g,2,CASE WHEN g=1 THEN 'common' WHEN g<=21 THEN 'position' ELSE 'marketing_task' END FROM generate_series(1,26) g",
    "INSERT INTO base_title_role_links(role_id,title_id,active) SELECT 'old-role-'||g,'title-'||g,false FROM generate_series(1,17) g"
  ].join(';\n') + ';';
  await db.exec(ddl);
  await db.exec(originalApproval);
  const body = sql.slice(sql.indexOf('CREATE TABLE IF NOT EXISTS private.role_v1_retirement_backup'),sql.lastIndexOf('COMMIT;'));
  if (!body.startsWith('CREATE TABLE')) throw new Error('Staged V1 retirement body not found');
  await db.exec(body);
},60000);
afterAll(()=>db.close());

it('removes 29 obsolete roles and their 17 disabled links without touching protected admins or V2 roles',async()=>{
  expect(await count('select count(*)::int n from app_roles where catalog_generation=1')).toBe(2);
  expect(await count('select count(*)::int n from app_roles where catalog_generation=2')).toBe(26);
  expect(await count("select count(*)::int n from user_roles where role_id='role-super-admin'")).toBe(2);
  expect(await count('select count(*)::int n from base_title_role_links')).toBe(0);
  expect(await count('select jsonb_array_length(roles_json)::int n from private.role_v1_retirement_backup')).toBe(29);
  expect(await count('select jsonb_array_length(title_links_json)::int n from private.role_v1_retirement_backup')).toBe(17);
});

it('new account approval grants no direct user_roles row',async()=>{
  await db.query("SELECT set_config('test.actor',$1,false)",[admin]);
  const data=await db.query<{result:any}>('SELECT public.account_approve($1) result',[pending]);
  expect(data.rows[0].result.ok).toBe(true);
  expect(await count("select count(*)::int n from user_roles where user_id='00000000-0000-0000-0000-000000000002'")).toBe(0);
  expect(await count("select count(*)::int n from profiles where id='00000000-0000-0000-0000-000000000002' and status='Đang hoạt động'")).toBe(1);
});

it('old callers cannot assign Role directly on approval',async()=>{
  await db.exec("update profiles set status='Chờ duyệt' where id='00000000-0000-0000-0000-000000000002'");
  await db.query("SELECT set_config('test.actor',$1,false)",[admin]);
  await expect(db.query('SELECT public.account_approve($1,$2)',[pending,'new-role-3'])).rejects.toThrow('không gắn Role trực tiếp');
  expect(await count("select count(*)::int n from user_roles where user_id='00000000-0000-0000-0000-000000000002'")).toBe(0);
});

it('rollback restores 29 old Role records and 17 title links with IDs intact',async()=>{
  await db.exec(rollback);
  expect(await count('select count(*)::int n from app_roles where catalog_generation=1')).toBe(31);
  expect(await count('select count(*)::int n from base_title_role_links')).toBe(17);
  expect(await count("select count(*)::int n from user_roles where role_id='role-super-admin'")).toBe(2);
  expect(await count("select count(*)::int n from private.role_v1_retirement_backup where status='rolled_back'")).toBe(1);
});
