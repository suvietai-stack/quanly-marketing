import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';
const db = new PGlite();
const SA='00000000-0000-0000-0000-000000000001';
const MKT='00000000-0000-0000-0000-000000000002';
const BIZ='00000000-0000-0000-0000-000000000003';
const CUSTOM='00000000-0000-0000-0000-000000000004';
beforeAll(async()=>{
 await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
 create table profiles(id uuid primary key,full_name text,status text,is_system_admin boolean default false);
 create table app_roles(id text primary key,name text,permissions text[],catalog_state text default 'standard');
 create table user_roles(user_id uuid,role_id text,created_at timestamptz default now(),unique(user_id,role_id));
 create table user_permission_overrides(user_id uuid primary key,use_custom boolean,permissions text[],mode text,updated_at timestamptz default now());
 create table base_perm_cleanup_runs(id uuid primary key default gen_random_uuid(),actor uuid,fingerprint text,removed jsonb,restored boolean default false,created_at timestamptz default now(),restored_at timestamptz,restored_by uuid);
 create table org_units(id text,name text);create table org_titles(id text,name text);create table org_assignments(user_id uuid,unit_id text,title_id text,status text,starts_at timestamptz,ends_at timestamptz);
 create table org_parent_history(id text);create table base_title_role_links(id text);create table mkt_staff_specialties(user_id uuid,specialty_id text);create table mkt_specialties(id text);create table base_org_state(id text);
 create table biz_appointments(user_id uuid);create table biz_department_members(user_id uuid);create table biz_management_assignments(user_id uuid);create table biz_member_affiliations(user_id uuid);create table base_permission_catalog(key text);
 create function private.is_active(u uuid) returns boolean language sql as $$select u is not null$$;
 create function private.is_super_admin(u uuid) returns boolean language sql as $$select u='${SA}'::uuid$$;
 create function private.is_admin(u uuid) returns boolean language sql as $$select u='${SA}'::uuid$$;
 create function private.cleanup_is_biz_staff(u uuid) returns boolean language sql as $$select exists(select 1 from biz_department_members where user_id=u)$$;
 create function private.org_fingerprint() returns text language sql as $$select 'stable'$$;
 create function private.base_config() returns jsonb language sql as $$select '{}'::jsonb$$;
 create function public.biz_effective_access(u uuid) returns jsonb language sql as $$select jsonb_build_object('user_id',u,'permissions','[]'::jsonb)$$;
 create function public.biz_participant(_actor uuid) returns boolean language sql as $$select exists(select 1 from biz_department_members where user_id=_actor)$$;
 create function private.base_rules(u uuid,c jsonb) returns jsonb language sql as $$select '[]'::jsonb$$;
 create function private.org_role_permission_ready(p text) returns boolean language sql as $$select false$$;
 create function private.mkt_specialty_permission_ready(p text) returns boolean language sql as $$select false$$;
 create function private.has_permission(u uuid,p text) returns boolean language sql as $$select exists(select 1 from user_roles ur join app_roles r on r.id=ur.role_id where ur.user_id=u and p=any(r.permissions))$$;
 create function private.cleanup_account_eval(u uuid,c jsonb) returns jsonb language sql as $$select jsonb_build_object('user_id',u,'group','C','roles','[]'::jsonb,'lost',jsonb_build_array('video.create'),'pending_work',1)$$;
 insert into profiles(id,full_name,status) values('${SA}','Admin','Đang hoạt động'),('${MKT}','Mkt','Đang hoạt động'),('${BIZ}','Biz','Đang hoạt động'),('${CUSTOM}','Custom','Đang hoạt động');
 insert into app_roles(id,name,permissions) values('role-video','Video',array['video.create']),('role-kinh-doanh','Biz',array['biz.view']),('safe-extra','Extra',array['order.view']);
 insert into user_roles values('${SA}','safe-extra','2020-01-01'),('${MKT}','role-video','2020-01-01'),('${BIZ}','role-video','2020-01-01'),('${CUSTOM}','role-video','2020-01-01');
 insert into biz_department_members values('${BIZ}');insert into user_permission_overrides(user_id,use_custom,permissions,mode) values('${CUSTOM}',true,array['signal.sale'],'replace');insert into base_permission_catalog values('order.view'),('settings.role');`);
 for(const f of ['0339_final_permission_transition','0340_supplemental_permissions_atomic','0341_final_snapshot_set_based']) await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.query("select set_config('test.uid',$1,false)",[SA]);
},30000);
afterAll(()=>db.close());
async function preview(){return (await db.query<{p:{fingerprint:string;accounts:{user_id:string;status:string}[]}}>('select base_perm_final_preview() p')).rows[0].p;}

beforeAll(async()=>{await db.exec(readFileSync('drizzle/migrations/0347_legacy_reset_standard_only_contract.sql','utf8'));await db.exec(readFileSync('drizzle/migrations/0349_standard_reset_supplement_catalog.sql','utf8'));});
let resetRun:string;
it('reset includes Business and replace overrides, protects Super Admin, preserves organization and snapshots',async()=>{
 const p=(await db.query<{p:{fingerprint:string,pending_count:number,protected_count:number}}>('select base_perm_standard_reset_preview() p')).rows[0].p;
 expect(p.pending_count).toBe(3);expect(p.protected_count).toBe(1);
 await expect(db.query('select base_perm_standard_reset_execute($1,$2)',[p.fingerprint,'wrong'])).rejects.toThrow(/Super Admin/);
 const r=(await db.query<{r:{run_id:string,accounts:number,removed_roles:number}}>('select base_perm_standard_reset_execute($1,$2) r',[p.fingerprint,'RESET QUYỀN LEGACY'])).rows[0].r;
 resetRun=r.run_id;expect(r.accounts).toBe(3);expect(r.removed_roles).toBe(3);
 expect((await db.query('select * from user_roles where user_id=$1',[SA])).rows).toHaveLength(1);
 expect((await db.query('select * from biz_department_members')).rows).toHaveLength(1);
 expect((await db.query<{allowed:boolean}>('select biz_participant($1) allowed',[BIZ])).rows[0].allowed).toBe(false);
 expect((await db.query<{use_custom:boolean}>('select use_custom from user_permission_overrides where user_id=$1',[CUSTOM])).rows[0].use_custom).toBe(false);
 expect((await db.query<{snapshot:{user_roles:unknown[],overrides:unknown[]}}>('select snapshot from base_perm_cleanup_runs where id=$1',[resetRun])).rows[0].snapshot.user_roles).toHaveLength(4);
});
it('legacy regrant is blocked and repeated reset is idempotent',async()=>{
 await expect(db.query('insert into user_roles(user_id,role_id) values($1,$2)',[BIZ,'role-video'])).rejects.toThrow(/legacy/);
 await expect(db.query('update user_permission_overrides set use_custom=true where user_id=$1',[CUSTOM])).rejects.toThrow(/legacy/);
 const r=(await db.query<{r:{already_applied:boolean}}>("select base_perm_standard_reset_execute('stale','RESET QUYỀN LEGACY') r")).rows[0].r;expect(r.already_applied).toBe(true);
 expect((await db.query('select * from base_perm_cleanup_runs')).rows).toHaveLength(1);
});
it('Business staff after reset may configure safe standard supplements without legacy roles',async()=>{
 const r=(await db.query<{r:{roles:{id:string,catalog_state:string}[]}}>('select account_supplement_read($1) r',[BIZ])).rows[0].r;
 expect(r.roles.every(role=>role.catalog_state==='standard')).toBe(true);
 expect(r.roles.map(role=>role.id)).toContain('safe-extra');
});
it('restore retains newer supplemental grants and original timestamps',async()=>{
 await db.query("insert into user_roles(user_id,role_id,source_kind) values($1,'safe-extra','supplemental')",[MKT]);
 await db.query('select base_perm_standard_reset_restore($1)',[resetRun]);
 expect((await db.query('select role_id from user_roles where user_id=$1 order by role_id',[MKT])).rows).toEqual([{role_id:'role-video'},{role_id:'safe-extra'}]);
 expect((await db.query<{use_custom:boolean}>('select use_custom from user_permission_overrides where user_id=$1',[CUSTOM])).rows[0].use_custom).toBe(true);
 expect((await db.query<{at:string}>('select created_at::text at from user_roles where user_id=$1 and role_id=$2',[BIZ,'role-video'])).rows[0].at).toContain('2020-01-01');
});
it('non-admin reset is forbidden and snapshot is not readable',async()=>{
 await db.query("select set_config('test.uid',$1,false)",[MKT]);await expect(db.query('select base_perm_standard_reset_preview()')).rejects.toThrow(/Super Admin/);
 expect((await db.query<{ok:boolean}>("select has_table_privilege('authenticated','private.legacy_reset_accounts','SELECT') ok")).rows[0].ok).toBe(false);
});
