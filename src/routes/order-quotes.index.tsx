import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
import { ListTimeCell, shortTimeLines, useJobTimes } from "@/components/orderQuotes/JobTimes";
import { BarChart3 } from "lucide-react";

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
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(false);
  const nFilters = [st !== ALL, creator !== ALL, assignee !== ALL, !!from, !!to].filter(Boolean).length;
  const SIZE = 30;
  const params = { page, size: SIZE, tab, q: q.trim() || undefined, status: st === ALL ? undefined : st, creator: creator === ALL ? undefined : creator, assignee: assignee === ALL ? undefined : assignee, from: from || undefined, to: to || undefined };
  const { data, isLoading, error, refetch, isFetching } = useQuery({ queryKey: ["oq-list", params], queryFn: () => oqApi.list(params), refetchInterval: 60_000, placeholderData: (p) => p });
  const peopleQ = useQuery({ queryKey: ["oq-list", "people"], queryFn: oqApi.people });
  useEffect(() => setPage(0), [tab, q, st, creator, assignee, from, to]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.requests.map((r) => {
      const flows = (r.flows ?? []).filter((f: any) => tab === "all" || f.kind === tab);
      return { ...r, flows, count: r.oq_items?.[0]?.count ?? 0, flowCode: tab === "all" ? undefined : flows[0]?.code };
    });
  }, [data, tab]);
  const times = useJobTimes(rows.flatMap((r) => r.status === "draft" ? [] : r.flows.map((f: any) => f.id)));
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / SIZE));
  const people = peopleQ.data ?? { a: [], c: [] };

  const open = (r: any) => r.status === "draft" ? nav({ to: "/order-quotes/new", search: { id: r.id } }) : nav({ to: "/order-quotes/$id", params: { id: r.id }, search: { flow: r.flowCode ? r.flows[0]?.id : undefined } });

  return (
    <div>
       <PageHeader title="Hỏi Giá & Tiến Độ" description="Đơn Sứ Quà Tặng — hỏi giá, khả năng đáp ứng và ngày giao dự kiến trước khi chốt đơn."
        actions={can("oq.create") ? <Button asChild><Link to="/order-quotes/new" search={{ id: undefined }}><Plus className="h-4 w-4 mr-1" />Tạo yêu cầu</Link></Button> : undefined} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-3">
        <TabsList className="grid w-full grid-cols-3 h-11 sm:inline-flex sm:w-auto sm:h-10"><TabsTrigger value="all">Tất cả</TabsTrigger><TabsTrigger value="price">Hỏi Giá</TabsTrigger><TabsTrigger value="progress">Hỏi Tiến Độ</TabsTrigger></TabsList>
        {(can("oq.report_own") || can("oq.report_all")) && <Button asChild variant="outline" className="mt-2 w-full h-11 sm:mt-0 sm:ml-2 sm:w-auto sm:h-10"><Link to="/order-quotes/report"><BarChart3 className="h-4 w-4 mr-1" />Báo cáo thống kê</Link></Button>}
      </Tabs>
      <div className="mb-4 flex gap-2 lg:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên hoặc mã yêu cầu" className="pl-8 h-10" />
        </div>
        <Sheet open={sheet} onOpenChange={setSheet}>
          <SheetTrigger asChild><Button variant="outline" className="h-10 shrink-0"><SlidersHorizontal className="h-4 w-4 mr-1" />Lọc{nFilters ? ` (${nFilters})` : ""}</Button></SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <SheetHeader><SheetTitle>Bộ lọc</SheetTitle></SheetHeader>
            <div className="grid gap-3 py-4 [&_button]:h-11">
        <Select value={st} onValueChange={setSt}><SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Mọi trạng thái</SelectItem><SelectItem value="draft">Bản nháp</SelectItem><SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem><SelectItem value="waiting">Đang chờ Sale bổ sung</SelectItem><SelectItem value="answered">Đã trả lời</SelectItem><SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent></Select>
        <Select value={creator} onValueChange={setCreator}><SelectTrigger><SelectValue placeholder="Người tạo" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi người tạo</SelectItem>{people.c.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select>
        <Select value={assignee} onValueChange={setAssignee}><SelectTrigger><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi người phụ trách</SelectItem>{people.a.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select>
        <div className="grid grid-cols-2 gap-1 lg:flex lg:col-span-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Từ ngày" className="px-2" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Đến ngày" className="px-2" />
        </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11" onClick={() => { setSt(ALL); setCreator(ALL); setAssignee(ALL); setFrom(""); setTo(""); }}>Xóa lọc</Button>
              <Button className="h-11" onClick={() => setSheet(false)}>Xem {total} kết quả</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden lg:grid gap-2 grid-cols-7 mb-4">
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
        <div className="grid grid-cols-2 gap-1 lg:flex lg:col-span-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Từ ngày" className="px-2" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Đến ngày" className="px-2" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Loại đơn: Đơn Sứ Quà Tặng · {total} kết quả{isFetching ? " · đang cập nhật…" : ""}</div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 p-6 text-center text-sm space-y-2">
          <p>Không tải được danh sách: {(error as Error).message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Thử lại</Button>
        </div>
      ) : isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Chưa có yêu cầu nào phù hợp.</div>
      ) : (
        <>
          <div className="hidden md:block rounded-lg border bg-card">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Mã</TableHead><TableHead>Tên yêu cầu</TableHead><TableHead>Phân loại</TableHead><TableHead className="text-center">SP/PA</TableHead>
                <TableHead>Người tạo</TableHead><TableHead>Cung ứng phụ trách</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thời gian phản hồi</TableHead><TableHead>Thời gian Cung ứng xử lý</TableHead><TableHead>Cập nhật</TableHead>
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
                    <TableCell className="text-xs">{r.status === "draft" ? "—" : r.flows.map((f: any) => <div key={f.id}><ListTimeCell t={times.current(f.id)} kind={f.kind} part="resp" /></div>)}</TableCell>
                    <TableCell className="text-xs">{r.status === "draft" ? "—" : r.flows.map((f: any) => <div key={f.id}><ListTimeCell t={times.current(f.id)} kind={f.kind} part="proc" /></div>)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{vnDateTime(lastUpdate(r))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-2">
            {rows.map((r) => (
              <button key={r.id + (r.flowCode ?? "")} onClick={() => open(r)} className="w-full text-left rounded-lg border bg-card p-3 space-y-2 active:bg-accent">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="font-semibold line-clamp-2">{r.title || "(chưa đặt tên)"}</span><span className="font-mono text-xs text-muted-foreground">{r.flowCode ?? r.code ?? "Nháp"}</span></div>
                <StatusCell r={r} />
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Người tạo</span><span className="truncate">{name(r.creator_id)}</span>
                  {r.flows.map((f: any) => [<span key={f.id + "k"} className="text-muted-foreground">Cung ứng {f.kind === "price" ? "Giá" : "Tiến độ"}</span>, <span key={f.id} className="truncate">{name(f.assignee_id)}</span>])}
                  <span className="text-muted-foreground">Sản phẩm/PA</span><span>{r.count}</span>
                </div>
                {r.status !== "draft" && r.flows.map((f: any) => { const l = shortTimeLines(times.current(f.id), f.kind); return l && (
                  <div key={f.id + "t"} className="rounded bg-muted/40 px-2 py-1 text-xs">
                    <div className="font-medium uppercase text-[10px] tracking-wide">{f.kind === "price" ? "Giá" : "Tiến độ"} · {l.head}{l.running ? " (tạm tính)" : ""}</div>
                    <div>{l.resp}</div><div>{l.proc}</div>
                  </div>); })}
                <div className="text-[11px] text-muted-foreground">Cập nhật {vnDateTime(lastUpdate(r))}</div>
              </button>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</Button>
              <span>Trang {page + 1}/{pages}</span>
              <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau</Button>
            </div>
          )}
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
