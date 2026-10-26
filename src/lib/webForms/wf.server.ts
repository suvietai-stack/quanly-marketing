import { z } from "zod";
import { applyMapping, validateMapping, type Catalogs, type FormField, type Mapping, type SubmissionData } from "./mapping";

/** Người tạo cho tín hiệu từ tích hợp Website — không phải tài khoản nhân viên. */
export const WF_SYSTEM_CREATOR = "00000000-0000-0000-0000-00000000eb01";
export const MAX_BODY_BYTES = 256 * 1024;
export const RATE_LIMIT_PER_MIN = 60;
export const TIMESTAMP_WINDOW_MS = 5 * 60_000;

async function admin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

// ---------- crypto (Web Crypto, workerd-safe) ----------
const enc = new TextEncoder();
const hex = (u: Uint8Array) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function sha256(text: string) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text))));
}

/** Khóa mã hóa website: dẫn xuất từ service role key, giống cách FBL dùng META_APP_SECRET. */
async function aesKey() {
  const s = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!s) throw new Error("Thiếu khóa mã hóa phía máy chủ");
  const h = await crypto.subtle.digest("SHA-256", enc.encode("wf-key:" + s));
  return crypto.subtle.importKey("raw", h, "AES-GCM", false, ["encrypt", "decrypt"]);
}
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

/** Sinh khóa mới: `wf_<prefix>_<secret>`; prefix 8 ký tự để nhận diện, secret 32 bytes ngẫu nhiên. */
export function generateKey() {
  const secret = b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return { key: `wf_${secret.slice(0, 8)}_${secret}`, prefix: secret.slice(0, 8) };
}

export async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg))));
}
export function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------- danh mục dùng chung ----------
export async function catalogs(): Promise<Catalogs & { sources: string[] }> {
  const { data } = await (await admin()).from("catalogs").select("scope,items").in("scope", ["signal_sources", "signal_products", "signal_need_groups"]);
  const get = (s: string) => ((data ?? []).find((r: any) => r.scope === s)?.items ?? [])
    .map((x: any) => (typeof x === "string" ? { name: x, active: true } : x)).filter((x: any) => x?.name && x.active !== false).map((x: any) => String(x.name));
  return { sources: get("signal_sources"), products: get("signal_products"), need_groups: get("signal_need_groups") };
}

// ---------- xác thực request từ plugin WordPress ----------
export interface WfAuth { website: { id: string; name: string; domain: string; source: string | null; status: string } }
export type WfAuthResult = { ok: true; auth: WfAuth } | { ok: false; status: number; code: string; message: string };

export async function authenticate(request: Request, rawBody: string): Promise<WfAuthResult> {
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
  try { secret = await unseal(keyRow.key_enc); } catch { return { ok: false, status: 500, code: "server_error", message: "Lỗi khóa phía máy chủ" }; }
  const expected = await hmacHex(secret, `${ts}.${rawBody}`);
  if (!timingSafeEq(expected, sig))
    return { ok: false, status: 401, code: "bad_signature", message: "Chữ ký không hợp lệ" };
  const { data: hits } = await db.rpc("wf_rate_hit", { p_website: websiteId });
  if (Number(hits) > RATE_LIMIT_PER_MIN)
    return { ok: false, status: 429, code: "rate_limited", message: "Quá tần suất cho phép (60 request/phút)" };
  await db.from("wf_websites").update({ last_seen_at: new Date().toISOString() }).eq("id", websiteId);
  return { ok: true, auth: { website } };
}

// ---------- đăng ký / cập nhật cấu trúc Form ----------
const fieldSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[\w.-]+$/),
  label: z.string().max(200).default(""),
  type: z.string().max(30).optional(),
  options: z.array(z.object({ key: z.string().max(200).optional(), value: z.string().max(500) })).max(200).optional(),
});
export const registerSchema = z.object({
  forms: z.array(z.object({
    form_id: z.string().min(1).max(100),
    variant: z.string().max(100).default(""),
    name: z.string().min(1).max(200),
    fields: z.array(fieldSchema).max(100),
  })).min(1).max(50),
});

