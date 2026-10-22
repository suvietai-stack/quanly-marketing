import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/** Bảo trì Facebook Lead Ads định kỳ (quét Form, retry, đối chiếu) — dùng chung token lịch chạy nền với Zalo. */
export const Route = createFileRoute("/api/public/meta/maintain-cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const z = await import("@/lib/zalo.server");
        const cfg: any = await z.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) return new Response("Unauthorized", { status: 401 });
        try { return Response.json(await (await import("@/lib/fbLeads/fb.server")).maintain()); }
        catch { return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
