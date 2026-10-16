import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { fmtTime } from "@/lib/finance/incoming";

type Preview = { bank: number; manual: number; events: number; notifications: number; push: number; reset_at: string | null };
export function ResetData({ userId, onDone }: { userId: string | undefined; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState("");
  const qc = useQueryClient();
  const preview = useQuery({
    queryKey: ["fin_reset_preview", userId], enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fin_reset_preview");
      if (error) throw new Error(error.message);
      return data as unknown as Preview;
    },
  });
  const backups = useQuery({
    queryKey: ["fin_reset_backups", userId], enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fin_reset_backups");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const download = async (id: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("fin_reset_backup_get", { _id: id });
      if (error) throw new Error(error.message);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a"); a.href = url; a.download = `tien-ve-reset-${id}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Không tải được bản sao"); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("fin_reset_execute", { _confirm: confirm });
      if (error) throw new Error(error.message);
      qc.removeQueries({ queryKey: ["bank_tx"] });
      qc.removeQueries({ queryKey: ["bank_tx_events"] });
      await Promise.all(["bank_transactions", "notifications", "fin_operation_status", "fin_reset_preview", "fin_reset_backups"].map((key) => qc.invalidateQueries({ queryKey: [key] })));
      setOpen(false); setConfirm(""); onDone();
      toast.success("Đã reset Tiền Về; bản sao được lưu riêng cho Super Admin.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Không thể reset Tiền Về"); }
    finally { setBusy(false); }
  };
  const p = preview.data;
  return <>
    <Button variant="destructive" onClick={() => { setConfirm(""); setOpen(true); preview.refetch(); backups.refetch(); }}><Trash2 className="mr-2 h-4 w-4" />Reset dữ liệu Tiền Về</Button>
    <AlertDialog open={open} onOpenChange={(v) => { if (!busy) setOpen(v); }}>
      <AlertDialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Reset dữ liệu Tiền Về?</AlertDialogTitle>
          <AlertDialogDescription>Xóa toàn bộ giao dịch hiện có khỏi Base, kể cả lịch sử kiểm thử. Không xóa dữ liệu tại Casso hoặc ngân hàng. Không thể hoàn tác trực tiếp.</AlertDialogDescription>
        </AlertDialogHeader>
        {preview.isFetching ? <p>Đang xem trước…</p> : preview.error ? <p className="text-destructive">{preview.error.message}<Button variant="ghost" onClick={() => preview.refetch()}>Thử lại</Button></p> : p && <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt>Giao dịch ngân hàng</dt><dd className="text-right">{p.bank}</dd>
          <dt>Khoản nhập thủ công</dt><dd className="text-right">{p.manual}</dd>
          <dt>Nhật ký giao dịch</dt><dd className="text-right">{p.events}</dd>
          <dt>Thông báo nội bộ</dt><dd className="text-right">{p.notifications}</dd>
          <dt>Bản ghi gửi thông báo</dt><dd className="text-right">{p.push}</dd>
        </dl>}
        <p className="text-sm text-muted-foreground">Bản sao giao dịch và dữ liệu phụ thuộc được lưu riêng, chỉ Super Admin tải được. Khôi phục cần xử lý riêng, không tự gửi lại thông báo. Ngân hàng, Zalo, quyền và luồng xử lý giữ nguyên.</p>
        <p className="text-sm text-muted-foreground">Mốc reset lấy từ máy chủ khi xác nhận; giao dịch ngân hàng trước hoặc bằng mốc sẽ bị bỏ qua. Số lượng được tính lại khi thực hiện, có thể thay đổi nếu vừa có giao dịch mới.</p>
        {p?.reset_at && <p className="text-sm">Reset gần nhất: {fmtTime(p.reset_at)}</p>}
        <label className="space-y-2 text-sm"><span>Nhập <b>RESET TIEN VE</b> để xác nhận xóa</span><Input aria-label="Xác nhận reset" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={busy} autoComplete="off" /></label>
        {backups.error && <p className="text-sm text-destructive">Không tải được danh sách bản sao: {backups.error.message}</p>}
        {!!backups.data?.length && <div className="border-t pt-3 space-y-2"><h3 className="text-sm font-medium">Bản sao riêng Super Admin</h3>{backups.data.map((b) => <div key={b.id} className="flex items-center justify-between gap-2 text-sm"><span>{fmtTime(b.reset_at)}</span><Button variant="outline" size="sm" disabled={busy} onClick={() => download(b.id)}><Download className="mr-1 h-4 w-4" />Tải bản sao</Button></div>)}</div>}
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel><Button variant="destructive" disabled={busy || confirm !== "RESET TIEN VE" || !p || preview.isFetching || !!preview.error} onClick={reset}>{busy ? "Đang thực hiện…" : "Xóa dữ liệu & bắt đầu vận hành"}</Button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}