/** Dựng tin Zalo NHÓM Nhân sự cho Đơn từ — hàm thuần. Không đưa lý do chi tiết/ghi chú từ chối/tài liệu nhạy cảm vào nhóm. */
import { TYPE_LABEL, HALF_LABEL, fmtDate, fmtDays, fmtVn, type LeaveType, type Half } from "./calc";

export type GroupEvent = "new" | "reassign" | "approved" | "rejected";
export const GROUP_EVENT_LABEL: Record<GroupEvent, string> = {
  new: "Đơn mới", reassign: "Chuyển người duyệt", approved: "Đã duyệt", rejected: "Từ chối",
};

export interface GroupMsgData {
  type: LeaveType; payload: any; calc: any; is_late?: boolean;
  owner_name: string; department?: string | null;
  approver_name?: string | null; old_approver_name?: string | null; decided_by_name?: string | null;
  submitted_at?: string | null;
}

const up = (s: string) => s.toLocaleUpperCase("vi-VN");

/** Nhãn loại đơn; đơn gửi bổ sung sau sự việc ghi rõ "ĐƠN BỔ SUNG". */
export function groupTypeLabel(d: Pick<GroupMsgData, "type" | "is_late">): string {
  return `${TYPE_LABEL[d.type] ?? "Đơn từ"}${d.is_late ? " — ĐƠN BỔ SUNG" : ""}`;
}

/** Dòng thời gian theo loại đơn: nghỉ phép (khoảng ngày + số ngày), đi muộn/về sớm (ngày + giờ lịch + giờ dự kiến). */
export function groupTimeLines(d: Pick<GroupMsgData, "type" | "payload" | "calc">): string[] {
  const p = d.payload || {};
  if (d.type === "leave") {
    if (!p.start_date || !p.end_date) return [];
    const a = `${HALF_LABEL[p.start_half as Half] ?? ""} ${fmtDate(p.start_date)}`.trim();
    const b = `hết ${(HALF_LABEL[p.end_half as Half] ?? "").toLowerCase()} ${fmtDate(p.end_date)}`;
    return [`📅 Thời gian: ${a} → ${b}`, `⏳ Số ngày nghỉ: ${fmtDays(Number(d.calc?.days ?? 0))} ngày`];
  }
  if (!p.date) return [];
  const sched = d.type === "late" ? d.calc?.session_start : d.calc?.session_end;
  const exp = d.calc?.expected_at ? fmtVn(d.calc.expected_at, false) : null;
  return [
    `📅 Ngày áp dụng: ${fmtDate(p.date)} (${HALF_LABEL[p.half as Half] ?? ""})`,
    sched ? `🕒 ${d.type === "late" ? "Giờ vào ca theo lịch" : "Giờ kết thúc theo lịch"}: ${sched}` : "",
    exp ? `🕒 Giờ dự kiến ${d.type === "late" ? "đến" : "về"}: ${exp}` : "",
  ].filter(Boolean);
}

/** Tin đơn mới gửi vào nhóm Nhân sự — ghi rõ đích danh người duyệt do nhân viên chọn. */
export function groupNewMessage(d: GroupMsgData, link: string): string {
  const title = `📋 CÓ ĐƠN ${up(TYPE_LABEL[d.type] ?? "ĐƠN TỪ")} MỚI${d.is_late ? " (ĐƠN BỔ SUNG)" : ""}`;
  return [
    title, "",
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
    link,
  ].filter(Boolean).join("\n");
}

/** Tin kết quả duyệt/từ chối — không công khai lý do từ chối chi tiết. */
export function groupResultMessage(event: "approved" | "rejected", d: GroupMsgData, link: string): string {
  const ok = event === "approved";
  const decider = d.decided_by_name || d.approver_name || "";
  return [
    ok ? "✅ ĐƠN ĐÃ ĐƯỢC PHÊ DUYỆT" : "❌ ĐƠN KHÔNG ĐƯỢC PHÊ DUYỆT", "",
    `👤 Nhân viên: ${d.owner_name}`,
    `📝 Loại đơn: ${groupTypeLabel(d)}`,
    ...groupTimeLines(d),
    "",
    decider ? `👨‍💼 ${ok ? "Người duyệt" : "Người xử lý"}: ${decider}` : "",
    ok ? "✅ Trạng thái: Đã duyệt" : "❌ Trạng thái: Từ chối",
    "",
    `🔗 Xem hồ sơ trên Base: ${link}`,
  ].filter(Boolean).join("\n");
}

/** Tin chuyển người duyệt — chỉ gửi sau khi database đã cập nhật người mới. */
export function groupReassignMessage(d: GroupMsgData, link: string): string {
  return [
    "🔄 THAY ĐỔI NGƯỜI PHÊ DUYỆT", "",
    `👤 Nhân viên gửi đơn: ${d.owner_name}`,
    `📝 Loại đơn: ${groupTypeLabel(d)}`,
    "",
    d.old_approver_name ? `👨‍💼 Người duyệt cũ: ${d.old_approver_name}` : "",
    d.approver_name ? `👨‍💼 NGƯỜI DUYỆT MỚI: ${up(d.approver_name)}` : "",
    "",
    d.approver_name ? `⏳ Trạng thái: Chờ ${d.approver_name} phê duyệt` : "",
    "",
    `🔗 Xem hồ sơ trên Base: ${link}`,
  ].filter(Boolean).join("\n");
}

export function groupMessage(event: GroupEvent, d: GroupMsgData, link: string): string {
  if (event === "new") return groupNewMessage(d, link);
  if (event === "reassign") return groupReassignMessage(d, link);
  return groupResultMessage(event, d, link);
}

/** Tóm tắt ngắn cho cột Hồ sơ trong lịch sử gửi. */
export function groupSummary(d: Pick<GroupMsgData, "type" | "is_late" | "owner_name">): string {
  return `${d.owner_name} · ${groupTypeLabel(d)}`;
}
