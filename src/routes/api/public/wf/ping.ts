import { createFileRoute } from "@tanstack/react-router";

/** Plugin WordPress kiểm tra kết nối: xác thực HMAC + trả trạng thái website. */
export const Route = createFileRoute("/api/public/wf/ping")({
  server: { handlers: { POST: async ({ request }) => {
    const raw = await request.text();
    if (raw.length > 64 * 1024) return Response.json({ ok: false, code: "too_large" }, { status: 413 });
    const s = await import("@/lib/webForms/wf.server");
    const auth = await s.authenticate(request, raw);
    if (!auth.ok) return Response.json({ ok: false, code: auth.code, message: auth.message }, { status: auth.status });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await (supabaseAdmin as any).from("wf_forms").select("form_id", { count: "exact", head: true })
      .eq("website_id", auth.auth.website.id).eq("enabled", true);
    return Response.json({ ok: true, code: "connected", website: { id: auth.auth.website.id, name: auth.auth.website.name, domain: auth.auth.website.domain }, forms_enabled: count ?? 0, server_time: new Date().toISOString() });
  } } },
});
