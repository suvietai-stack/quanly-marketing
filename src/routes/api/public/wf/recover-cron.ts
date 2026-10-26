import { createFileRoute } from "@tanstack/react-router";

/** Lịch chạy nền (pg_cron, 5 phút/lần): phục hồi submission Website Forms bị kẹt. Xác thực bằng token cron máy chủ. */
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
        try { return Response.json({ ok: true, ...(await s.recoverEvents(20)) }); }
        catch (e: any) { console.error("[wf] recover failed", e?.message); return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
