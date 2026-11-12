import { describe, expect, it } from 'vitest';
import { personalChecklistRows } from './personalChecklist';
import policyJson from '../../../tests/fixtures/personal-policy.json';
import type { EditorPolicy } from './permissionEditor';
import type { EffectivePermission } from './types';
const policy = policyJson as EditorPolicy[];
describe('personal selection boundaries', () => {
  it('keeps all 510 keys in 24 modules, not only the 15 personal policy keys', () => {
    const rows = personalChecklistRows(policy, [], []);
    expect(rows).toHaveLength(510);
    expect(new Set(rows.map(p => p.group)).size).toBe(24);
    expect(rows.filter(p => p.grantable)).toHaveLength(15);
    expect(rows.filter(p => !p.grantable)).toHaveLength(495);
    expect(rows.find(p => p.key === 'leave.edit_own')?.editable).toBe(true);
  });
  it('does not select inherited-only rights or copy them into supplemental values', () => {
    const effective = [{ key: 'leave.view_own', allowed: true, sources: [{ effect: 'ALLOW', source_kind: 'common', source_name: 'Quyền chung' }] }] as EffectivePermission[];
    const row = personalChecklistRows(policy, [], [], effective).find(p => p.key === 'leave.view_own');
    expect(row?.selected).toBe(false);
    expect(row?.roleSources.map(s => s.source_kind)).toEqual(['common']);
    expect(row?.effective?.allowed).toBe(true);
  });
  it('preserves unsupported baseline selections and permits explicit revocation only', () => {
    const row = personalChecklistRows(policy, ['settings.role'], ['settings.role']).find(p => p.key === 'settings.role');
    expect(row?.selected).toBe(true); expect(row?.editable).toBe(true); expect(row?.grantable).toBe(false);
    expect(personalChecklistRows(policy, [], []).find(p => p.key === 'settings.role')?.editable).toBe(false);
  });
  it('never enables a new grant without policy, even when effective allowed', () => {
    expect(personalChecklistRows([], [], []).filter(p => p.editable)).toHaveLength(0);
    expect(personalChecklistRows([], ['leave.view_own'], ['leave.view_own']).filter(p => p.selected).map(p => p.key)).toEqual(['leave.view_own']);
  });
});