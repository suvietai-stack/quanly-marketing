import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const root = 'docs/base-stability-2026-11-12/';
const admin = '00000000-0000-0000-0000-000000000001';
const user = '00000000-0000-0000-0000-000000000002';
async function setup() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE SCHEMA private;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.actor',true),'')::uuid$$;
  CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1 IS NOT NULL$$;
  CREATE FUNCTION private.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${admin}'::uuid$$;
  SELECT set_config('test.actor','${user}',false);`);
  return db;
}
it('full policy metadata returns 510 without enabling the 467 unreviewed keys; rollback restores 43', async () => {
  const db = await setup();
  try {
    await db.exec(`CREATE TABLE base_permission_catalog(key text);INSERT INTO base_permission_catalog SELECT 'p.'||i FROM generate_series(1,510) i;
    CREATE FUNCTION private.permission_editor_policy() RETURNS TABLE(key text,scope text,personal boolean) LANGUAGE sql AS $$SELECT 'p.'||i,'own',i<=15 FROM generate_series(1,43) i$$;
    CREATE FUNCTION private.common_permission_ready(text) RETURNS boolean LANGUAGE sql AS $$SELECT $1 IN (SELECT key FROM private.permission_editor_policy() WHERE personal)$$;
    CREATE FUNCTION private.org_role_permission_ready(text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
    CREATE FUNCTION private.mkt_specialty_permission_ready(text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;`);
    await db.exec(readFileSync(root+'permissions/candidate.sql','utf8'));
    const result = (await db.query<{p: {personal:boolean;position_ready:boolean}[]}>('SELECT permission_editor_read() p')).rows[0]?.p ?? [];
    expect(result).toHaveLength(510);expect(result.filter(r=>r.personal)).toHaveLength(15);expect(result.filter(r=>r.position_ready)).toHaveLength(43);
    await db.exec(readFileSync(root+'permissions/rollback.sql','utf8'));
    expect((await db.query<{p:unknown[]}>('SELECT permission_editor_read() p')).rows[0]?.p).toHaveLength(43);
  } finally { await db.close(); }
},30000);
it('history summary/detail enforce every event unit and stable pagination without snapshots in lists', async () => {
  const db = await setup();
  try {
    await db.exec(`CREATE TABLE org_units(id text,parent_id text,kind text,active boolean);INSERT INTO org_units VALUES('a',null,'department',true),('b',null,'department',true);
    CREATE TABLE org_assignments(user_id uuid,unit_id text,starts_at timestamptz,ends_at timestamptz);
    CREATE TABLE profiles(id uuid,full_name text,status text);
    CREATE TABLE private.org_control(id boolean,revision bigint);INSERT INTO private.org_control VALUES(true,1);
    CREATE TABLE org_events(id uuid,unit_ids jsonb,created_at timestamptz,before_data jsonb,after_data jsonb);
    INSERT INTO org_events SELECT ('00000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid,'["a"]',now(),'{}',jsonb_build_object('snapshot',repeat('x',10000)) FROM generate_series(1,25) i;
    INSERT INTO org_events VALUES('00000000-0000-0000-0001-000000000001','["a","b"]',now(),'{}','{}');
    CREATE FUNCTION private.org_can(uuid,text,text) RETURNS boolean LANGUAGE sql AS $$SELECT $3='a'$$;
    CREATE FUNCTION private.base_rules(uuid,jsonb) RETURNS jsonb LANGUAGE sql AS $$SELECT '[{"permission":"org.view","effect":"ALLOW","unit_id":"a"},{"permission":"org.view_history","effect":"ALLOW","unit_id":"a"}]'::jsonb$$;
    CREATE FUNCTION private.org_config() RETURNS jsonb LANGUAGE sql AS $$SELECT jsonb_build_object('units','[]'::jsonb,'titles','[]'::jsonb,'memberships','[]'::jsonb)$$;`);
    await db.exec(readFileSync(root+'history/candidate.sql','utf8'));
    const first = (await db.query<{p:{id:string;created_at:string;after_data?:unknown}[]}>('SELECT org_history_page() p')).rows[0]?.p ?? [];
    expect(first).toHaveLength(20);expect(first.every(e=>e.after_data===undefined)).toBe(true);
    const last=first.at(-1);if(!last)throw new Error('missing page');
    const next=(await db.query<{p:unknown[]}>('SELECT org_history_page($1,$2,20) p',[last.created_at,last.id])).rows[0]?.p;
    expect(next).toHaveLength(5);
    expect((await db.query<{p:{events:unknown[];catalog:unknown[]}}>('SELECT org_workspace_read() p')).rows[0]?.p.events).toHaveLength(20);
    await expect(db.query("SELECT org_event_detail('00000000-0000-0000-0001-000000000001')")).rejects.toThrow('phạm vi');
    const detail=(await db.query<{p:{after_data:unknown}}>('SELECT org_event_detail($1) p',[first[0].id])).rows[0]?.p;
    expect(detail?.after_data).toBeDefined();
    await db.exec("SELECT set_config('test.actor','',false)");await expect(db.query('SELECT org_history_page()')).rejects.toThrow('đăng nhập');
    await db.exec(readFileSync(root+'history/rollback.sql','utf8'));
  } finally { await db.close(); }
},30000);
it('leave SELECT policy preserves own/assigned/unit/all boundaries and signed-out denial', async () => {
  const db = await setup();
  try {
    await db.exec(`CREATE TABLE leave_requests(id int,owner_id uuid,created_by uuid,approver_id uuid);ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
    CREATE FUNCTION private.sig_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $1 IS NOT NULL AND $2='leave.view_own'$$;
    CREATE FUNCTION private.leave_unit_visible(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
    INSERT INTO leave_requests VALUES(1,'${user}','${user}','${admin}'),(2,'${admin}','${admin}','${admin}');
    GRANT SELECT ON leave_requests TO authenticated;GRANT USAGE ON SCHEMA private,auth TO authenticated;
    CREATE POLICY "leave_requests read" ON leave_requests FOR SELECT TO authenticated USING(false);`);
    for(const file of ['candidate','rollback']) {
      await db.exec(readFileSync(root+`leave/${file}.sql`,'utf8'));
      await db.exec('SET ROLE authenticated');
      expect((await db.query<{id:number}>('SELECT id FROM leave_requests')).rows.map(r=>r.id)).toEqual([1]);
      await db.exec("SELECT set_config('test.actor','',false)");expect((await db.query('SELECT id FROM leave_requests')).rows).toEqual([]);
      await db.exec(`RESET ROLE;SELECT set_config('test.actor','${user}',false)`);
    }
  } finally { await db.close(); }
},30000);
it('manager converter only builds an atomic preview and denies ordinary actors/conflicting mapping', async () => {
  const db = await setup();
  try {
    await db.exec(`CREATE TABLE biz_management_assignments(id uuid,user_id uuid,position text,team_id uuid,department_id uuid,system_id uuid,started_at timestamptz,ended_at timestamptz);
    CREATE TABLE org_units(id text,source text,source_id text,active boolean);
    CREATE TABLE biz_positions(id uuid,code text);
    CREATE TABLE org_titles(id text,source text,source_id text,active boolean);
    CREATE TABLE org_assignments(id text,user_id uuid,unit_id text,source text,source_id text,category text,ends_at timestamptz);
    CREATE TABLE app_roles(id text,role_kind text,catalog_generation int,catalog_state text,is_system boolean);
    CREATE TABLE org_position_roles(unit_id text,title_id text,role_id text);
    INSERT INTO biz_management_assignments VALUES('${user}','${user}','department_head',null,'${admin}',null,now()-interval '1 day',null);
    INSERT INTO org_units VALUES('dept','biz_departments','${admin}',true);
    INSERT INTO biz_positions VALUES('${admin}','department_head');INSERT INTO org_titles VALUES('title','biz_positions','${admin}',true);
    INSERT INTO org_assignments VALUES('legacy','${user}','dept','biz_management_assignments','${user}','legacy_manager',null);
    INSERT INTO app_roles VALUES('role','position',2,'standard',false);
    CREATE FUNCTION public.org_change(text,bigint,jsonb) RETURNS jsonb LANGUAGE sql AS $$SELECT jsonb_build_object('phase',$1,'commands',$3)$$;`);
    await db.exec(readFileSync(root+'management/candidate.sql','utf8'));
    await expect(db.query('SELECT org_legacy_manager_preview($1,1,$2)',[user,'role'])).rejects.toThrow('Super Admin');
    await db.exec(`SELECT set_config('test.actor','${admin}',false)`);
    const p=(await db.query<{p:{phase:string;commands:{action:string;data:{ends_at?:string;starts_at?:string}}[]}}>('SELECT org_legacy_manager_preview($1,1,$2) p',[user,'role'])).rows[0]?.p;
    expect(p?.phase).toBe('preview');expect(p?.commands.map(c=>c.action)).toEqual(['end','position_role','assign']);
    expect(p?.commands[0].data.ends_at).toBe(p?.commands[2].data.starts_at);
    expect((await db.query('SELECT * FROM org_assignments')).rows).toHaveLength(1);
    await db.exec("INSERT INTO org_position_roles VALUES('dept','title','different')");
    await expect(db.query('SELECT org_legacy_manager_preview($1,1,$2)',[user,'role'])).rejects.toThrow('không ghi đè');
    await db.exec(readFileSync(root+'management/rollback.sql','utf8'));
  } finally { await db.close(); }
},30000);