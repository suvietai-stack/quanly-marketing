import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useCurrentUser, d as approvalCenterQuery, s as sortTodo, e as sortRecent, g as filterItems, h as sourceGroup, B as Button, j as cn, I as Input, k as groupLabel, l as Badge, v as vnd, m as dateText, w as waitingText, p as parseApprovalUrl } from "./router-CkmTURa-.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { aC as RefreshCw, C as ClipboardCheck, f as Search, aD as Clock3, aw as CircleAlert } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
const PAGE_SIZE = 60;
const TAB_LABELS = { todo: "Chờ tôi", mine: "Đang trình", done: "Đã xử lý" };
function OpenButton({ item, tab, full }) {
  const navigate = useNavigate();
  const label = tab === "todo" ? "Mở hồ sơ để duyệt" : "Xem chi tiết";
  const parsed = parseApprovalUrl(item.url);
  if (!parsed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: tab === "todo" ? "default" : "outline", className: full ? "approval-open-button w-full min-h-11 rounded-xl" : "min-h-11", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: item.url, children: label }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      size: "sm",
      variant: tab === "todo" ? "default" : "outline",
      className: full ? "approval-open-button w-full min-h-11 rounded-xl" : "min-h-11",
      onClick: () => navigate({ to: parsed.to, search: parsed.search }),
      children: label
    }
  );
}
function ItemCard({ item, now, tab }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: cn("approval-item-card rounded-2xl border bg-card p-4 space-y-3 shadow-soft", item.overdue && tab === "todo" && "border-destructive/30"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary break-words", children: item.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-base font-semibold leading-6 break-words", children: [item.requester, item.code].filter(Boolean).join(" · ") })
      ] }),
      item.overdue && tab === "todo" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "shrink-0", children: "Quá hạn" })
    ] }),
    item.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground line-clamp-3 break-words leading-6", children: item.summary }),
    item.amount != null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "approval-amount rounded-xl bg-primary/5 px-3 py-2 text-xl font-bold tabular-nums break-words", children: vnd(item.amount) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", children: tab === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      item.action && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: item.action }),
      item.acted_at && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dateText(item.acted_at) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      item.step_label && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.step_label }),
      waitingText(item.waiting_since, now) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Chờ ",
        waitingText(item.waiting_since, now)
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OpenButton, { item, tab, full: true })
  ] });
}
function ItemRow({ item, now, tab }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 align-top", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-nowrap", children: item.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: groupLabel(sourceGroup(item.source)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 align-top", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words", children: item.requester }),
      item.code && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: item.code })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 align-top max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm line-clamp-2 break-words", children: item.summary }),
      item.amount != null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold tabular-nums", children: vnd(item.amount) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 align-top whitespace-nowrap text-sm", children: tab === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      item.action && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.action }),
      item.acted_at && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: dateText(item.acted_at) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      item.step_label && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: item.step_label }),
      waitingText(item.waiting_since, now) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Chờ ",
        waitingText(item.waiting_since, now)
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 align-top", children: item.overdue && tab === "todo" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Quá hạn" }) : tab === "todo" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Chờ duyệt" }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 align-top text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenButton, { item, tab }) })
  ] });
}
function ApprovalCenter() {
  const { user, can } = useCurrentUser();
  const executiveFallback = can("leave.approve") && can("biz.view_all");
  const query = useQuery({ ...approvalCenterQuery(user?.id ?? "", executiveFallback), enabled: !!user?.id });
  const [tab, setTab] = reactExports.useState("todo");
  const [search, setSearch] = reactExports.useState("");
  const [overdueOnly, setOverdueOnly] = reactExports.useState(false);
  const [group, setGroup] = reactExports.useState("all");
  const [limit, setLimit] = reactExports.useState(PAGE_SIZE);
  const data = query.data;
  const now = data?.server_now ?? (/* @__PURE__ */ new Date()).toISOString();
  const rawItems = reactExports.useMemo(() => {
    if (!data) return [];
    const list = tab === "todo" ? data.todo : tab === "mine" ? data.mine : data.done;
    return tab === "todo" ? sortTodo(list) : sortRecent(list, tab === "mine" ? "waiting_since" : "acted_at");
  }, [data, tab]);
  const items = reactExports.useMemo(() => filterItems(rawItems, search, group).filter((i) => tab !== "todo" || !overdueOnly || i.overdue), [rawItems, search, group, overdueOnly, tab]);
  reactExports.useEffect(() => setLimit(PAGE_SIZE), [tab, search, group, overdueOnly]);
  const visible = reactExports.useMemo(() => items.slice(0, limit), [items, limit]);
  const hasFilters = !!search.trim() || group !== "all" || tab === "todo" && overdueOnly;
  const resetFilters = () => {
    setSearch("");
    setGroup("all");
    setOverdueOnly(false);
  };
  const chooseTab = (next) => {
    setTab(next);
    setGroup("all");
    setOverdueOnly(false);
  };
  const groups = reactExports.useMemo(() => [...new Set(rawItems.map((i) => sourceGroup(i.source)))], [rawItems]);
  const groupCount = (g) => rawItems.filter((i) => sourceGroup(i.source) === g).length;
  const overdueCount = data?.todo.filter((i) => i.overdue).length ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "approval-center-mobile min-w-0 space-y-4 pb-24 md:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "approval-center-heading flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl md:text-2xl font-bold tracking-tight", children: "Phê duyệt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: data ? `${data.todo.length} việc chờ xử lý${data.errors?.length ? " từ nguồn đã tải" : ""}` : query.error ? "Chưa tải được dữ liệu" : "Đang tải…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Làm mới", onClick: () => query.refetch(), disabled: query.isFetching, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", query.isFetching && "animate-spin") }) })
    ] }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "approval-overview rounded-3xl p-4 md:hidden", "aria-label": "Tổng quan phê duyệt", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-xs font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-4 w-4" }),
        "TRUNG TÂM ĐIỀU HÀNH"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-xl font-semibold", children: data.todo.length ? "Các hồ sơ đang chờ bạn" : data.errors?.length ? "Kiểm tra các nguồn chưa tải" : "Bạn đã xử lý hết việc chờ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "approval-stat", onClick: () => {
          resetFilters();
          chooseTab("todo");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: data.todo.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Chờ xử lý" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "approval-stat", onClick: () => {
          resetFilters();
          chooseTab("todo");
          setOverdueOnly(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: overdueCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Quá hạn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "approval-stat", onClick: () => {
          resetFilters();
          chooseTab("mine");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: data.mine.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Đang trình" })
        ] })
      ] }),
      data.errors?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs leading-5", children: "Số liệu chưa đầy đủ vì một số nguồn chưa tải được." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs leading-5", children: "Hồ sơ quá hạn và chờ lâu được ưu tiên hiển thị." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: tab, onValueChange: (v) => chooseTab(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "approval-main-tabs w-full md:w-auto grid grid-cols-3", children: Object.keys(TAB_LABELS).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: t, children: [
      TAB_LABELS[t],
      data ? ` (${data[t].length})` : ""
    ] }, t)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "approval-filter-panel flex flex-col gap-3 rounded-2xl border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm hồ sơ", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Tìm người gửi, mã, nội dung…", className: "h-11 rounded-xl pl-10 pr-3 text-base" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "approval-group-filters flex gap-1.5 overflow-x-auto pb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: group === "all" ? "default" : "outline", className: "min-h-11 shrink-0 rounded-xl", "aria-pressed": group === "all", onClick: () => setGroup("all"), children: [
          "Tất cả (",
          rawItems.length,
          ")"
        ] }),
        groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: group === g ? "default" : "outline", className: "min-h-11 shrink-0 rounded-xl", "aria-pressed": group === g, onClick: () => setGroup(g), children: [
          groupLabel(g),
          " (",
          groupCount(g),
          ")"
        ] }, g))
      ] })
    ] }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        items.length,
        " hồ sơ hiển thị",
        tab === "todo" ? " · Ưu tiên quá hạn, chờ lâu" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        tab === "todo" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "min-h-11 rounded-xl", variant: overdueOnly ? "secondary" : "outline", "aria-pressed": overdueOnly, onClick: () => setOverdueOnly((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock3, { className: "h-4 w-4" }),
          "Quá hạn (",
          overdueCount,
          ")"
        ] }),
        hasFilters && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "min-h-11", onClick: resetFilters, children: "Đặt lại" })
      ] })
    ] }),
    !!data?.errors?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 shrink-0" }),
      "Một số nguồn chưa tải được (",
      data.errors.map((e) => groupLabel(sourceGroup(e.source))).filter((v, i, a) => a.indexOf(v) === i).join(", "),
      "). Danh sách bên dưới có thể chưa đầy đủ — bấm nút làm mới để thử lại."
    ] }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground py-10 text-center", children: "Đang tải hồ sơ…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "flex items-center gap-2 text-destructive py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      " Không tải được danh sách phê duyệt. ",
      query.error.message
    ] }),
    !query.isPending && !query.error && items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground py-10 text-center border rounded-lg", children: hasFilters ? "Không có hồ sơ phù hợp bộ lọc. Bấm Đặt lại để xem toàn bộ." : data?.errors?.length ? "Chưa tìm thấy hồ sơ trong các nguồn đã tải. Hãy thử làm mới." : tab === "todo" ? "Không có việc cần phê duyệt." : tab === "mine" ? "Bạn chưa có hồ sơ nào đang trình duyệt." : "Chưa có hồ sơ đã xử lý." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:hidden", children: visible.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ItemCard, { item: i, now, tab }, `${i.source}:${i.id}`)) }),
    items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-lg border bg-card overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-4 font-medium", children: "Loại yêu cầu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-4 font-medium", children: "Người đề nghị" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-4 font-medium", children: "Nội dung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-4 font-medium", children: tab === "done" ? "Kết quả" : "Thời gian chờ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-4 font-medium", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-4 font-medium text-right", children: "Thao tác" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "px-4", children: visible.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ItemRow, { item: i, now, tab }, `${i.source}:${i.id}`)) })
    ] }) }),
    items.length > visible.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "min-h-11 rounded-xl", onClick: () => setLimit((n) => n + PAGE_SIZE), children: [
      "Xem thêm (",
      items.length - visible.length,
      " hồ sơ)"
    ] }) })
  ] });
}
const SplitComponent = ApprovalCenter;
export {
  SplitComponent as component
};
