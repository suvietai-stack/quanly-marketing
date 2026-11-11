import { expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { defaultRolePresets, defaultRoleImpact } from './defaultRolePresets';
import type { CatalogRole } from './roleCatalog';
import type { EditorPolicy } from './permissionEditor';
const policy: EditorPolicy[] = [...new Set(defaultRolePresets.flatMap(p => [...p.keys]))].map(key => ({ key, scope: 'assigned', personal: false, position_ready: true, task_ready: true }));
const role = (id: string, permissions: string[], is_system = false): CatalogRole => ({ id, name: id, permissions, is_system, role_kind: id.startsWith('role-v2-task-') ? 'marketing_task' : 'position', catalog_state: 'standard', receivers: 2, description: '', catalog_group: '', signal_scope_all: false, signal_scope: [], references: { positions: [], titles: [], direct: 0, specialties: [] }, permission_checks: [] });
it('covers exactly 20 positions and 5 tasks without duplicate IDs', () => {
  expect(defaultRolePresets.filter(p => p.kind === 'position')).toHaveLength(20);
  expect(defaultRolePresets.filter(p => p.kind === 'marketing_task')).toHaveLength(5);
  expect(new Set(defaultRolePresets.map(p => p.roleId)).size).toBe(25);
});
it('Content task default keeps only verified Content workflow actions and leaves the stored Role untouched', () => {
  const stored = role('role-v2-task-content-web', ['web.view', 'web.content_view', 'social.post_create', 'settings.role']);
  const impact = defaultRoleImpact(stored, policy);
  expect(impact?.after).toEqual(defaultRolePresets.find(p => p.roleId === 'role-v2-task-content-web')?.keys);
  expect(impact?.removed).toEqual(['settings.role']);
  expect(stored.permissions).toEqual(['web.view', 'web.content_view', 'social.post_create', 'settings.role']);
});
it('both protected system positions retain their exact permissions', () => {
  for (const id of ['role-dong-hang', 'role-nhan-su-moi']) {
    const stored = role(id, ['ot.task_update', 'leave.create'], true);
    expect(defaultRoleImpact(stored, policy)).toBeUndefined();
    expect(stored.permissions).toEqual(['ot.task_update', 'leave.create']);
  }
});
it('missing backend capability is excluded, never assumed', () => {
  const without = policy.filter(p => p.key !== 'web.outline_start');
  expect(defaultRoleImpact(role('role-v2-task-content-web', []), without)?.after).not.toContain('web.outline_start');
  expect(defaultRoleImpact(role('role-v2-task-content-web', []), without)?.unavailable).toEqual(['web.outline_start']);
});
it('no default proposes admin, delete, wide export or all-scope signal actions; finance management stays with finance Roles only', () => {
  const financeRoles = new Set(['role-v2-accountant', 'role-v2-account-chief', 'role-v2-account-stock']);
  for (const p of defaultRolePresets) {
    expect(p.keys.filter(k => /settings\.(role|user)|delete|export|signal\.view_all|force_status/.test(k))).toEqual([]);
    if (!financeRoles.has(p.roleId)) expect(p.keys.filter(k => /finance\.incoming\.(manage|reconcile)/.test(k))).toEqual([]);
  }
});
it('task defaults are the verified live sets', () => {
  expect(defaultRolePresets.filter(p => p.kind === 'marketing_task').map(p => p.keys.length)).toEqual([61, 30, 34, 35, 54]);
});
