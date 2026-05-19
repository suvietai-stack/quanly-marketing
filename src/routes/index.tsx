import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, isOverdue, fmtDate } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { RequirePermission } from "@/components/PermissionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ListChecks, AlertTriangle, Clock, CheckCircle2, Globe, Share2,
  MapPin, Video, Palette, Inbox, Hourglass, ArrowRight,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tổng Quan — Base Marketing" }] }),
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
const WAIT_OTHERS_ORDER = new Set(["Mới tạo", "Chờ nhận việc", "Đang thực hiện", "Chờ duyệt"]);

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

function isMineByNames(value: string | undefined, mine: Set<string>): boolean {
  if (!value) return false;
  return mine.has(value.toLowerCase());
}

function anyMine(values: (string | undefined)[], mine: Set<string>): boolean {
  return values.some((v) => isMineByNames(v, mine));
}

// ============ Component ============

function Overview() {
  const s = useStore();
  const { user, can, isSuperAdmin } = useCurrentUser();
  const canSeeAllDept = isSuperAdmin || can("overview.all_dept") || can("report.view");
  const [tab, setTab] = useState<"mine" | "all">(canSeeAllDept && !user ? "all" : "mine");

  return (
    <>
      <PageHeader
        title="Tổng Quan"
        description={
          tab === "mine"
            ? "Việc liên quan trực tiếp đến bạn — cập nhật theo thời gian thực."
            : "Tình hình vận hành phòng Digital Marketing."
        }
      />
      {canSeeAllDept ? (
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="mine">Tổng quan của tôi</TabsTrigger>
            <TabsTrigger value="all">Tổng quan toàn phòng</TabsTrigger>
          </TabsList>
          <TabsContent value="mine" className="mt-6">
            <MineOverview />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <DeptOverview />
          </TabsContent>
        </Tabs>
      ) : (
        <MineOverview />
      )}
    </>
  );
}

// ============ Mine ============

