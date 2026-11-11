import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const A='00000000-0000-0000-0000-000000000001';
const B='00000000-0000-0000-0000-000000000002';
const C='00000000-0000-0000-0000-000000000003';
beforeAll(async()=>{
 await db.exec(`create schema private; create role authenticated; create role anon; create role service_role;
 create table app_roles(id text primary key,permissions text[],signal_scope_all boolean,signal_scope text[]);
 create table user_roles(user_id uuid,role_id text);
 create table org_assignments(user_id uuid,title_id text,slot_id text,status text,starts_at timestamptz,ends_at timestamptz);
 create table base_title_role_links(title_id text,role_id text,permission_signature text);
 create table slot_sources(user_id uuid,role_id text,source_kind text,permissions text[]);
 create function private.is_super_admin(u uuid) returns boolean language sql as $$select u='${A}'::uuid$$;
 create function private.is_admin(u uuid) returns boolean language sql as $$select u='${A}'::uuid$$;
 create function private.base_config() returns jsonb language sql as $$select '{}'::jsonb$$;
 create function private.role_source_rows(c jsonb) returns setof slot_sources language plpgsql as $$begin
 if current_setting('test.forbid_sources',true)='true' then raise exception 'expensive source path evaluated';end if;
 return query select * from slot_sources; end$$;
 insert into app_roles values('team',array['signal.view_all'],false,array['Quà','Khác']),('all',array['signal.view_all'],true,'{}');
 insert into user_roles values('${B}','team'),('${C}','all');`);
 await db.exec(readFileSync('docs/pending/signals_p0_scope_short_circuit.sql','utf8'));
});
afterAll(()=>db.close());
async function scope(u:string|null,g:string[]){return (await db.query<{v:boolean}>('select private.sig_scope_ok($1,$2) v',[u,g])).rows[0]?.v;}
it('existing Super Admin scope skips the expensive organization source entirely',async()=>{
 await db.exec("select set_config('test.forbid_sources','true',false)");
 expect(await scope(A,['Any'])).toBe(true);
 expect(await scope(null,['Any'])).toBe(false);
 await db.exec("select set_config('test.forbid_sources','false',false)");
});
it('direct team groups remain bounded and Khác subgroups stay compatible',async()=>{
 expect(await scope(B,['Quà'])).toBe(true);expect(await scope(B,['Other'])).toBe(false);expect(await scope(B,['Khác:Nguồn'])).toBe(true);
});
it('existing global scope remains global',async()=>{expect(await scope(C,['Other'])).toBe(true);});
it('slot source uses its own Role scope and does not widen the direct Role',async()=>{
 await db.query("insert into slot_sources values($1,'team','slot',array['signal.view_all'])",[B]);
 expect(await scope(B,['Other'])).toBe(false);expect(await scope(B,['Quà'])).toBe(true);
});
it('unsigned title mapping never gains its Role group scope',async()=>{
 await db.exec(`delete from user_roles where user_id='${B}';delete from slot_sources;
 insert into org_assignments values('${B}','t',null,'active',now()-interval '1 day',null);
 insert into base_title_role_links values('t','team','invalid');`);
 expect(await scope(B,['Quà'])).toBe(false);
 await db.exec("update base_title_role_links set permission_signature=md5((select permissions::text from app_roles where id='team'))");
 expect(await scope(B,['Quà'])).toBe(true);expect(await scope(B,['Other'])).toBe(false);
});