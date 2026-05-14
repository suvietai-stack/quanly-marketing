import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useStore, fmtDate, ensureSeoChecks,
  CONTENT_STATUSES, CONTENT_TYPES,
  type WebContent, type ContentStatus,
} from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";

import { ContentForm } from "@/components/ContentForm";
import { ContentDetail } from "@/components/ContentDetail";
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
import {
  ArrowLeft, ExternalLink, Plus, LayoutGrid, Table as TableIcon, Calendar as CalIcon,
  Globe, ListChecks, FileText, CheckCircle2, AlertCircle, RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/websites/$id")({
  head: () => ({ meta: [{ title: "Chi tiết website — Base Marketing" }] }),
  component: WebsiteDetail,
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
  const w = s.websites.find((x) => x.id === id);
  const [view, setView] = useState<"table" | "kanban" | "calendar">("table");
  const [adding, setAdding] = useState(false);
  const [openContent, setOpenContent] = useState<WebContent | null>(null);
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

  return (
    <>
      <Link to="/websites" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" />Tất cả website
      </Link>
      <PageHeader
        title={w.name}
        description={`${brand?.name || ""} · ${w.type}`}
        actions={
          <>
            {w.url && (
              <Button variant="outline" asChild>
                <a href={w.url} target="_blank" rel="noreferrer">Mở website <ExternalLink className="h-3.5 w-3.5" /></a>
              </Button>
            )}
            <StatusBadge value={w.status} />
          </>
        }
      />

      {/* Header summary card */}
      <Card className="mb-4">
        <CardContent className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div><span className="text-muted-foreground">Thương hiệu:</span> <span className="font-medium">{brand?.name || "—"}</span></div>
          <div><span className="text-muted-foreground">SEO phụ trách:</span> <span className="font-medium">{w.seoOwner || "—"}</span></div>
          <div><span className="text-muted-foreground">Content phụ trách:</span> <span className="font-medium">{w.contentOwner || "—"}</span></div>
          <div><span className="text-muted-foreground">Kỹ thuật:</span> <span className="font-medium">{w.techOwner || "—"}</span></div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="profile">Hồ sơ Website</TabsTrigger>
          <TabsTrigger value="seo">Technical SEO ({seoDone}/{checks.length})</TabsTrigger>
          <TabsTrigger value="content">Sản xuất Content ({contents.length})</TabsTrigger>
          <TabsTrigger value="published">Bài đã đăng / Index ({published.length})</TabsTrigger>
          <TabsTrigger value="optimize">Tối ưu lại ({optimizeContents.length})</TabsTrigger>
          <TabsTrigger value="report">Báo cáo Web</TabsTrigger>
        </TabsList>

        {/* TỔNG QUAN */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <OvwCard icon={FileText} label="Tổng số content" v={ovw.total} />
            <OvwCard icon={RefreshCw} label="Đang sản xuất" v={ovw.producing} tone="info" />
            <OvwCard icon={AlertCircle} label="Chờ duyệt" v={ovw.review} tone="warn" />
            <OvwCard icon={AlertCircle} label="Cần sửa" v={ovw.fix} tone="danger" />
            <OvwCard icon={CheckCircle2} label="Đã đăng" v={ovw.published} tone="success" />
            <OvwCard icon={AlertCircle} label="Chưa index" v={ovw.notIndexed} tone="warn" />
            <Card className="col-span-2"><CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Technical SEO Checklist</div>
                <div className="text-sm font-semibold">{seoDone}/{checks.length} ({seoPct}%)</div>
              </div>
              <Progress value={seoPct} />
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* HỒ SƠ */}
        <TabsContent value="profile" className="mt-4 grid lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Thông tin website</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Row k="Tên website" v={w.name} />
              <Row k="Link" v={w.url ? <a href={w.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{w.url}</a> : "—"} />
              <Row k="Thương hiệu" v={brand?.name} />
              <Row k="Loại website" v={w.type} />
              <Row k="Trạng thái" v={<StatusBadge value={w.status} />} />
              <Row k="Mục tiêu" v={w.goal} />
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-base">Đội ngũ phụ trách</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Row k="SEO phụ trách" v={w.seoOwner} />
              <Row k="Content phụ trách" v={w.contentOwner} />
              <Row k="Kỹ thuật phụ trách" v={w.techOwner} />
              <Row k="Ghi chú" v={w.notes} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNICAL SEO */}
        <TabsContent value="seo" className="mt-4 space-y-4">
          <Card><CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Tiến độ Technical SEO</div>
              <div className="text-sm text-muted-foreground">{seoDone}/{checks.length} ({seoPct}%)</div>
            </div>
            <Progress value={seoPct} />
          </CardContent></Card>
          {groups.map((g) => {
            const items = checks.filter((c) => c.group === g);
            const done = items.filter((c) => c.done).length;
            const pct = Math.round((done / (items.length || 1)) * 100);
            return (
              <Card key={g}>
                <CardHeader className="flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{g}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-0.5">{done}/{items.length} hoàn thành</div>
                  </div>
                  <div className="w-32"><Progress value={pct} /></div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-start gap-3 px-5 py-2.5 hover:bg-muted/30">
                        <Checkbox checked={it.done} onCheckedChange={(v) => s.update("seoChecks", it.id, { done: !!v, checkedAt: v ? new Date().toISOString().slice(0, 10) : undefined })} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.name}</div>
                          <div className="grid sm:grid-cols-2 gap-2 mt-1.5">
                            <Input className="h-8 text-xs" placeholder="Ghi chú..." value={it.notes || ""} onChange={(e) => s.update("seoChecks", it.id, { notes: e.target.value })} />
                            <Input className="h-8 text-xs" placeholder="Link minh chứng..." value={it.proofLink || ""} onChange={(e) => s.update("seoChecks", it.id, { proofLink: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* SẢN XUẤT CONTENT */}
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
            <Dialog open={adding} onOpenChange={setAdding}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Thêm bài</Button></DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Tạo bài content</DialogTitle></DialogHeader>
                <ContentForm websiteId={w.id} brandId={w.brandId} onSubmit={(c) => s.add("webContents", c)} onClose={() => setAdding(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {view === "table" && <ContentTable contents={filteredContents} onOpen={setOpenContent} />}
          {view === "kanban" && <ContentKanban contents={filteredContents} onOpen={setOpenContent} />}
          {view === "calendar" && <ContentCalendar contents={filteredContents} onOpen={setOpenContent} />}
        </TabsContent>

        {/* PUBLISHED / INDEX */}
        <TabsContent value="published" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Bài viết</th>
                    <th className="text-left font-medium px-4 py-2.5">Từ khóa chính</th>
                    <th className="text-left font-medium px-4 py-2.5">Người viết</th>
                    <th className="text-left font-medium px-4 py-2.5">Người đăng</th>
                    <th className="text-left font-medium px-4 py-2.5">Ngày đăng</th>
                    <th className="text-left font-medium px-4 py-2.5">Index</th>
                    <th className="text-left font-medium px-4 py-2.5">Link</th>
                    <th className="text-right font-medium px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {published.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Chưa có bài đăng nào.</td></tr>}
                  {published.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">
                        <button className="text-left hover:text-primary" onClick={() => setOpenContent(c)}>{c.title}</button>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.mainKeyword || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.writer || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.publisher || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.publishedAt || c.publishDate)}</td>
                      <td className="px-4 py-2.5">
                        <Select value={c.indexStatus} onValueChange={(v) => s.update("webContents", c.id, { indexStatus: v as any })}>
                          <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2.5">
                        {c.publishedLink ? <a href={c.publishedLink} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Mở <ExternalLink className="h-3 w-3" /></a> : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setOpenContent(c)}>Chi tiết</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* OPTIMIZE */}
        <TabsContent value="optimize" className="mt-4">
          <div className="flex justify-end mb-3">
            <Dialog>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Thêm bài tối ưu</Button></DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Tạo bài tối ưu lại</DialogTitle></DialogHeader>
                <ContentForm
                  websiteId={w.id}
                  brandId={w.brandId}
                  initial={{ type: "Bài tối ưu lại" }}
                  onSubmit={(c) => s.add("webContents", c)}
                  onClose={() => {}}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Tiêu đề</th>
                    <th className="text-left font-medium px-4 py-2.5">Lý do tối ưu</th>
                    <th className="text-left font-medium px-4 py-2.5">Bài cũ</th>
                    <th className="text-left font-medium px-4 py-2.5">Người phụ trách</th>
                    <th className="text-left font-medium px-4 py-2.5">Deadline</th>
                    <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {optimizeContents.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Chưa có bài cần tối ưu.</td></tr>}
                  {optimizeContents.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpenContent(c)}>
                      <td className="px-4 py-2.5 font-medium">{c.title}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.optimizeReason || "—"}</td>
                      <td className="px-4 py-2.5">{c.oldLink ? <a href={c.oldLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">Mở</a> : "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.writer || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.deadline)}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* REPORT */}
        <TabsContent value="report" className="mt-4">
          <WebsiteReport
            contents={contents}
            published={published}
            seoDone={seoDone}
            seoTotal={checks.length}
            seoGroups={groups.map((g) => {
              const items = checks.filter((c) => c.group === g);
              return { name: g, done: items.filter((i) => i.done).length, total: items.length };
            })}
          />
        </TabsContent>
      </Tabs>

      <ContentDetail content={openContent} open={!!openContent} onClose={() => setOpenContent(null)} />
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
