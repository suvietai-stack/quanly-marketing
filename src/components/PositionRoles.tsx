import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { baseOrgApi } from '@/lib/basePermissions/api';
import { useAuth, useCurrentUser } from '@/lib/auth';
import type { RoleCatalog } from '@/lib/basePermissions/roleCatalog';
import { isCanonicalRole } from '@/lib/basePermissions/defaultRolePresets';
import { effectivePositionHolders, positionPairs } from '@/lib/basePermissions/positionHolders';

// One Role per (unit, position); any number of staff hold it. Writes go through audited org_change.
export function PositionRoles({ catalog, onEditRole }: { catalog: RoleCatalog; onEditRole?: (id: string) => void }) {
  const { user } = useCurrentUser(); const qc = useQueryClient();
  const org = useQuery({ queryKey: ['org-read-positions', user?.id], queryFn: baseOrgApi.read, retry: false });
  const bindings = useQuery({ queryKey: ['position-roles', user?.id], queryFn: async () => { const { data, error } = await supabase.from('org_position_roles').select('unit_id,title_id,role_id'); if (error) throw error; return data; }, retry: false });
  const [draft, setDraft] = useState<Record<string, string>>({}); const [reason, setReason] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  if (org.isPending || bindings.isPending) return <p className="text-sm text-muted-foreground">Đang tải vị trí…</p>;
  if (org.error || bindings.error) return <p role="alert" className="text-sm text-destructive">Không tải được vị trí.</p>;
  const cfg = org.data.config; const roles = catalog.roles.filter(r => r.role_kind === 'position' && isCanonicalRole(r));
  const now = org.data.server_now ? Date.parse(org.data.server_now) : Date.now();
  const holders = (u: string, t: string) => effectivePositionHolders(cfg.memberships, u, t, now).length;
  const pairs = positionPairs(cfg);
  const key = (u: string, t: string) => `${u}|${t}`; const current = (u: string, t: string) => bindings.data.find(b => b.unit_id === u && b.title_id === t)?.role_id ?? '';
  const changes = Object.entries(draft).filter(([k, v]) => { const [u, t] = k.split('|'); return v !== current(u, t); });
  const save = async () => { setBusy(true); setMsg(''); try {
    const cmds = changes.map(([k, v]) => { const [unit_id, title_id] = k.split('|'); return { action: 'position_role' as const, data: { unit_id, title_id, role_id: v === 'none' ? '' : v, reason } }; });
    const p = await baseOrgApi.preview(org.data.revision, cfg, cfg, cmds);
    const people = new Set(changes.flatMap(([k]) => { const [u, t] = k.split('|'); return effectivePositionHolders(cfg.memberships, u, t, now); })).size;
    if (!window.confirm(`Đổi Role cho ${changes.length} vị trí, ảnh hưởng ${people} nhân sự đang giữ. Áp dụng?`)) return;
    await baseOrgApi.apply(p.id, 'ÁP DỤNG CƠ CẤU', reason); setDraft({}); await qc.invalidateQueries(); await useAuth.getState().reload(); setMsg('Đã áp dụng.');
  } catch (e) { setMsg(e instanceof Error ? e.message : 'Không áp dụng được.'); } finally { setBusy(false); } };
  return <div className="space-y-2">
    <p className="text-sm text-muted-foreground">Mỗi vị trí trong đơn vị có một Role; mọi nhân sự giữ vị trí đó nhận Role, phạm vi theo đơn vị của họ. Không giới hạn số người cho vị trí công việc.</p>
    <div className="divide-y border-y">{pairs.map(({ unit, title }) => { const k = key(unit.id, title.id); return <div key={k} className="flex flex-wrap items-center gap-2 py-2 text-sm">
      <span className="min-w-0 flex-1 break-words"><span className="font-medium">{title.name}</span><span className="block text-xs text-muted-foreground">{unit.name} · {holders(unit.id, title.id)} người{title.kind === 'manager' && title.capacity ? ` · chức vụ quản lý, tối đa ${title.capacity}` : ''}</span></span>
      <Select value={draft[k] ?? (current(unit.id, title.id) || 'none')} onValueChange={v => setDraft(d => ({ ...d, [k]: v }))}><SelectTrigger className="sm:w-64" aria-label={`Role cho ${title.name} ${unit.name}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Chưa gắn Role</SelectItem>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
      {onEditRole&&current(unit.id,title.id)&&<Button size="sm" variant="outline" disabled={busy||changes.length>0} onClick={()=>onEditRole(current(unit.id,title.id))}>Chỉnh quyền Role</Button>}
    </div>; })}</div>
    {changes.length > 0 && <div className="flex flex-wrap gap-2"><Input className="sm:max-w-sm" aria-label="Lý do gắn Role" placeholder="Lý do" value={reason} onChange={e => setReason(e.target.value)} /><Button disabled={busy || !reason.trim()} onClick={save}>Xem trước và áp dụng ({changes.length})</Button></div>}
    {msg && <p role="status" className="text-sm">{msg}</p>}
  </div>;
}
