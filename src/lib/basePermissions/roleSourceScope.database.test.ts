import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const user='00000000-0000-0000-0000-000000000002';const target='00000000-0000-0000-0000-000000000003';
const scalar=async(sql:string,args:unknown[]=[]) => (await db.query<{v:unknown}>(sql,args)).rows[0]?.v;
beforeAll(async()=>{
 await db.exec(`create schema private;create schema auth;create function auth.uid() returns uuid language sql as $$select '${user}'::uuid$$;
 create table org_assignments(id text,user_id uuid,unit_id text,status text,starts_at timestamptz,ends_at timestamptz);
 create table test_config(c jsonb);create table app_roles(id text primary key,role_kind text);create table mkt_specialties(id text,role_id text);create table mkt_staff_specialties(user_id uuid,specialty_id text,state text);create table user_roles(user_id uuid,role_id text);
 create function private.is_active(uuid) returns boolean language sql as $$select true$$;create function private.has_permission(uuid,text) returns boolean language sql as $$select true$$;create function private.is_super_admin(uuid) returns boolean language sql as $$select false$$;
 create function private.base_config() returns jsonb language sql as $$select c from test_config$$;
 create function private.org_role_rules(uuid,jsonb) returns jsonb language sql as $$select jsonb_build_array(jsonb_build_object('permission','leave.view_unit','source_id','manager-a'))$$;
 create function private.base_role_unit_contains(jsonb,text,text) returns boolean language sql as $$select $2=$3 or ($2='mkt' and $3='mkt-child')$$;
 create function private.base_valid_at(m jsonb) returns boolean language sql as $$select coalesce((m->>'active')::boolean,false) and (m->>'starts_at')::timestamptz<=now() and (m->>'ends_at' is null or (m->>'ends_at')::timestamptz>now())$$;
 insert into org_assignments values('manager-a','${user}','a','active','2020-01-01',null),('concurrent-b','${user}','b','active','2020-01-01',null),('target-b','${target}','b','active','2020-01-01',null);
 insert into test_config values('{"units":[{"id":"mkt","kind":"block","name":"Khối Marketing"},{"id":"mkt-child","kind":"department"}],"titles":[{"id":"staff","active":true}],"memberships":[]}'::jsonb);
 insert into app_roles values('seo','marketing_task');insert into mkt_specialties values('seo','seo');`.replace('\u001f',''));
 const sql=readFileSync('drizzle/migrations/0360_role_position_snapshot_restore_and_scope_contract.sql','utf8');
 for(const name of ['org_permission_unit_member','org_marketing_eligible','mkt_task_assignment_guard','direct_task_role_guard']){
  const start=sql.indexOf('CREATE OR REPLACE FUNCTION private.'+name+'(');const end=sql.indexOf('$$;',start);if(start<0||end<0)throw new Error('missing function '+name);await db.exec(sql.slice(start,end+3));
 }
 await db.exec('create trigger task_guard before insert or update on mkt_staff_specialties for each row execute function private.mkt_task_assignment_guard();create trigger direct_guard before insert or update on user_roles for each row execute function private.direct_task_role_guard()');
},30000);
afterAll(()=>db.close());
const setMembership=async(rows:unknown[])=>db.query("update test_config set c=jsonb_set(c,'{memberships}',$1::jsonb)",[JSON.stringify(rows)]);
const assignment=(id:string,unit='mkt-child')=>({id,user_id:user,title_id:'staff',unit_id:unit,status:'active',active:true,starts_at:'2020-01-01'});
it('permission from unit A cannot use concurrent membership in unit B',async()=>{expect(await scalar('select private.org_permission_unit_member($1,$2,$3) v',[user,target,'leave.view_unit'])).toBe(false);});
it('permission grants access when its own source unit matches',async()=>{await db.exec("update org_assignments set unit_id='a' where id='target-b'");expect(await scalar('select private.org_permission_unit_member($1,$2,$3) v',[user,target,'leave.view_unit'])).toBe(true);});
it('ending the permission source removes its unit access but leaves another appointment',async()=>{await db.exec("update org_assignments set ends_at='2021-01-01' where id='manager-a'");expect(await scalar('select private.org_permission_unit_member($1,$2,$3) v',[user,target,'leave.view_unit'])).toBe(false);expect(await scalar("select ends_at is null v from org_assignments where id='concurrent-b'")).toBe(true);});
it('outside Marketing cannot obtain a task through the write API',async()=>{await setMembership([assignment('a','b')]);expect(await scalar('select private.org_marketing_eligible($1,private.base_config()) v',[user])).toBe(false);await expect(db.query("insert into mkt_staff_specialties values($1,'seo','active')",[user])).rejects.toThrow('bổ nhiệm Marketing');});
it('concurrent Marketing appointment makes a person eligible',async()=>{await setMembership([assignment('a','b'),{...assignment('m'),kind:'concurrent'}]);expect(await scalar('select private.org_marketing_eligible($1,private.base_config()) v',[user])).toBe(true);await db.query("insert into mkt_staff_specialties values($1,'seo','active')",[user]);});
it('another active Marketing source survives ending one',async()=>{await setMembership([{...assignment('m1'),ends_at:'2021-01-01'},assignment('m2')]);expect(await scalar('select private.org_marketing_eligible($1,private.base_config()) v',[user])).toBe(true);});
it('after all Marketing sources end no new task may be activated',async()=>{await setMembership([{...assignment('m'),ends_at:'2021-01-01'}]);expect(await scalar('select private.org_marketing_eligible($1,private.base_config()) v',[user])).toBe(false);await db.exec("update mkt_staff_specialties set state='removed'");await expect(db.exec("update mkt_staff_specialties set state='active'")).rejects.toThrow('bổ nhiệm Marketing');expect(await scalar("select state v from mkt_staff_specialties limit 1")).toBe('removed');});
it('direct Role assignment cannot bypass Marketing task checks',async()=>{await expect(db.query("insert into user_roles values($1,'seo')",[user])).rejects.toThrow('không gán trực tiếp');});
