// Logic thuần cho 3 chức năng Đề nghị Tài chính (Tạm Ứng / Thanh Toán / Tạm Ứng Lương).
// Backend (fr_* RPC) là nguồn xác thực; file này chỉ phục vụ hiển thị và kiểm tra phía client.

export type FrKind = "advance" | "payment" | "salary_advance";

export const FR_KIND_LABEL: Record<FrKind, string> = {
  advance: "Đề Nghị Tạm Ứng",
  payment: "Đề Nghị Thanh Toán",
  salary_advance: "Tạm Ứng Lương",
};

export const FR_KIND_CODE: Record<FrKind, string> = { advance: "TU", payment: "TT", salary_advance: "UL" };

export type FrStatus =
  | "draft" | "needs_config" | "pending" | "info_requested" | "approved" | "rejected"
  | "awaiting_payment" | "paid" | "settling" | "done" | "cancelled";

export const FR_STATUS_LABEL: Record<FrStatus, string> = {
  draft: "Nháp",
  needs_config: "Chờ cấu hình duyệt",
  pending: "Chờ phê duyệt",
  info_requested: "Yêu cầu bổ sung",
  approved: "Đã phê duyệt",
  rejected: "Từ chối",
  awaiting_payment: "Chờ chi tiền",
  paid: "Đã chi",
  settling: "Chờ quyết toán",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const FR_STATUS_VARIANT: Record<FrStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  needs_config: "outline",
  pending: "secondary",
  info_requested: "secondary",
  approved: "default",
  rejected: "destructive",
  awaiting_payment: "secondary",
  paid: "default",
  settling: "secondary",
  done: "default",
  cancelled: "outline",
};

/** Nhóm lọc nhanh trên danh sách → tập trạng thái tương ứng. */
export const FR_QUICK_FILTERS: { key: string; label: string; statuses: FrStatus[] }[] = [
  { key: "", label: "Tất cả", statuses: [] },
  { key: "pending", label: "Chờ duyệt", statuses: ["pending", "info_requested", "needs_config"] },
  { key: "approved", label: "Đã duyệt", statuses: ["approved", "awaiting_payment"] },
  { key: "paying", label: "Chờ chi", statuses: ["awaiting_payment"] },
  { key: "done", label: "Hoàn tất", statuses: ["done"] },
];

export const quickFilterStatuses = (key: string): FrStatus[] =>
  FR_QUICK_FILTERS.find((f) => f.key === key)?.statuses ?? [];

/** Định dạng tiền VNĐ. */
export const vnd = (n: number | null | undefined) =>
  n == null ? "—" : `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đ`;

/** Chuỗi nhập → số tiền (bỏ mọi ký tự không phải số). */
export const parseAmount = (s: string): number => {
  const digits = s.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

/** Số → chuỗi nhập có chấm ngàn. */
export const fmtAmountInput = (s: string): string => {
  const digits = s.replace(/[^\d]/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/** Đề nghị còn sửa/hủy được bởi người tạo. */
export const frEditable = (status: string) => ["draft", "info_requested", "needs_config"].includes(status);
export const frCancellable = (status: string) => ["draft", "needs_config", "pending", "info_requested"].includes(status);

/** Còn phải chi (hỗ trợ chi một phần). */
export const frRemainingToPay = (r: { amount: number; paid_amount: number }) => Math.max(0, r.amount - r.paid_amount);

/** Số dư tạm ứng chưa quyết toán. */
export const frAdvanceRemaining = (r: { paid_amount: number; settled_amount: number }) =>
  Math.max(0, r.paid_amount - r.settled_amount);

/** Số dư tạm ứng lương chưa khấu trừ. */
export const frSalaryRemaining = (r: { paid_amount: number; deducted_amount: number }) =>
  Math.max(0, r.paid_amount - r.deducted_amount);

/** Trạng thái hiển thị theo loại: chỉ dùng trạng thái phù hợp từng chức năng. */
export const frStatusesForKind = (kind: FrKind): FrStatus[] => {
  if (kind === "advance")
    return ["draft", "needs_config", "pending", "info_requested", "rejected", "awaiting_payment", "settling", "done", "cancelled"];
  if (kind === "payment")
    return ["draft", "needs_config", "pending", "info_requested", "rejected", "awaiting_payment", "paid", "done", "cancelled"];
  return ["draft", "needs_config", "pending", "info_requested", "rejected", "awaiting_payment", "paid", "done", "cancelled"];
};

// ===== Bảng kê khoản chi (Đề Nghị Thanh Toán; component dùng chung, có thể tái dùng cho Tạm Ứng) =====

export type FrLine = {
  id?: string;
  name: string;
  catalog_id?: string | null;
  unit: string;
  qty: number;
  unit_price: number;
};

export const emptyLine = (): FrLine => ({ name: "", catalog_id: null, unit: "", qty: 1, unit_price: 0 });

/** Thành tiền một dòng = SL × Đơn giá (làm tròn đồng). */
export const lineTotal = (l: Pick<FrLine, "qty" | "unit_price">) => Math.round((l.qty || 0) * (l.unit_price || 0));

/** Dòng hoàn toàn trống (chưa nhập gì) — bỏ qua khi lưu. */
export const isBlankLine = (l: FrLine) => !l.name.trim() && !(l.unit_price > 0);

/** Dòng hợp lệ: có tên, SL > 0, đơn giá > 0. */
export const isValidLine = (l: FrLine) => !!l.name.trim() && l.qty > 0 && l.unit_price > 0;

/** Tổng tiền đề nghị = tổng thành tiền các dòng hợp lệ. */
export const linesTotal = (ls: FrLine[]) => ls.filter(isValidLine).reduce((s, l) => s + lineTotal(l), 0);

/** Kiểm tra bảng kê trước khi lưu (client-side, backend vẫn kiểm lại và tự tính tổng). */
export function validateLines(ls: FrLine[]): string | null {
  const filled = ls.filter((l) => !isBlankLine(l));
  if (!filled.length) return "Vui lòng nhập ít nhất một khoản chi hợp lệ.";
  for (const l of filled) {
    if (!l.name.trim()) return "Mỗi khoản chi cần có tên.";
    if (!(l.qty > 0)) return `Số lượng của "${l.name}" phải lớn hơn 0.`;
    if (!(l.unit_price > 0)) return `Đơn giá của "${l.name}" phải lớn hơn 0.`;
  }
  return null;
}

/** Kiểm tra hợp lệ trước khi lưu (client-side, backend vẫn kiểm lại). */
export function frValidate(kind: FrKind, v: {
  amount: number; title: string; paymentTypeId?: string; payeeName?: string;
  advanceId?: string; salaryPeriod?: string; settleTypeName?: string;
}): string | null {
  if (!v.amount || v.amount <= 0) return "Số tiền phải lớn hơn 0.";
  if (!v.title.trim()) return kind === "salary_advance" ? "Vui lòng nhập lý do tạm ứng." : "Vui lòng nhập mục đích/nội dung.";
  if (kind === "payment") {
    if (!v.paymentTypeId) return "Vui lòng chọn loại thanh toán.";
    if (!v.payeeName?.trim()) return "Vui lòng nhập đối tượng nhận tiền.";
    if (v.settleTypeName === "Quyết toán/hoàn ứng tạm ứng" && !v.advanceId)
      return "Vui lòng chọn khoản tạm ứng cần quyết toán.";
  }
  if (kind === "salary_advance" && !v.salaryPeriod?.trim()) return "Vui lòng chọn kỳ lương dự kiến khấu trừ.";
  return null;
}
