import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ChevronDown, Copy, ImagePlus, Trash2 } from "lucide-react";
import { RequirePermission } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/lib/auth";
import { oqApi } from "@/lib/orderQuotes/api";
import {
  CHOICE_LABEL, EVENT_LABEL, flowStatusLabel, IMG_CAT, catLabel, copyText, latestPublished, missing, progressCount, qtySummary, requestedCats, vnDate, vnDateTime,
  type PriceConfig, type Resp, type SnapItem,
} from "@/lib/orderQuotes/logic";
import { FlowBadge, ItemImages, useUserName } from "@/components/orderQuotes/OqCommon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order-quotes/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ flow: typeof s.flow === "string" ? s.flow : undefined }),
  head: () => ({ meta: [
    { title: "Chi tiết yêu cầu — Hỏi Giá & Tiến Độ" },
    { name: "description", content: "Theo dõi và xử lý yêu cầu hỏi giá, hỏi tiến độ theo từng sản phẩm." },
    { property: "og:title", content: "Chi tiết yêu cầu — Hỏi Giá & Tiến Độ" },
    { property: "og:description", content: "Phản hồi Cung ứng, trao đổi và lịch sử xử lý của yêu cầu." },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => (
    <RequirePermission perm={["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"]}>
      <OqDetail />
    </RequirePermission>
  ),
});

function OqDetail() {
  const { id } = Route.useParams();
  const { flow: flowParam } = Route.useSearch();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const { data: d, isLoading, error, refetch } = useQuery({ queryKey: ["oq", id], queryFn: () => oqApi.detail(id), refetchInterval: 60_000 });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["oq", id] }); qc.invalidateQueries({ queryKey: ["oq-list"] }); };
  const mine = d?.flows.find((f: any) => f.assignee_id === user?.id && f.status === "pending") ?? d?.flows.find((f: any) => f.assignee_id === user?.id && f.status === "processing");
  const flowId = flowParam && d?.flows.some((f: any) => f.id === flowParam) ? flowParam : (mine ?? d?.flows[0])?.id;

  useEffect(() => { if (d?.req.status === "draft") nav({ to: "/order-quotes/new", search: { id }, replace: true }); }, [d?.req.status]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  if (error && !d) return (
    <div className="py-16 text-center space-y-3"><p className="text-sm">Không tải được yêu cầu: {(error as Error).message}</p>
      <Button variant="outline" onClick={() => refetch()}>Thử lại</Button></div>
  );
  if (!d) return (
    <div className="py-20 text-center"><h2 className="text-lg font-semibold">Không tìm thấy yêu cầu</h2>
      <p className="text-sm text-muted-foreground mt-1">Yêu cầu không tồn tại hoặc bạn không có quyền xem.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/order-quotes">Về danh sách</Link></Button></div>
  );
  const flow = d.flows.find((f: any) => f.id === flowId);

  return (
    <div className="pb-10">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 mb-4 sm:flex sm:gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/order-quotes" aria-label="Về danh sách"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-muted-foreground">{d.req.code} · Đơn Sứ Quà Tặng</div>
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight break-words">{d.req.title}</h1>
          {d.req.status === "cancelled" && <Badge variant="outline" className="mt-1">Đã hủy — {d.req.cancel_reason}</Badge>}
        </div>
        <CancelButton d={d} flow={flow} onDone={refresh} />
      </div>
      {error && <div className="mb-3 rounded-md border border-destructive/40 p-2 text-sm flex items-center gap-2">Không cập nhật được dữ liệu mới nhất: {(error as Error).message}<Button size="sm" variant="outline" className="ml-auto" onClick={() => refetch()}>Thử lại</Button></div>}
      {d.flows.length > 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4 sm:flex">
          {d.flows.map((f: any) => (
            <Link key={f.id} to="/order-quotes/$id" params={{ id }} search={{ flow: f.id }} replace
              className={cn("min-w-0 rounded-md border px-3 py-2 text-sm", f.id === flowId ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent")}>
              <div className="truncate">{f.kind === "price" ? "Hỏi Giá" : "Hỏi Tiến Độ"} <span className="font-mono text-xs text-muted-foreground">{f.code}</span></div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{flowStatusLabel(f.kind, f.status)}{f.waiting_info && f.status === "processing" ? " · chờ Sale" : ""}</div>
            </Link>
          ))}
        </div>
      )}
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
        <OrderInfo d={d} onChanged={refresh} />
        {flow ? <div className="min-w-0">{d.flows.map((f: any) => <div key={f.id} className={f.id === flowId ? "" : "hidden"}><FlowPanel d={d} flow={f} onChanged={refresh} /></div>)}</div>
          : <Card><CardContent className="p-4 text-sm text-muted-foreground">Chưa có luồng xử lý.</CardContent></Card>}
      </div>
    </div>
  );
}

function OrderInfo({ d, onChanged }: { d: any; onChanged: () => void }) {
  const { user, can } = useCurrentUser();
  const name = useUserName();
  const isOwner = d.req.creator_id === user?.id || can("oq.manage");
  return (
    <div className="space-y-3">
      <Card><CardContent className="p-4 space-y-1.5 text-sm">
        <Info k="Người tạo" v={name(d.req.creator_id)} />
        <Info k="Gửi lúc" v={vnDateTime(d.req.submitted_at)} />
        <Info k="Giao tại" v={d.req.delivery_place || "—"} />
        <Info k="Ngày khách cần" v={vnDate(d.req.delivery_date)} />
        <Info k="Sản phẩm" v={qtySummary(d.req.items_mode, d.items)} />
        {d.req.note && <Info k="Ghi chú" v={d.req.note} />}
      </CardContent></Card>
      {d.items.map((it: any) => (
        <Collapsible key={it.id} defaultOpen={d.items.length <= 2}>
          <Card>
            <CollapsibleTrigger className="w-full flex items-center gap-2 p-3 text-left">
              <span className="font-mono text-xs text-muted-foreground">{it.code}</span>
              <span className="flex-1 font-medium truncate">{it.name}</span>
              {it.customer_choice && <Badge variant="secondary">{CHOICE_LABEL[it.customer_choice]}</Badge>}
              <span className="text-xs text-muted-foreground">{it.qty ?? ""} {it.unit ?? ""}</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent><CardContent className="px-3 pb-3 pt-0 space-y-2 text-sm">
              {it.detail && <Info k="Chi tiết" v={it.detail} />}
              {it.processing && <Info k="In ấn / gia công" v={it.processing} />}
              {it.note && <Info k="Ghi chú" v={it.note} />}
              <ItemImages images={d.images.filter((g: any) => g.item_id === it.id && !g.info_request_id)} />
              {d.images.some((g: any) => g.item_id === it.id && g.info_request_id) && (
                <div><div className="text-xs text-muted-foreground mb-1">Ảnh Sale bổ sung sau khi gửi</div>
                  <ItemImages images={d.images.filter((g: any) => g.item_id === it.id && g.info_request_id)} /></div>
              )}
              {isOwner && d.req.status === "submitted" && d.items.length > 1 && (
                <Select value={it.customer_choice ?? "none"} onValueChange={(v) => oqApi.setChoice(it.id, v === "none" ? null : v).then(onChanged).catch((e) => toast.error(e.message))}>
                  <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Chưa ghi nhận lựa chọn</SelectItem>{Object.entries(CHOICE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </CardContent></CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}

function FlowPanel({ d, flow, onChanged }: { d: any; flow: any; onChanged: () => void }) {
  const { user, can } = useCurrentUser();
  const name = useUserName();
  const rounds = d.rounds.filter((r: any) => r.flow_id === flow.id);
  const [roundNo, setRoundNo] = useState<number>(flow.current_round);
  useEffect(() => setRoundNo(flow.current_round), [flow.id, flow.current_round]);
  const round = rounds.find((r: any) => r.no === roundNo) ?? rounds[rounds.length - 1];
  const resps: Resp[] = d.resps.filter((r: any) => r.round_id === round?.id);
  const items: SnapItem[] = round?.items_snapshot ?? [];
  const cfg: PriceConfig = flow.kind === "price" ? round?.config ?? {} : {};
  const isCurrent = round?.no === flow.current_round;
  const canReply = can(flow.kind === "price" ? "oq.reply_price" : "oq.reply_progress");
  const isHandler = (flow.assignee_id === user?.id && canReply) || can("oq.manage");
  const canAccept = (flow.assignee_id === user?.id && canReply && can("oq.accept")) || can("oq.manage");
  const isOwner = d.req.creator_id === user?.id || can("oq.manage");
  const editable = isHandler && isCurrent && flow.status === "processing";
  const miss = missing(flow.kind, items, cfg, resps);
  const pc = progressCount(flow.kind, items, cfg, resps);
  const infos = d.infos.filter((i: any) => i.flow_id === flow.id);
  const events = d.events.filter((e: any) => e.flow_id === flow.id || !e.flow_id);
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, ok?: string): Promise<boolean> => { setBusy(true); try { await fn(); if (ok) toast.success(ok); onChanged(); return true; } catch (e: any) { toast.error(e.message); return false; } finally { setBusy(false); } };
  const conclusion = latestPublished(resps, "conclusion")?.content?.text;
  const targetsList = flow.kind === "price" ? items.filter((i) => requestedCats(cfg, i.id).length > 0) : items;
  const active = d.req.status === "submitted" && flow.status !== "cancelled";
  const navTargets: { id: string; code: string; name: string }[] = [...targetsList, ...(flow.kind === "price" && cfg.shipping_mode === "common" ? [{ id: "shipping", code: "VC", name: "Vận chuyển chung" }] : [])];
  const [sel, setSel] = useState<string>("");
  const selId = navTargets.some((t) => t.id === sel) ? sel : navTargets[0]?.id;
  const tStatus = (tid: string) => resps.some((r) => r.target === tid && r.is_published) ? "pub" : resps.some((r) => r.target === tid && !r.is_published) ? "draft" : "none";
  const isLastFor = (it: SnapItem) => miss.length > 0 && miss.every((m) => m.startsWith(`${it.code} ${it.name}:`));

  return (
    <div className="space-y-3">
      <Card><CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm">{flow.code}</span>
          <FlowBadge kind={flow.kind} status={flow.status} waiting={flow.waiting_info} />
          <span className="text-sm text-muted-foreground ml-auto">Phụ trách: <b className="text-foreground">{name(flow.assignee_id)}</b></span>
        </div>
        {(flow.status !== "pending" || resps.some((r) => r.is_published)) && (
          <div className="text-sm flex flex-wrap gap-x-3">
            <span>{flow.kind === "price" ? "Đã báo giá" : "Đã phản hồi"} <b>{pc.done}/{pc.total}</b> sản phẩm</span>
            {pc.shipping !== null && <span>Vận chuyển chung: <b>{pc.shipping ? "Đã phản hồi" : "Chưa phản hồi"}</b></span>}
            {rounds.length > 1 && <span className="text-muted-foreground">Lượt {round?.no}/{rounds.length}</span>}
          </div>
        )}
        {flow.status === "pending" && round?.accepted_at && <p className="text-xs text-muted-foreground">Luồng vừa được chuyển người phụ trách — người mới cần Xác nhận tiếp nhận để tiếp tục. Nháp và kết quả đã công bố được giữ nguyên.</p>}
        {rounds.length > 1 && (
          <div className="flex flex-wrap gap-1">{rounds.map((r: any) => <Button key={r.id} size="sm" variant={r.no === round?.no ? "default" : "outline"} onClick={() => setRoundNo(r.no)}>Lượt {r.no}</Button>)}</div>
        )}
        <div className="flex flex-wrap gap-2">
          {active && canAccept && flow.status === "pending" && isCurrent && <Button disabled={busy} onClick={() => run(() => oqApi.accept(flow.id), "Đã xác nhận tiếp nhận.")}>Xác nhận tiếp nhận</Button>}
          {active && editable && <AskInfo disabled={busy || flow.waiting_info} onSend={(q) => run(() => oqApi.requestInfo(flow.id, q), "Đã gửi yêu cầu bổ sung.")} />}
          {active && isOwner && flow.status !== "answered" && <Reassign flow={flow} disabled={busy} onPick={(u) => run(() => oqApi.reassign(flow.id, u), "Đã đổi người phụ trách — người mới sẽ nhận thông báo và cần xác nhận tiếp nhận.")} />}
          {active && isOwner && flow.status === "answered" && <Reask round={round} disabled={busy} onSend={(note, snap) => run(() => oqApi.reask(flow.id, note, null, snap), "Đã gửi yêu cầu hỏi lại.")} />}
          {resps.some((r) => r.is_published) && (
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(copyText(flow.kind, items, cfg, resps, conclusion)).then(() => toast.success("Đã sao chép kết quả đã công bố."))}><Copy className="h-4 w-4 mr-1" />Sao chép kết quả</Button>
          )}
        </div>
        {editable && flow.waiting_info && <div className="rounded-md border border-dashed p-2 text-xs">Đang chờ Sale bổ sung thông tin — bạn vẫn lưu nháp được, nút Công bố tạm khóa đến khi Sale trả lời.</div>}
        {editable && miss.length > 0 && <div className="rounded-md bg-muted p-2 text-xs"><b>Còn thiếu (luồng tự hoàn tất khi công bố đủ):</b><ul className="list-disc ml-4">{miss.map((m) => <li key={m}>{m}</li>)}</ul></div>}
      </CardContent></Card>

      {flow.waiting_info && isOwner && active && (() => { const open = infos.filter((i: any) => !i.answered_at).pop(); return open ? (
        <AnswerInfo info={open} requestId={d.req.id} items={d.items} images={d.images.filter((g: any) => g.info_request_id === open.id)} disabled={busy} onChanged={onChanged}
          onSend={(a) => run(() => oqApi.answerInfo(flow.id, a), "Đã gửi bổ sung.")} />) : null; })()}

      <Card><CardContent className="p-4 text-sm space-y-1.5">
        <div className="font-semibold mb-1">Sale yêu cầu (lượt {round?.no})</div>
        {round?.request_note && <p className="whitespace-pre-wrap">{round.request_note}</p>}
        {flow.kind === "price" ? (
          <>
            {cfg.shipping_mode === "common" && <Info k="Vận chuyển" v={`Hỏi chung${cfg.shipping_note ? `: ${cfg.shipping_note}` : ""}`} />}
            {cfg.note && round?.request_note !== cfg.note && <Info k="Ghi chú" v={cfg.note} />}
          </>
        ) : (
          <>
            <Info k="Loại kiểm tra" v={round?.config?.check_type === "in_progress" ? "Tiến độ đơn đang thực hiện" : "Khả năng đáp ứng"} />
            {round?.config?.existing_code && <Info k="Mã đơn hiện có" v={round.config.existing_code} />}
            <Info k="Ngày khách cần" v={vnDate(d.req.delivery_date)} />
          </>
        )}
      </CardContent></Card>

      {navTargets.length > 1 && (
        <div className="lg:hidden sticky top-14 z-10 -mx-1 bg-background/95 px-1 py-2 backdrop-blur">
          <div className="text-xs font-semibold mb-1.5">{flow.kind === "price" ? "BÁO GIÁ" : "PHẢN HỒI"} — {Math.max(1, navTargets.findIndex((t) => t.id === selId) + 1)}/{navTargets.length}</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {navTargets.map((t) => { const st = tStatus(t.id); return (
              <button key={t.id} type="button" onClick={() => setSel(t.id)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs", t.id === selId ? "border-primary bg-primary text-primary-foreground" : st === "pub" ? "border-primary/40 bg-primary/10" : st === "draft" ? "border-dashed border-foreground/40" : "")}>
                {t.code || t.name.slice(0, 12)} · {st === "pub" ? "Đã công bố" : st === "draft" ? "Nháp" : "Chưa"}
              </button>); })}
          </div>
        </div>
      )}
      {targetsList.map((it) => (
        <div key={`${round?.id}-${it.id}`} className={cn(navTargets.length > 1 && it.id !== selId && "hidden lg:block")}><ResponseCard isLast={isLastFor(it)} images={d.images.filter((g: any) => g.item_id === it.id)} kind={flow.kind} item={it} cfg={cfg} round={round} resps={resps.filter((r) => r.target === it.id)} editable={editable} busy={busy} locked={flow.waiting_info}
          onSave={(c) => run(() => oqApi.saveResponse(flow.id, it.id, c), "Đã lưu nháp phản hồi.")}
          onPublish={(c) => run(() => oqApi.publish(flow.id, it.id, c), "Đã công bố kết quả.")} name={name} /></div>
      ))}
      {flow.kind === "price" && cfg.shipping_mode === "common" && (
        <div className={cn(navTargets.length > 1 && selId !== "shipping" && "hidden lg:block")}><ResponseCard isLast={miss.every((m) => m === "Giá vận chuyển chung")} kind="price" item={{ id: "shipping", code: "VC", name: "Vận chuyển chung" }} cfg={cfg} round={round} shippingOnly resps={resps.filter((r) => r.target === "shipping")} editable={editable} busy={busy} locked={flow.waiting_info}
          onSave={(c) => run(() => oqApi.saveResponse(flow.id, "shipping", c), "Đã lưu nháp.")} onPublish={(c) => run(() => oqApi.publish(flow.id, "shipping", c), "Đã công bố.")} name={name} /></div>
      )}
      {flow.kind === "progress" && (editable || conclusion) && (
        <ResponseCard kind="conclusion" item={{ id: "conclusion", code: "", name: "Kết luận chung cho toàn bộ đơn hàng" }} cfg={cfg} round={round} resps={resps.filter((r) => r.target === "conclusion")} editable={editable} busy={busy} locked={flow.waiting_info}
          onSave={(c) => run(() => oqApi.saveResponse(flow.id, "conclusion", c), "Đã lưu nháp.")} onPublish={(c) => run(() => oqApi.publish(flow.id, "conclusion", c), "Đã công bố.")} name={name} />
      )}

      <Timeline events={events} infos={infos} flow={flow} name={name} canComment={active && (isOwner || flow.assignee_id === user?.id)} onComment={(t) => run(() => oqApi.comment(flow.id, t))} />
    </div>
  );
}

function ResponseCard({ kind, item, cfg, round, resps, editable, busy, locked, onSave, onPublish, name, shippingOnly, isLast, images }: {
  kind: "price" | "progress" | "conclusion"; item: SnapItem; cfg: PriceConfig; round: any; resps: Resp[]; editable: boolean; busy: boolean; locked?: boolean;
  onSave: (c: any) => Promise<boolean>; onPublish: (c: any) => Promise<boolean>; name: (id?: string) => string; shippingOnly?: boolean; isLast?: boolean; images?: any[];
}) {
  const draft = resps.find((r) => !r.is_published);
  const published = resps.filter((r) => r.is_published).sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  const latest = published[0];
  const server = draft?.content ?? latest?.content ?? {};
  const serverKey = JSON.stringify(server);
  const [c, setC] = useState<Record<string, any>>(server);
  const [dirty, setDirty] = useState(false);
  // Chỉ đồng bộ từ máy chủ khi không có nội dung chưa lưu (tải lại định kỳ không đè lên nội dung đang gõ).
  useEffect(() => { if (!dirty) setC(server); }, [serverKey]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const edit = (k: string, v: string) => { setC((p) => ({ ...p, [k]: v })); setDirty(true); };
  const [hist, setHist] = useState(false);
  const cats = shippingOnly ? (["shipping"] as const) : kind === "price" ? requestedCats(cfg, item.id) : [];
  const fields: { key: string; label: string; hint?: string; type?: string }[] =
    kind === "price" ? [...cats.map((k) => ({ key: k, label: catLabel(k), hint: shippingOnly ? cfg.shipping_note : (cfg.items?.[item.id] as any)?.[k]?.note })), ...(shippingOnly ? [] : [{ key: "note", label: "Ghi chú chung của Cung ứng" }])]
    : kind === "progress" ? [{ key: "reply", label: "Nội dung phản hồi tiến độ", hint: round?.config?.per_item?.[item.id] }, { key: "capability", label: "Khả năng đáp ứng" }, { key: "eta", label: "Ngày dự kiến giao", type: "date" }, { key: "note", label: "Ghi chú & điều kiện" }]
    : [{ key: "text", label: "Kết luận" }];

  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {item.code && <span className="font-mono text-xs text-muted-foreground">{item.code}</span>}
        <span className="font-medium flex-1">{item.name}{item.qty ? ` · ${item.qty} ${item.unit ?? ""}` : ""}</span>
        {latest ? <Badge>Đã công bố v{latest.version}</Badge> : editable && draft ? null : <Badge variant="outline">Chưa phản hồi</Badge>}
        {editable && draft && <Badge variant="secondary" className="border-dashed">Đã lưu nháp</Badge>}
      </div>
      {editable && images && images.length > 0 && <div className="lg:hidden"><div className="text-xs text-muted-foreground mb-1">Ảnh Sale gửi</div><ItemImages images={images} /></div>}
      {editable ? (
        <>
          {fields.map((fd) => (
            <div key={fd.key}>
              <Label>{fd.label}</Label>
              {fd.hint && <p className="text-xs text-muted-foreground mb-1">Sale yêu cầu: {fd.hint}</p>}
              {fd.type === "date" ? <Input type="date" value={c[fd.key] ?? ""} onChange={(e) => edit(fd.key, e.target.value)} className="w-48" />
                : <Textarea rows={fd.key === "note" || fd.key === "capability" ? 2 : 3} className="field-sizing-content min-h-16 max-h-[50dvh]" value={c[fd.key] ?? ""} onChange={(e) => edit(fd.key, e.target.value)} />}
            </div>
          ))}
          <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-wrap gap-2 justify-end border-t bg-card/95 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:static md:m-0 md:border-0 md:bg-transparent md:p-0">
            {dirty && <span className="w-full text-xs text-muted-foreground md:w-auto md:mr-auto md:self-center">Có thay đổi chưa lưu</span>}
            <Button variant="outline" className="flex-1 h-11 md:flex-none md:h-9" disabled={busy} onClick={async () => { if (await onSave(c)) setDirty(false); }}>Lưu nháp</Button>
            <Button className="flex-1 h-11 md:flex-none md:h-9" disabled={busy || locked} title={locked ? "Đang chờ Sale bổ sung thông tin" : undefined}
              onClick={async () => { if (confirm((latest ? `Công bố phiên bản mới v${(latest.version ?? 0) + 1}? Bản cũ vẫn được giữ.` : kind === "price" ? "Công bố báo giá sản phẩm này?" : "Công bố kết quả này cho Sale?") + (isLast ? "\n\nĐây là phần cuối cùng còn thiếu — luồng sẽ tự hoàn tất sau khi công bố." : "")) && (await onPublish(c))) setDirty(false); }}>
              {kind === "price" ? (latest ? "Công bố báo giá mới" : "Công bố báo giá") : kind === "progress" ? (latest ? "Công bố phản hồi mới" : "Công bố phản hồi tiến độ") : "Công bố kết luận"}</Button>
          </div>
        </>
      ) : latest ? (
        <PublishedView content={latest.content} fields={fields} />
      ) : (
        <>
          {!shippingOnly && kind === "price" && <div className="text-xs text-muted-foreground">Hạng mục yêu cầu: {cats.map(catLabel).join(", ")}</div>}
          <p className="text-sm text-muted-foreground">Chưa có kết quả được công bố.</p>
        </>
      )}
      {latest && <div className="text-xs text-muted-foreground">Công bố bởi {name((latest as any).published_by)} lúc {vnDateTime((latest as any).published_at)}</div>}
      {published.length > 1 && (
        <div>
          <button className="text-xs text-primary" onClick={() => setHist(!hist)}>{hist ? "Ẩn" : "Xem"} {published.length - 1} phiên bản trước</button>
          {hist && published.slice(1).map((p) => (
            <div key={p.version} className="mt-2 rounded border border-dashed p-2 text-xs opacity-80">
              <div className="font-medium mb-1">v{p.version} · {vnDateTime((p as any).published_at)}</div>
              <PublishedView content={p.content} fields={fields} />
            </div>
          ))}
        </div>
      )}
    </CardContent></Card>
  );
}

function PublishedView({ content, fields }: { content: Record<string, any>; fields: { key: string; label: string; type?: string }[] }) {
  return <div className="space-y-1.5 text-sm">{fields.filter((f) => content[f.key]).map((f) => (
    <div key={f.key}><div className="text-xs text-muted-foreground">{f.label}</div><div className="whitespace-pre-wrap">{f.type === "date" ? vnDate(content[f.key]) : content[f.key]}</div></div>
  ))}</div>;
}

function Timeline({ events, infos, flow, name, canComment, onComment }: { events: any[]; infos: any[]; flow: any; name: (id?: string) => string; canComment: boolean; onComment: (t: string) => void }) {
  const [t, setT] = useState("");
  const list = useMemo(() => [...events].reverse(), [events]);
  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="font-semibold">Trao đổi & lịch sử</div>
      {canComment && (
        <div className="flex gap-2"><Textarea rows={2} value={t} onChange={(e) => setT(e.target.value)} placeholder="Nhập trao đổi…" />
          <Button disabled={!t.trim()} onClick={() => { onComment(t); setT(""); }}>Gửi</Button></div>
      )}
      <ol className="space-y-2 text-sm">
        {list.map((e) => (
          <li key={e.id} className={cn("border-l-2 pl-3", e.kind === "message" || e.kind.startsWith("info_") ? "border-primary" : "border-muted")}>
            <div className="text-xs text-muted-foreground">{vnDateTime(e.created_at)} · {name(e.actor_id)}{e.round_no ? ` · lượt ${e.round_no}` : ""}</div>
            <div className="font-medium">{EVENT_LABEL[e.kind] ?? e.kind}{e.kind === "reassigned" && `: ${name(e.detail?.from)} → ${name(e.detail?.to)}`}{e.kind === "assigned" && `: ${name(e.detail?.to)}`}{e.kind === "published" && e.detail?.version ? ` (v${e.detail.version})` : ""}</div>
            {(e.detail?.text || e.detail?.question || e.detail?.answer || e.detail?.note || e.detail?.reason) && <div className="whitespace-pre-wrap">{e.detail.text ?? e.detail.question ?? e.detail.answer ?? e.detail.note ?? e.detail.reason}</div>}
          </li>
        ))}
      </ol>
      {infos.length > 0 && <p className="text-xs text-muted-foreground">Đã yêu cầu bổ sung {infos.length} lần{flow.waiting_info ? " · đang chờ Sale" : ""}.</p>}
    </CardContent></Card>
  );
}

function AskInfo({ disabled, onSend }: { disabled: boolean; onSend: (q: string) => void }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState("");
  if (!open) return <Button variant="outline" disabled={disabled} onClick={() => setOpen(true)}>Yêu cầu bổ sung thông tin</Button>;
  return <div className="w-full space-y-2"><Textarea rows={2} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nội dung cần Sale làm rõ" />
    <div className="flex gap-2"><Button size="sm" disabled={!q.trim()} onClick={() => { onSend(q); setOpen(false); setQ(""); }}>Gửi yêu cầu</Button><Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button></div></div>;
}
function AnswerInfo({ info, requestId, items, images, disabled, onSend, onChanged }: { info: any; requestId: string; items: any[]; images: any[]; disabled: boolean; onSend: (a: string) => Promise<boolean>; onChanged: () => void }) {
  const [a, setA] = useState("");
  const [item, setItem] = useState<string>(items[0]?.id ?? "");
  const [cat, setCat] = useState("logo");
  const [cap, setCap] = useState("");
  const [up, setUp] = useState(false);
  const add = async (fl: FileList | null) => {
    if (!fl?.length || !item) return;
    setUp(true);
    try { for (const file of Array.from(fl)) await oqApi.uploadInfoImage(requestId, info.id, item, file, cat, cap); setCap(""); toast.success("Đã tải ảnh bổ sung."); onChanged(); }
    catch (e: any) { toast.error(e.message); } finally { setUp(false); }
  };
  return <Card className="border-primary"><CardContent className="p-4 space-y-3">
    <div className="font-semibold text-sm">Cung ứng cần bạn bổ sung</div><p className="text-sm whitespace-pre-wrap">{info.question}</p>
    <Textarea rows={3} value={a} onChange={(e) => setA(e.target.value)} placeholder="Nội dung bổ sung" />
    <div className="rounded-md border p-3 space-y-2">
      <div className="text-sm font-medium">Ảnh bổ sung (tùy chọn)</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Select value={item} onValueChange={setItem}><SelectTrigger className="h-9"><SelectValue placeholder="Chọn sản phẩm" /></SelectTrigger>
          <SelectContent>{items.map((it) => <SelectItem key={it.id} value={it.id}>{it.code} {it.name}</SelectItem>)}</SelectContent></Select>
        <Select value={cat} onValueChange={setCat}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(IMG_CAT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
        <Input className="h-9" value={cap} onChange={(e) => setCap(e.target.value)} placeholder="Chú thích ảnh" maxLength={1000} />
      </div>
      <Button type="button" variant="outline" size="sm" disabled={up || !item} asChild>
        <label className="cursor-pointer"><ImagePlus className="h-4 w-4 mr-1" />{up ? "Đang tải…" : "Chọn / chụp ảnh"}<input type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} /></label>
      </Button>
      {images.length > 0 && <div className="space-y-2">{items.filter((it) => images.some((g) => g.item_id === it.id)).map((it) => (
        <div key={it.id}><div className="text-xs text-muted-foreground mb-1">{it.code} {it.name}</div>
          <ItemImages images={images.filter((g) => g.item_id === it.id)} />
          <div className="flex flex-wrap gap-1 mt-1">{images.filter((g) => g.item_id === it.id).map((g) => (
            <Button key={g.id} size="sm" variant="ghost" className="h-7 text-xs" onClick={() => oqApi.deleteInfoImage(g.id).then(onChanged).catch((e) => toast.error(e.message))}><Trash2 className="h-3 w-3 mr-1" />Bỏ ảnh {g.caption ?? IMG_CAT[g.category]}</Button>
          ))}</div></div>
      ))}</div>}
    </div>
    <Button size="sm" disabled={disabled || up || !a.trim()} onClick={async () => { if (await onSend(a)) setA(""); }}>Gửi bổ sung</Button></CardContent></Card>;
}
function Reassign({ flow, disabled, onPick }: { flow: any; disabled: boolean; onPick: (u: string) => void }) {
  const users = useQuery({ queryKey: ["oq-assignees", flow.kind], queryFn: () => oqApi.assignees(flow.kind) }).data ?? [];
  return <Select value="" onValueChange={(v) => v !== flow.assignee_id && confirm("Đổi người phụ trách luồng này?") && onPick(v)} disabled={disabled}>
    <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Đổi người phụ trách" /></SelectTrigger>
    <SelectContent>{users.filter((u) => u.id !== flow.assignee_id).map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}</SelectContent></Select>;
}
function Reask({ round, disabled, onSend }: { round: any; disabled: boolean; onSend: (note: string, snap: any) => void }) {
  const [open, setOpen] = useState(false); const [note, setNote] = useState("");
  const [snap, setSnap] = useState<any[]>(round?.items_snapshot ?? []);
  useEffect(() => setSnap(round?.items_snapshot ?? []), [round?.id]);
  const badQty = snap.some((it) => !(Number(it.qty) > 0));
  if (!open) return <Button variant="outline" disabled={disabled} onClick={() => setOpen(true)}>Hỏi lại</Button>;
  return <div className="w-full space-y-2 rounded-md border p-3">
    <Label>Nội dung hỏi lại *</Label><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: khách đổi thành 1.000 bộ" />
    <div className="text-xs text-muted-foreground">Điều chỉnh số lượng áp dụng cho lượt mới (kết quả lượt cũ được giữ nguyên):</div>
    {snap.map((it, i) => <div key={it.id} className="flex items-center gap-2 text-sm"><span className="flex-1 truncate">{it.code} {it.name}</span>
      <Input type="number" className="w-28 h-8" value={it.qty ?? ""} onChange={(e) => setSnap(snap.map((x, j) => (j === i ? { ...x, qty: e.target.value === "" ? null : Number(e.target.value) } : x)))} /><span className="w-10 text-xs">{it.unit}</span></div>)}
    <div className="flex gap-2">{badQty && <span className="text-xs text-destructive self-center">Số lượng phải lớn hơn 0.</span>}<Button size="sm" disabled={!note.trim() || badQty} onClick={() => { onSend(note, snap); setOpen(false); setNote(""); }}>Gửi hỏi lại</Button><Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Hủy</Button></div></div>;
}
function CancelButton({ d, flow, onDone }: { d: any; flow: any; onDone: () => void }) {
  const { user, can } = useCurrentUser();
  if (d.req.status !== "submitted" || !(d.req.creator_id === user?.id || can("oq.manage"))) return null;
  const go = (flowId: string | null) => {
    const reason = prompt(flowId ? "Lý do dừng luồng này:" : "Lý do hủy toàn bộ yêu cầu:");
    if (reason?.trim()) oqApi.cancel(d.req.id, flowId, reason).then(() => { toast.success("Đã hủy."); onDone(); }).catch((e) => toast.error(e.message));
  };
  return <div className="col-span-2 flex flex-wrap justify-end gap-2 sm:col-span-1">
    {flow && d.flows.length > 1 && flow.status !== "cancelled" && <Button variant="ghost" size="sm" onClick={() => go(flow.id)}>Dừng luồng này</Button>}
    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => go(null)}>Hủy yêu cầu</Button></div>;
}

const Info = ({ k, v }: { k: string; v: string }) => <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-muted-foreground">{k}</span><span className="whitespace-pre-wrap break-words">{v}</span></div>;
