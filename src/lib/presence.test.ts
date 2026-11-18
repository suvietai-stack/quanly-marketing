import { describe, expect, it } from 'vitest';
import { PRESENCE_HEARTBEAT_MS, shouldTouchPresence } from './presence';

describe('foreground-only employee presence throttling', () => {
  const now = 1_800_000_000_000;
  it('checks in once when the authenticated screen becomes visible', () => {
    expect(shouldTouchPresence(0, now, true)).toBe(true);
    expect(shouldTouchPresence(0, now, false)).toBe(false);
  });
  it('collapses overlapping focus and visibility events', () => {
    expect(shouldTouchPresence(now, now + 5_000, true)).toBe(false);
    expect(shouldTouchPresence(now, now + PRESENCE_HEARTBEAT_MS - 1, true)).toBe(false);
    expect(shouldTouchPresence(now, now + PRESENCE_HEARTBEAT_MS, true)).toBe(true);
  });
  it('never writes presence while a tab is backgrounded', () => {
    expect(shouldTouchPresence(now, now + PRESENCE_HEARTBEAT_MS * 3, false)).toBe(false);
    expect(shouldTouchPresence(now, now + PRESENCE_HEARTBEAT_MS * 3, true)).toBe(true);
  });
  it('recovers safely after the device clock is adjusted backwards', () => {
    expect(shouldTouchPresence(now, now - 100_000, true)).toBe(true);
  });
});
