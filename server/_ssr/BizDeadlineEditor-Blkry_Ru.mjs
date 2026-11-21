import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button, L as Label, I as Input, l as Badge, F as useAuth } from "./router-CkmTURa-.mjs";
import { f as bizDeadlineQuery, g as useBizDeadlineSave, h as bizDeadlineLogQuery } from "./queries-D_iIARlF.mjs";
import { m as milestonesFor, a as milestoneOrderError, u as upcomingPeriods, f as fmtVN } from "./deadline-D2Kxczjd.mjs";
import { f as periodOfDate, p as periodLabel } from "./documents-RNnMLtSC.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { m as Save, aR as History } from "../_libs/lucide-react.mjs";
const WEEKLY_EFFECTIVE_FROM = "2026-11-02";
function defaultReportCycle(date) {
  return date >= WEEKLY_EFFECTIVE_FROM ? "week" : "month";
}
function reportDeadlineError(cycle, rule, date) {
  const p = periodOfDate(cycle, date);
  const m = milestonesFor(`report_${cycle}`, rule, p.year, p.period);
  if (!m.open || !m.due || !m.late_close) return "Cần hoàn tất cả ba mốc: mở nộp, hạn cuối và đóng nộp bù trước khi áp dụng chu kỳ.";
  if (m.open > m.due || m.due >= m.late_close) return "Mở nộp không được sau hạn cuối; hạn cuối phải trước đóng nộp bù.";
  return milestoneOrderError(`report_${cycle}`, rule ?? {});
}
function shortReportWindow(cycle, rule, date) {
  const p = periodOfDate(cycle, date);
  const m = milestonesFor(`report_${cycle}`, rule, p.year, p.period);
  return !!m.open && !!m.due && Date.parse(`${m.due.replace(" ", "T")}+07:00`) - Date.parse(`${m.open.replace(" ", "T")}+07:00`) < 864e5;
}
const DOC_GROUPS = [
  { key: "plan", label: "Kế hoạch" },
  { key: "goal", label: "Mục tiêu KR" }
];
const PERIOD_TABS = [{ key: "month", label: "Tháng" }, { key: "quarter", label: "Quý" }, { key: "year", label: "Năm" }];
const MILESTONES = [
  { key: "open", label: "Mốc 1 · Mở nộp", desc: "Từ thời điểm này nhân viên bắt đầu nộp được. Để trống nếu cho nộp bất kỳ lúc nào.", optional: true },
  { key: "due", label: "Mốc 2 · Hạn cuối nộp", desc: "Sau thời điểm này không nộp trực tiếp được nữa — nhân viên phải xin nộp bù và chờ duyệt.", optional: false },
  { key: "late_close", label: "Mốc 3 · Đóng nộp bù", desc: "Sau thời điểm này kỳ đóng hoàn toàn; yêu cầu nộp bù chưa xử lý sẽ hết hiệu lực. Để trống nếu không giới hạn.", optional: true }
];
const OFFSET_OPTIONS = {
  day: [],
  week: [],
  month: [{ value: -1, label: "Tháng trước kỳ" }, { value: 0, label: "Tháng của kỳ" }, { value: 1, label: "Tháng sau kỳ" }],
  quarter: [{ value: -1, label: "Tháng cuối quý trước" }, { value: 0, label: "Tháng 1 của quý" }, { value: 1, label: "Tháng 2 của quý" }, { value: 2, label: "Tháng 3 của quý" }, { value: 3, label: "Tháng đầu quý sau" }],
  year: [{ value: -1, label: "Tháng 12 năm trước" }, ...Array.from({ length: 12 }, (_, i) => ({ value: i, label: `Tháng ${i + 1} của năm` })), { value: 12, label: "Tháng 1 năm sau" }]
};
function normalize(rule) {
  if (!rule) return {};
  if ("open" in rule || "due" in rule || "late_close" in rule) return rule;
  const legacy = rule;
  return {
    open: null,
    due: legacy.day ? { phase: legacy.phase, day: legacy.day, hour: legacy.hour, minute: legacy.minute } : null,
    late_close: null,
    exceptions: Object.fromEntries(Object.entries(legacy.exceptions ?? {}).map(([k, v]) => [k, { due: v }]))
  };
}
function BizDeadlineEditor({ reportOnly = false } = {}) {
  const { data } = useQuery(bizDeadlineQuery);
  const save = useBizDeadlineSave();
  const [form, setForm] = reactExports.useState(null);
  const [group, setGroup] = reactExports.useState(reportOnly ? "report" : "plan");
  const [periodKind, setPeriodKind] = reactExports.useState(reportOnly ? "week" : "month");
  const cur = reactExports.useMemo(() => {
    const source = form ?? data ?? {};
    return Object.fromEntries(Object.entries(source).map(([k, v]) => [k, normalize(v)]));
  }, [form, data]);
  const tabs = group === "report" ? [{ key: "day", label: "Ngày" }, { key: "week", label: "Tuần" }, ...PERIOD_TABS.filter((t) => t.key !== "year")] : PERIOD_TABS;
  const kinds = group === "goal" ? ["goal_year"] : tabs.map((t) => `${group}_${t.key}`);
  const kind = group === "goal" ? "goal_year" : `${group}_${periodKind}`;
  const rule = cur[kind] ?? {};
  const update = (next) => setForm({ ...cur, [kind]: next });
  const milestones = group === "goal" ? MILESTONES.filter((m) => m.key === "due") : MILESTONES;
  const submit = async () => {
    for (const k of kinds.filter((k2) => JSON.stringify(cur[k2]) !== JSON.stringify(normalize(data?.[k2])))) {
      if (k.startsWith("report_")) {
        const c = k.replace("report_", "");
        const error2 = reportDeadlineError(c, cur[k], new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(/* @__PURE__ */ new Date()));
        if (error2) {
          toast.error(error2);
          return;
        }
      }
      const error = milestoneOrderError(k, cur[k] ?? {});
      if (error) {
        toast.error(error);
        return;
      }
    }
    try {
      await save.mutateAsync({ _data: cur });
      setForm(null);
      toast.success("Đã lưu cấu hình lịch nộp.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
      !reportOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: group, onValueChange: (v) => {
        setGroup(v);
        setPeriodKind("month");
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "h-auto flex-wrap", children: DOC_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: g.key, children: g.label }, g.key)) }) }),
      group !== "goal" && /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: periodKind, onValueChange: (v) => setPeriodKind(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "flex-wrap h-auto", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: t.key, children: t.label }, t.key)) }) })
    ] }),
    !reportOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/biz/reports", search: { settings: "deadline" }, children: "Đi đến Cài đặt Báo cáo" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-3", children: milestones.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(MilestoneCard, { meta: m, required: group === "report", kind, periodKind: group === "goal" ? "year" : periodKind, rule: rule[m.key], onChange: (value) => update({ ...rule, [m.key]: value }) }, m.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SchedulePreview, { kind, rule }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExceptionEditor, { daily: periodKind === "day" || periodKind === "week", values: rule.exceptions ?? {}, onChange: (exceptions) => update({ ...rule, exceptions }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !form || save.isPending, onClick: submit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
        "Lưu cấu hình lịch nộp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giờ Việt Nam · Ngày vượt cuối tháng được tính vào ngày cuối tháng · Hồ sơ đã nộp giữ nguyên hạn đã xác nhận." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigHistory, {})
  ] });
}
function MilestoneCard({ meta, kind, periodKind, rule, onChange, required = false }) {
  const enabled = !meta.optional || rule != null;
  const value = rule ?? {};
  const set = (field, v) => onChange({ ...value, [field]: v });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border rounded-lg bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: meta.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: required ? "Mốc bắt buộc cho chu kỳ Báo cáo." : meta.desc })
      ] }),
      meta.optional && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: enabled ? "secondary" : "outline", size: "sm", disabled: required && enabled, onClick: () => onChange(enabled ? null : periodKind === "day" || periodKind === "week" ? { offset_days: void 0, hour: 17, minute: 0 } : { offset: 0, day: void 0, hour: 17, minute: 0 }), children: enabled ? "Đang áp dụng" : required ? "Cần cấu hình" : "Không áp dụng" })
    ] }),
    enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      periodKind === "day" || periodKind === "week" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số ngày sau khi kỳ kết thúc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `${meta.label} số ngày sau kỳ`, type: "number", min: 0, max: 62, value: value.offset_days ?? "", onChange: (e) => set("offset_days", e.target.value === "" ? void 0 : Number(e.target.value)) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thời điểm trong kỳ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(value.offset ?? (value.phase === "before" ? -1 : value.phase === "after" ? periodKind === "month" ? 1 : periodKind === "quarter" ? 3 : 12 : 0)), onValueChange: (v) => set("offset", Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": `${meta.label} thời điểm`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OFFSET_OPTIONS[periodKind].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(o.value), children: o.label }, o.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["day", "hour", "minute"].filter((f) => f !== "day" || periodKind !== "day" && periodKind !== "week").map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: { day: "Ngày", hour: "Giờ", minute: "Phút" }[field] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `${meta.label} ${field}`, type: "number", min: field === "day" ? 1 : 0, max: field === "day" ? 31 : field === "hour" ? 23 : 59, value: value[field] ?? (field === "day" ? "" : field === "hour" ? 17 : 0), onChange: (e) => set(field, e.target.value === "" ? void 0 : Number(e.target.value)) })
      ] }, field)) })
    ] })
  ] });
}
function SchedulePreview({ kind, rule }) {
  const periods = upcomingPeriods(kind);
  const label = kind.startsWith("plan") ? "Kế hoạch" : kind.startsWith("report") ? "Báo cáo" : "Mục tiêu KR";
  const pk = kind.endsWith("day") ? "day" : kind.endsWith("week") ? "week" : kind.endsWith("month") ? "month" : kind.endsWith("quarter") ? "quarter" : "year";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border rounded-lg bg-muted/30 p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Xem trước lịch nộp" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-3", children: periods.map(({ year, period }) => {
      const m = milestonesFor(kind, rule, year, period);
      const special = !!rule.exceptions?.[`${year}-${String(period).padStart(2, "0")}`];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg bg-card p-3 space-y-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
          label,
          " ",
          periodLabel(pk, year, period),
          " ",
          special && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-warning border-warning/40 ml-1", children: "Lịch đặc biệt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Mở nộp: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: m.open ? fmtVN(m.open) : "Chưa cấu hình" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Hạn cuối: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: m.due ? fmtVN(m.due) : "Chưa cấu hình" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Đóng nộp bù: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: m.late_close ? fmtVN(m.late_close) : "Chưa cấu hình" })
        ] }),
        kind.startsWith("report_") && reportDeadlineError(pk, rule, `${year}-01-04`) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-warning", children: "Cần hoàn tất ba mốc trước khi áp dụng." }),
        kind === "report_week" && shortReportWindow("week", rule, `${year}-01-04`) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-warning", children: "Khoảng nộp dưới 24 giờ — hãy kiểm tra trước khi lưu." })
      ] }, `${year}-${period}`);
    }) })
  ] });
}
function ExceptionEditor({ values, onChange, daily = false }) {
  const [period, setPeriod] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState("");
  const [due, setDue] = reactExports.useState("");
  const [close, setClose] = reactExports.useState("");
  const valid = (daily ? /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/ : /^[0-9]{4}-(0[1-9]|1[0-2])$/).test(period) && (open || due || close);
  const add = () => {
    const entry = {};
    if (open) entry.open = open;
    if (due) entry.due = due;
    if (close) entry.late_close = close;
    onChange({ ...values, [period]: entry });
    setPeriod("");
    setOpen("");
    setDue("");
    setClose("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border rounded-lg p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "font-semibold cursor-pointer", children: [
      "Ngoại lệ theo kỳ ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "(ví dụ: tháng nghỉ Tết, kỳ được gia hạn riêng)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ngoại lệ chỉ áp dụng cho kỳ được chọn, không đổi quy tắc mặc định của các kỳ khác. Sửa kỳ đang mở hoặc đã có hồ sơ sẽ được ghi nhật ký; hạn đúng của hồ sơ đã nộp không tự thay đổi." }),
    Object.entries(values).map(([p, v]) => {
      const ex = typeof v === "string" ? { due: v } : v;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm border-t pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-warning border-warning/40", children: "Lịch đặc biệt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Mở: ",
          fmtVN(ex.open),
          " · Hạn cuối: ",
          fmtVN(ex.due),
          " · Đóng bù: ",
          fmtVN(ex.late_close)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", "aria-label": `Bỏ ngoại lệ ${p}`, onClick: () => {
          const next = { ...values };
          delete next[p];
          onChange(next);
        }, children: "Bỏ" })
      ] }, p);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Kỳ ngoại lệ", type: daily ? "date" : "month", value: period, onChange: (e) => setPeriod(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Mở nộp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Mở nộp ngoại lệ", type: "datetime-local", value: open, onChange: (e) => setOpen(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Hạn cuối" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Hạn cuối ngoại lệ", type: "datetime-local", value: due, onChange: (e) => setDue(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Đóng nộp bù" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Đóng nộp bù ngoại lệ", type: "datetime-local", value: close, onChange: (e) => setClose(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: !valid, onClick: add, children: "Thêm ngoại lệ" }) })
    ] })
  ] });
}
function ConfigHistory() {
  const { data } = useQuery(bizDeadlineLogQuery);
  const users = useAuth((s) => s.users);
  if (!data?.length) return null;
  const nameOf = (id) => users.find((u) => u.id === id)?.fullName ?? "Hệ thống";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border rounded-lg p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "font-semibold cursor-pointer flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
      "Lịch sử thay đổi cấu hình"
    ] }),
    data.map((row) => {
      const changed = Object.keys(row.new_data).filter((k) => JSON.stringify(row.old_data?.[k]) !== JSON.stringify(row.new_data[k]));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm border-t pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          new Date(row.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
          " · ",
          nameOf(row.actor_id)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Thay đổi: ",
          changed.length ? changed.join(", ") : "Không đổi nội dung"
        ] })
      ] }, row.id);
    })
  ] });
}
export {
  BizDeadlineEditor as B,
  WEEKLY_EFFECTIVE_FROM as W,
  defaultReportCycle as d,
  reportDeadlineError as r,
  shortReportWindow as s
};
