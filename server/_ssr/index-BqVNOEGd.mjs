import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, a as useServerFn, B as Button, c as createSsrRpc, b as useStore, i as isOverdue, f as fmtDate } from "./router-CkmTURa-.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { aq as Inbox, x as Briefcase, ar as CircleCheck, as as Clock, at as ArrowRight, k as ArrowDown } from "../_libs/lucide-react.mjs";
import { o as objectType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
import "./auth-errors-CN_iHaBn.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
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
import "node:stream";
import "../_libs/isbot.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
const input = objectType({
  mode: enumType(["personal", "manage"]),
  period: enumType(["week", "month"])
});
const getDashboardContext = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8863ec5ccba96de5eb2fec8be552e85f5f98f73faa2bb909bb99e4bf172facf2"));
const getDashboardData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => input.parse(v)).handler(createSsrRpc("8f63711dc87254661ec2efc96b6401ca9d2772b1ba4dc14671256bbda48aec8c"));
const reviewDashboard = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => input.parse(v)).handler(createSsrRpc("f0560cba6e78124fbe70281cdb6658ca03956ca1086f024dd702eaae908c3391"));
const PersonalPerformance = reactExports.lazy(() => import("./PersonalPerformance-L3RXyH6s.mjs"));
const PENDING_OWN_CONTENT_STATUSES = /* @__PURE__ */ new Set(["Đã giao", "Đang làm outline", "Cần sửa outline", "Outline đã duyệt", "Đang viết bài", "Cần sửa bài"]);
const PENDING_OWN_SOCIAL_STATUSES = /* @__PURE__ */ new Set(["Kế hoạch", "Đang làm", "Cần sửa"]);
const PENDING_OWN_VIDEO_STATUSES = /* @__PURE__ */ new Set(["Đã giao", "Đang làm kịch bản", "Cần sửa kịch bản", "Đang quay / thu tư liệu", "Đang dựng", "Cần sửa video"]);
const PENDING_OWN_ORDER_STATUSES = /* @__PURE__ */ new Set(["Chờ nhận việc", "Đang thực hiện", "Cần sửa"]);
const WAIT_OTHERS_CONTENT = /* @__PURE__ */ new Set(["Chờ duyệt outline", "Chờ duyệt bài", "Chờ đăng web"]);
const WAIT_OTHERS_SOCIAL = /* @__PURE__ */ new Set(["Chờ duyệt", "Chờ đăng"]);
const WAIT_OTHERS_VIDEO = /* @__PURE__ */ new Set(["Chờ duyệt kịch bản", "Chờ duyệt video", "Đã bàn giao"]);
const WAIT_OTHERS_ORDER = /* @__PURE__ */ new Set(["Chờ phân công", "Chờ nhận việc", "Đang thực hiện", "Chờ duyệt"]);
function norm(s) {
  return (s ?? "").trim().toLowerCase();
}
function buildMyNames(user) {
  if (!user) return /* @__PURE__ */ new Set();
  const out = /* @__PURE__ */ new Set();
  if (user.id) out.add(norm(user.id));
  if (user.fullName) out.add(norm(user.fullName));
  if (user.username) out.add(norm(user.username));
  return out;
}
function isMineByNames(value, mine) {
  if (!value) return false;
  return mine.has(norm(value));
}
function Overview() {
  const {
    user
  } = useCurrentUser();
  const [mode, setMode] = reactExports.useState("personal");
  const readContext = useServerFn(getDashboardContext);
  const context = useQuery({
    queryKey: ["dashboard-context", user?.id],
    queryFn: () => readContext(),
    enabled: !!user?.id,
    staleTime: 3e4,
    gcTime: 3e4,
    retry: 1,
    refetchOnWindowFocus: true
  });
  const c = context.data;
  const permitted = mode === "manage" && !!c?.canManage;
  reactExports.useEffect(() => {
    if (c && !c.canManage) setMode("personal");
  }, [c]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-page min-w-0 space-y-4 md:space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "dashboard-hero rounded-2xl bg-gradient-to-br from-[#102b52] via-[#174679] to-[#126c78] p-4 text-white shadow-sm sm:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-100", children: "Dashboard · Base Sứ Việt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-xl font-bold text-white sm:text-2xl", children: permitted ? "Phạm vi quản lý" : "Cá nhân tôi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium text-blue-100", children: c?.identity.name ?? user?.fullName }),
      c && c.identity.placements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-5 text-blue-100", children: c.identity.placements.map((p) => `${p.unit} · ${p.title}`).join(" / ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs leading-5 text-blue-100", children: permitted ? "Tóm tắt trong phạm vi được cấp; mở báo cáo chuyên môn để xem chi tiết." : "Có dữ liệu nào phù hợp với công việc của bạn, hiển thị phần đó." })
    ] }),
    context.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", className: "h-20 animate-pulse rounded-xl bg-muted", "aria-label": "Đang xác nhận vị trí và phạm vi" }),
    context.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "rounded-xl border p-4 text-sm text-destructive", children: [
      "Chưa đọc được vị trí và phạm vi của bạn. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => void context.refetch(), children: "Thử lại" })
    ] }),
    c && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid ${c.canManage ? "grid-cols-2" : "grid-cols-1"} gap-2 rounded-2xl border bg-muted/30 p-1.5`, role: "group", "aria-label": "Chế độ Dashboard", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: !permitted ? "default" : "ghost", "aria-pressed": !permitted, className: "h-auto min-h-12 whitespace-normal rounded-xl px-2 py-2 text-xs leading-4 sm:text-sm", onClick: () => setMode("personal"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-4 w-4" }),
          "Cá nhân tôi"
        ] }),
        c.canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: permitted ? "default" : "ghost", "aria-pressed": permitted, className: "h-auto min-h-12 whitespace-normal rounded-xl px-2 py-2 text-xs leading-4 sm:text-sm", onClick: () => setMode("manage"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4" }),
          "Phạm vi quản lý"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 animate-pulse rounded-2xl bg-muted" }), children: permitted ? /* @__PURE__ */ jsxRuntimeExports.jsx(PersonalPerformance, { mode: "manage" }, `${user?.id}:manage`) : /* @__PURE__ */ jsxRuntimeExports.jsx(MineOverview, {}, `${user?.id}:personal`) })
    ] })
  ] });
}
function useMyWork() {
  const s = useStore();
  const {
    user,
    can,
    isSuperAdmin
  } = useCurrentUser();
  const mine = reactExports.useMemo(() => buildMyNames(user), [user]);
  const brandName = (id) => s.brands.find((b) => b.id === id)?.name;
  const items = reactExports.useMemo(() => {
    const out = {
      mine: [],
      toReview: [],
      needsFix: [],
      waiting: [],
      overdue: [],
      doneRecent: []
    };
    const weekAgo = /* @__PURE__ */ new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (isSuperAdmin || can("task.view") || can("task.view_mine") || can("task.view_all") || can("task.view_created_by_me")) {
      const PENDING_OWN_TASK = /* @__PURE__ */ new Set(["Đã giao", "Đang làm", "Cần sửa"]);
      for (const t of s.tasks) {
        const asAssignee = isMineByNames(t.assignee, mine);
        const asReporter = isMineByNames(t.reporter, mine);
        const asApprover = isMineByNames(t.approver, mine);
        const involved = asAssignee || asReporter || asApprover;
        if (!involved) continue;
        const wi = {
          id: `task-${t.id}`,
          kind: "Task",
          module: "Task",
          title: t.title,
          brand: brandName(t.brandId),
          status: t.status,
          due: t.deadline,
          href: "/tasks",
          mineAs: asAssignee ? "Người phụ trách" : asApprover ? "Người xác nhận" : "Người giao"
        };
        if (t.status === "Hoàn thành") {
          if (t.completedAt && new Date(t.completedAt) >= weekAgo) out.doneRecent.push(wi);
          continue;
        }
        if (t.status === "Đã hủy") continue;
        if (isOverdue(t.deadline, t.status)) out.overdue.push(wi);
        if (asAssignee && PENDING_OWN_TASK.has(t.status)) out.mine.push(wi);
        if (asAssignee && t.status === "Cần sửa") out.needsFix.push(wi);
        if (t.status === "Chờ xác nhận") {
          if ((asApprover || asReporter) && (isSuperAdmin || can("task.approve_completion"))) out.toReview.push(wi);
          else if (asAssignee) out.waiting.push(wi);
        }
      }
    }
    if (isSuperAdmin || can("web.content_view")) {
      for (const c of s.webContents) {
        const asWriter = isMineByNames(c.writer, mine);
        const asOutlineReviewer = isMineByNames(c.outlineReviewer, mine);
        const asDraftReviewer = isMineByNames(c.draftReviewer, mine);
        const asPublisher = isMineByNames(c.publisher, mine);
        const asAssigner = isMineByNames(c.assigner, mine);
        const involved = asWriter || asOutlineReviewer || asDraftReviewer || asPublisher || asAssigner;
        if (!involved) continue;
        const wi = {
          id: `web-${c.id}`,
          kind: "Content Web",
          module: "Dự án Web",
          title: c.title,
          brand: brandName(c.brandId),
          status: c.status,
          due: c.deadline || c.outlineDeadline,
          href: "/web-contents",
          mineAs: asWriter ? "Người viết" : asOutlineReviewer ? "Duyệt outline" : asDraftReviewer ? "Duyệt bài" : asPublisher ? "Người đăng" : "Người giao"
        };
        if (c.status === "Hoàn thành") {
          if (c.completedAt && new Date(c.completedAt) >= weekAgo) out.doneRecent.push(wi);
          continue;
        }
        if (isOverdue(c.deadline || c.outlineDeadline, c.status)) out.overdue.push(wi);
        if (asWriter && PENDING_OWN_CONTENT_STATUSES.has(c.status)) out.mine.push(wi);
        if (c.status.includes("Cần sửa") && asWriter) out.needsFix.push(wi);
        if (c.status === "Chờ duyệt outline" && (asOutlineReviewer || isSuperAdmin && can("web.outline_approve"))) {
          if (asOutlineReviewer && can("web.outline_approve")) out.toReview.push(wi);
        }
        if (c.status === "Chờ duyệt bài" && asDraftReviewer && can("web.post_approve")) out.toReview.push(wi);
        if (asWriter && WAIT_OTHERS_CONTENT.has(c.status)) out.waiting.push(wi);
      }
    }
    if (isSuperAdmin || can("social.post_view")) {
      for (const p of s.socialPosts) {
        const asWriter = isMineByNames(p.writer, mine);
        const asDesigner = isMineByNames(p.designer, mine);
        const asReviewer = isMineByNames(p.reviewer, mine);
        const asPublisher = isMineByNames(p.publisher, mine);
        const involved = asWriter || asDesigner || asReviewer || asPublisher;
        if (!involved) continue;
        const wi = {
          id: `sp-${p.id}`,
          kind: "Bài Social",
          module: "Social",
          title: p.title,
          brand: brandName(p.brandId),
          status: p.status,
          due: p.scheduledDate,
          href: "/social",
          mineAs: asWriter ? "Người viết" : asDesigner ? "Designer" : asReviewer ? "Người duyệt" : "Người đăng"
        };
        if (p.status === "Hoàn thành" || p.status === "Đã đăng") {
          if (p.publishedDate && new Date(p.publishedDate) >= weekAgo) out.doneRecent.push(wi);
          continue;
        }
        if (isOverdue(p.scheduledDate, p.status)) out.overdue.push(wi);
        if ((asWriter || asDesigner) && PENDING_OWN_SOCIAL_STATUSES.has(p.status)) out.mine.push(wi);
        if (p.status === "Cần sửa" && (asWriter || asDesigner)) out.needsFix.push(wi);
        if (p.status === "Chờ duyệt" && asReviewer && can("social.post_approve")) out.toReview.push(wi);
        if ((asWriter || asDesigner) && WAIT_OTHERS_SOCIAL.has(p.status)) out.waiting.push(wi);
      }
    }
    if (isSuperAdmin || can("video.view")) {
      for (const v of s.videos) {
        const asOwner = isMineByNames(v.owner, mine);
        const asReviewer = isMineByNames(v.reviewer, mine);
        const asAssigner = isMineByNames(v.assigner, mine);
        const involved = asOwner || asReviewer || asAssigner;
        if (!involved) continue;
        const wi = {
          id: `vd-${v.id}`,
          kind: "Video",
          module: "Video",
          title: v.title,
          brand: brandName(v.brandId),
          status: v.status,
          due: v.deadline || v.scriptDeadline,
          href: "/videos",
          mineAs: asOwner ? "Người phụ trách" : asReviewer ? "Người duyệt" : "Người giao"
        };
        if (v.status === "Hoàn thành" || v.status === "Đã đăng") {
          if (v.completedAt && new Date(v.completedAt) >= weekAgo) out.doneRecent.push(wi);
          continue;
        }
        if (isOverdue(v.deadline || v.scriptDeadline, v.status)) out.overdue.push(wi);
        if (asOwner && PENDING_OWN_VIDEO_STATUSES.has(v.status)) out.mine.push(wi);
        if (v.status.includes("Cần sửa") && asOwner) out.needsFix.push(wi);
        if (v.status === "Chờ duyệt kịch bản" && asReviewer && can("video.script_approve")) out.toReview.push(wi);
        if (v.status === "Chờ duyệt video" && asReviewer && can("video.approve")) out.toReview.push(wi);
        if (asOwner && WAIT_OTHERS_VIDEO.has(v.status)) out.waiting.push(wi);
      }
    }
    if (isSuperAdmin || can("order.view")) {
      for (const o of s.orders) {
        const asAssignee = isMineByNames(o.assignee, mine);
        const asReviewer = isMineByNames(o.reviewer, mine);
        const asRequester = isMineByNames(o.requester, mine);
        const asAssigner = isMineByNames(o.assigner, mine);
        const involved = asAssignee || asReviewer || asRequester || asAssigner;
        if (!involved) continue;
        const wi = {
          id: `od-${o.id}`,
          kind: "Order Thiết Kế",
          module: "Thiết Kế",
          title: o.title,
          brand: brandName(o.brandId),
          status: o.status,
          due: o.deadline,
          href: "/orders",
          mineAs: asAssignee ? "Người phụ trách" : asReviewer ? "Người duyệt" : asRequester ? "Người yêu cầu" : "Người giao"
        };
        if (o.status === "Hoàn thành") {
          if (o.completedAt && new Date(o.completedAt) >= weekAgo) out.doneRecent.push(wi);
          continue;
        }
        if (isOverdue(o.deadline, o.status)) out.overdue.push(wi);
        if (asAssignee && PENDING_OWN_ORDER_STATUSES.has(o.status)) out.mine.push(wi);
        if (o.status === "Cần sửa" && asAssignee) out.needsFix.push(wi);
        if (o.status === "Chờ duyệt" && asReviewer && can("order.approve")) out.toReview.push(wi);
        if ((asRequester || asAssigner) && WAIT_OTHERS_ORDER.has(o.status)) out.waiting.push(wi);
      }
    }
    return out;
  }, [s, mine, can, isSuperAdmin]);
  return items;
}
function MineOverview() {
  const items = useMyWork();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-4", children: [
    items.toReview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-2xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "min-h-10 cursor-pointer text-sm font-semibold text-violet-700 dark:text-violet-300", children: [
        "Chờ tôi duyệt · ",
        items.toReview.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WorkTable, { items: items.toReview, empty: "" })
    ] }),
    items.needsFix.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-2xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "min-h-10 cursor-pointer text-sm font-semibold text-amber-800 dark:text-amber-300", children: [
        "Cần sửa · ",
        items.needsFix.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WorkTable, { items: items.needsFix, empty: "" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PersonalPerformance, { mode: "personal" })
  ] });
}
function WorkTable({
  items,
  empty
}) {
  const [visibleCount, setVisibleCount] = reactExports.useState(8);
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-2 rounded-xl bg-emerald-50/70 px-4 py-7 text-center dark:bg-emerald-950/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-7 w-7 text-emerald-600 dark:text-emerald-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-emerald-950 dark:text-emerald-100", children: empty })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5 md:hidden", "aria-label": `Danh sách ${items.length} công việc`, children: [
      items.slice(0, visibleCount).map((it) => {
        const overdue = isOverdue(it.due, it.status);
        const needsFix = it.status.includes("Cần sửa");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `dashboard-work-card rounded-xl border p-3 ${overdue ? "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/20" : needsFix ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20" : "border-border bg-card"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200", children: it.module }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: it.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 line-clamp-2 text-sm font-semibold leading-6 text-foreground", children: it.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-5 text-muted-foreground", children: [
            it.brand && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "max-w-full truncate", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "mr-1 inline h-3 w-3", "aria-hidden": "true" }),
              it.brand
            ] }),
            it.mineAs && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "max-w-full truncate", children: [
              "Vai trò: ",
              it.mineAs
            ] }),
            it.due && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: overdue ? "font-semibold text-rose-700 dark:text-rose-300" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 inline h-3 w-3" }),
              fmtDate(it.due)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "mt-3 min-h-11 w-full rounded-xl border-primary/25 bg-white text-primary hover:bg-blue-50 dark:bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: it.href, children: [
            "Mở công việc ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
          ] }) })
        ] }, it.id);
      }),
      visibleCount < items.length && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "min-h-11 w-full rounded-xl", onClick: () => setVisibleCount((n) => n + 8), children: [
        "Xem thêm ",
        Math.min(8, items.length - visibleCount),
        " việc ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "ml-1 h-4 w-4" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden overflow-x-auto md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Loại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Nội dung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Module" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Thương hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Vai trò" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Hạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Mở việc" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-3 py-2 text-muted-foreground", children: it.kind }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: it.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: it.module }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: it.brand || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-3 py-2 text-muted-foreground", children: it.mineAs || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "whitespace-nowrap px-3 py-2 text-muted-foreground", children: fmtDate(it.due) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: it.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: it.href, children: [
          "Mở ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }) }) })
      ] }, it.id)) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "overview.view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Overview, {}) });
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: SplitComponent
}, Symbol.toStringTag, { value: "Module" }));
export {
  getDashboardData as g,
  index as i,
  reviewDashboard as r
};
