import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Plus, SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { positionsQuery, usePositionAction } from '@/lib/biz/positionQueries';
import { appointmentStatus, appointmentUnit, vietnamInput, vietnamTimestamp, type Appointment, type PositionsData } from '@/lib/biz/positions';
import { orgDate, type OrgData } from '@/lib/biz/organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BizAppointments({ org, initialUser, onClose }: { org: OrgData; initialUser?: string; onClose?: () => void }) {
 const uid = useAuth(s => s.currentUserId) ?? ''; const users = useAuth(s => s.users); const query = useQuery(positionsQuery(uid)); const save = usePositionAction();
 const [edit, setEdit] = useState<Appointment | 'new' | null>(initialUser ? 'new' : null); const [history, setHistory] = useState(false);
 const rows = (query.data?.appointments ?? []).filter(a => !initialUser || a.user_id === initialUser);
 const content = <section className="space-y-3"><div className="flex flex-wrap items-center gap-2 justify-between"><h3 className="font-semibold">Bổ nhiệm chức vụ</h3><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setHistory(!history)}><History className="h-4 w-4 mr-2" />{history ? 'Hiện tại' : 'Lịch sử'}</Button><Button size="sm" onClick={() => setEdit('new')}><Plus className="h-4 w-4 mr-2" />Bổ nhiệm</Button></div></div>
 {query.error && <p role="alert" className="text-destructive">{query.error.message}</p>}
 {rows.filter(a => history || a.status === 'active' && (!a.ended_at || Date.parse(a.ended_at) > Date.parse(query.data?.server_now ?? ''))).map(a => <div key={a.id} className="border-b py-3 space-y-2"><div className="flex flex-wrap justify-between gap-2"><div><strong>{users.find(u => u.id === a.user_id)?.fullName ?? 'Nhân viên'}</strong><p className="text-sm">{a.position_snapshot.name} · {appointmentUnit(a, org)}</p></div><Badge variant="outline">{appointmentStatus(a, query.data?.server_now ?? new Date().toISOString())}</Badge></div><p className="text-xs text-muted-foreground">{orgDate(a.started_at)} → {a.ended_at ? orgDate(a.ended_at) : 'Không giới hạn'}</p>{a.status === 'active' && (!a.ended_at || Date.parse(a.ended_at) > Date.now()) && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setEdit(a)}><SquarePen className="h-4 w-4 mr-2" />Điều chỉnh bổ nhiệm</Button><Button size="sm" variant="ghost" disabled={save.isPending} onClick={async () => { if (!window.confirm('Xác nhận kết thúc/hủy quyết định này? Lịch sử được giữ nguyên.')) return; try { await save.mutateAsync({ kind: 'appointment', data: { id: a.id, action: Date.parse(a.started_at) > Date.now() ? 'cancel' : 'end', ended_at: new Date().toISOString() } }); toast.success('Đã cập nhật quyết định.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}>Kết thúc / Hủy</Button></div>}</div>)}
 {!rows.length && <p className="text-sm text-muted-foreground">Chưa có quyết định bổ nhiệm mới.</p>}
 {edit && query.data && <AppointmentDialog key={edit === 'new' ? `new-${initialUser}` : edit.id} value={edit} initialUser={initialUser} org={org} catalog={query.data} onClose={() => setEdit(null)} />}
 </section>;
 return onClose ? <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Chức vụ và phạm vi nhân sự</DialogTitle></DialogHeader>{content}</DialogContent></Dialog> : content;
}
function AppointmentDialog({ value, initialUser, org, catalog, onClose }: { value: Appointment | 'new'; initialUser?: string; org: OrgData; catalog: PositionsData; onClose: () => void }) {
 const a = value === 'new' ? null : value; const member = org.members.find(m => m.user_id === initialUser && !m.ended_at);
 const [user, setUser] = useState(a?.user_id ?? initialUser ?? ''); const [position, setPosition] = useState(a?.position_id ?? '');
 const [system, setSystem] = useState(a?.system_id ?? org.departments.find(d => d.id === member?.department_id)?.system_id ?? ''); const [department, setDepartment] = useState(a?.department_id ?? member?.department_id ?? ''); const [team, setTeam] = useState(a?.team_id ?? '');
 const [start, setStart] = useState(vietnamInput(catalog.server_now)); const [end, setEnd] = useState(''); const save = usePositionAction(); const users = useAuth(s => s.users); const p = catalog.positions.find(p => p.id === position);
 const picker = (label: string, value: string, set: (v: string) => void, items: { id: string; name: string }[], optional = false) => <div className="space-y-2"><Label>{label}</Label><Select value={value || 'none'} onValueChange={v => set(v === 'none' ? '' : v)}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{optional ? 'Không có' : `Chọn ${label.toLowerCase()}`}</SelectItem>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></div>;
 return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{a ? 'Điều chỉnh bổ nhiệm' : 'Bổ nhiệm nhân sự'}</DialogTitle></DialogHeader>
 {picker('Nhân viên', user, setUser, users.filter(u => u.status === 'Đang hoạt động' && (!a || u.id === a.user_id)).map(u => ({ id: u.id, name: u.fullName })))}
 {picker('Chức vụ', position, v => { setPosition(v); setTeam(''); }, catalog.positions.filter(p => p.active))}
 {picker('Hệ Kinh doanh', system, v => { setSystem(v); setDepartment(''); setTeam(''); }, org.systems.filter(s => s.active))}
 {p && p.unit_kind !== 'system' && picker('Phòng', department, v => { setDepartment(v); setTeam(''); }, org.departments.filter(d => d.system_id === system && d.active))}
 {p && ['team', 'individual'].includes(p.unit_kind) && picker('Nhóm', team, setTeam, org.teams.filter(t => t.department_id === department && t.active), p.unit_kind === 'individual')}
 {p && <p className="text-sm text-primary">Phạm vi phụ trách: {p.unit_kind === 'system' ? org.systems.find(s => s.id === system)?.name : p.unit_kind === 'team' ? org.teams.find(t => t.id === team)?.name : p.unit_kind === 'individual' ? users.find(u => u.id === user)?.fullName : org.departments.find(d => d.id === department)?.name}</p>}
 <Label htmlFor="appointment-start">Bắt đầu hiệu lực (giờ Việt Nam)</Label><Input id="appointment-start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
 <Label htmlFor="appointment-end">Kết thúc hiệu lực (không bắt buộc)</Label><Input id="appointment-end" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
 <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Hủy</Button><Button disabled={save.isPending || !user || !p || !system || (p.unit_kind !== 'system' && !department) || (p.unit_kind === 'team' && !team) || !start || (!!end && Date.parse(end) <= Date.parse(start))} onClick={async () => { if (!p) return; try { await save.mutateAsync({ kind: 'appointment', data: { user_id: user, position_id: p.id, scope_kind: p.unit_kind, system_id: system, department_id: p.unit_kind === 'system' ? null : department, team_id: p.unit_kind === 'system' || p.unit_kind === 'department' ? null : team || null, started_at: vietnamTimestamp(start), ended_at: end ? vietnamTimestamp(end) : null, replaces_id: a?.id } }); toast.success('Đã lưu bổ nhiệm và lịch sử.'); onClose(); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}>Lưu</Button></div>
 </DialogContent></Dialog>;
}