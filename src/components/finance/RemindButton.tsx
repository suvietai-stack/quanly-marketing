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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCurrentUser } from "@/lib/auth";
import { fmtTime } from "@/lib/finance/incoming";

export type ReminderRow = { tx_id: string; kind: string; seq: number | null; status: string; sent_by: string | null; created_at: string; error: string | null };
export const remindersQuery = (ids: string[]) => ({
  queryKey: ["fin_reminders", ids],
  enabled: ids.length > 0,
  queryFn: async () => {
    const { data, error } = await supabase.from("fin_reminders").select("tx_id, kind, seq, status, sent_by, created_at, error").in("tx_id", ids).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ReminderRow[];
  },
});
export const autoCount = (rows: ReminderRow[] | undefined, id: string) => (rows ?? []).filter((r) => r.tx_id === id && r.kind === "auto" && r.status !== "failed").length;

const ST: Record<string, string> = { sent: "Đã gửi", failed: "Lỗi", unknown: "Không rõ kết quả", sending: "Đang gửi" };

/** Lịch sử nhắc + nút nhắc thủ công trên trang chi tiết. */
export function ReminderPanel({ txId, pending, max = 5 }: { txId: string; pending: boolean; max?: number }) {
  const { can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const { data } = useQuery(remindersQuery([txId]));
  const n = autoCount(data, txId);
  if (!pending && !data?.length) return null;
  return (
    <div className="mt-4 rounded-lg border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium">Nhắc xác nhận <span className="text-sm font-normal text-muted-foreground">· tự động {n}/{max}</span></div>
        {pending && can("finance.incoming.remind") && <RemindButton txId={txId} className="h-11 md:h-9" />}
      </div>
      {data?.length ? (
        <ul className="text-sm space-y-1">
          {data.map((r, i) => (
            <li key={i} className="flex flex-wrap gap-x-2 text-muted-foreground">
              <span className="text-foreground">{r.kind === "auto" ? `Tự động lần ${r.seq}` : `Thủ công — ${users.find((u) => u.id === r.sent_by)?.fullName ?? "—"}`}</span>
              <span>{fmtTime(r.created_at)}</span>
              <span className={r.status === "failed" ? "text-destructive" : ""}>{ST[r.status] ?? r.status}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground">Chưa có lượt nhắc nào.</p>}
    </div>
  );
}
