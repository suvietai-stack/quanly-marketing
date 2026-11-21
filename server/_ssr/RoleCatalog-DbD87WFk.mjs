import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, F as useAuth, B as Button, I as Input, L as Label, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, aY as PERMISSIONS } from "./router-CkmTURa-.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { r as readPermissionCatalog, p as permissionEditorApi, P as PermissionChecklist, a as permissionDelta, u as unsupportedPermissionAdditions } from "./StaffPermissionEditor-9olmztnR.mjs";
import { v as roleCatalogApi, q as baseOrgApi, r as positionPairs, e as effectivePositionHolders } from "./organization-BsAAQoLM.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { a6 as Plus, ao as Pencil, aQ as Archive, ap as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./design-BrHT-rw4.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
import "./area-BwBtq_yo.mjs";
import "./tabs-CeCgkx-c.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./skeleton-DaUJxWW7.mjs";
function PositionRoles({ catalog, onEditRole }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const org = useQuery({ queryKey: ["org-read-positions", user?.id], queryFn: baseOrgApi.read, retry: false });
  const bindings = useQuery({ queryKey: ["position-roles", user?.id], queryFn: async () => {
    const { data, error } = await supabase.from("org_position_roles").select("unit_id,title_id,role_id");
    if (error) throw error;
    return data;
  }, retry: false });
  const [draft, setDraft] = reactExports.useState({});
  const [reason, setReason] = reactExports.useState("");
  const [msg, setMsg] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  if (org.isPending || bindings.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải vị trí…" });
  if (org.error || bindings.error) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: "Không tải được vị trí." });
  const cfg = org.data.config;
  const roles = catalog.roles.filter((r) => r.role_kind === "position" && r.catalog_state === "standard" && (r.id.startsWith("role-v2-") || r.id.startsWith("role-custom-"))).sort((a, b) => a.name.localeCompare(b.name, "vi"));
  const now = org.data.server_now ? Date.parse(org.data.server_now) : Date.now();
  const holders = (u, t) => effectivePositionHolders(cfg.memberships, u, t, now).length;
  const pairs = positionPairs(cfg);
  const key = (u, t) => `${u}|${t}`;
  const current = (u, t) => bindings.data.find((b) => b.unit_id === u && b.title_id === t)?.role_id ?? "";
  const changes = Object.entries(draft).filter(([k, v]) => {
    const [u, t] = k.split("|");
    return v !== current(u, t);
  });
  const save = async () => {
    setBusy(true);
    setMsg("");
    try {
      const cmds = changes.map(([k, v]) => {
        const [unit_id, title_id] = k.split("|");
        return { action: "position_role", data: { unit_id, title_id, role_id: v === "none" ? "" : v, reason } };
      });
      const p = await baseOrgApi.preview(org.data.revision, cfg, cfg, cmds);
      const people = new Set(changes.flatMap(([k]) => {
        const [u, t] = k.split("|");
        return effectivePositionHolders(cfg.memberships, u, t, now);
      })).size;
      if (!window.confirm(`Đổi Role cho ${changes.length} vị trí, ảnh hưởng ${people} nhân sự đang giữ. Áp dụng?`)) return;
      await baseOrgApi.apply(p.id, "ÁP DỤNG CƠ CẤU", reason);
      setDraft({});
      await qc.invalidateQueries();
      await useAuth.getState().reload();
      setMsg("Đã áp dụng.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Không áp dụng được.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gắn một Role V2 cho từng vị trí. Mọi nhân viên được bổ nhiệm ở vị trí đó nhận quyền tự động, không cần cấp từng người." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: pairs.map(({ unit, title }) => {
      const k = key(unit.id, title.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1 break-words", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: title.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
            unit.name,
            " · ",
            holders(unit.id, title.id),
            " người",
            title.kind === "manager" && title.capacity ? ` · chức vụ quản lý, tối đa ${title.capacity}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft[k] ?? (current(unit.id, title.id) || "none"), onValueChange: (v) => setDraft((d) => ({ ...d, [k]: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-64", "aria-label": `Role cho ${title.name} ${unit.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chưa gắn Role" }),
            roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.name }, r.id))
          ] })
        ] }),
        onEditRole && current(unit.id, title.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy || changes.length > 0, onClick: () => onEditRole(current(unit.id, title.id)), children: "Chỉnh quyền Role" })
      ] }, k);
    }) }),
    changes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "sm:max-w-sm", "aria-label": "Lý do gắn Role", placeholder: "Lý do", value: reason, onChange: (e) => setReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy || !reason.trim(), onClick: save, children: [
        "Xem trước và áp dụng (",
        changes.length,
        ")"
      ] })
    ] }),
    msg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-sm", children: msg })
  ] });
}
const groups = ["Quản trị & Điều hành", "B2B", "Phân Phối", "BTC", "Showroom", "Kinh doanh", "Marketing", "Thiết kế", "Vận hành", "Nhiệm vụ Marketing"];
function RoleCatalog({ canManage }) {
  const { user, isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const users = useAuth((s) => s.users);
  const q = useQuery({ queryKey: ["role-catalog", user?.id], queryFn: roleCatalogApi.read, retry: false, staleTime: 3e4 });
  const fullCatalog = useQuery({ queryKey: ["permission-catalog", user?.id], queryFn: ({ signal }) => readPermissionCatalog(signal), enabled: !!user, retry: false, staleTime: 6e4 });
  const policy = useQuery({ queryKey: ["permission-editor-policy", user?.id], queryFn: permissionEditorApi.read, retry: false });
  const [activeId, setActiveId] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("position");
  const [search, setSearch] = reactExports.useState("");
  const [roleArea, setRoleArea] = reactExports.useState("all");
  const [editor, setEditor] = reactExports.useState(null);
  const [preview, setPreview] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thực hiện được thay đổi.");
    } finally {
      setBusy(false);
    }
  };
  const reload = async () => {
    void qc.invalidateQueries({ queryKey: ["base-org", user?.id] });
    void qc.invalidateQueries({ queryKey: ["base-effective"] });
    void qc.invalidateQueries({ queryKey: ["title-role-links"] });
    await q.refetch();
  };
  const openEditor = (role) => {
    setPreview(null);
    setError("");
    setReason("");
    setEditor({ role, proposal: { name: role?.name ?? "", description: role?.description ?? "", role_kind: role?.role_kind ?? "position", catalog_group: role?.catalog_group ?? "Vận hành", permissions: role?.permissions ?? [], signal_scope_all: role?.signal_scope_all ?? false, signal_scope: role?.signal_scope ?? [] } });
  };
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-5 text-muted-foreground", children: "Đang tải kho Role…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: q.error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => q.refetch(), children: "Thử lại" })
  ] });
  const catalog = q.data;
  const editAllowed = canManage && isSuperAdmin && user?.status === "Đang hoạt động";
  const roles = catalog.roles.filter((r) => r.role_kind === filter && r.catalog_state === "standard" && (filter !== "position" || roleArea === "all" || r.catalog_group === roleArea) && `${r.name} ${r.id}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")));
  const label = (key) => PERMISSIONS.find((p) => p.key === key)?.label ?? key;
  const patch = (value) => {
    setPreview(null);
    setEditor((e) => e ? { ...e, proposal: { ...e.proposal, ...value } } : e);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "sm:max-w-xs", "aria-label": "Tìm Role", placeholder: "Tìm Role", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-label": "Ba nhóm Role", children: [{ key: "common", label: "Quyền chung" }, { key: "position", label: "Role vị trí" }, { key: "marketing_task", label: "Role nhiệm vụ" }].map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: filter === g.key ? "default" : "outline", disabled: busy, onClick: () => {
        setFilter(g.key);
        setActiveId("");
        setEditor(null);
        setPreview(null);
        setSearch("");
      }, children: g.label }, g.key)) }),
      editAllowed && filter !== "common" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        openEditor();
        setEditor((e) => e ? { ...e, proposal: { ...e.proposal, role_kind: filter === "marketing_task" ? "marketing_task" : "position" } } : e);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 size-4" }),
        "Tạo Role"
      ] })
    ] }),
    filter === "position" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role-area-filter", children: "Bộ phận" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: roleArea, onValueChange: (v) => {
        setRoleArea(v);
        setActiveId("");
        setEditor(null);
        setPreview(null);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "role-area-filter", className: "w-full min-h-11 sm:w-64", "aria-label": "Lọc Role theo bộ phận", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Tất cả bộ phận" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả bộ phận" }),
          [...new Set(catalog.roles.filter((r) => r.role_kind === "position" && r.catalog_state === "standard" && r.catalog_group).map((r) => r.catalog_group))].sort((a, b) => a.localeCompare(b, "vi")).map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: group, children: group }, group))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
        roles.length,
        " Role"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Đây là các Role đang có hiệu lực. Chọn để xem hoặc chỉnh quyền; Role của nhân viên lấy từ vị trí trên sơ đồ tổ chức." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: activeId || roles[0]?.id, onValueChange: (v) => {
          setActiveId(v);
          setEditor(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Chọn Role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn Role" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.name }, r.id)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden max-h-[70dvh] overflow-y-auto md:block", children: roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: (activeId || roles[0]?.id) === r.id ? "secondary" : "ghost", className: "mb-1 h-auto w-full justify-start whitespace-normal py-3 text-left", onClick: () => {
          setActiveId(r.id);
          setEditor(null);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-medium", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
            r.permissions.length,
            " quyền · ",
            r.receivers,
            " người"
          ] })
        ] }) }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: (() => {
        const r = roles.find((r2) => r2.id === (activeId || roles[0]?.id)) ?? roles[0];
        if (!r) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-y py-6 text-sm text-muted-foreground", children: filter === "common" ? "Quyền chung chưa kích hoạt; chờ bản cập nhật đã kiểm chứng. Chưa có quyền tự cấp mới." : "Chưa có Role trong nhóm này." });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: r.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: r.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: r.role_kind === "common" ? "Quyền chung" : r.role_kind === "marketing_task" ? "Role nhiệm vụ" : r.role_kind === "system" ? "Hệ thống" : "Role vị trí" }),
            editAllowed && !r.is_system && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: busy || !!editor || r.role_kind === "common" && !catalog.common_role_ready, onClick: () => openEditor(r), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "mr-2 size-4" }),
              "Chỉnh sửa"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-4 border-y py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Nhân viên nhận Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              r.receivers,
              " người · ",
              r.receiver_counts?.slots ?? 0,
              " qua vị trí · ",
              r.receiver_counts?.tasks ?? 0,
              " qua nhiệm vụ · ",
              r.receiver_counts?.direct ?? 0,
              " trực tiếp"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Thay đổi áp dụng cho mọi người nhận Role này; phạm vi bổ nhiệm và quyền riêng giữ nguyên." }),
            preview?.role_id === r.id && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 text-sm", children: preview.affected_users.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: users.find((u) => u.id === id)?.fullName ?? "Nhân viên trong phạm vi thay đổi" }, id)) })
          ] }),
          editor?.role?.id === r.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mb-3 border-y py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Thông tin Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên Role", disabled: editor.role?.is_system, value: editor.proposal.name, onChange: (e) => patch({ name: e.target.value }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mô tả" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editor.proposal.description, onChange: (e) => patch({ description: e.target.value }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editor.proposal.role_kind, onValueChange: (v) => {
                patch({ role_kind: v === "marketing_task" ? "marketing_task" : "position" });
              }, disabled: !!editor.role, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Loại Role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "position", children: "Role vị trí" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "marketing_task", children: "Role nhiệm vụ" }),
                  editor.proposal.role_kind === "common" && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "common", children: "Quyền chung" }),
                  editor.proposal.role_kind === "system" && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "system", children: "Hệ thống" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editor.proposal.catalog_group, onValueChange: (v) => patch({ catalog_group: v }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Nhóm chức năng Role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: g }, g)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tùy chỉnh trực tiếp các quyền bên dưới. Lưu sau bước xác nhận." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bản nháp chưa lưu. Phạm vi hiện tại và quyền riêng của nhân viên được giữ nguyên." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 font-medium", children: [
            "Quyền của Role ",
            editor?.role?.id === r.id ? "· Đang chỉnh sửa" : "· Chỉ xem"
          ] }),
          policy.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Không tải được danh sách quyền an toàn; chưa thể chỉnh." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionChecklist, { compact: true, catalog: fullCatalog.data ?? [], value: editor?.role?.id === r.id ? editor.proposal.permissions : r.permissions, onChange: (permissions) => patch({ permissions }), policy: policy.data ?? [], source: r.role_kind, checks: r.permission_checks, baseline: r.permissions, disabled: busy || !editAllowed || editor?.role?.id !== r.id || !policy.data || !fullCatalog.data || !!fullCatalog.error }),
          editor?.role?.id === r.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 flex flex-wrap items-center gap-2 border-t bg-background py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex-1 text-sm", children: [
              "Thêm ",
              permissionDelta(r.permissions, editor.proposal.permissions).added.length,
              " / bỏ ",
              permissionDelta(r.permissions, editor.proposal.permissions).removed.length,
              " quyền"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", disabled: busy, onClick: () => {
              setEditor(null);
              setPreview(null);
              setError("");
            }, children: "Hủy thay đổi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !policy.data, onClick: () => run(async () => {
              if (!editor) return;
              if (unsupportedPermissionAdditions(policy.data ?? [], r.role_kind, r.permissions, editor.proposal.permissions).length) throw new Error("Bản nháp có quyền mới chưa được máy chủ cho phép.");
              setPreview(await roleCatalogApi.preview("edit", r.id, editor.proposal));
              setReason("");
            }), children: "Xem trước" })
          ] }),
          editAllowed && !r.is_system && r.role_kind !== "common" && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm text-muted-foreground", children: "Quản trị nâng cao" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-2 text-xs", children: r.role_code ?? r.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy || r.catalog_state === "archived", onClick: () => run(async () => {
                setReason("");
                setPreview(await roleCatalogApi.preview("archive", r.id));
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "mr-1 size-3" }),
                "Ngừng sử dụng"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => run(async () => {
                setReason("");
                setPreview(await roleCatalogApi.preview("delete", r.id));
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 size-3" }),
                "Xóa an toàn"
              ] })
            ] })
          ] })
        ] });
      })() })
    ] }),
    editAllowed && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-medium", children: "Gắn Role theo cây tổ chức" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mỗi vị trí nhận một Role V2 tương ứng. Người đang giữ vị trí được áp dụng quyền tự động." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          catalog.slots.length,
          " ô vị trí · ",
          catalog.unmapped.length,
          " bổ nhiệm cần rà soát · ",
          catalog.override_rows,
          " quyền bổ sung cá nhân"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PositionRoles, { catalog, onEditRole: (id) => {
          const role = catalog.roles.find((r) => r.id === id);
          if (!role || role.is_system) return;
          setFilter(role.role_kind);
          setRoleArea("all");
          setSearch("");
          setActiveId(id);
          openEditor(role);
          window.scrollTo({ top: 0, behavior: "auto" });
        } }),
        catalog.unmapped.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm", children: [
            "Bổ nhiệm chưa gắn Role (",
            catalog.unmapped.length,
            ")"
          ] }),
          catalog.unmapped.slice(0, 30).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-1 text-xs", children: [
            a.user_name,
            " · ",
            a.unit_name,
            " · ",
            a.title_name ?? "Chưa có chức danh"
          ] }, a.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editor && !editor.role, onOpenChange: (v) => !busy && !v && setEditor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editor?.role ? "Sửa Role" : "Tạo Role" }) }),
      editor && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên Role", disabled: editor.role?.is_system, value: editor.proposal.name, onChange: (e) => patch({ name: e.target.value }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mô tả" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editor.proposal.description, onChange: (e) => patch({ description: e.target.value }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editor.proposal.role_kind, onValueChange: (v) => {
          patch({ role_kind: v === "marketing_task" ? "marketing_task" : "position" });
        }, disabled: !!editor.role, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Loại Role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "position", children: "Role vị trí" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "marketing_task", children: "Role nhiệm vụ" }),
            editor.proposal.role_kind === "common" && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "common", children: "Quyền chung" }),
            editor.proposal.role_kind === "system" && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "system", children: "Hệ thống" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editor.proposal.catalog_group, onValueChange: (v) => patch({ catalog_group: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Nhóm chức năng Role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: g }, g)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chỉnh quyền thủ công theo nhu cầu công việc, có bước xem trước trước khi lưu." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionChecklist, { compact: !!editor.role, catalog: fullCatalog.data ?? [], value: editor.proposal.permissions, onChange: (permissions) => patch({ permissions }), policy: policy.data ?? [], source: editor.proposal.role_kind, baseline: editor.role?.permissions ?? [], disabled: editor.role?.is_system || !policy.data || !fullCatalog.data || !!fullCatalog.error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex-1 text-sm", children: [
            "Thêm ",
            permissionDelta(editor.role?.permissions ?? [], editor.proposal.permissions).added.length,
            " / bỏ ",
            permissionDelta(editor.role?.permissions ?? [], editor.proposal.permissions).removed.length,
            " quyền"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", disabled: busy, onClick: () => setEditor(null), children: "Hủy thay đổi" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !editor.proposal.name.trim(), onClick: () => run(async () => {
          if (!policy.data || unsupportedPermissionAdditions(policy.data, editor.proposal.role_kind, editor.role?.permissions ?? [], editor.proposal.permissions).length) throw new Error("Bản nháp có quyền mới chưa được máy chủ cho phép.");
          setPreview(await roleCatalogApi.preview(editor.role ? "edit" : "create", editor.role?.id, editor.proposal));
          setReason("");
        }), children: "Xem trước quyền thay đổi" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: error })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!preview, onOpenChange: (v) => !busy && !v && setPreview(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85dvh] overflow-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận thay đổi Role" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: preview?.before?.name ?? preview?.after?.name ?? preview?.role_id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
        "Thêm ",
        preview?.added.length ?? 0,
        " quyền / bỏ ",
        preview?.removed.length ?? 0,
        " quyền / ảnh hưởng ",
        preview?.affected_users.length ?? 0,
        " nhân viên"
      ] }),
      preview?.removed.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-warning text-sm", children: "Quyền đã bỏ sẽ ngừng cấp từ Role này. Máy chủ kiểm tra lại trách nhiệm duyệt khi lưu; nếu còn đơn chờ xử lý, thay đổi sẽ bị chặn." }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Quyền riêng của nhân viên không thay đổi. Quyền chung, vị trí, nhiệm vụ và quyền bổ sung cá nhân được tính cùng nhau." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
        preview?.added.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Thêm: ",
          label(k)
        ] }, k)),
        preview?.removed.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Bỏ: ",
          label(k)
        ] }, k))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Lý do thay đổi Role", value: reason, onChange: (e) => setReason(e.target.value) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !reason.trim(), onClick: () => run(async () => {
        if (!preview) return;
        await roleCatalogApi.apply(preview.id, reason, preview.affected_users);
        setPreview(null);
        setEditor(null);
        await reload();
      }), children: "Lưu thay đổi Role" })
    ] }) })
  ] });
}
export {
  RoleCatalog
};
