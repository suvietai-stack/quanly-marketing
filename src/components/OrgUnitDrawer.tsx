import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useCurrentUser } from '@/lib/auth';
import { k3HubAccess } from '@/lib/k3Hub/api';
import { missingCenterPositions } from '@/lib/basePermissions/centerPositions';
import { TitleRoleDefaults } from '@/components/TitleRoleDefaults';
import { ArrowRightLeft, History, Plus, UserPlus, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Membership, OrgActor, OrgConfig } from '@/lib/basePermissions/types';
import { membershipEffective, membershipKind, slotCapacity, slotHolders, titleKind, titleLevel, unitDescendants, unitPath, unitTitles } from '@/lib/orgStructure';

interface Staff { id: string; name: string; status: string }

interface DrawerProps {
  unitId: string;
  config: OrgConfig;
  staff: Staff[];
  actor: OrgActor;
  onAppoint: (titleId?: string, mode?: 'primary' | 'concurrent' | 'transfer') => void;
  onEnd: (id:string)=>void;
  onSetupCenterRoles?: (unitId: string) => void;
  onEdit: (fn: (c: OrgConfig) => OrgConfig) => void;
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

/** Drawer quản lý một đơn vị: Nhân sự / Chức vụ & Cấp bậc / Phân quyền / Lịch sử / Cài đặt đơn vị. */
export function OrgUnitDrawer({ unitId, config, staff, actor, onAppoint, onEdit, onEnd, onSetupCenterRoles, onClose }: DrawerProps) {
  const { user } = useCurrentUser();
  const unit = config.units.find(u => u.id === unitId);
  const k3Access = useQuery({
    queryKey: ['k3hub-access',user?.id],
    queryFn: k3HubAccess,
    enabled: !!user && user.status === 'Đang hoạt động',
    staleTime: 30000,
  });
  const hasUnitK3 = k3Access.data?.units.some(x=>x.id===unitId) ?? false;
  const [titleName,setTitleName]=useState('');
  const [titleKindNew,setTitleKindNew]=useState<'staff'|'manager'>('staff');
  const [childName,setChildName]=useState('');
  const [childKind,setChildKind]=useState<'system'|'department'|'team'>('department');
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
        <Button size="sm" variant="ghost" aria-label={`Kết thúc phân công ${nameOf(m.user_id)}`} onClick={() => onEnd(m.id)}>
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
          {hasUnitK3 && <Button asChild variant="outline" size="sm" className="w-fit mt-2">
            <Link to="/k3/unit/$unit" params={{ unit: unitId }} onClick={onClose}>
              <span className="mr-1.5">3K đơn vị</span> <ArrowRightLeft className="h-4 w-4" />
            </Link>
          </Button>}
        </SheetHeader>
        <Tabs defaultValue="staff" className="mt-4">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="staff">Nhân sự</TabsTrigger>
            <TabsTrigger value="titles">Chức vụ & Cấp bậc</TabsTrigger>
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
                      <Button size="sm" variant="outline" onClick={() => onAppoint(t.id)}>
                        <UserPlus className="mr-1.5 h-4 w-4" />{holders.length ? 'Thay đổi' : 'Bổ nhiệm'}
                      </Button>
                    )}
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">Đơn vị chưa có vị trí quản lý đơn nhiệm.</p>}
            </div>
            {canAssign && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onAppoint()}><Plus className="mr-1.5 h-4 w-4" />Thêm nhân sự</Button>
                <Button size="sm" variant="outline" onClick={() => onAppoint(undefined,'transfer')}><ArrowRightLeft className="mr-1.5 h-4 w-4" />Điều chuyển nhân sự</Button>
              </div>
            )}
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Users className="h-3.5 w-3.5" />Danh sách nhân sự</p>
              {memberships.length ? memberships.map(personLine) : <p className="py-4 text-sm text-muted-foreground">Chưa có nhân sự.</p>}
            </div>
          </TabsContent>

          <TabsContent value="titles" className="space-y-3 pt-3">
            {actor.super && missingCenterPositions(config, unitId) && onSetupCenterRoles && (
              <div className="border-b pb-3 space-y-2">
                <p className="text-sm font-semibold">Ô vị trí theo Role</p>
                <p className="text-xs text-muted-foreground">Chỉ thêm vị trí trống đúng cấp. Giữ Role và bổ nhiệm hiện hữu; không tự chuyển người từ Role Sales.</p>
                <Button size="sm" className="h-auto whitespace-normal text-left" onClick={() => onSetupCenterRoles(unitId)}>Xem trước vị trí &amp; Role trung tâm</Button>
              </div>
            )}
            {rights.structure && <div className="space-y-2 border-b pb-3"><Label>Chức vụ mới tại {unit.name}</Label><Input aria-label="Tên chức vụ mới" value={titleName} onChange={e=>setTitleName(e.target.value)} /><Select value={titleKindNew} onValueChange={v=>setTitleKindNew(v as 'staff'|'manager')}><SelectTrigger aria-label="Loại chức vụ mới"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="staff">Nhân viên</SelectItem><SelectItem value="manager">Quản lý</SelectItem></SelectContent></Select><Button disabled={!titleName.trim()} onClick={()=>{onEdit(c=>({...c,titles:[...c.titles,{id:crypto.randomUUID(),unit_id:unitId,name:titleName.trim(),kind:titleKindNew,capacity:titleKindNew==='manager'?1:0,level:titleKindNew==='manager'?(unit.kind==='team'?1:2):0,active:true}]}));setTitleName('');}}><Plus className="mr-2 h-4 w-4" />Thêm chức vụ</Button></div>}
            {titles.map(t => (
              <div key={t.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  {rights.structure ? <Input aria-label={`Tên chức vụ ${t.name}`} value={t.name} onChange={e=>onEdit(c=>({...c,titles:c.titles.map(x=>x.id===t.id?{...x,name:e.target.value}:x)}))} /> : t.name}
                  <Badge variant="outline" className="text-[10px] font-normal">Cấp {titleLevel(t)}</Badge>
                  <Badge variant="secondary" className="text-[10px] font-normal">{titleKind(t) === 'manager' ? 'Quản lý' : 'Nhân viên'}</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">{slotCapacity(t) === 1 ? 'Một người' : slotCapacity(t) > 1 ? `Tối đa ${slotCapacity(t)}` : 'Nhiều người'}</Badge>
                </div>
                {rights.structure && <div className="grid grid-cols-2 gap-2 mt-2"><div><Label>Cấp bậc</Label><Input type="number" min={0} max={5} aria-label={`Cấp bậc ${t.name}`} value={t.level??0} onChange={e=>onEdit(c=>({...c,titles:c.titles.map(x=>x.id===t.id?{...x,level:Math.min(5,Math.max(0,Number(e.target.value)))}:x)}))} /></div><div><Label>Số người tối đa</Label><Input type="number" min={t.kind==='manager'?1:0} aria-label={`Số người ${t.name}`} value={t.capacity??0} disabled={t.kind==='manager'} onChange={e=>onEdit(c=>({...c,titles:c.titles.map(x=>x.id===t.id?{...x,capacity:Math.max(0,Number(e.target.value))}:x)}))} /></div></div>}
                {actor.super && <details className="mt-2"><summary className="text-xs cursor-pointer">Liên kết Role</summary><TitleRoleDefaults disabled={!t.active} source={t.source==='biz_positions'?'biz':'base'} titleId={t.id} titleName={t.name} stagedLinks={config.role_links??[]} onStage={links=>onEdit(c=>({...c,role_links:[...(c.role_links??[]).filter(l=>l.title_id!==t.id),...links]}))} /></details>}{rights.structure && <Button size="sm" variant="ghost" onClick={()=>onEdit(c=>({...c,titles:c.titles.map(x=>x.id===t.id?{...x,active:!x.active}:x)}))}>{t.active?'Ngừng chức vụ':'Kích hoạt'}</Button>}
                {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Đang giữ: {titleHoldersCount(config, t.id)} người</p>{(canAssign || canAppoint) && <Button size="sm" variant="outline" className="mt-2" onClick={()=>onAppoint(t.id)}>Bổ nhiệm / Thêm nhân sự</Button>}
              </div>
            ))}
            {!titles.length && <p className="py-4 text-sm text-muted-foreground">Chưa có chức vụ.</p>}
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
                <div className="space-y-2 border-t pt-3"><Label>Đơn vị con</Label><Input aria-label="Tên đơn vị con" value={childName} onChange={e=>setChildName(e.target.value)} /><Select value={childKind} onValueChange={v=>setChildKind(v as typeof childKind)}><SelectTrigger aria-label="Loại đơn vị con"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="system">Hệ</SelectItem><SelectItem value="department">Phòng</SelectItem><SelectItem value="team">Nhóm</SelectItem></SelectContent></Select><Button disabled={!childName.trim()} onClick={()=>{onEdit(c=>({...c,units:[...c.units,{id:crypto.randomUUID(),parent_id:unitId,name:childName.trim(),kind:childKind,active:true}]}));setChildName('');}}><Plus className="mr-2 h-4 w-4" />Thêm đơn vị con</Button></div>
                <p className="text-xs text-muted-foreground">Ngừng đơn vị không xóa nhân sự hay lịch sử.</p>
              </>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">Chỉ Super Admin được sửa cấu trúc đơn vị.</p>
            )}
          </TabsContent>
        </Tabs>

      </SheetContent>
    </Sheet>
  );
}

function titleHoldersCount(config: OrgConfig, titleId: string): number {
  return new Set(config.memberships.filter(m => membershipEffective(m) && m.title_id === titleId).map(m => m.user_id)).size;
}
