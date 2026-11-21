import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
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
async function assertSettings(ctx) {
  const {
    data,
    error
  } = await ctx.supabase.rpc("leave_zalo_group_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền Quản lý cài đặt đơn từ");
}
const leaveGroupStatus_createServerFn_handler = createServerRpc({
  id: "7bd2ca0bbbf3348b612b6a32411fc4d40279e35506a40761f88f1eb0e4682bfe",
  name: "leaveGroupStatus",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupStatus.__executeServer(opts));
const leaveGroupStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(leaveGroupStatus_createServerFn_handler, async ({
  context
}) => {
  await assertSettings(context);
  const {
    getConfig
  } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const s = await import("./zaloGroup.server-Cb0O4Rfl.mjs");
  const c = await getConfig();
  const cfg = await s.leaveGroupConfig();
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    count
  } = await supabaseAdmin.from("leave_zalo_group_events").select("id", {
    count: "exact",
    head: true
  }).in("status", ["failed", "unknown"]);
  return {
    oaConnected: c?.status === "connected",
    oaName: c?.oa_name ?? null,
    groupId: cfg?.group_id ?? "",
    groupName: cfg?.group_name ?? "",
    enabled: !!cfg?.enabled,
    onNew: cfg?.on_new !== false,
    onReassign: cfg?.on_reassign !== false,
    onApproved: cfg?.on_approved !== false,
    onRejected: cfg?.on_rejected !== false,
    failed: count ?? 0
  };
});
const leaveGroupListGroups_createServerFn_handler = createServerRpc({
  id: "290871761ddd013f2f7d9d8aa23a14427c54aece80c97845d581691122aac8b4",
  name: "leaveGroupListGroups",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupListGroups.__executeServer(opts));
const leaveGroupListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(leaveGroupListGroups_createServerFn_handler, async ({
  context
}) => {
  await assertSettings(context);
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  return s.listGroups();
});
const leaveGroupSave_createServerFn_handler = createServerRpc({
  id: "1b506d2c3f2bbc9564de17807445bce0f0371dc2d15afdfae05b2ee1d5ec5139",
  name: "leaveGroupSave",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupSave.__executeServer(opts));
const leaveGroupSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType(),
  onNew: booleanType(),
  onReassign: booleanType(),
  onApproved: booleanType(),
  onRejected: booleanType()
}).parse(d)).handler(leaveGroupSave_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.rpc("leave_zalo_group_save", {
    _group_id: data.groupId,
    _group_name: data.groupName,
    _enabled: data.enabled,
    _on_new: data.onNew,
    _on_reassign: data.onReassign,
    _on_approved: data.onApproved,
    _on_rejected: data.onRejected
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true,
    message: "Đã lưu cài đặt thông báo nhóm Nhân sự"
  };
});
const leaveGroupSendTest_createServerFn_handler = createServerRpc({
  id: "64e901a69723b9f9a7efa79f583a839ca9957e3f553efe224bfcf2d6fdf1b544",
  name: "leaveGroupSendTest",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupSendTest.__executeServer(opts));
const leaveGroupSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(leaveGroupSendTest_createServerFn_handler, async ({
  context
}) => {
  await assertSettings(context);
  const s = await import("./zaloGroup.server-Cb0O4Rfl.mjs");
  return s.sendLeaveGroupTest();
});
const leaveGroupHistory_createServerFn_handler = createServerRpc({
  id: "93b3160c4359f888826ceb0911776aab491868237c51062421d151d27e93d57b",
  name: "leaveGroupHistory",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupHistory.__executeServer(opts));
const leaveGroupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(leaveGroupHistory_createServerFn_handler, async ({
  context
}) => {
  await assertSettings(context);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data
  } = await supabaseAdmin.from("leave_zalo_group_events").select("id, request_id, event, status, error, attempts, summary, created_at, sent_at").order("created_at", {
    ascending: false
  }).limit(50);
  return {
    events: data ?? []
  };
});
const leaveGroupRetry_createServerFn_handler = createServerRpc({
  id: "b98faef28b729ce34b107ebdd970e19fc39a05a86fbd8c90c1ef7220b065b7e7",
  name: "leaveGroupRetry",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupRetry.__executeServer(opts));
const leaveGroupRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(leaveGroupRetry_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertSettings(context);
  const s = await import("./zaloGroup.server-Cb0O4Rfl.mjs");
  return s.retryLeaveGroupEvent(data.id);
});
const leaveGroupDispatch_createServerFn_handler = createServerRpc({
  id: "79d07fba37371d06860825b6bcb8207c70dc6da6855dc7595d08badc5840e441",
  name: "leaveGroupDispatch",
  filename: "src/lib/leave/zaloGroup.functions.ts"
}, (opts) => leaveGroupDispatch.__executeServer(opts));
const leaveGroupDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(leaveGroupDispatch_createServerFn_handler, async () => {
  try {
    const s = await import("./zaloGroup.server-Cb0O4Rfl.mjs");
    return await s.processLeaveGroup(10);
  } catch {
    return {
      processed: 0
    };
  }
});
export {
  leaveGroupDispatch_createServerFn_handler,
  leaveGroupHistory_createServerFn_handler,
  leaveGroupListGroups_createServerFn_handler,
  leaveGroupRetry_createServerFn_handler,
  leaveGroupSave_createServerFn_handler,
  leaveGroupSendTest_createServerFn_handler,
  leaveGroupStatus_createServerFn_handler
};
