import { describe, expect, it } from 'vitest';
import { visibleNavigation } from './navigation';
import { allowedPins, launcherApps, movePin, pinStorageKey, reconcilePins, searchLauncher, storedPins } from './launcher';
const groups = (perms: string[]) => visibleNavigation({ can: p => perms.includes(p), isSuperAdmin: false, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: false, canApprove: false, pendingCount: 0 });
describe('Mobile launcher shares live navigation visibility', () => {
  it('retains ordered CRM, 3K and approval pins while access is unresolved', () => {
    const pins = ['/biz/crm', '/showroom/3k', '/biz/approvals', '/leave'];
    expect(reconcilePins(pins, groups(['leave.create','showroom.k3.use']), false)).toEqual(pins);
    expect(allowedPins(pins, groups(['leave.create','showroom.k3.use']))).toEqual(['/showroom/3k', '/leave']);
  });
  it('prunes a confirmed revocation only after access is resolved', () => {
    expect(reconcilePins(['/biz/crm', '/signals'], groups(['biz.crm_use']), true)).toEqual(['/biz/crm']);
  });
  it('reads stored preferences without consulting pending permissions', () => {
    expect(storedPins(['/biz/crm', null, '/biz/crm', '', '/biz/approvals'])).toEqual(['/biz/crm', '/biz/approvals']);
    expect(storedPins({ pins: ['/biz/crm'] })).toEqual([]);
  });
  it('searches only allowed functions without department assumptions', () => {
    const visible = groups(['leave.create','showroom.k3.use']);
    expect(searchLauncher(visible, 'nghi phep').map(i => i.to)).toEqual(['/leave']);
    expect(searchLauncher(visible, '3K').map(i => i.to)).toEqual(['/showroom/3k']);
    expect(searchLauncher(visible, 'tien ve')).toEqual([]);
  });
  it('removes revoked functions from pins and search immediately', () => {
    const before = groups(['showroom.k3.use','finance.incoming.view']);
    expect(allowedPins(['/showroom/3k','/finance/incoming'], before)).toEqual(['/showroom/3k','/finance/incoming']);
    const after = groups(['showroom.k3.use']);
    expect(allowedPins(['/showroom/3k','/finance/incoming'], after)).toEqual(['/showroom/3k']);
    expect(searchLauncher(after, 'tien ve')).toEqual([]);
  });
  it('does not pin future, malformed or duplicate destinations', () => {
    expect(allowedPins(['/leave','/leave','',null,'/unbuilt'], groups(['leave.create','showroom.k3.use']))).toEqual(['/leave']);
    expect(allowedPins({ route: '/leave' }, groups(['leave.create','showroom.k3.use']))).toEqual([]);
    expect(launcherApps(groups([])).every(i => !i.comingSoon && !!i.to)).toBe(true);
  });
  it('preserves requested order with bounded moves', () => {
    expect(movePin(['/leave','/showroom/3k','/orders'], '/showroom/3k', -1)).toEqual(['/showroom/3k','/leave','/orders']);
    expect(movePin(['/leave','/orders'], '/leave', -1)).toEqual(['/leave','/orders']);
    expect(movePin(['/leave','/orders'], '/leave', 1)).toEqual(['/orders','/leave']);
  });
  it('isolates preferences between two accounts', () => {
    expect(pinStorageKey('employee-a')).not.toBe(pinStorageKey('employee-b'));
  });
  it('keeps existing saved applications and their order when opening customization', () => {
    const saved = ['/leave', '/showroom/3k', '/orders'];
    // Design destinations require both a role permission and active design-team visibility.
    const draft = allowedPins(saved, visibleNavigation({ can: p => ['leave.create', 'showroom.k3.use', 'order.view'].includes(p), isSuperAdmin: false, designTeam: true, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: false, canApprove: false, pendingCount: 0 }));
    expect(draft).toEqual(['/leave', '/showroom/3k', '/orders']);
    const changed = movePin(draft, '/orders', -1);
    expect(changed).toEqual(['/leave', '/orders', '/showroom/3k']);
    expect(saved).toEqual(['/leave', '/showroom/3k', '/orders']);
  });
});
