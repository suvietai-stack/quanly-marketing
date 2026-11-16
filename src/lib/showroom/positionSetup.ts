import type { OrgConfig, Title } from '@/lib/basePermissions/types';
import type { OrgCommand } from '@/lib/basePermissions/commands';

const standard = (s: string) => s.trim().toLocaleLowerCase('vi');

export const SHOWROOM_POSITION_ROLES = [
  { name: 'Nhân viên Showroom', code: 'showroom-staff', roleId: 'role-v2-showroom-staff', kind: 'staff' as const, level: 0, capacity: 0 },
  { name: 'Cửa hàng trưởng', code: 'showroom-manager', roleId: 'role-v2-showroom-manager', kind: 'manager' as const, level: 2, capacity: 1 },
] as const;

/** Only a real showroom department under the Bán Lẻ system is eligible. */
export function isShowroomDepartment(config: OrgConfig, unitId: string): boolean {
  const unit = config.units.find(u => u.id === unitId && u.active && u.kind === 'department');
  const parent = config.units.find(u => u.id === unit?.parent_id && u.active && u.kind === 'system');
  return !!unit && !!parent
    && standard(parent.name) === 'bán lẻ'
    && /showroom|showrom/.test(standard(unit.name));
}

export function missingShowroomPositions(config: OrgConfig, unitId: string): boolean {
  return isShowroomDepartment(config, unitId)
    && SHOWROOM_POSITION_ROLES.some(p => !config.titles.some(t => t.unit_id === unitId && t.active && standard(t.name) === standard(p.name)));
}

/**
 * Prepare two canonical titles and unit-scoped V2 position-role bindings.
 * The caller must submit one audited org_change preview/apply batch, not write
 * org_titles directly. Does not touch existing B2B appointments or staff.
 */
export function showroomPositionSetup(config: OrgConfig, unitId: string): { next: OrgConfig; commands: OrgCommand[] } {
  if (!isShowroomDepartment(config, unitId)) throw new Error('Chỉ khởi tạo chức danh tại một Showroom thuộc hệ Bán Lẻ.');
  const titles: Title[] = [...config.titles];
  const commands: OrgCommand[] = [];
  for (const p of SHOWROOM_POSITION_ROLES) {
    const existing = titles.find(t => t.unit_id === unitId && standard(t.name) === standard(p.name));
    if (existing && (!existing.active || existing.kind !== p.kind || existing.capacity !== p.capacity || existing.level !== p.level)) {
      throw new Error(`Chức danh ${p.name} đã tồn tại với cấu hình khác. Kiểm tra thủ công trước khi gắn Role.`);
    }
    const id = existing?.id ?? crypto.randomUUID();
    if (!existing) titles.push({ id, unit_id: unitId, name: p.name, code: p.code, kind: p.kind, level: p.level, capacity: p.capacity, active: true });
    commands.push({ action: 'position_role', data: { unit_id: unitId, title_id: id, role_id: p.roleId, reason: 'Thiết lập Role vị trí Showroom' } });
  }
  return { next: { ...config, titles }, commands };
}
