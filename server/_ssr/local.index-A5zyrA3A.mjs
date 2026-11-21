import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useStore, u as useCurrentUser, P as PageHeader, D as Dialog, be as DialogTrigger, B as Button, x as DialogContent, y as DialogHeader, A as DialogTitle, I as Input, C as Card, o as CardContent, aX as uid, L as Label, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { F as FilterBar, E as EmptyState } from "./Common-D50TzqoQ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { a6 as Plus, N as MapPin, ao as Pencil, ap as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
function PlaceForm({
  initial,
  onSubmit,
  onClose
}) {
  const {
    brands,
    people
  } = useStore();
  const [p, setP] = reactExports.useState({
    id: initial?.id || uid(),
    name: initial?.name || "",
    mapLink: initial?.mapLink,
    brandId: initial?.brandId || brands[0]?.id || "",
    address: initial?.address,
    phone: initial?.phone,
    owner: initial?.owner,
    verifyStatus: initial?.verifyStatus || "Chưa xác minh",
    notes: initial?.notes
  });
  const set = (x) => setP({
    ...p,
    ...x
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên địa điểm *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.name, onChange: (e) => set({
          name: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link Google Map" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.mapLink || "", onChange: (e) => set({
          mapLink: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thương hiệu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.brandId, onValueChange: (v) => set({
          brandId: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.owner || "_", onValueChange: (v) => set({
          owner: v === "_" ? void 0 : v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            people.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x.name, children: x.name }, x.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Địa chỉ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.address || "", onChange: (e) => set({
          address: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số điện thoại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.phone || "", onChange: (e) => set({
          phone: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái xác minh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.verifyStatus, onValueChange: (v) => set({
          verifyStatus: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Đã xác minh", "Chưa xác minh", "Đang xử lý"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (p.name && p.brandId) {
          onSubmit(p);
          onClose();
        }
      }, children: "Lưu" })
    ] })
  ] });
}
function LocalPage() {
  const s = useStore();
  const {
    user,
    can,
    scopeList
  } = useCurrentUser();
  const canCreate = can("local.create");
  const canEdit = can("local.edit");
  const canDelete = can("local.delete");
  const ME = user?.fullName || user?.username || "";
  const [search, setSearch] = reactExports.useState("");
  const [fBrand, setFBrand] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const scopedPlaces = reactExports.useMemo(() => scopeList(s.places, "local.view_all", "local.view_mine", (p) => !!ME && p.owner === ME), [s.places, scopeList, ME]);
  const filtered = reactExports.useMemo(() => scopedPlaces.filter((p) => (!search || p.name.toLowerCase().includes(search.toLowerCase())) && (fBrand === "all" || p.brandId === fBrand) && (fStatus === "all" || p.verifyStatus === fStatus)), [scopedPlaces, search, fBrand, fStatus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Local Map", description: "Quản lý Google Map / Google Business Profile và công việc local marketing.", actions: canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: adding, onOpenChange: setAdding, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        "Thêm địa điểm"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo địa điểm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlaceForm, { onSubmit: (p) => s.add("places", p), onClose: () => setAdding(false) })
      ] })
    ] }) : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm địa điểm...", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fBrand, onValueChange: setFBrand, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Thương hiệu" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả thương hiệu" }),
          s.brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Xác minh" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả" }),
          ["Đã xác minh", "Chưa xác minh", "Đang xử lý"].map((s2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s2, children: s2 }, s2))
        ] })
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5" }), title: s.places.length === 0 ? "Chưa có địa điểm" : "Không có địa điểm phù hợp bộ lọc", hint: s.places.length === 0 ? "Tạo địa điểm Google Map / GBP đầu tiên để bắt đầu quản lý local SEO." : void 0, action: s.places.length === 0 && canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
      "Tạo địa điểm đầu tiên"
    ] }) : void 0 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map((p) => {
      const brand = s.brands.find((b) => b.id === p.brandId);
      const posts = s.mapPosts.filter((mp) => mp.placeId === p.id).length;
      const reviews = s.reviews.filter((r) => r.placeId === p.id).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/local/$id", params: {
              id: p.id
            }, className: "font-semibold hover:text-primary inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
              p.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: brand?.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: p.verifyStatus })
        ] }),
        p.address && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-2", children: p.address }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            posts,
            " bài đăng · ",
            reviews,
            " review"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => s.remove("places", p.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] })
      ] }) }, p.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa địa điểm" }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx(PlaceForm, { initial: editing, onSubmit: (p) => s.update("places", p.id, p), onClose: () => setEditing(null) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "local.view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LocalPage, {}) });
export {
  SplitComponent as component
};
