import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useStore, u as useCurrentUser, bj as Route$12, P as PageHeader, D as Dialog, be as DialogTrigger, B as Button, x as DialogContent, y as DialogHeader, A as DialogTitle, I as Input, bk as CONTENT_STATUSES, bl as CONTENT_TYPES, f as fmtDate, C as Card, o as CardContent, bm as ContentCalendar } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { C as ContentForm } from "./ContentForm-CYy7twsa.mjs";
import { C as ContentDetail } from "./ContentDetail-BzefX6f_.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { a6 as Plus, f as Search, g as SlidersHorizontal, bk as Table, i as LayoutGrid, bl as Calendar, F as FileText, s as ChevronRight, ag as ExternalLink } from "../_libs/lucide-react.mjs";
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
import "./textarea-BGZgnbbj.mjs";
import "./SpecialtyStaffPicker-Bm4W_zzR.mjs";
import "./marketingSpecialties-CqUITqGr.mjs";
import "./design-BrHT-rw4.mjs";
import "./tabs-CeCgkx-c.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "./DesignAssigneePicker-DC39EkqM.mjs";
import "./DesignReviewerPicker-Cn1Hqf7M.mjs";
import "./api-Bf_55NQ7.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
function AllContents() {
  const s = useStore();
  const {
    user,
    can,
    scopeList
  } = useCurrentUser();
  const userName = user?.fullName || user?.username || "";
  const canCreate = can("web.content_create");
  const {
    webContents,
    websites,
    brands,
    plans,
    topics
  } = s;
  const [view, setView] = reactExports.useState("table");
  const [filtersOpen, setFiltersOpen] = reactExports.useState(false);
  const [adding, setAdding] = reactExports.useState(false);
  const [openContent, setOpenContent] = reactExports.useState(null);
  const {
    open: openId
  } = Route$12.useSearch();
  const navigate = Route$12.useNavigate();
  const [denied, setDenied] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [fWebsite, setFWebsite] = reactExports.useState("all");
  const [fBrand, setFBrand] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fType, setFType] = reactExports.useState("all");
  const [fIndex, setFIndex] = reactExports.useState("all");
  const [fPlan, setFPlan] = reactExports.useState("all");
  const [fTopic, setFTopic] = reactExports.useState("all");
  const [fWriter, setFWriter] = reactExports.useState("all");
  const writers = Array.from(new Set(webContents.map((c) => c.writer).filter(Boolean)));
  const scoped = reactExports.useMemo(() => scopeList(webContents, "web.content_view_all", "web.content_view_mine", (c) => !!userName && (c.writer === userName || c.outlineReviewer === userName || c.draftReviewer === userName || c.publisher === userName || c.assigner === userName)), [webContents, scopeList, userName]);
  reactExports.useEffect(() => {
    if (!openId) return;
    const c = scoped.find((x) => x.id === openId);
    if (c) {
      setOpenContent(c);
      setDenied(false);
    } else if (webContents.length) setDenied(true);
  }, [openId, scoped, webContents.length]);
  reactExports.useEffect(() => {
    if (openContent) setOpenContent(webContents.find((x) => x.id === openContent.id) ?? null);
  }, [webContents]);
  const filtered = reactExports.useMemo(() => scoped.filter((c) => (!search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.mainKeyword || "").toLowerCase().includes(search.toLowerCase())) && (fWebsite === "all" || c.websiteId === fWebsite) && (fBrand === "all" || c.brandId === fBrand) && (fStatus === "all" || c.status === fStatus) && (fType === "all" || c.type === fType) && (fIndex === "all" || c.indexStatus === fIndex) && (fPlan === "all" || c.plan === fPlan) && (fTopic === "all" || c.topic === fTopic) && (fWriter === "all" || c.writer === fWriter)), [scoped, search, fWebsite, fBrand, fStatus, fType, fIndex, fPlan, fTopic, fWriter]);
  const filterCount = [fWebsite, fBrand, fStatus, fType, fIndex, fPlan, fTopic, fWriter].filter((v) => v !== "all").length;
  const resetFilters = () => {
    setFWebsite("all");
    setFBrand("all");
    setFStatus("all");
    setFType("all");
    setFIndex("all");
    setFPlan("all");
    setFTopic("all");
    setFWriter("all");
  };
  const calendarItems = filtered.filter((c) => c.publishedAt || c.publishDate).sort((a, b) => (a.publishedAt || a.publishDate || "").localeCompare(b.publishedAt || b.publishDate || ""));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "content-web-mobile min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Tất cả Content Web", description: "Tổng hợp toàn bộ content của mọi website — leader xem nhanh tình hình sản xuất và xét duyệt.", actions: canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: adding, onOpenChange: setAdding, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "min-h-11 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Thêm bài"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "content-mobile-dialog max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo bài content" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ContentForm, { lockWebsite: false, onSubmit: (c) => s.add("webContents", c), onClose: () => setAdding(false) })
      ] })
    ] }) : void 0 }),
    denied && openId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm", children: [
      "Bài viết không tồn tại hoặc bạn không có quyền xem.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ml-2 underline", onClick: () => {
        setDenied(false);
        navigate({
          search: {}
        });
      }, children: "Đóng" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-3 mb-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm bài viết theo tiêu đề hoặc từ khóa", placeholder: "Tìm tiêu đề, từ khóa…", value: search, onChange: (e) => setSearch(e.target.value), className: "h-11 pl-10 rounded-xl text-base" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: filterCount ? "secondary" : "outline", className: "md:hidden min-h-11 rounded-xl", "aria-expanded": filtersOpen, "aria-controls": "content-web-filters", onClick: () => setFiltersOpen((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }),
          "Lọc",
          filterCount ? ` (${filterCount})` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "content-web-filters", className: `${filtersOpen ? "grid" : "hidden"} grid-cols-1 md:flex md:flex-wrap gap-2`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fWebsite, onValueChange: setFWebsite, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[180px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Website" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả website" }),
            websites.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fBrand, onValueChange: setFBrand, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[160px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Thương hiệu" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả TH" }),
            brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[170px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
            CONTENT_STATUSES.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: st, children: st }, st))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fType, onValueChange: setFType, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[150px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Loại" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả loại" }),
            CONTENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fIndex, onValueChange: setFIndex, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[140px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Index" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả index" }),
            ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s2, children: s2 }, s2))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fWriter, onValueChange: setFWriter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[160px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người viết" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả người viết" }),
            writers.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w, children: w }, w))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fPlan, onValueChange: setFPlan, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[150px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Plan" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả plan" }),
            plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fTopic, onValueChange: setFTopic, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full md:w-[150px] min-h-11 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Topic" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả topic" }),
            topics.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] }),
        filterCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "min-h-11", onClick: resetFilters, children: "Xóa bộ lọc" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "content-view-switch grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "table" ? "secondary" : "ghost", "aria-pressed": view === "table", onClick: () => setView("table"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "h-4 w-4" }),
          "Danh sách"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "kanban" ? "secondary" : "ghost", "aria-pressed": view === "kanban", onClick: () => setView("kanban"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }),
          "Tiến độ"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "calendar" ? "secondary" : "ghost", "aria-pressed": view === "calendar", onClick: () => setView("calendar"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
          "Lịch đăng"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
        filtered.length,
        " bài viết ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
          "/ ",
          scoped.length,
          " trong phạm vi của bạn"
        ] })
      ] }),
      (search || filterCount > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
        setSearch("");
        resetFilters();
      }, children: "Đặt lại" })
    ] }),
    filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 mx-auto mb-3 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Không có bài viết phù hợp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Thử từ khóa khác hoặc đặt lại bộ lọc." })
    ] }),
    view === "table" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:hidden", children: filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "overflow-hidden rounded-2xl border bg-card shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full text-left p-4", onClick: () => setOpenContent(c), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
          websites.find((w) => w.id === c.websiteId)?.name || "Website",
          " · ",
          brands.find((b) => b.id === c.brandId)?.name || "Chưa chọn thương hiệu"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 my-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.indexStatus })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold leading-6 break-words", children: c.title }),
        c.mainKeyword && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground break-words", children: [
          "Từ khóa: ",
          c.mainKeyword
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground block mb-1", children: "Người viết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium break-words", children: c.writer || "Chưa phân công" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground block mb-1", children: "Hạn hoàn thành" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.deadline ? fmtDate(c.deadline) : "Chưa đặt hạn" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center gap-2 mt-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 text-muted-foreground break-words", children: [
            c.type,
            " · Đăng: ",
            fmtDate(c.publishedAt || c.publishDate)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 inline-flex items-center text-primary", children: [
            "Chi tiết",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          ] })
        ] })
      ] }),
      (c.publishedLink || c.draftLink) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.publishedLink || c.draftLink, target: "_blank", rel: "noreferrer", className: "min-h-11 inline-flex items-center gap-2 text-xs text-primary font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
        c.publishedLink ? "Mở bài đã đăng" : "Mở bản thảo"
      ] }) })
    ] }, c.id)) }),
    view === "table" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tiêu đề" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Thương hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Loại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Người viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Link" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, className: "px-4 py-12 text-center text-muted-foreground", children: "Không có content phù hợp." }) }),
        filtered.map((c) => {
          const w = websites.find((x) => x.id === c.websiteId);
          const b = brands.find((x) => x.id === c.brandId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 cursor-pointer", onClick: () => setOpenContent(c), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 font-medium", children: [
              c.title,
              c.mainKeyword && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "KW: ",
                c.mainKeyword
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/websites/$id", params: {
              id: c.websiteId
            }, onClick: (e) => e.stopPropagation(), className: "text-muted-foreground hover:text-primary", children: w?.name || "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: b?.name || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.writer || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: fmtDate(c.deadline) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: fmtDate(c.publishedAt || c.publishDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.indexStatus }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: c.publishedLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.publishedLink, target: "_blank", rel: "noreferrer", onClick: (e) => e.stopPropagation(), className: "text-primary hover:underline inline-flex items-center gap-1", children: [
              "Mở",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] }) : c.draftLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.draftLink, target: "_blank", rel: "noreferrer", onClick: (e) => e.stopPropagation(), className: "text-muted-foreground hover:text-primary inline-flex items-center gap-1", children: [
              "Bài",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] }) : "—" })
          ] }, c.id);
        })
      ] })
    ] }) }) }) }),
    view === "kanban" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "content-web-board overflow-x-auto pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 min-w-max", children: CONTENT_STATUSES.map((status) => {
      const items = filtered.filter((c) => c.status === status);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "content-web-column rounded-xl bg-muted/40 p-3 w-[260px] shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: items.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          items.map((c) => {
            const w = websites.find((x) => x.id === c.websiteId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenContent(c), className: "block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: c.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
                w?.name,
                " · ",
                c.writer || "—"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: fmtDate(c.deadline) })
            ] }, c.id);
          }),
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center py-4", children: "—" })
        ] })
      ] }, status);
    }) }) }),
    view === "calendar" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCalendar, { contents: filtered, onOpen: setOpenContent }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Lịch đăng bài", className: "space-y-3 md:hidden", children: [
        !calendarItems.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl border p-6 text-center text-sm text-muted-foreground", children: "Chưa có bài viết được đặt ngày đăng trong danh sách này." }),
        calendarItems.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenContent(c), className: "block w-full rounded-2xl border bg-card p-4 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 text-xs font-semibold text-primary", children: [
            c.publishedAt ? "Đã đăng" : "Dự kiến đăng",
            " · ",
            fmtDate(c.publishedAt || c.publishDate)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "break-words font-semibold leading-6", children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: c.writer || "Chưa phân công" })
          ] })
        ] }, c.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContentDetail, { content: openContent, open: !!openContent, onClose: () => {
      setOpenContent(null);
      if (openId) navigate({
        search: {}
      });
    } })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["web.content_view", "web.content_view_all", "web.content_view_mine"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(AllContents, {}) });
export {
  SplitComponent as component
};
