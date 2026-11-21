import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { s as sendErrorGroup } from "./zaloSend-DdkAb9gd.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType, n as numberType } from "../_libs/zod.mjs";
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
async function assertAdmin(ctx) {
  const [{
    data: p
  }, {
    data: roles
  }] = await Promise.all([ctx.supabase.from("profiles").select("is_system_admin").eq("id", ctx.userId).maybeSingle(), ctx.supabase.from("user_roles").select("role_id").eq("user_id", ctx.userId)]);
  const ok = p?.is_system_admin || (roles ?? []).some((r) => r.role_id === "role-super-admin" || r.role_id === "role-admin");
  if (!ok) throw new Error("Chỉ Admin được cấu hình Zalo OA");
}
const zaloAdminStatus_createServerFn_handler = createServerRpc({
  id: "f9613bbc5984a8a3673102e07570014ad20a076e575a5e582c7effafe36b5b70",
  name: "zaloAdminStatus",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloAdminStatus.__executeServer(opts));
const zaloAdminStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloAdminStatus_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const env = await s.zaloEnv();
  const cfg = await s.getConfig();
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    error: colErr
  } = await supabaseAdmin.from("zalo_oa_config").select("app_id,app_secret,oa_secret_key,base_url,test_send_at").limit(1);
  const dbReady = !colErr;
  const {
    count
  } = await supabaseAdmin.from("zalo_links").select("user_id", {
    count: "exact",
    head: true
  }).eq("status", "active");
  const {
    data: stats
  } = await supabaseAdmin.from("notifications").select("zalo_status").gt("created_at", new Date(Date.now() - 7 * 864e5).toISOString());
  const agg = {};
  for (const r of stats ?? []) agg[r.zalo_status] = (agg[r.zalo_status] ?? 0) + 1;
  const configured = !!(env.appId && env.appSecret);
  const raw = cfg?.status ?? "disconnected";
  const state = !configured ? "unconfigured" : raw === "connected" ? "connected" : raw === "expired" ? "reconnect" : "disconnected";
  const {
    data: latestSent
  } = await supabaseAdmin.from("notifications").select("zalo_sent_at").eq("zalo_status", "sent").not("zalo_sent_at", "is", null).order("zalo_sent_at", {
    ascending: false
  }).limit(1);
  const {
    data: latestFailed
  } = await supabaseAdmin.from("notifications").select("zalo_error,created_at").in("zalo_status", ["failed", "ineligible"]).order("created_at", {
    ascending: false
  }).limit(20);
  const historicError = (latestFailed ?? []).find((n) => /^-?\d+:/.test(n.zalo_error ?? ""))?.zalo_error ?? null;
  const recentCode = cfg?.last_error?.match(/^Gửi tin thất bại \((-?\d+)\)/)?.[1];
  const errorCode = recentCode ?? historicError?.match(/^(-?\d+):/)?.[1] ?? null;
  const successDates = [cfg?.test_send_at, latestSent?.[0]?.zalo_sent_at].filter(Boolean).sort();
  return {
    dbReady,
    configured,
    appId: env.appId || "",
    appSecretSet: !!env.appSecret,
    appSecretHint: env.appSecret ? "Đã lưu bảo mật" : "",
    webhookReady: !!env.oaSecret,
    baseUrl: await s.baseUrl(),
    testOk: !!cfg?.test_send_at,
    oauthActive: configured && raw === "connected" && !cfg?.refresh_blocked && Date.parse(cfg?.token_expires_at ?? "") > Date.now(),
    sendState: recentCode ? "error" : successDates.length ? "active" : "unknown",
    sendErrorCode: errorCode ? Number(errorCode) : null,
    sendErrorGroup: errorCode ? sendErrorGroup(Number(errorCode)) : null,
    lastSendSuccess: successDates.at(-1) ?? null,
    state: cfg?.refresh_blocked && raw !== "expired" ? "refresh_review" : state,
    refreshLast: cfg?.refresh_last_success_at ?? null,
    refreshNext: cfg?.refresh_next_at ?? (cfg?.token_expires_at ? new Date(Date.parse(cfg.token_expires_at) - 2 * 36e5).toISOString() : null),
    refreshError: cfg?.refresh_error ?? null,
    schedulerLast: cfg?.scheduler_last_at ?? null,
    schedulerHealthy: !!cfg?.scheduler_last_at && Date.now() - Date.parse(cfg.scheduler_last_at) < 90 * 6e4,
    queueLast: cfg?.queue_last_at ?? null,
    callbackUrl: s.CALLBACK_URL,
    webhookUrl: s.WEBHOOK_URL,
    oaName: cfg?.oa_name ?? null,
    status: raw,
    autoSend: !!cfg?.auto_send,
    lastError: cfg?.last_error ?? null,
    linkedCount: count ?? 0,
    stats7d: agg
  };
});
const zaloConnectUrl_createServerFn_handler = createServerRpc({
  id: "e999d3a4df0a97eaced3cbf44c32291c306ba2c26fae06b86b8c8c0569212c5e",
  name: "zaloConnectUrl",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloConnectUrl.__executeServer(opts));
const zaloConnectUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloConnectUrl_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  return {
    url: await s.buildConnectUrl()
  };
});
const zaloCheck_createServerFn_handler = createServerRpc({
  id: "eca19a8db00e51b2fd646cb07888c38407844df44252379f4ff08377b69439e8",
  name: "zaloCheck",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloCheck.__executeServer(opts));
const zaloCheck = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloCheck_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  return s.checkConnection();
});
const zaloSendTest_createServerFn_handler = createServerRpc({
  id: "51443d20085427e049939d0ded8ea9d9643b63a1da3ffff6ace0f32e534222e8",
  name: "zaloSendTest",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloSendTest.__executeServer(opts));
const zaloSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloSendTest_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const {
    data: link
  } = await context.supabase.from("zalo_links").select("zalo_user_id,status").eq("user_id", context.userId).maybeSingle();
  if (!link || link.status !== "active") return {
    ok: false,
    message: "Tài khoản của bạn chưa liên kết Zalo — liên kết trước để nhận tin thử"
  };
  const m = s.testMessage(/* @__PURE__ */ new Date(), await s.brandHeader());
  const r = await s.sendCs(link.zalo_user_id, m.text, `${await s.baseUrl()}/settings`, {
    header: m.header,
    button: m.button
  });
  if (r.ok) await s.saveConfig({
    test_send_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_error: null
  }).catch(() => {
  });
  return r.ok ? {
    ok: true,
    message: "Zalo đã nhận yêu cầu gửi — kiểm tra điện thoại của bạn"
  } : {
    ok: false,
    message: `Không gửi được (${r.code}: ${r.message})`
  };
});
const zaloDisconnect_createServerFn_handler = createServerRpc({
  id: "8be822aaa1dbdd9a386505b2bc972edecc9c728644c848a5fc555a275b1532e2",
  name: "zaloDisconnect",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloDisconnect.__executeServer(opts));
const zaloDisconnect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloDisconnect_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  await s.saveConfig({
    access_token: null,
    refresh_token: null,
    token_expires_at: null,
    status: "disconnected",
    auto_send: false
  });
  return {
    ok: true
  };
});
const zaloSetAuto_createServerFn_handler = createServerRpc({
  id: "16de56824ea7268e1f76e54ca69ff2587db3a32e7cb453d35dde652edd166f63",
  name: "zaloSetAuto",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloSetAuto.__executeServer(opts));
const zaloSetAuto = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  on: booleanType()
}).parse(d)).handler(zaloSetAuto_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const cfg = await s.getConfig();
  if (data.on && (cfg?.status !== "connected" || !cfg?.test_send_at)) throw new Error("Cần gửi thử thành công trước khi bật gửi tự động");
  await s.saveConfig({
    auto_send: data.on
  });
  return {
    ok: true
  };
});
const zaloRetryFailed_createServerFn_handler = createServerRpc({
  id: "d4be283b27aea2cec8578b29c2869ce211d10eafcded78001badacb5c09f0eb6",
  name: "zaloRetryFailed",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloRetryFailed.__executeServer(opts));
const zaloRetryFailed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloRetryFailed_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const cfg = await s.getConfig();
  if (!cfg?.test_send_at || cfg?.last_error?.startsWith("Gửi tin thất bại")) throw new Error("Cần gửi thử mới thành công trước khi rà soát hàng đợi; không gửi lại hàng loạt tin lỗi cũ");
  return s.processPending(50);
});
const zaloMyLink_createServerFn_handler = createServerRpc({
  id: "6c8389ee6c13ff0df59b18afb7ac0e77e9164a78fa9628f71810c20f908a2012",
  name: "zaloMyLink",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloMyLink.__executeServer(opts));
const zaloMyLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloMyLink_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("zalo_links").select("status,linked_at,last_interaction_at").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Chưa kiểm tra được liên kết Zalo. Vui lòng thử lại.");
  return data ?? null;
});
const zaloReminderHealth_createServerFn_handler = createServerRpc({
  id: "f67fe2bec1fc0f4033cb868922c196a52dd6269fa4253b8bcff160c4c8396340",
  name: "zaloReminderHealth",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloReminderHealth.__executeServer(opts));
const zaloReminderHealth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloReminderHealth_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("zalo_oa_config").select("status,oa_id,oa_secret_key").eq("id", 1).maybeSingle();
  if (error) throw new Error("Chưa kiểm tra được trạng thái Zalo OA.");
  return {
    connected: data?.status === "connected",
    webhookConfigured: !!(data?.oa_secret_key || process.env["ZALO_OA_SECRET_KEY"]),
    oaUrl: data?.oa_id === "2511181204652469735" ? "https://zalo.me/2511181204652469735" : null
  };
});
const zaloCreateLinkCode_createServerFn_handler = createServerRpc({
  id: "fc252f009930dd2f052adbdf13b908fe3fa763f25fcb5a32fc157726149716c9",
  name: "zaloCreateLinkCode",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloCreateLinkCode.__executeServer(opts));
const zaloCreateLinkCode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloCreateLinkCode_createServerFn_handler, async ({
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const db = supabaseAdmin;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = "BASE-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  await db.from("zalo_link_codes").delete().eq("user_id", context.userId);
  const expires = new Date(Date.now() + 15 * 6e4).toISOString();
  const {
    error
  } = await db.from("zalo_link_codes").insert({
    code,
    user_id: context.userId,
    expires_at: expires
  });
  if (error) throw new Error("Không tạo được mã liên kết");
  return {
    code,
    expiresAt: expires
  };
});
const zaloUnlink_createServerFn_handler = createServerRpc({
  id: "12b464f21a04a62630aac68a95fc0d3c2eb17e8878b5e5b797f1a228e6e178e2",
  name: "zaloUnlink",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloUnlink.__executeServer(opts));
const zaloUnlink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloUnlink_createServerFn_handler, async ({
  context
}) => {
  await context.supabase.from("zalo_links").delete().eq("user_id", context.userId);
  return {
    ok: true
  };
});
const zaloDispatch_createServerFn_handler = createServerRpc({
  id: "e4a87921327b8165a8b41b55ffbc7e8329ccee77221917746c4703999d3de5d3",
  name: "zaloDispatch",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloDispatch.__executeServer(opts));
const zaloDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloDispatch_createServerFn_handler, async () => {
  try {
    const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
    return await s.processPending(20);
  } catch {
    return {
      processed: 0
    };
  }
});
const DB_HINT = "Cơ sở dữ liệu chưa có chỗ lưu cấu hình này — cần Admin phê duyệt cập nhật (xem hướng dẫn).";
const zaloSaveAppConfig_createServerFn_handler = createServerRpc({
  id: "c5e478e75ebc77a794a5a210f33462cc02bce3513ef659184a30faf6c3bf51eb",
  name: "zaloSaveAppConfig",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloSaveAppConfig.__executeServer(opts));
const zaloSaveAppConfig = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  appId: stringType().trim().regex(/^\d{5,30}$/, "App ID chỉ gồm chữ số"),
  appSecret: stringType().trim().max(200).optional()
}).parse(d)).handler(zaloSaveAppConfig_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const cfg = await s.getConfig();
  if (!cfg || !("app_id" in cfg)) {
    if (!cfg) await s.saveConfig({}).catch(() => {
    });
    const again = await s.getConfig();
    if (!again || !("app_id" in again)) return {
      ok: false,
      message: DB_HINT
    };
  }
  const patch = {
    app_id: data.appId
  };
  if (data.appSecret) patch.app_secret = data.appSecret;
  const changed = cfg?.app_id && cfg.app_id !== data.appId || !!data.appSecret;
  if (changed && cfg?.status === "connected") Object.assign(patch, {
    status: "expired",
    auto_send: false,
    test_send_at: null,
    last_error: "Đã đổi ứng dụng Zalo — cần kết nối lại OA"
  });
  await s.saveConfig(patch);
  return {
    ok: true,
    message: changed && cfg?.status === "connected" ? "Đã lưu — cần kết nối lại OA" : "Đã lưu cấu hình"
  };
});
const zaloSaveWebhookSecret_createServerFn_handler = createServerRpc({
  id: "93c164297f62ab1e48c3396f0993ad980f295fba749620026bcfa2d2143b9f0e",
  name: "zaloSaveWebhookSecret",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloSaveWebhookSecret.__executeServer(opts));
const zaloSaveWebhookSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  secret: stringType().trim().min(8).max(200)
}).parse(d)).handler(zaloSaveWebhookSecret_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const cfg = await s.getConfig();
  if (!cfg || !("oa_secret_key" in cfg)) return {
    ok: false,
    message: DB_HINT
  };
  await s.saveConfig({
    oa_secret_key: data.secret
  });
  return {
    ok: true,
    message: "Đã lưu khóa Webhook"
  };
});
const zaloSaveBaseUrl_createServerFn_handler = createServerRpc({
  id: "6585719a9c9b751c149303c3a714264737b14291b4be3eccd19b58db4e3cbb15",
  name: "zaloSaveBaseUrl",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloSaveBaseUrl.__executeServer(opts));
const zaloSaveBaseUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  url: stringType().max(200)
}).parse(d)).handler(zaloSaveBaseUrl_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const url = s.normalizeBaseUrl(data.url);
  if (!url) return {
    ok: false,
    message: "Chỉ nhận địa chỉ https://tên-miền (không kèm đường dẫn)"
  };
  const cfg = await s.getConfig();
  if (!cfg || !("base_url" in cfg)) return {
    ok: false,
    message: DB_HINT
  };
  await s.saveConfig({
    base_url: url
  });
  return {
    ok: true,
    message: `Đã lưu: ${url}`
  };
});
const zaloCareGet_createServerFn_handler = createServerRpc({
  id: "234e9b6a814fe9ec34c9ed25f50d7d4fa92f0ed2195e7d121c29da9f799a6995",
  name: "zaloCareGet",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloCareGet.__executeServer(opts));
const zaloCareGet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloCareGet_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const c = await s.getConfig();
  return {
    enabled: !!c?.care_enabled,
    waitHours: c?.care_wait_hours ?? 24,
    staleDays: c?.care_stale_days ?? 3,
    hour: c?.care_hour ?? 9,
    lastRun: c?.care_last_run ?? null
  };
});
const zaloCareSave_createServerFn_handler = createServerRpc({
  id: "4ea97a7d6d57e103a328d8386c4bd690b747fd2406e2a2f421c2f1ae79b8cba3",
  name: "zaloCareSave",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloCareSave.__executeServer(opts));
const zaloCareSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  enabled: booleanType(),
  waitHours: numberType().int().min(1).max(240),
  staleDays: numberType().int().min(1).max(60),
  hour: numberType().int().min(0).max(23)
}).parse(d)).handler(zaloCareSave_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertAdmin(context);
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const c = await s.getConfig();
  const {
    randomBytes
  } = await import("crypto");
  await s.saveConfig({
    care_enabled: data.enabled,
    care_wait_hours: data.waitHours,
    care_stale_days: data.staleDays,
    care_hour: data.hour,
    care_cron_token: c?.care_cron_token || randomBytes(24).toString("hex")
  });
  return {
    ok: true,
    message: "Đã lưu cài đặt nhắc chăm sóc"
  };
});
const zaloCareCounts_createServerFn_handler = createServerRpc({
  id: "bd48348bad073d72b86e3e7a038dff9251ac3532fe050d7350d4e20b49a88395",
  name: "zaloCareCounts",
  filename: "src/lib/zalo.functions.ts"
}, (opts) => zaloCareCounts.__executeServer(opts));
const zaloCareCounts = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(zaloCareCounts_createServerFn_handler, async () => {
  const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const c = await s.getConfig();
  return {
    waitHours: c?.care_wait_hours ?? 24,
    staleDays: c?.care_stale_days ?? 3
  };
});
export {
  zaloAdminStatus_createServerFn_handler,
  zaloCareCounts_createServerFn_handler,
  zaloCareGet_createServerFn_handler,
  zaloCareSave_createServerFn_handler,
  zaloCheck_createServerFn_handler,
  zaloConnectUrl_createServerFn_handler,
  zaloCreateLinkCode_createServerFn_handler,
  zaloDisconnect_createServerFn_handler,
  zaloDispatch_createServerFn_handler,
  zaloMyLink_createServerFn_handler,
  zaloReminderHealth_createServerFn_handler,
  zaloRetryFailed_createServerFn_handler,
  zaloSaveAppConfig_createServerFn_handler,
  zaloSaveBaseUrl_createServerFn_handler,
  zaloSaveWebhookSecret_createServerFn_handler,
  zaloSendTest_createServerFn_handler,
  zaloSetAuto_createServerFn_handler,
  zaloUnlink_createServerFn_handler
};
