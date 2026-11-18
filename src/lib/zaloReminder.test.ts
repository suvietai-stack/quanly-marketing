import { describe, expect, it } from "vitest";
import { interactionState, reminderDue, reminderStorageKey, INTERACTION_WINDOW, REMINDER_SNOOZE, ZALO_REMINDER_LINK_REFRESH_MS, ZALO_REMINDER_HEALTH_REFRESH_MS } from "./zaloReminder";

const now = Date.parse("2026-10-19T04:23:00Z");
const health = { connected: true, webhookConfigured: true };
const link = (age: number) => ({ status: "active", last_interaction_at: new Date(now - age).toISOString() });
describe("global reminder polling", () => {
  it("does not call OA health and account-link RPCs every 30 seconds", () => {
    expect(ZALO_REMINDER_LINK_REFRESH_MS).toBeGreaterThanOrEqual(180_000);
    expect(ZALO_REMINDER_HEALTH_REFRESH_MS).toBeGreaterThanOrEqual(300_000);
  });
});
describe("personal OA interaction reminders", () => {
  it("does not remind when more than 24 hours remain", () => expect(interactionState(link(INTERACTION_WINDOW - REMINDER_SNOOZE - 1), health, now)).toBe("fresh"));
  it("warns during the final 24 hours", () => expect(interactionState(link(6 * REMINDER_SNOOZE), health, now)).toBe("soon"));
  it("shows overdue at seven days", () => expect(interactionState(link(7 * REMINDER_SNOOZE), health, now)).toBe("overdue"));
  it("keeps unlinked separate", () => expect(interactionState(null, health, now)).toBe("unlinked"));
  it("does not claim expiration with missing webhook configuration", () => expect(interactionState(link(INTERACTION_WINDOW), { ...health, webhookConfigured: false }, now)).toBe("unavailable"));
  it("does not claim expiration when OA disconnected", () => expect(interactionState(link(INTERACTION_WINDOW), { ...health, connected: false }, now)).toBe("unavailable"));
  it("treats missing interaction as unknown", () => expect(interactionState({ status: "active", last_interaction_at: null }, health, now)).toBe("unknown"));
  it("treats invalid or future interaction as unknown", () => {
    expect(interactionState({ status: "active", last_interaction_at: "invalid" }, health, now)).toBe("unknown");
    expect(interactionState(link(-1), health, now)).toBe("unknown");
  });
  it("snoozes for a full 24 hours", () => {
    expect(reminderDue("overdue", now, now + REMINDER_SNOOZE - 1)).toBe(false);
    expect(reminderDue("overdue", now, now + REMINDER_SNOOZE)).toBe(true);
  });
  it("separates reminder storage by user", () => expect(reminderStorageKey("sale-1")).not.toBe(reminderStorageKey("sale-2")));
  it("clears warning after a recorded interaction", () => expect(interactionState(link(0), health, now)).toBe("fresh"));
  it("never opens popup for other states", () => expect(reminderDue("soon", NaN, now)).toBe(false));
});