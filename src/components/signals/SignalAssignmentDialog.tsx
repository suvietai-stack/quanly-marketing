import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { salesList } from '@/lib/signals/api';

/** Selection is a draft. Only explicit form submission may change an assignment. */
export function SignalAssignmentDialog({ actorId, currentId, currentName, customerName, onClose, onConfirm }: {
  actorId: string | null; currentId: string | null; currentName: string; customerName: string;
  onClose: () => void; onConfirm: (id: string) => Promise<boolean>;
}) {
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const sales = useQuery({ queryKey: ['sig:sales', actorId], queryFn: salesList, enabled: !!actorId, retry: 1, staleTime: 60_000 });
  const isRemoval = selected === '__unassign';
  const target = sales.data?.find(u => u.id === selected);
  const valid = !!selected && !sales.isFetching && !sales.isError && (isRemoval ? !!currentId : !!target && target.id !== currentId);
  return <Dialog open onOpenChange={open => { if (!open && !lock.current) onClose(); }}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl grid-cols-[minmax(0,1fr)] max-h-[85dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <DialogHeader className="text-left pr-6"><DialogTitle>{currentId ? 'Đổi Sale phụ trách' : 'Phân công Sale'}</DialogTitle><DialogDescription>Chọn người nhận rồi bấm xác nhận. Chọn trong danh sách chưa làm thay đổi tín hiệu.</DialogDescription></DialogHeader>
      <p className="text-sm font-medium break-words">{customerName}</p>
      {currentId && <p className="text-sm text-muted-foreground">Hiện tại: {currentName}</p>}
      <form className="min-w-0 space-y-4" onSubmit={async e => {
        e.preventDefault(); if (lock.current || !valid) return;
        lock.current = true; setBusy(true);
        try { if (await onConfirm(isRemoval ? '' : selected)) onClose(); }
        finally { lock.current = false; setBusy(false); }
      }}>
        <div className="space-y-2"><Label htmlFor="signal-assignment-sale">Sale nhận tín hiệu</Label>
          <select id="signal-assignment-sale" className="h-12 w-full min-w-0 rounded-xl border bg-background px-3 text-base" disabled={busy || sales.isFetching || sales.isError} value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">{sales.isFetching ? 'Đang tải danh sách Sale…' : '— Chọn Sale —'}</option>
            {(sales.data ?? []).map(u => <option key={u.id} value={u.id} disabled={u.id === currentId}>{u.full_name}{u.id === currentId ? ' (hiện tại)' : ''}</option>)}
            {currentId && <option value="__unassign">Bỏ phân công — để trống người phụ trách</option>}
          </select>
        </div>
        {sales.isError && <div role="alert" className="space-y-2 rounded-xl border border-destructive/30 p-3 text-sm text-destructive">
          <p>Không tải được danh sách Sale: {sales.error instanceof Error ? sales.error.message : 'Lỗi không xác định'}</p>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => void sales.refetch()}>Thử lại</Button>
        </div>}
        {sales.isSuccess && !sales.data.length && <p role="status" className="text-sm text-muted-foreground">Chưa có tài khoản đủ quyền nhận tín hiệu.</p>}
        {valid && <p className="rounded-xl bg-muted p-3 text-sm break-words">{isRemoval ? 'Tín hiệu sẽ trở về chưa phân công.' : <>Người nhận mới: <strong>{target?.full_name}</strong></>}</p>}
        <DialogFooter className="gap-2"><Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={onClose}>Hủy</Button><Button type="submit" className="min-h-11" disabled={!valid || busy}>{busy ? 'Đang lưu…' : isRemoval ? 'Xác nhận bỏ phân công' : 'Xác nhận phân công'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
