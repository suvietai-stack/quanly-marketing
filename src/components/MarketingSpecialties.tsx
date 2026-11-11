import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { applySpecialtyDiff, type StaffSpecialty, type SpecialtyPermissionPreview } from '@/lib/marketingSpecialties';

type Spec = { id: string; name: string; active: boolean; sort: number; role_id: string | null };
const taskRoles = new Set(['role-v2-task-content-web', 'role-v2-task-seo', 'role-v2-task-local-seo', 'role-v2-task-social', 'role-v2-task-video']);

function useSpecialties() {
  const { user } = useCurrentUser();
  return useQuery({ queryKey: ['mkt-specialties', user?.id], queryFn: async () => {
    const [s, a] = await Promise.all([
      supabase.from('mkt_specialties').select('id,name,active,sort,role_id').order('sort'),
      supabase.from('mkt_staff_specialties').select('user_id,specialty_id,state,origin,is_primary,source'),
    ]);
    if (s.error) throw s.error; if (a.error) throw a.error;
    return { specs: (s.data ?? []) as Spec[], rows: (a.data ?? []) as StaffSpecialty[] };
  } });
}

async function save(users: string[], add: string[], remove: string[], primary?: string | null) {
  const { error } = await supabase.rpc('mkt_specialty_save', { _users: users, _add: add, _remove: remove, _primary: primary ?? undefined });
  if (error) throw error;
}

function usePermissionPreview() {
  return useQuery({ queryKey: ['mkt-permission-preview'], queryFn: async () => {
    const { data, error } = await supabase.rpc('mkt_specialty_permission_preview');
    if (error) throw error;
    return (Array.isArray(data) ? data : []) as SpecialtyPermissionPreview[];
  }, staleTime: 60_000 });
}

/** Read-only: which permissions each specialty auto-grants (verified) and which stay inactive. */
function SpecialtyPermissionNotes({ selected }: { selected: Set<string> }) {
  const q = usePermissionPreview();
  if (q.isPending || q.error || !q.data) return null;
  const rows = q.data.filter(p => selected.has(p.id));
  if (!rows.length) return null;
  return <div className="space-y-1 rounded-lg border bg-muted/40 p-3 text-xs">
    <p className="font-medium">Quyền tự nhận theo nhiệm vụ</p>
    {rows.map(p => (
      <p key={p.id} className="text-muted-foreground">
        <span className="text-foreground font-medium">{p.name}</span>
        {p.role_name ? <> (Role {p.role_name})</> : <> (chưa liên kết Role)</>}: tự cấp {p.granted.length} chức năng đã kiểm chứng
        {p.blocked.length > 0 && <>; <span className="text-amber-600 dark:text-amber-400">{p.blocked.length} quyền chưa kích hoạt</span> (chưa kiểm chứng phạm vi)</>}
      </p>
    ))}
  </div>;
}

