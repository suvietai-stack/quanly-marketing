import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
let db: PGlite;
const users={admin:'00000000-0000-0000-0000-000000000001',a:'00000000-0000-0000-0000-000000000002',b:'00000000-0000-0000-0000-000000000003',inactive:'00000000-0000-0000-0000-000000000004'};
const uid=async(id:string,role='authenticated')=>{await db.exec(`RESET ROLE; SET request.jwt.claim.sub='${id}'; SET ROLE ${role}`);};
const scalar=async(sql:string,params:unknown[]=[]) => (await db.query<{v:any}>(sql,params)).rows[0]?.v;
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE SCHEMA private; GRANT USAGE ON SCHEMA auth TO authenticated,service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,active boolean DEFAULT true,super boolean DEFAULT false);
 CREATE TABLE permissions(user_id uuid,key text,allowed boolean DEFAULT true,PRIMARY KEY(user_id,key));
 CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT coalesce((SELECT active FROM profiles WHERE id=u),false) $$;
 CREATE FUNCTION private.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT coalesce((SELECT super FROM profiles WHERE id=u),false) $$;
 CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT coalesce((SELECT allowed FROM permissions WHERE user_id=u AND key=p),false) $$;
 CREATE TABLE base_permission_catalog(key text PRIMARY KEY,label text,module text,dependencies text[]);
 CREATE TABLE fbl_pages(page_id text PRIMARY KEY,name text,status text,status_detail text,connected_by uuid,subscribed boolean,checked_at timestamptz,updated_at timestamptz);
 CREATE TABLE fbl_page_tokens(page_id text PRIMARY KEY,token_enc text,updated_at timestamptz);`);
 await db.exec(await readFile(new URL('../../../docs/inbox-2026-11-15/implementation.sql',import.meta.url),'utf8'));
 for(const [key,id] of Object.entries(users)) await db.query('INSERT INTO profiles VALUES($1,$2,$3,$4)',[id,key,key!=='inactive',key==='admin']);
 for(const id of [users.a,users.b,users.inactive]) for(const key of ['view','send','assign','resolve','manage']) await db.query('INSERT INTO permissions VALUES($1,$2,true)',[id,`inbox.${key}`]);
 await db.exec(`INSERT INTO fbl_pages(page_id,name,status) VALUES('1','Page 1','connected'),('2','Page 2','connected'); INSERT INTO inbox_page_capabilities(page_id,enabled,ready,checked_at) VALUES('1',true,true,now()),('2',true,true,now());`);
 await db.query('INSERT INTO inbox_page_access VALUES($1,$2,$3,now()),($4,$5,$6,now())',['1',users.a,users.admin,'2',users.b,users.admin]);
},30000);
afterAll(async()=>{await db?.close();});
async function ingest(page:string,customer:string,mid:string,direction='in',request:string|null=null,kind='message',at=new Date().toISOString()) {
 await uid(users.admin,'service_role');
 const event={page_id:page,customer_id:customer,mid,direction,kind,at,text:mid,attachments:[],request_id:request,mids:[],watermark:kind==='message'?null:at};
 await db.query('SELECT inbox_ingest($1::jsonb)',[JSON.stringify(event)]);
}
it('isolates reads, denies inactive users and blocks client webhook/finish writes',async()=>{
 await ingest('1','11','in1');await ingest('2','22','in2');await uid(users.a);
 const rows=await db.query('SELECT page_id FROM inbox_conversations');expect(rows.rows).toEqual([{page_id:'1'}]);
 await expect(db.query('SELECT inbox_ingest($1)',['{}'])).rejects.toThrow();
 await expect(db.exec("INSERT INTO inbox_conversations(page_id,customer_id,last_at) VALUES('2','hack',now())")).rejects.toThrow();
 await uid(users.inactive);expect((await db.query('SELECT * FROM inbox_messages')).rows).toHaveLength(0);
});
it('deduplicates events and cannot forge an outbound request via inbound metadata',async()=>{
 await ingest('1','11','in1');await uid(users.admin,'service_role');expect(await scalar("SELECT count(*)::int v FROM inbox_messages WHERE mid='in1'")).toBe(1);
 await uid(users.a);const c=await scalar("SELECT id v FROM inbox_conversations WHERE page_id='1'");const req='10000000-0000-4000-8000-000000000001';
 expect(await scalar('SELECT inbox_send_claim($1,$2,$3) v',[c,req,'Reply'])).toMatchObject({claimed:true});
 expect(await scalar('SELECT inbox_send_claim($1,$2,$3) v',[c,req,'Reply'])).toMatchObject({claimed:false});
 await ingest('1','11','spoof','in',req);await uid(users.admin,'service_role');
 expect(await scalar('SELECT state v FROM inbox_messages WHERE request_id=$1',[req])).toBe('sending');
 await ingest('1','11','out1','out',req);await uid(users.admin,'service_role');
 await db.query('SELECT inbox_send_finish($1,$2,$3,NULL)',[req,'out1','accepted']);
 expect(await scalar("SELECT count(*)::int v FROM inbox_messages WHERE mid='out1'")).toBe(1);
});
it('enforces Page scope, stale versions, canonical DENY and the reply window',async()=>{
 await uid(users.b);const conv=await scalar("SELECT id v FROM inbox_conversations WHERE page_id='2'");
 await expect(db.query('SELECT inbox_access_save($1,$2,true)',['1',users.b])).rejects.toThrow();
 await expect(db.query("SELECT inbox_change($1,'resolve',NULL,999)",[conv])).rejects.toThrow();
 await uid(users.admin,'service_role');await db.query("UPDATE inbox_conversations SET last_incoming_at=now()-interval '25 hours' WHERE id=$1",[conv]);
 await uid(users.b);await expect(db.query('SELECT inbox_send_claim($1,$2,$3)',[conv,'10000000-0000-4000-8000-000000000002','Expired'])).rejects.toThrow();
 await db.exec('RESET ROLE');await db.query("UPDATE permissions SET allowed=false WHERE user_id=$1 AND key='inbox.view'",[users.b]);
 await uid(users.b);expect((await db.query('SELECT * FROM inbox_conversations')).rows).toHaveLength(0);
});
it('preserves Form-independent feature toggles and does not expose credentials',async()=>{
 await uid(users.admin,'service_role');await db.query('SELECT inbox_connection_save($1,$2,$3,$4,$5,$6,$7,$8,$9)',['3','Messenger only','encrypted',false,true,['MESSAGING'],true,null,users.admin]);
 expect(await scalar("SELECT lead_enabled v FROM inbox_page_capabilities WHERE page_id='3'")).toBe(false);
 await uid(users.a);await expect(db.query("SELECT * FROM fbl_page_tokens")).rejects.toThrow();
 await expect(db.query('SELECT inbox_connection_save($1,$2,$3,$4,$5,$6,$7,$8,$9)',['4','Bad',null,true,true,[],true,null,users.a])).rejects.toThrow();
});
