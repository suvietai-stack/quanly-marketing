import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const sale = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
async function actor(id: string) { await db.query("select set_config('test.uid',$1,false)", [id]); }
async function scalar(sql: string, args: unknown[] = []) { return (await db.query<{ v: unknown }>(sql, args)).rows[0]?.v; }
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private; CREATE SCHEMA auth; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text); INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${sale}','Sale','Đang hoạt động'),('${other}','Other','Đang hoạt động');
    CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM profiles WHERE id=u AND status='Đang hoạt động') $$;
    CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT u='${admin}'::uuid $$;
    CREATE TABLE opportunity_signals(id uuid PRIMARY KEY,status text,assigned_to uuid,closed_at timestamptz,revenue numeric,cancelled_at timestamptz,customer_name text,created_at timestamptz DEFAULT now());
    CREATE TABLE opportunity_signal_notes(signal_id uuid,status_to text);
    CREATE TABLE tasks(id text PRIMARY KEY,data jsonb,is_demo boolean DEFAULT false,created_at timestamptz DEFAULT now());
    CREATE TABLE employee_kpi_periods(id uuid PRIMARY KEY,user_id uuid,status text,period_start date,period_end date);
    CREATE TABLE employee_kpi_items(id uuid PRIMARY KEY,kpi_period_id uuid,metric_key text,target_value numeric,metadata jsonb,brand_id text,website_id text,social_id text,label text,created_at timestamptz DEFAULT now());
    CREATE TABLE employee_kpi_snapshots(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),kpi_period_id uuid,locked_by uuid);`);
  await db.exec(readFileSync('drizzle/migrations/0075_sao_rewards_mvp.sql', 'utf8'));
  await db.exec(readFileSync('drizzle/migrations/0077_sao_achievement_fences.sql', 'utf8'));
  const fences = readFileSync('drizzle/migrations/0078_sao_and_progression_read_permissions.sql', 'utf8');
  await db.exec(fences.slice(fences.indexOf('CREATE OR REPLACE FUNCTION private.sao_task_event')));
  const configStart = fences.indexOf('CREATE FUNCTION public.signal_progression_config_can_read');
  const configEnd = fences.indexOf('ALTER POLICY progression_config_read');
  await db.exec(fences.slice(configStart, configEnd));
  await db.exec('GRANT USAGE ON SCHEMA private,auth TO authenticated;');
  await db.exec(readFileSync('drizzle/migrations/0079_sao_flexible_programs.sql', 'utf8'));
  await actor(admin);
}, 20000);
afterAll(() => db.close());
it('manual 100 credit retry records one transaction and correct owner balance', async () => {
  const args = [sale, 100, 'Thành tích thật', '10000000-0000-0000-0000-000000000001'];
  await db.query('select sao_manual_grant($1,$2,$3,$4)', args); await db.query('select sao_manual_grant($1,$2,$3,$4)', args);
  expect(await scalar('select balance::int v from sao_wallets where user_id=$1', [sale])).toBe(100);
  expect(await scalar("select count(*)::int v from sao_ledger where source='manual'")).toBe(1);
});
it('employee cannot manually grant stars', async () => { await actor(sale); await expect(db.query('select sao_manual_grant($1,30,$2,$3)', [sale, 'Not allowed', crypto.randomUUID()])).rejects.toThrow('Không có quyền'); await actor(admin); });
it('reserve, cancel, fulfill and retry never deduct twice', async () => {
  const gift = '20000000-0000-0000-0000-000000000001';
  await db.query("select sao_gift_save($1,'Quà', 'https://example.test/gift.jpg',30,1,true)", [gift]);
  await actor(sale); const r = '30000000-0000-0000-0000-000000000001';
  await db.query('select sao_redeem($1,$2)', [gift, r]); await db.query('select sao_redeem($1,$2)', [gift, r]);
  expect(await scalar('select held::int v from sao_wallets where user_id=$1', [sale])).toBe(30);
  expect(await scalar('select balance::int v from sao_wallets where user_id=$1', [sale])).toBe(100);
  await db.query("select sao_redemption_decide($1,'cancelled')", [r]);
  expect(await scalar('select held::int v from sao_wallets where user_id=$1', [sale])).toBe(0);
  const r2 = '30000000-0000-0000-0000-000000000002'; await db.query('select sao_redeem($1,$2)', [gift, r2]);
  await expect(db.query('select sao_redeem($1,$2)', [gift, crypto.randomUUID()])).rejects.toThrow('Quà đã hết');
  await expect(db.query("select sao_redemption_decide($1,'fulfilled')", [r2])).rejects.toThrow('Không có quyền');
  await actor(admin); await db.query("select sao_redemption_decide($1,'fulfilled')", [r2]); await db.query("select sao_redemption_decide($1,'fulfilled')", [r2]);
  expect(await scalar('select balance::int v from sao_wallets where user_id=$1', [sale])).toBe(70);
  expect(await scalar('select stock v from sao_gifts where id=$1', [gift])).toBe(0);
});
it('rejects redemption above available balance', async () => { const g = crypto.randomUUID(); await db.query("select sao_gift_save($1,'Lớn','https://example.test/gift.jpg',80,1,true)", [g]); await actor(sale); await expect(db.query('select sao_redeem($1,$2)', [g, crypto.randomUUID()])).rejects.toThrow('chưa đủ Sao'); await actor(admin); });
it('celebration aggregates once across reloads and isolates users', async () => {
  await actor(sale); const c = await scalar('select sao_celebration_claim() v') as { stars: number; balance: number }; expect(c.stars).toBe(100); expect(c.balance).toBe(70);
  expect((await scalar('select sao_celebration_claim() v') as { stars: number }).stars).toBe(0);
  await actor(other); expect((await scalar('select sao_celebration_claim() v') as { stars: number }).stars).toBe(0); await actor(admin);
});
it('new won signal awards assigned Sale once, never lost or old disabled achievements', async () => {
  await db.exec("select sao_rule_save('signal',30,false)");
  const old = crypto.randomUUID(); await db.query("insert into opportunity_signals(id,status,assigned_to,customer_name) values($1,'consulting',$2,'Old')", [old, sale]);
  await db.query("update opportunity_signals set status='won',closed_at=now(),revenue=100 where id=$1", [old]);
  await db.exec("select sao_rule_save('signal',30,true)");
  await db.query("update opportunity_signals set status='consulting' where id=$1", [old]); await db.query("update opportunity_signals set status='won' where id=$1", [old]);
  expect(await scalar("select count(*)::int v from sao_ledger where source='signal'")).toBe(0);
  const id = crypto.randomUUID(); await db.query("insert into opportunity_signals(id,status,assigned_to,customer_name) values($1,'consulting',$2,'New')", [id, sale]);
  await db.query("update opportunity_signals set status='lost',closed_at=now(),revenue=100 where id=$1", [id]);
  expect(await scalar("select count(*)::int v from sao_ledger where source='signal'")).toBe(0);
  await db.query("update opportunity_signals set status='won' where id=$1", [id]); await db.query("update opportunity_signals set status='consulting' where id=$1", [id]); await db.query("update opportunity_signals set status='won' where id=$1", [id]);
  expect(await scalar("select count(*)::int v from sao_ledger where source='signal' AND user_id=$1", [sale])).toBe(1);
  expect(await scalar('select balance::int v from sao_wallets where user_id=$1', [sale])).toBe(100);
});
it('client-completed task without approval cannot earn stars', async () => {
  await db.exec("select sao_rule_save('task',10,true)");
  await db.query('insert into tasks(id,data) values($1,$2)', ['fake', JSON.stringify({ status: 'Đang làm', assignee: 'Sale', history: [] })]);
  await db.query('update tasks set data=$1 where id=$2', [JSON.stringify({ status: 'Hoàn thành', assignee: 'Sale', history: [] }), 'fake']);
  expect(await scalar("select count(*)::int v from sao_ledger where source='task'")).toBe(0);
});
it('missing approval action cannot earn stars', async () => {
  const base = { status: 'Chờ xác nhận', assignee: 'Sale', submittedAt: new Date().toISOString(), history: [] };
  await db.query('insert into tasks(id,data) values($1,$2)', ['missing-action', JSON.stringify(base)]);
  await db.query('update tasks set data=$1 where id=$2', [JSON.stringify({ ...base, status: 'Hoàn thành', history: [{ byId: admin }] }), 'missing-action']);
  expect(await scalar("select count(*)::int v from sao_task_approvals where task_id='missing-action'")).toBe(0);
});
it('verified approval credits task owner and task-backed locked KPI, never other metrics', async () => {
  const base = { status: 'Chờ xác nhận', assignee: 'Sale', submittedAt: new Date().toISOString(), history: [] };
  await db.query('insert into tasks(id,data) values($1,$2)', ['approved', JSON.stringify(base)]);
  await db.query('update tasks set data=$1 where id=$2', [JSON.stringify({ ...base, status: 'Hoàn thành', history: [{ action: 'Xác nhận hoàn thành', fromStatus: 'Chờ xác nhận', toStatus: 'Hoàn thành', byId: admin }] }), 'approved']);
  expect(await scalar("select count(*)::int v from sao_ledger where source='task' AND user_id=$1", [sale])).toBe(1);
  await db.exec("select sao_rule_save('kpi',20,true)");
  const p = crypto.randomUUID(); await db.query("insert into employee_kpi_periods values($1,$2,'active',current_date-1,current_date+1)", [p, sale]);
  await db.query("insert into employee_kpi_items(id,kpi_period_id,metric_key,target_value,metadata) values($1,$2,'task_completed',1,'{\"lockedAchieved\":true}'),($3,$2,'mkt_revenue',1,'{\"lockedAchieved\":true,\"lockedActual\":1000}')", [crypto.randomUUID(), p, crypto.randomUUID()]);
  await db.query("update employee_kpi_periods set status='locked' where id=$1", [p]);
  await db.query('insert into employee_kpi_snapshots(kpi_period_id,locked_by) values($1,$2)', [p, admin]);
  await db.query('insert into employee_kpi_snapshots(kpi_period_id,locked_by) values($1,$2)', [p, admin]);
  expect(await scalar("select count(*)::int v from sao_ledger where source='kpi'")).toBe(1);
});
it('wallet RLS exposes exactly the employee own wallet', async () => {
  await actor(other);
  await db.exec('SET ROLE authenticated');
  expect(await scalar('select count(*)::int v from sao_wallets')).toBe(0);
  await actor(sale);
  expect(await scalar('select count(*)::int v from sao_wallets')).toBe(1);
  await expect(db.query('update sao_wallets set balance=999 where user_id=$1', [sale])).rejects.toThrow('permission denied');
  await db.exec('RESET ROLE'); await actor(admin);
});
it('progression config requires a Signal permission rather than any signed-in user', async () => {
  await actor(other); expect(await scalar('select signal_progression_config_can_read() v')).toBe(false);
  await actor(admin); expect(await scalar('select signal_progression_config_can_read() v')).toBe(true);
});
async function program(source = 'signal', stars = 30, enabled = true, threshold = 100, starts: string | null = null, ends: string | null = null) {
  const id = crypto.randomUUID();
  await db.query('select sao_program_save($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [id, 'Chương trình mới', source, source === 'signal' ? 'status' : source === 'task' ? 'approved_completion' : 'verified_task_rate', source === 'signal' ? 'transition' : source === 'task' ? 'event' : 'gte', threshold, stars, enabled, starts, ends]);
  return id;
}
it('two signal programs each pay 30 once to the assigned Sale for the same new achievement', async () => {
  const a = await program(); const b = await program(); const id = crypto.randomUUID();
  await db.query("insert into opportunity_signals(id,status,assigned_to,customer_name) values($1,'consulting',$2,'Two programs')", [id, sale]);
  await db.query("update opportunity_signals set status='won',closed_at=now(),revenue=100 where id=$1", [id]);
  await db.query("update opportunity_signals set status='consulting' where id=$1", [id]);
  await db.query("update opportunity_signals set status='won' where id=$1", [id]);
  expect(await scalar('select count(*)::int v from sao_ledger where source_id=$1 and program_id in ($2,$3) and amount=30 and user_id=$4', [id, a, b, sale])).toBe(2);
});
it('newly enabled programs never pay already observed achievements', async () => {
  const id = crypto.randomUUID(); await db.query("select private.sao_award($1,'signal',$2,now(),'Old')", [sale, id]);
  const p = await program(); await db.query("select private.sao_award($1,'signal',$2,now(),'Replay')", [sale, id]);
  expect(await scalar('select count(*)::int v from sao_ledger where program_id=$1 and source_id=$2', [p, id])).toBe(0);
});
it('application window excludes events outside start/end and disabled programs', async () => {
  const future = await program('signal', 30, true, 100, new Date(Date.now()+86400000).toISOString());
  const expired = await program('signal', 30, true, 100, null, new Date(Date.now()-86400000).toISOString());
  const disabled = await program('signal', 30, false);
  const id = crypto.randomUUID(); await db.query("select private.sao_award($1,'signal',$2,now(),'Now')", [sale, id]);
  expect(await scalar('select count(*)::int v from sao_ledger where source_id=$1 and program_id in ($2,$3,$4)', [id, future, expired, disabled])).toBe(0);
});
it('KPI 100 percent condition pays only verified attainment at or above 100', async () => {
  const p = await program('kpi', 30, true, 100);
  for (const rate of [99, 100, 120]) await db.query("select private.sao_award_evaluated($1,'kpi',$2,now(),'Rate',$3)", [sale, `rate-${rate}`, rate]);
  expect(await scalar('select count(*)::int v from sao_ledger where program_id=$1', [p])).toBe(2);
});
it('only managers can create programs and unintegrated fields are rejected', async () => {
  await actor(sale); await expect(program()).rejects.toThrow('Không có quyền'); await actor(admin);
  await expect(db.query("select sao_program_save($1,'Fake','kpi','revenue','gte',100,30,true)", [crypto.randomUUID()])).rejects.toThrow('chưa được tích hợp');
});