function MineOverview() {
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
    if (isSuperAdmin || can("task.view")) {
      for (const t of s.tasks) {
        const isMine = isMineByNames(t.assignee, mine) || isMineByNames(t.reporter, mine);
        if (!isMine) continue;
        const wi: WorkItem = {
          id: `task-${t.id}`, kind: "Task", module: "Task", title: t.title,
          brand: brandName(t.brandId), status: t.status, due: t.deadline,
          href: "/tasks", mineAs: isMineByNames(t.assignee, mine) ? "Người phụ trách" : "Người giao",
        };
        if (t.status === "Hoàn thành") {
          if (t.completedAt && new Date(t.completedAt) >= weekAgo) out.doneRecent.push(wi);
        } else {
          if (isMineByNames(t.assignee, mine)) out.mine.push(wi);
          if (isOverdue(t.deadline, t.status)) out.overdue.push(wi);
          if (NEEDS_FIX_KEYWORDS.some((k) => t.status.includes(k))) out.needsFix.push(wi);
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

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Việc tôi cần xử lý" value={items.mine.length} icon={Inbox} tone="info" />
        <Stat label="Việc quá hạn" value={items.overdue.length} icon={AlertTriangle} tone="danger" />
        <Stat label="Chờ người khác" value={items.waiting.length} icon={Hourglass} tone="warn" />
        <Stat label="Hoàn thành 7 ngày" value={items.doneRecent.length} icon={CheckCircle2} tone="success" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Việc của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mine">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="mine">Cần tôi xử lý ({items.mine.length})</TabsTrigger>
              <TabsTrigger value="review">Cần duyệt ({items.toReview.length})</TabsTrigger>
              <TabsTrigger value="fix">Cần sửa ({items.needsFix.length})</TabsTrigger>
              <TabsTrigger value="waiting">Chờ người khác ({items.waiting.length})</TabsTrigger>
              <TabsTrigger value="overdue">Quá hạn ({items.overdue.length})</TabsTrigger>
              <TabsTrigger value="done">Hoàn thành gần đây ({items.doneRecent.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="mine"><WorkTable items={items.mine} empty="Hiện chưa có việc nào cần bạn xử lý." /></TabsContent>
            <TabsContent value="review"><WorkTable items={items.toReview} empty="Không có việc nào đang chờ bạn duyệt." /></TabsContent>
            <TabsContent value="fix"><WorkTable items={items.needsFix} empty="Không có việc nào cần sửa." /></TabsContent>
            <TabsContent value="waiting"><WorkTable items={items.waiting} empty="Không có việc nào đang chờ người khác." /></TabsContent>
            <TabsContent value="overdue"><WorkTable items={items.overdue} empty="Tuyệt vời! Không có việc nào quá hạn." /></TabsContent>
            <TabsContent value="done"><WorkTable items={items.doneRecent} empty="Chưa có việc hoàn thành trong 7 ngày." /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

function WorkTable({ items, empty }: { items: WorkItem[]; empty: string }) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">{empty}</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40">
          <tr>
            <th className="text-left font-medium px-3 py-2.5">Loại</th>
            <th className="text-left font-medium px-3 py-2.5">Nội dung</th>
            <th className="text-left font-medium px-3 py-2.5">Module</th>
            <th className="text-left font-medium px-3 py-2.5">Thương hiệu</th>
            <th className="text-left font-medium px-3 py-2.5">Vai trò</th>
            <th className="text-left font-medium px-3 py-2.5">Hạn</th>
            <th className="text-left font-medium px-3 py-2.5">Trạng thái</th>
            <th className="text-right font-medium px-3 py-2.5">Mở việc</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((it) => (
            <tr key={it.id} className="hover:bg-muted/30">
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{it.kind}</td>
              <td className="px-3 py-2 font-medium">{it.title}</td>
              <td className="px-3 py-2 text-muted-foreground">{it.module}</td>
              <td className="px-3 py-2 text-muted-foreground">{it.brand || "—"}</td>
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{it.mineAs || "—"}</td>
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(it.due)}</td>
              <td className="px-3 py-2"><StatusBadge value={it.status} /></td>
              <td className="px-3 py-2 text-right">
                <Button asChild size="sm" variant="outline">
                  <Link to={it.href}>
                    Mở <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ Department (existing dashboard) ============

function Stat({ label, value, icon: Icon, tone = "default" }: {
  label: string; value: number | string; icon: any; tone?: "default" | "warn" | "danger" | "success" | "info";
}) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    warn: "bg-warning/15 text-[oklch(0.45_0.13_75)]",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  };
  return (
    <Card>
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-1.5 tracking-tight">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function DeptOverview() {
  const s = useStore();
  const stats = useMemo(() => {
    const openTasks = s.tasks.filter((t) => t.status !== "Hoàn thành");
    const overdue = openTasks.filter((t) => isOverdue(t.deadline, t.status));
    const startWeek = new Date();
    startWeek.setDate(startWeek.getDate() - 7);
    const doneWeek = s.tasks.filter(
      (t) => t.status === "Hoàn thành" && t.completedAt && new Date(t.completedAt) >= startWeek
    );
    return {
      open: openTasks.length,
      overdue: overdue.length,
      pending:
        s.tasks.filter((t) => t.status === "Đang làm").length +
        s.webContents.filter((c) => c.status === "Chờ duyệt outline" || c.status === "Chờ duyệt bài").length +
        s.socialPosts.filter((p) => p.status === "Chờ duyệt").length +
        s.orders.filter((o) => o.status === "Chờ duyệt").length +
        s.videos.filter((v) => v.status === "Chờ duyệt video" || v.status === "Chờ duyệt kịch bản").length,
      doneWeek: doneWeek.length,
      sites: s.websites.filter((w) => w.status === "Đang vận hành").length,
      socials: s.socials.filter((c) => c.status === "Đang vận hành").length,
      places: s.places.length,
      videosProd: s.videos.filter((v) => ["Đã giao","Đang làm kịch bản","Đang quay / thu tư liệu","Đang dựng"].includes(v.status)).length,
    };
  }, [s]);

  const attention = useMemo(() => {
    const items: { type: string; title: string; status: string; due?: string; brand?: string; href?: string }[] = [];
    s.tasks.filter((t) => isOverdue(t.deadline, t.status)).forEach((t) =>
      items.push({ type: "Task quá hạn", title: t.title, status: t.priority, due: t.deadline, brand: s.brands.find(b => b.id === t.brandId)?.name, href: "/tasks" })
    );
    s.orders.filter((o) => o.status === "Chờ duyệt").forEach((o) =>
      items.push({ type: "Order thiết kế", title: o.title, status: o.status, due: o.deadline, brand: s.brands.find(b => b.id === o.brandId)?.name, href: "/orders" })
    );
    s.videos.filter((v) => v.status === "Chờ duyệt video" || v.status === "Chờ duyệt kịch bản").forEach((v) =>
      items.push({ type: "Video chờ duyệt", title: v.title, status: v.status, due: v.deadline, brand: s.brands.find(b => b.id === v.brandId)?.name, href: "/videos" })
    );
    s.socialPosts.filter((p) => p.status === "Chờ duyệt" || p.status === "Chờ đăng").forEach((p) =>
      items.push({ type: "Bài social", title: p.title, status: p.status, due: p.scheduledDate, brand: s.brands.find(b => b.id === p.brandId)?.name, href: "/social" })
    );
    s.webContents.filter((c) => c.status.startsWith("Chờ duyệt") || c.status.startsWith("Cần sửa")).forEach((c) =>
      items.push({ type: "Nội dung web", title: c.title, status: c.status, due: c.deadline, brand: s.brands.find(b => b.id === c.brandId)?.name, href: "/web-contents" })
    );
    return items.slice(0, 12);
  }, [s]);

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Công việc đang mở" value={stats.open} icon={ListChecks} tone="info" />
        <Stat label="Công việc quá hạn" value={stats.overdue} icon={AlertTriangle} tone="danger" />
        <Stat label="Chờ duyệt" value={stats.pending} icon={Clock} tone="warn" />
        <Stat label="Hoàn thành / 7 ngày" value={stats.doneWeek} icon={CheckCircle2} tone="success" />
        <Stat label="Website vận hành" value={stats.sites} icon={Globe} />
        <Stat label="Kênh social vận hành" value={stats.socials} icon={Share2} />
        <Stat label="Local Map quản lý" value={stats.places} icon={MapPin} />
        <Stat label="Video đang sản xuất" value={stats.videosProd} icon={Video} />
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Việc cần chú ý</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Loại</th>
                    <th className="text-left font-medium px-4 py-2.5">Nội dung</th>
                    <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
                    <th className="text-left font-medium px-4 py-2.5">Hạn</th>
                    <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attention.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Không có việc cần chú ý.</td></tr>
                  )}
                  {attention.map((it, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{it.type}</td>
                      <td className="px-4 py-2.5 font-medium">
                        {it.href ? <Link to={it.href} className="hover:text-primary">{it.title}</Link> : it.title}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{it.brand || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(it.due)}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={it.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Truy cập nhanh</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { to: "/tasks", icon: ListChecks, label: "Task" },
              { to: "/brands", icon: Globe, label: "Thương hiệu" },
              { to: "/websites", icon: Globe, label: "Website" },
              { to: "/social", icon: Share2, label: "Social" },
              { to: "/local", icon: MapPin, label: "Local Map" },
              { to: "/videos", icon: Video, label: "Video" },
              { to: "/orders", icon: Palette, label: "Thiết kế" },
            ].map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex flex-col items-start gap-2 rounded-lg border bg-card p-3 hover:border-primary/40 hover:bg-accent/40 transition-colors"
              >
                <q.icon className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium">{q.label}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
