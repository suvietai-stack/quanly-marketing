import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/** Máy chủ tự xử lý hàng đợi Zalo (gọi bởi lịch chạy nền) — không phụ thuộc trình duyệt. */
export const Route = createFileRoute("/api/public/zalo/dispatch-cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const s = await import("@/lib/zalo.server");
        const cfg: any = await s.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const r = await s.processPending(30);
          const g = await import("@/lib/leave/zaloGroup.server");
          const lg = await g.processLeaveGroup(10).catch(() => ({ processed: 0 }));
          const f = await import("@/lib/financeRequests/zaloGroup.server");
          const fg = await f.processFrGroup(10).catch(() => ({ processed: 0 }));
          return Response.json({ ...r, leaveGroup: lg, frGroup: fg });
        }
        catch { return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
