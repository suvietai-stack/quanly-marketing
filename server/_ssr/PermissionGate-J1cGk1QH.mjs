import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useCurrentUser } from "./router-CkmTURa-.mjs";
import { au as ShieldOff } from "../_libs/lucide-react.mjs";
function RequirePermission({ perm, children }) {
  const { canAny } = useCurrentUser();
  const keys = Array.isArray(perm) ? perm : [perm];
  if (canAny(...keys)) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "h-12 w-12 text-muted-foreground mb-4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-1", children: "Bạn không có quyền truy cập" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: "Trang/chức năng này yêu cầu quyền chưa được cấp cho tài khoản của bạn. Vui lòng liên hệ Admin nếu bạn cho rằng đây là nhầm lẫn." })
  ] });
}
export {
  RequirePermission as R
};
