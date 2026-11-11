import { describe, expect, it } from 'vitest';
import { mergeAccess, shouldRefresh, ACCESS_MIN_GAP_MS, ACCESS_MAX_STALE_MS } from './accessCache';
const A = { user_id: 'a', permissions: ['web.view'] as string[], next_transition_at: null as string | null };
describe('access cache', () => {
  it('tab switch within the gap does not refetch; forced refresh after a save does', () => {
    expect(shouldRefresh(1000, 1000 + ACCESS_MIN_GAP_MS - 1)).toBe(false);
    expect(shouldRefresh(1000, 1001, true)).toBe(true);
    expect(shouldRefresh(null, 0)).toBe(true);
  });
  it('identical server result keeps the same object (menu does not re-render)', () => {
    const r = mergeAccess(A, 0, 'a', { data: { ...A, permissions: ['web.view'], server_now: 'later' } as typeof A, error: null }, 5);
    expect(r.value).toBe(A);
  });
  it('a revoked permission from the server replaces the cache immediately', () => {
    const r = mergeAccess(A, 0, 'a', { data: { ...A, permissions: [] }, error: null }, 5);
    expect(r.value?.permissions).toEqual([]);
  });
  it('temporary 500 keeps last verified access of the same user only', () => {
    expect(mergeAccess(A, 0, 'a', { data: null, error: new Error('500') }, 1000).value).toBe(A);
    expect(mergeAccess(A, 0, 'b', { data: null, error: new Error('500') }, 1000).value).toBeNull();
  });
  it('fails closed after the stale window or at a permission boundary', () => {
    expect(mergeAccess(A, 0, 'a', { data: null, error: 'x' }, ACCESS_MAX_STALE_MS).value).toBeNull();
    const B = { ...A, next_transition_at: new Date(500).toISOString() };
    expect(mergeAccess(B, 0, 'a', { data: null, error: 'x' }, 600).value).toBeNull();
  });
  it('never caches access that was never verified', () => {
    expect(mergeAccess(null, null, 'a', { data: null, error: 'x' }, 1).value).toBeNull();
  });
  it('result belonging to another user is rejected', () => {
    expect(mergeAccess(null, null, 'a', { data: { ...A, user_id: 'b' }, error: null }, 1).value).toBeNull();
  });
});
