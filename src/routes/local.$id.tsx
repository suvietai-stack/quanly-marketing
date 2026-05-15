import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type MapPost, type MapReview, type SocialStatus } from "@/lib/store";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ComingSoon } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/local/$id")({
  head: () => ({ meta: [{ title: "Chi tiết địa điểm — Base Marketing" }] }),
  component: PlaceDetail,
});

const M_STATUS: SocialStatus[] = ["Kế hoạch", "Đang làm", "Chờ duyệt", "Cần sửa", "Đã duyệt", "Chờ đăng", "Đã đăng", "Hoàn thành"];

function PostForm({ placeId, brandId, initial, onSubmit, onClose }: any) {
  const { people, plans, topics } = useStore();
  const [p, setP] = useState<MapPost>({
    id: initial?.id || uid(), title: initial?.title || "", placeId, brandId,
    content: initial?.content, type: initial?.type || "Cập nhật", owner: initial?.owner,
    scheduledDate: initial?.scheduledDate, publishedDate: initial?.publishedDate,
    imageLink: initial?.imageLink, publishedLink: initial?.publishedLink,
    status: initial?.status || "Ý tưởng", plan: initial?.plan, topic: initial?.topic, notes: initial?.notes,
  });
  const set = (x: Partial<MapPost>) => setP({ ...p, ...x });
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Label>Tên bài đăng *</Label><Input value={p.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Loại</Label>
        <Select value={p.type} onValueChange={(v) => set({ type: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Cập nhật","Sản phẩm","Ưu đãi","Sự kiện","Khác"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Trạng thái</Label>
        <Select value={p.status} onValueChange={(v) => set({ status: v as SocialStatus })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{M_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Người PT</Label>
        <Select value={p.owner || "_"} onValueChange={(v) => set({ owner: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Ngày dự kiến</Label><Input type="date" value={p.scheduledDate || ""} onChange={(e) => set({ scheduledDate: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Nội dung</Label><Textarea rows={3} value={p.content || ""} onChange={(e) => set({ content: e.target.value })} /></div>
      <div><Label>Link ảnh</Label><Input value={p.imageLink || ""} onChange={(e) => set({ imageLink: e.target.value })} /></div>
      <div><Label>Link bài đăng</Label><Input value={p.publishedLink || ""} onChange={(e) => set({ publishedLink: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (p.title.trim()) { onSubmit(p); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function ReviewForm({ placeId, initial, onSubmit, onClose }: any) {
  const { people } = useStore();
  const [r, setR] = useState<MapReview>({
    id: initial?.id || uid(), placeId, reviewer: initial?.reviewer || "", stars: initial?.stars || 5,
    content: initial?.content, date: initial?.date, responseStatus: initial?.responseStatus || "Chưa phản hồi",
    responder: initial?.responder, notes: initial?.notes,
  });
  const set = (x: Partial<MapReview>) => setR({ ...r, ...x });
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><Label>Tên người đánh giá *</Label><Input value={r.reviewer} onChange={(e) => set({ reviewer: e.target.value })} /></div>
      <div><Label>Số sao</Label><Input type="number" min={1} max={5} value={r.stars} onChange={(e) => set({ stars: Number(e.target.value) })} /></div>
      <div><Label>Ngày</Label><Input type="date" value={r.date || ""} onChange={(e) => set({ date: e.target.value })} /></div>
      <div><Label>Trạng thái phản hồi</Label>
        <Select value={r.responseStatus} onValueChange={(v) => set({ responseStatus: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Chưa phản hồi","Đã phản hồi"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label>Người phản hồi</Label>
        <Select value={r.responder || "_"} onValueChange={(v) => set({ responder: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="sm:col-span-2"><Label>Nội dung review</Label><Textarea rows={3} value={r.content || ""} onChange={(e) => set({ content: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (r.reviewer.trim()) { onSubmit(r); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function PlaceDetail() {
  const { id } = Route.useParams();
  const s = useStore();
  const place = s.places.find((p) => p.id === id);
  const [addingPost, setAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<MapPost | null>(null);
  const [addingReview, setAddingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<MapReview | null>(null);
  if (!place) return <div className="p-10 text-center">Không tìm thấy. <Link to="/local" className="text-primary">Quay lại</Link></div>;
  const brand = s.brands.find((b) => b.id === place.brandId);
  const posts = s.mapPosts.filter((p) => p.placeId === place.id);
  const reviews = s.reviews.filter((r) => r.placeId === place.id);

  return <>
    <Link to="/local" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4 mr-1" />Tất cả địa điểm</Link>
    <PageHeader title={place.name} description={`${brand?.name || "—"} · ${place.address || ""}`} actions={<StatusBadge value={place.verifyStatus} />} />
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="overview">Hồ sơ</TabsTrigger>
        <TabsTrigger value="posts">Lịch đăng ({posts.length})</TabsTrigger>
        <TabsTrigger value="reviews">Review ({reviews.length})</TabsTrigger>
        <TabsTrigger value="report">Báo cáo Local</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Thông tin</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <Row k="Địa chỉ" v={place.address} /><Row k="SĐT" v={place.phone} /><Row k="Link Map" v={place.mapLink} />
          <Row k="Thương hiệu" v={brand?.name} /><Row k="PT" v={place.owner} /><Row k="Xác minh" v={<StatusBadge value={place.verifyStatus} />} />
        </CardContent></Card>
      </TabsContent>
      <TabsContent value="posts" className="mt-4">
        <div className="flex justify-end mb-3"><Dialog open={addingPost} onOpenChange={setAddingPost}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm bài</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Tạo bài Map</DialogTitle></DialogHeader>
            <PostForm placeId={place.id} brandId={place.brandId} onSubmit={(p: MapPost) => s.add("mapPosts", p)} onClose={() => setAddingPost(false)} /></DialogContent>
        </Dialog></div>
        <Card><CardContent className="p-0"><table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
            <th className="text-left font-medium px-4 py-2.5">Bài</th><th className="text-left font-medium px-4 py-2.5">Loại</th>
            <th className="text-left font-medium px-4 py-2.5">Lịch</th><th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
            <th className="text-right font-medium px-4 py-2.5"></th>
          </tr></thead><tbody className="divide-y">
            {posts.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Chưa có bài.</td></tr>}
            {posts.map((p) => <tr key={p.id} className="hover:bg-muted/30">
              <td className="px-4 py-2.5 font-medium">{p.title}</td><td className="px-4 py-2.5 text-muted-foreground">{p.type}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(p.scheduledDate)}</td>
              <td className="px-4 py-2.5"><StatusBadge value={p.status} /></td>
              <td className="px-4 py-2.5 text-right">
                <Button size="icon" variant="ghost" onClick={() => setEditingPost(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => s.remove("mapPosts", p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </td></tr>)}
          </tbody></table></CardContent></Card>
      </TabsContent>
      <TabsContent value="reviews" className="mt-4">
        <div className="flex justify-end mb-3"><Dialog open={addingReview} onOpenChange={setAddingReview}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm review</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Thêm review</DialogTitle></DialogHeader>
            <ReviewForm placeId={place.id} onSubmit={(r: MapReview) => s.add("reviews", r)} onClose={() => setAddingReview(false)} /></DialogContent>
        </Dialog></div>
        <div className="space-y-3">
          {reviews.length === 0 && <div className="text-center text-muted-foreground py-10">Chưa có review.</div>}
          {reviews.map((r) => <Card key={r.id}><CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div><div className="font-medium">{r.reviewer}</div>
                <div className="flex items-center gap-1 mt-0.5">{Array.from({ length: r.stars }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div>
                {r.content && <p className="text-sm mt-2 text-muted-foreground">{r.content}</p>}
                <div className="text-xs text-muted-foreground mt-1.5">{fmtDate(r.date)} {r.responder && `· Phản hồi: ${r.responder}`}</div></div>
              <div className="flex flex-col items-end gap-2"><StatusBadge value={r.responseStatus} />
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditingReview(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => s.remove("reviews", r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div></div>
            </div></CardContent></Card>)}
        </div>
      </TabsContent>
      <TabsContent value="report" className="mt-4"><ComingSoon title="Báo cáo Local" items={["Lượt tìm kiếm","Lượt xem ảnh","Cuộc gọi","Chỉ đường"]} /></TabsContent>
    </Tabs>

    <Dialog open={!!editingPost} onOpenChange={(o) => !o && setEditingPost(null)}>
      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa bài Map</DialogTitle></DialogHeader>
        {editingPost && <PostForm placeId={place.id} brandId={place.brandId} initial={editingPost} onSubmit={(p: MapPost) => s.update("mapPosts", p.id, p)} onClose={() => setEditingPost(null)} />}</DialogContent>
    </Dialog>
    <Dialog open={!!editingReview} onOpenChange={(o) => !o && setEditingReview(null)}>
      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa review</DialogTitle></DialogHeader>
        {editingReview && <ReviewForm placeId={place.id} initial={editingReview} onSubmit={(r: MapReview) => s.update("reviews", r.id, r)} onClose={() => setEditingReview(null)} />}</DialogContent>
    </Dialog>
  </>;
}
function Row({ k, v }: { k: string; v?: any }) { return <div className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right break-all">{v ?? "—"}</span></div>; }
