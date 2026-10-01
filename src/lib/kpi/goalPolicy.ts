/** Quy tắc thao tác Mục tiêu theo trạng thái + khóa kỳ (pure, dùng cho cả giao diện và service). */
import type { Goal, GoalStatus } from "./types";
import type { KpiDb } from "./service";
import type { KpiPerms } from "./perms";

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

/** Liệt kê chính xác từng nguyên nhân chặn xóa vĩnh viễn (rỗng = xóa được). */
export function goalDeleteBlockers(goalId: string, db: Lite): string[] {
  const out: string[] = [];
  if (goalLocked(goalId, db)) out.push("Kỳ KPI liên kết đã khóa/đóng");
  const krs = (db.krs ?? []).filter((k) => k.goalId === goalId);
  const act = krs.filter((k) => k.status !== "archived" && k.status !== "cancelled").length;
  const arc = krs.filter((k) => k.status === "archived").length;
  const can = krs.filter((k) => k.status === "cancelled").length;
  if (act) out.push(`Còn ${act} KR đang hoạt động`);
  if (arc) out.push(`Còn ${arc} KR đã lưu trữ (bật "Hiện mục đã lưu trữ" để xem)`);
  if (can) out.push(`Còn ${can} KR đã hủy`);
  const krIds = new Set(krs.map((k) => k.id));
  const alloc = db.items.filter((i) => (i.krId && krIds.has(i.krId)) || (i.metadata as { goalId?: string })?.goalId === goalId).length;
  if (alloc) out.push(`Còn ${alloc} dòng phân bổ/chỉ tiêu KPI`);
  const per = db.periods.filter((p) => p.goalId === goalId).length;
  if (per) out.push(`Còn ${per} kỳ KPI nhân sự liên kết`);
  return out;
}

export function goalHasLinks(goalId: string, db: Lite): boolean {
  return goalDeleteBlockers(goalId, db).length > 0;
}

export function goalCaps(g: Pick<Goal, "id" | "status">, db: Lite, perms: boolean | KpiPerms): GoalCaps & { deleteBlockers: string[] } {
  const P = (k: keyof KpiPerms) => (typeof perms === "boolean" ? perms : perms[k]);
  const locked = goalLocked(g.id, db);
  const open = g.status === "draft" || g.status === "active";
  const ok = open && !locked;
  const reason = locked ? "Kỳ đã khóa — chỉ xem. Nhân bản sang kỳ mới để tiếp tục."
    : g.status === "cancelled" ? "Mục tiêu đã hủy — chỉ xem."
    : g.status === "closed" ? "Mục tiêu đã hoàn thành — chỉ xem kết quả." : null;
  const deleteBlockers = goalDeleteBlockers(g.id, db);
  const edit = ok && P("kpi.goal_edit");
  return {
    edit, addKr: ok && P("kpi.kr_assign"), allocate: ok && P("kpi.kr_assign"), duplicate: P("kpi.goal_create"),
    cancel: ok && P("kpi.goal_archive"), restore: P("kpi.goal_archive") && g.status === "cancelled" && !locked,
    archive: P("kpi.goal_archive"), delete: P("kpi.goal_delete") && deleteBlockers.length === 0,
    readOnly: !edit, reason, deleteBlockers,
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
