import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useCurrentUser, PERMISSIONS } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Supplement = { fingerprint: string; role_ids: string[]; permissions: string[] | null; legacy_override: boolean; roles: { id: string; name: string; permissions: string[]; catalog_state?: string }[] };

export function StaffPermissionEditor({ userId }: { userId: string }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<{ roles: string[]; permissions: string[] } | null>(null);
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ['staff-supplement', user?.id, userId], retry: false, queryFn: async () => {
    const { data, error } = await supabase.rpc('account_supplement_read', { _target: userId });
    if (error) throw error;
    return data as unknown as Supplement;
  } });
  if (q.isPending) return <p className="py-4 text-muted-foreground">Đang tải quyền bổ sung…</p>;
  if (q.error) return <p className="py-4 text-muted-foreground">{q.error.message}</p>;
  if (!q.data) return null;
  const current = draft ?? { roles: q.data.role_ids, permissions: q.data.permissions ?? [] };
  const toggle = (kind: 'roles' | 'permissions', key: string, checked: boolean) => setDraft({ ...current, [kind]: checked ? [...new Set([...current[kind], key])] : current[kind].filter(x => x !== key) });
  const save = async () => {
    if (!q.data || !draft) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc('account_supplement_save', { _target: userId, _roles: draft.roles, _permissions: draft.permissions, _fingerprint: q.data.fingerprint, _reason: reason });
      if (error) throw error;
      setDraft(null); setConfirming(false); setReason('');
      await qc.invalidateQueries(); await useAuth.getState().reload(); toast.success('Đã lưu quyền bổ sung.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Không lưu được quyền.'); } finally { setBusy(false); }
  };
  return <div className="space-y-4 py-4">
    <p className="text-sm text-muted-foreground">Phạm vi giữ điều kiện nghiệp vụ hiện tại. Quyền bổ sung không tạo phạm vi Phòng/Nhóm mới. Quyền rộng chỉ cấp khi quản trị viên chủ động xác nhận.</p>
    {q.data.legacy_override ? <p className="text-destructive">Quyền riêng cũ chưa rõ nguồn — giữ nguyên để đối chiếu, không ghi đè.</p> : <>
      <details><summary className="cursor-pointer font-medium">Role bổ sung ({current.roles.length})</summary><div className="grid gap-3 py-3 sm:grid-cols-2">{q.data.roles.filter(r=>r.catalog_state==='standard').map(r => <label key={r.id} className="flex gap-2 text-sm items-start"><Checkbox checked={current.roles.includes(r.id)} onCheckedChange={v => toggle('roles', r.id, v === true)} /><span>{r.name}<span className="block text-xs text-muted-foreground">{r.permissions.length} quyền · phạm vi nghiệp vụ hiện tại</span></span></label>)}</div></details>
      <Input aria-label="Tìm quyền bổ sung" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm quyền bổ sung" />
      <div className="max-h-80 overflow-y-auto space-y-2">{PERMISSIONS.filter(p => !/^(biz|k3|settings)\./.test(p.key) && `${p.key} ${p.label}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map(p => <label key={p.key} className="flex gap-2 text-sm"><Checkbox checked={current.permissions.includes(p.key)} onCheckedChange={v => toggle('permissions', p.key, v === true)} /><span>{p.label}<span className="block text-xs text-muted-foreground">{p.key}</span></span></label>)}</div>
      <Input aria-label="Lý do tùy chỉnh quyền" value={reason} onChange={e => setReason(e.target.value)} placeholder="Lý do tùy chỉnh quyền" />
      <Button disabled={!draft || !reason.trim() || busy} onClick={() => setConfirming(true)}>Xem trước và xác nhận</Button>
    </>}
    <Dialog open={confirming} onOpenChange={setConfirming}><DialogContent className="max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Xác nhận quyền bổ sung</DialogTitle></DialogHeader><p className="text-sm">{current.roles.length} Role và {current.permissions.length} quyền riêng được chọn. Quyền chức vụ, nhiệm vụ và nguồn hợp lệ khác được giữ nguyên.</p><p className="text-sm text-muted-foreground">Role có thể gồm quyền xem rộng; không giả lập giới hạn đơn vị. Quyền quản trị và Kinh doanh không được cấp tại đây.</p><p className="text-sm">Thêm: {[...current.roles.filter(x => !q.data?.role_ids.includes(x)), ...current.permissions.filter(x => !q.data?.permissions?.includes(x))].join(', ') || 'Không có'}</p><p className="text-sm">Thu hồi bổ sung: {[...(q.data.role_ids ?? []).filter(x => !current.roles.includes(x)), ...(q.data.permissions ?? []).filter(x => !current.permissions.includes(x))].join(', ') || 'Không có'}</p><Button disabled={busy} onClick={save}>{busy ? 'Đang lưu…' : 'Xác nhận lưu quyền'}</Button></DialogContent></Dialog>
  </div>;
}