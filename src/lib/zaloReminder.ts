export const INTERACTION_WINDOW = 7 * 24 * 60 * 60 * 1000;
export const REMINDER_SNOOZE = 24 * 60 * 60 * 1000;
// Seven-day reminder windows do not require constant, global 30-second RPCs.
export const ZALO_REMINDER_LINK_REFRESH_MS = 180_000;
export const ZALO_REMINDER_HEALTH_REFRESH_MS = 300_000;

export type ReminderState = "unlinked" | "unknown" | "unavailable" | "fresh" | "soon" | "overdue";
export function interactionState(link: { status: string; last_interaction_at: string | null } | null, health: { connected: boolean; webhookConfigured: boolean }, now: number): ReminderState {
  if (!link) return "unlinked";
  if (!health.connected || !health.webhookConfigured || link.status !== "active") return "unavailable";
  const last = link.last_interaction_at ? Date.parse(link.last_interaction_at) : NaN;
  if (!Number.isFinite(last) || last > now) return "unknown";
  const remaining = last + INTERACTION_WINDOW - now;
  if (remaining <= 0) return "overdue";
  return remaining <= REMINDER_SNOOZE ? "soon" : "fresh";
}

export function reminderDue(state: ReminderState, snoozedAt: number, now: number) {
  return state === "overdue" && (!Number.isFinite(snoozedAt) || now >= snoozedAt + REMINDER_SNOOZE);
}

export function reminderStorageKey(userId: string) {
  return `zalo-interaction-snooze:${userId}`;
}