import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/meta/oauth-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const code = u.searchParams.get("code") ?? "";
        const state = u.searchParams.get("state") ?? "";
        const s = await import("@/lib/fbLeads/fb.server");
        const base = await s.baseUrl();
        const back = (q: string) => new Response(null, { status: 302, headers: { Location: `${base}/settings?tab=fbleads&${q}` } });
        if (!state || state.length > 100) return back("fbl_error=state");
        if (!code || code.length > 2000) return back(`fbl_error=${encodeURIComponent(u.searchParams.get("error_description") || "Người dùng hủy đăng nhập")}`);
        try {
          await s.exchangeCode(code, state);
          return back(`fbl_state=${encodeURIComponent(state)}`);
        } catch (e: any) {
          console.error("[fbl] oauth failed", e?.message);
          return back(`fbl_error=${encodeURIComponent(String(e?.message ?? "Kết nối thất bại").slice(0, 300))}`);
        }
      },
    },
  },
});
