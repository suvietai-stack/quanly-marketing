import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertManage(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("fin_gmf_can_manage");
  if (error) throw new Error(`Không kiểm tra được quyền: ${error.message}`);
  if (!data) throw new Error("Bạn không có quyền cấu hình thông báo Tiền Về");
}

export const gmfStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const { getConfig } = await import("@/lib/zalo.server");
    const c: any = await getConfig();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await (supabaseAdmin as any).from("bank_transactions").select("id", { count: "exact", head: true }).in("gmf_status", ["failed", "unknown"]);
    return { oaConnected: c?.status === "connected", oaName: c?.oa_name ?? null, groupId: c?.gmf_group_id ?? "", groupName: c?.gmf_group_name ?? "", enabled: !!c?.gmf_enabled, failed: count ?? 0 };
  });

export const gmfListGroups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const s = await import("./gmf.server");
    return s.listGroups();
  });

export const gmfSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ groupId: z.string().trim().max(100), groupName: z.string().trim().max(200), enabled: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertManage(context);
    if (data.enabled && !data.groupId) return { ok: false, message: "Chọn nhóm GMF trước khi bật" };
    const { saveConfig } = await import("@/lib/zalo.server");
    await saveConfig({ gmf_group_id: data.groupId || null, gmf_group_name: data.groupName || null, gmf_enabled: data.enabled });
    return { ok: true, message: "Đã lưu cài đặt Zalo GMF" };
  });

export const gmfSendTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const { getConfig, brandHeader } = await import("@/lib/zalo.server");
    const c: any = await getConfig();
    if (!c?.gmf_group_id) return { ok: false, message: "Chưa chọn nhóm GMF" };
    const s = await import("./gmf.server");
    const t = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
    const r = await s.postGroup(c.gmf_group_id, `🧪 ${await brandHeader()} — TIN KIỂM THỬ TIỀN VỀ\nĐây là tin kiểm tra kết nối nhóm, không chứa dữ liệu tài chính.\nThời gian: ${t}`);
    return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi — kiểm tra nhóm" } : { ok: false, message: `Không gửi được (${r.code}: ${r.message})` };
  });

export const gmfRetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertManage(context);
    const s = await import("./gmf.server");
    return s.sendPending();
  });
