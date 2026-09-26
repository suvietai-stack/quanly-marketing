import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

/** Máy chủ tự gửi Web Push khi có thông báo mới (gọi bởi trigger CSDL). */
export const Route = createFileRoute("/api/public/push/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const s = await import("@/lib/push.server");
        const exp = await s.pushToken();
        const got = request.headers.get("x-push-token") ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) {
          return new Response("Unauthorized", { status: 401 });
        }
        try { return Response.json(await s.processPush(30)); }
        catch { return Response.json({ ok: false }, { status: 500 }); }
      },
    },
  },
});
