import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { s as stringType, o as objectType, e as enumType, u as unionType, r as recordType, l as literalType, a as arrayType, b as booleanType } from "../_libs/zod.mjs";
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
  } = await ctx.supabase.rpc("wf_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền quản lý tích hợp Website Forms");
}
async function admin() {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const wid = stringType().uuid();
const wfOverview_createServerFn_handler = createServerRpc({
  id: "30ff5f0927f0ea26babdd9eaa2a29613b5ae42445486eff3b35c27adb9c41b68",
  name: "wfOverview",
  filename: "src/lib/webForms/wf.functions.ts"
}, (opts) => wfOverview.__executeServer(opts));
const wfOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(wfOverview_createServerFn_handler, async ({
  context
}) => {
  await assertManage(context);
  const s = await import("./wf.server-CfVqw8_K.mjs");
  const db = await admin();
  const [websites, forms, counts, cat] = await Promise.all([db.from("wf_websites").select("id,name,domain,source,status,last_seen_at,created_at").order("created_at"), db.from("wf_forms").select("website_id,form_id,variant,name,schema,mapping,enabled,enabled_at,needs_review,checked_at").order("name"), db.from("wf_events").select("status"), s.catalogs()]);
  const stat = {};
  for (const r of counts.data ?? []) stat[r.status] = (stat[r.status] ?? 0) + 1;
  const keys = await db.from("wf_keys").select("website_id,key_prefix,created_at,revoked_at");
  const base = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  const baseUrl = await base.baseUrl().catch(() => base.DEFAULT_BASE_URL);
  return {
    websites: websites.data ?? [],
    forms: forms.data ?? [],
    catalogs: cat,
    stats: stat,
    keys: keys.data ?? [],
    endpoints: {
      ping: `${baseUrl}/api/public/wf/ping`,
      register: `${baseUrl}/api/public/wf/register-forms`,
      submit: `${baseUrl}/api/public/wf/submit`
    }
  };
});
const wfAddWebsite_createServerFn_handler = createServerRpc({
  id: "92c37464a4fff0c25f79887c18b9ffc3852c074e53c810666f38d8ef65c592cd",
  name: "wfAddWebsite",
  filename: "src/lib/webForms/wf.functions.ts"
}, (opts) => wfAddWebsite.__executeServer(opts));
const wfAddWebsite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().trim().min(1).max(200),
  domain: stringType().trim().min(3).max(200).regex(/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i, "Domain không hợp lệ"),
  source: stringType().max(200)
}).parse(d)).handler(wfAddWebsite_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./wf.server-CfVqw8_K.mjs");
  const cat = await s.catalogs();
  if (!cat.sources.includes(data.source)) throw new Error("Nguồn không có trong Kho nguồn tín hiệu");
  const db = await admin();
  const {
    data: w,
    error
  } = await db.from("wf_websites").insert({
    name: data.name,
    domain: data.domain.toLowerCase(),
    source: data.source,
    created_by: context.userId
  }).select("id").single();
  if (error) throw new Error(`Không tạo được Website (${error.code})`);
  const k = s.generateKey();
  const {
    error: ke
  } = await db.from("wf_keys").insert({
    website_id: w.id,
    key_hash: await s.sha256(k.key),
    key_prefix: k.prefix,
    key_enc: await s.seal(k.key)
  });
  if (ke) throw new Error("Không tạo được khóa kết nối");
  return {
    websiteId: w.id,
    key: k.key
  };
});
const wfWebsiteAction_createServerFn_handler = createServerRpc({
  id: "eff8e81716b2b5f6815cad9a1ddeb2d590e855c41f31fb1a7b5ef7c72d3a71c6",
  name: "wfWebsiteAction",
  filename: "src/lib/webForms/wf.functions.ts"
}, (opts) => wfWebsiteAction.__executeServer(opts));
const wfWebsiteAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  websiteId: wid,
  action: enumType(["rotate_key", "revoke_key", "set_source", "rename"]),
  source: stringType().max(200).nullable().optional(),
  name: stringType().trim().min(1).max(200).optional()
}).parse(d)).handler(wfWebsiteAction_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./wf.server-CfVqw8_K.mjs");
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (data.action === "rotate_key") {
    const k = s.generateKey();
    const {
      error
    } = await db.from("wf_keys").update({
      key_hash: await s.sha256(k.key),
      key_prefix: k.prefix,
      key_enc: await s.seal(k.key),
      created_at: now,
      revoked_at: null
    }).eq("website_id", data.websiteId);
    if (error) throw new Error("Không đổi được khóa");
    return {
      ok: true,
      key: k.key,
      message: "Đã cấp khóa mới — khóa cũ hết hiệu lực ngay"
    };
  }
  if (data.action === "revoke_key") {
    await db.from("wf_keys").update({
      revoked_at: now
    }).eq("website_id", data.websiteId);
    await db.from("wf_forms").update({
      enabled: false,
      updated_at: now
    }).eq("website_id", data.websiteId);
    return {
      ok: true,
      message: "Đã thu hồi khóa và tắt đồng bộ mọi Form của Website"
    };
  }
  if (data.action === "rename") {
    await db.from("wf_websites").update({
      name: data.name,
      updated_at: now
    }).eq("id", data.websiteId);
    return {
      ok: true,
      message: "Đã đổi tên Website"
    };
  }
  const cat = await s.catalogs();
  if (data.source && !cat.sources.includes(data.source)) return {
    ok: false,
    message: "Nguồn không có trong Kho nguồn tín hiệu"
  };
  await db.from("wf_websites").update({
    source: data.source || null,
    updated_at: now
  }).eq("id", data.websiteId);
  if (!data.source) await db.from("wf_forms").update({
    enabled: false,
    updated_at: now
  }).eq("website_id", data.websiteId);
  return {
    ok: true,
    message: "Đã lưu nguồn tín hiệu — chỉ áp dụng cho tín hiệu tạo từ bây giờ"
  };
});
const rule = unionType([objectType({
  mode: literalType("website"),
  key: stringType().max(100),
  valueMap: recordType(stringType().max(500), stringType().max(200)).optional()
}), objectType({
  mode: literalType("default"),
  value: unionType([stringType().max(3e3), arrayType(stringType().max(200)).max(50)])
}), objectType({
  mode: literalType("compose"),
  keys: arrayType(stringType().max(100)).min(1).max(30)
}), objectType({
  mode: literalType("empty")
})]);
const wfSaveForm_createServerFn_handler = createServerRpc({
  id: "3002c612923103f9023be94a38ef97ad2828bc1497cd878c69adf016265fe5cf",
  name: "wfSaveForm",
  filename: "src/lib/webForms/wf.functions.ts"
}, (opts) => wfSaveForm.__executeServer(opts));
const wfSaveForm = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  websiteId: wid,
  formId: stringType().min(1).max(100),
  variant: stringType().max(100).default(""),
  mapping: recordType(stringType(), rule).optional(),
  enabled: booleanType().optional()
}).parse(d)).handler(wfSaveForm_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./wf.server-CfVqw8_K.mjs");
  const {
    validateMapping
  } = await import("./mapping-qtQs_k5t.mjs");
  const db = await admin();
  const {
    data: form
  } = await db.from("wf_forms").select("*").eq("website_id", data.websiteId).eq("form_id", data.formId).eq("variant", data.variant).single();
  const {
    data: website
  } = await db.from("wf_websites").select("*").eq("id", data.websiteId).single();
  const mapping = data.mapping ?? form.mapping;
  const errs = validateMapping(mapping, form.schema ?? [], await s.catalogs(), website.source);
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
    if (website.status !== "active") return {
      ok: false,
      message: "Website đang bị thu hồi"
    };
    if (!form.enabled) {
      patch.enabled = true;
      patch.enabled_at = (/* @__PURE__ */ new Date()).toISOString();
    }
  } else if (data.enabled === false || data.mapping && errs.length) patch.enabled = false;
  await db.from("wf_forms").update(patch).eq("website_id", data.websiteId).eq("form_id", data.formId).eq("variant", data.variant);
  return {
    ok: true,
    message: data.enabled ? "Đã bật đồng bộ — chỉ nhận submission mới từ bây giờ" : data.enabled === false ? "Đã tắt đồng bộ" : errs.length ? `Đã lưu (chưa thể bật: ${errs.join("; ")})` : "Đã lưu cấu hình"
  };
});
const wfEvents_createServerFn_handler = createServerRpc({
  id: "884590a2d512ae6560f76a5ec7ffb987d6aff38e8362f1e306ceddfeb15cc78f",
  name: "wfEvents",
  filename: "src/lib/webForms/wf.functions.ts"
}, (opts) => wfEvents.__executeServer(opts));
const wfEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  websiteId: stringType().max(40).optional(),
  formId: stringType().max(100).optional(),
  status: stringType().max(20).optional(),
  from: stringType().max(30).optional(),
  to: stringType().max(30).optional()
}).parse(d)).handler(wfEvents_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const db = await admin();
  let q = db.from("wf_events").select("id,website_id,form_id,variant,submission_id,page_url,sent_at,received_at,processed_at,status,error,attempts,signal_id,source,payload,lease_until,next_retry_at").order("received_at", {
    ascending: false
  }).limit(200);
  if (data.websiteId) q = q.eq("website_id", data.websiteId);
  if (data.formId) q = q.eq("form_id", data.formId);
  if (data.status) q = q.eq("status", data.status);
  if (data.from) q = q.gte("received_at", data.from);
  if (data.to) q = q.lte("received_at", data.to);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const {
    liveState
  } = await import("./wf.server-CfVqw8_K.mjs");
  return (rows ?? []).map(({
    payload,
    ...r
  }) => ({
    ...r,
    has_payload: payload != null,
    state: liveState(r)
  }));
});
const wfRetry_createServerFn_handler = createServerRpc({
  id: "e673070006620209c01601f62906ad4d237be476d9c9c32a036e48484bb4ee1a",
  name: "wfRetry",
  filename: "src/lib/webForms/wf.functions.ts"
}, (opts) => wfRetry.__executeServer(opts));
const wfRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(wfRetry_createServerFn_handler, async ({
  context,
  data
}) => {
  await assertManage(context);
  const s = await import("./wf.server-CfVqw8_K.mjs");
  return {
    status: await s.retryEvent(data.id)
  };
});
export {
  wfAddWebsite_createServerFn_handler,
  wfEvents_createServerFn_handler,
  wfOverview_createServerFn_handler,
  wfRetry_createServerFn_handler,
  wfSaveForm_createServerFn_handler,
  wfWebsiteAction_createServerFn_handler
};
