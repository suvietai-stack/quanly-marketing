/**
 * KPI V2 — DAY 4 repository/service. MOCK ONLY (localStorage), KHÔNG gọi Supabase.
 * Chưa có staging tách biệt → mọi create/update chỉ ghi vào trình duyệt hiện tại.
 * Đổi sang Supabase staging sau này bằng cách implement lại KpiRepository.
 */
import type { Goal, GoalKr, GoalKrStatus, EmployeeKpiPeriod, EmployeeKpiItem, KpiPeriodStatus, KpiScope } from "./types";
import { getKpiMetric, isAssignable } from "./metrics";
import { monthsIn } from "./calculateKr";
import { goalLocked, checkGoalTransition, goalDeleteBlockers } from "./goalPolicy";

/** Chỉ số lấy từ báo cáo tăng trưởng nhập theo Tháng. */
export const MONTHLY_SOURCE = new Set(["seo_organic_clicks", "social_views", "mkt_leads"]);

export const KPI_V2_MODE = "cloud" as const;

export interface KpiAdjustment { id: string; itemId: string; field: "targetValue"; from: number; to: number; by: string; at: string; reason: string }
export interface KpiDb { goals: Goal[]; periods: EmployeeKpiPeriod[]; items: EmployeeKpiItem[]; adjustments: KpiAdjustment[]; krs?: GoalKr[] }

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
import { kpiCan, type KpiActor, type KpiPermKey } from "./perms";
export type { KpiActor } from "./perms";

export function scopeOf(i: { brandId?: string | null; websiteId?: string | null; socialId?: string | null }): KpiScope {
  if (i.websiteId) return "website";
  if (i.socialId) return "social";
  if (i.brandId) return "brand";
  return "global";
}
const scopeKey = (i: { krId?: string | null; brandId?: string | null; websiteId?: string | null; socialId?: string | null; label?: string | null; metadata?: Record<string, unknown> }) =>
  `${i.krId ?? ""}|${i.brandId ?? ""}|${i.websiteId ?? ""}|${i.socialId ?? ""}|${i.label ?? ""}|${JSON.stringify((i.metadata as { keywordIds?: unknown })?.keywordIds ?? "")}`;

export type NewItem = { krId?: string | null; metricKey: string; targetValue: number; brandId?: string | null; websiteId?: string | null; socialId?: string | null; label?: string | null; metadata?: Record<string, unknown> };

