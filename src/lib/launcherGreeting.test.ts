import { describe, expect, it } from 'vitest';
import { launcherDayPeriod, launcherGreetingAt } from './launcherGreeting';

describe('time-aware welcome banner', () => {
  it.each([
    [0, 'late'], [4, 'late'], [5, 'morning'], [10, 'morning'],
    [11, 'midday'], [13, 'midday'], [14, 'afternoon'],
    [17, 'afternoon'], [18, 'evening'], [21, 'evening'], [22, 'late'],
  ] as const)('resolves %i:00 to %s', (hour, expected) => {
    expect(launcherDayPeriod(hour)).toBe(expected);
    expect(launcherGreetingAt(new Date(2026, 10, 13, hour, 19), 'Admin').period).toBe(expected);
  });

  it('recognizes the current evening and keeps Vietnamese accents and name', () => {
    const greeting = launcherGreetingAt(new Date(2026, 10, 13, 19, 19), ' Admin   Hệ Thống ', 'user-a');
    expect(greeting.period).toBe('evening');
    expect(greeting.title).toContain('Admin Hệ Thống!');
    expect(greeting.eyebrow).toBe('Thứ Sáu · 13/11');
    expect(greeting.subtitle.length).toBeGreaterThan(15);
  });

  it('rotates wording each day without changing it during the same period', () => {
    const first = launcherGreetingAt(new Date(2026, 10, 13, 18, 1), 'Julia', 'julia');
    const later = launcherGreetingAt(new Date(2026, 10, 13, 21, 55), 'Julia', 'julia');
    const tomorrow = launcherGreetingAt(new Date(2026, 10, 14, 18, 1), 'Julia', 'julia');
    expect(later.title).toBe(first.title);
    expect(later.subtitle).toBe(first.subtitle);
    expect(tomorrow.title).not.toBe(first.title);
  });

  it('works without a name and does not introduce a stray comma', () => {
    const greeting = launcherGreetingAt(new Date(2026, 10, 13, 9), undefined, 'staff');
    expect(greeting.title).not.toContain(', !');
    expect(greeting.title.endsWith('!')).toBe(true);
  });
});
