import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useStore, fmtDate, ensureSeoChecks, todayISO, isActiveKeywordTrack,
  CONTENT_STATUSES, CONTENT_TYPES, SHARE_SOCIAL_STATUSES,
  OPTIMIZE_RECURRING_PERIODS, computeNextOptimizeDate,
  type WebContent, type ContentStatus,
  type OptimizeRecurringPeriod, type OptimizeScheduleTrackStatus,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";

import { StatusBadge } from "@/components/StatusBadge";

import { ContentForm } from "@/components/ContentForm";
import { OptimizeContentForm } from "@/components/OptimizeContentForm";
import { ContentDetail } from "@/components/ContentDetail";
import { OptimizeContentDetail } from "@/components/OptimizeContentDetail";
import { EntitySocialTab } from "@/components/EntitySocialTab";
import { KeywordsTab } from "@/components/KeywordsTab";
import { BacklinksTab } from "@/components/BacklinksTab";
import { BasicReportTab } from "@/components/BasicReportTab";
import { GrowthTab } from "@/components/GrowthTab";
import { TechnicalSeoTab } from "@/components/TechnicalSeoTab";
import { KeywordResearchTab } from "@/components/KeywordResearchTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, ExternalLink, Plus, LayoutGrid, Table as TableIcon, Calendar as CalIcon,
  Globe, FileText, CheckCircle2, AlertCircle, RefreshCw, Share2, TrendingUp, Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/websites/$id")({
  head: () => ({ meta: [{ title: "Chi tiết website — Base Marketing" }] }),
  component: () => (
    <RequirePermission perm="web.view">
      <WebsiteDetail />
    </RequirePermission>
  ),
});

const PRODUCING_STATUSES: ContentStatus[] = [
  "Đã giao", "Đang làm outline", "Outline đã duyệt", "Đang viết bài",
  "Cần sửa outline", "Cần sửa bài",
];
const REVIEW_STATUSES: ContentStatus[] = ["Chờ duyệt outline", "Chờ duyệt bài"];
const FIX_STATUSES: ContentStatus[] = ["Cần sửa outline", "Cần sửa bài"];
const DONE_STATUSES: ContentStatus[] = ["Đã đăng web", "Kiểm tra index", "Hoàn thành"];

