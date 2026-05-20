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
  Briefcase, RefreshCw, X, ExternalLink,
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

// ============ Component ============

function Overview() {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const canSeeAllDept = isSuperAdmin || can("overview.all_dept") || can("report.view");
  const [tab, setTab] = useState<"mine" | "all">("mine");
  void user;

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
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    warn: "bg-warning/15 text-[oklch(0.45_0.13_75)]",
    danger: "bg-destructive/10 text-destructive",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  };
  return (
    <Card>
      <CardContent className="p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-semibold mt-1.5 tracking-tight tabular-nums">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerStaff, setDrawerStaff] = useState<string | null>(null);

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
      jobs.push({
        id: `web-${c.id}`, kind: "Content Web", module: "Dự án Web", title: c.title,
        brandId: c.brandId, assignee: c.writer, status: c.status,
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
    type Row = { name: string; role?: string; assigned: number; done: number; open: number; overdue: number; needsFix: number; pending: number; onTimeRate: number; };
    const map = new Map<string, Row>();
    for (const j of filteredJobs) {
      if (!j.assignee) continue;
      let row = map.get(j.assignee);
      if (!row) {
        const person = s.people.find((p) => p.name === j.assignee);
        row = { name: j.assignee, role: person?.role || person?.position, assigned: 0, done: 0, open: 0, overdue: 0, needsFix: 0, pending: 0, onTimeRate: 0 };
        map.set(j.assignee, row);
      }
      row.assigned++;
      if (isDoneStatus(j.status)) row.done++;
      else if (j.status !== "Đã hủy") row.open++;
      if (isOverdue(j.deadline, j.status)) row.overdue++;
      if (isNeedsFixStatus(j.status)) row.needsFix++;
      if (isPendingReview(j.status)) row.pending++;
    }
    // Compute on-time rate
    for (const row of map.values()) {
      const myDone = filteredJobs.filter((j) => j.assignee === row.name && isDoneStatus(j.status));
      const onTime = myDone.filter((j) => j.deadline && j.completedAt && new Date(j.completedAt) <= new Date(j.deadline + "T23:59:59"));
      row.onTimeRate = myDone.length > 0 ? Math.round((onTime.length / myDone.length) * 100) : 0;
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
    for (const w of s.websites) {
      if (brandId && w.brandId !== brandId) continue;
      const posts = s.webContents.filter((c) => c.websiteId === w.id && (isDoneStatus(c.status) ? inRange(c.completedAt) : true)).length;
      const lastGrowth = s.growth.filter((g) => g.scope === "Website" && g.entityId === w.id).slice(-1)[0];
      rows.push({ id: w.id, name: w.name, type: "Website", brand: brandName(w.brandId), owner: w.seoOwner || w.contentOwner, url: w.url, posts, growth: lastGrowth ? `${lastGrowth.metric}: ${lastGrowth.value}` : undefined, status: w.status, href: `/websites/${w.id}` });
    }
    for (const c of s.socials) {
      if (brandId && c.brandId !== brandId) continue;
      const posts = s.socialPosts.filter((p) => p.channelId === c.id && (isDoneStatus(p.status) ? inRange(p.publishedDate) : true)).length;
      const lastGrowth = s.growth.filter((g) => g.scope === "Social" && g.entityId === c.id).slice(-1)[0];
      rows.push({ id: c.id, name: c.name, type: "Social", brand: brandName(c.brandId), owner: c.owner, url: c.url, posts, growth: lastGrowth ? `${lastGrowth.metric}: ${lastGrowth.value}` : undefined, status: c.status, href: `/social/${c.id}` });
    }
    for (const pl of s.places) {
      if (brandId && pl.brandId !== brandId) continue;
      const posts = s.mapPosts.filter((p) => p.placeId === pl.id && (isDoneStatus(p.status) ? inRange(p.publishedDate) : true)).length;
      const reviews = s.reviews.filter((r) => r.placeId === pl.id).length;
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
    const sevOrder: Record<string, number> = { Cao: 0, "Trung bình": 1, Thấp: 2 };
    return list.sort((a, b) => sevOrder[a.sev] - sevOrder[b.sev]).slice(0, 10);
  }, [filteredJobs, s.webContents, brandId]);

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
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border bg-background overflow-hidden">
            {(["today", "week", "month", "quarter", "all"] as RangeKey[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
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
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw className="h-3.5 w-3.5" /> Làm mới
            </Button>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== Quick Stat Cards ===== */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng jobs phát sinh" value={stats.total} icon={Briefcase} tone="default" />
        <Stat label="Jobs hoàn thành" value={stats.done} icon={CheckCircle2} tone="success" />
        <Stat label="Jobs đang mở" value={stats.open} icon={ListChecks} tone="info" />
        <Stat label="Jobs quá hạn" value={stats.overdue} icon={AlertTriangle} tone="danger" />
        <Stat label="Jobs cần sửa" value={stats.needsFix} icon={FileEdit} tone="warn" />
        <Stat label="Jobs chờ duyệt" value={stats.pendingReview} icon={Clock} tone="warn" />
        <Stat label="Tỷ lệ đúng hạn" value={`${stats.onTimeRate}%`} icon={ClipboardCheck} tone="success" hint={`${stats.done} jobs hoàn thành`} />
      </div>

      {/* ===== Staff Performance ===== */}
      {canStaff && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Hiệu suất nhân viên</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Theo dõi khối lượng công việc, tiến độ và tình trạng xử lý của từng nhân sự trong kỳ.
              </div>
            </div>
            <div className="inline-flex rounded-md border bg-background overflow-hidden text-xs">
              {([["all","Tất cả"],["overdue","Quá hạn"],["fix","Cần sửa"],["pending","Chờ duyệt"]] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setStaffSubFilter(k)}
                  className={`px-2.5 py-1.5 font-medium transition-colors ${staffSubFilter === k ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >{l}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Hiệu quả kênh truyền thông</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Theo dõi hiệu quả vận hành các kênh Website, Social và Local Map theo từng thương hiệu.
              </div>
            </div>
            <div className="inline-flex rounded-md border bg-background overflow-hidden text-xs">
              {(["all", "Website", "Social", "Local"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setChannelType(k)}
                  className={`px-2.5 py-1.5 font-medium transition-colors ${channelType === k ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >{k === "all" ? "Tất cả" : k}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Điểm nghẽn cần chú ý</CardTitle>
          <div className="text-xs text-muted-foreground">Các việc đang làm tắc quy trình — ưu tiên xử lý nhanh.</div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                {bottlenecks.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Không có điểm nghẽn nào cần chú ý.</td></tr>
                )}
                {bottlenecks.map((b, i) => (
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
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Truy cập nhanh</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { to: "/tasks", icon: ListChecks, label: "Task" },
            { to: "/brands", icon: Briefcase, label: "Thương hiệu" },
            { to: "/websites", icon: Globe, label: "Website" },
            { to: "/social", icon: Share2, label: "Social" },
            { to: "/local", icon: MapPin, label: "Local Map" },
            { to: "/videos", icon: Video, label: "Video" },
            { to: "/orders", icon: FileEdit, label: "Thiết kế" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className="flex flex-col items-start gap-2 rounded-lg border bg-card p-3 hover:border-primary/40 hover:bg-accent/40 transition-colors">
              <q.icon className="h-5 w-5 text-primary" />
              <div className="text-sm font-medium">{q.label}</div>
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
      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
