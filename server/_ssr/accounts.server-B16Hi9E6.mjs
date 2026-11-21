import { createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
async function assertAccountPermission(client, userId, permission) {
  const { data: profile, error } = await client.from("profiles").select("status,is_system_admin").eq("id", userId).maybeSingle();
  if (error || profile?.status !== "Đang hoạt động") throw new Error("Tài khoản hiện không được phép truy cập.");
  const { data: allowed, error: permissionError } = await client.rpc("account_caller_can", { _permission: permission });
  if (permissionError || !allowed) throw new Error("Bạn không có quyền thao tác tài khoản này.");
}
function publicAuthClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Dịch vụ xác thực chưa sẵn sàng.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } }
  });
}
function safeRedirect(value) {
  const url = new URL(value);
  const allowed = ["https://base.suviet.vn", "https://quanly-suviet.lovable.app", "https://id-preview--32968bd6-6ca2-45ac-99ce-8a48c617e3d0.lovable.app", "http://localhost:8080"];
  if (!allowed.includes(url.origin) || url.username || url.password || url.pathname !== "/login") throw new Error("Địa chỉ xác nhận không hợp lệ.");
  return url.origin + "/login";
}
async function authState(admin, userId) {
  const [{ data: profile, error: profileError }, { data, error }] = await Promise.all([
    admin.from("profiles").select("id,email,status").eq("id", userId).maybeSingle(),
    admin.auth.admin.getUserById(userId)
  ]);
  const user = data.user;
  const bannedUntil = user && "banned_until" in user ? String(user.banned_until ?? "") : "";
  return {
    userId,
    profileExists: !!profile && !profileError,
    authExists: !!user && !error,
    emailConfirmed: !!user?.email_confirmed_at,
    emailMatches: !!profile && !!user && (profile.email ?? "").toLowerCase() === (user.email ?? "").toLowerCase(),
    banned: !!bannedUntil && Date.parse(bannedUntil) > Date.now(),
    status: profile?.status ?? null
  };
}
export {
  assertAccountPermission,
  authState,
  publicAuthClient,
  safeRedirect
};
