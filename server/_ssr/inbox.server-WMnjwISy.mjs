import { pageToken, GRAPH } from "./fb.server-1Ea3ethR.mjs";
import { parseMessenger } from "./model-JxC_wwt9.mjs";
import "./mapping-DJG8XEt0.mjs";
import "../_libs/zod.mjs";
async function ingestMessenger(body) {
  const events = parseMessenger(body);
  if (!events.length) return;
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  const db = supabaseAdmin;
  const installed = await db.rpc("inbox_installed", {});
  if (installed.error?.code === "PGRST202" || installed.error?.code === "42883") return;
  if (installed.error) throw new Error("Cannot verify inbox installation");
  for (const event of events) {
    const { error } = await db.rpc("inbox_ingest", { p_event: event });
    if (error) throw new Error("Messenger persistence failed");
  }
}
async function sendText(pageId, customerId, text, requestId, transport = fetch) {
  let token;
  try {
    token = await pageToken(pageId);
  } catch {
    return { mid: null, state: "failed", failure: "Token Page không còn hợp lệ; cần kết nối lại" };
  }
  try {
    const response = await transport(`${GRAPH}/${pageId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15e3),
      body: JSON.stringify({ recipient: { id: customerId }, messaging_type: "RESPONSE", message: { text, metadata: `sv-inbox:${requestId}` } })
    });
    const result = await response.json();
    if (response.ok && result.message_id) return { mid: result.message_id, state: "accepted", failure: null };
    if (result.error && response.status < 500) return { mid: null, state: "failed", failure: result.error.code === 190 ? "Token hết hạn; kết nối lại Page" : "Meta từ chối: kiểm tra quyền hoặc cửa sổ trả lời" };
    return { mid: null, state: "unknown", failure: "Chưa xác định kết quả gửi; không tự gửi lại, chờ đối chiếu Messenger" };
  } catch {
    return { mid: null, state: "unknown", failure: "Kết nối gián đoạn; chưa xác định kết quả gửi, không tự gửi lại" };
  }
}
export {
  ingestMessenger,
  sendText
};
