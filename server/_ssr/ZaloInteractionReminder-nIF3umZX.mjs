import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useServerFn, B as Button, D as Dialog, x as DialogContent, A as DialogTitle, bc as DialogDescription, c6 as ZaloLinkCard, c4 as zaloMyLink, c5 as zaloReminderHealth } from "./router-CkmTURa-.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { X, ag as ExternalLink, B as Bell } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "node:stream";
import "../_libs/isbot.mjs";
import "./client-DfPXH9B8.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./server-DpZ_OgFb.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./auth-middleware-B14nd7Va.mjs";
import "./auth-errors-CN_iHaBn.mjs";
import "./branding-Bpuupoin.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "./navigation-BcdDdvEu.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "./config-DnDqLpRb.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "./notifyMessage-DnoA8PJG.mjs";
import "./notifyMessage-CLuxtttz.mjs";
import "./notify-CzSXyhJl.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./storeRead-Ci9Vlcxx.mjs";
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
const INTERACTION_WINDOW = 7 * 24 * 60 * 60 * 1e3;
const REMINDER_SNOOZE = 24 * 60 * 60 * 1e3;
const ZALO_REMINDER_LINK_REFRESH_MS = 18e4;
const ZALO_REMINDER_HEALTH_REFRESH_MS = 3e5;
function interactionState(link, health, now) {
  if (!link) return "unlinked";
  if (!health.connected || !health.webhookConfigured || link.status !== "active") return "unavailable";
  const last = link.last_interaction_at ? Date.parse(link.last_interaction_at) : NaN;
  if (!Number.isFinite(last) || last > now) return "unknown";
  const remaining = last + INTERACTION_WINDOW - now;
  if (remaining <= 0) return "overdue";
  return remaining <= REMINDER_SNOOZE ? "soon" : "fresh";
}
function reminderDue(state, snoozedAt, now) {
  return state === "overdue" && (!Number.isFinite(snoozedAt) || now >= snoozedAt + REMINDER_SNOOZE);
}
function reminderStorageKey(userId) {
  return `zalo-interaction-snooze:${userId}`;
}
function ZaloInteractionReminder({ userId }) {
  const myLink = useServerFn(zaloMyLink);
  const getHealth = useServerFn(zaloReminderHealth);
  const [clock, setClock] = reactExports.useState(null);
  const [snoozedAt, setSnoozedAt] = reactExports.useState(NaN);
  const [linkOpen, setLinkOpen] = reactExports.useState(false);
  const link = useQuery({ queryKey: ["zalo-reminder-link", userId], queryFn: () => myLink(), refetchInterval: ZALO_REMINDER_LINK_REFRESH_MS, staleTime: 6e4, refetchOnWindowFocus: true, refetchIntervalInBackground: false, retry: 1 });
  const health = useQuery({ queryKey: ["zalo-reminder-health", userId], queryFn: () => getHealth(), refetchInterval: ZALO_REMINDER_HEALTH_REFRESH_MS, staleTime: 18e4, refetchOnWindowFocus: true, refetchIntervalInBackground: false, retry: 1 });
  reactExports.useEffect(() => {
    const sync = () => {
      setClock(Date.now());
      try {
        const value = localStorage.getItem(reminderStorageKey(userId));
        setSnoozedAt(value ? Number(value) : NaN);
      } catch {
      }
    };
    sync();
    const timer = window.setInterval(sync, 3e4);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, [userId]);
  const later = () => {
    const at = Date.now();
    setSnoozedAt(at);
    try {
      localStorage.setItem(reminderStorageKey(userId), String(at));
    } catch {
    }
  };
  if (clock === null || link.isPending || health.isPending) return null;
  const state = link.isError || health.isError ? "unknown" : interactionState(link.data ?? null, health.data ?? { connected: false, webhookConfigured: false }, clock);
  const snoozed = Number.isFinite(snoozedAt) && clock < snoozedAt + REMINDER_SNOOZE;
  if (state === "fresh" || snoozed) return null;
  const popup = reminderDue(state, snoozedAt, clock);
  const oaUrl = health.data?.oaUrl;
  const message = state === "unlinked" ? "Chưa liên kết Zalo cá nhân." : state === "soon" ? "Sắp đủ 7 ngày từ lần tương tác Zalo OA được Base ghi nhận. Hãy nhắn BASE để duy trì khả năng nhận tin cá nhân." : state === "overdue" ? "Đã lâu bạn chưa tương tác với Zalo OA Sứ Việt. Thông báo Zalo cá nhân có thể không gửi được." : state === "unavailable" ? "Zalo OA hoặc liên kết cá nhân chưa sẵn sàng. Chưa thể xác minh khả năng nhận tin; vui lòng liên hệ quản trị viên." : "Chưa xác minh được lần tương tác Zalo OA. Nếu đã gửi BASE, hãy chờ Base nhận được tin; nếu chưa cập nhật, liên hệ quản trị viên kiểm tra kết nối nhận tin.";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    popup ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { role: "dialog", "aria-modal": "false", "aria-labelledby": "zalo-interaction-title", "aria-describedby": "zalo-interaction-description", className: "fixed bottom-4 right-4 z-50 w-[calc(100%_-_2rem)] max-w-sm rounded-lg border bg-card p-5 text-card-foreground shadow-lg max-h-[calc(100dvh_-_2rem)] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "zalo-interaction-title", className: "text-base font-semibold leading-6", children: "🔔 NHẮC TƯƠNG TÁC ZALO OA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "shrink-0", "aria-label": "Để sau 24 giờ", onClick: later, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "zalo-interaction-description", className: "mt-2 text-sm text-muted-foreground", children: message }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "my-4 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Bước 1: Mở Zalo OA Sứ Việt." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Bước 2: Gửi tin nhắn ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "BASE" }),
          " cho OA."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Bước 3: Quay lại Base, hệ thống tự kiểm tra trạng thái." })
      ] }),
      !oaUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Chưa có đường dẫn OA đã xác minh. Vui lòng liên hệ quản trị viên." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        oaUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: oaUrl, target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "mr-2 h-4 w-4" }),
          "Mở Zalo OA"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: later, children: "Để sau" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Theo lần tương tác Base ghi nhận; không áp dụng cho thông báo nhóm GMF." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "mb-4 flex flex-wrap items-center gap-3 border-b pb-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex-1 min-w-40 text-muted-foreground", children: message }),
      state === "unlinked" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setLinkOpen(true), children: "Liên kết Zalo" }) : oaUrl && state === "soon" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: oaUrl, target: "_blank", rel: "noopener noreferrer", children: "Mở Zalo OA" }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Để sau 24 giờ", onClick: later, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: linkOpen, onOpenChange: setLinkOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md w-[calc(100%_-_2rem)] rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Liên kết Zalo cá nhân" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Liên kết với OA Sứ Việt để nhận thông báo cá nhân." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ZaloLinkCard, {})
    ] }) })
  ] });
}
export {
  ZaloInteractionReminder
};
