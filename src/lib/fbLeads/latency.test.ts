import { describe, expect, it } from "vitest";
import { eventLatency, secondsBetween } from "./latency";
describe("Facebook lead latency", () => {
  it("measures Meta receipt and signal completion independently", () => {
    expect(eventLatency({ receipt_method: "webhook", lead_created_at: "2026-10-23T01:00:00Z", webhook_received_at: "2026-10-23T01:00:02Z", received_at: "2026-10-23T01:00:02Z", signal_created_at: "2026-10-23T01:00:03.500Z" })).toEqual({ webhookSeconds: 2, processingSeconds: 1.5 });
  });
  it("does not present reconciliation as a webhook", () => {
    expect(eventLatency({ receipt_method: "reconciliation", lead_created_at: "2026-10-23T01:00:00Z", webhook_received_at: "2026-10-23T01:00:02Z" }).webhookSeconds).toBeNull();
  });
  it("does not fabricate timing for missing or invalid timestamps", () => {
    expect(secondsBetween(null, "2026-10-23T01:00:00Z")).toBeNull();
    expect(secondsBetween("bad", "2026-10-23T01:00:00Z")).toBeNull();
    expect(secondsBetween("2026-10-23T01:00:02Z", "2026-10-23T01:00:00Z")).toBeNull();
  });
});