import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, beforeEach, expect, it } from 'vitest';

const db = new PGlite();
const employee = '00000000-0000-0000-0000-000000000021';
const unrelated = '00000000-0000-0000-0000-000000000022';
const stmt = async (sql: string) => (await db.query<{ value: any }>(sql)).rows[0]?.value;
const roleDecision = (u: string, p = 'biz.crm_use') =>
  stmt(`select private.base_tier1('${u}'::uuid,'${p}') value`);
const serverSync = () => stmt('select public.base_role_cache_sync() value');

beforeAll(async () => {
  await db.exec(`
    CREATE SCHEMA private;
    CREATE SCHEMA auth;
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE TABLE profiles (id uuid PRIMARY KEY, status text NOT NULL, is_system_admin boolean DEFAULT false, full_name text NOT NULL DEFAULT 'Staff');
    CREATE TABLE org_events (id uuid DEFAULT gen_random_uuid(), before_data jsonb, after_data jsonb);
    CREATE TABLE app_roles (id text PRIMARY KEY, permissions text[] NOT NULL DEFAULT '{}');
    CREATE TABLE private.fixture_rules (actor uuid NOT NULL,permission text NOT NULL,effect text NOT NULL);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
      AS $$SELECT nullif(current_setting('test.actor',true),'')::uuid$$;
    CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql STABLE
      AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động')$$;
    CREATE FUNCTION private.base_config() RETURNS jsonb LANGUAGE sql STABLE AS $$SELECT '{}'::jsonb$$;
    CREATE FUNCTION private.base_next_transition(jsonb) RETURNS timestamptz
      LANGUAGE sql STABLE AS $$SELECT now()+interval '1 hour'$$;
    CREATE FUNCTION private.base_supported(text) RETURNS boolean LANGUAGE sql STABLE
      AS $$SELECT $1<>'unsupported.permission'$$;
    CREATE FUNCTION private.base_rules(uuid,jsonb) RETURNS jsonb LANGUAGE sql STABLE
      AS $$SELECT coalesce(jsonb_agg(jsonb_build_object('permission',permission,'effect',effect)),'[]'::jsonb)
        FROM private.fixture_rules WHERE actor=$1$$;
    CREATE FUNCTION private.base_decision(uuid,text,jsonb) RETURNS text LANGUAGE sql STABLE
      AS $$SELECT CASE WHEN count(*) FILTER(WHERE effect='DENY')>0 THEN 'DENY'
         WHEN count(*) FILTER(WHERE effect='ALLOW')>0 THEN 'ALLOW'
         ELSE 'NOT_CONFIGURED' END FROM private.fixture_rules WHERE actor=$1 AND permission=$2$$;
  `);
  await db.exec(readFileSync('drizzle/migrations/0468_org_effective_role_cache_queued.sql', 'utf8'));
  await db.query('select set_config($1,$2,false)', ['test.actor', employee]);
  await db.exec(`
    INSERT INTO profiles(id,status) VALUES('${employee}','Đang hoạt động'),('${unrelated}','Đang hoạt động');
    INSERT INTO app_roles(id,permissions) VALUES ('position-role',ARRAY['biz.crm_use']);
  `);
}, 30000);

beforeEach(async () => {
  await db.exec('DELETE FROM private.fixture_rules; DELETE FROM private.base_role_effective_cache;');
  await db.query('select set_config($1,$2,false)', ['test.actor', employee]);
});

afterAll(() => db.close());

it('initial login stores an owner-scoped snapshot; cache preserves exact decisions', async () => {
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','ALLOW']);
  const result = await serverSync();
  expect(result).toEqual({ ready: true, updated: true });
  expect(await roleDecision(employee)).toBe('ALLOW');
  expect(await roleDecision(unrelated)).toBe('NOT_CONFIGURED');
  expect(await roleDecision(employee,'unsupported.permission')).toBe('NOT_CONFIGURED');
  const second = await serverSync();
  expect(second).toEqual({ ready: true, updated: false });
});

it('role revoke invalidates cache in the same transaction; DENY wins immediately', async () => {
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','ALLOW']);
  await serverSync();
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','DENY']);
  await db.exec("UPDATE app_roles SET permissions=ARRAY['biz.crm_use'] WHERE id='position-role'");
  // No bulk rebuild on role edits; stale cache falls back to the live evaluator.
  expect(await roleDecision(employee)).toBe('DENY');
  expect((await serverSync()).updated).toBe(true);
  expect(await roleDecision(employee)).toBe('DENY');
});

