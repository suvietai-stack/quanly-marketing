import { describe, it, expect } from 'vitest';
import { availableStars, giftAvailable, mayRedeem, mayCelebrate } from './logic';
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