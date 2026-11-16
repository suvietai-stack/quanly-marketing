import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { activeNavigationPath, type NavGroup } from '@/lib/navigation';

export function AppNavigation({ groups, path, userId, collapsed = false, onNavigate }: {
  groups: NavGroup[]; path: string; userId?: string; collapsed?: boolean; onNavigate: () => void;
}) {
  const activePath = activeNavigationPath(groups, path);
  const activeGroup = groups.find(g => g.items.some(it => it.to === activePath))?.label;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadedKey, setLoadedKey] = useState('');
  const storageKey = `base-navigation:${userId ?? 'signed-out'}`;
  useEffect(() => {
    let saved: Record<string, boolean> = {};
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        saved = Object.fromEntries(Object.entries(raw).filter(([,v]) => typeof v === 'boolean')) as Record<string, boolean>;
      }
    } catch { /* Browser storage is optional. */ }
    setExpanded(saved);
    setLoadedKey(storageKey);
  }, [storageKey]);
  useEffect(() => {
    if (activeGroup) setExpanded(previous => ({ ...previous, [activeGroup]: true }));
  }, [activeGroup, path, loadedKey]);
  useEffect(() => {
    if (loadedKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(expanded)); } catch { /* Optional. */ }
  }, [expanded, loadedKey, storageKey]);
  return <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
    {groups.map((group, index) => {
      const Icon = group.icon;
      const isOpen = !!expanded[group.label];
      const panelId = `base-nav-${index}`;
      return <div key={group.label}>
        <Button variant="ghost" type="button" disabled={group.comingSoon}
          title={collapsed ? `${group.label}${group.comingSoon ? ' — Sắp ra mắt' : ''}` : undefined}
          aria-label={group.comingSoon ? `${group.label} — Sắp ra mắt` : group.label}
          aria-expanded={group.comingSoon ? undefined : isOpen}
          aria-controls={group.comingSoon ? undefined : panelId}
          onClick={() => setExpanded(previous => ({ ...previous, [group.label]: !previous[group.label] }))}
          className={cn('w-full h-auto min-h-11 px-2.5 py-2 text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', collapsed ? 'justify-center' : 'justify-start', activeGroup === group.label && 'bg-sidebar-accent')}>
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {!collapsed && <><span className="flex-1 whitespace-normal leading-5 text-[13px]">{group.label}</span>
            {group.comingSoon ? <span className="text-[9px] font-normal text-sidebar-foreground/70">Sắp ra mắt</span> : <ChevronDown className={cn('transition-transform motion-reduce:transition-none', isOpen && 'rotate-180')} />}</>}
        </Button>
        {!group.comingSoon && <div id={panelId} hidden={!isOpen} className={cn('space-y-0.5 py-1', !collapsed && 'ml-3 border-l border-sidebar-border pl-2')}>
          {group.items.map(item => {
            const ItemIcon = item.icon;
            const itemClass = cn('w-full h-auto min-h-11 rounded-md px-2 py-2 text-sm md:text-[13px] justify-start text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', collapsed && 'justify-center', item.to === activePath && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground');
            return item.comingSoon ? <Button key={item.label} variant="ghost" disabled aria-label={`${item.label} — Sắp ra mắt`} title={collapsed ? `${item.label} — Sắp ra mắt` : undefined} className={itemClass}>
              <ItemIcon />{!collapsed && <span className="min-w-0 whitespace-normal leading-5">{item.label}<span className="block text-[10px] font-normal">Sắp ra mắt</span></span>}
            </Button> : <Button key={item.to} variant="ghost" asChild className={itemClass}>
              <Link to={item.to} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-label={item.label} aria-current={item.to === activePath ? 'page' : undefined}>
                <ItemIcon />{!collapsed && <><span className="flex-1 whitespace-normal leading-5">{item.label}</span>{item.badge && <span className="text-[10px] rounded bg-sidebar-accent px-1 text-sidebar-foreground">{item.badge}</span>}</>}
              </Link>
            </Button>;
          })}
        </div>}
      </div>;
    })}
  </nav>;
}