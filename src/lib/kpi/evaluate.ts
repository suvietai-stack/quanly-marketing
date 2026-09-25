/**
 * Hàm dùng chung (PURE) cho Mục tiêu, Dashboard, Báo cáo, Dashboard cá nhân:
 * - Liên kết Goal ↔ KR
 * - Đánh giá đạt theo hướng (ít nhất / không vượt quá)
 * - Deadline riêng của KR, hoàn thành muộn, quá hạn
 * - Kết quả snapshot khi khóa kỳ
 * - Chống cộng trùng ghi nhận thủ công
 */
import type { EmployeeKpiItem, EmployeeKpiPeriod } from "./types";
import { getKpiMetric } from "./metrics";

/* ---------- Goal ↔ KR ---------- */
/** Goal của KR: ưu tiên goalId gắn trực tiếp trên KR; chỉ dữ liệu cũ (KR không có goalId) mới dùng goalId của kỳ. */
export function krGoalId(item: Pick<EmployeeKpiItem, "metadata" | "kpiPeriodId">, periods: Pick<EmployeeKpiPeriod, "id" | "goalId">[]): string | null {
  const md = (item.metadata ?? {}) as { goalId?: unknown };
  // KR mới luôn có khóa goalId (kể cả null = không thuộc mục tiêu nào) → không bao giờ rơi về goalId của kỳ.
  if ("goalId" in md) return typeof md.goalId === "string" && md.goalId ? md.goalId : null;
  return periods.find((p) => p.id === item.kpiPeriodId)?.goalId ?? null;
}
export const krsOfGoal = <T extends Pick<EmployeeKpiItem, "metadata" | "kpiPeriodId">>(goalId: string, items: T[], periods: Pick<EmployeeKpiPeriod, "id" | "goalId">[]) =>
  items.filter((i) => krGoalId(i, periods) === goalId);

/* ---------- Hướng đánh giá ---------- */
export type Direction = "at_least" | "at_most";
export const directionOf = (metricKey: string): Direction => (getKpiMetric(metricKey)?.direction === "at_most" ? "at_most" : "at_least");
export function isAchieved(actual: number | null, target: number, direction: Direction): boolean | null {
  if (actual === null) return null;
  return direction === "at_most" ? actual <= target : actual >= target;
}

/* ---------- Deadline ---------- */
export const krDeadline = (item: Pick<EmployeeKpiItem, "metadata">, periodEnd: string): string => {
  const d = (item.metadata as { deadline?: unknown } | null)?.deadline;
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : periodEnd;
};

/** Ngày KR đạt chỉ tiêu (chỉ tính được với KR đếm sản lượng "ít nhất"): ngày của kết quả thứ `target`. */
export function reachedAt(dates: string[], target: number, direction: Direction, unit: string): string | null {
  if (direction !== "at_least" || unit !== "count" || target <= 0 || !Number.isInteger(target)) return null;
  const s = dates.filter(Boolean).map((d) => d.slice(0, 10)).sort();
  return s.length >= target ? s[target - 1] : null;
}

export type KrState = "achieved" | "late" | "overdue" | "failed" | "in_progress" | "insufficient" | "contribution";
export interface KrEvaluation { achieved: boolean | null; state: KrState; label: string; pct: number | null; deadline: string; completedAt: string | null }

export const KR_STATE_LABEL: Record<KrState, string> = {
  achieved: "Đạt", late: "Hoàn thành muộn", overdue: "Quá hạn", failed: "Không đạt", in_progress: "Đang thực hiện",
  insufficient: "Chưa đủ dữ liệu", contribution: "Chỉ đóng góp",
};
export const KR_STATE_TONE: Record<KrState, "good" | "warn" | "bad" | "none" | "info"> = {
  achieved: "good", late: "warn", overdue: "bad", failed: "bad", in_progress: "info", insufficient: "none", contribution: "none",
};

/**
 * Một hàm đánh giá thống nhất.
 * - at_least: đạt khi actual ≥ target; quá deadline mà chưa đạt → Quá hạn; đạt sau deadline (biết được ngày) → Hoàn thành muộn.
 * - at_most: vượt ngưỡng → Không đạt ngay; trước deadline chưa vượt → Đang thực hiện; hết deadline chưa vượt → Đạt.
 * - Thanh tiến độ (pct) chỉ dùng cho at_least và không dùng cho at_most.
 */
