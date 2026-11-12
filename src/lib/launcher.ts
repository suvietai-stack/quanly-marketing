import type { NavGroup, NavItem } from './navigation';

export function launcherApps(groups: NavGroup[]): NavItem[] {
  return groups.flatMap(g => g.items).filter(i => !i.comingSoon && !!i.to);
}
export function storedPins(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((p): p is string => typeof p === 'string' && p.length > 0))] : [];
}
export function reconcilePins(value: unknown, groups: NavGroup[], accessReady: boolean): string[] {
  return accessReady ? allowedPins(value, groups) : storedPins(value);
}
export function allowedPins(value: unknown, groups: NavGroup[]): string[] {
  const allowed = new Set(launcherApps(groups).map(i => i.to));
  return Array.isArray(value) ? [...new Set(value.filter((p): p is string => typeof p === 'string' && allowed.has(p)))] : [];
}
export const pinStorageKey = (uid: string) => `base-launcher-pins:${uid}`;
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const aliases: Record<string, string> = { '/tasks': 'cong viec todo', '/leave': 'nghi phep don tu nhan su', '/orders': 'order thiet ke', '/biz/3k': '3k kg kf cong viec', '/finance/incoming': 'tien ve ke toan', '/signals': 'tin hieu co hoi khach hang', '/attendance': 'cham cong giai trinh' };
export function searchLauncher(groups: NavGroup[], query: string): NavItem[] {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return groups.flatMap(g => g.items.filter(i => !i.comingSoon && !!i.to && words.every(w => normalize(`${i.label} ${g.label} ${aliases[i.to] ?? ''}`).includes(w))));
}
export function movePin(pins: string[], path: string, direction: -1 | 1): string[] {
  const index = pins.indexOf(path), next = index + direction;
  if (index < 0 || next < 0 || next >= pins.length) return pins;
  const copy = [...pins];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

/** Suggestions are derived from visible navigation only; they never become stored pins. */
export function suggestedLauncherApps(groups: NavGroup[], limit = 6): NavItem[] {
  const apps = launcherApps(groups).filter(item => item.to !== '/');
  const preferred = ['/tasks', '/approvals', '/signals', '/leave', '/orders', '/finance/incoming'];
  const byRoute = new Map(apps.map(item => [item.to, item]));
  const routes = [...new Set([...preferred.filter(path => byRoute.has(path)), ...apps.map(item => item.to)])];
  return routes.slice(0, Math.max(0, limit)).map(path => byRoute.get(path)!);
}
