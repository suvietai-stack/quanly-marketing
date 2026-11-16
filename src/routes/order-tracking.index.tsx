import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Filter, CalendarClock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { otApi, fmtDate, type OtPerson } from "@/lib/orderTracking/api";
import { ORDER_STATUS, ORDER_TYPE, journey, daysLeft, isOverdue, taskDue, todayVN } from "@/lib/orderTracking/logic";
import { cn } from "@/lib/utils";
import { usePeople } from "@/lib/orderTracking/hooks";
import { Board, Reminders, SupplyCalendar } from "@/components/orderTracking/Workboard";

const VIEW_PERMS = ["ot.view_own", "ot.view_all", "ot.create", "ot.task_view", "ot.supplier", "ot.manage"];

export const Route = createFileRoute("/order-tracking/")({
  head: () => ({ meta: [
    { title: "Theo Dõi Đơn Hàng — Base" },
    { name: "description", content: "Theo dõi hành trình thực hiện đơn hàng giữa Kinh doanh và Cung ứng." },
    { property: "og:title", content: "Theo Dõi Đơn Hàng — Base" },
    { property: "og:description", content: "Theo dõi hành trình thực hiện đơn hàng giữa Kinh doanh và Cung ứng." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm={VIEW_PERMS}><OrderTracking /></RequirePermission>,
});

function OrderTracking() {
  const { can } = useCurrentUser();
  const canOrders = can("ot.view_own") || can("ot.view_all") || can("ot.manage") || can("ot.task_view") || can("ot.create");
  return (
    <>
      <PageHeader title="Theo Dõi Đơn Hàng" description="Hành trình thực hiện đơn hàng: tiếp nhận, đặt phôi, gia công, đóng gói, giao hàng." />
      <Tabs defaultValue={canOrders ? "today" : "suppliers"}>
        <div className="overflow-x-auto"><TabsList>
          {canOrders && <TabsTrigger value="today">Tổng quan</TabsTrigger>}
          {canOrders && <TabsTrigger value="board">Kanban công việc</TabsTrigger>}
          {canOrders && <TabsTrigger value="calendar">Lịch cung ứng</TabsTrigger>}
          {canOrders && <TabsTrigger value="orders">Danh sách đơn</TabsTrigger>}
          <TabsTrigger value="suppliers">Nhà cung cấp</TabsTrigger>
        </TabsList></div>
        {canOrders && <TabsContent value="today" className="mt-4"><Reminders /></TabsContent>}
        {canOrders && <TabsContent value="board" className="mt-4"><Board /></TabsContent>}
        {canOrders && <TabsContent value="calendar" className="mt-4"><SupplyCalendar /></TabsContent>}
        {canOrders && <TabsContent value="orders" className="mt-4"><OrderList /></TabsContent>}
        <TabsContent value="suppliers" className="mt-4">
          <div className="space-y-3 rounded-xl border bg-card p-6">
            <h3 className="font-semibold">Danh mục Nhà cung cấp chung</h3>
            <p className="text-sm text-muted-foreground">
              Dữ liệu nhà cung cấp phục vụ Theo Dõi Đơn Hàng hiện được quản lý tập trung tại
              Mua Hàng & Giao Vận; Showroom, Kinh doanh tra cứu cùng một danh mục theo quyền.
            </p>
            <Button asChild><Link to="/procurement/suppliers">Mở Nhà cung cấp</Link></Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

const STATUS_TABS = [["active", "Đang xử lý"], ["new", "Chưa tiếp nhận"], ["in_progress", "Đang thực hiện"], ["done", "Hoàn tất"], ["cancelled", "Đã hủy"], ["all", "Tất cả"]] as const;

function OrderList() {
  const { can, user } = useCurrentUser();
  const people = usePeople();
  const orders = useQuery({ queryKey: ["ot", "orders"], queryFn: otApi.orders });
  const tasks = useQuery({ queryKey: ["ot", "allTasks"], queryFn: otApi.allTasks });
  const settings = useQuery({ queryKey: ["ot", "settings"], queryFn: otApi.settings });
  const [tab, setTab] = useState<string>("active");
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [mine, setMine] = useState(false);
  const [creating, setCreating] = useState(false);
  const today = todayVN();

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (orders.data ?? []).filter((o) =>
      (tab === "all" || (tab === "active" ? ["new", "in_progress"].includes(o.status) : o.status === tab)) &&
      (type === "all" || o.order_type === type) &&
      (!mine || [o.sale_id, o.supply_id, o.created_by].includes(user?.id ?? "")) &&
      (!s || o.code.toLowerCase().includes(s) || o.title.toLowerCase().includes(s)),
    ).sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [orders.data, tab, type, mine, q, user?.id]);
  const nFilter = (type !== "all" ? 1 : 0) + (mine ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm mã hoặc tên đơn…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline"><Filter className="h-4 w-4 mr-1" />Bộ lọc{nFilter ? ` (${nFilter})` : ""}</Button></PopoverTrigger>
          <PopoverContent className="w-64 space-y-3">
            <div className="space-y-1"><Label>Loại đơn</Label>
              <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="sample">Đơn mẫu</SelectItem><SelectItem value="mass">Sản xuất</SelectItem></SelectContent></Select>
            </div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={mine} onCheckedChange={(v) => setMine(!!v)} />Chỉ đơn tôi phụ trách</label>
          </PopoverContent>
        </Popover>
        {can("ot.create") && settings.data?.allow_manual && <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-1" />Tạo đơn</Button>}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-sm", tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{l}</button>
        ))}
      </div>
      {orders.isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : orders.error ? <p className="text-sm text-destructive">{(orders.error as Error).message}</p> :
        rows.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">Chưa có đơn hàng phù hợp.</p> :
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((o) => {
            const ts = (tasks.data ?? []).filter((t) => t.order_id === o.id);
            const j = journey(o, ts);
            const active = ["new", "in_progress"].includes(o.status);
            const dl = daysLeft(o.due_date, today);
            const lateTasks = ts.filter((t) => !["done", "skipped"].includes(t.status) && isOverdue(taskDue(t), false, today)).length;
            return (
              <Link key={o.id} to="/order-tracking/$id" params={{ id: o.id }} className={cn("block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50", active && dl < 0 && "border-destructive/60")}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{o.code}</span>
                  <Badge variant={o.order_type === "sample" ? "outline" : "secondary"}>{ORDER_TYPE[o.order_type]}</Badge>
                  <span className="ml-auto">{ORDER_STATUS[o.status]}</span>
                </div>
                <div className="mt-1 font-medium line-clamp-2">{o.title}</div>
                <div className={cn("mt-3 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm", active && dl < 0 ? "bg-destructive/10 text-destructive" : active && dl <= 3 ? "bg-primary/10 text-primary" : "bg-muted")}>
                  <CalendarClock className="h-4 w-4" />
                  <span>Khách nhận: <b>{fmtDate(o.due_date)}</b>{o.due_time ? ` ${o.due_time}` : ""}</span>
                  {active && <span className="ml-auto text-xs">{dl < 0 ? `Quá ${-dl} ngày` : dl === 0 ? "Hôm nay" : `Còn ${dl} ngày`}</span>}
                </div>
                <div className="mt-3 flex gap-1">
                  {j.steps.map((s) => <div key={s.key} title={s.label} className={cn("h-1.5 flex-1 rounded-full", s.done ? "bg-primary" : s.key === j.current && active ? "bg-primary/40" : "bg-muted")} />)}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Đang ở: {j.steps.find((s) => s.key === j.current)?.label ?? "Hoàn tất"}</span>
                  <span>KD: {people.name(o.sale_id)}</span><span>CƯ: {people.name(o.supply_id)}</span>
                  {lateTasks > 0 && active && <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="h-3 w-3" />{lateTasks} việc quá hạn</span>}
                </div>
              </Link>
            );
          })}
        </div>}
      {creating && <CreateOrder people={people.list} onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateOrder({ people, onClose }: { people: OtPerson[]; onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [f, setF] = useState<Record<string, string>>({ order_type: "mass" });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    if (!f.title?.trim()) return toast.error("Vui lòng nhập tên đơn hàng.");
    if (!f.due_date) return toast.error("Vui lòng chọn ngày khách nhận hàng.");
    setBusy(true);
    try {
      const id = await otApi.create(f);
      await qc.invalidateQueries({ queryKey: ["ot"] });
      toast.success("Đã tạo đơn hàng.");
      navigate({ to: "/order-tracking/$id", params: { id } });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const PersonSelect = ({ k, pick }: { k: string; pick: (p: OtPerson) => boolean }) => (
    <Select value={f[k] ?? ""} onValueChange={(v) => set(k, v)}>
      <SelectTrigger><SelectValue placeholder="Chọn người" /></SelectTrigger>
      <SelectContent>{people.filter(pick).map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
    </Select>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Tạo đơn thủ công</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Mã đơn do Base tự sinh. Không nhập sản phẩm, giá hay thông tin khách hàng — những thông tin này nằm trên CRM.</p>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {(["mass", "sample"] as const).map((t) => (
              <button key={t} type="button" onClick={() => set("order_type", t)} className={cn("rounded-md border px-3 py-2 text-sm", f.order_type === t ? "border-primary bg-primary/10 font-medium" : "")}>{ORDER_TYPE[t]}</button>
            ))}
          </div>
          <div className="space-y-1"><Label>Tên đơn hàng *</Label><Input value={f.title ?? ""} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <div className="space-y-1"><Label>Ngày khách nhận hàng *</Label><Input type="date" value={f.due_date ?? ""} onChange={(e) => set("due_date", e.target.value)} /></div>
            <div className="space-y-1"><Label>Giờ nhận</Label><Input type="time" value={f.due_time ?? ""} onChange={(e) => set("due_time", e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>Địa chỉ giao hàng</Label><Input value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1"><Label>Kinh doanh phụ trách</Label><PersonSelect k="sale_id" pick={(p) => p.sale} /></div>
            <div className="space-y-1"><Label>Cung ứng phụ trách</Label><PersonSelect k="supply_id" pick={(p) => p.supply} /></div>
          </div>
          <div className="space-y-1"><Label>Liên kết đơn trên CRM</Label><Input type="url" placeholder="https://…" value={f.crm_url ?? ""} onChange={(e) => set("crm_url", e.target.value)} /></div>
          <div className="space-y-1"><Label>Ghi chú triển khai</Label><Textarea rows={2} value={f.note ?? ""} onChange={(e) => set("note", e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button onClick={submit} disabled={busy}>Tạo đơn</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

