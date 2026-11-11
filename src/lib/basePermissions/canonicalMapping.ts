import { defaultRolePresets, isCanonicalRole } from './defaultRolePresets';
import type { RoleCatalog, UnmappedAssignment } from './roleCatalog';

// Exact audited title IDs, never title-name/legacy-Role inference.
const titleRoles: Record<string, string> = {
  'b5e00000-0000-4000-8000-000000000120': 'mkt-director',
  'b5e00000-0000-4000-8000-000000000101': 'mkt-head',
  'b5e00000-0000-4000-8000-000000000103': 'design-head',
  'b5e00000-0000-4000-8000-000000000102': 'mkt-staff',
  'b5e00000-0000-4000-8000-000000000104': 'design-staff',
  'b5e00000-0000-4000-8000-000000000106': 'hr',
  'b5e00000-0000-4000-8000-000000000107': 'account-chief',
  'b5e00000-0000-4000-8000-000000000108': 'account-stock',
  'b5e00000-0000-4000-8000-000000000109': 'proc-head',
  'b5e00000-0000-4000-8000-000000000110': 'buyer',
  'ea700d9c-35a7-4ceb-b1cd-bfb9080b4d08': 'executive',
  '6faa90f6-1f3f-4974-bf4e-d4e21d529f6c': 'deputy-executive',
};
export type CanonicalMapping = { assignment: UnmappedAssignment; roleId?: string; exception?: string; appliedSlot?: string };
export function canonicalMapping(catalog: RoleCatalog): CanonicalMapping[] {
  return catalog.unmapped.map(assignment => {
    const suffix = assignment.title_id ? titleRoles[assignment.title_id] : undefined;
    const auditedUnit=catalog.mapping.find(m=>m.title_id===assignment.title_id)?.unit_id;
    const roleId = suffix && auditedUnit === assignment.unit_id ? `role-canonical-v1-${suffix}` : undefined;
    return { assignment, roleId, exception: roleId ? undefined : assignment.title_id ? 'Cần đối chiếu chức danh và đơn vị/cấp; không dùng liên kết Role cũ.' : 'Thiếu chức danh; Admin cần chọn nguồn và vị trí.' };
  });
}
export function canonicalRoleDrafts(catalog: RoleCatalog, policy: import('./permissionEditor').EditorPolicy[]) {
  return defaultRolePresets.map(p => ({ preset: p, stored: catalog.roles.find(r => r.id === p.roleId && isCanonicalRole(r)),
    permissions: p.keys.filter(k => policy.some(s => s.key === k && (p.kind === 'marketing_task' ? s.task_ready : s.position_ready))) }));
}