import { applyMapping, validateMapping } from "./mapping-DJG8XEt0.mjs";
import { o as objectType, a as arrayType, s as stringType, n as numberType, u as unionType } from "../_libs/zod.mjs";
const META_APP_ID = "1673473860857150";
const GRAPH = "https://graph.facebook.com/v23.0";
const FB_SYSTEM_CREATOR = "00000000-0000-0000-0000-00000000fb01";
const OAUTH_SCOPES = ["pages_show_list", "business_management", "pages_read_engagement", "pages_manage_metadata", "pages_manage_ads", "leads_retrieval"];
async function admin() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
function appSecret() {
  return process.env["META_APP_SECRET"] || "";
}
function verifyToken() {
  return process.env["META_WEBHOOK_VERIFY_TOKEN"] || "";
}
async function baseUrl() {
  const z2 = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
  return z2.baseUrl().catch(() => z2.DEFAULT_BASE_URL);
}
async function redirectUri() {
  return `${await baseUrl()}/api/public/meta/oauth-callback`;
}
const enc = new TextEncoder();
async function aesKey() {
  const s = appSecret();
  if (!s) throw new Error("Chưa cấu hình META_APP_SECRET");
  const h = await crypto.subtle.digest("SHA-256", enc.encode("fbl-token:" + s));
  return crypto.subtle.importKey("raw", h, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const b64 = (u) => btoa(String.fromCharCode(...u));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function seal(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), enc.encode(text)));
  return `${b64(iv)}.${b64(ct)}`;
}
async function unseal(v) {
  const [iv, ct] = v.split(".");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(), unb64(ct));
  return new TextDecoder().decode(pt);
}
async function verifySignature(raw, header, secret = appSecret()) {
  if (!header?.startsWith("sha256=") || !secret) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(raw)));
  const hex = Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
  const got = header.slice(7).toLowerCase();
  if (got.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}
