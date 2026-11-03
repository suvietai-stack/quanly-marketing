import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { passwordIssues } from '@/lib/password';
import { authErrorMessage } from '@/lib/auth-errors';

const SUPER_ADMIN_ROLE = "role-super-admin";

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        newPassword: z.string().refine(v => passwordIssues(v).length === 0, { message: 'Mật khẩu cần 8–200 ký tự, gồm chữ cái và chữ số.' }),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAccountPermission, authState } = await import('@/lib/accounts.server');
    await assertAccountPermission(context.supabase, context.userId, 'settings.user_reset_password');
    if (data.userId === context.userId) throw new Error('Vui lòng dùng chức năng Đổi mật khẩu cho tài khoản của bạn.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [{ data: target, error: targetError }, { data: targetRoles, error: targetRoleError }, { data: actorRoles, error: actorRoleError }, { data: actor, error: actorError }] = await Promise.all([
      supabaseAdmin.from('profiles').select('is_system_admin').eq('id', data.userId).maybeSingle(),
      supabaseAdmin.from('user_roles').select('role_id').eq('user_id', data.userId),
      context.supabase.from('user_roles').select('role_id').eq('user_id', context.userId),
      context.supabase.from('profiles').select('is_system_admin').eq('id', context.userId).maybeSingle(),
    ]);
    if (!target || targetError || targetRoleError || actorRoleError || actorError) throw new Error('Không kiểm tra được hồ sơ và quyền tài khoản.');
    const targetIsSuper = target.is_system_admin || targetRoles?.some(r => r.role_id === SUPER_ADMIN_ROLE);
    if (targetIsSuper && !actor?.is_system_admin && !actorRoles?.some(r => r.role_id === SUPER_ADMIN_ROLE)) {
      throw new Error("Chỉ Super Admin mới được reset mật khẩu tài khoản quản trị cấp cao.");
    }
    const state = await authState(supabaseAdmin, data.userId);
    if (!state.authExists || !state.emailMatches) throw new Error('Hồ sơ và tài khoản xác thực cần kiểm tra trước khi đặt lại mật khẩu.');
    const { data: reservation, error: reserveError } = await supabaseAdmin.rpc('account_auth_reserve', { _bucket: `reset:${context.userId}`, _action: 'reset_password', _actor: context.userId, _target: data.userId });
    if (reserveError || !reservation) throw new Error('Bạn đã thao tác quá nhiều lần hoặc nhật ký chưa sẵn sàng. Vui lòng thử lại sau.');
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    const { error: logError } = await supabaseAdmin.rpc('account_auth_finish', { _id: reservation, _state: error ? 'failed' : 'completed' });
    if (error) throw new Error(authErrorMessage(error, 'password'));
    if (logError) throw new Error('Mật khẩu đã cập nhật nhưng chưa xác nhận được nhật ký. Không đặt lại lần nữa; hãy kiểm tra trạng thái.');
    return { ok: true, emailConfirmed: state.emailConfirmed, ready: state.emailConfirmed && state.status === 'Đang hoạt động' && !state.banned };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAccountPermission } = await import('@/lib/accounts.server');
    await assertAccountPermission(context.supabase, context.userId, 'settings.user_delete');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [{ data: target, error: targetError }, { data: roles, error: rolesError }] = await Promise.all([
      supabaseAdmin.from('profiles').select('is_system_admin').eq('id', data.userId).maybeSingle(),
      supabaseAdmin.from('user_roles').select('role_id').eq('user_id', data.userId),
    ]);
    if (targetError || rolesError || !target) throw new Error('Không kiểm tra được tài khoản được chọn.');
    if (target.is_system_admin || roles?.some(r => r.role_id === SUPER_ADMIN_ROLE) || data.userId === context.userId) {
      throw new Error("Không thể xóa tài khoản hệ thống.");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    const { error: logError } = await supabaseAdmin.from('account_security_logs').insert({ actor_id: context.userId, target_id: data.userId, action: 'delete_user' });
    if (logError) throw new Error('Đã xóa tài khoản nhưng chưa lưu được nhật ký.');
    return { ok: true };
  });

export const usernameSignIn = createServerFn({ method: 'POST' })
  .inputValidator(input => z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(1000) }).parse(input))
  .handler(async ({ data }) => {
    const { publicAuthClient } = await import('@/lib/accounts.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.username.trim().toLowerCase())))).map(v => v.toString(16).padStart(2, '0')).join('');
    const { error: throttle } = await supabaseAdmin.rpc('account_auth_reserve', { _bucket: `login:${digest}`, _action: 'username_login' });
    if (throttle) return { ok: false as const, error: 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau.' };
    const { data: id, error: lookupError } = await supabaseAdmin.rpc('account_username_identity', { _username: data.username });
    if (lookupError || !id) return { ok: false as const, error: 'Thông tin đăng nhập không chính xác.' };
    const { data: identity, error: identityError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (identityError || !identity.user?.email) return { ok: false as const, error: 'Thông tin đăng nhập không chính xác.' };
    const { data: signed, error } = await publicAuthClient().auth.signInWithPassword({ email: identity.user.email, password: data.password });
    if (error || !signed.session) return { ok: false as const, error: authErrorMessage(error) };
    return { ok: true as const, session: { access_token: signed.session.access_token, refresh_token: signed.session.refresh_token } };
  });

export const accountAuthStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAccountPermission, authState } = await import('@/lib/accounts.server');
    await assertAccountPermission(context.supabase, context.userId, 'settings.user_view');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    return authState(supabaseAdmin, data.userId);
  });

export const resendConfirmation = createServerFn({ method: 'POST' })
  .inputValidator(input => z.object({ email: z.string().email().max(254), redirect: z.string().url() }).parse(input))
  .handler(async ({ data }) => {
    const { publicAuthClient, safeRedirect } = await import('@/lib/accounts.server');
    const redirect = safeRedirect(data.redirect);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.email.trim().toLowerCase())))).map(v => v.toString(16).padStart(2, '0')).join('');
    const { error: throttle } = await supabaseAdmin.rpc('account_auth_reserve', { _bucket: `confirmation:${digest}`, _action: 'confirmation' });
    if (throttle) throw new Error('Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.');
    const { error } = await publicAuthClient().auth.resend({ type: 'signup', email: data.email.trim().toLowerCase(), options: { emailRedirectTo: redirect } });
    if (error && !['user_not_found','email_not_confirmed'].includes(error.code ?? '')) throw new Error(authErrorMessage(error, 'send'));
    return { ok: true };
  });
