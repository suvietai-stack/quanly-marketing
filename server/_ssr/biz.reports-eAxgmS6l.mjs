import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { B as BizDocuments, c as cycleConfigsQuery, u as useCycleAction, a as cycleLogQuery, b as asJson } from "./BizDocuments-CK4rCDPv.mjs";
import { P as PageHeader, u as useCurrentUser, B as Button, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, F as useAuth, bw as orgQuery, L as Label, I as Input, N as Checkbox, l as Badge } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as bizGoalsQuery, o as openingActualsQuery, e as useOpeningAction } from "./rollingQueries-Cvto4HY-.mjs";
import { f as fmtGoal } from "./goals-CPMRtvZ0.mjs";
import { u as upcomingPeriods, C as CYCLE_LABEL, p as periodLabel, f as periodOfDate } from "./documents-RNnMLtSC.mjs";
import { f as bizDeadlineQuery } from "./queries-D_iIARlF.mjs";
import { m as milestonesFor, f as fmtVN } from "./deadline-D2Kxczjd.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { B as BizDeadlineEditor, W as WEEKLY_EFFECTIVE_FROM, r as reportDeadlineError, s as shortReportWindow, d as defaultReportCycle } from "./BizDeadlineEditor-Blkry_Ru.mjs";
import "../_libs/seroval.mjs";
import { z as Settings, I as CalendarDays, m as Save, bf as Undo2, ap as Trash2, aR as History } from "../_libs/lucide-react.mjs";
import "./documentQueries-BmIBN0rp.mjs";
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
import "./textarea-BGZgnbbj.mjs";
import "./BizLateRequest-B_8jYATS.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
function effectiveConfig(rows, unit, date) {
  const latest = (scope, id) => rows.filter((r) => r.scope === scope && r.effective_from <= date && (scope === "block" || (scope === "system" ? r.system_id : r.department_id) === id)).sort((a, b) => b.effective_from.localeCompare(a.effective_from) || b.created_at.localeCompare(a.created_at))[0];
  const own = (scope, id) => {
    const r = latest(scope, id);
    return r?.inherit_parent ? void 0 : r;
  };
  return (unit.scope === "department" ? own("department", unit.id) : void 0) ?? (unit.scope !== "block" ? own("system", unit.scope === "system" ? unit.id : unit.system_id) : void 0) ?? own("block") ?? null;
}
function alignedEffectiveDate(cycle, date) {
  const p = periodOfDate(cycle, date);
  if (p.range.start === date) return date;
  const next = /* @__PURE__ */ new Date(`${p.range.end}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
const SCOPE_LABEL = { block: "Toàn Khối", system: "Hệ", department: "Phòng", default: "Mặc định" };
function BizReportSettings() {
  const { can, isSuperAdmin } = useCurrentUser();
  const [open, setOpen] = reactExports.useState(false);
  const [tab, setTab] = reactExports.useState("cycle");
  reactExports.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("settings") === "deadline") {
      setTab("deadline");
      setOpen(true);
    }
  }, []);
  if (!isSuperAdmin && !can("biz.deadline_manage")) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 mr-2" }),
      "Cài đặt"
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-6xl max-h-[90dvh] overflow-y-auto min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cài đặt Báo cáo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cycle", children: "Chu kỳ báo cáo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "deadline", children: "Deadline báo cáo" }),
          (isSuperAdmin || can("biz.intervene")) && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "opening", children: "Số liệu đầu kỳ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: "Lịch sử cấu hình" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cycle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CycleEditor, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "deadline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BizDeadlineEditor, { reportOnly: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "opening", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OpeningActualsEditor, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CycleHistory, {}) })
      ] })
    ] }) })
  ] });
}
function CycleEditor() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const org = useQuery(orgQuery(uid));
  const configs = useQuery(cycleConfigsQuery(uid));
  const deadlines = useQuery(bizDeadlineQuery);
  const action = useCycleAction();
  const today = todayVN();
  const [unitKey, setUnitKey] = reactExports.useState("block:all");
  const [cycle, setCycle] = reactExports.useState("week");
  const [date, setDate] = reactExports.useState(today < WEEKLY_EFFECTIVE_FROM ? WEEKLY_EFFECTIVE_FROM : alignedEffectiveDate("week", today));
  const [days, setDays] = reactExports.useState({ "1": true, "2": true, "3": true, "4": true, "5": true, "6": false, "7": false });
  const [confirm, setConfirm] = reactExports.useState(false);
  const units = [{ scope: "block", id: "all", name: "Toàn Khối", system_id: null }, ...(org.data?.systems ?? []).filter((s) => s.active).map((s) => ({ scope: "system", id: s.id, name: s.name, system_id: s.id })), ...(org.data?.departments ?? []).filter((d) => d.active).map((d) => ({ scope: "department", id: d.id, name: `${org.data?.systems.find((s) => s.id === d.system_id)?.name ?? "Chưa thuộc Hệ"} / ${d.name}`, system_id: d.system_id }))];
  const unit = units.find((u) => `${u.scope}:${u.id}` === unitKey) ?? units[0];
  const rows = configs.data ?? [];
  const applied = effectiveConfig(rows, unit, today);
  const aligned = alignedEffectiveDate(cycle, date || today);
  const preview = upcomingPeriods(cycle, aligned, 4, cycle === "day" ? days : null);
  const deadlineError = reportDeadlineError(cycle, deadlines.data?.[`report_${cycle}`], aligned);
  const shortWindow = shortReportWindow(cycle, deadlines.data?.[`report_${cycle}`], aligned);
  const choose = (key) => {
    setUnitKey(key);
    setConfirm(false);
    const u = units.find((x) => `${x.scope}:${x.id}` === key);
    if (!u) return;
    const current = effectiveConfig(rows, u, date);
    setCycle(current?.cycle ?? defaultReportCycle(date));
    setDays(current?.workdays ?? { "1": true, "2": true, "3": true, "4": true, "5": true, "6": false, "7": false });
  };
  const save = async () => {
    try {
      await action.mutateAsync({ kind: "save", args: { _scope: unit.scope, _system_id: unit.scope === "system" ? unit.id : unit.scope === "department" ? unit.system_id : null, _department_id: unit.scope === "department" ? unit.id : null, _cycle: cycle, _effective_from: aligned, _workdays: cycle === "day" ? asJson(days) : null } });
      setConfirm(false);
      toast.success("Đã lưu chu kỳ báo cáo và làm mới công việc.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  const own = rows.filter((r) => r.scope === unit.scope && (r.scope === "block" || (r.scope === "system" ? r.system_id : r.department_id) === unit.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pt-3", children: [
    (org.error || configs.error) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Không tải được cơ cấu hoặc cấu hình. Hãy thử lại." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "CHU KỲ BÁO CÁO BẮT BUỘC" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn vị áp dụng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: unitKey, onValueChange: choose, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Đơn vị áp dụng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: units.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: `${u.scope}:${u.id}`, children: u.name }, `${u.scope}:${u.id}`)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chu kỳ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cycle, onValueChange: (v) => {
          setCycle(v);
          setConfirm(false);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Chu kỳ báo cáo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["day", "week", "month", "quarter"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: CYCLE_LABEL[c] }, c)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày bắt đầu áp dụng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Ngày bắt đầu áp dụng", type: "date", min: today, value: date, onChange: (e) => {
          setDate(e.target.value);
          setConfirm(false);
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Đang áp dụng: ",
      CYCLE_LABEL[applied?.cycle ?? defaultReportCycle(today)],
      " · Nguồn: ",
      SCOPE_LABEL[applied?.scope ?? "default"],
      " ",
      applied?.effective_from && `· Từ ${applied.effective_from}`
    ] }),
    deadlineError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-warning text-sm", children: [
      deadlineError,
      " Vào Deadline báo cáo để hoàn tất; chưa cho phép nộp theo lịch thiếu."
    ] }),
    shortWindow && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-warning text-sm", children: "Khoảng nộp dưới 24 giờ. Hãy kiểm tra ba mốc trước khi xác nhận." }),
    cycle === "day" && /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-sm font-medium mb-2", children: "Lịch ngày báo cáo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4", children: Array.from({ length: 7 }, (_, i) => String(i + 1)).map((key, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!days[key], onCheckedChange: (v) => {
          setDays((d) => ({ ...d, [key]: v === true }));
          setConfirm(false);
        } }),
        i === 6 ? "Chủ Nhật" : `Thứ ${i + 2}`
      ] }, key)) })
    ] }),
    date !== aligned && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "status", className: "text-warning text-sm", children: [
      "Ngày chọn nằm giữa kỳ. Cấu hình mới bắt đầu từ ",
      aligned,
      ", ở đầu kỳ ",
      CYCLE_LABEL[cycle].toLowerCase(),
      " tiếp theo; không chia kỳ hay viết lại hồ sơ cũ."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-y py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4" }),
        "Xem trước lịch báo cáo · Hiệu lực ",
        aligned
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Kỳ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Bắt đầu – Kết thúc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Mở nộp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Hạn cuối" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Đóng nộp bù" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: preview.map((p) => {
          const m = milestonesFor(`report_${cycle}`, deadlines.data?.[`report_${cycle}`], p.year, p.period);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: periodLabel(cycle, p.year, p.period) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2 whitespace-nowrap", children: [
              p.range.start,
              " – ",
              p.range.end
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 whitespace-nowrap", children: m.open ? fmtVN(m.open) : "Chưa cấu hình" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 whitespace-nowrap", children: m.due ? fmtVN(m.due) : "Chưa cấu hình" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 whitespace-nowrap", children: m.late_close ? fmtVN(m.late_close) : "Chưa cấu hình" })
          ] }, `${p.year}-${p.period}`);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !!deadlineError || deadlines.isPending || action.isPending || !date || date < today || cycle === "day" && !Object.values(days).some(Boolean) || !!org.error || !!configs.error, onClick: () => setConfirm(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
        "Lưu cấu hình"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => choose(unitKey), children: "Hủy" })
    ] }),
    confirm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-warning rounded-md p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Xác nhận áp dụng ",
        CYCLE_LABEL[cycle],
        " cho ",
        unit.name,
        " từ ",
        aligned,
        "? Các kỳ đã nộp giữ nguyên. Lịch trên chỉ tính theo cấu hình deadline hiện có."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !!deadlineError || action.isPending, onClick: save, children: "Xác nhận lưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setConfirm(false), children: "Hủy" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Cấu hình theo đơn vị" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Đơn vị" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Chu kỳ đang áp dụng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Nguồn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Ngày hiệu lực" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: units.map((u) => {
        const c = effectiveConfig(rows, u, today);
        const inherited = !c || c.scope !== u.scope;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: u.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: CYCLE_LABEL[c?.cycle ?? defaultReportCycle(today)] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: SCOPE_LABEL[c?.scope ?? "default"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 whitespace-nowrap", children: c?.effective_from ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: inherited ? "Kế thừa" : "Cấu hình riêng" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => choose(`${u.scope}:${u.id}`), children: "Chỉnh sửa" }) })
        ] }, `${u.scope}:${u.id}`);
      }) })
    ] }) }),
    own.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
        "Cấu hình riêng · ",
        unit.name
      ] }),
      own.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
          c.inherit_parent ? "Quay về kế thừa" : CYCLE_LABEL[c.cycle],
          " · ",
          c.effective_from,
          " · ",
          c.effective_from > today ? "Sắp hiệu lực" : "Đã hiệu lực"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: action.isPending || c.inherit_parent, onClick: async () => {
          if (!window.confirm("Bỏ cấu hình riêng này và quay về kế thừa? Lịch sử thay đổi vẫn được giữ.")) return;
          try {
            await action.mutateAsync({ kind: "delete", id: c.id });
            toast.success("Đã quay về kế thừa cấu hình cấp trên.");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : String(e));
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4 mr-2" }),
          "Quay về kế thừa"
        ] })
      ] }, c.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Quay về kế thừa áp dụng từ kỳ tiếp theo; các cấu hình và kỳ cũ vẫn được giữ." })
    ] })
  ] });
}
function CycleHistory() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const logs = useQuery(cycleLogQuery(uid));
  const users = useAuth((s) => s.users);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
      "Lịch sử cấu hình chu kỳ"
    ] }),
    logs.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Không tải được lịch sử." }),
    !logs.isPending && !logs.data?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Chưa có thay đổi cấu hình." }),
    logs.data?.map((row) => {
      const value = row.new_row ?? row.old_row;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-3 text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          row.action === "save" ? "Lưu cấu hình" : "Quay về kế thừa",
          " · ",
          users.find((u) => u.id === row.actor_id)?.fullName ?? "Người quản trị"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          value?.scope && SCOPE_LABEL[value.scope],
          " · ",
          value?.cycle && CYCLE_LABEL[value.cycle],
          " · Hiệu lực ",
          value?.effective_from,
          " · ",
          new Date(row.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
        ] })
      ] }, row.id);
    })
  ] });
}
function OpeningActualsEditor() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const year = Number(todayVN().slice(0, 4));
  const goals = useQuery(bizGoalsQuery(uid, year));
  const [user, setUser] = reactExports.useState("");
  const [metric, setMetric] = reactExports.useState("");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [value, setValue] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const goal = goals.data?.find((g) => g.user_id === user && g.official_version_id);
  const official = goal?.versions.find((v) => v.id === goal.official_version_id);
  const items = official?.items ?? [];
  const openings = useQuery({ ...openingActualsQuery(uid, user), enabled: !!user });
  const action = useOpeningAction();
  const valid = !!user && !!metric && !!from && !!to && to >= from && /^[0-9]{1,20}$/.test(value) && !!note.trim();
  const save = async () => {
    try {
      await action.mutateAsync({ kind: "save", data: { user_id: user, metric_id: metric, period_start: from, period_end: to, value, source_note: note.trim() } });
      toast.success("Đã xác nhận số liệu đầu kỳ.");
      setMetric("");
      setFrom("");
      setTo("");
      setValue("");
      setNote("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 pt-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Xác nhận số liệu thực tế đầu kỳ" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Dành cho giai đoạn trước khi hệ thống vận hành: xác nhận thủ công thực tế đã đạt theo nhân viên và KR, có nguồn đối chiếu. Không áp dụng cho khoảng đã có báo cáo chính thức (tránh cộng trùng); không tự tạo số 0; mọi thay đổi đều lưu lịch sử." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhân viên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: user || "none", onValueChange: (v) => {
          setUser(v === "none" ? "" : v);
          setMetric("");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Nhân viên xác nhận đầu kỳ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn nhân viên" }),
            (goals.data ?? []).filter((g) => g.official_version_id).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: g.user_id, children: [
              g.employee_name,
              " · ",
              g.department_name
            ] }, g.user_id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chỉ số KR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: metric || "none", onValueChange: (v) => setMetric(v === "none" ? "" : v), disabled: !items.length, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Chỉ số KR đầu kỳ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn KR" }),
            items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: i.metric_id, children: [
              i.definition.name,
              " · ",
              i.definition.unit
            ] }, i.metric_id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Từ ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Đầu kỳ từ ngày", type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đến ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Đầu kỳ đến ngày", type: "date", value: to, onChange: (e) => setTo(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giá trị chính thức" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Giá trị đầu kỳ", inputMode: "numeric", value, onChange: (e) => {
          const v = e.target.value.replace(/[.,\s]/g, "");
          if (!v || /^[0-9]{1,20}$/.test(v)) setValue(v);
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nguồn đối chiếu / ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Nguồn đối chiếu", value: note, onChange: (e) => setNote(e.target.value), placeholder: "Ví dụ: Bảng tổng hợp MISA tháng 10/2026" })
      ] })
    ] }),
    user && !goal && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-warning text-sm", children: [
      "Nhân viên này chưa có mục tiêu năm ",
      year,
      " đã duyệt."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !valid || action.isPending, onClick: save, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
      "Xác nhận số liệu đầu kỳ"
    ] }),
    openings.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: openings.error.message }),
    !!openings.data?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg divide-y", children: openings.data.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex flex-wrap items-center justify-between gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
          o.metric_name,
          ": ",
          fmtGoal(o.value),
          " · ",
          o.period_start,
          " – ",
          o.period_end
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Nguồn: ",
          o.source_note,
          " · Xác nhận bởi ",
          o.confirmed_by_name,
          " · ",
          new Date(o.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: action.isPending, onClick: async () => {
        if (!window.confirm("Xóa xác nhận đầu kỳ này? Lịch sử thay đổi vẫn được giữ.")) return;
        try {
          await action.mutateAsync({ kind: "delete", id: o.id });
          toast.success("Đã xóa xác nhận đầu kỳ.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : String(e));
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
        "Xóa"
      ] })
    ] }, o.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["biz.report_submit", "biz.report_approve", "biz.view_dept", "biz.view_all"], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Báo cáo kinh doanh", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(BizReportSettings, {}) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(BizDocuments, { kind: "report" })
] }) });
export {
  SplitComponent as component
};
