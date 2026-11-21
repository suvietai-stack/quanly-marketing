import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { F as useAuth, C as Card, o as CardContent, L as Label, M as PasswordInput, B as Button } from "./router-CkmTURa-.mjs";
import { c as changePasswordError } from "./auth-errors-CN_iHaBn.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a9 as LoaderCircle, b6 as KeyRound } from "../_libs/lucide-react.mjs";
function ChangePasswordForm() {
  const changeOwnPassword = useAuth((s) => s.changeOwnPassword);
  const [oldP, setOld] = reactExports.useState("");
  const [n1, setN1] = reactExports.useState("");
  const [n2, setN2] = reactExports.useState("");
  const [err, setErr] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const msg = changePasswordError(oldP, n1, n2);
    if (msg) {
      setErr(msg);
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const res = await changeOwnPassword(oldP, n1);
      if (!res.ok) {
        setErr(res.error || "Không đổi được mật khẩu. Vui lòng thử lại.");
        return;
      }
      toast.success("Đã đổi mật khẩu thành công");
      setOld("");
      setN1("");
      setN2("");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "max-w-md space-y-4 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-old", children: "Mật khẩu hiện tại" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "cp-old", autoComplete: "current-password", value: oldP, onChange: (e) => setOld(e.target.value), required: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-new", children: "Mật khẩu mới" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "cp-new", autoComplete: "new-password", value: n1, onChange: (e) => setN1(e.target.value), required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tối thiểu 8 ký tự, gồm cả chữ cái và chữ số." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-confirm", children: "Xác nhận mật khẩu mới" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { id: "cp-confirm", autoComplete: "new-password", value: n2, onChange: (e) => setN2(e.target.value), required: true })
    ] }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive", children: err }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { "aria-hidden": "true", className: "mr-1.5 h-4 w-4 motion-safe:animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "mr-1.5 h-4 w-4" }),
      loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"
    ] })
  ] }) }) });
}
export {
  ChangePasswordForm as C
};
