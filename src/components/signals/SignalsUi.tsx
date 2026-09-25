import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Plus, Search, Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth, useCurrentUser } from "@/lib/auth";
import {
  SIGNAL_LOST_REASONS, SIGNAL_NEED_GROUPS, SIGNAL_PRODUCTS, SIGNAL_SOURCES, STATUS_LABEL, STATUS_TONE,
  fmtVnd, isDueToday, isOverdue, normalizePhone, todayKey, type Signal, type SignalStatus,
} from "@/lib/signals/catalog";
import {
  assignSignal, createSignal, errMsg, listSignals, reopenSignal, saleUpdate, salesList, signalHistory,
  updateSignalInfo, type SignalInput,
} from "@/lib/signals/api";

export function useSignalPerms() {
  const { user, can } = useCurrentUser();
  return {
    userId: user?.id ?? null,
    create: can("signal.create") || can("signal.manage"),
    viewAll: can("signal.view_all") || can("signal.manage"),
    assign: can("signal.assign") || can("signal.manage"),
    manage: can("signal.manage"),
    sale: can("signal.sale"),
    report: can("signal.report") || can("signal.manage"),
  };
}

export const signalsKey = ["opportunity_signals"] as const;
export function useSignals(enabled = true) {
  return useQuery({ queryKey: signalsKey, queryFn: listSignals, enabled });
}

export function useUserName() {
  const users = useAuth((s) => s.users);
  return (id: string | null | undefined) => (id ? users.find((u) => u.id === id)?.fullName || "—" : "—");
}

export function StatusPill({ s }: { s: Pick<Signal, "status" | "assigned_to"> }) {
  const key = s.status ?? "none";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_TONE[key])}>
      {s.status ? STATUS_LABEL[s.status] : "Chưa phân công"}
    </span>
  );
}

const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");
const fmtTime = (iso: string) => new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

type Quick = "all" | "unassigned" | "waiting" | "consulting" | "due" | "won" | "lost";
const QUICK: { k: Quick; label: string }[] = [
  { k: "all", label: "Tất cả" }, { k: "unassigned", label: "Chưa phân công" }, { k: "waiting", label: "Chờ nhận" },
  { k: "consulting", label: "Đang tư vấn" }, { k: "due", label: "Cần liên hệ" }, { k: "won", label: "Chốt" }, { k: "lost", label: "Trượt" },
];

