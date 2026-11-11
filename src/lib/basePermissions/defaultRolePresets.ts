import type { CatalogRole } from './roleCatalog';
import type { EditorPolicy } from './permissionEditor';
import { permissionDelta, presetPermissions } from './permissionEditor';

const personal = ['leave.create', 'leave.view_own', 'att.create', 'att.view_own'];
const manager = [...personal, 'leave.view_unit', 'ot.view_unit'];
const design = [...personal, 'order.view', 'order.view_mine', 'order.take', 'order.update_draft', 'order.submit', 'order.history'];
// New canonical IDs only; all existing IDs remain legacy/protected. No preset resolves effective permissions.
export const defaultRolePresets = [
  { roleId: 'role-canonical-v1-executive', name: 'Giám đốc Điều hành', group: 'Quản trị & Điều hành', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-deputy-executive', name: 'Phó Giám đốc Điều hành', group: 'Quản trị & Điều hành', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-sales-director', name: 'Giám đốc Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-sales-head', name: 'Trưởng phòng Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-sales-team', name: 'Trưởng nhóm Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-sales-staff', name: 'Nhân viên Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: personal },
  { roleId: 'role-canonical-v1-showroom', name: 'Nhân viên Showroom', group: 'Kinh doanh', kind: 'position', keys: personal },
  { roleId: 'role-canonical-v1-distribution', name: 'Nhân viên Phân phối', group: 'Kinh doanh', kind: 'position', keys: personal },
  { roleId: 'role-canonical-v1-mkt-director', name: 'Giám đốc Marketing', group: 'Marketing', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-mkt-head', name: 'Trưởng phòng Marketing', group: 'Marketing', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-mkt-team', name: 'Trưởng nhóm Marketing', group: 'Marketing', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-mkt-staff', name: 'Nhân viên Marketing', group: 'Marketing', kind: 'position', keys: personal },
  { roleId: 'role-canonical-v1-design-head', name: 'Trưởng phòng Thiết kế', group: 'Thiết kế', kind: 'position', keys: [...design, 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-canonical-v1-design-team', name: 'Trưởng nhóm Thiết kế', group: 'Thiết kế', kind: 'position', keys: [...design, 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-canonical-v1-design-staff', name: 'Nhân viên Thiết kế', group: 'Thiết kế', kind: 'position', keys: design },
  { roleId: 'role-canonical-v1-account-chief', name: 'Kế toán trưởng', group: 'Vận hành', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-account-stock', name: 'Kế toán kho', group: 'Vận hành', kind: 'position', keys: personal },
  { roleId: 'role-canonical-v1-buyer', name: 'Nhân viên Thu mua', group: 'Vận hành', kind: 'position', keys: personal },
  { roleId: 'role-canonical-v1-proc-head', name: 'Trưởng phòng Mua hàng & Giao vận', group: 'Vận hành', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-hr', name: 'Hành chính Nhân sự', group: 'Vận hành', kind: 'position', keys: manager },
  { roleId: 'role-canonical-v1-task-content', name: 'Content Web', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: ['web.view','web.content_view','web.content_view_mine','web.outline_start','web.outline_submit','web.post_write_start','web.post_submit'] },
  { roleId: 'role-canonical-v1-task-seo', name: 'SEO', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: ['web.view','web.keyword_view','web.keyword_open_sheet'] },
  { roleId: 'role-canonical-v1-task-local', name: 'Local SEO', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: ['local.view','local.view_mine','local.post_create','local.post_edit'] },
  { roleId: 'role-canonical-v1-task-social', name: 'Social', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: ['social.view','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_start','social.post_submit'] },
  { roleId: 'role-canonical-v1-task-video', name: 'Video', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: ['video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.submit'] },
] as const;

export function isCanonicalRole(role: Pick<CatalogRole, 'id' | 'role_kind' | 'role_code'>) {
  return defaultRolePresets.some(p => p.roleId === role.id && p.kind === role.role_kind) && role.role_code === role.id;
}

export function defaultRoleImpact(role: CatalogRole, policy: EditorPolicy[]) {
  const preset = defaultRolePresets.find(p => p.roleId === role.id && p.kind === role.role_kind);
  if (!preset || role.catalog_state !== 'standard') return undefined;
  const suggested = presetPermissions(preset.keys, policy, role.role_kind);
  const protectedRole = role.is_system || role.role_kind === 'system';
  // Protected positions remain byte-equivalent; the suggestion is visible but cannot replace their rights.
  const after = protectedRole ? [...role.permissions] : suggested;
  return { preset, protectedRole, suggested, after, ...permissionDelta(role.permissions, after),
    kept: role.permissions.filter(k => after.includes(k)),
    unavailable: preset.keys.filter(k => !suggested.includes(k)),
    receivers: role.receivers, sources: role.receiver_counts,
  };
}