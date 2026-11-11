import { expect, it } from 'vitest';
import { observedSignalChange } from './polling';
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