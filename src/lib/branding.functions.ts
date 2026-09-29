import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_BRANDING, type Branding } from "@/lib/branding";

/** Public branding is safe to read before sign-in and while rendering share previews. */
export const getPublicBranding = createServerFn({ method: "GET" }).handler(async (): Promise<Branding> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return DEFAULT_BRANDING;
  try {
    const response = await fetch(`${url}/rest/v1/app_branding?id=eq.1&select=app_name,short_name,org_name,description`, {
      headers: { apikey: key },
    });
    if (!response.ok) return DEFAULT_BRANDING;
    const rows = await response.json() as Partial<Branding>[];
    return rows[0] ? { ...DEFAULT_BRANDING, ...rows[0] } : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
});