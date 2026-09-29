import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, ChevronLeft, ChevronRight, Phone, CalendarClock } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { otApi, fmtDate, type OtOrder } from "@/lib/orderTracking/api";
import { usePeople } from "@/lib/orderTracking/hooks";
import { BOARD_COLS, KIND_LABEL, ORDER_TYPE, monthGrid, reminders, taskDue, todayVN, isOverdue, type OtTask } from "@/lib/orderTracking/logic";
import { cn } from "@/lib/utils";

function useData() {
  const orders = useQuery({ queryKey: ["ot", "orders"], queryFn: otApi.orders });
  const tasks = useQuery({ queryKey: ["ot", "allTasks"], queryFn: otApi.allTasks });
  const suppliers = useQuery({ queryKey: ["ot", "suppliers"], queryFn: otApi.suppliers });
  const byId = useMemo(() => new Map((orders.data ?? []).map((o) => [o.id, o])), [orders.data]);
  const supName = useMemo(() => new Map((suppliers.data ?? []).map((s) => [s.id, s.name])), [suppliers.data]);
  const live = useMemo(() => (tasks.data ?? []).filter((t) => t.kind !== "intake" && t.status !== "skipped" && byId.get(t.order_id)?.status === "in_progress"), [tasks.data, byId]);
  return { loading: orders.isLoading || tasks.isLoading, orders: orders.data ?? [], byId, live, supName };
}

function useMineFilter() {
  const { user } = useCurrentUser();
  const [mine, setMine] = useState(false);
  const keep = (t: OtTask, o?: OtOrder) => !mine || t.assignee_id === user?.id || o?.supply_id === user?.id || o?.sale_id === user?.id;
  const toggle = (
    <label className="flex items-center gap-2 text-sm"><Checkbox checked={mine} onCheckedChange={(v) => setMine(!!v)} />Chỉ việc của tôi</label>
  );
  return { keep, toggle };
}

function ContactDate({ t }: { t: OtTask }) {
  const { can, user } = useCurrentUser();
  const qc = useQueryClient();
  const allowed = can("ot.manage") || can("ot.stage_update") || (t.assignee_id === user?.id && can("ot.task_update"));
  if (t.status === "done") return null;
  if (!allowed) return t.contact_date ? <span className="text-xs text-muted-foreground">Liên hệ lại: {fmtDate(t.contact_date)}</span> : null;
  return (
    <label className="flex items-center gap-1 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
      <Phone className="h-3 w-3" />Liên hệ lại
      <Input type="date" className="h-7 w-[140px] text-xs" value={t.contact_date ?? ""} onChange={async (e) => {
        try { await otApi.setContact(t.id, e.target.value || null); await qc.invalidateQueries({ queryKey: ["ot"] }); toast.success("Đã lưu ngày liên hệ lại."); }
        catch (err: any) { toast.error(err.message); }
      }} />
    </label>
  );
}

function TaskCard({ t, o, supName, name, today }: { t: OtTask; o?: OtOrder; supName: Map<string, string>; name: (id?: string | null) => string; today: string }) {
  const due = taskDue(t);
  const late = isOverdue(due, t.status === "done", today);
  return (
    <div className={cn("rounded-md border bg-card p-3 text-sm space-y-1.5", late && "border-destructive")}>
      <Link to="/order-tracking/$id" params={{ id: t.order_id }} className="block hover:underline">
        <div className="text-xs text-muted-foreground font-mono">{o?.code}</div>
        <div className="font-medium leading-snug">{KIND_LABEL[t.kind]} · {o?.title}</div>
      </Link>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        {t.supplier_id && <span>NCC: {supName.get(t.supplier_id) ?? "—"}</span>}
        <span>Phụ trách: {name(t.assignee_id ?? o?.supply_id)}</span>
        {due && <span className={cn(late && "text-destructive font-medium")}>Hạn: {fmtDate(due)}{late && " · Quá hạn"}</span>}
        {o && <span className="text-primary">Khách nhận: {fmtDate(o.due_date)}</span>}
      </div>
      <ContactDate t={t} />
    </div>
  );
}

