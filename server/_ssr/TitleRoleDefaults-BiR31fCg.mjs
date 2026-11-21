import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, cg as titleRolesApi, aY as PERMISSIONS, ci as suggestedRole, B as Button, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, N as Checkbox, I as Input, ch as auditReasonLabel } from "./router-CkmTURa-.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
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
import "../_libs/lucide-react.mjs";
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
const checkLabel = auditReasonLabel;
function TitleRoleDefaults({ source, titleId, titleName, disabled, stagedLinks, onStage }) {
  const { user } = useCurrentUser();
  useQueryClient();
  const query = useQuery({ queryKey: ["title-role-links", user?.id], queryFn: titleRolesApi.read, retry: false });
  const [open, setOpen] = reactExports.useState(false);
  const [primary, setPrimary] = reactExports.useState("");
  const [scope, setScope] = reactExports.useState("unit");
  const [reason, setReason] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [inspected, setInspected] = reactExports.useState(null);
  const [enabled, setEnabled] = reactExports.useState({});
  const links = (stagedLinks ?? query.data?.links ?? []).filter((l) => l.title_source === source && l.title_id === titleId);
  const roles = query.data?.roles.filter((r) => !r.restricted && r.catalog_state === "standard" && !["role-v2-task-content-web", "role-v2-task-seo", "role-v2-task-local-seo", "role-v2-task-social", "role-v2-task-video"].includes(r.id)) ?? [];
  const suggestion = suggestedRole(titleName, roles);
  const start = () => {
    setPrimary(links.find((l) => l.is_primary)?.role_id ?? "");
    setScope(links[0]?.scope_kind ?? "own");
    setEnabled(Object.fromEntries(links.map((l) => [l.role_id, l.enabled_permissions ?? []])));
    setReason("");
    setError("");
    setOpen(true);
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      if (!onStage || source === "biz") throw new Error("Giữ nguyên quyền Kinh doanh.");
      const selected = primary ? [primary].map((role_id) => ({ title_source: source, title_id: titleId, role_id, is_primary: role_id === primary, scope_kind: scope, revision: links.find((l) => l.role_id === role_id)?.revision ?? 1, active: false, enabled_permissions: scope === "own" ? enabled[role_id] ?? [] : [] })) : [];
      onStage(selected);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được liên kết Role.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: disabled || source === "biz" || query.isPending || !!query.error, onClick: start, children: "Liên kết Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: links.length ? links.map((l) => roles.find((r) => r.id === l.role_id)?.name ?? l.role_id).join(" + ") : "Chưa thiết lập Role" }),
      links.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: links.some((l) => l.enabled_permissions?.length) ? `Đã bật ${links.reduce((n, l) => n + (l.enabled_permissions?.length ?? 0), 0)} chức năng tự cấp` : "Chưa cấp quyền" }),
      query.error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "alert", className: "text-xs text-destructive", children: query.error.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !busy && setOpen(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Role theo chức vụ — ",
        titleName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Chờ xem trước và xác nhận" }),
      suggestion && !primary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Role đề xuất: ",
          suggestion.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setPrimary(suggestion.id), children: "Chọn đề xuất" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role chính" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: primary || "_none", onValueChange: (v) => {
        setPrimary(v === "_none" ? "" : v);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Role chính", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_none", children: "Chưa thiết lập Role" }),
          roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.name }, r.id))
        ] })
      ] }),
      primary && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setInspected(roles.find((r) => r.id === primary) ?? null), children: "Xem quyền của Role chính" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phạm vi đề xuất" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: scope, onValueChange: (v) => setScope(v === "own" ? "own" : "unit"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Phạm vi Role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "own", children: "Cá nhân" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unit", children: "Đơn vị bổ nhiệm và đơn vị con" })
        ] })
      ] }),
      [primary].filter(Boolean).map((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            role?.name,
            " — chức năng tự cấp"
          ] }),
          role?.checks.filter((c) => c.ready).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-2 items-center text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { disabled: scope !== "own", checked: (enabled[roleId] ?? []).includes(c.key), onCheckedChange: (v) => setEnabled((prev) => ({ ...prev, [roleId]: v === true ? [...prev[roleId] ?? [], c.key] : (prev[roleId] ?? []).filter((p) => p !== c.key) })) }),
            PERMISSIONS.find((p) => p.key === c.key)?.label ?? c.key
          ] }, c.key)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            role?.checks.filter((c) => !c.ready).length ?? 0,
            " chức năng chưa thể tự cấp an toàn."
          ] })
        ] }, roleId);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chỉ chức năng đã kiểm chứng rào máy chủ được tự cấp theo chức vụ; chức năng chưa an toàn hiển thị rõ lý do. Quyền trực tiếp và Kinh doanh giữ nguyên." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `role-reason-${titleId}`, children: "Lý do thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `role-reason-${titleId}`, value: reason, onChange: (e) => setReason(e.target.value) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !reason.trim(), onClick: save, children: busy ? "Đang lưu…" : "Đưa vào thay đổi" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!inspected, onOpenChange: (v) => !v && setInspected(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Quyền Role — ",
        inspected?.name
      ] }) }),
      inspected?.checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: PERMISSIONS.find((p) => p.key === c.key)?.label ?? c.key }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          PERMISSIONS.find((p) => p.key === c.key)?.group ?? c.key.split(".")[0],
          " · ",
          checkLabel(c.reason)
        ] })
      ] }, c.key))
    ] }) })
  ] });
}
function StaffRoleSources({ userId, memberships }) {
  const { user } = useCurrentUser();
  const q = useQuery({ queryKey: ["title-role-links", user?.id], queryFn: titleRolesApi.read, retry: false });
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải nguồn Role…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: q.error.message });
  const roleName = (id) => q.data.roles.find((r) => r.id === id)?.name ?? id;
  const direct = q.data.direct_roles.filter((r) => r.user_id === userId);
  const sourceRules = q.data.sources?.find((s) => s.user_id === userId)?.rules ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-b pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Role được cấp trực tiếp" }),
    direct.length ? direct.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      roleName(r.role_id),
      " · Nguồn trực tiếp"
    ] }, r.role_id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có Role trực tiếp." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Role theo chức vụ" }),
    memberships.map((m, i) => {
      const links = q.data.links.filter((l) => l.title_source === m.title_source && l.title_id === m.title_id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: m.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: links.length ? links.map((l) => roleName(l.role_id)).join(" + ") : "Chưa thiết lập Role" })
      ] }, `${m.title_id}-${i}`);
    }),
    sourceRules.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      r.source_name,
      " · ",
      PERMISSIONS.find((p) => p.key === r.permission)?.label ?? r.permission
    ] }, `${r.source_id}-${r.permission}`)),
    !memberships.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có bổ nhiệm đang hiệu lực." })
  ] });
}
export {
  StaffRoleSources,
  TitleRoleDefaults
};
