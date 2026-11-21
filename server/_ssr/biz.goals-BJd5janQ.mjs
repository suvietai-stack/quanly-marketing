import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageHeader, F as useAuth, u as useCurrentUser, L as Label, I as Input, B as Button, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle } from "./router-CkmTURa-.mjs";
import { d as bizMembersQuery, e as bizDepartmentsQuery } from "./queries-D_iIARlF.mjs";
import { b as bizGoalsQuery, a as bizGoalDeadlineQuery, u as useGoalAction, r as rollingQuery, c as bizGoalEventsQuery, d as useRollingSave } from "./rollingQueries-Cvto4HY-.mjs";
import { g as goalState, d as displayVersion, S as STATE_LABELS, b as STATUS_LABELS, c as draftDeletable, f as fmtGoal, a as fmtQuarter, e as allocationMatches, h as allocatedText, i as differenceText, j as allocationPercent, v as validValue } from "./goals-CPMRtvZ0.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import "../_libs/seroval.mjs";
import { aC as RefreshCw, T as Target, r as Eye, be as PencilLine, aR as History, ah as ChevronUp, n as ChevronDown, ap as Trash2, m as Save, ad as Send, q as Check } from "../_libs/lucide-react.mjs";
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
function distributeExact(amount, weights) {
  if (!weights.length) return [];
  const target = BigInt(amount);
  if (target < 0n || weights.some((w) => !/^\d+$/.test(w))) throw new Error("Phân bổ không hợp lệ.");
  let values = weights.map((w) => BigInt(w));
  let denominator = values.reduce((a, b) => a + b, 0n);
  if (denominator === 0n) {
    values = values.map(() => 1n);
    denominator = BigInt(values.length);
  }
  const result = values.map((w) => target * w / denominator);
  const order = values.map((w, index) => ({ index, remainder: target * w % denominator })).sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
  let rest = target - result.reduce((a, b) => a + b, 0n);
  for (const entry of order) {
    if (rest === 0n) break;
    result[entry.index] = (result[entry.index] ?? 0n) + 1n;
    rest--;
  }
  return result.map((v) => v.toString());
}
function proposeMonths(metric, firstMonth, mode) {
  if (metric.remaining === null || metric.definition.aggregation !== "sum") return [...metric.current];
  const start = firstMonth - 1;
  const weights = metric.current.slice(start).map((v) => mode === "equal" ? "1" : v ?? "0");
  return [...metric.current.slice(0, start), ...distributeExact(metric.remaining, weights)];
}
function rebaseMonths(metric, oldMonths, firstMonth) {
  return metric.current.map((current, m) => m < firstMonth - 1 ? current : oldMonths[m] ?? current);
}
function isStaleDraft(proposal, basis) {
  return !!proposal && proposal.status !== "approved" && proposal.first_month < basis.first_month;
}
function coverageMissingText(c) {
  if (!c?.missing.length) return "";
  const KIND = { day: "Ngày", week: "Tuần", month: "Tháng", quarter: "Quý" };
  return c.missing.map((m) => `${KIND[m.period_kind] ?? m.period_kind} ${m.period}`).join(", ");
}
function rollingError(items, basis) {
  if (basis.first_month > 12) return "Không còn tháng tương lai để điều chỉnh.";
  if (items.length !== basis.items.length) return "Danh sách KR đã thay đổi.";
  for (const metric of basis.items) {
    const item = items.find((i) => i.metric_id === metric.metric_id);
    if (!item || item.annual !== metric.annual || item.months.length !== 12) return "Không được thay đổi cam kết năm.";
    if (item.months.some((v) => v === null || !/^\d{1,20}$/.test(v))) return "Cần nhập đủ số nguyên không âm cho các tháng.";
    if (item.months.slice(0, basis.first_month - 1).some((v, i) => v !== metric.current[i])) return "Không được sửa tháng hiện tại hoặc lịch sử.";
    if (metric.definition.aggregation !== "sum") {
      if (item.months.some((v, i) => v !== metric.current[i])) return "KR bình quân/tỷ lệ giữ quy tắc hiện hành, không dùng kế hoạch bù cộng dồn.";
    } else {
      if (!metric.complete || metric.remaining === null) return "Thiếu dữ liệu chính thức của tháng đã kết thúc.";
      const future = item.months.slice(basis.first_month - 1).reduce((s, v) => s + BigInt(v ?? "0"), 0n);
      if (future < BigInt(metric.remaining)) return "Tổng kế hoạch tương lai chưa đủ phần còn phải đạt.";
    }
  }
  return null;
}
function BizRollingPlan({ goal, uid }) {
  const query = useQuery({ ...rollingQuery(uid, goal.id), enabled: !!goal.official_version_id });
  const [open, setOpen] = reactExports.useState(false);
  const [history, setHistory] = reactExports.useState(false);
  const data = query.data;
  if (!goal.official_version_id) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-t pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      data?.can_propose && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PencilLine, { className: "h-4 w-4 mr-2" }),
        "Điều chỉnh phân bổ tháng"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setHistory(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 mr-2" }),
        "Lịch sử phân bổ"
      ] })
    ] }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: query.error.message }),
    data?.needs_review && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-warning text-sm", children: "Cần rà soát lại kế hoạch phân bổ · Số liệu chính thức đã thay đổi." }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 xl:grid-cols-3 gap-3", children: data.basis.items.filter((i) => i.definition.aggregation === "sum").map((i) => {
      const partialMonths = (i.coverage ?? []).map((c, m) => c && c.status === "partial" ? m + 1 : null).filter(Boolean);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "border rounded-lg p-3 space-y-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm", children: i.definition.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "text-xs space-y-2", children: [
          [["Mục tiêu năm đã duyệt", i.annual], ["Thực tế chính thức đã chốt", i.actual], ["Phần còn phải đạt", i.remaining], ["Phân bổ đã điều chỉnh · tương lai", i.current.slice(data.basis.first_month - 1).reduce((s, v) => s + BigInt(v ?? "0"), 0n).toString()]].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium break-all", children: fmtGoal(value) })
          ] }, label)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Tháng tương lai" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: Math.max(0, 13 - data.basis.first_month) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Hoàn thành năm thực tế" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: i.actual !== null && i.annual !== null && BigInt(i.annual) > 0n ? `${BigInt(i.actual) * 100n / BigInt(i.annual)}%` : "—" })
          ] })
        ] }),
        !i.complete && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-warning text-xs", children: [
          "Thiếu dữ liệu chính thức của tháng đã kết thúc",
          partialMonths.length ? ` · Tháng chưa đầy đủ: ${partialMonths.join(", ")}` : "",
          "."
        ] }),
        (i.coverage ?? []).some((c) => c?.status === "partial") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-warning text-xs", children: (i.coverage ?? []).map((c, m) => c?.status === "partial" ? `Tháng ${m + 1} thiếu: ${coverageMissingText(c)}` : null).filter(Boolean).join(" · ") })
      ] }, i.metric_id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-5xl max-h-[90dvh] overflow-y-auto min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Điều chỉnh phân bổ tháng · ",
        goal.year
      ] }) }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsx(RollingEditor, { goal, data, onSaved: () => setOpen(false) }, `${data.basis.current_plan_id}-${data.proposals[0]?.revision}`)
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: history, onOpenChange: setHistory, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-4xl max-h-[90dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Lịch sử phân bổ · ",
        goal.year
      ] }) }),
      !data?.proposals.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa có hồ sơ điều chỉnh phân bổ." }),
      data?.proposals.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-b py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium", children: [
          "Bản ",
          p.version,
          " · ",
          STATUS_LABELS[p.status],
          " · Từ tháng ",
          p.first_month
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Lý do: ",
            p.reason
          ] }),
          p.review_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Nhận xét: ",
            p.review_comment
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: p.approved_at ? `Duyệt ${new Date(p.approved_at).toLocaleString("vi-VN")}` : p.submitted_at ? `Gửi ${new Date(p.submitted_at).toLocaleString("vi-VN")}` : "Bản nháp" }),
          p.items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              i.definition.name,
              " · Cam kết năm ",
              fmtGoal(i.annual)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs", children: i.months.map((v, m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Tháng ",
              m + 1,
              ": ",
              fmtGoal(p.basis.items.find((b) => b.metric_id === i.metric_id)?.current[m] ?? null),
              " → ",
              fmtGoal(v)
            ] }, m)) })
          ] }, i.metric_id))
        ] })
      ] }, p.id))
    ] }) })
  ] });
}
function RollingEditor({ goal, data, onSaved }) {
  const existing = data.proposals.find((p) => p.status !== "approved");
  const pending = existing?.status === "pending";
  const stale = isStaleDraft(existing, data.basis);
  const [rebased, setRebased] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState(existing?.reason ?? "");
  const [items, setItems] = reactExports.useState(() => existing?.items ?? data.basis.items.map((i) => ({ metric_id: i.metric_id, definition: i.definition, annual: i.annual, months: proposeMonths(i, data.basis.first_month, "weighted") })));
  const action = useRollingSave();
  const error = rollingError(items, data.basis);
  const blocked = pending || stale && !rebased;
  const rebase = () => {
    if (!existing) return;
    setItems((old) => old.map((item) => {
      const metric = data.basis.items.find((i) => i.metric_id === item.metric_id);
      return metric ? { ...item, months: rebaseMonths(metric, item.months, data.basis.first_month) } : item;
    }));
    setRebased(true);
    toast.success("Đã cập nhật lại đề xuất theo các tháng còn hợp lệ. Kiểm tra lại tổng phân bổ trước khi gửi.");
  };
  const save = async (submit) => {
    if (submit && stale && !window.confirm("Bản nháp này được tạo từ tháng trước. Xác nhận đã kiểm tra lại tổng phân bổ theo tháng hiện tại?")) return;
    try {
      await action.mutateAsync({ goal: goal.id, items, reason, revision: existing?.revision, submit });
      toast.success(submit ? "Đã gửi duyệt phân bổ. Cam kết năm giữ nguyên." : "Đã lưu nháp phân bổ.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Cam kết năm giữ nguyên · Tháng 1–",
      Math.min(12, data.basis.first_month - 1),
      " chỉ đọc."
    ] }),
    pending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-warning text-sm", children: "Hồ sơ đang chờ duyệt · Phân bổ hiện hành vẫn có hiệu lực." }),
    stale && !rebased && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "border border-warning/40 bg-warning/10 rounded-md p-3 space-y-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-warning font-medium", children: [
        "Bản nháp tạo từ tháng ",
        existing?.first_month,
        " — tháng áp dụng đã thay đổi (hiện từ tháng ",
        data.basis.first_month,
        "). Bản cũ vẫn được giữ trong lịch sử."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: rebase, children: "Cập nhật lại đề xuất theo tháng hiện tại" })
    ] }),
    items.map((item, index) => {
      const metric = data.basis.items.find((i) => i.metric_id === item.metric_id);
      if (!metric) return null;
      const future = item.months.slice(data.basis.first_month - 1).reduce((s, v) => s + BigInt(v ?? "0"), 0n);
      const projection = metric.actual === null ? null : (BigInt(metric.actual) + future).toString();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t pt-4 space-y-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
          item.definition.name,
          " · ",
          item.definition.unit
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs", children: [["Cam kết năm", item.annual], ["Còn phải đạt", metric.remaining], ["Tổng kế hoạch tương lai", future.toString()], ["Dự kiến cả năm", projection], ["Chênh lệch dự kiến", projection !== null && item.annual !== null ? (BigInt(projection) - BigInt(item.annual)).toString() : null]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: fmtGoal(v) })
        ] }, l)) }),
        projection !== null && item.annual !== null && BigInt(projection) > BigInt(item.annual) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-success text-xs", children: "Mức phấn đấu bổ sung · Không thay đổi mục tiêu năm." }),
        item.definition.aggregation === "sum" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          ["equal", "weighted"].map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: pending || metric.remaining === null, onClick: () => setItems((old) => old.map((i, n) => n === index ? { ...i, months: proposeMonths(metric, data.basis.first_month, mode) } : i)), children: mode === "equal" ? "Chia đều" : "Theo tỷ trọng" }, mode)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground self-center", children: "Tự nhập" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "KR bình quân/tỷ lệ giữ phân bổ hiện hành." }),
        [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: q === Math.floor((data.basis.first_month - 1) / 3), className: "border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer font-medium text-sm py-2", children: [
            "Quý ",
            q + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [0, 1, 2].map((o) => {
            const m = q * 3 + o;
            const locked = m < data.basis.first_month - 1 || blocked || item.definition.aggregation !== "sum";
            const value = item.months[m] ?? null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-2 items-center text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "Tháng ",
                m + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Cam kết: ",
                fmtGoal(metric.months[m] ?? null)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Thực tế: ",
                fmtGoal(metric.actuals[m] ?? null)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Hiện hành: ",
                fmtGoal(metric.current[m] ?? null)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                locked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "Đã khóa · ",
                  fmtGoal(value)
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `${item.definition.name} phân bổ tháng ${m + 1}`, inputMode: "numeric", value: value ?? "", onChange: (e) => {
                  const v = e.target.value;
                  if (v !== "" && !/^\d{1,20}$/.test(v)) return;
                  setItems((old) => old.map((i, n) => n === index ? { ...i, months: i.months.map((x, k) => k === m ? v || null : x) } : i));
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-muted-foreground", children: [
                  "Chênh lệch: ",
                  value !== null && metric.current[m] !== null ? fmtGoal((BigInt(value) - BigInt(metric.current[m] ?? "0")).toString()) : "—"
                ] })
              ] })
            ] }, m);
          }) })
        ] }, q))
      ] }, item.metric_id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rolling-reason", children: "Lý do điều chỉnh" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "rolling-reason", value: reason, disabled: pending, onChange: (e) => setReason(e.target.value) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-warning text-sm", children: error }),
    !blocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: !reason.trim() || action.isPending, onClick: () => save(false), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
        "Lưu nháp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !!error || !reason.trim() || action.isPending, onClick: () => save(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
        "Gửi duyệt điều chỉnh phân bổ"
      ] })
    ] })
  ] });
}
const dateText = (v) => new Date(v).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
const STATE_BADGE = { none: "outline", draft: "outline", pending: "secondary", changes: "secondary", approved: "default", adjusting: "secondary" };
function BizGoals() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const me = useAuth((s) => s.users.find((u) => u.id === s.currentUserId));
  const { can } = useCurrentUser();
  const [year, setYear] = reactExports.useState(() => Number(new Intl.DateTimeFormat("en", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric" }).format(/* @__PURE__ */ new Date())));
  const goals = useQuery({ ...bizGoalsQuery(uid, year), enabled: !!uid });
  const members = useQuery(bizMembersQuery);
  const departments = useQuery(bizDepartmentsQuery);
  const deadline = useQuery({ ...bizGoalDeadlineQuery(uid, year), enabled: !!uid });
  const action = useGoalAction();
  const own = goals.data?.find((g) => g.user_id === uid);
  const membership = members.data?.find((m) => m.user_id === uid && !m.ended_at);
  const dept = departments.data?.find((d) => d.id === membership?.department_id);
  const canManage = can("biz.view_dept") || can("biz.view_all") || can("biz.goal_approve");
  const start = async () => {
    try {
      await action.mutateAsync({ kind: "start", year });
      toast.success("Đã tạo bản nháp mục tiêu năm.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-32 sm:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "goal-year", children: "Năm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "goal-year", type: "number", min: 2e3, max: 2200, className: "w-28", value: year, onChange: (e) => {
          const y = Number(e.target.value);
          if (y >= 2e3 && y <= 2200) setYear(y);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Làm mới mục tiêu", onClick: () => goals.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Hạn gửi: ",
        deadline.data ? `${dateText(deadline.data)} (giờ Việt Nam)` : "Chưa quy định"
      ] })
    ] }),
    goals.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải mục tiêu…" }),
    goals.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-destructive", children: [
      "Không tải được mục tiêu: ",
      goals.error.message
    ] }),
    !goals.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Mục tiêu KR của tôi" }),
      own ? /* @__PURE__ */ jsxRuntimeExports.jsx(MyGoalCard, { goal: own, uid }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-9 w-9 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold", children: [
          me?.fullName,
          " · Mục tiêu ",
          year
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: dept ? dept.name : "Chưa được phân vào phòng kinh doanh đang hoạt động." }),
        can("biz.goal_submit") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: start, disabled: !dept?.active || action.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 mr-2" }),
          "Lập mục tiêu năm"
        ] })
      ] })
    ] }),
    canManage && !goals.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(ManageSection, { goals: goals.data ?? [], year, uid, memberCount: new Set((members.data ?? []).filter((m) => !m.ended_at).map((m) => m.user_id)).size })
  ] });
}
function MyGoalCard({ goal, uid }) {
  const { can } = useCurrentUser();
  const action = useGoalAction();
  const [detail, setDetail] = reactExports.useState(false);
  const [history, setHistory] = reactExports.useState(false);
  const [adjust, setAdjust] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [draftsOpen, setDraftsOpen] = reactExports.useState(false);
  const state = goalState(goal);
  const shown = displayVersion(goal);
  const editable = goal.user_id === uid && can("biz.goal_submit") ? goal.versions.find((v) => ["draft", "changes"].includes(v.status)) : void 0;
  const drafts = goal.versions.filter((v) => v.id !== goal.official_version_id && ["draft", "changes"].includes(v.status));
  const allApproved = goal.versions.length > 0 && goal.versions.every((v) => v.status === "approved");
  const remove = async () => {
    if (!deleting) return;
    try {
      await action.mutateAsync({ kind: "delete", id: deleting.id });
      toast.success("Đã xóa bản nháp.");
      setDeleting(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 p-4 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
            "Mục tiêu KR năm ",
            goal.year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            goal.department_name,
            " · Cập nhật ",
            dateText(shown.updated_at)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: STATE_BADGE[state], children: STATE_LABELS[state] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GoalSummaryTable, { version: shown }),
      shown.review_comment && state === "changes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "px-4 py-3 text-sm border-t border-l-2 border-l-destructive break-words", children: [
        "Nhận xét của người duyệt: ",
        shown.review_comment
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 p-4 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setDetail(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
          "Xem chi tiết 12 tháng"
        ] }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(editable.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PencilLine, { className: "h-4 w-4 mr-2" }),
          editable.status === "changes" ? "Chỉnh sửa và nộp lại" : "Tiếp tục chỉnh sửa"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setHistory(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 mr-2" }),
          "Xem lịch sử"
        ] }),
        goal.user_id === uid && can("biz.goal_submit") && allApproved && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setAdjust(true), children: "Yêu cầu điều chỉnh" })
      ] })
    ] }),
    drafts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex w-full items-center justify-between gap-2 p-4 text-left", onClick: () => setDraftsOpen((o) => !o), "aria-expanded": draftsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-sm", children: [
          "Bản nháp (",
          drafts.length,
          ")"
        ] }),
        draftsOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
      ] }),
      draftsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t divide-y", children: drafts.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            "Bản ",
            v.version,
            " · ",
            v.reason ? "Điều chỉnh" : "Lập mới"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            STATUS_LABELS[v.status],
            " · Cập nhật ",
            dateText(v.updated_at)
          ] }),
          v.review_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs break-words mt-1", children: [
            "Nhận xét: ",
            v.review_comment
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          goal.user_id === uid && can("biz.goal_submit") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(v.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PencilLine, { className: "h-4 w-4 mr-2" }),
            "Tiếp tục chỉnh sửa"
          ] }),
          draftDeletable(v) && (goal.user_id === uid || can("biz.view_all")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: () => setDeleting(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
            "Xóa bản nháp"
          ] })
        ] })
      ] }, v.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: detail, onOpenChange: setDetail, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Chi tiết mục tiêu ",
        goal.year,
        " · ",
        STATUS_LABELS[shown.status]
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GoalDetailView, { version: shown })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (open) => !open && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-5xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Chỉnh sửa mục tiêu ",
        goal.year
      ] }) }),
      editing && (() => {
        const v = goal.versions.find((x) => x.id === editing);
        return v ? /* @__PURE__ */ jsxRuntimeExports.jsx(GoalEditor, { version: v, canEdit: true, canReview: false }, `${v.id}-${v.revision}`) : null;
      })()
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adjust, onOpenChange: setAdjust, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Điều chỉnh mục tiêu năm" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "adjust-reason", children: "Lý do điều chỉnh" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "adjust-reason", value: reason, onChange: (e) => setReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !reason.trim() || action.isPending, onClick: async () => {
        try {
          await action.mutateAsync({ kind: "start", year: goal.year, reason });
          setAdjust(false);
          toast.success("Đã tạo bản điều chỉnh. Bản chính thức vẫn được giữ nguyên.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : String(e));
        }
      }, children: "Tạo bản điều chỉnh" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleting, onOpenChange: (open) => !open && setDeleting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Xóa bản nháp mục tiêu ",
        goal.year
      ] }) }),
      deleting && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Bạn sắp xóa ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "bản nháp ",
            deleting.version,
            " (",
            deleting.reason ? "điều chỉnh" : "lập mới",
            ")"
          ] }),
          " của năm ",
          goal.year,
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
          "Nội dung chưa gửi duyệt sẽ bị mất và không khôi phục được.",
          goal.official_version_id ? " Mục tiêu chính thức hiện hành được giữ nguyên." : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Giữ lại" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: action.isPending, onClick: remove, children: "Xác nhận xóa" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BizRollingPlan, { goal, uid }),
    history && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalHistory, { goal, uid, onClose: () => setHistory(false), onVersion: () => setHistory(false) })
  ] });
}
function GoalSummaryTable({ version }) {
  if (!version.items.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-muted-foreground", children: "Chưa có chỉ số KR." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium", children: "KR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium text-right", children: "Mục tiêu năm" }),
        [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "p-3 font-medium text-right", children: [
          "Quý ",
          q + 1
        ] }, q))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: version.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: item.definition.name }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "(",
            item.definition.unit,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right tabular-nums font-medium text-primary", children: fmtGoal(item.annual) }),
        [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right tabular-nums", children: fmtQuarter(item, q) }, q))
      ] }, item.metric_id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden divide-y", children: version.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-sm", children: [
          item.definition.name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "(",
            item.definition.unit,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-primary tabular-nums", children: [
          "Năm: ",
          fmtGoal(item.annual)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 rounded-md bg-accent/40 px-2 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Quý ",
          q + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums font-medium", children: fmtQuarter(item, q) })
      ] }, q)) })
    ] }, item.metric_id)) })
  ] });
}
function GoalDetailView({ version }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: version.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border rounded-lg bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: item.definition.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          item.definition.unit,
          " · ",
          item.definition.aggregation === "sum" ? "Cộng dồn" : "Bình quân"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-primary tabular-nums", children: [
        "Năm: ",
        fmtGoal(item.annual)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:grid sm:grid-cols-2 xl:grid-cols-4", children: [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b sm:border-r", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 text-sm mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          "Quý ",
          q + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary tabular-nums", children: fmtQuarter(item, q) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 text-sm", children: [0, 1, 2].map((o) => {
        const m = q * 3 + o;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "Tháng ",
            m + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: fmtGoal(item.months[m] ?? null) })
        ] }, m);
      }) })
    ] }, q)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:hidden divide-y", children: [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex items-center justify-between gap-2 p-3 text-sm cursor-pointer list-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "Quý ",
            q + 1
          ] }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary tabular-nums", children: fmtQuarter(item, q) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 transition-transform group-open:rotate-180" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-3 space-y-1 text-sm", children: [0, 1, 2].map((o) => {
        const m = q * 3 + o;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "Tháng ",
            m + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: fmtGoal(item.months[m] ?? null) })
        ] }, m);
      }) })
    ] }, q)) })
  ] }, item.metric_id)) });
}
function ManageSection({ goals, year, uid, memberCount }) {
  const [search, setSearch] = reactExports.useState("");
  const [deptFilter, setDeptFilter] = reactExports.useState("all");
  const [stateFilter, setStateFilter] = reactExports.useState("all");
  const [viewing, setViewing] = reactExports.useState(null);
  const [historyGoal, setHistoryGoal] = reactExports.useState(null);
  const stats = reactExports.useMemo(() => {
    const states = goals.map(goalState);
    return { total: memberCount || goals.length, done: goals.length, missing: Math.max(0, (memberCount || goals.length) - goals.length), pending: states.filter((s) => s === "pending").length, approved: states.filter((s) => s === "approved").length, changes: states.filter((s) => s === "changes" || s === "adjusting").length };
  }, [goals, memberCount]);
  const deptNames = reactExports.useMemo(() => [...new Set(goals.map((g) => g.department_name))].sort(), [goals]);
  const filtered = goals.filter((g) => (stateFilter === "all" || goalState(g) === stateFilter) && (deptFilter === "all" || g.department_name === deptFilter) && (!search.trim() || g.employee_name.toLowerCase().includes(search.trim().toLowerCase())));
  const cards = [{ key: "all", label: "Tổng nhân sự cần lập", value: stats.total }, { key: "all", label: "Đã lập", value: stats.done }, { key: "missing", label: "Chưa lập", value: stats.missing }, { key: "pending", label: "Chờ duyệt", value: stats.pending }, { key: "approved", label: "Đã duyệt hoàn tất", value: stats.approved }, { key: "changes", label: "Cần chỉnh sửa", value: stats.changes }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 border-t pt-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Mục tiêu KR trong phạm vi quản lý" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2", children: cards.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setStateFilter(c.key === "all" || c.key === "missing" ? "all" : c.key), className: `rounded-xl border bg-card p-3 text-left transition-colors ${stateFilter !== "all" && c.key === stateFilter ? "ring-2 ring-primary" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold tabular-nums", children: c.value })
    ] }, `${c.label}-${i}`)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm theo tên nhân viên…", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full sm:w-64" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: deptFilter, onValueChange: setDeptFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Tất cả phòng ban" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả phòng ban" }),
          deptNames.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stateFilter, onValueChange: (v) => setStateFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mọi trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái" }),
          ["draft", "pending", "changes", "approved", "adjusting"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: STATE_LABELS[s] }, s))
        ] })
      ] })
    ] }),
    !filtered.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có mục tiêu phù hợp bộ lọc." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium", children: "Nhân viên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium", children: "Phòng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium", children: "Năm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 font-medium text-right", children: "Thao tác" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((g) => {
        const s = goalState(g);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: g.employee_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: g.department_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 tabular-nums", children: g.year }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: STATE_BADGE[s], children: STATE_LABELS[s] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setViewing(g), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-1" }),
              "Xem"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setHistoryGoal(g), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 mr-1" }),
              "Lịch sử"
            ] }),
            s === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/biz/approvals", children: "Duyệt" }) })
          ] }) })
        ] }, g.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: filtered.map((g) => {
      const s = goalState(g);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm truncate", children: g.employee_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              g.department_name,
              " · ",
              g.year
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: STATE_BADGE[s], children: STATE_LABELS[s] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setViewing(g), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-1" }),
            "Xem"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setHistoryGoal(g), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 mr-1" }),
            "Lịch sử"
          ] }),
          s === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/biz/approvals", children: "Duyệt" }) })
        ] })
      ] }, g.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (open) => !open && setViewing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-4xl max-h-[85vh] overflow-y-auto", children: viewing && (() => {
      const v = displayVersion(viewing);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          viewing.employee_name,
          " · Mục tiêu ",
          viewing.year,
          " · ",
          STATE_LABELS[goalState(viewing)]
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoalSummaryTable, { version: v }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoalDetailView, { version: v }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BizRollingPlan, { goal: viewing, uid })
        ] })
      ] });
    })() }) }),
    historyGoal && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalHistory, { goal: historyGoal, uid, onClose: () => setHistoryGoal(null), onVersion: () => setHistoryGoal(null) })
  ] });
}
function NumberField({ value, onChange, disabled, label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": label, inputMode: "numeric", value: value === null ? "" : fmtGoal(value), disabled, onChange: (e) => {
    const raw = e.target.value.replace(/[.,\s]/g, "");
    if (!raw) onChange(null);
    else if (validValue(raw)) onChange(BigInt(raw).toString());
  }, className: "text-right tabular-nums min-w-0" });
}
function GoalEditor({ version, canEdit, canReview }) {
  const [items, setItems] = reactExports.useState(() => structuredClone(version.items));
  const [quarter, setQuarter] = reactExports.useState("0");
  const [comment, setComment] = reactExports.useState("");
  const action = useGoalAction();
  const valid = items.length > 0 && items.every(allocationMatches);
  const dirty = JSON.stringify(items) !== JSON.stringify(version.items);
  const update = (index, month, value) => setItems((current) => current.map((item, n) => n !== index ? item : month === null ? { ...item, annual: value } : { ...item, months: item.months.map((v, m) => m === month ? value : v) }));
  const save = async (submit) => {
    try {
      await action.mutateAsync({ kind: "save", id: version.id, revision: version.revision, items, submit });
      toast.success(submit ? "Đã gửi mục tiêu chờ duyệt." : "Đã lưu nháp.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: quarter, onValueChange: setQuarter, className: "sm:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "grid w-full grid-cols-4", children: [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: String(q), children: [
      "Quý ",
      q + 1
    ] }, q)) }) }),
    items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border rounded-lg bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: item.definition.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground break-words", children: item.definition.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mt-2", children: [
              item.definition.unit,
              " · ",
              item.definition.aggregation === "sum" ? "Cộng dồn" : "Bình quân"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full sm:w-56 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mục tiêu năm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { value: item.annual, label: `Mục tiêu năm ${item.definition.name}`, disabled: !canEdit, onChange: (v) => update(index, null, v) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Mục tiêu năm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: fmtGoal(item.annual) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: item.definition.aggregation === "sum" ? "Tổng đã phân bổ" : "Bình quân đã phân bổ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: allocatedText(item) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Chênh lệch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-all", children: differenceText(item) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Tỷ lệ đã phân bổ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: allocationPercent(item) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 xl:grid-cols-4", children: [0, 1, 2, 3].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 border-b sm:border-r ${q === Number(quarter) ? "" : "hidden sm:block"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2 text-sm mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "Quý ",
            q + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary tabular-nums break-all", children: fmtQuarter(item, q) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [0, 1, 2].map((offset) => {
          const month = q * 3 + offset;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
              "Tháng ",
              month + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumberField, { label: `${item.definition.name} tháng ${month + 1}`, value: item.months[month] ?? null, disabled: !canEdit, onChange: (v) => update(index, month, v) })
          ] }, month);
        }) })
      ] }, q)) }),
      !allocationMatches(item) && canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-3 text-sm text-destructive", role: "alert", children: item.annual === null || item.months.some((v) => v === null) ? "Chưa nhập đủ mục tiêu năm và 12 tháng. Có thể lưu nháp." : "Phân bổ tháng chưa khớp mục tiêu năm." })
    ] }, item.metric_id)),
    canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: action.isPending, onClick: () => save(false), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
        "Lưu nháp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !valid || action.isPending, onClick: () => save(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
        "Gửi duyệt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", disabled: !dirty || action.isPending, onClick: () => setItems(structuredClone(version.items)), children: "Hủy chỉnh sửa chưa lưu" }),
      dirty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Có thay đổi chưa lưu" })
    ] }),
    canReview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "goal-review", children: "Nhận xét" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "goal-review", value: comment, onChange: (e) => setComment(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [true, false].map((approve) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: approve ? "default" : "outline", disabled: action.isPending || !approve && !comment.trim(), onClick: async () => {
        try {
          await action.mutateAsync({ kind: "decide", id: version.id, revision: version.revision, approve, comment });
          toast.success(approve ? "Đã duyệt mục tiêu." : "Đã yêu cầu chỉnh sửa.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : String(e));
        }
      }, children: [
        approve && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-2" }),
        approve ? "Duyệt mục tiêu" : "Yêu cầu chỉnh sửa"
      ] }, String(approve))) })
    ] })
  ] });
}
function GoalHistory({ goal, uid, onClose }) {
  const events = useQuery(bizGoalEventsQuery(uid, goal.id));
  const users = useAuth((s) => s.users);
  const [snapshotId, setSnapshotId] = reactExports.useState("");
  const labels = { created: "Tạo phiên bản", saved: "Lưu nháp", submitted: "Gửi duyệt", approved: "Duyệt", returned: "Yêu cầu chỉnh sửa" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (open) => !open && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Lịch sử mục tiêu ",
      goal.year
    ] }) }),
    events.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải…" }),
    events.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", children: "Không tải được lịch sử." }),
    events.data?.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b pb-3 text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
        labels[e.action] ?? e.action,
        " · ",
        users.find((u) => u.id === e.actor_id)?.fullName ?? "Nhân viên"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: dateText(e.created_at) }),
      e.comment && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words", children: e.comment }),
      Array.isArray(e.payload) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "link", size: "sm", onClick: () => setSnapshotId(snapshotId === e.id ? "" : e.id), children: [
        "Dữ liệu tại lần ",
        e.action === "submitted" ? "gửi" : "lưu",
        " này"
      ] }),
      snapshotId === e.id && Array.isArray(e.payload) && e.payload.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          goal.versions.find((v) => v.id === e.version_id)?.items.find((i) => i.metric_id === item.metric_id)?.definition.name,
          " · Năm: ",
          fmtGoal(item.annual)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs", children: item.months.map((value, m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "break-all", children: [
          "Tháng ",
          m + 1,
          ": ",
          fmtGoal(value)
        ] }, m)) })
      ] }, item.metric_id))
    ] }, e.id))
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["biz.view_own", "biz.goal_submit", "biz.goal_approve", "biz.view_dept", "biz.view_all"], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Mục tiêu KR", description: "Lập mục tiêu năm, tự phân bổ xuống từng tháng, gửi lãnh đạo duyệt." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(BizGoals, {})
] }) });
export {
  SplitComponent as component
};
