import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/meta/leads-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const s = await import("@/lib/fbLeads/fb.server");
        const expected = s.verifyToken();
        if (u.searchParams.get("hub.mode") === "subscribe" && expected && u.searchParams.get("hub.verify_token") === expected) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await (supabaseAdmin as any).from("fbl_state").update({ webhook_verified_at: new Date().toISOString() }).eq("id", 1);
          return new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > 1_000_000) return new Response("Too large", { status: 413 });
        const s = await import("@/lib/fbLeads/fb.server");
        if (!(await s.verifySignature(raw, request.headers.get("x-hub-signature-256")))) return new Response("Invalid signature", { status: 401 });
        let body: any;
        try { body = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }
        let ids: string[];
        try { ids = await s.recordEvents(s.parseWebhook(body)); }
        catch (e: any) { console.error("[fbl] store failed", e?.message); return new Response("Store failed", { status: 500 }); }
        for (const id of ids) {
          try { await s.processEvent(id); } catch (e: any) { console.error("[fbl] process failed", e?.message); }
        }
        return new Response("EVENT_RECEIVED", { status: 200 });
      },
    },
  },
});
