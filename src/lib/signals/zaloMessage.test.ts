import { describe, it, expect } from "vitest";
import { signalMessage } from "./zaloMessage";

describe("signalMessage", () => {
  it("mẫu giao cho Sale đầy đủ", () => {
    const m = signalMessage("signal_assigned", { customer_name: "Cty A", products: ["Ấm chén", "Ly cốc"], need_groups: ["Sứ quà tặng"], source: "Website", status: "waiting" });
    expect(m.header).toBe("🎯 BASE MARKETING");
    expect(m.text).toContain("📦 Sản phẩm: Ấm chén, Ly cốc");
    expect(m.text).toContain("📌 Trạng thái: Chờ nhận");
    expect(m.button).toBe("XEM VÀ TIẾP NHẬN");
  });
  it("mẫu tín hiệu mới, bỏ trường trống, không null/undefined", () => {
    const m = signalMessage("signal_new", { customer_name: "B", products: [], source: null, detected_on: "2026-09-26" });
    expect(m.text).toContain("📅 Ngày tạo: 26/09/2026");
    expect(m.text).toContain("👤 Phụ trách: Chưa phân công");
    expect(m.text).not.toMatch(/null|undefined|Sản phẩm|Nguồn/);
  });
});
