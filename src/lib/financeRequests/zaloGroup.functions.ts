import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { FrKind } from "./logic";

const kindSchema = z.enum(["advance", "payment", "salary_advance"]);

async function assertSettings(ctx: { supabase: any }, kind: FrKind) {
  const { data, error } = await ctx.supabase.rpc("fr_zalo_can_manage", { _kind: kind });
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền cài đặt thông báo của chức năng này");
}

export const frGroupStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: kindSchema }).parse(d))
  .handler(async ({ context, data }) => {
    await assertSettings(context, data.kind);
    const { getConfig } = await import("@/lib/zalo.server");
    const s = await import("./zaloGroup.server");
    const c: any = await getConfig();
    const cfg = await s.frGroupConfig(data.kind);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await (supabaseAdmin as any).from("fr_zalo_group_events")
      .select("id", { count: "exact", head: true }).eq("kind", data.kind).in("status", ["failed", "unknown"]);
    return {
      oaConnected: c?.status === "connected", oaName: c?.oa_name ?? null,
      groupId: cfg?.group_id ?? "", groupName: cfg?.group_name ?? "", enabled: !!cfg?.enabled,
      intro: cfg?.intro ?? "",
      toggles: {
        submitted: cfg?.on_submitted !== false, info: cfg?.on_info !== false,
        approved: cfg?.on_approved !== false, rejected: cfg?.on_rejected !== false,
        paid: cfg?.on_paid !== false, settled: cfg?.on_settled !== false,
        deducted: cfg?.on_deducted !== false, done: cfg?.on_done !== false,
      },
      failed: count ?? 0,
    };
  });

export const frGroupListGroups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: kindSchema }).parse(d))
  .handler(async ({ context, data }) => {
    await assertSettings(context, data.kind);
    const s = await import("@/lib/finance/gmf.server");
    return s.listGroups();
  });

export const frGroupSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    kind: kindSchema,
    groupId: z.string().trim().max(100), groupName: z.string().trim().max(200), enabled: z.boolean(),
    intro: z.string().trim().max(300),
    toggles: z.record(z.string(), z.boolean()),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await (context.supabase as any).rpc("fr_zalo_group_save", {
      _kind: data.kind, _group_id: data.groupId, _group_name: data.groupName,
      _enabled: data.enabled, _toggles: data.toggles, _intro: data.intro,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Đã lưu cài đặt thông báo Zalo" };
  });

export const frGroupSendTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: kindSchema }).parse(d))
  .handler(async ({ context, data }) => {
    await assertSettings(context, data.kind);
    const s = await import("./zaloGroup.server");
    return s.sendFrGroupTest(data.kind);
  });

export const frGroupHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: kindSchema }).parse(d))
  .handler(async ({ context, data }) => {
    await assertSettings(context, data.kind);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await (supabaseAdmin as any).from("fr_zalo_group_events")
      .select("id, request_id, event, status, error, attempts, summary, created_at, sent_at")
      .eq("kind", data.kind)
      .order("created_at", { ascending: false }).limit(50);
    return { events: rows ?? [] };
  });

export const frGroupRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: kindSchema, id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertSettings(context, data.kind);
    const s = await import("./zaloGroup.server");
    return s.retryFrGroupEvent(data.id);
  });

/** Đánh thức bộ gửi nhóm tài chính sau thao tác đề nghị thành công — lỗi không ảnh hưởng thao tác chính. */
export const frGroupDispatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const s = await import("./zaloGroup.server");
      return await s.processFrGroup(10);
    } catch {
      return { processed: 0 };
    }
  });
