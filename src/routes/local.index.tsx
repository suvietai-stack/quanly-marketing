import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type LocalPlace, type MapPost, type MapReview } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, EmptyState } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/local")({
  head: () => ({ meta: [{ title: "Local Map — Base Marketing" }] }),
  component: LocalPage,
});

function PlaceForm({ initial, onSubmit, onClose }: { initial?: Partial<LocalPlace>; onSubmit: (p: LocalPlace) => void; onClose: () => void }) {
  const { brands, people } = useStore();
  const [p, setP] = useState<LocalPlace>({
    id: initial?.id || uid(), name: initial?.name || "", mapLink: initial?.mapLink,
    brandId: initial?.brandId || brands[0]?.id || "", address: initial?.address, phone: initial?.phone,
    owner: initial?.owner, verifyStatus: initial?.verifyStatus || "Chưa xác minh", notes: initial?.notes,
  });
  const set = (x: Partial<LocalPlace>) => setP({ ...p, ...x });
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Label>Tên địa điểm *</Label><Input value={p.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Link Google Map</Label><Input value={p.mapLink || ""} onChange={(e) => set({ mapLink: e.target.value })} /></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={p.brandId} onValueChange={(v) => set({ brandId: v })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Người phụ trách</Label>
        <Select value={p.owner || "_"} onValueChange={(v) => set({ owner: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{people.map((x) => <SelectItem key={x.id} value={x.name}>{x.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Địa chỉ</Label><Input value={p.address || ""} onChange={(e) => set({ address: e.target.value })} /></div>
      <div><Label>Số điện thoại</Label><Input value={p.phone || ""} onChange={(e) => set({ phone: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Trạng thái xác minh</Label>
        <Select value={p.verifyStatus} onValueChange={(v) => set({ verifyStatus: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Đã xác minh","Chưa xác minh","Đang xử lý"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (p.name && p.brandId) { onSubmit(p); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function LocalPage() {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("local.create");
  const canEdit = can("local.edit");
  const canDelete = can("local.delete");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [editing, setEditing] = useState<LocalPlace | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => s.places.filter((p) =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || p.brandId === fBrand) &&
    (fStatus === "all" || p.verifyStatus === fStatus)
  ), [s.places, search, fBrand, fStatus]);

  return <>
    <PageHeader title="Local Map" description="Quản lý Google Map / Google Business Profile và công việc local marketing."
      actions={canCreate ? <Dialog open={adding} onOpenChange={setAdding}>
        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm địa điểm</Button></DialogTrigger>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Tạo địa điểm</DialogTitle></DialogHeader>
          <PlaceForm onSubmit={(p) => s.add("places", p)} onClose={() => setAdding(false)} /></DialogContent>
      </Dialog> : undefined} />
    <FilterBar>
      <Input placeholder="Tìm địa điểm..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
      <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Xác minh" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả</SelectItem>{["Đã xác minh","Chưa xác minh","Đang xử lý"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
    </FilterBar>
    {filtered.length === 0 ? (
      <EmptyState
        icon={<MapPin className="h-5 w-5" />}
        title={s.places.length === 0 ? "Chưa có địa điểm" : "Không có địa điểm phù hợp bộ lọc"}
        hint={s.places.length === 0 ? "Tạo địa điểm Google Map / GBP đầu tiên để bắt đầu quản lý local SEO." : undefined}
        action={s.places.length === 0 && canCreate ? (
          <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Tạo địa điểm đầu tiên</Button>
        ) : undefined}
      />
    ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((p) => {
        const brand = s.brands.find((b) => b.id === p.brandId);
        const posts = s.mapPosts.filter((mp) => mp.placeId === p.id).length;
        const reviews = s.reviews.filter((r) => r.placeId === p.id).length;
        return <Card key={p.id}><CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div><Link to="/local/$id" params={{ id: p.id }} className="font-semibold hover:text-primary inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{p.name}</Link>
              <div className="text-xs text-muted-foreground mt-0.5">{brand?.name}</div></div>
            <StatusBadge value={p.verifyStatus} />
          </div>
          {p.address && <div className="text-sm text-muted-foreground mt-2">{p.address}</div>}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>{posts} bài đăng · {reviews} review</span>
            <div className="flex gap-1">
              {canEdit && <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /></Button>}
              {canDelete && <Button size="icon" variant="ghost" onClick={() => s.remove("places", p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
            </div>
          </div>
        </CardContent></Card>;
      })}
    </div>
    )}
    <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
      <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Chỉnh sửa địa điểm</DialogTitle></DialogHeader>
        {editing && <PlaceForm initial={editing} onSubmit={(p) => s.update("places", p.id, p)} onClose={() => setEditing(null)} />}</DialogContent>
    </Dialog>
  </>;
}
