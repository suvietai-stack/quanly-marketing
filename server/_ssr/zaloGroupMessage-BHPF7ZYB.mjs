import { F as FR_KIND_LABEL, a as FR_STATUS_LABEL, v as vnd } from "./logic-DH2fjerh.mjs";
const FR_ZALO_EVENTS = [
  { key: "submitted", label: "Đề nghị mới gửi duyệt" },
  { key: "info", label: "Yêu cầu bổ sung" },
  { key: "approved", label: "Đã phê duyệt / chờ chi" },
  { key: "rejected", label: "Bị từ chối" },
  { key: "paid", label: "Đã xác nhận chi" },
  { key: "settled", label: "Quyết toán tạm ứng" },
  { key: "deducted", label: "Khấu trừ/hoàn trả lương" },
  { key: "done", label: "Hoàn tất" }
];
const frZaloEventsForKind = (kind) => kind === "advance" ? ["submitted", "info", "approved", "rejected", "paid", "settled", "done"] : kind === "payment" ? ["submitted", "info", "approved", "rejected", "paid", "done"] : ["submitted", "info", "approved", "rejected", "paid", "deducted", "done"];
const EVENT_TITLE = {
  submitted: "MỚI CHỜ DUYỆT",
  info: "CẦN BỔ SUNG",
  approved: "ĐÃ PHÊ DUYỆT",
  rejected: "BỊ TỪ CHỐI",
  paid: "ĐÃ CHI TIỀN",
  settled: "QUYẾT TOÁN TẠM ỨNG",
  deducted: "KHẤU TRỪ LƯƠNG",
  done: "HOÀN TẤT"
};
function frGroupMessage(event, d, link, intro) {
  const head = `${FR_KIND_LABEL[d.kind].toUpperCase()} ${EVENT_TITLE[event]}`;
  const lines = [head];
  if (intro?.trim()) lines.push(intro.trim());
  lines.push(`- Mã đề nghị: ${d.code}`);
  if (d.kind === "salary_advance") {
    lines.push(`- Trạng thái: ${FR_STATUS_LABEL[d.status]}`);
    lines.push("", `Mở Base để xem (cần quyền): ${link}`);
    return lines.join("\n");
  }
  if (d.requester_name) lines.push(`- Người đề nghị: ${d.requester_name}`);
  lines.push(`- Nội dung: ${d.title}`);
  if (d.kind === "payment" && d.lines_count) lines.push(`- Số khoản chi: ${d.lines_count}`);
  lines.push(`- Số tiền: ${vnd(d.amount)}`);
  if (event === "paid" && d.paid_amount != null && d.paid_amount < d.amount)
    lines.push(`- Đã chi: ${vnd(d.paid_amount)} (một phần)`);
  lines.push(`- Trạng thái: ${FR_STATUS_LABEL[d.status]}`);
  lines.push("", `Xem đề nghị: ${link}`);
  return lines.join("\n");
}
function frGroupSummary(event, d) {
  if (d.kind === "salary_advance") return `${d.code} — ${EVENT_TITLE[event]}`;
  return `${d.code} — ${EVENT_TITLE[event]} — ${vnd(d.amount)}`;
}
function frGroupTestMessage(kind, brand, time) {
  return `🧪 [TIN NHẮN KIỂM TRA] ${brand} — ${FR_KIND_LABEL[kind].toUpperCase()}
Đây là tin kiểm tra kết nối nhóm nhận thông báo, không chứa dữ liệu đề nghị thật.
Thời gian: ${time}`;
}
export {
  FR_ZALO_EVENTS as F,
  frGroupSummary as a,
  frGroupTestMessage as b,
  frZaloEventsForKind as c,
  frGroupMessage as f
};
