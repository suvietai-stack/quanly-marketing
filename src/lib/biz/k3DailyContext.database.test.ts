import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const own = '10000000-0000-0000-0000-000000000001';
const other = '10000000-0000-0000-0000-000000000002';
const goal = '20000000-0000-0000-0000-000000000001';
const action = '30000000-0000-0000-0000-000000000001';
const date = '2026-11-05';
async function actions() {
  return (await db.query<{ items: { id: string; delete_kind: string; goal_id: string }[] }>(`SELECT k3_kpi_day_read('${date}')->'actions' items`)).rows[0]?.items ?? [];
}
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT '${own}'::uuid$$;
    CREATE TABLE k3_goals(id uuid PRIMARY KEY,name text,creation_mode text,due_date date,period_start date,period_end date,due_time time,deleted_at timestamptz,status text);
    CREATE TABLE k3_actions(id uuid PRIMARY KEY,goal_id uuid,name text,due_date date,due_time time,inherit_timeline boolean,assignee_id uuid,start_date date,deleted_at timestamptz,status text,is_key boolean,created_at timestamptz);
    CREATE TABLE k3_kpis(id uuid PRIMARY KEY,action_id uuid,name text);
    CREATE TABLE k3_kpi_results(id uuid PRIMARY KEY,action_id uuid,user_id uuid,work_date date,deleted_at timestamptz,review_reason text);
    CREATE TABLE k3_data_reviews(record_id uuid,status text);
    CREATE FUNCTION private.k3_action_on_date(uuid,date) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
    CREATE FUNCTION private.k3_action_worker_ok(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM k3_actions WHERE id=$2 AND assignee_id=$1)$$;
    CREATE FUNCTION private.k3_result_metric(uuid,boolean) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;
    CREATE FUNCTION private.k3_entity_state(text,uuid) RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;
    CREATE FUNCTION public.k3_kpi_day_read(_date date) RETURNS jsonb LANGUAGE plpgsql AS $fn$
    DECLARE uid uuid:=auth.uid(); rows jsonb;
    BEGIN
      SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]') INTO rows FROM k3_kpi_results r WHERE r.user_id=uid AND r.work_date=_date AND r.deleted_at IS NULL AND r.review_reason IS NULL;
      RETURN jsonb_build_object('actions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'goal_id',g.id,'name',a.name)) FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE private.k3_action_on_date(a.id,_date) AND private.k3_action_worker_ok(uid,a.id) AND g.deleted_at IS NULL AND a.deleted_at IS NULL AND g.status NOT IN ('draft','paused','cancelled','ended_missed') AND a.status NOT IN ('draft','paused','cancelled','ended_missed') AND _date BETWEEN coalesce(a.start_date,g.period_start) AND g.period_end AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN (g.id,a.id))),'[]'));
    END $fn$;
    INSERT INTO k3_goals VALUES('${goal}','Báo giá','basic','2026-11-30','2026-11-01','2026-11-30',NULL,NULL,'in_progress');
    INSERT INTO k3_actions VALUES('${action}','${goal}','Báo giá',NULL,NULL,true,'${own}','2026-11-01',NULL,'in_progress',false,now());
    INSERT INTO k3_kpi_results VALUES(gen_random_uuid(),'${action}','${own}','${date}',NULL,NULL);`);
  await db.exec(readFileSync('drizzle/migrations/0243_k3_daily_results_context_and_delete_target.sql','utf8'));
},30000);
afterAll(()=>db.close());
it('own valid result appears on its day even outside the execution schedule',async()=>{
  expect(await actions()).toEqual([{id:action,goal_id:goal,name:'Báo giá',delete_kind:'goal'}]);
});
it('simple one-step work targets parent deletion while multi-step work targets the step',async()=>{
  await db.exec(`INSERT INTO k3_actions VALUES(gen_random_uuid(),'${goal}','Kiểm tra',NULL,NULL,true,'${own}','2026-11-01',NULL,'in_progress',false,now());`);
  expect((await actions())[0]?.delete_kind).toBe('action');
});
it('result activity never bypasses current assignment access',async()=>{
  await db.exec(`UPDATE k3_actions SET assignee_id='${other}' WHERE id='${action}'`);
  expect(await actions()).toEqual([]);
  await db.exec(`UPDATE k3_actions SET assignee_id='${own}' WHERE id='${action}'`);
});
it('cancelled work stays absent even when an old result exists',async()=>{
  await db.exec(`UPDATE k3_goals SET status='cancelled' WHERE id='${goal}'`);
  expect(await actions()).toEqual([]);
  expect((await db.query<{count:number}>('SELECT count(*)::int count FROM k3_kpi_results')).rows[0]?.count).toBe(1);
});