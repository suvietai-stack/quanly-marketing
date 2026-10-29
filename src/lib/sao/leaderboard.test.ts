import { describe, expect, it } from 'vitest';
import { currentStep, resolvePeriod } from './leaderboard';

// 2026-10-29 is a Thursday. VN time = UTC+7.
const NOW = new Date('2026-10-29T03:00:00Z'); // 10:00 VN Thursday

describe('sao leaderboard periods (Asia/Ho_Chi_Minh)', () => {
  it('all mode has no bounds', () => {
    const p = resolvePeriod('all', 0, NOW);
    expect(p.from).toBeNull();
    expect(p.to).toBeNull();
  });

  it('current month spans 2026-10-01 to 2026-11-01 in VN time', () => {
    const p = resolvePeriod('month', 0, NOW);
    expect(p.label).toBe('Tháng 10/2026');
    expect(p.from?.toISOString()).toBe('2026-09-30T17:00:00.000Z');
    expect(p.to?.toISOString()).toBe('2026-10-31T17:00:00.000Z');
  });

  it('previous month crosses year boundary correctly', () => {
    const jan = new Date('2026-01-15T05:00:00Z'); // Jan 2026 VN
    const p = resolvePeriod('month', -1, jan);
    expect(p.label).toBe('Tháng 12/2025');
    expect(p.from?.toISOString()).toBe('2025-11-30T17:00:00.000Z');
    expect(p.to?.toISOString()).toBe('2025-12-31T17:00:00.000Z');
  });

  it('quarter 4 of 2026 spans Oct–Dec', () => {
    const p = resolvePeriod('quarter', 0, NOW);
    expect(p.label).toBe('Quý 4/2026');
    expect(p.from?.toISOString()).toBe('2026-09-30T17:00:00.000Z');
    expect(p.to?.toISOString()).toBe('2026-12-31T17:00:00.000Z');
  });

  it('previous quarter crosses year boundary', () => {
    const jan = new Date('2026-01-15T05:00:00Z');
    const p = resolvePeriod('quarter', -1, jan);
    expect(p.label).toBe('Quý 4/2025');
  });

  it('current week starts Monday 2026-10-26 and ends before Monday 2026-11-02 VN', () => {
    const p = resolvePeriod('week', 0, NOW);
    expect(p.from?.toISOString()).toBe('2026-10-25T17:00:00.000Z');
    expect(p.to?.toISOString()).toBe('2026-11-01T17:00:00.000Z');
  });

  it('week step is stable within the same week (Sunday still same week)', () => {
    const sunday = new Date('2026-11-01T10:00:00Z'); // Sunday 17:00 VN
    expect(currentStep('week', sunday)).toBe(currentStep('week', NOW));
  });

  it('year mode spans the full VN year', () => {
    const p = resolvePeriod('year', 0, NOW);
    expect(p.label).toBe('Năm 2026');
    expect(p.from?.toISOString()).toBe('2025-12-31T17:00:00.000Z');
    expect(p.to?.toISOString()).toBe('2026-12-31T17:00:00.000Z');
  });

  it('offset -2 goes back two months', () => {
    const p = resolvePeriod('month', -2, NOW);
    expect(p.label).toBe('Tháng 8/2026');
  });
});
