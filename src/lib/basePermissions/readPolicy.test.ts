import { expect, it } from 'vitest';
import { organizationReadKey, organizationRetryDelay, retryOrganizationRead } from './readPolicy';

it('a timeout retries once, then stops', () => {
  expect(retryOrganizationRead(0, { code: '57014', message: 'canceling statement due to statement timeout' })).toBe(true);
  expect(retryOrganizationRead(1, { code: '57014' })).toBe(false);
});
it('authorization denial never retries even with a timeout message', () => {
  expect(retryOrganizationRead(0, { code: '42501', message: 'timeout' })).toBe(false);
  expect(retryOrganizationRead(0, { status: 401, message: 'network error' })).toBe(false);
});
it('backoff begins at one second and caps at four seconds', () => {
  expect(organizationRetryDelay(0)).toBe(1000);
  expect(organizationRetryDelay(9)).toBe(4000);
});
it('organization cache keys isolate accounts and authorization revisions', () => {
  expect(organizationReadKey('a', 1)).not.toEqual(organizationReadKey('b', 1));
  expect(organizationReadKey('a', 1)).not.toEqual(organizationReadKey('a', 2));
});