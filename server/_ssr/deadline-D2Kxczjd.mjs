import { s as storedRange, i as isoDate, a as addDays, b as parseDate, u as upcomingPeriods$1 } from "./documents-RNnMLtSC.mjs";
const VALUE_KIND_LABELS = {
  money: "Tiền tệ (VNĐ)",
  count: "Số lượng"
};
const AGGREGATION_LABELS = {
  sum: "Cộng dồn",
  avg: "Bình quân",
  ratio: "Tỷ lệ"
};
const DIRECTION_LABELS = {
  higher: "Càng cao càng tốt",
  lower: "Càng thấp càng tốt"
};
const LATE_STATUS_LABELS = { pending: "Chờ duyệt", approved: "Được duyệt nộp bù", rejected: "Bị từ chối", used: "Đã nộp bù", expired: "Hết hiệu lực" };
const pad = (n) => String(n).padStart(2, "0");
const monthsOf = (kind) => kind.endsWith("month") ? 1 : kind.endsWith("quarter") ? 3 : 12;
function milestoneAt(kind, rule, year, period) {
  if (kind === "report_day" || kind === "report_week") {
    if (!rule || rule.offset_days === void 0) return null;
    const range = storedRange(kind === "report_day" ? "day" : "week", year, period);
    return `${isoDate(addDays(parseDate(range.end), rule.offset_days))} ${pad(rule.hour ?? 17)}:${pad(rule.minute ?? 0)}`;
  }
  if (!rule || rule.day === void 0 || !Number.isInteger(rule.day) || rule.day < 1 || rule.day > 31) return null;
  const months = monthsOf(kind);
  const offset = rule.offset ?? (rule.phase === "before" ? -1 : rule.phase === "after" ? months : 0);
  const month = (period - 1) * months + offset;
  const base = new Date(Date.UTC(year, month, 1));
  const y = base.getUTCFullYear(), m = base.getUTCMonth();
  const day = Math.min(rule.day, new Date(Date.UTC(y, m + 1, 0)).getUTCDate());
  return `${y}-${pad(m + 1)}-${pad(day)} ${pad(rule.hour ?? 17)}:${pad(rule.minute ?? 0)}`;
}
function milestonesFor(kind, rule, year, period) {
  if (!rule) return { open: null, due: null, late_close: null };
  const key = kind === "report_day" || kind === "report_week" ? storedRange(kind === "report_day" ? "day" : "week", year, period).start : `${year}-${pad(period)}`;
  const ex = rule.exceptions?.[key];
  const text = (v) => typeof v === "string" && v ? v.replace("T", " ") : null;
  if (typeof ex === "string") return { open: null, due: text(ex), late_close: null };
  return {
    open: text(ex?.open) ?? milestoneAt(kind, rule.open, year, period),
    due: text(ex?.due) ?? milestoneAt(kind, rule.due, year, period),
    late_close: text(ex?.late_close) ?? milestoneAt(kind, rule.late_close, year, period)
  };
}
function fmtVN(v) {
  if (!v) return "Không áp dụng";
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(v);
  if (!m) return v;
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}
function phaseFromIso(m, nowIso) {
  if (!m.due) return "none";
  const now = Date.parse(nowIso);
  if (m.open && now < Date.parse(m.open)) return "not_open";
  if (m.late_close && now > Date.parse(m.late_close)) return "closed";
  if (now > Date.parse(m.due)) return "overdue";
  return "open";
}
function milestoneOrderError(kind, rule) {
  const max = monthsOf(kind) === 1 ? 12 : monthsOf(kind) === 3 ? 4 : 1;
  for (let y = 2024; y <= 2028; y++) {
    for (let p = 1; p <= max; p++) {
      const m = milestonesFor(kind, { open: rule.open, due: rule.due, late_close: rule.late_close }, y, p);
      if (m.open && m.due && m.open > m.due) return `Ngày mở nộp không được sau hạn cuối (kiểm tra kỳ ${y}-${pad(p)}).`;
      if (m.due && m.late_close && m.due >= m.late_close) return `Hạn cuối phải trước ngày đóng nộp bù (kiểm tra kỳ ${y}-${pad(p)}).`;
      if (m.open && m.late_close && m.open >= m.late_close) return `Ngày mở nộp phải trước ngày đóng nộp bù (kiểm tra kỳ ${y}-${pad(p)}).`;
    }
  }
  return null;
}
function upcomingPeriods(kind, now = /* @__PURE__ */ new Date()) {
  if (kind === "report_day" || kind === "report_week") return upcomingPeriods$1(kind === "report_day" ? "day" : "week", new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now), 3);
  const vn = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit" }).format(now);
  const [y, mo] = vn.split("-").map(Number);
  const months = monthsOf(kind);
  const periodIndex = months === 1 ? mo - 1 : months === 3 ? Math.floor((mo - 1) / 3) : 0;
  const max = 12 / months;
  const out = [];
  for (let i = 0; i < 3; i++) {
    const idx = periodIndex + i;
    out.push({ year: y + Math.floor(idx / max), period: idx % max + 1 });
  }
  return out;
}
export {
  AGGREGATION_LABELS as A,
  DIRECTION_LABELS as D,
  LATE_STATUS_LABELS as L,
  VALUE_KIND_LABELS as V,
  milestoneOrderError as a,
  fmtVN as f,
  milestonesFor as m,
  phaseFromIso as p,
  upcomingPeriods as u
};
