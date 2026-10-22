import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertManage(ctx: { supabase: any }) {
  const { data, error } = await ctx.supabase.rpc("fbl_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền quản lý tích hợp Facebook Lead Ads");
}
async function admin(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
const id = z.string().regex(/^\d{1,40}$/);

export const fblOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const s = await import("./fb.server");
    const db = await admin();
    const [pages, forms, state, cat, counts] = await Promise.all([
      db.from("fbl_pages").select("page_id,name,source,status,status_detail,subscribed,checked_at").neq("status", "disconnected").order("name"),
      db.from("fbl_forms").select("form_id,page_id,name,meta_status,questions,mapping,enabled,enabled_at,needs_review,checked_at").order("name"),
      db.from("fbl_state").select("*").eq("id", 1).single(),
      s.catalogs(),
      db.from("fbl_events").select("status"),
    ]);
    const stat: Record<string, number> = {};
    for (const r of counts.data ?? []) stat[r.status] = (stat[r.status] ?? 0) + 1;
    return {
      appId: s.META_APP_ID,
      secrets: { appSecret: !!s.appSecret(), verifyToken: !!s.verifyToken() },
      webhookUrl: `${await s.baseUrl()}/api/public/meta/leads-webhook`,
      redirectUri: await s.redirectUri(),
      state: state.data,
      pages: pages.data ?? [], forms: forms.data ?? [], catalogs: cat, stats: stat,
    };
  });

export const fblConnectUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const s = await import("./fb.server");
    if (!s.appSecret()) throw new Error("Chưa nhập META_APP_SECRET");
    const state = crypto.randomUUID().replace(/-/g, "");
    const db = await admin();
    await db.from("fbl_oauth_sessions").delete().lt("created_at", new Date(Date.now() - 3600_000).toISOString());
    await db.from("fbl_oauth_sessions").insert({ state, user_id: context.userId });
    const u = new URL("https://www.facebook.com/v23.0/dialog/oauth");
    u.searchParams.set("client_id", s.META_APP_ID);
    u.searchParams.set("redirect_uri", await s.redirectUri());
    u.searchParams.set("state", state);
    u.searchParams.set("scope", s.OAUTH_SCOPES.join(","));
    u.searchParams.set("auth_type", "rerequest");
    return { url: u.toString() };
  });

export const fblPendingPages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ state: z.string().max(100) }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./fb.server");
    const pages = await s.sessionPages(data.state, context.userId);
    return pages.map((p) => ({ id: p.id, name: p.name, tasks: p.tasks }));
  });

export const fblConnectPages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ state: z.string().max(100), pageIds: z.array(id).min(1).max(50) }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./fb.server");
    const db = await admin();
    const pages = (await s.sessionPages(data.state, context.userId)).filter((p) => data.pageIds.includes(p.id));
    const results: { id: string; name: string; ok: boolean; message: string }[] = [];
    for (const p of pages) {
      await db.from("fbl_pages").upsert({ page_id: p.id, name: p.name, status: "connected", status_detail: null, connected_by: context.userId, updated_at: new Date().toISOString() }, { onConflict: "page_id" });
      await db.from("fbl_page_tokens").upsert({ page_id: p.id, token_enc: await s.seal(p.token), updated_at: new Date().toISOString() }, { onConflict: "page_id" });
      const chk = await s.checkPage(p.id);
      let msg = chk.ok ? (chk.subscribed ? "Đã đăng ký nhận lead" : "Kết nối được nhưng Page chưa đăng ký nhận lead") : chk.message!;
      if (chk.ok) {
        try { const f = await s.refreshForms(p.id); msg += ` · ${f.total} Form`; }
        catch (e: any) { msg += ` · Không đọc được Form: ${e.message}`; }
      }
      results.push({ id: p.id, name: p.name, ok: chk.ok, message: msg });
    }
    await db.from("fbl_oauth_sessions").delete().eq("state", data.state);
    return results;
  });

