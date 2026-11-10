import type { OrgConfig, Unit } from '@/lib/basePermissions/types';
import type { OrgData } from '@/lib/biz/organization';
import { appointmentCurrent, type PositionsData } from '@/lib/biz/positions';

export interface ChartPerson { id: string; name: string; title?: string; duties?: string }
export interface ChartNode { id: string; name: string; kind: 'block' | 'system' | 'department' | 'team'; leader?: ChartPerson; people: ChartPerson[]; children: ChartNode[]; inactive?: boolean }
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
    people: membersOf(d.id),
    children: org.teams.filter(t => t.department_id === d.id).map(t => ({
      id: t.id, name: t.name, kind: 'team' as const, inactive: !t.active,
      leader: managerOf('team_lead', x => x.team_id === t.id),
      people: membersOf(d.id, t.id),
      children: [],
    })),
  });
  const mapped = org.systems.map(s => ({
    id: s.id, name: `Hệ ${s.name}`, kind: 'system' as const, inactive: !s.active,
    leader: managerOf('director', x => x.system_id === s.id),
    people: [] as ChartPerson[],
    children: org.departments.filter(d => d.system_id === s.id).map(depNode),
  }));
  const unmapped = org.departments.filter(d => !d.system_id).map(depNode);
  return { id: 'biz-block', name: 'Khối Kinh doanh', kind: 'block', people: [], children: [...mapped, ...unmapped] };
}

/** Các khối còn lại (Marketing, Vận hành…) từ cấu hình Cơ cấu tổ chức toàn Base — thêm/sửa tại Cài đặt. */
export function buildBaseBlocks(config: OrgConfig, staff: { id: string; name: string }[]): ChartNode[] {
  const nameOf: NameOf = id => staff.find(s => s.id === id)?.name ?? 'Nhân sự';
  const peopleOf = (unitId: string): ChartPerson[] => {
    const seen = new Set<string>();
    return config.memberships
      .filter(m => m.unit_id === unitId && m.active)
      .filter(m => !seen.has(m.user_id) && seen.add(m.user_id))
      .map(m => ({ id: m.user_id, name: nameOf(m.user_id), title: config.titles.find(t => t.id === m.title_id)?.name, duties: m.duties }));
  };
  const teamNode = (u: Unit): ChartNode => ({ id: u.id, name: u.name, kind: 'team', inactive: !u.active, people: peopleOf(u.id), children: [] });
  const depNode = (u: Unit): ChartNode => ({ id: u.id, name: u.name, kind: 'department', inactive: !u.active, people: peopleOf(u.id), children: config.units.filter(x => x.kind === 'team' && x.parent_id === u.id).map(teamNode) });
  return config.units
    .filter(u => u.kind === 'block')
    .map(u => ({ id: u.id, name: u.name, kind: 'block' as const, inactive: !u.active, people: peopleOf(u.id), children: config.units.filter(x => x.kind === 'department' && x.parent_id === u.id).map(depNode) }));
}

/** Tổng nhân sự của một nhánh, không tính trùng người xuất hiện ở nhiều cấp. */
export function countPeople(node: ChartNode): number {
  const ids = new Set<string>();
  const walk = (n: ChartNode) => { if (n.leader) ids.add(n.leader.id); n.people.forEach(p => ids.add(p.id)); n.children.forEach(walk); };
  walk(node);
  return ids.size;
}

/** Nhánh khớp tìm kiếm khi tên đơn vị hoặc bất kỳ nhân sự nào trong nhánh khớp. */
export function nodeMatches(node: ChartNode, query: string): boolean {
  const q = query.trim().toLocaleLowerCase('vi');
  if (!q) return true;
  const hit = (p?: ChartPerson) => !!p && p.name.toLocaleLowerCase('vi').includes(q);
  return node.name.toLocaleLowerCase('vi').includes(q) || hit(node.leader) || node.people.some(hit) || node.children.some(c => nodeMatches(c, q));
}

/** Màu khối theo tên: Kinh doanh xanh dương, Marketing tím, Vận hành cam, khối khác dùng màu phụ. */
export function blockTone(name: string): 'biz' | 'marketing' | 'ops' | 'other' {
  const n = name.toLocaleLowerCase('vi');
  if (n.includes('kinh doanh')) return 'biz';
  if (n.includes('marketing')) return 'marketing';
  if (n.includes('vận hành')) return 'ops';
  return 'other';
}
