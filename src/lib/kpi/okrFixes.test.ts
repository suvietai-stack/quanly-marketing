/** Regression: sửa lỗi logic OKR/KPI (liên kết Goal–KR, công thức lọc, hướng đánh giá, deadline, xác nhận thủ công, Check Top, khóa kỳ, wizard). */
import { describe, it, expect } from "vitest";
import { calculateKrItem } from "./calculateKr";
import { buildItemReport, buildEmployeeReport } from "./report";
import { createKpiService, memoryRepository } from "./service";
import { evaluateKr, krsOfGoal, confirmedUniqueEntries } from "./evaluate";
import type { Task, KeywordTrack } from "@/lib/store";

const emp = { id: "u1", fullName: "Julia" };
const P = { periodStart: "2026-09-01", periodEnd: "2026-09-30" };
const admin = { id: "a", isAdmin: true };
const task = (o: Partial<Task>): Task => ({ id: Math.random().toString(), title: "t", priority: "Trung bình", status: "Hoàn thành", assignee: "Julia", brandId: "br1", ...o } as Task);
const period = (o: Partial<any> = {}) => ({ id: "p1", userId: "u1", periodType: "month" as const, ...P, goalId: null, status: "active" as const, createdBy: null, createdAt: "", updatedAt: "", ...o });
const item = (o: Partial<any>) => ({ id: "i1", kpiPeriodId: "p1", label: null, unit: "count", targetOperator: ">=", brandId: null, websiteId: null, socialId: null, metadata: {}, createdAt: "", updatedAt: "", targetValue: 1, metricKey: "task_completed", ...o });
const data = (tasks: Task[] = [], extra: any = {}) => ({ tasks, webContents: [], socialPosts: [], videos: [], orders: [], ...extra }) as any;

