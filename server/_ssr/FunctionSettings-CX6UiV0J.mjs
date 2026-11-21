import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, F as useAuth, u as useCurrentUser, X as SUPER_ADMIN_ID, N as Checkbox, Y as PERMISSION_BY_KEY, V as allDependencies, W as allDependents } from "./router-CkmTURa-.mjs";
import { z as Settings } from "../_libs/lucide-react.mjs";
const LEAVE_PERM_CATEGORIES = [
  { key: "create", label: "Tạo yêu cầu", perms: ["leave.create", "leave.create_for"] },
  { key: "approve", label: "Duyệt yêu cầu được giao", perms: ["leave.view_assigned", "leave.approve"] },
  {
    key: "manage",
    label: "Quản lý yêu cầu",
    perms: ["leave.view_all", "leave.edit_others", "leave.reassign", "leave.cancel_handle", "leave.exception", "leave.report", "leave.export"]
  },
  { key: "settings", label: "Quản lý cài đặt", perms: ["leave.settings"] }
];
const LEAVE_PERSONAL_PERMS = ["leave.view_own", "leave.edit_own", "leave.recall"];
const ATT_PERM_CATEGORIES = [
  { key: "create", label: "Tạo yêu cầu", perms: ["att.create"] },
  { key: "approve", label: "Duyệt yêu cầu được giao", perms: ["att.witness"] },
  { key: "manage", label: "Quản lý yêu cầu", perms: ["att.view_all", "att.reconcile", "att.report", "att.manage"] },
  { key: "settings", label: "Quản lý cài đặt", perms: ["att.settings"] }
];
const ATT_PERSONAL_PERMS = ["att.view_own", "att.edit_own"];
function categoryState(perms, cat) {
  const set = new Set(perms);
  const n = cat.perms.filter((k) => set.has(k)).length;
  return n === 0 ? "off" : n === cat.perms.length ? "on" : "partial";
}
function toggleCategory(current, cat, turnOn) {
  const next = new Set(current);
  if (turnOn) {
    for (const k of cat.perms) {
      next.add(k);
      for (const p of allDependencies(k)) next.add(p);
    }
  } else {
    for (const k of cat.perms) {
      next.delete(k);
      for (const d of allDependents(k)) next.delete(d);
    }
  }
  return [...next];
}
const FIN_PERM_CATEGORIES = [
  { key: "view", label: "Xem Tiền về", perms: ["finance.incoming.view", "finance.incoming.manual_view"] },
  { key: "create", label: "Tạo/ghi nhận", perms: ["finance.incoming.manual_create"] },
  { key: "confirm", label: "Xác nhận", perms: ["finance.incoming.claim"] },
  { key: "remind", label: "Nhắc thủ công", perms: ["finance.incoming.remind"] },
  { key: "manage", label: "Quản lý", perms: ["finance.incoming.reconcile", "finance.incoming.manual_manage", "finance.incoming.manage", "finance.incoming.view_totals"] },
  { key: "settings", label: "Cài đặt Tiền về", perms: ["finance.incoming.gmf_config", "finance.incoming.bank_config"] }
];
function FunctionSettingsButton({ onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": "Cài đặt", title: "Cài đặt", onClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }) });
}
function FunctionSettingsDialog({ title, categories, personal, rules, open, onClose }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[92vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RolePermissionMatrix, { categories, personal }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Quy định nghiệp vụ" }),
        rules
      ] })
    ] })
  ] }) });
}
function RolePermissionMatrix({ categories, personal }) {
  const roles = useAuth((s) => s.roles);
  const updateRole = useAuth((s) => s.updateRole);
  const { isSuperAdmin, can } = useCurrentUser();
  const canEdit = isSuperAdmin || can("settings.role");
  const [busy, setBusy] = reactExports.useState(null);
  const editable = roles.filter((r) => r.id !== SUPER_ADMIN_ID && r.catalogState === "standard");
  const toggle = async (role, cat) => {
    const turnOn = categoryState(role.permissions, cat) !== "on";
    setBusy(role.id + ":" + cat.key);
    try {
      await updateRole(role.id, { permissions: toggleCategory(role.permissions, cat, turnOn) });
      toast.success(`Đã cập nhật quyền cho "${role.name}".`);
    } catch (e) {
      toast.error(e?.message || "Không lưu được phân quyền.");
    } finally {
      setBusy(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Phân quyền" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Quyền lưu trên Role dùng chung của hệ thống — thay đổi tại đây đồng bộ ngay với Cài đặt → Tài khoản & Phân quyền.",
      !canEdit && " Bạn chỉ có quyền xem; chỉ người quản trị phân quyền mới được thay đổi."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Role" }),
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2 whitespace-nowrap", children: c.label }, c.key))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        roles.filter((r) => r.id === SUPER_ADMIN_ID).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: categories.length, className: "px-3 py-2 text-center text-xs text-muted-foreground", children: "Toàn quyền hệ thống — không thể giảm." })
        ] }, r.id)),
        editable.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.name }),
          categories.map((c) => {
            const st = categoryState(r.permissions, c);
            return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: st === "on" ? true : st === "partial" ? "indeterminate" : false,
                disabled: !canEdit || busy === r.id + ":" + c.key,
                onCheckedChange: () => toggle(r, c),
                "aria-label": `${c.label} — ${r.name}`
              }
            ) }, c.key);
          })
        ] }, r.id))
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      personal.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Quyền cá nhân luôn được giữ nguyên: ",
        personal.map((k) => PERMISSION_BY_KEY[k]?.label || k).join(", "),
        ". "
      ] }),
      "Chỉnh chi tiết hơn tại Cài đặt → Tài khoản & Phân quyền."
    ] })
  ] });
}
export {
  ATT_PERSONAL_PERMS as A,
  FunctionSettingsButton as F,
  LEAVE_PERSONAL_PERMS as L,
  RolePermissionMatrix as R,
  FunctionSettingsDialog as a,
  ATT_PERM_CATEGORIES as b,
  LEAVE_PERM_CATEGORIES as c,
  FIN_PERM_CATEGORIES as d
};
