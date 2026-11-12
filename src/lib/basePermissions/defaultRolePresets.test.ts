import { expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { defaultRolePresets, defaultRoleImpact, salesBusinessDraft } from './defaultRolePresets';
import type { CatalogRole } from './roleCatalog';
import type { EditorPolicy } from './permissionEditor';
const policy: EditorPolicy[] = [...new Set(defaultRolePresets.flatMap(p => [...p.keys]))].map(key => ({ key, scope: 'assigned', personal: false, position_ready: true, task_ready: true }));
const role = (id: string, permissions: string[], is_system = false): CatalogRole => ({ id, name: id, permissions, is_system, role_kind: id.startsWith('role-v2-task-') ? 'marketing_task' : 'position', catalog_state: 'standard', receivers: 2, description: '', catalog_group: '', signal_scope_all: false, signal_scope: [], references: { positions: [], titles: [], direct: 0, specialties: [] }, permission_checks: [] });
it('covers exactly 20 positions and 5 tasks without duplicate IDs', () => {
  expect(defaultRolePresets.filter(p => p.kind === 'position')).toHaveLength(20);
  expect(defaultRolePresets.filter(p => p.kind === 'marketing_task')).toHaveLength(5);
  expect(new Set(defaultRolePresets.map(p => p.roleId)).size).toBe(25);
});
it('all 20 positions suggest only personal 3K, no task preset grants 3K management',()=>{
  for(const p of defaultRolePresets.filter(p=>p.kind==='position')) expect(p.keys).toContain('k3.use');
  for(const p of defaultRolePresets) expect(p.keys.filter(k=>['k3.view_scope','k3.comment','k3.settings'].includes(k))).toEqual([]);
  for(const p of defaultRolePresets.filter(p=>p.kind==='marketing_task')) expect(p.keys).not.toContain('k3.use');
});
it('Content task default keeps only verified Content workflow actions and leaves the stored Role untouched', () => {
  const stored = role('role-v2-task-content-web', ['web.view', 'web.content_view', 'social.post_create', 'settings.role']);
  const impact = defaultRoleImpact(stored, policy);
  expect(impact?.after).toEqual(defaultRolePresets.find(p => p.roleId === 'role-v2-task-content-web')?.keys);
  expect(impact?.removed).toEqual(['social.post_create', 'settings.role']);
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
it('Marketing staff has no default Order management or settings rights', () => {
  const p = defaultRolePresets.find(p => p.roleId === 'role-v2-mkt-staff');
  expect(p?.keys).not.toContain('order.approve');
  expect(p?.keys).not.toContain('order.cancel');
  expect(p?.keys).not.toContain('order.assign');
  expect(p?.keys).not.toContain('order.edit');
  expect(p?.keys).not.toContain('settings.view');
});
it('Content defaults exclude Social, Orders and settings while retaining Web and own Tasks', () => {
  const p = defaultRolePresets.find(p => p.roleId === 'role-v2-task-content-web');
  expect(p?.keys.filter(k => /^(social|order|settings)\./.test(k))).toEqual([]);
  expect(p?.keys).toContain('web.outline_start');
  expect(p?.keys).toContain('task.view_mine');
});
it('all sales levels propose basic CRM, assigned leads and own quotes', () => {
  for (const id of ['director', 'head', 'team', 'staff']) {
    const p = defaultRolePresets.find(p => p.roleId === `role-v2-sales-${id}`);
    expect(p?.keys).toContain('biz.crm_use');
    expect(p?.keys).toContain('signal.sale');
    expect(p?.keys).toContain('oq.view_own');
  }
});
it('retains working business rights absent from new-right policy; does not grant unavailable new ones', () => {
  const stored = role('role-v2-sales-staff', ['biz.crm_use', 'signal.sale', 'oq.view_own']);
  const d = defaultRoleImpact(stored, []);
  expect(d?.after).toEqual(['biz.crm_use', 'signal.sale', 'oq.view_own']);
  expect(d?.added).toEqual([]);
  expect(d?.unavailable).toContain('ot.view_own');
});
it('responsible HR draft retains assigned leave approval but never finance approval or configuration', () => {
  const p = defaultRolePresets.find(p => p.roleId === 'role-v2-hr');
  expect(p?.keys).toContain('leave.approve');
  expect(p?.keys.filter(k => /settings|export|finance|delete/.test(k))).toEqual([]);
});
it('Sales business suggestions are minimal, policy-gated and never automatically propose approval or all-block access', () => {
  for (const level of ['staff', 'team', 'head', 'director']) {
    const p = defaultRolePresets.find(p => p.roleId === `role-v2-sales-${level}`);
    expect(p?.keys.filter(k => /biz\..*(approve|manage)|biz\.view_all/.test(k))).toEqual([]);
    if (level === 'staff') expect(p?.keys).not.toContain('biz.view_dept');
    else expect(p?.keys).toContain('biz.view_dept');
    const d = defaultRoleImpact(role(`role-v2-sales-${level}`, ['biz.crm_use']), []);
    expect(d?.added).toEqual([]);
    expect(d?.unavailable).toContain(level === 'staff' ? 'biz.goal_submit' : 'biz.view_dept');
  }
  expect(defaultRolePresets.find(p => p.roleId === 'role-v2-sales-director')?.keys).not.toContain('biz.goal_submit');
});
it('business-only Sales draft preserves all existing rights and adds no approval or global management', () => {
  const stored = role('role-v2-sales-head', ['signal.assign', 'biz.crm_edit_other', 'finance.incoming.view_unit']);
  const draft = salesBusinessDraft(stored, policy);
  expect(draft?.removed).toEqual([]);
  expect(draft?.after).toEqual([...stored.permissions, 'biz.view_own', 'biz.goal_submit', 'biz.plan_submit', 'biz.report_submit', 'biz.view_dept']);
  expect(stored.permissions).toEqual(['signal.assign', 'biz.crm_edit_other', 'finance.incoming.view_unit']);
  expect(salesBusinessDraft(stored, [])?.added).toEqual([]);
  expect(salesBusinessDraft(role('role-v2-task-content-web', []), policy)).toBeUndefined();
});
