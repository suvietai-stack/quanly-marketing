import type { CatalogRole } from './roleCatalog';
import type { EditorPolicy } from './permissionEditor';
import { permissionDelta, presetPermissions } from './permissionEditor';

const personal = ['leave.create', 'leave.view_own', 'att.create', 'att.view_own'];
const manager = [...personal, 'leave.view_unit', 'ot.view_unit'];
const design = [...personal, 'order.view', 'order.view_mine', 'order.take', 'order.update_draft', 'order.submit', 'order.history'];
// Stable IDs identify suggestions only. No preset participates in permission resolution or automatic saving.
export const defaultRolePresets = [
  { roleId: 'role-9h328b84', name: 'Kinh Doanh Phân Phối', kind: 'position', keys: personal },
  { roleId: 'role-dong-hang', name: 'Nhân viên Đóng hàng', kind: 'position', keys: personal },
  { roleId: 'role-g8qc3q2s', name: 'Showroom', kind: 'position', keys: personal },
  { roleId: 'role-kinh-doanh', name: 'Kinh doanh Đơn Hàng', kind: 'position', keys: personal },
  { roleId: 'role-nhan-su-moi', name: 'Nhân sự mới', kind: 'position', keys: personal },
  { roleId: 'role-standard-account-chief', name: 'Kế toán trưởng', kind: 'position', keys: manager },
  { roleId: 'role-standard-account-stock', name: 'Kế toán kho', kind: 'position', keys: personal },
  { roleId: 'role-standard-buyer', name: 'Thu mua', kind: 'position', keys: personal },
  { roleId: 'role-standard-design-head', name: 'Quản lý Thiết kế', kind: 'position', keys: [...design, 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-standard-design-staff', name: 'Nhân viên Thiết kế', kind: 'position', keys: design },
  { roleId: 'role-standard-mkt-director', name: 'Giám đốc Marketing', kind: 'position', keys: manager },
  { roleId: 'role-standard-mkt-head', name: 'Quản lý Marketing', kind: 'position', keys: manager },
  { roleId: 'role-standard-mkt-staff', name: 'Nhân viên Marketing', kind: 'position', keys: personal },
  { roleId: 'role-standard-proc-head', name: 'Quản lý Mua hàng & Giao vận', kind: 'position', keys: manager },
  { roleId: 'role-standard-sales-head', name: 'Trưởng phòng Kinh doanh', kind: 'position', keys: manager },
  { roleId: 'role-standard-sales-staff', name: 'Nhân viên Kinh doanh', kind: 'position', keys: personal },
  { roleId: 'role-u0fzsvsp', name: 'Lead Kinh Doanh ĐH', kind: 'position', keys: manager },
  { roleId: 'role-viewer', name: 'Viewer / Ban Giám Đốc', kind: 'position', keys: manager },
  { roleId: 'role-wupj68a6', name: 'Hành Chính Nhân Sự', kind: 'position', keys: manager },
  { roleId: 'role-xwbmhg3b', name: 'Giám Đốc Kinh Doanh', kind: 'position', keys: manager },
  { roleId: 'role-content-web', name: 'Content Web', kind: 'marketing_task', keys: ['web.view', 'web.content_view', 'web.content_view_mine', 'web.outline_start', 'web.outline_submit', 'web.post_write_start', 'web.post_submit'] },
  { roleId: 'role-seo', name: 'SEO', kind: 'marketing_task', keys: ['web.view', 'web.keyword_view', 'web.keyword_open_sheet'] },
  { roleId: 'role-local-seo', name: 'Local SEO', kind: 'marketing_task', keys: ['local.view', 'local.view_mine', 'local.post_create', 'local.post_edit'] },
  { roleId: 'role-social', name: 'Social', kind: 'marketing_task', keys: ['social.view', 'social.post_view', 'social.post_view_mine', 'social.post_create', 'social.post_edit', 'social.post_start', 'social.post_submit'] },
  { roleId: 'role-video', name: 'Video', kind: 'marketing_task', keys: ['video.view', 'video.view_mine', 'video.create', 'video.script_start', 'video.script_submit', 'video.submit'] },
] as const;

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