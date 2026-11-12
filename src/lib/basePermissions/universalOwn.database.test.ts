import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { expect, it } from 'vitest';
it('staged own-key contract permits all ordinary Role kinds, preserves scope blockers and exactly rolls back',async()=>{
 const db=new PGlite();
 const snapshot=JSON.parse(readFileSync('docs/role-customization-2026-11-12/snapshot.json','utf8'));
 const keys=JSON.parse(readFileSync('docs/role-customization-2026-11-12/keys.json','utf8')) as string[];
 const definition=(name:string)=>snapshot.functions.find((f:{name:string})=>f.name===name).definition as string;
 try{
 await db.exec(`create schema private;create table base_permission_catalog(key text primary key);`);
 for(const k of snapshot.catalog) await db.query('insert into base_permission_catalog values($1)',[k.key]);
 for(const n of ['org_role_permission_ready','mkt_specialty_permission_ready','permission_editor_policy','common_permission_ready','role_editor_validate'])await db.exec(definition(n));
 const before=new Map<string,boolean>();
 for(const row of snapshot.catalog)for(const kind of ['common','position','marketing_task']){
 let accepted=true;try{await db.query('select private.role_editor_validate($1,$2,$3)',[kind,[row.key],[]]);}catch{accepted=false;}before.set(kind+':'+row.key,accepted);
 }
 await expect(db.query("select private.role_editor_validate('marketing_task',array['leave.edit_own'],'{}')")).rejects.toThrow();
 const sql=readFileSync('docs/role-customization-2026-11-12/candidate.sql','utf8');
 // Fixture uses the same complete bodies; production preflight is independently checksum-guarded.
 await db.exec(sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION'),sql.lastIndexOf('COMMIT;')));
 for(const k of keys){
 for(const kind of ['common','position','marketing_task'])await expect(db.query('select private.role_editor_validate($1,$2,$3)',[kind,[k],[]])).resolves.toBeDefined();
 expect((await db.query<{ready:boolean}>('select private.common_permission_ready($1) ready',[k])).rows[0]?.ready).toBe(true);
 expect((await db.query<{personal:boolean}>('select personal from private.permission_editor_policy() where key=$1',[k])).rows[0]?.personal).toBe(true);
 }
 for(const kind of ['common','position','marketing_task'])await expect(db.query('select private.role_editor_validate($1,$2,$3)',[kind,['settings.role'],[]])).rejects.toThrow();
 await expect(db.query("select private.role_editor_validate('marketing_task',array['leave.view_unit'],'{}')")).rejects.toThrow();
 await expect(db.query("select private.role_editor_validate('common',array['k3.use'],'{}')")).rejects.toThrow();
 await expect(db.query("select private.role_editor_validate('position',array['web.view'],'{}')")).rejects.toThrow();
 await expect(db.query("select private.role_editor_validate('position',array['settings.role'],array['settings.role'])")).resolves.toBeDefined();
 // Contract-only candidate MUST NOT silently expand existing resolver grants.
 for(const row of snapshot.catalog)for(const kind of ['common','position','marketing_task']){
 let accepted=true;try{await db.query('select private.role_editor_validate($1,$2,$3)',[kind,[row.key],[]]);}catch{accepted=false;}
 expect(accepted).toBe(before.get(kind+':'+row.key));
 }
 await db.exec(readFileSync('docs/role-customization-2026-11-12/rollback.sql','utf8'));
 await expect(db.query("select private.role_editor_validate('marketing_task',array['leave.edit_own'],'{}')")).rejects.toThrow();
 for(const n of ['role_editor_validate','mkt_specialty_permission_ready']){
 const got=(await db.query<{definition:string}>('select pg_get_functiondef(oid) definition from pg_proc where proname=$1',[n])).rows[0]?.definition;
 expect(got).toBe(definition(n));
 }
 }finally{await db.close();}
},30000);