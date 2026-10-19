import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SOURCES } from "@/lib/finance/incoming";
import { finManualNotify } from "@/lib/finance/gmf.functions";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const fmtNum = (s: string) => { const d = s.replace(/\D/g, "").replace(/^0+/, ""); return d ? Number(d).toLocaleString("vi-VN") : ""; };

type Edit = { id: string; source: string; amount: number; received_date: string | null; note: string | null; reconciled: boolean };

/** Thêm / sửa khoản tiền thủ công (Tiền mặt, TK khác). Ghi qua RPC fin_manual_*; backend kiểm quyền. */
export function ManualEntry({ open, onOpenChange, canReconcile, edit, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; canReconcile: boolean; edit?: Edit | null; onDone: (id?: string) => void;
}) {
  const [f, setF] = useState({ source: "", amount: "", date: today(), note: "", reason: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setF(edit ? { source: edit.source, amount: Number(edit.amount).toLocaleString("vi-VN"), date: edit.received_date ?? today(), note: edit.note ?? "", reason: "" }
      : { source: "", amount: "", date: today(), note: "", reason: "" });
  }, [open, edit?.id]);

  const submit = async () => {
    const amount = Number(f.amount.replace(/\D/g, ""));
    if (!f.source) return toast.error("Vui lòng chọn Nguồn tiền");
    if (!amount) return toast.error("Số tiền phải lớn hơn 0");
    if (!f.date) return toast.error("Vui lòng chọn Ngày nhận tiền");
    if (!f.note.trim()) return toast.error("Vui lòng nhập Ghi chú");
    if (edit?.reconciled && !f.reason.trim()) return toast.error("Vui lòng nhập lý do sửa khoản đã xác nhận");
    setBusy(true);
    const res = edit
      ? await supabase.rpc("fin_manual_update", { _tx: edit.id, _source: f.source, _amount: amount, _date: f.date, _note: f.note, _reason: f.reason || undefined })
      : await supabase.rpc("fin_manual_create", { _source: f.source, _amount: amount, _date: f.date, _note: f.note });
    setBusy(false);
    if (res.error) return toast.error(res.error.message || "Không lưu được");
    if (!edit && res.data) finManualNotify({ data: { id: res.data as string } }).catch(() => {});
    toast.success(edit ? "Đã lưu thay đổi" : "Đã lưu khoản tiền — Chưa xác nhận");
    onOpenChange(false);
    onDone(edit ? edit.id : (res.data as string));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{edit ? "Sửa khoản thủ công" : "Thêm khoản tiền"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Nguồn tiền *</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SOURCES).map(([k, v]) => (
                <Button key={k} type="button" variant={f.source === k ? "default" : "outline"} className="h-11" onClick={() => setF({ ...f, source: k })}>{v}</Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">“TK khác”: tiền vào tài khoản ngân hàng chưa cấu hình / không đồng bộ Casso.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Số tiền (VNĐ) *</Label><Input className="h-11 text-base md:text-sm" inputMode="numeric" value={f.amount} placeholder="5.000.000" onChange={(e) => setF({ ...f, amount: fmtNum(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Ngày nhận tiền *</Label><Input className="h-11 text-base md:text-sm" type="date" max={today()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Ghi chú *</Label><Textarea className="min-h-28 text-base md:text-sm" maxLength={2000} value={f.note} placeholder="VD: Khách Nguyễn Văn A đưa 5 triệu tiền mặt đặt cọc lô ly sứ." onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
          {edit?.reconciled && <div className="space-y-1.5"><Label>Lý do sửa *</Label><Input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></div>}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            {edit ? <Button disabled={busy} onClick={() => submit()}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Lưu thay đổi</Button>
              : <Button disabled={busy} onClick={() => submit()}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Lưu khoản tiền</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
