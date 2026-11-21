import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, o as CardContent, B as Button, b$ as Route$i, b as useStore, u as useCurrentUser, bP as ensureSeoChecks, bZ as isActiveKeywordTrack, O as CardHeader, Q as CardTitle, aR as Progress, I as Input, bk as CONTENT_STATUSES, bl as CONTENT_TYPES, D as Dialog, be as DialogTrigger, x as DialogContent, y as DialogHeader, A as DialogTitle, bf as todayISO, aX as uid, f as fmtDate, bU as ENTITY_PLATFORMS, bV as ENTITY_STATUSES, bW as KEYWORD_RANK_STATUSES, b_ as SEO_CHECK_TEMPLATE, N as Checkbox, c0 as SHARE_SOCIAL_STATUSES, T as Switch, bS as OPTIMIZE_RECURRING_PERIODS, bX as BACKLINK_STATUSES, bY as BACKLINK_TYPES, L as Label, bQ as OPTIMIZE_SOURCES, bp as OPTIMIZE_REASONS, bR as OPTIMIZE_TARGETS, E as DialogFooter, bO as GROWTH_PERIOD_TYPES, l as Badge, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, ar as SheetDescription, bT as computeNextOptimizeDate, M as PasswordInput, j as cn } from "./router-CkmTURa-.mjs";
import { r as readOpenParam, s as syncOpenParam } from "./deep-link-CfE7_DgM.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { C as ContentForm, K as KeywordResearchTab } from "./ContentForm-CYy7twsa.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { C as ContentDetail } from "./ContentDetail-BzefX6f_.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Root2, I as Item, H as Header, T as Trigger2, C as Content2 } from "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, G as Globe, ag as ExternalLink, F as FileText, aC as RefreshCw, aw as CircleAlert, ar as CircleCheck, w as Users, K as Share2, aW as TrendingUp, bk as Table, i as LayoutGrid, bl as Calendar, a6 as Plus, b4 as ShieldAlert, bb as Lock, E as EyeOff, r as Eye, ao as Pencil, ap as Trash2, n as ChevronDown, s as ChevronRight, aV as TriangleAlert, f as Search, ab as RotateCcw, bi as Link2, bJ as FilePen, bK as Wrench, ad as Send, a2 as Trophy, aq as Inbox, aj as Settings2, u as ListChecks, bL as Activity, b2 as Link$1, bM as TrendingDown, aR as History, at as ArrowRight, k as ArrowDown, bI as Minus, j as ArrowUp } from "../_libs/lucide-react.mjs";
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
import "./design-BrHT-rw4.mjs";
import "./DesignAssigneePicker-DC39EkqM.mjs";
import "./DesignReviewerPicker-Cn1Hqf7M.mjs";
import "./api-Bf_55NQ7.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
const DONE_STATUSES$1 = /* @__PURE__ */ new Set(["Đã đăng web", "Kiểm tra index", "Hoàn thành"]);
function OptimizeContentForm({
  websiteId,
  brandId,
  onSubmit,
  onClose,
  initialSourceContentId,
  lockSource = false
}) {
  const { webContents, websites, brands } = useStore();
  const website = websites.find((w) => w.id === websiteId);
  const brand = brands.find((b) => b.id === brandId);
  const publishedList = reactExports.useMemo(
    () => webContents.filter((c) => c.websiteId === websiteId && DONE_STATUSES$1.has(c.status)),
    [webContents, websiteId]
  );
  const initial = initialSourceContentId ? webContents.find((c) => c.id === initialSourceContentId) : void 0;
  const [sourceContentId, setSourceContentId] = reactExports.useState(initialSourceContentId || "");
  const [optimizeSource, setOptimizeSource] = reactExports.useState("Thủ công");
  const [title, setTitle] = reactExports.useState(initial?.title || "");
  const [oldLink, setOldLink] = reactExports.useState(initial?.publishedLink || initial?.url || "");
  const [mainKeyword, setMainKeyword] = reactExports.useState(initial?.mainKeyword || "");
  const [subKeywords, setSubKeywords] = reactExports.useState(initial?.subKeywords || "");
  const [reason, setReason] = reactExports.useState("");
  const [targets, setTargets] = reactExports.useState([]);
  const [notes, setNotes] = reactExports.useState("");
  const [refLink, setRefLink] = reactExports.useState("");
  const [recurring, setRecurring] = reactExports.useState(!!initial?.optimizeRecurring);
  const [period, setPeriod] = reactExports.useState(
    initial?.optimizeRecurringPeriod || "Mỗi 3 tháng"
  );
  const onPickSource = (v) => {
    setSourceContentId(v === "_" ? "" : v);
    if (v && v !== "_") {
      const src = publishedList.find((x) => x.id === v);
      if (src) {
        setTitle(src.title || "");
        setOldLink(src.publishedLink || src.url || "");
        setMainKeyword(src.mainKeyword || "");
        setSubKeywords(src.subKeywords || "");
      }
    }
  };
  const toggleTarget = (t) => {
    setTargets((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };
  const submit = () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài cần tối ưu");
      return;
    }
    if (!sourceContentId && !oldLink.trim()) {
      alert("Vui lòng chọn bài gốc trong hệ thống hoặc nhập URL bài cần tối ưu");
      return;
    }
    if (!reason) {
      alert("Vui lòng chọn lý do tối ưu");
      return;
    }
    const item = {
      id: uid(),
      websiteId,
      brandId,
      type: "Bài tối ưu lại",
      title: title.trim(),
      status: "Đã tạo",
      indexStatus: "Chưa kiểm tra",
      mainKeyword: mainKeyword.trim() || void 0,
      subKeywords: subKeywords.trim() || void 0,
      oldLink: oldLink.trim() || void 0,
      sourceContentId: sourceContentId || void 0,
      optimizeSource,
      optimizeReason: reason,
      optimizeTargets: targets.length ? targets : void 0,
      optimizeNotes: notes.trim() || void 0,
      optimizeRefLink: refLink.trim() || void 0,
      optimizeRecurring: recurring || void 0,
      optimizeRecurringPeriod: recurring ? period : void 0
    };
    onSubmit(item);
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 max-h-[65vh] overflow-y-auto pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", children: "A. Bài cần tối ưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nguồn tạo việc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: optimizeSource, onValueChange: (v) => setOptimizeSource(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OPTIMIZE_SOURCES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bài gốc trong hệ thống" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sourceContentId || "_", onValueChange: onPickSource, disabled: lockSource, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— Không chọn —" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Không chọn —" }),
                publishedList.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.title }, c.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tiêu đề bài cần tối ưu *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "URL bài cần tối ưu ",
              sourceContentId ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: oldLink, onChange: (e) => setOldLink(e.target.value), placeholder: "https://..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Website" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: website?.name || "", disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thương hiệu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: brand?.name || "", disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Từ khóa chính" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mainKeyword, onChange: (e) => setMainKeyword(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Từ khóa phụ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: subKeywords, onChange: (e) => setSubKeywords(e.target.value), placeholder: "ngăn cách bằng dấu phẩy" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", children: "B. Yêu cầu tối ưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do tối ưu *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reason || "_", onValueChange: (v) => setReason(v === "_" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn lý do" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OPTIMIZE_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hạng mục cần tối ưu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 mt-2", children: OPTIMIZE_TARGETS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: targets.includes(t), onCheckedChange: () => toggleTarget(t) }),
              t
            ] }, t)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú yêu cầu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: notes, onChange: (e) => setNotes(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link tài liệu tham khảo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: refLink, onChange: (e) => setRefLink(e.target.value), placeholder: "https://..." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", children: "C. Theo dõi định kỳ sau lần tối ưu này" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: recurring, onCheckedChange: setRecurring }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "cursor-pointer", onClick: () => setRecurring(!recurring), children: "Theo dõi tối ưu định kỳ sau lần này" })
          ] }),
          recurring && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chu kỳ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: period, onValueChange: (v) => setPeriod(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OPTIMIZE_RECURRING_PERIODS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, children: "Tạo bài tối ưu" })
    ] })
  ] });
}
function FieldRow({ k, v }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right text-sm", children: v ?? "—" })
  ] });
}
function PersonSelect({ label, value, onChange, disabled }) {
  const { people } = useStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "_", onValueChange: (v) => onChange(v === "_" ? void 0 : v), disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
        people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
      ] })
    ] })
  ] });
}
function OptimizeContentDetail({
  content,
  open,
  onClose
}) {
  const s = useStore();
  const { user, isAdmin, can } = useCurrentUser();
  const canAssign = isAdmin || can("web.reopt_assign");
  const canStatus = isAdmin || can("web.reopt_status");
  const canComplete = isAdmin || can("web.reopt_complete");
  const canCancel = isAdmin || can("web.reopt_delete");
  const [assignee, setAssignee] = reactExports.useState(void 0);
  const [reviewer, setReviewer] = reactExports.useState(void 0);
  const [deadline, setDeadline] = reactExports.useState("");
  const [assignNote, setAssignNote] = reactExports.useState("");
  const [resultLink, setResultLink] = reactExports.useState("");
  const [resultNote, setResultNote] = reactExports.useState("");
  const [reviewNote, setReviewNote] = reactExports.useState("");
  const [completeOpen, setCompleteOpen] = reactExports.useState(false);
  const [doneDate, setDoneDate] = reactExports.useState(todayISO());
  const [doneLink, setDoneLink] = reactExports.useState("");
  const [doneNote, setDoneNote] = reactExports.useState("");
  const [doneTargets, setDoneTargets] = reactExports.useState([]);
  const [continueTracking, setContinueTracking] = reactExports.useState(true);
  if (!content) return null;
  const c = s.webContents.find((x) => x.id === content.id) || content;
  const website = s.websites.find((w) => w.id === c.websiteId);
  const brand = s.brands.find((b) => b.id === c.brandId);
  const myName = user?.fullName || user?.username || "";
  const isAssignee = !!c.writer && c.writer.trim() === myName.trim();
  const isReviewer = !!c.optimizeReviewer && c.optimizeReviewer.trim() === myName.trim();
  const apply = (t) => {
    const entry = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      byId: user?.id,
      byName: myName || "—",
      action: t.action,
      fromStatus: c.status,
      toStatus: t.to,
      note: t.note
    };
    s.update("webContents", c.id, {
      status: t.to,
      ...t.extra || {},
      history: [...c.history || [], entry]
    });
  };
  const doAssign = () => {
    if (!assignee) {
      toast.error("Chọn người phụ trách tối ưu");
      return;
    }
    if (!reviewer) {
      toast.error("Chọn người duyệt tối ưu");
      return;
    }
    if (!deadline) {
      toast.error("Nhập deadline");
      return;
    }
    if (assignee === reviewer) {
      toast.error("Người phụ trách và người duyệt phải khác nhau");
      return;
    }
    apply({
      to: "Đã giao",
      action: `Giao việc cho ${assignee}, người duyệt ${reviewer}`,
      note: assignNote || void 0,
      extra: {
        writer: assignee,
        optimizeReviewer: reviewer,
        deadline,
        optimizeAssignNote: assignNote || void 0
      }
    });
    setAssignee(void 0);
    setReviewer(void 0);
    setDeadline("");
    setAssignNote("");
  };
  const submitForReview = () => {
    if (!resultLink.trim()) {
      toast.error("Nhập link kết quả sau tối ưu");
      return;
    }
    apply({
      to: "Chờ duyệt tối ưu",
      action: "Gửi duyệt tối ưu",
      extra: { optimizeResultLink: resultLink.trim(), optimizeResultNote: resultNote.trim() || void 0 }
    });
    setResultLink("");
    setResultNote("");
  };
  const approve = () => {
    apply({ to: "Đã duyệt tối ưu", action: "Duyệt tối ưu" });
  };
  const requestFix = () => {
    if (!reviewNote.trim()) {
      toast.error("Nhập ghi chú yêu cầu sửa");
      return;
    }
    apply({
      to: "Cần sửa tối ưu",
      action: "Yêu cầu sửa",
      note: reviewNote.trim(),
      extra: {
        optimizeReviewNotes: reviewNote.trim(),
        optimizeRevisions: (c.optimizeRevisions || 0) + 1
      }
    });
    setReviewNote("");
  };
  const startOptimize = () => apply({ to: "Đang tối ưu", action: "Bắt đầu tối ưu" });
  const openCompleteDialog = () => {
    setDoneDate(todayISO());
    setDoneLink(c.optimizeResultLink || "");
    setDoneNote(c.optimizeResultNote || "");
    setDoneTargets(c.optimizeTargetsActual?.length ? c.optimizeTargetsActual : c.optimizeTargets || []);
    const src = c.sourceContentId ? s.webContents.find((x) => x.id === c.sourceContentId) : null;
    setContinueTracking(!!(src?.optimizeRecurring && src?.optimizeRecurringPeriod));
    setCompleteOpen(true);
  };
  const confirmComplete = () => {
    if (!doneDate) {
      toast.error("Nhập ngày hoàn thành tối ưu");
      return;
    }
    if (!doneLink.trim()) {
      toast.error("Nhập link bài sau khi cập nhật");
      return;
    }
    const src = c.sourceContentId ? s.webContents.find((x) => x.id === c.sourceContentId) : null;
    const period = src?.optimizeRecurringPeriod;
    const willTrack = continueTracking && !!period;
    const nextDate = willTrack && period ? computeNextOptimizeDate(doneDate, period) : void 0;
    const historyEntry = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      optimizeContentId: c.id,
      optimizeTitle: c.title,
      websiteId: c.websiteId,
      brandId: c.brandId,
      sourceContentId: c.sourceContentId,
      oldLink: c.oldLink || c.url,
      optimizeSource: c.optimizeSource,
      optimizeReason: c.optimizeReason,
      writer: c.writer,
      optimizeReviewer: c.optimizeReviewer,
      completedAt: doneDate,
      resultLink: doneLink.trim(),
      resultNote: doneNote.trim() || void 0,
      optimizeTargetsActual: doneTargets,
      recurringPeriod: period,
      continueTracking: willTrack,
      nextOptimizeAt: nextDate
    };
    apply({
      to: "Hoàn thành",
      action: "Xác nhận hoàn thành tối ưu",
      note: doneNote.trim() || void 0,
      extra: {
        completedAt: doneDate,
        optimizeResultLink: doneLink.trim(),
        optimizeResultNote: doneNote.trim() || void 0,
        optimizeTargetsActual: doneTargets
      }
    });
    if (src) {
      const patch = {
        optimizeHistory: [...src.optimizeHistory || [], historyEntry]
      };
      if (src.optimizeRecurring && period) {
        if (willTrack) {
          patch.nextOptimizeAt = nextDate;
          patch.optimizeScheduleTrackStatus = "Đang theo dõi";
        } else {
          patch.nextOptimizeAt = void 0;
          patch.optimizeScheduleTrackStatus = "Tạm dừng";
        }
      }
      s.update("webContents", src.id, patch);
    }
    setCompleteOpen(false);
    toast.success("Đã ghi nhận hoàn thành tối ưu");
  };
  const cancelOptimize = () => {
    if (!confirm("Hủy bài tối ưu này?")) return;
    apply({ to: "Đã hủy", action: "Hủy bài tối ưu" });
  };
  const NoPerm = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground italic", children: "Bạn không có quyền thực hiện hành động ở trạng thái này." });
  function renderActions() {
    switch (c.status) {
      case "Đã tạo":
      case "Kế hoạch": {
        if (!canAssign) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PersonSelect, { label: "Người phụ trách tối ưu *", value: assignee, onChange: setAssignee }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PersonSelect, { label: "Người duyệt tối ưu *", value: reviewer, onChange: setReviewer }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú giao việc" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: assignNote, onChange: (e) => setAssignNote(e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: doAssign, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
            "Giao việc"
          ] })
        ] });
      }
      case "Đã giao":
        if (!(isAdmin || isAssignee && canStatus)) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startOptimize, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
          "Bắt đầu tối ưu"
        ] });
      case "Đang tối ưu":
      case "Cần sửa tối ưu": {
        if (!(isAdmin || isAssignee && canStatus)) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          c.status === "Cần sửa tối ưu" && c.optimizeReviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/30 bg-warning/5 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mb-1", children: "Ghi chú sửa gần nhất" }),
            c.optimizeReviewNotes
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link kết quả sau tối ưu *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: resultLink || c.optimizeResultLink || "", onChange: (e) => setResultLink(e.target.value), placeholder: "https://..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú kết quả" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: resultNote || c.optimizeResultNote || "", onChange: (e) => setResultNote(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submitForReview, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
            c.status === "Cần sửa tối ưu" ? "Gửi duyệt lại tối ưu" : "Gửi duyệt tối ưu"
          ] })
        ] });
      }
      case "Chờ duyệt tối ưu": {
        if (!(isAdmin || isReviewer && canStatus)) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          c.optimizeResultLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.optimizeResultLink, target: "_blank", rel: "noreferrer", className: "text-sm text-primary hover:underline inline-flex items-center gap-1", children: [
            "Mở kết quả tối ưu ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú yêu cầu sửa (nếu cần)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: reviewNote, onChange: (e) => setReviewNote(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: approve, children: "Duyệt tối ưu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: requestFix, children: "Yêu cầu sửa" })
          ] })
        ] });
      }
      case "Đã duyệt tối ưu":
        if (!canComplete) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: openCompleteDialog, children: "Xác nhận hoàn thành" });
      case "Hoàn thành":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Bài tối ưu đã hoàn thành." });
      case "Đã hủy":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Bài đã hủy." });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Trạng thái: ",
          c.status
        ] });
    }
  }
  const sourceContent = c.sourceContentId ? s.webContents.find((x) => x.id === c.sourceContentId) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          website?.name,
          " · ",
          brand?.name,
          " · Bài tối ưu lại"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "workflow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "workflow", children: "Workflow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "links", children: "Tài liệu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5 mr-1" }),
            "Lịch sử xử lý"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "workflow", className: "mt-3 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", children: "Hành động tiếp theo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: renderActions() }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Trạng thái", v: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người phụ trách tối ưu", v: c.writer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người duyệt tối ưu", v: c.optimizeReviewer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Deadline", v: fmtDate(c.deadline) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Số lần sửa", v: c.optimizeRevisions || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Ghi chú giao việc", v: c.optimizeAssignNote })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Tiêu đề", v: c.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "URL bài", v: c.oldLink || c.url }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Bài gốc trong hệ thống", v: sourceContent?.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Website", v: website?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Thương hiệu", v: brand?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Từ khóa chính", v: c.mainKeyword }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Từ khóa phụ", v: c.subKeywords }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Nguồn tạo", v: c.optimizeSource }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Lý do tối ưu", v: c.optimizeReason }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Hạng mục cần tối ưu", v: c.optimizeTargets?.join(", ") })
          ] }),
          c.optimizeNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground mb-1", children: "Ghi chú yêu cầu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap", children: c.optimizeNotes })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "links", className: "mt-3 space-y-3", children: [
          [
            { label: "Link bài hiện tại", v: c.oldLink || c.url },
            { label: "Link tài liệu tham khảo", v: c.optimizeRefLink },
            { label: "Link kết quả sau tối ưu", v: c.optimizeResultLink }
          ].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border bg-card px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: l.label }),
            l.v ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: l.v, target: "_blank", rel: "noreferrer", className: "text-sm text-primary inline-flex items-center gap-1 hover:underline", children: [
              "Mở ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Chưa có" })
          ] }, l.label)),
          c.optimizeResultNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground mb-1", children: "Ghi chú kết quả tối ưu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap", children: c.optimizeResultNote })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          (!c.history || c.history.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Chưa có lịch sử xử lý." }),
          (c.history || []).slice().reverse().map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card px-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: h.action }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(h.at).toLocaleString("vi-VN") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "Người thực hiện: ",
              h.byName || "—"
            ] }),
            (h.fromStatus || h.toStatus) && h.fromStatus !== h.toStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: h.fromStatus || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: h.toStatus || "—" })
            ] }),
            h.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded bg-muted/50 px-2 py-1 text-xs whitespace-pre-wrap", children: h.note })
          ] }, i))
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        canCancel && c.status !== "Hoàn thành" && c.status !== "Đã hủy" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: cancelOptimize, children: "Hủy bài" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Đóng" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: completeOpen, onOpenChange: setCompleteOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận hoàn thành tối ưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: c.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày hoàn thành tối ưu *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: doneDate, onChange: (e) => setDoneDate(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài sau khi cập nhật *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: doneLink, onChange: (e) => setDoneLink(e.target.value), placeholder: "https://..." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú kết quả tối ưu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: doneNote, onChange: (e) => setDoneNote(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hạng mục thực tế đã tối ưu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-2 mt-1", children: OPTIMIZE_TARGETS.map((t) => {
            const checked = doneTargets.includes(t);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm rounded border bg-card px-2 py-1.5 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked,
                  onCheckedChange: (v) => {
                    setDoneTargets(
                      (prev) => v ? [...prev, t] : prev.filter((x) => x !== t)
                    );
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t })
            ] }, t);
          }) })
        ] }),
        (() => {
          const src = c.sourceContentId ? s.webContents.find((x) => x.id === c.sourceContentId) : null;
          const period = src?.optimizeRecurringPeriod;
          const preview = continueTracking && period ? computeNextOptimizeDate(doneDate, period) : "";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/30 p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Tiếp tục theo dõi định kỳ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: period ? `Chu kỳ hiện tại: ${period}` : "Bài gốc chưa thiết lập chu kỳ tối ưu định kỳ." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: continueTracking,
                  onCheckedChange: setContinueTracking,
                  disabled: !period
                }
              )
            ] }),
            continueTracking && period && preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Ngày tối ưu tiếp theo dự kiến: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: fmtDate(preview) })
            ] }),
            !continueTracking && period && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Trạng thái theo dõi sẽ chuyển sang ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Tạm dừng" }),
              "."
            ] })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCompleteOpen(false), children: "Đóng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirmComplete, children: "Xác nhận hoàn thành" })
      ] })
    ] }) })
  ] });
}
function EntitySocialTab({ websiteId }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("web.entity_create");
  const canEdit = can("web.entity_edit");
  const canDelete = can("web.entity_delete");
  const canOpenLink = can("web.entity_open_link");
  const canViewAccount = can("web.entity_view_account");
  const canRevealPassword = can("web.entity_reveal_password");
  const list = s.entities.filter((e) => e.websiteId === websiteId);
  const [search, setSearch] = reactExports.useState("");
  const [fPlatform, setFPlatform] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const [revealed, setRevealed] = reactExports.useState({});
  const filtered = reactExports.useMemo(() => list.filter(
    (e) => (fPlatform === "all" || e.platform === fPlatform) && (fStatus === "all" || e.status === fStatus) && (!search || [e.name, e.url, e.email, e.account].some((x) => (x || "").toLowerCase().includes(search.toLowerCase())))
  ), [list, search, fPlatform, fStatus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-warning/40 bg-warning/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-start gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-[oklch(0.45_0.13_75)] shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bản base hiện đang lưu mật khẩu dạng mock/demo trên trình duyệt. Khi triển khai thực tế cần chuyển sang lưu mã hoá phía server." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "max-w-xs", placeholder: "Tìm theo tên / link / mail...", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fPlatform, onValueChange: setFPlatform, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Nền tảng" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả nền tảng" }),
          ENTITY_PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
          ENTITY_STATUSES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] }),
      canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: adding, onOpenChange: setAdding, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Thêm Entity"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Thêm Entity / Social SEO" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EntityForm, { websiteId, onSubmit: (e) => {
            s.add("entities", e);
            setAdding(false);
          }, onClose: () => setAdding(false) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Nền tảng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tài khoản" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Mật khẩu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "SĐT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, className: "px-4 py-12 text-center text-muted-foreground", children: "Chưa có entity nào." }) }),
        filtered.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: e.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: e.platform }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: e.url ? canOpenLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: e.url, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1", children: [
            "Mở ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", title: "Không có quyền mở link Entity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
            "Có link"
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: canViewAccount ? e.account || "—" : e.account ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
            "Ẩn"
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: !e.password ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : canRevealPassword ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setRevealed((r) => ({ ...r, [e.id]: !r[e.id] })),
              className: "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-mono text-xs",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: revealed[e.id] ? e.password : "••••••••" }),
                revealed[e.id] ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", title: "Không có quyền xem mật khẩu Entity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
            "Ẩn"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: canViewAccount ? e.email || "—" : e.email ? "•••" : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: canViewAccount ? e.phone || "—" : e.phone ? "•••" : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: e.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-right whitespace-nowrap", children: [
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(e), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
              if (confirm(`Xóa "${e.name}"?`)) s.remove("entities", e.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }),
            !canEdit && !canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "Chỉ xem" })
          ] })
        ] }, e.id))
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa Entity" }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx(
        EntityForm,
        {
          websiteId,
          initial: editing,
          canRevealPassword,
          onSubmit: (e) => {
            if (!canEdit) {
              toast.error("Bạn không có quyền sửa Entity");
              return;
            }
            s.update("entities", editing.id, e);
            setEditing(null);
          },
          onClose: () => setEditing(null)
        }
      )
    ] }) })
  ] });
}
function EntityForm({
  websiteId,
  initial,
  onSubmit,
  onClose,
  canRevealPassword = true
}) {
  const [v, setV] = reactExports.useState({
    id: initial?.id || uid(),
    websiteId,
    name: initial?.name || "",
    platform: initial?.platform || "Facebook",
    url: initial?.url || "",
    account: initial?.account || "",
    password: initial?.password || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    status: initial?.status || "Đang dùng",
    notes: initial?.notes || ""
  });
  const set = (k, val) => setV({ ...v, [k]: val });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Tên social/entity *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.name, onChange: (e) => set("name", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Nền tảng *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.platform, onValueChange: (x) => set("platform", x), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ENTITY_PLATFORMS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Link", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.url, onChange: (e) => set("url", e.target.value), placeholder: "https://..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Tài khoản", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.account, onChange: (e) => set("account", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Mật khẩu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { allowReveal: canRevealPassword, value: v.password, onChange: (e) => set("password", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.email, onChange: (e) => set("email", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "SĐT", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.phone, onChange: (e) => set("phone", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Trạng thái", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.status, onValueChange: (x) => set("status", x), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ENTITY_STATUSES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$2, { label: "Ghi chú", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: v.notes, onChange: (e) => set("notes", e.target.value) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (!v.name.trim()) return;
        onSubmit(v);
      }, children: "Lưu" })
    ] })
  ] });
}
function Field$2({ label, children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `block ${className || ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: label }),
    children
  ] });
}
function deriveStatus(cur, prev) {
  if (cur == null || cur === 0) {
    if (prev != null && prev > 0) return "Mất top";
    return "Chưa check";
  }
  if (cur <= 3) return "Top 3";
  if (cur <= 10) return "Top 10";
  if (cur <= 20) return "Top 20";
  if (cur <= 50) return "Top 50";
  return "Ngoài top 50";
}
function RankChange({ cur, prev }) {
  if (cur == null && prev == null) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" });
  if (cur == null) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Chưa check" });
  if (cur === 0 && prev != null && prev > 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-destructive", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3 w-3" }),
    "Mất top"
  ] });
  if (cur === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Chưa có TOP" });
  if (prev == null || prev === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Lần đầu" });
  if (cur === prev) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }),
    "Không đổi"
  ] });
  if (cur < prev) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-success", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3 w-3" }),
    "Tăng +",
    prev - cur
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-destructive", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3 w-3" }),
    "Giảm -",
    cur - prev
  ] });
}
const splitSubs = (s) => (s || "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
function matchesQuick(quick, t) {
  if (quick === "all") return true;
  if (!t) return quick === "unchecked";
  const cur = t.currentTop, prev = t.previousTop;
  switch (quick) {
    case "top3":
      return cur != null && cur > 0 && cur <= 3;
    case "top10":
      return cur != null && cur > 0 && cur <= 10;
    case "up":
      return cur != null && prev != null && cur > 0 && prev > 0 && cur < prev;
    case "down":
      return cur != null && prev != null && cur > prev;
    case "lost":
      return t.status === "Mất top";
    case "unchecked":
      return t.status === "Chưa check" || cur == null;
  }
  return true;
}
function KeywordsTab({ websiteId }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canPrimary = can("web.checktop_primary");
  const canSecondary = can("web.checktop_secondary");
  const canKwCreate = can("web.checktop_kw_create");
  const canKwDelete = can("web.checktop_kw_delete");
  const canOpenUrl = can("web.checktop_open_url");
  const allKw = s.keywords.filter((k) => k.websiteId === websiteId);
  const indexedContents = s.webContents.filter(
    (c) => c.websiteId === websiteId && c.indexStatus === "Đã index"
  );
  const [search, setSearch] = reactExports.useState("");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fOwner, setFOwner] = reactExports.useState("all");
  const [fTopic, setFTopic] = reactExports.useState("all");
  const [fPlan, setFPlan] = reactExports.useState("all");
  const [fDate, setFDate] = reactExports.useState("");
  const [quick, setQuick] = reactExports.useState("all");
  const [expanded, setExpanded] = reactExports.useState({});
  const [updating, setUpdating] = reactExports.useState(null);
  const [addingSubFor, setAddingSubFor] = reactExports.useState(null);
  const [newSub, setNewSub] = reactExports.useState("");
  const [showExtras, setShowExtras] = reactExports.useState(true);
  const [addingKw, setAddingKw] = reactExports.useState(false);
  const groups = reactExports.useMemo(() => {
    return indexedContents.map((c) => {
      const mainKw = (c.mainKeyword || "").trim();
      const mainTrack = allKw.find(
        (k) => k.contentId === c.id && (k.isMain || mainKw && k.keyword === mainKw)
      );
      const mainRow = {
        key: `${c.id}::__main`,
        keyword: mainKw,
        isMain: true,
        content: c,
        contentId: c.id,
        track: mainTrack
      };
      const subKws = splitSubs(c.subKeywords);
      const subRows = [];
      const seen = /* @__PURE__ */ new Set();
      subKws.forEach((kw) => {
        const t = allKw.find((k) => k.contentId === c.id && k.keyword === kw && !k.isMain);
        seen.add(kw.toLowerCase());
        subRows.push({ key: `${c.id}::${kw}`, keyword: kw, isMain: false, contentId: c.id, track: t });
      });
      allKw.filter((k) => k.contentId === c.id && !k.isMain && !seen.has(k.keyword.toLowerCase())).forEach((k) => {
        subRows.push({ key: `${c.id}::${k.keyword}`, keyword: k.keyword, isMain: false, contentId: c.id, track: k });
      });
      return { contentId: c.id, content: c, mainRow, subRows };
    });
  }, [indexedContents, allKw]);
  const extras = allKw.filter((k) => !k.contentId);
  const owners = Array.from(new Set(allKw.map((k) => k.owner).filter(Boolean)));
  const topics = Array.from(new Set(allKw.map((k) => k.topic).filter(Boolean)));
  const plans = Array.from(new Set(allKw.map((k) => k.plan).filter(Boolean)));
  const rowMatchesFilters = (kwText, t) => {
    if (search && !kwText.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus !== "all" && (t?.status || "Chưa check") !== fStatus) return false;
    if (fOwner !== "all" && (t?.owner || "") !== fOwner) return false;
    if (fTopic !== "all" && (t?.topic || "") !== fTopic) return false;
    if (fPlan !== "all" && (t?.plan || "") !== fPlan) return false;
    if (fDate && t?.lastCheckDate !== fDate) return false;
    if (!matchesQuick(quick, t)) return false;
    return true;
  };
  const filteredGroups = reactExports.useMemo(() => {
    return groups.map((g) => {
      const mainPass = rowMatchesFilters(g.mainRow.keyword, g.mainRow.track);
      const subPass = g.subRows.filter((r) => rowMatchesFilters(r.keyword, r.track));
      return { g, mainPass, subPass };
    }).filter(({ mainPass, subPass }) => mainPass || subPass.length > 0);
  }, [groups, search, fStatus, fOwner, fTopic, fPlan, fDate, quick]);
  const filteredExtras = extras.filter((k) => rowMatchesFilters(k.keyword, k));
  const isExpanded = (cid) => {
    const fg = filteredGroups.find((x) => x.g.contentId === cid);
    if (fg && !fg.mainPass && fg.subPass.length > 0) return true;
    return !!expanded[cid];
  };
  const toggle = (cid) => setExpanded((e) => ({ ...e, [cid]: !e[cid] }));
  const allRowTracks = [
    ...groups.flatMap((g) => [g.mainRow.track, ...g.subRows.map((r) => r.track)]),
    ...extras
  ];
  const cnt = (id) => allRowTracks.filter((t) => matchesQuick(id, t)).length;
  const counts = {
    all: allRowTracks.length,
    top3: cnt("top3"),
    top10: cnt("top10"),
    up: cnt("up"),
    down: cnt("down"),
    lost: cnt("lost"),
    unchecked: cnt("unchecked")
  };
  const QF = ({ id, label, count }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => setQuick(id),
      className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`,
      children: [
        label,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: quick === id ? "opacity-80" : "text-muted-foreground", children: [
          "(",
          count,
          ")"
        ] })
      ]
    }
  );
  const saveTop = (row, payload) => {
    const requiredPerm = row.isMain ? canPrimary : canSecondary;
    if (!requiredPerm) {
      toast.error(`Bạn không có quyền cập nhật TOP từ khóa ${row.isMain ? "chính" : "phụ"}.`);
      return;
    }
    const existing = row.track;
    const prev = existing?.currentTop;
    const finalStatus = (() => {
      const base = deriveStatus(payload.cur, prev);
      if (payload.cur != null && prev != null && payload.cur > 0 && prev > 0) {
        if (payload.cur < prev) return "Tăng hạng";
        if (payload.cur > prev) return "Tụt hạng";
      }
      return base;
    })();
    if (existing) {
      s.update("keywords", existing.id, {
        currentTop: payload.cur,
        previousTop: prev,
        lastCheckDate: payload.date,
        status: finalStatus,
        notes: payload.note,
        targetUrl: payload.targetUrl ?? existing.targetUrl
      });
    } else {
      const content = row.contentId ? s.webContents.find((c) => c.id === row.contentId) : void 0;
      const track = {
        id: uid(),
        websiteId,
        keyword: row.keyword,
        contentId: row.contentId,
        isMain: row.isMain,
        type: row.isMain ? "Từ khóa chính" : "Từ khóa phụ",
        targetUrl: payload.targetUrl ?? content?.publishedLink,
        topic: content?.topic,
        plan: content?.plan,
        owner: row.isMain ? content?.publisher || content?.writer : void 0,
        currentTop: payload.cur,
        previousTop: void 0,
        lastCheckDate: payload.date,
        status: finalStatus,
        notes: payload.note
      };
      s.add("keywords", track);
    }
  };
  const addSub = (cid) => {
    if (!canKwCreate) {
      toast.error("Bạn không có quyền thêm từ khóa phụ.");
      return;
    }
    const kw = newSub.trim();
    if (!kw) return;
    const c = s.webContents.find((x) => x.id === cid);
    if (c) {
      const cur = splitSubs(c.subKeywords);
      if (!cur.some((x) => x.toLowerCase() === kw.toLowerCase())) {
        s.update("webContents", cid, { subKeywords: [...cur, kw].join(", ") });
      }
    }
    setNewSub("");
    setAddingSubFor(null);
    setExpanded((e) => ({ ...e, [cid]: true }));
  };
  const deleteSub = (cid, kw, trackId) => {
    if (!canKwDelete) {
      toast.error("Bạn không có quyền xóa từ khóa phụ.");
      return;
    }
    if (!confirm(`Xóa từ khóa phụ "${kw}"?`)) return;
    const c = s.webContents.find((x) => x.id === cid);
    if (c) {
      const remaining = splitSubs(c.subKeywords).filter((k) => k.toLowerCase() !== kw.toLowerCase());
      s.update("webContents", cid, { subKeywords: remaining.join(", ") });
    }
    if (trackId) s.remove("keywords", trackId);
  };
  const deleteMain = (cid, kw, trackId) => {
    if (!canKwDelete) {
      toast.error("Bạn không có quyền xóa từ khóa chính.");
      return;
    }
    if (!confirm(`Xóa từ khóa chính "${kw}" khỏi bài viết?`)) return;
    s.update("webContents", cid, { mainKeyword: "" });
    if (trackId) s.remove("keywords", trackId);
  };
  const addManualKeyword = (p) => {
    if (!canKwCreate) {
      toast.error("Bạn không có quyền thêm từ khóa.");
      return;
    }
    const kw = p.keyword.trim();
    if (!kw) return;
    if (p.contentId) {
      const c = s.webContents.find((x) => x.id === p.contentId);
      if (!c) return;
      if (p.isMain) {
        s.update("webContents", p.contentId, { mainKeyword: kw });
      } else {
        const cur = splitSubs(c.subKeywords);
        if (!cur.some((x) => x.toLowerCase() === kw.toLowerCase())) {
          s.update("webContents", p.contentId, { subKeywords: [...cur, kw].join(", ") });
        }
      }
      setExpanded((e) => ({ ...e, [p.contentId]: true }));
    } else {
      s.add("keywords", {
        id: uid(),
        websiteId,
        keyword: kw,
        isMain: p.isMain,
        type: p.isMain ? "Từ khóa chính" : "Từ khóa phụ",
        targetUrl: p.targetUrl,
        status: "Chưa check"
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "all", label: "Tất cả", count: counts.all }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "top3", label: "Top 3", count: counts.top3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "top10", label: "Top 10", count: counts.top10 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "up", label: "Tăng hạng", count: counts.up }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "down", label: "Tụt hạng", count: counts.down }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "lost", label: "Mất top", count: counts.lost }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "unchecked", label: "Chưa check", count: counts.unchecked })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "max-w-xs", placeholder: "Tìm từ khóa...", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
          KEYWORD_RANK_STATUSES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] }),
      topics.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fTopic, onValueChange: setFTopic, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Topic" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả topic" }),
          topics.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
        ] })
      ] }),
      owners.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fOwner, onValueChange: setFOwner, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Phụ trách" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả phụ trách" }),
          owners.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o))
        ] })
      ] }),
      plans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fPlan, onValueChange: setFPlan, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Plan" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả plan" }),
          plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-[150px]", value: fDate, onChange: (e) => setFDate(e.target.value) }),
      (search || fStatus !== "all" || fOwner !== "all" || fTopic !== "all" || fPlan !== "all" || fDate || quick !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
        setSearch("");
        setFStatus("all");
        setFOwner("all");
        setFTopic("all");
        setFPlan("all");
        setFDate("");
        setQuick("all");
      }, children: "Xóa lọc" }),
      canKwCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "ml-auto", onClick: () => setAddingKw(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Thêm từ khóa"
      ] })
    ] }),
    filteredGroups.length === 0 && filteredExtras.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-10 text-center text-sm text-muted-foreground", children: [
      "Chưa có bài viết nào được đánh dấu ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: '"Đã index"' }),
      ". Khi bài đã đăng có trạng thái Index = Đã index, sẽ tự xuất hiện ở đây."
    ] }) }),
    filteredGroups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5 w-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Từ khóa chính" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "URL đích" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Topic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2.5", children: "TOP hiện tại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2.5", children: "TOP kỳ trước" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Thay đổi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Ngày check" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredGroups.map(({ g, subPass }) => {
        const open = isExpanded(g.contentId);
        const subsToShow = subPass.length > 0 || (search || quick !== "all" || fStatus !== "all") ? subPass : g.subRows;
        const t = g.mainRow.track;
        const noMain = !g.mainRow.keyword;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 bg-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggle(g.contentId), className: "p-1 -m-1 rounded hover:bg-muted", "aria-label": "toggle subs", children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 align-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: g.mainRow.keyword || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "(chưa có)" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5 line-clamp-1", children: g.content.title }),
              noMain && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 text-[11px] text-warning", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                "Bài đã index nhưng chưa có từ khóa chính."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
                g.subRows.length,
                " từ khóa phụ"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top max-w-[220px]", children: g.content.publishedLink ? canOpenUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: g.content.publishedLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[180px]", children: g.content.publishedLink.replace(/^https?:\/\//, "") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 shrink-0" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate inline-block max-w-[180px]", title: "Bạn không có quyền mở URL", children: g.content.publishedLink.replace(/^https?:\/\//, "") }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top text-muted-foreground text-xs", children: t?.topic || g.content.topic || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top text-center font-semibold", children: t?.currentTop ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top text-center text-muted-foreground", children: t?.previousTop ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankChange, { cur: t?.currentTop, prev: t?.previousTop }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top text-muted-foreground text-xs", children: fmtDate(t?.lastCheckDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: t?.status || "Chưa check" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top text-muted-foreground text-xs", children: t?.owner || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 align-top text-right whitespace-nowrap", children: [
              canPrimary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setUpdating({ row: g.mainRow }), disabled: noMain, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                "Cập nhật TOP"
              ] }),
              !noMain && canKwDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Xóa từ khóa chính", onClick: () => deleteMain(g.contentId, g.mainRow.keyword, g.mainRow.track?.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
            ] })
          ] }),
          open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            subsToShow.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 border-l-2 border-l-primary/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 pl-8 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground mr-1.5", children: "↳" }),
                r.keyword
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs text-muted-foreground", colSpan: 2, children: "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center font-medium", children: r.track?.currentTop ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-muted-foreground", children: r.track?.previousTop ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankChange, { cur: r.track?.currentTop, prev: r.track?.previousTop }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: fmtDate(r.track?.lastCheckDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: r.track?.status || "Chưa check" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: r.track?.notes ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: r.track.notes, children: "📝" }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
                canSecondary && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setUpdating({ row: r }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                  "Cập nhật"
                ] }),
                r.contentId && canKwDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Xóa từ khóa phụ", onClick: () => deleteSub(r.contentId, r.keyword, r.track?.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
              ] })
            ] }, r.key)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/10 border-l-2 border-l-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 11, className: "px-3 py-2 pl-8", children: addingSubFor === g.contentId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  autoFocus: true,
                  value: newSub,
                  onChange: (e) => setNewSub(e.target.value),
                  placeholder: "Nhập từ khóa phụ...",
                  className: "max-w-xs h-8",
                  onKeyDown: (e) => {
                    if (e.key === "Enter") addSub(g.contentId);
                    if (e.key === "Escape") {
                      setAddingSubFor(null);
                      setNewSub("");
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => addSub(g.contentId), children: "Thêm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setAddingSubFor(null);
                setNewSub("");
              }, children: "Hủy" })
            ] }) : canKwCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "text-xs", onClick: () => setAddingSubFor(g.contentId), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
              "Thêm từ khóa phụ"
            ] }) }) })
          ] })
        ] }, g.contentId);
      }) })
    ] }) }) }) }),
    extras.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between px-4 py-2 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-sm font-medium inline-flex items-center gap-1.5", onClick: () => setShowExtras((v) => !v), children: [
        showExtras ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
        "Từ khóa khác (chưa gắn bài) ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
          "(",
          filteredExtras.length,
          "/",
          extras.length,
          ")"
        ] })
      ] }) }),
      showExtras && /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Từ khóa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Topic" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "TOP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Trước" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Thay đổi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Ngày check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Trạng thái" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredExtras.map((k) => {
          const row = { key: k.id, keyword: k.keyword, isMain: !!k.isMain, track: k };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: k.keyword }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: k.topic || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center font-semibold", children: k.currentTop ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-muted-foreground", children: k.previousTop ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankChange, { cur: k.currentTop, prev: k.previousTop }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: fmtDate(k.lastCheckDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: k.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
              (k.isMain ? canPrimary : canSecondary) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setUpdating({ row }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                "Cập nhật"
              ] }),
              canKwDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                if (confirm(`Xóa "${k.keyword}"?`)) s.remove("keywords", k.id);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
            ] })
          ] }, k.id);
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!updating, onOpenChange: (o) => !o && setUpdating(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cập nhật TOP" }) }),
      updating && /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateForm, { row: updating.row, onSubmit: (p) => {
        saveTop(updating.row, p);
        setUpdating(null);
      }, onClose: () => setUpdating(null) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addingKw, onOpenChange: setAddingKw, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Thêm từ khóa theo dõi" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AddKeywordForm,
        {
          contents: indexedContents,
          onSubmit: (p) => {
            addManualKeyword(p);
            setAddingKw(false);
          },
          onClose: () => setAddingKw(false)
        }
      )
    ] }) })
  ] });
}
function UpdateForm({
  row,
  onSubmit,
  onClose
}) {
  const t = row.track;
  const defaultUrl = t?.targetUrl || (row.contentId ? void 0 : void 0);
  const [cur, setCur] = reactExports.useState(t?.currentTop?.toString() ?? "");
  const [date, setDate] = reactExports.useState(todayISO());
  const [note, setNote] = reactExports.useState(t?.notes || "");
  const [url, setUrl] = reactExports.useState(defaultUrl || "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-xs mb-0.5", children: [
        "Từ khóa ",
        row.isMain ? "chính" : "phụ"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: row.keyword })
    ] }),
    t?.currentTop != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
      "TOP hiện tại lưu: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: t.currentTop }),
      " sẽ chuyển thành TOP kỳ trước."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "URL đích", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "TOP mới", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: cur, onChange: (e) => setCur(e.target.value), placeholder: "0 = mất top" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Ngày check", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Ghi chú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: note, onChange: (e) => setNote(e.target.value), rows: 2 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSubmit({
        cur: cur === "" ? void 0 : Math.max(0, parseInt(cur, 10) || 0),
        date,
        note,
        targetUrl: url || void 0
      }), children: "Lưu" })
    ] })
  ] });
}
function Field$1({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: label }),
    children
  ] });
}
function AddKeywordForm({
  contents,
  onSubmit,
  onClose
}) {
  const [contentId, setContentId] = reactExports.useState("__none");
  const [isMain, setIsMain] = reactExports.useState("sub");
  const [keyword, setKeyword] = reactExports.useState("");
  const [targetUrl, setTargetUrl] = reactExports.useState("");
  const linkedContent = contentId !== "__none" ? contents.find((c) => c.id === contentId) : void 0;
  const mainTaken = !!(linkedContent && (linkedContent.mainKeyword || "").trim() && isMain === "main");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Gắn với bài đã index (tùy chọn)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: contentId, onValueChange: setContentId, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none", children: "— Không gắn (từ khóa độc lập) —" }),
        contents.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.title }, c.id))
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Loại từ khóa", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: isMain, onValueChange: setIsMain, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "main", children: "Từ khóa chính" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sub", children: "Từ khóa phụ" })
      ] })
    ] }) }),
    mainTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-warning inline-flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
      'Bài đang có từ khóa chính "',
      linkedContent?.mainKeyword,
      '". Lưu sẽ ghi đè.'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Từ khóa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, value: keyword, onChange: (e) => setKeyword(e.target.value), placeholder: "Nhập từ khóa..." }) }),
    contentId === "__none" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "URL đích (tùy chọn)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: targetUrl, onChange: (e) => setTargetUrl(e.target.value), placeholder: "https://..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          disabled: !keyword.trim(),
          onClick: () => onSubmit({
            contentId: contentId === "__none" ? void 0 : contentId,
            isMain: isMain === "main",
            keyword: keyword.trim(),
            targetUrl: targetUrl.trim() || void 0
          }),
          children: "Thêm"
        }
      )
    ] })
  ] });
}
function TopicSelect({ websiteId, value, onChange }) {
  const list = useStore((st) => st.webTopics).filter((t) => t.websiteId === websiteId);
  if (list.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
      "Chưa có Topic. Hãy tạo tại tab ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Nghiên Cứu Keyword" }),
      "."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "_", onValueChange: (v) => onChange(v === "_" ? void 0 : v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
      list.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.name, children: t.name }, t.id))
    ] })
  ] });
}
const fmtMoney = (n) => n == null ? "—" : n.toLocaleString("vi-VN") + " đ";
function BacklinksTab({ websiteId }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("web.backlink_create");
  const canEdit = can("web.backlink_edit");
  const canDelete = can("web.backlink_delete");
  const canOpen = can("web.backlink_open");
  const all = s.backlinks.filter((b) => b.websiteId === websiteId);
  const publishedContents = s.webContents.filter(
    (c) => c.websiteId === websiteId && c.publishedLink
  );
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fType, setFType] = reactExports.useState("all");
  const [fTarget, setFTarget] = reactExports.useState("all");
  const [fKeyword, setFKeyword] = reactExports.useState("");
  const [dateFrom, setDateFrom] = reactExports.useState("");
  const [dateTo, setDateTo] = reactExports.useState("");
  const [quick, setQuick] = reactExports.useState("all");
  const targetOptions = reactExports.useMemo(
    () => Array.from(/* @__PURE__ */ new Set([
      ...publishedContents.map((c) => c.publishedLink),
      ...all.map((b) => b.targetUrl).filter(Boolean)
    ])),
    [publishedContents, all]
  );
  const filtered = all.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      if (!b.name.toLowerCase().includes(q) && !(b.sourceSite || "").toLowerCase().includes(q) && !(b.anchorText || "").toLowerCase().includes(q)) return false;
    }
    if (fStatus !== "all" && b.status !== fStatus) return false;
    if (fType !== "all" && b.type !== fType) return false;
    if (fTarget !== "all" && b.targetUrl !== fTarget) return false;
    if (fKeyword && !(b.keyword || "").toLowerCase().includes(fKeyword.toLowerCase())) return false;
    if (dateFrom && (!b.publishDate || b.publishDate < dateFrom)) return false;
    if (dateTo && (!b.publishDate || b.publishDate > dateTo)) return false;
    if (quick === "not_published" && (b.status === "Đã đăng" || b.status === "Đã kiểm tra link")) return false;
    if (quick === "published" && !(b.status === "Đã đăng" || b.status === "Đã kiểm tra link")) return false;
    if (quick === "not_checked" && b.status !== "Đã đăng") return false;
    if (quick === "broken" && b.status !== "Lỗi / mất link") return false;
    return true;
  });
  const counts = {
    all: all.length,
    not_published: all.filter((b) => b.status !== "Đã đăng" && b.status !== "Đã kiểm tra link").length,
    published: all.filter((b) => b.status === "Đã đăng" || b.status === "Đã kiểm tra link").length,
    not_checked: all.filter((b) => b.status === "Đã đăng").length,
    broken: all.filter((b) => b.status === "Lỗi / mất link").length
  };
  const QF = ({ id, label, count }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => setQuick(id),
      className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`,
      children: [
        label,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: quick === id ? "opacity-80" : "text-muted-foreground", children: [
          "(",
          count,
          ")"
        ] })
      ]
    }
  );
  const totalCost = filtered.reduce((sum, b) => sum + (b.cost || 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "all", label: "Tất cả", count: counts.all }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "not_published", label: "Chưa đăng", count: counts.not_published }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "published", label: "Đã đăng", count: counts.published }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "not_checked", label: "Chưa kiểm tra link", count: counts.not_checked }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "broken", label: "Lỗi / mất link", count: counts.broken })
      ] }),
      canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Thêm backlink"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", placeholder: "Tìm tên / nguồn / anchor...", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Trạng thái: Tất cả" }),
          BACKLINK_STATUSES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fType, onValueChange: setFType, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Loại" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Loại: Tất cả" }),
          BACKLINK_TYPES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fTarget, onValueChange: setFTarget, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "URL đích" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "URL đích: Tất cả" }),
          targetOptions.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", placeholder: "Từ khóa...", value: fKeyword, onChange: (e) => setFKeyword(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: "Đăng:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Tên bài / backlink" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Website nguồn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Loại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "URL đích" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Anchor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Từ khóa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2.5", children: "Chi phí" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Ngày đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2.5", children: "Link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2.5", children: "Thao tác" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 12, className: "px-4 py-12 text-center text-muted-foreground", children: "Không có backlink nào khớp bộ lọc." }) }),
        filtered.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium max-w-[220px]", children: b.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: b.sourceSite || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: b.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs max-w-[180px] truncate", title: b.targetUrl, children: b.targetUrl || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: b.anchorText || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: b.keyword || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-xs", children: fmtMoney(b.cost) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: fmtDate(b.publishDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: b.owner || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: b.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: b.publishedLink ? canOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: b.publishedLink, target: "_blank", rel: "noreferrer", className: "inline-flex items-center justify-center text-primary hover:underline", title: "Mở link bài đã đăng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", title: "Không có quyền mở link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 inline opacity-40" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 inline opacity-40" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(b), title: "Sửa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => {
                  if (confirm(`Xóa backlink "${b.name}"?`)) s.remove("backlinks", b.id);
                },
                title: "Xóa",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
              }
            )
          ] })
        ] }, b.id))
      ] }),
      filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 6, className: "px-3 py-2 text-xs text-muted-foreground text-right", children: [
          "Tổng chi phí (",
          filtered.length,
          " backlink):"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-sm font-semibold", children: fmtMoney(totalCost) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5 })
      ] }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BacklinkDialog,
      {
        open: adding || !!editing,
        initial: editing,
        websiteId,
        targetSuggestions: targetOptions,
        onClose: () => {
          setAdding(false);
          setEditing(null);
        },
        onSave: (b) => {
          if (editing) s.update("backlinks", editing.id, b);
          else s.add("backlinks", { ...b, id: uid(), websiteId });
          setAdding(false);
          setEditing(null);
        }
      }
    )
  ] });
}
function BacklinkDialog({
  open,
  initial,
  websiteId,
  targetSuggestions,
  onClose,
  onSave
}) {
  const empty = {
    id: "",
    websiteId,
    name: "",
    type: "Bài PR báo chí",
    status: "Dự kiến"
  };
  const [form, setForm] = reactExports.useState(initial || empty);
  const [targetMode, setTargetMode] = reactExports.useState(
    initial?.targetUrl && !targetSuggestions.includes(initial.targetUrl) ? "manual" : "pick"
  );
  const key = (initial?.id || "new") + (open ? "-open" : "");
  reactExports.useMemo(() => {
    if (open) {
      setForm(initial || { ...empty });
      setTargetMode(initial?.targetUrl && !targetSuggestions.includes(initial.targetUrl) ? "manual" : "pick");
    }
  }, [key]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Sửa backlink" : "Thêm backlink mới" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tên bài PR / backlink *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => set("name", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Website nguồn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sourceSite || "", onChange: (e) => set("sourceSite", e.target.value), placeholder: "vd: dantri.com.vn" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Link bài đã đăng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.publishedLink || "", onChange: (e) => set("publishedLink", e.target.value), placeholder: "https://..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "URL đích trỏ về", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex rounded-md border bg-card p-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTargetMode("pick"), className: `px-2.5 py-1 text-xs rounded ${targetMode === "pick" ? "bg-secondary" : ""}`, children: "Chọn từ bài đã đăng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTargetMode("manual"), className: `px-2.5 py-1 text-xs rounded ${targetMode === "manual" ? "bg-secondary" : ""}`, children: "Nhập thủ công" })
        ] }),
        targetMode === "pick" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.targetUrl || "", onValueChange: (v) => set("targetUrl", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn URL đích..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            targetSuggestions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 text-xs text-muted-foreground", children: "Chưa có bài đã đăng" }),
            targetSuggestions.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.targetUrl || "", onChange: (e) => set("targetUrl", e.target.value), placeholder: "https://..." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Anchor text", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.anchorText || "", onChange: (e) => set("anchorText", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Từ khóa liên quan", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.keyword || "", onChange: (e) => set("keyword", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Topic (chọn từ tab Nghiên Cứu Keyword)", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TopicSelect, { websiteId, value: form.topic, onChange: (v) => set("topic", v) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Loại backlink", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.type, onValueChange: (v) => set("type", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BACKLINK_TYPES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trạng thái", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => set("status", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BACKLINK_STATUSES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Chi phí (VNĐ)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.cost ?? "", onChange: (e) => set("cost", e.target.value === "" ? void 0 : Number(e.target.value)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày đăng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.publishDate || "", onChange: (e) => set("publishDate", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người phụ trách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.owner || "", onChange: (e) => set("owner", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ghi chú", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes || "", onChange: (e) => set("notes", e.target.value) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: !form.name.trim(), children: initial ? "Lưu thay đổi" : "Thêm backlink" })
    ] })
  ] }) });
}
function Field({ label, children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-muted-foreground mb-1", children: label }),
    children
  ] });
}
function sortMetrics(arr) {
  return [...arr].sort((a, b) => {
    const ka = a.periodKey || a.updatedAt || "";
    const kb = b.periodKey || b.updatedAt || "";
    return kb.localeCompare(ka);
  });
}
function pct(curr, prev) {
  if (curr == null || prev == null || prev === 0) return null;
  return Math.round((curr - prev) / prev * 1e3) / 10;
}
function Delta({
  curr,
  prev,
  suffix = "",
  invert = false
}) {
  if (curr == null || prev == null) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" });
  const d = curr - prev;
  if (Math.abs(d) < 1e-3) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }),
      "Không đổi"
    ] });
  }
  const goingUp = d > 0;
  const isGood = invert ? !goingUp : goingUp;
  const tone = isGood ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive";
  const Icon = goingUp ? TrendingUp : TrendingDown;
  const p = pct(curr, prev);
  const sign = goingUp ? "+" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${tone}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
    sign,
    Math.round(d * 100) / 100,
    suffix,
    p != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
      "(",
      sign,
      p,
      "%)"
    ] })
  ] });
}
function fmtNum(n, suffix = "") {
  if (n == null) return "—";
  return n.toLocaleString("vi-VN") + suffix;
}
function MetricCompareCard({
  label,
  curr,
  prev,
  suffix = "",
  invert = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-0.5", children: fmtNum(curr, suffix) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Delta, { curr, prev, suffix, invert }) })
  ] }) });
}
function GrowthTab({ websiteId }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("web.growth_create");
  const canEdit = can("web.growth_edit");
  const canDelete = can("web.growth_delete");
  const canOpen = can("web.growth_open");
  const all = s.growth.filter((g) => g.websiteId === websiteId);
  const [filterType, setFilterType] = reactExports.useState("all");
  const [filterYear, setFilterYear] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const years = reactExports.useMemo(() => {
    const ys = /* @__PURE__ */ new Set();
    all.forEach((g) => {
      const y = (g.periodKey || g.updatedAt || "").slice(0, 4);
      if (y) ys.add(y);
    });
    return Array.from(ys).sort().reverse();
  }, [all]);
  const filtered = reactExports.useMemo(() => {
    return sortMetrics(all.filter((g) => {
      if (filterType !== "all" && g.periodType !== filterType) return false;
      if (filterYear !== "all") {
        const y = (g.periodKey || g.updatedAt || "").slice(0, 4);
        if (y !== filterYear) return false;
      }
      return true;
    }));
  }, [all, filterType, filterYear]);
  const sorted = sortMetrics(all);
  const latest = sorted[0];
  const prev = sorted[1];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterType, onValueChange: (v) => setFilterType(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Loại kỳ" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả loại kỳ" }),
          GROWTH_PERIOD_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[120px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Năm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả năm" }),
          years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Thêm kỳ báo cáo"
      ] }) })
    ] }) }),
    latest ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        "So sánh kỳ mới nhất ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: latest.period }),
        prev ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " với kỳ trước ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: prev.period })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: " — chưa có kỳ trước để so sánh" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Traffic tổng", curr: latest.totalTraffic, prev: prev?.totalTraffic }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Organic traffic", curr: latest.organicTraffic, prev: prev?.organicTraffic }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Impression", curr: latest.impressions, prev: prev?.impressions }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Click", curr: latest.clicks, prev: prev?.clicks }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "CTR", curr: latest.ctr, prev: prev?.ctr, suffix: "%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Lead/Form/Inbox", curr: latest.leads, prev: prev?.leads })
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6 text-center text-sm text-muted-foreground", children: "Chưa có dữ liệu tăng trưởng. Hãy thêm kỳ báo cáo đầu tiên." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2 whitespace-nowrap", children: "Kỳ báo cáo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Traffic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Organic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Impression" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Click" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "CTR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Vị trí TB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Trang index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2", children: "Lead" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Người cập nhật" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Ngày" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 13, className: "text-center text-muted-foreground py-8", children: "Chưa có kỳ báo cáo nào" }) }),
        filtered.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 font-medium", children: [
            g.period,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: g.periodType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtNum(g.totalTraffic) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtNum(g.organicTraffic) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtNum(g.impressions) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtNum(g.clicks) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: g.ctr != null ? g.ctr + "%" : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: g.avgPosition ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtNum(g.indexedPages) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtNum(g.leads) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: g.updatedBy || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs whitespace-nowrap", children: fmtDate(g.updatedAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs max-w-[200px] truncate", title: g.notes, children: g.notes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right whitespace-nowrap", children: [
            g.reportLink && canOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: g.reportLink, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }) }) }),
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(g), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
              if (confirm("Xóa kỳ báo cáo này?")) s.remove("growth", g.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
          ] })
        ] }, g.id))
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      GrowthForm,
      {
        open: adding || !!editing,
        initial: editing,
        onClose: () => {
          setAdding(false);
          setEditing(null);
        },
        onSubmit: (data) => {
          if (editing) s.update("growth", editing.id, data);
          else s.add("growth", { ...data, id: uid(), websiteId });
          setAdding(false);
          setEditing(null);
        }
      }
    )
  ] });
}
function GrowthForm({
  open,
  initial,
  onClose,
  onSubmit
}) {
  const [form, setForm] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { periodType: "Tuần", updatedAt: todayISO() });
    }
  }, [open, initial]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => v === "" ? void 0 : Number(v);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Sửa kỳ báo cáo" : "Thêm kỳ báo cáo tăng trưởng" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kỳ báo cáo *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "VD: Tuần 2 tháng 5/2026", value: form.period || "", onChange: (e) => set("period", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại kỳ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.periodType || "Tuần", onValueChange: (v) => set("periodType", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GROWTH_PERIOD_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày cập nhật" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.updatedAt || "", onChange: (e) => set("updatedAt", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Traffic tổng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.totalTraffic ?? "", onChange: (e) => set("totalTraffic", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic traffic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.organicTraffic ?? "", onChange: (e) => set("organicTraffic", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Impression" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.impressions ?? "", onChange: (e) => set("impressions", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Click" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.clicks ?? "", onChange: (e) => set("clicks", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CTR (%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.ctr ?? "", onChange: (e) => set("ctr", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vị trí trung bình" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.avgPosition ?? "", onChange: (e) => set("avgPosition", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số trang đã index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.indexedPages ?? "", onChange: (e) => set("indexedPages", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lead / Form / Inbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.leads ?? "", onChange: (e) => set("leads", num(e.target.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link báo cáo GA / GSC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://...", value: form.reportLink || "", onChange: (e) => set("reportLink", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người cập nhật" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.updatedBy || "", onChange: (e) => set("updatedBy", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.period, onClick: () => onSubmit(form), children: initial ? "Lưu" : "Thêm" })
    ] })
  ] }) });
}
function GrowthSummary({ websiteId, onJump }) {
  const s = useStore();
  const sorted = sortMetrics(s.growth.filter((g) => g.websiteId === websiteId));
  const latest = sorted[0];
  const prev = sorted[1];
  if (!latest) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 text-sm text-muted-foreground flex items-center justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Chưa có dữ liệu tăng trưởng. Hãy cập nhật tại tab Tăng Trưởng Website." }),
      onJump && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onJump, children: "Mở tab Tăng Trưởng" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Kỳ mới nhất: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: latest.period }),
        prev && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " · so với ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: prev.period })
        ] })
      ] }),
      onJump && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: onJump, children: "Mở tab Tăng Trưởng" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Traffic tổng", curr: latest.totalTraffic, prev: prev?.totalTraffic }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Organic", curr: latest.organicTraffic, prev: prev?.organicTraffic }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Impression", curr: latest.impressions, prev: prev?.impressions }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Click", curr: latest.clicks, prev: prev?.clicks }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "CTR", curr: latest.ctr, prev: prev?.ctr, suffix: "%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Vị trí TB", curr: latest.avgPosition, prev: prev?.avgPosition, invert: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Trang index", curr: latest.indexedPages, prev: prev?.indexedPages }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCompareCard, { label: "Lead/Form", curr: latest.leads, prev: prev?.leads })
    ] })
  ] }) });
}
const PRODUCING = ["Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài", "Đang trình bày nháp web"];
const REVIEW = ["Chờ duyệt outline", "Chờ duyệt bài", "Chờ duyệt bản nháp web"];
const FIX = ["Cần sửa outline", "Cần sửa bài", "Cần sửa bản nháp web"];
const WAIT_PUBLISH = ["Bài viết đã duyệt", "Bản nháp web đã duyệt", "Chờ đăng web"];
const PUBLISHED_LIKE = ["Đã đăng web", "Kiểm tra index", "Hoàn thành"];
const OPT_OPEN = ["Đã tạo", "Đã giao", "Đang tối ưu", "Chờ duyệt tối ưu", "Cần sửa tối ưu", "Đã duyệt tối ưu"];
const OPT_DOING = ["Đã giao", "Đang tối ưu"];
const isOptimize = (c) => c.type === "Bài tối ưu lại";
function startOfWeek() {
  const d = /* @__PURE__ */ new Date();
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}
function startOfMonth() {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}
function toISO(d) {
  return d.toISOString().slice(0, 10);
}
function inRange(iso, range) {
  if (!iso) return false;
  if (range.from && iso < range.from) return false;
  if (range.to && iso > range.to) return false;
  return true;
}
function StatCard({
  icon: Icon,
  label,
  value,
  accent = "default",
  hint
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-[oklch(0.45_0.13_75)]",
    info: "bg-info/15 text-info",
    danger: "bg-destructive/15 text-destructive"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5 flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${tones[accent]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold leading-tight mt-0.5", children: value }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: hint })
    ] })
  ] }) });
}
function GroupTitle({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground mt-4 mb-2 flex items-center gap-2", children });
}
function BasicReportTab({
  websiteId,
  onOpenContent,
  onJumpTab
}) {
  const s = useStore();
  const contents = s.webContents.filter((c) => c.websiteId === websiteId);
  const checks = s.seoChecks.filter((c) => c.websiteId === websiteId);
  const backlinks = s.backlinks.filter((b) => b.websiteId === websiteId);
  const keywords = s.keywords.filter((k) => k.websiteId === websiteId && isActiveKeywordTrack(k, s.webContents));
  const [quick, setQuick] = reactExports.useState("all");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [allOpen, setAllOpen] = reactExports.useState(false);
  const [aSearch, setASearch] = reactExports.useState("");
  const [aQuick, setAQuick] = reactExports.useState("Tất cả");
  const [aType, setAType] = reactExports.useState("all");
  const [aOwner, setAOwner] = reactExports.useState("all");
  const [aLevel, setALevel] = reactExports.useState("all");
  const range = reactExports.useMemo(() => {
    const today2 = toISO(/* @__PURE__ */ new Date());
    if (quick === "week") return { from: toISO(startOfWeek()), to: today2 };
    if (quick === "month") return { from: toISO(startOfMonth()), to: today2 };
    if (quick === "custom") return { from: from || void 0, to: to || void 0 };
    return {};
  }, [quick, from, to]);
  const hasRange = !!(range.from || range.to);
  const contentInRange = (c) => {
    if (!hasRange) return true;
    return [c.deadline, c.publishedAt, c.publishDate, c.completedAt].some((d) => d && inRange(d, range));
  };
  const backlinkInRange = (b) => !hasRange || inRange(b.publishDate, range);
  const keywordInRange = (k) => !hasRange || inRange(k.lastCheckDate, range);
  const fc = contents.filter(contentInRange);
  const fb = backlinks.filter(backlinkInRange);
  const fk = keywords.filter(keywordInRange);
  const cnt = (arr, pred) => arr.filter(pred).length;
  const contentStats = {
    total: fc.length,
    producing: cnt(fc, (c) => PRODUCING.includes(c.status)),
    reviewOutline: cnt(fc, (c) => c.status === "Chờ duyệt outline"),
    reviewDraft: cnt(fc, (c) => c.status === "Chờ duyệt bài"),
    fix: cnt(fc, (c) => FIX.includes(c.status)),
    waitPublish: cnt(fc, (c) => WAIT_PUBLISH.includes(c.status)),
    published: cnt(fc, (c) => PUBLISHED_LIKE.includes(c.status)),
    done: cnt(fc, (c) => c.status === "Hoàn thành")
  };
  const todayISO0 = toISO(/* @__PURE__ */ new Date());
  const optAll = fc.filter((c) => isOptimize(c) && c.status !== "Đã hủy");
  const optStats = {
    waitingAssign: cnt(optAll, (c) => c.status === "Đã tạo"),
    doing: cnt(optAll, (c) => OPT_DOING.includes(c.status)),
    pendingReview: cnt(optAll, (c) => c.status === "Chờ duyệt tối ưu"),
    needFix: cnt(optAll, (c) => c.status === "Cần sửa tối ưu"),
    overdue: cnt(
      optAll,
      (c) => OPT_OPEN.includes(c.status) && !!c.deadline && c.deadline < todayISO0
    )
  };
  const publishedList = fc.filter((c) => !!c.publishedLink || PUBLISHED_LIKE.includes(c.status));
  const indexStats = {
    published: publishedList.length,
    indexed: publishedList.filter((c) => c.indexStatus === "Đã index").length,
    notIndexed: publishedList.filter((c) => c.indexStatus === "Chưa index").length,
    notChecked: publishedList.filter((c) => c.indexStatus === "Chưa kiểm tra").length,
    indexedNotShared: publishedList.filter((c) => c.indexStatus === "Đã index" && !c.shareSocial).length,
    shared: publishedList.filter((c) => !!c.shareSocial).length
  };
  const seoTotal = checks.length;
  const seoDone = checks.filter((c) => c.done).length;
  const seoPct = seoTotal ? Math.round(seoDone / seoTotal * 100) : 0;
  const blStats = {
    total: fb.length,
    posted: fb.filter((b) => b.status === "Đã đăng" || b.status === "Đã kiểm tra link").length,
    notPosted: fb.filter((b) => b.status === "Dự kiến" || b.status === "Đã đặt").length,
    checked: fb.filter((b) => b.status === "Đã kiểm tra link").length,
    broken: fb.filter((b) => b.status === "Lỗi / mất link").length
  };
  const main = fk.filter((k) => k.isMain);
  const sub = fk.filter((k) => !k.isMain);
  const kwStats = {
    main: main.length,
    sub: sub.length,
    top3: fk.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 3).length,
    top10: fk.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 10).length,
    up: fk.filter((k) => (k.currentTop ?? 0) > 0 && (k.previousTop ?? 0) > 0 && k.currentTop < k.previousTop).length,
    down: fk.filter((k) => (k.currentTop ?? 0) > 0 && (k.previousTop ?? 0) > 0 && k.currentTop > k.previousTop).length,
    lost: fk.filter((k) => k.status === "Mất top").length,
    unchecked: fk.filter((k) => k.status === "Chưa check" || k.currentTop == null).length
  };
  const today = toISO(/* @__PURE__ */ new Date());
  const attention = [];
  fc.forEach((c) => {
    const owner = c.writer || c.publisher || c.assigner;
    const open = () => onOpenContent?.(c);
    if (c.status === "Đã hủy") return;
    if (isOptimize(c)) {
      if (c.status === "Đã tạo" && !c.writer)
        attention.push({ type: "Tối ưu chưa phân công", severity: "warn", source: "Tối ưu lại Content", content: c.title, owner: void 0, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      if (c.deadline && c.deadline < today && OPT_OPEN.includes(c.status))
        attention.push({ type: "Tối ưu quá hạn", severity: "danger", source: "Tối ưu lại Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      if (c.status === "Chờ duyệt tối ưu")
        attention.push({ type: "Tối ưu chờ duyệt", severity: "warn", source: "Tối ưu lại Content", content: c.title, owner: c.optimizeReviewer || owner, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      if (c.status === "Cần sửa tối ưu")
        attention.push({ type: "Tối ưu cần sửa", severity: "warn", source: "Tối ưu lại Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở việc tối ưu", onClick: open } });
      return;
    }
    if (c.deadline && c.deadline < today && !PUBLISHED_LIKE.includes(c.status))
      attention.push({ type: "Quá deadline", severity: "danger", source: "Sản xuất Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if (c.status === "Chờ duyệt outline")
      attention.push({ type: "Chờ duyệt outline", severity: "warn", source: "Sản xuất Content", content: c.title, owner: c.outlineReviewer || owner, date: c.outlineDeadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if (c.status === "Chờ duyệt bài")
      attention.push({ type: "Chờ duyệt bài", severity: "warn", source: "Sản xuất Content", content: c.title, owner: c.draftReviewer || owner, date: c.deadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if (FIX.includes(c.status))
      attention.push({ type: "Cần sửa", severity: "warn", source: "Sản xuất Content", content: c.title, owner, date: c.deadline, status: c.status, action: { label: "Mở content", onClick: open } });
    if ((c.publishedLink || PUBLISHED_LIKE.includes(c.status)) && c.indexStatus === "Chưa kiểm tra")
      attention.push({ type: "Chưa kiểm tra index", severity: "info", source: "Bài đã đăng / Index", content: c.title, owner: c.publisher || owner, date: c.publishedAt, status: c.indexStatus, action: { label: "Mở content", onClick: open } });
    if (c.indexStatus === "Đã index" && !c.shareSocial)
      attention.push({ type: "Index — chưa share social", severity: "info", source: "Bài đã đăng / Index", content: c.title, owner: c.publisher || owner, date: c.publishedAt, status: "Chưa share", action: { label: "Mở content", onClick: open } });
  });
  fk.forEach((k) => {
    if (k.status === "Tụt hạng")
      attention.push({ type: "Từ khóa tụt hạng", severity: "warn", source: "Check TOP từ khóa", content: k.keyword, owner: k.owner, date: k.lastCheckDate, status: `${k.previousTop ?? "?"} → ${k.currentTop ?? "?"}`, action: { label: "Mở Check TOP", onClick: () => onJumpTab?.("keywords") } });
    if (k.status === "Mất top")
      attention.push({ type: "Từ khóa mất top", severity: "danger", source: "Check TOP từ khóa", content: k.keyword, owner: k.owner, date: k.lastCheckDate, status: "Mất top", action: { label: "Mở Check TOP", onClick: () => onJumpTab?.("keywords") } });
  });
  fb.forEach((b) => {
    if (b.status === "Lỗi / mất link")
      attention.push({ type: "Backlink lỗi", severity: "danger", source: "Backlink / PR", content: b.name, owner: b.owner, date: b.publishDate, status: b.status, action: { label: "Mở Backlink", onClick: () => onJumpTab?.("backlinks") } });
  });
  if (seoTotal && seoDone < seoTotal) {
    attention.push({
      type: "Technical SEO chưa xong",
      severity: "info",
      source: "Technical SEO",
      content: `Còn ${seoTotal - seoDone}/${seoTotal} mục checklist chưa hoàn thành`,
      status: `${seoPct}%`,
      action: { label: "Mở Technical SEO", onClick: () => onJumpTab?.("seo") }
    });
  }
  const typePriority = {
    "Từ khóa mất top": 1,
    "Backlink lỗi": 2,
    "Tối ưu quá hạn": 2.5,
    "Quá deadline": 3,
    "Cần sửa": 4,
    "Tối ưu cần sửa": 4.2,
    "Tối ưu chưa phân công": 4.5,
    "Tối ưu chờ duyệt": 4.8,
    "Chờ duyệt outline": 5,
    "Chờ duyệt bài": 5,
    "Từ khóa tụt hạng": 6,
    "Index — chưa share social": 7,
    "Chưa kiểm tra index": 8,
    "Technical SEO chưa xong": 9
  };
  const sevWeight = { danger: 0, warn: 1, info: 2 };
  attention.sort((a, b) => {
    const sv = sevWeight[a.severity] - sevWeight[b.severity];
    if (sv !== 0) return sv;
    return (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99);
  });
  const levelOf = (s2) => s2 === "danger" ? "Cao" : s2 === "warn" ? "Trung bình" : "Thấp";
  const owners = Array.from(new Set(fc.map((c) => c.writer || c.publisher || c.assigner).filter(Boolean)));
  const ownerRows = owners.map((o) => {
    const mine = fc.filter((c) => (c.writer || c.publisher || c.assigner) === o);
    return {
      owner: o,
      assigned: mine.length,
      doing: mine.filter((c) => PRODUCING.includes(c.status)).length,
      review: mine.filter((c) => REVIEW.includes(c.status)).length,
      fix: mine.filter((c) => FIX.includes(c.status)).length,
      published: mine.filter((c) => PUBLISHED_LIKE.includes(c.status)).length,
      done: mine.filter((c) => c.status === "Hoàn thành").length,
      late: mine.filter((c) => c.deadline && c.deadline < today && !PUBLISHED_LIKE.includes(c.status)).length
    };
  }).sort((a, b) => b.assigned - a.assigned);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex rounded-md border bg-card p-0.5", children: [
        ["all", "Tất cả"],
        ["week", "Tuần này"],
        ["month", "Tháng này"],
        ["custom", "Tùy chọn"]
      ].map(([id, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: quick === id ? "secondary" : "ghost", onClick: () => setQuick(id), children: label }, id)) }),
      quick === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-[150px]", value: from, onChange: (e) => setFrom(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "đến" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-[150px]", value: to, onChange: (e) => setTo(e.target.value) })
      ] }),
      hasRange && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground ml-auto", children: [
        "Áp dụng cho ngày: ",
        range.from || "—",
        " → ",
        range.to || "—"
      ] })
    ] }) }),
    attention.length > 0 && (() => {
      const summary = attention.slice(0, 6);
      const owners2 = Array.from(new Set(attention.map((a) => a.owner).filter(Boolean)));
      const types2 = Array.from(new Set(attention.map((a) => a.type)));
      const QUICKS = ["Tất cả", "Content", "Tối ưu Content", "Index / Share Social", "Check TOP", "Backlink", "Technical SEO", "Quá hạn", "Nghiêm trọng"];
      const matchesQuick2 = (a) => {
        switch (aQuick) {
          case "Content":
            return a.source === "Sản xuất Content";
          case "Tối ưu Content":
            return a.source === "Tối ưu lại Content";
          case "Index / Share Social":
            return a.source === "Bài đã đăng / Index";
          case "Check TOP":
            return a.source === "Check TOP từ khóa";
          case "Backlink":
            return a.source === "Backlink / PR";
          case "Technical SEO":
            return a.source === "Technical SEO";
          case "Quá hạn":
            return a.type === "Quá deadline" || a.type === "Tối ưu quá hạn";
          case "Nghiêm trọng":
            return a.severity === "danger";
          default:
            return true;
        }
      };
      const filtered = attention.filter((a) => {
        if (!matchesQuick2(a)) return false;
        if (aType !== "all" && a.type !== aType) return false;
        if (aOwner !== "all" && a.owner !== aOwner) return false;
        if (aLevel !== "all" && levelOf(a.severity) !== aLevel) return false;
        if (aSearch && !`${a.content} ${a.type}`.toLowerCase().includes(aSearch.toLowerCase())) return false;
        return true;
      });
      const toneOf = (s2) => s2 === "danger" ? "text-destructive" : s2 === "warn" ? "text-[oklch(0.45_0.13_75)]" : "text-info";
      const levelBadge = (s2) => {
        const lvl = levelOf(s2);
        const cls = s2 === "danger" ? "bg-destructive/15 text-destructive border-destructive/30" : s2 === "warn" ? "bg-warning/15 text-[oklch(0.45_0.13_75)] border-warning/40" : "bg-muted text-muted-foreground border-border";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cls, children: lvl });
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-warning/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2.5 border-b bg-warning/10 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-[oklch(0.45_0.13_75)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Việc cần chú ý" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1", children: attention.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "ml-auto", onClick: () => setAllOpen(true), children: [
              "Xem tất cả ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Loại" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Nội dung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Phụ trách" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Ngày" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Trạng thái" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: summary.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-2 font-medium whitespace-nowrap ${toneOf(a.severity)}`, children: a.type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: a.content }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: a.owner || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: fmtDate(a.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: a.status ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: a.status }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: a.action && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: a.action.onClick, children: [
                  a.action.label,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
                ] }) })
              ] }, i)) })
            ] }),
            attention.length > summary.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Còn ",
                attention.length - summary.length,
                " cảnh báo khác"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "link", className: "h-auto p-0", onClick: () => setAllOpen(true), children: "Xem tất cả →" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: allOpen, onOpenChange: setAllOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "w-full sm:max-w-3xl lg:max-w-5xl overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-[oklch(0.45_0.13_75)]" }),
              "Tất cả việc cần chú ý",
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
                filtered.length,
                "/",
                attention.length
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Toàn bộ cảnh báo của website hiện tại." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-1.5", children: QUICKS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: aQuick === q ? "secondary" : "outline", onClick: () => setAQuick(q), children: q }, q)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm theo nội dung…", value: aSearch, onChange: (e) => setASearch(e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: aType, onValueChange: setAType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Loại cảnh báo" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả loại" }),
                types2.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: aOwner, onValueChange: setAOwner, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Phụ trách" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả phụ trách" }),
                owners2.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: aLevel, onValueChange: setALevel, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mức độ" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả mức độ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Cao", children: "Cao" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Trung bình", children: "Trung bình" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Thấp", children: "Thấp" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 border rounded-md overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Loại" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Nội dung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Nguồn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Phụ trách" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Ngày" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Trạng thái" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Mức độ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
              filtered.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-2 font-medium whitespace-nowrap ${toneOf(a.severity)}`, children: a.type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: a.content }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs text-muted-foreground whitespace-nowrap", children: a.source }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: a.owner || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: fmtDate(a.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: a.status ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: a.status }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: levelBadge(a.severity) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: a.action && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => {
                  a.action.onClick();
                  setAllOpen(false);
                }, children: [
                  a.action.label,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
                ] }) })
              ] }, i)),
              filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "text-center text-sm text-muted-foreground py-8", children: "Không có cảnh báo nào khớp bộ lọc." }) })
            ] })
          ] }) })
        ] }) })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
      "Sản xuất Content"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FileText, label: "Tổng content", value: contentStats.total }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FilePen, label: "Đang sản xuất", value: contentStats.producing, accent: "info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Eye, label: "Chờ duyệt outline", value: contentStats.reviewOutline, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Eye, label: "Chờ duyệt bài", value: contentStats.reviewDraft, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Wrench, label: "Cần sửa", value: contentStats.fix, accent: "danger" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Send, label: "Chờ đăng", value: contentStats.waitPublish, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: "Đã đăng", value: contentStats.published, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Trophy, label: "Hoàn thành", value: contentStats.done, accent: "success" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
      "Tối ưu lại Content"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Inbox, label: "Chờ phân công tối ưu", value: optStats.waitingAssign, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FilePen, label: "Đang tối ưu", value: optStats.doing, accent: "info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Eye, label: "Chờ duyệt tối ưu", value: optStats.pendingReview, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Wrench, label: "Cần sửa tối ưu", value: optStats.needFix, accent: "danger" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleAlert, label: "Tối ưu quá hạn", value: optStats.overdue, accent: "danger" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
      "Index & Share Social"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Send, label: "Bài đã đăng", value: indexStats.published }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: "Đã index", value: indexStats.indexed, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleAlert, label: "Chưa index", value: indexStats.notIndexed, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Eye, label: "Chưa kiểm tra", value: indexStats.notChecked }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Share2, label: "Index — chưa share", value: indexStats.indexedNotShared, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Share2, label: "Đã share social", value: indexStats.shared, accent: "success" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4" }),
      "Technical SEO"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ListChecks, label: "Tổng checklist", value: seoTotal }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: "Đã hoàn thành", value: seoDone, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleAlert, label: "Chưa hoàn thành", value: Math.max(0, seoTotal - seoDone), accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Activity, label: "% hoàn thành", value: `${seoPct}%`, accent: seoPct >= 80 ? "success" : seoPct >= 40 ? "info" : "warning" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5 space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tiến độ Technical SEO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          seoDone,
          "/",
          seoTotal
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: seoPct })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { className: "h-4 w-4" }),
      "Backlink / PR"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Link$1, label: "Tổng backlink", value: blStats.total }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: "Đã đăng", value: blStats.posted, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Eye, label: "Chưa đăng", value: blStats.notPosted, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ListChecks, label: "Đã kiểm tra", value: blStats.checked, accent: "info" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleAlert, label: "Lỗi / mất link", value: blStats.broken, accent: "danger" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
      "Check TOP từ khóa"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Trophy, label: "Từ khóa chính", value: kwStats.main }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ListChecks, label: "Từ khóa phụ", value: kwStats.sub }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Trophy, label: "Top 3", value: kwStats.top3, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Trophy, label: "Top 10", value: kwStats.top10, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: TrendingUp, label: "Tăng hạng", value: kwStats.up, accent: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: TrendingDown, label: "Tụt hạng", value: kwStats.down, accent: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleAlert, label: "Mất top", value: kwStats.lost, accent: "danger" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Eye, label: "Chưa check", value: kwStats.unchecked })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
      "Tăng Trưởng Website"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GrowthSummary, { websiteId, onJump: () => onJumpTab?.("growth") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GroupTitle, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { className: "h-4 w-4" }),
      "Theo người phụ trách"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Người phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Được giao" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Đang làm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Chờ duyệt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Cần sửa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Đã đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Hoàn thành" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2", children: "Quá hạn" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        ownerRows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "text-center text-muted-foreground py-6 text-sm", children: "Chưa có dữ liệu" }) }),
        ownerRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.owner }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: r.assigned }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-info", children: r.doing || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-[oklch(0.45_0.13_75)]", children: r.review || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-destructive", children: r.fix || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-success", children: r.published || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: r.done || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center text-destructive font-medium", children: r.late || "—" })
        ] }, r.owner))
      ] })
    ] }) }) }) })
  ] });
}
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
function TechnicalSeoTab({ websiteId }) {
  const { can } = useCurrentUser();
  const canCheck = can("web.tech_check");
  const canEditDesc = can("web.tech_edit_desc");
  const canReset = can("web.tech_reset");
  const s = useStore();
  const checks = s.seoChecks.filter((c) => c.websiteId === websiteId);
  const [search, setSearch] = reactExports.useState("");
  const [groupFilter, setGroupFilter] = reactExports.useState("all");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const groups = reactExports.useMemo(
    () => Array.from(new Set(checks.map((c) => c.group))),
    [checks]
  );
  const total = checks.length;
  const done = checks.filter((c) => c.done).length;
  const pct2 = total ? Math.round(done / total * 100) : 0;
  const q = search.trim().toLowerCase();
  const filtered = checks.filter((c) => {
    if (groupFilter !== "all" && c.group !== groupFilter) return false;
    if (statusFilter === "done" && !c.done) return false;
    if (statusFilter === "todo" && c.done) return false;
    if (q) {
      const hay = `${c.group} ${c.name} ${c.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const grouped = reactExports.useMemo(() => {
    const order = Array.from(/* @__PURE__ */ new Set([...Object.keys(SEO_CHECK_TEMPLATE), ...groups]));
    return order.map((g) => ({ g, items: filtered.filter((c) => c.group === g) })).filter((x) => x.items.length > 0);
  }, [filtered, groups]);
  const reset = () => {
    if (!canReset) {
      toast.error("Bạn không có quyền reset checklist Technical SEO.");
      return;
    }
    if (!confirm("Reset checklist Technical SEO về mặc định? Trạng thái và ghi chú sẽ bị xóa.")) return;
    checks.forEach((c) => s.remove("seoChecks", c.id));
    setTimeout(() => {
      ensureSeoChecks([], websiteId).forEach((c) => s.add("seoChecks", c));
    }, 0);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Tiến độ Technical SEO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            done,
            "/",
            total
          ] }),
          " hạng mục đã hoàn thành — ",
          pct2,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: pct2 })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px] max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-8", placeholder: "Tìm hạng mục, vấn đề, diễn giải...", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: groupFilter, onValueChange: setGroupFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả hạng mục" }),
          Array.from(/* @__PURE__ */ new Set([...Object.keys(SEO_CHECK_TEMPLATE), ...groups])).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: g }, g))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => setStatusFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "done", children: "Đã hoàn thành" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todo", children: "Chưa hoàn thành" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: canReset && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: reset, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
        "Reset checklist"
      ] }) })
    ] }) }),
    grouped.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-8 text-center text-sm text-muted-foreground", children: "Không có mục nào khớp bộ lọc." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "multiple", defaultValue: grouped.map((x) => x.g), className: "space-y-2", children: grouped.map(({ g, items }) => {
      const gDone = items.filter((c) => c.done).length;
      const gPct = items.length ? Math.round(gDone / items.length * 100) : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: g, className: "border rounded-lg bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "px-4 py-3 hover:no-underline hover:bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-left", children: g }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            gDone,
            "/",
            items.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2 mr-3 min-w-[120px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: gPct, className: "h-1.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground w-8 text-right", children: [
              gPct,
              "%"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/30 border-y", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2 w-[28%]", children: "Các vấn đề kiểm tra" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2 w-[110px]", children: "Trạng thái" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2", children: "Diễn giải" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: it.done ? "bg-success/5" : "hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 align-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-medium ${it.done ? "text-muted-foreground" : ""}`, children: it.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "h-7 text-xs mt-1.5",
                  placeholder: "Ghi chú nội bộ (tuỳ chọn)...",
                  value: it.notes || "",
                  disabled: !canEditDesc,
                  onChange: (e) => s.update("seoChecks", it.id, { notes: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: it.done,
                  disabled: !canCheck,
                  onCheckedChange: (v) => {
                    if (!canCheck) {
                      toast.error("Bạn không có quyền tick checklist Technical SEO.");
                      return;
                    }
                    s.update("seoChecks", it.id, { done: !!v, checkedAt: v ? todayISO() : void 0 });
                  }
                }
              ),
              it.done && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-success" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                rows: 2,
                className: "text-xs min-h-0 resize-y",
                value: it.description || "",
                readOnly: !canEditDesc,
                onChange: (e) => s.update("seoChecks", it.id, { description: e.target.value })
              }
            ) })
          ] }, it.id)) })
        ] }) }) })
      ] }, g);
    }) })
  ] });
}
const PRODUCING_STATUSES = ["Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài", "Cần sửa outline", "Cần sửa bài"];
const REVIEW_STATUSES = ["Chờ duyệt outline", "Chờ duyệt bài"];
const FIX_STATUSES = ["Cần sửa outline", "Cần sửa bài"];
const DONE_STATUSES = ["Đã đăng web", "Kiểm tra index", "Hoàn thành"];
function WebsiteDetail() {
  const {
    id
  } = Route$i.useParams();
  const s = useStore();
  const {
    can
  } = useCurrentUser();
  const w = s.websites.find((x) => x.id === id);
  const [view, setView] = reactExports.useState("table");
  const [adding, setAdding] = reactExports.useState(false);
  const [tab, setTab] = reactExports.useState("info");
  const [openContent, setOpenContent] = reactExports.useState(null);
  const [openOptId, setOpenOptId] = reactExports.useState(() => readOpenParam("open_opt"));
  const setOpenOptimizeContent = (c) => {
    setOpenOptId(c?.id ?? null);
    syncOpenParam("open_opt", c?.id ?? null);
  };
  const openOptimizeContent = openOptId ? s.webContents.find((x) => x.id === openOptId) ?? null : null;
  const [openOptimize, setOpenOptimize] = reactExports.useState(false);
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fWriter, setFWriter] = reactExports.useState("all");
  const [fType, setFType] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!w) return;
    const missing = ensureSeoChecks(s.seoChecks, w.id);
    missing.forEach((c) => s.add("seoChecks", c));
  }, [w?.id]);
  if (!w) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center", children: [
      "Không tìm thấy website. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/websites", className: "text-primary", children: "Quay lại" })
    ] });
  }
  const brand = s.brands.find((b) => b.id === w.brandId);
  const checks = s.seoChecks.filter((c) => c.websiteId === w.id);
  Array.from(new Set(checks.map((c) => c.group)));
  const contents = s.webContents.filter((c) => c.websiteId === w.id);
  const writers = Array.from(new Set(contents.map((c) => c.writer).filter(Boolean)));
  const filteredContents = contents.filter((c) => (fStatus === "all" || c.status === fStatus) && (fWriter === "all" || c.writer === fWriter) && (fType === "all" || c.type === fType) && (!search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.mainKeyword || "").toLowerCase().includes(search.toLowerCase())));
  const published = contents.filter((c) => DONE_STATUSES.includes(c.status));
  const optimizeContents = contents.filter((c) => c.type === "Bài tối ưu lại");
  const optimizeBadgeCount = optimizeContents.filter((c) => c.status !== "Đã hủy").length;
  const seoTotal = checks.length || 1;
  const seoDone = checks.filter((c) => c.done).length;
  const seoPct = Math.round(seoDone / seoTotal * 100);
  const ovw = {
    total: contents.length,
    producing: contents.filter((c) => PRODUCING_STATUSES.includes(c.status)).length,
    review: contents.filter((c) => REVIEW_STATUSES.includes(c.status)).length,
    fix: contents.filter((c) => FIX_STATUSES.includes(c.status)).length,
    published: published.length,
    notIndexed: published.filter((c) => c.indexStatus !== "Đã index").length
  };
  const waitingPublish = contents.filter((c) => c.status === "Chờ đăng web").length;
  const entitiesList = s.entities.filter((e) => e.websiteId === w.id);
  const keywordsList = s.keywords.filter((k) => k.websiteId === w.id && isActiveKeywordTrack(k, s.webContents));
  const indexedContents = contents.filter((c) => c.indexStatus === "Đã index");
  const splitSubsCount = (str) => (str || "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean).length;
  const checkTopMainCount = indexedContents.filter((c) => (c.mainKeyword || "").trim()).length;
  const checkTopSubCount = indexedContents.reduce((n, c) => n + splitSubsCount(c.subKeywords), 0);
  const checkTopStandalone = s.keywords.filter((k) => k.websiteId === w.id && !k.contentId).length;
  const checkTopVisibleCount = checkTopMainCount + checkTopSubCount + checkTopStandalone;
  const indexedNotShared = published.filter((c) => c.indexStatus === "Đã index" && !c.shareSocial).length;
  const sharedCount = published.filter((c) => c.shareSocial).length;
  const kwTop10 = keywordsList.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 10).length;
  const kwUp = keywordsList.filter((k) => k.currentTop != null && k.previousTop != null && k.currentTop > 0 && k.currentTop < k.previousTop).length;
  const kwDown = keywordsList.filter((k) => k.currentTop != null && k.previousTop != null && k.currentTop > k.previousTop).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/websites", className: "inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Quay lại danh sách dự án web"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "mb-4 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-tight", children: w.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: w.status })
          ] }),
          w.url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: w.url, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-1", children: [
            w.url,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm pt-2 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thương hiệu:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: brand?.name || "—" })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Kỹ thuật:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: w.techOwner || "—" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin dự án" }),
        can("web.tech_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "seo", children: [
          "Technical SEO (",
          seoDone,
          "/",
          checks.length,
          ")"
        ] }),
        can("web.entity_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "entity", children: [
          "Entity / Social SEO (",
          entitiesList.length,
          ")"
        ] }),
        can("web.content_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "content", className: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold", children: [
          "Sản xuất Content (",
          contents.length,
          ")"
        ] }),
        can("web.index_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "published", children: [
          "Bài đã đăng / Index (",
          published.length,
          ")"
        ] }),
        can("web.backlink_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "backlinks", children: [
          "Backlink / PR (",
          s.backlinks.filter((b) => b.websiteId === w.id).length,
          ")"
        ] }),
        can("web.checktop_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "keywords", children: [
          "Check TOP từ khóa (",
          checkTopVisibleCount,
          ")"
        ] }),
        can("web.reopt_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "optimize", children: [
          "Tối ưu lại Content (",
          optimizeBadgeCount,
          ")"
        ] }),
        can("web.keyword_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "research", children: [
          "Nghiên Cứu Keyword (",
          s.webTopics.filter((t) => t.websiteId === w.id).length,
          ")"
        ] }),
        can("web.growth_view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "growth", children: [
          "Tăng Trưởng Website (",
          s.growth.filter((g) => g.websiteId === w.id).length,
          ")"
        ] }),
        can("web.report_view") && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "report", children: "Báo Cáo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông tin website" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Tên website", v: w.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Link website", v: w.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: w.url, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline", children: w.url }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Thương hiệu", v: brand?.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Loại website", v: w.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Mục tiêu website", v: w.goal }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Trạng thái", v: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: w.status }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Đội ngũ & vận hành" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "SEO phụ trách", v: w.seoOwner }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Content phụ trách", v: w.contentOwner }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Kỹ thuật phụ trách", v: w.techOwner }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Ghi chú vận hành", v: w.notes })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: FileText, label: "Tổng số content", v: ovw.total }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: RefreshCw, label: "Đang sản xuất", v: ovw.producing, tone: "info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: CircleAlert, label: "Chờ duyệt", v: ovw.review, tone: "warn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: CircleAlert, label: "Cần sửa", v: ovw.fix, tone: "danger" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: FileText, label: "Chờ đăng", v: waitingPublish, tone: "info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: CircleCheck, label: "Đã đăng", v: ovw.published, tone: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: CircleAlert, label: "Chưa index", v: ovw.notIndexed, tone: "warn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Tiến độ Technical SEO" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-semibold mt-1.5", children: [
              seoPct,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: seoPct, className: "mt-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              seoDone,
              "/",
              checks.length,
              " mục"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: Users, label: "Entity / Social SEO", v: entitiesList.length, tone: "info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: Share2, label: "Đã index, chưa share", v: indexedNotShared, tone: "warn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: Share2, label: "Đã share social", v: sharedCount, tone: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: TrendingUp, label: "Từ khóa theo dõi", v: keywordsList.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: TrendingUp, label: "Từ khóa Top 10", v: kwTop10, tone: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: TrendingUp, label: "Tăng hạng", v: kwUp, tone: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OvwCard, { icon: TrendingUp, label: "Tụt hạng", v: kwDown, tone: "danger" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "entity", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntitySocialTab, { websiteId: w.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "keywords", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KeywordsTab, { websiteId: w.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "seo", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TechnicalSeoTab, { websiteId: w.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "content", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm bài...", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
              CONTENT_STATUSES.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: st, children: st }, st))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fType, onValueChange: setFType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Loại" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả loại" }),
              CONTENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fWriter, onValueChange: setFWriter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người viết" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả người viết" }),
              writers.map((wr) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: wr, children: wr }, wr))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto inline-flex rounded-md border bg-card p-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "table" ? "secondary" : "ghost", onClick: () => setView("table"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "h-4 w-4" }),
              "Table"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "kanban" ? "secondary" : "ghost", onClick: () => setView("kanban"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }),
              "Kanban"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "calendar" ? "secondary" : "ghost", onClick: () => setView("calendar"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
              "Lịch đăng"
            ] })
          ] }),
          can("web.content_create") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: adding, onOpenChange: setAdding, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Thêm bài"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo bài content" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ContentForm, { websiteId: w.id, brandId: w.brandId, onSubmit: (c) => s.add("webContents", c), onClose: () => setAdding(false) })
            ] })
          ] })
        ] }),
        view === "table" && /* @__PURE__ */ jsxRuntimeExports.jsx(ContentTable, { contents: filteredContents, onOpen: setOpenContent }),
        view === "kanban" && /* @__PURE__ */ jsxRuntimeExports.jsx(ContentKanban, { contents: filteredContents, onOpen: setOpenContent }),
        view === "calendar" && /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCalendar, { contents: filteredContents, onOpen: setOpenContent })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "published", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PublishedTab, { websiteId: w.id, entities: entitiesList, onOpenOptimize: setOpenOptimizeContent }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "backlinks", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BacklinksTab, { websiteId: w.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "optimize", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end mb-3 gap-2", children: [
          can("create_scheduled_content_optimization") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
            const today = todayISO();
            const OPEN_OPT = ["Đã tạo", "Đã giao", "Đang tối ưu", "Chờ duyệt tối ưu", "Cần sửa tối ưu", "Đã duyệt tối ưu"];
            const openBySource = /* @__PURE__ */ new Set();
            for (const c of s.webContents) {
              if (c.type === "Bài tối ưu lại" && c.sourceContentId && OPEN_OPT.includes(c.status)) {
                openBySource.add(c.sourceContentId);
              }
            }
            const due = contents.filter((c) => DONE_STATUSES.includes(c.status) && c.optimizeRecurring === true && c.optimizeScheduleTrackStatus === "Đang theo dõi" && c.indexStatus === "Đã index" && c.nextOptimizeAt && c.nextOptimizeAt <= today);
            let created = 0, skipped = 0;
            for (const src of due) {
              if (openBySource.has(src.id)) {
                skipped++;
                continue;
              }
              const task = {
                id: uid(),
                websiteId: src.websiteId,
                brandId: src.brandId,
                type: "Bài tối ưu lại",
                title: src.title,
                status: "Đã tạo",
                indexStatus: "Chưa kiểm tra",
                mainKeyword: src.mainKeyword,
                subKeywords: src.subKeywords,
                oldLink: src.publishedLink || src.url,
                sourceContentId: src.id,
                optimizeSource: "Theo lịch tối ưu",
                optimizeReason: "Tối ưu định kỳ"
              };
              s.add("webContents", task);
              openBySource.add(src.id);
              created++;
            }
            alert(`Có ${due.length} bài đến lịch tối ưu.
Đã tạo ${created} việc tối ưu mới.
Bỏ qua ${skipped} bài vì đang có việc tối ưu xử lý.`);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
            "Kiểm tra lịch đến hạn"
          ] }),
          can("web.reopt_create") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: openOptimize, onOpenChange: setOpenOptimize, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Thêm bài tối ưu"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo bài tối ưu lại" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizeContentForm, { websiteId: w.id, brandId: w.brandId, onSubmit: (c) => s.add("webContents", c), onClose: () => setOpenOptimize(false) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tiêu đề bài" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Nguồn tạo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Lý do tối ưu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Bài gốc / URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Người phụ trách" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Lịch tiếp theo" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
            optimizeContents.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-4 py-10 text-center text-muted-foreground", children: "Chưa có bài cần tối ưu." }) }),
            optimizeContents.map((c) => {
              const link = c.oldLink || c.publishedLink || c.url;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 cursor-pointer", onClick: () => setOpenOptimizeContent(c), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: c.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.optimizeSource || "Thủ công" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.optimizeReason || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: link ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link, target: "_blank", rel: "noreferrer", onClick: (e) => e.stopPropagation(), className: "text-primary hover:underline", children: "Mở" }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.writer || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: "Chưa phân công" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.deadline ? fmtDate(c.deadline) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.optimizeRecurring ? c.optimizeRecurringPeriod || "—" : "—" })
              ] }, c.id);
            })
          ] })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "research", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KeywordResearchTab, { websiteId: w.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "growth", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GrowthTab, { websiteId: w.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "report", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BasicReportTab, { websiteId: w.id, onOpenContent: setOpenContent, onJumpTab: (t) => setTab(t) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContentDetail, { content: openContent, open: !!openContent, onClose: () => setOpenContent(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizeContentDetail, { content: openOptimizeContent, open: !!openOptimizeContent, onClose: () => setOpenOptimizeContent(null) })
  ] });
}
function ContentTable({
  contents,
  onOpen
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tiêu đề" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Loại" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Từ khóa chính" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Người viết" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Deadline" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Đăng dự kiến" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Index" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
      contents.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-4 py-12 text-center text-muted-foreground", children: "Chưa có bài content." }) }),
      contents.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 cursor-pointer", onClick: () => onOpen(c), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 font-medium", children: [
          c.title,
          c.plan && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-[10px] uppercase tracking-wide text-muted-foreground", children: [
            "[",
            c.plan,
            "]"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.mainKeyword || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: c.writer || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: fmtDate(c.deadline) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: fmtDate(c.publishDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.indexStatus }) })
      ] }, c.id))
    ] })
  ] }) }) }) });
}
function ContentKanban({
  contents,
  onOpen
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 min-w-max", children: CONTENT_STATUSES.map((status) => {
    const items = contents.filter((c) => c.status === status);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 p-3 w-[260px] shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: status }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: items.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        items.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onOpen(c), className: "block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            c.writer || "—",
            " · ",
            fmtDate(c.deadline)
          ] }),
          c.mainKeyword && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mt-1", children: [
            "KW: ",
            c.mainKeyword
          ] })
        ] }, c.id)),
        items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center py-4", children: "—" })
      ] })
    ] }, status);
  }) }) });
}
function ContentCalendar({
  contents,
  onOpen
}) {
  const [month, setMonth] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const first = new Date(month);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7;
  const days = last.getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  const itemsOn = (date) => {
    const ds = date.toISOString().slice(0, 10);
    return contents.filter((c) => c.publishedAt && c.publishedAt === ds || !c.publishedAt && c.publishDate === ds);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), children: "‹" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: month.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric"
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), children: "›" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-7 gap-1 text-xs", children: [
      ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground font-medium py-1", children: d }, d)),
      cells.map((date, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[90px] rounded border bg-card p-1.5", children: date && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mb-1", children: date.getDate() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: itemsOn(date).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onOpen(c), className: "w-full text-left text-[11px] truncate rounded bg-primary/10 text-primary px-1.5 py-1 hover:bg-primary/20", title: c.title, children: c.title }, c.id)) })
      ] }) }, i))
    ] })
  ] }) });
}
function OvwCard({
  icon: Icon,
  label,
  v,
  tone = "default"
}) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    info: "bg-info/15 text-info",
    warn: "bg-warning/15 text-[oklch(0.45_0.13_75)]",
    success: "bg-success/15 text-success",
    danger: "bg-destructive/10 text-destructive"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 flex items-start justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-1.5 tracking-tight", children: v })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) })
  ] }) });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right text-sm", children: v || "—" })
  ] });
}
function PublishedTab({
  websiteId,
  entities,
  onOpenOptimize
}) {
  const s = useStore();
  const {
    can
  } = useCurrentUser();
  const canSetSchedule = can("set_content_optimization_schedule");
  const canPauseSchedule = can("pause_content_optimization_schedule");
  const canCreateOpt = can("create_content_optimization");
  const all = s.webContents.filter((c) => c.websiteId === websiteId && DONE_STATUSES.includes(c.status));
  const OPEN_OPT_STATUSES = ["Đã tạo", "Đã giao", "Đang tối ưu", "Chờ duyệt tối ưu", "Cần sửa tối ưu", "Đã duyệt tối ưu"];
  const openOptBySource = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const c of s.webContents) {
      if (c.type !== "Bài tối ưu lại") continue;
      if (!c.sourceContentId) continue;
      if (!OPEN_OPT_STATUSES.includes(c.status)) continue;
      if (!map.has(c.sourceContentId)) map.set(c.sourceContentId, c);
    }
    return map;
  }, [s.webContents]);
  const [createOptFor, setCreateOptFor] = reactExports.useState(null);
  const SCHEDULE_OPTIONS = ["Không thiết lập", ...OPTIMIZE_RECURRING_PERIODS];
  const handleScheduleChange = (c, v) => {
    if (v === "Không thiết lập") {
      s.update("webContents", c.id, {
        optimizeRecurring: false,
        optimizeRecurringPeriod: void 0,
        nextOptimizeAt: void 0,
        optimizeScheduleTrackStatus: "Chưa thiết lập",
        optimizeScheduleSetAt: void 0
      });
      return;
    }
    const period = v;
    const isIndexed = c.indexStatus === "Đã index";
    const base = todayISO();
    s.update("webContents", c.id, {
      optimizeRecurring: true,
      optimizeRecurringPeriod: period,
      optimizeScheduleSetAt: base,
      optimizeScheduleTrackStatus: isIndexed ? "Đang theo dõi" : "Chưa thiết lập",
      nextOptimizeAt: isIndexed ? computeNextOptimizeDate(base, period) : void 0
    });
  };
  const handleTrackStatusChange = (c, v) => {
    const isIndexed = c.indexStatus === "Đã index";
    const patch = {
      optimizeScheduleTrackStatus: v
    };
    if (v === "Đang theo dõi" && isIndexed && c.optimizeRecurringPeriod && !c.nextOptimizeAt) {
      patch.nextOptimizeAt = computeNextOptimizeDate(c.optimizeScheduleSetAt || todayISO(), c.optimizeRecurringPeriod);
    }
    s.update("webContents", c.id, patch);
  };
  const [search, setSearch] = reactExports.useState("");
  const [fIdx, setFIdx] = reactExports.useState("all");
  const [fShare, setFShare] = reactExports.useState("all");
  const [fWriter, setFWriter] = reactExports.useState("all");
  const [fPublisher, setFPublisher] = reactExports.useState("all");
  const [fEntity, setFEntity] = reactExports.useState("all");
  const [dateFrom, setDateFrom] = reactExports.useState("");
  const [dateTo, setDateTo] = reactExports.useState("");
  const [shareFrom, setShareFrom] = reactExports.useState("");
  const [shareTo, setShareTo] = reactExports.useState("");
  const [quick, setQuick] = reactExports.useState("all");
  const [editShare, setEditShare] = reactExports.useState(null);
  const writers = Array.from(new Set(all.map((c) => c.writer).filter(Boolean)));
  const publishers = Array.from(new Set(all.map((c) => c.publisher).filter(Boolean)));
  const filtered = reactExports.useMemo(() => all.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !(c.mainKeyword || "").toLowerCase().includes(q)) return false;
    }
    if (fIdx !== "all" && (c.indexStatus || "Chưa kiểm tra") !== fIdx) return false;
    const shareSt = c.shareSocialStatus || (c.shareSocial ? "Đã share" : "Chưa share");
    if (fShare !== "all" && shareSt !== fShare) return false;
    if (fWriter !== "all" && c.writer !== fWriter) return false;
    if (fPublisher !== "all" && c.publisher !== fPublisher) return false;
    if (fEntity !== "all" && !(c.sharedEntities || "").includes(fEntity)) return false;
    const pd = c.publishedAt || c.publishDate;
    if (dateFrom && (!pd || pd < dateFrom)) return false;
    if (dateTo && (!pd || pd > dateTo)) return false;
    if (shareFrom && (!c.shareSocialDate || c.shareSocialDate < shareFrom)) return false;
    if (shareTo && (!c.shareSocialDate || c.shareSocialDate > shareTo)) return false;
    if (quick === "indexed_not_shared" && !(c.indexStatus === "Đã index" && !c.shareSocial)) return false;
    if (quick === "not_indexed" && c.indexStatus === "Đã index") return false;
    if (quick === "shared" && !c.shareSocial) return false;
    if (quick === "need_reshare" && c.shareSocialStatus !== "Cần share lại") return false;
    return true;
  }), [all, search, fIdx, fShare, fWriter, fPublisher, fEntity, dateFrom, dateTo, shareFrom, shareTo, quick]);
  const counts = {
    all: all.length,
    indexed_not_shared: all.filter((c) => c.indexStatus === "Đã index" && !c.shareSocial).length,
    not_indexed: all.filter((c) => c.indexStatus !== "Đã index").length,
    shared: all.filter((c) => c.shareSocial).length,
    need_reshare: all.filter((c) => c.shareSocialStatus === "Cần share lại").length
  };
  const QF = ({
    id,
    label,
    count
  }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setQuick(id), className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`, children: [
    label,
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: quick === id ? "opacity-80" : "text-muted-foreground", children: [
      "(",
      count,
      ")"
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "all", label: "Tất cả", count: counts.all }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "indexed_not_shared", label: "Đã index, chưa share", count: counts.indexed_not_shared }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "not_indexed", label: "Chưa index", count: counts.not_indexed }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "shared", label: "Đã share social", count: counts.shared }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QF, { id: "need_reshare", label: "Cần share lại", count: counts.need_reshare })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", placeholder: "Tìm tiêu đề / từ khóa...", value: search, onChange: (e) => setSearch(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fIdx, onValueChange: setFIdx, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Index" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Index: Tất cả" }),
          ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fShare, onValueChange: setFShare, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Share" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Share: Tất cả" }),
          SHARE_SOCIAL_STATUSES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fWriter, onValueChange: setFWriter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người viết" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Người viết: Tất cả" }),
          writers.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w, children: w }, w))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fPublisher, onValueChange: setFPublisher, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người đăng" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Người đăng: Tất cả" }),
          publishers.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fEntity, onValueChange: setFEntity, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Entity share" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Entity: Tất cả" }),
          entities.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e.name, children: e.name }, e.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: "Đăng:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: "Share:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", type: "date", value: shareFrom, onChange: (e) => setShareFrom(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", type: "date", value: shareTo, onChange: (e) => setShareTo(e.target.value) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Tiêu đề" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Từ khóa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Ngày đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Người viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Người đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium px-3 py-2.5", children: "Share" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "TT Share" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Ngày share" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Entity đã share" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Lịch tối ưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Tối ưu tiếp theo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Theo dõi tối ưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Tối ưu" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 16, className: "px-4 py-12 text-center text-muted-foreground", children: "Không có bài nào khớp bộ lọc." }) }),
        filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium max-w-[200px]", children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: c.publishedLink ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: c.publishedLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }) }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: c.mainKeyword || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: fmtDate(c.publishedAt || c.publishDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: c.writer || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: c.publisher || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.indexStatus || "Chưa kiểm tra", onValueChange: (v) => s.update("webContents", c.id, {
            indexStatus: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!c.shareSocial, onCheckedChange: (v) => s.update("webContents", c.id, {
            shareSocial: v,
            shareSocialStatus: v ? "Đã share" : "Chưa share",
            shareSocialDate: v && !c.shareSocialDate ? todayISO() : c.shareSocialDate
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.shareSocialStatus || (c.shareSocial ? "Đã share" : "Chưa share"), onValueChange: (v) => s.update("webContents", c.id, {
            shareSocialStatus: v,
            shareSocial: v === "Đã share" ? true : v === "Chưa share" ? false : c.shareSocial
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SHARE_SOCIAL_STATUSES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-7 text-xs w-32", value: c.shareSocialDate || "", onChange: (e) => s.update("webContents", c.id, {
            shareSocialDate: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary hover:underline text-left max-w-[180px] truncate block", onClick: () => setEditShare(c), children: c.sharedEntities || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "+ Chọn entity" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-40", value: c.shareNotes || c.indexNotes || "", onChange: (e) => s.update("webContents", c.id, {
            shareNotes: e.target.value
          }), placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.optimizeRecurring && c.optimizeRecurringPeriod ? c.optimizeRecurringPeriod : "Không thiết lập", onValueChange: (v) => handleScheduleChange(c, v), disabled: !canSetSchedule, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SCHEDULE_OPTIONS.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
            ] }),
            c.optimizeRecurring && c.indexStatus !== "Đã index" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1 max-w-[180px]", children: "Sẽ kích hoạt khi bài đã index." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground text-xs", children: c.nextOptimizeAt ? fmtDate(c.nextOptimizeAt) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.optimizeScheduleTrackStatus || "Chưa thiết lập", onValueChange: (v) => handleTrackStatusChange(c, v), disabled: !canPauseSchedule || !c.optimizeRecurring, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Chưa thiết lập", "Đang theo dõi", "Tạm dừng"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: (() => {
            const openOpt = openOptBySource.get(c.id);
            if (openOpt) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold", children: "Đang tối ưu" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs px-2", onClick: () => onOpenOptimize(openOpt), children: "Mở việc" })
              ] });
            }
            if (!canCreateOpt) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" });
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs px-2", onClick: () => setCreateOptFor(c), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
              "Tạo việc tối ưu"
            ] });
          })() })
        ] }, c.id))
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editShare, onOpenChange: (o) => !o && setEditShare(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Entity / Social đã share" }) }),
      editShare && /* @__PURE__ */ jsxRuntimeExports.jsx(ShareEntitiesPicker, { entities, value: editShare.sharedEntities || "", onSave: (val) => {
        s.update("webContents", editShare.id, {
          sharedEntities: val
        });
        setEditShare(null);
      } })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!createOptFor, onOpenChange: (o) => !o && setCreateOptFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo việc tối ưu từ bài đã đăng" }) }),
      createOptFor && (() => {
        const existing = openOptBySource.get(createOptFor.id);
        if (existing) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: "Bài viết này đang có một việc tối ưu chưa hoàn thành." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCreateOptFor(null), children: "Đóng" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
                onOpenOptimize(existing);
                setCreateOptFor(null);
              }, children: "Mở việc tối ưu hiện tại" })
            ] })
          ] });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(OptimizeContentForm, { websiteId: createOptFor.websiteId, brandId: createOptFor.brandId, initialSourceContentId: createOptFor.id, lockSource: true, onSubmit: (nc) => s.add("webContents", nc), onClose: () => setCreateOptFor(null) });
      })()
    ] }) })
  ] });
}
function ShareEntitiesPicker({
  entities,
  value,
  onSave
}) {
  const initial = new Set(value.split(",").map((x) => x.trim()).filter(Boolean));
  const [sel, setSel] = reactExports.useState(initial);
  const toggle = (n) => {
    const next = new Set(sel);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    setSel(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    entities.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Chưa có entity nào trong dự án này. Hãy thêm ở tab Entity / Social SEO." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-72 overflow-auto", children: entities.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: sel.has(e.name), onCheckedChange: () => toggle(e.name) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: e.name })
    ] }, e.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave(Array.from(sel).join(", ")), children: "Lưu" }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "web.view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WebsiteDetail, {}) });
export {
  ContentCalendar,
  SplitComponent as component
};
