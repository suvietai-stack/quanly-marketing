export type LeaveListScope = 'mine' | 'approve' | 'manage';
export const LEAVE_LIST_LIMIT = 1000;
export function leaveListScope(tab: string, permissions: { mine: boolean; approve: boolean; manage: boolean; report: boolean }): LeaveListScope | null {
  if (tab === 'mine' && permissions.mine) return 'mine';
  if (tab === 'approve' && permissions.approve) return 'approve';
  if ((tab === 'manage' && permissions.manage) || (tab === 'report' && permissions.report)) return 'manage';
  return null;
}
export function leaveListKey(uid: string | undefined, scope: LeaveListScope | null) {
  return ['leave', 'list', uid, scope] as const;
}
export function leaveActorQuery(key: readonly unknown[], uid: string | undefined) {
  return !!uid && key[0] === 'leave' && key[2] === uid;
}
/** Filters constrain the HTTP SELECT; RLS remains authoritative for all scopes. */
export function filterLeaveList<T extends { eq(column: string, value: string): T }>(query: T, scope: LeaveListScope, uid: string): T {
  if (!uid) throw new Error('Cần đăng nhập để tải đơn.');
  if (scope === 'mine') return query.eq('owner_id', uid);
  if (scope === 'approve') return query.eq('approver_id', uid);
  if (scope === 'manage') return query;
  throw new Error('Phạm vi tải đơn không hợp lệ.');
}