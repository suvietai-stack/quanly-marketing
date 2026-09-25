import { isOverdue, todayKey, type Signal } from "./catalog";

export type DateBasis = "created" | "closed";
export interface ReportFilter {
  from?: string; to?: string; basis: DateBasis;
  source?: string; product?: string; needGroup?: string;
  saleId?: string; creatorId?: string; status?: string;
}

const dateOf = (s: Signal, basis: DateBasis): string | null =>
  basis === "created" ? s.detected_on : s.closed_at ? todayKey(new Date(s.closed_at)) : null;

export function filterSignals(list: Signal[], f: ReportFilter): Signal[] {
  return list.filter((s) => {
    if (f.from || f.to) {
      const d = dateOf(s, f.basis);
      if (!d) return false;
      if (f.from && d < f.from) return false;
      if (f.to && d > f.to) return false;
    }
    if (f.source && s.source !== f.source) return false;
    if (f.product && !s.products.includes(f.product)) return false;
    if (f.needGroup && s.need_group !== f.needGroup) return false;
    if (f.saleId && s.assigned_to !== f.saleId) return false;
    if (f.creatorId && s.created_by !== f.creatorId) return false;
    if (f.status) {
      if (f.status === "unassigned" ? s.assigned_to !== null : s.status !== f.status) return false;
    }
    return true;
  });
}

export interface Summary {
  total: number; unassigned: number; waiting: number; consulting: number;
  won: number; lost: number; closeRate: number | null; revenue: number; overdue: number;
}

export function summarize(list: Signal[], today = todayKey()): Summary {
  const r: Summary = { total: list.length, unassigned: 0, waiting: 0, consulting: 0, won: 0, lost: 0, closeRate: null, revenue: 0, overdue: 0 };
  for (const s of list) {
    if (!s.assigned_to) r.unassigned++;
    if (s.status === "waiting") r.waiting++;
    if (s.status === "consulting") r.consulting++;
    if (s.status === "won") { r.won++; r.revenue += Number(s.revenue || 0); }
    if (s.status === "lost") r.lost++;
    if (isOverdue(s, today)) r.overdue++;
  }
  r.closeRate = r.won + r.lost > 0 ? (r.won / (r.won + r.lost)) * 100 : null;
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
