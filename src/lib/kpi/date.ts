/**
 * KPI V2 — date helpers (pure). Mọi so sánh kỳ dùng khóa ngày YYYY-MM-DD theo giờ Việt Nam.
 */
const VN_TZ = "Asia/Ho_Chi_Minh";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Chuyển ISO datetime / YYYY-MM-DD thành YYYY-MM-DD (giờ VN). Trả null nếu không hợp lệ. */
export function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (DATE_ONLY.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  // en-CA cho định dạng YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

/** periodStart / periodEnd inclusive. */
export function isWithinPeriod(value: string | null | undefined, periodStart: string, periodEnd: string): boolean {
  const k = toDateKey(value);
  const s = toDateKey(periodStart);
  const e = toDateKey(periodEnd);
  if (!k || !s || !e) return false;
  return k >= s && k <= e;
}

/** So sánh thời điểm (ISO) — dùng để sắp xếp history. */
export function timeOf(value: string | null | undefined): number {
  if (!value) return Number.NaN;
  const t = new Date(value).getTime();
  return t;
}
