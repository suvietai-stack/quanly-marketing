import { describe, it, expect } from "vitest";
import { isDivisible, allocationSummary, checkAllocationScope, aggregateKr, canHardDelete } from "./allocation";
import { createKpiService, memoryRepository, KpiError } from "./service";
import { krsOfGoal } from "./evaluate";

const admin = { id: "admin", isAdmin: true };
const brandOf = (k: "website" | "social", id: string) => ({ "w:xg": "b1", "w:tt": "b2", "s:fb": "b1" } as Record<string, string>)[`${k[0]}:${id}`];
const ev = (n: number, prefix: string) => Array.from({ length: n }, (_, i) => ({ type: "web", id: `${prefix}${i}` }));

describe("Phân bổ KR chung", () => {
  it("Julia 10 + Hoa Ngâu 30 → KR chung 27/40, không cần 2 KR", () => {
    const svc = createKpiService(memoryRepository());
    const g = svc.saveGoal(admin, { title: "KH tháng 10", periodStart: "2026-10-01", periodEnd: "2026-10-31", metadata: { scope: "department", scopeRef: "Phòng Marketing" } });
    const kr = svc.saveKr(admin, { goalId: g.id, metricKey: "web_post_published", targetValue: 40, brandId: "b1", websiteId: "xg" });
    for (const [u, t] of [["julia", 10], ["hoa", 30]] as const)
      svc.assign(admin, { userId: u, periodType: "month", periodStart: "2026-10-01", periodEnd: "2026-10-31", goalId: g.id, items: [{ krId: kr.id, metricKey: "web_post_published", targetValue: t, brandId: "b1", websiteId: "xg" }] });
    const db = svc.list();
    const allocs = db.items.filter((i) => i.krId === kr.id);
    expect(db.krs).toHaveLength(1);
    expect(allocs).toHaveLength(2);
    expect(allocationSummary(kr, allocs).balanced).toBe(true);
    expect(aggregateKr(kr.metricKey, [{ value: 7, evidence: ev(7, "j") }, { value: 20, evidence: ev(20, "h") }])).toBe(27);
    expect(krsOfGoal(g.id, db.items, db.periods)).toHaveLength(2);
  });

  it("Một người trên 2 Website: 30 + 10 = 40/40", () => {
    expect(allocationSummary({ targetValue: 40, metricKey: "web_post_published" }, [{ targetValue: 30 }, { targetValue: 10 }]).balanced).toBe(true);
  });

  it("Thiếu / vượt phân bổ", () => {
    expect(allocationSummary({ targetValue: 40, metricKey: "web_post_published" }, [{ targetValue: 35 }]).message).toBe("Còn 5 chưa phân bổ");
    expect(allocationSummary({ targetValue: 40, metricKey: "web_post_published" }, [{ targetValue: 45 }]).message).toBe("Vượt chỉ tiêu KR 5");
  });

  it("Dòng phân bổ ngoài phạm vi KR bị chặn", () => {
    expect(checkAllocationScope({ brandId: "b1", websiteId: "xg", socialId: null }, { websiteId: "tt" }, brandOf)).toMatch(/đúng Website/);
    expect(checkAllocationScope({ brandId: "b1", websiteId: null, socialId: null }, { websiteId: "tt" }, brandOf)).toMatch(/không thuộc dự án/);
    expect(checkAllocationScope({ brandId: "b1", websiteId: null, socialId: null }, { websiteId: "xg" }, brandOf)).toBeNull();
  });

  it("Không đếm trùng bằng chứng giữa các dòng", () => {
    expect(aggregateKr("web_post_published", [{ value: 2, evidence: [{ type: "web", id: "a" }, { type: "web", id: "b" }] }, { value: 1, evidence: [{ type: "web", id: "a" }] }])).toBe(2);
  });

  it("KR không chia (tỷ lệ, Top từ khóa) chỉ giữ 1 người chịu trách nhiệm", () => {
    expect(isDivisible("task_on_time_rate")).toBe(false);
    expect(isDivisible("seo_keyword_top")).toBe(false);
    expect(isDivisible("web_post_published")).toBe(true);
    expect(allocationSummary({ targetValue: 95, metricKey: "task_on_time_rate" }, [{ targetValue: 95 }, { targetValue: 95 }]).balanced).toBe(false);
  });

  it("KR cũ (không có krId) vẫn thuộc đúng mục tiêu", () => {
    const svc = createKpiService(memoryRepository());
    const g = svc.saveGoal(admin, { title: "Cũ", periodStart: "2026-10-01", periodEnd: "2026-10-31" });
    svc.assign(admin, { userId: "julia", periodType: "month", periodStart: "2026-10-01", periodEnd: "2026-10-31", goalId: g.id, items: [{ metricKey: "web_post_published", targetValue: 5, brandId: "b1", websiteId: "xg" }] });
    const db = svc.list();
    expect(krsOfGoal(g.id, db.items, db.periods).filter((i) => !i.krId)).toHaveLength(1);
  });

  it("Xóa bị chặn khi đã có phân bổ / kết quả", () => {
    const svc = createKpiService(memoryRepository());
    const g = svc.saveGoal(admin, { title: "X", periodStart: "2026-10-01", periodEnd: "2026-10-31" });
    const kr = svc.saveKr(admin, { goalId: g.id, metricKey: "web_post_published", targetValue: 10, brandId: "b1" });
    svc.assign(admin, { userId: "julia", periodType: "month", periodStart: "2026-10-01", periodEnd: "2026-10-31", goalId: g.id, items: [{ krId: kr.id, metricKey: "web_post_published", targetValue: 10, brandId: "b1" }] });
    expect(() => svc.deleteKr(admin, kr.id)).toThrow(KpiError);
    expect(() => svc.deleteGoal(admin, g.id)).toThrow(KpiError);
    expect(canHardDelete(true, false)).toBe(false);
    expect(canHardDelete(false, true)).toBe(false);
  });

  it("Sửa chỉ tiêu KR chung ghi lịch sử, không đổi phân bổ", () => {
    const svc = createKpiService(memoryRepository());
    const g = svc.saveGoal(admin, { title: "X", periodStart: "2026-10-01", periodEnd: "2026-10-31" });
    const kr = svc.saveKr(admin, { goalId: g.id, metricKey: "web_post_published", targetValue: 40 });
    const k2 = svc.saveKr(admin, { ...kr, targetValue: 50 }, "Thêm website");
    expect((k2.metadata as { history: unknown[] }).history).toHaveLength(1);
  });
});
