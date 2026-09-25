import { isDueToday, isOverdue, todayKey, type LastNote, type Signal } from "./catalog";

export type DateBasis = "created" | "closed";
export interface ReportFilter {
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
    if (f.lostReason && reasonGroup(s.lost_reason) !== f.lostReason) return false;
    if (f.status) {
      if (f.status === "unassigned" ? s.assigned_to !== null : s.status !== f.status) return false;
    }
    return true;
  });
}

export interface Summary {
  total: number; unassigned: number; waiting: number; contacting: number; consulting: number; quoted: number; deposit: number;
  won: number; lost: number; closeRate: number | null; revenue: number; overdue: number; dueToday: number; noNote: number;
}

export function summarize(list: Signal[], today = todayKey(), last?: Record<string, LastNote>): Summary {
  const r: Summary = { total: list.length, unassigned: 0, waiting: 0, contacting: 0, consulting: 0, quoted: 0, deposit: 0, won: 0, lost: 0, closeRate: null, revenue: 0, overdue: 0, dueToday: 0, noNote: 0 };
  for (const s of list) {
    if (!s.assigned_to) r.unassigned++;
    else if (s.status && s.status !== "won" && s.status !== "lost") r[s.status]++;
    if (s.status === "won") { r.won++; r.revenue += Number(s.revenue || 0); }
    if (s.status === "lost") r.lost++;
    if (isOverdue(s, today)) r.overdue++;
    if (isDueToday(s, today)) r.dueToday++;
    if (last && s.assigned_to && !last[s.id]) r.noNote++;
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

export function lostReasons(list: Signal[]): { key: string; n: number }[] {
  const m = new Map<string, number>();
  for (const s of list) if (s.status === "lost") { const k = reasonGroup(s.lost_reason) ?? "Không rõ"; m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n);
}

/* ---------- Bộ lọc trang danh sách ---------- */
export type Quick = "all" | "waiting" | "due" | "overdue" | "quoted" | "deposit";
export type TimeRange = "" | "today" | "7d" | "month" | "custom";
export interface ListFilter {
  q?: string; quick: Quick; status?: string; time: TimeRange; from?: string; to?: string;
  source?: string; product?: string; needGroup?: string; saleId?: string; creatorId?: string;
  nextFrom?: string; nextTo?: string; lostReason?: string; noNote?: boolean;
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

export function applyListFilter(list: Signal[], f: ListFilter, today = todayKey(), last: Record<string, LastNote> = {}): Signal[] {
  const t = f.q?.trim().toLowerCase();
  const [from, to] = timeBounds(f, today);
  return list.filter((s) => {
    if (t && !(s.customer_name.toLowerCase().includes(t) || s.phone.includes(t))) return false;
    switch (f.quick) {
      case "waiting": if (s.status !== "waiting") return false; break;
      case "quoted": if (s.status !== "quoted") return false; break;
      case "deposit": if (s.status !== "deposit") return false; break;
      case "due": if (!isDueToday(s, today)) return false; break;
      case "overdue": if (!isOverdue(s, today)) return false; break;
    }
    if (f.status && (f.status === "unassigned" ? s.assigned_to !== null : s.status !== f.status)) return false;
    if (from && s.detected_on < from) return false;
    if (to && s.detected_on > to) return false;
    if (f.source && s.source !== f.source) return false;
    if (f.product && !s.products.includes(f.product)) return false;
    if (f.needGroup && s.need_group !== f.needGroup) return false;
    if (f.saleId && s.assigned_to !== f.saleId) return false;
    if (f.creatorId && s.created_by !== f.creatorId) return false;
    if (f.nextFrom && (!s.next_contact_on || s.next_contact_on < f.nextFrom)) return false;
    if (f.nextTo && (!s.next_contact_on || s.next_contact_on > f.nextTo)) return false;
    if (f.lostReason && reasonGroup(s.lost_reason) !== f.lostReason) return false;
    if (f.noNote && (!s.assigned_to || last[s.id])) return false;
    return true;
  });
}