export async function registerForms(websiteId: string, input: z.infer<typeof registerSchema>) {
  const db = await admin();
  const now = new Date().toISOString();
  const { data: existing } = await db.from("wf_forms").select("*").eq("website_id", websiteId);
  const { data: website } = await db.from("wf_websites").select("source").eq("id", websiteId).single();
  const cat = await catalogs();
  let added = 0, updated = 0;
  for (const f of input.forms) {
    const variant = f.variant ?? "";
    const fields: FormField[] = f.fields.map((x) => ({ key: x.key, label: x.label || x.key, type: x.type, options: x.options }));
    const hash = await sha256(JSON.stringify(fields));
    const old = (existing ?? []).find((x: any) => x.form_id === f.form_id && x.variant === variant);
    if (!old) {
      added++;
      await db.from("wf_forms").insert({ website_id: websiteId, form_id: f.form_id, variant, name: f.name, schema: fields, schema_hash: hash, enabled: false, checked_at: now });
    } else if (old.schema_hash !== hash) {
      updated++;
      const invalid = old.mapping && validateMapping(old.mapping as Mapping, fields, cat, website?.source ?? null).length > 0;
      await db.from("wf_forms").update({ name: f.name, schema: fields, schema_hash: hash, checked_at: now, updated_at: now,
        ...(invalid ? { needs_review: true, enabled: false } : {}) })
        .eq("website_id", websiteId).eq("form_id", f.form_id).eq("variant", variant);
    } else {
      await db.from("wf_forms").update({ name: f.name, checked_at: now }).eq("website_id", websiteId).eq("form_id", f.form_id).eq("variant", variant);
    }
  }
  return { added, updated, total: input.forms.length };
}

// ---------- nhận & xử lý submission ----------
export const submitSchema = z.object({
  form_id: z.string().min(1).max(100),
  variant: z.string().max(100).default(""),
  submission_id: z.string().min(1).max(120),
  sent_at: z.string().max(40).optional(),
  page_url: z.string().max(500).optional(),
  data: z.record(z.string().max(100), z.union([z.string().max(5000), z.array(z.string().max(500)).max(50)])).refine((o) => Object.keys(o).length <= 100, "Quá nhiều trường"),
});

export type SubmitCode = "accepted" | "duplicate" | "form_disabled" | "mapping_invalid" | "retry_later";

async function finish(id: string, lease: string, patch: Record<string, unknown>) {
  const { error } = await (await admin()).rpc("wf_finish_event", { p_id: id, p_lease: lease, p_patch: patch });
  if (error) throw new Error(`Không lưu được kết quả xử lý (${error.code})`);
}

/** Tìm Form áp dụng: đúng variant, không có thì kế thừa Form chính (variant rỗng). */
async function findForm(db: any, websiteId: string, formId: string, variant: string) {
  // Lọc variant bằng JS: PostgREST không khớp chuỗi rỗng trong danh sách .in().
  const { data } = await db.from("wf_forms").select("*").eq("website_id", websiteId).eq("form_id", formId);
  const rows = ((data ?? []) as any[]).filter((r) => r.variant === variant || r.variant === "");
  return rows.find((r) => r.variant === variant) ?? rows.find((r) => r.variant === "") ?? null;
}

