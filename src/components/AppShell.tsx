import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ListChecks, Building2, Globe, Share2, MapPin,
  Video, Palette, Target, Settings, Menu, FileText, LogOut, User as UserIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth, useCurrentUser, type PermissionKey } from "@/lib/auth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; label: string; icon: any; exact?: boolean; badge?: string; perm?: PermissionKey };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Điều hành",
    items: [
      { to: "/", label: "Tổng Quan", icon: LayoutDashboard, exact: true, perm: "overview.view" },
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
    label: "Mở rộng & Hệ thống",
    items: [
      { to: "/okrs", label: "OKRs", icon: Target, badge: "Sắp ra mắt" },
      { to: "/settings", label: "Cài Đặt", icon: Settings, perm: "settings.view" },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
          B
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">Base Marketing</div>
          <div className="text-xs text-sidebar-foreground/60">Quản lý công việc</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                const active = isActive(it.to, (it as any).exact);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{it.label}</span>
                    {(it as any).badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent/70 text-sidebar-foreground/70">
                        {(it as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-5 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/45">
        v1.0 · Bản Base
      </div>
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
          <div className="font-semibold">Base Marketing</div>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
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
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
