/** Quyền module KPI / Giao KPI — dùng chung hệ thống Role & Permission (has_permission ở backend). */

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

