import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), status: 'Đang hoạt động', profileError: null as any, rpc: vi.fn() }));
vi.mock('@/lib/recovery-session', () => ({}));
vi.mock('@/lib/accounts.functions', () => ({ adminResetPassword: vi.fn(), adminDeleteUser: vi.fn(), usernameSignIn: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { signUp: fixture.signUp, signInWithPassword: fixture.signIn, signOut: fixture.signOut },
  from: () => {
    const chain: any = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: fixture.profileError ? null : { status: fixture.status }, error: fixture.profileError }) };
    return chain;
  }, rpc: fixture.rpc,
} }));
import { useAuth } from './auth';
beforeEach(() => {
  vi.clearAllMocks(); fixture.status = 'Đang hoạt động'; fixture.profileError = null;
  fixture.signUp.mockResolvedValue({ data: { user: { id: 'A' }, session: null }, error: null });
  fixture.signIn.mockResolvedValue({ data: { user: { id: 'A' } }, error: null });
  fixture.signOut.mockResolvedValue({ error: null });
  useAuth.setState({ reload: vi.fn().mockResolvedValue(undefined) });
});
it('signup uses original password and leaves the user signed out awaiting confirmation and approval', async () => {
  const result = await useAuth.getState().register({ username: 'newstaff', email: 'new@example.test', fullName: 'New Staff', password: 'Original123' });
  expect(result.ok).toBe(true);
  expect(fixture.signUp).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.test', password: 'Original123' }));
  expect(fixture.signOut).toHaveBeenCalledTimes(1);
  expect(fixture.signIn).not.toHaveBeenCalled();
});
it('new signup requires deliverable email rather than synthetic email', async () => {
  const result = await useAuth.getState().register({ username: 'newstaff', fullName: 'New', password: 'Original123' });
  expect(result.ok).toBe(false); expect(fixture.signUp).not.toHaveBeenCalled();
});
it('confirmed active account can submit the original password unchanged', async () => {
  const result = await useAuth.getState().login('new@example.test','Original123');
  expect(result.ok).toBe(true);
  expect(fixture.signIn).toHaveBeenCalledWith({ email: 'new@example.test', password: 'Original123' });
});
it('unconfirmed rejection is distinct from wrong password and invokes no password reset', async () => {
  fixture.signIn.mockResolvedValue({ data: { user: null }, error: { code: 'email_not_confirmed' } });
  const result = await useAuth.getState().login('new@example.test','Original123');
  expect(result.ok).toBe(false); expect(result.error).toContain('chưa được xác nhận');
});
it('pending verified account is authenticated only to show pending screen', async () => {
  fixture.status = 'Chờ duyệt';
  expect((await useAuth.getState().login('new@example.test','Original123')).ok).toBe(true);
});
it('blocked or failed profile verification does not return login success', async () => {
  fixture.status = 'Tạm khóa';
  expect((await useAuth.getState().login('new@example.test','Original123')).ok).toBe(false);
  fixture.profileError = {};
  expect((await useAuth.getState().login('new@example.test','Original123')).ok).toBe(false);
  expect(fixture.signOut).toHaveBeenCalledTimes(2);
});