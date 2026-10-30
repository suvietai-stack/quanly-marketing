import { useBranding, BrandMark } from "@/lib/branding";
import { isKpiV2Enabled } from "@/lib/kpi/service";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ListChecks, Building2, Globe, Share2, MapPin,
  Video, Palette, Target, Settings, Menu, FileText, LogOut, User as UserIcon, Radar, ClipboardCheck, PackageSearch, Truck, BanknoteArrowDown, Star, Gift, Wallet, Fingerprint, Trophy, Briefcase,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQuery } from '@tanstack/react-query';
import { approvalsQuery } from '@/lib/biz/organizationQueries';
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/ZaloUi";
import { ZaloInteractionReminder } from "@/components/ZaloInteractionReminder";
import { ChipiAssistant } from "@/components/ChipiAssistant";
import { RewardPopup } from '@/components/sao/RewardPopup';
import { useAuth, useCurrentUser, type PermissionKey } from "@/lib/auth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; label: string; icon: any; exact?: boolean; badge?: string; perm?: PermissionKey; anyPerm?: PermissionKey[]; kpi?: boolean; adminOnly?: boolean };

const groups: { label: string; items: NavItem[] }[] = [
  { label: 'Sao Sứ Việt', items: [
    { to: '/sao', label: 'Ví Sao của tôi', icon: Wallet },
    { to: '/sao/leaderboard', label: 'Bảng thành tích', icon: Trophy },
    { to: '/sao/shop', label: 'Gian hàng đổi quà', icon: Gift },
    { to: '/sao/admin', label: 'Quản lý thưởng Sao', icon: Star, anyPerm: ['sao.program_manage', 'sao.shop_manage', 'sao.manual_grant'] },
  ] },
  {
    label: "Điều hành",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true, perm: "overview.view" },
      { to: "/tasks", label: "Task To-do List", icon: ListChecks, perm: "task.view" },
    ],
  },
  {
    label: "Nền tảng",
    items: [{ to: "/brands", label: "Thương Hiệu", icon: Building2, perm: "brand.view" }],
  },
  {
    label: "Kênh Marketing",
    items: [
      { to: "/websites", label: "Dự Án Web", icon: Globe, perm: "web.view" },
      { to: "/web-contents", label: "Tất cả Content Web", icon: FileText, perm: "web.view" },
      { to: "/social", label: "Kênh Social", icon: Share2, perm: "social.view" },
      { to: "/local", label: "Local Map", icon: MapPin, perm: "local.view" },
    ],
  },
  {
    label: "Sản xuất nội dung",
    items: [
      { to: "/videos", label: "Sản Xuất Video", icon: Video, perm: "video.view" },
      { to: "/orders", label: "Order Thiết Kế", icon: Palette, perm: "order.view" },
    ],
  },
  {
    label: "Đơn hàng",
    items: [
      { to: "/order-quotes", label: "Hỏi Giá & Tiến Độ", icon: PackageSearch, anyPerm: ["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"] },
      { to: "/order-tracking", label: "Theo Dõi Đơn Hàng", icon: Truck, anyPerm: ["ot.view_own", "ot.view_all", "ot.create", "ot.task_view", "ot.supplier", "ot.manage"] },
    ],
  },
  {
    label: "Tín hiệu cơ hội",
    items: [
      { to: "/signals", label: "Danh sách tín hiệu", icon: Radar, anyPerm: ["signal.create", "signal.view_all", "signal.manage", "signal.sale", "signal.assign"] },
      { to: "/signals/report", label: "Báo cáo tín hiệu", icon: FileText, anyPerm: ["signal.report", "signal.manage"] },
    ],
  },
  {
    label: "KPI",
    items: [
      { to: "/settings/kpi-v2", label: "Giao KPI", icon: Target, kpi: true, anyPerm: ["kpi.view_own", "kpi.view_all", "kpi.goal_create", "kpi.goal_edit", "kpi.goal_archive", "kpi.goal_delete", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"] },
      { to: "/reports-v2", label: "Báo cáo", icon: FileText, kpi: true, anyPerm: ["kpi.report"] },
    ],
  },
  {
    label: "Quản trị Kinh doanh",
    items: [
      { to: "/biz", label: "Tổng quan", icon: Briefcase, exact: true, anyPerm: ["biz.view_own", "biz.view_dept", "biz.view_all"] },
      { to: "/biz/plans", label: "Kế hoạch", icon: FileText, anyPerm: ["biz.plan_submit", "biz.plan_request_revision", "biz.plan_approve", "biz.view_dept", "biz.view_all"] },
      { to: "/biz/goals", label: "Mục tiêu KR", icon: Target, anyPerm: ["biz.goal_submit", "biz.goal_approve", "biz.view_dept", "biz.view_all"] },
      { to: "/biz/reports", label: "Báo cáo", icon: ClipboardCheck, anyPerm: ["biz.report_submit", "biz.report_approve", "biz.view_dept", "biz.view_all"] },
      { to: "/biz/approvals", label: "Phê duyệt", icon: ClipboardCheck, anyPerm: ["biz.approval_view", "biz.goal_approve", "biz.report_approve", "biz.view_all", "biz.view_dept"] },
      { to: "/biz/settings", label: "Cài đặt", icon: Settings, anyPerm: ["biz.org_manage", "biz.workflow_manage", "biz.kr_manage", "biz.dept_manage", "biz.deadline_manage", "settings.role"] },
    ],
  },
  {
    label: "Nhân sự & Chấm công",
    items: [
      { to: "/leave", label: "Nghỉ phép & Đi sớm muộn", icon: ClipboardCheck, anyPerm: ["leave.view_own", "leave.create", "leave.view_assigned", "leave.approve", "leave.view_all", "leave.report"] },
      { to: "/attendance", label: "Giải trình chấm công", icon: Fingerprint, anyPerm: ["att.create", "att.view_own", "att.witness", "att.view_all", "att.reconcile", "att.report", "att.manage"] },
    ],
  },
  {
    label: "Tài Chính Kế Toán",
    items: [
      { to: "/finance/incoming", label: "Tiền Về", icon: BanknoteArrowDown, perm: "finance.incoming.view" },
    ],
  },
  {
    label: "Mở rộng & Hệ thống",
    items: [
      { to: "/settings", label: "Cài Đặt", icon: Settings, perm: "settings.view" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, can, isSuperAdmin } = useCurrentUser();
  const approvals = useQuery({ ...approvalsQuery(user?.id ?? ''), enabled: !!user?.id });
  const logout = useAuth((s) => s.logout);
  const brand = useBranding();
  const pendingCount = useAuth((s) => s.users.filter((u) => u.status === "Chờ duyệt").length);
  const isKpiAdmin = isSuperAdmin || user?.roleId === "role-admin";
  const isKpiManager = isKpiAdmin || ["kpi.view_all", "kpi.goal_create", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"].some((k) => can(k));
  const canApprove = isSuperAdmin || can("settings.account_approve");

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items
        .filter((it: any) => (!it.perm || can(it.perm)) && (!it.anyPerm || (isSuperAdmin && it.to.startsWith('/biz')) || (it.to === '/biz/approvals' && approvals.data?.has_assigned) || isKpiAdmin && it.kpi || it.anyPerm.some((k: PermissionKey) => can(k))) && (!it.kpi || isKpiV2Enabled()) && (!it.adminOnly || isKpiAdmin))
        .map((it) => (it.to === "/settings/kpi-v2" && !isKpiManager ? { ...it, label: "KPI của tôi" } : it))
        .map((it) =>
          it.to === "/settings" && canApprove && pendingCount > 0
            ? { ...it, badge: `${pendingCount} chờ duyệt` }
            : it
        ),
    }))
    .filter((g) => g.items.length > 0);

  const onLogout = () => { logout(); navigate({ to: "/login" }); };

  const UserMenu = user && (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-sidebar-accent text-sm">
        <div className="h-7 w-7 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-semibold">
          {user.fullName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="truncate text-sm font-medium">{user.fullName}</div>
          <div className="truncate text-[11px] text-sidebar-foreground/60">{role?.name || "—"}</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-xs font-normal text-muted-foreground">Đăng nhập với</div>
          <div>{user.username}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
          <UserIcon className="h-4 w-4 mr-2" />Hồ sơ cá nhân
        </DropdownMenuItem>
        {can("settings.view") && (
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <UserIcon className="h-4 w-4 mr-2" />Tài khoản & Cài đặt
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <BrandMark b={brand} className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight truncate">{brand.app_name}</div>
          <div className="text-xs text-sidebar-foreground/60 truncate">{brand.description}</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {visibleGroups.map((g) => (
          <div key={g.label}>
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                const active = isActive(it.to, it.exact);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-150",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md shadow-black/15"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent/70 text-sidebar-foreground/70">
                        {it.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-2 py-2 border-t border-sidebar-border flex items-center gap-1"><div className="flex-1 min-w-0">{UserMenu}</div><div className="hidden md:block"><NotificationBell /></div></div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden md:block sticky top-0 h-screen">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-card border-b px-4 h-14">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 rounded hover:bg-accent"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-semibold flex-1 truncate">{brand.app_name}</div>
          <NotificationBell />
          {user && (
            <button onClick={onLogout} className="p-2 rounded hover:bg-accent" title="Đăng xuất">
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {user && <ZaloInteractionReminder key={user.id} userId={user.id} />}
          {children}
        </main>
        {user && <ChipiAssistant key={user.id} userId={user.id} />}
        {user && <RewardPopup key={`sao-${user.id}`} userId={user.id} />}
      </div>
    </div>
  );
}

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
