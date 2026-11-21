import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { S as StaffPermissionEditor, R as RoleActualSources } from "./StaffPermissionEditor-9olmztnR.mjs";
import { F as useAuth, u as useCurrentUser, l as Badge, C as Card, o as CardContent, B as Button, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, I as Input, M as PasswordInput, E as DialogFooter, b6 as accountAuthStatus, aS as resendConfirmation, b7 as ROLE_PERMISSIONS, b8 as PERMISSION_GROUPS, b9 as BIZ_ORG_GROUPS, X as SUPER_ADMIN_ID, ba as auditDependencies, bb as ALL_PERMS } from "./router-CkmTURa-.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { C as ChangePasswordForm } from "./ChangePasswordForm-da5YiEvA.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as isFakeEmail, p as passwordIssues } from "./auth-errors-CN_iHaBn.mjs";
import "../_libs/seroval.mjs";
import { a7 as ShieldCheck, ao as Pencil, ba as LockOpen, bb as Lock, ap as Trash2, q as Check, X, b6 as KeyRound, aC as RefreshCw, b5 as Mail, f as Search, b3 as Network } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./design-BrHT-rw4.mjs";
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
function AccountAuthPanel({ userId, email }) {
  const query = useQuery({ queryKey: ["account-auth-status", userId], queryFn: () => accountAuthStatus({ data: { userId } }), staleTime: 0, retry: false });
  const [sending, setSending] = reactExports.useState(false);
  const state = query.data;
  const needsCheck = state && (!state.authExists || !state.profileExists || !state.emailMatches);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-b border-border pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Trạng thái xác thực" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: needsCheck || query.isError ? "destructive" : "secondary", children: query.isPending ? "Đang kiểm tra…" : query.isError || needsCheck ? "Hồ sơ/Auth cần kiểm tra" : state?.banned ? "Xác thực đang bị hạn chế" : state?.emailConfirmed ? "Email đã xác nhận" : "Email chưa xác nhận" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Kiểm tra lại trạng thái xác thực", "aria-label": "Kiểm tra lại trạng thái xác thực", disabled: query.isFetching, onClick: () => void query.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4" }) })
    ] }),
    state && !state.emailConfirmed && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Duyệt hoặc đặt lại mật khẩu không thay thế xác nhận email. Nhân viên cần mở liên kết xác nhận trước khi đăng nhập." }),
    state?.banned && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Tài khoản xác thực đang bị hạn chế; mở khóa hồ sơ không tự bỏ hạn chế này." }),
    email && !isFakeEmail(email) && state?.authExists && !state.emailConfirmed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: sending, onClick: async () => {
      setSending(true);
      try {
        await resendConfirmation({ data: { email, redirect: `${window.location.origin}/login` } });
        toast.success("Đã yêu cầu gửi liên kết xác nhận. Vui lòng kiểm tra hộp thư.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Không gửi được email.");
      } finally {
        setSending(false);
      }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4" }),
      sending ? "Đang gửi…" : "Gửi lại email xác nhận"
    ] })
  ] });
}
const STATUSES = ["Chờ duyệt", "Đang hoạt động", "Tạm khóa", "Từ chối", "Lưu trữ"];
function StatusBadge({ value }) {
  const map = {
    "Chờ duyệt": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    "Đang hoạt động": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    "Tạm khóa": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    "Từ chối": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    "Lưu trữ": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[value]}`, children: value });
}
function AccountsSettings() {
  const s = useAuth();
  const { user: me, isSuperAdmin, can } = useCurrentUser();
  const canManageRoles = isSuperAdmin || can("settings.role");
  const canManageMatrix = isSuperAdmin || can("settings.permission");
  const canApprove = isSuperAdmin || can("settings.account_approve");
  const canLock = isSuperAdmin || can("settings.account_lock");
  const canViewUsers = isSuperAdmin || can("settings.user_view");
  const pending = s.users.filter((u) => u.status === "Chờ duyệt");
  const others = s.users.filter((u) => u.status !== "Chờ duyệt");
  const defaultTab = pending.length > 0 && canApprove ? "pending" : canViewUsers ? "all" : "me";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    (canManageRoles || canManageMatrix) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Danh sách Role, ma trận phân quyền và debug quyền đã chuyển về Hành chính & Nhân sự → Cơ cấu tổ chức → Cài đặt → Role & Phân quyền." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: defaultTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        canViewUsers && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", children: [
          "Tất cả tài khoản (",
          s.users.length,
          ")"
        ] }),
        canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", className: pending.length > 0 ? "data-[state=inactive]:text-amber-700 dark:data-[state=inactive]:text-amber-400" : "", children: [
          "Chờ duyệt ",
          pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1.5 bg-amber-500 text-white hover:bg-amber-500", children: pending.length })
        ] }),
        me && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "me", children: "Đổi mật khẩu" })
      ] }),
      canViewUsers && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "all", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AllAccountsTab, { users: others.concat(pending), canLock }) }),
      canApprove && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pending", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PendingTab, { users: pending, canApprove }) }),
      me && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "me", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordTab, {}) })
    ] })
  ] });
}
const SOURCE_KIND_LABEL = {
  appointment_role: "Chức vụ",
  marketing_specialty: "Nhiệm vụ Marketing",
  default: "Quyền mặc định",
  direct: "Quyền bổ sung trực tiếp",
  bundle: "Bộ quyền"
};
function PermissionDebugTab() {
  const s = useAuth();
  const [uid, setUid] = reactExports.useState("");
  const [testKey, setTestKey] = reactExports.useState("");
  const target = reactExports.useMemo(() => s.users.find((u) => u.id === uid), [s.users, uid]);
  const explainQ = useQuery({
    queryKey: ["perm-explain", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("account_permission_explain", { _target: uid });
      if (error) throw error;
      return data;
    },
    staleTime: 15e3
  });
  const info = explainQ.data;
  const effective = reactExports.useMemo(() => new Set(info?.effective ?? []), [info]);
  const testResult = reactExports.useMemo(() => {
    if (!info || !testKey) return null;
    const ok = info.is_super_admin || effective.has(testKey);
    const sources = [];
    for (const r of info.direct_roles) if (r.permissions.includes(testKey)) sources.push(`Role "${r.name}"`);
    if (info.use_custom && info.custom_permissions.includes(testKey))
      sources.push(info.override_mode === "additive" ? "Quyền bổ sung cá nhân (cộng thêm)" : "Quyền riêng (thay thế Role)");
    for (const rule of info.rules.filter((x) => x.permission === testKey))
      sources.push(`${SOURCE_KIND_LABEL[rule.source_kind] ?? rule.source_kind}${rule.source_name ? `: ${rule.source_name}` : ""} (${rule.effect === "DENY" ? "CHẶN" : "cho phép"})`);
    const reason = info.is_super_admin ? "Super Admin — toàn quyền" : ok ? sources.length > 0 ? `Cấp qua: ${sources.join(" · ")}` : "Được cấp theo resolver backend" : sources.length > 0 && info.rules.some((x) => x.permission === testKey && x.effect === "DENY") ? `Bị chặn bởi: ${sources.join(" · ")}` : "Không có nguồn cấp nào cho quyền này";
    return { ok, reason };
  }, [info, testKey, effective]);
  const audit = reactExports.useMemo(() => {
    const rows = [];
    for (const r of s.roles) {
      if (r.id === SUPER_ADMIN_ID) continue;
      const issues = auditDependencies(r.permissions || []);
      if (issues.length) rows.push({ kind: "Role", name: r.name, issues });
    }
    for (const u of s.users) {
      if (!u.useCustom) continue;
      const issues = auditDependencies(u.customPermissions || []);
      if (issues.length) rows.push({ kind: "User (quyền riêng)", name: u.fullName || u.username, issues });
    }
    return rows;
  }, [s.roles, s.users]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Công cụ này chỉ Super Admin xem được. Dùng để kiểm tra vì sao một tài khoản thấy/không thấy được một chức năng." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chọn tài khoản" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: uid, onValueChange: setUid, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— chọn user —" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: s.users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: u.id, children: [
            u.fullName || u.username,
            " (",
            u.username,
            ")"
          ] }, u.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test can(permissionKey)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: testKey, onValueChange: setTestKey, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— chọn quyền để test —" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-72", children: ROLE_PERMISSIONS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.key, children: [
            p.key,
            " — ",
            p.label
          ] }, p.key)) })
        ] })
      ] })
    ] }),
    target && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      explainQ.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Đang đọc kết quả từ máy chủ…" }),
      explainQ.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-rose-600", children: [
        "Không đọc được giải thích quyền: ",
        explainQ.error instanceof Error ? explainQ.error.message : "lỗi"
      ] }),
      info && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nguồn quyền: " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: info.is_super_admin ? "Super Admin / Tài khoản hệ thống — toàn quyền" : info.use_custom ? info.override_mode === "additive" ? "Role + quyền bổ sung cá nhân (cộng thêm)" : "Quyền riêng (thay thế Role)" : info.direct_roles.length > 0 ? `Theo role: ${info.direct_roles.map((r) => r.name).join(", ")}` : "Chưa gán Role" })
        ] }),
        info.direct_roles.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Tài khoản có ",
          info.direct_roles.length,
          " Role trực tiếp — quyền hiệu lực là tổng hợp đã loại trùng."
        ] }),
        info.rules.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nguồn theo chức vụ/nhiệm vụ: " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: [...new Set(info.rules.map((r) => `${SOURCE_KIND_LABEL[r.source_kind] ?? r.source_kind}${r.source_name ? ` (${r.source_name})` : ""}`))].join(" · ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Trạng thái: " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: target.status }),
          info.status !== "Đang hoạt động" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-rose-600", children: "Tài khoản không hoạt động — mọi quyền vô hiệu." })
        ] })
      ] }),
      testKey && testResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-sm font-medium ${testResult.ok ? "text-emerald-600" : "text-rose-600"}`, children: [
        'can("',
        testKey,
        '") = ',
        testResult.ok ? "TRUE — được phép" : "FALSE — bị chặn",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground font-normal mt-0.5", children: [
          "Lý do: ",
          testResult.reason
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
          "Quyền hiệu lực (",
          effective.size,
          "/",
          ALL_PERMS.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Quyền Quản trị Kinh doanh và Quản lý 3K không cấp qua Role tổng — quản lý tại Quản trị Kinh doanh → Cài đặt (Cơ cấu tổ chức & Bổ nhiệm)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 max-h-96 overflow-y-auto border rounded p-2", children: PERMISSION_GROUPS.filter((g) => !BIZ_ORG_GROUPS.includes(g)).map((g) => {
          const items = ROLE_PERMISSIONS.filter((p) => p.group === g);
          const granted = items.filter((p) => effective.has(p.key));
          if (granted.length === 0) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-muted-foreground mb-1", children: [
              g,
              " (",
              granted.length,
              "/",
              items.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: items.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                title: p.label,
                className: `text-[11px] px-1.5 py-0.5 rounded border ${effective.has(p.key) ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" : "bg-muted/40 border-border text-muted-foreground line-through"}`,
                children: p.key
              },
              p.key
            )) })
          ] }, g);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-2", children: "Kiểm tra khớp quyền (toàn hệ thống)" }),
      audit.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-emerald-600", children: "✓ Tất cả role và quyền riêng đều khớp dependency." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-72 overflow-y-auto", children: audit.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
          row.kind,
          ": ",
          row.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 space-y-0.5 text-muted-foreground", children: row.issues.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: it.key }),
          " — thiếu quyền cha:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-amber-700 dark:text-amber-400", children: it.missing.join(", ") })
        ] }, it.key)) })
      ] }, i)) })
    ] })
  ] }) });
}
function AllAccountsTab({ users, canLock }) {
  const s = useAuth();
  const [editing, setEditing] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Họ tên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tên đăng nhập" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "SĐT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Ngày tạo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-4 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        users.map((u) => {
          const role = s.roles.find((r) => r.id === u.roleId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              u.fullName,
              u.system && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
                "Tài khoản hệ thống"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.email || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.phone || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: role?.name || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Chưa gán" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: u.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground text-xs", children: new Date(u.createdAt).toLocaleDateString("vi-VN") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-right whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Chi tiết / Sửa", onClick: () => setEditing(u), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              !u.system && canLock && (u.status === "Tạm khóa" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Mở khóa", onClick: async () => {
                try {
                  await s.setStatus(u.id, "Đang hoạt động");
                  toast.success("Đã mở khóa hồ sơ.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Không mở khóa được.");
                }
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-3.5 w-3.5" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Khóa", onClick: async () => {
                try {
                  await s.setStatus(u.id, "Tạm khóa");
                  toast.success("Đã khóa tài khoản.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Không khóa được.");
                }
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }) })),
              !u.system && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Xóa", onClick: () => {
                if (confirm(`Xóa tài khoản ${u.username}?`)) s.removeUser(u.id);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, u.id);
        }),
        users.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-4 py-10 text-center text-muted-foreground text-sm", children: "Chưa có tài khoản." }) })
      ] })
    ] }) }) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(UserEditDialog, { user: editing, onClose: () => setEditing(null) })
  ] });
}
function AccountOrgPanel({ userId }) {
  const q = useQuery({
    queryKey: ["account-org-summary", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("account_org_summary", { _target: userId });
      if (error) throw error;
      return data;
    },
    retry: false
  });
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải phân công từ Cơ cấu tổ chức…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
    "Không đọc được phân công: ",
    q.error instanceof Error ? q.error.message : "lỗi"
  ] });
  const d = q.data;
  if (!d) return null;
  const primary = d.assignments.filter((a) => a.category !== "concurrent");
  const concurrent = d.assignments.filter((a) => a.category === "concurrent");
  const line = (a) => `${a.unit_name} · ${a.title_name ?? "Thành viên"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 rounded-lg border bg-muted/20 p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold", children: "Phân công theo Cơ cấu tổ chức" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/organization", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-3.5 w-3.5 mr-1.5" }),
        "Đến Cơ cấu tổ chức"
      ] }) })
    ] }),
    d.assignments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "Chưa phân công — bổ nhiệm tại Cơ cấu tổ chức để tài khoản nhận Role theo chức vụ." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
      primary.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Đơn vị công tác: " }),
        line(a)
      ] }, `p${i}`)),
      concurrent.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Kiêm nhiệm: " }),
        concurrent.map(line).join(" · ")
      ] })
    ] }),
    d.specialties.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nhiệm vụ Marketing: " }),
      d.specialties.map((sp) => sp.name).join(", ")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Role hiệu lực: " }),
      d.roles.length > 0 ? d.roles.map((r) => r.name).join(", ") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-muted-foreground", children: "Chưa gán" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RoleActualSources, { userId })
  ] });
}
function AccountPermsView({ userId }) {
  const q = useQuery({
    queryKey: ["perm-explain", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("account_permission_explain", { _target: userId });
      if (error) throw error;
      return data;
    },
    retry: false
  });
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang đọc quyền thực nhận…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
    "Không đọc được quyền: ",
    q.error instanceof Error ? q.error.message : "lỗi"
  ] });
  const info = q.data;
  if (!info) return null;
  const effective = new Set(info.effective);
  const sourceNames = [...new Set(info.rules.map((r) => `${SOURCE_KIND_LABEL[r.source_kind] ?? r.source_kind}${r.source_name ? `: ${r.source_name}` : ""}`))];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nguồn quyền: " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: info.is_super_admin ? "Super Admin / Tài khoản hệ thống — toàn quyền" : [
        info.direct_roles.length > 0 ? `Role: ${info.direct_roles.map((r) => r.name).join(", ")}` : null,
        sourceNames.length > 0 ? sourceNames.join(" · ") : null,
        info.use_custom ? info.override_mode === "additive" ? "Quyền bổ sung cá nhân" : "Quyền riêng (thay thế Role)" : null
      ].filter(Boolean).join(" · ") || "Chưa có nguồn quyền" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
        "Quyền thực nhận (",
        effective.size,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 max-h-72 overflow-y-auto border rounded p-2 space-y-2", children: [
        PERMISSION_GROUPS.filter((g) => !BIZ_ORG_GROUPS.includes(g)).map((g) => {
          const granted = ROLE_PERMISSIONS.filter((p) => p.group === g && effective.has(p.key));
          if (!granted.length) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-muted-foreground mb-1", children: [
              g,
              " (",
              granted.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: granted.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: p.label, className: "text-[11px] px-1.5 py-0.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800", children: p.label }, p.key)) })
          ] }, g);
        }),
        effective.size === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-3 text-center", children: "Chưa có quyền nghiệp vụ — bổ nhiệm chức vụ tại Cơ cấu tổ chức." })
      ] })
    ] })
  ] });
}
function UserEditDialog({ user, onClose }) {
  const s = useAuth();
  const { isSuperAdmin, can } = useCurrentUser();
  const canReset = isSuperAdmin || can("settings.user_reset_password");
  const canCustomPerm = isSuperAdmin || can("settings.user_custom_perm");
  const [tab, setTab] = reactExports.useState("info");
  const [form, setForm] = reactExports.useState({
    fullName: user.fullName,
    email: user.email || "",
    phone: user.phone || "",
    notes: user.notes || "",
    status: user.status
  });
  const [newPwd, setNewPwd] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [resetting, setResetting] = reactExports.useState(false);
  const isSystem = !!user.system;
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await s.updateUser(user.id, {
        fullName: form.fullName,
        phone: form.phone || void 0,
        notes: form.notes || void 0
      });
      if (!isSystem && form.status !== user.status) {
        if (user.status === "Chờ duyệt" && form.status === "Đang hoạt động") {
          const result = await s.approve(user.id);
          if (!result.emailConfirmed) toast.info("Đã duyệt hồ sơ; nhân viên vẫn cần xác nhận email trước khi đăng nhập.");
        } else await s.setStatus(user.id, form.status);
      }
      toast.success("Đã lưu");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không lưu được tài khoản.");
    } finally {
      setSaving(false);
    }
  };
  const reset = async () => {
    if (resetting) return;
    const issues = passwordIssues(newPwd);
    if (issues.length) return toast.error(issues[0]);
    setResetting(true);
    try {
      const result = await s.resetPassword(user.id, newPwd);
      setNewPwd("");
      toast.success(result.ready ? "Đã đặt lại mật khẩu cho tài khoản được chọn." : "Đã đặt lại mật khẩu; tài khoản vẫn cần hoàn tất xác nhận email hoặc điều kiện truy cập.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không reset được mật khẩu.");
    } finally {
      setResetting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Chi tiết tài khoản — ",
      user.fullName
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "perms", disabled: isSystem, children: "Quyền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "security", children: "Bảo mật" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên đăng nhập" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: user.username, disabled: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Họ tên *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fullName, onChange: (e) => setForm({ ...form, fullName: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email đăng nhập" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.email, readOnly: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Email do hệ thống xác thực quản lý." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SĐT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm({ ...form, status: v }), disabled: isSystem, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm({ ...form, notes: e.target.value }) })
        ] }),
        !isSystem && /* @__PURE__ */ jsxRuntimeExports.jsx(AccountOrgPanel, { userId: user.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "perms", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccountPermsView, { userId: user.id }),
        canCustomPerm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold", children: "Tùy chỉnh quyền" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffPermissionEditor, { userId: user.id }, user.id)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "security", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccountAuthPanel, { userId: user.id, email: user.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Mật khẩu được lưu dạng hash an toàn. Không hiển thị mật khẩu gốc." }),
        canReset ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_auto] items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "admin-reset-password", children: "Mật khẩu mới" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "admin-reset-password", value: newPwd, onChange: (e) => setNewPwd(e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "8–200 ký tự, gồm chữ cái và chữ số." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: resetting || user.id === s.currentUserId, onClick: reset, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4 mr-1.5" }),
            resetting ? "Đang cập nhật…" : "Đặt lại mật khẩu"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Bạn không có quyền reset mật khẩu tài khoản khác." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Đóng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saving, onClick: save, children: saving ? "Đang lưu…" : "Lưu" })
    ] })
  ] }) });
}
function PendingTab({ users, canApprove }) {
  const s = useAuth();
  const [busy, setBusy] = reactExports.useState(false);
  const [checking, setChecking] = reactExports.useState(null);
  const approve = async (id) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await s.approve(id);
      toast.success(result.ready ? "Đã duyệt. Tài khoản có thể đăng nhập." : "Đã duyệt hồ sơ. Nhân viên cần xác nhận email trước khi đăng nhập.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không duyệt được tài khoản.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Họ tên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tên đăng nhập" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "SĐT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Vị trí mong muốn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Ngày đăng ký" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-4 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: u.fullName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: u.username }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.email || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.phone || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: u.desiredPosition || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs text-muted-foreground", children: new Date(u.createdAt).toLocaleDateString("vi-VN") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground text-xs max-w-[260px] truncate", children: u.notes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right whitespace-nowrap", children: canApprove ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: busy, className: "ml-1 text-emerald-700", onClick: () => void approve(u.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
              "Duyệt"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "ml-1 text-rose-700", onClick: async () => {
              try {
                await s.reject(u.id);
                toast.success("Đã từ chối");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Không từ chối được tài khoản.");
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
              "Từ chối"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setChecking(u), children: "Kiểm tra xác thực" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Không có quyền" }) })
        ] }, u.id)),
        users.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-4 py-10 text-center text-muted-foreground text-sm", children: "Không có tài khoản chờ duyệt." }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!checking, onOpenChange: (open) => !open && setChecking(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Trạng thái xác thực — ",
        checking?.fullName
      ] }) }),
      checking && /* @__PURE__ */ jsxRuntimeExports.jsx(AccountAuthPanel, { userId: checking.id, email: checking.email })
    ] }) })
  ] });
}
function MatrixTab({ canManage: _canManage }) {
  const s = useAuth();
  const [group, setGroup] = reactExports.useState("ALL");
  const [q, setQ] = reactExports.useState("");
  const filtered = reactExports.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return ROLE_PERMISSIONS.filter((p) => {
      if (group !== "ALL" && p.group !== group) return false;
      if (!qq) return true;
      return p.label.toLowerCase().includes(qq) || p.key.toLowerCase().includes(qq) || (p.subGroup || "").toLowerCase().includes(qq);
    });
  }, [group, q]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Nhóm quyền:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: group, onValueChange: setGroup, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ALL", children: "Tất cả" }),
          PERMISSION_GROUPS.filter((g) => !BIZ_ORG_GROUPS.includes(g)).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: g }, g))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-[260px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Tìm quyền...", className: "pl-8 h-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-auto", children: [
        filtered.length,
        " quyền · Chỉnh sửa ở tab Role."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-auto max-h-[70vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[11px] text-muted-foreground bg-muted/60 sticky top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2 sticky left-0 bg-muted/60 z-10 min-w-[260px]", children: "Quyền" }),
        s.roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-2 py-2 whitespace-nowrap", children: r.name }, r.id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-1.5 sticky left-0 bg-card z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: p.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            p.group,
            " · ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: p.key })
          ] })
        ] }),
        s.roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-center", children: r.permissions.includes(p.key) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-emerald-600 mx-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40", children: "·" }) }, r.id))
      ] }, p.key)) })
    ] }) }) })
  ] });
}
function ChangePasswordTab() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, {});
}
export {
  AccountsSettings,
  MatrixTab,
  PermissionDebugTab
};
