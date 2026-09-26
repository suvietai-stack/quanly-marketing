// Chỉ chạy phía máy chủ. Không log token / SĐT / nội dung khách hàng.
import { createHash, randomBytes, timingSafeEqual } from "crypto";

// Địa chỉ backend cố định trên tên miền của Sứ Việt (Zalo yêu cầu domain đã xác thực) — dùng cho OAuth Callback / Webhook.
// Không đổi theo "Đường dẫn ứng dụng Base" để redirect_uri luôn khớp với khai báo trên Zalo Developers.
export const BACKEND_URL = "https://base.suviet.vn";
export const CALLBACK_URL = `${BACKEND_URL}/api/public/zalo/oauth-callback`;
export const WEBHOOK_URL = `${BACKEND_URL}/api/public/zalo/webhook`;
export const DEFAULT_BASE_URL = "https://base.suviet.vn";

/** Chỉ chấp nhận https + tên miền, không path/query — tránh chuyển hướng độc hại. */
export function normalizeBaseUrl(v: string): string | null {
  try {
    const u = new URL(v.trim());
    if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)) return null;
    if ((u.pathname && u.pathname !== "/") || u.search || u.hash) return null;
    return `https://${u.hostname.toLowerCase()}`;
  } catch { return null; }
}
export async function baseUrl() {
  const cfg: any = await getConfig();
  return (cfg?.base_url && normalizeBaseUrl(cfg.base_url)) || DEFAULT_BASE_URL;
}
const MAX_ATTEMPTS = 3;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

/** Ưu tiên cấu hình Admin lưu ở bảng chỉ backend đọc được; dự phòng bằng Secrets. */
export async function zaloEnv() {
  const cfg: any = await getConfig();
  return {
    appId: cfg?.app_id || process.env["ZALO_APP_ID"] || "",
    appSecret: cfg?.app_secret || process.env["ZALO_APP_SECRET"] || "",
    oaSecret: cfg?.oa_secret_key || process.env["ZALO_OA_SECRET_KEY"] || "",
  };
}

export async function getConfig() {
  const db = await admin();
  const { data } = await db.from("zalo_oa_config").select("*").eq("id", 1).maybeSingle();
  return data as null | {
    oa_id: string | null; oa_name: string | null; access_token: string | null; refresh_token: string | null;
    token_expires_at: string | null; status: string; auto_send: boolean; oauth_state: string | null;
    oauth_verifier: string | null; last_error: string | null;
  };
}

export async function saveConfig(patch: Record<string, unknown>) {
  const db = await admin();
  const { error } = await db.from("zalo_oa_config").upsert({ id: 1, ...patch, updated_at: new Date().toISOString() });
  if (error) throw new Error("Không lưu được cấu hình Zalo");
}

const b64url = (b: Buffer) => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function buildConnectUrl() {
  const { appId, appSecret } = await zaloEnv();
  if (!appId || !appSecret) throw new Error("Chưa cấu hình App ID / App Secret");
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  const state = b64url(randomBytes(16));
  await saveConfig({ oauth_state: state, oauth_verifier: verifier });
  const q = new URLSearchParams({ app_id: appId, redirect_uri: CALLBACK_URL, code_challenge: challenge, state });
  return `https://oauth.zaloapp.com/v4/oa/permission?${q}`;
}

async function tokenRequest(body: Record<string, string>) {
  const { appId, appSecret } = await zaloEnv();
  const res = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", secret_key: appSecret },
    body: new URLSearchParams({ app_id: appId, ...body }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!j.access_token) throw new Error(`Zalo từ chối cấp token (${j.error ?? res.status})`);
  return {
    access_token: j.access_token as string,
    refresh_token: j.refresh_token as string,
    token_expires_at: new Date(Date.now() + (Number(j.expires_in) || 90000) * 1000).toISOString(),
  };
}

export async function exchangeCode(code: string, state: string) {
  const cfg = await getConfig();
  if (!cfg?.oauth_state || cfg.oauth_state !== state || !cfg.oauth_verifier) throw new Error("Phiên kết nối không hợp lệ");
  const t = await tokenRequest({ code, grant_type: "authorization_code", code_verifier: cfg.oauth_verifier });
  await saveConfig({ ...t, status: "connected", oauth_state: null, oauth_verifier: null, last_error: null });
  await refreshOaInfo(t.access_token);
}

