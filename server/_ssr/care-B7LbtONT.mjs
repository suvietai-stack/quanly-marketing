const DEFAULT_CARE = { waitHours: 24, staleDays: 3 };
const H = 36e5;
function lastCareActivity(s, notes) {
  if (!s.assigned_to || !s.assigned_at) return null;
  let t = new Date(s.assigned_at).getTime();
  for (const n of notes) {
    if (n.author_id !== s.assigned_to) continue;
    const nt = new Date(n.created_at).getTime();
    if (nt > t) t = nt;
  }
  return t;
}
function careFlag(s, notes, now = Date.now(), cfg = DEFAULT_CARE) {
  if (!s.assigned_to || !s.assigned_at || s.cancelled_at || !s.status) return null;
  const last = lastCareActivity(s, notes);
  if (last == null) return null;
  if (s.status === "waiting") return now - new Date(s.assigned_at).getTime() > cfg.waitHours * H ? "unaccepted" : null;
  return null;
}
function countCare(flags) {
  const c = { unaccepted: 0, stale_contact: 0, stale_quote: 0, total: 0 };
  for (const f of flags) if (f) {
    c[f]++;
    c.total++;
  }
  return c;
}
function careMessage(name, c) {
  return [
    "NHẮC CHĂM SÓC TÍN HIỆU",
    "",
    `Chào ${name}!`,
    "",
    `Bạn có ${c.total} tín hiệu cần kiểm tra:`,
    "",
    `🔴 Chưa tiếp nhận: ${c.unaccepted}`
  ].join("\n");
}
export {
  DEFAULT_CARE,
  careFlag,
  careMessage,
  countCare,
  lastCareActivity
};
