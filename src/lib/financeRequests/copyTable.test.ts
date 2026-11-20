import { describe, expect, it } from "vitest";
import { expenseLinesTsv } from "./copyTable";

describe("copy payment expense table to Excel", () => {
  it("preserves column order, numeric amounts and row count", () => {
    const tsv = expenseLinesTsv([
      { name: "In catalogue", unit: "bộ", qty: 2, unit_price: 150000, line_total: 300000 },
      { name: "Vận chuyển", unit: null, qty: 1, unit_price: 50000 },
    ]);
    const rows = tsv.split("\r\n").map((row) => row.split("\t"));
    expect(rows[0]).toEqual(["STT", "Tên khoản chi", "ĐVT", "SL", "Đơn giá", "Thành tiền"]);
    expect(rows[1]).toEqual(["1", "In catalogue", "bộ", "2", "150000", "300000"]);
    expect(rows[2]).toEqual(["2", "Vận chuyển", "", "1", "50000", "50000"]);
    expect(rows.every((row) => row.length === 6)).toBe(true);
  });

  it("removes embedded tabs and newlines so cells cannot shift", () => {
    const rows = expenseLinesTsv([{ name: "In\tcatalogue\nA", unit: "cái", qty: 1, unit_price: 20000 }]).split("\r\n");
    expect(rows).toHaveLength(2);
    expect(rows[1].split("\t")).toHaveLength(6);
    expect(rows[1]).toContain("In catalogue A");
  });
});
