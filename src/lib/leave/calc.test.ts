import { describe, it, expect } from "vitest";
import { evalLeave, evalShift, deadlineOf, fmtVn, type LeaveSettings } from "./calc";

const S: LeaveSettings = {
  schedule: { "1": { am: true, pm: true }, "2": { am: true, pm: true }, "3": { am: true, pm: true }, "4": { am: true, pm: true }, "5": { am: true, pm: true }, "6": { am: true, pm: false }, "7": { am: false, pm: false } },
  sessions: { am: { start: "08:00", end: "12:00" }, pm: { start: "13:30", end: "17:30" } },
  session_value: 0.5, holidays: [],
  deadlines: { leave_hours: 12, late_minutes: 5, early_minutes: 5 },
  recall_minutes: { leave: 0, late: 0, early: 0 }, reasons: [],
};
// 2026-09-28 is Monday.
describe("leave calc", () => {
  it("nửa ngày", () => {
    const r = evalLeave(S, { start_date: "2026-09-28", start_half: "pm", end_date: "2026-09-28", end_half: "pm" });
    expect(r.ok && r.days).toBe(0.5);
  });
  it("1,5 ngày (sáng T2 → hết sáng T3)", () => {
    const r = evalLeave(S, { start_date: "2026-09-28", start_half: "am", end_date: "2026-09-29", end_half: "am" });
    expect(r.ok && r.days).toBe(1.5);
    expect(r.ok && fmtVn(r.markAt)).toBe("08:00 ngày 28/09/2026");
  });
  it("qua thứ Bảy, Chủ nhật", () => {
    const r = evalLeave(S, { start_date: "2026-10-02", start_half: "am", end_date: "2026-10-05", end_half: "pm" });
    expect(r.ok && r.days).toBe(2.5); // T6 1 + T7 0.5 + CN 0 + T2 1
  });
  it("qua hai tháng", () => {
    const r = evalLeave(S, { start_date: "2026-09-30", start_half: "am", end_date: "2026-10-01", end_half: "pm" });
    expect(r.ok && r.details?.map((d) => d.date)).toEqual(["2026-09-30", "2026-10-01"]);
  });
  it("chỉ Chủ nhật → không hợp lệ", () => {
    const r = evalLeave(S, { start_date: "2026-10-04", start_half: "am", end_date: "2026-10-04", end_half: "pm" });
    expect(r.ok).toBe(false);
  });
  it("ngày lễ không tính", () => {
    const r = evalLeave({ ...S, holidays: [{ date: "2026-09-29" }] }, { start_date: "2026-09-28", start_half: "am", end_date: "2026-09-29", end_half: "pm" });
    expect(r.ok && r.days).toBe(1);
  });
  it("đi muộn 5 và 60 phút", () => {
    const a = evalShift(S, "late", { date: "2026-09-28", half: "am", minutes: 5 });
    const b = evalShift(S, "late", { date: "2026-09-28", half: "am", minutes: 60 });
    expect(a.ok && fmtVn(a.expectedAt!, false)).toBe("08:05");
    expect(b.ok && fmtVn(b.expectedAt!, false)).toBe("09:00");
  });
  it("về sớm thứ Bảy dùng giờ hết buổi sáng", () => {
    const r = evalShift(S, "early", { date: "2026-10-03", half: "am", minutes: 60 });
    expect(r.ok && fmtVn(r.expectedAt!, false)).toBe("11:00");
    expect(evalShift(S, "early", { date: "2026-10-03", half: "pm", minutes: 60 }).ok).toBe(false);
  });
  it("thời gian không hợp lệ (vượt buổi, không nhảy qua nghỉ trưa)", () => {
    expect(evalShift(S, "early", { date: "2026-09-28", half: "pm", minutes: 240 }).ok).toBe(false);
    expect(evalShift(S, "late", { date: "2026-09-28", half: "am", minutes: 0 }).ok).toBe(false);
  });
  it("hạn chót 12 giờ", () => {
    const r = evalLeave(S, { start_date: "2026-09-28", start_half: "am", end_date: "2026-09-28", end_half: "am" });
    expect(r.ok && fmtVn(deadlineOf(S, "leave", r.markAt))).toBe("20:00 ngày 27/09/2026");
  });
  it("chưa cấu hình giờ", () => {
    const r = evalShift({ ...S, sessions: { am: { start: null, end: null }, pm: { start: null, end: null } } }, "late", { date: "2026-09-28", half: "am", minutes: 5 });
    expect(r.ok).toBe(false);
  });
});
