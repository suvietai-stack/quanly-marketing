import { createFileRoute } from "@tanstack/react-router";

/** Lịch chạy nền (pg_cron, 5 phút/lần): phục hồi submission Website Forms bị kẹt + nhắc xác nhận Tiền Về. Xác thực bằng token cron máy chủ. */
export const Route = createFileRoute("/api/public/wf/recover-cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const z = await import("@/lib/zalo.server");
        const cfg: any = await z.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        const s = await import("@/lib/webForms/wf.server");
        if (!exp || !s.timingSafeEq(got, exp)) return new Response("Unauthorized", { status: 401 });
        // Cùng nhịp 5 phút: nhắc xác nhận Tiền Về (độc lập, lỗi bên này không chặn bên kia).
        let finRemind: unknown = null;
        try { const f = await import("@/lib/finance/gmf.server"); finRemind = await f.runAutoReminders(); }
        catch (e: any) { console.error("[fin] remind failed", e?.message); }
        // Cùng nhịp: thông báo lịch nộp Kế hoạch/Báo cáo (độc lập, lỗi không chặn các bên khác).
        let bizDeadline: unknown = null;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await (supabaseAdmin as any).rpc("biz_deadline_auto_notify");
          bizDeadline = error ? { error: error.message } : data;
        } catch (e: any) { console.error("[biz] deadline notify failed", e?.message); }
        let k3Report: unknown = null;
        let crmRemind: unknown = null;
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const { data, error } = await supabaseAdmin.rpc('crm_remind');
          crmRemind = error ? { error: 'Chưa tạo được nhắc lịch CRM.' } : data;
        } catch { crmRemind = { error: 'Chưa tạo được nhắc lịch CRM.' }; }
        try { const k = await import('@/lib/biz/k3Automation.server'); k3Report = await k.processK3Reports(); }
        catch { k3Report = { error: 'Báo cáo 3K chưa gửi được; chốt sổ vẫn được giữ.' }; }
        try { return Response.json({ ok: true, finRemind, bizDeadline, k3Report, crmRemind, ...(await s.recoverEvents(20)) }); }
        catch (e: any) { console.error("[wf] recover failed", e?.message); return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
