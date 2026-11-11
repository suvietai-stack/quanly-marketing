import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { RoleCatalog } from '@/lib/basePermissions/roleCatalog';
import { emptySlotCommand, mappingCommands } from '@/lib/basePermissions/slotMapping';
import { baseOrgApi } from '@/lib/basePermissions/api';
import type { OrgCommand } from '@/lib/basePermissions/commands';
import type { OrgRead, Preview } from '@/lib/basePermissions/types';
import { useAuth } from '@/lib/auth';
import { SlotRoleReplacement } from '@/components/SlotRoleReplacement';
import { isCanonicalRole } from '@/lib/basePermissions/defaultRolePresets';
import { canonicalMapping } from '@/lib/basePermissions/canonicalMapping';

export function SlotMapping({ catalog }: { catalog: RoleCatalog }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [roleChoices, setRoleChoices] = useState<Record<string, string>>({});
  const [slotChoices, setSlotChoices] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('current');
  const [search, setSearch] = useState('');
  const [emptyOpen, setEmptyOpen] = useState(false);
  const [org, setOrg] = useState<OrgRead | null>(null);
  const [titleId, setTitleId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [name, setName] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const roles = catalog.roles.filter(r => isCanonicalRole(r) && r.role_kind === 'position' && r.catalog_state === 'standard' && !r.is_system);
  const isCurrent = (a: RoleCatalog['unmapped'][number]) => a.status === 'active' && a.starts_at <= catalog.server_now && (!a.ends_at || a.ends_at > catalog.server_now);
  const rows = catalog.unmapped.filter(a => (filter === 'all' || (filter === 'current' ? isCurrent(a) : !isCurrent(a))) && `${a.user_name} ${a.title_name} ${a.unit_name}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  const mapping = canonicalMapping(catalog);
  const chosenRole = (a: RoleCatalog['unmapped'][number]) => roleChoices[a.id] ?? (roles.some(r=>r.id===mapping.find(m=>m.assignment.id===a.id)?.roleId) ? mapping.find(m=>m.assignment.id===a.id)?.roleId : '') ?? '';
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(''); try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Không thực hiện được.'); } finally { setBusy(false); } };
  const show = async (commands: OrgCommand[]) => { const live = await baseOrgApi.read(); setReason(''); setPreview(await baseOrgApi.preview(live.revision, live.config, live.config, commands)); };
  return <div className="space-y-3"><SlotRoleReplacement catalog={catalog}/>
    <div className="flex flex-wrap gap-2"><Input aria-label="Tìm phân công chuyển ô" placeholder="Nhân sự, chức danh, đơn vị" value={search} onChange={e => setSearch(e.target.value)} className="sm:max-w-xs"/><Select value={filter} onValueChange={setFilter}><SelectTrigger className="sm:w-64" aria-label="Hiệu lực phân công"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="current">Đang hiệu lực ({catalog.unmapped.filter(isCurrent).length})</SelectItem><SelectItem value="history">Lịch sử & tương lai</SelectItem><SelectItem value="all">Tất cả ({catalog.unmapped.length})</SelectItem></SelectContent></Select><Button variant="outline" disabled={busy} onClick={() => run(async () => { setOrg(await baseOrgApi.read()); setEmptyOpen(true); })}>Thêm ô trống</Button></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="divide-y border-y">{rows.map(a => <div key={a.id} className="py-3 space-y-2"><label className="flex items-start gap-3"><Checkbox disabled={!a.title_id} aria-label={`Chọn phân công ${a.id}`} checked={selected.includes(a.id)} onCheckedChange={v => setSelected(s => v === true ? [...s, a.id] : s.filter(id => id !== a.id))}/><span className="text-sm"><strong>{a.user_name}</strong> · {a.title_name ?? 'Chưa có chức danh'}<span className="block text-xs text-muted-foreground">{a.unit_name} · {new Date(a.starts_at).toLocaleString('vi-VN')} → {a.ends_at ? new Date(a.ends_at).toLocaleString('vi-VN') : 'Không giới hạn'} · {isCurrent(a) ? 'Đang hiệu lực' : 'Lịch sử / tương lai'}</span></span></label>{selected.includes(a.id) && <div className="flex flex-wrap gap-2"><Select value={chosenRole(a)} onValueChange={v => { setRoleChoices(s => ({ ...s, [a.id]: v })); setSlotChoices(s => ({ ...s, [a.id]: 'new' })); }}><SelectTrigger className="sm:w-72" aria-label={`Role cho ${a.id}`}><SelectValue placeholder="Chọn Role vị trí"/></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><Select value={slotChoices[a.id] ?? 'new'} onValueChange={v => setSlotChoices(s => ({ ...s, [a.id]: v }))}><SelectTrigger className="sm:w-72" aria-label={`Ô cho ${a.id}`}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="new">Tách thành ô riêng</SelectItem>{catalog.slots.filter(s => s.active && s.title_id === a.title_id && s.unit_id === a.unit_id && s.role_id === chosenRole(a)).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>}</div>)}</div>
    <Button disabled={busy || !selected.length} onClick={() => run(async () => { await show(mappingCommands(catalog, selected.map(id => { const a = catalog.unmapped.find(x => x.id === id); if (!a) throw new Error('Phân công đã thay đổi.'); return { assignmentId: id, roleId: chosenRole(a), slotId: slotChoices[id] && slotChoices[id] !== 'new' ? slotChoices[id] : undefined }; }))); })}>Xem trước {selected.length} phân công</Button>
    <Dialog open={emptyOpen} onOpenChange={v => !busy && setEmptyOpen(v)}><DialogContent><DialogHeader><DialogTitle>Thêm ô vị trí trống</DialogTitle></DialogHeader><Select value={unitId} onValueChange={v => { setUnitId(v); setTitleId(''); }}><SelectTrigger aria-label="Đơn vị ô trống"><SelectValue placeholder="Đơn vị"/></SelectTrigger><SelectContent>{org?.config.units.filter(u => u.active).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select><Select value={titleId} onValueChange={v => { setTitleId(v); setName(org?.config.titles.find(t => t.id === v)?.name ?? ''); }}><SelectTrigger aria-label="Chức danh ô trống"><SelectValue placeholder="Chức danh"/></SelectTrigger><SelectContent>{org?.config.titles.filter(t => t.active && (!t.unit_id || t.unit_id === unitId)).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select><Select value={roleId} onValueChange={setRoleId}><SelectTrigger aria-label="Role ô trống"><SelectValue placeholder="Role"/></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><Label>Tên ô</Label><Input aria-label="Tên ô trống" value={name} onChange={e => setName(e.target.value)}/>{error && <p className="text-destructive">{error}</p>}<Button disabled={busy} onClick={() => run(async () => { await show([emptySlotCommand(titleId, unitId, roleId, name)]); setEmptyOpen(false); })}>Xem trước ô trống</Button></DialogContent></Dialog>
    <Dialog open={!!preview} onOpenChange={v => !busy && !v && setPreview(null)}><DialogContent className="max-w-3xl max-h-[85dvh] overflow-auto"><DialogHeader><DialogTitle>Xem trước ô vị trí & quyền</DialogTitle></DialogHeader>{preview?.after?.memberships.filter(a => a.slot_id && preview.before?.memberships.find(b => b.id === a.id)?.slot_id !== a.slot_id).map(a => <div key={a.id} className="border-b py-2 text-sm"><p>{catalog.unmapped.find(x => x.id === a.id)?.user_name} · {preview.after?.position_slots?.find(s => s.id === a.slot_id)?.name}</p><p className="text-muted-foreground">{preview.after?.units.find(u => u.id === a.unit_id)?.name} · {roles.find(r => r.id === preview.after?.position_slots?.find(s => s.id === a.slot_id)?.role_id)?.name}</p><p className="text-xs">Giữ nguyên: {a.starts_at} → {a.ends_at ?? 'Không giới hạn'}</p></div>)}{preview?.after?.position_slots?.filter(s => !preview.before?.position_slots?.some(b => b.id === s.id)).map(s => <p key={s.id} className="text-sm">Ô mới: {s.name} · {roles.find(r => r.id === s.role_id)?.name}</p>)}{preview?.impact.map(i => <details open key={i.user_id}><summary className="font-medium">{i.name}</summary>{i.changes.map(c => <p className="text-sm" key={c.key}>{c.label}: {c.before.allowed ? 'Có' : 'Không'} → {c.after.allowed ? 'Có' : 'Không'}</p>)}</details>)}<Label>Lý do</Label><Input aria-label="Lý do mapping ô" value={reason} onChange={e => setReason(e.target.value)}/>{error && <p role="alert" className="text-destructive">{error}</p>}<Button disabled={busy || !reason.trim()} onClick={() => run(async () => { if (!preview) return; await baseOrgApi.apply(preview.id, 'ÁP DỤNG CƠ CẤU', reason); setPreview(null); setSelected([]); await qc.invalidateQueries(); await useAuth.getState().reload(); })}>Super Admin xác nhận chuyển ô</Button></DialogContent></Dialog>
  </div>;
}