import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertManage(ctx: { supabase: any }) {
  const { data, error } = await ctx.supabase.rpc("wf_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền quản lý tích hợp Website Forms");
}
async function admin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
const wid = z.string().uuid();

export const wfOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const s = await import("./wf.server");
    const db = await admin();
    const [websites, forms, counts, cat] = await Promise.all([
      db.from("wf_websites").select("id,name,domain,source,status,last_seen_at,created_at").order("created_at"),
      db.from("wf_forms").select("website_id,form_id,variant,name,schema,mapping,enabled,enabled_at,needs_review,checked_at").order("name"),
      db.from("wf_events").select("status"),
      s.catalogs(),
    ]);
    const stat: Record<string, number> = {};
    for (const r of counts.data ?? []) stat[r.status] = (stat[r.status] ?? 0) + 1;
    const keys = await db.from("wf_keys").select("website_id,key_prefix,created_at,revoked_at");
    const base = await import("@/lib/zalo.server");
    const baseUrl = await base.baseUrl().catch(() => base.DEFAULT_BASE_URL);
    return {
      websites: websites.data ?? [], forms: forms.data ?? [], catalogs: cat, stats: stat,
      keys: (keys.data ?? []) as { website_id: string; key_prefix: string; created_at: string; revoked_at: string | null }[],
      endpoints: { ping: `${baseUrl}/api/public/wf/ping`, register: `${baseUrl}/api/public/wf/register-forms`, submit: `${baseUrl}/api/public/wf/submit` },
    };
  });

export const wfAddWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    name: z.string().trim().min(1).max(200),
    domain: z.string().trim().min(3).max(200).regex(/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i, "Domain không hợp lệ"),
    source: z.string().max(200),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./wf.server");
    const cat = await s.catalogs();
    if (!cat.sources.includes(data.source)) throw new Error("Nguồn không có trong Kho nguồn tín hiệu");
    const db = await admin();
    const { data: w, error } = await db.from("wf_websites").insert({ name: data.name, domain: data.domain.toLowerCase(), source: data.source, created_by: context.userId }).select("id").single();
    if (error) throw new Error(`Không tạo được Website (${error.code})`);
    const k = s.generateKey();
    const { error: ke } = await db.from("wf_keys").insert({ website_id: w.id, key_hash: await s.sha256(k.key), key_prefix: k.prefix, key_enc: await s.seal(k.key) });
    if (ke) throw new Error("Không tạo được khóa kết nối");
    return { websiteId: w.id as string, key: k.key };
  });

export const wfWebsiteAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    websiteId: wid,
    action: z.enum(["rotate_key", "revoke_key", "set_source", "rename"]),
    source: z.string().max(200).nullable().optional(),
    name: z.string().trim().min(1).max(200).optional(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./wf.server");
    const db = await admin();
    const now = new Date().toISOString();
    if (data.action === "rotate_key") {
      const k = s.generateKey();
      const { error } = await db.from("wf_keys").update({ key_hash: await s.sha256(k.key), key_prefix: k.prefix, key_enc: await s.seal(k.key), created_at: now, revoked_at: null }).eq("website_id", data.websiteId);
      if (error) throw new Error("Không đổi được khóa");
      return { ok: true, key: k.key, message: "Đã cấp khóa mới — khóa cũ hết hiệu lực ngay" };
    }
    if (data.action === "revoke_key") {
      await db.from("wf_keys").update({ revoked_at: now }).eq("website_id", data.websiteId);
      await db.from("wf_forms").update({ enabled: false, updated_at: now }).eq("website_id", data.websiteId);
      return { ok: true, message: "Đã thu hồi khóa và tắt đồng bộ mọi Form của Website" };
    }
    if (data.action === "rename") {
      await db.from("wf_websites").update({ name: data.name, updated_at: now }).eq("id", data.websiteId);
      return { ok: true, message: "Đã đổi tên Website" };
    }
    const cat = await s.catalogs();
    if (data.source && !cat.sources.includes(data.source)) return { ok: false, message: "Nguồn không có trong Kho nguồn tín hiệu" };
    await db.from("wf_websites").update({ source: data.source || null, updated_at: now }).eq("id", data.websiteId);
    if (!data.source) await db.from("wf_forms").update({ enabled: false, updated_at: now }).eq("website_id", data.websiteId);
    return { ok: true, message: "Đã lưu nguồn tín hiệu — chỉ áp dụng cho tín hiệu tạo từ bây giờ" };
  });

const rule = z.union([
  z.object({ mode: z.literal("website"), key: z.string().max(100), valueMap: z.record(z.string().max(500), z.string().max(200)).optional() }),
  z.object({ mode: z.literal("default"), value: z.union([z.string().max(3000), z.array(z.string().max(200)).max(50)]) }),
  z.object({ mode: z.literal("compose"), keys: z.array(z.string().max(100)).min(1).max(30) }),
  z.object({ mode: z.literal("empty") }),
]);

export const wfSaveForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    websiteId: wid, formId: z.string().min(1).max(100), variant: z.string().max(100).default(""),
    mapping: z.record(z.string(), rule).optional(), enabled: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./wf.server");
    const { validateMapping } = await import("./mapping");
    const db = await admin();
    const { data: form } = await db.from("wf_forms").select("*").eq("website_id", data.websiteId).eq("form_id", data.formId).eq("variant", data.variant).single();
    const { data: website } = await db.from("wf_websites").select("*").eq("id", data.websiteId).single();
    const mapping = data.mapping ?? form.mapping;
    const errs = validateMapping(mapping, form.schema ?? [], await s.catalogs(), website.source);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.mapping) { patch.mapping = data.mapping; patch.needs_review = false; }
    if (data.enabled === true) {
      if (errs.length) return { ok: false, message: errs.join("; ") };
      if (website.status !== "active") return { ok: false, message: "Website đang bị thu hồi" };
      if (!form.enabled) { patch.enabled = true; patch.enabled_at = new Date().toISOString(); }
    } else if (data.enabled === false || (data.mapping && errs.length)) patch.enabled = false;
    await db.from("wf_forms").update(patch).eq("website_id", data.websiteId).eq("form_id", data.formId).eq("variant", data.variant);
    return { ok: true, message: data.enabled ? "Đã bật đồng bộ — chỉ nhận submission mới từ bây giờ" : data.enabled === false ? "Đã tắt đồng bộ" : errs.length ? `Đã lưu (chưa thể bật: ${errs.join("; ")})` : "Đã lưu cấu hình" };
  });

export const wfEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    websiteId: z.string().max(40).optional(), formId: z.string().max(100).optional(), status: z.string().max(20).optional(),
    from: z.string().max(30).optional(), to: z.string().max(30).optional(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const db = await admin();
    let q = db.from("wf_events").select("id,website_id,form_id,variant,submission_id,page_url,sent_at,received_at,processed_at,status,error,attempts,signal_id,source").order("received_at", { ascending: false }).limit(200);
    if (data.websiteId) q = q.eq("website_id", data.websiteId);
    if (data.formId) q = q.eq("form_id", data.formId);
    if (data.status) q = q.eq("status", data.status);
    if (data.from) q = q.gte("received_at", data.from);
    if (data.to) q = q.lte("received_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const wfRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./wf.server");
    return { status: await s.retryEvent(data.id) };
  });
