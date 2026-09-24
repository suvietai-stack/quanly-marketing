import { describe, it, expect } from "vitest";
import { buildOverview, validateV2Search } from "@/lib/kpi/overview";

const P = { periodStart: "2026-01-01", periodEnd: "2026-01-31" };
const period = (id: string, userId: string) => ({ id, userId, periodType: "month" as const, ...P, goalId: null, status: "active" as const, createdBy: null, createdAt: "", updatedAt: "" });
const item = (o: Partial<any> & { id: string; kpiPeriodId: string; metricKey: string; targetValue: number }) => ({
  label: null, unit: "count", targetOperator: ">=", brandId: null, websiteId: null, socialId: null, metadata: {}, createdAt: "", updatedAt: "", ...o,
});
const web = (id: string, writer: string, byId: string, brandId: string, websiteId: string) => ({
  id, title: `Bài ${id}`, writer, brandId, websiteId, type: "Bài mới", status: "Bài viết đã duyệt", deadline: "2026-01-20", draftRevisions: 0,
  history: [{ at: "2026-01-10T00:00:00Z", toStatus: "Chờ duyệt bài", byId }, { at: "2026-01-11T00:00:00Z", toStatus: "Bài viết đã duyệt", byId: "boss" }],
}) as any;
const data = (webContents: any[] = [], videos: any[] = [], socialPosts: any[] = []) =>
  ({ tasks: [], webContents, socialPosts, videos, orders: [] }) as any;

const users = [{ id: "A", fullName: "An" }, { id: "B", fullName: "Bình" }];

describe("Prompt B — Tổng quan V2", () => {
  it("SUM(actual)/SUM(target): A 10/10 + B 1/10 = 11/20 = 55%", () => {
    const items = [
      item({ id: "i1", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 10, brandId: "br1", websiteId: "w1" }),
      item({ id: "i2", kpiPeriodId: "pB", metricKey: "web_content_completed", targetValue: 10, brandId: "br1", websiteId: "w1" }),
    ];
    const contents = [...Array(10)].map((_, i) => web(`a${i}`, "An", "A", "br1", "w1")).concat([web("b0", "Bình", "B", "br1", "w1")]);
    const ov = buildOverview({ users, goals: [], periods: [period("pA", "A"), period("pB", "B")], items: items as any, adjustments: [],
      data: data(contents), filters: { brandId: "br1", websiteId: "w1" }, today: "2026-02-01" });
    const m = ov.metrics[0];
    expect([m.actual, m.target, m.pct]).toEqual([11, 20, 55]);
    expect(m.uniqueAssets).toBe(11);
  });

  it("KPI toàn cục không bị nhân bản thành target của Brand", () => {
    const items = [item({ id: "g1", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 30 })];
    const contents = [web("a0", "An", "A", "br1", "w1"), web("a1", "An", "A", "br2", "w2")];
    const ov = buildOverview({ users, goals: [], periods: [period("pA", "A")], items: items as any, adjustments: [],
      data: data(contents), filters: { brandId: "br1" }, today: "2026-02-01" });
    const m = ov.metrics[0];
    expect(m.target).toBe(0);
    expect(m.pct).toBeNull();
    expect(m.contributionActual).toBe(1);
    expect(ov.unmet.length).toBe(0);
  });

  it("Lọc Brand khác không giữ target của Brand kia", () => {
    const items = [item({ id: "i1", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 10, brandId: "br1", websiteId: "w1" })];
    const ov = buildOverview({ users, goals: [], periods: [period("pA", "A")], items: items as any, adjustments: [],
      data: data([web("a0", "An", "A", "br1", "w1")]), filters: { brandId: "br2" }, today: "2026-02-01" });
    expect(ov.metrics.length).toBe(0);
  });

  it("Video 4 công đoạn → contribution theo stage, chỉ 1 video bàn giao", () => {
    const v = { id: "v1", title: "Video 1", brandId: "br1", status: "Đã đăng", scriptOwner: "An", shooter: "Bình", editor: "An", publisher: "Bình", owner: "An",
      scriptDeadline: "2026-01-05", history: [], scriptDoneAt: "2026-01-05", shootDoneAt: "2026-01-07", editDoneAt: "2026-01-09", publishedAt: "2026-01-10" } as any;
    const items = [
      item({ id: "s1", kpiPeriodId: "pA", metricKey: "video_script_completed", targetValue: 1, brandId: "br1" }),
      item({ id: "s2", kpiPeriodId: "pB", metricKey: "video_shoot_completed", targetValue: 1, brandId: "br1" }),
      item({ id: "s3", kpiPeriodId: "pA", metricKey: "video_edit_completed", targetValue: 1, brandId: "br1" }),
      item({ id: "s4", kpiPeriodId: "pB", metricKey: "video_published", targetValue: 1, brandId: "br1" }),
    ];
    const ov = buildOverview({ users, goals: [], periods: [period("pA", "A"), period("pB", "B")], items: items as any, adjustments: [],
      data: data([], [v]), filters: { brandId: "br1" }, today: "2026-02-01" });
    expect(ov.videoTouched).toBeLessThanOrEqual(1);
    expect(ov.videoDelivered).toBeLessThanOrEqual(1);
    expect(ov.metrics.every((m) => m.uniqueAssets <= 1)).toBe(true);
  });

  it("Query params liên thông được xác thực", () => {
    expect(validateV2Search({ from: "2026-01-01", to: "2026-01-31", brandId: "br1", websiteId: "w1", socialId: "s1", group: "web" }))
      .toEqual({ from: "2026-01-01", to: "2026-01-31", brandId: "br1", websiteId: "w1", group: "web" });
    expect(validateV2Search({ from: "hôm qua", group: "xxx", userId: "<script>" })).toEqual({});
  });
});