describe("OKR/KPI — sửa lỗi logic", () => {
  it("1–2. Một người, hai mục tiêu cùng kỳ: KR không lẫn giữa A và B", () => {
    const svc = createKpiService(memoryRepository());
    const A = svc.saveGoal(admin, { title: "A", ...P }); const B = svc.saveGoal(admin, { title: "B", ...P });
    const base = { userId: "u1", periodType: "month" as const, ...P };
    svc.assign(admin, { ...base, goalId: A.id, items: [{ metricKey: "custom_task_result", targetValue: 1, label: "NC từ khóa", metadata: { taskIds: ["t1"] } }] });
    svc.assign(admin, { ...base, goalId: B.id, items: [{ metricKey: "web_content_completed", targetValue: 5 }] });
    svc.assign(admin, { ...base, items: [{ metricKey: "task_completed", targetValue: 3 }] }); // không thuộc mục tiêu nào
    const db = svc.list();
    expect(db.periods).toHaveLength(1); // cùng kỳ dùng chung period (goalId = A)
    expect(krsOfGoal(A.id, db.items, db.periods).map((i) => i.metricKey)).toEqual(["custom_task_result"]);
    expect(krsOfGoal(B.id, db.items, db.periods).map((i) => i.metricKey)).toEqual(["web_content_completed"]);
    // Dữ liệu cũ không có khóa goalId → mới dùng goalId của kỳ
    expect(krsOfGoal("G", [{ kpiPeriodId: "p", metadata: {} }], [{ id: "p", goalId: "G" }])).toHaveLength(1);
  });

  it("3–5. KR tùy chỉnh: không cộng Task sai người, sai dự án, ngoài kỳ; cập nhật nhiều lần không tăng", () => {
    const tasks = [task({ id: "ok", submittedAt: "2026-09-10" }), task({ id: "other", assignee: "Minh", submittedAt: "2026-09-10" }),
      task({ id: "brand", brandId: "br2", submittedAt: "2026-09-10" }), task({ id: "late", submittedAt: "2026-10-02" })];
    const r = calculateKrItem(emp, { metricKey: "custom_task_result", brandId: "br1", metadata: { taskIds: ["ok", "other", "brand", "late", "ok"] } }, P, { tasks });
    expect(r.actualValue).toBe(1);
  });

  it("6. Tỷ lệ đúng hạn 1/2 = 50%, lọc theo thương hiệu vẫn 50% (không thành 2)", () => {
    const tasks = [task({ submittedAt: "2026-09-05", deadline: "2026-09-06" }), task({ submittedAt: "2026-09-10", deadline: "2026-09-08" })];
    const it = item({ metricKey: "task_on_time_rate", unit: "percent", targetValue: 95 });
    expect(buildItemReport(emp, it as any, period() as any, data(tasks), {}, [], "2026-09-15").actual).toBe(50);
    const f = buildItemReport(emp, it as any, period() as any, data(tasks), { brandId: "br1" }, [], "2026-09-15");
    expect(f.actual).toBe(50);
    // Clicks/Lead khi lọc rộng hơn phạm vi KR → Chưa đủ dữ liệu, không thay bằng số bản ghi
    const growth = [{ id: "g", websiteId: "w1", periodType: "Tháng", periodKey: "2026-09", period: "T9", clicks: 1200 }];
    const clicks = buildItemReport(emp, item({ metricKey: "seo_organic_clicks", websiteId: "w1", brandId: null, targetValue: 1000 }) as any, period() as any, data([], { growth }), { brandId: "br1" }, [], "2026-10-01");
    expect(clicks.actual).toBeNull();
  });

  it("7. Hướng 'không vượt quá': tối đa 1 việc quá hạn, thực tế 3 → KHÔNG ĐẠT", () => {
    const e = evaluateKr({ actual: 3, target: 1, direction: "at_most", deadline: "2026-09-30", today: "2026-09-15" });
    expect(e.achieved).toBe(false); expect(e.label).toBe("Không đạt"); expect(e.pct).toBeNull();
    const tasks = [1, 2, 3].map((n) => task({ status: "Đang làm", deadline: `2026-09-0${n}` }));
    const r = buildItemReport(emp, item({ metricKey: "task_overdue", targetValue: 1 }) as any, period() as any, data(tasks), {}, [], "2026-09-15");
    expect(r.actual).toBe(3); expect(r.achieved).toBe(false);
    expect(evaluateKr({ actual: 40000, target: 50000, direction: "at_most", deadline: "2026-09-30", today: "2026-10-01" }).achieved).toBe(true);
  });

  it("8–9. Deadline riêng: sau ngày 15 chưa đạt → Quá hạn; đạt sau deadline → Hoàn thành muộn", () => {
    const tasks = [task({ submittedAt: "2026-09-10" }), task({ submittedAt: "2026-09-20" })];
    const kr1 = item({ id: "k1", metricKey: "task_completed", targetValue: 3, metadata: { deadline: "2026-09-15" } });
    const r1 = buildItemReport(emp, kr1 as any, period() as any, data(tasks), {}, [], "2026-09-16");
    expect(r1.evaluation.state).toBe("overdue");
    const kr2 = item({ id: "k2", metricKey: "task_completed", targetValue: 2, metadata: { deadline: "2026-09-15" } });
    const r2 = buildItemReport(emp, kr2 as any, period() as any, data(tasks), {}, [], "2026-09-25");
    expect(r2.evaluation.state).toBe("late"); expect(r2.evaluation.completedAt).toBe("2026-09-20");
    const kr3 = item({ id: "k3", metricKey: "task_completed", targetValue: 2, metadata: { deadline: "2026-09-25" } });
    expect(buildItemReport(emp, kr3 as any, period() as any, data(tasks), {}, [], "2026-09-16").evaluation.state).toBe("in_progress");
  });

  it("10–12. Gửi bằng chứng chưa duyệt → KR chưa tăng; xác nhận → tăng đúng 1 lần; không cộng trùng", () => {
    const pending = { id: "e1", value: 10, link: "https://x.vn/a", recordedAt: "2026-09-05", recordedBy: "u1", status: "pending" as const };
    const calc = (entries: any[]) => calculateKrItem(emp, { metricKey: "mkt_orders", metadata: { entries } }, P, { tasks: [] }).actualValue;
    expect(calc([pending])).toBeNull();
    const ok = { ...pending, status: "confirmed" as const, confirmedBy: "a", confirmedAt: "2026-09-06" };
    expect(calc([ok])).toBe(10);
    expect(calc([ok, ok, { ...ok, id: "e2" }])).toBe(10); // gửi lại cùng kết quả
    expect(calc([ok, { ...ok, id: "e3", status: "rejected" }, { ...ok, id: "e4", status: "needs_info", confirmedBy: null }])).toBe(10);
    expect(confirmedUniqueEntries([ok, { ...ok, id: "e5", link: "https://x.vn/b" }])).toHaveLength(2);
  });

  it("13. Check Top chỉ dùng đúng từ khóa + Website; bỏ dữ liệu kiểm tra ngoài kỳ", () => {
    const kws = [
      { id: "k1", websiteId: "w1", keyword: "ấm chén in logo", currentTop: 2, lastCheckDate: "2026-09-10" },
      { id: "k2", websiteId: "w2", keyword: "ấm chén in logo", currentTop: 1, lastCheckDate: "2026-09-10" },
      { id: "k3", websiteId: "w1", keyword: "cũ", currentTop: 1, lastCheckDate: "2026-08-20" },
    ] as unknown as KeywordTrack[];
    const r = calculateKrItem(emp, { metricKey: "seo_keyword_top", websiteId: "w1", metadata: { keywordIds: ["k1", "k2", "k3"], threshold: 3 } }, P, { tasks: [], keywords: kws }, "2026-10-01");
    expect(r.actualValue).toBe(1);
    expect(r.warnings.map((w) => w.sourceId).sort()).toEqual(["k2", "k3"]);
    // Không giao vượt số từ khóa đã chọn
    const svc = createKpiService(memoryRepository());
    expect(() => svc.assign(admin, { userId: "u1", periodType: "month", ...P, items: [{ metricKey: "seo_keyword_top", targetValue: 10, metadata: { keywordIds: ["k1"] } }] })).toThrow(/vượt quá/);
  });

  it("14. Kỳ đã khóa dùng kết quả chốt, không đổi khi dữ liệu nguồn thay đổi", () => {
    const svc = createKpiService(memoryRepository());
    const { period: p, items } = svc.assign(admin, { userId: "u1", periodType: "month", ...P, items: [{ metricKey: "task_completed", targetValue: 2 }] });
    svc.setStatus(admin, p!.id, "active");
    svc.setStatus(admin, p!.id, "locked", { [items[0].id]: { actual: 2, achieved: true, evidence: [{ type: "task", id: "a", at: "2026-09-05" }] } });
    const db = svc.list();
    const tasksLater = [task({ submittedAt: "2026-09-05" })]; // nguồn bị sửa sau khi khóa: còn 1 task
    const r = buildItemReport(emp, db.items[0], db.periods[0], data(tasksLater), {}, [], "2026-10-10");
    expect(r.actual).toBe(2); expect(r.lockedSource).toBe("snapshot"); expect(r.achieved).toBe(true);
  });

  it("15. Wizard: bấm thử lại không tạo trùng KR đã lưu (clientKey)", () => {
    const svc = createKpiService(memoryRepository());
    const it = { metricKey: "task_completed", targetValue: 2, metadata: { clientKey: "d1" } };
    svc.assign(admin, { userId: "u1", periodType: "month", ...P, items: [it] });
    svc.assign(admin, { userId: "u1", periodType: "month", ...P, items: [it] });
    expect(svc.list().items).toHaveLength(1);
  });

  it("16. KR số liệu tháng không giao cho kỳ tuần (không tự chia số liệu)", () => {
    const svc = createKpiService(memoryRepository());
    expect(() => svc.assign(admin, { userId: "u1", periodType: "week", periodStart: "2026-09-07", periodEnd: "2026-09-13",
      items: [{ metricKey: "seo_organic_clicks", targetValue: 100, brandId: "b", websiteId: "w1" }] })).toThrow(/theo tháng/);
  });

  it("17. Báo cáo nhân sự chỉ gồm KR của đúng người (quyền đọc thật do RLS ở cơ sở dữ liệu)", () => {
    const periods = [period({ id: "pA", userId: "u1" }), period({ id: "pB", userId: "u2" })];
    const items = [item({ id: "a", kpiPeriodId: "pA" }), item({ id: "b", kpiPeriodId: "pB" })];
    const r = buildEmployeeReport({ user: { id: "u1", fullName: "Julia" }, allUsers: [{ fullName: "Julia" }], periods: periods as any, items: items as any, adjustments: [], data: data(), filters: {}, today: "2026-09-15" });
    expect(r.items.map((x) => x.item.id)).toEqual(["a"]);
  });
});
