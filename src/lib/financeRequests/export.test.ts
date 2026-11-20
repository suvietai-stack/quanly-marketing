import { describe, it, expect } from "vitest";
import { frExportRows, frExportLineRows, frExportFileName, type FrExportRequest } from "./export";

const base: FrExportRequest = {
  id: "r1", code: "TT-00001", kind: "payment", requester_id: "u1", amount: 1500000, title: "Mua vật tư", detail: null,
  desired_date: "2026-11-25", payee_name: "Cty A", payee_info: "VCB 123", note: null,
  payment_type_id: "t1", advance_type_id: null, other_label: null, supplier_name: "Cty A", supplier_tax: "0101", supplier_bank: null, invoice_no: "HD1",
  salary_period: null, status: "awaiting_payment", paid_amount: 500000, paid_at: null, pay_method: null, pay_ref: null,
  settled_amount: 0, deducted_amount: 0, submitted_at: "2026-11-20T01:00:00Z", approved_at: null, created_at: "2026-11-19T20:00:00Z",
};
const lk = { names: { u1: "Nguyễn Văn A" }, types: { t1: "Nhà cung cấp", s1: "Y tế" } };

describe("finance request Excel export", () => {
  it("payment row has numeric amounts, VN date, names and remaining to pay", () => {
    const [head, row] = frExportRows("payment", [base], lk);
    const at = (h: string) => row[head.indexOf(h)];
    expect(at("Mã")).toBe("TT-00001");
    expect(at("Ngày tạo")).toBe("20/11/2026"); // 20:00Z = 03:00 giờ VN ngày 20
    expect(at("Người đề nghị")).toBe("Nguyễn Văn A");
    expect(at("Loại thanh toán")).toBe("Nhà cung cấp");
    expect(at("Số tiền")).toBe(1500000);
    expect(at("Còn phải trả")).toBe(1000000);
    expect(at("Trạng thái")).toBe("Chờ chi tiền");
    expect(row).toHaveLength(head.length);
  });
  it("salary advance uses its category, period and remaining", () => {
    const r = { ...base, kind: "salary_advance" as const, payment_type_id: null, advance_type_id: "s1", other_label: null, salary_period: "2026-12", paid_amount: 3000000, deducted_amount: 1000000 };
    const [head, row] = frExportRows("salary_advance", [r], lk);
    expect(row[head.indexOf("Phân loại")]).toBe("Y tế");
    expect(row[head.indexOf("Kỳ lương khấu trừ")]).toBe("2026-12");
    expect(row[head.indexOf("Còn lại")]).toBe(2000000);
    expect(head).not.toContain("Nhà cung cấp");
  });
  it("lines sheet only includes exported requests in code/line order", () => {
    const lines = [
      { request_id: "r1", line_no: 2, name: "B", unit: null, qty: 1, unit_price: 2, line_total: 2 },
      { request_id: "r1", line_no: 1, name: "A", unit: "cái", qty: 2, unit_price: 3, line_total: 6 },
      { request_id: "hidden", line_no: 1, name: "X", unit: null, qty: 1, unit_price: 1, line_total: 1 },
    ];
    const out = frExportLineRows([base], lines);
    expect(out.slice(1).map((r) => r[2])).toEqual(["A", "B"]);
  });
  it("file name uses Vietnam date", () => {
    expect(frExportFileName("advance", new Date("2026-11-20T18:00:00Z"))).toBe("de-nghi-tam-ung-2026-11-21.xlsx");
  });
});