export function evaluateKr(a: {
  actual: number | null; target: number; direction: Direction; deadline: string; today: string;
  unit?: string; evidenceDates?: string[]; warnings?: number; contributionOnly?: boolean;
}): KrEvaluation {
  const { actual, target, direction, deadline, today } = a;
  const base = { deadline, completedAt: null as string | null };
  if (a.contributionOnly) return { ...base, achieved: null, state: "contribution", label: KR_STATE_LABEL.contribution, pct: null };
  if (actual === null) return { ...base, achieved: null, state: "insufficient", label: KR_STATE_LABEL.insufficient, pct: null };
  const pastDeadline = today > deadline;
  if (direction === "at_most") {
    if (actual > target) return { ...base, achieved: false, state: "failed", label: KR_STATE_LABEL.failed, pct: null };
    if (!pastDeadline) return { ...base, achieved: null, state: "in_progress", label: "Đang trong ngưỡng", pct: null };
    return { ...base, achieved: true, state: "achieved", label: KR_STATE_LABEL.achieved, pct: null };
  }
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : null;
  if (actual >= target) {
    const done = reachedAt(a.evidenceDates ?? [], target, direction, a.unit ?? "");
    if (done && done > deadline) return { achieved: true, state: "late", label: KR_STATE_LABEL.late, pct, deadline, completedAt: done };
    return { achieved: true, state: "achieved", label: KR_STATE_LABEL.achieved, pct, deadline, completedAt: done };
  }
  // Chưa đạt nhưng còn mục chưa xác minh có thể đổi kết luận → chưa kết luận Không đạt.
  if (pastDeadline) return { ...base, achieved: a.warnings ? null : false, state: "overdue", label: KR_STATE_LABEL.overdue, pct };
  return { ...base, achieved: null, state: "in_progress", label: KR_STATE_LABEL.in_progress, pct };
}

/* ---------- Snapshot khóa kỳ ---------- */
export interface LockedResult { actual: number | null; achieved: boolean | null; lockedAt: string; evidence: { type: string; id: string; at: string }[] }
/** Kết quả đã chốt khi khóa kỳ (lưu trong metadata KR). Kỳ khóa không có snapshot → null (UI ghi rõ đang tính lại). */
export function lockedResultOf(item: Pick<EmployeeKpiItem, "metadata">): LockedResult | null {
  const md = (item.metadata ?? {}) as { lockedActual?: unknown; lockedAchieved?: unknown; lockedAt?: unknown; lockedEvidence?: unknown };
  if (!("lockedActual" in md)) return null;
  return {
    actual: typeof md.lockedActual === "number" ? md.lockedActual : null,
    achieved: typeof md.lockedAchieved === "boolean" ? md.lockedAchieved : null,
    lockedAt: typeof md.lockedAt === "string" ? md.lockedAt : "",
    evidence: Array.isArray(md.lockedEvidence) ? (md.lockedEvidence as LockedResult["evidence"]) : [],
  };
}
export const isLockedPeriod = (p?: Pick<EmployeeKpiPeriod, "status"> | null) => p?.status === "locked" || p?.status === "closed";

/* ---------- Ghi nhận thủ công ---------- */
export type EntryStatus = "pending" | "confirmed" | "needs_info" | "rejected";
export interface ManualEntry { id: string; value?: number; numerator?: number; denominator?: number; link?: string; note?: string;
  recordedAt: string; recordedBy: string; confirmedBy?: string | null; confirmedAt?: string | null; status?: EntryStatus; reviewNote?: string }
export const entryStatus = (e: ManualEntry): EntryStatus => e.status ?? (e.confirmedBy ? "confirmed" : "pending");
const normLink = (s?: string) => (s ?? "").trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, "");
/** Chỉ ghi nhận đã xác nhận; bỏ trùng theo id và theo nội dung giống hệt (cùng bằng chứng + cùng số liệu). */
export function confirmedUniqueEntries<T extends ManualEntry>(entries: T[]): T[] {
  const ids = new Set<string>(); const sig = new Set<string>(); const out: T[] = [];
  for (const e of entries) {
    if (entryStatus(e) !== "confirmed" || !e.confirmedBy) continue;
    const s = `${normLink(e.link)}|${e.value ?? ""}|${e.numerator ?? ""}|${e.denominator ?? ""}`;
    if (ids.has(e.id) || (normLink(e.link) && sig.has(s))) continue;
    ids.add(e.id); sig.add(s); out.push(e);
  }
  return out;
}
