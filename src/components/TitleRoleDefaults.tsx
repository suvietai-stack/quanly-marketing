import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PERMISSIONS, useCurrentUser } from '@/lib/auth';
import { suggestedRole, titleRolesApi, type OriginalRole, type TitleRoleLink } from '@/lib/basePermissions/titleRoles';

const checkLabel = (reason: string) => reason === 'appointment_only' ? 'Theo bổ nhiệm nghiệp vụ, không kế thừa từ Role tổng' : reason === 'global_configuration' ? 'Cấu hình toàn hệ thống — cần kiểm tra quyền nhạy cảm' : 'Chưa hoàn tất kiểm tra phạm vi';
export function TitleRoleDefaults({ source, titleId, titleName, disabled }: { source: 'base' | 'biz'; titleId: string; titleName: string; disabled?: boolean }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['title-role-links', user?.id], queryFn: titleRolesApi.read, retry: false });
  const [open, setOpen] = useState(false);
  const [primary, setPrimary] = useState('');
  const [extra, setExtra] = useState<string[]>([]);
  const [scope, setScope] = useState<'own' | 'unit'>('unit');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [inspected, setInspected] = useState<OriginalRole | null>(null);
  const links = query.data?.links.filter(l => l.title_source === source && l.title_id === titleId) ?? [];
  const roles = query.data?.roles.filter(r => !r.restricted) ?? [];
  const suggestion = suggestedRole(titleName, roles);
  const start = () => { setPrimary(links.find(l => l.is_primary)?.role_id ?? ''); setExtra(links.filter(l => !l.is_primary).map(l => l.role_id)); setScope(links[0]?.scope_kind ?? 'unit'); setReason(''); setError(''); setOpen(true); };
  const save = async () => {
    setBusy(true); setError('');
    try {
      const selected: Pick<TitleRoleLink, 'role_id' | 'is_primary' | 'scope_kind'>[] = primary ? [{ role_id: primary, is_primary: true, scope_kind: scope }, ...extra.filter(r => r !== primary).map(role_id => ({ role_id, is_primary: false, scope_kind: scope }))] : [];
      await titleRolesApi.save(source, titleId, selected, links, reason);
      await qc.invalidateQueries({ queryKey: ['title-role-links'] }); setOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được liên kết Role.'); }
    finally { setBusy(false); }
  };
  return <><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" disabled={disabled || query.isPending || !!query.error} onClick={start}>Thiết lập Role mặc định</Button><span className="text-xs text-muted-foreground">{links.length ? links.map(l => roles.find(r => r.id === l.role_id)?.name ?? l.role_id).join(' + ') : 'Chưa thiết lập Role'}</span>{links.length > 0 && <Badge variant="outline">Chưa kích hoạt</Badge>}{query.error && <span role="alert" className="text-xs text-destructive">{query.error.message}</span>}</div>
    <Dialog open={open} onOpenChange={v => !busy && setOpen(v)}><DialogContent className="max-w-xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Role mặc định — {titleName}</DialogTitle></DialogHeader><Badge variant="outline">Bản liên kết chưa cấp quyền</Badge>
      {suggestion && !primary && <div className="flex items-center justify-between gap-2 text-sm"><span>Role đề xuất: {suggestion.name}</span><Button size="sm" variant="outline" onClick={() => setPrimary(suggestion.id)}>Chọn đề xuất</Button></div>}
      <Label>Role chính</Label><Select value={primary || '_none'} onValueChange={v => { setPrimary(v === '_none' ? '' : v); setExtra(xs => xs.filter(x => x !== v)); }}><SelectTrigger aria-label="Role chính"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="_none">Chưa thiết lập Role</SelectItem>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
      <Label>Role bổ sung</Label><div className="max-h-52 overflow-y-auto border rounded-lg">{roles.filter(r => r.id !== primary).map(r => <div key={r.id} className="flex items-center gap-3 border-b p-2"><Checkbox aria-label={`Role bổ sung ${r.name}`} disabled={!primary} checked={extra.includes(r.id)} onCheckedChange={v => setExtra(xs => v === true ? [...xs, r.id] : xs.filter(x => x !== r.id))} /><span className="flex-1 text-sm">{r.name}</span><Button variant="ghost" size="sm" onClick={() => setInspected(r)}>Xem quyền</Button></div>)}</div>
      {primary && <Button variant="outline" onClick={() => setInspected(roles.find(r => r.id === primary) ?? null)}>Xem quyền của Role chính</Button>}
      <Label>Phạm vi đề xuất</Label><Select value={scope} onValueChange={v => setScope(v === 'own' ? 'own' : 'unit')}><SelectTrigger aria-label="Phạm vi Role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="own">Cá nhân</SelectItem><SelectItem value="unit">Đơn vị bổ nhiệm và đơn vị con</SelectItem></SelectContent></Select>
      <p className="text-sm text-muted-foreground">Chưa thể kích hoạt: các phân hệ chưa hoàn tất kiểm tra phạm vi. Role trực tiếp, quyền riêng và quyền Kinh doanh hiện tại được giữ nguyên.</p>
      <Label htmlFor={`role-reason-${titleId}`}>Lý do thay đổi</Label><Input id={`role-reason-${titleId}`} value={reason} onChange={e => setReason(e.target.value)} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={busy || !reason.trim()} onClick={save}>{busy ? 'Đang lưu…' : 'Xác nhận lưu liên kết chưa kích hoạt'}</Button>
    </DialogContent></Dialog>
    <Dialog open={!!inspected} onOpenChange={v => !v && setInspected(null)}><DialogContent className="max-w-xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Quyền Role — {inspected?.name}</DialogTitle></DialogHeader>{inspected?.checks.map(c => <div key={c.key} className="border-b py-2"><p className="text-sm font-medium">{PERMISSIONS.find(p => p.key === c.key)?.label ?? c.key}</p><p className="text-xs text-muted-foreground">{PERMISSIONS.find(p => p.key === c.key)?.group ?? c.key.split('.')[0]} · {checkLabel(c.reason)}</p></div>)}</DialogContent></Dialog>
  </>;
}

