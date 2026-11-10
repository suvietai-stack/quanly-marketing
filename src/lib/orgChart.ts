import type { OrgConfig, Unit } from '@/lib/basePermissions/types';
import { slotCapacity, titleKind, titleLevel, unitTitles } from '@/lib/orgStructure';

export interface ChartPerson { id: string; name: string; title?: string; duties?: string }
/** Ô chức danh trong một bộ phận — hiển thị kể cả khi chưa có người. */
export interface ChartSlot { id: string; title: string; manager: boolean; level: number; capacity: number; holders: ChartPerson[] }
export interface ChartNode { id: string; name: string; kind: 'company' | 'block' | 'system' | 'department' | 'team'; leader?: ChartPerson; leaderLabel?: string; leaderCode?: string; biz?: { systemId?: string; departmentId?: string; teamId?: string }; people: ChartPerson[]; slots?: ChartSlot[]; children: ChartNode[]; inactive?: boolean }
export interface ExecutiveSlot { code: string; name: string; level: number; holder?: ChartPerson }

/** One recursive tree for every organizational category; source is never a UI branch. */
export function buildOrganizationTree(config: OrgConfig, staff: { id: string; name: string }[], now = new Date().toISOString()): ChartNode[] {
  const names = new Map(staff.map(s => [s.id, s.name]));
  const current = config.memberships.filter(m => m.active && m.status !== 'cancelled' && (!m.starts_at || m.starts_at <= now) && (!m.ends_at || m.ends_at > now));
  const personOf = (m: typeof current[number]): ChartPerson => ({ id: m.user_id, name: names.get(m.user_id) ?? 'Nhân sự', title: config.titles.find(t => t.id === m.title_id)?.name, duties: m.duties });
  const make = (u: Unit, path: Set<string>): ChartNode => {
    const next = new Set([...path, u.id]);
    const titles = unitTitles(config, u.id);
    const slots = titles.map(t => ({ id: t.id, title: t.name, manager: titleKind(t) === 'manager', level: titleLevel(t), capacity: slotCapacity(t), holders: [...new Map(current.filter(m => m.unit_id === u.id && m.title_id === t.id).map(m => [m.user_id, personOf(m)])).values()] })).sort((a,b) => b.level-a.level || Number(b.manager)-Number(a.manager));
    const slotted = new Set(titles.map(t => t.id));
    const people = [...new Map(current.filter(m => m.unit_id === u.id && (!m.title_id || !slotted.has(m.title_id))).map(m => [m.user_id, personOf(m)])).values()];
    return { id: u.id, name: u.name, kind: u.kind, inactive: !u.active, slots, people, children: config.units.filter(x => x.parent_id === u.id && !next.has(x.id)).map(x => make(x,next)) };
  };
  return config.units.filter(u => !u.parent_id || !config.units.some(x => x.id === u.parent_id)).map(u => make(u,new Set()));
}

/** Tổng nhân sự của một nhánh, không tính trùng người xuất hiện ở nhiều cấp. */
export function countPeople(node: ChartNode): number {
  const ids = new Set<string>();
  const walk = (n: ChartNode) => { if (n.leader) ids.add(n.leader.id); n.people.forEach(p => ids.add(p.id)); (n.slots ?? []).forEach(s => s.holders.forEach(p => ids.add(p.id))); n.children.forEach(walk); };
  walk(node);
  return ids.size;
}

/** Nhánh khớp tìm kiếm khi tên đơn vị, chức danh hoặc bất kỳ nhân sự nào trong nhánh khớp. */
export function nodeMatches(node: ChartNode, query: string): boolean {
  const q = query.trim().toLocaleLowerCase('vi');
  if (!q) return true;
  const hit = (p?: ChartPerson) => !!p && p.name.toLocaleLowerCase('vi').includes(q);
  const slotHit = (node.slots ?? []).some(s => s.title.toLocaleLowerCase('vi').includes(q) || s.holders.some(hit));
  return node.name.toLocaleLowerCase('vi').includes(q) || hit(node.leader) || node.people.some(hit) || slotHit || node.children.some(c => nodeMatches(c, q));
}

/** Màu khối theo tên: Kinh doanh xanh dương, Marketing tím, Vận hành cam, khối khác dùng màu phụ. */
export function blockTone(name: string): 'biz' | 'marketing' | 'ops' | 'other' {
  const n = name.toLocaleLowerCase('vi');
  if (n.includes('kinh doanh')) return 'biz';
  if (n.includes('marketing')) return 'marketing';
  if (n.includes('vận hành')) return 'ops';
  return 'other';
}