export function createKpiService(repo: KpiRepository) {
  const MSG: Partial<Record<KpiPermKey, string>> = {
    "kpi.goal_create": "Bạn không có quyền Tạo mục tiêu.", "kpi.goal_edit": "Bạn không có quyền Sửa mục tiêu.",
    "kpi.goal_archive": "Bạn không có quyền Hủy / Lưu trữ mục tiêu.", "kpi.goal_delete": "Bạn không có quyền Xóa mục tiêu.",
    "kpi.kr_assign": "Bạn không có quyền Thêm / Giao KR.", "kpi.kr_adjust": "Bạn không có quyền Điều chỉnh KR đã giao.",
    "kpi.period_manage": "Bạn không có quyền Quản lý kỳ KPI.",
  };
  const need = (a: KpiActor, k: KpiPermKey) => { if (!kpiCan(a, k)) throw new KpiError(MSG[k] ?? "Bạn không có quyền thao tác KPI."); };
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
    if (m.needs === "keyword" && md.keywordIds?.length && it.targetValue > md.keywordIds.length) throw new KpiError(`Chỉ tiêu (${it.targetValue}) vượt quá số từ khóa đã chọn (${md.keywordIds.length}).`);
    const dl = (it.metadata as { deadline?: string })?.deadline;
    if (dl !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(dl))) throw new KpiError("Deadline KR không hợp lệ.");
    if (m.needs === "tasks" && !md.taskIds?.length) throw new KpiError("KR tùy chỉnh cần liên kết ít nhất một Task.");
    if (m.needs === "tasks" && !it.label?.trim()) throw new KpiError("KR tùy chỉnh cần tên kết quả.");
    if (m.needs === "label" && !it.label?.trim()) throw new KpiError("KR tùy chỉnh cần tên kết quả.");
    if (m.needs === "website" && !it.websiteId) throw new KpiError(`"${m.label}" cần chọn Website.`);
    if ((m.needs === "social" || m.needs === "views") && !it.socialId) throw new KpiError(`"${m.label}" cần chọn tài khoản Social.`);
    if (m.needs === "views" && !((it.metadata as { viewThreshold?: number })?.viewThreshold! > 0)) throw new KpiError("Cần đặt ngưỡng lượt xem mỗi video.");
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
      if (!g.id) need(a, "kpi.goal_create");
      if (!g.title.trim()) throw new KpiError("Thiếu tiêu đề mục tiêu.");
      if (g.periodEnd < g.periodStart) throw new KpiError("Kỳ không hợp lệ.");
      return mutate((db) => {
        const existing = g.id ? db.goals.find((x) => x.id === g.id) : undefined;
        if (existing) {
          const locked = goalLocked(existing.id, db);
          const err = checkGoalTransition(existing.status, g.status ?? existing.status, locked);
          if (err) throw new KpiError(err);
          const onlyArchive = g.title.trim() === existing.title && g.periodStart === existing.periodStart && g.periodEnd === existing.periodEnd && (g.status ?? existing.status) === existing.status;
          const editable = (existing.status === "draft" || existing.status === "active") && !locked;
          if (!editable && !onlyArchive && (g.status ?? existing.status) === existing.status) throw new KpiError("Mục tiêu đang ở chế độ chỉ xem — không sửa được.");
          const statusChange = (g.status ?? existing.status) !== existing.status;
          const archToggle = !!(g.metadata && "archived" in g.metadata) && (g.metadata as { archived?: unknown }).archived !== (existing.metadata as { archived?: unknown })?.archived;
          const toCancelOrRestore = statusChange && (g.status === "cancelled" || existing.status === "cancelled");
          if ((onlyArchive && archToggle) || toCancelOrRestore) need(a, "kpi.goal_archive");
          else need(a, "kpi.goal_edit");
        }
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
      need(a, "kpi.kr_assign");
      if (!input.userId) throw new KpiError("Chưa chọn nhân sự.");
      if (input.periodEnd < input.periodStart) throw new KpiError("Kỳ không hợp lệ.");
      if (!input.items.length) throw new KpiError("Chưa có chỉ tiêu nào.");
      input.items.forEach(validateItem);
      for (const it of input.items) {
        const dl = (it.metadata as { deadline?: string })?.deadline;
        if (dl && (dl < input.periodStart || dl > input.periodEnd)) throw new KpiError(`Deadline của "${getKpiMetric(it.metricKey)!.label}" phải nằm trong kỳ ${input.periodStart} → ${input.periodEnd}.`);
        if (MONTHLY_SOURCE.has(it.metricKey) && !monthsIn(input.periodStart, input.periodEnd))
          throw new KpiError(`"${getKpiMetric(it.metricKey)!.label}" lấy số liệu theo tháng — hãy chọn kỳ Tháng hoặc Quý (không tự chia ra tuần/ngày).`);
      }
      for (const it of input.items) { const nr = getKpiMetric(it.metricKey)?.notReady; if (nr) throw new KpiError(nr); }
      return mutate((db) => {
        if (input.goalId) {
          const g = db.goals.find((x) => x.id === input.goalId);
          if (g && (!(g.status === "draft" || g.status === "active") || goalLocked(g.id, db))) throw new KpiError("Mục tiêu đã hủy/hoàn thành/khóa kỳ — không phân bổ thêm.");
        }
        let period = db.periods.find((p) => p.userId === input.userId && p.periodStart === input.periodStart && p.periodEnd === input.periodEnd);
        if (period && (period.status === "locked" || period.status === "closed")) throw new KpiError("Kỳ đã khóa — không thêm chỉ tiêu.");
        // Chống tạo trùng khi bấm thử lại: KR đã lưu với cùng clientKey được bỏ qua.
        const keyOf = (x: { metadata?: Record<string, unknown> | null }) => (x.metadata as { clientKey?: string } | null)?.clientKey;
        const saved = new Set(db.items.map(keyOf).filter(Boolean));
        input = { ...input, items: input.items.filter((it) => !keyOf(it) || !saved.has(keyOf(it))) };
        if (!input.items.length) return { period: period ?? null, items: [] as EmployeeKpiItem[] };
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
          id: uid(), kpiPeriodId: pid, krId: it.krId ?? null, metricKey: it.metricKey, label: it.label ?? null, targetValue: it.targetValue,
          unit: getKpiMetric(it.metricKey)!.unit, targetOperator: ">=", brandId: it.brandId ?? null, websiteId: it.websiteId ?? null,
          socialId: it.socialId ?? null, metadata: { ...(it.metadata ?? {}), goalId: input.goalId ?? null }, createdAt: now(), updatedAt: now(),
        }));
        db.items.push(...created);
        return { period, items: created };
      });
    },

    /** Đổi target: chỉ Admin; kỳ locked/closed → chặn. Mọi thay đổi ghi audit. Actual không đổi (tính từ engine). */
    updateTarget(a: KpiActor, itemId: string, to: number, reason = "") {
      need(a, "kpi.kr_adjust");
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

    /** Cập nhật metadata KR (ghi nhận/xác nhận kết quả thủ công). Chỉ Admin; kỳ khóa → chặn. */
    updateItemMetadata(a: KpiActor, itemId: string, patch: Record<string, unknown>) {
      need(a, "kpi.kr_adjust");
      return mutate((db) => {
        const it = db.items.find((i) => i.id === itemId);
        if (!it) throw new KpiError("Không tìm thấy KR.");
        const p = db.periods.find((x) => x.id === it.kpiPeriodId)!;
        if (p.status === "locked" || p.status === "closed") throw new KpiError("Kỳ đã khóa — không cập nhật kết quả.");
        it.metadata = { ...(it.metadata ?? {}), ...patch }; it.updatedAt = now();
        return it;
      });
    },

    removeItem(a: KpiActor, itemId: string) {
      need(a, "kpi.kr_adjust");
      mutate((db) => {
        const it = db.items.find((i) => i.id === itemId);
        const p = it && db.periods.find((x) => x.id === it.kpiPeriodId);
        if (p && (p.status === "locked" || p.status === "closed")) throw new KpiError("Kỳ đã khóa — không xóa chỉ tiêu.");
        db.items = db.items.filter((i) => i.id !== itemId);
      });
    },

    /** draft → active → locked → closed (một chiều). Khi khóa: snapshot target vào metadata. */
    setStatus(a: KpiActor, periodId: string, status: KpiPeriodStatus, results?: Record<string, { actual: number | null; achieved: boolean | null; evidence: { type: string; id: string; at: string }[] }>) {
      need(a, "kpi.period_manage");
      const order: KpiPeriodStatus[] = ["draft", "active", "locked", "closed"];
      return mutate((db) => {
        const p = db.periods.find((x) => x.id === periodId);
        if (!p) throw new KpiError("Không tìm thấy kỳ.");
        if (order.indexOf(status) < order.indexOf(p.status)) throw new KpiError("Không mở lại kỳ đã khóa — lịch sử không được viết lại.");
        if (status === "locked") {
          for (const it of db.items.filter((i) => i.kpiPeriodId === p.id)) {
            const r = results?.[it.id];
            it.metadata = { ...it.metadata, lockedTarget: it.targetValue, lockedAt: now(),
              ...(r ? { lockedActual: r.actual, lockedAchieved: r.achieved, lockedEvidence: r.evidence.slice(0, 500) } : {}) };
          }
        }
        p.status = status; p.updatedAt = now();
        return p;
      });
    },

    /* ---------- KR chung + phân bổ ---------- */
    saveKr(a: KpiActor, k: Partial<GoalKr> & { goalId: string; metricKey: string; targetValue: number }, reason = "") {
      need(a, k.id ? "kpi.kr_adjust" : "kpi.kr_assign");
      const m = getKpiMetric(k.metricKey);
      if (!m) throw new KpiError(`Metric không tồn tại: ${k.metricKey}`);
      if (!Number.isFinite(k.targetValue) || k.targetValue <= 0) throw new KpiError(`Chỉ tiêu của "${m.label}" phải > 0.`);
      if (k.websiteId && k.socialId) throw new KpiError("Không gắn đồng thời Website và Social.");
      return mutate((db) => {
        db.krs = db.krs ?? [];
        const goal = db.goals.find((g) => g.id === k.goalId);
        if (!goal) throw new KpiError("Không tìm thấy mục tiêu.");
        if (k.deadline && (k.deadline < goal.periodStart || k.deadline > goal.periodEnd)) throw new KpiError("Deadline KR phải nằm trong kỳ của mục tiêu.");
        const ex = k.id ? db.krs.find((x) => x.id === k.id) : undefined;
        if (!(goal.status === "draft" || goal.status === "active") || goalLocked(goal.id, db)) throw new KpiError("Mục tiêu đã hủy/hoàn thành/khóa kỳ — không thêm hoặc sửa KR.");
        if (ex && (ex.websiteId !== (k.websiteId ?? ex.websiteId) || ex.socialId !== (k.socialId ?? ex.socialId)) && db.items.some((i) => i.krId === ex.id))
          throw new KpiError("KR đã có phân bổ — không đổi Website/Social. Hãy tạo KR mới.");
        const history = [...(((ex?.metadata as { history?: unknown[] })?.history) ?? [])];
        if (ex && ex.targetValue !== k.targetValue) history.push({ from: ex.targetValue, to: k.targetValue, by: a.id, at: now(), reason });
        const rec: GoalKr = { id: ex?.id ?? k.id ?? uid(), goalId: k.goalId, metricKey: k.metricKey, label: k.label ?? ex?.label ?? null, targetValue: k.targetValue,
          brandId: k.brandId !== undefined ? k.brandId : ex?.brandId ?? goal.brandId, websiteId: k.websiteId !== undefined ? k.websiteId : ex?.websiteId ?? null,
          socialId: k.socialId !== undefined ? k.socialId : ex?.socialId ?? null, deadline: k.deadline !== undefined ? k.deadline : ex?.deadline ?? null,
          status: k.status ?? ex?.status ?? "active", metadata: { ...(ex?.metadata ?? {}), ...(k.metadata ?? {}), history },
          createdBy: ex?.createdBy ?? a.id, createdAt: ex?.createdAt ?? now(), updatedAt: now() };
        db.krs = ex ? db.krs.map((x) => (x.id === rec.id ? rec : x)) : [...db.krs, rec];
        return rec;
      });
    },
    setKrStatus(a: KpiActor, krId: string, status: GoalKrStatus) {
      need(a, "kpi.kr_adjust");
      return mutate((db) => { const k = (db.krs ?? []).find((x) => x.id === krId); if (!k) throw new KpiError("Không tìm thấy KR.");
        const g = db.goals.find((x) => x.id === k.goalId);
        if (g && goalLocked(g.id, db) && status !== "archived") throw new KpiError("Kỳ đã khóa — chỉ được lưu trữ KR.");
        if (g && status === "active" && !(g.status === "draft" || g.status === "active")) throw new KpiError("Mục tiêu đã hủy/hoàn thành — không khôi phục KR."); k.status = status; k.updatedAt = now(); return k; });
    },
    /** Xóa KR: chỉ khi chưa có dòng phân bổ nào. */
    deleteKr(a: KpiActor, krId: string) {
      need(a, "kpi.kr_adjust");
      mutate((db) => {
        const kr = (db.krs ?? []).find((x) => x.id === krId);
        if (kr && goalLocked(kr.goalId, db)) throw new KpiError("Kỳ đã khóa — không xóa KR.");
        if (db.items.some((i) => i.krId === krId)) throw new KpiError("KR đã có phân bổ — hãy xóa các dòng chưa có kết quả hoặc chọn Hủy/Lưu trữ.");
        db.krs = (db.krs ?? []).filter((x) => x.id !== krId);
      });
    },
    /** Xóa mục tiêu: chỉ khi không còn KR hay chỉ tiêu nào liên kết. */
    deleteGoal(a: KpiActor, goalId: string) {
      need(a, "kpi.goal_delete");
      mutate((db) => {
        const why = goalDeleteBlockers(goalId, db);
        if (why.length) throw new KpiError(`Không thể xóa vĩnh viễn: ${why.join("; ")}. Hãy dùng Hủy hoặc Lưu trữ để giữ lịch sử.`);
        db.goals = db.goals.filter((g) => g.id !== goalId);
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
