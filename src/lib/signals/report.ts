import { needGroupsOf, isDueToday, isOverdue, todayKey, type LastNote, type Signal, type SignalStatus } from "./catalog";
import { potentialOf,stageOf,type Potential,type Stage } from './potential';
import { matchesSignalStatus } from './listPriority';

export type DateBasis = "created" | "closed";
export interface ReportFilter {
  potential?: Potential; labelId?: string; stage?: Stage;
  from?: string; to?: string; basis: DateBasis;
  source?: string; product?: string; needGroup?: string;
  saleId?: string; creatorId?: string; status?: string; lostReason?: string;
}

const dateOf = (s: Signal, basis: DateBasis): string | null =>
  basis === "created" ? s.detected_on : s.closed_at ? todayKey(new Date(s.closed_at)) : null;

/** Lý do trượt được chuẩn hóa: lý do tùy chỉnh ("Khác: ...") gom về "Khác". */
export const reasonGroup = (r: string | null) => (!r ? null : r.startsWith("Khác") ? "Khác" : r);

export function filterSignals(list: Signal[], f: ReportFilter): Signal[] {
  return list.filter((s) => {
    if(f.potential && potentialOf(s)!==f.potential) return false;
    if(f.labelId && !s.label_ids?.includes(f.labelId)) return false;
    if(f.stage && stageOf(s)!==f.stage) return false;
    if (s.cancelled_at) return false; // Hủy ≠ Trượt: loại khỏi báo cáo thường
    if (f.from || f.to) {
      const d = dateOf(s, f.basis);
      if (!d) return false;
      if (f.from && d < f.from) return false;
      if (f.to && d > f.to) return false;
    }
    if (f.source && s.source !== f.source) return false;
    if (f.product && !s.products.includes(f.product)) return false;
    if (f.needGroup && !needGroupsOf(s).includes(f.needGroup)) return false;
    if (f.saleId && s.assigned_to !== f.saleId) return false;
    if (f.creatorId && s.created_by !== f.creatorId) return false;
    if (f.lostReason && reasonGroup(s.lost_reason) !== f.lostReason) return false;
    if (f.status) {
      if (f.status === "unassigned" ? s.assigned_to !== null : s.status !== f.status) return false;
    }
    return true;
  });
}

export interface Summary {
  total: number; unassigned: number; accepted: number; waiting: number; contacting: number; consulting: number; quoted: number; deposit: number;
  won: number; lost: number; closeRate: number | null; revenue: number; overdue: number; dueToday: number; noNote: number;
}

export function summarize(list: Signal[], today = todayKey(), last?: Record<string, LastNote>): Summary {
  const r: Summary = { total: list.length, unassigned: 0, accepted: 0, waiting: 0, contacting: 0, consulting: 0, quoted: 0, deposit: 0, won: 0, lost: 0, closeRate: null, revenue: 0, overdue: 0, dueToday: 0, noNote: 0 };
  for (const s of list) {
    if (!s.assigned_to) r.unassigned++;
    else if (s.status && s.status !== "won" && s.status !== "lost") r[s.status]++;
    if (s.assigned_to && s.status && s.status !== "waiting") r.accepted++;
    if (s.status === "won") { r.won++; r.revenue += Number(s.revenue || 0); }
    if (s.status === "lost") r.lost++;
    if (isOverdue(s, today)) r.overdue++;
    if (isDueToday(s, today)) r.dueToday++;
    if (last && s.assigned_to && !last[s.id]) r.noNote++;
  }
  // Tỷ lệ chốt = Chốt / Tổng tín hiệu hợp lệ (cùng tập đã lọc, đã loại tín hiệu hủy)
  r.closeRate = r.total > 0 ? (r.won / r.total) * 100 : null;
  return r;
}

export function groupBy(list: Signal[], key: (s: Signal) => string | null): { key: string; s: Summary }[] {
  const m = new Map<string, Signal[]>();
  for (const s of list) {
    const k = key(s);
    if (k == null) continue;
    (m.get(k) ?? m.set(k, []).get(k)!).push(s);
  }
  return [...m.entries()].map(([k, v]) => ({ key: k, s: summarize(v) })).sort((a, b) => b.s.total - a.s.total);
}

