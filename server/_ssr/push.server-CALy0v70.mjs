import { b as buildPushPayload } from "../_libs/block65__webcrypto-web-push.mjs";
import { V as VAPID_PUBLIC_KEY } from "./config-DnDqLpRb.mjs";
import { nameMatches, contentStillValid, contentCurrentRecipients, contentLink, contentPushMessage } from "./notifyMessage-DnoA8PJG.mjs";
import { orderStillValid, orderCurrentRecipients, orderLink, orderPushMessage } from "./notifyMessage-CLuxtttz.mjs";
import { oqStillValid, oqLink, oqPushMessage } from "./notify-CzSXyhJl.mjs";
import { leaveSummary } from "./zaloMessage-Dzj1doVV.mjs";
import { T as TYPE_LABEL, a as fmtDate } from "./calc-BK6sHnP3.mjs";
import { KIND_LABEL, declaredTime } from "./attendance-Br4iDv6M.mjs";
import "../_libs/uint8array-extras.mjs";
const PUSH_KINDS = ["signal_new", "signal_assigned", "leave_pending", "leave_result", "leave_cancel_request", "leave_cc", "att_witness", "att_new", "content_assigned", "content_review", "content_revise", "content_approved", "content_published", "content_remind", "order_new", "order_assigned", "order_taken", "order_review", "order_revise", "order_approved", "order_delivered", "order_remind", "oq_new", "oq_info", "oq_answered", "oq_published", "oq_done", "oq_reask", "oq_assigned"];
const RESULT = {
  approve: "Đơn của bạn đã được duyệt.",
  reject: "Đơn của bạn bị từ chối.",
  cancel_approve: "Đơn của bạn đã được hủy.",
  cancel_reject: "Yêu cầu hủy đơn bị từ chối.",
  exception: "Đơn của bạn đã được xử lý ngoại lệ.",
  created_for: "Có đơn được tạo hộ bạn."
};
function pushMessage(kind, d, brand2 = "BASE") {
  const lines = (a) => a.filter(Boolean).join("\n");
  if (kind === "signal_new" || kind === "signal_assigned") {
    const products = (d.products ?? []).join(", ");
    return { title: brand2, body: lines([
      kind === "signal_new" ? "Có tín hiệu cơ hội mới cần phân công." : "Bạn có tín hiệu cơ hội mới.",
      d.customer_name && `Khách hàng: ${d.customer_name}`,
      products && `Sản phẩm: ${products}`,
      "Nhấn để xem chi tiết."
    ]) };
  }
  if (kind.startsWith("leave_")) {
    const type = TYPE_LABEL[d.type] ?? "đơn";
    const t = leaveSummary(d);
    const head = kind === "leave_pending" ? `Có ${type.toLowerCase()} chờ phê duyệt.` : kind === "leave_cancel_request" ? `Có yêu cầu hủy ${type.toLowerCase()} cần duyệt.` : kind === "leave_cc" ? d.action === "cancel_approve" ? `${type} đã duyệt được hủy.` : `${type} đã được phê duyệt.` : RESULT[d.action ?? ""] ?? "Đơn từ có cập nhật.";
    return { title: brand2, body: lines([
      head,
      kind !== "leave_result" && d.owner_name && `Nhân viên: ${d.owner_name}`,
      t && `Thời gian: ${t}`,
      kind === "leave_cc" && d.approver_name && `Người phê duyệt: ${d.approver_name}`,
      kind === "leave_pending" || kind === "leave_cancel_request" ? "Nhấn để xem và phê duyệt." : "Nhấn để xem đơn."
    ]) };
  }
  return { title: brand2, body: lines([
    kind === "att_witness" ? "Bạn được đề nghị xác nhận làm chứng giải trình chấm công." : "Có giải trình chấm công mới.",
    d.owner_name && `Nhân viên: ${d.owner_name}`,
    d.work_date && `Ngày: ${fmtDate(d.work_date)}`,
    d.kind && `${KIND_LABEL[d.kind] ?? ""}${declaredTime(d) ? ` · ${declaredTime(d)}` : ""}`,
    kind === "att_witness" ? "Nhấn để xem và xác nhận." : "Nhấn để xem giải trình."
  ]) };
}
const FRESH_MS = 30 * 60 * 1e3;
const MAX_ATTEMPTS = 3;
async function admin() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function pushToken() {
  const db = await admin();
  const { data } = await db.from("push_config").select("token").eq("id", 1).maybeSingle();
  return data?.token ?? "";
}
async function brand() {
  const db = await admin();
  const { data } = await db.from("app_branding").select("short_name,app_name").eq("id", 1).maybeSingle();
  return data?.app_name || data?.short_name || "BASE";
}
async function build(db, n, b) {
  const kind = n.kind;
  if (kind.startsWith("signal_")) {
    const { data: s } = await db.from("opportunity_signals").select("customer_name,products,assigned_to,cancelled_at").eq("id", n.signal_id).maybeSingle();
    if (!s) return null;
    if (kind === "signal_assigned" && s.assigned_to !== n.recipient_id) return null;
    if (kind === "signal_new" && (s.assigned_to || s.cancelled_at)) return null;
    return { ...pushMessage(kind, s, b), url: `/signals?open=${n.signal_id}` };
  }
  if (kind.startsWith("oq_")) {
    const { data: f } = await db.from("oq_flows").select("request_id,assignee_id,status,waiting_info").eq("id", n.oq_flow_id).maybeSingle();
    const { data: rq } = f ? await db.from("oq_requests").select("creator_id,status").eq("id", f.request_id).maybeSingle() : { data: null };
    const { data: sib } = f && n.payload?.both ? await db.from("oq_flows").select("assignee_id,status,waiting_info").eq("request_id", f.request_id) : { data: null };
    if (!oqStillValid(kind, n.recipient_id, f, rq, n.payload, sib ?? void 0)) return null;
    return { ...oqPushMessage(kind, n.payload ?? {}, b), url: oqLink(f.request_id, n.payload?.both ? null : n.oq_flow_id) };
  }
  if (kind.startsWith("order_")) {
    const { data: o } = await db.from("orders").select("data").eq("id", n.order_id).maybeSingle();
    if (!o || !orderStillValid(kind, n.payload?.status, o.data, n.payload?.assignee)) return null;
    const on = orderCurrentRecipients(kind, o.data ?? {});
    if (on && !nameMatches(on, (await db.from("profiles").select("full_name,username").eq("id", n.recipient_id).maybeSingle()).data)) return null;
    return { ...orderPushMessage(kind, { ...n.payload, title: o.data?.title ?? n.payload?.title }, b), url: orderLink(n.order_id) };
  }
  if (kind.startsWith("content_")) {
    const { data: c } = await db.from("web_contents").select("data").eq("id", n.content_id).maybeSingle();
    if (!c || !contentStillValid(kind, n.payload?.status, c.data?.status)) return null;
    if (!nameMatches(contentCurrentRecipients(kind, c.data ?? {}), (await db.from("profiles").select("full_name,username").eq("id", n.recipient_id).maybeSingle()).data)) return null;
    return { ...contentPushMessage(kind, { ...n.payload, title: c.data?.title ?? n.payload?.title }, b), url: contentLink(n.content_id) };
  }
  if (kind.startsWith("leave_")) {
    const { data: r } = await db.from("leave_requests").select("*").eq("id", n.leave_request_id).maybeSingle();
    if (!r) return null;
    if (kind === "leave_pending" && (r.status !== "pending" || r.approver_id !== n.recipient_id)) return null;
    if (kind === "leave_cancel_request" && (r.cancel_state !== "requested" || r.approver_id !== n.recipient_id)) return null;
    if (kind === "leave_cc" && r.status !== (n.payload?.action === "cancel_approve" ? "cancelled" : "approved")) return null;
    const { data: p2 } = await db.from("profiles").select("full_name").eq("id", r.owner_id).maybeSingle();
    return { ...pushMessage(kind, { ...r, owner_name: p2?.full_name, action: n.payload?.action, approver_name: n.payload?.approver_name }, b), url: `/leave?open=${r.id}` };
  }
  const { data: a } = await db.from("attendance_explanations").select("*").eq("id", n.attendance_id).maybeSingle();
  if (!a || a.recalled) return null;
  if (kind === "att_witness" && (a.witness_id !== n.recipient_id || a.witness_status !== "pending")) return null;
  const { data: p } = await db.from("profiles").select("full_name").eq("id", a.owner_id).maybeSingle();
  return { ...pushMessage(kind, { ...a, owner_name: p?.full_name }, b), url: `/attendance?att=${a.id}` };
}
async function processPush(limit = 30) {
  const priv = process.env["VAPID_PRIVATE_KEY"];
  if (!priv) return { processed: 0, error: "missing key" };
  const vapid = { subject: "mailto:admin@suviet.vn", publicKey: VAPID_PUBLIC_KEY, privateKey: priv };
  const db = await admin();
  const { data: rows } = await db.from("notifications").select("id,recipient_id,kind,signal_id,leave_request_id,attendance_id,content_id,order_id,oq_flow_id,payload,created_at").eq("push_status", "pending").in("kind", PUSH_KINDS).gt("created_at", new Date(Date.now() - FRESH_MS).toISOString()).order("created_at").limit(limit);
  const b = await brand();
  let sent = 0;
  for (const n of rows ?? []) {
    const { data: got } = await db.from("notifications").update({ push_status: "processing" }).eq("id", n.id).eq("push_status", "pending").select("id");
    if (!got?.length) continue;
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", n.recipient_id).eq("status", "active");
    if (!subs?.length) {
      await db.from("notifications").update({ push_status: "none" }).eq("id", n.id);
      continue;
    }
    let msg = null;
    try {
      msg = await build(db, n, b);
    } catch {
      msg = null;
    }
    if (!msg) {
      await db.from("notifications").update({ push_status: "ineligible" }).eq("id", n.id);
      continue;
    }
    let ok = 0;
    for (const s of subs) {
      const { data: d, error } = await db.from("push_deliveries").insert({ notification_id: n.id, subscription_id: s.id, status: "sending" }).select("id").maybeSingle();
      if (error || !d) continue;
      let status = "failed", err = null;
      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        try {
          const payload = await buildPushPayload(
            { data: JSON.stringify({ ...msg, tag: n.id }), options: { ttl: 3600, urgency: "high" } },
            { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } },
            vapid
          );
          const res = await fetch(s.endpoint, { ...payload, signal: AbortSignal.timeout(1e4) });
          if (res.ok) {
            status = "sent";
            err = null;
            break;
          }
          if (res.status === 404 || res.status === 410) {
            status = "expired";
            err = `${res.status}`;
            await db.from("push_subscriptions").update({ status: "expired" }).eq("id", s.id);
            break;
          }
          err = `${res.status}`;
          if (res.status < 500 && res.status !== 429) break;
        } catch (e) {
          err = String(e?.message ?? e).slice(0, 200);
          break;
        }
      }
      await db.from("push_deliveries").update({ status, error: err, attempts: 1, sent_at: status === "sent" ? (/* @__PURE__ */ new Date()).toISOString() : null }).eq("id", d.id);
      if (status === "sent") {
        ok++;
        await db.from("push_subscriptions").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", s.id);
      }
    }
    sent += ok;
    await db.from("notifications").update({ push_status: ok ? "sent" : "failed" }).eq("id", n.id);
  }
  return { processed: rows?.length ?? 0, sent };
}
async function sendTest(userId) {
  const priv = process.env["VAPID_PRIVATE_KEY"];
  if (!priv) throw new Error("Máy chủ chưa có khóa thông báo");
  const db = await admin();
  const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", userId).eq("status", "active");
  let ok = 0;
  for (const s of subs ?? []) {
    const payload = await buildPushPayload(
      { data: JSON.stringify({ title: await brand(), body: "Thông báo thử — thiết bị này đã nhận được thông báo từ Base.", url: "/", tag: "test" }), options: { ttl: 600 } },
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      { subject: "mailto:admin@suviet.vn", publicKey: VAPID_PUBLIC_KEY, privateKey: priv }
    );
    const res = await fetch(s.endpoint, payload).catch(() => null);
    if (res?.ok) ok++;
    else if (res && (res.status === 404 || res.status === 410)) await db.from("push_subscriptions").update({ status: "expired" }).eq("id", s.id);
  }
  return { sent: ok, total: subs?.length ?? 0 };
}
export {
  processPush,
  pushToken,
  sendTest
};
