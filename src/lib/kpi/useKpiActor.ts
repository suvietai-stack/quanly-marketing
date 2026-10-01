import { useAuth, useCurrentUser } from "@/lib/auth";
import { KPI_ALL, KPI_PERM_KEYS, type KpiActor, type KpiPerms } from "./perms";

/** Hook: quyền KPI của người đăng nhập. Admin/Super Admin/tài khoản hệ thống = toàn quyền (khớp private.is_admin). */
export function useKpiActor(): KpiActor | null {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const { can } = useCurrentUser();
  if (!me) return null;
  const full = !!me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin";
  const p = full ? KPI_ALL : (Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, can(k as never)])) as KpiPerms);
  return { id: me.id, isAdmin: p["kpi.view_all"], p };
}
