export const REFRESH_AHEAD_MS = 2 * 60 * 60_000;
export const REFRESH_TIMEOUT_MS = 15_000;
export function retryDelay(attempt: number) { return Math.min(60 * 60_000, 60_000 * 2 ** Math.max(0, attempt - 1)); }
export function tokenUsable(c: any, now = Date.now()) {
  return c?.status === "connected" && !!c.access_token && !c.refresh_blocked && Date.parse(c.token_expires_at) > now + 30_000;
}
export function refreshDue(c: any, now = Date.now()) {
  if (c?.refresh_blocked || c?.status !== "connected") return false;
  if (c.refresh_next_at && Date.parse(c.refresh_next_at) > now) return false;
  return !c.token_expires_at || Date.parse(c.token_expires_at) <= now + REFRESH_AHEAD_MS;
}
export function rotationResponse(j: any, now = Date.now()) {
  const seconds = Number(j?.expires_in);
  if (typeof j?.access_token !== "string" || j.access_token.length < 10 || typeof j.refresh_token !== "string" || j.refresh_token.length < 10 || !Number.isFinite(seconds) || seconds <= 0) return null;
  return { access_token: j.access_token, refresh_token: j.refresh_token, token_expires_at: new Date(now + seconds * 1000).toISOString() };
}