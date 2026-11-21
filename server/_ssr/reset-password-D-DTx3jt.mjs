import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { p as passwordIssues, a as authErrorMessage } from "./auth-errors-CN_iHaBn.mjs";
import { u as useBranding, a as BrandMark } from "./branding-Bpuupoin.mjs";
import { b2 as onRecoveryChange, C as Card, o as CardContent, B as Button, L as Label, M as PasswordInput, b3 as hasRecoverySession, b4 as clearRecoverySession } from "./router-CkmTURa-.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { a9 as LoaderCircle, b6 as KeyRound } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
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
function ResetPasswordPage() {
  const brand = useBranding();
  const navigate = useNavigate();
  const [phase, setPhase] = reactExports.useState("checking");
  const [n1, setN1] = reactExports.useState("");
  const [n2, setN2] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    const check = async () => {
      const valid = await hasRecoverySession();
      if (active) setPhase(valid ? "ready" : "invalid");
    };
    const unsubscribe = onRecoveryChange(() => void check());
    void check();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (loading || phase !== "ready") return;
    const issues = passwordIssues(n1);
    if (issues.length) {
      setErr(issues[0]);
      return;
    }
    if (n1 !== n2) {
      setErr("Mật khẩu xác nhận không khớp.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      if (!await hasRecoverySession()) {
        setPhase("invalid");
        return;
      }
      const {
        error
      } = await supabase.auth.updateUser({
        password: n1
      });
      if (error) {
        setErr(authErrorMessage(error, "password"));
        return;
      }
      await supabase.auth.signOut();
      clearRecoverySession();
      setPhase("done");
      toast.success("Đã đặt lại mật khẩu thành công");
    } catch {
      setErr("Không cập nhật được mật khẩu lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "login-page flex min-h-svh items-center justify-center px-4 py-10 sm:py-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-[440px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "login-card overflow-hidden rounded-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-6 py-8 sm:px-10 sm:py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { b: brand, className: "mx-auto mb-5 h-16 w-28 rounded-none text-2xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "login-title text-2xl font-semibold leading-snug", children: "Đặt lại mật khẩu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-auto mt-5 block h-1 w-8 rounded-full bg-chipi-orange", "aria-hidden": "true" })
      ] }),
      phase === "checking" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Đang kiểm tra liên kết khôi phục…" }),
      phase === "invalid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: "Liên kết khôi phục không hợp lệ, đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới từ màn hình đăng nhập." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Về trang đăng nhập" }) })
      ] }),
      phase === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: "Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập lại bằng mật khẩu mới." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => navigate({
          to: "/login"
        }), children: "Đăng nhập lại" })
      ] }),
      phase === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rp-new", className: "text-sm font-medium", children: "Mật khẩu mới" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "rp-new", className: "login-input h-12 rounded-xl", autoComplete: "new-password", value: n1, onChange: (e) => setN1(e.target.value), required: true, autoFocus: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tối thiểu 8 ký tự, gồm cả chữ cái và chữ số." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rp-confirm", className: "text-sm font-medium", children: "Xác nhận mật khẩu mới" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "rp-confirm", className: "login-input h-12 rounded-xl", autoComplete: "new-password", value: n2, onChange: (e) => setN2(e.target.value), required: true })
        ] }),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive", children: err }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "login-submit h-12 w-full rounded-xl text-sm font-semibold", disabled: loading, children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { "aria-hidden": "true", className: "motion-safe:animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { "aria-hidden": "true" }),
          loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-xs leading-relaxed text-muted-foreground", children: brand.org_name })
  ] }) });
}
export {
  ResetPasswordPage as component
};
