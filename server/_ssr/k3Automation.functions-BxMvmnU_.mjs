import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
const k3ReportGroups_createServerFn_handler = createServerRpc({
  id: "0a9958c9f742ed40bc01579fd71097067f1204c8c489531d525fc2c551124c6d",
  name: "k3ReportGroups",
  filename: "src/lib/biz/k3Automation.functions.ts"
}, (opts) => k3ReportGroups.__executeServer(opts));
const k3ReportGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(k3ReportGroups_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.rpc("k3_automation_read");
  if (error || !data) throw new Error("Bạn không có quyền cấu hình báo cáo 3K.");
  const {
    listGroups
  } = await import("./gmf.server-CUA1cOPW.mjs");
  return listGroups();
});
export {
  k3ReportGroups_createServerFn_handler
};
