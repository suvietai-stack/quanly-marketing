import { useState } from 'react';
import { Search, Check, ArrowLeft } from 'lucide-react';
import { AppointmentPermissionSummary, AssignmentSpecialties } from './AppointmentPermissionSummary';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { appointmentDraft, appointmentEligible, marketingUnit } from '@/lib/basePermissions/appointment';
import type { OrgConfig, Preview } from '@/lib/basePermissions/types';
import { membershipEffective, unitTitles, orgConfigDiff } from '@/lib/orgStructure';

export interface AppointmentTarget { unitId: string; titleId?: string; slotId?: string; mode?: 'primary' | 'concurrent' | 'transfer' }
export function OrganizationAppointment({ target, config, staff, onClose, onPreview, onApply }: {
  target: AppointmentTarget; config: OrgConfig; staff: {id: string; name: string; status: string}[];
  onClose: () => void; onPreview: (next: OrgConfig) => Promise<Preview>; onApply: (p: Preview, reason: string) => Promise<void>;
}) {
  const [titleId, setTitleId] = useState(target.titleId ?? '');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [mode, setMode] = useState<'primary' | 'concurrent' | 'transfer'>(target.mode ?? 'primary');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const title = config.titles.find(t => t.id === titleId);
  const single = title?.kind === 'manager' && title.capacity === 1;
  const unitName = config.units.find(u => u.id === target.unitId)?.name ?? '';
  const nameOf = (id: string) => staff.find(s => s.id === id)?.name ?? id;
  const existing = config.memberships.filter(m => membershipEffective(m) && picked.includes(m.user_id) && m.unit_id !== target.unitId);
  const rows = staff.filter(s => s.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
  const run = async (fn: () => Promise<void>) => {setBusy(true);setError('');try {await fn();} catch(e) {setError(e instanceof Error ? e.message : String(e));setPreview(null);} finally {setBusy(false);}};
  return <Dialog open onOpenChange={open => !open && !busy && onClose()}><DialogContent className="max-h-[85dvh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>{saved ? 'Đã bổ nhiệm' : preview ? 'Xem trước bổ nhiệm' : 'Bổ nhiệm / Thêm nhân sự'} — {unitName}</DialogTitle></DialogHeader>
    {saved ? <div className="space-y-3"><p className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />Đã lưu phân công và làm mới sơ đồ.</p>{picked.map(id => <p key={id}>{nameOf(id)} · {title?.name}</p>)}<Button onClick={onClose}>Đóng</Button></div> : preview ? <div className="space-y-3">
      {orgConfigDiff(preview.before, preview.after, nameOf).map((line,i) => <p key={i} className="text-sm">{line}</p>)}
      {preview.impact.map(person => <details open key={person.user_id}><summary className="font-medium text-sm">{person.name}</summary>{person.changes.map(c => <p key={c.key} className="text-xs py-1">{c.label}: {c.before.allowed ? 'Có' : 'Không'} → {c.after.allowed ? 'Có' : 'Không'}</p>)}</details>)}
      {!preview.impact.length && <p className="text-sm text-muted-foreground">Không thay đổi quyền hiệu lực; các nguồn quyền khác được giữ nguyên.</p>}
      <div className="flex gap-2"><Button disabled={busy} variant="outline" onClick={() => setPreview(null)}><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Button><Button disabled={busy} onClick={() => run(async () => {await onApply(preview, `Bổ nhiệm ${picked.map(nameOf).join(', ')} tại ${unitName} — ${title?.name}`);setSaved(true);})}>{busy ? 'Đang lưu…' : 'Xác nhận bổ nhiệm'}</Button></div>
    </div> : <div className="space-y-3">
      <Label>Chức vụ tại {unitName}</Label><Select value={titleId} disabled={!!target.titleId} onValueChange={v => {setTitleId(v);setPicked([]);}}><SelectTrigger aria-label="Chức vụ bổ nhiệm"><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger><SelectContent>{unitTitles(config,target.unitId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
      <div className="flex gap-2 items-center"><Search className="h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm nhân sự bổ nhiệm" placeholder="Tìm theo tên" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <div className="max-h-60 overflow-y-auto border rounded-md">{rows.map(s => {const assignments=config.memberships.filter(m => m.user_id===s.id && membershipEffective(m));const eligible=appointmentEligible(s.status);const already=assignments.some(m=>m.unit_id===target.unitId&&m.title_id===titleId);return <label key={s.id} className="flex gap-3 items-start border-b px-3 py-2 text-sm"><Checkbox aria-label={`Chọn ${s.name} ${s.id.slice(-6)}`} disabled={!eligible || !titleId || already} checked={picked.includes(s.id)} onCheckedChange={v => setPicked(ids => v===true ? single ? [s.id] : [...ids,s.id] : ids.filter(id => id!==s.id))} /><span className="min-w-0"><span className="block font-medium">{s.name} <span className="text-xs text-muted-foreground">· {s.id.slice(-6)}</span></span><span className="block text-xs text-muted-foreground">{already ? 'Đang giữ vị trí này' : eligible ? assignments.map(m => config.units.find(u => u.id===m.unit_id)?.name).join(', ') || 'Chưa phân công' : `Không thể bổ nhiệm: ${s.status}`}</span></span></label>;})}{!rows.length && <p className="p-3 text-sm text-muted-foreground">Không có nhân sự phù hợp.</p>}</div>
      <p className="text-sm">Đã chọn {picked.length} người{single ? ' · Vị trí một người' : ''}</p>
      {existing.length > 0 && <><Label>Phân công hiện có</Label><Select value={mode} onValueChange={v => setMode(v as typeof mode)}><SelectTrigger aria-label="Hình thức bổ nhiệm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="primary">Chọn hình thức</SelectItem><SelectItem value="concurrent">Kiêm nhiệm — giữ phân công hiện có</SelectItem><SelectItem value="transfer">Điều chuyển — kết thúc phân công chính</SelectItem></SelectContent></Select>{mode==='transfer' && existing.filter(m=>m.kind!=='concurrent').map(m=><p key={m.id} className="text-sm text-destructive">Kết thúc: {nameOf(m.user_id)} · {config.units.find(u=>u.id===m.unit_id)?.name} · {config.titles.find(t=>t.id===m.title_id)?.name}</p>)}</>}
      <AppointmentPermissionSummary titleId={titleId} config={config} />{marketingUnit(config,target.unitId) && title?.source!=='biz_positions' && <AssignmentSpecialties selected={specialties} onChange={setSpecialties} />}
      <Button disabled={busy || !titleId || !picked.length || (existing.some(m=>m.kind!=='concurrent') && mode==='primary')} onClick={() => run(async () => {setPreview(await onPreview(appointmentDraft(config,target.unitId,titleId,picked,mode,specialties,new Date(Date.now()-2000).toISOString())));})}>{busy ? 'Đang xem trước…' : 'Xem trước'}</Button>
    </div>}{error && <p role="alert" className="text-sm text-destructive">{error} Vui lòng xem trước lại.</p>}
  </DialogContent></Dialog>;
}