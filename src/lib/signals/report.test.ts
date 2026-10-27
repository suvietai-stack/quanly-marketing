import { describe, expect, it } from "vitest";
import { filterSignals, summarize, trendSeries, weekStart, reportInsights, groupBy } from "./report";
import { normalizePhone, type Signal } from "./catalog";

const mk = (o: Partial<Signal>): Signal => ({
  id: Math.random().toString(), detected_on: "2026-09-10", customer_name: "A", phone: "0965000256", address: null,
  need_detail: null, products: [], need_group: null, source: "Website", marketing_note: null, created_by: "m1",
  assigned_to: null, assigned_at: null, status: null, next_contact_on: null, next_contact_at: null, revenue: null, lost_reason: null,
  closed_at: null, created_at: "2026-09-10T02:00:00Z", updated_at: "2026-09-10T02:00:00Z", ...o,
});

describe("signals report", () => {
  const list = [
    mk({ detected_on: "2026-08-28", assigned_to: "julia", status: "won", revenue: 10_000_000, closed_at: "2026-09-03T03:00:00Z" }),
    mk({ detected_on: "2026-09-05", assigned_to: "julia", status: "lost", lost_reason: "Giá không phù hợp", closed_at: "2026-09-06T03:00:00Z" }),
    mk({ detected_on: "2026-09-12", assigned_to: "hoa", status: "consulting", next_contact_on: "2026-09-13" }),
    mk({ detected_on: "2026-09-15" }),
  ];
  it("tỷ lệ chốt = chốt/tổng tín hiệu hợp lệ, doanh số chỉ tính Chốt", () => {
    const s = summarize(list, "2026-09-20");
    expect(s.total).toBe(4);
    expect(s.unassigned).toBe(1);
    expect(s.closeRate).toBe(25);
    expect(s.revenue).toBe(10_000_000);
    expect(s.overdue).toBe(1);
  });
  it("chưa chốt → 0%, không có tín hiệu → không có tỷ lệ", () => {
    expect(summarize([mk({})]).closeRate).toBe(0);
    expect(summarize([]).closeRate).toBeNull();
  });
  it("tín hiệu hủy không vào mẫu số", () => {
    const l = [...list, mk({ cancelled_at: "2026-09-11T00:00:00Z" } as any)];
    expect(summarize(filterSignals(l, { basis: "created" })).closeRate).toBe(25);
  });
  it("lọc theo ngày tạo và ngày chốt khác nhau", () => {
    const sep = { from: "2026-09-01", to: "2026-09-30" };
    expect(filterSignals(list, { ...sep, basis: "created" }).length).toBe(3);
    const byClosed = filterSignals(list, { ...sep, basis: "closed" });
    expect(byClosed.length).toBe(2);
    expect(summarize(byClosed).revenue).toBe(10_000_000);
  });
  it("lọc chưa phân công và theo Sale", () => {
    expect(filterSignals(list, { basis: "created", status: "unassigned" }).length).toBe(1);
    expect(filterSignals(list, { basis: "created", saleId: "julia" }).length).toBe(2);
  });
  it("SĐT giữ số 0 đầu", () => {
    expect(normalizePhone(" 0965 000 256 ")).toBe("0965000256");
    expect(normalizePhone("abc")).toBeNull();
  });
});

describe("xu hướng tín hiệu", () => {
  it("gom theo ngày: created = tạo trong ngày, won = tạo trong ngày hiện đã chốt", () => {
    const l = [
      mk({ detected_on: "2026-10-01", status: "won" }),
      mk({ detected_on: "2026-10-01", status: "lost" }),
      mk({ detected_on: "2026-10-03", status: "consulting" }),
    ];
    const t = trendSeries(l, "day");
    expect(t.map((x) => [x.label, x.created, x.won])).toEqual([["01/10", 2, 1], ["03/10", 1, 0]]);
  });
  it("tuần bắt đầu Thứ Hai; tháng theo YYYY-MM", () => {
    expect(weekStart("2026-10-27")).toBe("2026-10-26"); // Thứ Ba → Thứ Hai
    expect(weekStart("2026-10-26")).toBe("2026-10-26");
    expect(weekStart("2026-11-01")).toBe("2026-10-26"); // Chủ nhật vẫn thuộc tuần trước
    const t = trendSeries([mk({ detected_on: "2026-10-27" }), mk({ detected_on: "2026-10-30", status: "won" })], "week");
    expect(t).toHaveLength(1);
    expect(t[0].label).toBe("Tuần 26/10");
    expect([t[0].created, t[0].won]).toEqual([2, 1]);
    expect(trendSeries([mk({ detected_on: "2026-09-15" }), mk({ detected_on: "2026-10-01" })], "month").map((x) => x.label)).toEqual(["09/2026", "10/2026"]);
  });
});

describe("điểm đáng chú ý", () => {
  const sum = summarize([
    mk({ source: "Facebook", status: "won" }), mk({ source: "Facebook" }), mk({ source: "Facebook" }),
    mk({ source: "Facebook" }), mk({ source: "Facebook" }), mk({ source: "Facebook" }),
    mk({ source: "Website", status: "won" }), mk({ source: "Website", status: "won" }),
    mk({ status: "waiting", assigned_to: "s1" }),
  ]);
  it("không kết luận nguồn tốt nhất khi mẫu nhỏ", () => {
    const ins = reportInsights({ sum, bySource: groupBy(sum ? [mk({ source: "Facebook" }), mk({ source: "Website", status: "won" })] : [], (s) => s.source), byNeed: [] });
    const rate = ins.find((i) => i.kind === "rate")!;
    expect(rate.text).toContain("Website");
    expect(rate.note).toContain("Mẫu nhỏ");
  });
  it("mẫu đủ lớn thì không ghi chú; tồn đọng = chưa phân công + chờ nhận", () => {
    const src = groupBy([
      ...Array.from({ length: 6 }, () => mk({ source: "Facebook", status: "won" })),
      ...Array.from({ length: 6 }, () => mk({ source: "Website" })),
    ], (s) => s.source);
    const ins = reportInsights({ sum: summarize([mk({ status: "waiting", assigned_to: "s1" }), mk({})]), bySource: src, byNeed: [] });
    expect(ins.find((i) => i.kind === "rate")!.note).toBeUndefined();
    expect(ins.find((i) => i.kind === "rate")!.text).toContain("Facebook");
    const backlog = ins.find((i) => i.kind === "backlog")!;
    expect(backlog.text).toContain("2 tín hiệu (1 chưa phân công, 1 chờ nhận)");
  });
  it("không có dữ liệu thì không có nhận định", () => {
    expect(reportInsights({ sum: summarize([]), bySource: [], byNeed: [] })).toEqual([]);
  });
});
