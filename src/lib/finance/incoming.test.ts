import { describe, expect, it } from "vitest";
import { receiver, searchAmount } from "./incoming";

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