function WebsiteDetail() {
  const { id } = Route.useParams();
  const s = useStore();
  const { can } = useCurrentUser();
  const w = s.websites.find((x) => x.id === id);
  const [view, setView] = useState<"table" | "kanban" | "calendar">("table");
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState("info");
  const [openContent, setOpenContent] = useState<WebContent | null>(null);
  const [openOptimizeContent, setOpenOptimizeContent] = useState<WebContent | null>(null);
  const [openOptimize, setOpenOptimize] = useState(false);
  const [fStatus, setFStatus] = useState("all");
  const [fWriter, setFWriter] = useState("all");
  const [fType, setFType] = useState("all");
  const [search, setSearch] = useState("");

  // Auto-seed SEO checklist if missing
  useEffect(() => {
    if (!w) return;
    const missing = ensureSeoChecks(s.seoChecks, w.id);
    missing.forEach((c) => s.add("seoChecks", c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w?.id]);

  if (!w) {
    return (
      <div className="p-10 text-center">
        Không tìm thấy website. <Link to="/websites" className="text-primary">Quay lại</Link>
      </div>
    );
  }

  const brand = s.brands.find((b) => b.id === w.brandId);
  const checks = s.seoChecks.filter((c) => c.websiteId === w.id);
  const groups = Array.from(new Set(checks.map((c) => c.group)));
  const contents = s.webContents.filter((c) => c.websiteId === w.id);
  const writers = Array.from(new Set(contents.map((c) => c.writer).filter(Boolean))) as string[];

  const filteredContents = contents.filter((c) =>
    (fStatus === "all" || c.status === fStatus) &&
    (fWriter === "all" || c.writer === fWriter) &&
    (fType === "all" || c.type === fType) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.mainKeyword || "").toLowerCase().includes(search.toLowerCase()))
  );

  const published = contents.filter((c) => DONE_STATUSES.includes(c.status));
  const optimizeContents = contents.filter((c) => c.type === "Bài tối ưu lại");

  const seoTotal = checks.length || 1;
  const seoDone = checks.filter((c) => c.done).length;
  const seoPct = Math.round((seoDone / seoTotal) * 100);

  const ovw = {
    total: contents.length,
    producing: contents.filter((c) => PRODUCING_STATUSES.includes(c.status)).length,
    review: contents.filter((c) => REVIEW_STATUSES.includes(c.status)).length,
    fix: contents.filter((c) => FIX_STATUSES.includes(c.status)).length,
    published: published.length,
    notIndexed: published.filter((c) => c.indexStatus !== "Đã index").length,
  };

  const waitingPublish = contents.filter((c) => c.status === "Chờ đăng web").length;

  // Entity & keyword stats for this website
  const entitiesList = s.entities.filter((e) => e.websiteId === w.id);
  const keywordsList = s.keywords.filter((k) => k.websiteId === w.id && isActiveKeywordTrack(k, s.webContents));
  // Visible Check TOP rows = main keywords on indexed contents + sub keywords + standalone tracks
  const indexedContents = contents.filter((c) => c.indexStatus === "Đã index");
  const splitSubsCount = (str?: string) =>
    (str || "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean).length;
  const checkTopMainCount = indexedContents.filter((c) => (c.mainKeyword || "").trim()).length;
  const checkTopSubCount = indexedContents.reduce((n, c) => n + splitSubsCount(c.subKeywords), 0);
  const checkTopStandalone = s.keywords.filter((k) => k.websiteId === w.id && !k.contentId).length;
  const checkTopVisibleCount = checkTopMainCount + checkTopSubCount + checkTopStandalone;
  const indexedNotShared = published.filter((c) => c.indexStatus === "Đã index" && !c.shareSocial).length;
  const sharedCount = published.filter((c) => c.shareSocial).length;
  const kwTop10 = keywordsList.filter((k) => k.currentTop != null && k.currentTop > 0 && k.currentTop <= 10).length;
  const kwUp = keywordsList.filter((k) => k.currentTop != null && k.previousTop != null && k.currentTop > 0 && k.currentTop < k.previousTop).length;
  const kwDown = keywordsList.filter((k) => k.currentTop != null && k.previousTop != null && k.currentTop > k.previousTop).length;


  return (
    <>
      <Link to="/websites" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" />Quay lại danh sách dự án web
      </Link>

      {/* Header dự án */}
      <Card className="mb-4 border-primary/20">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold leading-tight">{w.name}</h1>
                <StatusBadge value={w.status} />
              </div>
              {w.url && (
                <a href={w.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mt-1">
                  {w.url} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm pt-2 border-t">
            <div><span className="text-muted-foreground">Thương hiệu:</span> <span className="font-medium">{brand?.name || "—"}</span></div>
            <div><span className="text-muted-foreground">SEO:</span> <span className="font-medium">{w.seoOwner || "—"}</span></div>
            <div><span className="text-muted-foreground">Content:</span> <span className="font-medium">{w.contentOwner || "—"}</span></div>
            <div><span className="text-muted-foreground">Kỹ thuật:</span> <span className="font-medium">{w.techOwner || "—"}</span></div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="info">Thông tin dự án</TabsTrigger>
          {can("web.tech_view") && <TabsTrigger value="seo">Technical SEO ({seoDone}/{checks.length})</TabsTrigger>}
          {can("web.entity_view") && <TabsTrigger value="entity">Entity / Social SEO ({entitiesList.length})</TabsTrigger>}
          {can("web.content_view") && (
            <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
              Sản xuất Content ({contents.length})
            </TabsTrigger>
          )}
          {can("web.index_view") && <TabsTrigger value="published">Bài đã đăng / Index ({published.length})</TabsTrigger>}
          {can("web.backlink_view") && <TabsTrigger value="backlinks">Backlink / PR ({s.backlinks.filter((b) => b.websiteId === w.id).length})</TabsTrigger>}
          {can("web.checktop_view") && <TabsTrigger value="keywords">Check TOP từ khóa ({checkTopVisibleCount})</TabsTrigger>}
          {can("web.reopt_view") && <TabsTrigger value="optimize">Tối ưu lại Content ({optimizeContents.length})</TabsTrigger>}
          {can("web.keyword_view") && <TabsTrigger value="research">Nghiên Cứu Keyword ({s.webTopics.filter((t) => t.websiteId === w.id).length})</TabsTrigger>}
          {can("web.growth_view") && <TabsTrigger value="growth">Tăng Trưởng Website ({s.growth.filter((g) => g.websiteId === w.id).length})</TabsTrigger>}
          {can("web.report_view") && <TabsTrigger value="report">Báo Cáo</TabsTrigger>}
        </TabsList>

        {/* TAB 1 — THÔNG TIN DỰ ÁN */}
        <TabsContent value="info" className="mt-4 space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-base">Thông tin website</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Row k="Tên website" v={w.name} />
                <Row k="Link website" v={w.url ? <a href={w.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{w.url}</a> : "—"} />
                <Row k="Thương hiệu" v={brand?.name} />
                <Row k="Loại website" v={w.type} />
                <Row k="Mục tiêu website" v={w.goal} />
                <Row k="Trạng thái" v={<StatusBadge value={w.status} />} />
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-base">Đội ngũ & vận hành</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Row k="SEO phụ trách" v={w.seoOwner} />
                <Row k="Content phụ trách" v={w.contentOwner} />
                <Row k="Kỹ thuật phụ trách" v={w.techOwner} />
                <Row k="Ghi chú vận hành" v={w.notes} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <OvwCard icon={FileText} label="Tổng số content" v={ovw.total} />
            <OvwCard icon={RefreshCw} label="Đang sản xuất" v={ovw.producing} tone="info" />
            <OvwCard icon={AlertCircle} label="Chờ duyệt" v={ovw.review} tone="warn" />
            <OvwCard icon={AlertCircle} label="Cần sửa" v={ovw.fix} tone="danger" />
            <OvwCard icon={FileText} label="Chờ đăng" v={waitingPublish} tone="info" />
            <OvwCard icon={CheckCircle2} label="Đã đăng" v={ovw.published} tone="success" />
            <OvwCard icon={AlertCircle} label="Chưa index" v={ovw.notIndexed} tone="warn" />
            <Card><CardContent className="p-5">
              <div className="text-sm text-muted-foreground">Tiến độ Technical SEO</div>
              <div className="text-2xl font-semibold mt-1.5">{seoPct}%</div>
              <Progress value={seoPct} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">{seoDone}/{checks.length} mục</div>
            </CardContent></Card>
            <OvwCard icon={Users} label="Entity / Social SEO" v={entitiesList.length} tone="info" />
            <OvwCard icon={Share2} label="Đã index, chưa share" v={indexedNotShared} tone="warn" />
            <OvwCard icon={Share2} label="Đã share social" v={sharedCount} tone="success" />
            <OvwCard icon={TrendingUp} label="Từ khóa theo dõi" v={keywordsList.length} />
            <OvwCard icon={TrendingUp} label="Từ khóa Top 10" v={kwTop10} tone="success" />
            <OvwCard icon={TrendingUp} label="Tăng hạng" v={kwUp} tone="success" />
            <OvwCard icon={TrendingUp} label="Tụt hạng" v={kwDown} tone="danger" />
          </div>
        </TabsContent>

        {/* TAB ENTITY / SOCIAL SEO */}
        <TabsContent value="entity" className="mt-4">
          <EntitySocialTab websiteId={w.id} />
        </TabsContent>

        {/* TAB CHECK TOP TỪ KHÓA */}
        <TabsContent value="keywords" className="mt-4">
          <KeywordsTab websiteId={w.id} />
        </TabsContent>

        {/* TAB 2 — TECHNICAL SEO */}
        <TabsContent value="seo" className="mt-4">
          <TechnicalSeoTab websiteId={w.id} />
        </TabsContent>

        {/* TAB 3 — SẢN XUẤT CONTENT */}
        <TabsContent value="content" className="mt-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Input placeholder="Tìm bài..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {CONTENT_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fType} onValueChange={setFType}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fWriter} onValueChange={setFWriter}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Người viết" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người viết</SelectItem>
                {writers.map((wr) => <SelectItem key={wr} value={wr}>{wr}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
              <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4" />Table</Button>
              <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4" />Kanban</Button>
              <Button size="sm" variant={view === "calendar" ? "secondary" : "ghost"} onClick={() => setView("calendar")}><CalIcon className="h-4 w-4" />Lịch đăng</Button>
            </div>
            {can("web.content_create") && (
              <Dialog open={adding} onOpenChange={setAdding}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Thêm bài</Button></DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader><DialogTitle>Tạo bài content</DialogTitle></DialogHeader>
                  <ContentForm websiteId={w.id} brandId={w.brandId} onSubmit={(c) => s.add("webContents", c)} onClose={() => setAdding(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {view === "table" && <ContentTable contents={filteredContents} onOpen={setOpenContent} />}
          {view === "kanban" && <ContentKanban contents={filteredContents} onOpen={setOpenContent} />}
          {view === "calendar" && <ContentCalendar contents={filteredContents} onOpen={setOpenContent} />}
        </TabsContent>

        {/* TAB BÀI ĐÃ ĐĂNG / INDEX */}
        <TabsContent value="published" className="mt-4">
          <PublishedTab websiteId={w.id} entities={entitiesList} onOpenOptimize={setOpenOptimizeContent} />
        </TabsContent>

        {/* TAB BACKLINK / PR */}
        <TabsContent value="backlinks" className="mt-4">
          <BacklinksTab websiteId={w.id} />
        </TabsContent>

        {/* TAB 5 — OPTIMIZE */}
        <TabsContent value="optimize" className="mt-4">
          <div className="flex justify-end mb-3">
            <Dialog open={openOptimize} onOpenChange={setOpenOptimize}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Thêm bài tối ưu</Button></DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Tạo bài tối ưu lại</DialogTitle></DialogHeader>
                <OptimizeContentForm
                  websiteId={w.id}
                  brandId={w.brandId}
                  onSubmit={(c) => s.add("webContents", c)}
                  onClose={() => setOpenOptimize(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Tiêu đề bài</th>
                    <th className="text-left font-medium px-4 py-2.5">Nguồn tạo</th>
                    <th className="text-left font-medium px-4 py-2.5">Lý do tối ưu</th>
                    <th className="text-left font-medium px-4 py-2.5">Bài gốc / URL</th>
                    <th className="text-left font-medium px-4 py-2.5">Người phụ trách</th>
                    <th className="text-left font-medium px-4 py-2.5">Deadline</th>
                    <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                    <th className="text-left font-medium px-4 py-2.5">Lịch tiếp theo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {optimizeContents.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Chưa có bài cần tối ưu.</td></tr>}
                  {optimizeContents.map((c) => {
                    const link = c.oldLink || c.publishedLink || c.url;
                    return (
                      <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpenOptimizeContent(c)}>
                        <td className="px-4 py-2.5 font-medium">{c.title}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.optimizeSource || "Thủ công"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.optimizeReason || "—"}</td>
                        <td className="px-4 py-2.5">{link ? <a href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">Mở</a> : "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.writer || <span className="italic">Chưa phân công</span>}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.deadline ? fmtDate(c.deadline) : "—"}</td>
                        <td className="px-4 py-2.5"><StatusBadge value={c.status} /></td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.optimizeRecurring ? (c.optimizeRecurringPeriod || "—") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>


        {/* TAB NGHIÊN CỨU KEYWORD */}
        <TabsContent value="research" className="mt-4">
          <KeywordResearchTab websiteId={w.id} />
        </TabsContent>

        {/* TAB TĂNG TRƯỞNG WEBSITE */}
        <TabsContent value="growth" className="mt-4">
          <GrowthTab websiteId={w.id} />
        </TabsContent>

        {/* TAB BÁO CÁO */}
        <TabsContent value="report" className="mt-4">
          <BasicReportTab
            websiteId={w.id}
            onOpenContent={setOpenContent}
            onJumpTab={(t) => setTab(t)}
          />
        </TabsContent>
      </Tabs>

      <ContentDetail content={openContent} open={!!openContent} onClose={() => setOpenContent(null)} />
      <OptimizeContentDetail content={openOptimizeContent} open={!!openOptimizeContent} onClose={() => setOpenOptimizeContent(null)} />
    </>
  );
}

function ContentTable({ contents, onOpen }: { contents: WebContent[]; onOpen: (c: WebContent) => void }) {
  return (
    <Card><CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Tiêu đề</th>
              <th className="text-left font-medium px-4 py-2.5">Loại</th>
              <th className="text-left font-medium px-4 py-2.5">Từ khóa chính</th>
              <th className="text-left font-medium px-4 py-2.5">Người viết</th>
              <th className="text-left font-medium px-4 py-2.5">Deadline</th>
              <th className="text-left font-medium px-4 py-2.5">Đăng dự kiến</th>
              <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
              <th className="text-left font-medium px-4 py-2.5">Index</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contents.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Chưa có bài content.</td></tr>}
            {contents.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => onOpen(c)}>
                <td className="px-4 py-2.5 font-medium">
                  {c.title}
                  {c.plan && <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">[{c.plan}]</span>}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.type}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.mainKeyword || "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{c.writer || "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.deadline)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.publishDate)}</td>
                <td className="px-4 py-2.5"><StatusBadge value={c.status} /></td>
                <td className="px-4 py-2.5"><StatusBadge value={c.indexStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent></Card>
  );
}

function ContentKanban({ contents, onOpen }: { contents: WebContent[]; onOpen: (c: WebContent) => void }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {CONTENT_STATUSES.map((status) => {
          const items = contents.filter((c) => c.status === status);
          return (
            <div key={status} className="rounded-xl bg-muted/40 p-3 w-[260px] shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <StatusBadge value={status} />
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((c) => (
                  <button key={c.id} onClick={() => onOpen(c)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 transition-colors">
                    <div className="font-medium text-sm">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.writer || "—"} · {fmtDate(c.deadline)}</div>
                    {c.mainKeyword && <div className="text-[11px] text-muted-foreground mt-1">KW: {c.mainKeyword}</div>}
                  </button>
                ))}
                {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContentCalendar({ contents, onOpen }: { contents: WebContent[]; onOpen: (c: WebContent) => void }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const first = new Date(month);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
  const days = last.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));

  const itemsOn = (date: Date) => {
    const ds = date.toISOString().slice(0, 10);
    return contents.filter((c) => (c.publishedAt && c.publishedAt === ds) || (!c.publishedAt && c.publishDate === ds));
  };

  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Button size="sm" variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</Button>
        <div className="font-semibold">{month.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</div>
        <Button size="sm" variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
          <div key={d} className="text-center text-muted-foreground font-medium py-1">{d}</div>
        ))}
        {cells.map((date, i) => (
          <div key={i} className="min-h-[90px] rounded border bg-card p-1.5">
            {date && (
              <>
                <div className="text-[11px] text-muted-foreground mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {itemsOn(date).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onOpen(c)}
                      className="w-full text-left text-[11px] truncate rounded bg-primary/10 text-primary px-1.5 py-1 hover:bg-primary/20"
                      title={c.title}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </CardContent></Card>
  );
}

function OvwCard({ icon: Icon, label, v, tone = "default" }: any) {
  const tones: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground",
    info: "bg-info/15 text-info",
    warn: "bg-warning/15 text-[oklch(0.45_0.13_75)]",
    success: "bg-success/15 text-success",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <Card><CardContent className="p-5 flex items-start justify-between">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold mt-1.5 tracking-tight">{v}</div>
      </div>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardContent></Card>
  );
}

function Row({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground text-sm">{k}</span>
      <span className="font-medium text-right text-sm">{v || "—"}</span>
    </div>
  );
}

function WebsiteReport({
  contents, published, seoDone, seoTotal, seoGroups,
}: {
  contents: WebContent[];
  published: WebContent[];
  seoDone: number;
  seoTotal: number;
  seoGroups: { name: string; done: number; total: number }[];
}) {
  // Status distribution
  const byStatus = CONTENT_STATUSES.map((st) => ({
    status: st,
    count: contents.filter((c) => c.status === st).length,
  })).filter((x) => x.count > 0);
  const maxStatus = Math.max(1, ...byStatus.map((x) => x.count));

  // By writer
  const writerMap = new Map<string, { total: number; done: number }>();
  contents.forEach((c) => {
    const k = c.writer || "Chưa phân";
    const e = writerMap.get(k) || { total: 0, done: 0 };
    e.total++;
    if (DONE_STATUSES.includes(c.status)) e.done++;
    writerMap.set(k, e);
  });
  const byWriter = Array.from(writerMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);
  const maxWriter = Math.max(1, ...byWriter.map((x) => x.total));

  // Index status breakdown
  const idxList = ["Đã index", "Chưa index", "Chưa kiểm tra", "Cần xử lý"] as const;
  const idxStats = idxList.map((k) => ({
    name: k,
    count: published.filter((c) => (c.indexStatus || "Chưa kiểm tra") === k).length,
  }));
  const totalPub = Math.max(1, published.length);

  // Publish trend last 6 months
  const months: { key: string; label: string; count: number }[] = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleDateString("vi-VN", { month: "short", year: "2-digit" }),
      count: 0,
    });
  }
  published.forEach((c) => {
    const d = c.publishedAt || c.publishDate;
    if (!d) return;
    const key = d.slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.count++;
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  // Top keywords
  const kwMap = new Map<string, number>();
  contents.forEach((c) => {
    if (c.mainKeyword) kwMap.set(c.mainKeyword, (kwMap.get(c.mainKeyword) || 0) + 1);
  });
  const topKw = Array.from(kwMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const seoPct = Math.round((seoDone / Math.max(1, seoTotal)) * 100);

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5">
          <div className="text-sm text-muted-foreground">Tổng content đã sản xuất</div>
          <div className="text-2xl font-semibold mt-1.5">{contents.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-sm text-muted-foreground">Bài đã đăng</div>
          <div className="text-2xl font-semibold mt-1.5 text-success">{published.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-sm text-muted-foreground">Tỷ lệ index</div>
          <div className="text-2xl font-semibold mt-1.5">
            {Math.round((idxStats[0].count / totalPub) * 100)}%
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{idxStats[0].count}/{published.length} đã index</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-sm text-muted-foreground">Technical SEO</div>
          <div className="text-2xl font-semibold mt-1.5">{seoPct}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">{seoDone}/{seoTotal} mục</div>
        </CardContent></Card>
      </div>

      {/* Publish trend */}
      <Card>
        <CardHeader><CardTitle className="text-base">Bài đăng theo tháng (6 tháng gần nhất)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-44">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-xs font-medium">{m.count}</div>
                <div
                  className="w-full bg-primary/80 rounded-t-md transition-all"
                  style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? 4 : 0 }}
                />
                <div className="text-[11px] text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Status distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Phân bổ theo trạng thái</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byStatus.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Chưa có dữ liệu</div>}
            {byStatus.map((x) => (
              <div key={x.status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <StatusBadge value={x.status} />
                  <span className="font-medium">{x.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(x.count / maxStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Index breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tình trạng Index</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {published.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Chưa có bài đăng</div>}
            {published.length > 0 && idxStats.map((x) => (
              <div key={x.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{x.name}</span>
                  <span className="font-medium">{x.count} ({Math.round((x.count / totalPub) * 100)}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${x.name === "Đã index" ? "bg-success" : x.name === "Cần xử lý" ? "bg-destructive" : "bg-warning"}`}
                    style={{ width: `${(x.count / totalPub) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By writer */}
        <Card>
          <CardHeader><CardTitle className="text-base">Năng suất theo người viết</CardTitle></CardHeader>
          <CardContent>
            {byWriter.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Chưa có dữ liệu</div>}
            <div className="space-y-3">
              {byWriter.map((w) => (
                <div key={w.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{w.name}</span>
                    <span className="text-muted-foreground">{w.done}/{w.total} đã đăng</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-success" style={{ width: `${(w.done / maxWriter) * 100}%` }} />
                    <div className="h-full bg-primary/40" style={{ width: `${((w.total - w.done) / maxWriter) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical SEO breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Technical SEO theo nhóm</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {seoGroups.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Chưa có checklist</div>}
            {seoGroups.map((g) => {
              const pct = Math.round((g.done / Math.max(1, g.total)) * 100);
              return (
                <div key={g.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{g.name}</span>
                    <span className="font-medium">{g.done}/{g.total} ({pct}%)</span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top keywords */}
      <Card>
        <CardHeader><CardTitle className="text-base">Top từ khoá chính ({topKw.length})</CardTitle></CardHeader>
        <CardContent>
          {topKw.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Chưa có từ khoá</div>}
          <div className="flex flex-wrap gap-2">
            {topKw.map(([kw, n]) => (
              <span key={kw} className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs">
                <span className="font-medium">{kw}</span>
                <span className="text-muted-foreground">×{n}</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PublishedTab({ websiteId, entities, onOpenOptimize }: { websiteId: string; entities: { id: string; name: string }[]; onOpenOptimize: (c: WebContent) => void }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canSetSchedule = can("set_content_optimization_schedule");
  const canPauseSchedule = can("pause_content_optimization_schedule");
  const canCreateOpt = can("create_content_optimization");
  const all = s.webContents.filter((c) => c.websiteId === websiteId && DONE_STATUSES.includes(c.status));

  // Map nguồn → việc tối ưu đang mở (chưa hoàn thành)
  const OPEN_OPT_STATUSES: ContentStatus[] = [
    "Đã tạo", "Đã giao", "Đang tối ưu", "Chờ duyệt tối ưu",
    "Cần sửa tối ưu", "Đã duyệt tối ưu",
  ];
  const openOptBySource = useMemo(() => {
    const map = new Map<string, WebContent>();
    for (const c of s.webContents) {
      if (c.type !== "Bài tối ưu lại") continue;
      if (!c.sourceContentId) continue;
      if (!OPEN_OPT_STATUSES.includes(c.status)) continue;
      if (!map.has(c.sourceContentId)) map.set(c.sourceContentId, c);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.webContents]);

  const [createOptFor, setCreateOptFor] = useState<WebContent | null>(null);


  const SCHEDULE_OPTIONS = ["Không thiết lập", ...OPTIMIZE_RECURRING_PERIODS] as const;

  const handleScheduleChange = (c: WebContent, v: string) => {
    if (v === "Không thiết lập") {
      s.update("webContents", c.id, {
        optimizeRecurring: false,
        optimizeRecurringPeriod: undefined,
        nextOptimizeAt: undefined,
        optimizeScheduleTrackStatus: "Chưa thiết lập",
        optimizeScheduleSetAt: undefined,
      });
      return;
    }
    const period = v as OptimizeRecurringPeriod;
    const isIndexed = c.indexStatus === "Đã index";
    const base = todayISO();
    s.update("webContents", c.id, {
      optimizeRecurring: true,
      optimizeRecurringPeriod: period,
      optimizeScheduleSetAt: base,
      optimizeScheduleTrackStatus: isIndexed ? "Đang theo dõi" : "Chưa thiết lập",
      nextOptimizeAt: isIndexed ? computeNextOptimizeDate(base, period) : undefined,
    });
  };

  const handleTrackStatusChange = (c: WebContent, v: OptimizeScheduleTrackStatus) => {
    const isIndexed = c.indexStatus === "Đã index";
    const patch: Partial<WebContent> = { optimizeScheduleTrackStatus: v };
    if (v === "Đang theo dõi" && isIndexed && c.optimizeRecurringPeriod && !c.nextOptimizeAt) {
      patch.nextOptimizeAt = computeNextOptimizeDate(c.optimizeScheduleSetAt || todayISO(), c.optimizeRecurringPeriod);
    }
    s.update("webContents", c.id, patch);
  };

  const [search, setSearch] = useState("");
  const [fIdx, setFIdx] = useState("all");
  const [fShare, setFShare] = useState("all");
  const [fWriter, setFWriter] = useState("all");
  const [fPublisher, setFPublisher] = useState("all");
  const [fEntity, setFEntity] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [shareFrom, setShareFrom] = useState("");
  const [shareTo, setShareTo] = useState("");
  const [quick, setQuick] = useState("all");
  const [editShare, setEditShare] = useState<WebContent | null>(null);

  const writers = Array.from(new Set(all.map((c) => c.writer).filter(Boolean))) as string[];
  const publishers = Array.from(new Set(all.map((c) => c.publisher).filter(Boolean))) as string[];

  const filtered = useMemo(() => all.filter((c) => {
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
    need_reshare: all.filter((c) => c.shareSocialStatus === "Cần share lại").length,
  };

  const QF = ({ id, label, count }: { id: string; label: string; count: number }) => (
    <button
      onClick={() => setQuick(id)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${quick === id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
    >
      {label} <span className={quick === id ? "opacity-80" : "text-muted-foreground"}>({count})</span>
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <QF id="all" label="Tất cả" count={counts.all} />
        <QF id="indexed_not_shared" label="Đã index, chưa share" count={counts.indexed_not_shared} />
        <QF id="not_indexed" label="Chưa index" count={counts.not_indexed} />
        <QF id="shared" label="Đã share social" count={counts.shared} />
        <QF id="need_reshare" label="Cần share lại" count={counts.need_reshare} />
      </div>

      <Card><CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <Input className="h-9" placeholder="Tìm tiêu đề / từ khóa..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={fIdx} onValueChange={setFIdx}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Index" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Index: Tất cả</SelectItem>
              {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fShare} onValueChange={setFShare}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Share" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Share: Tất cả</SelectItem>
              {SHARE_SOCIAL_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fWriter} onValueChange={setFWriter}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Người viết" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Người viết: Tất cả</SelectItem>
              {writers.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fPublisher} onValueChange={setFPublisher}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Người đăng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Người đăng: Tất cả</SelectItem>
              {publishers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fEntity} onValueChange={setFEntity}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Entity share" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Entity: Tất cả</SelectItem>
              {entities.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 col-span-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Đăng:</span>
            <Input className="h-9" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input className="h-9" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Share:</span>
            <Input className="h-9" type="date" value={shareFrom} onChange={(e) => setShareFrom(e.target.value)} />
            <Input className="h-9" type="date" value={shareTo} onChange={(e) => setShareTo(e.target.value)} />
          </div>
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-3 py-2.5">Tiêu đề</th>
                <th className="text-left font-medium px-3 py-2.5">Link</th>
                <th className="text-left font-medium px-3 py-2.5">Từ khóa</th>
                <th className="text-left font-medium px-3 py-2.5">Ngày đăng</th>
                <th className="text-left font-medium px-3 py-2.5">Người viết</th>
                <th className="text-left font-medium px-3 py-2.5">Người đăng</th>
                <th className="text-left font-medium px-3 py-2.5">Index</th>
                <th className="text-center font-medium px-3 py-2.5">Share</th>
                <th className="text-left font-medium px-3 py-2.5">TT Share</th>
                <th className="text-left font-medium px-3 py-2.5">Ngày share</th>
                <th className="text-left font-medium px-3 py-2.5">Entity đã share</th>
                <th className="text-left font-medium px-3 py-2.5">Ghi chú</th>
                <th className="text-left font-medium px-3 py-2.5">Lịch tối ưu</th>
                <th className="text-left font-medium px-3 py-2.5">Tối ưu tiếp theo</th>
                <th className="text-left font-medium px-3 py-2.5">Theo dõi tối ưu</th>
                <th className="text-left font-medium px-3 py-2.5">Tối ưu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && <tr><td colSpan={16} className="px-4 py-12 text-center text-muted-foreground">Không có bài nào khớp bộ lọc.</td></tr>}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium max-w-[200px]">{c.title}</td>
                  <td className="px-3 py-2">
                    {c.publishedLink ? <a href={c.publishedLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /></a> : "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{c.mainKeyword || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{fmtDate(c.publishedAt || c.publishDate)}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{c.writer || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{c.publisher || "—"}</td>
                  <td className="px-3 py-2">
                    <Select value={c.indexStatus || "Chưa kiểm tra"} onValueChange={(v) => s.update("webContents", c.id, { indexStatus: v as any })}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Switch
                      checked={!!c.shareSocial}
                      onCheckedChange={(v) => s.update("webContents", c.id, {
                        shareSocial: v,
                        shareSocialStatus: v ? "Đã share" : "Chưa share",
                        shareSocialDate: v && !c.shareSocialDate ? todayISO() : c.shareSocialDate,
                      })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select value={c.shareSocialStatus || (c.shareSocial ? "Đã share" : "Chưa share")} onValueChange={(v) => s.update("webContents", c.id, { shareSocialStatus: v as any, shareSocial: v === "Đã share" ? true : v === "Chưa share" ? false : c.shareSocial })}>
                      <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SHARE_SOCIAL_STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input type="date" className="h-7 text-xs w-32" value={c.shareSocialDate || ""} onChange={(e) => s.update("webContents", c.id, { shareSocialDate: e.target.value })} />
                  </td>
                  <td className="px-3 py-2">
                    <button className="text-xs text-primary hover:underline text-left max-w-[180px] truncate block" onClick={() => setEditShare(c)}>
                      {c.sharedEntities || <span className="text-muted-foreground">+ Chọn entity</span>}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <Input className="h-7 text-xs w-40" value={c.shareNotes || c.indexNotes || ""} onChange={(e) => s.update("webContents", c.id, { shareNotes: e.target.value })} placeholder="—" />
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={c.optimizeRecurring && c.optimizeRecurringPeriod ? c.optimizeRecurringPeriod : "Không thiết lập"}
                      onValueChange={(v) => handleScheduleChange(c, v)}
                      disabled={!canSetSchedule}
                    >
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_OPTIONS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {c.optimizeRecurring && c.indexStatus !== "Đã index" && (
                      <div className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">Sẽ kích hoạt khi bài đã index.</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {c.nextOptimizeAt ? fmtDate(c.nextOptimizeAt) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={c.optimizeScheduleTrackStatus || "Chưa thiết lập"}
                      onValueChange={(v) => handleTrackStatusChange(c, v as OptimizeScheduleTrackStatus)}
                      disabled={!canPauseSchedule || !c.optimizeRecurring}
                    >
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Chưa thiết lập", "Đang theo dõi", "Tạm dừng"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <Dialog open={!!editShare} onOpenChange={(o) => !o && setEditShare(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Entity / Social đã share</DialogTitle></DialogHeader>
          {editShare && (
            <ShareEntitiesPicker
              entities={entities}
              value={editShare.sharedEntities || ""}
              onSave={(val) => { s.update("webContents", editShare.id, { sharedEntities: val }); setEditShare(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShareEntitiesPicker({
  entities, value, onSave,
}: {
  entities: { id: string; name: string }[];
  value: string;
  onSave: (val: string) => void;
}) {
  const initial = new Set(value.split(",").map((x) => x.trim()).filter(Boolean));
  const [sel, setSel] = useState<Set<string>>(initial);
  const toggle = (n: string) => {
    const next = new Set(sel);
    if (next.has(n)) next.delete(n); else next.add(n);
    setSel(next);
  };
  return (
    <div className="space-y-3">
      {entities.length === 0 && <div className="text-sm text-muted-foreground">Chưa có entity nào trong dự án này. Hãy thêm ở tab Entity / Social SEO.</div>}
      <div className="space-y-2 max-h-72 overflow-auto">
        {entities.map((e) => (
          <label key={e.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
            <Checkbox checked={sel.has(e.name)} onCheckedChange={() => toggle(e.name)} />
            <span className="text-sm">{e.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => onSave(Array.from(sel).join(", "))}>Lưu</Button>
      </div>
    </div>
  );
}
