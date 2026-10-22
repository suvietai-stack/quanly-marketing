import { applyMapping, validateMapping, type Catalogs, type Mapping, type Question } from "./mapping";

export const META_APP_ID = "1673473860857150";
export const GRAPH = "https://graph.facebook.com/v23.0";
/** Người tạo cho tín hiệu từ tích hợp — không phải tài khoản nhân viên. */
export const FB_SYSTEM_CREATOR = "00000000-0000-0000-0000-00000000fb01";
export const OAUTH_SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_metadata", "pages_manage_ads", "leads_retrieval"];

async function admin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export function appSecret() { return process.env["META_APP_SECRET"] || ""; }
export function verifyToken() { return process.env["META_WEBHOOK_VERIFY_TOKEN"] || ""; }

export async function baseUrl() {
  const z = await import("@/lib/zalo.server");
  return z.baseUrl().catch(() => z.DEFAULT_BASE_URL);
}
export async function redirectUri() { return `${await baseUrl()}/api/public/meta/oauth-callback`; }

// ---------- crypto ----------
const enc = new TextEncoder();
async function aesKey() {
  const s = appSecret();
  if (!s) throw new Error("Chưa cấu hình META_APP_SECRET");
  const h = await crypto.subtle.digest("SHA-256", enc.encode("fbl-token:" + s));
  return crypto.subtle.importKey("raw", h, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export async function seal(text: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), enc.encode(text)));
  return `${b64(iv)}.${b64(ct)}`;
}
export async function unseal(v: string) {
  const [iv, ct] = v.split(".");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(), unb64(ct));
  return new TextDecoder().decode(pt);
}

export async function verifySignature(raw: string, header: string | null, secret = appSecret()) {
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

// ---------- Graph ----------
export class MetaError extends Error { constructor(msg: string, public code?: number) { super(msg); } }
/** Diễn giải lỗi Meta thành nguyên nhân dễ hiểu, giữ thông điệp gốc. */
export function explainMeta(e: any): string {
  const msg = e?.error_user_msg || e?.message || "Lỗi Meta không xác định";
  const code = e?.code;
  if (code === 190) return `Token hết hạn hoặc bị thu hồi — cần Kết nối lại. (${msg})`;
  if (code === 10 || code === 200 || code === 3) return `Thiếu quyền Meta (có thể cần App Review / Advanced Access / Leads Access). (${msg})`;
  if (code === 100) return `Yêu cầu không hợp lệ hoặc thiếu quyền đọc. (${msg})`;
  if (code === 4 || code === 17 || code === 32 || code === 613) return `Meta giới hạn tần suất, thử lại sau. (${msg})`;
  return msg;
}
export async function graph(path: string, token: string, init: { method?: string; params?: Record<string, string> } = {}) {
  const u = new URL(GRAPH + path);
  for (const [k, v] of Object.entries(init.params ?? {})) u.searchParams.set(k, v);
  u.searchParams.set("access_token", token);
  const r = await fetch(u, { method: init.method ?? "GET" });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok || j?.error) throw new MetaError(explainMeta(j?.error ?? { message: `HTTP ${r.status}` }), j?.error?.code);
  return j;
}

export async function pageToken(pageId: string) {
  const { data } = await (await admin()).from("fbl_page_tokens").select("token_enc").eq("page_id", pageId).maybeSingle();
  if (!data) throw new MetaError("Page chưa có token — cần Kết nối lại", 190);
  return unseal(data.token_enc);
}

export async function catalogs(): Promise<Catalogs & { sources: string[] }> {
  const { data } = await (await admin()).from("catalogs").select("scope,items").in("scope", ["signal_sources", "signal_products", "signal_need_groups"]);
  const get = (s: string) => ((data ?? []).find((r: any) => r.scope === s)?.items ?? [])
    .map((x: any) => (typeof x === "string" ? { name: x, active: true } : x)).filter((x: any) => x?.name && x.active !== false).map((x: any) => String(x.name));
  return { sources: get("signal_sources"), products: get("signal_products"), need_groups: get("signal_need_groups") };
}

