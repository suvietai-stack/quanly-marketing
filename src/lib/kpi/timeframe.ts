/** Khung thời gian KPI (Tuần/Tháng/Quý/Năm/Tùy chỉnh) — mọi ngày tính theo múi giờ Việt Nam (UTC+7), tuần từ thứ Hai đến Chủ nhật. */
import type { KpiPeriodType } from "./types";

export const TIMEFRAMES: [KpiPeriodType, string][] = [["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"], ["custom", "Tùy chỉnh"]];
export const TIMEFRAME_LABEL: Record<KpiPeriodType, string> = Object.fromEntries(TIMEFRAMES) as Record<KpiPeriodType, string>;

const p2 = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => { const x = new Date(Date.UTC(y, m - 1, d)); return `${x.getUTCFullYear()}-${p2(x.getUTCMonth() + 1)}-${p2(x.getUTCDate())}`; };
const parts = (s: string) => s.split("-").map(Number) as [number, number, number];

/** Ngày hôm nay (YYYY-MM-DD) theo giờ Việt Nam, bất kể múi giờ của máy. */
export function vnToday(now = new Date()): string {
  const x = new Date(now.getTime() + 7 * 3600_000);
  return `${x.getUTCFullYear()}-${p2(x.getUTCMonth() + 1)}-${p2(x.getUTCDate())}`;
}
export function addDays(s: string, n: number): string { const [y, m, d] = parts(s); return iso(y, m, d + n); }

/** Khoảng [bắt đầu, kết thúc] của khung chứa ngày `anchor` (YYYY-MM-DD). "custom" trả về tháng chứa anchor làm gợi ý. */
export function rangeOf(t: KpiPeriodType, anchor = vnToday()): [string, string] {
  const [y, m, d] = parts(anchor);
  if (t === "week") { const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; const s = iso(y, m, d - dow); return [s, addDays(s, 6)]; }
  if (t === "quarter") { const q = Math.floor((m - 1) / 3); return [iso(y, q * 3 + 1, 1), iso(y, q * 3 + 4, 0)]; }
  if (t === "year") return [`${y}-01-01`, `${y}-12-31`];
  return [iso(y, m, 1), iso(y, m + 1, 0)];
}

/** Dịch khung sang kỳ trước/sau `k` bước. */
export function shiftRange(t: KpiPeriodType, start: string, k: number): [string, string] {
  const [y, m] = parts(start);
  if (t === "week") return rangeOf("week", addDays(start, 7 * k));
  if (t === "quarter") return rangeOf("quarter", iso(y, m + 3 * k, 1));
  if (t === "year") return rangeOf("year", `${y + k}-01-01`);
  return rangeOf("month", iso(y, m + k, 1));
}

export function rangeLabel(t: KpiPeriodType, start: string, end: string): string {
  const [y, m] = parts(start);
  const f = (s: string) => s.split("-").reverse().join("/");
  if (t === "month") return `Tháng ${m}/${y}`;
  if (t === "quarter") return `Quý ${Math.floor((m - 1) / 3) + 1}/${y}`;
  if (t === "year") return `Năm ${y}`;
  if (t === "week") return `Tuần ${f(start).slice(0, 5)} – ${f(end)}`;
  return `${f(start)} → ${f(end)}`;
}

/** Danh sách kỳ để chọn trong bộ lọc (mới nhất trước). */
export function rangeOptions(t: Exclude<KpiPeriodType, "custom">, anchor = vnToday()): { key: string; label: string }[] {
  const n = t === "week" ? 6 : t === "month" ? 6 : t === "quarter" ? 4 : 2;
  const [s0] = rangeOf(t, anchor);
  const out: { key: string; label: string }[] = [];
  for (let k = n; k >= -n; k--) { const [s, e] = shiftRange(t, s0, k); out.push({ key: `${s}|${e}`, label: rangeLabel(t, s, e) }); }
  return out;
}

/** Hai khoảng ngày có giao nhau (bao gồm hai đầu). */
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => aStart <= bEnd && aEnd >= bStart;

/** Kiểm tra thời gian thực hiện + deadline của mục tiêu. Trả về danh sách lỗi (rỗng = hợp lệ). */
export function validateGoalDates(start: string, end: string, deadline: string): string[] {
  const errs: string[] = [];
  const ok = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!ok(start) || !ok(end)) errs.push("Chưa chọn đủ ngày bắt đầu và kết thúc.");
  else if (start > end) errs.push("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
  if (!ok(deadline)) errs.push("Chưa chọn deadline.");
  else if (ok(start) && ok(end) && (deadline < start || deadline > end)) errs.push("Deadline phải nằm trong thời gian thực hiện mục tiêu.");
  return errs;
}
