import { describe, it, expect } from 'vitest';
import { availableStars, giftAvailable, mayRedeem, mayCelebrate, friendlyReward, programActive } from './logic';
describe('Sao availability', () => {
  it('holds 30 of 100 without subtracting the total', () => expect(availableStars(100, 30)).toBe(70));
  it('blocks spending held stars', () => expect(mayRedeem(100, 80, 30, 2, 0, true)).toBe(false));
  it('allows exactly the available balance', () => expect(mayRedeem(100, 70, 30, 2, 0, true)).toBe(true));
  it('blocks gifts reserved by another user', () => expect(mayRedeem(100, 0, 30, 1, 1, true)).toBe(false));
  it('blocks disabled gifts', () => expect(mayRedeem(100, 0, 30, 2, 0, false)).toBe(false));
  it('available stock excludes reservations', () => expect(giftAvailable(5, 2)).toBe(3));
});
describe('celebration safety', () => {
  it('does not interrupt another modal', () => expect(mayCelebrate(true, false, true)).toBe(false));
  it('does not interrupt editing', () => expect(mayCelebrate(true, true, false)).toBe(false));
  it('does not consume offline rewards', () => expect(mayCelebrate(false, false, false)).toBe(false));
  it('allows a visible idle session', () => expect(mayCelebrate(true, false, false)).toBe(true));
});
describe('friendly reward copy', () => {
  it('explains a won signal naturally', () => expect(friendlyReward('signal')).toContain('chốt thành công'));
  it('explains a confirmed task naturally', () => expect(friendlyReward('task')).toContain('xác nhận hoàn thành'));
  it('explains KPI naturally', () => expect(friendlyReward('kpi')).toContain('KPI'));
  it('falls back for unknown sources', () => expect(friendlyReward('manual')).toContain('thành tích mới'));
});
describe('program visibility window', () => {
  const base = { enabled: true, starts_at: null, ends_at: null };
  it('shows enabled programs without dates', () => expect(programActive(base)).toBe(true));
  it('hides disabled programs', () => expect(programActive({ ...base, enabled: false })).toBe(false));
  it('hides programs before they start', () => expect(programActive({ ...base, starts_at: new Date(Date.now() + 86400000).toISOString() })).toBe(false));
  it('hides programs after they end', () => expect(programActive({ ...base, ends_at: new Date(Date.now() - 86400000).toISOString() })).toBe(false));
  it('shows programs inside their window', () => expect(programActive({ ...base, starts_at: new Date(Date.now() - 86400000).toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString() })).toBe(true));
});