async function refreshOaInfo(token: string) {
  const res = await fetch("https://openapi.zalo.me/v2.0/oa/getoa", { headers: { access_token: token } });
  const j: any = await res.json().catch(() => ({}));
  if (j.error === 0 && j.data) await saveConfig({ oa_id: String(j.data.oa_id ?? ""), oa_name: j.data.name ?? null });
  return j;
}

/** Trả token còn hiệu lực, tự làm mới nếu sắp hết hạn. */
export async function getAccessToken(): Promise<string | null> {
  const cfg = await getConfig();
  if (!cfg?.access_token || cfg.status !== "connected") return null;
  const exp = cfg.token_expires_at ? new Date(cfg.token_expires_at).getTime() : 0;
  if (exp - Date.now() > 10 * 60 * 1000) return cfg.access_token;
  if (!cfg.refresh_token) return null;
  const oldRefresh = cfg.refresh_token;
  try {
    // Giữ chỗ: chỉ một tiến trình được dùng refresh token này
    const db = await admin();
    const claim = `claim:${Date.now()}:${Math.random()}`;
    const { data: got } = await db.from("zalo_oa_config").update({ refresh_token: claim }).eq("id", 1).eq("refresh_token", oldRefresh).select("id");
    if (!got?.length) {
      await new Promise((r) => setTimeout(r, 1500));
      const again = await getConfig();
      return again?.status === "connected" && again.access_token && !String(again.refresh_token).startsWith("claim:") ? again.access_token : null;
    }
    const t = await tokenRequest({ refresh_token: oldRefresh, grant_type: "refresh_token" });
    await saveConfig({ ...t, last_error: null });
    return t.access_token;
  } catch {
    await saveConfig({ status: "expired", last_error: "Không làm mới được token — cần kết nối lại" });
    return null;
  }
}

export async function checkConnection() {
  const token = await getAccessToken();
  if (!token) return { ok: false, message: "Chưa kết nối hoặc kết nối đã hết hiệu lực" };
  const j = await refreshOaInfo(token);
  return j.error === 0 ? { ok: true, message: `Kết nối tốt: ${j.data?.name ?? "OA"}` } : { ok: false, message: `Zalo trả lỗi ${j.error}: ${j.message ?? ""}` };
}

/** Gửi tin Tư vấn (CS). Trả mã lỗi Zalo để phân loại. */
export async function sendCs(zaloUserId: string, text: string, link: string) {
  const token = await getAccessToken();
  if (!token) return { ok: false, code: -1, message: "Chưa kết nối OA" };
  const res = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: token },
    body: JSON.stringify({
      recipient: { user_id: zaloUserId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "promotion",
            elements: [{ type: "header", content: "BASE MARKETING" }, { type: "text", align: "left", content: text }],
            buttons: [{ title: "XEM TÍN HIỆU", type: "oa.open.url", payload: { url: link } }],
          },
        },
      },
    }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (j.error === 0) return { ok: true, code: 0, message: "" };
  // Dự phòng: tin văn bản thuần nếu mẫu có nút không được phép
  const r2 = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: token },
    body: JSON.stringify({ recipient: { user_id: zaloUserId }, message: { text: `BASE MARKETING\n\n${text}\n\nXem tín hiệu: ${link}` } }),
  });
  const j2: any = await r2.json().catch(() => ({}));
  if (j2.error === 0) return { ok: true, code: 0, message: "" };
  return { ok: false, code: Number(j2.error ?? j.error ?? -2), message: String(j2.message ?? j.message ?? "Lỗi gửi").slice(0, 200) };
}

const TEXT: Record<string, string> = {
  signal_new: "Có tín hiệu mới đang cần xử lý.",
  signal_assigned: "Bạn vừa được giao một tín hiệu cơ hội mới.",
};

