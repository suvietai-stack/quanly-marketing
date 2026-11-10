import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  CLEANUP_GROUP_LABELS, CLEANUP_STATUS_LABELS, cleanupStatusTone, selectableAccounts,
  type CleanupAccount, type CleanupPreview, type CleanupRun,
} from '@/lib/permissionCleanup';

const CONFIRM_TEXT = 'CHUYỂN ĐỔI QUYỀN';
type Filter = 'all' | CleanupAccount['status'];

export function PermissionCleanup() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<CleanupAccount | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);

  const preview = useQuery({
    queryKey: ['perm-cleanup-preview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('base_perm_cleanup_preview');
      if (error) throw error;
      return data as unknown as CleanupPreview;
    },
  });
  const runs = useQuery({
    queryKey: ['perm-cleanup-runs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('base_perm_cleanup_runs').select('*').order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      return (data ?? []) as unknown as CleanupRun[];
    },
  });

  const accounts = useMemo(() => preview.data?.accounts ?? [], [preview.data]);
  const shown = useMemo(() => (filter === 'all' ? accounts : accounts.filter(a => a.status === filter)), [accounts, filter]);
  const selectable = useMemo(() => selectableAccounts(accounts), [accounts]);
  const refresh = () => { setPicked(new Set()); qc.invalidateQueries({ queryKey: ['perm-cleanup-preview'] }); qc.invalidateQueries({ queryKey: ['perm-cleanup-runs'] }); };

  const execute = async () => {
    if (!preview.data || confirmText !== CONFIRM_TEXT) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('base_perm_cleanup_execute', {
        _users: [...picked], _fingerprint: preview.data.fingerprint,
      });
      if (error) throw error;
      const r = data as { removed: unknown[]; skipped: { reason: string }[] };
      toast.success(`Đã gỡ ${r.removed.length} Role trực tiếp${r.skipped.length ? `, bỏ qua ${r.skipped.length} tài khoản` : ''}.`);
      setConfirming(false); setConfirmText(''); refresh();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const restore = async (runId: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc('base_perm_cleanup_restore', { _run: runId });
      if (error) throw error;
      toast.success('Đã khôi phục các Role đã gỡ.'); refresh();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  if (preview.isPending) return <p className="py-4 text-sm text-muted-foreground">Đang kiểm kê quyền…</p>;
  if (preview.error) return <p className="py-4 text-sm text-destructive">{(preview.error as Error).message}</p>;
  const t = preview.data!.totals;

  return (
    <div className="space-y-4 py-3">
      <p className="text-sm text-muted-foreground">
        Kiểm kê Role trực tiếp cũ ngoài Kinh doanh và chuyển sang quyền tự động theo chức vụ/nhiệm vụ.
        Kinh doanh, Super Admin và tài khoản có quyền tùy chỉnh luôn được bảo vệ. Không gì thay đổi cho tới khi bạn xác nhận.
      </p>
      <div className="flex flex-wrap gap-2">
        {([['all', `Tất cả · ${t.accounts}`], ['ready', `Sẵn sàng · ${t.ready}`], ['review', `Cần xem lại · ${t.review}`], ['needs_confirm', `Cần xác nhận · ${t.needs_confirm}`], ['protected', `Được bảo vệ · ${t.protected}`]] as [Filter, string][]).map(([f, label]) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>{label}</Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/40">
            <th className="w-8" /><th className="px-2 py-2 text-left font-medium">Nhân sự</th><th className="px-2 py-2 text-left font-medium">Đơn vị / Chức vụ</th>
            <th className="px-2 py-2 text-left font-medium">Nhóm</th><th className="px-2 py-2 text-left font-medium">Role trực tiếp</th>
            <th className="px-2 py-2 text-left font-medium">Sẽ gỡ</th><th className="px-2 py-2 text-left font-medium">Mất quyền</th><th className="px-2 py-2 text-left font-medium">Trạng thái</th>
          </tr></thead>
          <tbody>
            {shown.map(a => {
              const canPick = a.status === 'ready' || a.status === 'review';
              return (
                <tr key={a.user_id} className="border-b align-top">
                  <td className="px-2 py-2">{canPick && <Checkbox aria-label={`Chọn ${a.name}`} checked={picked.has(a.user_id)} onCheckedChange={v => { const n = new Set(picked); if (v) n.add(a.user_id); else n.delete(a.user_id); setPicked(n); }} />}</td>
                  <td className="px-2 py-2"><button className="text-left font-medium hover:underline" onClick={() => setDetail(a)}>{a.name}</button></td>
                  <td className="px-2 py-2 text-muted-foreground">{[a.unit, a.title].filter(Boolean).join(' · ') || 'Chưa phân công vị trí'}</td>
                  <td className="px-2 py-2"><Badge variant="outline">{CLEANUP_GROUP_LABELS[a.group]}</Badge></td>
                  <td className="px-2 py-2">{a.roles.map(r => <div key={r.role_id} className={r.protected ? 'text-muted-foreground' : ''}>{r.name}{r.protected ? ' (giữ)' : ''}</div>)}</td>
                  <td className="px-2 py-2">{a.removable.length}</td>
                  <td className="px-2 py-2">{a.lost.length > 0 ? <span className="text-destructive">{a.lost.length}</span> : 0}</td>
                  <td className="px-2 py-2"><Badge variant={cleanupStatusTone(a.status)}>{CLEANUP_STATUS_LABELS[a.status]}</Badge></td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">Không có tài khoản nào trong nhóm này.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={!picked.size} onClick={() => setConfirming(true)}>Chuyển đổi {picked.size} tài khoản đã chọn</Button>
        <Button variant="outline" onClick={refresh}>Xem trước lại</Button>
        {selectable.length > 0 && <Button variant="ghost" size="sm" onClick={() => setPicked(new Set(selectable.map(a => a.user_id)))}>Chọn tất cả ({selectable.length})</Button>}
      </div>

      {runs.data && runs.data.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Lịch sử chuyển đổi</p>
          {runs.data.map(run => (
            <div key={run.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
              <span className="text-muted-foreground">{new Date(run.created_at).toLocaleString('vi-VN')}</span>
              <span>Đã gỡ {run.removed.length} Role</span>
              {run.restored ? <Badge variant="secondary">Đã khôi phục</Badge> : <Button size="sm" variant="outline" disabled={busy} onClick={() => restore(run.id)}>Khôi phục</Button>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">{[detail.unit, detail.title].filter(Boolean).join(' · ') || 'Chưa phân công vị trí'} · Nhóm {CLEANUP_GROUP_LABELS[detail.group]}</p>
              <div><p className="font-medium">Role trực tiếp</p>{detail.roles.map(r => <p key={r.role_id}>{r.name} — {r.protected ? 'giữ nguyên (được bảo vệ)' : 'sẽ gỡ'}</p>)}</div>
              <div><p className="font-medium">Nguồn quyền tự động sau chuyển đổi</p><p className="text-muted-foreground">{detail.appointment_sources} quyền từ chức vụ · {detail.specialty_sources} quyền từ nhiệm vụ Marketing</p></div>
              {detail.lost.length > 0 && <div><p className="font-medium text-destructive">Quyền sẽ mất ({detail.lost.length})</p><p className="text-xs text-muted-foreground break-words">{detail.lost.join(', ')}</p></div>}
              {detail.has_custom_override && <p className="text-destructive">Tài khoản có quyền tùy chỉnh riêng — cần Admin xử lý thủ công, hệ thống không tự gỡ.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirming} onOpenChange={() => setConfirming(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Xác nhận chuyển đổi quyền</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Bạn sắp gỡ Role trực tiếp cũ của <strong>{picked.size} tài khoản</strong>. Quyền Kinh doanh, Super Admin và quyền tùy chỉnh được giữ nguyên. Thao tác có nhật ký và có thể khôi phục.</p>
            {[...picked].map(id => accounts.find(a => a.user_id === id)).filter((a): a is CleanupAccount => !!a && a.lost.length > 0).length > 0 && (
              <p className="text-destructive">Cảnh báo: có tài khoản sẽ mất một số quyền chưa được nguồn mới thay thế — hãy kiểm tra chi tiết trước khi xác nhận.</p>
            )}
            <p>Nhập <strong>{CONFIRM_TEXT}</strong> để xác nhận:</p>
            <Input aria-label="Xác nhận chuyển đổi" value={confirmText} onChange={e => setConfirmText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(false)}>Hủy</Button>
            <Button disabled={busy || confirmText !== CONFIRM_TEXT} onClick={execute}>{busy ? 'Đang thực hiện…' : 'Thực hiện chuyển đổi'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
