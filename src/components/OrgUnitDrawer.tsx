import { useMemo, useState } from 'react';
import { AppointmentPermissionSummary } from '@/components/AppointmentPermissionSummary';
import { ArrowRightLeft, Check, History, Plus, Search, ShieldCheck, UserPlus, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Membership, OrgActor, OrgConfig } from '@/lib/basePermissions/types';
import { assignMany, assignSlot, endMembership, membershipEffective, membershipKind, slotCapacity, slotHolders, titleKind, titleLevel, transferMembers, transferPreview, unitDescendants, unitPath, unitTitles } from '@/lib/orgStructure';

interface Staff { id: string; name: string; status: string }

interface DrawerProps {
  unitId: string;
  config: OrgConfig;
  staff: Staff[];
  actor: OrgActor;
  onEdit: (fn: (c: OrgConfig) => OrgConfig) => void;
  onEditDefaults: (unitId: string) => void;
  onClose: () => void;
}

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('vi-VN') : '—');

/** Quyền của người xem trên đơn vị đang mở (bao phủ cả đơn vị con). */
function unitRights(config: OrgConfig, unitId: string, actor: OrgActor) {
  const tree = unitDescendants(config, unitId);
  const covers = (all: boolean, units: string[]) => all || units.includes(unitId);
  return {
    assign: actor.super || covers(actor.assign_all, actor.assign_units),
    appoint: actor.super || covers(actor.appoint_all, actor.appoint_units),
    structure: actor.super || !!actor.structure_units?.includes(unitId),
  };
}

