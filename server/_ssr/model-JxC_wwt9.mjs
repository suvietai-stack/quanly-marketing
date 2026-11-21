import { s as stringType, o as objectType, a as arrayType, b as booleanType, n as numberType } from "../_libs/zod.mjs";
const MESSENGER_FIELDS = ["messages", "message_echoes", "message_deliveries", "message_reads"];
function subscriptionUnion(existing, lead, messaging) {
  return [.../* @__PURE__ */ new Set([...existing, ...lead ? ["leadgen"] : [], ...messaging ? MESSENGER_FIELDS : []])].sort();
}
function safeAttachmentUrl(raw) {
  if (typeof raw !== "string" || raw.length > 4096) return null;
  try {
    const u = new URL(raw);
    const trusted = ["fbcdn.net", "facebook.com", "fbsbx.com"];
    if (u.protocol !== "https:" || u.username || u.password || !trusted.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))) return null;
    return u.href;
  } catch {
    return null;
  }
}
const numericId = stringType().regex(/^\d{1,40}$/);
const millis = numberType().int().nonnegative().max(41024448e5);
const event = objectType({
  sender: objectType({ id: numericId }),
  recipient: objectType({ id: numericId }),
  timestamp: millis.optional(),
  message: objectType({ mid: stringType().min(1).max(500), text: stringType().max(2e4).optional(), is_echo: booleanType().optional(), metadata: stringType().max(1e3).optional(), attachments: arrayType(objectType({ type: stringType().max(50), payload: objectType({ url: stringType().max(4096).optional() }).passthrough() }).passthrough()).max(30).optional() }).optional(),
  delivery: objectType({ mids: arrayType(stringType().max(500)).max(1e3).optional(), watermark: millis }).optional(),
  read: objectType({ watermark: millis }).optional()
}).passthrough();
const webhook = objectType({ object: stringType(), entry: arrayType(objectType({ id: numericId.optional(), messaging: arrayType(event).max(100).optional() }).passthrough()).max(100).optional() }).passthrough();
function parseMessenger(body) {
  const parsed = webhook.parse(body);
  if (parsed.object !== "page") return [];
  const result = [];
  for (const entry of parsed.entry ?? []) for (const e of entry.messaging ?? []) {
    if (!entry.id) continue;
    const echo = e.message?.is_echo === true;
    if ((echo ? e.sender.id : e.recipient.id) !== entry.id) throw new Error("Page mismatch");
    const kind = e.message ? "message" : e.delivery ? "delivery" : e.read ? "read" : null;
    if (!kind) continue;
    const stamp = e.timestamp ?? e.delivery?.watermark ?? e.read?.watermark;
    if (stamp === void 0) throw new Error("Missing event time");
    const metadata = e.message?.metadata?.match(/^sv-inbox:([0-9a-f-]{36})$/i)?.[1];
    result.push({ page_id: entry.id, customer_id: echo ? e.recipient.id : e.sender.id, kind, mid: e.message?.mid ?? null, at: new Date(stamp).toISOString(), direction: echo ? "out" : "in", text: e.message?.text ?? "", attachments: (e.message?.attachments ?? []).map((a) => ({ type: a.type, url: safeAttachmentUrl(a.payload.url) })), request_id: metadata && stringType().uuid().safeParse(metadata).success ? metadata : null, mids: e.delivery?.mids ?? [], watermark: e.delivery || e.read ? new Date(e.delivery?.watermark ?? e.read?.watermark ?? stamp).toISOString() : null });
  }
  return result;
}
export {
  MESSENGER_FIELDS,
  parseMessenger,
  safeAttachmentUrl,
  subscriptionUnion
};
