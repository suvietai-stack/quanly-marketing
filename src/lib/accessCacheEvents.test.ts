import { describe, expect, it } from 'vitest';
import { authEventAction, isFatalAccessError, mergeAccess } from './accessCache';
const A = { user_id: 'a', permissions: ['web.view'] as string[], next_transition_at: null as string | null };
describe('auth events', () => {
  it('5 repeated SIGNED_IN of the same loaded user never reload permissions', () => {
    for (let i = 0; i < 5; i++) expect(authEventAction('SIGNED_IN', 'a', 'a', true)).toBe('ignore');
  });
  it('focus/visibility/cross-tab INITIAL_SESSION and token refresh are ignored', () => {
    expect(authEventAction('INITIAL_SESSION', 'a', 'a', true)).toBe('ignore');
    expect(authEventAction('TOKEN_REFRESHED', 'a', 'a', true)).toBe('ignore');
  });
  it('full reload (not yet loaded) loads once; USER_UPDATED refreshes', () => {
    expect(authEventAction('INITIAL_SESSION', null, 'a', false)).toBe('load');
    expect(authEventAction('SIGNED_IN', 'a', 'a', false)).toBe('load');
    expect(authEventAction('USER_UPDATED', 'a', 'a', true)).toBe('reload');
  });
  it('logout clears; a new uid loads fresh', () => {
    expect(authEventAction('SIGNED_OUT', 'a', null, true)).toBe('clear');
    expect(authEventAction('SIGNED_IN', 'a', 'b', true)).toBe('load');
  });
  it('suspended/denied account: old privilege is dropped at once, not kept stale', () => {
    expect(isFatalAccessError({ code: '42501' })).toBe(true);
    expect(mergeAccess(A, 0, 'a', { data: null, error: { code: '42501' } }, 1000).value).toBeNull();
    expect(mergeAccess(A, 0, 'a', { data: null, error: { status: 401 } }, 1000).value).toBeNull();
    expect(mergeAccess(A, 0, 'a', { data: null, error: { status: 503 } }, 1000).value).toBe(A);
  });
});
