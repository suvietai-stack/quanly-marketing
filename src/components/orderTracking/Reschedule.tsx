import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { otApi, fmtDate, fmtDateTime, type OtOrder, type OtReschedule } from "@/lib/orderTracking/api";
import { todayVN } from "@/lib/orderTracking/logic";

const STATUS: Record<OtReschedule["status"], string> = { pending: "Chờ phản hồi", accepted: "Đã đồng ý", rejected: "Đã từ chối", countered: "Đã đề xuất ngày khác", withdrawn: "Đã rút" };
const SIDE = { sale: "Kinh doanh", supply: "Cung ứng" };

/** Điều chỉnh ngày khách nhận giữa Kinh doanh và Cung ứng. Máy chủ kiểm tra quyền, bên phản hồi và ngày hợp lệ. */
export function ReschedulePanel({ o, name }: { o: OtOrder; name: (id?: string | null) => string }) {
  const { can, user } = useCurrentUser();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["ot", "resch", o.id], queryFn: () => otApi.reschedules(o.id) });
  const [mode, setMode] = useState<null | "propose" | "reject" | "counter">(null);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = list.data ?? [];
  const pending = rows.find((r) => r.status === "pending");
  const open = ["new", "in_progress"].includes(o.status);
  const mySide = user?.id === o.sale_id ? "sale" : user?.id === o.supply_id ? "supply" : null;
  const canPropose = open && !pending && !!mySide && can("ot.reschedule_propose") && !!o.sale_id && !!o.supply_id;
  const canReply = open && !!pending && !!mySide && pending.side !== mySide && can("ot.reschedule_reply");
  const canWithdraw = !!pending && pending.proposer_id === user?.id;
  if (!rows.length && !canPropose) return null;

  const go = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); await qc.invalidateQueries({ queryKey: ["ot"] }); toast.success(ok); setMode(null); setDate(""); setNote(""); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  const submit = () => {
    if (mode === "propose") return go(() => otApi.propose(o.id, date, note), "Đã gửi đề xuất điều chỉnh lịch.");
    if (mode === "reject" && pending) return go(() => otApi.reply(pending.id, "reject", null, note), "Đã từ chối đề xuất.");
    if (mode === "counter" && pending) return go(() => otApi.reply(pending.id, "counter", date, note), "Đã đề xuất ngày khác.");
  };
  const needDate = mode === "propose" || mode === "counter";

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CalendarClock className="h-4 w-4" /><span className="text-sm font-medium">Điều chỉnh ngày khách nhận</span>
        {canPropose && <Button size="sm" variant="outline" className="ml-auto" onClick={() => setMode("propose")}>Đề xuất điều chỉnh</Button>}
      </div>
      {pending && (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
          <div><b>{name(pending.proposer_id)}</b> ({SIDE[pending.side]}) đề xuất đổi từ <b>{fmtDate(pending.from_date)}</b> sang <b className="text-primary">{fmtDate(pending.proposed_date)}</b></div>
          <div className="mt-1 text-muted-foreground">Lý do: {pending.reason}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {canReply && <>
              <Button size="sm" disabled={busy} onClick={() => go(() => otApi.reply(pending.id, "accept", null, ""), "Đã đồng ý, ngày khách nhận đã cập nhật.")}>Đồng ý</Button>
              <Button size="sm" variant="outline" onClick={() => setMode("counter")}>Đề xuất ngày khác</Button>
              <Button size="sm" variant="outline" onClick={() => setMode("reject")}>Từ chối</Button>
            </>}
            {canWithdraw && <Button size="sm" variant="ghost" disabled={busy} onClick={() => go(() => otApi.withdraw(pending.id), "Đã rút đề xuất.")}>Rút đề xuất</Button>}
            {!canReply && !canWithdraw && <span className="text-xs text-muted-foreground">Đang chờ {pending.side === "sale" ? "Cung ứng" : "Kinh doanh"} phản hồi.</span>}
          </div>
        </div>
      )}
      {rows.filter((r) => r.status !== "pending").length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {rows.filter((r) => r.status !== "pending").map((r) => (
            <li key={r.id} className="border-l-2 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <span>{fmtDate(r.from_date)} → {fmtDate(r.proposed_date)}</span>
                <Badge variant={r.status === "accepted" ? "default" : "outline"}>{STATUS[r.status]}</Badge>
                <span className="text-xs text-muted-foreground">{name(r.proposer_id)} ({SIDE[r.side]}) · {fmtDateTime(r.created_at)}</span>
              </div>
              <div className="text-xs text-muted-foreground">Lý do: {r.reason}{r.response_note ? ` · Phản hồi: ${r.response_note}` : ""}</div>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!mode} onOpenChange={(v) => !v && setMode(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{mode === "propose" ? "Đề xuất điều chỉnh ngày khách nhận" : mode === "counter" ? "Đề xuất ngày khác" : "Từ chối đề xuất"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Ngày khách nhận hiện tại: <b>{fmtDate(o.due_date)}</b></p>
            {needDate && <div className="space-y-1"><Label htmlFor="ot-rs-date">Ngày đề xuất *</Label><Input id="ot-rs-date" type="date" min={todayVN()} value={date} onChange={(e) => setDate(e.target.value)} /></div>}
            <div className="space-y-1"><Label htmlFor="ot-rs-note">Lý do *</Label><Textarea id="ot-rs-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>Hủy</Button>
            <Button disabled={busy || !note.trim() || (needDate && !date)} onClick={submit}>Gửi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
