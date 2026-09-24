/**
 * KPI V2 — DAY 5: báo cáo hiệu suất theo NHÂN SỰ (PURE, chỉ đọc).
 * Không cộng gộp khác đơn vị, không tính điểm trung bình. Thiếu dữ liệu → null ("Chưa đủ dữ liệu"/N/A).
 */
import type { Task, WebContent, SocialPost, Video, DesignOrder } from "@/lib/store";
import type { EmployeeKpiItem, EmployeeKpiPeriod, KpiMetricCategory } from "./types";
import type { KpiAdjustment } from "./service";
import { getKpiMetric } from "./metrics";
import { calculateKpiItem } from "./calculateKpi";
import { calculateVideoDesignItem } from "./calculateVideoDesign";
import { matchesEmployee, type KpiEmployee } from "./identity";
import { toDateKey } from "./date";

export interface ReportData { tasks: Task[]; webContents: WebContent[]; socialPosts: SocialPost[]; videos: Video[]; orders: DesignOrder[]; /** snapshot điểm order (sidecar đã duyệt); thiếu → N/A */ designPoints?: Record<string, number> }
export interface ReportFilters { brandId?: string; websiteId?: string; socialId?: string; group?: KpiMetricCategory | "" }
export type SourceType = "task" | "web_content" | "social_post" | "video" | "design_order";

export interface EvidenceRow {
  sourceType: SourceType; sourceId: string; title: string; creditedAt: string;
  brandId: string | null; websiteId: string | null; socialId: string | null;
  deadline: string | null; onTime: boolean | null; firstPass: boolean | null; points?: number;
}
export interface Ratio { num: number; den: number; pct: number | null }
export interface ItemReport {
  item: EmployeeKpiItem; label: string; unit: string; category: KpiMetricCategory | "?";
  target: number; lockedTarget: number | null; adjustments: KpiAdjustment[];
  actual: number | null; achieved: boolean | null; supported: boolean;
  /** Item global/rộng hơn bộ lọc: actual = đóng góp trong phạm vi lọc, target N/A. */
  contributionOnly: boolean;
  evidence: EvidenceRow[]; warnings: number;
  breakdown: { key: string; brandId: string | null; websiteId: string | null; socialId: string | null; count: number }[];
}
export interface WorkRow { sourceType: SourceType; sourceId: string; title: string; status: string; deadline: string | null; brandId: string | null; websiteId: string | null; socialId: string | null; overdue: boolean }
export interface EmployeeReport {
  userId: string; ambiguousName: boolean; periods: EmployeeKpiPeriod[];
  items: ItemReport[]; achievedCount: number; assignedCount: number;
  output: number; onTime: Ratio; quality: Ratio;
  backlog: WorkRow[]; overdue: WorkRow[]; waitingReview: WorkRow[];
}

const ratio = (num: number, den: number): Ratio => ({ num, den, pct: den > 0 ? Math.round((num / den) * 1000) / 10 : null });

/** 2 người trùng họ tên → chỉ khớp theo id/username (không khớp tên để tránh gán nhầm). */
export function safeEmployee(u: { id: string; fullName?: string; username?: string }, all: { fullName?: string }[]): { emp: KpiEmployee; ambiguous: boolean } {
  const n = (s?: string) => (s ?? "").trim().toLocaleLowerCase("vi");
  const ambiguous = !!u.fullName && all.filter((x) => n(x.fullName) === n(u.fullName)).length > 1;
  return { emp: { id: u.id, username: u.username, fullName: ambiguous ? null : u.fullName }, ambiguous };
}

function filterMatch(f: ReportFilters, r: { brandId: string | null; websiteId: string | null; socialId: string | null }) {
  if (f.brandId && r.brandId !== f.brandId) return false;
  if (f.websiteId && r.websiteId !== f.websiteId) return false;
  if (f.socialId && r.socialId !== f.socialId) return false;
  return true;
}

function sourceLookup(d: ReportData) {
  const web = new Map(d.webContents.map((x) => [x.id, x]));
  const soc = new Map(d.socialPosts.map((x) => [x.id, x]));
  const vid = new Map(d.videos.map((x) => [x.id, x]));
  return (t: SourceType, id: string) => {
    if (t === "web_content") return { websiteId: web.get(id)?.websiteId ?? null, socialId: null };
    if (t === "social_post") return { websiteId: null, socialId: soc.get(id)?.channelId ?? null };
    if (t === "video") { const v = vid.get(id); const p = v?.socialPostId ? soc.get(v.socialPostId) : undefined; return { websiteId: null, socialId: p?.channelId ?? null }; }
    return { websiteId: null, socialId: null };
  };
}

