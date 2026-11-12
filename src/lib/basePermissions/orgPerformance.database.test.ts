import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const root = 'docs/org-performance-2026-11-12/';
const admin = '00000000-0000-0000-0000-000000000001';
const user = '00000000-0000-0000-0000-000000000002';
const value = async (sql: string, args: unknown[] = []) => (await db.query<{ v: any }>(sql, args)).rows[0]?.v;
beforeAll(async () => {
 await db.exec(`create schema private;create schema auth;
 create function auth.uid() returns uuid language sql as $$select current_setting('test.actor')::uuid$$;
 create function private.is_active(uuid) returns boolean language sql as $$select coalesce(current_setting('test.active',true),'true')<>'false'$$;
 create function private.is_super_admin(uuid) returns boolean language sql as $$select $1='${admin}'::uuid$$;
 create function biz_admin(uuid) returns boolean language sql as $$select false$$;
 create table org_units(id text,parent_id text,kind text,active boolean);
 insert into org_units values('company',null,'company',true),('block','company','block',true),('dept','block','department',true),('peer','company','department',true),('off','company','department',false);
 create table org_assignments(user_id uuid,unit_id text,starts_at timestamptz,ends_at timestamptz);
 insert into org_assignments values('${user}','dept',now()-interval '1 day',null);
 create table profiles(id uuid,full_name text,status text);insert into profiles values('${user}','Staff','active');
 create table org_events(id text,unit_ids jsonb,created_at timestamptz);
 create table private.org_control(id boolean,revision int);insert into private.org_control values(true,1);
 create table base_permission_catalog(key text,label text,module text);
 insert into base_permission_catalog select 'p.'||x,'Permission '||x,'Module' from generate_series(1,510) x;
 insert into base_permission_catalog values('k3.use','K3','K3'),('biz.crm_use','CRM','CRM');
 create function private.base_supported(text) returns boolean language sql as $$select $1<>'p.510'$$;
 create function private.base_legacy(uuid,text) returns jsonb language sql as $$select jsonb_build_object('allowed',$2='k3.use','source',jsonb_build_object('kind','business','tier',2))$$;
 create table fixture_rules(rule jsonb);
 create function private.base_rules(uuid,jsonb) returns jsonb language sql as $$select coalesce(jsonb_agg(rule),'[]') from fixture_rules$$;
 create function private.org_config() returns jsonb language sql as $$select jsonb_build_object('units',(select jsonb_agg(to_jsonb(u)) from org_units u),'titles','[]'::jsonb,'memberships','[]'::jsonb,'defaults','[]'::jsonb,'bundles','[]'::jsonb,'bindings','[]'::jsonb,'grants','[]'::jsonb)$$;`);
 await db.exec(readFileSync(root+'private.org_contains.sql','utf8'));
 await db.exec(readFileSync(root+'private.org_can.sql','utf8'));
 await db.exec(readFileSync(root+'public.org_workspace_read.sql','utf8').replace('public.org_workspace_read()', 'public.workspace_before()'));
 await db.exec(readFileSync(root+'workspace-candidate.sql','utf8'));
 await db.exec(readFileSync(root+'private.base_effective.sql','utf8').replace('private.base_effective(', 'private.effective_before('));
 await db.exec(readFileSync(root+'effective-candidate.sql','utf8'));
 await db.query("select set_config('test.actor',$1,false)",[user]);
},30000);
afterAll(()=>db.close());
const normalized = (x: any): any => Array.isArray(x) ? x.map(normalized).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))) : x && typeof x==='object' ? Object.fromEntries(Object.entries(x).filter(([k])=>k!=='server_now').map(([k,v])=>[k,normalized(v)])) : x;
const rules = async (rows: object[]) => { await db.exec('delete from fixture_rules');for(const row of rows) await db.query('insert into fixture_rules values($1)',[row]); };
it.each(['company','block','dept'])('exact scoped output parity for %s and DENY winning on child',async unit=>{
 await rules([{permission:'org.assign_staff',effect:'ALLOW',unit_id:unit},{permission:'org.view',effect:'ALLOW',unit_id:unit},{permission:'org.view',effect:'DENY',unit_id:'dept'}]);
 expect(normalized(await value('select org_workspace_read() v'))).toEqual(normalized(await value('select workspace_before() v')));
});
it('unconfigured fallback and super admin output stay identical, including inactive unit behavior',async()=>{
 await rules([]);expect(normalized(await value('select org_workspace_read() v'))).toEqual(normalized(await value('select workspace_before() v')));
 await db.query("select set_config('test.actor',$1,false)",[admin]);
 expect(normalized(await value('select org_workspace_read() v'))).toEqual(normalized(await value('select workspace_before() v')));
 await db.query("select set_config('test.actor',$1,false)",[user]);
});
it('inactive actor remains rejected by both readers',async()=>{
 await db.exec("select set_config('test.active','false',false)");
 await expect(value('select org_workspace_read() v')).rejects.toThrow('đăng nhập');
 await expect(value('select workspace_before() v')).rejects.toThrow('đăng nhập');
 await db.exec("select set_config('test.active','true',false)");
});
it('effective output retains exact source order, DENY, unsupported keys and K3 legacy eligibility',async()=>{
 await rules([{permission:'p.1',effect:'ALLOW',source_id:'a'},{permission:'p.1',effect:'DENY',source_id:'b'},{permission:'biz.crm_use',effect:'ALLOW',source_id:'c'},{permission:'p.510',effect:'ALLOW'}]);
 const before=await value("select private.effective_before($1,'{}') v",[user]);const after=await value("select private.base_effective($1,'{}') v",[user]);
 expect(after).toEqual(before);expect(after.find((r:any)=>r.key==='p.1').allowed).toBe(false);expect(after.find((r:any)=>r.key==='k3.use').allowed).toBe(true);expect(after.find((r:any)=>r.key==='p.510').decision).toBe('NOT_CONFIGURED');
});
it('changing a source is immediately reflected, without cached actor rules',async()=>{
 await rules([{permission:'org.view',effect:'ALLOW',unit_id:'dept'}]);const first=await value('select org_workspace_read() v');
 await rules([{permission:'org.view',effect:'ALLOW',unit_id:'block'}]);const second=await value('select org_workspace_read() v');
 expect(first.config.units.map((r:any)=>r.id)).toEqual(['dept']);expect(second.config.units.map((r:any)=>r.id).sort()).toEqual(['block','dept']);
});