import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { it, expect } from 'vitest';
it('retirement requires audited admin, canonical current/future slots, preserves appointments and snapshots 17 links', async () => {
 const db = new PGlite();
 try {
 await db.exec(`create schema private;create schema auth;
 create function auth.uid() returns uuid language sql as $$select '00000000-0000-0000-0000-000000000001'::uuid$$;
 create function private.is_super_admin(uuid) returns boolean language sql as $$select current_setting('test.admin')='true'$$;
 create function private.org_execution_ok() returns boolean language sql as $$select current_setting('test.execution')='true'$$;
 create table org_titles(id text,source text);create table app_roles(id text,is_system boolean,catalog_generation int);
 create table org_position_slots(id text,role_id text,active boolean);create table org_assignments(id text,title_id text,slot_id text,status text,ends_at timestamptz);
 create table base_title_role_links(id int,title_id text,role_id text);create table base_title_role_events(actor_id uuid,title_source text,title_id text,reason text,before_data jsonb,after_data jsonb);
 create function private.org_commands_v2(changes_ jsonb) returns jsonb language plpgsql as $$declare x jsonb;v jsonb;before_ jsonb;src text;result_ jsonb:='[]';begin for x in select value from jsonb_array_elements(changes_) loop v:=x->'data'; IF x->>'action'='roles' AND true then raise exception 'stub';end if;end loop;return result_;end$$;
 select set_config('test.admin','true',false);select set_config('test.execution','true',false);
 insert into org_titles values('title','biz_positions');insert into app_roles values('old',false,1),('v2',false,2),('admin',true,1);
 insert into org_position_slots values('slot','v2',true);insert into org_assignments values('assignment','title',null,'active',null);
 insert into base_title_role_links select i,'title','old' from generate_series(1,17) i;`);
 await db.exec(readFileSync('docs/pending/role_v2_retire_title_links.sql','utf8'));
 const call=()=>db.query(`select private.org_commands_v2('[{"action":"retire_legacy_title_roles","data":{"id":"title"}}]')`);
 await expect(call()).rejects.toThrow('noncanonical');
 await db.exec("update org_assignments set slot_id='slot';select set_config('test.admin','false',false)");
 await expect(call()).rejects.toThrow('Super Admin');
 await db.exec("select set_config('test.admin','true',false);select set_config('test.execution','false',false)");
 await expect(call()).rejects.toThrow('Super Admin');
 await db.exec("select set_config('test.execution','true',false)");await call();
 expect((await db.query('select count(*)::int n from base_title_role_links')).rows).toEqual([{n:0}]);
 expect((await db.query('select jsonb_array_length(before_data) n from base_title_role_events')).rows).toEqual([{n:17}]);
 expect((await db.query('select id,slot_id from org_assignments')).rows).toEqual([{id:'assignment',slot_id:'slot'}]);
 } finally {await db.close();}
},30000);
