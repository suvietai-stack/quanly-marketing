// Chỉ chạy phía máy chủ. Web Push độc lập với Zalo (cột push_status + bảng push_deliveries riêng).
import { buildPushPayload } from "@block65/webcrypto-web-push";
import { VAPID_PUBLIC_KEY } from "./push/config";
import { PUSH_KINDS, pushMessage, type PushKind } from "./push/message";

const FRESH_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 3;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export async function pushToken(): Promise<string> {
  const db = await admin();
  const { data } = await db.from("push_config").select("token").eq("id", 1).maybeSingle();
  return data?.token ?? "";
}

async function brand() {
  const db = await admin();
  const { data } = await db.from("app_branding").select("short_name,app_name").eq("id", 1).maybeSingle();
  return data?.app_name || data?.short_name || "BASE";
}

/** Dựng nội dung + link, đồng thời kiểm lại người nhận còn đúng. null = không còn hợp lệ. */
async function build(db: any, n: any, b: string) {
  const kind = n.kind as PushKind;
  if (kind.startsWith("signal_")) {
    const { data: s } = await db.from("opportunity_signals").select("customer_name,products,assigned_to,cancelled_at").eq("id", n.signal_id).maybeSingle();
    if (!s) return null;
    if (kind === "signal_assigned" && s.assigned_to !== n.recipient_id) return null;
    if (kind === "signal_new" && (s.assigned_to || s.cancelled_at)) return null;
    return { ...pushMessage(kind, s, b), url: `/signals?open=${n.signal_id}` };
  }
  if (kind.startsWith("leave_")) {
    const { data: r } = await db.from("leave_requests").select("*").eq("id", n.leave_request_id).maybeSingle();
    if (!r) return null;
    if (kind === "leave_pending" && (r.status !== "pending" || r.approver_id !== n.recipient_id)) return null;
    if (kind === "leave_cancel_request" && (r.cancel_state !== "requested" || r.approver_id !== n.recipient_id)) return null;
    if (kind === "leave_cc" && r.status !== (n.payload?.action === "cancel_approve" ? "cancelled" : "approved")) return null;
    const { data: p } = await db.from("profiles").select("full_name").eq("id", r.owner_id).maybeSingle();
    return { ...pushMessage(kind, { ...r, owner_name: p?.full_name, action: n.payload?.action, approver_name: n.payload?.approver_name }, b), url: `/leave?open=${r.id}` };
  }
  const { data: a } = await db.from("attendance_explanations").select("*").eq("id", n.attendance_id).maybeSingle();
  if (!a || a.recalled) return null;
  if (kind === "att_witness" && (a.witness_id !== n.recipient_id || a.witness_status !== "pending")) return null;
  const { data: p } = await db.from("profiles").select("full_name").eq("id", a.owner_id).maybeSingle();
  return { ...pushMessage(kind, { ...a, owner_name: p?.full_name }, b), url: `/leave?att=${a.id}` };
}

/** Gửi Web Push cho các thông báo mới. Khóa nguyên tử theo notification (push_status pending→processing) và theo thiết bị (UNIQUE). */
export async function processPush(limit = 30) {
  const priv = process.env["VAPID_PRIVATE_KEY"];
  if (!priv) return { processed: 0, error: "missing key" };
  const vapid = { subject: "mailto:admin@suviet.vn", publicKey: VAPID_PUBLIC_KEY, privateKey: priv };
  const db = await admin();
  const { data: rows } = await db.from("notifications").select("id,recipient_id,kind,signal_id,leave_request_id,attendance_id,payload,created_at")
    .eq("push_status", "pending").in("kind", PUSH_KINDS as unknown as string[])
    .gt("created_at", new Date(Date.now() - FRESH_MS).toISOString()).order("created_at").limit(limit);
  const b = await brand();
  let sent = 0;
  for (const n of rows ?? []) {
    const { data: got } = await db.from("notifications").update({ push_status: "processing" }).eq("id", n.id).eq("push_status", "pending").select("id");
    if (!got?.length) continue;
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", n.recipient_id).eq("status", "active");
    if (!subs?.length) { await db.from("notifications").update({ push_status: "none" }).eq("id", n.id); continue; }
    let msg = null;
    try { msg = await build(db, n, b); } catch { msg = null; }
    if (!msg) { await db.from("notifications").update({ push_status: "ineligible" }).eq("id", n.id); continue; }
    let ok = 0;
    for (const s of subs) {
      const { data: d, error } = await db.from("push_deliveries").insert({ notification_id: n.id, subscription_id: s.id, status: "sending" }).select("id").maybeSingle();
      if (error || !d) continue; // đã có → không gửi trùng
      let status = "failed", err: string | null = null;
      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        try {
          const payload = await buildPushPayload({ data: JSON.stringify({ ...msg, tag: n.id }), options: { ttl: 3600, urgency: "high" } },
            { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } }, vapid);
          const res = await fetch(s.endpoint, { ...payload, signal: AbortSignal.timeout(10000) } as any);
          if (res.ok) { status = "sent"; err = null; break; }
          if (res.status === 404 || res.status === 410) { status = "expired"; err = `${res.status}`; await db.from("push_subscriptions").update({ status: "expired" }).eq("id", s.id); break; }
          err = `${res.status}`;
          if (res.status < 500 && res.status !== 429) break;
        } catch (e: any) { err = String(e?.message ?? e).slice(0, 200); break; } // lỗi mạng: không rõ đã tới → không thử lại
      }
      await db.from("push_deliveries").update({ status, error: err, attempts: 1, sent_at: status === "sent" ? new Date().toISOString() : null }).eq("id", d.id);
      if (status === "sent") { ok++; await db.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", s.id); }
    }
    sent += ok;
    await db.from("notifications").update({ push_status: ok ? "sent" : "failed" }).eq("id", n.id);
  }
  return { processed: rows?.length ?? 0, sent };
}

/** Gửi thử đến thiết bị của chính người dùng (không tạo thông báo nghiệp vụ). */
export async function sendTest(userId: string) {
  const priv = process.env["VAPID_PRIVATE_KEY"];
  if (!priv) throw new Error("Máy chủ chưa có khóa thông báo");
  const db = await admin();
  const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", userId).eq("status", "active");
  let ok = 0;
  for (const s of subs ?? []) {
    const payload = await buildPushPayload({ data: JSON.stringify({ title: await brand(), body: "Thông báo thử — thiết bị này đã nhận được thông báo từ Base.", url: "/", tag: "test" }), options: { ttl: 600 } },
      { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } }, { subject: "mailto:admin@suviet.vn", publicKey: VAPID_PUBLIC_KEY, privateKey: priv });
    const res = await fetch(s.endpoint, payload as any).catch(() => null);
    if (res?.ok) ok++;
    else if (res && (res.status === 404 || res.status === 410)) await db.from("push_subscriptions").update({ status: "expired" }).eq("id", s.id);
  }
  return { sent: ok, total: subs?.length ?? 0 };
}
