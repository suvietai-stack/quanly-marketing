export const TX_STATUS: Record<string, string> = {
  unclaimed: "Chưa xác nhận",
  pending_reconciliation: "Chờ đối soát",
  needs_info: "Cần bổ sung",
  reconciled: "Đã đối soát",
};
export const TX_VARIANT: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  unclaimed: "secondary", pending_reconciliation: "default", needs_info: "destructive", reconciled: "outline",
};
export const MONEY_TYPES: Record<string, string> = {
  deposit: "Tiền cọc", payment: "Thanh toán", extra_payment: "Thanh toán bổ sung", refund: "Hoàn tiền", other: "Khác",
};
export const EVENT_LABEL: Record<string, string> = {
  claim: "Sale xác nhận", edit: "Sale sửa thông tin", resubmit: "Sale gửi lại", request_info: "Kế toán yêu cầu bổ sung",
  reconcile: "Kế toán đối soát", reset: "Điều chỉnh: đưa về chưa xác nhận",
};
export const vnd = (n: number) => "+" + Number(n).toLocaleString("vi-VN") + "đ";
export const fmtTime = (iso: string | null, raw?: string | null) =>
  iso ? new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : raw || "—";
