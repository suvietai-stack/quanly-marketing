import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
beforeAll(async () => {
  await db.exec(`
    CREATE TABLE public.biz_deadline_config(id boolean PRIMARY KEY,data jsonb NOT NULL);
    CREATE TABLE public.biz_department_members(user_id uuid,effective_from date,effective_to date);
    INSERT INTO public.biz_department_members VALUES ('00000000-0000-0000-0000-000000000001','2000-01-01',NULL);
    CREATE FUNCTION public.biz_can(uuid,text) RETURNS boolean LANGUAGE plpgsql
      AS $body$BEGIN RAISE EXCEPTION 'idle cron must not scan employee permissions'; END $body$;
    CREATE FUNCTION public.biz_milestone_at(jsonb,text,int,int) RETURNS timestamptz
      LANGUAGE sql STABLE AS $body$SELECT now()+interval '30 days'$body$;
    CREATE TABLE public.biz_documents(user_id uuid,kind text,period_kind text,year int,period int,first_submitted_at timestamptz);
    CREATE TABLE public.notifications(recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text);
  `);
  const keys = ['plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year'];
  const data = Object.fromEntries(keys.map(k=>[k,{open:{day:1},due:{day:2},late_close:{day:3}}]));
  await db.query('INSERT INTO public.biz_deadline_config(id,data) VALUES(true,$1::jsonb)',[JSON.stringify(data)]);
  await db.exec(readFileSync('drizzle/migrations/0476_biz_deadline_notify_skip_idle_scans.sql','utf8'));
},30000);
afterAll(()=>db.close());

it('does not read staff/Role when no deadline is within a notification window',async()=>{
  const r=await db.query<{ value:{ sent:number } }>('SELECT public.biz_deadline_auto_notify() value');
  expect(r.rows[0].value).toEqual({sent:0});
  const rows=await db.query<{ n:number }>('SELECT count(*)::int n FROM notifications');
  expect(rows.rows[0].n).toBe(0);
});
it('preserves deduplication and Vietnam wall-clock semantics',()=>{
  const sql=readFileSync('drizzle/migrations/0476_biz_deadline_notify_skip_idle_scans.sql','utf8');
  expect(sql).toMatch(/vn_now timestamp;/);
  expect(sql.indexOf('IF msg IS NULL THEN CONTINUE;')).toBeLessThan(sql.indexOf('FOR u IN SELECT DISTINCT m2.user_id'));
  expect(sql).toContain('ON CONFLICT(dedup_key) DO NOTHING');
});
