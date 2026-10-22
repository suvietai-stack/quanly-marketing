import { describe, expect, it } from "vitest";
import { applyMapping, validateMapping, vnDate, type Mapping } from "./mapping";

const cat = { products: ["Ấm chén", "Bình hoa"], need_groups: ["Sứ quà tặng"] };
const qs = [{ key: "full_name", label: "Họ tên" }, { key: "phone_number", label: "SĐT" }, { key: "sp", label: "Sản phẩm" }];
const m: Mapping = {
  customer_name: { mode: "facebook", key: "full_name" },
  phone: { mode: "facebook", key: "phone_number" },
  address: { mode: "empty" },
  products: { mode: "facebook", key: "sp", valueMap: { "Ấm trà": "Ấm chén" } },
  need_groups: { mode: "default", value: ["Sứ quà tặng"] },
  marketing_note: { mode: "default", value: "Lead Facebook" },
};

describe("fb lead mapping", () => {
  it("valid config has no errors", () => expect(validateMapping(m, qs, cat, "Facebook")).toEqual([]));
  it("requires page source", () => expect(validateMapping(m, qs, cat, null)).toContain("Page chưa chọn Nguồn tín hiệu"));
  it("phone cannot be empty", () => expect(validateMapping({ ...m, phone: { mode: "empty" } }, qs, cat, "x").join()).toMatch(/Số điện thoại/));
  it("rejects removed question", () => expect(validateMapping({ ...m, customer_name: { mode: "facebook", key: "gone" } }, qs, cat, "x").length).toBe(1));
  it("builds signal draft with mapped values", () => {
    const r = applyMapping(m, [{ name: "full_name", values: ["Anh Nam"] }, { name: "phone_number", values: ["+84 912 345 678"] }, { name: "sp", values: ["Ấm trà"] }], cat, "Page Sứ Việt", "2026-10-22T18:30:00Z");
    expect(r.ok && r.draft).toMatchObject({ customer_name: "Anh Nam", phone: "0912345678", address: null, products: ["Ấm chén"], need_groups: ["Sứ quà tặng"], source: "Page Sứ Việt", detected_on: "2026-10-23", marketing_note: "Lead Facebook" });
  });
  it("missing phone keeps lead for action", () => {
    const r = applyMapping(m, [{ name: "full_name", values: ["A"] }], cat, "x", "2026-10-22T00:00:00Z");
    expect(r.ok).toBe(false);
  });
  it("vn date", () => expect(vnDate("2026-10-22T16:59:00Z")).toBe("2026-10-22"));
});

import { suggestMapping as sm } from "./mapping";
describe("suggestMapping", () => {
  const qs = [{ key: "full_name", label: "Họ tên" }, { key: "phone_number", label: "SĐT" }, { key: "q1", label: "Nhu cầu của bạn" }, { key: "q2", label: "Mô tả chi tiết" }];
  it("gợi ý theo key/nhãn", () => {
    const m = sm({}, qs);
    expect(m.customer_name).toEqual({ mode: "facebook", key: "full_name" });
    expect(m.phone).toEqual({ mode: "facebook", key: "phone_number" });
    expect(m.need_groups).toEqual({ mode: "facebook", key: "q1" });
    expect(m.need_detail).toEqual({ mode: "facebook", key: "q2" });
  });
  it("không ghi đè cấu hình sẵn", () => {
    expect(sm({ phone: { mode: "default", value: "0900" } }, qs).phone).toEqual({ mode: "default", value: "0900" });
  });
});
