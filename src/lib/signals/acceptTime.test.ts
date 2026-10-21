import { describe, expect, it } from "vitest";
import { acceptMinutes, acceptStat, businessMinutes, fmtMinutes } from "./acceptTime";

// Mốc giờ VN (UTC+7)
const vn = (day: string, hm: string) => `${day}T${hm}:00+07:00`;

describe("businessMinutes — khung 08:00–17:00 giờ VN", () => {
  it("08:00 → 08:10 cùng ngày = 10 phút", () => {
    expect(businessMinutes(vn("2026-10-19", "08:00"), vn("2026-10-19", "08:10"))).toBe(10);
  });
  it("09:00 → 09:25 cùng ngày = 25 phút", () => {
    expect(businessMinutes(vn("2026-10-19", "09:00"), vn("2026-10-19", "09:25"))).toBe(25);
  });
  it("16:50 → 17:30 cùng ngày = 10 phút (cắt phần sau 17:00)", () => {
    expect(businessMinutes(vn("2026-10-19", "16:50"), vn("2026-10-19", "17:30"))).toBe(10);
  });
  it("20:00 → 08:10 hôm sau = 10 phút", () => {
    expect(businessMinutes(vn("2026-10-19", "20:00"), vn("2026-10-20", "08:10"))).toBe(10);
  });
  it("16:30 → 08:30 hôm sau = 60 phút", () => {
    expect(businessMinutes(vn("2026-10-19", "16:30"), vn("2026-10-20", "08:30"))).toBe(60);
  });
  it("20:00 → 21:00 cùng ngày = 0 (ngoài giờ, loại khỏi trung bình)", () => {
    expect(businessMinutes(vn("2026-10-19", "20:00"), vn("2026-10-19", "21:00"))).toBe(0);
  });
  it("19:00 → 07:30 hôm sau = 0 (ngoài giờ)", () => {
    expect(businessMinutes(vn("2026-10-19", "19:00"), vn("2026-10-20", "07:30"))).toBe(0);
  });
  it("tiếp nhận trước khi giao → null (không tạo thời gian âm)", () => {
    expect(businessMinutes(vn("2026-10-19", "10:00"), vn("2026-10-19", "09:00"))).toBeNull();
  });
  it("thiếu mốc → null", () => {
    expect(businessMinutes(null, vn("2026-10-19", "09:00"))).toBeNull();
    expect(businessMinutes(vn("2026-10-19", "09:00"), null)).toBeNull();
  });
  it("kéo dài nhiều ngày: 16:00 thứ 6 → 09:00 thứ 2 = 60 + 540 + 540 + 60 phút", () => {
    // 16:00–17:00 (60) + thứ 7 (540) + Chủ nhật (540) + 08:00–09:00 (60) — tính mọi ngày theo lịch
    expect(businessMinutes(vn("2026-10-16", "16:00"), vn("2026-10-19", "09:00"))).toBe(1200);
  });
});

describe("fmtMinutes", () => {
  it("dưới 60 phút", () => expect(fmtMinutes(12)).toBe("12 phút"));
  it("từ 60 phút", () => expect(fmtMinutes(75)).toBe("1 giờ 15 phút"));
  it("tròn giờ", () => expect(fmtMinutes(120)).toBe("2 giờ"));
  it("làm tròn", () => expect(fmtMinutes(10.4)).toBe("10 phút"));
});

const ev = (signal_id: string, to: string | null, created_at: string) => ({ signal_id, kind: "assign", detail: { to }, created_at });
const note = (signal_id: string, author_id: string, created_at: string, status_from: string | null = "waiting") => ({ signal_id, author_id, status_from, created_at });

describe("acceptMinutes — đúng chu kỳ giao/tiếp nhận", () => {
  it("lấy lần giao gần nhất cho Sale hiện tại và lần tiếp nhận sau đó", () => {
    const events = [ev("s1", "a", vn("2026-10-19", "08:00"))];
    const notes = [note("s1", "a", vn("2026-10-19", "08:10"))];
    expect(acceptMinutes({ id: "s1", assigned_to: "a" }, events, notes)).toBe(10);
  });
  it("chuyển Sale A → B: không lấy timestamp giao cũ của A", () => {
    const events = [ev("s1", "a", vn("2026-10-19", "08:00")), ev("s1", "b", vn("2026-10-19", "14:00"))];
    const notes = [note("s1", "a", vn("2026-10-19", "08:10")), note("s1", "b", vn("2026-10-19", "14:30"))];
    expect(acceptMinutes({ id: "s1", assigned_to: "b" }, events, notes)).toBe(30);
  });
  it("chưa tiếp nhận → null", () => {
    expect(acceptMinutes({ id: "s1", assigned_to: "a" }, [ev("s1", "a", vn("2026-10-19", "08:00"))], [])).toBeNull();
  });
  it("thiếu sự kiện giao (dữ liệu cũ) → null, không tự điền 0", () => {
    expect(acceptMinutes({ id: "s1", assigned_to: "a" }, [], [note("s1", "a", vn("2026-10-19", "08:10"))])).toBeNull();
  });
  it("nhật ký của người khác không tính là tiếp nhận", () => {
    const events = [ev("s1", "a", vn("2026-10-19", "08:00"))];
    const notes = [note("s1", "b", vn("2026-10-19", "08:10"))];
    expect(acceptMinutes({ id: "s1", assigned_to: "a" }, events, notes)).toBeNull();
  });
  it("chưa phân công → null", () => {
    expect(acceptMinutes({ id: "s1", assigned_to: null }, [], [])).toBeNull();
  });
});

describe("acceptStat — trung bình chỉ trên mẫu hợp lệ > 0", () => {
  it("(10 + 20) / 2 = 15, tín hiệu ngoài giờ không chia vào trung bình", () => {
    const signals = [{ id: "a", assigned_to: "s" }, { id: "b", assigned_to: "s" }, { id: "c", assigned_to: "s" }];
    const events = [
      ev("a", "s", vn("2026-10-19", "08:00")),
      ev("b", "s", vn("2026-10-19", "09:00")),
      ev("c", "s", vn("2026-10-19", "20:00")),
    ];
    const notes = [
      note("a", "s", vn("2026-10-19", "08:10")),
      note("b", "s", vn("2026-10-19", "09:20")),
      note("c", "s", vn("2026-10-19", "20:05")), // ngoài giờ → 0 phút
    ];
    const r = acceptStat(signals, events, notes);
    expect(r.avg).toBe(15);
    expect(r.valid).toBe(2);
    expect(r.accepted).toBe(3); // vẫn đếm đủ đã tiếp nhận
  });
  it("không có mẫu hợp lệ → avg null (hiển thị —)", () => {
    const r = acceptStat([{ id: "c", assigned_to: "s" }], [ev("c", "s", vn("2026-10-19", "20:00"))], [note("c", "s", vn("2026-10-19", "20:05"))]);
    expect(r.avg).toBeNull();
    expect(r.valid).toBe(0);
    expect(r.accepted).toBe(1);
  });
});
