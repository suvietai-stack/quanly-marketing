import { describe, expect, it } from "vitest";
import { addWorkMinutes, DEFAULT_REMINDER as C, dueAutoSeq, isWorkTime } from "./reminder";

// 2026-10-26 là Thứ Hai. Giờ VN = UTC+7.
const vn = (s: string) => Date.parse(s + "+07:00");

describe("nhắc xác nhận Tiền Về", () => {
  it("09:00 → nhắc lần 1 lúc 09:30, lần 2 lúc 10:00", () => {
    expect(addWorkMinutes(vn("2026-10-26T09:00:00"), 30, C)).toBe(vn("2026-10-26T09:30:00"));
    expect(addWorkMinutes(vn("2026-10-26T09:30:00"), 30, C)).toBe(vn("2026-10-26T10:00:00"));
  });
  it("16:45 → 08:15 ngày làm việc tiếp theo", () => {
    expect(addWorkMinutes(vn("2026-10-26T16:45:00"), 30, C)).toBe(vn("2026-10-27T08:15:00"));
  });
  it("Thứ Bảy 16:45 → Thứ Hai 08:15 (bỏ Chủ nhật)", () => {
    expect(addWorkMinutes(vn("2026-10-31T16:45:00"), 30, C)).toBe(vn("2026-11-02T08:15:00"));
  });
  it("không nhắc ngoài 08:00–17:00 và Chủ nhật", () => {
    expect(isWorkTime(vn("2026-10-26T17:00:00"), C)).toBe(false);
    expect(isWorkTime(vn("2026-10-26T07:59:00"), C)).toBe(false);
    expect(isWorkTime(vn("2026-11-01T10:00:00"), C)).toBe(false);
    expect(dueAutoSeq({ autoCount: 0, lastAutoAt: null, baseAt: vn("2026-10-26T09:00:00") }, vn("2026-10-26T18:00:00"), C)).toBeNull();
  });
  it("dừng sau 5 lần tự động", () => {
    expect(dueAutoSeq({ autoCount: 5, lastAutoAt: vn("2026-10-26T11:30:00"), baseAt: vn("2026-10-26T09:00:00") }, vn("2026-10-26T15:00:00"), C)).toBeNull();
    expect(dueAutoSeq({ autoCount: 4, lastAutoAt: vn("2026-10-26T11:00:00"), baseAt: vn("2026-10-26T09:00:00") }, vn("2026-10-26T11:30:00"), C)).toBe(5);
  });
  it("scheduler chạy lại sau đêm chỉ gửi một lần, không dồn", () => {
    const s = { autoCount: 1, lastAutoAt: vn("2026-10-26T16:30:00"), baseAt: vn("2026-10-26T16:00:00") };
    expect(dueAutoSeq(s, vn("2026-10-26T16:59:00"), C)).toBeNull();
    expect(dueAutoSeq(s, vn("2026-10-27T10:00:00"), C)).toBe(2); // trễ vẫn chỉ lần 2, không dồn 3-4-5
  });
  it("chưa đến hạn thì không nhắc", () => {
    expect(dueAutoSeq({ autoCount: 0, lastAutoAt: null, baseAt: vn("2026-10-26T09:00:00") }, vn("2026-10-26T09:29:00"), C)).toBeNull();
  });
});
