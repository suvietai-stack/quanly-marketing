import { useBranding, BrandMark } from "@/lib/branding";
import { isKpiV2Enabled } from "@/lib/kpi/service";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LogOut, User as UserIcon, PanelLeftClose, PanelLeftOpen, ClipboardCheck,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from '@tanstack/react-query';
import { approvalsQuery } from '@/lib/biz/organizationQueries';
import { approvalCenterQuery, badgeText } from '@/lib/approvals/api';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppNavigation } from "@/components/AppNavigation";
import { visibleNavigation } from "@/lib/navigation";
import { MobileLauncher } from '@/components/MobileLauncher';
import { MobileAppChrome } from '@/components/MobileAppChrome';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationBell } from "@/components/ZaloUi";
import { ZaloInteractionReminder } from "@/components/ZaloInteractionReminder";
import { ChipiAssistant } from "@/components/ChipiAssistant";
import { RewardPopup } from '@/components/sao/RewardPopup';
import { useAuth, useCurrentUser } from "@/lib/auth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const search = useRouterState({ select: r => r.location.search as { area?: string; view?: string } });
  const mobile = useIsMobile();
  const [viewportReady, setViewportReady] = useState(false);
  useEffect(() => { setViewportReady(true); }, []);
  const launcher = mobile && path === '/' && search.view !== 'dashboard';
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, role, can, isSuperAdmin } = useCurrentUser();
  const approvals = useQuery({ ...approvalsQuery(user?.id ?? ''), enabled: !!user?.id });
  const approvalCenter = useQuery({ ...approvalCenterQuery(user?.id ?? ''), enabled: !!user?.id });
  const approvalsEligible = !!approvalCenter.data?.eligible;
  const approvalBadge = badgeText(approvalCenter.data?.todo.length ?? 0);
  const bizAccess = useAuth(s => s.bizAccess);
  const baseAccess = useAuth(s => s.baseAccess);
  useEffect(() => {
    if (!user?.id) return;
    const refresh = () => { if (document.visibilityState === 'visible') void useAuth.getState().refreshBaseAccess(); };
    // Máy chủ vẫn kiểm tra quyền mỗi thao tác; làm mới định kỳ chỉ để menu cập nhật, nên giãn 2 phút + khi quay lại tab.
    const timer = setInterval(refresh, 120000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener('focus', refresh);
    const boundary = baseAccess?.next_transition_at ? Math.max(0, new Date(baseAccess.next_transition_at).getTime() - Date.now() + 100) : null;
    const transition = boundary !== null && boundary < 2147483647 ? setTimeout(() => void useAuth.getState().refreshBaseAccess(true), boundary) : null;
    return () => { clearInterval(timer); if (transition !== null) clearTimeout(transition); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [user?.id, baseAccess?.next_transition_at]);
  const launcherAccessReady = !!user && (isSuperAdmin || (bizAccess?.user_id === user.id && baseAccess?.user_id === user.id)) && approvals.isSuccess && !!approvals.data;
  const logout = useAuth((s) => s.logout);
  const brand = useBranding();
  const pendingCount = useAuth((s) => s.users.filter((u) => u.status === "Chờ duyệt").length);
  const isKpiAdmin = isSuperAdmin || user?.roleId === "role-admin";
  const isKpiManager = isKpiAdmin || ["kpi.view_all", "kpi.goal_create", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"].some((k) => can(k));
  const canApprove = isSuperAdmin || can("settings.account_approve");

  const visibleGroups = visibleNavigation({ can, isSuperAdmin, isKpiAdmin, isKpiManager,
    kpiEnabled: isKpiV2Enabled(), hasAssignedApprovals: !!approvals.data?.has_assigned,
    canApprove, pendingCount, approvalsEligible });

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

  const Sidebar = (mini: boolean) => (
    <aside className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", mini ? "w-16" : "w-72")}>
      <div className={cn("flex items-center gap-2 py-5 border-b border-sidebar-border", mini ? "px-3" : "px-5")}>
        <BrandMark b={brand} className="h-9 w-9 shrink-0 rounded-lg" />
        <div className={cn("min-w-0", mini && "hidden")}>
          <div className="text-sm font-semibold tracking-tight truncate">{brand.app_name}</div>
          <div className="text-xs text-sidebar-foreground/60 truncate">{brand.description}</div>
        </div>
      </div>
      <AppNavigation groups={visibleGroups} path={path} userId={user?.id} collapsed={mini} onNavigate={() => setOpen(false)} />
      <div className="px-2 py-2 border-t border-sidebar-border flex items-center gap-1">
        {!mini && <><div className="flex-1 min-w-0">{UserMenu}</div>{approvalsEligible && (
          <Button variant="ghost" size="icon" className="hidden md:inline-flex relative shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
            <Link to="/approvals" aria-label={`Phê duyệt${approvalBadge ? ` (${approvalBadge} chờ)` : ''}`} title="Trung tâm Phê duyệt">
              <ClipboardCheck className="h-5 w-5" />
              {approvalBadge && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">{approvalBadge}</span>}
            </Link>
          </Button>
        )}<div className="hidden md:block"><NotificationBell /></div></>}
        <Button variant="ghost" size="icon" className="hidden md:inline-flex shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => setCollapsed(v => !v)} title={mini ? 'Mở rộng menu' : 'Thu gọn menu'} aria-label={mini ? 'Mở rộng menu' : 'Thu gọn menu'}>{mini ? <PanelLeftOpen /> : <PanelLeftClose />}</Button>
      </div>
    </aside>
  );

  return (
    <div className="base-app-shell flex min-h-screen w-full bg-background">
      <div className="hidden md:block sticky top-0 h-screen">{Sidebar(collapsed)}</div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 h-full">{Sidebar(false)}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <MobileAppChrome groups={visibleGroups} userId={user?.id} name={user?.fullName} brandName={brand.app_name} logo={<BrandMark b={brand} className="h-9 w-9 shrink-0 rounded-lg" />} notifications={<NotificationBell />} approvals={approvalsEligible ? { count: approvalCenter.data?.todo.length ?? 0 } : undefined} onMenu={() => setOpen(true)} />
        <main className="base-app-content flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {user && <ZaloInteractionReminder key={user.id} userId={user.id} />}
          {path === '/' && !viewportReady ? <div className="h-48 animate-pulse rounded-lg bg-muted" aria-label="Đang tải trang chủ" /> : launcher && user ? <MobileLauncher groups={visibleGroups} userId={user.id} area={search.area} accessReady={launcherAccessReady} /> : children}
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
