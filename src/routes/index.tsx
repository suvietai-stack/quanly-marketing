import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, isOverdue, fmtDate } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { RequirePermission } from "@/components/PermissionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  ListChecks, AlertTriangle, Clock, CheckCircle2, Globe, Share2,
  MapPin, Video, Inbox, Hourglass, ArrowRight, FileEdit, ClipboardCheck,
  Briefcase, RefreshCw, X, ExternalLink, LayoutGrid, ArrowUp, ArrowDown, Search,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
const PersonalPerformance = lazy(() => import("@/components/performance/PersonalPerformance"));
import { isKpiV2Enabled } from "@/lib/kpi/service";
import { getPublicBranding } from "@/lib/branding.functions";
import { PersonalKpi, StaffTable, ChannelProgress, PeriodSelect, useKpiView, useChannelProgress, periodKeysOf, currentKey } from "@/components/kpi/PersonalKpi";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { area?: string; view?: 'dashboard' } => ({
    area: typeof search.area === 'string' ? search.area : undefined,
    view: search.view === 'dashboard' ? 'dashboard' : undefined,
  }),
  loader: () => getPublicBranding(),
  head: ({ loaderData }) => ({ meta: [
    { title: `Trang chủ — ${loaderData?.app_name ?? "Base Sứ Việt"}` },
    { name: "description", content: loaderData?.description ?? "Quản lý công việc" },
    { property: "og:title", content: `Trang chủ — ${loaderData?.app_name ?? "Base Sứ Việt"}` },
    { property: "og:description", content: loaderData?.description ?? "Quản lý công việc" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `Trang chủ — ${loaderData?.app_name ?? "Base Sứ Việt"}` },
    { name: "twitter:description", content: loaderData?.description ?? "Quản lý công việc" },
  ] }),
  component: () => (
    <RequirePermission perm="overview.view">
      <Overview />
    </RequirePermission>
  ),
});

// ============ Helpers ============

type ItemKind =
  | "Task" | "Content Web" | "Bài Social" | "Video" | "Order Thiết Kế";

interface WorkItem {
  id: string;
  kind: ItemKind;
  module: string;
  title: string;
  brand?: string;
  status: string;
  due?: string;
  href: string;
  /** "mine" reason: writer / reviewer / publisher / owner / assigner ... */
  mineAs?: string;
}

const PENDING_OWN_CONTENT_STATUSES = new Set([
  "Đã giao", "Đang làm outline", "Cần sửa outline",
  "Outline đã duyệt", "Đang viết bài", "Cần sửa bài",
]);
const PENDING_OWN_SOCIAL_STATUSES = new Set(["Kế hoạch", "Đang làm", "Cần sửa"]);
const PENDING_OWN_VIDEO_STATUSES = new Set([
  "Đã giao", "Đang làm kịch bản", "Cần sửa kịch bản",
  "Đang quay / thu tư liệu", "Đang dựng", "Cần sửa video",
]);
const PENDING_OWN_ORDER_STATUSES = new Set([
  "Chờ nhận việc", "Đang thực hiện", "Cần sửa",
]);

const WAIT_OTHERS_CONTENT = new Set(["Chờ duyệt outline", "Chờ duyệt bài", "Chờ đăng web"]);
const WAIT_OTHERS_SOCIAL = new Set(["Chờ duyệt", "Chờ đăng"]);
const WAIT_OTHERS_VIDEO = new Set(["Chờ duyệt kịch bản", "Chờ duyệt video", "Đã bàn giao"]);
const WAIT_OTHERS_ORDER = new Set(["Chờ phân công", "Chờ nhận việc", "Đang thực hiện", "Chờ duyệt"]);

const NEEDS_FIX_KEYWORDS = ["Cần sửa"];

const DONE_STATUSES = new Set(["Hoàn thành", "Đã đăng", "Đã đăng web"]);

function norm(s?: string): string {
  return (s ?? "").trim().toLowerCase();
}

/** Build a set of "names" identifying the current user (full name, username, id). */
function buildMyNames(user: { id: string; fullName?: string; username?: string } | null) {
  if (!user) return new Set<string>();
  const out = new Set<string>();
  if (user.id) out.add(norm(user.id));
  if (user.fullName) out.add(norm(user.fullName));
  if (user.username) out.add(norm(user.username));
  return out;
}

function isMineByNames(value: string | undefined, mine: Set<string>): boolean {
  if (!value) return false;
  return mine.has(norm(value));
}

// ============ Component ============

function Overview() {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const canSeeAllDept = isSuperAdmin || can("overview.all_dept") || can("report.view");
  const isKpiManager = !!user && (isSuperAdmin || user.roleId === "role-admin");
  const [tab, setTab] = useState<"mine" | "summary" | "staff" | "ops">("mine");

  const desc = {
    mine: "Công việc và KPI của bạn — cập nhật tự động từ công việc thực tế.",
    summary: "Tiến độ triển khai theo thương hiệu và kênh.",
    staff: "Tiến độ KPI của từng nhân sự.",
    ops: "Tình hình vận hành phòng Digital Marketing.",
  }[tab];

  return (
    <div className="dashboard-page min-w-0 space-y-4 md:space-y-6">
      {/* The mobile header is intentionally brief: action cards follow immediately. */}
      <header className="dashboard-hero md:hidden rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white/15 p-2 text-white"><LayoutGrid className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-100">Bảng điều khiển</p>
            <h2 className="mt-1 text-[20px] font-bold leading-snug text-white">
              {tab === "mine" ? "Công việc của tôi" : tab === "ops" ? "Điều hành công việc" : tab === "staff" ? "Hiệu suất nhân sự" : "Tổng hợp tiến độ"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-blue-100">{desc}</p>
          </div>
        </div>
      </header>
      <div className="hidden md:block"><PageHeader title={tab === "mine" ? "Tổng quan của tôi" : "Tổng quan"} description={desc} /></div>
      {canSeeAllDept ? (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "summary" | "staff" | "ops")} className="min-w-0">
          <TabsList className="dashboard-main-tabs grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 md:flex md:w-fit md:flex-wrap">
            <TabsTrigger className="dashboard-main-tab min-h-11 rounded-xl border bg-card text-xs sm:text-sm" value="mine"><Inbox className="h-4 w-4" /> Của tôi</TabsTrigger>
            {isKpiV2Enabled() && <TabsTrigger className="dashboard-main-tab min-h-11 rounded-xl border bg-card text-xs sm:text-sm" value="summary"><Globe className="h-4 w-4" /> Tổng hợp</TabsTrigger>}
            {isKpiV2Enabled() && isKpiManager && <TabsTrigger className="dashboard-main-tab min-h-11 rounded-xl border bg-card text-xs sm:text-sm" value="staff"><Briefcase className="h-4 w-4" /> Nhân sự</TabsTrigger>}
            <TabsTrigger className="dashboard-main-tab min-h-11 rounded-xl border bg-card text-xs sm:text-sm" value="ops"><ClipboardCheck className="h-4 w-4" /> Vận hành</TabsTrigger>
          </TabsList>
          <TabsContent value="mine" className="mt-4"><MineOverview /></TabsContent>
          <TabsContent value="summary" className="mt-4"><ManagerSummary /></TabsContent>
          {isKpiManager && <TabsContent value="staff" className="mt-4"><StaffTable /></TabsContent>}
          <TabsContent value="ops" className="mt-4"><DeptOverview /></TabsContent>
        </Tabs>
      ) : (
        <MineOverview />
      )}
    </div>
  );
}

// ============ Mine ============

