/**
 * KPI V2 — DAY 4 repository/service. MOCK ONLY (localStorage), KHÔNG gọi Supabase.
 * Chưa có staging tách biệt → mọi create/update chỉ ghi vào trình duyệt hiện tại.
 * Đổi sang Supabase staging sau này bằng cách implement lại KpiRepository.
 */
import type { Goal, EmployeeKpiPeriod, EmployeeKpiItem, KpiPeriodStatus, KpiScope } from "./types";
import { getKpiMetric, isAssignable } from "./metrics";

export const KPI_V2_MODE = "cloud" as const;

export interface KpiAdjustment { id: string; itemId: string; field: "targetValue"; from: number; to: number; by: string; at: string; reason: string }
export interface KpiDb { goals: Goal[]; periods: EmployeeKpiPeriod[]; items: EmployeeKpiItem[]; adjustments: KpiAdjustment[] }

export interface KpiRepository { load(): KpiDb; save(db: KpiDb): void }

const KEY = "kpi_v2_mock_db";
const empty = (): KpiDb => ({ goals: [], periods: [], items: [], adjustments: [] });

export const mockRepository: KpiRepository = {
  load() {
    if (typeof window === "undefined") return empty();
    try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return empty(); }
  },
  save(db) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(db)); },
};

export function memoryRepository(seed: KpiDb = empty()): KpiRepository {
  let db = structuredClone(seed);
  return { load: () => structuredClone(db), save: (d) => { db = structuredClone(d); } };
}

const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
const now = () => new Date().toISOString();

export class KpiError extends Error {}

/** Quyền: chỉ Admin quản lý; nhân viên chỉ xem KPI của mình. (Ở DB: RLS tương ứng.) */
export interface KpiActor { id: string; isAdmin: boolean }

export function scopeOf(i: { brandId?: string | null; websiteId?: string | null; socialId?: string | null }): KpiScope {
  if (i.websiteId) return "website";
  if (i.socialId) return "social";
  if (i.brandId) return "brand";
  return "global";
}
const scopeKey = (i: { brandId?: string | null; websiteId?: string | null; socialId?: string | null; label?: string | null; metadata?: Record<string, unknown> }) =>
  `${i.brandId ?? ""}|${i.websiteId ?? ""}|${i.socialId ?? ""}|${i.label ?? ""}|${JSON.stringify((i.metadata as { keywordIds?: unknown })?.keywordIds ?? "")}`;

export type NewItem = { metricKey: string; targetValue: number; brandId?: string | null; websiteId?: string | null; socialId?: string | null; label?: string | null; metadata?: Record<string, unknown> };

