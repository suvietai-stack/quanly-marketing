import { describe, expect, it } from "vitest";
import { overlaps, rangeOf, rangeOptions, shiftRange, validateGoalDates, vnToday } from "./timeframe";

describe("timeframe", () => {
  it("tuần thứ Hai → Chủ nhật", () => {
    expect(rangeOf("week", "2026-10-01")).toEqual(["2026-09-28", "2026-10-04"]);
    expect(rangeOf("week", "2026-10-04")).toEqual(["2026-09-28", "2026-10-04"]);
    expect(rangeOf("week", "2026-09-28")).toEqual(["2026-09-28", "2026-10-04"]);
  });
  it("tháng 10 kết thúc 31/10, tháng 2 năm nhuận", () => {
    expect(rangeOf("month", "2026-10-15")).toEqual(["2026-10-01", "2026-10-31"]);
    expect(rangeOf("month", "2028-02-10")).toEqual(["2028-02-01", "2028-02-29"]);
  });
  it("quý, năm", () => {
    expect(rangeOf("quarter", "2026-11-05")).toEqual(["2026-10-01", "2026-12-31"]);
    expect(rangeOf("year", "2026-03-01")).toEqual(["2026-01-01", "2026-12-31"]);
    expect(shiftRange("quarter", "2026-10-01", 1)).toEqual(["2027-01-01", "2027-03-31"]);
    expect(shiftRange("month", "2026-12-01", 1)).toEqual(["2027-01-01", "2027-01-31"]);
  });
  it("giờ Việt Nam: 18:00 UTC là ngày hôm sau", () => {
    expect(vnToday(new Date("2026-09-30T18:00:00Z"))).toBe("2026-10-01");
    expect(vnToday(new Date("2026-09-30T16:59:00Z"))).toBe("2026-09-30");
  });
  it("mục tiêu nhiều tháng hiện trong từng tháng giao nhau, một lần", () => {
    const g = ["2026-09-15", "2026-11-20"] as const;
    const months = rangeOptions("month", "2026-10-10").map((o) => o.key.split("|"));
    const hit = months.filter(([s, e]) => overlaps(g[0], g[1], s, e)).map(([s]) => s);
    expect(hit).toEqual(["2026-11-01", "2026-10-01", "2026-09-01"]);
    expect(overlaps(g[0], g[1], "2026-12-01", "2026-12-31")).toBe(false);
    expect(overlaps(g[0], g[1], ...rangeOf("year", "2026-01-01"))).toBe(true);
  });
  it("kiểm tra deadline", () => {
    expect(validateGoalDates("2026-10-01", "2026-10-31", "2026-10-31")).toEqual([]);
    expect(validateGoalDates("2026-10-01", "2026-10-31", "2026-11-01")).toHaveLength(1);
    expect(validateGoalDates("2026-10-31", "2026-10-01", "2026-10-15").length).toBeGreaterThan(0);
    expect(validateGoalDates("2026-10-01", "2026-10-31", "")).toHaveLength(1);
  });
});
