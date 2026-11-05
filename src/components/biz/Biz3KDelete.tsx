import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { k3Error } from '@/lib/biz/k3';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export type K3DeleteKind = 'goal' | 'action' | 'task';

const LABEL: Record<K3DeleteKind, string> = { goal: 'Xóa công việc', action: 'Xóa KF', task: 'Xóa công việc' };

/**
 * Mục "Xóa" thống nhất trong menu ba chấm. Điều kiện xóa do backend quyết định
 * (k3_deletable): chưa có kết quả KPI/chốt sổ/lịch sử bảo vệ mới hiện thao tác;
 * k3_soft_delete vẫn kiểm tra lại khi thực hiện.
 */
export function K3DeleteMenuItem({ kind, id, name, onDeleted }: { kind: K3DeleteKind; id: string; name: string; onDeleted?: () => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const check = useQuery({
    queryKey: ['k3_deletable', kind, id],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('k3_deletable', { _kind: kind, _id: id } as never);
      if (error) throw error;
      return data as unknown as { ok: boolean; reason?: string };
    },
  });
  if (!check.data?.ok) return null;
  return (
    <>
      <DropdownMenuItem className="text-destructive" onSelect={() => setOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" />{LABEL[kind]}
      </DropdownMenuItem>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa công việc này?</AlertDialogTitle>
            <AlertDialogDescription>
              "{name}" sẽ được chuyển vào Thùng rác và có thể khôi phục trong 15 ngày.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              disabled={busy}
              onClick={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const { error } = await supabase.rpc('k3_soft_delete', { _kind: kind, _id: id } as never);
                  if (error) throw error;
                  await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') });
                  setOpen(false);
                  onDeleted?.();
                  toast.success('Đã chuyển vào Thùng rác. Có thể khôi phục trong 15 ngày.');
                } catch (err) {
                  toast.error(k3Error(err));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Đang xóa…' : 'Xóa công việc'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
