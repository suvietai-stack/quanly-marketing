import { createFileRoute } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type DesignOrder, type OrderStatus } from "@/lib/store";
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

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Order Thiết Kế — Base Marketing" }] }),
  component: OrdersPage,
});

const O_STATUS: OrderStatus[] = ["Mới tạo", "Đang làm", "Chờ duyệt", "Cần sửa", "Đã bàn giao", "Hoàn thành"];
const O_TYPES = ["Banner website", "Ảnh bài web", "Ảnh social", "Thumbnail video", "Ảnh sản phẩm", "Catalogue / profile", "Chụp ảnh", "Retouch ảnh", "Khác"] as const;
const O_SOURCES = ["Web", "Social", "Video", "Local", "Leader", "Khác"] as const;

function OrderForm({ initial, onSubmit, onClose }: { initial?: Partial<DesignOrder>; onSubmit: (o: DesignOrder) => void; onClose: () => void }) {
  const { brands, people, plans, topics } = useStore();
  const [o, setO] = useState<DesignOrder>({
    id: initial?.id || uid(), title: initial?.title || "",
    brandId: initial?.brandId || brands[0]?.id || "",
    type: initial?.type || "Banner website", source: initial?.source || "Web",
    requester: initial?.requester, assignee: initial?.assignee, reviewer: initial?.reviewer,
    deadline: initial?.deadline, brief: initial?.brief, size: initial?.size, quantity: initial?.quantity,
    refLink: initial?.refLink, deliverLink: initial?.deliverLink,
    status: initial?.status || "Mới tạo",
    plan: initial?.plan, topic: initial?.topic, notes: initial?.notes,
  });
  const set = (x: Partial<DesignOrder>) => setO({ ...o, ...x });
  const ps = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(x) => on(x === "_" ? undefined : x)}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select>
  );
  return <>
    <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="sm:col-span-2"><Label>Tên order *</Label><Input value={o.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={o.brandId} onValueChange={(v) => set({ brandId: v })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Loại order</Label>
        <Select value={o.type} onValueChange={(v) => set({ type: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{O_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Nguồn yêu cầu</Label>
        <Select value={o.source} onValueChange={(v) => set({ source: v as any })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{O_SOURCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Trạng thái</Label>
        <Select value={o.status} onValueChange={(v) => set({ status: v as OrderStatus })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{O_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Người yêu cầu</Label>{ps(o.requester, (x) => set({ requester: x }))}</div>
      <div><Label>Người thực hiện</Label>{ps(o.assignee, (x) => set({ assignee: x }))}</div>
      <div><Label>Người duyệt</Label>{ps(o.reviewer, (x) => set({ reviewer: x }))}</div>
      <div><Label>Deadline</Label><Input type="date" value={o.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} /></div>
      <div><Label>Kích thước</Label><Input value={o.size || ""} onChange={(e) => set({ size: e.target.value })} placeholder="VD: 1920x1080" /></div>
      <div><Label>Số lượng</Label><Input type="number" value={o.quantity ?? ""} onChange={(e) => set({ quantity: e.target.value ? Number(e.target.value) : undefined })} /></div>
      <div><Label>Plan</Label>
        <Select value={o.plan || "_"} onValueChange={(v) => set({ plan: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Topic</Label>
        <Select value={o.topic || "_"} onValueChange={(v) => set({ topic: v === "_" ? undefined : v })}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent><SelectItem value="_">—</SelectItem>{topics.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Link tư liệu</Label><Input value={o.refLink || ""} onChange={(e) => set({ refLink: e.target.value })} /></div>
      <div><Label>Link file bàn giao</Label><Input value={o.deliverLink || ""} onChange={(e) => set({ deliverLink: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Brief</Label><Textarea rows={3} value={o.brief || ""} onChange={(e) => set({ brief: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4"><Button variant="ghost" onClick={onClose}>Huỷ</Button><Button onClick={() => { if (o.title.trim() && o.brandId) { onSubmit(o); onClose(); }}}>Lưu</Button></DialogFooter>
  </>;
}

function OrdersPage() {
  const s = useStore();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fSource, setFSource] = useState("all");
  const [editing, setEditing] = useState<DesignOrder | null>(null);
  const [adding, setAdding] = useState(false);
  const filtered = useMemo(() => s.orders.filter((o) =>
    (!search || o.title.toLowerCase().includes(search.toLowerCase())) &&
    (fBrand === "all" || o.brandId === fBrand) &&
    (fStatus === "all" || o.status === fStatus) &&
    (fSource === "all" || o.source === fSource)
  ), [s.orders, search, fBrand, fStatus, fSource]);

  return <>
    <PageHeader title="Order Thiết Kế / Chụp Ảnh" description="Quản lý yêu cầu thiết kế, chụp ảnh, retouch, banner, thumbnail."
      actions={<Dialog open={adding} onOpenChange={setAdding}>
        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm order</Button></DialogTrigger>
        <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Tạo order</DialogTitle></DialogHeader>
          <OrderForm onSubmit={(o) => s.add("orders", o)} onClose={() => setAdding(false)} /></DialogContent>
      </Dialog>} />
    <FilterBar>
      <Input placeholder="Tìm..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Thương hiệu" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
      <Select value={fSource} onValueChange={setFSource}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Nguồn" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả nguồn</SelectItem>{O_SOURCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
      <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Tất cả trạng thái</SelectItem>{O_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
        <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4 mr-1" />Table</Button>
        <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4 mr-1" />Kanban</Button>
      </div>
    </FilterBar>

    {view === "table" ? (
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Order</th><th className="text-left font-medium px-4 py-2.5">Loại</th>
          <th className="text-left font-medium px-4 py-2.5">Nguồn</th><th className="text-left font-medium px-4 py-2.5">Người làm</th>
          <th className="text-left font-medium px-4 py-2.5">Deadline</th><th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
          <th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead><tbody className="divide-y">
          {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Chưa có order.</td></tr>}
          {filtered.map((o) => (<tr key={o.id} className="hover:bg-muted/30">
            <td className="px-4 py-2.5 font-medium">{o.title}<div className="text-xs text-muted-foreground">{s.brands.find((b) => b.id === o.brandId)?.name}</div></td>
            <td className="px-4 py-2.5 text-muted-foreground">{o.type}</td>
            <td className="px-4 py-2.5 text-muted-foreground">{o.source}</td>
            <td className="px-4 py-2.5 text-muted-foreground">{o.assignee || "—"}</td>
            <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(o.deadline)}</td>
            <td className="px-4 py-2.5"><StatusBadge value={o.status} /></td>
            <td className="px-4 py-2.5 text-right">
              <Button size="icon" variant="ghost" onClick={() => setEditing(o)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => s.remove("orders", o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </td>
          </tr>))}
        </tbody></table></div></CardContent></Card>
    ) : (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {O_STATUS.map((status) => {
          const items = filtered.filter((o) => o.status === status);
          return <div key={status} className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between mb-3 px-1"><StatusBadge value={status} /><span className="text-xs text-muted-foreground">{items.length}</span></div>
            <div className="space-y-2">{items.map((o) => (
              <button key={o.id} onClick={() => setEditing(o)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 shadow-soft">
                <div className="font-medium text-sm">{o.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{o.type} · {fmtDate(o.deadline)}</div>
              </button>))}</div>
          </div>;
        })}
      </div>
    )}

    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
      <DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Chỉnh sửa order</DialogTitle></DialogHeader>
        {editing && <OrderForm initial={editing} onSubmit={(o) => s.update("orders", o.id, o)} onClose={() => setEditing(null)} />}</DialogContent>
    </Dialog>
  </>;
}
