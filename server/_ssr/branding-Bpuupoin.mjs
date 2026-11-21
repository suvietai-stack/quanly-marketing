import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
const DEFAULT_BRANDING = {
  app_name: "Base Marketing",
  short_name: "BASE",
  org_name: "Công ty Cổ phần Sứ Việt",
  description: "Quản lý công việc",
  logo_url: null,
  favicon_url: null
};
const ALLOWED_IMG = ["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"];
const MAX_IMG = 500 * 1024;
async function fetchBranding() {
  const { data, error } = await supabase.from("app_branding").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_BRANDING;
  return { ...DEFAULT_BRANDING, ...data };
}
function useBranding() {
  const q = useQuery({ queryKey: ["branding"], queryFn: fetchBranding, staleTime: 5 * 6e4, retry: 1 });
  return q.data ?? DEFAULT_BRANDING;
}
function BrandingSync() {
  const b = useBranding();
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = b.favicon_url || "/favicon.ico";
  }, [b.favicon_url]);
  return null;
}
function BrandMark({ b, className }) {
  if (b.logo_url) return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: b.logo_url, alt: b.app_name, className: className + " object-contain bg-transparent" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: className + " inline-flex items-center justify-center bg-primary text-primary-foreground font-bold", children: (b.short_name || b.app_name).slice(0, 1).toUpperCase() });
}
export {
  ALLOWED_IMG as A,
  BrandingSync as B,
  DEFAULT_BRANDING as D,
  MAX_IMG as M,
  BrandMark as a,
  useBranding as u
};
