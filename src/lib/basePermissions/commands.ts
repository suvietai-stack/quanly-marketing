import type { OrgConfig } from './types';

export type OrgCommand = { action: 'unit' | 'title' | 'assign' | 'end' | 'cancel' | 'roles' | 'slot' | 'bind_slot' | 'restore_slots'; data: Record<string, unknown> };

/** A scoped edit submits only selected deltas, never replaces all personnel history. */
export function organizationCommands(before: OrgConfig, after: OrgConfig): OrgCommand[] {
  const commands: OrgCommand[] = [];
  for (const m of after.memberships) {
    const old = before.memberships.find(x => x.id === m.id);
    if (old && JSON.stringify(old) !== JSON.stringify(m)) {
      if (m.status === 'cancelled') commands.push({ action: 'cancel', data: { id: m.id } });
      else if (m.ends_at !== old.ends_at) commands.push({ action: 'end', data: { id: m.id, ends_at: m.ends_at, immediate: m.ends_at ? Date.parse(m.ends_at)<=Date.now()+1000 && Date.parse(m.ends_at)>Date.now()-10000 : true } });
      else throw new Error('Phân công đã lưu không thể sửa trực tiếp; kết thúc rồi tạo phân công mới.');
    }
  }
  for (const u of after.units) if (JSON.stringify(u) !== JSON.stringify(before.units.find(x => x.id === u.id))) commands.push({ action: 'unit', data: { ...u } });
  for (const t of after.titles) if (JSON.stringify(t) !== JSON.stringify(before.titles.find(x => x.id === t.id))) commands.push({ action: 'title', data: { ...t, level: t.level ?? 0, kind: t.kind ?? 'staff', capacity: t.capacity ?? 0 } });
  for (const m of after.memberships) if (!before.memberships.some(x => x.id === m.id)) commands.push({ action: 'assign', data: { ...m, immediate: m.starts_at ? Date.parse(m.starts_at)<=Date.now()+1000 && Date.parse(m.starts_at)>Date.now()-10000 : true } });
  for (const section of ['units', 'titles', 'memberships'] as const) {
    if (before[section].some(x => !after[section].some(y => y.id === x.id))) throw new Error('Không xóa lịch sử; hãy ngừng hoặc kết thúc phân công.');
  }
  const titleIds = new Set([...(before.role_links ?? []), ...(after.role_links ?? [])].map(l => l.title_id));
  for (const id of titleIds) {
    const old = (before.role_links ?? []).filter(l => l.title_id === id);
    const links = (after.role_links ?? []).filter(l => l.title_id === id);
    if (JSON.stringify(old) !== JSON.stringify(links)) commands.push({action:'roles',data:{id,roles:links.map(({role_id,is_primary,scope_kind,enabled_permissions})=>({role_id,is_primary,scope_kind,enabled_permissions:enabled_permissions??[]}))}});
  }
  return commands;
}