export const SIGNAL_READ_TIMEOUT_MS = 15000;

/** Bound reads even if the transport never settles after cancellation. */
export async function signalRead<T>(run: (signal: AbortSignal) => PromiseLike<T>, parent?: AbortSignal, timeoutMs = SIGNAL_READ_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel: (() => void) | undefined;
  const stopped = new Promise<never>((_, reject) => {
    cancel = () => { controller.abort(); reject(new DOMException('Yêu cầu đã hủy', 'AbortError')); };
    if (parent?.aborted) { cancel(); return; }
    parent?.addEventListener('abort', cancel, { once: true });
    timer = setTimeout(() => { controller.abort(); reject(new Error('Tải Tín hiệu quá lâu. Vui lòng thử tải lại.')); }, timeoutMs);
  });
  try {
    if (controller.signal.aborted) return await stopped;
    return await Promise.race([Promise.resolve(run(controller.signal)), stopped]);
  } finally {
    clearTimeout(timer);
    if (cancel) parent?.removeEventListener('abort', cancel);
  }
}