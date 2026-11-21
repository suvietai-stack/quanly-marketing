import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, L as Label, I as Input, l as Badge, C as Card, o as CardContent, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle } from "./router-CkmTURa-.mjs";
import { a as areaUnitIds, h as hasAreaAppointment, s as selectAreaUnit } from "./area-BwBtq_yo.mjs";
import { B as Biz3K } from "./Biz3K-6FZGy_4A.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { k as k3HubAccessWithSignal, a as k3HubAreaChartWithSignal, b as k3HubReport, c as k3HubTotals, K as K3_HUB_STATES, d as k3HubPolicyRead, e as k3HubDetails, f as k3HubFeedbackSave, g as k3HubPolicySave } from "./api-B_q16te0.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { p as ClipboardList, w as Users, aj as Settings2, aC as RefreshCw, aO as CalendarClock, aD as Clock3, ar as CircleCheck, aw as CircleAlert, Y as ChartColumn, aP as MessageSquareText, J as Building2 } from "../_libs/lucide-react.mjs";
async function k3TimingRead(start, end, unit) {
  const { data, error } = await supabase.rpc(
    "k3hub_timing_read",
    { _start: start, _end: end, _unit: unit }
  );
  if (error) throw new Error(error.message);
  return data;
}
function uniqueEmployeeDays(rows) {
  const grouped = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const key = `${row.date}:${row.user_id}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, row);
      continue;
    }
    const score = (item) => Number(item.planned_at !== null) * 3 + Number(item.summarized_at !== null) * 3 + Number(item.work_created_at !== null);
    if (score(row) > score(existing)) grouped.set(key, row);
  }
  return [...grouped.values()];
}
function timingTotals(rows) {
  const unique = uniqueEmployeeDays(rows);
  const recordedPlan = unique.filter((r) => r.planned_at !== null);
  const recordedSummary = unique.filter((r) => r.summarized_at !== null);
  return {
    peopleDays: unique.length,
    planned: recordedPlan.length,
    planOnTime: recordedPlan.filter((r) => r.plan_status === "on_time").length,
    planLate: recordedPlan.filter((r) => r.plan_status === "late").length,
    hasWorkOnly: unique.filter((r) => !r.planned_at && !!r.work_created_at).length,
    summarized: recordedSummary.length,
    summaryOnTime: recordedSummary.filter((r) => r.summary_status === "on_time").length,
    summaryLate: recordedSummary.filter((r) => r.summary_status === "late").length,
    noPlanRecord: unique.filter((r) => !r.planned_at && !r.work_created_at).length,
    noSummaryRecord: unique.length - recordedSummary.length
  };
}
function timingDaily(rows) {
  const dates = [...new Set(rows.map((row) => row.date))].sort();
  return dates.map((date) => ({
    date,
    ...timingTotals(rows.filter((row) => row.date === date))
  }));
}
function timeInVietnam(value) {
  if (!value) return "—";
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(instant);
}
function dateInVietnam(date) {
  const [year, month, day] = date.split("-");
  return [day, month, year].join("/");
}
const vnToday = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(/* @__PURE__ */ new Date());
  const get = (p) => parts.find((part) => part.type === p)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};
function shift(date, days) {
  const stamp = /* @__PURE__ */ new Date(`${date}T12:00:00Z`);
  stamp.setUTCDate(stamp.getUTCDate() + days);
  return stamp.toISOString().slice(0, 10);
}
function timingStatus(item, kind) {
  const status = kind === "plan" ? item.plan_status : item.summary_status;
  const recorded = kind === "plan" ? item.planned_at : item.summarized_at;
  if (status === "on_time") return { label: "Đúng hạn", tone: "secondary" };
  if (status === "late") return { label: "Sau mốc giờ", tone: "destructive" };
  if (kind === "plan" && status === "work_only") return { label: "Có việc, chưa ghi mốc lập", tone: "outline" };
  if (!recorded) return { label: "Chưa ghi nhận", tone: "outline" };
  return { label: "Chưa có dữ liệu", tone: "outline" };
}
function K3HubTimingDashboard({ unit, units, canCompany, onUnitChange }) {
  const { user } = useCurrentUser();
  const [window, setWindow] = reactExports.useState("seven");
  const [endDate, setEndDate] = reactExports.useState(vnToday);
  const [search, setSearch] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const startDate = shift(endDate, window === "thirty" ? -29 : window === "seven" ? -6 : 0);
  const query = useQuery({
    queryKey: ["k3hub-timing", user?.id, unit, startDate, endDate],
    queryFn: () => k3TimingRead(startDate, endDate, unit),
    enabled: !!user?.id && !!unit,
    staleTime: 3e4,
    retry: 1
  });
  const rows = query.data?.rows ?? [];
  const totals = reactExports.useMemo(() => timingTotals(rows), [rows]);
  const days = reactExports.useMemo(() => timingDaily(rows), [rows]);
  const selected = reactExports.useMemo(() => rows.filter(
    (item) => item.full_name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")) && (filter === "all" || filter === "late_plan" && item.plan_status === "late" || filter === "late_summary" && item.summary_status === "late" || filter === "no_plan" && item.plan_status === "no_record" || filter === "no_summary" && item.summary_status === "no_record" || filter === "work_only" && item.plan_status === "work_only")
  ), [rows, search, filter]);
  const visible = reactExports.useMemo(() => uniqueEmployeeDays(selected), [selected]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-52 flex-1 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-timing-unit", children: "Phạm vi báo cáo theo sơ đồ tổ chức" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "k3-timing-unit",
            className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
            value: unit,
            onChange: (e) => onUnitChange(e.target.value),
            children: [
              canCompany && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "org-company", children: "Toàn công ty (các khối áp dụng 3K)" }),
              units.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: x.id, children: [
                x.block_name,
                " · ",
                x.name
              ] }, x.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-timing-end-date", children: "Ngày kết thúc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "k3-timing-end-date",
            type: "date",
            max: vnToday(),
            value: endDate,
            onChange: (e) => setEndDate(e.target.value || vnToday()),
            className: "w-44"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-timing-window", children: "Khoảng thống kê" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "k3-timing-window",
            className: "h-10 rounded-md border bg-background px-3 text-sm",
            value: window,
            onChange: (e) => setWindow(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "today", children: "1 ngày" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "seven", children: "7 ngày" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "thirty", children: "30 ngày" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => query.refetch(), disabled: !unit || query.isFetching, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}` }),
        "Làm mới"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }),
      "Kỳ ",
      dateInVietnam(startDate),
      " – ",
      dateInVietnam(endDate),
      " · Giờ Việt Nam (UTC+7)",
      query.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "· Mốc tham chiếu lập ",
        query.data.plan_by.slice(0, 5),
        ", tổng kết ",
        query.data.summary_by.slice(0, 5)
      ] })
    ] }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", className: "rounded-xl border bg-card p-8 text-sm text-muted-foreground", children: "Đang đọc thống kê thời gian thực hiện 3K theo phạm vi quản lý…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 rounded-xl border border-destructive/30 p-4 text-sm text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Không tải được bảng thống kê giờ 3K: ",
        query.error.message
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    query.data && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }), label: "Lượt nhân sự / ngày", value: totals.peopleDays, note: "Không đếm trùng kiêm nhiệm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4" }), label: "Có giờ lập 3K", value: totals.planned, note: `${totals.planOnTime} đúng mốc` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock3, { className: "h-4 w-4" }), label: "Lập sau mốc", value: totals.planLate, note: "Theo giờ lập được lưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }), label: "Đã tổng kết", value: totals.summarized, note: `${totals.summaryOnTime} đúng mốc` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }), label: "Tổng kết sau mốc", value: totals.summaryLate, note: "Theo xác nhận hoặc lịch sử" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4" }), label: "Có KG/KF, thiếu giờ lập", value: totals.hasWorkOnly, note: "Không quy thành trễ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Xu hướng lập và tổng kết 3K theo ngày" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Mỗi lượt nhân viên chỉ tính một lần trong ngày; màu thể hiện số lượt có dấu thời gian thực tế." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-primary" }),
            "Có giờ lập"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-emerald-600" }),
            "Đã tổng kết"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-amber-500" }),
            "Có KG/KF nhưng thiếu giờ lập"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-96 space-y-3 overflow-y-auto pr-1", children: [
          days.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-sm text-muted-foreground", children: "Không có nhân sự thuộc phạm vi hoặc chưa có dữ liệu trong kỳ." }),
          days.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[4.6rem_minmax(0,1fr)_2.4rem] items-center gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-muted-foreground", children: dateInVietnam(d.date).slice(0, 5) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", "aria-label": `${d.date}: ${d.planned} lập, ${d.summarized} tổng kết, ${d.hasWorkOnly} chỉ có công việc`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-full rounded bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 rounded bg-primary", style: { width: `${d.peopleDays ? 100 * d.planned / d.peopleDays : 0}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-full rounded bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 rounded bg-emerald-600", style: { width: `${d.peopleDays ? 100 * d.summarized / d.peopleDays : 0}%` } }) }),
              d.hasWorkOnly > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded bg-amber-500", style: { width: `${d.peopleDays ? 100 * d.hasWorkOnly / d.peopleDays : 0}%` } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right tabular-nums text-muted-foreground", children: d.peopleDays })
          ] }, d.date))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Bảng giờ lập / giờ tổng kết của nhân viên" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Xem đúng đơn vị được phân công trong sơ đồ tổ chức." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            visible.length,
            " lượt nhân sự · ",
            selected.length,
            " dòng vị trí"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: search,
              onChange: (e) => setSearch(e.target.value),
              "aria-label": "Tìm nhân viên thống kê 3K",
              placeholder: "Tìm tên nhân viên…",
              className: "min-w-40 flex-1 sm:max-w-72"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              "aria-label": "Lọc theo tình trạng giờ 3K",
              value: filter,
              onChange: (e) => setFilter(e.target.value),
              className: "h-10 max-w-full rounded-md border bg-background px-3 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Tất cả ghi nhận" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "late_plan", children: "Lập sau mốc giờ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "late_summary", children: "Tổng kết sau mốc giờ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "work_only", children: "Có công việc, chưa ghi giờ lập" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "no_plan", children: "Chưa ghi nhận lập 3K" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "no_summary", children: "Chưa ghi nhận tổng kết" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[640px] overflow-auto rounded-xl border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[970px] text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 z-10 bg-muted/95 text-left text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Ngày" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "min-w-44 px-3 py-3 font-medium", children: "Nhân viên / đơn vị" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Giờ lập 3K" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Mốc lập" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Đánh giá mốc lập" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Giờ tổng kết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Mốc tổng kết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 font-medium", children: "Đánh giá tổng kết" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
            selected.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top hover:bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-3 py-3 text-xs tabular-nums", children: dateInVietnam(x.date) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: x.full_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                  x.block_name,
                  " · ",
                  x.unit_name
                ] }),
                x.multi_unit && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Kiêm nhiệm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: timeInVietnam(x.planned_at) }),
                !x.planned_at && x.work_created_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 max-w-32 text-xs text-muted-foreground", children: [
                  "KG/KF tạo lúc ",
                  timeInVietnam(x.work_created_at),
                  " (không phải giờ xác nhận lập)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 tabular-nums text-muted-foreground", children: timeInVietnam(x.plan_deadline) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TimingBadge, { item: x, kind: "plan" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: timeInVietnam(x.summarized_at) }),
                x.summary_source === "employee_review" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Xác nhận tổng kết" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 tabular-nums text-muted-foreground", children: timeInVietnam(x.summary_deadline) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TimingBadge, { item: x, kind: "summary" }) })
            ] }, `${x.date}:${x.user_id}:${x.unit_id}`)),
            selected.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-4 py-8 text-center text-sm text-muted-foreground", children: "Không có bản ghi phù hợp với bộ lọc." }) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-lg border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Lưu ý:" }),
        " Giờ lập chỉ được xác nhận khi có dấu thời gian ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "planned_at" }),
        ". Giờ tạo KG/KF là dữ liệu tham khảo, không thay thế xác nhận lập. Giờ tổng kết lấy từ xác nhận tổng kết mới hoặc lịch sử chốt ngày. Mốc giờ căn cứ quy định 3K và thời hạn lưu trong bản ghi (nếu có). Dòng chưa có dữ liệu không tự đồng nghĩa với vi phạm; không phát sinh phạt hoặc nhắc hạn hồi tố."
      ] })
    ] })
  ] });
}
function Metric({ icon, label, value, note }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-3 sm:p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-semibold tabular-nums", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: note })
  ] }) });
}
function TimingBadge({ item, kind }) {
  const s = timingStatus(item, kind);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s.tone, className: "max-w-40 whitespace-normal text-left leading-4", children: s.label });
}
const vietnamToday = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(/* @__PURE__ */ new Date());
  const get = (part) => parts.find((p) => p.type === part)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};
