// Hai trạng thái nghiệp vụ; trạng thái đối soát cũ chỉ còn dùng để đọc lịch sử.
export const TX_STATUS: Record<string, string> = {
  unclaimed: "Chưa xác nhận",
  confirmed: "Đã xác nhận",
};
export const TX_VARIANT: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  unclaimed: "secondary", confirmed: "outline",
};
export const MONEY_TYPES: Record<string, string> = {
  deposit: "Tiền cọc", payment: "Thanh toán", extra_payment: "Thanh toán bổ sung", refund: "Hoàn tiền", other: "Khác",
};
export const SOURCES: Record<string, string> = { cash: "Tiền mặt", other_account: "TK khác" };
export const EVENT_LABEL: Record<string, string> = {
  claim: "Sale xác nhận", edit: "Sale sửa thông tin", resubmit: "Sale cập nhật theo yêu cầu", request_info: "Kế toán yêu cầu chỉnh sửa",
  confirm_other: "Kế toán xác nhận loại Khác", note_edit: "Điều chỉnh ghi chú",
  reconcile: "Kế toán đối soát (lịch sử)", reset: "Điều chỉnh: đưa về chưa xác nhận",
  manual_create: "Tạo khoản thủ công", manual_edit: "Sửa khoản thủ công", manual_cancel: "Hủy khoản thủ công",
};
export type BankLabel = { id: string; label: string; bank_name: string; last4: string; active: boolean };
export const vnd = (n: number) => "+" + Number(n).toLocaleString("vi-VN") + "đ";
export function checkNoteError(f: { customer: string; type: string; note: string }): string | null {
  if (!f.type) return "Vui lòng chọn Loại tiền";
  if (f.type !== "other" && !f.customer.trim()) return "Vui lòng nhập Khách hàng";
  if (!f.note.trim()) return f.type === "other" ? "Vui lòng nhập Ghi chú khoản tiền" : "Vui lòng nhập Ghi chú chi tiết";
  return null;
}
export const fmtTime = (iso: string | null, raw?: string | null) =>
  iso ? new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : raw || "—";
export const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");
export const mask = (s: string | null) => { const d = String(s ?? "").replace(/\D/g, ""); return d.length >= 4 ? `****${d.slice(-4)}` : ""; };
/** Tên TK nhận / nguồn tiền: tên gợi nhớ là nội dung chính. */
export function receiver(t: { source?: string | null; bank_account_id?: string | null; bank_name?: string | null }, labels?: BankLabel[]) {
  if (t.source && t.source !== "bank") return { main: SOURCES[t.source] ?? t.source, sub: "" };
  const l = labels?.find((x) => x.id === t.bank_account_id);
  return { main: l?.label || t.bank_name || "—", sub: l ? `${l.bank_name} · ****${l.last4}` : t.bank_name || "" };
}
/** Bỏ ký tự đặc biệt của bộ lọc PostgREST. */
export const safeQ = (q: string) => q.replace(/[,()*%\\:"']/g, " ").trim().slice(0, 100);
/** Chỉ nhận số nguyên hoặc nhóm hàng nghìn; tìm đúng số tiền, không tìm chuỗi con. */
export function searchAmount(q: string): number | null {
  const text = q.trim();
  if (!/^[0-9]+([.,][0-9]{3})*$/.test(text)) return null;
  const digits = text.replace(/[.,]/g, "");
  if (digits.length > 16) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : null;
}
/** Ngày VN (YYYY-MM-DD) → mốc thời gian. */
export const vnStart = (d: string) => (d ? new Date(`${d}T00:00:00+07:00`).toISOString() : null);
export const vnEndExcl = (d: string) => (d ? new Date(new Date(`${d}T00:00:00+07:00`).getTime() + 86400000).toISOString() : null);

/** Chuẩn hóa liên kết bộ lọc cũ; các truy vấn dùng trạng thái xác nhận thật. */
export function confirmationFilter(status: string): string {
  if (["confirmed", "pending_reconciliation", "reconciled"].includes(status)) return "confirmed";
  return status === "unclaimed" ? "unclaimed" : "";
}
export function confirmationActions(t: { confirmation_status: string; claimed_by: string | null; operation_test: boolean; cancelled_at: string | null }, userId: string | undefined, claim: boolean, accounting: boolean, manage: boolean) {
  const active = !t.operation_test && !t.cancelled_at;
  const unowned = t.confirmation_status === "unclaimed" && !t.claimed_by;
  return { sale: active && claim && unowned, other: active && accounting && unowned, note: active && (accounting || manage || (claim && !!userId && t.claimed_by === userId)) };
}
