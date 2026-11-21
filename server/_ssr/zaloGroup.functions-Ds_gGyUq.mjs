import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { e as enumType, o as objectType, r as recordType, s as stringType, b as booleanType } from "../_libs/zod.mjs";
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
const kindSchema = enumType(["advance", "payment", "salary_advance"]);
async function assertSettings(ctx, kind) {
  const {
    data,
    error
  } = await ctx.supabase.rpc("fr_zalo_can_manage", {
    _kind: kind
  });
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền cài đặt thông báo của chức năng này");
}
const frGroupStatus_createServerFn_handler = createServerRpc({
  id: "63f03e261920d3c5e5410e1fdadc53c73c3d6d46b6cd10f735738c7240b98231",
  name: "frGroupStatus",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupStatus.__executeServer(opts));
const frGroupStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(frGroupStatus_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertSettings(context, data.kind);
  const {
    getConfig
  } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const s = await import("./zaloGroup.server-CLmZu-NH.mjs");
  const c = await getConfig();
  const cfg = await s.frGroupConfig(data.kind);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    count
  } = await supabaseAdmin.from("fr_zalo_group_events").select("id", {
    count: "exact",
    head: true
  }).eq("kind", data.kind).in("status", ["failed", "unknown"]);
  return {
    oaConnected: c?.status === "connected",
    oaName: c?.oa_name ?? null,
    groupId: cfg?.group_id ?? "",
    groupName: cfg?.group_name ?? "",
    enabled: !!cfg?.enabled,
    intro: cfg?.intro ?? "",
    toggles: {
      submitted: cfg?.on_submitted !== false,
      info: cfg?.on_info !== false,
      approved: cfg?.on_approved !== false,
      rejected: cfg?.on_rejected !== false,
      paid: cfg?.on_paid !== false,
      settled: cfg?.on_settled !== false,
      deducted: cfg?.on_deducted !== false,
      done: cfg?.on_done !== false
    },
    failed: count ?? 0
  };
});
const frGroupListGroups_createServerFn_handler = createServerRpc({
  id: "d8e0ca35874fbea344a87570d2fb1b8114c5c807504ce9851193340c06b87903",
  name: "frGroupListGroups",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupListGroups.__executeServer(opts));
const frGroupListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(frGroupListGroups_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertSettings(context, data.kind);
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  return s.listGroups();
});
const frGroupSave_createServerFn_handler = createServerRpc({
  id: "f57fd0b7f4e4d56700ce15b25a00afe72fcbd082ab9f468767e76d01767832d4",
  name: "frGroupSave",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupSave.__executeServer(opts));
const frGroupSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema,
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType(),
  intro: stringType().trim().max(300),
  toggles: recordType(stringType(), booleanType())
}).parse(d)).handler(frGroupSave_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.rpc("fr_zalo_group_save", {
    _kind: data.kind,
    _group_id: data.groupId,
    _group_name: data.groupName,
    _enabled: data.enabled,
    _toggles: data.toggles,
    _intro: data.intro
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true,
    message: "Đã lưu cài đặt thông báo Zalo"
  };
});
const frGroupSendTest_createServerFn_handler = createServerRpc({
  id: "17d5b2afa0c66de4802bf679f33cb4ff50953e4feaf65760e3af6a8d9b4a7254",
  name: "frGroupSendTest",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupSendTest.__executeServer(opts));
const frGroupSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(frGroupSendTest_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertSettings(context, data.kind);
  const s = await import("./zaloGroup.server-CLmZu-NH.mjs");
  return s.sendFrGroupTest(data.kind);
});
const frGroupHistory_createServerFn_handler = createServerRpc({
  id: "0a42b1cb005cd29f8efb7fa5122273131b5a0974b83df3e4ba31d2df4eb193a0",
  name: "frGroupHistory",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupHistory.__executeServer(opts));
const frGroupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema
}).parse(d)).handler(frGroupHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertSettings(context, data.kind);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: rows
  } = await supabaseAdmin.from("fr_zalo_group_events").select("id, request_id, event, status, error, attempts, summary, created_at, sent_at").eq("kind", data.kind).order("created_at", {
    ascending: false
  }).limit(50);
  return {
    events: rows ?? []
  };
});
const frGroupRetry_createServerFn_handler = createServerRpc({
  id: "c987dfb3afb4f42f772a5b769c611b53a78dba13a99bf55cb8762fb6f81e05a6",
  name: "frGroupRetry",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupRetry.__executeServer(opts));
const frGroupRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: kindSchema,
  id: stringType().uuid()
}).parse(d)).handler(frGroupRetry_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertSettings(context, data.kind);
  const s = await import("./zaloGroup.server-CLmZu-NH.mjs");
  return s.retryFrGroupEvent(data.id);
});
const frGroupDispatch_createServerFn_handler = createServerRpc({
  id: "561e31ce3cfcbfd0111dcce569ccb72210bb2712f75f8cf5d5f6212889bc4f5a",
  name: "frGroupDispatch",
  filename: "src/lib/financeRequests/zaloGroup.functions.ts"
}, (opts) => frGroupDispatch.__executeServer(opts));
const frGroupDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(frGroupDispatch_createServerFn_handler, async () => {
  try {
    const s = await import("./zaloGroup.server-CLmZu-NH.mjs");
    return await s.processFrGroup(10);
  } catch {
    return {
      processed: 0
    };
  }
});
export {
  frGroupDispatch_createServerFn_handler,
  frGroupHistory_createServerFn_handler,
  frGroupListGroups_createServerFn_handler,
  frGroupRetry_createServerFn_handler,
  frGroupSave_createServerFn_handler,
  frGroupSendTest_createServerFn_handler,
  frGroupStatus_createServerFn_handler
};