export function lostReasons(list: Signal[]): { key: string; n: number }[] {
  const m = new Map<string, number>();
  for (const s of list) if (s.status === "lost") { const k = reasonGroup(s.lost_reason) ?? "Không rõ"; m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n);
}

/* ---------- Xu hướng theo thời gian ---------- */
export type TrendGranularity = "day" | "week" | "month";
export interface TrendPoint { key: string; label: string; created: number; won: number }

/** Thứ Hai của tuần chứa ngày (key "YYYY-MM-DD", giờ VN). */
export function weekStart(key: string): string {
  const d = new Date(key + "T00:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7; // Thứ Hai = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}
const ddmm = (key: string) => key.slice(8, 10) + "/" + key.slice(5, 7);

/**
 * Chuỗi xu hướng theo ngày tạo (detected_on) của tập đã lọc:
 * created = số tín hiệu tạo trong nhóm; won = số tín hiệu thuộc nhóm hiện đã Chốt.
 * Đây là "tạo trong kỳ, hiện đã chốt" — KHÔNG phải "chốt trong kỳ".
 */
export function trendSeries(list: Signal[], g: TrendGranularity): TrendPoint[] {
  const m = new Map<string, TrendPoint>();
  for (const s of list) {
    const d = s.detected_on;
    if (!d) continue;
    const key = g === "day" ? d : g === "week" ? weekStart(d) : d.slice(0, 7);
    const label = g === "day" ? ddmm(d) : g === "week" ? "Tuần " + ddmm(key) : key.slice(5, 7) + "/" + key.slice(0, 4);
    const p = m.get(key) ?? m.set(key, { key, label, created: 0, won: 0 }).get(key)!;
    p.created++;
    if (s.status === "won") p.won++;
  }
  return [...m.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/** Event-date trend: discovery and actual close dates are independent. */
export function eventTrendSeries(list:Signal[],g:TrendGranularity,from?:string,to?:string):TrendPoint[] {
  const map=new Map<string,TrendPoint>();
  const add=(date:string,field:'created'|'won')=>{
    if((from&&date<from)||(to&&date>to))return;
    const key=g==='day'?date:g==='week'?weekStart(date):date.slice(0,7);
    const label=g==='day'?ddmm(key):g==='week'?'Tuần '+ddmm(key):key.slice(5,7)+'/'+key.slice(0,4);
    let point=map.get(key);if(!point){point={key,label,created:0,won:0};map.set(key,point);}point[field]++;
  };
  for(const s of list){add(s.detected_on,'created');if(s.status==='won'&&s.closed_at)add(todayKey(new Date(s.closed_at)),'won');}
  return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key));
}

/* ---------- Điểm đáng chú ý (tính từ dữ liệu thật, không suy diễn) ---------- */
export interface Insight { kind: "source" | "rate" | "backlog" | "need"; text: string; note?: string }

export const INSIGHT_MIN_SAMPLE = 5;

export function reportInsights(args: {
  sum: Summary;
  bySource: { key: string; s: Summary }[];
  byNeed: { key: string; s: Summary }[];
  minSample?: number;
}): Insight[] {
  const { sum, bySource, byNeed } = args;
  const min = args.minSample ?? INSIGHT_MIN_SAMPLE;
  const out: Insight[] = [];
  const topSrc = bySource[0];
  if (topSrc) out.push({ kind: "source", text: `Nguồn nhiều tín hiệu nhất: ${topSrc.key} (${topSrc.s.total} tín hiệu).` });
  // Tỷ lệ chốt cao nhất chỉ xét nguồn đủ mẫu; nguồn dẫn đầu nhưng mẫu nhỏ được ghi chú rõ.
  const rated = bySource.filter((r) => r.s.total > 0 && r.s.closeRate != null);
  const best = [...rated].sort((a, b) => (b.s.closeRate ?? 0) - (a.s.closeRate ?? 0))[0];
  if (best) {
    const enough = best.s.total >= min;
    out.push({
      kind: "rate",
      text: `Tỷ lệ chốt cao nhất: ${best.key} (${best.s.closeRate!.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% — ${best.s.won}/${best.s.total}).`,
      note: enough ? undefined : `Mẫu nhỏ (${best.s.total} < ${min} tín hiệu) — chưa đủ căn cứ kết luận nguồn hiệu quả nhất.`,
    });
  }
  const backlog = sum.unassigned + sum.waiting;
  if (backlog > 0) out.push({ kind: "backlog", text: `Tồn đọng cần xử lý: ${backlog} tín hiệu (${sum.unassigned} chưa phân công, ${sum.waiting} chờ nhận).` });
  const topNeed = byNeed[0];
  if (topNeed) out.push({ kind: "need", text: `Nhóm nhu cầu nổi bật: ${topNeed.key} (${topNeed.s.total} tín hiệu).` });
  return out;
}

/* ---------- Bộ lọc trang danh sách ---------- */
/** Lọc nhanh chỉ theo trạng thái (không còn lọc lịch hẹn). */
export type Quick = "all" | "unassigned" | SignalStatus;
export type TimeRange = "" | "today" | "7d" | "month" | "custom";
export interface ListFilter {
  potential?: Potential; labelId?: string; stage?: Stage; nextFrom?: string; nextTo?: string;
  q?: string; quick: Quick; time: TimeRange; from?: string; to?: string;
  source?: string; product?: string; needGroup?: string; saleId?: string; creatorId?: string;
  lostReason?: string; unassigned?: boolean; cancelled?: boolean;
}

function addDays(key: string, n: number) {
  const d = new Date(key + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}
export function timeBounds(f: Pick<ListFilter, "time" | "from" | "to">, today: string): [string?, string?] {
  switch (f.time) {
    case "today": return [today, today];
    case "7d": return [addDays(today, -6), today];
    case "month": return [today.slice(0, 7) + "-01", today];
    case "custom": return [f.from || undefined, f.to || undefined];
    default: return [];
  }
}

/** Thời điểm cập nhật gần nhất = mới hơn giữa bản ghi và diễn biến cuối. */
export const lastActivity = (s: Signal, last?: LastNote) =>
  last?.created_at && last.created_at > s.updated_at ? last.created_at : s.updated_at;

/** Lọc chi tiết (không gồm lọc nhanh trạng thái) — dùng để đếm số theo trạng thái. */
export function applyDetailFilter(list: Signal[], f: ListFilter, today = todayKey()): Signal[] {
  const t = f.q?.trim().toLowerCase();
  const [from, to] = timeBounds(f, today);
  return list.filter((s) => {
    if(f.potential && potentialOf(s)!==f.potential) return false;
    if(f.labelId && !s.label_ids?.includes(f.labelId)) return false;
    if(f.stage && stageOf(s)!==f.stage) return false;
    if(f.nextFrom && (!s.next_contact_on || s.next_contact_on<f.nextFrom)) return false;
    if(f.nextTo && (!s.next_contact_on || s.next_contact_on>f.nextTo)) return false;
    if (t && !(s.customer_name.toLowerCase().includes(t) || s.phone.includes(t))) return false;
    if (!!f.cancelled !== !!s.cancelled_at) return false;
    if (f.unassigned && s.assigned_to !== null) return false;
    if (from && s.detected_on < from) return false;
    if (to && s.detected_on > to) return false;
    if (f.source && s.source !== f.source) return false;
    if (f.product && !s.products.includes(f.product)) return false;
    if (f.needGroup && !needGroupsOf(s).includes(f.needGroup)) return false;
    if (f.saleId && s.assigned_to !== f.saleId) return false;
    if (f.creatorId && s.created_by !== f.creatorId) return false;
    if (f.lostReason && reasonGroup(s.lost_reason) !== f.lostReason) return false;
    return true;
  });
}

export function applyListFilter(list: Signal[], f: ListFilter, today = todayKey(), last: Record<string, LastNote> = {}): Signal[] {
  return applyDetailFilter(list, f, today)
    .filter((s) => matchesSignalStatus(s, f.quick))
    .sort((a, b) => lastActivity(b, last[b.id]).localeCompare(lastActivity(a, last[a.id])) || a.id.localeCompare(b.id));
}
