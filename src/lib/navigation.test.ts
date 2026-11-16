import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { navigationGroups, visibleNavigation, activeNavigationPath, type NavigationAccess } from './navigation';
import { allowedPins, searchLauncher } from './launcher';
import { mobilePage } from './mobileShell';

const access = (permissions: string[] = [], extra: Partial<NavigationAccess> = {}): NavigationAccess => ({ can: p => permissions.includes(p), isSuperAdmin: false, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: false, canApprove: false, pendingCount: 0, ...extra });
const paths = (a: NavigationAccess) => visibleNavigation(a).flatMap(g => g.items).filter(i => !i.comingSoon).map(i => i.to);
describe('Presentation-only navigation', () => {
  it.each(['/settings/kpi-v2', '/reports-v2'])('places KPI %s only in Marketing with its original destination', path => {
    expect(navigationGroups.filter(g => g.items.some(i => i.to === path)).map(g => g.label)).toEqual(['Marketing']);
    expect(navigationGroups.flatMap(g => g.items).filter(i => i.to === path)).toHaveLength(1);
    expect(mobilePage(navigationGroups, path).area).toBe('Marketing');
  });
  it('keeps existing KPI pins and search valid in Marketing, and personal 3K in Operations', () => {
    const groups = visibleNavigation(access(['kpi.view_own', 'kpi.report', 'k3.use', 'biz.goal_submit']));
    expect(allowedPins(['/settings/kpi-v2', '/reports-v2'], groups)).toEqual(['/settings/kpi-v2', '/reports-v2']);
    expect(searchLauncher(groups, 'Marketing KPI').map(i => i.to)).toEqual(['/settings/kpi-v2', '/reports-v2']);
    expect(groups.find(g => g.label === 'Marketing')?.items.find(i => i.to === '/settings/kpi-v2')?.label).toBe('KPI của tôi');
    expect(groups.find(g => g.label === 'Kinh doanh')?.items.map(i => i.to)).toEqual(['/biz/goals', '/biz/products']);
  });
  it('has one procurement supplier master, visible to eligible commercial roles only', () => {
    const entries=navigationGroups.flatMap(g=>g.items).filter(i=>i.to==='/procurement/suppliers');
    expect(entries).toHaveLength(1);
    expect(navigationGroups.find(g=>g.label==='Mua Hàng & Giao Vận')?.items
      .some(i=>i.to==='/procurement/suppliers')).toBe(true);
    expect(navigationGroups.find(g=>g.label==='Showroom')?.items
      .some(i=>i.to.includes('suppliers'))).toBe(false);
    expect(paths(access(['supplier.master.view']))).toContain('/procurement/suppliers');
    expect(paths(access())).not.toContain('/procurement/suppliers');
    expect(paths(access(['showroom.view']))).not.toContain('/procurement/suppliers');
    expect(activeNavigationPath(navigationGroups,'/procurement/suppliers'))
      .toBe('/procurement/suppliers');
  });
  it('keeps executive central 3K analytic-only, personal work in area modules', () => {
    expect(paths(access(['k3hub.use']))).not.toContain('/biz/3k');
    expect(paths(access(['k3hub.center']))).toContain('/k3-center');
    expect(paths(access(['k3hub.biz']))).toContain('/biz/3k-area');
    expect(paths(access(['showroom.k3.use']))).toContain('/showroom/3k');
  });
  it('keeps all navigation areas in the mandated order', () => {
    expect(navigationGroups.map(g => g.label)).toEqual(['Điều hành','Trung tâm hội thoại','Kinh doanh','Showroom','Marketing','Thiết Kế','Mua Hàng & Giao Vận','Kế Toán & Tài Chính','Hành Chính & Nhân Sự','Sao Sứ Việt','Hệ thống']);
  });
  it.each([
    ['ot.view_own','Mua Hàng & Giao Vận','/order-tracking'],
    ['order.view','Thiết Kế','/orders'],
    ['leave.create','Hành Chính & Nhân Sự','/leave'],
    ['finance.incoming.view','Kế Toán & Tài Chính','/finance/incoming'],
    
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
    expect(paths(access(['k3hub.use'], { isSuperAdmin: true }))).not.toContain('/biz/3k');
    expect(paths(access([], { isSuperAdmin: true }))).not.toContain('/orders');
  });
  it('has no duplicate live destinations and all old destinations resolve to existing routes', () => {
    const destinations = navigationGroups.flatMap(g => g.items).filter(i => !i.comingSoon).map(i => i.to);
    expect(new Set(destinations).size).toBe(destinations.length);
    expect(destinations.length).toBeGreaterThanOrEqual(46);
    const routeSources = readdirSync('src/routes').filter(file => file.endsWith('.tsx')).map(file => readFileSync(`src/routes/${file}`, 'utf8'));
    const declaredPaths = routeSources.flatMap(source => [...source.matchAll(/createFileRoute\(["']([^"']+)["']\)/g)].map(match => match[1].replace(/_\//g, '/').replace(/\/$/, '') || '/'));
    for (const path of destinations) {
      expect(declaredPaths, path).toContain(path);
    }
  });
  it('CRM is permission scoped, searchable and pinnable only within Kinh doanh', () => {
    const groups = visibleNavigation(access(['biz.crm_use']));
    expect(groups.find(g => g.label === 'Kinh doanh')?.items.map(i => i.to)).toEqual(['/biz/crm', '/biz/products']);
    expect(paths(access())).not.toContain('/biz/crm');
    expect(allowedPins(['/biz/crm'], groups)).toEqual(['/biz/crm']);
    expect(searchLauncher(groups, 'CRM').map(i => i.to)).toContain('/biz/crm');
  });
  it('Organization chart is visible to every signed-in staff; administration stays inside the page', () => {
    expect(paths(access([], { isSuperAdmin: true }))).toContain('/organization');
    expect(paths(access([]))).toContain('/organization');
    expect(paths(access(['biz.org_manage', 'settings.role']))).toContain('/organization');
  });
  it('future items cannot navigate or reveal a forbidden parent', () => {
    expect(navigationGroups.flatMap(g => g.items).filter(i => i.comingSoon)).toHaveLength(3);
    // Kho Sản Phẩm đã có route placeholder an toàn; các mục tương lai khác chưa có đường dẫn.
    expect(navigationGroups.flatMap(g => g.items).filter(i => i.comingSoon && i.to !== '/biz/products').every(i => i.to === '')).toBe(true);
    // Nhóm Kế Toán & Tài Chính có các mục không gắn quyền menu (trang tự kiểm tra quyền bên trong).
    expect(paths(access())).not.toContain('/showroom');
    expect(visibleNavigation(access()).some(g => g.label === 'Showroom')).toBe(false);
    expect(paths(access(['showroom.view']))).toContain('/showroom');
    expect(visibleNavigation(access(['showroom.view'])).find(g => g.label === 'Showroom')?.comingSoon).toBeFalsy();
    expect(paths(access(['showroom.k3.use']))).toContain('/showroom/3k');
    expect(paths(access(['showroom.view']))).not.toContain('/showroom/3k');
    expect(activeNavigationPath(navigationGroups, '/showroom/3k')).toBe('/showroom/3k');
  });
  it('keeps central 3K and area-specific 3K scoped to actual role keys', () => {
    expect(paths(access(['k3hub.center']))).toContain('/k3-center');
    expect(paths(access(['k3hub.biz']))).toContain('/biz/3k-area');
    expect(paths(access(['k3hub.ops']))).toContain('/operations/3k');
    expect(paths(access(['k3hub.ops_accounting']))).toContain('/operations/3k-accounting');
    expect(paths(access(['k3hub.ops_hr']))).toContain('/operations/3k-hr');
    expect(paths(access(['showroom.k3.use']))).toContain('/showroom/3k');
    expect(paths(access())).not.toContain('/k3-center');
    expect(paths(access(['k3hub.biz']))).not.toContain('/k3-center');
    expect(paths(access(['k3hub.ops']))).not.toContain('/showroom/3k');
    expect(navigationGroups.find(g => g.label === 'Marketing')?.items.some(it =>
      it.to.includes('/3k') || it.to.includes('k3-center'))).toBe(false);
  });
  it('shows the Approval Center entry only when the user has approval capability', () => {
    expect(paths(access())).not.toContain('/approvals');
    const groups = visibleNavigation(access([], { approvalsEligible: true }));
    expect(groups.find(g => g.label === 'Điều hành')?.items.map(i => i.to)).toContain('/approvals');
  });
  it('keeps the executive approval center visible even when its heavy summary is unavailable', () => {
    expect(paths(access(['leave.approve']))).toContain('/approvals');
    expect(paths(access(['biz.approval_view']))).toContain('/approvals');
    expect(paths(access(['fr.advance.approve']))).toContain('/approvals');
    expect(paths(access(['report.view','biz.view_all']))).not.toContain('/approvals');
  });
  it('highlights only the most specific route for existing deep links', () => {
    expect(activeNavigationPath(navigationGroups, '/signals/report')).toBe('/signals/report');
    expect(activeNavigationPath(navigationGroups, '/orders/order-123')).toBe('/orders');
    expect(activeNavigationPath(navigationGroups, '/biz/3k-area')).toBe('/biz/3k-area');
  });
});