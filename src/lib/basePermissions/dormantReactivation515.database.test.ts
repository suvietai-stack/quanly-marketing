import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, beforeEach, afterAll, expect, it } from 'vitest';

// Purely isolated PGlite. Runs the staged SQL body, never contacts production.
// The preflight must run separately against live snapshot before DB approval.
const pkg = 'docs/role-515-cutover-20261116/';
const candidate = readFileSync(pkg + 'dormant-candidate.sql', 'utf8');
const rollback = readFileSync(pkg + 'dormant-rollback.sql', 'utf8');
const keys = JSON.parse(readFileSync('docs/role-permission-full-2026-11-12/keys.json', 'utf8'));
const admin = '00000000-0000-0000-0000-000000000001';
const normal = '00000000-0000-0000-0000-000000000002';
const db = new PGlite();
const count = async (sql: string) => Number((await db.query<{ n: number }>(sql)).rows[0]?.n ?? 0);
const fenced = async (role: string, key: string) => Boolean((await db.query<{ v: boolean }>(
  'select private.universal_dormant_fence($1,$2) v', [role, key],
)).rows[0]?.v);

beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA private; CREATE SCHEMA auth;
    CREATE TABLE public.app_roles (id text PRIMARY KEY, permissions text[] NOT NULL DEFAULT '{}',
      catalog_generation smallint NOT NULL, is_system boolean NOT NULL DEFAULT false);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
      AS $$ SELECT nullif(current_setting('test.actor',true),'')::uuid $$;
    CREATE FUNCTION private.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE
      AS $$ SELECT u='00000000-0000-0000-0000-000000000001'::uuid $$;
    CREATE TABLE private.test_legacy_dormant (role_id text,permission text);
    CREATE FUNCTION private.universal_dormant_fence(role_id text,p text)
      RETURNS boolean LANGUAGE sql STABLE
      AS $$ SELECT EXISTS(SELECT 1 FROM private.test_legacy_dormant d
        WHERE d.role_id=$1 AND d.permission=$2)
        OR (role_id='role-v2-sales-head' AND p='settings.view') $$;
  `);
  await db.query(`INSERT INTO private.test_legacy_dormant(role_id,permission)
    SELECT role_id,permission FROM jsonb_to_recordset($1::jsonb)
    AS x(role_id text,permission text)`, [JSON.stringify(keys.fence.map(([role_id,permission]: string[])=>({role_id,permission})))]);
  const body = candidate.slice(candidate.indexOf('CREATE TABLE private.role_permission_initial_dormant'),
    candidate.lastIndexOf('COMMIT;'));
  if (!body.startsWith('CREATE TABLE')) throw new Error('Staged SQL body not found');
  await db.exec(body);
}, 60000);
beforeEach(async () => {
  await db.exec(`DELETE FROM public.app_roles; DELETE FROM private.role_permission_reactivation;
    INSERT INTO public.app_roles VALUES
      ('role-v2-sales-head','{settings.view}',2,false),
      ('role-v2-sales-staff','{settings.view}',2,false),
      ('role-v2-other','{}',2,false),
      ('role-admin','{settings.view}',1,true);`);
  await db.query('select set_config($1,$2,false)', ['test.actor',admin]);
});
afterAll(() => db.close());

it('preserves exactly 930 dormant pairs and never silently grants them on install', async () => {
  expect(await count('select count(*)::int n from private.role_permission_initial_dormant')).toBe(930);
  expect(await count('select count(*)::int n from private.role_permission_reactivation')).toBe(0);
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(true);
  expect(await fenced('role-v2-sales-staff','settings.view')).toBe(true);
  expect(await fenced('role-admin','settings.view')).toBe(true);
  expect(await fenced('role-v2-other','leave.create')).toBe(false);
});

it('Super Admin can explicitly remove, save, re-add, then disable a dormant V2 key', async () => {
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-head'");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(true);
  await db.exec("UPDATE app_roles SET permissions='{settings.view}' WHERE id='role-v2-sales-head'");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(false);
  expect(await fenced('role-v2-sales-staff','settings.view')).toBe(true);
  expect(await count('select count(*)::int n from private.role_permission_reactivation')).toBe(1);
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-head'");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(true);
  expect(await count('select count(*)::int n from private.role_permission_reactivation')).toBe(0);
});

it('saving an unchanged Role never reactivates stored dormant permissions', async () => {
  await db.exec("UPDATE app_roles SET permissions='{settings.view}' WHERE id='role-v2-sales-head'");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(true);
  expect(await count('select count(*)::int n from private.role_permission_reactivation')).toBe(0);
});

it('ordinary actor and service-context edits never reactivate a dormant permission', async () => {
  await db.query('select set_config($1,$2,false)', ['test.actor',normal]);
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-head'");
  await db.exec("UPDATE app_roles SET permissions='{settings.view}' WHERE id='role-v2-sales-head'");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(true);
  await db.query('select set_config($1,$2,false)', ['test.actor','']);
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-staff'");
  await db.exec("UPDATE app_roles SET permissions='{settings.view}' WHERE id='role-v2-sales-staff'");
  expect(await fenced('role-v2-sales-staff','settings.view')).toBe(true);
});

it('role deletion clears reactivation and reused IDs cannot inherit a stale grant', async () => {
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-head'");
  await db.exec("UPDATE app_roles SET permissions='{settings.view}' WHERE id='role-v2-sales-head'");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(false);
  await db.exec("DELETE FROM app_roles WHERE id='role-v2-sales-head'");
  expect(await count('select count(*)::int n from private.role_permission_reactivation')).toBe(0);
  await db.exec("INSERT INTO app_roles VALUES ('role-v2-sales-head','{settings.view}',2,false)");
  expect(await fenced('role-v2-sales-head','settings.view')).toBe(true);
});

it('rollback refuses to revoke active grants, then restores original function exactly', async () => {
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-head'");
  await db.exec("UPDATE app_roles SET permissions='{settings.view}' WHERE id='role-v2-sales-head'");
  await expect(db.exec(rollback)).rejects.toThrow('STOP: rollback would silently revoke');
  await db.exec('ROLLBACK');
  await db.exec("UPDATE app_roles SET permissions='{}' WHERE id='role-v2-sales-head'");
  await db.exec(rollback);
  expect(await fenced('role-v2-sales-staff','settings.view')).toBe(true);
  expect(await count("select count(*)::int n from pg_class where oid=to_regclass('private.role_permission_reactivation')")).toBe(0);
});
