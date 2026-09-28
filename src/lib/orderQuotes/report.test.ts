import { describe, expect, it } from "vitest";
import { aggregate, baseFilter, bucketOf, DEFAULT_FILTERS, distribution, fmtDur, inSpeed, presetRange, speedDenominator, toBounds, type Row } from "./report";

const row = (p: Partial<Row>): Row => ({
  round_id: Math.random().toString(), flow_id: "f", request_id: "r", round_no: 1, kind: "price", flow_code: "YC-1-G", title: "t",
  creator_id: "s1", creator_name: "Sale", assignee_id: "a", assignee_name: "A", items: 1, status: "answered",
  sent_at: "2026-09-10T01:00:00Z", accepted_at: "2026-09-10T01:05:00Z", final_accepted_at: "2026-09-10T01:05:00Z", first_published_at: null,
  completed_at: "2026-09-10T01:20:00Z", wait_sale_sec: 0, info_count: 0, handover: false, response_sec: 1200, process_sec: 900,
  accept_wait_sec: 300, first_pub_sec: null, data_ok: true, scope: "all", ...p,
});

describe("oq report", () => {
  it("Test 3: ngưỡng 15 phút so sánh chính xác từng giây", () => {
    expect(inSpeed(899, { max: 15 })).toBe(true);
    expect(inSpeed(900, { max: 15 })).toBe(true);
    expect(inSpeed(901, { max: 15 })).toBe(false);
    expect(inSpeed(null, { max: 15 })).toBe(false);
  });
  it("Test 2: phương án đầu 10 phút, hoàn thành 40 phút → không thuộc ≤15 phút", () => {
    const r = row({ first_pub_sec: 600, response_sec: 2400, process_sec: 2400 });
    expect(aggregate([r], { speed: { max: 15 }, measure: "response" }).inSpeed).toBe(0);
  });
  it("Test 12 + mẫu số: job chưa xong không vào trung bình; tỷ lệ giữ mẫu số", () => {
    const rows = [row({ process_sec: 600 }), row({ process_sec: 1200 }), row({ status: "processing", completed_at: null, response_sec: null, process_sec: null })];
    const a = aggregate(rows, { speed: { max: 15 }, measure: "process" });
    expect(a.done).toBe(2); expect(a.inSpeed).toBe(1); expect(speedDenominator(a, "process")).toBe(2);
    expect(a.avgProcess).toBe(900); expect(a.open).toBe(1);
  });
  it("Test 6: lọc lượt đầu / hỏi lại", () => {
    const rows = [row({ round_no: 1 }), row({ round_no: 2 })];
    expect(baseFilter(rows, { ...DEFAULT_FILTERS, rounds: "first" })).toHaveLength(1);
    expect(baseFilter(rows, { ...DEFAULT_FILTERS, rounds: "reask" })[0].round_no).toBe(2);
  });
  it("Test 8 + hủy: hai luồng độc lập, hủy không tính hoàn thành", () => {
    const a = aggregate([row({ kind: "price" }), row({ kind: "progress" }), row({ status: "cancelled", completed_at: null, response_sec: null })], { speed: null, measure: "process" });
    expect(a.donePrice).toBe(1); expect(a.doneProgress).toBe(1); expect(a.done).toBe(2); expect(a.cancelled).toBe(1);
  });
  it("phân bố không chồng lấn", () => {
    expect(bucketOf(900).key).toBe("b15"); expect(bucketOf(901).key).toBe("b30"); expect(bucketOf(0).key).toBe("b15");
    expect(distribution([row({ process_sec: 900 }), row({ process_sec: 90000 })], "process").reduce((s, b) => s + b.n, 0)).toBe(2);
  });
  it("Test 4: khoảng tháng theo giờ Việt Nam", () => {
    expect(presetRange("month", "2026-10-15")).toEqual(["2026-10-01", "2026-10-31"]);
    expect(presetRange("last_month", "2026-10-15")).toEqual(["2026-09-01", "2026-09-30"]);
    expect(toBounds(["2026-09-01", "2026-09-30"])).toEqual({ from: "2026-09-01T00:00:00+07:00", to: "2026-10-01T00:00:00+07:00" });
  });
  it("chỉ làm tròn khi hiển thị", () => {
    expect(fmtDur(4800)).toBe("1 giờ 20 phút 00 giây"); expect(fmtDur(null, "Chưa đủ dữ liệu")).toBe("Chưa đủ dữ liệu");
  });
});

describe("fmtDur chính xác đến giây", () => {
  it("các mốc", () => {
    expect(fmtDur(59)).toBe("59 giây");
    expect(fmtDur(61)).toBe("1 phút 01 giây");
    expect(fmtDur(899)).toBe("14 phút 59 giây");
    expect(fmtDur(900)).toBe("15 phút 00 giây");
    expect(fmtDur(901)).toBe("15 phút 01 giây");
    expect(fmtDur(3930)).toBe("1 giờ 05 phút 30 giây");
    expect(fmtDur(3930, "—", true)).toBe("1h 05m 30s");
    expect(fmtDur(90061)).toBe("1 ngày 01 giờ 01 phút 01 giây");
  });
});
