import { describe, expect, it } from 'vitest';
import { isAmbiguousK3WriteFailure, reconcileK3Write } from './k3WriteRecovery';

describe('3K write reconciliation', () => {
  it('classifies DB statement timeout and transport uncertainty, not validation errors', () => {
    expect(isAmbiguousK3WriteFailure({ code: '57014', message: 'canceling statement due to statement timeout' })).toBe(true);
    expect(isAmbiguousK3WriteFailure({ status: 504, message: 'Gateway timeout' })).toBe(true);
    expect(isAmbiguousK3WriteFailure(new TypeError('Failed to fetch'))).toBe(true);
    expect(isAmbiguousK3WriteFailure({ name: 'AbortError' })).toBe(true);
    expect(isAmbiguousK3WriteFailure({ code: '23505', message: 'unique violation' })).toBe(false);
    expect(isAmbiguousK3WriteFailure({ code: '42501', message: 'permission denied' })).toBe(false);
    expect(isAmbiguousK3WriteFailure(null)).toBe(false);
  });

  it('acknowledges a committed write on the first read', async () => {
    let calls = 0;
    expect(await reconcileK3Write(async () => { calls++; return 'saved-id'; }, 0))
      .toEqual({ state: 'saved', id: 'saved-id' });
    expect(calls).toBe(1);
  });

  it('checks again before saying not found (commit can arrive late)', async () => {
    let calls = 0;
    expect(await reconcileK3Write(async () => ++calls === 1 ? null : 'committed-id', 0))
      .toEqual({ state: 'saved', id: 'committed-id' });
    expect(calls).toBe(2);
  });

  it('does not claim success when neither read sees a write', async () => {
    let calls = 0;
    expect(await reconcileK3Write(async () => { calls++; return null; }, 0))
      .toEqual({ state: 'not_found' });
    expect(calls).toBe(2);
  });

  it('preserves uncertainty after a read-back failure, instead of allowing a new request', async () => {
    expect(await reconcileK3Write(async () => { throw new Error('network unavailable'); }, 0))
      .toEqual({ state: 'unknown' });
  });
});
