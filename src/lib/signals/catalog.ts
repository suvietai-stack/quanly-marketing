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
  potential?: 'high' | 'medium' | 'low' | 'unrated';
  potential_updated_by?: string | null;
  potential_updated_at?: string | null;
  label_ids?: string[];
  id: string;
  detected_on: string;
  customer_name: string;
  phone: string;
  address: string | null;
  need_detail: string | null;
  products: string[];
  need_group: string | null;
  need_groups?: string[];
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

/* ---------- Danh mục tùy chỉnh: Nhóm sản phẩm / Nhóm nhu cầu ---------- */
export type OptionScope = "signal_sources" | "signal_products" | "signal_need_groups";
export interface CatOption { name: string; active: boolean }
export const DEFAULT_OPTIONS: Record<OptionScope, readonly string[]> = { signal_sources: SIGNAL_SOURCES, signal_products: SIGNAL_PRODUCTS, signal_need_groups: SIGNAL_NEED_GROUPS };
/** So khớp tên không phân biệt hoa/thường và khoảng trắng thừa. */
export const normName = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
export const cleanName = (s: string) => s.trim().replace(/\s+/g, " ");
/** Danh mục lưu trữ; chưa có thì dùng mặc định. "Khác" luôn ở cuối. */
export function resolveOptions(stored: unknown, scope: OptionScope): CatOption[] {
  const list: CatOption[] = Array.isArray(stored) && stored.length
    ? stored.filter((x: any) => x && typeof x.name === "string").map((x: any) => ({ name: x.name, active: x.active !== false }))
    : DEFAULT_OPTIONS[scope].map((name) => ({ name, active: true }));
  return list;
}
export function addOption(list: CatOption[], name: string): CatOption[] {
  const n = cleanName(name);
  if (!n) throw new Error("Tên không được để trống");
  if (list.some((o) => normName(o.name) === normName(n))) throw new Error("Lựa chọn này đã có trong danh mục");
  return [...list, { name: n, active: true }];
}
export function renameOption(list: CatOption[], from: string, to: string): CatOption[] {
  const n = cleanName(to);
  if (!n) throw new Error("Tên không được để trống");
  if (list.some((o) => o.name !== from && normName(o.name) === normName(n))) throw new Error("Tên này đã tồn tại");
  return list.map((o) => (o.name === from ? { ...o, name: n } : o));
}
/** Đổi vị trí hiển thị (dir -1 lên, +1 xuống). */
export function moveOption(list: CatOption[], name: string, dir: -1 | 1): CatOption[] {
  const i = list.findIndex((o) => o.name === name); const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const next = [...list]; [next[i], next[j]] = [next[j], next[i]]; return next;
}
export const removeOption = (list: CatOption[], name: string): CatOption[] => list.filter((o) => o.name !== name);
export const toggleOption = (list: CatOption[], name: string): CatOption[] => list.map((o) => (o.name === name ? { ...o, active: !o.active } : o));
/** Nhóm nhu cầu của tín hiệu (hỗ trợ dữ liệu cũ chỉ có 1 nhóm). */
export const needGroupsOf = (s: { need_groups?: string[] | null; need_group: string | null }) =>
  s.need_groups && s.need_groups.length ? s.need_groups : s.need_group ? [s.need_group] : [];
