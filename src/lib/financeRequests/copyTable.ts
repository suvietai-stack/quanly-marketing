/**
 * Bảng kê khoản chi dạng TSV để dán trực tiếp vào Excel/Google Sheets.
 * Thứ tự cột khớp với bảng trên màn hình; không thêm mã đề nghị hay metadata.
 */
export type ExpenseCopyLine = {
  name: string;
  unit: string | null;
  qty: number;
  unit_price: number;
  line_total?: number;
};

const cell = (value: string | number | null | undefined) =>
  String(value ?? "").replace(/[\t\r\n]+/g, " ").trim();

export function expenseLinesTsv(lines: ExpenseCopyLine[]): string {
  const header = ["STT", "Tên khoản chi", "ĐVT", "SL", "Đơn giá", "Thành tiền"];
  const body = lines.map((line, index) => [
    index + 1,
    line.name,
    line.unit ?? "",
    line.qty,
    line.unit_price,
    line.line_total ?? Math.round(line.qty * line.unit_price),
  ]);
  return [header, ...body].map((row) => row.map(cell).join("\t")).join("\r\n");
}
