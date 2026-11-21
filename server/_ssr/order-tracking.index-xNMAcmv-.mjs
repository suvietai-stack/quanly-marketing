import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, l as Badge, j as cn, L as Label, I as Input, bt as Popover, bu as PopoverTrigger, bv as PopoverContent, N as Checkbox, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { o as otApi, f as fmtDate } from "./api-CEBEc05Q.mjs";
import { t as todayVN, r as reminders, O as ORDER_TYPE, B as BOARD_COLS, a as taskDue, K as KIND_LABEL, m as monthGrid, j as journey, d as daysLeft, i as isOverdue, b as ORDER_STATUS } from "./logic-DPbhOOeg.mjs";
import { u as usePeople } from "./hooks-3AszRTQI.mjs";
import "../_libs/seroval.mjs";
import { aO as CalendarClock, aV as TriangleAlert, aT as ChevronLeft, s as ChevronRight, f as Search, bx as Funnel, a6 as Plus, bd as Phone } from "../_libs/lucide-react.mjs";
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
function useData() {
  const orders = useQuery({ queryKey: ["ot", "orders"], queryFn: otApi.orders });
  const tasks = useQuery({ queryKey: ["ot", "allTasks"], queryFn: otApi.allTasks });
  const suppliers = useQuery({ queryKey: ["ot", "suppliers"], queryFn: otApi.suppliers });
  const byId = reactExports.useMemo(() => new Map((orders.data ?? []).map((o) => [o.id, o])), [orders.data]);
  const supName = reactExports.useMemo(() => new Map((suppliers.data ?? []).map((s) => [s.id, s.name])), [suppliers.data]);
  const live = reactExports.useMemo(() => (tasks.data ?? []).filter((t) => t.kind !== "intake" && t.status !== "skipped" && byId.get(t.order_id)?.status === "in_progress"), [tasks.data, byId]);
  return { loading: orders.isLoading || tasks.isLoading, orders: orders.data ?? [], byId, live, supName };
}
function useMineFilter() {
  const { user } = useCurrentUser();
  const [mine, setMine] = reactExports.useState(false);
  const keep = (t, o) => !mine || t.assignee_id === user?.id || o?.supply_id === user?.id || o?.sale_id === user?.id;
  const toggle = /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: mine, onCheckedChange: (v) => setMine(!!v) }),
    "Chỉ việc của tôi"
  ] });
  return { keep, toggle };
}
function ContactDate({ t }) {
  const { can, user } = useCurrentUser();
  const qc = useQueryClient();
  const allowed = can("ot.manage") || can("ot.stage_update") || t.assignee_id === user?.id && can("ot.task_update");
  if (t.status === "done") return null;
  if (!allowed) return t.contact_date ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
    "Liên hệ lại: ",
    fmtDate(t.contact_date)
  ] }) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 text-xs text-muted-foreground", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
    "Liên hệ lại",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-7 w-[140px] text-xs", value: t.contact_date ?? "", onChange: async (e) => {
      try {
        await otApi.setContact(t.id, e.target.value || null);
        await qc.invalidateQueries({ queryKey: ["ot"] });
        toast.success("Đã lưu ngày liên hệ lại.");
      } catch (err) {
        toast.error(err.message);
      }
    } })
  ] });
}
function TaskCard({ t, o, supName, name, today }) {
  const due = taskDue(t);
  const late = isOverdue(due, t.status === "done", today);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-md border bg-card p-3 text-sm space-y-1.5", late && "border-destructive"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-tracking/$id", params: { id: t.order_id }, className: "block hover:underline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono", children: o?.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium leading-snug", children: [
        KIND_LABEL[t.kind],
        " · ",
        o?.title
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground", children: [
      t.supplier_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "NCC: ",
        supName.get(t.supplier_id) ?? "—"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Phụ trách: ",
        name(t.assignee_id ?? o?.supply_id)
      ] }),
      due && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(late && "text-destructive font-medium"), children: [
        "Hạn: ",
        fmtDate(due),
        late && " · Quá hạn"
      ] }),
      o && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
        "Khách nhận: ",
        fmtDate(o.due_date)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContactDate, { t })
  ] });
}
function Board() {
  const d = useData();
  const people = usePeople();
  const f = useMineFilter();
  const today = todayVN();
  if (d.loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" });
  const ts = d.live.filter((t) => f.keep(t, d.byId.get(t.order_id)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      f.toggle,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Cập nhật trạng thái trong màn hình chi tiết đơn." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 snap-x", children: BOARD_COLS.map((c) => {
      const col = ts.filter((t) => t.status === c.key).sort((a, b) => (taskDue(a) ?? "9").localeCompare(taskDue(b) ?? "9"));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[280px] shrink-0 snap-start rounded-lg bg-muted/50 p-2 sm:w-[300px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between px-1 text-sm font-medium", children: [
          c.label,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: col.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: col.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-4 text-center text-xs text-muted-foreground", children: "Trống" }) : col.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { t, o: d.byId.get(t.order_id), supName: d.supName, name: people.name, today }, t.id)) })
      ] }, c.key);
    }) })
  ] });
}
const REM_LABEL = { overdue: "Quá hạn", today: "Đến hạn hôm nay", contact: "Cần liên hệ lại NCC" };
function Reminders() {
  const d = useData();
  const people = usePeople();
  const f = useMineFilter();
  const pend = useQuery({ queryKey: ["ot", "reschPending"], queryFn: otApi.pendingReschedules });
  const today = todayVN();
  if (d.loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" });
  const list = reminders(d.live.filter((t) => f.keep(t, d.byId.get(t.order_id))), today);
  const soon = d.orders.filter((o) => ["new", "in_progress"].includes(o.status) && o.due_date >= today && o.due_date <= new Date(Date.parse(today) + 3 * 864e5).toISOString().slice(0, 10));
  const rs = pend.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    f.toggle,
    rs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }),
        "Đề xuất điều chỉnh lịch chờ phản hồi (",
        rs.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: rs.map((r) => {
        const o = d.byId.get(r.order_id);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-tracking/$id", params: { id: r.order_id }, className: "hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: o?.code }),
          " ",
          o?.title,
          ": ",
          fmtDate(r.from_date),
          " → ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmtDate(r.proposed_date) })
        ] }) }, r.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-sm font-medium", children: [
        "Đơn có ngày khách nhận trong 3 ngày tới (",
        soon.length,
        ")"
      ] }),
      soon.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: soon.sort((a, b) => a.due_date.localeCompare(b.due_date)).map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-tracking/$id", params: { id: o.id }, className: "hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmtDate(o.due_date) }),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: o.code }),
        " ",
        o.title,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1", children: ORDER_TYPE[o.order_type] })
      ] }) }, o.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
        "Công việc cần xử lý (",
        list.length,
        ")"
      ] }),
      list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border bg-card p-4 text-sm text-muted-foreground", children: "Không có việc quá hạn, đến hạn hoặc cần liên hệ lại hôm nay." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: list.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-1 text-xs font-medium", r.type === "overdue" ? "text-destructive" : "text-primary"), children: [
          r.type === "overdue" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
          REM_LABEL[r.type],
          " · ",
          fmtDate(r.date)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { t: r.task, o: d.byId.get(r.task.order_id), supName: d.supName, name: people.name, today })
      ] }, r.task.id)) })
    ] })
  ] });
}
const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
function SupplyCalendar() {
  const d = useData();
  const f = useMineFilter();
  const today = todayVN();
  const [ym, setYm] = reactExports.useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [sel, setSel] = reactExports.useState(today);
  const events = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    const add = (day, e) => {
      if (!day) return;
      const k = day.slice(0, 10);
      m.set(k, [...m.get(k) ?? [], e]);
    };
    for (const o of d.orders) if (["new", "in_progress"].includes(o.status) && f.keep({ assignee_id: null }, o)) add(o.due_date, { label: `Khách nhận: ${o.code} ${o.title}`, order: o.id, late: o.due_date < today, kind: "due" });
    for (const t of d.live) {
      const o = d.byId.get(t.order_id);
      if (!f.keep(t, o) || t.status === "done") continue;
      const due = taskDue(t);
      add(due, { label: `${KIND_LABEL[t.kind]}: ${o?.code ?? ""}`, order: t.order_id, late: !!due && due < today, kind: "task" });
      if (t.contact_date) add(t.contact_date, { label: `Liên hệ lại NCC: ${o?.code ?? ""}`, order: t.order_id, late: false, kind: "contact" });
    }
    return m;
  }, [d.orders, d.live, d.byId, f, today]);
  if (d.loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" });
  const days = monthGrid(ym.y, ym.m);
  const mm = String(ym.m + 1).padStart(2, "0");
  const shift = (n) => setYm(({ y, m }) => {
    const t = m + n;
    return { y: y + Math.floor(t / 12), m: (t % 12 + 12) % 12 };
  });
  const picked = sel ? events.get(sel) ?? [] : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", onClick: () => shift(-1), "aria-label": "Tháng trước", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-[110px] text-center font-medium", children: [
        "Tháng ",
        mm,
        "/",
        ym.y
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", onClick: () => shift(1), "aria-label": "Tháng sau", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: f.toggle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-primary" }),
        "Ngày khách nhận"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-foreground/50" }),
        "Hạn công việc"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-accent-foreground/40 ring-1 ring-foreground/30" }),
        "Liên hệ lại NCC"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-destructive" }),
        "Quá hạn"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs", children: [
      WD.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted px-1 py-1.5 text-center font-medium", children: w }, w)),
      days.map((day) => {
        const ev = events.get(day) ?? [];
        const inMonth = day.slice(5, 7) === mm;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setSel(day),
            className: cn("min-h-[56px] bg-card p-1 text-left align-top sm:min-h-[92px]", !inMonth && "text-muted-foreground/60", sel === day && "ring-2 ring-inset ring-primary"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mb-0.5 text-[11px]", day === today && "font-bold text-primary"), children: Number(day.slice(8)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-0.5 sm:hidden", children: ev.slice(0, 6).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("h-1.5 w-1.5 rounded-full", e.late ? "bg-destructive" : e.kind === "due" ? "bg-primary" : e.kind === "contact" ? "ring-1 ring-foreground/30" : "bg-foreground/50") }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden space-y-0.5 sm:block", children: [
                ev.slice(0, 3).map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("truncate rounded px-1", e.late ? "bg-destructive/10 text-destructive" : e.kind === "due" ? "bg-primary/10 text-primary" : "bg-muted"), children: e.label }, i)),
                ev.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                  "+",
                  ev.length - 3
                ] })
              ] })
            ]
          },
          day
        );
      })
    ] }),
    sel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
        "Ngày ",
        fmtDate(sel)
      ] }),
      picked.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Không có lịch." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1 text-sm", children: picked.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-tracking/$id", params: { id: e.order }, className: cn("hover:underline", e.late && "text-destructive"), children: [
        e.label,
        e.late && " · Quá hạn"
      ] }) }, i)) })
    ] })
  ] });
}
const VIEW_PERMS = ["ot.view_own", "ot.view_all", "ot.create", "ot.task_view", "ot.supplier", "ot.manage"];
function OrderTracking() {
  const {
    can
  } = useCurrentUser();
  const canOrders = can("ot.view_own") || can("ot.view_all") || can("ot.manage") || can("ot.task_view") || can("ot.create");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Theo Dõi Đơn Hàng", description: "Hành trình thực hiện đơn hàng: tiếp nhận, đặt phôi, gia công, đóng gói, giao hàng." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: canOrders ? "today" : "suppliers", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "today", children: "Tổng quan" }),
        canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "board", children: "Kanban công việc" }),
        canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "calendar", children: "Lịch cung ứng" }),
        canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "orders", children: "Danh sách đơn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "suppliers", children: "Nhà cung cấp" })
      ] }) }),
      canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "today", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reminders, {}) }),
      canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "board", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Board, {}) }),
      canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "calendar", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SupplyCalendar, {}) }),
      canOrders && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "orders", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrderList, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "suppliers", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Danh mục Nhà cung cấp chung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Dữ liệu nhà cung cấp phục vụ Theo Dõi Đơn Hàng hiện được quản lý tập trung tại Mua Hàng & Giao Vận; Showroom, Kinh doanh tra cứu cùng một danh mục theo quyền." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/procurement/suppliers", children: "Mở Nhà cung cấp" }) })
      ] }) })
    ] })
  ] });
}
const STATUS_TABS = [["active", "Đang xử lý"], ["new", "Chưa tiếp nhận"], ["in_progress", "Đang thực hiện"], ["done", "Hoàn tất"], ["cancelled", "Đã hủy"], ["all", "Tất cả"]];
function OrderList() {
  const {
    can,
    user
  } = useCurrentUser();
  const people = usePeople();
  const orders = useQuery({
    queryKey: ["ot", "orders"],
    queryFn: otApi.orders
  });
  const tasks = useQuery({
    queryKey: ["ot", "allTasks"],
    queryFn: otApi.allTasks
  });
  const settings = useQuery({
    queryKey: ["ot", "settings"],
    queryFn: otApi.settings
  });
  const [tab, setTab] = reactExports.useState("active");
  const [q, setQ] = reactExports.useState("");
  const [type, setType] = reactExports.useState("all");
  const [mine, setMine] = reactExports.useState(false);
  const [creating, setCreating] = reactExports.useState(false);
  const today = todayVN();
  const rows = reactExports.useMemo(() => {
    const s = q.trim().toLowerCase();
    return (orders.data ?? []).filter((o) => (tab === "all" || (tab === "active" ? ["new", "in_progress"].includes(o.status) : o.status === tab)) && (type === "all" || o.order_type === type) && (!mine || [o.sale_id, o.supply_id, o.created_by].includes(user?.id ?? "")) && (!s || o.code.toLowerCase().includes(s) || o.title.toLowerCase().includes(s))).sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [orders.data, tab, type, mine, q, user?.id]);
  const nFilter = (type !== "all" ? 1 : 0) + (mine ? 1 : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-8", placeholder: "Tìm mã hoặc tên đơn…", value: q, onChange: (e) => setQ(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-4 w-4 mr-1" }),
          "Bộ lọc",
          nFilter ? ` (${nFilter})` : ""
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { className: "w-64 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại đơn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: setType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sample", children: "Đơn mẫu" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mass", children: "Sản xuất" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: mine, onCheckedChange: (v) => setMine(!!v) }),
            "Chỉ đơn tôi phụ trách"
          ] })
        ] })
      ] }),
      can("ot.create") && settings.data?.allow_manual && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreating(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Tạo đơn"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto pb-1", children: STATUS_TABS.map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(k), className: cn("whitespace-nowrap rounded-md px-3 py-1.5 text-sm", tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"), children: l }, k)) }),
    orders.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) : orders.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: orders.error.message }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-12 text-center text-sm text-muted-foreground", children: "Chưa có đơn hàng phù hợp." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: rows.map((o) => {
      const ts = (tasks.data ?? []).filter((t) => t.order_id === o.id);
      const j = journey(o, ts);
      const active = ["new", "in_progress"].includes(o.status);
      const dl = daysLeft(o.due_date, today);
      const lateTasks = ts.filter((t) => !["done", "skipped"].includes(t.status) && isOverdue(taskDue(t), false, today)).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-tracking/$id", params: {
        id: o.id
      }, className: cn("block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50", active && dl < 0 && "border-destructive/60"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: o.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: o.order_type === "sample" ? "outline" : "secondary", children: ORDER_TYPE[o.order_type] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto", children: ORDER_STATUS[o.status] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-medium line-clamp-2", children: o.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mt-3 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm", active && dl < 0 ? "bg-destructive/10 text-destructive" : active && dl <= 3 ? "bg-primary/10 text-primary" : "bg-muted"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Khách nhận: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmtDate(o.due_date) }),
            o.due_time ? ` ${o.due_time}` : ""
          ] }),
          active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs", children: dl < 0 ? `Quá ${-dl} ngày` : dl === 0 ? "Hôm nay" : `Còn ${dl} ngày` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-1", children: j.steps.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: s.label, className: cn("h-1.5 flex-1 rounded-full", s.done ? "bg-primary" : s.key === j.current && active ? "bg-primary/40" : "bg-muted") }, s.key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Đang ở: ",
            j.steps.find((s) => s.key === j.current)?.label ?? "Hoàn tất"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "KD: ",
            people.name(o.sale_id)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "CƯ: ",
            people.name(o.supply_id)
          ] }),
          lateTasks > 0 && active && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            lateTasks,
            " việc quá hạn"
          ] })
        ] })
      ] }, o.id);
    }) }),
    creating && /* @__PURE__ */ jsxRuntimeExports.jsx(CreateOrder, { people: people.list, onClose: () => setCreating(false) })
  ] });
}
function CreateOrder({
  people,
  onClose
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [f, setF] = reactExports.useState({
    order_type: "mass"
  });
  const [busy, setBusy] = reactExports.useState(false);
  const set = (k, v) => setF((p) => ({
    ...p,
    [k]: v
  }));
  const submit = async () => {
    if (!f.title?.trim()) return toast.error("Vui lòng nhập tên đơn hàng.");
    if (!f.due_date) return toast.error("Vui lòng chọn ngày khách nhận hàng.");
    setBusy(true);
    try {
      const id = await otApi.create(f);
      await qc.invalidateQueries({
        queryKey: ["ot"]
      });
      toast.success("Đã tạo đơn hàng.");
      navigate({
        to: "/order-tracking/$id",
        params: {
          id
        }
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const PersonSelect = ({
    k,
    pick
  }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f[k] ?? "", onValueChange: (v) => set(k, v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn người" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: people.filter(pick).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.full_name }, p.id)) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] overflow-y-auto sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo đơn thủ công" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mã đơn do Base tự sinh. Không nhập sản phẩm, giá hay thông tin khách hàng — những thông tin này nằm trên CRM." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["mass", "sample"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => set("order_type", t), className: cn("rounded-md border px-3 py-2 text-sm", f.order_type === t ? "border-primary bg-primary/10 font-medium" : ""), children: ORDER_TYPE[t] }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên đơn hàng *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.title ?? "", onChange: (e) => set("title", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_120px] gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày khách nhận hàng *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.due_date ?? "", onChange: (e) => set("due_date", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giờ nhận" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: f.due_time ?? "", onChange: (e) => set("due_time", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Địa chỉ giao hàng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.address ?? "", onChange: (e) => set("address", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kinh doanh phụ trách" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PersonSelect, { k: "sale_id", pick: (p) => p.sale })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cung ứng phụ trách" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PersonSelect, { k: "supply_id", pick: (p) => p.supply })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Liên kết đơn trên CRM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "url", placeholder: "https://…", value: f.crm_url ?? "", onChange: (e) => set("crm_url", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú triển khai" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.note ?? "", onChange: (e) => set("note", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy, children: "Tạo đơn" })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: VIEW_PERMS, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrderTracking, {}) });
export {
  SplitComponent as component
};
