import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { expect, it } from 'vitest';
it('minimal universal policy preserves all existing validator acceptance and rolls back exactly',async()=>{
 const db=new PGlite();
 const dir='docs/role-editor-minimal-2026-11-12/';
 const snapshot=JSON.parse(readFileSync(dir+'snapshot.json','utf8'));
 const definition=(name:string)=>snapshot.functions.find((f:{name:string})=>f.name===name).definition as string;
 try{
 await db.exec(`create schema private; create schema auth; create table base_permission_catalog(key text primary key); create function auth.uid() returns uuid language sql as $$select '00000000-0000-0000-0000-000000000001'::uuid$$; create function private.is_active(u uuid) returns boolean language sql as $$select true$$;`);
 for(const row of snapshot.catalog)await db.query('insert into base_permission_catalog values($1)',[row.key]);
 for(const n of ['org_role_permission_ready','mkt_specialty_permission_ready','permission_editor_policy','common_permission_ready','role_editor_validate','permission_editor_read'])await db.exec(definition(n));
 const kinds=['common','position','marketing_task'];
 const before=new Map<string,boolean>();
 for(const row of snapshot.catalog)for(const kind of kinds){let accepted=true;try{await db.query('select private.role_editor_validate($1,$2,$3)',[kind,[row.key],[]]);}catch{accepted=false;}before.set(kind+':'+row.key,accepted);}
 const sql=readFileSync(dir+'candidate.sql','utf8');
 await db.exec(sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION'),sql.lastIndexOf('COMMIT;')));
 const policy=(await db.query<{v:{key:string;grantable:boolean;personal:boolean}[]}>('select public.permission_editor_read() v')).rows[0]?.v ?? [];
 const universal=policy.filter(p=>p.grantable).map(p=>p.key).sort();
 expect(universal).toEqual(['att.create','att.view_own','att.witness','leave.create','leave.recall','leave.view_own','order.history','order.submit','order.take','order.update_draft','order.view','order.view_mine']);
 expect(policy).toHaveLength(43);
 for(const key of universal){expect(policy.find(p=>p.key===key)?.personal).toBe(true);for(const kind of kinds)await expect(db.query('select private.role_editor_validate($1,$2,$3)',[kind,[key],[]])).resolves.toBeDefined();}
 for(const row of snapshot.catalog)for(const kind of kinds){let accepted=true;try{await db.query('select private.role_editor_validate($1,$2,$3)',[kind,[row.key],[]]);}catch{accepted=false;}expect(accepted).toBe(before.get(kind+':'+row.key));}
 for(const kind of kinds)await expect(db.query('select private.role_editor_validate($1,$2,$3)',[kind,['settings.role'],[]])).rejects.toThrow();
 await db.exec(readFileSync(dir+'rollback.sql','utf8'));
 for(const name of ['role_editor_validate','permission_editor_read'])expect((await db.query<{v:string}>('select pg_get_functiondef(oid) v from pg_proc where proname=$1',[name])).rows[0]?.v).toBe(definition(name));
 }finally{await db.close();}
},30000);