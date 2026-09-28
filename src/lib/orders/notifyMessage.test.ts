import { describe, it, expect } from "vitest";
import { orderZaloMessage, orderStillValid, orderLink } from "./notifyMessage";
describe("order notify", () => {
  it("assigned template with brand", () => {
    const m = orderZaloMessage("order_assigned", { title: "Banner", brand: "Sứ Việt", requester: "A", deadline: "2026-10-31", priority: "Cao" }, "SU VIET");
    expect(m.header).toBe("🎨 SU VIET"); expect(m.text).toContain("Hạn hoàn thành: 31/10/2026"); expect(m.text).toContain("Mức ưu tiên: Cao");
  });
  it("revise has no notes", () => {
    const m = orderZaloMessage("order_revise", { title: "B", actor: "R" });
    expect(m.text).toBe("THIẾT KẾ CẦN CHỈNH SỬA\n\nOrder: B\nNgười yêu cầu sửa: R");
  });
  it("stale checks", () => {
    expect(orderStillValid("order_assigned", "Chờ nhận việc", { status: "Chờ nhận việc", assignee: "Y" }, "X")).toBe(false);
    expect(orderStillValid("order_review", "Chờ duyệt", { status: "Đã duyệt" })).toBe(false);
    expect(orderStillValid("order_delivered", "Đã bàn giao", { status: "Đã bàn giao" })).toBe(true);
    expect(orderStillValid("order_new", "Chờ phân công", { status: "Chờ phân công", assignee: "X" })).toBe(false);
  });
  it("link", () => expect(orderLink("x")).toBe("/orders?open=x"));
});
