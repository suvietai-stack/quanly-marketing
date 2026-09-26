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
        try { return Response.json(await s.processPending(30)); }
        catch { return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
