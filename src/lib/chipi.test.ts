import { describe, expect, it } from "vitest";
import { chipiState, newChipiNotice, type ChipiNotice } from "./chipi";
const n = (kind: string, read_at: string | null = null): ChipiNotice => ({ id: kind, kind, read_at, created_at: "2026-10-27T09:00:00Z" });
describe("Chipi existing notifications", () => {
  it("uses only unread notifications for reminders", () => expect(newChipiNotice([n("signal_new", "2026-10-27")], new Set())).toBeUndefined());
  it("does not repeat a seen notification", () => expect(newChipiNotice([n("signal_new")], new Set(["signal_new"]))).toBeUndefined());
  it("maps sale assignment without changing the event", () => expect(chipiState(n("signal_assigned"))).toBe("assigned"));
  it("maps design jobs from existing events", () => expect(chipiState(n("order_assigned"))).toBe("new_job"));
  it("maps recorded success, not inferred task completion", () => expect(chipiState(n("oq_done"))).toBe("success"));
  it("does not infer overdue from notification age", () => expect(chipiState(n("order_remind"))).toBe("notification"));
  it("returns idle when there is no unread event", () => expect(chipiState(n("signal_assigned", "2026-10-27"))).toBe("idle"));
});