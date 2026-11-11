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
 * Matches and dedupes by stable user ID so two people sharing a display name
 * are both listed and ranked correctly; never auto-selects anyone.
 */
export function orderBySpecialty(people: PersonLite[], candidates: SpecialtyCandidate[]) {
  const candById = new Map(candidates.map(c => [c.user_id, c]));
  const matched: PersonLite[] = [];
  const rest: PersonLite[] = [];
  const seen = new Set<string>();
  for (const p of people) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    (candById.has(p.id) ? matched : rest).push(p);
  }
  const rank = (p: PersonLite) => (candById.get(p.id)?.is_primary ? 0 : 1);
  matched.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'vi'));
  rest.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return { matched, rest };
}

/**
 * Resolve the current selection of an assignment picker by stable ID.
 * - A valid valueId always wins.
 * - A legacy name-only value resolves only when exactly one person has that
 *   name (duplicate names stay unresolved so an admin can re-pick by ID).
 * Returns { selectedId, legacyUnknown } — legacyUnknown means the record keeps
 * its legacy name state and must not be auto-reassigned.
 */
export function resolvePickerSelection(people: PersonLite[], value?: string, valueId?: string) {
  const byId = new Map(people.map((p) => [p.id, p]));
  const nameMatches = value ? people.filter((p) => p.name === value) : [];
  const selectedId =
    valueId && byId.has(valueId)
      ? valueId
      : !valueId && value && nameMatches.length === 1
        ? nameMatches[0].id
        : undefined;
  return { selectedId, legacyUnknown: !!value && !selectedId };
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
