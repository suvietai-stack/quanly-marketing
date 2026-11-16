import { describe, expect, it } from 'vitest';
import { navigationGroups } from './navigation';
import { mobilePage, safeMobilePrevious } from './mobileShell';
describe('Safe mobile navigation', () => {
  it.each(['/login','/register','/pending','/reset-password','https://outside.example','//outside.example'])('does not go back to %s', href => {
    expect(safeMobilePrevious({ key: 'known', href }, 'known')).toBe(false);
  });
  it('requires an observed matching internal entry', () => {
    expect(safeMobilePrevious(undefined, 'known')).toBe(false);
    expect(safeMobilePrevious({ key: 'old', href: '/biz/3k' }, 'different')).toBe(false);
    expect(safeMobilePrevious({ key: 'known', href: '/?area=Kinh%20doanh' }, 'known')).toBe(true);
  });
  it('uses existing names and parent fallback for deep links', () => {
    expect(mobilePage(navigationGroups, '/showroom/3k')).toEqual({ title: '3K Showroom', area: 'Showroom' });
    expect(mobilePage(navigationGroups, '/order-tracking/order-id')).toEqual({ title: 'Theo Dõi Đơn Hàng', area: 'Mua Hàng & Giao Vận' });
  });
});
