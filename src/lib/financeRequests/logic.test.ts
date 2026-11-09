import { describe, it, expect } from "vitest";
import {
  parseAmount, fmtAmountInput, vnd, frValidate, quickFilterStatuses,
  frEditable, frCancellable, frRemainingToPay, frAdvanceRemaining, frSalaryRemaining, frStatusesForKind,
  emptyLine, isBlankLine, isValidLine, lineTotal, linesTotal, validateLines,
} from "./logic";

describe("finance request rules", () => {
  it("parses and formats VND amounts", () => {
    expect(parseAmount("5.000.000")).toBe(5000000);
    expect(parseAmount("abc")).toBe(0);
    expect(fmtAmountInput("5000000")).toBe("5.000.000");
    expect(vnd(1500000)).toBe("1.500.000 đ");
    expect(vnd(null)).toBe("—");
  });
  it("validates required fields per kind", () => {
    expect(frValidate("advance", { amount: 0, title: "" })).toMatch(/Số tiền/);
    expect(frValidate("advance", { amount: 100, title: "" })).toMatch(/mục đích/);
    expect(frValidate("advance", { amount: 100, title: "Mua vật tư" })).toMatch(/loại tạm ứng/);
    expect(frValidate("advance", { amount: 100, title: "Mua vật tư", paymentTypeId: "t" })).toBeNull();
    expect(frValidate("payment", { amount: 100, title: "Chi" })).toMatch(/loại thanh toán/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t" })).toMatch(/nhận tiền/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t", payeeName: "NCC", isSettle: true })).toMatch(/tạm ứng/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t", payeeName: "NCC", isSettle: true, advanceId: "a" })).toBeNull();
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t", payeeName: "NCC", isOther: true })).toMatch(/loại cụ thể/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t", payeeName: "NCC", isOther: true, otherLabel: "Thuê thiết bị" })).toBeNull();
    expect(frValidate("salary_advance", { amount: 100, title: "Ứng lương" })).toMatch(/kỳ lương/);
    expect(frValidate("salary_advance", { amount: 100, title: "Ứng lương", salaryPeriod: "2026-11" })).toBeNull();
  });
  it("quick filters map to status sets without overlap surprises", () => {
    expect(quickFilterStatuses("")).toEqual([]);
    expect(quickFilterStatuses("pending")).toContain("pending");
    expect(quickFilterStatuses("done")).toEqual(["done"]);
  });
  it("edit and cancel only before processing", () => {
    expect(frEditable("draft")).toBe(true);
    expect(frEditable("info_requested")).toBe(true);
    expect(frEditable("pending")).toBe(false);
    expect(frCancellable("pending")).toBe(true);
    expect(frCancellable("awaiting_payment")).toBe(false);
    expect(frCancellable("done")).toBe(false);
  });
  it("tracks remaining amounts without going negative", () => {
    expect(frRemainingToPay({ amount: 100, paid_amount: 30 })).toBe(70);
    expect(frRemainingToPay({ amount: 100, paid_amount: 100 })).toBe(0);
    expect(frAdvanceRemaining({ paid_amount: 100, settled_amount: 40 })).toBe(60);
    expect(frSalaryRemaining({ paid_amount: 100, deducted_amount: 100 })).toBe(0);
  });
  it("each kind only uses its suitable statuses", () => {
    expect(frStatusesForKind("advance")).toContain("settling");
    expect(frStatusesForKind("payment")).not.toContain("settling");
    expect(frStatusesForKind("salary_advance")).not.toContain("settling");
  });
});

describe("expense lines (bảng kê khoản chi)", () => {
  const line = (over: Partial<ReturnType<typeof emptyLine>> = {}) => ({ ...emptyLine(), ...over });
  it("computes line total and request total exactly", () => {
    expect(lineTotal({ qty: 100, unit_price: 15000 })).toBe(1500000);
    expect(lineTotal({ qty: 2.5, unit_price: 80000 })).toBe(200000);
    expect(linesTotal([
      line({ name: "In catalogue", qty: 100, unit_price: 15000 }),
      line({ name: "Vận chuyển", qty: 1, unit_price: 300000 }),
    ])).toBe(1800000);
  });
  it("blank rows are skipped, named rows must have price", () => {
    expect(isBlankLine(emptyLine())).toBe(true);
    expect(isBlankLine(line({ name: "Vận chuyển" }))).toBe(false);
    expect(isValidLine(line({ name: "Vận chuyển" }))).toBe(false);
    expect(isValidLine(line({ name: "Vận chuyển", unit_price: 300000 }))).toBe(true);
    expect(validateLines([emptyLine()])).toMatch(/ít nhất một khoản chi/);
    expect(validateLines([line({ name: "Vận chuyển" })])).toMatch(/Đơn giá/);
    expect(validateLines([line({ name: "Vận chuyển", qty: 0, unit_price: 5 })])).toMatch(/Số lượng/);
    expect(validateLines([line({ name: "Vận chuyển", unit_price: 300000 })])).toBeNull();
  });
  it("default line has qty 1 and empty unit", () => {
    const l = emptyLine();
    expect(l.qty).toBe(1);
    expect(l.unit).toBe("");
  });
});
