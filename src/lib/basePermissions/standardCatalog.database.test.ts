import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const scalar = async (sql: string) => (await db.query<{v: any}>(sql)).rows[0]?.v;
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private; CREATE SCHEMA auth; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
    CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
    CREATE FUNCTION private.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${admin}'::uuid$$;
    CREATE FUNCTION private.org_role_permission_ready(text) RETURNS boolean LANGUAGE sql AS $$SELECT $1='leave.create'$$;
    CREATE TABLE app_roles(id text PRIMARY KEY,name text,description text,permissions text[]);
    CREATE TABLE org_assignments(source text,status text,ends_at timestamptz);
    CREATE TABLE org_titles(id text,source text); CREATE TABLE base_title_role_links(id text,title_id text,role_id text,is_primary boolean,scope_kind text,enabled_permissions text[]);
    CREATE TABLE mkt_specialties(id text); CREATE TABLE user_roles(user_id uuid,role_id text);
    CREATE TABLE private.org_control(id boolean,revision bigint); INSERT INTO private.org_control VALUES(true,1);
    CREATE FUNCTION public.org_change(text,bigint DEFAULT null,jsonb DEFAULT null,uuid DEFAULT null,text DEFAULT null,text DEFAULT null) RETURNS jsonb LANGUAGE sql AS $$SELECT jsonb_build_object('id',gen_random_uuid(),'impact','[]'::jsonb)$$;
    INSERT INTO app_roles VALUES('role-leader-marketing','Legacy Marketing',null,ARRAY['leave.create','settings.role']),('role-designer','Legacy Design',null,ARRAY['leave.create','order.view_all']),('role-0k2hmw8r','Legacy Accounting',null,ARRAY['leave.create','finance.incoming.manage']),('role-xim870m3','Legacy Procurement',null,ARRAY['leave.create','oq.report_all']);
    INSERT INTO user_roles VALUES('${admin}','role-leader-marketing');`);
  for (const n of [120,101,103,104,107,108,109,110]) await db.query('insert into org_titles values($1,$2)',[`b5e00000-0000-4000-8000-${String(n).padStart(12,'0')}`,'base']);
  await db.exec(readFileSync('drizzle/migrations/0342_standard_role_catalog_and_safe_setup.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0345_standard_role_shared_management.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0346_shared_role_preserve_live_appointments.sql','utf8'));
}, 30000);
afterAll(() => db.close());
it('rejects non-admin catalog registration', async () => {
  await db.query("select set_config('test.uid',$1,false)",['00000000-0000-0000-0000-000000000002']);
  await expect(scalar('select standard_role_catalog_setup() v')).rejects.toThrow('Super Admin');
  expect(await scalar('select count(*)::int v from private.standard_role_catalog_runs')).toBe(0);
});
it('equivalent manager Roles merge while unrelated live appointments stay intact',async()=>{
 await db.exec("insert into org_assignments values('canonical','active',null)");
 const r=await scalar('select standard_role_catalog_consolidate() v');
 expect(r.merged).toBe(2);expect(r.changed_accounts).toBe(0);
 expect(await scalar("select name v from app_roles where id='role-standard-mkt-head'")).toBe('Quản lý Marketing');
 expect(await scalar("select catalog_state v from app_roles where id='role-standard-mkt-team'")).toBe('compatibility');
 expect(await scalar('select count(*)::int v from org_assignments')).toBe(1);
 expect((await scalar('select standard_role_catalog_consolidate() v')).already_applied).toBe(true);
});
it('creates ten distinct Roles without assigning staff or changing existing direct grants', async () => {
  await db.query("select set_config('test.uid',$1,false)",[admin]);
  const result = await scalar('select standard_role_catalog_setup() v');
  expect(result.created).toBe(10);
  expect(result.changed_accounts).toBe(0);
  expect(await scalar('select count(*)::int v from org_assignments')).toBe(0);
  expect(await scalar('select count(*)::int v from user_roles')).toBe(1);
  expect(await scalar("select permissions v from app_roles where id='role-leader-marketing'")).toEqual(['leave.create','settings.role']);
});
it('keeps unsupported management permissions pending and preserves private snapshots', async () => {
  expect(await scalar("select permissions v from app_roles where id='role-standard-account-chief'")).toEqual(['leave.create']);
  expect(await scalar("select catalog_pending v from app_roles where id='role-standard-account-chief'")).toEqual(['finance.incoming.manage']);
  expect(await scalar("select has_table_privilege('authenticated','private.standard_role_catalog_runs','SELECT') v")).toBe(false);
  expect(await scalar('select after_data is not null v from private.standard_role_catalog_runs')).toBe(true);
});
it('registration is idempotent without duplicate Roles or snapshots', async () => {
  expect((await scalar('select standard_role_catalog_setup() v')).already_applied).toBe(true);
  expect(await scalar('select count(*)::int v from private.standard_role_catalog_runs')).toBe(1);
  expect(await scalar("select count(*)::int v from app_roles where catalog_state='standard'")).toBe(10);
});