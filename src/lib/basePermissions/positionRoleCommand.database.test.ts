import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const stub = `create or replace function private.org_commands_v2(changes_ jsonb) returns jsonb language plpgsql security definer set search_path to 'public' as $function$
 #variable_conflict use_column
 declare x jsonb;v jsonb;src text;result_ jsonb:='[]';begin
 for x in select value from jsonb_array_elements(changes_) loop v:=x->'data';
 IF x->>'action'<>'roles' THEN result_:=result_||jsonb_build_array('other');CONTINUE;END IF;
 end loop;return result_;end $function$;`;
const run = (role: string) => db.query(`select private.org_commands_v2($1::jsonb) v`, [JSON.stringify([{ action: 'position_role', data: { unit_id: 'd1', title_id: 'staff', role_id: role, reason: 'test' } }])]);
const set = (k: string, v: string) => db.query('select set_config($1,$2,false)', [k, v]);
beforeAll(async () => {
  await db.exec(`create schema private;create schema auth;create role anon;create role authenticated;create role service_role;
  create function auth.uid() returns uuid language sql as $$select '00000000-0000-0000-0000-000000000001'::uuid$$;
  create function private.is_super_admin(uuid) returns boolean language sql as $$select current_setting('t.admin')='1'$$;
  create function private.org_execution_ok() returns boolean language sql as $$select current_setting('t.exec')='1'$$;
  create table org_units(id text primary key,active boolean);create table org_titles(id text primary key,active boolean);
  create table app_roles(id text primary key,role_kind text,catalog_state text,is_system boolean,catalog_generation int);
  create table org_position_roles(unit_id text,title_id text,role_id text,revision int default 1,updated_at timestamptz default now(),updated_by uuid,primary key(unit_id,title_id));
  insert into org_units values('d1',true);insert into org_titles values('staff',true);
  insert into app_roles values('role-v2-sales-staff','position','standard',false,2),('role-v2-sales-team','position','standard',false,2),('role-standard-sales-staff','position','standard',false,1),('role-super-admin','system','standard',true,1),('role-v2-task-seo','marketing_task','standard',false,2);
  select set_config('t.admin','1',false);select set_config('t.exec','1',false);` + stub);
  const sql = readFileSync('drizzle/migrations/0381_position_role_org_change_command.sql', 'utf8').replace(/CREATE POLICY[^;]+;/g, '');
  await db.exec(sql.replace(/--> statement-breakpoint/g, ''));
}, 30000);
afterAll(() => db.close());
it('Super Admin binds one V2 position Role per (unit,title) with an audit event', async () => {
  await run('role-v2-sales-staff');
  expect((await db.query('select role_id from org_position_roles')).rows).toEqual([{ role_id: 'role-v2-sales-staff' }]);
  await run('role-v2-sales-team');
  expect((await db.query('select role_id,revision from org_position_roles')).rows).toEqual([{ role_id: 'role-v2-sales-team', revision: 2 }]);
  expect((await db.query('select before_role,after_role from org_position_role_events order by created_at,ctid')).rows).toEqual([{ before_role: null, after_role: 'role-v2-sales-staff' }, { before_role: 'role-v2-sales-staff', after_role: 'role-v2-sales-team' }]);
});
it('rejects legacy, system and Marketing task Roles', async () => {
  for (const r of ['role-standard-sales-staff', 'role-super-admin', 'role-v2-task-seo']) await expect(run(r)).rejects.toThrow('Role chuẩn mới');
});
it('non-admin or call outside audited preview/apply is denied without writes', async () => {
  const before = (await db.query('select count(*)::int n from org_position_role_events')).rows[0];
  await set('t.admin', '0'); await expect(run('role-v2-sales-staff')).rejects.toThrow('Super Admin');
  await set('t.admin', '1'); await set('t.exec', '0'); await expect(run('role-v2-sales-staff')).rejects.toThrow('Super Admin');
  await set('t.exec', '1');
  expect((await db.query('select count(*)::int n from org_position_role_events')).rows[0]).toEqual(before);
});
it('clearing removes the binding but keeps audit; other actions still pass through', async () => {
  await run('');
  expect((await db.query('select count(*)::int n from org_position_roles')).rows[0]).toEqual({ n: 0 });
  expect((await db.query("select private.org_commands_v2('[{\"action\":\"assign\",\"data\":{}}]') v")).rows[0]).toEqual({ v: ['other'] });
});
it('rollback to the backed-up definition removes the command', async () => {
  await db.exec(stub);
  expect((await db.query("select private.org_commands_v2($1::jsonb) v", [JSON.stringify([{ action: 'position_role', data: {} }])])).rows[0]).toEqual({ v: ['other'] });
});
