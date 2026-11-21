import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { u as useCurrentUser, l as Badge, aY as PERMISSIONS, B as Button, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, I as Input, V as allDependencies, N as Checkbox, F as useAuth } from "./router-CkmTURa-.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { D as DESIGN_FLOWS } from "./design-BrHT-rw4.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as Search, a6 as Plus, b4 as ShieldAlert } from "../_libs/lucide-react.mjs";
function RoleActualSources({ userId }) {
  const { user } = useCurrentUser();
  const q = useQuery({ queryKey: ["role-actual-sources", user?.id, userId], retry: false, queryFn: async () => {
    const { data, error } = await supabase.rpc("role_actual_sources", { _target: userId });
    if (error) throw error;
    return data;
  } });
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-3 text-sm text-muted-foreground", children: "Đang đọc Role thực tế…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: q.error.message });
  const labels = { common: "Quyền chung", position: "Role vị trí", slot: "Role vị trí", title_legacy: "Liên kết chức danh", task: "Role nhiệm vụ", specialty: "Role nhiệm vụ", direct: "Role được cấp riêng" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Nguồn quyền thực tế" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Quyền chung + vị trí trên cây tổ chức + nhiệm vụ chuyên môn + quyền bổ sung cá nhân. Quyền bị từ chối riêng vẫn có ưu tiên chặn." }),
    q.data.legacy_paths.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Cần rà soát liên kết quyền không thuộc Role V2: ",
      q.data.legacy_paths.join(", "),
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: [{ name: "Quyền chung", kinds: ["common"] }, { name: "Role vị trí", kinds: ["position", "slot"] }, { name: "Role nhiệm vụ", kinds: ["task", "specialty"] }, { name: "Role bổ sung / liên kết khác", kinds: ["direct", "title_legacy"] }].map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: group.name }),
      q.data.sources.filter((s) => group.kinds.includes(s.source_kind)).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: s.role_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: s.role_id === "role-admin" || s.role_id === "role-super-admin" ? "Role quản trị hệ thống" : labels[s.source_kind] ?? s.source_kind }),
          s.legacy && s.role_id !== "role-admin" && s.role_id !== "role-super-admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Nguồn bổ sung cần rà soát" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          s.unit_name ?? "Phạm vi nghiệp vụ hiện hành",
          " · ",
          s.scope === "own" ? "Cá nhân" : "Theo nguồn và giới hạn nghiệp vụ",
          " · ",
          s.source_id
        ] }),
        !s.eligible && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Liên kết hiện không đủ điều kiện cấp quyền; kiểm tra lại bổ nhiệm hoặc trạng thái chuyên môn." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm", children: [
            s.permissions.length,
            " quyền từ nguồn này"
          ] }),
          s.permissions.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs py-1", children: [
            PERMISSIONS.find((p) => p.key === k)?.label ?? k,
            !q.data.effective.includes(k) ? " · Không được phép thực tế (giới hạn/ưu tiên từ chối)" : ""
          ] }, k))
        ] })
      ] }, `${s.source_kind}:${s.source_id}:${s.role_id}`)),
      !q.data.sources.some((s) => group.kinds.includes(s.source_kind)) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: group.name === "Quyền chung" ? "Chưa có nguồn quyền chung đã kích hoạt." : "Không có Role từ nguồn này." })
    ] }, group.name)) }),
    !q.data.sources.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có nguồn Role hiệu lực." })
  ] });
}
const permissionEditorApi = {
  async read() {
    const { data, error } = await supabase.rpc("permission_editor_read");
    if (error) throw error;
    return data;
  }
};
function rolePermissionPolicy(policy, kind) {
  return policy.filter((p) => permissionAvailability(policy, p.key, kind).ready);
}
function permissionDelta(before, after) {
  return { added: [...new Set(after)].filter((k) => !before.includes(k)), removed: [...new Set(before)].filter((k) => !after.includes(k)) };
}
const scopeLabels = { own: "Của mình / được giao", assigned: "Theo công việc được giao", unit: "Đơn vị của nguồn bổ nhiệm", native: "Theo phạm vi dữ liệu của chính chức năng" };
function isGrantable(key, policy) {
  const row = policy.find((p) => p.key === key);
  return row?.grantable === true || !!row && row.grantable === void 0 && row.personal && row.position_ready && row.task_ready && row.common_ready === true && row.scope === "own";
}
function permissionAvailability(policy, key, source) {
  const row = policy.find((p) => p.key === key);
  const unified = row?.deny_ready !== void 0;
  const ready = unified ? !!row && sourceFlag(row, source) : isGrantable(key, policy) || row && (source === "personal" ? row.personal : source === "common" ? row.common_ready === true && row.scope === "own" : source === "marketing_task" ? row.task_ready : row.position_ready);
  if (ready && row) {
    const base = row.scope === "unit" && source !== "position" ? `${scopeLabels.unit} · nguồn này không gắn đơn vị nên không mở thêm dữ liệu đơn vị` : scopeLabels[row.scope] ?? scopeLabels.native;
    return { ready: true, reason: row.privileged && row.reason ? `${base} · ${row.reason}` : base };
  }
  if (row?.reason) return { ready: false, reason: row.reason };
  if (row?.scope === "unit" && source !== "position") return { ready: false, reason: "Nguồn này chưa truyền phạm vi đơn vị tới cổng kiểm tra quyền; chưa thể cấp." };
  if (row) return { ready: false, reason: "Quyền có trong chính sách máy chủ nhưng nguồn cấp này chưa được kiểm chứng; chưa thể cấp." };
  return { ready: false, reason: "Máy chủ chưa công bố quyền này trong chính sách cấp quyền đã kiểm chứng; chưa thể cấp." };
}
function permissionControl(policy, key, source, baseline, value) {
  const availability = permissionAvailability(policy, key, source);
  const row = policy.find((p) => p.key === key);
  const held = baseline.includes(key);
  return {
    ...availability,
    selected: value.includes(key),
    editable: availability.ready || held,
    state: availability.ready ? "selectable" : held ? "retained" : row?.scope === "unit" ? "scope_required" : "unavailable",
    reason: availability.ready ? availability.reason : held ? `Đang giữ · có thể giữ hoặc thu hồi. ${availability.reason}` : availability.reason
  };
}
function unsupportedPermissionAdditions(policy, source, baseline, value) {
  return [...new Set(value)].filter((key) => !baseline.includes(key) && !permissionAvailability(policy, key, source).ready);
}
function sourceFlag(row, source) {
  return source === "personal" ? row.personal : source === "common" ? row.common_ready === true : source === "marketing_task" ? row.task_ready : row.position_ready;
}
function personalState(key, allow, deny) {
  return deny.includes(key) ? "deny" : allow.includes(key) ? "allow" : "inherit";
}
function setPersonalState(key, state, allow, deny) {
  const a = allow.filter((k) => k !== key), d = deny.filter((k) => k !== key);
  return { allow: state === "allow" ? [...a, key] : a, deny: state === "deny" ? [...d, key] : d };
}
function canDeny(policy, key, baselineDeny) {
  return policy.find((p) => p.key === key)?.deny_ready === true || baselineDeny.includes(key);
}
function permissionRisk(key) {
  if (/(^|\.)(settings|delete|export|force_status)(\.|$)/.test(key) || key.startsWith("settings.")) return "Nhạy cảm · cấu hình / xóa / xuất";
  if (/(approve|cancel|assign|reassign|reconcile|manage)/.test(key)) return "Trách nhiệm duyệt / quản lý";
  if (/(view_all|report_all|all_dept)/.test(key)) return "Phạm vi rộng";
  return void 0;
}
const BIZ_GROUP = "Quản trị Kinh doanh";
const bizSubgroups = [
  { id: "dashboard", name: "Dashboard", keys: ["biz.view_own", "biz.view_dept", "biz.view_all", "biz.dashboard_public"] },
  { id: "goals", name: "Mục tiêu KR", keys: ["biz.goal_submit", "biz.goal_approve", "biz.kr_manage"] },
  { id: "plans", name: "Kế hoạch", keys: ["biz.plan_submit", "biz.plan_request_revision", "biz.plan_approve"] },
  { id: "reports", name: "Báo cáo", keys: ["biz.report_submit", "biz.report_approve", "biz.deadline_manage"] },
  { id: "org", name: "Cơ cấu & Phê duyệt", keys: ["biz.approval_view", "biz.dept_manage", "biz.org_manage", "biz.workflow_manage"] }
];
const bizViewNote = "Xem KR, Kế hoạch, Báo cáo dùng chung phạm vi xem ở Dashboard (cá nhân / phòng / toàn Khối).";
const bizSourceNote = "Phạm vi theo đơn vị của chính bổ nhiệm. Quyền chưa được máy chủ xác minh vẫn khóa.";
function PermissionToggle({ permissionKey, label, checked, editable, disabled, state, onChange, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-w-0 items-start gap-3 rounded-md px-2 py-3 hover:bg-muted/40", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Checkbox,
      {
        className: "mt-1 shrink-0",
        "aria-label": permissionKey,
        "data-permission-key": permissionKey,
        "data-capability": state,
        checked,
        disabled: disabled || !editable,
        onCheckedChange: (value) => {
          if (!disabled && editable) onChange(value === true);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 space-y-1 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block break-words font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block break-all text-xs text-muted-foreground", children: permissionKey }),
      children
    ] })
  ] });
}
function PersonalStateToggle({ permissionKey, label, state, canAllow, canDeny: canDeny2, disabled, onChange, children }) {
  const options = [
    { value: "inherit", text: "Theo Role", enabled: true },
    { value: "allow", text: "Cho phép", enabled: canAllow || state === "allow" },
    { value: "deny", text: "Chặn", enabled: canDeny2 || state === "deny" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col gap-2 rounded-md px-2 py-3 hover:bg-muted/40", "data-permission-key": permissionKey, "data-personal-state": state, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 space-y-1 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block break-words font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block break-all text-xs text-muted-foreground", children: permissionKey }),
      children
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "radiogroup", "aria-label": `Trạng thái riêng ${permissionKey}`, className: "inline-flex w-fit overflow-hidden rounded-md border text-xs", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        role: "radio",
        "aria-checked": state === o.value,
        disabled: disabled || !o.enabled,
        onClick: () => {
          if (!disabled && o.enabled && state !== o.value) onChange(o.value);
        },
        className: `px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${state === o.value ? o.value === "deny" ? "bg-destructive text-destructive-foreground" : o.value === "allow" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`,
        children: o.text
      },
      o.value
    )) })
  ] });
}
function mergePermissionCatalog(catalog, local = PERMISSIONS) {
  const byKey = new Map(local.map((p) => [p.key, p]));
  for (const p of catalog) {
    const existing = byKey.get(p.key);
    byKey.set(p.key, { key: p.key, label: existing?.label || p.label || p.key, group: p.module || existing?.group || "Khác", subGroup: existing?.subGroup, description: existing?.description });
  }
  return [...byKey.values()];
}
async function readPermissionCatalog(signal) {
  let query = supabase.from("base_permission_catalog").select("key,label,module").order("key");
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
const actions = [
  ["view", "Xem và theo dõi Job trong phạm vi được phép"],
  ["edit", "Sửa thông tin yêu cầu mình liên quan"],
  ["take", "Xác nhận nhận Job được giao"],
  ["update_draft", "Cập nhật file/bản thiết kế"],
  ["submit", "Gửi bản thiết kế để duyệt"],
  ["resubmit", "Chỉnh sửa và gửi duyệt lại"],
  ["approve", "Duyệt Job được chỉ định duyệt"],
  ["request_changes", "Yêu cầu chỉnh sửa (ghi rõ lý do)"],
  ["deliver", "Bàn giao kết quả đã duyệt"],
  ["complete", "Xác nhận đã hoàn thành"],
  ["cancel", "Hủy Job hợp lệ"],
  ["restore", "Khôi phục Job bị hủy"],
  ["report_view", "Xem báo cáo Thiết kế"]
];
function DesignRolePermissionGroups({ value, onChange, policy, source, baseline, disabled }) {
  const has = (key) => value.includes(key);
  const canChange = (key) => permissionControl(policy, key, source, baseline, value).editable;
  const flows = DESIGN_FLOWS.map((f) => f.key);
  const createKeys = flows.map((f) => "order." + f + ".create");
  const allCreateEditable = createKeys.every(canChange) && (!has("order.create") || canChange("order.create"));
  function setCreate(flow, checked) {
    if (disabled || !allCreateEditable) return;
    const allActive = has("order.create") ? flows : flows.filter((f) => has("order." + f + ".create"));
    const updated = checked ? [.../* @__PURE__ */ new Set([...allActive, flow])] : allActive.filter((f) => f !== flow);
    onChange([.../* @__PURE__ */ new Set([...value.filter((k) => k !== "order.create" && !createKeys.includes(k)), ...updated.map((f) => "order." + f + ".create")])]);
  }
  const actionKeys = (action) => ["order." + action, ...flows.map((f) => "order." + f + "." + action)];
  function actionState(action) {
    const k = actionKeys(action), scoped = k.slice(1);
    return scoped.every(has) || has(k[0]) && !scoped.some(has);
  }
  function setAction(action, on) {
    if (disabled) return;
    const keys = actionKeys(action);
    const editable = keys.filter(canChange);
    if (!editable.length) return;
    const next = value.filter((k) => !editable.includes(k));
    onChange(on ? [.../* @__PURE__ */ new Set([...next, ...editable])] : next);
  }
  const applyPreset = (steps) => {
    if (disabled) return;
    const grants = steps.flatMap(actionKeys).filter(canChange);
    onChange([.../* @__PURE__ */ new Set([...value, ...grants])]);
  };
  const count = actions.filter((a) => actionState(a[0])).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-lg border p-3 sm:p-4", "aria-label": "Quyền Thiết kế theo tác vụ", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Thiết kế — tích theo tác vụ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
          count,
          "/",
          actions.length,
          " nhóm thao tác"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Chỉ phân biệt quyền tạo theo 3 loại Job. Các quyền xử lý áp dụng chung, đúng người thực hiện/người duyệt và trạng thái Job. Không cần tích 83 mã kỹ thuật." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "1. Được tạo loại Job nào?" }),
      DESIGN_FLOWS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm min-h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: has("order.create") || has("order." + f.key + ".create"), disabled: disabled || !allCreateEditable, onCheckedChange: (v) => setCreate(f.key, v === true) }),
        f.label
      ] }, f.key))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "2. Các tác vụ xử lý chung" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", "aria-label": "Tích nhanh tác vụ theo vai trò", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "outline",
            disabled,
            onClick: () => applyPreset(["view", "take", "update_draft", "submit", "resubmit", "deliver"]),
            children: "+ Tích nhanh người thực hiện"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "outline",
            disabled,
            onClick: () => applyPreset(["view", "approve", "request_changes", "complete"]),
            children: "+ Tích nhanh người duyệt"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: actions.map(([key, label]) => {
        const editable = actionKeys(key).some(canChange);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 text-sm min-h-9", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { className: "mt-0.5", checked: actionState(key), disabled: disabled || !editable, onCheckedChange: (v) => setAction(key, v === true) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
        ] }, key);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Quyền quản trị đặc biệt (chỉ chuyên trách)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2", children: [
        ["assign", "Điều phối tất cả Job của bộ phận (không cần để người tạo chọn người làm)"],
        ["edit_reviewer", "Đổi người duyệt được chỉ định"],
        ["force_status", "Ép chuyển trạng thái để xử lý sự cố"],
        ["delete", "Xóa Job chưa có lịch sử"]
      ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm min-h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: actionState(key), disabled: disabled || !actionKeys(key).some(canChange), onCheckedChange: (v) => setAction(key, v === true) }),
        label
      ] }, key)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Người tạo tự chọn nhân viên khi tạo Job; người đang thực hiện thuộc bộ phận Thiết kế được chuyển việc nội bộ. Trang “Tất cả thiết kế” chỉ hiển thị với thành viên Thiết kế." })
  ] });
}
function PermissionChecklist(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RolePermissionChecklist, { ...props, source: props.personal ? "personal" : props.source });
}
function RolePermissionChecklist({ value, onChange, policy, source = "position", disabled = false, personal = false, baseline = [], catalog = [], checks = [], effective, denied, baselineDenied = [], onPersonalChange, compact = false }) {
  const triState = personal && !!denied && !!onPersonalChange;
  const deny = denied ?? [];
  const effectiveNote = (key) => {
    const e = effective?.find((x) => x.key === key);
    if (!e) return "";
    const names = [...new Set(e.sources.filter((x) => x.effect === e.decision || e.decision === "DENY").map((x) => x.source_name ?? x.source_kind))];
    return `Hiện tại: ${e.allowed ? "có quyền" : "không có quyền"}${names.length ? ` · ${names.join(", ")}` : ""}`;
  };
  const [search, setSearch] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState(compact ? "selected" : "all");
  const available = rolePermissionPolicy(policy, source);
  const lookup = new Map(available.map((p) => [p.key, p]));
  const merged = mergePermissionCatalog(catalog, PERMISSIONS);
  const definitions = [...merged, ...baseline.filter((k) => !merged.some((p) => p.key === k)).map((key) => ({ key, label: key, group: "Quyền đang giữ" }))];
  const permitted = personal ? definitions : definitions.filter((p) => !p.key.startsWith("order."));
  const rows = permitted.filter((p) => `${p.label} ${p.group} ${p.key}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")) && (filter === "all" || (filter === "sensitive" ? !!permissionRisk(p.key) : filter === "selected" ? value.includes(p.key) || deny.includes(p.key) : filter === "denied" ? deny.includes(p.key) : !value.includes(p.key) && !deny.includes(p.key))));
  const groups = [...new Set(rows.map((p) => p.group))];
  const missing = value.flatMap((key) => {
    const parents = allDependencies(key).filter((k) => !value.includes(k));
    return parents.length ? [{ key, parents }] : [];
  });
  const label = (key) => definitions.find((p) => p.key === key)?.label ?? key;
  const toggle = (key, checked) => {
    if (disabled || !permissionControl(policy, key, source, baseline, value).editable) return;
    onChange(checked ? [.../* @__PURE__ */ new Set([...value, key])] : value.filter((k) => k !== key));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-3", "aria-label": personal ? "Danh mục quyền bổ sung cá nhân" : "Danh mục quyền Role", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 basis-full sm:basis-auto sm:flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-9", "aria-label": personal ? "Tìm quyền bổ sung" : "Tìm quyền trong ma trận", placeholder: "Tìm chức năng, quyền…", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filter, onValueChange: setFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", "aria-label": "Lọc quyền đã chọn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "selected", children: "Đã chọn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unselected", children: "Chưa chọn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sensitive", children: "Nhạy cảm" }),
          triState && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "denied", children: "Đang chặn" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
        value.length,
        " quyền đã tích"
      ] }),
      triState && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", children: [
        deny.length,
        " quyền chặn riêng"
      ] }),
      !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        new Set(definitions.map((p) => p.group)).size,
        " module · ",
        definitions.length,
        " quyền"
      ] }),
      !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        definitions.filter((p) => lookup.has(p.key)).length,
        " có thể cấp · ",
        definitions.filter((p) => !lookup.has(p.key)).length,
        " chưa khả dụng"
      ] })
    ] }),
    missing.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: true, className: "border-l-2 border-warning bg-warning/10 px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer font-medium", children: [
        missing.length,
        " quyền cần quyền truy cập đi kèm"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pt-2", children: missing.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          label(m.key),
          ": cần ",
          m.parents.map(label).join(", "),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Có thể không dùng được chức năng nếu thiếu quyền truy cập. Điều kiện nghiệp vụ vẫn được kiểm tra riêng." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: disabled || m.parents.some((k) => !lookup.has(k)), onClick: () => onChange([.../* @__PURE__ */ new Set([...value, ...m.parents])]), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 size-3" }),
          "Chọn quyền đi kèm"
        ] }),
        m.parents.some((k) => !lookup.has(k)) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Quyền đi kèm cần cấu hình an toàn trước." })
      ] }, m.key)) })
    ] }),
    !personal && (compact ? /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Quy trình Thiết kế (mở rộng)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesignRolePermissionGroups, { value, onChange, policy, source, baseline, disabled }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DesignRolePermissionGroups, { value, onChange, policy, source, baseline, disabled })),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: groups.map((group) => {
      const groupAll = permitted.filter((p) => p.group === group);
      const bulkSafe = groupAll.length > 0 && groupAll.every((p) => lookup.has(p.key) && lookup.get(p.key)?.scope !== "unit" && !permissionRisk(p.key));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: !!search || filter === "selected" || groupAll.some((p) => value.includes(p.key)), className: "group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer py-4 text-sm font-semibold", children: [
          group,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-normal text-muted-foreground", children: [
            groupAll.filter((p) => value.includes(p.key)).length,
            "/",
            groupAll.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-4", children: [
          bulkSafe && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled, className: "mb-3", onClick: () => onChange([.../* @__PURE__ */ new Set([...value, ...groupAll.map((p) => p.key)])]), children: "Chọn tất cả trong nhóm" }),
          (group === BIZ_GROUP ? [...bizSubgroups.map((g) => ({ name: g.name, keys: g.keys })), { name: "Khác", keys: [] }] : [{ name: "", keys: [] }]).map((sub) => {
            const items = rows.filter((p) => p.group === group && (group !== BIZ_GROUP || (sub.name === "Khác" ? !bizSubgroups.some((g) => g.keys.includes(p.key)) : sub.keys.includes(p.key))));
            if (!items.length) return null;
            const grid = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-x-6 gap-y-1 sm:grid-cols-2", children: items.map((p) => {
              const safe = lookup.get(p.key);
              const checked = value.includes(p.key);
              const control = permissionControl(policy, p.key, source, baseline, value);
              if (triState) {
                const st = personalState(p.key, value, deny);
                const denyOk = canDeny(policy, p.key, baselineDenied);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  PersonalStateToggle,
                  {
                    permissionKey: p.key,
                    label: p.label,
                    state: st,
                    canAllow: control.editable,
                    canDeny: denyOk,
                    disabled,
                    onChange: (next) => {
                      const r = setPersonalState(p.key, next, value, deny);
                      onPersonalChange(r.allow, r.deny);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: effectiveNote(p.key) || control.reason }),
                      !denyOk && st !== "deny" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: "Chưa chặn riêng được: cổng kiểm tra của chức năng này chưa đọc quyền chung." }),
                      permissionRisk(p.key) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-warning", children: permissionRisk(p.key) })
                    ]
                  },
                  p.key
                );
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(PermissionToggle, { permissionKey: p.key, label: p.label, checked, editable: control.editable, disabled, state: control.state, onChange: (v) => toggle(p.key, v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
                  control.reason,
                  !control.ready && checks.find((c) => c.key === p.key)?.reason ? ` · ${checks.find((c) => c.key === p.key)?.reason}` : ""
                ] }),
                permissionRisk(p.key) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-warning", children: permissionRisk(p.key) }),
                !safe && /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-3 text-muted-foreground" })
              ] }, p.key);
            }) });
            return sub.name ? /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: true, className: "border-l pl-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer py-2 text-sm font-medium", children: [
                sub.name,
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-normal text-muted-foreground", children: [
                  items.filter((p) => value.includes(p.key)).length,
                  "/",
                  items.length
                ] })
              ] }),
              grid
            ] }, sub.name) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: grid }, "all");
          }),
          group === BIZ_GROUP && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
            bizSourceNote,
            " ",
            bizViewNote
          ] })
        ] })
      ] }, group);
    }) }),
    !rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Không có quyền phù hợp." })
  ] });
}
const rpc = supabase.rpc.bind(supabase);
function StaffPermissionEditor({ userId, effective, effectiveError }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [draft, setDraft] = reactExports.useState(null);
  const [denyDraft, setDenyDraft] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const [preview, setPreview] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const policy = useQuery({ queryKey: ["permission-editor-policy", user?.id], queryFn: permissionEditorApi.read, retry: false });
  const catalog = useQuery({ queryKey: ["permission-catalog", user?.id], queryFn: ({ signal }) => readPermissionCatalog(signal), enabled: !!user, retry: false, staleTime: 6e4, refetchOnWindowFocus: true });
  const q = useQuery({ queryKey: ["staff-supplement", user?.id, userId], retry: false, queryFn: async () => {
    const { data, error: error2 } = await supabase.rpc("account_supplement_read", { _target: userId });
    if (error2) throw error2;
    return data;
  } });
  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được quyền.");
    } finally {
      setBusy(false);
    }
  };
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-muted-foreground", children: "Đang tải quyền bổ sung…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "py-4 text-muted-foreground", children: q.error.message });
  if (!q.data) return null;
  const current = draft ?? q.data.permissions ?? [];
  const denySupported = q.data.deny_supported === true;
  const baselineDenied = q.data.denied_permissions ?? [];
  const currentDenied = denyDraft ?? baselineDenied;
  const dirty = draft !== null || denyDraft !== null;
  const label = (key) => PERMISSIONS.find((p) => p.key === key)?.label ?? catalog.data?.find((p) => p.key === key)?.label ?? key;
  const openPreview = () => run(async () => {
    if (!policy.data || unsupportedPermissionAdditions(policy.data, "personal", q.data?.permissions ?? [], current).length) throw new Error("Bản nháp có quyền mới chưa được máy chủ cho phép.");
    const { data, error: error2 } = denySupported ? await rpc("account_supplement_preview", { _target: userId, _permissions: current, _denied: currentDenied }) : await supabase.rpc("account_supplement_preview", { _target: userId, _permissions: current });
    if (error2) throw error2;
    setPreview(data);
  });
  const save = () => run(async () => {
    if (!preview || !q.data || !dirty) return;
    const { error: error2 } = denySupported ? await rpc("account_supplement_save", { _target: userId, _roles: q.data.role_ids, _permissions: current, _denied: currentDenied, _fingerprint: preview.fingerprint, _reason: reason }) : await supabase.rpc("account_supplement_save", { _target: userId, _roles: q.data.role_ids, _permissions: current, _fingerprint: preview.fingerprint, _reason: reason });
    if (error2) throw error2;
    setDraft(null);
    setDenyDraft(null);
    setPreview(null);
    setReason("");
    await qc.invalidateQueries();
    await useAuth.getState().reload();
    toast.success("Đã lưu quyền bổ sung cho nhân viên này.");
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-l-2 border-primary pl-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: denySupported ? "Quyền riêng của nhân viên" : "Quyền bổ sung cá nhân" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: denySupported ? "Theo Role: nhận theo Role chung, vị trí, nhiệm vụ. Cho phép: thêm riêng. Chặn: tắt quyền này cho riêng nhân viên, thắng mọi Role. Người cùng Role không bị ảnh hưởng." : "Chỉ cộng thêm cho nhân viên này. Những người cùng Role không bị ảnh hưởng." }),
      !denySupported && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Chặn quyền riêng đang chờ chủ dự án duyệt cập nhật máy chủ; hiện chỉ cộng thêm được." })
    ] }),
    q.data.legacy_override ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Quyền riêng cũ đang bật. Cần đối chiếu và xác nhận chuyển đổi trước; cấu hình hiện tại được giữ nguyên." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      q.data.inactive_legacy && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer", children: "Có cấu hình cũ đang tắt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pt-2", children: "Chưa thay đổi. Nếu xác nhận lưu, chỉ quyền riêng của nhân viên này chuyển sang cộng thêm; bản trước được lưu trong nhật ký." })
      ] }),
      policy.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Chưa tải được các quyền có phạm vi an toàn. Danh mục chỉ xem, chưa thể thay đổi." }),
      catalog.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang đối chiếu danh mục quyền toàn Base…" }),
      catalog.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: "Chưa tải được danh mục quyền toàn Base. Đang hiện danh mục có sẵn, chỉ xem." }),
      effectiveError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-muted-foreground text-sm", children: "Chưa tải được quyền hiệu lực và nguồn Role; trạng thái quyền riêng vẫn giữ nguyên." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionChecklist, { personal: true, value: current, onChange: (v) => {
        setDraft(v);
        setPreview(null);
      }, denied: denySupported ? currentDenied : void 0, baselineDenied, onPersonalChange: denySupported ? (a, d) => {
        setDraft(a);
        setDenyDraft(d);
        setPreview(null);
      } : void 0, policy: policy.data ?? [], baseline: q.data.permissions ?? [], effective, catalog: catalog.data ?? [], disabled: !policy.data || !!policy.error || !catalog.data || !!catalog.error || busy }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !dirty || busy || !policy.data || !!policy.error || !catalog.data || !!catalog.error, onClick: openPreview, children: "Xem trước quyền riêng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", disabled: !dirty || busy, onClick: () => {
          setDraft(null);
          setDenyDraft(null);
          setPreview(null);
          setError("");
        }, children: "Hủy thay đổi" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!preview, onOpenChange: (v) => !busy && !v && setPreview(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận quyền riêng" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
        "Thêm ",
        preview?.added.length ?? 0,
        " / bỏ ",
        preview?.removed.length ?? 0,
        denySupported ? ` · chặn ${preview?.deny_added?.length ?? 0} / bỏ chặn ${preview?.deny_removed?.length ?? 0}` : "",
        " quyền · chỉ 1 nhân viên"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: denySupported ? "Bỏ “Cho phép” chỉ quay về theo Role; muốn tắt hẳn quyền thì chọn “Chặn”." : "Bỏ quyền bổ sung không trừ quyền đang nhận từ Role, vị trí hoặc nhiệm vụ." }),
      preview?.added.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Thêm: ",
        label(k)
      ] }, k)),
      preview?.removed.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Bỏ bổ sung: ",
        label(k)
      ] }, k)),
      preview?.deny_added?.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-destructive", children: [
        "Chặn: ",
        label(k)
      ] }, k)),
      preview?.deny_removed?.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Bỏ chặn (theo Role): ",
        label(k)
      ] }, k)),
      preview?.inactive_legacy && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cấu hình riêng cũ đang tắt được thay bằng quyền cộng thêm đã chọn. Nhật ký giữ bản trước." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `personal-reason-${userId}`, children: "Lý do thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `personal-reason-${userId}`, value: reason, onChange: (e) => setReason(e.target.value) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !reason.trim(), onClick: save, children: busy ? "Đang lưu…" : "Xác nhận lưu quyền riêng" })
    ] }) })
  ] });
}
export {
  PermissionChecklist as P,
  RoleActualSources as R,
  StaffPermissionEditor as S,
  permissionDelta as a,
  permissionEditorApi as p,
  readPermissionCatalog as r,
  unsupportedPermissionAdditions as u
};
