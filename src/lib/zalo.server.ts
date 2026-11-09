// Chỉ chạy phía máy chủ. Không log token / SĐT / nội dung khách hàng.
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { rotationResponse, retryDelay } from "./zaloToken";
import { sendConsultation, sendErrorGroup, sendRetryable } from "./zaloSend";

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
    signal: AbortSignal.timeout(15000),
  });
  const j: any = await res.json().catch(() => ({}));
  const result = rotationResponse(j);
  if (!result) throw new Error(`Zalo từ chối cấp token (${Number(j.error ?? res.status) || res.status})`);
  return result;
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
export async function getAccessToken(force = false): Promise<string | null> {
  const { accessToken } = await import("./zaloToken.server");
  return accessToken({ db: admin, config: getConfig, env: zaloEnv }, force);
}

/** The existing hourly schedule invokes this independently of open browsers. */
export async function maintainOa() {
  await saveConfig({ scheduler_last_at: new Date().toISOString() });
  await getAccessToken();
  return { checked: true };
}

export async function checkConnection() {
  const token = await getAccessToken();
  if (!token) return { ok: false, message: "Chưa kết nối hoặc kết nối đã hết hiệu lực" };
  let j = await refreshOaInfo(token);
  if ([-216, -220].includes(Number(j.error))) { const renewed = await getAccessToken(true); if (renewed) j = await refreshOaInfo(renewed); }
  return j.error === 0 ? { ok: true, message: `Kết nối tốt: ${j.data?.name ?? "OA"}` } : { ok: false, message: `Zalo trả lỗi ${j.error}: ${j.message ?? ""}` };
}

/** Gửi tin tư vấn văn bản; không chuyển loại tin hoặc retry kết quả chưa rõ. */
export async function sendCs(zaloUserId: string, text: string, link: string, opts: { header?: string; button?: string } = {}) {
  const header = opts.header ?? await brandHeader();
  const button = opts.button ?? "XEM TÍN HIỆU";
  const r = await sendConsultation(zaloUserId, text, link, header, button, getAccessToken);
  // Preserve OAuth state/tokens. Only send diagnostics use this existing field.
  const cfg = await getConfig();
  if (!r.ok) await saveConfig({ last_error: `Gửi tin thất bại (${r.code}) · ${sendErrorGroup(r.code)}` }).catch(() => {});
  else if (cfg?.last_error?.startsWith("Gửi tin thất bại")) await saveConfig({ last_error: null }).catch(() => {});
  return r;
}

/** Tin kiểm thử — không dùng dữ liệu khách hàng, không tạo sự kiện tín hiệu. */
export function testMessage(now = new Date(), brand = "BASE MARKETING") {
  const t = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
  return {
    header: `🧪 ${brand} — TIN KIỂM THỬ`,
    text: `Đây là tin nhắn kiểm tra kết nối Zalo OA với ${brand}.\nNếu bạn nhận được tin này, kết nối gửi tin đang hoạt động.\n\nThời gian: ${t}`,
    button: "MỞ BASE",
  };
}

/** Dựng nội dung tin tín hiệu từ dữ liệu thật — dùng cho gửi tự động. */
export async function buildSignalMessage(kind: "signal_new" | "signal_assigned", signalId: string) {
  const { signalMessage } = await import("./signals/zaloMessage");
  const db = await admin();
  const { data: s } = await db.from("opportunity_signals")
    .select("customer_name,products,need_groups,need_group,source,detected_on,created_at,status").eq("id", signalId).maybeSingle();
  return { ...signalMessage(kind, s ?? {}, await brandHeader()), link: `${await baseUrl()}/signals?open=${signalId}` };
}

/** Khoảng chống gửi trùng khi gỡ rồi giao lại cùng một người trong thời gian ngắn. */
const REASSIGN_DEDUP_MS = 30 * 60 * 1000;
/** Bản ghi đã được nhận xử lý nhưng tiến trình chết giữa chừng quá lâu → không tự gửi lại (tránh trùng). */
const STUCK_MS = 10 * 60 * 1000;

/**
 * Xử lý hàng đợi: chỉ khi Admin đã bật gửi tự động. Không lặp vô hạn.
 * Khóa nguyên tử: mỗi bản ghi chỉ được "nhận" bởi đúng một tiến trình qua cập nhật có điều kiện
 * (zalo_attempts = giá trị cũ, trạng thái pending/failed). Tiến trình thua sẽ nhận 0 dòng và bỏ qua.
 */
