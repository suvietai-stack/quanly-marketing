import { createFileRoute } from "@tanstack/react-router";

/** Lịch chạy nền (pg_cron, 5 phút/lần): nhắc xác nhận Tiền Về. Xác thực bằng token cron máy chủ. */
export const Route = createFileRoute("/api/public/finance/remind-cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const z = await import("@/lib/zalo.server");
        const cfg: any = await z.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        const { timingSafeEq } = await import("@/lib/webForms/wf.server");
        if (!exp || !timingSafeEq(got, exp)) return new Response("Unauthorized", { status: 401 });
        try { const s = await import("@/lib/finance/gmf.server"); return Response.json({ ok: true, ...(await s.runAutoReminders()) }); }
        catch (e: any) { console.error("[fin] remind failed", e?.message); return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
