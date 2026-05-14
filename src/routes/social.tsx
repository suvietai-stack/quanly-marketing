import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type SocialChannel, type SocialPost, type SocialStatus } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/social")({
  head: () => ({ meta: [{ title: "Kênh Social — Base Marketing" }] }),
  component: SocialPage,
});

const PLATFORMS = ["Facebook Page", "Facebook Group", "TikTok", "YouTube", "Instagram", "Zalo OA", "Khác"] as const;
const C_STATUS: SocialStatus[] = ["Ý tưởng", "Đang làm", "Chờ duyệt", "Cần sửa", "Đã duyệt", "Đã lên lịch", "Đã đăng", "Hoàn thành"];

function ChannelForm({ initial, onSubmit, onClose }: { initial?: Partial<SocialChannel>; onSubmit: (c: SocialChannel) => void; onClose: () => void }) {
  const { brands, people } = useStore();
  const [c, setC] = useState<SocialChannel>({
    id: initial?.id || uid(), name: initial?.name || "",
    platform: initial?.platform || "Facebook Page", url: initial?.url,
    brandId: initial?.brandId || brands[0]?.id || "", owner: initial?.owner,
    frequency: initial?.frequency, goal: initial?.goal,
    status: initial?.status || "Đang xây", notes: initial?.notes,
  });
  const set = (p: Partial<SocialChannel>) => setC({ ...c, ...p });
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><Label>Tên kênh *</Label><Input value={c.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div><Label>Nền tảng</Label>
        <Select value={c.platform} onValueChange={(v) => set({ platform: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={c.brandId} onValueChange={(v) => set({ brandId: v })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Người phụ trách</Label>
        <Select value={c.owner || "_"} onValueChange={(v) => set({ owner: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Link kênh</Label><Input value={c.url || ""} onChange={(e) => set({ url: e.target.value })} /></div>
      <div><Label>Tần suất đăng</Label><Input value={c.frequency || ""} onChange={(e) => set({ frequency: e.target.value })} placeholder="VD: 5 bài/tuần" /></div>
      <div><Label>Trạng thái</Label>
        <Select value={c.status} onValueChange={(v) => set({ status: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Đang xây","Đang vận hành","Đang tối ưu","Tạm dừng"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label>Mục tiêu kênh</Label><Textarea rows={2} value={c.goal || ""} onChange={(e) => set({ goal: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (c.name && c.brandId) { onSubmit(c); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function PostForm({ initial, onSubmit, onClose }: { initial?: Partial<SocialPost>; onSubmit: (p: SocialPost) => void; onClose: () => void }) {
  const { brands, socials, people, plans, topics } = useStore();
  const [p, setP] = useState<SocialPost>({
    id: initial?.id || uid(), title: initial?.title || "",
    brandId: initial?.brandId || brands[0]?.id || "",
    channelId: initial?.channelId || socials[0]?.id || "",
    platform: initial?.platform || socials.find(s => s.id === (initial?.channelId || socials[0]?.id))?.platform || "Facebook Page",
    contentType: initial?.contentType || "Bài ảnh đơn",
    topic: initial?.topic, plan: initial?.plan,
    writer: initial?.writer, designer: initial?.designer, reviewer: initial?.reviewer,
    scheduledDate: initial?.scheduledDate, publishedDate: initial?.publishedDate,
    caption: initial?.caption, mediaLink: initial?.mediaLink, publishedLink: initial?.publishedLink,
    status: initial?.status || "Ý tưởng", notes: initial?.notes,
  });
  const set = (x: Partial<SocialPost>) => setP({ ...p, ...x });
  const filteredCh = socials.filter(s => !p.brandId || s.brandId === p.brandId);
  return <>
    <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="sm:col-span-2"><Label>Tên bài đăng *</Label><Input value={p.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Thương hiệu</Label>
        <Select value={p.brandId} onValueChange={(v) => set({ brandId: v })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Kênh</Label>
        <Select value={p.channelId} onValueChange={(v) => { const ch = socials.find(s => s.id === v); set({ channelId: v, platform: ch?.platform || p.platform }); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{filteredCh.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Loại nội dung</Label>
        <Select value={p.contentType} onValueChange={(v) => set({ contentType: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Bài ảnh đơn","Album","Carousel","Text","Reels","TikTok Video","YouTube Shorts","Story","Livestream","Khác"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Trạng thái</Label>
        <Select value={p.status} onValueChange={(v) => set({ status: v as SocialStatus })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{C_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Người viết</Label>
        <Select value={p.writer || "_"} onValueChange={(v) => set({ writer: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Thiết kế / Video</Label>
        <Select value={p.designer || "_"} onValueChange={(v) => set({ designer: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Ngày dự kiến</Label><Input type="date" value={p.scheduledDate || ""} onChange={(e) => set({ scheduledDate: e.target.value })} /></div>
      <div><Label>Ngày đăng thực tế</Label><Input type="date" value={p.publishedDate || ""} onChange={(e) => set({ publishedDate: e.target.value })} /></div>
      <div><Label>Plan</Label>
        <Select value={p.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{plans.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Topic</Label>
        <Select value={p.topic || "_"} onValueChange={(v) => set({ topic: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{topics.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label>Caption / Nội dung</Label><Textarea rows={3} value={p.caption || ""} onChange={(e) => set({ caption: e.target.value })} /></div>
      <div><Label>Link ảnh / video</Label><Input value={p.mediaLink || ""} onChange={(e) => set({ mediaLink: e.target.value })} /></div>
      <div><Label>Link bài đã đăng</Label><Input value={p.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (p.title && p.channelId) { onSubmit(p); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function SocialPage() {
  const s = useStore();
  const [tab, setTab] = useState("channels");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fPlatform, setFPlatform] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [editingCh, setEditingCh] = useState<SocialChannel | null>(null);
  const [editingP, setEditingP] = useState<SocialPost | null>(null);
  const [addingCh, setAddingCh] = useState(false);
  const [addingP, setAddingP] = useState(false);

  const channels = useMemo(() => s.socials.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || c.brandId === fBrand) &&
    (fPlatform === "all" || c.platform === fPlatform)
  ), [s.socials, search, fBrand, fPlatform]);

  const posts = useMemo(() => s.socialPosts.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || p.brandId === fBrand) &&
    (fPlatform === "all" || p.platform === fPlatform) &&
    (fStatus === "all" || p.status === fStatus)
  ), [s.socialPosts, search, fBrand, fPlatform, fStatus]);

  return <>
    <PageHeader title="Kênh Social" description="Quản lý nhiều kênh social và sản xuất bài đăng cho từng kênh."
      actions={tab === "channels" ? (
        <Dialog open={addingCh} onOpenChange={setAddingCh}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm kênh</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Tạo kênh social</DialogTitle></DialogHeader>
            <ChannelForm onSubmit={(c) => s.add("socials", c)} onClose={() => setAddingCh(false)} /></DialogContent>
        </Dialog>
      ) : (
        <Dialog open={addingP} onOpenChange={setAddingP}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm bài</Button></DialogTrigger>
          <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Tạo bài social</DialogTitle></DialogHeader>
            <PostForm onSubmit={(p) => s.add("socialPosts", p)} onClose={() => setAddingP(false)} /></DialogContent>
        </Dialog>
      )} />
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList><TabsTrigger value="channels">Danh sách kênh</TabsTrigger><TabsTrigger value="posts">Tất cả bài đăng</TabsTrigger><TabsTrigger value="schedule">Lịch đăng</TabsTrigger></TabsList>

      <TabsContent value="channels" className="mt-4">
        <FilterBar>
          <Input placeholder="Tìm kênh..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
          <Select value={fPlatform} onValueChange={setFPlatform}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Nền tảng" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả nền tảng</SelectItem>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
        </FilterBar>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => {
            const brand = s.brands.find(b => b.id === c.brandId);
            const count = s.socialPosts.filter(p => p.channelId === c.id).length;
            return <Card key={c.id}><CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div><Link to="/social/$id" params={{ id: c.id }} className="font-semibold hover:text-primary">{c.name}</Link>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.platform} · {brand?.name}</div></div>
                <StatusBadge value={c.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-3">PT: {c.owner || "—"} · {c.frequency || "—"}</div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">{count} bài đăng</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditingCh(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => s.remove("socials", c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent></Card>;
          })}
        </div>
      </TabsContent>

      <TabsContent value="posts" className="mt-4">
        <FilterBar>
          <Input placeholder="Tìm bài đăng..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
          <Select value={fPlatform} onValueChange={setFPlatform}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Nền tảng" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả nền tảng</SelectItem>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{C_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        </FilterBar>
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Bài đăng</th><th className="text-left font-medium px-4 py-2.5">Kênh</th>
            <th className="text-left font-medium px-4 py-2.5">Loại</th><th className="text-left font-medium px-4 py-2.5">Lịch đăng</th>
            <th className="text-left font-medium px-4 py-2.5">Trạng thái</th><th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead>
          <tbody className="divide-y">
            {posts.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Chưa có bài đăng.</td></tr>}
            {posts.map((p) => (<tr key={p.id} className="hover:bg-muted/30">
              <td className="px-4 py-2.5 font-medium">{p.title}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{s.socials.find(c => c.id === p.channelId)?.name || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.contentType}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(p.scheduledDate)}</td>
              <td className="px-4 py-2.5"><StatusBadge value={p.status} /></td>
              <td className="px-4 py-2.5 text-right">
                <Button size="icon" variant="ghost" onClick={() => setEditingP(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => s.remove("socialPosts", p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </td>
            </tr>))}
          </tbody>
        </table></div></CardContent></Card>
      </TabsContent>

      <TabsContent value="schedule" className="mt-4">
        <Card><CardContent className="p-5">
          <div className="space-y-2">
            {s.socialPosts.filter(p => p.scheduledDate).sort((a,b) => (a.scheduledDate||"").localeCompare(b.scheduledDate||"")).map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30">
                <div><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground">{s.socials.find(c => c.id === p.channelId)?.name} · {p.platform}</div></div>
                <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{fmtDate(p.scheduledDate)}</span><StatusBadge value={p.status} /></div>
              </div>
            ))}
            {s.socialPosts.filter(p => p.scheduledDate).length === 0 && <div className="text-center text-muted-foreground py-8">Chưa có bài lên lịch.</div>}
          </div>
        </CardContent></Card>
      </TabsContent>
    </Tabs>

    <Dialog open={!!editingCh} onOpenChange={(o) => !o && setEditingCh(null)}>
      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa kênh</DialogTitle></DialogHeader>
        {editingCh && <ChannelForm initial={editingCh} onSubmit={(c) => s.update("socials", c.id, c)} onClose={() => setEditingCh(null)} />}</DialogContent>
    </Dialog>
    <Dialog open={!!editingP} onOpenChange={(o) => !o && setEditingP(null)}>
      <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Chỉnh sửa bài</DialogTitle></DialogHeader>
        {editingP && <PostForm initial={editingP} onSubmit={(p) => s.update("socialPosts", p.id, p)} onClose={() => setEditingP(null)} />}</DialogContent>
    </Dialog>
  </>;
}
