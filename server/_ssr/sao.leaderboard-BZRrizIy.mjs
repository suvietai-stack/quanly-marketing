import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as SaoNav } from "./SaoPages-DJY4Yd_1.mjs";
import { u as useQueryClient, a as useQuery, q as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, bF as TooltipProvider, j as cn, B as Button, bG as Tooltip, bH as TooltipTrigger, bI as TooltipContent } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { a2 as Trophy, aC as RefreshCw, aT as ChevronLeft, s as ChevronRight, a4 as Star } from "../_libs/lucide-react.mjs";
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
import "./textarea-BGZgnbbj.mjs";
import "./select-CHuMrfap.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "./states-C0pL4afS.mjs";
import "./logic-CUzbxsuC.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./auth-errors-CN_iHaBn.mjs";
import "./branding-Bpuupoin.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "./navigation-BcdDdvEu.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "./config-DnDqLpRb.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "./notifyMessage-DnoA8PJG.mjs";
import "./notifyMessage-CLuxtttz.mjs";
import "./notify-CzSXyhJl.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./storeRead-Ci9Vlcxx.mjs";
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
const VN_TZ = "Asia/Ho_Chi_Minh";
function vnParts(now) {
  const fmt2 = new Intl.DateTimeFormat("en-CA", { timeZone: VN_TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
  const parts = fmt2.formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  const dowMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { y: Number(get("year")), m: Number(get("month")), d: Number(get("day")), dow: dowMap[get("weekday")] ?? 1 };
}
function vnToUtc(y, m, d, h = 0, min = 0) {
  return new Date(Date.UTC(y, m - 1, d, h - 7, min));
}
function currentStep(mode, now) {
  const { y, m, d, dow } = vnParts(now);
  switch (mode) {
    case "year":
      return y;
    case "quarter":
      return y * 4 + Math.floor((m - 1) / 3);
    case "month":
      return y * 12 + (m - 1);
    case "week": {
      const mondayWall = Date.UTC(y, m - 1, d - (dow - 1));
      return Math.floor((mondayWall - 4 * 864e5) / (7 * 24 * 3600 * 1e3));
    }
    default:
      return 0;
  }
}
function resolvePeriod(mode, offset, now) {
  if (mode === "all") return { from: null, to: null, label: "Tất cả thời gian" };
  const step = currentStep(mode, now) + offset;
  if (mode === "year") {
    const y = step;
    return { from: vnToUtc(y, 1, 1), to: vnToUtc(y + 1, 1, 1), label: `Năm ${y}` };
  }
  if (mode === "quarter") {
    const y = Math.floor(step / 4);
    const q = (step % 4 + 4) % 4;
    return { from: vnToUtc(y, q * 3 + 1, 1), to: vnToUtc(y, q * 3 + 4, 1), label: `Quý ${q + 1}/${y}` };
  }
  if (mode === "month") {
    const y = Math.floor(step / 12);
    const m = (step % 12 + 12) % 12;
    return { from: vnToUtc(y, m + 1, 1), to: vnToUtc(y, m + 2, 1), label: `Tháng ${m + 1}/${y}` };
  }
  const mondayWall = step * 7 * 24 * 3600 * 1e3 + 4 * 864e5;
  const monday = new Date(mondayWall - 7 * 3600 * 1e3);
  const sundayEnd = new Date(monday.getTime() + 7 * 24 * 3600 * 1e3);
  const fmtDay = (wallMs) => {
    const dt = new Date(wallMs);
    return `${String(dt.getUTCDate()).padStart(2, "0")}/${String(dt.getUTCMonth() + 1).padStart(2, "0")}/${dt.getUTCFullYear()}`;
  };
  return { from: monday, to: sundayEnd, label: `${fmtDay(mondayWall)} – ${fmtDay(mondayWall + 6 * 864e5)}` };
}
async function loadLeaderboard(mode, offset) {
  const period = resolvePeriod(mode, offset, /* @__PURE__ */ new Date());
  const { data, error } = await supabase.rpc("sao_leaderboard", {
    _from: period.from ? period.from.toISOString() : void 0,
    _to: period.to ? period.to.toISOString() : void 0
  });
  if (error) throw error;
  return data ?? [];
}
const leaderboardOptions = (mode, offset) => queryOptions({
  queryKey: ["sao-leaderboard", mode, offset],
  queryFn: () => loadLeaderboard(mode, offset),
  staleTime: 3e4,
  refetchOnWindowFocus: true
});
const MODES = [
  { key: "all", label: "Tất cả" },
  { key: "year", label: "Năm" },
  { key: "quarter", label: "Quý" },
  { key: "month", label: "Tháng" },
  { key: "week", label: "Tuần" }
];
const fmt = (n) => n.toLocaleString("vi-VN");
const MEDALS = ["🥇", "🥈", "🥉"];
function Leaderboard() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [mode, setMode] = reactExports.useState("month");
  const [offset, setOffset] = reactExports.useState(0);
  const q = useQuery(leaderboardOptions(mode, offset));
  const period = resolvePeriod(mode, offset, /* @__PURE__ */ new Date());
  function switchMode(next) {
    setMode(next);
    setOffset(0);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Bảng thành tích Sao Sứ Việt", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto rounded-xl border bg-card p-1", role: "tablist", "aria-label": "Lọc theo thời gian", children: MODES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          role: "tab",
          "aria-selected": mode === m.key,
          onClick: () => switchMode(m.key),
          className: cn(
            "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            mode === m.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          ),
          children: m.label
        },
        m.key
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "icon",
          variant: "ghost",
          "aria-label": "Làm mới bảng thành tích",
          onClick: () => queryClient.invalidateQueries({ queryKey: ["sao-leaderboard"] }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" })
        }
      )
    ] }),
    mode !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", "aria-label": "Kỳ trước", onClick: () => setOffset((o) => o - 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "min-w-40 text-center font-semibold", "aria-live": "polite", children: period.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", "aria-label": "Kỳ sau", disabled: offset >= 0, onClick: () => setOffset((o) => o + 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
    ] }),
    q.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground py-8 text-center", children: "Đang tải bảng thành tích…" }),
    q.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive py-8 text-center", children: q.error.message }),
    q.data && q.data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-9 w-9 mx-auto mb-3 text-chipi-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Chưa có dữ liệu thành tích" })
    ] }),
    q.data && q.data.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium w-16", children: "Hạng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Nhân viên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-help underline decoration-dotted underline-offset-4", children: "Sao đã đạt" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-64", children: "Tổng số Sao bạn đã kiếm được trong khoảng thời gian được chọn, bao gồm cả Sao thưởng tự động và cộng thủ công. Không trừ Sao đã sử dụng đổi quà." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "cursor-help underline decoration-dotted underline-offset-4", children: "Sao còn" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-64", children: "Số Sao khả dụng hiện tại (số dư ví trừ Sao đang giữ đổi quà). Luôn là số liệu hôm nay, không đổi theo kỳ đang xem." })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: q.data.map((row) => {
        const mine = row.user_id === user?.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: cn(mine && "bg-primary/5 font-medium"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: row.rank <= 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-label": `Hạng ${row.rank}`, children: MEDALS[row.rank - 1] }) : row.rank }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            row.full_name,
            mine && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-primary", children: "(Bạn)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-semibold", children: [
            fmt(row.earned),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 text-warning fill-warning" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right whitespace-nowrap text-muted-foreground", children: fmt(row.available) })
        ] }, row.user_id);
      }) })
    ] }) })
  ] }) });
}
function LeaderboardPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-44 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-chipi-orange font-medium mb-1", children: "Sao Sứ Việt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-6 w-6 text-warning" }),
        "Bảng thành tích"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SaoNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Leaderboard, {})
  ] });
}
export {
  LeaderboardPage as component
};