export const fblPageAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ pageId: id, action: z.enum(["check", "refresh", "disconnect", "source"]), source: z.string().max(200).nullable().optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./fb.server");
    const db = await admin();
    if (data.action === "check") { const r = await s.checkPage(data.pageId); return { ok: r.ok, message: r.ok ? (r.subscribed ? "Kết nối và đăng ký nhận lead hợp lệ" : "Page chưa đăng ký nhận lead") : r.message! }; }
    if (data.action === "refresh") {
      try { const r = await s.refreshForms(data.pageId); return { ok: true, message: `Đã cập nhật ${r.total} Form (${r.added} Form mới, mặc định Tắt)` }; }
      catch (e: any) { return { ok: false, message: e.message }; }
    }
    if (data.action === "disconnect") {
      try { const t = await s.pageToken(data.pageId); await s.graph(`/${data.pageId}/subscribed_apps`, t, { method: "DELETE" }); } catch { /* vẫn ngắt phía Base */ }
      await db.from("fbl_page_tokens").delete().eq("page_id", data.pageId);
      await db.from("fbl_forms").update({ enabled: false }).eq("page_id", data.pageId);
      await db.from("fbl_pages").update({ status: "disconnected", subscribed: false, updated_at: new Date().toISOString() }).eq("page_id", data.pageId);
      return { ok: true, message: "Đã ngắt kết nối Page; lịch sử được giữ lại" };
    }
    const cat = await s.catalogs();
    if (data.source && !cat.sources.includes(data.source)) return { ok: false, message: "Nguồn không có trong Kho nguồn tín hiệu" };
    await db.from("fbl_pages").update({ source: data.source || null, updated_at: new Date().toISOString() }).eq("page_id", data.pageId);
    if (!data.source) await db.from("fbl_forms").update({ enabled: false }).eq("page_id", data.pageId);
    return { ok: true, message: "Đã lưu nguồn tín hiệu" };
  });

const rule = z.union([
  z.object({ mode: z.literal("facebook"), key: z.string().max(200), valueMap: z.record(z.string().max(200), z.string().max(200)).optional() }),
  z.object({ mode: z.literal("default"), value: z.union([z.string().max(3000), z.array(z.string().max(200)).max(50)]) }),
  z.object({ mode: z.literal("empty") }),
]);

export const fblSaveForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ formId: id, mapping: z.record(z.string(), rule).optional(), enabled: z.boolean().optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const s = await import("./fb.server");
    const { validateMapping } = await import("./mapping");
    const db = await admin();
    const { data: form } = await db.from("fbl_forms").select("*").eq("form_id", data.formId).single();
    const { data: page } = await db.from("fbl_pages").select("*").eq("page_id", form.page_id).single();
    const mapping = data.mapping ?? form.mapping;
    const errs = validateMapping(mapping, form.questions ?? [], await s.catalogs(), page.source);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.mapping) { patch.mapping = data.mapping; patch.needs_review = false; }
    if (data.enabled === true) {
      if (errs.length) return { ok: false, message: errs.join("; ") };
      if (page.status !== "connected") return { ok: false, message: "Page đang mất kết nối" };
      if (!form.enabled) { patch.enabled = true; patch.enabled_at = new Date().toISOString(); }
    } else if (data.enabled === false || (data.mapping && errs.length)) patch.enabled = false;
    await db.from("fbl_forms").update(patch).eq("form_id", data.formId);
    return { ok: true, message: data.enabled ? "Đã bật đồng bộ — chỉ nhận lead mới từ bây giờ" : data.enabled === false ? "Đã tắt đồng bộ" : errs.length ? `Đã lưu (chưa thể bật: ${errs.join("; ")})` : "Đã lưu cấu hình" };
  });

export const fblEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ pageId: z.string().max(40).optional(), formId: z.string().max(40).optional(), status: z.string().max(20).optional(), from: z.string().max(30).optional(), to: z.string().max(30).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const db = await admin();
    let q = db.from("fbl_events").select("id,leadgen_id,page_id,form_id,received_at,lead_created_at,status,error,attempts,signal_id,source").order("received_at", { ascending: false }).limit(200);
    if (data.pageId) q = q.eq("page_id", data.pageId);
    if (data.formId) q = q.eq("form_id", data.formId);
    if (data.status) q = q.eq("status", data.status);
    if (data.from) q = q.gte("received_at", data.from);
    if (data.to) q = q.lte("received_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const fblRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    const db = await admin();
    await db.from("fbl_events").update({ attempts: 0, status: "pending" }).eq("id", data.id).is("signal_id", null);
    const s = await import("./fb.server");
    const st = await s.processEvent(data.id);
    return { status: st };
  });

export const fblBackfill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ formId: id, from: z.string().datetime(), to: z.string().datetime(), apply: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    if (new Date(data.from) > new Date(data.to)) throw new Error("Khoảng thời gian không hợp lệ");
    if (new Date(data.to).getTime() - new Date(data.from).getTime() > 90 * 86400_000) throw new Error("Tối đa 90 ngày mỗi lần đồng bộ bù");
    const s = await import("./fb.server");
    try { return await s.backfill(data.formId, data.from, data.to, data.apply); } catch (e: any) { throw new Error(s.explainMeta(e)); }
  });

export const fblMaintainNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    return (await import("./fb.server")).maintain();
  });
