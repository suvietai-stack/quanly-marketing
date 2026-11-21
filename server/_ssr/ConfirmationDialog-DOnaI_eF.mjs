import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, I as Input, B as Button, aS as resendConfirmation } from "./router-CkmTURa-.mjs";
import { i as isFakeEmail } from "./auth-errors-CN_iHaBn.mjs";
function ConfirmationDialog({ open, onClose }) {
  const [email, setEmail] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (value) => {
    if (!value) {
      setSent(false);
      setError("");
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận email tài khoản" }) }),
    sent ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-sm text-muted-foreground", children: "Nếu email này có tài khoản cần xác nhận, liên kết đã được gửi. Vui lòng kiểm tra hộp thư và mục Spam. Xác nhận email không thay thế bước Admin duyệt." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: async (event) => {
      event.preventDefault();
      if (busy) return;
      if (isFakeEmail(email)) {
        setError("Vui lòng nhập email thật đã đăng ký.");
        return;
      }
      setBusy(true);
      setError("");
      try {
        await resendConfirmation({ data: { email, redirect: `${window.location.origin}/login` } });
        setSent(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không gửi được email. Vui lòng thử lại.");
      } finally {
        setBusy(false);
      }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirmation-email", children: "Email đã đăng ký" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirmation-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy, children: busy ? "Đang gửi…" : "Gửi lại liên kết xác nhận" })
    ] })
  ] }) });
}
export {
  ConfirmationDialog as C
};
