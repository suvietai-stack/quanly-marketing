// Bounded Leave reads: hung requests abort after LEAVE_READ_TIMEOUT_MS; only transient failures retry, finitely.
export const LEAVE_READ_TIMEOUT_MS = 12_000;

export class LeaveTimeoutError extends Error {
  code = 'LEAVE_TIMEOUT';
  constructor() { super('Máy chủ phản hồi quá lâu. Vui lòng thử lại.'); }
}

export class LeaveReadError extends Error {
  code?: string;
  status?: number;
  constructor(public operation: string, public durationMs: number, error: unknown, status?: number) {
    const e = error as { code?: string; message?: string };
    super(e?.message || 'Không tải được dữ liệu.');
    this.code = e?.code;
    this.status = status;
  }
}
export async function readLeave<T>(operation: string, run: (signal: AbortSignal) => PromiseLike<{ data: T; error: unknown; status?: number }>, outer?: AbortSignal): Promise<T> {
  const started = Date.now();
  try {
    const result = await withDeadline(run, outer);
    if (result.error) throw new LeaveReadError(operation, Date.now() - started, result.error, result.status);
    return result.data;
  } catch (error) {
    if (error instanceof LeaveReadError || (error as {name?:string})?.name === 'AbortError') throw error;
    throw new LeaveReadError(operation, Date.now() - started, error);
  }
}

/** Runs `run` with a signal that aborts on caller abort or after `ms`; a timeout rejects with LeaveTimeoutError. */
export async function withDeadline<T>(run: (signal: AbortSignal) => PromiseLike<T>, outer?: AbortSignal, ms = LEAVE_READ_TIMEOUT_MS): Promise<T> {
  const ctl = new AbortController();
  let timedOut = false;
  let rejectAbort: ((reason: unknown) => void) | undefined;
  const aborted = new Promise<never>((_, reject) => { rejectAbort = reject; });
  const onAbort = () => { ctl.abort(); rejectAbort?.(new DOMException('Request cancelled', 'AbortError')); };
  if (outer?.aborted) throw new DOMException('Request cancelled', 'AbortError');
  outer?.addEventListener('abort', onAbort, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { timedOut = true; ctl.abort(); reject(new LeaveTimeoutError()); }, ms); });
  try {
    return await Promise.race([Promise.resolve(run(ctl.signal)), deadline, aborted]);
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
  if ((error as { name?: string })?.name === 'AbortError' || e?.code === '42501' || e?.code === 'PGRST301' || e?.status === 401 || e?.status === 403) return false;
  // A client deadline must surface immediately; only completed transient server/network errors auto-retry.
  if (e?.code === 'LEAVE_TIMEOUT') return false;
  return e?.code === '57014' || /timeout|timed out|fetch|network/i.test(e?.message ?? '') || (e?.status ?? 0) >= 500;
}

export const leaveRetryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, 4000);

export function leaveReadMessage(error: unknown): string {
  const e = error as { code?: string; message?: string; status?: number };
  const message = e?.status === 401 || e?.code === 'PGRST301' ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'
    : e?.code === '42501' || e?.status === 403 ? 'Máy chủ từ chối quyền xem dữ liệu này. Vui lòng liên hệ Admin.'
    : e?.code === 'LEAVE_TIMEOUT' || e?.code === '57014' ? 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.'
    : e?.message || 'Không tải được dữ liệu.';
  return error instanceof LeaveReadError ? `${message} (${error.operation} · ${error.status ? `HTTP ${error.status} · ` : ''}${error.code ?? 'NETWORK'} · ${(error.durationMs / 1000).toFixed(1)} giây)` : message;
}
