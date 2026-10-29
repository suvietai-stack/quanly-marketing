import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { finRemindManual } from "@/lib/finance/gmf.functions";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

/** Nút "Nhắc xác nhận" — chỉ gửi nhắc vào nhóm, không đổi trạng thái khoản tiền. Có data-signal-interactive để không mở dòng. */
export function RemindButton({ txId, size = "sm", className }: { txId: string; size?: "sm" | "default"; className?: string }) {
  const remind = useServerFn(finRemindManual);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await remind({ data: { id: txId } });
      (r.ok ? toast.success : toast.error)(r.message);
    } catch (e: any) { toast.error(e?.message || "Không gửi được nhắc"); }
    setBusy(false); setOpen(false);
    qc.invalidateQueries({ queryKey: ["fin_reminders"] });
  };
  return (
    <span onClick={(e) => e.stopPropagation()} data-signal-interactive>
      <Button size={size} variant="outline" className={className} disabled={busy} onClick={() => setOpen(true)}>
        {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <BellRing className="h-4 w-4 mr-1" />}Nhắc xác nhận
      </Button>
      <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nhắc xác nhận</AlertDialogTitle>
            <AlertDialogDescription>Gửi lại thông báo nhắc xác nhận khoản tiền này vào nhóm?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); send(); }}>{busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Gửi nhắc</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
}
