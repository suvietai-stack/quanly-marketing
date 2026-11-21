import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useStore, u as useCurrentUser, P as PageHeader, B as Button, D as Dialog, be as DialogTrigger, x as DialogContent, y as DialogHeader, A as DialogTitle, bP as ensureSeoChecks, C as Card, o as CardContent, I as Input, aX as uid, L as Label, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { F as FilterBar, E as EmptyState } from "./Common-D50TzqoQ.mjs";
import { C as ContentForm } from "./ContentForm-CYy7twsa.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { F as FileText, a6 as Plus, G as Globe, ag as ExternalLink, at as ArrowRight, bH as FilePlusCorner, ao as Pencil } from "../_libs/lucide-react.mjs";
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
import "./SpecialtyStaffPicker-Bm4W_zzR.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const TYPES = ["Website thương hiệu", "Website bán hàng", "Website blog/SEO", "Landing page", "Website vệ tinh", "Khác"];
const STATUSES = ["Đang xây dựng", "Đang vận hành", "Đang tối ưu", "Tạm dừng", "Lưu trữ"];
function WebsiteForm({
  initial,
  onSubmit,
  onClose
}) {
  const {
    brands,
    people
  } = useStore();
  const [w, setW] = reactExports.useState({
    id: initial?.id || uid(),
    name: initial?.name || "",
    url: initial?.url || "",
    brandId: initial?.brandId || brands[0]?.id || "",
    type: initial?.type || "Website thương hiệu",
    seoOwner: initial?.seoOwner,
    contentOwner: initial?.contentOwner,
    techOwner: initial?.techOwner,
    status: initial?.status || "Đang xây dựng",
    goal: initial?.goal,
    notes: initial?.notes
  });
  const set = (p) => setW({
    ...w,
    ...p
  });
  const ps = (val, on) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: val || "_", onValueChange: (v) => on(v === "_" ? void 0 : v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
      people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên website *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: w.name, onChange: (e) => set({
          name: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: w.url, onChange: (e) => set({
          url: e.target.value
        }), placeholder: "https://..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thuộc thương hiệu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: w.brandId, onValueChange: (v) => set({
          brandId: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: w.type, onValueChange: (v) => set({
          type: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: w.status, onValueChange: (v) => set({
          status: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SEO phụ trách" }),
        ps(w.seoOwner, (v) => set({
          seoOwner: v
        }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Content phụ trách" }),
        ps(w.contentOwner, (v) => set({
          contentOwner: v
        }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kỹ thuật phụ trách" }),
        ps(w.techOwner, (v) => set({
          techOwner: v
        }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mục tiêu website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: w.goal || "", onChange: (e) => set({
          goal: e.target.value
        }), placeholder: "Ví dụ: Tăng đơn quà tặng doanh nghiệp" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: w.notes || "", onChange: (e) => set({
          notes: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (w.name && w.brandId) {
          onSubmit(w);
          onClose();
        }
      }, children: "Lưu" })
    ] })
  ] });
}
function WebsitesPage() {
  const s = useStore();
  const navigate = useNavigate();
  const {
    can
  } = useCurrentUser();
  const canCreate = can("web.create");
  const canEdit = can("web.edit");
  const {
    websites,
    brands,
    webContents,
    seoChecks
  } = s;
  const [search, setSearch] = reactExports.useState("");
  const [fBrand, setFBrand] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fType, setFType] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const [addContentFor, setAddContentFor] = reactExports.useState(null);
  const filtered = reactExports.useMemo(() => websites.filter((w) => (!search || w.name.toLowerCase().includes(search.toLowerCase()) || (w.url || "").toLowerCase().includes(search.toLowerCase())) && (fBrand === "all" || w.brandId === fBrand) && (fStatus === "all" || w.status === fStatus) && (fType === "all" || w.type === fType)), [websites, search, fBrand, fStatus, fType]);
  const stats = (id) => {
    const list = webContents.filter((c) => c.websiteId === id);
    const published = list.filter((c) => ["Đã đăng web", "Kiểm tra index", "Hoàn thành"].includes(c.status));
    return {
      producing: list.filter((c) => ["Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài"].includes(c.status)).length,
      pendingReview: list.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length,
      needFix: list.filter((c) => c.status === "Cần sửa outline" || c.status === "Cần sửa bài").length,
      published: published.length,
      notIndexed: published.filter((c) => (c.indexStatus || "Chưa kiểm tra") !== "Đã index").length
    };
  };
  const totalSites = websites.length;
  const operating = websites.filter((w) => w.status === "Đang vận hành").length;
  const totalContents = webContents.length;
  const pendingAll = webContents.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Dự Án Web", description: "Mỗi dự án web là một workspace riêng — bấm vào ô để mở chi tiết và quản lý nội dung.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/web-contents", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
        "Tất cả Content Web"
      ] }) }),
      canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: adding, onOpenChange: setAdding, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Thêm Website"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo Website" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WebsiteForm, { onSubmit: (w) => {
            s.add("websites", w);
            ensureSeoChecks(seoChecks, w.id).forEach((c) => s.add("seoChecks", c));
          }, onClose: () => setAdding(false) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Tổng dự án web" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-1.5", children: totalSites })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Đang vận hành" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-1.5 text-success", children: operating })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Tổng content" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-1.5", children: totalContents })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Chờ duyệt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-1.5 text-[oklch(0.45_0.13_75)]", children: pendingAll })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm dự án web...", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fBrand, onValueChange: setFBrand, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Thương hiệu" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả thương hiệu" }),
          brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fType, onValueChange: setFType, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Loại" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả loại" }),
          TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
          STATUSES.map((s2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s2, children: s2 }, s2))
        ] })
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5" }), title: s.websites.length === 0 ? "Chưa có dự án web" : "Không có dự án phù hợp bộ lọc", hint: s.websites.length === 0 ? "Tạo dự án web đầu tiên để bắt đầu quản lý nội dung, SEO và tăng trưởng." : "Thử bỏ bộ lọc.", action: s.websites.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
      "Tạo dự án web đầu tiên"
    ] }) : void 0 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: filtered.map((w) => {
      const st = stats(w.id);
      const brand = brands.find((b) => b.id === w.brandId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex flex-col hover:border-primary/40 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 flex-1 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
              to: "/websites/$id",
              params: {
                id: w.id
              }
            }), className: "text-left font-semibold leading-tight hover:text-primary truncate block w-full", title: w.name, children: w.name }),
            w.url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: w.url, target: "_blank", rel: "noreferrer", onClick: (e) => e.stopPropagation(), className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate max-w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: w.url.replace(/^https?:\/\//, "") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 shrink-0" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: w.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thương hiệu:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: brand?.name || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Loại:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: w.type })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "SEO:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: w.seoOwner || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Content:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: w.contentOwner || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Kỹ thuật:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: w.techOwner || "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-1.5 rounded-lg bg-muted/40 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { n: st.producing, label: "SX", tone: "info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { n: st.pendingReview, label: "Duyệt", tone: "warn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { n: st.needFix, label: "Sửa", tone: "danger" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { n: st.published, label: "Đăng", tone: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { n: st.notIndexed, label: "Chưa idx", tone: "warn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-auto pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "flex-1", onClick: () => navigate({
            to: "/websites/$id",
            params: {
              id: w.id
            }
          }), children: [
            "Mở dự án ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
          ] }),
          can("web.content_create") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setAddContentFor(w), title: "Thêm content", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePlusCorner, { className: "h-3.5 w-3.5" }) }),
          canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditing(w), title: "Chỉnh sửa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }) }, w.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa Website" }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx(WebsiteForm, { initial: editing, onSubmit: (w) => s.update("websites", w.id, w), onClose: () => setEditing(null) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!addContentFor, onOpenChange: (o) => !o && setAddContentFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Thêm content cho: ",
        addContentFor?.name
      ] }) }),
      addContentFor && /* @__PURE__ */ jsxRuntimeExports.jsx(ContentForm, { websiteId: addContentFor.id, brandId: addContentFor.brandId, onSubmit: (c) => s.add("webContents", c), onClose: () => setAddContentFor(null) })
    ] }) })
  ] });
}
function Stat({
  n,
  label,
  tone
}) {
  const colors = {
    info: "text-info",
    warn: "text-[oklch(0.45_0.13_75)]",
    danger: "text-destructive",
    success: "text-success"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-base font-semibold leading-none ${colors[tone]}`, children: n }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1", children: label })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["web.view", "web.view_all", "web.view_mine"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(WebsitesPage, {}) });
export {
  SplitComponent as component
};
