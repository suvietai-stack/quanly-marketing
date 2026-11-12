import type { CatalogRole } from './roleCatalog';
import type { EditorPolicy } from './permissionEditor';
import { permissionDelta, presetPermissions } from './permissionEditor';

// Suggestions are responsibility-based drafts, never a legacy union or an automatic live reset.
const personal = ['att.create', 'att.view_own', 'leave.create', 'leave.view_own', 'leave.recall'];
const ownTasks = ['task.view', 'task.view_mine', 'task.accept', 'task.start', 'task.update_result', 'task.submit_completion', 'task.resubmit_completion', 'task.view_history', 'task.add_note'];
const sales = ['biz.crm_use', 'signal.sale', 'oq.create', 'oq.view_own', 'oq.accept', 'oq.report_own', 'ot.view_own'];
// Draft suggestions only: unavailable additions are removed by live editor policy below.
const salesPersonalBiz = ['biz.view_own', 'biz.goal_submit', 'biz.plan_submit', 'biz.report_submit'];
const salesManagedBiz = ['biz.view_dept'];
const designer = ['order.view', 'order.view_mine', 'order.take', 'order.update_draft', 'order.submit', 'order.resubmit', 'order.deliver', 'order.history', 'order.open_delivery'];
const supply = ['oq.view_own', 'oq.accept', 'oq.reply_price', 'oq.reply_progress', 'oq.report_own', 'ot.view_own', 'ot.task_view', 'ot.task_update', 'ot.reschedule_reply'];
const packing = ['ot.view_own', 'ot.task_view', 'ot.accept', 'ot.task_update', 'ot.stage_update', 'ot.reschedule_reply'];
const finance = ['finance.incoming.view', 'finance.incoming.manual_view'];
export const defaultRolePresets = [
  { roleId: 'role-v2-sales-director', name: 'Giám đốc Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: [...personal, ...sales, ...salesManagedBiz, 'biz.crm_view_scope', 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-v2-sales-head', name: 'Trưởng phòng Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: [...personal, ...sales, ...salesPersonalBiz, ...salesManagedBiz, 'biz.crm_view_scope', 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-v2-sales-team', name: 'Trưởng nhóm Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: [...personal, ...sales, ...salesPersonalBiz, ...salesManagedBiz, 'biz.crm_view_scope', 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-v2-sales-staff', name: 'Nhân viên Kinh doanh', group: 'Kinh doanh', kind: 'position', keys: [...personal, ...sales, ...salesPersonalBiz, 'finance.incoming.view', 'finance.incoming.claim', 'finance.incoming.manual_view'] },
  { roleId: 'role-v2-design-head', name: 'Trưởng phòng Thiết kế', group: 'Thiết kế', kind: 'position', keys: [...personal, ...designer, 'leave.view_unit'] },
  { roleId: 'role-v2-design-staff', name: 'Nhân viên Thiết kế', group: 'Thiết kế', kind: 'position', keys: [...personal, ...designer] },
  { roleId: 'role-v2-mkt-director', name: 'Giám đốc Marketing', group: 'Marketing', kind: 'position', keys: [...personal, ...ownTasks, 'leave.view_unit'] },
  { roleId: 'role-v2-mkt-head', name: 'Trưởng phòng Marketing', group: 'Marketing', kind: 'position', keys: [...personal, ...ownTasks, 'leave.view_unit'] },
  { roleId: 'role-v2-mkt-staff', name: 'Nhân viên Marketing', group: 'Marketing', kind: 'position', keys: [...personal, ...ownTasks, 'kpi.view_own', 'overview.view', 'overview.own_only'] },
  { roleId: 'role-v2-hr', name: 'Hành chính Nhân sự', group: 'Hành chính & Nhân sự', kind: 'position', keys: [...personal, 'leave.view_assigned', 'leave.approve', 'leave.report', 'att.view_all', 'att.report', 'att.reconcile'] },
  { roleId: 'role-v2-packing', name: 'Đóng hàng', group: 'Vận hành', kind: 'position', keys: [...personal, ...packing] },
  { roleId: 'role-v2-delivery', name: 'Giao vận', group: 'Vận hành', kind: 'position', keys: [...personal, ...packing] },
  { roleId: 'role-v2-purchasing', name: 'Thu mua', group: 'Cung ứng', kind: 'position', keys: [...personal, ...supply, 'ot.reschedule_propose'] },
  { roleId: 'role-v2-supply-chain', name: 'Nhân viên Cung ứng', group: 'Cung ứng', kind: 'position', keys: [...personal, ...supply] },
  { roleId: 'role-v2-proc-head', name: 'Quản lý Mua hàng & Giao vận', group: 'Cung ứng', kind: 'position', keys: [...personal, ...supply, 'leave.view_unit', 'ot.view_unit'] },
  { roleId: 'role-v2-accountant', name: 'Kế toán', group: 'Tài chính', kind: 'position', keys: [...personal, ...finance, 'finance.incoming.manual_create'] },
  { roleId: 'role-v2-account-chief', name: 'Kế toán trưởng', group: 'Tài chính', kind: 'position', keys: [...personal, ...finance, 'finance.incoming.view_totals', 'finance.incoming.manual_create'] },
  { roleId: 'role-v2-account-stock', name: 'Kế toán kho', group: 'Tài chính', kind: 'position', keys: [...personal, ...finance] },
  { roleId: 'role-v2-executive', name: 'Giám đốc Điều hành', group: 'Quản trị & Điều hành', kind: 'position', keys: [...personal] },
  { roleId: 'role-v2-deputy-exec', name: 'Phó Giám đốc Điều hành', group: 'Quản trị & Điều hành', kind: 'position', keys: [...personal] },
  { roleId: 'role-v2-task-content-web', name: 'Content Web', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: [...ownTasks, 'web.view', 'web.content_view', 'web.content_view_mine', 'web.content_history', 'web.content_note', 'web.open_detail', 'web.outline_start', 'web.outline_submit', 'web.outline_resubmit', 'web.post_write_start', 'web.post_submit', 'web.post_resubmit', 'web.view_web_draft_url', 'web.start_web_draft_layout', 'web.submit_web_draft_review', 'web.resubmit_web_draft_review', 'web.edit_web_draft_url', 'web.view_web_draft_revision_note'] },
  { roleId: 'role-v2-task-seo', name: 'SEO', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: [...ownTasks, 'web.view', 'web.keyword_view', 'web.keyword_open_sheet', 'web.index_view', 'web.open_detail', 'web.open_published_url'] },
  { roleId: 'role-v2-task-local-seo', name: 'Local SEO', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: [...ownTasks, 'local.view', 'local.view_mine', 'local.post_create', 'local.post_edit', 'local.photo', 'local.products', 'local.review', 'local.review_reply'] },
  { roleId: 'role-v2-task-social', name: 'Social', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: [...ownTasks, 'social.view', 'social.post_view', 'social.post_view_mine', 'social.post_create', 'social.post_edit', 'social.post_start', 'social.post_submit', 'social.post_resubmit', 'social.post_history'] },
  { roleId: 'role-v2-task-video', name: 'Video', group: 'Nhiệm vụ Marketing', kind: 'marketing_task', keys: [...ownTasks, 'video.view', 'video.view_mine', 'video.create', 'video.script_start', 'video.script_submit', 'video.script_resubmit', 'video.move_shooting', 'video.footage', 'video.move_editing', 'video.edit_cut', 'video.submit', 'video.resubmit', 'video.deliver', 'video.history'] },
] as const;

