import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { by as Route$R, b as useStore, u as useCurrentUser, B as Button, P as PageHeader, C as Card, O as CardHeader, Q as CardTitle, o as CardContent, I as Input, l as Badge, L as Label, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter, aX as uid } from "./router-CkmTURa-.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, G as Globe, K as Share2, N as MapPin, F as FileText, m as Save, a6 as Plus, ag as ExternalLink, ao as Pencil, ap as Trash2, bv as StickyNote } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const BRAND_STATUS = ["Đang xây dựng", "Đang vận hành", "Đang tối ưu", "Tạm dừng", "Lưu trữ"];
const DOC_TYPES = ["Brand guideline", "Content guideline", "SEO guideline", "Social guideline", "Hình ảnh sản phẩm", "Catalogue/Profile", "Báo giá", "Tài liệu khác"];
const NOTE_IMPORTANCE = ["Thông thường", "Quan trọng", "Cần chú ý"];
const NOTE_STATUS = ["Mở", "Đã xử lý", "Đóng"];
function BrandDetail() {
  const {
    id
  } = Route$R.useParams();
  const navigate = useNavigate();
  const s = useStore();
  const {
    can,
    user
  } = useCurrentUser();
  const brand = s.brands.find((b) => b.id === id);
  if (!brand) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Không tìm thấy thương hiệu." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", onClick: () => navigate({
        to: "/brands"
      }), children: "Quay lại danh sách" })
    ] });
  }
  const canEdit = can("brand.edit");
  const canProfile = canEdit || can("brand.profile");
  const canContact = canEdit || can("brand.contact");
  const canIdentity = canEdit || can("brand.identity");
  const canDocs = canEdit || can("brand.docs");
  const canNotes = canEdit || can("brand.notes");
  const canChannels = canEdit || can("brand.view_channels");
  const websites = s.websites.filter((w) => w.brandId === brand.id);
  const socials = s.socials.filter((c) => c.brandId === brand.id);
  const places = s.places.filter((p) => p.brandId === brand.id);
  const tasks = s.tasks.filter((t) => t.brandId === brand.id);
  const contents = s.webContents.filter((c) => c.brandId === brand.id);
  const orders = s.orders.filter((o) => o.brandId === brand.id);
  const openTasks = tasks.filter((t) => t.status !== "Hoàn thành" && t.status !== "Đã hủy").length;
  const producingContents = contents.filter((c) => c.status !== "Hoàn thành").length;
  const openOrders = orders.filter((o) => o.status !== "Đã duyệt" && o.status !== "Đã hủy").length;
  const update = (patch) => s.update("brands", brand.id, {
    ...brand,
    ...patch
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/brands", className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
      "Tất cả thương hiệu"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: brand.name, description: [brand.field, brand.projectName].filter(Boolean).join(" • ") || void 0, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: brand.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground hidden sm:inline", children: [
        "PT: ",
        brand.owner || "—"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: "Thông tin dự án" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "contact", children: "Thông tin liên hệ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "channels", children: "Hệ sinh thái kênh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "identity", children: "Nhận diện" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "docs", children: "Tài liệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "notes", children: "Ghi chú" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "profile", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileTab, { brand, update, canEdit: canProfile, people: s.people }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Tổng quan liên kết" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { icon: Globe, label: "Website", value: websites.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { icon: Share2, label: "Social", value: socials.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { icon: MapPin, label: "Local Map", value: places.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { icon: FileText, label: "Task mở", value: openTasks }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { icon: FileText, label: "Content SX", value: producingContents }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatBox, { icon: FileText, label: "Order mở", value: openOrders })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contact", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactTab, { brand, update, canEdit: canContact }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "channels", className: "mt-4 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelsTab, { brand, websites, socials, places, canManage: canChannels }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "identity", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IdentityTab, { brand, update, canEdit: canIdentity }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "docs", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocsTab, { brand, update, canEdit: canDocs, meName: user?.fullName || "" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "notes", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotesTab, { brand, update, canEdit: canNotes, meName: user?.fullName || "" }) })
    ] })
  ] });
}
function ProfileTab({
  brand,
  update,
  canEdit,
  people
}) {
  const [draft, setDraft] = reactExports.useState(brand);
  const set = (p) => setDraft({
    ...draft,
    ...p
  });
  const dirty = reactExports.useMemo(() => JSON.stringify(draft) !== JSON.stringify(brand), [draft, brand]);
  const save = () => {
    if (!canEdit) {
      toast.error("Bạn không có quyền chỉnh sửa.");
      return;
    }
    if (!draft.name.trim()) {
      toast.error("Tên thương hiệu bắt buộc.");
      return;
    }
    update(draft);
    toast.success("Đã lưu hồ sơ thương hiệu.");
  };
  const ro = !canEdit;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Hồ sơ dự án" }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: !dirty, onClick: save, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1.5" }),
        "Lưu thay đổi"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên thương hiệu *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.name, readOnly: ro, onChange: (e) => set({
        name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên dự án", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.projectName || "", readOnly: ro, onChange: (e) => set({
        projectName: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lĩnh vực / Ngành hàng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.field || "", readOnly: ro, onChange: (e) => set({
        field: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Website chính", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.website || "", readOnly: ro, onChange: (e) => set({
        website: e.target.value
      }), placeholder: "https://..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người phụ trách", children: ro ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.owner || "", readOnly: true }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.owner || "_", onValueChange: (v) => set({
        owner: v === "_" ? void 0 : v
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
          people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trạng thái", children: ro ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.status, readOnly: true }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: draft.status, onValueChange: (v) => set({
        status: v
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BRAND_STATUS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày bắt đầu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: draft.startDate || "", readOnly: ro, onChange: (e) => set({
        startDate: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mô tả ngắn", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.description || "", readOnly: ro, onChange: (e) => set({
        description: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mô tả chi tiết dự án", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: draft.longDescription || "", readOnly: ro, onChange: (e) => set({
        longDescription: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mục tiêu marketing", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.marketingGoal || "", readOnly: ro, onChange: (e) => set({
        marketingGoal: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tệp khách hàng mục tiêu", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.targetAudience || "", readOnly: ro, onChange: (e) => set({
        targetAudience: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sản phẩm / dịch vụ chính", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.mainProducts || "", readOnly: ro, onChange: (e) => set({
        mainProducts: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "USP / Điểm khác biệt", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.usp || "", readOnly: ro, onChange: (e) => set({
        usp: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: draft.notes || "", readOnly: ro, onChange: (e) => set({
        notes: e.target.value
      }) }) })
    ] })
  ] });
}
function ContactTab({
  brand,
  update,
  canEdit
}) {
  const [d, setD] = reactExports.useState(brand);
  const set = (p) => setD({
    ...d,
    ...p
  });
  const dirty = JSON.stringify(d) !== JSON.stringify(brand);
  const ro = !canEdit;
  const save = () => {
    if (!canEdit) return toast.error("Không có quyền.");
    update(d);
    toast.success("Đã lưu thông tin liên hệ.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông tin liên hệ thống nhất" }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: !dirty, onClick: save, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1.5" }),
        "Lưu"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên pháp lý / đơn vị", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.legalName || "", readOnly: ro, onChange: (e) => set({
        legalName: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người đại diện / đầu mối", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.contactPerson || "", readOnly: ro, onChange: (e) => set({
        contactPerson: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Số điện thoại chính", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.mainPhone || "", readOnly: ro, onChange: (e) => set({
        mainPhone: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Hotline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.hotline || "", readOnly: ro, onChange: (e) => set({
        hotline: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.email || "", readOnly: ro, onChange: (e) => set({
        email: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Website chính", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.website || "", readOnly: ro, onChange: (e) => set({
        website: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Zalo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.zalo || "", readOnly: ro, onChange: (e) => set({
        zalo: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fanpage chính", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.fanpage || "", readOnly: ro, onChange: (e) => set({
        fanpage: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Google Map chính", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.mapLink || "", readOnly: ro, onChange: (e) => set({
        mapLink: e.target.value
      }), placeholder: "https://maps..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Địa chỉ showroom / VP", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.officeAddress || "", readOnly: ro, onChange: (e) => set({
        officeAddress: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Địa chỉ xưởng / kho", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.warehouseAddress || "", readOnly: ro, onChange: (e) => set({
        warehouseAddress: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Khu vực phục vụ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.serviceArea || "", readOnly: ro, onChange: (e) => set({
        serviceArea: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mã số thuế", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.taxCode || "", readOnly: ro, onChange: (e) => set({
        taxCode: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú liên hệ", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.contactNotes || "", readOnly: ro, onChange: (e) => set({
        contactNotes: e.target.value
      }) }) })
    ] })
  ] });
}
function ChannelsTab({
  brand,
  websites,
  socials,
  places,
  canManage
}) {
  const [open, setOpen] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelGroup, { icon: Globe, title: "Website", items: websites.map((w) => ({
      id: w.id,
      name: w.name,
      sub: w.url,
      extra: `SEO: ${w.seoOwner || "—"} • Content: ${w.contentOwner || "—"}`,
      status: w.status,
      href: {
        to: "/websites/$id",
        params: {
          id: w.id
        }
      }
    })), onAdd: canManage ? () => setOpen("web") : void 0, emptyHint: "Chưa có dự án web cho thương hiệu này." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelGroup, { icon: Share2, title: "Social", items: socials.map((c) => ({
      id: c.id,
      name: c.name,
      sub: c.url,
      extra: `${c.platform} • PT: ${c.owner || "—"}`,
      status: c.status,
      href: {
        to: "/social/$id",
        params: {
          id: c.id
        }
      }
    })), onAdd: canManage ? () => setOpen("social") : void 0, emptyHint: "Chưa có kênh social cho thương hiệu này." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelGroup, { icon: MapPin, title: "Local Map", items: places.map((p) => ({
      id: p.id,
      name: p.name,
      sub: p.address || p.mapLink,
      extra: `PT: ${p.owner || "—"}`,
      status: p.verifyStatus,
      href: {
        to: "/local/$id",
        params: {
          id: p.id
        }
      }
    })), onAdd: canManage ? () => setOpen("local") : void 0, emptyHint: "Chưa có địa điểm Local Map cho thương hiệu này." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAddDialog, { open, onClose: () => setOpen(null), brandId: brand.id })
  ] });
}
function ChannelGroup({
  icon: Icon,
  title,
  items,
  onAdd,
  emptyHint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" }),
        title,
        " (",
        items.length,
        ")"
      ] }),
      onAdd && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Thêm ",
        title.toLowerCase()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-6 text-sm text-muted-foreground", children: emptyHint }),
      items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 hover:bg-muted/30 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: it.name }),
          it.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: it.sub }),
          it.extra && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: it.extra })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: it.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { ...it.href, children: "Mở" }) })
        ] })
      ] }, it.id))
    ] }) })
  ] });
}
function QuickAddDialog({
  open,
  onClose,
  brandId
}) {
  const {
    add
  } = useStore();
  const [name, setName] = reactExports.useState("");
  const [url, setUrl] = reactExports.useState("");
  const [platform, setPlatform] = reactExports.useState("Facebook Page");
  const [address, setAddress] = reactExports.useState("");
  const reset = () => {
    setName("");
    setUrl("");
    setAddress("");
    setPlatform("Facebook Page");
  };
  const submit = () => {
    if (!name.trim()) return;
    if (open === "web") add("websites", {
      id: uid(),
      name,
      url,
      brandId,
      type: "Website thương hiệu",
      status: "Đang xây dựng"
    });
    else if (open === "social") add("socials", {
      id: uid(),
      name,
      url,
      platform,
      brandId,
      status: "Đang xây"
    });
    else if (open === "local") add("places", {
      id: uid(),
      name,
      mapLink: url,
      address,
      brandId,
      verifyStatus: "Chưa xác minh"
    });
    toast.success("Đã thêm.");
    reset();
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!open, onOpenChange: (o) => {
    if (!o) {
      reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      open === "web" && "Thêm website cho thương hiệu",
      open === "social" && "Thêm kênh social cho thương hiệu",
      open === "local" && "Thêm Local Map cho thương hiệu"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value) })
      ] }),
      open === "social" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nền tảng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: platform, onValueChange: (v) => setPlatform(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Facebook Page", "Facebook Group", "TikTok", "YouTube", "Instagram", "Zalo OA", "LinkedIn", "Khác"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: open === "local" ? "Link Google Map" : "URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://..." })
      ] }),
      open === "local" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Địa chỉ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: address, onChange: (e) => setAddress(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => {
        reset();
        onClose();
      }, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, children: "Lưu" })
    ] })
  ] }) });
}
function IdentityTab({
  brand,
  update,
  canEdit
}) {
  const [d, setD] = reactExports.useState(brand);
  const set = (p) => setD({
    ...d,
    ...p
  });
  const dirty = JSON.stringify(d) !== JSON.stringify(brand);
  const ro = !canEdit;
  const save = () => {
    if (!canEdit) return toast.error("Không có quyền.");
    update(d);
    toast.success("Đã lưu nhận diện.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Nhận diện thương hiệu" }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: !dirty, onClick: save, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1.5" }),
        "Lưu"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Logo chính (URL/Drive)", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.logoMain || "", readOnly: ro, onChange: (e) => set({
        logoMain: e.target.value
      }), placeholder: "https://..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Logo phụ (URL/Drive)", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.logoSecondary || "", readOnly: ro, onChange: (e) => set({
        logoSecondary: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Màu chính", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.colorPrimary || "", readOnly: ro, onChange: (e) => set({
          colorPrimary: e.target.value
        }), placeholder: "#000000" }),
        d.colorPrimary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded border", style: {
          background: d.colorPrimary
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Màu phụ", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.colorSecondary || "", readOnly: ro, onChange: (e) => set({
          colorSecondary: e.target.value
        }), placeholder: "#ffffff" }),
        d.colorSecondary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded border", style: {
          background: d.colorSecondary
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Font chữ thương hiệu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.brandFont || "", readOnly: ro, onChange: (e) => set({
        brandFont: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Slogan / Tagline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.slogan || "", readOnly: ro, onChange: (e) => set({
        slogan: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tone giọng nội dung", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.toneOfVoice || "", readOnly: ro, onChange: (e) => set({
        toneOfVoice: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phong cách hình ảnh", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.imageStyle || "", readOnly: ro, onChange: (e) => set({
        imageStyle: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Từ khóa thương hiệu", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.brandKeywords || "", readOnly: ro, onChange: (e) => set({
        brandKeywords: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quy chuẩn sử dụng logo", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.logoUsage || "", readOnly: ro, onChange: (e) => set({
        logoUsage: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú nhận diện", full: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.identityNotes || "", readOnly: ro, onChange: (e) => set({
        identityNotes: e.target.value
      }) }) })
    ] })
  ] });
}
function DocsTab({
  brand,
  update,
  canEdit,
  meName
}) {
  const docs = brand.documents || [];
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const saveDoc = (doc) => {
    const next = docs.some((x) => x.id === doc.id) ? docs.map((x) => x.id === doc.id ? doc : x) : [...docs, doc];
    update({
      documents: next
    });
    toast.success("Đã lưu tài liệu.");
  };
  const removeDoc = (id) => {
    update({
      documents: docs.filter((x) => x.id !== id)
    });
    toast.success("Đã xóa tài liệu.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
        "Tài liệu / Guideline (",
        docs.length,
        ")"
      ] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAdding(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Thêm tài liệu"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
      docs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-6 text-sm text-muted-foreground", children: "Chưa có tài liệu nào." }),
      docs.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 flex items-start justify-between gap-3 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            d.name,
            d.type && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: d.type })
          ] }),
          d.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: d.notes }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            d.updatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Cập nhật: ",
              new Date(d.updatedAt).toLocaleDateString("vi-VN"),
              " "
            ] }),
            d.updatedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "• ",
              d.updatedBy
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          d.url && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: d.url, target: "_blank", rel: "noreferrer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 mr-1" }),
            "Mở"
          ] }) }),
          canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(d), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeDoc(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, d.id))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DocDialog, { open: adding || !!editing, initial: editing || void 0, onClose: () => {
      setAdding(false);
      setEditing(null);
    }, onSave: (d) => saveDoc({
      ...d,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedBy: meName
    }) })
  ] });
}
function DocDialog({
  open,
  initial,
  onClose,
  onSave
}) {
  const [d, setD] = reactExports.useState(initial || {
    id: uid(),
    name: "",
    type: "Tài liệu khác"
  });
  const set = (p) => setD({
    ...d,
    ...p
  });
  reactExports.useMemo(() => {
    if (open) setD(initial || {
      id: uid(),
      name: "",
      type: "Tài liệu khác"
    });
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Sửa tài liệu" : "Thêm tài liệu" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên tài liệu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.name, onChange: (e) => set({
          name: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: d.type || "Tài liệu khác", onValueChange: (v) => set({
          type: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DOC_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link tài liệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.url || "", onChange: (e) => set({
          url: e.target.value
        }), placeholder: "https://..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.notes || "", onChange: (e) => set({
          notes: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (!d.name.trim()) return toast.error("Tên bắt buộc.");
        onSave(d);
        onClose();
      }, children: "Lưu" })
    ] })
  ] }) });
}
function NotesTab({
  brand,
  update,
  canEdit,
  meName
}) {
  const notes = brand.operationalNotes || [];
  const [adding, setAdding] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const saveNote = (n) => {
    const next = notes.some((x) => x.id === n.id) ? notes.map((x) => x.id === n.id ? n : x) : [...notes, n];
    update({
      operationalNotes: next
    });
    toast.success("Đã lưu ghi chú.");
  };
  const removeNote = (id) => {
    update({
      operationalNotes: notes.filter((x) => x.id !== id)
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
        "Ghi chú vận hành (",
        notes.length,
        ")"
      ] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAdding(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Thêm ghi chú"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
      notes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-6 text-sm text-muted-foreground", children: "Chưa có ghi chú vận hành." }),
      notes.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 flex items-start justify-between gap-3 hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            n.importance && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: n.importance === "Cần chú ý" ? "destructive" : n.importance === "Quan trọng" ? "default" : "secondary", className: "text-xs", children: n.importance }),
            n.status && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: n.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-2 whitespace-pre-wrap", children: n.content }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            n.createdBy || "—",
            n.createdAt && ` • ${new Date(n.createdAt).toLocaleString("vi-VN")}`
          ] })
        ] }),
        canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(n), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeNote(n.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, n.id))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NoteDialog, { open: adding || !!editing, initial: editing || void 0, meName, onClose: () => {
      setAdding(false);
      setEditing(null);
    }, onSave: saveNote })
  ] });
}
function NoteDialog({
  open,
  initial,
  meName,
  onClose,
  onSave
}) {
  const blank = () => ({
    id: uid(),
    content: "",
    importance: "Thông thường",
    status: "Mở",
    createdBy: meName,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  const [n, setN] = reactExports.useState(initial || blank());
  const set = (p) => setN({
    ...n,
    ...p
  });
  reactExports.useMemo(() => {
    if (open) setN(initial || blank());
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Sửa ghi chú" : "Thêm ghi chú" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: n.content, onChange: (e) => set({
          content: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mức độ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: n.importance || "Thông thường", onValueChange: (v) => set({
            importance: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: NOTE_IMPORTANCE.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: n.status || "Mở", onValueChange: (v) => set({
            status: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: NOTE_STATUS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (!n.content.trim()) return toast.error("Nội dung bắt buộc.");
        onSave(n);
        onClose();
      }, children: "Lưu" })
    ] })
  ] }) });
}
function Field({
  label,
  children,
  full
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: full ? "sm:col-span-2" : void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children })
  ] });
}
function StatBox({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/30 px-3 py-3 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-lg mt-1", children: value })
  ] });
}
export {
  BrandDetail as component
};
