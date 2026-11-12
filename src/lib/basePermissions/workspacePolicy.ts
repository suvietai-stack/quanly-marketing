/** UI read policy only: every write remains live-authorized on the server. */
export function shouldReadStaffEffective(section: string, tab: string, staffId: string) {
  return section === 'staff' && tab === 'effective' && staffId.length > 0;
}
export function effectiveReadKey(actor: string | undefined, target: string, revision: number | undefined) {
  return ['base-effective', actor, target, revision] as const;
}