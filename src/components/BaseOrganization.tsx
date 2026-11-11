import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, Eye, Users, Settings2, Network } from 'lucide-react';
import { PageHeader } from '@/components/AppShell';
import { OrgChart, type SlotRef } from '@/components/OrgChart';
import { marketingUnit } from '@/lib/basePermissions/appointment';
import { OrganizationChange } from '@/components/OrganizationChange';
import { OrganizationAppointment, type AppointmentTarget } from '@/components/OrganizationAppointment';
import { OrgUnitDrawer } from '@/components/OrgUnitDrawer';
import { MatrixTab, PermissionDebugTab } from '@/components/AccountsSettings';
import { RoleCatalog } from '@/components/RoleCatalog';
import { RoleActualSources } from '@/components/RoleActualSources';
import { PermissionCleanup } from '@/components/PermissionCleanup';
import { StaffPermissionEditor } from '@/components/StaffPermissionEditor';
import { StaffSpecialties } from '@/components/MarketingSpecialties';
import { StaffRoleSources } from '@/components/TitleRoleDefaults';
import { orgConfigDiff, slotHistory } from '@/lib/orgStructure';
import type { ChartNode } from '@/lib/orgChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { baseOrgApi } from '@/lib/basePermissions/api';
import { emptyConfig, type OrgActor, type OrgConfig, type Preview, type EffectivePermission } from '@/lib/basePermissions/types';
import { useAuth, useCurrentUser } from '@/lib/auth';
import { organizationSettingsAccess } from '@/lib/rolePresentation';

