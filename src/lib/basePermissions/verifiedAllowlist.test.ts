import { describe, expect, it } from 'vitest';
import { VERIFIED_APPOINTMENT_PERMISSIONS, suggestedRole, type OriginalRole } from './titleRoles';

const role = (name: string): OriginalRole => ({ id: name, name, restricted: false, permissions: [], checks: [] });

describe('verified appointment allowlist (mirror of private.org_role_permission_ready)', () => {
  it('includes signal permissions gated by sig_can/sig_scope_ok', () => {
    for (const p of ['signal.sale', 'signal.report', 'signal.view_all', 'signal.assign', 'signal.reassign']) {
      expect(VERIFIED_APPOINTMENT_PERMISSIONS).toContain(p);
    }
  });
  it('includes CRM permissions gated by crm_can/base_tier1', () => {
    for (const p of ['biz.crm_use', 'biz.crm_view_scope', 'biz.crm_export']) {
      expect(VERIFIED_APPOINTMENT_PERMISSIONS).toContain(p);
    }
  });
  it('never includes business-management or system permissions without a title-link gate', () => {
    for (const p of ['biz.view_all', 'biz.org_manage', 'k3.settings', 'settings.role', 'settings.user_manage']) {
      expect(VERIFIED_APPOINTMENT_PERMISSIONS).not.toContain(p);
    }
  });
});

describe('standard title → role suggestions', () => {
  it('maps sales titles to the standard sales roles', () => {
    expect(suggestedRole('Nhân viên Kinh doanh', [role('Nhân viên Kinh doanh')])?.name).toBe('Nhân viên Kinh doanh');
    expect(suggestedRole('Trưởng Phòng', [role('Trưởng phòng Kinh doanh')])?.name).toBe('Trưởng phòng Kinh doanh');
  });
  it('maps marketing staff and executives to their standard roles', () => {
    expect(suggestedRole('Nhân viên Marketing', [role('Nhân viên Marketing')])?.name).toBe('Nhân viên Marketing');
    expect(suggestedRole('Giám Đốc Điều hành', [role('Viewer / Ban Giám Đốc')])?.name).toBe('Viewer / Ban Giám Đốc');
  });
});