/** Hộp chọn nhiều nhân sự: tìm kiếm, lọc trạng thái phân công, chọn/bỏ chọn tất cả kết quả lọc. */
function StaffMultiPicker({ config, staff, unitId, selected, onChange }: {
  config: OrgConfig; staff: Staff[]; unitId: string; selected: Set<string>; onChange: (s: Set<string>) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const activeUnitsOf = (id: string) => config.memberships.filter(m => membershipEffective(m) && m.user_id === id).map(m => m.unit_id);
  const rows = staff.filter(s => s.status === 'Đang hoạt động').filter(s => {
    if (query && !s.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))) return false;
    const units = activeUnitsOf(s.id);
    if (filter === 'unassigned') return units.length === 0;
    if (filter === 'other') return units.length > 0 && !units.includes(unitId);
    if (filter === 'here') return units.includes(unitId);
    return true;
  });
  const unitNameOf = (id: string) => {
    const units = activeUnitsOf(id);
    if (!units.length) return 'Chưa phân công';
    return units.map(u => config.units.find(x => x.id === u)?.name ?? '').filter(Boolean).join(', ');
  };
  const toggle = (id: string, v: boolean) => { const next = new Set(selected); if (v) next.add(id); else next.delete(id); onChange(next); };
  const allFiltered = rows.length > 0 && rows.every(r => selected.has(r.id));
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input aria-label="Tìm nhân sự" placeholder="Tìm theo tên" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger aria-label="Lọc nhân sự"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả nhân sự</SelectItem>
          <SelectItem value="unassigned">Chưa được phân công</SelectItem>
          <SelectItem value="other">Đang thuộc đơn vị khác</SelectItem>
          <SelectItem value="here">Đang ở đơn vị này</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Đã chọn {selected.size} người</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={!rows.length || allFiltered} onClick={() => onChange(new Set([...selected, ...rows.map(r => r.id)]))}>Chọn tất cả kết quả</Button>
          <Button size="sm" variant="ghost" disabled={!selected.size} onClick={() => onChange(new Set())}>Bỏ chọn</Button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto rounded-lg border">
        {rows.map(r => (
          <label key={r.id} className="flex cursor-pointer items-center gap-3 border-b px-3 py-2.5 last:border-b-0">
            <Checkbox checked={selected.has(r.id)} onCheckedChange={v => toggle(r.id, v === true)} aria-label={`Chọn ${r.name}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{r.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{unitNameOf(r.id)}</span>
            </span>
          </label>
        ))}
        {!rows.length && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Không có nhân sự phù hợp.</p>}
      </div>
    </div>
  );
}

/** Drawer quản lý một đơn vị: Nhân sự / Chức vụ & Cấp bậc / Phân quyền / Lịch sử / Cài đặt đơn vị. */
export function OrgUnitDrawer({ unitId, config, staff, actor, onEdit, onEditDefaults, onClose }: DrawerProps) {
  const unit = config.units.find(u => u.id === unitId);
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'pick' | 'setup'>('pick');
  const [titleId, setTitleId] = useState('');
  const [form, setForm] = useState<'primary' | 'concurrent'>('primary');
  const [report, setReport] = useState<{ added: string[]; skipped: { userId: string; reason: string }[] } | null>(null);
  const [moveTitle, setMoveTitle] = useState('');
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [effectiveAt, setEffectiveAt] = useState('');
  const [confirmManagerEnd, setConfirmManagerEnd] = useState(false);
  const [appointing, setAppointing] = useState<string>(''); // title id của ô quản lý
  const [appointUser, setAppointUser] = useState('');

  const rights = useMemo(() => unitRights(config, unitId, actor), [config, unitId, actor]);
  const titles = useMemo(() => unitTitles(config, unitId), [config, unitId]);
  const memberships = useMemo(() => config.memberships.filter(m => membershipEffective(m) && m.unit_id === unitId), [config, unitId]);
  const history = useMemo(
    () => config.memberships.filter(m => m.unit_id === unitId).sort((a, b) => Date.parse(b.starts_at ?? '') - Date.parse(a.starts_at ?? '')),
    [config, unitId],
  );
  const nameOf = (id: string) => staff.find(s => s.id === id)?.name ?? 'Nhân sự';
  const titleOf = (id?: string) => config.titles.find(t => t.id === id);
  const managerSlots = titles.filter(t => slotCapacity(t) === 1);
  const concurrentCount = memberships.filter(m => membershipKind(m) === 'concurrent').length;
  const peopleCount = new Set(memberships.map(m => m.user_id)).size;

  if (!unit) return null;
  const canAssign = rights.assign;
  const canAppoint = rights.appoint;

  const resetPick = () => { setPicked(new Set()); setStep('pick'); setTitleId(''); setForm('primary'); setReport(null); };
  const doAssign = () => {
    const r = assignMany(config, unitId, titleId, [...picked], form);
    onEdit(() => r.config);
    setReport(r);
  };
  const selectedConfig = { ...config, memberships: config.memberships.filter(m => sourceIds.includes(m.id)) };
  const preview = transferPreview(selectedConfig, [...picked]);
  const doTransfer = () => {
    const r = transferMembers(selectedConfig, [...picked], unitId, moveTitle);
    r.config = { ...r.config, units: config.units, titles: config.titles, memberships: [...config.memberships.filter(m => !sourceIds.includes(m.id)), ...r.config.memberships] };
    onEdit(() => r.config);
    setReport({ added: r.moved, skipped: r.skipped });
  };

  const personLine = (m: Membership) => (
    <div key={m.id} className="flex items-start gap-2 border-b py-2.5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          {nameOf(m.user_id)}
          {membershipKind(m) === 'concurrent' && <Badge variant="outline" className="text-[10px] font-normal">Kiêm nhiệm</Badge>}
          {m.title_id && (titleOf(m.title_id)?.capacity ?? 0) === 1 && <Badge variant="secondary" className="text-[10px] font-normal">Quản lý</Badge>}
        </p>
        <p className="text-xs text-muted-foreground">
          {titleOf(m.title_id)?.name ?? 'Chưa có chức danh'}
          {m.title_id && ` · Cấp ${(titleOf(m.title_id)?.level ?? 0)}`}
          {m.duties ? ` · ${m.duties}` : ''}
        </p>
      </div>
      {(canAssign || canAppoint) && (
        <Button size="sm" variant="ghost" aria-label={`Kết thúc phân công ${nameOf(m.user_id)}`} onClick={() => onEdit(c => m.starts_at && m.starts_at > new Date().toISOString() ? { ...c, memberships: c.memberships.map(x=>x.id===m.id?{...x,status:'cancelled',active:false}:x) } : endMembership(c, m.id))}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{unit.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">{unitPath(config, unitId)}</p>
        </SheetHeader>
        <Tabs defaultValue="staff" className="mt-4">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="staff">Nhân sự</TabsTrigger>
            <TabsTrigger value="titles">Chức vụ & Cấp bậc</TabsTrigger>
            <TabsTrigger value="perm">Phân quyền</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt đơn vị</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-muted-foreground">Nhân sự thực tế: </span>{peopleCount}</p>
              <p><span className="text-muted-foreground">Đang kiêm nhiệm: </span>{concurrentCount}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Người phụ trách</p>
              {managerSlots.length ? managerSlots.map(t => {
                const holders = slotHolders(config, unitId, t.id);
                return (
                  <div key={t.id} className="flex items-center gap-2 border-b py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t.name} <Badge variant="outline" className="text-[10px] font-normal">Cấp {titleLevel(t)}</Badge></p>
                      <p className="text-xs text-muted-foreground">{holders.length ? holders.map(h => nameOf(h.user_id)).join(', ') : 'Chưa phân công'}</p>
                    </div>
                    {canAppoint && (
                      <Button size="sm" variant="outline" onClick={() => { setAppointing(t.id); setAppointUser(''); }}>
                        <UserPlus className="mr-1.5 h-4 w-4" />{holders.length ? 'Thay đổi' : 'Bổ nhiệm'}
                      </Button>
                    )}
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">Đơn vị chưa có vị trí quản lý đơn nhiệm.</p>}
            </div>
            {canAssign && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => { resetPick(); setAdding(true); }}><Plus className="mr-1.5 h-4 w-4" />Thêm nhân sự</Button>
                <Button size="sm" variant="outline" onClick={() => { resetPick(); setMoveTitle(''); setConfirmManagerEnd(false); setSourceIds([]); setMoving(true); }}><ArrowRightLeft className="mr-1.5 h-4 w-4" />Điều chuyển nhân sự</Button>
              </div>
            )}
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Users className="h-3.5 w-3.5" />Danh sách nhân sự</p>
              {memberships.length ? memberships.map(personLine) : <p className="py-4 text-sm text-muted-foreground">Chưa có nhân sự.</p>}
            </div>
          </TabsContent>

          <TabsContent value="titles" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">Chức danh của đơn vị. Chỉnh sửa chi tiết tại Cài đặt → Chức vụ & Cấp bậc.</p>
            {titles.map(t => (
              <div key={t.id} className="rounded-xl border p-3">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  {t.name}
                  <Badge variant="outline" className="text-[10px] font-normal">Cấp {titleLevel(t)}</Badge>
                  <Badge variant="secondary" className="text-[10px] font-normal">{titleKind(t) === 'manager' ? 'Quản lý' : 'Nhân viên'}</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">{slotCapacity(t) === 1 ? 'Một người' : slotCapacity(t) > 1 ? `Tối đa ${slotCapacity(t)}` : 'Nhiều người'}</Badge>
                </p>
                {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Đang giữ: {titleHoldersCount(config, t.id)} người</p>
              </div>
            ))}
            {!titles.length && <p className="py-4 text-sm text-muted-foreground">Chưa có chức danh — thêm tại Cài đặt → Chức vụ & Cấp bậc.</p>}
          </TabsContent>

          <TabsContent value="perm" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">Quyền mặc định áp cho mọi nhân sự của đơn vị (và đơn vị con). Quyền chưa được nghiệp vụ hỗ trợ chỉ lưu ở dạng bản nháp.</p>
            {actor.super ? (
              <Button disabled title="Chưa hỗ trợ áp dụng quyền tùy chỉnh nguyên tử" variant="outline" onClick={() => onEditDefaults(unitId)}><ShieldCheck className="mr-2 h-4 w-4" />Chỉnh quyền mặc định của đơn vị</Button>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">Chỉ Super Admin được chỉnh quyền mặc định. Bạn vẫn có thể xem quyền thực tế của từng nhân sự ở mục Nhân sự toàn Base.</p>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-2 pt-3">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><History className="h-4 w-4" />Lịch sử phân công của đơn vị, mới nhất trước.</p>
            {actor.view_history || actor.super ? (
              history.length ? history.map(m => (
                <div key={m.id} className="border-b py-2 text-sm">
                  <p className="font-medium">{nameOf(m.user_id)} · {titleOf(m.title_id)?.name ?? 'Chưa có chức danh'}</p>
                  <p className="text-xs text-muted-foreground">{fmt(m.starts_at)} → {m.active ? 'Hiện tại' : fmt(m.ends_at)} · {m.active ? 'Đang áp dụng' : 'Đã kết thúc'} · {membershipKind(m) === 'concurrent' ? 'Kiêm nhiệm' : 'Chính'}</p>
                </div>
              )) : <p className="py-4 text-sm text-muted-foreground">Chưa có lịch sử.</p>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">Bạn chưa được cấp quyền xem lịch sử phân công.</p>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-3 pt-3">
            {rights.structure ? (
              <>
                <div className="space-y-1.5">
                  <Label>Tên đơn vị</Label>
                  <Input aria-label="Tên đơn vị" value={unit.name} onChange={e => onEdit(c => ({ ...c, units: c.units.map(x => x.id === unitId ? { ...x, name: e.target.value } : x) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Đơn vị cha</Label>
                  <Select value={unit.parent_id ?? '_root'} onValueChange={v => onEdit(c => ({ ...c, units: c.units.map(x => x.id === unitId ? { ...x, parent_id: v === '_root' ? undefined : v } : x) }))}>
                    <SelectTrigger aria-label="Đơn vị cha"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_root">Cấp gốc</SelectItem>
                      {config.units.filter(u => u.id !== unitId && !unitDescendants(config, unitId).includes(u.id)).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => onEdit(c => ({ ...c, units: c.units.map(x => x.id === unitId ? { ...x, active: !x.active } : x) }))}>{unit.active ? 'Ngừng đơn vị' : 'Kích hoạt đơn vị'}</Button>
                <p className="text-xs text-muted-foreground">Ngừng đơn vị không xóa nhân sự hay lịch sử.</p>
              </>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">Chỉ Super Admin được sửa cấu trúc đơn vị.</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Thêm nhân sự: chọn nhiều bằng checkbox → thiết lập chức danh + hình thức → báo kết quả từng người */}
        <Dialog open={adding} onOpenChange={v => !v && setAdding(false)}>
          <DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
            <DialogHeader><DialogTitle>Thêm nhân sự — {unit.name}</DialogTitle></DialogHeader>
            {report ? (
              <div className="space-y-3">
                <p className="text-sm">Đã đưa {report.added.length} người vào bản nháp{report.skipped.length ? `, bỏ qua ${report.skipped.length} người` : ''}. Bấm "Xem trước thay đổi" ở trang chính để áp dụng.</p>
                {report.added.map(id => <p key={id} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{nameOf(id)}</p>)}
                {report.skipped.map(s => <p key={s.userId} className="text-sm text-destructive">{nameOf(s.userId)}: {s.reason}</p>)}
                <Button onClick={() => setAdding(false)}>Đóng</Button>
              </div>
            ) : step === 'pick' ? (
              <>
                <StaffMultiPicker config={config} staff={staff} unitId={unitId} selected={picked} onChange={setPicked} />
                <Button disabled={!picked.size} onClick={() => setStep('setup')}>Tiếp tục ({picked.size} người)</Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Thiết lập phân công cho {picked.size} người đã chọn.</p>
                <div className="space-y-1.5">
                  <Label>Chức danh tại {unit.name}</Label>
                  <Select value={titleId} onValueChange={setTitleId}>
                    <SelectTrigger aria-label="Chức danh"><SelectValue placeholder="Chọn chức danh" /></SelectTrigger>
                    <SelectContent>{titles.map(t => <SelectItem key={t.id} value={t.id}>{t.name} · Cấp {titleLevel(t)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Hình thức phân công</Label>
                  <Select value={form} onValueChange={v => setForm(v as 'primary' | 'concurrent')}>
                    <SelectTrigger aria-label="Hình thức phân công"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Phân công chính</SelectItem>
                      <SelectItem value="concurrent">Kiêm nhiệm (giữ nguyên phân công hiện có)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AppointmentPermissionSummary titleId={titleId} config={config} />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('pick')}>Quay lại</Button>
                  <Button disabled={!titleId} onClick={doAssign}>Đưa vào thay đổi</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Điều chuyển: kết thúc phân công chính hiện tại, tạo phân công mới; cảnh báo vị trí quản lý bị ảnh hưởng */}
        <Dialog open={moving} onOpenChange={v => !v && setMoving(false)}>
          <DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
            <DialogHeader><DialogTitle>Điều chuyển nhân sự sang {unit.name}</DialogTitle></DialogHeader>
            {report ? (
              <div className="space-y-3">
                <p className="text-sm">Đã đưa {report.added.length} người vào bản nháp{report.skipped.length ? `, bỏ qua ${report.skipped.length} người` : ''}. Bấm "Xem trước thay đổi" ở trang chính để áp dụng.</p>
                {report.added.map(id => <p key={id} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{nameOf(id)}</p>)}
                {report.skipped.map(s => <p key={s.userId} className="text-sm text-destructive">{nameOf(s.userId)}: {s.reason}</p>)}
                <Button onClick={() => setMoving(false)}>Đóng</Button>
              </div>
            ) : step === 'pick' ? (
              <>
                <p className="text-sm text-muted-foreground">Chọn nhân sự cần điều chuyển. Phân công chính hiện tại sẽ kết thúc, kiêm nhiệm ở đơn vị khác được giữ nguyên, lịch sử không bị xóa.</p>
                <StaffMultiPicker config={config} staff={staff} unitId={unitId} selected={picked} onChange={setPicked} />
                <Button disabled={!picked.size} onClick={() => setStep('setup')}>Tiếp tục ({picked.size} người)</Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Chức danh tại {unit.name}</Label>
                  <Select value={moveTitle} onValueChange={setMoveTitle}>
                    <SelectTrigger aria-label="Chức danh đích"><SelectValue placeholder="Chọn chức danh" /></SelectTrigger>
                    <SelectContent>{titles.map(t => <SelectItem key={t.id} value={t.id}>{t.name} · Cấp {titleLevel(t)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Label>Phân công nguồn cần kết thúc</Label><div className="max-h-48 overflow-y-auto">{config.memberships.filter(m=>membershipEffective(m)&&picked.has(m.user_id)&&m.unit_id!==unitId).map(m=><label key={m.id} className="flex gap-2 py-2 text-sm"><Checkbox checked={sourceIds.includes(m.id)} onCheckedChange={v=>setSourceIds(ids=>v===true?[...ids,m.id]:ids.filter(id=>id!==m.id))} />{nameOf(m.user_id)} · {config.units.find(u=>u.id===m.unit_id)?.name} · {titleOf(m.title_id)?.name ?? m.category}</label>)}</div>
                {preview.ending.length > 0 && (
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">Phân công sẽ kết thúc:</p>
                    {preview.ending.map(m => <p key={m.id} className="text-muted-foreground">{nameOf(m.user_id)} — {titleOf(m.title_id)?.name ?? 'Chưa có chức danh'} · {config.units.find(u => u.id === m.unit_id)?.name}</p>)}
                  </div>
                )}
                {preview.endedManagers.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-destructive/40 p-3 text-sm">
                    <p className="font-medium text-destructive">Cảnh báo: điều chuyển sẽ kết thúc vị trí quản lý</p>
                    {preview.endedManagers.map(m => <p key={m.id}>{nameOf(m.user_id)} — {titleOf(m.title_id)?.name} · {config.units.find(u => u.id === m.unit_id)?.name}</p>)}
                    <label className="flex items-center gap-2">
                      <Checkbox checked={confirmManagerEnd} onCheckedChange={v => setConfirmManagerEnd(v === true)} aria-label="Xác nhận kết thúc vị trí quản lý" />
                      Tôi xác nhận kết thúc các vị trí quản lý trên
                    </label>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('pick')}>Quay lại</Button>
                  <Button disabled={!sourceIds.length || !moveTitle || (preview.endedManagers.length > 0 && !confirmManagerEnd)} onClick={doTransfer}>Đưa vào thay đổi</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bổ nhiệm/thay đổi người phụ trách: ô một người, xem trước người cũ kết thúc nhiệm kỳ */}
        <Dialog open={!!appointing} onOpenChange={v => !v && setAppointing('')}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{slotHolders(config, unitId, appointing).length ? 'Thay đổi người phụ trách' : 'Bổ nhiệm người phụ trách'}</DialogTitle></DialogHeader>
            {(() => {
              const t = titleOf(appointing);
              const holders = slotHolders(config, unitId, appointing);
              if (!t) return null;
              return (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t.name} · Cấp {titleLevel(t)} · vị trí một người</p>
                  {holders.length > 0 && <p className="rounded-lg border p-2 text-sm">Người đang giữ: {holders.map(h => nameOf(h.user_id)).join(', ')} — sẽ kết thúc nhiệm kỳ khi bổ nhiệm người mới. Lịch sử được giữ nguyên.</p>}
                  <div className="space-y-1.5">
                    <Label>Nhân sự</Label>
                    <Select value={appointUser} onValueChange={setAppointUser}>
                      <SelectTrigger aria-label="Nhân sự bổ nhiệm"><SelectValue placeholder="Chọn nhân sự" /></SelectTrigger>
                      <SelectContent>{staff.filter(s => s.status === 'Đang hoạt động').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <AppointmentPermissionSummary titleId={appointing} config={config} />
                  <Label>Ngày hiệu lực</Label><Input aria-label="Ngày hiệu lực bổ nhiệm" type="datetime-local" value={effectiveAt} onChange={e=>setEffectiveAt(e.target.value)} /><Button disabled={!appointUser} onClick={() => { onEdit(c => { const next = assignSlot(c, unitId, appointing, appointUser); if (!effectiveAt) return next; const at = new Date(effectiveAt).toISOString(); return { ...next, memberships: next.memberships.map(m => c.memberships.some(old=>old.id===m.id&&old.ends_at!==m.ends_at) ? { ...m, ends_at:at, active:true } : !c.memberships.some(old=>old.id===m.id) ? { ...m, starts_at:at } : m) }; }); setAppointing(''); }}>Đưa vào thay đổi</Button>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

function titleHoldersCount(config: OrgConfig, titleId: string): number {
  return new Set(config.memberships.filter(m => membershipEffective(m) && m.title_id === titleId).map(m => m.user_id)).size;
}
