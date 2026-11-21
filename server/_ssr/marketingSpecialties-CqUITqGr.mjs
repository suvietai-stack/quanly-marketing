function applySpecialtyDiff(current, next) {
  return { add: [...next].filter((x) => !current.has(x)), remove: [...current].filter((x) => !next.has(x)) };
}
function orderBySpecialty(people, candidates) {
  const candById = new Map(candidates.map((c) => [c.user_id, c]));
  const matched = [];
  const rest = [];
  const seen = /* @__PURE__ */ new Set();
  for (const p of people) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    (candById.has(p.id) ? matched : rest).push(p);
  }
  const rank = (p) => candById.get(p.id)?.is_primary ? 0 : 1;
  matched.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "vi"));
  rest.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return { matched, rest };
}
function resolvePickerSelection(people, value, valueId) {
  const byId = new Map(people.map((p) => [p.id, p]));
  const nameMatches = value ? people.filter((p) => p.name === value) : [];
  const selectedId = valueId && byId.has(valueId) ? valueId : !valueId && value && nameMatches.length === 1 ? nameMatches[0].id : void 0;
  return { selectedId, legacyUnknown: !!value && !selectedId };
}
export {
  applySpecialtyDiff as a,
  orderBySpecialty as o,
  resolvePickerSelection as r
};
