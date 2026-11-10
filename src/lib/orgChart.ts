import type { OrgConfig, Unit } from '@/lib/basePermissions/types';
import type { OrgData } from '@/lib/biz/organization';
import { appointmentCurrent, type PositionsData } from '@/lib/biz/positions';
import { slotCapacity, titleKind, titleLevel, unitTitles } from '@/lib/orgStructure';

export interface ChartPerson { id: string; name: string; title?: string; duties?: string }
/** Ô chức danh trong một bộ phận — hiển thị kể cả khi chưa có người. */
export interface ChartSlot { id: string; title: string; manager: boolean; level: number; capacity: number; holders: ChartPerson[] }
export interface ChartNode { id: string; name: string; kind: 'block' | 'system' | 'department' | 'team'; leader?: ChartPerson; leaderLabel?: string; leaderCode?: string; biz?: { systemId?: string; departmentId?: string; teamId?: string }; people: ChartPerson[]; slots?: ChartSlot[]; children: ChartNode[]; inactive?: boolean }
export interface ExecutiveSlot { code: string; name: string; level: number; holder?: ChartPerson }

type NameOf = (id: string) => string;

/** Hai chức vụ điều hành toàn khối, Giám đốc (cấp cao hơn) đứng trước Phó Giám đốc. */
export function executiveSlots(positions: PositionsData | undefined, nameOf: NameOf): ExecutiveSlot[] {
  if (!positions) return [];
  const now = positions.server_now;
  return positions.positions
    .filter(p => p.active && p.all_business && p.business_policy === 'executive')
    .sort((a, b) => b.level - a.level || a.sort_order - b.sort_order)
    .map(p => {
      const a = positions.appointments.find(x => x.position_id === p.id && appointmentCurrent(x, now));
      return { code: p.code ?? '', name: p.name, level: p.level, holder: a ? { id: a.user_id, name: nameOf(a.user_id), title: p.name } : undefined };
    });
}

/** Khối Kinh doanh: kế thừa nguyên Hệ → Phòng → Nhóm → Nhân viên và quan hệ quản lý thật. */
export function buildBizBlock(org: OrgData, positions: PositionsData | undefined, nameOf: NameOf): ChartNode {
  const now = positions?.server_now ?? new Date().toISOString();
  const titleOf = (userId: string) =>
    (positions?.appointments ?? [])
      .filter(x => x.user_id === userId && appointmentCurrent(x, now))
      .sort((a, b) => b.position_snapshot.level - a.position_snapshot.level)[0]?.position_snapshot.name;
  const managerOf = (code: string, match: (a: { system_id: string | null; department_id: string | null; team_id: string | null }) => boolean): ChartPerson | undefined => {
    const a = (positions?.appointments ?? []).find(x => x.position_snapshot.code === code && appointmentCurrent(x, now) && match(x));
    const legacy = org.managers.find(m => m.position === code && appointmentCurrent({ ...m, status: 'active' }, now) && match(m));
    const userId = a?.user_id ?? legacy?.user_id;
    return userId ? { id: userId, name: nameOf(userId), title: titleOf(userId) } : undefined;
  };
  const membersOf = (depId: string, teamId?: string): ChartPerson[] => {
    const rows = org.members.filter(m => m.department_id === depId && appointmentCurrent({ ...m, status: 'active' }, now)
      && (teamId
        ? org.team_members.some(t => t.team_id === teamId && t.user_id === m.user_id && appointmentCurrent({ ...t, status: 'active' }, now))
        : !org.team_members.some(t => t.user_id === m.user_id && org.teams.find(x => x.id === t.team_id)?.department_id === depId && appointmentCurrent({ ...t, status: 'active' }, now))));
    const seen = new Set<string>();
    return rows
      .filter(m => !seen.has(m.user_id) && seen.add(m.user_id))
      .filter(m => !teamId || managerOf('team_lead', x => x.team_id === teamId)?.id !== m.user_id)
      .map(m => ({ id: m.user_id, name: nameOf(m.user_id), title: titleOf(m.user_id) }));
  };
  const depNode = (d: OrgData['departments'][number]): ChartNode => ({
    id: d.id, name: d.name, kind: 'department', inactive: !d.active,
    leader: managerOf('department_head', x => x.department_id === d.id),
    leaderLabel: 'Trưởng phòng',
    people: membersOf(d.id),
    children: org.teams.filter(t => t.department_id === d.id).map(t => ({
      id: t.id, name: t.name, kind: 'team' as const, inactive: !t.active,
      leader: managerOf('team_lead', x => x.team_id === t.id),
      leaderLabel: 'Trưởng nhóm',
      people: membersOf(d.id, t.id),
      children: [],
    })),
  });
  const mapped = org.systems.map(s => ({
    id: s.id, name: `Hệ ${s.name}`, kind: 'system' as const, inactive: !s.active,
    leader: managerOf('director', x => x.system_id === s.id),
    leaderLabel: 'Giám đốc Hệ',
    people: [] as ChartPerson[],
    children: org.departments.filter(d => d.system_id === s.id).map(depNode),
  }));
  const unmapped = org.departments.filter(d => !d.system_id).map(depNode);
  return { id: 'biz-block', name: 'Khối Kinh doanh', kind: 'block', people: [], children: [...mapped, ...unmapped] };
}

