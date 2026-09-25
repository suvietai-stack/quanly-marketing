import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/zalo/oauth-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code") ?? "";
        const state = url.searchParams.get("state") ?? "";
        const s0 = await import("@/lib/zalo.server");
        const base = await s0.baseUrl().catch(() => s0.DEFAULT_BASE_URL);
        const back = (r: string) => new Response(null, { status: 302, headers: { Location: `${base}/settings?zalo=${r}` } });
        if (!code || !state || code.length > 2000 || state.length > 200) return back("error");
        try {
          const s = await import("@/lib/zalo.server");
          await s.exchangeCode(code, state);
          return back("connected");
        } catch (e: any) {
          console.error("zalo oauth failed:", e?.message);
          return back("error");
        }
      },
    },
  },
});
