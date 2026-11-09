import { describe, it, expect } from "vitest";
import {
  frGroupMessage, frGroupSummary, frGroupTestMessage, frZaloEventsForKind, FR_ZALO_EVENTS,
} from "./zaloGroupMessage";

const base = {
  code: "TT-0001", title: "Thanh toán in catalogue", amount: 2200000,
  requester_name: "Nguyễn Văn A", status: "pending" as const, lines_count: 3, paid_amount: 0,
};

describe("fr group messages", () => {
  it("payment message carries code, requester, lines count and total", () => {
    const m = frGroupMessage("submitted", { ...base, kind: "payment" }, "https://base.suviet.vn/finance/payment?open=x");
    expect(m).toContain("ĐỀ NGHỊ THANH TOÁN MỚI CHỜ DUYỆT");
    expect(m).toContain("TT-0001");
    expect(m).toContain("Nguyễn Văn A");
    expect(m).toContain("Số khoản chi: 3");
    expect(m).toContain("2.200.000 đ");
    expect(m).toContain("https://base.suviet.vn/finance/payment?open=x");
  });
  it("partial payment shows paid amount", () => {
    const m = frGroupMessage("paid", { ...base, kind: "payment", paid_amount: 1000000, status: "awaiting_payment" as const }, "l");
    expect(m).toContain("Đã chi: 1.000.000 đ (một phần)");
  });
  it("salary advance never leaks name, amount, reason or period", () => {
    const d = { ...base, kind: "salary_advance" as const, code: "UL-0001", title: "Ứng lương tháng 11", amount: 9000000, requester_name: "Lê Minh Ngọc" };
    for (const ev of frZaloEventsForKind("salary_advance")) {
      const m = frGroupMessage(ev, d, "https://base.suviet.vn/finance/salary?open=x");
      expect(m).toContain("UL-0001");
      expect(m).not.toContain("Lê Minh Ngọc");
      expect(m).not.toContain("9.000.000");
      expect(m).not.toContain("Ứng lương tháng 11");
      expect(frGroupSummary(ev, d)).not.toContain("9.000.000");
    }
  });
  it("custom intro is included as static text", () => {
    const m = frGroupMessage("submitted", { ...base, kind: "advance" }, "l", "Kính gửi anh/chị kế toán,");
    expect(m).toContain("Kính gửi anh/chị kế toán,");
  });
  it("test message is clearly labelled and data-free", () => {
    const m = frGroupTestMessage("payment", "BASE SỨ VIỆT", "09/11/2026 08:00:00");
    expect(m).toContain("[TIN NHẮN KIỂM TRA]");
    expect(m).not.toContain("Nguyễn");
  });
  it("each kind only offers its relevant events", () => {
    expect(frZaloEventsForKind("advance")).toContain("settled");
    expect(frZaloEventsForKind("payment")).not.toContain("settled");
    expect(frZaloEventsForKind("salary_advance")).toContain("deducted");
    expect(frZaloEventsForKind("payment")).not.toContain("deducted");
    expect(FR_ZALO_EVENTS).toHaveLength(8);
  });
});
