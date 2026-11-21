import { postGroup } from "./gmf.server-CUA1cOPW.mjs";
import { b as baseUrl } from "./zalo.server-DBQRHLrG.mjs";
import "./reminder-p6KbmApG.mjs";
import "crypto";
import "./zaloSend-DdkAb9gd.mjs";
const DESIGN_ZALO_EVENTS = {
  created: "Job mới được giao",
  transferred: "Chuyển người thực hiện",
  taken: "Đã nhận việc",
  submitted: "Gửi duyệt",
  changes: "Yêu cầu sửa",
  approved: "Đã duyệt",
  delivered: "Đã bàn giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy"
};
const FLOW_LABEL = {
  photo: "Chụp ảnh",
  marketing_design: "Ấn phẩm Marketing",
  order_mockup: "Ma-két đơn hàng"
};
const limit = (v) => String(v ?? "").trim().slice(0, 150);
function designGroupMessage(flow, event, s, link) {
  const deadline = s.deadline && /^\d{4}-\d{2}-\d{2}$/.test(s.deadline) ? s.deadline.split("-").reverse().join("/") : "—";
  return [
    "🎨 THÔNG BÁO THIẾT KẾ · " + FLOW_LABEL[flow],
    DESIGN_ZALO_EVENTS[event].toLocaleUpperCase("vi-VN"),
    "",
    "📌 Job: " + limit(s.title),
    "👤 Người yêu cầu: " + limit(s.requester),
    ...event === "transferred" ? ["🔁 Chuyển từ: " + limit(s.old_assignee)] : [],
    "🎨 Người thực hiện: " + limit(s.assignee),
    "✅ Người duyệt: " + limit(s.reviewer),
    "📅 Deadline: " + deadline,
    "📍 Trạng thái: " + limit(s.status),
    "",
    "👉 Xem Job trên Base: " + link
  ].join("\n");
}
const MAX_ATTEMPTS = 3;
const STALE_MS = 12e4;
const flows = ["photo", "marketing_design", "order_mockup"];
async function db() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
async function designGroupConfig(flow) {
  const d = await db();
  const { data, error } = await d.from("design_zalo_group_config").select("*").eq("flow", flow).maybeSingle();
  if (error) throw new Error("Không đọc được cấu hình Zalo Thiết kế");
  return data;
}
async function processDesignGroup(limit2 = 10) {
  const d = await db();
  await d.from("design_zalo_group_events").update({ status: "unknown", error: "Tiến trình bị gián đoạn; kiểm tra Zalo trước khi gửi lại" }).eq("status", "sending").lt("started_at", new Date(Date.now() - STALE_MS).toISOString());
  const { data: queue, error } = await d.from("design_zalo_group_events").select("id,order_id,flow,event,group_id,snapshot,attempts").eq("status", "pending").lt("attempts", MAX_ATTEMPTS).order("created_at").limit(limit2);
  if (error) return { processed: 0, error: "Không tải được hàng đợi Thiết kế" };
  if (!queue?.length) return { processed: 0 };
  const configs = Object.fromEntries(await Promise.all(flows.map(async (flow) => [flow, await designGroupConfig(flow)])));
  let processed = 0;
  const base = await baseUrl();
  for (const ev of queue) {
    const cfg = configs[ev.flow];
    if (!cfg?.enabled || !cfg.group_id || cfg.group_id !== ev.group_id) {
      await d.from("design_zalo_group_events").update({ status: "skipped", error: "Hệ đã tắt hoặc thay đổi nhóm" }).eq("id", ev.id).eq("status", "pending");
      continue;
    }
    const { data: got } = await d.from("design_zalo_group_events").update({ status: "sending", started_at: (/* @__PURE__ */ new Date()).toISOString(), attempts: ev.attempts + 1 }).eq("id", ev.id).eq("status", "pending").eq("attempts", ev.attempts).select("id");
    if (!got?.length) continue;
    const mark = (patch) => d.from("design_zalo_group_events").update(patch).eq("id", ev.id).eq("status", "sending").eq("attempts", ev.attempts + 1);
    const { data: order } = await d.from("orders").select("id,workflow_kind,data").eq("id", ev.order_id).maybeSingle();
    if (!order || order.workflow_kind !== ev.flow) {
      await mark({ status: "skipped", error: "Job không còn thuộc luồng thiết kế này" });
      continue;
    }
    const snap = ev.snapshot;
    const st = order.data?.status;
    if ((ev.event === "created" || ev.event === "transferred" || ev.event === "taken") && (st === "Đã hủy" || st === "Hoàn thành" || order.data?.assignee !== snap.assignee)) {
      await mark({ status: "skipped", error: "Người nhận/trạng thái đã thay đổi" });
      continue;
    }
    const link = base + "/orders?open=" + encodeURIComponent(ev.order_id);
    const res = await postGroup(ev.group_id, designGroupMessage(ev.flow, ev.event, snap, link)).catch(() => ({ ok: false, ambiguous: true, code: -9, message: "Không xác minh được kết quả gửi Zalo" }));
    processed++;
    await mark(res.ok ? { status: "sent", sent_at: (/* @__PURE__ */ new Date()).toISOString(), error: null } : { status: res.ambiguous ? "unknown" : "failed", error: String(res.code) + ": " + res.message });
  }
  return { processed };
}
async function designGroupSendTest(flow) {
  const cfg = await designGroupConfig(flow);
  if (!cfg?.group_id) return { ok: false, message: "Chưa chọn nhóm Zalo cho " + FLOW_LABEL[flow] };
  const now = (/* @__PURE__ */ new Date()).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
  const r = await postGroup(
    cfg.group_id,
    "🧪 THỬ KẾT NỐI THIẾT KẾ · " + FLOW_LABEL[flow] + "\nĐây là tin kiểm tra, không chứa dữ liệu Job.\n" + now
  );
  return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi; kiểm tra nhóm." } : { ok: false, message: "Chưa gửi được: " + r.code + " " + r.message };
}
async function designGroupRetry(id, flow) {
  const d = await db();
  const cfg = await designGroupConfig(flow);
  if (!cfg?.enabled || !cfg.group_id) return { ok: false, message: "Bật thông báo và liên kết nhóm trước khi gửi lại" };
  const { data: ev } = await d.from("design_zalo_group_events").select("id,status,group_id").eq("id", id).eq("flow", flow).in("status", ["failed", "unknown"]).maybeSingle();
  if (!ev) return { ok: false, message: "Tin không ở trạng thái có thể gửi lại" };
  if (ev.group_id !== cfg.group_id) return { ok: false, message: "Nhóm đã thay đổi, không gửi lại tin cũ" };
  const { data } = await d.from("design_zalo_group_events").update({ status: "pending", attempts: 0, error: null, started_at: null }).eq("id", id).in("status", ["failed", "unknown"]).select("id");
  if (!data?.length) return { ok: false, message: "Tin đã được xử lý bởi người khác" };
  await processDesignGroup(10);
  const { data: after } = await d.from("design_zalo_group_events").select("status,error").eq("id", id).maybeSingle();
  return after?.status === "sent" ? { ok: true, message: "Đã gửi lại" } : { ok: false, message: after?.error || "Chưa gửi được" };
}
export {
  designGroupConfig,
  designGroupRetry,
  designGroupSendTest,
  processDesignGroup
};
