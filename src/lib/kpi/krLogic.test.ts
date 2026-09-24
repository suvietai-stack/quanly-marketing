import { describe, it, expect } from "vitest";
import { calculateKrItem, krAchieved } from "./calculateKr";
import { aggKey } from "./overview";

const emp = { id: "u1", fullName: "Julia", username: "julia" } as any;
const P = { periodStart: "2026-09-01", periodEnd: "2026-09-30" };
const task = (id: string, o: any) => ({ id, title: id, status: "Hoàn thành", assignee: "u1", brandId: "b1", submittedAt: "2026-09-10", ...o });

describe("Sửa lỗi logic KR", () => {
  it("KR tùy chỉnh không cộng Task sai người, sai dự án, ngoài kỳ", () => {
    const tasks = [task("ok", {}), task("other", { assignee: "u2" }), task("brand", { brandId: "b2" }), task("old", { submittedAt: "2026-08-01" })] as any;
    const r = calculateKrItem(emp, { metricKey: "custom_task_result", brandId: "b1", metadata: { taskIds: ["ok", "other", "brand", "old"] } }, P, { tasks }, "2026-09-15");
    expect(r.actualValue).toBe(1);
    expect(r.warnings.length).toBe(2);
  });
  it("Không vượt quá: 3 trễ hạn / chỉ tiêu 1 → KHÔNG ĐẠT", () => {
    expect(krAchieved(3, 1, "at_most")).toBe(false);
    expect(krAchieved(1, 1, "at_most")).toBe(true);
  });
  it("Check Top không dùng dữ liệu cũ hoặc sai Website", () => {
    const websites = [{ id: "w1", brandId: "b1" }, { id: "w2", brandId: "b1" }] as any;
    const keywords = [
      { id: "k1", keyword: "ấm chén in logo", websiteId: "w1", currentTop: 2, lastCheckDate: "2026-09-12" },
      { id: "k2", keyword: "cũ", websiteId: "w1", currentTop: 1, lastCheckDate: "2026-07-01" },
      { id: "k3", keyword: "web khác", websiteId: "w2", currentTop: 1, lastCheckDate: "2026-09-12" },
    ] as any;
    const r = calculateKrItem(emp, { metricKey: "seo_keyword_top", websiteId: "w1", metadata: { keywordIds: ["k1", "k2", "k3"], threshold: 3 } }, P, { tasks: [], keywords, websites }, "2026-09-15");
    expect(r.actualValue).toBe(1);
    const stale = calculateKrItem(emp, { metricKey: "seo_keyword_top", websiteId: "w1", metadata: { keywordIds: ["k2"] } }, P, { tasks: [], keywords, websites }, "2026-09-15");
    expect(stale.actualValue).toBeNull();
  });
  it("Không gộp KR khác nhau cùng loại chỉ số; % không cộng", () => {
    expect(aggKey({ id: "a", metricKey: "seo_keyword_top" })).not.toBe(aggKey({ id: "b", metricKey: "seo_keyword_top" }));
    expect(aggKey({ id: "a", metricKey: "task_on_time_rate" }, "percent")).not.toBe(aggKey({ id: "b", metricKey: "task_on_time_rate" }, "percent"));
    expect(aggKey({ id: "a", metricKey: "web_content_completed" }, "count")).toBe(aggKey({ id: "b", metricKey: "web_content_completed" }, "count"));
  });
});