export function buildItemReport(emp: KpiEmployee, item: EmployeeKpiItem, period: EmployeeKpiPeriod, data: ReportData, f: ReportFilters, adjustments: KpiAdjustment[]): ItemReport {
  const m = getKpiMetric(item.metricKey);
  const p = { periodStart: period.periodStart, periodEnd: period.periodEnd };
  const input = { metricKey: item.metricKey, targetValue: item.targetValue, brandId: item.brandId, websiteId: item.websiteId, socialId: item.socialId };
  const look = sourceLookup(data);
  let actual: number | null; let warnings = 0; let supported = true; let raw: EvidenceRow[] = [];
  if (["web_content_completed", "social_post_completed", "task_completed"].includes(item.metricKey)) {
    const r = calculateKpiItem(emp, input, p, { webContents: data.webContents, socialPosts: data.socialPosts, tasks: data.tasks });
    warnings = r.warnings.length; supported = r.supported;
    actual = r.evidence.length === 0 && warnings > 0 ? null : r.actualValue;
    raw = r.evidence.map((e) => ({ sourceType: e.sourceType, sourceId: e.sourceId, title: e.title, creditedAt: e.creditedAt, brandId: e.brandId,
      websiteId: e.websiteId ?? null, socialId: e.socialId ?? null, deadline: e.deadline, onTime: e.onTime,
      firstPass: e.basis === "history" || e.basis === "submittedAt" ? e.firstPass : null }));
  } else {
    const r = calculateVideoDesignItem(emp, input, p, { videos: data.videos, designOrders: data.orders, socialPosts: data.socialPosts, designPoints: data.designPoints });
    warnings = r.warnings.length; supported = r.supported; actual = r.actualValue;
    raw = r.evidence.map((e) => ({ sourceType: e.sourceType, sourceId: e.sourceId, title: e.title, creditedAt: e.creditedAt, brandId: e.brandId,
      ...look(e.sourceType, e.sourceId), deadline: e.deadline, onTime: e.onTime, firstPass: e.firstPass, points: e.points }));
  }
  if (!supported) actual = null;
  // Bộ lọc: nếu item có phạm vi riêng đã nằm trong bộ lọc → giữ target; nếu rộng hơn → chỉ là đóng góp.
  const filtered = !!(f.brandId || f.websiteId || f.socialId);
  const itemWithin = (!f.brandId || item.brandId === f.brandId) && (!f.websiteId || item.websiteId === f.websiteId) && (!f.socialId || item.socialId === f.socialId);
  const contributionOnly = filtered && !itemWithin;
  const evidence = raw.filter((e) => filterMatch(f, e));
  if (filtered && actual !== null) {
    if (item.metricKey === "design_points_completed") {
      actual = evidence.some((e) => e.points === undefined) ? null : evidence.reduce((s, e) => s + (e.points ?? 0), 0);
    } else actual = evidence.length;
  }
  const lockedTarget = typeof item.metadata?.lockedTarget === "number" ? (item.metadata.lockedTarget as number) : null;
  const target = lockedTarget ?? item.targetValue;
  const bmap = new Map<string, ItemReport["breakdown"][number]>();
  for (const e of evidence) {
    const key = `${e.brandId}|${e.websiteId}|${e.socialId}`;
    const b = bmap.get(key) ?? { key, brandId: e.brandId, websiteId: e.websiteId, socialId: e.socialId, count: 0 };
    b.count++; bmap.set(key, b);
  }
  return {
    item, label: item.label || m?.label || item.metricKey, unit: m?.unit ?? item.unit, category: m?.category ?? "?",
    target, lockedTarget, adjustments: adjustments.filter((a) => a.itemId === item.id),
    // Coverage: có mục chưa xác minh có thể đổi kết luận → không chấm Chưa đạt chắc chắn.
    actual, contributionOnly,
    achieved: contributionOnly || actual === null ? null : actual >= target ? true : warnings > 0 ? null : false, supported, evidence, warnings, breakdown: [...bmap.values()],
  };
}

