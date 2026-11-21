import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { utils, writeFile as writeFileSync } from "../_libs/xlsx.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, S as Sheet, q as SheetContent, I as Input, C as Card, o as CardContent, r as SheetHeader, t as SheetTitle, l as Badge, O as CardHeader, Q as CardTitle, bt as Popover, bu as PopoverTrigger, bv as PopoverContent, N as Checkbox } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CbsUJXCl.mjs";
import { C as ChartContainer, a as ChartTooltip, b as ChartTooltipContent, c as ChartLegend, d as ChartLegendContent } from "./chart-Bcr-THvk.mjs";
import { o as oqApi, v as vnDateTime } from "./logic-BXklg4nZ.mjs";
import { v as vnToday } from "./timeframe-CYUNchQ5.mjs";
import { D as DEFAULT_FILTERS, p as presetRange, t as toBounds, b as baseFilter, g as groupBy, P as PRESET_LABEL, K as KIND_LABEL, S as STATUS_LABEL, a as speedLabel, c as PRESETS, M as MEASURE_LABEL, f as fmtDur, d as aggregate, e as timeSeries, E as EXPLAIN, i as inSpeed, m as measureOf, h as speedDenominator, j as pct, k as toMin, T as THRESHOLDS, l as Explain, n as distribution, B as BUCKETS } from "./JobTimes-B4Q3SSZP.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, af as Download, g as SlidersHorizontal, f as Search, X, bw as ArrowUpDown } from "../_libs/lucide-react.mjs";
import { B as BarChart, c as CartesianGrid, X as XAxis, Y as YAxis, b as Bar } from "../_libs/recharts.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const BASIS_LABEL = {
  sent: "Theo ngày Sale gửi",
  completed: "Theo ngày hoàn thành"
};
const STATUSES = Object.keys(STATUS_LABEL);
function Report() {
  const {
    can
  } = useCurrentUser();
  const [mode, setMode] = reactExports.useState("overview");
  const init = {
    ...DEFAULT_FILTERS,
    measure: "response",
    preset: "month",
    custom: ["", ""],
    basis: "sent"
  };
  const [applied, setApplied] = reactExports.useState(init);
  const [basisTouched, setBasisTouched] = reactExports.useState(false);
  const [drill, setDrill] = reactExports.useState(null);
  const [staff, setStaff] = reactExports.useState(null);
  const range = presetRange(applied.preset, vnToday(), applied.custom);
  const bounds = toBounds(range);
  const q = useQuery({
    queryKey: ["oq-report", bounds, applied.basis],
    queryFn: () => oqApi.report(bounds.from, bounds.to, applied.basis),
    staleTime: 6e4
  });
  const all = q.data ?? [];
  const rows = reactExports.useMemo(() => baseFilter(all, applied), [all, applied]);
  const scope = all[0]?.scope ?? (can("oq.report_all") ? "all" : "own");
  const switchMode = (m) => {
    setMode(m);
    setDrill(null);
    if (!basisTouched) setApplied((a) => ({
      ...a,
      basis: m === "supplier" ? "completed" : "sent",
      measure: m === "supplier" ? "process" : "response"
    }));
  };
  const people = reactExports.useMemo(() => ({
    sales: groupBy(all, "creator_id").map((g) => ({
      id: g.id,
      name: g.name
    })),
    sups: groupBy(all, "assignee_id").map((g) => ({
      id: g.id,
      name: g.name
    }))
  }), [all]);
  const exportXlsx = async () => {
    try {
      const data = baseFilter(await oqApi.report(bounds.from, bounds.to, applied.basis, true), applied);
      doExport(data, applied, range, mode);
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Báo cáo thống kê", description: "Hỏi Giá & Tiến Độ — khối lượng công việc và tốc độ xử lý.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-quotes", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
        "Danh sách"
      ] }) }),
      can("oq.report_export") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: exportXlsx, disabled: !all.length, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
        "Xuất Excel"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: mode, onValueChange: (v) => switchMode(v), className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 h-11 sm:inline-flex sm:w-auto sm:h-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "Tổng quan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "supplier", children: "Hiệu suất Cung ứng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "sale", children: "Theo Sale" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FilterBar, { applied, people, onApply: (a) => {
      if (a.basis !== applied.basis) setBasisTouched(true);
      setApplied(a);
      setDrill(null);
    }, onClear: () => {
      setApplied({
        ...init,
        basis: applied.basis,
        measure: applied.measure
      });
      setDrill(null);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
      "Phạm vi: ",
      scope === "all" ? "toàn bộ" : "cá nhân (yêu cầu bạn tạo hoặc phụ trách)",
      " · Đơn vị đếm: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "lượt xử lý" }),
      applied.rounds === "all" ? " (gồm lượt hỏi lại — không phải số yêu cầu gốc)" : applied.rounds === "first" ? " (chỉ lần hỏi đầu)" : " (chỉ lượt hỏi lại)"
    ] }),
    q.error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-destructive/40 p-6 text-center text-sm space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: q.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => q.refetch(), children: "Thử lại" })
    ] }) : q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) : drill ? /* @__PURE__ */ jsxRuntimeExports.jsx(DetailList, { drill, measure: applied.measure, onBack: () => setDrill(null) }) : mode === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Overview, { rows, f: applied, range, onDrill: setDrill }) : mode === "supplier" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Supplier, { rows, f: applied, onDrill: setDrill, onStaff: (id, name) => setStaff({
      id,
      name,
      key: "assignee_id"
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sales, { rows, onStaff: (id, name) => setStaff({
      id,
      name,
      key: "creator_id"
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: !!staff, onOpenChange: (o) => !o && setStaff(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "right", className: "w-full sm:max-w-3xl overflow-y-auto", children: staff && /* @__PURE__ */ jsxRuntimeExports.jsx(StaffDetail, { title: staff.name, isSale: staff.key === "creator_id", rows: rows.filter((r) => r[staff.key] === staff.id), f: applied, onDrill: (d) => {
      setStaff(null);
      setDrill(d);
    } }) }) })
  ] });
}
function FilterBar({
  applied,
  people,
  onApply,
  onClear
}) {
  const [d, setD] = reactExports.useState(applied);
  const [open, setOpen] = reactExports.useState(false);
  const sync = (o) => {
    if (o) setD(applied);
    setOpen(o);
  };
  const set = (k, v) => setD((x) => ({
    ...x,
    [k]: v
  }));
  const range = presetRange(applied.preset, vnToday(), applied.custom);
  const f2 = (s) => s.split("-").reverse().join("/");
  const chips = [`${PRESET_LABEL[applied.preset]} (${f2(range[0])} – ${f2(range[1])})`, BASIS_LABEL[applied.basis], applied.kind !== "all" ? KIND_LABEL[applied.kind] : "", applied.statuses.map((s) => STATUS_LABEL[s]).join(", "), applied.sales.length ? `Sale: ${applied.sales.map((id) => people.sales.find((p) => p.id === id)?.name ?? "?").join(", ")}` : "", applied.suppliers.length ? `Cung ứng: ${applied.suppliers.map((id) => people.sups.find((p) => p.id === id)?.name ?? "?").join(", ")}` : "", applied.rounds === "first" ? "Chỉ lần hỏi đầu" : applied.rounds === "reask" ? "Chỉ lượt hỏi lại" : "", applied.speed ? `Hoàn thành ${speedLabel(applied.speed)}` : ""].filter(Boolean);
  const body = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_button[role=combobox]]:h-11 lg:[&_button[role=combobox]]:h-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Thời gian", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: d.preset, onValueChange: (v) => set("preset", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRESETS.map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: l }, k)) })
      ] }),
      d.preset === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: d.custom[0], onChange: (e) => set("custom", [e.target.value, d.custom[1]]), "aria-label": "Từ ngày", className: "px-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: d.custom[1], onChange: (e) => set("custom", [d.custom[0], e.target.value]), "aria-label": "Đến ngày", className: "px-2" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mốc thời gian", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: d.basis, onValueChange: (v) => set("basis", v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: BASIS_LABEL.sent }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: BASIS_LABEL.completed })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nghiệp vụ", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: d.kind, onValueChange: (v) => set("kind", v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "price", children: "Hỏi Giá" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "progress", children: "Hỏi Tiến Độ" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lượt xử lý", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: d.rounds, onValueChange: (v) => set("rounds", v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả lượt xử lý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "first", children: "Chỉ lần hỏi đầu tiên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reask", children: "Chỉ các lượt hỏi lại" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trạng thái", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Multi, { options: STATUSES.map((s) => ({
      id: s,
      name: STATUS_LABEL[s]
    })), value: d.statuses, onChange: (v) => set("statuses", v), all: "Mọi trạng thái" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sale", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Multi, { options: people.sales, value: d.sales, onChange: (v) => set("sales", v), all: "Mọi Sale" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Cung ứng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Multi, { options: people.sups, value: d.suppliers, onChange: (v) => set("suppliers", v), all: "Mọi Cung ứng" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thời gian hoàn thành báo giá", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SpeedPicker, { value: d.speed, onChange: (v) => set("speed", v) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Cách đo thời gian", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: d.measure, onValueChange: (v) => set("measure", v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "response", children: [
          "A. ",
          MEASURE_LABEL.response
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "process", children: [
          "B. ",
          MEASURE_LABEL.process
        ] })
      ] })
    ] }) })
  ] });
  const actions = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:flex sm:justify-end", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-11 sm:h-10", onClick: () => {
      onClear();
      setOpen(false);
    }, children: "Xóa bộ lọc" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-11 sm:h-10", onClick: () => {
      onApply(d);
      setOpen(false);
    }, children: "Áp dụng" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hidden lg:block mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
      body,
      actions
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open, onOpenChange: sync, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "lg:hidden w-full h-11 mb-2", onClick: () => sync(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4 mr-1" }),
        "Bộ lọc"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "max-h-[88dvh] overflow-y-auto rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Bộ lọc báo cáo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4", children: body }),
        actions
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: chips.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "font-normal", children: c }, c)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
      "Cách đo: ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
        applied.measure === "response" ? "A. " : "B. ",
        MEASURE_LABEL[applied.measure]
      ] })
    ] })
  ] });
}
const Field = ({
  label,
  children,
  className = ""
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-1 min-w-0 ${className}`, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: label }),
  children
] });
function Multi({
  options,
  value,
  onChange,
  all
}) {
  const label = value.length === 0 ? all : value.length === 1 ? options.find((o) => o.id === value[0])?.name ?? "1 mục" : `${value.length} đã chọn`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", role: "combobox", className: "w-full justify-between font-normal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: label }),
      value.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 opacity-60", onClick: (e) => {
        e.stopPropagation();
        onChange([]);
      } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { className: "w-64 p-2 max-h-72 overflow-y-auto", children: [
      options.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground p-2", children: "Chưa có dữ liệu trong kỳ." }),
      options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-accent cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: value.includes(o.id), onCheckedChange: (c) => onChange(c ? [...value, o.id] : value.filter((x) => x !== o.id)) }),
        o.name
      ] }, o.id))
    ] })
  ] });
}
function SpeedPicker({
  value,
  onChange
}) {
  const preset = !value ? "none" : value.min == null && THRESHOLDS.some(([m]) => m === value.max) ? String(value.max) : "custom";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: preset, onValueChange: (v) => onChange(v === "none" ? null : v === "custom" ? {
      min: null,
      max: null
    } : {
      max: Number(v)
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Không lọc" }),
        THRESHOLDS.map(([m, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m), children: l }, m)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Tùy chỉnh" })
      ] })
    ] }),
    preset === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, inputMode: "numeric", placeholder: "Tối thiểu (phút)", value: value?.min ?? "", onChange: (e) => onChange({
        ...value,
        min: e.target.value === "" ? null : Number(e.target.value)
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, inputMode: "numeric", placeholder: "Tối đa (phút)", value: value?.max ?? "", onChange: (e) => onChange({
        ...value,
        max: e.target.value === "" ? null : Number(e.target.value)
      }) })
    ] })
  ] });
}
function Stat({
  label,
  value,
  hint,
  onClick,
  sub
}) {
  const Comp = onClick ? "button" : "div";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Comp, { onClick, className: `rounded-lg border bg-card p-3 text-left min-w-0 ${onClick ? "hover:border-primary/60 hover:bg-accent/40 transition-colors" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
      label,
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Explain, { text: hint }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-semibold mt-1 truncate", children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: sub })
  ] });
}
const dur = (v, n) => n === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-muted-foreground", children: "Không có dữ liệu" }) : v == null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-muted-foreground", children: "Chưa đủ dữ liệu" }) : fmtDur(v);
function SpeedStat({
  a,
  f,
  onClick
}) {
  const den = speedDenominator(a, f.measure);
  return f.speed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: `Hoàn thành ${speedLabel(f.speed)}`, value: den ? `${a.inSpeed}/${den} · ${pct(a.inSpeed, den)}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-muted-foreground", children: "Không có dữ liệu" }), sub: f.measure === "response" ? "Cách đo A" : "Cách đo B", onClick }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Tỷ lệ trong ngưỡng", value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-muted-foreground", children: "Chọn ngưỡng trong bộ lọc" }) });
}
function Overview({
  rows,
  f,
  range,
  onDrill
}) {
  const a = aggregate(rows, f);
  const done = rows.filter((r) => r.status === "answered");
  const [series, setSeries] = reactExports.useState("sent");
  const ts = timeSeries(rows, range, series);
  const reqCount = (k) => new Set(rows.filter((r) => r.kind === k).map((r) => r.request_id)).size;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Số lượng", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Hỏi Giá", value: rows.filter((r) => r.kind === "price").length, sub: `lượt · ${reqCount("price")} yêu cầu gốc`, onClick: () => onDrill({
        title: "Lượt Hỏi Giá",
        rows: rows.filter((r) => r.kind === "price")
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Hỏi Tiến Độ", value: rows.filter((r) => r.kind === "progress").length, sub: `lượt · ${reqCount("progress")} yêu cầu gốc`, onClick: () => onDrill({
        title: "Lượt Hỏi Tiến Độ",
        rows: rows.filter((r) => r.kind === "progress")
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Báo giá hoàn thành", value: a.donePrice, sub: "lượt", onClick: () => onDrill({
        title: "Báo giá hoàn thành",
        rows: done.filter((r) => r.kind === "price")
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Tiến độ hoàn thành", value: a.doneProgress, sub: "lượt", onClick: () => onDrill({
        title: "Tiến độ hoàn thành",
        rows: done.filter((r) => r.kind === "progress")
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Công việc tồn", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chờ xác nhận", value: a.pending, onClick: () => onDrill({
        title: "Chờ xác nhận",
        rows: rows.filter((r) => r.status === "pending")
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đang xử lý", value: a.processing, onClick: () => onDrill({
        title: "Đang xử lý",
        rows: rows.filter((r) => r.status === "processing")
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đang chờ Sale bổ sung", value: a.waiting, onClick: () => onDrill({
        title: "Đang chờ Sale bổ sung",
        rows: rows.filter((r) => r.status === "waiting_sale")
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Tốc độ (chỉ lượt đã hoàn thành)", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Phản hồi trung bình", hint: EXPLAIN.response, value: dur(a.avgResponse, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Cung ứng xử lý trung bình", hint: EXPLAIN.process, value: dur(a.avgProcess, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Cung ứng xử lý trung vị", hint: "Giá trị ở giữa khi xếp các lượt theo thời gian Cung ứng xử lý — ít bị ảnh hưởng bởi lượt quá dài.", value: dur(a.medProcess, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SpeedStat, { a, f, onClick: () => onDrill({
        title: `Hoàn thành ${speedLabel(f.speed)}`,
        rows: done.filter((r) => inSpeed(measureOf(r, f.measure), f.speed))
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 flex-row flex-wrap items-center justify-between gap-2 space-y-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
          "Số lượng theo ",
          ts.unit === "day" ? "ngày" : ts.unit === "week" ? "tuần" : "tháng"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: series, onValueChange: (v) => setSeries(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-9", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "sent", children: "Lượt gửi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "completed", children: "Lượt hoàn thành" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-2", children: [
          series === "sent" ? "Đếm theo thời điểm Sale gửi (giờ Việt Nam)" : "Đếm theo thời điểm hoàn thành (giờ Việt Nam)",
          f.basis !== series ? ` · dữ liệu được lấy ${BASIS_LABEL[f.basis].toLowerCase()} trong kỳ` : "",
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: KIND_CHART, className: "h-56 w-full aspect-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: ts.pts, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, minTickGap: 16, fontSize: 11 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, width: 28, fontSize: 11 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLegend, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLegendContent, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "price", fill: "var(--color-price)", radius: 3 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "progress", fill: "var(--color-progress)", radius: 3 })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DistributionCard, { rows, measure: f.measure, onDrill })
  ] });
}
const KIND_CHART = {
  price: {
    label: "Hỏi Giá",
    color: "var(--primary)"
  },
  progress: {
    label: "Hỏi Tiến Độ",
    color: "var(--muted-foreground)"
  }
};
const Section = ({
  title,
  children
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: title }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-2", children })
] });
function DistributionCard({
  rows,
  measure,
  onDrill
}) {
  const dist = distribution(rows, measure);
  const total = dist.reduce((s, b) => s + b.n, 0);
  const cfg = {
    n: {
      label: "Số lượt",
      color: "var(--primary)"
    }
  };
  const open = (key) => {
    const b = BUCKETS.find((x) => x.key === key);
    onDrill({
      title: `Hoàn thành ${b.label} (${measure === "response" ? "cách đo A" : "cách đo B"})`,
      rows: rows.filter((r) => {
        const v = measureOf(r, measure);
        return r.status === "answered" && v != null && v > b.lo && v <= b.hi;
      })
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Phân bố tốc độ hoàn thành" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        MEASURE_LABEL[measure],
        " · ",
        total,
        " lượt đã hoàn thành · bấm cột hoặc dòng để xem chi tiết."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-3", children: total === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có lượt hoàn thành trong kỳ." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: cfg, className: "h-52 w-full aspect-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: dist.map((b) => ({
        ...b,
        short: b.label.replace(" phút", "p").replace(" giờ", "h")
      })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "short", tickLine: false, axisLine: false, interval: 0, fontSize: 10 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, width: 28, fontSize: 11 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, { labelKey: "label" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "n", fill: "var(--color-n)", radius: 3, className: "cursor-pointer", onClick: (d) => open(d.key) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs", children: dist.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !b.n, onClick: () => open(b.key), className: "flex justify-between rounded border px-2 py-1.5 enabled:hover:bg-accent disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          b.n,
          " · ",
          pct(b.n, total)
        ] })
      ] }, b.key)) })
    ] }) })
  ] });
}
function Supplier({
  rows,
  f,
  onDrill,
  onStaff
}) {
  const a = aggregate(rows, f);
  const list = groupBy(rows, "assignee_id").map((g) => {
    const ag = aggregate(g.rows, f);
    return {
      ...g,
      a: ag,
      den: speedDenominator(ag, f.measure)
    };
  });
  const [sort, setSort] = reactExports.useState({
    k: "done",
    asc: false
  });
  const val = (r) => ({
    done: r.a.done,
    resp: r.a.avgResponse ?? Infinity,
    proc: r.a.avgProcess ?? Infinity,
    inS: r.a.inSpeed,
    rate: r.den ? r.a.inSpeed / r.den : -1
  })[sort.k] ?? r.name;
  const sorted = [...list].sort((x, y) => sort.k === "name" ? x.name.localeCompare(y.name, "vi") * (sort.asc ? 1 : -1) : (val(x) - val(y)) * (sort.asc ? 1 : -1));
  const H = ({
    k,
    children
  }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1 hover:text-foreground", onClick: () => setSort({
    k,
    asc: sort.k === k ? !sort.asc : k === "resp" || k === "proc"
  }), children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-3 w-3" })
  ] });
  const done = (r) => r.filter((x) => x.status === "answered");
  const inS = (r) => done(r).filter((x) => inSpeed(measureOf(x, f.measure), f.speed));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Lượt hoàn thành", value: a.done, onClick: () => onDrill({
        title: "Lượt hoàn thành",
        rows: done(rows)
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Cung ứng xử lý trung bình", hint: EXPLAIN.process, value: dur(a.avgProcess, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Phản hồi trung bình", hint: EXPLAIN.response, value: dur(a.avgResponse, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SpeedStat, { a, f, onClick: () => onDrill({
        title: `Hoàn thành ${speedLabel(f.speed)}`,
        rows: inS(rows)
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DistributionCard, { rows, measure: f.measure, onDrill }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Hiệu suất nhân viên Cung ứng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ghi nhận theo người phụ trách khi hoàn tất lượt. Số liệu tham khảo, không phải đánh giá. Bấm tên để xem chi tiết, bấm số để xem danh sách lượt." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 sm:p-0", children: list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-sm text-muted-foreground", children: "Không có dữ liệu trong kỳ." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(H, { k: "name", children: "Nhân viên" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Được giao" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Đã tiếp nhận" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(H, { k: "done", children: "Báo giá HT" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Tiến độ HT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Chưa HT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(H, { k: "resp", children: "Phản hồi TB" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(H, { k: "proc", children: "Xử lý TB" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Xử lý trung vị" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(H, { k: "inS", children: "Trong ngưỡng" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(H, { k: "rate", children: "Tỷ lệ" }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sorted.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "font-medium hover:underline text-left", onClick: () => onStaff(s.id, s.name), children: s.name }),
              s.a.handovers > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                s.a.handovers,
                " lượt có chuyển giao"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { n: s.a.total, onClick: () => onDrill({
              title: `${s.name} — lượt được giao`,
              rows: s.rows
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { n: s.a.accepted, onClick: () => onDrill({
              title: `${s.name} — đã tiếp nhận`,
              rows: s.rows.filter((r) => r.accepted_at)
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { n: s.a.donePrice, onClick: () => onDrill({
              title: `${s.name} — báo giá hoàn thành`,
              rows: done(s.rows).filter((r) => r.kind === "price")
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { n: s.a.doneProgress, onClick: () => onDrill({
              title: `${s.name} — tiến độ hoàn thành`,
              rows: done(s.rows).filter((r) => r.kind === "progress")
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { n: s.a.open, onClick: () => onDrill({
              title: `${s.name} — chưa hoàn thành`,
              rows: s.rows.filter((r) => !["answered", "cancelled"].includes(r.status))
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right whitespace-nowrap", children: dur(s.a.avgResponse, s.a.done) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right whitespace-nowrap", children: dur(s.a.avgProcess, s.a.done) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right whitespace-nowrap", children: dur(s.a.medProcess, s.a.done) }),
            f.speed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { n: s.a.inSpeed, suffix: `/${s.den}`, onClick: () => onDrill({
              title: `${s.name} — hoàn thành ${speedLabel(f.speed)}`,
              rows: inS(s.rows)
            }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-muted-foreground", children: "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: f.speed ? pct(s.a.inSpeed, s.den) : "—" })
          ] }, s.id)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden divide-y", children: sorted.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full text-left p-3 active:bg-accent", onClick: () => onStaff(s.id, s.name), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Báo giá hoàn thành" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: s.a.donePrice }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Xử lý TB" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: dur(s.a.avgProcess, s.a.done) }),
            f.speed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Trong ngưỡng" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                s.a.inSpeed,
                "/",
                s.den,
                " · ",
                pct(s.a.inSpeed, s.den)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa hoàn thành" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.a.open })
          ] })
        ] }, s.id)) })
      ] }) })
    ] })
  ] });
}
function Num({
  n,
  onClick,
  suffix = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: n ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: "text-primary underline-offset-2 hover:underline font-medium", children: [
    n,
    suffix
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
    "0",
    suffix
  ] }) });
}
function Sales({
  rows,
  onStaff
}) {
  const list = groupBy(rows, "creator_id").map((g) => {
    const done = g.rows.filter((r) => r.status === "answered");
    const resp = done.map((r) => r.response_sec).filter((v) => v != null);
    return {
      ...g,
      price: new Set(g.rows.filter((r) => r.kind === "price").map((r) => r.request_id)).size,
      progress: new Set(g.rows.filter((r) => r.kind === "progress").map((r) => r.request_id)).size,
      done: done.length,
      open: g.rows.filter((r) => !["answered", "cancelled"].includes(r.status)).length,
      info: g.rows.filter((r) => r.info_count > 0).length,
      wait: resp.length ? resp.reduce((a, b) => a + b, 0) / resp.length : null
    };
  }).sort((a, b) => b.rows.length - a.rows.length);
  if (!list.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có dữ liệu trong kỳ." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Nhân viên Sale" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Yêu cầu Hỏi Giá" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Yêu cầu Hỏi Tiến Độ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Lượt hoàn thành" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Lượt chưa HT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Lượt phải bổ sung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Chờ báo giá TB" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: list.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "cursor-pointer", onClick: () => onStaff(s.id, s.name), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: s.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: s.price }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: s.progress }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: s.done }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: s.open }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: s.info }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right whitespace-nowrap", children: dur(s.wait, s.done) })
      ] }, s.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden divide-y", children: list.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full text-left p-3 active:bg-accent", onClick: () => onStaff(s.id, s.name), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: s.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hỏi Giá / Tiến Độ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          s.price,
          " / ",
          s.progress,
          " yêu cầu"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hoàn thành / chưa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          s.done,
          " / ",
          s.open,
          " lượt"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chờ báo giá TB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dur(s.wait, s.done) })
      ] })
    ] }, s.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground p-3", children: 'Yêu cầu Hỏi Giá/Tiến Độ đếm theo yêu cầu gốc; hoàn thành/chưa/bổ sung đếm theo lượt xử lý. "Chờ báo giá TB" = thời gian phản hồi trung bình của lượt đã hoàn thành.' })
  ] }) });
}
function StaffDetail({
  title,
  rows,
  f,
  isSale,
  onDrill
}) {
  const a = aggregate(rows, f);
  const den = speedDenominator(a, f.measure);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        isSale ? "Các yêu cầu đã gửi" : "Hiệu suất Cung ứng",
        " trong bộ lọc hiện tại."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: isSale ? "Lượt đã gửi" : "Lượt được giao", value: a.total }),
      !isSale && /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đã tiếp nhận", value: a.accepted }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đã hoàn thành", value: a.done }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chưa hoàn thành", value: a.open }),
      !isSale && /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chờ tiếp nhận TB", hint: EXPLAIN.accept, value: dur(a.avgAcceptWait, a.accepted) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Phản hồi TB", hint: EXPLAIN.response, value: dur(a.avgResponse, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Cung ứng xử lý TB", hint: EXPLAIN.process, value: dur(a.avgProcess, a.done) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Cung ứng xử lý trung vị", value: dur(a.medProcess, a.done) }),
      f.speed && /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: `Trong ngưỡng ${speedLabel(f.speed)}`, value: den ? `${a.inSpeed}/${den} · ${pct(a.inSpeed, den)}` : "—" }),
      !isSale && /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Lượt có chuyển giao", value: a.handovers, onClick: a.handovers ? () => onDrill({
        title: `${title} — có chuyển giao`,
        rows: rows.filter((r) => r.handover)
      }) : void 0 })
    ] }),
    !isSale && /* @__PURE__ */ jsxRuntimeExports.jsx(DistributionCard, { rows, measure: f.measure, onDrill }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full", variant: "outline", onClick: () => onDrill({
      title: `${title} — tất cả lượt`,
      rows
    }), children: [
      "Xem danh sách ",
      rows.length,
      " lượt"
    ] })
  ] });
}
function DetailList({
  drill,
  measure,
  onBack
}) {
  const [q, setQ] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(0);
  const [sort, setSort] = reactExports.useState({
    k: "sent",
    asc: false
  });
  const SIZE = 20;
  const s = q.trim().toLowerCase();
  const list = drill.rows.filter((r) => !s || [r.flow_code, r.title, r.creator_name, r.assignee_name].some((x) => x?.toLowerCase().includes(s))).sort((x, y) => {
    const v = (r) => sort.k === "sent" ? Date.parse(r.sent_at) : (sort.k === "resp" ? r.response_sec : r.process_sec) ?? Infinity;
    return (v(x) - v(y)) * (sort.asc ? 1 : -1);
  });
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const view = list.slice(page * SIZE, page * SIZE + SIZE);
  const proc = (r) => r.status !== "answered" ? "—" : r.data_ok ? fmtDur(r.process_sec) : "Chưa đủ dữ liệu";
  const link = (r, c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/order-quotes/$id", params: {
    id: r.request_id
  }, search: {
    flow: r.flow_id
  }, className: "hover:underline", children: c });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onBack, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
        "Quay lại báo cáo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: drill.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
        drill.rows.length,
        " lượt"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => {
          setQ(e.target.value);
          setPage(0);
        }, placeholder: "Mã, tên yêu cầu, Sale, Cung ứng", className: "pl-8 h-10" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: `${sort.k}:${sort.asc}`, onValueChange: (v) => {
        const [k, a] = v.split(":");
        setSort({
          k,
          asc: a === "true"
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-56 h-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent:false", children: "Mới gửi trước" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent:true", children: "Cũ trước" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "resp:true", children: "Phản hồi nhanh nhất" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "resp:false", children: "Phản hồi chậm nhất" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "proc:true", children: "Xử lý nhanh nhất" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "proc:false", children: "Xử lý chậm nhất" })
        ] })
      ] })
    ] }),
    list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có lượt phù hợp." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block rounded-lg border bg-card overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mã" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tên yêu cầu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sale" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cung ứng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "SP/PA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Lượt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sale gửi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tiếp nhận" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Hoàn thành" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Phản hồi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cung ứng xử lý" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Chờ Sale" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Trạng thái" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: view.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono whitespace-nowrap", children: link(r, r.flow_code) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate font-medium", children: link(r, r.title) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.creator_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            r.assignee_name,
            r.handover && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Có chuyển giao" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: r.items }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: r.round_no }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: vnDateTime(r.sent_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: r.final_accepted_at ? vnDateTime(r.final_accepted_at) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: r.completed_at && r.status === "answered" ? vnDateTime(r.completed_at) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: r.status === "answered" ? fmtDur(r.response_sec) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: proc(r) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: fmtDur(r.wait_sale_sec, "0") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap", children: STATUS_LABEL[r.status] })
        ] }, r.round_id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden space-y-2", children: view.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-quotes/$id", params: {
        id: r.request_id
      }, search: {
        flow: r.flow_id
      }, className: "block rounded-lg border bg-card p-3 active:bg-accent", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold line-clamp-2", children: r.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: r.flow_code })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
          KIND_LABEL[r.kind],
          " · Lượt ",
          r.round_no,
          " · ",
          STATUS_LABEL[r.status],
          r.handover ? " · Có chuyển giao" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Phản hồi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.status === "answered" ? fmtDur(r.response_sec) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cung ứng xử lý" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: proc(r) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sale / Cung ứng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            r.creator_name,
            " / ",
            r.assignee_name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sale gửi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: vnDateTime(r.sent_at) })
        ] })
      ] }, r.round_id)) }),
      pages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm", children: [
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Cách đo đang chọn: ",
      MEASURE_LABEL[measure],
      "."
    ] })
  ] });
}
function doExport(rows, f, range, mode) {
  const f2 = (s) => s.split("-").reverse().join("/");
  const vn = (iso) => iso ? vnDateTime(iso) : "";
  const title = `Báo cáo Hỏi Giá & Tiến Độ · ${f2(range[0])} – ${f2(range[1])} · ${BASIS_LABEL[f.basis]}`;
  const cond = [`Nghiệp vụ: ${f.kind === "all" ? "Tất cả" : KIND_LABEL[f.kind]}`, `Lượt: ${f.rounds === "all" ? "Tất cả lượt xử lý" : f.rounds === "first" ? "Lần hỏi đầu" : "Lượt hỏi lại"}`, `Trạng thái: ${f.statuses.length ? f.statuses.map((s) => STATUS_LABEL[s]).join(", ") : "Tất cả"}`, `Ngưỡng: ${f.speed ? speedLabel(f.speed) : "Không lọc"}`, `Cách đo: ${MEASURE_LABEL[f.measure]}`, `Xuất lúc ${vnDateTime((/* @__PURE__ */ new Date()).toISOString())} (giờ Việt Nam, UTC+7)`].join(" · ");
  const a = aggregate(rows, f);
  const wb = utils.book_new();
  const add = (name, aoa) => utils.book_append_sheet(wb, utils.aoa_to_sheet([[title], [cond], [], ...aoa]), name);
  add("Tổng quan", [["Chỉ số", "Giá trị", "Ghi chú"], ["Lượt Hỏi Giá", rows.filter((r) => r.kind === "price").length, "lượt xử lý"], ["Lượt Hỏi Tiến Độ", rows.filter((r) => r.kind === "progress").length, "lượt xử lý"], ["Báo giá hoàn thành", a.donePrice, ""], ["Tiến độ hoàn thành", a.doneProgress, ""], ["Chờ xác nhận", a.pending, ""], ["Đang xử lý", a.processing, ""], ["Chờ Sale bổ sung", a.waiting, ""], ["Phản hồi TB (phút)", toMin(a.avgResponse) ?? "Không có dữ liệu", "chỉ lượt hoàn thành"], ["Cung ứng xử lý TB (phút)", toMin(a.avgProcess) ?? "Không có dữ liệu", ""], ["Cung ứng xử lý trung vị (phút)", toMin(a.medProcess) ?? "Không có dữ liệu", ""], ...f.speed ? [[`Trong ngưỡng ${speedLabel(f.speed)}`, `${a.inSpeed}/${speedDenominator(a, f.measure)}`, pct(a.inSpeed, speedDenominator(a, f.measure))]] : []]);
  if (mode !== "sale") add("Hiệu suất Cung ứng", [["Nhân viên", "Được giao", "Đã tiếp nhận", "Báo giá HT", "Tiến độ HT", "Chưa HT", "Phản hồi TB (phút)", "Xử lý TB (phút)", "Xử lý trung vị (phút)", "Trong ngưỡng", "Tỷ lệ"], ...groupBy(rows, "assignee_id").map((g) => {
    const x = aggregate(g.rows, f), d = speedDenominator(x, f.measure);
    return [g.name, x.total, x.accepted, x.donePrice, x.doneProgress, x.open, toMin(x.avgResponse) ?? "", toMin(x.avgProcess) ?? "", toMin(x.medProcess) ?? "", f.speed ? `${x.inSpeed}/${d}` : "", f.speed ? pct(x.inSpeed, d) : ""];
  })]);
  if (mode === "sale" || mode === "overview") add("Theo Sale", [["Nhân viên Sale", "Lượt gửi", "Lượt hoàn thành", "Lượt chưa HT", "Lượt phải bổ sung", "Phản hồi TB (phút)"], ...groupBy(rows, "creator_id").map((g) => {
    const x = aggregate(g.rows, f);
    return [g.name, x.total, x.done, x.open, x.infoRounds, toMin(x.avgResponse) ?? ""];
  })]);
  add("Chi tiết lượt", [["Mã", "Tên yêu cầu", "Nghiệp vụ", "Sale", "Cung ứng", "Có chuyển giao", "SP/PA", "Lượt", "Sale gửi", "Tiếp nhận", "Hoàn thành", "Phản hồi", "Phản hồi (phút)", "Cung ứng xử lý", "Cung ứng xử lý (phút)", "Chờ Sale (phút)", "Trạng thái"], ...rows.map((r) => [r.flow_code, r.title, KIND_LABEL[r.kind], r.creator_name, r.assignee_name, r.handover ? "Có" : "", r.items, r.round_no, vn(r.sent_at), vn(r.final_accepted_at), r.status === "answered" ? vn(r.completed_at) : "", r.status === "answered" ? fmtDur(r.response_sec) : "", r.status === "answered" ? toMin(r.response_sec) : "", r.status === "answered" ? r.data_ok ? fmtDur(r.process_sec) : "Chưa đủ dữ liệu" : "", r.status === "answered" ? toMin(r.process_sec) : "", toMin(r.wait_sale_sec), STATUS_LABEL[r.status]])]);
  writeFileSync(wb, `bao-cao-hoi-gia-tien-do_${range[0]}_${range[1]}.xlsx`);
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["oq.report_own", "oq.report_all"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Report, {}) });
export {
  SplitComponent as component
};
