import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { bz as Route$H, b as useStore, P as PageHeader, C as Card, O as CardHeader, Q as CardTitle, o as CardContent, D as Dialog, be as DialogTrigger, B as Button, x as DialogContent, y as DialogHeader, A as DialogTitle, f as fmtDate, aX as uid, L as Label, I as Input, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { C as ComingSoon } from "./Common-D50TzqoQ.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { A as ArrowLeft, a6 as Plus, ao as Pencil, ap as Trash2, a4 as Star } from "../_libs/lucide-react.mjs";
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
const M_STATUS = ["Kế hoạch", "Đang làm", "Chờ duyệt", "Cần sửa", "Đã duyệt", "Chờ đăng", "Đã đăng", "Hoàn thành"];
function PostForm({
  placeId,
  brandId,
  initial,
  onSubmit,
  onClose
}) {
  const {
    people,
    plans,
    topics
  } = useStore();
  const [p, setP] = reactExports.useState({
    id: initial?.id || uid(),
    title: initial?.title || "",
    placeId,
    brandId,
    content: initial?.content,
    type: initial?.type || "Cập nhật",
    owner: initial?.owner,
    scheduledDate: initial?.scheduledDate,
    publishedDate: initial?.publishedDate,
    imageLink: initial?.imageLink,
    publishedLink: initial?.publishedLink,
    status: initial?.status || "Ý tưởng",
    plan: initial?.plan,
    topic: initial?.topic,
    notes: initial?.notes
  });
  const set = (x) => setP({
    ...p,
    ...x
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên bài đăng *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.title, onChange: (e) => set({
          title: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.type, onValueChange: (v) => set({
          type: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cập nhật", "Sản phẩm", "Ưu đãi", "Sự kiện", "Khác"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: p.status, onValueChange: (v) => set({
          status: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: M_STATUS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người PT" }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày dự kiến" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: p.scheduledDate || "", onChange: (e) => set({
          scheduledDate: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: p.content || "", onChange: (e) => set({
          content: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link ảnh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.imageLink || "", onChange: (e) => set({
          imageLink: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: p.publishedLink || "", onChange: (e) => set({
          publishedLink: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (p.title.trim()) {
          onSubmit(p);
          onClose();
        }
      }, children: "Lưu" })
    ] })
  ] });
}
function ReviewForm({
  placeId,
  initial,
  onSubmit,
  onClose
}) {
  const {
    people
  } = useStore();
  const [r, setR] = reactExports.useState({
    id: initial?.id || uid(),
    placeId,
    reviewer: initial?.reviewer || "",
    stars: initial?.stars || 5,
    content: initial?.content,
    date: initial?.date,
    responseStatus: initial?.responseStatus || "Chưa phản hồi",
    responder: initial?.responder,
    notes: initial?.notes
  });
  const set = (x) => setR({
    ...r,
    ...x
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên người đánh giá *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.reviewer, onChange: (e) => set({
          reviewer: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số sao" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 5, value: r.stars, onChange: (e) => set({
          stars: Number(e.target.value)
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: r.date || "", onChange: (e) => set({
          date: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái phản hồi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.responseStatus, onValueChange: (v) => set({
          responseStatus: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Chưa phản hồi", "Đã phản hồi"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phản hồi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.responder || "_", onValueChange: (v) => set({
          responder: v === "_" ? void 0 : v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            people.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x.name, children: x.name }, x.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: r.content || "", onChange: (e) => set({
          content: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (r.reviewer.trim()) {
          onSubmit(r);
          onClose();
        }
      }, children: "Lưu" })
    ] })
  ] });
}
function PlaceDetail() {
  const {
    id
  } = Route$H.useParams();
  const s = useStore();
  const place = s.places.find((p) => p.id === id);
  const [addingPost, setAddingPost] = reactExports.useState(false);
  const [editingPost, setEditingPost] = reactExports.useState(null);
  const [addingReview, setAddingReview] = reactExports.useState(false);
  const [editingReview, setEditingReview] = reactExports.useState(null);
  if (!place) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center", children: [
    "Không tìm thấy. ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/local", className: "text-primary", children: "Quay lại" })
  ] });
  const brand = s.brands.find((b) => b.id === place.brandId);
  const posts = s.mapPosts.filter((p) => p.placeId === place.id);
  const reviews = s.reviews.filter((r) => r.placeId === place.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/local", className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
      "Tất cả địa điểm"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: place.name, description: `${brand?.name || "—"} · ${place.address || ""}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: place.verifyStatus }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "overview", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "Hồ sơ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "posts", children: [
          "Lịch đăng (",
          posts.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "reviews", children: [
          "Review (",
          reviews.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "report", children: "Báo cáo Local" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", className: "mt-4 grid gap-4 lg:grid-cols-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông tin" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Địa chỉ", v: place.address }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "SĐT", v: place.phone }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Link Map", v: place.mapLink }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Thương hiệu", v: brand?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "PT", v: place.owner }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Xác minh", v: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: place.verifyStatus }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "posts", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: addingPost, onOpenChange: setAddingPost, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
            "Thêm bài"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo bài Map" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PostForm, { placeId: place.id, brandId: place.brandId, onSubmit: (p) => s.add("mapPosts", p), onClose: () => setAddingPost(false) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Bài" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Loại" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Lịch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-4 py-2.5" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
            posts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "text-center py-10 text-muted-foreground", children: "Chưa có bài." }) }),
            posts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: p.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: p.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: fmtDate(p.scheduledDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: p.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditingPost(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => s.remove("mapPosts", p.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }, p.id))
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "reviews", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: addingReview, onOpenChange: setAddingReview, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
            "Thêm review"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Thêm review" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewForm, { placeId: place.id, onSubmit: (r) => s.add("reviews", r), onClose: () => setAddingReview(false) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          reviews.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-10", children: "Chưa có review." }),
          reviews.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.reviewer }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mt-0.5", children: Array.from({
                length: r.stars
              }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 fill-warning text-warning" }, i)) }),
              r.content && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-muted-foreground", children: r.content }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1.5", children: [
                fmtDate(r.date),
                " ",
                r.responder && `· Phản hồi: ${r.responder}`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: r.responseStatus }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditingReview(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => s.remove("reviews", r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] })
          ] }) }) }, r.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "report", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComingSoon, { title: "Báo cáo Local", items: ["Lượt tìm kiếm", "Lượt xem ảnh", "Cuộc gọi", "Chỉ đường"] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editingPost, onOpenChange: (o) => !o && setEditingPost(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa bài Map" }) }),
      editingPost && /* @__PURE__ */ jsxRuntimeExports.jsx(PostForm, { placeId: place.id, brandId: place.brandId, initial: editingPost, onSubmit: (p) => s.update("mapPosts", p.id, p), onClose: () => setEditingPost(null) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editingReview, onOpenChange: (o) => !o && setEditingReview(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa review" }) }),
      editingReview && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewForm, { placeId: place.id, initial: editingReview, onSubmit: (r) => s.update("reviews", r.id, r), onClose: () => setEditingReview(null) })
    ] }) })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right break-all", children: v ?? "—" })
  ] });
}
export {
  PlaceDetail as component
};
