import { describe, expect, it } from 'vitest';
import { visibleNavigation } from './navigation';
import { allowedPins, launcherApps, movePin, pinStorageKey, searchLauncher } from './launcher';
const groups = (perms: string[]) => visibleNavigation({ can: p => perms.includes(p), isSuperAdmin: false, isKpiAdmin: false, isKpiManager: false, kpiEnabled: true, hasAssignedApprovals: false, canApprove: false, pendingCount: 0 });
describe('Mobile launcher shares live navigation visibility', () => {
  it('searches only allowed functions without department assumptions', () => {
    const visible = groups(['leave.create','k3.use']);
    expect(searchLauncher(visible, 'nghi phep').map(i => i.to)).toEqual(['/leave']);
    expect(searchLauncher(visible, '3K').map(i => i.to)).toEqual(['/biz/3k']);
    expect(searchLauncher(visible, 'tien ve')).toEqual([]);
  });
  it('removes revoked functions from pins and search immediately', () => {
    const before = groups(['k3.use','finance.incoming.view']);
    expect(allowedPins(['/biz/3k','/finance/incoming'], before)).toEqual(['/biz/3k','/finance/incoming']);
    const after = groups(['k3.use']);
    expect(allowedPins(['/biz/3k','/finance/incoming'], after)).toEqual(['/biz/3k']);
    expect(searchLauncher(after, 'tien ve')).toEqual([]);
  });
  it('does not pin future, malformed or duplicate destinations', () => {
    expect(allowedPins(['/leave','/leave','',null,'/unbuilt'], groups(['leave.create']))).toEqual(['/leave']);
    expect(allowedPins({ route: '/leave' }, groups(['leave.create']))).toEqual([]);
    expect(launcherApps(groups([])).every(i => !i.comingSoon && !!i.to)).toBe(true);
  });
  it('preserves requested order with bounded moves', () => {
    expect(movePin(['/leave','/biz/3k','/orders'], '/biz/3k', -1)).toEqual(['/biz/3k','/leave','/orders']);
    expect(movePin(['/leave','/orders'], '/leave', -1)).toEqual(['/leave','/orders']);
    expect(movePin(['/leave','/orders'], '/leave', 1)).toEqual(['/orders','/leave']);
  });
  it('isolates preferences between two accounts', () => {
    expect(pinStorageKey('employee-a')).not.toBe(pinStorageKey('employee-b'));
  });
});