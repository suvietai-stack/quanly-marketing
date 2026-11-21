import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { D as DEFAULT_BRANDING } from "./branding-Bpuupoin.mjs";
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
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./client-DfPXH9B8.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const getPublicBranding_createServerFn_handler = createServerRpc({
  id: "03caa914b26cd5697651f3e13df399d71200c4d62bc7d1f969687ba4e1004513",
  name: "getPublicBranding",
  filename: "src/lib/branding.functions.ts"
}, (opts) => getPublicBranding.__executeServer(opts));
const getPublicBranding = createServerFn({
  method: "GET"
}).handler(getPublicBranding_createServerFn_handler, async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return DEFAULT_BRANDING;
  try {
    const response = await fetch(`${url}/rest/v1/app_branding?id=eq.1&select=app_name,short_name,org_name,description`, {
      headers: {
        apikey: key
      }
    });
    if (!response.ok) return DEFAULT_BRANDING;
    const rows = await response.json();
    return rows[0] ? {
      ...DEFAULT_BRANDING,
      ...rows[0]
    } : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
});
export {
  getPublicBranding_createServerFn_handler
};
