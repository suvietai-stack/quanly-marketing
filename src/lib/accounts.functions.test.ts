import { beforeEach, describe, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({
  actor: '00000000-0000-0000-0000-000000000001', target: '00000000-0000-0000-0000-000000000002',
  assertPermission: vi.fn(), update: vi.fn(), rpc: vi.fn(), targetSystem: false, targetRole: 'staff', actorRole: 'role-admin',
}));
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => {
  let validate = (input: any) => input;
  const builder: any = { middleware: () => builder, inputValidator: (fn: any) => { validate = fn; return builder; }, handler: (fn: any) => async (input: any) => fn({ data: validate(input.data), context: { userId: fixture.actor, supabase: client } }) };
  return builder;
} }));
vi.mock('@/integrations/supabase/auth-middleware', () => ({ requireSupabaseAuth: {} }));
vi.mock('@/lib/accounts.server', () => ({
  assertAccountPermission: fixture.assertPermission,
  authState: async () => ({ authExists: true, emailMatches: true, emailConfirmed: false, status: 'Đang hoạt động', banned: false }),
}));
function rows(table: string, id: string) {
  if (table === 'profiles') return { data: { is_system_admin: id === fixture.target && fixture.targetSystem }, error: null };
  return { data: [{ role_id: id === fixture.target ? fixture.targetRole : fixture.actorRole }], error: null };
}
const client: any = {
  from: (table: string) => {
    let id = '';
    const chain: any = { select: () => chain, eq: (_field: string, value: string) => { id = value; return chain; }, maybeSingle: () => Promise.resolve(rows(table,id)), then: (resolve: any) => Promise.resolve(rows(table,id)).then(resolve) };
    return chain;
  },
  rpc: fixture.rpc, auth: { admin: { updateUserById: fixture.update } },
};
vi.mock('@/integrations/supabase/client.server', () => ({ get supabaseAdmin() { return client; } }));
import { adminResetPassword } from './accounts.functions';
beforeEach(() => {
  vi.clearAllMocks(); fixture.targetSystem = false; fixture.targetRole = 'staff'; fixture.actorRole = 'role-admin';
  fixture.assertPermission.mockResolvedValue(undefined); fixture.update.mockResolvedValue({ error: null });
  fixture.rpc.mockImplementation((name: string) => Promise.resolve({ data: name === 'account_auth_reserve' ? '00000000-0000-0000-0000-000000000099' : null, error: null }));
});
describe('admin reset actual handler', () => {
  it('changes only selected Auth user and does not confirm their email', async () => {
    const result = await adminResetPassword({ data: { userId: fixture.target, newPassword: 'NewValid123' } });
    expect(fixture.update).toHaveBeenCalledExactlyOnceWith(fixture.target,{ password: 'NewValid123' });
    expect(result).toMatchObject({ ok: true, emailConfirmed: false, ready: false });
    expect(fixture.rpc).toHaveBeenCalledWith('account_auth_finish',expect.objectContaining({ _state: 'completed' }));
  });
  it('denied callers cannot invoke privileged Auth update', async () => {
    fixture.assertPermission.mockRejectedValue(new Error('denied'));
    await expect(adminResetPassword({ data: { userId: fixture.target, newPassword: 'NewValid123' } })).rejects.toThrow('denied');
    expect(fixture.update).not.toHaveBeenCalled();
  });
  it('ordinary admin cannot reset super admin by substituting target ID', async () => {
    fixture.targetRole = 'role-super-admin';
    await expect(adminResetPassword({ data: { userId: fixture.target, newPassword: 'NewValid123' } })).rejects.toThrow('Super Admin');
    expect(fixture.update).not.toHaveBeenCalled();
  });
  it('admin cannot reset own password through employee action', async () => {
    await expect(adminResetPassword({ data: { userId: fixture.actor, newPassword: 'NewValid123' } })).rejects.toThrow('Đổi mật khẩu');
    expect(fixture.update).not.toHaveBeenCalled();
  });
  it('weak passwords fail before any privileged update', async () => {
    await expect(adminResetPassword({ data: { userId: fixture.target, newPassword: 'abc123' } })).rejects.toThrow();
    expect(fixture.update).not.toHaveBeenCalled();
  });
  it('Auth rejection never returns success and writes failed reservation', async () => {
    fixture.update.mockResolvedValue({ error: { code: 'weak_password' } });
    await expect(adminResetPassword({ data: { userId: fixture.target, newPassword: 'NewValid123' } })).rejects.toThrow('chính sách');
    expect(fixture.rpc).toHaveBeenCalledWith('account_auth_finish',expect.objectContaining({ _state: 'failed' }));
  });
  it('quota rejection happens before password mutation', async () => {
    fixture.rpc.mockResolvedValue({ data: null, error: { message: 'quota' } });
    await expect(adminResetPassword({ data: { userId: fixture.target, newPassword: 'NewValid123' } })).rejects.toThrow('quá nhiều');
    expect(fixture.update).not.toHaveBeenCalled();
  });
  it('audit failure after mutation warns not to repeat the password update', async () => {
    fixture.rpc.mockImplementation((name: string) => Promise.resolve(name === 'account_auth_reserve' ? { data: '00000000-0000-0000-0000-000000000099', error: null } : { data: null, error: {} }));
    await expect(adminResetPassword({ data: { userId: fixture.target, newPassword: 'NewValid123' } })).rejects.toThrow('Không đặt lại lần nữa');
    expect(fixture.update).toHaveBeenCalledTimes(1);
  });
});