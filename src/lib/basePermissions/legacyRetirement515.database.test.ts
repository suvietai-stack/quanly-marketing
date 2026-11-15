import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// Isolated PostgreSQL fixture. Never connects to Base production.
const dir='docs/role-515-cutover-20261116/';
const sourceCandidate=readFileSync(dir+'legacy-retirement-candidate.sql','utf8');
const sourceRollback=readFileSync(dir+'legacy-retirement-rollback.sql','utf8');
const LIVE_ROLES_MD5='6de25f7bbb1f9cbe4df96e5e5944c861';
const LIVE_LINKS_MD5='b2ba1d705627b5e25f07927e23107d48';
const db=new PGlite();
let rolesHash='',linksHash='';
const count=async(sql:string)=>Number((await db.query<{n:number}>(sql)).rows[0]?.n??0);
const dataHash=async(sql:string)=>String((await db.query<{v:string}>(sql)).rows[0]?.v??'');

beforeAll(async()=>{
  await db.exec([
    'CREATE ROLE anon','CREATE ROLE authenticated','CREATE SCHEMA private',
    "CREATE TABLE public.app_roles(id text PRIMARY KEY,name text NOT NULL,role_kind text NOT NULL,catalog_generation smallint NOT NULL,is_system boolean NOT NULL,catalog_state text DEFAULT 'standard',permissions text[] DEFAULT '{}',role_code text)",
    "CREATE TABLE public.base_title_role_links(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),role_id text NOT NULL REFERENCES public.app_roles(id),title_id text NOT NULL,active boolean NOT NULL DEFAULT false)",
    "CREATE TABLE public.user_roles(user_id uuid NOT NULL,role_id text NOT NULL REFERENCES public.app_roles(id))",
    "INSERT INTO public.app_roles(id,name,role_kind,catalog_generation,is_system) VALUES ('role-super-admin','Super Admin','system',1,true),('role-admin','Admin','system',1,true),('role-nhan-su-moi','Nhân sự mới','position',1,true),('role-dong-hang','Đóng hàng','position',1,true)",
    "INSERT INTO public.app_roles(id,name,role_kind,catalog_generation,is_system) SELECT 'old-'||g,'Old '||g,'position',1,false FROM generate_series(1,27) g",
    "INSERT INTO public.app_roles(id,name,role_kind,catalog_generation,is_system) SELECT 'new-'||g,'New '||g,CASE WHEN g=1 THEN 'common' WHEN g<=21 THEN 'position' ELSE 'marketing_task' END,2,false FROM generate_series(1,26) g",
    "INSERT INTO public.user_roles VALUES('00000000-0000-0000-0000-000000000001','role-super-admin'),('00000000-0000-0000-0000-000000000005','role-super-admin')",
    "INSERT INTO public.base_title_role_links(role_id,title_id,active) SELECT 'old-'||g,'title-'||g,false FROM generate_series(1,17) g"
  ].join(';\n')+';');
  // Match the real live protected Role deletion trigger contract.
  await db.exec([
    "CREATE FUNCTION public.app_role_delete_guard() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.is_system OR EXISTS(SELECT 1 FROM public.user_roles WHERE role_id=OLD.id) OR EXISTS(SELECT 1 FROM public.base_title_role_links WHERE role_id=OLD.id) THEN RAISE EXCEPTION 'protected or used Role' USING ERRCODE='23503'; END IF; RETURN OLD; END $$",
    "CREATE TRIGGER app_role_delete_guard BEFORE DELETE ON public.app_roles FOR EACH ROW EXECUTE FUNCTION public.app_role_delete_guard()",
    "CREATE FUNCTION public.test_role_new_empty_guard() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.catalog_generation=1 AND NOT NEW.is_system THEN RAISE EXCEPTION 'historical role needs temporary validation bypass'; END IF; RETURN NEW; END $$",
    "CREATE TRIGGER role_new_empty_guard BEFORE INSERT ON public.app_roles FOR EACH ROW EXECUTE FUNCTION public.test_role_new_empty_guard()"
  ].join(';\n')+';');
  rolesHash=await dataHash(
    "SELECT md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),'')) v FROM public.app_roles r WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')");
  linksHash=await dataHash(
    "SELECT md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),'')) v FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')");
  const c=sourceCandidate.replaceAll(LIVE_ROLES_MD5,rolesHash).replaceAll(LIVE_LINKS_MD5,linksHash);
  const start=c.indexOf('CREATE TABLE private.role_515_legacy_backup');
  if(start<0)throw Error('Candidate SQL not found');
  await db.exec(c.slice(start,c.lastIndexOf('COMMIT;')));
},60000);
afterAll(()=>db.close());

it('removes only 29 obsolete catalog entries and 17 inactive title links',async()=>{
  expect(await count("SELECT count(*)::int n FROM public.app_roles WHERE catalog_generation=1")).toBe(2);
  expect(await count("SELECT count(*)::int n FROM public.app_roles WHERE catalog_generation=2")).toBe(26);
  expect(await count("SELECT count(*)::int n FROM public.base_title_role_links")).toBe(0);
});
it('keeps both Super Admin assignments and exact JSON snapshots for recovery',async()=>{
  expect(await count("SELECT count(*)::int n FROM public.user_roles WHERE role_id='role-super-admin'")).toBe(2);
  expect(await count("SELECT jsonb_array_length(roles_json)::int n FROM private.role_515_legacy_backup")).toBe(29);
  expect(await count("SELECT jsonb_array_length(title_links_json)::int n FROM private.role_515_legacy_backup")).toBe(17);
});
it('restores exact original Role/link records with system flags and the validation trigger enabled',async()=>{
  const r=sourceRollback.replaceAll(LIVE_ROLES_MD5,rolesHash).replaceAll(LIVE_LINKS_MD5,linksHash);
  await db.exec(r);
  expect(await count("SELECT count(*)::int n FROM public.app_roles WHERE catalog_generation=1")).toBe(31);
  expect(await count("SELECT count(*)::int n FROM public.base_title_role_links")).toBe(17);
  expect(await count("SELECT count(*)::int n FROM public.app_roles WHERE id IN ('role-nhan-su-moi','role-dong-hang') AND is_system")).toBe(2);
  expect(await count("SELECT count(*)::int n FROM pg_trigger WHERE tgname='role_new_empty_guard' AND tgenabled='O'")).toBe(1);
  expect(await dataHash(
    "SELECT md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),'')) v FROM public.app_roles r WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')")).toBe(rolesHash);
  expect(await dataHash(
    "SELECT md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),'')) v FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')")).toBe(linksHash);
  expect(await count("SELECT count(*)::int n FROM public.user_roles WHERE role_id='role-super-admin'")).toBe(2);
});
