import { describe, it, expect } from "vitest";
import { calculateKrItem, monthsIn } from "./calculateKr";
import { BASIC_KR_LIST, isAssignable } from "./metrics";

const emp = { id: "u1", fullName: "Julia", username: "julia" };
const P = { periodStart: "2026-09-01", periodEnd: "2026-09-30" };

describe("Thư viện 19 KR", () => {
  it("có đúng 19 KR cơ bản + 2 KR tùy chỉnh, tất cả giao được", () => {
    expect(BASIC_KR_LIST.filter((m) => m.basic).length).toBe(19);
    expect(BASIC_KR_LIST.every(isAssignable)).toBe(true);
  });
  it("monthsIn chỉ nhận trọn tháng", () => {
    expect(monthsIn("2026-07-01", "2026-09-30")).toEqual(["2026-07", "2026-08", "2026-09"]);
    expect(monthsIn("2026-09-07", "2026-09-13")).toBeNull();
  });
});

describe("KR mới", () => {
  it("Bài đăng Website: chỉ tính bài đã đăng, đúng người đăng; bài chỉ được duyệt không tính", () => {
    const webContents = [
      { id: "a", title: "A", brandId: "b", websiteId: "w", status: "Đã đăng web", publishedAt: "2026-09-05", publisher: "Julia" },
      { id: "b", title: "B", brandId: "b", websiteId: "w", status: "Bài viết đã duyệt", publishedAt: "2026-09-05", publisher: "Julia" },
      { id: "c", title: "C", brandId: "b", websiteId: "w", status: "Đã đăng web", publishedAt: "2026-09-06", writer: "Julia" },
    ] as never;
    const r = calculateKrItem(emp, { metricKey: "web_post_published" }, P, { tasks: [], webContents });
    expect(r.actualValue).toBe(1);
    expect(r.warnings.length).toBe(1);
  });
  it("Organic Clicks: lấy số liệu tháng đúng Website, % tăng so với kỳ gốc", () => {
    const growth = [
      { id: "g1", websiteId: "w", periodType: "Tháng", periodKey: "2026-09", period: "T9", clicks: 1200 },
      { id: "g0", websiteId: "w", periodType: "Tháng", periodKey: "2026-08", period: "T8", clicks: 1000 },
      { id: "gx", websiteId: "other", periodType: "Tháng", periodKey: "2026-09", period: "T9", clicks: 9999 },
    ] as never;
    expect(calculateKrItem(emp, { metricKey: "seo_organic_clicks", websiteId: "w" }, P, { tasks: [], growth }).actualValue).toBe(1200);
    expect(calculateKrItem(emp, { metricKey: "seo_organic_clicks", websiteId: "w", metadata: { mode: "growth" } }, P, { tasks: [], growth }).actualValue).toBe(20);
    expect(calculateKrItem(emp, { metricKey: "seo_organic_clicks", websiteId: "w" }, { periodStart: "2026-10-01", periodEnd: "2026-10-31" }, { tasks: [], growth }).actualValue).toBeNull();
  });
  it("Video đạt ngưỡng: chỉ tính lần đã xác nhận, mỗi video 1 lần", () => {
    const e = (id: string, link: string, value: number, ok = true) => ({ id, link, value, recordedAt: "2026-09-10T12:00:00", recordedBy: "admin", confirmedBy: ok ? "admin" : null });
    const entries = [e("1", "https://tiktok.com/v/1", 12000), e("2", "https://tiktok.com/v/1?x=1", 15000), e("3", "https://tiktok.com/v/2", 9000), e("4", "https://tiktok.com/v/3", 20000, false)];
    const r = calculateKrItem(emp, { metricKey: "video_view_threshold", socialId: "s", metadata: { viewThreshold: 10000, entries } }, P, { tasks: [] });
    expect(r.actualValue).toBe(1);
  });
  it("Tỷ lệ chuyển đổi: tổng tử số / tổng mẫu số, không trung bình", () => {
    const entries = [
      { id: "1", numerator: 1, denominator: 10, recordedAt: "2026-09-02T12:00:00", recordedBy: "a", confirmedBy: "a" },
      { id: "2", numerator: 9, denominator: 90, recordedAt: "2026-09-03T12:00:00", recordedBy: "a", confirmedBy: "a" },
    ];
    expect(calculateKrItem(emp, { metricKey: "mkt_conversion_rate", metadata: { entries } }, P, { tasks: [] }).actualValue).toBe(10);
    expect(calculateKrItem(emp, { metricKey: "mkt_orders", metadata: { entries: [] } }, P, { tasks: [] }).actualValue).toBeNull();
  });
});