const LEAVE_FRESH_MS = 30 * 60 * 1000;
export async function processPending(limit = 20) {
  const cfg = await getConfig();
  if (!cfg?.auto_send || cfg.status !== "connected" || !await getAccessToken()) return { processed: 0 };
  const db = await admin();
  await saveConfig({ queue_last_at: new Date().toISOString() });
  // Phục hồi: bản ghi bị "nhận" (attempts tăng, vẫn pending) mà treo quá lâu → đánh dấu lỗi, chờ Admin gửi lại thủ công
  await db.from("notifications").update({ zalo_status: "failed", zalo_attempts: MAX_ATTEMPTS, zalo_error: "Tiến trình gửi bị gián đoạn — không rõ đã gửi, cần kiểm tra trước khi gửi lại" })
    .eq("zalo_status", "pending").gt("zalo_attempts", 0).neq("kind", "signal_care").is("zalo_sent_at", null)
    .lt("zalo_next_attempt_at", new Date().toISOString()).like("zalo_error", "claimed:%");
  const leaveZalo = (await leaveNotifyCfg()).zalo;
  const cz = await contentZaloCfg();
  const kinds = ["signal_new", "signal_assigned", ...(leaveZalo ? ["leave_pending", "leave_result", "leave_cancel_request", "leave_cc", "att_witness", "att_new"] : []), ...Object.keys(cz).filter((k) => cz[k])];
  const oz = await orderZaloCfg(); kinds.push(...Object.keys(oz).filter((k) => oz[k]));
  kinds.push("oq_new", "oq_info", "oq_answered", "oq_published", "oq_done", "oq_reask", "oq_assigned");
  const { data: rows } = await db.from("notifications").select("id,recipient_id,kind,signal_id,leave_request_id,attendance_id,content_id,order_id,oq_flow_id,created_at,zalo_attempts,zalo_status,payload")
    .in("zalo_status", ["pending", "failed"]).is("zalo_sent_at", null).or(`zalo_error.is.null,zalo_error.not.like.claimed:*`).or("zalo_status.eq.pending,and(zalo_error.like.*quota*,zalo_next_attempt_at.not.is.null)").or(`zalo_next_attempt_at.is.null,zalo_next_attempt_at.lte.${new Date().toISOString()}`).lt("zalo_attempts", MAX_ATTEMPTS).in("kind", kinds)
    .gt("created_at", new Date(Date.now() - 2 * 86400000).toISOString()).order("created_at").limit(limit);
  let processed = 0;
  for (const n of rows ?? []) {
    const claim = `claimed:${crypto.randomUUID()}`;
    // CLAIM nguyên tử
    const { data: got } = await db.from("notifications")
      .update({ zalo_status: "pending", zalo_attempts: n.zalo_attempts + 1, zalo_error: claim, zalo_next_attempt_at: new Date(Date.now() + STUCK_MS).toISOString() })
      .eq("id", n.id).eq("zalo_attempts", n.zalo_attempts).eq("zalo_status", n.zalo_status).or("zalo_error.is.null,zalo_error.not.like.claimed:*").is("zalo_sent_at", null).select("id");
    if (!got?.length) continue;
    const attempts = n.zalo_attempts + 1;
    const mark = (patch: Record<string, unknown>) => db.from("notifications").update({ zalo_next_attempt_at: null, ...patch }).eq("id", n.id).eq("zalo_error", claim).eq("zalo_attempts", attempts).is("zalo_sent_at", null);
    // Kiểm lại người nhận còn đúng (Sale có thể đã bị chuyển)
    if (n.kind === "signal_assigned") {
      const { data: s } = await db.from("opportunity_signals").select("assigned_to").eq("id", n.signal_id).maybeSingle();
      if (!s || s.assigned_to !== n.recipient_id) { await mark({ zalo_status: "ineligible", zalo_error: "Tín hiệu đã chuyển người khác" }); continue; }
    }
    if (n.kind === "signal_new") {
      const { data: s } = await db.from("opportunity_signals").select("assigned_to,cancelled_at").eq("id", n.signal_id).maybeSingle();
      if (!s || s.assigned_to || s.cancelled_at) { await mark({ zalo_status: "ineligible", zalo_error: "Tín hiệu đã được phân công/hủy" }); continue; }
    }
    let leaveMsg: { header: string; text: string; button: string; link: string } | null = null;
    if (n.kind.startsWith("leave_")) {
      const { data: r } = await db.from("leave_requests").select("*").eq("id", n.leave_request_id).maybeSingle();
      const stale = !r
        || (n.kind === "leave_pending" && (r.status !== "pending" || r.approver_id !== n.recipient_id))
        || (n.kind === "leave_cancel_request" && (r.cancel_state !== "requested" || r.approver_id !== n.recipient_id))
        || (n.kind === "leave_cc" && r.status !== (n.payload?.action === "cancel_approve" ? "cancelled" : "approved"));
      // Tin đơn từ chỉ gửi khi còn "nóng" (≤ 30 phút sau khi phát sinh) — không đẩy dồn tin cũ
      if (!stale && Date.now() - new Date(n.created_at).getTime() > LEAVE_FRESH_MS) { await mark({ zalo_status: "ineligible", zalo_error: "Quá 30 phút — không gửi tự động tin cũ" }); continue; }
      if (stale) { await mark({ zalo_status: "ineligible", zalo_error: "Đơn đã được xử lý/chuyển người duyệt" }); continue; }
      const { data: p } = await db.from("profiles").select("full_name").eq("id", r.owner_id).maybeSingle();
      const { leaveMessage } = await import("./leave/zaloMessage");
      leaveMsg = { ...leaveMessage(n.kind, { ...r, owner_name: p?.full_name, action: n.payload?.action, approver_name: n.payload?.approver_name }, await brandHeader()), link: `${await baseUrl()}/leave?open=${r.id}` };
    }
    if (n.kind.startsWith("att_")) {
      const { data: a } = await db.from("attendance_explanations").select("*").eq("id", n.attendance_id).maybeSingle();
      const stale = !a || a.recalled || (n.kind === "att_witness" && (a.witness_id !== n.recipient_id || a.witness_status !== "pending"));
      if (stale) { await mark({ zalo_status: "ineligible", zalo_error: "Giải trình đã thu hồi/đã xử lý" }); continue; }
      if (Date.now() - new Date(n.created_at).getTime() > LEAVE_FRESH_MS) { await mark({ zalo_status: "ineligible", zalo_error: "Quá 30 phút — không gửi tự động tin cũ" }); continue; }
      const { attMessage } = await import("./leave/attendance");
      const names = await db.from("profiles").select("id,full_name").in("id", [a.owner_id, a.witness_id]);
      const nm = (id: string) => (names.data ?? []).find((x: any) => x.id === id)?.full_name;
      leaveMsg = { ...attMessage(n.kind as "att_witness" | "att_new", { ...a, owner_name: nm(a.owner_id), witness_name: nm(a.witness_id), action: n.payload?.action }, await brandHeader()), link: `${await baseUrl()}/attendance?att=${a.id}` };
    }
    if (n.kind.startsWith("content_")) {
      const { data: c } = await db.from("web_contents").select("data").eq("id", n.content_id).maybeSingle();
      const { contentStillValid, contentZaloMessage, contentLink, contentCurrentRecipients, nameMatches } = await import("./content/notifyMessage");
      if (!c || !contentStillValid(n.kind, n.payload?.status, c.data?.status)) { await mark({ zalo_status: "ineligible", zalo_error: "Bài viết đã được xử lý/đổi trạng thái" }); continue; }
      { const { data: rp } = await db.from("profiles").select("full_name,username").eq("id", n.recipient_id).maybeSingle();
        if (!nameMatches(contentCurrentRecipients(n.kind, c.data ?? {}), rp)) { await mark({ zalo_status: "ineligible", zalo_error: "Người nhận không còn phụ trách bài" }); continue; } }
      if (Date.now() - new Date(n.created_at).getTime() > LEAVE_FRESH_MS) { await mark({ zalo_status: "ineligible", zalo_error: "Quá 30 phút — không gửi tự động tin cũ" }); continue; }
      leaveMsg = { ...contentZaloMessage(n.kind, { ...n.payload, title: c.data?.title ?? n.payload?.title }, await brandHeader()), link: `${await baseUrl()}${contentLink(n.content_id)}` };
    }
    if (n.kind.startsWith("order_")) {
      const { data: o } = await db.from("orders").select("data").eq("id", n.order_id).maybeSingle();
      const { orderStillValid, orderZaloMessage, orderLink, orderCurrentRecipients } = await import("./orders/notifyMessage");
      const { nameMatches } = await import("./content/notifyMessage");
      if (!o || !orderStillValid(n.kind, n.payload?.status, o.data, n.payload?.assignee)) { await mark({ zalo_status: "ineligible", zalo_error: "Order đã được xử lý/đổi người" }); continue; }
      { const names = orderCurrentRecipients(n.kind, o.data ?? {});
        if (names) { const { data: rp } = await db.from("profiles").select("full_name,username").eq("id", n.recipient_id).maybeSingle();
          if (!nameMatches(names, rp)) { await mark({ zalo_status: "ineligible", zalo_error: "Người nhận không còn phụ trách order" }); continue; } } }
      if (Date.now() - new Date(n.created_at).getTime() > LEAVE_FRESH_MS) { await mark({ zalo_status: "ineligible", zalo_error: "Quá 30 phút — không gửi tự động tin cũ" }); continue; }
      leaveMsg = { ...orderZaloMessage(n.kind, { ...n.payload, title: o.data?.title ?? n.payload?.title }, await brandHeader()), link: `${await baseUrl()}${orderLink(n.order_id)}` };
    }
    if (n.kind.startsWith("oq_")) {
      const { data: f } = await db.from("oq_flows").select("request_id,assignee_id,status,waiting_info").eq("id", n.oq_flow_id).maybeSingle();
      const { data: rq } = f ? await db.from("oq_requests").select("creator_id,status").eq("id", f.request_id).maybeSingle() : { data: null };
      const { oqStillValid, oqZaloMessage, oqLink } = await import("./orderQuotes/notify");
      const { data: sib } = f && n.payload?.both ? await db.from("oq_flows").select("assignee_id,status,waiting_info").eq("request_id", f.request_id) : { data: null };
      if (!oqStillValid(n.kind, n.recipient_id, f, rq, n.payload, sib ?? undefined)) { await mark({ zalo_status: "ineligible", zalo_error: "Yêu cầu đã được xử lý/đổi người phụ trách" }); continue; }
      if (Date.now() - new Date(n.created_at).getTime() > LEAVE_FRESH_MS) { await mark({ zalo_status: "ineligible", zalo_error: "Quá 30 phút — không gửi tự động tin cũ" }); continue; }
      leaveMsg = { ...oqZaloMessage(n.kind, n.payload ?? {}, await brandHeader()), link: `${await baseUrl()}${oqLink(f.request_id, n.payload?.both ? null : n.oq_flow_id)}` };
    }
    const { data: link } = await db.from("zalo_links").select("zalo_user_id,status").eq("user_id", n.recipient_id).maybeSingle();
    if (!link || link.status !== "active") { await mark({ zalo_status: "ineligible", zalo_error: "Chưa liên kết Zalo" }); continue; }
    if (n.kind === "signal_assigned") {
      const { data: dup } = await db.from("notifications").select("id").eq("kind", "signal_assigned").eq("signal_id", n.signal_id)
        .eq("recipient_id", n.recipient_id).eq("zalo_status", "sent").gt("zalo_sent_at", new Date(Date.now() - REASSIGN_DEDUP_MS).toISOString()).limit(1);
      if (dup?.length) { await mark({ zalo_status: "ineligible", zalo_error: "Đã gửi tin giao tín hiệu này gần đây" }); continue; }
    }
    const m = leaveMsg ?? await buildSignalMessage(n.kind as "signal_new" | "signal_assigned", n.signal_id);
    const r = await sendCs(link.zalo_user_id, m.text, m.link, { header: m.header, button: m.button });
    processed++;
    if (r.ok) {
      await mark({ zalo_status: "sent", zalo_sent_at: new Date().toISOString(), zalo_error: null, payload: { ...(n.payload ?? {}), zalo_message_id: r.messageId ?? null } });
    } else if (r.ambiguous) {
      // Không rõ đã gửi hay chưa → dừng tự động, không retry mù
      await mark({ zalo_status: "failed", zalo_attempts: MAX_ATTEMPTS, zalo_error: `${r.code}: ${r.message}` });
    } else {
      const ineligible = sendErrorGroup(r.code) === "recipient";
      const retry = sendRetryable(r) && attempts < MAX_ATTEMPTS;
      await mark({ zalo_status: ineligible ? "ineligible" : "failed", zalo_error: `${r.code}: ${r.message}`, zalo_attempts: retry ? attempts : MAX_ATTEMPTS, zalo_next_attempt_at: retry ? new Date(Date.now() + retryDelay(attempts)).toISOString() : null });
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

/* ---------- Nhắc chăm sóc tín hiệu (tổng hợp mỗi ngày) ---------- */
const vnDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
const vnHour = (d = new Date()) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hour12: false }).format(d)) % 24;

