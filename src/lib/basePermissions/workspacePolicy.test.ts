import { expect, it } from 'vitest';
import { effectiveReadKey, shouldReadStaffEffective } from './workspacePolicy';
it('reads full effective permissions only after opening the effective tab', () => {
  expect(shouldReadStaffEffective('staff', 'effective', 'employee')).toBe(true);
  for (const tab of ['default', 'extra', 'spec']) expect(shouldReadStaffEffective('staff', tab, 'employee')).toBe(false);
  expect(shouldReadStaffEffective('chart', 'effective', 'employee')).toBe(false);
  expect(shouldReadStaffEffective('settings', 'effective', 'employee')).toBe(false);
  expect(shouldReadStaffEffective('staff', 'effective', '')).toBe(false);
});
it('never reuses another actor, target or permission revision', () => {
  const key = effectiveReadKey('actor', 'employee', 1);
  expect(key).not.toEqual(effectiveReadKey('other', 'employee', 1));
  expect(key).not.toEqual(effectiveReadKey('actor', 'other', 1));
  expect(key).not.toEqual(effectiveReadKey('actor', 'employee', 2));
});