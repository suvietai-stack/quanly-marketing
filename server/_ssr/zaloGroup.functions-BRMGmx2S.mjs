import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { e as enumType, o as objectType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
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
const flowSchema = enumType(["photo", "marketing_design", "order_mockup"]);
async function check(ctx) {
  const {
    data,
    error
  } = await ctx.supabase.rpc("design_zalo_group_can_manage");
  if (error || !data) throw new Error("Bạn không có quyền Cài đặt thông báo Thiết kế");
}
const designGroupStatus_createServerFn_handler = createServerRpc({
  id: "7ae3c5e5f7e3eec5aebbffec85923e4327a2485cbfc84b0aa6c8f97652d76eb4",
  name: "designGroupStatus",
  filename: "src/lib/orders/zaloGroup.functions.ts"
}, (opts) => designGroupStatus.__executeServer(opts));
const designGroupStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema
}).parse(data)).handler(designGroupStatus_createServerFn_handler, async ({
  context,
  data
}) => {
  await check(context);
  const s = await import("./zaloGroup.server-D0P-IcLK.mjs");
  const {
    getConfig
  } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const c = await getConfig();
  const cfg = await s.designGroupConfig(data.flow);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    count
  } = await supabaseAdmin.from("design_zalo_group_events").select("id", {
    count: "exact",
    head: true
  }).eq("flow", data.flow).in("status", ["failed", "unknown"]);
  return {
    oaConnected: c?.status === "connected",
    oaName: c?.oa_name ?? null,
    groupId: cfg?.group_id ?? "",
    groupName: cfg?.group_name ?? "",
    enabled: !!cfg?.enabled,
    failed: count ?? 0
  };
});
const designGroupListGroups_createServerFn_handler = createServerRpc({
  id: "0ed236a9ba66a1e2f9a4222d5a41568408815d48f9a175cf18ee0706ccf208ef",
  name: "designGroupListGroups",
  filename: "src/lib/orders/zaloGroup.functions.ts"
}, (opts) => designGroupListGroups.__executeServer(opts));
const designGroupListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(designGroupListGroups_createServerFn_handler, async ({
  context
}) => {
  await check(context);
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  return s.listGroups();
});
const designGroupSave_createServerFn_handler = createServerRpc({
  id: "129b708f6dfc9435972772129a5b5c1bd085bc63e4521ca4c9beb7ab336d1053",
  name: "designGroupSave",
  filename: "src/lib/orders/zaloGroup.functions.ts"
}, (opts) => designGroupSave.__executeServer(opts));
const designGroupSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema,
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType()
}).parse(data)).handler(designGroupSave_createServerFn_handler, async ({
  context,
  data
}) => {
  await check(context);
  const {
    error
  } = await context.supabase.rpc("design_zalo_group_save", {
    _flow: data.flow,
    _group_id: data.groupId,
    _group_name: data.groupName,
    _enabled: data.enabled
  });
  return error ? {
    ok: false,
    message: error.message
  } : {
    ok: true,
    message: "Đã lưu cấu hình Zalo của " + data.flow
  };
});
const designGroupSendTest_createServerFn_handler = createServerRpc({
  id: "b14b5d53da9d7f184ab7d3ccdb7b9c188fe63d57c5935c8aa58ff37982b4fe1e",
  name: "designGroupSendTest",
  filename: "src/lib/orders/zaloGroup.functions.ts"
}, (opts) => designGroupSendTest.__executeServer(opts));
const designGroupSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema
}).parse(data)).handler(designGroupSendTest_createServerFn_handler, async ({
  context,
  data
}) => {
  await check(context);
  const s = await import("./zaloGroup.server-D0P-IcLK.mjs");
  return s.designGroupSendTest(data.flow);
});
const designGroupHistory_createServerFn_handler = createServerRpc({
  id: "0b2cbaddbab67da314f73654234222290becd59c1e05d1c6cbce3788f63e3641",
  name: "designGroupHistory",
  filename: "src/lib/orders/zaloGroup.functions.ts"
}, (opts) => designGroupHistory.__executeServer(opts));
const designGroupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema
}).parse(data)).handler(designGroupHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  await check(context);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: rows
  } = await supabaseAdmin.from("design_zalo_group_events").select("id,event,status,error,created_at,sent_at,snapshot").eq("flow", data.flow).order("created_at", {
    ascending: false
  }).limit(30);
  return {
    events: rows ?? []
  };
});
const designGroupRetryEvent_createServerFn_handler = createServerRpc({
  id: "e242f45ad4f754d7b255df768ebf8b0489c3a237f31a49327ded2df8270c48e7",
  name: "designGroupRetryEvent",
  filename: "src/lib/orders/zaloGroup.functions.ts"
}, (opts) => designGroupRetryEvent.__executeServer(opts));
const designGroupRetryEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema,
  id: stringType().uuid()
}).parse(data)).handler(designGroupRetryEvent_createServerFn_handler, async ({
  context,
  data
}) => {
  await check(context);
  const s = await import("./zaloGroup.server-D0P-IcLK.mjs");
  return s.designGroupRetry(data.id, data.flow);
});
export {
  designGroupHistory_createServerFn_handler,
  designGroupListGroups_createServerFn_handler,
  designGroupRetryEvent_createServerFn_handler,
  designGroupSave_createServerFn_handler,
  designGroupSendTest_createServerFn_handler,
  designGroupStatus_createServerFn_handler
};
