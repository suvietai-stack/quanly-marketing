import { expect, it } from 'vitest';
import { fmtVN, milestoneAt, milestoneOrderError, milestonesFor, phaseFromIso, upcomingPeriods } from './deadline';

it('March plan before February 28 uses Vietnam local date', () => expect(milestoneAt('plan_month', { day: 28, phase: 'before' }, 2027, 3)).toBe('2027-02-28 17:00'));
it('March report after April 3 preserves hour and minute', () => expect(milestoneAt('report_month', { day: 3, phase: 'after', hour: 8, minute: 30 }, 2027, 3)).toBe('2027-04-03 08:30'));
it('clamps February to leap year last day', () => expect(milestoneAt('plan_month', { day: 31, phase: 'before' }, 2028, 3)).toBe('2028-02-29 17:00'));
it('Q4 report after moves to following year', () => expect(milestoneAt('report_quarter', { day: 3, phase: 'after' }, 2027, 4)).toBe('2028-01-03 17:00'));
it('offset -1 equals phase before', () => expect(milestoneAt('plan_month', { day: 25, offset: -1, hour: 0, minute: 0 }, 2026, 11)).toBe('2026-10-25 00:00'));
it('quarter offset 2 picks third month of quarter', () => expect(milestoneAt('plan_quarter', { day: 10, offset: 2 }, 2027, 2)).toBe('2027-06-10 17:00'));
it('year offset 12 moves to January of next year', () => expect(milestoneAt('report_year', { day: 31, offset: 12, hour: 23, minute: 59 }, 2027, 1)).toBe('2028-01-31 23:59'));
it('year offset -1 keeps December of previous year', () => expect(milestoneAt('plan_year', { day: 20, offset: -1 }, 2027, 1)).toBe('2026-12-20 17:00'));

it('milestonesFor applies per-milestone exception', () => {
  const rule = { open: { day: 25, offset: -1, hour: 0, minute: 0 }, due: { day: 3, offset: 0, hour: 23, minute: 59 }, late_close: { day: 15, offset: 0, hour: 23, minute: 59 }, exceptions: { '2026-11': { due: '2026-11-05T23:59' } } };
  expect(milestonesFor('plan_month', rule, 2026, 11)).toEqual({ open: '2026-10-25 00:00', due: '2026-11-05 23:59', late_close: '2026-11-15 23:59' });
});
it('legacy string exception maps to due milestone', () => {
  expect(milestonesFor('plan_month', { due: { day: 3 }, exceptions: { '2027-01': '2027-01-10T10:00' } }, 2027, 1).due).toBe('2027-01-10 10:00');
});
it('spec example: plan month 11/2026 opens 25/10, due 03/11, closes 15/11', () => {
  const rule = { open: { day: 25, offset: -1, hour: 0, minute: 0 }, due: { day: 3, offset: 0, hour: 23, minute: 59 }, late_close: { day: 15, offset: 0, hour: 23, minute: 59 } };
  expect(milestonesFor('plan_month', rule, 2026, 11)).toEqual({ open: '2026-10-25 00:00', due: '2026-11-03 23:59', late_close: '2026-11-15 23:59' });
});

it('fmtVN formats Vietnam wall time', () => expect(fmtVN('2026-11-03 23:59')).toBe('03/11/2026 23:59'));
it('phaseFromIso covers all phases', () => {
  const m = { open: '2026-10-25T00:00:00+07:00', due: '2026-11-03T23:59:00+07:00', late_close: '2026-11-15T23:59:00+07:00' };
  expect(phaseFromIso(m, '2026-10-20T10:00:00+07:00')).toBe('not_open');
  expect(phaseFromIso(m, '2026-10-26T10:00:00+07:00')).toBe('open');
  expect(phaseFromIso(m, '2026-11-10T10:00:00+07:00')).toBe('overdue');
  expect(phaseFromIso(m, '2026-11-16T10:00:00+07:00')).toBe('closed');
  expect(phaseFromIso({ open: null, due: null, late_close: null }, '2026-11-16T10:00:00+07:00')).toBe('none');
});
it('order error catches open after due across leap year samples', () => {
  expect(milestoneOrderError('plan_month', { open: { day: 5, offset: 0 }, due: { day: 3, offset: 0 } })).toMatch('Ngày mở nộp phải trước hạn cuối');
  expect(milestoneOrderError('plan_month', { open: { day: 25, offset: -1 }, due: { day: 3, offset: 0 }, late_close: { day: 15, offset: 0 } })).toBeNull();
  expect(milestoneOrderError('report_quarter', { due: { day: 31, offset: 3 }, late_close: { day: 5, offset: 3 } })).toBeNull();
});
it('upcomingPeriods rolls over year boundary', () => {
  const periods = upcomingPeriods('plan_month', new Date('2026-11-10T10:00:00+07:00'));
  expect(periods).toEqual([{ year: 2026, period: 11 }, { year: 2026, period: 12 }, { year: 2027, period: 1 }]);
});
