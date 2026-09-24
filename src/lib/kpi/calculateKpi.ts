/**
 * KPI V2 — calculation engine (PURE). Không gọi Supabase, không mutate store, không phụ thuộc UI.
 * DAY 2: web_content_completed, social_post_completed, task_completed.
 */
import type { Task, WebContent, SocialPost } from "@/lib/store";
import type { KpiMetricKey, KpiOperator } from "./types";
import { isWithinPeriod, timeOf, toDateKey } from "./date";
import { matchesEmployee, type KpiEmployee } from "./identity";

export type KpiSourceType = "web_content" | "social_post" | "task";

export interface KpiEvidence {
  sourceType: KpiSourceType;
  sourceId: string;
  title: string;
  creditedAt: string; // YYYY-MM-DD
  brandId: string | null;
  websiteId?: string | null;
  socialId?: string | null;
  /** Deadline so sánh với creditedAt; null nếu không có/không xác định (Social). */
  deadline: string | null;
  onTime: boolean | null;
  revisions: number;
  firstPass: boolean;
  basis: "history" | "legacy_completedAt" | "submittedAt";
}

export interface KpiWarning {
  sourceType: KpiSourceType;
  sourceId: string;
  title: string;
  code: "unverified_no_history" | "missing_submitted_at";
  message: string;
}

export interface KpiCalculationResult {
  metricKey: KpiMetricKey | string;
  actualValue: number;
  evidence: KpiEvidence[];
  warnings: KpiWarning[];
  supported: boolean;
}

export interface KpiItemInput {
  metricKey: KpiMetricKey | string;
  targetValue: number;
  targetOperator?: KpiOperator;
  brandId?: string | null;
  websiteId?: string | null;
  socialId?: string | null;
}

export interface KpiPeriodInput {
  periodStart: string;
  periodEnd: string;
}

export interface KpiDataContext {
  webContents: WebContent[];
  socialPosts: SocialPost[];
  tasks: Task[];
}

type HistoryLike = { at: string; toStatus?: string };

/**
 * Tìm lần transition tới `submitStatus` CUỐI CÙNG trước lần transition tới `approvedStatus` CUỐI CÙNG.
 * Trả null nếu history không chứa lần duyệt, hoặc không có lần gửi duyệt trước đó.
 */
function findCreditFromHistory(
  history: HistoryLike[] | undefined,
  submitStatus: string,
  approvedStatus: string,
): { found: "none" | "approved_no_submit" | "ok"; submittedAt?: string } {
  const h = (history ?? []).filter((e) => e && e.at && !Number.isNaN(timeOf(e.at)))
    .slice().sort((a, b) => timeOf(a.at) - timeOf(b.at));
  let approvedIdx = -1;
  for (let i = h.length - 1; i >= 0; i--) {
    if (h[i].toStatus === approvedStatus) { approvedIdx = i; break; }
  }
  if (approvedIdx < 0) return { found: "none" };
  for (let i = approvedIdx - 1; i >= 0; i--) {
    if (h[i].toStatus === submitStatus) return { found: "ok", submittedAt: h[i].at };
  }
  return { found: "approved_no_submit" };
}

function scopeOk(item: KpiItemInput, rec: { brandId?: string | null; websiteId?: string | null; socialId?: string | null }): boolean {
  if (item.brandId && rec.brandId !== item.brandId) return false;
  if (item.websiteId && rec.websiteId !== item.websiteId) return false;
  if (item.socialId && rec.socialId !== item.socialId) return false;
  return true;
}

function onTime(deadline: string | null, credited: string): boolean | null {
  const d = toDateKey(deadline);
  return d ? credited <= d : null;
}

const WEB_POST_APPROVAL: ReadonlySet<string> = new Set([
  "Bài viết đã duyệt", "Đang trình bày nháp web", "Chờ duyệt bản nháp web", "Cần sửa bản nháp web",
  "Bản nháp web đã duyệt", "Chờ đăng web", "Đã đăng web", "Kiểm tra index", "Hoàn thành",
]);
const SOCIAL_POST_APPROVAL: ReadonlySet<string> = new Set(["Đã duyệt", "Chờ đăng", "Đã đăng", "Hoàn thành"]);

/* ---------------- web_content_completed ---------------- */
export function calcWebContentCompleted(
  employee: KpiEmployee, item: KpiItemInput, period: KpiPeriodInput, data: KpiDataContext,
): KpiCalculationResult {
  const evidence: KpiEvidence[] = [];
  const warnings: KpiWarning[] = [];
  for (const c of data.webContents) {
    if (c.status === "Đã hủy") continue;
    if (c.type === "Bài tối ưu lại") continue; // workflow tối ưu riêng, không phải sản lượng viết mới
    if (!matchesEmployee(c.writer, employee)) continue;
    if (!scopeOk(item, { brandId: c.brandId, websiteId: c.websiteId })) continue;

    const r = findCreditFromHistory(c.history, "Chờ duyệt bài", "Bài viết đã duyệt");
    let credited: string | null = null;
    let basis: KpiEvidence["basis"] = "history";
    if (r.found === "ok") {
      credited = toDateKey(r.submittedAt);
    } else if (r.found === "none" && c.status === "Hoàn thành" && c.completedAt) {
      credited = toDateKey(c.completedAt); // legacy fallback thận trọng
      basis = "legacy_completedAt";
    } else if (WEB_POST_APPROVAL.has(c.status)) {
      warnings.push({ sourceType: "web_content", sourceId: c.id, title: c.title, code: "unverified_no_history",
        message: "Bài đã qua bước duyệt nhưng không xác định được ngày gửi bản cuối — không tính." });
    }
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const revisions = c.draftRevisions ?? 0;
    evidence.push({
      sourceType: "web_content", sourceId: c.id, title: c.title, creditedAt: credited,
      brandId: c.brandId ?? null, websiteId: c.websiteId ?? null,
      deadline: c.deadline ?? null, onTime: onTime(c.deadline ?? null, credited),
      revisions, firstPass: revisions === 0, basis,
    });
  }
  return { metricKey: "web_content_completed", actualValue: evidence.length, evidence, warnings, supported: true };
}