const statusBadge = (s) => s === "confirmed" ? "default" : s === "none" ? "outline" : "secondary";
function K3CommonWorkspace({ title, initialUnit, central = false, restrictToArea = false }) {
  const { user, can } = useCurrentUser();
  const [tab, setTab] = reactExports.useState(central ? "report" : "mine");
  const [unitOverride, setUnitOverride] = reactExports.useState(null);
  const access = useQuery({
    queryKey: ["k3hub-access", user?.id],
    queryFn: ({ signal }) => k3HubAccessWithSignal(signal),
    enabled: !!user?.id && user.status === "Đang hoạt động",
    staleTime: 9e4,
    refetchOnWindowFocus: false,
    retry: 1
  });
  const data = access.data;
  const chart = useQuery({
    queryKey: ["k3hub-area-chart", user?.id],
    queryFn: ({ signal }) => k3HubAreaChartWithSignal(signal),
    enabled: restrictToArea && !!user?.id && user.status === "Đang hoạt động",
    staleTime: 9e4,
    refetchOnWindowFocus: false,
    retry: 1
  });
  const areaIds = reactExports.useMemo(() => areaUnitIds(chart.data?.units ?? [], initialUnit), [chart.data, initialUnit]);
  const options = (data?.units ?? []).filter((u) => !restrictToArea || areaIds.has(u.id));
  const canReport = !!(data?.can_manage || data?.can_company) && (!restrictToArea || options.length > 0);
  const hasPersonalArea = !restrictToArea || !!data?.can_company || !!user && !!chart.data && hasAreaAppointment(chart.data.members, user.id, areaIds, Date.parse(chart.data.server_now));
  const canPersonal = !!data?.can_personal && hasPersonalArea;
  const initial = central ? data?.can_company ? "org-company" : options[0]?.id ?? "" : data?.can_company ? initialUnit : options.find((x) => x.id === initialUnit)?.id ?? options.find((x) => x.block_id === initialUnit)?.id ?? "";
  const selectedUnit = restrictToArea ? selectAreaUnit(options, initialUnit, unitOverride) : unitOverride !== null && (unitOverride === "org-company" && data?.can_company || options.some((x) => x.id === unitOverride)) ? unitOverride : initial;
  const visibleTab = tab === "policy" && !data?.can_config ? "report" : tab === "mine" && !canPersonal && canReport ? "report" : tab === "report" && !canReport ? "mine" : tab;
  const hasArea = (central ? canReport : canPersonal || canReport) && (!restrictToArea || can("k3hub.biz") || can("k3hub.use"));
  const pending = access.isPending || restrictToArea && chart.isPending;
  const error = access.error ?? (restrictToArea ? chart.error : null);
  if (user?.status !== "Đang hoạt động") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-sm text-muted-foreground", children: "Cần đăng nhập tài khoản đang hoạt động." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-5 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title, description: central ? "Dashboard phân tích giờ lập · giờ tổng kết · đúng hạn / trễ hạn theo cơ cấu tổ chức" : "3K theo phạm vi vị trí · Dùng chung dữ liệu với Trung tâm 3K" }),
    pending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-6 text-sm text-muted-foreground", children: "Đang xác minh phạm vi 3K theo sơ đồ tổ chức…" }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 rounded-xl border p-4 text-sm text-destructive", children: [
      "Không tải được quyền 3K: ",
      error.message,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        void access.refetch();
        if (restrictToArea) void chart.refetch();
      }, children: "Tải lại" })
    ] }),
    data && !pending && !error && !hasArea && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-xl border bg-card p-6 text-sm text-muted-foreground", children: "Chưa có phân công hoặc quyền 3K hợp lệ trong khu vực này." }),
    data && !pending && !error && hasArea && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-b pb-3", children: [
        !central && canPersonal && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: visibleTab === "mine" ? "default" : "outline",
            onClick: () => setTab("mine"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "mr-2 h-4 w-4" }),
              "3K của tôi"
            ]
          }
        ),
        canReport && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: visibleTab === "report" ? "default" : "outline",
            onClick: () => setTab("report"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 h-4 w-4" }),
              "Theo dõi ",
              central ? "toàn hệ thống" : "khu vực"
            ]
          }
        ),
        central && data.can_config && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: visibleTab === "policy" ? "default" : "outline",
            onClick: () => setTab("policy"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "mr-2 h-4 w-4" }),
              "Phạm vi áp dụng"
            ]
          }
        )
      ] }),
      visibleTab === "mine" && canPersonal && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-muted/25 p-4 text-sm text-muted-foreground", children: "Lập KG, KF và cập nhật KPI cá nhân tại đây. Dữ liệu được ghi vào 3K chung; không có bản sao theo từng khối. Quy tắc hạn chốt vẫn lấy từ cấu hình 3K hiện hành." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3K, { personalOnly: true })
      ] }),
      visibleTab === "report" && canReport && (central ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        K3HubTimingDashboard,
        {
          unit: selectedUnit,
          units: options,
          canCompany: data.can_company && !restrictToArea,
          onUnitChange: setUnitOverride
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        K3HubReportPanel,
        {
          unit: selectedUnit,
          units: options,
          canCompany: data.can_company && !restrictToArea,
          onUnitChange: setUnitOverride
        }
      )),
      visibleTab === "policy" && data.can_config && /* @__PURE__ */ jsxRuntimeExports.jsx(K3HubPolicyPanel, {}),
      central && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Trung tâm 3K dành cho quản lý xem số liệu, giờ lập, giờ tổng kết và phân tích theo cây tổ chức. Nhân viên làm 3K trong khu vực của mình; dữ liệu chỉ được lập một lần và tổng hợp lên cấp quản lý." })
    ] })
  ] });
}
function K3HubReportPanel({ unit, units, canCompany, onUnitChange }) {
  const { user } = useCurrentUser();
  const [date, setDate] = reactExports.useState(vietnamToday);
  const [status, setStatus] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const report = useQuery({
    queryKey: ["k3hub-report", user?.id, date, unit],
    queryFn: () => k3HubReport(date, unit),
    enabled: !!user?.id && !!unit,
    retry: 1,
    staleTime: 2e4
  });
  const filtered = reactExports.useMemo(() => (report.data?.people ?? []).filter(
    (p) => (status === "all" || p.state === status) && p.full_name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi"))
  ), [report.data, status, search]);
  const totals = k3HubTotals(report.data?.people ?? []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3hub-date", children: "Ngày xem" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "k3hub-date",
            type: "date",
            value: date,
            max: vietnamToday(),
            onChange: (e) => setDate(e.target.value),
            className: "w-44"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-44 flex-1 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3hub-unit", children: "Phạm vi tổ chức" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "k3hub-unit",
            value: unit,
            onChange: (e) => {
              onUnitChange(e.target.value);
              setSelected(null);
            },
            className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
            children: [
              canCompany && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "org-company", children: "Toàn công ty (trừ khối chưa áp dụng)" }),
              units.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: u.id, children: [
                u.block_name,
                " · ",
                u.name
              ] }, u.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: report.isFetching, onClick: () => report.refetch(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `mr-2 h-4 w-4 ${report.isFetching ? "animate-spin" : ""}` }),
        "Làm mới"
      ] })
    ] }),
    report.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Nhân sự", value: totals.people }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chưa cập nhật", value: totals.pending }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đã xác nhận", value: totals.confirmed }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "KG", value: totals.goals }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "KF", value: totals.actions }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Kết quả KPI", value: totals.results })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: search,
          onChange: (e) => setSearch(e.target.value),
          "aria-label": "Tìm nhân sự 3K",
          placeholder: "Tìm nhân viên…",
          className: "min-w-40 flex-1 sm:max-w-72"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          "aria-label": "Lọc trạng thái",
          value: status,
          onChange: (e) => setStatus(e.target.value),
          className: "h-10 rounded-md border bg-background px-3 text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Tất cả trạng thái" }),
            Object.entries(K3_HUB_STATES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k))
          ]
        }
      )
    ] }),
    report.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-sm text-muted-foreground", children: "Đang tổng hợp dữ liệu 3K…" }),
    report.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "rounded-xl border p-4 text-sm text-destructive", children: [
      report.error.message,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => report.refetch(), children: "Thử lại" })
    ] }),
    report.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        filtered.length,
        " dòng phân công thuộc phạm vi được xem. Người có nhiều vị trí chỉ được tính một lần ở chỉ số nhân sự."
      ] }),
      !filtered.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border px-4 py-7 text-center text-sm text-muted-foreground", children: "Chưa có nhân sự hoặc kết quả phù hợp." }),
      filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSelected(p),
          className: "w-full rounded-xl border bg-card p-4 text-left hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: p.full_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                  p.block_name,
                  " · ",
                  p.unit_name,
                  " · ",
                  p.position
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: statusBadge(p.state), children: K3_HUB_STATES[p.state] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-muted-foreground", children: [
              p.goals_count,
              " KG · ",
              p.actions_count,
              " KF · ",
              p.results_count,
              " kết quả KPI"
            ] })
          ]
        },
        `${p.unit_id}:${p.user_id}`
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground", children: "Trung tâm 3K chỉ tổng hợp dữ liệu đã lưu có nguồn tổ chức xác định. Các công việc cũ không đủ thông tin đơn vị không tự bị gán sang phòng khác. Không phát sinh chấm lỗi hoặc kỷ luật hồi tố." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(K3HubMemberDialog, { person: selected, unit, date, onClose: () => setSelected(null) })
  ] });
}
function Stat({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-semibold tabular-nums", children: value })
  ] }) });
}
function K3HubMemberDialog({ person, unit, date, onClose }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [body, setBody] = reactExports.useState("");
  const details = useQuery({
    queryKey: ["k3hub-member", user?.id, person?.user_id, date, unit],
    queryFn: () => {
      if (!person) throw new Error("Chưa chọn nhân sự.");
      return k3HubDetails(person.user_id, date, unit);
    },
    enabled: !!person,
    retry: 1,
    staleTime: 15e3
  });
  const save = useMutation({
    mutationFn: () => {
      if (!person) throw new Error("Chưa chọn nhân sự.");
      return k3HubFeedbackSave(person.user_id, date, unit, body);
    },
    onSuccess: async () => {
      setBody("");
      toast.success("Đã ghi nhận nhận xét.");
      await qc.invalidateQueries({ queryKey: ["k3hub-member"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Không thể lưu nhận xét.")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!person, onOpenChange: (open) => {
    if (!open) {
      setBody("");
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[88dvh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "3K ",
      person?.full_name,
      " · ",
      date.split("-").reverse().join("/")
    ] }) }),
    details.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-sm text-muted-foreground", children: "Đang đọc KG/KF/KPI…" }),
    details.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: details.error.message }),
    details.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
          "KG · Mục tiêu (",
          details.data.goals.length,
          ")"
        ] }),
        !details.data.goals.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa có KG thuộc phạm vi này." }),
        details.data.goals.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: g.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            g.status,
            " · Hạn ",
            g.due_date ?? "—"
          ] }),
          g.expected_result && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: g.expected_result })
        ] }, g.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
          "KF · Việc thực thi (",
          details.data.actions.length,
          ")"
        ] }),
        !details.data.actions.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa có KF thuộc phạm vi này." }),
        details.data.actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: a.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            a.goal_name,
            " · ",
            a.status
          ] })
        ] }, a.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
          "KPI · Kết quả thực tế (",
          details.data.results.length,
          ")"
        ] }),
        !details.data.results.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa có kết quả KPI thuộc phạm vi này." }),
        details.data.results.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Thực tế: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              r.value ?? "Chưa có",
              " ",
              r.unit ?? ""
            ] }),
            r.target == null ? "" : ` / Mục tiêu: ${r.target} ${r.unit ?? ""}`
          ] }),
          r.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: r.note })
        ] }, i))
      ] }),
      details.data.day?.summary_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-1 font-semibold", children: "Tổng kết ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: details.data.day.summary_note })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquareText, { className: "h-4 w-4" }),
          "Nhận xét quản lý"
        ] }),
        details.data.feedback.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: f.body }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            f.author_name,
            " · ",
            new Date(f.created_at).toLocaleString("vi-VN")
          ] })
        ] }, f.id)),
        !details.data.feedback.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa có nhận xét." }),
        details.data.can_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3hub-comment", children: "Nhận xét (tối đa 2.000 ký tự)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "k3hub-comment",
              value: body,
              onChange: (e) => setBody(e.target.value),
              maxLength: 2e3,
              rows: 3,
              placeholder: "Nhận xét kết quả và hướng dẫn cải thiện…"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !body.trim() || save.isPending, onClick: () => save.mutate(), children: save.isPending ? "Đang lưu…" : "Lưu nhận xét" })
        ] })
      ] })
    ] })
  ] }) });
}
function K3HubPolicyPanel() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["k3hub-policy"], queryFn: k3HubPolicyRead, retry: 1 });
  if (query.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-sm text-muted-foreground", children: "Đang tải phạm vi áp dụng 3K…" });
  if (query.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-destructive", children: [
    query.error.message,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => query.refetch(), children: "Thử lại" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PolicyEditor, { policy: query.data, onSaved: async () => {
    await qc.invalidateQueries({ queryKey: ["k3hub-policy"] });
    await qc.invalidateQueries({ queryKey: ["k3hub-access"] });
    await qc.invalidateQueries({ queryKey: ["k3hub-report"] });
  } }, String(query.data.revision));
}
function PolicyEditor({ policy, onSaved }) {
  const [blocks, setBlocks] = reactExports.useState(policy.applied_block_ids);
  const [date, setDate] = reactExports.useState(policy.effective_from >= policy.today ? policy.effective_from : policy.today);
  const [reason, setReason] = reactExports.useState("");
  const save = useMutation({
    mutationFn: () => k3HubPolicySave(policy.revision, date, blocks, reason),
    onSuccess: async () => {
      toast.success("Đã lưu phiên bản chính sách 3K.");
      await onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Không lưu được chính sách.")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-2xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Áp dụng 3K theo Khối" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Các Khối được chọn sẽ xuất hiện trong báo cáo chung và khu vực. Marketing mặc định không chọn. Đây là chính sách phạm vi hiển thị, chưa tự kích hoạt chế tài, nhắc hạn hoặc áp nghĩa vụ hồi tố trong hệ thống 3K cũ." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: policy.blocks.map((block) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        className: "flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-3 text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
            block.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              className: "size-4 accent-primary",
              checked: blocks.includes(block.id),
              onChange: (e) => setBlocks((curr) => e.target.checked ? [...curr, block.id] : curr.filter((x) => x !== block.id))
            }
          )
        ]
      },
      block.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3hub-effective", children: "Ngày bắt đầu hiệu lực" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "k3hub-effective",
            type: "date",
            min: policy.today,
            value: date,
            onChange: (e) => setDate(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3hub-reason", children: "Lý do thay đổi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "k3hub-reason",
            value: reason,
            onChange: (e) => setReason(e.target.value),
            placeholder: "Ví dụ: Kích hoạt 3K cho Khối Vận hành"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Phiên bản #",
      policy.revision,
      " · Lịch sử các phiên bản không bị xóa. Việc chọn Khối mới không tự động cấp quyền nhân sự và không sửa lịch sử 3K."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        disabled: save.isPending || reason.trim().length < 5 || !date,
        onClick: () => save.mutate(),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
          save.isPending ? "Đang lưu…" : "Lưu phạm vi áp dụng"
        ]
      }
    )
  ] });
}
export {
  K3CommonWorkspace as K
};
