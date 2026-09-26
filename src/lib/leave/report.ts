/**
 * Báo cáo đơn từ — hàm thuần. Tính theo ngày thực tế đăng ký (không phải ngày gửi).
 * Chỉ đơn Đã duyệt cộng vào tổng; các trạng thái khác chỉ hiện trong bảng chi tiết.
 * Mỗi đơn là một bản ghi (gửi lại không tạo đơn mới) nên không đếm trùng.
 */
import { addDays, isoDow } from "./calc";

export type PeriodKind = "week" | "month" | "quarter" | "year" | "custom";
export interface Range { start: string; end: string } // YYYY-MM-DD inclusive

export interface ReportRow {
  userId: string; leaveCount: number; leaveDays: number; lateCount: number; lateMinutes: number;
  earlyCount: number; earlyMinutes: number; pending: number; rejected: number;
}
type R = { id?: string; owner_id: string; type: string; status: string; payload: any; calc: any; submitted_at?: string };

const p2 = (n: number) => String(n).padStart(2, "0");
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Thứ Hai của tuần ISO số w năm y. */
export function isoWeekStart(y: number, w: number): string {
  const jan4 = `${y}-01-04`;
  return addDays(addDays(jan4, 1 - isoDow(jan4)), (w - 1) * 7);
}
export function isoWeekOf(date: string): { year: number; week: number } {
  const thu = addDays(date, 4 - isoDow(date));
  const y = Number(thu.slice(0, 4));
  const w = Math.round((Date.parse(thu) - Date.parse(isoWeekStart(y, 1))) / 864e5 / 7) + 1;
  return { year: y, week: w };
}
export function weeksInYear(y: number): number { return isoWeekOf(`${y}-12-28`).week; }

export function rangeOf(kind: PeriodKind, o: { year: number; week?: number; month?: number; quarter?: number; start?: string; end?: string }): Range {
  const y = o.year;
  if (kind === "week") { const s = isoWeekStart(y, o.week ?? 1); return { start: s, end: addDays(s, 6) }; }
  if (kind === "month") { const m = o.month ?? 1; return { start: `${y}-${p2(m)}-01`, end: `${y}-${p2(m)}-${p2(lastDay(y, m))}` }; }
  if (kind === "quarter") { const q = o.quarter ?? 1; const m1 = (q - 1) * 3 + 1, m3 = m1 + 2; return { start: `${y}-${p2(m1)}-01`, end: `${y}-${p2(m3)}-${p2(lastDay(y, m3))}` }; }
  if (kind === "year") return { start: `${y}-01-01`, end: `${y}-12-31` };
  const s = o.start || `${y}-01-01`, e = o.end || s;
  return s <= e ? { start: s, end: e } : { start: e, end: s };
}

const inR = (d: string | undefined, r: Range) => !!d && d >= r.start && d <= r.end;

/** Phần của đơn nằm trong kỳ: số ngày nghỉ (đơn nghỉ) hoặc null nếu không thuộc kỳ. */
export function portion(r: R, range: Range): { days: number; minutes: number } | null {
  if (r.type === "leave") {
    const details: { date: string; days: number }[] = Array.isArray(r.calc?.details) ? r.calc.details : [];
    if (details.length) {
      const hit = details.filter((d) => inR(d.date, range));
      return hit.length ? { days: Math.round(hit.reduce((s, d) => s + Number(d.days || 0), 0) * 100) / 100, minutes: 0 } : null;
    }
    return inR(r.payload?.start_date, range) ? { days: Number(r.calc?.days ?? 0), minutes: 0 } : null;
  }
  return inR(r.payload?.date, range) ? { days: 0, minutes: Number(r.payload?.minutes ?? 0) } : null;
}

export function buildReport(rows: R[], range: Range | string): ReportRow[] {
  const rg = typeof range === "string" ? rangeOf("month", { year: +range.slice(0, 4), month: +range.slice(5, 7) }) : range;
  const by: Record<string, ReportRow> = {};
  const get = (u: string) => (by[u] ??= { userId: u, leaveCount: 0, leaveDays: 0, lateCount: 0, lateMinutes: 0, earlyCount: 0, earlyMinutes: 0, pending: 0, rejected: 0 });
  for (const r of rows) {
    const part = portion(r, rg);
    if (!part) continue;
    const g = get(r.owner_id);
    if (r.status === "approved") {
      if (r.type === "leave") { g.leaveCount++; g.leaveDays += part.days; }
      else if (r.type === "late") { g.lateCount++; g.lateMinutes += part.minutes; }
      else { g.earlyCount++; g.earlyMinutes += part.minutes; }
    } else if (r.status === "pending") g.pending++;
    else if (r.status === "rejected") g.rejected++;
  }
  for (const g of Object.values(by)) g.leaveDays = Math.round(g.leaveDays * 100) / 100;
  return Object.values(by);
}

export interface DetailRow { id?: string; userId: string; type: string; status: string; when: string; days: number; minutes: number; counted: boolean; submittedAt?: string }
/** Tất cả đơn thuộc kỳ (mọi trạng thái) để đối chiếu. */
export function buildDetails(rows: R[], range: Range, userId?: string): DetailRow[] {
  const out: DetailRow[] = [];
  for (const r of rows) {
    if (userId && r.owner_id !== userId) continue;
    const part = portion(r, range);
    if (!part) continue;
    const when = r.type === "leave" ? `${r.payload?.start_date ?? ""} → ${r.payload?.end_date ?? ""}` : String(r.payload?.date ?? "");
    out.push({ id: r.id, userId: r.owner_id, type: r.type, status: r.status, when, days: part.days, minutes: part.minutes, counted: r.status === "approved", submittedAt: r.submitted_at });
  }
  return out.sort((a, b) => a.when.localeCompare(b.when));
}

export function toCsv(rows: ReportRow[], name: (id: string) => string, month: string, title?: string): string {
  const head = ["Kỳ", "Nhân viên", "Số đơn nghỉ phép", "Số ngày nghỉ", "Số lần đi muộn", "Phút đi muộn", "Số lần về sớm", "Phút về sớm", "Đơn chờ duyệt", "Đơn bị từ chối"];
  const esc = (v: unknown) => { const s = String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = rows.map((r) => [month, name(r.userId), r.leaveCount, String(r.leaveDays).replace(".", ","), r.lateCount, r.lateMinutes, r.earlyCount, r.earlyMinutes, r.pending, r.rejected].map(esc).join(","));
  return "\uFEFF" + [...(title ? [esc(`${title} — Báo cáo đơn từ ${month}`), ""] : []), head.join(","), ...lines].join("\n");
}
