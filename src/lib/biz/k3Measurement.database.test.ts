import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
beforeAll(async () => {
  await db.exec('CREATE SCHEMA private; CREATE ROLE anon; CREATE ROLE authenticated;');
  const sql = readFileSync('drizzle/migrations/0218_k3_shared_ten_mode_evaluator.sql', 'utf8');
  await db.exec(sql.slice(0, sql.indexOf('CREATE FUNCTION private.k3_measure_rows')));
  const patch = readFileSync('drizzle/migrations/0220_k3_configured_creation_and_date_preview.sql', 'utf8');
  const start = patch.indexOf(" def:=pg_get_functiondef('private.k3_measure_eval");
  const end = patch.indexOf('END $patch$;', start);
  await db.exec('DO $patch$ DECLARE def text; BEGIN\n' + patch.slice(start, end) + 'END $patch$;');
});
afterAll(() => db.close());
async function evalKpi(measure: string, rows: Record<string, unknown>[], config: Record<string, unknown> = {}, target = 3, extras: Record<string, unknown> = {}) {
  const k = { measure, condition: 'gte', target, config, ...extras };
  return (await db.query<{ v: Record<string, unknown> }>('SELECT private.k3_measure_eval($1::jsonb,$2::jsonb,$3::date) v', [JSON.stringify(k), JSON.stringify(rows), '2026-11-04'])).rows[0]?.v;
}
it('tích lũy: khác ngày 20 + 30 = 50 trên mục tiêu 200', async () => {
  expect(await evalKpi('cumulative', [{ value: 20 }, { value: 30 }], {}, 200)).toMatchObject({ actual: 50, progress: 25 });
});
it('đạt con số: giá trị mới nhất 2, ngưỡng ≤ 2, không tạo phần trăm giả', async () => {
  expect(await evalKpi('current', [{ value: 4, work_date: '2026-11-03' }, { value: 2, work_date: '2026-11-04' }], {}, 2, { condition: 'lte' })).toMatchObject({ actual: 2, attained: true, progress: null });
});
it('Có/Chưa cần nghiệm thu: tích chọn không tự đạt', async () => {
  expect(await evalKpi('binary', [{ value: 1 }], { acceptance_required: true }, 1)).toMatchObject({ actual: null, attained: false, pending_acceptance: 1 });
});
it('Có/Chưa đã nghiệm thu hợp lệ đạt mục tiêu 1', async () => {
  expect(await evalKpi('binary', [{ value: 1, acceptance: 'accepted' }], { acceptance_required: true }, 1)).toMatchObject({ actual: 1, attained: true });
});
it('cột mốc: trọng số 40/60 và tất cả mốc bắt buộc', async () => {
  expect(await evalKpi('milestone', [{ completed: ['a'] }], { milestones: [{ id: 'a', weight: 40, required: true }, { id: 'b', weight: 60, required: true }] }, 2, { milestones: ['a', 'b'] })).toMatchObject({ actual: 1, progress: 40, attained: false });
});
it('tần suất: tuần hiện tại có 3 lần, không cộng tuần trước 5 lần', async () => {
  expect(await evalKpi('frequency', [{ value: 5, work_date: '2026-11-01' }, { value: 3, work_date: '2026-11-03' }], { cycle: 'week', start_date: '2026-11-01', end_date: '2026-11-30' })).toMatchObject({ actual: 3, total_actual: 8, cycle_start: '2026-11-02', attained: true });
});
it('chuỗi: ngày thiếu kết quả ngắt chuỗi, giữ chuỗi dài nhất 2', async () => {
  expect(await evalKpi('streak', [{ value: 1, work_date: '2026-11-01' }, { value: 1, work_date: '2026-11-02' }, { value: 1, work_date: '2026-11-04' }], { start_date: '2026-11-01', end_date: '2026-11-30' })).toMatchObject({ actual: 1, longest_streak: 2, attained: false });
});
it('chuỗi: chỉ bỏ ngày nghỉ khi lịch cấu hình rõ', async () => {
  expect(await evalKpi('streak', [{ value: 1, work_date: '2026-11-02' }, { value: 1, work_date: '2026-11-04' }], { start_date: '2026-11-02', end_date: '2026-11-30', weekdays: [1, 3] }, 2)).toMatchObject({ actual: 2, attained: true });
});
it('tỷ lệ: dùng tổng 3/10 = 30%, không cộng phần trăm ngày', async () => {
  expect(await evalKpi('ratio', [{ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 8 }], {}, 20)).toMatchObject({ actual: 30, numerator: 3, denominator: 10 });
});
it('tỷ lệ mẫu số 0 là chưa đủ dữ liệu, không tự thành 0%', async () => {
  expect(await evalKpi('ratio', [{ numerator: 0, denominator: 0 }], {}, 20)).toMatchObject({ actual: null, attained: null });
});
it('không trùng: quy tắc trim_lower chỉ đếm 2 mã', async () => {
  expect(await evalKpi('distinct', [{ objects: [' A ', 'a', 'B'] }], { normalization: 'trim_lower' }, 2)).toMatchObject({ actual: 2, attained: true });
});
it('trung bình có trọng số: tổng 40 trên 5 quan sát = 8', async () => {
  expect(await evalKpi('average', [{ numerator: 30, denominator: 3 }, { numerator: 10, denominator: 2 }], {}, 8)).toMatchObject({ actual: 8, attained: true });
});
it('thời lượng chuẩn phút: 60 + 90 = 150', async () => {
  expect(await evalKpi('duration', [{ value: 60 }, { value: 90 }], {}, 120)).toMatchObject({ actual: 150, progress: 125 });
});
it('selected date excludes future rows and quarantined observations from all aggregates', async () => {
  expect(await evalKpi('cumulative', [{value:20,work_date:'2026-11-04'},{value:100,work_date:'2026-11-05'},{value:40,review_reason:'Thiếu nguồn'}],{},200)).toMatchObject({actual:20,total_actual:20,progress:10});
});