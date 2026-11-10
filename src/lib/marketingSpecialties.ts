export type StaffSpecialty = { user_id: string; specialty_id: string; state: 'active' | 'needs_review' | 'removed'; origin: 'auto' | 'manual'; is_primary: boolean; source: unknown };
/** Diff between saved and edited checkbox sets; many specialties per person allowed. */
export function applySpecialtyDiff(current: Set<string>, next: Set<string>) {
  return { add: [...next].filter(x => !current.has(x)), remove: [...current].filter(x => !next.has(x)) };
}
