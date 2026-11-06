import { expect, it } from "vitest";
import {
  ratio,
  reportRatios,
  descendant,
  periodRange,
  previousRange,
  scheduleStatus,
} from "./logic";
import type { Catalog, Schedule } from "./types";
it("zero denominator means unavailable rather than 100 percent", () => {
  expect(ratio(0, 0)).toBeNull();
  expect(ratio(1, 0)).toBeNull();
});
it("processed rate counts schedules rather than customers", () => {
  expect(
    reportRatios({
      processed: 3,
      due: 4,
      on_time: 2,
      connected: 2,
      attempts: 5,
      scheduled_customers: 2,
      customers: 3,
      priority_overdue: 1,
      priority_customers: 2,
    }),
  ).toEqual({
    processed: 75,
    on_time: 50,
    connected: 40,
    scheduled: 200 / 3,
    priority_overdue: 50,
  });
});
it("contact success uses actual connected attempts", () => {
  expect(ratio(2, 5)).toBe(40);
});
it("custom nested segment follows stable IDs and cycles terminate", () => {
  const c = [
    { id: "a", parent_id: null },
    { id: "b", parent_id: "a" },
    { id: "c", parent_id: "b" },
  ] as Catalog[];
  expect(descendant("c", "a", c)).toBe(true);
  expect(descendant("c", "other", c)).toBe(false);
  expect(descendant("c", "other", [{ id: "c", parent_id: "c" }] as Catalog[])).toBe(false);
});
it("Vietnam week and quarter have concrete boundaries", () => {
  expect(periodRange("week", "2026-11-06")).toEqual(["2026-11-02", "2026-11-08"]);
  expect(periodRange("quarter", "2026-11-06")).toEqual(["2026-10-01", "2026-12-31"]);
  expect(previousRange("2026-11-02", "2026-11-08")).toEqual(["2026-10-26", "2026-11-01"]);
});
it("unprocessed past schedule remains overdue and future schedule is not missed", () => {
  expect(
    scheduleStatus(
      { status: "pending", due_at: "2026-11-06T01:00:00Z" } as Schedule,
      "2026-11-06T07:00:00Z",
    ),
  ).toBe("Quá hạn");
  expect(
    scheduleStatus(
      { status: "pending", due_at: "2026-11-07T01:00:00Z" } as Schedule,
      "2026-11-06T07:00:00Z",
    ),
  ).toBe("Đến lịch");
});
