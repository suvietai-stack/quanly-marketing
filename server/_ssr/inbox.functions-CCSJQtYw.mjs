import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { s as stringType, o as objectType, e as enumType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const page = stringType().regex(/^\d{1,40}$/);
const inboxOverview_createServerFn_handler = createServerRpc({
  id: "92fe34a4eeb5154d8eacd2a74c4ea47cd2a42ba89a2246ab7f8a950f15813de5",
  name: "inboxOverview",
  filename: "src/lib/inbox/inbox.functions.ts"
}, (opts) => inboxOverview.__executeServer(opts));
const inboxOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(inboxOverview_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.rpc("inbox_overview");
  if (error?.code === "PGRST202" || error?.code === "42883") return {
    available: false,
    can_view: false,
    can_send: false,
    can_assign: false,
    can_resolve: false,
    can_manage: false,
    pages: []
  };
  if (error) throw new Error("Không tải được Hộp thư; vui lòng thử lại");
  return data;
});
const inboxRead_createServerFn_handler = createServerRpc({
  id: "f516f56a666c34695e0bc440b7cd8c573e0c087f5526d574ec10e8a85be015e6",
  name: "inboxRead",
  filename: "src/lib/inbox/inbox.functions.ts"
}, (opts) => inboxRead.__executeServer(opts));
const inboxRead = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: enumType(["list", "thread", "staff"]),
  pageId: page.optional(),
  conversationId: stringType().uuid().optional(),
  filter: enumType(["all", "unread", "reply", "resolved"]).default("all"),
  before: stringType().datetime().optional(),
  beforeId: stringType().uuid().optional()
}).parse(d)).handler(inboxRead_createServerFn_handler, async ({
  context,
  data
}) => {
  const name = data.kind === "list" ? "inbox_list" : data.kind === "thread" ? "inbox_thread" : "inbox_staff";
  if (data.kind === "thread" && !data.conversationId || data.kind === "staff" && !data.pageId) throw new Error("Thiếu hội thoại hoặc Page");
  const args = data.kind === "list" ? {
    p_page: data.pageId ?? null,
    p_filter: data.filter,
    p_before: data.before ?? null,
    p_id: data.beforeId ?? null
  } : data.kind === "thread" ? {
    p_conversation: data.conversationId,
    p_before: data.before ?? null,
    p_id: data.beforeId ?? null
  } : {
    p_page: data.pageId
  };
  const {
    data: result,
    error
  } = await context.supabase.rpc(name, args);
  if (error) throw new Error("Không đọc được Hộp thư; kiểm tra quyền Page và thử lại");
  return result;
});
const inboxChange_createServerFn_handler = createServerRpc({
  id: "929887aff1d5968d9366740b4512a36216d8e8e941124c10e2e5881da8ce6b89",
  name: "inboxChange",
  filename: "src/lib/inbox/inbox.functions.ts"
}, (opts) => inboxChange.__executeServer(opts));
const inboxChange = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  conversationId: stringType().uuid(),
  action: enumType(["read", "assign", "resolve", "reopen"]),
  userId: stringType().uuid().nullable().optional(),
  version: numberType().int().positive().optional()
}).parse(d)).handler(inboxChange_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.rpc("inbox_change", {
    p_conversation: data.conversationId,
    p_action: data.action,
    p_user: data.userId ?? null,
    p_version: data.version ?? null
  });
  if (error) throw new Error("Không thể cập nhật; quyền hoặc hội thoại đã thay đổi. Hãy tải lại.");
  return {
    ok: true
  };
});
const inboxAccessSave_createServerFn_handler = createServerRpc({
  id: "5fb18e233e158f8adeabcf0ac2ac94e81daa50889ac496906724f09ef482320b",
  name: "inboxAccessSave",
  filename: "src/lib/inbox/inbox.functions.ts"
}, (opts) => inboxAccessSave.__executeServer(opts));
const inboxAccessSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: page,
  userId: stringType().uuid(),
  enabled: booleanType()
}).parse(d)).handler(inboxAccessSave_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.rpc("inbox_access_save", {
    p_page: data.pageId,
    p_user: data.userId,
    p_enabled: data.enabled
  });
  if (error) throw new Error("Không có quyền thay đổi truy cập Page");
  return {
    ok: true
  };
});
const inboxSend_createServerFn_handler = createServerRpc({
  id: "a0af737182f5ae592286b064ad942f1d5dfc8c2f512d324c9ace1bbe077706b7",
  name: "inboxSend",
  filename: "src/lib/inbox/inbox.functions.ts"
}, (opts) => inboxSend.__executeServer(opts));
const inboxSend = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  conversationId: stringType().uuid(),
  requestId: stringType().uuid(),
  text: stringType().trim().min(1).max(2e3)
}).parse(d)).handler(inboxSend_createServerFn_handler, async ({
  context,
  data
}) => {
  const claim = await context.supabase.rpc("inbox_send_claim", {
    p_conversation: data.conversationId,
    p_request: data.requestId,
    p_text: data.text
  });
  if (claim.error) throw new Error("Không thể gửi: kiểm tra quyền Page, token và cửa sổ 24 giờ");
  const row = claim.data;
  if (!row.claimed) return {
    state: row.state === "sending" ? "unknown" : row.state
  };
  const {
    sendText
  } = await import("./inbox.server-WMnjwISy.mjs");
  const result = await sendText(row.page_id, row.customer_id, data.text, data.requestId);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const finish = await supabaseAdmin.rpc("inbox_send_finish", {
    p_request: data.requestId,
    p_mid: result.mid,
    p_state: result.state,
    p_failure: result.failure
  });
  if (finish.error) return {
    state: "unknown"
  };
  return {
    state: result.state
  };
});
export {
  inboxAccessSave_createServerFn_handler,
  inboxChange_createServerFn_handler,
  inboxOverview_createServerFn_handler,
  inboxRead_createServerFn_handler,
  inboxSend_createServerFn_handler
};
