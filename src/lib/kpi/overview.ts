/**
 * KPI V2 — DAY 6: Tổng quan theo BRAND / ASSET (PURE, chỉ đọc).
 * Aggregation: cùng metric (+đơn vị) trong kỳ ⇒ SUM(actual)/SUM(target) trên các assignment,
 * KHÔNG trung bình % cá nhân. Khác metric/đơn vị không cộng. Asset hoàn thành đếm duy nhất.
 */
import type { EmployeeKpiItem, EmployeeKpiPeriod, Goal } from "./types";
import type { KpiAdjustment } from "./service";
import { buildEmployeeReport, type EvidenceRow, type ReportData, type WorkRow } from "./report";

export interface OverviewFilters { brandId?: string; websiteId?: string; socialId?: string; metricKey?: string; userId?: string }
export interface Contribution { userId: string; userName: string; itemId: string; actual: number | null; target: number }
export interface AssetRow { key: string; brandId: string | null; websiteId: string | null; socialId: string | null; actual: number; target: number | null; evidence: EvidenceRow[] }
export interface MetricRow {
  metricKey: string; label: string; unit: string; category: string;
  actual: number; target: number; pct: number | null;
  /** assignment không có evidence đáng tin → không cộng vào actual */
  unverifiedAssignments: number;
  /** số asset/item nguồn duy nhất (1 video nhiều stage = 1) */
  uniqueAssets: number;
  contributions: Contribution[]; assets: AssetRow[]; unallocatedTarget: number; evidence: EvidenceRow[];
}
export interface GoalRow { goal: Goal; metrics: { metricKey: string; label: string; unit: string; actual: number; target: number; unverified: number }[]; people: number; achieved: boolean | null }
export interface Overview { metrics: MetricRow[]; backlog: WorkRow[]; overdue: WorkRow[]; waitingReview: WorkRow[]; goals: GoalRow[]; unmet: MetricRow[] }

const pct = (a: number, t: number) => (t > 0 ? Math.round((a / t) * 1000) / 10 : null);
const assetKey = (r: { brandId: string | null; websiteId: string | null; socialId: string | null }) => `${r.brandId}|${r.websiteId}|${r.socialId}`;
const dedup = <T extends { sourceType: string; sourceId: string }>(rows: T[]) => [...new Map(rows.map((r) => [`${r.sourceType}:${r.sourceId}`, r])).values()];

export function buildOverview(args: {
  users: { id: string; fullName?: string; username?: string }[];
  goals: Goal[]; periods: EmployeeKpiPeriod[]; items: EmployeeKpiItem[]; adjustments: KpiAdjustment[];
  data: ReportData; filters: OverviewFilters; today: string;
}): Overview {
  const f = args.filters;
  const scope = { brandId: f.brandId, websiteId: f.websiteId, socialId: f.socialId };
  const periods = args.periods.filter((p) => !f.userId || p.userId === f.userId);
  const byMetric = new Map<string, MetricRow>();
  const work: WorkRow[] = [];
  const itemRes = new Map<string, { actual: number | null; target: number }>();

  for (const u of args.users) {
    if (!periods.some((p) => p.userId === u.id)) continue;
    const r = buildEmployeeReport({ user: u, allUsers: args.users, periods, items: args.items, adjustments: args.adjustments, data: args.data, filters: scope, today: args.today });
    work.push(...r.backlog, ...r.waitingReview);
    for (const it of r.items) {
      // Item có scope khác bộ lọc brand/asset → không thuộc tổng quan này.
      if (f.brandId && it.item.brandId && it.item.brandId !== f.brandId) continue;
      if (f.websiteId && it.item.websiteId && it.item.websiteId !== f.websiteId) continue;
      if (f.socialId && it.item.socialId && it.item.socialId !== f.socialId) continue;
      if (f.metricKey && it.item.metricKey !== f.metricKey) continue;
      itemRes.set(it.item.id, { actual: it.actual, target: it.target });
      const m = byMetric.get(it.item.metricKey) ?? { metricKey: it.item.metricKey, label: it.label, unit: it.unit, category: it.category, actual: 0, target: 0, pct: null,
        unverifiedAssignments: 0, uniqueAssets: 0, contributions: [], assets: [], unallocatedTarget: 0, evidence: [] };
      m.target += it.target;
      if (it.actual === null) m.unverifiedAssignments++; else m.actual += it.actual;
      m.contributions.push({ userId: u.id, userName: u.fullName || u.username || u.id, itemId: it.item.id, actual: it.actual, target: it.target });
      m.evidence.push(...it.evidence);
      const scoped = it.item.websiteId || it.item.socialId;
      if (!scoped) m.unallocatedTarget += it.target;
      else {
        const k = assetKey(it.item);
        const a = m.assets.find((x) => x.key === k) ?? (m.assets.push({ key: k, brandId: it.item.brandId, websiteId: it.item.websiteId, socialId: it.item.socialId, actual: 0, target: 0, evidence: [] }), m.assets[m.assets.length - 1]);
        a.target = (a.target ?? 0) + it.target;
      }
      byMetric.set(it.item.metricKey, m);
    }
  }

  for (const m of byMetric.values()) {
    m.evidence = dedup(m.evidence);
    m.uniqueAssets = m.evidence.length;
    m.pct = pct(m.actual, m.target);
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
      const gp = periods.filter((p) => p.goalId === g.id);
      const ms = new Map<string, GoalRow["metrics"][number]>();
      for (const p of gp) for (const it of args.items.filter((i) => i.kpiPeriodId === p.id)) {
        const r = itemRes.get(it.id); if (!r) continue;
        const m = byMetric.get(it.metricKey)!;
        const row = ms.get(it.metricKey) ?? { metricKey: it.metricKey, label: m.label, unit: m.unit, actual: 0, target: 0, unverified: 0 };
        row.target += r.target; if (r.actual === null) row.unverified++; else row.actual += r.actual;
        ms.set(it.metricKey, row);
      }
      const list = [...ms.values()];
      return { goal: g, metrics: list, people: new Set(gp.map((p) => p.userId)).size,
        achieved: !list.length || list.some((x) => x.unverified) ? null : list.every((x) => x.actual >= x.target) };
    });

  return {
    metrics, goals,
    backlog: all.filter((r) => !r.status.startsWith("Chờ duyệt") && r.status !== "Chờ xác nhận"),
    overdue: all.filter((r) => r.overdue),
    waitingReview: all.filter((r) => r.status.startsWith("Chờ duyệt") || r.status === "Chờ xác nhận"),
    unmet: metrics.filter((m) => m.actual < m.target || m.unallocatedTarget > 0),
  };
}

/** Query params liên thông (được validate ở cả 2 route). */
export interface V2Search { from?: string; to?: string; brandId?: string; websiteId?: string; socialId?: string; metric?: string; userId?: string }
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[\w-]{1,64}$/;
export function validateV2Search(s: Record<string, unknown>): V2Search {
  const pick = (k: string, re: RegExp) => (typeof s[k] === "string" && re.test(s[k] as string) ? (s[k] as string) : undefined);
  const out: V2Search = { from: pick("from", DATE), to: pick("to", DATE), brandId: pick("brandId", ID), websiteId: pick("websiteId", ID), socialId: pick("socialId", ID), metric: pick("metric", ID), userId: pick("userId", ID) };
  if (out.websiteId && out.socialId) out.socialId = undefined;
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v)) as V2Search;
}
