import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { s as settingsSchema, L as LEAD_FORM } from "./model-B_rsOxUC.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType } from "../_libs/zod.mjs";
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
async function active(ctx) {
  const r = await ctx.supabase.rpc("community_active");
  if (r.error || !r.data) throw new Error("Tài khoản chưa có quyền truy cập");
}
async function manage(ctx) {
  await active(ctx);
  const r = await ctx.supabase.rpc("wf_can_manage");
  return !r.error && !!r.data;
}
async function access(ctx, site, management = false) {
  const manager = await manage(ctx);
  if (manager) return;
  if (management) throw new Error("Chỉ quản trị tích hợp được cấu hình Chat Web");
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  const r = await db.from("wc_access").select("user_id").eq("site_id", site).eq("user_id", ctx.userId).maybeSingle();
  if (r.error || !r.data) throw new Error("Bạn chưa được cấp quyền website này");
}
const chatOverview_createServerFn_handler = createServerRpc({
  id: "ee75ed25866f6199664756a7b2dda7ca8277034b6ea6741604c2f818badf379e",
  name: "chatOverview",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatOverview.__executeServer(opts));
const chatOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(chatOverview_createServerFn_handler, async ({
  context
}) => {
  const canManage = await manage(context);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  let ids = null;
  if (!canManage) {
    const r2 = await db.from("wc_access").select("site_id").eq("user_id", context.userId);
    if (r2.error) throw new Error("Không đọc được quyền Chat Web");
    ids = (r2.data ?? []).map((x) => x.site_id);
  }
  let q = db.from("wc_sites").select("id,enabled,settings,updated_at");
  if (ids) q = q.in("id", ids);
  const r = await q;
  if (r.error) {
    if (["42P01", "PGRST205"].includes(r.error.code)) return {
      installed: false,
      canManage,
      sites: [],
      sources: []
    };
    throw new Error("Không tải được Chat Web");
  }
  const rows = r.data ?? [];
  const websites = rows.length ? await db.from("wf_websites").select("id,name,domain,source,status").in("id", rows.map((s) => s.id)) : {
    data: []
  };
  if (websites.error) throw new Error("Không tải được website");
  const cat = canManage ? await (await import("./wf.server-CfVqw8_K.mjs")).catalogs() : {
    sources: []
  };
  return {
    installed: true,
    canManage,
    sites: rows.map((s) => ({
      ...s,
      ...websites.data.find((w) => w.id === s.id),
      settings: canManage ? s.settings : {
        character: s.settings.character,
        avatar: s.settings.avatar
      }
    })),
    sources: cat.sources
  };
});
const chatSaveSite_createServerFn_handler = createServerRpc({
  id: "1e3417caefaba9ee5e6e4f307982ad98cab530e1586988ce3e116ea7a04a1064",
  name: "chatSaveSite",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatSaveSite.__executeServer(opts));
const chatSaveSite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(150),
  domain: stringType().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/),
  source: stringType().min(1).max(200),
  enabled: booleanType(),
  settings: settingsSchema
}).parse(v)).handler(chatSaveSite_createServerFn_handler, async ({
  context,
  data
}) => {
  if (!await manage(context)) throw new Error("Không có quyền cấu hình");
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  const wf = await import("./wf.server-CfVqw8_K.mjs");
  const cat = await wf.catalogs();
  if (!cat.sources.includes(data.source)) throw new Error("Chọn nguồn trong Kho nguồn tín hiệu");
  let id = data.id, key;
  if (!id) {
    const r = await db.from("wf_websites").insert({
      name: data.name,
      domain: data.domain,
      source: data.source,
      created_by: context.userId
    }).select("id").single();
    if (r.error) throw new Error("Không tạo được website");
    id = r.data.id;
    const generated = wf.generateKey();
    key = generated.key;
    const k = await db.from("wf_keys").insert({
      website_id: id,
      key_hash: await wf.sha256(key),
      key_prefix: generated.prefix,
      key_enc: await wf.seal(key)
    });
    if (k.error) throw new Error("Không tạo được mã kết nối");
  } else {
    const found = await db.from("wc_sites").select("id").eq("id", id).single();
    if (found.error) throw new Error("Website không tồn tại");
    const r = await db.from("wf_websites").update({
      name: data.name,
      domain: data.domain,
      source: data.source,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id);
    if (r.error) throw new Error("Không cập nhật được website");
  }
  const s = await db.from("wc_sites").upsert({
    id,
    enabled: data.enabled,
    settings: data.settings,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (s.error) throw new Error("Không lưu được cấu hình");
  const f = await db.from("wf_forms").upsert({
    website_id: id,
    form_id: LEAD_FORM,
    variant: "",
    name: "Chat Web — Đốm AI",
    schema: [],
    mapping: {},
    enabled: data.enabled,
    enabled_at: (/* @__PURE__ */ new Date()).toISOString(),
    needs_review: false
  }, {
    onConflict: "website_id,form_id,variant"
  });
  if (f.error) throw new Error("Chưa bật được luồng tín hiệu");
  return {
    id,
    key
  };
});
const chatRotateKey_createServerFn_handler = createServerRpc({
  id: "e68df4c2e93e0538e8766aef46f554039e59cb2f62b520bb8cebe6e556c91ace",
  name: "chatRotateKey",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatRotateKey.__executeServer(opts));
const chatRotateKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid()
}).parse(v)).handler(chatRotateKey_createServerFn_handler, async ({
  context,
  data
}) => {
  await access(context, data.site, true);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  const wf = await import("./wf.server-CfVqw8_K.mjs");
  const k = wf.generateKey();
  const r = await db.from("wf_keys").update({
    key_hash: await wf.sha256(k.key),
    key_prefix: k.prefix,
    key_enc: await wf.seal(k.key),
    revoked_at: null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("website_id", data.site).select("website_id").single();
  if (r.error) throw new Error("Không đổi được khóa");
  return {
    key: k.key
  };
});
const chatAccess_createServerFn_handler = createServerRpc({
  id: "be840c6545bf12606064a9864263d17959e106da3249c6965920a558b53c22fb",
  name: "chatAccess",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatAccess.__executeServer(opts));
const chatAccess = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  user: stringType().uuid().optional(),
  enabled: booleanType().optional()
}).parse(v)).handler(chatAccess_createServerFn_handler, async ({
  context,
  data
}) => {
  await access(context, data.site, true);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  if (data.user) {
    const p2 = await db.from("profiles").select("id").eq("id", data.user).eq("status", "Đang hoạt động").maybeSingle();
    if (p2.error || !p2.data) throw new Error("Nhân viên không hoạt động");
    const r = data.enabled ? await db.from("wc_access").upsert({
      site_id: data.site,
      user_id: data.user
    }) : await db.from("wc_access").delete().eq("site_id", data.site).eq("user_id", data.user);
    if (r.error) throw new Error("Không lưu được quyền website");
  }
  const [p, a] = await Promise.all([db.from("profiles").select("id,full_name").eq("status", "Đang hoạt động").order("full_name"), db.from("wc_access").select("user_id").eq("site_id", data.site)]);
  if (p.error || a.error) throw new Error("Không tải được nhân viên");
  return {
    staff: p.data,
    allowed: a.data.map((x) => x.user_id)
  };
});
const chatThreads_createServerFn_handler = createServerRpc({
  id: "f2e7036af4d84b075f6716556e8f2c61e0eabfb815addffd6413b27aca0facc9",
  name: "chatThreads",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatThreads.__executeServer(opts));
const chatThreads = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  before: stringType().datetime().optional()
}).parse(v)).handler(chatThreads_createServerFn_handler, async ({
  context,
  data
}) => {
  await access(context, data.site);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  let q = db.from("wc_conversations").select("id,mode,summary,contact,signal_id,created_at,updated_at,read_at,error,taken_by").eq("site_id", data.site).order("updated_at", {
    ascending: false
  }).limit(100);
  if (data.before) q = q.lt("updated_at", data.before);
  const r = await q;
  if (r.error) throw new Error("Không tải được hội thoại");
  return r.data;
});
const chatThreadsFeed_createServerFn_handler = createServerRpc({
  id: "8eb7f1b144331d3855ecc2551e3b84e8e5409f0f4543d586d083fd16b58b9342",
  name: "chatThreadsFeed",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatThreadsFeed.__executeServer(opts));
const chatThreadsFeed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid().optional()
}).parse(v)).handler(chatThreadsFeed_createServerFn_handler, async ({
  context,
  data
}) => {
  await active(context);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  let allowed = null;
  if (data.site) {
    await access(context, data.site);
  } else if (!await manage(context)) {
    const r2 = await db.from("wc_access").select("site_id").eq("user_id", context.userId);
    if (r2.error) throw new Error("Không đọc được quyền Chat Web");
    const rows2 = r2.data ?? [];
    const siteIds = Array.from(new Set(rows2.map((x) => String(x.site_id))));
    if (!siteIds.length) return [];
    allowed = siteIds;
  }
  let q = db.from("wc_conversations").select("id,site_id,mode,summary,contact,signal_id,created_at,updated_at,read_at,error,taken_by").order("updated_at", {
    ascending: false
  }).limit(100);
  if (data.site) q = q.eq("site_id", data.site);
  else if (allowed) q = q.in("site_id", allowed);
  const r = await q;
  if (r.error) throw new Error("Không tải được danh sách hội thoại");
  const rows = r.data ?? [];
  if (!rows.length) return [];
  const presence = await db.rpc("wc_presence_summary", {
    p_conversations: rows.map((x) => x.id)
  });
  if (presence.error) throw new Error("Không tải được trạng thái trực tuyến");
  const byId = new Map((presence.data ?? []).map((x) => [x.conversation_id, x]));
  return rows.map((x) => ({
    ...x,
    presence: byId.get(x.id)?.presence || "offline",
    last_seen_at: byId.get(x.id)?.last_seen_at || null
  }));
});
const chatLocate_createServerFn_handler = createServerRpc({
  id: "17bfdffe40cedefe0ad429ae903ee7cd69d0e3ad80f99498390ca7ab41b73078",
  name: "chatLocate",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatLocate.__executeServer(opts));
const chatLocate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid()
}).parse(v)).handler(chatLocate_createServerFn_handler, async ({
  context,
  data
}) => {
  await active(context);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  const r = await db.from("wc_conversations").select("site_id").eq("id", data.id).maybeSingle();
  if (r.error || !r.data) throw new Error("Không mở được hội thoại");
  await access(context, r.data.site_id);
  return {
    site: r.data.site_id
  };
});
const chatThread_createServerFn_handler = createServerRpc({
  id: "ab0531e7959561f631bb6f407f866610cf4f6378a64d8af8e21339c67ce1efda",
  name: "chatThread",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatThread.__executeServer(opts));
const chatThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  id: stringType().uuid()
}).parse(v)).handler(chatThread_createServerFn_handler, async ({
  context,
  data
}) => {
  await access(context, data.site);
  const {
    db
  } = await import("./chat.server-CM61Y-Ea.mjs");
  const c = await db.from("wc_conversations").select("id,site_id,mode,summary,contact,signal_id,page_url,error,taken_by").eq("id", data.id).eq("site_id", data.site).single();
  if (c.error) throw new Error("Không có quyền xem hội thoại");
  const r = await db.from("wc_messages").select("id,role,body,state,created_at").eq("conversation_id", data.id).order("created_at").order("id").limit(500);
  if (r.error) throw new Error("Không tải được tin nhắn");
  const p = await db.rpc("wc_presence_summary", {
    p_conversations: [data.id]
  });
  if (p.error) throw new Error("Không tải được trạng thái trực tuyến");
  const live = p.data?.[0];
  return {
    ...c.data,
    messages: r.data,
    userId: context.userId,
    presence: live?.presence || "offline",
    last_seen_at: live?.last_seen_at || null
  };
});
const chatControl_createServerFn_handler = createServerRpc({
  id: "64054c2f8a017f40740cd3693aa04575e5df7e6079232eb4626b1ab0acf0d820",
  name: "chatControl",
  filename: "src/lib/webChat/chat.functions.ts"
}, (opts) => chatControl.__executeServer(opts));
const chatControl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  id: stringType().uuid(),
  action: enumType(["takeover", "resume", "send", "read"]),
  request: stringType().uuid(),
  text: stringType().trim().max(2e3).default("")
}).parse(v)).handler(chatControl_createServerFn_handler, async ({
  context,
  data
}) => {
  await access(context, data.site);
  const {
    db,
    rpc
  } = await import("./chat.server-CM61Y-Ea.mjs");
  const c = await db.from("wc_conversations").select("id").eq("id", data.id).eq("site_id", data.site).single();
  if (c.error) throw new Error("Không có quyền hội thoại");
  await rpc("wc_control", {
    p_conversation: data.id,
    p_actor: context.userId,
    p_action: data.action,
    p_request: data.request,
    p_text: data.text
  });
  return {
    ok: true
  };
});
export {
  chatAccess_createServerFn_handler,
  chatControl_createServerFn_handler,
  chatLocate_createServerFn_handler,
  chatOverview_createServerFn_handler,
  chatRotateKey_createServerFn_handler,
  chatSaveSite_createServerFn_handler,
  chatThread_createServerFn_handler,
  chatThreadsFeed_createServerFn_handler,
  chatThreads_createServerFn_handler
};
