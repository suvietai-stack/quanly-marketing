/**
 * KPI V2 — DAY 6: Tổng quan theo BRAND / ASSET (PURE, chỉ đọc).
 * Aggregation: cùng metric (+đơn vị) trong kỳ ⇒ SUM(actual)/SUM(target) trên các assignment,
 * KHÔNG trung bình % cá nhân. Khác metric/đơn vị không cộng. Asset hoàn thành đếm duy nhất.
 */
import type { EmployeeKpiItem, EmployeeKpiPeriod, Goal } from "./types";
import type { KpiAdjustment } from "./service";
import { getKpiMetric } from "./metrics";
import { krAchieved } from "./calculateKr";
import { krsOfGoal } from "./evaluate";
import { buildEmployeeReport, type EvidenceRow, type ReportData, type ReportFilters, type WorkRow } from "./report";

export interface OverviewFilters { brandId?: string; websiteId?: string; socialId?: string; metricKey?: string; userId?: string; group?: string }
export interface Contribution { userId: string; userName: string; itemId: string; actual: number | null; target: number; contributionOnly: boolean }
export interface AssetRow { key: string; brandId: string | null; websiteId: string | null; socialId: string | null; actual: number; target: number | null; evidence: EvidenceRow[] }
export interface MetricRow {
  /** key gom nhóm: metricKey cho chỉ số cộng được; metricKey#itemId cho %/Top N/KR tùy chỉnh */
  key: string; metricKey: string; label: string; unit: string; category: string; direction: string;
  actual: number; target: number; pct: number | null;
  /** Đạt/không đạt theo hướng mục tiêu (at_most: thực tế ≤ chỉ tiêu) — null khi chưa đủ dữ liệu */
  achieved: boolean | null;
  /** assignment không có evidence đáng tin → không cộng vào actual */
  unverifiedAssignments: number;
  /** KPI toàn cục/ngoài phạm vi lọc: chỉ ghi đóng góp, KHÔNG nhân bản target xuống Brand/Asset */
  contributionActual: number; contributionItems: number;
  /** số asset/item nguồn duy nhất (1 video nhiều stage = 1) */
  uniqueAssets: number;
  contributions: Contribution[]; assets: AssetRow[]; unallocatedTarget: number; evidence: EvidenceRow[];
  /** Tổng cảnh báo (thiếu lịch sử, trùng tên...) của các item được tính */
  warnings: number;
  /** Item phạm vi hẹp nằm trong KPI rộng hơn của CÙNG người/metric/kỳ → coi là breakdown, không cộng thêm */
  overlapItems: number;
  /** ok = % chính thức; insufficient = Chưa đủ dữ liệu; reconciling = Đang đối soát (chồng phạm vi); na = không có target */
  status: "ok" | "insufficient" | "reconciling" | "na";
}
export interface GoalRow { goal: Goal; metrics: { key: string; direction: string; metricKey: string; label: string; unit: string; actual: number; target: number; unverified: number }[]; people: number; achieved: boolean | null }
export interface Overview { metrics: MetricRow[]; backlog: WorkRow[]; overdue: WorkRow[]; waitingReview: WorkRow[]; goals: GoalRow[]; unmet: MetricRow[];
  /** CHẨN ĐOÁN: số video duy nhất xuất hiện ở mọi công đoạn (không cộng stage thành nhiều video giao hàng) */
  videoTouched: number;
  /** Video thực sự bàn giao = evidence của chỉ tiêu video_published (duy nhất) */
  videoDelivered: number;
}

const pct = (a: number, t: number) => (t > 0 ? Math.round((a / t) * 1000) / 10 : null);
const assetKey = (r: { brandId: string | null; websiteId: string | null; socialId: string | null }) => `${r.brandId}|${r.websiteId}|${r.socialId}`;
/** KR khác nhau không gộp chỉ vì cùng loại chỉ số: % không cộng; Top N / KR tùy chỉnh mỗi KR một dòng. */
const NON_ADDITIVE = new Set(["seo_keyword_top", "custom_task_result"]);
export const aggKey = (it: { id: string; metricKey: string }, unit?: string) =>
  unit === "percent" || NON_ADDITIVE.has(it.metricKey) ? `${it.metricKey}#${it.id}` : it.metricKey;
const dedup = <T extends { sourceType: string; sourceId: string }>(rows: T[]) => [...new Map(rows.map((r) => [`${r.sourceType}:${r.sourceId}`, r])).values()];

