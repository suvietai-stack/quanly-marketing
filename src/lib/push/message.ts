/** Dựng nội dung Web Push — hàm thuần. Không bao giờ đưa SĐT, địa chỉ, lý do, chi tiết giải trình, ghi chú từ chối. */
import { leaveSummary } from "../leave/zaloMessage";
import { TYPE_LABEL } from "../leave/calc";
import { KIND_LABEL, declaredTime } from "../leave/attendance";
import { fmtDate } from "../leave/calc";

export const PUSH_KINDS = ["signal_new", "signal_assigned", "leave_pending", "leave_result", "leave_cancel_request", "leave_cc", "att_witness", "att_new"] as const;
export type PushKind = (typeof PUSH_KINDS)[number];
export interface PushMsg { title: string; body: string; url: string; tag: string }

const RESULT: Record<string, string> = {
  approve: "Đơn của bạn đã được duyệt.", reject: "Đơn của bạn bị từ chối.",
  cancel_approve: "Đơn của bạn đã được hủy.", cancel_reject: "Yêu cầu hủy đơn bị từ chối.",
  exception: "Đơn của bạn đã được xử lý ngoại lệ.", created_for: "Có đơn được tạo hộ bạn.",
};

export function pushMessage(kind: PushKind, d: any, brand = "BASE"): Omit<PushMsg, "url" | "tag"> {
  const lines = (a: (string | false | null | undefined)[]) => a.filter(Boolean).join("\n");
  if (kind === "signal_new" || kind === "signal_assigned") {
    const products = (d.products ?? []).join(", ");
    return { title: brand, body: lines([
      kind === "signal_new" ? "Có tín hiệu cơ hội mới cần phân công." : "Bạn có tín hiệu cơ hội mới.",
      d.customer_name && `Khách hàng: ${d.customer_name}`, products && `Sản phẩm: ${products}`, "Nhấn để xem chi tiết."]) };
  }
  if (kind.startsWith("leave_")) {
    const type = (TYPE_LABEL as any)[d.type] ?? "đơn";
    const t = leaveSummary(d);
    const head = kind === "leave_pending" ? `Có ${type.toLowerCase()} chờ phê duyệt.`
      : kind === "leave_cancel_request" ? `Có yêu cầu hủy ${type.toLowerCase()} cần duyệt.`
      : kind === "leave_cc" ? (d.action === "cancel_approve" ? `${type} đã duyệt được hủy.` : `${type} đã được phê duyệt.`)
      : RESULT[d.action ?? ""] ?? "Đơn từ có cập nhật.";
    return { title: brand, body: lines([head, kind !== "leave_result" && d.owner_name && `Nhân viên: ${d.owner_name}`,
      t && `Thời gian: ${t}`, kind === "leave_cc" && d.approver_name && `Người phê duyệt: ${d.approver_name}`,
      kind === "leave_pending" || kind === "leave_cancel_request" ? "Nhấn để xem và phê duyệt." : "Nhấn để xem đơn."]) };
  }
  return { title: brand, body: lines([
    kind === "att_witness" ? "Bạn được đề nghị xác nhận làm chứng giải trình chấm công." : "Có giải trình chấm công mới.",
    d.owner_name && `Nhân viên: ${d.owner_name}`, d.work_date && `Ngày: ${fmtDate(d.work_date)}`,
    d.kind && `${(KIND_LABEL as any)[d.kind] ?? ""}${declaredTime(d) ? ` · ${declaredTime(d)}` : ""}`,
    kind === "att_witness" ? "Nhấn để xem và xác nhận." : "Nhấn để xem giải trình."]) };
}
