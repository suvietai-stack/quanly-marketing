import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

const db = new PGlite();
const uid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const actor = (n: number) => db.query("select set_config('test.uid',$1,false)", [uid(n)]);
async function reject(sql: string, args: unknown[], message: string) {
  await db.exec('SAVEPOINT expected_error');
  await expect(db.query(sql, args)).rejects.toThrow(message);
  await db.exec('ROLLBACK TO SAVEPOINT expected_error');
}
const v = async <T>(sql: string, args: unknown[] = []) => (await db.query<{ v: T }>(sql, args)).rows[0]?.v;
const payload = (extra: Record<string, unknown> = {}) => JSON.stringify({ revision: 0, applies_all_blocks: false, applied_block_ids: ['mkt'], applies_unassigned: false, effective_from: today, reason: 'Controlled fixture', ...extra });
beforeAll(async () => {
  await db.exec(readFileSync('docs/k3-personal-2026-11-12/test-fixture.sql', 'utf8'));
  await db.exec(`ALTER TABLE org_units ADD COLUMN kind text; ALTER TABLE org_units ADD COLUMN parent_id text; ALTER TABLE org_units ADD COLUMN name text DEFAULT 'Fixture unit';
    INSERT INTO org_units(id,kind,parent_id) VALUES ('biz','block',null),('mkt','block',null),('ops','block',null),('md','department','mkt'),('design','department','mkt'),('od','department','ops'),('company','company',null);
    INSERT INTO profiles VALUES ('${uid(1)}','Admin','Đang hoạt động'),('${uid(2)}','Marketing','Đang hoạt động'),('${uid(3)}','Design','Đang hoạt động'),('${uid(4)}','Ops','Đang hoạt động'),('${uid(5)}','Concurrent','Đang hoạt động'),('${uid(6)}','Company','Đang hoạt động'),('${uid(7)}','Unassigned','Đang hoạt động'),('${uid(8)}','Inactive','Tạm khóa');
    INSERT INTO org_assignments VALUES ('a','${uid(2)}','md','active','2026-01-01',null),('b','${uid(3)}','design','active','2026-01-01',null),('c','${uid(4)}','od','active','2026-01-01',null),('d','${uid(5)}','od','active','2026-01-01',null),('e','${uid(5)}','md','active','2026-01-01',null),('f','${uid(6)}','company','active','2026-01-01',null);`);
  await db.exec(readFileSync('drizzle/migrations/0383_k3_personal_company_access.sql', 'utf8'));
  await db.exec(readFileSync('docs/pending/k3_application_scope.sql', 'utf8'));
}, 30_000);
beforeEach(async () => { await db.exec('BEGIN'); await actor(1); });
afterEach(() => db.exec('ROLLBACK'));
afterAll(() => db.close());
it('all blocks defaults ON including new blocks and company/unassigned, but never inactive', async () => {
  const s = await v<{ applies_all_blocks: boolean; employee_count: number }>('select k3_application_scope_read() v');
  expect(s?.applies_all_blocks).toBe(true); expect(s?.employee_count).toBe(7);
  await db.exec(`INSERT INTO org_units(id,kind) VALUES ('new','block'); INSERT INTO org_assignments VALUES ('new','${uid(7)}','new','active','2026-01-01',null)`);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(7), today])).toBe(true);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(8), today])).toBe(false);
});
it('selected Marketing includes Design descendants and concurrent holders but excludes Operations', async () => {
  await db.query('select k3_application_scope_save($1)', [payload()]);
  for (const n of [2, 3, 5]) expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(n), today])).toBe(true);
  for (const n of [4, 6, 7]) expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(n), today])).toBe(false);
  expect(await v<number>('select count(*)::int v from k3_application_versions')).toBe(1);
});
it('manual company/unassigned option does not guess a block; future new blocks stay excluded', async () => {
  await db.query('select k3_application_scope_save($1)', [payload({ applies_unassigned: true })]);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(6), today])).toBe(true);
  await db.exec(`INSERT INTO org_units(id,kind) VALUES ('new','block'); INSERT INTO org_assignments VALUES ('new','${uid(7)}','new','active','2026-01-01',null)`);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(7), today])).toBe(false);
});
it('staff cannot read/save configuration or gain management rights through selecting a block', async () => {
  await actor(2);
  await reject('select k3_application_scope_save($1)', [payload()], 'Không có quyền');
  await reject('select k3_application_scope_read()', [], 'Không có quyền');
  expect(await v<boolean>("select k3_can($1,'k3.view_scope') v", [uid(2)])).toBe(false);
});
it('revision, active IDs and prospective dates are validated before audited save', async () => {
  await reject('select k3_application_scope_save($1)', [payload({ applied_block_ids: ['md'] })], 'Khối');
  await reject('select k3_application_scope_save($1)', [payload({ effective_from: '2020-01-01' })], 'quá khứ');
  await db.query('select k3_application_scope_save($1)', [payload()]);
  await reject('select k3_application_scope_save($1)', [payload()], 'Cấu hình đã thay đổi');
  expect(await v<number>('select count(*)::int v from k3_application_versions')).toBe(1);
});
it('excluded owner keeps historical reads but cannot write via scope gate or backdate around exclusion', async () => {
  await actor(4); await db.query('select k3_day_save($1,$2)', [today, 'History']);
  await actor(1); await db.query('select k3_application_scope_save($1)', [payload()]);
  await actor(4);
  expect(await v<boolean>("select k3_can($1,'k3.use') v", [uid(4)])).toBe(true);
  expect(await v<boolean>('select private.k3_application_can_write($1,$2) v', [uid(4), today])).toBe(false);
  expect(await v<boolean>('select private.k3_application_can_write($1,$2) v', [uid(4), '2026-11-02'])).toBe(false);
  expect(await v<number>('select count(*)::int v from k3_days where user_id=$1', [uid(4)])).toBe(1);
});
it('future effective scope leaves today unchanged and cannot create retrospective application', async () => {
  const future = await v<string>("select (current_date+30)::text v");
  await db.query('select k3_application_scope_save($1)', [payload({ effective_from: future })]);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(4), today])).toBe(true);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(4), future])).toBe(false);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(4), '2026-01-01'])).toBe(true);
});
it('expired appointment revokes selected block membership; future appointments grant nothing today', async () => {
  await db.query('select k3_application_scope_save($1)', [payload()]);
  await db.exec("update org_assignments set status='ended',ends_at=now()-interval '1 hour' where id='a'");
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(2), today])).toBe(false);
  await db.exec(`INSERT INTO org_assignments VALUES ('future','${uid(7)}','md','active',now()+interval '1 day',null)`);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(7), today])).toBe(false);
});
it('DENY authorization still prevents writes even when the block is selected', async () => {
  await db.query('select k3_application_scope_save($1)', [payload()]);
  await db.query("insert into test_denies values($1,'k3.use')", [uid(2)]);
  expect(await v<boolean>('select private.k3_application_in_scope($1,$2) v', [uid(2), today])).toBe(true);
  expect(await v<boolean>('select private.k3_application_can_write($1,$2) v', [uid(2), today])).toBe(false);
});