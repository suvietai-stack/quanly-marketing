import { describe, it, expect, vi } from 'vitest';
import { withDeadline, retryLeaveRead, leaveReadMessage, LeaveTimeoutError, readLeave, LeaveReadError } from './readPolicy';

describe('leave read policy', () => {
  it('resolves fast reads, including empty lists', async () => {
    expect(await withDeadline(async () => [], undefined, 50)).toEqual([]);
  });
  it('a hung request rejects with a timeout after the deadline and aborts its signal', async () => {
    let seen: AbortSignal | undefined;
    const p = withDeadline((s) => { seen = s; return new Promise(() => {}); }, undefined, 30);
    await expect(p).rejects.toBeInstanceOf(LeaveTimeoutError);
    expect(seen?.aborted).toBe(true);
  });
  it('caller abort (route change / sign-out) aborts the request signal', async () => {
    const outer = new AbortController(); let seen: AbortSignal | undefined;
    const p = withDeadline((s) => { seen = s; return new Promise((_, rej) => s.addEventListener('abort', () => rej(new Error('aborted')))); }, outer.signal, 10_000);
    outer.abort();
    await expect(p).rejects.toThrow('aborted');
    expect(seen?.aborted).toBe(true);
  });
  it('retries 57014, timeout and 5xx at most twice', () => {
    expect(retryLeaveRead(0, { code: '57014' })).toBe(true);
    expect(retryLeaveRead(1, new LeaveTimeoutError())).toBe(false);
    expect(retryLeaveRead(0, { status: 503 })).toBe(true);
    expect(retryLeaveRead(2, { code: '57014' })).toBe(false);
  });
  it('never retries 401/403/42501', () => {
    expect(retryLeaveRead(0, { status: 401 })).toBe(false);
    expect(retryLeaveRead(0, { status: 403 })).toBe(false);
    expect(retryLeaveRead(0, { code: '42501' })).toBe(false);
  });
  it('rejects an already cancelled actor/route without starting the read', async () => {
    const outer = new AbortController(); outer.abort(); const run = vi.fn();
    await expect(withDeadline(run, outer.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(run).not.toHaveBeenCalled();
  });
  it('caller cancellation settles even when the SDK promise ignores abort', async () => {
    const outer = new AbortController();
    const pending = withDeadline(() => new Promise(() => {}), outer.signal);
    outer.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(retryLeaveRead(0, new DOMException('cancelled', 'AbortError'))).toBe(false);
  });
  it('maps permission and timeout errors to explicit messages', () => {
    expect(leaveReadMessage({ code: '42501' })).toMatch(/từ chối quyền/);
    expect(leaveReadMessage({ code: '57014' })).toMatch(/quá lâu/);
  });
});
it('retains HTTP status, operation and duration without exposing response details', async () => {
  let failure: unknown;
  try { await readLeave('Danh sách đơn', async () => ({data:null,error:{code:'42501',message:'denied'},status:403})); } catch(e) { failure=e; }
  expect(failure).toBeInstanceOf(LeaveReadError);
  expect(retryLeaveRead(0,failure)).toBe(false);
  expect(leaveReadMessage(failure)).toContain('HTTP 403');
  expect(leaveReadMessage(failure)).toContain('Danh sách đơn');
});
vi.useRealTimers();
