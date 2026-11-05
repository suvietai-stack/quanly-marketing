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
    CREATE FUNCTION private.k3_entity_state(text,uuid) RETURNS jsonb LANGUAGE sql AS $$SELECT '{