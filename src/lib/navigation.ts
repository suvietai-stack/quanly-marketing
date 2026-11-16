import { BookOpenText, MessageCircleHeart, LayoutDashboard, ListChecks, Building2, Globe, Share2, MapPin, Video, Palette, Camera, BarChart3, Target, Settings, FileText, Radar, ClipboardCheck, PackageSearch, Truck, BanknoteArrowDown, Star, Gift, Wallet, Fingerprint, Trophy, Briefcase, Store, Megaphone, Users, MessageSquare, Package, type LucideIcon } from 'lucide-react';
import type { PermissionKey } from '@/lib/auth';

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; badge?: string; perm?: PermissionKey; anyPerm?: PermissionKey[]; kpi?: boolean; adminOnly?: boolean; comingSoon?: boolean };
export type NavGroup = { label: string; icon?: LucideIcon; items: NavItem[]; comingSoon?: boolean };
export const navigationGroups: NavGroup[] = [
  { label: "Điều hành", icon: LayoutDashboard, items: [
{ to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true, perm: "overview.view" },
      { to: "/tasks", label: "Task To-do List", icon: ListChecks, perm: "task.view" },
{ to: "/approvals", label: "Phê duyệt", icon: ClipboardCheck },
    { to: "/community", label: "Cộng đồng Sứ Việt", icon: MessageCircleHeart },
    { to: "/k3-center", label: "Trung tâm 3K", icon: ClipboardCheck, perm: "k3hub.center" },
  ] },
  { label: "Trung tâm hội thoại", icon: MessageSquare, items: [
    { to: "/inbox", label: "Messenger Fanpage", icon: MessageSquare, perm: "inbox.view" },
    { to: "/web-chat", label: "Tư vấn Website", icon: Globe,  },
  ] },
  { label: "Kinh doanh", icon: Briefcase, items: [
    { to: "/biz/crm", label: "CRM Khách Hàng", icon: Users, perm: "biz.crm_use" },
    { to: "/biz", label: "Tổng quan Kinh doanh", icon: Briefcase, exact: true, anyPerm: ["biz.dashboard_public", "biz.view_own", "biz.view_dept", "biz.view_all"] },
    { to: "/biz/3k-area", label: "3K Kinh doanh", icon: ClipboardCheck, perm: "k3hub.biz" },
    { to: "/signals", label: "Danh sách tín hiệu", icon: Radar, anyPerm: ["signal.create", "signal.view_all", "signal.manage", "signal.sale", "signal.assign"] },
    { to: "/signals/report", label: "Báo cáo tín hiệu", icon: FileText, anyPerm: ["signal.report", "signal.manage"] },
    { to: "/biz/plans", label: "Kế hoạch", icon: FileText, anyPerm: ["biz.plan_submit", "biz.plan_request_revision", "biz.plan_approve", "biz.view_dept", "biz.view_all"] },
    { to: "/biz/goals", label: "Mục tiêu KR", icon: Target, anyPerm: ["biz.goal_submit", "biz.goal_approve", "biz.view_dept", "biz.view_all"] },
    { to: "/biz/reports", label: "Báo cáo Kinh doanh", icon: ClipboardCheck, anyPerm: ["biz.report_submit", "biz.report_approve", "biz.view_dept", "biz.view_all"] },
    { to: "/biz/approvals", label: "Phê duyệt", icon: ClipboardCheck, anyPerm: ["biz.approval_view", "biz.goal_approve", "biz.report_approve", "biz.view_all", "biz.view_dept"] },
    { to: "/biz/sale-work", label: "Sale Work Zalo", icon: MessageSquare, anyPerm: ["sale_work.access", "sale_work.manage_settings", "sale_work.manage_credentials"] },
    { to: "/biz/products", label: "Kho Sản Phẩm", icon: Package, comingSoon: true },
    { to: "/biz/settings", label: "Cài đặt Kinh doanh", icon: Settings, anyPerm: ["biz.org_manage", "biz.workflow_manage", "biz.kr_manage", "biz.dept_manage", "biz.deadline_manage", "settings.role"] },
  ] },
  { label: "Showroom", icon: Store, items: [
    { to: "/showroom", label: "Tổng quan Showroom", icon: Store, perm: "showroom.view" },
    { to: "/showroom/3k", label: "3K Showroom", icon: ClipboardCheck, perm: "showroom.k3.use" },
  ] },
  { label: "Marketing", icon: Megaphone, items: [
{ to: "/brands", label: "Thương Hiệu", icon: Building2, perm: "brand.view" },
{ to: "/websites", label: "Dự Án Web", icon: Globe, perm: "web.view" },
      { to: "/web-contents", label: "Tất cả Content Web", icon: FileText, perm: "web.view" },
      { to: "/social", label: "Kênh Social", icon: Share2, perm: "social.view" },
      { to: "/local", label: "Local Map", icon: MapPin, perm: "local.view" },
{ to: "/videos", label: "Sản Xuất Video", icon: Video, perm: "video.view" },
    { to: "/settings/kpi-v2", label: "Giao KPI", icon: Target, kpi: true, anyPerm: ["kpi.view_own", "kpi.view_all", "kpi.goal_create", "kpi.goal_edit", "kpi.goal_archive", "kpi.goal_delete", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"] },
    { to: "/reports-v2", label: "Báo cáo KPI", icon: FileText, kpi: true, anyPerm: ["kpi.report"] },
  ] },
  { label: "Thiết Kế", icon: Palette, items: [
    { to: '/orders', label: 'Tất cả công việc', icon: ListChecks, anyPerm: ['order.view','order.photo.view','order.marketing_design.view','order.order_mockup.view'] },
    { to: '/design/photo', label: 'Chụp ảnh', icon: Camera, anyPerm: ['order.view','order.photo.view'] },
    { to: '/design/marketing', label: 'Ấn phẩm Marketing', icon: Palette, anyPerm: ['order.view','order.marketing_design.view'] },
    { to: '/design/mockups', label: 'Ma-két đơn hàng', icon: FileText, anyPerm: ['order.view','order.order_mockup.view'] },
    { to: '/design/reports', label: 'Báo cáo & Phân tích', icon: BarChart3, anyPerm: ['order.report_view','order.photo.report_view','order.marketing_design.report_view','order.order_mockup.report_view'] },
  ] },
  { label: "Mua Hàng & Giao Vận", icon: Truck, items: [
{ to: "/order-quotes", label: "Hỏi Giá & Tiến Độ", icon: PackageSearch, anyPerm: ["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"] },
{ to: "/order-tracking", label: "Theo Dõi Đơn Hàng", icon: Truck, anyPerm: ["ot.view_own", "ot.view_all", "ot.create", "ot.task_view", "ot.supplier", "ot.manage"] },
{ to: "/operations/3k", label: "3K Vận hành", icon: ClipboardCheck, perm: "k3hub.ops" },
{ to: "", label: "Quản Lý Mua Hàng", icon: PackageSearch, comingSoon: true },
{ to: "", label: "Quản Lý Giao Vận", icon: Truck, comingSoon: true },
  ] },
  { label: "Kế Toán & Tài Chính", icon: BanknoteArrowDown, items: [
{ to: "/finance/incoming", label: "Tiền Về", icon: BanknoteArrowDown, perm: "finance.incoming.view" },
{ to: "/finance/advance", label: "Đề Nghị Tạm Ứng", icon: Wallet },
{ to: "/finance/payment", label: "Đề Nghị Thanh Toán", icon: FileText },
{ to: "/finance/salary", label: "Tạm Ứng Lương", icon: BanknoteArrowDown },
{ to: "/operations/3k-accounting", label: "3K Kế toán", icon: ClipboardCheck, perm: "k3hub.ops_accounting" },
  ] },
  { label: "Hành Chính & Nhân Sự", icon: Users, items: [
{ to: "/organization", label: "Cơ cấu tổ chức", icon: Building2 },
{ to: "/leave", label: "Nghỉ phép & Đi sớm muộn", icon: ClipboardCheck, anyPerm: ["leave.view_own", "leave.create", "leave.view_assigned", "leave.approve", "leave.view_all", "leave.report"] },
{ to: "/attendance", label: "Giải trình chấm công", icon: Fingerprint, anyPerm: ["att.create", "att.view_own", "att.witness", "att.view_all", "att.reconcile", "att.report", "att.manage"] },
{ to: "/operations/3k-hr", label: "3K Hành chính & Nhân sự", icon: ClipboardCheck, perm: "k3hub.ops_hr" },
  ] },
  { label: "Sao Sứ Việt", icon: Star, items: [
{ to: '/sao', label: 'Ví Sao của tôi', icon: Wallet },
    { to: '/sao/leaderboard', label: 'Bảng thành tích', icon: Trophy },
    { to: '/sao/shop', label: 'Gian hàng đổi quà', icon: Gift },
    { to: '/sao/admin', label: 'Quản lý thưởng Sao', icon: Star, anyPerm: ['sao.program_manage', 'sao.shop_manage', 'sao.manual_grant'] },
  ] },
  { label: "Hệ thống", icon: Settings, items: [
{ to: "/settings", label: "Cài Đặt", icon: Settings, perm: "settings.view" },
    { to: "/ai-knowledge", label: "Kho kiến thức AI", icon: BookOpenText, adminOnly: true },
  ] },
];
export type NavigationAccess = { can: (permission: PermissionKey) => boolean; isSuperAdmin: boolean; isKpiAdmin: boolean; isKpiManager: boolean; kpiEnabled: boolean; hasAssignedApprovals: boolean; canApprove: boolean; pendingCount: number; approvalsEligible?: boolean };
export function visibleNavigation(access: NavigationAccess): NavGroup[] {
  const { can, isSuperAdmin, isKpiAdmin } = access;
  // The cross-module approval aggregation may be slow/unavailable; capability to
  // enter the center must come from effective server permissions, not its item count.
  const canOpenApprovalCenter = !!access.approvalsEligible || isSuperAdmin || [
    'leave.approve','leave.cancel_handle','biz.approval_view',
    'biz.goal_approve','biz.report_approve',
    'fr.advance.approve','fr.payment.approve','fr.salary.approve',
    'att.witness','ot.reschedule_reply','task.approve_completion',
  ].some(can);
  return navigationGroups.map(group => {
    const items = group.items.filter(it => !it.comingSoon &&
      (it.to !== '/approvals' || canOpenApprovalCenter) &&
      (!it.to.startsWith('/design/') || !['/design/photo','/design/marketing','/design/mockups'].includes(it.to) ||
        (!['photo','marketing_design','order_mockup'].some(f=>can(`order.${f}.view`)) || can(`order.${it.to==='/design/photo'?'photo':it.to==='/design/marketing'?'marketing_design':'order_mockup'}.view`))) &&
      (!it.perm || can(it.perm)) &&
      (!it.anyPerm || (isSuperAdmin && it.to.startsWith('/biz')) ||
        (it.to === '/biz/approvals' && access.hasAssignedApprovals) ||
        (isKpiAdmin && it.kpi) || it.anyPerm.some(can)) &&
      (!it.kpi || access.kpiEnabled) && (!it.adminOnly || (it.to === '/organization' || it.to === '/ai-knowledge' ? isSuperAdmin : isKpiAdmin)))
      .map(it => it.to === '/settings/kpi-v2' && !access.isKpiManager ? { ...it, label: 'KPI của tôi' } : it)
      .map(it => it.to === '/settings' && access.canApprove && access.pendingCount > 0 ? { ...it, badge: `${access.pendingCount} chờ duyệt` } : it);
    return { ...group, items: items.length ? [...items, ...group.items.filter(it => it.comingSoon)] : [] };
  }).filter(group => group.comingSoon || group.items.length > 0);
}
export function activeNavigationPath(groups: NavGroup[], path: string): string | undefined {
  return groups.flatMap(g => g.items).filter(it => !it.comingSoon && (path === it.to || (!it.exact && path.startsWith(it.to + '/')))).sort((a,b) => b.to.length - a.to.length)[0]?.to;
}