const sourceLabel: Record<string, string> = { default: 'Mặc định', direct: 'Trực tiếp', bundle: 'Bộ quyền', role: 'Role cũ', custom: 'Quyền riêng cũ', business: 'Kinh doanh', appointment_role: 'Role theo bổ nhiệm', marketing_appointment: 'Nhiệm vụ theo bổ nhiệm', marketing_specialty: 'Chuyên môn Marketing' };
function PermissionRow({ p }: { p: EffectivePermission }) {
  return <div className="border-b py-3 space-y-1"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-sm">{p.label}</span><Badge variant={p.allowed ? 'secondary' : 'outline'}>{p.allowed ? 'Được phép' : 'Không được phép'}</Badge></div><p className="text-xs text-muted-foreground">{p.module} · {p.tier === 0 ? 'Quản trị đặc quyền' : `Nấc ${p.tier}`} · {p.scope === 'own' ? 'Dữ liệu của mình' : 'Phạm vi nghiệp vụ hiện tại'}</p><p className="text-xs text-muted-foreground">{p.sources.length ? p.sources.map(s => `${sourceLabel[s.source_kind]}${s.source_name ? `: ${s.source_name}` : ''}${s.ends_at ? ` — đến ${new Date(s.ends_at).toLocaleString('vi-VN')}` : ''}`).join('; ') : sourceLabel[p.legacy.source.kind]}</p>{p.conflict && !p.bypass && <p className="text-xs text-destructive">Xung đột cho phép/từ chối — ưu tiên từ chối</p>}</div>;
}
export function BaseOrganization() {
  const { user, isSuperAdmin: isSA, can: canFn } = useCurrentUser();
  const qc = useQueryClient();
  const data = useQuery({ queryKey: ['base-org', user?.id], queryFn: baseOrgApi.read, retry: false });
  const [config, setConfig] = useState<OrgConfig>(emptyConfig);
  const [dirty, setDirty] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [search, setSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [section, setSection] = useState('chart');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [assigning, setAssigning] = useState<AppointmentTarget | null>(null);
  const [historySlot, setHistorySlot] = useState<SlotRef | null>(null);
  const [changing,setChanging]=useState<{id:string;specialty?:boolean}|null>(null);
  const [manageUnit, setManageUnit] = useState<ChartNode | null>(null);
  const [membershipMode, setMembershipMode] = useState(false);
  const [reason, setReason] = useState('');
  useEffect(() => { const timer = setInterval(() => { if (!dirty && document.visibilityState === 'visible') { void qc.invalidateQueries({ queryKey: ['base-org', user?.id] }); } }, 60000); return () => clearInterval(timer); }, [qc,user?.id,dirty]);
  const effective = useQuery({ queryKey: ['base-effective', user?.id, staffId], queryFn: () => baseOrgApi.effective(staffId), enabled: !!staffId, retry: false });
  useEffect(() => { if (data.data && !dirty) setConfig(structuredClone(data.data.config)); }, [data.data, dirty]);
  const edit = (fn: (c: OrgConfig) => OrgConfig) => { setConfig(fn); setDirty(true); setError(''); };
  const staff = data.data?.staff ?? [];
  const selected = staff.find(s => s.id === staffId);
  const run = async (fn: () => Promise<void>) => { setBusy(true); setError(''); try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); } };
  const actor: OrgActor = data.data?.actor ?? { super: false, assign_all: false, assign_units: [], appoint_all: false, appoint_units: [], view_history: false };
  const canEditStructure = actor.super || !!actor.structure_units?.length;
  const settingsAccess = organizationSettingsAccess(isSA, canEditStructure, canFn('settings.role'), canFn('settings.permission'));
  // Đơn vị hiển thị theo cây Khối/Hệ/Phòng/Nhóm (thứ tự cha → con), không phải danh sách phẳng.
  const canAssignAnywhere = actor.super || actor.assign_all || actor.assign_units.length > 0 || actor.appoint_all || actor.appoint_units.length > 0;
  const original = data.data?.config;
  const sectionChanged = (k: keyof OrgConfig) => !!original && JSON.stringify(original[k]) !== JSON.stringify(config[k]);
  const legacyPermissionChanged = sectionChanged('defaults') || sectionChanged('bundles') || sectionChanged('grants') || sectionChanged('bindings');
  const roleChanged = JSON.stringify(original?.role_links ?? []) !== JSON.stringify(config.role_links ?? []);
  const permissionChanged = legacyPermissionChanged || roleChanged;
  const showPreview = () => run(async () => {
    if (!original) return;
    setReason(''); setMembershipMode(!permissionChanged);
    if (legacyPermissionChanged) throw new Error('Quyền bổ sung chưa thể áp dụng trong lượt chuyển đổi này; không thay đổi quyền hiện có.');
    setPreview(await baseOrgApi.preview(data.data?.revision ?? 0, config, original));
  });
  const apply = () => run(async () => {
    if (!preview) return;
    await baseOrgApi.apply(preview.id, 'ÁP DỤNG CƠ CẤU', roleChanged ? `ÁP DỤNG PHÂN QUYỀN:${reason}` : reason);
    setPreview(null); setDirty(false);
    await qc.invalidateQueries();
    await useAuth.getState().reload();
  });
  if (data.isPending) return <p className="p-6 text-muted-foreground">Đang tải cơ cấu tổ chức…</p>;
  if (data.error) return <div className="space-y-3"><p className="text-destructive">{data.error.message}</p><Button variant="outline" onClick={() => data.refetch()}>Thử lại</Button></div>;
  const groupPermissions = (rows: EffectivePermission[]) => [...new Set(rows.map(p => p.module))].map(module => <details key={module} open className="border-b"><summary className="py-3 font-semibold text-sm cursor-pointer">{module}</summary>{rows.filter(p => p.module === module && `${p.label} ${p.key}`.toLocaleLowerCase('vi').includes(permissionSearch.toLocaleLowerCase('vi'))).map(p => <PermissionRow key={p.key} p={p} />)}</details>);
  return <div className="space-y-5 max-w-6xl"><PageHeader title="Cơ cấu tổ chức" /><div className="flex flex-wrap gap-2 items-center"><Button size="sm" variant={section === 'chart' ? 'default' : 'outline'} onClick={() => setSection('chart')}><Network className="h-4 w-4 mr-2" />Cơ cấu & Bổ nhiệm</Button>{canAssignAnywhere && <Button size="sm" variant={section==='staff'?'default':'outline'} onClick={()=>setSection('staff')}><Users className="mr-2 size-4"/>Hồ sơ nhân viên</Button>}{settingsAccess.roles && <Button size="sm" variant={section === 'settings' ? 'default' : 'outline'} onClick={() => setSection('settings')}><Settings2 className="h-4 w-4 mr-2" />Role & Phân quyền</Button>}<Button className="ml-auto" size="sm" disabled={busy || !dirty} onClick={showPreview}><Eye className="h-4 w-4 mr-2" />Xem trước thay đổi</Button></div>{dirty && <div className="flex items-center gap-2"><Badge variant="outline">Có thay đổi chưa áp dụng</Badge><Button size="sm" variant="ghost" onClick={()=>{if(original)setConfig(structuredClone(original));setDirty(false);setError('');}}>Hủy bản nháp</Button></div>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  {section === 'chart' && <OrgChart config={config} staff={staff} serverNow={data.data?.server_now} canManage={canAssignAnywhere || canEditStructure} onManageUnit={node => setManageUnit(node)} onOpenStaff={id => { setStaffId(id); setSection('staff'); }} onAssign={ref => setAssigning({unitId:ref.unitId,titleId:ref.slot.titleId??ref.slot.id,slotId:ref.slot.titleId&&ref.slot.titleId!==ref.slot.id?ref.slot.id:undefined})} onUnassign={(ref,p)=>{const m=config.memberships.find(x=>x.active&&x.unit_id===ref.unitId&&x.title_id===(ref.slot.titleId??ref.slot.id)&&(!ref.slot.titleId||ref.slot.titleId===ref.slot.id||x.slot_id===ref.slot.id)&&x.user_id===p.id);if(m)setChanging({id:m.id});}} onSlotHistory={ref=>setHistorySlot(ref)} />}
  {section === 'staff' && <div className="grid md:grid-cols-[260px_1fr] gap-6"><div><div className="flex items-center gap-2 mb-3"><Search className="h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm nhân sự" placeholder="Tìm nhân sự" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="max-h-72 md:max-h-[650px] overflow-y-auto space-y-1">{staff.filter(s => s.name.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map(s => <Button className="w-full h-auto py-3 justify-start text-left whitespace-normal" variant={staffId === s.id ? 'secondary' : 'ghost'} key={s.id} onClick={() => setStaffId(s.id)}>{s.name}</Button>)}</div></div><div className="min-w-0">{selected ? <><h2 className="text-xl font-semibold">{selected.name}</h2><p className="text-sm text-muted-foreground mb-4">{selected.status}</p><Tabs defaultValue="effective"><TabsList className="w-full flex h-auto flex-wrap"><TabsTrigger value="default" className="flex-1">Quyền mặc định</TabsTrigger><TabsTrigger value="extra" className="flex-1">Quyền bổ sung cá nhân</TabsTrigger><TabsTrigger value="effective" className="flex-1">Quyền thực tế</TabsTrigger><TabsTrigger value="spec" className="flex-1">Chuyên môn</TabsTrigger></TabsList><TabsContent value="spec"><StaffSpecialties key={staffId} userId={staffId} /></TabsContent>
  <TabsContent value="default"><details><summary className="text-sm cursor-pointer">Nâng cao — nguồn cấp quyền</summary><StaffRoleSources userId={staffId} memberships={config.memberships.filter(m=>m.user_id===staffId&&m.active).map(m=>({title_source:config.titles.find(t=>t.id===m.title_id)?.source==='biz_positions'?'biz' as const:'base' as const,title_id:m.title_id??'',name:config.titles.find(t=>t.id===m.title_id)?.name??'Chưa có chức vụ'}))}/></details><div className="space-y-2">{config.memberships.filter(m=>m.user_id===staffId).map(m=><div key={m.id} className="border-b py-3"><p>{config.units.find(u=>u.id===m.unit_id)?.name} · {config.titles.find(t=>t.id===m.title_id)?.name}</p><p className="text-xs text-muted-foreground">{m.active?'Đang áp dụng':'Đã kết thúc'}</p>{m.active&&<div className="flex gap-2 mt-2"><Button size="sm" variant="outline" onClick={()=>setChanging({id:m.id})}>Miễn nhiệm</Button>{isSA&&marketingUnit(config,m.unit_id)&&config.titles.find(t=>t.id===m.title_id)?.source!=='biz_positions'&&<Button size="sm" variant="outline" onClick={()=>setChanging({id:m.id,specialty:true})}>Nhiệm vụ Marketing</Button>}</div>}</div>)}</div></TabsContent>
  <TabsContent value="extra"><StaffPermissionEditor key={staffId} userId={staffId} /></TabsContent>
  <TabsContent value="effective"><RoleActualSources key={staffId} userId={staffId}/><Input className="my-4" aria-label="Tìm quyền" placeholder="Tìm chức năng hoặc hành động" value={permissionSearch} onChange={e => setPermissionSearch(e.target.value)} />{effective.isPending ? <p>Đang tải quyền…</p> : effective.error ? <p className="text-destructive">{effective.error.message}</p> : groupPermissions(effective.data?.permissions ?? [])}</TabsContent></Tabs></> : <div className="py-16 text-center text-muted-foreground"><ShieldCheck className="mx-auto h-10 w-10 mb-3" />Chọn nhân sự</div>}</div></div>}
  {section === 'settings' && <div><RoleCatalog canManage={settingsAccess.editRoles} />{isSA&&<details className="mt-5 border-t pt-3"><summary className="cursor-pointer font-medium text-sm">Nâng cao</summary><Tabs defaultValue={settingsAccess.matrix ? 'matrix' : 'inheritance'} className="mt-3"><TabsList className="flex flex-wrap h-auto">{settingsAccess.matrix && <TabsTrigger value="matrix">Ma trận quyền</TabsTrigger>}{isSA && <TabsTrigger value="debug">Kiểm tra quyền</TabsTrigger>}<TabsTrigger value="inheritance">Role mặc định</TabsTrigger>{isSA && <TabsTrigger value="bundles">Quyền tùy chỉnh</TabsTrigger>}{isSA && <TabsTrigger value="cleanup">Chuyển đổi quyền cũ</TabsTrigger>}</TabsList>{settingsAccess.matrix && <TabsContent value="matrix"><MatrixTab canManage={false} /></TabsContent>}{isSA && <TabsContent value="debug"><PermissionDebugTab /></TabsContent>}<TabsContent value="inheritance"><p className="py-3 text-sm text-muted-foreground">Role theo chức vụ chỉ tự cấp các chức năng cá nhân đã kiểm chứng. Quyền quản lý đơn vị còn chờ kiểm chứng. Nhiệm vụ Marketing chỉ cấp tập quyền đã được xác minh; Role trực tiếp giữ nguyên.</p></TabsContent>{isSA && <TabsContent value="bundles"><p className="py-3 text-sm text-muted-foreground">Chưa hỗ trợ tự động: quyền tùy chỉnh chưa có quy trình áp dụng nguyên tử. Cấu hình đã có được giữ nguyên.</p>{config.bundles.map(b => <div key={b.id} className="border-b py-2 text-sm">{b.name} · {b.active ? 'Đang áp dụng' : 'Bản nháp'}</div>)}</TabsContent>}{isSA && <TabsContent value="cleanup"><PermissionCleanup /></TabsContent>}</Tabs></details>}</div>}
  {section === 'history' && <div>{(data.data?.events ?? []).map(e => { const orgChanges = orgConfigDiff(e.before_data, e.after_data, uid => staff.find(s => s.id === uid)?.name ?? 'Nhân sự'); return <details key={e.id} className="border-b py-3"><summary className="cursor-pointer text-sm font-medium">{new Date(e.created_at).toLocaleString('vi-VN')} · {staff.find(s => s.id === e.actor_id)?.name ?? 'Quản trị'} · Phiên bản {e.before_revision} → {e.after_revision}</summary>{orgChanges.length > 0 && <div className="py-2"><p className="text-xs font-semibold text-muted-foreground">Thay đổi tổ chức</p>{orgChanges.map((c, i) => <p key={i} className="py-0.5 text-sm">{c}</p>)}</div>}{(e.impact ?? []).length > 0 && <div className="py-2"><p className="text-xs font-semibold text-muted-foreground">Thay đổi quyền</p>{(e.impact ?? []).map(p => <div key={p.user_id} className="py-2 text-sm"><strong>{p.name}</strong>{p.changes.map(c => <p key={c.key}>{c.label}: {c.before.allowed ? 'Có' : 'Không'} → {c.after.allowed ? 'Có' : 'Không'}</p>)}</div>)}</div>}{!orgChanges.length && !(e.impact ?? []).length && <p className="py-2 text-sm text-muted-foreground">Không có thay đổi nội dung.</p>}</details>; })}{!data.data?.events.length && <p className="text-muted-foreground py-5">Chưa có thay đổi nào.</p>}</div>}
  <Dialog open={!!preview} onOpenChange={v => !v && !busy && setPreview(null)}><DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{membershipMode ? 'Xem trước thay đổi phân công' : 'Xem trước thay đổi phân quyền'}</DialogTitle></DialogHeader>{(() => { const orgChanges = preview?.before && preview?.after ? orgConfigDiff(preview.before, preview.after, uid => staff.find(s => s.id === uid)?.name ?? 'Nhân sự') : []; return <>
  {orgChanges.length > 0 && <div className="space-y-1 rounded-xl border p-3"><p className="text-xs font-semibold text-muted-foreground">Thay đổi tổ chức ({orgChanges.length})</p>{orgChanges.map((c, i) => <p key={i} className="text-sm">{c}</p>)}</div>}
  {<><p className="text-sm">{preview?.impact.length ?? 0} nhân sự thay đổi quyền hoặc nguồn quyền tại thời điểm xem trước</p>{preview?.impact.map(p => <details open key={p.user_id} className="border-b py-2"><summary className="font-medium">{p.name}</summary>{p.changes.map(c => <div key={c.key} className="py-2 text-sm"><p>{c.label}</p><p className="text-muted-foreground">{c.before.allowed ? 'Được phép' : 'Không được phép'} → {c.after.allowed ? 'Được phép' : 'Không được phép'} · Nấc {c.before.tier} → {c.after.tier}</p></div>)}</details>)}{preview?.next_transition_at && <p className="text-sm">Mốc thay đổi hiệu lực tiếp theo: {new Date(preview.next_transition_at).toLocaleString("vi-VN")}</p>}</>}
  <div className="space-y-2 border-t pt-3"><Label htmlFor="base-reason">Lý do thay đổi</Label><Input id="base-reason" value={reason} onChange={e=>setReason(e.target.value)} /></div>
  {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
  <Button disabled={busy || !reason.trim()} onClick={apply}>{busy ? 'Đang áp dụng…' : 'Xác nhận áp dụng'}</Button>
</>; })()}</DialogContent></Dialog>
  {assigning && <OrganizationAppointment target={assigning} config={config} staff={staff} onClose={()=>setAssigning(null)} onPreview={async next=>{if(dirty)throw new Error('Áp dụng hoặc hủy bản nháp hiện tại trước khi bổ nhiệm.');if(!original)throw new Error('Chưa tải cơ cấu.');return baseOrgApi.preview(data.data?.revision??0,next,original);}} onApply={async(p,reason)=>{await baseOrgApi.apply(p.id,'ÁP DỤNG CƠ CẤU',reason);const fresh=await data.refetch();if(fresh.error)throw fresh.error;if(fresh.data)setConfig(structuredClone(fresh.data.config));await qc.invalidateQueries({queryKey:['base-effective']});await qc.invalidateQueries({queryKey:['title-role-links']});await useAuth.getState().reload();}} />}
  {manageUnit && <OrgUnitDrawer unitId={manageUnit.id} config={config} staff={staff} actor={actor} onAppoint={(titleId,mode)=>{setAssigning({unitId:manageUnit.id,titleId,mode});setManageUnit(null);}} onEnd={id=>{setChanging({id});setManageUnit(null);}} onEdit={edit} onClose={()=>setManageUnit(null)} />}
  {changing && <OrganizationChange config={config} id={changing.id} specialty={changing.specialty} onClose={()=>setChanging(null)} onPreview={async next=>{if(dirty)throw new Error('Áp dụng bản nháp cơ cấu trước.');if(!original)throw new Error('Chưa tải cơ cấu.');return baseOrgApi.preview(data.data?.revision??0,next,original);}} onApply={async(p,reason)=>{await baseOrgApi.apply(p.id,'ÁP DỤNG CƠ CẤU',reason);await data.refetch();await qc.invalidateQueries({queryKey:['base-effective']});await useAuth.getState().reload();}} />}
  <Dialog open={!!historySlot} onOpenChange={v => !v && setHistorySlot(null)}><DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Lịch sử — {historySlot?.slot.title}</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{historySlot?.unitName}</p>{historySlot && (slotHistory(config, historySlot.unitId, historySlot.slot.id).length ? slotHistory(config, historySlot.unitId, historySlot.slot.id).map(m => <div key={m.id} className="border-b py-2 text-sm"><p className="font-medium">{staff.find(s => s.id === m.user_id)?.name ?? 'Nhân sự'}</p><p className="text-xs text-muted-foreground">{m.starts_at ? new Date(m.starts_at).toLocaleString('vi-VN') : '—'} → {m.ends_at ? new Date(m.ends_at).toLocaleString('vi-VN') : 'Hiện tại'} · {m.active ? 'Đang áp dụng' : 'Đã kết thúc'}</p></div>) : <p className="py-4 text-sm text-muted-foreground">Chưa từng có người giữ vị trí này.</p>)}</DialogContent></Dialog></div>;
}