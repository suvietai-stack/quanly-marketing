import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { ArrowLeft, Bell, Home, ListChecks, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mobilePage, safeMobilePrevious } from '@/lib/mobileShell';
import type { NavGroup } from '@/lib/navigation';

export function MobileAppChrome({ groups, userId, name, brandName, logo, notifications, onMenu }: {
  groups: NavGroup[]; userId?: string; name?: string; brandName: string; logo: ReactNode; notifications: ReactNode; onMenu: () => void;
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
  const tasks = groups.some(g => g.items.some(i => i.to === '/tasks' && !i.comingSoon));
  return <>
    <header ref={header} className="mobile-app-header md:hidden fixed inset-x-0 top-0 z-30 border-b bg-card" aria-label="Đầu trang mobile">
      <div className="flex min-h-16 items-center gap-2 px-3">
        {home ? logo : <Button variant="ghost" size="icon" onClick={back} aria-label="Quay lại"><ArrowLeft /></Button>}
        <div className="min-w-0 flex-1"><div className="truncate font-semibold tracking-normal text-[10px] text-muted-foreground">{brandName}</div><h1 className="text-sm font-semibold leading-snug break-words tracking-normal">{page.title}</h1></div>
        <div className="mobile-header-notifications">{notifications}</div>
        {home ? <Button variant="ghost" size="icon" asChild className="rounded-full bg-accent text-accent-foreground text-xs"><Link to="/profile" aria-label="Hồ sơ cá nhân">{name?.slice(0,1).toUpperCase() ?? <User />}</Link></Button> : <Button variant="ghost" size="icon" aria-label="Mở menu" onClick={onMenu}><Menu /></Button>}
      </div>
    </header>
    <nav ref={footer} aria-label="Điều hướng mobile" className={cn('mobile-bottom-nav md:hidden fixed inset-x-0 bottom-0 z-30 grid auto-cols-fr grid-flow-col border-t bg-card px-2 pt-2', keyboard && 'mobile-keyboard-open')}>
      <Button asChild variant="ghost" className={cn('h-14 flex-col gap-1 text-[10px]', home && 'text-primary bg-accent')}><Link to="/" search={{}} aria-current={home ? 'page' : undefined}><Home className="h-5 w-5" />Trang chủ</Link></Button>
      {tasks && <Button asChild variant="ghost" className={cn('h-14 flex-col gap-1 text-[10px]', location.pathname.startsWith('/tasks') && 'text-primary bg-accent')}><Link to="/tasks" aria-current={location.pathname.startsWith('/tasks') ? 'page' : undefined}><ListChecks className="h-5 w-5" />Công việc</Link></Button>}
      <Button variant="ghost" className="mobile-notifications-tab h-14 flex-col gap-1 text-[10px]" onClick={() => header.current?.querySelector<HTMLButtonElement>('[aria-label="Thông báo"]')?.click()}><Bell className="h-5 w-5" />Thông báo</Button>
      <Button asChild variant="ghost" className={cn('h-14 flex-col gap-1 text-[10px]', location.pathname === '/profile' && 'text-primary bg-accent')}><Link to="/profile" aria-current={location.pathname === '/profile' ? 'page' : undefined}><User className="h-5 w-5" />Cá nhân</Link></Button>
    </nav>
  </>;
}