function useMyWork() {
  const s = useStore();
  const { user, can, isSuperAdmin } = useCurrentUser();
  const mine = useMemo(() => buildMyNames(user as any), [user]);

  const brandName = (id?: string) => s.brands.find((b) => b.id === id)?.name;

  const items = useMemo(() => {
    const out: { mine: WorkItem[]; toReview: WorkItem[]; needsFix: WorkItem[]; waiting: WorkItem[]; overdue: WorkItem[]; doneRecent: WorkItem[] } = {
      mine: [], toReview: [], needsFix: [], waiting: [], overdue: [], doneRecent: [],
    };

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // ---- Tasks ----
    if (isSuperAdmin || can("task.view") || can("task.view_mine") || can("task.view_all") || can("task.view_created_by_me")) {
      const PENDING_OWN_TASK = new Set(["Đã giao", "Đang làm", "Cần sửa"]);
      for (const t of s.tasks) {
        const asAssignee = isMineByNames(t.assignee, mine);
        const asReporter = isMineByNames(t.reporter, mine);
        const asApprover = isMineByNames((t as any).approver, mine);
        const involved = asAssignee || asReporter || asApprover;
        if (!involved) continue;
        const wi: WorkItem = {
          id: `task-${t.id}`, kind: "Task", module: "Task", title: t.title,
          brand: brandName(t.brandId), status: t.status, due: t.deadline,
          href: "/tasks",
          mineAs: asAssignee ? "Người phụ trách" : asApprover ? "Người xác nhận" : "Người giao",
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

    // ---- Web Contents ----
    if (isSuperAdmin || can("web.content_view")) {
      for (const c of s.webContents) {
        const asWriter = isMineByNames(c.writer, mine);
        const asOutlineReviewer = isMineByNames(c.outlineReviewer, mine);
        const asDraftReviewer = isMineByNames(c.draftReviewer, mine);
        const asPublisher = isMineByNames(c.publisher, mine);
        const asAssigner = isMineByNames(c.assigner, mine);
        const involved = asWriter || asOutlineReviewer || asDraftReviewer || asPublisher || asAssigner;
        if (!involved) continue;
        const wi: WorkItem = {
          id: `web-${c.id}`, kind: "Content Web", module: "Dự án Web", title: c.title,
          brand: brandName(c.brandId), status: c.status, due: c.deadline || c.outlineDeadline,
          href: "/web-contents",
          mineAs: asWriter ? "Người viết" : asOutlineReviewer ? "Duyệt outline"
            : asDraftReviewer ? "Duyệt bài" : asPublisher ? "Người đăng" : "Người giao",
        };
        if (c.status === "Hoàn thành") {
          if (c.completedAt && new Date(c.completedAt) >= weekAgo) out.doneRecent.push(wi);
          continue;
        }
        if (isOverdue(c.deadline || c.outlineDeadline, c.status)) out.overdue.push(wi);
        if (asWriter && PENDING_OWN_CONTENT_STATUSES.has(c.status)) out.mine.push(wi);
        if (c.status.includes("Cần sửa") && asWriter) out.needsFix.push(wi);
        // To-review
        if (c.status === "Chờ duyệt outline" && (asOutlineReviewer || (isSuperAdmin && can("web.outline_approve")))) {
          if (asOutlineReviewer && can("web.outline_approve")) out.toReview.push(wi);
        }
        if (c.status === "Chờ duyệt bài" && asDraftReviewer && can("web.post_approve")) out.toReview.push(wi);
        // Waiting on others (I am writer but it's at a reviewer)
        if (asWriter && WAIT_OTHERS_CONTENT.has(c.status)) out.waiting.push(wi);
      }
    }

    // ---- Social Posts ----
    if (isSuperAdmin || can("social.post_view")) {
      for (const p of s.socialPosts) {
        const asWriter = isMineByNames(p.writer, mine);
        const asDesigner = isMineByNames(p.designer, mine);
        const asReviewer = isMineByNames(p.reviewer, mine);
        const asPublisher = isMineByNames(p.publisher, mine);
        const involved = asWriter || asDesigner || asReviewer || asPublisher;
        if (!involved) continue;
        const wi: WorkItem = {
          id: `sp-${p.id}`, kind: "Bài Social", module: "Social", title: p.title,
          brand: brandName(p.brandId), status: p.status, due: p.scheduledDate,
          href: "/social",
          mineAs: asWriter ? "Người viết" : asDesigner ? "Designer"
            : asReviewer ? "Người duyệt" : "Người đăng",
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

    // ---- Videos ----
    if (isSuperAdmin || can("video.view")) {
      for (const v of s.videos) {
        const asOwner = isMineByNames(v.owner, mine);
        const asReviewer = isMineByNames(v.reviewer, mine);
        const asAssigner = isMineByNames(v.assigner, mine);
        const involved = asOwner || asReviewer || asAssigner;
        if (!involved) continue;
        const wi: WorkItem = {
          id: `vd-${v.id}`, kind: "Video", module: "Video", title: v.title,
          brand: brandName(v.brandId), status: v.status, due: v.deadline || v.scriptDeadline,
          href: "/videos",
          mineAs: asOwner ? "Người phụ trách" : asReviewer ? "Người duyệt" : "Người giao",
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

    // ---- Orders ----
    if (isSuperAdmin || can("order.view")) {
      for (const o of s.orders) {
        const asAssignee = isMineByNames(o.assignee, mine);
        const asReviewer = isMineByNames(o.reviewer, mine);
        const asRequester = isMineByNames(o.requester, mine);
        const asAssigner = isMineByNames(o.assigner, mine);
        const involved = asAssignee || asReviewer || asRequester || asAssigner;
        if (!involved) continue;
        const wi: WorkItem = {
          id: `od-${o.id}`, kind: "Order Thiết Kế", module: "Thiết Kế", title: o.title,
          brand: brandName(o.brandId), status: o.status, due: o.deadline,
          href: "/orders",
          mineAs: asAssignee ? "Người phụ trách" : asReviewer ? "Người duyệt"
            : asRequester ? "Người yêu cầu" : "Người giao",
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

    // De-dup helper: identical id across sections is fine
    return out;
  }, [s, mine, can, isSuperAdmin]);

  return items;
}

type WorkTab = "mine" | "review" | "fix" | "waiting" | "overdue" | "done";

function MineOverview() {
  const items = useMyWork();
  const { user } = useCurrentUser();
  const [tab, setTab] = useState<WorkTab>("mine");
  const [taskSearch, setTaskSearch] = useState("");
  const [kpiExpanded, setKpiExpanded] = useState(false);
  useEffect(() => {
    // On desktop preserve the old immediately visible KPI panel; on mobile
    // defer expensive KPI hydration until the user explicitly expands it.
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setKpiExpanded(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const go = (t: WorkTab) => { setTab(t); document.getElementById("my-work")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const filterWork = (list: WorkItem[]) => {
    const q = taskSearch.trim().toLocaleLowerCase("vi");
    return !q ? list : list.filter(it => [it.title, it.brand, it.module, it.status, it.mineAs].some(v => (v ?? "").toLocaleLowerCase("vi").includes(q)));
  };
  const emptyMessage = (normal: string) => taskSearch.trim() ? "Không tìm thấy công việc phù hợp. Hãy thử từ khóa khác." : normal;
  const activeCount = {
    mine: items.mine.length,
    review: items.toReview.length,
    fix: items.needsFix.length,
    waiting: items.waiting.length,
    overdue: items.overdue.length,
    done: items.doneRecent.length,
  }[tab];
  const activeShortLabel = { mine: "đang làm", review: "chờ duyệt", fix: "cần sửa", waiting: "đang chờ", overdue: "quá hạn", done: "hoàn thành" }[tab];

  return (
    <div className="flex min-w-0 flex-col gap-5 md:gap-8">
      <section className="order-1">{(items.toReview.length>0||items.needsFix.length>0)&&<div className="mb-4 flex flex-wrap gap-2">{items.toReview.length>0&&<Button variant="outline" className="min-h-11 rounded-xl border-violet-200 text-violet-700 dark:border-violet-900 dark:text-violet-300" onClick={()=>go("review")}><ClipboardCheck className="h-4 w-4"/>Chờ tôi duyệt · {items.toReview.length}</Button>}{items.needsFix.length>0&&<Button variant="outline" className="min-h-11 rounded-xl border-amber-200 text-amber-800 dark:border-amber-900 dark:text-amber-300" onClick={()=>go("fix")}><FileEdit className="h-4 w-4"/>Cần sửa · {items.needsFix.length}</Button>}</div>}<Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" aria-label="Đang mở báo cáo cá nhân"/>}><PersonalPerformance /></Suspense></section>

      <section id="my-work" className="order-2 scroll-mt-28 md:order-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <SectionTitle>Danh sách cần làm</SectionTitle>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">{activeCount} {activeShortLabel}</span>
        </div>
        <Card className="dashboard-work-panel overflow-hidden rounded-2xl">
          <CardContent className="p-3 sm:p-5">
            <div className="relative mb-3 flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input type="search" value={taskSearch} onChange={e => setTaskSearch(e.target.value)} aria-label="Tìm công việc trong mục đang xem" placeholder="Tìm tên việc, thương hiệu, trạng thái..." className="min-h-11 w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as WorkTab)}>
              <TabsList className="dashboard-work-tabs grid h-auto w-full grid-cols-3 gap-1.5 bg-transparent p-0">
                <TabsTrigger data-tone="info" className="dashboard-work-tab min-h-11 rounded-xl px-1 text-[11px] leading-tight sm:text-xs" value="mine">Đang làm ({items.mine.length})</TabsTrigger>
                <TabsTrigger data-tone="danger" className="dashboard-work-tab min-h-11 rounded-xl px-1 text-[11px] leading-tight sm:text-xs" value="overdue">Quá hạn ({items.overdue.length})</TabsTrigger>
                <TabsTrigger data-tone="warn" className="dashboard-work-tab min-h-11 rounded-xl px-1 text-[11px] leading-tight sm:text-xs" value="fix">Cần sửa ({items.needsFix.length})</TabsTrigger>
                <TabsTrigger data-tone="violet" className="dashboard-work-tab min-h-11 rounded-xl px-1 text-[11px] leading-tight sm:text-xs" value="review">Chờ duyệt ({items.toReview.length})</TabsTrigger>
                <TabsTrigger data-tone="muted" className="dashboard-work-tab min-h-11 rounded-xl px-1 text-[11px] leading-tight sm:text-xs" value="waiting">Đang chờ ({items.waiting.length})</TabsTrigger>
                <TabsTrigger data-tone="success" className="dashboard-work-tab min-h-11 rounded-xl px-1 text-[11px] leading-tight sm:text-xs" value="done">Đã xong ({items.doneRecent.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="mine"><WorkTable items={filterWork(sortByDue(items.mine))} empty={emptyMessage("Hiện chưa có việc nào bạn đang thực hiện.")} /></TabsContent>
              <TabsContent value="review"><WorkTable items={filterWork(items.toReview)} empty={emptyMessage("Không có việc nào đang chờ bạn duyệt.")} /></TabsContent>
              <TabsContent value="fix"><WorkTable items={filterWork(items.needsFix)} empty={emptyMessage("Không có việc nào cần sửa.")} /></TabsContent>
              <TabsContent value="waiting"><WorkTable items={filterWork(items.waiting)} empty={emptyMessage("Không có việc nào đang chờ người khác.")} /></TabsContent>
              <TabsContent value="overdue"><WorkTable items={filterWork(sortByDue(items.overdue))} empty={emptyMessage("Không có việc nào quá hạn.")} /></TabsContent>
              <TabsContent value="done"><WorkTable items={filterWork(items.doneRecent)} empty={emptyMessage("Chưa có việc hoàn thành trong 7 ngày.")} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {isKpiV2Enabled() && user && (
        <section className="order-3 md:order-2">
          <div className="dashboard-kpi-panel rounded-2xl border bg-card p-3 md:p-5">
            <button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-1 text-left" aria-expanded={kpiExpanded} onClick={() => setKpiExpanded(v => !v)}>
              <span className="flex min-w-0 items-center gap-2.5"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"><CheckCircle2 className="h-5 w-5" /></span><span className="min-w-0"><strong className="block text-sm">KPI của tôi</strong><span className="block text-xs text-muted-foreground">Mở xem tiến độ và chỉ tiêu cá nhân</span></span></span>
              {kpiExpanded ? <ArrowUp className="h-4 w-4 shrink-0 text-primary" /> : <ArrowDown className="h-4 w-4 shrink-0 text-primary" />}
            </button>
            {kpiExpanded && <div className="mt-4 border-t pt-4"><PersonalKpi userId={user.id} /></div>}
          </div>
        </section>
      )}
    </div>
  );
}

function sortByDue(list: WorkItem[]) {
  return [...list].sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h2>;
}

function ClickStat({ label, value, icon: Icon, tone, hint, onClick }: { label: string; value: React.ReactNode; icon: any; tone: "info" | "warn" | "danger" | "success" | "violet"; hint?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`dashboard-stat dashboard-stat-${tone} flex h-full min-h-28 w-full flex-col items-start justify-between gap-2 rounded-2xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-24 sm:flex-row sm:items-center sm:p-4`}>
      <span className="dashboard-stat-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1">
        <strong className="block text-2xl font-bold leading-none tabular-nums">{value}</strong>
        <span className="mt-1 block text-xs font-semibold leading-tight sm:text-sm">{label}</span>
        {hint && <span className="mt-1 hidden text-[10px] leading-tight opacity-75 sm:block">{hint}</span>}
      </span>
      <ArrowRight className="hidden h-4 w-4 shrink-0 opacity-65 sm:block" aria-hidden="true" />
    </button>
  );
}

// ============ Quản lý: Tổng hợp ============

function ManagerSummary() {
  const s = useStore();
  const my = useMyWork();
  const { db } = useKpiView();
  const [pk, setPk] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sheet, setSheet] = useState<null | "review" | "overdue">(null);
  const keys = db ? periodKeysOf(db) : [];
  const key = pk || currentKey(keys);
  const progress = useChannelProgress(key, brandId);
  const brandName = (id?: string) => s.brands.find((b) => b.id === id)?.name;

  const overdueAll = useMemo(() => {
    const out: WorkItem[] = [];
    for (const t of s.tasks) if (isOverdue(t.deadline, t.status) && t.status !== "Đã hủy") out.push({ id: `task-${t.id}`, kind: "Task", module: "Task", title: t.title, brand: brandName(t.brandId), status: t.status, due: t.deadline, href: "/tasks", mineAs: t.assignee });
    for (const c of s.webContents) if (isOverdue(c.deadline || c.outlineDeadline, c.status)) out.push({ id: `web-${c.id}`, kind: "Content Web", module: "Dự án Web", title: c.title, brand: brandName(c.brandId), status: c.status, due: c.deadline || c.outlineDeadline, href: "/web-contents", mineAs: c.writer });
    for (const v of s.videos) if (isOverdue(v.deadline || v.scriptDeadline, v.status) && v.status !== "Đã hủy") out.push({ id: `vd-${v.id}`, kind: "Video", module: "Video", title: v.title, brand: brandName(v.brandId), status: v.status, due: v.deadline || v.scriptDeadline, href: "/videos", mineAs: v.owner });
    for (const o of s.orders) if (isOverdue(o.deadline, o.status) && o.status !== "Đã hủy") out.push({ id: `od-${o.id}`, kind: "Order Thiết Kế", module: "Thiết Kế", title: o.title, brand: brandName(o.brandId), status: o.status, due: o.deadline, href: "/orders", mineAs: o.assignee });
    return sortByDue(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  const withData = progress?.rows.filter((r) => r.tone !== "none") ?? [];
  const atRisk = withData.filter((r) => r.tone === "warn" || r.tone === "bad");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {keys.length > 0 && <PeriodSelect keys={keys} value={key} onChange={setPk} />}
        <select aria-label="Lọc theo thương hiệu" className="min-h-11 max-w-full rounded-xl border border-input bg-background px-3 text-sm" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
          <option value="">Tất cả thương hiệu</option>
          {s.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3">
        <ClickStat label="Chỉ tiêu có nguy cơ chậm" icon={Clock} tone="warn"
          value={withData.length ? atRisk.length : <span className="text-base font-medium text-muted-foreground">Chưa đủ dữ liệu</span>}
          hint={withData.length ? `Trên ${withData.length} chỉ tiêu đo được, so với thời gian đã trôi qua` : undefined}
          onClick={() => document.getElementById("channel-progress")?.scrollIntoView({ behavior: "smooth" })} />
        <ClickStat label="Công việc chờ tôi duyệt" value={my.toReview.length} icon={ClipboardCheck} tone="info" onClick={() => setSheet("review")} />
        <div className="col-span-2 sm:col-span-1"><ClickStat label="Công việc quá hạn" value={overdueAll.length} icon={AlertTriangle} tone="danger" onClick={() => setSheet("overdue")} /></div>
      </div>
      <section id="channel-progress">
        <SectionTitle>Tiến độ triển khai theo thương hiệu và kênh</SectionTitle>
        <ChannelProgress periodKey={key} brandId={brandId} />
      </section>
      <Sheet open={!!sheet} onOpenChange={(v) => !v && setSheet(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{sheet === "review" ? "Công việc chờ tôi duyệt" : "Công việc quá hạn"}</SheetTitle>
            <SheetDescription>{sheet === "overdue" ? "Cột “Vai trò” hiển thị người phụ trách." : "Nhấn để mở công việc."}</SheetDescription>
          </SheetHeader>
          <div className="mt-4"><WorkTable items={sheet === "review" ? my.toReview : overdueAll} empty="Không có công việc." /></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function WorkTable({ items, empty }: { items: WorkItem[]; empty: string }) {
  const [visibleCount, setVisibleCount] = useState(8);
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-emerald-50/70 px-4 py-7 text-center dark:bg-emerald-950/30">
        <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100">{empty}</p>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      {/* Mobile: task cards with immediate action; do not make people scroll a wide table. */}
      <div className="space-y-2.5 md:hidden" aria-label={`Danh sách ${items.length} công việc`}>
        {items.slice(0,visibleCount).map(it => {
          const overdue = isOverdue(it.due,it.status);
          const needsFix = it.status.includes("Cần sửa");
          return <article key={it.id} className={`dashboard-work-card rounded-xl border p-3 ${overdue ? "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/20" : needsFix ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">{it.module}</span>
              <StatusBadge value={it.status} />
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-foreground">{it.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-5 text-muted-foreground">
              {it.brand && <span className="max-w-full truncate"><Briefcase className="mr-1 inline h-3 w-3" aria-hidden="true" />{it.brand}</span>}
              {it.mineAs && <span className="max-w-full truncate">Vai trò: {it.mineAs}</span>}
              {it.due && <span className={overdue ? "font-semibold text-rose-700 dark:text-rose-300" : ""}><Clock className="mr-1 inline h-3 w-3" />{fmtDate(it.due)}</span>}
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3 min-h-11 w-full rounded-xl border-primary/25 bg-white text-primary hover:bg-blue-50 dark:bg-card">
              <Link to={it.href}>Mở công việc <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </article>;
        })}
        {visibleCount < items.length && <Button type="button" variant="outline" className="min-h-11 w-full rounded-xl" onClick={() => setVisibleCount(n => n+8)}>Xem thêm {Math.min(8,items.length-visibleCount)} việc <ArrowDown className="ml-1 h-4 w-4" /></Button>}
      </div>
      {/* Desktop retains the complete operational table and all columns. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium">Loại</th>
              <th className="px-3 py-2.5 text-left font-medium">Nội dung</th>
              <th className="px-3 py-2.5 text-left font-medium">Module</th>
              <th className="px-3 py-2.5 text-left font-medium">Thương hiệu</th>
              <th className="px-3 py-2.5 text-left font-medium">Vai trò</th>
              <th className="px-3 py-2.5 text-left font-medium">Hạn</th>
              <th className="px-3 py-2.5 text-left font-medium">Trạng thái</th>
              <th className="px-3 py-2.5 text-right font-medium">Mở việc</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(it => <tr key={it.id} className="hover:bg-muted/30">
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{it.kind}</td>
              <td className="px-3 py-2 font-medium">{it.title}</td>
              <td className="px-3 py-2 text-muted-foreground">{it.module}</td>
              <td className="px-3 py-2 text-muted-foreground">{it.brand || "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{it.mineAs || "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{fmtDate(it.due)}</td>
              <td className="px-3 py-2"><StatusBadge value={it.status} /></td>
              <td className="px-3 py-2 text-right"><Button asChild size="sm" variant="outline"><Link to={it.href}>Mở <ArrowRight className="h-3.5 w-3.5" /></Link></Button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ============ Department Dashboard ============

type RangeKey = "today" | "week" | "month" | "quarter" | "all";

function computeRangeStart(key: RangeKey): Date | null {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === "today") return d;
  if (key === "week") { const x = new Date(d); x.setDate(x.getDate() - 7); return x; }
  if (key === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (key === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), q * 3, 1);
  }
  return null;
}

const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Hôm nay", week: "Tuần này", month: "Tháng này", quarter: "Quý này", all: "Tất cả",
};

type JobKind = "Task" | "Content Web" | "Bài Social" | "Video" | "Order Thiết Kế" | "Local Map";

interface Job {
  id: string;
  kind: JobKind;
  module: string;
  title: string;
  brandId?: string;
  assignee?: string;
  status: string;
  deadline?: string;
  createdAt?: string;
  completedAt?: string;
  href: string;
}

function isDoneStatus(s: string): boolean {
  return s === "Hoàn thành" || s === "Đã đăng" || s === "Đã đăng web" || s === "Đã duyệt" || s === "Đã bàn giao";
}
function isPendingReview(s: string): boolean {
  return s.startsWith("Chờ duyệt") || s === "Chờ xác nhận" || s === "Chờ đăng";
}
function isNeedsFixStatus(s: string): boolean {
  return s.includes("Cần sửa");
}

function Stat({ label, value, icon: Icon, tone = "default", hint }: {
  label: string; value: number | string; icon: any; tone?: "default" | "warn" | "danger" | "success" | "info"; hint?: string;
}) {
  return (
    <div className={`dashboard-metric dashboard-metric-${tone} flex min-h-28 items-start justify-between gap-2 rounded-2xl border p-3 shadow-sm sm:min-h-32 sm:p-4`}>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold leading-tight">{label}</div>
        <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
        {hint && <div className="mt-1 text-[11px] leading-tight opacity-80">{hint}</div>}
      </div>
      <div className="dashboard-metric-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function avatarInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase() || "?";
}

function channelHealth(activity: number, status?: string): "Tốt" | "Bình thường" | "Cần theo dõi" | "Có vấn đề" {
  if (status === "Tạm dừng" || status === "Lưu trữ") return "Có vấn đề";
  if (activity === 0) return "Cần theo dõi";
  if (activity >= 5) return "Tốt";
  return "Bình thường";
}

function healthBadge(h: ReturnType<typeof channelHealth>) {
  const map: Record<string, string> = {
    "Tốt": "bg-success/15 text-success border-success/30",
    "Bình thường": "bg-info/15 text-info border-info/30",
    "Cần theo dõi": "bg-warning/15 text-[oklch(0.45_0.13_75)] border-warning/30",
    "Có vấn đề": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${map[h]}`}>{h}</span>;
}

function DeptOverview() {
  const s = useStore();
  const { can, isSuperAdmin } = useCurrentUser();
  const canStaff = isSuperAdmin || can("overview.staff_summary") || can("report.by_staff");
  const canChannel = isSuperAdmin || can("overview.module_summary") || can("report.by_module");

  // ----- Filters -----
  const [range, setRange] = useState<RangeKey>("month");
  const [brandId, setBrandId] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [staff, setStaff] = useState<string>("");
  const [channelType, setChannelType] = useState<"all" | "Website" | "Social" | "Local">("all");
  const [staffMobileLimit, setStaffMobileLimit] = useState(6);
  const [channelMobileLimit, setChannelMobileLimit] = useState(6);
  const [showMoreMetrics, setShowMoreMetrics] = useState(false);
  const [issueFilter, setIssueFilter] = useState<"all" | "overdue" | "fix" | "review">("all");
  const showIssues = (filter: "overdue" | "fix" | "review") => {
    setIssueFilter(filter);
    document.getElementById("dashboard-bottlenecks")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerStaff, setDrawerStaff] = useState<string | null>(null);
  const refreshDashboard = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // An explicit refresh must update server data, not just recompute a date.
      await useStore.getState().reload();
      setRefreshKey(k => k + 1);
    } finally {
      setRefreshing(false);
    }
  };

  const rangeStart = useMemo(() => computeRangeStart(range), [range, refreshKey]);
  const inRange = (iso?: string) => {
    if (!rangeStart) return true;
    if (!iso) return false;
    return new Date(iso) >= rangeStart;
  };

  const brandName = (id?: string) => s.brands.find((b) => b.id === id)?.name;
  const hasFilter = !!(brandId || moduleFilter || staff || range !== "month" || channelType !== "all");

  // ----- Build unified job list -----
  const allJobs = useMemo<Job[]>(() => {
    const jobs: Job[] = [];
    for (const t of s.tasks) {
      jobs.push({
        id: `task-${t.id}`, kind: "Task", module: "Task", title: t.title,
        brandId: t.brandId, assignee: t.assignee, status: t.status,
        deadline: t.deadline, createdAt: (t as any).createdAt, completedAt: t.completedAt,
        href: "/tasks",
      });
    }
    for (const c of s.webContents) {
      // Task tối ưu "Đã tạo" chưa giao → không gắn vào hiệu suất nhân viên nào
      const isOptCreated = c.type === "Bài tối ưu lại" && c.status === "Đã tạo";
      jobs.push({
        id: `web-${c.id}`, kind: "Content Web", module: "Dự án Web", title: c.title,
        brandId: c.brandId, assignee: isOptCreated ? undefined : c.writer, status: c.status,
        deadline: c.deadline || c.outlineDeadline, completedAt: c.completedAt,
        href: "/web-contents",
      });
    }
    for (const p of s.socialPosts) {
      jobs.push({
        id: `sp-${p.id}`, kind: "Bài Social", module: "Social", title: p.title,
        brandId: p.brandId, assignee: p.writer || p.designer, status: p.status,
        deadline: p.scheduledDate, completedAt: p.publishedDate,
        href: "/social",
      });
    }
    for (const v of s.videos) {
      jobs.push({
        id: `vd-${v.id}`, kind: "Video", module: "Video", title: v.title,
        brandId: v.brandId, assignee: v.owner, status: v.status,
        deadline: v.deadline || v.scriptDeadline, completedAt: v.completedAt,
        href: "/videos",
      });
    }
    for (const o of s.orders) {
      jobs.push({
        id: `od-${o.id}`, kind: "Order Thiết Kế", module: "Order Thiết Kế", title: o.title,
        brandId: o.brandId, assignee: o.assignee, status: o.status,
        deadline: o.deadline, completedAt: o.completedAt,
        href: "/orders",
      });
    }
    for (const m of s.mapPosts) {
      jobs.push({
        id: `mp-${m.id}`, kind: "Local Map", module: "Local Map", title: m.title,
        brandId: m.brandId, assignee: m.owner, status: m.status,
        deadline: m.scheduledDate, completedAt: m.publishedDate,
        href: "/local",
      });
    }
    return jobs;
  }, [s]);

  const moduleOptions = useMemo(
    () => Array.from(new Set(allJobs.map((j) => j.module))).sort(),
    [allJobs],
  );
  const staffOptions = useMemo(() => {
    const set = new Set<string>();
    allJobs.forEach((j) => j.assignee && set.add(j.assignee));
    s.people.forEach((p) => p.status === "Đang làm" && set.add(p.name));
    return Array.from(set).sort();
  }, [allJobs, s.people]);

  // ----- Apply filters -----
  const filteredJobs = useMemo(() => {
    return allJobs.filter((j) => {
      if (brandId && j.brandId !== brandId) return false;
      if (moduleFilter && j.module !== moduleFilter) return false;
      if (staff && j.assignee !== staff) return false;
      if (rangeStart) {
        // Include if created/completed/deadline falls within range, or still open
        const isOpen = !isDoneStatus(j.status) && j.status !== "Đã hủy";
        const completedIn = j.completedAt && new Date(j.completedAt) >= rangeStart;
        const createdIn = j.createdAt && new Date(j.createdAt) >= rangeStart;
        const deadlineIn = j.deadline && new Date(j.deadline) >= rangeStart;
        if (!(isOpen || completedIn || createdIn || deadlineIn)) return false;
      }
      return true;
    });
  }, [allJobs, brandId, moduleFilter, staff, rangeStart]);

  // ----- 7 quick stats -----
  const stats = useMemo(() => {
    const total = filteredJobs.length;
    const done = filteredJobs.filter((j) => isDoneStatus(j.status));
    const open = filteredJobs.filter((j) => !isDoneStatus(j.status) && j.status !== "Đã hủy");
    const overdue = open.filter((j) => isOverdue(j.deadline, j.status));
    const needsFix = filteredJobs.filter((j) => isNeedsFixStatus(j.status));
    const pendingReview = filteredJobs.filter((j) => isPendingReview(j.status));
    const onTimeDone = done.filter((j) => {
      if (!j.deadline || !j.completedAt) return false;
      return new Date(j.completedAt) <= new Date(j.deadline + "T23:59:59");
    });
    const onTimeRate = done.length > 0 ? Math.round((onTimeDone.length / done.length) * 100) : 0;
    return { total, done: done.length, open: open.length, overdue: overdue.length, needsFix: needsFix.length, pendingReview: pendingReview.length, onTimeRate };
  }, [filteredJobs]);

  // ----- Staff performance -----
  const staffRows = useMemo(() => {
    type Row = { name: string; role?: string; assigned: number; done: number; open: number; overdue: number; needsFix: number; pending: number; onTimeRate: number; onTimeDone: number; };
    const map = new Map<string, Row>();
    for (const j of filteredJobs) {
      if (!j.assignee) continue;
      let row = map.get(j.assignee);
      if (!row) {
        const person = s.people.find((p) => p.name === j.assignee);
        row = { name: j.assignee, role: person?.role || person?.position, assigned: 0, done: 0, open: 0, overdue: 0, needsFix: 0, pending: 0, onTimeRate: 0, onTimeDone: 0 };
        map.set(j.assignee, row);
      }
      row.assigned++;
      if (isDoneStatus(j.status)) {
        row.done++;
        if (j.deadline && j.completedAt && new Date(j.completedAt) <= new Date(j.deadline + "T23:59:59"))
          row.onTimeDone++;
      } else if (j.status !== "Đã hủy") row.open++;
      if (isOverdue(j.deadline, j.status)) row.overdue++;
      if (isNeedsFixStatus(j.status)) row.needsFix++;
      if (isPendingReview(j.status)) row.pending++;
    }
    // Single pass over jobs above avoids a separate scan for every employee.
    for (const row of map.values()) {
      row.onTimeRate = row.done > 0 ? Math.round((row.onTimeDone / row.done) * 100) : 0;
    }
    return Array.from(map.values()).sort((a, b) => b.assigned - a.assigned);
  }, [filteredJobs, s.people]);

  const [staffSubFilter, setStaffSubFilter] = useState<"all" | "overdue" | "fix" | "pending">("all");
  const visibleStaffRows = useMemo(() => {
    if (staffSubFilter === "all") return staffRows;
    if (staffSubFilter === "overdue") return staffRows.filter((r) => r.overdue > 0);
    if (staffSubFilter === "fix") return staffRows.filter((r) => r.needsFix > 0);
    return staffRows.filter((r) => r.pending > 0);
  }, [staffRows, staffSubFilter]);

  // ----- Channel performance -----
  type ChRow = { id: string; name: string; type: "Website" | "Social" | "Local"; brand?: string; owner?: string; url?: string; posts: number; growth?: string; lead?: number; status: string; href: string; };
  const channelRows = useMemo<ChRow[]>(() => {
    const rows: ChRow[] = [];
    // Index once: the previous implementation scanned all posts/reviews/growth
    // separately for every channel, which became slow on staff mobile devices.
    const webCounts = new Map<string, number>();
    for (const post of s.webContents) {
      if (!post.websiteId || (isDoneStatus(post.status) && !inRange(post.completedAt))) continue;
      webCounts.set(post.websiteId, (webCounts.get(post.websiteId) ?? 0) + 1);
    }
    const socialCounts = new Map<string, number>();
    for (const post of s.socialPosts) {
      if (!post.channelId || (isDoneStatus(post.status) && !inRange(post.publishedDate))) continue;
      socialCounts.set(post.channelId, (socialCounts.get(post.channelId) ?? 0) + 1);
    }
    const localCounts = new Map<string, number>();
    for (const post of s.mapPosts) {
      if (!post.placeId || (isDoneStatus(post.status) && !inRange(post.publishedDate))) continue;
      localCounts.set(post.placeId, (localCounts.get(post.placeId) ?? 0) + 1);
    }
    const reviewCounts = new Map<string, number>();
    for (const review of s.reviews) {
      if (review.placeId) reviewCounts.set(review.placeId, (reviewCounts.get(review.placeId) ?? 0) + 1);
    }
    // Latest still means last item in store order, consistent with existing UI.
    const growthByWebsite = new Map<string, (typeof s.growth)[number]>();
    const growthBySocial = new Map<string, (typeof s.growth)[number]>();
    for (const growth of s.growth) {
      if (growth.websiteId) growthByWebsite.set(growth.websiteId, growth);
      if (growth.channelId) growthBySocial.set(growth.channelId, growth);
    }
    for (const w of s.websites) {
      if (brandId && w.brandId !== brandId) continue;
      const posts = webCounts.get(w.id) ?? 0;
      const lastGrowth = growthByWebsite.get(w.id);
      rows.push({ id: w.id, name: w.name, type: "Website", brand: brandName(w.brandId), owner: w.seoOwner || w.contentOwner, url: w.url, posts, growth: lastGrowth?.organicTraffic != null ? `Organic: ${lastGrowth.organicTraffic.toLocaleString()}` : (lastGrowth?.totalTraffic != null ? `Traffic: ${lastGrowth.totalTraffic.toLocaleString()}` : undefined), status: w.status, href: `/websites/${w.id}` });
    }
    for (const c of s.socials) {
      if (brandId && c.brandId !== brandId) continue;
      const posts = socialCounts.get(c.id) ?? 0;
      const lastGrowth = growthBySocial.get(c.id);
      rows.push({ id: c.id, name: c.name, type: "Social", brand: brandName(c.brandId), owner: c.owner, url: c.url, posts, growth: lastGrowth?.followerEnd != null ? `Follower: ${lastGrowth.followerEnd.toLocaleString()}` : undefined, status: c.status, href: `/social/${c.id}` });
    }
    for (const pl of s.places) {
      if (brandId && pl.brandId !== brandId) continue;
      const posts = localCounts.get(pl.id) ?? 0;
      const reviews = reviewCounts.get(pl.id) ?? 0;
      rows.push({ id: pl.id, name: pl.name, type: "Local", brand: brandName(pl.brandId), owner: pl.owner, url: pl.mapLink, posts, lead: reviews, status: pl.verifyStatus, href: `/local/${pl.id}` });
    }
    return rows;
  }, [s, brandId, rangeStart]);

  const visibleChannels = useMemo(() => {
    let rows = channelRows;
    if (channelType !== "all") rows = rows.filter((r) => r.type === channelType);
    return rows;
  }, [channelRows, channelType]);

  // ----- Bottlenecks -----
  const bottlenecks = useMemo(() => {
    type B = { sev: "Cao" | "Trung bình" | "Thấp"; type: string; title: string; module: string; assignee?: string; brand?: string; due?: string; status: string; href: string; };
    const list: B[] = [];
    for (const j of filteredJobs) {
      if (isOverdue(j.deadline, j.status)) {
        list.push({ sev: "Cao", type: "Quá hạn", title: j.title, module: j.module, assignee: j.assignee, brand: brandName(j.brandId), due: j.deadline, status: j.status, href: j.href });
      } else if (isNeedsFixStatus(j.status)) {
        list.push({ sev: "Trung bình", type: "Cần sửa", title: j.title, module: j.module, assignee: j.assignee, brand: brandName(j.brandId), due: j.deadline, status: j.status, href: j.href });
      } else if (isPendingReview(j.status)) {
        list.push({ sev: "Thấp", type: "Chờ duyệt", title: j.title, module: j.module, assignee: j.assignee, brand: brandName(j.brandId), due: j.deadline, status: j.status, href: j.href });
      }
    }
    // Content đã đăng nhưng chưa index
    for (const c of s.webContents) {
      if ((c.status === "Đã đăng web" || c.status === "Hoàn thành") && c.indexStatus && c.indexStatus !== "Đã index") {
        if (brandId && c.brandId !== brandId) continue;
        list.push({ sev: "Trung bình", type: "Chưa index", title: c.title, module: "Dự án Web", assignee: c.writer || c.publisher, brand: brandName(c.brandId), due: c.publishedAt, status: c.indexStatus, href: "/web-contents" });
      }
    }
    // Tối ưu Content — điểm nghẽn riêng (loại Đã hủy)
    const today0 = new Date().toISOString().slice(0, 10);
    for (const c of s.webContents) {
      if (c.type !== "Bài tối ưu lại") continue;
      if (c.status === "Đã hủy" || c.status === "Hoàn thành") continue;
      if (brandId && c.brandId !== brandId) continue;
      const assignee = c.status === "Đã tạo" ? undefined : c.writer;
      if (c.status === "Đã tạo" && !c.writer) {
        list.push({ sev: "Trung bình", type: "Tối ưu Content chờ phân công", title: c.title, module: "Dự án Web", assignee: undefined, brand: brandName(c.brandId), due: c.deadline, status: c.status, href: "/web-contents" });
      }
      if (c.deadline && c.deadline < today0) {
        list.push({ sev: "Cao", type: "Tối ưu Content quá hạn", title: c.title, module: "Dự án Web", assignee, brand: brandName(c.brandId), due: c.deadline, status: c.status, href: "/web-contents" });
      }
      if (c.status === "Chờ duyệt tối ưu") {
        list.push({ sev: "Thấp", type: "Tối ưu Content chờ duyệt", title: c.title, module: "Dự án Web", assignee: c.optimizeReviewer || assignee, brand: brandName(c.brandId), due: c.deadline, status: c.status, href: "/web-contents" });
      }
      if (c.status === "Cần sửa tối ưu") {
        list.push({ sev: "Trung bình", type: "Tối ưu Content cần sửa", title: c.title, module: "Dự án Web", assignee, brand: brandName(c.brandId), due: c.deadline, status: c.status, href: "/web-contents" });
      }
    }
    const sevOrder: Record<string, number> = { Cao: 0, "Trung bình": 1, Thấp: 2 };
    return list.sort((a, b) => sevOrder[a.sev] - sevOrder[b.sev]);
  }, [filteredJobs, s.webContents, brandId]);
  const visibleBottlenecks = useMemo(() => bottlenecks.filter(b =>
    issueFilter === "all" ||
    (issueFilter === "overdue" && /quá hạn/i.test(b.type)) ||
    (issueFilter === "fix" && /cần sửa/i.test(b.type)) ||
    (issueFilter === "review" && /chờ duyệt/i.test(b.type))
  ).slice(0, 10), [bottlenecks, issueFilter]);

  // ----- Staff detail (drawer) -----
  const drawerData = useMemo(() => {
    if (!drawerStaff) return null;
    const my = filteredJobs.filter((j) => j.assignee === drawerStaff);
    const byKind = new Map<JobKind, { total: number; done: number; open: number; overdue: number; needsFix: number; pending: number }>();
    for (const j of my) {
      let agg = byKind.get(j.kind);
      if (!agg) { agg = { total: 0, done: 0, open: 0, overdue: 0, needsFix: 0, pending: 0 }; byKind.set(j.kind, agg); }
      agg.total++;
      if (isDoneStatus(j.status)) agg.done++;
      else if (j.status !== "Đã hủy") agg.open++;
      if (isOverdue(j.deadline, j.status)) agg.overdue++;
      if (isNeedsFixStatus(j.status)) agg.needsFix++;
      if (isPendingReview(j.status)) agg.pending++;
    }
    return { total: my.length, byKind: Array.from(byKind.entries()) };
  }, [drawerStaff, filteredJobs]);

  const resetFilters = () => {
    setRange("month"); setBrandId(""); setModuleFilter(""); setStaff(""); setChannelType("all");
  };

  return (
    <>
      {/* ===== Filter Bar ===== */}
      <Card className="dashboard-filters mb-4 overflow-hidden rounded-2xl md:mb-6">
        <CardContent className="flex flex-wrap items-center gap-2.5 p-3 sm:p-4">
          <div className="dashboard-range-tabs flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted/70 p-1 md:w-auto">
            {(["today", "week", "month", "quarter", "all"] as RangeKey[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`min-h-10 flex-1 shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors md:flex-none md:text-xs ${
                  range === r ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <FilterSelect value={brandId} onChange={setBrandId} placeholder="Tất cả thương hiệu"
            options={s.brands.map((b) => ({ value: b.id, label: b.name }))} />
          <FilterSelect value={moduleFilter} onChange={setModuleFilter} placeholder="Tất cả module"
            options={moduleOptions.map((m) => ({ value: m, label: m }))} />
          <FilterSelect value={staff} onChange={setStaff} placeholder="Tất cả nhân sự"
            options={staffOptions.map((n) => ({ value: n, label: n }))} />
          <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            <Button variant="outline" size="sm" className="min-h-10 rounded-xl" onClick={() => void refreshDashboard()} disabled={refreshing} aria-busy={refreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> {refreshing ? "Đang cập nhật…" : "Làm mới"}
            </Button>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== Quick Stat Cards: 4 action KPIs first on narrow screens ===== */}
      <section aria-label="Chỉ số vận hành" className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-4">
          <Stat label="Jobs đang mở" value={stats.open} icon={ListChecks} tone="info" />
          <button type="button" onClick={() => showIssues("overdue")} className="dashboard-metric-action min-w-0 rounded-2xl text-left" aria-label={`Xem các điểm nghẽn quá hạn, có ${stats.overdue} công việc quá hạn`}><Stat label="Jobs quá hạn" value={stats.overdue} icon={AlertTriangle} tone="danger" /></button>
          <button type="button" onClick={() => showIssues("fix")} className="dashboard-metric-action min-w-0 rounded-2xl text-left" aria-label={`Xem các điểm nghẽn cần sửa, có ${stats.needsFix} công việc`}><Stat label="Jobs cần sửa" value={stats.needsFix} icon={FileEdit} tone="warn" /></button>
          <button type="button" onClick={() => showIssues("review")} className="dashboard-metric-action min-w-0 rounded-2xl text-left" aria-label={`Xem các điểm nghẽn chờ duyệt, có ${stats.pendingReview} công việc`}><Stat label="Jobs chờ duyệt" value={stats.pendingReview} icon={Clock} tone="warn" /></button>
          <div className={showMoreMetrics ? "contents" : "hidden md:contents"}>
            <Stat label="Tổng jobs phát sinh" value={stats.total} icon={Briefcase} tone="default" />
            <Stat label="Jobs hoàn thành" value={stats.done} icon={CheckCircle2} tone="success" />
            <Stat label="Tỷ lệ đúng hạn" value={`${stats.onTimeRate}%`} icon={ClipboardCheck} tone="success" hint={`${stats.done} jobs hoàn thành`} />
          </div>
        </div>
        <button type="button" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border bg-card text-xs font-semibold text-primary md:hidden" aria-expanded={showMoreMetrics} onClick={() => setShowMoreMetrics(v => !v)}>
          {showMoreMetrics ? "Thu gọn chỉ số" : "Xem thêm chỉ số"} {showMoreMetrics ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </button>
      </section>

      {/* ===== Staff Performance ===== */}
      {canStaff && (
        <Card className="mt-5 overflow-hidden rounded-2xl md:mt-6">
          <CardHeader className="flex flex-col items-start justify-between gap-3 space-y-0 sm:flex-row">
            <div>
              <CardTitle className="text-base">Hiệu suất nhân viên</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Theo dõi khối lượng công việc, tiến độ và tình trạng xử lý của từng nhân sự trong kỳ.
              </div>
            </div>
            <div className="dashboard-segment flex w-full items-center gap-1 rounded-xl bg-muted/70 p-1 text-[11px] sm:w-auto sm:text-xs">
              {([["all","Tất cả"],["overdue","Quá hạn"],["fix","Cần sửa"],["pending","Chờ duyệt"]] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setStaffSubFilter(k)}
                  aria-pressed={staffSubFilter === k}
                  className={`min-h-9 flex-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold transition-colors sm:flex-none sm:px-2.5 ${staffSubFilter === k ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent"}`}
                >{l}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2.5 p-3 md:hidden">
              {visibleStaffRows.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu nhân sự theo bộ lọc.</p>}
              {visibleStaffRows.slice(0,staffMobileLimit).map(r => (
                <button type="button" key={r.name} className="dashboard-person-card flex min-h-28 w-full flex-col gap-2 rounded-xl border bg-card p-3 text-left" onClick={() => setDrawerStaff(r.name)} aria-label={`Xem hiệu suất của ${r.name}`}>
                  <span className="flex w-full items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">{avatarInitials(r.name)}</span>
                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{r.name}</strong><span className="block truncate text-[11px] text-muted-foreground">{r.role || "Nhân viên"} · {r.assigned} việc được giao</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                  </span>
                  <span className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"><strong className="block text-lg tabular-nums">{r.done}</strong>Đã xong</span>
                    <span className="rounded-lg bg-blue-50 p-1.5 text-blue-800 dark:bg-blue-950 dark:text-blue-200"><strong className="block text-lg tabular-nums">{r.open}</strong>Đang mở</span>
                    <span className="rounded-lg bg-rose-50 p-1.5 text-rose-800 dark:bg-rose-950 dark:text-rose-200"><strong className="block text-lg tabular-nums">{r.overdue}</strong>Quá hạn</span>
                    <span className="rounded-lg bg-amber-50 p-1.5 text-amber-800 dark:bg-amber-950 dark:text-amber-200"><strong className="block text-lg tabular-nums">{r.needsFix}</strong>Cần sửa</span>
                  </span>
                  <span className="flex w-full items-center gap-2 text-xs text-muted-foreground"><span className="shrink-0">Đúng hạn</span><Progress value={r.onTimeRate} className="h-1.5 flex-1" /><strong className="text-foreground">{r.onTimeRate}%</strong></span>
                </button>
              ))}
              {visibleStaffRows.length > staffMobileLimit && <Button type="button" variant="outline" className="min-h-11 w-full rounded-xl" onClick={() => setStaffMobileLimit(n => n+6)}>Xem thêm nhân viên <ArrowDown className="h-4 w-4" /></Button>}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Nhân viên</th>
                    <th className="text-left font-medium px-4 py-2.5">Role</th>
                    <th className="text-center font-medium px-3 py-2.5">Được giao</th>
                    <th className="text-center font-medium px-3 py-2.5">Hoàn thành</th>
                    <th className="text-center font-medium px-3 py-2.5">Đang mở</th>
                    <th className="text-center font-medium px-3 py-2.5">Quá hạn</th>
                    <th className="text-center font-medium px-3 py-2.5">Cần sửa</th>
                    <th className="text-center font-medium px-3 py-2.5">Chờ duyệt</th>
                    <th className="text-left font-medium px-4 py-2.5 min-w-[160px]">Tỷ lệ đúng hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visibleStaffRows.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      Chưa có dữ liệu hiệu suất nhân viên trong khoảng thời gian này.
                    </td></tr>
                  )}
                  {visibleStaffRows.map((r) => (
                    <tr key={r.name} className="hover:bg-muted/30 cursor-pointer" onClick={() => setDrawerStaff(r.name)}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                            {avatarInitials(r.name)}
                          </div>
                          <div className="font-medium">{r.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{r.role ? <Badge variant="secondary" className="font-normal">{r.role}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{r.assigned}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums text-success">{r.done}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{r.open}</td>
                      <td className={`px-3 py-2.5 text-center tabular-nums ${r.overdue > 0 ? "text-destructive font-semibold" : ""}`}>{r.overdue}</td>
                      <td className={`px-3 py-2.5 text-center tabular-nums ${r.needsFix > 0 ? "text-[oklch(0.55_0.15_50)] font-semibold" : ""}`}>{r.needsFix}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{r.pending}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Progress value={r.onTimeRate} className="h-1.5 w-24" />
                          <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">{r.onTimeRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Channel Performance ===== */}
      {canChannel && (
        <Card className="mt-5 overflow-hidden rounded-2xl md:mt-6">
          <CardHeader className="flex flex-col items-start justify-between gap-3 space-y-0 sm:flex-row">
            <div>
              <CardTitle className="text-base">Hiệu quả kênh truyền thông</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Theo dõi hiệu quả vận hành các kênh Website, Social và Local Map theo từng thương hiệu.
              </div>
            </div>
            <div className="dashboard-segment flex w-full gap-1 rounded-xl bg-muted/70 p-1 text-xs sm:w-auto">
              {(["all", "Website", "Social", "Local"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setChannelType(k)}
                  aria-pressed={channelType === k}
                  className={`min-h-9 flex-1 rounded-lg px-2 py-1.5 font-semibold transition-colors sm:flex-none ${channelType === k ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent"}`}
                >{k === "all" ? "Tất cả" : k}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2.5 p-3 md:hidden">
              {visibleChannels.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có kênh phù hợp với bộ lọc.</p>}
              {visibleChannels.slice(0,channelMobileLimit).map(r => (
                <article key={`${r.type}-${r.id}`} className="rounded-xl border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-200">{r.type}</span>
                      <h3 className="mt-2 break-words text-sm font-semibold leading-5">{r.name}</h3>
                    </div>
                    {healthBadge(channelHealth(r.posts,r.status))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{r.brand || "Chưa gắn thương hiệu"} · {r.owner || "Chưa phân công"}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Nội dung <strong className="ml-1 text-sm text-foreground tabular-nums">{r.posts}</strong></span>
                    <span className="max-w-[60%] truncate text-right text-[11px] text-muted-foreground">{r.growth || (r.lead != null ? `${r.lead} đánh giá` : "Chưa có số tăng trưởng")}</span>
                  </div>
                  <Button asChild variant="outline" className="mt-3 min-h-11 w-full rounded-xl border-primary/25 text-primary"><Link to={r.href}>Xem kênh <ArrowRight className="h-4 w-4" /></Link></Button>
                </article>
              ))}
              {visibleChannels.length > channelMobileLimit && <Button type="button" variant="outline" className="min-h-11 w-full rounded-xl" onClick={() => setChannelMobileLimit(n => n+6)}>Xem thêm kênh <ArrowDown className="h-4 w-4" /></Button>}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Kênh</th>
                    <th className="text-left font-medium px-3 py-2.5">Loại</th>
                    <th className="text-left font-medium px-3 py-2.5">Thương hiệu</th>
                    <th className="text-left font-medium px-3 py-2.5">Người phụ trách</th>
                    <th className="text-center font-medium px-3 py-2.5">Nội dung</th>
                    <th className="text-left font-medium px-3 py-2.5">Tăng trưởng</th>
                    <th className="text-left font-medium px-3 py-2.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visibleChannels.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Chưa có dữ liệu kênh truyền thông trong khoảng thời gian này.
                    </td></tr>
                  )}
                  {visibleChannels.map((r) => (
                    <tr key={`${r.type}-${r.id}`} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">
                        <Link to={r.href} className="hover:text-primary inline-flex items-center gap-1.5">
                          {r.name}
                          {r.url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5"><Badge variant="secondary" className="font-normal">{r.type}</Badge></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.brand || "—"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.owner || "—"}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums">{r.posts}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{r.growth || (r.lead != null ? `${r.lead} đánh giá` : "—")}</td>
                      <td className="px-3 py-2.5">{healthBadge(channelHealth(r.posts, r.status))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== Bottlenecks ===== */}
      <Card id="dashboard-bottlenecks" className="mt-5 scroll-mt-28 overflow-hidden rounded-2xl md:mt-6">
        <CardHeader>
          <CardTitle className="text-base">Điểm nghẽn cần chú ý</CardTitle>
          <div className="text-xs text-muted-foreground">Các việc đang làm tắc quy trình — ưu tiên xử lý nhanh.</div>
          <div className="dashboard-segment mt-2 grid grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1" aria-label="Lọc điểm nghẽn">
            {([["all","Tất cả"],["overdue","Quá hạn"],["fix","Cần sửa"],["review","Chờ duyệt"]] as const).map(([k,label]) => <button key={k} type="button" aria-pressed={issueFilter === k} onClick={() => setIssueFilter(k)} className={`min-h-10 rounded-lg px-1 text-[11px] font-semibold transition-colors ${issueFilter === k ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-accent"}`}>{label}</button>)}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2.5 p-3 md:hidden">
            {visibleBottlenecks.length === 0 && <div className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"><CheckCircle2 className="mx-auto mb-2 h-6 w-6" />Không có điểm nghẽn cần chú ý.</div>}
            {visibleBottlenecks.map((b,i) => (
              <article key={`${b.href}-${b.title}-${i}`} className={`rounded-xl border p-3 ${b.sev === "Cao" ? "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20" : b.sev === "Trung bình" ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${b.sev === "Cao" ? "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100" : b.sev === "Trung bình" ? "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>{b.type}</span>
                  <StatusBadge value={b.status} />
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6">{b.title}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{b.module} · {b.assignee || "Chưa có người xử lý"}</p>
                {b.due && <p className="mt-1 text-[11px] font-medium"><Clock className="mr-1 inline h-3 w-3" />Hạn: {fmtDate(b.due)}</p>}
                <Button asChild variant="outline" className="mt-3 min-h-11 w-full rounded-xl border-primary/25 bg-card text-primary"><Link to={b.href}>Xử lý công việc <ArrowRight className="h-4 w-4" /></Link></Button>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Mức</th>
                  <th className="text-left font-medium px-4 py-2.5">Loại</th>
                  <th className="text-left font-medium px-4 py-2.5">Nội dung</th>
                  <th className="text-left font-medium px-3 py-2.5">Module</th>
                  <th className="text-left font-medium px-3 py-2.5">Nhân sự</th>
                  <th className="text-left font-medium px-3 py-2.5">Thương hiệu</th>
                  <th className="text-left font-medium px-3 py-2.5">Hạn</th>
                  <th className="text-left font-medium px-3 py-2.5">Trạng thái</th>
                  <th className="text-right font-medium px-3 py-2.5">Mở việc</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleBottlenecks.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Không có điểm nghẽn nào cần chú ý.</td></tr>
                )}
                {visibleBottlenecks.map((b, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        b.sev === "Cao" ? "bg-destructive/10 text-destructive"
                        : b.sev === "Trung bình" ? "bg-warning/15 text-[oklch(0.45_0.13_75)]"
                        : "bg-muted text-muted-foreground"
                      }`}>{b.sev}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{b.type}</td>
                    <td className="px-4 py-2.5 font-medium">{b.title}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{b.module}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{b.assignee || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{b.brand || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(b.due)}</td>
                    <td className="px-3 py-2.5"><StatusBadge value={b.status} /></td>
                    <td className="px-3 py-2.5 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={b.href}>Mở <ArrowRight className="h-3.5 w-3.5" /></Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ===== Quick access ===== */}
      <Card className="mt-5 rounded-2xl md:mt-6">
        <CardHeader><CardTitle className="text-base">Truy cập nhanh</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5 p-3 pt-0 sm:grid-cols-4 sm:gap-3 sm:p-5 lg:grid-cols-7">
          {[
            { to: "/tasks", icon: ListChecks, label: "Công việc", tone: "blue" },
            { to: "/brands", icon: Briefcase, label: "Thương hiệu", tone: "indigo" },
            { to: "/websites", icon: Globe, label: "Website", tone: "cyan" },
            { to: "/social", icon: Share2, label: "Social", tone: "pink" },
            { to: "/local", icon: MapPin, label: "Local Map", tone: "emerald" },
            { to: "/videos", icon: Video, label: "Video", tone: "orange" },
            { to: "/orders", icon: FileEdit, label: "Thiết kế", tone: "violet" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className={`dashboard-shortcut dashboard-shortcut-${q.tone} flex min-h-24 flex-col items-start justify-between gap-2 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
              <q.icon className="h-5 w-5" />
              <div className="text-xs font-semibold sm:text-sm">{q.label}</div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* ===== Staff Detail Drawer ===== */}
      <Sheet open={!!drawerStaff} onOpenChange={(o) => !o && setDrawerStaff(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết hiệu suất — {drawerStaff}</SheetTitle>
            <SheetDescription>Tổng hợp khối lượng và tình trạng xử lý theo từng loại việc trong kỳ.</SheetDescription>
          </SheetHeader>
          {drawerData && (
            <div className="mt-6 space-y-5">
              <div className="text-sm text-muted-foreground">Tổng jobs trong kỳ: <span className="font-semibold text-foreground tabular-nums">{drawerData.total}</span></div>
              {drawerData.byKind.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">Không có dữ liệu.</div>
              ) : (
                <div className="space-y-3">
                  {drawerData.byKind.map(([kind, agg]) => (
                    <div key={kind} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{kind}</div>
                        <span className="text-xs text-muted-foreground">{agg.total} jobs</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <Mini label="HT" v={agg.done} tone="text-success" />
                        <Mini label="Mở" v={agg.open} />
                        <Mini label="Quá hạn" v={agg.overdue} tone={agg.overdue > 0 ? "text-destructive" : ""} />
                        <Mini label="Cần sửa" v={agg.needsFix} tone={agg.needsFix > 0 ? "text-[oklch(0.55_0.15_50)]" : ""} />
                        <Mini label="Chờ duyệt" v={agg.pending} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" asChild className="w-full" onClick={() => setDrawerStaff(null)}>
                <Link to="/tasks">Xem các việc liên quan <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Mini({ label, v, tone = "" }: { label: string; v: number; tone?: string }) {
  return (
    <div className="text-center">
      <div className={`text-base font-semibold tabular-nums ${tone}`}>{v}</div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
    </div>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      className="min-h-10 min-w-0 rounded-xl border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

