import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Caller must be Super Admin (role-super-admin) OR a system admin profile
 * (is_system_admin = true). Used for bootstrap on the very first run when
 * no role rows exist yet.
 */
async function assertSuperAdminOrSystem(userId: string) {
  const [{ data: prof }, { data: roles }] = await Promise.all([
    supabaseAdmin.from("profiles").select("is_system_admin").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("user_roles").select("role_id").eq("user_id", userId),
  ]);
  const isSystem = !!prof?.is_system_admin;
  const isSuper = (roles ?? []).some((r) => r.role_id === "role-super-admin");
  if (!isSystem && !isSuper) {
    throw new Error("Chỉ Super Admin / Tài khoản hệ thống mới có thể khôi phục quyền mặc định.");
  }
  return { isSystem };
}

const RoleSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  is_system: z.boolean(),
  permissions: z.array(z.string().min(1).max(120)).max(2000),
});

export const restoreDefaultRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ roles: z.array(RoleSchema).min(1).max(50) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { isSystem } = await assertSuperAdminOrSystem(context.userId);

    // Upsert all default roles. is_system flag is enforced from payload.
    const rows = data.roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      is_system: r.is_system,
      permissions: r.permissions,
      updated_at: new Date().toISOString(),
    }));
    const { error: upErr } = await supabaseAdmin.from("app_roles").upsert(rows, { onConflict: "id" });
    if (upErr) throw new Error(upErr.message);

    // Bootstrap: ensure every system-admin profile has the super-admin role.
    if (isSystem) {
      const { data: sysProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("is_system_admin", true);
      for (const p of sysProfiles ?? []) {
        const { data: existing } = await supabaseAdmin
          .from("user_roles")
          .select("role_id")
          .eq("user_id", p.id)
          .eq("role_id", "role-super-admin")
          .maybeSingle();
        if (!existing) {
          await supabaseAdmin.from("user_roles").insert({ user_id: p.id, role_id: "role-super-admin" });
        }
      }
    }

    return { ok: true, count: rows.length };
  });
