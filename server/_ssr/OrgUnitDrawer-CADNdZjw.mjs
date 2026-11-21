import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useCurrentUser, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, B as Button, l as Badge, L as Label, I as Input } from "./router-CkmTURa-.mjs";
import { h as k3HubAccess } from "./api-B_q16te0.mjs";
import { u as unitTitles, m as membershipEffective, s as slotCapacity, j as membershipKind, k as unitPath, l as slotHolders, t as titleLevel, n as missingCenterPositions, b as titleKind, p as unitDescendants } from "./organization-BsAAQoLM.mjs";
import { TitleRoleDefaults } from "./TitleRoleDefaults-BiR31fCg.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { bq as ArrowRightLeft, aU as UserPlus, a6 as Plus, w as Users, aR as History, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "./design-BrHT-rw4.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
import "./area-BwBtq_yo.mjs";
import "./skeleton-DaUJxWW7.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
const fmt = (iso) => iso ? new Date(iso).toLocaleString("vi-VN") : "—";
function unitRights(config, unitId, actor) {
  unitDescendants(config, unitId);
  const covers = (all, units) => all || units.includes(unitId);
  return {
    assign: actor.super || covers(actor.assign_all, actor.assign_units),
    appoint: actor.super || covers(actor.appoint_all, actor.appoint_units),
    structure: actor.super || !!actor.structure_units?.includes(unitId)
  };
}
function OrgUnitDrawer({ unitId, config, staff, actor, onAppoint, onEdit, onEnd, onSetupCenterRoles, onClose }) {
  const { user } = useCurrentUser();
  const unit = config.units.find((u) => u.id === unitId);
  const k3Access = useQuery({
    queryKey: ["k3hub-access", user?.id],
    queryFn: k3HubAccess,
    enabled: !!user && user.status === "Đang hoạt động",
    staleTime: 3e4
  });
  const hasUnitK3 = k3Access.data?.units.some((x) => x.id === unitId) ?? false;
  const [titleName, setTitleName] = reactExports.useState("");
  const [titleKindNew, setTitleKindNew] = reactExports.useState("staff");
  const [childName, setChildName] = reactExports.useState("");
  const [childKind, setChildKind] = reactExports.useState("department");
  const rights = reactExports.useMemo(() => unitRights(config, unitId, actor), [config, unitId, actor]);
  const titles = reactExports.useMemo(() => unitTitles(config, unitId), [config, unitId]);
  const standardTitles = titles.filter((t) => t.source !== "biz_positions");
  const oldBizTitles = titles.filter((t) => t.source === "biz_positions");
  const memberships = reactExports.useMemo(() => config.memberships.filter((m) => membershipEffective(m) && m.unit_id === unitId), [config, unitId]);
  const history = reactExports.useMemo(
    () => config.memberships.filter((m) => m.unit_id === unitId).sort((a, b) => Date.parse(b.starts_at ?? "") - Date.parse(a.starts_at ?? "")),
    [config, unitId]
  );
  const nameOf = (id) => staff.find((s) => s.id === id)?.name ?? "Nhân sự";
  const titleOf = (id) => config.titles.find((t) => t.id === id);
  const managerSlots = standardTitles.filter((t) => slotCapacity(t) === 1);
  const concurrentCount = memberships.filter((m) => membershipKind(m) === "concurrent").length;
  const peopleCount = new Set(memberships.map((m) => m.user_id)).size;
  if (!unit) return null;
  const canAssign = rights.assign;
  const canAppoint = rights.appoint;
  const personLine = (m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 border-b py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex flex-wrap items-center gap-1.5 text-sm font-medium", children: [
        nameOf(m.user_id),
        membershipKind(m) === "concurrent" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] font-normal", children: "Kiêm nhiệm" }),
        m.title_id && (titleOf(m.title_id)?.capacity ?? 0) === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] font-normal", children: "Quản lý" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        titleOf(m.title_id)?.name ?? "Chưa có chức danh",
        m.title_id && ` · Cấp ${titleOf(m.title_id)?.level ?? 0}`,
        m.duties ? ` · ${m.duties}` : ""
      ] })
    ] }),
    (canAssign || canAppoint) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", "aria-label": `Kết thúc phân công ${nameOf(m.user_id)}`, onClick: () => onEnd(m.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
  ] }, m.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "w-full overflow-y-auto sm:max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: unit.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: unitPath(config, unitId) }),
      hasUnitK3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "w-fit mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/k3/unit/$unit", params: { unit: unitId }, onClick: onClose, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1.5", children: "3K đơn vị" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { className: "h-4 w-4" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "staff", className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex h-auto flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "staff", children: "Nhân sự" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "titles", children: "Chức vụ & Cấp bậc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: "Lịch sử" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "settings", children: "Cài đặt đơn vị" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "staff", className: "space-y-4 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nhân sự thực tế: " }),
            peopleCount
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Đang kiêm nhiệm: " }),
            concurrentCount
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-xs font-semibold text-muted-foreground", children: "Người phụ trách" }),
          managerSlots.length ? managerSlots.map((t) => {
            const holders = slotHolders(config, unitId, t.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
                  t.name,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] font-normal", children: [
                    "Cấp ",
                    titleLevel(t)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: holders.length ? holders.map((h) => nameOf(h.user_id)).join(", ") : "Chưa phân công" })
              ] }),
              canAppoint && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onAppoint(t.id), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1.5 h-4 w-4" }),
                holders.length ? "Thay đổi" : "Bổ nhiệm"
              ] })
            ] }, t.id);
          }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đơn vị chưa có vị trí quản lý đơn nhiệm." })
        ] }),
        canAssign && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => onAppoint(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
            "Thêm nhân sự"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onAppoint(void 0, "transfer"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { className: "mr-1.5 h-4 w-4" }),
            "Điều chuyển nhân sự"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
            "Danh sách nhân sự"
          ] }),
          memberships.length ? memberships.map(personLine) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Chưa có nhân sự." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "titles", className: "space-y-3 pt-3", children: [
        actor.super && missingCenterPositions(config, unitId) && onSetupCenterRoles && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b pb-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Ô vị trí theo Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chỉ thêm vị trí trống đúng cấp. Giữ Role và bổ nhiệm hiện hữu; không tự chuyển người từ Role Sales." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-auto whitespace-normal text-left", onClick: () => onSetupCenterRoles(unitId), children: "Xem trước vị trí & Role trung tâm" })
        ] }),
        rights.structure && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Chức vụ mới tại ",
            unit.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên chức vụ mới", value: titleName, onChange: (e) => setTitleName(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: titleKindNew, onValueChange: (v) => setTitleKindNew(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Loại chức vụ mới", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff", children: "Nhân viên" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Quản lý" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !titleName.trim(), onClick: () => {
            onEdit((c) => ({ ...c, titles: [...c.titles, { id: crypto.randomUUID(), unit_id: unitId, name: titleName.trim(), kind: titleKindNew, capacity: titleKindNew === "manager" ? 1 : 0, level: titleKindNew === "manager" ? unit.kind === "team" ? 1 : 2 : 0, active: true }] }));
            setTitleName("");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            "Thêm chức vụ"
          ] })
        ] }),
        standardTitles.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 text-sm font-medium", children: [
            rights.structure ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": `Tên chức vụ ${t.name}`, value: t.name, onChange: (e) => onEdit((c) => ({ ...c, titles: c.titles.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x) })) }) : t.name,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] font-normal", children: [
              "Cấp ",
              titleLevel(t)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] font-normal", children: titleKind(t) === "manager" ? "Quản lý" : "Nhân viên" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] font-normal", children: slotCapacity(t) === 1 ? "Một người" : slotCapacity(t) > 1 ? `Tối đa ${slotCapacity(t)}` : "Nhiều người" })
          ] }),
          rights.structure && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cấp bậc" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 5, "aria-label": `Cấp bậc ${t.name}`, value: t.level ?? 0, onChange: (e) => onEdit((c) => ({ ...c, titles: c.titles.map((x) => x.id === t.id ? { ...x, level: Math.min(5, Math.max(0, Number(e.target.value))) } : x) })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số người tối đa" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: t.kind === "manager" ? 1 : 0, "aria-label": `Số người ${t.name}`, value: t.capacity ?? 0, disabled: t.kind === "manager", onChange: (e) => onEdit((c) => ({ ...c, titles: c.titles.map((x) => x.id === t.id ? { ...x, capacity: Math.max(0, Number(e.target.value)) } : x) })) })
            ] })
          ] }),
          actor.super && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "text-xs cursor-pointer", children: "Liên kết Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TitleRoleDefaults, { disabled: !t.active, source: t.source === "biz_positions" ? "biz" : "base", titleId: t.id, titleName: t.name, stagedLinks: config.role_links ?? [], onStage: (links) => onEdit((c) => ({ ...c, role_links: [...(c.role_links ?? []).filter((l) => l.title_id !== t.id), ...links] })) })
          ] }),
          rights.structure && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => onEdit((c) => ({ ...c, titles: c.titles.map((x) => x.id === t.id ? { ...x, active: !x.active } : x) })), children: t.active ? "Ngừng chức vụ" : "Kích hoạt" }),
          t.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: t.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            "Đang giữ: ",
            titleHoldersCount(config, t.id),
            " người"
          ] }),
          (canAssign || canAppoint) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "mt-2", onClick: () => onAppoint(t.id), children: "Bổ nhiệm / Thêm nhân sự" })
        ] }, t.id)),
        oldBizTitles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border border-dashed p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-medium", children: [
            "Vị trí Kinh doanh cũ cần chuyển đổi (",
            oldBizTitles.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Chức danh cũ dùng chung nhiều đơn vị. Không sửa tên, ngừng hoặc bổ nhiệm mới ở đây; chuyển sang đúng Role trung tâm qua quy trình có kiểm toán." }),
          oldBizTitles.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm", children: [
            t.name,
            " · ",
            titleHoldersCount(config, t.id),
            " người giữ (toàn hệ thống)"
          ] }, t.id))
        ] }),
        !standardTitles.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Đơn vị chưa có ô vị trí chuẩn." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "history", className: "space-y-2 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
          "Lịch sử phân công của đơn vị, mới nhất trước."
        ] }),
        actor.view_history || actor.super ? history.length ? history.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            nameOf(m.user_id),
            " · ",
            titleOf(m.title_id)?.name ?? "Chưa có chức danh"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            fmt(m.starts_at),
            " → ",
            m.active ? "Hiện tại" : fmt(m.ends_at),
            " · ",
            m.active ? "Đang áp dụng" : "Đã kết thúc",
            " · ",
            membershipKind(m) === "concurrent" ? "Kiêm nhiệm" : "Chính"
          ] })
        ] }, m.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Chưa có lịch sử." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground", children: "Bạn chưa được cấp quyền xem lịch sử phân công." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", className: "space-y-3 pt-3", children: rights.structure ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên đơn vị" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên đơn vị", value: unit.name, onChange: (e) => onEdit((c) => ({ ...c, units: c.units.map((x) => x.id === unitId ? { ...x, name: e.target.value } : x) })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn vị cha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: unit.parent_id ?? "_root", onValueChange: (v) => onEdit((c) => ({ ...c, units: c.units.map((x) => x.id === unitId ? { ...x, parent_id: v === "_root" ? void 0 : v } : x) })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Đơn vị cha", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_root", children: "Cấp gốc" }),
              config.units.filter((u) => u.id !== unitId && !unitDescendants(config, unitId).includes(u.id)).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.name }, u.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onEdit((c) => ({ ...c, units: c.units.map((x) => x.id === unitId ? { ...x, active: !x.active } : x) })), children: unit.active ? "Ngừng đơn vị" : "Kích hoạt đơn vị" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn vị con" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên đơn vị con", value: childName, onChange: (e) => setChildName(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: childKind, onValueChange: (v) => setChildKind(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "aria-label": "Loại đơn vị con", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "system", children: "Hệ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "department", children: "Phòng" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "team", children: "Nhóm" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !childName.trim(), onClick: () => {
            onEdit((c) => ({ ...c, units: [...c.units, { id: crypto.randomUUID(), parent_id: unitId, name: childName.trim(), kind: childKind, active: true }] }));
            setChildName("");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            "Thêm đơn vị con"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ngừng đơn vị không xóa nhân sự hay lịch sử." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground", children: "Chỉ Super Admin được sửa cấu trúc đơn vị." }) })
    ] })
  ] }) });
}
function titleHoldersCount(config, titleId) {
  return new Set(config.memberships.filter((m) => membershipEffective(m) && m.title_id === titleId).map((m) => m.user_id)).size;
}
export {
  OrgUnitDrawer
};
