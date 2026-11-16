import type { OrgConfig, Unit } from '@/lib/basePermissions/types';
import { titleKind, titleLevel, unitTitles } from '@/lib/orgStructure';
import { effectivePositionHolders } from '@/lib/basePermissions/positionHolders';
import { distributionVisualHierarchy } from '@/lib/distribution/hierarchy';

export interface ChartPerson { id: string; name: string; title?: string; duties?: string }
/** Ô chức danh trong một bộ phận — hiển thị kể cả khi chưa có người. */
export interface ChartSlot { id: string; titleId?: string; title: string; manager: boolean; level: number; capacity: number; holders: ChartPerson[] }
export interface ChartNode { id: string; name: string; kind: 'company' | 'block' | 'system' | 'department' | 'team'; leader?: ChartPerson; leaderLabel?: string; leaderCode?: string; biz?: { systemId?: string; departmentId?: string; teamId?: string }; people: ChartPerson[]; slots?: ChartSlot[]; children: ChartNode[]; inactive?: boolean; visualHierarchy?: boolean; wrapperProtected?: boolean; hierarchyWarning?: string }
export interface ExecutiveSlot { code: string; name: string; level: number; holder?: ChartPerson }

/** One recursive tree for every organizational category; source is never a UI branch. */
export function buildOrganizationTree(config: OrgConfig, staff: { id: string; name: string }[], now = new Date().toISOString()): ChartNode[] {
  const names = new Map(staff.map(s => [s.id, s.name]));
  const current = config.memberships.filter(m => m.active && m.status !== 'cancelled' && (!m.starts_at || m.starts_at <= now) && (!m.ends_at || m.ends_at > now));
  const personOf = (m: typeof current[number]): ChartPerson => ({ id: m.user_id, name: names.get(m.user_id) ?? 'Nhân sự', title: config.titles.find(t => t.id === m.title_id)?.name, duties: m.duties });
  const make = (u: Unit, path: Set<string>): ChartNode => {
    const next = new Set([...path, u.id]);
    const titles = unitTitles(config, u.id);
    const slots = [...new Map(titles.map(t => [t.id, t])).values()].map(t => ({ id: t.id, titleId: t.id, title: t.name, manager: titleKind(t) === 'manager', level: titleLevel(t), capacity: titleKind(t) === 'manager' ? t.capacity ?? 0 : 0, holders: effectivePositionHolders(config.memberships, u.id, t.id, Date.parse(now)).map(id => {
      const membership = current.find(m => m.user_id === id && m.unit_id === u.id && m.title_id === t.id);
      return membership ? personOf(membership) : { id, name: names.get(id) ?? 'Nhân sự', title: t.name };
    }) })).sort((a,b) => b.level-a.level || Number(b.manager)-Number(a.manager));
    const slotted = new Set(titles.map(t => t.id));
    const holderIds = new Set(slots.flatMap(slot => slot.holders.map(person => person.id)));
    const people = [...new Map(current.filter(m => m.unit_id === u.id && !holderIds.has(m.user_id) && (!m.title_id || !slotted.has(m.title_id))).map(m => [m.user_id, personOf(m)])).values()];
    const wrapperProtected = config.memberships.some(m => m.unit_id === u.id)
      || config.titles.some(t => t.unit_id === u.id)
      || config.position_slots?.some(s => s.unit_id === u.id)
      || Object.keys(('data' in u && u.data && typeof u.data === 'object') ? u.data : {}).some(key => !['id','name','kind','source','source_id','parent_id','active','created_at','updated_at'].includes(key));
    return { id: u.id, name: u.name, kind: u.kind, inactive: !u.active, slots, people, wrapperProtected: !!wrapperProtected, children: config.units.filter(x => x.parent_id === u.id && !next.has(x.id)).map(x => make(x,next)) };
  };
  const roots = config.units.filter(u => !u.parent_id || !config.units.some(x => x.id === u.parent_id));
  // Hiển thị: nếu có đúng một Công ty gốc và mọi gốc còn lại đều là Khối chưa gắn cha,
  // các Khối được xếp ảo dưới Công ty (thuần hiển thị, không ghi dữ liệu).
  const companies = roots.filter(u => u.kind === 'company');
  if (companies.length === 1 && roots.length > 1 && roots.every(u => u.kind === 'company' || u.kind === 'block')) {
    const company = companies[0];
    const virtual: Unit = { ...company };
    const node = make(virtual, new Set());
    node.children = [...node.children, ...roots.filter(u => u.id !== company.id).map(u => make(u, new Set([company.id])))];
    return distributionVisualHierarchy([node]);
  }
  return distributionVisualHierarchy(roots.map(u => make(u, new Set())));
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
