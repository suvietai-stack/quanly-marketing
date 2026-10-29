import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useStore, fmtDate, CONTENT_STATUSES, CONTENT_TYPES,
  type WebContent,
} from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/Common";
import { ContentForm } from "@/components/ContentForm";
import { ContentDetail, } from "@/components/ContentDetail";
import { ContentCalendar } from "@/routes/websites.$id";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus, LayoutGrid, Table as TableIcon, Calendar as CalIcon, ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/web-contents")({
  validateSearch: (s: Record<string, unknown>): { open?: string } => (typeof s.open === "string" && s.open ? { open: s.open } : {}),
  head: () => ({ meta: [{"title": "Tất cả Content Web — Base Sứ Việt"}, {"name": "description", "content": "Tất cả Content Web: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:title", "content": "Tất cả Content Web — Base Sứ Việt"}, {"property": "og:description", "content": "Tất cả Content Web: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <RequirePermission perm={["web.content_view", "web.content_view_all", "web.content_view_mine"]}>
      <AllContents />
    </RequirePermission>
  ),
});

function AllContents() {
  const s = useStore();
  const { user, can, scopeList } = useCurrentUser();
  const userName = user?.fullName || user?.username || "";
  const canCreate = can("web.content_create");
  const { webContents, websites, brands, plans, topics } = s;
  const [view, setView] = useState<"table" | "kanban" | "calendar">("table");
  const [adding, setAdding] = useState(false);
  const [openContent, setOpenContent] = useState<WebContent | null>(null);

  const { open: openId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [denied, setDenied] = useState(false);
  const [search, setSearch] = useState("");
  const [fWebsite, setFWebsite] = useState("all");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [fIndex, setFIndex] = useState("all");
  const [fPlan, setFPlan] = useState("all");
  const [fTopic, setFTopic] = useState("all");
  const [fWriter, setFWriter] = useState("all");

  const writers = Array.from(new Set(webContents.map((c) => c.writer).filter(Boolean))) as string[];

  const scoped = useMemo(
    () => scopeList(
      webContents,
      "web.content_view_all",
      "web.content_view_mine",
      (c) =>
        !!userName && (c.writer === userName || c.outlineReviewer === userName || c.draftReviewer === userName || c.publisher === userName || c.assigner === userName),
    ),
    [webContents, scopeList, userName],
  );

  // Mở trực tiếp từ thông báo: chỉ mở khi bài nằm trong phạm vi người dùng được xem
  useEffect(() => {
    if (!openId) return;
    const c = scoped.find((x) => x.id === openId);
    if (c) { setOpenContent(c); setDenied(false); }
    else if (webContents.length) setDenied(true);
  }, [openId, scoped, webContents.length]);
  useEffect(() => {
    if (openContent) setOpenContent(webContents.find((x) => x.id === openContent.id) ?? null);
  }, [webContents]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => scoped.filter((c) =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.mainKeyword || "").toLowerCase().includes(search.toLowerCase())) &&
    (fWebsite === "all" || c.websiteId === fWebsite) &&
    (fBrand === "all" || c.brandId === fBrand) &&
    (fStatus === "all" || c.status === fStatus) &&
    (fType === "all" || c.type === fType) &&
    (fIndex === "all" || c.indexStatus === fIndex) &&
    (fPlan === "all" || c.plan === fPlan) &&
    (fTopic === "all" || c.topic === fTopic) &&
    (fWriter === "all" || c.writer === fWriter)
  ), [scoped, search, fWebsite, fBrand, fStatus, fType, fIndex, fPlan, fTopic, fWriter]);

  return (
    <>
      <PageHeader
        title="Tất cả Content Web"
        description="Tổng hợp toàn bộ content của mọi website — leader xem nhanh tình hình sản xuất và xét duyệt."
        actions={canCreate ? (
          <Dialog open={adding} onOpenChange={setAdding}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Thêm bài</Button></DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader><DialogTitle>Tạo bài content</DialogTitle></DialogHeader>
              <ContentForm lockWebsite={false} onSubmit={(c) => s.add("webContents", c)} onClose={() => setAdding(false)} />
            </DialogContent>
          </Dialog>
        ) : undefined}
      />


      {denied && openId && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
          Bài viết không tồn tại hoặc bạn không có quyền xem.
          <button className="ml-2 underline" onClick={() => { setDenied(false); navigate({ search: {} }); }}>Đóng</button>
        </div>
      )}
      <FilterBar>
        <Input placeholder="Tìm tiêu đề, từ khóa..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={fWebsite} onValueChange={setFWebsite}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Website" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả website</SelectItem>{websites.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả TH</SelectItem>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{CONTENT_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fType} onValueChange={setFType}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Loại" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả loại</SelectItem>{CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fIndex} onValueChange={setFIndex}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Index" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả index</SelectItem>{["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fWriter} onValueChange={setFWriter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Người viết" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả người viết</SelectItem>{writers.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fPlan} onValueChange={setFPlan}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả plan</SelectItem>{plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fTopic} onValueChange={setFTopic}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Topic" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả topic</SelectItem>{topics.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4" />Table</Button>
          <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4" />Kanban</Button>
          <Button size="sm" variant={view === "calendar" ? "secondary" : "ghost"} onClick={() => setView("calendar")}><CalIcon className="h-4 w-4" />Lịch đăng</Button>
        </div>
      </FilterBar>

      {view === "table" && (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Tiêu đề</th>
                  <th className="text-left font-medium px-4 py-2.5">Website</th>
                  <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
                  <th className="text-left font-medium px-4 py-2.5">Loại</th>
                  <th className="text-left font-medium px-4 py-2.5">Người viết</th>
                  <th className="text-left font-medium px-4 py-2.5">Deadline</th>
                  <th className="text-left font-medium px-4 py-2.5">Đăng</th>
                  <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
                  <th className="text-left font-medium px-4 py-2.5">Index</th>
                  <th className="text-left font-medium px-4 py-2.5">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Không có content phù hợp.</td></tr>}
                {filtered.map((c) => {
                  const w = websites.find((x) => x.id === c.websiteId);
                  const b = brands.find((x) => x.id === c.brandId);
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpenContent(c)}>
                      <td className="px-4 py-2.5 font-medium">{c.title}{c.mainKeyword && <div className="text-xs text-muted-foreground">KW: {c.mainKeyword}</div>}</td>
                      <td className="px-4 py-2.5"><Link to="/websites/$id" params={{ id: c.websiteId }} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary">{w?.name || "—"}</Link></td>
                      <td className="px-4 py-2.5 text-muted-foreground">{b?.name || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.type}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.writer || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.deadline)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(c.publishedAt || c.publishDate)}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={c.status} /></td>
                      <td className="px-4 py-2.5"><StatusBadge value={c.indexStatus} /></td>
                      <td className="px-4 py-2.5">
                        {c.publishedLink
                          ? <a href={c.publishedLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary hover:underline inline-flex items-center gap-1">Mở<ExternalLink className="h-3 w-3" /></a>
                          : c.draftLink
                            ? <a href={c.draftLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">Bài<ExternalLink className="h-3 w-3" /></a>
                            : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}

      {view === "kanban" && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {CONTENT_STATUSES.map((status) => {
              const items = filtered.filter((c) => c.status === status);
              return (
                <div key={status} className="rounded-xl bg-muted/40 p-3 w-[260px] shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <StatusBadge value={status} /><span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((c) => {
                      const w = websites.find((x) => x.id === c.websiteId);
                      return (
                        <button key={c.id} onClick={() => setOpenContent(c)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40">
                          <div className="font-medium text-sm">{c.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{w?.name} · {c.writer || "—"}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(c.deadline)}</div>
                        </button>
                      );
                    })}
                    {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">—</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "calendar" && <ContentCalendar contents={filtered} onOpen={setOpenContent} />}

      <ContentDetail content={openContent} open={!!openContent} onClose={() => { setOpenContent(null); if (openId) navigate({ search: {} }); }} />
    </>
  );
}
