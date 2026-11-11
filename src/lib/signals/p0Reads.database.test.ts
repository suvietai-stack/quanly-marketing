import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll,afterAll,it,expect } from 'vitest';
const db=new PGlite();const A='00000000-0000-0000-0000-000000000001',B='00000000-0000-0000-0000-000000000002';const id=(n:number)=>`00000000-0000-0000-0001-${String(n).padStart(12,'0')}`;
beforeAll(async()=>{
 await db.exec(`CREATE ROLE authenticated;CREATE ROLE anon;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE SCHEMA private;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE FUNCTION private.sig_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $2='signal.sale'$$;CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;CREATE FUNCTION private.sig_scope_ok(uuid,text[]) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
 CREATE TABLE opportunity_signals(id uuid primary key,assigned_to uuid,status text,cancelled_at timestamptz,assigned_at timestamptz,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),detected_on date DEFAULT '2026-11-09',customer_name text DEFAULT 'Khách',phone text DEFAULT '0901234567',products text[] DEFAULT '{}',need_groups text[] DEFAULT '{}',need_group text,source text DEFAULT 'Website',created_by uuid DEFAULT '${A}',lost_reason text,potential text DEFAULT 'unrated',next_contact_on date,revenue numeric,closed_at timestamptz);
 CREATE TABLE opportunity_signal_notes(id uuid DEFAULT gen_random_uuid() primary key,signal_id uuid,author_id uuid,note text,status_from text,status_to text,created_at timestamptz DEFAULT now(),request_id uuid UNIQUE,request_payload text,is_progression boolean,event_type text);
 CREATE TABLE opportunity_signal_events(id uuid DEFAULT gen_random_uuid(),signal_id uuid,kind text,detail jsonb,created_at timestamptz);
 CREATE TABLE signal_label_links(signal_id uuid,label_id uuid);
 CREATE TABLE signal_progression_periods(id uuid);CREATE TABLE signal_progression_assignments(id uuid);CREATE TABLE signal_progression_config(id int);
 CREATE FUNCTION signal_note_is_progression(text,text,boolean) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$SELECT coalesce($3,coalesce(trim($2),'')<>'Đã tiếp nhận' AND (coalesce(trim($1),'')<>'' OR coalesce(trim($2),'') NOT IN ('','Đã tiếp nhận','Khác')))$$;
 GRANT USAGE ON SCHEMA auth,private TO authenticated;GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
 ALTER TABLE opportunity_signals ENABLE ROW LEVEL SECURITY;CREATE POLICY sig_select ON opportunity_signals TO authenticated USING(assigned_to=auth.uid());
 ALTER TABLE opportunity_signal_notes ENABLE ROW LEVEL SECURITY;CREATE POLICY scoped ON opportunity_signal_notes TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));
 ALTER TABLE opportunity_signal_events ENABLE ROW LEVEL SECURITY;CREATE POLICY scoped ON opportunity_signal_events TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));`);
 for(const file of ['0273_signal_voluntary_notes_retire_periods','0274_signal_paged_filtered_reads','0275_signal_note_activity_report','0276_signal_sales_aggregate_report','0278_signal_priority_grouped_history','0279_signal_note_cycle_end_boundaries'])await db.exec(readFileSync(`drizzle/migrations/${file}.sql`,'utf8'));
 await db.exec(`SELECT set_config('test.uid','${A}',false);INSERT INTO opportunity_signals(id,assigned_to,status,assigned_at) VALUES('${id(1)}','${A}','consulting','2026-11-01'),('${id(2)}','${B}','waiting','2026-11-01');`);
 await db.exec(`CREATE POLICY account_active_guard ON opportunity_signals AS RESTRICTIVE TO authenticated USING(private.is_active(auth.uid()));CREATE POLICY account_active_guard ON opportunity_signal_notes AS RESTRICTIVE TO authenticated USING(private.is_active(auth.uid()));CREATE POLICY account_active_guard ON opportunity_signal_events AS RESTRICTIVE TO authenticated USING(private.is_active(auth.uid()));`);
 await db.exec(readFileSync('drizzle/migrations/0283_signal_load_read_hotfix.sql','utf8'));
 await db.exec(`ALTER FUNCTION signal_list_counts(jsonb) RENAME TO previous_counts; ALTER FUNCTION signal_list_page(jsonb,text,integer,integer) RENAME TO previous_page;`);
 await db.exec(readFileSync('docs/pending/signals_p0_counts_single_scan.sql','utf8'));
 await db.exec(readFileSync('docs/pending/signals_p0_page_filtered_history.sql','utf8'));
},60000);
afterAll(()=>db.close());

it('base filters match the original priority filters under each caller',async()=>{
 for(const uid of [A,B]){
 await db.exec(`SELECT set_config('test.uid','${uid}',false);SET ROLE authenticated;`);
 for(const f of [{},{quick:'waiting'},{quick:'consulting'},{q:'Khách'},{q:'missing'},{needGroup:'Quà'},{saleId:A},{creatorId:A},{stage:'advice'},{potential:'high'},{work:'action'},{from:'2026-11-09',to:'2026-11-09'},{cancelled:true}]){
 const a=await db.query('select id from signal_filtered($1) order by id',[f]);const b=await db.query('select id from signal_base_filtered($1) order by id',[f]);expect(b.rows).toEqual(a.rows);
 }
 const counts=(await db.query<{r:any}>(`select signal_list_counts('{}') r`)).rows[0]?.r;
 expect(counts.total).toBe(1);expect(counts.status.all).toBe(1);
 const page=(await db.query<{r:any}>(`select signal_list_page('{}','work',0,40) r`)).rows[0]?.r;
 expect(page.rows).toHaveLength(1);expect(page.rows[0].assigned_to).toBe(uid);
 await db.exec('RESET ROLE');
 }
});

it('pending counts and page match existing results under own RLS for every supported sort/filter',async()=>{
 for(const uid of [A,B]){
 await db.exec(`SELECT set_config('test.uid','${uid}',false);SET ROLE authenticated;`);
 for(const f of [{},{quick:'waiting'},{quick:'consulting'},{q:'missing'},{needGroup:'Quà'},{saleId:A},{creatorId:A},{stage:'advice'},{potential:'high'},{work:'action'},{cancelled:true}]){
 const before=(await db.query<{v:unknown}>('select previous_counts($1) v',[f])).rows[0]?.v;
 expect((await db.query<{v:unknown}>('select signal_list_counts($1) v',[f])).rows[0]?.v).toEqual(before);
 for(const sort of ['work','priority','activity','newest','oldest','soonest','potential','value']){
 const old=(await db.query<{v:unknown}>('select previous_page($1,$2,0,40) v',[f,sort])).rows[0]?.v;
 expect((await db.query<{v:unknown}>('select signal_list_page($1,$2,0,40) v',[f,sort])).rows[0]?.v).toEqual(old);
 }
 }await db.exec('RESET ROLE');
 }
},60000);
