import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { fmtDur } from "@/lib/orderQuotes/report";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
import { oqApi, LIST_STATUSES } from "@/lib/orderQuotes/api";
import { vnDate, vnDateTime } from "@/lib/orderQuotes/logic";
import { FlowBadge, useUserName } from "@/components/orderQuotes/OqCommon";
import { ListTimeCell, shortTimeLines, useJobTimes } from "@/components/orderQuotes/JobTimes";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/order-quotes/")({
  head: () => ({ meta: [{"title": "Hỏi Giá & Tiến Độ — Đơn hàng"}, {"name": "description", "content": "Sale gửi yêu cầu hỏi giá, hỏi tiến độ Đơn Sứ Quà Tặng cho Cung ứng và theo dõi phản hồi."}, {"property": "og:title", "content": "Hỏi Giá & Tiến Độ — Đơn hàng"}, {"property": "og:description", "content": "Sale gửi yêu cầu hỏi giá, hỏi tiến độ Đơn Sứ Quà Tặng cho Cung ứng và theo dõi phản hồi."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <RequirePermission perm={["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"]}>
      <OqList />
    </RequirePermission>
  ),
});

const ALL = "__all";

function OqList() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { can, user } = useCurrentUser();
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
  const isMobile = useIsMobile();
  const [busy, setBusy] = useState<string | null>(null);
  const [del, setDel] = useState<any>(null);
  const canDel = can("oq.delete_cancelled");
  const doDelete = async () => {
    const r = del; if (!r) return; setBusy(r.id);
    try { await oqApi.deleteCancelled(r.id); toast.success(`Đã xóa ${r.code ?? "yêu cầu"}.`); setDel(null); qc.invalidateQueries({ queryKey: ["oq-list"] }); }
    catch (err) { toast.error((err as Error).message); } finally { setBusy(null); }
  };
  const delBtn = (r: any) => canDel && r.status === "cancelled" ? <Button size="sm" variant="outline" className="text-destructive" disabled={busy === r.id} onClick={(e) => { e.stopPropagation(); setDel(r); }}><Trash2 className="h-4 w-4 mr-1" />Xóa</Button> : null;
  const nFilters = [creator !== ALL, assignee !== ALL, !!from, !!to].filter(Boolean).length;
  const SIZE = 30;
  const base = { tab, q: q.trim() || undefined, creator: creator === ALL ? undefined : creator, assignee: assignee === ALL ? undefined : assignee, from: from || undefined, to: to || undefined };
  const params = { ...base, page, size: SIZE, status: st === ALL ? undefined : st };
  const { data, isLoading, error, refetch, isFetching } = useQuery({ queryKey: ["oq-list", params], queryFn: () => oqApi.list(params), refetchInterval: 60_000, placeholderData: (p) => p });
  const countsQ = useQuery({ queryKey: ["oq-list", "counts", base], queryFn: () => oqApi.counts(base), refetchInterval: 60_000, placeholderData: (p) => p });
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
  const counts = countsQ.data;
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const overdue = (r: any) => r.status !== "cancelled" && !!r.delivery_date && r.delivery_date < today && r.flows.some((f: any) => f.status === "processing");
  const canAccept = (f: any) => f.status === "pending" && ((f.assignee_id === user?.id && can("oq.accept") && can(f.kind === "price" ? "oq.reply_price" : "oq.reply_progress")) || can("oq.manage"));
  const accept = async (e: React.MouseEvent, f: any) => {
    e.stopPropagation(); setBusy(f.id);
    try { await oqApi.accept(f.id); toast.success("Đã xác nhận tiếp nhận."); qc.invalidateQueries({ queryKey: ["oq-list"] }); qc.invalidateQueries({ queryKey: ["oq-times"] }); }
    catch (err) { toast.error((err as Error).message); } finally { setBusy(null); }
  };

  const open = (r: any) => r.status === "draft" ? nav({ to: "/order-quotes/new", search: { id: r.id } }) : nav({ to: "/order-quotes/$id", params: { id: r.id }, search: { flow: r.flowCode ? r.flows[0]?.id : undefined } });
  const statusTabs = [{ value: ALL, label: "Tất cả", key: "all" }, ...LIST_STATUSES.map((s) => ({ ...s, key: s.value }))];
  const clear = () => { setCreator(ALL); setAssignee(ALL); setFrom(""); setTo(""); };
  const mode = st === "pending" ? "pending" : st === "processing" || st === "waiting" ? "processing" : "default";

  const filterFields = (
    <div className="grid gap-3 py-4 [&_button]:h-11">
      <label className="grid gap-1 text-sm"><span className="text-muted-foreground">Người tạo</span>
        <Select value={creator} onValueChange={setCreator}><SelectTrigger><SelectValue placeholder="Người tạo" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi người tạo</SelectItem>{people.c.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select></label>
      <label className="grid gap-1 text-sm"><span className="text-muted-foreground">Cung ứng phụ trách</span>
        <Select value={assignee} onValueChange={setAssignee}><SelectTrigger><SelectValue placeholder="Người phụ trách" /></SelectTrigger>
          <SelectContent><SelectItem value={ALL}>Mọi người phụ trách</SelectItem>{people.a.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select></label>
      <div className="grid gap-1 text-sm"><span className="text-muted-foreground">Ngày tạo</span>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Từ ngày" className="h-11 px-2" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Đến ngày" className="h-11 px-2" />
        </div></div>
    </div>
  );

  const waitCell = (r: any) => r.flows.map((f: any) => { const t = times.current(f.id); return <div key={f.id} className="whitespace-nowrap">{f.kind === "price" ? "Giá" : "Tiến độ"}: {t?.sent_at ? fmtDur((Date.parse(t.server_now) - Date.parse(t.sent_at)) / 1000) : "—"}</div>; });
  const acceptedCell = (r: any) => r.flows.map((f: any) => <div key={f.id} className="whitespace-nowrap">{vnDateTime(times.current(f.id)?.accepted_at) || "—"}</div>);
  const acceptBtns = (r: any) => r.status === "cancelled" ? delBtn(r) : r.flows.filter(canAccept).map((f: any) => <Button key={f.id} size="sm" disabled={busy === f.id} onClick={(e) => accept(e, f)}>Tiếp nhận{r.flows.length > 1 ? ` ${f.kind === "price" ? "Giá" : "Tiến độ"}` : ""}</Button>);

  return (
    <div className="oq-mobile-list min-w-0">
      <PageHeader title="Hỏi Giá & Tiến Độ" description="Đơn Sứ Quà Tặng — hỏi giá, khả năng đáp ứng và ngày giao dự kiến trước khi chốt đơn."
        actions={can("oq.create") ? <Button asChild><Link to="/order-quotes/new" search={{ id: undefined }}><Plus className="h-4 w-4 mr-1" />Tạo yêu cầu</Link></Button> : undefined} />
      <div className="oq-simple-guide mb-4 rounded-2xl border bg-card p-4 md:hidden"><h2 className="font-semibold text-sm">Hỏi nhanh, theo dõi rõ</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">1. Sale gửi yêu cầu → 2. Cung ứng trả lời → 3. Sale xem kết quả</p><div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-800">Chờ tiếp nhận</span><span className="rounded-lg bg-blue-100 px-2 py-1 text-blue-800">Đang xử lý</span><span className="rounded-lg bg-emerald-100 px-2 py-1 text-emerald-800">Đã trả lời</span></div></div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-3">
        <TabsList className="grid w-full grid-cols-3 h-11 sm:inline-flex sm:w-auto sm:h-10"><TabsTrigger value="all">Tất cả</TabsTrigger><TabsTrigger value="price">Hỏi Giá</TabsTrigger><TabsTrigger value="progress">Hỏi Tiến Độ</TabsTrigger></TabsList>
        {(can("oq.report_own") || can("oq.report_all")) && <Button asChild variant="outline" className="mt-2 w-full h-11 sm:mt-0 sm:ml-2 sm:w-auto sm:h-10"><Link to="/order-quotes/report"><BarChart3 className="h-4 w-4 mr-1" />Báo cáo thống kê</Link></Button>}
      </Tabs>
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên hoặc mã yêu cầu" aria-label="Tìm yêu cầu theo tên hoặc mã" className="pl-8 h-11 rounded-xl text-base" />
        </div>
        <Sheet open={sheet} onOpenChange={setSheet}>
          <SheetTrigger asChild><Button variant={nFilters ? "secondary" : "outline"} className="h-10 shrink-0"><SlidersHorizontal className="h-4 w-4 mr-1" />Bộ lọc{nFilters ? ` (${nFilters})` : ""}</Button></SheetTrigger>
          <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "max-h-[85dvh] overflow-y-auto rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)]" : "overflow-y-auto"}>
            <SheetHeader><SheetTitle>Bộ lọc</SheetTitle></SheetHeader>
            {filterFields}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11" onClick={clear}>Xóa lọc</Button>
              <Button className="h-11" onClick={() => setSheet(false)}>Xem kết quả</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="-mx-4 mb-3 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]" role="tablist" aria-label="Trạng thái">
        <div className="flex w-max gap-1 border-b">
          {statusTabs.map((s) => {
            const on = st === s.value;
            return <button key={s.key} role="tab" style={s.value === "cancelled" ? { marginLeft: "0.75rem" } : undefined} aria-selected={on} onClick={() => setSt(s.value)}
              className={cn("-mb-px flex h-10 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-sm transition-colors", on ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {s.label}<span className={cn("rounded-full px-1.5 py-0.5 text-[11px] tabular-nums", on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{counts?.[s.key] ?? "…"}</span>
            </button>;
          })}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">Loại đơn: Đơn Sứ Quà Tặng · {total} kết quả{mode === "pending" ? " · chờ lâu nhất lên đầu" : ""}{isFetching ? " · đang cập nhật…" : ""}</div>

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
                <TableHead>Mã</TableHead><TableHead>Tên yêu cầu</TableHead>
                {mode === "pending" ? <><TableHead>Người gửi</TableHead><TableHead>Thời điểm gửi</TableHead><TableHead>Đã chờ</TableHead><TableHead>Cung ứng phụ trách</TableHead><TableHead /></>
                : mode === "processing" ? <><TableHead>Người phụ trách</TableHead><TableHead>Tiếp nhận lúc</TableHead><TableHead>Cập nhật gần nhất</TableHead><TableHead>Ngày khách cần</TableHead><TableHead>Tiến độ</TableHead><TableHead>Cung ứng xử lý</TableHead></>
                : <><TableHead className="text-center">SP/PA</TableHead><TableHead>Người tạo</TableHead><TableHead>Cung ứng phụ trách</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thời gian phản hồi</TableHead><TableHead>Thời gian Cung ứng xử lý</TableHead><TableHead>Cập nhật</TableHead>{st === "cancelled" && canDel && <TableHead />}</>}
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const od = overdue(r);
                  return (
                  <TableRow key={r.id + (r.flowCode ?? "")} className={cn("cursor-pointer", od && "bg-destructive/5 hover:bg-destructive/10")} onClick={() => open(r)}>
                    <TableCell className={cn("font-mono text-xs whitespace-nowrap", od && "border-l-2 border-l-destructive")}>{r.flowCode ?? r.code ?? "Nháp"}</TableCell>
                    <TableCell className="font-medium max-w-[260px] truncate">{r.title || "(chưa đặt tên)"}</TableCell>
                    {mode === "pending" ? <>
                      <TableCell className="text-sm">{name(r.creator_id)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{vnDateTime(r.submitted_at)}</TableCell>
                      <TableCell className="text-xs font-medium">{waitCell(r)}</TableCell>
                      <TableCell className="text-sm">{r.flows.map((f: any) => <div key={f.id}>{f.kind === "price" ? "Giá" : "Tiến độ"}: {name(f.assignee_id)}</div>)}</TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-1">{acceptBtns(r)}</div></TableCell>
                    </> : mode === "processing" ? <>
                      <TableCell className="text-sm">{r.flows.map((f: any) => <div key={f.id}>{f.kind === "price" ? "Giá" : "Tiến độ"}: {name(f.assignee_id)}</div>)}</TableCell>
                      <TableCell className="text-xs">{acceptedCell(r)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{vnDateTime(lastUpdate(r))}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.delivery_date ? <span className={cn(od && "font-semibold text-destructive")}>{vnDate(r.delivery_date)}{od ? " · Quá hạn" : ""}</span> : "—"}</TableCell>
                      <TableCell><StatusCell r={r} /></TableCell>
                      <TableCell className="text-xs">{r.flows.map((f: any) => <div key={f.id}><ListTimeCell t={times.current(f.id)} kind={f.kind} part="proc" /></div>)}</TableCell>
                    </> : <>
                      <TableCell className="text-center">{r.count}</TableCell>
                      <TableCell className="text-sm">{name(r.creator_id)}</TableCell>
                      <TableCell className="text-sm">{r.flows.map((f: any) => <div key={f.id}>{f.kind === "price" ? "Giá" : "Tiến độ"}: {name(f.assignee_id)}</div>)}</TableCell>
                      <TableCell><StatusCell r={r} />{od && <span className="mt-1 block text-xs font-semibold text-destructive">Quá hạn</span>}</TableCell>
                      <TableCell className="text-xs">{r.status === "draft" ? "—" : r.flows.map((f: any) => <div key={f.id}><ListTimeCell t={times.current(f.id)} kind={f.kind} part="resp" /></div>)}</TableCell>
                      <TableCell className="text-xs">{r.status === "draft" ? "—" : r.flows.map((f: any) => <div key={f.id}><ListTimeCell t={times.current(f.id)} kind={f.kind} part="proc" /></div>)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{vnDateTime(lastUpdate(r))}</TableCell>
                      {st === "cancelled" && canDel && <TableCell className="text-right">{delBtn(r)}</TableCell>}
                    </>}
                  </TableRow>); })}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-2">
            {rows.map((r) => { const od = overdue(r); return (
              <div key={r.id + (r.flowCode ?? "")} className={cn("oq-request-card w-full min-w-0 text-left rounded-2xl border bg-card p-4 space-y-3 shadow-soft", od && "border-destructive/50 border-l-4 border-l-destructive")}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><button className="min-w-0 break-words text-left text-base font-semibold leading-6" onClick={() => open(r)}>{r.title || "(chưa đặt tên)"}</button><span className="font-mono text-xs text-muted-foreground">{r.flowCode ?? r.code ?? "Nháp"}</span></div>
                <div className="flex flex-wrap items-center gap-1"><StatusCell r={r} />{od && <Badge variant="destructive">Quá hạn</Badge>}</div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                  {mode === "pending" ? <>
                    <span className="text-muted-foreground">Người gửi</span><span className="truncate">{name(r.creator_id)}</span>
                    <span className="text-muted-foreground">Gửi lúc</span><span>{vnDateTime(r.submitted_at)}</span>
                    <span className="text-muted-foreground">Đã chờ</span><span className="font-medium">{waitCell(r)}</span>
                  </> : mode === "processing" ? <>
                    {r.flows.map((f: any) => [<span key={f.id + "k"} className="text-muted-foreground">Phụ trách {f.kind === "price" ? "Giá" : "Tiến độ"}</span>, <span key={f.id} className="truncate">{name(f.assignee_id)}</span>])}
                    <span className="text-muted-foreground">Tiếp nhận</span><span>{acceptedCell(r)}</span>
                    <span className="text-muted-foreground">Ngày khách cần</span><span className={cn(od && "font-semibold text-destructive")}>{r.delivery_date ? vnDate(r.delivery_date) : "—"}</span>
                  </> : <>
                    <span className="text-muted-foreground">Người tạo</span><span className="truncate">{name(r.creator_id)}</span>
                    {r.flows.map((f: any) => [<span key={f.id + "k"} className="text-muted-foreground">Cung ứng {f.kind === "price" ? "Giá" : "Tiến độ"}</span>, <span key={f.id} className="truncate">{name(f.assignee_id)}</span>])}
                    <span className="text-muted-foreground">Sản phẩm/PA</span><span>{r.count}</span>
                  </>}
                </div>
                {r.status !== 'draft' && r.flows.length > 0 && <div className="rounded-xl bg-muted/50 p-3 space-y-2 text-xs">{r.flows.map((f: any) => <p key={f.id} className="leading-5 break-words"><strong>{f.kind === 'price' ? 'Hỏi giá' : 'Tiến độ'}:</strong> {f.status === 'pending' ? `Chờ ${name(f.assignee_id)} tiếp nhận` : f.status === 'answered' ? 'Đã có kết quả — mở để xem' : f.status === 'cancelled' ? 'Đã hủy' : f.waiting_info ? 'Chờ Sale bổ sung thông tin' : `${name(f.assignee_id)} đang xử lý`}</p>)}</div>}
                {mode !== "pending" && r.status !== "draft" && <details className="oq-timing-details text-xs"><summary className="cursor-pointer text-muted-foreground min-h-11 flex items-center">Thời gian xử lý</summary>
                {r.flows.map((f: any) => { const l = shortTimeLines(times.current(f.id), f.kind); return l && (
                  <div key={f.id + "t"} className="rounded bg-muted/40 px-2 py-1 text-xs">
                    <div className="font-medium uppercase text-[10px] tracking-wide">{f.kind === "price" ? "Giá" : "Tiến độ"} · {l.head}{l.running ? " (tạm tính)" : ""}</div>
                    <div>{l.resp}</div><div>{l.proc}</div>
                    <div className="text-[10px] text-muted-foreground">h = giờ · m = phút · s = giây</div>
                  </div>); })}
                </details>}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">Cập nhật {vnDateTime(lastUpdate(r))}</span>
                  <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" className="min-h-11 rounded-xl" onClick={() => open(r)}>{r.status === 'draft' ? 'Tiếp tục soạn' : 'Xem chi tiết'}</Button>{acceptBtns(r)}</div>
                </div>
              </div>); })}
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
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa yêu cầu {del?.code} đã hủy?</AlertDialogTitle>
            <AlertDialogDescription>Toàn bộ dữ liệu của yêu cầu sẽ bị xóa: sản phẩm/phương án, luồng Hỏi Giá và Hỏi Tiến Độ, các lượt xử lý, phản hồi, trao đổi, lịch sử, hình ảnh và thông báo liên quan. Không thể khôi phục bằng giao diện.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không xóa</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={!!busy} onClick={(e) => { e.preventDefault(); void doDelete(); }}>Xóa vĩnh viễn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const lastUpdate = (r: any) => [r.updated_at, ...r.flows.map((f: any) => f.updated_at)].sort().pop();

function StatusCell({ r }: { r: any }) {
  if (r.status === "draft") return <Badge variant="outline">Bản nháp</Badge>;
  if (r.status === "cancelled") return <Badge variant="outline" className="text-muted-foreground">Đã hủy</Badge>;
  return <div className="flex flex-col gap-1">{r.flows.map((f: any) => <FlowBadge key={f.id} kind={f.kind} status={f.status} waiting={f.waiting_info} />)}</div>;
}

