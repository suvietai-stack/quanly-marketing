import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, CalendarDays, Clock, LogOut as LogOutIcon, AlertTriangle, History, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  TYPE_LABEL, HALF_LABEL, DOW_LABEL, evaluate, deadlineOf, deadlineRule, fmtVn, fmtDate, fmtDays, isoDow, todayVn,
  firstWorkingHalf, lastWorkingHalf, type LeaveSettings, type LeaveType, type Half,
} from "@/lib/leave/calc";
import * as api from "@/lib/leave/api";
import type { LeaveRequest, LeaveStatus } from "@/lib/leave/api";

const QUICK = [5, 10, 15, 20, 25, 30, 60];
const LAST_APPROVER = "leave_last_approver";

const STATUS_CLS: Record<LeaveStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  recalled: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

function useNames() {
  const users = useAuth((s) => s.users);
  return useMemo(() => {
    const m = new Map(users.map((u) => [u.id, u.fullName || u.username]));
    return (id?: string | null) => (id ? m.get(id) || "—" : "—");
  }, [users]);
}

export function summary(r: Pick<LeaveRequest, "type" | "payload" | "calc">): string {
  const p = r.payload || {};
  if (r.type === "leave") {
    const a = `${HALF_LABEL[p.start_half as Half]} ${fmtDate(p.start_date)}`;
    const b = `hết ${HALF_LABEL[p.end_half as Half].toLowerCase()} ${fmtDate(p.end_date)}`;
    return `${a} → ${b} · ${fmtDays(Number(r.calc?.days ?? 0))} ngày`;
  }
  const exp = r.calc?.expected_at ? fmtVn(r.calc.expected_at, false) : "";
  return `${fmtDate(p.date)} (${HALF_LABEL[p.half as Half]}) · ${p.minutes} phút · ${r.type === "late" ? "có mặt" : "ra về"} ${exp}`;
}

function StatusBadge({ r }: { r: LeaveRequest }) {
  const overdue = r.status === "pending" && new Date(r.mark_at) <= new Date();
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="outline" className={STATUS_CLS[r.status]}>{api.STATUS_LABEL[r.status]}</Badge>
      {r.cancel_state === "requested" && <Badge variant="outline" className="border-warning/40">Yêu cầu hủy</Badge>}
      {r.cancel_state === "rejected" && <Badge variant="outline">Từ chối hủy</Badge>}
      {overdue && <Badge variant="outline" className="border-destructive/40 text-destructive">Đã qua thời điểm đăng ký</Badge>}
      {r.submission_no > 1 && <Badge variant="outline">Lần gửi {r.submission_no}</Badge>}
    </div>
  );
}

