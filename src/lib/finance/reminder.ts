// Lịch nhắc xác nhận Tiền Về — thuần, dùng chung cho scheduler (máy chủ) và giao diện.
// Giờ Việt Nam cố định UTC+7 (không có giờ mùa hè). Ngày: 0 = Chủ nhật … 6 = Thứ Bảy.

export type ReminderCfg = { enabled: boolean; interval_min: number; start_hour: number; end_hour: number; workdays: number[]; max_auto: number };
export const DEFAULT_REMINDER: ReminderCfg = { enabled: true, interval_min: 30, start_hour: 8, end_hour: 17, workdays: [1, 2, 3, 4, 5, 6], max_auto: 5 };

const VN = 7 * 3600_000, DAY = 86400_000, MIN = 60_000;
const vnDay = (ms: number) => Math.floor((ms + VN) / DAY); // số ngày theo lịch VN
const dow = (day: number) => (day + 4) % 7; // 1970-01-01 là Thứ Năm
const at = (day: number, hour: number) => day * DAY + hour * 3600_000 - VN;

export function isWorkTime(ms: number, c: ReminderCfg) {
  const d = vnDay(ms);
  return c.workdays.includes(dow(d)) && ms >= at(d, c.start_hour) && ms < at(d, c.end_hour);
}

/** Cộng `minutes` phút làm việc vào mốc `fromMs`, bỏ qua ngoài giờ và ngày nghỉ. */
export function addWorkMinutes(fromMs: number, minutes: number, c: ReminderCfg): number {
  if (!c.workdays.length) return Infinity;
  let left = minutes * MIN, cur = fromMs;
  for (let d = vnDay(cur), guard = 0; guard < 400; d++, guard++) {
    if (!c.workdays.includes(dow(d))) continue;
    const s = Math.max(cur, at(d, c.start_hour)), e = at(d, c.end_hour);
    if (s >= e) continue;
    if (s + left <= e && left > 0) return s + left;
    if (left === 0) return s;
    left -= e - s;
    cur = e;
  }
  return Infinity;
}

/** Số phút làm việc giữa hai mốc (để hiển thị thời gian chờ). */
export function workMinutesBetween(fromMs: number, toMs: number, c: ReminderCfg) {
  let total = 0;
  for (let d = vnDay(fromMs); d <= vnDay(toMs); d++) {
    if (!c.workdays.includes(dow(d))) continue;
    const s = Math.max(fromMs, at(d, c.start_hour)), e = Math.min(toMs, at(d, c.end_hour));
    if (e > s) total += e - s;
  }
  return Math.floor(total / MIN);
}

export type AutoState = { autoCount: number; lastAutoAt: number | null; baseAt: number };
/**
 * Lần nhắc tự động tiếp theo cần gửi ngay bây giờ (số thứ tự), hoặc null.
 * Mốc tính từ lần nhắc gần nhất thực sự đã gửi (hoặc thông báo gốc) → scheduler chạy trễ
 * cũng chỉ gửi đúng một lần, không gửi bù hàng loạt.
 */
export function dueAutoSeq(s: AutoState, nowMs: number, c: ReminderCfg): number | null {
  if (!c.enabled || s.autoCount >= c.max_auto) return null;
  if (!isWorkTime(nowMs, c)) return null;
  const due = addWorkMinutes(s.lastAutoAt ?? s.baseAt, c.interval_min, c);
  return nowMs >= due ? s.autoCount + 1 : null;
}

export function fmtWait(mins: number) {
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}