export function buildOverview(args: {
  users: { id: string; fullName?: string; username?: string }[];
  goals: Goal[]; periods: EmployeeKpiPeriod[]; items: EmployeeKpiItem[]; adjustments: KpiAdjustment[];
  data: ReportData; filters: OverviewFilters; today: string;
}): Overview {
  const f = args.filters;
  const scope: ReportFilters = { brandId: f.brandId, websiteId: f.websiteId, socialId: f.socialId, group: (f.group || undefined) as ReportFilters["group"] };
  const periods = args.periods.filter((p) => !f.userId || p.userId === f.userId);
  const byMetric = new Map<string, MetricRow>();
  const work: WorkRow[] = [];
  const itemRes = new Map<string, { actual: number | null; target: number }>();

  const periodById = new Map(args.periods.map((p) => [p.id, p]));
  for (const u of args.users) {
    if (!periods.some((p) => p.userId === u.id)) continue;
    const r = buildEmployeeReport({ user: u, allUsers: args.users, periods, items: args.items, adjustments: args.adjustments, data: args.data, filters: scope, today: args.today });
    work.push(...r.backlog, ...r.waitingReview);
    const breakdownIds = findNestedItems(r.items.map((x) => x.item), periodById);
    for (const it of r.items) {
      // Item có scope khác bộ lọc brand/asset → không thuộc tổng quan này.
      if (f.brandId && it.item.brandId && it.item.brandId !== f.brandId) continue;
      if (f.websiteId && it.item.websiteId && it.item.websiteId !== f.websiteId) continue;
      if (f.socialId && it.item.socialId && it.item.socialId !== f.socialId) continue;
      if (f.metricKey && it.item.metricKey !== f.metricKey) continue;
      itemRes.set(it.item.id, { actual: it.actual, target: it.contributionOnly ? 0 : it.target });
      const key = aggKey(it.item, it.unit);
      const dir = getKpiMetric(it.item.metricKey)?.direction ?? "at_least";
      const m: MetricRow = byMetric.get(key) ?? { key, metricKey: it.item.metricKey, label: it.label, unit: it.unit, category: it.category, direction: dir, actual: 0, target: 0, pct: null, achieved: null,
        unverifiedAssignments: 0, contributionActual: 0, contributionItems: 0, uniqueAssets: 0, contributions: [], assets: [], unallocatedTarget: 0, evidence: [],
        warnings: 0, overlapItems: 0, status: "na" };
      m.contributions.push({ userId: u.id, userName: u.fullName || u.username || u.id, itemId: it.item.id, actual: it.actual, target: it.target, contributionOnly: it.contributionOnly });
      m.evidence.push(...it.evidence);
      if (!it.contributionOnly && breakdownIds.has(it.item.id)) {
        // Chồng phạm vi: target hẹp là breakdown của KPI rộng hơn → không cộng actual/target lần 2.
        m.overlapItems++;
        itemRes.delete(it.item.id);
      } else if (it.contributionOnly) {
        // KPI toàn cục/ngoài phạm vi: chỉ ghi nhận đóng góp, KHÔNG nhân bản target xuống Brand/Web/Page.
        m.contributionItems++;
        m.contributionActual += it.actual ?? 0;
      } else {
        m.target += it.target;
        m.warnings += it.warnings;
        if (it.actual === null) m.unverifiedAssignments++; else m.actual += it.actual;
        const scoped = it.item.websiteId || it.item.socialId;
        if (!scoped) m.unallocatedTarget += it.target;
        else {
          const k = assetKey(it.item);
          const a = m.assets.find((x) => x.key === k) ?? (m.assets.push({ key: k, brandId: it.item.brandId, websiteId: it.item.websiteId, socialId: it.item.socialId, actual: 0, target: 0, evidence: [] }), m.assets[m.assets.length - 1]);
          a.target = (a.target ?? 0) + it.target;
        }
      }
      byMetric.set(key, m);
    }
  }

  for (const m of byMetric.values()) {
    m.evidence = dedup(m.evidence);
    m.uniqueAssets = m.evidence.length;
    m.status = m.overlapItems > 0 ? "reconciling" : m.target <= 0 ? "na" : m.unverifiedAssignments > 0 || m.warnings > 0 ? "insufficient" : "ok";
    // Chỉ hiển thị % chính thức khi đủ dữ liệu & không chồng phạm vi; actual vẫn là "số đã xác minh (một phần)".
    m.achieved = m.status === "ok" ? krAchieved(m.actual, m.target, m.direction) : null;
    // "Không vượt quá": % không có nghĩa (3/1 = 300% không phải vượt chỉ tiêu) → chỉ hiện Đạt/Không đạt.
    m.pct = m.status === "ok" && m.direction !== "at_most" ? pct(m.actual, m.target) : null;
    for (const e of m.evidence) {
      if (!e.websiteId && !e.socialId) continue;
      const k = assetKey(e);
      let a = m.assets.find((x) => x.key === k);
      if (!a) { a = { key: k, brandId: e.brandId, websiteId: e.websiteId, socialId: e.socialId, actual: 0, target: null, evidence: [] }; m.assets.push(a); }
      a.evidence.push(e); a.actual++;
    }
  }

  const all = dedup(work);
  const metrics = [...byMetric.values()].sort((a, b) => a.category.localeCompare(b.category));

  const goals: GoalRow[] = args.goals
    .filter((g) => (!f.brandId || g.brandId === f.brandId))
    .map((g) => {
      // KR thuộc mục tiêu theo quan hệ trực tiếp (goalId trên KR); kỳ chỉ dùng cho dữ liệu cũ thiếu goalId.
      const goalItems = krsOfGoal(g.id, args.items, periods);
      const gp = periods.filter((p) => goalItems.some((i) => i.kpiPeriodId === p.id));
      const ms = new Map<string, GoalRow["metrics"][number]>();
      for (const it of goalItems) {
        const r = itemRes.get(it.id); if (!r) continue;
        const key = aggKey(it, getKpiMetric(it.metricKey)?.unit);
        const m = byMetric.get(key); if (!m) continue;
        const row = ms.get(key) ?? { key, direction: m.direction, metricKey: it.metricKey, label: m.label, unit: m.unit, actual: 0, target: 0, unverified: 0 };
        row.target += r.target; if (r.actual === null) row.unverified++; else row.actual += r.actual;
        ms.set(key, row);
      }
      const list = [...ms.values()];
      return { goal: g, metrics: list, people: new Set(gp.map((p) => p.userId)).size,
        achieved: !list.length || list.some((x) => x.unverified) ? null : list.every((x) => krAchieved(x.actual, x.target, x.direction) === true) };
    });

  // Video: mỗi video chỉ đếm 1 lần dù chạy qua nhiều công đoạn (chẩn đoán, không phải deliverable).
  const videoTouched = new Set(metrics.filter((m) => m.category === "video").flatMap((m) => m.evidence.filter((e) => e.sourceType === "video").map((e) => e.sourceId))).size;
  const videoDelivered = new Set((byMetric.get("video_published")?.evidence ?? []).map((e) => `${e.sourceType}:${e.sourceId}`)).size;

  return {
    metrics, goals, videoTouched, videoDelivered,
    backlog: all.filter((r) => !r.status.startsWith("Chờ duyệt") && r.status !== "Chờ xác nhận"),
    overdue: all.filter((r) => r.overdue),
    waitingReview: all.filter((r) => r.status.startsWith("Chờ duyệt") || r.status === "Chờ xác nhận"),
    unmet: metrics.filter((m) => m.status === "ok" && (m.achieved === false || m.unallocatedTarget > 0)),
  };
}

