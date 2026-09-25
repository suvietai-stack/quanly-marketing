/** Danh mục dùng chung cho module Tín hiệu cơ hội — chỉ sửa ở đây. */
export const SIGNAL_PRODUCTS = ["Ấm chén", "Ly cốc", "Bát đĩa", "Bình hoa", "Bộ đồ ăn", "Quà tặng gốm sứ", "Khác"] as const;
export const SIGNAL_NEED_GROUPS = ["Sứ quà tặng", "Bát đĩa nhà hàng", "Sản xuất theo yêu cầu", "Xuất khẩu", "Nhập sỉ", "Khác"] as const;
export const SIGNAL_SOURCES = ["Website", "Facebook", "TikTok", "Zalo", "Google Maps", "Hotline", "Marketing chủ động tìm kiếm", "Giới thiệu", "Khác"] as const;
/** Lý do trượt mặc định. Lưu dạng chữ nên đổi danh mục không làm sai lịch sử cũ. */
export const SIGNAL_LOST_REASONS = [
  "Số điện thoại sai", "Không liên lạc được", "Không còn nhu cầu", "Nhu cầu không phù hợp", "Giá không phù hợp",
  "Đã chọn nhà cung cấp khác", "Không đáp ứng yêu cầu sản phẩm", "Không đáp ứng thời gian giao hàng", "Khác",
] as const;
export const SIGNAL_EVENTS = [
  "Đã liên hệ khách", "Khách phản hồi, có nhu cầu", "Đã gửi mẫu / Catalogue", "Khách yêu cầu báo giá", "Đã gửi báo giá",
  "Khách yêu cầu điều chỉnh", "Khách đồng ý đặt hàng", "Đã xác nhận đặt cọc", "Khác",
] as const;
export const SIGNAL_CHANNELS = ["Zalo", "Gọi điện", "Gặp trực tiếp", "Email", "Khác"] as const;

export const SIGNAL_STATUSES = ["waiting", "contacting", "consulting", "quoted", "deposit", "won", "lost"] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];
export const OPEN_STATUSES: SignalStatus[] = ["waiting", "contacting", "consulting", "quoted", "deposit"];
export const STATUS_LABEL: Record<SignalStatus, string> = {
  waiting: "Chờ nhận", contacting: "Đang liên hệ", consulting: "Đang tư vấn", quoted: "Đã báo giá",
  deposit: "Chờ xác nhận / cọc", won: "Chốt", lost: "Trượt",
};
export const STATUS_TONE: Record<SignalStatus | "none", string> = {
  none: "bg-muted text-muted-foreground",
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  contacting: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  consulting: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  quoted: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  deposit: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  lost: "bg-destructive/15 text-destructive",
};
export const statusLabel = (s: string | null | undefined) => (s ? STATUS_LABEL[s as SignalStatus] ?? s : "—");
export const isOpen = (s: string | null | undefined) => !!s && OPEN_STATUSES.includes(s as SignalStatus);

export interface Signal {
  id: string;
  detected_on: string;
  customer_name: string;
  phone: string;
  address: string | null;
  need_detail: string | null;
  products: string[];
  need_group: string | null;
  source: string;
  marketing_note: string | null;
  created_by: string;
  assigned_to: string | null;
  assigned_at: string | null;
  status: SignalStatus | null;
  next_contact_on: string | null;
  next_contact_at?: string | null;
  revenue: number | null;
  lost_reason: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  /** Hủy (khác Trượt): loại khỏi báo cáo thường nhưng giữ lịch sử. */
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  cancel_reason?: string | null;
}

/** Tóm tắt diễn biến gần nhất của 1 tín hiệu (từ nhật ký). */
export interface LastNote { signal_id: string; created_at: string; event_type: string | null; note: string | null }

/** Chuẩn hóa SĐT: giữ số 0 đầu, bỏ khoảng trắng/dấu. Trả null nếu không hợp lệ. */
export function normalizePhone(v: string): string | null {
  const s = v.trim().replace(/[\s.\-()]/g, "");
  if (!/^\+?\d{9,15}$/.test(s)) return null;
  return s;
}

/** Link Zalo theo số VN (0xxx → 84xxx). Không bảo đảm mở thẳng được cuộc trò chuyện. */
export function zaloLink(phone: string): string {
  const d = phone.replace(/[^\d]/g, "");
  return `https://zalo.me/${d.startsWith("0") ? "84" + d.slice(1) : d}`;
}

export function maskPhone(p: string): string {
  if (p.length < 7) return "***";
  return `${p.slice(0, 4)}***${p.slice(-3)}`;
}

export const fmtVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " ₫";

export function todayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(d);
}

export function isOverdue(s: Pick<Signal, "status" | "next_contact_on">, today = todayKey()): boolean {
  return !!s.next_contact_on && s.next_contact_on < today && isOpen(s.status);
}
export function isDueToday(s: Pick<Signal, "status" | "next_contact_on">, today = todayKey()): boolean {
  return !!s.next_contact_on && s.next_contact_on === today && isOpen(s.status);
}
