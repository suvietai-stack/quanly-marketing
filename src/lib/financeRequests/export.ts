import type { FrKind, FrStatus } from "./logic";
import { FR_KIND_LABEL, FR_STATUS_LABEL } from "./logic";

// Xuất Excel chỉ dùng các đề nghị người dùng đã đọc được qua RLS (fr_can_view) — không có đường đọc riêng.
export type FrExportRequest = {
  id: string; code: string; kind: FrKind; requester_id: string; amount: number; title: string; detail: string | null;
  desired_date: string | null; payee_name: string | null; payee_info: string | null; note: string | null;
  payment_type_id: string | null; advance_type_id: string | null; other_label: string | null;
  supplier_name: string | null; supplier_tax: string | null; supplier_bank: string | null; invoice_no: string | null;
  salary_period: string | null; status: FrStatus; paid_amount: number; paid_at: string | null; pay_method: string | null; pay_ref: string | null;
  settled_amount: number; deducted_amount: number; submitted_at: string | null; approved_at: string | null; created_at: string;
};
export type FrExportLine = { request_id: string; line_no: number; name: string; unit: string | null; qty: number; unit_price: number; line_total: number };
export type FrExportLookups = { names: Record<string, string>; types: Record<string, string> };

const day = (s: string | null | undefined) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  // Ngày theo giờ Việt Nam, dạng dd/mm/yyyy để dán thẳng vào Excel/Google Sheets.
  return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
};
const num = (n: number | null | undefined) => Number(n ?? 0);

export function frExportRows(kind: FrKind, rows: FrExportRequest[], lk: FrExportLookups): (string | number)[][] {
  const typeName = (r: FrExportRequest) => {
    const id = kind === "payment" ? r.payment_type_id : r.advance_type_id;
    const n = id ? lk.types[id] ?? "" : "";
    return r.other_label ? `${n} — ${r.other_label}` : n;
  };
  const head = ["Mã", "Ngày tạo", "Người đề nghị", kind === "salary_advance" ? "Phân loại" : kind === "advance" ? "Loại tạm ứng" : "Loại thanh toán",
    kind === "salary_advance" ? "Lý do" : kind === "advance" ? "Mục đích" : "Nội dung", "Số tiền", "Trạng thái",
    "Ngày gửi", "Ngày duyệt", "Đã chi", "Ngày chi", "Hình thức chi", "Mã giao dịch chi"];
  if (kind === "advance") head.push("Đã quyết toán", "Còn phải quyết toán");
  if (kind === "salary_advance") head.push("Kỳ lương khấu trừ", "Đã khấu trừ/hoàn trả", "Còn lại");
  if (kind === "payment") head.push("Còn phải trả", "Đối tượng nhận", "Thông tin nhận tiền", "Nhà cung cấp", "MST", "Số hóa đơn", "Ngân hàng NCC");
  if (kind === "advance") head.push("Người/đơn vị nhận", "Thông tin nhận tiền", "Chi tiết");
  head.push("Ngày mong muốn", "Ghi chú");
  const body = rows.map((r) => {
    const row: (string | number)[] = [r.code, day(r.created_at), lk.names[r.requester_id] ?? "", typeName(r), r.title, num(r.amount),
      FR_STATUS_LABEL[r.status] ?? r.status, day(r.submitted_at), day(r.approved_at), num(r.paid_amount), day(r.paid_at), r.pay_method ?? "", r.pay_ref ?? ""];
    if (kind === "advance") row.push(num(r.settled_amount), Math.max(0, num(r.paid_amount) - num(r.settled_amount)));
    if (kind === "salary_advance") row.push(r.salary_period ?? "", num(r.deducted_amount), Math.max(0, num(r.paid_amount) - num(r.deducted_amount)));
    if (kind === "payment") row.push(Math.max(0, num(r.amount) - num(r.paid_amount)), r.payee_name ?? "", r.payee_info ?? "", r.supplier_name ?? "", r.supplier_tax ?? "", r.invoice_no ?? "", r.supplier_bank ?? "");
    if (kind === "advance") row.push(r.payee_name ?? "", r.payee_info ?? "", r.detail ?? "");
    row.push(day(r.desired_date), r.note ?? "");
    return row;
  });
  return [head, ...body];
}

export function frExportLineRows(rows: FrExportRequest[], lines: FrExportLine[]): (string | number)[][] {
  const code = new Map(rows.map((r) => [r.id, r.code]));
  const body = lines.filter((l) => code.has(l.request_id))
    .sort((a, b) => (code.get(a.request_id)! < code.get(b.request_id)! ? -1 : code.get(a.request_id)! > code.get(b.request_id)! ? 1 : a.line_no - b.line_no))
    .map((l) => [code.get(l.request_id)!, l.line_no, l.name, l.unit ?? "", num(l.qty), num(l.unit_price), num(l.line_total)]);
  return [["Mã đề nghị", "STT", "Khoản chi", "Đơn vị", "Số lượng", "Đơn giá", "Thành tiền"], ...body];
}

export function frExportFileName(kind: FrKind, now = new Date()) {
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
  const slug = { advance: "de-nghi-tam-ung", payment: "de-nghi-thanh-toan", salary_advance: "tam-ung-luong" }[kind];
  return `${slug}-${d}.xlsx`;
}

export const frExportTitle = (kind: FrKind) => FR_KIND_LABEL[kind];
