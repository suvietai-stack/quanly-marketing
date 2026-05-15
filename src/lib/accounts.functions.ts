import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const isAdmin = (data ?? []).some(
    (r) => r.role_id === "role-super-admin" || r.role_id === "role-admin",
  );
  if (!isAdmin) throw new Error("Chỉ Admin/Super Admin mới có quyền thao tác.");
}

async function isSystemAdminTarget(targetId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("is_system_admin")
    .eq("id", targetId)
    .maybeSingle();
  return !!data?.is_system_admin;
}

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        newPassword: z.string().min(6).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (await isSystemAdminTarget(data.userId)) {
      throw new Error("Không thể xóa tài khoản hệ thống.");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
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
