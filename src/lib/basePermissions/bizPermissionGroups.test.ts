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
it('no default Role proposes business admin keys while the server does not accept them from Roles', () => {
  for (const p of defaultRolePresets) expect(p.keys.filter(k => bizSubgroupOf(k))).toEqual([]);
});
