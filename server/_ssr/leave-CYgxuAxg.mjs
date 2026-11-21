import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useCurrentUser, F as useAuth, B as Button, P as PageHeader, C as Card, o as CardContent, I as Input, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter, L as Label, j as cn, l as Badge } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { w as withDeadline, a as leaveReadMessage, b as leaveRetryDelay, r as retryLeaveRead, g as getSettings, c as listRequests, d as leaveListKey, L as LeaveSettings, e as leaveListScope, S as STATUS_LABEL, f as getRequest, h as getHistory, i as listApprovers, j as leaveActorQuery, A as ACTION_LABEL, k as decide, m as recall, n as cancelRequest, o as cancelDecide, p as reassign, q as exceptionCancel, l as leaveErr, s as submitRequest, u as updateRequest, t as resubmitRequest } from "./LeaveSettings-DoiRb7lN.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { L as LeaveReport } from "./LeaveReport-wYBmfLxZ.mjs";
import { F as FunctionSettingsButton, a as FunctionSettingsDialog, L as LEAVE_PERSONAL_PERMS, c as LEAVE_PERM_CATEGORIES } from "./FunctionSettings-CX6UiV0J.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as TYPE_LABEL, f as fmtVn, D as DOW_LABEL, i as isoDow, a as fmtDate, b as fmtDays, t as todayVn, d as firstWorkingHalf, l as lastWorkingHalf, e as evaluate, g as deadlineOf, h as deadlineRule, H as HALF_LABEL } from "./calc-BK6sHnP3.mjs";
import "../_libs/seroval.mjs";
import { a6 as Plus, I as CalendarDays, as as Clock, L as LogOut, s as ChevronRight, aV as TriangleAlert, aR as History } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
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
import "./zaloGroupMessage-kyI4Tfnt.mjs";
import "./attendance-Br4iDv6M.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const LEAVE_ACCESS_KEYS = ["leave.view_own", "leave.create", "leave.view_assigned", "leave.approve", "leave.view_all", "leave.report", "leave.view_unit"];
function leaveAccessState(actor, active, admin, verifiedActor, allowed, failed) {
  if (!actor || !active) return "denied";
  if (admin) return "ready";
  if (actor !== verifiedActor) return failed ? "error" : "pending";
  return allowed ? "ready" : "denied";
}
function validLeaveTab(current, tabs) {
  return tabs.includes(current) ? current : tabs[0] ?? "mine";
}
const QUICK = [5, 10, 15, 20, 25, 30, 60];
const LAST_APPROVER = "leave_last_approver";
const STATUS_CLS = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  recalled: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through"
};
function useNames() {
  const users = useAuth((s) => s.users);
  return reactExports.useMemo(() => {
    const m = new Map(users.map((u) => [u.id, u.fullName || u.username]));
    return (id) => id ? m.get(id) || "—" : "—";
  }, [users]);
}
function summary(r) {
  const p = r.payload || {};
  if (r.type === "leave") {
    const a = `${HALF_LABEL[p.start_half]} ${fmtDate(p.start_date)}`;
    const b = `hết ${HALF_LABEL[p.end_half].toLowerCase()} ${fmtDate(p.end_date)}`;
    return `${a} → ${b} · ${fmtDays(Number(r.calc?.days ?? 0))} ngày`;
  }
  const exp = r.calc?.expected_at ? fmtVn(r.calc.expected_at, false) : "";
  return `${fmtDate(p.date)} (${HALF_LABEL[p.half]}) · ${p.minutes} phút · ${r.type === "late" ? "có mặt" : "ra về"} ${exp}`;
}
function StatusBadge({ r }) {
  const overdue = r.status === "pending" && new Date(r.mark_at) <= /* @__PURE__ */ new Date();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: STATUS_CLS[r.status], children: STATUS_LABEL[r.status] }),
    r.is_late && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-warning/50 bg-warning/10 text-warning-foreground", children: "Đơn bổ sung" }),
    r.cancel_state === "requested" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-warning/40", children: "Yêu cầu hủy" }),
    r.cancel_state === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Từ chối hủy" }),
    overdue && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-destructive/40 text-destructive", children: "Đã qua thời điểm đăng ký" }),
    r.submission_no > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
      "Lần gửi ",
      r.submission_no
    ] })
  ] });
}
function LeavePage() {
  const { user, can } = useCurrentUser();
  const qc = useQueryClient();
  const name = useNames();
  const uid = user?.id;
  const settingsQ = useQuery({ queryKey: ["leave", "settings", uid], queryFn: ({ signal }) => getSettings({ signal }), enabled: !!uid, retry: retryLeaveRead, retryDelay: leaveRetryDelay });
  const showMine = can("leave.view_own") || can("leave.create");
  const showApprove = can("leave.view_assigned") || can("leave.approve");
  const showManage = can("leave.view_all") || can("leave.view_unit");
  const showReport = can("leave.report");
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const att = initial?.get("att");
    if (att) navigate({ to: "/attendance", search: { att }, replace: true });
    else if (initial?.get("tab") === "att") navigate({ to: "/attendance", replace: true });
  }, []);
  const [tab, setTab] = reactExports.useState(() => initial?.get("tab") || (showMine ? "mine" : showApprove ? "approve" : showManage ? "manage" : "report"));
  const [openId, setOpenId] = reactExports.useState(() => initial?.get("open") || null);
  const [form, setForm] = reactExports.useState(null);
  const [settingsOpen, setSettingsOpen] = reactExports.useState(false);
  const [mineFilter, setMineFilter] = reactExports.useState("all");
  const scope = leaveListScope(tab, { mine: showMine, approve: showApprove, manage: showManage, report: showReport });
  const listQ = useQuery({ queryKey: leaveListKey(uid, scope), queryFn: ({ signal }) => {
    if (!uid || !scope) throw new Error("Cần đăng nhập và quyền xem phù hợp.");
    return listRequests({ scope, uid, signal });
  }, enabled: !!uid && !!scope, retry: retryLeaveRead, retryDelay: leaveRetryDelay });
  const all = listQ.data || [];
  const listState = { loading: listQ.isLoading, error: listQ.isError ? leaveReadMessage(listQ.error) : null, onRetry: () => {
    void listQ.refetch();
  } };
  const cachedApprove = qc.getQueryData(leaveListKey(uid, "approve"));
  reactExports.useEffect(() => {
    const tabs = [showMine && "mine", showApprove && "approve", showManage && "manage", showReport && "report"].filter((t) => !!t);
    setTab((current) => validLeaveTab(current, tabs));
  }, [showMine, showApprove, showManage, showReport]);
  const refresh = () => qc.invalidateQueries({ predicate: (q) => leaveActorQuery(q.queryKey, uid) });
  const mine = scope === "mine" ? all.filter((r) => r.owner_id === uid) : [];
  const toApprove = scope === "approve" ? all.filter((r) => r.approver_id === uid && r.owner_id !== uid) : [];
  const pendingApprove = (scope === "approve" ? toApprove : cachedApprove || []).filter((r) => r.approver_id === uid && r.owner_id !== uid && (r.status === "pending" || r.cancel_state === "requested")).length;
  const setOpen = (id) => {
    setOpenId(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("open", id);
    else u.searchParams.delete("open");
    window.history.replaceState(null, "", u.toString());
  };
  const settings = settingsQ.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leave-mobile min-w-0 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Nghỉ phép & Đi sớm muộn",
        description: "Nghỉ phép, đi muộn, về sớm — gửi đơn và theo dõi phê duyệt.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          can("leave.settings") && /* @__PURE__ */ jsxRuntimeExports.jsx(FunctionSettingsButton, { onClick: () => setSettingsOpen(true) }),
          (can("leave.create") || can("leave.create_for")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setForm({ mode: "create" }), disabled: !settings, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Tạo đơn"
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden space-y-3", children: [
      can("leave.settings") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FunctionSettingsButton, { onClick: () => setSettingsOpen(true) }) }),
      (can("leave.create") || can("leave.create_for")) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: Object.keys(TYPE_LABEL).map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: !settings, className: "h-auto min-h-24 min-w-0 flex-col gap-2 whitespace-normal rounded-lg bg-card px-1 py-3", onClick: () => setForm({ mode: "create", type }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TypeIcon, { type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: TYPE_LABEL[type] })
      ] }, type)) })
    ] }),
    settingsQ.isError && !settings && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: `Chưa tải được cài đặt nên tạm chưa tạo đơn: ${leaveReadMessage(settingsQ.error)}`, onRetry: () => {
      void settingsQ.refetch();
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "max-md:flex max-md:w-full max-md:justify-start max-md:overflow-x-auto max-md:flex-nowrap max-md:min-h-11 md:flex-wrap h-auto", children: [
        showMine && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mine", children: "Đơn của tôi" }),
        showApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "approve", children: [
          "Chờ tôi duyệt",
          pendingApprove > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5", children: pendingApprove })
        ] }),
        showManage && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "manage", children: "Quản lý đơn" }),
        showReport && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "report", children: "Báo cáo" })
      ] }),
      showMine && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "mine", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden flex gap-1 overflow-x-auto mb-3", children: [["all", "Tất cả"], ["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["other", "Khác"]].map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "min-h-11 shrink-0", variant: mineFilter === value ? "default" : "outline", onClick: () => setMineFilter(value), children: label }, value)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequestList, { rows: [...mine].filter((r) => mineFilter === "all" || r.status === mineFilter || mineFilter === "other" && !["pending", "approved"].includes(r.status)).sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending")), ...listState, onOpen: setOpen, name, showOwner: false, empty: "Không có đơn phù hợp." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequestList, { rows: mine, ...listState, onOpen: setOpen, name, showOwner: false, empty: "Bạn chưa có đơn nghỉ phép, đi muộn, về sớm." }) })
      ] }),
      showApprove && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approve", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApproveList, { rows: toApprove, ...listState, onOpen: setOpen, name }) }),
      showManage && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "manage", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ManageList, { rows: all, ...listState, onOpen: setOpen, name }) }),
      showReport && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "report", className: "mt-4", children: listQ.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: leaveReadMessage(listQ.error), onRetry: listState.onRetry }) : listQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-sm text-muted-foreground", children: "Đang tải…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveReport, { rows: all, name }) })
    ] }),
    openId && settings && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DetailSheet,
      {
        id: openId,
        settings,
        name,
        onClose: () => setOpen(null),
        onChanged: refresh,
        onEdit: (r, mode) => setForm({ mode, request: r })
      }
    ),
    form && settings && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormDialog,
      {
        state: form,
        settings,
        onClose: () => setForm(null),
        onDone: (id) => {
          setForm(null);
          refresh();
          if (id) setOpen(id);
        }
      }
    ),
    settingsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FunctionSettingsDialog,
      {
        open: true,
        title: "Cài đặt — Nghỉ phép & Đi sớm muộn",
        categories: LEAVE_PERM_CATEGORIES,
        personal: LEAVE_PERSONAL_PERMS,
        rules: /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveSettings, { mode: "leave" }),
        onClose: () => setSettingsOpen(false)
      }
    )
  ] });
}
function LoadError({ message, onRetry }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { role: "alert", className: "border-destructive/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center justify-between gap-3 py-4 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: message }),
    onRetry && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onRetry, children: "Thử lại" })
  ] }) });
}
function RequestList({ rows, loading, error, onRetry, onOpen, name, showOwner, empty }) {
  if (error) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: error, onRetry });
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: "Đang tải…" });
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-sm text-muted-foreground", children: empty }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpen(r.id), className: "h-auto w-full whitespace-normal text-left rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TypeIcon, { type: r.type }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-2 text-sm font-medium", children: [
        TYPE_LABEL[r.type],
        showOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
          "· ",
          name(r.owner_id)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground max-md:whitespace-normal max-md:break-words md:truncate", children: summary(r) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
        r.reason_name,
        " · Người duyệt: ",
        name(r.approver_id)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { r }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground mt-1 shrink-0" })
  ] }) }, r.id)) });
}
function TypeIcon({ type }) {
  const I = type === "leave" ? CalendarDays : type === "late" ? Clock : LogOut;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(I, { className: "h-4 w-4" }) });
}
function ApproveList({ rows, ...rest }) {
  const [f, setF] = reactExports.useState("todo");
  const todo = rows.filter((r) => r.status === "pending" || r.cancel_state === "requested");
  const done = rows.filter((r) => !(r.status === "pending" || r.cancel_state === "requested"));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: f === "todo" ? "default" : "outline", onClick: () => setF("todo"), children: [
        "Cần xử lý (",
        todo.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: f === "done" ? "default" : "outline", onClick: () => setF("done"), children: [
        "Đã xử lý (",
        done.length,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RequestList, { rows: f === "todo" ? todo : done, showOwner: true, empty: f === "todo" ? "Không có đơn nào chờ bạn duyệt." : "Chưa có đơn nào.", ...rest })
  ] });
}
function ManageList({ rows, ...rest }) {
  const [st, setSt] = reactExports.useState("all");
  const [tp, setTp] = reactExports.useState("all");
  const [q, setQ] = reactExports.useState("");
  const shown = rows.filter((r) => (st === "all" || r.status === st || st === "cancel_req" && r.cancel_state === "requested" || st === "late" && r.is_late) && (tp === "all" || r.type === tp) && (!q || rest.name(r.owner_id).toLowerCase().includes(q.toLowerCase())));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm nhân viên…", value: q, onChange: (e) => setQ(e.target.value), className: "w-full sm:w-56" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: st, onValueChange: setSt, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái" }),
          Object.keys(STATUS_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: STATUS_LABEL[k] }, k)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "late", children: "Đơn bổ sung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancel_req", children: "Có yêu cầu hủy" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tp, onValueChange: setTp, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi loại đơn" }),
          Object.keys(TYPE_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: TYPE_LABEL[k] }, k))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RequestList, { rows: shown, showOwner: true, empty: "Không có đơn phù hợp.", ...rest })
  ] });
}
const LATE_SUGGESTIONS = [
  "Ốm đột xuất, không thể gửi đơn trước",
  "Việc gia đình khẩn cấp",
  "Sự cố giao thông",
  "Phát sinh công việc bất khả kháng"
];
function FormDialog({ state, settings, onClose, onDone }) {
  const { user, can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const r = state.request;
  const today = todayVn();
  const [type, setType] = reactExports.useState(r?.type || state.type || "leave");
  const [owner, setOwner] = reactExports.useState(r?.owner_id || user?.id || "");
  const [lp, setLp] = reactExports.useState(r?.type === "leave" ? r.payload : { start_date: today, start_half: "am", end_date: today, end_half: "pm" });
  const [sp, setSp] = reactExports.useState(r && r.type !== "leave" ? r.payload : { date: today, half: "am", minutes: 15 });
  const [custom, setCustom] = reactExports.useState(() => !!(r && r.type !== "leave" && !QUICK.includes(r.payload.minutes)));
  const [reasonId, setReasonId] = reactExports.useState(r?.reason_id || "");
  const [detail, setDetail] = reactExports.useState(r?.detail || "");
  const [approver, setApprover] = reactExports.useState(r?.approver_id || (typeof window !== "undefined" ? localStorage.getItem(LAST_APPROVER) || "" : ""));
  const [exception, setException] = reactExports.useState(r?.late_reason || "");
  const [busy, setBusy] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const [discarding, setDiscarding] = reactExports.useState(false);
  const [rangeMode, setRangeMode] = reactExports.useState("day");
  const [dirty, setDirty] = reactExports.useState(false);
  const close = () => {
    if (dirty && !busy) setDiscarding(true);
    else if (!busy) onClose();
  };
  const approversQ = useQuery({ queryKey: ["leave", "approvers", user?.id], queryFn: ({ signal }) => listApprovers({ signal }), enabled: !!user, retry: retryLeaveRead, retryDelay: leaveRetryDelay });
  const approvers = (approversQ.data || []).filter((a) => a.id !== owner);
  const canFor = can("leave.create_for") && state.mode === "create";
  reactExports.useEffect(() => {
    if (type === "leave") return;
    const h = type === "late" ? firstWorkingHalf(settings, sp.date) : lastWorkingHalf(settings, sp.date);
    if (h && !settings.schedule[String(isoDow(sp.date))]?.[sp.half]) setSp((x) => ({ ...x, half: h }));
  }, [type, sp.date]);
  const payload = type === "leave" ? lp : sp;
  const res = evaluate(settings, type, payload);
  const dl = res.ok ? deadlineOf(settings, type, res.markAt) : null;
  const late = !!dl && /* @__PURE__ */ new Date() > dl;
  const reasons = settings.reasons.filter((x) => x.active || x.id === r?.reason_id);
  const needDetail = reasonId === "other" && !detail.trim();
  const blocked = !res.ok || late && !exception.trim() || !reasonId || needDetail || !approver;
  const submit = async () => {
    setBusy(true);
    setErr(null);
    const f = { owner: owner === user?.id ? null : owner, type, payload, reasonId, detail, approver, exception: late ? exception : void 0 };
    try {
      let id;
      if (state.mode === "create") id = await submitRequest(f);
      else if (state.mode === "edit") await updateRequest(r.id, f);
      else await resubmitRequest(r.id, f);
      localStorage.setItem(LAST_APPROVER, approver);
      toast.success(state.mode === "edit" ? "Đã lưu thay đổi" : late ? "Đã gửi đơn bổ sung" : "Đã gửi đơn");
      onDone(id || r?.id);
    } catch (e) {
      setErr(leaveErr(e));
    } finally {
      setBusy(false);
    }
  };
  const title = state.mode === "create" ? "Tạo đơn" : state.mode === "edit" ? "Sửa đơn" : "Sửa và gửi lại";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: true, onOpenChange: (o) => !o && close(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "leave-mobile-dialog max-w-lg w-full md:max-h-[90vh] overflow-y-auto", onChangeCapture: () => setDirty(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: state.mode === "create" && state.type ? TYPE_LABEL[type] : title }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", onClickCapture: () => setDirty(true), children: [
        state.mode === "create" && !state.type && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: Object.keys(TYPE_LABEL).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: type === t ? "default" : "outline", className: "min-h-11", onClick: () => setType(t), children: TYPE_LABEL[t] }, t)) }),
        canFor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người đứng tên đơn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: owner, onValueChange: setOwner, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: users.filter((u) => u.status === "Đang hoạt động").map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: u.id, children: [
              u.fullName,
              u.id === user?.id ? " (tôi)" : ""
            ] }, u.id)) })
          ] })
        ] }),
        type === "leave" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden grid grid-cols-2 gap-2", children: [["day", "Cả ngày"], ["am", "Buổi sáng"], ["pm", "Buổi chiều"], ["range", "Nhiều ngày"]].map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: rangeMode === value ? "default" : "outline", className: "min-h-11", onClick: () => {
            setRangeMode(value);
            if (value !== "range") setLp({ ...lp, end_date: lp.start_date, start_half: value === "pm" ? "pm" : "am", end_half: value === "am" ? "am" : "pm" });
          }, children: label }, value)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "leave-start-date", children: "Ngày bắt đầu nghỉ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "leave-start-date", type: "date", value: lp.start_date, onChange: (e) => setLp({ ...lp, start_date: e.target.value, end_date: lp.end_date < e.target.value ? e.target.value : lp.end_date }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bắt đầu từ buổi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HalfPick, { value: lp.start_half, onChange: (v) => setLp({ ...lp, start_half: v }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 max-md:row-start-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "leave-end-date", children: "Ngày kết thúc nghỉ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "leave-end-date", type: "date", value: lp.end_date, min: lp.start_date, onChange: (e) => setLp({ ...lp, end_date: e.target.value }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nghỉ đến hết buổi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HalfPick, { value: lp.end_half, onChange: (v) => setLp({ ...lp, end_half: v }) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "leave-shift-date", children: [
                "Ngày xin ",
                type === "late" ? "đi muộn" : "về sớm"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "leave-shift-date", type: "date", value: sp.date, onChange: (e) => setSp({ ...sp, date: e.target.value }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ca làm việc" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HalfPick, { value: sp.half, onChange: (v) => setSp({ ...sp, half: v }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Thời gian ",
              type === "late" ? "đi muộn" : "về sớm"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
              QUICK.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: !custom && sp.minutes === m ? "default" : "outline", className: "max-md:min-h-11", onClick: () => {
                setCustom(false);
                setSp({ ...sp, minutes: m });
              }, children: [
                m,
                " phút"
              ] }, m)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: custom ? "default" : "outline", className: "max-md:min-h-11", onClick: () => setCustom(true), children: "Khác" })
            ] }),
            custom && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", inputMode: "numeric", min: 1, max: 480, value: sp.minutes || "", onChange: (e) => setSp({ ...sp, minutes: Number(e.target.value) }), placeholder: "Số phút", className: "w-32 mt-1.5" })
          ] })
        ] }),
        res.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/40 p-3 text-sm space-y-1", children: [
          type === "leave" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "md:hidden font-semibold", children: [
              "Bạn đăng ký nghỉ: ",
              fmtDays(res.days ?? 0),
              " ngày"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "leave-preview-details", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "md:hidden cursor-pointer py-2", children: "Chi tiết ngày / buổi" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: res.details?.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
                  DOW_LABEL[isoDow(d.date)],
                  " ",
                  fmtDate(d.date),
                  ": ",
                  d.am && d.pm ? "Cả ngày" : d.am ? "Buổi sáng" : "Buổi chiều"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  fmtDays(d.days),
                  " ngày"
                ] })
              ] }, d.date)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex border-t pt-1 font-semibold justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TỔNG CỘNG" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                fmtDays(res.days ?? 0),
                " NGÀY"
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Giờ ",
              type === "late" ? "bắt đầu" : "kết thúc",
              " buổi: ",
              type === "late" ? res.sessionStart : res.sessionEnd
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
              type === "late" ? "Dự kiến có mặt" : "Dự kiến ra về",
              ": ",
              fmtVn(res.expectedAt, false)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Thời gian ",
              type === "late" ? "đi muộn" : "về sớm",
              ": ",
              res.minutes,
              " phút"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground pt-1", children: [
            "Hạn cuối gửi: ",
            fmtVn(dl)
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive", children: res.error }),
        late && res.ok && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/50 bg-warning/10 p-3 text-sm space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-warning-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
            "Đơn bổ sung — gửi sau thời hạn quy định"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Theo quy định của công ty, ",
            deadlineRule(settings, type),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Thời điểm ",
            type === "leave" ? "bắt đầu nghỉ" : type === "late" ? "bắt đầu ca" : "dự kiến ra về",
            ": ",
            fmtVn(res.markAt)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "Hạn cuối gửi: ",
            fmtVn(dl)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Đơn này được gửi sau thời hạn quy định. Vui lòng nêu lý do gửi bổ sung để người phê duyệt xem xét." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Lý do gửi đơn bổ sung ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: LATE_SUGGESTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: exception === s ? "default" : "outline", onClick: () => setException(s), className: "max-md:min-h-11 h-auto whitespace-normal text-left rounded-lg px-2.5 py-2 text-xs", children: s }, s)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: exception, onChange: (e) => setException(e.target.value), rows: 2, placeholder: "Vì sao không nộp đơn đúng hạn…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reasonId, onValueChange: setReasonId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn lý do" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: reasons.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: x.id, children: [
              x.name,
              !x.active ? " (ngừng dùng)" : ""
            ] }, x.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-1.5", reasonId !== "other" && !detail && "max-md:hidden"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Chi tiết lý do",
            reasonId === "other" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: detail, onChange: (e) => setDetail(e.target.value), rows: 2, placeholder: "Diễn giải ngắn gọn (không cần nêu thông tin quá riêng tư)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phê duyệt" }),
          approversQ.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: leaveReadMessage(approversQ.error), onRetry: () => {
            void approversQ.refetch();
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: approvers.some((a) => a.id === approver) ? approver : "", onValueChange: setApprover, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: approversQ.isLoading ? "Đang tải…" : approvers.length ? "Chọn người duyệt" : "Chưa có ai được cấp quyền Phê duyệt đơn" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: approvers.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name }, a.id)) })
          ] })
        ] }),
        reasonId !== "other" && !detail && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "md:hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer py-2 text-sm", children: "Thêm chi tiết lý do" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Chi tiết lý do", value: detail, onChange: (e) => setDetail(e.target.value), rows: 2 })
        ] }),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive whitespace-pre-line", children: err })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "leave-form-footer gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: close, children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: blocked || busy || approver !== "" && !approvers.some((a) => a.id === approver), children: busy ? "Đang gửi…" : state.mode === "edit" ? "Lưu thay đổi" : state.mode === "resubmit" ? late ? "Gửi lại đơn bổ sung" : "Gửi xin duyệt lại" : late ? "Gửi đơn bổ sung" : "Gửi đơn" })
      ] })
    ] }),
    discarding && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: setDiscarding, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Bỏ thay đổi chưa gửi?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDiscarding(false), children: "Tiếp tục soạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: onClose, children: "Bỏ thay đổi" })
      ] })
    ] }) })
  ] });
}
function HalfPick({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5", children: ["am", "pm"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: value === h ? "default" : "outline", className: "max-md:min-h-11", onClick: () => onChange(h), children: HALF_LABEL[h] }, h)) });
}
function DetailSheet({ id, settings, name, onClose, onChanged, onEdit }) {
  const { user, can } = useCurrentUser();
  const q = useQuery({ queryKey: ["leave", "one", user?.id, id], queryFn: ({ signal }) => getRequest(id, { signal }), enabled: !!user, retry: retryLeaveRead, retryDelay: leaveRetryDelay });
  const h = useQuery({ queryKey: ["leave", "hist", user?.id, id], queryFn: ({ signal }) => getHistory(id, { signal }), enabled: !!user && !!q.data, retry: retryLeaveRead, retryDelay: leaveRetryDelay });
  const approversQ = useQuery({ queryKey: ["leave", "approvers", user?.id], queryFn: ({ signal }) => listApprovers({ signal }), enabled: !!user && can("leave.reassign"), retry: retryLeaveRead, retryDelay: leaveRetryDelay });
  const [act, setAct] = reactExports.useState(null);
  const [note, setNote] = reactExports.useState("");
  const [target, setTarget] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const r = q.data;
  const uid = user?.id;
  const now = /* @__PURE__ */ new Date();
  const run = async () => {
    if (!r || !act) return;
    setBusy(true);
    try {
      const k = act.kind;
      if (k === "approve") await decide(r.id, true, note);
      if (k === "reject") await decide(r.id, false, note);
      if (k === "recall") await recall(r.id);
      if (k === "cancel_req") await cancelRequest(r.id, note);
      if (k === "cancel_ok") await cancelDecide(r.id, true, note);
      if (k === "cancel_no") await cancelDecide(r.id, false, note);
      if (k === "reassign") await reassign(r.id, target, note);
      if (k === "exception") await exceptionCancel(r.id, note);
      toast.success("Đã cập nhật đơn");
      setAct(null);
      setNote("");
      setTarget("");
      q.refetch();
      h.refetch();
      onChanged();
    } catch (e) {
      toast.error(leaveErr(e));
      q.refetch();
    } finally {
      setBusy(false);
    }
  };
  const isOwner = r?.owner_id === uid;
  const isApprover = r?.approver_id === uid && !isOwner;
  const recallLimit = r ? new Date(new Date(r.mark_at).getTime() - (settings.recall_minutes?.[r.type] ?? 0) * 6e4) : now;
  const acts = r ? {
    approve: r.status === "pending" && isApprover && can("leave.approve"),
    recall: r.status === "pending" && isOwner && can("leave.recall") && now < recallLimit,
    edit: r.status === "pending" && (isOwner && can("leave.edit_own") || can("leave.edit_others")),
    resubmit: r.status === "rejected" && (isOwner && can("leave.edit_own") || can("leave.edit_others")),
    cancelReq: r.status === "approved" && isOwner && r.cancel_state !== "requested" && now < new Date(r.mark_at),
    cancelHandle: r.status === "approved" && r.cancel_state === "requested" && !isOwner && can("leave.cancel_handle") && (isApprover || can("leave.view_all")),
    reassign: r.status === "pending" && can("leave.reassign"),
    exception: (r.status === "pending" || r.status === "approved") && !isOwner && can("leave.exception")
  } : null;
  const needNote = act && ["reject", "cancel_req", "cancel_no", "exception"].includes(act.kind);
  const actTitle = {
    approve: "Xác nhận phê duyệt đơn?",
    reject: "Từ chối đơn — lý do (bắt buộc)",
    recall: "Thu hồi đơn này?",
    cancel_req: "Yêu cầu hủy đơn — lý do (bắt buộc)",
    cancel_ok: "Chấp thuận yêu cầu hủy?",
    cancel_no: "Từ chối yêu cầu hủy — lý do (bắt buộc)",
    reassign: "Chuyển người duyệt",
    exception: "Xử lý ngoại lệ: hủy đơn — lý do (bắt buộc)"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "leave-mobile-sheet w-full h-full max-w-none sm:max-w-xl overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: r ? `Đơn ${TYPE_LABEL[r.type].toLowerCase()}` : "Chi tiết đơn" }) }),
      q.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: leaveReadMessage(q.error), onRetry: () => {
        void q.refetch();
      } }) : q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-6", children: "Đang tải…" }) : !r ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Không thể mở đơn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Đơn không tồn tại hoặc bạn không có quyền xem đơn này." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4 text-sm", children: [
        h.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: `Chưa tải được lịch sử: ${leaveReadMessage(h.error)}`, onRetry: () => {
          void h.refetch();
        } }),
        approversQ.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadError, { message: leaveReadMessage(approversQ.error), onRetry: () => {
          void approversQ.refetch();
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { r }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-[100px_minmax(0,1fr)] md:grid-cols-[120px_1fr] gap-x-2 gap-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Người đứng tên" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: name(r.owner_id) }),
          r.created_by !== r.owner_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Người tạo hộ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: name(r.created_by) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Thời gian" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: summary(r) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Lý do" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: r.reason_name }),
          r.detail && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Chi tiết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-line", children: r.detail })
          ] }),
          r.is_late && r.late_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Lý do gửi bổ sung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-line", children: r.late_reason })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Người duyệt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: name(r.approver_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Gửi lúc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: fmtVn(r.submitted_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Hạn cuối gửi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: r.applied?.deadline_at ? fmtVn(r.applied.deadline_at) : "—" }),
          r.decided_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-muted-foreground", children: [
              r.status === "rejected" ? "Từ chối" : "Xử lý",
              " bởi"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
              name(r.decided_by),
              " · ",
              fmtVn(r.decided_at)
            ] })
          ] }),
          r.decision_note && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: r.status === "rejected" ? "Lý do từ chối" : "Ghi chú" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-line", children: r.decision_note })
          ] }),
          r.cancel_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Lý do yêu cầu hủy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: r.cancel_reason })
          ] })
        ] }),
        r.type === "leave" && r.calc?.details && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/40 p-3 space-y-1", children: [
          r.calc.details.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              DOW_LABEL[isoDow(d.date)],
              " ",
              fmtDate(d.date),
              ": ",
              d.am && d.pm ? "Cả ngày" : d.am ? "Buổi sáng" : "Buổi chiều"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              fmtDays(d.days),
              " ngày"
            ] })
          ] }, d.date)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-1 font-semibold flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TỔNG CỘNG" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              fmtDays(r.calc.days),
              " NGÀY"
            ] })
          ] })
        ] }),
        acts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          acts.approve && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAct({ kind: "approve" }), children: "Phê duyệt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct({ kind: "reject" }), children: "Từ chối" })
          ] }),
          acts.edit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onEdit(r, "edit"), children: "Sửa đơn" }),
          acts.resubmit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onEdit(r, "resubmit"), children: "Sửa và gửi lại" }),
          acts.recall && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct({ kind: "recall" }), children: "Thu hồi đơn" }),
          acts.cancelReq && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct({ kind: "cancel_req" }), children: "Yêu cầu hủy đơn" }),
          acts.cancelHandle && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAct({ kind: "cancel_ok" }), children: "Chấp thuận hủy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct({ kind: "cancel_no" }), children: "Từ chối hủy" })
          ] }),
          acts.reassign && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct({ kind: "reassign" }), children: "Chuyển người duyệt" }),
          acts.exception && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "text-destructive", onClick: () => setAct({ kind: "exception" }), children: "Ngoại lệ: hủy đơn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer py-2 font-medium", children: "Lịch sử gửi và xử lý" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryBlock, { type: r.type, subs: h.data?.subs || [], events: h.data?.events || [], name })
        ] })
      ] })
    ] }),
    act && r && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && setAct(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: actTitle[act.kind] }) }),
      act.kind === "reassign" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: target, onValueChange: setTarget, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn người duyệt mới" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (approversQ.data || []).filter((a) => a.id !== r.owner_id && a.id !== r.approver_id).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name }, a.id)) })
      ] }),
      (needNote || act.kind === "reassign" || act.kind === "approve") && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: note, onChange: (e) => setNote(e.target.value), rows: 3, placeholder: needNote ? "Nhập lý do" : "Ghi chú (không bắt buộc)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct(null), children: "Đóng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: run, disabled: busy || !!needNote && !note.trim() || act.kind === "reassign" && !target, children: busy ? "Đang xử lý…" : "Xác nhận" })
      ] })
    ] }) })
  ] });
}
function HistoryBlock({ type, subs, events, name }) {
  const RES = { approved: "Đã duyệt", rejected: "Từ chối", recalled: "Đã thu hồi", cancelled: "Đã hủy" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    subs.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold flex items-center gap-1.5 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
        "Các lần gửi"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: subs.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex flex-wrap items-center gap-2", children: [
          "Lần ",
          s.no,
          " · ",
          fmtVn(s.submitted_at),
          s.is_late && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-warning/50 bg-warning/10 text-warning-foreground", children: "Đơn bổ sung" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: summary({ type, payload: s.payload, calc: s.calc }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Lý do: ",
          s.reason_name,
          s.detail ? ` — ${s.detail}` : ""
        ] }),
        s.is_late && s.late_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Lý do gửi bổ sung: ",
          s.late_reason
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Người duyệt: ",
          name(s.approver_id),
          " · Kết quả: ",
          s.result ? RES[s.result] || s.result : "Chờ duyệt",
          s.note ? ` — ${s.note}` : ""
        ] })
      ] }, s.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-2", children: "Lịch sử xử lý" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-1.5 border-l pl-3", children: events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ACTION_LABEL[e.action] || e.action }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          " · ",
          name(e.actor_id),
          " · ",
          fmtVn(e.created_at)
        ] }),
        e.detail?.to && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
          "→ ",
          name(e.detail.to)
        ] }),
        (e.detail?.note || e.detail?.reason) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: e.detail.note || e.detail.reason })
      ] }, e.id)) })
    ] })
  ] });
}
function LeaveAccess() {
  const { user, isSuperAdmin, canAny } = useCurrentUser();
  const verifiedActor = useAuth((s) => s.baseAccess?.user_id);
  const refresh = useAuth((s) => s.refreshBaseAccess);
  const [failure, setFailure] = reactExports.useState(null);
  const [attempt, setAttempt] = reactExports.useState(0);
  const actor = user?.id;
  const matched = actor === verifiedActor;
  reactExports.useEffect(() => {
    setFailure(null);
    if (!actor || matched || isSuperAdmin) return;
    const ctl = new AbortController();
    withDeadline(() => refresh(attempt > 0), ctl.signal).then(() => {
      if (!ctl.signal.aborted && useAuth.getState().baseAccess?.user_id !== actor)
        setFailure("Chưa xác minh được quyền Nghỉ phép. Vui lòng thử lại.");
    }).catch((e) => {
      if (!ctl.signal.aborted) setFailure(`Chưa tải được quyền: ${leaveReadMessage(e)}`);
    });
    return () => ctl.abort();
  }, [actor, matched, isSuperAdmin, refresh, attempt]);
  const state = leaveAccessState(actor, user?.status === "Đang hoạt động", isSuperAdmin, verifiedActor, canAny(...LEAVE_ACCESS_KEYS), !!failure);
  if (state === "pending") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "py-12 text-center text-muted-foreground", children: "Đang xác minh quyền Nghỉ phép…" });
  if (state === "error") return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-3 py-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: failure }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAttempt((n) => n + 1), children: "Thử lại" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: LEAVE_ACCESS_KEYS, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeavePage, {}) });
}
const SplitComponent = LeaveAccess;
export {
  SplitComponent as component
};
