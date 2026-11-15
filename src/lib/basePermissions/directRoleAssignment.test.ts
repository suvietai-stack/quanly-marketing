import { describe, expect, it } from 'vitest';
import { assertNoDirectRoleAssignment } from './directRoleAssignment';

describe('no manual staff Role assignment', () => {
  it('allows account approval without assigning a direct Role', () => {
    expect(() => assertNoDirectRoleAssignment()).not.toThrow();
    expect(() => assertNoDirectRoleAssignment(null)).not.toThrow();
  });
  it('rejects every explicit Role, including a legacy default or a privileged Role', () => {
    for (const id of ['role-nhan-su-moi', 'role-seo', 'role-v2-sales-staff', 'role-super-admin', 'role-admin']) {
      expect(() => assertNoDirectRoleAssignment(id)).toThrow('Không gán Role trực tiếp');
    }
  });
  it('cannot be bypassed by an empty Role string', () => {
    expect(() => assertNoDirectRoleAssignment('')).toThrow('Không gán Role trực tiếp');
  });
});
