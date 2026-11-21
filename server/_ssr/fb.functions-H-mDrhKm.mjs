import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { s as stringType, o as objectType, b as booleanType, a as arrayType, e as enumType, u as unionType, r as recordType, l as literalType } from "../_libs/zod.mjs";
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
  } = await ctx.supabase.rpc("fbl_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền quản lý tích hợp Facebook Lead Ads");
}
async function admin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const id = stringType().regex(/^\d{1,40}$/);
const fblOverview_createServerFn_handler = createServerRpc({
  id: "e7d55f66a5107ba7e1d3b8d32abe7f547587f7286cf17f139134a3bb33285301",
  name: "fblOverview",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblOverview.__executeServer(opts));
const fblOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(fblOverview_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const db = await admin();
  const [pages, forms, state, cat, counts] = await Promise.all([db.from("fbl_pages").select("page_id,name,source,status,status_detail,subscribed,checked_at").neq("status", "disconnected").order("name"), db.from("fbl_forms").select("form_id,page_id,name,meta_status,questions,mapping,enabled,enabled_at,needs_review,checked_at").order("name"), db.from("fbl_state").select("*").eq("id", 1).single(), s.catalogs(), db.from("fbl_events").select("status")]);
  const features = await (await import("./connections.server-D6zdkab1.mjs")).connectionFeatures();
  const stat = {};
  for (const r of counts.data ?? []) stat[r.status] = (stat[r.status] ?? 0) + 1;
  return {
    appId: s.META_APP_ID,
    secrets: {
      appSecret: !!s.appSecret(),
      verifyToken: !!s.verifyToken()
    },
    webhookUrl: `${await s.baseUrl()}/api/public/meta/leads-webhook`,
    redirectUri: await s.redirectUri(),
    state: state.data,
    inboxAvailable: features.installed,
    pages: (pages.data ?? []).map((p) => ({
      ...p,
      lead_enabled: features.rows.find((f) => f.page_id === p.page_id)?.lead_enabled ?? true,
      messaging_enabled: features.rows.find((f) => f.page_id === p.page_id)?.enabled ?? false,
      messaging_ready: features.rows.find((f) => f.page_id === p.page_id)?.ready ?? false,
      messaging_reason: features.rows.find((f) => f.page_id === p.page_id)?.reason
    })),
    forms: forms.data ?? [],
    catalogs: cat,
    stats: stat
  };
});
const fblConnectUrl_createServerFn_handler = createServerRpc({
  id: "131b0a4b0abf3b73f8dd79b796c48614b49ec5a392c5e2b994a397344cecbe55",
  name: "fblConnectUrl",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblConnectUrl.__executeServer(opts));
const fblConnectUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  messaging: booleanType().optional()
}).optional().parse(d)).handler(fblConnectUrl_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  if (!s.appSecret()) throw new Error("Chưa nhập META_APP_SECRET");
  const state = crypto.randomUUID().replace(/-/g, "");
  const db = await admin();
  await db.from("fbl_oauth_sessions").delete().lt("created_at", new Date(Date.now() - 36e5).toISOString());
  await db.from("fbl_oauth_sessions").insert({
    state,
    user_id: context.userId
  });
  const u = new URL("https://www.facebook.com/v23.0/dialog/oauth");
  u.searchParams.set("client_id", s.META_APP_ID);
  u.searchParams.set("redirect_uri", await s.redirectUri());
  u.searchParams.set("state", state);
  u.searchParams.set("scope", [...s.OAUTH_SCOPES, ...data?.messaging ? ["pages_messaging"] : []].join(","));
  u.searchParams.set("auth_type", "rerequest");
  return {
    url: u.toString()
  };
});
const fblPendingPages_createServerFn_handler = createServerRpc({
  id: "575f8e9cf35b1ba370cba87bc13367912675146ef02636b0293298e44cf164e9",
  name: "fblPendingPages",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblPendingPages.__executeServer(opts));
const fblPendingPages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  state: stringType().max(100)
}).parse(d)).handler(fblPendingPages_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const result = await s.sessionDiscovery(data.state, context.userId);
  const features = await (await import("./connections.server-D6zdkab1.mjs")).connectionFeatures();
  const {
    data: existing
  } = await (await admin()).from("fbl_pages").select("page_id,status").neq("status", "disconnected");
  return {
    ...result,
    inboxAvailable: features.installed,
    pages: result.pages.map(({
      token: _token,
      ...p
    }) => {
      const f = features.rows.find((row) => row.page_id === p.id);
      return {
        ...p,
        selectedLead: f?.lead_enabled ?? !!existing?.some((row) => row.page_id === p.id),
        selectedMessaging: f?.enabled ?? false
      };
    })
  };
});
const fblConnectPages_createServerFn_handler = createServerRpc({
  id: "5da6be177cacc9ebd2ee25941c5698310a2f140dc3b64e1120bff4a8e59ccdca",
  name: "fblConnectPages",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblConnectPages.__executeServer(opts));
const fblConnectPages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  state: stringType().max(100),
  pageIds: arrayType(id).min(1).max(50),
  choices: arrayType(objectType({
    pageId: id,
    lead: booleanType(),
    messaging: booleanType()
  })).max(50).optional()
}).parse(d)).handler(fblConnectPages_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const db = await admin();
  const discovered = (await s.sessionDiscovery(data.state, context.userId)).pages;
  if (data.pageIds.some((id2) => !discovered.some((p) => p.id === id2))) throw new Error("Page được chọn không thuộc phiên OAuth này");
  const pages = discovered.filter((p) => data.pageIds.includes(p.id));
  const {
    verifyCandidate
  } = await import("./pageDiscovery.server-CVyIjM9b.mjs");
  const results = [];
  if (data.choices && (new Set(data.choices.map((c) => c.pageId)).size !== data.choices.length || data.choices.some((c) => !data.pageIds.includes(c.pageId)))) throw new Error("Lựa chọn Page không hợp lệ");
  const currentFeatures = await (await import("./connections.server-D6zdkab1.mjs")).connectionFeatures();
  for (const p of pages) {
    const feature = currentFeatures.rows.find((f) => f.page_id === p.id);
    const choice = data.choices?.find((c) => c.pageId === p.id) ?? (currentFeatures.installed ? {
      lead: feature?.lead_enabled ?? true,
      messaging: feature?.enabled ?? false
    } : void 0);
    if (choice) {
      try {
        await (await import("./connections.server-D6zdkab1.mjs")).configurePage(p, choice.lead, choice.messaging, context.userId, true);
        results.push({
          id: p.id,
          name: p.name,
          ok: true,
          message: "Đã kết nối và lưu lựa chọn"
        });
        if (choice.lead) {
          try {
            await s.refreshForms(p.id);
          } catch {
          }
        }
      } catch (e) {
        results.push({
          id: p.id,
          name: p.name,
          ok: false,
          message: e instanceof Error ? e.message : "Không thể kết nối Page"
        });
      }
      continue;
    }
    const access = await verifyCandidate(s.graph, s.META_APP_ID, `${s.META_APP_ID}|${s.appSecret()}`, p);
    if (!access.eligible) {
      results.push({
        id: p.id,
        name: p.name,
        ok: false,
        message: access.message
      });
      continue;
    }
    const subscribed = await s.subscribePage(p.id, p.token);
    if (!subscribed) {
      results.push({
        id: p.id,
        name: p.name,
        ok: false,
        message: "Meta chưa xác nhận đăng ký leadgen; giữ nguyên kết nối cũ"
      });
      continue;
    }
    await db.from("fbl_pages").upsert({
      page_id: p.id,
      name: p.name,
      status: "connected",
      status_detail: null,
      connected_by: context.userId,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "page_id"
    });
    await db.from("fbl_page_tokens").upsert({
      page_id: p.id,
      token_enc: await s.seal(p.token),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "page_id"
    });
    const chk = await s.checkPage(p.id);
    let msg = chk.ok ? chk.subscribed ? "Đã đăng ký nhận lead" : "Kết nối được nhưng Page chưa đăng ký nhận lead" : chk.message ?? "Kiểm tra thất bại";
    if (chk.ok) {
      try {
        const f = await s.refreshForms(p.id);
        msg += ` · ${f.total} Form`;
      } catch (e) {
        msg += ` · Không đọc được Form: ${e.message}`;
      }
    }
    results.push({
      id: p.id,
      name: p.name,
      ok: chk.ok,
      message: msg
    });
  }
  await db.from("fbl_oauth_sessions").delete().eq("state", data.state);
  return results;
});
const fblPageAction_createServerFn_handler = createServerRpc({
  id: "7d21e629d39e0be676db8b01fe888283db8946f80c51bfc050a68dd039293b2a",
  name: "fblPageAction",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblPageAction.__executeServer(opts));
const fblPageAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: id,
  action: enumType(["check", "refresh", "disconnect", "source"]),
  source: stringType().max(200).nullable().optional()
}).parse(d)).handler(fblPageAction_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const db = await admin();
  if (data.action === "check") {
    const connections = await import("./connections.server-D6zdkab1.mjs");
    const features = await connections.connectionFeatures();
    if (features.installed) {
      const f = features.rows.find((p) => p.page_id === data.pageId);
      return connections.configureExisting(data.pageId, f?.lead_enabled ?? true, f?.enabled ?? false, context.userId);
    }
    const r = await s.checkPage(data.pageId);
    return {
      ok: r.ok,
      message: r.ok ? r.subscribed ? "Page đã đăng ký leadgen; chưa phải bằng chứng đã nhận Webhook" : "Page chưa đăng ký nhận lead" : r.message ?? "Kiểm tra thất bại"
    };
  }
  if (data.action === "refresh") {
    try {
      const r = await s.refreshForms(data.pageId);
      return {
        ok: true,
        message: `Đã cập nhật ${r.total} Form (${r.added} Form mới, mặc định Tắt)`
      };
    } catch (e) {
      return {
        ok: false,
        message: e.message
      };
    }
  }
  if (data.action === "disconnect") {
    try {
      const t = await s.pageToken(data.pageId);
      await s.graph(`/${data.pageId}/subscribed_apps`, t, {
        method: "DELETE"
      });
    } catch {
    }
    await db.from("inbox_page_capabilities").update({
      enabled: false,
      ready: false,
      reason: "Page đã ngắt kết nối"
    }).eq("page_id", data.pageId);
    await db.from("fbl_page_tokens").delete().eq("page_id", data.pageId);
    await db.from("fbl_forms").update({
      enabled: false
    }).eq("page_id", data.pageId);
    await db.from("fbl_pages").update({
      status: "disconnected",
      subscribed: false,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("page_id", data.pageId);
    return {
      ok: true,
      message: "Đã ngắt kết nối Page; lịch sử được giữ lại"
    };
  }
  const cat = await s.catalogs();
  if (data.source && !cat.sources.includes(data.source)) return {
    ok: false,
    message: "Nguồn không có trong Kho nguồn tín hiệu"
  };
  await db.from("fbl_pages").update({
    source: data.source || null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("page_id", data.pageId);
  if (!data.source) await db.from("fbl_forms").update({
    enabled: false
  }).eq("page_id", data.pageId);
  return {
    ok: true,
    message: "Đã lưu nguồn tín hiệu"
  };
});
const rule = unionType([objectType({
  mode: literalType("facebook"),
  key: stringType().max(200),
  valueMap: recordType(stringType().max(200), stringType().max(200)).optional()
}), objectType({
  mode: literalType("default"),
  value: unionType([stringType().max(3e3), arrayType(stringType().max(200)).max(50)])
}), objectType({
  mode: literalType("empty")
})]);
const fblSaveForm_createServerFn_handler = createServerRpc({
  id: "a9897e29da9dbd258b768d7c310b213960337aaf301f5ca3554cd154fee1addc",
  name: "fblSaveForm",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblSaveForm.__executeServer(opts));
const fblSaveForm = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  formId: id,
  mapping: recordType(stringType(), rule).optional(),
  enabled: booleanType().optional()
}).parse(d)).handler(fblSaveForm_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const {
    validateMapping
  } = await import("./mapping-DJG8XEt0.mjs");
  const db = await admin();
  const {
    data: form
  } = await db.from("fbl_forms").select("*").eq("form_id", data.formId).single();
  const {
    data: page
  } = await db.from("fbl_pages").select("*").eq("page_id", form.page_id).single();
  const mapping = data.mapping ?? form.mapping;
  const errs = validateMapping(mapping, form.questions ?? [], await s.catalogs(), page.source);
  const patch = {
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (data.mapping) {
    patch.mapping = data.mapping;
    patch.needs_review = false;
  }
  if (data.enabled === true) {
    if (errs.length) return {
      ok: false,
      message: errs.join("; ")
    };
    if (page.status !== "connected") return {
      ok: false,
      message: "Page đang mất kết nối"
    };
    if (!form.enabled) {
      patch.enabled = true;
      patch.enabled_at = (/* @__PURE__ */ new Date()).toISOString();
    }
  } else if (data.enabled === false || data.mapping && errs.length) patch.enabled = false;
  await db.from("fbl_forms").update(patch).eq("form_id", data.formId);
  return {
    ok: true,
    message: data.enabled ? "Đã bật đồng bộ — chỉ nhận lead mới từ bây giờ" : data.enabled === false ? "Đã tắt đồng bộ" : errs.length ? `Đã lưu (chưa thể bật: ${errs.join("; ")})` : "Đã lưu cấu hình"
  };
});
const fblEvents_createServerFn_handler = createServerRpc({
  id: "2457f5b28011522a725a25f2560a17be6d90c45631296e05e17229ec9bfe1735",
  name: "fblEvents",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblEvents.__executeServer(opts));
const fblEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: stringType().max(40).optional(),
  formId: stringType().max(40).optional(),
  status: stringType().max(20).optional(),
  from: stringType().max(30).optional(),
  to: stringType().max(30).optional()
}).parse(d)).handler(fblEvents_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const db = await admin();
  let q = db.from("fbl_events").select("id,leadgen_id,page_id,form_id,received_at,lead_created_at,processed_at,signal_created_at,webhook_received_at,receipt_method,status,error,attempts,signal_id,source").order("received_at", {
    ascending: false
  }).limit(200);
  if (data.pageId) q = q.eq("page_id", data.pageId);
  if (data.formId) q = q.eq("form_id", data.formId);
  if (data.status) q = q.eq("status", data.status);
  if (data.from) q = q.gte("received_at", data.from);
  if (data.to) q = q.lte("received_at", data.to);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const fblRetry_createServerFn_handler = createServerRpc({
  id: "e4e0298a8fbaca62f929b46543eff5b6e0b8baaa44217a31c95ae11288fc8b14",
  name: "fblRetry",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblRetry.__executeServer(opts));
const fblRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(fblRetry_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await db.from("fbl_events").update({
    attempts: 0,
    status: "pending",
    next_retry_at: null
  }).eq("id", data.id).is("signal_id", null).or(`lease_until.is.null,lease_until.lte.${now}`);
  if (error) throw new Error("Không đưa được lead vào hàng đợi thử lại");
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const st = await s.processEvent(data.id);
  return {
    status: st
  };
});
const fblBackfill_createServerFn_handler = createServerRpc({
  id: "8e9bf063149694a0dd7f68755b2305c6d6a6a674ba6aed9eaa8c14b26248717a",
  name: "fblBackfill",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblBackfill.__executeServer(opts));
const fblBackfill = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  formId: id,
  from: stringType().datetime(),
  to: stringType().datetime(),
  apply: booleanType()
}).parse(d)).handler(fblBackfill_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  if (new Date(data.from) > new Date(data.to)) throw new Error("Khoảng thời gian không hợp lệ");
  if (new Date(data.to).getTime() - new Date(data.from).getTime() > 90 * 864e5) throw new Error("Tối đa 90 ngày mỗi lần đồng bộ bù");
  const s = await import("./fb.server-1Ea3ethR.mjs");
  try {
    return await s.backfill(data.formId, data.from, data.to, data.apply);
  } catch (e) {
    throw new Error(e?.message ?? "Lỗi đồng bộ bù");
  }
});
const fblMaintainNow_createServerFn_handler = createServerRpc({
  id: "b03ef1627952dca145d4489c9db35c6b837043b81f8a2408ed710045dabf96b4",
  name: "fblMaintainNow",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblMaintainNow.__executeServer(opts));
const fblMaintainNow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(fblMaintainNow_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  return (await import("./fb.server-1Ea3ethR.mjs")).maintain();
});
const fblWebhookDiagnostic_createServerFn_handler = createServerRpc({
  id: "e308716a992afcbcddc20c5061849c1a64edfd606eba580c431d095b1647663c",
  name: "fblWebhookDiagnostic",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblWebhookDiagnostic.__executeServer(opts));
const fblWebhookDiagnostic = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(fblWebhookDiagnostic_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const s = await import("./fb.server-1Ea3ethR.mjs");
  const expected = `${await s.baseUrl()}/api/public/meta/leads-webhook`;
  const result = await s.graph(`/${s.META_APP_ID}/subscriptions`, `${s.META_APP_ID}|${s.appSecret()}`);
  const subscription = (result.data ?? []).find((p) => p.object === "page");
  const fields = (subscription?.fields ?? []).map((f) => typeof f === "string" ? f : f.name);
  return {
    checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
    registered: !!subscription,
    active: subscription?.active === true,
    leadgen: fields.includes("leadgen"),
    callbackMatches: subscription?.callback_url === expected,
    callbackUrl: expected,
    message: !subscription ? "Meta trả subscriptions rỗng cho đối tượng Page: ứng dụng chưa đăng ký Webhook Page. Trong Meta Developers → Webhooks, chọn Page, nhập Callback URL và Verify Token đã cấu hình, xác minh rồi đăng ký leadgen." : `Meta: Page Webhook ${subscription.active ? "đang bật" : "chưa bật"}; leadgen ${fields.includes("leadgen") ? "đã đăng ký" : "chưa đăng ký"}; Callback ${subscription.callback_url === expected ? "khớp Base" : "không khớp Base"}. Xác minh GET và nhận POST là hai kiểm tra riêng; cần gửi lead thử thật.`
  };
});
const fblPageFeatures_createServerFn_handler = createServerRpc({
  id: "1545822d234fc398f8ce7f7d948aa060c23ad567823532f5338a7449698764d2",
  name: "fblPageFeatures",
  filename: "src/lib/fbLeads/fb.functions.ts"
}, (opts) => fblPageFeatures.__executeServer(opts));
const fblPageFeatures = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: id,
  lead: booleanType(),
  messaging: booleanType()
}).parse(d)).handler(fblPageFeatures_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  return (await import("./connections.server-D6zdkab1.mjs")).configureExisting(data.pageId, data.lead, data.messaging, context.userId);
});
export {
  fblBackfill_createServerFn_handler,
  fblConnectPages_createServerFn_handler,
  fblConnectUrl_createServerFn_handler,
  fblEvents_createServerFn_handler,
  fblMaintainNow_createServerFn_handler,
  fblOverview_createServerFn_handler,
  fblPageAction_createServerFn_handler,
  fblPageFeatures_createServerFn_handler,
  fblPendingPages_createServerFn_handler,
  fblRetry_createServerFn_handler,
  fblSaveForm_createServerFn_handler,
  fblWebhookDiagnostic_createServerFn_handler
};
