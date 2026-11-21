import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery, q as queryOptions, u as useQueryClient, b as useMutation, d as useQueries } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as useAuth, u as useCurrentUser, I as Input, B as Button, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label } from "./router-CkmTURa-.mjs";
import { d as documentsQuery, m as myWorkQuery, h as hasSubmittedDocument, u as useDocumentAction, c as canSubmitInPhase, r as reportMetricsQuery, a as useDocumentOpen, b as documentError, e as documentEventsQuery, o as officialLinkValid } from "./documentQueries-BmIBN0rp.mjs";
import { c as manageRank, V as VIEW_STATUS, e as dayPeriod, w as weekPeriod, s as storedRange, f as periodOfDate, h as deadlineStatus, C as CYCLE_LABEL, T as TIME_STATUS, D as DOC_STATUS, p as periodLabel, j as myWorkRank, d as docStatusLabel, v as viewTone, m as metricPercent, n as numberText, k as weekSegments, l as attachmentUrlOk, g as googleDocsOk, o as progressTone } from "./documents-RNnMLtSC.mjs";
import { c as bizMilestonesQuery, b as bizLateRequestsQuery } from "./queries-D_iIARlF.mjs";
import { p as phaseFromIso } from "./deadline-D2Kxczjd.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { v as validValue } from "./goals-CPMRtvZ0.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { a as LateRequestDialog, b as LateRequestPanel } from "./BizLateRequest-B_8jYATS.mjs";
import { aC as RefreshCw, F as FileText, f as Search, ag as ExternalLink, az as LockKeyhole, aR as History, r as Eye, ap as Trash2, a6 as Plus, m as Save, ad as Send, aO as CalendarClock, aA as FileCheckCorner } from "../_libs/lucide-react.mjs";
function allocationsMatch(items, segments, allocations) {
  if (segments.length < 2) return true;
  if (allocations.length !== items.length * segments.length) return false;
  return items.every((item) => item.actual !== null && /^\d{1,20}$/.test(item.actual) && segments.every((seg) => allocations.filter((a) => a.metric_id === item.metric_id && a.from === seg.from && a.to === seg.to && /^\d{1,20}$/.test(a.actual)).length === 1) && allocations.filter((a) => a.metric_id === item.metric_id).reduce((sum, a) => sum + BigInt(a.actual || "0"), 0n) === BigInt(item.actual));
}
const cycleConfigsQuery = (uid) => queryOptions({ queryKey: ["biz_report_cycles", uid], queryFn: async () => {
  const { data, error } = await supabase.from("biz_report_cycle_configs").select("*").order("effective_from", { ascending: false });
  if (error) throw error;
  return data ?? [];
} });
const cycleLogQuery = (uid) => queryOptions({ queryKey: ["biz_report_cycle_log", uid], queryFn: async () => {
  const { data, error } = await supabase.from("biz_report_cycle_config_log").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
} });
const myCycleQuery = (uid, at) => queryOptions({ queryKey: ["biz_my_cycle", uid, at], queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_report_cycle_config_of", { _user: uid, _at: at });
  if (error) throw error;
  return data;
} });
function useCycleAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (a) => {
    const result = a.kind === "save" ? await supabase.rpc("biz_report_cycle_save", a.args) : await supabase.rpc("biz_report_cycle_delete", { _id: a.id });
    if (result.error) throw result.error;
    return result.data;
  }, onSuccess: async () => {
    await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") });
  } });
}
const asJson = (value) => value;
function BizQuarterSummary({ uid, user, year, mode = "official" }) {
  const quarters = useQueries({ queries: [1, 2, 3, 4].map((q) => reportMetricsQuery(uid, user, year, "quarter", q, mode)) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Kết quả từng quý" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: quarters.map((query, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-sm", children: [
        "Quý ",
        index + 1
      ] }),
      query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Đang tổng hợp…" }),
      query.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Chưa tải được" }),
      query.data?.no_target && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Chưa có mục tiêu chính thức" }),
      query.data?.items.map((item) => {
        const percent = metricPercent(item);
        const label = !item.complete ? "Chưa đủ dữ liệu" : percent === null ? "Chưa có quy tắc đánh giá" : percent >= 100 ? "Đạt" : "Chưa đạt";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.definition.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: label === "Đạt" ? "text-success" : "text-muted-foreground", children: label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            numberText(item.actual),
            " / ",
            numberText(item.target),
            " ",
            item.definition.unit,
            percent !== null ? ` · ${percent.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%` : ""
          ] })
        ] }, item.metric_id);
      })
    ] }, index)) })
  ] });
}
const dateText = (v) => v ? new Date(v).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "Chưa quy định";
function useOpenDocument() {
  const open = useDocumentOpen();
  return async (versionId) => {
    const win = window.open("", "_blank");
    try {
      const url = await open.mutateAsync(versionId);
      if (win) {
        win.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (e) {
      win?.close();
      toast.error(documentError(e));
    }
  };
}
function StatusBadges({ row, kind, showView = true, phase }) {
  const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now);
  const version = row.document?.versions.at(-1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: ["late", "overdue"].includes(time) ? "text-destructive border-destructive/40" : time === "ontime" ? "text-success border-success/40" : time === "soon" ? "text-warning border-warning/40" : "", children: !row.document?.first_submitted_at ? phase ? PHASE_BADGE[phase].label : time === "overdue" ? "Quá hạn trực tiếp" : "Đang tải lịch nộp…" : TIME_STATUS[time] }),
    row.document?.late_submitted && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-warning border-warning/40", children: "Nộp muộn" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: version ? docStatusLabel(kind, version.status) : "Chưa nộp" }),
    showView && hasSubmittedDocument(row) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: viewTone(row.my_view), children: VIEW_STATUS[row.my_view] })
  ] });
}
const PHASE_BADGE = {
  none: { label: "Chưa cấu hình lịch nộp", className: "" },
  not_open: { label: "Chưa mở nộp", className: "" },
  open: { label: "Đang mở nộp", className: "text-success border-success/40" },
  overdue: { label: "Quá hạn trực tiếp – Đang trong thời gian xin nộp bù", className: "text-destructive border-destructive/40" },
  closed: { label: "Đã đóng kỳ", className: "text-muted-foreground" }
};
function MyWorkSection({ kind, onOpen }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery({ ...myWorkQuery(uid, kind), enabled: !!uid });
  const [askLate, setAskLate] = reactExports.useState(null);
  const rows = (query.data?.rows ?? []).slice().sort((a, b) => myWorkRank(a) - myWorkRank(b) || Date.parse(a.due_at ?? "") - Date.parse(b.due_at ?? ""));
  const label = kind === "plan" ? "Kế hoạch" : "Báo cáo";
  if (query.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Công việc của tôi" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "border border-destructive/40 rounded-lg p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-destructive", children: [
        "Không tải được danh sách công việc: ",
        query.error.message
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => query.refetch(), children: "Thử lại" })
    ] })
  ] });
  if (query.isPending || !rows.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Công việc của tôi" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: rows.map((r) => {
      const phase = PHASE_BADGE[r.phase];
      const submitted = !!r.first_submitted_at;
      let action = null;
      if (r.version_status === "changes") action = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => onOpen(r.period_kind, r.year, r.period, true), children: "Nộp lại bản chỉnh sửa" });
      else if (r.phase === "open" && !submitted) action = /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => onOpen(r.period_kind, r.year, r.period, true), children: [
        "Nộp ",
        label.toLowerCase()
      ] });
      else if (r.phase === "overdue" && !submitted) {
        if (r.late_status === "approved") action = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => onOpen(r.period_kind, r.year, r.period, true), children: "Nộp bù" });
        else if (r.late_status === "pending") action = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: true, children: "Đang chờ duyệt nộp bù" });
        else action = /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setAskLate(r), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4 mr-2" }),
          "Xin nộp bù"
        ] });
      } else if (r.phase === "not_open") action = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: true, children: "Chưa mở nộp" });
      else if (submitted) action = /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onOpen(r.period_kind, r.year, r.period, true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-4 w-4 mr-2" }),
        "Xem hồ sơ"
      ] });
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg bg-card p-4 space-y-2 ${r.version_status === "changes" || r.phase === "overdue" ? "border-warning/60" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
            label,
            " ",
            periodLabel(r.period_kind, r.year, r.period)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: phase.className, children: phase.label }),
            r.late_submitted && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-warning border-warning/40", children: "Nộp muộn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: docStatusLabel(kind, r.version_status) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Mở nộp: ",
          dateText(r.open_at),
          " · Hạn cuối: ",
          dateText(r.due_at),
          " · Đóng nộp bù: ",
          dateText(r.late_close_at),
          " (giờ Việt Nam)"
        ] }),
        r.phase === "overdue" && !submitted && r.late_status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-success", children: [
          "Yêu cầu nộp bù đã được duyệt — hãy nộp trước ",
          dateText(r.late_close_at),
          "."
        ] }),
        r.phase === "overdue" && !submitted && r.late_status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Yêu cầu nộp bù bị từ chối — có thể gửi lại yêu cầu mới." }),
        r.last_submitted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Nộp gần nhất: ",
          dateText(r.last_submitted_at)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          action,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => onOpen(r.period_kind, r.year, r.period, false), children: "Tra cứu kỳ này" })
        ] })
      ] }, `${r.period_kind}-${r.year}-${r.period}`);
    }) }),
    askLate && /* @__PURE__ */ jsxRuntimeExports.jsx(LateRequestDialog, { kind, periodKind: askLate.period_kind, year: askLate.year, period: askLate.period, due: askLate.due_at, label, onClose: () => setAskLate(null) })
  ] });
}
function MyDocCard({ row, kind, periodKind, year, period, onOpen }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const version = row.document?.versions.at(-1);
  const openDoc = useOpenDocument();
  const milestones = useQuery(bizMilestonesQuery(`${kind}_${periodKind}`, year, period));
  const late = useQuery(bizLateRequestsQuery(kind, periodKind, year, period));
  const submitted = !!row.document?.first_submitted_at;
  const phase = milestones.data ? kind === "report" && !(milestones.data.open && milestones.data.due && milestones.data.late_close) ? "none" : phaseFromIso(milestones.data, late.data?.server_now ?? row.server_now) : null;
  const mine = late.data?.requests.find((r) => r.user_id === uid);
  const label = kind === "plan" ? "Kế hoạch" : "Báo cáo";
  let primary = null;
  if (version?.status === "changes") primary = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: onOpen, children: "Nộp lại bản chỉnh sửa" });
  else if (!submitted) {
    if (phase === "not_open") primary = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: true, children: "Chưa mở nộp" });
    else if (kind === "report" && (phase === "none" || phase === null)) primary = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: true, children: "Chờ hoàn tất lịch nộp" });
    else if (phase === "open" || phase === "none" || phase === null) primary = /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: onOpen, children: [
      "Nộp ",
      label.toLowerCase()
    ] });
    else if (phase === "overdue") {
      if (mine?.status === "approved") primary = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: onOpen, children: "Nộp bù" });
      else if (mine?.status === "pending") primary = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: true, children: "Đang chờ duyệt nộp bù" });
    } else if (phase === "closed") primary = version ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onOpen, children: "Xem hồ sơ" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-muted-foreground", children: "Đóng kỳ – Không nộp" });
  } else primary = /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: onOpen, children: "Xem / cập nhật hồ sơ" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
      label,
      " của tôi"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg bg-card p-4 space-y-3 max-w-xl ${version?.status === "changes" || phase === "overdue" ? "border-warning/60" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
          label,
          " ",
          periodLabel(periodKind, year, period)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadges, { row, kind, phase })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Hạn nộp: ",
        dateText(row.deadline),
        " (giờ Việt Nam)"
      ] }),
      milestones.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Mở nộp: ",
        dateText(milestones.data.open),
        " · Đóng nộp bù: ",
        dateText(milestones.data.late_close)
      ] }),
      row.document?.last_submitted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Nộp gần nhất: ",
        dateText(row.document.last_submitted_at)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LateRequestPanel, { kind, periodKind, year, period, submitted }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        primary,
        version?.submitted_at && version.url && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openDoc(version.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
          "Mở tài liệu"
        ] })
      ] })
    ] })
  ] });
}
const QUICK_LABEL = { all: "Tổng cần nộp", submitted: "Đã nộp", unsubmitted: "Chưa nộp", ontime: "Đúng hạn", late: "Nộp muộn", overdue: "Quá hạn chưa nộp", changes: "Cần chỉnh sửa", unviewed: "Mới chưa xem" };
function quickMatch(row, quick) {
  const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now);
  const status = row.document?.versions.at(-1)?.status;
  switch (quick) {
    case "all":
      return true;
    case "submitted":
      return !!row.document?.first_submitted_at;
    case "unsubmitted":
      return !row.document?.first_submitted_at;
    case "ontime":
      return time === "ontime";
    case "late":
      return time === "late";
    case "overdue":
      return time === "overdue";
    case "changes":
      return status === "changes";
    case "unviewed":
      return !!row.document?.first_submitted_at && (row.my_view === "unopened" || row.my_view === "new_version");
  }
}
function BizPlans() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const { can } = useCurrentUser();
  const [periodKind, setPeriodKind] = reactExports.useState("month");
  const [year, setYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [period, setPeriod] = reactExports.useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [quick, setQuick] = reactExports.useState("all");
  const [dept, setDept] = reactExports.useState("all");
  const [employee, setEmployee] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [view, setView] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const query = useQuery({ ...documentsQuery(uid, "plan", periodKind, year, period), enabled: !!uid });
  const rows = reactExports.useMemo(() => query.data ?? [], [query.data]);
  const milestones = useQuery(bizMilestonesQuery(`plan_${periodKind}`, year, period));
  const phase = milestones.data ? phaseFromIso(milestones.data, rows[0]?.server_now ?? (/* @__PURE__ */ new Date()).toISOString()) : null;
  const myRow = rows.find((r) => r.user_id === uid);
  const teamRows = reactExports.useMemo(() => rows.filter((r) => r.user_id !== uid), [rows, uid]);
  const canManage = can("biz.view_all") || can("biz.view_dept") || can("biz.plan_approve") || can("biz.plan_request_revision");
  const showTeam = canManage && teamRows.length > 0;
  const max = periodKind === "month" ? 12 : periodKind === "quarter" ? 4 : 1;
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pk = params.get("period_kind"), y = Number(params.get("year")), p = Number(params.get("period"));
    if (pk === "month" || pk === "quarter" || pk === "year") {
      setPeriodKind(pk);
      if (y >= 2e3 && y <= 2200) setYear(y);
      if (p >= 1 && p <= (pk === "month" ? 12 : pk === "quarter" ? 4 : 1)) setPeriod(p);
    }
    const user = params.get("user");
    if (user) setSelected(user);
    if (params.get("view") === "unviewed") setQuick("unviewed");
  }, [uid]);
  const departments = reactExports.useMemo(() => [...new Map(teamRows.map((r) => [r.department_id, r.department_name])).entries()], [teamRows]);
  const shown = reactExports.useMemo(() => teamRows.filter((r) => quickMatch(r, quick) && (dept === "all" || r.department_id === dept) && (employee === "all" || r.user_id === employee) && (status === "all" || (r.document?.versions.at(-1)?.status ?? "missing") === status) && (view === "all" || r.my_view === view) && (!search.trim() || r.employee_name.toLowerCase().includes(search.trim().toLowerCase()))).sort((a, b) => manageRank(a) - manageRank(b) || a.employee_name.localeCompare(b.employee_name, "vi")), [teamRows, quick, dept, employee, status, view, search]);
  const selectedRow = rows.find((r) => r.user_id === selected);
  const jump = (pk, y, p, openDialog) => {
    setPeriodKind(pk);
    setYear(y);
    setPeriod(p);
    setSelected(openDialog ? uid : null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-32 sm:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MyWorkSection, { kind: "plan", onOpen: jump }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center border-b pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: periodKind, onValueChange: (v) => {
        setPeriodKind(v);
        setPeriod(1);
        setSelected(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "month", children: "Tháng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "quarter", children: "Quý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "year", children: "Năm" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Năm", className: "w-28", type: "number", min: 2e3, max: 2200, value: year, onChange: (e) => {
        const n = Number(e.target.value);
        if (n >= 2e3 && n <= 2200) {
          setYear(n);
          setSelected(null);
        }
      } }),
      max > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(period), onValueChange: (v) => {
        setPeriod(Number(v));
        setSelected(null);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({ length: max }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(i + 1), children: [
          periodKind === "month" ? "Tháng" : "Quý",
          " ",
          i + 1
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Làm mới", onClick: () => query.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
    ] }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-destructive", children: [
      "Không tải được: ",
      query.error.message
    ] }),
    !query.isPending && myRow && /* @__PURE__ */ jsxRuntimeExports.jsx(MyDocCard, { row: myRow, kind: "plan", periodKind, year, period, onOpen: () => setSelected(uid) }),
    !query.isPending && !myRow && !showTeam && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 border-y space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Bạn không thuộc diện nộp kế hoạch trong kỳ đang chọn." })
    ] }),
    showTeam && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Kế hoạch trong phạm vi quản lý" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LateStats, { kind: "plan", periodKind, year, period }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2", children: Object.keys(QUICK_LABEL).map((key) => {
        const count = teamRows.filter((r) => quickMatch(r, key)).length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setQuick(quick === key ? "all" : key), className: `border rounded-lg p-3 text-left transition-colors ${quick === key ? "border-primary bg-primary/5" : "bg-card hover:border-primary/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: QUICK_LABEL[key] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-xl tabular-nums", children: count })
        ] }, key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhân sự", placeholder: "Tìm theo tên…", className: "pl-9 w-52", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        departments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dept, onValueChange: setDept, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Phòng ban", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả phòng ban" }),
            departments.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name }, id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: employee, onValueChange: setEmployee, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Nhân viên", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả nhân viên" }),
            teamRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.user_id, children: r.employee_name }, r.user_id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Trạng thái nộp", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái nộp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "missing", children: "Chưa nộp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Bản nháp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Đã nộp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "changes", children: "Cần chỉnh sửa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "resubmitted", children: "Đã nộp lại" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: view, onValueChange: setView, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Trạng thái xem", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái xem" }),
            Object.entries(VIEW_STATUS).map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name }, id))
          ] })
        ] })
      ] }),
      !shown.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: "Không có kế hoạch khớp bộ lọc." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-muted-foreground border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Nhân sự" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Đơn vị" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Kỳ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Hạn nộp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Trạng thái nộp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Trạng thái xem" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Thao tác" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: shown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(PlanRow, { row: r, phase, periodKind, year, period, onOpen: () => setSelected(r.user_id) }, r.user_id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden grid gap-3", children: shown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(PlanCard, { row: r, phase, periodKind, year, period, onOpen: () => setSelected(r.user_id) }, r.user_id)) })
    ] }),
    selectedRow && /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentDialog, { row: selectedRow, uid, kind: "plan", periodKind, year, period, onClose: () => setSelected(null) }, `${selectedRow.user_id}-plan-${periodKind}-${year}-${period}`)
  ] });
}
function LateStats({ kind, periodKind, year, period }) {
  const query = useQuery(bizLateRequestsQuery(kind, periodKind, year, period));
  const rows = query.data?.requests ?? [];
  if (!rows.length) return null;
  const count = (s) => rows.filter((r) => r.status === s).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4 text-sm border rounded-lg p-3 bg-muted/30", children: [["Đang xin nộp bù", count("pending")], ["Được duyệt nộp bù", count("approved")], ["Đã nộp bù", count("used")], ["Bị từ chối", count("rejected")], ["Hết hiệu lực", count("expired")]].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
    label,
    ": ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground tabular-nums", children: value })
  ] }, String(label))) });
}
function PlanActions({ row, onOpen }) {
  const version = row.document?.versions.at(-1);
  const openDoc = useOpenDocument();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    version?.submitted_at && version.url && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openDoc(version.id), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
      "Xem tài liệu"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: onOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
      "Hồ sơ"
    ] })
  ] });
}
function PlanRow({ row, phase, periodKind, year, period, onOpen }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t align-top", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: row.employee_name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: row.department_name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: periodLabel(periodKind, year, period) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: dateText(row.deadline) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadges, { row, phase, kind: "plan", showView: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: hasSubmittedDocument(row) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: viewTone(row.my_view), children: VIEW_STATUS[row.my_view] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanActions, { row, onOpen }) })
  ] });
}
function PlanCard({ row, phase, periodKind, year, period, onOpen }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold break-words", children: row.employee_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          row.department_name,
          " · ",
          periodLabel(periodKind, year, period)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadges, { row, phase, kind: "plan" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Hạn: ",
      dateText(row.deadline)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PlanActions, { row, onOpen })
  ] });
}
function BizDocuments({ kind }) {
  return kind === "plan" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BizPlans, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(BizDocumentsClassic, { kind });
}
const RQUICK_LABEL = { all: "Tổng cần nộp", submitted: "Đã nộp", unsubmitted: "Chưa nộp", ontime: "Đúng hạn", late: "Nộp muộn", overdue: "Quá hạn chưa nộp", adjusting: "Đề nghị điều chỉnh", adjusted: "Điều chỉnh đã duyệt" };
function reportQuickMatch(row, quick) {
  const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now);
  const status = row.document?.versions.at(-1)?.status;
  switch (quick) {
    case "all":
      return true;
    case "submitted":
      return !!row.document?.first_submitted_at;
    case "unsubmitted":
      return !row.document?.first_submitted_at;
    case "ontime":
      return time === "ontime";
    case "late":
      return time === "late";
    case "overdue":
      return time === "overdue";
    case "adjusting":
      return status === "pending";
    case "adjusted":
      return !!row.document?.versions.some((v) => v.status === "approved" && v.version > 1);
  }
}
function krProgress(row) {
  const items = row.document?.versions.find((v) => v.id === row.document?.official_version_id)?.items ?? [];
  if (!items.length) return null;
  return `${items.filter((i) => i.actual !== null).length}/${items.length} KR`;
}
function BizDocumentsClassic({ kind }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const { can } = useCurrentUser();
  const [periodKind, setPeriodKind] = reactExports.useState("month");
  const [year, setYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [period, setPeriod] = reactExports.useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [quick, setQuick] = reactExports.useState("all");
  const [dept, setDept] = reactExports.useState("all");
  const [employee, setEmployee] = reactExports.useState("all");
  const [time, setTime] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const query = useQuery({ ...documentsQuery(uid, kind, periodKind, year, period), enabled: !!uid });
  const rows = query.data ?? [];
  const myRow = rows.find((r) => r.user_id === uid);
  const teamRows = rows.filter((r) => r.user_id !== uid);
  const canManage = can("biz.view_all") || can("biz.view_dept") || can("biz.report_approve");
  const showTeam = canManage && teamRows.length > 0;
  const selectedRow = rows.find((r) => r.user_id === selected);
  const max = periodKind === "day" ? dayPeriod(`${year}-12-31`).period : periodKind === "week" ? weekPeriod(`${year}-12-28`).period : periodKind === "month" ? 12 : periodKind === "quarter" ? 4 : 1;
  const at = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
  const cycleQuery = useQuery({ ...myCycleQuery(uid, at), enabled: !!uid });
  const assigned = cycleQuery.data?.cycle ?? "month";
  const periodStart = storedRange(periodKind, year, period).start;
  const periodCycleQuery = useQuery({ ...myCycleQuery(uid, periodStart), enabled: !!uid && periodKind !== "year" });
  const periodCycle = periodCycleQuery.data?.cycle;
  const canCreate = periodKind !== "year" && (periodCycle === void 0 ? assigned === periodKind : periodCycle === periodKind);
  const hasUrlParams = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("period_kind");
  reactExports.useEffect(() => {
    if (hasUrlParams || !cycleQuery.data) return;
    const current = periodOfDate(cycleQuery.data.cycle, at);
    setPeriodKind(cycleQuery.data.cycle);
    setYear(current.year);
    setPeriod(current.period);
  }, [hasUrlParams, cycleQuery.data, at]);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pk = params.get("period_kind"), y = Number(params.get("year")), p = Number(params.get("period"));
    if (pk === "day" || pk === "week" || pk === "month" || pk === "quarter" || pk === "year") {
      setPeriodKind(pk);
      if (y >= 2e3 && y <= 2200) setYear(y);
      if (p >= 1 && p <= (pk === "day" ? 366 : pk === "week" ? 53 : pk === "month" ? 12 : pk === "quarter" ? 4 : 1)) setPeriod(p);
    }
    const user = params.get("user");
    if (user) setSelected(user);
  }, [kind, uid]);
  const departments = [...new Map(teamRows.map((r) => [r.department_id, r.department_name])).entries()];
  const shown = teamRows.filter((r) => reportQuickMatch(r, quick) && (dept === "all" || r.department_id === dept) && (employee === "all" || r.user_id === employee) && (time === "all" || deadlineStatus(r.deadline, r.document?.first_submitted_at ?? null, r.server_now) === time) && (status === "all" || (r.document?.versions.at(-1)?.status ?? "missing") === status) && (!search.trim() || r.employee_name.toLowerCase().includes(search.trim().toLowerCase()))).sort((a, b) => manageRank(a) - manageRank(b) || a.employee_name.localeCompare(b.employee_name, "vi"));
  const jump = (pk, y, p, openDialog) => {
    setPeriodKind(pk);
    setYear(y);
    setPeriod(p);
    setSelected(openDialog ? uid : null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-32 sm:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MyWorkSection, { kind: "report", onOpen: jump }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Xem kết quả báo cáo" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center border-b pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: periodKind, onValueChange: (v) => {
        const pk = v;
        const current = periodOfDate(pk === "year" ? "month" : pk, at);
        setPeriodKind(pk);
        setYear(current.year);
        setPeriod(pk === "year" ? 1 : current.period);
        setSelected(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "day", children: "Ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "week", children: "Tuần" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "month", children: "Tháng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "quarter", children: "Quý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "year", children: "Năm" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Năm", className: "w-28", type: "number", min: 2e3, max: 2200, value: year, onChange: (e) => {
        const n = Number(e.target.value);
        if (n >= 2e3 && n <= 2200) {
          setYear(n);
          setSelected(null);
        }
      } }),
      periodKind === "day" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Ngày báo cáo", type: "date", className: "w-44", value: storedRange(periodKind, year, period).start, onChange: (e) => {
        if (!e.target.value) return;
        const p = dayPeriod(e.target.value);
        setYear(p.year);
        setPeriod(p.period);
        setSelected(null);
      } }) : max > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(period), onValueChange: (v) => {
        setPeriod(Number(v));
        setSelected(null);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({ length: max }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(i + 1), children: [
          CYCLE_LABEL[periodKind],
          " ",
          i + 1
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Làm mới", onClick: () => query.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
    ] }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-destructive", children: [
      "Không tải được: ",
      query.error.message
    ] }),
    !query.isPending && myRow && (canCreate || myRow.document) && /* @__PURE__ */ jsxRuntimeExports.jsx(MyDocCard, { row: myRow, kind: "report", periodKind, year, period, onOpen: () => setSelected(uid) }),
    !query.isPending && !myRow && !showTeam && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 border-y space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Chưa có hồ sơ nguồn ở kỳ đang chọn." })
    ] }),
    !query.isPending && !canCreate && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportSummary, { uid, user: uid, year, periodKind, period }),
    showTeam && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Báo cáo trong phạm vi quản lý" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LateStats, { kind: "report", periodKind, year, period }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2", children: Object.keys(RQUICK_LABEL).map((key) => {
        const count = teamRows.filter((r) => reportQuickMatch(r, key)).length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setQuick(quick === key ? "all" : key), className: `border rounded-lg p-3 text-left transition-colors ${quick === key ? "border-primary bg-primary/5" : "bg-card hover:border-primary/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: RQUICK_LABEL[key] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-xl tabular-nums", children: count })
        ] }, key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhân sự", placeholder: "Tìm theo tên…", className: "pl-9 w-52", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        departments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dept, onValueChange: setDept, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Phòng ban", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả phòng ban" }),
            departments.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name }, id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: employee, onValueChange: setEmployee, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Nhân viên", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả nhân viên" }),
            teamRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.user_id, children: r.employee_name }, r.user_id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: time, onValueChange: setTime, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Deadline", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi deadline" }),
            Object.entries(TIME_STATUS).map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name }, id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Trạng thái nộp", className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái nộp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "missing", children: "Chưa nộp" }),
            Object.entries(DOC_STATUS).map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name }, id))
          ] })
        ] }),
        can("biz.deadline_manage") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: async () => {
          const { data, error } = await supabase.rpc("biz_deadline_remind", { _kind: kind, _period_kind: periodKind, _year: year, _period: period });
          if (error) toast.error(error.message);
          else toast.success(`Đã tạo ${data} thông báo Base. Không gửi Zalo/Push.`);
        }, children: "Nhắc hạn trong phạm vi" })
      ] }),
      !shown.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: "Không có báo cáo khớp bộ lọc." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-muted-foreground border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Nhân sự" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Đơn vị" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Kỳ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Hạn nộp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Trạng thái nộp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Kết quả KR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3", children: "Thao tác" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: shown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t align-top", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: r.employee_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.department_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: periodLabel(periodKind, year, period) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: dateText(r.deadline) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadges, { row: r, kind: "report", showView: false }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: krProgress(r) ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportActions, { row: r, onOpen: () => setSelected(r.user_id) }) })
        ] }, r.user_id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden grid gap-3", children: shown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg bg-card p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold break-words", children: r.employee_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              r.department_name,
              " · ",
              periodLabel(periodKind, year, period)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadges, { row: r, kind: "report", showView: false })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Hạn: ",
          dateText(r.deadline),
          krProgress(r) ? ` · ${krProgress(r)}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportActions, { row: r, onOpen: () => setSelected(r.user_id) })
      ] }, r.user_id)) })
    ] }),
    selectedRow && /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentDialog, { row: selectedRow, uid, kind, periodKind, year, period, onClose: () => setSelected(null) }, `${selectedRow.user_id}-${kind}-${periodKind}-${year}-${period}`)
  ] });
}
function ReportActions({ row, onOpen }) {
  const version = row.document?.versions.at(-1);
  const openDoc = useOpenDocument();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    version?.url && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openDoc(version.id), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
      "Xem tài liệu"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: onOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
      "Hồ sơ"
    ] })
  ] });
}
function DocumentDialog({ row, uid, kind, periodKind, year, period, onClose }) {
  const { can } = useCurrentUser();
  const action = useDocumentAction();
  const [view, setView] = reactExports.useState("");
  const [reason, setReason] = reactExports.useState("");
  const [showHistory, setShowHistory] = reactExports.useState(false);
  const version = row.document?.versions.find((v) => v.id === view) ?? row.document?.versions.at(-1);
  const canSubmit = row.user_id === uid && can(kind === "plan" ? "biz.plan_submit" : "biz.report_submit");
  const milestones = useQuery(bizMilestonesQuery(`${kind}_${periodKind}`, year, period));
  const late = useQuery(bizLateRequestsQuery(kind, periodKind, year, period));
  const phase = milestones.data ? phaseFromIso(milestones.data, late.data?.server_now ?? row.server_now) : null;
  const maySubmit = (kind !== "report" || !!row.document?.first_submitted_at || !!(milestones.data?.open && milestones.data?.due && milestones.data?.late_close)) && canSubmitInPhase(phase, row.document?.first_submitted_at ?? null, late.data?.requests.find((r) => r.user_id === uid)?.status);
  const start = async () => {
    try {
      await action.mutateAsync({ kind: "start", docKind: kind, periodKind, year, period, reason });
      setView("");
      toast.success("Đã tạo bản nháp.");
    } catch (e) {
      toast.error(documentError(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-4xl max-h-[90dvh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      kind === "plan" ? "Kế hoạch" : "Báo cáo",
      " · ",
      periodLabel(periodKind, year, period)
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      row.employee_name,
      " · ",
      row.department_name
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadges, { row, kind, phase, showView: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Hạn: ",
      dateText(row.deadline),
      " (giờ Việt Nam)"
    ] }),
    row.document?.first_submitted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
      "Nộp lần đầu: ",
      dateText(row.document.first_submitted_at),
      " · Gửi gần nhất: ",
      dateText(row.document.last_submitted_at)
    ] }),
    row.document?.official_version_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-primary flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LockKeyhole, { className: "h-4 w-4" }),
      "Bản chính thức ",
      row.document.versions.find((v) => v.id === row.document?.official_version_id)?.version,
      " được giữ đến khi bản mới được duyệt."
    ] }),
    version && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: version.id, onValueChange: setView, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: row.document?.versions.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: v.id, children: [
            "Bản ",
            v.version,
            " · ",
            docStatusLabel(kind, v.status),
            v.id === row.document?.official_version_id ? " · Chính thức" : ""
          ] }, v.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": "Lịch sử", onClick: () => setShowHistory(!showHistory), children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentEditor, { version, kind, periodKind, year, period, canEdit: canSubmit && ["draft", "changes"].includes(version.status), maySubmit, canReview: row.can_review && (version.status === "pending" || kind === "plan" && version.status === "resubmitted"), hasOfficial: !!row.document?.official_version_id, officialItems: row.document?.versions.find((v) => v.id === row.document?.official_version_id)?.items }, `${version.id}-${version.revision}`)
    ] }),
    kind === "report" && version?.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-warning text-sm", children: "Đang chờ duyệt điều chỉnh · Số liệu chính thức giữ nguyên." }),
    kind === "report" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportSummary, { uid, user: row.user_id, year, periodKind, period }),
    canSubmit && (kind === "plan" || periodKind !== "year") && (!version || row.document?.versions.every((v) => v.status === "approved")) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3", children: [
      version && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do điều chỉnh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: reason, onChange: (e) => setReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: action.isPending || !row.document?.first_submitted_at && !maySubmit || !!version && !reason.trim(), onClick: start, children: version ? "Yêu cầu điều chỉnh" : "Tạo bản nháp" })
    ] }),
    showHistory && row.document && /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentHistory, { uid, id: row.document.id })
  ] }) });
}
function DocumentEditor({ version, kind, periodKind, year, period, canEdit, maySubmit, canReview, hasOfficial, officialItems }) {
  const [url, setUrl] = reactExports.useState(version.url ?? "");
  const [linkError, setLinkError] = reactExports.useState("");
  const openDoc = useOpenDocument();
  const [notes, setNotes] = reactExports.useState(version.notes ?? "");
  const [items, setItems] = reactExports.useState(version.items);
  const [attachments, setAttachments] = reactExports.useState(version.attachments ?? []);
  const [comment, setComment] = reactExports.useState("");
  const action = useDocumentAction();
  const monthly = kind === "report" && periodKind !== "year";
  const segments = periodKind === "week" ? weekSegments(storedRange("week", year, period).start) : [];
  const [allocations, setAllocations] = reactExports.useState(version.allocations ?? (segments.length > 1 ? version.items.flatMap((i) => segments.map((seg) => ({ metric_id: i.metric_id, ...seg, actual: "" }))) : []));
  const valid = allocationsMatch(items, segments, allocations) && (!monthly || items.every((i) => i.actual !== null && validValue(i.actual))) && attachments.every((a) => a.name.trim() && attachmentUrlOk(a.url));
  const save = async (submit) => {
    if (!officialLinkValid(kind, url, submit)) {
      setLinkError(kind === "plan" ? "Vui lòng nhập link Google Docs kế hoạch chính thức trước khi nộp." : "Link phải là Google Docs HTTPS hợp lệ.");
      return;
    }
    if (submit && !maySubmit) {
      toast.error("Kỳ này chưa cho phép nộp trực tiếp. Vui lòng kiểm tra lịch nộp hoặc quyền nộp bù.");
      return;
    }
    setLinkError("");
    try {
      await action.mutateAsync({ kind: "save", id: version.id, revision: version.revision, url: url.trim(), notes, attachments, allocations: segments.length > 1 ? allocations : void 0, actuals: monthly ? items.map((i) => ({ metric_id: i.metric_id, actual: i.actual })) : [], submit });
      toast.success(submit ? kind === "report" ? hasOfficial ? "Đã gửi duyệt điều chỉnh. Số liệu chính thức giữ nguyên đến khi được duyệt." : "Đã nộp báo cáo, số liệu được ghi nhận chính thức ngay." : "Đã nộp kế hoạch." : "Đã lưu nháp.");
    } catch (e) {
      toast.error(documentError(e));
    }
  };
  const attach = async () => {
    try {
      await action.mutateAsync({ kind: "attach", id: version.id, revision: version.revision });
      toast.success("Đã gắn mục tiêu đã duyệt.");
    } catch (e) {
      toast.error(documentError(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    version.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      "Lý do điều chỉnh: ",
      version.reason
    ] }),
    version.review_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-warning font-medium rounded-md border border-warning/40 bg-warning/10 p-3", children: [
      kind === "plan" ? version.status === "changes" ? "Cần chỉnh sửa: " : "Yêu cầu chỉnh sửa gần nhất (đã phản hồi): " : "Nhận xét: ",
      version.review_comment
    ] }),
    monthly && !version.target_version_id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-warning", children: "Chưa có mục tiêu KR chính thức. Chỉ nộp tài liệu giải trình, không tính tỷ lệ hoàn thành." }),
    version.target_version_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Mục tiêu tham chiếu: ",
      version.target_version_id
    ] }),
    monthly && !version.target_version_id && canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: action.isPending, onClick: attach, children: "Gắn mục tiêu đã duyệt" }),
    kind === "report" && version.status === "pending" && officialItems && /* @__PURE__ */ jsxRuntimeExports.jsx(BeforeAfter, { before: officialItems, after: items }),
    monthly && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricValues, { item }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        "Thực tế · ",
        item.definition.unit
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Thực tế ${item.definition.name}`, inputMode: "numeric", className: "text-right tabular-nums", disabled: !canEdit, value: item.actual === null ? "" : numberText(item.actual), onChange: (e) => {
        const raw = e.target.value.replace(/[.,\s]/g, "");
        if (!raw || validValue(raw)) setItems((current) => current.map((i, n) => n === index ? { ...i, actual: raw ? BigInt(raw).toString() : null } : i));
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: version.status === "approved" ? "Đã xác nhận" : "Chưa xác nhận" })
    ] }, item.metric_id)) }),
    segments.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-y py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Phân bổ thực tế tuần giao tháng" }),
      items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          item.definition.name,
          " · Tổng tuần ",
          numberText(item.actual),
          " ",
          item.definition.unit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: segments.map((seg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            seg.from,
            " – ",
            seg.to
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Phân bổ ${item.definition.name} ${seg.from}`, inputMode: "numeric", disabled: !canEdit, value: allocations.find((a) => a.metric_id === item.metric_id && a.from === seg.from)?.actual ?? "", onChange: (e) => {
            const raw = e.target.value.replace(/[.,\s]/g, "");
            if (raw && !validValue(raw)) return;
            setAllocations((a) => a.map((x) => x.metric_id === item.metric_id && x.from === seg.from ? { ...x, actual: raw } : x));
          } })
        ] }, seg.from)) })
      ] }, item.metric_id)),
      !allocationsMatch(items, segments, allocations) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-warning text-sm", children: "Tổng phân bổ của từng KR phải bằng tổng thực tế tuần." })
    ] }),
    kind === "plan" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `official-doc-${version.id}`, children: "Link Google Docs kế hoạch chính thức (*)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `official-doc-${version.id}`, "aria-required": "true", "aria-invalid": !!linkError, "aria-describedby": `official-help-${version.id}`, type: "url", disabled: !canEdit, placeholder: "https://docs.google.com/document/d/…", value: url, onChange: (e) => {
        setUrl(e.target.value);
        setLinkError("");
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: `official-help-${version.id}`, className: "text-xs text-muted-foreground", children: "Đây là tài liệu kế hoạch chính thức. Vui lòng cấp quyền xem Google Docs cho lãnh đạo có trách nhiệm quản lý." }),
      linkError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: linkError }),
      googleDocsOk(url) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
        if (version.submitted_at && url.trim() === version.url) openDoc(version.id);
        else window.open(url.trim(), "_blank", "noopener,noreferrer");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
        "Mở Google Docs"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: kind === "plan" ? "Tài liệu bổ sung (không bắt buộc)" : "Tài liệu đính kèm (không bắt buộc)" }),
      attachments.map((a, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-3 space-y-2", children: canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Tên tài liệu ${index + 1}`, placeholder: "Tên tài liệu", value: a.name, onChange: (e) => setAttachments((c) => c.map((x, n) => n === index ? { ...x, name: e.target.value } : x)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Liên kết tài liệu ${index + 1}`, placeholder: "https://…", value: a.url, onChange: (e) => setAttachments((c) => c.map((x, n) => n === index ? { ...x, url: e.target.value } : x)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Mô tả tài liệu ${index + 1}`, placeholder: "Mô tả ngắn (tùy chọn)", value: a.description ?? "", onChange: (e) => setAttachments((c) => c.map((x, n) => n === index ? { ...x, description: e.target.value } : x)) }),
        a.url && !attachmentUrlOk(a.url) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Liên kết phải bắt đầu bằng https://" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setAttachments((c) => c.filter((_, n) => n !== index)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
          "Xóa tài liệu"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium break-words", children: a.name }),
          a.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground break-words", children: a.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: a.url, target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
          "Mở"
        ] }) })
      ] }) }, index)),
      canEdit && attachments.length < 10 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setAttachments((c) => [...c, { name: "", url: "" }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Thêm tài liệu"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ưu tiên liên kết Google Drive/Docs/Sheets. Hãy cấp quyền xem cho lãnh đạo; nội dung bên ngoài chưa được Base xác minh." }),
      kind === "report" && url && googleDocsOk(url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
        "Google Docs (bản cũ)"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú / Giải trình (không bắt buộc)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { disabled: !canEdit, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: kind === "plan" ? "Ghi chú hoặc giải trình…" : "Nguyên nhân chưa đạt KR, khó khăn, kết quả nổi bật, đề xuất hỗ trợ…" })
    ] }),
    canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 bg-background py-3 border-t flex flex-wrap gap-2 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: action.isPending, onClick: () => save(false), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
        "Lưu nháp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !valid || !maySubmit || action.isPending, onClick: () => save(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
        kind === "plan" ? version.status === "changes" ? "Nộp lại" : "Nộp kế hoạch" : hasOfficial ? "Gửi duyệt điều chỉnh" : "Nộp báo cáo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => {
        setUrl(version.url ?? "");
        setLinkError("");
        setNotes(version.notes ?? "");
        setItems(version.items);
        setAllocations(version.allocations ?? (segments.length > 1 ? version.items.flatMap((i) => segments.map((seg) => ({ metric_id: i.metric_id, ...seg, actual: "" }))) : []));
        setAttachments(version.attachments ?? []);
      }, children: "Hủy chỉnh sửa" })
    ] }),
    canReview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: kind === "plan" ? "Nội dung cần chỉnh sửa (bắt buộc)" : "Nhận xét lãnh đạo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: comment, onChange: (e) => setComment(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: (kind === "plan" ? [false] : [true, false]).map((approve) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: approve ? "default" : "outline", disabled: action.isPending || !approve && !comment.trim(), onClick: async () => {
        try {
          await action.mutateAsync({ kind: "decide", id: version.id, revision: version.revision, approve, comment });
          toast.success(approve ? "Đã duyệt điều chỉnh, số liệu chính thức đã cập nhật." : "Đã yêu cầu chỉnh sửa.");
        } catch (e) {
          toast.error(documentError(e));
        }
      }, children: approve ? kind === "plan" ? "Duyệt tài liệu" : "Duyệt điều chỉnh" : "Yêu cầu chỉnh sửa" }, String(approve))) })
    ] })
  ] });
}
function BeforeAfter({ before, after }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3 bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "So sánh điều chỉnh · Trước / Sau" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Số liệu chính thức giữ nguyên giá trị Đã báo cáo cho đến khi điều chỉnh được duyệt." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2", children: "KR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2 text-right", children: "Đã báo cáo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-2 text-right", children: "Đề nghị sửa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 text-right", children: "Chênh lệch" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: after.map((item) => {
        const old = before.find((b) => b.metric_id === item.metric_id);
        const diff = item.actual !== null && old?.actual != null ? BigInt(item.actual) - BigInt(old.actual) : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 break-words", children: item.definition.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 text-right tabular-nums", children: numberText(old?.actual) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 text-right tabular-nums font-medium", children: numberText(item.actual) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 text-right tabular-nums ${diff !== null && diff !== 0n ? "text-warning font-medium" : ""}`, children: diff === null ? "—" : numberText(diff.toString()) })
        ] }, item.metric_id);
      }) })
    ] }) })
  ] });
}
function MetricValues({ item }) {
  const percent = metricPercent(item);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: item.definition.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mục tiêu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-primary break-all", children: numberText(item.target) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Thực tế" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: `${progressTone(item)} break-all`, children: numberText(item.actual) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hoàn thành" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: progressTone(item), children: percent === null ? "—" : `${percent.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("progress", { "aria-label": `Tiến độ ${item.definition.name}`, className: `w-full h-2 ${percent !== null && percent >= 100 ? "accent-success" : "accent-warning"}`, value: percent === null ? 0 : Math.min(percent, 100), max: 100 }),
    item.target !== null && item.actual !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Chênh lệch: ",
      numberText(item.difference ?? String(BigInt(item.actual) - BigInt(item.target))),
      " ",
      item.definition.unit
    ] }),
    item.complete !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      item.complete ? "Dữ liệu đầy đủ" : `Chưa đầy đủ · Thiếu tháng ${item.missing_months?.join(", ")}`,
      " · Có số liệu: ",
      item.confirmed_months?.join(", ") || "Chưa có"
    ] }),
    percent === null && item.actual !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mục tiêu 0 hoặc chiều đánh giá thấp: không áp dụng tỷ lệ chia trực tiếp." })
  ] });
}
function ReportSummary({ uid, user, year, periodKind, period }) {
  const summary = useQuery(reportMetricsQuery(uid, user, year, periodKind, period));
  const metrics = summary.data?.items ?? [];
  const full = metrics.length > 0 && metrics.every((i) => i.complete);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
      "Kết quả KR · ",
      periodLabel(periodKind, year, period)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        metrics.length,
        " KR áp dụng"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: full ? `${metrics.filter((i) => (metricPercent(i) ?? -1) >= 100).length} KR đạt mục tiêu` : "Chưa đủ dữ liệu để kết luận số KR đạt" })
    ] }),
    summary.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tổng hợp…" }),
    summary.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Không tổng hợp được số liệu." }),
    summary.data?.no_target && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-warning text-sm", children: "Chưa có mục tiêu năm đã duyệt." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: metrics.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricValues, { item }),
      item.ytd_actual !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-3 space-y-1 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Lũy kế đến kỳ: ",
          numberText(item.ytd_actual),
          " / ",
          numberText(item.ytd_target),
          " ",
          item.definition.unit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Chênh lệch lũy kế: ",
          numberText(item.ytd_difference)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Hoàn thành năm: ",
          numberText(item.annual_percent),
          item.annual_percent !== null ? "%" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Còn cần đạt đến cuối năm: ",
          numberText(item.remaining),
          " ",
          item.definition.unit
        ] }),
        !!item.ytd_missing_months?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Dữ liệu lũy kế thiếu tháng ",
          item.ytd_missing_months.join(", ")
        ] })
      ] })
    ] }, item.metric_id)) }),
    periodKind === "year" && /* @__PURE__ */ jsxRuntimeExports.jsx(BizQuarterSummary, { uid, user, year })
  ] });
}
function DocumentHistory({ uid, id }) {
  const events = useQuery(documentEventsQuery(uid, id));
  const [expanded, setExpanded] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Lịch sử nộp và phê duyệt" }),
    events.data?.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm border-b pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        { created: "Tạo phiên bản", saved: "Lưu nháp", submitted: "Nộp tài liệu", approved: "Duyệt", returned: "Yêu cầu chỉnh sửa" }[e.action],
        " · ",
        dateText(e.created_at)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", onClick: () => setExpanded(expanded === e.id ? "" : e.id), children: "Xem dữ liệu lưu vết" }),
      expanded === e.id && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs whitespace-pre-wrap break-all bg-muted p-3 rounded-md", children: JSON.stringify(e.payload, null, 2) })
    ] }, e.id))
  ] });
}
export {
  BizDocuments as B,
  cycleLogQuery as a,
  asJson as b,
  cycleConfigsQuery as c,
  useCycleAction as u
};
