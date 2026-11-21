const CYCLE_LABEL = { day: "Ngày", week: "Tuần", month: "Tháng", quarter: "Quý", year: "Năm" };
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parseDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const addDays = (d, n) => new Date(d.getTime() + n * 864e5);
const isoDow = (d) => d.getUTCDay() === 0 ? 7 : d.getUTCDay();
function mondayOf(d) {
  return addDays(d, 1 - isoDow(d));
}
function isoWeek(d) {
  const thursday = addDays(mondayOf(d), 3);
  const isoYear = thursday.getUTCFullYear();
  const jan1 = new Date(Date.UTC(isoYear, 0, 1));
  const firstThursday = addDays(jan1, (4 - isoDow(jan1) + 7) % 7);
  const week1Monday = mondayOf(firstThursday);
  const week = Math.round((mondayOf(d).getTime() - week1Monday.getTime()) / (7 * 864e5)) + 1;
  return { isoYear, week };
}
function periodRange(kind, year, period) {
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
function dayPeriod(date) {
  const d = parseDate(date);
  const period = Math.round((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1;
  return { year: d.getUTCFullYear(), period, range: { start: date, end: date } };
}
function weekPeriod(date) {
  const mon = mondayOf(parseDate(date));
  const { isoYear, week } = isoWeek(mon);
  return { year: isoYear, period: week, range: { start: isoDate(mon), end: isoDate(addDays(mon, 6)) } };
}
function storedRange(kind, year, period) {
  if (kind === "day") return { start: isoDate(addDays(new Date(Date.UTC(year, 0, 1)), period - 1)), end: isoDate(addDays(new Date(Date.UTC(year, 0, 1)), period - 1)) };
  if (kind === "week") {
    const jan1 = new Date(Date.UTC(year, 0, 1));
    const firstThursday = addDays(jan1, (4 - isoDow(jan1) + 7) % 7);
    const mon = addDays(mondayOf(firstThursday), (period - 1) * 7);
    return { start: isoDate(mon), end: isoDate(addDays(mon, 6)) };
  }
  return periodRange(kind, year, period);
}
function periodLabel$1(kind, year, period) {
  const r = storedRange(kind, year, period);
  const f = (s) => s.split("-").reverse().join("/");
  if (kind === "day") return f(r.start);
  if (kind === "week") return `Tuần ${period}/${year} (${f(r.start)}–${f(r.end)})`;
  if (kind === "month") return `Tháng ${period}/${year}`;
  if (kind === "quarter") return `Quý ${period}/${year}`;
  return `Năm ${year}`;
}
function weekSegments(weekStart) {
  const start = parseDate(weekStart);
  const end = addDays(start, 6);
  const segs = [];
  let cur = start;
  while (cur <= end) {
    const monthEnd = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
    const segEnd = addDays(monthEnd, -1) < end ? addDays(monthEnd, -1) : end;
    segs.push({ from: isoDate(cur), to: isoDate(segEnd) });
    cur = addDays(segEnd, 1);
  }
  return segs;
}
function nextPeriod(kind, year, period) {
  const max = kind === "month" ? 12 : kind === "quarter" ? 4 : kind === "year" ? 1 : kind === "week" ? 53 : 366;
  if (period < max && !(kind === "week" && period === 53 && isoWeek(new Date(Date.UTC(year, 11, 28))).week === 52) && !(kind === "day" && period === 366)) {
    if (kind === "day" && period === 365 && !isLeap(year)) return { year: year + 1, period: 1 };
    return { year, period: period + 1 };
  }
  return { year: year + 1, period: 1 };
}
const isLeap = (y) => y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;
function periodOfDate(cycle, date) {
  const d = parseDate(date);
  if (cycle === "day") return dayPeriod(date);
  if (cycle === "week") return weekPeriod(date);
  if (cycle === "month") return { year: d.getUTCFullYear(), period: d.getUTCMonth() + 1, range: periodRange("month", d.getUTCFullYear(), d.getUTCMonth() + 1) };
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return { year: d.getUTCFullYear(), period: q, range: periodRange("quarter", d.getUTCFullYear(), q) };
}
function upcomingPeriods(cycle, fromDate, count, workdays) {
  const out = [];
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
function myWorkRank(row) {
  if (row.version_status === "changes") return 0;
  if (row.phase === "overdue") return row.late_status === "approved" ? 1 : row.late_status === "pending" ? 2 : 3;
  if (row.phase === "open" && !row.first_submitted_at) return 4;
  if (row.phase === "not_open") return 5;
  return 6;
}
const VIEW_STATUS = { none: "Chưa có tài liệu", unopened: "Chưa mở", opened: "Đã mở", new_version: "Có bản mới" };
function viewTone(status) {
  return status === "opened" ? "text-primary border-primary/40" : status === "none" ? "text-muted-foreground" : "text-warning border-warning/40";
}
function manageRank(row) {
  const status = row.document?.versions.at(-1)?.status;
  const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now);
  if (row.my_view === "unopened" && row.document?.first_submitted_at) return 0;
  if (row.my_view === "new_version") return 1;
  if (status === "changes") return 2;
  if (time === "overdue") return 3;
  return 4;
}
const DOC_STATUS = { draft: "Bản nháp", pending: "Đang đề nghị điều chỉnh", changes: "Điều chỉnh cần bổ sung", approved: "Đã nộp" };
const PLAN_STATUS = { draft: "Bản nháp", pending: "Đã nộp", changes: "Cần chỉnh sửa", resubmitted: "Đã nộp lại", approved: "Đã nộp" };
function docStatusLabel(kind, status) {
  if (!status) return "Chưa nộp";
  return (kind === "plan" ? PLAN_STATUS : DOC_STATUS)[status] ?? status;
}
const TIME_STATUS = { none: "Chưa cấu hình deadline", upcoming: "Chưa đến hạn", soon: "Sắp đến hạn", ontime: "Đúng hạn", late: "Nộp muộn", overdue: "Quá hạn chưa nộp" };
function deadlineStatus(deadline, first, now) {
  if (!deadline) return "none";
  const end = Date.parse(deadline);
  if (first) return Date.parse(first) <= end ? "ontime" : "late";
  const left = end - Date.parse(now);
  return left < 0 ? "overdue" : left <= 864e5 ? "soon" : "upcoming";
}
function googleDocsOk(url) {
  return /^https:\/\/docs\.google\.com\/document\/d\/[A-Za-z0-9_-]+(\/(edit|view|preview))?(\?[A-Za-z0-9_=&%.-]*)?(#[A-Za-z0-9_=&%.-]*)?$/.test(url.trim());
}
function attachmentUrlOk(url) {
  return /^https:\/\/\S{1,2000}$/.test(url.trim());
}
function periodLabel(kind, year, period) {
  return periodLabel$1(kind, year, period);
}
function metricPercent(item) {
  if (item.actual === null || item.target === null || item.definition.direction !== "higher" || Number(item.target) <= 0) return null;
  return Number(item.actual) / Number(item.target) * 100;
}
function numberText(value) {
  if (value === null || value === void 0) return "—";
  if (/^-?\d+$/.test(value)) return BigInt(value).toLocaleString("vi-VN");
  return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}
function progressTone(item) {
  const p = metricPercent(item);
  return item.actual === null ? "text-muted-foreground" : !item.complete && item.complete !== void 0 ? "text-warning" : p === null ? "text-muted-foreground" : p >= 100 ? "text-success" : "text-warning";
}
export {
  CYCLE_LABEL as C,
  DOC_STATUS as D,
  TIME_STATUS as T,
  VIEW_STATUS as V,
  addDays as a,
  parseDate as b,
  manageRank as c,
  docStatusLabel as d,
  dayPeriod as e,
  periodOfDate as f,
  googleDocsOk as g,
  deadlineStatus as h,
  isoDate as i,
  myWorkRank as j,
  weekSegments as k,
  attachmentUrlOk as l,
  metricPercent as m,
  numberText as n,
  progressTone as o,
  periodLabel as p,
  storedRange as s,
  upcomingPeriods as u,
  viewTone as v,
  weekPeriod as w
};
