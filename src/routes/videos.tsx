import { createFileRoute } from "@tanstack/react-router";
import { useStore, fmtDate, type Video, type VideoStatus, VIDEO_STATUSES } from "@/lib/store";
import { readOpenParam, syncOpenParam } from "@/lib/deep-link";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Clapperboard, UserRound, ChevronRight, Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { VideoFormDialog, VideoDetailDialog } from "@/components/VideoDetail";

export const Route = createFileRoute("/videos")({
  head: () => ({ meta: [{"title": "Sản Xuất Video — Base Sứ Việt"}, {"name": "description", "content": "Sản Xuất Video: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:title", "content": "Sản Xuất Video — Base Sứ Việt"}, {"property": "og:description", "content": "Sản Xuất Video: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <RequirePermission perm="video.view">
      <VideosPage />
    </RequirePermission>
  ),
});

type ViewMode = "table" | "kanban" | "calendar";

function VideosPage() {
  const s = useStore();
  const { user, can, scopeList } = useCurrentUser();
  const canCreate = can("video.create");
  const canEdit = can("video.edit");
  const canDelete = can("video.delete");
  const ME = user?.fullName || user?.username || "";

  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [fBrand, fStatus, fOwner].filter(v => v !== "all").length;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  // Deep link ?open=<id> (Trung tâm Phê duyệt): giữ id trên URL, lấy bản ghi mới nhất từ store.
  const [openId, setOpenId] = useState<string | null>(() => readOpenParam('open'));
  const setOpened = (v: Video | null) => { setOpenId(v?.id ?? null); syncOpenParam('open', v?.id ?? null); };
  const opened = openId ? s.videos.find((v) => v.id === openId) ?? null : null;

  const scopedVideos = useMemo(
    () => scopeList(s.videos, "video.view_all", "video.view_mine", (v) =>
      !!ME && (v.owner === ME || v.reviewer === ME)
    ),
    [s.videos, scopeList, ME]
  );

  const filtered = useMemo(() => scopedVideos.filter((v) =>
    (!search || v.title.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || v.brandId === fBrand) &&
    (fStatus === "all" || v.status === fStatus) &&
    (fOwner === "all" || v.owner === fOwner)
  ), [scopedVideos, search, fBrand, fStatus, fOwner]);

  return (
    <div className="videos-workspace min-w-0">
      <PageHeader
        title="Sản Xuất Video"
        description="Quản lý quy trình sản xuất video — kịch bản, footage, dựng, duyệt, bàn giao."
        actions={canCreate ? (
          <Button className="min-h-11 rounded-xl" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Thêm video
          </Button>
        ) : undefined}
      />

      <div className="video-toolbar rounded-2xl border bg-card p-3 mb-4 space-y-3">
        <div className="flex gap-2"><div className="relative flex-1 min-w-0"><Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm video" placeholder="Tìm tên video…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-10 text-base" /></div>
        <Button variant={activeFilters ? 'secondary' : 'outline'} className="min-h-11 rounded-xl md:hidden" aria-expanded={filtersOpen} aria-controls="video-filters" onClick={() => setFiltersOpen(v => !v)}><SlidersHorizontal className="h-4 w-4" />Lọc{activeFilters ? ` (${activeFilters})` : ''}</Button></div>
        <div id="video-filters" className={`${filtersOpen ? 'grid' : 'hidden'} grid-cols-1 gap-2 md:flex md:flex-wrap`}>

        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-full md:w-[200px] min-h-11 rounded-xl"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-full md:w-[200px] min-h-11 rounded-xl"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{VIDEO_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fOwner} onValueChange={setFOwner}>
          <SelectTrigger className="w-full md:w-[180px] min-h-11 rounded-xl"><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả PT</SelectItem>{s.people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        {activeFilters > 0 && <Button variant="ghost" className="min-h-11" onClick={() => {setFBrand('all'); setFStatus('all'); setFOwner('all');}}>Xóa bộ lọc</Button>}
        </div>
        <div className="video-view-switch grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} aria-pressed={view === "table"} onClick={() => setView("table")}><TableIcon className="h-4 w-4 mr-1" />Danh sách</Button>
          <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} aria-pressed={view === "kanban"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4 mr-1" />Tiến độ</Button>
          <Button size="sm" variant={view === "calendar" ? "secondary" : "ghost"} aria-pressed={view === "calendar"} onClick={() => setView("calendar")}><CalendarIcon className="h-4 w-4 mr-1" />Lịch</Button>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{filtered.length} video <span className="font-normal text-muted-foreground">/ {scopedVideos.length} trong phạm vi của bạn</span></p>{(search || activeFilters > 0) && <Button variant="ghost" size="sm" onClick={() => {setSearch('');setFBrand('all');setFStatus('all');setFOwner('all');}}>Đặt lại</Button>}</div>
      {filtered.length === 0 && <div className="rounded-2xl border border-dashed bg-card px-5 py-10 text-center"><Clapperboard className="mx-auto mb-3 h-9 w-9 text-muted-foreground" /><h2 className="font-semibold">{scopedVideos.length ? 'Không tìm thấy video phù hợp' : 'Chưa có video trong phạm vi của bạn'}</h2><p className="mt-2 text-sm text-muted-foreground">{scopedVideos.length ? 'Thử từ khóa khác hoặc đặt lại bộ lọc.' : 'Các video được giao sẽ xuất hiện tại đây.'}</p></div>}


      {view === "table" && filtered.length > 0 && <div className="grid gap-3 md:hidden">{filtered.map(v => {
        const link = v.finalLink || v.editLink || v.publishedLink;
        return <article key={v.id} className="video-mobile-card overflow-hidden rounded-2xl border bg-card shadow-soft">
          <button className="block w-full p-4 text-left" onClick={() => setOpened(v)}>
            <div className="mb-3 flex items-center justify-between gap-2"><span className="min-w-0 truncate text-xs font-medium text-muted-foreground">{s.brands.find(b => b.id === v.brandId)?.name || 'Chưa chọn thương hiệu'}</span><StatusBadge value={v.status} /></div>
            <h2 className="break-words text-base font-semibold leading-6">{v.title}</h2>
            {v.purpose && <p className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground">{v.purpose}</p>}
            <div className="mt-3 flex flex-wrap gap-2">{[v.channels,v.videoType].filter(Boolean).map((text,i) => <span key={i} className="rounded-lg bg-muted px-2 py-1 text-xs break-words">{text}</span>)}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3"><div className="min-w-0"><span className="block text-[11px] text-muted-foreground">Phụ trách</span><span className="mt-1 flex items-center gap-1.5 text-xs font-medium"><UserRound className="h-3.5 w-3.5 shrink-0" /><span className="break-words">{v.owner || 'Chưa phân công'}</span></span></div><div className="min-w-0"><span className="block text-[11px] text-muted-foreground">Hạn hoàn thành</span><span className="mt-1 block text-xs font-medium">{v.deadline ? fmtDate(v.deadline) : 'Chưa đặt hạn'}</span></div></div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs"><span className="min-w-0 truncate text-muted-foreground">Người duyệt: {v.reviewer || 'Chưa phân công'}</span><span className="inline-flex shrink-0 items-center text-primary">Chi tiết<ChevronRight className="h-4 w-4" /></span></div>
          </button>
          {(link || canEdit || canDelete) && <div className="flex flex-wrap items-center gap-1 border-t px-3 py-1">
            {link && <a href={link} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-medium text-primary"><ExternalLink className="h-4 w-4" />Mở video</a>}
            {canEdit && <Button variant="ghost" className="min-h-11 text-xs" onClick={() => setEditing(v)}><Pencil className="h-4 w-4" />Sửa</Button>}
            {canDelete && <Button variant="ghost" className="ml-auto min-h-11 text-xs text-destructive" aria-label={`Xóa video ${v.title}`} onClick={() => {if(confirm(`Xóa video "${v.title}"?`)) s.remove('videos',v.id);}}><Trash2 className="h-4 w-4" />Xóa</Button>}
          </div>}
        </article>;
      })}</div>}
      {view === "table" && filtered.length > 0 && (
        <Card className="hidden md:block"><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Tên video</th>
            <th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
            <th className="text-left font-medium px-4 py-2.5">Kênh</th>
            <th className="text-left font-medium px-4 py-2.5">Loại</th>
            <th className="text-left font-medium px-4 py-2.5">PT</th>
            <th className="text-left font-medium px-4 py-2.5">Duyệt</th>
            <th className="text-left font-medium px-4 py-2.5">Deadline</th>
            <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
            <th className="text-left font-medium px-4 py-2.5">Link</th>
            <th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead><tbody className="divide-y">
            {filtered.length === 0 && <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">Chưa có video.</td></tr>}
            {filtered.map((v) => {
              const link = v.finalLink || v.editLink || v.publishedLink;
              return (
                <tr key={v.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpened(v)}>
                  <td className="px-4 py-2.5 font-medium">{v.title}{v.purpose && <div className="text-xs text-muted-foreground">{v.purpose}</div>}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.brands.find((b) => b.id === v.brandId)?.name || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.channels || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.videoType || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{v.owner || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{v.reviewer || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(v.deadline)}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={v.status} /></td>
                  <td className="px-4 py-2.5">
                    {link ? <a href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center text-primary hover:underline text-xs"><ExternalLink className="h-3 w-3 mr-1" />Mở</a> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(v)}><Pencil className="h-3.5 w-3.5" /></Button>}
                    {canDelete && <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Xóa video "${v.title}"?`)) s.remove("videos", v.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>}
                  </td>
                </tr>
              );
            })}
          </tbody></table></div></CardContent></Card>
      )}

      {view === "kanban" && filtered.length > 0 && (
        <div className="video-board overflow-x-auto pb-3">
          <div className="video-board-columns flex gap-3 min-w-max">
            {VIDEO_STATUSES.map((status) => {
              const items = filtered.filter((v) => v.status === status);
              return (
                <div key={status} className="video-board-column rounded-xl bg-muted/40 p-3 w-[260px] shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <StatusBadge value={status} />
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((v) => (
                      <button key={v.id} onClick={() => setOpened(v)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 shadow-soft">
                        <div className="font-medium text-sm">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.brands.find(b => b.id === v.brandId)?.name || "—"} · {v.owner || "—"}
                        </div>
                        {v.deadline && <div className="text-xs text-muted-foreground mt-0.5">DL: {fmtDate(v.deadline)}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "calendar" && filtered.length > 0 && <CalendarView videos={filtered} brands={s.brands} onOpen={setOpened} />}

      <VideoFormDialog open={adding} onOpenChange={setAdding} onSubmit={(v) => s.add("videos", v)} />
      {editing && <VideoFormDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSubmit={(v) => s.update("videos", v.id, v)} />}
      {opened && <VideoDetailDialog open={!!opened} onOpenChange={(o) => !o && setOpened(null)} video={opened} />}
    </div>
  );
}

function CalendarView({ videos, brands, onOpen }: { videos: Video[]; brands: { id: string; name: string }[]; onOpen: (v: Video) => void }) {
  // Build a flat list of date events
  const events = useMemo(() => {
    const out: { date: string; label: string; video: Video; kind: "Kịch bản" | "Video" | "Đăng" }[] = [];
    for (const v of videos) {
      if (v.scriptDeadline) out.push({ date: v.scriptDeadline, label: "DL kịch bản", video: v, kind: "Kịch bản" });
      if (v.deadline) out.push({ date: v.deadline, label: "DL video", video: v, kind: "Video" });
      if (v.scheduledPublishDate) out.push({ date: v.scheduledPublishDate, label: "Dự kiến đăng", video: v, kind: "Đăng" });
    }
    return out.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [videos]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof events>();
    for (const e of events) {
      if (!m.has(e.date)) m.set(e.date, []);
      m.get(e.date)!.push(e);
    }
    return [...m.entries()];
  }, [events]);

  const kindColor: Record<string, string> = {
    "Kịch bản": "bg-info/15 text-info border-info/30",
    "Video": "bg-warning/20 text-[oklch(0.45_0.13_75)] border-warning/40",
    "Đăng": "bg-success/15 text-success border-success/30",
  };

  if (events.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có deadline nào được đặt.</CardContent></Card>;
  }

  return (
    <Card><CardContent className="p-4 space-y-3">
      {grouped.map(([date, items]) => (
        <div key={date} className="border rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">{fmtDate(date)}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((e, i) => (
              <button key={i} onClick={() => onOpen(e.video)} className="text-left rounded-md border p-2.5 hover:border-primary/40 bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs rounded-full border px-2 py-0.5 ${kindColor[e.kind]}`}>{e.label}</span>
                  <StatusBadge value={e.video.status} />
                </div>
                <div className="font-medium text-sm">{e.video.title}</div>
                <div className="text-xs text-muted-foreground">{brands.find(b => b.id === e.video.brandId)?.name || "—"} · {e.video.owner || "—"}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </CardContent></Card>
  );
}

