import { GRAPH, pageToken } from "../fbLeads/fb.server";
import { parseMessenger } from "./model";

export async function ingestMessenger(body: unknown) {
  const events = parseMessenger(body);
  if (!events.length) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ error: { code: string } | null }> };
  // Staged rollout: never break Lead callbacks before the Inbox schema is installed.
  const installed = await db.rpc("inbox_installed", {});
  if (installed.error?.code === "PGRST202" || installed.error?.code === "42883") return;
  if (installed.error) throw new Error("Cannot verify inbox installation");
  for (const event of events) {
    const { error } = await db.rpc("inbox_ingest", { p_event: event });
    if (error) throw new Error("Messenger persistence failed");
  }
}

export interface SendOutcome { mid: string | null; state: "accepted" | "failed" | "unknown"; failure: string | null }
export async function sendText(pageId: string, customerId: string, text: string, requestId: string, transport = fetch): Promise<SendOutcome> {
  let token: string;
  try { token = await pageToken(pageId); }
  catch { return { mid: null, state: "failed", failure: "Token Page không còn hợp lệ; cần kết nối lại" }; }
  try {
    const response = await transport(`${GRAPH}/${pageId}/messages`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ recipient: { id: customerId }, messaging_type: "RESPONSE", message: { text, metadata: `sv-inbox:${requestId}` } }),
    });
    const result = await response.json() as { message_id?: string; error?: { code?: number } };
    if (response.ok && result.message_id) return { mid: result.message_id, state: "accepted", failure: null };
    if (result.error && response.status < 500) return { mid: null, state: "failed", failure: result.error.code === 190 ? "Token hết hạn; kết nối lại Page" : "Meta từ chối: kiểm tra quyền hoặc cửa sổ trả lời" };
    return { mid: null, state: "unknown", failure: "Chưa xác định kết quả gửi; không tự gửi lại, chờ đối chiếu Messenger" };
  } catch { return { mid: null, state: "unknown", failure: "Kết nối gián đoạn; chưa xác định kết quả gửi, không tự gửi lại" }; }
}
