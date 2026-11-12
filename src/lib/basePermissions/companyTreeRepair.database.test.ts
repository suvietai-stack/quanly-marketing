import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { it,expect } from 'vitest';
it('Company parent preview expands only Company subtree, preserving every block subtree and Role rows',async()=>{
 const db=new PGlite();try{
 const saved=JSON.parse(readFileSync('docs/org-repair-2026-11-12/rows.json','utf8')).rows[0].snapshot;
 const functions=JSON.parse(readFileSync('docs/org-repair-2026-11-12/functions.json','utf8')).rows;
 await db.exec('create schema private;create table org_units(id text primary key,parent_id text,active boolean);');
 for(const u of saved.units)await db.query('insert into org_units values($1,$2,$3)',[u.id,u.parent_id,u.active]);
 await db.exec(functions.find((f:any)=>f.proname==='org_unit_subtree').ddl);
 const subtree=async(id:string)=>(await db.query<{id:string}>('select id from private.org_unit_subtree($1) order by id',[id])).rows.map(x=>x.id);
 expect(await subtree('org-company')).toEqual(['org-company']);
 const blocks=saved.units.filter((u:any)=>u.kind==='block');const before=await Promise.all(blocks.map((u:any)=>subtree(u.id)));
 await db.exec('begin');for(const u of blocks)await db.query("update org_units set parent_id='org-company' where id=$1",[u.id]);
 expect(await subtree('org-company')).toHaveLength(16);expect(await Promise.all(blocks.map((u:any)=>subtree(u.id)))).toEqual(before);
 await db.exec('rollback');expect(await subtree('org-company')).toEqual(['org-company']);
 expect(saved.roles).toHaveLength(56);expect(saved.mappings).toHaveLength(16);
 }finally{await db.close();}
},30000);
