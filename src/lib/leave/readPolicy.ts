// Bounded Leave reads: hung requests abort after LEAVE_READ_TIMEOUT_MS; only transient failures retry, finitely.
export const LEAVE_READ_TIMEOUT_MS = 12_000;

export class LeaveTimeoutError extends Error {
  code = 'LEAVE_TIMEOUT';
  constructor() { super('Máy chủ phản hồi quá lâu. Vui lòng thử lại.'); }
}

/** Runs `run` with a signal that aborts on caller abort or after `ms`; a timeout rejects with LeaveTimeoutError. */
export async function withDeadline<T>(run: (signal: AbortSignal) => PromiseLike<T>, outer?: AbortSignal, ms = LEAVE_READ_TIMEOUT_MS): Promise<T> {
  const ctl = new AbortController();
  let timedOut = false;
  const onAbort = () => ctl.abort();
  outer?.addEventListener('abort', onAbort, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { timedOut = true; ctl.abort(); reject(new LeaveTimeoutError()); }, ms); });
  try {
    return await Promise.race([Promise.resolve(run(ctl.signal)), deadline]);
  } catch (e) {
    if (timedOut) throw new LeaveTimeoutError();
    throw e;
  } finally {
    clearTimeout(timer);
    outer?.removeEventListener('abort', onAbort);
  }
}

export function retryLeaveRead(failures: number, error: unknown): boolean {
  if (failures >= 2) return false;
  const e = error as { code?: string; message?: string; status?: number };
  if (e?.code === '42501' || e?.code === 'PGRST301' || e?.status === 401 || e?.status === 403) return false;
  return e?.code === 'LEAVE_TIMEOUT' || e?.code === '57014' || /timeout|timed out|fetch|network/i.test(e?.message ?? '') || (e?.status ?? 0) >= 500;
}

export const leaveRetryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, 4000);

export function leaveReadMessage(error: unknown): string {
  const e = error as { code?: string; message?: string; status?: number };
  if (e?.code === '42501' || e?.status === 401 || e?.status === 403) return 'Bạn không có quyền xem dữ liệu này hoặc phiên đăng nhập đã hết hạn.';
  if (e?.code === 'LEAVE_TIMEOUT' || e?.code === '57014') return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';
  return e?.message || 'Không tải được dữ liệu.';
}
