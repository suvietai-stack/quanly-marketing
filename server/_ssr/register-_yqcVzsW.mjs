import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as useAuth, C as Card, o as CardContent, B as Button, L as Label, I as Input, M as PasswordInput } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { p as passwordIssues } from "./auth-errors-CN_iHaBn.mjs";
import { C as ConfirmationDialog } from "./ConfirmationDialog-DOnaI_eF.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { aU as UserPlus } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-query.mjs";
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
function RegisterPage() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [f, setF] = reactExports.useState({
    fullName: "",
    email: "",
    phone: "",
    desiredPosition: "",
    notes: "",
    username: "",
    password: "",
    confirm: ""
  });
  const [err, setErr] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [registered, setRegistered] = reactExports.useState(false);
  const [confirmationOpen, setConfirmationOpen] = reactExports.useState(false);
  const set = (p) => setF({
    ...f,
    ...p
  });
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (loading) return;
    const issues = passwordIssues(f.password);
    if (issues.length) return setErr(issues[0]);
    if (f.password !== f.confirm) return setErr("Mật khẩu xác nhận không khớp.");
    setLoading(true);
    const res = await register({
      username: f.username.trim(),
      fullName: f.fullName.trim(),
      email: f.email.trim() || void 0,
      phone: f.phone.trim() || void 0,
      desiredPosition: f.desiredPosition.trim() || void 0,
      notes: f.notes.trim() || void 0,
      password: f.password
    });
    setLoading(false);
    if (!res.ok) return setErr(res.error || "Đăng ký thất bại.");
    setRegistered(true);
    setF((previous) => ({
      ...previous,
      password: "",
      confirm: ""
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl mb-3", children: "B" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Đăng ký tài khoản" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Tài khoản mới sẽ chờ Admin duyệt trước khi sử dụng." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
      registered ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Kiểm tra email xác nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-sm text-muted-foreground", children: "Vui lòng mở liên kết xác nhận trong email và chờ quản trị viên phê duyệt. Sau khi hoàn tất cả hai bước, bạn đăng nhập bằng mật khẩu vừa đăng ký, không cần đặt lại mật khẩu." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
            to: "/login"
          }), children: "Về đăng nhập" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmationOpen(true), children: "Gửi lại email xác nhận" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Họ tên *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.fullName, onChange: (e) => set({
            fullName: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: f.email, onChange: (e) => set({
            email: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số điện thoại" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.phone, onChange: (e) => set({
            phone: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bộ phận / vị trí mong muốn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.desiredPosition, onChange: (e) => set({
            desiredPosition: e.target.value
          }), placeholder: "VD: Content Web" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.notes, onChange: (e) => set({
            notes: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên đăng nhập *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.username, onChange: (e) => set({
            username: e.target.value
          }), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "register-password", children: "Mật khẩu *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "register-password", value: f.password, onChange: (e) => set({
            password: e.target.value
          }), required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "8–200 ký tự, gồm chữ cái và chữ số." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "register-confirm", children: "Xác nhận mật khẩu *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "register-confirm", value: f.confirm, onChange: (e) => set({
            confirm: e.target.value
          }), required: true })
        ] }),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded", children: err }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex items-center justify-between gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-sm text-primary hover:underline", children: "Đã có tài khoản? Đăng nhập" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-1.5" }),
            loading ? "Đang xử lý..." : "Đăng ký"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmationDialog, { open: confirmationOpen, onClose: () => setConfirmationOpen(false) })
    ] }) })
  ] }) });
}
export {
  RegisterPage as component
};
