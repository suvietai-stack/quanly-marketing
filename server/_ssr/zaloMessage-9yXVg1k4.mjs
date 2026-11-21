import { S as STATUS_LABEL } from "./catalog-BGi2Ua05.mjs";
const list = (a) => (a ?? []).map((x) => (x ?? "").trim()).filter(Boolean).join(", ");
const line = (icon, label, v) => v && v.trim() ? `${icon} ${label}: ${v.trim()}` : null;
const vnDate = (d) => {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
};
function signalMessage(kind, s, brand = "BASE MARKETING") {
  const needs = list(s.need_groups?.length ? s.need_groups : s.need_group ? [s.need_group] : []);
  const common = [
    line("🏢", "Khách hàng", s.customer_name),
    line("📦", "Sản phẩm", list(s.products)),
    line("🎯", "Nhu cầu", needs),
    line("🌐", "Nguồn", s.source)
  ];
  if (kind === "signal_new") {
    return {
      header: `🔔 ${brand}`,
      button: "XEM VÀ PHÂN CÔNG",
      text: ["TÍN HIỆU MỚI CẦN PHÂN CÔNG", "", ...common, line("📅", "Ngày tạo", vnDate(s.detected_on ?? s.created_at)), "👤 Phụ trách: Chưa phân công"].filter((x) => x !== null).join("\n")
    };
  }
  const st = s.status ? STATUS_LABEL[s.status] ?? null : null;
  return {
    header: `🎯 ${brand}`,
    button: "XEM VÀ TIẾP NHẬN",
    text: ["BẠN ĐƯỢC GIAO TÍN HIỆU MỚI", "", ...common, line("📌", "Trạng thái", st)].filter((x) => x !== null).join("\n")
  };
}
export {
  signalMessage
};
