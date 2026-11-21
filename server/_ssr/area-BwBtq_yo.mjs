const DISTRIBUTION_UNIT = "3df93c75-8a46-4c2f-bc09-7583aa672b52";
function areaUnitIds(units, root) {
  const ids = /* @__PURE__ */ new Set();
  if (!units.some((u) => u.id === root && u.active)) return ids;
  ids.add(root);
  for (let changed = true; changed; ) {
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
function hasAreaAppointment(members, actor, ids, now) {
  return members.some((m) => m.user_id === actor && m.active && ids.has(m.unit_id) && (!m.starts_at || Date.parse(m.starts_at) <= now) && (!m.ends_at || Date.parse(m.ends_at) > now));
}
function selectAreaUnit(options, root, override) {
  if (override && options.some((u) => u.id === override)) return override;
  return options.find((u) => u.id === root)?.id ?? options[0]?.id ?? "";
}
export {
  DISTRIBUTION_UNIT as D,
  areaUnitIds as a,
  hasAreaAppointment as h,
  selectAreaUnit as s
};
