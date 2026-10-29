import { expect, it } from 'vitest';
import { newProgram, validProgram, fromVietnamInput, toVietnamInput } from './programs';
it('program accepts signal reward of 30 stars and requires a name', () => {
  const p = newProgram(); expect(validProgram(p)).toBe(false); expect(validProgram({ ...p, name: 'Chốt mới', stars: 30 })).toBe(true);
});
it('KPI threshold must reach at least 100 percent and use the integrated task rate', () => {
  const p = { ...newProgram('kpi'), name: 'KR' }; expect(validProgram({ ...p, threshold: 99 })).toBe(false); expect(validProgram({ ...p, threshold: 100 })).toBe(true); expect(validProgram({ ...p, field: 'revenue' })).toBe(false);
});
it('Vietnam application dates preserve local hour and reject reversed windows', () => {
  expect(fromVietnamInput('2026-10-29T12:00')).toBe('2026-10-29T05:00:00.000Z'); expect(toVietnamInput('2026-10-29T05:00:00.000Z')).toBe('2026-10-29T12:00');
  expect(validProgram({ ...newProgram(), name: 'Dates', starts_at: '2026-10-30T00:00:00Z', ends_at: '2026-10-29T00:00:00Z' })).toBe(false);
});