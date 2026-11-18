import { expect, it } from 'vitest';
import { observedSignalChange, SIGNAL_TOKEN_POLL_INTERVAL_MS } from './polling';
it('throttles heavy server checks while active (no 30-second polling)', () => { expect(SIGNAL_TOKEN_POLL_INTERVAL_MS).toBeGreaterThanOrEqual(90_000); });
it('does not refetch the list when the token becomes temporarily unavailable', () => {
  expect(observedSignalChange('verified', undefined)).toBe(false);
});
it('does not refetch on first observation or unchanged server token', () => {
  expect(observedSignalChange(undefined, 'first')).toBe(false);
  expect(observedSignalChange('same', 'same')).toBe(false);
});
it('refreshes after an actual server transition', () => {
  expect(observedSignalChange('old', 'new')).toBe(true);
});