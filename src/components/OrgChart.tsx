import { useMemo, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Crown, History, MoreVertical, Search, Settings2, UserMinus, UserPlus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { OrgConfig } from '@/lib/basePermissions/types';
import { blockTone, buildOrganizationTree, countPeople, nodeMatches, type ChartNode, type ChartPerson, type ChartSlot } from '@/lib/orgChart';

const toneClass: Record<string, string> = {
  biz: 'bg-chart-biz text-chart-biz-foreground',
  marketing: 'bg-chart-marketing text-chart-marketing-foreground',
  ops: 'bg-chart-ops text-chart-ops-foreground',
  other: 'bg-secondary text-secondary-foreground',
};

export interface SlotRef { unitId: string; unitName: string; slot: ChartSlot }

interface ChartActions {
  canManage?: boolean;
  onOpenStaff?: (userId: string) => void;
  onAssign?: (ref: SlotRef) => void;
  onUnassign?: (ref: SlotRef, person: ChartPerson) => void;
  onSlotHistory?: (ref: SlotRef) => void;
  onBizAppoint?: (node: ChartNode) => void;
  onBizHistory?: (node: ChartNode) => void;
  onManageUnit?: (node: ChartNode) => void;
}

function PersonButton({ person, onOpen }: { person: ChartPerson; onOpen: (p: ChartPerson) => void }) {
  return (
    <Button variant="ghost" className="h-auto w-full justify-start px-2 py-1.5 text-left whitespace-normal" onClick={() => onOpen(person)}>
      <span className="min-w-0">
        <span className="block truncate text-sm">{person.name}</span>
        {person.title && <span className="block truncate text-xs text-muted-foreground">{person.title}</span>}
      </span>
    </Button>
  );
}

/** Một ô chức danh: luôn hiển thị, kể cả khi chưa có người; thao tác gọn trong menu nhỏ. */
function SlotRow({ unitId, unitName, slot, query, actions, onOpen }: { unitId: string; unitName: string; slot: ChartSlot; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void }) {
  const q = query.trim().toLocaleLowerCase('vi');
  const holders = q ? slot.holders.filter(p => p.name.toLocaleLowerCase('vi').includes(q)) : slot.holders;
  if (q && !slot.title.toLocaleLowerCase('vi').includes(q) && !holders.length) return null;
  const ref: SlotRef = { unitId, unitName, slot };
  return (
    <div className="flex items-start gap-1 rounded-lg px-2 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium break-words">
          {slot.title}
          <Badge variant="outline" className="text-[10px] font-normal">Cấp {slot.level}</Badge>
          {slot.manager && <Badge variant="secondary" className="text-[10px] font-normal">Quản lý</Badge>}
        </p>
        {holders.length > 0
          ? holders.map(p => (
            <Button key={p.id} variant="link" className="h-auto p-0 text-sm whitespace-normal" onClick={() => onOpen(p)}>{p.name}</Button>
          ))
          : <p className="text-xs text-muted-foreground">{slot.manager ? 'Chưa phân công' : 'Chưa có nhân sự'}</p>}
      </div>
      {actions.canManage && (actions.onAssign || actions.onUnassign || actions.onSlotHistory) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={`Thao tác ${slot.title}`}><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.onAssign && (
              <DropdownMenuItem onClick={() => actions.onAssign?.(ref)}>
                <UserPlus className="h-4 w-4 mr-2" />{slot.manager && slot.holders.length ? 'Đổi người' : 'Gán người'}
              </DropdownMenuItem>
            )}
            {actions.onUnassign && slot.holders.map(p => (
              <DropdownMenuItem key={p.id} onClick={() => actions.onUnassign?.(ref, p)}>
                <UserMinus className="h-4 w-4 mr-2" />Bỏ gán {p.name}
              </DropdownMenuItem>
            ))}
            {actions.onSlotHistory && (
              <DropdownMenuItem onClick={() => actions.onSlotHistory?.(ref)}>
                <History className="h-4 w-4 mr-2" />Xem lịch sử
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function Branch({ node, depth, query, actions, onOpen }: { node: ChartNode; depth: number; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void }) {
  const [open, setOpen] = useState(depth < 2);
  if (!nodeMatches(node, query)) return null;
  const children = node.children.filter(c => nodeMatches(c, query));
  const people = query.trim() ? node.people.filter(p => p.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))) : node.people;
  const count = countPeople(node);
  return (
    <div className={depth > 0 ? 'ml-2 border-l border-border pl-2 pt-2' : 'pt-2'}>
      <div className="flex items-start gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${node.name}`} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold break-words">
            {node.name} {node.inactive && <Badge variant="secondary">Ngừng</Badge>}
            {count > 0 && <span className="ml-1 text-xs font-normal text-muted-foreground">· {count} nhân sự</span>}
          </p>
        </div>
        {actions.canManage && actions.onManageUnit && (
          <Button variant="outline" size="sm" className="mt-0.5 h-7 shrink-0" aria-label={`Quản lý ${node.name}`} onClick={() => actions.onManageUnit?.(node)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" />Quản lý
          </Button>
        )}
      </div>
      {open && (
        <div className="ml-4 space-y-0.5 pt-1">
          {(node.slots ?? []).map(s => <SlotRow key={s.id} unitId={node.id} unitName={node.name} slot={s} query={query} actions={actions} onOpen={onOpen} />)}
          {people.map(p => <PersonButton key={p.id} person={p} onOpen={onOpen} />)}
          {children.map(c => <Branch key={c.id} node={c} depth={depth + 1} query={query} actions={actions} onOpen={onOpen} />)}
          {!people.length && !children.length && !(node.slots ?? []).length && !node.leaderLabel && <p className="px-2 py-1 text-xs text-muted-foreground">Chưa có nhân sự.</p>}
        </div>
      )}
    </div>
  );
}

function BlockCard({ node, query, actions, onOpen }: { node: ChartNode; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void }) {
  const [open, setOpen] = useState(true);
  if (!nodeMatches(node, query)) return null;
  const tone = toneClass[blockTone(node.name)];
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-card">
      <header className={`flex items-center justify-between gap-2 px-4 py-3 ${tone}`}>
        <h3 className="font-semibold break-words">{node.name}</h3>
        <span className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1 text-xs"><Users className="h-3.5 w-3.5" />{countPeople(node)}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-transparent" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${node.name}`} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </span>
      </header>
      {open && (
        <div className="px-2 pb-3">
          {node.people.length > 0 && <div className="px-2 pt-2">{node.people.map(p => <PersonButton key={p.id} person={p} onOpen={onOpen} />)}</div>}
          {node.children.map(c => <Branch key={c.id} node={c} depth={1} query={query} actions={actions} onOpen={onOpen} />)}
          {!node.children.length && !node.people.length && <p className="px-3 py-3 text-sm text-muted-foreground">Chưa cấu hình đơn vị — thêm tại Cài đặt.</p>}
        </div>
      )}
    </section>
  );
}

export function OrgChart({ config, staff, canManage, onOpenStaff, onAssign, onUnassign, onSlotHistory, onManageUnit, serverNow }: {
  config: OrgConfig; staff: { id: string; name: string }[]; serverNow?: string;
} & ChartActions) {
  const [query,setQuery] = useState('');
  const [person,setPerson] = useState<ChartPerson | null>(null);
  const actions: ChartActions = { canManage,onOpenStaff,onAssign,onUnassign,onSlotHistory,onManageUnit };
  const roots = useMemo(() => buildOrganizationTree(config,staff,serverNow),[config,staff,serverNow]);
  return <div className="space-y-4">
    <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm nhân sự hoặc đơn vị" placeholder="Tìm nhân sự, đơn vị, chức danh…" value={query} onChange={e=>setQuery(e.target.value)} className="sm:max-w-sm" /></div>
    <div className="space-y-4">{roots.map(node=><Branch key={node.id} node={node} depth={0} query={query} actions={actions} onOpen={setPerson} />)}</div>
    {config.units.some(u=>u.kind==='department'&&!u.parent_id) && <p className="text-sm text-warning">Chưa xác định đơn vị cha</p>}
    {!roots.length && <p className="text-muted-foreground">Chưa có cơ cấu tổ chức.</p>}
    <Dialog open={!!person} onOpenChange={v=>!v&&setPerson(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{person?.name}</DialogTitle></DialogHeader><p>{person?.title??'Chưa có chức danh'}</p><p className="text-sm text-muted-foreground">{person?.duties}</p>{person&&onOpenStaff&&<Button onClick={()=>{onOpenStaff(person.id);setPerson(null);}}>Xem quyền & phân công</Button>}</DialogContent></Dialog>
  </div>;
}
