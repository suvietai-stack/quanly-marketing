export type ChipiNotice = { id: string; kind: string; read_at: string | null; created_at: string; payload?: {progression?:boolean; message?:string; deadline?:string; [key:string]:unknown} };
export type ChipiState = "idle" | "hello" | "notification" | "assigned" | "new_job" | "urgent" | "due" | "success" | "celebrate" | "thinking" | "quiet" | "working" | "thankyou" | "attention";
export const CHIPI_PLAY_INTERVAL_MS = 45_000;
export const CHIPI_PLAY_DURATION_MS = 2400;
export type ChipiDecoration = "hello" | "thinking" | "quiet" | "thankyou" | "celebrate";
export function chipiDisplayState(business: ChipiState, decoration?: ChipiDecoration): ChipiState {
  return business === "idle" ? decoration ?? "idle" : business;
}
export function chipiNoticeCategory(kind: string): "signal" | "job" | "success" | "general" {
  if (chipiState({ id: "", kind, read_at: null, created_at: "" }) === "success") return "success";
  if (kind.startsWith("signal_")) return "signal";
  if (/^(order_|content_|oq_|ot_)/.test(kind)) return "job";
  return "general";
}

/** Only existing notification events drive the mascot; age alone never means overdue. */
export function chipiState(n?: ChipiNotice): ChipiState {
  if (!n || n.read_at) return "idle";
  if (["order_new", "order_assigned"].includes(n.kind)) return "new_job";
  if (["signal_assigned", "content_assigned", "oq_assigned"].includes(n.kind)) return "assigned";
  if (["order_approved", "order_delivered", "content_approved", "content_published", "oq_done"].includes(n.kind)) return "success";
  return "notification";
}

export function newChipiNotice(notices: ChipiNotice[], seen: Set<string>): ChipiNotice | undefined {
  return notices.find((n) => !n.read_at && !seen.has(n.id));
}

/** Acknowledging a bubble does not mark its notification read. */
export function currentChipiNotice(notices: ChipiNotice[], previousId?: string): ChipiNotice | undefined {
  return notices.find((n) => n.id === previousId && !n.read_at) ?? notices.find((n) => !n.read_at);
}