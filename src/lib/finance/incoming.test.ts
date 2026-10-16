import { describe, expect, it } from "vitest";
import { checkNoteError, receiver, searchAmount } from "./incoming";

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