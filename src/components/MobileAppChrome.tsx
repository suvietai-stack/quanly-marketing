import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, MessageCircleHeart, ClipboardCheck, Home, LayoutDashboard, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mobilePage, safeMobilePrevious } from '@/lib/mobileShell';
import { badgeText } from '@/lib/approvals/api';
import { ChatUnreadBadge } from '@/components/chat/ChatShortcut';
import type { NavGroup } from '@/lib/navigation';

export function MobileAppChrome({ groups, userId, name, brandName, logo, notifications, approvals, onMenu }: {
  groups: NavGroup[]; userId?: string; name?: string; brandName: string; logo: ReactNode; notifications: ReactNode; approvals?: { count: number }; onMenu: () => void;
}) {
  const router = useRouter();
  const location = useRouterState({ select: s => s.location });
  const search = location.search as { area?: string; view?: string };
  const home = location.pathname === '/' && !search.area && search.view !== 'dashboard';
  const page = mobilePage(groups, location.pathname, search.area, search.view === 'dashboard');
  const header = useRef<HTMLElement>(null), footer = useRef<HTMLElement>(null);
  const history = useRef(new Map<number, { key: string; href: string }>());
  const owner = useRef(userId);
  const [previousKey, setPreviousKey] = useState<string>();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    if (owner.current !== userId) { history.current.clear(); owner.current = userId; }
    const index = location.state.__TSR_index;
    const key = location.state.__TSR_key ?? location.state.key;
    if (!key || typeof index !== 'number') { setPreviousKey(undefined); return; }
    setPreviousKey(history.current.get(index - 1)?.key);
    history.current.set(index, { key, href: location.href });
  }, [location.href, location.state.__TSR_key, location.state.__TSR_index, userId]);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty('--mobile-header-height', `${header.current?.getBoundingClientRect().height ?? 64}px`);
      root.style.setProperty('--mobile-nav-height', `${footer.current?.getBoundingClientRect().height ?? 72}px`);
    };
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    if (footer.current) observer.observe(footer.current);
    update();
    return () => { observer.disconnect(); root.style.removeProperty('--mobile-header-height'); root.style.removeProperty('--mobile-nav-height'); };
  }, []);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const editing = document.activeElement?.matches('input,textarea,[contenteditable="true"]');
      setKeyboard(!!editing && !!viewport && window.innerHeight - viewport.height > 150);
    };
    viewport?.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => { viewport?.removeEventListener('resize', update); document.removeEventListener('focusin', update); document.removeEventListener('focusout', update); };
  }, []);
  const back = () => {
    const index = location.state.__TSR_index;
    if (typeof index === 'number' && safeMobilePrevious(history.current.get(index - 1), previousKey)) router.history.back();
    else void router.navigate({ to: '/', search: page.area ? { area: page.area } : {}, replace: true });
  };
  const dashboard = groups.some(g => g.items.some(i => i.to === '/' && !i.comingSoon));
  const dashboardActive = location.pathname === '/' && search.view === 'dashboard';
  return <>
    <header ref={header} className="mobile-app-header md:hidden fixed inset-x-0 top-0 z-30 border-b bg-card" aria-label="Đầu trang mobile">
      <div className="flex min-h-16 items-center gap-2 px-3 sm:px-4">
        {home ? logo : <Button variant="ghost" size="icon" onClick={back} aria-label="Quay lại"><ArrowLeft /></Button>}
        <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-medium tracking-normal text-muted-foreground">{brandName}</div><h1 className="break-words text-base font-semibold leading-snug tracking-normal">{page.title}</h1></div>
        <div className="mobile-header-notifications">{notifications}</div>
        {home ? <Button variant="ghost" size="icon" asChild className="rounded-full bg-accent text-accent-foreground text-xs"><Link to="/profile" aria-label="Hồ sơ cá nhân">{name?.slice(0,1).toUpperCase() ?? <User />}</Link></Button> : <Button variant="ghost" size="icon" aria-label="Mở menu" onClick={onMenu}><Menu /></Button>}
      </div>
    </header>
    <nav ref={footer} aria-label="Điều hướng mobile" className={cn('mobile-bottom-nav md:hidden fixed inset-x-0 bottom-0 z-30 grid auto-cols-fr grid-flow-col border-t bg-card px-2 pt-2', keyboard && 'mobile-keyboard-open')}>
      <Button asChild variant="ghost" className={cn('h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium', home && 'text-primary bg-accent')}><Link to="/" search={{}} aria-current={home ? 'page' : undefined}><Home className="h-5 w-5" />Trang chủ</Link></Button>
      {dashboard && <Button asChild variant="ghost" className={cn('h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium', dashboardActive && 'text-primary bg-accent')}><Link to="/" search={{view:'dashboard'}} aria-current={dashboardActive ? 'page' : undefined}><LayoutDashboard className="h-5 w-5" />Dashboard</Link></Button>}
      {approvals && <Button asChild variant="ghost" className={cn('h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium', location.pathname === '/approvals' && 'text-primary bg-accent')}><Link to="/approvals" aria-current={location.pathname === '/approvals' ? 'page' : undefined} aria-label={`Phê duyệt${approvals.count > 0 ? ` (${badgeText(approvals.count)} chờ)` : ''}`}><span className="relative"><ClipboardCheck className="h-5 w-5" />{approvals.count > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-semibold flex items-center justify-center">{badgeText(approvals.count)}</span>}</span>Phê duyệt</Link></Button>}
      <Button asChild variant="ghost" className={cn('h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium', location.pathname.startsWith('/community') && 'text-primary bg-accent')}><Link to="/community" search={{tab:"feed",thread:undefined}} aria-current={location.pathname.startsWith('/community') ? 'page' : undefined}><span className="relative"><MessageCircleHeart className="h-5 w-5" /><ChatUnreadBadge/></span>Cộng đồng</Link></Button>
      <Button asChild variant="ghost" className={cn('h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium', location.pathname === '/profile' && 'text-primary bg-accent')}><Link to="/profile" aria-current={location.pathname === '/profile' ? 'page' : undefined}><User className="h-5 w-5" />Cá nhân</Link></Button>
    </nav>
  </>;
}