export function SignalsPage() {
  const p = useSignalPerms();
  const name = useUserName();
  const { data = [], isLoading, error } = useSignals(!!p.userId);
  const [q, setQ] = useState("");
  const [quick, setQuick] = useState<Quick>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const today = todayKey();
  const saleOnly = p.sale && !p.viewAll && !p.create;

  const mine = useMemo(() => data.filter((s) => s.assigned_to === p.userId), [data, p.userId]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter((s) => {
      if (t && !(s.customer_name.toLowerCase().includes(t) || s.phone.includes(t))) return false;
      switch (quick) {
        case "unassigned": return !s.assigned_to;
        case "waiting": case "consulting": case "won": case "lost": return s.status === quick;
        case "due": return isDueToday(s, today);
        default: return true;
      }
    });
  }, [data, q, quick, today]);
  const quickOpts = QUICK.filter((x) => !(saleOnly && x.k === "unassigned"));
  const open = data.find((s) => s.id === openId) || null;

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{saleOnly ? "Tín hiệu của tôi" : "Tín hiệu cơ hội"}</h1>
          <p className="text-sm text-muted-foreground">Tín hiệu có khả năng phát sinh đơn hàng, giao Kinh doanh tư vấn.</p>
        </div>
        {p.create && (
          <Button size="lg" onClick={() => setCreating(true)} className="hidden md:inline-flex"><Plus className="h-4 w-4 mr-1" />Thêm tín hiệu</Button>
        )}
      </div>

      {p.sale && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Stat label="Chờ nhận" v={mine.filter((s) => s.status === "waiting").length} onClick={() => setQuick("waiting")} />
          <Stat label="Đang tư vấn" v={mine.filter((s) => s.status === "consulting").length} onClick={() => setQuick("consulting")} />
          <Stat label="Cần liên hệ hôm nay" v={mine.filter((s) => isDueToday(s, today)).length} onClick={() => setQuick("due")} tone="warn" />
          <Stat label="Đã chốt tháng này" v={mine.filter((s) => s.status === "won" && s.closed_at && todayKey(new Date(s.closed_at)).slice(0, 7) === today.slice(0, 7)).length} onClick={() => setQuick("won")} />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm khách hàng hoặc SĐT" className="pl-9 h-11" />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {quickOpts.map((x) => (
          <button key={x.k} onClick={() => setQuick(x.k)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm", quick === x.k ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>{x.label}</button>
        ))}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground py-8 text-center">Đang tải…</p>
        : error ? <p className="text-sm text-destructive py-8 text-center">{errMsg(error)}</p>
        : list.length === 0 ? <p className="text-sm text-muted-foreground py-12 text-center border rounded-lg bg-card">Chưa có tín hiệu nào.</p>
        : (
          <>
            <div className="md:hidden space-y-2">
              {list.map((s) => (
                <div key={s.id} className="rounded-xl border bg-card p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold leading-tight">{s.customer_name}</div>
                    <StatusPill s={s} />
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{s.need_group || s.products.join(", ") || s.need_detail || "—"}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">{s.phone}</span>
                    {s.next_contact_on && <span className={cn(isOverdue(s, today) && "text-destructive font-medium")}>Hẹn {fmtDate(s.next_contact_on)}</span>}
                  </div>
                  {!saleOnly && <div className="text-xs text-muted-foreground">Sale: {s.assigned_to ? name(s.assigned_to) : "Chưa phân công"}</div>}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button asChild size="lg" variant="outline"><a href={`tel:${s.phone}`}><Phone className="h-4 w-4 mr-1" />Gọi điện</a></Button>
                    <Button size="lg" onClick={() => setOpenId(s.id)}><Eye className="h-4 w-4 mr-1" />Xem chi tiết</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>{["Ngày", "Khách hàng", "Sản phẩm", "Nguồn", "Sale phụ trách", "Trạng thái", "Liên hệ tiếp", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-muted/30">
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(s.detected_on)}</td>
                      <td className="px-3 py-2"><div className="font-medium">{s.customer_name}</div><div className="text-xs text-muted-foreground font-mono">{s.phone}</div></td>
                      <td className="px-3 py-2 max-w-[200px] truncate">{s.products.join(", ") || "—"}</td>
                      <td className="px-3 py-2">{s.source}</td>
                      <td className="px-3 py-2">{s.assigned_to ? name(s.assigned_to) : <span className="text-muted-foreground">Chưa phân công</span>}</td>
                      <td className="px-3 py-2"><StatusPill s={s} />{s.status === "won" && s.revenue ? <div className="text-xs mt-0.5">{fmtVnd(s.revenue)}</div> : null}</td>
                      <td className={cn("px-3 py-2 whitespace-nowrap", isOverdue(s, today) && "text-destructive font-medium")}>{fmtDate(s.next_contact_on)}</td>
                      <td className="px-3 py-2 text-right"><Button size="sm" variant="outline" onClick={() => setOpenId(s.id)}>Chi tiết</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      {p.create && (
        <Button size="lg" onClick={() => setCreating(true)} className="md:hidden fixed bottom-4 right-4 z-30 rounded-full shadow-lg h-14 px-5"><Plus className="h-5 w-5 mr-1" />Thêm tín hiệu</Button>
      )}

      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Thêm tín hiệu</SheetTitle></SheetHeader>
          <SignalForm onDone={() => setCreating(false)} />
        </SheetContent>
      </Sheet>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
          {open && <SignalDetail s={open} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stat({ label, v, onClick, tone }: { label: string; v: number; onClick?: () => void; tone?: "warn" }) {
  return (
    <button onClick={onClick} className={cn("rounded-xl border bg-card p-3 text-left", tone === "warn" && v > 0 && "border-amber-500/50")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-0.5">{v}</div>
    </button>
  );
}

const emptyInput = (): SignalInput => ({ detected_on: todayKey(), customer_name: "", phone: "", address: null, need_detail: null, products: [], need_group: null, source: "", marketing_note: null });

function SignalForm({ initial, id, onDone }: { initial?: SignalInput; id?: string; onDone: () => void }) {
  const p = useSignalPerms();
  const qc = useQueryClient();
  const [f, setF] = useState<SignalInput>(initial ?? emptyInput());
  const [sale, setSale] = useState("");
  const [busy, setBusy] = useState(false);
  const sales = useQuery({ queryKey: ["signal_sales"], queryFn: salesList, enabled: p.assign && !id });
  const set = <K extends keyof SignalInput>(k: K, v: SignalInput[K]) => setF((x) => ({ ...x, [k]: v }));

  const submit = async () => {
    const name = f.customer_name.trim();
    const phone = normalizePhone(f.phone);
    if (!name) return toast.error("Nhập tên khách hàng");
    if (name.length > 200) return toast.error("Tên quá dài");
    if (!phone) return toast.error("Số điện thoại không hợp lệ (9–15 chữ số)");
    if (!f.source) return toast.error("Chọn nguồn tín hiệu");
    if (!f.detected_on) return toast.error("Chọn ngày phát hiện");
    const clean: SignalInput = { ...f, customer_name: name, phone, address: f.address?.trim() || null, need_detail: f.need_detail?.trim() || null, marketing_note: f.marketing_note?.trim() || null };
    setBusy(true);
    try {
      if (id) await updateSignalInfo(id, clean);
      else {
        const s = await createSignal(clean, p.userId!);
        if (sale) await assignSignal(s.id, sale);
      }
      await qc.invalidateQueries({ queryKey: signalsKey });
      toast.success(id ? "Đã cập nhật tín hiệu" : "Đã thêm tín hiệu");
      onDone();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 p-4 pt-2">
      <Section title="Khách hàng">
        <Field label="Ngày phát hiện"><Input type="date" value={f.detected_on} onChange={(e) => set("detected_on", e.target.value)} /></Field>
        <Field label="Đơn vị / Khách hàng *"><Input value={f.customer_name} maxLength={200} onChange={(e) => set("customer_name", e.target.value)} /></Field>
        <Field label="Số điện thoại *"><Input type="tel" inputMode="tel" value={f.phone} maxLength={20} onChange={(e) => set("phone", e.target.value)} placeholder="0965..." /></Field>
        <Field label="Địa chỉ"><Input value={f.address ?? ""} maxLength={500} onChange={(e) => set("address", e.target.value)} /></Field>
      </Section>
      <Section title="Nhu cầu">
        <Field label="Sản phẩm quan tâm">
          <div className="flex flex-wrap gap-1.5">
            {SIGNAL_PRODUCTS.map((x) => {
              const on = f.products.includes(x);
              return <button type="button" key={x} onClick={() => set("products", on ? f.products.filter((y) => y !== x) : [...f.products, x])} className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>{x}</button>;
            })}
          </div>
        </Field>
        <Field label="Nhóm nhu cầu"><Select value={f.need_group ?? ""} onChange={(v) => set("need_group", v || null)} opts={SIGNAL_NEED_GROUPS} /></Field>
        <Field label="Chi tiết nhu cầu"><Textarea rows={3} maxLength={3000} value={f.need_detail ?? ""} onChange={(e) => set("need_detail", e.target.value)} /></Field>
      </Section>
      <Section title="Nguồn & ghi chú">
        <Field label="Nguồn tín hiệu *"><Select value={f.source} onChange={(v) => set("source", v)} opts={SIGNAL_SOURCES} /></Field>
        <Field label="Ghi chú Marketing"><Textarea rows={2} maxLength={3000} value={f.marketing_note ?? ""} onChange={(e) => set("marketing_note", e.target.value)} /></Field>
        {!id && p.assign && (
          <Field label="Sale phụ trách">
            <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={sale} onChange={(e) => setSale(e.target.value)}>
              <option value="">Chưa phân công</option>
              {(sales.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </Field>
        )}
      </Section>
      <Button size="lg" className="w-full" disabled={busy} onClick={submit}>{busy ? "Đang lưu…" : id ? "Lưu thay đổi" : "Thêm tín hiệu"}</Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3"><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}
function Select({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: readonly string[] }) {
  return (
    <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Chọn —</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SignalDetail({ s }: { s: Signal }) {
  const p = useSignalPerms();
  const name = useUserName();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const hist = useQuery({ queryKey: ["signal_hist", s.id, s.updated_at], queryFn: () => signalHistory(s.id) });
  const sales = useQuery({ queryKey: ["signal_sales"], queryFn: salesList, enabled: p.assign });
  const closed = s.status === "won" || s.status === "lost";
  const canEditInfo = !closed && (p.manage || (p.create && s.created_by === p.userId));
  const canConsult = !closed && !!s.assigned_to && ((p.sale && s.assigned_to === p.userId) || p.manage);
  const refresh = () => qc.invalidateQueries({ queryKey: signalsKey });

  const doAssign = async (uid: string) => {
    try { await assignSignal(s.id, uid || null); await refresh(); toast.success(uid ? "Đã phân công" : "Đã bỏ phân công"); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const doReopen = async () => {
    const r = window.prompt("Lý do mở lại tín hiệu?");
    if (!r?.trim()) return;
    try { await reopenSignal(s.id, r.trim()); await refresh(); toast.success("Đã mở lại"); } catch (e) { toast.error(errMsg(e)); }
  };

  if (editing) return (
    <div><SheetHeader className="p-4 pb-0"><SheetTitle>Sửa thông tin tín hiệu</SheetTitle></SheetHeader>
      <SignalForm id={s.id} initial={{ detected_on: s.detected_on, customer_name: s.customer_name, phone: s.phone, address: s.address, need_detail: s.need_detail, products: s.products, need_group: s.need_group, source: s.source, marketing_note: s.marketing_note }} onDone={() => setEditing(false)} />
    </div>
  );

  const timeline = [
    ...(hist.data?.notes ?? []).map((n) => ({ t: n.created_at, who: n.author_id, body: (
      <>
        {n.status_from !== n.status_to && n.status_to && <div className="text-xs text-muted-foreground">{n.status_from ? STATUS_LABEL[n.status_from as SignalStatus] : "—"} → <b>{STATUS_LABEL[n.status_to as SignalStatus]}</b>{n.revenue ? ` · ${fmtVnd(n.revenue)}` : ""}{n.lost_reason ? ` · ${n.lost_reason}` : ""}</div>}
        {n.note && <div className="whitespace-pre-wrap">{n.note}</div>}
        {n.next_contact_on && <div className="text-xs text-muted-foreground">Hẹn liên hệ: {fmtDate(n.next_contact_on)}</div>}
      </>
    ) })),
    ...(hist.data?.events ?? []).map((e) => ({ t: e.created_at, who: e.actor_id, body: (
      <div className="text-xs text-muted-foreground italic">
        {e.kind === "assign" ? `Phân công: ${e.detail?.from ? name(e.detail.from) : "Chưa phân công"} → ${e.detail?.to ? name(e.detail.to) : "Chưa phân công"}`
          : e.kind === "reopen" ? `Mở lại tín hiệu (trước: ${STATUS_LABEL[e.detail?.prev_status as SignalStatus] ?? "—"}). Lý do: ${e.detail?.reason}`
          : "Cập nhật thông tin khách hàng"}
      </div>
    ) })),
  ].sort((a, b) => b.t.localeCompare(a.t));

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-4 border-b space-y-1">
        <div className="flex items-start justify-between gap-2 pr-8"><h2 className="text-lg font-semibold leading-tight">{s.customer_name}</h2><StatusPill s={s} /></div>
        <div className="text-sm text-muted-foreground">Sale: {s.assigned_to ? name(s.assigned_to) : "Chưa phân công"}{s.status === "won" && s.revenue ? ` · Doanh số ${fmtVnd(s.revenue)}` : ""}{s.lost_reason ? ` · ${s.lost_reason}` : ""}</div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        <Section title="1. Thông tin khách hàng">
          <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-1.5">
            <Row k="Số điện thoại"><a href={`tel:${s.phone}`} className="font-mono text-primary underline-offset-2 hover:underline">{s.phone}</a></Row>
            <Row k="Địa chỉ">{s.address || "—"}</Row>
            <Row k="Ngày phát hiện">{fmtDate(s.detected_on)}</Row>
            <Row k="Nguồn">{s.source}</Row>
            <Row k="Sản phẩm">{s.products.join(", ") || "—"}</Row>
            <Row k="Nhóm nhu cầu">{s.need_group || "—"}</Row>
            <Row k="Chi tiết nhu cầu"><span className="whitespace-pre-wrap">{s.need_detail || "—"}</span></Row>
            <Row k="Ghi chú Marketing"><span className="whitespace-pre-wrap">{s.marketing_note || "—"}</span></Row>
            <Row k="Người tạo">{name(s.created_by)} · {fmtTime(s.created_at)}</Row>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="md:hidden"><a href={`tel:${s.phone}`}><Phone className="h-4 w-4 mr-1" />Gọi điện</a></Button>
            {canEditInfo && <Button variant="outline" onClick={() => setEditing(true)}>Sửa thông tin</Button>}
            {closed && p.manage && <Button variant="outline" onClick={doReopen}><RotateCcw className="h-4 w-4 mr-1" />Mở lại</Button>}
          </div>
          {p.assign && !closed && (
            <Field label="Sale phụ trách">
              <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={s.assigned_to ?? ""} onChange={(e) => doAssign(e.target.value)}>
                <option value="">Chưa phân công</option>
                {s.assigned_to && !(sales.data ?? []).some((u) => u.id === s.assigned_to) && <option value={s.assigned_to}>{name(s.assigned_to)}</option>}
                {(sales.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </Field>
          )}
        </Section>

        <Section title="2. Lịch sử tư vấn">
          {hist.isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : timeline.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có cập nhật.</p> : (
            <ol className="space-y-3 border-l pl-4">
              {timeline.map((x, i) => (
                <li key={i} className="text-sm">
                  <div className="text-xs text-muted-foreground">{fmtTime(x.t)} · <b className="text-foreground">{name(x.who)}</b></div>
                  {x.body}
                </li>
              ))}
            </ol>
          )}
        </Section>

        {canConsult && <ConsultForm s={s} onSaved={refresh} />}
      </div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="grid grid-cols-[120px_1fr] gap-2"><span className="text-muted-foreground">{k}</span><span>{children}</span></div>;
}

function ConsultForm({ s, onSaved }: { s: Signal; onSaved: () => void }) {
  const [status, setStatus] = useState<SignalStatus>(s.status === "waiting" ? "consulting" : (s.status as SignalStatus));
  const [note, setNote] = useState("");
  const [next, setNext] = useState(s.next_contact_on ?? "");
  const [revenue, setRevenue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setNext(s.next_contact_on ?? ""); }, [s.next_contact_on]);
  const opts: SignalStatus[] = s.status === "waiting" ? ["waiting", "consulting", "won", "lost"] : ["consulting", "won", "lost"];

  const save = async () => {
    const rev = status === "won" ? Number(revenue.replace(/[^\d]/g, "")) : null;
    if (status === "won" && (!rev || rev <= 0)) return toast.error("Chốt bắt buộc nhập doanh số");
    if (status === "lost" && !reason) return toast.error("Trượt bắt buộc chọn lý do");
    setBusy(true);
    try {
      await saleUpdate(s.id, { status, note, next: status === "won" || status === "lost" ? null : next || null, revenue: rev, lostReason: status === "lost" ? reason : null });
      setNote(""); setRevenue(""); setReason("");
      toast.success("Đã lưu cập nhật");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <Section title="3. Cập nhật tư vấn">
      {s.status === "waiting" && (
        <Button size="lg" variant="secondary" className="w-full" disabled={busy} onClick={async () => {
          setBusy(true);
          try { await saleUpdate(s.id, { status: "consulting", note: "Đã tiếp nhận", next: s.next_contact_on, revenue: null, lostReason: null }); toast.success("Đã tiếp nhận"); onSaved(); }
          catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
        }}>Tiếp nhận</Button>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {opts.map((o) => <button key={o} type="button" onClick={() => setStatus(o)} className={cn("rounded-lg border py-2.5 text-sm font-medium", status === o ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>{STATUS_LABEL[o]}</button>)}
      </div>
      {status === "won" && <Field label="Doanh số chốt (VNĐ) *"><Input inputMode="numeric" value={revenue} onChange={(e) => setRevenue(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."))} placeholder="VD: 15.000.000" /></Field>}
      {status === "lost" && <Field label="Lý do trượt *"><Select value={reason} onChange={setReason} opts={SIGNAL_LOST_REASONS} /></Field>}
      <Field label="Ghi chú mới"><Textarea rows={3} maxLength={3000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nội dung trao đổi với khách…" /></Field>
      {status !== "won" && status !== "lost" && <Field label="Ngày liên hệ tiếp"><Input type="date" value={next} onChange={(e) => setNext(e.target.value)} /></Field>}
      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background border-t">
        <Button size="lg" className="w-full h-12 text-base" disabled={busy} onClick={save}>{busy ? "Đang lưu…" : "Lưu cập nhật"}</Button>
      </div>
      {(status === "won" || status === "lost") && <p className="text-xs text-muted-foreground">Sau khi Chốt/Trượt, tín hiệu khóa lại. Chỉ Quản lý mới mở lại được. Doanh số là số Sale khai báo, chưa phải doanh thu kế toán.</p>}
    </Section>
  );
}