/** Phạm vi a chứa (rộng hơn hẳn) phạm vi b? global ⊃ brand ⊃ website/page. */
function scopeContains(a: EmployeeKpiItem, b: EmployeeKpiItem) {
  const lvl = (x: EmployeeKpiItem) => (x.websiteId || x.socialId ? 2 : x.brandId ? 1 : 0);
  if (lvl(a) >= lvl(b)) return false;
  if (lvl(a) === 0) return true;
  return a.brandId === b.brandId;
}
/** Item hẹp nằm trong item rộng hơn cùng metric + kỳ giao nhau (của cùng 1 người). */
export function findNestedItems(items: EmployeeKpiItem[], periods: Map<string, EmployeeKpiPeriod>): Set<string> {
  const out = new Set<string>();
  const overlapDates = (x: EmployeeKpiItem, y: EmployeeKpiItem) => {
    const p = periods.get(x.kpiPeriodId), q = periods.get(y.kpiPeriodId);
    return !p || !q || (p.periodStart <= q.periodEnd && q.periodStart <= p.periodEnd);
  };
  for (const b of items) for (const a of items)
    if (a.id !== b.id && a.metricKey === b.metricKey && overlapDates(a, b) && scopeContains(a, b)) out.add(b.id);
  return out;
}

/** Query params liên thông (được validate ở cả 2 route). */
export interface V2Search { from?: string; to?: string; brandId?: string; websiteId?: string; socialId?: string; metric?: string; userId?: string; group?: string }
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[\w-]{1,64}$/;
const GROUPS = ["web", "social", "video", "design", "task"];
export function validateV2Search(s: Record<string, unknown>): V2Search {
  const pick = (k: string, re: RegExp) => (typeof s[k] === "string" && re.test(s[k] as string) ? (s[k] as string) : undefined);
  const out: V2Search = { from: pick("from", DATE), to: pick("to", DATE), brandId: pick("brandId", ID), websiteId: pick("websiteId", ID), socialId: pick("socialId", ID), metric: pick("metric", ID), userId: pick("userId", ID),
    group: GROUPS.includes(String(s.group)) ? String(s.group) : undefined };
  if (out.websiteId && out.socialId) out.socialId = undefined;
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v)) as V2Search;
}
