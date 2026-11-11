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
export function appointmentDraft(config: OrgConfig, unitId: string, titleId: string, users: string[], mode: 'primary' | 'concurrent' | 'transfer', specialtyIds: string[], effectiveAt = new Date().toISOString()): OrgConfig {
  const title = config.titles.find(t => t.id === titleId && t.active);
  if (!title || (title.unit_id && title.unit_id !== unitId)) throw new Error('Chức vụ không thuộc đơn vị này.');
  const ids = [...new Set(users)];
  if (!ids.length) throw new Error('Chọn nhân sự để bổ nhiệm.');
  if ((title.kind === 'manager' || title.capacity === 1) && ids.length > 1) throw new Error('Vị trí quản lý chỉ có một người.');
  const primaryElsewhere = config.memberships.filter(m => ids.includes(m.user_id) && membershipEffective(m) && membershipKind(m) === 'primary' && m.unit_id !== unitId);
  if (primaryElsewhere.length && mode === 'primary') throw new Error('Chọn Điều chuyển hoặc Kiêm nhiệm cho nhân sự đang thuộc đơn vị khác.');
  if (specialtyIds.length && (!marketingUnit(config, unitId) || title.source === 'biz_positions')) throw new Error('Nhiệm vụ Marketing chỉ áp dụng trong Khối Marketing.');
  let next = structuredClone(config);
  const now = effectiveAt;
  if (mode === 'transfer') next.memberships = next.memberships.map(m => primaryElsewhere.some(p => p.id === m.id) ? {...m, active: false, ends_at: now} : m);
  for (const userId of ids) {
    if (next.memberships.some(m => membershipEffective(m) && m.user_id === userId && m.unit_id === unitId && m.title_id === titleId)) throw new Error('Nhân sự đã có phân công này.');
    const beforeIds = new Set(next.memberships.map(m => m.id));
    next = assignSlot(next, unitId, titleId, userId);
    next.memberships = next.memberships.map(m => beforeIds.has(m.id) ? {...m,...(m.ends_at !== config.memberships.find(x=>x.id===m.id)?.ends_at ? {ends_at:now}: {})} : {...m, starts_at:now, kind: mode === 'concurrent' ? 'concurrent' : 'primary', specialty_ids: specialtyIds});
  }
  return next;
}

/** Local actions preserve every unrelated assignment and source. */
export function endAppointment(config: OrgConfig, id: string, at = new Date().toISOString()): OrgConfig {
  const m = config.memberships.find(x => x.id === id);
  if (!m || !m.active) throw new Error('Phân công không còn hiệu lực.');
  return {...config,memberships:config.memberships.map(x=>x.id!==id?x: x.starts_at && x.starts_at>at ? {...x,active:false,status:'cancelled'} : {...x,active:false,ends_at:at})};
}

export function changeAppointmentSpecialties(config: OrgConfig, id: string, specialties: string[], at = new Date().toISOString()): OrgConfig {
  const m=config.memberships.find(x=>x.id===id);
  if(!m?.title_id || !membershipEffective(m,at) || !marketingUnit(config,m.unit_id)) throw new Error('Chỉ sửa nhiệm vụ của phân công Marketing đang hiệu lực.');
  const next=endAppointment(config,id,at);
  next.memberships.push({...m,id:crypto.randomUUID(),starts_at:at,ends_at:m.ends_at,active:true,status:'active',specialty_ids:[...new Set(specialties)],specialty_signatures:undefined});
  return next;
}