import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const dir = 'docs/role-legacy-delete-guards-2026-11-12/';
const candidate = readFileSync(dir + 'candidate.sql', 'utf8');
const rollback = readFileSync(dir + 'rollback.sql', 'utf8');
const actor = '00000000-0000-0000-0000-000000000002';
const keys = [["brands","brand.delete"],["map_posts","local.post_delete"],["social_posts","social.post_delete"],["socials","social.delete"],["tasks","task.delete"],["videos","video.delete"],["web_contents","web.content_delete"],["web_topics","web.keyword_topic_delete"],["websites","web.delete"]];
const db = new PGlite();

beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE SCHEMA private;
    CREATE TABLE private.test_actor(id uuid primary key, active boolean);
    CREATE TABLE private.test_grant(actor uuid, key text, allowed boolean, primary key(actor,key));
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
      AS $$ SELECT nullif(current_setting('test.actor',true),'')::uuid $$;
    CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql STABLE
      AS $$ SELECT EXISTS(SELECT 1 FROM private.test_actor a WHERE a.id=u AND a.active) $$;
    CREATE FUNCTION private.has_permission(u uuid,k text) RETURNS boolean LANGUAGE sql STABLE
      AS $$ SELECT EXISTS(SELECT 1 FROM private.test_grant g WHERE g.actor=u AND g.key=k AND g.allowed) $$;
    INSERT INTO private.test_actor VALUES ('${actor}',true);`);
  for (const [table] of keys) {
    await db.exec(`CREATE TABLE public.${table}(id text primary key, data jsonb DEFAULT '{}'::jsonb);
      ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
  }
  const body = candidate.slice(candidate.indexOf('CREATE OR REPLACE FUNCTION private.legacy_delete_permission_guard()'),
    candidate.lastIndexOf('COMMIT;'));
  expect(body).toContain('CREATE TRIGGER role_510_delete_guard');
  await db.exec(body);
}, 60000);
beforeEach(async () => {
  await db.query("select set_config('test.actor',$1,false)",[actor]);
  await db.query("select set_config('request.jwt.claim.role',$1,false)",['authenticated']);
  await db.exec('DELETE FROM private.test_grant;');
  for (const [table] of keys) await db.exec(`INSERT INTO public.${table}(id) VALUES ('test') ON CONFLICT DO NOTHING`);
  // Note: cleanup uses the signed service role to avoid triggering access checks.
});
afterAll(() => db.close());

it('all nine table DELETE operations require their specific permission, never just active status', async () => {
  for (const [table,key] of keys) {
    await expect(db.exec(`DELETE FROM public.${table} WHERE id='test'`)).rejects.toThrow('Không có quyền xóa dữ liệu');
    await db.query('INSERT INTO private.test_grant(actor,key,allowed) VALUES ($1,$2,true)',[actor,key]);
    await db.exec(`DELETE FROM public.${table} WHERE id='test'`);
    await db.query('DELETE FROM private.test_grant WHERE actor=$1 AND key=$2',[actor,key]);
  }
});

it('an explicit DENY closes DELETE even after a previous grant', async () => {
  await db.query('INSERT INTO private.test_grant VALUES ($1,$2,true)',[actor,'task.delete']);
  await db.query("UPDATE private.test_grant SET allowed=false WHERE actor=$1 AND key='task.delete'",[actor]);
  await expect(db.exec("DELETE FROM public.tasks WHERE id='test'")).rejects.toThrow('Không có quyền xóa dữ liệu');
});

it('inactive and missing actors cannot DELETE', async () => {
  await db.query('INSERT INTO private.test_grant VALUES ($1,$2,true)',[actor,'brand.delete']);
  await db.query('UPDATE private.test_actor SET active=false WHERE id=$1',[actor]);
  await expect(db.exec("DELETE FROM public.brands WHERE id='test'")).rejects.toThrow('Không có quyền xóa dữ liệu');
  await db.query('UPDATE private.test_actor SET active=true WHERE id=$1',[actor]);
  await db.query("select set_config('test.actor','',false)");
  await expect(db.exec("DELETE FROM public.brands WHERE id='test'")).rejects.toThrow('Không có quyền xóa dữ liệu');
});

it('wrong module grant never authorizes a different table DELETE', async () => {
  await db.query('INSERT INTO private.test_grant VALUES ($1,$2,true)',[actor,'task.delete']);
  await expect(db.exec("DELETE FROM public.videos WHERE id='test'")).rejects.toThrow('video.delete');
});

it('signed service role can perform maintenance without a staff identity', async () => {
  await db.query("select set_config('test.actor','',false)");
  await db.query("select set_config('request.jwt.claim.role','service_role',false)");
  await db.exec("DELETE FROM public.websites WHERE id='test'");
  expect((await db.query("SELECT count(*)::int AS n FROM public.websites WHERE id='test'")).rows[0].n).toBe(0);
});
