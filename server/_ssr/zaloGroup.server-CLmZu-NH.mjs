import { postGroup } from "./gmf.server-CUA1cOPW.mjs";
import { b as baseUrl } from "./zalo.server-DBQRHLrG.mjs";
import { f as frGroupMessage, a as frGroupSummary, b as frGroupTestMessage } from "./zaloGroupMessage-BHPF7ZYB.mjs";
import "./reminder-p6KbmApG.mjs";
import "crypto";
import "./zaloSend-DdkAb9gd.mjs";
import "./logic-DH2fjerh.mjs";
const MAX_ATTEMPTS = 3;
const FR_PATH = { advance: "advance", payment: "payment", salary_advance: "salary" };
async function db() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function frGroupConfig(kind) {
  const d = await db();
  const { data } = await d.from("fr_zalo_group_config").select("*").eq("kind", kind).maybeSingle();
  return data;
}
function stillValid(event, r) {
  if (!r) return false;
  if (r.status === "cancelled") return false;
  if (event === "submitted") return r.status !== "draft";
  if (event === "info") return r.status === "info_requested" || r.status !== "draft";
  if (event === "approved") return ["approved", "awaiting_payment", "paid", "settling", "done"].includes(r.status);
  if (event === "rejected") return r.status === "rejected";
  if (event === "paid") return ["paid", "settling", "done", "awaiting_payment"].includes(r.status) && r.paid_amount > 0;
  if (event === "settled") return r.settled_amount > 0;
  if (event === "deducted") return r.deducted_amount > 0;
  if (event === "done") return r.status === "done";
  return true;
}
async function processFrGroup(limit = 10) {
  const d = await db();
  const { data: rows } = await d.from("fr_zalo_group_events").select("id, request_id, kind, event, attempts, group_id").eq("status", "pending").lt("attempts", MAX_ATTEMPTS).order("created_at").limit(limit);
  if (!rows?.length) return { processed: 0 };
  const cfgs = {};
  for (const k of ["advance", "payment", "salary_advance"]) cfgs[k] = await frGroupConfig(k);
  const link = `${await baseUrl()}/finance`;
  let processed = 0;
  for (const ev of rows) {
    const cfg = cfgs[ev.kind];
    if (!cfg?.enabled || !cfg.group_id) {
      await d.from("fr_zalo_group_events").update({ status: "skipped", error: "Cấu hình đã tắt hoặc đổi nhóm" }).eq("id", ev.id);
      continue;
    }
    const { data: got } = await d.from("fr_zalo_group_events").update({ attempts: ev.attempts + 1 }).eq("id", ev.id).eq("status", "pending").eq("attempts", ev.attempts).select("id");
    if (!got?.length) continue;
    const mark = (patch) => d.from("fr_zalo_group_events").update(patch).eq("id", ev.id).eq("attempts", ev.attempts + 1);
    const { data: r } = await d.from("fr_requests").select("*").eq("id", ev.request_id).maybeSingle();
    if (!stillValid(ev.event, r)) {
      await mark({ status: "skipped", error: "Đề nghị đã đổi trạng thái trước khi gửi" });
      continue;
    }
    const { data: p } = await d.from("profiles").select("full_name").eq("id", r.requester_id).maybeSingle();
    const { count: linesCount } = await d.from("fr_request_lines").select("id", { count: "exact", head: true }).eq("request_id", r.id);
    const msgData = {
      kind: r.kind,
      code: r.code,
      title: r.title,
      amount: Number(r.amount),
      requester_name: p?.full_name ?? null,
      status: r.status,
      lines_count: linesCount ?? 0,
      paid_amount: Number(r.paid_amount ?? 0)
    };
    const url = `${link}/${FR_PATH[r.kind]}?open=${r.id}`;
    const res = await postGroup(ev.group_id ?? cfg.group_id, frGroupMessage(ev.event, msgData, url, cfg.intro));
    processed++;
    await mark({
      summary: frGroupSummary(ev.event, msgData),
      ...res.ok ? { status: "sent", sent_at: (/* @__PURE__ */ new Date()).toISOString(), error: null } : res.ambiguous ? { status: "unknown", error: `${res.code}: ${res.message}` } : { status: "failed", error: `${res.code}: ${res.message}` }
    });
  }
  return { processed };
}
async function sendFrGroupTest(kind) {
  const cfg = await frGroupConfig(kind);
  if (!cfg?.group_id) return { ok: false, message: "Chưa chọn nhóm Zalo nhận thông báo" };
  const { brandHeader } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const t = (/* @__PURE__ */ new Date()).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
  const r = await postGroup(cfg.group_id, frGroupTestMessage(kind, await brandHeader(), t));
  return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi — kiểm tra nhóm" } : { ok: false, message: `Không gửi được (${r.code}: ${r.message})` };
}
async function retryFrGroupEvent(id) {
  const d = await db();
  const { data } = await d.from("fr_zalo_group_events").update({ status: "pending", attempts: 0, error: null }).eq("id", id).in("status", ["failed", "unknown"]).select("id");
  if (!data?.length) return { ok: false, message: "Sự kiện không ở trạng thái cần gửi lại" };
  await processFrGroup(5);
  const { data: ev } = await d.from("fr_zalo_group_events").select("status, error").eq("id", id).maybeSingle();
  if (ev?.status === "sent") return { ok: true, message: "Đã gửi lại thành công" };
  if (ev?.status === "skipped") return { ok: false, message: "Đề nghị đã đổi trạng thái — không gửi lại tin cũ" };
  return { ok: false, message: ev?.error ? `Chưa gửi được: ${ev.error}` : "Chưa gửi được — thử lại sau" };
}
export {
  frGroupConfig,
  processFrGroup,
  retryFrGroupEvent,
  sendFrGroupTest
};
