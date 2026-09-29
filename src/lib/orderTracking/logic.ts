/** Quy tắc hiển thị Theo Dõi Đơn Hàng — phản chiếu kiểm tra trong ot_task_action (backend là nguồn quyết định). */
export type OtTask = {
  id: string; order_id: string; kind: "intake" | "blank" | "box" | "proc" | "packing" | "delivery"; position: number;
  supplier_id: string | null; assignee_id: string | null; qty: number | null; proc_type: string | null;
  planned_date: string | null; planned_arrival: string | null; ordered_at: string | null;
  mail_due: string | null; mail_sent_at: string | null; send_planned: string | null; sent_at: string | null; sent_qty: number;
  shipped_at: string | null; status: "todo" | "doing" | "waiting" | "done" | "skipped"; done_at: string | null; note: string | null;
};
export type OtReceipt = { id: string; task_id: string; qty: number; received_at: string; actor_id: string };

export const KIND_LABEL: Record<OtTask["kind"], string> = {
  intake: "Tiếp nhận đơn hàng", blank: "Đặt phôi", box: "Đặt hộp", proc: "In ấn & Gia công", packing: "Đóng gói", delivery: "Giao hàng",
};
export const TASK_STATUS: Record<OtTask["status"], string> = { todo: "Chưa thực hiện", doing: "Đang xử lý", waiting: "Chờ nhà cung cấp", done: "Hoàn thành", skipped: "Bỏ qua" };
export const ORDER_STATUS: Record<string, string> = { new: "Chưa tiếp nhận", in_progress: "Đang thực hiện", done: "Hoàn tất", cancelled: "Đã hủy" };
export const ORDER_TYPE: Record<string, string> = { sample: "Đơn mẫu", mass: "Sản xuất" };
export const PROC_TYPE: Record<string, string> = { print: "In ấn", gold: "Kẻ vàng", other: "Khác" };
export const SUPPLIER_GROUPS: Record<string, string> = { blank: "Phôi", box: "Hộp", print: "In ấn", process: "Gia công", shipping: "Vận chuyển", other: "Khác" };

export const received = (taskId: string, rs: OtReceipt[]) => rs.filter((r) => r.task_id === taskId).reduce((s, r) => s + Number(r.qty), 0);

/** Lý do chưa được đóng gói (null = đủ điều kiện). */
export function packBlocker(tasks: OtTask[], rs: OtReceipt[]): string | null {
  for (const t of tasks) {
    if (!["blank", "box", "proc"].includes(t.kind) || t.status === "skipped") continue;
    if (t.qty == null || received(t.id, rs) < Number(t.qty)) {
      return t.kind === "blank" ? "Phôi chưa về đủ, chưa thể đóng gói." : t.kind === "box" ? "Hộp chưa về đủ, chưa thể đóng gói." : "Hàng gia công chưa nhận đủ, chưa thể đóng gói.";
    }
  }
  return null;
}

/** Số phôi còn có thể gửi thêm cho một lượt gia công. */
export function sendable(proc: OtTask, tasks: OtTask[], rs: OtReceipt[]) {
  const blankGot = tasks.filter((t) => t.kind === "blank").reduce((s, t) => s + received(t.id, rs), 0);
  return Math.max(0, Math.min(Number(proc.qty ?? 0), blankGot) - Number(proc.sent_qty));
}

/** Hạn dự kiến dùng cho cảnh báo quá hạn. */
export function taskDue(t: OtTask): string | null {
  if (t.kind === "proc") return !t.mail_sent_at ? t.mail_due : t.sent_qty < Number(t.qty ?? 0) && !t.sent_at ? t.send_planned : t.planned_arrival;
  if (t.kind === "blank" || t.kind === "box") return t.ordered_at ? t.planned_arrival : t.planned_date;
  return t.planned_date;
}

export function todayVN(now = new Date()) {
  return new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}
export const isOverdue = (due: string | null, done: boolean, today = todayVN()) => !!due && !done && due < today;
export function daysLeft(due: string, today = todayVN()) {
  return Math.round((Date.parse(due) - Date.parse(today)) / 86400_000);
}

/** Tiến trình hành trình: các bước hiển thị theo kế hoạch. */
export function journey(o: { status: string; has_box: boolean; has_processing: boolean; planned: boolean }, tasks: OtTask[]) {
  const done = (k: OtTask["kind"]) => { const ts = tasks.filter((t) => t.kind === k && t.status !== "skipped"); return ts.length > 0 && ts.every((t) => t.status === "done"); };
  const steps: { key: OtTask["kind"]; label: string; done: boolean }[] = [{ key: "intake", label: "Tiếp nhận", done: o.status !== "new" }];
  steps.push({ key: "blank", label: "Đặt phôi", done: done("blank") });
  if (o.has_box) steps.push({ key: "box", label: "Đặt hộp", done: done("box") });
  if (o.has_processing) steps.push({ key: "proc", label: "In ấn & Gia công", done: done("proc") });
  steps.push({ key: "packing", label: "Đóng gói", done: done("packing") }, { key: "delivery", label: "Giao hàng", done: done("delivery") });
  const current = steps.find((s) => !s.done)?.key ?? null;
  return { steps, current };
}
