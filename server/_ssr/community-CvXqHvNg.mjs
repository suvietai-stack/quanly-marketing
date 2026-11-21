import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as CommunityFeed } from "./CommunityFeed-BfVnEziG.mjs";
import { ChatPanel } from "./ChatPanel-v6Zo4_z7.mjs";
import { u as useCurrentUser, H as Route$1m, J as chatUnreadTotal, B as Button } from "./router-CkmTURa-.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { c as MessageCircleHeart, aE as Newspaper, o as MessagesSquare } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "./states-C0pL4afS.mjs";
import "./textarea-BGZgnbbj.mjs";
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
import "./api-DcMIOSaq.mjs";
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
function CommunityWorkspace() {
  const {
    user
  } = useCurrentUser();
  const uid = user?.id || "";
  const {
    tab,
    thread
  } = Route$1m.useSearch();
  const navigate = useNavigate({
    from: Route$1m.fullPath
  });
  const unread = useQuery({
    queryKey: ["chat", "unread", uid],
    queryFn: chatUnreadTotal,
    enabled: !!uid && user?.status === "Đang hoạt động",
    staleTime: 2e4,
    refetchInterval: 6e4,
    retry: 1
  });
  const change = (next) => void navigate({
    to: "/community",
    search: {
      tab: next,
      thread: void 0
    },
    replace: true
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-6xl space-y-4 pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircleHeart, { className: "h-4 w-4" }),
        " Nội bộ Sứ Việt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-bold md:text-2xl", children: "Cộng đồng & Tin nhắn" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Chọn bảng tin hoặc tin nhắn", className: "grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: tab === "feed" ? "default" : "ghost", "aria-pressed": tab === "feed", onClick: () => change("feed"), className: `min-h-12 rounded-xl text-sm ${tab === "feed" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-card text-slate-800 dark:text-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Newspaper, { className: "h-4 w-4" }),
        "Bảng tin"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: tab === "chat" ? "default" : "ghost", "aria-pressed": tab === "chat", onClick: () => change("chat"), className: `min-h-12 rounded-xl text-sm ${tab === "chat" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-card text-slate-800 dark:text-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "h-4 w-4" }),
        "Tin nhắn",
        !!unread.data && unread.data > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white", children: unread.data > 99 ? "99+" : unread.data })
      ] })
    ] }),
    tab === "feed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityFeed, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { initialThreadId: thread, onThreadChange: (id) => void navigate({
      to: "/community",
      search: {
        tab: "chat",
        thread: id
      },
      replace: true
    }) })
  ] });
}
export {
  CommunityWorkspace as component
};
