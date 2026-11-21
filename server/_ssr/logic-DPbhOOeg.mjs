const KIND_LABEL = {
  intake: "Tiếp nhận đơn hàng",
  blank: "Đặt phôi",
  box: "Đặt hộp",
  proc: "In ấn & Gia công",
  packing: "Đóng gói",
  delivery: "Giao hàng"
};
const TASK_STATUS = { todo: "Chưa thực hiện", doing: "Đang xử lý", waiting: "Chờ nhà cung cấp", done: "Hoàn thành", skipped: "Bỏ qua" };
const ORDER_STATUS = { new: "Chưa tiếp nhận", in_progress: "Đang thực hiện", done: "Hoàn tất", cancelled: "Đã hủy" };
const ORDER_TYPE = { sample: "Đơn mẫu", mass: "Sản xuất" };
const PROC_TYPE = { print: "In ấn", gold: "Kẻ vàng", other: "Khác" };
const SUPPLIER_GROUPS = { blank: "Phôi", box: "Hộp", print: "In ấn", process: "Gia công", shipping: "Vận chuyển", other: "Khác" };
const received = (taskId, rs) => rs.filter((r) => r.task_id === taskId).reduce((s, r) => s + Number(r.qty), 0);
function packBlocker(tasks, rs) {
  for (const t of tasks) {
    if (!["blank", "box", "proc"].includes(t.kind) || t.status === "skipped") continue;
    if (t.qty == null || received(t.id, rs) < Number(t.qty)) {
      return t.kind === "blank" ? "Phôi chưa về đủ, chưa thể đóng gói." : t.kind === "box" ? "Hộp chưa về đủ, chưa thể đóng gói." : "Hàng gia công chưa nhận đủ, chưa thể đóng gói.";
    }
  }
  return null;
}
function sendable(proc, tasks, rs) {
  const blankGot = tasks.filter((t) => t.kind === "blank").reduce((s, t) => s + received(t.id, rs), 0);
  return Math.max(0, Math.min(Number(proc.qty ?? 0), blankGot) - Number(proc.sent_qty));
}
function taskDue(t) {
  if (t.kind === "proc") return !t.mail_sent_at ? t.mail_due : t.sent_qty < Number(t.qty ?? 0) && !t.sent_at ? t.send_planned : t.planned_arrival;
  if (t.kind === "blank" || t.kind === "box") return t.ordered_at ? t.planned_arrival : t.planned_date;
  return t.planned_date;
}
function todayVN(now = /* @__PURE__ */ new Date()) {
  return new Date(now.getTime() + 7 * 36e5).toISOString().slice(0, 10);
}
const isOverdue = (due, done, today = todayVN()) => !!due && !done && due < today;
function daysLeft(due, today = todayVN()) {
  return Math.round((Date.parse(due) - Date.parse(today)) / 864e5);
}
function journey(o, tasks) {
  const done = (k) => {
    const ts = tasks.filter((t) => t.kind === k && t.status !== "skipped");
    return ts.length > 0 && ts.every((t) => t.status === "done");
  };
  const steps = [{ key: "intake", label: "Tiếp nhận", done: o.status !== "new" }];
  steps.push({ key: "blank", label: "Đặt phôi", done: done("blank") });
  if (o.has_box) steps.push({ key: "box", label: "Đặt hộp", done: done("box") });
  if (o.has_processing) steps.push({ key: "proc", label: "In ấn & Gia công", done: done("proc") });
  steps.push({ key: "packing", label: "Đóng gói", done: done("packing") }, { key: "delivery", label: "Giao hàng", done: done("delivery") });
  const current = steps.find((s) => !s.done)?.key ?? null;
  return { steps, current };
}
const BOARD_COLS = [
  { key: "todo", label: "Chưa thực hiện" },
  { key: "doing", label: "Đang xử lý" },
  { key: "waiting", label: "Chờ nhà cung cấp" },
  { key: "done", label: "Hoàn thành" }
];
function reminders(tasks, today = todayVN()) {
  const out = [];
  for (const t of tasks) {
    if (t.status === "done" || t.status === "skipped" || t.kind === "intake") continue;
    const due = taskDue(t);
    if (due && due < today) out.push({ task: t, type: "overdue", date: due });
    else if (due === today) out.push({ task: t, type: "today", date: due });
    else if (t.contact_date && t.contact_date <= today) out.push({ task: t, type: "contact", date: t.contact_date });
  }
  const rank = { overdue: 0, today: 1, contact: 2 };
  return out.sort((a, b) => rank[a.type] - rank[b.type] || a.date.localeCompare(b.date));
}
function monthGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const start = new Date(first.getTime() - (first.getUTCDay() + 6) % 7 * 864e5);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getTime() + i * 864e5).toISOString().slice(0, 10));
}
export {
  BOARD_COLS as B,
  KIND_LABEL as K,
  ORDER_TYPE as O,
  PROC_TYPE as P,
  SUPPLIER_GROUPS as S,
  TASK_STATUS as T,
  taskDue as a,
  ORDER_STATUS as b,
  received as c,
  daysLeft as d,
  isOverdue as i,
  journey as j,
  monthGrid as m,
  packBlocker as p,
  reminders as r,
  sendable as s,
  todayVN as t
};