/* Tồn việc thuộc trách nhiệm (current responsibility, không phải KPI lịch sử). */
const WEB_WRITER_OPEN = new Set(["Đã giao", "Đang viết", "Cần sửa bài", "Đang làm", "Chưa bắt đầu"]);
const isWaiting = (s: string) => s.startsWith("Chờ duyệt") || s === "Chờ xác nhận";
export function buildWork(emp: KpiEmployee, d: ReportData, f: ReportFilters, today: string) {
  const out: WorkRow[] = [];
  const push = (r: Omit<WorkRow, "overdue">) => {
    if (!filterMatch(f, r)) return;
    const dl = toDateKey(r.deadline);
    out.push({ ...r, overdue: !isWaiting(r.status) && !!dl && dl < today });
  };
  for (const t of d.tasks) if (matchesEmployee(t.assignee, emp) && ["Mới tạo", "Đã giao", "Đang làm", "Cần sửa", "Chờ xác nhận"].includes(t.status))
    push({ sourceType: "task", sourceId: t.id, title: t.title, status: t.status, deadline: t.deadline ?? null, brandId: t.brandId ?? null, websiteId: null, socialId: null });
  for (const c of d.webContents) if (matchesEmployee(c.writer, emp) && c.type !== "Bài tối ưu lại" && (WEB_WRITER_OPEN.has(c.status) || c.status === "Chờ duyệt bài"))
    push({ sourceType: "web_content", sourceId: c.id, title: c.title, status: c.status, deadline: c.deadline ?? null, brandId: c.brandId ?? null, websiteId: c.websiteId ?? null, socialId: null });
  for (const p of d.socialPosts) if (matchesEmployee(p.writer, emp) && ["Kế hoạch", "Đang làm", "Cần sửa", "Chờ duyệt"].includes(p.status))
    push({ sourceType: "social_post", sourceId: p.id, title: p.title, status: p.status, deadline: null /* scheduledDate là lịch đăng, không phải deadline viết */, brandId: p.brandId ?? null, websiteId: null, socialId: p.channelId ?? null });
  for (const v of d.videos) if (matchesEmployee(v.owner, emp) && !["Video đã duyệt", "Đã bàn giao", "Đã đăng", "Hoàn thành", "Đã hủy", "Kế hoạch"].includes(v.status))
    push({ sourceType: "video", sourceId: v.id, title: v.title, status: v.status, deadline: v.status.includes("kịch bản") ? v.scriptDeadline ?? null : null /* không quy owner thành quay/dựng/đăng */, brandId: v.brandId ?? null, websiteId: null, socialId: null });
  for (const o of d.orders) if (matchesEmployee(o.assignee, emp) && ["Chờ nhận việc", "Đang thực hiện", "Cần sửa", "Chờ duyệt"].includes(o.status))
    push({ sourceType: "design_order", sourceId: o.id, title: o.title, status: o.status, deadline: o.deadline ?? null, brandId: o.brandId ?? null, websiteId: null, socialId: null });
  return { backlog: out.filter((r) => !isWaiting(r.status)), overdue: out.filter((r) => r.overdue), waitingReview: out.filter((r) => isWaiting(r.status)) };
}

export function buildEmployeeReport(args: {
  user: { id: string; fullName?: string; username?: string }; allUsers: { fullName?: string }[];
  periods: EmployeeKpiPeriod[]; items: EmployeeKpiItem[]; adjustments: KpiAdjustment[];
  data: ReportData; filters: ReportFilters; today: string;
}): EmployeeReport {
  const { emp, ambiguous } = safeEmployee(args.user, args.allUsers);
  const periods = args.periods.filter((p) => p.userId === args.user.id);
  const items: ItemReport[] = [];
  for (const p of periods) for (const it of args.items.filter((i) => i.kpiPeriodId === p.id)) {
    const f = args.filters;
    if ((f.brandId && it.brandId && it.brandId !== f.brandId) || (f.websiteId && it.websiteId && it.websiteId !== f.websiteId) || (f.socialId && it.socialId && it.socialId !== f.socialId) || (f.websiteId && it.socialId) || (f.socialId && it.websiteId)) continue;
    const r = buildItemReport(emp, it, p, args.data, args.filters, args.adjustments);
    if (args.filters.group && r.category !== args.filters.group) continue;
    items.push(r);
  }
  // Sản lượng: evidence duy nhất theo (nguồn, id) — không đếm 2 lần giữa các chỉ tiêu.
  const uniq = new Map<string, EvidenceRow>();
  for (const r of items) for (const e of r.evidence) uniq.set(`${e.sourceType}:${e.sourceId}`, e);
  const ev = [...uniq.values()];
  const withDl = ev.filter((e) => e.onTime !== null);
  const withQ = ev.filter((e) => e.firstPass !== null);
  const work = buildWork(emp, args.data, args.filters, args.today);
  return {
    userId: args.user.id, ambiguousName: ambiguous, periods, items,
    achievedCount: items.filter((i) => i.achieved === true).length, assignedCount: items.filter((i) => !i.contributionOnly).length,
    output: ev.length, onTime: ratio(withDl.filter((e) => e.onTime).length, withDl.length),
    quality: ratio(withQ.filter((e) => e.firstPass).length, withQ.length), ...work,
  };
}

/** Query params chuẩn bị cho Overview V2 (chưa có route). */
export function overviewV2Href(r: { brandId: string | null; websiteId: string | null; socialId: string | null }, period: { periodStart: string; periodEnd: string }) {
  const q = new URLSearchParams({ from: period.periodStart, to: period.periodEnd });
  if (r.brandId) q.set("brandId", r.brandId);
  if (r.websiteId) q.set("websiteId", r.websiteId);
  if (r.socialId) q.set("socialId", r.socialId);
  return `/overview-v2?${q}`;
}
