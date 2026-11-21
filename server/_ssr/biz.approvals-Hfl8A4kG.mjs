import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { P as PageHeader, F as useAuth, u as useCurrentUser, br as approvalsQuery, B as Button, I as Input, l as Badge, bs as useOrganizationAction, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label } from "./router-CkmTURa-.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { b as bizLateRequestsQuery, u as useBizLateRequestDecide } from "./queries-D_iIARlF.mjs";
import { p as periodLabel, n as numberText, m as metricPercent, g as googleDocsOk } from "./documents-RNnMLtSC.mjs";
import { L as LateStatusBadge } from "./BizLateRequest-B_8jYATS.mjs";
import { a as approvalInTab, W as WORKFLOW_KINDS, b as approvalOverdue, o as orgDate, w as waitingText } from "./organization-DeUjSaZf.mjs";
import { f as fmtGoal, a as fmtQuarter } from "./goals-CPMRtvZ0.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import "../_libs/seroval.mjs";
import { aC as RefreshCw, ag as ExternalLink, q as Check, a7 as ShieldCheck } from "../_libs/lucide-react.mjs";
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
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "./deadline-D2Kxczjd.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const statusLabels = { pending: "Đang trình duyệt", approved: "Đã hoàn tất", changes: "Bị trả lại" };
function BizApprovals() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const { isSuperAdmin, can } = useCurrentUser();
  const query = useQuery(approvalsQuery(uid));
  const rows = query.data?.runs ?? [];
  const now = query.data?.server_now ?? (/* @__PURE__ */ new Date()).toISOString();
  const [tab, setTab] = reactExports.useState("mine");
  const [search, setSearch] = reactExports.useState("");
  const [filters, setFilters] = reactExports.useState({});
  const [fromDate, setFromDate] = reactExports.useState("");
  const [toDate, setToDate] = reactExports.useState("");
  const [selected, setSelectedRaw] = reactExports.useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("open") : null);
  const setSelected = (id) => {
    setSelectedRaw(id);
    try {
      const u = new URL(window.location.href);
      if (id) u.searchParams.set("open", id);
      else u.searchParams.delete("open");
      window.history.replaceState(null, "", u);
    } catch {
    }
  };
  const all = isSuperAdmin || can("biz.approval_view") || can("biz.view_all") || can("biz.view_dept");
  const shown = rows.filter((r) => approvalInTab(r, tab, uid) && r.employee_name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")) && (!fromDate || r.submitted_at >= fromDate) && (!toDate || r.submitted_at <= `${toDate}T23:59:59`) && Object.entries(filters).every(([k, v]) => !v || v === "all" || String(k === "year" ? r.content_snapshot.year : k === "step" ? r.current_step + 1 : k === "period" ? r.content_snapshot.period ?? 1 : r[k] ?? (k === "system_id" ? "legacy" : "")) === v));
  const run = rows.find((r) => r.id === selected);
  const selects = [["system_id", "Hệ", rows.map((r) => [r.system_id ?? "legacy", r.org_snapshot.system_name ?? "Chưa ánh xạ"])], ["department_id", "Phòng", rows.map((r) => [r.department_id, r.org_snapshot.department_name])], ["team_id", "Nhóm", rows.filter((r) => r.team_id).map((r) => [r.team_id ?? "", r.org_snapshot.team_name ?? "Nhóm"])], ["owner_id", "Nhân viên", rows.map((r) => [r.owner_id, r.employee_name])], ["kind", "Loại hồ sơ", Object.entries(WORKFLOW_KINDS)], ["year", "Năm", rows.map((r) => [String(r.content_snapshot.year), String(r.content_snapshot.year)])], ["period", "Tháng / Quý", Array.from({ length: 12 }, (_, i) => [String(i + 1), String(i + 1)])], ["status", "Trạng thái", Object.entries(statusLabels)], ["step", "Cấp", Array.from({ length: Math.max(1, ...rows.map((r) => r.steps.length)) }, (_, i) => [String(i + 1), `Cấp ${i + 1}`])]];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pb-32 sm:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 xl:grid-cols-5 gap-4 border-b pb-5", children: [["Chờ tôi xử lý", rows.filter((r) => r.can_act && r.status === "pending").length], ["Đang trình duyệt", rows.filter((r) => r.status === "pending").length], ["Đã hoàn tất", rows.filter((r) => r.status === "approved").length], ["Bị trả lại", rows.filter((r) => r.status === "changes").length], ["Quá hạn xử lý", rows.filter((r) => approvalOverdue(r, now)).length]].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-3xl tabular-nums text-primary", children: value })
    ] }, label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: tab, onValueChange: setTab, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-auto flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mine", children: "Chờ tôi xử lý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pending", children: "Đang trình duyệt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "processed", children: "Đã xử lý" }),
        all && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "Trong phạm vi quản lý" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Làm mới phê duyệt", onClick: () => query.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm tên nhân viên", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Tìm tên nhân viên…", className: "sm:max-w-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Gửi từ ngày", type: "date", className: "w-40", value: fromDate, onChange: (e) => setFromDate(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Gửi đến ngày", type: "date", className: "w-40", value: toDate, onChange: (e) => setToDate(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2", children: selects.map(([key, label, options]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filters[key] || "all", onValueChange: (v) => setFilters((f) => ({ ...f, [key]: v })), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "all", children: [
          "Tất cả ",
          label.toLowerCase()
        ] }),
        [...new Map(options.map(([id, name]) => [id, name])).entries()].map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name }, id))
      ] })
    ] }, key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LateRequestsSection, { uid }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải hồ sơ…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: query.error.message }),
    !query.isPending && !shown.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground py-10 border-y", children: "Không có hồ sơ phù hợp." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: shown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold break-words", children: [
          r.employee_name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: statusLabels[r.status] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground break-words", children: [r.org_snapshot.system_name, r.org_snapshot.department_name, r.org_snapshot.team_name].filter(Boolean).join(" / ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          r.content_snapshot.entity === "rolling_plan" ? "Điều chỉnh phân bổ tháng" : WORKFLOW_KINDS[r.kind],
          " · ",
          r.content_snapshot.period ? `${r.kind === "report_quarter" ? "Quý" : "Tháng"} ${r.content_snapshot.period} / ` : "",
          r.content_snapshot.year
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Gửi ",
          orgDate(r.submitted_at),
          " · Chờ ",
          waitingText(r.step_started_at, now)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
          r.legacy ? "Quy trình cũ — chưa chuyển luồng" : `Cấp ${r.current_step + 1}: ${r.steps[r.current_step]?.label} · ${nameOf(r.steps[r.current_step]?.user_id ?? "")}`,
          approvalOverdue(r, now) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " · Quá hạn xử lý" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: r.can_act ? "default" : "outline", onClick: () => setSelected(r.id), children: r.can_act ? "Xử lý hồ sơ" : "Xem chi tiết" })
    ] }, r.id)) }),
    run && /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalDetail, { run, onClose: () => setSelected(null) })
  ] });
}
function nameOf(id) {
  return useAuth.getState().users.find((u) => u.id === id)?.fullName ?? "Chưa xác định";
}
function LateRequestsSection({ uid }) {
  const query = useQuery(bizLateRequestsQuery());
  const [selected, setSelected] = reactExports.useState(null);
  const rows = query.data?.requests ?? [];
  const now = query.data?.server_now ?? (/* @__PURE__ */ new Date()).toISOString();
  const actionable = rows.filter((r) => r.status === "pending" && r.can_decide);
  const mine = rows.filter((r) => r.user_id === uid);
  if (!rows.length) return null;
  const current = rows.find((r) => r.id === selected);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border rounded-lg p-4 space-y-3 bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Yêu cầu nộp bù" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        actionable.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-warning text-warning-foreground", children: [
          actionable.length,
          " chờ xử lý"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Làm mới yêu cầu nộp bù", onClick: () => query.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: rows.slice(0, 20).map((r) => {
      const left = r.milestones?.late_close ? Math.max(0, Date.parse(r.milestones.late_close) - Date.parse(now)) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium break-words", children: [
            r.employee_name,
            " · ",
            r.kind === "plan" ? "Kế hoạch" : "Báo cáo",
            " ",
            periodLabel(r.period_kind, r.year, r.period)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground break-words", children: [
            "Lý do: ",
            r.reason
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Gửi ",
            orgDate(r.created_at),
            r.status === "pending" && left !== null && ` · Hạn nộp bù còn ${Math.floor(left / 864e5)} ngày`,
            r.decider_name && ` · Xử lý bởi ${r.decider_name}`,
            r.status === "expired" && " · Yêu cầu hết hiệu lực do kỳ nộp đã đóng"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LateStatusBadge, { status: r.status }),
          r.legacy && r.can_adopt && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: async () => {
            if (!window.confirm("Chuyển yêu cầu cũ sang quy trình hiện hành? Lịch sử được giữ nguyên.")) return;
            const result = await supabase.rpc("biz_late_request_adopt", { _id: r.id, _confirmed: true });
            if (result.error) toast.error(result.error.message);
            else {
              toast.success("Đã chuyển yêu cầu sang quy trình.");
              query.refetch();
            }
          }, children: "Chuyển luồng" }),
          r.can_decide && r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => setSelected(r.id), children: "Xử lý" })
        ] })
      ] }, r.id);
    }) }),
    mine.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Yêu cầu của bạn cũng nằm trong danh sách này." }),
    current && /* @__PURE__ */ jsxRuntimeExports.jsx(LateDecideDialog, { request: current, onClose: () => setSelected(null) })
  ] });
}
function LateDecideDialog({ request: r, onClose }) {
  const [comment, setComment] = reactExports.useState("");
  const decide = useBizLateRequestDecide();
  const send = async (approve) => {
    try {
      await decide.mutateAsync({ _id: r.id, _approve: approve, _comment: comment });
      toast.success(approve ? "Đã ghi nhận cấp duyệt nộp bù." : "Đã từ chối yêu cầu.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Yêu cầu nộp bù · ",
      r.employee_name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        r.kind === "plan" ? "Kế hoạch" : "Báo cáo",
        " ",
        periodLabel(r.period_kind, r.year, r.period)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Deadline đã qua: ",
        r.milestones?.due ? orgDate(r.milestones.due) : "—",
        " · Đóng nộp bù: ",
        r.milestones?.late_close ? orgDate(r.milestones.late_close) : "Không giới hạn"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-md border p-3 break-words", children: [
        "Lý do: ",
        r.reason
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Duyệt nộp bù chỉ mở quyền nộp cho đúng kỳ này; hồ sơ nộp bù được ghi nhận Nộp muộn. Việc duyệt không đồng nghĩa với duyệt nội dung hồ sơ." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhận xét (bắt buộc khi từ chối)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: comment, onChange: (e) => setComment(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: decide.isPending, onClick: () => send(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-2" }),
        "Duyệt nộp bù"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: decide.isPending || !comment.trim(), onClick: () => send(false), children: "Từ chối" })
    ] })
  ] }) });
}
function RollingComparison({ run: r }) {
  const basis = r.content_snapshot.basis;
  if (!basis) return null;
  const first = basis.first_month;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-4 bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Điều chỉnh phân bổ KR tháng · Trước / Sau" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Áp dụng từ tháng ",
      first,
      " · Mục tiêu năm đã duyệt không đổi",
      r.content_snapshot.workflow_kind === "goal_year" ? " · Đang dùng luồng KR Năm (chưa có luồng riêng cho điều chỉnh phân bổ)" : "",
      "."
    ] }),
    basis.items.map((metric) => {
      const proposed = r.content_snapshot.items.find((i) => i.metric_id === metric.metric_id);
      if (!proposed) return null;
      const currentFuture = metric.current.slice(first - 1).reduce((s, v) => s + BigInt(v ?? "0"), 0n);
      const proposedFuture = proposed.months.slice(first - 1).reduce((s, v) => s + BigInt(v ?? "0"), 0n);
      const projection = metric.actual !== null ? BigInt(metric.actual) + proposedFuture : null;
      const annualDiff = projection !== null && metric.annual !== null ? projection - BigInt(metric.annual) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-medium text-sm", children: [
          metric.definition.name,
          " · ",
          metric.definition.unit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs", children: [["Mục tiêu năm đã duyệt", fmtGoal(metric.annual)], ["Thực tế chính thức", fmtGoal(metric.actual)], ["Phần còn phải đạt", fmtGoal(metric.remaining)], ["Dự kiến cả năm", projection === null ? "—" : fmtGoal(projection.toString())]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: v })
        ] }, l)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2", children: "Tháng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2 text-right", children: "Phân bổ hiện hành" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2 text-right", children: "Đề xuất mới" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 text-right", children: "Chênh lệch" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: metric.current.map((cur, m) => {
            const next = proposed.months[m] ?? null;
            const locked = m < first - 1;
            const diff = !locked && next !== null && cur !== null ? BigInt(next) - BigInt(cur) : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-1 pr-2", children: [
                "Tháng ",
                m + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-right tabular-nums", children: fmtGoal(cur) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-right tabular-nums font-medium", children: locked ? "Đã khóa" : fmtGoal(next) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-1 text-right tabular-nums ${diff !== null && diff !== 0n ? "text-warning font-medium" : ""}`, children: locked ? "—" : diff === null ? "—" : numberText(diff.toString()) })
            ] }, m);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tfoot", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: "Tổng tháng tương lai" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-right tabular-nums", children: fmtGoal(currentFuture.toString()) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-right tabular-nums", children: fmtGoal(proposedFuture.toString()) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right tabular-nums", children: numberText((proposedFuture - currentFuture).toString()) })
            ] }),
            annualDiff !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: "Chênh lệch so với mục tiêu năm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 3, className: `py-1 text-right tabular-nums ${annualDiff > 0n ? "text-success" : "text-warning"}`, children: [
                numberText(annualDiff.toString()),
                annualDiff > 0n ? " · Phấn đấu vượt, không tăng cam kết" : ""
              ] })
            ] })
          ] })
        ] }) })
      ] }, metric.metric_id);
    })
  ] });
}
function ApprovalDetail({ run: r, onClose }) {
  const [comment, setComment] = reactExports.useState("");
  const [override, setOverride] = reactExports.useState("");
  const [replacement, setReplacement] = reactExports.useState("");
  const [adopt, setAdopt] = reactExports.useState(false);
  const mutation = useOrganizationAction();
  const { isSuperAdmin, can } = useCurrentUser();
  const users = useAuth((s) => s.users).filter((u) => u.status === "Đang hoạt động");
  const isRolling = r.content_snapshot.entity === "rolling_plan";
  const send = async (approve) => {
    try {
      await mutation.mutateAsync({ kind: "decision", run: r, approve, comment });
      toast.success(approve ? "Đã ghi nhận cấp duyệt." : "Đã yêu cầu chỉnh sửa.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-5xl max-h-[92dvh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      r.employee_name,
      " · ",
      r.content_snapshot.entity === "rolling_plan" ? "Điều chỉnh phân bổ tháng" : WORKFLOW_KINDS[r.kind],
      " ",
      r.content_snapshot.year
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: [r.org_snapshot.system_name, r.org_snapshot.department_name, r.org_snapshot.team_name].filter(Boolean).join(" / ") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: statusLabels[r.status] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        r.org_snapshot.workflow_name,
        " ",
        r.org_snapshot.workflow_version ? `· Bản ${r.org_snapshot.workflow_version}` : ""
      ] })
    ] }),
    r.content_snapshot.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm rounded-md border border-warning/40 bg-warning/10 p-3", children: [
      "Lý do điều chỉnh: ",
      r.content_snapshot.reason
    ] }),
    isRolling && /* @__PURE__ */ jsxRuntimeExports.jsx(RollingComparison, { run: r }),
    !isRolling && r.kind !== "goal_year" && !!r.content_snapshot.previous_items?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3 bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "So sánh điều chỉnh · Trước / Sau" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Số liệu chính thức giữ nguyên cho đến khi điều chỉnh được duyệt." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2", children: "KR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2 text-right", children: "Đã báo cáo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2 text-right", children: "Đề nghị sửa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 text-right", children: "Chênh lệch" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: r.content_snapshot.items.map((item) => {
          const old = r.content_snapshot.previous_items?.find((b) => b.metric_id === item.metric_id);
          const diff = item.actual != null && old?.actual != null ? BigInt(item.actual) - BigInt(old.actual) : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 break-words", children: item.definition.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 text-right tabular-nums", children: numberText(old?.actual) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 text-right tabular-nums font-medium", children: numberText(item.actual) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 text-right tabular-nums ${diff !== null && diff !== 0n ? "text-warning font-medium" : ""}`, children: diff === null ? "—" : numberText(diff.toString()) })
          ] }, item.metric_id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: !isRolling && r.content_snapshot.items?.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-b py-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
        i.definition.name,
        " · ",
        i.definition.unit
      ] }),
      r.kind === "goal_year" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Mục tiêu năm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-primary break-all", children: fmtGoal(i.annual) })
          ] }),
          [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
              "Quý ",
              q + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: fmtQuarter(i, q) })
          ] }, q))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-sm cursor-pointer text-primary", children: "Phân bổ 12 tháng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3", children: i.months?.map((v, m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            "Tháng ",
            m + 1,
            ": ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: fmtGoal(v) })
          ] }, m)) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm", children: [["Mục tiêu", fmtGoal(i.target)], ["Thực tế", fmtGoal(i.actual)], ["Hoàn thành", metricPercent(i) === null ? "—" : `${metricPercent(i)?.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`], ["Chênh lệch", i.target != null && i.actual != null ? fmtGoal(String(BigInt(i.actual) - BigInt(i.target))) : "—"]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: v })
        ] }, l)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("progress", { max: 100, value: Math.min(100, metricPercent(i) ?? 0), className: "w-full h-2 accent-primary", "aria-label": `Tiến độ ${i.definition.name}` })
      ] })
    ] }, i.metric_id)) }),
    r.content_snapshot.url && googleDocsOk(r.content_snapshot.url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: r.content_snapshot.url, target: "_blank", rel: "noopener noreferrer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
      "Google Docs"
    ] }) }),
    !!r.content_snapshot.attachments?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: r.content_snapshot.attachments.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: a.url, target: "_blank", rel: "noopener noreferrer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
      a.name
    ] }) }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Các cấp phê duyệt" }),
      r.steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          i + 1,
          ". ",
          s.label,
          " · ",
          nameOf(s.user_id ?? "")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: i === r.current_step && r.status === "pending" ? "default" : "outline", children: r.status === "approved" || i < r.current_step ? "Đã duyệt" : i === r.current_step ? "Cấp hiện tại" : "Chưa đến lượt" })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Lịch sử xử lý" }),
      r.events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm border-b pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          orgDate(e.created_at),
          " · ",
          e.actor_name,
          " · ",
          { created: "Tạo phiên bản", saved: "Lưu nháp", submitted: "Gửi duyệt", step_approved: "Duyệt cấp", approved: "Duyệt hoàn tất", returned: "Yêu cầu chỉnh sửa", override: "Can thiệp đặc biệt", adopted: "Chuyển luồng", reassigned: "Đổi người xử lý" }[e.action] ?? e.action
        ] }),
        e.comment && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground break-words", children: e.comment })
      ] }, e.id))
    ] }),
    r.can_act && r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhận xét / Lý do yêu cầu chỉnh sửa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: comment, onChange: (e) => setComment(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: mutation.isPending, onClick: () => send(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-2" }),
          "Duyệt cấp hiện tại"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: mutation.isPending || !comment.trim(), onClick: () => send(false), children: "Yêu cầu chỉnh sửa" })
      ] })
    ] }),
    (isSuperAdmin || can("biz.intervene")) && r.content_snapshot.entity !== "rolling_plan" && !r.kind.startsWith("late_") && r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "text-sm font-medium cursor-pointer flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
        "Can thiệp đặc biệt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-3", children: r.legacy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAdopt(!adopt), children: "Chuyển sang quy trình đang hiệu lực" }),
        adopt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-warning", children: "Xác nhận thay cơ chế xử lý của hồ sơ này; lịch sử và dữ liệu không đổi." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: mutation.isPending, onClick: async () => {
            try {
              await mutation.mutateAsync({ kind: "adopt", run: r });
              toast.success("Đã chuyển luồng.");
              onClose();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : String(e));
            }
          }, children: "Xác nhận chuyển luồng" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: override || "none", onValueChange: (v) => setOverride(v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Thao tác can thiệp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn thao tác" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approve", children: "Duyệt hoàn tất trực tiếp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "return", children: "Trả về nhân viên" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reassign", children: "Đổi người xử lý hiện tại" })
          ] })
        ] }),
        override === "reassign" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: replacement || "none", onValueChange: (v) => setReplacement(v === "none" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Người xử lý mới", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn người xử lý" }),
            users.filter((u) => u.id !== r.owner_id).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.fullName }, u.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do can thiệp (bắt buộc)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: comment, onChange: (e) => setComment(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: mutation.isPending || !override || !comment.trim() || override === "reassign" && !replacement, onClick: async () => {
          try {
            await mutation.mutateAsync({ kind: "override", run: r, action: override, comment, user: replacement });
            toast.success("Đã can thiệp và lưu lịch sử.");
            onClose();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : String(e));
          }
        }, children: "Xác nhận can thiệp" })
      ] }) })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Phê duyệt", description: "Quản trị Kinh doanh" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(BizApprovals, {})
] });
export {
  SplitComponent as component
};