// ---------- OAuth ----------
export async function exchangeCode(code: string, state: string) {
  const db = await admin();
  const { data: sess } = await db.from("fbl_oauth_sessions").select("*").eq("state", state).maybeSingle();
  if (!sess || Date.now() - new Date(sess.created_at).getTime() > 15 * 60_000) throw new Error("Phiên kết nối hết hạn");
  const tok = await graph("/oauth/access_token", "", { params: { client_id: META_APP_ID, client_secret: appSecret(), redirect_uri: await redirectUri(), code } }).catch(async (e) => { throw e; });
  const long = await graph("/oauth/access_token", "", { params: { grant_type: "fb_exchange_token", client_id: META_APP_ID, client_secret: appSecret(), fb_exchange_token: tok.access_token } });
  const pages: any[] = [];
  let next: string | null = "/me/accounts";
  let params: Record<string, string> = { fields: "id,name,access_token,tasks", limit: "100" };
  while (next && pages.length < 500) {
    const j: any = await graph(next, long.access_token, { params });
    pages.push(...(j.data ?? []));
    const after = j.paging?.next ? j.paging?.cursors?.after : null;
    next = after ? "/me/accounts" : null;
    params = { ...params, after: after ?? "" };
  }
  await db.from("fbl_oauth_sessions").update({ pages_enc: await seal(JSON.stringify(pages.map((p) => ({ id: p.id, name: p.name, token: p.access_token, tasks: p.tasks ?? [] })))) }).eq("state", state);
}

export async function sessionPages(state: string, userId: string): Promise<{ id: string; name: string; token: string; tasks: string[] }[]> {
  const { data } = await (await admin()).from("fbl_oauth_sessions").select("*").eq("state", state).eq("user_id", userId).maybeSingle();
  if (!data?.pages_enc) return [];
  return JSON.parse(await unseal(data.pages_enc));
}

// ---------- Pages & forms ----------
export async function subscribePage(pageId: string, token: string) {
  await graph(`/${pageId}/subscribed_apps`, token, { method: "POST", params: { subscribed_fields: "leadgen" } });
  const j = await graph(`/${pageId}/subscribed_apps`, token);
  return (j.data ?? []).some((a: any) => String(a.id) === META_APP_ID && (a.subscribed_fields ?? ["leadgen"]).includes("leadgen"));
}

