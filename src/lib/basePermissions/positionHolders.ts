import type { OrgConfig, Membership } from './types';

export function effectivePositionHolders(rows: Membership[], unitId: string, titleId: string, at: number): string[] {
  return [...new Set(rows.filter(m => m.active && (m.status ?? 'active') === 'active' &&
    m.unit_id === unitId && m.title_id === titleId &&
    (!m.starts_at || Date.parse(m.starts_at) <= at) && (!m.ends_at || Date.parse(m.ends_at) > at))
    .map(m => m.user_id))];
}

export function positionPairs(config: OrgConfig) {
  const ids = [...config.titles.filter(t => t.active && t.unit_id).map(t => [t.unit_id, t.id]),
    ...config.memberships.filter(m => m.title_id).map(m => [m.unit_id, m.title_id])];
  const seen = new Set<string>();
  return ids.flatMap(([unitId, titleId]) => {
    const unit = config.units.find(u => u.id === unitId && u.active);
    const title = config.titles.find(t => t.id === titleId && t.active);
    if (!unit || !title) return [];
    const key = JSON.stringify([unit.id, title.id]);
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ unit, title }];
  });
}