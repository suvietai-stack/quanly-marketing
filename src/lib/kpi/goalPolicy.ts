/** Quy tắc thao tác Mục tiêu theo trạng thái + khóa kỳ (pure, dùng cho cả giao diện và service). */
import type { Goal, GoalStatus } from "./types";
import type { KpiDb } from "./service";

export type GoalCaps = {
  edit: boolean; addKr: boolean; allocate: boolean; duplicate: boolean;
  cancel: boolean; restore: boolean; archive: boolean; delete: boolean;
  readOnly: boolean; reason: string | null;
};

type Lite = Pick<KpiDb, "periods" | "items"> & { krs?: KpiDb["krs"] };

/** Mục tiêu có kỳ KPI liên kết đã khóa/đóng. */
export function goalLocked(goalId: string, db: Lite): boolean {
  const isLocked = (s: string) => s === "locked" || s === "closed";
  if (db.periods.some((p) => p.goalId === goalId && isLocked(p.status))) return true;
  const krIds = new Set((db.krs ?? []).filter((k) => k.goalId === goalId).map((k) => k.id));
  return db.items.some((i) => {
    if (!(i.krId && krIds.has(i.krId)) && (i.metadata as { goalId?: string })?.goalId !== goalId) return false;
    const p = db.periods.find((x) => x.id === i.kpiPeriodId);
    return !!p && isLocked(p.status);
  });
}

export function goalHasLinks(goalId: string, db: Lite): boolean {
  return (db.krs ?? []).some((k) => k.goalId === goalId) || db.items.some((i) => (i.metadata as { goalId?: string })?.goalId === goalId) || db.periods.some((p) => p.goalId === goalId);
}

export function goalCaps(g: Pick<Goal, "id" | "status">, db: Lite, isAdmin: boolean): GoalCaps {
  const locked = goalLocked(g.id, db);
  const open = g.status === "draft" || g.status === "active";
  const can = isAdmin && open && !locked;
  const reason = locked ? "Kỳ đã khóa — chỉ xem. Nhân bản sang kỳ mới để tiếp tục."
    : g.status === "cancelled" ? "Mục tiêu đã hủy — chỉ xem."
    : g.status === "closed" ? "Mục tiêu đã hoàn thành — chỉ xem kết quả." : null;
  return {
    edit: can, addKr: can, allocate: can, duplicate: isAdmin,
    cancel: can, restore: isAdmin && g.status === "cancelled" && !locked,
    archive: isAdmin, delete: isAdmin && !locked && !goalHasLinks(g.id, db),
    readOnly: !can, reason,
  };
}

/** Kiểm tra chuyển trạng thái. Trả về thông báo lỗi hoặc null. Không bao giờ mở khóa kỳ lịch sử. */
export function checkGoalTransition(from: GoalStatus, to: GoalStatus, locked: boolean): string | null {
  if (from === to) return null;
  if (locked) return "Kỳ đã khóa — không đổi trạng thái mục tiêu. Hãy nhân bản sang kỳ mới.";
  if (from === "closed") return "Mục tiêu đã hoàn thành — không mở lại. Hãy nhân bản nếu cần tiếp tục.";
  if (from === "cancelled" && to === "closed") return "Mục tiêu đã hủy không thể chuyển thành Hoàn thành.";
  return null;
}