export function LeavePage() {
  const { user, can } = useCurrentUser();
  const qc = useQueryClient();
  const name = useNames();
  const settingsQ = useQuery({ queryKey: ["leave", "settings"], queryFn: api.getSettings });
  const listQ = useQuery({ queryKey: ["leave", "list"], queryFn: api.listRequests, enabled: !!user });
  const all = listQ.data || [];
  const uid = user?.id;

  const showMine = can("leave.view_own") || can("leave.create");
  const showApprove = can("leave.view_assigned") || can("leave.approve");
  const showManage = can("leave.view_all");
  const showReport = can("leave.report");
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [tab, setTab] = useState(() => initial?.get("tab") || (showMine ? "mine" : showApprove ? "approve" : showManage ? "manage" : "report"));
  const [openId, setOpenId] = useState<string | null>(() => initial?.get("open") || null);
  const [form, setForm] = useState<FormState | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["leave"] });
  const mine = all.filter((r) => r.owner_id === uid);
  const toApprove = all.filter((r) => r.approver_id === uid && r.owner_id !== uid);
  const pendingApprove = toApprove.filter((r) => r.status === "pending" || r.cancel_state === "requested").length;

  const setOpen = (id: string | null) => {
    setOpenId(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("open", id); else u.searchParams.delete("open");
    window.history.replaceState(null, "", u.toString());
  };

  const settings = settingsQ.data;
  return (
    <>
      <PageHeader
        title="Đơn từ & Phê duyệt"
        description="Nghỉ phép, đi muộn, về sớm — gửi đơn và theo dõi phê duyệt."
        actions={can("leave.create") || can("leave.create_for") ? (
          <Button onClick={() => setForm({ mode: "create" })} disabled={!settings}><Plus className="h-4 w-4 mr-1" />Tạo đơn</Button>
        ) : undefined}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {showMine && <TabsTrigger value="mine">Đơn của tôi</TabsTrigger>}
          {showApprove && <TabsTrigger value="approve">Chờ tôi duyệt{pendingApprove > 0 && <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5">{pendingApprove}</span>}</TabsTrigger>}
          {showManage && <TabsTrigger value="manage">Quản lý đơn từ</TabsTrigger>}
          {showReport && <TabsTrigger value="report">Báo cáo</TabsTrigger>}
        </TabsList>
        {showMine && <TabsContent value="mine" className="mt-4"><RequestList rows={mine} loading={listQ.isLoading} onOpen={setOpen} name={name} showOwner={false} empty="Bạn chưa có đơn nào." /></TabsContent>}
        {showApprove && <TabsContent value="approve" className="mt-4"><ApproveList rows={toApprove} loading={listQ.isLoading} onOpen={setOpen} name={name} /></TabsContent>}
        {showManage && <TabsContent value="manage" className="mt-4"><ManageList rows={all} loading={listQ.isLoading} onOpen={setOpen} name={name} /></TabsContent>}
        {showReport && <TabsContent value="report" className="mt-4">
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Báo cáo đơn từ sẽ có trong giai đoạn tiếp theo.</CardContent></Card>
        </TabsContent>}
      </Tabs>

      {openId && settings && (
        <DetailSheet id={openId} settings={settings} name={name} onClose={() => setOpen(null)} onChanged={refresh}
          onEdit={(r, mode) => setForm({ mode, request: r })} />
      )}
      {form && settings && (
        <FormDialog state={form} settings={settings} onClose={() => setForm(null)}
          onDone={(id) => { setForm(null); refresh(); if (id) setOpen(id); }} />
      )}
    </>
  );
}

/* ================= Lists ================= */
function RequestList({ rows, loading, onOpen, name, showOwner, empty }: { rows: LeaveRequest[]; loading: boolean; onOpen: (id: string) => void; name: (id?: string | null) => string; showOwner: boolean; empty: string }) {
  if (loading) return <p className="text-sm text-muted-foreground py-6">Đang tải…</p>;
  if (!rows.length) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{empty}</CardContent></Card>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <button key={r.id} onClick={() => onOpen(r.id)} className="w-full text-left rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors">
          <div className="flex items-start gap-3">
            <TypeIcon type={r.type} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
                {TYPE_LABEL[r.type]}{showOwner && <span className="text-muted-foreground font-normal">· {name(r.owner_id)}</span>}
              </div>
              <div className="text-sm text-muted-foreground truncate">{summary(r)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.reason_name} · Người duyệt: {name(r.approver_id)}</div>
              <div className="mt-1.5"><StatusBadge r={r} /></div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
          </div>
        </button>
      ))}
    </div>
  );
}

function TypeIcon({ type }: { type: LeaveType }) {
  const I = type === "leave" ? CalendarDays : type === "late" ? Clock : LogOutIcon;
  return <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><I className="h-4 w-4" /></div>;
}

function ApproveList({ rows, ...rest }: { rows: LeaveRequest[]; loading: boolean; onOpen: (id: string) => void; name: (id?: string | null) => string }) {
  const [f, setF] = useState<"todo" | "done">("todo");
  const todo = rows.filter((r) => r.status === "pending" || r.cancel_state === "requested");
  const done = rows.filter((r) => !(r.status === "pending" || r.cancel_state === "requested"));
  return <>
    <div className="flex gap-2 mb-3">
      <Button size="sm" variant={f === "todo" ? "default" : "outline"} onClick={() => setF("todo")}>Cần xử lý ({todo.length})</Button>
      <Button size="sm" variant={f === "done" ? "default" : "outline"} onClick={() => setF("done")}>Đã xử lý ({done.length})</Button>
    </div>
    <RequestList rows={f === "todo" ? todo : done} showOwner empty={f === "todo" ? "Không có đơn nào chờ bạn duyệt." : "Chưa có đơn nào."} {...rest} />
  </>;
}

