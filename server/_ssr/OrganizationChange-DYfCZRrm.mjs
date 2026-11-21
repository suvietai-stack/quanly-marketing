import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, B as Button } from "./router-CkmTURa-.mjs";
import { A as AssignmentSpecialties } from "./AppointmentPermissionSummary-jKnCIBGd.mjs";
import { o as orgConfigDiff, d as changeAppointmentSpecialties, f as endAppointment } from "./organization-BsAAQoLM.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
import "./auth-errors-CN_iHaBn.mjs";
import "./branding-Bpuupoin.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "./navigation-BcdDdvEu.mjs";
import "../_libs/lucide-react.mjs";
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
import "./StaffPermissionEditor-9olmztnR.mjs";
import "./select-CHuMrfap.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./design-BrHT-rw4.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
import "./area-BwBtq_yo.mjs";
import "./tabs-CeCgkx-c.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./skeleton-DaUJxWW7.mjs";
function OrganizationChange({ config, id, specialty = false, onClose, onPreview, onApply }) {
  const m = config.memberships.find((x) => x.id === id);
  const [selected, setSelected] = reactExports.useState(m?.specialty_ids ?? []);
  const [preview, setPreview] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [saved, setSaved] = reactExports.useState(false);
  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const title = specialty ? "Nhiệm vụ Marketing" : "Miễn nhiệm";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (v) => !v && !busy && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85dvh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    saved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đã lưu và cập nhật sơ đồ." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Đóng" })
    ] }) : preview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        orgConfigDiff(preview.before, preview.after, (id2) => id2).map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: line }, i)),
        preview.impact.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: p.name }),
          p.changes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            c.label,
            ": ",
            c.before.allowed ? "Có" : "Không",
            " → ",
            c.after.allowed ? "Có" : "Không"
          ] }, c.key))
        ] }, p.user_id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy, onClick: () => run(async () => {
        await onApply(preview, title);
        setSaved(true);
      }), children: [
        "Xác nhận ",
        title.toLocaleLowerCase("vi")
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      specialty ? /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentSpecialties, { selected, onChange: setSelected }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Kết thúc phân công này; giữ lịch sử và quyền từ nguồn khác." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => run(async () => {
        const at = new Date(Date.now() - 2e3).toISOString();
        setPreview(await onPreview(specialty ? changeAppointmentSpecialties(config, id, selected, at) : endAppointment(config, id, at)));
      }), children: "Xem trước" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error })
  ] }) });
}
export {
  OrganizationChange
};
