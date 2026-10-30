import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Pencil, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { orgQuery } from '@/lib/biz/organizationQueries';
import { positionsQuery, usePositionAction } from '@/lib/biz/positionQueries';
import { UNIT_KINDS, appointmentCurrent, type BizPosition, type UnitKind } from '@/lib/biz/positions';
import { orgDate } from '@/lib/biz/organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BizPositions() {
 const uid = useAuth(s => s.currentUserId) ?? ''; const users = useAuth(s => s.users);
 const query = useQuery(positionsQuery(uid)); const org = useQuery(orgQuery(uid));
 const [edit, setEdit] = useState<BizPosition | 'new' | null>(null); const [staff, setStaff] = useState<BizPosition | null>(null);
 const now = query.data?.server_now ?? new Date().toISOString();
 const holders = (p: BizPosition) => {
  const rows = (query.data?.appointments ?? []).filter(a => a.position_id === p.id && appointmentCurrent(a, now)).map(a => ({ id: a.id, user: a.user_id, start: a.started_at, unit: a.team_id ? org.data?.teams.find(t => t.id === a.team_id)?.name : a.department_id ? org.data?.departments.find(d => d.id === a.department_id)?.name : org.data?.systems.find(s => s.id === a.system_id)?.name }));
  return [...rows, ...(org.data?.managers ?? []).filter(m => m.position === p.code && appointmentCurrent({ ...m, status: 'active' }, now)).map(m => ({ id: m.id, user: m.user_id, start: m.started_at, unit: m.team_id ? org.data?.teams.find(t => t.id === m.team_id)?.name : m.department_id ? org.data?.departments.find(d => d.id === m.department_id)?.name : org.data?.systems.find(s => s.id === m.system_id)?.name }))];
 };
 return <section className="space-y-4 pb-28 sm:pb-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Chức vụ &amp; Cấp bậc</h2><Button onClick={() => setEdit('new')}><Plus className="h-4 w-4 mr-2" />Thêm chức vụ</Button></div>
  {query.isPending && <p>Đang tải chức vụ…</p>}{query.error && <p role="alert" className="text-destructive">{query.error.message}</p>}
  <div className="divide-y border-y">{query.data?.positions.map(p => <div key={p.id} className="py-4 flex flex-wrap items-start gap-3"><div className="min-w-0 flex-1"><h3 className="font-semibold break-words">{p.name} {!p.active && <Badge variant="secondary">Ngừng áp dụng</Badge>}</h3><div className="text-sm text-muted-foreground mt-1">Cấp {p.level} · {UNIT_KINDS[p.unit_kind]} · Thứ tự {p.sort_order}</div>{p.description && <p className="text-sm mt-1 break-words">{p.description}</p>}<Button variant="ghost" size="sm" className="mt-1" onClick={() => setStaff(p)}><Users className="h-4 w-4 mr-2" />{new Set(holders(p).map(h => h.user)).size} nhân sự đang giữ chức vụ</Button></div><Button variant="outline" size="icon" aria-label={`Sửa chức vụ ${p.name}`} onClick={() => setEdit(p)}><Pencil className="h-4 w-4" /></Button></div>)}</div>
  {edit && <PositionDialog key={edit === 'new' ? 'new' : edit.id} value={edit} onClose={() => setEdit(null)} />}
  {staff && <Dialog open onOpenChange={o => !o && setStaff(null)}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Nhân sự · {staff.name}</DialogTitle></DialogHeader>{holders(staff).map(h => <div key={h.id} className="border-b py-3"><strong>{users.find(u => u.id === h.user)?.fullName ?? 'Nhân viên'}</strong><p className="text-sm text-muted-foreground">{h.unit ?? 'Cá nhân'} · Từ {orgDate(h.start)}</p></div>)}{!holders(staff).length && <p>Chưa có nhân sự đang giữ chức vụ.</p>}</DialogContent></Dialog>}
 </section>;
}
function PositionDialog({ value, onClose }: { value: BizPosition | 'new'; onClose: () => void }) {
 const p = value === 'new' ? null : value; const [name, setName] = useState(p?.name ?? ''); const [description, setDescription] = useState(p?.description ?? ''); const [level, setLevel] = useState(String(p?.level ?? 0)); const [kind, setKind] = useState<UnitKind>(p?.unit_kind ?? 'individual'); const [sort, setSort] = useState(String(p?.sort_order ?? 0)); const [active, setActive] = useState(p?.active ?? true); const save = usePositionAction();
 return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{p ? 'Sửa' : 'Thêm'} chức vụ</DialogTitle></DialogHeader>
 <Label htmlFor="position-name">Tên chức vụ</Label><Input id="position-name" value={name} onChange={e => setName(e.target.value)} />
 <Label htmlFor="position-description">Mô tả</Label><Input id="position-description" value={description} onChange={e => setDescription(e.target.value)} />
 <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="position-level">Cấp bậc</Label><Input id="position-level" type="number" min="0" step="1" value={level} onChange={e => setLevel(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="position-sort">Thứ tự hiển thị</Label><Input id="position-sort" type="number" step="1" value={sort} onChange={e => setSort(e.target.value)} /></div></div>
 <Label>Loại đơn vị phù hợp</Label><Select value={kind} onValueChange={v => setKind(v as UnitKind)}><SelectTrigger aria-label="Loại đơn vị phù hợp"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(UNIT_KINDS).map(([id, text]) => <SelectItem key={id} value={id}>{text}</SelectItem>)}</SelectContent></Select>
 <label className="flex gap-2 items-center text-sm"><Checkbox checked={active} onCheckedChange={v => setActive(v === true)} />Đang áp dụng</label>
 <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Hủy</Button><Button disabled={save.isPending || !name.trim() || !level || !sort || !Number.isInteger(Number(level)) || Number(level) < 0 || !Number.isInteger(Number(sort))} onClick={async () => { try { await save.mutateAsync({ kind: 'position', data: { id: p?.id, name, description, level: Number(level), unit_kind: kind, sort_order: Number(sort), active } }); toast.success('Đã lưu chức vụ.'); onClose(); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}>Lưu</Button></div>
 </DialogContent></Dialog>;
}