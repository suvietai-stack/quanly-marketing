import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
const db=new PGlite();
const site=randomUUID(),other=randomUUID(),actor=randomUUID();
const sql=p=>fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8');
async function call(name,args){const placeholders=args.map((_,i)=>'$'+(i+1)).join(',');return (await db.query(`select public.${name}(${placeholders}) as v`,args)).rows[0].v;}
before(async()=>{
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE SCHEMA private;CREATE SCHEMA net;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'select null::uuid';
 CREATE FUNCTION private.sig_can(uuid,text) RETURNS boolean LANGUAGE sql AS 'select false';
 CREATE FUNCTION net.http_post(url text,headers jsonb,body jsonb) RETURNS bigint LANGUAGE sql AS 'select 1::bigint';
 CREATE TABLE public.zalo_oa_config(id int,care_cron_token text);
 CREATE TABLE public.opportunity_signals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),created_at timestamptz DEFAULT now(),customer_name text,phone text,address text,products text[],need_groups text[],need_group text,need_detail text,marketing_note text,source text,detected_on date,created_by uuid);`);
 await db.exec(sql('drizzle/migrations/0063_website_forms_phase1.sql'));
 await db.exec('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon,authenticated');
 await db.exec(sql('supabase/migrations/20261115090000_web_chat.sql'));
 await db.exec(sql('supabase/migrations/20261115140000_web_chat_creator_at_insert.sql'));
 await db.exec(`CREATE FUNCTION signal_creator_guard_test() RETURNS trigger LANGUAGE plpgsql AS $guard$ BEGIN IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'Creator is immutable'; END IF; RETURN NEW; END $guard$; CREATE TRIGGER creator_immutable BEFORE UPDATE ON opportunity_signals FOR EACH ROW EXECUTE FUNCTION signal_creator_guard_test();`);
 for(const id of [site,other]){
  await db.query(`INSERT INTO wf_websites(id,name,domain,source) VALUES($1,'Test','shop.vn','Chat Web')`,[id]);
  await db.query(`INSERT INTO wc_sites(id,enabled,settings) VALUES($1,true,'{"closing":"Chờ sale liên hệ"}')`,[id]);
  await db.query(`INSERT INTO wf_forms(website_id,form_id,name,enabled) VALUES($1,'base-web-chat','Chat Web',true)`,[id]);
 }
});
after(()=>db.close());
async function receive(s=site,hash=randomUUID(),request=randomUUID(),body='Tôi cần 100 bộ trà'){
 const result=await call('wc_receive',[s,hash,request,body,'https://shop.vn/a']);return {id:result.id,request,hash};
}
const finish=(c,claim,draft=null)=>call('wc_finish',[c.id,c.request,claim.lease,claim.revision,'Em xin số Zalo nhé',{phone:'0912345678',need:'100 bộ trà'},'100 bộ trà',draft]);
test('duplicate inbound request and repeated completion produce one response',async()=>{
 const c=await receive();const again=await receive(site,c.hash,c.request);assert.equal(c.id,again.id);
 const cl=await call('wc_claim',[c.id]);assert.ok(cl);assert.equal(await call('wc_claim',[c.id]),null);
 assert.equal(await finish(c,cl),true);assert.equal(await finish(c,cl),false);
 const rows=await db.query('select role,count(*)::int as n from wc_messages where conversation_id=$1 group by role',[c.id]);assert.equal(rows.rows.find(r=>r.role==='user').n,1);assert.equal(rows.rows.find(r=>r.role==='assistant').n,1);
 await assert.rejects(()=>receive(site,c.hash,c.request,'Changed payload'));
});
test('same visitor tokens remain isolated per website',async()=>{
 const hash=randomUUID();const a=await receive(site,hash);const b=await receive(other,hash);assert.notEqual(a.id,b.id);
});
test('takeover fences a running AI response and only stops that customer',async()=>{
 const a=await receive(),b=await receive();const cl=await call('wc_claim',[a.id]);
 await call('wc_control',[a.id,actor,'takeover',randomUUID(),'']);
 assert.equal(await finish(a,cl),false);assert.equal(await call('wc_claim',[a.id]),null);assert.ok(await call('wc_claim',[b.id]));
 await call('wc_control',[a.id,actor,'send',randomUUID(),'Em hỗ trợ anh chị trực tiếp.']);
 await assert.rejects(()=>call('wc_control',[a.id,randomUUID(),'send',randomUUID(),'Wrong employee']));
 await call('wc_control',[a.id,actor,'resume',randomUUID(),'']);const r=await db.query('select mode from wc_conversations where id=$1',[a.id]);assert.equal(r.rows[0].mode,'ai');
});
test('lead uses existing Website Forms transaction, is unique and attributed to Đốm AI',async()=>{
 const c=await receive();const cl=await call('wc_claim',[c.id]);
 const draft={customer_name:'Khách website',phone:'0912345678',address:null,products:[],need_groups:[],need_group:null,need_detail:'100 bộ trà',marketing_note:'Đốm AI',source:'Chat Web',detected_on:'2026-11-15'};
 assert.equal(await finish(c,cl,draft),true);
 assert.equal(await finish(c,cl,draft),false);
 const r=await db.query('select c.mode,c.signal_id,s.created_by from wc_conversations c join opportunity_signals s on s.id=c.signal_id where c.id=$1',[c.id]);assert.equal(r.rows[0].mode,'captured');assert.equal(r.rows[0].created_by,'00000000-0000-0000-0000-00000000dc01');
 const messages=await db.query("select body from wc_messages where conversation_id=$1 and role='assistant'",[c.id]);assert.match(messages.rows[0].body,/Chờ sale liên hệ/);
 await receive(site,c.hash,randomUUID(),'Cảm ơn');const cl2=await call('wc_claim',[c.id]);const pending=cl2.message.request_id;await call('wc_finish',[c.id,pending,cl2.lease,cl2.revision,'Vâng ạ',{},'100 bộ trà',draft]);
 assert.equal((await db.query('select count(*)::int n from opportunity_signals')).rows[0].n,1);
});
test('disabled site and failed lead never publish a success closing',async()=>{
 const c=await receive();const cl=await call('wc_claim',[c.id]);
 await db.query('update wc_sites set enabled=false where id=$1',[site]);assert.equal(await finish(c,cl),false);await assert.rejects(()=>receive());await db.query('update wc_sites set enabled=true where id=$1',[site]);
 await assert.rejects(()=>finish(c,cl,{phone:'invalid',need_detail:'abc'}));
 assert.equal((await db.query("select count(*)::int n from wc_messages where conversation_id=$1 and role='assistant'",[c.id])).rows[0].n,0);
});
test('anonymous/authenticated roles cannot read private chat or call service RPCs',async()=>{
 for(const role of ['anon','authenticated']){
  await db.exec('SET ROLE '+role);
  await assert.rejects(()=>db.query('select * from public.wc_messages'));
  await assert.rejects(()=>call('wc_claim',[randomUUID()]));
  await db.exec('RESET ROLE');
 }
});
