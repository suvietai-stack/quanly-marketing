import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { o as orderBySpecialty, r as resolvePickerSelection } from "./marketingSpecialties-CqUITqGr.mjs";
function SpecialtyStaffPicker({
  specialty,
  value,
  valueId,
  onChange,
  people,
  placeholder = "—"
}) {
  const q = useQuery({
    queryKey: ["mkt-candidates", specialty],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("mkt_specialty_candidates", { _specialty: specialty });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 6e4
  });
  const candidates = q.data ?? [];
  const { matched, rest } = orderBySpecialty(people, candidates);
  const candInfo = (id) => candidates.find((c) => c.user_id === id);
  const byId = new Map(people.map((p) => [p.id, p]));
  const { selectedId, legacyUnknown } = resolvePickerSelection(people, value, valueId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        value: selectedId ?? (legacyUnknown ? "_legacy" : "_"),
        onValueChange: (v) => {
          if (v === "_legacy") return;
          if (v === "_") return onChange(void 0, void 0);
          const p = byId.get(v);
          if (p) onChange(p.name, p.id);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: placeholder }),
            legacyUnknown && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "_legacy", children: [
              value,
              " (chưa định danh — chọn lại để gắn ID)"
            ] }),
            matched.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Chuyên môn phù hợp" }),
            matched.map((p) => {
              const info = candInfo(p.id);
              const ctx = [info?.unit_name, info?.title_name].filter(Boolean).join(" · ");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
                p.name,
                ctx ? ` (${ctx})` : ""
              ] }, p.id);
            }),
            matched.length > 0 && rest.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Nhân sự khác" }),
            rest.map((p) => {
              const info = candInfo(p.id);
              const ctx = [info?.unit_name, info?.title_name].filter(Boolean).join(" · ");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
                p.name,
                ctx ? ` (${ctx})` : ""
              ] }, p.id);
            })
          ] })
        ]
      }
    ),
    !q.isPending && !q.error && matched.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Chưa có nhân sự phù hợp — bạn vẫn có thể chọn người khác." })
  ] });
}
export {
  SpecialtyStaffPicker as S
};