function ManageList({ rows, ...rest }: { rows: LeaveRequest[]; loading: boolean; onOpen: (id: string) => void; name: (id?: string | null) => string }) {
  const [st, setSt] = useState<string>("all");
  const [tp, setTp] = useState<string>("all");
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => (st === "all" || r.status === st || (st === "cancel_req" && r.cancel_state === "requested"))
    && (tp === "all" || r.type === tp)
    && (!q || rest.name(r.owner_id).toLowerCase().includes(q.toLowerCase())));
  return <>
    <div className="flex flex-wrap gap-2 mb-3">
      <Input placeholder="Tìm nhân viên…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-56" />
      <Select value={st} onValueChange={setSt}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi trạng thái</SelectItem>
          {(Object.keys(api.STATUS_LABEL) as LeaveStatus[]).map((k) => <SelectItem key={k} value={k}>{api.STATUS_LABEL[k]}</SelectItem>)}
          <SelectItem value="cancel_req">Có yêu cầu hủy</SelectItem>
        </SelectContent>
      </Select>
      <Select value={tp} onValueChange={setTp}>
        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Mọi loại đơn</SelectItem>
          {(Object.keys(TYPE_LABEL) as LeaveType[]).map((k) => <SelectItem key={k} value={k}>{TYPE_LABEL[k]}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <RequestList rows={shown} showOwner empty="Không có đơn phù hợp." {...rest} />
  </>;
}

/* ================= Form ================= */
type FormState = { mode: "create" | "edit" | "resubmit"; request?: LeaveRequest };

function FormDialog({ state, settings, onClose, onDone }: { state: FormState; settings: LeaveSettings; onClose: () => void; onDone: (id?: string) => void }) {
  const { user, can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const r = state.request;
  const today = todayVn();
  const [type, setType] = useState<LeaveType>(r?.type || "leave");
  const [owner, setOwner] = useState<string>(r?.owner_id || user?.id || "");
  const [lp, setLp] = useState<any>(r?.type === "leave" ? r.payload : { start_date: today, start_half: "am", end_date: today, end_half: "pm" });
  const [sp, setSp] = useState<any>(r && r.type !== "leave" ? r.payload : { date: today, half: "am", minutes: 15 });
  const [custom, setCustom] = useState(() => !!(r && r.type !== "leave" && !QUICK.includes(r.payload.minutes)));
  const [reasonId, setReasonId] = useState(r?.reason_id || "");
  const [detail, setDetail] = useState(r?.detail || "");
  const [approver, setApprover] = useState<string>(r?.approver_id || (typeof window !== "undefined" ? localStorage.getItem(LAST_APPROVER) || "" : ""));
  const [exception, setException] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const approversQ = useQuery({ queryKey: ["leave", "approvers"], queryFn: api.listApprovers });
  const approvers = (approversQ.data || []).filter((a) => a.id !== owner);
  const canFor = can("leave.create_for") && state.mode === "create";
  const canException = can("leave.exception") && state.mode === "create";

  // Keep shift half aligned with the working schedule of the chosen date.
  useEffect(() => {
    if (type === "leave") return;
    const h = type === "late" ? firstWorkingHalf(settings, sp.date) : lastWorkingHalf(settings, sp.date);
    if (h && !(settings.schedule[String(isoDow(sp.date))]?.[sp.half as Half])) setSp((x: any) => ({ ...x, half: h }));
  }, [type, sp.date]); // eslint-disable-line react-hooks/exhaustive-deps

  const payload = type === "leave" ? lp : sp;
  const res = evaluate(settings, type, payload);
  const dl = res.ok ? deadlineOf(settings, type, res.markAt) : null;
  const late = !!dl && new Date() > dl;
  const reasons = settings.reasons.filter((x) => x.active || x.id === r?.reason_id);
  const needDetail = reasonId === "other" && !detail.trim();
  const blocked = !res.ok || (late && !(canException && exception.trim())) || !reasonId || needDetail || !approver;

  const submit = async () => {
    setBusy(true); setErr(null);
    const f: api.FormInput = { owner: owner === user?.id ? null : owner, type, payload, reasonId, detail, approver, exception: late ? exception : undefined };
    try {
      let id: string | undefined;
      if (state.mode === "create") id = await api.submitRequest(f);
      else if (state.mode === "edit") await api.updateRequest(r!.id, f);
      else await api.resubmitRequest(r!.id, f);
      localStorage.setItem(LAST_APPROVER, approver);
      toast.success(state.mode === "edit" ? "Đã lưu thay đổi" : "Đã gửi đơn");
      onDone(id || r?.id);
    } catch (e) { setErr(api.leaveErr(e)); } finally { setBusy(false); }
  };

  const title = state.mode === "create" ? "Tạo đơn" : state.mode === "edit" ? "Sửa đơn" : "Sửa và gửi lại";
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {state.mode === "create" && (
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TYPE_LABEL) as LeaveType[]).map((t) => (
                <button key={t} onClick={() => setType(t)} className={cn("rounded-md border py-2.5 text-sm font-medium", type === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{TYPE_LABEL[t]}</button>
              ))}
            </div>
          )}
          {canFor && (
            <div className="space-y-1.5">
              <Label>Người đứng tên đơn</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{users.filter((u) => u.status === "Đang hoạt động").map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}{u.id === user?.id ? " (tôi)" : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          {type === "leave" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Ngày bắt đầu nghỉ</Label><Input type="date" value={lp.start_date} onChange={(e) => setLp({ ...lp, start_date: e.target.value, end_date: lp.end_date < e.target.value ? e.target.value : lp.end_date })} /></div>
              <div className="space-y-1.5"><Label>Bắt đầu từ buổi</Label><HalfPick value={lp.start_half} onChange={(v) => setLp({ ...lp, start_half: v })} /></div>
              <div className="space-y-1.5"><Label>Ngày kết thúc nghỉ</Label><Input type="date" value={lp.end_date} min={lp.start_date} onChange={(e) => setLp({ ...lp, end_date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Nghỉ đến hết buổi</Label><HalfPick value={lp.end_half} onChange={(v) => setLp({ ...lp, end_half: v })} /></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Ngày xin {type === "late" ? "đi muộn" : "về sớm"}</Label><Input type="date" value={sp.date} onChange={(e) => setSp({ ...sp, date: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Ca làm việc</Label><HalfPick value={sp.half} onChange={(v) => setSp({ ...sp, half: v })} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Thời gian {type === "late" ? "đi muộn" : "về sớm"}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK.map((m) => <button key={m} onClick={() => { setCustom(false); setSp({ ...sp, minutes: m }); }} className={cn("rounded-md border px-3 py-1.5 text-sm", !custom && sp.minutes === m ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{m} phút</button>)}
                  <button onClick={() => setCustom(true)} className={cn("rounded-md border px-3 py-1.5 text-sm", custom ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>Khác</button>
                </div>
                {custom && <Input type="number" min={1} max={480} value={sp.minutes || ""} onChange={(e) => setSp({ ...sp, minutes: Number(e.target.value) })} placeholder="Số phút" className="w-32 mt-1.5" />}
              </div>
            </>
          )}

          {/* Preview */}
          {res.ok ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
              {type === "leave" ? <>
                {res.details!.map((d) => <div key={d.date} className="flex justify-between"><span>{DOW_LABEL[isoDow(d.date)]} {fmtDate(d.date)}: {d.am && d.pm ? "Cả ngày" : d.am ? "Buổi sáng" : "Buổi chiều"}</span><span>{fmtDays(d.days)} ngày</span></div>)}
                <div className="border-t pt-1 font-semibold flex justify-between"><span>TỔNG CỘNG</span><span>{fmtDays(res.days!)} NGÀY</span></div>
              </> : <>
                <div>Giờ {type === "late" ? "bắt đầu" : "kết thúc"} buổi: {type === "late" ? res.sessionStart : res.sessionEnd}</div>
                <div className="font-semibold">{type === "late" ? "Dự kiến có mặt" : "Dự kiến ra về"}: {fmtVn(res.expectedAt!, false)}</div>
                <div>Thời gian {type === "late" ? "đi muộn" : "về sớm"}: {res.minutes} phút</div>
              </>}
              <div className="text-xs text-muted-foreground pt-1">Hạn cuối gửi: {fmtVn(dl!)}</div>
            </div>
          ) : <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{res.error}</div>}

          {late && res.ok && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm space-y-1">
              <div className="font-semibold text-destructive flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" />KHÔNG THỂ GỬI ĐƠN {TYPE_LABEL[type].toUpperCase()}</div>
              <div>Theo quy định của công ty, {deadlineRule(settings, type)}.</div>
              <div>Thời điểm {type === "leave" ? "bắt đầu nghỉ" : type === "late" ? "bắt đầu ca" : "dự kiến ra về"}: {fmtVn(res.markAt)}</div>
              <div>Hạn cuối gửi: {fmtVn(dl!)}</div>
              <div>Đơn đã quá thời hạn đăng ký. Vui lòng liên hệ người quản lý nếu có trường hợp đặc biệt.</div>
              {canException && <div className="pt-2 space-y-1"><Label>Xử lý ngoại lệ — lý do (bắt buộc)</Label><Textarea value={exception} onChange={(e) => setException(e.target.value)} rows={2} /></div>}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Lý do</Label>
            <Select value={reasonId} onValueChange={setReasonId}>
              <SelectTrigger><SelectValue placeholder="Chọn lý do" /></SelectTrigger>
              <SelectContent>{reasons.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}{!x.active ? " (ngừng dùng)" : ""}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Chi tiết lý do{reasonId === "other" && <span className="text-destructive"> *</span>}</Label>
            <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} placeholder="Diễn giải ngắn gọn (không cần nêu thông tin quá riêng tư)" />
          </div>
          <div className="space-y-1.5">
            <Label>Người phê duyệt</Label>
            <Select value={approvers.some((a) => a.id === approver) ? approver : ""} onValueChange={setApprover}>
              <SelectTrigger><SelectValue placeholder={approversQ.isLoading ? "Đang tải…" : approvers.length ? "Chọn người duyệt" : "Chưa có ai được cấp quyền Phê duyệt đơn"} /></SelectTrigger>
              <SelectContent>{approvers.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {err && <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive whitespace-pre-line">{err}</div>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={submit} disabled={blocked || busy || (approver !== "" && !approvers.some((a) => a.id === approver))}>
            {busy ? "Đang gửi…" : state.mode === "edit" ? "Lưu thay đổi" : state.mode === "resubmit" ? "Gửi xin duyệt lại" : "Gửi đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HalfPick({ value, onChange }: { value: Half; onChange: (v: Half) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {(["am", "pm"] as Half[]).map((h) => <button key={h} type="button" onClick={() => onChange(h)} className={cn("rounded-md border h-9 text-sm", value === h ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}>{HALF_LABEL[h]}</button>)}
    </div>
  );
}

/* ================= Detail ================= */
function DetailSheet({ id, settings, name, onClose, onChanged, onEdit }: {
  id: string; settings: LeaveSettings; name: (id?: string | null) => string; onClose: () => void; onChanged: () => void;
  onEdit: (r: LeaveRequest, mode: "edit" | "resubmit") => void;
}) {
  const { user, can } = useCurrentUser();
  const q = useQuery({ queryKey: ["leave", "one", id], queryFn: () => api.getRequest(id) });
  const h = useQuery({ queryKey: ["leave", "hist", id], queryFn: () => api.getHistory(id), enabled: !!q.data });
  const approversQ = useQuery({ queryKey: ["leave", "approvers"], queryFn: api.listApprovers, enabled: can("leave.reassign") });
  const [act, setAct] = useState<null | { kind: "approve" | "reject" | "recall" | "cancel_req" | "cancel_ok" | "cancel_no" | "reassign" | "exception" }>(null);
  const [note, setNote] = useState("");
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const r = q.data;
  const uid = user?.id;
  const now = new Date();

  const run = async () => {
    if (!r || !act) return;
    setBusy(true);
    try {
      const k = act.kind;
      if (k === "approve") await api.decide(r.id, true, note);
      if (k === "reject") await api.decide(r.id, false, note);
      if (k === "recall") await api.recall(r.id);
      if (k === "cancel_req") await api.cancelRequest(r.id, note);
      if (k === "cancel_ok") await api.cancelDecide(r.id, true, note);
      if (k === "cancel_no") await api.cancelDecide(r.id, false, note);
      if (k === "reassign") await api.reassign(r.id, target, note);
      if (k === "exception") await api.exceptionCancel(r.id, note);
      toast.success("Đã cập nhật đơn");
      setAct(null); setNote(""); setTarget("");
      q.refetch(); h.refetch(); onChanged();
    } catch (e) { toast.error(api.leaveErr(e)); q.refetch(); } finally { setBusy(false); }
  };

  const isOwner = r?.owner_id === uid;
  const isApprover = r?.approver_id === uid && !isOwner;
  const recallLimit = r ? new Date(new Date(r.mark_at).getTime() - (settings.recall_minutes?.[r.type] ?? 0) * 60000) : now;
  const acts = r ? {
    approve: r.status === "pending" && isApprover && can("leave.approve"),
    recall: r.status === "pending" && isOwner && can("leave.recall") && now < recallLimit,
    edit: r.status === "pending" && ((isOwner && can("leave.edit_own")) || can("leave.edit_others")),
    resubmit: r.status === "rejected" && ((isOwner && can("leave.edit_own")) || can("leave.edit_others")),
    cancelReq: r.status === "approved" && isOwner && r.cancel_state !== "requested" && now < new Date(r.mark_at),
    cancelHandle: r.status === "approved" && r.cancel_state === "requested" && !isOwner && can("leave.cancel_handle") && (isApprover || can("leave.view_all")),
    reassign: r.status === "pending" && can("leave.reassign"),
    exception: (r.status === "pending" || r.status === "approved") && !isOwner && can("leave.exception"),
  } : null;

  const needNote = act && ["reject", "cancel_req", "cancel_no", "exception"].includes(act.kind);
  const actTitle: Record<string, string> = {
    approve: "Xác nhận phê duyệt đơn?", reject: "Từ chối đơn — lý do (bắt buộc)", recall: "Thu hồi đơn này?",
    cancel_req: "Yêu cầu hủy đơn — lý do (bắt buộc)", cancel_ok: "Chấp thuận yêu cầu hủy?", cancel_no: "Từ chối yêu cầu hủy — lý do (bắt buộc)",
    reassign: "Chuyển người duyệt", exception: "Xử lý ngoại lệ: hủy đơn — lý do (bắt buộc)",
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full h-full max-w-none sm:max-w-xl overflow-y-auto">
        <SheetHeader><SheetTitle>{r ? `Đơn ${TYPE_LABEL[r.type].toLowerCase()}` : "Chi tiết đơn"}</SheetTitle></SheetHeader>
        {q.isLoading ? <p className="text-sm text-muted-foreground mt-6">Đang tải…</p> : !r ? (
          <div className="mt-10 text-center">
            <h3 className="font-semibold">Không thể mở đơn</h3>
            <p className="text-sm text-muted-foreground mt-1">Đơn không tồn tại hoặc bạn không có quyền xem đơn này.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-sm">
            <StatusBadge r={r} />
            <dl className="grid grid-cols-[120px_1fr] gap-y-1.5">
              <dt className="text-muted-foreground">Người đứng tên</dt><dd>{name(r.owner_id)}</dd>
              {r.created_by !== r.owner_id && <><dt className="text-muted-foreground">Người tạo hộ</dt><dd>{name(r.created_by)}</dd></>}
              <dt className="text-muted-foreground">Thời gian</dt><dd>{summary(r)}</dd>
              <dt className="text-muted-foreground">Lý do</dt><dd>{r.reason_name}</dd>
              {r.detail && <><dt className="text-muted-foreground">Chi tiết</dt><dd className="whitespace-pre-line">{r.detail}</dd></>}
              <dt className="text-muted-foreground">Người duyệt</dt><dd>{name(r.approver_id)}</dd>
              <dt className="text-muted-foreground">Gửi lúc</dt><dd>{fmtVn(r.submitted_at)}</dd>
              <dt className="text-muted-foreground">Hạn cuối gửi</dt><dd>{r.applied?.deadline_at ? fmtVn(r.applied.deadline_at) : "—"}</dd>
              {r.decided_at && <><dt className="text-muted-foreground">{r.status === "rejected" ? "Từ chối" : "Xử lý"} bởi</dt><dd>{name(r.decided_by)} · {fmtVn(r.decided_at)}</dd></>}
              {r.decision_note && <><dt className="text-muted-foreground">{r.status === "rejected" ? "Lý do từ chối" : "Ghi chú"}</dt><dd className="whitespace-pre-line">{r.decision_note}</dd></>}
              {r.cancel_reason && <><dt className="text-muted-foreground">Lý do yêu cầu hủy</dt><dd>{r.cancel_reason}</dd></>}
            </dl>
            {r.type === "leave" && r.calc?.details && (
              <div className="rounded-md border bg-muted/40 p-3 space-y-1">
                {r.calc.details.map((d: any) => <div key={d.date} className="flex justify-between"><span>{DOW_LABEL[isoDow(d.date)]} {fmtDate(d.date)}: {d.am && d.pm ? "Cả ngày" : d.am ? "Buổi sáng" : "Buổi chiều"}</span><span>{fmtDays(d.days)} ngày</span></div>)}
                <div className="border-t pt-1 font-semibold flex justify-between"><span>TỔNG CỘNG</span><span>{fmtDays(r.calc.days)} NGÀY</span></div>
              </div>
            )}

            {acts && (
              <div className="flex flex-wrap gap-2">
                {acts.approve && <><Button onClick={() => setAct({ kind: "approve" })}>Phê duyệt</Button><Button variant="outline" onClick={() => setAct({ kind: "reject" })}>Từ chối</Button></>}
                {acts.edit && <Button variant="outline" onClick={() => onEdit(r, "edit")}>Sửa đơn</Button>}
                {acts.resubmit && <Button onClick={() => onEdit(r, "resubmit")}>Sửa và gửi lại</Button>}
                {acts.recall && <Button variant="outline" onClick={() => setAct({ kind: "recall" })}>Thu hồi đơn</Button>}
                {acts.cancelReq && <Button variant="outline" onClick={() => setAct({ kind: "cancel_req" })}>Yêu cầu hủy đơn</Button>}
                {acts.cancelHandle && <><Button onClick={() => setAct({ kind: "cancel_ok" })}>Chấp thuận hủy</Button><Button variant="outline" onClick={() => setAct({ kind: "cancel_no" })}>Từ chối hủy</Button></>}
                {acts.reassign && <Button variant="outline" onClick={() => setAct({ kind: "reassign" })}>Chuyển người duyệt</Button>}
                {acts.exception && <Button variant="ghost" className="text-destructive" onClick={() => setAct({ kind: "exception" })}>Ngoại lệ: hủy đơn</Button>}
              </div>
            )}

            <HistoryBlock subs={h.data?.subs || []} events={h.data?.events || []} name={name} />
          </div>
        )}
      </SheetContent>

      {act && r && (
        <Dialog open onOpenChange={(o) => !o && setAct(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{actTitle[act.kind]}</DialogTitle></DialogHeader>
            {act.kind === "reassign" && (
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue placeholder="Chọn người duyệt mới" /></SelectTrigger>
                <SelectContent>{(approversQ.data || []).filter((a) => a.id !== r.owner_id && a.id !== r.approver_id).map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {(needNote || act.kind === "reassign" || act.kind === "approve") && (
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={needNote ? "Nhập lý do" : "Ghi chú (không bắt buộc)"} />
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAct(null)}>Đóng</Button>
              <Button onClick={run} disabled={busy || (!!needNote && !note.trim()) || (act.kind === "reassign" && !target)}>{busy ? "Đang xử lý…" : "Xác nhận"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Sheet>
  );
}

function HistoryBlock({ subs, events, name }: { subs: api.LeaveSubmission[]; events: api.LeaveEvent[]; name: (id?: string | null) => string }) {
  const RES: Record<string, string> = { approved: "Đã duyệt", rejected: "Từ chối", recalled: "Đã thu hồi", cancelled: "Đã hủy" };
  return (
    <div className="space-y-3">
      {subs.length > 1 && (
        <div>
          <div className="font-semibold flex items-center gap-1.5 mb-2"><History className="h-4 w-4" />Các lần gửi</div>
          <div className="space-y-2">
            {subs.map((s) => (
              <div key={s.id} className="rounded-md border p-2.5">
                <div className="font-medium">Lần {s.no} · {fmtVn(s.submitted_at)}</div>
                <div className="text-muted-foreground">{summary({ type: s.payload?.start_date ? "leave" : (s.calc?.expected_at && s.calc?.mark_at === s.calc?.expected_at ? "early" : "late"), payload: s.payload, calc: s.calc } as any)}</div>
                <div>Lý do: {s.reason_name}{s.detail ? ` — ${s.detail}` : ""}</div>
                <div>Người duyệt: {name(s.approver_id)} · Kết quả: {s.result ? RES[s.result] || s.result : "Chờ duyệt"}{s.note ? ` — ${s.note}` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="font-semibold mb-2">Lịch sử xử lý</div>
        <ol className="space-y-1.5 border-l pl-3">
          {events.map((e) => (
            <li key={e.id}>
              <span className="font-medium">{api.ACTION_LABEL[e.action] || e.action}</span>
              <span className="text-muted-foreground"> · {name(e.actor_id)} · {fmtVn(e.created_at)}</span>
              {e.detail?.to && <div className="text-muted-foreground">→ {name(e.detail.to)}</div>}
              {(e.detail?.note || e.detail?.reason) && <div className="text-muted-foreground">{e.detail.note || e.detail.reason}</div>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