it('org membership event only refreshes the changed employee, never silently trusts other stale permissions', async () => {
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','ALLOW']);
  await serverSync();
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','DENY']);
  const previous = JSON.stringify({ memberships: [{ id:'a', user_id: employee, active: true, unit_id:'a' }], units: [] });
  const updated = JSON.stringify({ memberships: [{ id:'a', user_id: employee, active: false, unit_id:'a' }], units: [] });
  await db.query('BEGIN');
  await db.query("UPDATE app_roles SET permissions=ARRAY['biz.crm_use'] WHERE id='position-role'");
  await db.query('insert into org_events(before_data,after_data) values($1::jsonb,$2::jsonb)',[previous,updated]);
  await db.exec('COMMIT');
  const cached = await stmt(`select decisions->>'biz.crm_use' value from private.base_role_effective_cache where user_id='${employee}'`);
  expect(cached).toBe('DENY');
  expect(await roleDecision(employee)).toBe('DENY');
});

it('reassigning an occupied position refreshes both the old and new holder', async () => {
  await db.query('insert into private.fixture_rules values ($1,$2,$3)', [employee,'biz.crm_use','ALLOW']);
  await serverSync();
  await db.query('select set_config($1,$2,false)', ['test.actor',unrelated]);
  await serverSync();
  await db.query('delete from private.fixture_rules where actor=$1',[employee]);
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[unrelated,'biz.crm_use','ALLOW']);
  const previous=JSON.stringify({memberships:[{id:'slot',user_id:employee,active:true}],units:[]});
  const updated=JSON.stringify({memberships:[{id:'slot',user_id:unrelated,active:true}],units:[]});
  await db.exec('BEGIN');
  await db.exec("UPDATE app_roles SET permissions=ARRAY['biz.crm_use'] WHERE id='position-role'");
  await db.query('insert into org_events(before_data,after_data) values($1::jsonb,$2::jsonb)',[previous,updated]);
  await db.exec('COMMIT');
  const a=await stmt(`select decisions->>'biz.crm_use' value from private.base_role_effective_cache where user_id='${employee}'`);
  const b=await stmt(`select decisions->>'biz.crm_use' value from private.base_role_effective_cache where user_id='${unrelated}'`);
  expect(a).toBeNull();
  expect(b).toBe('ALLOW');
  expect(await roleDecision(employee)).toBe('NOT_CONFIGURED');
  expect(await roleDecision(unrelated)).toBe('ALLOW');
});

it('expired snapshots and missing actors use the previous resolver, never stale grants',async () => {
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','ALLOW']);
  await serverSync();
  await db.query('insert into private.fixture_rules values ($1,$2,$3)',[employee,'biz.crm_use','DENY']);
  await db.exec(`UPDATE private.base_role_effective_cache SET valid_until=now()-interval '1 minute'
    WHERE user_id='${employee}'`);
  expect(await roleDecision(employee)).toBe('DENY');
  await db.query('select set_config($1,$2,false)',['test.actor','']);
  await expect(serverSync()).rejects.toThrow('Không có quyền');
});

it('read-only org chart returns the same units, titles and member shape without rebuilding config three times',async()=>{
  await db.exec(`CREATE TABLE IF NOT EXISTS private.fixture_org_config(payload jsonb)`);
  await db.exec(`CREATE OR REPLACE FUNCTION private.base_config() RETURNS jsonb LANGUAGE sql STABLE AS
    $$SELECT coalesce((SELECT payload FROM private.fixture_org_config LIMIT 1),'{}'::jsonb)$$`);
  const config = {units:[{id:'marketing',name:'Marketing'}],titles:[{id:'designer',name:'Thiết kế'}],memberships:[{id:'membership',user_id:employee,unit_id:'marketing',title_id:'designer',duties:'Design',active:true}]};
  await db.query('insert into private.fixture_org_config(payload) values($1::jsonb)',[JSON.stringify(config)]);
  const result = await stmt('select public.base_org_chart_read() value');
  expect(result.units).toEqual(config.units);
  expect(result.titles).toEqual(config.titles);
  expect(result.members).toEqual([{user_id:employee,name:'Staff',unit_id:'marketing',title_id:'designer',duties:'Design',active:true,starts_at:null,ends_at:null}]);
  await db.exec('delete from private.fixture_org_config');
});
