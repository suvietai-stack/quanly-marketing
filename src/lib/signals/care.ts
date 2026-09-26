/** Nhắc chăm sóc tín hiệu — hàm thuần dùng chung cho máy chủ, trang Tín hiệu và Báo cáo. */
export interface CareCfg { waitHours: number; staleDays: number }
export const DEFAULT_CARE: CareCfg = { waitHours: 24, staleDays: 3 };
export type CareFlag = "unaccepted" | "stale_contact" | "stale_quote" | null;

export interface CareSignal {
  status: string | null; assigned_to: string | null; assigned_at: string | null; cancelled_at?: string | null;
}
export interface CareNote { author_id: string; created_at: string }

const H = 3600000;

/** Mốc hoạt động gần nhất của Sale hiện tại (không dùng ngày tạo tín hiệu). */
export function lastCareActivity(s: CareSignal, notes: CareNote[]): number | null {
  if (!s.assigned_to || !s.assigned_at) return null;
  let t = new Date(s.assigned_at).getTime();
  for (const n of notes) {
    if (n.author_id !== s.assigned_to) continue;
    const nt = new Date(n.created_at).getTime();
    if (nt > t) t = nt;
  }
  return t;
}

export function careFlag(s: CareSignal, notes: CareNote[], now = Date.now(), cfg: CareCfg = DEFAULT_CARE): CareFlag {
  if (!s.assigned_to || !s.assigned_at || s.cancelled_at || !s.status) return null;
  const last = lastCareActivity(s, notes);
  if (last == null) return null;
  if (s.status === "waiting") return now - new Date(s.assigned_at).getTime() > cfg.waitHours * H ? "unaccepted" : null;
  const stale = now - last > cfg.staleDays * 24 * H;
  if (!stale) return null;
  if (s.status === "contacting" || s.status === "consulting") return "stale_contact";
  if (s.status === "quoted" || s.status === "deposit") return "stale_quote";
  return null;
}

export const daysSince = (t: number | null, now = Date.now()) => (t == null ? 0 : Math.floor((now - t) / (24 * H)));

export interface CareCount { unaccepted: number; stale_contact: number; stale_quote: number; total: number }
export function countCare(flags: CareFlag[]): CareCount {
  const c = { unaccepted: 0, stale_contact: 0, stale_quote: 0, total: 0 };
  for (const f of flags) if (f) { c[f]++; c.total++; }
  return c;
}

export function careMessage(name: string, c: CareCount): string {
  return [
    "NHẮC CHĂM SÓC TÍN HIỆU", "", `Chào ${name}!`, "", `Bạn có ${c.total} tín hiệu cần kiểm tra:`, "",
    `🔴 Chưa tiếp nhận: ${c.unaccepted}`, `🟠 Lâu chưa cập nhật: ${c.stale_contact + c.stale_quote}`, "",
    "Trong đó:", `• Đang liên hệ / tư vấn: ${c.stale_contact}`, `• Đã báo giá / Chờ cọc: ${c.stale_quote}`,
  ].join("\n");
}