export function StaffSpecialties({ userId }: { userId: string }) {
  const { isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const q = useSpecialties();
  const eligible=useQuery({queryKey:['marketing-task-eligible',userId],queryFn:async()=>{const {data,error}=await supabase.rpc('marketing_task_eligibility',{_target:userId});if(error)throw error;return data===true;},retry:false});
  const current = useMemo(() => new Set((q.data?.rows ?? []).filter(r => r.user_id === userId && r.state === 'active').map(r => r.specialty_id)), [q.data, userId]);
  const curPrimary = q.data?.rows.find(r => r.user_id === userId && r.is_primary)?.specialty_id ?? '';
  const [draft, setDraft] = useState<Set<string> | null>(null);
  const [primary, setPrimary] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sel = draft ?? current;
  const prim = primary ?? curPrimary;
  if (q.isPending) return <p className="py-4 text-sm text-muted-foreground">Đang tải chuyên môn…</p>;
  if (q.error) return <p className="py-4 text-sm text-destructive">Không tải được chuyên môn.</p>;
  const origin = (id: string) => q.data?.rows.find(r => r.user_id === userId && r.specialty_id === id);
  const onSave = async () => {
    const { add, remove } = applySpecialtyDiff(current, sel);
    setBusy(true);
    try { await save([userId], add, remove, prim || null); toast.success('Đã lưu chuyên môn'); setDraft(null); setPrimary(null); await qc.invalidateQueries({ queryKey: ['mkt-specialties'] }); await qc.invalidateQueries({queryKey:['base-effective']}); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return <div className="space-y-2 py-4">
    {eligible.data===false&&<p className="text-sm text-muted-foreground">Không có bổ nhiệm Marketing hiệu lực; không thể cấp nhiệm vụ mới.</p>}
    {q.data?.specs.filter(s => s.active).map(s => { const o = origin(s.id); return (
      <div key={s.id} className="flex items-center gap-3 border-b py-2">
        <Checkbox id={`sp-${s.id}`} checked={sel.has(s.id)} disabled={!isSuperAdmin || (!sel.has(s.id) && taskRoles.has(s.role_id ?? '') && eligible.data!==true)} onCheckedChange={v => { const n = new Set(sel); if (v) n.add(s.id); else n.delete(s.id); setDraft(n); }} />
        <label htmlFor={`sp-${s.id}`} className="flex-1 text-sm">{s.name}</label>
        {o && <Badge variant="outline" className="text-[10px]">{o.state === 'removed' ? 'Đã bỏ' : o.origin === 'auto' ? 'Tự nhận diện từ Role' : 'Admin chỉnh'}</Badge>}
        {sel.has(s.id) && isSuperAdmin && <Button size="sm" variant={prim === s.id ? 'secondary' : 'ghost'} onClick={() => setPrimary(prim === s.id ? '' : s.id)}>{prim === s.id ? 'Chuyên môn chính' : 'Đặt chính'}</Button>}
      </div>); })}
    <SpecialtyPermissionNotes selected={sel} />
    {isSuperAdmin ? <Button disabled={busy || (!draft && primary === null)} onClick={onSave}>Lưu chuyên môn</Button> : <p className="text-xs text-muted-foreground">Chỉ Super Admin được sửa chuyên môn.</p>}
  </div>;
}

export function SpecialtyBoard({ staff }: { staff: { id: string; name: string }[] }) {
  const { isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const q = useSpecialties();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [spec, setSpec] = useState('');
  const [mode, setMode] = useState<'add' | 'remove' | null>(null);
  const [busy, setBusy] = useState(false);
  if (q.isPending) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  if (q.error) return <p className="text-sm text-destructive">Không tải được chuyên môn.</p>;
  const specs = q.data.specs.filter(s => s.active);
  const has = (u: string, s: string) => q.data.rows.some(r => r.user_id === u && r.specialty_id === s && r.state === 'active');
  const affected = mode && spec ? [...picked].filter(u => mode === 'add' ? !has(u, spec) : has(u, spec)) : [];
  const run = async (fn: () => Promise<unknown>, msg: string) => { setBusy(true); try { await fn(); toast.success(msg); await qc.invalidateQueries({ queryKey: ['mkt-specialties'] }); } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); } };
  return <div className="space-y-4 py-2">
    <div className="flex flex-wrap items-center gap-2">
      <p className="flex-1 text-sm text-muted-foreground">Một nhân sự có thể có nhiều chuyên môn. Đồng bộ chỉ bổ sung theo Role hiện có, không ghi đè lựa chọn của Admin.</p>
      {isSuperAdmin && <Button variant="outline" size="sm" disabled={busy} onClick={() => run(async () => { const { data, error } = await supabase.rpc('mkt_specialty_sync'); if (error) throw error; return data; }, 'Đã đồng bộ chuyên môn')}>Đồng bộ lại từ Role</Button>}
    </div>
    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="w-8" />{['Nhân sự', ...specs.map(s => s.name)].map(h => <th key={h} className="px-2 py-2 text-left font-medium">{h}</th>)}</tr></thead>
      <tbody>{staff.map(u => <tr key={u.id} className="border-b"><td><Checkbox aria-label={`Chọn ${u.name}`} checked={picked.has(u.id)} onCheckedChange={v => { const n = new Set(picked); if (v) n.add(u.id); else n.delete(u.id); setPicked(n); }} /></td><td className="px-2 py-1.5">{u.name}</td>{specs.map(s => <td key={s.id} className="px-2">{has(u.id, s.id) ? '✓' : ''}</td>)}</tr>)}</tbody></table></div>
    {isSuperAdmin && <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
      <span className="text-sm">Đã chọn {picked.size} người</span>
      <select aria-label="Chuyên môn" className="h-9 rounded-md border bg-background px-2 text-sm" value={spec} onChange={e => setSpec(e.target.value)}><option value="">Chọn chuyên môn</option>{specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <Button size="sm" variant="outline" disabled={!spec || !picked.size} onClick={() => setMode('add')}>Gán thêm</Button>
      <Button size="sm" variant="outline" disabled={!spec || !picked.size} onClick={() => setMode('remove')}>Bỏ chuyên môn</Button>
      {mode && spec && <div className="basis-full space-y-2 text-sm"><p>Xem trước: {mode === 'add' ? 'gán' : 'bỏ'} “{specs.find(s => s.id === spec)?.name}” cho {affected.length} người: {affected.map(u => staff.find(x => x.id === u)?.name).join(', ') || 'không ai thay đổi'}.</p><div className="flex gap-2"><Button size="sm" disabled={busy || !affected.length} onClick={() => run(() => save(affected, mode === 'add' ? [spec] : [], mode === 'remove' ? [spec] : []), 'Đã lưu').then(() => { setMode(null); setPicked(new Set()); })}>Xác nhận lưu</Button><Button size="sm" variant="ghost" onClick={() => setMode(null)}>Hủy</Button></div></div>}
    </div>}
  </div>;
}