/** Các khối còn lại (Marketing, Vận hành…) từ cấu hình Cơ cấu tổ chức toàn Base — thêm/sửa tại Cài đặt. */
export function buildBaseBlocks(config: OrgConfig, staff: { id: string; name: string }[]): ChartNode[] {
  const nameOf: NameOf = id => staff.find(s => s.id === id)?.name ?? 'Nhân sự';
  const personOf = (m: { user_id: string; title_id?: string; duties?: string }): ChartPerson => ({ id: m.user_id, name: nameOf(m.user_id), title: config.titles.find(t => t.id === m.title_id)?.name, duties: m.duties });
  /** Ô chức danh của bộ phận: mọi chức danh gắn bộ phận đều hiện, kể cả khi trống; quản lý/cấp cao đứng trước. */
  const slotsOf = (unitId: string): ChartSlot[] => unitTitles(config, unitId)
    .map(t => ({
      id: t.id,
      title: t.name,
      manager: titleKind(t) === 'manager',
      level: titleLevel(t),
      capacity: slotCapacity(t),
      holders: config.memberships.filter(m => m.active && m.unit_id === unitId && m.title_id === t.id).map(personOf),
    }))
    .sort((a, b) => b.level - a.level || Number(b.manager) - Number(a.manager) || a.title.localeCompare(b.title, 'vi'));
  /** Nhân sự của đơn vị chưa nằm trong ô chức danh nào (không chức danh hoặc chức danh chung). */
  const peopleOf = (unitId: string): ChartPerson[] => {
    const slotted = new Set(unitTitles(config, unitId).map(t => t.id));
    const seen = new Set<string>();
    return config.memberships
      .filter(m => m.unit_id === unitId && m.active && (!m.title_id || !slotted.has(m.title_id)))
      .filter(m => !seen.has(m.user_id) && seen.add(m.user_id))
      .map(personOf);
  };
  const teamNode = (u: Unit): ChartNode => ({ id: u.id, name: u.name, kind: 'team', inactive: !u.active, people: peopleOf(u.id), slots: slotsOf(u.id), children: [] });
  const depNode = (u: Unit): ChartNode => ({ id: u.id, name: u.name, kind: 'department', inactive: !u.active, people: peopleOf(u.id), slots: slotsOf(u.id), children: config.units.filter(x => x.kind === 'team' && x.parent_id === u.id).map(teamNode) });
  return config.units
    .filter(u => u.kind === 'block')
    .map(u => ({ id: u.id, name: u.name, kind: 'block' as const, inactive: !u.active, people: peopleOf(u.id), children: config.units.filter(x => x.kind === 'department' && x.parent_id === u.id).map(depNode) }));
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
