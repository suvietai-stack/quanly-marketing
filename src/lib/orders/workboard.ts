import type { DesignOrder, OrderStatus } from "@/lib/store";
import { deadlineTime, designOverdue, createdTime } from "./design";

export const DESIGN_STAGES = [
  {
    key: "intake",
    label: "Tiếp nhận",
    statuses: ["Chờ phân công", "Chờ nhận việc"],
  },
  { key: "doing", label: "Thực hiện", statuses: ["Đang thực hiện", "Cần sửa"] },
  { key: "review", label: "Chờ duyệt", statuses: ["Chờ duyệt"] },
  { key: "delivery", label: "Bàn giao", statuses: ["Đã duyệt", "Đã bàn giao"] },
  { key: "done", label: "Hoàn tất", statuses: ["Hoàn thành"] },
  { key: "cancelled", label: "Đã hủy", statuses: ["Đã hủy"] },
] as const;
export type DesignStage = (typeof DESIGN_STAGES)[number]["key"];
export type DesignQueue =
  "all" | "open" | "assigned" | "review" | "mine" | "overdue" | "unassigned";
export type DesignSort = "attention" | "deadline" | "newest";
export type DesignActor = { id?: string; fullName?: string; username?: string };
export const designClosed = (o: DesignOrder) =>
  o.status === "Hoàn thành" || o.status === "Đã hủy";
export function designStage(status: OrderStatus): DesignStage {
  return (
    DESIGN_STAGES.find((s) =>
      (s.statuses as readonly string[]).includes(status),
    )?.key ?? "intake"
  );
}
const named = (value: string | undefined, actor: DesignActor) =>
  !!value && (value === actor.fullName || value === actor.username);
export function designQueueMatches(
  o: DesignOrder,
  queue: DesignQueue,
  actor: DesignActor,
  now = Date.now(),
) {
  if (queue === "open") return !designClosed(o);
  if (queue === "assigned")
    return o.assigneeId ? o.assigneeId === actor.id : named(o.assignee, actor);
  if (queue === "mine")
    return (
      (!!actor.id && o.recordCreatedBy === actor.id) ||
      named(o.requester, actor)
    );
  if (queue === "review")
    return o.status === "Chờ duyệt" && named(o.reviewer || o.requester, actor);
  if (queue === "overdue") return designOverdue(o, now);
  if (queue === "unassigned")
    return !o.assignee && !o.assigneeId && !designClosed(o);
  return true;
}
export function sortDesignOrders(
  rows: DesignOrder[],
  sort: DesignSort,
  now = Date.now(),
) {
  const priority = (o: DesignOrder) =>
    o.priority === "Gấp" ? 0 : o.priority === "Cao" ? 1 : 2;
  return [...rows].sort((a, b) => {
    if (sort === "newest")
      return (
        (createdTime(b) ?? 0) - (createdTime(a) ?? 0) ||
        a.id.localeCompare(b.id)
      );
    const closed = Number(designClosed(a)) - Number(designClosed(b));
    const overdue =
      Number(designOverdue(b, now)) - Number(designOverdue(a, now));
    const due = (deadlineTime(a) ?? Infinity) - (deadlineTime(b) ?? Infinity);
    return (
      closed ||
      (sort === "attention" ? overdue || priority(a) - priority(b) : 0) ||
      (Number.isNaN(due) ? 0 : due) ||
      a.id.localeCompare(b.id)
    );
  });
}
export function designNextStep(o: DesignOrder) {
  const steps: Record<OrderStatus, string> = {
    "Chờ phân công": "Phân công người thực hiện hoặc nhận việc từ hàng đợi.",
    "Chờ nhận việc": "Người được giao xác nhận nhận việc để bắt đầu.",
    "Đang thực hiện": "Hoàn thiện bản nháp và gửi người duyệt.",
    "Chờ duyệt": "Người duyệt kiểm tra kết quả, duyệt hoặc yêu cầu sửa.",
    "Cần sửa": "Chỉnh theo phản hồi và gửi duyệt lại.",
    "Đã duyệt": "Người thực hiện bàn giao file đã được duyệt.",
    "Đã bàn giao": "Người yêu cầu hoặc người duyệt xác nhận hoàn thành.",
    "Hoàn thành": "Công việc đã hoàn tất. File và lịch sử được giữ tại đây.",
    "Đã hủy": "Công việc đã hủy. Xem lý do và lịch sử bên dưới.",
  };
  return steps[o.status];
}
