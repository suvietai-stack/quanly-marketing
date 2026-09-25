import { describe, expect, it } from "vitest";
import { filterSignals, summarize } from "./report";
import { normalizePhone, type Signal } from "./catalog";

const mk = (o: Partial<Signal>): Signal => ({
  id: Math.random().toString(), detected_on: "2026-09-10", customer_name: "A", phone: "0965000256", address: null,
  need_detail: null, products: [], need_group: null, source: "Website", marketing_note: null, created_by: "m1",
  assigned_to: null, assigned_at: null, status: null, next_contact_on: null, revenue: null, lost_reason: null,
  closed_at: null, created_at: "2026-09-10T02:00:00Z", updated_at: "2026-09-10T02:00:00Z", ...o,
});

describe("signals report", () => {
  const list = [
    mk({ detected_on: "2026-08-28", assigned_to: "julia", status: "won", revenue: 10_000_000, closed_at: "2026-09-03T03:00:00Z" }),
    mk({ detected_on: "2026-09-05", assigned_to: "julia", status: "lost", lost_reason: "Giá không phù hợp", closed_at: "2026-09-06T03:00:00Z" }),
    mk({ detected_on: "2026-09-12", assigned_to: "hoa", status: "consulting", next_contact_on: "2026-09-13" }),
    mk({ detected_on: "2026-09-15" }),
  ];
  it("tỷ lệ chốt = chốt/(chốt+trượt), doanh số chỉ tính Chốt", () => {
    const s = summarize(list, "2026-09-20");
    expect(s.total).toBe(4);
    expect(s.unassigned).toBe(1);
    expect(s.closeRate).toBe(50);
    expect(s.revenue).toBe(10_000_000);
    expect(s.overdue).toBe(1);
  });
  it("chưa có tín hiệu kết thúc → không có tỷ lệ", () => {
    expect(summarize([mk({})]).closeRate).toBeNull();
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
