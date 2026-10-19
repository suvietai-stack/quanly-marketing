import { describe, expect, it } from "vitest";
import { checkNoteError, confirmationActions, confirmationFilter, receiver, searchAmount } from "./incoming";

describe("Tiền Về search", () => {
  it.each(["5000000", "5.000.000", "5,000,000"])("normalizes %s to exact amount", (q) => {
    expect(searchAmount(q)).toBe(5000000);
    expect(searchAmount(q)).not.toBe(15000000);
  });
  it.each(["ABC 5000000", "5.00", "5 triệu", "", "9007199254740992"])("keeps %s as text", (q) => {
    expect(searchAmount(q)).toBeNull();
  });
  it("does not add a manual subtitle", () => {
    expect(receiver({ source: "cash" })).toEqual({ main: "Tiền mặt", sub: "" });
    expect(receiver({ source: "other_account" }).sub).toBe("");
  });
});

describe("Check note loại Khác", () => {
  it("only requires note for other", () => {
    expect(checkNoteError({ customer: "", type: "other", note: "Tiền hoàn ứng" })).toBeNull();
    expect(checkNoteError({ customer: "", type: "other", note: "  " })).toBe("Vui lòng nhập Ghi chú khoản tiền");
  });
  it.each(["deposit", "payment", "extra_payment", "refund"])("keeps customer required for %s", (type) => {
    expect(checkNoteError({ customer: "", type, note: "Đã nhận" })).toBe("Vui lòng nhập Khách hàng");
    expect(checkNoteError({ customer: "ABC", type, note: "Đã nhận" })).toBeNull();
  });
});

describe("Two-state confirmation", () => {
  const unclaimed = { confirmation_status: "unclaimed", claimed_by: null, operation_test: false, cancelled_at: null };
  it("maps both old completed steps to confirmed filters", () => {
    expect(confirmationFilter("pending_reconciliation")).toBe("confirmed");
    expect(confirmationFilter("reconciled")).toBe("confirmed");
    expect(confirmationFilter("unclaimed")).toBe("unclaimed");
  });
  it("allows Sale to confirm an unowned bank or manual transaction", () => {
    expect(confirmationActions(unclaimed, "sale-a", true, false, false).sale).toBe(true);
    expect(confirmationActions({ ...unclaimed, confirmation_status: "confirmed", claimed_by: "sale-a" }, "sale-b", true, false, false).sale).toBe(false);
  });
  it("lets accounting confirm unowned other money without Sale claim permission", () => {
    expect(confirmationActions(unclaimed, "accountant", false, true, false)).toEqual({ sale: false, other: true, note: true });
    expect(confirmationActions({ ...unclaimed, claimed_by: "sale-a" }, "accountant", false, true, false).other).toBe(false);
  });
  it("allows owner and accounting notes but not another Sale", () => {
    const confirmed = { ...unclaimed, confirmation_status: "confirmed", claimed_by: "sale-a" };
    expect(confirmationActions(confirmed, "sale-a", true, false, false).note).toBe(true);
    expect(confirmationActions(confirmed, "sale-b", true, false, false).note).toBe(false);
    expect(confirmationActions(confirmed, "accountant", false, true, false).note).toBe(true);
  });
  it("blocks archived and cancelled transactions", () => {
    expect(confirmationActions({ ...unclaimed, operation_test: true }, "sale-a", true, true, true)).toEqual({ sale: false, other: false, note: false });
    expect(confirmationActions({ ...unclaimed, cancelled_at: "2026-10-19" }, "sale-a", true, true, true).sale).toBe(false);
  });
});