export type ReceiptMethod = "webhook" | "reconciliation" | "backfill" | "legacy_unknown";
export function secondsBetween(from?: string | null, to?: string | null) {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Number.isFinite(ms) && ms >= 0 ? ms / 1000 : null;
}
export function eventLatency(e: { receipt_method?: string; lead_created_at?: string | null; webhook_received_at?: string | null; received_at?: string | null; signal_created_at?: string | null }) {
  return {
    webhookSeconds: e.receipt_method === "webhook" ? secondsBetween(e.lead_created_at, e.webhook_received_at) : null,
    processingSeconds: secondsBetween(e.received_at, e.signal_created_at),
  };
}