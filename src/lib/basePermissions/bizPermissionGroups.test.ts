import { it, expect } from 'vitest';
import { PERMISSIONS } from '@/lib/auth';
import { bizSubgroups, bizSubgroupOf, BIZ_GROUP } from './bizPermissionGroups';
import { defaultRolePresets } from './defaultRolePresets';
it('every one of the 17 business admin keys sits in exactly one of 5 subgroups, using real keys only', () => {
  const real = PERMISSIONS.filter(p => p.group === BIZ_GROUP).map(p => p.key).sort();
  const grouped = bizSubgroups.flatMap(g => [...g.keys]).sort();
  expect(bizSubgroups).toHaveLength(5);
  expect(real).toHaveLength(17);
  expect(grouped).toEqual(real);
  expect(bizSubgroupOf('biz.crm_use')).toBeUndefined();
});
it('default Roles propose only scoped view/submission business keys, never approval, management or all-block', () => {
  const allowed = new Set(['biz.view_own', 'biz.view_dept', 'biz.goal_submit', 'biz.plan_submit', 'biz.report_submit']);
  for (const p of defaultRolePresets) expect(p.keys.filter(k => bizSubgroupOf(k) && !allowed.has(k))).toEqual([]);
});
