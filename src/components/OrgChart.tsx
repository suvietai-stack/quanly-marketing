import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, History, ListTree, Network, MoreVertical, Search, Settings2, UserMinus, UserPlus, Users } from 'lucide-react';
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

const KIND_LABELS: Record<string, string> = {
  company: 'Công ty', block: 'Khối', system: 'Hệ', department: 'Phòng', team: 'Nhóm',
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
    <Button variant="ghost" className="min-h-11 h-auto w-full justify-start px-2 py-1 text-left whitespace-normal" onClick={() => onOpen(person)}>
      <span className="min-w-0">
        <span className="block break-words text-sm">{person.name}</span>
        {person.title && <span className="block break-words text-xs text-muted-foreground">{person.title}</span>}
      </span>
    </Button>
  );
}

/** Một ô chức danh trong thẻ đơn vị: luôn hiển thị, kể cả khi chưa có người. */
function SlotRow({ unitId, unitName, slot, query, actions, onOpen }: { unitId: string; unitName: string; slot: ChartSlot; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void }) {
  const q = query.trim().toLocaleLowerCase('vi');
  const holders = q && !slot.title.toLocaleLowerCase('vi').includes(q) ? slot.holders.filter(p => p.name.toLocaleLowerCase('vi').includes(q)) : slot.holders;
  if (q && !slot.title.toLocaleLowerCase('vi').includes(q) && !holders.length) return null;
  const ref: SlotRef = { unitId, unitName, slot };
  return (
    <div className="flex items-start gap-1 rounded-md px-2 py-1.5 hover:bg-muted/40">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium break-words">
          {slot.title}
          <Badge variant="outline" className="text-[10px] font-normal">Cấp {slot.level}</Badge>
          {slot.manager && <Badge variant="secondary" className="text-[10px] font-normal">Quản lý</Badge>}
        </div>
        {holders.length > 0
          ? <ul className="space-y-1">{holders.map(p => (
            <li key={p.id}><Button variant="link" className="min-h-9 h-auto max-w-full justify-start p-0 text-left text-sm whitespace-normal break-words" onClick={() => onOpen(p)}>{p.name}</Button></li>
          ))}</ul>
          : <p className="text-xs italic text-muted-foreground">{slot.manager ? 'Chưa bổ nhiệm' : 'Chưa có nhân sự'}</p>}
      </div>
      {actions.canManage && (actions.onAssign || actions.onUnassign || actions.onSlotHistory) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8 shrink-0" aria-label={`Thao tác ${slot.title}`}><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.onAssign && (
              <DropdownMenuItem onClick={() => actions.onAssign?.(ref)}>
                <UserPlus className="h-4 w-4 mr-2" />Bổ nhiệm / Thêm nhân sự
              </DropdownMenuItem>
            )}
            {actions.onUnassign && slot.holders.map(p => (
              <DropdownMenuItem key={p.id} onClick={() => actions.onUnassign?.(ref, p)}>
                <UserMinus className="h-4 w-4 mr-2" />Miễn nhiệm {p.name}
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

/** Thẻ đơn vị trên sơ đồ: tên, cấp, số nhân sự, chức vụ và người đảm nhiệm. */
function UnitCard({ node, query, actions, onOpen, open, onToggle, horizontal }: { horizontal: boolean; node: ChartNode; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void; open: boolean; onToggle: () => void }) {
  const count = countPeople(node);
  const tone = toneClass[blockTone(node.name)];
  const people = query.trim() ? node.people.filter(p => p.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))) : node.people;
  return (
    <div className={`${horizontal ? 'w-72 shrink-0' : 'w-full min-w-0'} overflow-hidden rounded-xl border bg-card shadow-card`}>
      <div className={`flex items-center justify-between gap-2 px-3 py-2 ${tone}`}>
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold">{node.name} {node.inactive && <Badge variant="secondary">Ngừng</Badge>}</p>
          <p className="text-[11px] opacity-80">{KIND_LABELS[node.kind] ?? node.kind} · {count} nhân sự trong nhánh{node.children.length > 0 ? ` · ${node.children.length} đơn vị trực thuộc` : ''}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1">
          {actions.canManage && actions.onManageUnit && (
            <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8 hover:bg-black/10" aria-label={`Quản lý ${node.name}`} onClick={() => actions.onManageUnit?.(node)}>
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8 hover:bg-black/10" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${node.name}`} aria-expanded={open} onClick={onToggle}>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </span>
      </div>
      {open && (
        <div className="space-y-0.5 px-1.5 py-2">
          {(node.slots ?? []).map(s => <SlotRow key={s.id} unitId={node.id} unitName={node.name} slot={s} query={query} actions={actions} onOpen={onOpen} />)}
          {people.map(p => <PersonButton key={p.id} person={p} onOpen={onOpen} />)}
          {!people.length && !(node.slots ?? []).length && <p className="px-2 py-1 text-xs text-muted-foreground">Chưa có nhân sự.</p>}
        </div>
      )}
    </div>
  );
}

/** Cây dọc vừa màn hình; chế độ ngang dành cho màn hình rộng. */
function Branch({ node, depth, query, actions, onOpen, horizontal, expanded, onToggle }: {
  node: ChartNode; depth: number; query: string; actions: ChartActions;
  onOpen: (p: ChartPerson) => void; horizontal: boolean;
  expanded: Record<string, boolean>; onToggle: (id: string, current: boolean) => void;
}) {
  if (!nodeMatches(node, query)) return null;
  const open = query.trim() ? true : (expanded[node.id] ?? depth < 2);
  const ownMatch = !!query.trim() && node.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'));
  const childQuery = ownMatch ? '' : query;
  const children = node.children.filter(c => nodeMatches(c, childQuery));
  return (
    <div className={horizontal ? 'flex flex-col items-center' : 'min-w-0'}>
      <UnitCard node={node} query={ownMatch ? '' : query} actions={actions} onOpen={onOpen}
        horizontal={horizontal} open={open} onToggle={() => onToggle(node.id, open)} />
      {open && children.length > 0 && (horizontal ? <>
        <div className="h-6 w-px bg-border" aria-hidden />
        <div className="flex items-start gap-4">
          {children.map((c, i) => <div key={c.id} className="relative flex flex-col items-center pt-6">
            {children.length > 1 && <>
              {i > 0 && <div className="absolute top-0 left-0 right-1/2 h-px bg-border" aria-hidden />}
              {i < children.length - 1 && <div className="absolute top-0 left-1/2 right-0 h-px bg-border" aria-hidden />}
            </>}
            <div className="absolute top-0 left-1/2 h-6 w-px bg-border" aria-hidden />
            <Branch node={c} depth={depth + 1} query={childQuery} actions={actions} onOpen={onOpen}
              horizontal={horizontal} expanded={expanded} onToggle={onToggle} />
          </div>)}
        </div>
      </> : <div className="ml-2 mt-3 space-y-3 border-l-2 border-border pl-3 sm:ml-5 sm:pl-5">
        {children.map(c => <div key={c.id} className="relative min-w-0 before:absolute before:-left-3 before:top-6 before:h-px before:w-3 before:bg-border sm:before:-left-5 sm:before:w-5">
          <Branch node={c} depth={depth + 1} query={childQuery} actions={actions} onOpen={onOpen}
            horizontal={false} expanded={expanded} onToggle={onToggle} />
        </div>)}
      </div>)}
    </div>
  );
}

export function OrgChart({ config, staff, canManage, onOpenStaff, onAssign, onUnassign, onSlotHistory, onManageUnit, serverNow }: {
  config: OrgConfig; staff: { id: string; name: string }[]; serverNow?: string;
} & ChartActions) {
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState<'tree' | 'chart'>('tree');
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setWide(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [person, setPerson] = useState<ChartPerson | null>(null);
  const actions: ChartActions = { canManage, onOpenStaff, onAssign, onUnassign, onSlotHistory, onManageUnit };
  const roots = useMemo(() => buildOrganizationTree(config, staff, serverNow), [config, staff, serverNow]);
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 lg:w-96">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Tìm nhân sự hoặc đơn vị" placeholder="Tìm nhân sự, đơn vị, chức danh…" value={query} onChange={e => setQuery(e.target.value)} className="h-11 pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden lg:flex gap-1 rounded-lg border p-1" aria-label="Cách hiển thị">
            <Button size="sm" variant={layout === 'tree' ? 'secondary' : 'ghost'} aria-pressed={layout === 'tree'} onClick={() => setLayout('tree')}><ListTree className="mr-2 size-4" />Cây dọc</Button>
            <Button size="sm" variant={layout === 'chart' ? 'secondary' : 'ghost'} aria-pressed={layout === 'chart'} onClick={() => setLayout('chart')}><Network className="mr-2 size-4" />Sơ đồ ngang</Button>
          </div>
          <Button variant="outline" className="min-h-11" disabled={!!query.trim()} onClick={() => setExpanded(Object.fromEntries(config.units.map(u => [u.id, true])))}>Mở tất cả</Button>
          <Button variant="outline" className="min-h-11" disabled={!!query.trim()} onClick={() => setExpanded(Object.fromEntries(config.units.map(u => [u.id, false])))}>Thu gọn</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Theo dõi từ công ty đến phòng, nhóm. Chạm mũi tên để mở nhánh; chạm tên nhân sự để xem chi tiết.{query.trim() && ' Các nhánh phù hợp đang được tự động mở.'}</p>
      {([wide && layout === 'chart' ? 'chart' : 'tree'] as const).map(mode => <div key={mode} className={mode === 'chart' ? (layout === 'chart' ? 'hidden lg:block max-w-full overflow-x-auto rounded-xl border bg-muted/20 p-6' : 'hidden') : (layout === 'chart' ? 'lg:hidden' : '')}>
        <div className={mode === 'chart' ? 'flex w-max min-w-full items-start justify-center gap-6' : 'space-y-4'}>
          {roots.map(node => <Branch key={node.id} node={node} depth={0} query={query} actions={actions} onOpen={setPerson}
            horizontal={mode === 'chart'} expanded={expanded} onToggle={(id, current) => setExpanded(previous => ({ ...previous, [id]: !current }))} />)}
        </div>
      </div>)}
      {query.trim() && roots.length > 0 && !roots.some(node => nodeMatches(node, query)) && <p role="status" className="rounded-xl border p-6 text-center text-muted-foreground">Không tìm thấy nhân sự, đơn vị hoặc chức danh phù hợp.</p>}
      {config.units.some(u => u.kind === 'department' && !u.parent_id) && <p className="text-sm text-warning">Chưa xác định đơn vị cha</p>}
      {!roots.length && <p className="text-muted-foreground">Chưa có cơ cấu tổ chức.</p>}
      <Dialog open={!!person} onOpenChange={v => !v && setPerson(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{person?.name}</DialogTitle></DialogHeader><p>{person?.title ?? 'Chưa có chức danh'}</p><p className="text-sm text-muted-foreground">{person?.duties}</p>{person && onOpenStaff && <Button onClick={() => { onOpenStaff(person.id); setPerson(null); }}>Xem quyền & phân công</Button>}</DialogContent></Dialog>
    </div>
  );
}