export function createKpiService(repo: KpiRepository) {
  const requireAdmin = (a: KpiActor) => { if (!a.isAdmin) throw new KpiError("Chỉ Admin được quản lý KPI."); };
  const mutate = <T>(fn: (db: KpiDb) => T): T => { const db = repo.load(); const r = fn(db); repo.save(db); return r; };

  function validateItem(it: NewItem) {
    const m = getKpiMetric(it.metricKey);
    if (!m) throw new KpiError(`Metric không tồn tại: ${it.metricKey}`);
    if (!Number.isFinite(it.targetValue) || it.targetValue <= 0) throw new KpiError(`Target của "${m.label}" phải > 0.`);
    if (it.websiteId && it.socialId) throw new KpiError("Không gắn đồng thời Website và Social.");
    if ((it.websiteId || it.socialId) && !it.brandId) throw new KpiError("Website/Social phải thuộc một thương hiệu.");
    const sc = scopeOf(it);
    if (!m.scopes.includes(sc)) throw new KpiError(`"${m.label}" không hỗ trợ phạm vi ${sc}.`);
    if (!m.notReady && !isAssignable(m)) throw new KpiError(`"${m.label}" chưa có nguồn dữ liệu tự động — chưa thể giao.`);
    const md = (it.metadata ?? {}) as { keywordIds?: string[]; taskIds?: string[] };
    if (m.needs === "keyword" && !md.keywordIds?.length) throw new KpiError("KR thứ hạng cần chọn ít nhất một từ khóa.");
    if (m.needs === "tasks" && !md.taskIds?.length) throw new KpiError("KR tùy chỉnh cần liên kết ít nhất một Task.");
    if (m.needs === "tasks" && !it.label?.trim()) throw new KpiError("KR tùy chỉnh cần tên kết quả.");
    return m;
  }

  return {
    list: () => repo.load(),
    listForActor(a: KpiActor) {
      const db = repo.load();
      if (a.isAdmin) return db;
      const periods = db.periods.filter((p) => p.userId === a.id);
      const ids = new Set(periods.map((p) => p.id));
      return { ...db, periods, items: db.items.filter((i) => ids.has(i.kpiPeriodId)), adjustments: [] };
    },

    saveGoal(a: KpiActor, g: Partial<Goal> & { title: string; periodStart: string; periodEnd: string }) {
      requireAdmin(a);
      if (!g.title.trim()) throw new KpiError("Thiếu tiêu đề mục tiêu.");
      if (g.periodEnd < g.periodStart) throw new KpiError("Kỳ không hợp lệ.");
      return mutate((db) => {
        const existing = g.id ? db.goals.find((x) => x.id === g.id) : undefined;
        const rec: Goal = {
          id: existing?.id ?? uid(), title: g.title.trim(), description: g.description ?? null,
          periodStart: g.periodStart, periodEnd: g.periodEnd, status: g.status ?? "draft",
          brandId: g.brandId ?? null, websiteId: g.websiteId ?? null, socialId: g.socialId ?? null,
          metadata: { ...(existing?.metadata ?? {}), ...(g.metadata ?? {}) },
          createdBy: existing?.createdBy ?? a.id, createdAt: existing?.createdAt ?? now(), updatedAt: now(),
        };
        db.goals = existing ? db.goals.map((x) => (x.id === rec.id ? rec : x)) : [...db.goals, rec];
        return rec;
      });
    },

    /** Giao KPI: 1 kỳ cho user + nhiều metric. Chống trùng user+kỳ+metric+scope. */
    assign(a: KpiActor, input: { userId: string; periodType: EmployeeKpiPeriod["periodType"]; periodStart: string; periodEnd: string; goalId?: string | null; items: NewItem[] }) {
      requireAdmin(a);
      if (!input.userId) throw new KpiError("Chưa chọn nhân sự.");
      if (input.periodEnd < input.periodStart) throw new KpiError("Kỳ không hợp lệ.");
      if (!input.items.length) throw new KpiError("Chưa có chỉ tiêu nào.");
      input.items.forEach(validateItem);
      for (const it of input.items) { const nr = getKpiMetric(it.metricKey)?.notReady; if (nr) throw new KpiError(nr); }
      return mutate((db) => {
        let period = db.periods.find((p) => p.userId === input.userId && p.periodStart === input.periodStart && p.periodEnd === input.periodEnd);
        if (period && (period.status === "locked" || period.status === "closed")) throw new KpiError("Kỳ đã khóa — không thêm chỉ tiêu.");
        const seen = new Set(period ? db.items.filter((i) => i.kpiPeriodId === period!.id).map((i) => `${i.metricKey}#${scopeKey(i)}`) : []);
        for (const it of input.items) {
          const k = `${it.metricKey}#${scopeKey(it)}`;
          if (seen.has(k)) throw new KpiError(`KPI trùng: "${getKpiMetric(it.metricKey)!.label}" cùng phạm vi đã có trong kỳ.`);
          seen.add(k);
        }
        if (!period) {
          period = { id: uid(), userId: input.userId, periodType: input.periodType, periodStart: input.periodStart, periodEnd: input.periodEnd,
            goalId: input.goalId ?? null, status: "draft", createdBy: a.id, createdAt: now(), updatedAt: now() };
          db.periods.push(period);
        }
        const pid = period.id;
        const created = input.items.map((it): EmployeeKpiItem => ({
          id: uid(), kpiPeriodId: pid, metricKey: it.metricKey, label: it.label ?? null, targetValue: it.targetValue,
          unit: getKpiMetric(it.metricKey)!.unit, targetOperator: ">=", brandId: it.brandId ?? null, websiteId: it.websiteId ?? null,
          socialId: it.socialId ?? null, metadata: { ...(it.metadata ?? {}), ...(input.goalId ? { goalId: input.goalId } : {}) }, createdAt: now(), updatedAt: now(),
        }));
        db.items.push(...created);
        return { period, items: created };
      });
    },

    /** Đổi target: chỉ Admin; kỳ locked/closed → chặn. Mọi thay đổi ghi audit. Actual không đổi (tính từ engine). */
    updateTarget(a: KpiActor, itemId: string, to: number, reason = "") {
      requireAdmin(a);
      if (!Number.isFinite(to) || to <= 0) throw new KpiError("Target phải > 0.");
      return mutate((db) => {
        const it = db.items.find((i) => i.id === itemId);
        if (!it) throw new KpiError("Không tìm thấy chỉ tiêu.");
        const p = db.periods.find((x) => x.id === it.kpiPeriodId)!;
        if (p.status === "locked" || p.status === "closed") throw new KpiError("Kỳ đã khóa — không sửa target.");
        db.adjustments.push({ id: uid(), itemId, field: "targetValue", from: it.targetValue, to, by: a.id, at: now(), reason });
        it.targetValue = to; it.updatedAt = now();
        return it;
      });
    },

    removeItem(a: KpiActor, itemId: string) {
      requireAdmin(a);
      mutate((db) => {
        const it = db.items.find((i) => i.id === itemId);
        const p = it && db.periods.find((x) => x.id === it.kpiPeriodId);
        if (p && (p.status === "locked" || p.status === "closed")) throw new KpiError("Kỳ đã khóa — không xóa chỉ tiêu.");
        db.items = db.items.filter((i) => i.id !== itemId);
      });
    },

    /** draft → active → locked → closed (một chiều). Khi khóa: snapshot target vào metadata. */
    setStatus(a: KpiActor, periodId: string, status: KpiPeriodStatus) {
      requireAdmin(a);
      const order: KpiPeriodStatus[] = ["draft", "active", "locked", "closed"];
      return mutate((db) => {
        const p = db.periods.find((x) => x.id === periodId);
        if (!p) throw new KpiError("Không tìm thấy kỳ.");
        if (order.indexOf(status) < order.indexOf(p.status)) throw new KpiError("Không mở lại kỳ đã khóa — lịch sử không được viết lại.");
        if (status === "locked") {
          for (const it of db.items.filter((i) => i.kpiPeriodId === p.id)) it.metadata = { ...it.metadata, lockedTarget: it.targetValue, lockedAt: now() };
        }
        p.status = status; p.updatedAt = now();
        return p;
      });
    },
  };
}

/** Template gợi ý theo role — chỉ gợi ý, không tự giao. */
export const ROLE_KPI_TEMPLATES: Record<string, NewItem[]> = {
  "Content Web": [
    { metricKey: "web_content_completed", targetValue: 20 },
    { metricKey: "social_post_completed", targetValue: 10 },
    { metricKey: "video_script_completed", targetValue: 5 },
  ],
  "Content Social": [{ metricKey: "social_post_completed", targetValue: 30 }],
  "Designer": [{ metricKey: "design_order_completed", targetValue: 40 }],
  "Video": [{ metricKey: "video_edit_completed", targetValue: 12 }, { metricKey: "video_published", targetValue: 12 }],
};

/** Feature flag: BẬT mặc định. Tắt nhanh toàn bộ KPI V2 bằng VITE_KPI_V2=0. */
export function isKpiV2Enabled(): boolean {
  return import.meta.env.VITE_KPI_V2 !== "0";
}