export function isCanonicalRole(role: Pick<CatalogRole, 'id' | 'role_kind' | 'role_code'>) {
  return defaultRolePresets.some(p => p.roleId === role.id && p.kind === role.role_kind) && role.role_code === role.id;
}

// Dedicated business additions never reduce unrelated CRM/Signals/finance rights on an existing Role.
export function salesBusinessDraft(role: CatalogRole, policy: EditorPolicy[]) {
  const preset = defaultRolePresets.find(p => p.roleId === role.id && p.group === 'Kinh doanh');
  if (!preset || role.is_system || role.role_kind !== 'position') return undefined;
  const keys = preset.keys.filter(k => k.startsWith('biz.') && !k.startsWith('biz.crm_'));
  const ready = presetPermissions(keys, policy, 'position');
  const after = [...new Set([...role.permissions, ...ready])];
  return { after, ...permissionDelta(role.permissions, after), unavailable: keys.filter(k => !ready.includes(k)) };
}

export function defaultRoleImpact(role: CatalogRole, policy: EditorPolicy[]) {
  const preset = defaultRolePresets.find(p => p.roleId === role.id && p.kind === role.role_kind);
  if (!preset || role.catalog_state !== 'standard') return undefined;
  // Retained rights already admitted by the backend stay in the draft. Policy gates NEW rights.
  // Filtering every key by editor policy would silently strip working CRM/finance/Design workflows.
  const newReady = presetPermissions(preset.keys, policy, role.role_kind);
  const suggested = [...new Set(preset.keys.filter(k => role.permissions.includes(k) || newReady.includes(k)))];
  const protectedRole = role.is_system || role.role_kind === 'system';
  // Protected positions remain byte-equivalent; the suggestion is visible but cannot replace their rights.
  const after = protectedRole ? [...role.permissions] : suggested;
  return { preset, protectedRole, suggested, after, ...permissionDelta(role.permissions, after),
    kept: role.permissions.filter(k => after.includes(k)),
    unavailable: preset.keys.filter(k => !suggested.includes(k)),
    receivers: role.receivers, sources: role.receiver_counts,
  };
}
