import { describe, it, expect } from "vitest";
import { contentZaloMessage, contentStillValid, contentLink } from "./notifyMessage";
describe("content notify", () => {
  it("uses brand, no hardcode, no notes", () => {
    const m = contentZaloMessage("content_revise", { title: "A", website: "W", reviewer: "R" }, "SU VIET");
    expect(m.header).toBe("🔄 SU VIET"); expect(m.text).toContain("Người yêu cầu: R"); expect(m.button).toBe("XEM YÊU CẦU CHỈNH SỬA");
  });
  it("assigned template", () => {
    const m = contentZaloMessage("content_assigned", { title: "A", website: "W", assigner: "G", deadline: "2026-10-31" });
    expect(m.text).toContain("Hạn hoàn thành: 31/10/2026");
  });
  it("stale when status moved", () => {
    expect(contentStillValid("content_review", "Chờ duyệt bài", "Bài viết đã duyệt")).toBe(false);
    expect(contentStillValid("content_review", "Chờ duyệt bài", "Chờ duyệt bài")).toBe(true);
    expect(contentStillValid("content_approved", "x", "Đã hủy")).toBe(false);
  });
  it("link", () => expect(contentLink("a b")).toBe("/web-contents?open=a%20b"));
});
