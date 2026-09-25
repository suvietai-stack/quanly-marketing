import { describe, expect, it, vi } from "vitest";
import { applyListFilter, filterSignals, lostReasons, summarize } from "./report";
import { SIGNAL_STATUSES, STATUS_LABEL, isOpen, zaloLink, type Signal } from "./catalog";
import { fetchAll } from "./api";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

const mk = (o: Partial<Signal>): Signal => ({
  id: Math.random().toString(), detected_on: "2026-09-20", customer_name: "A", phone: "0965000256", address: null,
  need_detail: null, products: [], need_group: null, source: "Website", marketing_note: null, created_by: "m1",
  assigned_to: "julia", assigned_at: null, status: "consulting", next_contact_on: null, revenue: null, lost_reason: null,
  closed_at: null, created_at: "2026-09-20T02:00:00Z", updated_at: "2026-09-20T02:00:00Z", ...o,
});
const T = "2026-09-25";

describe("7 trạng thái", () => {
  it("đủ 7 nhãn, 4 mã cũ vẫn hợp lệ", () => {
    expect(SIGNAL_STATUSES.length).toBe(7);
    for (const k of ["waiting", "consulting", "won", "lost"]) expect(STATUS_LABEL[k as keyof typeof STATUS_LABEL]).toBeTruthy();
    expect(isOpen("quoted")).toBe(true);
    expect(isOpen("won")).toBe(false);
  });
  it("tổng quan đếm từng trạng thái", () => {
    const s = summarize([mk({ status: "contacting" }), mk({ status: "quoted" }), mk({ status: "deposit" }), mk({ assigned_to: null, status: null })], T);
    expect([s.contacting, s.quoted, s.deposit, s.unassigned]).toEqual([1, 1, 1, 1]);
  });
});

describe("bộ lọc danh sách", () => {
  const list = [
    mk({ id: "a", status: "quoted", next_contact_on: T }),
    mk({ id: "b", status: "deposit", next_contact_on: "2026-09-20" }),
    mk({ id: "c", status: "waiting", detected_on: "2026-08-01" }),
    mk({ id: "d", status: "lost", lost_reason: "Khác: khách đi nước ngoài", next_contact_on: null }),
  ];
  const f = (o: any) => applyListFilter(list, { quick: "all", time: "", ...o }, T, {}).map((s) => s.id).sort();
  it("lọc nhanh theo trạng thái", () => {
    expect(f({ quick: "quoted" })).toEqual(["a"]);
    expect(f({ quick: "deposit" })).toEqual(["b"]);
    expect(f({ quick: "lost" })).toEqual(["d"]);
    expect(f({ quick: "won" })).toEqual([]);
  });
  it("thời gian + trạng thái kết hợp", () => {
    expect(f({ time: "month" })).toEqual(["a", "b", "d"]);
    expect(f({ time: "7d", quick: "quoted" })).toEqual(["a"]);
    expect(f({ time: "custom", from: "2026-08-01", to: "2026-08-31" })).toEqual(["c"]);
  });
  it("lý do Khác; sắp xếp theo cập nhật mới nhất", () => {
    expect(f({ lostReason: "Khác" })).toEqual(["d"]);
    const sorted = applyListFilter([mk({ id: "old" }), mk({ id: "new", updated_at: "2026-09-24T00:00:00Z" })], { quick: "all", time: "" }, T,
      { old: { signal_id: "old", created_at: "2026-09-25T00:00:00Z", event_type: null, note: "x" } }).map((s) => s.id);
    expect(sorted).toEqual(["old", "new"]);
  });
  it("phân tích lý do trượt gom lý do tùy chỉnh về Khác", () => {
    expect(lostReasons(list)).toEqual([{ key: "Khác", n: 1 }]);
  });
});

describe("tải dữ liệu không bị cắt", () => {
  it("đọc hết nhiều trang", async () => {
    const total = 2500;
    const rows = await fetchAll<number>(async (a, b) => ({ data: Array.from({ length: Math.max(0, Math.min(b, total - 1) - a + 1) }, (_, i) => a + i), error: null }));
    expect(rows.length).toBe(2500);
  });
});

it("link Zalo đổi 0 đầu thành 84", () => {
  expect(zaloLink("0965 000 256")).toBe("https://zalo.me/84965000256");
});

describe("hủy tín hiệu", () => {
  const list = [mk({ id: "x", status: "lost", lost_reason: "Giá không phù hợp" }), mk({ id: "y", status: "lost", lost_reason: "Khác", cancelled_at: "2026-09-21T00:00:00Z" })];
  it("hủy không bị tính là Trượt, ẩn khỏi danh sách thường", () => {
    expect(summarize(filterSignals(list, { basis: "created" }), T).lost).toBe(1);
    expect(applyListFilter(list, { quick: "all", time: "" }, T).map((s) => s.id)).toEqual(["x"]);
    expect(applyListFilter(list, { quick: "all", time: "", cancelled: true }, T).map((s) => s.id)).toEqual(["y"]);
  });
});