/** Xử lý hàng đợi: chỉ khi Admin đã bật gửi tự động. Không lặp vô hạn. */
export async function processPending(limit = 20) {
  const cfg = await getConfig();
  if (!cfg?.auto_send || cfg.status !== "connected") return { processed: 0 };
  const db = await admin();
  const { data: rows } = await db.from("notifications").select("id,recipient_id,kind,signal_id,zalo_attempts,zalo_status")
    .in("zalo_status", ["pending", "failed"]).lt("zalo_attempts", MAX_ATTEMPTS).neq("kind", "signal_care")
    .gt("created_at", new Date(Date.now() - 2 * 86400000).toISOString()).order("created_at").limit(limit);
  let processed = 0;
  for (const n of rows ?? []) {
    // Kiểm lại người nhận còn đúng (Sale có thể đã bị chuyển)
    if (n.kind === "signal_assigned") {
      const { data: s } = await db.from("opportunity_signals").select("assigned_to").eq("id", n.signal_id).maybeSingle();
      if (!s || s.assigned_to !== n.recipient_id) {
        await db.from("notifications").update({ zalo_status: "ineligible", zalo_error: "Tín hiệu đã chuyển người khác" }).eq("id", n.id);
        continue;
      }
    }
    const { data: link } = await db.from("zalo_links").select("zalo_user_id,status").eq("user_id", n.recipient_id).maybeSingle();
    if (!link || link.status !== "active") {
      await db.from("notifications").update({ zalo_status: "ineligible", zalo_error: "Chưa liên kết Zalo" }).eq("id", n.id);
      continue;
    }
    const r = await sendCs(link.zalo_user_id, TEXT[n.kind] ?? "Có thông báo mới.", `${await baseUrl()}/signals?open=${n.signal_id}`);
    processed++;
    if (r.ok) {
      await db.from("notifications").update({ zalo_status: "sent", zalo_sent_at: new Date().toISOString(), zalo_error: null, zalo_attempts: n.zalo_attempts + 1 }).eq("id", n.id);
    } else {
      // -213/-230: người dùng chưa quan tâm OA / quá khung tương tác → không đủ điều kiện, không thử lại
      const ineligible = [-213, -230, -201].includes(r.code);
      if (!ineligible) await saveConfig({ last_error: `Gửi tin thất bại (${r.code})` }).catch(() => {});
      await db.from("notifications").update({
        zalo_status: ineligible ? "ineligible" : "failed", zalo_error: `${r.code}: ${r.message}`, zalo_attempts: n.zalo_attempts + 1,
      }).eq("id", n.id);
    }
  }
  return { processed };
}

/** Theo tài liệu Zalo: X-ZEvent-Signature = "mac=" + sha256(appId + rawBody + timestamp + OA Secret Key). */
export async function verifyWebhook(raw: string, signature: string | null, timestamp: string, bodyAppId = "") {
  const { appId, oaSecret } = await zaloEnv();
  if (!signature || !oaSecret || !timestamp) return false;
  if (bodyAppId && appId && bodyAppId !== appId) return false;
  const expected = "mac=" + createHash("sha256").update((appId || bodyAppId) + raw + timestamp + oaSecret).digest("hex");
  const a = (signature.startsWith("mac=") ? signature : "mac=" + signature).toLowerCase();
  if (a.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(expected));
}

export async function handleLinkMessage(zaloUserId: string, text: string) {
  const db = await admin();
  const code = (text.match(/\bBASE-([A-Z0-9]{6})\b/i)?.[0] ?? "").toUpperCase();
  const now = new Date().toISOString();
  // Mỗi tin nhắn từ nhân viên đã liên kết cập nhật thời điểm tương tác
  await db.from("zalo_links").update({ last_interaction_at: now, status: "active" }).eq("zalo_user_id", zaloUserId);
  if (!code) return null;
  const { data: row } = await db.from("zalo_link_codes").select("user_id,expires_at").eq("code", code).maybeSingle();
  if (!row || new Date(row.expires_at).getTime() < Date.now()) return "invalid";
  await db.from("zalo_link_codes").delete().eq("code", code);
  await db.from("zalo_links").delete().eq("zalo_user_id", zaloUserId);
  await db.from("zalo_links").upsert({ user_id: row.user_id, zalo_user_id: zaloUserId, status: "active", linked_at: now, last_interaction_at: now });
  return "linked";
}
