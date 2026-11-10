import { useMemo, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Crown, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { OrgConfig } from '@/lib/basePermissions/types';
import type { OrgData } from '@/lib/biz/organization';
import type { PositionsData } from '@/lib/biz/positions';
import { blockTone, buildBaseBlocks, buildBizBlock, countPeople, executiveSlots, nodeMatches, type ChartNode, type ChartPerson } from '@/lib/orgChart';

const toneClass: Record<string, string> = {
  biz: 'bg-chart-biz text-chart-biz-foreground',
  marketing: 'bg-chart-marketing text-chart-marketing-foreground',
  ops: 'bg-chart-ops text-chart-ops-foreground',
  other: 'bg-secondary text-secondary-foreground',
};

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

function Branch({ node, depth, query, onOpen }: { node: ChartNode; depth: number; query: string; onOpen: (p: ChartPerson) => void }) {
  const [open, setOpen] = useState(depth < 2);
  if (!nodeMatches(node, query)) return null;
  const children = node.children.filter(c => nodeMatches(c, query));
  const people = query.trim() ? node.people.filter(p => p.name.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))) : node.people;
  const count = countPeople(node);
  return (
    <div className={depth > 0 ? 'ml-3 border-l border-border pl-3 pt-2' : 'pt-2'}>
      <div className="flex items-start gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${node.name}`} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold break-words">
            {node.name} {node.inactive && <Badge variant="secondary">Ngừng</Badge>}
            {count > 0 && <span className="ml-1 text-xs font-normal text-muted-foreground">· {count} nhân sự</span>}
          </p>
          {node.leader && (
            <p className="text-xs text-muted-foreground">
              Phụ trách: <Button variant="link" className="h-auto p-0 text-xs" onClick={() => onOpen(node.leader!)}>{node.leader.name}</Button>
            </p>
          )}
        </div>
      </div>
      {open && (
        <div className="ml-4 space-y-0.5 pt-1">
          {people.map(p => <PersonButton key={p.id} person={p} onOpen={onOpen} />)}
          {children.map(c => <Branch key={c.id} node={c} depth={depth + 1} query={query} onOpen={onOpen} />)}
          {!people.length && !children.length && <p className="px-2 py-1 text-xs text-muted-foreground">Chưa có nhân sự.</p>}
        </div>
      )}
    </div>
  );
}

function BlockCard({ node, query, onOpen }: { node: ChartNode; query: string; onOpen: (p: ChartPerson) => void }) {
  if (!nodeMatches(node, query)) return null;
  const tone = toneClass[blockTone(node.name)];
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-card">
      <header className={`flex items-center justify-between gap-2 px-4 py-3 ${tone}`}>
        <h3 className="font-semibold break-words">{node.name}</h3>
        <span className="flex shrink-0 items-center gap-1 text-xs"><Users className="h-3.5 w-3.5" />{countPeople(node)}</span>
      </header>
      <div className="px-2 pb-3">
        {node.people.length > 0 && <div className="px-2 pt-2">{node.people.map(p => <PersonButton key={p.id} person={p} onOpen={onOpen} />)}</div>}
        {node.children.map(c => <Branch key={c.id} node={c} depth={1} query={query} onOpen={onOpen} />)}
        {!node.children.length && !node.people.length && <p className="px-3 py-3 text-sm text-muted-foreground">Chưa cấu hình đơn vị — thêm tại Cài đặt.</p>}
      </div>
    </section>
  );
}

export function OrgChart({ config, staff, biz, positions, bizUnavailable, onOpenStaff }: {
  config: OrgConfig;
  staff: { id: string; name: string }[];
  biz?: OrgData;
  positions?: PositionsData;
  bizUnavailable?: boolean;
  onOpenStaff: (userId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [person, setPerson] = useState<ChartPerson | null>(null);
  const nameOf = useMemo(() => {
    const map = new Map(staff.map(s => [s.id, s.name]));
    return (id: string) => map.get(id) ?? 'Nhân sự';
  }, [staff]);
  const executives = useMemo(() => executiveSlots(positions, nameOf), [positions, nameOf]);
  const blocks = useMemo(() => {
    const result: ChartNode[] = [];
    if (biz) result.push(buildBizBlock(biz, positions, nameOf));
    result.push(...buildBaseBlocks(config, staff).filter(b => blockTone(b.name) !== 'biz' || !biz));
    return result;
  }, [biz, positions, config, staff, nameOf]);
  const openPerson = (p: ChartPerson) => setPerson(p);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input aria-label="Tìm nhân sự hoặc đơn vị" placeholder="Tìm nhân sự, đơn vị…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-xs" />
      </div>
      <div className="mx-auto max-w-md rounded-xl border bg-chart-company px-4 py-3 text-center text-chart-company-foreground shadow-card">
        <p className="flex items-center justify-center gap-2 font-bold tracking-wide"><Building2 className="h-5 w-5" />CÔNG TY CỔ PHẦN SỨ VIỆT</p>
      </div>
      <div className="mx-auto h-5 w-px bg-border" />
      {executives.length > 0 && (
        <div className="mx-auto max-w-md space-y-2">
          {executives.map((slot, i) => (
            <div key={slot.code || slot.name}>
              <button
                type="button"
                disabled={!slot.holder}
                onClick={() => slot.holder && openPerson(slot.holder)}
                className={`w-full rounded-xl border px-4 py-3 text-left shadow-card ${i === 0 ? 'bg-chart-executive text-chart-executive-foreground' : 'bg-chart-deputy text-chart-deputy-foreground'} ${slot.holder ? 'cursor-pointer' : 'opacity-80'}`}
              >
                <p className="flex items-center gap-2 font-semibold"><Crown className="h-4 w-4 shrink-0" />{slot.name}</p>
                <p className="mt-0.5 text-sm opacity-90">{slot.holder ? slot.holder.name : 'Chưa bổ nhiệm'}</p>
              </button>
              {i < executives.length - 1 && <div className="mx-auto h-3 w-px bg-border" />}
            </div>
          ))}
        </div>
      )}
      <div className="mx-auto h-5 w-px bg-border" />
      {bizUnavailable && !biz && (
        <p className="rounded-lg border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
          Tài khoản của bạn chưa có quyền xem dữ liệu Khối Kinh doanh — sơ đồ chỉ hiển thị các khối cấu hình tại Cài đặt.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {blocks.map(b => <BlockCard key={b.id} node={b} query={query} onOpen={openPerson} />)}
      </div>
      {!blocks.length && <p className="py-10 text-center text-sm text-muted-foreground">Chưa có cơ cấu nào — thêm Khối/Phòng/Nhóm tại Cài đặt.</p>}
      <Dialog open={!!person} onOpenChange={v => !v && setPerson(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{person?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Chức danh: </span>{person?.title ?? 'Chưa có chức danh'}</p>
            <p><span className="text-muted-foreground">Nhiệm vụ: </span>{person?.duties || 'Chưa có nhiệm vụ'}</p>
            {person && (
              <Button className="mt-2" onClick={() => { onOpenStaff(person.id); setPerson(null); }}>Xem quyền & phân công</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
