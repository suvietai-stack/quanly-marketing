import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useBranding, a as BrandMark } from "./branding-Bpuupoin.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as useAuth, K as readRememberChoice, C as Card, o as CardContent, L as Label, I as Input, M as PasswordInput, N as Checkbox, B as Button, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { i as isFakeEmail, a as authErrorMessage } from "./auth-errors-CN_iHaBn.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as ConfirmationDialog } from "./ConfirmationDialog-DOnaI_eF.mjs";
import "../_libs/seroval.mjs";
import { a8 as UserRound, az as LockKeyhole, a9 as LoaderCircle, a$ as LogIn, b0 as MailQuestionMark } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-query.mjs";
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
const FORGOT_COOLDOWN_MS = 6e4;
const FORGOT_COOLDOWN_KEY = "forgot_password_last_at";
function ForgotPasswordDialog({
  open,
  onClose
}) {
  const [email, setEmail] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const value = email.trim().toLowerCase();
    if (isFakeEmail(value)) {
      toast.error("Địa chỉ email nội bộ không nhận được thư khôi phục. Vui lòng liên hệ Admin để được hỗ trợ.");
      return;
    }
    try {
      const last = Number(localStorage.getItem(FORGOT_COOLDOWN_KEY) || 0);
      if (Date.now() - last < FORGOT_COOLDOWN_MS) {
        toast.error("Bạn vừa yêu cầu khôi phục. Vui lòng đợi khoảng 1 phút rồi thử lại.");
        return;
      }
    } catch {
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        toast.error(authErrorMessage(error, "send"));
        return;
      }
      try {
        localStorage.setItem(FORGOT_COOLDOWN_KEY, String(Date.now()));
      } catch {
      }
      setSent(true);
    } catch {
      toast.error("Không gửi được email lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) {
      setSent(false);
      setEmail("");
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Khôi phục mật khẩu" }) }),
    sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: "Nếu email này thuộc một tài khoản đang hoạt động, hệ thống đã gửi liên kết khôi phục. Vui lòng kiểm tra hộp thư (kể cả mục Spam) và làm theo hướng dẫn." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Đã hiểu" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "forgot-email", children: "Email khôi phục" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "forgot-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "ban@congty.vn", required: true, autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nhập email đã đăng ký với tài khoản của bạn." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Huỷ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { "aria-hidden": "true", className: "mr-1.5 h-4 w-4 motion-safe:animate-spin" }),
          loading ? "Đang gửi..." : "Gửi liên kết khôi phục"
        ] })
      ] })
    ] })
  ] }) });
}
function goBack(navigate) {
  let back = null;
  try {
    back = sessionStorage.getItem("after_login");
    sessionStorage.removeItem("after_login");
  } catch {
  }
  if (back && back.startsWith("/") && !back.startsWith("//") && !back.startsWith("/login")) {
    const [path, qs = ""] = back.split("?");
    navigate({
      to: path,
      search: Object.fromEntries(new URLSearchParams(qs))
    });
  } else navigate({
    to: "/"
  });
}
function LoginPage() {
  const brand = useBranding();
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const currentUserId = useAuth((s) => s.currentUserId);
  const loaded = useAuth((s) => s.loaded);
  const status = useAuth((s) => s.users.find((u) => u.id === s.currentUserId)?.status);
  const [username, setU] = reactExports.useState("");
  const [password, setP] = reactExports.useState("");
  const [remember, setRemember] = reactExports.useState(readRememberChoice);
  const [err, setErr] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [forgotOpen, setForgotOpen] = reactExports.useState(false);
  const [confirmationOpen, setConfirmationOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (currentUserId && loaded && status === "Đang hoạt động" && !loading) goBack(navigate);
  }, [currentUserId, loaded, status, loading, navigate]);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);
    const res = await login(username.trim(), password, remember);
    setLoading(false);
    if (!res.ok) {
      setErr(res.error || "Lỗi đăng nhập");
      return;
    }
    toast.success("Đăng nhập thành công");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "login-page flex min-h-svh items-center justify-center px-4 py-10 sm:py-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-[440px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "login-card overflow-hidden rounded-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-6 py-8 sm:px-10 sm:py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { b: brand, className: "mx-auto mb-5 h-16 w-28 rounded-none text-2xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "login-title text-2xl font-semibold leading-snug", children: brand.app_name === "Base Marketing" ? "Base Sứ Việt" : brand.app_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-relaxed text-muted-foreground", children: brand.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-auto mt-5 block h-1 w-8 rounded-full bg-chipi-orange", "aria-hidden": "true" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "login-username", className: "text-sm font-medium", children: "Tên đăng nhập hoặc email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { "aria-hidden": "true", className: "pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "login-username", className: "login-input h-12 rounded-xl pl-11", value: username, onChange: (e) => setU(e.target.value), autoFocus: true, required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "login-password", className: "text-sm font-medium", children: "Mật khẩu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LockKeyhole, { "aria-hidden": "true", className: "pointer-events-none absolute left-3.5 top-1/2 z-10 size-[18px] -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "login-password", className: "login-input h-12 rounded-xl pl-11", value: password, onChange: (e) => setP(e.target.value), required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "login-remember", checked: remember, onCheckedChange: (v) => setRemember(v === true), className: "mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "login-remember", className: "text-xs sm:text-sm font-normal leading-snug text-muted-foreground cursor-pointer", children: "Ghi nhớ đăng nhập trên thiết bị này (tối đa 90 ngày)" })
        ] }),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive", children: err }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "login-submit h-12 w-full rounded-xl text-sm font-semibold", disabled: loading, children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { "aria-hidden": "true", className: "motion-safe:animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { "aria-hidden": "true" }),
          loading ? "Đang đăng nhập..." : "Đăng nhập"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/70 pt-4 text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "link", className: "h-auto min-h-10 p-0 text-xs font-medium sm:text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", children: "Đăng ký tài khoản mới" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "link", className: "h-auto min-h-10 p-0 text-xs font-medium sm:text-sm", onClick: () => setForgotOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MailQuestionMark, { "aria-hidden": "true", className: "mr-1 h-3.5 w-3.5" }),
            "Quên mật khẩu"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "link", className: "h-auto w-full whitespace-normal text-xs", onClick: () => setConfirmationOpen(true), children: "Gửi lại email xác nhận tài khoản" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPasswordDialog, { open: forgotOpen, onClose: () => setForgotOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmationDialog, { open: confirmationOpen, onClose: () => setConfirmationOpen(false) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-xs leading-relaxed text-muted-foreground", children: brand.org_name })
  ] }) });
}
export {
  LoginPage as component
};
