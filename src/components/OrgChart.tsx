import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, History, MoreVertical, Search, Settings2, UserMinus, UserPlus, Users } from 'lucide-react';
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
    <Button variant="ghost" className="h-auto w-full justify-start px-2 py-1 text-left whitespace-normal" onClick={() => onOpen(person)}>
      <span className="min-w-0">
        <span className="block truncate text-sm">{person.name}</span>
        {person.title && <span className="block truncate text-xs text-muted-foreground">{person.title}</span>}
      </span>
    </Button>
  );
}

/** Một ô chức danh trong thẻ đơn vị: luôn hiển thị, kể cả khi chưa có người. */
function SlotRow({ unitId, unitName, slot, query, actions, onOpen }: { unitId: string; unitName: string; slot: ChartSlot; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void }) {
  const q = query.trim().toLocaleLowerCase('vi');
  const holders = q ? slot.holders.filter(p => p.name.toLocaleLowerCase('vi').includes(q)) : slot.holders;
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
          ? holders.map(p => (
            <Button key={p.id} variant="link" className="h-auto p-0 text-sm whitespace-normal" onClick={() => onOpen(p)}>{p.name}</Button>
          ))
          : <p className="text-xs italic text-muted-foreground">{slot.manager ? 'Chưa bổ nhiệm' : 'Chưa có nhân sự'}</p>}
      </div>
      {actions.canManage && (actions.onAssign || actions.onUnassign || actions.onSlotHistory) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={`Thao tác ${slot.title}`}><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.onAssign && (
              <DropdownMenuItem onClick={() => actions.onAssign?.(ref)}>
                <UserPlus className="h-4 w-4 mr-2" />{slot.manager && slot.holders.length ? 'Đổi người' : 'Bổ nhiệm / Thêm nhân sự'}
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
function UnitCard({ node, query, actions, onOpen, open, onToggle }: { node: ChartNode; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void; open: boolean; onToggle: () => void }) {
  const count = countPeople(node);
  const tone = toneClass[blockTone(node.name)];
  const people = query.trim() ? node.people.filter(p => p.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))) : node.people;
  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-xl border bg-card shadow-card">
      <div className={`flex items-center justify-between gap-2 px-3 py-2 ${tone}`}>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{node.name} {node.inactive && <Badge variant="secondary">Ngừng</Badge>}</p>
          <p className="text-[11px] opacity-80">{KIND_LABELS[node.kind] ?? node.kind} · {count} nhân sự</p>
        </div>
        <span className="flex shrink-0 items-center gap-1">
          {actions.canManage && actions.onManageUnit && (
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-black/10" aria-label={`Quản lý ${node.name}`} onClick={() => actions.onManageUnit?.(node)}>
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-black/10" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${node.name}`} aria-expanded={open} onClick={onToggle}>
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

/** Nhánh sơ đồ: thẻ đơn vị + đường nối xuống các đơn vị con. */
function Branch({ node, depth, query, actions, onOpen }: { node: ChartNode; depth: number; query: string; actions: ChartActions; onOpen: (p: ChartPerson) => void }) {
  const [open, setOpen] = useState(depth < 2);
  if (!nodeMatches(node, query)) return null;
  const children = node.children.filter(c => nodeMatches(c, query));
  return (
    <div className="flex flex-col items-center">
      <UnitCard node={node} query={query} actions={actions} onOpen={onOpen} open={open} onToggle={() => setOpen(!open)} />
      {open && children.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" aria-hidden />
          <div className="flex items-start gap-4">
            {children.map((c, i) => (
              <div key={c.id} className="relative flex flex-col items-center pt-6">
                {/* đường ngang nối giữa các nhánh con */}
                {children.length > 1 && (
                  <>
                    {i > 0 && <div className="absolute top-0 left-0 right-1/2 h-px bg-border" aria-hidden />}
                    {i < children.length - 1 && <div className="absolute top-0 left-1/2 right-0 h-px bg-border" aria-hidden />}
                  </>
                )}
                <div className="absolute top-0 left-1/2 h-6 w-px bg-border" aria-hidden />
                <Branch node={c} depth={depth + 1} query={query} actions={actions} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart({ config, staff, canManage, onOpenStaff, onAssign, onUnassign, onSlotHistory, onManageUnit, serverNow }: {
  config: OrgConfig; staff: { id: string; name: string }[]; serverNow?: string;
} & ChartActions) {
  const [query, setQuery] = useState('');
  const [person, setPerson] = useState<ChartPerson | null>(null);
  const actions: ChartActions = { canManage, onOpenStaff, onAssign, onUnassign, onSlotHistory, onManageUnit };
  const roots = useMemo(() => buildOrganizationTree(config, staff, serverNow), [config, staff, serverNow]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm nhân sự hoặc đơn vị" placeholder="Tìm nhân sự, đơn vị, chức danh…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-sm" /></div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-start justify-center gap-6 px-4">
          {roots.map(node => <Branch key={node.id} node={node} depth={0} query={query} actions={actions} onOpen={setPerson} />)}
        </div>
      </div>
      {config.units.some(u => u.kind === 'department' && !u.parent_id) && <p className="text-sm text-warning">Chưa xác định đơn vị cha</p>}
      {!roots.length && <p className="text-muted-foreground">Chưa có cơ cấu tổ chức.</p>}
      <Dialog open={!!person} onOpenChange={v => !v && setPerson(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{person?.name}</DialogTitle></DialogHeader><p>{person?.title ?? 'Chưa có chức danh'}</p><p className="text-sm text-muted-foreground">{person?.duties}</p>{person && onOpenStaff && <Button onClick={() => { onOpenStaff(person.id); setPerson(null); }}>Xem quyền & phân công</Button>}</DialogContent></Dialog>
    </div>
  );
}
