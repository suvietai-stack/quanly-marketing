import { a as fmtDate, t as todayVn } from "./calc-BK6sHnP3.mjs";
const ATT_TYPE_LABEL = "Giải trình Chấm Công";
const KIND_LABEL = { in: "Quên chấm công vào", out: "Quên chấm công ra", both: "Quên cả hai" };
const WITNESS_LABEL = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", unable: "Không thể xác nhận" };
const DEFAULT_ATT_REASONS = [
  { id: "forgot", name: "Quên thao tác", active: true },
  { id: "device", name: "Thiết bị chấm công gặp sự cố", active: true },
  { id: "network", name: "Sự cố kết nối", active: true },
  { id: "outside", name: "Công tác bên ngoài", active: true },
  { id: "other", name: "Lý do khác", active: true }
];
const ATT_NOTE = "Giải trình được ghi nhận ngay sau khi gửi và chuyển đến bộ phận phụ trách đối chiếu. Việc gửi giải trình không đồng nghĩa với việc thời gian khai báo đã được xác minh.";
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
function validateAtt(f, ownerId, today = todayVn()) {
  if (!f.work_date) return "Vui lòng chọn ngày quên chấm công.";
  if (f.work_date > today) return "Ngày quên chấm công không được ở tương lai.";
  if (!f.kind || !(f.kind in KIND_LABEL)) return "Vui lòng chọn nội dung giải trình.";
  if (f.kind !== "out" && !HM.test(f.time_in || "")) return "Vui lòng nhập Giờ vào hợp lệ.";
  if (f.kind !== "in" && !HM.test(f.time_out || "")) return "Vui lòng nhập Giờ ra hợp lệ.";
  if (f.kind === "both" && f.time_out <= f.time_in) return "Giờ ra phải sau Giờ vào.";
  if (!f.reason_id) return "Vui lòng chọn lý do.";
  if (f.reason_id === "other" && !f.detail?.trim()) return "Chọn Lý do khác thì bắt buộc nhập chi tiết giải trình.";
  if (!f.witness_id) return "Vui lòng chọn người làm chứng.";
  if (f.witness_id === ownerId) return "Không thể tự làm chứng cho chính mình.";
  return null;
}
function declaredTime(a) {
  if (a.kind === "in") return `Vào ${a.time_in ?? "—"}`;
  if (a.kind === "out") return `Ra ${a.time_out ?? "—"}`;
  return `Vào ${a.time_in ?? "—"} · Ra ${a.time_out ?? "—"}`;
}
function declaredShort(a) {
  if (a.kind === "in") return a.time_in ?? "";
  if (a.kind === "out") return a.time_out ?? "";
  return `vào ${a.time_in ?? ""} – ra ${a.time_out ?? ""}`;
}
function attMessage(kind, d, brand = "BASE MARKETING") {
  const base = [
    d.owner_name ? `Nhân viên: ${d.owner_name}` : "",
    `Ngày: ${fmtDate(d.work_date)}`,
    `Nội dung: ${KIND_LABEL[d.kind]}`,
    `Giờ tự khai báo: ${declaredShort(d)}`
  ];
  if (kind === "att_witness") {
    const again = d.action === "edit";
    return { header: `📋 ${brand} — ${again ? "YÊU CẦU XÁC NHẬN LẠI LÀM CHỨNG" : "YÊU CẦU XÁC NHẬN LÀM CHỨNG"}`, text: [...base, again ? "Giải trình đã được sửa, vui lòng xác nhận lại." : "Bạn được chọn làm người làm chứng."].filter(Boolean).join("\n"), button: "XEM VÀ XÁC NHẬN" };
  }
  return { header: `📋 ${brand} — GIẢI TRÌNH CHẤM CÔNG MỚI`, text: [...base, d.witness_name ? `Người làm chứng: ${d.witness_name}` : "", `Trạng thái: ${d.reconciled ? "Đã đối chiếu" : "Chưa đối chiếu"}`].filter(Boolean).join("\n"), button: "XEM GIẢI TRÌNH" };
}
function attInRange(rows, start, end) {
  return rows.filter((a) => !a.recalled && a.work_date >= start && a.work_date <= end);
}
function attSummary(rows) {
  const m = /* @__PURE__ */ new Map();
  for (const a of rows) {
    const r = m.get(a.owner_id) ?? { owner_id: a.owner_id, total: 0, in: 0, out: 0, both: 0, unreconciled: 0, reconciled: 0 };
    r.total++;
    r[a.kind]++;
    if (a.reconciled) r.reconciled++;
    else r.unreconciled++;
    m.set(a.owner_id, r);
  }
  return [...m.values()];
}
export {
  ATT_NOTE,
  ATT_TYPE_LABEL,
  DEFAULT_ATT_REASONS,
  KIND_LABEL,
  WITNESS_LABEL,
  attInRange,
  attMessage,
  attSummary,
  declaredTime,
  validateAtt
};
