import { expect, it } from 'vitest';
import { creationError, creationKfPayload, inheritKpi, newCreationKf, timelineError } from './k3Creation';

it('same-day 09:30 to 11:00 is valid', () => {
  expect(timelineError('2026-11-05', '2026-11-05', '09:30', '11:00')).toBe('');
});
it('date-only deadline means the end of the day', () => {
  expect(timelineError('2026-11-05', '2026-11-05', '09:30', '')).toBe('');
});
it('end before start is rejected', () => {
  expect(timelineError('2026-11-05', '2026-11-05', '11:00', '09:30')).not.toBe('');
});
it('binary criterion inherits exactly the expected result without inventing a sent requirement', () => {
  const k = newCreationKf().kpis[0]; if (!k) throw new Error('Missing KPI');
  expect(inheritKpi(k, 'Soạn báo giá', 'Có file báo giá', '2026-11-05', '2026-11-05').config.valid_condition).toBe('Có file báo giá');
});
it('quantitative target and unit stay blank without evidence', () => {
  const k = newCreationKf(); const first = k.kpis[0]; if (!first) throw new Error('Missing KPI');
  const payload = creationKfPayload({ ...k, kpis: [{ ...first, measure: 'cumulative' }] }, 'Gọi khách', '', '2026-11-05', '2026-11-05');
  expect(payload.kpis[0]?.target).toBeNull(); expect(payload.kpis[0]?.unit).toBe('');
});
it('switching presentation modes preserves the same KF and KPI request identity', () => {
  const k = newCreationKf();
  const before = creationKfPayload(k, 'Soạn báo giá', 'Có báo giá', '2026-11-05', '2026-11-05');
  const after = creationKfPayload(k, 'Soạn báo giá', 'Có báo giá', '2026-11-05', '2026-11-05');
  expect(after.request_key).toBe(before.request_key); expect(after.kpis[0]?.request_key).toBe(before.kpis[0]?.request_key);
});

it('simple binary work inherits the exact work name without duplicate input', () => {
  const k = newCreationKf();
  const p = creationKfPayload(k, 'Soạn báo giá khách sạn Vinh Nghệ An', '', '2026-11-05', '2026-11-05');
  expect(p.kpis[0]?.config.valid_condition).toBe('Soạn báo giá khách sạn Vinh Nghệ An');
  expect(p.kpis[0]?.target).toBe(1);
  expect(creationError('Soạn báo giá', '2026-11-05', '2026-11-05', [k])).toBe('');
});
it('missing deadline is rejected explicitly', () => {
  expect(creationError('Soạn báo giá', '2026-11-05', '', [newCreationKf()])).toBe('Chưa chọn hạn hoàn thành.');
});
it('quantity requires both target and unit', () => {
  const k = newCreationKf(); const first = k.kpis[0]; if (!first) throw new Error('Missing KPI');
  k.kpis = [{ ...first, measure: 'cumulative', target: '100', unit: '' }];
  expect(creationError('Lập danh sách', '2026-11-05', '2026-11-11', [k])).toContain('đơn vị');
  k.kpis = [{ ...first, measure: 'cumulative', target: '100', unit: 'đại lý' }];
  expect(creationError('Lập danh sách', '2026-11-05', '2026-11-11', [k])).toBe('');
});