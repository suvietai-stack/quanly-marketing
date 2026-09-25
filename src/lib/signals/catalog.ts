/** Danh mục dùng chung cho module Tín hiệu cơ hội — chỉ sửa ở đây. */
export const SIGNAL_PRODUCTS = ["Ấm chén", "Ly cốc", "Bát đĩa", "Bình hoa", "Bộ đồ ăn", "Quà tặng gốm sứ", "Khác"] as const;
export const SIGNAL_NEED_GROUPS = ["Sứ quà tặng", "Bát đĩa nhà hàng", "Sản xuất theo yêu cầu", "Xuất khẩu", "Nhập sỉ", "Khác"] as const;
export const SIGNAL_SOURCES = ["Website", "Facebook", "TikTok", "Zalo", "Google Maps", "Hotline", "Marketing chủ động tìm kiếm", "Giới thiệu", "Khác"] as const;
export const SIGNAL_LOST_REASONS = ["Không liên hệ được", "Giá không phù hợp", "Khách chưa có nhu cầu", "Chọn nhà cung cấp khác", "Không đáp ứng yêu cầu", "Khác"] as const;

export type SignalStatus = "waiting" | "consulting" | "won" | "lost";
export const STATUS_LABEL: Record<SignalStatus, string> = {
  waiting: "Chờ nhận", consulting: "Đang tư vấn", won: "Chốt", lost: "Trượt",
};
export const STATUS_TONE: Record<SignalStatus | "none", string> = {
  none: "bg-muted text-muted-foreground",
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  consulting: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  lost: "bg-destructive/15 text-destructive",
};

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
  revenue: number | null;
  lost_reason: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Chuẩn hóa SĐT: giữ số 0 đầu, bỏ khoảng trắng/dấu. Trả null nếu không hợp lệ. */
export function normalizePhone(v: string): string | null {
  const s = v.trim().replace(/[\s.\-()]/g, "");
  if (!/^\+?\d{9,15}$/.test(s)) return null;
  return s;
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
  return !!s.next_contact_on && s.next_contact_on < today && (s.status === "waiting" || s.status === "consulting");
}
export function isDueToday(s: Pick<Signal, "status" | "next_contact_on">, today = todayKey()): boolean {
  return !!s.next_contact_on && s.next_contact_on <= today && (s.status === "waiting" || s.status === "consulting");
}
