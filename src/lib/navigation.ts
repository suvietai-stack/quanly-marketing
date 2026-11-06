import { LayoutDashboard, ListChecks, Building2, Globe, Share2, MapPin, Video, Palette, Target, Settings, FileText, Radar, ClipboardCheck, PackageSearch, Truck, BanknoteArrowDown, Star, Gift, Wallet, Fingerprint, Trophy, Briefcase, Store, Megaphone, Users, type LucideIcon } from 'lucide-react';
import type { PermissionKey } from '@/lib/auth';

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; badge?: string; perm?: PermissionKey; anyPerm?: PermissionKey[]; kpi?: boolean; adminOnly?: boolean; comingSoon?: boolean };
export type NavGroup = { label: string; icon?: LucideIcon; items: NavItem[]; comingSoon?: boolean };
export const navigationGroups: NavGroup[] = [
  { label: "Điều hành", icon: LayoutDashboard, items: [
{ to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true, perm: "overview.view" },
      { to: "/tasks", label: "Task To-do List", icon: ListChecks, perm: "task.view" },
{ to: "", label: "Trung tâm phê duyệt", icon: ClipboardCheck, comingSoon: true },
  ] },
  { label: "Kinh doanh", icon: Briefcase, items: [
{ to: "/biz", label: "Tổng quan Kinh doanh", icon: Briefcase, exact: true, anyPerm: ["biz.dashboard_public", "biz.view_own", "biz.view_dept", "biz.view_all"
{ to: "/signals", label: "Danh sách tín hiệu", icon: Radar, anyPerm: ["signal.create", "signal.view_all", "signal.manage", "signal.sale", "signal.assign"
{ to: "/settings/kpi-v2", label: "Giao KPI", icon: Target, kpi: true, anyPerm: ["kpi.view_own", "kpi.view_all", "kpi.goal_create", "kpi.goal_edit", "kpi.goal_archive", "kpi.goal_delete", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"
  ] },
  { label: "Showroom", icon: Store, comingSoon: true, items: [

  ] },
  { label: "Marketing", icon: Megaphone, items: [
{ to: "/brands", label: "Thương Hiệu", icon: Building2, perm: "brand.view" }
{ to: "/websites", label: "Dự Án Web", icon: Globe, perm: "web.view" },
      { to: "/web-contents", label: "Tất cả Content Web", icon: FileText, perm: "web.view" },
      { to: "/social", label: "Kênh Social", icon: Share2, perm: "social.view" },
      { to: "/local", label: "Local Map", icon: MapPin, perm: "local.view" },
{ to: "/videos", label: "Sản Xuất Video", icon: Video, perm: "video.view" },
  ] },
  { label: "Thiết Kế", icon: Palette, items: [
      { to: "/orders", label: "Order Thiết Kế", icon: Palette, perm: "order.view" },
  ] },
  { label: "Mua Hàng & Giao Vận", icon: Truck, items: [
{ to: "/order-quotes", label: "Hỏi Giá & Tiến Độ", icon: PackageSearch, anyPerm: ["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"
{ to: "", label: "Quản Lý Mua Hàng", icon: PackageSearch, comingSoon: true },
{ to: "", label: "Quản Lý Giao Vận", icon: Truck, comingSoon: true },
  ] },
  { label: "Kế Toán & Tài Chính", icon: BanknoteArrowDown, items: [
{ to: "/finance/incoming", label: "Tiền Về", icon: BanknoteArrowDown, perm: "finance.incoming.view" },
{ to: "", label: "Đề Nghị Tạm Ứng", icon: Wallet, comingSoon: true },
{ to: "", label: "Đề Nghị Thanh Toán", icon: FileText, comingSoon: true },
{ to: "", label: "Tạm Ứng Lương", icon: BanknoteArrowDown, comingSoon: true },
  ] },
  { label: "Hành Chính & Nhân Sự", icon: Users, items: [
{ to: "/leave", label: "Nghỉ phép & Đi sớm muộn", icon: ClipboardCheck, anyPerm: ["leave.view_own", "leave.create", "leave.view_assigned", "leave.approve", "leave.view_all", "leave.report"
  ] },
  { label: "Sao Sứ Việt", icon: Star, items: [
{ to: '/sao', label: 'Ví Sao của tôi', icon: Wallet },
    { to: '/sao/leaderboard', label: 'Bảng thành tích', icon: Trophy },
    { to: '/sao/shop', label: 'Gian hàng đổi quà', icon: Gift },
    { to: '/sao/admin', label: 'Quản lý thưởng Sao', icon: Star, anyPerm: ['sao.program_manage', 'sao.shop_manage', 'sao.manual_grant'
  ] },
  { label: "Hệ thống", icon: Settings, items: [
{ to: "/settings", label: "Cài Đặt", icon: Settings, perm: "settings.view" },
  ] },
];
export type NavigationAccess = { can: (permission: PermissionKey) => boolean; isSuperAdmin: boolean; isKpiAdmin: boolean; isKpiManager: boolean; kpiEnabled: boolean; hasAssignedApprovals: boolean; canApprove: boolean; pendingCount: number };
export function visibleNavigation(access: NavigationAccess): NavGroup[] {
  const { can, isSuperAdmin, isKpiAdmin } = access;
  return navigationGroups.map(group => {
    const items = group.items.filter(it => !it.comingSoon &&
      (!it.perm || can(it.perm)) &&
      (!it.anyPerm || (isSuperAdmin && it.to.startsWith('/biz')) ||
        (it.to === '/biz/approvals' && access.hasAssignedApprovals) ||
        (isKpiAdmin && it.kpi) || it.anyPerm.some(can)) &&
      (!it.kpi || access.kpiEnabled) && (!it.adminOnly || isKpiAdmin))
      .map(it => it.to === '/settings/kpi-v2' && !access.isKpiManager ? { ...it, label: 'KPI của tôi' } : it)
      .map(it => it.to === '/settings' && access.canApprove && access.pendingCount > 0 ? { ...it, badge: `${access.pendingCount} chờ duyệt` } : it);
    return { ...group, items: items.length ? [...items, ...group.items.filter(it => it.comingSoon)] : [] };
  }).filter(group => group.comingSoon || group.items.length > 0);
}
export function activeNavigationPath(groups: NavGroup[], path: string): string | undefined {
  return groups.flatMap(g => g.items).filter(it => !it.comingSoon && (path === it.to || (!it.exact && path.startsWith(it.to + '/')))).sort((a,b) => b.to.length - a.to.length)[0]?.to;
}
