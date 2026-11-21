import { applyMapping, validateMapping } from "./mapping-qtQs_k5t.mjs";
import { o as objectType, a as arrayType, s as stringType, r as recordType, u as unionType } from "../_libs/zod.mjs";
const WF_SYSTEM_CREATOR = "00000000-0000-0000-0000-00000000eb01";
const MAX_BODY_BYTES = 256 * 1024;
const RATE_LIMIT_PER_MIN = 60;
const TIMESTAMP_WINDOW_MS = 5 * 6e4;
async function admin() {
  const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
  return supabaseAdmin;
}
const enc = new TextEncoder();
const hex = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
const b64 = (u) => btoa(String.fromCharCode(...u));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function sha256(text) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text))));
}
async function aesKey() {
  const s = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!s) throw new Error("Thiếu khóa mã hóa phía máy chủ");
  const h = await crypto.subtle.digest("SHA-256", enc.encode("wf-key:" + s));
  return crypto.subtle.importKey("raw", h, "AES-GCM", false, ["encrypt", "decrypt"]);
}
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
function generateKey() {
  const secret = b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return { key: `wf_${secret.slice(0, 8)}_${secret}`, prefix: secret.slice(0, 8) };
}
async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg))));
}
function timingSafeEq(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function catalogs() {
  const { data } = await (await admin()).from("catalogs").select("scope,items").in("scope", ["signal_sources", "signal_products", "signal_need_groups"]);
  const get = (s) => ((data ?? []).find((r) => r.scope === s)?.items ?? []).map((x) => typeof x === "string" ? { name: x, active: true } : x).filter((x) => x?.name && x.active !== false).map((x) => String(x.name));
  return { sources: get("signal_sources"), products: get("signal_products"), need_groups: get("signal_need_groups") };
}
async function authenticate(request, rawBody) {
  const websiteId = request.headers.get("x-wf-website") ?? "";
  const ts = request.headers.get("x-wf-timestamp") ?? "";
  const sig = (request.headers.get("x-wf-signature") ?? "").toLowerCase();
  if (!/^[0-9a-f-]{36}$/i.test(websiteId) || !/^\d{10,16}$/.test(ts) || !/^[0-9a-f]{64}$/.test(sig))
    return { ok: false, status: 401, code: "unauthorized", message: "Thiếu hoặc sai định dạng thông tin xác thực" };
  const drift = Math.abs(Date.now() - Number(ts));
  if (drift > TIMESTAMP_WINDOW_MS)
    return { ok: false, status: 401, code: "stale_timestamp", message: "Timestamp quá hạn (lệch quá 5 phút)" };
  const db = await admin();
  const { data: website } = await db.from("wf_websites").select("id,name,domain,source,status").eq("id", websiteId).maybeSingle();
  if (!website || website.status !== "active")
    return { ok: false, status: 401, code: "website_inactive", message: "Website không tồn tại hoặc đã bị thu hồi" };
  const { data: keyRow } = await db.from("wf_keys").select("key_enc,revoked_at").eq("website_id", websiteId).maybeSingle();
  if (!keyRow || keyRow.revoked_at)
    return { ok: false, status: 401, code: "key_revoked", message: "Khóa kết nối đã bị thu hồi" };
  let secret = "";
  try {
    secret = await unseal(keyRow.key_enc);
  } catch {
    return { ok: false, status: 500, code: "server_error", message: "Lỗi khóa phía máy chủ" };
  }
  const expected = await hmacHex(secret, `${ts}.${rawBody}`);
  if (!timingSafeEq(expected, sig))
    return { ok: false, status: 401, code: "bad_signature", message: "Chữ ký không hợp lệ" };
  const { data: hits } = await db.rpc("wf_rate_hit", { p_website: websiteId });
  if (Number(hits) > RATE_LIMIT_PER_MIN)
    return { ok: false, status: 429, code: "rate_limited", message: "Quá tần suất cho phép (60 request/phút)" };
  await db.from("wf_websites").update({ last_seen_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", websiteId);
  return { ok: true, auth: { website } };
}
const fieldSchema = objectType({
  key: stringType().min(1).max(100).regex(/^[\w.-]+$/),
  label: stringType().max(200).default(""),
  type: stringType().max(30).optional(),
  options: arrayType(objectType({ key: stringType().max(200).optional(), value: stringType().max(500) })).max(200).optional()
});
const registerSchema = objectType({
  forms: arrayType(objectType({
    form_id: stringType().min(1).max(100),
    variant: stringType().max(100).default(""),
    name: stringType().min(1).max(200),
    fields: arrayType(fieldSchema).max(100)
  })).min(1).max(50)
});
async function registerForms(websiteId, input) {
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data: existing } = await db.from("wf_forms").select("*").eq("website_id", websiteId);
  const { data: website } = await db.from("wf_websites").select("source").eq("id", websiteId).single();
  const cat = await catalogs();
  let added = 0, updated = 0;
  for (const f of input.forms) {
    const variant = f.variant ?? "";
    const fields = f.fields.map((x) => ({ key: x.key, label: x.label || x.key, type: x.type, options: x.options }));
    const hash = await sha256(JSON.stringify(fields));
    const old = (existing ?? []).find((x) => x.form_id === f.form_id && x.variant === variant);
    if (!old) {
      added++;
      await db.from("wf_forms").insert({ website_id: websiteId, form_id: f.form_id, variant, name: f.name, schema: fields, schema_hash: hash, enabled: false, checked_at: now });
    } else if (old.schema_hash !== hash) {
      updated++;
      const invalid = old.mapping && validateMapping(old.mapping, fields, cat, website?.source ?? null).length > 0;
      await db.from("wf_forms").update({
        name: f.name,
        schema: fields,
        schema_hash: hash,
        checked_at: now,
        updated_at: now,
        ...invalid ? { needs_review: true, enabled: false } : {}
      }).eq("website_id", websiteId).eq("form_id", f.form_id).eq("variant", variant);
    } else {
      await db.from("wf_forms").update({ name: f.name, checked_at: now }).eq("website_id", websiteId).eq("form_id", f.form_id).eq("variant", variant);
    }
  }
  return { added, updated, total: input.forms.length };
}
const submitSchema = objectType({
  form_id: stringType().min(1).max(100),
  variant: stringType().max(100).default(""),
  submission_id: stringType().min(1).max(120),
  sent_at: stringType().max(40).optional(),
  page_url: stringType().max(500).optional(),
  data: recordType(stringType().max(100), unionType([stringType().max(5e3), arrayType(stringType().max(500)).max(50)])).refine((o) => Object.keys(o).length <= 100, "Quá nhiều trường")
});
async function finish(id, lease, patch) {
  const { error } = await (await admin()).rpc("wf_finish_event", { p_id: id, p_lease: lease, p_patch: patch });
  if (error) throw new Error(`Không lưu được kết quả xử lý (${error.code})`);
}
async function findForm(db, websiteId, formId, variant) {
  const { data } = await db.from("wf_forms").select("*").eq("website_id", websiteId).eq("form_id", formId);
  const rows = (data ?? []).filter((r) => r.variant === variant || r.variant === "");
  return rows.find((r) => r.variant === variant) ?? rows.find((r) => r.variant === "") ?? null;
}
async function processEvent(id) {
  const db = await admin();
  const { data: ev, error: claimError } = await db.rpc("wf_claim_event", { p_id: id });
  if (claimError) throw new Error(`Không nhận được công việc (${claimError})`);
  if (!ev) return "busy";
  const lease = ev.lease_token;
  try {
    const { data: website } = await db.from("wf_websites").select("*").eq("id", ev.website_id).maybeSingle();
    if (!website || website.status !== "active") {
      await finish(id, lease, { status: "skipped", error: "Website chưa kết nối hoặc đã bị thu hồi" });
      return "skipped";
    }
    const form = await findForm(db, ev.website_id, ev.form_id, ev.variant ?? "");
    if (!form) {
      await finish(id, lease, { status: "skipped", error: "Form chưa đăng ký với Base" });
      return "skipped";
    }
    if (!form.enabled) {
      await finish(id, lease, { status: "skipped", error: "Form đang tắt đồng bộ" });
      return "skipped";
    }
    if (!website.source || form.needs_review) {
      await finish(id, lease, { status: "needs_action", error: !website.source ? "Website chưa chọn Nguồn tín hiệu" : "Form thay đổi cấu trúc — cần kiểm tra lại cấu hình" });
      return "needs_action";
    }
    if (ev.payload == null) {
      await finish(id, lease, { status: "skipped", error: "Form đang tắt khi nhận — Base không lưu dữ liệu submission nên không thể xử lý lại" });
      return "skipped";
    }
    const r = applyMapping(form.mapping ?? {}, ev.payload ?? {}, form.schema ?? [], await catalogs(), website.source, ev.sent_at ?? ev.received_at);
    if (!r.ok) {
      await finish(id, lease, { status: "needs_action", error: r.error });
      return "needs_action";
    }
    const { data: result, error } = await db.rpc("wf_complete_event", { p_id: id, p_lease: lease, p_draft: r.draft });
    if (error) throw new Error(`Không tạo được tín hiệu (${error.code})`);
    return result;
  } catch (e) {
    await finish(id, lease, { status: "failed", error: "Xử lý bị gián đoạn — hệ thống sẽ thử lại" });
    return "failed";
  }
}
async function intakeSubmission(websiteId, input) {
  const db = await admin();
  const form = await findForm(db, websiteId, input.form_id, input.variant ?? "");
  const keepPayload = !!form?.enabled;
  const row = {
    website_id: websiteId,
    form_id: input.form_id,
    variant: input.variant ?? "",
    submission_id: input.submission_id,
    payload: keepPayload ? input.data : null,
    page_url: input.page_url ?? null,
    sent_at: input.sent_at && !Number.isNaN(new Date(input.sent_at).getTime()) ? new Date(input.sent_at).toISOString() : null,
    ...keepPayload ? {} : { status: "skipped", error: !form ? "Form chưa đăng ký với Base" : "Form đang tắt đồng bộ", processed_at: (/* @__PURE__ */ new Date()).toISOString() }
  };
  const { data: ins, error } = await db.from("wf_events").upsert(row, { onConflict: "website_id,submission_id", ignoreDuplicates: true }).select("id");
  if (error) throw new Error(`db ${error.code}`);
  const eventId = ins?.[0]?.id;
  if (!eventId) {
    const { data: existing } = await db.from("wf_events").select("id,status,signal_id,payload,lease_until").eq("website_id", websiteId).eq("submission_id", input.submission_id).maybeSingle();
    if (existing && !existing.signal_id && existing.payload != null && ["pending", "failed"].includes(existing.status)) {
      const st2 = await processEvent(existing.id);
      if (st2 === "success") {
        const { data: ev } = await db.from("wf_events").select("signal_id").eq("id", existing.id).single();
        return { code: "accepted", eventId: existing.id, signalId: ev?.signal_id ?? void 0 };
      }
      if (st2 === "needs_action") return { code: "mapping_invalid", eventId: existing.id };
      if (st2 === "failed") return { code: "retry_later", eventId: existing.id };
    }
    return { code: "duplicate", eventId: existing?.id, signalId: existing?.signal_id ?? void 0 };
  }
  if (!keepPayload) return { code: "form_disabled", eventId };
  const st = await processEvent(eventId);
  if (st === "success") {
    const { data: ev } = await db.from("wf_events").select("signal_id").eq("id", eventId).single();
    return { code: "accepted", eventId, signalId: ev?.signal_id ?? void 0 };
  }
  if (st === "needs_action") return { code: "mapping_invalid", eventId };
  if (st === "skipped") return { code: "form_disabled", eventId };
  return { code: "retry_later", eventId };
}
const MAX_ATTEMPTS = 10;
const STALE_PENDING_MS = 6e4;
function liveState(r, now = Date.now()) {
  if (r.signal_id || r.status === "success") return "success";
  const leased = r.lease_until && new Date(r.lease_until).getTime() > now;
  if (leased) return "processing";
  if (r.status === "pending") return now - new Date(r.received_at).getTime() > STALE_PENDING_MS || r.lease_until ? "stuck" : "processing";
  if (r.status === "failed") return (r.attempts ?? 0) >= MAX_ATTEMPTS ? "needs_action" : "retry_wait";
  return r.status;
}
async function recoverEvents(limit = 20) {
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const staleBefore = new Date(Date.now() - STALE_PENDING_MS).toISOString();
  await db.from("wf_events").update({ status: "needs_action", error: `Đã thử ${MAX_ATTEMPTS} lần không thành công — cần kiểm tra`, processed_at: now, next_retry_at: null }).is("signal_id", null).in("status", ["pending", "failed"]).gte("attempts", MAX_ATTEMPTS).or(`lease_until.is.null,lease_until.lte.${now}`);
  const { data: stuck } = await db.from("wf_events").select("id").is("signal_id", null).eq("status", "pending").not("payload", "is", null).lt("received_at", staleBefore).or(`lease_until.is.null,lease_until.lte.${now}`).order("received_at").limit(limit);
  const { data: due } = await db.from("wf_events").select("id").is("signal_id", null).eq("status", "failed").not("payload", "is", null).lte("next_retry_at", now).or(`lease_until.is.null,lease_until.lte.${now}`).order("next_retry_at").limit(limit);
  const results = {};
  for (const r of [...stuck ?? [], ...due ?? []]) {
    try {
      results[r.id] = await processEvent(r.id);
    } catch {
      results[r.id] = "error";
    }
  }
  return { checked: Object.keys(results).length, results };
}
async function retryEvent(id) {
  const db = await admin();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data: ev } = await db.from("wf_events").select("signal_id,lease_until,payload").eq("id", id).maybeSingle();
  if (!ev) throw new Error("Không tìm thấy submission");
  if (ev.signal_id) return "success";
  if (ev.lease_until && ev.lease_until > now) return "busy";
  if (ev.payload == null) throw new Error("Submission này không lưu dữ liệu (Form tắt khi nhận) nên không thể thử lại");
  const { error } = await db.from("wf_events").update({ attempts: 0, status: "pending", next_retry_at: null, error: null }).eq("id", id).is("signal_id", null).or(`lease_until.is.null,lease_until.lte.${now}`);
  if (error) throw new Error("Không đưa được submission vào hàng đợi thử lại");
  return processEvent(id);
}
export {
  MAX_ATTEMPTS,
  MAX_BODY_BYTES,
  RATE_LIMIT_PER_MIN,
  STALE_PENDING_MS,
  TIMESTAMP_WINDOW_MS,
  WF_SYSTEM_CREATOR,
  authenticate,
  catalogs,
  generateKey,
  hmacHex,
  intakeSubmission,
  liveState,
  processEvent,
  recoverEvents,
  registerForms,
  registerSchema,
  retryEvent,
  seal,
  sha256,
  submitSchema,
  timingSafeEq,
  unseal
};
