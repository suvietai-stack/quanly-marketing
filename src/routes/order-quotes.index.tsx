import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/lib/auth";
import { oqApi } from "@/lib/orderQuotes/api";
import { vnDateTime } from "@/lib/orderQuotes/logic";
import { FlowBadge, useUserName } from "@/components/orderQuotes/OqCommon";

export const Route = createFileRoute("/order-quotes/")({
  head: () => ({ meta: [
    { title: "Hỏi Giá & Tiến Độ — Đơn hàng" },
    { name: "description", content: "Sale gửi yêu cầu hỏi giá, hỏi tiến độ Đơn Sứ Quà Tặng cho Cung ứng và theo dõi phản hồi." },
    { property: "og:title", content: "Hỏi Giá & Tiến Độ — Đơn hàng" },
    { property: "og:description", content: "Phối hợp Kinh doanh và Cung ứng: hỏi giá, hỏi tiến độ theo từng sản phẩm." },
  ] }),
  component: () => (
    <RequirePermission perm={["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"]}>
      <OqList />
    </RequirePermission>
  ),
});

const ALL = "__all";

function OqList() {
  const nav = useNavigate();
  const { can } = useCurrentUser();
  const name = useUserName();
  const [tab, setTab] = useState<"all" | "price" | "progress">("all");
  const [q, setQ] = useState("");
  const [st, setSt] = useState(ALL);
  const [creator, setCreator] = useState(ALL);
  const [assignee, setAssignee] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["oq-list"], queryFn: oqApi.list, refetchInterval: 60_000 });

  const rows = useMemo(() => {
    if (!data) return [];
    const flowsOf = (id: string) => data.flows.filter((f) => f.request_id === id);
    const base = data.requests.map((r) => ({ ...r, flows: flowsOf(r.id), count: r.oq_items?.[0]?.count ?? 0 }));
    const out: any[] = tab === "all" ? base : base.flatMap((r) => r.flows.filter((f: any) => f.kind === tab).map((f: any) => ({ ...r, flows: [f], flowCode: f.code })));
    const s = q.trim().toLowerCase();
    return out.filter((r) => {
      if (s && !(`${r.title} ${r.code ?? ""} ${r.flowCode ?? ""}`.toLowerCase().includes(s))) return false;
      if (creator !== ALL && r.creator_id !== creator) return false;
      if (assignee !== ALL && !r.flows.some((f: any) => f.assignee_id === assignee)) return false;
      if (st !== ALL) {
        if (st === "draft" || st === "cancelled") { if (r.status !== st) return false; }
        else if (st === "waiting") { if (!r.flows.some((f: any) => f.waiting_info && f.status === "processing")) return false; }
        else if (!r.flows.some((f: any) => f.status === st)) return false;
      }
      const d = (r.submitted_at ?? r.created_at).slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [data, tab, q, st, creator, assignee, from, to]);

  const people = useMemo(() => {
    const c = new Set<string>(), a = new Set<string>();
    data?.requests.forEach((r) => c.add(r.creator_id));
    data?.flows.forEach((f) => a.add(f.assignee_id));
    return { c: [...c], a: [...a] };
  }, [data]);

  const open = (r: any) => r.status === "draft" ? nav({ to: "/order-quotes/new", search: { id: r.id } }) : nav({ to: "/order-quotes/$id", params: { id: r.id }, search: { flow: r.flowCode ? r.flows[0]?.id : undefined } });

  return (
    <div>
      <PageHeader title="Hỏi Giá & Tiến Độ" description="Đơn Sứ Quà Tặng — Sale hỏi giá/tiến độ, Cung ứng phản hồi theo từng sản phẩm."
        actions={can("oq.create") ? <Button asChild><Link to="/order-quotes/new" search={{ id: undefined }}><Plus className="h-4 w-4 mr-1" />Tạo yêu cầu</Link></Button> : undefined} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-3">
        <TabsList><TabsTrigger value="all">Tất cả</TabsTrigger><TabsTrigger value="price">Hỏi Giá</TabsTrigger><TabsTrigger value="progress">Hỏi Tiến Độ</TabsTrigger></TabsList>
      </Tabs>
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-7 mb-4">
        <div className="relative col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên hoặc mã yêu cầu" className="pl-8" />
        </div>
        <Select value={st} onValueChange={setSt}><SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Mọi trạng thái</SelectItem><SelectItem value="draft">Bản nháp</SelectItem><SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem><SelectItem value="waiting">Đang chờ Sale bổ sung</SelectItem><SelectItem value="answered">Đã trả lời</SelectItem><SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent></Select>
        <Select value={creator} onValueChange={setCreator}><SelectTrigger><SelectValue placeholder="Người tạo" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi người tạo</SelectItem>{people.c.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select>
        <Select value={assignee} onValueChange={setAssignee}><SelectTrigger><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi người phụ trách</SelectItem>{people.a.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select>
        <div className="flex gap-1 col-span-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Từ ngày" className="px-2" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Đến ngày" className="px-2" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Loại đơn: Đơn Sứ Quà Tặng · {rows.length} kết quả</div>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có yêu cầu nào phù hợp.</div>
      ) : (
        <>
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Mã</TableHead><TableHead>Tên yêu cầu</TableHead><TableHead>Phân loại</TableHead><TableHead className="text-center">SP/PA</TableHead>
                <TableHead>Người tạo</TableHead><TableHead>Cung ứng phụ trách</TableHead><TableHead>Trạng thái</TableHead><TableHead>Cập nhật</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id + (r.flowCode ?? "")} className="cursor-pointer" onClick={() => open(r)}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{r.flowCode ?? r.code ?? "Nháp"}</TableCell>
                    <TableCell className="font-medium max-w-[260px] truncate">{r.title || "(chưa đặt tên)"}</TableCell>
                    <TableCell className="text-xs">Sứ Quà Tặng</TableCell>
                    <TableCell className="text-center">{r.count}</TableCell>
                    <TableCell className="text-sm">{name(r.creator_id)}</TableCell>
                    <TableCell className="text-sm">{r.flows.map((f: any) => <div key={f.id}>{f.kind === "price" ? "Giá" : "Tiến độ"}: {name(f.assignee_id)}</div>)}</TableCell>
                    <TableCell><StatusCell r={r} /></TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{vnDateTime(lastUpdate(r))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-2">
            {rows.map((r) => (
              <button key={r.id + (r.flowCode ?? "")} onClick={() => open(r)} className="w-full text-left rounded-lg border bg-card p-3 space-y-1.5">
                <div className="flex justify-between gap-2"><span className="font-medium line-clamp-2">{r.title || "(chưa đặt tên)"}</span><span className="font-mono text-xs text-muted-foreground shrink-0">{r.flowCode ?? r.code ?? "Nháp"}</span></div>
                <StatusCell r={r} />
                <div className="text-xs text-muted-foreground">{r.flows.map((f: any) => `${f.kind === "price" ? "Giá" : "Tiến độ"}: ${name(f.assignee_id)}`).join(" · ") || name(r.creator_id)}</div>
                <div className="text-[11px] text-muted-foreground">Cập nhật {vnDateTime(lastUpdate(r))}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const lastUpdate = (r: any) => [r.updated_at, ...r.flows.map((f: any) => f.updated_at)].sort().pop();

function StatusCell({ r }: { r: any }) {
  if (r.status === "draft") return <Badge variant="outline">Bản nháp</Badge>;
  if (r.status === "cancelled") return <Badge variant="outline" className="text-muted-foreground">Đã hủy</Badge>;
  return <div className="flex flex-col gap-1">{r.flows.map((f: any) => <FlowBadge key={f.id} kind={f.kind} status={f.status} waiting={f.waiting_info} />)}</div>;
}
