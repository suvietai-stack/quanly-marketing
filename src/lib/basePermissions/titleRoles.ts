import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
export interface RoleCheck { key: string; ready: boolean; reason: string }
export interface OriginalRole { id: string; name: string; restricted: boolean; permissions: string[]; checks: RoleCheck[] }
export interface TitleRoleLink { title_source: 'base' | 'biz'; title_id: string; role_id: string; is_primary: boolean; scope_kind: 'unit' | 'own'; revision: number; active: boolean }
export interface TitleRoleRead { roles: OriginalRole[]; links: TitleRoleLink[]; direct_roles: { user_id: string; role_id: string }[]; activation_ready: boolean; events: { id: string; title_source: string; title_id: string; reason: string; created_at: string }[] }
export function roleDraftSnapshot(links: TitleRoleLink[]) {
  return [...links].sort((a, b) => a.role_id.localeCompare(b.role_id)).map(({ role_id, is_primary, scope_kind, revision }) => ({ role_id, is_primary, scope_kind, revision }));
}
export function canActivateRole(role: OriginalRole) {
  return !role.restricted && role.checks.length > 0 && role.checks.every(c => c.ready) && role.permissions.every(p => role.checks.some(c => c.key === p && c.ready));
}
// Suggestions are exact, conservative pairs only; never grant anything from a name.
const suggestions: Record<string, string> = {
  'Trưởng bộ phận Marketing': 'Leader Marketing',
  'Nhân viên Thiết kế': 'Designer / Chụp ảnh',
  'Kế toán kho': 'Kế Toán',
  'Nhân viên Thu mua': 'Cung Ứng',
  'Nhân viên Hành chính & Nhân sự': 'Hành Chính Nhân Sự',
};
export function suggestedRole(title: string, roles: OriginalRole[]) {
  return roles.find(r => !r.restricted && r.name === suggestions[title]);
}
export const titleRolesApi = {
  async read(): Promise<TitleRoleRead> {
    const { data, error } = await supabase.rpc('base_title_roles_read');
    if (error) throw new Error(error.message);
    return data as unknown as TitleRoleRead;
  },
  async save(source: 'base' | 'biz', title: string, roles: Pick<TitleRoleLink, 'role_id' | 'is_primary' | 'scope_kind'>[], expected: TitleRoleLink[], reason: string) {
    const { error } = await supabase.rpc('base_title_roles_save', { _source: source, _title: title, _roles: roles as unknown as Json, _expected: roleDraftSnapshot(expected) as unknown as Json, _reason: reason });
    if (error) throw new Error(error.message);
  },
};