/** Chạy theo lịch mỗi giờ; chỉ làm việc đúng giờ đã cài và 1 lần/ngày. */
export async function runCareDigest() {
  const cfg: any = await getConfig();
  if (!cfg?.care_enabled) return { skipped: "disabled" };
  const today = vnDate();
  if (vnHour() !== (cfg?.care_hour ?? 9) || cfg?.care_last_run === today) return { skipped: "not_time" };
  const db = await admin();
  await saveConfig({ care_last_run: today });
  const { careFlag, countCare, careMessage } = await import("./signals/care");
  const ccfg = { waitHours: cfg?.care_wait_hours ?? 24, staleDays: cfg?.care_stale_days ?? 3 };
  const { data: sigs } = await db.from("opportunity_signals").select("id,status,assigned_to,assigned_at,cancelled_at")
    .not("assigned_to", "is", null).is("cancelled_at", null).in("status", ["waiting", "contacting", "consulting", "quoted", "deposit"]).limit(5000);
  const notesBy: Record<string, any[]> = {};
  const flagsBy: Record<string, any[]> = {};
  for (const s of sigs ?? []) { const f = careFlag(s, notesBy[s.id] ?? [], Date.now(), ccfg); if (f) (flagsBy[s.assigned_to] ??= []).push(f); }
  let created = 0, sent = 0;
  const canSend = cfg?.status === "connected";
  for (const [uid, flags] of Object.entries(flagsBy)) {
    const c = countCare(flags);
    const { data: ins } = await db.from("notifications").upsert(
      { recipient_id: uid, kind: "signal_care", signal_id: null, payload: c, dedup_key: `care:${today}:${uid}` },
      { onConflict: "dedup_key", ignoreDuplicates: true }).select("id");
    const row = ins?.[0]; if (!row) continue; // đã có hôm nay → không trùng
    created++;
    const { data: link } = await db.from("zalo_links").select("zalo_user_id,status").eq("user_id", uid).maybeSingle();
    if (!canSend || !link || link.status !== "active") {
      await db.from("notifications").update({ zalo_status: "ineligible", zalo_error: !canSend ? "OA chưa kết nối" : "Chưa liên kết Zalo" }).eq("id", row.id);
      continue;
    }
    const { data: p } = await db.from("profiles").select("full_name").eq("id", uid).maybeSingle();
    const r = await sendCs(link.zalo_user_id, careMessage(p?.full_name || "bạn", c), `${await baseUrl()}/signals?care=1`, { header: await brandHeader() });
    if (r.ok) sent++;
    // Chỉ thử 1 lần — không gửi lại liên tục
    await db.from("notifications").update(r.ok
      ? { zalo_status: "sent", zalo_sent_at: new Date().toISOString(), zalo_attempts: 1 }
      : { zalo_status: sendErrorGroup(r.code) === "recipient" ? "ineligible" : "failed", zalo_error: `${r.code}: ${r.message}`, zalo_attempts: MAX_ATTEMPTS }).eq("id", row.id);
  }
  return { created, sent };
}

