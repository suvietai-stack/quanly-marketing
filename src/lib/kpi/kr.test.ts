import { describe, it, expect } from "vitest";
import { calculateKrItem } from "./calculateKr";
import { createKpiService, memoryRepository } from "./service";
import type { Task, KeywordTrack } from "@/lib/store";

const emp = { id: "u1", fullName: "Julia" };
const P = { periodStart: "2026-09-01", periodEnd: "2026-09-30" };
const task = (o: Partial<Task>): Task => ({ id: Math.random().toString(), title: "t", priority: "Trung bình", status: "Hoàn thành", assignee: "Julia", ...o } as Task);
const admin = { id: "a", isAdmin: true };

describe("KR engine", () => {
  it("SEO: từ khóa Top 3 theo thứ hạng mới nhất; kỳ chưa kết thúc ghi rõ", () => {
    const kws = [{ id: "k1", websiteId: "w1", keyword: "ấm chén in logo", currentTop: 2, lastCheckDate: "2026-09-10", type: "Chính", status: "Top 3" } as unknown as KeywordTrack,
      { id: "k2", websiteId: "w1", keyword: "x", currentTop: 7, lastCheckDate: "2026-09-10" } as unknown as KeywordTrack];
    const r = calculateKrItem(emp, { metricKey: "seo_keyword_top", metadata: { keywordIds: ["k1", "k2"], threshold: 3 } }, P, { tasks: [], keywords: kws }, "2026-09-15");
    expect(r.actualValue).toBe(1);
    expect(r.status).toMatch(/chưa đồng nghĩa hoàn thành/);
    const r2 = calculateKrItem(emp, { metricKey: "seo_keyword_top", metadata: { keywordIds: ["k1"], threshold: 3 } }, P, { tasks: [], keywords: kws }, "2026-10-02");
    expect(r2.status).toBeUndefined();
  });
  it("KR tùy chỉnh: chỉ đếm Task liên kết đã hoàn thành", () => {
    const tasks = [task({ id: "a", submittedAt: "2026-09-10" }), task({ id: "b", status: "Đang làm" }), task({ id: "c" })];
    const r = calculateKrItem(emp, { metricKey: "custom_task_result", metadata: { taskIds: ["a", "b"] } }, P, { tasks });
    expect(r.actualValue).toBe(1);
  });
  it("Đúng hạn: theo ngày gửi, không tính thời gian chờ duyệt; quá hạn bỏ qua Task chờ xác nhận", () => {
    const tasks = [
      task({ submittedAt: "2026-09-05", deadline: "2026-09-06", completedAt: "2026-09-20" }),
      task({ submittedAt: "2026-09-10", deadline: "2026-09-08" }),
      task({ status: "Chờ xác nhận", deadline: "2026-09-03" }),
      task({ status: "Đang làm", deadline: "2026-09-04" }),
    ];
    expect(calculateKrItem(emp, { metricKey: "task_on_time_rate" }, P, { tasks }).actualValue).toBe(50);
    expect(calculateKrItem(emp, { metricKey: "task_overdue" }, P, { tasks }, "2026-09-15").actualValue).toBe(1);
  });
  it("Không giao được chỉ số chưa tích hợp / thiếu cấu hình", () => {
    const svc = createKpiService(memoryRepository());
    const base = { userId: "u1", periodType: "month" as const, ...P };
    expect(() => svc.assign(admin, { ...base, items: [{ metricKey: "mkt_conversions", targetValue: 5 }] })).toThrow(/chưa có nguồn/);
    expect(() => svc.assign(admin, { ...base, items: [{ metricKey: "seo_keyword_top", targetValue: 1 }] })).toThrow(/từ khóa/);
    expect(() => svc.assign(admin, { ...base, items: [{ metricKey: "custom_task_result", targetValue: 3, label: "NC từ khóa" }] })).toThrow(/Task/);
    const ok = svc.assign(admin, { ...base, items: [{ metricKey: "custom_task_result", targetValue: 3, label: "NC từ khóa", metadata: { taskIds: ["a"] } }] });
    expect(ok.items[0].metadata).toMatchObject({ taskIds: ["a"] });
  });
});