/** Xử lý một event đã lưu: áp mapping → tạo tín hiệu (một giao dịch khóa dòng trong wf_complete_event). */
export async function processEvent(id: string): Promise<string> {
  const db = await admin();
  const { data: ev, error: claimError } = await db.rpc("wf_claim_event", { p_id: id });
  if (claimError) throw new Error(`Không nhận được công việc (${claimError})`);
  if (!ev) return "busy";
  const lease = ev.lease_token as string;
  try {
    const { data: website } = await db.from("wf_websites").select("*").eq("id", ev.website_id).maybeSingle();
    if (!website || website.status !== "active") { await finish(id, lease, { status: "skipped", error: "Website chưa kết nối hoặc đã bị thu hồi" }); return "skipped"; }
    const form = await findForm(db, ev.website_id, ev.form_id, ev.variant ?? "");
    if (!form) { await finish(id, lease, { status: "skipped", error: "Form chưa đăng ký với Base" }); return "skipped"; }
    if (!form.enabled) { await finish(id, lease, { status: "skipped", error: "Form đang tắt đồng bộ" }); return "skipped"; }
    if (!website.source || form.needs_review) {
      await finish(id, lease, { status: "needs_action", error: !website.source ? "Website chưa chọn Nguồn tín hiệu" : "Form thay đổi cấu trúc — cần kiểm tra lại cấu hình" });
      return "needs_action";
    }
    if (ev.payload == null) { await finish(id, lease, { status: "skipped", error: "Form đang tắt khi nhận — Base không lưu dữ liệu submission nên không thể xử lý lại" }); return "skipped"; }
    const r = applyMapping(form.mapping as Mapping ?? {}, (ev.payload ?? {}) as SubmissionData, (form.schema ?? []) as FormField[], await catalogs(), website.source, ev.sent_at ?? ev.received_at);
    if (!r.ok) { await finish(id, lease, { status: "needs_action", error: r.error }); return "needs_action"; }
    const { data: result, error } = await db.rpc("wf_complete_event", { p_id: id, p_lease: lease, p_draft: r.draft });
    if (error) throw new Error(`Không tạo được tín hiệu (${error.code})`);
    return result;
  } catch (e: any) {
    await finish(id, lease, { status: "failed", error: "Xử lý bị gián đoạn — hệ thống sẽ thử lại" });
    return "failed";
  }
}

/** Lưu event bền vững rồi xử lý ngay. Form tắt/chưa đăng ký: chỉ lưu metadata, không lưu dữ liệu cá nhân. */
export async function intakeSubmission(websiteId: string, input: z.infer<typeof submitSchema>): Promise<{ code: SubmitCode; eventId?: string; signalId?: string }> {
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
    ...(keepPayload ? {} : { status: "skipped", error: !form ? "Form chưa đăng ký với Base" : "Form đang tắt đồng bộ", processed_at: new Date().toISOString() }),
  };
  const { data: ins, error } = await db.from("wf_events").upsert(row, { onConflict: "website_id,submission_id", ignoreDuplicates: true }).select("id");
  if (error) throw new Error(`db ${error.code}`);
  const eventId = ins?.[0]?.id as string | undefined;
  if (!eventId) {
    const { data: existing } = await db.from("wf_events").select("id,status,signal_id").eq("website_id", websiteId).eq("submission_id", input.submission_id).maybeSingle();
    return { code: "duplicate", eventId: existing?.id, signalId: existing?.signal_id ?? undefined };
  }
  if (!keepPayload) return { code: "form_disabled", eventId };
  const st = await processEvent(eventId);
  if (st === "success") {
    const { data: ev } = await db.from("wf_events").select("signal_id").eq("id", eventId).single();
    return { code: "accepted", eventId, signalId: ev?.signal_id ?? undefined };
  }
  if (st === "needs_action") return { code: "mapping_invalid", eventId };
  if (st === "skipped") return { code: "form_disabled", eventId };
  return { code: "retry_later", eventId };
}

/** Thử lại thủ công từ Lịch sử. */
export async function retryEvent(id: string): Promise<string> {
  const db = await admin();
  const now = new Date().toISOString();
  const { error } = await db.from("wf_events").update({ attempts: 0, status: "pending", next_retry_at: null, error: null })
    .eq("id", id).is("signal_id", null).or(`lease_until.is.null,lease_until.lte.${now}`);
  if (error) throw new Error("Không đưa được submission vào hàng đợi thử lại");
  return processEvent(id);
}
