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
const pushDispatch_createServerFn_handler = createServerRpc({
  id: "9b259f675f826e1640acaf3508384b658e0efd4a6042648b4502c05f30626c04",
  name: "pushDispatch",
  filename: "src/lib/push.functions.ts"
}, (opts) => pushDispatch.__executeServer(opts));
const pushDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(pushDispatch_createServerFn_handler, async () => {
  const s = await import("./push.server-CALy0v70.mjs");
  const r = await s.processPush(20);
  return {
    sent: r.sent ?? 0
  };
});
const pushTest_createServerFn_handler = createServerRpc({
  id: "c82d2f943dc6173439c7274f8fc5c6d8899e3b9ace8e803a1fe3bb49ab885834",
  name: "pushTest",
  filename: "src/lib/push.functions.ts"
}, (opts) => pushTest.__executeServer(opts));
const pushTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(pushTest_createServerFn_handler, async ({
  context
}) => {
  const s = await import("./push.server-CALy0v70.mjs");
  return s.sendTest(context.userId);
});
export {
  pushDispatch_createServerFn_handler,
  pushTest_createServerFn_handler
};
