import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, bA as useIsMobile, I as Input, P as PageHeader, B as Button, S as Sheet, bB as SheetTrigger, q as SheetContent, r as SheetHeader, t as SheetTitle, j as cn, l as Badge } from "./router-CkmTURa-.mjs";
import { u as useJobTimes, L as ListTimeCell, s as shortTimeLines, f as fmtDur } from "./JobTimes-B4Q3SSZP.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-CW0Q8d6x.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CbsUJXCl.mjs";
import { o as oqApi, L as LIST_STATUSES, v as vnDateTime, a as vnDate } from "./logic-BXklg4nZ.mjs";
import { u as useUserName, F as FlowBadge } from "./OqCommon-BFxbEy7S.mjs";
import "../_libs/seroval.mjs";
import { a6 as Plus, Y as ChartColumn, f as Search, g as SlidersHorizontal, ap as Trash2 } from "../_libs/lucide-react.mjs";
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
import "./timeframe-CYUNchQ5.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./command-DR-zJx0h.mjs";
import "../_libs/cmdk.mjs";
const ALL = "__all";
function OqList() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const {
    can,
    user
  } = useCurrentUser();
  const name = useUserName();
  const [tab, setTab] = reactExports.useState("all");
  const [q, setQ] = reactExports.useState("");
  const [st, setSt] = reactExports.useState(ALL);
  const [creator, setCreator] = reactExports.useState(ALL);
  const [assignee, setAssignee] = reactExports.useState(ALL);
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(0);
  const [sheet, setSheet] = reactExports.useState(false);
  const isMobile = useIsMobile();
  const [busy, setBusy] = reactExports.useState(null);
  const [del, setDel] = reactExports.useState(null);
  const canDel = can("oq.delete_cancelled");
  const doDelete = async () => {
    const r = del;
    if (!r) return;
    setBusy(r.id);
    try {
      await oqApi.deleteCancelled(r.id);
      toast.success(`Đã xóa ${r.code ?? "yêu cầu"}.`);
      setDel(null);
      qc.invalidateQueries({
        queryKey: ["oq-list"]
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };
  const delBtn = (r) => canDel && r.status === "cancelled" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-destructive", disabled: busy === r.id, onClick: (e) => {
    e.stopPropagation();
    setDel(r);
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1" }),
    "Xóa"
  ] }) : null;
  const nFilters = [creator !== ALL, assignee !== ALL, !!from, !!to].filter(Boolean).length;
  const SIZE = 30;
  const base = {
    tab,
    q: q.trim() || void 0,
    creator: creator === ALL ? void 0 : creator,
    assignee: assignee === ALL ? void 0 : assignee,
    from: from || void 0,
    to: to || void 0
  };
  const params = {
    ...base,
    page,
    size: SIZE,
    status: st === ALL ? void 0 : st
  };
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["oq-list", params],
    queryFn: () => oqApi.list(params),
    refetchInterval: 6e4,
    placeholderData: (p) => p
  });
  const countsQ = useQuery({
    queryKey: ["oq-list", "counts", base],
    queryFn: () => oqApi.counts(base),
    refetchInterval: 6e4,
    placeholderData: (p) => p
  });
  const peopleQ = useQuery({
    queryKey: ["oq-list", "people"],
    queryFn: oqApi.people
  });
  reactExports.useEffect(() => setPage(0), [tab, q, st, creator, assignee, from, to]);
  const rows = reactExports.useMemo(() => {
    if (!data) return [];
    return data.requests.map((r) => {
      const flows = (r.flows ?? []).filter((f) => tab === "all" || f.kind === tab);
      return {
        ...r,
        flows,
        count: r.oq_items?.[0]?.count ?? 0,
        flowCode: tab === "all" ? void 0 : flows[0]?.code
      };
    });
  }, [data, tab]);
  const times = useJobTimes(rows.flatMap((r) => r.status === "draft" ? [] : r.flows.map((f) => f.id)));
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / SIZE));
  const people = peopleQ.data ?? {
    a: [],
    c: []
  };
  const counts = countsQ.data;
  const today = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
  const overdue = (r) => r.status !== "cancelled" && !!r.delivery_date && r.delivery_date < today && r.flows.some((f) => f.status === "processing");
  const canAccept = (f) => f.status === "pending" && (f.assignee_id === user?.id && can("oq.accept") && can(f.kind === "price" ? "oq.reply_price" : "oq.reply_progress") || can("oq.manage"));
  const accept = async (e, f) => {
    e.stopPropagation();
    setBusy(f.id);
    try {
      await oqApi.accept(f.id);
      toast.success("Đã xác nhận tiếp nhận.");
      qc.invalidateQueries({
        queryKey: ["oq-list"]
      });
      qc.invalidateQueries({
        queryKey: ["oq-times"]
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };
  const open = (r) => r.status === "draft" ? nav({
    to: "/order-quotes/new",
    search: {
      id: r.id
    }
  }) : nav({
    to: "/order-quotes/$id",
    params: {
      id: r.id
    },
    search: {
      flow: r.flowCode ? r.flows[0]?.id : void 0
    }
  });
  const statusTabs = [{
    value: ALL,
    label: "Tất cả",
    key: "all"
  }, ...LIST_STATUSES.map((s) => ({
    ...s,
    key: s.value
  }))];
  const clear = () => {
    setCreator(ALL);
    setAssignee(ALL);
    setFrom("");
    setTo("");
  };
  const mode = st === "pending" ? "pending" : st === "processing" || st === "waiting" ? "processing" : "default";
  const filterFields = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-4 [&_button]:h-11", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "grid gap-1 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người tạo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: creator, onValueChange: setCreator, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người tạo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ALL, children: "Mọi người tạo" }),
          people.c.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name(id) }, id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "grid gap-1 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cung ứng phụ trách" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: assignee, onValueChange: setAssignee, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người phụ trách" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: ALL, children: "Mọi người phụ trách" }),
          people.a.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name(id) }, id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ngày tạo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value), "aria-label": "Từ ngày", className: "h-11 px-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value), "aria-label": "Đến ngày", className: "h-11 px-2" })
      ] })
    ] })
  ] });
  const waitCell = (r) => r.flows.map((f) => {
    const t = times.current(f.id);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "whitespace-nowrap", children: [
      f.kind === "price" ? "Giá" : "Tiến độ",
      ": ",
      t?.sent_at ? fmtDur((Date.parse(t.server_now) - Date.parse(t.sent_at)) / 1e3) : "—"
    ] }, f.id);
  });
  const acceptedCell = (r) => r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-nowrap", children: vnDateTime(times.current(f.id)?.accepted_at) || "—" }, f.id));
  const acceptBtns = (r) => r.status === "cancelled" ? delBtn(r) : r.flows.filter(canAccept).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: busy === f.id, onClick: (e) => accept(e, f), children: [
    "Tiếp nhận",
    r.flows.length > 1 ? ` ${f.kind === "price" ? "Giá" : "Tiến độ"}` : ""
  ] }, f.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "oq-mobile-list min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Hỏi Giá & Tiến Độ", description: "Đơn Sứ Quà Tặng — hỏi giá, khả năng đáp ứng và ngày giao dự kiến trước khi chốt đơn.", actions: can("oq.create") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-quotes/new", search: {
      id: void 0
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Tạo yêu cầu"
    ] }) }) : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "oq-simple-guide mb-4 rounded-2xl border bg-card p-4 md:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-sm", children: "Hỏi nhanh, theo dõi rõ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-5 text-muted-foreground", children: "1. Sale gửi yêu cầu → 2. Cung ứng trả lời → 3. Sale xem kết quả" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-amber-100 px-2 py-1 text-amber-800", children: "Chờ tiếp nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-blue-100 px-2 py-1 text-blue-800", children: "Đang xử lý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-emerald-100 px-2 py-1 text-emerald-800", children: "Đã trả lời" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 h-11 sm:inline-flex sm:w-auto sm:h-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "Tất cả" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "price", children: "Hỏi Giá" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "progress", children: "Hỏi Tiến Độ" })
      ] }),
      (can("oq.report_own") || can("oq.report_all")) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-2 w-full h-11 sm:mt-0 sm:ml-2 sm:w-auto sm:h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-quotes/report", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 mr-1" }),
        "Báo cáo thống kê"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 sm:max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Tên hoặc mã yêu cầu", "aria-label": "Tìm yêu cầu theo tên hoặc mã", className: "pl-8 h-11 rounded-xl text-base" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: sheet, onOpenChange: setSheet, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: nFilters ? "secondary" : "outline", className: "h-10 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4 mr-1" }),
          "Bộ lọc",
          nFilters ? ` (${nFilters})` : ""
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: isMobile ? "bottom" : "right", className: isMobile ? "max-h-[85dvh] overflow-y-auto rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)]" : "overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Bộ lọc" }) }),
          filterFields,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-11", onClick: clear, children: "Xóa lọc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-11", onClick: () => setSheet(false), children: "Xem kết quả" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-4 mb-3 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]", role: "tablist", "aria-label": "Trạng thái", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-max gap-1 border-b", children: statusTabs.map((s) => {
      const on = st === s.value;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { role: "tab", style: s.value === "cancelled" ? {
        marginLeft: "0.75rem"
      } : void 0, "aria-selected": on, onClick: () => setSt(s.value), className: cn("-mb-px flex h-10 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-sm transition-colors", on ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"), children: [
        s.label,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-full px-1.5 py-0.5 text-[11px] tabular-nums", on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"), children: counts?.[s.key] ?? "…" })
      ] }, s.key);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-2", children: [
      "Loại đơn: Đơn Sứ Quà Tặng · ",
      total,
      " kết quả",
      mode === "pending" ? " · chờ lâu nhất lên đầu" : "",
      isFetching ? " · đang cập nhật…" : ""
    ] }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-destructive/40 p-6 text-center text-sm space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Không tải được danh sách: ",
        error.message
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Thử lại" })
    ] }) : isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground", children: "Chưa có yêu cầu nào phù hợp." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-lg border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mã" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tên yêu cầu" }),
          mode === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Người gửi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Thời điểm gửi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Đã chờ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cung ứng phụ trách" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] }) : mode === "processing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Người phụ trách" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tiếp nhận lúc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cập nhật gần nhất" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ngày khách cần" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tiến độ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cung ứng xử lý" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "SP/PA" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Người tạo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cung ứng phụ trách" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Trạng thái" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Thời gian phản hồi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Thời gian Cung ứng xử lý" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cập nhật" }),
            st === "cancelled" && canDel && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.map((r) => {
          const od = overdue(r);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: cn("cursor-pointer", od && "bg-destructive/5 hover:bg-destructive/10"), onClick: () => open(r), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: cn("font-mono text-xs whitespace-nowrap", od && "border-l-2 border-l-destructive"), children: r.flowCode ?? r.code ?? "Nháp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium max-w-[260px] truncate", children: r.title || "(chưa đặt tên)" }),
            mode === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.creator_id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: vnDateTime(r.submitted_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-medium", children: waitCell(r) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                f.kind === "price" ? "Giá" : "Tiến độ",
                ": ",
                name(f.assignee_id)
              ] }, f.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-1", children: acceptBtns(r) }) })
            ] }) : mode === "processing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                f.kind === "price" ? "Giá" : "Tiến độ",
                ": ",
                name(f.assignee_id)
              ] }, f.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: acceptedCell(r) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: vnDateTime(lastUpdate(r)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: r.delivery_date ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(od && "font-semibold text-destructive"), children: [
                vnDate(r.delivery_date),
                od ? " · Quá hạn" : ""
              ] }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCell, { r }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListTimeCell, { t: times.current(f.id), kind: f.kind, part: "proc" }) }, f.id)) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: r.count }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: name(r.creator_id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                f.kind === "price" ? "Giá" : "Tiến độ",
                ": ",
                name(f.assignee_id)
              ] }, f.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCell, { r }),
                od && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs font-semibold text-destructive", children: "Quá hạn" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.status === "draft" ? "—" : r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListTimeCell, { t: times.current(f.id), kind: f.kind, part: "resp" }) }, f.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.status === "draft" ? "—" : r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListTimeCell, { t: times.current(f.id), kind: f.kind, part: "proc" }) }, f.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs whitespace-nowrap", children: vnDateTime(lastUpdate(r)) }),
              st === "cancelled" && canDel && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: delBtn(r) })
            ] })
          ] }, r.id + (r.flowCode ?? ""));
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: rows.map((r) => {
        const od = overdue(r);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("oq-request-card w-full min-w-0 text-left rounded-2xl border bg-card p-4 space-y-3 shadow-soft", od && "border-destructive/50 border-l-4 border-l-destructive"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "min-w-0 break-words text-left text-base font-semibold leading-6", onClick: () => open(r), children: r.title || "(chưa đặt tên)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: r.flowCode ?? r.code ?? "Nháp" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCell, { r }),
            od && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Quá hạn" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs", children: mode === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người gửi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: name(r.creator_id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Gửi lúc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: vnDateTime(r.submitted_at) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Đã chờ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: waitCell(r) })
          ] }) : mode === "processing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            r.flows.map((f) => [/* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Phụ trách ",
              f.kind === "price" ? "Giá" : "Tiến độ"
            ] }, f.id + "k"), /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: name(f.assignee_id) }, f.id)]),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tiếp nhận" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: acceptedCell(r) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ngày khách cần" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(od && "font-semibold text-destructive"), children: r.delivery_date ? vnDate(r.delivery_date) : "—" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người tạo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: name(r.creator_id) }),
            r.flows.map((f) => [/* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Cung ứng ",
              f.kind === "price" ? "Giá" : "Tiến độ"
            ] }, f.id + "k"), /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: name(f.assignee_id) }, f.id)]),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sản phẩm/PA" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.count })
          ] }) }),
          r.status !== "draft" && r.flows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-muted/50 p-3 space-y-2 text-xs", children: r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "leading-5 break-words", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              f.kind === "price" ? "Hỏi giá" : "Tiến độ",
              ":"
            ] }),
            " ",
            f.status === "pending" ? `Chờ ${name(f.assignee_id)} tiếp nhận` : f.status === "answered" ? "Đã có kết quả — mở để xem" : f.status === "cancelled" ? "Đã hủy" : f.waiting_info ? "Chờ Sale bổ sung thông tin" : `${name(f.assignee_id)} đang xử lý`
          ] }, f.id)) }),
          mode !== "pending" && r.status !== "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "oq-timing-details text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-muted-foreground min-h-11 flex items-center", children: "Thời gian xử lý" }),
            r.flows.map((f) => {
              const l = shortTimeLines(times.current(f.id), f.kind);
              return l && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded bg-muted/40 px-2 py-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium uppercase text-[10px] tracking-wide", children: [
                  f.kind === "price" ? "Giá" : "Tiến độ",
                  " · ",
                  l.head,
                  l.running ? " (tạm tính)" : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: l.resp }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: l.proc }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "h = giờ · m = phút · s = giây" })
              ] }, f.id + "t");
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "Cập nhật ",
              vnDateTime(lastUpdate(r))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "min-h-11 rounded-xl", onClick: () => open(r), children: r.status === "draft" ? "Tiếp tục soạn" : "Xem chi tiết" }),
              acceptBtns(r)
            ] })
          ] })
        ] }, r.id + (r.flowCode ?? ""));
      }) }),
      pages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mt-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: page === 0, onClick: () => setPage(page - 1), children: "Trước" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Trang ",
          page + 1,
          "/",
          pages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: page + 1 >= pages, onClick: () => setPage(page + 1), children: "Sau" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!del, onOpenChange: (o) => !o && setDel(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Xóa yêu cầu ",
          del?.code,
          " đã hủy?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Toàn bộ dữ liệu của yêu cầu sẽ bị xóa: sản phẩm/phương án, luồng Hỏi Giá và Hỏi Tiến Độ, các lượt xử lý, phản hồi, trao đổi, lịch sử, hình ảnh và thông báo liên quan. Không thể khôi phục bằng giao diện." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Không xóa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", disabled: !!busy, onClick: (e) => {
          e.preventDefault();
          void doDelete();
        }, children: "Xóa vĩnh viễn" })
      ] })
    ] }) })
  ] });
}
const lastUpdate = (r) => [r.updated_at, ...r.flows.map((f) => f.updated_at)].sort().pop();
function StatusCell({
  r
}) {
  if (r.status === "draft") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Bản nháp" });
  if (r.status === "cancelled") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-muted-foreground", children: "Đã hủy" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1", children: r.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(FlowBadge, { kind: f.kind, status: f.status, waiting: f.waiting_info }, f.id)) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(OqList, {}) });
export {
  SplitComponent as component
};
