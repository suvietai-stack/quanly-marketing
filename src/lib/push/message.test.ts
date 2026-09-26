import { describe, it, expect } from "vitest";
import { pushMessage } from "./message";
describe("pushMessage", () => {
  it("tín hiệu không lộ SĐT/địa chỉ", () => {
    const m = pushMessage("signal_assigned", { customer_name: "An", products: ["Bồn cầu"], phone: "0901", address: "HN" });
    expect(m.body).toContain("Khách hàng: An"); expect(m.body).not.toContain("0901"); expect(m.body).not.toContain("HN");
  });
  it("đơn chờ duyệt không có lý do", () => {
    const m = pushMessage("leave_pending", { type: "leave", owner_name: "B", reason_name: "Ốm", payload: { start_date: "2026-09-28", end_date: "2026-09-29", start_half: "full", end_half: "full" }, calc: { days: 2 } });
    expect(m.body).toContain("Nhân viên: B"); expect(m.body).not.toContain("Ốm"); expect(m.body).not.toContain("undefined");
  });
  it("giải trình không có chi tiết", () => {
    const m = pushMessage("att_witness", { owner_name: "C", work_date: "2026-09-25", kind: "in", time_in: "08:00", time_out: null, detail: "bí mật" });
    expect(m.body).not.toContain("bí mật"); expect(m.body).not.toContain("undefined");
  });
});
