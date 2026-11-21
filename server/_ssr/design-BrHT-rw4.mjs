const DESIGN_FLOWS = [
  { key: "photo", label: "Chụp ảnh", path: "/design/photo" },
  { key: "marketing_design", label: "Ấn phẩm Marketing", path: "/design/marketing" },
  { key: "order_mockup", label: "Ma-két đơn hàng", path: "/design/mockups" }
];
const designLabel = (flow) => DESIGN_FLOWS.find((f) => f.key === flow)?.label || "Chưa phân loại luồng";
function designCan(can, flow, action) {
  const restricted = DESIGN_FLOWS.some((f) => can(`order.${f.key}.${action}`));
  return restricted ? !!flow && can(`order.${flow}.${action}`) : can(`order.${action}`);
}
const designAny = (can, action) => can(`order.${action}`) || DESIGN_FLOWS.some((f) => can(`order.${f.key}.${action}`));
function selectedDesignAssigneeId(entries, storedId, storedName) {
  if (storedId) return storedId;
  if (!storedName) return "_";
  const matches = entries.filter((person) => person.name === storedName);
  return matches.length === 1 ? matches[0].user_id : "_";
}
const time = (value) => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : void 0;
function eventTime(o, status, field) {
  const explicit = field ? time(o[field]) : void 0;
  const events = (o.history || []).filter((h) => h.toStatus === status).map((h) => time(h.at)).filter((x) => x !== void 0);
  return explicit ?? (events.length ? Math.max(...events) : void 0);
}
const createdTime = (o) => time(o.recordCreatedAt) ?? time(o.history?.[0]?.at);
const completionTime = (o) => eventTime(o, "Hoàn thành", "completedAt");
const deadlineTime = (o) => o.deadline ? time(`${o.deadline}T23:59:59.999+07:00`) : void 0;
function statusAt(o, at) {
  const hs = (o.history || []).filter((h) => time(h.at) !== void 0 && (time(h.at) ?? Infinity) <= at && h.toStatus).sort((a, b) => (time(a.at) ?? 0) - (time(b.at) ?? 0));
  const last = hs.at(-1)?.toStatus;
  if (last) return last;
  if ((time(o.recordUpdatedAt) ?? Infinity) <= at) return o.status;
  return void 0;
}
const designOverdue = (o, at = Date.now()) => {
  const due = deadlineTime(o);
  const st = statusAt(o, at) ?? (at >= Date.now() - 1e3 ? o.status : void 0);
  return due !== void 0 && due < at && st !== void 0 && st !== "Hoàn thành" && st !== "Đã hủy";
};
function designRange(key, from = "", to = "", now = Date.now()) {
  const vn = new Date(now + 7 * 36e5);
  const y = vn.getUTCFullYear(), m = vn.getUTCMonth(), d = vn.getUTCDate();
  if (key === "all") return { from: -Infinity, to: now };
  if (key === "custom") return { from: time(`${from}T00:00:00+07:00`) ?? -Infinity, to: Math.min(time(`${to}T23:59:59.999+07:00`) ?? now, now) };
  const first = key === "year" ? Date.UTC(y, 0, 1) : key === "quarter" ? Date.UTC(y, Math.floor(m / 3) * 3, 1) : key === "month" ? Date.UTC(y, m, 1) : key === "week" ? Date.UTC(y, m, d - (vn.getUTCDay() + 6) % 7) : Date.UTC(y, m, d);
  return { from: first - 7 * 36e5, to: now };
}
function designStats(input, range) {
  const unique = [...new Map(input.map((o) => [o.id, o])).values()];
  const inRange = (n) => n !== void 0 && n >= range.from && n <= range.to;
  const existing = unique.filter((o) => {
    const n = createdTime(o);
    return n !== void 0 ? n <= range.to : range.from === -Infinity;
  });
  const created = unique.filter((o) => inRange(createdTime(o)));
  const completed = unique.filter((o) => inRange(completionTime(o)) && statusAt(o, range.to) === "Hoàn thành");
  const eligible = completed.filter((o) => deadlineTime(o) !== void 0);
  const onTime = eligible.filter((o) => (completionTime(o) ?? Infinity) <= (deadlineTime(o) ?? -Infinity));
  const durations = completed.map((o) => {
    const start = eventTime(o, "Đang thực hiện", "takenAt"), end = completionTime(o);
    return start !== void 0 && end !== void 0 && end >= start ? (end - start) / 1e3 : void 0;
  }).filter((n) => n !== void 0);
  const overdue = existing.filter((o) => designOverdue(o, range.to));
  return { existing, created, completed, eligible, onTime, overdue, onTimeRate: eligible.length ? onTime.length / eligible.length * 100 : void 0, averageSeconds: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : void 0, durationCount: durations.length, missingCreated: unique.filter((o) => createdTime(o) === void 0).length };
}
function formatSeconds(n) {
  if (n === void 0) return "—";
  const s = Math.round(n);
  return `${Math.floor(s / 86400)} ngày ${String(Math.floor(s / 3600) % 24).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
export {
  DESIGN_FLOWS as D,
  deadlineTime as a,
  designAny as b,
  createdTime as c,
  designOverdue as d,
  designCan as e,
  designLabel as f,
  designRange as g,
  designStats as h,
  completionTime as i,
  formatSeconds as j,
  selectedDesignAssigneeId as k,
  statusAt as s
};
