/** Dựng tin Zalo cho Đơn từ — hàm thuần. Không đưa phần "chi tiết" tự nhập vào tin. */
import { TYPE_LABEL, HALF_LABEL, fmtDate, fmtDays, fmtVn, type LeaveType, type Half } from "./calc";

export type LeaveKind = "leave_pending" | "leave_result" | "leave_cancel_request" | "leave_cc";
export interface LeaveMsgData {
  type: LeaveType; payload: any; calc: any; reason_name?: string | null;
  owner_name?: string | null; action?: string | null; approver_name?: string | null; decision_note?: string | null;
}

export function leaveSummary(d: Pick<LeaveMsgData, "type" | "payload" | "calc">): string {
  const p = d.payload || {};
  if (d.type === "leave") {
    if (!p.start_date || !p.end_date) return "";
    const a = `${HALF_LABEL[p.start_half as Half] ?? ""} ${fmtDate(p.start_date)}`.trim();
    const b = `hết ${(HALF_LABEL[p.end_half as Half] ?? "").toLowerCase()} ${fmtDate(p.end_date)}`;
    return `${a} → ${b} · ${fmtDays(Number(d.calc?.days ?? 0))} ngày`;
  }
  if (!p.date) return "";
  const exp = d.calc?.expected_at ? ` · ${d.type === "late" ? "có mặt" : "ra về"} ${fmtVn(d.calc.expected_at, false)}` : "";
  return `${fmtDate(p.date)} (${HALF_LABEL[p.half as Half] ?? ""}) · ${p.minutes} phút${exp}`;
}

const RESULT: Record<string, string> = {
  approve: "✅ ĐƠN CỦA BẠN ĐÃ ĐƯỢC DUYỆT",
  reject: "❌ ĐƠN CỦA BẠN BỊ TỪ CHỐI",
  cancel_approve: "🗑️ ĐƠN CỦA BẠN ĐÃ ĐƯỢC HỦY",
  cancel_reject: "↩️ YÊU CẦU HỦY ĐƠN BỊ TỪ CHỐI",
  exception: "⚠️ ĐƠN CỦA BẠN ĐÃ ĐƯỢC XỬ LÝ NGOẠI LỆ",
  created_for: "📝 CÓ ĐƠN ĐƯỢC TẠO HỘ BẠN",
};

export function leaveMessage(kind: LeaveKind, d: LeaveMsgData, brand = "BASE MARKETING") {
  if (kind === "leave_cc") {
    const cancel = d.action === "cancel_approve";
    const lines = [
      d.owner_name ? `👤 Nhân viên: ${d.owner_name}` : "",
      `📄 Loại đơn: ${TYPE_LABEL[d.type] ?? ""}`,
      leaveSummary(d) ? `🕒 Thời gian: ${leaveSummary(d)}` : "",
      d.approver_name ? `✍️ Người phê duyệt: ${d.approver_name}` : "",
      `📌 Kết quả: ${cancel ? "Đã chấp thuận hủy đơn" : "Đã phê duyệt"}`,
    ].filter(Boolean);
    return { header: `${brand} — ${cancel ? "🗑️ ĐƠN ĐÃ DUYỆT ĐƯỢC HỦY" : "✅ ĐƠN ĐÃ ĐƯỢC PHÊ DUYỆT"}`, text: lines.join("\n"), button: "XEM ĐƠN" };
  }
  const title = kind === "leave_pending"
    ? (d.action === "resubmit" ? "📝 ĐƠN GỬI LẠI CẦN DUYỆT" : "📝 ĐƠN MỚI CẦN DUYỆT")
    : kind === "leave_cancel_request" ? "🗑️ YÊU CẦU HỦY ĐƠN CẦN DUYỆT"
    : RESULT[d.action ?? ""] ?? "📝 CẬP NHẬT ĐƠN TỪ";
  const lines = [
    `📄 Loại đơn: ${TYPE_LABEL[d.type] ?? ""}`,
    kind !== "leave_result" && d.owner_name ? `👤 Người đứng tên: ${d.owner_name}` : "",
    leaveSummary(d) ? `🕒 Thời gian: ${leaveSummary(d)}` : "",
    d.reason_name ? `📌 Lý do: ${d.reason_name}` : "",
    kind === "leave_result" && d.decision_note && ["reject", "cancel_reject", "exception"].includes(d.action ?? "") ? `💬 Ghi chú: ${d.decision_note}` : "",
  ].filter(Boolean);
  return { header: `${brand} — ${title}`, text: lines.join("\n"), button: kind === "leave_result" ? "XEM ĐƠN" : "XEM VÀ DUYỆT" };
}

export function remindMessage(count: number, overdue: number, brand = "BASE MARKETING") {
  const lines = [`Bạn có ${count} đơn đang chờ duyệt.`, overdue ? `⏰ Sắp tới / đã tới giờ bắt đầu: ${overdue}` : ""].filter(Boolean);
  return { header: `⏳ ${brand} — NHẮC DUYỆT ĐƠN`, text: lines.join("\n"), button: "XEM ĐƠN CHỜ DUYỆT" };
}

/** Đơn cần nhắc: chờ duyệt quá N giờ, hoặc giờ bắt đầu còn ≤ 2 giờ. */
export function needsRemind(r: { status: string; submitted_at: string; mark_at: string }, hours: number, now = new Date()) {
  if (r.status !== "pending") return { remind: false, soon: false };
  const soon = new Date(r.mark_at).getTime() - now.getTime() <= 2 * 3600000;
  const old = now.getTime() - new Date(r.submitted_at).getTime() >= hours * 3600000;
  return { remind: soon || old, soon };
}
