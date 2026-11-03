import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export async function assertAccountPermission(client: SupabaseClient<Database>, userId: string, permission: string) {
  const { data: profile, error } = await client.from('profiles').select('status,is_system_admin').eq('id', userId).maybeSingle();
  if (error || profile?.status !== 'Đang hoạt động') throw new Error('Tài khoản hiện không được phép truy cập.');
  const [{ data: admin, error: adminError }, { data: allowed, error: permissionError }] = await Promise.all([
    client.rpc('is_admin', { _user_id: userId }), client.rpc('has_permission', { _user_id: userId, _permission: permission }),
  ]);
  if (adminError || permissionError || (!admin && !allowed)) throw new Error('Bạn không có quyền thao tác tài khoản này.');
}

export function publicAuthClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Dịch vụ xác thực chưa sẵn sàng.');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export function safeRedirect(value: string) {
  const url = new URL(value);
  const allowed = ['https://base.suviet.vn', 'https://quanly-suviet.lovable.app', 'https://id-preview--32968bd6-6ca2-45ac-99ce-8a48c617e3d0.lovable.app', 'http://localhost:8080'];
  if (!allowed.includes(url.origin) || url.username || url.password || url.pathname !== '/login') throw new Error('Địa chỉ xác nhận không hợp lệ.');
  return url.origin + '/login';
}

export async function authState(admin: SupabaseClient<Database>, userId: string) {
  const [{ data: profile, error: profileError }, { data, error }] = await Promise.all([
    admin.from('profiles').select('id,email,status').eq('id', userId).maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);
  const user = data.user;
  const bannedUntil = user && 'banned_until' in user ? String(user.banned_until ?? '') : '';
  return {
    userId, profileExists: !!profile && !profileError, authExists: !!user && !error,
    emailConfirmed: !!user?.email_confirmed_at,
    emailMatches: !!profile && !!user && (profile.email ?? '').toLowerCase() === (user.email ?? '').toLowerCase(),
    banned: !!bannedUntil && Date.parse(bannedUntil) > Date.now(), status: profile?.status ?? null,
  };
}