import { createFileRoute } from "@tanstack/react-router";
import { useStore, uid, fmtDate, type DesignOrder, type OrderStatus, ORDER_STATUSES, ORDER_TYPES, ORDER_SOURCES, ORDER_PRIORITIES } from "@/lib/store";
import { useCurrentUser } from "@/lib/auth";
import { RequirePermission } from "@/components/PermissionGate";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, LayoutGrid, Table as TableIcon, ExternalLink, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { OrderDetailDialog } from "@/components/OrderDetail";
import { OrderReport } from "@/components/OrderReport";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Order Thiết Kế — Base Marketing" }] }),
  component: () => (
    <RequirePermission perm="order.view">
      <OrdersPage />
    </RequirePermission>
  ),
});

type ViewKey = "all" | "mine_created" | "mine_assigned" | "waiting_take" | "pending_review" | "needs_fix" | "delivered" | "completed" | "report";

function NewOrderForm({ onSubmit, onClose }: { onSubmit: (o: DesignOrder) => void; onClose: () => void }) {
  const { brands, people } = useStore();
  const { user } = useCurrentUser();
  const userName = user?.fullName || user?.username || "";
  const [o, setO] = useState<DesignOrder>({
    id: uid(),
    title: "",
    brandId: brands[0]?.id || "",
    type: "Banner website",
    source: "Web",
    requester: userName || undefined,
    priority: "Trung bình",
    status: "Mới tạo",
    revisions: 0,
    history: [],
  });
  const set = (x: Partial<DesignOrder>) => setO({ ...o, ...x });
  const ps = (val: string | undefined, on: (v?: string) => void) => (
    <Select value={val || "_"} onValueChange={(x) => on(x === "_" ? undefined : x)}>
      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent><SelectItem value="_">—</SelectItem>{people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
    </Select>
  );

  return <>
    <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="sm:col-span-2"><Label>Tên order *</Label><Input value={o.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div><Label>Thương hiệu *</Label>
        <Select value={o.brandId} onValueChange={(v) => set({ brandId: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Loại order</Label>
        <Select value={o.type} onValueChange={(v) => set({ type: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Nguồn yêu cầu</Label>
        <Select value={o.source} onValueChange={(v) => set({ source: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ORDER_SOURCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Mức ưu tiên</Label>
        <Select value={o.priority || "Trung bình"} onValueChange={(v) => set({ priority: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ORDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select></div>
      <div><Label>Người yêu cầu</Label>{ps(o.requester, (x) => set({ requester: x }))}</div>
      <div><Label>Người phụ trách</Label>{ps(o.assignee, (x) => set({ assignee: x }))}</div>
      <div><Label>Người duyệt</Label>{ps(o.reviewer, (x) => set({ reviewer: x }))}</div>
      <div><Label>Deadline</Label><Input type="date" value={o.deadline || ""} onChange={(e) => set({ deadline: e.target.value })} /></div>
      <div><Label>Kích thước</Label><Input value={o.size || ""} onChange={(e) => set({ size: e.target.value })} placeholder="VD: 1920x1080" /></div>
      <div><Label>Số lượng</Label><Input type="number" value={o.quantity ?? ""} onChange={(e) => set({ quantity: e.target.value ? Number(e.target.value) : undefined })} /></div>
      <div className="sm:col-span-2"><Label>Brief</Label><Textarea rows={3} value={o.brief || ""} onChange={(e) => set({ brief: e.target.value })} /></div>
      <div><Label>Link tư liệu</Label><Input value={o.refLink || ""} onChange={(e) => set({ refLink: e.target.value })} /></div>
      <div><Label>Link đối tượng liên quan</Label><Input value={o.refLinkObject || ""} onChange={(e) => set({ refLinkObject: e.target.value })} /></div>
    </div>
    <DialogFooter className="mt-4">
      <Button variant="ghost" onClick={onClose}>Huỷ</Button>
      <Button onClick={() => { if (o.title.trim() && o.brandId) { onSubmit(o); onClose(); }}}>Tạo order</Button>
    </DialogFooter>
  </>;
}

function OrdersPage() {
  const s = useStore();
  const { user, can } = useCurrentUser();
  const userName = user?.fullName || user?.username || "";
  const canCreate = can("order.create");
  const canDelete = can("order.delete");
  const canViewAll = can("order.view_all");

  const [view, setView] = useState<"table" | "kanban">("table");
  const [tab, setTab] = useState<ViewKey>("all");
  const [search, setSearch] = useState("");
  const [fBrand, setFBrand] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fSource, setFSource] = useState("all");
  const [fType, setFType] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = s.orders;
    // base scope: if user does not have view_all, only show related
    if (!canViewAll && userName) {
      list = list.filter((o) =>
        o.requester === userName || o.assignee === userName || o.reviewer === userName || o.assigner === userName
      );
    }
    if (tab === "mine_created") list = list.filter((o) => o.requester === userName);
    if (tab === "mine_assigned") list = list.filter((o) => o.assignee === userName);
    if (tab === "waiting_take") list = list.filter((o) => o.status === "Chờ nhận việc");
    if (tab === "pending_review") list = list.filter((o) => o.status === "Chờ duyệt");
    if (tab === "needs_fix") list = list.filter((o) => o.status === "Cần sửa");
    if (tab === "delivered") list = list.filter((o) => o.status === "Đã bàn giao");
    if (tab === "completed") list = list.filter((o) => o.status === "Hoàn thành");

    return list.filter((o) =>
      (!search || o.title.toLowerCase().includes(search.toLowerCase())) &&
      (fBrand === "all" || o.brandId === fBrand) &&
      (fStatus === "all" || o.status === fStatus) &&
      (fSource === "all" || o.source === fSource) &&
      (fType === "all" || o.type === fType) &&
      (fPriority === "all" || o.priority === fPriority) &&
      (fAssignee === "all" || o.assignee === fAssignee)
    );
  }, [s.orders, search, fBrand, fStatus, fSource, fType, fPriority, fAssignee, tab, canViewAll, userName]);

  return <>
    <PageHeader
      title="Order Thiết Kế / Chụp Ảnh"
      description="Quản lý yêu cầu thiết kế, chụp ảnh, retouch, banner, thumbnail."
      actions={canCreate && <Dialog open={adding} onOpenChange={setAdding}>
        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Thêm order</Button></DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Tạo order thiết kế</DialogTitle></DialogHeader>
          <NewOrderForm onSubmit={(o) => {
            const history = [{ at: new Date().toISOString(), byId: user?.id, byName: userName || "—", action: "Tạo order", toStatus: o.status }];
            s.add("orders", { ...o, history });
          }} onClose={() => setAdding(false)} />
        </DialogContent>
      </Dialog>}
    />

    <Tabs value={tab} onValueChange={(v) => setTab(v as ViewKey)}>
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="mine_created">Tôi tạo</TabsTrigger>
        <TabsTrigger value="mine_assigned">Tôi phụ trách</TabsTrigger>
        <TabsTrigger value="waiting_take">Chờ nhận việc</TabsTrigger>
        <TabsTrigger value="pending_review">Chờ duyệt</TabsTrigger>
        <TabsTrigger value="needs_fix">Cần sửa</TabsTrigger>
        <TabsTrigger value="delivered">Đã bàn giao</TabsTrigger>
        <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
      </TabsList>
    </Tabs>

    <FilterBar>
      <Input placeholder="Tìm..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      <Select value={fBrand} onValueChange={setFBrand}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
      <Select value={fType} onValueChange={setFType}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi loại</SelectItem>{ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
      <Select value={fSource} onValueChange={setFSource}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi nguồn</SelectItem>{ORDER_SOURCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
      <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi trạng thái</SelectItem>{ORDER_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent></Select>
      <Select value={fPriority} onValueChange={setFPriority}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi ưu tiên</SelectItem>{ORDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
      <Select value={fAssignee} onValueChange={setFAssignee}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi người phụ trách</SelectItem>{s.people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select>

      <div className="ml-auto inline-flex rounded-md border bg-card p-0.5">
        <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><TableIcon className="h-4 w-4 mr-1" />Table</Button>
        <Button size="sm" variant={view === "kanban" ? "secondary" : "ghost"} onClick={() => setView("kanban")}><LayoutGrid className="h-4 w-4 mr-1" />Kanban</Button>
      </div>
    </FilterBar>

    {view === "table" ? (
      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
          <th className="text-left font-medium px-4 py-2.5">Order</th>
          <th className="text-left font-medium px-4 py-2.5">Loại</th>
          <th className="text-left font-medium px-4 py-2.5">Nguồn</th>
          <th className="text-left font-medium px-4 py-2.5">Người tạo</th>
          <th className="text-left font-medium px-4 py-2.5">Phụ trách</th>
          <th className="text-left font-medium px-4 py-2.5">Người duyệt</th>
          <th className="text-left font-medium px-4 py-2.5">Deadline</th>
          <th className="text-left font-medium px-4 py-2.5">Trạng thái</th>
          <th className="text-center font-medium px-4 py-2.5">Sửa</th>
          <th className="text-left font-medium px-4 py-2.5">File</th>
          <th className="text-right font-medium px-4 py-2.5"></th>
        </tr></thead>
        <tbody className="divide-y">
          {filtered.length === 0 && <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">Chưa có order.</td></tr>}
          {filtered.map((o) => (
            <tr key={o.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setOpenId(o.id)}>
              <td className="px-4 py-2.5 font-medium">{o.title}
                <div className="text-xs text-muted-foreground">{s.brands.find((b) => b.id === o.brandId)?.name}{o.priority ? ` · ${o.priority}` : ""}</div>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{o.type}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{o.source}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{o.requester || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{o.assignee || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{o.reviewer || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(o.deadline)}</td>
              <td className="px-4 py-2.5"><StatusBadge value={o.status} /></td>
              <td className="px-4 py-2.5 text-center text-muted-foreground">{o.revisions || 0}</td>
              <td className="px-4 py-2.5">
                {o.deliverLink && <a href={o.deliverLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />File</a>}
              </td>
              <td className="px-4 py-2.5 text-right">
                {canDelete && <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); if (confirm("Xóa order này?")) s.remove("orders", o.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>}
              </td>
            </tr>
          ))}
        </tbody></table></div></CardContent></Card>
    ) : (
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-9">
        {ORDER_STATUSES.map((status) => {
          const items = filtered.filter((o) => o.status === status);
          return (
            <div key={status} className="rounded-xl bg-muted/40 p-3 min-w-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <StatusBadge value={status} />
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((o) => (
                  <button key={o.id} onClick={() => setOpenId(o.id)} className="block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 shadow-soft">
                    <div className="font-medium text-sm">{o.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{o.type}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.assignee || "—"} · {fmtDate(o.deadline)}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    )}

    <OrderDetailDialog orderId={openId} open={!!openId} onOpenChange={(v) => !v && setOpenId(null)} />
  </>;
}
