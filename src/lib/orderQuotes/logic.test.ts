import { describe, expect, it } from "vitest";
import { copyText, missing, progressCount, requestedCats, totalQty, flowStatusLabel, qtySummary } from "./logic";
import { oqStillValid, oqLink, oqZaloMessage } from "./notify";

const items = [
  { id: "a", code: "PA01", name: "Bộ ấm A", qty: 500, unit: "bộ" },
  { id: "b", code: "PA02", name: "Bộ ấm B", qty: 500, unit: "bộ" },
  { id: "c", code: "PA03", name: "Bộ ấm C", qty: 500, unit: "bộ" },
];
const cfg = { items: { a: { product: { on: true }, box: { on: true } }, b: { product: { on: true } }, c: { product: { on: true }, shipping: { on: true } } } };
const pub = (target: string, content: any, version = 1) => ({ target, version, is_published: true, content });

describe("order quotes logic", () => {
  it("chỉ yêu cầu hạng mục Sale chọn", () => {
    expect(requestedCats(cfg, "a")).toEqual(["product", "box"]);
    expect(requestedCats({ ...cfg, shipping_mode: "common" }, "c")).toEqual(["product"]);
  });
  it("công bố một phần không đủ để hoàn tất, báo đúng hạng mục thiếu", () => {
    const r = [pub("a", { product: "85.000đ", box: "28.000đ" }), pub("b", { product: "90.000đ" })];
    expect(missing("price", items, cfg, r)).toEqual(["PA03 Bộ ấm C: Giá sản phẩm", "PA03 Bộ ấm C: Giá vận chuyển"]);
    expect(progressCount("price", items, cfg, r)).toEqual({ done: 2, total: 3, shipping: null });
  });
  it("bản nháp không được tính", () => {
    const r = [{ target: "a", version: null, is_published: false, content: { product: "x", box: "y" } }];
    expect(missing("price", [items[0]], cfg, r).length).toBe(2);
  });
  it("dùng phiên bản mới nhất", () => {
    const r = [pub("a", { product: "1", box: "2" }, 1), pub("a", { product: "3", box: "" }, 2)];
    expect(missing("price", [items[0]], cfg, r)).toEqual(["PA01 Bộ ấm A: Giá hộp"]);
  });
  it("vận chuyển chung là một đích riêng", () => {
    const c2 = { ...cfg, shipping_mode: "common" as const };
    const r = items.map((i) => pub(i.id, { product: "1", box: "1" }));
    expect(missing("price", items, c2, r)).toEqual(["Giá vận chuyển chung"]);
    expect(progressCount("price", items, c2, r)).toEqual({ done: 3, total: 3, shipping: false });
    expect(progressCount("price", items, c2, [...r, pub("shipping", { shipping: "500k" })])).toEqual({ done: 3, total: 3, shipping: true });
  });
  it("tiến độ: mỗi sản phẩm cần phản hồi", () => {
    expect(missing("progress", items, {}, [pub("a", { reply: "15/10" })]).length).toBe(2);
  });
  it("phương án thay thế không cộng số lượng", () => {
    expect(totalQty("option", items)).toBeNull();
    expect(totalQty("bundle", items)).toBe(1500);
  });
  it("không cộng khác đơn vị", () => {
    expect(qtySummary("bundle", [{ qty: 500, unit: "bộ" }, { qty: 300, unit: "chiếc" }, { qty: 100, unit: "Bộ" }])).toBe("3 dòng sản phẩm · 600 bộ + 300 chiếc");
    expect(qtySummary("option", items)).toContain("không cộng");
  });
  it("sao chép chỉ lấy bản đã công bố", () => {
    const t = copyText("price", items, cfg, [pub("a", { product: "85.000đ" }), { target: "b", version: null, is_published: false, content: { product: "NHÁP" } }]);
    expect(t).toContain("85.000đ");
    expect(t).not.toContain("NHÁP");
  });
  it("nhãn hoàn tất theo luồng", () => {
    expect(flowStatusLabel("price", "answered")).toBe("Đã báo giá");
    expect(flowStatusLabel("progress", "answered")).toBe("Đã phản hồi tiến độ");
  });
});

describe("order quotes notify", () => {
  const f = { assignee_id: "u2", status: "pending", waiting_info: false };
  const r = { creator_id: "u1", status: "submitted" };
  it("không gửi tin chờ xử lý cho người đã bị thay", () => {
    expect(oqStillValid("oq_new", "u2", f, r)).toBe(true);
    expect(oqStillValid("oq_new", "u3", f, r)).toBe(false);
    expect(oqStillValid("oq_new", "u2", { ...f, status: "processing" }, r)).toBe(false);
    expect(oqStillValid("oq_done", "u1", f, { ...r, status: "cancelled" })).toBe(false);
  });
  it("tin gộp hai luồng còn hợp lệ khi một luồng đã tiếp nhận", () => {
    const sib = [{ assignee_id: "u2", status: "processing", waiting_info: false }, { assignee_id: "u2", status: "pending", waiting_info: false }];
    expect(oqStillValid("oq_new", "u2", sib[0], r, { both: true }, sib)).toBe(true);
    expect(oqStillValid("oq_new", "u2", sib[0], r, { both: true }, [sib[0], { ...sib[1], status: "processing" }])).toBe(false);
  });
  it("link mở đúng luồng, tin không lộ giá", () => {
    expect(oqLink("r1", "f1")).toBe("/order-quotes/r1?flow=f1");
    expect(oqZaloMessage("oq_new", { code: "YC-0001", title: "Quà tết", both: true }).text).toContain("Hỏi Giá + Hỏi Tiến Độ");
  });
});
