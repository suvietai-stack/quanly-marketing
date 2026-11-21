const FR_KIND_LABEL = {
  advance: "Đề Nghị Tạm Ứng",
  payment: "Đề Nghị Thanh Toán",
  salary_advance: "Tạm Ứng Lương"
};
const FR_STATUS_LABEL = {
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
  cancelled: "Đã hủy"
};
const FR_STATUS_VARIANT = {
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
  cancelled: "outline"
};
const FR_QUICK_FILTERS = [
  { key: "", label: "Tất cả", statuses: [] },
  { key: "pending", label: "Chờ duyệt", statuses: ["pending", "info_requested", "needs_config"] },
  { key: "approved", label: "Đã duyệt", statuses: ["approved", "awaiting_payment"] },
  { key: "paying", label: "Chờ chi", statuses: ["awaiting_payment"] },
  { key: "done", label: "Hoàn tất", statuses: ["done"] }
];
const quickFilterStatuses = (key) => FR_QUICK_FILTERS.find((f) => f.key === key)?.statuses ?? [];
const vnd = (n) => n == null ? "—" : `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đ`;
const parseAmount = (s) => {
  const digits = s.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};
const fmtAmountInput = (s) => {
  const digits = s.replace(/[^\d]/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const frEditable = (status) => ["draft", "info_requested", "needs_config"].includes(status);
const frCancellable = (status) => ["draft", "needs_config", "pending", "info_requested"].includes(status);
const frRemainingToPay = (r) => Math.max(0, r.amount - r.paid_amount);
const frAdvanceRemaining = (r) => Math.max(0, r.paid_amount - r.settled_amount);
const frSalaryRemaining = (r) => Math.max(0, r.paid_amount - r.deducted_amount);
const emptyLine = () => ({ name: "", catalog_id: null, unit: "", qty: 1, unit_price: 0 });
const lineTotal = (l) => Math.round((l.qty || 0) * (l.unit_price || 0));
const isBlankLine = (l) => !l.name.trim() && !(l.unit_price > 0);
const isValidLine = (l) => !!l.name.trim() && l.qty > 0 && l.unit_price > 0;
const linesTotal = (ls) => ls.filter(isValidLine).reduce((s, l) => s + lineTotal(l), 0);
function validateLines(ls) {
  const filled = ls.filter((l) => !isBlankLine(l));
  if (!filled.length) return "Vui lòng nhập ít nhất một khoản chi hợp lệ.";
  for (const l of filled) {
    if (!l.name.trim()) return "Mỗi khoản chi cần có tên.";
    if (!(l.qty > 0)) return `Số lượng của "${l.name}" phải lớn hơn 0.`;
    if (!(l.unit_price > 0)) return `Đơn giá của "${l.name}" phải lớn hơn 0.`;
  }
  return null;
}
function frValidate(kind, v) {
  if (!v.amount || v.amount <= 0) return "Số tiền phải lớn hơn 0.";
  if (!v.title.trim()) return kind === "salary_advance" ? "Vui lòng nhập lý do tạm ứng." : "Vui lòng nhập mục đích/nội dung.";
  if (kind === "payment") {
    if (!v.paymentTypeId) return "Vui lòng chọn loại thanh toán.";
    if (!v.payeeName?.trim()) return "Vui lòng nhập đối tượng nhận tiền.";
  }
  if (kind === "advance" && !v.paymentTypeId) return "Vui lòng chọn loại tạm ứng.";
  if (v.isOther && !v.otherLabel?.trim()) return "Vui lòng nhập loại cụ thể khi chọn Khác.";
  if (kind === "salary_advance" && v.salaryTypeRequired && !v.paymentTypeId) return "Vui lòng chọn phân loại tạm ứng lương.";
  if (kind === "salary_advance" && !v.salaryPeriod?.trim()) return "Vui lòng chọn kỳ lương dự kiến khấu trừ.";
  return null;
}
export {
  FR_KIND_LABEL as F,
  FR_STATUS_LABEL as a,
  FR_QUICK_FILTERS as b,
  FR_STATUS_VARIANT as c,
  frRemainingToPay as d,
  emptyLine as e,
  fmtAmountInput as f,
  frAdvanceRemaining as g,
  frSalaryRemaining as h,
  frEditable as i,
  frCancellable as j,
  isBlankLine as k,
  linesTotal as l,
  lineTotal as m,
  validateLines as n,
  frValidate as o,
  parseAmount as p,
  quickFilterStatuses as q,
  vnd as v
};