class MetaError extends Error {
  constructor(msg, code) {
    super(msg);
    this.code = code;
  }
  code;
}
function explainMeta(e) {
  const msg = e?.error_user_msg || e?.message || "Lỗi Meta không xác định";
  const code = e?.code;
  if (code === 190) return `Token hết hạn hoặc bị thu hồi — cần Kết nối lại. (${msg})`;
  if (code === 10 || code === 200 || code === 3) return `Thiếu quyền Meta (có thể cần App Review / Advanced Access / Leads Access). (${msg})`;
  if (code === 100) return `Yêu cầu không hợp lệ hoặc thiếu quyền đọc. (${msg})`;
  if (code === 4 || code === 17 || code === 32 || code === 613) return `Meta giới hạn tần suất, thử lại sau. (${msg})`;
  return msg;
}
async function graph(path, token, init = {}) {
  const u = new URL(GRAPH + path);
  for (const [k, v] of Object.entries(init.params ?? {})) u.searchParams.set(k, v);
  u.searchParams.set("access_token", token);
  const r = await fetch(u, { method: init.method ?? "GET", signal: AbortSignal.timeout(2e4) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.error) throw new MetaError(explainMeta(j?.error ?? { message: `HTTP ${r.status}` }), j?.error?.code);
  return j;
}
async function pageToken(pageId) {
  const { data } = await (await admin()).from("fbl_page_tokens").select("token_enc").eq("page_id", pageId).maybeSingle();
  if (!data) throw new MetaError("Page chưa có token — cần Kết nối lại", 190);
  return unseal(data.token_enc);
}
async function catalogs() {
  const { data } = await (await admin()).from("catalogs").select("scope,items").in("scope", ["signal_sources", "signal_products", "signal_need_groups"]);
  const get = (s) => ((data ?? []).find((r) => r.scope === s)?.items ?? []).map((x) => typeof x === "string" ? { name: x, active: true } : x).filter((x) => x?.name && x.active !== false).map((x) => String(x.name));
  return { sources: get("signal_sources"), products: get("signal_products"), need_groups: get("signal_need_groups") };
}
async function exchangeCode(code, state) {
  const db = await admin();
  const { data: sess } = await db.from("fbl_oauth_sessions").select("*").eq("state", state).maybeSingle();
  if (!sess || Date.now() - new Date(sess.created_at).getTime() > 15 * 6e4) throw new Error("Phiên kết nối hết hạn");
  const tok = await graph("/oauth/access_token", "", { params: { client_id: META_APP_ID, client_secret: appSecret(), redirect_uri: await redirectUri(), code } }).catch(async (e) => {
    throw e;
  });
  const long = await graph("/oauth/access_token", "", { params: { grant_type: "fb_exchange_token", client_id: META_APP_ID, client_secret: appSecret(), fb_exchange_token: tok.access_token } });
  const { discoverPages } = await import("./pageDiscovery.server-CVyIjM9b.mjs");
  const discovery = await discoverPages(graph, long.access_token, META_APP_ID, `${META_APP_ID}|${appSecret()}`);
  const { error } = await db.from("fbl_oauth_sessions").update({ pages_enc: await seal(JSON.stringify(discovery)) }).eq("state", state).is("pages_enc", null);
  if (error) throw new Error("Không lưu được kết quả kiểm tra Page");
}
async function sessionDiscovery(state, userId) {
  const { data } = await (await admin()).from("fbl_oauth_sessions").select("*").eq("state", state).eq("user_id", userId).maybeSingle();
  if (!data?.pages_enc || Date.now() - new Date(data.created_at).getTime() > 15 * 6e4) throw new Error("Phiên chọn Page hết hạn — Kết nối lại Facebook");
  const payload = JSON.parse(await unseal(data.pages_enc));
  if (!Array.isArray(payload)) return payload;
  const { verifyCandidate } = await import("./pageDiscovery.server-CVyIjM9b.mjs");
  const pages = [];
  for (const p of payload) {
    const page = { ...p, origins: ["/me/accounts"], eligible: false, message: "" };
    Object.assign(page, await verifyCandidate(graph, META_APP_ID, `${META_APP_ID}|${appSecret()}`, page));
    pages.push(page);
  }
  return { pages, diagnostics: ["Phiên OAuth cũ không lưu User Token: chưa kiểm tra được /me/permissions và granular permissions của người dùng. Kết nối lại để kiểm tra các Business Portfolio."], permissions: [], granular: [] };
}
async function subscribePage(pageId, token) {
  await subscribeCapabilities(pageId, token, true, false);
  const j = await graph(`/${pageId}/subscribed_apps`, token);
  return (j.data ?? []).some((a) => String(a.id) === META_APP_ID && (a.subscribed_fields ?? []).includes("leadgen"));
}
async function subscribeCapabilities(pageId, token, lead, messaging) {
  const { subscriptionUnion } = await import("./model-JxC_wwt9.mjs");
  const old = await graph(`/${pageId}/subscribed_apps`, token);
  const app = (old.data ?? []).find((a) => String(a.id) === META_APP_ID);
  const fields = subscriptionUnion(app?.subscribed_fields ?? [], lead, messaging);
  if (fields.length) await graph(`/${pageId}/subscribed_apps`, token, { method: "POST", params: { subscribed_fields: fields.join(",") } });
  const checked = await graph(`/${pageId}/subscribed_apps`, token);
  const current = (checked.data ?? []).find((a) => String(a.id) === META_APP_ID)?.subscribed_fields ?? [];
  if (!fields.every((f) => current.includes(f))) throw new Error("Meta chưa xác nhận đủ trường Webhook; giữ lựa chọn hiện tại");
  return current;
}
async function checkPage(pageId) {
  const db = await admin();
  try {
    const token = await pageToken(pageId);
    const subscribed = await subscribePage(pageId, token);
    await db.from("fbl_pages").update({ status: "connected", status_detail: subscribed ? null : "Page chưa đăng ký nhận sự kiện leadgen cho App", subscribed, checked_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("page_id", pageId);
    return { ok: true, subscribed };
  } catch (e) {
    await db.from("fbl_pages").update({ status: "error", status_detail: e.message, subscribed: false, checked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("page_id", pageId);
    return { ok: false, message: e.message };
  }
}
async function refreshForms(pageId) {
  const db = await admin();
  const token = await pageToken(pageId);
  const forms = [];
  let after = "";
  do {
    const j = await graph(`/${pageId}/leadgen_forms`, token, { params: { fields: "id,name,status,questions{key,label,type,options}", limit: "100", ...after ? { after } : {} } });
    forms.push(...j.data ?? []);
    after = j.paging?.next ? j.paging?.cursors?.after ?? "" : "";
  } while (after && forms.length < 1e3);
  const { data: existing } = await db.from("fbl_forms").select("*").eq("page_id", pageId);
  const { data: page } = await db.from("fbl_pages").select("source").eq("page_id", pageId).single();
  const cat = await catalogs();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let added = 0;
  for (const f of forms) {
    const questions = (f.questions ?? []).map((q) => ({ key: q.key, label: q.label ?? q.key, type: q.type, options: (q.options ?? []).map((o) => ({ key: o.key, value: o.value })) }));
    const old = (existing ?? []).find((x) => x.form_id === f.id);
    if (!old) {
      added++;
      await db.from("fbl_forms").insert({ form_id: f.id, page_id: pageId, name: f.name ?? f.id, meta_status: f.status, questions, enabled: false, checked_at: now });
    } else {
      const changed = JSON.stringify(old.questions) !== JSON.stringify(questions);
      const invalid = changed && old.mapping && validateMapping(old.mapping, questions, cat, page?.source ?? null).length > 0;
      await db.from("fbl_forms").update({
        name: f.name ?? old.name,
        meta_status: f.status,
        questions,
        checked_at: now,
        updated_at: now,
        ...invalid ? { needs_review: true, enabled: false } : {}
      }).eq("form_id", f.id);
    }
  }
  const seen = new Set(forms.map((f) => f.id));
  for (const o of existing ?? []) if (!seen.has(o.form_id) && o.meta_status !== "ARCHIVED_OR_GONE") await db.from("fbl_forms").update({ meta_status: "ARCHIVED_OR_GONE", checked_at: now }).eq("form_id", o.form_id);
  return { total: forms.length, added };
}
const changeSchema = objectType({ field: stringType().max(100), value: objectType({ leadgen_id: unionType([stringType().regex(/^\d{1,40}$/), numberType().int().nonnegative()]).optional(), page_id: unionType([stringType().regex(/^\d{1,40}$/), numberType().int().nonnegative()]).optional(), form_id: unionType([stringType().regex(/^\d{1,40}$/), numberType().int().nonnegative()]).optional(), ad_id: unionType([stringType().regex(/^\d{1,40}$/), numberType().int().nonnegative()]).optional(), created_time: numberType().int().nonnegative().max(4102444800).optional() }).passthrough() });
const webhookSchema = objectType({ object: stringType().max(100), entry: arrayType(objectType({ changes: arrayType(changeSchema).max(100).optional() }).passthrough()).max(100).optional() }).passthrough();
function parseWebhook(body) {
  const parsed = webhookSchema.parse(body);
  if (parsed.object !== "page") return [];
  const out = [];
  for (const e of parsed.entry ?? []) for (const c of e.changes ?? []) {
    const v = c.value;
    if (c.field === "leadgen" && v.leadgen_id && v.page_id) out.push({ leadgen_id: String(v.leadgen_id), page_id: String(v.page_id), form_id: v.form_id ? String(v.form_id) : void 0, ad_id: v.ad_id ? String(v.ad_id) : void 0, created_time: v.created_time || void 0 });
  }
  return out;
}
async function recordEvents(changes, method = "webhook") {
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const rows = changes.map((c) => ({ leadgen_id: c.leadgen_id, page_id: c.page_id, form_id: c.form_id ?? null, ad_id: c.ad_id ?? null, lead_created_at: c.created_time ? new Date(c.created_time * 1e3).toISOString() : null, receipt_method: method, ...method === "webhook" ? { webhook_received_at: now } : {} }));
  if (!rows.length) return [];
  const { data, error } = await db.from("fbl_events").upsert(rows, { onConflict: "leadgen_id", ignoreDuplicates: true }).select("id");
  if (error) throw new Error(`db ${error.code}`);
  if (method === "webhook") {
    const { error: stampError } = await db.from("fbl_events").update({ webhook_received_at: now }).in("leadgen_id", changes.map((c) => c.leadgen_id)).is("webhook_received_at", null);
    if (stampError) throw new Error(`db ${stampError.code}`);
  }
  const { error: stateError } = await db.from("fbl_state").update({ last_event_at: now, ...method === "webhook" ? { last_webhook_at: now } : {} }).eq("id", 1);
  if (stateError) throw new Error(`db ${stateError.code}`);
  return (data ?? []).map((r) => r.id);
}
async function finish(id, lease, patch) {
  const { error } = await (await admin()).rpc("fbl_finish_event", { p_id: id, p_lease: lease, p_patch: patch });
  if (error) throw new Error(`Không lưu được kết quả xử lý (${error.code})`);
}
async function processEvent(id) {
  const db = await admin();
  const { data: ev, error: claimError } = await db.rpc("fbl_claim_event", { p_id: id });
  if (claimError) throw new Error(`Không nhận được công việc (${claimError.code})`);
  if (!ev) return "busy";
  const lease = ev.lease_token;
  try {
    const { data: page, error: pageError } = await db.from("fbl_pages").select("*").eq("page_id", ev.page_id).maybeSingle();
    if (pageError) throw new Error(`db ${pageError.code}`);
    if (!await leadEnabled(ev.page_id, ev.received_at)) {
      await finish(id, lease, { status: "skipped", error: "Page đang tắt nhận Lead hoặc lead trước lần bật lại" });
      return "skipped";
    }
    if (!page || page.status === "disconnected") {
      await finish(id, lease, { status: "skipped", error: "Page chưa kết nối với Base" });
      return "skipped";
    }
    const { data: form, error: formError } = await db.from("fbl_forms").select("*").eq("form_id", ev.form_id ?? "").eq("page_id", ev.page_id).maybeSingle();
    if (formError) throw new Error(`db ${formError.code}`);
    if (!form) {
      await finish(id, lease, { status: "skipped", error: "Form chưa có trong Base (bấm Làm mới danh sách Form)" });
      return "skipped";
    }
    const when = ev.lead_created_at ?? ev.received_at;
    if (!form.enabled || !ev.backfill && (!form.enabled_at || new Date(when) < new Date(form.enabled_at))) {
      await finish(id, lease, { status: "skipped", error: form.enabled ? "Lead trước thời điểm bật đồng bộ" : "Form đang tắt đồng bộ" });
      return "skipped";
    }
    if (!page.source || form.needs_review) {
      await finish(id, lease, { status: "needs_action", error: !page.source ? "Page chưa chọn Nguồn tín hiệu" : "Form thay đổi câu hỏi — cần kiểm tra lại cấu hình" });
      return "needs_action";
    }
    const lead = await graph(`/${ev.leadgen_id}`, await pageToken(ev.page_id), { params: { fields: "created_time,field_data,ad_id,campaign_id,form_id" } });
    if (String(lead.form_id) !== ev.form_id) throw new Error("Lead không thuộc Form của sự kiện");
    const r = applyMapping(form.mapping ?? {}, lead.field_data ?? [], await catalogs(), page.source, lead.created_time ?? when);
    if (!r.ok) {
      await finish(id, lease, { status: "needs_action", error: r.error });
      return "needs_action";
    }
    const { data: result, error } = await db.rpc("fbl_complete_event", { p_id: id, p_lease: lease, p_draft: r.draft, p_lead: { created_time: lead.created_time, ad_id: lead.ad_id ?? ev.ad_id, campaign_id: lead.campaign_id ?? null } });
    if (error) throw new Error(`Không tạo được tín hiệu (${error.code})`);
    return result;
  } catch (e) {
    await finish(id, lease, { status: "failed", error: e instanceof MetaError ? e.message : "Xử lý bị gián đoạn — hệ thống sẽ thử lại" });
    return "failed";
  }
}
async function dispatchPending() {
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await db.from("fbl_events").select("id,status,next_retry_at,lease_until").in("status", ["pending", "failed"]).is("signal_id", null).lt("attempts", 10).or(`lease_until.is.null,lease_until.lte.${now}`).order("received_at").limit(20);
  if (error) throw new Error(`db ${error.code}`);
  const rows = (data ?? []).filter((e) => e.status === "pending" || !e.next_retry_at || e.next_retry_at <= now);
  const results = [];
  for (let i = 0; i < rows.length; i += 4) results.push(...await Promise.all(rows.slice(i, i + 4).map((r) => processEvent(r.id))));
  return { processed: results.length, success: results.filter((s) => s === "success").length, failed: results.filter((s) => s === "failed").length };
}
function retryDelayMs(attempts) {
  return Math.min(2 ** Math.max(1, attempts), 360) * 6e4;
}
async function formLeads(formId, token, fromIso, toIso) {
  const out = [];
  let after = "";
  const filtering = JSON.stringify([{ field: "time_created", operator: "GREATER_THAN", value: Math.floor(new Date(fromIso).getTime() / 1e3) - 1 }]);
  do {
    const j = await graph(`/${formId}/leads`, token, { params: { fields: "id,created_time,ad_id", limit: "100", filtering, ...after ? { after } : {} } });
    for (const l of j.data ?? []) if (new Date(l.created_time) <= new Date(toIso)) out.push(l);
    after = j.paging?.next ? j.paging?.cursors?.after ?? "" : "";
  } while (after && out.length < 2e3);
  return out;
}
async function backfill(formId, fromIso, toIso, apply) {
  const db = await admin();
  const { data: form } = await db.from("fbl_forms").select("*").eq("form_id", formId).single();
  const leads = await formLeads(formId, await pageToken(form.page_id), fromIso, toIso);
  const ids = leads.map((l) => String(l.id));
  const have = /* @__PURE__ */ new Set();
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db.from("fbl_events").select("leadgen_id").in("leadgen_id", ids.slice(i, i + 200));
    for (const r of data ?? []) have.add(r.leadgen_id);
  }
  const missing = leads.filter((l) => !have.has(String(l.id)));
  if (!apply) return { total: leads.length, existing: have.size, missing: missing.length, created: 0, failed: 0 };
  const rows = missing.slice(0, 300).map((l) => ({ leadgen_id: String(l.id), page_id: form.page_id, form_id: formId, ad_id: l.ad_id ?? null, lead_created_at: new Date(l.created_time).toISOString(), backfill: true, receipt_method: "backfill" }));
  const { data: ins, error } = rows.length ? await db.from("fbl_events").upsert(rows, { onConflict: "leadgen_id", ignoreDuplicates: true }).select("id") : { data: [], error: null };
  if (error) throw new Error(`db ${error.code}`);
  let created = 0, failed = 0;
  for (const r of ins ?? []) {
    if (await processEvent(r.id) === "success") created++;
    else failed++;
  }
  return { total: leads.length, existing: have.size, missing: missing.length, created, failed };
}
async function maintain() {
  const db = await admin();
  const out = { pages: 0, newForms: 0, retried: 0, recovered: 0, errors: [] };
  const { data: pages } = await db.from("fbl_pages").select("page_id").neq("status", "disconnected");
  for (const p of pages ?? []) {
    out.pages++;
    try {
      out.newForms += (await refreshForms(p.page_id)).added;
    } catch (e) {
      out.errors.push(`${p.page_id}: ${e.message}`);
    }
  }
  out.retried = (await dispatchPending()).processed;
  const { data: forms } = await db.from("fbl_forms").select("form_id,page_id,enabled_at").eq("enabled", true);
  const since = new Date(Date.now() - 48 * 36e5);
  for (const f of forms ?? []) {
    try {
      const from = new Date(Math.max(since.getTime(), new Date(f.enabled_at).getTime())).toISOString();
      const leads = await formLeads(f.form_id, await pageToken(f.page_id), from, (/* @__PURE__ */ new Date()).toISOString());
      const ids = await recordEvents(leads.map((l) => ({ leadgen_id: String(l.id), page_id: f.page_id, form_id: f.form_id, ad_id: l.ad_id, created_time: Math.floor(new Date(l.created_time).getTime() / 1e3) })), "reconciliation");
      for (const id of ids) {
        out.recovered++;
        await processEvent(id);
      }
    } catch (e) {
      out.errors.push(`${f.form_id}: ${e.message}`);
    }
  }
  await db.from("fbl_state").update({ last_maintain_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", 1);
  return out;
}
async function leadEnabled(pageId, receivedAt) {
  const { data, error } = await (await admin()).from("inbox_page_capabilities").select("lead_enabled,lead_enabled_at").eq("page_id", pageId).maybeSingle();
  if (error && ["PGRST205", "42P01"].includes(error.code)) return true;
  if (error) throw new Error("Không đọc được lựa chọn nhận Lead của Page");
  return !data || data.lead_enabled && (!receivedAt || !data.lead_enabled_at || receivedAt >= data.lead_enabled_at);
}
export {
  FB_SYSTEM_CREATOR,
  GRAPH,
  META_APP_ID,
  MetaError,
  OAUTH_SCOPES,
  appSecret,
  backfill,
  baseUrl,
  catalogs,
  checkPage,
  dispatchPending,
  exchangeCode,
  explainMeta,
  graph,
  leadEnabled,
  maintain,
  pageToken,
  parseWebhook,
  processEvent,
  recordEvents,
  redirectUri,
  refreshForms,
  retryDelayMs,
  seal,
  sessionDiscovery,
  subscribeCapabilities,
  subscribePage,
  unseal,
  verifySignature,
  verifyToken
};
