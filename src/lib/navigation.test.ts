import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { navigationGroups, visibleNavigation, activeNavigationPath, type NavigationAccess } from './navigation';

const access = (permissions: string[] = [], extra: Partial<NavigationAccess> = {}): NavigationAccess => ({ can: p => permissions.includes(p), isSuperAdmin: false, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: false, canApprove: false, pendingCount: 0, ...extra });
const paths = (a: NavigationAccess) => visibleNavigation(a).flatMap(g => g.items).filter(i => !i.comingSoon).map(i => i.to);
describe('Presentation-only navigation', () => {
  it('has ten areas in the mandated order', () => {
    expect(navigationGroups.map(g => g.label)).toEqual(['Điều hành','Kinh doanh','Showroom','Marketing','Thiết Kế','Mua Hàng & Giao Vận','Kế Toán & Tài Chính','Hành Chính & Nhân Sự','Sao Sứ Việt','Hệ thống']);
  });
  it.each([
    ['ot.view_own','Mua Hàng & Giao Vận','/order-tracking'],
    ['order.view','Thiết Kế','/orders'],
    ['leave.create','Hành Chính & Nhân Sự','/leave'],
    ['finance.incoming.view','Kế Toán & Tài Chính','/finance/incoming'],
    ['k3.use','Kinh doanh','/biz/3k'],
  ])('shows parent using only child permission %s', (permission, group, path) => {
    expect(visibleNavigation(access([permission])).find(g => g.label === group)?.items.map(i => i.to)).toContain(path);
    expect(paths(access())).not.toContain(path);
  });
  it('preserves every declared item permission as an independent visibility path', () => {
    for (const item of navigationGroups.flatMap(g => g.items).filter(i => !i.comingSoon)) {
      for (const permission of [...(item.anyPerm ?? []), ...(item.perm ? [item.perm] : [])]) {
        expect(paths(access([permission])), permission).toContain(item.to);
      }
    }
  });
  it('keeps assigned approvals, KPI feature gating/admin and personal label', () => {
    expect(paths(access([], { hasAssignedApprovals: true }))).toContain('/biz/approvals');
    expect(paths(access([], { isKpiAdmin: true, kpiEnabled: false }))).not.toContain('/settings/kpi-v2');
    expect(paths(access([], { isKpiAdmin: true }))).toContain('/settings/kpi-v2');
    expect(visibleNavigation(access(['kpi.view_own'])).flatMap(g => g.items).find(i => i.to === '/settings/kpi-v2')?.label).toBe('KPI của tôi');
  });
  it('preserves super admin business bypass without inventing grants', () => {
    expect(paths(access([], { isSuperAdmin: true }))).toContain('/biz/3k');
    expect(paths(access([], { isSuperAdmin: true }))).not.toContain('/orders');
  });
  it('has no duplicate live destinations and all old destinations resolve to existing routes', () => {
    const destinations = navigationGroups.flatMap(g => g.items).filter(i => !i.comingSoon).map(i => i.to);
    expect(new Set(destinations).size).toBe(destinations.length);
    expect(destinations).toHaveLength(30);
    const routeSources = readdirSync('src/routes').filter(file => file.endsWith('.tsx')).map(file => readFileSync(`src/routes/${file}`, 'utf8'));
    for (const path of destinations) {
      expect(routeSources.some(source => source.includes(`createFileRoute("${path}")`) || source.includes(`createFileRoute('${path}')`) || source.includes(`createFileRoute("${path}/")`) || source.includes(`createFileRoute('${path}/')`)), path).toBe(true);
    }
  });
  it('future items cannot navigate or reveal a forbidden parent', () => {
    expect(navigationGroups.flatMap(g => g.items).filter(i => i.comingSoon)).toHaveLength(6);
    expect(navigationGroups.flatMap(g => g.items).filter(i => i.comingSoon).every(i => i.to === '')).toBe(true);
    expect(visibleNavigation(access()).some(g => g.label === 'Kế Toán & Tài Chính')).toBe(false);
    expect(visibleNavigation(access()).some(g => g.label === 'Showroom' && g.comingSoon)).toBe(true);
  });
  it('highlights only the most specific route for existing deep links', () => {
    expect(activeNavigationPath(navigationGroups, '/signals/report')).toBe('/signals/report');
    expect(activeNavigationPath(navigationGroups, '/orders/order-123')).toBe('/orders');
    expect(activeNavigationPath(navigationGroups, '/biz/3k')).toBe('/biz/3k');
  });
});