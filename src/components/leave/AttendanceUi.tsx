import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Fingerprint, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { fmtDate, fmtVn, todayVn, type LeaveSettings } from "@/lib/leave/calc";
import { leaveErr } from "@/lib/leave/api";
import * as att from "@/lib/leave/attApi";
import {
  ATT_NOTE, ATT_TYPE_LABEL, DEFAULT_ATT_REASONS, KIND_LABEL, WITNESS_LABEL, declaredTime, validateAtt,
  type AttExplanation, type AttInput, type AttKind, type WitnessStatus,
} from "@/lib/leave/attendance";

type NameFn = (id?: string | null) => string;
const W_CLS: Record<WitnessStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  confirmed: "bg-success/15 text-success border-success/30",
  unable: "bg-destructive/10 text-destructive border-destructive/30",
};

export function attReasons(s?: LeaveSettings | null) {
  const r = (s as any)?.attendance?.reasons;
  return Array.isArray(r) && r.length ? r : DEFAULT_ATT_REASONS;
}

export function AttBadges({ a }: { a: AttExplanation }) {
  if (a.recalled) return <Badge variant="outline" className="bg-muted text-muted-foreground">Đã thu hồi</Badge>;
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="outline" className={W_CLS[a.witness_status]}>Làm chứng: {WITNESS_LABEL[a.witness_status]}</Badge>
      <Badge variant="outline" className={a.reconciled ? "bg-success/15 text-success border-success/30" : ""}>{a.reconciled ? "Đã đối chiếu" : "Chưa đối chiếu"}</Badge>
    </div>
  );
}

