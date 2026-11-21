import { g as getAccessToken, b as baseUrl, a as getConfig } from "./zalo.server-DBQRHLrG.mjs";
import { d as dueAutoSeq } from "./reminder-p6KbmApG.mjs";
import "crypto";
import "./zaloSend-DdkAb9gd.mjs";
async function db() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const HINTS = {
  [-216]: "Access token không hợp lệ — kết nối lại OA",
  [-224]: "OA chưa được cấp quyền dùng tính năng nhóm GMF (cần gói GMF / quyền 'Quản lý nhóm' trên ứng dụng Zalo)",
  [-230]: "OA không có quyền gửi vào nhóm này"
};
async function postGroup(groupId, text) {
  const token = await getAccessToken();
  if (!token) return { ok: false, code: -1, message: "Chưa kết nối Zalo OA" };
  try {
    const res = await fetch("https://openapi.zalo.me/v3.0/oa/group/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: token },
      body: JSON.stringify({ recipient: { group_id: groupId }, message: { text } }),
      signal: AbortSignal.timeout(15e3)
    });
    const j = await res.json().catch(() => ({}));
    if (j.error === 0) return { ok: true, code: 0, message: "" };
    const code = Number(j.error ?? res.status);
    return { ok: false, code, message: (HINTS[code] ?? String(j.message ?? "Lỗi gửi")).slice(0, 200) };
  } catch {
    return { ok: false, code: -9, message: "Mất kết nối khi gửi — không rõ Zalo đã nhận", ambiguous: true };
  }
}
async function listGroups() {
  const token = await getAccessToken();
  if (!token) return { ok: false, message: "Chưa kết nối Zalo OA", groups: [] };
  try {
    const res = await fetch("https://openapi.zalo.me/v3.0/oa/group/getgroupsofoa?offset=0&count=50", { headers: { access_token: token }, signal: AbortSignal.timeout(15e3) });
    const j = await res.json().catch(() => ({}));
    if (j.error !== 0) {
      const code = Number(j.error ?? res.status);
      return { ok: false, message: `Zalo trả lỗi ${code}: ${HINTS[code] ?? j.message ?? ""}`, groups: [] };
    }
    const arr = j.data?.groups ?? j.data?.items ?? (Array.isArray(j.data) ? j.data : []);
    return { ok: true, message: "", groups: arr.map((g) => ({ id: String(g.group_id ?? g.id ?? ""), name: String(g.name ?? g.group_name ?? g.group_id ?? "") })).filter((g) => g.id) };
  } catch {
    return { ok: false, message: "Mất kết nối tới Zalo", groups: [] };
  }
}
const vnd = (n) => "+" + Number(n).toLocaleString("vi-VN") + "đ";
const last4 = (s) => {
  const d = String(s ?? "").replace(/\D/g, "");
  return d.length >= 4 ? d.slice(-4) : "";
};
async function txMessage(t, acc) {
  const date = t.transaction_at ? new Date(t.transaction_at) : null;
  const parts = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hourCycle: "h23",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(date) : [];
  const part = (type) => parts.find((p) => p.type === type)?.value ?? "";
  const when = parts.length ? `${part("hour")}:${part("minute")} ${part("day")}/${part("month")}/${part("year")}` : t.transaction_date ?? "—";
  return [
    "🔔 TIỀN VỀ MỚI",
    "",
    `💰 ${vnd(t.amount)} · Chưa xác nhận`,
    `🏦 TK: ${(acc.label || acc.bank || "—").toLocaleUpperCase("vi-VN")}${acc.last4 ? ` (****${acc.last4})` : ""}`,
    `🕒 ${when}`,
    "",
    `📝 CK: ${String(t.description ?? "")}`,
    "",
    "👉 Check note:",
    `${await baseUrl()}/finance/incoming/${t.id}`
  ].join("\n");
}
async function manualMessage(t) {
  const day = t.received_date ? String(t.received_date).split("-").reverse().join("/") : "";
  return [
    "🔔 TIỀN VỀ MỚI",
    "",
    `💰 ${vnd(t.amount)} · Chưa xác nhận`,
    t.source === "cash" ? "💵 TIỀN MẶT" : "🏦 TK KHÁC",
    `🕒 ${day || "—"}`,
    "",
    `📝 Ghi chú Kế toán: ${String(t.description ?? "")}`,
    "",
    "👉 Check note:",
    `${await baseUrl()}/finance/incoming/${t.id}`
  ].join("\n");
}
async function queueAndSend(txIds) {
  if (!txIds.length) return;
  const d = await db();
  const cfg = await getConfig();
  if (!cfg?.gmf_enabled || !cfg?.gmf_group_id) return;
  const { data: rows } = await d.from("bank_transactions").select("id, bank_account_id, source").in("id", txIds).eq("gmf_status", "skipped").eq("operation_test", false);
  const { data: accs } = await d.from("bank_accounts").select("id").eq("gmf_notify", true);
  const ok = new Set((accs ?? []).map((a) => a.id));
  const ids = (rows ?? []).filter((r) => r.source !== "bank" || ok.has(r.bank_account_id)).map((r) => r.id);
  if (!ids.length) return;
  await d.from("bank_transactions").update({ gmf_status: "pending" }).in("id", ids).eq("gmf_status", "skipped").eq("gmf_attempts", 0).eq("operation_test", false);
  await sendPending(ids);
}
async function sendPending(ids) {
  const d = await db();
  const cfg = await getConfig();
  if (!cfg?.gmf_group_id) return { sent: 0, failed: 0, message: "Chưa chọn nhóm GMF" };
  let q = d.from("bank_transactions").select("id, amount, transaction_at, transaction_date, description, bank_account_id, gmf_status, gmf_attempts, source, received_date, created_by").in("gmf_status", ["pending", "failed"]).eq("operation_test", false).limit(30);
  if (ids) q = q.in("id", ids);
  const { data: rows } = await q;
  const { data: accs } = await d.from("bank_accounts").select("id, bank_name, label, account_number");
  const labels = new Map((accs ?? []).map((a) => [a.id, { label: a.label?.trim() || "", bank: a.bank_name, last4: last4(a.account_number) }]));
  let sent = 0, failed = 0, last = "";
  for (const t of rows ?? []) {
    const { data: got } = await d.from("bank_transactions").update({ gmf_status: "sending", gmf_attempts: (t.gmf_attempts ?? 0) + 1 }).eq("id", t.id).eq("gmf_status", t.gmf_status).eq("gmf_attempts", t.gmf_attempts).eq("operation_test", false).select("id");
    if (!got?.length) continue;
    const r = await postGroup(cfg.gmf_group_id, t.source !== "bank" ? await manualMessage(t) : await txMessage(t, labels.get(t.bank_account_id) ?? { label: "", bank: "", last4: "" }));
    if (r.ok) sent++;
    else {
      failed++;
      last = `${r.code}: ${r.message}`;
    }
    await d.from("bank_transactions").update(r.ok ? { gmf_status: "sent", gmf_sent_at: (/* @__PURE__ */ new Date()).toISOString(), gmf_error: null } : { gmf_status: r.ambiguous ? "unknown" : "failed", gmf_error: `${r.code}: ${r.message}` }).eq("id", t.id);
  }
  return { sent, failed, message: last };
}
async function reminderMessage(t, kind, seq, max) {
  const when = t.transaction_at ? new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hourCycle: "h23", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(t.transaction_at)) : t.received_date ? String(t.received_date).split("-").reverse().join("/") : "—";
  return [
    kind === "auto" ? "🔔 NHẮC XÁC NHẬN TIỀN VỀ" : "📣 NHẮC XÁC NHẬN TIỀN VỀ (gửi thủ công)",
    "",
    "Khoản tiền này vẫn đang chờ xác nhận.",
    "",
    ...t.customer ? [`Khách hàng: ${t.customer}`] : [],
    `Số tiền: ${vnd(t.amount)}`,
    `Thời gian ghi nhận: ${when}`,
    "",
    "Vui lòng kiểm tra và xác nhận trên Base Sứ Việt:",
    `${await baseUrl()}/finance/incoming/${t.id}`,
    ...kind === "auto" && seq ? ["", `Lần nhắc: ${seq}/${max}`] : []
  ].join("\n");
}
const TX_COLS = "id, amount, customer, transaction_at, received_date, confirmation_status, cancelled_at, operation_test, gmf_status, gmf_sent_at";
const stillPending = (t) => t && t.confirmation_status === "unclaimed" && !t.cancelled_at && !t.operation_test;
async function finish(d, rid, r) {
  await d.from("fin_reminders").update({ status: r.ok ? "sent" : r.ambiguous ? "unknown" : "failed", error: r.ok ? null : `${r.code}: ${r.message}`, finished_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", rid);
}
async function sendManualReminder(rid, txId) {
  const d = await db();
  const cfg = await getConfig();
  const { data: t } = await d.from("bank_transactions").select(TX_COLS).eq("id", txId).maybeSingle();
  if (!cfg?.gmf_group_id || !cfg?.gmf_enabled) {
    const r2 = { ok: false, code: -2, message: "Chưa bật nhóm thông báo Tiền Về" };
    await finish(d, rid, r2);
    return r2;
  }
  if (!stillPending(t)) {
    const r2 = { ok: false, code: -3, message: "Khoản tiền đã được xác nhận" };
    await finish(d, rid, r2);
    return r2;
  }
  const r = await postGroup(cfg.gmf_group_id, await reminderMessage(t, "manual", null, 0));
  await finish(d, rid, r);
  return r;
}
async function runAutoReminders(nowMs = Date.now()) {
  const d = await db();
  const { data: rc } = await d.from("fin_reminder_config").select("*").eq("id", 1).maybeSingle();
  const cfg = await getConfig();
  if (!rc?.enabled || !cfg?.gmf_enabled || !cfg?.gmf_group_id) return { checked: 0, sent: 0, skipped: "disabled" };
  const c = rc;
  const { data: txs } = await d.from("bank_transactions").select(TX_COLS).eq("confirmation_status", "unclaimed").is("cancelled_at", null).eq("operation_test", false).eq("gmf_status", "sent").gte("gmf_sent_at", rc.active_from).gt("amount", 0).limit(200);
  if (!txs?.length) return { checked: 0, sent: 0 };
  const { data: rems } = await d.from("fin_reminders").select("tx_id, seq, status, created_at").eq("kind", "auto").in("tx_id", txs.map((t) => t.id));
  let sent = 0;
  for (const t of txs) {
    const mine = (rems ?? []).filter((r2) => r2.tx_id === t.id);
    const used = mine.filter((r2) => r2.status !== "failed");
    if (mine.some((r2) => r2.status === "failed" && nowMs - Date.parse(r2.created_at) < 15 * 6e4)) continue;
    const last = used.reduce((m, r2) => Math.max(m ?? 0, Date.parse(r2.created_at)), null);
    const seq = dueAutoSeq({ autoCount: used.length, lastAutoAt: last, baseAt: Date.parse(t.gmf_sent_at) }, nowMs, c);
    if (!seq) continue;
    const { data: fresh } = await d.from("bank_transactions").select(TX_COLS).eq("id", t.id).maybeSingle();
    if (!stillPending(fresh)) continue;
    const { data: claim, error } = await d.from("fin_reminders").insert({ tx_id: t.id, kind: "auto", seq }).select("id").maybeSingle();
    if (error || !claim) continue;
    const r = await postGroup(cfg.gmf_group_id, await reminderMessage(fresh, "auto", seq, c.max_auto));
    await finish(d, claim.id, r);
    if (r.ok) sent++;
  }
  return { checked: txs.length, sent };
}
export {
  listGroups,
  manualMessage,
  postGroup,
  queueAndSend,
  reminderMessage,
  runAutoReminders,
  sendManualReminder,
  sendPending,
  txMessage
};
