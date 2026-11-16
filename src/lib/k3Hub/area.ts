export const DISTRIBUTION_UNIT = '3df93c75-8a46-4c2f-bc09-7583aa672b52';

export type AreaUnit = { id: string; parent_id?: string | null; active: boolean };
export type AreaMember = { user_id: string; unit_id: string; active: boolean; starts_at?: string | null; ends_at?: string | null };

export function areaUnitIds(units: AreaUnit[], root: string): Set<string> {
  const ids = new Set<string>();
  if (!units.some(u => u.id === root && u.active)) return ids;
  ids.add(root);
  for (let changed = true; changed;) {
    changed = false;
    for (const unit of units) {
      if (unit.active && unit.parent_id && ids.has(unit.parent_id) && !ids.has(unit.id)) {
        ids.add(unit.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function hasAreaAppointment(members: AreaMember[], actor: string, ids: Set<string>, now: number): boolean {
  return members.some(m => m.user_id === actor && m.active && ids.has(m.unit_id) &&
    (!m.starts_at || Date.parse(m.starts_at) <= now) && (!m.ends_at || Date.parse(m.ends_at) > now));
}

export function selectAreaUnit<T extends { id: string }>(options: T[], root: string, override: string | null): string {
  if (override && options.some(u => u.id === override)) return override;
  return options.find(u => u.id === root)?.id ?? options[0]?.id ?? '';
}