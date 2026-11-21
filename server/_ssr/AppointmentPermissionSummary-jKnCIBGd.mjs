import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, cg as titleRolesApi, l as Badge, ch as auditReasonLabel, N as Checkbox, aY as PERMISSIONS } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
function AppointmentPermissionSummary({ titleId, config }) {
  const { user } = useCurrentUser();
  const q = useQuery({ queryKey: ["title-role-links", user?.id], queryFn: titleRolesApi.read, retry: false });
  const title = config.titles.find((t) => t.id === titleId);
  if (!titleId) return null;
  if (title?.source === "biz_positions") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Quyền Kinh doanh giữ nguyên theo bổ nhiệm nghiệp vụ." });
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang đối chiếu quyền tự nhận…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-sm text-destructive", children: [
    "Chưa xác minh được quyền tự nhận: ",
    q.error.message
  ] });
  const audits = q.data.link_audits?.filter((a) => a.title_id === titleId) ?? [];
  const label = (key) => PERMISSIONS.find((p) => p.key === key)?.label ?? key;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Quyền tự nhận khi bổ nhiệm có hiệu lực" }),
    !audits.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Chưa có liên kết Role được kiểm chứng." }),
    audits.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        a.role_name,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: a.enabled.length ? `${a.enabled.length} quyền thực tế` : "Chưa cấp quyền" })
      ] }),
      a.enabled.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: a.enabled.map(label).join(" · ") }),
      !a.signature_valid && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Role đã thay đổi — cần kiểm chứng và xác nhận lại." }),
      a.blocked.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-muted-foreground", children: [
          a.blocked.length,
          " quyền còn chờ"
        ] }),
        a.blocked.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-1 text-xs", children: [
          label(p.key),
          " — ",
          auditReasonLabel(p.reason)
        ] }, p.key))
      ] })
    ] }, a.role_id))
  ] });
}
function AssignmentSpecialties({ selected, onChange }) {
  const { user, isSuperAdmin } = useCurrentUser();
  const q = useQuery({ queryKey: ["assignment-specialty-catalog", user?.id], queryFn: async () => {
    const [{ data, error }, roles] = await Promise.all([supabase.rpc("mkt_specialty_permission_preview"), titleRolesApi.read()]);
    if (error) throw error;
    return data.map((s) => ({ ...s, granted: roles.roles.find((r) => r.id === s.role_id)?.checks.filter((c) => c.ready).map((c) => c.key) ?? [] }));
  }, enabled: isSuperAdmin, retry: false });
  if (!isSuperAdmin) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: true, className: "border-t pt-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Nhiệm vụ Marketing (nếu có)" }),
    q.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: q.error.message }),
    q.data?.filter((s) => ["content_web", "seo", "local_seo", "social", "video"].includes(s.id)).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selected.includes(s.id), onCheckedChange: (v) => onChange(v === true ? [...selected, s.id] : selected.filter((id) => id !== s.id)) }),
        s.name,
        " · ",
        s.granted.length,
        " quyền"
      ] }),
      selected.includes(s.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pb-2 text-xs text-muted-foreground", children: s.granted.length ? s.granted.map((k) => PERMISSIONS.find((p) => p.key === k)?.label ?? k).join(" · ") : "Chưa có quyền được kiểm chứng; không tự cấp quyền." })
    ] }, s.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chỉ quyền cá nhân đã kiểm chứng của nhiệm vụ tự cấp theo thời hạn phân công; quyết định chuyên môn hiện có giữ nguyên." })
  ] });
}
export {
  AssignmentSpecialties as A,
  AppointmentPermissionSummary as a
};
