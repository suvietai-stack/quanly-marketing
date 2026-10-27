import { describe, expect, it } from "vitest";
import { chipiState, newChipiNotice, currentChipiNotice, chipiDisplayState, CHIPI_PLAY_INTERVAL_MS, type ChipiNotice } from "./chipi";
const n = (kind: string, read_at: string | null = null): ChipiNotice => ({ id: kind, kind, read_at, created_at: "2026-10-27T09:00:00Z" });
describe("Chipi existing notifications", () => {
  it("uses only unread notifications for reminders", () => expect(newChipiNotice([n("signal_new", "2026-10-27")], new Set())).toBeUndefined());
  it("does not repeat a seen notification", () => expect(newChipiNotice([n("signal_new")], new Set(["signal_new"]))).toBeUndefined());
  it("maps sale assignment without changing the event", () => expect(chipiState(n("signal_assigned"))).toBe("assigned"));
  it("maps design jobs from existing events", () => expect(chipiState(n("order_assigned"))).toBe("new_job"));
  it("maps recorded success, not inferred task completion", () => expect(chipiState(n("oq_done"))).toBe("success"));
  it("does not infer overdue from notification age", () => expect(chipiState(n("order_remind"))).toBe("notification"));
  it("returns idle when there is no unread event", () => expect(chipiState(n("signal_assigned", "2026-10-27"))).toBe("idle"));
  it("keeps unread state after reload even if its bubble was seen", () => expect(currentChipiNotice([n("signal_assigned")])?.id).toBe("signal_assigned"));
  it("moves to the next unread notification when the current one is read", () => expect(currentChipiNotice([n("signal_assigned", "2026-10-27"), n("order_assigned")], "signal_assigned")?.id).toBe("order_assigned"));
  it("clears state once every notification is read", () => expect(currentChipiNotice([n("order_assigned", "2026-10-27")], "order_assigned")).toBeUndefined());
  it("decorative greeting cannot replace a business notification", () => expect(chipiDisplayState("assigned", "hello")).toBe("assigned"));
  it("decorative thinking cannot replace verified urgency", () => expect(chipiDisplayState("urgent", "thinking")).toBe("urgent"));
  it("allows decoration only while idle", () => expect(chipiDisplayState("idle", "thinking")).toBe("thinking"));
  it("schedules play inside the requested 30–60 second range", () => { expect(CHIPI_PLAY_INTERVAL_MS).toBeGreaterThanOrEqual(30000); expect(CHIPI_PLAY_INTERVAL_MS).toBeLessThanOrEqual(60000); });
});