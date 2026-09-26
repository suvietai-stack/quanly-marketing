import { describe, it, expect } from "vitest";
import { leaveMessage, needsRemind, remindMessage } from "./zaloMessage";

const base = { type: "late" as const, payload: { date: "2026-09-28", half: "am", minutes: 30 }, calc: {}, reason_name: "Kẹt xe", owner_name: "An" };

describe("leave zalo message", () => {
  it("pending shows owner, time, reason; no detail", () => {
    const m = leaveMessage("leave_pending", { ...base, detail: "bí mật" } as any);
    expect(m.header).toContain("ĐƠN MỚI CẦN DUYỆT");
    expect(m.text).toContain("An"); expect(m.text).toContain("30 phút"); expect(m.text).toContain("Kẹt xe");
    expect(m.text).not.toContain("bí mật");
  });
  it("skips empty fields", () => {
    const m = leaveMessage("leave_pending", { type: "leave", payload: {}, calc: {} });
    expect(m.text).not.toMatch(/undefined|null/);
  });
  it("reject includes note", () => {
    const m = leaveMessage("leave_result", { ...base, action: "reject", decision_note: "Thiếu người" });
    expect(m.header).toContain("TỪ CHỐI"); expect(m.text).toContain("Thiếu người");
  });
  it("remind rules", () => {
    const now = new Date("2026-09-28T03:00:00Z");
    expect(needsRemind({ status: "pending", submitted_at: "2026-09-27T20:00:00Z", mark_at: "2026-09-30T00:00:00Z" }, 4, now).remind).toBe(true);
    expect(needsRemind({ status: "pending", submitted_at: "2026-09-28T02:00:00Z", mark_at: "2026-09-28T04:00:00Z" }, 4, now).soon).toBe(true);
    expect(needsRemind({ status: "pending", submitted_at: "2026-09-28T02:00:00Z", mark_at: "2026-09-30T00:00:00Z" }, 4, now).remind).toBe(false);
    expect(needsRemind({ status: "approved", submitted_at: "2026-09-20T00:00:00Z", mark_at: "2026-09-28T04:00:00Z" }, 4, now).remind).toBe(false);
    expect(remindMessage(2, 0).text).toBe("Bạn có 2 đơn đang chờ duyệt.");
  });
});
