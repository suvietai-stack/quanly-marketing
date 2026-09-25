/**
 * KPI V2 — thiết kế snapshot khi KHÓA KỲ (PURE, chưa ghi DB).
 * Hiện tại engine vẫn TÍNH LẠI từ store, nên actual của kỳ đã khóa CHƯA bất biến.
 * Chỉ khi snapshot này được lưu (sidecar đã duyệt) thì báo cáo kỳ khóa mới đọc từ snapshot.
 */
import type { EmployeeKpiItem, EmployeeKpiPeriod } from "./types";
import type { EvidenceRow, ItemReport } from "./report";

export interface KpiItemSnapshot {
  itemId: string; metricKey: string; unit: string; target: number;
  /** null = chưa đủ dữ liệu tại thời điểm khóa (KHÔNG đồng nhất với 0) */
  actual: number | null;
  evidence: Pick<EvidenceRow, "sourceType" | "sourceId" | "creditedAt">[];
  quality: { warnings: number; onTime: number; firstPass: number; evidenceCount: number };
  achieved: boolean | null;
}
export interface KpiPeriodSnapshot {
  periodId: string; userId: string; periodStart: string; periodEnd: string;
  lockedAt: string; lockedBy: string; engineVersion: string;
  items: KpiItemSnapshot[];
  /** true khi còn item actual null/cảnh báo → kỳ khóa ở trạng thái "Chưa kết luận" */
  incomplete: boolean;
}

export const KPI_ENGINE_VERSION = "v2-2";

export function buildPeriodSnapshot(period: EmployeeKpiPeriod, reports: ItemReport[], lockedBy: string, lockedAt: string): KpiPeriodSnapshot {
  const items = reports.filter((r) => r.item.kpiPeriodId === period.id && !r.contributionOnly).map((r): KpiItemSnapshot => ({
    itemId: r.item.id, metricKey: r.item.metricKey, unit: r.unit, target: r.lockedTarget ?? r.target, actual: r.actual,
    evidence: r.evidence.map((e) => ({ sourceType: e.sourceType, sourceId: e.sourceId, creditedAt: e.creditedAt })),
    quality: { warnings: r.warnings, onTime: r.evidence.filter((e) => e.onTime).length, firstPass: r.evidence.filter((e) => e.firstPass).length, evidenceCount: r.evidence.length },
    achieved: r.actual === null || r.warnings > 0 ? null : r.achieved,
  }));
  return { periodId: period.id, userId: period.userId, periodStart: period.periodStart, periodEnd: period.periodEnd, lockedAt, lockedBy,
    engineVersion: KPI_ENGINE_VERSION, items, incomplete: items.some((i) => i.actual === null || i.quality.warnings > 0) };
}

/** Actual kỳ khóa: chỉ "bất biến" khi có snapshot; không có → trả nguồn "live" để UI ghi rõ đang tính lại. */
export function resolveLockedActual(item: EmployeeKpiItem, live: number | null, snap?: KpiPeriodSnapshot | null): { actual: number | null; source: "snapshot" | "live" } {
  const s = snap?.items.find((i) => i.itemId === item.id);
  return s ? { actual: s.actual, source: "snapshot" } : { actual: live, source: "live" };
}
