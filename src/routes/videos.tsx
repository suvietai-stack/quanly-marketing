import { createFileRoute } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type Video, type VideoStatus } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, LayoutGrid, Table as TableIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/videos")({
  head: () => ({ meta: [{ title: "Sản Xuất Video — Base Marketing" }] }),
  component: VideosPage,
});

const V_STATUS: VideoStatus[] = ["Ý tưởng", "Đang sản xuất", "Chờ duyệt", "Cần sửa", "Đã bàn giao", "Hoàn thành"];

function VideoForm({ initial, onSubmit, onClose }: { initial?: Partial<Video>; onSubmit: (v: Video) => void; onClose: () => void }) {
  const { brands, people, plans, topics } = useStore();
  const [v, setV] = useState<Video>({
    id: initial?.id || uid(), title: initial?.title || "",
    brandId: initial?.brandId || brands[0]?.id || "",
    channels: initial?.channels, purpose: initial?.purpose,
    owner: initial?.owner, reviewer: initial?.reviewer,
    deadline: initial?.deadline, scriptLink: initial?.scriptLink,
    footageLink: initial?.footageLink, editLink: initial?.editLink,
    finalLink: initial?.finalLink, publishedLink: initial?.publishedLink,
    status: initial?.status || "Ý tưởng",
    plan: initial?.plan, topic: initial?.topic, notes: initial?.notes,
  });
  const set = (x: Partial<Video>) => setV({ ...v, ...x });
  const ps = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(x) => on(x === "_" ? undefined : x)}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select>
  );
  return <>
    <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="sm:col-span-2"><Label>Tên video *</Label><Input value={v.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={v.brandId} onValueChange={(x) => set({ brandId: x })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Trạng thái</Label>
        <Select value={v.status} onValueChange={(x) => set({ status: x as VideoStatus })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{V_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Kênh sử dụng</Label><Input value={v.channels || ""} onChange={(e) => set({ channels: e.target.value })} placeholder="TikTok, YouTube..." /></div>
      <div><Label>Mục đích</Label><Input value={v.purpose || ""} onChange={(e) => set({ purpose: e.target.value })} /></div>
      <div><Label>Người PT</Label>{ps(v.owner, (x) => set({ owner: x }))}</div>
      <div><Label>Người duyệt</Label>{ps(v.reviewer, (x) => set({ reviewer: x }))}</div>
      <div><Label>Deadline</Label><Input type="date" value={v.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} /></div>
      <div><Label>Plan</Label>
        <Select value={v.plan || "_"} onValueChange={(x) => set({ plan: x === "_" ? undefined : x })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Topic</Label>
        <Select value={v.topic || "_"} onValueChange={(x) => set({ topic: x === "_" ? undefined : x })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{topics.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Link kịch bản</Label><Input value={v.scriptLink || ""} onChange={(e) => set({ scriptLink: e.target.value })} /></div>
      <div><Label>Link footage</Label><Input value={v.footageLink || ""} onChange={(e) => set({ footageLink: e.target.value })} /></div>
      <div><Label>Link bản dựng</Label><Input value={v.editLink || ""} onChange={(e) => set({ editLink: e.target.value })} /></div>
      <div><Label>Link video hoàn thiện</Label><Input value={v.finalLink || ""} onChange={(e) => set({ finalLink: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Link video đã đăng</Label><Input value={v.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Ghi chú</Label><Textarea rows={2} value={v.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (v.title.trim() && v.brandId) { onSubmit(v); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function VideosPage() {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("video.create");
  const canEdit = can("video.edit");
  const canDelete = can("video.delete");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [editing, setEditing] = useState<Video | null>(null);
  const [adding, setAdding] = useState(false);
  const filtered = useMemo(() => s.videos.filter((v) =>
    (!search || v.title.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || v.brandId === fBrand) &&
    (fStatus === "all" || v.status === fStatus)
  ), [s.videos, search, fBrand, fStatus]);

  return <>
    <PageHeader title="Sản Xuất Video" description="Quản lý các đầu việc sản xuất video phục vụ social, web, ads."
      actions={canCreate ? <Dialog open={adding} onOpenChange={setAdding}>
        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm video</Button></DialogTrigger>
        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Tạo video</DialogTitle></DialogHeader>
          <VideoForm onSubmit={(v) => s.add("videos", v)} onClose={() => setAdding(false)} /></DialogContent>
      </Dialog> : undefined} />
    <FilterBar>
      <Input placeholder="Tìm video..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
      <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{V_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
        <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4 mr-1" />Table</Button>
        <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4 mr-1" />Kanban</Button>
      </div>
    </FilterBar>

    {view === "table" ? (
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Tên video</th><th className="text-left font-medium px-4 py-2.5">Thương hiệu</th>
          <th className="text-left font-medium px-4 py-2.5">PT</th><th className="text-left font-medium px-4 py-2.5">Deadline</th>
          <th className="text-left font-medium px-4 py-2.5">Trạng thái</th><th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead><tbody className="divide-y">
          {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Chưa có video.</td></tr>}
          {filtered.map((v) => (<tr key={v.id} className="hover:bg-muted/30">
            <td className="px-4 py-2.5 font-medium">{v.title}{v.purpose && <div className="text-xs text-muted-foreground">{v.purpose}</div>}</td>
            <td className="px-4 py-2.5 text-muted-foreground">{s.brands.find((b) => b.id === v.brandId)?.name || "—"}</td>
            <td className="px-4 py-2.5 text-muted-foreground">{v.owner || "—"}</td>
            <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(v.deadline)}</td>
            <td className="px-4 py-2.5"><StatusBadge value={v.status} /></td>
            <td className="px-4 py-2.5 text-right">
              {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(v)}><Pencil className="h-3.5 w-3.5" /></Button>}
              {canDelete && <Button size="icon" variant="ghost" onClick={() => s.remove("videos", v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
            </td>
          </tr>))}
        </tbody></table></div></CardContent></Card>
    ) : (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {V_STATUS.map((status) => {
          const items = filtered.filter((v) => v.status === status);
          return <div key={status} className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between mb-3 px-1"><StatusBadge value={status} /><span className="text-xs text-muted-foreground">{items.length}</span></div>
            <div className="space-y-2">{items.map((v) => (
              <button key={v.id} onClick={() => setEditing(v)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 shadow-soft">
                <div className="font-medium text-sm">{v.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.brands.find(b => b.id === v.brandId)?.name} · {fmtDate(v.deadline)}</div>
              </button>))}</div>
          </div>;
        })}
      </div>
    )}

    <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
      <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Chỉnh sửa video</DialogTitle></DialogHeader>
        {editing && <VideoForm initial={editing} onSubmit={(v) => s.update("videos", v.id, v)} onClose={() => setEditing(null)} />}</DialogContent>
    </Dialog>
  </>;
}
