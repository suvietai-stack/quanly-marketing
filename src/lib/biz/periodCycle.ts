/** Chu kỳ báo cáo linh hoạt — hàm thuần, giờ Việt Nam. Tuần = Thứ Hai → Chủ Nhật (ISO, có năm chuẩn của tuần). */

export type ReportCycle = "day" | "week" | "month" | "quarter";
export type PeriodKind = ReportCycle | "year";

export const CYCLE_LABEL: Record<PeriodKind, string> = { day: "Ngày", week: "Tuần", month: "Tháng", quarter: "Quý", year: "Năm" };

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDate = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export const parseDate = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

/** ISO dow: 1=Thứ Hai … 7=Chủ Nhật. */
export const isoDow = (d: Date) => d.getUTCDay() === 0 ? 7 : d.getUTCDay();

/** Thứ Hai của tuần chứa ngày cho trước. */
export function mondayOf(d: Date): Date {
  return addDays(d, 1 - isoDow(d));
}

/** Tuần ISO: { isoYear, week } — năm chuẩn của tuần (tuần 1 chứa Thứ Năm đầu tiên). */
export function isoWeek(d: Date): { isoYear: number; week: number } {
  const thursday = addDays(mondayOf(d), 3);
  const isoYear = thursday.getUTCFullYear();
  const jan1 = new Date(Date.UTC(isoYear, 0, 1));
  const week1Monday = mondayOf(jan1);
  const week = Math.round((mondayOf(d).getTime() - week1Monday.getTime()) / (7 * 86400000)) + 1;
  return { isoYear, week };
}

export interface PeriodRange { start: string; end: string }

