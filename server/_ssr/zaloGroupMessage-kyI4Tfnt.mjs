import { f as fmtVn, T as TYPE_LABEL, H as HALF_LABEL, a as fmtDate, b as fmtDays } from "./calc-BK6sHnP3.mjs";
const GROUP_EVENT_LABEL = {
  new: "Đơn mới",
  reassign: "Chuyển người duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối"
};
const up = (s) => s.toLocaleUpperCase("vi-VN");
function groupTypeLabel(d) {
  return `${TYPE_LABEL[d.type] ?? "Đơn từ"}${d.is_late ? " — ĐƠN BỔ SUNG" : ""}`;
}
function groupTimeLines(d) {
  const p = d.payload || {};
  if (d.type === "leave") {
    if (!p.start_date || !p.end_date) return [];
    const a = `${HALF_LABEL[p.start_half] ?? ""} ${fmtDate(p.start_date)}`.trim();
    const b = `hết ${(HALF_LABEL[p.end_half] ?? "").toLowerCase()} ${fmtDate(p.end_date)}`;
    return [`📅 Thời gian: ${a} → ${b}`, `⏳ Số ngày nghỉ: ${fmtDays(Number(d.calc?.days ?? 0))} ngày`];
  }
  if (!p.date) return [];
  const sched = d.type === "late" ? d.calc?.session_start : d.calc?.session_end;
  const exp = d.calc?.expected_at ? fmtVn(d.calc.expected_at, false) : null;
  return [
    `📅 Ngày áp dụng: ${fmtDate(p.date)} (${HALF_LABEL[p.half] ?? ""})`,
    sched ? `🕒 ${d.type === "late" ? "Giờ vào ca theo lịch" : "Giờ kết thúc theo lịch"}: ${sched}` : "",
    exp ? `🕒 Giờ dự kiến ${d.type === "late" ? "đến" : "về"}: ${exp}` : ""
  ].filter(Boolean);
}
function groupNewMessage(d, link) {
  const title = `📋 CÓ ĐƠN ${up(TYPE_LABEL[d.type] ?? "ĐƠN TỪ")} MỚI${d.is_late ? " (ĐƠN BỔ SUNG)" : ""}`;
  return [
    title,
    "",
    `👤 Nhân viên: ${d.owner_name}`,
    d.department ? `🏢 Bộ phận: ${d.department}` : "",
    `📝 Loại đơn: ${groupTypeLabel(d)}`,
    ...groupTimeLines(d),
    d.submitted_at ? `🕒 Gửi lúc: ${fmtVn(d.submitted_at)}` : "",
    "",
    d.approver_name ? `👨‍💼 NGƯỜI DUYỆT: ${up(d.approver_name)}` : "",
    d.approver_name ? `⏳ Trạng thái: Chờ ${d.approver_name} phê duyệt` : "",
    "",
    "🔗 XEM VÀ DUYỆT ĐƠN TRÊN BASE",
    link
  ].filter(Boolean).join("\n");
}
function groupResultMessage(event, d, link) {
  const ok = event === "approved";
  const decider = d.decided_by_name || d.approver_name || "";
  return [
    ok ? "✅ ĐƠN ĐÃ ĐƯỢC PHÊ DUYỆT" : "❌ ĐƠN KHÔNG ĐƯỢC PHÊ DUYỆT",
    "",
    `👤 Nhân viên: ${d.owner_name}`,
    `📝 Loại đơn: ${groupTypeLabel(d)}`,
    ...groupTimeLines(d),
    "",
    decider ? `👨‍💼 ${ok ? "Người duyệt" : "Người xử lý"}: ${decider}` : "",
    ok ? "✅ Trạng thái: Đã duyệt" : "❌ Trạng thái: Từ chối",
    "",
    `🔗 Xem hồ sơ trên Base: ${link}`
  ].filter(Boolean).join("\n");
}
function groupReassignMessage(d, link) {
  return [
    "🔄 THAY ĐỔI NGƯỜI PHÊ DUYỆT",
    "",
    `👤 Nhân viên gửi đơn: ${d.owner_name}`,
    `📝 Loại đơn: ${groupTypeLabel(d)}`,
    "",
    d.old_approver_name ? `👨‍💼 Người duyệt cũ: ${d.old_approver_name}` : "",
    d.approver_name ? `👨‍💼 NGƯỜI DUYỆT MỚI: ${up(d.approver_name)}` : "",
    "",
    d.approver_name ? `⏳ Trạng thái: Chờ ${d.approver_name} phê duyệt` : "",
    "",
    `🔗 Xem hồ sơ trên Base: ${link}`
  ].filter(Boolean).join("\n");
}
function groupMessage(event, d, link) {
  if (event === "new") return groupNewMessage(d, link);
  if (event === "reassign") return groupReassignMessage(d, link);
  return groupResultMessage(event, d, link);
}
function groupSummary(d) {
  return `${d.owner_name} · ${groupTypeLabel(d)}`;
}
export {
  GROUP_EVENT_LABEL as G,
  groupSummary as a,
  groupMessage as g
};
