import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { z } from "zod";

/** Durable database wake: authorized internal processor, no PII in response. */
export const Route = createFileRoute("/api/public/meta/dispatch")({
  server: { handlers: { POST: async ({ request }) => {
    const zserver = await import("@/lib/zalo.server");
    const cfg = await zserver.getConfig();
    const expected = cfg?.care_cron_token ?? "";
    const got = request.headers.get("x-care-token") ?? "";
    if (!expected || got.length !== expected.length || !timingSafeEqual(Buffer.from(got), Buffer.from(expected))) return new Response("Unauthorized", { status: 401 });
    try { z.object({}).strict().parse(await request.json()); } catch { return new Response("Invalid payload", { status: 400 }); }
    try { return Response.json(await (await import("@/lib/fbLeads/fb.server")).dispatchPending()); }
    catch { return Response.json({ ok: false }, { status: 500 }); }
  } } },
});