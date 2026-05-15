import { createFileRoute } from "@tanstack/react-router";
import { useStore, fmtDate, type Video, type VideoStatus, VIDEO_STATUSES } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { VideoFormDialog, VideoDetailDialog } from "@/components/VideoDetail";

export const Route = createFileRoute("/videos")({
  head: () => ({ meta: [{ title: "Sản Xuất Video — Base Marketing" }] }),
  component: VideosPage,
});

type ViewMode = "table" | "kanban" | "calendar";

function VideosPage() {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("video.create");
  const canEdit = can("video.edit");
  const canDelete = can("video.delete");

  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fOwner, setFOwner] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [opened, setOpened] = useState<Video | null>(null);

  const filtered = useMemo(() => s.videos.filter((v) =>
    (!search || v.title.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || v.brandId === fBrand) &&
    (fStatus === "all" || v.status === fStatus) &&
    (fOwner === "all" || v.owner === fOwner)
  ), [s.videos, search, fBrand, fStatus, fOwner]);

  return (
    <>
      <PageHeader
        title="Sản Xuất Video"
        description="Quản lý quy trình sản xuất video — kịch bản, footage, dựng, duyệt, bàn giao."
        actions={canCreate ? (
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1.5" />Thêm video
          </Button>
        ) : undefined}
      />

      <FilterBar>
        <Input placeholder="Tìm video..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{VIDEO_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fOwner} onValueChange={setFOwner}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả PT</SelectItem>{s.people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
          <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4 mr-1" />Table</Button>
          <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4 mr-1" />Kanban</Button>
          <Button size="sm" variant={view === "calendar" ? "secondary" : "ghost"} onClick={() => setView("calendar")}><CalendarIcon className="h-4 w-4 mr-1" />Lịch</Button>
        </div>
      </FilterBar>

      {view === "table" && (
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
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

      {view === "kanban" && (
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-3 min-w-max">
            {VIDEO_STATUSES.map((status) => {
              const items = filtered.filter((v) => v.status === status);
              return (
                <div key={status} className="rounded-xl bg-muted/40 p-3 w-[260px] shrink-0">
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

      {view === "calendar" && <CalendarView videos={filtered} brands={s.brands} onOpen={setOpened} />}

      <VideoFormDialog open={adding} onOpenChange={setAdding} onSubmit={(v) => s.add("videos", v)} />
      {editing && <VideoFormDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSubmit={(v) => s.update("videos", v.id, v)} />}
      {opened && <VideoDetailDialog open={!!opened} onOpenChange={(o) => !o && setOpened(null)} video={opened} />}
    </>
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
