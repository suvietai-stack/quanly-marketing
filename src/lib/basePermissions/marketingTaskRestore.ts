/** Bản mô phỏng quy tắc đề xuất trong docs/pending/marketing_task_restore_after_legacy_reset.sql (chưa áp dụng). */
const BASIC = new Set(['overview', 'task', 'brand', 'kpi', 'leave', 'att', 'settings']);
const CORE: Record<string, string> = { 'role-content-web': 'web', 'role-seo': 'web', 'role-local-seo': 'local', 'role-social': 'social', 'role-video': 'video', 'role-standard-design-staff': 'order' };
export function mktTaskCorePermission(roleId: string, p: string): boolean {
  const m = p.split('.')[0];
  return BASIC.has(m) || CORE[roleId] === m;
}
export function restoredTaskPermissions(input: { roleId: string; standard: boolean; marketingEligible: boolean; readyPermissions: string[] }): string[] {
  if (!input.standard || !input.marketingEligible) return [];
  return input.readyPermissions.filter(p => mktTaskCorePermission(input.roleId, p));
}
