import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth, useCurrentUser } from '@/lib/auth';
import { titleRolesApi, auditReasonLabel } from '@/lib/basePermissions/titleRoles';
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
  const { user } = useCurrentUser();
  const audits = useQuery({ queryKey: ['title-role-links', user?.id], queryFn: titleRolesApi.read, retry: false });
  const [filter, setFilter] = useState<Filter>('all');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<CleanupAccount | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);

  const preview = useQuery({
    queryKey: ['perm-cleanup-preview', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('base_perm_final_preview');
      if (error) throw error;
      return data as unknown as CleanupPreview;
    },
  });
  const runs = useQuery({
    queryKey: ['perm-cleanup-runs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('base_perm_cleanup_runs').select('id,actor,fingerprint,removed,restored,created_at,restored_at,final_transition').order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      return (data ?? []) as unknown as CleanupRun[];
    },
  });

  const accounts = useMemo(() => preview.data?.accounts ?? [], [preview.data]);
  const shown = useMemo(() => (filter === 'all' ? accounts : accounts.filter(a => a.status === filter)), [accounts, filter]);
  const selectable = useMemo(() => selectableAccounts(accounts), [accounts]);
  const refresh = () => { setPicked(new Set()); qc.invalidateQueries({ queryKey: ['perm-cleanup-preview', user?.id] }); qc.invalidateQueries({ queryKey: ['perm-cleanup-runs', user?.id] }); };

  const execute = async () => {
    if (!preview.data || confirmText !== CONFIRM_TEXT) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('base_perm_final_execute', {
        _users: [...picked], _fingerprint: preview.data.fingerprint, _confirmation: confirmText,
      });
      if (error) throw error;
      const r = data as { removed: unknown[]; skipped: { reason: string }[] };
      toast.success(`Đã gỡ ${r.removed.length} Role trực tiếp${r.skipped.length ? `, bỏ qua ${r.skipped.length} tài khoản` : ''}.`);
      setConfirming(false); setConfirmText(''); refresh(); await qc.invalidateQueries(); await useAuth.getState().reload();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const restore = async (runId: string, finalTransition?: boolean) => {
    if (!window.confirm('Khôi phục nguồn Role cũ đã ngừng hiệu lực? Quyền bổ sung mới sẽ được giữ nguyên.')) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc(finalTransition ? 'base_perm_final_restore' : 'base_perm_cleanup_restore', { _run: runId });
      if (error) throw error;
      const r = data as { restored_rows: number; conflicts: unknown[] };
      toast.success(`Đã khôi phục ${r.restored_rows} Role đã gỡ.${r.conflicts.length ? ` Lưu ý: ${r.conflicts.length} quyền mới phát sinh sau chuyển đổi được giữ nguyên, cần đối chiếu thủ công.` : ''}`); refresh(); await qc.invalidateQueries(); await useAuth.getState().reload();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  if (preview.isPending) return <p className="py-4 text-sm text-muted-foreground">Đang kiểm kê quyền…</p>;
  if (preview.error) return <p className="py-4 text-sm text-destructive">{(preview.error as Error).message}</p>;
  if (!preview.data) return null;
  const t = preview.data.totals;

  return (
    <div className="space-y-4 py-3">
      <p className="text-sm text-muted-foreground">
        Kiểm kê Role trực tiếp cũ ngoài Kinh doanh và chuyển sang quyền tự động theo chức vụ/nhiệm vụ.
        Nguồn cũ ngoài Kinh doanh đã phân loại được có thể chuyển đổi, kể cả chưa có chức vụ thay thế.
        Kinh doanh, quản trị và nguồn chưa rõ được giữ nguyên. Nhân sự chưa bổ nhiệm sẽ mất quyền nghiệp vụ cũ; công việc và người duyệt không đổi. Mỗi lần chuyển đổi có bản sao phục hồi.
      </p>
      <details className="border-b pb-3"><summary className="cursor-pointer font-medium text-sm">Role theo chức vụ — kiểm chứng Giai đoạn 3A</summary>{audits.error && <p role="alert" className="text-destructive text-sm">{audits.error.message}</p>}{audits.data?.link_audits?.map(a => <div key={`${a.title_id}-${a.role_id}`} className="border-t py-3 text-sm"><p className="font-medium">{a.title_name} · {a.role_name}</p><p className="text-muted-foreground">{a.enabled.length} quyền đã bật · {a.eligible.length - a.enabled.length} quyền an toàn chưa bật · {a.blocked.length} quyền còn chờ</p>{!a.signature_valid && <p className="text-destructive">Role đã thay đổi; quyền theo liên kết tạm ngừng.</p>}<details><summary className="cursor-pointer">Quyền còn chờ</summary>{a.blocked.map(p => <p key={p.key} className="py-1 text-xs">{p.key} — {auditReasonLabel(p.reason)}</p>)}</details></div>)}</details>
      <div className="flex flex-wrap gap-2">
        {([['all', `Tất cả · ${t.accounts}`], ['ready', `Sẵn sàng · ${t.ready}`], ['review', `Cần xử lý · ${t.review}`], ['protected', `Được bảo vệ · ${t.protected}`]] as [Filter, string][]).map(([f, label]) => (
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
              const canPick = a.status === 'ready';
              return (
                <tr key={a.user_id} className="border-b align-top">
                  <td className="px-2 py-2">{canPick && <Checkbox aria-label={`Chọn ${a.name}`} checked={picked.has(a.user_id)} onCheckedChange={v => { const n = new Set(picked); if (v) n.add(a.user_id); else n.delete(a.user_id); setPicked(n); }} />}</td>
                  <td className="px-2 py-2"><button className="text-left font-medium hover:underline" onClick={() => setDetail(a)}>{a.name}</button></td>
                  <td className="px-2 py-2 text-muted-foreground">{[a.unit, a.title].filter(Boolean).join(' · ') || 'Chưa phân công vị trí'}</td>
                  <td className="px-2 py-2"><Badge variant="outline">{CLEANUP_GROUP_LABELS[a.group]}</Badge></td>
                  <td className="px-2 py-2">{a.roles.map(r => <div key={r.role_id} className={r.protected ? 'text-muted-foreground' : ''}>{r.name}{r.protected ? ' (giữ)' : ''}</div>)}</td>
                  <td className="px-2 py-2">{a.removable.length}</td>
                  <td className="px-2 py-2">{a.lost.length > 0 ? <span className="text-destructive">{a.lost.length}</span> : 0}</td>
                  <td className="px-2 py-2">
                    <Badge variant={cleanupStatusTone(a.status)}>{CLEANUP_STATUS_LABELS[a.status]}</Badge>
                    {a.status !== 'ready' && a.reasons.length > 0 && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{a.reasons[0]}</p>}
                  </td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={8} className="px-2 py-6 text-center text-muted-foreground">Không có tài khoản nào trong nhóm này.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy || picked.size === 0} onClick={() => setConfirming(true)}>Chuyển đổi {picked.size} tài khoản đã chọn</Button>
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
              <span className="text-xs break-all">Mã phục hồi: {run.id}</span>
              {run.restored ? <Badge variant="secondary">Đã khôi phục</Badge> : <Button size="sm" variant="outline" disabled={busy} onClick={() => restore(run.id, run.final_transition)}>Khôi phục</Button>}
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
              <div><p className="font-medium">Trạng thái: <Badge variant={cleanupStatusTone(detail.status)}>{CLEANUP_STATUS_LABELS[detail.status]}</Badge></p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">{detail.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
              <div><p className="font-medium">Role trực tiếp</p>{detail.roles.map(r => <p key={r.role_id}>{r.name} — {r.protected ? 'giữ nguyên (được bảo vệ)' : 'sẽ gỡ'}</p>)}</div>
              <div><p className="font-medium">Nguồn quyền tự động sau chuyển đổi</p><p className="text-muted-foreground">{detail.appointment_sources} quyền từ chức vụ · {detail.specialty_sources} quyền từ nhiệm vụ Marketing</p></div>
              {detail.lost.length > 0 && <div><p className="font-medium text-destructive">Quyền sẽ mất ({detail.lost.length})</p><p className="text-xs text-muted-foreground break-words">{detail.lost.join(', ')}</p></div>}
              {detail.pending_work > 0 && <p className="text-destructive">Có {detail.pending_work} hồ sơ đang chờ trong kiểm kê Nghỉ phép/3K/Tài chính. Admin cần cấp bổ sung quyền xử lý; không tự thay người nhận hay người duyệt.</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirming} onOpenChange={() => setConfirming(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Xác nhận chuyển đổi quyền</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Bạn sắp ngừng nguồn Role cũ của <strong>{picked.size} tài khoản</strong>. Nhân sự chưa bổ nhiệm có thể mất quyền xử lý công việc; không tự bổ nhiệm hay thay người duyệt. Kinh doanh, quản trị và nguồn không rõ được giữ nguyên. Hệ thống lưu bản sao đầy đủ, kiểm tra lại dữ liệu trước khi chuyển đổi và hỗ trợ khôi phục.</p>
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
