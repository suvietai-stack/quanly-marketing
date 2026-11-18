/** Heavy server-token reads should never poll every 30 seconds. */
export const SIGNAL_TOKEN_POLL_INTERVAL_MS = 90_000;

/** Only an observed server token change may invalidate scoped list reads. */
export function observedSignalChange(previous: string | undefined, next: string | undefined): boolean {
  return previous !== undefined && next !== undefined && previous !== next;
}