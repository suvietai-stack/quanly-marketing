import { describe, it, expect } from "vitest";
import { buildReport, buildDetails, isoWeekOf, rangeOf, toCsv } from "./report";

describe("leave report", () => {
  const rows = [
    { owner_id: "a", type: "leave", status: "approved", payload: { start_date: "2026-09-30" }, calc: { days: 2, details: [{ date: "2026-09-30", days: 1 }, { date: "2026-10-01", days: 1 }] } },
    { owner_id: "a", type: "late", status: "approved", payload: { date: "2026-09-10", minutes: 15 }, calc: {} },
    { owner_id: "a", type: "late", status: "rejected", payload: { date: "2026-09-11", minutes: 30 }, calc: {} },
    { owner_id: "b", type: "early", status: "pending", payload: { date: "2026-09-12", minutes: 10 }, calc: {} },
    { owner_id: "b", type: "early", status: "cancelled", payload: { date: "2026-09-12", minutes: 10 }, calc: {} },
  ];
  it("splits leave across months and counts only approved", () => {
    const s = buildReport(rows, "2026-09");
    const a = s.find((x) => x.userId === "a")!;
    expect(a.leaveDays).toBe(1); expect(a.lateCount).toBe(1); expect(a.lateMinutes).toBe(15); expect(a.rejected).toBe(1);
    expect(s.find((x) => x.userId === "b")!.pending).toBe(1);
    expect(buildReport(rows, "2026-10").find((x) => x.userId === "a")!.leaveDays).toBe(1);
  });
  it("csv has BOM and header", () => {
    const c = toCsv(buildReport(rows, "2026-09"), (id) => id, "2026-09");
    expect(c.startsWith("\uFEFFKỳ")).toBe(true);
  });
  it("ranges: week Mon-Sun, quarter, year, custom", () => {
    expect(rangeOf("week", { year: 2026, week: 40 })).toEqual({ start: "2026-09-28", end: "2026-10-04" });
    expect(isoWeekOf("2026-10-01")).toEqual({ year: 2026, week: 40 });
    expect(rangeOf("quarter", { year: 2026, quarter: 3 })).toEqual({ start: "2026-07-01", end: "2026-09-30" });
    expect(rangeOf("year", { year: 2026 }).end).toBe("2026-12-31");
    expect(rangeOf("custom", { year: 2026, start: "2026-10-01", end: "2026-09-30" })).toEqual({ start: "2026-09-30", end: "2026-10-01" });
  });
  it("splits across week/quarter/custom and details keep all statuses", () => {
    expect(buildReport(rows, rangeOf("week", { year: 2026, week: 40 })).find((x) => x.userId === "a")!.leaveDays).toBe(2);
    expect(buildReport(rows, rangeOf("quarter", { year: 2026, quarter: 4 })).find((x) => x.userId === "a")!.leaveDays).toBe(1);
    expect(buildReport(rows, rangeOf("year", { year: 2026 })).find((x) => x.userId === "a")!.leaveDays).toBe(2);
    const d = buildDetails(rows, rangeOf("month", { year: 2026, month: 9 }));
    expect(d.length).toBe(5);
    expect(d.filter((x) => x.counted).length).toBe(2);
  });
});
