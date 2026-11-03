import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ callback: null as null | ((event: string, session: any) => void), getUser: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { onAuthStateChange: (callback: any) => { fixture.callback = callback; }, getUser: fixture.getUser } } }));
import { clearRecoverySession, hasRecoverySession } from './recovery-session';
beforeEach(() => { clearRecoverySession(); fixture.getUser.mockResolvedValue({ data: { user: { id: 'A' } }, error: null }); });
it('ordinary session and URL text are insufficient for recovery', async () => {
  fixture.callback?.('SIGNED_IN',{ user: { id: 'A' } });
  expect(await hasRecoverySession()).toBe(false);
  expect(fixture.getUser).not.toHaveBeenCalled();
});
it('accepted recovery plus matching verified user grants recovery', async () => {
  fixture.callback?.('PASSWORD_RECOVERY',{ user: { id: 'A' } });
  expect(await hasRecoverySession()).toBe(true);
});
it('different identity or failed validation rejects recovery', async () => {
  fixture.callback?.('PASSWORD_RECOVERY',{ user: { id: 'A' } });
  fixture.getUser.mockResolvedValue({ data: { user: { id: 'B' } }, error: null });
  expect(await hasRecoverySession()).toBe(false);
  fixture.getUser.mockResolvedValue({ data: { user: null }, error: {} });
  expect(await hasRecoverySession()).toBe(false);
});
it('ordinary sign-in after recovery clears the capability even for the same user', async () => {
  fixture.callback?.('PASSWORD_RECOVERY',{ user: { id: 'A' } });
  fixture.callback?.('SIGNED_IN',{ user: { id: 'A' } });
  expect(await hasRecoverySession()).toBe(false);
});
it('signout and successful-use clearing retire recovery', async () => {
  fixture.callback?.('PASSWORD_RECOVERY',{ user: { id: 'A' } });
  fixture.callback?.('SIGNED_OUT',null);
  expect(await hasRecoverySession()).toBe(false);
  fixture.callback?.('PASSWORD_RECOVERY',{ user: { id: 'A' } });
  clearRecoverySession();
  expect(await hasRecoverySession()).toBe(false);
});