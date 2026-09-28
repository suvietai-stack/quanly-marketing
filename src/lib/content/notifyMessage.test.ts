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

import { contentCurrentRecipients as ccr, contentReviewerOf, nameMatches as nm } from "./notifyMessage";
import { orderCurrentRecipients as ocr } from "../orders/notifyMessage";
describe("người nhận hiện tại", () => {
  it("bản nháp web dùng webDraftReviewer, dự phòng draftReviewer", () => {
    expect(contentReviewerOf({ webDraftReviewer: "An", draftReviewer: "Bình" }, "Chờ duyệt bản nháp web")).toBe("An");
    expect(contentReviewerOf({ draftReviewer: "Bình" }, "Chờ duyệt bản nháp web")).toBe("Bình");
    expect(contentReviewerOf({ webDraftReviewer: "An", draftReviewer: "Bình" }, "Chờ duyệt bài")).toBe("Bình");
  });
  it("người viết bị thay thì không gửi", () => {
    expect(nm(ccr("content_assigned", { writer: "Cường" }), { full_name: "Dũng" })).toBe(false);
    expect(nm(ccr("content_assigned", { writer: "cường " }), { full_name: "Cường" })).toBe(true);
    expect(nm(ccr("content_review", { status: "Chờ duyệt bản nháp web", webDraftReviewer: "An" }), { full_name: "Bình" })).toBe(false);
  });
  it("order: đổi người duyệt/người thiết kế", () => {
    expect(ocr("order_review", { reviewer: "", requester: "Hà" })).toEqual(["Hà"]);
    expect(ocr("order_assigned", { assignee: "Lan" })).toEqual(["Lan"]);
    expect(ocr("order_new", {})).toBeNull();
  });
});
