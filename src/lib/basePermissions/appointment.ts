import type { OrgConfig } from './types';
import { assignSlot, membershipEffective, membershipKind } from '@/lib/orgStructure';

export function appointmentEligible(status: string): boolean {
  return status === 'Đang hoạt động';
}

export function marketingUnit(config: OrgConfig, unitId: string): boolean {
  const seen = new Set<string>();
  let unit = config.units.find(u => u.id === unitId);
  while (unit && !seen.has(unit.id)) {
    seen.add(unit.id);
    if (unit.kind === 'block') return unit.name === 'Khối Marketing';
    unit = config.units.find(u => u.id === unit?.parent_id);
  }
  return false;
}

/** Build selected deltas only; an explicit transfer never touches concurrent sources. */
export function appointmentDraft(config: OrgConfig, unitId: string, titleId: string, users: string[], mode: 'primary' | 'concurrent' | 'transfer', specialtyIds: string[]): OrgConfig {
  const title = config.titles.find(t => t.id === titleId && t.active);
  if (!title || (title.unit_id && title.unit_id !== unitId)) throw new Error('Chức vụ không thuộc đơn vị này.');
  const ids = [...new Set(users)];
  if (!ids.length) throw new Error('Chọn nhân sự để bổ nhiệm.');
  if ((title.kind === 'manager' || title.capacity === 1) && ids.length > 1) throw new Error('Vị trí quản lý chỉ có một người.');
  const primaryElsewhere = config.memberships.filter(m => ids.includes(m.user_id) && membershipEffective(m) && membershipKind(m) === 'primary' && m.unit_id !== unitId);
  if (primaryElsewhere.length && mode === 'primary') throw new Error('Chọn Điều chuyển hoặc Kiêm nhiệm cho nhân sự đang thuộc đơn vị khác.');
  if (specialtyIds.length && (!marketingUnit(config, unitId) || title.source === 'biz_positions')) throw new Error('Nhiệm vụ Marketing chỉ áp dụng trong Khối Marketing.');
  let next = structuredClone(config);
  const now = new Date().toISOString();
  if (mode === 'transfer') next.memberships = next.memberships.map(m => primaryElsewhere.some(p => p.id === m.id) ? {...m, active: false, ends_at: now} : m);
  for (const userId of ids) {
    if (next.memberships.some(m => membershipEffective(m) && m.user_id === userId && m.unit_id === unitId && m.title_id === titleId)) throw new Error('Nhân sự đã có phân công này.');
    const beforeIds = new Set(next.memberships.map(m => m.id));
    next = assignSlot(next, unitId, titleId, userId);
    next.memberships = next.memberships.map(m => beforeIds.has(m.id) ? m : {...m, kind: mode === 'concurrent' ? 'concurrent' : 'primary', specialty_ids: specialtyIds});
  }
  return next;
}