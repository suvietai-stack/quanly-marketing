import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, ExternalLink, Check, AlertTriangle, Plus, History, Pencil } from "lucide-react";
import { RequirePermission } from "@/components/PermissionGate";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { otApi, fmtDate, fmtDateTime, type OtOrder, type OtSupplier } from "@/lib/orderTracking/api";
import { usePeople } from "@/lib/orderTracking/hooks";
import {
  KIND_LABEL, TASK_STATUS, ORDER_STATUS, ORDER_TYPE, PROC_TYPE, journey, received, packBlocker, sendable, taskDue, isOverdue, daysLeft, todayVN,
  type OtTask, type OtReceipt,
} from "@/lib/orderTracking/logic";
import { cn } from "@/lib/utils";
import { ReschedulePanel } from "@/components/orderTracking/Reschedule";

export const Route = createFileRoute("/order-tracking/$id")({
  head: () => ({ meta: [
    { title: "Hành trình đơn hàng — Base" },
    { name: "description", content: "Chi tiết hành trình thực hiện đơn hàng và nhật ký cập nhật." },
    { property: "og:title", content: "Hành trình đơn hàng — Base" },
    { property: "og:description", content: "Chi tiết hành trình thực hiện đơn hàng và nhật ký cập nhật." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm={["ot.view_own", "ot.view_all", "ot.task_view", "ot.create", "ot.manage"]}><Detail /></RequirePermission>,
});

const ACTION_LABEL: Record<string, string> = {
  create: "Tạo đơn", accept: "Tiếp nhận đơn", update_order: "Sửa thông tin đơn", plan: "Lập kế hoạch", proc_add: "Thêm lượt gia công",
  task_update: "Cập nhật công việc", ordered: "Xác nhận đã đặt", receive: "Ghi nhận hàng về", mail_sent: "Xác nhận đã gửi mail sản xuất",
  sent: "Gửi phôi đi gia công", pack_done: "Hoàn thành đóng gói", shipped: "Xuất hàng", delivered: "Khách đã nhận hàng", fix_time: "Điều chỉnh thời gian thực tế", cancel: "Hủy đơn",
  reschedule_propose: "Đề xuất điều chỉnh ngày khách nhận", reschedule_accept: "Đồng ý điều chỉnh ngày khách nhận", reschedule_reject: "Từ chối điều chỉnh lịch",
  reschedule_counter: "Đề xuất ngày khác", reschedule_withdraw: "Rút đề xuất điều chỉnh",
};
const FIELD_LABEL: Record<string, string> = {
  supplier_id: "Nhà cung cấp", assignee_id: "Người phụ trách", qty: "Số lượng", planned_date: "Hạn dự kiến", planned_arrival: "Dự kiến hàng về",
  mail_due: "Hạn gửi mail", send_planned: "Dự kiến gửi phôi", note: "Ghi chú", status: "Trạng thái", proc_type: "Loại gia công",
  ordered_at: "Thời điểm đặt", mail_sent_at: "Thời điểm gửi mail", sent_at: "Thời điểm gửi phôi", shipped_at: "Thời điểm xuất hàng", done_at: "Thời điểm hoàn thành",
  sale_id: "Kinh doanh", supply_id: "Cung ứng", has_box: "Có đặt hộp", has_processing: "Có in ấn/gia công", title: "Tên đơn", address: "Địa chỉ", crm_url: "Link CRM", due_time: "Giờ nhận", due_date: "Ngày khách nhận", proposed: "Ngày đề xuất", contact_date: "Ngày liên hệ lại NCC",
};

function useErr() {
  const qc = useQueryClient();
  return async (fn: () => Promise<unknown>, ok?: string) => {
    try { await fn(); await qc.invalidateQueries({ queryKey: ["ot"] }); if (ok) toast.success(ok); return true; }
    catch (e: any) { toast.error(e.message); return false; }
  };
}

function Detail() {
  const { id } = Route.useParams();
  const { can, user } = useCurrentUser();
  const people = usePeople();
  const order = useQuery({ queryKey: ["ot", "order", id], queryFn: () => otApi.order(id) });
  const tasks = useQuery({ queryKey: ["ot", "tasks", id], queryFn: () => otApi.tasks(id) });
  const ids = (tasks.data ?? []).map((t) => t.id);
  const receipts = useQuery({ queryKey: ["ot", "receipts", id, ids.join()], queryFn: () => otApi.receipts(ids), enabled: !!tasks.data });
  const suppliers = useQuery({ queryKey: ["ot", "suppliers"], queryFn: otApi.suppliers });
  const logs = useQuery({ queryKey: ["ot", "logs", id], queryFn: () => otApi.logs(id) });
  const run = useErr();

  if (order.isLoading) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  const o = order.data;
  if (!o) return <div className="py-16 text-center"><p className="text-muted-foreground">Không tìm thấy đơn hàng hoặc bạn không có quyền xem.</p><Link to="/order-tracking" className="text-primary text-sm">Về danh sách</Link></div>;
  const ts = tasks.data ?? [];
  const rs = receipts.data ?? [];
  const active = o.status === "in_progress";
  const canStage = can("ot.manage") || can("ot.stage_update");
  const canTask = (t: OtTask) => canStage || (t.assignee_id === user?.id && can("ot.task_update"));
  const today = todayVN();
  const dl = daysLeft(o.due_date, today);
  const j = journey(o, ts);
  const sup = suppliers.data ?? [];
  const ctx = { o, ts, rs, sup, people, run, active, canStage, canTask, today };

  return (
    <div className="space-y-5 pb-10">
      <Link to="/order-tracking" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Danh sách đơn</Link>
      <div className="rounded-lg border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{o.code}</span>
          <Badge variant={o.order_type === "sample" ? "outline" : "secondary"}>{ORDER_TYPE[o.order_type]}</Badge>
          <Badge variant="outline">{ORDER_STATUS[o.status]}</Badge>
        </div>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{o.title}</h1>
        <div className={cn("mt-3 flex flex-wrap items-center gap-2 rounded-md px-3 py-2", o.status !== "done" && dl < 0 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
          <CalendarClock className="h-5 w-5" />
          <span className="text-base">Ngày khách nhận: <b className="text-lg">{fmtDate(o.due_date)}</b>{o.due_time ? ` lúc ${o.due_time}` : ""}</span>
          {["new", "in_progress"].includes(o.status) && <span className="text-sm">· {dl < 0 ? `quá ${-dl} ngày` : dl === 0 ? "hôm nay" : `còn ${dl} ngày`}</span>}
          {o.original_due !== o.due_date && <span className="text-xs">(ban đầu {fmtDate(o.original_due)})</span>}
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <Row label="Kinh doanh">{people.name(o.sale_id)}</Row>
          <Row label="Cung ứng">{people.name(o.supply_id)}</Row>
          <Row label="Địa chỉ giao">{o.address || "—"}</Row>
          <Row label="Tạo lúc">{fmtDateTime(o.created_at)}</Row>
          {o.note && <Row label="Ghi chú">{o.note}</Row>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {o.crm_url && <Button asChild variant="outline" size="sm"><a href={o.crm_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" />Xem trên CRM</a></Button>}
          {o.status === "new" && (can("ot.accept") || can("ot.manage")) && <Button size="sm" onClick={() => run(() => otApi.accept(o.id), "Đã tiếp nhận đơn.")}><Check className="h-4 w-4 mr-1" />Tiếp nhận đơn</Button>}
          {(can("ot.assign") || can("ot.manage")) && ["new", "in_progress"].includes(o.status) && <AssignButton o={o} people={people.list} run={run} />}
          {can("ot.manage") && ["new", "in_progress"].includes(o.status) && <CancelButton id={o.id} run={run} />}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm font-medium mb-3">Hành trình</div>
        <ol className="flex flex-wrap items-center gap-2">
          {j.steps.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm", s.done ? "border-primary bg-primary text-primary-foreground" : s.key === j.current && o.status !== "cancelled" ? "border-primary text-primary font-medium" : "text-muted-foreground")}>
                {s.done && <Check className="h-3.5 w-3.5" />}{s.label}
              </span>
              {i < j.steps.length - 1 && <span className="text-muted-foreground">→</span>}
            </li>
          ))}
        </ol>
        {o.has_box && <p className="mt-2 text-xs text-muted-foreground">Đặt hộp được triển khai song song với đặt phôi.</p>}
      </div>

      <ReschedulePanel o={o} name={people.name} />

      {active && canStage && <PlanCard o={o} run={run} />}
      {o.status === "new" && <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Cung ứng cần tiếp nhận đơn trước khi lập kế hoạch các công đoạn.</p>}

      <div className="space-y-3">
        {ts.filter((t) => (t.kind === "blank" || t.kind === "box") && t.status !== "skipped").map((t) => <TaskCard key={t.id} t={t} ctx={ctx} />)}
        {o.has_processing && <ProcSection ctx={ctx} />}
        {ts.filter((t) => t.kind === "packing" || t.kind === "delivery").map((t) => <TaskCard key={t.id} t={t} ctx={ctx} />)}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium"><History className="h-4 w-4" />Nhật ký cập nhật</div>
        {(logs.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Chưa có.</p> :
          <ul className="space-y-2">{(logs.data ?? []).map((l) => {
            const t = ts.find((x) => x.id === l.task_id);
            return (
              <li key={l.id} className="border-l-2 pl-3 text-sm">
                <div><b>{people.name(l.actor_id)}</b> · {ACTION_LABEL[l.action] ?? l.action}{t ? ` — ${KIND_LABEL[t.kind]}` : ""}<span className="ml-2 text-xs text-muted-foreground">{fmtDateTime(l.created_at)}</span></div>
                <LogDiff l={l} sup={sup} name={people.name} />
                {l.reason && <div className="text-xs text-muted-foreground">Lý do: {l.reason}</div>}
              </li>
            );
          })}</ul>}
      </div>
    </div>
  );
}

function fmtVal(k: string, v: any, sup: OtSupplier[], name: (id?: string | null) => string) {
  if (v == null || v === "") return "—";
  if (k === "supplier_id") return sup.find((s) => s.id === v)?.name ?? "—";
  if (["assignee_id", "sale_id", "supply_id"].includes(k)) return name(v);
  if (k === "status") return TASK_STATUS[v as OtTask["status"]] ?? v;
  if (typeof v === "boolean") return v ? "Có" : "Không";
  if (k.endsWith("_at")) return fmtDateTime(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return fmtDate(v);
  return String(v);
}
function LogDiff({ l, sup, name }: { l: { old: any; new: any; action: string }; sup: OtSupplier[]; name: (id?: string | null) => string }) {
  if (!l.new || typeof l.new !== "object") return null;
  const keys = Object.keys(l.new).filter((k) => k !== "code");
  if (!keys.length) return null;
  return <div className="text-xs text-muted-foreground">{keys.map((k) => (
    <div key={k}>{FIELD_LABEL[k] ?? (k === "qty" ? "Số lượng" : k)}: {l.old ? <>{fmtVal(k, l.old[k], sup, name)} → </> : null}{fmtVal(k, l.new[k], sup, name)}</div>
  ))}</div>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2"><span className="text-muted-foreground">{label}:</span><span>{children}</span></div>;
}

type Ctx = {
  o: OtOrder; ts: OtTask[]; rs: OtReceipt[]; sup: OtSupplier[]; people: ReturnType<typeof usePeople>;
  run: ReturnType<typeof useErr>; active: boolean; canStage: boolean; canTask: (t: OtTask) => boolean; today: string;
};

function PlanCard({ o, run }: { o: OtOrder; run: Ctx["run"] }) {
  const [box, setBox] = useState(o.has_box);
  const [proc, setProc] = useState(o.has_processing);
  const [qty, setQty] = useState(o.qty ? String(o.qty) : "");
  const [open, setOpen] = useState(!o.planned);
  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Pencil className="h-4 w-4 mr-1" />Sửa kế hoạch công đoạn</Button>;
  return (
    <div className="rounded-lg border border-primary/40 bg-card p-4 space-y-3">
      <div className="font-medium">Lập kế hoạch công đoạn</div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1"><Label>Số lượng sản phẩm *</Label><Input type="number" min={1} className="w-36" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={box} onCheckedChange={(v) => setBox(!!v)} />Có đặt hộp</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={proc} onCheckedChange={(v) => setProc(!!v)} />Có in ấn / gia công</label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={async () => { if (await run(() => otApi.plan(o.id, box, proc, Number(qty)), "Đã lưu kế hoạch.")) setOpen(false); }}>Lưu kế hoạch</Button>
        {o.planned && <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Đóng</Button>}
      </div>
    </div>
  );
}

function SupplierSelect({ value, onChange, sup, disabled }: { value: string | null; onChange: (v: string) => void; sup: OtSupplier[]; disabled?: boolean }) {
  const list = sup.filter((s) => s.active || s.id === value);
  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger>
      <SelectContent>{list.length === 0 ? <div className="p-2 text-sm text-muted-foreground">Chưa có nhà cung cấp.</div> : list.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function DateField({ label, value, onSave, disabled }: { label: string; value: string | null; onSave: (v: string) => void; disabled?: boolean }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label><Input type="date" defaultValue={value ?? ""} disabled={disabled} onBlur={(e) => e.target.value !== (value ?? "") && onSave(e.target.value)} /></div>;
}

function TaskShell({ t, ctx, title, children }: { t: OtTask; ctx: Ctx; title: ReactNode; children: ReactNode }) {
  const due = taskDue(t);
  const late = !["done", "skipped"].includes(t.status) && isOverdue(due, false, ctx.today);
  return (
    <div className={cn("rounded-lg border bg-card p-4", late && "border-destructive/60")}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-medium">{title}</div>
        <Badge variant={t.status === "done" ? "default" : "outline"}>{TASK_STATUS[t.status]}</Badge>
        {late && <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" />Quá hạn {fmtDate(due)}</span>}
        <span className="ml-auto text-xs text-muted-foreground">Phụ trách: {ctx.people.name(t.assignee_id)}</span>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function CommonFields({ t, ctx, dates }: { t: OtTask; ctx: Ctx; dates: [keyof OtTask, string][] }) {
  const edit = ctx.canTask(t) && ctx.active;
  const up = (d: any) => ctx.run(() => otApi.updateTask(t.id, d), "Đã cập nhật.");
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {["blank", "box", "proc"].includes(t.kind) && <div className="space-y-1"><Label className="text-xs">Nhà cung cấp</Label><SupplierSelect value={t.supplier_id} sup={ctx.sup} disabled={!edit} onChange={(v) => up({ supplier_id: v })} /></div>}
      {ctx.canStage && ctx.active && <div className="space-y-1"><Label className="text-xs">Người phụ trách</Label>
        <Select value={t.assignee_id ?? ""} onValueChange={(v) => up({ assignee_id: v })}><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
          <SelectContent>{ctx.people.list.filter((p) => p.supply).map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select></div>}
      {dates.map(([k, l]) => <DateField key={k} label={l} value={t[k] as string | null} disabled={!(ctx.canStage || (k === "planned_arrival" && edit)) || !ctx.active} onSave={(v) => up({ [k]: v })} />)}
      {edit && t.status !== "done" && <div className="space-y-1"><Label className="text-xs">Trạng thái</Label>
        <Select value={t.status} onValueChange={(v) => up({ status: v })}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{(["todo", "doing", "waiting"] as const).map((s) => <SelectItem key={s} value={s}>{TASK_STATUS[s]}</SelectItem>)}</SelectContent></Select></div>}
    </div>
  );
}

function QtyBar({ t, ctx, sentLabel }: { t: OtTask; ctx: Ctx; sentLabel?: boolean }) {
  const got = received(t.id, ctx.rs);
  const qty = Number(t.qty ?? 0);
  const list = ctx.rs.filter((r) => r.task_id === t.id);
  return (
    <div className="rounded-md bg-muted/50 p-3 text-sm">
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        <span>Số lượng: <b>{qty}</b></span>
        {sentLabel && <span>Đã gửi: <b>{t.sent_qty}</b></span>}
        <span>Đã nhận: <b>{got}</b></span>
        <span className={qty - got > 0 ? "text-destructive" : "text-primary"}>Còn thiếu: <b>{Math.max(0, qty - got)}</b></span>
      </div>
      {list.length > 0 && <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">{list.map((r, i) => <li key={r.id}>Lần {i + 1}: {r.qty} · {fmtDateTime(r.received_at)} · {ctx.people.name(r.actor_id)}</li>)}</ul>}
    </div>
  );
}

function QtyAction({ label, max, onDo, disabled }: { label: string; max: number; onDo: (n: number) => Promise<boolean>; disabled?: boolean }) {
  const [n, setN] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input type="number" min={1} max={max} placeholder={`Tối đa ${max}`} className="w-32" value={n} onChange={(e) => setN(e.target.value)} disabled={disabled || max <= 0} />
      <Button size="sm" disabled={disabled || max <= 0 || !n} onClick={async () => { if (await onDo(Number(n))) setN(""); }}>{label}</Button>
    </div>
  );
}

function TimeLine({ t, ctx, field, label }: { t: OtTask; ctx: Ctx; field: keyof OtTask; label: string }) {
  const v = t[field] as string | null;
  if (!v) return null;
  return <div className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{label}: {fmtDateTime(v)}{ctx.canStage && <FixTime t={t} field={String(field)} value={v} run={ctx.run} />}</div>;
}

function TaskCard({ t, ctx }: { t: OtTask; ctx: Ctx }) {
  const edit = ctx.canTask(t) && ctx.active;
  const act = (a: string, n?: number, ok?: string) => ctx.run(() => otApi.action(t.id, a, n), ok ?? "Đã cập nhật.");
  const got = received(t.id, ctx.rs);
  if (t.kind === "blank" || t.kind === "box") {
    return (
      <TaskShell t={t} ctx={ctx} title={KIND_LABEL[t.kind]}>
        <CommonFields t={t} ctx={ctx} dates={[["planned_date", "Dự kiến đặt"], ["planned_arrival", "Dự kiến hàng về"]]} />
        <QtyBar t={t} ctx={ctx} />
        <TimeLine t={t} ctx={ctx} field="ordered_at" label="Đã đặt" />
        {edit && !t.ordered_at && <div>
          <Button size="sm" disabled={!t.supplier_id} onClick={() => act("ordered", undefined, "Đã xác nhận đặt hàng.")}>Xác nhận đã đặt</Button>
          {!t.supplier_id && <p className="mt-1 text-xs text-muted-foreground">Chọn nhà cung cấp trước khi xác nhận đã đặt.</p>}
        </div>}
        {edit && t.ordered_at && t.status !== "done" && <QtyAction label="Ghi nhận hàng về" max={Number(t.qty ?? 0) - got} onDo={(n) => act("receive", n, "Đã ghi nhận hàng về.")} />}
        <NoteField t={t} ctx={ctx} />
      </TaskShell>
    );
  }
  if (t.kind === "packing") {
    const block = packBlocker(ctx.ts, ctx.rs);
    return (
      <TaskShell t={t} ctx={ctx} title={KIND_LABEL.packing}>
        <CommonFields t={t} ctx={ctx} dates={[["planned_date", "Hạn đóng gói"]]} />
        <TimeLine t={t} ctx={ctx} field="done_at" label="Hoàn thành" />
        {edit && t.status !== "done" && <div>
          <Button size="sm" disabled={!!block} onClick={() => act("pack_done", undefined, "Đã hoàn thành đóng gói.")}>Xác nhận đã đóng gói</Button>
          {block && <p className="mt-1 flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="h-3 w-3" />{block}</p>}
        </div>}
        <NoteField t={t} ctx={ctx} />
      </TaskShell>
    );
  }
  if (t.kind === "delivery") {
    const packed = ctx.ts.some((x) => x.kind === "packing" && x.status === "done");
    return (
      <TaskShell t={t} ctx={ctx} title={KIND_LABEL.delivery}>
        <CommonFields t={t} ctx={ctx} dates={[["planned_date", "Dự kiến xuất hàng"]]} />
        <TimeLine t={t} ctx={ctx} field="shipped_at" label="Đã xuất hàng" />
        <TimeLine t={t} ctx={ctx} field="done_at" label="Khách đã nhận" />
        {edit && !t.shipped_at && <div>
          <Button size="sm" disabled={!packed} onClick={() => act("shipped", undefined, "Đã xác nhận xuất hàng.")}>Xác nhận xuất hàng</Button>
          {!packed && <p className="mt-1 text-xs text-muted-foreground">Cần hoàn thành đóng gói trước khi xuất hàng.</p>}
        </div>}
        {edit && t.shipped_at && t.status !== "done" && <Button size="sm" onClick={() => act("delivered", undefined, "Đơn hàng đã hoàn tất.")}>Xác nhận khách đã nhận hàng</Button>}
        <NoteField t={t} ctx={ctx} />
      </TaskShell>
    );
  }
  return null;
}

function NoteField({ t, ctx }: { t: OtTask; ctx: Ctx }) {
  const edit = ctx.canTask(t) && ctx.active;
  if (!edit) return t.note ? <p className="text-sm text-muted-foreground">Ghi chú: {t.note}</p> : null;
  return <Textarea rows={1} placeholder="Ghi chú" defaultValue={t.note ?? ""} onBlur={(e) => e.target.value !== (t.note ?? "") && ctx.run(() => otApi.updateTask(t.id, { note: e.target.value }), "Đã lưu ghi chú.")} />;
}

function ProcSection({ ctx }: { ctx: Ctx }) {
  const procs = ctx.ts.filter((t) => t.kind === "proc" && t.status !== "skipped");
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-3 rounded-lg border border-dashed p-3">
      <div className="flex items-center gap-2">
        <div className="font-medium">{KIND_LABEL.proc}</div>
        <span className="text-xs text-muted-foreground">{procs.length} lượt</span>
        {ctx.canStage && ctx.active && <Button size="sm" variant="outline" className="ml-auto" onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1" />Thêm lượt gia công</Button>}
      </div>
      {procs.length === 0 && <p className="text-sm text-muted-foreground">Chưa có lượt gia công.</p>}
      {procs.map((t, i) => <ProcCard key={t.id} t={t} i={i + 1} ctx={ctx} />)}
      {adding && <AddProc ctx={ctx} onClose={() => setAdding(false)} />}
    </div>
  );
}

function ProcCard({ t, i, ctx }: { t: OtTask; i: number; ctx: Ctx }) {
  const edit = ctx.canTask(t) && ctx.active;
  const act = (a: string, n?: number, ok?: string) => ctx.run(() => otApi.action(t.id, a, n), ok ?? "Đã cập nhật.");
  const got = received(t.id, ctx.rs);
  const canSend = sendable(t, ctx.ts, ctx.rs);
  const supName = ctx.sup.find((s) => s.id === t.supplier_id)?.name;
  return (
    <TaskShell t={t} ctx={ctx} title={<>Lượt {i}: {PROC_TYPE[t.proc_type ?? "other"] ?? t.proc_type}{supName ? ` · ${supName}` : ""}</>}>
      <CommonFields t={t} ctx={ctx} dates={[["mail_due", "Hạn gửi mail"], ["send_planned", "Dự kiến gửi phôi"], ["planned_arrival", "Dự kiến nhận"]]} />
      <QtyBar t={t} ctx={ctx} sentLabel />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2 rounded-md border p-3">
          <div className="text-xs font-medium text-muted-foreground">1. Mail sản xuất</div>
          {t.mail_sent_at ? <TimeLine t={t} ctx={ctx} field="mail_sent_at" label="Đã gửi" /> : edit ?
            <><Button size="sm" disabled={!t.supplier_id} onClick={() => act("mail_sent", undefined, "Đã xác nhận gửi mail sản xuất.")}>Xác nhận đã gửi mail sản xuất</Button>
              {!t.supplier_id && <p className="text-xs text-muted-foreground">Chọn xưởng trước.</p>}</> : <p className="text-sm text-muted-foreground">Chưa gửi</p>}
        </div>
        <div className="space-y-2 rounded-md border p-3">
          <div className="text-xs font-medium text-muted-foreground">2. Gửi phôi gia công</div>
          <TimeLine t={t} ctx={ctx} field="sent_at" label="Lần gửi đầu" />
          {edit && t.sent_qty < Number(t.qty ?? 0) && (!t.mail_sent_at
            ? <p className="text-xs text-destructive">Cần xác nhận gửi mail sản xuất trước.</p>
            : <><QtyAction label="Gửi phôi" max={canSend} onDo={(n) => act("sent", n, "Đã ghi nhận gửi phôi.")} />
                {canSend <= 0 && <p className="text-xs text-destructive">Chưa có phôi về để gửi thêm.</p>}</>)}
        </div>
        <div className="space-y-2 rounded-md border p-3">
          <div className="text-xs font-medium text-muted-foreground">3. Nhận hàng gia công</div>
          {edit && t.status !== "done" && (t.sent_qty - got > 0
            ? <QtyAction label="Ghi nhận hàng về" max={t.sent_qty - got} onDo={(n) => act("receive", n, "Đã ghi nhận hàng gia công.")} />
            : <p className="text-xs text-muted-foreground">Chưa có phôi đang ở xưởng.</p>)}
          {t.status === "done" && <p className="text-sm text-primary">Đã nhận đủ.</p>}
        </div>
      </div>
      <NoteField t={t} ctx={ctx} />
    </TaskShell>
  );
}

function AddProc({ ctx, onClose }: { ctx: Ctx; onClose: () => void }) {
  const [f, setF] = useState<Record<string, string>>({ proc_type: "print", qty: String(ctx.o.qty ?? "") });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Thêm lượt gia công</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1"><Label>Xưởng / nhà cung cấp</Label><SupplierSelect value={f.supplier_id ?? null} sup={ctx.sup} onChange={(v) => set("supplier_id", v)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label>Loại gia công</Label>
              <Select value={f.proc_type} onValueChange={(v) => set("proc_type", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PROC_TYPE).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label>Số lượng *</Label><Input type="number" min={1} value={f.qty} onChange={(e) => set("qty", e.target.value)} /></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1"><Label>Hạn gửi mail</Label><Input type="date" value={f.mail_due ?? ""} onChange={(e) => set("mail_due", e.target.value)} /></div>
            <div className="space-y-1"><Label>Dự kiến gửi phôi</Label><Input type="date" value={f.send_planned ?? ""} onChange={(e) => set("send_planned", e.target.value)} /></div>
            <div className="space-y-1"><Label>Dự kiến nhận</Label><Input type="date" value={f.planned_arrival ?? ""} onChange={(e) => set("planned_arrival", e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>Ghi chú</Label><Textarea rows={2} value={f.note ?? ""} onChange={(e) => set("note", e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={async () => { if (await ctx.run(() => otApi.addProc(ctx.o.id, f), "Đã thêm lượt gia công.")) onClose(); }}>Thêm</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FixTime({ t, field, value, run }: { t: OtTask; field: string; value: string; run: Ctx["run"] }) {
  const [open, setOpen] = useState(false);
  const local = new Date(new Date(value).getTime() + 7 * 3600_000).toISOString().slice(0, 16);
  const [v, setV] = useState(local);
  const [reason, setReason] = useState("");
  return (
    <>
      <button className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => setOpen(true)}>Sửa</button>
      {open && <Dialog open onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Điều chỉnh thời gian thực tế</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1"><Label>{FIELD_LABEL[field]} (giờ Việt Nam)</Label><Input type="datetime-local" value={v} onChange={(e) => setV(e.target.value)} /></div>
            <div className="space-y-1"><Label>Lý do điều chỉnh *</Label><Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button disabled={reason.trim().length < 3} onClick={async () => { if (await run(() => otApi.fixTime(t.id, field, `${v}:00+07:00`, reason), "Đã điều chỉnh.")) setOpen(false); }}>Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>}
    </>
  );
}

function AssignButton({ o, people, run }: { o: OtOrder; people: ReturnType<typeof usePeople>["list"]; run: Ctx["run"] }) {
  const [open, setOpen] = useState(false);
  const [sale, setSale] = useState(o.sale_id ?? "");
  const [supply, setSupply] = useState(o.supply_id ?? "");
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Phân công</Button>
      {open && <Dialog open onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Phân công người phụ trách</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1"><Label>Kinh doanh</Label><Select value={sale} onValueChange={setSale}><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{people.filter((p) => p.sale).map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label>Cung ứng</Label><Select value={supply} onValueChange={setSupply}><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{people.filter((p) => p.supply).map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={async () => { if (await run(() => otApi.updateOrder(o.id, { sale_id: sale, supply_id: supply }), "Đã phân công.")) setOpen(false); }}>Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>}
    </>
  );
}

function CancelButton({ id, run }: { id: string; run: Ctx["run"] }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <>
      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setOpen(true)}>Hủy đơn</Button>
      {open && <Dialog open onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hủy đơn hàng</DialogTitle></DialogHeader>
          <div className="space-y-1"><Label>Lý do *</Label><Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          <DialogFooter><Button variant="destructive" disabled={reason.trim().length < 3} onClick={async () => { if (await run(() => otApi.cancel(id, reason), "Đã hủy đơn.")) setOpen(false); }}>Xác nhận hủy</Button></DialogFooter>
        </DialogContent>
      </Dialog>}
    </>
  );
}
