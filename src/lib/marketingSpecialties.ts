export type StaffSpecialty = { user_id: string; specialty_id: string; state: 'active' | 'needs_review' | 'removed'; origin: 'auto' | 'manual'; is_primary: boolean; source: unknown };
/** Diff between saved and edited checkbox sets; many specialties per person allowed. */
export function applySpecialtyDiff(current: Set<string>, next: Set<string>) {
  return { add: [...next].filter(x => !current.has(x)), remove: [...current].filter(x => !next.has(x)) };
}

export type SpecialtyCandidate = { user_id: string; name: string; is_primary: boolean; unit_name: string | null; title_name: string | null };

export type PersonLite = { id: string; name: string };

/**
 * Order people for an assignment picker: matching-specialty candidates first
 * (primary specialty first, then name), then everyone else alphabetically.
 * Dedupes by name so a person never appears twice; never auto-selects anyone.
 */
export function orderBySpecialty(people: PersonLite[], candidates: SpecialtyCandidate[]) {
  const candByName = new Map(candidates.map(c => [c.name, c]));
  const matched: PersonLite[] = [];
  const rest: PersonLite[] = [];
  const seen = new Set<string>();
  for (const p of people) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    (candByName.has(p.name) ? matched : rest).push(p);
  }
  const rank = (p: PersonLite) => (candByName.get(p.name)?.is_primary ? 0 : 1);
  matched.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'vi'));
  rest.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return { matched, rest };
}

/** Preview of auto-granted permissions per specialty (catalog info, no personal data). */
export type SpecialtyPermissionPreview = {
  id: string;
  name: string;
  role_id: string | null;
  role_name: string | null;
  granted: string[];
  blocked: { key: string; reason: string }[];
};
