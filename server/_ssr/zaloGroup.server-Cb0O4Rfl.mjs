import { postGroup } from "./gmf.server-CUA1cOPW.mjs";
import { b as baseUrl } from "./zalo.server-DBQRHLrG.mjs";
import { g as groupMessage, a as groupSummary } from "./zaloGroupMessage-kyI4Tfnt.mjs";
import "./reminder-p6KbmApG.mjs";
import "crypto";
import "./zaloSend-DdkAb9gd.mjs";
import "./calc-BK6sHnP3.mjs";
const MAX_ATTEMPTS = 3;
const STALE_SENDING_MS = 2 * 6e4;
async function db() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function leaveGroupConfig() {
  const d = await db();
  const { data } = await d.from("leave_zalo_group_config").select("*").eq("id", 1).maybeSingle();
  return data;
}
async function departmentOf(userId) {
  try {
    const d = await db();
    const { data: m } = await d.from("biz_department_members").select("department_id").eq("user_id", userId).is("ended_at", null).order("effective_from", { ascending: false }).limit(1).maybeSingle();
    if (!m?.department_id) return null;
    const { data: dep } = await d.from("biz_departments").select("name").eq("id", m.department_id).maybeSingle();
    return dep?.name ?? null;
  } catch {
    return null;
  }
}
function stillValid(event, r) {
  if (!r) return false;
  if (event === "new" || event === "reassign") return r.status === "pending";
  if (event === "approved") return r.status === "approved" || r.status === "cancelled";
  return r.status === "rejected";
}
async function processLeaveGroup(limit = 10) {
  const cfg = await leaveGroupConfig();
  if (!cfg?.enabled || !cfg.group_id) return { processed: 0, skipped: "disabled" };
  const d = await db();
  await d.from("leave_zalo_group_events").update({ status: "unknown", error: "Tiến trình gửi gián đoạn; kiểm tra Zalo trước khi gửi lại" }).eq("status", "sending").lt("started_at", new Date(Date.now() - STALE_SENDING_MS).toISOString());
  const { data: rows } = await d.from("leave_zalo_group_events").select("id, request_id, event, attempts").eq("status", "pending").lt("attempts", MAX_ATTEMPTS).order("created_at").limit(limit);
  let processed = 0;
  for (const ev of rows ?? []) {
    const { data: got } = await d.from("leave_zalo_group_events").update({ status: "sending", attempts: ev.attempts + 1, started_at: (/* @__PURE__ */ new Date()).toISOString(), error: null }).eq("id", ev.id).eq("status", "pending").eq("attempts", ev.attempts).select("id");
    if (!got?.length) continue;
    const mark = (patch) => d.from("leave_zalo_group_events").update(patch).eq("id", ev.id).eq("status", "sending").eq("attempts", ev.attempts + 1);
    const { data: r } = await d.from("leave_requests").select("*").eq("id", ev.request_id).maybeSingle();
    if (!stillValid(ev.event, r)) {
      await mark({ status: "skipped", error: "Đơn đã được xử lý/đổi trạng thái trước khi gửi" });
      continue;
    }
    const ids = [r.owner_id, r.approver_id, r.decided_by].filter(Boolean);
    const { data: names } = await d.from("profiles").select("id, full_name").in("id", ids);
    const nm = (id) => (names ?? []).find((x) => x.id === id)?.full_name ?? null;
    let oldApprover = null;
    if (ev.event === "reassign") {
      const { data: log } = await d.from("leave_request_events").select("detail").eq("request_id", r.id).eq("action", "reassign").order("created_at", { ascending: false }).limit(1).maybeSingle();
      const oldId = log?.detail?.from ?? log?.detail?.old_approver ?? null;
      if (oldId) {
        const { data: p } = await d.from("profiles").select("full_name").eq("id", oldId).maybeSingle();
        oldApprover = p?.full_name ?? null;
      }
    }
    const msgData = {
      type: r.type,
      payload: r.payload,
      calc: r.calc,
      is_late: !!r.is_late,
      owner_name: nm(r.owner_id) ?? "Nhân viên",
      department: await departmentOf(r.owner_id),
      approver_name: nm(r.approver_id),
      old_approver_name: oldApprover,
      decided_by_name: nm(r.decided_by),
      submitted_at: r.submitted_at
    };
    const link = `${await baseUrl()}/leave?open=${r.id}`;
    const res = await postGroup(cfg.group_id, groupMessage(ev.event, msgData, link)).catch(() => ({ ok: false, ambiguous: true, code: -9, message: "Không xác minh được kết quả gửi Zalo" }));
    processed++;
    await mark({
      summary: groupSummary(msgData),
      ...res.ok ? { status: "sent", sent_at: (/* @__PURE__ */ new Date()).toISOString(), error: null } : res.ambiguous ? { status: "unknown", error: `${res.code}: ${res.message}` } : { status: "failed", error: `${res.code}: ${res.message}` }
    });
  }
  return { processed };
}
async function sendLeaveGroupTest() {
  const cfg = await leaveGroupConfig();
  if (!cfg?.group_id) return { ok: false, message: "Chưa chọn nhóm Zalo Nhân sự" };
  const { brandHeader } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const t = (/* @__PURE__ */ new Date()).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
  const r = await postGroup(
    cfg.group_id,
    `🧪 ${await brandHeader()} — TIN KIỂM THỬ NHÓM NHÂN SỰ
Đây là tin kiểm tra kết nối nhóm nhận thông báo Nghỉ phép & Đi sớm muộn, không chứa dữ liệu đơn.
Thời gian: ${t}`
  );
  return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi — kiểm tra nhóm" } : { ok: false, message: `Không gửi được (${r.code}: ${r.message})` };
}
async function retryLeaveGroupEvent(id) {
  const d = await db();
  const { data } = await d.from("leave_zalo_group_events").update({ status: "pending", attempts: 0, error: null }).eq("id", id).in("status", ["failed", "unknown"]).select("id");
  if (!data?.length) return { ok: false, message: "Sự kiện không ở trạng thái cần gửi lại" };
  await processLeaveGroup(5);
  const { data: ev } = await d.from("leave_zalo_group_events").select("status, error").eq("id", id).maybeSingle();
  if (ev?.status === "sent") return { ok: true, message: "Đã gửi lại thành công" };
  if (ev?.status === "skipped") return { ok: false, message: "Đơn đã được xử lý — không gửi lại tin cũ" };
  return { ok: false, message: ev?.error ? `Chưa gửi được: ${ev.error}` : "Chưa gửi được — thử lại sau" };
}
export {
  leaveGroupConfig,
  processLeaveGroup,
  retryLeaveGroupEvent,
  sendLeaveGroupTest
};
