import { describe, it, expect } from "vitest";
import { applyMapping, validateMapping, suggestMapping, copyMapping, normalizePhone, vnDate, type Mapping, type FormField, type Catalogs } from "./mapping";

const fields: FormField[] = [
  { key: "name", label: "Họ tên" },
  { key: "phone", label: "Số điện thoại" },
  { key: "email", label: "Email" },
  { key: "product", label: "Sản phẩm", type: "select", options: [{ value: "Gốm" }, { value: "Sứ" }] },
  { key: "message", label: "Lời nhắn" },
];
const cat: Catalogs = { products: ["Gốm sứ", "Đồ gia dụng"], need_groups: ["Quà tặng", "Doanh nghiệp"] };
const SRC = "Website Xưởng Gốm";

const base: Mapping = {
  customer_name: { mode: "website", key: "name" },
  phone: { mode: "website", key: "phone" },
};

describe("validateMapping", () => {
  it("hợp lệ khi 2 trường bắt buộc lấy từ trường có thật", () => {
    expect(validateMapping(base, fields, cat, SRC)).toEqual([]);
  });
  it("báo lỗi khi thiếu trường bắt buộc", () => {
    const errs = validateMapping({ customer_name: { mode: "empty" } }, fields, cat, SRC);
    expect(errs.join()).toContain("Khách hàng");
    expect(errs.join()).toContain("Số điện thoại");
  });
  it("báo lỗi khi trường nguồn không còn trong Form", () => {
    const m: Mapping = { ...base, customer_name: { mode: "website", key: "gone" } };
    expect(validateMapping(m, fields, cat, SRC).join()).toContain("không còn trong Form");
  });
  it("báo lỗi khi giá trị mặc định ngoài danh mục", () => {
    const m: Mapping = { ...base, products: { mode: "default", value: ["Lạ"] } };
    expect(validateMapping(m, fields, cat, SRC).join()).toContain("không còn trong danh mục");
  });
  it("báo lỗi khi Website chưa chọn nguồn", () => {
    expect(validateMapping(base, fields, cat, null).join()).toContain("Nguồn tín hiệu");
  });
  it("compose phải có ít nhất một trường", () => {
    const m: Mapping = { ...base, need_detail: { mode: "compose", keys: [] } };
    expect(validateMapping(m, fields, cat, SRC).join()).toContain("chưa chọn trường để ghép");
  });
});

describe("applyMapping", () => {
  it("ánh xạ cơ bản và chuẩn hóa SĐT", () => {
    const r = applyMapping(base, { name: "Anh Nam", phone: "+84 912 345 678" }, fields, cat, SRC, "2026-10-26T09:00:00+07:00");
    expect(r.ok && r.draft.customer_name).toBe("Anh Nam");
    expect(r.ok && r.draft.phone).toBe("0912345678");
    expect(r.ok && r.draft.source).toBe(SRC);
    expect(r.ok && r.draft.detected_on).toBe("2026-10-26");
  });
  it("giá trị mặc định dạng multi", () => {
    const m: Mapping = { ...base, products: { mode: "default", value: ["Gốm sứ"] } };
    const r = applyMapping(m, { name: "A", phone: "0912345678" }, fields, cat, SRC, "2026-10-26T00:00:00Z");
    expect(r.ok && r.draft.products).toEqual(["Gốm sứ"]);
  });
  it("valueMap ánh xạ đáp án sang danh mục, bỏ giá trị không khớp", () => {
    const m: Mapping = { ...base, products: { mode: "website", key: "product", valueMap: { Gốm: "Gốm sứ" } } };
    const r = applyMapping(m, { name: "A", phone: "0912345678", product: ["Gốm", "Khác"] }, fields, cat, SRC, "2026-10-26T00:00:00Z");
    expect(r.ok && r.draft.products).toEqual(["Gốm sứ"]);
  });
  it("ghép nhiều trường thành nhiều dòng, bỏ trường rỗng", () => {
    const m: Mapping = { ...base, need_detail: { mode: "compose", keys: ["email", "message"] } };
    const r = applyMapping(m, { name: "A", phone: "0912345678", email: "a@b.c", message: "" }, fields, cat, SRC, "2026-10-26T00:00:00Z");
    expect(r.ok && r.draft.need_detail).toBe("Email: a@b.c");
  });
  it("thiếu trường bắt buộc → lỗi, không tạo draft sai", () => {
    const r = applyMapping(base, { name: "", phone: "0912" }, fields, cat, SRC, "2026-10-26T00:00:00Z");
    expect(!r.ok && r.error).toContain("Khách hàng");
  });
  it("chế độ empty cho giá trị mặc định rỗng", () => {
    const m: Mapping = { ...base, address: { mode: "empty" } };
    const r = applyMapping(m, { name: "A", phone: "0912345678" }, fields, cat, SRC, "2026-10-26T00:00:00Z");
    expect(r.ok && r.draft.address).toBeNull();
  });
});

describe("suggestMapping / copyMapping", () => {
  it("gợi ý theo khóa phổ biến", () => {
    const m = suggestMapping({}, fields);
    expect(m.customer_name).toEqual({ mode: "website", key: "name" });
    expect(m.phone).toEqual({ mode: "website", key: "phone" });
    expect(m.marketing_note).toEqual({ mode: "website", key: "message" });
  });
  it("sao chép sang Form khác, loại trường không tồn tại", () => {
    const src: Mapping = { ...base, marketing_note: { mode: "website", key: "message" } };
    const { mapping, dropped } = copyMapping(src, [{ key: "name", label: "Tên" }]);
    expect(mapping.customer_name).toEqual({ mode: "website", key: "name" });
    expect(dropped).toEqual(["message"]);
    expect(mapping.phone).toBeUndefined();
  });
});

describe("helpers", () => {
  it("normalizePhone bỏ ký tự lạ, đổi +84", () => {
    expect(normalizePhone("+84-912-345-678")).toBe("0912345678");
    expect(normalizePhone("0912 345 678")).toBe("0912345678");
  });
  it("vnDate theo giờ Việt Nam", () => {
    expect(vnDate("2026-10-25T18:30:00Z")).toBe("2026-10-26");
  });
});
