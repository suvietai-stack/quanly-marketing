import { describe, expect, it } from 'vitest';
import { canActivateRole, roleDraftSnapshot, suggestedRole, type OriginalRole } from './titleRoles';
const role: OriginalRole = { id: 'standard-design-staff', name: 'Nhân viên Thiết kế', restricted: false, permissions: ['order.view'], checks: [{ key: 'order.view', ready: false, reason: 'scope_audit_pending' }] };
const legacy: OriginalRole = { id: 'original-designer', name: 'Designer / Chụp ảnh', restricted: false, permissions: ['order.view'], checks: [{ key: 'order.view', ready: false, reason: 'scope_audit_pending' }] };
describe('Role reference safety', () => {
  it('cannot activate a Role whose scope has not been checked', () => expect(canActivateRole(role)).toBe(false));
  it('cannot activate privileged Role even with verified permissions', () => expect(canActivateRole({ ...role, restricted: true, checks: [{ key: 'order.view', ready: true, reason: '' }] })).toBe(false));
  it('cannot activate permission missing from audit coverage', () => expect(canActivateRole({ ...role, permissions: ['order.view', 'order.edit'], checks: [{ key: 'order.view', ready: true, reason: '' }] })).toBe(false));
  it('suggests the standard Role ID without copying permissions', () => expect(suggestedRole('Nhân viên Thiết kế', [role])?.id).toBe('standard-design-staff'));
  it('never suggests a legacy Role for a new title', () => expect(suggestedRole('Nhân viên Thiết kế', [legacy])).toBeUndefined());
  it('does not infer higher permissions for a manager', () => expect(suggestedRole('Trưởng bộ phận Thiết kế', [role])).toBeUndefined());
  it('does not invent Role for a missing match', () => expect(suggestedRole('Kế toán kho', [role])).toBeUndefined());
  it('keeps two independent Role references in the stale-write snapshot', () => expect(roleDraftSnapshot([{ title_source: 'base', title_id: 't', role_id: 'b', is_primary: false, scope_kind: 'unit', revision: 2, active: false }, { title_source: 'base', title_id: 't', role_id: 'a', is_primary: true, scope_kind: 'unit', revision: 1, active: false }]).map(r => r.role_id)).toEqual(['a', 'b']));
});