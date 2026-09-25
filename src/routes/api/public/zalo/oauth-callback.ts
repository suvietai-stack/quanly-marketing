import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/zalo/oauth-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code") ?? "";
        const state = url.searchParams.get("state") ?? "";
        const back = (r: string) => new Response(null, { status: 302, headers: { Location: `/settings?zalo=${r}` } });
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