/* ---------------- social_post_completed ---------------- */
export function calcSocialPostCompleted(
  employee: KpiEmployee, item: KpiItemInput, period: KpiPeriodInput, data: KpiDataContext,
): KpiCalculationResult {
  const evidence: KpiEvidence[] = [];
  const warnings: KpiWarning[] = [];
  for (const p of data.socialPosts) {
    if (p.status === "Đã hủy") continue;
    if (!matchesEmployee(p.writer, employee)) continue;
    if (!scopeOk(item, { brandId: p.brandId, socialId: p.channelId })) continue;

    const r = findCreditFromHistory(p.history, "Chờ duyệt", "Đã duyệt");
    if (r.found !== "ok") {
      if (SOCIAL_POST_APPROVAL.has(p.status)) {
        warnings.push({ sourceType: "social_post", sourceId: p.id, title: p.title, code: "unverified_no_history",
          message: "Bài đã qua bước duyệt nhưng không có lịch sử gửi duyệt — không tính." });
      }
      continue;
    }
    const credited = toDateKey(r.submittedAt);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const revisions = p.revisions ?? 0;
    evidence.push({
      sourceType: "social_post", sourceId: p.id, title: p.title, creditedAt: credited,
      brandId: p.brandId ?? null, socialId: p.channelId ?? null,
      deadline: null, onTime: null, // không invent deadline Writer cho Social
      revisions, firstPass: revisions === 0, basis: "history",
    });
  }
  return { metricKey: "social_post_completed", actualValue: evidence.length, evidence, warnings, supported: true };
}

/* ---------------- task_completed ---------------- */
export function calcTaskCompleted(
  employee: KpiEmployee, item: KpiItemInput, period: KpiPeriodInput, data: KpiDataContext,
): KpiCalculationResult {
  const evidence: KpiEvidence[] = [];
  const warnings: KpiWarning[] = [];
  for (const t of data.tasks) {
    if (t.status !== "Hoàn thành") continue;
    if (!matchesEmployee(t.assignee, employee)) continue;
    if (!scopeOk(item, { brandId: t.brandId })) continue;
    const credited = toDateKey(t.submittedAt);
    if (!credited) {
      warnings.push({ sourceType: "task", sourceId: t.id, title: t.title, code: "missing_submitted_at",
        message: "Task Hoàn thành nhưng không có ngày gửi hoàn thành — không tính." });
      continue;
    }
    if (!isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const revisions = t.revisions ?? 0;
    evidence.push({
      sourceType: "task", sourceId: t.id, title: t.title, creditedAt: credited,
      brandId: t.brandId ?? null,
      deadline: t.deadline ?? null, onTime: onTime(t.deadline ?? null, credited),
      revisions, firstPass: revisions === 0, basis: "submittedAt",
    });
  }
  return { metricKey: "task_completed", actualValue: evidence.length, evidence, warnings, supported: true };
}

/* ---------------- dispatcher ---------------- */
export function calculateKpiItem(
  employee: KpiEmployee, item: KpiItemInput, period: KpiPeriodInput, data: KpiDataContext,
): KpiCalculationResult {
  switch (item.metricKey) {
    case "web_content_completed": return calcWebContentCompleted(employee, item, period, data);
    case "social_post_completed": return calcSocialPostCompleted(employee, item, period, data);
    case "task_completed": return calcTaskCompleted(employee, item, period, data);
    default: return { metricKey: item.metricKey, actualValue: 0, evidence: [], warnings: [], supported: false };
  }
}

/** Mỗi KPI item giữ kết quả riêng — KHÔNG cộng gộp các metric khác đơn vị. */
export function calculateKpiItems(
  employee: KpiEmployee, items: KpiItemInput[], period: KpiPeriodInput, data: KpiDataContext,
) {
  return items.map((item) => {
    const result = calculateKpiItem(employee, item, period, data);
    return { item, result, progress: calculateProgress(result.actualValue, item.targetValue, item.targetOperator ?? ">=") };
  });
}

/**
 * Progress (%) — không clamp (35/30 = 116.67). target <= 0 → null (tránh chia 0).
 * Với "<=": target/actual (actual 0 → 100 nếu đạt).
 */
export function calculateProgress(actual: number, target: number, operator: KpiOperator = ">="): number | null {
  if (!Number.isFinite(actual) || !Number.isFinite(target) || target <= 0) return null;
  let pct: number;
  if (operator === "<=") pct = actual <= 0 ? 100 : (target / actual) * 100;
  else if (operator === "=") pct = actual === target ? 100 : (Math.min(actual, target) / Math.max(actual, target)) * 100;
  else pct = (actual / target) * 100;
  return Math.round(pct * 100) / 100;
}
