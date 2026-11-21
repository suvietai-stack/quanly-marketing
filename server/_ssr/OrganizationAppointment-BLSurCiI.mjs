import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as AppointmentPermissionSummary, A as AssignmentSpecialties } from "./AppointmentPermissionSummary-jKnCIBGd.mjs";
import { D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, B as Button, L as Label, I as Input, N as Checkbox } from "./router-CkmTURa-.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { m as membershipEffective, o as orgConfigDiff, u as unitTitles, g as appointmentEligible, h as marketingUnit, i as appointmentDraft } from "./organization-BsAAQoLM.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { q as Check, A as ArrowLeft, f as Search } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./StaffPermissionEditor-9olmztnR.mjs";
import "./design-BrHT-rw4.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
import "./area-BwBtq_yo.mjs";
import "./tabs-CeCgkx-c.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./skeleton-DaUJxWW7.mjs";
function OrganizationAppointment({ target, config, staff, onClose, onPreview, onApply }) {
  const [titleId, setTitleId] = reactExports.useState(target.titleId ?? "");
  const [query, setQuery] = reactExports.useState("");
  const [picked, setPicked] = reactExports.useState([]);
  const [mode, setMode] = reactExports.useState(target.mode ?? "primary");
  const [specialties, setSpecialties] = reactExports.useState([]);
  const [preview, setPreview] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [saved, setSaved] = reactExports.useState(false);
  const title = config.titles.find((t) => t.id === titleId);
  const single = title?.kind === "manager" && title.capacity === 1;
  const unitName = config.units.find((u) => u.id === target.unitId)?.name ?? "";
  const nameOf = (id) => staff.find((s) => s.id === id)?.name ?? id;
  const existing = config.memberships.filter((m) => membershipEffective(m) && picked.includes(m.user_id) && m.unit_id !== target.unitId);
  const rows = staff.filter((s) => s.name.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")));
  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (open) => !open && !busy && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85dvh] max-w-xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      saved ? "Đã bổ nhiệm" : preview ? "Xem trước bổ nhiệm" : "Bổ nhiệm / Thêm nhân sự",
      " — ",
      unitName
    ] }) }),
    saved ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-primary" }),
        "Đã lưu phân công và làm mới sơ đồ."
      ] }),
      picked.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        nameOf(id),
        " · ",
        title?.name
      ] }, id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Đóng" })
    ] }) : preview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      orgConfigDiff(preview.before, preview.after, nameOf).map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: line }, i)),
      preview.impact.map((person) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "font-medium text-sm", children: person.name }),
        person.changes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs py-1", children: [
          c.label,
          ": ",
          c.before.allowed ? "Có" : "Không",
          " → ",
          c.after.allowed ? "Có" : "Không"
        ] }, c.key))
      ] }, person.user_id)),
      !preview.impact.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không thay đổi quyền hiệu lực; các nguồn quyền khác được giữ nguyên." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy, variant: "outline", onClick: () => setPreview(null), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
          "Quay lại"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => run(async () => {
          await onApply(preview, `Bổ nhiệm ${picked.map(nameOf).join(", ")} tại ${unitName} — ${title?.name}`);
          setSaved(true);
        }), children: busy ? "Đang lưu…" : "Xác nhận bổ nhiệm" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        "Chức vụ tại ",
        unitName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: titleId, disabled: !!target.titleId, onValueChange: (v) => {
        setTitleId(v);
        setPicked([]);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Chức vụ bổ nhiệm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn chức vụ" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: unitTitles(config, target.unitId).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.name }, t.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhân sự bổ nhiệm", placeholder: "Tìm theo tên", value: query, onChange: (e) => setQuery(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-60 overflow-y-auto border rounded-md", children: [
        rows.map((s) => {
          const assignments = config.memberships.filter((m) => m.user_id === s.id && membershipEffective(m));
          const eligible = appointmentEligible(s.status);
          const already = assignments.some((m) => m.unit_id === target.unitId && m.title_id === titleId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-3 items-start border-b px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { "aria-label": `Chọn ${s.name} ${s.id.slice(-6)}`, disabled: !eligible || !titleId || already, checked: picked.includes(s.id), onCheckedChange: (v) => setPicked((ids) => v === true ? single ? [s.id] : [...ids, s.id] : ids.filter((id) => id !== s.id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block font-medium", children: [
                s.name,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "· ",
                  s.id.slice(-6)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: already ? "Đang giữ vị trí này" : eligible ? assignments.map((m) => config.units.find((u) => u.id === m.unit_id)?.name).join(", ") || "Chưa phân công" : `Không thể bổ nhiệm: ${s.status}` })
            ] })
          ] }, s.id);
        }),
        !rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-sm text-muted-foreground", children: "Không có nhân sự phù hợp." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Đã chọn ",
        picked.length,
        " người",
        single ? " · Vị trí một người" : ""
      ] }),
      existing.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phân công hiện có" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mode, onValueChange: (v) => setMode(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Hình thức bổ nhiệm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "primary", children: "Chọn hình thức" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "concurrent", children: "Kiêm nhiệm — giữ phân công hiện có" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transfer", children: "Điều chuyển — kết thúc phân công chính" })
          ] })
        ] }),
        mode === "transfer" && existing.filter((m) => m.kind !== "concurrent").map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-destructive", children: [
          "Kết thúc: ",
          nameOf(m.user_id),
          " · ",
          config.units.find((u) => u.id === m.unit_id)?.name,
          " · ",
          config.titles.find((t) => t.id === m.title_id)?.name
        ] }, m.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AppointmentPermissionSummary, { titleId, config }),
      marketingUnit(config, target.unitId) && title?.source !== "biz_positions" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentSpecialties, { selected: specialties, onChange: setSpecialties }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !titleId || !picked.length || existing.some((m) => m.kind !== "concurrent") && mode === "primary", onClick: () => run(async () => {
        setPreview(await onPreview(appointmentDraft(config, target.unitId, titleId, picked, mode, specialties, new Date(Date.now() - 2e3).toISOString())));
      }), children: busy ? "Đang xem trước…" : "Xem trước" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-sm text-destructive", children: [
      error,
      " Vui lòng xem trước lại."
    ] })
  ] }) });
}
export {
  OrganizationAppointment
};
