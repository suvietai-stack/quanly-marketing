const TZ_OFFSET_MIN = 7 * 60;
const DOW_LABEL = ["", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];
const HALF_LABEL = { am: "Sáng", pm: "Chiều" };
const TYPE_LABEL = { leave: "Nghỉ phép", late: "Đi muộn", early: "Về sớm" };
function vnAt(date, hm) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = hm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - TZ_OFFSET_MIN * 6e4);
}
function isoDow(date) {
  const [y, m, d] = date.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return w === 0 ? 7 : w;
}
function addDays(date, n) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function fmtVn(t, withDate = true) {
  const x = new Date(new Date(t).getTime() + TZ_OFFSET_MIN * 6e4);
  const p = (n) => String(n).padStart(2, "0");
  const hm = `${p(x.getUTCHours())}:${p(x.getUTCMinutes())}`;
  return withDate ? `${hm} ngày ${p(x.getUTCDate())}/${p(x.getUTCMonth() + 1)}/${x.getUTCFullYear()}` : hm;
}
function fmtDate(date) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}
function todayVn(now = /* @__PURE__ */ new Date()) {
  return new Date(now.getTime() + TZ_OFFSET_MIN * 6e4).toISOString().slice(0, 10);
}
const fmtDays = (n) => String(n).replace(".", ",");
function isHoliday(s, date) {
  return (s.holidays || []).some((h) => h.date === date);
}
function works(s, date, half) {
  return !isHoliday(s, date) && !!s.schedule?.[String(isoDow(date))]?.[half];
}
function evalLeave(s, p) {
  const { start_date: d1, end_date: d2, start_half: h1, end_half: h2 } = p;
  if (!d1 || !d2 || !h1 || !h2) return { ok: false, error: "Vui lòng chọn đủ ngày và buổi bắt đầu/kết thúc." };
  if (d2 < d1 || d2 === d1 && h1 === "pm" && h2 === "am") return { ok: false, error: "Thời điểm kết thúc phải sau thời điểm bắt đầu." };
  const sv = s.session_value ?? 0.5;
  let cnt = 0;
  let mark = null;
  const details = [];
  for (let d = d1, i = 0; d <= d2 && i < 400; d = addDays(d, 1), i++) {
    const am = works(s, d, "am") && (d > d1 || h1 === "am");
    const pm = works(s, d, "pm") && (d < d2 || h2 === "pm");
    if (!am && !pm) continue;
    cnt += Number(am) + Number(pm);
    details.push({ date: d, am, pm, days: (Number(am) + Number(pm)) * sv });
    if (!mark) {
      const half = am ? "am" : "pm";
      const st = s.sessions?.[half]?.start;
      if (!st) return { ok: false, error: `Chưa cấu hình giờ bắt đầu buổi ${half === "am" ? "sáng" : "chiều"} trong Cài đặt → Đơn từ & Phê duyệt. Vui lòng liên hệ Hành chính.` };
      mark = vnAt(d, st);
    }
  }
  if (!cnt || !mark) return { ok: false, error: "Khoảng thời gian đã chọn không có buổi làm việc nào theo lịch của công ty." };
  return { ok: true, markAt: mark, days: cnt * sv, details };
}
function evalShift(s, type, p) {
  const { date, half, minutes } = p;
  if (!date || !half) return { ok: false, error: "Vui lòng chọn ngày và buổi làm việc." };
  if (!minutes || minutes < 1 || minutes > 480) return { ok: false, error: "Số phút phải từ 1 đến 480." };
  if (!works(s, date, half)) return { ok: false, error: "Buổi đã chọn không phải buổi làm việc theo lịch của công ty." };
  const st = s.sessions?.[half]?.start;
  const en = s.sessions?.[half]?.end;
  if (!st || !en) return { ok: false, error: `Chưa cấu hình giờ bắt đầu/kết thúc buổi ${half === "am" ? "sáng" : "chiều"} trong Cài đặt. Vui lòng liên hệ Hành chính.` };
  const start = vnAt(date, st);
  const end = vnAt(date, en);
  if (type === "late") {
    const exp2 = new Date(start.getTime() + minutes * 6e4);
    if (exp2 >= end) return { ok: false, error: `Thời gian đi muộn vượt quá giờ kết thúc buổi (${en}). Hãy tạo đơn nghỉ phép.` };
    return { ok: true, markAt: start, minutes, expectedAt: exp2, sessionStart: st, sessionEnd: en };
  }
  const exp = new Date(end.getTime() - minutes * 6e4);
  if (exp <= start) return { ok: false, error: `Thời gian về sớm vượt quá giờ bắt đầu buổi (${st}). Hãy tạo đơn nghỉ phép.` };
  return { ok: true, markAt: exp, minutes, expectedAt: exp, sessionStart: st, sessionEnd: en };
}
function evaluate(s, type, p) {
  return type === "leave" ? evalLeave(s, p) : evalShift(s, type, p);
}
function deadlineOf(s, type, mark) {
  const d = s.deadlines;
  const mins = type === "leave" ? (d?.leave_hours ?? 12) * 60 : type === "late" ? d?.late_minutes ?? 5 : d?.early_minutes ?? 5;
  return new Date(mark.getTime() - mins * 6e4);
}
function deadlineRule(s, type) {
  const d = s.deadlines;
  if (type === "leave") return `đơn nghỉ phép phải được gửi trước ít nhất ${d.leave_hours} giờ`;
  if (type === "late") return `đơn đi muộn phải được gửi trước giờ bắt đầu ca ít nhất ${d.late_minutes} phút`;
  return `đơn về sớm phải được gửi trước giờ dự kiến ra về ít nhất ${d.early_minutes} phút`;
}
function lastWorkingHalf(s, date) {
  if (works(s, date, "pm")) return "pm";
  if (works(s, date, "am")) return "am";
  return null;
}
function firstWorkingHalf(s, date) {
  if (works(s, date, "am")) return "am";
  if (works(s, date, "pm")) return "pm";
  return null;
}
export {
  DOW_LABEL as D,
  HALF_LABEL as H,
  TYPE_LABEL as T,
  fmtDate as a,
  fmtDays as b,
  addDays as c,
  firstWorkingHalf as d,
  evaluate as e,
  fmtVn as f,
  deadlineOf as g,
  deadlineRule as h,
  isoDow as i,
  lastWorkingHalf as l,
  todayVn as t
};
