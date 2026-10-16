import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { fmtTime } from "@/lib/finance/incoming";

export function OperationStart({ userId }: { userId: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ["fin_operation_status", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fin_operation_status");
      if (error) throw new Error(error.message);
      return data as { started_at: string | null; started_by: string | null; reset_at: string | null };
    },
  });
  const begin = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("fin_operation_begin", { _confirm: true });
      if (error) throw new Error(error.message);
      await qc.invalidateQueries({ queryKey: ["fin_operation_status"] });
      await qc.invalidateQueries({ queryKey: ["bank_transactions"] });
      qc.removeQueries({ queryKey: ["bank_tx"] });
      qc.removeQueries({ queryKey: ["bank_tx_events"] });
      await qc.invalidateQueries({ queryKey: ["notifications"] });
      setOpen(false);
      toast.success("Đã bắt đầu vận hành Tiền Về; giao dịch cũ được giữ trong lịch sử kiểm thử.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể bắt đầu vận hành");
    } finally { setBusy(false); }
  };
  return <>
    {status.error ? <span className="text-sm text-destructive">{status.error.message}<Button variant="ghost" size="sm" onClick={() => status.refetch()}>Thử lại</Button></span>
      : status.data?.started_at ? <span className="text-sm text-muted-foreground">Vận hành từ {fmtTime(status.data.started_at)}</span>
       : null}
    <AlertDialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value); }}>
      <AlertDialogContent className="max-w-lg w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Bắt đầu vận hành Tiền Về?</AlertDialogTitle>
          <AlertDialogDescription>
            Mốc bắt đầu là thời gian máy chủ ngay khi bạn xác nhận. Giao dịch phát sinh trước mốc được giữ trong “Lịch sử kiểm thử”, chỉ Super Admin xem được; không còn tính vào danh sách, số lượng và tổng tiền vận hành.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm">Không xóa giao dịch hay mã chống trùng, không gửi lại tin Zalo. Cài đặt ngân hàng, Zalo và quyền giữ nguyên. Chỉ thực hiện một lần, không thể đặt lại mốc.</p>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel>
          <Button disabled={busy} onClick={begin}>{busy ? "Đang thực hiện…" : "Xác nhận bắt đầu vận hành"}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}