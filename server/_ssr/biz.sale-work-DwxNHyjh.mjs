import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { a as useQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, I as Input, L as Label, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/seroval.mjs";
import { aj as Settings2, b6 as KeyRound, b7 as Copy, E as EyeOff, r as Eye, ag as ExternalLink, f as Search, aU as UserPlus, a7 as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
const db = supabase;
async function rpc(fn, args = {}) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
}
const SW_ACTION_LABEL = {
  config: "Cập nhật cấu hình",
  grant: "Cấp tài khoản",
  update: "Đổi tên tài khoản",
  reset_password: "Thay thế mật khẩu",
  lock: "Tạm khóa",
  unlock: "Mở khóa",
  revoke: "Thu hồi thông tin truy cập",
  view_password: "Nhân viên xem mật khẩu của mình"
};
const swApi = {
  config: () => rpc("sw_config"),
  saveConfig: (displayName, url, description, enabled) => rpc("sw_config_save", { _display_name: displayName, _url: url, _description: description, _enabled: enabled }),
  myCredential: () => rpc("sw_my_credential"),
  // Mật khẩu chỉ tồn tại trong bộ nhớ phiên hiện tại — không lưu storage, không cache query.
  revealPassword: () => rpc("sw_reveal_password"),
  staffList: (q) => rpc("sw_staff_list", { _q: q }),
  saveCredential: (userId, username, password, status) => rpc("sw_credential_save", { _user_id: userId, _username: username, _password: password, _status: status }),
  revokeCredential: (userId) => rpc("sw_credential_revoke", { _user_id: userId }),
  audit: () => rpc("sw_audit", { _limit: 200 })
};
const errMsg = (e) => e instanceof Error ? e.message : String(e);
const fmtDateTime = (s) => s ? new Date(s).toLocaleString("vi-VN") : "—";
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    children
  ] });
}
async function copyText(text, what) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${what}`);
  } catch {
    toast.error(`Không sao chép được ${what}`);
  }
}
function SaleWork() {
  const { can } = useCurrentUser();
  const canSettings = can("sale_work.manage_settings");
  const canCredentials = can("sale_work.manage_credentials");
  const canAudit = can("sale_work.view_audit");
  const [tab, setTab] = reactExports.useState("mine");
  const config = useQuery({ queryKey: ["sw", "config"], queryFn: swApi.config });
  const mine = useQuery({ queryKey: ["sw", "mine"], queryFn: swApi.myCredential });
  const [password, setPassword] = reactExports.useState(null);
  const [revealing, setRevealing] = reactExports.useState(false);
  const hidePassword = () => setPassword(null);
  reactExports.useEffect(() => hidePassword, [mine.data?.updated_at]);
  const reveal = async () => {
    if (password) return hidePassword();
    setRevealing(true);
    try {
      setPassword(await swApi.revealPassword());
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setRevealing(false);
    }
  };
  const openApp = () => {
    const url = config.data?.url;
    if (!config.data?.enabled || !url || !/^https:\/\//.test(url)) {
      return toast.error("Liên kết Sale Work chưa được cấu hình hoặc đang tắt. Liên hệ người quản trị.");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const cred = mine.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: config.data?.display_name || "Sale Work Zalo", description: "Thông tin truy cập phần mềm Sale Work của bạn" }),
    (canSettings || canCredentials || canAudit) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: tab === "mine" ? "default" : "outline", size: "sm", onClick: () => setTab("mine"), children: "Tài khoản của tôi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: tab === "settings" ? "default" : "outline", size: "sm", onClick: () => setTab("settings"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4 mr-1" }),
        "Cài đặt"
      ] })
    ] }),
    tab === "mine" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto rounded-xl border bg-card p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-5 w-5 text-primary" }),
        "Thông tin truy cập của bạn"
      ] }),
      mine.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) : !cred ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Bạn chưa được cấp tài khoản Sale Work Zalo. Vui lòng liên hệ người quản trị." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        cred.status !== "active" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm rounded-md bg-destructive/10 text-destructive p-2", children: "Thông tin truy cập đang bị tạm khóa. Liên hệ người quản trị." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tài khoản đăng nhập", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: cred.username, className: "font-mono" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": "Sao chép tài khoản", onClick: () => copyText(cred.username, "tài khoản"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mật khẩu", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, type: password ? "text" : "password", value: password ?? "••••••••", className: "font-mono" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": password ? "Ẩn mật khẩu" : "Hiện mật khẩu", disabled: revealing || cred.status !== "active", onClick: reveal, children: password ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              "aria-label": "Sao chép mật khẩu",
              disabled: cred.status !== "active",
              onClick: async () => {
                try {
                  const p = password ?? await swApi.revealPassword();
                  await copyText(p, "mật khẩu");
                } catch (e) {
                  toast.error(errMsg(e));
                }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" })
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full h-12 text-base", onClick: openApp, disabled: !config.data?.enabled || !config.data?.url, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-5 w-5 mr-2" }),
        "Mở Sale Work Zalo"
      ] }),
      config.data?.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: config.data.description })
    ] }),
    tab === "settings" && (canSettings || canCredentials || canAudit) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
      canSettings && /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigSection, {}),
      canCredentials && /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSection, {}),
      canAudit && /* @__PURE__ */ jsxRuntimeExports.jsx(AuditSection, {})
    ] })
  ] });
}
function ConfigSection() {
  const qc = useQueryClient();
  const config = useQuery({ queryKey: ["sw", "config"], queryFn: swApi.config });
  const [name, setName] = reactExports.useState("");
  const [url, setUrl] = reactExports.useState("");
  const [desc, setDesc] = reactExports.useState("");
  const [enabled, setEnabled] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (config.data) {
      setName(config.data.display_name ?? "Sale Work Zalo");
      setUrl(config.data.url ?? "");
      setDesc(config.data.description ?? "");
      setEnabled(!!config.data.enabled);
    }
  }, [config.data]);
  const save = async () => {
    const u = url.trim();
    if (u && !/^https:\/\/\S+$/.test(u)) return toast.error("URL phải bắt đầu bằng https:// và không chứa khoảng trắng");
    setBusy(true);
    try {
      await swApi.saveConfig(name.trim() || "Sale Work Zalo", u, desc.trim(), enabled);
      qc.invalidateQueries({ queryKey: ["sw", "config"] });
      toast.success("Đã lưu cấu hình");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Cấu hình phần mềm" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên hiển thị", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 100, value: name, onChange: (e) => setName(e.target.value) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "URL truy cập phần mềm (https://)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { inputMode: "url", placeholder: "https://…", value: url, onChange: (e) => setUrl(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "shrink-0",
          disabled: !/^https:\/\/\S+$/.test(url.trim()),
          onClick: () => window.open(url.trim(), "_blank", "noopener,noreferrer"),
          children: "Mở thử"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mô tả / hướng dẫn sử dụng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, maxLength: 1e3, value: desc, onChange: (e) => setDesc(e.target.value) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4", checked: enabled, onChange: (e) => setEnabled(e.target.checked) }),
      "Bật liên kết cho nhân viên"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: save, children: busy ? "Đang lưu…" : "Lưu cấu hình" })
  ] });
}
function StaffSection() {
  const qc = useQueryClient();
  const [q, setQ] = reactExports.useState("");
  const [qText, setQText] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("");
  reactExports.useEffect(() => {
    const h = setTimeout(() => setQ(qText), 350);
    return () => clearTimeout(h);
  }, [qText]);
  const staff = useQuery({ queryKey: ["sw", "staff", q], queryFn: () => swApi.staffList(q) });
  const [editing, setEditing] = reactExports.useState(null);
  const rows = reactExports.useMemo(() => (staff.data ?? []).filter((s) => filter === "granted" ? s.granted : filter === "not" ? !s.granted : true), [staff.data, filter]);
  const revoke = async (s) => {
    if (!window.confirm(`Thu hồi thông tin truy cập Sale Work của ${s.full_name ?? "nhân sự này"}?`)) return;
    try {
      await swApi.revokeCredential(s.user_id);
      qc.invalidateQueries({ queryKey: ["sw", "staff"] });
      toast.success("Đã thu hồi");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Quản lý tài khoản nhân sự" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mật khẩu được mã hóa và không bao giờ hiển thị lại cho quản trị — chỉ có thể thay thế bằng mật khẩu mới." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-48", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-9", placeholder: "Tìm theo tên, tài khoản Base, email…", value: qText, onChange: (e) => setQText(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-10 rounded-md border bg-background px-2 text-sm", value: filter, onChange: (e) => setFilter(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "granted", children: "Đã cấp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not", children: "Chưa cấp" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
      rows.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 flex flex-wrap items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: s.full_name ?? s.base_username ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.position ?? s.base_username ?? "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-32 font-mono text-xs", children: s.granted ? s.sw_username : "Chưa có tài khoản" }),
        s.granted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s.sw_status === "active" ? "default" : "secondary", children: s.sw_status === "active" ? "Đã cấp" : "Tạm khóa" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Chưa cấp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(s), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5 mr-1" }),
            s.granted ? "Sửa" : "Cấp tài khoản"
          ] }),
          s.granted && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => revoke(s), children: "Thu hồi" })
        ] })
      ] }, s.user_id)),
      rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Không có nhân sự phù hợp." })
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CredentialDialog,
      {
        staff: editing,
        onClose: () => setEditing(null),
        onSaved: () => {
          setEditing(null);
          qc.invalidateQueries({ queryKey: ["sw", "staff"] });
        }
      }
    )
  ] });
}
function CredentialDialog({ staff, onClose, onSaved }) {
  const [username, setUsername] = reactExports.useState(staff.sw_username ?? "");
  const [password, setPassword] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState(staff.sw_status ?? "active");
  const [busy, setBusy] = reactExports.useState(false);
  const save = async () => {
    if (username.trim().length < 3) return toast.error("Tên tài khoản tối thiểu 3 ký tự");
    if (!staff.granted && password.length < 6) return toast.error("Mật khẩu ban đầu tối thiểu 6 ký tự");
    if (password && password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    setBusy(true);
    try {
      await swApi.saveCredential(staff.user_id, username.trim(), password, status);
      toast.success(staff.granted ? "Đã cập nhật" : "Đã cấp tài khoản");
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      staff.granted ? "Sửa" : "Cấp",
      " tài khoản Sale Work — ",
      staff.full_name ?? ""
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên tài khoản Sale Work *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { maxLength: 100, value: username, onChange: (e) => setUsername(e.target.value), placeholder: "VD: sale.nguyenvana" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: staff.granted ? "Mật khẩu mới (để trống nếu giữ nguyên)" : "Mật khẩu ban đầu *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", autoComplete: "new-password", maxLength: 100, value: password, onChange: (e) => setPassword(e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trạng thái", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-11 w-full rounded-md border bg-background px-3 text-sm", value: status, onChange: (e) => setStatus(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Đang dùng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "locked", children: "Tạm khóa hiển thị" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", disabled: busy, onClick: save, children: busy ? "Đang lưu…" : "Lưu" })
    ] })
  ] }) });
}
function AuditSection() {
  const audit = useQuery({ queryKey: ["sw", "audit"], queryFn: swApi.audit });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-4 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
      "Nhật ký quản trị"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nhật ký không bao giờ chứa giá trị mật khẩu." }),
    (audit.data ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex flex-wrap gap-x-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: fmtDateTime(e.created_at) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.actor_name ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: SW_ACTION_LABEL[e.action] ?? e.action }),
      e.target_name && e.target_name !== e.actor_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
        "→ ",
        e.target_name
      ] })
    ] }, e.id)),
    (audit.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có nhật ký." })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["sale_work.access", "sale_work.manage_settings", "sale_work.manage_credentials"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(SaleWork, {}) });
export {
  SplitComponent as component
};
