/** Mục tiêu → KR chung → Dòng phân bổ. Logic thuần, dùng chung cho trang Mục tiêu, Dashboard và kiểm thử. */
import type { EmployeeKpiItem, GoalKr } from "./types";
import { getKpiMetric } from "./metrics";

/** KR sản lượng cộng dồn được → cho phép chia chỉ tiêu cho nhiều nhân viên. */
export function isDivisible(metricKey: string): boolean {
  const m = getKpiMetric(metricKey);
  if (!m) return false;
  if (m.direction === "at_most" || m.unit === "percent" || m.unit === "currency" || m.ratio) return false;
  if (m.needs === "keyword" || m.needs === "views" || m.needs === "label" || m.needs === "tasks") return false;
  if (m.krGroup === "Kết quả Marketing" || m.krGroup === "Chuyển đổi") return false;
  return m.unit === "count" || m.unit === "point";
}

export const allocationsOf = <T extends Pick<EmployeeKpiItem, "krId">>(krId: string, items: T[]) => items.filter((i) => i.krId === krId);

export interface AllocationSummary { allocated: number; target: number; diff: number; message: string | null; balanced: boolean }
export function allocationSummary(kr: Pick<GoalKr, "targetValue" | "metricKey">, allocs: Pick<EmployeeKpiItem, "targetValue">[]): AllocationSummary {
  const allocated = allocs.reduce((s, a) => s + a.targetValue, 0);
  const target = kr.targetValue;
  if (!isDivisible(kr.metricKey)) {
    const ok = allocs.length === 1;
    return { allocated, target, diff: 0, balanced: ok, message: ok ? null : allocs.length ? "KR này không phân bổ theo nhân sự — chỉ giữ 1 người chịu trách nhiệm." : "Chưa có người chịu trách nhiệm." };
  }
  const diff = allocated - target;
  return { allocated, target, diff, balanced: diff === 0 && allocs.length > 0,
    message: diff < 0 ? `Còn ${-diff} chưa phân bổ` : diff > 0 ? `Vượt chỉ tiêu KR ${diff}` : null };
}

/** Dòng phân bổ phải nằm trong phạm vi KR. */
export function checkAllocationScope(kr: Pick<GoalKr, "brandId" | "websiteId" | "socialId">, a: { websiteId?: string | null; socialId?: string | null },
  brandOfAsset: (kind: "website" | "social", id: string) => string | null | undefined): string | null {
  if (kr.websiteId && a.websiteId !== kr.websiteId) return "Dòng phân bổ phải thuộc đúng Website của KR.";
  if (kr.socialId && a.socialId !== kr.socialId) return "Dòng phân bổ phải thuộc đúng tài khoản Social của KR.";
  if (kr.websiteId && a.socialId) return "KR Website không nhận dòng phân bổ Social.";
  if (kr.socialId && a.websiteId) return "KR Social không nhận dòng phân bổ Website.";
  if (kr.brandId) {
    if (a.websiteId && brandOfAsset("website", a.websiteId) !== kr.brandId) return "Website không thuộc dự án của KR.";
    if (a.socialId && brandOfAsset("social", a.socialId) !== kr.brandId) return "Tài khoản Social không thuộc dự án của KR.";
  }
  return null;
}

export type AllocResult = { value: number | null; evidence: { type: string; id: string }[] };
/** Kết quả KR chung: KR cộng dồn → đếm bằng chứng không trùng giữa các dòng; KR khác → lấy kết quả của dòng duy nhất. */
export function aggregateKr(metricKey: string, results: AllocResult[]): number | null {
  if (!results.length) return null;
  if (!isDivisible(metricKey)) return results.length === 1 ? results[0].value : null;
  const m = getKpiMetric(metricKey);
  if (m?.unit === "point") { // điểm thiết kế: cộng giá trị, bỏ dòng thiếu dữ liệu
    const vals = results.map((r) => r.value);
    return vals.some((v) => v === null) ? null : (vals as number[]).reduce((s, v) => s + v, 0);
  }
  const seen = new Set<string>();
  let loose = 0; let any = false;
  for (const r of results) {
    if (r.evidence.length) { any = true; r.evidence.forEach((e) => seen.add(`${e.type}:${e.id}`)); }
    else if (r.value !== null) { any = true; loose += r.value; }
  }
  return any ? seen.size + loose : null;
}

/** Được xóa khi chưa có kết quả và kỳ chưa khóa; nếu không → chỉ Hủy/Lưu trữ. */
export const canHardDelete = (hasResult: boolean, locked: boolean) => !hasResult && !locked;
