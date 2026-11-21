import { d as designOverdue, c as createdTime, a as deadlineTime } from "./design-BrHT-rw4.mjs";
const DESIGN_STAGES = [
  {
    key: "intake",
    label: "Nhận việc",
    statuses: ["Cần giao người", "Chờ nhận việc"]
  },
  { key: "doing", label: "Thiết kế", statuses: ["Đang thực hiện", "Cần sửa"] },
  { key: "review", label: "Chờ duyệt", statuses: ["Chờ duyệt"] },
  { key: "delivery", label: "Bàn giao", statuses: ["Đã duyệt", "Đã bàn giao"] },
  { key: "done", label: "Hoàn tất", statuses: ["Hoàn thành"] },
  { key: "cancelled", label: "Đã hủy", statuses: ["Đã hủy"] }
];
const designClosed = (o) => o.status === "Hoàn thành" || o.status === "Đã hủy";
function designStage(status) {
  return DESIGN_STAGES.find(
    (s) => s.statuses.includes(status)
  )?.key ?? "intake";
}
const named = (value, actor) => !!value && (value === actor.fullName || value === actor.username);
function designQueueMatches(o, queue, actor, now = Date.now()) {
  if (queue === "open") return !designClosed(o);
  if (queue === "assigned")
    return o.assigneeId ? o.assigneeId === actor.id : named(o.assignee, actor);
  if (queue === "mine")
    return !!actor.id && o.recordCreatedBy === actor.id || named(o.requester, actor);
  if (queue === "review")
    return o.status === "Chờ duyệt" && named(o.reviewer || o.requester, actor);
  if (queue === "overdue") return designOverdue(o, now);
  if (queue === "unassigned")
    return !o.assignee && !o.assigneeId && !designClosed(o);
  return true;
}
function sortDesignOrders(rows, sort, now = Date.now()) {
  const priority = (o) => o.priority === "Gấp" ? 0 : o.priority === "Cao" ? 1 : 2;
  return [...rows].sort((a, b) => {
    if (sort === "newest")
      return (createdTime(b) ?? 0) - (createdTime(a) ?? 0) || a.id.localeCompare(b.id);
    const closed = Number(designClosed(a)) - Number(designClosed(b));
    const overdue = Number(designOverdue(b, now)) - Number(designOverdue(a, now));
    const due = (deadlineTime(a) ?? Infinity) - (deadlineTime(b) ?? Infinity);
    return closed || (sort === "attention" ? overdue || priority(a) - priority(b) : 0) || (Number.isNaN(due) ? 0 : due) || a.id.localeCompare(b.id);
  });
}
function designNextStep(o) {
  const steps = {
    "Cần giao người": "Job chuyển từ quy trình cũ: cần chọn nhân viên Thiết kế để tiếp tục.",
    "Chờ nhận việc": "Người được giao xác nhận nhận việc để bắt đầu.",
    "Đang thực hiện": "Hoàn thiện bản nháp và gửi người duyệt.",
    "Chờ duyệt": "Người duyệt kiểm tra kết quả, duyệt hoặc yêu cầu sửa.",
    "Cần sửa": "Chỉnh theo phản hồi và gửi duyệt lại.",
    "Đã duyệt": "Người thực hiện bàn giao file đã được duyệt.",
    "Đã bàn giao": "Người yêu cầu hoặc người duyệt xác nhận hoàn thành.",
    "Hoàn thành": "Công việc đã hoàn tất. File và lịch sử được giữ tại đây.",
    "Đã hủy": "Công việc đã hủy. Xem lý do và lịch sử bên dưới."
  };
  return steps[o.status];
}
export {
  DESIGN_STAGES as D,
  designQueueMatches as a,
  designStage as b,
  designClosed as c,
  designNextStep as d,
  sortDesignOrders as s
};
