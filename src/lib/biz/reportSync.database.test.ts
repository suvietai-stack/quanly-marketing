import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const user='00000000-0000-0000-0000-000000000001';const dept='10000000-0000-0000-0000-000000000001';
async function scalar(sql:string){return (await db.query<{v:any}>(sql)).rows[0]?.v;}
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA private;CREATE SCHEMA auth;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT '${user}'::uuid$$;
 CREATE TABLE profiles(id uuid,full_name text);CREATE TABLE biz_department_members(id uuid,department_id uuid,user_id uuid,started_at timestamptz,ended_at timestamptz);
 CREATE TABLE biz_documents(id uuid,user_id uuid,kind text,period_kind text,year integer,period integer,deadline_frozen boolean,deadline timestamptz,first_submitted_at timestamptz,official_version_id uuid);
 CREATE TABLE biz_document_versions(id uuid,document_id uuid,status text,version integer);
 CREATE FUNCTION biz_period_start_date(text,integer,integer) RETURNS date LANGUAGE sql AS $$ SELECT CASE $1 WHEN 'day' THEN make_date($2,1,1)+($3-1) WHEN 'week' THEN make_date($2,1,4)-(extract(isodow FROM make_date($2,1,4))::integer-1)+($3-1)*7 WHEN 'month' THEN make_date($2,$3,1) WHEN 'quarter' THEN make_date($2,($3-1)*3+1,1) ELSE make_date($2,1,1) END $$;
 CREATE FUNCTION biz_period_end_date(text,integer,integer) RETURNS date LANGUAGE sql AS $$ SELECT CASE $1 WHEN 'day' THEN biz_period_start_date($1,$2,$3) WHEN 'week' THEN biz_period_start_date($1,$2,$3)+6 WHEN 'month' THEN (biz_period_start_date($1,$2,$3)+interval '1 month - 1 day')::date WHEN 'quarter' THEN (biz_period_start_date($1,$2,$3)+interval '3 months - 1 day')::date ELSE make_date($2,12,31) END $$;
 CREATE FUNCTION biz_report_cycle_of(uuid,date) RETURNS text LANGUAGE sql AS $$SELECT CASE WHEN $2>=DATE '2026-11-02' THEN 'week' ELSE 'month' END$$;
 CREATE FUNCTION biz_report_cycle_config_of(uuid,date) RETURNS jsonb LANGUAGE sql AS $$SELECT jsonb_build_object('cycle',biz_report_cycle_of($1,$2))$$;
 CREATE FUNCTION biz_any_deadline_at(text,integer,integer) RETURNS timestamptz LANGUAGE sql AS $$SELECT (biz_period_end_date(replace($1,'report_',''),$2,$3)+2)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'$$;
 CREATE FUNCTION biz_any_phase(text,text,integer,integer,timestamptz) RETURNS text LANGUAGE sql AS $$SELECT 'open'::text$$;
 CREATE FUNCTION biz_deadline_status(timestamptz,timestamptz,timestamptz) RETURNS text LANGUAGE sql AS $$SELECT CASE WHEN $2 IS NOT NULL THEN 'ontime' ELSE 'upcoming' END$$;
 CREATE FUNCTION biz_any_milestones(text,text,integer,integer) RETURNS jsonb LANGUAGE sql AS $$SELECT current_setting('test.milestones')::jsonb$$;
 INSERT INTO profiles VALUES('${user}','Employee');INSERT INTO biz_department_members VALUES(gen_random_uuid(),'${dept}','${user}','2026-01-01',NULL);`);
 const sync=readFileSync('drizzle/migrations/0163_biz_report_official_deadline_sync.sql','utf8');await db.exec(sync.slice(0,sync.indexOf('CREATE OR REPLACE FUNCTION public.biz_report_target_version')));
 const coverage=readFileSync('drizzle/migrations/0164_biz_report_cycle_obligations_and_coverage.sql','utf8');await db.exec(coverage.slice(0,coverage.indexOf('DO $patch$')));
},20000);
afterAll(()=>db.close());
it('November management view counts five weekly duties, no month quarter year duplicate',async()=>{const rows=await scalar("select private.biz_report_obligations(2026,'month',11) v");expect(rows).toHaveLength(5);expect(rows.every((r:any)=>r.period_kind==='week')).toBe(true);expect(rows.find((r:any)=>r.period===45).period_start).toBe('2026-11-02');});
it('October history remains monthly and reads do not create drafts',async()=>{const rows=await scalar("select private.biz_report_obligations(2026,'month',10) v");expect(rows).toHaveLength(1);expect(rows[0].period_kind).toBe('month');expect(await scalar('select count(*)::integer v from biz_documents')).toBe(0);});
it('duplicate affiliation does not duplicate personal duties',async()=>{await db.exec(`INSERT INTO biz_department_members VALUES(gen_random_uuid(),'${dept}','${user}','2026-02-01',NULL);`);expect(await scalar("select jsonb_array_length(private.biz_report_obligations(2026,'month',11)) v")).toBe(5);});
it('joining midweek creates the week duty in the latest department',async()=>{const other='00000000-0000-0000-0000-000000000002';await db.exec(`INSERT INTO profiles VALUES('${other}','Midweek');INSERT INTO biz_department_members VALUES(gen_random_uuid(),'${dept}','${other}','2026-11-05',NULL);`);const rows=await scalar("select private.biz_report_obligations(2026,'week',45) v");expect(rows.filter((r:any)=>r.user_id===other)).toHaveLength(1);});
it('missing closing deadline blocks readiness',async()=>{await db.exec(`SELECT set_config('test.milestones','{"open":"2026-11-09T08:00:00+07:00","due":"2026-11-10T17:00:00+07:00"}',false)`);expect(await scalar("select biz_report_deadline_ready('report','week',2026,45) v")).toBe(false);});
it('three ordered VN milestones make readiness true',async()=>{await db.exec(`SELECT set_config('test.milestones','{"open":"2026-11-09T08:00:00+07:00","due":"2026-11-10T17:00:00+07:00","late_close":"2026-11-12T17:00:00+07:00"}',false)`);expect(await scalar("select biz_report_deadline_ready('report','week',2026,45) v")).toBe(true);});