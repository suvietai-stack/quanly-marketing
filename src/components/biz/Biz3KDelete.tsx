import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { k3Error } from '@/lib/biz/k3';
import { useAuth } from '@/lib/auth';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export type K3DeleteKind = 'goal' | 'action' | 'task';

interface DeleteTarget { kind: K3DeleteKind; id: string; name: string; onDeleted?: () => void }
const DeleteContext = createContext<((target: DeleteTarget) => void) | null>(null);

/** Mounted outside all menus, cards and detail sheets for the whole 3K screen. */
export function K3DeleteProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const close = () => { if (!inFlight.current) { setTarget(null); setError(null); } };
  const remove = async () => {
    if (!target || inFlight.current) return;
    const selected = target;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('k3_soft_delete', { _kind: selected.kind, _id: selected.id });
      if (rpcError) throw rpcError;
    } catch (err) {
      setError(k3Error(err));
      inFlight.current = false;
      setBusy(false);
      return;
    }
    // Delete already committed: cache refresh failure must not invite a second write.
    setTarget(null);
    inFlight.current = false;
    setBusy(false);
    selected.onDeleted?.();
    toast.success('Đã chuyển vào Thùng rác. Có thể khôi phục trong 15 ngày.');
    await qc.invalidateQueries({ predicate: q => String(q.queryKey[0]).startsWith('k3_') });
  };
  return <DeleteContext.Provider value={selected => {
    if (inFlight.current) return;
    setError(null);
    setTarget({ ...selected });
  }}>
    {children}
    <AlertDialog open={target !== null} onOpenChange={open => { if (!open) close(); }}>
      <AlertDialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto" onEscapeKeyDown={e => { if (inFlight.current) e.preventDefault(); }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa công việc này?</AlertDialogTitle>
          <AlertDialogDescription className="break-words">Công việc “{target?.name}” sẽ không còn trong danh sách của bạn. Có thể khôi phục trong 15 ngày.</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy} onClick={close}>Quay lại</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground" disabled={busy} onClick={e => { e.preventDefault(); void remove(); }}>{busy ? 'Đang xóa…' : 'Xóa'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </DeleteContext.Provider>;
}

/**
 * Mục "Xóa" thống nhất trong menu ba chấm. Điều kiện xóa do backend quyết định
 * (k3_deletable): quyền xóa lịch cá nhân độc lập bảo vệ lịch sử phía sau;
 * k3_soft_delete vẫn kiểm tra lại khi thực hiện.
 */
export function K3DeleteMenuItem({ kind, id, name, onDeleted }: { kind: K3DeleteKind; id: string; name: string; onDeleted?: () => void }) {
  const requestDelete = useContext(DeleteContext);
  const uid = useAuth(s => s.currentUserId) ?? '';
  const check = useQuery({
    queryKey: ['k3_deletable', uid, kind, id],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('k3_deletable', { _kind: kind, _id: id } as never);
      if (error) { k3Error(error); throw error; }
      return data as unknown as { ok: boolean; reason?: string };
    },
  });
  if (!check.data?.ok || !requestDelete) return null;
  return <DropdownMenuItem className="text-destructive" onSelect={() => requestDelete({ kind, id, name, onDeleted })}><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>;
}
