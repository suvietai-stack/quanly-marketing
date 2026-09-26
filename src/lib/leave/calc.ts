/**
 * Đơn từ — tính toán thuần (xem trước trên giao diện).
 * Backend (private.leave_eval / leave_deadline) kiểm tra lại cùng quy tắc bằng giờ máy chủ.
 * Múi giờ: Asia/Ho_Chi_Minh (UTC+7, không đổi giờ mùa hè).
 */
export type LeaveType = "leave" | "late" | "early";
export type Half = "am" | "pm";

export interface LeaveReason { id: string; name: string; active: boolean }
export interface LeaveSettings {
  schedule: Record<string, { am: boolean; pm: boolean }>; // "1".."7" (ISO, 1 = Thứ Hai)
  sessions: Record<Half, { start: string | null; end: string | null }>;
  session_value: number;
  holidays: { date: string; name?: string }[];
  deadlines: { leave_hours: number; late_minutes: number; early_minutes: number };
  recall_minutes: Record<LeaveType, number>;
  reasons: LeaveReason[];
}

export interface LeavePayload { start_date: string; start_half: Half; end_date: string; end_half: Half }
export interface ShiftPayload { date: string; half: Half; minutes: number }

export type EvalResult =
  | { ok: false; error: string }
  | { ok: true; markAt: Date; days?: number; details?: { date: string; am: boolean; pm: boolean; days: number }[]; minutes?: number; expectedAt?: Date; sessionStart?: string; sessionEnd?: string };

const TZ_OFFSET_MIN = 7 * 60;
export const DOW_LABEL = ["", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];
export const HALF_LABEL: Record<Half, string> = { am: "Sáng", pm: "Chiều" };
export const TYPE_LABEL: Record<LeaveType, string> = { leave: "Nghỉ phép", late: "Đi muộn", early: "Về sớm" };

/** Local VN date + "HH:MM" → Date (instant). */
export function vnAt(date: string, hm: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = hm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - TZ_OFFSET_MIN * 60000);
}
export function isoDow(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return w === 0 ? 7 : w;
}
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
/** Format instant in VN time: "HH:MM ngày DD/MM/YYYY". */
export function fmtVn(t: Date | string, withDate = true): string {
  const x = new Date(new Date(t).getTime() + TZ_OFFSET_MIN * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  const hm = `${p(x.getUTCHours())}:${p(x.getUTCMinutes())}`;
  return withDate ? `${hm} ngày ${p(x.getUTCDate())}/${p(x.getUTCMonth() + 1)}/${x.getUTCFullYear()}` : hm;
}
export function fmtDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}
export function todayVn(now = new Date()): string {
  return new Date(now.getTime() + TZ_OFFSET_MIN * 60000).toISOString().slice(0, 10);
}
export const fmtDays = (n: number) => String(n).replace(".", ",");

function isHoliday(s: LeaveSettings, date: string) {
  return (s.holidays || []).some((h) => h.date === date);
}
export function works(s: LeaveSettings, date: string, half: Half): boolean {
  return !isHoliday(s, date) && !!s.schedule?.[String(isoDow(date))]?.[half];
}

export function evalLeave(s: LeaveSettings, p: Partial<LeavePayload>): EvalResult {
  const { start_date: d1, end_date: d2, start_half: h1, end_half: h2 } = p;
  if (!d1 || !d2 || !h1 || !h2) return { ok: false, error: "Vui lòng chọn đủ ngày và buổi bắt đầu/kết thúc." };
  if (d2 < d1 || (d2 === d1 && h1 === "pm" && h2 === "am")) return { ok: false, error: "Thời điểm kết thúc phải sau thời điểm bắt đầu." };
  const sv = s.session_value ?? 0.5;
  let cnt = 0; let mark: Date | null = null;
  const details: { date: string; am: boolean; pm: boolean; days: number }[] = [];
  for (let d = d1, i = 0; d <= d2 && i < 400; d = addDays(d, 1), i++) {
    const am = works(s, d, "am") && (d > d1 || h1 === "am");
    const pm = works(s, d, "pm") && (d < d2 || h2 === "pm");
    if (!am && !pm) continue;
    cnt += Number(am) + Number(pm);
    details.push({ date: d, am, pm, days: (Number(am) + Number(pm)) * sv });
    if (!mark) {
      const half: Half = am ? "am" : "pm";
      const st = s.sessions?.[half]?.start;
      if (!st) return { ok: false, error: `Chưa cấu hình giờ bắt đầu buổi ${half === "am" ? "sáng" : "chiều"} trong Cài đặt → Đơn từ & Phê duyệt. Vui lòng liên hệ Hành chính.` };
      mark = vnAt(d, st);
    }
  }
  if (!cnt || !mark) return { ok: false, error: "Khoảng thời gian đã chọn không có buổi làm việc nào theo lịch của công ty." };
  return { ok: true, markAt: mark, days: cnt * sv, details };
}

