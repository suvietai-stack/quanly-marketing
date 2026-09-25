import { describe, it, expect } from "vitest";
import { addOption, renameOption, resolveOptions, toggleOption, needGroupsOf } from "./catalog";
describe("danh mục tín hiệu", () => {
  const base = resolveOptions(null, "signal_need_groups");
  it("mặc định giữ danh mục hiện có, Khác ở cuối", () => { expect(base.at(-1)!.name).toBe("Khác"); expect(base.length).toBe(6); });
  it("chặn trùng hoa/thường/khoảng trắng", () => { expect(() => addOption(base, "  sứ   QUÀ tặng ")).toThrow(); expect(addOption(base, "Quà tặng sự kiện").length).toBe(7); });
  it("đổi tên không trùng", () => { expect(() => renameOption(base, "Xuất khẩu", "nhập sỉ")).toThrow(); });
  it("ngừng dùng giữ nguyên lựa chọn", () => { const t = toggleOption(base, "Xuất khẩu"); expect(t.find((o) => o.name === "Xuất khẩu")!.active).toBe(false); expect(t.length).toBe(6); });
  it("dữ liệu cũ 1 nhóm vẫn đọc được", () => { expect(needGroupsOf({ need_group: "Nhập sỉ" })).toEqual(["Nhập sỉ"]); expect(needGroupsOf({ need_groups: ["A", "B"], need_group: "A" })).toEqual(["A", "B"]); });
});
