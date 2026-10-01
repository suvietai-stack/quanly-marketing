/** Quyền module KPI / Giao KPI — dùng chung hệ thống Role & Permission (has_permission ở backend). */
import { useAuth, useCurrentUser } from "@/lib/auth";

export const KPI_PERM_KEYS = [
  "kpi.view_own", "kpi.view_all",
  "kpi.goal_create", "kpi.goal_edit", "kpi.goal_archive", "kpi.goal_delete",
  "kpi.kr_assign", "kpi.kr_adjust",
  "kpi.period_manage",
  "kpi.report", "kpi.report_export",
] as const;
export type KpiPermKey = (typeof KPI_PERM_KEYS)[number];
export type KpiPerms = Record<KpiPermKey, boolean>;

export const KPI_ALL: KpiPerms = Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, true])) as KpiPerms;
export const KPI_NONE: KpiPerms = Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, false])) as KpiPerms;

/** Người thao tác KPI. `isAdmin` = được xem dữ liệu của người khác (kpi.view_all). `p` = quyền chi tiết. */
export interface KpiActor { id: string; isAdmin: boolean; p?: KpiPerms }

/** Actor cũ không có `p` → isAdmin=true nghĩa là toàn quyền (tương thích test/lời gọi nội bộ). */
export function kpiCan(a: KpiActor, k: KpiPermKey): boolean {
  return a.p ? a.p[k] : a.isAdmin;
}

/** Hook: quyền KPI của người đăng nhập. Admin/Super Admin/tài khoản hệ thống = toàn quyền (khớp private.is_admin). */
export function useKpiActor(): KpiActor | null {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const { can } = useCurrentUser();
  if (!me) return null;
  const full = !!me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin";
  const p = full ? KPI_ALL : (Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, can(k as never)])) as KpiPerms);
  return { id: me.id, isAdmin: p["kpi.view_all"], p };
}
