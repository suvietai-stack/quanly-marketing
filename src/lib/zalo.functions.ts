import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const [{ data: p }, { data: roles }] = await Promise.all([
    ctx.supabase.from("profiles").select("is_system_admin").eq("id", ctx.userId).maybeSingle(),
    ctx.supabase.from("user_roles").select("role_id").eq("user_id", ctx.userId),
  ]);
  const ok = p?.is_system_admin || (roles ?? []).some((r: any) => r.role_id === "role-super-admin" || r.role_id === "role-admin");
  if (!ok) throw new Error("Chỉ Admin được cấu hình Zalo OA");
}

export const zaloAdminStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    const env = s.zaloEnv();
    const cfg = await s.getConfig();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await (supabaseAdmin as any).from("zalo_links").select("user_id", { count: "exact", head: true }).eq("status", "active");
    const { data: stats } = await (supabaseAdmin as any).from("notifications").select("zalo_status").gt("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
    const agg: Record<string, number> = {};
    for (const r of stats ?? []) agg[r.zalo_status] = (agg[r.zalo_status] ?? 0) + 1;
    return {
      secretsReady: !!(env.appId && env.appSecret && env.oaSecret),
      callbackUrl: s.CALLBACK_URL,
      webhookUrl: `${s.SITE_URL}/api/public/zalo/webhook`,
      oaName: cfg?.oa_name ?? null,
      status: cfg?.status ?? "disconnected",
      autoSend: !!cfg?.auto_send,
      lastError: cfg?.last_error ?? null,
      linkedCount: count ?? 0,
      stats7d: agg,
    };
  });

export const zaloConnectUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    return { url: await s.buildConnectUrl() };
  });

export const zaloCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    return s.checkConnection();
  });

export const zaloSendTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    const { data: link } = await context.supabase.from("zalo_links").select("zalo_user_id,status").eq("user_id", context.userId).maybeSingle();
    if (!link) return { ok: false, message: "Tài khoản của bạn chưa liên kết Zalo — liên kết trước để nhận tin thử" };
    const r = await s.sendCs(link.zalo_user_id, "Đây là tin thử từ Base Marketing.", `${s.SITE_URL}/signals`);
    return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi — kiểm tra điện thoại của bạn" } : { ok: false, message: `Không gửi được (${r.code}: ${r.message})` };
  });

export const zaloDisconnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    await s.saveConfig({ access_token: null, refresh_token: null, token_expires_at: null, status: "disconnected", auto_send: false });
    return { ok: true };
  });

export const zaloSetAuto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ on: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    await s.saveConfig({ auto_send: data.on });
    return { ok: true };
  });

export const zaloRetryFailed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = await import("./zalo.server");
    return s.processPending(50);
  });

export const zaloMyLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("zalo_links").select("status,linked_at,last_interaction_at").eq("user_id", context.userId).maybeSingle();
    return data ?? null;
  });

export const zaloCreateLinkCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const code = "BASE-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    await db.from("zalo_link_codes").delete().eq("user_id", context.userId);
    const expires = new Date(Date.now() + 15 * 60000).toISOString();
    const { error } = await db.from("zalo_link_codes").insert({ code, user_id: context.userId, expires_at: expires });
    if (error) throw new Error("Không tạo được mã liên kết");
    return { code, expiresAt: expires };
  });

export const zaloUnlink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("zalo_links").delete().eq("user_id", context.userId);
    return { ok: true };
  });

/** Gọi sau khi tạo/giao tín hiệu. Không ảnh hưởng thao tác chính nếu lỗi. */
export const zaloDispatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const s = await import("./zalo.server");
      return await s.processPending(20);
    } catch {
      return { processed: 0 };
    }
  });
