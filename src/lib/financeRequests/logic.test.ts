import { describe, it, expect } from "vitest";
import {
  parseAmount, fmtAmountInput, vnd, frValidate, quickFilterStatuses,
  frEditable, frCancellable, frRemainingToPay, frAdvanceRemaining, frSalaryRemaining, frStatusesForKind,
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
    expect(frValidate("advance", { amount: 100, title: "Mua vật tư" })).toBeNull();
    expect(frValidate("payment", { amount: 100, title: "Chi" })).toMatch(/loại thanh toán/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t" })).toMatch(/nhận tiền/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t", payeeName: "NCC", settleTypeName: "Quyết toán/hoàn ứng tạm ứng" })).toMatch(/tạm ứng/);
    expect(frValidate("payment", { amount: 100, title: "Chi", paymentTypeId: "t", payeeName: "NCC", settleTypeName: "Quyết toán/hoàn ứng tạm ứng", advanceId: "a" })).toBeNull();
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
