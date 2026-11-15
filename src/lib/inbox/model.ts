import { z } from "zod";

export const MESSENGER_FIELDS = ["messages", "message_echoes", "message_deliveries", "message_reads"];
export const WINDOW_MS = 24 * 60 * 60 * 1000;
export function subscriptionUnion(existing: string[], lead: boolean, messaging: boolean) {
  return [...new Set([...existing, ...(lead ? ["leadgen"] : []), ...(messaging ? MESSENGER_FIELDS : [])])].sort();
}
export function sendWindow(lastIncoming: string | null, now = Date.now()) {
  return lastIncoming !== null && now >= Date.parse(lastIncoming) && now - Date.parse(lastIncoming) < WINDOW_MS;
}
export function safeAttachmentUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 4096) return null;
  try {
    const u = new URL(raw);
    const trusted = ["fbcdn.net", "facebook.com", "fbsbx.com"];
    if (u.protocol !== "https:" || u.username || u.password || !trusted.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`))) return null;
    return u.href;
  } catch { return null; }
}
const numericId = z.string().regex(/^\d{1,40}$/);
const millis = z.number().int().nonnegative().max(4102444800000);
const event = z.object({
  sender: z.object({ id: numericId }), recipient: z.object({ id: numericId }), timestamp: millis.optional(),
  message: z.object({ mid: z.string().min(1).max(500), text: z.string().max(20000).optional(), is_echo: z.boolean().optional(), metadata: z.string().max(1000).optional(), attachments: z.array(z.object({ type: z.string().max(50), payload: z.object({ url: z.string().max(4096).optional() }).passthrough() }).passthrough()).max(30).optional() }).optional(),
  delivery: z.object({ mids: z.array(z.string().max(500)).max(1000).optional(), watermark: millis }).optional(),
  read: z.object({ watermark: millis }).optional(),
}).passthrough();
const webhook = z.object({ object: z.string(), entry: z.array(z.object({ id: numericId.optional(), messaging: z.array(event).max(100).optional() }).passthrough()).max(100).optional() }).passthrough();
export interface Attachment { type: string; url: string | null }
export interface MessengerEvent { page_id: string; customer_id: string; kind: "message" | "delivery" | "read"; mid: string | null; at: string; direction: "in" | "out"; text: string; attachments: Attachment[]; request_id: string | null; mids: string[]; watermark: string | null }
export function parseMessenger(body: unknown): MessengerEvent[] {
  const parsed = webhook.parse(body);
  if (parsed.object !== "page") return [];
  const result: MessengerEvent[] = [];
  for (const entry of parsed.entry ?? []) for (const e of entry.messaging ?? []) {
    if (!entry.id) continue;
    const echo = e.message?.is_echo === true;
    if ((echo ? e.sender.id : e.recipient.id) !== entry.id) throw new Error("Page mismatch");
    const kind = e.message ? "message" : e.delivery ? "delivery" : e.read ? "read" : null;
    if (!kind) continue;
    const stamp = e.timestamp ?? e.delivery?.watermark ?? e.read?.watermark;
    if (stamp === undefined) throw new Error("Missing event time");
    const metadata = e.message?.metadata?.match(/^sv-inbox:([0-9a-f-]{36})$/i)?.[1];
    result.push({ page_id: entry.id, customer_id: echo ? e.recipient.id : e.sender.id, kind, mid: e.message?.mid ?? null, at: new Date(stamp).toISOString(), direction: echo ? "out" : "in", text: e.message?.text ?? "", attachments: (e.message?.attachments ?? []).map(a => ({ type: a.type, url: safeAttachmentUrl(a.payload.url) })), request_id: metadata && z.string().uuid().safeParse(metadata).success ? metadata : null, mids: e.delivery?.mids ?? [], watermark: e.delivery || e.read ? new Date(e.delivery?.watermark ?? e.read?.watermark ?? stamp).toISOString() : null });
  }
  return result;
}
export interface InboxPage { page_id: string; name: string; enabled: boolean; ready: boolean; reason: string | null; checked_at: string | null; last_event_at: string | null }
export interface Conversation { id: string; page_id: string; customer_id: string; customer_name: string | null; last_at: string; last_text: string; last_incoming_at: string | null; needs_reply: boolean; resolved: boolean; assignee_id: string | null; unread: boolean; version: number }
export interface InboxMessage { id: string; direction: "in" | "out"; text: string; attachments: Attachment[]; event_at: string; state: string; failure: string | null }
export interface InboxOverview { available: boolean; can_view: boolean; can_send: boolean; can_assign: boolean; can_resolve: boolean; can_manage: boolean; pages: InboxPage[] }