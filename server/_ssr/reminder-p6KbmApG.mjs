const DEFAULT_REMINDER = { enabled: true, interval_min: 30, start_hour: 8, end_hour: 17, workdays: [1, 2, 3, 4, 5, 6], max_auto: 5 };
const VN = 7 * 36e5, DAY = 864e5, MIN = 6e4;
const vnDay = (ms) => Math.floor((ms + VN) / DAY);
const dow = (day) => (day + 4) % 7;
const at = (day, hour) => day * DAY + hour * 36e5 - VN;
function isWorkTime(ms, c) {
  const d = vnDay(ms);
  return c.workdays.includes(dow(d)) && ms >= at(d, c.start_hour) && ms < at(d, c.end_hour);
}
function addWorkMinutes(fromMs, minutes, c) {
  if (!c.workdays.length) return Infinity;
  let left = minutes * MIN, cur = fromMs;
  for (let d = vnDay(cur), guard = 0; guard < 400; d++, guard++) {
    if (!c.workdays.includes(dow(d))) continue;
    const s = Math.max(cur, at(d, c.start_hour)), e = at(d, c.end_hour);
    if (s >= e) continue;
    if (s + left < e && left > 0) return s + left;
    if (left === 0) return s;
    left -= e - s;
    cur = e;
  }
  return Infinity;
}
function dueAutoSeq(s, nowMs, c) {
  if (!c.enabled || s.autoCount >= c.max_auto) return null;
  if (!isWorkTime(nowMs, c)) return null;
  const due = addWorkMinutes(s.lastAutoAt ?? s.baseAt, c.interval_min, c);
  return nowMs >= due ? s.autoCount + 1 : null;
}
function fmtWait(mins) {
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}
export {
  DEFAULT_REMINDER as D,
  dueAutoSeq as d,
  fmtWait as f
};
