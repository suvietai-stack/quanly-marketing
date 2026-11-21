const TIMEFRAMES = [["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"], ["custom", "Tùy chỉnh"]];
Object.fromEntries(TIMEFRAMES);
const p2 = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => {
  const x = new Date(Date.UTC(y, m - 1, d));
  return `${x.getUTCFullYear()}-${p2(x.getUTCMonth() + 1)}-${p2(x.getUTCDate())}`;
};
const parts = (s) => s.split("-").map(Number);
function vnToday(now = /* @__PURE__ */ new Date()) {
  const x = new Date(now.getTime() + 7 * 36e5);
  return `${x.getUTCFullYear()}-${p2(x.getUTCMonth() + 1)}-${p2(x.getUTCDate())}`;
}
function addDays(s, n) {
  const [y, m, d] = parts(s);
  return iso(y, m, d + n);
}
function rangeOf(t, anchor = vnToday()) {
  const [y, m, d] = parts(anchor);
  if (t === "week") {
    const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    const s = iso(y, m, d - dow);
    return [s, addDays(s, 6)];
  }
  if (t === "quarter") {
    const q = Math.floor((m - 1) / 3);
    return [iso(y, q * 3 + 1, 1), iso(y, q * 3 + 4, 0)];
  }
  if (t === "year") return [`${y}-01-01`, `${y}-12-31`];
  return [iso(y, m, 1), iso(y, m + 1, 0)];
}
function shiftRange(t, start, k) {
  const [y, m] = parts(start);
  if (t === "week") return rangeOf("week", addDays(start, 7 * k));
  if (t === "quarter") return rangeOf("quarter", iso(y, m + 3 * k, 1));
  if (t === "year") return rangeOf("year", `${y + k}-01-01`);
  return rangeOf("month", iso(y, m + k, 1));
}
function rangeLabel(t, start, end) {
  const [y, m] = parts(start);
  const f = (s) => s.split("-").reverse().join("/");
  if (t === "month") return `Tháng ${m}/${y}`;
  if (t === "quarter") return `Quý ${Math.floor((m - 1) / 3) + 1}/${y}`;
  if (t === "year") return `Năm ${y}`;
  if (t === "week") return `Tuần ${f(start).slice(0, 5)} – ${f(end)}`;
  return `${f(start)} → ${f(end)}`;
}
function rangeOptions(t, anchor = vnToday()) {
  const n = t === "week" ? 6 : t === "month" ? 6 : t === "quarter" ? 4 : 2;
  const [s0] = rangeOf(t, anchor);
  const out = [];
  for (let k = n; k >= -n; k--) {
    const [s, e] = shiftRange(t, s0, k);
    out.push({ key: `${s}|${e}`, label: rangeLabel(t, s, e) });
  }
  return out;
}
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart <= bEnd && aEnd >= bStart;
function validateGoalDates(start, end, deadline) {
  const errs = [];
  const ok = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!ok(start) || !ok(end)) errs.push("Chưa chọn đủ ngày bắt đầu và kết thúc.");
  else if (start > end) errs.push("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
  if (!ok(deadline)) errs.push("Chưa chọn deadline.");
  else if (ok(start) && ok(end) && (deadline < start || deadline > end)) errs.push("Deadline phải nằm trong thời gian thực hiện mục tiêu.");
  return errs;
}
export {
  TIMEFRAMES as T,
  addDays as a,
  rangeOptions as b,
  rangeLabel as c,
  validateGoalDates as d,
  overlaps as o,
  rangeOf as r,
  shiftRange as s,
  vnToday as v
};
