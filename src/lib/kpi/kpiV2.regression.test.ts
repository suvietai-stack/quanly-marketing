import { describe, it, expect } from "vitest";
import { buildOverview } from "@/lib/kpi/overview";
import { buildEmployeeReport } from "@/lib/kpi/report";
import { createKpiService, type KpiRepository } from "@/lib/kpi/service";
import { buildPeriodSnapshot, resolveLockedActual } from "@/lib/kpi/lockSnapshot";

const JAN = { periodStart: "2026-01-01", periodEnd: "2026-01-31" };
const FEB = { periodStart: "2026-02-01", periodEnd: "2026-02-28" };
const period = (id: string, userId: string, p = JAN) => ({ id, userId, periodType: "month" as const, ...p, goalId: null, status: "active" as const, createdBy: null, createdAt: "", updatedAt: "" });
const item = (o: Partial<any> & { id: string; kpiPeriodId: string; metricKey: string; targetValue: number }) => ({
  label: null, unit: "count", targetOperator: ">=", brandId: null, websiteId: null, socialId: null, metadata: {}, createdAt: "", updatedAt: "", ...o,
});
const web = (id: string, writer: string, history: any[], brandId = "br1", websiteId = "w1") =>
  ({ id, title: `Bài ${id}`, writer, brandId, websiteId, type: "Bài mới", status: "Bài viết đã duyệt", deadline: "2026-01-20", draftRevisions: 0, history }) as any;
const okHist = (byId: string, sub = "2026-01-10", app = "2026-01-11") => [
  { at: `${sub}T00:00:00Z`, toStatus: "Chờ duyệt bài", byId }, { at: `${app}T00:00:00Z`, toStatus: "Bài viết đã duyệt", byId: "boss" }];
const data = (webContents: any[] = [], videos: any[] = []) => ({ tasks: [], webContents, socialPosts: [], videos, orders: [] }) as any;
const users = [{ id: "A", fullName: "An" }, { id: "B", fullName: "Bình" }];
const ov = (items: any[], periods: any[], d: any, filters: any = {}) =>
  buildOverview({ users, goals: [], periods, items, adjustments: [], data: d, filters, today: "2026-03-01" });