/** Khoảng ngày của kỳ Tháng/Quý/Năm theo year + period (như hiện tại). */
export function periodRange(kind: "month" | "quarter" | "year", year: number, period: number): PeriodRange {
  if (kind === "month") {
    const start = new Date(Date.UTC(year, period - 1, 1));
    return { start: isoDate(start), end: isoDate(addDays(new Date(Date.UTC(year, period, 1)), -1)) };
  }
  if (kind === "quarter") {
    const start = new Date(Date.UTC(year, (period - 1) * 3, 1));
    return { start: isoDate(start), end: isoDate(addDays(new Date(Date.UTC(year, period * 3, 1)), -1)) };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

/** Kỳ Ngày của một ngày: period = ngày thứ mấy trong năm. */
export function dayPeriod(date: string): { year: number; period: number; range: PeriodRange } {
  const d = parseDate(date);
  const period = Math.round((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1;
  return { year: d.getUTCFullYear(), period, range: { start: date, end: date } };
}

/** Kỳ Tuần chứa một ngày: year = năm ISO của tuần, period = số tuần ISO. */
export function weekPeriod(date: string): { year: number; period: number; range: PeriodRange } {
  const mon = mondayOf(parseDate(date));
  const { isoYear, week } = isoWeek(mon);
  return { year: isoYear, period: week, range: { start: isoDate(mon), end: isoDate(addDays(mon, 6)) } };
}

/** Khoảng ngày từ (kind, year, period) đã lưu — kể cả day/week. */
export function storedRange(kind: PeriodKind, year: number, period: number): PeriodRange {
  if (kind === "day") return { start: isoDate(addDays(new Date(Date.UTC(year, 0, 1)), period - 1)), end: isoDate(addDays(new Date(Date.UTC(year, 0, 1)), period - 1)) };
  if (kind === "week") {
    const jan1 = new Date(Date.UTC(year, 0, 1));
    const mon = addDays(mondayOf(jan1), (period - 1) * 7);
    return { start: isoDate(mon), end: isoDate(addDays(mon, 6)) };
  }
  return periodRange(kind, year, period);
}

/** Nhãn ngắn của kỳ: "02/11/2026", "Tuần 45 (02/11–08/11/2026)", "Tháng 11/2026", "Quý 4/2026", "Năm 2026". */
export function periodLabel(kind: PeriodKind, year: number, period: number): string {
  const r = storedRange(kind, year, period);
  const f = (s: string) => s.split("-").reverse().join("/");
  if (kind === "day") return f(r.start);
  if (kind === "week") return `Tuần ${period}/${year} (${f(r.start)}–${f(r.end)})`;
  if (kind === "month") return `Tháng ${period}/${year}`;
  if (kind === "quarter") return `Quý ${period}/${year}`;
  return `Năm ${year}`;
}

/** Tuần giao tháng/năm: tách khoảng tuần thành các đoạn theo tháng (dùng cho phân bổ thực tế). */
export function weekSegments(weekStart: string): { from: string; to: string }[] {
  const start = parseDate(weekStart);
  const end = addDays(start, 6);
  const segs: { from: string; to: string }[] = [];
  let cur = start;
  while (cur <= end) {
    const monthEnd = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
    const segEnd = addDays(monthEnd, -1) < end ? addDays(monthEnd, -1) : end;
    segs.push({ from: isoDate(cur), to: isoDate(segEnd) });
    cur = addDays(segEnd, 1);
  }
  return segs;
}

/** Tuần có giao tháng (hoặc giao năm) không. */
export function weekCrossesMonth(weekStart: string): boolean {
  return weekSegments(weekStart).length > 1;
}

/** Kỳ tiếp theo cùng chu kỳ. */
export function nextPeriod(kind: PeriodKind, year: number, period: number): { year: number; period: number } {
  const max = kind === "month" ? 12 : kind === "quarter" ? 4 : kind === "year" ? 1 : kind === "week" ? 53 : 366;
  if (period < max && !(kind === "week" && period === 53 && isoWeek(new Date(Date.UTC(year, 11, 28))).week === 52) && !(kind === "day" && period === 366)) {
    // Năm 52 tuần: tuần 53 không tồn tại; năm không nhuận: ngày 366 không tồn tại.
    if (kind === "day" && period === 365 && !isLeap(year)) return { year: year + 1, period: 1 };
    return { year, period: period + 1 };
  }
  return { year: year + 1, period: 1 };
}
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** Kỳ chứa một ngày theo chu kỳ. */
export function periodOfDate(cycle: ReportCycle, date: string): { year: number; period: number; range: PeriodRange } {
  const d = parseDate(date);
  if (cycle === "day") return dayPeriod(date);
  if (cycle === "week") return weekPeriod(date);
  if (cycle === "month") return { year: d.getUTCFullYear(), period: d.getUTCMonth() + 1, range: periodRange("month", d.getUTCFullYear(), d.getUTCMonth() + 1) };
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return { year: d.getUTCFullYear(), period: q, range: periodRange("quarter", d.getUTCFullYear(), q) };
}

/** Các kỳ sắp tới để xem trước; chế độ Ngày có thể bỏ qua ngày nghỉ theo lịch (workdays: ISO dow → true). */
export function upcomingPeriods(cycle: ReportCycle, fromDate: string, count: number, workdays?: Record<string, boolean> | null): { year: number; period: number; range: PeriodRange }[] {
  const out: { year: number; period: number; range: PeriodRange }[] = [];
  let cur = periodOfDate(cycle, fromDate);
  let guard = 0;
  while (out.length < count && guard++ < 800) {
    if (cycle === "day" && workdays && !workdays[String(isoDow(parseDate(cur.range.start)))]) {
      cur = dayPeriod(isoDate(addDays(parseDate(cur.range.start), 1)));
      continue;
    }
    out.push(cur);
    if (cycle === "day") cur = dayPeriod(isoDate(addDays(parseDate(cur.range.start), 1)));
    else if (cycle === "week") cur = weekPeriod(isoDate(addDays(parseDate(cur.range.start), 7)));
    else {
      const n = nextPeriod(cycle, cur.year, cur.period);
      cur = { ...n, range: periodRange(cycle, n.year, n.period) };
    }
  }
  return out;
}
