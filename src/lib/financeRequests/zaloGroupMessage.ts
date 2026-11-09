// Mẫu tin nhóm Zalo cho 3 chức năng tài chính. Thuần chuỗi, không gọi IO — dễ kiểm thử.
// Tạm Ứng Lương: TUYỆT ĐỐI không đưa tên nhân viên, số tiền, lý do, kỳ lương, tài khoản ngân hàng vào tin nhóm.
import { FR_KIND_LABEL, FR_STATUS_LABEL, vnd, type FrKind, type FrStatus } from "./logic";

export type FrZaloEvent = "submitted" | "info" | "approved" | "rejected" | "paid" | "settled" | "deducted" | "done";

export const FR_ZALO_EVENTS: { key: FrZaloEvent; label: string }[] = [
  { key: "submitted", label: "Đề nghị mới gửi duyệt" },
  { key: "info", label: "Yêu cầu bổ sung" },
  { key: "approved", label: "Đã phê duyệt / chờ chi" },
  { key: "rejected", label: "Bị từ chối" },
  { key: "paid", label: "Đã xác nhận chi" },
  { key: "settled", label: "Quyết toán tạm ứng" },
  { key: "deducted", label: "Khấu trừ/hoàn trả lương" },
  { key: "done", label: "Hoàn tất" },
];

/** Sự kiện áp dụng theo chức năng (ẩn sự kiện không liên quan khỏi cài đặt). */
export const frZaloEventsForKind = (kind: FrKind): FrZaloEvent[] =>
  kind === "advance"
    ? ["submitted", "info", "approved", "rejected", "paid", "settled", "done"]
    : kind === "payment"
      ? ["submitted", "info", "approved", "rejected", "paid", "done"]
      : ["submitted", "info", "approved", "rejected", "paid", "deducted", "done"];

const EVENT_TITLE: Record<FrZaloEvent, string> = {
  submitted: "MỚI CHỜ DUYỆT",
  info: "CẦN BỔ SUNG",
  approved: "ĐÃ PHÊ DUYỆT",
  rejected: "BỊ TỪ CHỐI",
  paid: "ĐÃ CHI TIỀN",
  settled: "QUYẾT TOÁN TẠM ỨNG",
  deducted: "KHẤU TRỪ LƯƠNG",
  done: "HOÀN TẤT",
};

export type FrZaloMsgData = {
  kind: FrKind;
  code: string;
  title: string;
  amount: number;
  requester_name: string | null;
  status: FrStatus;
  lines_count?: number;
  paid_amount?: number;
};

/** Nội dung tin nhóm. Lời dẫn tùy chỉnh (intro) chỉ là văn bản tĩnh do quản trị nhập, không chứa biến. */
export function frGroupMessage(event: FrZaloEvent, d: FrZaloMsgData, link: string, intro?: string | null): string {
  const head = `${FR_KIND_LABEL[d.kind].toUpperCase()} ${EVENT_TITLE[event]}`;
  const lines: string[] = [head];
  if (intro?.trim()) lines.push(intro.trim());
  lines.push(`- Mã đề nghị: ${d.code}`);

  if (d.kind === "salary_advance") {
    // Mẫu an toàn: chỉ mã + trạng thái + liên kết. Không tên, không số tiền, không lý do.
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

/** Tóm tắt lưu lịch sử gửi (không chứa dữ liệu nhạy cảm của lương). */
export function frGroupSummary(event: FrZaloEvent, d: FrZaloMsgData): string {
  if (d.kind === "salary_advance") return `${d.code} — ${EVENT_TITLE[event]}`;
  return `${d.code} — ${EVENT_TITLE[event]} — ${vnd(d.amount)}`;
}

/** Tin kiểm tra: nhãn rõ ràng, không dữ liệu thật. */
export function frGroupTestMessage(kind: FrKind, brand: string, time: string): string {
  return `🧪 [TIN NHẮN KIỂM TRA] ${brand} — ${FR_KIND_LABEL[kind].toUpperCase()}\nĐây là tin kiểm tra kết nối nhóm nhận thông báo, không chứa dữ liệu đề nghị thật.\nThời gian: ${time}`;
}