export function evalShift(s: LeaveSettings, type: "late" | "early", p: Partial<ShiftPayload>): EvalResult {
  const { date, half, minutes } = p;
  if (!date || !half) return { ok: false, error: "Vui lòng chọn ngày và buổi làm việc." };
  if (!minutes || minutes < 1 || minutes > 480) return { ok: false, error: "Số phút phải từ 1 đến 480." };
  if (!works(s, date, half)) return { ok: false, error: "Buổi đã chọn không phải buổi làm việc theo lịch của công ty." };
  const st = s.sessions?.[half]?.start; const en = s.sessions?.[half]?.end;
  if (!st || !en) return { ok: false, error: `Chưa cấu hình giờ bắt đầu/kết thúc buổi ${half === "am" ? "sáng" : "chiều"} trong Cài đặt. Vui lòng liên hệ Hành chính.` };
  const start = vnAt(date, st); const end = vnAt(date, en);
  if (type === "late") {
    const exp = new Date(start.getTime() + minutes * 60000);
    if (exp >= end) return { ok: false, error: `Thời gian đi muộn vượt quá giờ kết thúc buổi (${en}). Hãy tạo đơn nghỉ phép.` };
    return { ok: true, markAt: start, minutes, expectedAt: exp, sessionStart: st, sessionEnd: en };
  }
  const exp = new Date(end.getTime() - minutes * 60000);
  if (exp <= start) return { ok: false, error: `Thời gian về sớm vượt quá giờ bắt đầu buổi (${st}). Hãy tạo đơn nghỉ phép.` };
  return { ok: true, markAt: exp, minutes, expectedAt: exp, sessionStart: st, sessionEnd: en };
}

export function evaluate(s: LeaveSettings, type: LeaveType, p: any): EvalResult {
  return type === "leave" ? evalLeave(s, p) : evalShift(s, type, p);
}

export function deadlineOf(s: LeaveSettings, type: LeaveType, mark: Date): Date {
  const d = s.deadlines;
  const mins = type === "leave" ? (d?.leave_hours ?? 12) * 60 : type === "late" ? d?.late_minutes ?? 5 : d?.early_minutes ?? 5;
  return new Date(mark.getTime() - mins * 60000);
}

export function deadlineRule(s: LeaveSettings, type: LeaveType): string {
  const d = s.deadlines;
  if (type === "leave") return `đơn nghỉ phép phải được gửi trước ít nhất ${d.leave_hours} giờ`;
  if (type === "late") return `đơn đi muộn phải được gửi trước giờ bắt đầu ca ít nhất ${d.late_minutes} phút`;
  return `đơn về sớm phải được gửi trước giờ dự kiến ra về ít nhất ${d.early_minutes} phút`;
}

/** First working half of a date (for "Về sớm" default = last working half). */
export function lastWorkingHalf(s: LeaveSettings, date: string): Half | null {
  if (works(s, date, "pm")) return "pm";
  if (works(s, date, "am")) return "am";
  return null;
}
export function firstWorkingHalf(s: LeaveSettings, date: string): Half | null {
  if (works(s, date, "am")) return "am";
  if (works(s, date, "pm")) return "pm";
  return null;
}
