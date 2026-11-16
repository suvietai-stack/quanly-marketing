import { describe, expect, it } from 'vitest';
import { emptyConfig, type OrgConfig } from '@/lib/basePermissions/types';
import { isShowroomDepartment, missingShowroomPositions, showroomPositionSetup } from './positionSetup';

const setup = (): OrgConfig => ({
  ...emptyConfig(),
  units: [
    { id: 'company', name: 'Sứ Việt', kind: 'company', active: true },
    { id: 'business', parent_id: 'company', name: 'Khối Kinh doanh', kind: 'block', active: true },
    { id: 'retail', parent_id: 'business', name: 'Bán Lẻ', kind: 'system', active: true },
    { id: 'showroom', parent_id: 'retail', name: 'Showrom Hà Nội', kind: 'department', active: true },
  ],
  titles: [{ id: 'sales-title', name: 'Nhân viên Kinh doanh', kind: 'staff', capacity: 0, active: true }],
  memberships: [{
    id: 'existing-assignment', user_id: 'existing-person', unit_id: 'showroom',
    title_id: 'sales-title', active: true, kind: 'primary',
  }],
});

describe('Showroom V2 position bootstrap', () => {
  it('recognizes existing Bán Lẻ showroom with the original misspelling', () => {
    const config = setup();
    expect(isShowroomDepartment(config, 'showroom')).toBe(true);
    expect(isShowroomDepartment(config, 'retail')).toBe(false);
    expect(missingShowroomPositions(config, 'showroom')).toBe(true);
  });

  it('creates staff and store-manager titles with unit-scoped role bindings', () => {
    const before = setup();
    const result = showroomPositionSetup(before, 'showroom');
    expect(result.next.titles).toHaveLength(3);
    expect(result.commands).toHaveLength(2);
    const staff = result.next.titles.find(t => t.name === 'Nhân viên Showroom')!;
    const manager = result.next.titles.find(t => t.name === 'Cửa hàng trưởng')!;
    expect(staff.unit_id).toBe('showroom');
    expect(staff.capacity).toBe(0);
    expect(manager.capacity).toBe(1);
    expect(manager.kind).toBe('manager');
    expect(result.commands).toEqual([
      { action: 'position_role', data: { unit_id: 'showroom', title_id: staff.id, role_id: 'role-v2-showroom-staff', reason: 'Thiết lập Role vị trí Showroom' } },
      { action: 'position_role', data: { unit_id: 'showroom', title_id: manager.id, role_id: 'role-v2-showroom-manager', reason: 'Thiết lập Role vị trí Showroom' } },
    ]);
    expect(result.next.memberships).toEqual(before.memberships);
    expect(before.titles).toHaveLength(1);
  });

  it('does not duplicate titles on a second run', () => {
    const once = showroomPositionSetup(setup(), 'showroom');
    const twice = showroomPositionSetup(once.next, 'showroom');
    expect(twice.next.titles).toHaveLength(3);
    expect(twice.commands[0].data.title_id).toBe(once.commands[0].data.title_id);
  });

  it('refuses mismatched manager capacity instead of changing it silently', () => {
    const config = setup();
    config.titles.push({ id: 'manual', unit_id: 'showroom', name: 'Cửa hàng trưởng', kind: 'manager', level: 2, capacity: 3, active: true });
    expect(() => showroomPositionSetup(config, 'showroom')).toThrow(/cấu hình khác/);
  });
});
