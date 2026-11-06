import { activeNavigationPath, type NavGroup } from './navigation';
export function mobilePage(groups: NavGroup[], path: string, area?: string, dashboard = false) {
  const selected = activeNavigationPath(groups, path);
  const group = groups.find(g => g.items.some(i => i.to === selected));
  const item = group?.items.find(i => i.to === selected);
  return { title: path === '/profile' ? 'Cá nhân' : path === '/' ? dashboard ? 'Dashboard' : area ?? 'Trang chủ' : item?.label ?? 'Base Sứ Việt', area: group?.label };
}
export function safeMobilePrevious(previous: { key: string; href: string } | undefined, expectedKey?: string): boolean {
  if (!previous || !expectedKey || previous.key !== expectedKey) return false;
  const path = previous.href.split(/[?#]/)[0];
  return path.startsWith('/') && !path.startsWith('//') && !['/login','/register','/pending','/reset-password'].includes(path);
}