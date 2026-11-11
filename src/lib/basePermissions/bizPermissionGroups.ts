// UI-only grouping of existing backend biz.* keys. Never creates keys and never grants access.
export const BIZ_GROUP = 'Quản trị Kinh doanh';
export const bizSubgroups = [
  { id: 'dashboard', name: 'Dashboard', keys: ['biz.view_own', 'biz.view_dept', 'biz.view_all', 'biz.dashboard_public'] },
  { id: 'goals', name: 'Mục tiêu KR', keys: ['biz.goal_submit', 'biz.goal_approve', 'biz.kr_manage'] },
  { id: 'plans', name: 'Kế hoạch', keys: ['biz.plan_submit', 'biz.plan_request_revision', 'biz.plan_approve'] },
  { id: 'reports', name: 'Báo cáo', keys: ['biz.report_submit', 'biz.report_approve', 'biz.deadline_manage'] },
  { id: 'org', name: 'Cơ cấu & Phê duyệt', keys: ['biz.approval_view', 'biz.dept_manage', 'biz.org_manage', 'biz.workflow_manage'] },
] as const;
// Viewing KR, plans and reports reuses the shared Dashboard view scope; no separate view keys exist.
export const bizViewNote = 'Xem KR, Kế hoạch, Báo cáo dùng chung phạm vi xem ở Dashboard (cá nhân / phòng / toàn Khối).';
export const bizSourceNote = 'Máy chủ hiện cấp quyền này theo bổ nhiệm Kinh doanh, chưa nhận từ Role. Chưa thể tích trong Role.';
export function bizSubgroupOf(key: string) {
  return bizSubgroups.find(g => (g.keys as readonly string[]).includes(key))?.id ?? (key.startsWith('biz.') && !key.startsWith('biz.crm_') ? 'other' : undefined);
}
