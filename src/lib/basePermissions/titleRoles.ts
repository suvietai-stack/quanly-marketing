import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { OrgCommand } from './commands';
// Mirror of private.org_role_permission_ready — permissions verified against server-side enforcement
// (leave/att RPCs + RLS via sig_can, fin_* RPCs + fin_can_see, oq_*/ot_* RPCs, orders trigger via design_can).
export const VERIFIED_APPOINTMENT_PERMISSIONS = [
  'leave.create','leave.view_own','leave.edit_own','leave.recall','leave.view_assigned','leave.view_all','leave.approve','leave.create_for','leave.edit_others','leave.cancel_handle','leave.exception','leave.reassign','leave.report','leave.export','leave.settings',
  'att.create','att.view_own','att.edit_own','att.witness','att.manage','att.reconcile','att.report','att.view_all','att.settings',
  'order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery','order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.send_request','order.view_all',
  'order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes',
  'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
  'ot.view_own','ot.task_view','ot.task_update','ot.stage_update','ot.accept','ot.assign','ot.create','ot.manage','ot.report','ot.report_export','ot.reschedule_propose','ot.reschedule_reply','ot.supplier','ot.view_all',
  'finance.incoming.view','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind',
  'kpi.view_own','overview.view','overview.own_only','settings.view',
];
export interface TitleLinkAudit { title_id: string; title_name: string; role_id: string; role_name: string; scope_kind: string; signature_valid: boolean; enabled: string[]; eligible: string[]; blocked: {key:string;reason:string}[] }
export function auditReasonLabel(reason: string) {
  const labels: Record<string,string> = { native_personal_verified: 'Đã kiểm chứng điều kiện cá nhân/nghiệp vụ', appointment_only: 'Giữ nguyên nguồn bổ nhiệm Kinh doanh', finance_unit_scope_missing: 'Tài chính chưa giới hạn theo đơn vị bổ nhiệm', hr_unit_scope_missing: 'Nhân sự chưa giới hạn quản lý/báo cáo/xuất theo đơn vị', order_unit_scope_missing: 'Đơn hàng chưa giới hạn quản lý/xuất theo đơn vị', global_configuration: 'Quyền quản trị toàn hệ thống — không tự cấp theo chức vụ', backend_scope_workflow_missing: 'Chưa có rào phạm vi hoặc quy trình đầy đủ tại máy chủ' };
  return labels[reason] ?? 'Chưa hoàn tất kiểm tra phạm vi';
}
export interface RoleCheck { key: string; ready: boolean; reason: string }
export interface OriginalRole { id: string; name: string; catalog_state?: string; restricted: boolean; permissions: string[]; checks: RoleCheck[] }
export interface TitleRoleLink { title_source: 'base' | 'biz'; title_id: string; role_id: string; is_primary: boolean; scope_kind: 'unit' | 'own'; revision: number; active: boolean; enabled_permissions?: string[]; permission_signature?: string }
export interface TitleRoleRead { link_audits?: TitleLinkAudit[]; roles: OriginalRole[]; links: TitleRoleLink[]; titles: {id:string;name:string;active:boolean;source:string}[]; sources: {user_id:string;rules:{source_id:string;source_name:string;role_id:string;permission:string}[]}[]; direct_roles: { user_id: string; role_id: string }[]; activation_ready: boolean; events: { id: string; title_source: string; title_id: string; reason: string; created_at: string }[] }
export function titleRoleCommand(title: string, roles: Pick<TitleRoleLink, 'role_id'|'is_primary'|'scope_kind'|'enabled_permissions'>[], reason: string): OrgCommand { return {action:'roles',data:{id:title,roles,reason}}; }
export function roleDraftSnapshot(links: TitleRoleLink[]) {
  return [...links].sort((a, b) => a.role_id.localeCompare(b.role_id)).map(({ role_id, is_primary, scope_kind, revision }) => ({ role_id, is_primary, scope_kind, revision }));
}
export function canActivateRole(role: OriginalRole) {
  return !role.restricted && role.checks.length > 0 && role.checks.every(c => c.ready) && role.permissions.every(p => role.checks.some(c => c.key === p && c.ready));
}
// Suggestions map titles to the standard Role catalog only; never grant anything from a name.
const suggestions: Record<string, string> = {
  'Giám đốc Marketing': 'Giám đốc Marketing',
  'Trưởng phòng Marketing': 'Quản lý Marketing',
  'Trưởng nhóm Marketing': 'Quản lý Marketing',
  'Trưởng phòng Thiết kế': 'Quản lý Thiết kế',
  'Trưởng nhóm Thiết kế': 'Quản lý Thiết kế',
  'Nhân viên Thiết kế': 'Nhân viên Thiết kế',
  'Kế toán trưởng': 'Kế toán trưởng',
  'Kế toán kho': 'Kế toán kho',
  'Hành chính Nhân sự': 'Hành Chính Nhân Sự',
  'Trưởng phòng Mua hàng & Giao vận': 'Quản lý Mua hàng & Giao vận',
  'Nhân viên Thu mua': 'Thu mua',
  'Nhân viên Đóng hàng': 'Nhân viên Đóng hàng',
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
    throw new Error('Thiết lập Role đang chờ hoàn thiện xem trước tác động và xác nhận chung; quyền hiện tại giữ nguyên.');
  },
};