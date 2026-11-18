/**
 * Presence is a hint for activity display, not a security or authorization gate.
 * Hidden tabs must not write to the employee profile solely because a timer fired.
 */
export const PRESENCE_HEARTBEAT_MS = 120_000;
export function shouldTouchPresence(lastAttemptAt: number, now: number, visible: boolean): boolean {
  if (!visible || !Number.isFinite(now)) return false;
  return lastAttemptAt <= 0 || now < lastAttemptAt || now - lastAttemptAt >= PRESENCE_HEARTBEAT_MS;
}
