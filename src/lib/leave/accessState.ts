export const LEAVE_ACCESS_KEYS = ['leave.view_own','leave.create','leave.view_assigned','leave.approve','leave.view_all','leave.report','leave.view_unit'];
export function leaveAccessState(actor: string | undefined, active: boolean, admin: boolean, verifiedActor: string | undefined, allowed: boolean, failed: boolean) {
  if (!actor || !active) return 'denied';
  if (admin) return 'ready';
  if (actor !== verifiedActor) return failed ? 'error' : 'pending';
  return allowed ? 'ready' : 'denied';
}
export function validLeaveTab(current: string, tabs: string[]) {
  return tabs.includes(current) ? current : tabs[0] ?? 'mine';
}