import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card } from "./router-CkmTURa-.mjs";
function FilterBar({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-3 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2", children }) });
}
function EmptyState({
  title,
  hint,
  icon,
  action
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed bg-card/40 py-16 px-6 text-center", children: [
    icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: title }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-1.5 max-w-md mx-auto", children: hint }),
    action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex justify-center", children: action })
  ] });
}
function ComingSoon({ title, items }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block rounded-full bg-warning/15 text-[oklch(0.45_0.13_75)] px-3 py-1 text-xs font-semibold mb-4", children: "Sắp ra mắt" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold tracking-tight", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground max-w-xl mx-auto", children: "Module này sẽ được phát triển ở giai đoạn sau. Hệ thống đã chuẩn bị sẵn nền tảng dữ liệu để mở rộng." }),
    items && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-5 inline-flex flex-col gap-1.5 text-sm text-left text-muted-foreground", children: items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary/60" }),
      " ",
      i
    ] }, i)) })
  ] });
}
export {
  ComingSoon as C,
  EmptyState as E,
  FilterBar as F
};