describe("KPI V2 regression", () => {
  it("Chuyển bài A→B: credit cho người gửi duyệt (A), không cho writer hiện tại (B)", () => {
    const d = data([web("x", "Bình", okHist("A"))]);
    const items = [item({ id: "a", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 1 }), item({ id: "b", kpiPeriodId: "pB", metricKey: "web_content_completed", targetValue: 1 })];
    const o = ov(items, [period("pA", "A"), period("pB", "B")], d);
    const byUser = Object.fromEntries(o.metrics[0].contributions.map((c) => [c.userId, c.actual]));
    expect(byUser.A).toBe(1);
    expect(byUser.B ?? 0).toBe(0);
  });

  it("Duyệt lại không chuyển credit khỏi kỳ duyệt lần đầu", () => {
    const h = [...okHist("A", "2026-01-10", "2026-01-11"), { at: "2026-02-02T00:00:00Z", toStatus: "Cần sửa", byId: "boss" },
      { at: "2026-02-03T00:00:00Z", toStatus: "Chờ duyệt bài", byId: "A" }, { at: "2026-02-04T00:00:00Z", toStatus: "Bài viết đã duyệt", byId: "boss" }];
    const d = data([web("x", "An", h)]);
    const jan = ov([item({ id: "j", kpiPeriodId: "pJ", metricKey: "web_content_completed", targetValue: 1 })], [period("pJ", "A", JAN)], d);
    const feb = ov([item({ id: "f", kpiPeriodId: "pF", metricKey: "web_content_completed", targetValue: 1 })], [period("pF", "A", FEB)], d);
    expect(jan.metrics[0].actual).toBe(1);
    expect(feb.metrics[0].actual).toBe(0);
  });

  it("Lọc Brand với KPI global → chỉ đóng góp, target N/A", () => {
    const o = ov([item({ id: "g", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 30 })], [period("pA", "A")],
      data([web("x", "An", okHist("A"))]), { brandId: "br1" });
    expect([o.metrics[0].target, o.metrics[0].pct, o.metrics[0].contributionActual]).toEqual([0, null, 1]);
  });

  it("Chồng phạm vi: global 10 + Brand 10, 1 bài ở Brand → sản lượng 1, Đang đối soát", () => {
    const items = [item({ id: "g", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 10 }),
      item({ id: "b", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 10, brandId: "br1" })];
    const m = ov(items, [period("pA", "A")], data([web("x", "An", okHist("A"))])).metrics[0];
    expect(m.actual).toBe(1);
    expect(m.target).toBe(10);
    expect(m.uniqueAssets).toBe(1);
    expect(m.overlapItems).toBe(1);
    expect(m.status).toBe("reconciling");
    expect(m.pct).toBeNull();
  });

  it("Các Brand khác nhau không chồng → vẫn cộng", () => {
    const items = [item({ id: "b1", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 5, brandId: "br1" }),
      item({ id: "b2", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 5, brandId: "br2" })];
    const m = ov(items, [period("pA", "A")], data([web("x", "An", okHist("A")), web("y", "An", okHist("A"), "br2", "w2")])).metrics[0];
    expect([m.actual, m.target, m.pct, m.status, m.overlapItems]).toEqual([2, 10, 20, "ok", 0]);
  });

  it("Thiếu bằng chứng: A 1/10 + B thiếu history /10 → xác minh 1, target 20, N/A, không 'Chưa đạt 5%'", () => {
    const items = [item({ id: "a", kpiPeriodId: "pA", metricKey: "web_content_completed", targetValue: 10 }), item({ id: "b", kpiPeriodId: "pB", metricKey: "web_content_completed", targetValue: 10 })];
    const o = ov(items, [period("pA", "A"), period("pB", "B")], data([web("x", "An", okHist("A")), web("y", "Bình", [])]));
    const m = o.metrics[0];
    expect([m.actual, m.target, m.pct, m.status]).toEqual([1, 20, null, "insufficient"]);
    expect(m.unverifiedAssignments).toBe(1);
    expect(o.unmet.length).toBe(0);
  });

  it("Metric chưa sẵn sàng (quay video, điểm thiết kế) không cho giao KPI", () => {
    let db: any = { goals: [], periods: [], items: [], adjustments: [] };
    const repo: KpiRepository = { load: () => db, save: (x: any) => { db = x; } } as any;
    const svc = createKpiService(repo);
    const admin = { id: "adm", isAdmin: true } as any;
    for (const metricKey of ["video_shoot_completed", "design_points_completed"])
      expect(() => svc.assign(admin, { userId: "A", periodType: "month", ...JAN, items: [{ metricKey, targetValue: 1 } as any] })).toThrow(/Chưa sẵn sàng/);
  });

  it("Video thiếu stage event người quay → không chấm 0 như số chính thức", () => {
    const v = { id: "v1", title: "V", brandId: "br1", status: "Đã đăng", shooter: "Bình", history: [] } as any;
    const m = ov([item({ id: "s", kpiPeriodId: "pB", metricKey: "video_shoot_completed", targetValue: 1 })], [period("pB", "B")], data([], [v])).metrics[0];
    expect(m.pct).toBeNull();
  });

  it("Snapshot khóa kỳ: thiếu dữ liệu → incomplete; không snapshot → nguồn live", () => {
    const p = period("pB", "B");
    const it = item({ id: "b", kpiPeriodId: "pB", metricKey: "web_content_completed", targetValue: 10 });
    const r = buildEmployeeReport({ user: users[1], allUsers: users, periods: [p], items: [it] as any, adjustments: [], data: data([web("y", "Bình", [])]), filters: {}, today: "2026-03-01" });
    const snap = buildPeriodSnapshot(p, r.items, "adm", "2026-02-01T00:00:00Z");
    expect(snap.incomplete).toBe(true);
    expect(snap.items[0].actual).toBeNull();
    expect(resolveLockedActual(it as any, 5, null)).toEqual({ actual: 5, source: "live" });
    expect(resolveLockedActual(it as any, 5, snap).source).toBe("snapshot");
  });
});
