import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useStore, u as useCurrentUser, P as PageHeader, D as Dialog, B as Button, x as DialogContent, y as DialogHeader, A as DialogTitle, I as Input, bJ as SOCIAL_PLATFORMS, bK as SOCIAL_CHANNEL_STATUSES, C as Card, o as CardContent, aX as uid, L as Label, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { F as FilterBar, E as EmptyState } from "./Common-D50TzqoQ.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { P as PostFormDialog } from "./SocialPostDetail-Cg2CVfqJ.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { a6 as Plus, K as Share2, ag as ExternalLink, bH as FilePlusCorner, ao as Pencil } from "../_libs/lucide-react.mjs";
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
import "./tabs-CeCgkx-c.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./SpecialtyStaffPicker-Bm4W_zzR.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
function ChannelForm({
  initial,
  onSubmit,
  onClose
}) {
  const {
    brands,
    people
  } = useStore();
  const [c, setC] = reactExports.useState({
    id: initial?.id || uid(),
    name: initial?.name || "",
    platform: initial?.platform || "Facebook Page",
    url: initial?.url,
    brandId: initial?.brandId || brands[0]?.id || "",
    owner: initial?.owner,
    frequency: initial?.frequency,
    goal: initial?.goal,
    status: initial?.status || "Đang xây",
    notes: initial?.notes
  });
  const set = (p) => setC({
    ...c,
    ...p
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên kênh *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.name, onChange: (e) => set({
          name: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nền tảng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.platform, onValueChange: (v) => set({
          platform: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SOCIAL_PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thương hiệu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.brandId, onValueChange: (v) => set({
          brandId: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.owner || "_", onValueChange: (v) => set({
          owner: v === "_" ? void 0 : v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link kênh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.url || "", onChange: (e) => set({
          url: e.target.value
        }), placeholder: "https://..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tần suất đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.frequency || "", onChange: (e) => set({
          frequency: e.target.value
        }), placeholder: "VD: 5 bài/tuần" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.status, onValueChange: (v) => set({
          status: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SOCIAL_CHANNEL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mục tiêu kênh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: c.goal || "", onChange: (e) => set({
          goal: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú vận hành" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: c.notes || "", onChange: (e) => set({
          notes: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (c.name && c.brandId) {
          onSubmit(c);
          onClose();
        }
      }, children: "Lưu" })
    ] })
  ] });
}
function SocialPage() {
  const s = useStore();
  const {
    user,
    can,
    scopeList
  } = useCurrentUser();
  const navigate = useNavigate();
  const canCreate = can("social.create");
  const canEdit = can("social.edit");
  const canPostCreate = can("social.post_create");
  const ME = user?.fullName || user?.username || "";
  const [search, setSearch] = reactExports.useState("");
  const [fBrand, setFBrand] = reactExports.useState("all");
  const [fPlatform, setFPlatform] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fOwner, setFOwner] = reactExports.useState("all");
  const [editingCh, setEditingCh] = reactExports.useState(null);
  const [addingCh, setAddingCh] = reactExports.useState(false);
  const [addingPostFor, setAddingPostFor] = reactExports.useState(null);
  const scopedSocials = reactExports.useMemo(() => scopeList(s.socials, "social.view_all", "social.view_mine", (c) => !!ME && c.owner === ME), [s.socials, scopeList, ME]);
  const channels = reactExports.useMemo(() => scopedSocials.filter((c) => (!search || c.name.toLowerCase().includes(search.toLowerCase())) && (fBrand === "all" || c.brandId === fBrand) && (fPlatform === "all" || c.platform === fPlatform) && (fStatus === "all" || c.status === fStatus) && (fOwner === "all" || c.owner === fOwner)), [scopedSocials, search, fBrand, fPlatform, fStatus, fOwner]);
  const owners = reactExports.useMemo(() => Array.from(new Set(s.socials.map((c) => c.owner).filter(Boolean))), [s.socials]);
  const countByStatus = (channelId) => {
    const list = s.socialPosts.filter((p) => p.channelId === channelId);
    return {
      producing: list.filter((p) => ["Kế hoạch", "Đang làm", "Cần sửa"].includes(p.status)).length,
      pending: list.filter((p) => p.status === "Chờ duyệt").length,
      waitingPublish: list.filter((p) => ["Đã duyệt", "Chờ đăng"].includes(p.status)).length,
      published: list.filter((p) => ["Đã đăng", "Hoàn thành"].includes(p.status)).length
    };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Kênh Social", description: "Quản lý nhiều kênh social như những workspace riêng. Mở một kênh để vào sản xuất nội dung và theo dõi tăng trưởng.", actions: canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: addingCh, onOpenChange: setAddingCh, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddingCh(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        "Thêm kênh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo kênh social" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelForm, { onSubmit: (c) => s.add("socials", c), onClose: () => setAddingCh(false) })
      ] })
    ] }) : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm kênh...", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fBrand, onValueChange: setFBrand, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Thương hiệu" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả thương hiệu" }),
          s.brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fPlatform, onValueChange: setFPlatform, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Nền tảng" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả nền tảng" }),
          SOCIAL_PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
          SOCIAL_CHANNEL_STATUSES.map((s2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s2, children: s2 }, s2))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fOwner, onValueChange: setFOwner, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người phụ trách" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả PT" }),
          owners.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o))
        ] })
      ] })
    ] }),
    channels.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-5 w-5" }), title: s.socials.length === 0 ? "Chưa có kênh social" : "Không có kênh phù hợp bộ lọc", hint: s.socials.length === 0 ? "Tạo kênh social đầu tiên để bắt đầu quản lý nội dung đa nền tảng." : void 0, action: s.socials.length === 0 && canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAddingCh(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
      "Tạo kênh social đầu tiên"
    ] }) : void 0 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: channels.map((c) => {
      const brand = s.brands.find((b) => b.id === c.brandId);
      const k = countByStatus(c.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
              to: "/social/$id",
              params: {
                id: c.id
              }
            }), className: "font-semibold text-left hover:text-primary truncate block w-full", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: [
              c.platform,
              " · ",
              brand?.name || "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status })
        ] }),
        c.url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.url, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary hover:underline truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.url })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "PT: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: c.owner || "—" }),
          " · ",
          c.frequency || "Chưa đặt tần suất"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đang làm", v: k.producing }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chờ duyệt", v: k.pending, tone: "warn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Chờ đăng", v: k.waitingPublish, tone: "info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đã đăng", v: k.published, tone: "ok" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate({
            to: "/social/$id",
            params: {
              id: c.id
            }
          }), children: "Mở kênh" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            canPostCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setAddingPostFor(c), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FilePlusCorner, { className: "h-3.5 w-3.5 mr-1" }),
              "Thêm bài"
            ] }),
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditingCh(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) })
          ] })
        ] })
      ] }) }, c.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editingCh, onOpenChange: (o) => !o && setEditingCh(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa kênh social" }) }),
      editingCh && /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelForm, { initial: editingCh, onSubmit: (c) => s.update("socials", c.id, c), onClose: () => setEditingCh(null) })
    ] }) }),
    addingPostFor && /* @__PURE__ */ jsxRuntimeExports.jsx(PostFormDialog, { open: !!addingPostFor, onOpenChange: (o) => !o && setAddingPostFor(null), channel: addingPostFor, onSubmit: (p) => {
      s.add("socialPosts", p);
      setAddingPostFor(null);
    } })
  ] });
}
function Stat({
  label,
  v,
  tone
}) {
  const toneCls = tone === "ok" ? "text-success" : tone === "warn" ? "text-[oklch(0.55_0.13_75)]" : tone === "info" ? "text-info" : "text-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/40 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-base font-semibold leading-none ${toneCls}`, children: v }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1 uppercase tracking-wide", children: label })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "social.view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SocialPage, {}) });
export {
  SplitComponent as component
};