export async function checkPage(pageId: string) {
  const db = await admin();
  try {
    const token = await pageToken(pageId);
    const subscribed = await subscribePage(pageId, token);
    await db.from("fbl_pages").update({ status: "connected", status_detail: subscribed ? null : "Page chưa đăng ký nhận sự kiện leadgen cho App", subscribed, checked_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("page_id", pageId);
    return { ok: true, subscribed };
  } catch (e: any) {
    await db.from("fbl_pages").update({ status: "error", status_detail: e.message, subscribed: false, checked_at: new Date().toISOString() }).eq("page_id", pageId);
    return { ok: false, message: e.message as string };
  }
}

export async function refreshForms(pageId: string) {
  const db = await admin();
  const token = await pageToken(pageId);
  const forms: any[] = [];
  let after = "";
  do {
    const j: any = await graph(`/${pageId}/leadgen_forms`, token, { params: { fields: "id,name,status,questions{key,label,type,options}", limit: "100", ...(after ? { after } : {}) } });
    forms.push(...(j.data ?? []));
    after = j.paging?.next ? j.paging?.cursors?.after ?? "" : "";
  } while (after && forms.length < 1000);
  const { data: existing } = await db.from("fbl_forms").select("*").eq("page_id", pageId);
  const { data: page } = await db.from("fbl_pages").select("source").eq("page_id", pageId).single();
  const cat = await catalogs();
  const now = new Date().toISOString();
  let added = 0;
  for (const f of forms) {
    const questions: Question[] = (f.questions ?? []).map((q: any) => ({ key: q.key, label: q.label ?? q.key, type: q.type, options: (q.options ?? []).map((o: any) => ({ key: o.key, value: o.value })) }));
    const old = (existing ?? []).find((x: any) => x.form_id === f.id);
    if (!old) {
      added++;
      await db.from("fbl_forms").insert({ form_id: f.id, page_id: pageId, name: f.name ?? f.id, meta_status: f.status, questions, enabled: false, checked_at: now });
    } else {
      const changed = JSON.stringify(old.questions) !== JSON.stringify(questions);
      const invalid = changed && old.mapping && validateMapping(old.mapping, questions, cat, page?.source ?? null).length > 0;
      await db.from("fbl_forms").update({ name: f.name ?? old.name, meta_status: f.status, questions, checked_at: now, updated_at: now,
        ...(invalid ? { needs_review: true, enabled: false } : {}) }).eq("form_id", f.id);
    }
  }
  const seen = new Set(forms.map((f) => f.id));
  for (const o of existing ?? []) if (!seen.has(o.form_id) && o.meta_status !== "ARCHIVED_OR_GONE") await db.from("fbl_forms").update({ meta_status: "ARCHIVED_OR_GONE", checked_at: now }).eq("form_id", o.form_id);
  return { total: forms.length, added };
}

// ---------- Events ----------
export interface LeadChange { leadgen_id: string; page_id: string; form_id?: string; ad_id?: string; created_time?: number }
export function parseWebhook(body: any): LeadChange[] {
  if (body?.object !== "page") return [];
  const out: LeadChange[] = [];
  for (const e of body.entry ?? []) for (const c of e.changes ?? []) {
    const v = c?.value;
    if (c?.field === "leadgen" && v?.leadgen_id && v?.page_id) out.push({ leadgen_id: String(v.leadgen_id), page_id: String(v.page_id), form_id: v.form_id ? String(v.form_id) : undefined, ad_id: v.ad_id ? String(v.ad_id) : undefined, created_time: Number(v.created_time) || undefined });
  }
  return out;
}

export async function recordEvents(changes: LeadChange[]) {
  const db = await admin();
  const rows = changes.map((c) => ({ leadgen_id: c.leadgen_id, page_id: c.page_id, form_id: c.form_id ?? null, ad_id: c.ad_id ?? null, lead_created_at: c.created_time ? new Date(c.created_time * 1000).toISOString() : null }));
  if (!rows.length) return [];
  const { data, error } = await db.from("fbl_events").upsert(rows, { onConflict: "leadgen_id", ignoreDuplicates: true }).select("id");
  if (error) throw new Error(`db ${error.code}`);
  await db.from("fbl_state").update({ last_event_at: new Date().toISOString() }).eq("id", 1);
  return (data ?? []).map((r: any) => r.id as string);
}

async function finish(id: string, patch: Record<string, unknown>) {
  await (await admin()).from("fbl_events").update({ ...patch, processed_at: new Date().toISOString() }).eq("id", id);
}

/** Xử lý một sự kiện; idempotent: đã có signal_id thì không tạo lại. */
export async function processEvent(id: string): Promise<string> {
  const db = await admin();
  const { data: ev } = await db.from("fbl_events").select("*").eq("id", id).maybeSingle();
  if (!ev) return "missing";
  if (ev.signal_id || ev.status === "success") return "success";
  if (ev.attempts >= 10) return ev.status;
  const { data: claimed } = await db.from("fbl_events").update({ attempts: ev.attempts + 1 }).eq("id", id).eq("attempts", ev.attempts).is("signal_id", null).select("id");
  if (!claimed?.length) return "busy";

  const { data: page } = await db.from("fbl_pages").select("*").eq("page_id", ev.page_id).maybeSingle();
  if (!page || page.status === "disconnected") { await finish(id, { status: "skipped", error: "Page chưa kết nối với Base" }); return "skipped"; }
  const { data: form } = ev.form_id ? await db.from("fbl_forms").select("*").eq("form_id", ev.form_id).maybeSingle() : { data: null };
  if (!form) { await finish(id, { status: "skipped", error: "Form chưa có trong Base (bấm Làm mới danh sách Form)" }); return "skipped"; }
  const when = ev.lead_created_at ?? ev.received_at;
  if (!form.enabled || !form.enabled_at || new Date(when) < new Date(form.enabled_at)) {
    await finish(id, { status: "skipped", error: form.enabled ? "Lead trước thời điểm bật đồng bộ" : "Form đang tắt đồng bộ" }); return "skipped";
  }
  if (!page.source) { await finish(id, { status: "needs_action", error: "Page chưa chọn Nguồn tín hiệu" }); return "needs_action"; }
  if (form.needs_review) { await finish(id, { status: "needs_action", error: "Form thay đổi câu hỏi — cần kiểm tra lại cấu hình" }); return "needs_action"; }

  let lead: any;
  try {
    lead = await graph(`/${ev.leadgen_id}`, await pageToken(ev.page_id), { params: { fields: "created_time,field_data,ad_id,campaign_id,form_id" } });
  } catch (e: any) { await finish(id, { status: "failed", error: e.message }); return "failed"; }

  const cat = await catalogs();
  const r = applyMapping(form.mapping as Mapping ?? {}, lead.field_data ?? [], cat, page.source, lead.created_time ?? when);
  if (!r.ok) { await finish(id, { status: "needs_action", error: r.error }); return "needs_action"; }

  const { data: again } = await db.from("fbl_events").select("signal_id").eq("id", id).single();
  if (again?.signal_id) return "success";
  const { data: sig, error } = await db.from("opportunity_signals").insert({ ...r.draft, created_by: FB_SYSTEM_CREATOR }).select("id").single();
  if (error) { await finish(id, { status: "failed", error: `Không tạo được tín hiệu: ${error.message}` }); return "failed"; }
  await finish(id, { status: "success", error: null, signal_id: sig.id, source: page.source,
    ad_id: lead.ad_id ?? ev.ad_id, campaign_id: lead.campaign_id ?? null, lead_created_at: lead.created_time ? new Date(lead.created_time).toISOString() : ev.lead_created_at });
  try { const z = await import("@/lib/zalo.server"); await z.processPending(20); } catch { /* cron sẽ gửi lại */ }
  try { const p = await import("@/lib/push.server"); await p.processPush(30); } catch { /* bỏ qua */ }
  return "success";
}
