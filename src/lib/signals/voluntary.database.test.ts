import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll,afterAll,it,expect } from 'vitest';
const db=new PGlite();const A='00000000-0000-0000-0000-000000000001',B='00000000-0000-0000-0000-000000000002';const id=(n:number)=>`00000000-0000-0000-0001-${String(n).padStart(12,'0')}`;
beforeAll(async()=>{
 await db.exec(`CREATE ROLE authenticated;CREATE ROLE anon;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE SCHEMA private;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE FUNCTION private.sig_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT $2='signal.sale'$$;CREATE FUNCTION private.sig_scope_ok(uuid,text[]) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
 CREATE TABLE opportunity_signals(id uuid primary key,assigned_to uuid,status text,cancelled_at timestamptz,assigned_at timestamptz,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),detected_on date DEFAULT '2026-11-09',customer_name text DEFAULT 'Khách',phone text DEFAULT '0901234567',products text[] DEFAULT '{}',need_groups text[] DEFAULT '{}',need_group text,source text DEFAULT 'Website',created_by uuid DEFAULT '${A}',lost_reason text,potential text DEFAULT 'unrated',next_contact_on date,revenue numeric,closed_at timestamptz);
 CREATE TABLE opportunity_signal_notes(id uuid DEFAULT gen_random_uuid() primary key,signal_id uuid,author_id uuid,note text,status_from text,status_to text,created_at timestamptz DEFAULT now(),request_id uuid UNIQUE,request_payload text,is_progression boolean,event_type text);
 CREATE TABLE opportunity_signal_events(id uuid DEFAULT gen_random_uuid(),signal_id uuid,kind text,detail jsonb,created_at timestamptz);
 CREATE TABLE signal_label_links(signal_id uuid,label_id uuid);
 CREATE TABLE signal_progression_periods(id uuid);CREATE TABLE signal_progression_assignments(id uuid);CREATE TABLE signal_progression_config(id int);
 CREATE FUNCTION signal_note_is_progression(text,text,boolean) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$SELECT coalesce($3,coalesce(trim($2),'')<>'Đã tiếp nhận' AND (coalesce(trim($1),'')<>'' OR coalesce(trim($2),'') NOT IN ('','Đã tiếp nhận','Khác')))$$;
 GRANT USAGE ON SCHEMA auth,private TO authenticated;GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
 ALTER TABLE opportunity_signals ENABLE ROW LEVEL SECURITY;CREATE POLICY scoped ON opportunity_signals TO authenticated USING(assigned_to=auth.uid());
 ALTER TABLE opportunity_signal_notes ENABLE ROW LEVEL SECURITY;CREATE POLICY scoped ON opportunity_signal_notes TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));
 ALTER TABLE opportunity_signal_events ENABLE ROW LEVEL SECURITY;CREATE POLICY scoped ON opportunity_signal_events TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));`);
 for(const file of ['0273_signal_voluntary_notes_retire_periods','0274_signal_paged_filtered_reads','0275_signal_note_activity_report','0276_signal_sales_aggregate_report'])await db.exec(readFileSync(`drizzle/migrations/${file}.sql`,'utf8'));
 await db.exec(`SELECT set_config('test.uid','${A}',false);INSERT INTO opportunity_signals(id,assigned_to,status,assigned_at) VALUES('${id(1)}','${A}','consulting','2026-11-01'),('${id(2)}','${B}','waiting','2026-11-01');`);
},60000);
afterAll(()=>db.close());
it('note save is idempotent and cannot alter state, assignments or existing timestamps',async()=>{
 const req=id(900);const before=(await db.query('select * from opportunity_signals where id=$1',[id(1)])).rows;
 const first=(await db.query<{id:string}>('select signal_note_save($1,$2,$3) id',[id(1),req,'Đã gửi báo giá'])).rows[0]?.id;
 expect((await db.query<{id:string}>('select signal_note_save($1,$2,$3) id',[id(1),req,'Đã gửi báo giá'])).rows[0]?.id).toBe(first);
 expect((await db.query('select * from opportunity_signal_notes where signal_id=$1',[id(1)])).rows).toHaveLength(1);
 expect((await db.query('select * from opportunity_signals where id=$1',[id(1)])).rows).toEqual(before);
 await expect(db.query('select signal_note_save($1,$2,$3)',[id(1),req,'Nội dung khác'])).rejects.toThrow('Mã thao tác');
});
it('cannot write notes for another Sale',async()=>{await expect(db.query('select signal_note_save($1,$2,$3)',[id(2),id(901),'note'])).rejects.toThrow('Không có quyền');});
it('RLS excludes other owners before pagination and aggregation',async()=>{
 await db.exec('SET ROLE authenticated');const result=await db.query<{r:any}>(`select signal_list_page('{}','work',0,40) r`);expect(result.rows[0]?.r.rows.map((s:any)=>s.id)).toEqual([id(1)]);
 expect((await db.query<{r:any}>(`select signal_note_report('{}') r`)).rows[0]?.r.total).toBe(1);await db.exec('RESET ROLE');
});
it('zero notes and exact levels beyond 10 sum to unique signals',async()=>{
 await db.exec(`INSERT INTO opportunity_signals(id,assigned_to,status) VALUES('${id(3)}','${A}','consulting'),('${id(4)}','${A}','consulting');INSERT INTO opportunity_signal_notes(signal_id,author_id,note,is_progression) SELECT '${id(4)}','${A}','note '||n,true FROM generate_series(1,12) n;`);
 const r=(await db.query<{r:any}>(`select signal_note_report('{}') r`)).rows[0]?.r;expect(r.distribution.find((d:any)=>d.n===12).signals).toBe(1);expect(r.distribution.reduce((s:number,d:any)=>s+d.signals,0)).toBe(r.total);expect(r.zero).toBe(2);
});
it('handover first note belongs to actual author after acceptance, before next assignment',async()=>{
 await db.exec(`INSERT INTO opportunity_signal_events(signal_id,kind,detail,created_at) VALUES('${id(3)}','assign','{"to":"${A}"}','2026-11-01 01:00Z'),('${id(3)}','assign','{"to":"${B}"}','2026-11-03 01:00Z'),('${id(3)}','assign','{"to":"${A}"}','2026-11-05 01:00Z');
 INSERT INTO opportunity_signal_notes(signal_id,author_id,note,status_from,status_to,created_at,is_progression,event_type) VALUES('${id(3)}','${A}',NULL,'waiting','contacting','2026-11-01 02:00Z',false,'Đã tiếp nhận'),('${id(3)}','${B}',NULL,'waiting','contacting','2026-11-03 02:00Z',false,'Đã tiếp nhận'),('${id(3)}','${A}',NULL,'waiting','contacting','2026-11-05 02:00Z',false,'Đã tiếp nhận'),('${id(3)}','${A}','before','consulting','consulting','2026-11-01 01:30Z',true,NULL),('${id(3)}','${B}','wrong author','consulting','consulting','2026-11-01 02:10Z',true,NULL),('${id(3)}','${A}','first A','consulting','consulting','2026-11-01 03:00Z',true,NULL),('${id(3)}','${B}','first B','consulting','consulting','2026-11-03 03:00Z',true,NULL);`);
 const r=(await db.query<{r:any}>(`select signal_note_report('{"from":"2026-11-01","to":"2026-11-07"}') r`)).rows[0]?.r;expect(r.firsts.map((f:any)=>[f.sale,f.first_note?.slice(0,10)??null])).toEqual([[A,'2026-11-01'],[B,'2026-11-03'],[A,null]]);
});
it('four rank ordering before page boundaries scales at 600, 3000 and 5000 isolated rows',async()=>{
 for(const n of [600,3000,5000]){await db.exec(`INSERT INTO opportunity_signals(id,assigned_to,status) SELECT ('00000000-0000-0000-0002-'||lpad(i::text,12,'0'))::uuid,'${A}','consulting' FROM generate_series(1,${n}) i ON CONFLICT DO NOTHING;`);const result=(await db.query<{r:any}>(`select signal_list_page('{}','work',0,30) r`)).rows[0]?.r;expect(result.rows).toHaveLength(30);expect(result.rows[0].id).toBe(id(2));}
});
