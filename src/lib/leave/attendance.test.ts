import { describe, it, expect } from "vitest";
import { validateAtt, attMessage, attSummary, attInRange, type AttExplanation } from "./attendance";

const ok = { work_date: "2026-09-25", kind: "in" as const, time_in: "08:05", time_out: "", reason_id: "forgot", detail: "", witness_id: "w" };
describe("giải trình chấm công", () => {
  it("quên vào / ra / cả hai", () => {
    expect(validateAtt(ok, "me", "2026-09-26")).toBeNull();
    expect(validateAtt({ ...ok, kind: "out", time_out: "17:40", time_in: "" }, "me", "2026-09-26")).toBeNull();
    expect(validateAtt({ ...ok, kind: "both", time_out: "17:40" }, "me", "2026-09-26")).toBeNull();
    expect(validateAtt({ ...ok, kind: "both", time_out: "07:00" }, "me", "2026-09-26")).toMatch(/Giờ ra/);
    expect(validateAtt({ ...ok, kind: "out", time_out: "" }, "me", "2026-09-26")).toMatch(/Giờ ra/);
  });
  it("không tự làm chứng, lý do khác cần chi tiết, không ngày tương lai", () => {
    expect(validateAtt({ ...ok, witness_id: "me" }, "me", "2026-09-26")).toMatch(/chính mình/);
    expect(validateAtt({ ...ok, reason_id: "other" }, "me", "2026-09-26")).toMatch(/chi tiết/);
    expect(validateAtt({ ...ok, work_date: "2026-09-27" }, "me", "2026-09-26")).toMatch(/tương lai/);
  });
  it("tin Zalo không chứa chi tiết", () => {
    const m = attMessage("att_witness", { owner_name: "An", work_date: "2026-09-28", kind: "in", time_in: "08:05", time_out: null }, "BASE");
    expect(m.header).toContain("YÊU CẦU XÁC NHẬN LÀM CHỨNG");
    expect(m.text).toContain("Giờ tự khai báo: 08:05");
    const n = attMessage("att_new", { owner_name: "An", witness_name: "Hoa", work_date: "2026-09-28", kind: "both", time_in: "08:05", time_out: "17:30" });
    expect(n.text).toContain("Người làm chứng: Hoa");
    expect(n.text).toContain("Chưa đối chiếu");
    expect(n.text).not.toContain("undefined");
  });
  it("báo cáo theo ngày quên, bỏ đơn thu hồi", () => {
    const a = (o: Partial<AttExplanation>) => ({ owner_id: "u", kind: "in", recalled: false, reconciled: false, work_date: "2026-09-10", ...o }) as AttExplanation;
    const rows = attInRange([a({}), a({ kind: "both", reconciled: true }), a({ recalled: true }), a({ work_date: "2026-10-01" })], "2026-09-01", "2026-09-30");
    expect(attSummary(rows)).toEqual([{ owner_id: "u", total: 2, in: 1, out: 0, both: 1, unreconciled: 1, reconciled: 1 }]);
  });
});
