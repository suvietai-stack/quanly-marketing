import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, F as useAuth, P as PageHeader, B as Button, l as Badge, I as Input, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, aY as PERMISSIONS, aZ as PERMISSION_DEPENDS, N as Checkbox } from "./router-CkmTURa-.mjs";
import { R as RoleActualSources, S as StaffPermissionEditor } from "./StaffPermissionEditor-9olmztnR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { a as applySpecialtyDiff } from "./marketingSpecialties-CqUITqGr.mjs";
import { a as areaUnitIds, D as DISTRIBUTION_UNIT } from "./area-BwBtq_yo.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Skeleton } from "./skeleton-DaUJxWW7.mjs";
import { b3 as Network, w as Users, aj as Settings2, r as Eye, f as Search, a7 as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
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
import "./select-CHuMrfap.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./design-BrHT-rw4.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
const norm = (s) => s.trim().toLocaleLowerCase("vi");
function isManagerTitle(name) {
  const n = norm(name);
  return n.includes("trưởng") || n.includes("giám đốc");
}
function titleKind(t) {
  return t.kind ?? (isManagerTitle(t.name) ? "manager" : "staff");
}
function titleLevel(t) {
  return t.level ?? (titleKind(t) === "manager" ? 2 : 0);
}
function slotCapacity(t) {
  return t.capacity ?? (titleKind(t) === "manager" ? 1 : 0);
}
function unitTitles(config, unitId) {
  return config.titles.filter((t) => t.active && t.unit_id === unitId && t.source !== "biz_positions");
}
function slotHolders(config, unitId, titleId) {
  return config.memberships.filter((m) => membershipEffective(m) && m.unit_id === unitId && m.title_id === titleId);
}
function slotHistory(config, unitId, titleId) {
  return config.memberships.filter((m) => m.unit_id === unitId && m.title_id === titleId).sort((a, b) => Date.parse(b.starts_at ?? "") - Date.parse(a.starts_at ?? ""));
}
const membershipEffective = (m, now = (/* @__PURE__ */ new Date()).toISOString()) => m.active && m.status !== "cancelled" && (!m.starts_at || m.starts_at <= now) && (!m.ends_at || m.ends_at > now);
function membershipKind(m) {
  return m.kind ?? "primary";
}
function unitDescendants(config, unitId) {
  const out = [unitId];
  for (let i = 0; i < out.length; i++) {
    for (const u of config.units) if (u.parent_id === out[i] && !out.includes(u.id)) out.push(u.id);
  }
  return out;
}
function unitPath(config, unitId) {
  const parts = [];
  let cur = config.units.find((u) => u.id === unitId);
  const seen = /* @__PURE__ */ new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.unshift(cur.name);
    cur = config.units.find((u) => u.id === cur?.parent_id);
  }
  return parts.join(" / ");
}
const kindLabel = (k) => k === "manager" ? "Quản lý" : "Nhân viên";
function orgConfigDiff(before, after, nameOf) {
  if (!before || !after) return [];
  const out = [];
  const unitName = (c, id) => c.units.find((u) => u.id === id)?.name ?? "";
  const titleName = (c, id) => c.titles.find((t) => t.id === id)?.name ?? "";
  for (const u of after.units) {
    const b = before.units.find((x) => x.id === u.id);
    if (!b) {
      out.push(`Thêm đơn vị ${u.name}`);
      continue;
    }
    if (b.name !== u.name) out.push(`Đổi tên đơn vị ${b.name} → ${u.name}`);
    if (b.active !== u.active) out.push(`${u.active ? "Kích hoạt" : "Ngừng"} đơn vị ${u.name}`);
    if ((b.parent_id ?? "") !== (u.parent_id ?? "")) out.push(`Chuyển đơn vị ${u.name} sang ${unitName(after, u.parent_id) || "cấp gốc"}`);
  }
  for (const u of before.units) if (!after.units.some((x) => x.id === u.id)) out.push(`Xóa đơn vị ${u.name}`);
  for (const t of after.titles) {
    const b = before.titles.find((x) => x.id === t.id);
    if (!b) {
      out.push(`Thêm chức danh ${t.name} (cấp ${titleLevel(t)}, ${kindLabel(titleKind(t))})`);
      continue;
    }
    if (b.name !== t.name) out.push(`Đổi tên chức danh ${b.name} → ${t.name}`);
    if (titleLevel(b) !== titleLevel(t)) out.push(`Đổi cấp bậc ${t.name}: ${titleLevel(b)} → ${titleLevel(t)}`);
    if (titleKind(b) !== titleKind(t)) out.push(`Đổi loại vị trí ${t.name}: ${kindLabel(titleKind(b))} → ${kindLabel(titleKind(t))}`);
    if ((b.unit_id ?? "") !== (t.unit_id ?? "")) out.push(`Chuyển chức danh ${t.name} sang ${unitName(after, t.unit_id) || "chức danh chung"}`);
    if (b.active !== t.active) out.push(`${t.active ? "Kích hoạt" : "Ngừng"} chức danh ${t.name}`);
  }
  for (const t of before.titles) if (!after.titles.some((x) => x.id === t.id)) out.push(`Xóa chức danh ${t.name}`);
  for (const m of after.memberships) {
    const b = before.memberships.find((x) => x.id === m.id);
    const where = `${titleName(after, m.title_id) || "Chưa có chức danh"} · ${unitName(after, m.unit_id)}`;
    if (!b) {
      if (m.active) out.push(`Gán ${nameOf(m.user_id)} vào ${where}`);
      continue;
    }
    if (b.active && !m.active) out.push(`Bỏ gán ${nameOf(m.user_id)} khỏi ${where}`);
    if (!b.active && m.active) out.push(`Gán lại ${nameOf(m.user_id)} vào ${where}`);
    if ((b.duties ?? "") !== (m.duties ?? "")) out.push(`Đổi nhiệm vụ của ${nameOf(m.user_id)} tại ${where}`);
  }
  return out;
}
function effectivePositionHolders(rows, unitId, titleId, at) {
  return [...new Set(rows.filter((m) => m.active && (m.status ?? "active") === "active" && m.unit_id === unitId && m.title_id === titleId && (!m.starts_at || Date.parse(m.starts_at) <= at) && (!m.ends_at || Date.parse(m.ends_at) > at)).map((m) => m.user_id))];
}
function positionPairs(config) {
  const ids = [
    ...config.titles.filter((t) => t.active && t.unit_id && t.source !== "biz_positions").map((t) => [t.unit_id, t.id]),
    ...config.memberships.filter((m) => m.title_id).map((m) => [m.unit_id, m.title_id])
  ];
  const seen = /* @__PURE__ */ new Set();
  return ids.flatMap(([unitId, titleId]) => {
    const unit = config.units.find((u) => u.id === unitId && u.active);
    const title = config.titles.find((t) => t.id === titleId && t.active && t.source !== "biz_positions");
    if (!unit || !title) return [];
    const key = JSON.stringify([unit.id, title.id]);
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ unit, title }];
  });
}
function appointmentEligible(status) {
  return status === "Đang hoạt động";
}
function marketingUnit(config, unitId) {
  const seen = /* @__PURE__ */ new Set();
  let unit = config.units.find((u) => u.id === unitId);
  while (unit && !seen.has(unit.id)) {
    seen.add(unit.id);
    if (unit.kind === "block") return unit.id === "b5e00000-0000-4000-8000-000000000001" || unit.code === "marketing";
    unit = config.units.find((u) => u.id === unit?.parent_id);
  }
  return false;
}
function appointmentDraft(config, unitId, titleId, users, mode, specialtyIds, effectiveAt = (/* @__PURE__ */ new Date()).toISOString(), slotId) {
  const title = config.titles.find((t) => t.id === titleId && t.active);
  if (!title || title.unit_id && title.unit_id !== unitId) throw new Error("Chức vụ không thuộc đơn vị này.");
  const ids = [...new Set(users)];
  if (!ids.length) throw new Error("Chọn nhân sự để bổ nhiệm.");
  const capacity = title.kind === "manager" ? title.capacity ?? 0 : 0;
  const held = effectivePositionHolders(config.memberships, unitId, titleId, Date.parse(effectiveAt)).length;
  if (capacity > 0 && held + ids.length > capacity) throw new Error(capacity === 1 ? "Vị trí quản lý chỉ có một người; cần kết thúc bổ nhiệm hiện tại trước." : "Vị trí quản lý đã đủ người theo sức chứa đã đặt.");
  const primaryElsewhere = config.memberships.filter((m) => ids.includes(m.user_id) && membershipEffective(m, effectiveAt) && membershipKind(m) === "primary" && m.unit_id !== unitId);
  if (primaryElsewhere.length && mode === "primary") throw new Error("Chọn Điều chuyển hoặc Kiêm nhiệm cho nhân sự đang thuộc đơn vị khác.");
  if (specialtyIds.length && (!marketingUnit(config, unitId) || title.source === "biz_positions")) throw new Error("Nhiệm vụ Marketing chỉ áp dụng trong Khối Marketing.");
  let next = structuredClone(config);
  const now = effectiveAt;
  if (mode === "transfer") next.memberships = next.memberships.map((m) => primaryElsewhere.some((p) => p.id === m.id) ? { ...m, active: false, ends_at: now } : m);
  for (const userId of ids) {
    if (next.memberships.some((m) => membershipEffective(m, effectiveAt) && m.user_id === userId && m.unit_id === unitId && m.title_id === titleId)) throw new Error("Nhân sự đã có phân công này.");
    const beforeIds = new Set(next.memberships.map((m) => m.id));
    next.memberships.push({ id: crypto.randomUUID(), user_id: userId, unit_id: unitId, title_id: titleId, active: true, starts_at: now });
    next.memberships = next.memberships.map((m) => beforeIds.has(m.id) ? { ...m, ...m.ends_at !== config.memberships.find((x) => x.id === m.id)?.ends_at ? { ends_at: now } : {} } : { ...m, starts_at: now, kind: mode === "concurrent" ? "concurrent" : "primary", specialty_ids: specialtyIds });
  }
  return next;
}
function endAppointment(config, id, at = (/* @__PURE__ */ new Date()).toISOString()) {
  const m = config.memberships.find((x) => x.id === id);
  if (!m || !m.active) throw new Error("Phân công không còn hiệu lực.");
  return { ...config, memberships: config.memberships.map((x) => x.id !== id ? x : x.starts_at && x.starts_at > at ? { ...x, active: false, status: "cancelled" } : { ...x, active: false, ends_at: at }) };
}
function changeAppointmentSpecialties(config, id, specialties, at = (/* @__PURE__ */ new Date()).toISOString()) {
  const m = config.memberships.find((x) => x.id === id);
  if (!m?.title_id || !membershipEffective(m, at) || !marketingUnit(config, m.unit_id)) throw new Error("Chỉ sửa nhiệm vụ của phân công Marketing đang hiệu lực.");
  const next = endAppointment(config, id, at);
  next.memberships.push({ ...m, id: crypto.randomUUID(), starts_at: at, ends_at: m.ends_at, active: true, status: "active", specialty_ids: [...new Set(specialties)], specialty_signatures: void 0 });
  return next;
}
const taskRoles = /* @__PURE__ */ new Set(["role-v2-task-content-web", "role-v2-task-seo", "role-v2-task-local-seo", "role-v2-task-social", "role-v2-task-video"]);
function useSpecialties() {
  const { user } = useCurrentUser();
  return useQuery({ queryKey: ["mkt-specialties", user?.id], queryFn: async () => {
    const [s, a] = await Promise.all([
      supabase.from("mkt_specialties").select("id,name,active,sort,role_id").order("sort"),
      supabase.from("mkt_staff_specialties").select("user_id,specialty_id,state,origin,is_primary,source")
    ]);
    if (s.error) throw s.error;
    if (a.error) throw a.error;
    return { specs: s.data ?? [], rows: a.data ?? [] };
  } });
}
async function save(users, add, remove, primary) {
  const { error } = await supabase.rpc("mkt_specialty_save", { _users: users, _add: add, _remove: remove, _primary: primary ?? void 0 });
  if (error) throw error;
}
function usePermissionPreview() {
  return useQuery({ queryKey: ["mkt-permission-preview"], queryFn: async () => {
    const { data, error } = await supabase.rpc("mkt_specialty_permission_preview");
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }, staleTime: 6e4 });
}
function SpecialtyPermissionNotes({ selected }) {
  const q = usePermissionPreview();
  if (q.isPending || q.error || !q.data) return null;
  const rows = q.data.filter((p) => selected.has(p.id));
  if (!rows.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 rounded-lg border bg-muted/40 p-3 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Quyền tự nhận theo nhiệm vụ" }),
    rows.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: p.name }),
      p.role_name ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " (Role ",
        p.role_name,
        ")"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " (chưa liên kết Role)" }),
      ": tự cấp ",
      p.granted.length,
      " chức năng đã kiểm chứng",
      p.blocked.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "; ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-600 dark:text-amber-400", children: [
          p.blocked.length,
          " quyền chưa kích hoạt"
        ] }),
        " (chưa kiểm chứng phạm vi)"
      ] })
    ] }, p.id))
  ] });
}
function StaffSpecialties({ userId }) {
  const { isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const q = useSpecialties();
  const eligible = useQuery({ queryKey: ["marketing-task-eligible", userId], queryFn: async () => {
    const { data, error } = await supabase.rpc("marketing_task_eligibility", { _target: userId });
    if (error) throw error;
    return data === true;
  }, retry: false });
  const current = reactExports.useMemo(() => new Set((q.data?.rows ?? []).filter((r) => r.user_id === userId && r.state === "active").map((r) => r.specialty_id)), [q.data, userId]);
  const curPrimary = q.data?.rows.find((r) => r.user_id === userId && r.is_primary)?.specialty_id ?? "";
  const [draft, setDraft] = reactExports.useState(null);
  const [primary, setPrimary] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const sel = draft ?? current;
  const prim = primary ?? curPrimary;
  if (q.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Đang tải chuyên môn…" });
  if (q.error) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-destructive", children: "Không tải được chuyên môn." });
  const origin = (id) => q.data?.rows.find((r) => r.user_id === userId && r.specialty_id === id);
  const onSave = async () => {
    const { add, remove } = applySpecialtyDiff(current, sel);
    setBusy(true);
    try {
      await save([userId], add, remove, prim || null);
      toast.success("Đã lưu chuyên môn");
      setDraft(null);
      setPrimary(null);
      await qc.invalidateQueries({ queryKey: ["mkt-specialties"] });
      await qc.invalidateQueries({ queryKey: ["base-effective"] });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-4", children: [
    eligible.data === false && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có bổ nhiệm Marketing hiệu lực; không thể cấp nhiệm vụ mới." }),
    q.data?.specs.filter((s) => s.active).map((s) => {
      const o = origin(s.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: `sp-${s.id}`, checked: sel.has(s.id), disabled: !isSuperAdmin || !sel.has(s.id) && taskRoles.has(s.role_id ?? "") && eligible.data !== true, onCheckedChange: (v) => {
          const n = new Set(sel);
          if (v) n.add(s.id);
          else n.delete(s.id);
          setDraft(n);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `sp-${s.id}`, className: "flex-1 text-sm", children: s.name }),
        o && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: o.state === "removed" ? "Đã bỏ" : o.origin === "auto" ? "Tự nhận diện từ Role" : "Admin chỉnh" }),
        sel.has(s.id) && isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: prim === s.id ? "secondary" : "ghost", onClick: () => setPrimary(prim === s.id ? "" : s.id), children: prim === s.id ? "Chuyên môn chính" : "Đặt chính" })
      ] }, s.id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpecialtyPermissionNotes, { selected: sel }),
    isSuperAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !draft && primary === null, onClick: onSave, children: "Lưu chuyên môn" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chỉ Super Admin được sửa chuyên môn." })
  ] });
}
const B2B_CENTER = "624e6e56-eeab-42d5-85af-6af284e72f34";
const BTC_CENTER = "showroom-block";
const RETAIL_SYSTEM = "76fcf3a9-8561-4e2a-be3c-c6724a6310fb";
const HANOI_SHOWROOM = "d970fba4-4b4c-48e4-9b15-89e05312afc1";
const B2B_POSITIONS = [
  {
    name: "Giám đốc Trung tâm Kinh doanh B2B",
    code: "b2b-director",
    roleId: "role-v2-b2b-director",
    kind: "manager",
    level: 3,
    capacity: 1
  },
  {
    name: "Trưởng phòng Kinh doanh B2B",
    code: "b2b-head",
    roleId: "role-v2-b2b-head",
    kind: "manager",
    level: 2,
    capacity: 1
  },
  {
    name: "Trưởng nhóm Kinh doanh B2B",
    code: "b2b-team",
    roleId: "role-v2-b2b-team",
    kind: "manager",
    level: 1,
    capacity: 1
  },
  {
    name: "Nhân viên Kinh doanh B2B",
    code: "b2b-staff",
    roleId: "role-v2-b2b-staff",
    kind: "staff",
    level: 0,
    capacity: 0
  }
];
const DISTRIBUTION_POSITION_ROLES = [
  {
    name: "Giám đốc Trung tâm Kinh doanh Phân Phối",
    roleId: "role-v2-distribution-director",
    code: "distribution-director",
    kind: "manager",
    level: 3,
    capacity: 1
  },
  {
    name: "Trưởng phòng Kinh doanh Phân Phối",
    roleId: "role-v2-distribution-head",
    code: "distribution-head",
    kind: "manager",
    level: 2,
    capacity: 1
  },
  {
    name: "Trưởng nhóm Kinh doanh Phân Phối",
    roleId: "role-v2-distribution-team",
    code: "distribution-team",
    kind: "manager",
    level: 1,
    capacity: 1
  },
  {
    name: "Nhân viên Kinh doanh Phân Phối",
    roleId: "role-v2-distribution-staff",
    code: "distribution-staff",
    kind: "staff",
    level: 0,
    capacity: 0
  }
];
const BTC_DIRECTOR = {
  name: "Giám đốc Trung tâm Kinh doanh BTC",
  code: "btc-director",
  roleId: "role-v2-btc-director",
  kind: "manager",
  level: 3,
  capacity: 1
};
const SHOWROOM = [
  {
    name: "Cửa hàng trưởng",
    code: "showroom-manager",
    roleId: "role-v2-showroom-manager",
    kind: "manager",
    level: 2,
    capacity: 1
  },
  {
    name: "Nhân viên Showroom",
    code: "showroom-staff",
    roleId: "role-v2-showroom-staff",
    kind: "staff",
    level: 0,
    capacity: 0
  }
];
function centerPositionDefinitions(config, unitId) {
  const unit = config.units.find((u) => u.id === unitId && u.active);
  if (!unit) return [];
  if (unitId === BTC_CENTER) return [BTC_DIRECTOR];
  if (areaUnitIds(config.units, DISTRIBUTION_UNIT).has(unitId))
    return DISTRIBUTION_POSITION_ROLES.filter(
      (p) => unitId === DISTRIBUTION_UNIT && p.level === 3 || unit.kind === "department" && [2, 0].includes(p.level) || unit.kind === "team" && [1, 0].includes(p.level)
    );
  if (areaUnitIds(config.units, B2B_CENTER).has(unitId))
    return B2B_POSITIONS.filter(
      (p) => unitId === B2B_CENTER && p.level === 3 || unit.kind === "department" && [2, 0].includes(p.level) || unit.kind === "team" && [1, 0].includes(p.level)
    );
  const btcActive = config.units.some(
    (u) => u.id === BTC_CENTER && u.active && u.kind === "block"
  );
  const parent = config.units.find((u) => u.id === unit.parent_id && u.active);
  if (btcActive && unit.kind === "department" && /showroom|showrom/i.test(unit.name) && (parent?.id === BTC_CENTER || parent?.id === RETAIL_SYSTEM && parent.kind === "system" && parent.parent_id === BTC_CENTER))
    return [...SHOWROOM];
  return [];
}
function missingCenterPositions(config, unitId) {
  return centerPositionDefinitions(config, unitId).some(
    (p) => !config.titles.some((t) => t.unit_id === unitId && t.code === p.code && t.active)
  );
}
function centerPositionSetup(config, unitId, roles, mapping) {
  const definitions = centerPositionDefinitions(config, unitId);
  if (!definitions.length) throw new Error("Đơn vị không thuộc vị trí trung tâm hợp lệ.");
  const titles = [...config.titles];
  const commands = [];
  for (const p of definitions) {
    const role = roles.find((r) => r.id === p.roleId);
    if (!role || role.name !== p.name || role.role_kind !== "position" || role.catalog_state !== "standard" || role.is_system)
      throw new Error(`Role ${p.name} chưa được tạo và kiểm chứng.`);
    const matches = titles.filter(
      (t) => t.unit_id === unitId && (t.code === p.code || t.name === p.name)
    );
    const old = matches[0];
    if (mapping.some(
      (b) => b.unit_id === unitId && b.roles.includes(p.roleId) && b.title_id !== old?.id
    ))
      throw new Error(
        `Role ${p.name} đã gắn vị trí khác trong đơn vị; cần kiểm toán để tránh trùng ô.`
      );
    if (matches.length > 1 || old && (!old.active || old.name !== p.name || old.kind !== p.kind || old.level !== p.level || old.capacity !== void 0 && old.capacity < 0 || old.source === "biz_positions"))
      throw new Error(`Vị trí ${p.name} có cấu hình khác; cần kiểm toán.`);
    if (old) {
      const bindings = mapping.filter((b) => b.unit_id === unitId && b.title_id === old.id);
      if (bindings.length === 1 && bindings[0].roles.length === 1 && bindings[0].roles[0] === p.roleId)
        continue;
      if (bindings.length || config.memberships.some((m) => m.unit_id === unitId && m.title_id === old.id) || config.position_slots?.some((s) => s.unit_id === unitId && s.title_id === old.id)) {
        throw new Error(`Vị trí ${p.name} đã tồn tại; không tự đổi mapping hoặc lịch sử bổ nhiệm.`);
      }
      commands.push({
        action: "position_role",
        data: {
          unit_id: unitId,
          title_id: old.id,
          role_id: p.roleId,
          reason: "Gắn Role cho vị trí trống đã kiểm chứng"
        }
      });
      continue;
    }
    const id = crypto.randomUUID();
    titles.push({
      id,
      unit_id: unitId,
      name: p.name,
      code: p.code,
      kind: p.kind,
      level: p.level,
      capacity: p.capacity,
      active: true,
      source: "canonical"
    });
    commands.push({
      action: "position_role",
      data: {
        unit_id: unitId,
        title_id: id,
        role_id: p.roleId,
        reason: "Thiết lập vị trí trống B2B/BTC, không chuyển nguồn nhân sự"
      }
    });
  }
  return { next: { ...config, titles }, commands };
}
function setupAllMissingCenterPositions(config, roles, mapping) {
  let next = config;
  const commands = [];
  const units = [];
  for (const unit of config.units) {
    if (!centerPositionDefinitions(next, unit.id).length || !missingCenterPositions(next, unit.id)) continue;
    const prepared = centerPositionSetup(next, unit.id, roles, mapping);
    next = prepared.next;
    commands.push(...prepared.commands);
    if (prepared.commands.length) units.push(unit.id);
  }
  return { next, commands, units };
}
const roleCatalogApi = {
  async read(context) {
    const request = supabase.rpc("role_catalog_read");
    const { data, error } = await (context?.signal ? request.abortSignal(context.signal) : request);
    if (error) throw new Error(error.message);
    return data;
  },
  async preview(action, roleId, proposal) {
    const { data, error } = await supabase.rpc("role_catalog_change", { _phase: "preview", _action: action, _role_id: roleId, _proposed: proposal });
    if (error) throw new Error(error.message);
    return data;
  },
  async apply(id, reason, affectedUsers = []) {
    const { error } = await supabase.rpc("role_catalog_change", {
      _phase: "apply",
      _preview: id,
      _confirmation: "ÁP DỤNG ROLE",
      _reason: reason
    });
    if (error) throw new Error(error.message);
    if (affectedUsers.length) void Promise.resolve(supabase.rpc("base_role_cache_sync_users", {
      _users: affectedUsers
    })).then(() => void 0).catch(() => void 0);
    void useAuth.getState().refreshBaseAccess(true).catch(() => void 0);
    void useAuth.getState().refreshBizAccess(true).catch(() => void 0);
  }
};
function organizationCommands(before, after) {
  const commands = [];
  for (const m of after.memberships) {
    const old = before.memberships.find((x) => x.id === m.id);
    if (old && JSON.stringify(old) !== JSON.stringify(m)) {
      if (m.status === "cancelled") commands.push({ action: "cancel", data: { id: m.id } });
      else if (m.ends_at !== old.ends_at) commands.push({ action: "end", data: { id: m.id, ends_at: m.ends_at, immediate: m.ends_at ? Date.parse(m.ends_at) <= Date.now() + 1e3 && Date.parse(m.ends_at) > Date.now() - 1e4 : true } });
      else throw new Error("Phân công đã lưu không thể sửa trực tiếp; kết thúc rồi tạo phân công mới.");
    }
  }
  for (const u of after.units) if (JSON.stringify(u) !== JSON.stringify(before.units.find((x) => x.id === u.id))) commands.push({ action: "unit", data: { ...u } });
  for (const t of after.titles) if (JSON.stringify(t) !== JSON.stringify(before.titles.find((x) => x.id === t.id))) commands.push({ action: "title", data: { ...t, level: t.level ?? 0, kind: t.kind ?? "staff", capacity: t.capacity ?? 0 } });
  for (const m of after.memberships) if (!before.memberships.some((x) => x.id === m.id)) commands.push({ action: "assign", data: { ...m, immediate: m.starts_at ? Date.parse(m.starts_at) <= Date.now() + 1e3 && Date.parse(m.starts_at) > Date.now() - 1e4 : true } });
  for (const section of ["units", "titles", "memberships"]) {
    if (before[section].some((x) => !after[section].some((y) => y.id === x.id))) throw new Error("Không xóa lịch sử; hãy ngừng hoặc kết thúc phân công.");
  }
  const titleIds = new Set([...before.role_links ?? [], ...after.role_links ?? []].map((l) => l.title_id));
  for (const id of titleIds) {
    const old = (before.role_links ?? []).filter((l) => l.title_id === id);
    const links = (after.role_links ?? []).filter((l) => l.title_id === id);
    if (JSON.stringify(old) !== JSON.stringify(links)) commands.push({ action: "roles", data: { id, roles: links.map(({ role_id, is_primary, scope_kind, enabled_permissions }) => ({ role_id, is_primary, scope_kind, enabled_permissions: enabled_permissions ?? [] })) } });
  }
  return commands;
}
const baseOrgApi = {
  async read(context) {
    const started = performance.now();
    const request = supabase.rpc("org_workspace_read");
    const { data, error, status } = await (context?.signal ? request.abortSignal(context.signal) : request);
    console.info("organization-read", { rpc: "org_workspace_read", status, code: error?.code ?? null, durationMs: Math.round(performance.now() - started) });
    if (error) throw Object.assign(new Error(error.message), { code: error.code, status });
    return data;
  },
  async applyMemberships(revision, memberships, reason) {
    const { error } = await supabase.rpc("base_org_membership_apply", { _revision: revision, _memberships: memberships, _reason: reason });
    if (error) throw new Error(error.message);
  },
  async effective(user, signal) {
    const request = supabase.rpc("base_permissions_effective", { _user: user });
    const { data, error } = await (signal ? request.abortSignal(signal) : request);
    if (error) throw new Error(error.message);
    return data;
  },
  async catalog() {
    const { error } = await supabase.rpc("base_permission_catalog_sync", { _catalog: PERMISSIONS.map((p) => ({ key: p.key, label: p.label, module: p.group, dependencies: PERMISSION_DEPENDS[p.key] ?? [] })) });
    if (error) throw new Error(error.message);
  },
  async preview(revision, config, before, extra = []) {
    const { data, error } = await supabase.rpc("org_change", { _phase: "preview", _revision: revision, _change: [...organizationCommands(before, config), ...extra] });
    if (error) throw new Error(error.message);
    return data;
  },
  async apply(id, confirmation, reason) {
    const { error } = await supabase.rpc("org_change", {
      _phase: "apply",
      _preview: id,
      _confirmation: confirmation,
      _reason: reason
    });
    if (error) throw new Error(error.message);
    void useAuth.getState().refreshBaseAccess(true).catch(() => void 0);
    void useAuth.getState().refreshBizAccess(true).catch(() => void 0);
  }
};
const emptyConfig = () => ({ units: [], titles: [], memberships: [], defaults: [], bundles: [], grants: [], bindings: [] });
function organizationSettingsAccess(superAdmin, structure, role, permission) {
  return { settings: superAdmin || structure || role || permission, structure: superAdmin || structure, roles: superAdmin || role || permission, editRoles: superAdmin || role, matrix: superAdmin || permission };
}
function shouldReadStaffEffective(section, tab, staffId) {
  return section === "staff" && tab === "effective" && staffId.length > 0;
}
function effectiveReadKey(actor, target, revision) {
  return ["base-effective", actor, target, revision];
}
function retryOrganizationRead(failures, error) {
  if (failures >= 1) return false;
  const e = error;
  if (e?.code === "42501" || e?.status === 401 || e?.status === 403) return false;
  return e?.code === "57014" || /timeout|timed out|fetch|network/i.test(e?.message ?? "") || (e?.status ?? 0) >= 500;
}
const organizationRetryDelay = (attempt) => Math.min(1e3 * 2 ** attempt, 4e3);
function organizationReadKey(userId, revision) {
  return ["base-org", userId, revision];
}
const OrgChart = reactExports.lazy(() => import("./OrgChart-DskPqf7X.mjs").then((m) => ({ default: m.OrgChart })));
const OrganizationChange = reactExports.lazy(() => import("./OrganizationChange-DYfCZRrm.mjs").then((m) => ({ default: m.OrganizationChange })));
const OrganizationAppointment = reactExports.lazy(() => import("./OrganizationAppointment-BLSurCiI.mjs").then((m) => ({ default: m.OrganizationAppointment })));
const OrgUnitDrawer = reactExports.lazy(() => import("./OrgUnitDrawer-CADNdZjw.mjs").then((m) => ({ default: m.OrgUnitDrawer })));
const MatrixTab = reactExports.lazy(() => import("./AccountsSettings-PdPb4l63.mjs").then((m) => ({ default: m.MatrixTab })));
const PermissionDebugTab = reactExports.lazy(() => import("./AccountsSettings-PdPb4l63.mjs").then((m) => ({ default: m.PermissionDebugTab })));
const RoleCatalog = reactExports.lazy(() => import("./RoleCatalog-DbD87WFk.mjs").then((m) => ({ default: m.RoleCatalog })));
const PermissionCleanup = reactExports.lazy(() => import("./PermissionCleanup-BsOUf76C.mjs").then((m) => ({ default: m.PermissionCleanup })));
const StaffRoleSources = reactExports.lazy(() => import("./TitleRoleDefaults-BiR31fCg.mjs").then((m) => ({ default: m.StaffRoleSources })));
const sourceLabel = { common: "Quyền chung", default: "Mặc định", direct: "Trực tiếp", bundle: "Bộ quyền", role: "Role được cấp riêng", custom: "Quyền cá nhân", business: "Kinh doanh", appointment_role: "Role theo bổ nhiệm", marketing_appointment: "Nhiệm vụ theo bổ nhiệm", marketing_specialty: "Chuyên môn Marketing" };
function PermissionRow({ p }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-3 space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: p.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: p.allowed ? "secondary" : "outline", children: p.allowed ? "Được phép" : "Không được phép" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      p.module,
      " · ",
      p.tier === 0 ? "Quản trị đặc quyền" : `Nấc ${p.tier}`,
      " · ",
      p.scope === "own" ? "Dữ liệu của mình" : "Phạm vi nghiệp vụ hiện tại"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: p.sources.length ? p.sources.map((s) => `${sourceLabel[s.source_kind]}${s.source_name ? `: ${s.source_name}` : ""}${s.ends_at ? ` — đến ${new Date(s.ends_at).toLocaleString("vi-VN")}` : ""}`).join("; ") : sourceLabel[p.legacy.source.kind] }),
    p.conflict && !p.bypass && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Xung đột cho phép/từ chối — ưu tiên từ chối" })
  ] });
}
function BaseOrganization() {
  const { user } = useCurrentUser();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationWorkspace, {}, user?.id ?? "signed-out");
}
function OrganizationWorkspace() {
  const { user, isSuperAdmin: isSA, can: canFn } = useCurrentUser();
  const accessRevision = useAuth((s) => s.baseAccess && s.baseAccess.user_id === user?.id ? s.baseAccess.revision : void 0);
  const qc = useQueryClient();
  const data = useQuery({ queryKey: organizationReadKey(user?.id, accessRevision), queryFn: baseOrgApi.read, enabled: !!user && user.status === "Đang hoạt động", retry: retryOrganizationRead, retryDelay: organizationRetryDelay, staleTime: 12e4, gcTime: 6e5, refetchOnWindowFocus: false });
  const [config, setConfig] = reactExports.useState(emptyConfig);
  const [dirty, setDirty] = reactExports.useState(false);
  const [staffId, setStaffId] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [permissionSearch, setPermissionSearch] = reactExports.useState("");
  const [section, setSection] = reactExports.useState("chart");
  const [staffTab, setStaffTab] = reactExports.useState("default");
  const [sourceHistoryOpen, setSourceHistoryOpen] = reactExports.useState(false);
  const [advancedOpen, setAdvancedOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setStaffTab("default");
    setSourceHistoryOpen(false);
  }, [staffId]);
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [preview, setPreview] = reactExports.useState(null);
  const [assigning, setAssigning] = reactExports.useState(null);
  const [historySlot, setHistorySlot] = reactExports.useState(null);
  const [changing, setChanging] = reactExports.useState(null);
  const [manageUnit, setManageUnit] = reactExports.useState(null);
  const [membershipMode, setMembershipMode] = reactExports.useState(false);
  const [showroomRolePreview, setShowroomRolePreview] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState("");
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      if (section !== "settings" && !dirty && document.visibilityState === "visible") {
        void qc.invalidateQueries({ queryKey: ["base-org", user?.id] });
      }
    }, 3e5);
    return () => clearInterval(timer);
  }, [qc, user?.id, dirty, section]);
  const effective = useQuery({ queryKey: effectiveReadKey(user?.id, staffId, accessRevision), queryFn: ({ signal }) => baseOrgApi.effective(staffId, signal), enabled: shouldReadStaffEffective(section, staffTab, staffId), retry: false, staleTime: 3e4, gcTime: 6e4 });
  reactExports.useEffect(() => {
    if (data.data && !dirty) setConfig(structuredClone(data.data.config));
  }, [data.data, dirty]);
  reactExports.useEffect(() => {
    setDirty(false);
    setPreview(null);
    setAssigning(null);
    setChanging(null);
    setManageUnit(null);
  }, [accessRevision]);
  const edit = (fn) => {
    setConfig(fn);
    setDirty(true);
    setError("");
  };
  const staff = data.data?.staff ?? [];
  const selected = staff.find((s) => s.id === staffId);
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
  const actor = data.data?.actor ?? { super: false, assign_all: false, assign_units: [], appoint_all: false, appoint_units: [], view_history: false };
  const canEditStructure = actor.super || !!actor.structure_units?.length;
  const settingsAccess = organizationSettingsAccess(isSA, canEditStructure, canFn("settings.role"), canFn("settings.permission"));
  const canAssignAnywhere = actor.super || actor.assign_all || actor.assign_units.length > 0 || actor.appoint_all || actor.appoint_units.length > 0;
  const original = data.data?.config;
  const sectionChanged = (k) => !!original && JSON.stringify(original[k]) !== JSON.stringify(config[k]);
  const legacyPermissionChanged = sectionChanged("defaults") || sectionChanged("bundles") || sectionChanged("grants") || sectionChanged("bindings");
  const roleChanged = JSON.stringify(original?.role_links ?? []) !== JSON.stringify(config.role_links ?? []);
  const permissionChanged = legacyPermissionChanged || roleChanged;
  const showPreview = () => run(async () => {
    if (!original) return;
    setReason("");
    setMembershipMode(!permissionChanged);
    setShowroomRolePreview(false);
    if (legacyPermissionChanged) throw new Error("Quyền bổ sung chưa thể áp dụng trong lượt chuyển đổi này; không thay đổi quyền hiện có.");
    setPreview(await baseOrgApi.preview(data.data?.revision ?? 0, config, original));
  });
  const apply = () => run(async () => {
    if (!preview) return;
    await baseOrgApi.apply(preview.id, "ÁP DỤNG CƠ CẤU", roleChanged || showroomRolePreview ? `ÁP DỤNG PHÂN QUYỀN:${reason}` : reason);
    setPreview(null);
    setDirty(false);
    setShowroomRolePreview(false);
    void data.refetch();
    void qc.invalidateQueries({ queryKey: ["base-effective"] });
    void qc.invalidateQueries({ queryKey: ["title-role-links"] });
    void qc.invalidateQueries({ queryKey: ["role-catalog"] });
  });
  const setupCenter = (unitId) => {
    setManageUnit(null);
    void run(async () => {
      if (!isSA || !actor.super || dirty || !original) throw new Error("Cần Super Admin và cơ cấu chưa có bản nháp.");
      const catalog = await roleCatalogApi.read();
      const { next, commands } = centerPositionSetup(original, unitId, catalog.roles, catalog.mapping);
      if (!commands.length) throw new Error("Các vị trí đã gắn đúng Role; không có thay đổi.");
      const p = await baseOrgApi.preview(data.data?.revision ?? 0, next, original, commands);
      setShowroomRolePreview(true);
      setMembershipMode(false);
      setReason("Thiết lập ô vị trí trung tâm; giữ nguồn nhân sự hiện hữu");
      setPreview(p);
    });
  };
  const setupAllCenters = () => {
    setManageUnit(null);
    void run(async () => {
      if (!isSA || !actor.super || dirty || !original) throw new Error("Cần Super Admin và không có bản nháp cơ cấu đang sửa.");
      const roleCatalog = await roleCatalogApi.read();
      const { next, commands } = setupAllMissingCenterPositions(original, roleCatalog.roles, roleCatalog.mapping);
      if (!commands.length) throw new Error("Các ô vị trí chuẩn đã có; không tạo trùng.");
      const prepared = await baseOrgApi.preview(data.data?.revision ?? 0, next, original, commands);
      setShowroomRolePreview(true);
      setMembershipMode(false);
      setReason("Bổ sung ô vị trí chuẩn cho B2B, Phân Phối, BTC/Showroom; giữ nguyên bổ nhiệm cũ");
      setPreview(prepared);
    });
  };
  if (!user || user.status !== "Đang hoạt động") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "p-6 text-destructive", children: "Vui lòng đăng nhập lại." });
  if (data.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-busy": "true", "aria-label": "Đang tải cơ cấu tổ chức", className: "space-y-5 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Cơ cấu tổ chức" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" })
  ] });
  if (data.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Cơ cấu tổ chức" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-destructive", children: [
      "Không tải được cơ cấu tổ chức. ",
      data.error instanceof Error ? data.error.message : "Vui lòng thử lại sau."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: data.isFetching, onClick: () => data.refetch(), children: data.isFetching ? "Đang tải lại…" : "Thử lại" })
  ] });
  const groupPermissions = (rows) => [...new Set(rows.map((p) => p.module))].map((module) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: true, className: "border-b", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "py-3 font-semibold text-sm cursor-pointer", children: module }),
    rows.filter((p) => p.module === module && `${p.label} ${p.key}`.toLocaleLowerCase("vi").includes(permissionSearch.toLocaleLowerCase("vi"))).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionRow, { p }, p.key))
  ] }, module));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 w-full space-y-5 max-w-6xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Cơ cấu tổ chức" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: section === "chart" ? "default" : "outline", onClick: () => setSection("chart"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "h-4 w-4 mr-2" }),
        "Cơ cấu & Bổ nhiệm"
      ] }),
      canAssignAnywhere && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: section === "staff" ? "default" : "outline", onClick: () => setSection("staff"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 size-4" }),
        "Hồ sơ nhân viên"
      ] }),
      settingsAccess.roles && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: section === "settings" ? "default" : "outline", onClick: () => setSection("settings"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4 mr-2" }),
        "Role & Phân quyền"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "ml-auto", size: "sm", disabled: busy || !dirty, onClick: showPreview, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
        "Xem trước thay đổi"
      ] })
    ] }),
    dirty && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Có thay đổi chưa áp dụng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
        if (original) setConfig(structuredClone(original));
        setDirty(false);
        setError("");
      }, children: "Hủy bản nháp" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
    section === "chart" && isSA && actor.super && !dirty && config.units.some((u) => missingCenterPositions(config, u.id)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "min-w-0 text-sm", children: "Các trung tâm còn thiếu ô vị trí đúng Role. Chỉ thêm ô chưa có, không chuyển hay xóa nhân sự." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-auto shrink-0 whitespace-normal", size: "sm", disabled: busy, onClick: setupAllCenters, children: "Xem trước bổ sung ô vị trí chuẩn" })
    ] }),
    section === "chart" && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrgChart, { config, staff, serverNow: data.data?.server_now, canManage: canAssignAnywhere || canEditStructure, onManageUnit: (node) => setManageUnit(node), onOpenStaff: (id) => {
      setStaffId(id);
      setSection("staff");
    }, onAssign: (ref) => setAssigning({ unitId: ref.unitId, titleId: ref.slot.titleId ?? ref.slot.id }), onUnassign: (ref, p) => {
      const m = config.memberships.find((x) => x.active && x.status !== "cancelled" && (!x.starts_at || x.starts_at <= (data.data?.server_now ?? (/* @__PURE__ */ new Date()).toISOString())) && (!x.ends_at || x.ends_at > (data.data?.server_now ?? (/* @__PURE__ */ new Date()).toISOString())) && x.unit_id === ref.unitId && x.title_id === (ref.slot.titleId ?? ref.slot.id) && x.user_id === p.id);
      if (m) setChanging({ id: m.id });
    }, onSlotHistory: (ref) => setHistorySlot(ref) }) }),
    section === "staff" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-[260px_1fr] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm nhân sự", placeholder: "Tìm nhân sự", value: search, onChange: (e) => setSearch(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-72 md:max-h-[650px] overflow-y-auto space-y-1", children: staff.filter((s) => s.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi"))).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-auto py-3 justify-start text-left whitespace-normal", variant: staffId === s.id ? "secondary" : "ghost", onClick: () => setStaffId(s.id), children: s.name }, s.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: selected.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: selected.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: staffTab, onValueChange: setStaffTab, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full flex h-auto flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "default", className: "flex-1", children: "Nguồn Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "extra", className: "flex-1", children: "Quản lý quyền riêng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "effective", className: "flex-1", children: "Quyền thực tế" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "spec", className: "flex-1", children: "Chuyên môn" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "spec", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSpecialties, { userId: staffId }, staffId) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "default", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleActualSources, { userId: staffId }, staffId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: sourceHistoryOpen, onToggle: (e) => setSourceHistoryOpen(e.currentTarget.open), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-sm cursor-pointer", children: "Nâng cao — nguồn cấp quyền" }),
              sourceHistoryOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaffRoleSources, { userId: staffId, memberships: config.memberships.filter((m) => m.user_id === staffId && m.active).map((m) => ({ title_source: config.titles.find((t) => t.id === m.title_id)?.source === "biz_positions" ? "biz" : "base", title_id: m.title_id ?? "", name: config.titles.find((t) => t.id === m.title_id)?.name ?? "Chưa có chức vụ" })) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: config.memberships.filter((m) => m.user_id === staffId).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                config.units.find((u) => u.id === m.unit_id)?.name,
                " · ",
                config.titles.find((t) => t.id === m.title_id)?.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: m.active ? "Đang áp dụng" : "Đã kết thúc" }),
              m.active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setChanging({ id: m.id }), children: "Miễn nhiệm" }),
                isSA && marketingUnit(config, m.unit_id) && config.titles.find((t) => t.id === m.title_id)?.source !== "biz_positions" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setChanging({ id: m.id, specialty: true }), children: "Nhiệm vụ Marketing" })
              ] })
            ] }, m.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "extra", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaffPermissionEditor, { userId: staffId, effective: !effective.error && effective.data?.user_id === staffId ? effective.data.permissions : void 0, effectiveError: !!effective.error }, staffId) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "effective", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleActualSources, { userId: staffId }, staffId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "my-4", "aria-label": "Tìm quyền", placeholder: "Tìm chức năng hoặc hành động", value: permissionSearch, onChange: (e) => setPermissionSearch(e.target.value) }),
            effective.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải quyền…" }) : effective.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: effective.error.message }) : groupPermissions(effective.data?.permissions ?? [])
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mx-auto h-10 w-10 mb-3" }),
        "Chọn nhân sự"
      ] }) })
    ] }),
    section === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleCatalog, { canManage: settingsAccess.editRoles }) }),
      isSA && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: advancedOpen, onToggle: (e) => setAdvancedOpen(e.currentTarget.open), className: "mt-5 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-medium text-sm", children: "Nâng cao" }),
        advancedOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: settingsAccess.matrix ? "matrix" : "inheritance", className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto", children: [
            settingsAccess.matrix && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "matrix", children: "Tổng quan (chỉ xem)" }),
            isSA && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "debug", children: "Kiểm tra quyền" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "inheritance", children: "Role mặc định" }),
            isSA && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "bundles", children: "Quyền tùy chỉnh" }),
            isSA && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cleanup", children: "Chuyển đổi quyền cũ" })
          ] }),
          settingsAccess.matrix && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "matrix", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MatrixTab, { canManage: false }) }) }),
          isSA && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "debug", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionDebugTab, {}) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "inheritance", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-3 text-sm text-muted-foreground", children: "Role theo chức vụ chỉ tự cấp các chức năng cá nhân đã kiểm chứng. Quyền quản lý đơn vị còn chờ kiểm chứng. Nhiệm vụ Marketing chỉ cấp tập quyền đã được xác minh; Role trực tiếp giữ nguyên." }) }),
          isSA && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "bundles", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-3 text-sm text-muted-foreground", children: "Chưa hỗ trợ tự động: quyền tùy chỉnh chưa có quy trình áp dụng nguyên tử. Cấu hình đã có được giữ nguyên." }),
            config.bundles.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-2 text-sm", children: [
              b.name,
              " · ",
              b.active ? "Đang áp dụng" : "Bản nháp"
            ] }, b.id))
          ] }),
          isSA && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cleanup", children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionCleanup, {}) }) })
        ] })
      ] })
    ] }),
    section === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      (data.data?.events ?? []).map((e) => {
        const orgChanges = orgConfigDiff(e.before_data, e.after_data, (uid) => staff.find((s) => s.id === uid)?.name ?? "Nhân sự");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-b py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium", children: [
            new Date(e.created_at).toLocaleString("vi-VN"),
            " · ",
            staff.find((s) => s.id === e.actor_id)?.name ?? "Quản trị",
            " · Phiên bản ",
            e.before_revision,
            " → ",
            e.after_revision
          ] }),
          orgChanges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "Thay đổi tổ chức" }),
            orgChanges.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-0.5 text-sm", children: c }, i))
          ] }),
          (e.impact ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "Thay đổi quyền" }),
            (e.impact ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.name }),
              p.changes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                c.label,
                ": ",
                c.before.allowed ? "Có" : "Không",
                " → ",
                c.after.allowed ? "Có" : "Không"
              ] }, c.key))
            ] }, p.user_id))
          ] }),
          !orgChanges.length && !(e.impact ?? []).length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-2 text-sm text-muted-foreground", children: "Không có thay đổi nội dung." })
        ] }, e.id);
      }),
      !data.data?.events.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground py-5", children: "Chưa có thay đổi nào." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!preview, onOpenChange: (v) => !v && !busy && setPreview(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: membershipMode ? "Xem trước thay đổi phân công" : "Xem trước thay đổi phân quyền" }) }),
      (() => {
        const orgChanges = preview?.before && preview?.after ? orgConfigDiff(preview.before, preview.after, (uid) => staff.find((s) => s.id === uid)?.name ?? "Nhân sự") : [];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          orgChanges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 rounded-xl border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground", children: [
              "Thay đổi tổ chức (",
              orgChanges.length,
              ")"
            ] }),
            orgChanges.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: c }, i))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
              preview?.impact.length ?? 0,
              " nhân sự thay đổi quyền hoặc nguồn quyền tại thời điểm xem trước"
            ] }),
            preview?.impact.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { open: true, className: "border-b py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "font-medium", children: p.name }),
              p.changes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: c.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                  c.before.allowed ? "Được phép" : "Không được phép",
                  " → ",
                  c.after.allowed ? "Được phép" : "Không được phép",
                  " · Nấc ",
                  c.before.tier,
                  " → ",
                  c.after.tier
                ] })
              ] }, c.key))
            ] }, p.user_id)),
            preview?.next_transition_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
              "Mốc thay đổi hiệu lực tiếp theo: ",
              new Date(preview.next_transition_at).toLocaleString("vi-VN")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "base-reason", children: "Lý do thay đổi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "base-reason", value: reason, onChange: (e) => setReason(e.target.value) })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !reason.trim(), onClick: apply, children: busy ? "Đang áp dụng…" : "Xác nhận áp dụng" })
        ] });
      })()
    ] }) }),
    assigning && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationAppointment, { target: assigning, config, staff, onClose: () => setAssigning(null), onPreview: async (next) => {
      if (dirty) throw new Error("Áp dụng hoặc hủy bản nháp hiện tại trước khi bổ nhiệm.");
      if (!original) throw new Error("Chưa tải cơ cấu.");
      return baseOrgApi.preview(data.data?.revision ?? 0, next, original);
    }, onApply: async (p, reason2) => {
      await baseOrgApi.apply(p.id, "ÁP DỤNG CƠ CẤU", reason2);
      void data.refetch().then((fresh) => {
        if (fresh.data) setConfig(structuredClone(fresh.data.config));
      });
      void qc.invalidateQueries({ queryKey: ["base-effective"] });
      void qc.invalidateQueries({ queryKey: ["title-role-links"] });
      void qc.invalidateQueries({ queryKey: ["role-catalog"] });
    } }) }),
    manageUnit && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrgUnitDrawer, { unitId: manageUnit.id, config, staff, actor, onAppoint: (titleId, mode) => {
      setAssigning({ unitId: manageUnit.id, titleId, mode });
      setManageUnit(null);
    }, onEnd: (id) => {
      setChanging({ id });
      setManageUnit(null);
    }, onEdit: edit, onSetupCenterRoles: setupCenter, onClose: () => setManageUnit(null) }) }),
    changing && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrganizationChange, { config, id: changing.id, specialty: changing.specialty, onClose: () => setChanging(null), onPreview: async (next) => {
      if (dirty) throw new Error("Áp dụng bản nháp cơ cấu trước.");
      if (!original) throw new Error("Chưa tải cơ cấu.");
      return baseOrgApi.preview(data.data?.revision ?? 0, next, original);
    }, onApply: async (p, reason2) => {
      await baseOrgApi.apply(p.id, "ÁP DỤNG CƠ CẤU", reason2);
      void data.refetch();
      void qc.invalidateQueries({ queryKey: ["base-effective"] });
      void qc.invalidateQueries({ queryKey: ["title-role-links"] });
      void qc.invalidateQueries({ queryKey: ["role-catalog"] });
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!historySlot, onOpenChange: (v) => !v && setHistorySlot(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Lịch sử — ",
        historySlot?.slot.title
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: historySlot?.unitName }),
      historySlot && (slotHistory(config, historySlot.unitId, historySlot.slot.id).length ? slotHistory(config, historySlot.unitId, historySlot.slot.id).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: staff.find((s) => s.id === m.user_id)?.name ?? "Nhân sự" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          m.starts_at ? new Date(m.starts_at).toLocaleString("vi-VN") : "—",
          " → ",
          m.ends_at ? new Date(m.ends_at).toLocaleString("vi-VN") : "Hiện tại",
          " · ",
          m.active ? "Đang áp dụng" : "Đã kết thúc"
        ] })
      ] }, m.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Chưa từng có người giữ vị trí này." }))
    ] }) })
  ] });
}
function OrganizationRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BaseOrganization, {});
}
const organization = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: OrganizationRoute
}, Symbol.toStringTag, { value: "Module" }));
export {
  BTC_CENTER as B,
  HANOI_SHOWROOM as H,
  RETAIL_SYSTEM as R,
  B2B_CENTER as a,
  titleKind as b,
  centerPositionDefinitions as c,
  changeAppointmentSpecialties as d,
  effectivePositionHolders as e,
  endAppointment as f,
  appointmentEligible as g,
  marketingUnit as h,
  appointmentDraft as i,
  membershipKind as j,
  unitPath as k,
  slotHolders as l,
  membershipEffective as m,
  missingCenterPositions as n,
  orgConfigDiff as o,
  unitDescendants as p,
  baseOrgApi as q,
  positionPairs as r,
  slotCapacity as s,
  titleLevel as t,
  unitTitles as u,
  roleCatalogApi as v,
  organization as w
};