/* ---------- Đơn từ: cấu hình thông báo + nhắc duyệt ---------- */
/** Công tắc Zalo theo từng sự kiện Content Web (không ảnh hưởng thông báo nội bộ). */
export async function contentZaloCfg(): Promise<Record<string, boolean>> {
  const db = await admin();
  const { data } = await db.from("content_notify_settings").select("data").eq("id", 1).maybeSingle();
  const z = data?.data?.zalo ?? {};
  const out: Record<string, boolean> = {};
  for (const k of ["content_assigned", "content_review", "content_revise", "content_approved", "content_published", "content_remind"]) out[k] = z[k] === true;
  return out;
}

export async function orderZaloCfg(): Promise<Record<string, boolean>> {
  const db = await admin();
  const { data } = await db.from("content_notify_settings").select("data").eq("id", 1).maybeSingle();
  const z = data?.data?.order?.zalo ?? {};
  const out: Record<string, boolean> = {};
  for (const k of ["order_new", "order_assigned", "order_taken", "order_review", "order_revise", "order_approved", "order_delivered", "order_remind"]) out[k] = z[k] === true;
  return out;
}

export async function leaveNotifyCfg(): Promise<{ zalo: boolean; remind_hours: number }> {
  const db = await admin();
  const { data } = await db.from("leave_settings").select("data").eq("id", 1).maybeSingle();
  const n = data?.data?.notify ?? {};
  return { zalo: n.zalo === true, remind_hours: Number(n.remind_hours) > 0 ? Number(n.remind_hours) : 4 };
}

