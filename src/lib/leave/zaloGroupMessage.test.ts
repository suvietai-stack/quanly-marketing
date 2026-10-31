import { describe, expect, it } from "vitest";
import { groupMessage, groupNewMessage, groupReassignMessage, groupResultMessage, groupSummary, groupTimeLines, groupTypeLabel, type GroupMsgData } from "./zaloGroupMessage";

const LINK = "https://base.suviet.vn/leave?open=abc";
const leave: GroupMsgData = {
  type: "leave", is_late: false,
  payload: { start_date: "2026-11-02", end_date: "2026-11-02", start_half: "am", end_half: "pm" },
  calc: { days: 1 },
  owner_name: "Nguyễn Văn A", department: "Kinh doanh Sứ Quà Tặng 1",
  approver_name: "Trung Hiếu", submitted_at: "2026-10-31T07:30:00Z",
};
const late: GroupMsgData = {
  type: "late", is_late: false,
  payload: { date: "2026-11-02", half: "am", minutes: 30 },
  calc: { session_start: "08:00", expected_at: "2026-11-02T01:30:00Z" },
  owner_name: "Nguyễn Văn A", approver_name: "Trung Hiếu", submitted_at: "2026-10-31T07:30:00Z",
};
const early: GroupMsgData = {
  type: "early", is_late: false,
  payload: { date: "2026-11-02", half: "pm", minutes: 45 },
  calc: { session_end: "17:00", expected_at: "2026-11-02T09:15:00Z" },
  owner_name: "Nguyễn Văn A", approver_name: "Trung Hiếu",
};

describe("groupTypeLabel", () => {
  it("ghi rõ ĐƠN BỔ SUNG khi đơn gửi sau sự việc", () => {
    expect(groupTypeLabel({ ...leave, is_late: true })).toBe("Nghỉ phép — ĐƠN BỔ SUNG");
    expect(groupTypeLabel(leave)).toBe("Nghỉ phép");
  });
});

describe("groupTimeLines", () => {
  it("nghỉ phép: khoảng ngày + số ngày nghỉ", () => {
    expect(groupTimeLines(leave)).toEqual(["📅 Thời gian: Sáng 02/11/2026 → hết chiều 02/11/2026", "⏳ Số ngày nghỉ: 1 ngày"]);
  });
  it("đi muộn: ngày áp dụng + giờ vào ca theo lịch + giờ dự kiến đến", () => {
    const lines = groupTimeLines(late);
    expect(lines[0]).toBe("📅 Ngày áp dụng: 02/11/2026 (Sáng)");
    expect(lines[1]).toBe("🕒 Giờ vào ca theo lịch: 08:00");
    expect(lines[2]).toBe("🕒 Giờ dự kiến đến: 08:30");
  });
  it("về sớm: giờ kết thúc theo lịch + giờ dự kiến về", () => {
    const lines = groupTimeLines(early);
    expect(lines[1]).toBe("🕒 Giờ kết thúc theo lịch: 17:00");
    expect(lines[2]).toBe("🕒 Giờ dự kiến về: 16:15");
  });
});

describe("groupNewMessage", () => {
  it("đủ nhân viên, bộ phận, loại đơn, thời gian, đích danh người duyệt và link", () => {
    const m = groupNewMessage(leave, LINK);
    expect(m).toContain("📋 CÓ ĐƠN NGHỈ PHÉP MỚI");
    expect(m).toContain("👤 Nhân viên: Nguyễn Văn A");
    expect(m).toContain("🏢 Bộ phận: Kinh doanh Sứ Quà Tặng 1");
    expect(m).toContain("📝 Loại đơn: Nghỉ phép");
    expect(m).toContain("🕒 Gửi lúc: 14:30 ngày 31/10/2026");
    expect(m).toContain("👨‍💼 NGƯỜI DUYỆT: TRUNG HIẾU");
    expect(m).toContain("⏳ Trạng thái: Chờ Trung Hiếu phê duyệt");
    expect(m).toContain(LINK);
  });
  it("đơn bổ sung ghi rõ trên tiêu đề và loại đơn", () => {
    const m = groupNewMessage({ ...late, is_late: true }, LINK);
    expect(m).toContain("📋 CÓ ĐƠN ĐI MUỘN MỚI (ĐƠN BỔ SUNG)");
    expect(m).toContain("Đi muộn — ĐƠN BỔ SUNG");
  });
  it("bỏ dòng bộ phận khi không xác định được", () => {
    const m = groupNewMessage({ ...leave, department: null }, LINK);
    expect(m).not.toContain("🏢");
  });
  it("không chứa lý do chi tiết hay ghi chú nhạy cảm", () => {
    const m = groupNewMessage({ ...leave, payload: { ...leave.payload, detail: "ốm đau bí mật" } }, LINK);
    expect(m).not.toContain("ốm đau");
  });
});

describe("groupResultMessage", () => {
  it("đã duyệt: trạng thái và người duyệt", () => {
    const m = groupResultMessage("approved", { ...leave, decided_by_name: "Trung Hiếu" }, LINK);
    expect(m).toContain("✅ ĐƠN ĐÃ ĐƯỢC PHÊ DUYỆT");
    expect(m).toContain("👨‍💼 Người duyệt: Trung Hiếu");
    expect(m).toContain("✅ Trạng thái: Đã duyệt");
    expect(m).toContain(LINK);
  });
  it("từ chối: không lộ ghi chú từ chối", () => {
    const m = groupResultMessage("rejected", { ...late, decided_by_name: "Trung Hiếu" }, LINK);
    expect(m).toContain("❌ ĐƠN KHÔNG ĐƯỢC PHÊ DUYỆT");
    expect(m).toContain("👨‍💼 Người xử lý: Trung Hiếu");
    expect(m).toContain("❌ Trạng thái: Từ chối");
    expect(m).not.toContain("Ghi chú");
  });
});

describe("groupReassignMessage", () => {
  it("ghi người duyệt cũ và mới, trạng thái chờ người mới", () => {
    const m = groupReassignMessage({ ...leave, old_approver_name: "Trung Hiếu", approver_name: "Nguyễn Văn B" }, LINK);
    expect(m).toContain("🔄 THAY ĐỔI NGƯỜI PHÊ DUYỆT");
    expect(m).toContain("👨‍💼 Người duyệt cũ: Trung Hiếu");
    expect(m).toContain("👨‍💼 NGƯỜI DUYỆT MỚI: NGUYỄN VĂN B");
    expect(m).toContain("⏳ Trạng thái: Chờ Nguyễn Văn B phê duyệt");
  });
});

describe("groupMessage/groupSummary", () => {
  it("điều phối đúng theo sự kiện", () => {
    expect(groupMessage("new", leave, LINK)).toContain("CÓ ĐƠN NGHỈ PHÉP MỚI");
    expect(groupMessage("approved", leave, LINK)).toContain("ĐÃ ĐƯỢC PHÊ DUYỆT");
    expect(groupMessage("rejected", leave, LINK)).toContain("KHÔNG ĐƯỢC PHÊ DUYỆT");
    expect(groupMessage("reassign", leave, LINK)).toContain("THAY ĐỔI NGƯỜI PHÊ DUYỆT");
  });
  it("tóm tắt lịch sử gồm tên nhân viên và loại đơn", () => {
    expect(groupSummary({ ...leave, is_late: true })).toBe("Nguyễn Văn A · Nghỉ phép — ĐƠN BỔ SUNG");
  });
});
