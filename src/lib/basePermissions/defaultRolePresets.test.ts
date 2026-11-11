import { expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { defaultRolePresets, defaultRoleImpact } from './defaultRolePresets';
import type { CatalogRole } from './roleCatalog';
import type { EditorPolicy } from './permissionEditor';
const policy: EditorPolicy[] = [...new Set(defaultRolePresets.flatMap(p => [...p.keys]))].map(key => ({ key, scope: 'assigned', personal: false, position_ready: true, task_ready: true }));
const role = (id: string, permissions: string[], is_system = false): CatalogRole => ({ id, name: id, permissions, is_system, role_kind: id === 'role-canonical-v1-task-content' ? 'marketing_task' : 'position', catalog_state: 'standard', receivers: 2, description: '', catalog_group: '', signal_scope_all: false, signal_scope: [], references: { positions: [], titles: [], direct: 0, specialties: [] }, permission_checks: [] });
it('covers exactly 20 positions and 5 tasks without duplicate IDs', () => {
  expect(defaultRolePresets.filter(p => p.kind === 'position')).toHaveLength(20);
  expect(defaultRolePresets.filter(p => p.kind === 'marketing_task')).toHaveLength(5);
  expect(new Set(defaultRolePresets.map(p => p.roleId)).size).toBe(25);
});
it('Content reduces to seven configured task actions, removes cross-module rights, and leaves original untouched', () => {
  const stored = role('role-canonical-v1-task-content', ['web.view', 'web.content_view', 'social.post_create', 'settings.role']);
  const impact = defaultRoleImpact(stored, policy);
  expect(impact?.after).toHaveLength(7);
  expect(impact?.removed).toEqual(['social.post_create', 'settings.role']);
  expect(stored.permissions).toEqual(['web.view', 'web.content_view', 'social.post_create', 'settings.role']);
});
it('both protected system positions retain their exact permissions', () => {
  for (const id of ['role-dong-hang', 'role-nhan-su-moi']) {
    expect(defaultRoleImpact(role(id, ['ot.task_update', 'leave.create'], true), policy)?.after).toEqual(['ot.task_update', 'leave.create']);
  }
});
it('missing backend capability is excluded, never assumed', () => {
  expect(defaultRoleImpact(role('role-canonical-v1-task-content', []), policy.filter(p => p.key !== 'web.outline_start'))?.after).not.toContain('web.outline_start');
  expect(defaultRoleImpact(role('role-canonical-v1-task-content', []), policy.filter(p => p.key !== 'web.outline_start'))?.unavailable).toEqual(['web.outline_start']);
});
it('no ordinary default proposes admin/delete/approval/export/all-scope actions', () => {
  for (const p of defaultRolePresets) expect(p.keys.filter(k => /settings\.|delete|approve|export|view_all|force_status/.test(k))).toEqual([]);
});
it('SEO/Local/Social/Video task defaults are concrete minimal sets', () => {
  expect(defaultRolePresets.filter(p => p.kind === 'marketing_task').map(p => p.keys.length)).toEqual([7, 3, 4, 7, 6]);
});