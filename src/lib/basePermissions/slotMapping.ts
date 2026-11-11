import type { OrgCommand } from './commands';
import type { RoleCatalog } from './roleCatalog';
import { isCanonicalRole } from './defaultRolePresets';

export type SlotMappingChoice = { assignmentId: string; roleId: string; slotId?: string; name?: string };
export function mappingCommands(catalog: RoleCatalog, choices: SlotMappingChoice[]): OrgCommand[] {
  const seen = new Set<string>();
  return choices.flatMap(choice => {
    if (seen.has(choice.assignmentId)) throw new Error('Phân công bị chọn trùng.');
    seen.add(choice.assignmentId);
    const a = catalog.unmapped.find(row => row.id === choice.assignmentId);
    const role = catalog.roles.find(r => r.id === choice.roleId && isCanonicalRole(r) && r.catalog_state === 'standard' && r.role_kind === 'position' && !r.is_system);
    if (!a?.title_id || !role) throw new Error('Chọn chức danh và một Role vị trí chuẩn trước khi chuyển ô.');
    const existing = choice.slotId ? catalog.slots.find(s => s.id === choice.slotId && s.active && s.unit_id === a.unit_id && s.title_id === a.title_id && s.role_id === role.id) : undefined;
    if (choice.slotId && !existing) throw new Error('Ô không khớp Role, chức danh hoặc đơn vị.');
    const id = existing?.id ?? crypto.randomUUID();
    return [
      ...(!existing ? [{ action: 'slot' as const, data: { id, title_id: a.title_id, unit_id: a.unit_id, role_id: role.id, name: choice.name?.trim() || `${a.title_name} · ${a.user_name}` } }] : []),
      { action: 'bind_slot' as const, data: { id: a.id, slot_id: id, reviewed_role: role.id } },
    ];
  });
}

export function emptySlotCommand(titleId: string, unitId: string, roleId: string, name: string): OrgCommand {
  if (!titleId || !unitId || !roleId || !name.trim()) throw new Error('Chọn chức danh, đơn vị, Role và tên ô.');
  return { action: 'slot', data: { id: crypto.randomUUID(), title_id: titleId, unit_id: unitId, role_id: roleId, name: name.trim() } };
}