export function StaffRoleSources({ userId, memberships }: { userId: string; memberships: { title_source: 'base' | 'biz'; title_id: string; name: string }[] }) {
  const { user } = useCurrentUser();
  const q = useQuery({ queryKey: ['title-role-links', user?.id], queryFn: titleRolesApi.read, retry: false });
  if (q.isPending) return <p className="text-sm text-muted-foreground">Đang tải nguồn Role…</p>;
  if (q.error) return <p role="alert" className="text-sm text-destructive">{q.error.message}</p>;
  const roleName = (id: string) => q.data.roles.find(r => r.id === id)?.name ?? id;
  const direct = q.data.direct_roles.filter(r => r.user_id === userId);
  return <div className="space-y-3 border-b pb-4"><h3 className="font-semibold text-sm">Role được cấp trực tiếp</h3>{direct.length ? direct.map(r => <p key={r.role_id} className="text-sm">{roleName(r.role_id)} · Nguồn trực tiếp</p>) : <p className="text-sm text-muted-foreground">Chưa có Role trực tiếp.</p>}<h3 className="font-semibold text-sm">Role theo chức vụ — chờ đối chiếu</h3>{memberships.map((m, i) => { const links = q.data.links.filter(l => l.title_source === m.title_source && l.title_id === m.title_id); return <div key={`${m.title_id}-${i}`} className="text-sm"><p>{m.name}</p><p className="text-muted-foreground">{links.length ? links.map(l => roleName(l.role_id)).join(' + ') : 'Chưa thiết lập Role'} · Chưa cấp quyền từ chức vụ</p></div>; })}{!memberships.length && <p className="text-sm text-muted-foreground">Chưa có bổ nhiệm đang hiệu lực.</p>}</div>;
}