/** Chạy mỗi giờ; chỉ trong 08:00–17:59 giờ VN; mỗi người duyệt tối đa 1 tin nhắc/ngày (gộp nhiều đơn). */
export async function runLeaveRemind() {
  const h = vnHour();
  if (h < 8 || h > 17) return { skipped: "off_hours" };
  const lc = await leaveNotifyCfg();
  const db = await admin();
  const { needsRemind, remindMessage } = await import("./leave/zaloMessage");
  const { data: reqs } = await db.from("leave_requests").select("id,status,submitted_at,mark_at,approver_id").eq("status", "pending").limit(2000);
  const by: Record<string, { ids: string[]; soon: number }> = {};
  for (const r of reqs ?? []) {
    const x = needsRemind(r, lc.remind_hours);
    if (!x.remind) continue;
    const g = (by[r.approver_id] ??= { ids: [], soon: 0 });
    g.ids.push(r.id); if (x.soon) g.soon++;
  }
  const today = vnDate();
  const cfg: any = await getConfig();
  const canSend = lc.zalo && cfg?.status === "connected";
  let created = 0, sent = 0;
  for (const [uid, g] of Object.entries(by)) {
    const { data: ins } = await db.from("notifications").upsert(
      { recipient_id: uid, kind: "leave_remind", payload: { count: g.ids.length, soon: g.soon, ids: g.ids }, dedup_key: `leave_remind:${today}:${uid}` },
      { onConflict: "dedup_key", ignoreDuplicates: true }).select("id");
    const row = ins?.[0]; if (!row) continue;
    created++;
    const { data: link } = await db.from("zalo_links").select("zalo_user_id,status").eq("user_id", uid).maybeSingle();
    if (!canSend || !link || link.status !== "active") {
      await db.from("notifications").update({ zalo_status: "ineligible", zalo_error: !canSend ? "Chưa bật Zalo cho đơn từ" : "Chưa liên kết Zalo" }).eq("id", row.id);
      continue;
    }
    const m = remindMessage(g.ids.length, g.soon, await brandHeader());
    const r = await sendCs(link.zalo_user_id, m.text, `${await baseUrl()}/leave?tab=approve`, { header: m.header, button: m.button });
    if (r.ok) sent++;
    await db.from("notifications").update(r.ok
      ? { zalo_status: "sent", zalo_sent_at: new Date().toISOString(), zalo_attempts: 1 }
      : { zalo_status: sendErrorGroup(r.code) === "recipient" ? "ineligible" : "failed", zalo_error: `${r.code}: ${r.message}`, zalo_attempts: MAX_ATTEMPTS }).eq("id", row.id);
  }
  return { created, sent };
}

/** Tên thương hiệu viết hoa cho đầu tin Zalo — đọc từ Cài đặt → Thông tin hệ thống; lỗi thì dùng mặc định. */
export async function brandHeader(): Promise<string> {
  try {
    const { data } = await (await admin()).from("app_branding").select("app_name").eq("id", 1).maybeSingle();
    const n = String(data?.app_name ?? "").trim();
    return n ? n.toUpperCase() : "BASE MARKETING";
  } catch { return "BASE MARKETING"; }
}

/** Nhắc bài chờ duyệt (tắt mặc định): tạo thông báo nội bộ; Zalo/Push đi qua hàng đợi hiện có. */
export async function runContentRemind() {
  const h = vnHour();
  if (h < 8 || h > 17) return { skipped: "off_hours" };
  const db = await admin();
  const a = await db.rpc("content_remind_run");
  const b = await db.rpc("order_remind_run");
  return { content: a.error ? "failed" : a.data ?? 0, order: b.error ? "failed" : b.data ?? 0 };
}
