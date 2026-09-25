/**
 * KPI V2 — repository lưu trên Lovable Cloud (dùng chung mọi tài khoản).
 * Service vẫn đồng bộ (sync) nên repository giữ một bản cache trong bộ nhớ:
 * hydrate() tải dữ liệu (RLS: Admin thấy tất cả, nhân viên chỉ thấy của mình),
 * save() tính phần thay đổi và ghi lên cơ sở dữ liệu. RLS + trigger ở DB mới là lớp bảo vệ thật.
 */
import { supabase } from "@/integrations/supabase/client";
import type { KpiDb, KpiRepository, KpiAdjustment } from "./service";
import type { Goal, EmployeeKpiPeriod, EmployeeKpiItem } from "./types";
import { KPI_ENGINE_VERSION } from "./lockSnapshot";
import { getKpiMetric } from "./metrics";

const empty = (): KpiDb => ({ goals: [], periods: [], items: [], adjustments: [] });
let cache: KpiDb = empty();
let queue: Promise<void> = Promise.resolve();
const listeners = new Set<(err?: string) => void>();
export const onCloudSync = (fn: (err?: string) => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;
const goalRow = (g: Goal) => ({ id: g.id, title: g.title, description: g.description, period_start: g.periodStart, period_end: g.periodEnd, status: g.status,
  brand_id: g.brandId, website_id: g.websiteId, social_id: g.socialId, metadata: g.metadata, created_by: g.createdBy });
const periodRow = (p: EmployeeKpiPeriod) => ({ id: p.id, user_id: p.userId, period_type: p.periodType, period_start: p.periodStart, period_end: p.periodEnd,
  goal_id: p.goalId, status: p.status, created_by: p.createdBy });
const itemRow = (i: EmployeeKpiItem) => ({ id: i.id, kpi_period_id: i.kpiPeriodId, metric_key: i.metricKey, label: i.label, target_value: i.targetValue,
  unit: i.unit, target_operator: i.targetOperator, brand_id: i.brandId, website_id: i.websiteId, social_id: i.socialId, metadata: i.metadata });

export async function hydrateKpi(): Promise<KpiDb> {
  const [g, p, i, a] = await Promise.all([
    db.from("goals").select("*"), db.from("employee_kpi_periods").select("*"),
    db.from("employee_kpi_items").select("*"), db.from("employee_kpi_adjustments").select("*"),
  ]);
  const err = g.error || p.error || i.error;
  if (err) throw new Error(err.message);
  cache = {
    goals: (g.data ?? []).map((r: any): Goal => ({ id: r.id, title: r.title, description: r.description, periodStart: r.period_start, periodEnd: r.period_end,
      status: r.status, brandId: r.brand_id, websiteId: r.website_id, socialId: r.social_id, metadata: r.metadata ?? {}, createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at })),
    periods: (p.data ?? []).map((r: any): EmployeeKpiPeriod => ({ id: r.id, userId: r.user_id, periodType: r.period_type, periodStart: r.period_start, periodEnd: r.period_end,
      goalId: r.goal_id, status: r.status, createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at })),
    items: (i.data ?? []).map((r: any): EmployeeKpiItem => ({ id: r.id, kpiPeriodId: r.kpi_period_id, metricKey: r.metric_key, label: r.label, targetValue: Number(r.target_value),
      unit: r.unit, targetOperator: r.target_operator, brandId: r.brand_id, websiteId: r.website_id, socialId: r.social_id, metadata: r.metadata ?? {}, createdAt: r.created_at, updatedAt: r.updated_at })),
    adjustments: (a.data ?? []).map((r: any): KpiAdjustment => ({ id: r.id, itemId: r.item_id, field: "targetValue", from: Number(r.from_value), to: Number(r.to_value), by: r.created_by, at: r.created_at, reason: r.reason })),
  };
  return structuredClone(cache);
}

const changed = <T extends { id: string }>(prev: T[], next: T[]) => {
  const m = new Map(prev.map((x) => [x.id, JSON.stringify(x)]));
  return next.filter((x) => m.get(x.id) !== JSON.stringify(x));
};
const removed = <T extends { id: string }>(prev: T[], next: T[]) => { const s = new Set(next.map((x) => x.id)); return prev.filter((x) => !s.has(x.id)).map((x) => x.id); };
const ok = (r: { error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); };

async function push(prev: KpiDb, next: KpiDb) {
  const { data: u } = await supabase.auth.getUser();
  const me = u.user?.id ?? null;
  const g = changed(prev.goals, next.goals); if (g.length) ok(await db.from("goals").upsert(g.map(goalRow)));
  const prevP = new Map(prev.periods.map((p) => [p.id, p]));
  const newP = next.periods.filter((p) => !prevP.has(p.id));
  if (newP.length) ok(await db.from("employee_kpi_periods").insert(newP.map(periodRow)));
  const delI = removed(prev.items, next.items); if (delI.length) ok(await db.from("employee_kpi_items").delete().in("id", delI));
  const it = changed(prev.items, next.items); if (it.length) ok(await db.from("employee_kpi_items").upsert(it.map(itemRow)));
  const adj = changed(prev.adjustments, next.adjustments);
  if (adj.length) ok(await db.from("employee_kpi_adjustments").insert(adj.map((x) => ({ id: x.id, item_id: x.itemId, field: x.field, from_value: x.from, to_value: x.to, reason: x.reason, created_by: me }))));
  for (const p of changed(prev.periods, next.periods).filter((p) => prevP.has(p.id))) {
    ok(await db.from("employee_kpi_periods").update(periodRow(p)).eq("id", p.id));
    if (p.status === "locked" && prevP.get(p.id)!.status !== "locked") {
      const items = next.items.filter((i) => i.kpiPeriodId === p.id).map((i) => ({ itemId: i.id, metricKey: i.metricKey, unit: i.unit, target: i.targetValue,
        brandId: i.brandId, websiteId: i.websiteId, socialId: i.socialId,
        direction: getKpiMetric(i.metricKey)?.direction ?? "at_least", deadline: (i.metadata as { deadline?: string }).deadline ?? p.periodEnd,
        actual: (i.metadata as { lockedActual?: number | null }).lockedActual ?? null, achieved: (i.metadata as { lockedAchieved?: boolean | null }).lockedAchieved ?? null,
        evidence: (i.metadata as { lockedEvidence?: unknown[] }).lockedEvidence ?? [] }));
      ok(await db.from("employee_kpi_snapshots").insert({ kpi_period_id: p.id, engine_version: KPI_ENGINE_VERSION, data: { items }, locked_by: me }));
    }
  }
  const delP = removed(prev.periods, next.periods); if (delP.length) ok(await db.from("employee_kpi_periods").delete().in("id", delP));
  const delG = removed(prev.goals, next.goals); if (delG.length) ok(await db.from("goals").delete().in("id", delG));
}

let lastSave: Promise<void> = Promise.resolve();
/** Chờ lần ghi gần nhất được cơ sở dữ liệu xác nhận; ném lỗi nếu ghi thất bại. */
export const flushKpi = () => lastSave;

export const cloudRepository: KpiRepository = {
  load: () => structuredClone(cache),
  save(next) {
    const prev = cache; cache = structuredClone(next);
    const p = queue.then(() => push(prev, next));
    lastSave = p;
    queue = p.then(
      () => listeners.forEach((f) => f()),
      async (e: Error) => { await hydrateKpi().catch(() => {}); listeners.forEach((f) => f(`Không lưu được: ${e.message}`)); },
    );
  },
};
