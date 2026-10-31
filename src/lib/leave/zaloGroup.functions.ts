import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSettings(ctx: { supabase: any }) {
  const { data, error } = await ctx.supabase.rpc("leave_zalo_group_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền Quản lý cài đặt đơn từ");
}

export const leaveGroupStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSettings(context);
    const { getConfig } = await import("@/lib/zalo.server");
    const s = await import("./zaloGroup.server");
    const c: any = await getConfig();
    const cfg = await s.leaveGroupConfig();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await (supabaseAdmin as any).from("leave_zalo_group_events")
      .select("id", { count: "exact", head: true }).in("status", ["failed", "unknown"]);
    return {
      oaConnected: c?.status === "connected", oaName: c?.oa_name ?? null,
      groupId: cfg?.group_id ?? "", groupName: cfg?.group_name ?? "", enabled: !!cfg?.enabled,
      onNew: cfg?.on_new !== false, onReassign: cfg?.on_reassign !== false,
      onApproved: cfg?.on_approved !== false, onRejected: cfg?.on_rejected !== false,
      failed: count ?? 0,
    };
  });

export const leaveGroupListGroups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSettings(context);
    const s = await import("@/lib/finance/gmf.server");
    return s.listGroups();
  });

export const leaveGroupSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    groupId: z.string().trim().max(100), groupName: z.string().trim().max(200), enabled: z.boolean(),
    onNew: z.boolean(), onReassign: z.boolean(), onApproved: z.boolean(), onRejected: z.boolean(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await (context.supabase as any).rpc("leave_zalo_group_save", {
      _group_id: data.groupId, _group_name: data.groupName, _enabled: data.enabled,
      _on_new: data.onNew, _on_reassign: data.onReassign, _on_approved: data.onApproved, _on_rejected: data.onRejected,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Đã lưu cài đặt thông báo nhóm Nhân sự" };
  });

export const leaveGroupSendTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSettings(context);
    const s = await import("./zaloGroup.server");
    return s.sendLeaveGroupTest();
  });

export const leaveGroupHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSettings(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await (supabaseAdmin as any).from("leave_zalo_group_events")
      .select("id, request_id, event, status, error, attempts, summary, created_at, sent_at")
      .order("created_at", { ascending: false }).limit(50);
    return { events: data ?? [] };
  });

export const leaveGroupRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertSettings(context);
    const s = await import("./zaloGroup.server");
    return s.retryLeaveGroupEvent(data.id);
  });

/** Đánh thức bộ gửi nhóm Nhân sự sau thao tác đơn thành công — lỗi không ảnh hưởng thao tác chính. */
export const leaveGroupDispatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const s = await import("./zaloGroup.server");
      return await s.processLeaveGroup(10);
    } catch {
      return { processed: 0 };
    }
  });
