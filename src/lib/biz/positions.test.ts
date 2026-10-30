import { expect, it } from 'vitest';
import { appointmentCurrent, vietnamTimestamp } from './positions';
it('appointments start inclusively and finish exclusively without activating future or cancelled decisions', () => {
 const a = { status: 'active' as const, started_at: '2026-10-30T08:00:00+07:00', ended_at: '2026-11-01T08:00:00+07:00' };
 expect(appointmentCurrent(a, '2026-10-30T07:59:59+07:00')).toBe(false);
 expect(appointmentCurrent(a, a.started_at)).toBe(true);
 expect(appointmentCurrent(a, a.ended_at)).toBe(false);
 expect(appointmentCurrent({ ...a, status: 'cancelled' }, a.started_at)).toBe(false);
});
it('appointment dates preserve Vietnam local input as an explicit UTC+7 timestamp', () => {
 expect(vietnamTimestamp('2026-10-30T15:30')).toBe('2026-10-30T15:30:00+07:00');
 expect(new Date(vietnamTimestamp('2026-10-30T15:30')).toISOString()).toBe('2026-10-30T08:30:00.000Z');
});