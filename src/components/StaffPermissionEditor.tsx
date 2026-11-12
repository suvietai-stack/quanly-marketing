import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useCurrentUser, PERMISSIONS } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PermissionChecklist } from '@/components/PermissionChecklist';
import { permissionEditorApi } from '@/lib/basePermissions/permissionEditor';
import { toast } from 'sonner';
import type { EffectivePermission } from '@/lib/basePermissions/types';

type Supplement = { fingerprint: string; role_ids: string[]; permissions: string[] | null; legacy_override: boolean; inactive_legacy: boolean };
type PersonalPreview = { id: string; fingerprint: string; added: string[]; removed: string[]; affected_users: string[]; inactive_legacy: boolean };

export function StaffPermissionEditor({ userId, effective, effectiveError }: { userId: string; effective?: EffectivePermission[]; effectiveError?: boolean }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<string[] | null>(null);
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState<PersonalPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const policy = useQuery({ queryKey: ['permission-editor-policy', user?.id], queryFn: permissionEditorApi.read, retry: false });
  const q = useQuery({ queryKey: ['staff-supplement', user?.id, userId], retry: false, queryFn: async () => {
    const { data, error } = await supabase.rpc('account_supplement_read', { _target: userId });
    if (error) throw error;
    return data as unknown as Supplement;
  } });
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được quyền.'); } finally { setBusy(false); }
  };
  if (q.isPending) return <p className="py-4 text-muted-foreground">Đang tải quyền bổ sung…</p>;
  if (q.error) return <p role="alert" className="py-4 text-muted-foreground">{q.error.message}</p>;
  if (!q.data) return null;
  const current = draft ?? q.data.permissions ?? [];
  const label = (key: string) => PERMISSIONS.find(p => p.key === key)?.label ?? key;
  const openPreview = () => run(async () => {
    const { data, error } = await supabase.rpc('account_supplement_preview', { _target: userId, _permissions: current });
    if (error) throw error;
    setPreview(data as unknown as PersonalPreview);
  });
  const save = () => run(async () => {
    if (!preview || !q.data || !draft) return;
    const { error } = await supabase.rpc('account_supplement_save', { _target: userId, _roles: q.data.role_ids, _permissions: draft, _fingerprint: preview.fingerprint, _reason: reason });
    if (error) throw error;
    setDraft(null); setPreview(null); setReason('');
    await qc.invalidateQueries(); await useAuth.getState().reload(); toast.success('Đã lưu quyền bổ sung cho nhân viên này.');
  });
  return <div className="space-y-4 py-4">
    <div className="border-l-2 border-primary pl-3"><h3 className="font-semibold">Quyền bổ sung cá nhân</h3><p className="mt-1 text-sm text-muted-foreground">Chỉ cộng thêm cho nhân viên này. Những người cùng Role không bị ảnh hưởng.</p></div>
    {q.data.legacy_override ? <p role="alert" className="text-destructive">Quyền riêng cũ đang bật. Cần đối chiếu và xác nhận chuyển đổi trước; cấu hình hiện tại được giữ nguyên.</p> : <>
      {q.data.inactive_legacy && <details className="text-sm text-muted-foreground"><summary className="cursor-pointer">Có cấu hình cũ đang tắt</summary><p className="pt-2">Chưa thay đổi. Nếu xác nhận lưu, chỉ quyền riêng của nhân viên này chuyển sang cộng thêm; bản trước được lưu trong nhật ký.</p></details>}
      {policy.error && <p role="alert" className="text-destructive">Chưa tải được các quyền có phạm vi an toàn. Danh mục chỉ xem, chưa thể thay đổi.</p>}
      {effectiveError && <p role="alert" className="text-muted-foreground text-sm">Chưa tải được quyền hiệu lực và nguồn Role; trạng thái quyền riêng vẫn giữ nguyên.</p>}
      <PermissionChecklist personal value={current} onChange={v => { setDraft(v); setPreview(null); }} policy={policy.data ?? []} baseline={q.data.permissions ?? []} effective={effective} disabled={!policy.data || !!policy.error || busy}/>
      <div className="flex flex-wrap gap-2"><Button disabled={!draft || busy || !policy.data || !!policy.error} onClick={openPreview}>Xem trước quyền riêng</Button><Button variant="ghost" disabled={!draft || busy} onClick={() => { setDraft(null); setPreview(null); setError(''); }}>Hủy thay đổi</Button></div>
    </>}
    {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
    <Dialog open={!!preview} onOpenChange={v => !busy && !v && setPreview(null)}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Xác nhận quyền riêng</DialogTitle></DialogHeader>
      <p className="font-medium">Thêm {preview?.added.length ?? 0} / bỏ {preview?.removed.length ?? 0} quyền · chỉ 1 nhân viên</p>
      <p className="text-sm text-muted-foreground">Bỏ quyền bổ sung không trừ quyền đang nhận từ Role, vị trí hoặc nhiệm vụ.</p>
      {preview?.added.map(k => <p key={k} className="text-sm">Thêm: {label(k)}</p>)}{preview?.removed.map(k => <p key={k} className="text-sm">Bỏ bổ sung: {label(k)}</p>)}
      {preview?.inactive_legacy && <p className="text-sm text-muted-foreground">Cấu hình riêng cũ đang tắt được thay bằng quyền cộng thêm đã chọn. Nhật ký giữ bản trước.</p>}
      <Label htmlFor={`personal-reason-${userId}`}>Lý do thay đổi</Label><Input id={`personal-reason-${userId}`} value={reason} onChange={e => setReason(e.target.value)}/>
      {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
      <Button disabled={busy || !reason.trim()} onClick={save}>{busy ? 'Đang lưu…' : 'Xác nhận lưu quyền riêng'}</Button>
    </DialogContent></Dialog>
  </div>;
}