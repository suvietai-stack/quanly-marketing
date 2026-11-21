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
async function assertManage(ctx) {
  const {
    data,
    error
  } = await ctx.supabase.rpc("fin_gmf_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền cấu hình thông báo Tiền Về");
}
const gmfStatus_createServerFn_handler = createServerRpc({
  id: "8ab9fbd99c194937ab7d267fa0a1b7eca0c96c4124f23e7eb82401e25c875fd5",
  name: "gmfStatus",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => gmfStatus.__executeServer(opts));
const gmfStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(gmfStatus_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const {
    getConfig
  } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const c = await getConfig();
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    count
  } = await supabaseAdmin.from("bank_transactions").select("id", {
    count: "exact",
    head: true
  }).in("gmf_status", ["failed", "unknown"]).eq("operation_test", false);
  return {
    oaConnected: c?.status === "connected",
    oaName: c?.oa_name ?? null,
    groupId: c?.gmf_group_id ?? "",
    groupName: c?.gmf_group_name ?? "",
    enabled: !!c?.gmf_enabled,
    failed: count ?? 0
  };
});
const gmfListGroups_createServerFn_handler = createServerRpc({
  id: "6d4fe17eb079327ce7e7e229905a07f31eb28f3d9e667b05266a475177064e07",
  name: "gmfListGroups",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => gmfListGroups.__executeServer(opts));
const gmfListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(gmfListGroups_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  return s.listGroups();
});
const gmfSave_createServerFn_handler = createServerRpc({
  id: "fdc833ecb4cfc79641bf8b3a39bd04225a35472e9c78dc9ab0557a7c7e4ffe43",
  name: "gmfSave",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => gmfSave.__executeServer(opts));
const gmfSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType()
}).parse(d)).handler(gmfSave_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  if (data.enabled && !data.groupId) return {
    ok: false,
    message: "Chọn nhóm GMF trước khi bật"
  };
  const {
    saveConfig
  } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  await saveConfig({
    gmf_group_id: data.groupId || null,
    gmf_group_name: data.groupName || null,
    gmf_enabled: data.enabled
  });
  return {
    ok: true,
    message: "Đã lưu cài đặt Zalo GMF"
  };
});
const gmfSendTest_createServerFn_handler = createServerRpc({
  id: "3bed5df2270a40545d8d6ad6a35bd41a99acc9beac8c4f862a6932c0b03677f0",
  name: "gmfSendTest",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => gmfSendTest.__executeServer(opts));
const gmfSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(gmfSendTest_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const {
    getConfig,
    brandHeader
  } = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const c = await getConfig();
  if (!c?.gmf_group_id) return {
    ok: false,
    message: "Chưa chọn nhóm GMF"
  };
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  const t = (/* @__PURE__ */ new Date()).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false
  });
  const r = await s.postGroup(c.gmf_group_id, `🧪 ${await brandHeader()} — TIN KIỂM THỬ TIỀN VỀ
Đây là tin kiểm tra kết nối nhóm, không chứa dữ liệu tài chính.
Thời gian: ${t}`);
  return r.ok ? {
    ok: true,
    message: "Zalo đã nhận yêu cầu gửi — kiểm tra nhóm"
  } : {
    ok: false,
    message: `Không gửi được (${r.code}: ${r.message})`
  };
});
const gmfRetry_createServerFn_handler = createServerRpc({
  id: "199dee88cf0bf496bc4d50ede94b8f59553c2652ba210d7a3a6e647bf693bdf5",
  name: "gmfRetry",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => gmfRetry.__executeServer(opts));
const gmfRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(gmfRetry_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  return s.sendPending();
});
const finManualNotify_createServerFn_handler = createServerRpc({
  id: "483ebddcdcb56717e3f0eb2a012a33da583984f8f0935a431f89a64df40bf814",
  name: "finManualNotify",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => finManualNotify.__executeServer(opts));
const finManualNotify = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(finManualNotify_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: t,
    error
  } = await context.supabase.from("bank_transactions").select("id, source, created_by, status, cancelled_at").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!t || t.source === "bank" || t.created_by !== context.userId || t.status !== "unclaimed" || t.cancelled_at) return {
    ok: false
  };
  try {
    const s = await import("./gmf.server-CUA1cOPW.mjs");
    await s.queueAndSend([t.id]);
  } catch {
  }
  return {
    ok: true
  };
});
const finRemindManual_createServerFn_handler = createServerRpc({
  id: "e243f0caa08b25912376e4e7fd591a6f911bff7df0507d2d4f1dfad1034c9e3d",
  name: "finRemindManual",
  filename: "src/lib/finance/gmf.functions.ts"
}, (opts) => finRemindManual.__executeServer(opts));
const finRemindManual = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(finRemindManual_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rid,
    error
  } = await context.supabase.rpc("fin_remind_manual_claim", {
    _tx: data.id
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  const s = await import("./gmf.server-CUA1cOPW.mjs");
  const r = await s.sendManualReminder(rid, data.id);
  return r.ok ? {
    ok: true,
    message: "Đã gửi nhắc xác nhận vào nhóm"
  } : {
    ok: false,
    message: r.ambiguous ? "Không rõ Zalo đã nhận — kiểm tra nhóm trước khi gửi lại" : `Không gửi được: ${r.message}`
  };
});
export {
  finManualNotify_createServerFn_handler,
  finRemindManual_createServerFn_handler,
  gmfListGroups_createServerFn_handler,
  gmfRetry_createServerFn_handler,
  gmfSave_createServerFn_handler,
  gmfSendTest_createServerFn_handler,
  gmfStatus_createServerFn_handler
};
