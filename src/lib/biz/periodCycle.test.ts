import { describe, expect, it } from "vitest";
import { dayPeriod, isoWeek, mondayOf, nextPeriod, periodLabel, periodOfDate, periodRange, storedRange, upcomingPeriods, weekCrossesMonth, weekPeriod, weekSegments } from "./periodCycle";

describe("periodRange", () => {
  it("tháng/quý/năm đúng khoảng ngày", () => {
    expect(periodRange("month", 2026, 2)).toEqual({ start: "2026-02-01", end: "2026-02-28" });
    expect(periodRange("quarter", 2026, 4)).toEqual({ start: "2026-10-01", end: "2026-12-31" });
    expect(periodRange("year", 2026, 1)).toEqual({ start: "2026-01-01", end: "2026-12-31" });
  });
});

describe("weekPeriod / ISO week", () => {
  it("tuần bắt đầu Thứ Hai, kết thúc Chủ Nhật", () => {
    const w = weekPeriod("2026-11-04"); // Thứ Tư
    expect(w.range).toEqual({ start: "2026-11-02", end: "2026-11-08" });
    expect(w).toMatchObject({ year: 2026, period: 45 });
  });
  it("tuần giao năm dùng năm ISO của tuần (28/12/2026–03/01/2027 thuộc Tuần 1/2027? không — thuộc tuần 53/2026)", () => {
    const w = weekPeriod("2026-12-31");
    expect(w.range).toEqual({ start: "2026-12-28", end: "2027-01-03" });
    expect(w.year).toBe(2026);
    expect(w.period).toBe(53);
  });
  it("01/01/2027 thuộc tuần 53/2026, không tạo tuần 1/2027 sai", () => {
    expect(weekPeriod("2027-01-01")).toMatchObject({ year: 2026, period: 53 });
    expect(weekPeriod("2027-01-04")).toMatchObject({ year: 2027, period: 1 });
  });
  it("storedRange khôi phục đúng khoảng tuần từ (year, period)", () => {
    expect(storedRange("week", 2026, 53)).toEqual({ start: "2026-12-28", end: "2027-01-03" });
  });
});

describe("dayPeriod", () => {
  it("ngày thường và cuối năm", () => {
    expect(dayPeriod("2026-01-01")).toMatchObject({ year: 2026, period: 1 });
    expect(dayPeriod("2026-12-31")).toMatchObject({ year: 2026, period: 365 });
    expect(dayPeriod("2024-12-31")).toMatchObject({ year: 2024, period: 366 });
  });
  it("storedRange khôi phục đúng ngày", () => {
    expect(storedRange("day", 2026, 306)).toEqual({ start: "2026-11-02", end: "2026-11-02" });
  });
});

describe("weekSegments — tuần giao tháng", () => {
  it("tuần trong một tháng chỉ có một đoạn", () => {
    expect(weekSegments("2026-11-02")).toEqual([{ from: "2026-11-02", to: "2026-11-08" }]);
    expect(weekCrossesMonth("2026-11-02")).toBe(false);
  });
  it("tuần giao hai tháng tách đúng hai đoạn", () => {
    expect(weekSegments("2026-10-26")).toEqual([
      { from: "2026-10-26", to: "2026-10-31" },
      { from: "2026-11-01", to: "2026-11-01" },
    ]);
    expect(weekCrossesMonth("2026-10-26")).toBe(true);
  });
  it("tuần giao năm tách đúng (28/12/2026–03/01/2027)", () => {
    expect(weekSegments("2026-12-28")).toEqual([
      { from: "2026-12-28", to: "2026-12-31" },
      { from: "2027-01-01", to: "2027-01-03" },
    ]);
  });
});

describe("periodOfDate / nextPeriod / upcomingPeriods", () => {
  it("xác định kỳ chứa ngày theo chu kỳ", () => {
    expect(periodOfDate("month", "2026-11-15")).toMatchObject({ year: 2026, period: 11 });
    expect(periodOfDate("quarter", "2026-11-15")).toMatchObject({ year: 2026, period: 4 });
    expect(periodOfDate("day", "2026-11-15")).toMatchObject({ year: 2026, period: 319 });
  });
  it("nextPeriod qua năm và bỏ ngày 366 năm không nhuận", () => {
    expect(nextPeriod("month", 2026, 12)).toEqual({ year: 2027, period: 1 });
    expect(nextPeriod("day", 2026, 365)).toEqual({ year: 2027, period: 1 });
    expect(nextPeriod("week", 2026, 53)).toEqual({ year: 2027, period: 1 });
  });
  it("xem trước kỳ Ngày bỏ qua Chủ nhật theo lịch làm việc", () => {
    const workdays = { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": false };
    const ups = upcomingPeriods("day", "2026-10-31", 3, workdays); // T7, CN, T2
    expect(ups.map((u) => u.range.start)).toEqual(["2026-10-31", "2026-11-02", "2026-11-03"]);
  });
  it("xem trước kỳ Tuần liên tiếp 7 ngày", () => {
    const ups = upcomingPeriods("week", "2026-11-02", 2);
    expect(ups[0].range.start).toBe("2026-11-02");
    expect(ups[1].range.start).toBe("2026-11-09");
  });
});

describe("periodLabel", () => {
  it("nhãn đọc được cho từng cấp kỳ", () => {
    expect(periodLabel("day", 2026, 306)).toBe("02/11/2026");
    expect(periodLabel("week", 2026, 45)).toBe("Tuần 45/2026 (02/11/2026–08/11/2026)");
    expect(periodLabel("month", 2026, 11)).toBe("Tháng 11/2026");
    expect(periodLabel("quarter", 2026, 4)).toBe("Quý 4/2026");
    expect(periodLabel("year", 2026, 1)).toBe("Năm 2026");
  });
});

describe("isoWeek/mondayOf", () => {
  it("mondayOf trả về Thứ Hai của tuần", () => {
    expect(mondayOf(new Date(Date.UTC(2026, 10, 8))).toISOString().slice(0, 10)).toBe("2026-11-02"); // CN → T2 tuần đó
  });
  it("isoWeek nhất quán với weekPeriod", () => {
    expect(isoWeek(new Date(Date.UTC(2026, 11, 28)))).toEqual({ isoYear: 2026, week: 53 });
  });
});
