import { describe, it, expect } from "vitest";
import { buildReport, toCsv } from "./report";

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
    expect(c.startsWith("\uFEFFTháng")).toBe(true);
  });
});
