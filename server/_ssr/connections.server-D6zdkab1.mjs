import { pageToken, META_APP_ID, appSecret, graph, subscribeCapabilities, seal } from "./fb.server-1Ea3ethR.mjs";
import { verifyCandidate, verifyMessagingCandidate } from "./pageDiscovery.server-CVyIjM9b.mjs";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.mjs";
import "./mapping-DJG8XEt0.mjs";
import "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const db = () => supabaseAdmin;
async function connectionFeatures() {
  const { data, error } = await db().from("inbox_page_capabilities").select("page_id,lead_enabled,lead_enabled_at,enabled,ready,reason,tasks");
  if (error && ["PGRST205", "42P01"].includes(error.code)) return { installed: false, rows: [] };
  if (error) throw new Error("Không đọc được trạng thái kết nối Page");
  return { installed: true, rows: data ?? [] };
}
async function configurePage(page, lead, messaging, actorId, replaceToken) {
  const check = await connectionFeatures();
  if (!check.installed) throw new Error("Hộp thư chưa được kích hoạt dữ liệu; cấu hình Lead hiện tại vẫn được giữ");
  const appToken = `${META_APP_ID}|${appSecret()}`;
  const { data: identity } = await graph("/debug_token", appToken, { params: { input_token: page.token } });
  if (!identity?.is_valid || identity.app_id !== META_APP_ID || identity.type !== "PAGE" || String(identity.profile_id) !== page.id) throw new Error("Token không hợp lệ hoặc không đúng Page; hãy kết nối lại");
  if (lead) {
    const v = await verifyCandidate(graph, META_APP_ID, appToken, page);
    if (!v.eligible) throw new Error(v.message);
  }
  if (messaging) {
    const v = await verifyMessagingCandidate(graph, META_APP_ID, appToken, page);
    if (!v.eligible) throw new Error(v.message);
  }
  if (lead || messaging) await subscribeCapabilities(page.id, page.token, lead, messaging);
  const { error } = await db().rpc("inbox_connection_save", {
    p_page: page.id,
    p_name: page.name,
    p_token: replaceToken ? await seal(page.token) : null,
    p_lead: lead,
    p_messaging: messaging,
    p_tasks: page.tasks,
    p_ready: messaging,
    p_reason: null,
    p_actor: actorId
  });
  if (error) throw new Error("Chưa lưu được lựa chọn của Page; cấu hình hiện tại được giữ. Hãy kiểm tra lại.");
  return { ok: true, message: "Đã lưu lựa chọn nhận Lead / tin nhắn" };
}
async function configureExisting(pageId, lead, messaging, actorId) {
  const { rows } = await connectionFeatures();
  const { data, error } = await db().from("fbl_pages").select("name,status").eq("page_id", pageId).maybeSingle();
  if (error || !data || data.status === "disconnected") throw new Error("Page chưa kết nối; hãy kết nối lại");
  const feature = rows.find((r) => r.page_id === pageId);
  return configurePage({ id: pageId, name: data.name, token: await pageToken(pageId), tasks: feature?.tasks ?? [], origins: [], eligible: false, message: "" }, lead, messaging, actorId, false);
}
export {
  configureExisting,
  configurePage,
  connectionFeatures
};
