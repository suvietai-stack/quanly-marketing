import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Branding {
  app_name: string; short_name: string; org_name: string; description: string;
  logo_url: string | null; favicon_url: string | null; updated_at?: string | null;
}
export const DEFAULT_BRANDING: Branding = {
  app_name: "Base Marketing", short_name: "BASE", org_name: "Công ty Cổ phần Sứ Việt",
  description: "Quản lý công việc", logo_url: null, favicon_url: null,
};
export const ALLOWED_IMG = ["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"];
export const MAX_IMG = 500 * 1024;

export async function fetchBranding(): Promise<Branding> {
  const { data, error } = await (supabase as any).from("app_branding").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_BRANDING;
  return { ...DEFAULT_BRANDING, ...data };
}

/** Luôn trả về giá trị dùng được — lỗi tải thì dùng mặc định. */
export function useBranding(): Branding {
  const q = useQuery({ queryKey: ["branding"], queryFn: fetchBranding, staleTime: 5 * 60_000, retry: 1 });
  return q.data ?? DEFAULT_BRANDING;
}

export const brandTitle = (page: string, b: Branding) => `${page} — ${b.app_name}`;

/** Đồng bộ tiêu đề tab + favicon sau khi tải. */
export function BrandingSync() {
  const b = useBranding();
  useEffect(() => {
    const fix = () => {
      const t = document.title;
      if (t.includes("— Base Marketing") && b.app_name !== DEFAULT_BRANDING.app_name) document.title = t.replace("— Base Marketing", `— ${b.app_name}`);
      else if (t.startsWith("Base Marketing") && b.app_name !== DEFAULT_BRANDING.app_name) document.title = t.replace("Base Marketing", b.app_name);
    };
    fix();
    const el = document.querySelector("title");
    const mo = el ? new MutationObserver(fix) : null;
    if (el && mo) mo.observe(el, { childList: true });
    return () => mo?.disconnect();
  }, [b.app_name]);
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = b.favicon_url || "/favicon.ico";
  }, [b.favicon_url]);
  return null;
}

export function BrandMark({ b, className }: { b: Branding; className: string }) {
  if (b.logo_url) return <img src={b.logo_url} alt={b.app_name} className={className + " object-contain bg-transparent"} />;
  return <div className={className + " inline-flex items-center justify-center bg-primary text-primary-foreground font-bold"}>{(b.short_name || b.app_name).slice(0, 1).toUpperCase()}</div>;
}
