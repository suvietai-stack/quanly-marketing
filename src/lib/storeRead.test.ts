import { describe, expect, it, vi } from 'vitest';
import { isTransientStoreRead, readAllPages } from './storeRead';

describe('store reads', () => {
  it('loads beyond the server row cap without dropping the final page', async () => {
    const all = Array.from({ length: 1001 }, (_, id) => ({ id }));
    const pages: number[] = [];
    const rows = await readAllPages(async (from, to) => { pages.push(from); return { data: all.slice(from, to + 1), error: null }; });
    expect(rows).toEqual(all);
    expect(pages).toEqual([0, 500, 1000]);
  });
  it('never returns a partial collection when a later page fails', async () => {
    const error = { code: '57014', message: 'statement timeout' };
    await expect(readAllPages(async from => from === 0 ? { data: [1, 2], error: null } : { data: null, error }, 2)).rejects.toBe(error);
  });
  it('does not keep data after authorization or schema errors', () => {
    for (const code of ['42501', 'PGRST301', 'PGRST302', '42P01']) expect(isTransientStoreRead({ code, message: 'denied' })).toBe(false);
  });
  it('recognizes temporary timeouts and network failures', () => {
    expect(isTransientStoreRead({ code: '57014' })).toBe(true);
    expect(isTransientStoreRead(new TypeError('Failed to fetch'))).toBe(true);
    expect(isTransientStoreRead({ status: 503 })).toBe(true);
  });
  it('settles at the deadline even when a client ignores abort', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const pending = readAllPages<number>((_from, _to, s) => { signal = s; return new Promise(() => {}); }, 500, 20);
    const rejected = expect(pending).rejects.toMatchObject({ code: '57014' });
    await vi.advanceTimersByTimeAsync(20);
    await rejected;
    expect(signal?.aborted).toBe(true);
    vi.useRealTimers();
  });
  it('clears the deadline after a successful read', async () => {
    vi.useFakeTimers();
    await readAllPages(async () => ({ data: [], error: null }));
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

});
