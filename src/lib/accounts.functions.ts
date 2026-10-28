import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SUPER_ADMIN_ROLE = "role-super-admin";
const ADMIN_ROLE = "role-admin";
const RESET_RATE_LIMIT_PER_HOUR = 10;

async function callerRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role_id as string);
}

async function isSystemAdminUser(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("is_system_admin")
    .eq("id", userId)
    .maybeSingle();
  return !!data?.is_system_admin;
}

async function isSuperAdminUser(userId: string): Promise<boolean> {
  if (await isSystemAdminUser(userId)) return true;
  return (await callerRoles(userId)).includes(SUPER_ADMIN_ROLE);
}

/** Người gọi được phép reset mật khẩu tài khoản khác không. */
async function assertCanResetPassword(userId: string) {
  const roles = await callerRoles(userId);
  if (roles.includes(SUPER_ADMIN_ROLE) || roles.includes(ADMIN_ROLE)) return;
  if (await isSystemAdminUser(userId)) return;
  const { data, error } = await supabaseAdmin.rpc("has_permission", {
    _user_id: userId,
    _permission: "settings.user_reset_password",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Bạn không có quyền reset mật khẩu tài khoản khác.");
}

/** Ghi nhật ký bảo mật — tuyệt đối không ghi mật khẩu. */
async function logSecurityAction(actorId: string, targetId: string, action: string) {
  await supabaseAdmin.from("account_security_logs").insert({
    actor_id: actorId,
    target_id: targetId,
    action,
  });
}

async function assertResetRateLimit(actorId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("account_security_logs")
    .select("id", { count: "exact", head: true })
    .eq("actor_id", actorId)
    .eq("action", "reset_password")
    .gte("created_at", since);
  if (error) throw new Error(error.message);
  if ((count ?? 0) >= RESET_RATE_LIMIT_PER_HOUR) {
    throw new Error("Bạn đã reset mật khẩu quá nhiều lần trong một giờ. Vui lòng thử lại sau.");
  }
}

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        newPassword: z
          .string()
          .min(8, "Mật khẩu mới tối thiểu 8 ký tự.")
          .max(200)
          .refine((v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v), {
            message: "Mật khẩu mới cần có cả chữ cái và chữ số.",
          }),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertCanResetPassword(context.userId);
    // Phân cấp: tài khoản hệ thống / Super Admin chỉ Super Admin mới được reset.
    const targetIsSuper =
      (await isSystemAdminUser(data.userId)) ||
      (await callerRoles(data.userId)).includes(SUPER_ADMIN_ROLE);
    if (targetIsSuper && !(await isSuperAdminUser(context.userId))) {
      throw new Error("Chỉ Super Admin mới được reset mật khẩu tài khoản quản trị cấp cao.");
    }
    await assertResetRateLimit(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    await logSecurityAction(context.userId, data.userId, "reset_password");
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const roles = await callerRoles(context.userId);
    if (!roles.includes(SUPER_ADMIN_ROLE) && !roles.includes(ADMIN_ROLE) && !(await isSystemAdminUser(context.userId))) {
      throw new Error("Chỉ Admin/Super Admin mới có quyền thao tác.");
    }
    if (await isSystemAdminUser(data.userId)) {
      throw new Error("Không thể xóa tài khoản hệ thống.");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    await logSecurityAction(context.userId, data.userId, "delete_user");
    return { ok: true };
  });

export const adminLookupEmailByUsername = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ username: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    // Public lookup (no auth required) — used during login to map username -> email.
    // Returns email or null. Does not leak any other profile data.
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .ilike("username", data.username)
      .maybeSingle();
    return { email: prof?.email ?? null };
  });
