import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, q as queryOptions, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { F as useAuth, B as Button, af as DropdownMenu, ag as DropdownMenuTrigger, ah as DropdownMenuContent, ai as DropdownMenuItem, j as cn, l as Badge, I as Input, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, T as Switch, E as DialogFooter, N as Checkbox, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, aR as Progress, a as useServerFn, c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { k as k3MetricDisplay, n as newK3KpiDraft, a as k3KpiPayload, b as k3DailyReport } from "./k3DailyReport-C2AYBx3X.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-CW0Q8d6x.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { u as ListChecks, w as Users, p as ClipboardList, aK as Ellipsis, aQ as Archive, aj as Settings2, a6 as Plus, ar as CircleCheck, f as Search, ao as Pencil, aR as History, I as CalendarDays, C as ClipboardCheck, a9 as LoaderCircle, aS as CircleDashed, T as Target, q as Check, X, a4 as Star, ab as RotateCcw, aT as ChevronLeft, s as ChevronRight, ap as Trash2, aU as UserPlus, aV as TriangleAlert, aW as TrendingUp, aX as Flame, aY as Percent, a1 as FingerprintPattern, aZ as Scale, a_ as Timer, n as ChevronDown } from "../_libs/lucide-react.mjs";
const k3SettingsQuery = (uid) => queryOptions({
  queryKey: ["k3_settings", uid],
  staleTime: 6e4,
  refetchOnWindowFocus: false,
  retry: false,
  queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_settings_read");
    if (error) throw error;
    return data;
  }
});
const k3DayQuery = (uid, date) => queryOptions({
  queryKey: ["k3_day", uid, date],
  staleTime: 3e4,
  refetchOnWindowFocus: false,
  retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_day_read", { _date: date });
    if (error) throw error;
    return data;
  }
});
function useK3Invalidate() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") && q.queryKey[0] !== "k3_preview" });
  };
}
function useK3TaskSave() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.rpc("k3_task_save", { _payload: payload });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate
  });
}
function useK3TaskUpdate() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (a) => {
      const { data, error } = await supabase.rpc("k3_task_save", { _payload: a });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate
  });
}
function useK3TaskDelete() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.rpc("k3_task_delete", { _id: id });
      if (error) throw error;
    },
    onSuccess: invalidate
  });
}
function useK3Summary() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (date) => {
      const { data, error } = await supabase.rpc("k3_summary_confirm", { _date: date });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate
  });
}
function useK3SettingsSave() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (a) => {
      const { data, error } = await supabase.rpc("k3_settings_save", {
        _enabled: a.enabled,
        _effective_from: a.effective_from,
        _plan_by: a.plan_by,
        _summary_by: a.summary_by,
        _max_focus: a.max_focus
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate
  });
}
const K3_STATUS = {
  todo: { label: "Chưa làm", tone: "neutral" },
  doing: { label: "Đang thực hiện", tone: "info" },
  done: { label: "Hoàn thành", tone: "success" },
  paused: { label: "Tạm dừng", tone: "warning" },
  incomplete: { label: "Kết thúc – Chưa đạt chỉ tiêu", tone: "danger" }
};
function k3Ratio(t) {
  if (t.kpi_target == null || t.kpi_target <= 0 || t.kpi_actual == null) return null;
  return Math.round(t.kpi_actual / t.kpi_target * 100);
}
function k3ProgressLabel(t) {
  const ratio = k3Ratio(t);
  return `${ratio ?? t.progress}%`;
}
function k3Counts(tasks) {
  const done = tasks.filter(k3IsComplete).length;
  const doing = tasks.filter((t) => t.status === "doing").length;
  const open = tasks.length - done;
  const focus = tasks.filter((t) => t.is_focus).length;
  const issues = tasks.filter((t) => !k3IsComplete(t) && (hasText(t.problem) || hasText(t.solution))).length;
  return { total: tasks.length, done, doing, open, focus, issues };
}
function k3IsComplete(t) {
  if (t.status !== "done") return false;
  return t.kpi_target != null && t.kpi_target > 0 ? Number(t.kpi_actual ?? 0) >= Number(t.kpi_target) : t.progress == null || t.progress >= 100;
}
function k3DisplayStatus(t) {
  return t.status === "done" && !k3IsComplete(t) ? "incomplete" : t.status;
}
function hasText(v) {
  return !!v && v.trim().length > 0;
}
function k3NeedsConfirmation(day) {
  return !!day?.summarized_at && day.data_revision != null && day.confirmed_revision !== day.data_revision;
}
function k3LateFlags(day, s, workDate, now = /* @__PURE__ */ new Date()) {
  const deadline = (value) => Date.parse(`${workDate}T${value.length === 5 ? `${value}:00` : value}+07:00`);
  const instant = (value) => Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+07:00`);
  const planDue = day?.plan_deadline ? instant(day.plan_deadline) : deadline(s.plan_by);
  const summaryDue = day?.summary_deadline ? instant(day.summary_deadline) : deadline(s.summary_by);
  const planLate = day?.planned_at ? instant(day.planned_at) > planDue : null;
  const summaryLate = day?.summarized_at ? instant(day.summarized_at) > summaryDue : null;
  const summaryOverdue = (!day?.summarized_at || k3NeedsConfirmation(day)) && !!s.effective_from && workDate >= s.effective_from && now.getTime() > summaryDue;
  const planLateMinutes = day?.planned_at ? Math.max(0, Math.floor((instant(day.planned_at) - planDue) / 6e4)) : null;
  return { planLate, summaryLate, summaryOverdue, planLateMinutes };
}
function k3Error(e) {
  const message = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e && typeof e.message === "string" ? e.message : "";
  const code = typeof e === "object" && e && "code" in e ? String(e.code) : "";
  if (code === "57014" || /statement timeout/i.test(message)) return "Hết thời gian chờ lưu công việc. Vui lòng thử lại; yêu cầu cũ được giữ để tránh tạo trùng.";
  if (/^(?:42|22|23|XX|PGRST)/.test(code) || /column .* does not exist|relation .* does not exist|syntax error|permission denied|violates .*constraint|invalid input syntax|SQLSTATE/i.test(message)) {
    console.error("[3K] RPC failure", { code, message });
    return "Chưa thể xử lý công việc lúc này. Vui lòng thử lại; nếu vẫn lỗi, báo quản trị viên.";
  }
  if (message) return message;
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}
const K3_TIME_HINT = 'Ví dụ tên công việc tốt: "Gọi 10 khách hàng tiềm năng khu vực Hà Nội" thay vì "Gọi khách".';
function isK3AmbiguousWrite(error) {
  if (!error || typeof error !== "object") return false;
  const e = error;
  const code = String(e.code ?? "");
  const message = String(e.message ?? "");
  const status = Number(e.status);
  return code === "57014" || code === "PGRST000" || /^08[0-9A-Z]{3}$/.test(code) || [408, 502, 503, 504, 520, 522, 524].includes(status) || /timeout|timed out|network|failed to fetch|fetch failed|connection (?:closed|lost|reset)|abort/i.test(message) || e.name === "AbortError";
}
async function checkK3QuickCreate(uid, requestKey) {
  if (!uid || !requestKey) return { status: "unknown" };
  try {
    const { data, error } = await supabase.from("k3_goals").select("id").eq("user_id", uid).eq("request_key", requestKey).maybeSingle();
    if (error) return { status: "unknown" };
    return data?.id ? { status: "saved", id: data.id } : { status: "missing" };
  } catch {
    return { status: "unknown" };
  }
}
async function checkK3ResultSave(uid, requestKey) {
  if (!uid || !requestKey) return { status: "unknown" };
  try {
    const { data, error } = await supabase.from("k3_kpi_result_versions").select("result_id").eq("actor_id", uid).eq("request_key", requestKey).maybeSingle();
    if (error) return { status: "unknown" };
    return data?.result_id ? { status: "saved", id: data.result_id } : { status: "missing" };
  } catch {
    return { status: "unknown" };
  }
}
async function checkK3TaskSave(uid, requestKey) {
  if (!uid || !requestKey) return { status: "unknown" };
  try {
    const { data, error } = await supabase.from("k3_tasks").select("id").eq("user_id", uid).eq("request_key", requestKey).maybeSingle();
    if (error) return { status: "unknown" };
    return data?.id ? { status: "saved", id: data.id } : { status: "missing" };
  } catch {
    return { status: "unknown" };
  }
}
const k3GoalListQuery = (uid, filter, q) => queryOptions({
  queryKey: ["k3_goals", uid, filter, q],
  staleTime: 45e3,
  refetchInterval: 9e4,
  refetchOnWindowFocus: false,
  retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_goal_list", { _filter: filter, _q: q });
    if (error) throw error;
    return data;
  }
});
const k3GoalDetailQuery = (uid, id) => queryOptions({
  queryKey: ["k3_goal", uid, id],
  staleTime: 45e3,
  refetchInterval: 9e4,
  refetchOnWindowFocus: false,
  retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_goal_detail", { _id: id });
    if (error) throw error;
    return data;
  }
});
const k3MemberSearchQuery = (uid, q) => queryOptions({
  queryKey: ["k3_member_search", uid, q],
  staleTime: 3e4,
  queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_member_search", { _q: q });
    if (error) throw error;
    return data;
  }
});
function useK3GoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      let result;
      if (input.kind === "quick_create") result = await supabase.rpc("k3_quick_create", { _payload: input.payload });
      else if (input.kind === "activate") result = await supabase.rpc("k3_goal_activate", { _id: input.id, _revision: input.revision });
      else if (input.kind === "goal") result = await supabase.rpc("k3_goal_save", { _payload: input.payload });
      else if (input.kind === "goal_status") result = await supabase.rpc("k3_goal_status", { _id: input.id, _status: input.status, _note: input.note ?? null, _revision: input.revision });
      else if (input.kind === "invite") result = await supabase.rpc("k3_member_invite", { _goal_id: input.goal_id, _user_ids: input.user_ids });
      else if (input.kind === "respond") result = await supabase.rpc("k3_member_respond", { _goal_id: input.goal_id, _accept: input.accept });
      else if (input.kind === "revoke") result = await supabase.rpc("k3_member_revoke", { _goal_id: input.goal_id, _user_id: input.user_id });
      else if (input.kind === "action") result = await supabase.rpc("k3_action_save", { _payload: input.payload });
      else if (input.kind === "action_status") result = await supabase.rpc("k3_action_status", { _id: input.id, _status: input.status, _problem: input.problem ?? null, _cause: input.cause ?? null, _solution: input.solution ?? null, _revision: input.revision });
      else if (input.kind === "kpi") result = await supabase.rpc("k3_kpi_configure", { _payload: input.payload });
      else if (input.kind === "kpi_delete") result = await supabase.rpc("k3_kpi_delete", { _id: input.id });
      else result = await supabase.rpc("k3_module_settings_save", { _payload: input.payload });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") && q.queryKey[0] !== "k3_preview" });
    }
  });
}
function MemberPicker({ selected, onChange, exclude }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const [q, setQ] = reactExports.useState("");
  const { data } = useQuery({ ...k3MemberSearchQuery(uid, q), enabled: !!uid });
  const options = (data ?? []).filter((r) => !selected.some((s) => s.id === r.id) && !exclude?.includes(r.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm theo tên nhân sự…", value: q, onChange: (e) => setQ(e.target.value) }),
    selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: selected.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
      s.full_name,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": `Bỏ ${s.full_name}`, onClick: () => onChange(selected.filter((x) => x.id !== s.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
    ] }, s.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-1", children: [
      options.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange([...selected, r]),
          className: "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-secondary",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.full_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: r.departments.join(" · ") || "—" })
          ]
        },
        r.id
      )),
      options.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-1 text-xs text-muted-foreground", children: "Không có nhân sự phù hợp." })
    ] })
  ] });
}
const K3_MEASURE_LABELS = {
  cumulative: "Số lượng cộng dồn",
  distinct: "Số lượng không trùng",
  current: "Giá trị hiện tại",
  ratio: "Tỷ lệ phần trăm",
  average: "Giá trị trung bình",
  milestone: "Mốc hoàn thành",
  duration: "Thời lượng (phút)",
  binary: "Có / Chưa",
  frequency: "Tần suất",
  streak: "Chuỗi liên tục"
};
const K3_CONDITION_LABELS = {
  gte: "≥ mục tiêu",
  lte: "≤ mục tiêu",
  eq: "= mục tiêu",
  range: "Trong khoảng"
};
const modes = [
  { value: "cumulative", label: "Tích lũy", icon: TrendingUp, example: "200 đại lý" },
  { value: "current", label: "Đạt con số", icon: Target, example: "Tỷ lệ lỗi ≤ 2%" },
  { value: "binary", label: "Có / Chưa", icon: CircleCheck, example: "Hoàn thành hợp đồng" },
  { value: "milestone", label: "Cột mốc", icon: ListChecks, example: "5 bước triển khai" },
  { value: "frequency", label: "Tần suất", icon: CalendarDays, example: "3 cuộc gặp / tuần" },
  { value: "streak", label: "Chuỗi liên tục", icon: Flame, example: "7 ngày chăm sóc" },
  { value: "ratio", label: "Tỷ lệ", icon: Percent, example: "Chốt / khách hợp lệ" },
  { value: "distinct", label: "Không trùng", icon: FingerprintPattern, example: "Đại lý có mã duy nhất" },
  { value: "average", label: "Trung bình", icon: Scale, example: "Giá trị / số đơn" },
  { value: "duration", label: "Thời lượng", icon: Timer, example: "40 giờ đào tạo" }
];
function Biz3KKpiConfig({ value: k, onChange, suggestedName = "", expectedResult = "", compact = false, contextual = false, fieldsOnly = false, expanded = false }) {
  const id = k.request_key;
  const set = (name, value) => onChange({ ...k, [name]: value });
  const config = (name, value) => onChange({ ...k, config: { ...k.config, [name]: value } });
  const choose = (measure) => onChange({ ...k, measure, condition: "gte", config: { ...k.config, ...measure === "frequency" || measure === "streak" ? { cycle: measure === "streak" ? "day" : "week" } : {}, ...measure === "distinct" ? { normalization: "exact" } : {}, ...measure === "duration" ? { duration_unit: "minutes", duration_method: "total" } : {} } });
  const cards = (items) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: items.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", "aria-pressed": k.measure === m.value, onClick: () => choose(m.value), className: cn("h-auto min-h-20 flex-col items-start gap-1 whitespace-normal p-3 text-left", k.measure === m.value && "border-primary bg-primary/5 ring-1 ring-primary"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(m.icon, { className: "h-4 w-4 shrink-0" }),
      m.label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: m.example })
  ] }, m.value)) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-3", children: [
    !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-name`, children: "Tên KPI *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-name`, value: k.name, placeholder: suggestedName, onChange: (e) => set("name", e.target.value) })
    ] }),
    !fieldsOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: contextual ? "Đo kết quả bằng cách nào? *" : "Bạn muốn theo dõi KPI theo cách nào?" }),
      contextual ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["binary", "cumulative"].includes(k.measure) ? k.measure : "other", onValueChange: (v) => choose(v === "other" ? "current" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "binary", children: "Hoàn thành / Chưa hoàn thành" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cumulative", children: "Số lượng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Cách đo khác" })
          ] })
        ] }),
        !["binary", "cumulative"].includes(k.measure) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: k.measure, onValueChange: (v) => choose(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: modes.filter((m) => !["binary", "cumulative"].includes(m.value)).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        cards(modes.slice(0, 6)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: expanded || modes.slice(6).some((m) => m.value === k.measure), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex cursor-pointer items-center gap-1 text-sm font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }),
            "Đo lường nâng cao"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: cards(modes.slice(6)) })
        ] })
      ] })
    ] }),
    !["binary", "milestone"].includes(k.measure) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-target`, children: k.measure === "streak" ? "Số ngày liên tiếp *" : k.measure === "frequency" ? "Số lần mỗi chu kỳ *" : "Mục tiêu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-target`, type: "number", min: 0, step: "any", value: k.target, onChange: (e) => set("target", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-unit`, children: "Đơn vị" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-unit`, value: k.unit, onChange: (e) => set("unit", e.target.value) })
      ] })
    ] }),
    !["binary", "milestone", "streak"].includes(k.measure) && !(contextual && k.measure === "cumulative") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Điều kiện đạt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: k.condition, onValueChange: (v) => set("condition", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(K3_CONDITION_LABELS).map(([v, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: label }, v)) })
      ] })
    ] }),
    k.condition === "range" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-max`, children: "Giới hạn trên *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-max`, type: "number", value: k.target_max, onChange: (e) => set("target_max", e.target.value) })
    ] }),
    ["cumulative", "current"].includes(k.measure) && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: expanded, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm", children: "Giá trị bắt đầu và độ chính xác" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-baseline`, children: "Giá trị bắt đầu (có căn cứ)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-baseline`, type: "number", value: k.config.baseline ?? "", onChange: (e) => config("baseline", e.target.value === "" ? void 0 : Number(e.target.value)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-source`, children: "Nguồn giá trị bắt đầu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-source`, value: k.config.baseline_source ?? "", onChange: (e) => config("baseline_source", e.target.value) }),
        k.measure === "current" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-tolerance`, children: "Sai số so sánh" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-tolerance`, type: "number", min: 0, value: k.config.tolerance ?? "", onChange: (e) => config("tolerance", e.target.value === "" ? void 0 : Number(e.target.value)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-precision`, children: "Chữ số thập phân" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-precision`, type: "number", min: 0, max: 8, value: k.config.precision ?? 2, onChange: (e) => config("precision", Number(e.target.value)) })
        ] })
      ] })
    ] }),
    ["binary", "frequency", "streak"].includes(k.measure) && (!expanded && k.measure === "binary" && expectedResult.trim() && !k.config.valid_condition?.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: expanded, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm", children: "Tùy chỉnh tiêu chí hoàn thành" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-2", "aria-label": "Điều kiện hoàn thành KPI", placeholder: expectedResult, value: k.config.valid_condition ?? "", onChange: (e) => config("valid_condition", e.target.value) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-condition`, children: k.measure === "binary" ? "Tiêu chí hoàn thành *" : "Điều kiện kết quả hợp lệ *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: `${id}-condition`, value: k.config.valid_condition ?? "", onChange: (e) => config("valid_condition", e.target.value) })
    ] })),
    ["frequency", "streak"].includes(k.measure) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      k.measure === "frequency" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chu kỳ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: k.config.cycle ?? "week", onValueChange: (v) => config("cycle", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "day", children: "Ngày" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "week", children: "Tuần" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "Tháng" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-start`, children: "Áp dụng từ *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-start`, type: "date", value: k.config.start_date ?? "", onChange: (e) => config("start_date", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-end`, children: "Đến ngày *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-end`, type: "date", value: k.config.end_date ?? "", onChange: (e) => config("end_date", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày áp dụng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: [1, 2, 3, 4, 5, 6, 7].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: (k.config.weekdays ?? [1, 2, 3, 4, 5, 6, 7]).includes(d) ? "default" : "outline", onClick: () => {
        const days = k.config.weekdays ?? [1, 2, 3, 4, 5, 6, 7];
        config("weekdays", days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
      }, children: d === 7 ? "CN" : `T${d + 1}` }, d)) })
    ] }),
    k.measure === "distinct" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-entity`, children: "Loại đối tượng *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-entity`, value: k.config.entity_type ?? "", onChange: (e) => config("entity_type", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-identifier`, children: "Trường định danh duy nhất *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-identifier`, value: k.config.identifier_field ?? "", onChange: (e) => config("identifier_field", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quy tắc trùng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: k.config.normalization ?? "exact", onValueChange: (v) => config("normalization", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "exact", children: "Khớp chính xác" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "trim_lower", children: "Bỏ khoảng trắng đầu/cuối, không phân biệt hoa/thường" })
        ] })
      ] })
    ] }),
    k.measure === "duration" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn vị nhập" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: k.config.duration_unit ?? "minutes", onValueChange: (v) => config("duration_unit", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "minutes", children: "Phút" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hours", children: "Giờ" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: k.config.duration_method ?? "total", onValueChange: (v) => config("duration_method", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "total", children: "Tổng thời lượng ngày" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "intervals", children: "Khoảng thời gian không chồng lấn" })
          ] })
        ] })
      ] })
    ] }),
    k.measure === "milestone" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: k.config.sequential ?? false, onCheckedChange: (v) => config("sequential", v === true) }),
        "Mốc tuần tự"
      ] }),
      (k.config.milestones ?? []).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b border-border py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: i + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Tên mốc ${i + 1}`, value: m.name, onChange: (e) => config("milestones", k.config.milestones?.map((x) => x.id === m.id ? { ...x, name: e.target.value } : x)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "ghost", "aria-label": `Xóa mốc ${i + 1}`, onClick: () => config("milestones", k.config.milestones?.filter((x) => x.id !== m.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Điều kiện mốc ${i + 1}`, placeholder: "Điều kiện hoàn thành *", value: m.condition, onChange: (e) => config("milestones", k.config.milestones?.map((x) => x.id === m.id ? { ...x, condition: e.target.value } : x)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Deadline mốc ${i + 1}`, type: "date", value: m.deadline ?? "", onChange: (e) => config("milestones", k.config.milestones?.map((x) => x.id === m.id ? { ...x, deadline: e.target.value } : x)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Trọng số mốc ${i + 1}`, placeholder: "Trọng số % (tùy chọn)", type: "number", value: m.weight ?? "", onChange: (e) => config("milestones", k.config.milestones?.map((x) => x.id === m.id ? { ...x, weight: e.target.value === "" ? void 0 : Number(e.target.value) } : x)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: m.required, onCheckedChange: (v) => config("milestones", k.config.milestones?.map((x) => x.id === m.id ? { ...x, required: v === true } : x)) }),
          "Mốc bắt buộc"
        ] })
      ] }, m.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => config("milestones", [...k.config.milestones ?? [], { id: crypto.randomUUID(), name: "", condition: "", required: true }]), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        "Thêm mốc"
      ] })
    ] }),
    k.measure === "cumulative" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-daily`, children: "Chỉ tiêu kế hoạch mỗi ngày (tùy chọn)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-daily`, type: "number", min: 0, value: k.config.daily_target ?? "", onChange: (e) => config("daily_target", e.target.value === "" ? void 0 : Number(e.target.value)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: expanded, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm", children: "Tùy chọn nâng cao" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: k.required, onCheckedChange: (v) => set("required", v === true) }),
          "KPI bắt buộc"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: k.config.evidence_required ?? false, onCheckedChange: (v) => config("evidence_required", v === true) }),
          "Yêu cầu bằng chứng"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: k.config.acceptance_required ?? false, onCheckedChange: (v) => config("acceptance_required", v === true) }),
          "Yêu cầu nghiệm thu"
        ] }),
        compact && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên KPI tùy chỉnh", placeholder: suggestedName, value: k.name, onChange: (e) => set("name", e.target.value) })
      ] })
    ] })
  ] });
}
const newCreationKf = () => ({ key: crypto.randomUUID(), name: "", kpis: [{ ...newK3KpiDraft(), measure: "binary" }], start_date: "", due_date: "", start_time: "", due_time: "", inherit_timeline: true, execution_schedule: { mode: "daily" } });
function canUseBasicCreation(kfs, name, memberCount = 0) {
  const k = kfs[0];
  const p = k?.kpis[0];
  return kfs.length === 1 && k?.kpis.length === 1 && k.inherit_timeline && k.execution_schedule.mode === "daily" && !k.execution_schedule.start_time && !k.execution_schedule.end_time && (!k.name || k.name === name) && !!p && ["binary", "cumulative"].includes(p.measure) && memberCount === 0;
}
function inheritKpi(kpi, name, expected, start, end) {
  return { ...kpi, name: kpi.name.trim() || name, config: {
    ...kpi.config,
    ...kpi.measure === "binary" && !kpi.config.valid_condition?.trim() ? { valid_condition: expected.trim() || name } : {},
    ...["frequency", "streak"].includes(kpi.measure) ? { start_date: kpi.config.start_date || start, end_date: kpi.config.end_date || end } : {}
  } };
}
function creationKfPayload(kf, name, expected, start, end) {
  return {
    ...kf,
    request_key: kf.key,
    name: kf.name.trim() || name,
    kpis: kf.kpis.map((k) => k3KpiPayload(inheritKpi(k, kf.name.trim() || name, expected, start, end)))
  };
}
function timelineError(start, end, startTime = "", endTime = "") {
  if (!start || !end) return "Chọn ngày bắt đầu và hạn hoàn thành.";
  if (`${end}T${endTime || "23:59"}` < `${start}T${startTime || "00:00"}`) return "Hạn hoàn thành không được trước thời điểm bắt đầu.";
  return "";
}
function timelineLabel(date, time) {
  return `${date ?? "—"}${time ? ` · ${time.slice(0, 5)}` : ""}`;
}
function creationError(name, start, end, kfs, expected = "", startTime = "", dueTime = "") {
  if (!name.trim()) return "Nhập tên công việc.";
  if (!end) return "Chưa chọn hạn hoàn thành.";
  const time = timelineError(start, end, startTime, dueTime);
  if (time) return time;
  if (!kfs.length) return "Thêm ít nhất một bước thực hiện.";
  for (const [i, kf] of kfs.entries()) {
    if (!kf.kpis.length) return `Bước ${i + 1}: chọn cách đo kết quả.`;
    if (!kf.inherit_timeline) {
      const error = timelineError(kf.start_date || start, kf.due_date || end, kf.start_time, kf.due_time);
      if (error) return `Bước ${i + 1}: ${error}`;
    }
    for (const k of kf.kpis) {
      if (!["binary", "milestone"].includes(k.measure) && (k.target === "" || !Number.isFinite(Number(k.target)) || Number(k.target) < 0)) return `Bước ${i + 1}: nhập mục tiêu hợp lệ.`;
      if (k.measure === "cumulative" && !k.unit.trim()) return `Bước ${i + 1}: nhập đơn vị đo.`;
      if (["frequency", "streak"].includes(k.measure) && !k.config.valid_condition?.trim() && !expected.trim()) return `Bước ${i + 1}: bổ sung điều kiện kết quả hợp lệ.`;
    }
  }
  return "";
}
function Biz3KTimeline({ id, start, end, startTime, endTime, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-start`, children: "Ngày bắt đầu *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "min-w-0", id: `${id}-start`, type: "date", value: start, onChange: (e) => onChange("start", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", htmlFor: `${id}-start-time`, children: "Giờ bắt đầu (tùy chọn)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-start-time`, type: "time", step: 60, value: startTime, onChange: (e) => onChange("startTime", e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `${id}-end`, children: "Hạn hoàn thành *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "min-w-0", id: `${id}-end`, type: "date", value: end, onChange: (e) => onChange("end", e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", htmlFor: `${id}-end-time`, children: "Giờ hoàn thành (tùy chọn)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `${id}-end-time`, type: "time", step: 60, value: endTime, onChange: (e) => onChange("endTime", e.target.value) })
    ] })
  ] });
}
function Biz3KSchedule({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lộ trình thực hiện" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.mode, onValueChange: (mode) => onChange({ ...value, mode }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily", children: "Hằng ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dates", children: "Chọn một / nhiều ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekdays", children: "Các thứ trong tuần" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: "Hằng tuần" })
      ] })
    ] }),
    value.mode === "dates" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Thêm ngày thực hiện", type: "date", value: "", onChange: (e) => {
        if (e.target.value) onChange({ ...value, dates: [.../* @__PURE__ */ new Set([...value.dates ?? [], e.target.value])].sort() });
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: value.dates?.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onChange({ ...value, dates: value.dates?.filter((v) => v !== d) }), children: [
        d,
        " ×"
      ] }, d)) })
    ] }),
    value.mode === "weekdays" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: [1, 2, 3, 4, 5, 6, 7].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", "aria-pressed": value.weekdays?.includes(d) ?? false, variant: value.weekdays?.includes(d) ? "default" : "outline", onClick: () => onChange({ ...value, weekdays: value.weekdays?.includes(d) ? value.weekdays.filter((v) => v !== d) : [...value.weekdays ?? [], d] }), children: d === 7 ? "CN" : `T${d + 1}` }, d)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Giờ dự kiến bắt đầu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Giờ lộ trình bắt đầu", type: "time", value: value.start_time ?? "", onChange: (e) => onChange({ ...value, start_time: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Giờ dự kiến kết thúc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Giờ lộ trình kết thúc", type: "time", value: value.end_time ?? "", onChange: (e) => onChange({ ...value, end_time: e.target.value }) })
      ] })
    ] })
  ] });
}
function Biz3KQuickCreate({ variant, defaultDate, onClose, onCreated }) {
  const mutation = useK3GoalMutation();
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const [requestKey] = reactExports.useState(() => crypto.randomUUID());
  const [discarding, setDiscarding] = reactExports.useState(false);
  const [attempted, setAttempted] = reactExports.useState(false);
  const [retrying, setRetrying] = reactExports.useState(false);
  const [checking, setChecking] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [mode, setMode] = reactExports.useState("basic");
  const submitting = reactExports.useRef(false);
  const attemptedPayload = reactExports.useRef(null);
  const [f, setF] = reactExports.useState({ name: "", period_start: defaultDate, period_end: "", start_time: "", due_time: "", expected_result: "", description: "", is_key: false });
  const [kfs, setKfs] = reactExports.useState([newCreationKf()]);
  const [members, setMembers] = reactExports.useState([]);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setKf = (key, k, v) => setKfs((p) => p.map((x) => x.key === key ? { ...x, [k]: v } : x));
  const first = kfs[0];
  const kpi = first?.kpis[0] ?? newK3KpiDraft();
  const simple = mode === "basic";
  const switchMode = (next) => {
    if (next === "basic" && !canUseBasicCreation(kfs, f.name, members.length)) {
      setError("Giữ chế độ Nâng cao để không mất các bước, chỉ số hoặc lịch đã nhập.");
      return;
    }
    setMode(next === "advanced" ? "advanced" : "basic");
    setError("");
  };
  const choose = (measure) => setKfs((prev) => prev.map((k, i) => i === 0 ? { ...k, kpis: k.kpis.map((p, j) => j === 0 ? { ...p, measure, condition: "gte", config: { ...p.config, ...measure === "frequency" || measure === "streak" ? { cycle: measure === "streak" ? "day" : "week" } : {}, ...measure === "duration" ? { duration_unit: "minutes", duration_method: "total" } : {} } } : p) } : k));
  const changeFirst = (field, value) => setKfs((prev) => prev.map((k, i) => i === 0 ? { ...k, kpis: k.kpis.map((p, j) => j === 0 ? { ...p, [field]: value } : p) } : k));
  const close = () => {
    if (submitting.current) return;
    if (retrying || f.name || f.expected_result || f.description || kfs.some((k) => k.name)) setDiscarding(true);
    else onClose();
  };
  const submit = async (valid) => {
    if (submitting.current) return;
    setAttempted(true);
    const validation = creationError(f.name, f.period_start, f.period_end, kfs, f.expected_result, f.start_time, f.due_time);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    submitting.current = true;
    try {
      const payload = attemptedPayload.current ?? {
        request_key: requestKey,
        creation_mode: mode,
        ...simple ? { kpi: k3KpiPayload(inheritKpi(kpi, f.name, f.expected_result, f.period_start, f.period_end)) } : {},
        ...f,
        due_date: f.period_end,
        expected_result: f.expected_result.trim() || f.name,
        save_valid: valid,
        member_ids: members.map((m) => m.id),
        kfs: kfs.map((k) => creationKfPayload(k, f.name, f.expected_result, f.period_start, f.period_end))
      };
      attemptedPayload.current = payload;
      const res = await mutation.mutateAsync({ kind: "quick_create", payload });
      toast.success(res.duplicated ? "Công việc đã được lưu trước đó." : valid ? "Đã lưu công việc." : "Đã lưu nháp công việc.");
      onCreated?.(res.goal_id);
      onClose();
    } catch (e) {
      if (isK3AmbiguousWrite(e)) {
        setChecking(true);
        const check = await checkK3QuickCreate(uid, requestKey);
        setChecking(false);
        if (check.status === "saved") {
          toast.success("Công việc đã được lưu.");
          onCreated?.(check.id);
          onClose();
          return;
        }
        setRetrying(true);
        setError(check.status === "missing" ? "Chưa thấy công việc được lưu. Có thể thử lưu lại an toàn bằng cùng yêu cầu, không tạo trùng." : "Chưa kiểm tra được trạng thái lưu. Hãy thử lưu lại an toàn; hệ thống sẽ giữ nguyên mã yêu cầu để tránh tạo trùng.");
      } else {
        attemptedPayload.current = null;
        setRetrying(false);
        setError(k3Error(e));
      }
    } finally {
      submitting.current = false;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && close(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog k3-quick-create flex max-h-[90dvh] max-w-2xl flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo công việc" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: mode, onValueChange: switchMode, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { disabled: mutation.isPending || checking || retrying, value: "basic", children: "Cơ bản" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { disabled: mutation.isPending || checking || retrying, value: "advanced", children: "Nâng cao" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 space-y-4 overflow-y-auto px-1 pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { disabled: mutation.isPending || checking || retrying, className: "min-w-0 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-name", children: "Tên công việc *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-name", value: f.name, onChange: (e) => set("name", e.target.value), "aria-invalid": attempted && !f.name.trim(), placeholder: "Soạn báo giá khách sạn Vinh Nghệ An" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-end", children: "Hạn hoàn thành *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-end", type: "date", value: f.period_end, onChange: (e) => set("period_end", e.target.value), "aria-invalid": attempted && !f.period_end }),
          attempted && !f.period_end && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: "Chưa chọn hạn hoàn thành." })
        ] }),
        simple && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-measure", children: "Đo kết quả bằng cách nào? *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["binary", "cumulative"].includes(kpi.measure) ? kpi.measure : "other", onValueChange: (v) => {
            if (v === "other") setMode("advanced");
            else choose(v);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "k3q-measure", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "binary", children: "Có / Chưa" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cumulative", children: "Số lượng" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Cách đo khác" })
            ] })
          ] }),
          kpi.measure === "cumulative" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-target", children: "Số lượng mục tiêu *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-target", type: "number", inputMode: "decimal", min: 0, step: "any", value: kpi.target, onChange: (e) => changeFirst("target", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-unit", children: "Đơn vị đo *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-unit", value: kpi.unit, onChange: (e) => changeFirst("unit", e.target.value) })
            ] })
          ] }),
          !["binary", "cumulative"].includes(kpi.measure) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kpi.measure, onValueChange: (v) => choose(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(K3_MEASURE_LABELS).filter(([v]) => !["binary", "cumulative"].includes(v)).map(([v, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: label }, v)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiConfig, { compact: true, fieldsOnly: true, value: kpi, expectedResult: f.expected_result || f.name, suggestedName: f.name, onChange: (next) => setKfs((prev) => prev.map((k, i) => i === 0 ? { ...k, kpis: k.kpis.map((p, j) => j === 0 ? next : p) } : k)) })
          ] })
        ] }),
        !simple && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 border-t border-border pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-start", children: "Ngày bắt đầu" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-start", type: "date", value: f.period_start, onChange: (e) => set("period_start", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-start-time", children: "Giờ bắt đầu (tùy chọn)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-start-time", type: "time", value: f.start_time, onChange: (e) => set("start_time", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-due-time", children: "Giờ hoàn thành (tùy chọn)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3q-due-time", type: "time", value: f.due_time, onChange: (e) => set("due_time", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-result", children: "Tiêu chí hoàn thành riêng (tùy chọn)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3q-result", value: f.expected_result, onChange: (e) => set("expected_result", e.target.value), rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3q-desc", children: "Mô tả chi tiết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3q-desc", value: f.description, onChange: (e) => set("description", e.target.value), rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: f.is_key, onCheckedChange: (v) => set("is_key", v === true) }),
            "Công việc trọng tâm"
          ] }),
          kfs.map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t border-border pt-3", children: [
            kfs.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Tên bước ${i + 1}`, placeholder: `Tên bước ${i + 1}`, value: k.name, onChange: (e) => setKf(k.key, "name", e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Xóa bước ${i + 1}`, onClick: () => setKfs((prev) => prev.filter((x) => x.key !== k.key)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Lộ trình và thời gian",
                kfs.length > 1 ? ` bước ${i + 1}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: k.inherit_timeline, onCheckedChange: (v) => setKf(k.key, "inherit_timeline", v === true) }),
                "Dùng thời gian công việc"
              ] }),
              !k.inherit_timeline && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KTimeline, { id: k.key, start: k.start_date || f.period_start, end: k.due_date || f.period_end, startTime: k.start_time, endTime: k.due_time, onChange: (field, value) => setKf(k.key, { start: "start_date", end: "due_date", startTime: "start_time", endTime: "due_time" }[field], value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KSchedule, { value: k.execution_schedule, onChange: (value) => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, execution_schedule: value } : x)) })
            ] }),
            k.kpis.map((p, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-border pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Chỉ số ",
                  j + 1
                ] }),
                k.kpis.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Xóa chỉ số ${j + 1} bước ${i + 1}`, onClick: () => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, kpis: x.kpis.filter((v) => v.request_key !== p.request_key) } : x)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiConfig, { expanded: true, compact: true, value: p, suggestedName: k.name || f.name, expectedResult: f.expected_result || k.name || f.name, onChange: (next) => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, kpis: x.kpis.map((v) => v.request_key === next.request_key ? next : v) } : x)) })
            ] }, p.request_key)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, kpis: [...x.kpis, newK3KpiDraft()] } : x)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
              "Thêm chỉ số"
            ] })
          ] }, k.key)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setKfs((prev) => [...prev, newCreationKf()]), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
            "Thêm bước thực hiện"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chọn người phối hợp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MemberPicker, { selected: members, onChange: setMembers })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", disabled: mutation.isPending, onClick: () => submit(false), children: "Lưu nháp" })
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "shrink-0 border-t border-border pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: close, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: mutation.isPending || checking, onClick: () => submit(true), children: [
        mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }),
        checking ? "Đang xác minh…" : retrying ? "Thử lưu lại an toàn" : "Lưu công việc"
      ] })
    ] }),
    discarding && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: setDiscarding, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Bỏ thay đổi chưa lưu?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDiscarding(false), children: "Tiếp tục soạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: onClose, children: "Bỏ thay đổi" })
      ] })
    ] }) })
  ] }) });
}
const k3PeriodConfigQuery = (uid) => queryOptions({ queryKey: ["k3_period_config", uid], staleTime: 6e4, refetchOnWindowFocus: false, queryFn: async () => {
  const { data, error } = await supabase.rpc("k3_period_config_read");
  if (error) throw error;
  return data;
} });
function useK3PeriodMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (input) => {
    let result;
    if (input.kind === "schedule") result = await supabase.rpc("k3_task_schedule", { _id: input.id, _date: input.date, _revision: input.revision });
    else if (input.kind === "summary") result = await supabase.rpc("k3_period_summary_confirm", { _type: input.type, _date: input.date, _note: input.note });
    else if (input.kind === "comment") result = await supabase.rpc("k3_period_comment_save", { _user: input.user, _type: input.type, _date: input.date, _body: input.body, _goal: input.goal, _action: input.action });
    else {
      const names = { goal: "k3_goal_save", action: "k3_action_save", task: "k3_plan_task_save", settings: "k3_period_settings_save" };
      result = await supabase.rpc(names[input.kind], { _payload: input.payload });
    }
    if (result.error) throw result.error;
    return result.data;
  }, onSuccess: () => {
    void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") && q.queryKey[0] !== "k3_preview" });
  } });
}
const toneClass$1 = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground"
};
function StatusBadge({ status }) {
  const meta = K3_STATUS[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn("gap-1 border-0", toneClass$1[meta.tone]), children: meta.label });
}
function Biz3KMyDay({ settings, selectedDate, onDateChange }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const [localDate, setLocalDate] = reactExports.useState(settings.today);
  const date = selectedDate ?? localDate;
  const setDate = onDateChange ?? setLocalDate;
  const { data, isLoading, error, refetch } = useQuery({ ...k3DayQuery(uid, date), enabled: !!uid && !!date });
  const [editing, setEditing] = reactExports.useState(null);
  const [quickCreate, setQuickCreate] = reactExports.useState(false);
  const [logging, setLogging] = reactExports.useState(false);
  const [updating, setUpdating] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [confirmSummary, setConfirmSummary] = reactExports.useState(false);
  const [history, setHistory] = reactExports.useState(false);
  const summary = useK3Summary();
  const tasks = data?.tasks ?? [];
  const counts = reactExports.useMemo(() => k3Counts(tasks), [tasks]);
  const late = data ? k3LateFlags(data.day, settings, date) : null;
  const summarized = !!data?.day?.summarized_at;
  const needsConfirmation = k3NeedsConfirmation(data?.day);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-date", className: "text-xs", children: "Ngày thực hiện" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-date", type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "w-40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setDate(settings.today), disabled: date === settings.today, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "mr-1 h-4 w-4" }),
        " Hôm nay"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", disabled: !settings.enabled, onClick: () => setQuickCreate(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " Tạo công việc"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", disabled: !settings.enabled, onClick: () => setLogging(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "mr-1 h-4 w-4" }),
        " Ghi nhận thực hiện"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => setConfirmSummary(true), disabled: !settings.enabled || date > settings.today || !data?.day || tasks.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1 h-4 w-4" }),
        " ",
        needsConfirmation ? "Xác nhận lại tổng kết" : summarized ? "Xem lại tổng kết" : "Tổng kết 3K ngày"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setHistory(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "mr-1 h-4 w-4" }),
        "Lịch sử"
      ] })
    ] }),
    data?.day && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
      data.day.planned_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Lập lúc ",
        new Date(data.day.planned_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        late?.planLate ? ` (muộn ${late.planLateMinutes} phút)` : " (đúng hạn)"
      ] }),
      data.day.summarized_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "· Tổng kết lần đầu ",
        new Date(data.day.summarized_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        late?.summaryLate ? " (trễ hạn)" : ""
      ] }),
      needsConfirmation && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Cần xác nhận lại tổng kết" }),
      data.day.confirmed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "· Xác nhận gần nhất ",
        new Date(data.day.confirmed_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      ] }),
      late?.summaryOverdue && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
        "Chưa tổng kết (quá ",
        settings.summary_by.slice(0, 5),
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Tổng công việc", value: counts.total }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Đã hoàn thành", value: counts.done }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Đang thực hiện", value: counts.doing }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Chưa hoàn thành", value: counts.open }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Mũi khoan", value: counts.focus })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GoalSection, { date, data, enabled: settings.enabled }, date),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-6 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 inline h-4 w-4 animate-spin" }),
      "Đang tải…"
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-destructive/40 p-4 text-center text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(error) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "mt-2", onClick: () => refetch(), children: "Thử lại" })
    ] }),
    data && tasks.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-border bg-card p-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Chưa có công việc nào cho ngày này. Bấm ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tạo công việc" }),
        " để lập mục tiêu mới, hoặc ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Ghi nhận thực hiện" }),
        " để cập nhật KF đang theo đuổi."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: K3_TIME_HINT })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [...tasks].sort((a, b) => Number(b.is_focus) - Number(a.is_focus)).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { task: t, settings, onEdit: () => setEditing(t), onUpdate: () => setUpdating(t), onDelete: !summarized && t.kpi_actual == null ? () => setDeleting(t) : void 0 }, t.id)) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskDialog,
      {
        date,
        task: editing === "new" ? null : editing,
        focusCount: counts.focus,
        maxFocus: settings.max_focus,
        actions: data?.assigned_actions,
        onClose: () => setEditing(null)
      }
    ),
    updating && /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateDialog, { task: updating, onClose: () => setUpdating(null) }),
    deleting && /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteDialog, { task: deleting, onClose: () => setDeleting(null) }),
    quickCreate && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KQuickCreate, { variant: "personal", defaultDate: date, onClose: () => setQuickCreate(false) }),
    logging && /* @__PURE__ */ jsxRuntimeExports.jsx(LogExecutionDialog, { date, actions: data?.assigned_actions ?? [], onClose: () => setLogging(false), onCreateNew: () => {
      setLogging(false);
      setQuickCreate(true);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: history, onOpenChange: setHistory, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Lịch sử 3K ngày ",
        date
      ] }) }),
      data?.summaries?.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
          "Tổng kết phiên bản ",
          v.revision
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(v.confirmed_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) }),
        v.snapshot.tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          t.name,
          " · ",
          k3ProgressLabel(t)
        ] }, t.id))
      ] }, v.id)),
      data?.events?.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: { create: "Thêm công việc", update: "Cập nhật công việc", delete: "Xóa công việc", plan: "Lưu mục tiêu", summary: "Xác nhận tổng kết", progress: "Cập nhật kết quả" }[e.action] ?? "Thay đổi công việc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(e.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) })
      ] }, e.id)),
      !data?.events?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lịch sử." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: confirmSummary, onOpenChange: setConfirmSummary, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Tổng kết 3K ngày ",
          date
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Tổng ",
            counts.total,
            " công việc · Hoàn thành ",
            counts.done,
            " · Chưa hoàn thành ",
            counts.open,
            " · Mũi khoan hoàn thành ",
            tasks.filter((t) => t.is_focus && k3IsComplete(t)).length,
            "/",
            counts.focus
          ] }),
          counts.open > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-amber-600", children: "Các công việc chưa hoàn thành phải có đủ Vấn đề – Nguyên nhân – Giải pháp trước khi tổng kết." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            onClick: async () => {
              try {
                await summary.mutateAsync(date);
                toast.success("Đã tổng kết 3K trong ngày.");
              } catch (e) {
                toast.error(k3Error(e));
              }
            },
            children: "Xác nhận tổng kết"
          }
        )
      ] })
    ] }) })
  ] });
}
function StatCard({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold tabular-nums", children: value })
  ] });
}
function useK3AddActionToDay(date) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const qc = useQueryClient();
  const mutation = useK3PeriodMutation();
  const keys = reactExports.useRef(/* @__PURE__ */ new Map());
  const [checking, setChecking] = reactExports.useState(false);
  const addAction = async (a) => {
    if (!uid) {
      toast.error("Vui lòng đăng nhập lại.");
      return false;
    }
    const identity = `${uid}:${date}:${a.id}`;
    let key = keys.current.get(identity);
    if (!key) {
      key = crypto.randomUUID();
      keys.current.set(identity, key);
    }
    try {
      await mutation.mutateAsync({ kind: "task", payload: { name: a.name, action_id: a.id, work_date: date, request_key: key } });
      return true;
    } catch (e) {
      if (isK3AmbiguousWrite(e)) {
        setChecking(true);
        const status = await checkK3TaskSave(uid, key);
        setChecking(false);
        if (status.status === "saved") {
          void qc.invalidateQueries({ queryKey: ["k3_day", uid, date] });
          return true;
        }
        toast.error("Chưa xác nhận được việc ghi nhận KF. Bấm lại để thử cùng mã yêu cầu, không tạo trùng.");
      } else {
        toast.error(k3Error(e));
      }
      return false;
    }
  };
  return { addAction, pending: mutation.isPending || checking };
}
function GoalSection({ date, data, enabled }) {
  const { addAction, pending } = useK3AddActionToDay(date);
  const goals = data?.active_goals ?? [];
  const actions = data?.assigned_actions ?? [];
  const legacyKg = data?.day?.kg;
  if (!goals.length && !actions.length && !hasText(legacyKg)) return null;
  const addToday = async (a) => {
    if (await addAction(a)) toast.success("Đã thêm KF vào công việc hôm nay.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border border-border bg-card p-3", children: [
    goals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "KG đang thực hiện" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: goals.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: cn("gap-1 whitespace-normal text-left", g.is_key && "border-primary text-primary"), children: [
        g.is_key && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-primary" }),
        g.name,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "· hạn ",
          g.due_date ?? g.period_end
        ] })
      ] }, g.id)) })
    ] }),
    actions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "KF cần thực hiện hôm nay" }),
      actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
          a.is_key && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-1 inline h-3.5 w-3.5 fill-primary text-primary" }),
          a.name,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
            "KG: ",
            a.goal_name,
            a.due_date ? ` · Hạn ${a.due_date}` : "",
            a.my_part === "collaborator" ? " · Bạn phối hợp" : ""
          ] })
        ] }),
        a.already_today ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Đã có trong hôm nay" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", disabled: !enabled || pending, onClick: () => addToday(a), children: "Thêm vào hôm nay" })
      ] }, a.id))
    ] }),
    hasText(legacyKg) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Ghi chú mục tiêu ngày cũ: ",
      legacyKg
    ] })
  ] });
}
function LogExecutionDialog({ date, actions, onClose, onCreateNew }) {
  const { addAction, pending } = useK3AddActionToDay(date);
  const add = async (a) => {
    if (await addAction(a)) {
      toast.success("Đã thêm KF vào công việc hôm nay. Cập nhật kết quả ngay trên thẻ công việc.");
      onClose();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Ghi nhận thực hiện ngày ",
      date
    ] }) }),
    actions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Bạn chưa có KF nào đang thực hiện. Nếu phát sinh việc chưa có KG, hãy tạo công việc mới ngay tại đây." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", onClick: onCreateNew, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        "Tạo công việc"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
        a.is_key && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-1 inline h-3.5 w-3.5 fill-primary text-primary" }),
        a.name,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
          "KG: ",
          a.goal_name,
          a.due_date ? ` · Hạn ${a.due_date}` : "",
          a.my_part === "collaborator" ? " · Bạn phối hợp" : ""
        ] })
      ] }),
      a.already_today ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Đã có trong hôm nay" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", disabled: pending, onClick: () => add(a), children: "Thêm vào hôm nay" })
    ] }, a.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Đóng" }) })
  ] }) });
}
function TaskCard({ task, settings, onEdit, onUpdate, onDelete }) {
  const save = useK3TaskSave();
  const hasIssue = !k3IsComplete(task) && (hasText(task.problem) || hasText(task.solution));
  const toggleFocus = async () => {
    try {
      await save.mutateAsync({ ...task, is_focus: !task.is_focus });
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-lg border bg-card p-3 space-y-2", task.is_focus ? "border-primary/60" : "border-border"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          disabled: !settings.enabled,
          type: "button",
          onClick: toggleFocus,
          title: task.is_focus ? "Bỏ mũi khoan trọng tâm" : `Đánh dấu mũi khoan trọng tâm (tối đa ${settings.max_focus})`,
          className: cn("mt-0.5 rounded-full p-1 transition-colors", task.is_focus ? "text-primary" : "text-muted-foreground hover:text-foreground"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: cn("h-4 w-4", task.is_focus && "fill-primary") })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-medium leading-snug", children: task.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", children: [
          (task.start_time || task.end_time) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            task.start_time?.slice(0, 5) ?? "…",
            "–",
            task.end_time?.slice(0, 5) ?? "…"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Kết quả: ",
            k3ProgressLabel(task)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-36 whitespace-normal text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: k3DisplayStatus(task) }) }),
        task.status === "done" && k3DisplayStatus(task) !== "done" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-36 text-right text-xs text-muted-foreground", children: "Trạng thái cũ: Hoàn thành" }),
        task.is_focus && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-primary text-primary", children: "Mũi khoan" }),
        hasIssue && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-amber-500 text-amber-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "mr-1 h-3 w-3" }),
          "Có vấn đề"
        ] })
      ] })
    ] }),
    !k3IsComplete(task) && (hasText(task.problem) || hasText(task.cause) || hasText(task.solution)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-secondary/60 p-2 text-xs space-y-0.5", children: [
      hasText(task.problem) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Vấn đề:" }),
        " ",
        task.problem
      ] }),
      hasText(task.cause) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Nguyên nhân:" }),
        " ",
        task.cause
      ] }),
      hasText(task.solution) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Giải pháp:" }),
        " ",
        task.solution
      ] })
    ] }),
    settings.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: onUpdate, children: "Cập nhật kết quả" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "ghost", "aria-label": `Thao tác khác cho ${task.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: onEdit, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
            "Sửa công việc"
          ] }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "text-destructive", onSelect: onDelete, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
            "Xóa công việc"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function TaskDialog({ date, task, focusCount, maxFocus, onClose, actions }) {
  const save = useK3TaskSave();
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const qc = useQueryClient();
  const [uncertainPayload, setUncertainPayload] = reactExports.useState(null);
  const [checking, setChecking] = reactExports.useState(false);
  const [saveError, setSaveError] = reactExports.useState("");
  const planSave = useK3PeriodMutation();
  const [actionId, setActionId] = reactExports.useState(task?.action_id ?? "none");
  const [requestKey] = reactExports.useState(() => crypto.randomUUID());
  const [f, setF] = reactExports.useState({
    name: task?.name ?? "",
    start_time: task?.start_time?.slice(0, 5) ?? "",
    end_time: task?.end_time?.slice(0, 5) ?? "",
    kpi_target: task?.kpi_target?.toString() ?? "",
    kpi_unit: task?.kpi_unit ?? "",
    is_focus: task?.is_focus ?? false,
    how: task?.how ?? "",
    place: task?.place ?? "",
    note: task?.note ?? "",
    link: task?.links?.[0]?.url ?? ""
  });
  const [more, setMore] = reactExports.useState(!!task && (!!task.how || !!task.place || !!task.note));
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const focusBlocked = f.is_focus && !task?.is_focus && focusCount >= maxFocus;
  const submit = async () => {
    setSaveError("");
    try {
      const payload = {
        id: task?.id,
        revision: task?.revision,
        request_key: task ? void 0 : requestKey,
        work_date: task?.work_date ?? date,
        name: f.name,
        start_time: f.start_time,
        end_time: f.end_time,
        kpi_target: f.kpi_target === "" ? null : Number(f.kpi_target),
        kpi_unit: f.kpi_unit,
        is_focus: f.is_focus,
        status: task?.status ?? "todo",
        progress: task?.progress ?? 0,
        kpi_actual: task?.kpi_actual ?? null,
        how: f.how,
        place: f.place,
        note: f.note,
        problem: task?.problem ?? "",
        cause: task?.cause ?? "",
        solution: task?.solution ?? "",
        links: f.link ? [{ ...task?.links?.[0] ?? {}, url: f.link }, ...task?.links?.slice(1) ?? []] : task?.links?.slice(1) ?? [],
        action_id: actionId === "none" ? null : actionId
      };
      const original = uncertainPayload ?? payload;
      if (original.action_id) await planSave.mutateAsync({ kind: "task", payload: original });
      else await save.mutateAsync(original);
      toast.success(task ? "Đã lưu công việc." : "Đã thêm công việc.");
      onClose();
    } catch (e) {
      if (!task && isK3AmbiguousWrite(e)) {
        setChecking(true);
        const check = await checkK3TaskSave(uid, requestKey);
        setChecking(false);
        if (check.status === "saved") {
          void qc.invalidateQueries({ queryKey: ["k3_day", uid, date] });
          toast.success("Công việc đã được lưu.");
          onClose();
          return;
        }
        setUncertainPayload(uncertainPayload ?? {
          request_key: requestKey,
          work_date: date,
          name: f.name,
          start_time: f.start_time,
          end_time: f.end_time,
          kpi_target: f.kpi_target === "" ? null : Number(f.kpi_target),
          kpi_unit: f.kpi_unit,
          is_focus: f.is_focus,
          status: "todo",
          progress: 0,
          kpi_actual: null,
          how: f.how,
          place: f.place,
          note: f.note,
          problem: "",
          cause: "",
          solution: "",
          links: f.link ? [{ url: f.link }] : [],
          action_id: actionId === "none" ? null : actionId
        });
        setSaveError("Chưa xác minh được công việc đã lưu hay chưa. Thử lại sẽ giữ nguyên nội dung và mã yêu cầu, không tạo trùng.");
      } else {
        setSaveError(k3Error(e));
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && !save.isPending && !planSave.isPending && !checking && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: task ? "Sửa công việc" : "Thêm công việc" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { disabled: !!uncertainPayload || save.isPending || planSave.isPending || checking, className: "min-w-0 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-name", children: "Tên công việc *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-name", value: f.name, onChange: (e) => set("name", e.target.value), placeholder: "Gọi 10 khách hàng tiềm năng khu vực Hà Nội" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: K3_TIME_HINT })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-start", children: "Giờ bắt đầu dự kiến" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-start", type: "time", value: f.start_time, onChange: (e) => set("start_time", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-end", children: "Giờ kết thúc dự kiến" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-end", type: "time", value: f.end_time, onChange: (e) => set("end_time", e.target.value) })
        ] })
      ] }),
      !!actions?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Liên kết KF (tùy chọn)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: actionId, onValueChange: setActionId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Không liên kết" }),
            actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.name }, a.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-target", children: "Chỉ tiêu / KPI (số lượng)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-target", type: "number", min: 0, value: f.kpi_target, onChange: (e) => set("kpi_target", e.target.value), placeholder: "Để trống nếu đánh giá theo %" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-unit", children: "Đơn vị đo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-unit", value: f.kpi_unit, onChange: (e) => set("kpi_unit", e.target.value), placeholder: "khách, cuộc gọi…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: f.is_focus, disabled: focusBlocked, onChange: (e) => set("is_focus", e.target.checked), className: "h-4 w-4" }),
        "Mũi khoan trọng tâm ",
        focusBlocked ? `(đã đủ ${maxFocus} việc)` : `(tối đa ${maxFocus}/ngày)`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs text-primary underline", onClick: () => setMore((v) => !v), children: more ? "Ẩn thông tin mở rộng" : "Thêm cách thực hiện, địa điểm, ghi chú" }),
      more && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-how", children: "Cách thực hiện (How)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3t-how", rows: 2, value: f.how, onChange: (e) => set("how", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-place", children: "Địa điểm (Where)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-place", value: f.place, onChange: (e) => set("place", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-note", children: "Ghi chú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3t-note", rows: 2, value: f.note, onChange: (e) => set("note", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3t-link", children: "Link tài liệu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3t-link", type: "url", value: f.link, onChange: (e) => set("link", e.target.value) })
        ] })
      ] })
    ] }),
    saveError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: saveError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", disabled: save.isPending || planSave.isPending || checking, onClick: onClose, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: save.isPending || planSave.isPending || checking || !f.name.trim(), onClick: submit, children: save.isPending || planSave.isPending ? "Đang lưu…" : checking ? "Đang xác minh…" : uncertainPayload ? "Thử lưu lại an toàn" : "Lưu công việc" })
    ] })
  ] }) });
}
function UpdateDialog({ task, onClose }) {
  const update = useK3TaskUpdate();
  const quantified = task.kpi_target != null && task.kpi_target > 0;
  const [f, setF] = reactExports.useState({
    kpi_actual: task.kpi_actual?.toString() ?? "",
    progress: task.progress.toString(),
    problem: task.problem ?? "",
    cause: task.cause ?? "",
    solution: task.solution ?? "",
    note: task.note ?? ""
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const nextStatus = k3DisplayStatus({
    status: task.status,
    kpi_target: task.kpi_target,
    kpi_actual: f.kpi_actual === "" ? null : Number(f.kpi_actual),
    progress: f.progress === "" ? 0 : Number(f.progress)
  });
  const needsVngb = nextStatus !== "done";
  const submit = async () => {
    try {
      await update.mutateAsync({
        id: task.id,
        revision: task.revision,
        status: nextStatus,
        kpi_actual: f.kpi_actual === "" ? null : Number(f.kpi_actual),
        progress: f.progress === "" ? null : Number(f.progress),
        problem: f.problem,
        cause: f.cause,
        solution: f.solution,
        note: f.note
      });
      toast.success("Đã cập nhật kết quả.");
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Cập nhật: ",
      task.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Trạng thái tự động theo kết quả: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn("border-0", toneClass$1[K3_STATUS[nextStatus].tone]), children: K3_STATUS[nextStatus].label })
      ] }),
      quantified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "k3u-actual", children: [
          "Kết quả thực tế (kế hoạch ",
          task.kpi_target,
          task.kpi_unit ? ` ${task.kpi_unit}` : "",
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3u-actual", type: "number", min: 0, value: f.kpi_actual, onChange: (e) => set("kpi_actual", e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
          "Tiến độ: ",
          k3ProgressLabel({ kpi_target: task.kpi_target, kpi_actual: f.kpi_actual === "" ? 0 : Number(f.kpi_actual), progress: Number(f.progress) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hệ thống tự tính tỷ lệ; kết quả vượt kế hoạch vẫn được ghi nhận." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3u-progress", children: "Tiến độ (%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3u-progress", type: "number", min: 0, max: 100, value: f.progress, onChange: (e) => set("progress", e.target.value) })
      ] }),
      needsVngb && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md border border-amber-300 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-700", children: "Vấn đề – Nguyên nhân – Giải pháp (bắt buộc khi tổng kết nếu chưa hoàn thành)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Vấn đề gặp phải", value: f.problem, onChange: (e) => set("problem", e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Nguyên nhân", value: f.cause, onChange: (e) => set("cause", e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Giải pháp / hướng xử lý", value: f.solution, onChange: (e) => set("solution", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3u-note", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3u-note", rows: 2, value: f.note, onChange: (e) => set("note", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: update.isPending, onClick: submit, children: update.isPending ? "Đang lưu…" : "Lưu cập nhật" })
    ] })
  ] }) });
}
function DeleteDialog({ task, onClose }) {
  const del = useK3TaskDelete();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Xóa công việc này?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
        '"',
        task.name,
        '" sẽ được chuyển vào Thùng rác và có thể khôi phục trong 15 ngày.'
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Quay lại" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AlertDialogAction,
        {
          className: "bg-destructive text-destructive-foreground",
          onClick: async () => {
            try {
              await del.mutateAsync(task.id);
              toast.success("Đã chuyển vào Thùng rác. Có thể khôi phục trong 15 ngày.");
              onClose();
            } catch (e) {
              toast.error(k3Error(e));
            }
          },
          children: "Xóa công việc"
        }
      )
    ] })
  ] }) });
}
const k3ReportGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0a9958c9f742ed40bc01579fd71097067f1204c8c489531d525fc2c551124c6d"));
function Biz3KAutomation() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery({ queryKey: ["k3_automation", uid], queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_automation_read");
    if (error) throw error;
    return data;
  } });
  if (query.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: k3Error(query.error) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Thử lại" })
  ] });
  return query.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(AutomationForm, { config: query.data }, JSON.stringify(query.data)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải cấu hình tự động…" });
}
function AutomationForm({ config }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(config);
  const [busy, setBusy] = reactExports.useState(false);
  const [preview, setPreview] = reactExports.useState(null);
  const [previewDate, setPreviewDate] = reactExports.useState(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date()));
  const [groups, setGroups] = reactExports.useState(config.group_id ? [{ id: config.group_id, name: config.group_name ?? config.group_id }] : []);
  const listGroups = useServerFn(k3ReportGroups);
  const units = useQuery({ queryKey: ["k3_report_units", uid], queryFn: async () => {
    const [systems, deps] = await Promise.all([supabase.from("biz_systems").select("id,name"), supabase.from("biz_departments").select("id,name")]);
    if (systems.error || deps.error) throw systems.error ?? deps.error;
    return { system: systems.data ?? [], department: deps.data ?? [] };
  } });
  const history = useQuery({ queryKey: ["k3_report_history", uid], queryFn: async () => {
    const { data, error } = await supabase.from("k3_zalo_reports").select("id,work_date,status,error,sent_at").order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return data;
  } });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 border-t border-border pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Tổng kết nhân viên" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tổng kết thủ công" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.employee_review_enabled, onCheckedChange: (v) => setF({ ...f, employee_review_enabled: v }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nhắc tổng kết trong Base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.review_reminders, onCheckedChange: (v) => setF({ ...f, review_reminders: v }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-review-time", children: "Giờ nhắc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-review-time", type: "time", value: f.review_remind_time?.slice(0, 5) ?? "17:00", onChange: (e) => setF({ ...f, review_remind_time: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-review-second", children: "Giờ nhắc lần hai" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-review-second", type: "time", value: f.review_second_time?.slice(0, 5) ?? "17:30", onChange: (e) => setF({ ...f, review_second_time: e.target.value }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nhắc lần thứ hai" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.review_second_reminder, onCheckedChange: (v) => setF({ ...f, review_second_reminder: v }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "border-t border-border pt-3 font-medium", children: "Chốt dữ liệu tự động" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tự động chốt sổ ngày" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.auto_close, onCheckedChange: (v) => setF({ ...f, auto_close: v }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-auto-time", children: "Giờ tự chốt sổ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-auto-time", type: "time", value: f.close_time.slice(0, 5), onChange: (e) => setF({ ...f, close_time: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-zalo-time", children: "Giờ gửi Zalo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-zalo-time", type: "time", value: f.send_time.slice(0, 5), onChange: (e) => setF({ ...f, send_time: e.target.value }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "border-t border-border pt-3 font-medium", children: "Báo cáo Zalo" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Gửi báo cáo Zalo cuối ngày" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.zalo_enabled, onCheckedChange: (v) => setF({ ...f, zalo_enabled: v }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhóm Zalo nhận báo cáo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.group_id ?? "", onValueChange: (v) => setF({ ...f, group_id: v, group_name: groups.find((g) => g.id === v)?.name }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn nhóm Zalo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.id, children: g.name }, g.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: busy, onClick: async () => {
        setBusy(true);
        try {
          const result = await listGroups();
          if (!result.ok) throw new Error(result.message);
          setGroups(result.groups);
        } catch (e) {
          toast.error(k3Error(e));
        } finally {
          setBusy(false);
        }
      }, children: "Tải danh sách nhóm" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phạm vi báo cáo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.scope_kind, onValueChange: (v) => setF({ ...f, scope_kind: v, scope_id: void 0 }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Toàn Khối" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "system", children: "Theo Hệ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "department", children: "Theo Phòng" })
        ] })
      ] }),
      f.scope_kind !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.scope_id ?? "", onValueChange: (v) => setF({ ...f, scope_id: v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: f.scope_kind === "system" ? "Chọn Hệ" : "Chọn Phòng" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: units.data?.[f.scope_kind].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.name }, u.id)) })
      ] }),
      units.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: k3Error(units.error) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: async () => {
      setBusy(true);
      try {
        const { error } = await supabase.rpc("k3_automation_save", { _payload: f });
        if (error) throw error;
        await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
        toast.success("Đã lưu tự động chốt sổ và báo cáo Zalo.");
      } catch (e) {
        toast.error(k3Error(e));
      } finally {
        setBusy(false);
      }
    }, children: "Lưu cài đặt tự động" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Ngày xem trước báo cáo", type: "date", value: previewDate, onChange: (e) => setPreviewDate(e.target.value), className: "w-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: busy, onClick: async () => {
        setBusy(true);
        try {
          const { data, error } = await supabase.rpc("k3_zalo_report_preview", { _date: previewDate });
          if (error) throw error;
          const people = data;
          setPreview(people.length ? k3DailyReport(previewDate, people) : "Chưa có bản chốt hệ thống trong phạm vi đã lưu.");
        } catch (e) {
          toast.error(k3Error(e));
        } finally {
          setBusy(false);
        }
      }, children: "Xem trước báo cáo đã chốt" })
    ] }),
    preview && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "whitespace-pre-wrap break-words border-y border-border py-3 text-sm", children: preview }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium", children: "Lịch sử gửi báo cáo" }),
      history.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: k3Error(history.error) }),
      !history.data?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có báo cáo gửi." }),
      history.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          r.work_date,
          " · ",
          { pending: "Chờ gửi", sending: "Đang gửi", sent: "Đã gửi", failed: "Gửi lỗi", unknown: "Cần đối soát", skipped: "Bỏ qua" }[r.status]
        ] }),
        r.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: r.error })
      ] }, r.id))
    ] })
  ] });
}
const stagedRpc = supabase.rpc.bind(supabase);
async function applicationScopeRpc(name, payload) {
  const result = await stagedRpc(`k3_application_scope_${name}`, payload ? { _payload: payload } : void 0);
  if (result.error) throw result.error;
  return result.data;
}
const k3ApplicationScopeQuery = (uid) => queryOptions({
  queryKey: ["k3_application_scope", uid],
  staleTime: 6e4,
  retry: false,
  refetchOnWindowFocus: false,
  queryFn: async () => await applicationScopeRpc("read")
});
function Biz3KApplicationScope() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery({ ...k3ApplicationScopeQuery(uid), enabled: !!uid });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-b border-border pb-5 lg:col-span-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "PHẠM VI ÁP DỤNG 3K" }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải phạm vi áp dụng…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cấu hình chọn Khối chưa được kích hoạt; phạm vi hiện hành chưa thay đổi." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Tải lại" })
    ] }),
    query.data && /* @__PURE__ */ jsxRuntimeExports.jsx(ScopeForm, { scope: query.data }, `${uid}:${query.data.revision}`)
  ] });
}
function ScopeForm({ scope }) {
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState({ ...scope, reason: "", effective_from: scope.effective_from && scope.effective_from >= scope.today ? scope.effective_from : scope.today });
  const [preview, setPreview] = reactExports.useState(null);
  const [previewKey, setPreviewKey] = reactExports.useState("");
  const change = (patch) => {
    setF((p) => ({ ...p, ...patch }));
    setPreview(null);
  };
  const mutation = useMutation({
    mutationFn: async (mode) => {
      if (mode === "save" && (!preview || previewKey !== JSON.stringify(f))) throw new Error("Cần kiểm tra phạm vi trước khi lưu.");
      return { mode, data: await applicationScopeRpc(mode, f) };
    },
    onSuccess: async ({ mode, data }) => {
      if (mode === "preview") {
        setPreview(data);
        setPreviewKey(JSON.stringify(f));
      } else {
        toast.success("Đã lưu phạm vi áp dụng 3K.");
        await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
        await useAuth.getState().reload();
      }
    },
    onError: (e) => toast.error(k3Error(e))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Áp dụng cho tất cả các khối" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.applies_all_blocks, disabled: mutation.isPending, onCheckedChange: (value) => change({ applies_all_blocks: value, applies_unassigned: value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      scope.blocks.map((block) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: f.applies_all_blocks || f.applied_block_ids.includes(block.id), disabled: f.applies_all_blocks || mutation.isPending, onCheckedChange: (v) => change({ applied_block_ids: v === true ? [...f.applied_block_ids, block.id] : f.applied_block_ids.filter((id) => id !== block.id) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: block.name })
      ] }, block.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: f.applies_all_blocks || f.applies_unassigned, disabled: f.applies_all_blocks || mutation.isPending, onCheckedChange: (v) => change({ applies_unassigned: v === true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nhân sự trực thuộc Công ty / chưa thuộc Khối" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-application-date", children: "Ngày bắt đầu hiệu lực" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-application-date", type: "date", min: scope.today, value: f.effective_from, onChange: (e) => change({ effective_from: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-application-reason", children: "Lý do thay đổi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-application-reason", value: f.reason, onChange: (e) => change({ reason: e.target.value }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: preview ? `${preview.employee_count} nhân viên thuộc phạm vi từ ngày ${f.effective_from.split("-").reverse().join("/")}.` : `${scope.employee_count} nhân viên thuộc cấu hình đã lưu.` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: mutation.isPending || !f.effective_from, onClick: () => mutation.mutate("preview"), children: "Kiểm tra phạm vi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: mutation.isPending || !preview || !f.reason.trim(), onClick: () => mutation.mutate("save"), children: "Lưu phạm vi" })
    ] })
  ] });
}
function Biz3KSettings({ settings }) {
  const save = useK3SettingsSave();
  const [f, setF] = reactExports.useState({
    enabled: settings.enabled,
    effective_from: settings.effective_from ?? "",
    plan_by: settings.plan_by.slice(0, 5),
    summary_by: settings.summary_by.slice(0, 5),
    max_focus: settings.max_focus.toString()
  });
  const { data: logs } = useQuery({
    queryKey: ["k3_settings_log"],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("k3_settings_log").select("*").order("changed_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    }
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    try {
      await save.mutateAsync({
        enabled: f.enabled,
        effective_from: f.effective_from || null,
        plan_by: f.plan_by,
        summary_by: f.summary_by,
        max_focus: Number(f.max_focus)
      });
      toast.success("Đã lưu cấu hình 3K.");
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KApplicationScope, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-lg border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Quy định thực thi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Áp dụng 3K hằng ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.enabled, onCheckedChange: (v) => set("enabled", v) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3s-from", children: "Ngày bắt đầu áp dụng chính thức" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3s-from", type: "date", value: f.effective_from, onChange: (e) => set("effective_from", e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nghĩa vụ 3K chỉ áp dụng từ ngày này; hệ thống không tạo ngày quá hạn trong lịch sử." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3s-plan", children: "Giờ lập 3K đầu ngày" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3s-plan", type: "time", value: f.plan_by, onChange: (e) => set("plan_by", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3s-summary", children: "Giờ tổng kết cuối ngày" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3s-summary", type: "time", value: f.summary_by, onChange: (e) => set("summary_by", e.target.value) })
        ] })
      ] }),
      settings.discipline_from && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Kỷ luật đầu ngày áp dụng từ ",
        settings.discipline_from.split("-").reverse().join("/"),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3s-focus", children: "Số mũi khoan trọng tâm tối đa / ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3s-focus", type: "number", min: 1, max: 5, value: f.max_focus, onChange: (e) => set("max_focus", e.target.value), className: "w-28" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: save.isPending, onClick: submit, children: save.isPending ? "Đang lưu…" : "Lưu cấu hình" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ModulePermissionSettings, { settings }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodSettings, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KAutomation, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Phân quyền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Phạm vi xem kế thừa từ Cơ cấu tổ chức: Trưởng Nhóm xem Nhóm, Trưởng Phòng xem Phòng, Giám Đốc Hệ xem Hệ, lãnh đạo điều hành xem toàn Khối. Quyền 3K chỉ đến từ bổ nhiệm hiệu lực trong Cơ cấu tổ chức; Role tổng không cấp quyền Kinh doanh. Cài đặt 3K dành cho Admin/Super Admin." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Quy chuẩn trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: Object.keys(K3_STATUS).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: K3_STATUS[s].label }, s)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Công việc chưa hoàn thành khi tổng kết phải có đủ Vấn đề – Nguyên nhân – Giải pháp. Kết quả vượt kế hoạch vẫn được ghi nhận." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Lịch sử cấu hình" }),
        !logs?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có thay đổi nào được ghi nhận." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: logs?.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border p-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: new Date(l.changed_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            l.snapshot.new.enabled ? "Bật" : "Tắt",
            " · từ ",
            l.snapshot.new.effective_from ?? "—",
            " · lập ",
            l.snapshot.new.plan_by?.slice(0, 5),
            " · tổng kết ",
            l.snapshot.new.summary_by?.slice(0, 5),
            " · tối đa ",
            l.snapshot.new.max_focus,
            " mũi khoan"
          ] })
        ] }, l.id)) })
      ] })
    ] })
  ] });
}
function ModulePermissionSettings({ settings }) {
  const mutation = useK3GoalMutation();
  const [f, setF] = reactExports.useState({
    allow_personal_goal: settings.allow_personal_goal ?? true,
    allow_team_goal: settings.allow_team_goal ?? true,
    allow_invite: settings.allow_invite ?? true,
    allow_assign: settings.allow_assign ?? true
  });
  const items = [
    { key: "allow_personal_goal", label: "Cho phép tạo KG cá nhân" },
    { key: "allow_team_goal", label: "Cho phép tạo KG nhóm / liên nhóm" },
    { key: "allow_invite", label: "Cho phép mời thành viên tham gia KG" },
    { key: "allow_assign", label: "Cho phép phân công KF cho thành viên" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Quyền nghiệp vụ 3K" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Áp dụng cho người dùng thường; Admin/Super Admin luôn đủ quyền. Phạm vi xem vẫn theo Cơ cấu tổ chức." }),
    items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: it.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f[it.key], onCheckedChange: (v) => setF((p) => ({ ...p, [it.key]: v })) })
    ] }, it.key)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", disabled: mutation.isPending, onClick: async () => {
      try {
        await mutation.mutateAsync({ kind: "module_settings", payload: f });
        toast.success("Đã lưu quyền nghiệp vụ 3K.");
      } catch (e) {
        toast.error(k3Error(e));
      }
    }, children: mutation.isPending ? "Đang lưu…" : "Lưu quyền nghiệp vụ" })
  ] });
}
function PeriodSettings() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery(k3PeriodConfigQuery(uid));
  if (query.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(query.error) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Thử lại" })
  ] });
  return query.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodSettingsForm, { config: query.data }, JSON.stringify(query.data)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải cài đặt Tuần/Tháng…" });
}
function PeriodSettingsForm({ config }) {
  const save = useK3PeriodMutation();
  const [f, setF] = reactExports.useState(config);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-b border-border pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "3K Tuần và Tháng" }),
    ["week", "month"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex justify-between gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Áp dụng 3K ",
        v === "week" ? "Tuần" : "Tháng"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f[v === "week" ? "week_enabled" : "month_enabled"], onCheckedChange: (value) => setF({ ...f, [v === "week" ? "week_enabled" : "month_enabled"]: value }) })
    ] }, v)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-period-effective", children: "Ngày bắt đầu áp dụng Tuần/Tháng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-period-effective", type: "date", value: f.period_effective_from ?? "", onChange: (e) => setF({ ...f, period_effective_from: e.target.value || null }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm text-primary", children: "Deadline Tuần/Tháng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-3", children: ["week_plan", "week_summary", "month_plan", "month_summary"].map((key) => {
        const d = f.period_deadlines[key];
        const set = (field, value) => setF({ ...f, period_deadlines: { ...f.period_deadlines, [key]: { offset: d?.offset ?? 0, time: d?.time ?? "", effective_from: d?.effective_from ?? "", [field]: field === "offset" ? Number(value) : value } } });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b border-border pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!d, onChange: (e) => {
              const next = { ...f.period_deadlines };
              if (e.target.checked) next[key] = { offset: 0, time: "", effective_from: "" };
              else delete next[key];
              setF({ ...f, period_deadlines: next });
            } }),
            { week_plan: "Lập kế hoạch Tuần", week_summary: "Tổng kết Tuần", month_plan: "Lập kế hoạch Tháng", month_summary: "Tổng kết Tháng" }[key]
          ] }),
          d && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày lệch từ đầu kỳ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: -31, max: 62, value: d.offset, onChange: (e) => set("offset", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giờ Việt Nam" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: d.time, onChange: (e) => set("time", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày hiệu lực deadline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: d.effective_from, onChange: (e) => set("effective_from", e.target.value) })
            ] })
          ] })
        ] }, key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: async () => {
      try {
        await save.mutateAsync({ kind: "settings", payload: { ...f } });
        toast.success("Đã lưu cài đặt Tuần/Tháng.");
      } catch (e) {
        toast.error(k3Error(e));
      }
    }, children: "Lưu Tuần/Tháng" })
  ] });
}
const iso = (d) => d.toISOString().slice(0, 10);
function k3AddDays(date, amount) {
  const d = /* @__PURE__ */ new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return iso(d);
}
function k3PeriodBounds(type, date) {
  const d = /* @__PURE__ */ new Date(`${date}T12:00:00Z`);
  if (type === "week") {
    const start2 = k3AddDays(date, -((d.getUTCDay() + 6) % 7));
    return { start: start2, end: k3AddDays(start2, 6) };
  }
  if (type === "quarter") {
    const qm = Math.floor(d.getUTCMonth() / 3) * 3;
    return { start: iso(new Date(Date.UTC(d.getUTCFullYear(), qm, 1, 12))), end: iso(new Date(Date.UTC(d.getUTCFullYear(), qm + 3, 0, 12))) };
  }
  const start = `${date.slice(0, 7)}-01`;
  return { start, end: iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12))) };
}
const planLabels = { on_time: "Đúng hạn", late: "Thiết lập muộn", none: "Chưa thiết lập", na: "Không áp dụng", unobserved: "Chưa có dấu mốc" };
const sourceLabels = { self: "Tự tạo", scheduled: "Theo lộ trình", mixed: "Kết hợp" };
function disciplineTotals(rows) {
  const duty = rows.filter((r) => r.obligated);
  return {
    required: duty.length,
    planOnTime: duty.filter((r) => r.plan_status === "on_time").length,
    planLate: duty.filter((r) => r.plan_status === "late").length,
    planMissing: duty.filter((r) => r.plan_status === "none").length,
    unobserved: duty.filter((r) => r.plan_status === "unobserved").length,
    reviewOnTime: duty.filter((r) => r.manual_status === "reviewed" && !r.summary_late).length,
    reviewLate: duty.filter((r) => r.manual_status === "reviewed" && r.summary_late).length,
    reviewMissing: duty.filter((r) => r.manual_status === "none").length,
    reconfirm: duty.filter((r) => r.manual_status === "reconfirm").length
  };
}
function Biz3KDiscipline({ start, end, manage = false }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery({ queryKey: ["k3_discipline", uid, start, end, manage], queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_discipline_read", { _start: start, _end: end, _manage: manage });
    if (error) throw error;
    return data;
  } });
  if (query.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(query.error) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Thử lại" })
  ] });
  if (!query.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải kỷ luật ngày…" });
  const rows = query.data;
  const totals = disciplineTotals(rows);
  const people = [...new Set(rows.map((r) => r.user_id))];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-y border-border py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Kỷ luật 3K" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [["Ngày có nghĩa vụ", totals.required], ["Kế hoạch đúng hạn", `${totals.planOnTime}/${totals.required}`], ["Tổng kết đúng hạn", `${totals.reviewOnTime}/${totals.required}`], ["Tổng kết muộn", totals.reviewLate]].map(([label, n]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold", children: n })
    ] }, label)) }),
    people.map((id) => {
      const days = rows.filter((r) => r.user_id === id);
      const person = days[0];
      if (!person) return null;
      const t = disciplineTotals(days);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 border-t border-border py-2 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: manage ? person.name : "Của tôi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            person.department,
            " · ",
            t.required,
            " ngày có nghĩa vụ"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Kế hoạch đầu ngày" }),
          start === end ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: planLabels[person.plan_status] }),
            person.plan_source && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: sourceLabels[person.plan_source] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            "Đúng hạn ",
            t.planOnTime,
            "/",
            t.required,
            " · Muộn ",
            t.planLate,
            " · Chưa lập ",
            t.planMissing,
            t.unobserved ? ` · Chưa có dấu mốc ${t.unobserved}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tổng kết cuối ngày" }),
          start === end ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: person.manual_status === "reconfirm" ? "destructive" : "secondary", children: !person.obligated ? "Không áp dụng" : person.manual_status === "reconfirm" ? "Cần tổng kết lại" : person.manual_status === "none" ? "Chưa tổng kết" : person.summary_late ? "Đã tổng kết muộn" : "Đã tổng kết" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            "Đúng hạn ",
            t.reviewOnTime,
            "/",
            t.required,
            " · Muộn ",
            t.reviewLate,
            " · Chưa tổng kết ",
            t.reviewMissing,
            " · Cần lại ",
            t.reconfirm
          ] })
        ] })
      ] }, id);
    }),
    !rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có ngày phù hợp phạm vi." })
  ] });
}
const K3_GOAL_STATUS = {
  draft: { label: "Nháp", tone: "neutral" },
  not_started: { label: "Chưa bắt đầu", tone: "neutral" },
  in_progress: { label: "Đang thực hiện", tone: "info" },
  paused: { label: "Tạm dừng", tone: "warning" },
  done: { label: "Hoàn thành", tone: "success" },
  ended_missed: { label: "Kết thúc chưa đạt", tone: "danger" },
  cancelled: { label: "Đã hủy", tone: "neutral" }
};
const K3_MEMBER_STATUS = {
  invited: "Chờ xác nhận",
  accepted: "Đang tham gia",
  declined: "Đã từ chối",
  revoked: "Đã thu hồi"
};
const K3_GOAL_EVENT = {
  goal_save: "Lưu mục tiêu KG",
  goal_status: "Đổi trạng thái KG",
  action_save: "Lưu hành động KF",
  action_status: "Đổi trạng thái KF",
  member_invite: "Mời thành viên",
  member_accept: "Chấp nhận tham gia",
  member_decline: "Từ chối tham gia",
  member_revoke: "Thu hồi thành viên"
};
const k3KpiResultQuery = (uid, kpi, date) => queryOptions({
  queryKey: ["k3_kpi_result", uid, kpi, date],
  staleTime: 3e4,
  refetchOnWindowFocus: false,
  retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_kpi_result_read", { _kpi: kpi, _date: date });
    if (error) throw error;
    return data;
  }
});
function useK3KpiResultSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase.rpc("k3_kpi_result_save", { _payload: { ...payload, ack_only: true } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") && q.queryKey[0] !== "k3_preview" });
    }
  });
}
const metricText = (data) => `${data.actual == null ? "Chưa có số liệu" : data.actual.toLocaleString("vi-VN")}${data.progress == null ? "" : ` · ${data.progress}%`} · ${data.attained == null ? "Chưa đủ dữ liệu" : data.attained ? "Đạt" : "Chưa đạt"}`;
function Biz3KKpiResult({ kpiId, date, showStatus = true, readOnly = false, compact = false, hideName = false, historyOnly = false }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery({ ...k3KpiResultQuery(uid, kpiId, date), enabled: !!uid });
  const [open, setOpen] = reactExports.useState(null);
  const qc = useQueryClient();
  const [acceptanceReason, setAcceptanceReason] = reactExports.useState("");
  const [acceptanceBusy, setAcceptanceBusy] = reactExports.useState(false);
  if (query.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Đang tải kết quả KPI…" });
  if (query.error || !query.data) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-destructive", children: [
    k3Error(query.error),
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => query.refetch(), children: "Thử lại" })
  ] });
  const data = query.data;
  const isBinary = data.kpi.measure === "binary";
  const binaryText = data.metric?.pending_acceptance ? "Chờ nghiệm thu" : data.metric ? data.metric.attained ? "Đã hoàn thành" : "Chưa hoàn thành" : data.daily ? "Đã cập nhật" : "Chưa cập nhật";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-result-block space-y-2 border-b border-border py-2", children: [
    !historyOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [
        !hideName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words text-sm font-medium", children: data.kpi.name }),
          !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            K3_MEASURE_LABELS[data.kpi.measure],
            isBinary ? "" : ` · Chỉ tiêu ${data.kpi.target ?? data.kpi.milestones?.length ?? "—"} ${data.kpi.unit}`
          ] })
        ] }),
        showStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: data.metric.attained ? "default" : "secondary", children: data.metric.status === "not_started" ? "Chưa bắt đầu" : data.metric.attained ? "Hoàn thành" : "Đang thực hiện" })
      ] }),
      isBinary ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Kết quả: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: binaryText })
      ] }) : compact ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm tabular-nums", children: [
          "Kết quả: ",
          k3MetricDisplay(data.kpi.measure, data.metric, data.kpi.target, data.kpi.unit ?? "")
        ] }),
        data.kpi.measure === "cumulative" && data.metric.progress != null && /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { "aria-label": "Tiến độ công việc", className: "h-1.5 max-w-64", value: Math.min(100, Math.max(0, data.metric.progress)) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1 text-sm tabular-nums sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Hôm nay: ",
          data.daily_metric ? k3MetricDisplay(data.kpi.measure, data.daily_metric, null, data.kpi.unit ?? "") : data.daily ? data.daily.value ?? "Đã cập nhật" : "Chưa cập nhật"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          data.kpi.measure === "current" ? "Giá trị mới nhất" : "Lũy kế",
          ": ",
          k3MetricDisplay(data.kpi.measure, data.metric, data.kpi.target, data.kpi.unit ?? "")
        ] })
      ] }),
      !compact && !isBinary && data.daily_plan != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
        "Kế hoạch ngày: ",
        data.daily?.value ?? "—",
        "/",
        data.daily_plan,
        " ",
        data.kpi.unit,
        data.daily?.value != null && data.daily_plan > 0 ? ` · ${Math.round(data.daily.value / data.daily_plan * 100)}%` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      !historyOnly && data.can_update && !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "max-md:min-h-11", variant: "outline", onClick: () => setOpen("edit"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
        "Cập nhật kết quả"
      ] }),
      (!compact || historyOnly) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setOpen("history"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "mr-1 h-3.5 w-3.5" }),
        historyOnly ? data.kpi.name : "Nhật ký kết quả"
      ] })
    ] }),
    open === "edit" && /* @__PURE__ */ jsxRuntimeExports.jsx(KpiResultDialog, { data, date, onClose: () => setOpen(null) }, data.daily?.revision ?? 0),
    open === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && setOpen(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Nhật ký KPI · ",
        data.kpi.name
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Đã chốt: ",
        metricText(data.official_metric)
      ] }),
      !data.results.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có kết quả." }),
      data.can_accept && !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Lý do nghiệm thu", value: acceptanceReason, onChange: (e) => setAcceptanceReason(e.target.value) }),
      data.results.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b border-border py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          r.work_date,
          " · ",
          r.full_name ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Kết quả ngày: ",
          r.value ?? (r.numerator != null ? `${r.numerator}/${r.denominator}` : (data.kpi.measure === "milestone" ? r.completed : r.objects)?.join(", "))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.is_confirmed ? "Đã chốt" : "Chưa chốt / Cần xác nhận lại" }),
        data.can_accept && !readOnly && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["accepted", "rejected"].map((decision) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: acceptanceBusy || !acceptanceReason.trim(), onClick: async () => {
          setAcceptanceBusy(true);
          try {
            const { error } = await supabase.rpc("k3_kpi_accept", { _result: r.id, _revision: r.revision, _decision: decision, _reason: acceptanceReason });
            if (error) throw error;
            await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
            toast.success("Đã lưu quyết định nghiệm thu.");
          } catch (e) {
            toast.error(k3Error(e));
          } finally {
            setAcceptanceBusy(false);
          }
        }, children: decision === "accepted" ? "Nghiệm thu" : "Từ chối" }, decision)) }),
        data.acceptances?.filter((a) => a.result_id === r.id).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          a.decision === "accepted" ? "Đã nghiệm thu" : "Từ chối",
          " · Phiên bản ",
          a.result_revision,
          " · ",
          a.reason
        ] }, a.id))
      ] }, r.id)),
      data.history.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Phiên bản ",
        v.revision,
        " · ",
        v.snapshot.work_date,
        " · ",
        new Date(v.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        " · Kết quả ",
        v.snapshot.value ?? `${v.snapshot.numerator ?? "—"}/${v.snapshot.denominator ?? "—"}`
      ] }, v.id))
    ] }) })
  ] });
}
function KpiResultDialog({ data, date, onClose }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const save = useK3KpiResultSave();
  const qc = useQueryClient();
  const [key] = reactExports.useState(() => crypto.randomUUID());
  const [correctionReason, setCorrectionReason] = reactExports.useState("");
  const [uncertainPayload, setUncertainPayload] = reactExports.useState(null);
  const [saveError, setSaveError] = reactExports.useState("");
  const [checking, setChecking] = reactExports.useState(false);
  const [f, setF] = reactExports.useState({ value: data.daily?.value == null ? "" : String(data.kpi.measure === "duration" && data.kpi.config?.duration_unit === "hours" ? data.daily.value / 60 : data.daily.value), numerator: data.daily?.numerator?.toString() ?? "", denominator: data.daily?.denominator?.toString() ?? "", objects: data.daily?.objects?.join("\n") ?? "", completed: data.daily?.completed ?? [], evidence: data.daily?.evidence ?? "", note: data.daily?.note ?? "", problem: data.daily?.problem ?? "", cause: data.daily?.cause ?? "", solution: data.daily?.solution ?? "" });
  const [intervals, setIntervals] = reactExports.useState(data.daily?.intervals ?? []);
  const measure = data.kpi.measure;
  const daily = { ...f, intervals, id: data.daily?.id ?? "", revision: data.daily?.revision ?? 0, value: f.value === "" ? null : Number(f.value), numerator: f.numerator === "" ? null : Number(f.numerator), denominator: f.denominator === "" ? null : Number(f.denominator), objects: f.objects.split("\n").filter((s) => s.trim()), user_id: uid, work_date: date };
  const previewKey = JSON.stringify(daily);
  const [debouncedDaily, setDebouncedDaily] = reactExports.useState(daily);
  reactExports.useEffect(() => {
    const handle = setTimeout(() => setDebouncedDaily(JSON.parse(previewKey)), 450);
    return () => clearTimeout(handle);
  }, [previewKey]);
  const previewQuery = useQuery({
    queryKey: ["k3_preview", uid, data.kpi.id, date, debouncedDaily],
    enabled: !!uid && !uncertainPayload,
    staleTime: 1e4,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const { data: result, error } = await supabase.rpc("k3_kpi_result_preview", { _kpi: data.kpi.id, _date: date, _payload: debouncedDaily }).abortSignal(signal);
      if (error) throw error;
      return result;
    }
  });
  const set = (name, value) => setF((p) => ({ ...p, [name]: value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && !save.isPending && !checking && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Cập nhật kết quả · ",
      data.kpi.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { disabled: !!uncertainPayload || save.isPending || checking, className: "min-w-0 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Ngày ",
        date,
        measure !== "binary" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " · Mục tiêu ",
          data.kpi.target ?? data.kpi.milestones?.length,
          " ",
          data.kpi.unit
        ] })
      ] }),
      ["cumulative", "current", "duration", "frequency"].includes(measure) && !(measure === "duration" && data.kpi.config?.duration_method === "intervals") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-result-value", children: measure === "current" ? "Giá trị hiện tại" : measure === "duration" ? `Thời lượng trong ngày (${data.kpi.config?.duration_unit === "hours" ? "giờ" : "phút"})` : measure === "frequency" ? "Số lần hợp lệ trong ngày" : "Tổng số lượng thực hiện trong ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-result-value", type: "number", inputMode: "decimal", min: 0, value: f.value, onChange: (e) => set("value", e.target.value) })
      ] }),
      measure === "binary" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 md:flex", role: "group", "aria-label": "Kết quả hoàn thành", children: [["0", "Chưa hoàn thành"], ["1", "Đã hoàn thành"]].map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "max-md:min-h-12", variant: f.value === value ? "default" : "outline", "aria-pressed": f.value === value, onClick: () => set("value", value), children: label }, value)) }),
      measure === "streak" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: data.kpi.config?.valid_condition }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: f.value === "1", onCheckedChange: (v) => set("value", v === true ? "1" : "0") }),
          "Đã đáp ứng điều kiện trong ngày"
        ] })
      ] }),
      measure === "duration" && data.kpi.config?.duration_method === "intervals" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        intervals.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: ["start", "end"].map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `${field === "start" ? "Bắt đầu" : "Kết thúc"} khoảng ${i + 1}`, type: "datetime-local", value: item[field].slice(0, 16), onChange: (e) => setIntervals((prev) => prev.map((x, j) => j === i ? { ...x, [field]: `${e.target.value}:00+07:00` } : x)) }, field)) }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setIntervals((prev) => [...prev, { start: `${date}T08:00:00+07:00`, end: `${date}T09:00:00+07:00` }]), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          "Thêm khoảng thời gian"
        ] })
      ] }),
      (measure === "ratio" || measure === "average") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-result-num", children: measure === "ratio" ? "Tử số" : "Tổng giá trị quan sát" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-result-num", type: "number", inputMode: "decimal", min: 0, value: f.numerator, onChange: (e) => set("numerator", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-result-den", children: measure === "ratio" ? "Mẫu số" : "Số lượng quan sát" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-result-den", type: "number", inputMode: "decimal", min: 0, value: f.denominator, onChange: (e) => set("denominator", e.target.value) })
        ] })
      ] }),
      measure === "distinct" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-result-objects", children: "Định danh đối tượng (mỗi dòng một mã)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3-result-objects", rows: 4, value: f.objects, onChange: (e) => set("objects", e.target.value) })
      ] }),
      measure === "milestone" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: data.kpi.milestones?.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: f.completed.includes(m), onCheckedChange: (v) => setF((p) => ({ ...p, completed: v === true ? [...p.completed, m] : p.completed.filter((x) => x !== m) })) }),
        data.kpi.config?.milestones?.find((x) => x.id === m)?.name ?? m
      ] }, m)) }),
      data.kpi.config?.evidence_required || measure === "milestone" || f.evidence ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-result-evidence", children: "Bằng chứng / nguồn *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-result-evidence", value: f.evidence, onChange: (e) => set("evidence", e.target.value) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm", children: "Thêm bằng chứng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", "aria-label": "Bằng chứng / nguồn", value: f.evidence, onChange: (e) => set("evidence", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-y border-border py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
          "Kết quả mới: ",
          previewQuery.data ? k3MetricDisplay(measure, previewQuery.data, data.kpi.target, data.kpi.unit ?? "") : previewQuery.error ? "Chưa đủ dữ liệu hợp lệ" : "Đang tính…"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: data.daily ? "Thay thế tổng kết quả ngày đã ghi." : "Kết quả ngày chưa chốt." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: !!f.note, className: "md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Ghi chú", className: "mt-2", rows: 2, value: f.note, onChange: (e) => set("note", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-result-note", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3-result-note", rows: 2, value: f.note, onChange: (e) => set("note", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-sm", children: "Vấn đề – Nguyên nhân – Giải pháp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2", children: ["problem", "cause", "solution"].map((name, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": ["Vấn đề", "Nguyên nhân", "Giải pháp"][i], rows: 2, value: f[name], onChange: (e) => set(name, e.target.value) }, name)) })
      ] }),
      data.day_closed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-correction", children: "Lý do bổ sung / sửa sau chốt *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3-correction", value: correctionReason, onChange: (e) => setCorrectionReason(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giữ bản chốt cũ, ghi lịch sử điều chỉnh và yêu cầu xác nhận lại." })
      ] })
    ] }),
    saveError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: saveError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: save.isPending || checking, onClick: onClose, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending || checking, onClick: async () => {
        setSaveError("");
        const payload = uncertainPayload ?? { ...daily, kpi_id: data.kpi.id, revision: data.daily?.revision ?? 0, request_key: key, correction_reason: correctionReason };
        try {
          if (!uncertainPayload && data.day_closed && !correctionReason.trim()) throw new Error("Nhập lý do bổ sung hoặc sửa sau chốt.");
          if (!uncertainPayload && measure === "binary" && f.value === "") throw new Error("Chọn Đã hoàn thành hoặc Chưa hoàn thành.");
          await save.mutateAsync(payload);
          toast.success("Đã lưu kết quả KPI.");
          onClose();
        } catch (e) {
          if (isK3AmbiguousWrite(e)) {
            setChecking(true);
            const check = await checkK3ResultSave(uid, key);
            setChecking(false);
            if (check.status === "saved") {
              void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
              toast.success("Kết quả KPI đã được lưu.");
              onClose();
              return;
            }
            setUncertainPayload(payload);
            setSaveError(check.status === "missing" ? "Chưa thấy kết quả được lưu. Có thể thử lại an toàn bằng đúng yêu cầu trước đó." : "Chưa xác minh được kết quả đã lưu hay chưa. Thử lại an toàn sẽ giữ nguyên dữ liệu và mã yêu cầu để tránh ghi trùng.");
          } else {
            setSaveError(k3Error(e));
          }
        }
      }, children: save.isPending ? "Đang lưu…" : checking ? "Đang xác minh…" : uncertainPayload ? "Thử lưu lại an toàn" : "Lưu kết quả" })
    ] })
  ] }) });
}
const DeleteContext = reactExports.createContext(null);
function K3DeleteProvider({ children }) {
  const qc = useQueryClient();
  const [target, setTarget] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [uncertain, setUncertain] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const inFlight = reactExports.useRef(false);
  const close = () => {
    if (!inFlight.current) {
      setTarget(null);
      setError(null);
      setUncertain(false);
    }
  };
  const remove = async () => {
    if (!target || inFlight.current) return;
    const selected = target;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("k3_soft_delete", { _kind: selected.kind, _id: selected.id });
      if (rpcError) throw rpcError;
    } catch (err) {
      const ambiguous = isK3AmbiguousWrite(err);
      setUncertain(ambiguous);
      if (ambiguous) void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
      setError(ambiguous ? "Chưa xác minh được trạng thái xóa. Hãy đóng và kiểm tra danh sách / Thùng rác trước khi thử lại." : k3Error(err));
      inFlight.current = false;
      setBusy(false);
      return;
    }
    setTarget(null);
    inFlight.current = false;
    setBusy(false);
    selected.onDeleted?.();
    toast.success("Đã chuyển vào Thùng rác. Có thể khôi phục trong 15 ngày.");
    try {
      await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
    } catch {
      toast.error("Đã xóa công việc nhưng danh sách chưa cập nhật. Vui lòng tải lại.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DeleteContext.Provider, { value: (selected) => {
    if (inFlight.current) return;
    setError(null);
    setUncertain(false);
    setTarget({ ...selected });
  }, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: target !== null, onOpenChange: (open) => {
      if (!open) close();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto", onEscapeKeyDown: (e) => {
      if (inFlight.current) e.preventDefault();
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Xóa công việc này?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "break-words", children: [
          "Công việc “",
          target?.name,
          "” sẽ không còn trong danh sách của bạn. Có thể khôi phục trong 15 ngày."
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "break-words text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: busy, onClick: close, children: "Quay lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { className: "bg-destructive text-destructive-foreground", disabled: busy || uncertain, onClick: (e) => {
          e.preventDefault();
          void remove();
        }, children: busy ? "Đang xóa…" : "Xóa" })
      ] })
    ] }) })
  ] });
}
function K3DeleteMenuItem({ kind, id, name, onDeleted }) {
  const requestDelete = reactExports.useContext(DeleteContext);
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const check = useQuery({
    queryKey: ["k3_deletable", uid, kind, id],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("k3_deletable", { _kind: kind, _id: id });
      if (error) {
        k3Error(error);
        throw error;
      }
      return data;
    }
  });
  if (!check.data?.ok || !requestDelete) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "text-destructive", onSelect: () => requestDelete({ kind, id, name, onDeleted }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
    "Xóa"
  ] });
}
const toneClass = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground"
};
function GoalStatusBadge({ status, overdueDays, metric }) {
  const meta = K3_GOAL_STATUS[status] ?? K3_GOAL_STATUS.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex flex-wrap items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn("border-0", toneClass[meta.tone]), children: meta.label }),
    metric?.overdue && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
      "Quá hạn ",
      Math.max(1, Math.floor(metric.overdue_seconds / 3600)),
      " giờ"
    ] }),
    !metric && !!overdueDays && overdueDays > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
      "Quá hạn ",
      overdueDays,
      " ngày"
    ] })
  ] });
}
const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "mine", label: "Của tôi" },
  { value: "joined", label: "Tôi tham gia" },
  { value: "assigned", label: "Tôi phụ trách KF" },
  { value: "active", label: "Đang thực hiện" },
  { value: "overdue", label: "Quá hạn" },
  { value: "done", label: "Hoàn thành" },
  { value: "scope", label: "Trong phạm vi quản lý", scope: true }
];
const COLLAB_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "lead", label: "Tôi chủ trì" },
  { value: "join", label: "Tôi tham gia" },
  { value: "active", label: "Đang thực hiện" },
  { value: "overdue", label: "Quá hạn" },
  { value: "done", label: "Hoàn thành" }
];
function Biz3KGoals({ settings, variant = "personal", compact = false }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const [filter, setFilter] = reactExports.useState(variant === "scope" ? "scope" : variant === "collab" ? "collab" : "all");
  const [sub, setSub] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [serverSearch, setServerSearch] = reactExports.useState("");
  reactExports.useEffect(() => {
    const handle = window.setTimeout(() => setServerSearch(search.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [search]);
  const [selected, setSelected] = reactExports.useState(null);
  const [creating, setCreating] = reactExports.useState(false);
  const { data, isLoading, error, refetch } = useQuery({ ...k3GoalListQuery(uid, filter, serverSearch), enabled: !!uid && !compact });
  const invited = useQuery({ ...k3GoalListQuery(uid, "invited", ""), enabled: !!uid && !compact });
  const mutation = useK3GoalMutation();
  const shown = reactExports.useMemo(() => {
    const list = (data ?? []).filter((g) => g.status !== "cancelled");
    if (variant !== "collab") return list;
    switch (sub) {
      case "lead":
        return list.filter((g) => g.my_role === "owner");
      case "join":
        return list.filter((g) => g.my_role === "accepted");
      case "active":
        return list.filter((g) => ["not_started", "in_progress", "paused"].includes(g.status));
      case "overdue":
        return list.filter((g) => g.overdue_days > 0);
      case "done":
        return list.filter((g) => g.status === "done");
      default:
        return list;
    }
  }, [data, sub, variant]);
  const respond = async (goalId, accept) => {
    try {
      await mutation.mutateAsync({ kind: "respond", goal_id: goalId, accept });
      toast.success(accept ? "Đã chấp nhận tham gia mục tiêu." : "Đã từ chối lời mời.");
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !compact && (invited.data?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Lời mời tham gia mục tiêu" }),
      (invited.data ?? []).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: g.name }),
          " · chủ trì ",
          g.owner_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => respond(g.id, true), disabled: mutation.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-4 w-4" }),
          "Chấp nhận"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => respond(g.id, false), disabled: mutation.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-4 w-4" }),
          "Từ chối"
        ] })
      ] }, g.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      !compact && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm công việc…", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full md:w-56" }),
      !compact && variant === "personal" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filter, onValueChange: setFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FILTERS.filter((f) => !f.scope).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.value, children: f.label }, f.value)) })
      ] }),
      variant === "collab" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 max-w-full overflow-x-auto gap-1 md:flex-wrap", children: COLLAB_FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", className: "shrink-0 max-md:min-h-11", size: "sm", variant: sub === f.value ? "default" : "outline", onClick: () => setSub(f.value), children: f.label }, f.value)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "max-md:min-h-11 max-md:w-full md:w-auto", onClick: () => setCreating(true), disabled: !settings.enabled || variant !== "personal" && !settings.allow_team_goal, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " ",
        variant === "personal" ? "Tạo công việc" : "Tạo công việc nhóm"
      ] })
    ] }),
    !compact && isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-6 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 inline h-4 w-4 animate-spin" }),
      "Đang tải…"
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-destructive/40 p-4 text-center text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(error) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "mt-2", onClick: () => refetch(), children: "Thử lại" })
    ] }),
    !compact && data && shown.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground", children: variant === "collab" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      "Chưa có công việc nhóm nào phù hợp. Bấm ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tạo công việc nhóm" }),
      " để lập KG có nhiều người phối hợp."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      "Chưa có công việc nào phù hợp. Bấm ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tạo công việc" }),
      " để lập mục tiêu (KG) cùng các bước thực hiện (KF)."
    ] }) }),
    !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: shown.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setSelected(g.id),
        className: "k3-goal-card w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 md:flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "break-words font-medium leading-snug", children: [
              g.is_key && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-1 inline h-4 w-4 fill-primary text-primary" }),
              g.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Chủ trì ",
              g.owner_name,
              " · ",
              timelineLabel(g.period_start, g.start_time),
              " → ",
              timelineLabel(g.due_date ?? g.period_end, g.due_time),
              " · ",
              g.kf_done,
              "/",
              g.kf_total,
              " KF hoàn thành",
              g.member_count > 0 && ` · ${g.member_count + 1} người tham gia`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoalStatusBadge, { status: g.status, metric: g.metric, overdueDays: g.overdue_days })
        ] })
      },
      g.id
    )) }),
    creating && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KQuickCreate, { variant: variant === "personal" ? "personal" : "team", defaultDate: settings.today, onClose: () => setCreating(false) }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalDetailSheet, { id: selected, settings, onClose: () => setSelected(null) })
  ] });
}
function GoalDialog({ goal, onClose }) {
  const mutation = useK3GoalMutation();
  const [key] = reactExports.useState(() => crypto.randomUUID());
  const [f, setF] = reactExports.useState({
    name: goal?.name ?? "",
    description: goal?.description ?? "",
    expected_result: goal?.expected_result ?? "",
    period_start: goal?.period_start ?? "",
    period_end: goal?.period_end ?? "",
    due_date: goal?.due_date ?? "",
    is_key: goal?.is_key ?? false,
    start_time: goal?.start_time?.slice(0, 5) ?? "",
    due_time: goal?.due_time?.slice(0, 5) ?? ""
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        kind: "goal",
        payload: {
          id: goal?.id,
          revision: goal?.revision,
          request_key: goal ? void 0 : key,
          period_type: "custom",
          period_start: f.period_start,
          period_end: f.period_end,
          name: f.name,
          description: f.description,
          expected_result: f.expected_result,
          due_date: f.period_end,
          is_key: f.is_key,
          start_time: f.start_time,
          due_time: f.due_time
        }
      });
      toast.success(goal ? "Đã lưu mục tiêu." : "Đã lưu nháp mục tiêu KG.");
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: goal ? "Sửa mục tiêu KG" : "Tạo mục tiêu KG" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3g-name", children: "Tên mục tiêu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3g-name", value: f.name, onChange: (e) => set("name", e.target.value), placeholder: "Ví dụ: Phát triển 30 khách hàng tiềm năng đủ điều kiện" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KTimeline, { id: "k3g", start: f.period_start, end: f.period_end, startTime: f.start_time, endTime: f.due_time, onChange: (field, value) => set({ start: "period_start", end: "period_end", startTime: "start_time", endTime: "due_time" }[field], value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3g-result", children: "Kết quả cần đạt / tiêu chí hoàn thành" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3g-result", rows: 2, value: f.expected_result, onChange: (e) => set("expected_result", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3g-desc", children: "Mô tả ngắn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3g-desc", rows: 2, value: f.description, onChange: (e) => set("description", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: f.is_key, onChange: (e) => set("is_key", e.target.checked), className: "h-4 w-4" }),
        "Đánh dấu KG trọng tâm (ưu tiên hiển thị)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: mutation.isPending || !f.name.trim() || !f.period_start || !f.period_end, onClick: submit, children: mutation.isPending ? "Đang lưu…" : "Lưu mục tiêu" })
    ] })
  ] }) });
}
function GoalKpiAccordion({ kpis, date, title }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  if (!kpis.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-xl border bg-muted/30 px-3", onToggle: (e) => setExpanded(e.currentTarget.open), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer min-h-11 py-3 text-sm font-medium text-primary", children: [
      title,
      " · ",
      kpis.length,
      " chỉ số"
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pb-3", children: kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiResult, { kpiId: k.id, date, showStatus: false }, k.id)) })
  ] });
}
function GoalDetailSheet({ id, settings, onClose }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const { data, isLoading, error, refetch } = useQuery({ ...k3GoalDetailQuery(uid, id), enabled: !!uid && !!id });
  const mutation = useK3GoalMutation();
  const [editGoal, setEditGoal] = reactExports.useState(false);
  const [addAction, setAddAction] = reactExports.useState(false);
  const [editAction, setEditAction] = reactExports.useState(null);
  const [kpiFor, setKpiFor] = reactExports.useState(null);
  const [inviting, setInviting] = reactExports.useState(false);
  const [invitees, setInvitees] = reactExports.useState([]);
  const [tab, setTab] = reactExports.useState("kf");
  const g = data?.goal;
  const canManage = !!data?.can_manage;
  const closed = g ? ["ended_missed", "cancelled"].includes(g.status) : false;
  const singleStep = data?.actions.length === 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "k3-mobile-sheet w-full overflow-y-auto sm:max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "pr-6", children: g?.name ?? "Mục tiêu KG" }) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-6 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 inline h-4 w-4 animate-spin" }),
      "Đang tải…"
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(error) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-2", onClick: () => refetch(), children: "Thử lại" })
    ] }),
    data && g && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoalStatusBadge, { status: g.status, metric: g.metric, overdueDays: g.overdue_days }),
          g.is_key && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-primary text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-1 h-3 w-3" }),
            "Trọng tâm"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          timelineLabel(g.period_start, g.start_time),
          " → ",
          timelineLabel(g.due_date ?? g.period_end, g.due_time),
          " · Chủ trì ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: g.owner_name })
        ] }),
        g.expected_result && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Kết quả cần đạt:" }),
          " ",
          g.expected_result
        ] }),
        g.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: g.description }),
        data.kpis.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalKpiAccordion, { kpis: data.kpis, date: data.today, title: "KPI kết quả KG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 border-t border-border pt-2", children: canManage && !closed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          g.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: mutation.isPending, onClick: async () => {
            try {
              await mutation.mutateAsync({ kind: "activate", id: g.id, revision: g.revision });
              toast.success("Đã lưu công việc.");
            } catch (e) {
              toast.error(k3Error(e));
            }
          }, children: "Lưu công việc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", "aria-label": "Thao tác quản lý công việc", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "mr-1 h-4 w-4" }),
              "Thao tác"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => setEditGoal(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
                "Sửa công việc"
              ] }),
              g.creation_mode !== "basic" && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => setKpiFor({ goalId: g.id }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
                "Thêm KPI kết quả"
              ] }),
              g.creation_mode !== "basic" && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => setInviting(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
                "Mời thành viên"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(K3DeleteMenuItem, { kind: "goal", id: g.id, name: g.name, onDeleted: onClose })
            ] })
          ] })
        ] }) })
      ] }),
      data.members.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-1 inline h-3.5 w-3.5" }),
          "Thành viên tham gia"
        ] }),
        data.members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
            m.full_name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.departments.join(" · ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: m.status === "accepted" ? "default" : "secondary", children: K3_MEMBER_STATUS[m.status] }),
          canManage && (m.status === "accepted" || m.status === "invited") && !closed && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: async () => {
            try {
              await mutation.mutateAsync({ kind: "revoke", goal_id: g.id, user_id: m.user_id });
              toast.success("Đã thu hồi thành viên.");
            } catch (e) {
              toast.error(k3Error(e));
            }
          }, children: "Thu hồi" })
        ] }, m.user_id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 overflow-x-auto gap-1 border-b border-border", children: [["kf", "Hành động KF"], ["log", "Nhật ký thực thi"], ["history", "Hoạt động"]].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: tab === v ? "default" : "ghost", size: "sm", onClick: () => setTab(v), children: l }, v)) }),
      tab === "kf" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        canManage && !closed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddAction(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          "Thêm KF"
        ] }),
        data.actions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có hành động KF. Công việc cần ít nhất một KF và KPI hợp lệ." }),
        data.actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 md:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "break-words font-medium leading-snug", children: [
                a.action.is_key && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-1 inline h-3.5 w-3.5 fill-primary text-primary" }),
                a.action.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
                "Phụ trách: ",
                a.assignee_name ?? "—",
                a.collaborators.length > 0 && ` · Phối hợp: ${a.collaborators.map((c) => c.full_name).join(", ")}`,
                ` · Hạn ${timelineLabel(a.action.inherit_timeline ? g.due_date ?? g.period_end : a.action.due_date ?? g.period_end, a.action.inherit_timeline ? g.due_time : a.action.due_time)}`,
                a.action.execution_schedule?.start_time && ` · Lịch ${a.action.execution_schedule.start_time}–${a.action.execution_schedule.end_time ?? "…"}`,
                ` · ${a.task_done}/${a.task_total} việc hoàn thành`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(GoalStatusBadge, { status: a.action.status, metric: a.action.kpi_summary, overdueDays: a.overdue_days })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoalKpiAccordion, { kpis: a.kpis, date: data.today, title: "KPI hành động KF" }),
          a.member_actuals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Đóng góp: ",
            a.member_actuals.map((m) => `${m.full_name} ${m.actual}`).join(" · ")
          ] }),
          a.action.status === "ended_missed" && a.action.problem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-secondary/60 p-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Vấn đề:" }),
              " ",
              a.action.problem
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Nguyên nhân:" }),
              " ",
              a.action.cause
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Giải pháp:" }),
              " ",
              a.action.solution
            ] })
          ] }),
          !closed && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ActionButtons,
            {
              a,
              canManage,
              settings,
              hideDelete: singleStep,
              onEdit: () => setEditAction(a),
              onKpi: () => setKpiFor({ actionId: a.action.id })
            }
          )
        ] }, a.action.id))
      ] }),
      tab === "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        data.executions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có kết quả thực thi theo ngày." }),
        data.executions.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border p-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: e.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            e.work_date,
            " · ",
            e.full_name,
            " · ",
            K3_GOAL_STATUS[e.status]?.label ?? e.status,
            e.kpi_actual != null && ` · Kết quả ${e.kpi_actual}${e.kpi_unit ? ` ${e.kpi_unit}` : ""}`,
            " · Tiến độ ",
            e.progress,
            "%"
          ] }),
          e.problem && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
            "Vấn đề: ",
            e.problem,
            e.solution ? ` · Giải pháp: ${e.solution}` : ""
          ] })
        ] }, e.id))
      ] }),
      tab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        data.events.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có hoạt động." }),
        data.events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border py-1.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            K3_GOAL_EVENT[e.action] ?? e.action,
            typeof e.detail?.status === "string" ? `: ${K3_GOAL_STATUS[e.detail.status]?.label ?? e.detail.status}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            e.actor_name ?? "—",
            " · ",
            new Date(e.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
          ] })
        ] }, e.id))
      ] })
    ] }),
    editGoal && g && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalDialog, { goal: g, onClose: () => setEditGoal(false) }),
    data && g && (addAction || editAction) && /* @__PURE__ */ jsxRuntimeExports.jsx(ActionDialog, { goal: g, members: data.members, action: editAction ?? void 0, onClose: () => {
      setAddAction(false);
      setEditAction(null);
    } }),
    data && kpiFor && /* @__PURE__ */ jsxRuntimeExports.jsx(KpiDialog, { goalId: kpiFor.goalId, actionId: kpiFor.actionId, onClose: () => setKpiFor(null) }),
    inviting && g && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && setInviting(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] max-w-lg overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mời thành viên tham gia KG" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Người được mời cần Chấp nhận trước khi trở thành thành viên và được phân công KF." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MemberPicker, { selected: invitees, onChange: setInvitees, exclude: [g.owner_id, ...data?.members.filter((m) => m.status === "accepted" || m.status === "invited").map((m) => m.user_id) ?? []] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setInviting(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: mutation.isPending || invitees.length === 0, onClick: async () => {
          try {
            await mutation.mutateAsync({ kind: "invite", goal_id: g.id, user_ids: invitees.map((i) => i.id) });
            toast.success("Đã gửi lời mời.");
            setInviting(false);
            setInvitees([]);
          } catch (e) {
            toast.error(k3Error(e));
          }
        }, children: "Gửi lời mời" })
      ] })
    ] }) })
  ] }) });
}
function ActionButtons({ a, canManage, settings, hideDelete, onEdit, onKpi }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 border-t border-border pt-2", children: [
    (canManage || settings.can_use) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: onEdit, children: "Sửa" }),
    canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: onKpi, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
      "KPI"
    ] }),
    !hideDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", "aria-label": `Thao tác khác cho ${a.action.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(K3DeleteMenuItem, { kind: "action", id: a.action.id, name: a.action.name }) })
    ] })
  ] });
}
function ActionDialog({ goal, members, action, onClose }) {
  const mutation = useK3GoalMutation();
  const [key] = reactExports.useState(() => crypto.randomUUID());
  const candidates = reactExports.useMemo(() => [
    { id: goal.owner_id, full_name: goal.owner_name, departments: [] },
    ...members.filter((m) => m.status === "accepted").map((m) => ({ id: m.user_id, full_name: m.full_name, departments: m.departments }))
  ], [goal, members]);
  const [f, setF] = reactExports.useState({
    name: action?.action.name ?? "",
    start_date: action?.action.start_date ?? "",
    due_date: action?.action.due_date ?? "",
    note: action?.action.note ?? "",
    assignee_id: action?.action.assignee_id ?? goal.owner_id,
    required: action?.action.required ?? true,
    is_key: action?.action.is_key ?? false,
    start_time: action?.action.start_time?.slice(0, 5) ?? "",
    due_time: action?.action.due_time?.slice(0, 5) ?? "",
    inherit_timeline: action?.action.inherit_timeline ?? !action
  });
  const [schedule, setSchedule] = reactExports.useState(action?.action.execution_schedule ?? { mode: "daily" });
  const [collabs, setCollabs] = reactExports.useState(action?.collaborators.map((c) => ({ id: c.user_id, full_name: c.full_name, departments: [] })) ?? []);
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        kind: "action",
        payload: {
          id: action?.action.id,
          revision: action?.action.revision,
          request_key: action ? void 0 : key,
          goal_id: goal.id,
          name: f.name,
          start_date: f.start_date || null,
          due_date: f.due_date || null,
          required: f.required,
          note: f.note,
          assignee_id: f.assignee_id,
          is_key: f.is_key,
          start_time: f.start_time,
          due_time: f.due_time,
          inherit_timeline: f.inherit_timeline,
          execution_schedule: schedule,
          collaborators: collabs.map((c) => c.id)
        }
      });
      toast.success(action ? "Đã lưu hành động KF." : "Đã thêm hành động KF.");
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: action ? "Sửa hành động KF" : "Thêm hành động KF" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3a-name", children: "Tên hành động *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3a-name", value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), placeholder: "Ví dụ: Liên hệ và tư vấn 100 khách hàng" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: f.inherit_timeline, onChange: (e) => setF({ ...f, inherit_timeline: e.target.checked }) }),
        "Kế thừa thời gian KG"
      ] }),
      f.inherit_timeline ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        timelineLabel(goal.period_start, goal.start_time),
        " → ",
        timelineLabel(goal.due_date ?? goal.period_end, goal.due_time)
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KTimeline, { id: "k3a", start: f.start_date || goal.period_start, end: f.due_date || goal.due_date || goal.period_end, startTime: f.start_time, endTime: f.due_time, onChange: (field, value) => setF({ ...f, [{ start: "start_date", end: "due_date", startTime: "start_time", endTime: "due_time" }[field]]: value }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: f.required, onChange: (e) => setF({ ...f, required: e.target.checked }) }),
        "KF bắt buộc để hoàn thành KG"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KSchedule, { value: schedule, onChange: setSchedule }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phụ trách chính" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.assignee_id, onValueChange: (v) => setF({ ...f, assignee_id: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: candidates.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
            c.full_name,
            c.id === goal.owner_id ? " (chủ trì)" : ""
          ] }, c.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phối hợp (tùy chọn)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MemberPicker, { selected: collabs, onChange: setCollabs, exclude: [f.assignee_id] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3a-note", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "k3a-note", rows: 2, value: f.note, onChange: (e) => setF({ ...f, note: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: f.is_key, onChange: (e) => setF({ ...f, is_key: e.target.checked }), className: "h-4 w-4" }),
        "Đánh dấu KF trọng tâm"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: mutation.isPending || !f.name.trim(), onClick: submit, children: mutation.isPending ? "Đang lưu…" : "Lưu hành động" })
    ] })
  ] }) });
}
function KpiDialog({ goalId, actionId, onClose }) {
  const mutation = useK3GoalMutation();
  const [f, setF] = reactExports.useState(newK3KpiDraft);
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        kind: "kpi",
        payload: {
          ...k3KpiPayload(f),
          goal_id: goalId,
          action_id: actionId
        }
      });
      toast.success("Đã thêm KPI.");
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Thêm KPI ",
      actionId ? "thực thi KF" : "kết quả KG"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiConfig, { value: f, onChange: setF }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Bỏ thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", disabled: mutation.isPending || !f.name.trim(), onClick: submit, children: mutation.isPending ? "Đang lưu…" : "Lưu KPI" })
    ] })
  ] }) });
}
const manualReviewLabels = { none: "Chưa tổng kết", reviewed: "Đã tổng kết", reconfirm: "Cần tổng kết lại" };
const systemCloseLabels = { open: "Chưa chốt hệ thống", auto_closed: "Đã chốt tự động", legacy_closed: "Chốt theo cơ chế cũ", adjusted: "Có điều chỉnh sau chốt" };
function ReviewKpiDetails({ kpis, date, readOnly = false }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  if (!kpis.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "k3-review-item rounded-xl bg-muted/40 px-3", onToggle: (e) => setExpanded(e.currentTarget.open), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer min-h-11 py-3 text-sm font-medium text-primary", children: [
      "Xem / cập nhật ",
      kpis.length,
      " chỉ số KPI"
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pb-3", children: kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiResult, { kpiId: k.id, date, showStatus: false, readOnly }, k.id)) })
  ] });
}
const employeeReviewQuery = (uid, date, user) => ({ queryKey: ["k3_employee_review", uid, date, user], queryFn: async () => {
  const { data, error } = await supabase.rpc("k3_employee_review_read", { _date: date, _user: user });
  if (error) throw error;
  return data;
} });
function Biz3KDayReview({ date, today, user, onClose }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const query = useQuery({ ...employeeReviewQuery(uid, date, user), staleTime: 3e4, refetchOnWindowFocus: false, retry: 1 });
  const qc = useQueryClient();
  const [ack, setAck] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [requestKey] = reactExports.useState(() => crypto.randomUUID());
  const data = query.data;
  const groups = [...new Set(data?.actions.map((a) => a.goal_id) ?? [])].sort((a, b) => Number(data?.actions.some((x) => x.goal_id === b && !x.updated)) - Number(data?.actions.some((x) => x.goal_id === a && !x.updated)));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] max-w-3xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      date === today ? "Tổng kết hôm nay" : "Tổng kết ngày",
      " · ",
      date
    ] }) }),
    query.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải tổng kết…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(query.error) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: data.manual_status === "reconfirm" ? "destructive" : "secondary", children: data.manual_status === "reviewed" && data.summary_late ? "Đã tổng kết muộn" : manualReviewLabels[data.manual_status] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: systemCloseLabels[data.system_status] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 border-y border-border py-3", children: [["Công việc", data.action_count], ["Đã cập nhật", data.action_count - data.missing], ["Chưa cập nhật", data.missing]].map(([label, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold", children: count })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "md:hidden text-sm", children: [
        data.actions.filter((a) => a.metric?.status === "done").length,
        " công việc hoàn thành"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Chốt tự động dự kiến ",
        data.auto_close_time?.slice(0, 5),
        " · Giờ Việt Nam",
        data.confirmed_at ? ` · Xác nhận gần nhất ${new Date(data.confirmed_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}` : ""
      ] }),
      groups.map((goalId) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold max-md:hidden", children: data.actions.find((a) => a.goal_id === goalId)?.goal_name }),
        data.actions.filter((a) => a.goal_id === goalId).sort((a, b) => Number(a.updated) - Number(b.updated)).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-l-2 border-border pl-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] md:flex md:justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-medium", children: a.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                a.assignee_name ?? "—",
                " · Hạn ",
                a.due_date ?? "—"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: a.updated ? "secondary" : "outline", children: a.updated ? "Có cập nhật KPI" : "Chưa cập nhật" }),
              a.metric && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalStatusBadge, { status: a.metric.status, metric: a.metric })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewKpiDetails, { kpis: a.kpis, date, readOnly: !!user }),
          data.results.filter((r) => r.action_id === a.id && (r.problem || r.cause || r.solution)).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            r.problem && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Vấn đề: ",
              r.problem
            ] }),
            r.cause && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Nguyên nhân: ",
              r.cause
            ] }),
            r.solution && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Giải pháp: ",
              r.solution
            ] })
          ] }, r.id))
        ] }, a.id))
      ] }, goalId)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewKpiDetails, { kpis: data.goal_kpis, date, readOnly: !!user }),
      !data.action_count && !data.result_count && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có công việc theo lịch hoặc kết quả liên quan ngày này." }),
      data.missing > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-destructive", children: [
          "Còn ",
          data.missing,
          " KF chưa cập nhật; chưa có số liệu không được tính là 0."
        ] }),
        !user && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: ack, onCheckedChange: (v) => setAck(v === true) }),
          "Tôi đã xem cảnh báo còn thiếu kết quả"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium", children: [
          "Lịch sử xác nhận (",
          data.history.length,
          ")"
        ] }),
        data.legacy_confirmation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Có bản chốt theo cơ chế cũ; không coi là xác nhận theo quy trình mới." }),
        data.history.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-1 text-xs", children: [
          "Phiên bản ",
          h.revision,
          " · ",
          new Date(h.confirmed_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
          " · ",
          h.missing,
          " KF chưa cập nhật"
        ] }, h.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Đóng" }),
      !user && date <= today && data && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || data.missing > 0 && !ack, onClick: async () => {
        setBusy(true);
        try {
          const { error } = await supabase.rpc("k3_employee_review_confirm", { _date: date, _version: data.source_version, _request_key: requestKey, _ack_missing: ack });
          if (error) throw error;
          void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") && q.queryKey[0] !== "k3_preview" });
          toast.success("Đã xác nhận tổng kết; chốt hệ thống vẫn chạy riêng.");
          onClose();
        } catch (e) {
          toast.error(k3Error(e));
        } finally {
          setBusy(false);
        }
      }, children: busy ? "Đang xác nhận…" : "Xác nhận đã tổng kết" })
    ] })
  ] }) });
}
function Biz3KMeasuredPeriod({ type, date, onDateChange, manage = false }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const [search, setSearch] = reactExports.useState("");
  const [department, setDepartment] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const [disciplineOpen, setDisciplineOpen] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState([]);
  const bounds = type === "day" ? { start: date, end: date } : k3PeriodBounds(type, date);
  const query = useQuery({ queryKey: ["k3_measured_period", uid, bounds.start, bounds.end, manage], enabled: !!uid, staleTime: 45e3, refetchOnWindowFocus: false, retry: 1, queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_measured_period_read", { _start: bounds.start, _end: bounds.end, _manage: manage });
    if (error) throw error;
    return data;
  } });
  const people = query.data ?? [];
  const filtered = people.filter((p) => p.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")) && (!department || p.department === department));
  const toggleMetrics = (id) => setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-measured-date", children: "Ngày trong kỳ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-measured-date", type: "date", value: date, onChange: (e) => e.target.value && onDateChange(e.target.value), className: "w-40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        bounds.start,
        " – ",
        bounds.end
      ] }),
      manage && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhân viên", placeholder: "Tìm nhân viên…", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full md:w-48" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-xl border bg-card px-3", onToggle: (e) => setDisciplineOpen(e.currentTarget.open), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer min-h-11 py-3 text-sm font-medium", children: "Kỷ luật & lịch sử tổng kết" }),
      disciplineOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KDiscipline, { start: bounds.start, end: bounds.end, manage })
    ] }),
    query.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải kết quả…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: k3Error(query.error) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    manage && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer py-2 text-sm", children: "Bộ lọc đơn vị" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: !department ? "default" : "outline", size: "sm", onClick: () => setDepartment(""), children: "Tất cả phòng" }),
        [...new Set(people.map((p) => p.department).filter((d) => !!d))].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: department === d ? "default" : "outline", size: "sm", onClick: () => setDepartment(d), children: d }, d))
      ] })
    ] }),
    filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-2xl border bg-card p-3 md:p-4", children: [
      manage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:flex md:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "break-words font-medium", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            p.department ?? "Chưa có phòng",
            " · ",
            p.closes,
            " ngày đã chốt"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: p.updated ? "secondary" : "outline", children: p.updated ? "Đã cập nhật" : "Chưa cập nhật" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:flex", children: [
        manage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "min-h-11", variant: "outline", onClick: () => setSelected(p.user_id), children: "Xem 3K" }),
        manage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "min-h-11", variant: expanded.includes(p.user_id) ? "secondary" : "ghost", "aria-expanded": expanded.includes(p.user_id), onClick: () => toggleMetrics(p.user_id), children: expanded.includes(p.user_id) ? "Ẩn KPI" : `Xem ${p.kpis.length} KPI` })
      ] }),
      (!manage || expanded.includes(p.user_id)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        p.kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 rounded-xl border-l-2 border-primary/30 bg-muted/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words text-sm font-medium", children: k.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            k.goal_name,
            k.action_name && ` · ${k.action_name}`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm tabular-nums", children: [
            "Trong kỳ: ",
            k3MetricDisplay(k.measure, k.metric, k.target, k.unit ?? "")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Đã chốt: ",
            k3MetricDisplay(k.measure, k.official_metric, k.target, k.unit ?? "")
          ] })
        ] }, k.id)),
        !p.kpis.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có kết quả KPI trong kỳ." })
      ] })
    ] }, p.user_id)),
    !query.isLoading && !query.error && !filtered.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground", children: people.length ? "Không có nhân viên khớp bộ lọc." : "Chưa có nhân viên phù hợp phạm vi." }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KDayReview, { date, today: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date()), user: selected, onClose: () => setSelected(null) })
  ] });
}
function K3DateControl({ date, today, onChange }) {
  const input = reactExports.useRef(null);
  const shift = (amount) => {
    const value = /* @__PURE__ */ new Date(`${date}T12:00:00Z`);
    if (Number.isNaN(value.getTime())) return;
    value.setUTCDate(value.getUTCDate() + amount);
    onChange(value.toISOString().slice(0, 10));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-date-control min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-1 md:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-11 w-11 shrink-0", "aria-label": "Ngày trước", onClick: () => shift(-1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-11 w-full min-w-0", onClick: () => {
          try {
            input.current?.showPicker();
          } catch {
            input.current?.focus();
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            date === today ? "Hôm nay, " : "",
            date.slice(8, 10),
            "/",
            date.slice(5, 7)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ref: input, "aria-label": "Chọn ngày thực hiện", type: "date", value: date, onChange: (e) => e.target.value && onChange(e.target.value), className: "absolute inset-0 h-11 w-full opacity-0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-11 w-11 shrink-0", "aria-label": "Ngày sau", onClick: () => shift(1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, {}) })
    ] }),
    today && date !== today && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "mx-auto flex md:hidden", onClick: () => onChange(today), children: "Về hôm nay" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k3-desktop-date", children: "Ngày thực hiện" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "k3-desktop-date", type: "date", value: date, onChange: (e) => e.target.value && onChange(e.target.value), className: "w-40" })
      ] }),
      today && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onChange(today), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "mr-1 h-4 w-4" }),
        "Hôm nay"
      ] })
    ] })
  ] });
}
function Biz3KKpiDay({ settings, date, today, onDateChange }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const [search, setSearch] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  reactExports.useEffect(() => {
    setSearch("");
    setFilter("all");
  }, [uid, date]);
  const [reviewOpen, setReviewOpen] = reactExports.useState(false);
  const [creating, setCreating] = reactExports.useState(false);
  const [detail, setDetail] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState(null);
  const [disciplineOpen, setDisciplineOpen] = reactExports.useState(false);
  const [choosing, setChoosing] = reactExports.useState(null);
  const review = useQuery({ ...employeeReviewQuery(uid, date), enabled: !!uid, staleTime: 45e3, refetchOnWindowFocus: false, retry: 1 });
  const query = useQuery({ queryKey: ["k3_kpi_day", uid, date], staleTime: 3e4, refetchInterval: 9e4, refetchOnWindowFocus: false, retry: 1, enabled: !!uid, queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_kpi_day_read", { _date: date });
    if (error) throw error;
    return data;
  } });
  const actions = query.data?.actions.filter((a) => a.metric.status !== "cancelled") ?? [];
  const visibleActions = actions.filter((a) => (filter === "all" || (filter === "done" ? a.metric.status === "done" : a.metric.status !== "done")) && a.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
  const completed = actions.filter((a) => a.metric.status === "done").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-daily-workspace space-y-4 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(K3DateControl, { date, today, onChange: onDateChange }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-day-summary md:hidden rounded-2xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: date === today ? "Công việc hôm nay" : "Công việc trong ngày" })
        ] }),
        query.data && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-day-counts mt-4 grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: actions.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tổng công việc" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: completed }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hoàn thành" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: actions.filter((a) => a.metric.status === "in_progress").length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Đang thực hiện" })
            ] })
          ] }),
          review.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs leading-5", children: [
            review.data.action_count - review.data.missing,
            "/",
            review.data.action_count,
            " đã cập nhật kết quả · ",
            manualReviewLabels[review.data.manual_status]
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "max-md:min-h-11", disabled: !settings.enabled, onClick: () => setCreating(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4 shrink-0" }),
          "Tạo công việc"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", className: "max-md:min-h-11", disabled: date > today || !settings.enabled, onClick: () => setReviewOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1 h-4 w-4 shrink-0" }),
          date === today ? "Tổng kết hôm nay" : "Xem tổng kết ngày"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: date === today ? "Công việc hôm nay" : "Công việc trong ngày" }),
      review.data && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: review.data.manual_status === "reconfirm" ? "destructive" : "secondary", children: manualReviewLabels[review.data.manual_status] })
    ] }),
    creating && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KQuickCreate, { variant: "personal", defaultDate: today, onClose: () => setCreating(false) }),
    detail && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalDetailSheet, { id: detail, settings, onClose: () => setDetail(null) }),
    reviewOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KDayReview, { date, today, onClose: () => setReviewOpen(false) }),
    query.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", role: "status", "aria-label": "Đang tải danh sách công việc", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 animate-pulse rounded-2xl bg-muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 animate-pulse rounded-2xl bg-muted" })
    ] }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-destructive", children: [
      k3Error(query.error),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    query.data && actions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-day-filter rounded-2xl border bg-card p-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm công việc trong ngày", placeholder: "Tìm công việc trong ngày…", value: search, onChange: (e) => setSearch(e.target.value), className: "h-11 rounded-xl pl-10 text-base" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1 rounded-xl bg-muted p-1", "aria-label": "Lọc công việc trong ngày", children: [["all", "Tất cả"], ["open", "Chưa xong"], ["done", "Hoàn thành"]].map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: filter === value ? "secondary" : "ghost", "aria-pressed": filter === value, className: "min-h-11 min-w-0 px-1 text-xs rounded-lg", onClick: () => setFilter(value), children: label }, value)) }),
      (search || filter !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Hiển thị ",
        visibleActions.length,
        "/",
        actions.length,
        " công việc ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ml-2 min-h-11 text-primary underline", onClick: () => {
          setSearch("");
          setFilter("all");
        }, children: "Đặt lại" })
      ] })
    ] }),
    query.data && actions.length > 0 && visibleActions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Không có công việc phù hợp. Hãy thử từ khóa hoặc bộ lọc khác." }),
    visibleActions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-work-card space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-medium", children: a.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Hạn ",
            a.due_date ?? "—",
            a.due_time ? ` · ${a.due_time.slice(0, 5)}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-md:col-start-1 max-md:row-start-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoalStatusBadge, { status: a.metric.status, metric: a.metric }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "shrink-0 max-md:h-11 max-md:w-11 max-md:col-start-2 max-md:row-start-1", "aria-label": `Thao tác khác cho ${a.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
            a.goal_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => setDetail(a.goal_id ?? null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 h-4 w-4" }),
              "Sửa công việc / Xem chi tiết"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => setHistory(a), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "mr-2 h-4 w-4" }),
              "Lịch sử kết quả"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(K3DeleteMenuItem, { kind: a.delete_kind === "goal" && a.goal_id ? "goal" : "action", id: a.delete_kind === "goal" && a.goal_id ? a.goal_id : a.id, name: a.name })
          ] })
        ] })
      ] }),
      a.kpis.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-foreground", children: [
            a.metric.kpi_met,
            "/",
            a.metric.kpi_total,
            " KPI đạt"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Chạm để xem và ghi nhận KPI" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "min-h-11 shrink-0 rounded-xl border-primary/30 text-primary hover:bg-primary/10", onClick: () => setChoosing(a), children: "Cập nhật kết quả" })
      ] }),
      !a.kpis.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có chỉ số đo kết quả." })
    ] }, a.id)),
    query.data && !query.data.actions.filter((a) => a.metric.status !== "cancelled").length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground", children: "Chưa có công việc trong ngày này. Bấm “Tạo công việc” để bắt đầu." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-xl border bg-card px-3", onToggle: (e) => setDisciplineOpen(e.currentTarget.open), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer min-h-11 py-3 text-sm font-medium", children: "Kỷ luật ngày của tôi" }),
      disciplineOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KDiscipline, { start: date, end: date })
    ] }),
    choosing && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && setChoosing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Ghi nhận kết quả · ",
        choosing.name
      ] }) }),
      choosing.kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiResult, { kpiId: k.id, date, compact: true, showStatus: false }, k.id))
    ] }) }),
    history && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && setHistory(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "k3-mobile-dialog max-h-[90dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Lịch sử · ",
        history.name
      ] }) }),
      history.kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiResult, { kpiId: k.id, date, historyOnly: true }, k.id))
    ] }) })
  ] });
}
function Biz3KArchive({ admin }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const qc = useQueryClient();
  const [mode, setMode] = reactExports.useState("trash");
  const [busy, setBusy] = reactExports.useState(false);
  const [archiveId, setArchiveId] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const trash = useQuery({ queryKey: ["k3_trash", uid], queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_trash_list", { _kind: "all" });
    if (error) throw error;
    return data;
  } });
  const inventory = useQuery({ queryKey: ["k3_inventory", uid], enabled: admin, queryFn: async () => {
    const { data, error } = await supabase.rpc("k3_kpi_inventory");
    if (error) throw error;
    return data;
  } });
  const reviews = useQuery({ queryKey: ["k3_reviews", uid], enabled: admin, queryFn: async () => {
    const { data, error } = await supabase.from("k3_data_reviews").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: mode === "trash" ? "default" : "outline", onClick: () => setMode("trash"), children: "Thùng rác 15 ngày" }),
      admin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: mode === "review" ? "default" : "outline", onClick: () => setMode("review"), children: "Dữ liệu cần rà soát" })
    ] }),
    mode === "trash" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      trash.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(trash.error) }),
      !trash.data?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Thùng rác đang trống." }),
      trash.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 border-b border-border py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-medium", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            r.owner_name,
            " · Xóa ",
            new Date(r.deleted_at).toLocaleString("vi-VN"),
            " · Hết hạn ",
            new Date(r.purge_at).toLocaleString("vi-VN")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: !r.restorable || busy, onClick: async () => {
          setBusy(true);
          try {
            const { error } = await supabase.rpc("k3_restore", { _kind: r.kind, _id: r.id });
            if (error) throw error;
            await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
            toast.success("Đã khôi phục.");
          } catch (e) {
            toast.error(k3Error(e));
          } finally {
            setBusy(false);
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-4 w-4" }),
          "Khôi phục"
        ] })
      ] }, r.id))
    ] }),
    mode === "review" && admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      inventory.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(inventory.error) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(inventory.data?.counts ?? {}).map(([k, n]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        { goals: "KG", actions: "KF", kpis: "KPI", tasks: "Công việc cũ", days: "Ngày", summary_versions: "Phiên bản tổng kết" }[k] ?? k,
        ": ",
        n
      ] }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Bản sao kiểm đếm: ",
        inventory.data?.backup_verified ? "Đã có" : "Chưa xác minh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: busy, onClick: async () => {
        setBusy(true);
        try {
          const { error } = await supabase.rpc("k3_kpi_backup_create");
          if (error) throw error;
          await inventory.refetch();
          toast.success("Đã lưu bản sao riêng tư và đối chiếu số lượng.");
        } catch (e) {
          toast.error(k3Error(e));
        } finally {
          setBusy(false);
        }
      }, children: "Tạo bản sao kiểm đếm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Dữ liệu chờ rà soát không tự xóa; chỉ Thùng rác đã xác nhận xóa có thời hạn 15 ngày." }),
      inventory.data?.tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
          t.name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t.classification })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          t.owner_name,
          " · ",
          t.work_date,
          " · ",
          t.has_official ? "Có chốt sổ lịch sử" : "Chưa chốt"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: t.reason }),
        !t.has_official && t.classification === "C" && !reviews.data?.some((r) => r.record_id === t.id && r.status === "pending") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: busy || !inventory.data?.backup_verified, onClick: () => {
          setArchiveId(t.id);
          setReason("");
        }, children: "Lưu trữ chờ rà soát" })
      ] }, t.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
        "Đang chờ rà soát: ",
        reviews.data?.filter((r) => r.status === "pending").length ?? 0
      ] }),
      reviews.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: k3Error(reviews.error) }),
      reviews.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          r.kind,
          " · ",
          r.reason,
          " · ",
          r.status
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Không tự xóa khi chờ rà soát" }),
        r.archived_at && r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: busy, onClick: async () => {
          setBusy(true);
          try {
            const { error } = await supabase.rpc("k3_legacy_task_restore", { _review: r.id });
            if (error) throw error;
            await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
            toast.success("Đã khôi phục nguyên bản.");
          } catch (e) {
            toast.error(k3Error(e));
          } finally {
            setBusy(false);
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-4 w-4" }),
          "Khôi phục"
        ] })
      ] }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!archiveId, onOpenChange: (v) => !v && setArchiveId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận lưu trữ công việc cũ" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Công việc được lưu chờ rà soát không thời hạn; bản sao riêng tư và lịch sử đã chốt được giữ nguyên." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Lý do lưu trữ", value: reason, onChange: (e) => setReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setArchiveId(null), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !reason.trim(), onClick: async () => {
          if (!archiveId) return;
          setBusy(true);
          try {
            const { error } = await supabase.rpc("k3_legacy_task_archive", { _id: archiveId, _reason: reason });
            if (error) throw error;
            setArchiveId(null);
            await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("k3_") });
            toast.success("Đã lưu trữ với bản sao được đối chiếu.");
          } catch (e) {
            toast.error(k3Error(e));
          } finally {
            setBusy(false);
          }
        }, children: "Xác nhận lưu trữ" })
      ] })
    ] }) })
  ] });
}
const MODE_LABEL = { day: "Ngày", week: "Tuần", month: "Tháng", quarter: "Quý", all: "Tất cả" };
function Biz3K({ personalOnly = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(K3DeleteProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KScreen, { personalOnly }) });
}
function Biz3KScreen({ personalOnly }) {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const { data: settings, isLoading, error, refetch } = useQuery({ ...k3SettingsQuery(uid), enabled: !!uid });
  const [section, setSection] = reactExports.useState("mine");
  const [mode, setMode] = reactExports.useState("day");
  const [date, setDate] = reactExports.useState(null);
  const [legacyDayOpen, setLegacyDayOpen] = reactExports.useState(false);
  const chooseSection = (next) => {
    if (next === "monitor" && mode === "all") setMode("day");
    if (next !== "mine") setLegacyDayOpen(false);
    setSection(next);
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Đang tải cấu hình 3K…" });
  if (error || !settings) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Không tải được cấu hình 3K." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => refetch(), children: "Thử lại" })
    ] });
  }
  const tabs = [
    { key: "mine", label: "3K Của Tôi", mobileLabel: "Của tôi", icon: ListChecks, show: settings.can_use },
    { key: "collab", label: "3K phối hợp", mobileLabel: "Phối hợp", icon: Users, show: !personalOnly && settings.can_use },
    { key: "monitor", label: "Theo Dõi Nhân Viên", mobileLabel: "Nhân viên", icon: ClipboardList, show: !personalOnly && settings.can_view_scope }
  ];
  const visible = tabs.filter((t) => t.show);
  if (!settings.can_use && !settings.can_view_scope && !settings.can_settings) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-destructive", children: "Bạn không có quyền sử dụng 3K." });
  const active = section === "archive" ? "archive" : section === "settings" ? settings.can_settings ? "settings" : visible[0]?.key ?? "mine" : visible.some((t) => t.key === section) ? section : visible[0]?.key ?? "mine";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "k3-mobile space-y-4 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "k3-mobile-navigation md:hidden rounded-2xl border bg-card p-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Không gian 3K" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Lập việc · Cập nhật · Tổng kết" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "h-11 w-11 shrink-0 rounded-xl", "aria-label": "Thao tác phụ 3K", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, {}) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => chooseSection("archive"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, {}),
              "Thùng lưu trữ"
            ] }),
            !personalOnly && settings.can_settings && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onSelect: () => chooseSection("settings"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, {}),
              "Cài đặt 3K"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "k3-section-tabs grid gap-1.5", style: { gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }, "aria-label": "Khu vực 3K", children: visible.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: active === t.key ? "default" : "outline", className: cn("min-h-12 min-w-0 flex-col gap-1 rounded-xl px-1.5 py-2 text-[11px] leading-tight", active !== t.key && (t.key === "collab" ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : t.key === "monitor" ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200" : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200")), "aria-label": t.label, "aria-pressed": active === t.key, onClick: () => chooseSection(t.key), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.mobileLabel })
      ] }, t.key)) }),
      (active === "archive" || active === "settings") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: active === "archive" ? "Thùng lưu trữ" : "Cài đặt 3K" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:flex-1", children: visible.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          type: "button",
          onClick: () => chooseSection(t.key),
          className: cn(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === t.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-4 w-4" }),
            t.label
          ]
        },
        t.key
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => chooseSection("archive"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "mr-1 h-4 w-4" }),
        "Thùng lưu trữ"
      ] }),
      !personalOnly && settings.can_settings && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          type: "button",
          onClick: () => chooseSection("settings"),
          className: cn(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === "settings" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4" }),
            "Cài đặt 3K"
          ]
        }
      )
    ] }),
    !settings.enabled && active === "mine" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground", children: [
      "Module 3K chưa được kích hoạt",
      settings.effective_from ? ` (áp dụng từ ${settings.effective_from})` : "",
      ". Vui lòng liên hệ quản trị viên."
    ] }),
    active === "mine" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "k3-period-tabs flex min-w-0 gap-1 overflow-x-auto border-b border-border pb-2", children: ["day", "week", "month", "quarter", "all"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: mode === v ? "default" : "ghost", size: "sm", className: "shrink-0 whitespace-nowrap max-md:min-h-11", "aria-pressed": mode === v, onClick: () => {
        if (v !== "day") setLegacyDayOpen(false);
        setMode(v);
      }, children: MODE_LABEL[v] }, v)) }),
      mode === "day" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KKpiDay, { settings, date: date ?? settings.today, today: settings.today, onDateChange: setDate }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t border-border pt-2", onToggle: (e) => setLegacyDayOpen(e.currentTarget.open), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-sm text-muted-foreground", children: "Dữ liệu công việc cũ (chỉ xem khi cần)" }),
          legacyDayOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KMyDay, { settings: { ...settings, enabled: false }, selectedDate: date ?? settings.today, onDateChange: setDate }) })
        ] })
      ] }),
      (mode === "week" || mode === "month" || mode === "quarter") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KGoals, { settings, variant: "personal", compact: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KMeasuredPeriod, { type: mode, date: date ?? settings.today, onDateChange: setDate })
      ] }),
      mode === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KGoals, { settings, variant: "personal" })
    ] }) }),
    !personalOnly && active === "collab" && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KGoals, { settings, variant: "collab" }),
    !personalOnly && active === "monitor" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "k3-period-tabs flex gap-1 overflow-x-auto border-b border-border pb-3", children: ["day", "week", "month", "quarter"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: mode === v ? "default" : "ghost", size: "sm", className: "whitespace-nowrap", "aria-pressed": mode === v, onClick: () => {
        if (v !== "day") setLegacyDayOpen(false);
        setMode(v);
      }, children: MODE_LABEL[v] }, v)) }),
      (mode === "day" || mode === "week" || mode === "month" || mode === "quarter") && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KMeasuredPeriod, { type: mode, date: date ?? settings.today, onDateChange: setDate, manage: true })
    ] }),
    !personalOnly && active === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KSettings, { settings }),
    active === "archive" && /* @__PURE__ */ jsxRuntimeExports.jsx(Biz3KArchive, { admin: !personalOnly && settings.can_settings })
  ] });
}
export {
  Biz3K as B
};
