import { refreshDue, REFRESH_TIMEOUT_MS, retryDelay, rotationResponse, tokenUsable } from "./zaloToken";

export async function accessToken(deps: { db: () => Promise<any>; config: () => Promise<any>; env: () => Promise<{ appId: string; appSecret: string }> }, force = false): Promise<string | null> {
  let c = await deps.config();
  if (!c || c.status !== "connected" || c.refresh_blocked) return null;
  const db = await deps.db();
  if (c.refresh_lease) {
    // A rotating single-use token must never be reclaimed after a lost response.
    if (Date.now() - Date.parse(c.refresh_started_at) > 60_000) {
      await db.from("zalo_oa_config").update({ refresh_blocked: true, refresh_error: "Gia hạn bị gián đoạn, chưa xác định Zalo đã xoay khóa; cần kiểm tra hoặc cấp quyền lại." }).eq("id", 1).eq("token_version", c.token_version).eq("refresh_lease", c.refresh_lease);
      return null;
    }
    for (let i = 0; i < 16; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      c = await deps.config();
      if (!c?.refresh_lease) return tokenUsable(c) ? c.access_token : null;
      if (c.refresh_blocked) return null;
    }
    return null;
  }
  if (!force && !refreshDue(c)) return tokenUsable(c) ? c.access_token : null;
  if (!c.refresh_token || String(c.refresh_token).startsWith("claim:")) {
    await db.from("zalo_oa_config").update({ refresh_blocked: true, status: "expired", refresh_error: "Không còn Refresh Token hợp lệ — cần cấp quyền lại OA." }).eq("id", 1).eq("token_version", c.token_version);
    return null;
  }
  const lease = crypto.randomUUID();
  const { data: claimed, error } = await db.rpc("zalo_refresh_claim", { p_version: c.token_version, p_lease: lease });
  if (error) throw new Error("Không khóa được phiên gia hạn Zalo");
  if (!claimed) return accessToken(deps, false);
  const fenced = (patch: Record<string, unknown>) => db.from("zalo_oa_config").update(patch).eq("id", 1).eq("token_version", c.token_version).eq("refresh_lease", lease);
  let res: Response;
  try {
    const env = await deps.env();
    res = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", secret_key: env.appSecret },
      body: new URLSearchParams({ app_id: env.appId, refresh_token: c.refresh_token, grant_type: "refresh_token" }), signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
  } catch {
    await fenced({ refresh_blocked: true, refresh_error: "Mất phản hồi gia hạn: chưa rõ Zalo đã xoay Token; dừng để tránh dùng lại Token một lần." });
    return null;
  }
  const j: any = await res.json().catch(() => null);
  const t = rotationResponse(j);
  if (t) {
    const { data: committed, error: commitError } = await db.rpc("zalo_refresh_finish", { p_version: c.token_version, p_lease: lease, p_access: t.access_token, p_refresh: t.refresh_token, p_expires: t.token_expires_at });
    if (commitError) throw new Error("Zalo đã gia hạn nhưng chưa xác nhận lưu Token; dừng gửi để kiểm tra");
    if (committed) return t.access_token;
    const latest = await deps.config();
    return tokenUsable(latest) ? latest.access_token : null;
  }
  const failures = c.refresh_failures + 1;
  // Only a definite throttling rejection is automatically retryable. Unknown rotation outcomes aren't.
  if (res.status === 429 && !j?.access_token) {
    await fenced({ refresh_lease: null, refresh_started_at: null, refresh_failures: failures, refresh_next_at: new Date(Date.now() + retryDelay(failures)).toISOString(), refresh_blocked: failures >= 5, refresh_error: "Zalo giới hạn gia hạn; đang chờ thử lại có giới hạn." });
    return tokenUsable(c) && !force ? c.access_token : null;
  }
  const revoked = j?.error_name === "invalid_grant" || j?.error === "invalid_grant";
  await fenced({ refresh_blocked: true, refresh_failures: failures, ...(revoked ? { status: "expired" } : {}), refresh_error: revoked ? "Zalo từ chối Refresh Token (invalid_grant) — cần cấp quyền lại." : `Zalo từ chối hoặc trả phản hồi gia hạn không hợp lệ (${Number(j?.error ?? res.status) || res.status}); cần kiểm tra, không tự dùng lại Token.` });
  return null;
}