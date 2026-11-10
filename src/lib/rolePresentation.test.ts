import { describe, expect, it } from 'vitest';
import { organizationSettingsAccess, roleFunctionGroup } from './rolePresentation';
describe('Role administration access remains independent of organization editing', () => {
  it('settings.role grants Role editing but not organization editing', () => {
    expect(organizationSettingsAccess(false, false, true, false)).toEqual({ settings: true, structure: false, roles: true, editRoles: true, matrix: false });
  });
  it('settings.permission grants the matrix without granting Role editing', () => {
    expect(organizationSettingsAccess(false, false, false, true)).toEqual({ settings: true, structure: false, roles: true, editRoles: false, matrix: true });
  });
  it('no administration permission exposes no settings', () => {
    expect(organizationSettingsAccess(false, false, false, false).settings).toBe(false);
  });
  it('unknown names cannot acquire a privileged classification', () => {
    expect(roleFunctionGroup('SEO + Social + Video')).toBe('Khác');
  });
});