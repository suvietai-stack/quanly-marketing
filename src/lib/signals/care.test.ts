import { describe, it, expect } from "vitest";
import { careFlag, countCare, careMessage } from "./care";
const H = 3600000, D = 24 * H, now = Date.parse("2026-09-26T02:00:00Z");
const iso = (ms: number) => new Date(now - ms).toISOString();
const S = (status: string, assignedAgo: number, extra: any = {}) => ({ status, assigned_to: "A", assigned_at: iso(assignedAgo), cancelled_at: null, ...extra });
describe("care", () => {
  it("chờ nhận quá 24h", () => { expect(careFlag(S("waiting", 25 * H), [], now)).toBe("unaccepted"); expect(careFlag(S("waiting", 5 * H), [], now)).toBeNull(); });
  it("đang tư vấn quá 3 ngày", () => expect(careFlag(S("consulting", 4 * D), [], now)).toBe("stale_contact"));
  it("đã báo giá quá 3 ngày", () => expect(careFlag(S("quoted", 4 * D), [], now)).toBe("stale_quote"));
  it("vừa cập nhật thì không nhắc", () => expect(careFlag(S("quoted", 10 * D), [{ author_id: "A", created_at: iso(H) }], now)).toBeNull());
  it("nhật ký của Sale cũ không tính", () => expect(careFlag(S("quoted", 10 * D), [{ author_id: "B", created_at: iso(H) }], now)).toBe("stale_quote"));
  it("không nhắc chốt/trượt/hủy/chưa phân công", () => {
    expect(careFlag(S("won", 10 * D), [], now)).toBeNull();
    expect(careFlag(S("lost", 10 * D), [], now)).toBeNull();
    expect(careFlag(S("quoted", 10 * D, { cancelled_at: iso(D) }), [], now)).toBeNull();
    expect(careFlag(S("waiting", 10 * D, { assigned_to: null }), [], now)).toBeNull();
  });
  it("tổng hợp + nội dung không lộ dữ liệu khách", () => {
    const c = countCare(["unaccepted", "unaccepted", "stale_contact", "stale_quote", "stale_quote", null]);
    expect(c).toEqual({ unaccepted: 2, stale_contact: 1, stale_quote: 2, total: 5 });
    expect(careMessage("Julia", c)).toContain("Bạn có 5 tín hiệu cần kiểm tra");
  });
});