export function AttCard({ a, name, showOwner, onOpen }: { a: AttExplanation; name: NameFn; showOwner: boolean; onOpen: (id: string) => void }) {
  return (
    <button onClick={() => onOpen(a.id)} className="w-full text-left rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Fingerprint className="h-4 w-4" /></div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{ATT_TYPE_LABEL}{showOwner && <span className="text-muted-foreground font-normal"> · {name(a.owner_id)}</span>}</div>
          <div className="text-sm text-muted-foreground">{fmtDate(a.work_date)} · {KIND_LABEL[a.kind]} · {declaredTime(a)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Người làm chứng: {name(a.witness_id)}</div>
          <div className="mt-1.5"><AttBadges a={a} /></div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
      </div>
    </button>
  );
}

/* ============ Danh sách quản lý ============ */
export function AttManage({ rows, loading, name, onOpen }: { rows: AttExplanation[]; loading: boolean; name: NameFn; onOpen: (id: string) => void }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [emp, setEmp] = useState("all"); const [kind, setKind] = useState("all");
  const [ws, setWs] = useState("all"); const [rc, setRc] = useState("all");
  const emps = [...new Set(rows.map((r) => r.owner_id))].sort((a, b) => name(a).localeCompare(name(b), "vi"));
  const shown = rows.filter((a) => (!from || a.work_date >= from) && (!to || a.work_date <= to)
    && (emp === "all" || a.owner_id === emp) && (kind === "all" || a.kind === kind)
    && (ws === "all" || (ws === "recalled" ? a.recalled : !a.recalled && a.witness_status === ws))
    && (rc === "all" || (rc === "yes") === a.reconciled));
  return <>
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
      <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="sm:w-40" aria-label="Từ ngày" />
      <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="sm:w-40" aria-label="Đến ngày" />
      <Select value={emp} onValueChange={setEmp}><SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi nhân viên</SelectItem>{emps.map((id) => <SelectItem key={id} value={id}>{name(id)}</SelectItem>)}</SelectContent></Select>
      <Select value={kind} onValueChange={setKind}><SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi nội dung</SelectItem>{(Object.keys(KIND_LABEL) as AttKind[]).map((k) => <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>)}</SelectContent></Select>
      <Select value={ws} onValueChange={setWs}><SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi trạng thái làm chứng</SelectItem>{(Object.keys(WITNESS_LABEL) as WitnessStatus[]).map((k) => <SelectItem key={k} value={k}>{WITNESS_LABEL[k]}</SelectItem>)}<SelectItem value="recalled">Đã thu hồi</SelectItem></SelectContent></Select>
      <Select value={rc} onValueChange={setRc}><SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Mọi trạng thái đối chiếu</SelectItem><SelectItem value="no">Chưa đối chiếu</SelectItem><SelectItem value="yes">Đã đối chiếu</SelectItem></SelectContent></Select>
    </div>
    {loading ? <p className="text-sm text-muted-foreground py-6">Đang tải…</p> : !shown.length
      ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Không có giải trình phù hợp.</CardContent></Card>
      : <div className="space-y-2">{shown.map((a) => <AttCard key={a.id} a={a} name={name} showOwner onOpen={onOpen} />)}</div>}
  </>;
}

/* ============ Form tạo / sửa ============ */
export function AttForm({ settings, edit, onClose, onDone }: { settings: LeaveSettings; edit?: AttExplanation; onClose: () => void; onDone: (id?: string) => void }) {
  const { user } = useCurrentUser();
  const owner = edit?.owner_id || user?.id || "";
  const [f, setF] = useState<AttInput>(() => edit
    ? { work_date: edit.work_date, kind: edit.kind, time_in: edit.time_in || "", time_out: edit.time_out || "", reason_id: edit.reason_id, detail: edit.detail || "", witness_id: edit.witness_id }
    : { work_date: todayVn(), kind: "in", time_in: "", time_out: "", reason_id: "", detail: "", witness_id: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const wq = useQuery({ queryKey: ["leave", "att-witnesses"], queryFn: att.listWitnesses });
  const witnesses = (wq.data || []).filter((w) => w.id !== owner);
  const reasons = attReasons(settings).filter((r: any) => r.active || r.id === edit?.reason_id);
  const invalid = validateAtt(f, owner);
  const set = (p: Partial<AttInput>) => setF((x) => ({ ...x, ...p }));
  const witnessReset = edit && edit.witness_status !== "pending" && (edit.work_date !== f.work_date || edit.kind !== f.kind
    || (edit.time_in || "") !== (f.kind === "out" ? "" : f.time_in) || (edit.time_out || "") !== (f.kind === "in" ? "" : f.time_out) || edit.witness_id !== f.witness_id);

  const submit = async () => {
    setBusy(true); setErr(null);
    const clean = { ...f, time_in: f.kind === "out" ? "" : f.time_in, time_out: f.kind === "in" ? "" : f.time_out };
    try {
      let id: string | undefined;
      if (edit) await att.updateAtt(edit.id, clean); else id = await att.submitAtt(clean);
      toast.success(edit ? "Đã lưu thay đổi" : "Đã gửi giải trình");
      onDone(id || edit?.id);
    } catch (e) { setErr(leaveErr(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg">
        <DialogHeader><DialogTitle>{edit ? "Sửa giải trình chấm công" : ATT_TYPE_LABEL}</DialogTitle></DialogHeader>
        <AttFields f={f} set={set} reasons={reasons} witnesses={witnesses} wLoading={wq.isLoading} />
        {witnessReset && <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">Bạn đang sửa ngày, giờ hoặc người làm chứng. Người làm chứng sẽ phải xác nhận lại.</div>}
        <p className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3">{ATT_NOTE}</p>
        {err && <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{err}</div>}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit} disabled={!!invalid || busy} title={invalid || undefined}>{busy ? "Đang gửi…" : edit ? "Lưu thay đổi" : "GỬI GIẢI TRÌNH"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AttFields({ f, set, reasons, witnesses, wLoading }: { f: AttInput; set: (p: Partial<AttInput>) => void; reasons: { id: string; name: string; active: boolean }[]; witnesses: { id: string; full_name: string }[]; wLoading: boolean }) {
  const { user } = useCurrentUser();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5"><Label>Nhân viên</Label><Input value={user?.fullName || ""} disabled /></div>
      <div className="space-y-1.5"><Label>Ngày quên chấm công</Label><Input type="date" max={todayVn()} value={f.work_date} onChange={(e) => set({ work_date: e.target.value })} /></div>
      <div className="space-y-1.5">
        <Label>Nội dung giải trình</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(KIND_LABEL) as AttKind[]).map((k) => <button key={k} type="button" onClick={() => set({ kind: k })} className={cn("rounded-md border px-2 py-2 text-sm", f.kind === k ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{KIND_LABEL[k]}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {f.kind !== "out" && <div className="space-y-1.5"><Label>Giờ vào</Label><Input type="time" value={f.time_in} onChange={(e) => set({ time_in: e.target.value })} /></div>}
        {f.kind !== "in" && <div className="space-y-1.5"><Label>Giờ ra</Label><Input type="time" value={f.time_out} onChange={(e) => set({ time_out: e.target.value })} /></div>}
      </div>
      <div className="space-y-1.5">
        <Label>Lý do</Label>
        <Select value={f.reason_id} onValueChange={(v) => set({ reason_id: v })}>
          <SelectTrigger><SelectValue placeholder="Chọn lý do" /></SelectTrigger>
          <SelectContent>{reasons.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Chi tiết giải trình{f.reason_id === "other" && <span className="text-destructive"> *</span>}</Label>
        <Textarea rows={3} value={f.detail} onChange={(e) => set({ detail: e.target.value })} placeholder="Diễn giải ngắn gọn" />
      </div>
      <div className="space-y-1.5">
        <Label>Người làm chứng</Label>
        <Select value={witnesses.some((w) => w.id === f.witness_id) ? f.witness_id : ""} onValueChange={(v) => set({ witness_id: v })}>
          <SelectTrigger><SelectValue placeholder={wLoading ? "Đang tải…" : "Chọn người làm chứng"} /></SelectTrigger>
          <SelectContent>{witnesses.map((w) => <SelectItem key={w.id} value={w.id}>{w.full_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* ============ Chi tiết ============ */
export function AttDetail({ id, name, onClose, onChanged, onEdit }: { id: string; name: NameFn; onClose: () => void; onChanged: () => void; onEdit: (a: AttExplanation) => void }) {
  const { user, can } = useCurrentUser();
  const q = useQuery({ queryKey: ["leave", "att-one", id], queryFn: () => att.getAtt(id) });
  const ev = useQuery({ queryKey: ["leave", "att-ev", id], queryFn: () => att.getAttEvents(id), enabled: !!q.data });
  const [act, setAct] = useState<null | "confirm" | "unable" | "reconcile" | "note" | "recall">(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const a = q.data; const uid = user?.id;
  const isOwner = a?.owner_id === uid;
  const manage = can("att.manage");
  const acts = a && !a.recalled ? {
    witness: a.witness_id === uid && !isOwner && a.witness_status === "pending" && can("att.witness"),
    reconcile: !a.reconciled && (can("att.reconcile") || manage),
    note: a.reconciled && (can("att.reconcile") || manage),
    edit: (isOwner && can("att.edit_own") && !a.reconciled) || manage,
    recall: (isOwner && can("att.edit_own") && !a.reconciled) || manage,
  } : null;

  const run = async () => {
    if (!a || !act) return;
    setBusy(true);
    try {
      if (act === "confirm") await att.witnessAtt(a.id, true, note);
      if (act === "unable") await att.witnessAtt(a.id, false, note);
      if (act === "reconcile") await att.reconcileAtt(a.id, note);
      if (act === "note") await att.noteAtt(a.id, note);
      if (act === "recall") await att.recallAtt(a.id);
      toast.success("Đã cập nhật giải trình");
      setAct(null); setNote(""); q.refetch(); ev.refetch(); onChanged();
    } catch (e) { toast.error(leaveErr(e)); q.refetch(); } finally { setBusy(false); }
  };
  const title: Record<string, string> = { confirm: "Xác nhận làm chứng?", unable: "Không thể xác nhận — ghi chú (không bắt buộc)", reconcile: "Đánh dấu đã đối chiếu", note: "Cập nhật ghi chú đối chiếu", recall: "Thu hồi giải trình này?" };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full h-full max-w-none sm:max-w-xl overflow-y-auto">
        <SheetHeader><SheetTitle>{ATT_TYPE_LABEL}</SheetTitle></SheetHeader>
        {q.isLoading ? <p className="text-sm text-muted-foreground mt-6">Đang tải…</p> : !a ? (
          <div className="mt-10 text-center"><h3 className="font-semibold">Không thể mở giải trình</h3><p className="text-sm text-muted-foreground mt-1">Giải trình không tồn tại hoặc bạn không có quyền xem.</p></div>
        ) : (
          <div className="mt-4 space-y-4 text-sm">
            <AttBadges a={a} />
            <dl className="grid grid-cols-[130px_1fr] gap-y-1.5">
              <dt className="text-muted-foreground">Nhân viên</dt><dd>{name(a.owner_id)}</dd>
              <dt className="text-muted-foreground">Ngày quên</dt><dd>{fmtDate(a.work_date)}</dd>
              <dt className="text-muted-foreground">Nội dung</dt><dd>{KIND_LABEL[a.kind]}</dd>
              <dt className="text-muted-foreground">Giờ tự khai báo</dt><dd>{declaredTime(a)}</dd>
              <dt className="text-muted-foreground">Lý do</dt><dd>{a.reason_name}</dd>
              {a.detail && <><dt className="text-muted-foreground">Chi tiết</dt><dd className="whitespace-pre-line">{a.detail}</dd></>}
              <dt className="text-muted-foreground">Gửi lúc</dt><dd>{fmtVn(a.submitted_at)}</dd>
              <dt className="text-muted-foreground">Người làm chứng</dt><dd>{name(a.witness_id)} · {WITNESS_LABEL[a.witness_status]}{a.witness_at ? ` · ${fmtVn(a.witness_at)}` : ""}</dd>
              {a.witness_note && <><dt className="text-muted-foreground">Ghi chú làm chứng</dt><dd className="whitespace-pre-line">{a.witness_note}</dd></>}
              <dt className="text-muted-foreground">Đối chiếu</dt><dd>{a.reconciled ? `Đã đối chiếu · ${name(a.reconciled_by)} · ${fmtVn(a.reconciled_at!)}` : "Chưa đối chiếu"}</dd>
              {a.reconcile_note && <><dt className="text-muted-foreground">Ghi chú đối chiếu</dt><dd className="whitespace-pre-line">{a.reconcile_note}</dd></>}
              {a.recalled && <><dt className="text-muted-foreground">Thu hồi lúc</dt><dd>{a.recalled_at ? fmtVn(a.recalled_at) : "—"}</dd></>}
            </dl>
            {acts && (
              <div className="flex flex-wrap gap-2">
                {acts.witness && <><Button onClick={() => setAct("confirm")}>XÁC NHẬN</Button><Button variant="outline" onClick={() => setAct("unable")}>KHÔNG THỂ XÁC NHẬN</Button></>}
                {acts.reconcile && <Button onClick={() => setAct("reconcile")}>ĐÁNH DẤU ĐÃ ĐỐI CHIẾU</Button>}
                {acts.note && <Button variant="outline" onClick={() => { setNote(a.reconcile_note || ""); setAct("note"); }}>Sửa ghi chú đối chiếu</Button>}
                {acts.edit && <Button variant="outline" onClick={() => onEdit(a)}>Sửa giải trình</Button>}
                {acts.recall && <Button variant="outline" onClick={() => setAct("recall")}>Thu hồi</Button>}
              </div>
            )}
            {isOwner && a.reconciled && !a.recalled && !manage && <p className="text-xs text-muted-foreground">Giải trình đã được đối chiếu. Nếu cần điều chỉnh, vui lòng liên hệ người quản lý giải trình.</p>}
            <div>
              <h4 className="font-semibold mb-2">Lịch sử</h4>
              <ol className="space-y-2 border-l pl-3">
                {(ev.data || []).map((e) => (
                  <li key={e.id}>
                    <div className="font-medium">{att.ATT_ACTION_LABEL[e.action] || e.action}</div>
                    <div className="text-xs text-muted-foreground">{name(e.actor_id)} · {fmtVn(e.created_at)}</div>
                    {e.action === "edit" && e.detail?.old && <EditDiff d={e.detail} name={name} />}
                    {e.action === "note" && <div className="text-xs mt-0.5">“{e.detail?.old || "—"}” → “{e.detail?.new || "—"}”</div>}
                    {["witness_unable", "witness_confirm", "reconcile"].includes(e.action) && e.detail?.note && <div className="text-xs mt-0.5">Ghi chú: {e.detail.note}</div>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </SheetContent>
      {act && a && (
        <Dialog open onOpenChange={(o) => !o && setAct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{title[act]}</DialogTitle></DialogHeader>
            {act !== "recall" && act !== "confirm" && <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (không bắt buộc)" />}
            {act === "confirm" && <p className="text-sm text-muted-foreground">Xác nhận làm chứng không đồng nghĩa với phê duyệt hay công nhận công.</p>}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAct(null)}>Đóng</Button>
              <Button onClick={run} disabled={busy}>{busy ? "Đang xử lý…" : "Xác nhận"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Sheet>
  );
}

function EditDiff({ d, name }: { d: any; name: NameFn }) {
  const F: [string, string][] = [["work_date", "Ngày"], ["kind", "Nội dung"], ["time_in", "Giờ vào"], ["time_out", "Giờ ra"], ["reason_name", "Lý do"], ["detail", "Chi tiết"], ["witness_id", "Người làm chứng"]];
  const fmt = (k: string, v: any) => v == null || v === "" ? "—" : k === "work_date" ? fmtDate(v) : k === "kind" ? KIND_LABEL[v as AttKind] : k === "witness_id" ? name(v) : String(v);
  const changed = F.filter(([k]) => JSON.stringify(d.old?.[k] ?? null) !== JSON.stringify(d.new?.[k] ?? null));
  return (
    <div className="text-xs mt-0.5 space-y-0.5">
      {changed.map(([k, l]) => <div key={k}>{l}: {fmt(k, d.old?.[k])} → {fmt(k, d.new?.[k])}</div>)}
      {d.witness_reset && <div className="text-warning-foreground">Yêu cầu người làm chứng xác nhận lại</div>}
    </div>
  );
}
