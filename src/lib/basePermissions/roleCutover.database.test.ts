import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const admin='00000000-0000-0000-0000-000000000001', employee='00000000-0000-0000-0000-000000000002';
const val=async(sql:string,args:unknown[]=[]) => (await db.query<{v:unknown}>(sql,args)).rows[0]?.v;
beforeAll(async()=>{
 await db.exec(`create schema private;create schema auth;create role anon;create role authenticated;
 create function auth.uid() returns uuid language sql as $$select current_setting('test.actor')::uuid$$;
 create function private.is_active(uuid) returns boolean language sql as $$select true$$;
 create function private.is_super_admin(uuid) returns boolean language sql as $$select $1='${admin}'::uuid$$;
 create table app_roles(id text primary key,name text,description text,permissions text[],role_kind text,catalog_group text,signal_scope_all boolean,signal_scope text[],updated_at timestamptz default now(),is_system boolean default false,catalog_generation int default 2);
 create table user_roles(id int);create table base_title_role_links(id int);create table org_assignments(id int);create table org_position_slots(id int);
 create table mkt_specialties(id text primary key,role_id text);create table mkt_staff_specialties(id int);create table leave_requests(id int);
 create table mkt_specialty_events(user_id uuid,specialty_id text,action text,before_state text,after_state text,actor uuid,note text);
 create table private.role_catalog_audit(id uuid primary key default gen_random_uuid(),action text,role_id text,before_data jsonb,after_data jsonb);
 create table private.role_catalog_previews(id uuid primary key default gen_random_uuid(),actor_id uuid,action text,role_id text,proposed jsonb,before_data jsonb,baseline text,expires_at timestamptz default now()+interval '10 min',applied_at timestamptz);
 create function private.role_catalog_fingerprint() returns text language sql as $$select md5(coalesce((select string_agg(to_jsonb(r)::text,'|' order by id) from app_roles r),'')||coalesce((select string_agg(to_jsonb(s)::text,'|' order by id) from mkt_specialties s),''))$$;
 create function private.mkt_specialty_permission_ready(text) returns boolean language sql as $$select true$$;
 create function test_audit() returns trigger language plpgsql as $$begin insert into private.role_catalog_audit(action,role_id,before_data,after_data) values('UPDATE',new.id,to_jsonb(old),to_jsonb(new));return new;end$$;
 create trigger audit after update on app_roles for each row execute function test_audit();
 insert into app_roles(id,name,description,permissions,role_kind,catalog_group,signal_scope_all,signal_scope) values('content','Content','',array['web.view','social.post_create','settings.view'],'marketing_task','MKT',false,'{}'),('old-design','Design','',array['order.view','order.take'],'position','Design',false,'{}'),('role-v2-design-staff','Design V2','',array['order.take','order.view'],'position','Design',false,'{}');
 insert into mkt_specialties values('design','old-design'),('photography','old-design');
 select set_config('test.actor','${admin}',false);`);
 const sql=readFileSync('docs/pending/role_v2_cutover_restore.sql','utf8');
 await db.exec(sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION public.role_catalog_restore(')));
},30000);
afterAll(()=>db.close());
it('restores only exact audited before rights, including sensitive keys, not arbitrary input',async()=>{
 await db.exec("update app_roles set permissions='{web.view}' where id='content'");
 const id=await val("select id v from private.role_catalog_audit where role_id='content' limit 1");
 const p=await val("select role_catalog_restore('preview',$1) v",[id]) as {id:string};
 await db.query("select role_catalog_restore('apply',null,$1,'KHÔI PHỤC ROLE','test restore')",[p.id]);
 expect(await val("select permissions v from app_roles where id='content'")).toEqual(['web.view','social.post_create','settings.view']);
 expect(await val("select count(*)::int v from private.role_catalog_audit where role_id='content'")).toBe(2);
});
it('stale restore preview cannot overwrite concurrent Role edits',async()=>{
 await db.exec("update app_roles set permissions='{web.view}' where id='content'");
 const id=await val("select id v from private.role_catalog_audit where role_id='content' order by ctid desc limit 1");
 const p=await val("select role_catalog_restore('preview',$1) v",[id]) as {id:string};
 await db.exec("update app_roles set description='another admin changed' where id='content'");
 await expect(db.query("select role_catalog_restore('apply',null,$1,'KHÔI PHỤC ROLE','test')",[p.id])).rejects.toThrow('nguồn đã thay đổi');
});
it('ordinary caller cannot restore or rebind',async()=>{
 await db.query("select set_config('test.actor',$1,false)",[employee]);
 await expect(db.exec("select role_catalog_restore('preview')")).rejects.toThrow('Super Admin');
 await expect(db.exec("select role_specialty_rebind('preview','design','role-v2-design-staff')")).rejects.toThrow('Super Admin');
 await db.query("select set_config('test.actor',$1,false)",[admin]);
});
it('equal Design rights may move without changing specialty IDs or history',async()=>{
 const p=await val("select role_specialty_rebind('preview','design','role-v2-design-staff') v") as {id:string};
 await db.query("select role_specialty_rebind('apply',null,null,$1,'CHUYỂN ROLE CHUYÊN MÔN','test')",[p.id]);
 expect(await val("select role_id v from mkt_specialties where id='design'")).toBe('role-v2-design-staff');
 expect(await val("select count(*)::int v from mkt_specialty_events where specialty_id='design'")).toBe(1);
});
it('rebind rejects lost or added specialty rights',async()=>{
 await db.exec("update app_roles set permissions='{order.view}' where id='role-v2-design-staff'");
 await expect(db.exec("select role_specialty_rebind('preview','photography','role-v2-design-staff')")).rejects.toThrow('đổi quyền');
 expect(await val("select role_id v from mkt_specialties where id='photography'")).toBe('old-design');
});
it('V2 specialty Role edits never rewrite canonical appointment signatures',async()=>{
 await db.exec(`alter table org_assignments add column data jsonb default '{}',add column revision int default 1;
 alter table base_title_role_links add column role_id text,add column enabled_permissions text[],add column permission_signature text,add column revision int,add column updated_at timestamptz,add column title_source text,add column title_id text;
 create table profiles(id uuid);insert into profiles values('${admin}');
 alter table user_roles add column user_id uuid,add column role_id text;
 create table base_title_role_events(actor_id uuid,title_source text,title_id text,reason text,before_data jsonb,after_data jsonb);
 create function private.org_role_permission_ready(text) returns boolean language sql as $$select true$$;
 insert into org_assignments(id,data) values(1,'{"specialty_ids":["design"],"specialty_signatures":{"design":"old"}}');`);
 const old=readFileSync('docs/role-v2-cutover-2026-11-11/rollback-signature-sync.sql','utf8');
 await db.exec(old);
 await db.exec(readFileSync('drizzle/migrations/0377_role_v2_task_edit_avoids_legacy_assignment_resign.sql','utf8'));
 await db.exec('create trigger resign after update of permissions on app_roles for each row execute function private.base_role_links_resign()');
 await db.exec("update app_roles set permissions='{order.view,order.take}' where id='role-v2-design-staff'");
 expect(await val("select data->'specialty_signatures'->>'design' v from org_assignments where id=1")).toBe('old');
 expect(await val('select revision v from org_assignments where id=1')).toBe(1);
});