import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { a as useQuery, q as queryOptions, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, B as Button, I as Input, l as Badge, N as Checkbox, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, bt as Popover, bu as PopoverTrigger, bv as PopoverContent, F as useAuth, L as Label } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { C as Command, a as CommandInput, b as CommandList, c as CommandEmpty, d as CommandGroup, e as CommandItem } from "./command-DR-zJx0h.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-CW0Q8d6x.mjs";
import { C as ChartContainer, a as ChartTooltip, b as ChartTooltipContent } from "./chart-Bcr-THvk.mjs";
import "../_libs/seroval.mjs";
import { I as CalendarDays, f as Search, g as SlidersHorizontal, a6 as Plus, bd as Phone, w as Users, al as Database, r as Eye, X, ao as Pencil, af as Download, bp as ChevronsUpDown, q as Check, ap as Trash2, ag as ExternalLink, bq as ArrowRightLeft, aQ as Archive, br as CalendarPlus, bs as FileUp, j as ArrowUp, k as ArrowDown } from "../_libs/lucide-react.mjs";
import { B as BarChart, c as CartesianGrid, X as XAxis, Y as YAxis, b as Bar, d as LineChart, e as Line, P as PieChart, a as Pie, C as Cell } from "../_libs/recharts.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/cmdk.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
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
async function crmRpc(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
}
const catalogsQuery = (uid) => queryOptions({
  queryKey: ["crm_catalogs", uid],
  staleTime: 5 * 6e4,
  queryFn: async () => {
    const { data, error } = await supabase.from("crm_catalogs").select("*").order("sort_order").order("name");
    if (error) throw error;
    return data;
  }
});
const crmReadQuery = (uid, mine = true, owner = "", search = "", archived = false, group = "", segment = "", priority = "", filters = []) => queryOptions({
  queryKey: ["crm_read", uid, mine, owner, search, archived, group, segment, priority, filters],
  queryFn: () => crmRpc("crm_read_dynamic", {
    _group: group || null,
    _segment: segment || null,
    _priority: priority || null,
    _filters: filters.filter((f) => f.id),
    _mine: mine,
    _owner: owner || null,
    _search: search,
    _archived: archived
  }),
  staleTime: 6e4,
  refetchInterval: 12e4,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: true
});
const crmDetailQuery = (uid, id) => queryOptions({
  queryKey: ["crm_detail", uid, id],
  queryFn: () => crmRpc("crm_detail", { _id: id }),
  staleTime: 3e4,
  enabled: !!id
});
const crmPeopleQuery = (uid) => queryOptions({ queryKey: ["crm_people", uid], staleTime: 5 * 6e4, queryFn: () => crmRpc("crm_people") });
const crmTemplatesQuery = (uid) => queryOptions({
  queryKey: ["crm_templates", uid],
  staleTime: 5 * 6e4,
  queryFn: async () => {
    const { data, error } = await supabase.from("crm_templates").select("*").order("name");
    if (error) throw error;
    return data;
  }
});
const crmReportQuery = (uid, start, end, mine, filters, dynamic = []) => queryOptions({
  queryKey: ["crm_report", uid, start, end, mine, filters, dynamic],
  staleTime: 6e4,
  queryFn: () => crmRpc("crm_report_dynamic", {
    _filters: dynamic.filter((f) => f.id),
    _start: start,
    _end: end,
    _mine: mine,
    _owner: filters.owner || null,
    _group: filters.group || null,
    _province: filters.province || null,
    _department: filters.department || null,
    _system: filters.system || null,
    _team: filters.team || null,
    _segment: filters.segment || null,
    _priority: filters.priority || null,
    _relationship: filters.relationship || null
  })
});
function useCrmMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => crmRpc(fn, { _data: data }),
    onSuccess: async () => {
      await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("crm_") });
      if (fn === "crm_access_save") await useAuth.getState().refreshBizAccess(true);
    }
  });
}
const vnDay = (iso = Date.now()) => new Date(new Date(iso).getTime() + 7 * 36e5).toISOString().slice(0, 10);
const formatDate = (iso) => new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  dateStyle: "short",
  timeStyle: "short"
}).format(new Date(iso));
function ratio(n, d) {
  return d === 0 ? null : n / d * 100;
}
function formatRatio(v) {
  return v === null ? "Chưa có dữ liệu" : `${v.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}
function scheduleStatus(s, now) {
  return s.status === "paused" ? "Tạm ngừng" : s.status === "processed" ? "Đã xử lý" : Date.parse(s.due_at) < Date.parse(now) ? "Quá hạn" : "Đến lịch";
}
function descendant(id, root, catalogs) {
  const seen = /* @__PURE__ */ new Set();
  let current = id;
  while (current && !seen.has(current)) {
    if (current === root) return true;
    seen.add(current);
    current = catalogs.find((c) => c.id === current)?.parent_id ?? null;
  }
  return false;
}
function reportRatios(t) {
  return {
    processed: ratio(t.processed, t.due),
    on_time: ratio(t.on_time, t.due),
    connected: ratio(t.connected, t.attempts),
    scheduled: ratio(t.scheduled_customers, t.customers),
    priority_overdue: ratio(t.priority_overdue, t.priority_customers)
  };
}
function customerSubset(data, kind, catalogs) {
  const schedules = data.schedules;
  return data.customers.filter((c) => {
    const own = schedules.filter((s) => s.customer_id === c.id);
    const pending = own.filter((s) => s.status === "pending");
    if (kind === "scheduled") return pending.length > 0;
    if (kind === "unscheduled") return pending.length === 0;
    if (kind === "overdue") return pending.some((s) => Date.parse(s.original_due_at) < Date.parse(data.as_of));
    if (kind === "on-time") return own.some((s) => Date.parse(s.original_due_at) >= Date.parse(`${data.start}T00:00:00+07:00`) && Date.parse(s.original_due_at) < Date.parse(data.as_of) && s.completed_at && Date.parse(s.completed_at) <= Date.parse(s.original_due_at));
    if (kind === "untouched" || kind === "priority-untouched") return !data.interactions.some((i) => i.customer_id === c.id && i.completed) && (kind === "untouched" || catalogs.some((x) => x.id === c.priority_id && x.config.key_customer === true));
    if (kind === "long-untouched") return !!c.last_care_at && Date.parse(data.as_of) - Date.parse(c.last_care_at) > 30 * 864e5;
    if (kind === "priority")
      return catalogs.some((x) => x.id === c.priority_id && x.config.key_customer === true);
    return true;
  });
}
function periodRange(kind, date) {
  const d = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
  let start = new Date(d), end = new Date(d);
  if (kind === "week") {
    start.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
    end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
  }
  if (kind === "month") {
    start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  }
  if (kind === "quarter") {
    const m = Math.floor(d.getUTCMonth() / 3) * 3;
    start = new Date(Date.UTC(d.getUTCFullYear(), m, 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), m + 3, 0));
  }
  if (kind === "year") {
    start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), 11, 31));
  }
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
function previousRange(start, end) {
  const days = (Date.parse(end) - Date.parse(start)) / 864e5 + 1;
  return [
    new Date(Date.parse(start) - days * 864e5).toISOString().slice(0, 10),
    new Date(Date.parse(start) - 864e5).toISOString().slice(0, 10)
  ];
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "grid min-w-0 gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label }),
    children
  ] });
}
function Pick({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "none", onValueChange: (v) => onChange(v === "none" ? "" : v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", "aria-label": label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: label }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: label }),
      options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id, children: o.name }, o.id))
    ] })
  ] });
}
function SearchPick({
  label,
  value,
  onChange,
  options
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        variant: "outline",
        role: "combobox",
        "aria-label": label,
        "aria-expanded": open,
        className: "w-full justify-between font-normal",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: options.find((o) => o.code === value)?.name || label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "h-4 w-4 shrink-0" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContent,
      {
        className: "w-[var(--radix-popover-trigger-width)] p-0",
        onCloseAutoFocus: (e) => e.preventDefault(),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: `Tìm ${label.toLowerCase()}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Không tìm thấy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandGroup, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CommandItem,
                {
                  onSelect: () => {
                    onChange("");
                    setOpen(false);
                  },
                  children: "Không chọn"
                }
              ),
              options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                CommandItem,
                {
                  value: `${o.name} ${o.code}`,
                  onSelect: () => {
                    onChange(o.code);
                    setOpen(false);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 whitespace-normal break-words", children: o.name }),
                    o.code === value && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "ml-auto h-4 w-4" })
                  ]
                },
                o.code
              ))
            ] })
          ] })
        ] })
      }
    )
  ] });
}
function MultiCatalog({
  label,
  items,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium", children: [
      label,
      value.length > 0 ? ` (${value.length})` : ""
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 pt-3", children: items.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex min-h-9 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          checked: value.includes(c.id),
          onCheckedChange: (yes) => onChange(yes ? [...value, c.id] : value.filter((x) => x !== c.id))
        }
      ),
      c.name
    ] }, c.id)) })
  ] });
}
const FIELD_TYPES = {
  text: "Văn bản ngắn",
  textarea: "Văn bản dài",
  number: "Số",
  money: "Số tiền",
  date: "Ngày",
  boolean: "Có/Không",
  select: "Chọn một",
  multiselect: "Chọn nhiều",
  url: "Đường dẫn URL"
};
function fieldOptions(c) {
  return Array.isArray(c.config.options) ? c.config.options.filter(
    (x) => !!x && typeof x === "object" && "id" in x && "name" in x
  ).map((x) => ({ ...x, active: x.active !== false })) : [];
}
function scopeMatches(c, group, segment = "", catalogs = []) {
  if (!group) return false;
  const mode = c.config.scope_mode;
  if (mode === "shared") return true;
  if (mode === "segments")
    return Array.isArray(c.config.segment_ids) && c.config.segment_ids.some(
      (id) => typeof id === "string" && !!segment && (id === segment || descendant(segment, id, catalogs))
    );
  if (mode === "groups" || !mode)
    return Array.isArray(c.config.group_ids) && c.config.group_ids.includes(group);
  return false;
}
function applicableFields(catalogs, group, segment = "") {
  return catalogs.filter(
    (c) => c.kind === "custom_field" && c.active && scopeMatches(c, group, segment, catalogs)
  );
}
function displayValue(c, v) {
  if (v === void 0 || v === null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Có" : "Không";
  if (typeof v === "number")
    return v.toLocaleString("vi-VN") + (c.config.field_type === "money" ? " ₫" : "");
  if (Array.isArray(v))
    return v.map((id) => fieldOptions(c).find((o) => o.id === id)?.name || id).join(", ");
  if (c.config.field_type === "select") return fieldOptions(c).find((o) => o.id === v)?.name || v;
  return v;
}
function dynamicAnalysis(customers, c, catalogs, range = {}) {
  const unique = [...new Map(customers.map((x) => [x.id, x])).values()].filter(
    (x) => scopeMatches(c, x.group_id || "", x.segment_id || "", catalogs)
  );
  const valOf = (x) => c.kind === "custom_field" ? x.custom_values?.[c.id] : x.related_ids?.includes(c.id) ? true : void 0;
  const filled = unique.filter((x) => {
    const v = valOf(x);
    if (v === void 0 || v === null || v === "" || Array.isArray(v) && !v.length) return false;
    if (["number", "money", "date"].includes(String(c.config.field_type))) {
      const val = typeof v === "number" ? v : Date.parse(String(v));
      const lo = range.min ? typeof v === "number" ? Number(range.min) : Date.parse(range.min) : null, hi = range.max ? typeof v === "number" ? Number(range.max) : Date.parse(range.max) : null;
      return (lo === null || val >= lo) && (hi === null || val <= hi);
    }
    return true;
  });
  const counts = /* @__PURE__ */ new Map();
  for (const x of filled) {
    const v = valOf(x);
    for (const item of Array.isArray(v) ? [...new Set(v)] : [v]) {
      const key = String(item);
      const old = counts.get(key) || { name: displayValue(c, item), ids: [] };
      old.ids.push(x.id);
      counts.set(key, old);
    }
  }
  const nums = filled.flatMap(
    (x) => typeof x.custom_values?.[c.id] === "number" ? [x.custom_values[c.id]] : []
  );
  return {
    total: unique.length,
    filled: filled.length,
    selections: [...counts.values()].reduce((n, x) => n + x.ids.length, 0),
    sum: nums.length ? nums.reduce((n, x) => n + x, 0) : null,
    average: nums.length ? nums.reduce((n, x) => n + x, 0) / nums.length : null,
    rows: [...counts].map(([id, x]) => ({
      id,
      ...x,
      count: x.ids.length,
      share: unique.length ? x.ids.length / unique.length * 100 : null
    }))
  };
}
const FEATURE_KINDS = { channel: "Kênh bán hàng", cooperation: "Hình thức hợp tác", output: "Khách đầu ra", product: "Dòng sản phẩm", trait: "Đặc điểm kinh doanh", need: "Nhu cầu mua hàng", occasion: "Dịp mua hàng" };
function featureInGroup(c, group, segment = "", catalogs = []) {
  return scopeMatches(c, group, segment, catalogs);
}
function segmentOptions(catalogs, group, selected = "", activeOnly = false) {
  return catalogs.filter((c) => c.kind === "segment" && !!group && descendant(c.id, group, catalogs) && (!activeOnly || c.active || c.id === selected));
}
function structureRows(data, catalogs, group) {
  const customers = [...new Map(data.customers.map((c) => [c.id, c])).values()];
  const ids = /* @__PURE__ */ new Set([...segmentOptions(catalogs, group).map((c) => c.id), ...customers.map((c) => c.segment_id || "none")]);
  if (!group) for (const c of catalogs.filter((c2) => c2.kind === "segment")) ids.add(c.id);
  ids.add("none");
  return [...ids].map((id) => {
    const own = customers.filter((c) => (c.segment_id || "none") === id);
    const schedules = data.schedules.filter((s) => own.some((c) => c.id === s.customer_id));
    const due = schedules.filter((s) => Date.parse(s.original_due_at) >= Date.parse(`${data.start}T00:00:00+07:00`) && Date.parse(s.original_due_at) < Date.parse(data.as_of));
    const scheduled = own.filter((c) => schedules.some((s) => s.customer_id === c.id && s.status === "pending")).length;
    const overdue = own.filter((c) => schedules.some((s) => s.customer_id === c.id && s.status === "pending" && Date.parse(s.original_due_at) < Date.parse(data.as_of))).length;
    const untouched = own.filter((c) => !data.interactions.some((i) => i.customer_id === c.id && i.completed));
    const longUntouched = own.filter((c) => c.last_care_at && Date.parse(data.as_of) - Date.parse(c.last_care_at) > 30 * 864e5);
    const priority = (c) => catalogs.some((x) => x.id === c.priority_id && x.config.key_customer === true);
    return { id, name: id === "none" ? "Chưa phân loại tệp" : catalogs.find((c) => c.id === id)?.name || "Danh mục cũ", count: own.length, share: ratio(own.length, customers.length), new: own.filter((c) => Date.parse(c.created_at) >= Date.parse(`${data.start}T00:00:00+07:00`)).length, priority: own.filter(priority).length, scheduled, unscheduled: own.length - scheduled, overdue, onTime: ratio(due.filter((s) => s.completed_at && Date.parse(s.completed_at) <= Date.parse(s.original_due_at)).length, due.length), untouched: untouched.length, longUntouched: longUntouched.length, priorityUntouched: untouched.filter(priority).length };
  });
}
function newCustomerTrend(data, unit) {
  const lo = Date.parse(`${data.start}T00:00:00+07:00`), hi = Date.parse(data.as_of);
  const grouped = /* @__PURE__ */ new Map();
  for (const c of new Map(data.customers.map((c2) => [c2.id, c2])).values()) {
    const at = Date.parse(c.created_at);
    if (at < lo || at >= hi) continue;
    const d = new Date(at + 7 * 36e5), y = d.getUTCFullYear(), m = d.getUTCMonth();
    const key = unit === "year" ? String(y) : unit === "quarter" ? `${y} Q${Math.floor(m / 3) + 1}` : `${y}-${String(m + 1).padStart(2, "0")}`;
    grouped.set(key, (grouped.get(key) || 0) + 1);
  }
  return [...grouped].sort(([a], [b]) => a.localeCompare(b)).map(([period, count]) => ({ period, count }));
}
const CHANNELS = {
  phone: "Gọi điện",
  zalo: "Zalo / Nhắn tin",
  meeting: "Gặp trực tiếp",
  email: "Email",
  other: "Khác"
};
const KINDS = {
  group: "Nhóm / Mảng",
  block: "Khối khách",
  segment: "Tệp khách",
  trait: "Đặc điểm",
  product: "Sản phẩm",
  need: "Nhu cầu",
  priority: "Ưu tiên",
  relationship: "Tình trạng hợp tác",
  source: "Nguồn khách",
  goal: "Mục tiêu chăm sóc",
  outcome: "Kết quả chăm sóc",
  contact_role: "Vai trò liên hệ",
  channel: "Kênh bán hàng",
  cooperation: "Hình thức hợp tác",
  output: "Khách đầu ra",
  occasion: "Dịp mua hàng"
};
const provinces = [{ "code": "92", "name": "Thành phố Cần Thơ" }, { "code": "48", "name": "Thành phố Đà Nẵng" }, { "code": "31", "name": "Thành phố Hải Phòng" }, { "code": "79", "name": "Thành phố Hồ Chí Minh" }, { "code": "46", "name": "Thành phố Huế" }, { "code": "01", "name": "Thành phố Hà Nội" }, { "code": "91", "name": "Tỉnh An Giang" }, { "code": "24", "name": "Tỉnh Bắc Ninh" }, { "code": "96", "name": "Tỉnh Cà Mau" }, { "code": "04", "name": "Tỉnh Cao Bằng" }, { "code": "66", "name": "Tỉnh Đắk Lắk" }, { "code": "11", "name": "Tỉnh Điện Biên" }, { "code": "75", "name": "Tỉnh Đồng Nai" }, { "code": "82", "name": "Tỉnh Đồng Tháp" }, { "code": "52", "name": "Tỉnh Gia Lai" }, { "code": "42", "name": "Tỉnh Hà Tĩnh" }, { "code": "33", "name": "Tỉnh Hưng Yên" }, { "code": "56", "name": "Tỉnh Khánh Hòa" }, { "code": "12", "name": "Tỉnh Lai Châu" }, { "code": "68", "name": "Tỉnh Lâm Đồng" }, { "code": "20", "name": "Tỉnh Lạng Sơn" }, { "code": "15", "name": "Tỉnh Lào Cai" }, { "code": "40", "name": "Tỉnh Nghệ An" }, { "code": "37", "name": "Tỉnh Ninh Bình" }, { "code": "25", "name": "Tỉnh Phú Thọ" }, { "code": "51", "name": "Tỉnh Quảng Ngãi" }, { "code": "22", "name": "Tỉnh Quảng Ninh" }, { "code": "44", "name": "Tỉnh Quảng Trị" }, { "code": "14", "name": "Tỉnh Sơn La" }, { "code": "80", "name": "Tỉnh Tây Ninh" }, { "code": "19", "name": "Tỉnh Thái Nguyên" }, { "code": "38", "name": "Tỉnh Thanh Hóa" }, { "code": "08", "name": "Tỉnh Tuyên Quang" }, { "code": "86", "name": "Tỉnh Vĩnh Long" }];
const wards = /* @__PURE__ */ JSON.parse(`[{"code":"00004","name":"Phường Ba Đình","province_code":"01"},{"code":"00292","name":"Phường Bạch Mai","province_code":"01"},{"code":"00118","name":"Phường Bồ Đề","province_code":"01"},{"code":"00166","name":"Phường Cầu Giấy","province_code":"01"},{"code":"10015","name":"Phường Chương Mỹ","province_code":"01"},{"code":"00082","name":"Phường Cửa Nam","province_code":"01"},{"code":"00637","name":"Phường Đại Mỗ","province_code":"01"},{"code":"00316","name":"Phường Định Công","province_code":"01"},{"code":"00235","name":"Phường Đống Đa","province_code":"01"},{"code":"00602","name":"Phường Đông Ngạc","province_code":"01"},{"code":"09886","name":"Phường Dương Nội","province_code":"01"},{"code":"00025","name":"Phường Giảng Võ","province_code":"01"},{"code":"09556","name":"Phường Hà Đông","province_code":"01"},{"code":"00256","name":"Phường Hai Bà Trưng","province_code":"01"},{"code":"00070","name":"Phường Hoàn Kiếm","province_code":"01"},{"code":"00337","name":"Phường Hoàng Liệt","province_code":"01"},{"code":"00331","name":"Phường Hoàng Mai","province_code":"01"},{"code":"00097","name":"Phường Hồng Hà","province_code":"01"},{"code":"00364","name":"Phường Khương Đình","province_code":"01"},{"code":"09552","name":"Phường Kiến Hưng","province_code":"01"},{"code":"00229","name":"Phường Kim Liên","province_code":"01"},{"code":"00199","name":"Phường Láng","province_code":"01"},{"code":"00328","name":"Phường Lĩnh Nam","province_code":"01"},{"code":"00145","name":"Phường Long Biên","province_code":"01"},{"code":"00160","name":"Phường Nghĩa Đô","province_code":"01"},{"code":"00008","name":"Phường Ngọc Hà","province_code":"01"},{"code":"00190","name":"Phường Ô Chợ Dừa","province_code":"01"},{"code":"00619","name":"Phường Phú Diễn","province_code":"01"},{"code":"09568","name":"Phường Phú Lương","province_code":"01"},{"code":"00091","name":"Phường Phú Thượng","province_code":"01"},{"code":"00136","name":"Phường Phúc Lợi","province_code":"01"},{"code":"00352","name":"Phường Phương Liệt","province_code":"01"},{"code":"09574","name":"Phường Sơn Tây","province_code":"01"},{"code":"00103","name":"Phường Tây Hồ","province_code":"01"},{"code":"00634","name":"Phường Tây Mỗ","province_code":"01"},{"code":"00613","name":"Phường Tây Tựu","province_code":"01"},{"code":"00643","name":"Phường Thanh Liệt","province_code":"01"},{"code":"00367","name":"Phường Thanh Xuân","province_code":"01"},{"code":"00598","name":"Phường Thượng Cát","province_code":"01"},{"code":"00592","name":"Phường Từ Liêm","province_code":"01"},{"code":"09604","name":"Phường Tùng Thiện","province_code":"01"},{"code":"00322","name":"Phường Tương Mai","province_code":"01"},{"code":"00226","name":"Phường Văn Miếu - Quốc Tử Giám","province_code":"01"},{"code":"00127","name":"Phường Việt Hưng","province_code":"01"},{"code":"00301","name":"Phường Vĩnh Hưng","province_code":"01"},{"code":"00283","name":"Phường Vĩnh Tuy","province_code":"01"},{"code":"00611","name":"Phường Xuân Đỉnh","province_code":"01"},{"code":"00622","name":"Phường Xuân Phương","province_code":"01"},{"code":"00175","name":"Phường Yên Hòa","province_code":"01"},{"code":"09562","name":"Phường Yên Nghĩa","province_code":"01"},{"code":"00340","name":"Phường Yên Sở","province_code":"01"},{"code":"09877","name":"Xã An Khánh","province_code":"01"},{"code":"09700","name":"Xã Ba Vì","province_code":"01"},{"code":"09676","name":"Xã Bất Bạt","province_code":"01"},{"code":"00577","name":"Xã Bát Tràng","province_code":"01"},{"code":"10126","name":"Xã Bình Minh","province_code":"01"},{"code":"10237","name":"Xã Chương Dương","province_code":"01"},{"code":"10330","name":"Xã Chuyên Mỹ","province_code":"01"},{"code":"09634","name":"Xã Cổ Đô","province_code":"01"},{"code":"00430","name":"Xã Đa Phúc","province_code":"01"},{"code":"00664","name":"Xã Đại Thanh","province_code":"01"},{"code":"10342","name":"Xã Đại Xuyên","province_code":"01"},{"code":"10180","name":"Xã Dân Hòa","province_code":"01"},{"code":"09784","name":"Xã Đan Phượng","province_code":"01"},{"code":"09616","name":"Xã Đoài Phương","province_code":"01"},{"code":"00454","name":"Xã Đông Anh","province_code":"01"},{"code":"09856","name":"Xã Dương Hòa","province_code":"01"},{"code":"00565","name":"Xã Gia Lâm","province_code":"01"},{"code":"09982","name":"Xã Hạ Bằng","province_code":"01"},{"code":"09772","name":"Xã Hát Môn","province_code":"01"},{"code":"09988","name":"Xã Hòa Lạc","province_code":"01"},{"code":"10096","name":"Xã Hòa Phú","province_code":"01"},{"code":"10417","name":"Xã Hòa Xá","province_code":"01"},{"code":"09832","name":"Xã Hoài Đức","province_code":"01"},{"code":"10465","name":"Xã Hồng Sơn","province_code":"01"},{"code":"10210","name":"Xã Hồng Vân","province_code":"01"},{"code":"09931","name":"Xã Hưng Đạo","province_code":"01"},{"code":"10489","name":"Xã Hương Sơn","province_code":"01"},{"code":"09910","name":"Xã Kiều Phú","province_code":"01"},{"code":"00382","name":"Xã Kim Anh","province_code":"01"},{"code":"09787","name":"Xã Liên Minh","province_code":"01"},{"code":"09022","name":"Xã Mê Linh","province_code":"01"},{"code":"09661","name":"Xã Minh Châu","province_code":"01"},{"code":"10441","name":"Xã Mỹ Đức","province_code":"01"},{"code":"00685","name":"Xã Nam Phù","province_code":"01"},{"code":"00679","name":"Xã Ngọc Hồi","province_code":"01"},{"code":"00433","name":"Xã Nội Bài","province_code":"01"},{"code":"09817","name":"Xã Ô Diên","province_code":"01"},{"code":"09952","name":"Xã Phú Cát","province_code":"01"},{"code":"00541","name":"Xã Phù Đổng","province_code":"01"},{"code":"10030","name":"Xã Phú Nghĩa","province_code":"01"},{"code":"10273","name":"Xã Phú Xuyên","province_code":"01"},{"code":"09739","name":"Xã Phúc Lộc","province_code":"01"},{"code":"10459","name":"Xã Phúc Sơn","province_code":"01"},{"code":"00466","name":"Xã Phúc Thịnh","province_code":"01"},{"code":"09715","name":"Xã Phúc Thọ","province_code":"01"},{"code":"10279","name":"Xã Phượng Dực","province_code":"01"},{"code":"10072","name":"Xã Quảng Bị","province_code":"01"},{"code":"08974","name":"Xã Quang Minh","province_code":"01"},{"code":"09619","name":"Xã Quảng Oai","province_code":"01"},{"code":"09895","name":"Xã Quốc Oai","province_code":"01"},{"code":"00376","name":"Xã Sóc Sơn","province_code":"01"},{"code":"09871","name":"Xã Sơn Đồng","province_code":"01"},{"code":"09694","name":"Xã Suối Hai","province_code":"01"},{"code":"10144","name":"Xã Tam Hưng","province_code":"01"},{"code":"10003","name":"Xã Tây Phương","province_code":"01"},{"code":"09955","name":"Xã Thạch Thất","province_code":"01"},{"code":"10114","name":"Xã Thanh Oai","province_code":"01"},{"code":"00640","name":"Xã Thanh Trì","province_code":"01"},{"code":"00493","name":"Xã Thiên Lộc","province_code":"01"},{"code":"00475","name":"Xã Thư Lâm","province_code":"01"},{"code":"00562","name":"Xã Thuận An","province_code":"01"},{"code":"10231","name":"Xã Thượng Phúc","province_code":"01"},{"code":"10183","name":"Xã Thường Tín","province_code":"01"},{"code":"08995","name":"Xã Tiến Thắng","province_code":"01"},{"code":"10081","name":"Xã Trần Phú","province_code":"01"},{"code":"00385","name":"Xã Trung Giã","province_code":"01"},{"code":"10402","name":"Xã Ứng Hòa","province_code":"01"},{"code":"10369","name":"Xã Ứng Thiên","province_code":"01"},{"code":"10354","name":"Xã Vân Đình","province_code":"01"},{"code":"09664","name":"Xã Vật Lại","province_code":"01"},{"code":"00508","name":"Xã Vĩnh Thanh","province_code":"01"},{"code":"10045","name":"Xã Xuân Mai","province_code":"01"},{"code":"09706","name":"Xã Yên Bài","province_code":"01"},{"code":"08980","name":"Xã Yên Lãng","province_code":"01"},{"code":"04930","name":"Xã Yên Xuân","province_code":"01"},{"code":"05533","name":"Phường Bá Xuyên","province_code":"19"},{"code":"01843","name":"Phường Bắc Kạn","province_code":"19"},{"code":"05528","name":"Phường Bách Quang","province_code":"19"},{"code":"01840","name":"Phường Đức Xuân","province_code":"19"},{"code":"05467","name":"Phường Gia Sàng","province_code":"19"},{"code":"05710","name":"Phường Linh Sơn","province_code":"19"},{"code":"05443","name":"Phường Phan Đình Phùng","province_code":"19"},{"code":"05860","name":"Phường Phổ Yên","province_code":"19"},{"code":"05857","name":"Phường Phúc Thuận","province_code":"19"},{"code":"05482","name":"Phường Quan Triều","province_code":"19"},{"code":"05455","name":"Phường Quyết Thắng","province_code":"19"},{"code":"05518","name":"Phường Sông Công","province_code":"19"},{"code":"05500","name":"Phường Tích Lương","province_code":"19"},{"code":"05899","name":"Phường Trung Thành","province_code":"19"},{"code":"05890","name":"Phường Vạn Xuân","province_code":"19"},{"code":"05809","name":"Xã An Khánh","province_code":"19"},{"code":"01906","name":"Xã Ba Bể","province_code":"19"},{"code":"02014","name":"Xã Bạch Thông","province_code":"19"},{"code":"01864","name":"Xã Bằng Thành","province_code":"19"},{"code":"01942","name":"Xã Bằng Vân","province_code":"19"},{"code":"05605","name":"Xã Bình Thành","province_code":"19"},{"code":"05587","name":"Xã Bình Yên","province_code":"19"},{"code":"02008","name":"Xã Cẩm Giàng","province_code":"19"},{"code":"01879","name":"Xã Cao Minh","province_code":"19"},{"code":"02020","name":"Xã Chợ Đồn","province_code":"19"},{"code":"02086","name":"Xã Chợ Mới","province_code":"19"},{"code":"01912","name":"Xã Chợ Rã","province_code":"19"},{"code":"02185","name":"Xã Côn Minh","province_code":"19"},{"code":"02152","name":"Xã Cường Lợi","province_code":"19"},{"code":"05488","name":"Xã Đại Phúc","province_code":"19"},{"code":"05830","name":"Xã Đại Từ","province_code":"19"},{"code":"05755","name":"Xã Dân Tiến","province_code":"19"},{"code":"05941","name":"Xã Điềm Thụy","province_code":"19"},{"code":"05569","name":"Xã Định Hóa","province_code":"19"},{"code":"05692","name":"Xã Đồng Hỷ","province_code":"19"},{"code":"01933","name":"Xã Đồng Phúc","province_code":"19"},{"code":"05776","name":"Xã Đức Lương","province_code":"19"},{"code":"01960","name":"Xã Hiệp Lực","province_code":"19"},{"code":"05632","name":"Xã Hợp Thành","province_code":"19"},{"code":"05953","name":"Xã Kha Sơn","province_code":"19"},{"code":"05551","name":"Xã Kim Phượng","province_code":"19"},{"code":"05818","name":"Xã La Bằng","province_code":"19"},{"code":"05740","name":"Xã La Hiên","province_code":"19"},{"code":"05542","name":"Xã Lam Vỹ","province_code":"19"},{"code":"01936","name":"Xã Nà Phặc","province_code":"19"},{"code":"02155","name":"Xã Na Rì","province_code":"19"},{"code":"02026","name":"Xã Nam Cường","province_code":"19"},{"code":"05707","name":"Xã Nam Hòa","province_code":"19"},{"code":"01954","name":"Xã Ngân Sơn","province_code":"19"},{"code":"02071","name":"Xã Nghĩa Tá","province_code":"19"},{"code":"01882","name":"Xã Nghiên Loan","province_code":"19"},{"code":"05722","name":"Xã Nghinh Tường","province_code":"19"},{"code":"01849","name":"Xã Phong Quang","province_code":"19"},{"code":"05908","name":"Xã Phú Bình","province_code":"19"},{"code":"05602","name":"Xã Phú Đình","province_code":"19"},{"code":"05788","name":"Xã Phú Lạc","province_code":"19"},{"code":"05611","name":"Xã Phú Lương","province_code":"19"},{"code":"05800","name":"Xã Phú Thịnh","province_code":"19"},{"code":"01969","name":"Xã Phủ Thông","province_code":"19"},{"code":"05773","name":"Xã Phú Xuyên","province_code":"19"},{"code":"01894","name":"Xã Phúc Lộc","province_code":"19"},{"code":"05563","name":"Xã Phượng Tiến","province_code":"19"},{"code":"05851","name":"Xã Quân Chu","province_code":"19"},{"code":"02038","name":"Xã Quảng Bạch","province_code":"19"},{"code":"05674","name":"Xã Quang Sơn","province_code":"19"},{"code":"05719","name":"Xã Sảng Mộc","province_code":"19"},{"code":"05503","name":"Xã Tân Cương","province_code":"19"},{"code":"05917","name":"Xã Tân Khánh","province_code":"19"},{"code":"02104","name":"Xã Tân Kỳ","province_code":"19"},{"code":"05923","name":"Xã Tân Thành","province_code":"19"},{"code":"05725","name":"Xã Thần Sa","province_code":"19"},{"code":"05881","name":"Xã Thành Công","province_code":"19"},{"code":"02101","name":"Xã Thanh Mai","province_code":"19"},{"code":"02107","name":"Xã Thanh Thịnh","province_code":"19"},{"code":"01921","name":"Xã Thượng Minh","province_code":"19"},{"code":"01957","name":"Xã Thượng Quan","province_code":"19"},{"code":"05662","name":"Xã Trại Cau","province_code":"19"},{"code":"02176","name":"Xã Trần Phú","province_code":"19"},{"code":"05746","name":"Xã Tràng Xá","province_code":"19"},{"code":"05581","name":"Xã Trung Hội","province_code":"19"},{"code":"05680","name":"Xã Văn Hán","province_code":"19"},{"code":"02143","name":"Xã Văn Lang","province_code":"19"},{"code":"05665","name":"Xã Văn Lăng","province_code":"19"},{"code":"05845","name":"Xã Vạn Phú","province_code":"19"},{"code":"01981","name":"Xã Vĩnh Thông","province_code":"19"},{"code":"05716","name":"Xã Võ Nhai","province_code":"19"},{"code":"05641","name":"Xã Vô Tranh","province_code":"19"},{"code":"02191","name":"Xã Xuân Dương","province_code":"19"},{"code":"02116","name":"Xã Yên Bình","province_code":"19"},{"code":"02083","name":"Xã Yên Phong","province_code":"19"},{"code":"02044","name":"Xã Yên Thịnh","province_code":"19"},{"code":"05620","name":"Xã Yên Trạch","province_code":"19"},{"code":"05977","name":"Phường Đông Kinh","province_code":"20"},{"code":"06187","name":"Phường Kỳ Lừa","province_code":"20"},{"code":"05983","name":"Phường Lương Văn Tri","province_code":"20"},{"code":"05986","name":"Phường Tam Thanh","province_code":"20"},{"code":"06196","name":"Xã Ba Sơn","province_code":"20"},{"code":"06325","name":"Xã Bắc Sơn","province_code":"20"},{"code":"06475","name":"Xã Bằng Mạc","province_code":"20"},{"code":"06112","name":"Xã Bình Gia","province_code":"20"},{"code":"06427","name":"Xã Cai Kinh","province_code":"20"},{"code":"06211","name":"Xã Cao Lộc","province_code":"20"},{"code":"06637","name":"Xã Châu Sơn","province_code":"20"},{"code":"06463","name":"Xã Chi Lăng","province_code":"20"},{"code":"06481","name":"Xã Chiến Thắng","province_code":"20"},{"code":"06220","name":"Xã Công Sơn","province_code":"20"},{"code":"06280","name":"Xã Điềm He","province_code":"20"},{"code":"06613","name":"Xã Đình Lập","province_code":"20"},{"code":"06001","name":"Xã Đoàn Kết","province_code":"20"},{"code":"06184","name":"Xã Đồng Đăng","province_code":"20"},{"code":"06073","name":"Xã Hoa Thám","province_code":"20"},{"code":"06172","name":"Xã Hoàng Văn Thụ","province_code":"20"},{"code":"06151","name":"Xã Hội Hoan","province_code":"20"},{"code":"06079","name":"Xã Hồng Phong","province_code":"20"},{"code":"06349","name":"Xã Hưng Vũ","province_code":"20"},{"code":"06400","name":"Xã Hữu Liên","province_code":"20"},{"code":"06385","name":"Xã Hữu Lũng","province_code":"20"},{"code":"06037","name":"Xã Kháng Chiến","province_code":"20"},{"code":"06286","name":"Xã Khánh Khê","province_code":"20"},{"code":"06565","name":"Xã Khuất Xá","province_code":"20"},{"code":"06625","name":"Xã Kiên Mộc","province_code":"20"},{"code":"06529","name":"Xã Lộc Bình","province_code":"20"},{"code":"06601","name":"Xã Lợi Bác","province_code":"20"},{"code":"06541","name":"Xã Mẫu Sơn","province_code":"20"},{"code":"06526","name":"Xã Na Dương","province_code":"20"},{"code":"06124","name":"Xã Na Sầm","province_code":"20"},{"code":"06496","name":"Xã Nhân Lý","province_code":"20"},{"code":"06376","name":"Xã Nhất Hòa","province_code":"20"},{"code":"06517","name":"Xã Quan Sơn","province_code":"20"},{"code":"06004","name":"Xã Quốc Khánh","province_code":"20"},{"code":"06058","name":"Xã Quốc Việt","province_code":"20"},{"code":"06076","name":"Xã Quý Hòa","province_code":"20"},{"code":"06316","name":"Xã Tân Đoàn","province_code":"20"},{"code":"06445","name":"Xã Tân Thành","province_code":"20"},{"code":"06019","name":"Xã Tân Tiến","province_code":"20"},{"code":"06337","name":"Xã Tân Tri","province_code":"20"},{"code":"06115","name":"Xã Tân Văn","province_code":"20"},{"code":"06616","name":"Xã Thái Bình","province_code":"20"},{"code":"06040","name":"Xã Thất Khê","province_code":"20"},{"code":"06085","name":"Xã Thiện Hòa","province_code":"20"},{"code":"06103","name":"Xã Thiện Long","province_code":"20"},{"code":"06436","name":"Xã Thiện Tân","province_code":"20"},{"code":"06091","name":"Xã Thiện Thuật","province_code":"20"},{"code":"06577","name":"Xã Thống Nhất","province_code":"20"},{"code":"06148","name":"Xã Thụy Hùng","province_code":"20"},{"code":"06046","name":"Xã Tràng Định","province_code":"20"},{"code":"06313","name":"Xã Tri Lễ","province_code":"20"},{"code":"06457","name":"Xã Tuấn Sơn","province_code":"20"},{"code":"06154","name":"Xã Văn Lãng","province_code":"20"},{"code":"06505","name":"Xã Vạn Linh","province_code":"20"},{"code":"06415","name":"Xã Vân Nham","province_code":"20"},{"code":"06253","name":"Xã Văn Quan","province_code":"20"},{"code":"06367","name":"Xã Vũ Lăng","province_code":"20"},{"code":"06364","name":"Xã Vũ Lễ","province_code":"20"},{"code":"06607","name":"Xã Xuân Dương","province_code":"20"},{"code":"06391","name":"Xã Yên Bình","province_code":"20"},{"code":"06298","name":"Xã Yên Phúc","province_code":"20"},{"code":"07948","name":"Phường Âu Cơ","province_code":"25"},{"code":"04795","name":"Phường Hòa Bình","province_code":"25"},{"code":"04894","name":"Phường Kỳ Sơn","province_code":"25"},{"code":"07894","name":"Phường Nông Trang","province_code":"25"},{"code":"07954","name":"Phường Phong Châu","province_code":"25"},{"code":"07942","name":"Phường Phú Thọ","province_code":"25"},{"code":"08740","name":"Phường Phúc Yên","province_code":"25"},{"code":"04792","name":"Phường Tân Hòa","province_code":"25"},{"code":"07909","name":"Phường Thanh Miếu","province_code":"25"},{"code":"04828","name":"Phường Thống Nhất","province_code":"25"},{"code":"07918","name":"Phường Vân Phú","province_code":"25"},{"code":"07900","name":"Phường Việt Trì","province_code":"25"},{"code":"08716","name":"Phường Vĩnh Phúc","province_code":"25"},{"code":"08707","name":"Phường Vĩnh Yên","province_code":"25"},{"code":"08746","name":"Phường Xuân Hòa","province_code":"25"},{"code":"05425","name":"Xã An Bình","province_code":"25"},{"code":"05395","name":"Xã An Nghĩa","province_code":"25"},{"code":"08527","name":"Xã Bản Nguyên","province_code":"25"},{"code":"07996","name":"Xã Bằng Luân","province_code":"25"},{"code":"05245","name":"Xã Bao La","province_code":"25"},{"code":"08935","name":"Xã Bình Nguyên","province_code":"25"},{"code":"08275","name":"Xã Bình Phú","province_code":"25"},{"code":"08944","name":"Xã Bình Tuyền","province_code":"25"},{"code":"08950","name":"Xã Bình Xuyên","province_code":"25"},{"code":"08341","name":"Xã Cẩm Khê","province_code":"25"},{"code":"05047","name":"Xã Cao Dương","province_code":"25"},{"code":"05089","name":"Xã Cao Phong","province_code":"25"},{"code":"04876","name":"Xã Cao Sơn","province_code":"25"},{"code":"08038","name":"Xã Chân Mộng","province_code":"25"},{"code":"07999","name":"Xã Chí Đám","province_code":"25"},{"code":"08218","name":"Xã Chí Tiên","province_code":"25"},{"code":"08614","name":"Xã Cự Đồng","province_code":"25"},{"code":"04831","name":"Xã Đà Bắc","province_code":"25"},{"code":"08923","name":"Xã Đại Đình","province_code":"25"},{"code":"05347","name":"Xã Đại Đồng","province_code":"25"},{"code":"08254","name":"Xã Dân Chủ","province_code":"25"},{"code":"08071","name":"Xã Đan Thượng","province_code":"25"},{"code":"08914","name":"Xã Đạo Trù","province_code":"25"},{"code":"08662","name":"Xã Đào Xá","province_code":"25"},{"code":"07969","name":"Xã Đoan Hùng","province_code":"25"},{"code":"08431","name":"Xã Đồng Lương","province_code":"25"},{"code":"08209","name":"Xã Đông Thành","province_code":"25"},{"code":"04846","name":"Xã Đức Nhàn","province_code":"25"},{"code":"05086","name":"Xã Dũng Tiến","province_code":"25"},{"code":"08053","name":"Xã Hạ Hòa","province_code":"25"},{"code":"08782","name":"Xã Hải Lựu","province_code":"25"},{"code":"08110","name":"Xã Hiền Lương","province_code":"25"},{"code":"08443","name":"Xã Hiền Quan","province_code":"25"},{"code":"08896","name":"Xã Hoàng An","province_code":"25"},{"code":"08203","name":"Xã Hoàng Cương","province_code":"25"},{"code":"08905","name":"Xã Hội Thịnh","province_code":"25"},{"code":"05068","name":"Xã Hợp Kim","province_code":"25"},{"code":"08770","name":"Xã Hợp Lý","province_code":"25"},{"code":"08416","name":"Xã Hùng Việt","province_code":"25"},{"code":"08632","name":"Xã Hương Cần","province_code":"25"},{"code":"08515","name":"Xã Hy Cương","province_code":"25"},{"code":"08635","name":"Xã Khả Cửu","province_code":"25"},{"code":"04978","name":"Xã Kim Bôi","province_code":"25"},{"code":"05362","name":"Xã Lạc Lương","province_code":"25"},{"code":"05266","name":"Xã Lạc Sơn","province_code":"25"},{"code":"05392","name":"Xã Lạc Thủy","province_code":"25"},{"code":"08560","name":"Xã Lai Đồng","province_code":"25"},{"code":"08494","name":"Xã Lâm Thao","province_code":"25"},{"code":"08761","name":"Xã Lập Thạch","province_code":"25"},{"code":"09064","name":"Xã Liên Châu","province_code":"25"},{"code":"08812","name":"Xã Liên Hòa","province_code":"25"},{"code":"08227","name":"Xã Liên Minh","province_code":"25"},{"code":"04960","name":"Xã Liên Sơn","province_code":"25"},{"code":"08620","name":"Xã Long Cốc","province_code":"25"},{"code":"04924","name":"Xã Lương Sơn","province_code":"25"},{"code":"05200","name":"Xã Mai Châu","province_code":"25"},{"code":"05251","name":"Xã Mai Hạ","province_code":"25"},{"code":"08593","name":"Xã Minh Đài","province_code":"25"},{"code":"08338","name":"Xã Minh Hòa","province_code":"25"},{"code":"05158","name":"Xã Mường Bi","province_code":"25"},{"code":"05014","name":"Xã Mường Động","province_code":"25"},{"code":"05134","name":"Xã Mường Hoa","province_code":"25"},{"code":"05116","name":"Xã Mường Thàng","province_code":"25"},{"code":"05287","name":"Xã Mường Vang","province_code":"25"},{"code":"04990","name":"Xã Nật Sơn","province_code":"25"},{"code":"05329","name":"Xã Ngọc Sơn","province_code":"25"},{"code":"09052","name":"Xã Nguyệt Đức","province_code":"25"},{"code":"05290","name":"Xã Nhân Nghĩa","province_code":"25"},{"code":"05212","name":"Xã Pà Cò","province_code":"25"},{"code":"08398","name":"Xã Phú Khê","province_code":"25"},{"code":"08236","name":"Xã Phú Mỹ","province_code":"25"},{"code":"08230","name":"Xã Phù Ninh","province_code":"25"},{"code":"08521","name":"Xã Phùng Nguyên","province_code":"25"},{"code":"08173","name":"Xã Quảng Yên","province_code":"25"},{"code":"04873","name":"Xã Quy Đức","province_code":"25"},{"code":"05323","name":"Xã Quyết Thắng","province_code":"25"},{"code":"08866","name":"Xã Sơn Đông","province_code":"25"},{"code":"08296","name":"Xã Sơn Lương","province_code":"25"},{"code":"08848","name":"Xã Sông Lô","province_code":"25"},{"code":"08911","name":"Xã Tam Đảo","province_code":"25"},{"code":"08869","name":"Xã Tam Dương","province_code":"25"},{"code":"08872","name":"Xã Tam Dương Bắc","province_code":"25"},{"code":"09043","name":"Xã Tam Hồng","province_code":"25"},{"code":"08434","name":"Xã Tam Nông","province_code":"25"},{"code":"08824","name":"Xã Tam Sơn","province_code":"25"},{"code":"05128","name":"Xã Tân Lạc","province_code":"25"},{"code":"05206","name":"Xã Tân Mai","province_code":"25"},{"code":"04849","name":"Xã Tân Pheo","province_code":"25"},{"code":"08566","name":"Xã Tân Sơn","province_code":"25"},{"code":"08023","name":"Xã Tây Cốc","province_code":"25"},{"code":"09040","name":"Xã Tề Lỗ","province_code":"25"},{"code":"08788","name":"Xã Thái Hòa","province_code":"25"},{"code":"08152","name":"Xã Thanh Ba","province_code":"25"},{"code":"08542","name":"Xã Thanh Sơn","province_code":"25"},{"code":"08674","name":"Xã Thanh Thủy","province_code":"25"},{"code":"04897","name":"Xã Thịnh Minh","province_code":"25"},{"code":"09112","name":"Xã Thổ Tang","province_code":"25"},{"code":"08479","name":"Xã Thọ Văn","province_code":"25"},{"code":"08545","name":"Xã Thu Cúc","province_code":"25"},{"code":"05092","name":"Xã Thung Nai","province_code":"25"},{"code":"05293","name":"Xã Thượng Cốc","province_code":"25"},{"code":"08323","name":"Xã Thượng Long","province_code":"25"},{"code":"08842","name":"Xã Tiên Lữ","province_code":"25"},{"code":"08344","name":"Xã Tiên Lương","province_code":"25"},{"code":"04891","name":"Xã Tiền Phong","province_code":"25"},{"code":"05191","name":"Xã Toàn Thắng","province_code":"25"},{"code":"08245","name":"Xã Trạm Thản","province_code":"25"},{"code":"08311","name":"Xã Trung Sơn","province_code":"25"},{"code":"08686","name":"Xã Tu Vũ","province_code":"25"},{"code":"08377","name":"Xã Vân Bán","province_code":"25"},{"code":"08134","name":"Xã Văn Lang","province_code":"25"},{"code":"08611","name":"Xã Văn Miếu","province_code":"25"},{"code":"05152","name":"Xã Vân Sơn","province_code":"25"},{"code":"08467","name":"Xã Vạn Xuân","province_code":"25"},{"code":"09079","name":"Xã Vĩnh An","province_code":"25"},{"code":"08143","name":"Xã Vĩnh Chân","province_code":"25"},{"code":"09100","name":"Xã Vĩnh Hưng","province_code":"25"},{"code":"09154","name":"Xã Vĩnh Phú","province_code":"25"},{"code":"09106","name":"Xã Vĩnh Thành","province_code":"25"},{"code":"09076","name":"Xã Vĩnh Tường","province_code":"25"},{"code":"08584","name":"Xã Võ Miếu","province_code":"25"},{"code":"08590","name":"Xã Xuân Đài","province_code":"25"},{"code":"08971","name":"Xã Xuân Lãng","province_code":"25"},{"code":"08500","name":"Xã Xuân Lũng","province_code":"25"},{"code":"08305","name":"Xã Xuân Viên","province_code":"25"},{"code":"08113","name":"Xã Yên Kỳ","province_code":"25"},{"code":"09025","name":"Xã Yên Lạc","province_code":"25"},{"code":"08773","name":"Xã Yên Lãng","province_code":"25"},{"code":"08290","name":"Xã Yên Lập","province_code":"25"},{"code":"05305","name":"Xã Yên Phú","province_code":"25"},{"code":"08656","name":"Xã Yên Sơn","province_code":"25"},{"code":"05353","name":"Xã Yên Thủy","province_code":"25"},{"code":"05386","name":"Xã Yên Trị","province_code":"25"},{"code":"03127","name":"Phường Điện Biên Phủ","province_code":"11"},{"code":"03151","name":"Phường Mường Lay","province_code":"11"},{"code":"03334","name":"Phường Mường Thanh","province_code":"11"},{"code":"03301","name":"Xã Búng Lao","province_code":"11"},{"code":"03175","name":"Xã Chà Tở","province_code":"11"},{"code":"03283","name":"Xã Chiềng Sinh","province_code":"11"},{"code":"03256","name":"Xã Mường Ảng","province_code":"11"},{"code":"03166","name":"Xã Mường Chà","province_code":"11"},{"code":"03313","name":"Xã Mường Lạn","province_code":"11"},{"code":"03214","name":"Xã Mường Luân","province_code":"11"},{"code":"03268","name":"Xã Mường Mùn","province_code":"11"},{"code":"03368","name":"Xã Mường Nhà","province_code":"11"},{"code":"03160","name":"Xã Mường Nhé","province_code":"11"},{"code":"03325","name":"Xã Mường Phăng","province_code":"11"},{"code":"03202","name":"Xã Mường Pồn","province_code":"11"},{"code":"03163","name":"Xã Mường Toong","province_code":"11"},{"code":"03181","name":"Xã Mường Tùng","province_code":"11"},{"code":"03176","name":"Xã Nà Bủng","province_code":"11"},{"code":"03169","name":"Xã Nà Hỳ","province_code":"11"},{"code":"03172","name":"Xã Na Sang","province_code":"11"},{"code":"03203","name":"Xã Na Son","province_code":"11"},{"code":"03316","name":"Xã Nà Tấu","province_code":"11"},{"code":"03162","name":"Xã Nậm Kè","province_code":"11"},{"code":"03194","name":"Xã Nậm Nèn","province_code":"11"},{"code":"03358","name":"Xã Núa Ngam","province_code":"11"},{"code":"03193","name":"Xã Pa Ham","province_code":"11"},{"code":"03382","name":"Xã Phình Giàng","province_code":"11"},{"code":"03370","name":"Xã Pu Nhi","province_code":"11"},{"code":"03260","name":"Xã Pú Nhung","province_code":"11"},{"code":"03295","name":"Xã Quài Tở","province_code":"11"},{"code":"03164","name":"Xã Quảng Lâm","province_code":"11"},{"code":"03356","name":"Xã Sam Mứn","province_code":"11"},{"code":"03244","name":"Xã Sáng Nhè","province_code":"11"},{"code":"03199","name":"Xã Si Pa Phìn","province_code":"11"},{"code":"03226","name":"Xã Sín Chải","province_code":"11"},{"code":"03158","name":"Xã Sín Thầu","province_code":"11"},{"code":"03241","name":"Xã Sính Phình","province_code":"11"},{"code":"03352","name":"Xã Thanh An","province_code":"11"},{"code":"03328","name":"Xã Thanh Nưa","province_code":"11"},{"code":"03349","name":"Xã Thanh Yên","province_code":"11"},{"code":"03385","name":"Xã Tìa Dình","province_code":"11"},{"code":"03217","name":"Xã Tủa Chùa","province_code":"11"},{"code":"03220","name":"Xã Tủa Thàng","province_code":"11"},{"code":"03253","name":"Xã Tuần Giáo","province_code":"11"},{"code":"03208","name":"Xã Xa Dung","province_code":"11"},{"code":"03388","name":"Phường Đoàn Kết","province_code":"12"},{"code":"03408","name":"Phường Tân Phong","province_code":"12"},{"code":"03424","name":"Xã Bản Bo","province_code":"12"},{"code":"03390","name":"Xã Bình Lư","province_code":"12"},{"code":"03466","name":"Xã Bum Nưa","province_code":"12"},{"code":"03433","name":"Xã Bum Tở","province_code":"12"},{"code":"03571","name":"Xã Dào San","province_code":"12"},{"code":"03508","name":"Xã Hồng Thu","province_code":"12"},{"code":"03460","name":"Xã Hua Bum","province_code":"12"},{"code":"03640","name":"Xã Khoen On","province_code":"12"},{"code":"03583","name":"Xã Khổng Lào","province_code":"12"},{"code":"03430","name":"Xã Khun Há","province_code":"12"},{"code":"03487","name":"Xã Lê Lợi","province_code":"12"},{"code":"03451","name":"Xã Mù Cả","province_code":"12"},{"code":"03601","name":"Xã Mường Khoa","province_code":"12"},{"code":"03637","name":"Xã Mường Kim","province_code":"12"},{"code":"03472","name":"Xã Mường Mô","province_code":"12"},{"code":"03445","name":"Xã Mường Tè","province_code":"12"},{"code":"03618","name":"Xã Mường Than","province_code":"12"},{"code":"03544","name":"Xã Nậm Cuổi","province_code":"12"},{"code":"03434","name":"Xã Nậm Hàng","province_code":"12"},{"code":"03538","name":"Xã Nậm Mạ","province_code":"12"},{"code":"03613","name":"Xã Nậm Sỏ","province_code":"12"},{"code":"03517","name":"Xã Nậm Tăm","province_code":"12"},{"code":"03503","name":"Xã Pa Tần","province_code":"12"},{"code":"03442","name":"Xã Pa Ủ","province_code":"12"},{"code":"03616","name":"Xã Pắc Ta","province_code":"12"},{"code":"03549","name":"Xã Phong Thổ","province_code":"12"},{"code":"03532","name":"Xã Pu Sam Cáp","province_code":"12"},{"code":"03562","name":"Xã Sì Lở Lầu","province_code":"12"},{"code":"03478","name":"Xã Sìn Hồ","province_code":"12"},{"code":"03394","name":"Xã Sin Suối Hồ","province_code":"12"},{"code":"03405","name":"Xã Tả Lèng","province_code":"12"},{"code":"03463","name":"Xã Tà Tổng","province_code":"12"},{"code":"03598","name":"Xã Tân Uyên","province_code":"12"},{"code":"03595","name":"Xã Than Uyên","province_code":"12"},{"code":"03439","name":"Xã Thu Lũm","province_code":"12"},{"code":"03529","name":"Xã Tủa Sín Chải","province_code":"12"},{"code":"03664","name":"Phường Chiềng An","province_code":"14"},{"code":"03670","name":"Phường Chiềng Cơi","province_code":"14"},{"code":"03679","name":"Phường Chiềng Sinh","province_code":"14"},{"code":"03980","name":"Phường Mộc Châu","province_code":"14"},{"code":"03979","name":"Phường Mộc Sơn","province_code":"14"},{"code":"03982","name":"Phường Thảo Nguyên","province_code":"14"},{"code":"03646","name":"Phường Tô Hiệu","province_code":"14"},{"code":"04033","name":"Phường Vân Sơn","province_code":"14"},{"code":"03856","name":"Xã Bắc Yên","province_code":"14"},{"code":"03724","name":"Xã Bình Thuận","province_code":"14"},{"code":"04171","name":"Xã Bó Sinh","province_code":"14"},{"code":"04078","name":"Xã Chiềng Hặc","province_code":"14"},{"code":"03850","name":"Xã Chiềng Hoa","province_code":"14"},{"code":"04204","name":"Xã Chiềng Khoong","province_code":"14"},{"code":"04222","name":"Xã Chiềng Khương","province_code":"14"},{"code":"03754","name":"Xã Chiềng La","province_code":"14"},{"code":"03814","name":"Xã Chiềng Lao","province_code":"14"},{"code":"04132","name":"Xã Chiềng Mai","province_code":"14"},{"code":"04123","name":"Xã Chiềng Mung","province_code":"14"},{"code":"03892","name":"Xã Chiềng Sại","province_code":"14"},{"code":"04195","name":"Xã Chiềng Sơ","province_code":"14"},{"code":"03985","name":"Xã Chiềng Sơn","province_code":"14"},{"code":"04108","name":"Xã Chiềng Sung","province_code":"14"},{"code":"03781","name":"Xã Co Mạ","province_code":"14"},{"code":"04000","name":"Xã Đoàn Kết","province_code":"14"},{"code":"03922","name":"Xã Gia Phù","province_code":"14"},{"code":"04210","name":"Xã Huổi Một","province_code":"14"},{"code":"03961","name":"Xã Kim Bon","province_code":"14"},{"code":"03763","name":"Xã Long Hẹ","province_code":"14"},{"code":"04096","name":"Xã Lóng Phiêng","province_code":"14"},{"code":"04045","name":"Xã Lóng Sập","province_code":"14"},{"code":"04105","name":"Xã Mai Sơn","province_code":"14"},{"code":"03799","name":"Xã Muổi Nọi","province_code":"14"},{"code":"03760","name":"Xã Mường Bám","province_code":"14"},{"code":"03943","name":"Xã Mường Bang","province_code":"14"},{"code":"03847","name":"Xã Mường Bú","province_code":"14"},{"code":"04117","name":"Xã Mường Chanh","province_code":"14"},{"code":"03688","name":"Xã Mường Chiên","province_code":"14"},{"code":"03907","name":"Xã Mường Cơi","province_code":"14"},{"code":"03727","name":"Xã Mường É","province_code":"14"},{"code":"03694","name":"Xã Mường Giôn","province_code":"14"},{"code":"04219","name":"Xã Mường Hung","province_code":"14"},{"code":"03757","name":"Xã Mường Khiêng","province_code":"14"},{"code":"03808","name":"Xã Mường La","province_code":"14"},{"code":"04183","name":"Xã Mường Lầm","province_code":"14"},{"code":"04246","name":"Xã Mường Lạn","province_code":"14"},{"code":"04240","name":"Xã Mường Lèo","province_code":"14"},{"code":"03712","name":"Xã Mường Sại","province_code":"14"},{"code":"03784","name":"Xã Nậm Lầu","province_code":"14"},{"code":"04186","name":"Xã Nậm Ty","province_code":"14"},{"code":"03820","name":"Xã Ngọc Chiến","province_code":"14"},{"code":"03871","name":"Xã Pắc Ngà","province_code":"14"},{"code":"04144","name":"Xã Phiêng Cằm","province_code":"14"},{"code":"04099","name":"Xã Phiêng Khoài","province_code":"14"},{"code":"04159","name":"Xã Phiêng Pằn","province_code":"14"},{"code":"03910","name":"Xã Phù Yên","province_code":"14"},{"code":"04228","name":"Xã Púng Bánh","province_code":"14"},{"code":"03703","name":"Xã Quỳnh Nhai","province_code":"14"},{"code":"04006","name":"Xã Song Khủa","province_code":"14"},{"code":"04168","name":"Xã Sông Mã","province_code":"14"},{"code":"04231","name":"Xã Sốp Cộp","province_code":"14"},{"code":"03901","name":"Xã Suối Tọ","province_code":"14"},{"code":"04136","name":"Xã Tà Hộc","province_code":"14"},{"code":"03880","name":"Xã Tạ Khoa","province_code":"14"},{"code":"03868","name":"Xã Tà Xùa","province_code":"14"},{"code":"03970","name":"Xã Tân Phong","province_code":"14"},{"code":"03997","name":"Xã Tân Yên","province_code":"14"},{"code":"03721","name":"Xã Thuận Châu","province_code":"14"},{"code":"04018","name":"Xã Tô Múa","province_code":"14"},{"code":"03958","name":"Xã Tường Hạ","province_code":"14"},{"code":"04048","name":"Xã Vân Hồ","province_code":"14"},{"code":"03862","name":"Xã Xím Vàng","province_code":"14"},{"code":"04057","name":"Xã Xuân Nha","province_code":"14"},{"code":"04075","name":"Xã Yên Châu","province_code":"14"},{"code":"04087","name":"Xã Yên Sơn","province_code":"14"},{"code":"14812","name":"Phường Bỉm Sơn","province_code":"38"},{"code":"16609","name":"Phường Đào Duy Từ","province_code":"38"},{"code":"16417","name":"Phường Đông Quang","province_code":"38"},{"code":"16378","name":"Phường Đông Sơn","province_code":"38"},{"code":"15853","name":"Phường Đông Tiến","province_code":"38"},{"code":"14797","name":"Phường Hạc Thành","province_code":"38"},{"code":"16645","name":"Phường Hải Bình","province_code":"38"},{"code":"16597","name":"Phường Hải Lĩnh","province_code":"38"},{"code":"14758","name":"Phường Hàm Rồng","province_code":"38"},{"code":"16516","name":"Phường Nam Sầm Sơn","province_code":"38"},{"code":"16654","name":"Phường Nghi Sơn","province_code":"38"},{"code":"16576","name":"Phường Ngọc Sơn","province_code":"38"},{"code":"15925","name":"Phường Nguyệt Viên","province_code":"38"},{"code":"16522","name":"Phường Quảng Phú","province_code":"38"},{"code":"14818","name":"Phường Quang Trung","province_code":"38"},{"code":"16531","name":"Phường Sầm Sơn","province_code":"38"},{"code":"16594","name":"Phường Tân Dân","province_code":"38"},{"code":"16561","name":"Phường Tĩnh Gia","province_code":"38"},{"code":"16624","name":"Phường Trúc Lâm","province_code":"38"},{"code":"15766","name":"Xã An Nông","province_code":"38"},{"code":"16171","name":"Xã Ba Đình","province_code":"38"},{"code":"14923","name":"Xã Bá Thước","province_code":"38"},{"code":"15607","name":"Xã Bát Mọt","province_code":"38"},{"code":"15382","name":"Xã Biện Thượng","province_code":"38"},{"code":"16591","name":"Xã Các Sơn","province_code":"38"},{"code":"15178","name":"Xã Cẩm Tân","province_code":"38"},{"code":"15142","name":"Xã Cẩm Thạch","province_code":"38"},{"code":"15127","name":"Xã Cẩm Thủy","province_code":"38"},{"code":"15148","name":"Xã Cẩm Tú","province_code":"38"},{"code":"15163","name":"Xã Cẩm Vân","province_code":"38"},{"code":"14959","name":"Xã Cổ Lũng","province_code":"38"},{"code":"16369","name":"Xã Công Chính","province_code":"38"},{"code":"14950","name":"Xã Điền Lư","province_code":"38"},{"code":"14932","name":"Xã Điền Quang","province_code":"38"},{"code":"15448","name":"Xã Định Hòa","province_code":"38"},{"code":"15457","name":"Xã Định Tân","province_code":"38"},{"code":"15058","name":"Xã Đồng Lương","province_code":"38"},{"code":"16033","name":"Xã Đông Thành","province_code":"38"},{"code":"15724","name":"Xã Đồng Tiến","province_code":"38"},{"code":"15043","name":"Xã Giao An","province_code":"38"},{"code":"15274","name":"Xã Hà Long","province_code":"38"},{"code":"15271","name":"Xã Hà Trung","province_code":"38"},{"code":"16012","name":"Xã Hậu Lộc","province_code":"38"},{"code":"14896","name":"Xã Hiền Kiệt","province_code":"38"},{"code":"16138","name":"Xã Hồ Vương","province_code":"38"},{"code":"16072","name":"Xã Hoa Lộc","province_code":"38"},{"code":"16186","name":"Xã Hóa Quỳ","province_code":"38"},{"code":"15976","name":"Xã Hoằng Châu","province_code":"38"},{"code":"15880","name":"Xã Hoằng Giang","province_code":"38"},{"code":"15865","name":"Xã Hoằng Hóa","province_code":"38"},{"code":"15961","name":"Xã Hoằng Lộc","province_code":"38"},{"code":"15889","name":"Xã Hoằng Phú","province_code":"38"},{"code":"15910","name":"Xã Hoằng Sơn","province_code":"38"},{"code":"16000","name":"Xã Hoằng Thanh","province_code":"38"},{"code":"15991","name":"Xã Hoằng Tiến","province_code":"38"},{"code":"15286","name":"Xã Hoạt Giang","province_code":"38"},{"code":"14869","name":"Xã Hồi Xuân","province_code":"38"},{"code":"15682","name":"Xã Hợp Tiến","province_code":"38"},{"code":"15112","name":"Xã Kiên Thọ","province_code":"38"},{"code":"15187","name":"Xã Kim Tân","province_code":"38"},{"code":"15544","name":"Xã Lam Sơn","province_code":"38"},{"code":"15055","name":"Xã Linh Sơn","province_code":"38"},{"code":"15298","name":"Xã Lĩnh Toại","province_code":"38"},{"code":"15634","name":"Xã Luận Thành","province_code":"38"},{"code":"15628","name":"Xã Lương Sơn","province_code":"38"},{"code":"16438","name":"Xã Lưu Vệ","province_code":"38"},{"code":"16249","name":"Xã Mậu Lâm","province_code":"38"},{"code":"15124","name":"Xã Minh Sơn","province_code":"38"},{"code":"14866","name":"Xã Mường Chanh","province_code":"38"},{"code":"14845","name":"Xã Mường Lát","province_code":"38"},{"code":"14854","name":"Xã Mường Lý","province_code":"38"},{"code":"15025","name":"Xã Mường Mìn","province_code":"38"},{"code":"15013","name":"Xã Na Mèo","province_code":"38"},{"code":"14902","name":"Xã Nam Xuân","province_code":"38"},{"code":"16144","name":"Xã Nga An","province_code":"38"},{"code":"16093","name":"Xã Nga Sơn","province_code":"38"},{"code":"16114","name":"Xã Nga Thắng","province_code":"38"},{"code":"15061","name":"Xã Ngọc Lặc","province_code":"38"},{"code":"15091","name":"Xã Ngọc Liên","province_code":"38"},{"code":"15250","name":"Xã Ngọc Trạo","province_code":"38"},{"code":"15106","name":"Xã Nguyệt Ấn","province_code":"38"},{"code":"14864","name":"Xã Nhi Sơn","province_code":"38"},{"code":"16228","name":"Xã Như Thanh","province_code":"38"},{"code":"16174","name":"Xã Như Xuân","province_code":"38"},{"code":"16279","name":"Xã Nông Cống","province_code":"38"},{"code":"14878","name":"Xã Phú Lệ","province_code":"38"},{"code":"14890","name":"Xã Phú Xuân","province_code":"38"},{"code":"14956","name":"Xã Pù Luông","province_code":"38"},{"code":"14863","name":"Xã Pù Nhi","province_code":"38"},{"code":"15016","name":"Xã Quan Sơn","province_code":"38"},{"code":"16543","name":"Xã Quảng Bình","province_code":"38"},{"code":"14860","name":"Xã Quang Chiểu","province_code":"38"},{"code":"16489","name":"Xã Quảng Chính","province_code":"38"},{"code":"16498","name":"Xã Quảng Ngọc","province_code":"38"},{"code":"16540","name":"Xã Quảng Ninh","province_code":"38"},{"code":"16480","name":"Xã Quảng Yên","province_code":"38"},{"code":"15412","name":"Xã Quý Lộc","province_code":"38"},{"code":"14953","name":"Xã Quý Lương","province_code":"38"},{"code":"15553","name":"Xã Sao Vàng","province_code":"38"},{"code":"15022","name":"Xã Sơn Điện","province_code":"38"},{"code":"15010","name":"Xã Sơn Thủy","province_code":"38"},{"code":"14848","name":"Xã Tam Chung","province_code":"38"},{"code":"15019","name":"Xã Tam Lư","province_code":"38"},{"code":"15007","name":"Xã Tam Thanh","province_code":"38"},{"code":"15715","name":"Xã Tân Ninh","province_code":"38"},{"code":"15661","name":"Xã Tân Thành","province_code":"38"},{"code":"16108","name":"Xã Tân Tiến","province_code":"38"},{"code":"15361","name":"Xã Tây Đô","province_code":"38"},{"code":"15211","name":"Xã Thạch Bình","province_code":"38"},{"code":"15085","name":"Xã Thạch Lập","province_code":"38"},{"code":"15199","name":"Xã Thạch Quảng","province_code":"38"},{"code":"16342","name":"Xã Thăng Bình","province_code":"38"},{"code":"15643","name":"Xã Thắng Lộc","province_code":"38"},{"code":"16309","name":"Xã Thắng Lợi","province_code":"38"},{"code":"16273","name":"Xã Thanh Kỳ","province_code":"38"},{"code":"16213","name":"Xã Thanh Phong","province_code":"38"},{"code":"16222","name":"Xã Thanh Quân","province_code":"38"},{"code":"15229","name":"Xã Thành Vinh","province_code":"38"},{"code":"14908","name":"Xã Thiên Phủ","province_code":"38"},{"code":"14980","name":"Xã Thiết Ống","province_code":"38"},{"code":"15772","name":"Xã Thiệu Hóa","province_code":"38"},{"code":"15796","name":"Xã Thiệu Quang","province_code":"38"},{"code":"15778","name":"Xã Thiệu Tiến","province_code":"38"},{"code":"15820","name":"Xã Thiệu Toán","province_code":"38"},{"code":"15835","name":"Xã Thiệu Trung","province_code":"38"},{"code":"15667","name":"Xã Thọ Bình","province_code":"38"},{"code":"15568","name":"Xã Thọ Lập","province_code":"38"},{"code":"15505","name":"Xã Thọ Long","province_code":"38"},{"code":"15754","name":"Xã Thọ Ngọc","province_code":"38"},{"code":"15763","name":"Xã Thọ Phú","province_code":"38"},{"code":"15499","name":"Xã Thọ Xuân","province_code":"38"},{"code":"16225","name":"Xã Thượng Ninh","province_code":"38"},{"code":"15646","name":"Xã Thường Xuân","province_code":"38"},{"code":"16549","name":"Xã Tiên Trang","province_code":"38"},{"code":"15316","name":"Xã Tống Sơn","province_code":"38"},{"code":"16021","name":"Xã Triệu Lộc","province_code":"38"},{"code":"15664","name":"Xã Triệu Sơn","province_code":"38"},{"code":"16297","name":"Xã Trung Chính","province_code":"38"},{"code":"15001","name":"Xã Trung Hạ","province_code":"38"},{"code":"14857","name":"Xã Trung Lý","province_code":"38"},{"code":"14875","name":"Xã Trung Sơn","province_code":"38"},{"code":"14872","name":"Xã Trung Thành","province_code":"38"},{"code":"16636","name":"Xã Trường Lâm","province_code":"38"},{"code":"16348","name":"Xã Trường Văn","province_code":"38"},{"code":"16363","name":"Xã Tượng Lĩnh","province_code":"38"},{"code":"15190","name":"Xã Vân Du","province_code":"38"},{"code":"16078","name":"Xã Vạn Lộc","province_code":"38"},{"code":"14974","name":"Xã Văn Nho","province_code":"38"},{"code":"15049","name":"Xã Văn Phú","province_code":"38"},{"code":"15622","name":"Xã Vạn Xuân","province_code":"38"},{"code":"15349","name":"Xã Vĩnh Lộc","province_code":"38"},{"code":"16177","name":"Xã Xuân Bình","province_code":"38"},{"code":"15658","name":"Xã Xuân Chinh","province_code":"38"},{"code":"16234","name":"Xã Xuân Du","province_code":"38"},{"code":"15520","name":"Xã Xuân Hòa","province_code":"38"},{"code":"15592","name":"Xã Xuân Lập","province_code":"38"},{"code":"16258","name":"Xã Xuân Thái","province_code":"38"},{"code":"15574","name":"Xã Xuân Tín","province_code":"38"},{"code":"15469","name":"Xã Yên Định","province_code":"38"},{"code":"15031","name":"Xã Yên Khương","province_code":"38"},{"code":"15610","name":"Xã Yên Nhân","province_code":"38"},{"code":"15442","name":"Xã Yên Ninh","province_code":"38"},{"code":"15409","name":"Xã Yên Phú","province_code":"38"},{"code":"15034","name":"Xã Yên Thắng","province_code":"38"},{"code":"16264","name":"Xã Yên Thọ","province_code":"38"},{"code":"15421","name":"Xã Yên Trường","province_code":"38"},{"code":"16732","name":"Phường Cửa Lò","province_code":"40"},{"code":"17110","name":"Phường Hoàng Mai","province_code":"40"},{"code":"17125","name":"Phường Quỳnh Mai","province_code":"40"},{"code":"17128","name":"Phường Tân Mai","province_code":"40"},{"code":"17011","name":"Phường Tây Hiếu","province_code":"40"},{"code":"16939","name":"Phường Thái Hòa","province_code":"40"},{"code":"16681","name":"Phường Thành Vinh","province_code":"40"},{"code":"16690","name":"Phường Trường Vinh","province_code":"40"},{"code":"17920","name":"Phường Vinh Hưng","province_code":"40"},{"code":"16708","name":"Phường Vinh Lộc","province_code":"40"},{"code":"16702","name":"Phường Vinh Phú","province_code":"40"},{"code":"17479","name":"Xã An Châu","province_code":"40"},{"code":"17329","name":"Xã Anh Sơn","province_code":"40"},{"code":"17365","name":"Xã Anh Sơn Đông","province_code":"40"},{"code":"16819","name":"Xã Bắc Lý","province_code":"40"},{"code":"17707","name":"Xã Bạch Hà","province_code":"40"},{"code":"17623","name":"Xã Bạch Ngọc","province_code":"40"},{"code":"17818","name":"Xã Bích Hào","province_code":"40"},{"code":"17230","name":"Xã Bình Chuẩn","province_code":"40"},{"code":"17515","name":"Xã Bình Minh","province_code":"40"},{"code":"17242","name":"Xã Cam Phục","province_code":"40"},{"code":"17728","name":"Xã Cát Ngạn","province_code":"40"},{"code":"16804","name":"Xã Châu Bình","province_code":"40"},{"code":"17044","name":"Xã Châu Hồng","province_code":"40"},{"code":"17248","name":"Xã Châu Khê","province_code":"40"},{"code":"17056","name":"Xã Châu Lộc","province_code":"40"},{"code":"16792","name":"Xã Châu Tiến","province_code":"40"},{"code":"16855","name":"Xã Chiêu Lưu","province_code":"40"},{"code":"17254","name":"Xã Con Cuông","province_code":"40"},{"code":"17713","name":"Xã Đại Đồng","province_code":"40"},{"code":"17944","name":"Xã Đại Huệ","province_code":"40"},{"code":"17464","name":"Xã Diễn Châu","province_code":"40"},{"code":"17662","name":"Xã Đô Lương","province_code":"40"},{"code":"17017","name":"Xã Đông Hiếu","province_code":"40"},{"code":"17878","name":"Xã Đông Lộc","province_code":"40"},{"code":"17530","name":"Xã Đông Thành","province_code":"40"},{"code":"17416","name":"Xã Đức Châu","province_code":"40"},{"code":"17524","name":"Xã Giai Lạc","province_code":"40"},{"code":"17278","name":"Xã Giai Xuân","province_code":"40"},{"code":"17419","name":"Xã Hải Châu","province_code":"40"},{"code":"17833","name":"Xã Hải Lộc","province_code":"40"},{"code":"17722","name":"Xã Hạnh Lâm","province_code":"40"},{"code":"17770","name":"Xã Hoa Quân","province_code":"40"},{"code":"17605","name":"Xã Hợp Minh","province_code":"40"},{"code":"16801","name":"Xã Hùng Chân","province_code":"40"},{"code":"17395","name":"Xã Hùng Châu","province_code":"40"},{"code":"18001","name":"Xã Hưng Nguyên","province_code":"40"},{"code":"18028","name":"Xã Hưng Nguyên Nam","province_code":"40"},{"code":"16828","name":"Xã Huồi Tụ","province_code":"40"},{"code":"16885","name":"Xã Hữu Khuông","province_code":"40"},{"code":"16849","name":"Xã Hữu Kiệm","province_code":"40"},{"code":"16822","name":"Xã Keng Đu","province_code":"40"},{"code":"17791","name":"Xã Kim Bảng","province_code":"40"},{"code":"17971","name":"Xã Kim Liên","province_code":"40"},{"code":"18040","name":"Xã Lam Thành","province_code":"40"},{"code":"16906","name":"Xã Lượng Minh","province_code":"40"},{"code":"17641","name":"Xã Lương Sơn","province_code":"40"},{"code":"17239","name":"Xã Mậu Thạch","province_code":"40"},{"code":"17476","name":"Xã Minh Châu","province_code":"40"},{"code":"17071","name":"Xã Minh Hợp","province_code":"40"},{"code":"17263","name":"Xã Môn Sơn","province_code":"40"},{"code":"17089","name":"Xã Mường Chọng","province_code":"40"},{"code":"17077","name":"Xã Mường Ham","province_code":"40"},{"code":"16831","name":"Xã Mường Lống","province_code":"40"},{"code":"16774","name":"Xã Mường Quàng","province_code":"40"},{"code":"16858","name":"Xã Mường Típ","province_code":"40"},{"code":"16813","name":"Xã Mường Xén","province_code":"40"},{"code":"16816","name":"Xã Mỹ Lý","province_code":"40"},{"code":"16834","name":"Xã Na Loi","province_code":"40"},{"code":"16870","name":"Xã Na Ngoi","province_code":"40"},{"code":"16837","name":"Xã Nậm Cắn","province_code":"40"},{"code":"17935","name":"Xã Nam Đàn","province_code":"40"},{"code":"16903","name":"Xã Nga My","province_code":"40"},{"code":"17827","name":"Xã Nghi Lộc","province_code":"40"},{"code":"16941","name":"Xã Nghĩa Đàn","province_code":"40"},{"code":"17284","name":"Xã Nghĩa Đồng","province_code":"40"},{"code":"17326","name":"Xã Nghĩa Hành","province_code":"40"},{"code":"16972","name":"Xã Nghĩa Hưng","province_code":"40"},{"code":"17032","name":"Xã Nghĩa Khánh","province_code":"40"},{"code":"16951","name":"Xã Nghĩa Lâm","province_code":"40"},{"code":"17029","name":"Xã Nghĩa Lộc","province_code":"40"},{"code":"16975","name":"Xã Nghĩa Mai","province_code":"40"},{"code":"16969","name":"Xã Nghĩa Thọ","province_code":"40"},{"code":"17344","name":"Xã Nhân Hòa","province_code":"40"},{"code":"16882","name":"Xã Nhôn Mai","province_code":"40"},{"code":"17857","name":"Xã Phúc Lộc","province_code":"40"},{"code":"17569","name":"Xã Quan Thành","province_code":"40"},{"code":"17443","name":"Xã Quảng Châu","province_code":"40"},{"code":"17521","name":"Xã Quang Đồng","province_code":"40"},{"code":"16738","name":"Xã Quế Phong","province_code":"40"},{"code":"16777","name":"Xã Quỳ Châu","province_code":"40"},{"code":"17035","name":"Xã Quỳ Hợp","province_code":"40"},{"code":"17176","name":"Xã Quỳnh Anh","province_code":"40"},{"code":"17179","name":"Xã Quỳnh Lưu","province_code":"40"},{"code":"17212","name":"Xã Quỳnh Phú","province_code":"40"},{"code":"17170","name":"Xã Quỳnh Sơn","province_code":"40"},{"code":"17149","name":"Xã Quỳnh Tam","province_code":"40"},{"code":"17224","name":"Xã Quỳnh Thắng","province_code":"40"},{"code":"17143","name":"Xã Quỳnh Văn","province_code":"40"},{"code":"17759","name":"Xã Sơn Lâm","province_code":"40"},{"code":"17743","name":"Xã Tam Đồng","province_code":"40"},{"code":"17059","name":"Xã Tam Hợp","province_code":"40"},{"code":"16933","name":"Xã Tam Quang","province_code":"40"},{"code":"16936","name":"Xã Tam Thái","province_code":"40"},{"code":"17305","name":"Xã Tân An","province_code":"40"},{"code":"17488","name":"Xã Tân Châu","province_code":"40"},{"code":"17266","name":"Xã Tân Kỳ","province_code":"40"},{"code":"17272","name":"Xã Tân Phú","province_code":"40"},{"code":"17842","name":"Xã Thần Lĩnh","province_code":"40"},{"code":"17335","name":"Xã Thành Bình Thọ","province_code":"40"},{"code":"17989","name":"Xã Thiên Nhẫn","province_code":"40"},{"code":"16744","name":"Xã Thông Thụ","province_code":"40"},{"code":"17689","name":"Xã Thuần Trung","province_code":"40"},{"code":"17287","name":"Xã Tiên Đồng","province_code":"40"},{"code":"16750","name":"Xã Tiền Phong","province_code":"40"},{"code":"16756","name":"Xã Tri Lễ","province_code":"40"},{"code":"17866","name":"Xã Trung Lộc","province_code":"40"},{"code":"16876","name":"Xã Tương Dương","province_code":"40"},{"code":"17950","name":"Xã Vạn An","province_code":"40"},{"code":"17560","name":"Xã Vân Du","province_code":"40"},{"code":"17677","name":"Xã Văn Hiến","province_code":"40"},{"code":"17854","name":"Xã Văn Kiều","province_code":"40"},{"code":"17611","name":"Xã Vân Tụ","province_code":"40"},{"code":"17357","name":"Xã Vĩnh Tường","province_code":"40"},{"code":"17779","name":"Xã Xuân Lâm","province_code":"40"},{"code":"16909","name":"Xã Yên Hòa","province_code":"40"},{"code":"16912","name":"Xã Yên Na","province_code":"40"},{"code":"17506","name":"Xã Yên Thành","province_code":"40"},{"code":"18007","name":"Xã Yên Trung","province_code":"40"},{"code":"17380","name":"Xã Yên Xuân","province_code":"40"},{"code":"18115","name":"Phường Bắc Hồng Lĩnh","province_code":"42"},{"code":"18652","name":"Phường Hà Huy Tập","province_code":"42"},{"code":"18781","name":"Phường Hải Ninh","province_code":"42"},{"code":"18832","name":"Phường Hoành Sơn","province_code":"42"},{"code":"18118","name":"Phường Nam Hồng Lĩnh","province_code":"42"},{"code":"18754","name":"Phường Sông Trí","province_code":"42"},{"code":"18073","name":"Phường Thành Sen","province_code":"42"},{"code":"18100","name":"Phường Trần Phú","province_code":"42"},{"code":"18823","name":"Phường Vũng Áng","province_code":"42"},{"code":"18685","name":"Xã Cẩm Bình","province_code":"42"},{"code":"18739","name":"Xã Cẩm Duệ","province_code":"42"},{"code":"18736","name":"Xã Cẩm Hưng","province_code":"42"},{"code":"18748","name":"Xã Cẩm Lạc","province_code":"42"},{"code":"18742","name":"Xã Cẩm Trung","province_code":"42"},{"code":"18673","name":"Xã Cẩm Xuyên","province_code":"42"},{"code":"18406","name":"Xã Can Lộc","province_code":"42"},{"code":"18394","name":"Xã Cổ Đạm","province_code":"42"},{"code":"18364","name":"Xã Đan Hải","province_code":"42"},{"code":"18586","name":"Xã Đông Kinh","province_code":"42"},{"code":"18484","name":"Xã Đồng Lộc","province_code":"42"},{"code":"18619","name":"Xã Đồng Tiến","province_code":"42"},{"code":"18304","name":"Xã Đức Đồng","province_code":"42"},{"code":"18244","name":"Xã Đức Minh","province_code":"42"},{"code":"18262","name":"Xã Đức Quang","province_code":"42"},{"code":"18277","name":"Xã Đức Thịnh","province_code":"42"},{"code":"18229","name":"Xã Đức Thọ","province_code":"42"},{"code":"18466","name":"Xã Gia Hanh","province_code":"42"},{"code":"18502","name":"Xã Hà Linh","province_code":"42"},{"code":"18409","name":"Xã Hồng Lộc","province_code":"42"},{"code":"18523","name":"Xã Hương Bình","province_code":"42"},{"code":"18550","name":"Xã Hương Đô","province_code":"42"},{"code":"18496","name":"Xã Hương Khê","province_code":"42"},{"code":"18532","name":"Xã Hương Phố","province_code":"42"},{"code":"18133","name":"Xã Hương Sơn","province_code":"42"},{"code":"18544","name":"Xã Hương Xuân","province_code":"42"},{"code":"18223","name":"Xã Kim Hoa","province_code":"42"},{"code":"18775","name":"Xã Kỳ Anh","province_code":"42"},{"code":"18814","name":"Xã Kỳ Hoa","province_code":"42"},{"code":"18790","name":"Xã Kỳ Khang","province_code":"42"},{"code":"18838","name":"Xã Kỳ Lạc","province_code":"42"},{"code":"18844","name":"Xã Kỳ Thượng","province_code":"42"},{"code":"18787","name":"Xã Kỳ Văn","province_code":"42"},{"code":"18766","name":"Xã Kỳ Xuân","province_code":"42"},{"code":"18568","name":"Xã Lộc Hà","province_code":"42"},{"code":"18322","name":"Xã Mai Hoa","province_code":"42"},{"code":"18583","name":"Xã Mai Phụ","province_code":"42"},{"code":"18352","name":"Xã Nghi Xuân","province_code":"42"},{"code":"18547","name":"Xã Phúc Trạch","province_code":"42"},{"code":"18184","name":"Xã Sơn Giang","province_code":"42"},{"code":"18160","name":"Xã Sơn Hồng","province_code":"42"},{"code":"18196","name":"Xã Sơn Kim 1","province_code":"42"},{"code":"18199","name":"Xã Sơn Kim 2","province_code":"42"},{"code":"18172","name":"Xã Sơn Tây","province_code":"42"},{"code":"18163","name":"Xã Sơn Tiến","province_code":"42"},{"code":"18562","name":"Xã Thạch Hà","province_code":"42"},{"code":"18604","name":"Xã Thạch Khê","province_code":"42"},{"code":"18628","name":"Xã Thạch Lạc","province_code":"42"},{"code":"18667","name":"Xã Thạch Xuân","province_code":"42"},{"code":"18676","name":"Xã Thiên Cầm","province_code":"42"},{"code":"18328","name":"Xã Thượng Đức","province_code":"42"},{"code":"18373","name":"Xã Tiên Điền","province_code":"42"},{"code":"18634","name":"Xã Toàn Lưu","province_code":"42"},{"code":"18436","name":"Xã Trường Lưu","province_code":"42"},{"code":"18202","name":"Xã Tứ Mỹ","province_code":"42"},{"code":"18418","name":"Xã Tùng Lộc","province_code":"42"},{"code":"18601","name":"Xã Việt Xuyên","province_code":"42"},{"code":"18313","name":"Xã Vũ Quang","province_code":"42"},{"code":"18481","name":"Xã Xuân Lộc","province_code":"42"},{"code":"18682","name":"Xã Yên Hòa","province_code":"42"},{"code":"19742","name":"Đặc khu Cồn Cỏ","province_code":"44"},{"code":"19009","name":"Phường Ba Đồn","province_code":"44"},{"code":"19066","name":"Phường Bắc Gianh","province_code":"44"},{"code":"19333","name":"Phường Đông Hà","province_code":"44"},{"code":"18880","name":"Phường Đồng Hới","province_code":"44"},{"code":"18871","name":"Phường Đồng Sơn","province_code":"44"},{"code":"18859","name":"Phường Đồng Thuận","province_code":"44"},{"code":"19351","name":"Phường Nam Đông Hà","province_code":"44"},{"code":"19360","name":"Phường Quảng Trị","province_code":"44"},{"code":"19483","name":"Xã A Dơi","province_code":"44"},{"code":"19669","name":"Xã Ái Tử","province_code":"44"},{"code":"19567","name":"Xã Ba Lòng","province_code":"44"},{"code":"19126","name":"Xã Bắc Trạch","province_code":"44"},{"code":"19501","name":"Xã Bến Hải","province_code":"44"},{"code":"19366","name":"Xã Bến Quan","province_code":"44"},{"code":"19141","name":"Xã Bố Trạch","province_code":"44"},{"code":"19255","name":"Xã Cam Hồng","province_code":"44"},{"code":"19597","name":"Xã Cam Lộ","province_code":"44"},{"code":"19537","name":"Xã Cồn Tiên","province_code":"44"},{"code":"19414","name":"Xã Cửa Tùng","province_code":"44"},{"code":"19496","name":"Xã Cửa Việt","province_code":"44"},{"code":"19564","name":"Xã Đakrông","province_code":"44"},{"code":"18904","name":"Xã Dân Hóa","province_code":"44"},{"code":"19681","name":"Xã Diên Sanh","province_code":"44"},{"code":"18949","name":"Xã Đồng Lê","province_code":"44"},{"code":"19159","name":"Xã Đông Trạch","province_code":"44"},{"code":"19495","name":"Xã Gio Linh","province_code":"44"},{"code":"19702","name":"Xã Hải Lăng","province_code":"44"},{"code":"19603","name":"Xã Hiếu Giang","province_code":"44"},{"code":"19033","name":"Xã Hòa Trạch","province_code":"44"},{"code":"19111","name":"Xã Hoàn Lão","province_code":"44"},{"code":"19555","name":"Xã Hướng Hiệp","province_code":"44"},{"code":"19435","name":"Xã Hướng Lập","province_code":"44"},{"code":"19441","name":"Xã Hướng Phùng","province_code":"44"},{"code":"19429","name":"Xã Khe Sanh","province_code":"44"},{"code":"18922","name":"Xã Kim Điền","province_code":"44"},{"code":"19318","name":"Xã Kim Ngân","province_code":"44"},{"code":"18943","name":"Xã Kim Phú","province_code":"44"},{"code":"19594","name":"Xã La Lay","province_code":"44"},{"code":"19432","name":"Xã Lao Bảo","province_code":"44"},{"code":"19246","name":"Xã Lệ Ninh","province_code":"44"},{"code":"19249","name":"Xã Lệ Thủy","province_code":"44"},{"code":"19489","name":"Xã Lìa","province_code":"44"},{"code":"18901","name":"Xã Minh Hóa","province_code":"44"},{"code":"19741","name":"Xã Mỹ Thủy","province_code":"44"},{"code":"19075","name":"Xã Nam Ba Đồn","province_code":"44"},{"code":"19639","name":"Xã Nam Cửa Việt","province_code":"44"},{"code":"19093","name":"Xã Nam Gianh","province_code":"44"},{"code":"19735","name":"Xã Nam Hải Lăng","province_code":"44"},{"code":"19198","name":"Xã Nam Trạch","province_code":"44"},{"code":"19225","name":"Xã Ninh Châu","province_code":"44"},{"code":"19138","name":"Xã Phong Nha","province_code":"44"},{"code":"19021","name":"Xã Phú Trạch","province_code":"44"},{"code":"19207","name":"Xã Quảng Ninh","province_code":"44"},{"code":"19057","name":"Xã Quảng Trạch","province_code":"44"},{"code":"19288","name":"Xã Sen Ngư","province_code":"44"},{"code":"19588","name":"Xã Tà Rụt","province_code":"44"},{"code":"19051","name":"Xã Tân Gianh","province_code":"44"},{"code":"19462","name":"Xã Tân Lập","province_code":"44"},{"code":"19291","name":"Xã Tân Mỹ","province_code":"44"},{"code":"18919","name":"Xã Tân Thành","province_code":"44"},{"code":"19147","name":"Xã Thượng Trạch","province_code":"44"},{"code":"19645","name":"Xã Triệu Bình","province_code":"44"},{"code":"19654","name":"Xã Triệu Cơ","province_code":"44"},{"code":"19624","name":"Xã Triệu Phong","province_code":"44"},{"code":"19030","name":"Xã Trung Thuần","province_code":"44"},{"code":"19237","name":"Xã Trường Ninh","province_code":"44"},{"code":"19309","name":"Xã Trường Phú","province_code":"44"},{"code":"19204","name":"Xã Trường Sơn","province_code":"44"},{"code":"18991","name":"Xã Tuyên Bình","province_code":"44"},{"code":"18997","name":"Xã Tuyên Hóa","province_code":"44"},{"code":"18958","name":"Xã Tuyên Lâm","province_code":"44"},{"code":"18985","name":"Xã Tuyên Phú","province_code":"44"},{"code":"18952","name":"Xã Tuyên Sơn","province_code":"44"},{"code":"19699","name":"Xã Vĩnh Định","province_code":"44"},{"code":"19372","name":"Xã Vĩnh Hoàng","province_code":"44"},{"code":"19363","name":"Xã Vĩnh Linh","province_code":"44"},{"code":"19405","name":"Xã Vĩnh Thủy","province_code":"44"},{"code":"07210","name":"Phường Bắc Giang","province_code":"24"},{"code":"09295","name":"Phường Bồng Lai","province_code":"24"},{"code":"07738","name":"Phường Cảnh Thụy","province_code":"24"},{"code":"07525","name":"Phường Chũ","province_code":"24"},{"code":"07228","name":"Phường Đa Mai","province_code":"24"},{"code":"09301","name":"Phường Đào Viên","province_code":"24"},{"code":"09385","name":"Phường Đồng Nguyên","province_code":"24"},{"code":"09325","name":"Phường Hạp Lĩnh","province_code":"24"},{"code":"09187","name":"Phường Kinh Bắc","province_code":"24"},{"code":"09409","name":"Phường Mão Điền","province_code":"24"},{"code":"09286","name":"Phường Nam Sơn","province_code":"24"},{"code":"07795","name":"Phường Nếnh","province_code":"24"},{"code":"09253","name":"Phường Nhân Hòa","province_code":"24"},{"code":"09445","name":"Phường Ninh Xá","province_code":"24"},{"code":"09379","name":"Phường Phù Khê","province_code":"24"},{"code":"09265","name":"Phường Phương Liễu","province_code":"24"},{"code":"07612","name":"Phường Phượng Sơn","province_code":"24"},{"code":"09247","name":"Phường Quế Võ","province_code":"24"},{"code":"09433","name":"Phường Song Liễu","province_code":"24"},{"code":"09370","name":"Phường Tam Sơn","province_code":"24"},{"code":"07682","name":"Phường Tân An","province_code":"24"},{"code":"07699","name":"Phường Tân Tiến","province_code":"24"},{"code":"09400","name":"Phường Thuận Thành","province_code":"24"},{"code":"07696","name":"Phường Tiền Phong","province_code":"24"},{"code":"09430","name":"Phường Trạm Lộ","province_code":"24"},{"code":"09427","name":"Phường Trí Quả","province_code":"24"},{"code":"07774","name":"Phường Tự Lạn","province_code":"24"},{"code":"09367","name":"Phường Từ Sơn","province_code":"24"},{"code":"07798","name":"Phường Vân Hà","province_code":"24"},{"code":"07777","name":"Phường Việt Yên","province_code":"24"},{"code":"09190","name":"Phường Võ Cường","province_code":"24"},{"code":"09169","name":"Phường Vũ Ninh","province_code":"24"},{"code":"07681","name":"Phường Yên Dũng","province_code":"24"},{"code":"07654","name":"Xã An Lạc","province_code":"24"},{"code":"07498","name":"Xã Bắc Lũng","province_code":"24"},{"code":"07462","name":"Xã Bảo Đài","province_code":"24"},{"code":"07573","name":"Xã Biển Động","province_code":"24"},{"code":"07537","name":"Xã Biên Sơn","province_code":"24"},{"code":"07294","name":"Xã Bố Hạ","province_code":"24"},{"code":"07519","name":"Xã Cẩm Lý","province_code":"24"},{"code":"09466","name":"Xã Cao Đức","province_code":"24"},{"code":"09313","name":"Xã Chi Lăng","province_code":"24"},{"code":"09340","name":"Xã Đại Đồng","province_code":"24"},{"code":"09469","name":"Xã Đại Lai","province_code":"24"},{"code":"07627","name":"Xã Đại Sơn","province_code":"24"},{"code":"07594","name":"Xã Đèo Gia","province_code":"24"},{"code":"09487","name":"Xã Đông Cứu","province_code":"24"},{"code":"07282","name":"Xã Đồng Kỳ","province_code":"24"},{"code":"07450","name":"Xã Đông Phú","province_code":"24"},{"code":"07735","name":"Xã Đồng Việt","province_code":"24"},{"code":"07672","name":"Xã Dương Hưu","province_code":"24"},{"code":"09454","name":"Xã Gia Bình","province_code":"24"},{"code":"07840","name":"Xã Hiệp Hòa","province_code":"24"},{"code":"07822","name":"Xã Hoàng Vân","province_code":"24"},{"code":"07864","name":"Xã Hợp Thịnh","province_code":"24"},{"code":"07399","name":"Xã Kép","province_code":"24"},{"code":"07552","name":"Xã Kiên Lao","province_code":"24"},{"code":"09529","name":"Xã Lâm Thao","province_code":"24"},{"code":"07375","name":"Xã Lạng Giang","province_code":"24"},{"code":"09334","name":"Xã Liên Bão","province_code":"24"},{"code":"07444","name":"Xã Lục Nam","province_code":"24"},{"code":"07582","name":"Xã Lục Ngạn","province_code":"24"},{"code":"07492","name":"Xã Lục Sơn","province_code":"24"},{"code":"09496","name":"Xã Lương Tài","province_code":"24"},{"code":"07420","name":"Xã Mỹ Thái","province_code":"24"},{"code":"07603","name":"Xã Nam Dương","province_code":"24"},{"code":"07486","name":"Xã Nghĩa Phương","province_code":"24"},{"code":"07351","name":"Xã Ngọc Thiện","province_code":"24"},{"code":"07306","name":"Xã Nhã Nam","province_code":"24"},{"code":"09475","name":"Xã Nhân Thắng","province_code":"24"},{"code":"09349","name":"Xã Phật Tích","province_code":"24"},{"code":"09292","name":"Xã Phù Lãng","province_code":"24"},{"code":"07330","name":"Xã Phúc Hòa","province_code":"24"},{"code":"07333","name":"Xã Quang Trung","province_code":"24"},{"code":"07534","name":"Xã Sa Lý","province_code":"24"},{"code":"07615","name":"Xã Sơn Động","province_code":"24"},{"code":"07543","name":"Xã Sơn Hải","province_code":"24"},{"code":"09208","name":"Xã Tam Đa","province_code":"24"},{"code":"09202","name":"Xã Tam Giang","province_code":"24"},{"code":"07264","name":"Xã Tam Tiến","province_code":"24"},{"code":"09343","name":"Xã Tân Chi","province_code":"24"},{"code":"07432","name":"Xã Tân Dĩnh","province_code":"24"},{"code":"07531","name":"Xã Tân Sơn","province_code":"24"},{"code":"07339","name":"Xã Tân Yên","province_code":"24"},{"code":"07616","name":"Xã Tây Yên Tử","province_code":"24"},{"code":"09319","name":"Xã Tiên Du","province_code":"24"},{"code":"07381","name":"Xã Tiên Lục","province_code":"24"},{"code":"09523","name":"Xã Trung Chính","province_code":"24"},{"code":"09499","name":"Xã Trung Kênh","province_code":"24"},{"code":"07489","name":"Xã Trường Sơn","province_code":"24"},{"code":"07663","name":"Xã Tuấn Đạo","province_code":"24"},{"code":"09238","name":"Xã Văn Môn","province_code":"24"},{"code":"07621","name":"Xã Vân Sơn","province_code":"24"},{"code":"07870","name":"Xã Xuân Cẩm","province_code":"24"},{"code":"07246","name":"Xã Xuân Lương","province_code":"24"},{"code":"07642","name":"Xã Yên Định","province_code":"24"},{"code":"09193","name":"Xã Yên Phong","province_code":"24"},{"code":"07288","name":"Xã Yên Thế","province_code":"24"},{"code":"09205","name":"Xã Yên Trung","province_code":"24"},{"code":"19815","name":"Phường An Cựu","province_code":"46"},{"code":"19909","name":"Phường Dương Nỗ","province_code":"46"},{"code":"20014","name":"Phường Hóa Châu","province_code":"46"},{"code":"19804","name":"Phường Hương An","province_code":"46"},{"code":"19975","name":"Phường Hương Thủy","province_code":"46"},{"code":"19996","name":"Phường Hương Trà","province_code":"46"},{"code":"19774","name":"Phường Kim Long","province_code":"46"},{"code":"20017","name":"Phường Kim Trà","province_code":"46"},{"code":"19930","name":"Phường Mỹ Thượng","province_code":"46"},{"code":"19819","name":"Phường Phong Điền","province_code":"46"},{"code":"19831","name":"Phường Phong Dinh","province_code":"46"},{"code":"19828","name":"Phường Phong Phú","province_code":"46"},{"code":"19873","name":"Phường Phong Quảng","province_code":"46"},{"code":"19858","name":"Phường Phong Thái","province_code":"46"},{"code":"19960","name":"Phường Phú Bài","province_code":"46"},{"code":"19753","name":"Phường Phú Xuân","province_code":"46"},{"code":"19969","name":"Phường Thanh Thủy","province_code":"46"},{"code":"19900","name":"Phường Thuận An","province_code":"46"},{"code":"19789","name":"Phường Thuận Hóa","province_code":"46"},{"code":"19813","name":"Phường Thủy Xuân","province_code":"46"},{"code":"19777","name":"Phường Vỹ Dạ","province_code":"46"},{"code":"20056","name":"Xã A Lưới 1","province_code":"46"},{"code":"20044","name":"Xã A Lưới 2","province_code":"46"},{"code":"20071","name":"Xã A Lưới 3","province_code":"46"},{"code":"20101","name":"Xã A Lưới 4","province_code":"46"},{"code":"20050","name":"Xã A Lưới 5","province_code":"46"},{"code":"20035","name":"Xã Bình Điền","province_code":"46"},{"code":"20137","name":"Xã Chân Mây - Lăng Cô","province_code":"46"},{"code":"19885","name":"Xã Đan Điền","province_code":"46"},{"code":"20131","name":"Xã Hưng Lộc","province_code":"46"},{"code":"20161","name":"Xã Khe Tre","province_code":"46"},{"code":"20140","name":"Xã Lộc An","province_code":"46"},{"code":"20182","name":"Xã Long Quảng","province_code":"46"},{"code":"20179","name":"Xã Nam Đông","province_code":"46"},{"code":"19918","name":"Xã Phú Hồ","province_code":"46"},{"code":"20107","name":"Xã Phú Lộc","province_code":"46"},{"code":"19942","name":"Xã Phú Vang","province_code":"46"},{"code":"19945","name":"Xã Phú Vinh","province_code":"46"},{"code":"19867","name":"Xã Quảng Điền","province_code":"46"},{"code":"20122","name":"Xã Vinh Lộc","province_code":"46"},{"code":"20333","name":"Đặc khu Hoàng Sa","province_code":"48"},{"code":"20275","name":"Phường An Hải","province_code":"48"},{"code":"20305","name":"Phường An Khê","province_code":"48"},{"code":"20575","name":"Phường An Thắng","province_code":"48"},{"code":"20335","name":"Phường Bàn Thạch","province_code":"48"},{"code":"20260","name":"Phường Cẩm Lệ","province_code":"48"},{"code":"20551","name":"Phường Điện Bàn","province_code":"48"},{"code":"20557","name":"Phường Điện Bàn Bắc","province_code":"48"},{"code":"20579","name":"Phường Điện Bàn Đông","province_code":"48"},{"code":"20242","name":"Phường Hải Châu","province_code":"48"},{"code":"20194","name":"Phường Hải Vân","province_code":"48"},{"code":"20257","name":"Phường Hòa Cường","province_code":"48"},{"code":"20200","name":"Phường Hòa Khánh","province_code":"48"},{"code":"20314","name":"Phường Hòa Xuân","province_code":"48"},{"code":"20410","name":"Phường Hội An","province_code":"48"},{"code":"20413","name":"Phường Hội An Đông","province_code":"48"},{"code":"20401","name":"Phường Hội An Tây","province_code":"48"},{"code":"20350","name":"Phường Hương Trà","province_code":"48"},{"code":"20197","name":"Phường Liên Chiểu","province_code":"48"},{"code":"20285","name":"Phường Ngũ Hành Sơn","province_code":"48"},{"code":"20356","name":"Phường Quảng Phú","province_code":"48"},{"code":"20263","name":"Phường Sơn Trà","province_code":"48"},{"code":"20341","name":"Phường Tam Kỳ","province_code":"48"},{"code":"20209","name":"Phường Thanh Khê","province_code":"48"},{"code":"20458","name":"Xã Avương","province_code":"48"},{"code":"20308","name":"Xã Bà Nà","province_code":"48"},{"code":"20710","name":"Xã Bến Giằng","province_code":"48"},{"code":"20494","name":"Xã Bến Hiên","province_code":"48"},{"code":"20364","name":"Xã Chiên Đàn","province_code":"48"},{"code":"20716","name":"Xã Đắc Pring","province_code":"48"},{"code":"20500","name":"Xã Đại Lộc","province_code":"48"},{"code":"20569","name":"Xã Điện Bàn Tây","province_code":"48"},{"code":"20818","name":"Xã Đồng Dương","province_code":"48"},{"code":"20467","name":"Xã Đông Giang","province_code":"48"},{"code":"20977","name":"Xã Đức Phú","province_code":"48"},{"code":"20635","name":"Xã Duy Nghĩa","province_code":"48"},{"code":"20623","name":"Xã Duy Xuyên","province_code":"48"},{"code":"20587","name":"Xã Gò Nổi","province_code":"48"},{"code":"20515","name":"Xã Hà Nha","province_code":"48"},{"code":"20779","name":"Xã Hiệp Đức","province_code":"48"},{"code":"20332","name":"Xã Hòa Tiến","province_code":"48"},{"code":"20320","name":"Xã Hòa Vang","province_code":"48"},{"code":"20443","name":"Xã Hùng Sơn","province_code":"48"},{"code":"20722","name":"Xã Khâm Đức","province_code":"48"},{"code":"20704","name":"Xã La Dêê","province_code":"48"},{"code":"20698","name":"Xã La Êê","province_code":"48"},{"code":"20875","name":"Xã Lãnh Ngọc","province_code":"48"},{"code":"20707","name":"Xã Nam Giang","province_code":"48"},{"code":"20599","name":"Xã Nam Phước","province_code":"48"},{"code":"20944","name":"Xã Nam Trà My","province_code":"48"},{"code":"20656","name":"Xã Nông Sơn","province_code":"48"},{"code":"20965","name":"Xã Núi Thành","province_code":"48"},{"code":"20392","name":"Xã Phú Ninh","province_code":"48"},{"code":"20542","name":"Xã Phú Thuận","province_code":"48"},{"code":"20740","name":"Xã Phước Chánh","province_code":"48"},{"code":"20728","name":"Xã Phước Hiệp","province_code":"48"},{"code":"20734","name":"Xã Phước Năng","province_code":"48"},{"code":"20752","name":"Xã Phước Thành","province_code":"48"},{"code":"20770","name":"Xã Phước Trà","province_code":"48"},{"code":"20669","name":"Xã Quế Phước","province_code":"48"},{"code":"20641","name":"Xã Quế Sơn","province_code":"48"},{"code":"20662","name":"Xã Quế Sơn Trung","province_code":"48"},{"code":"20857","name":"Xã Sơn Cẩm Hà","province_code":"48"},{"code":"20476","name":"Xã Sông Kôn","province_code":"48"},{"code":"20485","name":"Xã Sông Vàng","province_code":"48"},{"code":"20984","name":"Xã Tam Anh","province_code":"48"},{"code":"20992","name":"Xã Tam Hải","province_code":"48"},{"code":"21004","name":"Xã Tam Mỹ","province_code":"48"},{"code":"20971","name":"Xã Tam Xuân","province_code":"48"},{"code":"20434","name":"Xã Tân Hiệp","province_code":"48"},{"code":"20455","name":"Xã Tây Giang","province_code":"48"},{"code":"20380","name":"Xã Tây Hồ","province_code":"48"},{"code":"20794","name":"Xã Thăng An","province_code":"48"},{"code":"20791","name":"Xã Thăng Bình","province_code":"48"},{"code":"20848","name":"Xã Thăng Điền","province_code":"48"},{"code":"20827","name":"Xã Thăng Phú","province_code":"48"},{"code":"20836","name":"Xã Thăng Trường","province_code":"48"},{"code":"20878","name":"Xã Thạnh Bình","province_code":"48"},{"code":"20695","name":"Xã Thạnh Mỹ","province_code":"48"},{"code":"20611","name":"Xã Thu Bồn","province_code":"48"},{"code":"20506","name":"Xã Thượng Đức","province_code":"48"},{"code":"20854","name":"Xã Tiên Phước","province_code":"48"},{"code":"20920","name":"Xã Trà Đốc","province_code":"48"},{"code":"20929","name":"Xã Trà Giáp","province_code":"48"},{"code":"20938","name":"Xã Trà Leng","province_code":"48"},{"code":"20908","name":"Xã Trà Liên","province_code":"48"},{"code":"20950","name":"Xã Trà Linh","province_code":"48"},{"code":"20900","name":"Xã Trà My","province_code":"48"},{"code":"20923","name":"Xã Trà Tân","province_code":"48"},{"code":"20941","name":"Xã Trà Tập","province_code":"48"},{"code":"20959","name":"Xã Trà Vân","province_code":"48"},{"code":"20767","name":"Xã Việt An","province_code":"48"},{"code":"20539","name":"Xã Vu Gia","province_code":"48"},{"code":"20650","name":"Xã Xuân Phú","province_code":"48"},{"code":"21548","name":"Đặc khu Lý Sơn","province_code":"51"},{"code":"21025","name":"Phường Cẩm Thành","province_code":"51"},{"code":"23302","name":"Phường Đăk Bla","province_code":"51"},{"code":"23284","name":"Phường Đăk Cấm","province_code":"51"},{"code":"21439","name":"Phường Đức Phổ","province_code":"51"},{"code":"23293","name":"Phường Kon Tum","province_code":"51"},{"code":"21028","name":"Phường Nghĩa Lộ","province_code":"51"},{"code":"21478","name":"Phường Sa Huỳnh","province_code":"51"},{"code":"21451","name":"Phường Trà Câu","province_code":"51"},{"code":"21172","name":"Phường Trương Quang Trọng","province_code":"51"},{"code":"21034","name":"Xã An Phú","province_code":"51"},{"code":"21499","name":"Xã Ba Dinh","province_code":"51"},{"code":"21496","name":"Xã Ba Động","province_code":"51"},{"code":"21205","name":"Xã Ba Gia","province_code":"51"},{"code":"21523","name":"Xã Ba Tô","province_code":"51"},{"code":"21484","name":"Xã Ba Tơ","province_code":"51"},{"code":"21529","name":"Xã Ba Vì","province_code":"51"},{"code":"21490","name":"Xã Ba Vinh","province_code":"51"},{"code":"21538","name":"Xã Ba Xa","province_code":"51"},{"code":"21100","name":"Xã Bình Chương","province_code":"51"},{"code":"21085","name":"Xã Bình Minh","province_code":"51"},{"code":"21040","name":"Xã Bình Sơn","province_code":"51"},{"code":"23377","name":"Xã Bờ Y","province_code":"51"},{"code":"21136","name":"Xã Cà Đam","province_code":"51"},{"code":"23500","name":"Xã Đăk Hà","province_code":"51"},{"code":"23485","name":"Xã Đăk Kôi","province_code":"51"},{"code":"23368","name":"Xã Đăk Long","province_code":"51"},{"code":"23512","name":"Xã Đăk Mar","province_code":"51"},{"code":"23374","name":"Xã Đăk Môn","province_code":"51"},{"code":"23341","name":"Xã Đăk Pék","province_code":"51"},{"code":"23344","name":"Xã Đăk Plô","province_code":"51"},{"code":"23504","name":"Xã Đăk Pxi","province_code":"51"},{"code":"23332","name":"Xã Đăk Rơ Wa","province_code":"51"},{"code":"23479","name":"Xã Đăk Rve","province_code":"51"},{"code":"23416","name":"Xã Đăk Sao","province_code":"51"},{"code":"23401","name":"Xã Đăk Tô","province_code":"51"},{"code":"23419","name":"Xã Đăk Tờ Kan","province_code":"51"},{"code":"23510","name":"Xã Đăk Ui","province_code":"51"},{"code":"21520","name":"Xã Đặng Thùy Trâm","province_code":"51"},{"code":"21385","name":"Xã Đình Cương","province_code":"51"},{"code":"21109","name":"Xã Đông Sơn","province_code":"51"},{"code":"21127","name":"Xã Đông Trà Bồng","province_code":"51"},{"code":"23383","name":"Xã Dục Nông","province_code":"51"},{"code":"23326","name":"Xã la Chim","province_code":"51"},{"code":"23535","name":"Xã la Đal","province_code":"51"},{"code":"23538","name":"Xã la Tơi","province_code":"51"},{"code":"21472","name":"Xã Khánh Cường","province_code":"51"},{"code":"23497","name":"Xã Kon Braih","province_code":"51"},{"code":"23430","name":"Xã Kon Đào","province_code":"51"},{"code":"23476","name":"Xã Kon Plông","province_code":"51"},{"code":"21433","name":"Xã Lân Phong","province_code":"51"},{"code":"21409","name":"Xã Long Phụng","province_code":"51"},{"code":"23455","name":"Xã Măng Bút","province_code":"51"},{"code":"23473","name":"Xã Măng Đen","province_code":"51"},{"code":"23446","name":"Xã Măng Ri","province_code":"51"},{"code":"21361","name":"Xã Minh Long","province_code":"51"},{"code":"21421","name":"Xã Mỏ Cày","province_code":"51"},{"code":"21400","name":"Xã Mộ Đức","province_code":"51"},{"code":"23536","name":"Xã Mô Rai","province_code":"51"},{"code":"21250","name":"Xã Nghĩa Giang","province_code":"51"},{"code":"21364","name":"Xã Nghĩa Hành","province_code":"51"},{"code":"23365","name":"Xã Ngọc Linh","province_code":"51"},{"code":"23317","name":"Xã Ngọk Bay","province_code":"51"},{"code":"23515","name":"Xã Ngọk Réo","province_code":"51"},{"code":"23428","name":"Xã Ngọk Tụ","province_code":"51"},{"code":"21457","name":"Xã Nguyễn Nghiêm","province_code":"51"},{"code":"21370","name":"Xã Phước Giang","province_code":"51"},{"code":"23530","name":"Xã Rờ Kơi","province_code":"51"},{"code":"23534","name":"Xã Sa Bình","province_code":"51"},{"code":"23392","name":"Xã Sa Loong","province_code":"51"},{"code":"23527","name":"Xã Sa Thầy","province_code":"51"},{"code":"21289","name":"Xã Sơn Hà","province_code":"51"},{"code":"21292","name":"Xã Sơn Hạ","province_code":"51"},{"code":"21325","name":"Xã Sơn Kỳ","province_code":"51"},{"code":"21307","name":"Xã Sơn Linh","province_code":"51"},{"code":"21349","name":"Xã Sơn Mai","province_code":"51"},{"code":"21340","name":"Xã Sơn Tây","province_code":"51"},{"code":"21343","name":"Xã Sơn Tây Hạ","province_code":"51"},{"code":"21334","name":"Xã Sơn Tây Thượng","province_code":"51"},{"code":"21319","name":"Xã Sơn Thủy","province_code":"51"},{"code":"21220","name":"Xã Sơn Tịnh","province_code":"51"},{"code":"21154","name":"Xã Tây Trà","province_code":"51"},{"code":"21157","name":"Xã Tây Trà Bồng","province_code":"51"},{"code":"21124","name":"Xã Thanh Bồng","province_code":"51"},{"code":"21388","name":"Xã Thiện Tín","province_code":"51"},{"code":"21181","name":"Xã Thọ Phong","province_code":"51"},{"code":"21211","name":"Xã Tịnh Khê","province_code":"51"},{"code":"21115","name":"Xã Trà Bồng","province_code":"51"},{"code":"21244","name":"Xã Trà Giang","province_code":"51"},{"code":"21196","name":"Xã Trường Giang","province_code":"51"},{"code":"23425","name":"Xã Tu Mơ Rông","province_code":"51"},{"code":"21235","name":"Xã Tư Nghĩa","province_code":"51"},{"code":"21061","name":"Xã Vạn Tường","province_code":"51"},{"code":"21238","name":"Xã Vệ Giang","province_code":"51"},{"code":"23356","name":"Xã Xốp","province_code":"51"},{"code":"23548","name":"Xã Ya Ly","province_code":"51"},{"code":"22736","name":"Đặc khu Trường Sa","province_code":"56"},{"code":"22423","name":"Phường Ba Ngòi","province_code":"56"},{"code":"22411","name":"Phường Bắc Cam Ranh","province_code":"56"},{"code":"22333","name":"Phường Bắc Nha Trang","province_code":"56"},{"code":"22741","name":"Phường Bảo An","province_code":"56"},{"code":"22432","name":"Phường Cam Linh","province_code":"56"},{"code":"22420","name":"Phường Cam Ranh","province_code":"56"},{"code":"22738","name":"Phường Đô Vinh","province_code":"56"},{"code":"22780","name":"Phường Đông Hải","province_code":"56"},{"code":"22561","name":"Phường Đông Ninh Hòa","province_code":"56"},{"code":"22591","name":"Phường Hòa Thắng","province_code":"56"},{"code":"22402","name":"Phường Nam Nha Trang","province_code":"56"},{"code":"22366","name":"Phường Nha Trang","province_code":"56"},{"code":"22834","name":"Phường Ninh Chử","province_code":"56"},{"code":"22528","name":"Phường Ninh Hòa","province_code":"56"},{"code":"22759","name":"Phường Phan Rang","province_code":"56"},{"code":"22390","name":"Phường Tây Nha Trang","province_code":"56"},{"code":"22828","name":"Xã Anh Dũng","province_code":"56"},{"code":"22795","name":"Xã Bác Ái","province_code":"56"},{"code":"22801","name":"Xã Bác Ái Đông","province_code":"56"},{"code":"22786","name":"Xã Bác Ái Tây","province_code":"56"},{"code":"22615","name":"Xã Bắc Khánh Vĩnh","province_code":"56"},{"code":"22546","name":"Xã Bắc Ninh Hòa","province_code":"56"},{"code":"22909","name":"Xã Cà Ná","province_code":"56"},{"code":"22465","name":"Xã Cam An","province_code":"56"},{"code":"22435","name":"Xã Cam Hiệp","province_code":"56"},{"code":"22453","name":"Xã Cam Lâm","province_code":"56"},{"code":"22840","name":"Xã Công Hải","province_code":"56"},{"code":"22504","name":"Xã Đại Lãnh","province_code":"56"},{"code":"22657","name":"Xã Diên Điền","province_code":"56"},{"code":"22651","name":"Xã Diên Khánh","province_code":"56"},{"code":"22678","name":"Xã Diên Lạc","province_code":"56"},{"code":"22660","name":"Xã Diên Lâm","province_code":"56"},{"code":"22672","name":"Xã Diên Thọ","province_code":"56"},{"code":"22732","name":"Xã Đông Khánh Sơn","province_code":"56"},{"code":"22558","name":"Xã Hòa Trí","province_code":"56"},{"code":"22714","name":"Xã Khánh Sơn","province_code":"56"},{"code":"22609","name":"Xã Khánh Vĩnh","province_code":"56"},{"code":"22813","name":"Xã Lâm Sơn","province_code":"56"},{"code":"22822","name":"Xã Mỹ Sơn","province_code":"56"},{"code":"22480","name":"Xã Nam Cam Ranh","province_code":"56"},{"code":"22648","name":"Xã Nam Khánh Vĩnh","province_code":"56"},{"code":"22597","name":"Xã Nam Ninh Hòa","province_code":"56"},{"code":"22852","name":"Xã Ninh Hải","province_code":"56"},{"code":"22870","name":"Xã Ninh Phước","province_code":"56"},{"code":"22810","name":"Xã Ninh Sơn","province_code":"56"},{"code":"22888","name":"Xã Phước Dinh","province_code":"56"},{"code":"22900","name":"Xã Phước Hà","province_code":"56"},{"code":"22873","name":"Xã Phước Hậu","province_code":"56"},{"code":"22891","name":"Xã Phước Hữu","province_code":"56"},{"code":"22708","name":"Xã Suối Dầu","province_code":"56"},{"code":"22702","name":"Xã Suối Hiệp","province_code":"56"},{"code":"22576","name":"Xã Tân Định","province_code":"56"},{"code":"22720","name":"Xã Tây Khánh Sơn","province_code":"56"},{"code":"22624","name":"Xã Tây Khánh Vĩnh","province_code":"56"},{"code":"22552","name":"Xã Tây Ninh Hòa","province_code":"56"},{"code":"22849","name":"Xã Thuận Bắc","province_code":"56"},{"code":"22897","name":"Xã Thuận Nam","province_code":"56"},{"code":"22612","name":"Xã Trung Khánh Vĩnh","province_code":"56"},{"code":"22498","name":"Xã Tu Bông","province_code":"56"},{"code":"22525","name":"Xã Vạn Hưng","province_code":"56"},{"code":"22489","name":"Xã Vạn Ninh","province_code":"56"},{"code":"22516","name":"Xã Vạn Thắng","province_code":"56"},{"code":"22846","name":"Xã Vĩnh Hải","province_code":"56"},{"code":"22861","name":"Xã Xuân Hải","province_code":"56"},{"code":"23614","name":"Phường An Bình","province_code":"52"},{"code":"23617","name":"Phường An Khê","province_code":"52"},{"code":"21910","name":"Phường An Nhơn","province_code":"52"},{"code":"21925","name":"Phường An Nhơn Bắc","province_code":"52"},{"code":"21934","name":"Phường An Nhơn Đông","province_code":"52"},{"code":"21943","name":"Phường An Nhơn Nam","province_code":"52"},{"code":"23602","name":"Phường An Phú","province_code":"52"},{"code":"24044","name":"Phường Ayun Pa","province_code":"52"},{"code":"21907","name":"Phường Bình Định","province_code":"52"},{"code":"21640","name":"Phường Bồng Sơn","province_code":"52"},{"code":"23563","name":"Phường Diên Hồng","province_code":"52"},{"code":"21664","name":"Phường Hoài Nhơn","province_code":"52"},{"code":"21655","name":"Phường Hoài Nhơn Bắc","province_code":"52"},{"code":"21670","name":"Phường Hoài Nhơn Đông","province_code":"52"},{"code":"21673","name":"Phường Hoài Nhơn Nam","province_code":"52"},{"code":"21661","name":"Phường Hoài Nhơn Tây","province_code":"52"},{"code":"23586","name":"Phường Hội Phú","province_code":"52"},{"code":"23575","name":"Phường Pleiku","province_code":"52"},{"code":"21583","name":"Phường Quy Nhơn","province_code":"52"},{"code":"21553","name":"Phường Quy Nhơn Bắc","province_code":"52"},{"code":"21601","name":"Phường Quy Nhơn Đông","province_code":"52"},{"code":"21592","name":"Phường Quy Nhơn Nam","province_code":"52"},{"code":"21589","name":"Phường Quy Nhơn Tây","province_code":"52"},{"code":"21637","name":"Phường Tam Quan","province_code":"52"},{"code":"23584","name":"Phường Thống Nhất","province_code":"52"},{"code":"23954","name":"Xã AI Bá","province_code":"52"},{"code":"21697","name":"Xã Ân Hảo","province_code":"52"},{"code":"21628","name":"Xã An Hòa","province_code":"52"},{"code":"21609","name":"Xã An Lão","province_code":"52"},{"code":"21769","name":"Xã An Lương","province_code":"52"},{"code":"21940","name":"Xã An Nhơn Tây","province_code":"52"},{"code":"21622","name":"Xã An Toàn","province_code":"52"},{"code":"21715","name":"Xã Ân Tường","province_code":"52"},{"code":"21616","name":"Xã An Vinh","province_code":"52"},{"code":"23798","name":"Xã Ayun","province_code":"52"},{"code":"23896","name":"Xã Bàu Cạn","province_code":"52"},{"code":"23590","name":"Xã Biển Hồ","province_code":"52"},{"code":"21829","name":"Xã Bình An","province_code":"52"},{"code":"21733","name":"Xã Bình Dương","province_code":"52"},{"code":"21817","name":"Xã Bình Hiệp","province_code":"52"},{"code":"21820","name":"Xã Bình Khê","province_code":"52"},{"code":"21835","name":"Xã Bình Phú","province_code":"52"},{"code":"23947","name":"Xã Bờ Ngoong","province_code":"52"},{"code":"21997","name":"Xã Canh Liên","province_code":"52"},{"code":"22006","name":"Xã Canh Vinh","province_code":"52"},{"code":"21880","name":"Xã Cát Tiến","province_code":"52"},{"code":"23851","name":"Xã Chơ Long","province_code":"52"},{"code":"24049","name":"Xã Chư A Thai","province_code":"52"},{"code":"23830","name":"Xã Chư Krey","province_code":"52"},{"code":"23722","name":"Xã Chư Păh","province_code":"52"},{"code":"23887","name":"Xã Chư Prông","province_code":"52"},{"code":"23942","name":"Xã Chư Pưh","province_code":"52"},{"code":"23941","name":"Xã Chư Sê","province_code":"52"},{"code":"23629","name":"Xã Cửu An","province_code":"52"},{"code":"23677","name":"Xã Đak Đoa","province_code":"52"},{"code":"23995","name":"Xã Đak Pơ","province_code":"52"},{"code":"23644","name":"Xã Đak Rong","province_code":"52"},{"code":"23683","name":"Xã Đak Sơmei","province_code":"52"},{"code":"23842","name":"Xã Đăk Song","province_code":"52"},{"code":"21859","name":"Xã Đề Gi","province_code":"52"},{"code":"23857","name":"Xã Đức Cơ","province_code":"52"},{"code":"23611","name":"Xã Gào","province_code":"52"},{"code":"21871","name":"Xã Hòa Hội","province_code":"52"},{"code":"21688","name":"Xã Hoài Ân","province_code":"52"},{"code":"21868","name":"Xã Hội Sơn","province_code":"52"},{"code":"23799","name":"Xã Hra","province_code":"52"},{"code":"23710","name":"Xã la Băng","province_code":"52"},{"code":"23911","name":"Xã Ia Boòng","province_code":"52"},{"code":"23788","name":"Xã Ia Chia","province_code":"52"},{"code":"23869","name":"Xã Ia Dơk","province_code":"52"},{"code":"23872","name":"Xã Ia Dom","province_code":"52"},{"code":"24100","name":"Xã Ia Dreh","province_code":"52"},{"code":"23764","name":"Xã Ia Grai","province_code":"52"},{"code":"24061","name":"Xã Ia Hiao","province_code":"52"},{"code":"23971","name":"Xã Ia Hrú","province_code":"52"},{"code":"23767","name":"Xã Ia Hrung","province_code":"52"},{"code":"23728","name":"Xã Ia Khươl","province_code":"52"},{"code":"23977","name":"Xã Ia Ko","province_code":"52"},{"code":"23776","name":"Xã Ia Krái","province_code":"52"},{"code":"23866","name":"Xã Ia Krêl","province_code":"52"},{"code":"23935","name":"Xã Ia Lâu","province_code":"52"},{"code":"23986","name":"Xã Ia Le","province_code":"52"},{"code":"23734","name":"Xã Ia Ly","province_code":"52"},{"code":"23938","name":"Xã Ia Mơ","province_code":"52"},{"code":"23884","name":"Xã Ia Nan","province_code":"52"},{"code":"23782","name":"Xã Ia O","province_code":"52"},{"code":"24022","name":"Xã Ia Pa","province_code":"52"},{"code":"23749","name":"Xã Ia Phí","province_code":"52"},{"code":"23926","name":"Xã Ia Pia","province_code":"52"},{"code":"23881","name":"Xã Ia Pnôn","province_code":"52"},{"code":"23917","name":"Xã Ia Púch","province_code":"52"},{"code":"24065","name":"Xã Ia Rbol","province_code":"52"},{"code":"24112","name":"Xã Ia Rsai","province_code":"52"},{"code":"24073","name":"Xã Ia Sao","province_code":"52"},{"code":"23908","name":"Xã Ia Tôr","province_code":"52"},{"code":"24028","name":"Xã Ia Tul","province_code":"52"},{"code":"23638","name":"Xã Kbang","province_code":"52"},{"code":"23714","name":"Xã KDang","province_code":"52"},{"code":"21727","name":"Xã Kim Sơn","province_code":"52"},{"code":"23818","name":"Xã Kon Chiêng","province_code":"52"},{"code":"23701","name":"Xã Kon Gang","province_code":"52"},{"code":"23674","name":"Xã Kông Bơ La","province_code":"52"},{"code":"23824","name":"Xã Kông Chro","province_code":"52"},{"code":"23650","name":"Xã Krong","province_code":"52"},{"code":"23812","name":"Xã Lơ Pang","province_code":"52"},{"code":"23794","name":"Xã Mang Yang","province_code":"52"},{"code":"21901","name":"Xã Ngô Mây","province_code":"52"},{"code":"21607","name":"Xã Nhơn Châu","province_code":"52"},{"code":"21853","name":"Xã Phù Cát","province_code":"52"},{"code":"21730","name":"Xã Phù Mỹ","province_code":"52"},{"code":"21739","name":"Xã Phù Mỹ Bắc","province_code":"52"},{"code":"21751","name":"Xã Phù Mỹ Đông","province_code":"52"},{"code":"21775","name":"Xã Phù Mỹ Nam","province_code":"52"},{"code":"21757","name":"Xã Phù Mỹ Tây","province_code":"52"},{"code":"24043","name":"Xã Phú Thiện","province_code":"52"},{"code":"24076","name":"Xã Phú Túc","province_code":"52"},{"code":"24013","name":"Xã Pờ Tó","province_code":"52"},{"code":"23647","name":"Xã Sơn Lang","province_code":"52"},{"code":"23839","name":"Xã SRó","province_code":"52"},{"code":"21808","name":"Xã Tây Sơn","province_code":"52"},{"code":"23668","name":"Xã Tơ Tung","province_code":"52"},{"code":"21952","name":"Xã Tuy Phước","province_code":"52"},{"code":"21964","name":"Xã Tuy Phước Bắc","province_code":"52"},{"code":"21970","name":"Xã Tuy Phước Đông","province_code":"52"},{"code":"21985","name":"Xã Tuy Phước Tây","province_code":"52"},{"code":"24109","name":"Xã Uar","province_code":"52"},{"code":"21994","name":"Xã Vân Canh","province_code":"52"},{"code":"21703","name":"Xã Vạn Đức","province_code":"52"},{"code":"21805","name":"Xã Vĩnh Quang","province_code":"52"},{"code":"21787","name":"Xã Vĩnh Sơn","province_code":"52"},{"code":"21786","name":"Xã Vĩnh Thạnh","province_code":"52"},{"code":"21796","name":"Xã Vĩnh Thịnh","province_code":"52"},{"code":"21892","name":"Xã Xuân An","province_code":"52"},{"code":"24007","name":"Xã Ya Hội","province_code":"52"},{"code":"23833","name":"Xã Ya Ma","province_code":"52"},{"code":"22045","name":"Phường Bình Kiến","province_code":"66"},{"code":"24305","name":"Phường Buôn Hồ","province_code":"66"},{"code":"24133","name":"Phường Buôn Ma Thuột","province_code":"66"},{"code":"24340","name":"Phường Cư Bao","province_code":"66"},{"code":"22258","name":"Phường Đông Hòa","province_code":"66"},{"code":"24169","name":"Phường Ea Kao","province_code":"66"},{"code":"22261","name":"Phường Hòa Hiệp","province_code":"66"},{"code":"22240","name":"Phường Phú Yên","province_code":"66"},{"code":"22051","name":"Phường Sông Cầu","province_code":"66"},{"code":"24163","name":"Phường Tân An","province_code":"66"},{"code":"24121","name":"Phường Tân Lập","province_code":"66"},{"code":"24154","name":"Phường Thành Nhất","province_code":"66"},{"code":"22015","name":"Phường Tuy Hòa","province_code":"66"},{"code":"22076","name":"Phường Xuân Đài","province_code":"66"},{"code":"24235","name":"Xã Buôn Đôn","province_code":"66"},{"code":"24280","name":"Xã Cư M’gar","province_code":"66"},{"code":"24436","name":"Xã Cư M’ta","province_code":"66"},{"code":"24313","name":"Xã Cư Pơng","province_code":"66"},{"code":"24415","name":"Xã Cư Prao","province_code":"66"},{"code":"24478","name":"Xã Cư Pui","province_code":"66"},{"code":"24406","name":"Xã Cư Yang","province_code":"66"},{"code":"24301","name":"Xã Cuôr Đăng","province_code":"66"},{"code":"24595","name":"Xã Đắk Liêng","province_code":"66"},{"code":"24598","name":"Xã Đắk Phơi","province_code":"66"},{"code":"24454","name":"Xã Dang Kang","province_code":"66"},{"code":"24346","name":"Xã Dliê Ya","province_code":"66"},{"code":"22081","name":"Xã Đồng Xuân","province_code":"66"},{"code":"24561","name":"Xã Dray Bhăng","province_code":"66"},{"code":"22222","name":"Xã Đức Bình","province_code":"66"},{"code":"24568","name":"Xã Dur Kmăl","province_code":"66"},{"code":"22225","name":"Xã Ea Bá","province_code":"66"},{"code":"24229","name":"Xã Ea Bung","province_code":"66"},{"code":"24181","name":"Xã Ea Drăng","province_code":"66"},{"code":"24328","name":"Xã Ea Drông","province_code":"66"},{"code":"24184","name":"Xã Ea H'Leo","province_code":"66"},{"code":"24187","name":"Xã Ea Hiao","province_code":"66"},{"code":"24373","name":"Xã Ea Kar","province_code":"66"},{"code":"24208","name":"Xã Ea Khăl","province_code":"66"},{"code":"24265","name":"Xã Ea Kiết","province_code":"66"},{"code":"24496","name":"Xã Ea Kly","province_code":"66"},{"code":"24376","name":"Xã Ea Knốp","province_code":"66"},{"code":"24505","name":"Xã Ea Knuếc","province_code":"66"},{"code":"24544","name":"Xã Ea Ktur","province_code":"66"},{"code":"22237","name":"Xã Ea Ly","province_code":"66"},{"code":"24286","name":"Xã Ea M’Droh","province_code":"66"},{"code":"24559","name":"Xã Ea Na","province_code":"66"},{"code":"24540","name":"Xã Ea Ning","province_code":"66"},{"code":"24250","name":"Xã Ea Nuôl","province_code":"66"},{"code":"24403","name":"Xã Ea Ô","province_code":"66"},{"code":"24400","name":"Xã Ea Păl","province_code":"66"},{"code":"24502","name":"Xã Ea Phê","province_code":"66"},{"code":"24433","name":"Xã Ea Riêng","province_code":"66"},{"code":"24217","name":"Xã Ea Rốk","province_code":"66"},{"code":"24211","name":"Xã Ea Súp","province_code":"66"},{"code":"24445","name":"Xã Ea Trang","province_code":"66"},{"code":"24277","name":"Xã Ea Tul","province_code":"66"},{"code":"24241","name":"Xã Ea Wer","province_code":"66"},{"code":"24193","name":"Xã Ea Wy","province_code":"66"},{"code":"22285","name":"Xã Hòa Mỹ","province_code":"66"},{"code":"24175","name":"Xã Hòa Phú","province_code":"66"},{"code":"24472","name":"Xã Hòa Sơn","province_code":"66"},{"code":"22276","name":"Xã Hòa Thịnh","province_code":"66"},{"code":"22291","name":"Xã Hòa Xuân","province_code":"66"},{"code":"24214","name":"Xã Ia Lốp","province_code":"66"},{"code":"24221","name":"Xã Ia Rvê","province_code":"66"},{"code":"24444","name":"Xã Krông Á","province_code":"66"},{"code":"24538","name":"Xã Krông Ana","province_code":"66"},{"code":"24448","name":"Xã Krông Bông","province_code":"66"},{"code":"24310","name":"Xã Krông Búk","province_code":"66"},{"code":"24343","name":"Xã Krông Năng","province_code":"66"},{"code":"24604","name":"Xã Krông Nô","province_code":"66"},{"code":"24490","name":"Xã Krông Pắc","province_code":"66"},{"code":"24580","name":"Xã Liên Sơn Lắk","province_code":"66"},{"code":"24412","name":"Xã M’Drắk","province_code":"66"},{"code":"24607","name":"Xã Nam Ka","province_code":"66"},{"code":"22147","name":"Xã Ô Loan","province_code":"66"},{"code":"22319","name":"Xã Phú Hòa 1","province_code":"66"},{"code":"22303","name":"Xã Phú Hòa 2","province_code":"66"},{"code":"22096","name":"Xã Phú Mỡ","province_code":"66"},{"code":"24364","name":"Xã Phú Xuân","province_code":"66"},{"code":"24316","name":"Xã Pơng Drang","province_code":"66"},{"code":"24259","name":"Xã Quảng Phú","province_code":"66"},{"code":"22165","name":"Xã Sơn Hòa","province_code":"66"},{"code":"22250","name":"Xã Sơn Thành","province_code":"66"},{"code":"22207","name":"Xã Sông Hinh","province_code":"66"},{"code":"22192","name":"Xã Suối Trai","province_code":"66"},{"code":"24352","name":"Xã Tam Giang","province_code":"66"},{"code":"24526","name":"Xã Tân Tiến","province_code":"66"},{"code":"22255","name":"Xã Tây Hòa","province_code":"66"},{"code":"22171","name":"Xã Tây Sơn","province_code":"66"},{"code":"22114","name":"Xã Tuy An Bắc","province_code":"66"},{"code":"22120","name":"Xã Tuy An Đông","province_code":"66"},{"code":"22153","name":"Xã Tuy An Nam","province_code":"66"},{"code":"22132","name":"Xã Tuy An Tây","province_code":"66"},{"code":"22177","name":"Xã Vân Hòa","province_code":"66"},{"code":"24529","name":"Xã Vụ Bổn","province_code":"66"},{"code":"22060","name":"Xã Xuân Cảnh","province_code":"66"},{"code":"22090","name":"Xã Xuân Lãnh","province_code":"66"},{"code":"22057","name":"Xã Xuân Lộc","province_code":"66"},{"code":"22111","name":"Xã Xuân Phước","province_code":"66"},{"code":"22075","name":"Xã Xuân Thọ","province_code":"66"},{"code":"24484","name":"Xã Yang Mao","province_code":"66"},{"code":"23272","name":"Đặc khu Phú Quý","province_code":"68"},{"code":"24823","name":"Phường 1 Bảo Lộc","province_code":"68"},{"code":"24820","name":"Phường 2 Bảo Lộc","province_code":"68"},{"code":"24841","name":"Phường 3 Bảo Lộc","province_code":"68"},{"code":"24829","name":"Phường B'Lao","province_code":"68"},{"code":"24611","name":"Phường Bắc Gia Nghĩa","province_code":"68"},{"code":"22960","name":"Phường Bình Thuận","province_code":"68"},{"code":"24787","name":"Phường Cam Ly - Đà Lạt","province_code":"68"},{"code":"24617","name":"Phường Đông Gia Nghĩa","province_code":"68"},{"code":"22933","name":"Phường Hàm Thắng","province_code":"68"},{"code":"23235","name":"Phường La Gi","province_code":"68"},{"code":"24778","name":"Phường Lâm Viên - Đà Lạt","province_code":"68"},{"code":"24846","name":"Phường Lang Biang - Đà Lạt","province_code":"68"},{"code":"22918","name":"Phường Mũi Né","province_code":"68"},{"code":"24615","name":"Phường Nam Gia Nghĩa","province_code":"68"},{"code":"22945","name":"Phường Phan Thiết","province_code":"68"},{"code":"22924","name":"Phường Phú Thủy","province_code":"68"},{"code":"23231","name":"Phường Phước Hội","province_code":"68"},{"code":"22954","name":"Phường Tiến Thành","province_code":"68"},{"code":"24781","name":"Phường Xuân Hương - Đà Lạt","province_code":"68"},{"code":"24805","name":"Phường Xuân Trường - Đà Lạt","province_code":"68"},{"code":"23005","name":"Xã Bắc Bình","province_code":"68"},{"code":"23152","name":"Xã Bắc Ruộng","province_code":"68"},{"code":"25054","name":"Xã Bảo Lâm 1","province_code":"68"},{"code":"25084","name":"Xã Bảo Lâm 2","province_code":"68"},{"code":"25093","name":"Xã Bảo Lâm 3","province_code":"68"},{"code":"25063","name":"Xã Bảo Lâm 4","province_code":"68"},{"code":"25057","name":"Xã Bảo Lâm 5","province_code":"68"},{"code":"25018","name":"Xã Bảo Thuận","province_code":"68"},{"code":"25159","name":"Xã Cát Tiên","province_code":"68"},{"code":"25180","name":"Xã Cát Tiên 2","province_code":"68"},{"code":"25162","name":"Xã Cát Tiên 3","province_code":"68"},{"code":"24640","name":"Xã Cư Jút","province_code":"68"},{"code":"24934","name":"Xã D'Ran","province_code":"68"},{"code":"25099","name":"Xã Đạ Huoai","province_code":"68"},{"code":"25105","name":"Xã Đạ Huoai 2","province_code":"68"},{"code":"25114","name":"Xã Đạ Huoai 3","province_code":"68"},{"code":"25126","name":"Xã Đạ Tẻh","province_code":"68"},{"code":"25138","name":"Xã Đạ Tẻh 2","province_code":"68"},{"code":"25135","name":"Xã Đạ Tẻh 3","province_code":"68"},{"code":"24670","name":"Xã Đắk Mil","province_code":"68"},{"code":"24678","name":"Xã Đắk Sắk","province_code":"68"},{"code":"24718","name":"Xã Đắk Song","province_code":"68"},{"code":"24646","name":"Xã Đắk Wil","province_code":"68"},{"code":"24886","name":"Xã Đam Rông 1","province_code":"68"},{"code":"24877","name":"Xã Đam Rông 2","province_code":"68"},{"code":"24875","name":"Xã Đam Rông 3","province_code":"68"},{"code":"24853","name":"Xã Đam Rông 4","province_code":"68"},{"code":"25000","name":"Xã Di Linh","province_code":"68"},{"code":"25007","name":"Xã Đinh Trang Thượng","province_code":"68"},{"code":"24871","name":"Xã Đinh Văn Lâm Hà","province_code":"68"},{"code":"24931","name":"Xã Đơn Dương","province_code":"68"},{"code":"23074","name":"Xã Đông Giang","province_code":"68"},{"code":"23173","name":"Xã Đồng Kho","province_code":"68"},{"code":"24717","name":"Xã Đức An","province_code":"68"},{"code":"24664","name":"Xã Đức Lập","province_code":"68"},{"code":"23191","name":"Xã Đức Linh","province_code":"68"},{"code":"24958","name":"Xã Đức Trọng","province_code":"68"},{"code":"25015","name":"Xã Gia Hiệp","province_code":"68"},{"code":"23020","name":"Xã Hải Ninh","province_code":"68"},{"code":"23128","name":"Xã Hàm Kiệm","province_code":"68"},{"code":"23095","name":"Xã Hàm Liêm","province_code":"68"},{"code":"23236","name":"Xã Hàm Tân","province_code":"68"},{"code":"23122","name":"Xã Hàm Thạnh","province_code":"68"},{"code":"23059","name":"Xã Hàm Thuận","province_code":"68"},{"code":"23089","name":"Xã Hàm Thuận Bắc","province_code":"68"},{"code":"23110","name":"Xã Hàm Thuận Nam","province_code":"68"},{"code":"24967","name":"Xã Hiệp Thạnh","province_code":"68"},{"code":"25042","name":"Xã Hòa Bắc","province_code":"68"},{"code":"25036","name":"Xã Hòa Ninh","province_code":"68"},{"code":"23053","name":"Xã Hòa Thắng","province_code":"68"},{"code":"23194","name":"Xã Hoài Đức","province_code":"68"},{"code":"23086","name":"Xã Hồng Sơn","province_code":"68"},{"code":"23041","name":"Xã Hồng Thái","province_code":"68"},{"code":"24943","name":"Xã Ka Đô","province_code":"68"},{"code":"24733","name":"Xã Kiến Đức","province_code":"68"},{"code":"24688","name":"Xã Krông Nô","province_code":"68"},{"code":"23065","name":"Xã La Dạ","province_code":"68"},{"code":"24848","name":"Xã Lạc Dương","province_code":"68"},{"code":"22969","name":"Xã Liên Hương","province_code":"68"},{"code":"23032","name":"Xã Lương Sơn","province_code":"68"},{"code":"24868","name":"Xã Nam Ban Lâm Hà","province_code":"68"},{"code":"24697","name":"Xã Nam Đà","province_code":"68"},{"code":"24649","name":"Xã Nam Dong","province_code":"68"},{"code":"24883","name":"Xã Nam Hà Lâm Hà","province_code":"68"},{"code":"24703","name":"Xã Nâm Nung","province_code":"68"},{"code":"23200","name":"Xã Nam Thành","province_code":"68"},{"code":"23158","name":"Xã Nghị Đức","province_code":"68"},{"code":"24751","name":"Xã Nhân Cơ","province_code":"68"},{"code":"24985","name":"Xã Ninh Gia","province_code":"68"},{"code":"22972","name":"Xã Phan Rí Cửa","province_code":"68"},{"code":"23008","name":"Xã Phan Sơn","province_code":"68"},{"code":"24895","name":"Xã Phú Sơn Lâm Hà","province_code":"68"},{"code":"24907","name":"Xã Phúc Thọ Lâm Hà","province_code":"68"},{"code":"24620","name":"Xã Quảng Hòa","province_code":"68"},{"code":"24631","name":"Xã Quảng Khê","province_code":"68"},{"code":"24955","name":"Xã Quảng Lập","province_code":"68"},{"code":"24712","name":"Xã Quảng Phú","province_code":"68"},{"code":"24616","name":"Xã Quảng Sơn","province_code":"68"},{"code":"24748","name":"Xã Quảng Tân","province_code":"68"},{"code":"24760","name":"Xã Quảng Tín","province_code":"68"},{"code":"24736","name":"Xã Quảng Trực","province_code":"68"},{"code":"25051","name":"Xã Sơn Điền","province_code":"68"},{"code":"23266","name":"Xã Sơn Mỹ","province_code":"68"},{"code":"23023","name":"Xã Sông Lũy","province_code":"68"},{"code":"23188","name":"Xã Suối Kiết","province_code":"68"},{"code":"24637","name":"Xã Tà Đùng","province_code":"68"},{"code":"24991","name":"Xã Tà Hine","province_code":"68"},{"code":"24988","name":"Xã Tà Năng","province_code":"68"},{"code":"24916","name":"Xã Tân Hà Lâm Hà","province_code":"68"},{"code":"23246","name":"Xã Tân Hải","province_code":"68"},{"code":"24976","name":"Xã Tân Hội","province_code":"68"},{"code":"23134","name":"Xã Tân Lập","province_code":"68"},{"code":"23230","name":"Xã Tân Minh","province_code":"68"},{"code":"23143","name":"Xã Tân Thành","province_code":"68"},{"code":"23149","name":"Xã Tánh Linh","province_code":"68"},{"code":"24682","name":"Xã Thuận An","province_code":"68"},{"code":"24722","name":"Xã Thuận Hạnh","province_code":"68"},{"code":"23227","name":"Xã Trà Tân","province_code":"68"},{"code":"24730","name":"Xã Trường Xuân","province_code":"68"},{"code":"24739","name":"Xã Tuy Đức","province_code":"68"},{"code":"22978","name":"Xã Tuy Phong","province_code":"68"},{"code":"22963","name":"Xã Tuyên Quang","province_code":"68"},{"code":"22981","name":"Xã Vĩnh Hảo","province_code":"68"},{"code":"25732","name":"Phường An Tịnh","province_code":"80"},{"code":"25480","name":"Phường Bình Minh","province_code":"80"},{"code":"25672","name":"Phường Gia Lộc","province_code":"80"},{"code":"25654","name":"Phường Gò Dầu","province_code":"80"},{"code":"25645","name":"Phường Hòa Thành","province_code":"80"},{"code":"27715","name":"Phường Khánh Hậu","province_code":"80"},{"code":"27787","name":"Phường Kiến Tường","province_code":"80"},{"code":"27694","name":"Phường Long An","province_code":"80"},{"code":"25630","name":"Phường Long Hoa","province_code":"80"},{"code":"25567","name":"Phường Ninh Thạnh","province_code":"80"},{"code":"27712","name":"Phường Tân An","province_code":"80"},{"code":"25459","name":"Phường Tân Ninh","province_code":"80"},{"code":"25633","name":"Phường Thanh Điền","province_code":"80"},{"code":"25708","name":"Phường Trảng Bàng","province_code":"80"},{"code":"28243","name":"Xã An Lục Long","province_code":"80"},{"code":"27943","name":"Xã An Ninh","province_code":"80"},{"code":"25681","name":"Xã Bến Cầu","province_code":"80"},{"code":"27991","name":"Xã Bến Lức","province_code":"80"},{"code":"28015","name":"Xã Bình Đức","province_code":"80"},{"code":"27793","name":"Xã Bình Hiệp","province_code":"80"},{"code":"27811","name":"Xã Bình Hòa","province_code":"80"},{"code":"27868","name":"Xã Bình Thành","province_code":"80"},{"code":"28108","name":"Xã Cần Đước","province_code":"80"},{"code":"28159","name":"Xã Cần Giuộc","province_code":"80"},{"code":"25573","name":"Xã Cầu Khởi","province_code":"80"},{"code":"25585","name":"Xã Châu Thành","province_code":"80"},{"code":"27898","name":"Xã Đông Thành","province_code":"80"},{"code":"27937","name":"Xã Đức Hòa","province_code":"80"},{"code":"27925","name":"Xã Đức Huệ","province_code":"80"},{"code":"27964","name":"Xã Đức Lập","province_code":"80"},{"code":"25552","name":"Xã Dương Minh Châu","province_code":"80"},{"code":"25588","name":"Xã Hảo Đước","province_code":"80"},{"code":"27931","name":"Xã Hậu Nghĩa","province_code":"80"},{"code":"27841","name":"Xã Hậu Thạnh","province_code":"80"},{"code":"27952","name":"Xã Hiệp Hòa","province_code":"80"},{"code":"25606","name":"Xã Hòa Hội","province_code":"80"},{"code":"27979","name":"Xã Hòa Khánh","province_code":"80"},{"code":"27727","name":"Xã Hưng Điền","province_code":"80"},{"code":"25711","name":"Xã Hưng Thuận","province_code":"80"},{"code":"27763","name":"Xã Khánh Hưng","province_code":"80"},{"code":"25579","name":"Xã Lộc Ninh","province_code":"80"},{"code":"28126","name":"Xã Long Cang","province_code":"80"},{"code":"25684","name":"Xã Long Chữ","province_code":"80"},{"code":"28144","name":"Xã Long Hựu","province_code":"80"},{"code":"25702","name":"Xã Long Thuận","province_code":"80"},{"code":"28003","name":"Xã Lương Hòa","province_code":"80"},{"code":"27823","name":"Xã Mộc Hóa","province_code":"80"},{"code":"28066","name":"Xã Mỹ An","province_code":"80"},{"code":"27976","name":"Xã Mỹ Hạnh","province_code":"80"},{"code":"28132","name":"Xã Mỹ Lệ","province_code":"80"},{"code":"28177","name":"Xã Mỹ Lộc","province_code":"80"},{"code":"27907","name":"Xã Mỹ Quý","province_code":"80"},{"code":"28051","name":"Xã Mỹ Thạnh","province_code":"80"},{"code":"28018","name":"Xã Mỹ Yên","province_code":"80"},{"code":"27838","name":"Xã Nhơn Hòa Lập","province_code":"80"},{"code":"27856","name":"Xã Nhơn Ninh","province_code":"80"},{"code":"28087","name":"Xã Nhựt Tảo","province_code":"80"},{"code":"25621","name":"Xã Ninh Điền","province_code":"80"},{"code":"25729","name":"Xã Phước Chỉ","province_code":"80"},{"code":"28165","name":"Xã Phước Lý","province_code":"80"},{"code":"25663","name":"Xã Phước Thạnh","province_code":"80"},{"code":"25591","name":"Xã Phước Vinh","province_code":"80"},{"code":"28201","name":"Xã Phước Vĩnh Tây","province_code":"80"},{"code":"28114","name":"Xã Rạch Kiến","province_code":"80"},{"code":"28210","name":"Xã Tầm Vu","province_code":"80"},{"code":"25486","name":"Xã Tân Biên","province_code":"80"},{"code":"25516","name":"Xã Tân Châu","province_code":"80"},{"code":"25522","name":"Xã Tân Đông","province_code":"80"},{"code":"25531","name":"Xã Tân Hòa","province_code":"80"},{"code":"25525","name":"Xã Tân Hội","province_code":"80"},{"code":"27721","name":"Xã Tân Hưng","province_code":"80"},{"code":"28138","name":"Xã Tân Lân","province_code":"80"},{"code":"25489","name":"Xã Tân Lập","province_code":"80"},{"code":"28072","name":"Xã Tân Long","province_code":"80"},{"code":"25549","name":"Xã Tân Phú","province_code":"80"},{"code":"28207","name":"Xã Tân Tập","province_code":"80"},{"code":"27889","name":"Xã Tân Tây","province_code":"80"},{"code":"25534","name":"Xã Tân Thành","province_code":"80"},{"code":"27826","name":"Xã Tân Thạnh","province_code":"80"},{"code":"28075","name":"Xã Tân Trụ","province_code":"80"},{"code":"25498","name":"Xã Thạnh Bình","province_code":"80"},{"code":"25657","name":"Xã Thạnh Đức","province_code":"80"},{"code":"27865","name":"Xã Thạnh Hóa","province_code":"80"},{"code":"27994","name":"Xã Thạnh Lợi","province_code":"80"},{"code":"27877","name":"Xã Thạnh Phước","province_code":"80"},{"code":"28036","name":"Xã Thủ Thừa","province_code":"80"},{"code":"28225","name":"Xã Thuận Mỹ","province_code":"80"},{"code":"25510","name":"Xã Trà Vong","province_code":"80"},{"code":"25666","name":"Xã Truông Mít","province_code":"80"},{"code":"27775","name":"Xã Tuyên Bình","province_code":"80"},{"code":"27817","name":"Xã Tuyên Thạnh","province_code":"80"},{"code":"28093","name":"Xã Vàm Cỏ","province_code":"80"},{"code":"27748","name":"Xã Vĩnh Châu","province_code":"80"},{"code":"28222","name":"Xã Vĩnh Công","province_code":"80"},{"code":"27757","name":"Xã Vĩnh Hưng","province_code":"80"},{"code":"27736","name":"Xã Vĩnh Thạnh","province_code":"80"},{"code":"25333","name":"Phường An Lộc","province_code":"75"},{"code":"26098","name":"Phường Bảo Vinh","province_code":"75"},{"code":"26068","name":"Phường Biên Hòa","province_code":"75"},{"code":"26089","name":"Phường Bình Lộc","province_code":"75"},{"code":"25326","name":"Phường Bình Long","province_code":"75"},{"code":"25195","name":"Phường Bình Phước","province_code":"75"},{"code":"25432","name":"Phường Chơn Thành","province_code":"75"},{"code":"25210","name":"Phường Đồng Xoài","province_code":"75"},{"code":"26113","name":"Phường Hàng Gòn","province_code":"75"},{"code":"26005","name":"Phường Hố Nai","province_code":"75"},{"code":"26020","name":"Phường Long Bình","province_code":"75"},{"code":"26380","name":"Phường Long Hưng","province_code":"75"},{"code":"26080","name":"Phường Long Khánh","province_code":"75"},{"code":"25441","name":"Phường Minh Hưng","province_code":"75"},{"code":"25220","name":"Phường Phước Bình","province_code":"75"},{"code":"25217","name":"Phường Phước Long","province_code":"75"},{"code":"26377","name":"Phường Phước Tân","province_code":"75"},{"code":"26017","name":"Phường Tam Hiệp","province_code":"75"},{"code":"26374","name":"Phường Tam Phước","province_code":"75"},{"code":"26188","name":"Phường Tân Triều","province_code":"75"},{"code":"26041","name":"Phường Trấn Biên","province_code":"75"},{"code":"25993","name":"Phường Trảng Dài","province_code":"75"},{"code":"26104","name":"Phường Xuân Lập","province_code":"75"},{"code":"26383","name":"Xã An Phước","province_code":"75"},{"code":"26296","name":"Xã An Viễn","province_code":"75"},{"code":"26254","name":"Xã Bàu Hàm","province_code":"75"},{"code":"26389","name":"Xã Bình An","province_code":"75"},{"code":"26278","name":"Xã Bình Minh","province_code":"75"},{"code":"25246","name":"Xã Bình Tân","province_code":"75"},{"code":"25405","name":"Xã Bom Bo","province_code":"75"},{"code":"25396","name":"Xã Bù Đăng","province_code":"75"},{"code":"25222","name":"Xã Bù Gia Mập","province_code":"75"},{"code":"26341","name":"Xã Cẩm Mỹ","province_code":"75"},{"code":"25231","name":"Xã Đa Kia","province_code":"75"},{"code":"26491","name":"Xã Đại Phước","province_code":"75"},{"code":"26119","name":"Xã Đak Lua","province_code":"75"},{"code":"25399","name":"Xã Đak Nhau","province_code":"75"},{"code":"25225","name":"Xã Đăk Ơ","province_code":"75"},{"code":"26326","name":"Phường Dầu Giây","province_code":"75"},{"code":"26206","name":"Xã Định Quán","province_code":"75"},{"code":"25363","name":"Phường Đồng Phú","province_code":"75"},{"code":"25390","name":"Xã Đồng Tâm","province_code":"75"},{"code":"26311","name":"Xã Gia Kiệm","province_code":"75"},{"code":"25309","name":"Xã Hưng Phước","province_code":"75"},{"code":"26281","name":"Xã Hưng Thịnh","province_code":"75"},{"code":"26227","name":"Xã La Ngà","province_code":"75"},{"code":"25303","name":"Xã Lộc Hưng","province_code":"75"},{"code":"25270","name":"Phường Lộc Ninh","province_code":"75"},{"code":"25292","name":"Xã Lộc Quang","province_code":"75"},{"code":"25279","name":"Xã Lộc Tấn","province_code":"75"},{"code":"25294","name":"Xã Lộc Thành","province_code":"75"},{"code":"25280","name":"Xã Lộc Thạnh","province_code":"75"},{"code":"25255","name":"Xã Long Hà","province_code":"75"},{"code":"26413","name":"Xã Long Phước","province_code":"75"},{"code":"26368","name":"Phường Long Thành","province_code":"75"},{"code":"25349","name":"Xã Minh Đức","province_code":"75"},{"code":"26122","name":"Xã Nam Cát Tiên","province_code":"75"},{"code":"25417","name":"Xã Nghĩa Trung","province_code":"75"},{"code":"25450","name":"Xã Nha Bích","province_code":"75"},{"code":"26485","name":"Phường Nhơn Trạch","province_code":"75"},{"code":"26221","name":"Xã Phú Hòa","province_code":"75"},{"code":"26158","name":"Xã Phú Lâm","province_code":"75"},{"code":"26173","name":"Xã Phú Lý","province_code":"75"},{"code":"25267","name":"Xã Phú Nghĩa","province_code":"75"},{"code":"25252","name":"Xã Phú Riềng","province_code":"75"},{"code":"25261","name":"Xã Phú Trung","province_code":"75"},{"code":"26215","name":"Xã Phú Vinh","province_code":"75"},{"code":"26503","name":"Xã Phước An","province_code":"75"},{"code":"25420","name":"Xã Phước Sơn","province_code":"75"},{"code":"26422","name":"Xã Phước Thái","province_code":"75"},{"code":"26362","name":"Xã Sông Ray","province_code":"75"},{"code":"26134","name":"Xã Tà Lài","province_code":"75"},{"code":"26179","name":"Xã Tân An","province_code":"75"},{"code":"25345","name":"Xã Tân Hưng","province_code":"75"},{"code":"25357","name":"Phường Tân Khai","province_code":"75"},{"code":"25378","name":"Xã Tân Lợi","province_code":"75"},{"code":"26116","name":"Phường Tân Phú","province_code":"75"},{"code":"25351","name":"Xã Tân Quan","province_code":"75"},{"code":"25318","name":"Xã Tân Tiến","province_code":"75"},{"code":"26209","name":"Xã Thanh Sơn","province_code":"75"},{"code":"25308","name":"Xã Thiện Hưng","province_code":"75"},{"code":"25402","name":"Xã Thọ Sơn","province_code":"75"},{"code":"26299","name":"Xã Thống Nhất","province_code":"75"},{"code":"25387","name":"Xã Thuận Lợi","province_code":"75"},{"code":"26248","name":"Phường Trảng Bom","province_code":"75"},{"code":"26170","name":"Phường Trị An","province_code":"75"},{"code":"26428","name":"Xã Xuân Bắc","province_code":"75"},{"code":"26461","name":"Xã Xuân Định","province_code":"75"},{"code":"26359","name":"Xã Xuân Đông","province_code":"75"},{"code":"26347","name":"Xã Xuân Đường","province_code":"75"},{"code":"26446","name":"Xã Xuân Hòa","province_code":"75"},{"code":"26425","name":"Phường Xuân Lộc","province_code":"75"},{"code":"26458","name":"Xã Xuân Phú","province_code":"75"},{"code":"26332","name":"Xã Xuân Quế","province_code":"75"},{"code":"26434","name":"Xã Xuân Thành","province_code":"75"},{"code":"26732","name":"Đặc khu Côn Đảo","province_code":"79"},{"code":"27316","name":"Phường An Đông","province_code":"79"},{"code":"26878","name":"Phường An Hội Đông","province_code":"79"},{"code":"26882","name":"Phường An Hội Tây","province_code":"79"},{"code":"27094","name":"Phường An Khánh","province_code":"79"},{"code":"27460","name":"Phường An Lạc","province_code":"79"},{"code":"26876","name":"Phường An Nhơn","province_code":"79"},{"code":"25975","name":"Phường An Phú","province_code":"79"},{"code":"26767","name":"Phường An Phú Đông","province_code":"79"},{"code":"26560","name":"Phường Bà Rịa","province_code":"79"},{"code":"27154","name":"Phường Bàn Cờ","province_code":"79"},{"code":"26983","name":"Phường Bảy Hiền","province_code":"79"},{"code":"25813","name":"Phường Bến Cát","province_code":"79"},{"code":"26743","name":"Phường Bến Thành","province_code":"79"},{"code":"25915","name":"Phường Bình Cơ","province_code":"79"},{"code":"27424","name":"Phường Bình Đông","province_code":"79"},{"code":"25760","name":"Phường Bình Dương","province_code":"79"},{"code":"25987","name":"Phường Bình Hòa","province_code":"79"},{"code":"27439","name":"Phường Bình Hưng Hòa","province_code":"79"},{"code":"26905","name":"Phường Bình Lợi Trung","province_code":"79"},{"code":"27364","name":"Phường Bình Phú","province_code":"79"},{"code":"26911","name":"Phường Bình Quới","province_code":"79"},{"code":"27442","name":"Phường Bình Tân","province_code":"79"},{"code":"27367","name":"Phường Bình Tây","province_code":"79"},{"code":"26929","name":"Phường Bình Thạnh","province_code":"79"},{"code":"27232","name":"Phường Bình Thới","province_code":"79"},{"code":"27373","name":"Phường Bình Tiên","province_code":"79"},{"code":"27448","name":"Phường Bình Trị Đông","province_code":"79"},{"code":"27097","name":"Phường Bình Trưng","province_code":"79"},{"code":"27112","name":"Phường Cát Lái","province_code":"79"},{"code":"27058","name":"Phường Cầu Kiệu","province_code":"79"},{"code":"26758","name":"Phường Cầu Ông Lãnh","province_code":"79"},{"code":"25771","name":"Phường Chánh Hiệp","province_code":"79"},{"code":"27418","name":"Phường Chánh Hưng","province_code":"79"},{"code":"25837","name":"Phường Chánh Phú Hòa","province_code":"79"},{"code":"27343","name":"Phường Chợ Lớn","province_code":"79"},{"code":"27301","name":"Phường Chợ Quán","province_code":"79"},{"code":"25942","name":"Phường Dĩ An","province_code":"79"},{"code":"27169","name":"Phường Diên Hồng","province_code":"79"},{"code":"25951","name":"Phường Đông Hòa","province_code":"79"},{"code":"26791","name":"Phường Đông Hưng Thuận","province_code":"79"},{"code":"27043","name":"Phường Đức Nhuận","province_code":"79"},{"code":"26944","name":"Phường Gia Định","province_code":"79"},{"code":"26884","name":"Phường Gò Vấp","province_code":"79"},{"code":"26890","name":"Phường Hạnh Thông","province_code":"79"},{"code":"26809","name":"Phường Hiệp Bình","province_code":"79"},{"code":"27211","name":"Phường Hòa Bình","province_code":"79"},{"code":"27163","name":"Phường Hòa Hưng","province_code":"79"},{"code":"25849","name":"Phường Hòa Lợi","province_code":"79"},{"code":"27265","name":"Phường Khánh Hội","province_code":"79"},{"code":"25966","name":"Phường Lái Thiêu","province_code":"79"},{"code":"26800","name":"Phường Linh Xuân","province_code":"79"},{"code":"26833","name":"Phường Long Bình","province_code":"79"},{"code":"26566","name":"Phường Long Hương","province_code":"79"},{"code":"25840","name":"Phường Long Nguyên","province_code":"79"},{"code":"26857","name":"Phường Long Phước","province_code":"79"},{"code":"26860","name":"Phường Long Trường","province_code":"79"},{"code":"27238","name":"Phường Minh Phụng","province_code":"79"},{"code":"27142","name":"Phường Nhiêu Lộc","province_code":"79"},{"code":"25768","name":"Phường Phú An","province_code":"79"},{"code":"27427","name":"Phường Phú Định","province_code":"79"},{"code":"27349","name":"Phường Phú Lâm","province_code":"79"},{"code":"25750","name":"Phường Phú Lợi","province_code":"79"},{"code":"26704","name":"Phường Phú Mỹ","province_code":"79"},{"code":"27073","name":"Phường Phú Nhuận","province_code":"79"},{"code":"27028","name":"Phường Phú Thạnh","province_code":"79"},{"code":"27226","name":"Phường Phú Thọ","province_code":"79"},{"code":"27022","name":"Phường Phú Thọ Hòa","province_code":"79"},{"code":"27484","name":"Phường Phú Thuận","province_code":"79"},{"code":"26848","name":"Phường Phước Long","province_code":"79"},{"code":"26542","name":"Phường Phước Thắng","province_code":"79"},{"code":"26536","name":"Phường Rạch Dừa","province_code":"79"},{"code":"26740","name":"Phường Sài Gòn","province_code":"79"},{"code":"26803","name":"Phường Tam Bình","province_code":"79"},{"code":"26572","name":"Phường Tam Long","province_code":"79"},{"code":"26526","name":"Phường Tam Thắng","province_code":"79"},{"code":"27004","name":"Phường Tân Bình","province_code":"79"},{"code":"26737","name":"Phường Tân Định","province_code":"79"},{"code":"25945","name":"Phường Tân Đông Hiệp","province_code":"79"},{"code":"26710","name":"Phường Tân Hải","province_code":"79"},{"code":"25920","name":"Phường Tân Hiệp","province_code":"79"},{"code":"26995","name":"Phường Tân Hòa","province_code":"79"},{"code":"27475","name":"Phường Tân Hưng","province_code":"79"},{"code":"25891","name":"Phường Tân Khánh","province_code":"79"},{"code":"27487","name":"Phường Tân Mỹ","province_code":"79"},{"code":"27031","name":"Phường Tân Phú","province_code":"79"},{"code":"26713","name":"Phường Tân Phước","province_code":"79"},{"code":"27007","name":"Phường Tân Sơn","province_code":"79"},{"code":"26977","name":"Phường Tân Sơn Hòa","province_code":"79"},{"code":"26968","name":"Phường Tân Sơn Nhất","province_code":"79"},{"code":"27019","name":"Phường Tân Sơn Nhì","province_code":"79"},{"code":"27457","name":"Phường Tân Tạo","province_code":"79"},{"code":"26725","name":"Phường Tân Thành","province_code":"79"},{"code":"26782","name":"Phường Tân Thới Hiệp","province_code":"79"},{"code":"27478","name":"Phường Tân Thuận","province_code":"79"},{"code":"25888","name":"Phường Tân Uyên","province_code":"79"},{"code":"26842","name":"Phường Tăng Nhơn Phú","province_code":"79"},{"code":"25843","name":"Phường Tây Nam","province_code":"79"},{"code":"27013","name":"Phường Tây Thạnh","province_code":"79"},{"code":"26956","name":"Phường Thạnh Mỹ Tây","province_code":"79"},{"code":"26773","name":"Phường Thới An","province_code":"79"},{"code":"25846","name":"Phường Thới Hòa","province_code":"79"},{"code":"26898","name":"Phường Thông Tây Hội","province_code":"79"},{"code":"25747","name":"Phường Thủ Dầu Một","province_code":"79"},{"code":"26824","name":"Phường Thủ Đức","province_code":"79"},{"code":"25978","name":"Phường Thuận An","province_code":"79"},{"code":"25969","name":"Phường Thuận Giao","province_code":"79"},{"code":"26785","name":"Phường Trung Mỹ Tây","province_code":"79"},{"code":"27286","name":"Phường Vĩnh Hội","province_code":"79"},{"code":"25912","name":"Phường Vĩnh Tân","province_code":"79"},{"code":"26506","name":"Phường Vũng Tàu","province_code":"79"},{"code":"27190","name":"Phường Vườn Lài","province_code":"79"},{"code":"27259","name":"Phường Xóm Chiếu","province_code":"79"},{"code":"27139","name":"Phường Xuân Hòa","province_code":"79"},{"code":"25867","name":"Xã An Long","province_code":"79"},{"code":"27508","name":"Xã An Nhơn Tây","province_code":"79"},{"code":"27673","name":"Xã An Thới Đông","province_code":"79"},{"code":"27592","name":"Xã Bà Điểm","province_code":"79"},{"code":"25906","name":"Xã Bắc Tân Uyên","province_code":"79"},{"code":"25822","name":"Xã Bàu Bàng","province_code":"79"},{"code":"26638","name":"Xã Bàu Lâm","province_code":"79"},{"code":"27637","name":"Xã Bình Chánh","province_code":"79"},{"code":"26656","name":"Xã Bình Châu","province_code":"79"},{"code":"26590","name":"Xã Bình Giã","province_code":"79"},{"code":"27619","name":"Xã Bình Hưng","province_code":"79"},{"code":"27667","name":"Xã Bình Khánh","province_code":"79"},{"code":"27610","name":"Xã Bình Lợi","province_code":"79"},{"code":"27544","name":"Xã Bình Mỹ","province_code":"79"},{"code":"27664","name":"Xã Cần Giờ","province_code":"79"},{"code":"26596","name":"Xã Châu Đức","province_code":"79"},{"code":"26728","name":"Xã Châu Pha","province_code":"79"},{"code":"27553","name":"Xã Củ Chi","province_code":"79"},{"code":"26680","name":"Xã Đất Đỏ","province_code":"79"},{"code":"25777","name":"Xã Dầu Tiếng","province_code":"79"},{"code":"27568","name":"Xã Đông Thạnh","province_code":"79"},{"code":"27658","name":"Xã Hiệp Phước","province_code":"79"},{"code":"26620","name":"Xã Hồ Tràm","province_code":"79"},{"code":"26647","name":"Xã Hòa Hiệp","province_code":"79"},{"code":"26641","name":"Xã Hòa Hội","province_code":"79"},{"code":"27559","name":"Xã Hóc Môn","province_code":"79"},{"code":"27628","name":"Xã Hưng Long","province_code":"79"},{"code":"26608","name":"Xã Kim Long","province_code":"79"},{"code":"26659","name":"Xã Long Điền","province_code":"79"},{"code":"26662","name":"Xã Long Hải","province_code":"79"},{"code":"25792","name":"Xã Long Hòa","province_code":"79"},{"code":"26545","name":"Xã Long Sơn","province_code":"79"},{"code":"25780","name":"Xã Minh Thạnh","province_code":"79"},{"code":"26575","name":"Xã Ngãi Giao","province_code":"79"},{"code":"26617","name":"Xã Nghĩa Thành","province_code":"79"},{"code":"27655","name":"Xã Nhà Bè","province_code":"79"},{"code":"27511","name":"Xã Nhuận Đức","province_code":"79"},{"code":"25858","name":"Xã Phú Giáo","province_code":"79"},{"code":"27541","name":"Xã Phú Hòa Đông","province_code":"79"},{"code":"26686","name":"Xã Phước Hải","province_code":"79"},{"code":"25882","name":"Xã Phước Hòa","province_code":"79"},{"code":"25864","name":"Xã Phước Thành","province_code":"79"},{"code":"27496","name":"Xã Tân An Hội","province_code":"79"},{"code":"27595","name":"Xã Tân Nhựt","province_code":"79"},{"code":"27604","name":"Xã Tân Vĩnh Lộc","province_code":"79"},{"code":"27526","name":"Xã Thái Mỹ","province_code":"79"},{"code":"25807","name":"Xã Thanh An","province_code":"79"},{"code":"27676","name":"Xã Thạnh An","province_code":"79"},{"code":"25909","name":"Xã Thường Tân","province_code":"79"},{"code":"25819","name":"Xã Trừ Văn Thố","province_code":"79"},{"code":"27601","name":"Xã Vĩnh Lộc","province_code":"79"},{"code":"26584","name":"Xã Xuân Sơn","province_code":"79"},{"code":"27577","name":"Xã Xuân Thới Sơn","province_code":"79"},{"code":"26632","name":"Xã Xuyên Mộc","province_code":"79"},{"code":"07192","name":"Đặc khu Cô Tô","province_code":"22"},{"code":"06994","name":"Đặc khu Vân Đồn","province_code":"22"},{"code":"07090","name":"Phường An Sinh","province_code":"22"},{"code":"06673","name":"Phường Bãi Cháy","province_code":"22"},{"code":"07081","name":"Phường Bình Khê","province_code":"22"},{"code":"06793","name":"Phường Cẩm Phả","province_code":"22"},{"code":"06658","name":"Phường Cao Xanh","province_code":"22"},{"code":"06781","name":"Phường Cửa Ông","province_code":"22"},{"code":"07135","name":"Phường Đông Mai","province_code":"22"},{"code":"07093","name":"Phường Đông Triều","province_code":"22"},{"code":"07168","name":"Phường Hà An","province_code":"22"},{"code":"06676","name":"Phường Hà Lầm","province_code":"22"},{"code":"06688","name":"Phường Hạ Long","province_code":"22"},{"code":"06652","name":"Phường Hà Tu","province_code":"22"},{"code":"00071","name":"Phường Hiệp Hòa","province_code":"22"},{"code":"07114","name":"Phường Hoàng Quế","province_code":"22"},{"code":"07030","name":"Phường Hoành Bồ","province_code":"22"},{"code":"06685","name":"Phường Hồng Gai","province_code":"22"},{"code":"07180","name":"Phường Liên Hòa","province_code":"22"},{"code":"07069","name":"Phường Mạo Khê","province_code":"22"},{"code":"06712","name":"Phường Móng Cái 1","province_code":"22"},{"code":"06709","name":"Phường Móng Cái 2","province_code":"22"},{"code":"06736","name":"Phường Móng Cái 3","province_code":"22"},{"code":"06760","name":"Phường Mông Dương","province_code":"22"},{"code":"07183","name":"Phường Phong Cốc","province_code":"22"},{"code":"06778","name":"Phường Quang Hanh","province_code":"22"},{"code":"07132","name":"Phường Quảng Yên","province_code":"22"},{"code":"06706","name":"Phường Tuần Châu","province_code":"22"},{"code":"06811","name":"Phường Uông Bí","province_code":"22"},{"code":"06820","name":"Phường Vàng Danh","province_code":"22"},{"code":"06661","name":"Phường Việt Hưng","province_code":"22"},{"code":"06832","name":"Phường Yên Tử","province_code":"22"},{"code":"06978","name":"Xã Ba Chẽ","province_code":"22"},{"code":"06838","name":"Xã Bình Liêu","province_code":"22"},{"code":"06967","name":"Xã Cái Chiên","province_code":"22"},{"code":"06895","name":"Xã Đầm Hà","province_code":"22"},{"code":"06874","name":"Xã Điền Xá","province_code":"22"},{"code":"06877","name":"Xã Đông Ngũ","province_code":"22"},{"code":"06946","name":"Xã Đường Hoa","province_code":"22"},{"code":"06799","name":"Xã Hải Hòa","province_code":"22"},{"code":"06886","name":"Xã Hải Lạng","province_code":"22"},{"code":"06733","name":"Xã Hải Ninh","province_code":"22"},{"code":"06724","name":"Xã Hải Sơn","province_code":"22"},{"code":"06841","name":"Xã Hoành Mô","province_code":"22"},{"code":"06979","name":"Xã Kỳ Thượng","province_code":"22"},{"code":"06856","name":"Xã Lục Hồn","province_code":"22"},{"code":"06985","name":"Xã Lương Minh","province_code":"22"},{"code":"06931","name":"Xã Quảng Đức","province_code":"22"},{"code":"06922","name":"Xã Quảng Hà","province_code":"22"},{"code":"07054","name":"Xã Quảng La","province_code":"22"},{"code":"06913","name":"Xã Quảng Tân","province_code":"22"},{"code":"07060","name":"Xã Thống Nhất","province_code":"22"},{"code":"06862","name":"Xã Tiên Yên","province_code":"22"},{"code":"06757","name":"Xã Vĩnh Thực","province_code":"22"},{"code":"28777","name":"Phường An Hội","province_code":"86"},{"code":"28789","name":"Phường Bến Tre","province_code":"86"},{"code":"29771","name":"Phường Bình Minh","province_code":"86"},{"code":"29770","name":"Phường Cái Vồn","province_code":"86"},{"code":"29812","name":"Phường Đông Thành","province_code":"86"},{"code":"29512","name":"Phường Duyên Hải","province_code":"86"},{"code":"29398","name":"Phường Hòa Thuận","province_code":"86"},{"code":"29551","name":"Phường Long Châu","province_code":"86"},{"code":"29263","name":"Phường Long Đức","province_code":"86"},{"code":"29254","name":"Phường Nguyệt Hóa","province_code":"86"},{"code":"28756","name":"Phường Phú Khương","province_code":"86"},{"code":"28858","name":"Phường Phú Tân","province_code":"86"},{"code":"29557","name":"Phường Phước Hậu","province_code":"86"},{"code":"28783","name":"Phường Sơn Đông","province_code":"86"},{"code":"29593","name":"Phường Tân Hạnh","province_code":"86"},{"code":"29566","name":"Phường Tân Ngãi","province_code":"86"},{"code":"29590","name":"Phường Thanh Đức","province_code":"86"},{"code":"29242","name":"Phường Trà Vinh","province_code":"86"},{"code":"29516","name":"Phường Trường Long Hòa","province_code":"86"},{"code":"29584","name":"Xã An Bình","province_code":"86"},{"code":"28957","name":"Xã An Định","province_code":"86"},{"code":"29158","name":"Xã An Hiệp","province_code":"86"},{"code":"29143","name":"Xã An Ngãi Trung","province_code":"86"},{"code":"29317","name":"Xã An Phú Tân","province_code":"86"},{"code":"29224","name":"Xã An Qui","province_code":"86"},{"code":"29275","name":"Xã An Trường","province_code":"86"},{"code":"29110","name":"Xã Ba Tri","province_code":"86"},{"code":"29125","name":"Xã Bảo Thạnh","province_code":"86"},{"code":"29050","name":"Xã Bình Đại","province_code":"86"},{"code":"29287","name":"Xã Bình Phú","province_code":"86"},{"code":"29638","name":"Xã Bình Phước","province_code":"86"},{"code":"29728","name":"Xã Cái Ngang","province_code":"86"},{"code":"29641","name":"Xã Cái Nhum","province_code":"86"},{"code":"29266","name":"Xã Càng Long","province_code":"86"},{"code":"29308","name":"Xã Cầu Kè","province_code":"86"},{"code":"29416","name":"Xã Cầu Ngang","province_code":"86"},{"code":"28996","name":"Xã Châu Hòa","province_code":"86"},{"code":"29083","name":"Xã Châu Hưng","province_code":"86"},{"code":"29374","name":"Xã Châu Thành","province_code":"86"},{"code":"28870","name":"Xã Chợ Lách","province_code":"86"},{"code":"29491","name":"Xã Đại An","province_code":"86"},{"code":"29194","name":"Xã Đại Điền","province_code":"86"},{"code":"29497","name":"Xã Đôn Châu","province_code":"86"},{"code":"29536","name":"Xã Đông Hải","province_code":"86"},{"code":"28945","name":"Xã Đồng Khởi","province_code":"86"},{"code":"28807","name":"Xã Giao Long","province_code":"86"},{"code":"28984","name":"Xã Giồng Trôm","province_code":"86"},{"code":"29489","name":"Xã Hàm Giang","province_code":"86"},{"code":"29455","name":"Xã Hiệp Mỹ","province_code":"86"},{"code":"29701","name":"Xã Hiếu Phụng","province_code":"86"},{"code":"29713","name":"Xã Hiếu Thành","province_code":"86"},{"code":"29830","name":"Xã Hòa Bình","province_code":"86"},{"code":"29734","name":"Xã Hòa Hiệp","province_code":"86"},{"code":"29410","name":"Xã Hòa Minh","province_code":"86"},{"code":"29362","name":"Xã Hùng Hòa","province_code":"86"},{"code":"28901","name":"Xã Hưng Khánh Trung","province_code":"86"},{"code":"29407","name":"Xã Hưng Mỹ","province_code":"86"},{"code":"29044","name":"Xã Hưng Nhượng","province_code":"86"},{"code":"28981","name":"Xã Hương Mỹ","province_code":"86"},{"code":"29077","name":"Xã Lộc Thuận","province_code":"86"},{"code":"29506","name":"Xã Long Hiệp","province_code":"86"},{"code":"29602","name":"Xã Long Hồ","province_code":"86"},{"code":"29413","name":"Xã Long Hòa","province_code":"86"},{"code":"29518","name":"Xã Long Hữu","province_code":"86"},{"code":"29513","name":"Xã Long Thành","province_code":"86"},{"code":"29533","name":"Xã Long Vĩnh","province_code":"86"},{"code":"29857","name":"Xã Lục Sĩ Thành","province_code":"86"},{"code":"28987","name":"Xã Lương Hòa","province_code":"86"},{"code":"28993","name":"Xã Lương Phú","province_code":"86"},{"code":"29476","name":"Xã Lưu Nghiệp Anh","province_code":"86"},{"code":"28903","name":"Xã Mỏ Cày","province_code":"86"},{"code":"29122","name":"Xã Mỹ Chánh Hòa","province_code":"86"},{"code":"29419","name":"Xã Mỹ Long","province_code":"86"},{"code":"29788","name":"Xã Mỹ Thuận","province_code":"86"},{"code":"29767","name":"Xã Ngãi Tứ","province_code":"86"},{"code":"29530","name":"Xã Ngũ Lạc","province_code":"86"},{"code":"29302","name":"Xã Nhị Long","province_code":"86"},{"code":"29446","name":"Xã Nhị Trường","province_code":"86"},{"code":"29623","name":"Xã Nhơn Phú","province_code":"86"},{"code":"28948","name":"Xã Nhuận Phú Tân","province_code":"86"},{"code":"29329","name":"Xã Phong Thạnh","province_code":"86"},{"code":"28879","name":"Xã Phú Phụng","province_code":"86"},{"code":"29611","name":"Xã Phú Quới","province_code":"86"},{"code":"29062","name":"Xã Phú Thuận","province_code":"86"},{"code":"28810","name":"Xã Phú Túc","province_code":"86"},{"code":"29020","name":"Xã Phước Long","province_code":"86"},{"code":"28915","name":"Xã Phước Mỹ Trung","province_code":"86"},{"code":"29668","name":"Xã Quới An","province_code":"86"},{"code":"29191","name":"Xã Quới Điền","province_code":"86"},{"code":"29677","name":"Xã Quới Thiện","province_code":"86"},{"code":"29386","name":"Xã Song Lộc","province_code":"86"},{"code":"29740","name":"Xã Song Phú","province_code":"86"},{"code":"29719","name":"Xã Tam Bình","province_code":"86"},{"code":"29335","name":"Xã Tam Ngãi","province_code":"86"},{"code":"29278","name":"Xã Tân An","province_code":"86"},{"code":"29029","name":"Xã Tân Hào","province_code":"86"},{"code":"29371","name":"Xã Tân Hòa","province_code":"86"},{"code":"29653","name":"Xã Tân Long Hội","province_code":"86"},{"code":"29785","name":"Xã Tân Lược","province_code":"86"},{"code":"28840","name":"Xã Tân Phú","province_code":"86"},{"code":"29800","name":"Xã Tân Quới","province_code":"86"},{"code":"28921","name":"Xã Tân Thành Bình","province_code":"86"},{"code":"29167","name":"Xã Tân Thủy","province_code":"86"},{"code":"29137","name":"Xã Tân Xuân","province_code":"86"},{"code":"29365","name":"Xã Tập Ngãi","province_code":"86"},{"code":"29467","name":"Xã Tập Sơn","province_code":"86"},{"code":"29221","name":"Xã Thạnh Hải","province_code":"86"},{"code":"29227","name":"Xã Thạnh Phong","province_code":"86"},{"code":"29182","name":"Xã Thạnh Phú","province_code":"86"},{"code":"29104","name":"Xã Thạnh Phước","province_code":"86"},{"code":"28969","name":"Xã Thành Thới","province_code":"86"},{"code":"29089","name":"Xã Thạnh Trị","province_code":"86"},{"code":"29107","name":"Xã Thới Thuận","province_code":"86"},{"code":"28861","name":"Xã Tiên Thủy","province_code":"86"},{"code":"29341","name":"Xã Tiểu Cần","province_code":"86"},{"code":"29836","name":"Xã Trà Côn","province_code":"86"},{"code":"29461","name":"Xã Trà Cú","province_code":"86"},{"code":"29821","name":"Xã Trà Ôn","province_code":"86"},{"code":"29683","name":"Xã Trung Hiệp","province_code":"86"},{"code":"29698","name":"Xã Trung Ngãi","province_code":"86"},{"code":"29659","name":"Xã Trung Thành","province_code":"86"},{"code":"29431","name":"Xã Vinh Kim","province_code":"86"},{"code":"28894","name":"Xã Vĩnh Thành","province_code":"86"},{"code":"29845","name":"Xã Vĩnh Xuân","province_code":"86"},{"code":"29954","name":"Phường An Bình","province_code":"82"},{"code":"28315","name":"Phường Bình Xuân","province_code":"82"},{"code":"28439","name":"Phường Cai Lậy","province_code":"82"},{"code":"29869","name":"Phường Cao Lãnh","province_code":"82"},{"code":"28249","name":"Phường Đạo Thạnh","province_code":"82"},{"code":"28306","name":"Phường Gò Công","province_code":"82"},{"code":"29955","name":"Phường Hồng Ngự","province_code":"82"},{"code":"28297","name":"Phường Long Thuận","province_code":"82"},{"code":"29884","name":"Phường Mỹ Ngãi","province_code":"82"},{"code":"28273","name":"Phường Mỹ Phong","province_code":"82"},{"code":"28435","name":"Phường Mỹ Phước Tây","province_code":"82"},{"code":"28261","name":"Phường Mỹ Tho","province_code":"82"},{"code":"29888","name":"Phường Mỹ Trà","province_code":"82"},{"code":"28477","name":"Phường Nhị Quý","province_code":"82"},{"code":"29905","name":"Phường Sa Đéc","province_code":"82"},{"code":"28729","name":"Phường Sơn Qui","province_code":"82"},{"code":"28436","name":"Phường Thanh Hòa","province_code":"82"},{"code":"28270","name":"Phường Thới Sơn","province_code":"82"},{"code":"29978","name":"Phường Thường Lạc","province_code":"82"},{"code":"28285","name":"Phường Trung An","province_code":"82"},{"code":"30019","name":"Xã An Hòa","province_code":"82"},{"code":"28429","name":"Xã An Hữu","province_code":"82"},{"code":"30028","name":"Xã An Long","province_code":"82"},{"code":"29944","name":"Xã An Phước","province_code":"82"},{"code":"28633","name":"Xã An Thạnh Thủy","province_code":"82"},{"code":"30085","name":"Xã Ba Sao","province_code":"82"},{"code":"30118","name":"Xã Bình Hàng Trung","province_code":"82"},{"code":"28648","name":"Xã Bình Ninh","province_code":"82"},{"code":"28471","name":"Xã Bình Phú","province_code":"82"},{"code":"30163","name":"Xã Bình Thành","province_code":"82"},{"code":"28564","name":"Xã Bình Trưng","province_code":"82"},{"code":"28360","name":"Xã Cái Bè","province_code":"82"},{"code":"28519","name":"Xã Châu Thành","province_code":"82"},{"code":"28594","name":"Xã Chợ Gạo","province_code":"82"},{"code":"30061","name":"Xã Đốc Binh Kiều","province_code":"82"},{"code":"28660","name":"Xã Đồng Sơn","province_code":"82"},{"code":"28720","name":"Xã Gia Thuận","province_code":"82"},{"code":"28747","name":"Xã Gò Công Đông","province_code":"82"},{"code":"28366","name":"Xã Hậu Mỹ","province_code":"82"},{"code":"28501","name":"Xã Hiệp Đức","province_code":"82"},{"code":"30208","name":"Xã Hòa Long","province_code":"82"},{"code":"28393","name":"Xã Hội Cư","province_code":"82"},{"code":"28336","name":"Xã Hưng Thạnh","province_code":"82"},{"code":"28582","name":"Xã Kim Sơn","province_code":"82"},{"code":"30226","name":"Xã Lai Vung","province_code":"82"},{"code":"30169","name":"Xã Lấp Vò","province_code":"82"},{"code":"28687","name":"Xã Long Bình","province_code":"82"},{"code":"28543","name":"Xã Long Định","province_code":"82"},{"code":"28537","name":"Xã Long Hưng","province_code":"82"},{"code":"29983","name":"Xã Long Khánh","province_code":"82"},{"code":"29992","name":"Xã Long Phú Thuận","province_code":"82"},{"code":"28504","name":"Xã Long Tiên","province_code":"82"},{"code":"28615","name":"Xã Lương Hòa Lạc","province_code":"82"},{"code":"30178","name":"Xã Mỹ An Hưng","province_code":"82"},{"code":"28405","name":"Xã Mỹ Đức Tây","province_code":"82"},{"code":"30112","name":"Xã Mỹ Hiệp","province_code":"82"},{"code":"28414","name":"Xã Mỹ Lợi","province_code":"82"},{"code":"30055","name":"Xã Mỹ Quí","province_code":"82"},{"code":"28456","name":"Xã Mỹ Thành","province_code":"82"},{"code":"28378","name":"Xã Mỹ Thiện","province_code":"82"},{"code":"30076","name":"Xã Mỹ Thọ","province_code":"82"},{"code":"28603","name":"Xã Mỹ Tịnh An","province_code":"82"},{"code":"28516","name":"Xã Ngũ Hiệp","province_code":"82"},{"code":"30235","name":"Xã Phong Hòa","province_code":"82"},{"code":"30088","name":"Xã Phong Mỹ","province_code":"82"},{"code":"30025","name":"Xã Phú Cường","province_code":"82"},{"code":"30244","name":"Xã Phú Hựu","province_code":"82"},{"code":"28663","name":"Xã Phú Thành","province_code":"82"},{"code":"30034","name":"Xã Phú Thọ","province_code":"82"},{"code":"30043","name":"Xã Phương Thịnh","province_code":"82"},{"code":"30010","name":"Xã Tam Nông","province_code":"82"},{"code":"28738","name":"Xã Tân Điền","province_code":"82"},{"code":"28723","name":"Xã Tân Đông","province_code":"82"},{"code":"30214","name":"Xã Tân Dương","province_code":"82"},{"code":"29929","name":"Xã Tân Hộ Cơ","province_code":"82"},{"code":"28702","name":"Xã Tân Hòa","province_code":"82"},{"code":"29926","name":"Xã Tân Hồng","province_code":"82"},{"code":"28525","name":"Xã Tân Hương","province_code":"82"},{"code":"30184","name":"Xã Tân Khánh Trung","province_code":"82"},{"code":"30154","name":"Xã Tân Long","province_code":"82"},{"code":"30253","name":"Xã Tân Nhuận Đông","province_code":"82"},{"code":"28468","name":"Xã Tân Phú","province_code":"82"},{"code":"28696","name":"Xã Tân Phú Đông","province_code":"82"},{"code":"30259","name":"Xã Tân Phú Trung","province_code":"82"},{"code":"28321","name":"Xã Tân Phước 1","province_code":"82"},{"code":"28327","name":"Xã Tân Phước 2","province_code":"82"},{"code":"28345","name":"Xã Tân Phước 3","province_code":"82"},{"code":"29938","name":"Xã Tân Thành","province_code":"82"},{"code":"30157","name":"Xã Tân Thạnh","province_code":"82"},{"code":"28693","name":"Xã Tân Thới","province_code":"82"},{"code":"28627","name":"Xã Tân Thuận Bình","province_code":"82"},{"code":"30130","name":"Xã Thanh Bình","province_code":"82"},{"code":"28426","name":"Xã Thanh Hưng","province_code":"82"},{"code":"30073","name":"Xã Thanh Mỹ","province_code":"82"},{"code":"28444","name":"Xã Thạnh Phú","province_code":"82"},{"code":"30037","name":"Xã Tháp Mười","province_code":"82"},{"code":"29971","name":"Xã Thường Phước","province_code":"82"},{"code":"30001","name":"Xã Tràm Chim","province_code":"82"},{"code":"30046","name":"Xã Trường Xuân","province_code":"82"},{"code":"28651","name":"Xã Vĩnh Bình","province_code":"82"},{"code":"28678","name":"Xã Vĩnh Hựu","province_code":"82"},{"code":"28576","name":"Xã Vĩnh Kim","province_code":"82"},{"code":"31108","name":"Đặc khu Kiên Hải","province_code":"91"},{"code":"31078","name":"Đặc khu Phú Quốc","province_code":"91"},{"code":"31105","name":"Đặc khu Thổ Châu","province_code":"91"},{"code":"30292","name":"Phường Bình Đức","province_code":"91"},{"code":"30316","name":"Phường Châu Đốc","province_code":"91"},{"code":"30505","name":"Phường Chi Lăng","province_code":"91"},{"code":"30769","name":"Phường Hà Tiên","province_code":"91"},{"code":"30377","name":"Phường Long Phú","province_code":"91"},{"code":"30307","name":"Phường Long Xuyên","province_code":"91"},{"code":"30301","name":"Phường Mỹ Thới","province_code":"91"},{"code":"30742","name":"Phường Rạch Giá","province_code":"91"},{"code":"30376","name":"Phường Tân Châu","province_code":"91"},{"code":"30502","name":"Phường Thới Sơn","province_code":"91"},{"code":"30520","name":"Phường Tịnh Biên","province_code":"91"},{"code":"30766","name":"Phường Tô Châu","province_code":"91"},{"code":"30325","name":"Phường Vĩnh Tế","province_code":"91"},{"code":"30760","name":"Phường Vĩnh Thông","province_code":"91"},{"code":"30985","name":"Xã An Biên","province_code":"91"},{"code":"30589","name":"Xã An Châu","province_code":"91"},{"code":"30526","name":"Xã An Cư","province_code":"91"},{"code":"31018","name":"Xã An Minh","province_code":"91"},{"code":"30337","name":"Xã An Phú","province_code":"91"},{"code":"30547","name":"Xã Ba Chúc","province_code":"91"},{"code":"30898","name":"Xã Bình An","province_code":"91"},{"code":"30826","name":"Xã Bình Giang","province_code":"91"},{"code":"30607","name":"Xã Bình Hòa","province_code":"91"},{"code":"30487","name":"Xã Bình Mỹ","province_code":"91"},{"code":"30823","name":"Xã Bình Sơn","province_code":"91"},{"code":"30445","name":"Xã Bình Thạnh Đông","province_code":"91"},{"code":"30595","name":"Xã Cần Đăng","province_code":"91"},{"code":"30403","name":"Xã Châu Phong","province_code":"91"},{"code":"30463","name":"Xã Châu Phú","province_code":"91"},{"code":"30880","name":"Xã Châu Thành","province_code":"91"},{"code":"30628","name":"Xã Chợ Mới","province_code":"91"},{"code":"30409","name":"Xã Chợ Vàm","province_code":"91"},{"code":"30580","name":"Xã Cô Tô","province_code":"91"},{"code":"30643","name":"Xã Cù Lao Giêng","province_code":"91"},{"code":"30958","name":"Xã Định Hòa","province_code":"91"},{"code":"30709","name":"Xã Định Mỹ","province_code":"91"},{"code":"31024","name":"Xã Đông Hòa","province_code":"91"},{"code":"31036","name":"Xã Đông Hưng","province_code":"91"},{"code":"31006","name":"Xã Đông Thái","province_code":"91"},{"code":"30796","name":"Xã Giang Thành","province_code":"91"},{"code":"30904","name":"Xã Giồng Riềng","province_code":"91"},{"code":"30952","name":"Xã Gò Quao","province_code":"91"},{"code":"30790","name":"Xã Hòa Điền","province_code":"91"},{"code":"30934","name":"Xã Hòa Hưng","province_code":"91"},{"code":"30430","name":"Xã Hòa Lạc","province_code":"91"},{"code":"30949","name":"Xã Hòa Thuận","province_code":"91"},{"code":"30673","name":"Xã Hội An","province_code":"91"},{"code":"30817","name":"Xã Hòn Đất","province_code":"91"},{"code":"30814","name":"Xã Hòn Nghệ","province_code":"91"},{"code":"30341","name":"Xã Khánh Bình","province_code":"91"},{"code":"30787","name":"Xã Kiên Lương","province_code":"91"},{"code":"30631","name":"Xã Long Điền","province_code":"91"},{"code":"30664","name":"Xã Long Kiến","province_code":"91"},{"code":"30943","name":"Xã Long Thạnh","province_code":"91"},{"code":"30469","name":"Xã Mỹ Đức","province_code":"91"},{"code":"30313","name":"Xã Mỹ Hòa Hưng","province_code":"91"},{"code":"30838","name":"Xã Mỹ Thuận","province_code":"91"},{"code":"30928","name":"Xã Ngọc Chúc","province_code":"91"},{"code":"30346","name":"Xã Nhơn Hội","province_code":"91"},{"code":"30658","name":"Xã Nhơn Mỹ","province_code":"91"},{"code":"30538","name":"Xã Núi Cấm","province_code":"91"},{"code":"30577","name":"Xã Ô Lâm","province_code":"91"},{"code":"30688","name":"Xã Óc Eo","province_code":"91"},{"code":"30436","name":"Xã Phú An","province_code":"91"},{"code":"30685","name":"Xã Phú Hòa","province_code":"91"},{"code":"30352","name":"Xã Phú Hữu","province_code":"91"},{"code":"30421","name":"Xã Phú Lâm","province_code":"91"},{"code":"30406","name":"Xã Phú Tân","province_code":"91"},{"code":"30811","name":"Xã Sơn Hải","province_code":"91"},{"code":"30835","name":"Xã Sơn Kiên","province_code":"91"},{"code":"30388","name":"Xã Tân An","province_code":"91"},{"code":"30850","name":"Xã Tân Hiệp","province_code":"91"},{"code":"30856","name":"Xã Tân Hội","province_code":"91"},{"code":"31031","name":"Xã Tân Thạnh","province_code":"91"},{"code":"30691","name":"Xã Tây Phú","province_code":"91"},{"code":"30988","name":"Xã Tây Yên","province_code":"91"},{"code":"30874","name":"Xã Thạnh Đông","province_code":"91"},{"code":"30910","name":"Xã Thạnh Hưng","province_code":"91"},{"code":"30886","name":"Xã Thạnh Lộc","province_code":"91"},{"code":"30481","name":"Xã Thạnh Mỹ Tây","province_code":"91"},{"code":"30682","name":"Xã Thoại Sơn","province_code":"91"},{"code":"30781","name":"Xã Tiên Hải","province_code":"91"},{"code":"30544","name":"Xã Tri Tôn","province_code":"91"},{"code":"31027","name":"Xã u Minh Thượng","province_code":"91"},{"code":"31042","name":"Xã Vân Khánh","province_code":"91"},{"code":"30604","name":"Xã Vĩnh An","province_code":"91"},{"code":"31064","name":"Xã Vĩnh Bình","province_code":"91"},{"code":"30793","name":"Xã Vĩnh Điều","province_code":"91"},{"code":"30568","name":"Xã Vĩnh Gia","province_code":"91"},{"code":"30619","name":"Xã Vĩnh Hanh","province_code":"91"},{"code":"30367","name":"Xã Vĩnh Hậu","province_code":"91"},{"code":"31012","name":"Xã Vĩnh Hòa","province_code":"91"},{"code":"30970","name":"Xã Vĩnh Hòa Hưng","province_code":"91"},{"code":"31051","name":"Xã Vĩnh Phong","province_code":"91"},{"code":"30478","name":"Xã Vĩnh Thạnh Trung","province_code":"91"},{"code":"31069","name":"Xã Vĩnh Thuận","province_code":"91"},{"code":"30697","name":"Xã Vĩnh Trạch","province_code":"91"},{"code":"30982","name":"Xã Vĩnh Tuy","province_code":"91"},{"code":"30385","name":"Xã Vĩnh Xương","province_code":"91"},{"code":"31150","name":"Phường An Bình","province_code":"92"},{"code":"31168","name":"Phường Bình Thủy","province_code":"92"},{"code":"31120","name":"Phường Cái Khế","province_code":"92"},{"code":"31186","name":"Phường Cái Răng","province_code":"92"},{"code":"31411","name":"Phường Đại Thành","province_code":"92"},{"code":"31201","name":"Phường Hưng Phú","province_code":"92"},{"code":"31789","name":"Phường Khánh Hòa","province_code":"92"},{"code":"31473","name":"Phường Long Bình","province_code":"92"},{"code":"31471","name":"Phường Long Mỹ","province_code":"92"},{"code":"31480","name":"Phường Long Phú 1","province_code":"92"},{"code":"31183","name":"Phường Long Tuyền","province_code":"92"},{"code":"31753","name":"Phường Mỹ Quới","province_code":"92"},{"code":"31684","name":"Phường Mỹ Xuyên","province_code":"92"},{"code":"31340","name":"Phường Ngã Bảy","province_code":"92"},{"code":"31732","name":"Phường Ngã Năm","province_code":"92"},{"code":"31135","name":"Phường Ninh Kiều","province_code":"92"},{"code":"31153","name":"Phường Ô Môn","province_code":"92"},{"code":"31299","name":"Xã Phong Điền","province_code":"92"},{"code":"31510","name":"Phường Phú Lợi","province_code":"92"},{"code":"31162","name":"Phường Phước Thới","province_code":"92"},{"code":"31507","name":"Phường Sóc Trăng","province_code":"92"},{"code":"31147","name":"Phường Tân An","province_code":"92"},{"code":"31174","name":"Phường Thới An Đông","province_code":"92"},{"code":"31157","name":"Phường Thới Long","province_code":"92"},{"code":"31207","name":"Phường Thốt Nốt","province_code":"92"},{"code":"31228","name":"Phường Thuận Hưng","province_code":"92"},{"code":"31217","name":"Phường Trung Nhứt","province_code":"92"},{"code":"31333","name":"Phường Vị Tân","province_code":"92"},{"code":"31321","name":"Phường Vị Thanh","province_code":"92"},{"code":"31783","name":"Phường Vĩnh Châu","province_code":"92"},{"code":"31804","name":"Phường Vĩnh Phước","province_code":"92"},{"code":"31531","name":"Xã An Lạc Thôn","province_code":"92"},{"code":"31594","name":"Xã An Ninh","province_code":"92"},{"code":"31615","name":"Xã An Thạnh","province_code":"92"},{"code":"31366","name":"Xã Châu Thành","province_code":"92"},{"code":"31261","name":"Xã Cờ Đỏ","province_code":"92"},{"code":"31633","name":"Xã Cù Lao Dung","province_code":"92"},{"code":"31561","name":"Xã Đại Hải","province_code":"92"},{"code":"31645","name":"Xã Đại Ngãi","province_code":"92"},{"code":"31273","name":"Xã Đông Hiệp","province_code":"92"},{"code":"31369","name":"Xã Đông Phước","province_code":"92"},{"code":"31282","name":"Xã Đông Thuận","province_code":"92"},{"code":"31726","name":"Xã Gia Hòa","province_code":"92"},{"code":"31396","name":"Xã Hiệp Hưng","province_code":"92"},{"code":"31570","name":"Xã Hồ Đắc Kiện","province_code":"92"},{"code":"31393","name":"Xã Hòa An","province_code":"92"},{"code":"31338","name":"Xã Hỏa Lựu","province_code":"92"},{"code":"31717","name":"Xã Hòa Tú","province_code":"92"},{"code":"31528","name":"Xã Kế Sách","province_code":"92"},{"code":"31810","name":"Xã Lai Hòa","province_code":"92"},{"code":"31759","name":"Xã Lâm Tân","province_code":"92"},{"code":"31679","name":"Xã Lịch Hội Thượng","province_code":"92"},{"code":"31675","name":"Xã Liêu Tú","province_code":"92"},{"code":"31579","name":"Xã Long Hưng","province_code":"92"},{"code":"31639","name":"Xã Long Phú","province_code":"92"},{"code":"31492","name":"Xã Lương Tâm","province_code":"92"},{"code":"31591","name":"Xã Mỹ Hương","province_code":"92"},{"code":"31603","name":"Xã Mỹ Phước","province_code":"92"},{"code":"31567","name":"Xã Mỹ Tú","province_code":"92"},{"code":"31723","name":"Xã Ngọc Tố","province_code":"92"},{"code":"31315","name":"Xã Nhơn Ái","province_code":"92"},{"code":"31552","name":"Xã Nhơn Mỹ","province_code":"92"},{"code":"31708","name":"Xã Nhu Gia","province_code":"92"},{"code":"31537","name":"Xã Phong Nẫm","province_code":"92"},{"code":"31378","name":"Xã Phú Hữu","province_code":"92"},{"code":"31756","name":"Xã Phú Lộc","province_code":"92"},{"code":"31569","name":"Xã Phú Tâm","province_code":"92"},{"code":"31420","name":"Xã Phụng Hiệp","province_code":"92"},{"code":"31426","name":"Xã Phương Bình","province_code":"92"},{"code":"31687","name":"Xã Tài Văn","province_code":"92"},{"code":"31399","name":"Xã Tân Bình","province_code":"92"},{"code":"31342","name":"Xã Tân Hòa","province_code":"92"},{"code":"31213","name":"Phường Tân Lộc","province_code":"92"},{"code":"31741","name":"Xã Tân Long","province_code":"92"},{"code":"31432","name":"Xã Tân Phước Hưng","province_code":"92"},{"code":"31666","name":"Xã Tân Thạnh","province_code":"92"},{"code":"31231","name":"Xã Thạnh An","province_code":"92"},{"code":"31408","name":"Xã Thạnh Hòa","province_code":"92"},{"code":"31249","name":"Xã Thạnh Phú","province_code":"92"},{"code":"31246","name":"Xã Thạnh Quới","province_code":"92"},{"code":"31699","name":"Xã Thạnh Thới An","province_code":"92"},{"code":"31360","name":"Xã Thạnh Xuân","province_code":"92"},{"code":"31540","name":"Xã Thới An Hội","province_code":"92"},{"code":"31264","name":"Xã Thới Hưng","province_code":"92"},{"code":"31258","name":"Xã Thới Lai","province_code":"92"},{"code":"31582","name":"Xã Thuận Hòa","province_code":"92"},{"code":"31673","name":"Xã Trần Đề","province_code":"92"},{"code":"31255","name":"Xã Trung Hưng","province_code":"92"},{"code":"31654","name":"Xã Trường Khánh","province_code":"92"},{"code":"31309","name":"Xã Trường Long","province_code":"92"},{"code":"31348","name":"Xã Trường Long Tây","province_code":"92"},{"code":"31288","name":"Xã Trường Thành","province_code":"92"},{"code":"31294","name":"Xã Trường Xuân","province_code":"92"},{"code":"31465","name":"Xã Vị Thanh 1","province_code":"92"},{"code":"31441","name":"Xã Vị Thủy","province_code":"92"},{"code":"31795","name":"Xã Vĩnh Hải","province_code":"92"},{"code":"31777","name":"Xã Vĩnh Lợi","province_code":"92"},{"code":"31232","name":"Xã Vĩnh Thạnh","province_code":"92"},{"code":"31453","name":"Xã Vĩnh Thuận Đông","province_code":"92"},{"code":"31237","name":"Xã Vĩnh Trinh","province_code":"92"},{"code":"31459","name":"Xã Vĩnh Tường","province_code":"92"},{"code":"31489","name":"Xã Vĩnh Viễn","province_code":"92"},{"code":"31495","name":"Xã Xà Phiên","province_code":"92"},{"code":"32002","name":"Phường An Xuyên","province_code":"96"},{"code":"31825","name":"Phường Bạc Liêu","province_code":"96"},{"code":"31942","name":"Phường Giá Rai","province_code":"96"},{"code":"31840","name":"Phường Hiệp Thành","province_code":"96"},{"code":"32041","name":"Phường Hòa Thành","province_code":"96"},{"code":"31951","name":"Phường Láng Tròn","province_code":"96"},{"code":"32014","name":"Phường Lý Văn Lâm","province_code":"96"},{"code":"32025","name":"Phường Tân Thành","province_code":"96"},{"code":"31834","name":"Phường Vĩnh Trạch","province_code":"96"},{"code":"31988","name":"Xã An Trạch","province_code":"96"},{"code":"32069","name":"Xã Biển Bạch","province_code":"96"},{"code":"32212","name":"Xã Cái Đôi Vàm","province_code":"96"},{"code":"32128","name":"Xã Cái Nước","province_code":"96"},{"code":"31894","name":"Xã Châu Thới","province_code":"96"},{"code":"32104","name":"Xã Đá Bạc","province_code":"96"},{"code":"32152","name":"Xã Đầm Dơi","province_code":"96"},{"code":"32201","name":"Xã Đất Mới","province_code":"96"},{"code":"32248","name":"Xã Đất Mũi","province_code":"96"},{"code":"31993","name":"Xã Định Thành","province_code":"96"},{"code":"31975","name":"Xã Đông Hải","province_code":"96"},{"code":"31972","name":"Xã Gành Hào","province_code":"96"},{"code":"32092","name":"Xã Hồ Thị Kỷ","province_code":"96"},{"code":"31891","name":"Xã Hòa Bình","province_code":"96"},{"code":"31843","name":"Xã Hồng Dân","province_code":"96"},{"code":"31906","name":"Xã Hưng Hội","province_code":"96"},{"code":"32140","name":"Xã Hưng Mỹ","province_code":"96"},{"code":"32059","name":"Xã Khánh An","province_code":"96"},{"code":"32110","name":"Xã Khánh Bình","province_code":"96"},{"code":"32119","name":"Xã Khánh Hưng","province_code":"96"},{"code":"32062","name":"Xã Khánh Lâm","province_code":"96"},{"code":"31985","name":"Xã Long Điền","province_code":"96"},{"code":"32134","name":"Xã Lương Thế Trân","province_code":"96"},{"code":"32191","name":"Xã Năm Căn","province_code":"96"},{"code":"32044","name":"Xã Nguyễn Phích","province_code":"96"},{"code":"32227","name":"Xã Nguyễn Việt Khái","province_code":"96"},{"code":"31849","name":"Xã Ninh Quới","province_code":"96"},{"code":"31864","name":"Xã Ninh Thạnh Lợi","province_code":"96"},{"code":"32244","name":"Xã Phan Ngọc Hiển","province_code":"96"},{"code":"31885","name":"Xã Phong Hiệp","province_code":"96"},{"code":"31957","name":"Xã Phong Thạnh","province_code":"96"},{"code":"32214","name":"Xã Phú Mỹ","province_code":"96"},{"code":"32218","name":"Xã Phú Tân","province_code":"96"},{"code":"31867","name":"Xã Phước Long","province_code":"96"},{"code":"32182","name":"Xã Quách Phẩm","province_code":"96"},{"code":"32098","name":"Xã Sông Đốc","province_code":"96"},{"code":"32155","name":"Xã Tạ An Khương","province_code":"96"},{"code":"32206","name":"Xã Tam Giang","province_code":"96"},{"code":"32236","name":"Xã Tân Ân","province_code":"96"},{"code":"32137","name":"Xã Tân Hưng","province_code":"96"},{"code":"32083","name":"Xã Tân Lộc","province_code":"96"},{"code":"32167","name":"Xã Tân Thuận","province_code":"96"},{"code":"32188","name":"Xã Tân Tiến","province_code":"96"},{"code":"32185","name":"Xã Thanh Tùng","province_code":"96"},{"code":"32065","name":"Xã Thới Bình","province_code":"96"},{"code":"32161","name":"Xã Trần Phán","province_code":"96"},{"code":"32095","name":"Xã Trần Văn Thời","province_code":"96"},{"code":"32071","name":"Xã Trí Phải","province_code":"96"},{"code":"32047","name":"Xã U Minh","province_code":"96"},{"code":"31927","name":"Xã Vĩnh Hậu","province_code":"96"},{"code":"31858","name":"Xã Vĩnh Lộc","province_code":"96"},{"code":"31900","name":"Xã Vĩnh Lợi","province_code":"96"},{"code":"31918","name":"Xã Vĩnh Mỹ","province_code":"96"},{"code":"31876","name":"Xã Vĩnh Phước","province_code":"96"},{"code":"31882","name":"Xã Vĩnh Thanh","province_code":"96"},{"code":"11948","name":"Đặc khu Bạch Long Vĩ","province_code":"31"},{"code":"11914","name":"Đặc khu Cát Hải","province_code":"31"},{"code":"10660","name":"Phường Ái Quốc","province_code":"31"},{"code":"11407","name":"Phường An Biên","province_code":"31"},{"code":"11581","name":"Phường An Dương","province_code":"31"},{"code":"11617","name":"Phường An Hải","province_code":"31"},{"code":"11593","name":"Phường An Phong","province_code":"31"},{"code":"10678","name":"Phường Bắc An Phụ","province_code":"31"},{"code":"11473","name":"Phường Bạch Đằng","province_code":"31"},{"code":"10546","name":"Phường Chí Linh","province_code":"31"},{"code":"10549","name":"Phường Chu Văn An","province_code":"31"},{"code":"11455","name":"Phường Đồ Sơn","province_code":"31"},{"code":"11411","name":"Phường Đông Hải","province_code":"31"},{"code":"11692","name":"Phường Dương Kinh","province_code":"31"},{"code":"11359","name":"Phường Gia Viên","province_code":"31"},{"code":"11413","name":"Phường Hải An","province_code":"31"},{"code":"10525","name":"Phường Hải Dương","province_code":"31"},{"code":"11533","name":"Phường Hòa Bình","province_code":"31"},{"code":"11602","name":"Phường Hồng An","province_code":"31"},{"code":"11311","name":"Phường Hồng Bàng","province_code":"31"},{"code":"11689","name":"Phường Hưng Đạo","province_code":"31"},{"code":"11443","name":"Phường Kiến An","province_code":"31"},{"code":"10675","name":"Phường Kinh Môn","province_code":"31"},{"code":"11383","name":"Phường Lê Chân","province_code":"31"},{"code":"10603","name":"Phường Lê Đại Hành","province_code":"31"},{"code":"11506","name":"Phường Lê Ích Mộc","province_code":"31"},{"code":"10532","name":"Phường Lê Thanh Nghị","province_code":"31"},{"code":"11488","name":"Phường Lưu Kiếm","province_code":"31"},{"code":"11737","name":"Phường Nam Đồ Sơn","province_code":"31"},{"code":"10837","name":"Phường Nam Đồng","province_code":"31"},{"code":"11542","name":"Phường Nam Triệu","province_code":"31"},{"code":"11329","name":"Phường Ngô Quyền","province_code":"31"},{"code":"10744","name":"Phường Nguyễn Đại Năng","province_code":"31"},{"code":"10552","name":"Phường Nguyễn Trãi","province_code":"31"},{"code":"10714","name":"Phường Nhị Chiểu","province_code":"31"},{"code":"10726","name":"Phường Phạm Sư Mạnh","province_code":"31"},{"code":"11446","name":"Phường Phù Liễn","province_code":"31"},{"code":"10537","name":"Phường Tân Hưng","province_code":"31"},{"code":"11002","name":"Phường Thạch Khôi","province_code":"31"},{"code":"10507","name":"Phường Thành Đông","province_code":"31"},{"code":"11557","name":"Phường Thiên Hương","province_code":"31"},{"code":"11560","name":"Phường Thủy Nguyên","province_code":"31"},{"code":"10570","name":"Phường Trần Hưng Đạo","province_code":"31"},{"code":"10729","name":"Phường Trần Liễu","province_code":"31"},{"code":"10573","name":"Phường Trần Nhân Tông","province_code":"31"},{"code":"10891","name":"Phường Tứ Minh","province_code":"31"},{"code":"11848","name":"Xã Vĩnh Hòa","province_code":"31"},{"code":"11674","name":"Xã An Hưng","province_code":"31"},{"code":"11668","name":"Xã An Khánh","province_code":"31"},{"code":"11629","name":"Xã An Lão","province_code":"31"},{"code":"10645","name":"Xã An Phú","province_code":"31"},{"code":"11647","name":"Xã An Quang","province_code":"31"},{"code":"10792","name":"Xã An Thành","province_code":"31"},{"code":"11635","name":"Xã An Trường","province_code":"31"},{"code":"11254","name":"Xã Bắc Thanh Miện","province_code":"31"},{"code":"10966","name":"Xã Bình Giang","province_code":"31"},{"code":"10888","name":"Xã Cẩm Giang","province_code":"31"},{"code":"10903","name":"Xã Cẩm Giàng","province_code":"31"},{"code":"11806","name":"Xã Chấn Hưng","province_code":"31"},{"code":"11131","name":"Xã Chí Minh","province_code":"31"},{"code":"11086","name":"Xã Đại Sơn","province_code":"31"},{"code":"10972","name":"Xã Đường An","province_code":"31"},{"code":"10999","name":"Xã Gia Lộc","province_code":"31"},{"code":"11050","name":"Xã Gia Phúc","province_code":"31"},{"code":"10816","name":"Xã Hà Bắc","province_code":"31"},{"code":"10882","name":"Xã Hà Đông","province_code":"31"},{"code":"10843","name":"Xã Hà Nam","province_code":"31"},{"code":"10846","name":"Xã Hà Tây","province_code":"31"},{"code":"11257","name":"Xã Hải Hưng","province_code":"31"},{"code":"11218","name":"Xã Hồng Châu","province_code":"31"},{"code":"10615","name":"Xã Hợp Tiến","province_code":"31"},{"code":"11809","name":"Xã Hùng Thắng","province_code":"31"},{"code":"10945","name":"Xã Kẻ Sặt","province_code":"31"},{"code":"11224","name":"Xã Khúc Thừa Dụ","province_code":"31"},{"code":"11749","name":"Xã Kiến Hải","province_code":"31"},{"code":"11728","name":"Xã Kiến Hưng","province_code":"31"},{"code":"11725","name":"Xã Kiến Minh","province_code":"31"},{"code":"11680","name":"Xã Kiến Thụy","province_code":"31"},{"code":"10804","name":"Xã Kim Thành","province_code":"31"},{"code":"11140","name":"Xã Lạc Phượng","province_code":"31"},{"code":"10756","name":"Xã Lai Khê","province_code":"31"},{"code":"10930","name":"Xã Mao Điền","province_code":"31"},{"code":"10705","name":"Xã Nam An Phụ","province_code":"31"},{"code":"10606","name":"Xã Nam Sách","province_code":"31"},{"code":"11284","name":"Xã Nam Thanh Miện","province_code":"31"},{"code":"11713","name":"Xã Nghi Dương","province_code":"31"},{"code":"11911","name":"Xã Nguyễn Bỉnh Khiêm","province_code":"31"},{"code":"11146","name":"Xã Nguyên Giáp","province_code":"31"},{"code":"11242","name":"Xã Nguyễn Lương Bằng","province_code":"31"},{"code":"11203","name":"Xã Ninh Giang","province_code":"31"},{"code":"10750","name":"Xã Phú Thái","province_code":"31"},{"code":"11761","name":"Xã Quyết Thắng","province_code":"31"},{"code":"11167","name":"Xã Tân An","province_code":"31"},{"code":"11113","name":"Xã Tân Kỳ","province_code":"31"},{"code":"11779","name":"Xã Tân Minh","province_code":"31"},{"code":"10642","name":"Xã Thái Tân","province_code":"31"},{"code":"10813","name":"Xã Thanh Hà","province_code":"31"},{"code":"11239","name":"Xã Thanh Miện","province_code":"31"},{"code":"10993","name":"Xã Thượng Hồng","province_code":"31"},{"code":"11755","name":"Xã Tiên Lãng","province_code":"31"},{"code":"11791","name":"Xã Tiên Minh","province_code":"31"},{"code":"10633","name":"Xã Trần Phú","province_code":"31"},{"code":"11065","name":"Xã Trường Tân","province_code":"31"},{"code":"11074","name":"Xã Tứ Kỳ","province_code":"31"},{"code":"10909","name":"Xã Tuệ Tĩnh","province_code":"31"},{"code":"10543","name":"Phường Việt Hòa","province_code":"31"},{"code":"11503","name":"Xã Việt Khê","province_code":"31"},{"code":"11887","name":"Xã Vĩnh Am","province_code":"31"},{"code":"11824","name":"Xã Vĩnh Bảo","province_code":"31"},{"code":"11875","name":"Xã Vĩnh Hải","province_code":"31"},{"code":"11164","name":"Xã Vĩnh Lại","province_code":"31"},{"code":"11836","name":"Xã Vĩnh Thịnh","province_code":"31"},{"code":"11842","name":"Xã Vĩnh Thuận","province_code":"31"},{"code":"11020","name":"Xã Yết Kiêu","province_code":"31"},{"code":"12133","name":"Phường Đường Hào","province_code":"33"},{"code":"11980","name":"Phường Hồng Châu","province_code":"33"},{"code":"12103","name":"Phường Mỹ Hào","province_code":"33"},{"code":"11953","name":"Phường Phố Hiến","province_code":"33"},{"code":"11983","name":"Phường Sơn Nam","province_code":"33"},{"code":"13225","name":"Phường Thái Bình","province_code":"33"},{"code":"12127","name":"Phường Thượng Hồng","province_code":"33"},{"code":"12817","name":"Phường Trà Lý","province_code":"33"},{"code":"12452","name":"Phường Trần Hưng Đạo","province_code":"33"},{"code":"12454","name":"Phường Trần Lãm","province_code":"33"},{"code":"12466","name":"Phường Vũ Phúc","province_code":"33"},{"code":"12499","name":"Xã A Sào","province_code":"33"},{"code":"13021","name":"Xã Ái Quốc","province_code":"33"},{"code":"12142","name":"Xã Ân Thi","province_code":"33"},{"code":"12694","name":"Xã Bắc Đông Hưng","province_code":"33"},{"code":"12745","name":"Xã Bắc Đông Quan","province_code":"33"},{"code":"12916","name":"Xã Bắc Thái Ninh","province_code":"33"},{"code":"12859","name":"Xã Bắc Thụy Anh","province_code":"33"},{"code":"12700","name":"Xã Bắc Tiên Hưng","province_code":"33"},{"code":"13186","name":"Xã Bình Định","province_code":"33"},{"code":"13096","name":"Xã Bình Nguyên","province_code":"33"},{"code":"13183","name":"Xã Bình Thanh","province_code":"33"},{"code":"12247","name":"Xã Châu Ninh","province_code":"33"},{"code":"12271","name":"Xã Chí Minh","province_code":"33"},{"code":"11995","name":"Xã Đại Đồng","province_code":"33"},{"code":"12619","name":"Xã Diên Hà","province_code":"33"},{"code":"12406","name":"Xã Đoàn Đào","province_code":"33"},{"code":"12526","name":"Xã Đồng Bằng","province_code":"33"},{"code":"13003","name":"Xã Đồng Châu","province_code":"33"},{"code":"12688","name":"Xã Đông Hưng","province_code":"33"},{"code":"12793","name":"Xã Đông Quan","province_code":"33"},{"code":"12943","name":"Xã Đông Thái Ninh","province_code":"33"},{"code":"12862","name":"Xã Đông Thụy Anh","province_code":"33"},{"code":"12988","name":"Xã Đông Tiền Hải","province_code":"33"},{"code":"12736","name":"Xã Đông Tiên Hưng","province_code":"33"},{"code":"12313","name":"Xã Đức Hợp","province_code":"33"},{"code":"12322","name":"Xã Hiệp Cường","province_code":"33"},{"code":"12070","name":"Xã Hoàn Long","province_code":"33"},{"code":"12337","name":"Xã Hoàng Hoa Thám","province_code":"33"},{"code":"12685","name":"Xã Hồng Minh","province_code":"33"},{"code":"12196","name":"Xã Hồng Quang","province_code":"33"},{"code":"13159","name":"Xã Hồng Vũ","province_code":"33"},{"code":"12586","name":"Xã Hưng Hà","province_code":"33"},{"code":"13066","name":"Xã Hưng Phú","province_code":"33"},{"code":"12205","name":"Xã Khoái Châu","province_code":"33"},{"code":"13075","name":"Xã Kiến Xương","province_code":"33"},{"code":"11992","name":"Xã Lạc Đạo","province_code":"33"},{"code":"13120","name":"Xã Lê Lợi","province_code":"33"},{"code":"12676","name":"Xã Lê Quý Đôn","province_code":"33"},{"code":"12613","name":"Xã Long Hưng","province_code":"33"},{"code":"12280","name":"Xã Lương Bằng","province_code":"33"},{"code":"12049","name":"Xã Mễ Sở","province_code":"33"},{"code":"12511","name":"Xã Minh Thọ","province_code":"33"},{"code":"13057","name":"Xã Nam Cường","province_code":"33"},{"code":"12775","name":"Xã Nam Đông Hưng","province_code":"33"},{"code":"12961","name":"Xã Nam Thái Ninh","province_code":"33"},{"code":"12904","name":"Xã Nam Thụy Anh","province_code":"33"},{"code":"13063","name":"Xã Nam Tiền Hải","province_code":"33"},{"code":"12763","name":"Xã Nam Tiên Hưng","province_code":"33"},{"code":"12286","name":"Xã Nghĩa Dân","province_code":"33"},{"code":"12031","name":"Xã Nghĩa Trụ","province_code":"33"},{"code":"12517","name":"Xã Ngọc Lâm","province_code":"33"},{"code":"12595","name":"Xã Ngự Thiên","province_code":"33"},{"code":"12532","name":"Xã Nguyễn Du","province_code":"33"},{"code":"12184","name":"Xã Nguyễn Trãi","province_code":"33"},{"code":"12064","name":"Xã Nguyễn Văn Linh","province_code":"33"},{"code":"12004","name":"Xã Như Quỳnh","province_code":"33"},{"code":"12148","name":"Xã Phạm Ngũ Lão","province_code":"33"},{"code":"12523","name":"Xã Phụ Dực","province_code":"33"},{"code":"12025","name":"Xã Phụng Công","province_code":"33"},{"code":"12391","name":"Xã Quang Hưng","province_code":"33"},{"code":"13132","name":"Xã Quang Lịch","province_code":"33"},{"code":"12577","name":"Xã Quỳnh An","province_code":"33"},{"code":"12472","name":"Xã Quỳnh Phụ","province_code":"33"},{"code":"11977","name":"Xã Tân Hưng","province_code":"33"},{"code":"13246","name":"Xã Tân Thuận","province_code":"33"},{"code":"12583","name":"Xã Tân Tiến","province_code":"33"},{"code":"12919","name":"Xã Tây Thái Ninh","province_code":"33"},{"code":"12850","name":"Xã Tây Thụy Anh","province_code":"33"},{"code":"13039","name":"Xã Tây Tiền Hải","province_code":"33"},{"code":"12922","name":"Xã Thái Ninh","province_code":"33"},{"code":"12826","name":"Xã Thái Thụy","province_code":"33"},{"code":"12631","name":"Xã Thần Khê","province_code":"33"},{"code":"13222","name":"Xã Thư Trì","province_code":"33"},{"code":"13264","name":"Xã Thư Vũ","province_code":"33"},{"code":"12865","name":"Xã Thụy Anh","province_code":"33"},{"code":"12970","name":"Xã Tiền Hải","province_code":"33"},{"code":"12361","name":"Xã Tiên Hoa","province_code":"33"},{"code":"12754","name":"Xã Tiên Hưng","province_code":"33"},{"code":"12634","name":"Xã Tiên La","province_code":"33"},{"code":"12364","name":"Xã Tiên Lữ","province_code":"33"},{"code":"12424","name":"Xã Tiên Tiến","province_code":"33"},{"code":"12427","name":"Xã Tống Trân","province_code":"33"},{"code":"13093","name":"Xã Trà Giang","province_code":"33"},{"code":"12223","name":"Xã Triệu Việt Vương","province_code":"33"},{"code":"12019","name":"Xã Văn Giang","province_code":"33"},{"code":"13219","name":"Xã Vạn Xuân","province_code":"33"},{"code":"12238","name":"Xã Việt Tiến","province_code":"33"},{"code":"12091","name":"Xã Việt Yên","province_code":"33"},{"code":"13141","name":"Xã Vũ Quý","province_code":"33"},{"code":"13192","name":"Xã Vũ Thư","province_code":"33"},{"code":"13279","name":"Xã Vũ Tiên","province_code":"33"},{"code":"12166","name":"Xã Xuân Trúc","province_code":"33"},{"code":"12073","name":"Xã Yên Mỹ","province_code":"33"},{"code":"13318","name":"Phường Châu Sơn","province_code":"37"},{"code":"13693","name":"Phường Đông A","province_code":"37"},{"code":"14566","name":"Phường Đông Hoa Lư","province_code":"37"},{"code":"13348","name":"Phường Đồng Văn","province_code":"37"},{"code":"13336","name":"Phường Duy Hà","province_code":"37"},{"code":"13330","name":"Phường Duy Tân","province_code":"37"},{"code":"13324","name":"Phường Duy Tiên","province_code":"37"},{"code":"13366","name":"Phường Hà Nam","province_code":"37"},{"code":"14329","name":"Phường Hoa Lư","province_code":"37"},{"code":"13984","name":"Phường Hồng Quang","province_code":"37"},{"code":"13384","name":"Phường Kim Bảng","province_code":"37"},{"code":"13402","name":"Phường Kim Thanh","province_code":"37"},{"code":"13393","name":"Phường Lê Hồ","province_code":"37"},{"code":"13444","name":"Phường Liêm Tuyền","province_code":"37"},{"code":"13435","name":"Phường Lý Thường Kiệt","province_code":"37"},{"code":"13708","name":"Phường Mỹ Lộc","province_code":"37"},{"code":"13669","name":"Phường Nam Định","province_code":"37"},{"code":"14359","name":"Phường Nam Hoa Lư","province_code":"37"},{"code":"13396","name":"Phường Nguyễn Úy","province_code":"37"},{"code":"13285","name":"Phường Phủ Lý","province_code":"37"},{"code":"13291","name":"Phường Phù Vân","province_code":"37"},{"code":"13420","name":"Phường Tam Chúc","province_code":"37"},{"code":"14362","name":"Phường Tam Điệp","province_code":"37"},{"code":"14533","name":"Phường Tây Hoa Lư","province_code":"37"},{"code":"13699","name":"Phường Thành Nam","province_code":"37"},{"code":"13684","name":"Phường Thiên Trường","province_code":"37"},{"code":"13363","name":"Phường Tiên Sơn","province_code":"37"},{"code":"14365","name":"Phường Trung Sơn","province_code":"37"},{"code":"13777","name":"Phường Trường Thi","province_code":"37"},{"code":"13972","name":"Phường Vị Khê","province_code":"37"},{"code":"14371","name":"Phường Yên Sơn","province_code":"37"},{"code":"14725","name":"Phường Yên Thắng","province_code":"37"},{"code":"13579","name":"Xã Bắc Lý","province_code":"37"},{"code":"13540","name":"Xã Bình An","province_code":"37"},{"code":"13531","name":"Xã Bình Giang","province_code":"37"},{"code":"13504","name":"Xã Bình Lục","province_code":"37"},{"code":"14623","name":"Xã Bình Minh","province_code":"37"},{"code":"13501","name":"Xã Bình Mỹ","province_code":"37"},{"code":"13558","name":"Xã Bình Sơn","province_code":"37"},{"code":"14056","name":"Xã Cát Thành","province_code":"37"},{"code":"14653","name":"Xã Chất Bình","province_code":"37"},{"code":"14026","name":"Xã Cổ Lễ","province_code":"37"},{"code":"14404","name":"Xã Cúc Phương","province_code":"37"},{"code":"14500","name":"Xã Đại Hoàng","province_code":"37"},{"code":"14677","name":"Xã Định Hóa","province_code":"37"},{"code":"14746","name":"Xã Đồng Thái","province_code":"37"},{"code":"13900","name":"Xã Đồng Thịnh","province_code":"37"},{"code":"14482","name":"Xã Gia Hưng","province_code":"37"},{"code":"14389","name":"Xã Gia Lâm","province_code":"37"},{"code":"14524","name":"Xã Gia Phong","province_code":"37"},{"code":"14494","name":"Xã Gia Trấn","province_code":"37"},{"code":"14401","name":"Xã Gia Tường","province_code":"37"},{"code":"14488","name":"Xã Gia Vân","province_code":"37"},{"code":"14464","name":"Xã Gia Viễn","province_code":"37"},{"code":"14194","name":"Xã Giao Bình","province_code":"37"},{"code":"14182","name":"Xã Giao Hòa","province_code":"37"},{"code":"14179","name":"Xã Giao Hưng","province_code":"37"},{"code":"14161","name":"Xã Giao Minh","province_code":"37"},{"code":"14212","name":"Xã Giao Ninh","province_code":"37"},{"code":"14203","name":"Xã Giao Phúc","province_code":"37"},{"code":"14167","name":"Xã Giao Thủy","province_code":"37"},{"code":"14281","name":"Xã Hải An","province_code":"37"},{"code":"14236","name":"Xã Hải Anh","province_code":"37"},{"code":"14215","name":"Xã Hải Hậu","province_code":"37"},{"code":"14248","name":"Xã Hải Hưng","province_code":"37"},{"code":"14287","name":"Xã Hải Quang","province_code":"37"},{"code":"14221","name":"Xã Hải Thịnh","province_code":"37"},{"code":"14218","name":"Xã Hải Tiến","province_code":"37"},{"code":"14308","name":"Xã Hải Xuân","province_code":"37"},{"code":"13753","name":"Xã Hiển Khánh","province_code":"37"},{"code":"13927","name":"Xã Hồng Phong","province_code":"37"},{"code":"14614","name":"Xã Khánh Hội","province_code":"37"},{"code":"14611","name":"Xã Khánh Nhạc","province_code":"37"},{"code":"14563","name":"Xã Khánh Thiện","province_code":"37"},{"code":"14608","name":"Xã Khánh Trung","province_code":"37"},{"code":"14698","name":"Xã Kim Đông","province_code":"37"},{"code":"14638","name":"Xã Kim Sơn","province_code":"37"},{"code":"14674","name":"Xã Lai Thành","province_code":"37"},{"code":"13456","name":"Xã Liêm Hà","province_code":"37"},{"code":"13786","name":"Xã Liên Minh","province_code":"37"},{"code":"13573","name":"Xã Lý Nhân","province_code":"37"},{"code":"13750","name":"Xã Minh Tân","province_code":"37"},{"code":"14071","name":"Xã Minh Thái","province_code":"37"},{"code":"14014","name":"Xã Nam Đồng","province_code":"37"},{"code":"13987","name":"Xã Nam Hồng","province_code":"37"},{"code":"13627","name":"Xã Nam Lý","province_code":"37"},{"code":"14011","name":"Xã Nam Minh","province_code":"37"},{"code":"14005","name":"Xã Nam Ninh","province_code":"37"},{"code":"13966","name":"Xã Nam Trực","province_code":"37"},{"code":"13591","name":"Xã Nam Xang","province_code":"37"},{"code":"13891","name":"Xã Nghĩa Hưng","province_code":"37"},{"code":"13957","name":"Xã Nghĩa Lâm","province_code":"37"},{"code":"13918","name":"Xã Nghĩa Sơn","province_code":"37"},{"code":"13609","name":"Xã Nhân Hà","province_code":"37"},{"code":"14428","name":"Xã Nho Quan","province_code":"37"},{"code":"14077","name":"Xã Ninh Cường","province_code":"37"},{"code":"14038","name":"Xã Ninh Giang","province_code":"37"},{"code":"14620","name":"Xã Phát Diệm","province_code":"37"},{"code":"13822","name":"Xã Phong Doanh","province_code":"37"},{"code":"14458","name":"Xã Phú Long","province_code":"37"},{"code":"14407","name":"Xã Phú Sơn","province_code":"37"},{"code":"14062","name":"Xã Quang Hưng","province_code":"37"},{"code":"14647","name":"Xã Quang Thiện","province_code":"37"},{"code":"13939","name":"Xã Quỹ Nhất","province_code":"37"},{"code":"14452","name":"Xã Quỳnh Lưu","province_code":"37"},{"code":"13894","name":"Xã Rạng Đông","province_code":"37"},{"code":"13807","name":"Xã Tân Minh","province_code":"37"},{"code":"13474","name":"Xã Tân Thanh","province_code":"37"},{"code":"13483","name":"Xã Thanh Bình","province_code":"37"},{"code":"13489","name":"Xã Thanh Lâm","province_code":"37"},{"code":"13495","name":"Xã Thanh Liêm","province_code":"37"},{"code":"14434","name":"Xã Thanh Sơn","province_code":"37"},{"code":"13594","name":"Xã Trần Thương","province_code":"37"},{"code":"14053","name":"Xã Trực Ninh","province_code":"37"},{"code":"13864","name":"Xã Vạn Thắng","province_code":"37"},{"code":"13597","name":"Xã Vĩnh Trụ","province_code":"37"},{"code":"13741","name":"Xã Vụ Bản","province_code":"37"},{"code":"13834","name":"Xã Vũ Dương","province_code":"37"},{"code":"14104","name":"Xã Xuân Giang","province_code":"37"},{"code":"14095","name":"Xã Xuân Hồng","province_code":"37"},{"code":"14122","name":"Xã Xuân Hưng","province_code":"37"},{"code":"14089","name":"Xã Xuân Trường","province_code":"37"},{"code":"13795","name":"Xã Ý Yên","province_code":"37"},{"code":"13870","name":"Xã Yên Cường","province_code":"37"},{"code":"13879","name":"Xã Yên Đồng","province_code":"37"},{"code":"14560","name":"Xã Yên Khánh","province_code":"37"},{"code":"14743","name":"Xã Yên Mạc","province_code":"37"},{"code":"14701","name":"Xã Yên Mô","province_code":"37"},{"code":"14728","name":"Xã Yên Từ","province_code":"37"},{"code":"01279","name":"Phường Nùng Trí Cao","province_code":"04"},{"code":"01288","name":"Phường Tân Giang","province_code":"04"},{"code":"01273","name":"Phường Thục Phán","province_code":"04"},{"code":"01708","name":"Xã Bạch Đằng","province_code":"04"},{"code":"01321","name":"Xã Bảo Lạc","province_code":"04"},{"code":"01290","name":"Xã Bảo Lâm","province_code":"04"},{"code":"01636","name":"Xã Bế Văn Đàn","province_code":"04"},{"code":"01738","name":"Xã Ca Thành","province_code":"04"},{"code":"01366","name":"Xã Cần Yên","province_code":"04"},{"code":"01789","name":"Xã Canh Tân","province_code":"04"},{"code":"01327","name":"Xã Cô Ba","province_code":"04"},{"code":"01324","name":"Xã Cốc Pàng","province_code":"04"},{"code":"01501","name":"Xã Đàm Thủy","province_code":"04"},{"code":"01489","name":"Xã Đình Phong","province_code":"04"},{"code":"01525","name":"Xã Đoài Dương","province_code":"04"},{"code":"01594","name":"Xã Độc Lập","province_code":"04"},{"code":"01786","name":"Xã Đông Khê","province_code":"04"},{"code":"01822","name":"Xã Đức Long","province_code":"04"},{"code":"01558","name":"Xã Hạ Lang","province_code":"04"},{"code":"01438","name":"Xã Hà Quảng","province_code":"04"},{"code":"01618","name":"Xã Hạnh Phúc","province_code":"04"},{"code":"01654","name":"Xã Hòa An","province_code":"04"},{"code":"01351","name":"Xã Hưng Đạo","province_code":"04"},{"code":"01354","name":"Xã Huy Giáp","province_code":"04"},{"code":"01336","name":"Xã Khánh Xuân","province_code":"04"},{"code":"01792","name":"Xã Kim Đồng","province_code":"04"},{"code":"01393","name":"Xã Lũng Nặm","province_code":"04"},{"code":"01294","name":"Xã Lý Bôn","province_code":"04"},{"code":"01537","name":"Xã Lý Quốc","province_code":"04"},{"code":"01795","name":"Xã Minh Khai","province_code":"04"},{"code":"01747","name":"Xã Minh Tâm","province_code":"04"},{"code":"01297","name":"Xã Nam Quang","province_code":"04"},{"code":"01660","name":"Xã Nam Tuấn","province_code":"04"},{"code":"01726","name":"Xã Nguyên Bình","province_code":"04"},{"code":"01699","name":"Xã Nguyễn Huệ","province_code":"04"},{"code":"01768","name":"Xã Phan Thanh","province_code":"04"},{"code":"01648","name":"Xã Phục Hòa","province_code":"04"},{"code":"01456","name":"Xã Quang Hán","province_code":"04"},{"code":"01304","name":"Xã Quảng Lâm","province_code":"04"},{"code":"01552","name":"Xã Quang Long","province_code":"04"},{"code":"01465","name":"Xã Quang Trung","province_code":"04"},{"code":"01576","name":"Xã Quảng Uyên","province_code":"04"},{"code":"01360","name":"Xã Sơn Lộ","province_code":"04"},{"code":"01774","name":"Xã Tam Kim","province_code":"04"},{"code":"01807","name":"Xã Thạch An","province_code":"04"},{"code":"01777","name":"Xã Thành Công","province_code":"04"},{"code":"01387","name":"Xã Thanh Long","province_code":"04"},{"code":"01363","name":"Xã Thông Nông","province_code":"04"},{"code":"01729","name":"Xã Tĩnh Túc","province_code":"04"},{"code":"01414","name":"Xã Tổng Cọt","province_code":"04"},{"code":"01447","name":"Xã Trà Lĩnh","province_code":"04"},{"code":"01477","name":"Xã Trùng Khánh","province_code":"04"},{"code":"01392","name":"Xã Trường Hà","province_code":"04"},{"code":"01561","name":"Xã Vinh Quý","province_code":"04"},{"code":"01339","name":"Xã Xuân Trường","province_code":"04"},{"code":"01318","name":"Xã Yên Thổ","province_code":"04"},{"code":"02512","name":"Phường An Tường","province_code":"08"},{"code":"02524","name":"Phường Bình Thuận","province_code":"08"},{"code":"00694","name":"Phường Hà Giang 1","province_code":"08"},{"code":"00691","name":"Phường Hà Giang 2","province_code":"08"},{"code":"02215","name":"Phường Minh Xuân","province_code":"08"},{"code":"02509","name":"Phường Mỹ Lâm","province_code":"08"},{"code":"02212","name":"Phường Nông Tiến","province_code":"08"},{"code":"00991","name":"Xã Bắc Mê","province_code":"08"},{"code":"01153","name":"Xã Bắc Quang","province_code":"08"},{"code":"00832","name":"Xã Bạch Đích","province_code":"08"},{"code":"00976","name":"Xã Bạch Ngọc","province_code":"08"},{"code":"02380","name":"Xã Bạch Xa","province_code":"08"},{"code":"01024","name":"Xã Bản Máy","province_code":"08"},{"code":"01180","name":"Xã Bằng Hành","province_code":"08"},{"code":"01246","name":"Xã Bằng Lang","province_code":"08"},{"code":"02296","name":"Xã Bình An","province_code":"08"},{"code":"02548","name":"Xã Bình Ca","province_code":"08"},{"code":"02404","name":"Xã Bình Xa","province_code":"08"},{"code":"00883","name":"Xã Cán Tỷ","province_code":"08"},{"code":"00952","name":"Xã Cao Bồ","province_code":"08"},{"code":"02287","name":"Xã Chiêm Hóa","province_code":"08"},{"code":"02245","name":"Xã Côn Lôn","province_code":"08"},{"code":"01165","name":"Xã Đồng Tâm","province_code":"08"},{"code":"02572","name":"Xã Đông Thọ","province_code":"08"},{"code":"00721","name":"Xã Đồng Văn","province_code":"08"},{"code":"01216","name":"Xã Đồng Yên","province_code":"08"},{"code":"00871","name":"Xã Du Già","province_code":"08"},{"code":"01012","name":"Xã Đường Hồng","province_code":"08"},{"code":"00865","name":"Xã Đường Thượng","province_code":"08"},{"code":"00985","name":"Xã Giáp Trung","province_code":"08"},{"code":"02374","name":"Xã Hàm Yên","province_code":"08"},{"code":"01084","name":"Xã Hồ Thầu","province_code":"08"},{"code":"02353","name":"Xã Hòa An","province_code":"08"},{"code":"01021","name":"Xã Hoàng Su Phì","province_code":"08"},{"code":"02608","name":"Xã Hồng Sơn","province_code":"08"},{"code":"02260","name":"Xã Hồng Thái","province_code":"08"},{"code":"01201","name":"Xã Hùng An","province_code":"08"},{"code":"02425","name":"Xã Hùng Đức","province_code":"08"},{"code":"02455","name":"Xã Hùng Lợi","province_code":"08"},{"code":"00802","name":"Xã Khâu Vai","province_code":"08"},{"code":"01147","name":"Xã Khuôn Lùng","province_code":"08"},{"code":"02332","name":"Xã Kiên Đài","province_code":"08"},{"code":"02437","name":"Xã Kiến Thiết","province_code":"08"},{"code":"02350","name":"Xã Kim Bình","province_code":"08"},{"code":"02266","name":"Xã Lâm Bình","province_code":"08"},{"code":"00937","name":"Xã Lao Chải","province_code":"08"},{"code":"01192","name":"Xã Liên Hiệp","province_code":"08"},{"code":"00970","name":"Xã Linh Hồ","province_code":"08"},{"code":"02434","name":"Xã Lực Hành","province_code":"08"},{"code":"00715","name":"Xã Lũng Cú","province_code":"08"},{"code":"00763","name":"Xã Lũng Phìn","province_code":"08"},{"code":"00901","name":"Xã Lùng Tám","province_code":"08"},{"code":"00847","name":"Xã Mậu Duệ","province_code":"08"},{"code":"00769","name":"Xã Mèo Vạc","province_code":"08"},{"code":"00994","name":"Xã Minh Ngọc","province_code":"08"},{"code":"02302","name":"Xã Minh Quang","province_code":"08"},{"code":"00982","name":"Xã Minh Sơn","province_code":"08"},{"code":"00919","name":"Xã Minh Tân","province_code":"08"},{"code":"02554","name":"Xã Minh Thanh","province_code":"08"},{"code":"02221","name":"Xã Nà Hang","province_code":"08"},{"code":"01141","name":"Xã Nấm Dẩn","province_code":"08"},{"code":"01075","name":"Xã Nậm Dịch","province_code":"08"},{"code":"00889","name":"Xã Nghĩa Thuận","province_code":"08"},{"code":"00700","name":"Xã Ngọc Đường","province_code":"08"},{"code":"00859","name":"Xã Ngọc Long","province_code":"08"},{"code":"02530","name":"Xã Nhữ Khê","province_code":"08"},{"code":"00817","name":"Xã Niêm Sơn","province_code":"08"},{"code":"01096","name":"Xã Pà Vầy Sủ","province_code":"08"},{"code":"00745","name":"Xã Phố Bảng","province_code":"08"},{"code":"00706","name":"Xã Phú Linh","province_code":"08"},{"code":"02611","name":"Xã Phú Lương","province_code":"08"},{"code":"02392","name":"Xã Phù Lưu","province_code":"08"},{"code":"01057","name":"Xã Pờ Ly Ngài","province_code":"08"},{"code":"00874","name":"Xã Quản Bạ","province_code":"08"},{"code":"01237","name":"Xã Quang Bình","province_code":"08"},{"code":"01144","name":"Xã Quảng Nguyên","province_code":"08"},{"code":"00733","name":"Xã Sà Phìn","province_code":"08"},{"code":"02536","name":"Xã Sơn Dương","province_code":"08"},{"code":"02620","name":"Xã Sơn Thủy","province_code":"08"},{"code":"00778","name":"Xã Sơn Vĩ","province_code":"08"},{"code":"00787","name":"Xã Sủng Máng","province_code":"08"},{"code":"02320","name":"Xã Tân An","province_code":"08"},{"code":"02470","name":"Xã Tân Long","province_code":"08"},{"code":"02308","name":"Xã Tân Mỹ","province_code":"08"},{"code":"01171","name":"Xã Tân Quang","province_code":"08"},{"code":"02578","name":"Xã Tân Thanh","province_code":"08"},{"code":"01051","name":"Xã Tân Tiến","province_code":"08"},{"code":"02545","name":"Xã Tân Trào","province_code":"08"},{"code":"01243","name":"Xã Tân Trịnh","province_code":"08"},{"code":"00808","name":"Xã Tát Ngà","province_code":"08"},{"code":"02494","name":"Xã Thái Bình","province_code":"08"},{"code":"02419","name":"Xã Thái Hòa","province_code":"08"},{"code":"02407","name":"Xã Thái Sơn","province_code":"08"},{"code":"00829","name":"Xã Thắng Mố","province_code":"08"},{"code":"01033","name":"Xã Thàng Tín","province_code":"08"},{"code":"00928","name":"Xã Thanh Thủy","province_code":"08"},{"code":"01090","name":"Xã Thông Nguyên","province_code":"08"},{"code":"00922","name":"Xã Thuận Hòa","province_code":"08"},{"code":"02269","name":"Xã Thượng Lâm","province_code":"08"},{"code":"02239","name":"Xã Thượng Nông","province_code":"08"},{"code":"00958","name":"Xã Thượng Sơn","province_code":"08"},{"code":"01225","name":"Xã Tiên Nguyên","province_code":"08"},{"code":"01261","name":"Xã Tiên Yên","province_code":"08"},{"code":"02359","name":"Xã Tri Phú","province_code":"08"},{"code":"02305","name":"Xã Trung Hà","province_code":"08"},{"code":"02458","name":"Xã Trung Sơn","province_code":"08"},{"code":"01117","name":"Xã Trung Thịnh","province_code":"08"},{"code":"02623","name":"Xã Trường Sinh","province_code":"08"},{"code":"00925","name":"Xã Tùng Bá","province_code":"08"},{"code":"00892","name":"Xã Tùng Vài","province_code":"08"},{"code":"00913","name":"Xã Vị Xuyên","province_code":"08"},{"code":"00967","name":"Xã Việt Lâm","province_code":"08"},{"code":"01156","name":"Xã Vĩnh Tuy","province_code":"08"},{"code":"01108","name":"Xã Xín Mần","province_code":"08"},{"code":"01255","name":"Xã Xuân Giang","province_code":"08"},{"code":"02449","name":"Xã Xuân Vân","province_code":"08"},{"code":"01006","name":"Xã Yên Cường","province_code":"08"},{"code":"02248","name":"Xã Yên Hoa","province_code":"08"},{"code":"02317","name":"Xã Yên Lập","province_code":"08"},{"code":"00820","name":"Xã Yên Minh","province_code":"08"},{"code":"02365","name":"Xã Yên Nguyên","province_code":"08"},{"code":"02398","name":"Xã Yên Phú","province_code":"08"},{"code":"02473","name":"Xã Yên Sơn","province_code":"08"},{"code":"01234","name":"Xã Yên Thành","province_code":"08"},{"code":"04543","name":"Phường Âu Lâu","province_code":"15"},{"code":"02671","name":"Phường Cam Đường","province_code":"15"},{"code":"04681","name":"Phường Cầu Thia","province_code":"15"},{"code":"02647","name":"Phường Lào Cai","province_code":"15"},{"code":"04273","name":"Phường Nam Cường","province_code":"15"},{"code":"04288","name":"Phường Nghĩa Lộ","province_code":"15"},{"code":"03006","name":"Phường Sa Pa","province_code":"15"},{"code":"04663","name":"Phường Trung Tâm","province_code":"15"},{"code":"04279","name":"Phường Văn Phú","province_code":"15"},{"code":"04252","name":"Phường Yên Bái","province_code":"15"},{"code":"02686","name":"Xã A Mú Sung","province_code":"15"},{"code":"02839","name":"Xã Bắc Hà","province_code":"15"},{"code":"03046","name":"Xã Bản Hồ","province_code":"15"},{"code":"02788","name":"Xã Bản Lầu","province_code":"15"},{"code":"02869","name":"Xã Bản Liền","province_code":"15"},{"code":"02725","name":"Xã Bản Xèo","province_code":"15"},{"code":"04750","name":"Xã Bảo Ái","province_code":"15"},{"code":"02989","name":"Xã Bảo Hà","province_code":"15"},{"code":"02890","name":"Xã Bảo Nhai","province_code":"15"},{"code":"02905","name":"Xã Bảo Thắng","province_code":"15"},{"code":"02947","name":"Xã Bảo Yên","province_code":"15"},{"code":"02683","name":"Xã Bát Xát","province_code":"15"},{"code":"04726","name":"Xã Cảm Nhân","province_code":"15"},{"code":"02782","name":"Xã Cao Sơn","province_code":"15"},{"code":"04693","name":"Xã Cát Thịnh","province_code":"15"},{"code":"04699","name":"Xã Chấn Thịnh","province_code":"15"},{"code":"04387","name":"Xã Châu Quế","province_code":"15"},{"code":"04489","name":"Xã Chế Tạo","province_code":"15"},{"code":"03091","name":"Xã Chiềng Ken","province_code":"15"},{"code":"02896","name":"Xã Cốc Lầu","province_code":"15"},{"code":"02746","name":"Xã Cốc San","province_code":"15"},{"code":"02707","name":"Xã Dền Sáng","province_code":"15"},{"code":"04399","name":"Xã Đông Cuông","province_code":"15"},{"code":"03106","name":"Xã Dương Quỳ","province_code":"15"},{"code":"04636","name":"Xã Gia Hội","province_code":"15"},{"code":"02923","name":"Xã Gia Phú","province_code":"15"},{"code":"04585","name":"Xã Hạnh Phúc","province_code":"15"},{"code":"02680","name":"Xã Hợp Thành","province_code":"15"},{"code":"04576","name":"Xã Hưng Khánh","province_code":"15"},{"code":"04342","name":"Xã Khánh Hòa","province_code":"15"},{"code":"03103","name":"Xã Khánh Yên","province_code":"15"},{"code":"04465","name":"Xã Khao Mang","province_code":"15"},{"code":"04381","name":"Xã Lâm Giang","province_code":"15"},{"code":"04309","name":"Xã Lâm Thượng","province_code":"15"},{"code":"04474","name":"Xã Lao Chải","province_code":"15"},{"code":"04660","name":"Xã Liên Sơn","province_code":"15"},{"code":"04303","name":"Xã Lục Yên","province_code":"15"},{"code":"02848","name":"Xã Lùng Phình","province_code":"15"},{"code":"04537","name":"Xã Lương Thịnh","province_code":"15"},{"code":"04375","name":"Xã Mậu A","province_code":"15"},{"code":"03121","name":"Xã Minh Lương","province_code":"15"},{"code":"04450","name":"Xã Mỏ Vàng","province_code":"15"},{"code":"04456","name":"Xã Mù Cang Chải","province_code":"15"},{"code":"03043","name":"Xã Mường Bo","province_code":"15"},{"code":"02728","name":"Xã Mường Hum","province_code":"15"},{"code":"02761","name":"Xã Mường Khương","province_code":"15"},{"code":"04345","name":"Xã Mường Lai","province_code":"15"},{"code":"03076","name":"Xã Nậm Chày","province_code":"15"},{"code":"04462","name":"Xã Nậm Có","province_code":"15"},{"code":"03085","name":"Xã Nậm Xé","province_code":"15"},{"code":"02953","name":"Xã Nghĩa Đô","province_code":"15"},{"code":"04711","name":"Xã Nghĩa Tâm","province_code":"15"},{"code":"03004","name":"Xã Ngũ Chỉ Sơn","province_code":"15"},{"code":"02752","name":"Xã Pha Long","province_code":"15"},{"code":"04609","name":"Xã Phình Hồ","province_code":"15"},{"code":"04402","name":"Xã Phong Dụ Hạ","province_code":"15"},{"code":"04423","name":"Xã Phong Dụ Thượng","province_code":"15"},{"code":"02902","name":"Xã Phong Hải","province_code":"15"},{"code":"02998","name":"Xã Phúc Khánh","province_code":"15"},{"code":"04363","name":"Xã Phúc Lợi","province_code":"15"},{"code":"04492","name":"Xã Púng Luông","province_code":"15"},{"code":"04531","name":"Xã Quy Mông","province_code":"15"},{"code":"02809","name":"Xã Si Ma Cai","province_code":"15"},{"code":"02824","name":"Xã Sín Chéng","province_code":"15"},{"code":"04651","name":"Xã Sơn Lương","province_code":"15"},{"code":"02842","name":"Xã Tả Củ Tỷ","province_code":"15"},{"code":"03013","name":"Xã Tả Phìn","province_code":"15"},{"code":"03037","name":"Xã Tả Van","province_code":"15"},{"code":"04603","name":"Xã Tà Xi Láng","province_code":"15"},{"code":"04429","name":"Xã Tân Hợp","province_code":"15"},{"code":"04336","name":"Xã Tân Lĩnh","province_code":"15"},{"code":"02908","name":"Xã Tằng Loỏng","province_code":"15"},{"code":"04717","name":"Xã Thác Bà","province_code":"15"},{"code":"04705","name":"Xã Thượng Bằng La","province_code":"15"},{"code":"02968","name":"Xã Thượng Hà","province_code":"15"},{"code":"04606","name":"Xã Trạm Tấu","province_code":"15"},{"code":"04498","name":"Xã Trấn Yên","province_code":"15"},{"code":"02695","name":"Xã Trịnh Tường","province_code":"15"},{"code":"04630","name":"Xã Tú Lệ","province_code":"15"},{"code":"03082","name":"Xã Văn Bàn","province_code":"15"},{"code":"04672","name":"Xã Văn Chấn","province_code":"15"},{"code":"04564","name":"Xã Việt Hồng","province_code":"15"},{"code":"03061","name":"Xã Võ Lao","province_code":"15"},{"code":"04441","name":"Xã Xuân Ái","province_code":"15"},{"code":"02962","name":"Xã Xuân Hòa","province_code":"15"},{"code":"02926","name":"Xã Xuân Quang","province_code":"15"},{"code":"02701","name":"Xã Y Tý","province_code":"15"},{"code":"04714","name":"Xã Yên Bình","province_code":"15"},{"code":"04744","name":"Xã Yên Thành","province_code":"15"}]`);
const locations = {
  provinces,
  wards
};
function ScopeEditor({
  config: config2,
  catalogs,
  onChange
}) {
  const mode = String(
    config2.scope_mode || (Array.isArray(config2.group_ids) && config2.group_ids.length ? "groups" : "")
  );
  const key = mode === "segments" ? "segment_ids" : "group_ids";
  const ids = Array.isArray(config2[key]) ? config2[key] : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phạm vi áp dụng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Pick,
      {
        label: "Chọn phạm vi",
        value: mode,
        onChange: (v) => onChange({ ...config2, scope_mode: v, group_ids: [], segment_ids: [] }),
        options: [
          { id: "shared", name: "Dùng chung mọi nhóm" },
          { id: "groups", name: "Nhóm được chọn" },
          { id: "segments", name: "Tệp được chọn" }
        ]
      }
    ) }),
    ["groups", "segments"].includes(mode) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-64 space-y-2 overflow-y-auto", children: catalogs.filter(
      (c) => mode === "groups" ? c.kind === "group" : ["segment", "block"].includes(c.kind)
    ).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-10 items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          checked: ids.includes(c.id),
          onCheckedChange: (yes) => onChange({
            ...config2,
            [key]: yes ? [...ids, c.id] : ids.filter((id) => id !== c.id)
          })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        c.name,
        mode === "segments" ? ` · ${catalogs.find((x) => x.id === c.parent_id)?.name || ""}` : ""
      ] })
    ] }, c.id)) })
  ] });
}
function FieldControl({
  field,
  value,
  onChange
}) {
  const typ = String(field.config.field_type);
  const options = fieldOptions(field).filter(
    (o) => o.active || value === o.id || Array.isArray(value) && value.includes(o.id)
  );
  if (typ === "boolean")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Pick,
      {
        label: "Chọn Có/Không",
        value: typeof value === "boolean" ? String(value) : "",
        onChange: (v) => onChange(v === "" ? null : v === "true"),
        options: [
          { id: "true", name: "Có" },
          { id: "false", name: "Không" }
        ]
      }
    );
  if (typ === "select")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SearchPick,
      {
        label: `Chọn ${field.name}`,
        value: typeof value === "string" ? value : "",
        onChange,
        options: options.map((o) => ({
          code: o.id,
          name: o.name + (o.active ? "" : " (Đã ngừng)")
        }))
      }
    );
  if (typ === "multiselect")
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-10 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          checked: Array.isArray(value) && value.includes(o.id),
          onCheckedChange: (yes) => {
            const ids = Array.isArray(value) ? value : [];
            onChange(yes ? [...ids, o.id] : ids.filter((id) => id !== o.id));
          }
        }
      ),
      o.name,
      !o.active ? " (Đã ngừng)" : ""
    ] }, o.id)) });
  if (typ === "textarea")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        "aria-label": field.name,
        value: typeof value === "string" ? value : "",
        onChange: (e) => onChange(e.target.value),
        maxLength: 1e4
      }
    );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      "aria-label": field.name,
      type: ["number", "money"].includes(typ) ? "number" : typ === "date" ? "date" : typ === "url" ? "url" : "text",
      step: ["number", "money"].includes(typ) ? "any" : void 0,
      value: typeof value === "string" || typeof value === "number" ? value : "",
      onChange: (e) => onChange(
        ["number", "money"].includes(typ) ? e.target.value === "" ? null : Number(e.target.value) : e.target.value
      )
    }
  );
}
function CustomFields({
  catalogs,
  group,
  segment,
  values,
  onChange
}) {
  const fields = applicableFields(catalogs, group, segment);
  return fields.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Thông tin chuyên sâu" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 pt-4", children: fields.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: c.name + (c.config.required === true ? " *" : ""), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FieldControl,
        {
          field: c,
          value: values[c.id],
          onChange: (v) => onChange({ ...values, [c.id]: v })
        }
      ),
      c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: c.description })
    ] }, c.id)) })
  ] }) : null;
}
function DynamicFilters({
  catalogs,
  group,
  segment,
  filters,
  onChange
}) {
  const defs = catalogs.filter(
    (c) => c.active && (c.kind === "custom_field" || ["trait", "channel", "cooperation", "output", "product", "need", "occasion"].includes(
      c.kind
    ))
  ).filter((c) => !group || scopeMatches(c, group, segment, catalogs));
  const update = (i, v) => onChange(filters.map((f, n) => n === i ? v : f));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 border-t pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Đặc điểm & Thông tin chuyên sâu" }),
    filters.map((f, i) => {
      const c = catalogs.find((c2) => c2.id === f.id), typ = String(c?.config.field_type);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 border-b pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchPick,
          {
            label: "Chọn trường hoặc đặc điểm",
            value: f.id,
            onChange: (id) => update(i, { id }),
            options: defs.map((c2) => ({ code: c2.id, name: c2.name }))
          }
        ),
        c?.kind === "custom_field" && (["number", "money", "date"].includes(typ) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": `Từ ${c.name}`,
              type: typ === "date" ? "date" : "number",
              value: f.min || "",
              onChange: (e) => update(i, { ...f, min: e.target.value })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": `Đến ${c.name}`,
              type: typ === "date" ? "date" : "number",
              value: f.max || "",
              onChange: (e) => update(i, { ...f, max: e.target.value })
            }
          )
        ] }) : ["text", "textarea", "url"].includes(typ) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "aria-label": `Tìm ${c.name}`,
            value: f.contains || "",
            onChange: (e) => update(i, { ...f, contains: e.target.value })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          FieldControl,
          {
            field: c,
            value: f.value,
            onChange: (v) => update(i, { ...f, value: v })
          }
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => onChange(filters.filter((_, n) => n !== i)),
            children: "Bỏ điều kiện"
          }
        )
      ] }, i);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onChange([...filters, { id: "" }]), children: "Thêm điều kiện" })
  ] });
}
function CrmModal({
  title,
  onClose,
  children,
  dirty = false,
  busy = false
}) {
  const [discard, setDiscard] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: true,
        onOpenChange: (open) => {
          if (!open && !busy) {
            if (dirty) setDiscard(true);
            else onClose();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "crm-dialog max-h-[90dvh] overflow-y-auto sm:max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
          children
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: discard, onOpenChange: setDiscard, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Bỏ thay đổi?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Thông tin chưa lưu sẽ không được giữ lại." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Tiếp tục nhập" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: onClose, children: "Bỏ thay đổi" })
      ] })
    ] }) })
  ] });
}
function ErrorText({ error }) {
  return error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }) : null;
}
function CustomerForm({
  customer,
  catalogs,
  onClose,
  onSaved
}) {
  const [data, setData] = reactExports.useState(() => ({
    ...customer,
    profile_kind: customer?.profile_kind || "organization",
    name: customer?.name || "",
    related_ids: customer?.related_ids || [],
    details: customer?.details || {},
    custom_values: customer?.custom_values || {}
  }));
  const [dirty, setDirty] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [duplicates, setDuplicates] = reactExports.useState([]);
  const [confirmed, setConfirmed] = reactExports.useState(false);
  const [discard, setDiscard] = reactExports.useState(false);
  const key = reactExports.useRef(crypto.randomUUID());
  const [pendingGroup, setPendingGroup] = reactExports.useState(null);
  const segmentsByGroup = reactExports.useRef({ [customer?.group_id || ""]: customer?.segment_id || "" });
  const lock = reactExports.useRef(false);
  const save = useCrmMutation("crm_customer_save");
  const value = (k) => String(data[k] ?? "");
  const set = (k, v) => {
    setData((d) => ({ ...d, [k]: v }));
    setDirty(true);
    if (["name", "phone", "tax_code"].includes(k)) setConfirmed(false);
  };
  const items = (kind) => catalogs.filter((c) => c.kind === kind && (c.active || c.id === data[`${kind}_id`]));
  const input = (k, label, type = "text") => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      "aria-label": label,
      type,
      inputMode: k.includes("phone") ? "tel" : void 0,
      value: value(k),
      onChange: (e) => set(k, e.target.value)
    }
  ) });
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setError("");
    try {
      if (!confirmed && !customer) {
        const d = await crmRpc("crm_duplicates", {
          _name: value("name"),
          _phone: value("phone"),
          _tax: value("tax_code")
        });
        if (d.length) {
          setDuplicates(d);
          setConfirmed(true);
          return;
        }
      }
      const id = await save.mutateAsync({ ...data, request_key: key.current });
      toast.success("Đã lưu khách hàng");
      onSaved(String(id));
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Chưa lưu được khách hàng.");
    } finally {
      lock.current = false;
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    CrmModal,
    {
      title: customer ? "Sửa hồ sơ khách" : "Thêm khách hàng",
      onClose,
      dirty,
      busy: save.isPending,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
            ["organization", "Tổ chức / Đơn vị"],
            ["individual", "Cá nhân"]
          ].map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: value("profile_kind") === id ? "default" : "outline",
              onClick: () => set("profile_kind", id),
              children: name
            },
            id
          )) }),
          input(
            "name",
            value("profile_kind") === "individual" ? "Họ tên khách hàng" : "Tên khách hàng / Đơn vị"
          ),
          input("phone", "Số điện thoại", "tel"),
          !customer && value("profile_kind") === "organization" && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Người liên hệ chính" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 pt-4", children: [
              input("contact_name", "Họ tên người liên hệ"),
              input("contact_phone", "Điện thoại người liên hệ", "tel")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhóm khách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchPick,
            {
              label: "Chọn nhóm khách",
              value: value("group_id"),
              onChange: (v) => {
                if (v !== value("group_id") && (value("segment_id") || Object.keys(data.custom_values).length || data.related_ids.length)) {
                  setPendingGroup(v);
                  return;
                }
                set("group_id", v);
                if (value("segment_id") && !descendant(value("segment_id"), v, catalogs)) set("segment_id", "");
              },
              options: items("group").map((c) => ({ code: c.id, name: c.name + (c.active ? "" : " (Đã ngừng)") }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tệp khách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchPick,
            {
              label: "Chọn tệp khách",
              value: value("segment_id"),
              onChange: (v) => {
                segmentsByGroup.current[value("group_id")] = v;
                set("segment_id", v);
              },
              options: segmentOptions(catalogs, value("group_id"), value("segment_id"), true).map((c) => ({ code: c.id, name: c.name + (c.active ? "" : " (Đã ngừng)") }))
            }
          ) }),
          value("group_id") && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Đặc điểm kinh doanh" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 pt-4", children: Object.entries(FEATURE_KINDS).map(([kind, label]) => {
              const selected = data.related_ids;
              const options = catalogs.filter((c) => c.kind === kind && featureInGroup(c, value("group_id"), value("segment_id"), catalogs) && (c.active || selected.includes(c.id)));
              return options.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(MultiCatalog, { label, items: options, value: selected.filter((id) => options.some((c) => c.id === id)), onChange: (ids) => set("related_ids", [...selected.filter((id) => !options.some((c) => c.id === id)), ...ids]) }, kind) : null;
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CustomFields, { catalogs, group: value("group_id"), segment: value("segment_id"), values: data.custom_values, onChange: (v) => set("custom_values", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tỉnh / Thành phố", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchPick,
            {
              label: "Chọn tỉnh / thành phố",
              value: value("province_code"),
              onChange: (v) => {
                set("province_code", v);
                set("ward_code", "");
              },
              options: locations.provinces
            }
          ) }),
          !customer && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lịch chăm sóc tiếp theo (không bắt buộc)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": "Lịch chăm sóc tiếp theo",
              type: "datetime-local",
              value: value("next_local"),
              onChange: (e) => set("next_local", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Thông tin mở rộng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phường / Xã", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                SearchPick,
                {
                  label: "Chọn phường / xã",
                  value: value("ward_code"),
                  onChange: (v) => set("ward_code", v),
                  options: locations.wards.filter((w) => w.province_code === value("province_code"))
                }
              ) }),
              input("address", "Địa chỉ chi tiết"),
              input("email", "Email", "email"),
              input("website", "Website"),
              value("profile_kind") === "organization" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                input("legal_name", "Tên pháp lý"),
                input("tax_code", "Mã số thuế")
              ] }),
              [
                ["priority", "Mức độ ưu tiên"],
                ["relationship", "Tình trạng hợp tác"],
                ["source", "Nguồn khách"]
              ].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: l, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Pick,
                {
                  label: l,
                  value: value(`${k}_id`),
                  onChange: (v) => set(`${k}_id`, v),
                  options: items(k)
                }
              ) }, k)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MultiCatalog, { label: "Mảng liên quan", items: catalogs.filter((c) => c.kind === "group" && (c.active || data.related_ids.includes(c.id))), value: data.related_ids.filter((id) => catalogs.some((c) => c.id === id && c.kind === "group")), onChange: (ids) => set("related_ids", [...data.related_ids.filter((id) => !catalogs.some((c) => c.id === id && c.kind === "group")), ...ids]) }),
              Object.keys(data.details).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Thông tin kinh doanh đã lưu trước đây" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 pt-4", children: Object.keys(data.details).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: k, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: String(data.details[k] || ""),
                    onChange: (e) => set("details", {
                      ...data.details,
                      [k]: e.target.value
                    })
                  }
                ) }, k)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  "aria-label": "Ghi chú",
                  value: value("note"),
                  onChange: (e) => set("note", e.target.value)
                }
              ) })
            ] })
          ] }),
          duplicates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l-2 border-warning pl-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đã có hồ sơ tương tự trong phạm vi của bạn:" }),
            duplicates.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "link",
                className: "h-auto whitespace-normal text-left",
                onClick: () => onSaved(d.id),
                children: [
                  d.name,
                  " · ",
                  d.code
                ]
              },
              d.id
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Bấm Lưu lần nữa nếu đây là một khách khác." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorText, { error }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "crm-form-footer flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => dirty ? setDiscard(true) : onClose(),
                disabled: save.isPending,
                children: "Hủy"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "flex-1",
                type: "submit",
                disabled: save.isPending || !value("name").trim(),
                children: save.isPending ? "Đang lưu…" : "Lưu khách hàng"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: discard, onOpenChange: setDiscard, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Bỏ thay đổi?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Thông tin khách chưa lưu sẽ không được giữ lại." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Tiếp tục nhập" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: onClose, children: "Bỏ thay đổi" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: pendingGroup !== null, onOpenChange: (open) => {
          if (!open) setPendingGroup(null);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Đổi Nhóm khách?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Tệp được cập nhật theo nhóm mới. Đặc điểm và thông tin chuyên sâu cũ được giữ lại, chỉ hiển thị khi phù hợp với nhóm đang chọn." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Giữ nhóm hiện tại" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => {
              if (pendingGroup === null) return;
              segmentsByGroup.current[value("group_id")] = value("segment_id");
              set("group_id", pendingGroup);
              set("segment_id", segmentsByGroup.current[pendingGroup] || "");
              setPendingGroup(null);
            }, children: "Đổi nhóm" })
          ] })
        ] }) })
      ]
    }
  );
}
function ScheduleForm({
  uid,
  customer,
  contacts,
  catalogs,
  schedule,
  onClose
}) {
  const [data, setData] = reactExports.useState(() => ({
    ...schedule,
    kind: schedule?.kind || "appointment",
    due_local: schedule ? new Date(Date.parse(schedule.due_at) + 7 * 36e5).toISOString().slice(0, 16) : `${vnDay()}T09:00`,
    interval_days: schedule?.interval_days || 15
  }));
  const [error, setError] = reactExports.useState("");
  const [dirty, setDirty] = reactExports.useState(false);
  const lock = reactExports.useRef(false);
  const key = reactExports.useRef(crypto.randomUUID());
  const save = useCrmMutation("crm_schedule_save");
  const { data: templates = [] } = useQuery(crmTemplatesQuery(uid));
  const v = (k) => String(data[k] ?? "");
  const set = (k, val) => {
    setData((d) => ({ ...d, [k]: val }));
    setDirty(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CrmModal,
    {
      title: schedule ? "Sửa / Dời lịch" : "Đặt lịch chăm sóc",
      onClose,
      dirty,
      busy: save.isPending,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          className: "space-y-4",
          onSubmit: async (e) => {
            e.preventDefault();
            if (lock.current) return;
            lock.current = true;
            try {
              setError("");
              await save.mutateAsync({
                ...data,
                customer_id: customer.id,
                request_key: key.current,
                due_at: `${v("due_local")}:00+07:00`
              });
              toast.success("Đã lưu lịch chăm sóc");
              onClose();
            } catch (e2) {
              setError(e2 instanceof Error ? e2.message : "Chưa lưu được lịch.");
            } finally {
              lock.current = false;
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: customer.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Loại lịch", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Loại lịch",
                value: v("kind"),
                onChange: (x) => set("kind", x),
                options: [
                  { id: "appointment", name: "Lịch hẹn cụ thể" },
                  { id: "recurring", name: "Chăm sóc định kỳ" },
                  { id: "seasonal", name: "Mùa vụ / Sự kiện" }
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mẫu chăm sóc", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Chọn mẫu (không bắt buộc)",
                value: "",
                onChange: (id) => {
                  const t = templates.find((x) => x.id === id);
                  if (t) {
                    setData((d) => ({
                      ...d,
                      goal: t.goal,
                      channel: t.channel,
                      interval_days: t.interval_days,
                      kind: "recurring"
                    }));
                    setDirty(true);
                  }
                },
                options: templates.filter((t) => t.active)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày hẹn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "aria-label": "Ngày hẹn",
                type: "datetime-local",
                required: true,
                value: v("due_local"),
                onChange: (e) => set("due_local", e.target.value)
              }
            ) }),
            v("kind") === "recurring" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Chu kỳ (ngày)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "aria-label": "Chu kỳ (ngày)",
                  type: "number",
                  min: 1,
                  max: 3660,
                  value: v("interval_days"),
                  onChange: (e) => set("interval_days", e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lịch cố định theo thứ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Pick,
                {
                  label: "Theo lần hoàn tất gần nhất",
                  value: v("fixed_weekday"),
                  onChange: (x) => set("fixed_weekday", x),
                  options: Array.from({ length: 7 }, (_, i) => ({
                    id: String(i),
                    name: i === 0 ? "Chủ nhật" : `Thứ ${i + 1}`
                  }))
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người liên hệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Chọn người liên hệ",
                value: v("contact_id"),
                onChange: (x) => set("contact_id", x),
                options: contacts.filter((c) => c.active)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Kênh liên hệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Kênh liên hệ",
                value: v("channel") || "phone",
                onChange: (x) => set("channel", x),
                options: Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Mục tiêu chăm sóc", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "aria-label": "Mục tiêu chăm sóc",
                  list: "crm-goals",
                  value: v("goal"),
                  onChange: (e) => set("goal", e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "crm-goals", children: catalogs.filter((c) => c.kind === "goal" && c.active).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nội dung cần trao đổi", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: v("content"), onChange: (e) => set("content", e.target.value) }) }),
            v("kind") === "seasonal" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhắc trước (ngày)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                value: v("reminder_days"),
                onChange: (e) => set("reminder_days", e.target.value)
              }
            ) }),
            schedule && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do thay đổi lịch", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                "aria-label": "Lý do thay đổi lịch",
                value: v("reason"),
                onChange: (e) => set("reason", e.target.value)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorText, { error }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: save.isPending, children: save.isPending ? "Đang lưu…" : "Lưu lịch chăm sóc" }) })
          ]
        }
      )
    }
  );
}
function InteractionForm({
  customer,
  contacts,
  catalogs,
  schedule,
  onClose
}) {
  const [data, setData] = reactExports.useState({
    contact_id: schedule?.contact_id || contacts.find((c) => c.is_primary)?.id || "",
    channel: schedule?.channel || "phone",
    next_action: "keep"
  });
  const [error, setError] = reactExports.useState("");
  const key = reactExports.useRef(crypto.randomUUID());
  const lock = reactExports.useRef(false);
  const save = useCrmMutation("crm_interaction_save");
  const v = (k) => String(data[k] ?? "");
  const set = (k, val) => setData((d) => ({ ...d, [k]: val }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CrmModal,
    {
      title: "Cập nhật chăm sóc",
      onClose,
      dirty: Object.keys(data).length > 3,
      busy: save.isPending,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          className: "space-y-4",
          onSubmit: async (e) => {
            e.preventDefault();
            if (lock.current) return;
            lock.current = true;
            try {
              setError("");
              await save.mutateAsync({
                ...data,
                customer_id: customer.id,
                schedule_id: schedule?.id || null,
                revision: schedule?.revision,
                request_key: key.current,
                next_at: v("next_local") ? `${v("next_local")}:00+07:00` : null
              });
              toast.success("Đã ghi nhận chăm sóc");
              onClose();
            } catch (e2) {
              setError(e2 instanceof Error ? e2.message : "Chưa ghi nhận được.");
            } finally {
              lock.current = false;
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: customer.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người đã liên hệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Người đã liên hệ",
                value: v("contact_id"),
                onChange: (x) => set("contact_id", x),
                options: contacts.filter((c) => c.active)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Hình thức liên hệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Hình thức liên hệ",
                value: v("channel"),
                onChange: (x) => set("channel", x),
                options: Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Kết quả", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Chọn kết quả",
                value: v("outcome_id"),
                onChange: (x) => set("outcome_id", x),
                options: catalogs.filter((c) => c.kind === "outcome" && c.active)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nội dung trao đổi", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                "aria-label": "Nội dung trao đổi",
                required: true,
                value: v("content"),
                onChange: (e) => set("content", e.target.value)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bước tiếp theo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Bước tiếp theo",
                value: v("next_action"),
                onChange: (x) => set("next_action", x),
                options: [
                  { id: "keep", name: "Không đặt lịch mới" },
                  ...schedule?.kind === "recurring" ? [{ id: "continue", name: "Tiếp tục chu kỳ hiện tại" }] : [],
                  { id: "date", name: "Đặt lịch hẹn cụ thể" },
                  ...schedule ? [{ id: "pause", name: "Tạm ngừng lịch" }] : []
                ]
              }
            ) }),
            v("next_action") === "date" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày hẹn tiếp theo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "aria-label": "Ngày hẹn tiếp theo",
                required: true,
                type: "datetime-local",
                value: v("next_local"),
                onChange: (e) => set("next_local", e.target.value)
              }
            ) }),
            v("next_action") === "continue" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Chu kỳ tiếp theo (ngày)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1,
                value: v("interval_days") || String(schedule?.interval_days || 15),
                onChange: (e) => set("interval_days", e.target.value)
              }
            ) }),
            ["continue", "date"].includes(v("next_action")) && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mục tiêu tiếp theo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v("next_goal"), onChange: (e) => set("next_goal", e.target.value) }) }),
            v("next_action") === "pause" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do tạm ngừng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                required: true,
                value: v("reason"),
                onChange: (e) => set("reason", e.target.value)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorText, { error }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: save.isPending || !v("outcome_id"), children: save.isPending ? "Đang lưu…" : "Lưu kết quả chăm sóc" }) })
          ]
        }
      )
    }
  );
}
function ContactForm({
  customer,
  contact,
  onClose,
  catalogs
}) {
  const [data, set] = reactExports.useState({
    ...contact,
    name: contact?.name || "",
    role_ids: contact?.role_ids || []
  });
  const save = useCrmMutation("crm_contact_save");
  const [error, setError] = reactExports.useState("");
  const lock = reactExports.useRef(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CrmModal,
    {
      title: contact ? "Sửa người liên hệ" : "Thêm người liên hệ",
      onClose,
      dirty: true,
      busy: save.isPending,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          className: "space-y-4",
          onSubmit: async (e) => {
            e.preventDefault();
            if (lock.current) return;
            lock.current = true;
            try {
              await save.mutateAsync({ ...data, customer_id: customer.id });
              onClose();
            } catch (e2) {
              setError(e2 instanceof Error ? e2.message : "Chưa lưu được.");
            } finally {
              lock.current = false;
            }
          },
          children: [
            [
              ["name", "Họ tên"],
              ["phone", "Số điện thoại"],
              ["zalo", "Zalo"],
              ["email", "Email"],
              ["title", "Chức vụ"],
              ["department", "Bộ phận"],
              ["note", "Ghi chú"]
            ].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: l, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "aria-label": l,
                value: String(data[k] || ""),
                inputMode: k === "phone" ? "tel" : void 0,
                onChange: (e) => set((d) => ({ ...d, [k]: e.target.value }))
              }
            ) }, k)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MultiCatalog,
              {
                label: "Vai trò mua hàng",
                items: catalogs.filter((c) => c.kind === "contact_role" && c.active),
                value: data.role_ids,
                onChange: (v) => set((d) => ({ ...d, role_ids: v }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Kênh ưu tiên", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Pick,
              {
                label: "Kênh ưu tiên",
                value: String(data.preferred_channel || "phone"),
                onChange: (v) => set((d) => ({ ...d, preferred_channel: v })),
                options: Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: data.is_primary === true,
                  onCheckedChange: (v) => set((d) => ({ ...d, is_primary: v === true }))
                }
              ),
              "Liên hệ chính"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: data.active !== false,
                  onCheckedChange: (v) => set((d) => ({ ...d, active: v === true }))
                }
              ),
              "Còn làm việc tại đơn vị"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorText, { error }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", disabled: save.isPending, type: "submit", children: "Lưu người liên hệ" }) })
          ]
        }
      )
    }
  );
}
function LocationForm({
  customer,
  location,
  onClose
}) {
  const [data, set] = reactExports.useState({ ...location });
  const save = useCrmMutation("crm_location_save");
  const [error, setError] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CrmModal, { title: "Địa điểm khách hàng", onClose, dirty: true, busy: save.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      className: "space-y-4",
      onSubmit: async (e) => {
        e.preventDefault();
        try {
          await save.mutateAsync({ ...data, customer_id: customer.id });
          onClose();
        } catch (e2) {
          setError(e2 instanceof Error ? e2.message : "Chưa lưu được.");
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên địa điểm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.label || ""),
            onChange: (e) => set((d) => ({ ...d, label: e.target.value }))
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchPick,
          {
            label: "Chọn tỉnh / thành phố",
            value: String(data.province_code || ""),
            onChange: (v) => set((d) => ({ ...d, province_code: v, ward_code: "" })),
            options: locations.provinces
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchPick,
          {
            label: "Chọn phường / xã",
            value: String(data.ward_code || ""),
            onChange: (v) => set((d) => ({ ...d, ward_code: v })),
            options: locations.wards.filter((w) => w.province_code === data.province_code)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Địa chỉ chi tiết", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.address || ""),
            onChange: (e) => set((d) => ({ ...d, address: e.target.value }))
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: data.is_primary === true,
              onCheckedChange: (v) => set((d) => ({ ...d, is_primary: v === true }))
            }
          ),
          "Địa chỉ chính"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorText, { error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, className: "w-full", type: "submit", children: "Lưu địa điểm" }) })
      ]
    }
  ) });
}
function CrmDetail({
  uid,
  id,
  catalogs,
  onClose
}) {
  const q = useQuery(crmDetailQuery(uid, id));
  const people = useQuery(crmPeopleQuery(uid));
  const qc = useQueryClient();
  const { can } = useCurrentUser();
  const [form, setForm] = reactExports.useState("");
  const [contact, setContact] = reactExports.useState();
  const [location, setLocation] = reactExports.useState();
  const [schedule, setSchedule] = reactExports.useState();
  const [reason, setReason] = reactExports.useState("");
  const [owner, setOwner] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [tab, setTab] = reactExports.useState("overview");
  const origin = useQuery({
    queryKey: ["crm_signal_origin", uid, id],
    queryFn: async () => {
      const { data, error: error2 } = await supabase.from("signal_crm_links").select("signal_id").eq("customer_id", id).maybeSingle();
      if (error2) throw new Error(error2.message);
      return data?.signal_id ?? null;
    },
    retry: false
  });
  const files = useQuery({
    queryKey: ["crm_files", uid, id],
    queryFn: async () => {
      const r = await supabase.storage.from("crm-files").list(id);
      if (r.error) throw r.error;
      return r.data;
    }
  });
  if (!q.data)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CrmModal, { title: "Hồ sơ khách hàng", onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: q.error ? "alert" : void 0, children: q.error?.message || "Đang tải…" }) });
  const d = q.data, c = d.customer;
  const label = (i) => catalogs.find((x) => x.id === i)?.name || "—";
  const editable = d.can_edit;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (form === "edit")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerForm,
      {
        customer: c,
        catalogs,
        onClose: () => setForm(""),
        onSaved: () => setForm("")
      }
    );
  if (form === "contact")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ContactForm, { customer: c, contact, catalogs, onClose: () => setForm("") });
  if (form === "location")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LocationForm, { customer: c, location, onClose: () => setForm("") });
  if (form === "schedule")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScheduleForm,
      {
        uid,
        customer: c,
        contacts: d.contacts,
        catalogs,
        schedule,
        onClose: () => setForm("")
      }
    );
  if (form === "interaction")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      InteractionForm,
      {
        customer: c,
        contacts: d.contacts,
        catalogs,
        schedule,
        onClose: () => setForm("")
      }
    );
  if (form === "delete")
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: "Xóa khách hàng", onClose: () => {
      setForm("");
      setError("");
      setReason("");
    }, busy, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Xóa vĩnh viễn hồ sơ chưa có lịch sử chăm sóc hoặc liên kết nghiệp vụ. Nếu đã có dữ liệu nghiệp vụ, hãy sử dụng Lưu trữ." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
        c.name,
        " (",
        c.code,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do xóa (bắt buộc)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Nhập lý do xóa khách", maxLength: 500 }) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "destructive",
          disabled: busy || reason.trim().length < 5,
          onClick: async () => {
            if (!window.confirm(`Xóa vĩnh viễn khách "${c.name}"? Không thể hoàn tác.`)) return;
            setBusy(true);
            try {
              await crmRpc("crm_customer_delete", { _id: id, _revision: c.revision, _reason: reason.trim() });
              await qc.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("crm_") });
              toast.success("Đã xóa hồ sơ khách hàng.");
              onClose();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Không thể xóa hồ sơ.");
            } finally {
              setBusy(false);
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
            "Xác nhận xóa khách"
          ]
        }
      )
    ] });
  if (form === "action")
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: "Bàn giao / Lưu trữ khách", onClose: () => setForm(""), busy, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người nhận bàn giao", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Chọn Sale nhận khách",
          value: owner,
          onChange: setOwner,
          options: people.data || []
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Lý do", value: reason, onChange: (e) => setReason(e.target.value) }) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer grid gap-2", children: [
        ["transfer", "Bàn giao khách", "biz.crm_transfer"],
        [
          c.archived_at ? "restore" : "archive",
          c.archived_at ? "Khôi phục khách" : "Lưu trữ khách",
          "biz.crm_archive"
        ]
      ].filter(([, , p]) => can(p)).map(([action, title]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          disabled: busy || !reason.trim() || action === "transfer" && !owner,
          onClick: async () => {
            if (busy) return;
            setBusy(true);
            try {
              await crmRpc("crm_customer_action", {
                _id: id,
                _revision: c.revision,
                _action: action,
                _reason: reason,
                _owner: owner || null
              });
              await qc.invalidateQueries({
                predicate: (q2) => String(q2.queryKey[0]).startsWith("crm_")
              });
              toast.success("Đã cập nhật hồ sơ");
              setForm("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Chưa thực hiện được.");
            } finally {
              setBusy(false);
            }
          },
          children: title
        },
        action
      )) })
    ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: c.name, onClose, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      c.code,
      " · ",
      c.profile_kind === "individual" ? "Cá nhân" : "Tổ chức / Đơn vị"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "h-auto w-full justify-start overflow-x-auto", children: [
        ["overview", "Tổng quan"],
        ["contacts", "Liên hệ"],
        ["care", "Chăm sóc"],
        ["history", "Lịch sử"],
        ["more", "Mở rộng"]
      ].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: v, className: "shrink-0", children: l }, v)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [
        origin.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 text-sm space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Khách được lưu từ Tín hiệu cơ hội." }),
          (can("signal.sale") || can("signal.view_all") || can("signal.manage") || can("signal.create")) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/signals?open=${origin.data}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "mr-2 h-4 w-4" }),
            "Xem tín hiệu gốc"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: label(c.group_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: label(c.segment_id) }),
          c.priority_id && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: label(c.priority_id) })
        ] }),
        c.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${c.phone}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
          c.phone
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Quan hệ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: label(c.relationship_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Nguồn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: label(c.source_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Sale" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: people.data?.find((p) => p.id === c.owner_id)?.name || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Địa chỉ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: c.address || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Ghi chú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-wrap", children: c.note || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setForm("edit"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
            "Sửa hồ sơ"
          ] }),
          (can("biz.crm_transfer") || can("biz.crm_archive")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setForm("action"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }),
            "Bàn giao / Lưu trữ"
          ] }),
          can("crm.customer.delete") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => {
            setReason("");
            setError("");
            setForm("delete");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1.5 h-4 w-4" }),
            "Xóa khách"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "contacts", className: "space-y-3", children: [
        editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => {
              setContact(void 0);
              setForm("contact");
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Thêm liên hệ"
            ]
          }
        ),
        !d.contacts.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có người liên hệ" }),
        d.contacts.map((ct) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "space-y-2 rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: ct.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: !ct.active ? "Đã chuyển công tác" : ct.is_primary ? "Liên hệ chính" : "Liên hệ phụ" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: [ct.title, ct.department, ct.email].filter(Boolean).join(" · ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            ct.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${ct.phone}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
              ct.phone
            ] }) }),
            ct.zalo && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: `https://zalo.me/${ct.zalo.replace(/[^0-9]/g, "")}`,
                target: "_blank",
                rel: "noreferrer",
                children: "Zalo"
              }
            ) }),
            editable && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                onClick: () => {
                  setContact(ct);
                  setForm("contact");
                },
                children: "Sửa"
              }
            )
          ] })
        ] }, ct.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "care", className: "space-y-3", children: [
        editable && !c.archived_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => {
                setSchedule(void 0);
                setForm("schedule");
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarPlus, { className: "h-4 w-4" }),
                "Đặt lịch"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              onClick: () => {
                setSchedule(void 0);
                setForm("interaction");
              },
              children: "Ghi nhận chăm sóc"
            }
          )
        ] }),
        !d.schedules.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lịch chăm sóc" }),
        d.schedules.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "space-y-2 rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-sm", children: s.goal || "Chăm sóc khách hàng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: s.status === "pending" && s.due_at < now ? "destructive" : "secondary",
                children: scheduleStatus(s, now)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: s.content }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            formatDate(s.due_at),
            " ·",
            " ",
            s.kind === "recurring" ? `Mỗi ${s.interval_days} ngày` : s.kind === "seasonal" ? "Mùa vụ / Sự kiện" : "Lịch hẹn"
          ] }),
          s.due_at !== s.original_due_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Ngày gốc: ",
            formatDate(s.original_due_at)
          ] }),
          editable && s.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                onClick: () => {
                  setSchedule(s);
                  setForm("interaction");
                },
                children: "Cập nhật chăm sóc"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => {
                  setSchedule(s);
                  setForm("schedule");
                },
                children: "Sửa / Dời lịch"
              }
            )
          ] })
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "history", className: "space-y-4", children: [
        !d.interactions.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lịch sử chăm sóc" }),
        d.interactions.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "border-l-2 border-primary pl-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: label(i.outcome_id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: i.connected ? "secondary" : "outline", children: i.connected ? "Đã kết nối" : "Lượt thử" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "my-2 whitespace-pre-wrap text-sm", children: i.content }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            formatDate(i.happened_at),
            " ·",
            " ",
            CHANNELS[i.channel] || i.channel,
            " ·",
            " ",
            people.data?.find((p) => p.id === i.actor_id)?.name || "Người thực hiện"
          ] })
        ] }, i.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium", children: [
            "Nhật ký thay đổi (",
            d.events.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-3", children: d.events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b pb-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: {
              customer_save: "Lưu hồ sơ",
              schedule_save: "Lưu / Dời lịch",
              interaction: "Ghi nhận chăm sóc",
              contact_save: "Cập nhật liên hệ",
              transfer: "Bàn giao",
              archive: "Lưu trữ",
              restore: "Khôi phục",
              location_save: "Cập nhật địa điểm"
            }[e.action] || e.action }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              formatDate(e.created_at),
              e.reason ? ` · ${e.reason}` : ""
            ] }),
            e.action === "schedule_save" && e.before_data?.due_at !== e.after_data?.due_at && Boolean(e.before_data?.due_at) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Ngày cũ: ",
              formatDate(String(e.before_data?.due_at)),
              " →",
              " ",
              formatDate(String(e.after_data?.due_at))
            ] })
          ] }, e.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "more", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-2 text-sm", children: [
          catalogs.filter((x) => x.kind === "custom_field" && c.custom_values?.[x.id] !== void 0).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-muted-foreground", children: [
              x.name,
              !x.active || !scopeMatches(x, c.group_id || "", c.segment_id || "", catalogs) ? " (Thông tin đã lưu)" : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: displayValue(x, c.custom_values?.[x.id]) })
          ] }, x.id)),
          [
            ["Tên pháp lý", c.legal_name],
            ["Mã số thuế", c.tax_code],
            ["Email", c.email],
            ["Website", c.website],
            ...Object.entries(c.details)
          ].filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: v })
          ] }, k))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: c.related_ids.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: label(i) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Địa điểm" }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => {
              setLocation(void 0);
              setForm("location");
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Thêm địa điểm"
            ]
          }
        ),
        d.locations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start justify-between gap-2 border-b pb-2 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  l.label,
                  l.is_primary ? " · Chính" : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: l.address })
              ] }),
              editable && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => {
                    setLocation(l);
                    setForm("location");
                  },
                  children: "Sửa"
                }
              )
            ]
          },
          l.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Tài liệu" }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2 text-sm text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "h-4 w-4" }),
          "Thêm tài liệu",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              className: "hidden",
              onChange: async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const r = await supabase.storage.from("crm-files").upload(
                    `${id}/${crypto.randomUUID()}-${file.name.replace(/[^\p{L}\p{N}._-]/gu, "_")}`,
                    file
                  );
                  if (r.error) throw r.error;
                  await files.refetch();
                  toast.success("Đã lưu tài liệu riêng tư");
                } catch (e2) {
                  toast.error(e2 instanceof Error ? e2.message : "Chưa tải lên được.");
                }
              }
            }
          )
        ] }),
        files.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: "Chưa tải được tài liệu" }),
        files.data?.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "h-auto w-full justify-start whitespace-normal text-left",
            variant: "outline",
            onClick: async () => {
              const r = await supabase.storage.from("crm-files").createSignedUrl(`${id}/${f.name}`, 60);
              if (r.error) {
                toast.error("Không tải được tài liệu");
                return;
              }
              window.open(r.data.signedUrl, "_blank", "noopener");
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 shrink-0" }),
              f.name.slice(37)
            ]
          },
          f.name
        ))
      ] })
    ] })
  ] });
}
const config$1 = { count: { label: "Khách hàng", color: "var(--primary)" } };
const colors = ["var(--primary)", "var(--success)", "var(--warning)", "var(--info)", "var(--destructive)", "var(--biz-secondary)", "var(--muted-foreground)"];
function CrmStructureReport({ data, catalogs, group, onDetail }) {
  const rows = structureRows(data, catalogs, group);
  const [unit, setUnit] = reactExports.useState("month");
  const [trendSegment, setTrendSegment] = reactExports.useState("");
  const trend = newCustomerTrend(trendSegment ? { ...data, customers: data.customers.filter((c) => (c.segment_id || "none") === trendSegment) } : data, unit);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 border-t pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Phân tích cơ cấu Tệp khách" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-w-0 gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: config$1, className: "aspect-auto min-w-0 h-64 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: rows.filter((r) => r.count > 0), dataKey: "count", nameKey: "name", innerRadius: 58, outerRadius: 90, onClick: (e) => onDetail(`segment:${e.id}`), children: rows.filter((r) => r.count > 0).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: colors[i % colors.length] }, r.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: config$1, className: "aspect-auto min-w-0 h-64 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: rows, layout: "vertical", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", hide: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "var(--primary)", radius: 4, onClick: (e) => onDetail(`segment:${e.id}`) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: rows.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "h-auto w-full flex-wrap justify-between gap-2 rounded-none py-3 text-left whitespace-normal", onClick: () => onDetail(`segment:${r.id}`), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 flex-1 items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `biz-dot-${i % 6} mt-1 h-3 w-3 shrink-0 rounded-full` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
              r.new,
              " khách mới · ",
              r.priority,
              " trọng điểm"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-right", children: [
          r.count,
          " khách",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: formatRatio(r.share) })
        ] })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 border-t pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Xu hướng khách mới" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { label: "Chu kỳ xu hướng", value: unit, onChange: setUnit, options: [{ id: "month", name: "Theo tháng" }, { id: "quarter", name: "Theo quý" }, { id: "year", name: "Theo năm" }] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pick, { label: "Tất cả tệp", value: trendSegment, onChange: setTrendSegment, options: rows.map((r) => ({ id: r.id, name: r.name })) })
      ] }),
      trend.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: config$1, className: "aspect-auto min-w-0 h-56 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: trend, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { dataKey: "count", stroke: "var(--primary)", strokeWidth: 2 })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Chưa có khách mới trong kỳ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 text-sm", children: rows.filter((r) => r.new > 0).sort((a, b) => b.new - a.new).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "link", className: "h-auto whitespace-normal text-left", onClick: () => onDetail(`segment-new:${r.id}`), children: [
        r.name,
        ": ",
        r.new,
        " khách mới"
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-t pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Chất lượng chăm sóc theo Tệp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "link", className: "h-auto whitespace-normal p-0 text-left font-semibold", onClick: () => onDetail(`segment:${r.id}`), children: [
          r.name,
          " · ",
          r.count,
          " khách"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs sm:grid-cols-3", children: [[r.scheduled, "Có lịch", "scheduled"], [r.unscheduled, "Chưa có lịch", "unscheduled"], [r.overdue, "Quá hạn", "overdue"], [formatRatio(r.onTime), "Đúng hạn", "on-time"], [r.untouched, "Chưa chăm sóc trong kỳ", "untouched"], [r.longUntouched, "Lần chăm sóc cuối >30 ngày", "long-untouched"], [r.priorityUntouched, "Trọng điểm chưa chăm sóc", "priority-untouched"]].map(([n, label, mode]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-auto min-h-16 flex-col items-start gap-1 whitespace-normal p-2 text-left", onClick: () => onDetail(`care:${mode}:${r.id}`), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: n })
        ] }, String(mode))) })
      ] }, r.id)) })
    ] })
  ] });
}
function CrmFieldAnalysis({
  customers,
  catalogs,
  group,
  segment,
  onOpen
}) {
  const [field, setField] = reactExports.useState(""), [selected, setSelected] = reactExports.useState(null);
  const [min, setMin] = reactExports.useState(""), [max, setMax] = reactExports.useState("");
  const defs = catalogs.filter(
    (c2) => [
      "custom_field",
      "trait",
      "channel",
      "cooperation",
      "output",
      "product",
      "need",
      "occasion"
    ].includes(c2.kind) && (!group || scopeMatches(c2, group, segment, catalogs))
  );
  const c = defs.find((c2) => c2.id === field), a = c ? dynamicAnalysis(customers, c, catalogs, { min, max }) : null;
  const typ = c?.kind === "custom_field" ? String(c.config.field_type) : "boolean";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 border-t pt-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Phân tích thông tin chuyên sâu" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SearchPick,
      {
        label: "Chọn trường phân tích",
        value: field,
        onChange: (v) => {
          setField(v);
          setSelected(null);
          setMin("");
          setMax("");
        },
        options: defs.map((c2) => ({ code: c2.id, name: c2.name }))
      }
    ),
    a && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      ["number", "money", "date"].includes(typ) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "aria-label": "Từ giá trị phân tích",
            type: typ === "date" ? "date" : "number",
            value: min,
            onChange: (e) => setMin(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "aria-label": "Đến giá trị phân tích",
            type: typ === "date" ? "date" : "number",
            value: max,
            onChange: (e) => setMax(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Khách duy nhất: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: a.total })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Có dữ liệu: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: a.filled })
        ] }),
        typ === "multiselect" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Lượt lựa chọn: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: a.selections })
        ] }),
        a.sum !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Tổng: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: a.sum.toLocaleString("vi-VN") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Trung bình: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: a.average?.toLocaleString("vi-VN") })
          ] })
        ] })
      ] }),
      ["select", "multiselect", "boolean"].includes(typ) && a.rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChartContainer,
        {
          config: { count: { label: "Khách duy nhất", color: "var(--primary)" } },
          className: "h-64 w-full",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: a.rows, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", hide: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "var(--color-count)" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: a.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "h-auto w-full justify-between whitespace-normal py-3 text-left",
          variant: "ghost",
          onClick: () => setSelected(r.ids),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              r.count,
              " · ",
              r.share?.toLocaleString("vi-VN", { maximumFractionDigits: 1 }),
              "%"
            ] })
          ]
        },
        r.id
      )) }),
      selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: customers.filter((c2) => selected.includes(c2.id)).map((c2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "h-auto w-full justify-start whitespace-normal py-3",
          variant: "link",
          onClick: () => onOpen(c2.id),
          children: c2.name
        },
        c2.id
      )) }),
      !a.filled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có dữ liệu" })
    ] })
  ] });
}
const config = {
  count: { label: "Khách hàng", color: "var(--primary)" },
  connected: { label: "Đã kết nối", color: "var(--success)" },
  attempts: { label: "Lượt thử", color: "var(--info)" }
};
function CrmReports({
  uid,
  catalogs,
  mine,
  onOpen
}) {
  const { can } = useCurrentUser();
  const [period, setPeriod] = reactExports.useState("month");
  const [date, setDate] = reactExports.useState(vnDay());
  const [customStart, setCustomStart] = reactExports.useState(vnDay());
  const [customEnd, setCustomEnd] = reactExports.useState(vnDay());
  const [filters, setFilters] = reactExports.useState({});
  const [dynamic, setDynamic] = reactExports.useState([]);
  const [filterOpen, setFilterOpen] = reactExports.useState(false);
  const [detail, setDetail] = reactExports.useState("");
  const [dimension, setDimension] = reactExports.useState("group_id");
  const people = useQuery(crmPeopleQuery(uid));
  const [start, end] = period === "custom" ? [customStart, customEnd] : periodRange(period, date);
  const q = useQuery(crmReportQuery(uid, start, end, mine, filters, dynamic));
  const [ps, pe] = previousRange(start, end);
  const previous = useQuery(crmReportQuery(uid, ps, pe, mine, filters, dynamic));
  const data = q.data;
  const ratios = data ? reportRatios(data.totals) : null;
  const filter = (k, v) => setFilters((f) => ({ ...f, [k]: v, ...k === "group" ? { segment: "" } : {} }));
  const distribution = data ? Array.from(
    new Set(data.customers.map((c) => String(c[dimension] || "none")))
  ).map((id) => ({
    id,
    name: id === "none" ? "Chưa phân loại" : dimension === "province_code" ? locations.provinces.find((p) => p.code === id)?.name || id : catalogs.find((c) => c.id === id)?.name || "Danh mục cũ",
    count: data.customers.filter(
      (c) => String(c[dimension] || "none") === id
    ).length
  })).sort((a, b) => b.count - a.count) : [];
  const trend = data ? Array.from(new Set(data.interactions.map((i) => vnDay(i.happened_at)))).sort().map((day) => ({
    day,
    attempts: data.interactions.filter((i) => vnDay(i.happened_at) === day).length,
    connected: data.interactions.filter((i) => vnDay(i.happened_at) === day && i.connected).length
  })) : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Chu kỳ",
          value: period,
          onChange: setPeriod,
          options: [
            { id: "day", name: "Ngày" },
            { id: "week", name: "Tuần" },
            { id: "month", name: "Tháng" },
            { id: "quarter", name: "Quý" },
            { id: "year", name: "Năm" },
            { id: "custom", name: "Khoảng ngày" }
          ]
        }
      ) }),
      period === "custom" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Từ ngày", type: "date", className: "w-auto max-w-full", value: customStart, onChange: (e) => setCustomStart(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Đến ngày", type: "date", className: "w-auto max-w-full", value: customEnd, onChange: (e) => setCustomEnd(e.target.value) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "aria-label": "Ngày báo cáo",
          type: "date",
          className: "w-auto max-w-full",
          value: date,
          onChange: (e) => setDate(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setFilterOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }),
        "Bộ lọc"
      ] }),
      can("biz.crm_export") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          disabled: !data,
          onClick: async () => {
            if (!data) return;
            try {
              const exported = await crmRpc("crm_report_dynamic", {
                _filters: dynamic.filter((f) => f.id),
                _start: start,
                _end: end,
                _mine: mine,
                _owner: filters.owner || null,
                _group: filters.group || null,
                _province: filters.province || null,
                _department: filters.department || null,
                _system: filters.system || null,
                _team: filters.team || null,
                _segment: filters.segment || null,
                _priority: filters.priority || null,
                _relationship: filters.relationship || null,
                _export: true
              });
              const r = await import("../_libs/xlsx.mjs");
              const sheet = r.utils.json_to_sheet(
                exported.customers.map((c) => ({
                  Mã: c.code,
                  "Khách hàng": c.name,
                  "Điện thoại": c.phone,
                  Nhóm: catalogs.find((x) => x.id === c.group_id)?.name || "",
                  Tệp: catalogs.find((x) => x.id === c.segment_id)?.name || "Chưa phân loại tệp",
                  Sale: people.data?.find((x) => x.id === c.owner_id)?.name || "",
                  ...Object.fromEntries((exported.catalogs || catalogs).filter((x) => x.kind === "custom_field" && scopeMatches(x, c.group_id || "", c.segment_id || "", exported.catalogs || catalogs)).map((x) => [x.name, displayValue(x, c.custom_values?.[x.id])]))
                }))
              );
              const workbook = r.utils.book_new();
              r.utils.book_append_sheet(workbook, sheet, "Khách hàng");
              r.writeFile(workbook, `CRM-${start}-${end}.xlsx`);
            } catch {
              toast.error("Chưa xuất được dữ liệu.");
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            "Xuất"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      start.split("-").reverse().join("/"),
      " – ",
      end.split("-").reverse().join("/")
    ] }),
    q.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "text-destructive", children: [
      q.error.message,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", onClick: () => q.refetch(), children: "Thử lại" })
    ] }),
    q.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Đang tải báo cáo…" }),
    data && ratios && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4", children: [
        ["customers", "Tổng khách duy nhất", "all"],
        ["new_customers", "Khách mới trong kỳ", "new"],
        ["priority_customers", "Khách trọng điểm", "priority"],
        ["cooperating_customers", "Đang hợp tác", "cooperating"],
        ["unclassified_customers", "Chưa phân loại tệp", "unclassified"],
        ["scheduled_ratio", "Tỷ lệ có lịch", "scheduled"],
        ["on_time_ratio", "Chăm sóc đúng hạn", "on-time"],
        ["overdue_customers", "Khách có lịch quá hạn", "overdue"]
      ].map(([k, label, mode]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          className: "h-auto min-h-24 flex-col items-start gap-2 whitespace-normal rounded-lg px-4 py-3 text-left",
          onClick: () => setDetail(mode),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: k.endsWith("_ratio") ? "text-base" : "text-2xl", children: k === "scheduled_ratio" ? formatRatio(ratios.scheduled) : k === "on_time_ratio" ? formatRatio(ratios.on_time) : data.totals[k] ?? 0 }),
            previous.data && !k.endsWith("_ratio") && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "Kỳ trước: ",
              previous.data.totals[k]
            ] })
          ]
        },
        k
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-x-4 gap-y-5 border-y py-5 lg:grid-cols-5", children: [
        ["processed", "Xử lý lịch"],
        ["on_time", "Chăm sóc đúng hạn"],
        ["connected", "Liên hệ thành công"],
        ["scheduled", "Khách có lịch"],
        ["priority_overdue", "Trọng điểm quá hạn"]
      ].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: l }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "mt-2 block text-base", children: formatRatio(ratios[k]) })
      ] }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CrmStructureReport, { data, catalogs, group: filters.group || "", onDetail: setDetail }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Cơ cấu khách hàng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pick,
            {
              label: "Phân loại biểu đồ",
              value: dimension,
              onChange: setDimension,
              options: [
                { id: "group_id", name: "Nhóm khách" },
                { id: "segment_id", name: "Tệp khách" },
                { id: "priority_id", name: "Mức độ ưu tiên" },
                { id: "relationship_id", name: "Tình trạng hợp tác" },
                { id: "province_code", name: "Tỉnh / Thành phố" },
                { id: "source_id", name: "Nguồn khách" }
              ]
            }
          ) })
        ] }),
        distribution.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config, className: "aspect-auto min-w-0 h-64 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: distribution, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            XAxis,
            {
              dataKey: "name",
              tickLine: false,
              tickFormatter: (v) => String(v).slice(0, 14),
              interval: 0
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Bar,
            {
              dataKey: "count",
              fill: "var(--primary)",
              radius: 4,
              onClick: (entry) => setDetail(`dim:${entry.id}`)
            }
          )
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Hoạt động chăm sóc" }),
        trend.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config, className: "aspect-auto min-w-0 h-64 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: trend, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tickFormatter: (v) => String(v).slice(5) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { dataKey: "attempts", stroke: "var(--info)", strokeWidth: 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { dataKey: "connected", stroke: "var(--success)", strokeWidth: 2 })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {})
      ] }),
      !mine && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Hiệu quả theo nhân viên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: (people.data || []).filter((p) => !filters.owner || p.id === filters.owner).map((p) => {
          const customers = data.customers.filter((c) => c.owner_id === p.id);
          const schedules = data.schedules.filter(
            (s) => s.owner_id === p.id && s.original_due_at >= `${start}T00:00:00+07:00` && s.original_due_at < data.as_of
          );
          const interactions = data.interactions.filter((i) => i.owner_id === p.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              className: "h-auto w-full flex-wrap justify-between gap-2 rounded-none py-4 text-left",
              onClick: () => filter("owner", p.id),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "block", children: p.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: [p.system, p.department, p.team].filter(Boolean).join(" / ") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                  customers.length,
                  " khách · ",
                  schedules.length,
                  " lịch · Kết nối",
                  " ",
                  formatRatio(
                    interactions.length ? interactions.filter((i) => i.connected).length / interactions.length * 100 : null
                  )
                ] })
              ]
            },
            p.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Insights, { data, previous: previous.data, catalogs, onDetail: setDetail }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CrmFieldAnalysis, { customers: data.customers, catalogs: data.catalogs || catalogs, group: filters.group || "", segment: filters.segment || "", onOpen })
    ] }),
    filterOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: "Bộ lọc báo cáo", onClose: () => setFilterOpen(false), children: [
      !mine && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        [
          ["system", "Hệ", "system_id", "system"],
          ["department", "Phòng", "department_id", "department"],
          ["team", "Nhóm", "team_id", "team"]
        ].map(([k, l, id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: l, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Pick,
          {
            label: `Tất cả ${l}`,
            value: filters[k] || "",
            onChange: (v) => filter(k, v),
            options: Array.from(
              new Map(
                (people.data || []).filter((p) => p[id]).map((p) => [
                  String(p[id]),
                  {
                    id: String(p[id]),
                    name: String(p[name])
                  }
                ])
              ).values()
            )
          }
        ) }, k)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhân viên", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Pick,
          {
            label: "Tất cả nhân viên",
            value: filters.owner || "",
            onChange: (v) => filter("owner", v),
            options: people.data || []
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhóm khách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SearchPick,
        {
          label: "Tất cả nhóm",
          value: filters.group || "",
          onChange: (v) => filter("group", v),
          options: catalogs.filter((c) => c.kind === "group").map((c) => ({ code: c.id, name: c.name }))
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tệp khách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchPick, { label: "Tất cả tệp khách", value: filters.segment || "", onChange: (v) => filter("segment", v), options: (filters.group ? segmentOptions(catalogs, filters.group) : catalogs.filter((c) => c.kind === "segment")).map((c) => ({ code: c.id, name: c.name })) }) }),
      [["priority", "Mức độ ưu tiên"], ["relationship", "Tình trạng hợp tác"]].map(([kind, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchPick, { label: `Tất cả ${label.toLowerCase()}`, value: filters[kind] || "", onChange: (v) => filter(kind, v), options: catalogs.filter((c) => c.kind === kind).map((c) => ({ code: c.id, name: c.name })) }) }, kind)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tỉnh / Thành phố", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SearchPick,
        {
          label: "Tất cả tỉnh / thành phố",
          value: filters.province || "",
          onChange: (v) => filter("province", v),
          options: locations.provinces
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DynamicFilters, { catalogs: data?.catalogs || catalogs, group: filters.group || "", segment: filters.segment || "", filters: dynamic, onChange: setDynamic }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "crm-form-footer flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setFilters({});
          setDynamic([]);
        }, children: "Xóa bộ lọc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setFilterOpen(false), children: "Xem báo cáo" })
      ] })
    ] }),
    detail && data && /* @__PURE__ */ jsxRuntimeExports.jsx(CrmModal, { title: "Chi tiết số liệu", onClose: () => setDetail(""), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReportDetails,
      {
        data,
        kind: detail,
        catalogs,
        dimension,
        onOpen
      }
    ) })
  ] });
}
function Empty() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex min-h-32 items-center justify-center text-sm text-muted-foreground", children: "Chưa có dữ liệu" });
}
function Insights({
  data,
  previous,
  catalogs,
  onDetail
}) {
  const unscheduled = customerSubset(data, "unscheduled", catalogs);
  const current = reportRatios(data.totals).on_time;
  const old = previous ? reportRatios(previous.totals).on_time : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-t pt-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Nhận định" }),
    !data.customers.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
      unscheduled.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "h-auto justify-start whitespace-normal text-left",
          variant: "link",
          onClick: () => onDetail("unscheduled"),
          children: [
            unscheduled.length,
            " khách chưa có lịch chăm sóc hiệu lực"
          ]
        }
      ),
      data.totals.priority_overdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
        data.totals.priority_overdue,
        " khách trọng điểm có lịch quá hạn chưa xử lý"
      ] }),
      current !== null && old !== null && current < old && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Tỷ lệ đúng hạn giảm",
        " ",
        (old - current).toLocaleString("vi-VN", { maximumFractionDigits: 1 }),
        " điểm phần trăm so với kỳ trước"
      ] }),
      !unscheduled.length && !data.totals.priority_overdue && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa ghi nhận khách thiếu lịch hoặc trọng điểm quá hạn trong phạm vi này." })
    ] })
  ] });
}
function ReportDetails({
  data,
  kind,
  catalogs,
  dimension,
  onOpen
}) {
  let customers = customerSubset(data, kind, catalogs);
  if (kind === "new")
    customers = customers.filter((c) => c.created_at >= `${data.start}T00:00:00+07:00`);
  if (kind.startsWith("dim:"))
    customers = customers.filter(
      (c) => String(c[dimension] || "none") === kind.slice(4)
    );
  if (kind === "unclassified") customers = customers.filter((c) => !c.segment_id);
  if (kind === "cooperating") customers = customers.filter((c) => catalogs.some((x) => x.id === c.relationship_id && x.config.cooperating === true));
  if (kind.startsWith("segment:") || kind.startsWith("segment-new:")) {
    customers = customers.filter((c) => (c.segment_id || "none") === kind.split(":")[1]);
    if (kind.startsWith("segment-new:")) customers = customers.filter((c) => Date.parse(c.created_at) >= Date.parse(`${data.start}T00:00:00+07:00`));
  }
  if (kind.startsWith("care:")) {
    const [, mode, id] = kind.split(":");
    customers = customerSubset(data, mode, catalogs).filter((c) => (c.segment_id || "none") === id);
  }
  if (["due", "processed"].includes(kind)) {
    const ids = data.schedules.filter(
      (s) => s.original_due_at >= `${data.start}T00:00:00+07:00` && s.original_due_at < data.as_of && (kind !== "processed" || !!s.processed_at)
    ).map((s) => s.customer_id);
    customers = customers.filter((c) => ids.includes(c.id));
  }
  if (kind === "attempts")
    customers = customers.filter((c) => data.interactions.some((i) => i.customer_id === c.id));
  return customers.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      className: "h-auto w-full justify-start whitespace-normal py-3 text-left",
      variant: "ghost",
      onClick: () => onOpen(c.id),
      children: [
        c.name,
        " · ",
        c.code
      ]
    },
    c.id
  )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {});
}
function CrmCatalogTree({ uid, catalogs, onEdit }) {
  const { can } = useCurrentUser();
  const save = useCrmMutation("crm_catalog_reorder");
  const [error, setError] = reactExports.useState("");
  const counts = useQuery({ queryKey: ["crm_catalog_counts", uid], queryFn: () => crmRpc("crm_catalog_counts") });
  const [search, setSearch] = reactExports.useState("");
  const groups = catalogs.filter((c) => c.kind === "group" && (!search || c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || catalogs.some((t) => descendant(t.id, c.id, catalogs) && t.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))));
  async function move(c, dir) {
    try {
      setError("");
      const siblings = catalogs.filter((x) => x.kind === c.kind && x.parent_id === c.parent_id);
      const target = siblings[siblings.findIndex((x) => x.id === c.id) + dir];
      if (!target) return;
      await save.mutateAsync({ id: c.id, other_id: target.id, direction: dir });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa sắp xếp được.");
    }
  }
  const actions = (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Đưa lên", "aria-label": `Đưa ${c.name} lên`, disabled: save.isPending, onClick: () => move(c, -1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Đưa xuống", "aria-label": `Đưa ${c.name} xuống`, disabled: save.isPending, onClick: () => move(c, 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Sửa ${c.name}`, onClick: () => onEdit({ ...c }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) })
  ] });
  if (!can("biz.crm_settings")) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Quản lý Nhóm & Tệp khách" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhóm hoặc tệp khách", placeholder: "Tìm nhóm hoặc tệp…", value: search, onChange: (e) => setSearch(e.target.value) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: error }),
    groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border bg-card", open: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: g.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
          g.active ? "Đang sử dụng" : "Đã ngừng",
          " · ",
          counts.data?.[g.id] ?? "—",
          " khách",
          g.config.review_required === true ? " · Cần rà soát phân loại" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t px-4 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "min-w-0 text-xs text-muted-foreground", children: g.description }),
          actions(g)
        ] }),
        catalogs.filter((c) => c.kind === "segment" && descendant(c.id, g.id, catalogs)).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 border-t py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              c.active ? "Đang sử dụng" : "Đã ngừng",
              " · ",
              counts.data?.[c.id] ?? "—",
              " khách",
              c.parent_id !== g.id ? ` · ${catalogs.find((x) => x.id === c.parent_id)?.name || ""}` : ""
            ] }),
            c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.description })
          ] }),
          actions(c)
        ] }, c.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "mt-2", onClick: () => onEdit({ kind: "segment", parent_id: g.id, name: "", active: true, sort_order: catalogs.filter((c) => c.parent_id === g.id).length + 1, config: {} }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Thêm tệp khách"
        ] })
      ] })
    ] }, g.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => onEdit({ kind: "group", parent_id: null, name: "", active: true, sort_order: groups.length, config: {} }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      "Thêm nhóm khách mới"
    ] })
  ] });
}
function CrmFieldSettings({ uid, catalogs }) {
  const [edit, setEdit] = reactExports.useState(null), [error, setError] = reactExports.useState(""), [search, setSearch] = reactExports.useState(""), [group, setGroup] = reactExports.useState(""), [segment, setSegment] = reactExports.useState("");
  const save = useCrmMutation("crm_catalog_save");
  const [preview, setPreview] = reactExports.useState({});
  const counts = useQuery({
    queryKey: ["crm_catalog_counts", uid],
    queryFn: () => crmRpc("crm_catalog_counts")
  });
  const patch = (v) => {
    if (edit) setEdit({ ...edit, ...v });
  };
  const cfg = (v) => patch({ config: v });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "aria-label": "Tìm trường chuyên sâu",
          placeholder: "Tìm trường…",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setError("");
            setEdit({
              id: "",
              kind: "custom_field",
              name: "",
              parent_id: null,
              description: "",
              sort_order: catalogs.filter((c) => c.kind === "custom_field").length,
              active: true,
              config: { field_type: "text", required: false }
            });
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Thêm trường"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: catalogs.filter(
      (c) => c.kind === "custom_field" && c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    ).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-sm", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          FIELD_TYPES[String(c.config.field_type)],
          " ·",
          " ",
          c.active ? "Đang sử dụng" : "Đã ngừng",
          " · ",
          counts.data?.[c.id] || 0,
          " hồ sơ · Thứ tự ",
          c.sort_order
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          "aria-label": `Sửa trường ${c.name}`,
          onClick: () => {
            setError("");
            setEdit(c);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
        }
      )
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-semibold", children: "Xem trước biểu mẫu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchPick,
          {
            label: "Nhóm xem trước",
            value: group,
            onChange: (v) => {
              setGroup(v);
              setSegment("");
            },
            options: catalogs.filter((c) => c.kind === "group").map((c) => ({ code: c.id, name: c.name }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchPick,
          {
            label: "Tệp xem trước",
            value: segment,
            onChange: setSegment,
            options: segmentOptions(catalogs, group).map((c) => ({ code: c.id, name: c.name }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CustomFields,
          {
            catalogs,
            group,
            segment,
            values: preview,
            onChange: setPreview
          }
        )
      ] })
    ] }),
    edit && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CrmModal,
      {
        title: edit.id ? "Sửa trường chuyên sâu" : "Thêm trường chuyên sâu",
        onClose: () => setEdit(null),
        dirty: true,
        busy: save.isPending,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            className: "space-y-4",
            onSubmit: async (e) => {
              e.preventDefault();
              setError("");
              try {
                await save.mutateAsync({ ...edit, id: edit.id || null });
                setEdit(null);
              } catch (e2) {
                setError(e2 instanceof Error ? e2.message : "Chưa lưu được trường.");
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên trường", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "aria-label": "Tên trường",
                  required: true,
                  value: edit.name,
                  onChange: (e) => patch({ name: e.target.value })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mô tả / Hướng dẫn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: edit.description,
                  onChange: (e) => patch({ description: e.target.value })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Pick,
                {
                  label: "Kiểu trường",
                  value: String(edit.config.field_type),
                  onChange: (v) => cfg({
                    ...edit.config,
                    field_type: v,
                    options: ["select", "multiselect"].includes(v) ? fieldOptions(edit) : void 0
                  }),
                  options: Object.entries(FIELD_TYPES).map(([id, name]) => ({ id, name }))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScopeEditor, { config: edit.config, catalogs, onChange: cfg }),
              ["select", "multiselect"].includes(String(edit.config.field_type)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Lựa chọn" }),
                fieldOptions(edit).map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      "aria-label": `Tên lựa chọn ${i + 1}`,
                      value: o.name,
                      onChange: (e) => cfg({
                        ...edit.config,
                        options: fieldOptions(edit).map(
                          (x) => x.id === o.id ? { ...x, name: e.target.value } : x
                        )
                      })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Checkbox,
                      {
                        checked: o.active,
                        onCheckedChange: (yes) => cfg({
                          ...edit.config,
                          options: fieldOptions(edit).map(
                            (x) => x.id === o.id ? { ...x, active: yes === true } : x
                          )
                        })
                      }
                    ),
                    "Dùng"
                  ] })
                ] }, o.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: () => cfg({
                      ...edit.config,
                      options: [
                        ...fieldOptions(edit),
                        { id: crypto.randomUUID(), name: "", active: true }
                      ]
                    }),
                    children: "Thêm lựa chọn"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thứ tự", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: edit.sort_order,
                  onChange: (e) => patch({ sort_order: Number(e.target.value) })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: edit.config.required === true,
                    onCheckedChange: (v) => cfg({ ...edit.config, required: v === true })
                  }
                ),
                "Bắt buộc"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: edit.active,
                    onCheckedChange: (v) => patch({ active: v === true })
                  }
                ),
                "Đang sử dụng"
              ] }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: save.isPending, children: "Lưu trường" }) })
            ]
          }
        )
      }
    )
  ] });
}
function CrmSettings({ uid, catalogs }) {
  const [kind, setKind] = reactExports.useState("trait");
  const [section, setSection] = reactExports.useState("groups");
  const [catalogSearch, setCatalogSearch] = reactExports.useState("");
  const [edit, setEdit] = reactExports.useState(null);
  const [template, setTemplate] = reactExports.useState(null);
  const [grant, setGrant] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const { can } = useCurrentUser();
  const save = useCrmMutation("crm_catalog_save");
  const saveTemplate = useCrmMutation("crm_template_save");
  const saveGrant = useCrmMutation("crm_access_save");
  const people = useQuery(crmPeopleQuery(uid));
  const templates = useQuery(crmTemplatesQuery(uid));
  const counts = useQuery({ queryKey: ["crm_catalog_counts", uid], queryFn: () => crmRpc("crm_catalog_counts") });
  const grants = useQuery({
    queryKey: ["crm_access", uid],
    enabled: can("biz.crm_access"),
    queryFn: () => crmRpc("crm_access_list")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: section, onValueChange: (v) => {
      setSection(v);
      setKind(v === "catalogs" ? "trait" : "priority");
      setCatalogSearch("");
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-auto w-full justify-start overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "groups", children: "Nhóm & Tệp khách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "catalogs", children: "Đặc điểm kinh doanh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "fields", children: "Trường chuyên sâu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "other", children: "Danh mục CRM khác" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "templates", children: "Mẫu chăm sóc" }),
        can("biz.crm_access") && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "access", children: "Quyền CRM" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "groups", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CrmCatalogTree, { uid, catalogs, onEdit: (c) => {
        setError("");
        setEdit(c);
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "fields", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CrmFieldSettings, { uid, catalogs }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: section === "other" ? "other" : "catalogs", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "border-t pt-5 font-semibold", children: section === "other" ? "Danh mục CRM khác" : "Đặc điểm kinh doanh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm danh mục CRM", placeholder: "Tìm danh mục…", value: catalogSearch, onChange: (e) => setCatalogSearch(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pick,
            {
              label: "Loại danh mục",
              value: kind,
              onChange: setKind,
              options: Object.entries(KINDS).filter(([id]) => !["group", "segment", "custom_field"].includes(id) && (section === "other" ? !Object.hasOwn(FEATURE_KINDS, id) : Object.hasOwn(FEATURE_KINDS, id))).map(([id, name]) => ({ id, name }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => {
                setError("");
                setEdit({ kind, name: "", active: true, sort_order: 0, config: {} });
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                "Thêm"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: catalogs.filter((c) => c.kind === kind && c.name.toLocaleLowerCase().includes(catalogSearch.toLocaleLowerCase())).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-sm", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              c.parent_id ? catalogs.find((x) => x.id === c.parent_id)?.name : "Danh mục gốc",
              " ",
              "· ",
              c.active ? "Đang sử dụng" : "Đã ngừng",
              " · Thứ tự ",
              c.sort_order,
              " · ",
              counts.data?.[c.id] || 0,
              " hồ sơ",
              Object.hasOwn(FEATURE_KINDS, c.kind) && !c.config.scope_mode && (!Array.isArray(c.config.group_ids) || !c.config.group_ids.length) ? " · Cần cấu hình phạm vi" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              "aria-label": `Sửa ${c.name}`,
              onClick: () => {
                setError("");
                setEdit({ ...c });
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
            }
          )
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "templates", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => setTemplate({ name: "", goal: "", interval_days: 15, channel: "phone", active: true }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Thêm mẫu"
            ]
          }
        ),
        templates.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-b py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-sm", children: t.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              t.goal,
              " · ",
              t.interval_days,
              " ngày · ",
              t.owner_id ? "Cá nhân" : "Dùng chung"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setTemplate(t), children: "Sửa" })
        ] }, t.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "access", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Quyền theo cơ cấu tổ chức" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y text-sm", children: [
          ["Sale", "Khách của chính mình"],
          ["Trưởng Nhóm", "Nhân viên thuộc nhóm"],
          ["Trưởng Phòng", "Nhóm và nhân viên thuộc phòng"],
          ["Giám Đốc Hệ", "Toàn Hệ phụ trách"],
          ["Lãnh đạo toàn Khối", "Toàn Khối theo bổ nhiệm hiệu lực"],
          ["Admin / Super Admin", "Quản trị toàn bộ CRM"]
        ].map(([l, r]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: r })
        ] }, l)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setGrant({}), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Cấp quyền nghiệp vụ riêng"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: grants.data?.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-wrap items-center justify-between gap-2 py-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: people.data?.find((p) => p.id === g.user_id)?.name || "Nhân sự" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  g.permission,
                  " · ",
                  g.reason,
                  g.revoked_at ? " · Đã thu hồi" : ""
                ] })
              ] }),
              !g.revoked_at && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  disabled: saveGrant.isPending,
                  onClick: async () => {
                    try {
                      await saveGrant.mutateAsync({
                        user_id: g.user_id,
                        permission: g.permission,
                        revoke_id: g.id,
                        reason: "Thu hồi quyền CRM"
                      });
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Chưa thu hồi được.");
                    }
                  },
                  children: "Thu hồi"
                }
              )
            ]
          },
          g.id
        )) })
      ] })
    ] }),
    edit && /* @__PURE__ */ jsxRuntimeExports.jsx(CrmModal, { title: "Danh mục CRM", onClose: () => setEdit(null), dirty: true, busy: save.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        className: "space-y-4",
        onSubmit: async (e) => {
          e.preventDefault();
          try {
            setError("");
            await save.mutateAsync(edit);
            setEdit(null);
          } catch (e2) {
            setError(e2 instanceof Error ? e2.message : "Chưa lưu được.");
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên danh mục", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": "Tên danh mục",
              required: true,
              value: String(edit.name || ""),
              onChange: (e) => setEdit({ ...edit, name: e.target.value })
            }
          ) }),
          edit.kind !== "group" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhóm cha", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchPick,
            {
              label: "Không có nhóm cha",
              value: String(edit.parent_id || ""),
              onChange: (v) => setEdit({ ...edit, parent_id: v }),
              options: catalogs.filter(
                (c) => ["group", "block"].includes(c.kind) && (c.active || c.id === edit.parent_id) && c.id !== edit.id
              ).map((c) => ({ code: c.id, name: c.name }))
            }
          ) }),
          Object.hasOwn(FEATURE_KINDS, String(edit.kind)) && /* @__PURE__ */ jsxRuntimeExports.jsx(ScopeEditor, { config: edit.config, catalogs, onChange: (config2) => setEdit({ ...edit, config: config2 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mô tả", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: String(edit.description || ""),
              onChange: (e) => setEdit({ ...edit, description: e.target.value })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thứ tự", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: String(edit.sort_order || 0),
              onChange: (e) => setEdit({ ...edit, sort_order: Number(e.target.value) })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: edit.active === true,
                onCheckedChange: (v) => setEdit({ ...edit, active: v === true })
              }
            ),
            "Đang sử dụng"
          ] }),
          (edit.kind === "priority" || edit.kind === "outcome" || edit.kind === "relationship") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: (edit.kind === "priority" ? [["key_customer", "Khách trọng điểm"]] : edit.kind === "relationship" ? [["cooperating", "Đang hợp tác"]] : [
            ["connected", "Thực sự kết nối / Trao đổi được"],
            ["completed", "Hoàn tất hợp lệ"],
            ["need", "Có nhu cầu"]
          ]).map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: edit.config?.[k] === true,
                onCheckedChange: (v) => setEdit({
                  ...edit,
                  config: { ...edit.config, [k]: v === true }
                })
              }
            ),
            l
          ] }, k)) }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", type: "submit", disabled: save.isPending, children: "Lưu danh mục" }) })
        ]
      }
    ) }),
    template && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CrmModal,
      {
        title: "Mẫu chăm sóc",
        onClose: () => setTemplate(null),
        dirty: true,
        busy: saveTemplate.isPending,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            className: "space-y-4",
            onSubmit: async (e) => {
              e.preventDefault();
              try {
                await saveTemplate.mutateAsync({ ...template, shared: template.owner_id === null });
                setTemplate(null);
              } catch (e2) {
                setError(e2 instanceof Error ? e2.message : "Chưa lưu được.");
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên mẫu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  required: true,
                  value: template.name || "",
                  onChange: (e) => setTemplate({ ...template, name: e.target.value })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mục tiêu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: template.goal || "",
                  onChange: (e) => setTemplate({ ...template, goal: e.target.value })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Chu kỳ (ngày)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 1,
                  value: template.interval_days || 15,
                  onChange: (e) => setTemplate({ ...template, interval_days: Number(e.target.value) })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Pick,
                {
                  label: "Kênh liên hệ",
                  value: template.channel || "phone",
                  onChange: (v) => setTemplate({ ...template, channel: v }),
                  options: Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: template.owner_id === null,
                    onCheckedChange: (v) => setTemplate({ ...template, owner_id: v === true ? null : uid })
                  }
                ),
                "Dùng chung"
              ] }),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveTemplate.isPending, className: "w-full", children: "Lưu mẫu" }) })
            ]
          }
        )
      }
    ),
    grant && /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: "Quyền CRM riêng", onClose: () => setGrant(null), busy: saveGrant.isPending, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhân sự", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Chọn nhân sự",
          value: String(grant.user_id || ""),
          onChange: (v) => setGrant({ ...grant, user_id: v }),
          options: people.data || []
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quyền", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Chọn quyền",
          value: String(grant.permission || ""),
          onChange: (v) => setGrant({ ...grant, permission: v }),
          options: [
            { id: "biz.crm_edit_other", name: "Sửa hộ trong phạm vi" },
            { id: "biz.crm_transfer", name: "Bàn giao trong phạm vi" },
            { id: "biz.crm_export", name: "Xuất dữ liệu" },
            { id: "biz.crm_archive", name: "Lưu trữ / Khôi phục" },
            { id: "biz.crm_settings", name: "Cài đặt CRM" }
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày hết hiệu lực (không bắt buộc)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "datetime-local",
          onChange: (e) => setGrant({
            ...grant,
            ended_at: e.target.value ? `${e.target.value}:00+07:00` : null
          })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lý do", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: String(grant.reason || ""),
          onChange: (e) => setGrant({ ...grant, reason: e.target.value })
        }
      ) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "crm-form-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          className: "w-full",
          disabled: saveGrant.isPending,
          onClick: async () => {
            try {
              await saveGrant.mutateAsync(grant);
              setGrant(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Chưa cấp được quyền.");
            }
          },
          children: "Lưu quyền"
        }
      ) })
    ] })
  ] });
}
const PAGE_SIZE = 50;
function CrmDatabase({ uid, catalogs }) {
  const [group, setGroup] = reactExports.useState("");
  const [segment, setSegment] = reactExports.useState("");
  const [archive, setArchive] = reactExports.useState("all");
  const [searchText, setSearchText] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(1);
  const [detailId, setDetailId] = reactExports.useState("");
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);
  reactExports.useEffect(() => {
    setPage(1);
  }, [group, segment, archive, search]);
  const query = useQuery({
    queryKey: ["crm_database_list", uid, group, segment, archive, search, page],
    queryFn: () => crmRpc("crm_database_list", {
      _group: group || null,
      _segment: segment || null,
      _search: search,
      _archive: archive,
      _page: page,
      _size: PAGE_SIZE
    }),
    staleTime: 3e4,
    retry: false
  });
  const detail = useQuery({
    queryKey: ["crm_database_detail", uid, detailId],
    queryFn: () => crmRpc("crm_database_detail", { _id: detailId }),
    enabled: !!detailId,
    staleTime: 0,
    gcTime: 0,
    retry: false
  });
  const nameOf = (id) => catalogs.find((cat) => cat.id === id)?.name ?? "—";
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-lg font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-5 w-5" }),
          "Toàn bộ dữ liệu khách hàng"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Tra cứu toàn công ty · Chỉ xem, không chỉnh sửa · Điện thoại được che trong danh sách" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: query.isLoading ? "Đang tải…" : total.toLocaleString("vi-VN") + " khách" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative sm:col-span-2 xl:col-span-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "aria-label": "Tìm tên hoặc mã khách hàng",
            className: "pl-9",
            value: searchText,
            placeholder: "Tên hoặc mã khách hàng…",
            onChange: (e) => setSearchText(e.target.value),
            maxLength: 150
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Tất cả nhóm khách",
          value: group,
          onChange: (value) => {
            setGroup(value);
            setSegment("");
          },
          options: catalogs.filter((cat) => cat.kind === "group").map((cat) => ({ id: cat.id, name: cat.name }))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Tất cả tệp khách",
          value: segment,
          onChange: setSegment,
          options: (group ? segmentOptions(catalogs, group) : catalogs.filter((cat) => cat.kind === "segment")).map((cat) => ({ id: cat.id, name: cat.name }))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Tất cả hồ sơ",
          value: archive,
          onChange: setArchive,
          options: [
            { id: "all", name: "Tất cả hồ sơ" },
            { id: "active", name: "Đang quản lý" },
            { id: "archived", name: "Đã lưu trữ" }
          ]
        }
      )
    ] }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "rounded-lg border border-destructive/40 p-3 text-sm text-destructive", children: [
      query.error.message,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[900px] text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Mã khách", "Tên khách hàng", "Số điện thoại", "Nhóm", "Tệp khách", "Phụ trách", "Trạng thái", "Chi tiết"].map((title) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-3 py-3 text-left font-medium", children: title }, title)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        (query.data?.rows ?? []).map((customer) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: customer.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: customer.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono tabular-nums", children: customer.phone_masked || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: nameOf(customer.group_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: nameOf(customer.segment_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: customer.owner_name || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: customer.archived_at ? "Đã lưu trữ" : "Đang quản lý" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setDetailId(customer.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "mr-1.5 h-4 w-4" }),
            "Xem"
          ] }) })
        ] }, customer.id)),
        query.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "p-8 text-center text-muted-foreground", children: "Đang tải danh sách…" }) }),
        !query.isLoading && !query.error && !query.data?.rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "p-8 text-center text-muted-foreground", children: "Không tìm thấy khách hàng phù hợp." }) })
      ] })
    ] }) }),
    total > PAGE_SIZE && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Trang ",
        page,
        " / ",
        pageCount
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          disabled: page === 1 || query.isFetching,
          onClick: () => setPage((p) => p - 1),
          children: "Trước"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          disabled: page >= pageCount || query.isFetching,
          onClick: () => setPage((p) => p + 1),
          children: "Sau"
        }
      )
    ] }),
    detailId && /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: "Chi tiết khách hàng", onClose: () => setDetailId(""), children: [
      detail.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải chi tiết…" }),
      detail.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: detail.error.message }),
      detail.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-semibold", children: [
          detail.data.name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: [
            "(",
            detail.data.code,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "grid grid-cols-[minmax(115px,auto)_minmax(0,1fr)] gap-x-3 gap-y-2", children: [
          ["Số điện thoại", detail.data.phone],
          ["Email", detail.data.email],
          ["Nhóm khách", nameOf(detail.data.group_id)],
          ["Tệp khách", nameOf(detail.data.segment_id)],
          ["Ưu tiên", nameOf(detail.data.priority_id)],
          ["Nguồn", nameOf(detail.data.source_id)],
          ["Phụ trách", detail.data.owner_name],
          ["Địa chỉ", detail.data.address],
          ["Tên pháp lý", detail.data.legal_name],
          ["Mã số thuế", detail.data.tax_code],
          ["Website", detail.data.website],
          ["Ghi chú", detail.data.note],
          ["Ngày tạo", formatDate(detail.data.created_at)]
        ].map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "contents", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: key }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "min-w-0 break-words font-medium", children: value || "—" })
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setDetailId(""), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-4 w-4" }),
        "Đóng"
      ] }) })
    ] })
  ] });
}
function Crm() {
  const { user: u, can, isSuperAdmin } = useCurrentUser();
  const canDatabase = isSuperAdmin || can("crm.database.view");
  const uid = u?.id || "";
  const [area, setArea] = reactExports.useState("mine");
  const [view, setView] = reactExports.useState("today");
  const [search, setSearch] = reactExports.useState("");
  const [owner, setOwner] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [group, setGroup] = reactExports.useState("");
  const [segment, setSegment] = reactExports.useState("");
  const [dynamic, setDynamic] = reactExports.useState([]);
  const [priority, setPriority] = reactExports.useState("");
  const [archived, setArchived] = reactExports.useState(false);
  const [filterOpen, setFilterOpen] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState("");
  reactExports.useEffect(() => {
    const customer = new URLSearchParams(window.location.search).get("customer");
    if (customer && /^[0-9a-f-]{36}$/i.test(customer)) setOpen(customer);
  }, []);
  const [create, setCreate] = reactExports.useState(false);
  const [care, setCare] = reactExports.useState();
  const catalogs = useQuery(catalogsQuery(uid));
  const people = useQuery(crmPeopleQuery(uid));
  const read = useQuery({
    ...crmReadQuery(uid, area === "mine", area === "manage" ? owner : "", search, archived, group, segment, priority, dynamic),
    enabled: area !== "database"
  });
  const cats = catalogs.data || [];
  const data = read.data;
  const now = data?.server_now || (/* @__PURE__ */ new Date()).toISOString();
  const today = vnDay(now);
  const schedules = data?.schedules || [];
  const due = schedules.filter((s) => s.status === "pending" && vnDay(s.due_at) === today);
  const overdue = schedules.filter((s) => s.status === "pending" && vnDay(s.due_at) < today);
  const processed = schedules.filter((s) => s.processed_at && vnDay(s.processed_at) === today);
  const label = (id) => cats.find((c) => c.id === id)?.name || "";
  const selectedSchedules = schedules.filter(
    (s) => view === "today" ? s.status === "pending" && vnDay(s.due_at) <= today : view === "history" ? !!s.processed_at : view === "calendar" ? true : false
  ).filter(
    (s) => filter === "all" || filter === "overdue" && s.status === "pending" && s.due_at < now || filter === "today" && vnDay(s.due_at) === today || filter === "done" && !!s.processed_at
  );
  const customers = (data?.customers || []).filter(
    (c) => (!group || c.group_id === group) && (!segment || c.segment_id === segment) && (!priority || c.priority_id === priority)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "crm-module space-y-5 pb-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "CRM Khách Hàng" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full md:w-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Khu vực CRM",
          value: area,
          onChange: (v) => {
            setArea(v);
            setSearch("");
            setOwner("");
          },
          options: [
            { id: "mine", name: "CRM Của Tôi" },
            ...can("biz.crm_view_scope") ? [
              { id: "manage", name: "Theo Dõi Nhân Viên" },
              { id: "reports", name: "Báo cáo & Phân tích" }
            ] : [],
            ...can("biz.crm_settings") ? [{ id: "settings", name: "Cài đặt CRM" }] : [],
            ...canDatabase ? [{ id: "database", name: "Toàn bộ dữ liệu khách hàng" }] : []
          ]
        }
      ) })
    ] }),
    area === "database" ? canDatabase ? /* @__PURE__ */ jsxRuntimeExports.jsx(CrmDatabase, { uid, catalogs: cats }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", children: "Bạn không có quyền xem dữ liệu CRM toàn công ty." }) : area === "settings" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CrmSettings, { uid, catalogs: cats }) : area === "reports" || view === "report" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => {
            setArea("mine");
            setView("today");
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4" }),
            "Chăm sóc hôm nay"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CrmReports, { uid, catalogs: cats, mine: area === "mine", onOpen: setOpen })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: view, onValueChange: setView, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "h-auto w-full justify-start overflow-x-auto", children: [
        ["today", "Hôm nay"],
        ["customers", "Khách hàng"],
        ["calendar", "Lịch chăm sóc"],
        ["history", "Lịch sử"],
        ["report", "Báo cáo"]
      ].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { className: "shrink-0", value: v, children: l }, v)) }) }),
      view === "today" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 divide-x rounded-lg border bg-card", children: [
        [due.length, "Hôm nay", "today"],
        [overdue.length, "Quá hạn", "overdue"],
        [processed.length, "Đã xử lý", "done"]
      ].map(([n, l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          className: "h-auto flex-col gap-1 rounded-none py-4",
          onClick: () => {
            setFilter(String(v));
            if (v === "done") setView("history");
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "strong",
              {
                className: `text-xl ${v === "overdue" ? "text-destructive" : v === "done" ? "text-success" : "text-primary"}`,
                children: n
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: l })
          ]
        },
        String(v)
      )) }),
      area === "manage" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhân viên trong phạm vi", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Tất cả nhân viên",
          value: owner,
          onChange: setOwner,
          options: (people.data || []).filter((p) => p.id !== uid)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": "Tìm khách hàng",
              className: "pl-9",
              placeholder: "Tìm khách hàng, điện thoại…",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            "aria-label": "Bộ lọc khách hàng",
            onClick: () => setFilterOpen(true),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" })
          }
        ),
        area === "mine" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreate(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Thêm khách" })
        ] })
      ] }),
      view !== "customers" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto", children: [
        ["all", "Tất cả"],
        ["today", "Hôm nay"],
        ["overdue", "Quá hạn"],
        ["done", "Đã xử lý"]
      ].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: filter === v ? "default" : "outline",
          onClick: () => setFilter(v),
          children: l
        },
        v
      )) }),
      read.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "text-sm text-destructive", children: [
        read.error.message,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", onClick: () => read.refetch(), children: "Thử lại" })
      ] }),
      read.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải khách hàng…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 lg:grid-cols-2", children: (view === "customers" ? customers.map((c) => ({ c, s: void 0 })) : selectedSchedules.flatMap((s) => {
        const c = customers.find((c2) => c2.id === s.customer_id);
        return c ? [{ c, s }] : [];
      })).map(({ c, s }) => {
        const contact = data?.contacts.find((ct) => ct.id === s?.contact_id) || data?.contacts.find((ct) => ct.customer_id === c.id && ct.is_primary);
        const phone = contact?.phone || c.phone;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "space-y-3 rounded-lg border bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "link",
                className: "h-auto min-w-0 justify-start whitespace-normal p-0 text-left text-base font-semibold",
                onClick: () => setOpen(c.id),
                children: c.name
              }
            ),
            c.priority_id && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "shrink-0", variant: "outline", children: label(c.priority_id) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: [label(c.segment_id) || label(c.group_id), contact?.name].filter(Boolean).join(" · ") }),
          s ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: s.goal || "Chăm sóc khách hàng" }),
            s.content && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm text-muted-foreground", children: s.content }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(s.due_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: s.status === "pending" && s.due_at < now ? "destructive" : "secondary",
                  children: scheduleStatus(s, now)
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: schedules.find((s2) => s2.customer_id === c.id && s2.status === "pending") ? `Lịch tiếp theo: ${formatDate(schedules.find((s2) => s2.customer_id === c.id && s2.status === "pending")?.due_at || now)}` : "Chưa đặt lịch chăm sóc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_minmax(0,1fr)] gap-2", children: [
            phone ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${phone}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
              "Gọi"
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setOpen(c.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
              "Liên hệ"
            ] }),
            (c.owner_id === uid || can("biz.crm_edit_other")) && (!s || s.status === "pending") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCare({ customer: c, schedule: s }), children: "Cập nhật chăm sóc" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(c.id), children: "Xem hồ sơ" })
          ] })
        ] }, s?.id || c.id);
      }) }),
      data && (view === "customers" ? customers.length === 0 : selectedSchedules.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-44 flex-col items-center justify-center gap-3 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-9 w-9" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: view === "customers" ? "Chưa có khách hàng trong danh sách" : "Không có lịch chăm sóc trong danh sách" })
      ] })
    ] }),
    filterOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(CrmModal, { title: "Bộ lọc khách hàng", onClose: () => setFilterOpen(false), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhóm khách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SearchPick,
        {
          label: "Tất cả nhóm khách",
          value: group,
          onChange: (v) => {
            setGroup(v);
            setSegment("");
          },
          options: cats.filter((c) => c.kind === "group").map((c) => ({ code: c.id, name: c.name }))
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tệp khách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchPick, { label: "Tất cả tệp khách", value: segment, onChange: setSegment, options: (group ? segmentOptions(cats, group) : cats.filter((c) => c.kind === "segment")).map((c) => ({ code: c.id, name: c.name })) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mức độ ưu tiên", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Tất cả mức ưu tiên",
          value: priority,
          onChange: setPriority,
          options: cats.filter((c) => c.kind === "priority")
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pick,
        {
          label: "Trạng thái hồ sơ",
          value: archived ? "archived" : "active",
          onChange: (v) => setArchived(v === "archived"),
          options: [
            { id: "active", name: "Đang quản lý" },
            { id: "archived", name: "Đã lưu trữ" }
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DynamicFilters, { catalogs: cats, group, segment, filters: dynamic, onChange: setDynamic }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "crm-form-footer flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => {
              setGroup("");
              setSegment("");
              setPriority("");
              setArchived(false);
              setDynamic([]);
            },
            children: "Xóa bộ lọc"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setFilterOpen(false), children: "Áp dụng" })
      ] })
    ] }),
    create && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerForm,
      {
        catalogs: cats,
        onClose: () => setCreate(false),
        onSaved: (id) => {
          setCreate(false);
          setOpen(id);
        }
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(CrmDetail, { uid, id: open, catalogs: cats, onClose: () => setOpen("") }),
    care && /* @__PURE__ */ jsxRuntimeExports.jsx(
      InteractionForm,
      {
        customer: care.customer,
        schedule: care.schedule,
        contacts: data?.contacts.filter((c) => c.customer_id === care.customer.id) || [],
        catalogs: cats,
        onClose: () => setCare(void 0)
      }
    )
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "biz.crm_use", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crm, {}) });
export {
  SplitComponent as component
};
