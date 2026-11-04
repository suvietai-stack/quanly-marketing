import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
const staff = '00000000-0000-0000-0000-000000000001';
const other = '00000000-0000-0000-0000-000000000002';
const goal = '00000000-0000-0000-0000-000000000003';
const action = '00000000-0000-0000-0000-000000000004';
const kpi = '00000000-0000-0000-0000-000000000005';
let seq = 0;
async function result<T>(sql: string) { return (await db.query<{ v: T }>(sql)).rows[0]?.v; }
async function save(date: string, value: number, revision = 0, requestKey?: string) {
  const key = requestKey ?? `10000000-0000-0000-0000-${String(++seq).padStart(12, '0')}`;
  return result<{ metric: { actual: number; progress: number }; daily: { revision: number } }>(`SELECT k3_kpi_result_save('${JSON.stringify({ kpi_id: kpi, work_date: date, value, revision, request_key: key })}') v`);
}
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth; CREATE SCHEMA private; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
  CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text);
  INSERT INTO profiles VALUES('${staff}','A'),('${other}','B');
  CREATE TABLE k3_goals(id uuid PRIMARY KEY,user_id uuid,period_start date,period_end date,status text,deleted_at timestamptz);
  CREATE TABLE k3_actions(id uuid PRIMARY KEY,goal_id uuid,assignee_id uuid,start_date date,status text,deleted_at timestamptz);
  CREATE TABLE k3_kpis(id uuid PRIMARY KEY,goal_id uuid,action_id uuid,kind text,target numeric,name text);
  CREATE TABLE k3_plan_events(user_id uuid,goal_id uuid,action_id uuid,actor_id uuid,action text,detail jsonb);
  CREATE FUNCTION biz_admin(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
  CREATE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT $1 IN ('${staff}'::uuid,'${other}'::uuid) $$;
  CREATE FUNCTION k3_goal_visible(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT $1 IN ('${staff}'::uuid,'${other}'::uuid) AND $2='${goal}'::uuid $$;
  CREATE FUNCTION private.k3_action_worker_ok(uuid,uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT $1='${staff}'::uuid AND $2='${action}'::uuid $$;
  CREATE FUNCTION private.k3_write_guard(date) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF $1<'2026-01-01' THEN RAISE EXCEPTION 'Ngày khóa'; END IF; END $$;
  INSERT INTO k3_goals VALUES('${goal}','${staff}','2026-01-01','2026-12-31','in_progress',NULL);
  INSERT INTO k3_actions VALUES('${action}','${goal}','${staff}','2026-01-01','in_progress',NULL);
  INSERT INTO k3_kpis VALUES('${kpi}',NULL,'${action}','cumulative',200,'200 đại lý');
  SET test.uid='${staff}';`);
  await db.exec(readFileSync('drizzle/migrations/0202_k3_daily_kpi_result_foundation.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());

it('database: 20 + 30 = 50, tiến độ 25%', async () => {
  await save('2026-11-01', 20);
  const r = await save('2026-11-02', 30);
  expect(r?.metric).toMatchObject({ actual: 50, progress: 25 });
});
it('database: sửa 30 thành 25 thay thế tổng ngày; thêm 15 thành 60', async () => {
  expect((await save('2026-11-02', 25, 1))?.metric.actual).toBe(45);
  expect((await save('2026-11-03', 15))?.metric.actual).toBe(60);
  expect(await result<number>('SELECT count(*)::int v FROM k3_kpi_results')).toBe(3);
  expect(await result<number>('SELECT count(*)::int v FROM k3_kpi_result_versions')).toBe(4);
});
it('database: request lặp không tạo thêm phiên bản/kết quả', async () => {
  const key = '10000000-0000-0000-0000-999999999999';
  await save('2026-11-03', 15, 1, key);
  await save('2026-11-03', 15, 1, key);
  expect(await result<number>(`SELECT count(*)::int v FROM k3_kpi_result_versions WHERE request_key='${key}'`)).toBe(1);
  expect(await result<number>('SELECT count(*)::int v FROM k3_kpi_results')).toBe(3);
});
it('database: revision cũ từ thiết bị khác bị từ chối', async () => {
  await expect(save('2026-11-03', 100, 1)).rejects.toThrow('nơi khác');
  expect(await result<number>(`SELECT (private.k3_result_metric('${kpi}',false)->>'actual')::numeric v`)).toBe(60);
});
it('database: không nhận kết quả âm hoặc ngày tương lai', async () => {
  await expect(save('2026-11-03', -1, 2)).rejects.toThrow('không âm');
  await expect(save('2099-11-03', 10)).rejects.toThrow('tương lai');
});
it('database: người chỉ xem không được cập nhật KPI người khác', async () => {
  await db.exec(`SET test.uid='${other}'`);
  await expect(save('2026-11-03', 1)).rejects.toThrow('không được cập nhật');
  await db.exec(`SET test.uid='${staff}'`);
});
it('database: chưa chốt không vào số chính thức; chốt lưu snapshot', async () => {
  expect(await result(`SELECT private.k3_result_metric('${kpi}',true)->>'actual' v`)).toBeNull();
  await db.query(`SELECT k3_kpi_day_confirm('2026-11-01')`);
  expect(await result<number>(`SELECT (private.k3_result_metric('${kpi}',true)->>'actual')::numeric v`)).toBe(20);
});
it('database: dữ liệu chờ rà soát chặn cập nhật và không có thời hạn xóa', async () => {
  await db.exec(`INSERT INTO k3_data_reviews(kind,record_id,reason,original_snapshot) VALUES('kpi','${kpi}','Thiếu nguồn','{}');`);
  await expect(save('2026-11-03', 1, 2)).rejects.toThrow('không được cập nhật');
  expect(await result(`SELECT private.k3_result_metric('${kpi}',false)->>'actual' v`)).toBeNull();
  expect(await result<number>(`SELECT count(*)::int v FROM information_schema.columns WHERE table_name='k3_data_reviews' AND column_name='deleted_at'`)).toBe(0);
  await db.exec(`UPDATE k3_data_reviews SET status='resolved'`);
});