export function Board() {
  const d = useData();
  const people = usePeople();
  const f = useMineFilter();
  const today = todayVN();
  if (d.loading) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  const ts = d.live.filter((t) => f.keep(t, d.byId.get(t.order_id)));
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">{f.toggle}<span className="text-xs text-muted-foreground">Cập nhật trạng thái trong màn hình chi tiết đơn.</span></div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
        {BOARD_COLS.map((c) => {
          const col = ts.filter((t) => t.status === c.key).sort((a, b) => (taskDue(a) ?? "9").localeCompare(taskDue(b) ?? "9"));
          return (
            <div key={c.key} className="w-[280px] shrink-0 snap-start rounded-lg bg-muted/50 p-2 sm:w-[300px]">
              <div className="mb-2 flex items-center justify-between px-1 text-sm font-medium">{c.label}<Badge variant="secondary">{col.length}</Badge></div>
              <div className="space-y-2">
                {col.length === 0 ? <p className="px-1 py-4 text-center text-xs text-muted-foreground">Trống</p> :
                  col.map((t) => <TaskCard key={t.id} t={t} o={d.byId.get(t.order_id)} supName={d.supName} name={people.name} today={today} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const REM_LABEL = { overdue: "Quá hạn", today: "Đến hạn hôm nay", contact: "Cần liên hệ lại NCC" } as const;

export function Reminders() {
  const d = useData();
  const people = usePeople();
  const f = useMineFilter();
  const pend = useQuery({ queryKey: ["ot", "reschPending"], queryFn: otApi.pendingReschedules });
  const today = todayVN();
  if (d.loading) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  const list = reminders(d.live.filter((t) => f.keep(t, d.byId.get(t.order_id))), today);
  const soon = d.orders.filter((o) => ["new", "in_progress"].includes(o.status) && o.due_date >= today && o.due_date <= new Date(Date.parse(today) + 3 * 86400_000).toISOString().slice(0, 10));
  const rs = pend.data ?? [];
  return (
    <div className="space-y-4">
      {f.toggle}
      {rs.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium"><CalendarClock className="h-4 w-4" />Đề xuất điều chỉnh lịch chờ phản hồi ({rs.length})</div>
          <ul className="space-y-1 text-sm">{rs.map((r) => { const o = d.byId.get(r.order_id); return (
            <li key={r.id}><Link to="/order-tracking/$id" params={{ id: r.order_id }} className="hover:underline"><span className="font-mono text-xs text-muted-foreground">{o?.code}</span> {o?.title}: {fmtDate(r.from_date)} → <b>{fmtDate(r.proposed_date)}</b></Link></li>); })}</ul>
        </section>
      )}
      <section className="rounded-lg border bg-card p-4">
        <div className="mb-2 text-sm font-medium">Đơn có ngày khách nhận trong 3 ngày tới ({soon.length})</div>
        {soon.length === 0 ? <p className="text-sm text-muted-foreground">Không có.</p> :
          <ul className="space-y-1 text-sm">{soon.sort((a, b) => a.due_date.localeCompare(b.due_date)).map((o) => (
            <li key={o.id}><Link to="/order-tracking/$id" params={{ id: o.id }} className="hover:underline"><b>{fmtDate(o.due_date)}</b> · <span className="font-mono text-xs text-muted-foreground">{o.code}</span> {o.title} <Badge variant="outline" className="ml-1">{ORDER_TYPE[o.order_type]}</Badge></Link></li>))}</ul>}
      </section>
      <section className="space-y-2">
        <div className="text-sm font-medium">Công việc cần xử lý ({list.length})</div>
        {list.length === 0 ? <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Không có việc quá hạn, đến hạn hoặc cần liên hệ lại hôm nay.</p> :
          <div className="grid gap-2 md:grid-cols-2">{list.map((r) => (
            <div key={r.task.id} className="space-y-1">
              <div className={cn("flex items-center gap-1 text-xs font-medium", r.type === "overdue" ? "text-destructive" : "text-primary")}>
                {r.type === "overdue" && <AlertTriangle className="h-3.5 w-3.5" />}{REM_LABEL[r.type]} · {fmtDate(r.date)}
              </div>
              <TaskCard t={r.task} o={d.byId.get(r.task.order_id)} supName={d.supName} name={people.name} today={today} />
            </div>))}</div>}
      </section>
    </div>
  );
}

const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function SupplyCalendar() {
  const d = useData();
  const f = useMineFilter();
  const today = todayVN();
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [sel, setSel] = useState<string | null>(today);
  const events = useMemo(() => {
    const m = new Map<string, { label: string; order: string; late: boolean; kind: "due" | "task" | "contact" }[]>();
    const add = (day: string | null | undefined, e: { label: string; order: string; late: boolean; kind: "due" | "task" | "contact" }) => { if (!day) return; const k = day.slice(0, 10); m.set(k, [...(m.get(k) ?? []), e]); };
    for (const o of d.orders) if (["new", "in_progress"].includes(o.status) && f.keep({ assignee_id: null } as OtTask, o)) add(o.due_date, { label: `Khách nhận: ${o.code} ${o.title}`, order: o.id, late: o.due_date < today, kind: "due" });
    for (const t of d.live) {
      const o = d.byId.get(t.order_id);
      if (!f.keep(t, o) || t.status === "done") continue;
      const due = taskDue(t);
      add(due, { label: `${KIND_LABEL[t.kind]}: ${o?.code ?? ""}`, order: t.order_id, late: !!due && due < today, kind: "task" });
      if (t.contact_date) add(t.contact_date, { label: `Liên hệ lại NCC: ${o?.code ?? ""}`, order: t.order_id, late: false, kind: "contact" });
    }
    return m;
  }, [d.orders, d.live, d.byId, f, today]);
  if (d.loading) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  const days = monthGrid(ym.y, ym.m);
  const mm = String(ym.m + 1).padStart(2, "0");
  const shift = (n: number) => setYm(({ y, m }) => { const t = m + n; return { y: y + Math.floor(t / 12), m: ((t % 12) + 12) % 12 }; });
  const picked = sel ? events.get(sel) ?? [] : [];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon" variant="outline" onClick={() => shift(-1)} aria-label="Tháng trước"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="min-w-[110px] text-center font-medium">Tháng {mm}/{ym.y}</span>
        <Button size="icon" variant="outline" onClick={() => shift(1)} aria-label="Tháng sau"><ChevronRight className="h-4 w-4" /></Button>
        <div className="ml-auto">{f.toggle}</div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Ngày khách nhận</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-foreground/50" />Hạn công việc</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent-foreground/40 ring-1 ring-foreground/30" />Liên hệ lại NCC</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />Quá hạn</span>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
        {WD.map((w) => <div key={w} className="bg-muted px-1 py-1.5 text-center font-medium">{w}</div>)}
        {days.map((day) => {
          const ev = events.get(day) ?? [];
          const inMonth = day.slice(5, 7) === mm;
          return (
            <button key={day} type="button" onClick={() => setSel(day)}
              className={cn("min-h-[56px] bg-card p-1 text-left align-top sm:min-h-[92px]", !inMonth && "text-muted-foreground/60", sel === day && "ring-2 ring-inset ring-primary")}>
              <div className={cn("mb-0.5 text-[11px]", day === today && "font-bold text-primary")}>{Number(day.slice(8))}</div>
              <div className="flex flex-wrap gap-0.5 sm:hidden">{ev.slice(0, 6).map((e, i) => <span key={i} className={cn("h-1.5 w-1.5 rounded-full", e.late ? "bg-destructive" : e.kind === "due" ? "bg-primary" : e.kind === "contact" ? "ring-1 ring-foreground/30" : "bg-foreground/50")} />)}</div>
              <div className="hidden space-y-0.5 sm:block">
                {ev.slice(0, 3).map((e, i) => <div key={i} className={cn("truncate rounded px-1", e.late ? "bg-destructive/10 text-destructive" : e.kind === "due" ? "bg-primary/10 text-primary" : "bg-muted")}>{e.label}</div>)}
                {ev.length > 3 && <div className="text-muted-foreground">+{ev.length - 3}</div>}
              </div>
            </button>
          );
        })}
      </div>
      {sel && (
        <div className="rounded-lg border bg-card p-3">
          <Label className="text-sm">Ngày {fmtDate(sel)}</Label>
          {picked.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Không có lịch.</p> :
            <ul className="mt-2 space-y-1 text-sm">{picked.map((e, i) => (
              <li key={i}><Link to="/order-tracking/$id" params={{ id: e.order }} className={cn("hover:underline", e.late && "text-destructive")}>{e.label}{e.late && " · Quá hạn"}</Link></li>))}</ul>}
        </div>
      )}
    </div>
  );
}
