import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { P as PageHeader, u as useCurrentUser, B as Button, F as useAuth, bw as orgQuery, bx as workflowsQuery, l as Badge, L as Label, I as Input, bs as useOrganizationAction, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, N as Checkbox } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { a as useQuery, u as useQueryClient, q as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { B as BizDeadlineEditor } from "./BizDeadlineEditor-Blkry_Ru.mjs";
import { W as WORKFLOW_KINDS, o as orgDate, d as defaultApprovalSteps, P as POSITIONS } from "./organization-DeUjSaZf.mjs";
import { e as bizDepartmentsQuery, i as bizKrMetricsQuery, j as useBizKrStandardSave, k as useBizKrSave } from "./queries-D_iIARlF.mjs";
import { V as VALUE_KIND_LABELS, A as AGGREGATION_LABELS, D as DIRECTION_LABELS } from "./deadline-D2Kxczjd.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import "../_libs/seroval.mjs";
import { b3 as Network, T as Target, a_ as Timer, bt as GitBranch, a6 as Plus, ao as Pencil, b4 as ShieldAlert, ap as Trash2, S as Sparkles, bu as UserCheck, j as ArrowUp, k as ArrowDown } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./documents-RNnMLtSC.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
function BizAccessExceptions() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const users = useAuth((s) => s.users);
  const roles = useAuth((s) => s.roles);
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["biz_access_exceptions", uid], queryFn: async () => {
    const { data, error } = await supabase.from("biz_access_exceptions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  const org = useQuery(orgQuery(uid));
  const [target, setTarget] = reactExports.useState("");
  const [scope, setScope] = reactExports.useState("all");
  const [unit, setUnit] = reactExports.useState("");
  const [permission, setPermission] = reactExports.useState("biz.view_all");
  const [reason, setReason] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(data) {
    setBusy(true);
    try {
      const result = await supabase.rpc("biz_exception_save", { _data: data });
      if (result.error) throw result.error;
      await useAuth.getState().refreshBizAccess(true);
      await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") });
      toast.success("Đã cập nhật ngoại lệ và nhật ký.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  const units = scope === "system" ? org.data?.systems : scope === "department" ? org.data?.departments : org.data?.teams;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Quyền ngoại lệ Kinh doanh" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhân sự hoặc Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: target || "none", onValueChange: setTarget, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Người nhận ngoại lệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn người nhận" }),
            users.filter((u) => u.status === "Đang hoạt động").map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: `user:${u.id}`, children: u.fullName }, u.id)),
            roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `role:${r.id}`, children: [
              "Role: ",
              r.name
            ] }, r.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phạm vi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: scope, onValueChange: (v) => {
          setScope(v);
          setUnit("");
          setPermission(v === "all" ? "biz.view_all" : "biz.view_dept");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Phạm vi ngoại lệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Toàn Khối" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "system", children: "Hệ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "department", children: "Phòng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "team", children: "Nhóm" })
          ] })
        ] })
      ] }),
      scope !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: unit || "none", onValueChange: setUnit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Đơn vị ngoại lệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn đơn vị" }),
          units?.filter((u) => u.active).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.name }, u.id))
        ] })
      ] }),
      scope === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: permission, onValueChange: setPermission, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Quyền ngoại lệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [["biz.view_all", "Xem chi tiết toàn Khối"], ["biz.org_manage", "Quản lý cơ cấu và chức vụ"], ["biz.kr_manage", "Quản lý chỉ số KR"], ["biz.deadline_manage", "Cài đặt deadline"], ["biz.workflow_manage", "Cấu hình quy trình"]].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: l }, v)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Lý do cấp ngoại lệ", placeholder: "Lý do cấp ngoại lệ", value: reason, onChange: (e) => setReason(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !target || target === "none" || !reason.trim() || scope !== "all" && (!unit || unit === "none"), onClick: () => {
      const [type, id] = target.split(":");
      void save({ [type === "user" ? "user_id" : "role_id"]: id, permission, scope_kind: scope, [scope + "_id"]: scope === "all" ? null : unit, reason });
    }, children: "Cấp ngoại lệ" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: query.error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: query.data?.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
        users.find((u) => u.id === e.user_id)?.fullName ?? roles.find((r) => r.id === e.role_id)?.name,
        " · ",
        e.permission
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        e.scope_kind,
        " · ",
        e.reason,
        " · Cấp bởi ",
        users.find((u) => u.id === e.granted_by)?.fullName ?? "Quản trị viên"
      ] }),
      e.revoked_at ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Đã thu hồi" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => {
        const why = window.prompt("Lý do thu hồi ngoại lệ:");
        if (why?.trim()) void save({ id: e.id, reason: why });
      }, children: "Thu hồi" })
    ] }, e.id)) })
  ] });
}
const positionsQuery = (uid) => queryOptions({ queryKey: ["biz_positions", uid], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_positions_read");
  if (error) throw error;
  return data;
} });
async function previewWorkflow(data) {
  const result = await supabase.rpc("biz_workflow_preview", { _data: data });
  if (result.error) throw result.error;
  return result.data;
}
function BizWorkflows() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const org = useQuery(orgQuery(uid));
  const query = useQuery(workflowsQuery(uid));
  const [edit, setEdit] = reactExports.useState(null);
  const rows = query.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-5 w-5 text-primary" }),
        "Quy trình phê duyệt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !org.data, onClick: () => setEdit("new"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Thêm quy trình"
      ] })
    ] }),
    org.data && /* @__PURE__ */ jsxRuntimeExports.jsx(TemplateSection, { org: org.data, onChanged: () => query.refetch() }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: query.error.message }),
    !rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground py-8 border-y", children: "Chưa cấu hình quy trình. Hồ sơ hiện có giữ cơ chế cũ." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: rows.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
            w.name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: w.active ? "default" : "secondary", children: w.active ? "Hoạt động" : "Ngừng / phiên bản cũ" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            org.data?.systems.find((s) => s.id === w.system_id)?.name,
            " · ",
            WORKFLOW_KINDS[w.kind],
            " · Phiên bản ",
            w.version
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEdit(w), children: "Cấu hình" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm break-words", children: w.steps.map((s) => s.label).join(" → ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Hiệu lực: ",
        orgDate(w.effective_from)
      ] })
    ] }, w.id)) }),
    edit && org.data && /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowDialog, { value: edit, org: org.data, onClose: () => setEdit(null) }, edit === "new" ? "new" : edit.id)
  ] });
}
function WorkflowDialog({ value, org, onClose }) {
  const w = value === "new" ? null : value;
  const [name, setName] = reactExports.useState(w?.name ?? "");
  const [system, setSystem] = reactExports.useState(w?.system_id ?? "");
  const [department, setDepartment] = reactExports.useState(w?.department_id ?? "");
  const [kind, setKind] = reactExports.useState(w?.kind ?? "goal_year");
  const [active, setActive] = reactExports.useState(w?.active ?? false);
  const [date, setDate] = reactExports.useState(new Date(Date.parse(w?.effective_from ?? (/* @__PURE__ */ new Date()).toISOString()) + 7 * 36e5).toISOString().slice(0, 16));
  const [steps, setSteps] = reactExports.useState(w?.steps ?? defaultApprovalSteps());
  const [special, setSpecial] = reactExports.useState(w?.director_steps ?? []);
  const mutation = useOrganizationAction();
  const users = useAuth((s) => s.users).filter((u) => u.status === "Đang hoạt động");
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const catalog = useQuery(positionsQuery(uid));
  const [preview, setPreview] = reactExports.useState(null);
  const [previewing, setPreviewing] = reactExports.useState(false);
  const editor = (items, setItems) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    items.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "shrink-0 whitespace-nowrap", children: [
          "Cấp ",
          i + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Tên cấp ${i + 1}`, value: s.label, onChange: (e) => setItems(items.map((x, n) => n === i ? { ...x, label: e.target.value } : x)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Xóa cấp ${i + 1}`, onClick: () => setItems(items.filter((_, n) => n !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: s.type === "position" ? `position:${s.position_id}` : s.type, onValueChange: (v) => {
          setPreview(null);
          setItems(items.map((x, n) => n === i ? v.startsWith("position:") ? { ...x, type: "position", position_id: v.slice(9), user_id: null } : { ...x, type: v, position_id: null, user_id: null } : x));
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": `Chức danh cấp ${i + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            catalog.data?.positions.filter((p) => p.active && p.unit_kind !== "individual").map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `position:${p.id}`, children: [
              p.name,
              " · Cấp ",
              p.level
            ] }, p.id)),
            Object.entries(POSITIONS).filter(([id]) => id === "user" || items.some((x) => x.type === id)).map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: id, children: [
              label,
              id === "user" ? "" : " (cấu hình cũ)"
            ] }, id))
          ] })
        ] }),
        s.type === "user" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: s.user_id || "none", onValueChange: (v) => setItems(items.map((x, n) => n === i ? { ...x, user_id: v === "none" ? null : v } : x)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": `Người duyệt cấp ${i + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn người duyệt" }),
            users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.fullName }, u.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: s.substitute_id || "none", onValueChange: (v) => setItems(items.map((x, n) => n === i ? { ...x, substitute_id: v === "none" ? null : v } : x)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": `Người thay thế cấp ${i + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Không có người thay thế" }),
            users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.fullName }, u.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Hạn xử lý cấp ${i + 1} (giờ)`, type: "number", min: "0.1", step: "0.5", placeholder: "Hạn xử lý (giờ) · Không bắt buộc", value: s.sla_hours ?? "", onChange: (e) => setItems(items.map((x, n) => n === i ? { ...x, sla_hours: e.target.value ? Number(e.target.value) : null } : x)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", disabled: i === 0, "aria-label": `Đưa cấp ${i + 1} lên`, onClick: () => {
          const next = [...items];
          [next[i - 1], next[i]] = [next[i], next[i - 1]];
          setItems(next);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", disabled: i === items.length - 1, "aria-label": `Đưa cấp ${i + 1} xuống`, onClick: () => {
          const next = [...items];
          [next[i + 1], next[i]] = [next[i], next[i + 1]];
          setItems(next);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) })
      ] }),
      s.type === "user" && !s.user_id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Thiếu người duyệt cụ thể." }),
      s.type === "position" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 items-center text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: s.skip_if_submitter === true, onCheckedChange: (v) => setItems(items.map((x, n) => n === i ? { ...x, skip_if_submitter: v === true } : x)) }),
        "Người nộp giữ chức vụ này: chuyển lên cấp tiếp theo"
      ] }),
      s.type !== "user" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-warning", children: [
        "Cấp ",
        s.type === "position" ? catalog.data?.positions.find((p) => p.id === s.position_id)?.name : POSITIONS[s.type],
        " cần người phụ trách có quyền tại đơn vị người nộp; thiếu người sẽ chặn nộp."
      ] })
    ] }, i)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setItems([...items, { label: `Cấp ${items.length + 1}`, type: "user" }]), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
      "Thêm cấp"
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-3xl max-h-[90dvh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      w ? "Điều chỉnh" : "Thêm",
      " quy trình phê duyệt"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên quy trình" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên quy trình", value: name, onChange: (e) => setName(e.target.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: system || "none", onValueChange: (v) => {
        setSystem(v === "none" ? "" : v);
        setDepartment("");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Hệ áp dụng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn Hệ" }),
          org.systems.filter((s) => s.active).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.name }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: department || "all", onValueChange: (v) => setDepartment(v === "all" ? "" : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Phòng áp dụng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Toàn Hệ" }),
          org.departments.filter((d) => d.system_id === system && d.active).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d.id, children: d.name }, d.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: (v) => setKind(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Loại hồ sơ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(WORKFLOW_KINDS).map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: label }, id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày hiệu lực (giờ Việt Nam)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", "aria-label": "Ngày hiệu lực", value: date, onChange: (e) => setDate(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Các cấp duyệt" }),
    editor(steps, setSteps),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-primary break-words", children: [
      steps.map((s) => s.label).join(" → "),
      " → Hoàn tất"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Trưởng Nhóm bắt đầu từ Trưởng Phòng; Trưởng Phòng từ Giám Đốc. Phiên bản gửi lại chạy từ đầu." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "font-medium cursor-pointer", children: "Nhánh riêng khi Giám Đốc nộp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3", children: editor(special, setSpecial) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: !system || previewing, onClick: async () => {
      setPreviewing(true);
      try {
        setPreview(await previewWorkflow({ system_id: system, department_id: department || null, kind, effective_from: `${date}:00+07:00`, steps }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      } finally {
        setPreviewing(false);
      }
    }, children: "Xem trước người phụ trách" }),
    preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-y py-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Người phụ trách theo cơ cấu" }),
      !preview.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-warning", children: "Chưa có phòng được ánh xạ vào Hệ." }),
      preview.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm border-b py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          p.department,
          " · ",
          p.team,
          " · ",
          p.label
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: p.missing ? "text-warning" : "text-muted-foreground", children: [
          p.missing ? "Thiếu người có quyền duyệt" : users.find((u) => u.id === (p.user_id ?? p.substitute_id))?.fullName ?? "Nhân sự được phân công",
          p.substitute_id && p.user_id ? ` · Thay thế: ${users.find((u) => u.id === p.substitute_id)?.fullName ?? "—"}` : ""
        ] })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 items-center text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: active, onCheckedChange: (v) => setActive(v === true) }),
      "Kích hoạt từ ngày hiệu lực"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: mutation.isPending || !name.trim() || !system || !steps.length || !Number.isFinite(Date.parse(date)) || [...steps, ...special].some((s) => !s.label.trim() || s.type === "user" && !s.user_id), onClick: async () => {
      try {
        if (active) {
          const check = await previewWorkflow({ system_id: system, department_id: department || null, kind, effective_from: `${date}:00+07:00`, steps });
          setPreview(check);
          if (!check.length || check.some((p) => p.missing)) {
            if (!window.confirm("Cơ cấu hiện thiếu người duyệt ở một số cấp. Hồ sơ sẽ bị chặn nộp tại cấp thiếu. Vẫn kích hoạt quy trình?")) return;
          }
        }
        await mutation.mutateAsync({ kind: "workflow", data: { id: w?.id, name, system_id: system, department_id: department || null, kind, effective_from: `${date}:00+07:00`, active, steps, director_steps: special } });
        toast.success("Đã lưu phiên bản quy trình. Hồ sơ đang chạy giữ phiên bản cũ.");
        onClose();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      }
    }, children: "Lưu quy trình" })
  ] }) });
}
function TemplateSection({ org, onChanged }) {
  const [busy, setBusy] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [simKind, setSimKind] = reactExports.useState("goal_year");
  const [simUser, setSimUser] = reactExports.useState("");
  const [sim, setSim] = reactExports.useState(null);
  const [simming, setSimming] = reactExports.useState(false);
  const users = useAuth((s) => s.users).filter((u) => u.status === "Đang hoạt động");
  const seed = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("biz_workflow_seed_defaults");
      if (error) throw error;
      const r = data;
      setResult(r);
      toast.success(`Đã khởi tạo ${r.created.length} quy trình · ${r.created.filter((c) => c.active).length} hoạt động · ${r.incomplete.length} cần hoàn thiện · bỏ qua ${r.skipped.length} đã có.`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const simulate = async () => {
    setSimming(true);
    try {
      const { data, error } = await supabase.rpc("biz_workflow_simulate", { _kind: simKind, _user: simUser });
      if (error) throw error;
      setSim(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSimming(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border rounded-lg p-4 space-y-4 bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Quy trình mẫu Sứ Việt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "5 nhóm luồng chuẩn cho từng Hệ: KR Năm, Điều chỉnh phân bổ KR Tháng, Điều chỉnh Báo cáo, Nộp bù Báo cáo, Nộp bù Kế hoạch. Người duyệt lấy theo chức danh đã bổ nhiệm; luồng thiếu người phụ trách được tạo ở trạng thái Cần hoàn thiện (chưa kích hoạt). Luồng đã tùy chỉnh được giữ nguyên." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: busy, onClick: seed, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
        "Khởi tạo quy trình mặc định"
      ] })
    ] }),
    result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1 border-t pt-3", children: [
      !!result.created.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Đã tạo: ",
        result.created.length,
        " luồng (",
        result.created.filter((c) => c.active).length,
        " đang hoạt động)."
      ] }),
      !!result.incomplete.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-warning", children: [
        "Cần hoàn thiện (thiếu người phụ trách theo cơ cấu): ",
        result.incomplete.map((i) => `${WORKFLOW_KINDS[i.kind] ?? i.kind} · ${i.system}`).join(", "),
        "."
      ] }),
      !!result.skipped.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Giữ nguyên ",
        result.skipped.length,
        " luồng đã có."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-medium text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }),
        "Kiểm tra quy trình"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: simKind, onValueChange: (v) => {
          setSimKind(v);
          setSim(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Loại hồ sơ kiểm tra", className: "w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(WORKFLOW_KINDS).map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: label }, id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: simUser || "none", onValueChange: (v) => {
          setSimUser(v === "none" ? "" : v);
          setSim(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Nhân viên kiểm tra", className: "w-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chọn nhân viên" }),
            users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.fullName }, u.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: !simUser || simming, onClick: simulate, children: "Xem chuỗi duyệt" })
      ] }),
      sim && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm space-y-1", children: sim.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-warning", children: sim.error }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Luồng: ",
          sim.workflow,
          " · ",
          users.find((u) => u.id === simUser)?.fullName,
          " nộp"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
          [users.find((u) => u.id === simUser)?.fullName, ...(sim.steps ?? []).map((s) => s.missing ? `${s.label}: thiếu người` : `${s.label}: ${s.user_name ?? "—"}`)].join(" → "),
          " → Hoàn tất"
        ] }),
        sim.steps?.some((s) => s.missing) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-warning", children: "Có cấp thiếu người phụ trách — hồ sơ sẽ bị chặn tại cấp đó cho đến khi hoàn thiện cơ cấu." })
      ] }) })
    ] })
  ] });
}
const ROWS = [
  ["plans", "Kế hoạch (mọi kỳ, gồm bản nháp và phiên bản)"],
  ["reports", "Báo cáo (mọi kỳ, gồm số thực tế KR)"],
  ["goals", "Mục tiêu KR năm do nhân viên lập"],
  ["goal_versions", "Phiên bản mục tiêu KR"],
  ["document_versions", "Phiên bản Kế hoạch/Báo cáo"],
  ["late_requests", "Yêu cầu và quyền nộp bù"],
  ["approval_runs", "Luồng phê duyệt đang chạy/đã chạy"],
  ["approval_events", "Bước xét duyệt của các luồng trên"],
  ["document_views", "Trạng thái đã mở tài liệu"],
  ["notifications", "Thông báo gắn với hồ sơ bị reset"]
];
function errText(e) {
  if (e && typeof e === "object") {
    const o = e;
    const parts = [o.message, o.details, o.hint, o.code ? `Mã lỗi: ${o.code}` : null].filter((x) => typeof x === "string" && x.length > 0);
    if (parts.length) return parts.join(" · ");
  }
  return e instanceof Error ? e.message : "Có lỗi xảy ra. Dữ liệu được giữ nguyên, chưa có gì bị xóa.";
}
function BizReset() {
  const uid = useAuth((s) => s.currentUserId) ?? "";
  const qc = useQueryClient();
  const [confirm, setConfirm] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const preview = useQuery({ queryKey: ["biz_reset_preview", uid], enabled: !!uid, queryFn: async () => {
    const { data, error } = await supabase.rpc("biz_reset_preview");
    if (error) throw error;
    return data;
  } });
  const run = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("biz_reset_execute", { _confirm: confirm });
      if (error) throw error;
      const r = data;
      toast.success(`Đã reset ${r.counts.plans + r.counts.reports} hồ sơ Kế hoạch/Báo cáo, ${r.counts.goals} mục tiêu KR. Mã bản sao lưu: ${r.backup_id}`);
      setConfirm("");
      await qc.invalidateQueries();
      await preview.refetch();
    } catch (e) {
      toast.error(`Reset thất bại: ${errText(e)}. Toàn bộ dữ liệu được giữ nguyên.`);
    } finally {
      setBusy(false);
    }
  };
  const p = preview.data;
  const total = p ? p.plans + p.reports + p.goals : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-destructive/40 bg-card p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Reset dữ liệu nghiệp vụ Quản trị Kinh doanh" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Đưa toàn bộ Kế hoạch, Mục tiêu KR, Báo cáo, yêu cầu nộp bù và hồ sơ phê duyệt liên quan về trạng thái chưa sử dụng. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cơ cấu tổ chức, chức vụ, bổ nhiệm, phân quyền, danh mục KR, deadline và quy trình phê duyệt được giữ nguyên." }),
      " Dữ liệu cũ được sao lưu riêng tư trước khi xóa và có nhật ký thao tác."
    ] }),
    preview.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang thống kê dữ liệu…" }),
    preview.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: preview.error.message }),
    p && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm", children: ROWS.map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-b py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "tabular-nums", children: p[k] })
      ] }, k)) }),
      p.le_minh_ngoc > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-warning", children: [
        "Có ",
        p.le_minh_ngoc,
        " hồ sơ của Lê Minh Ngọc nằm trong phạm vi reset."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Bản sao lưu hiện có: ",
        p.backups,
        " · Tổng hồ sơ chính sẽ reset: ",
        total
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "biz-reset-confirm", children: [
          "Nhập ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "RESET KINH DOANH" }),
          " để xác nhận"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "biz-reset-confirm", value: confirm, onChange: (e) => setConfirm(e.target.value), placeholder: "RESET KINH DOANH", autoComplete: "off" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", disabled: busy || confirm !== "RESET KINH DOANH", onClick: run, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
          busy ? "Đang reset…" : "Reset sạch dữ liệu nghiệp vụ"
        ] })
      ] })
    ] })
  ] });
}
function BizSettings() {
  const { can, isSuperAdmin } = useCurrentUser();
  const canWorkflow = isSuperAdmin || can("biz.workflow_manage");
  const canKr = isSuperAdmin || can("biz.kr_manage");
  const canDeadline = isSuperAdmin || can("biz.deadline_manage");
  const hasTab = canWorkflow || canKr || canDeadline || isSuperAdmin;
  const firstTab = canWorkflow ? "workflow" : canKr ? "kr" : canDeadline ? "deadline" : "advanced";
  if (!hasTab) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-5 space-y-3 max-w-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-5 w-5 text-primary" }),
        "Quản lý cơ cấu đã chuyển"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cơ cấu tổ chức, chức vụ & cấp bậc, bổ nhiệm và phân quyền của toàn Base — gồm Khối Kinh doanh — nay quản lý tập trung tại một nơi duy nhất." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/organization", children: "Mở Cơ cấu tổ chức toàn Base" }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: firstTab, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
      canWorkflow && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "workflow", children: "Quy trình phê duyệt" }),
      canKr && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "kr", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 mr-1.5" }),
        "Chỉ số KR"
      ] }),
      canDeadline && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "deadline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-4 w-4 mr-1.5" }),
        "Deadline"
      ] }),
      isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "advanced", children: "Quản trị nâng cao" })
    ] }),
    canWorkflow && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "workflow", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BizWorkflows, {}) }),
    canKr && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "kr", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KrTab, { canEdit: canKr }) }),
    canDeadline && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "deadline", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BizDeadlineEditor, {}) }),
    isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "advanced", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BizReset, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-semibold text-sm", children: "Quyền ngoại lệ Kinh doanh (có kiểm toán)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BizAccessExceptions, {}) })
      ] })
    ] }) })
  ] });
}
function KrTab({ canEdit }) {
  const { data: depts } = useQuery(bizDepartmentsQuery);
  const { data: metrics } = useQuery(bizKrMetricsQuery);
  const [editKr, setEditKr] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Chỉ số KR theo từng phòng. Gán ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Mã gộp" }),
      " giống nhau (vd. revenue, orders) cho các KR cùng định nghĩa để Dashboard Toàn Khối/Hệ cộng chung; KR khác đơn vị hoặc cách tổng hợp sẽ bị từ chối. Chỉ số không còn dùng chỉ được ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "ngừng áp dụng" }),
      ", không xóa — dữ liệu lịch sử được bảo toàn."
    ] }),
    (depts ?? []).map((d) => {
      const ms = (metrics ?? []).filter((m) => m.department_id === d.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: d.name }),
          canEdit && d.active && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditKr({ new: d.id }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Thêm KR"
          ] })
        ] }),
        ms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Chưa có chỉ số nào." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: ms.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex items-center gap-2", children: [
              m.name,
              !m.active && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Ngừng áp dụng" }),
              m.standard_code ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", title: "Dashboard Toàn Khối gộp các KR cùng mã chuẩn và cùng đơn vị/cách tổng hợp", children: [
                "Chỉ số chuẩn: ",
                m.standard_label ?? m.standard_code,
                " (",
                m.standard_code,
                ")"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-muted-foreground", children: "Chưa ánh xạ — không gộp" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              m.unit,
              " · ",
              VALUE_KIND_LABELS[m.value_kind],
              " · ",
              AGGREGATION_LABELS[m.aggregation],
              " · ",
              DIRECTION_LABELS[m.direction],
              m.description ? ` · ${m.description}` : ""
            ] })
          ] }),
          canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(StandardCodeButton, { m }),
          canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Sửa ${m.name}`, onClick: () => setEditKr(m), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) })
        ] }, m.id)) })
      ] }, d.id);
    }),
    editKr !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(KrDialog, { kr: editKr, onClose: () => setEditKr(null) }, "new" in editKr ? `new-${editKr.new}` : editKr.id)
  ] });
}
function StandardCodeButton({ m }) {
  const [open, setOpen] = reactExports.useState(false);
  const [code, setCode] = reactExports.useState(m.standard_code ?? "");
  const [label, setLabel] = reactExports.useState(m.standard_label ?? m.name);
  const save = useBizKrStandardSave();
  if (!open) return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setOpen(true), children: "Mã gộp" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Mã chỉ số chuẩn", placeholder: "vd. revenue", className: "h-8 w-32", value: code, onChange: (e) => setCode(e.target.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên hiển thị chuẩn", placeholder: "Tên hiển thị", className: "h-8 w-36", value: label, onChange: (e) => setLabel(e.target.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: save.isPending, onClick: () => save.mutate({ _metric_id: m.id, _code: code, _label: label }, { onSuccess: () => {
      toast.success(code ? "Đã lưu mã chỉ số chuẩn" : "Đã bỏ ánh xạ");
      setOpen(false);
    } }), children: "Lưu" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpen(false), children: "Hủy" })
  ] });
}
function KrDialog({ kr, onClose }) {
  const isNew = kr !== null && "new" in kr;
  const m = isNew ? null : kr;
  const [name, setName] = reactExports.useState(m?.name ?? "");
  const [desc, setDesc] = reactExports.useState(m?.description ?? "");
  const [unit, setUnit] = reactExports.useState(m?.unit ?? "");
  const [kind, setKind] = reactExports.useState(m?.value_kind ?? "count");
  const [agg, setAgg] = reactExports.useState(m?.aggregation ?? "sum");
  const [dir, setDir] = reactExports.useState(m?.direction ?? "higher");
  const [sort, setSort] = reactExports.useState(String(m?.sort_order ?? 0));
  const [active, setActive] = reactExports.useState(m?.active ?? true);
  const save = useBizKrSave();
  if (kr === null) return null;
  const submit = async () => {
    try {
      await save.mutateAsync({
        _id: m?.id ?? null,
        _department_id: isNew ? kr.new : m?.department_id ?? "",
        _name: name,
        _description: desc,
        _unit: unit,
        _value_kind: kind,
        _aggregation: agg,
        _direction: dir,
        _sort_order: Number(sort) || 0,
        _active: active
      });
      toast.success(isNew ? "Đã thêm chỉ số KR." : "Đã cập nhật chỉ số KR.");
      onClose();
    } catch (e) {
      toast.error(e?.message || "Không lưu được chỉ số KR.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[92vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isNew ? "Thêm chỉ số KR" : "Sửa chỉ số KR" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên chỉ số" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "VD: Doanh số" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mô tả / định nghĩa nghiệp vụ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: desc, onChange: (e) => setDesc(e.target.value), placeholder: "Không bắt buộc" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn vị" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: unit, onChange: (e) => setUnit(e.target.value), placeholder: "VNĐ, Đơn, Đại lý…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thứ tự" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: sort, onChange: (e) => setSort(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kiểu giá trị" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: setKind, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(VALUE_KIND_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cách tổng hợp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: agg, onValueChange: setAgg, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(AGGREGATION_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chiều đánh giá" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dir, onValueChange: setDir, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(DIRECTION_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: active, onCheckedChange: (v) => setActive(v === true) }),
        "Đang áp dụng"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !name.trim() || !unit.trim() || save.isPending, onClick: submit, children: "Lưu" })
      ] })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["biz.org_manage", "biz.workflow_manage", "biz.kr_manage", "biz.dept_manage", "biz.deadline_manage", "settings.role"], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Cài đặt — Quản trị Kinh doanh", description: "Quy trình phê duyệt, chỉ số KR và deadline. Cơ cấu tổ chức, chức vụ và phân quyền quản lý tại Hành chính & Nhân sự → Cơ cấu tổ chức." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(BizSettings, {})
] }) });
export {
  SplitComponent as component
};
