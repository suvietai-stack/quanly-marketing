import { describe, it, expect } from "vitest";
import { goalCaps, checkGoalTransition, goalLocked } from "./goalPolicy";

const p = (id: string, status: string, goalId: string | null = null) => ({ id, userId: "u", periodType: "month", periodStart: "2026-10-01", periodEnd: "2026-10-31", goalId, status, createdBy: null, createdAt: "", updatedAt: "" });
const db = (periods: any[] = [], krs: any[] = [], items: any[] = []) => ({ periods, krs, items } as any);

describe("goal policy", () => {
  it("đã hủy không thêm KR, chỉ nhân bản/lưu trữ/khôi phục", () => {
    const c = goalCaps({ id: "g", status: "cancelled" }, db(), true);
    expect(c.addKr).toBe(false); expect(c.edit).toBe(false); expect(c.duplicate).toBe(true); expect(c.archive).toBe(true); expect(c.restore).toBe(true);
  });
  it("đang thực hiện được thêm KR, phân bổ", () => {
    const c = goalCaps({ id: "g", status: "active" }, db(), true);
    expect(c.addKr && c.allocate && c.cancel).toBe(true);
  });
  it("hoàn thành: chỉ xem, nhân bản, lưu trữ", () => {
    const c = goalCaps({ id: "g", status: "closed" }, db(), true);
    expect(c.addKr || c.edit || c.cancel || c.restore).toBe(false); expect(c.duplicate && c.archive).toBe(true);
  });
  it("kỳ khóa: không khôi phục, không đổi trạng thái", () => {
    const d = db([p("p1", "locked", "g")]);
    expect(goalLocked("g", d)).toBe(true);
    const c = goalCaps({ id: "g", status: "cancelled" }, d, true);
    expect(c.restore || c.addKr || c.delete).toBe(false);
    expect(checkGoalTransition("cancelled", "active", true)).not.toBeNull();
  });
  it("kỳ khóa qua dòng phân bổ KR chung", () => {
    const d = db([p("p1", "locked")], [{ id: "k", goalId: "g" }], [{ id: "i", kpiPeriodId: "p1", krId: "k", metadata: {} }]);
    expect(goalLocked("g", d)).toBe(true);
  });
  it("hoàn thành không mở lại; hủy khôi phục được khi chưa khóa", () => {
    expect(checkGoalTransition("closed", "active", false)).not.toBeNull();
    expect(checkGoalTransition("cancelled", "draft", false)).toBeNull();
  });
  it("xóa chỉ khi không còn liên kết", () => {
    expect(goalCaps({ id: "g", status: "draft" }, db(), true).delete).toBe(true);
    expect(goalCaps({ id: "g", status: "draft" }, db([], [{ id: "k", goalId: "g" }]), true).delete).toBe(false);
  });
  it("nhân viên không có thao tác", () => {
    const c = goalCaps({ id: "g", status: "active" }, db(), false);
    expect(c.addKr || c.archive || c.duplicate).toBe(false);
  });
});
