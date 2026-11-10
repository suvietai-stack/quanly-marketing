import { describe, expect, it } from 'vitest';
import { buildOrganizationTree, countPeople, nodeMatches } from './orgChart';
import { emptyConfig, type OrgConfig } from './basePermissions/types';
const config: OrgConfig = { ...emptyConfig(), units: [
  { id: 'company', name: 'Công ty', kind: 'company', active: true },
  { id: 'marketing', name: 'Marketing', kind: 'block', active: true },
  { id: 's', parent_id: 'marketing', name: 'Hệ A', kind: 'system', active: true },
  { id: 'd', parent_id: 's', name: 'Phòng A', kind: 'department', active: true },
  { id: 't', parent_id: 'd', name: 'Nhóm A', kind: 'team', active: true },
  { id: 'unmapped', name: 'Chưa ánh xạ', kind: 'department', active: true },
], titles: [{ id: 'director', name: 'Giám đốc Hệ', unit_id: 's', active: true, level: 3, kind: 'manager', capacity: 1 }], memberships: [
  { id: 'a', user_id: 'u', unit_id: 's', title_id: 'director', active: true, starts_at: '2026-01-01' },
  { id: 'b', user_id: 'u', unit_id: 't', active: true, starts_at: '2026-01-01' },
  { id: 'future', user_id: 'v', unit_id: 'd', active: true, starts_at: '2027-01-01' },
] };
describe('unified organization tree', () => {
  const tree = buildOrganizationTree(config, [{ id: 'u', name: 'Nhân sự A' }], '2026-11-10');
  const block = tree.find(x => x.id === 'marketing');
  it('allows systems and teams outside business', () => expect(block?.children[0]?.children[0]?.children[0]?.kind).toBe('team'));
  it('retains an unmapped department at root', () => expect(tree.find(x => x.id === 'unmapped')?.name).toBe('Chưa ánh xạ'));
  it('counts unique people, excluding future assignments', () => { if (!block) throw new Error('missing'); expect(countPeople(block)).toBe(1); });
  it('searches recursively through people and titles', () => { if (!block) throw new Error('missing'); expect(nodeMatches(block, 'nhân sự a')).toBe(true); expect(nodeMatches(block, 'Giám đốc')).toBe(true); expect(nodeMatches(block, 'absent')).toBe(false); });
  it('preserves empty title slots', () => { const c = { ...config, memberships: [] }; expect(buildOrganizationTree(c, [])[1]?.children[0]?.slots?.[0]?.holders).toEqual([]); });
});