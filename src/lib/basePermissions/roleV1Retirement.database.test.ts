import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// Database fixture intentionally skips production SHA/ACL guards; those must
// match only a fresh read-only preflight of the actual production database.
const candidate = readFileSync('docs/role-v1-retirement-2026-11-12/candidate.sql', 'utf8');
const rollback = readFileSync('docs/role-v1-retirement-2026-11-12/rollback.sql', 'utf8');
const body = candidate.slice(candidate.indexOf('CREATE TABLE IF NOT EXISTS private.role_v1_retirement_backup'),
  candidate.lastIndexOf('COMMIT;'));
const restore = rollback.slice(rollback.indexOf('INSERT INTO public.app_roles'),
  rollback.lastIndexOf('DO $post$'));
const db = new PGlite();
const n = async (sql: string) => Number((await db.query<{ n: number }>(sql)).rows[0]?.n ?? 0);
const oldId = (i: number) => i === 0 ? 'role-nhan-su-moi' : i === 1 ? 'role-dong-hang' : 'old-role-' + i;
let originalAccountApproval = '';

beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA private; CREATE SCHEMA auth;
    CREATE TABLE app_roles(id text PRIMARY KEY,role_kind text NOT NULL,permissions text[] NOT NULL DEFAULT '{}',
      catalog_generation smallint NOT NULL,is_system boolean NOT NULL DEFAULT false);
    CREATE TABLE base_title_role_links(id uuid PRIMARY KEY,role_id text NOT NULL REFERENCES app_roles(id),
      active boolean NOT NULL DEFAULT false);
    CREATE TABLE user_roles(user_id uuid,role_id text NOT NULL REFERENCES app_roles(id));
    CREATE TABLE profiles(id uuid PRIMARY KEY,status text);
    CREATE FUNCTION public.account_approve(_target uuid,_role text DEFAULT NULL::text)
      RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private'
      AS $$ BEGIN RETURN '{}'::jsonb; END $$;
  `);
  const old = Array.from({length:29},(_,i)=>({
    id:oldId(i),
    role_kind:'position',permissions:[],
    catalog_generation:1,is_system:i<2
  }));
  const keep = [
    {id:'role-super-admin',role_kind:'system',permissions:[],catalog_generation:1,is_system:true},
    {id:'role-admin',role_kind:'system',permissions:[],catalog_generation:1,is_system:true},
  ];
  const modern = Array.from({length:26},(_,i)=>({
    id:i===0?'common':i===1?'position':i===2?'task':'modern-'+i,
    role_kind:i===0?'common':i<21?'position':'marketing_task',permissions:[],
    catalog_generation:2,is_system:false
  }));
  await db.query(`INSERT INTO app_roles(id,role_kind,permissions,catalog_generation,is_system)
    SELECT id,role_kind,permissions,catalog_generation,is_system FROM jsonb_to_recordset($1::jsonb)
    AS r(id text,role_kind text,permissions text[],catalog_generation smallint,is_system boolean)`,
    [JSON.stringify([...old,...keep,...modern])]);
  const links=Array.from({length:17},(_,i)=>({id:'00000000-0000-4000-8000-'+(i+1).toString().padStart(12,'0'),role_id:oldId(i),active:false}));
  await db.query(`INSERT INTO base_title_role_links(id,role_id,active)
    SELECT id,role_id,active FROM jsonb_to_recordset($1::jsonb)
    AS r(id uuid,role_id text,active boolean)`,[JSON.stringify(links)]);
  await db.exec(`INSERT INTO user_roles VALUES
    ('00000000-0000-0000-0000-000000000001','role-super-admin'),
    ('00000000-0000-0000-0000-000000000002','role-super-admin')`);
  originalAccountApproval=(await db.query<{def:string}>(
    "SELECT pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure) def")).rows[0].def;
},30000);
afterAll(()=>db.close());

it('obsolete title link still active aborts atomic deletion and keeps all Role data',async()=>{
  await db.exec("UPDATE base_title_role_links SET active=true WHERE role_id='role-dong-hang'");
  await expect(db.exec('BEGIN;'+body+'COMMIT;')).rejects.toThrow('STOP: legacy title link deletion incomplete');
  await db.exec('ROLLBACK;');
  expect(await n('SELECT COUNT(*)::int n FROM app_roles WHERE catalog_generation=1')).toBe(31);
  expect(await n('SELECT COUNT(*)::int n FROM base_title_role_links')).toBe(17);
  expect(await n("SELECT COUNT(*)::int n FROM user_roles WHERE role_id='role-super-admin'")).toBe(2);
});

it('retires 29 V1 Roles/17 inactive links without deleting employee/org or protected admins; restores exact rows',async()=>{
  await db.exec("UPDATE base_title_role_links SET active=false");
  await db.exec('BEGIN;'+body+'COMMIT;');
  expect(await n('SELECT COUNT(*)::int n FROM app_roles WHERE catalog_generation=1')).toBe(2);
  expect(await n('SELECT COUNT(*)::int n FROM app_roles WHERE catalog_generation=2')).toBe(26);
  expect(await n('SELECT COUNT(*)::int n FROM base_title_role_links')).toBe(0);
  expect(await n("SELECT COUNT(*)::int n FROM user_roles WHERE role_id='role-super-admin'")).toBe(2);
  const b=(await db.query<{roles:number,links:number}>(
    "SELECT jsonb_array_length(roles_json) roles,jsonb_array_length(title_links_json) links FROM private.role_v1_retirement_backup")).rows[0];
  expect(b.roles).toBe(29);
  expect(b.links).toBe(17);
  const updated=(await db.query<{def:string}>(
    "SELECT pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure) def")).rows[0].def;
  expect(updated).toContain('Tài khoản mới không gắn Role trực tiếp');
  // Restore the actual rows and original function using the staged rollback body.
  // Production guards are skipped only because the fixture has a synthetic original function.
  await db.exec('BEGIN;'+restore+'COMMIT;');
  expect(await n('SELECT COUNT(*)::int n FROM app_roles WHERE catalog_generation=1')).toBe(31);
  expect(await n('SELECT COUNT(*)::int n FROM base_title_role_links')).toBe(17);
  expect(await n("SELECT COUNT(*)::int n FROM user_roles WHERE role_id='role-super-admin'")).toBe(2);
  const restored=(await db.query<{def:string}>(
    "SELECT pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure) def")).rows[0].def;
  expect(restored).toBe(originalAccountApproval);
});
