import { isOpen, normName, type Signal } from './catalog';
export const INITIAL_PROGRESS = 5;
export const RECENT_DAYS = 7;
export const DUPLICATE_SECONDS = 60;
export const DAY_MS = 86400000;
export interface ProgressionRow { signal_id: string; total: number; last_at: string | null; period_updates: number; authors: Record<string, number> }
export interface ProgressionNote { note: string | null; event_type: string | null; is_progression?: boolean | null }
/** Mirrors signal_note_is_progression; does not classify system events as consultations. */
export function validProgression(n: ProgressionNote) {
  return n.is_progression ?? (n.event_type?.trim() !== 'Đã tiếp nhận' && (!!n.note?.trim() || !!n.event_type?.trim() && !['Đã tiếp nhận', 'Khác'].includes(n.event_type.trim())));
}
export const QUICK_PROGRESS = [
  { label: 'Tư vấn', items: ['Đã kết nối Zalo với khách', 'Đang tư vấn sản phẩm', 'Đã gửi hình ảnh / mẫu', 'Đã gửi báo giá'] },
  { label: 'Phản hồi', items: ['Khách đang cân nhắc', 'Khách chưa phản hồi', 'Khách chê giá cao', 'Khách cần trao đổi nội bộ', 'Khách yêu cầu điều chỉnh', 'Khách hẹn phản hồi sau', 'Khách đang xem báo giá'] },
  { label: 'Tiến triển', items: ['Đang thương lượng', 'Đã nhắn nhắc khách', 'Khách yêu cầu thêm thông tin', 'Khách đang xác nhận đơn', 'Khách đồng ý đặt hàng'] },
];
const GIFT_PROGRESS = { label: 'Sứ quà tặng', items: ['Đang thiết kế maket', 'Đã gửi maket cho khách', 'Khách yêu cầu chỉnh sửa maket', 'Đang chờ khách duyệt maket', 'Khách đã duyệt maket', 'Đang tư vấn mẫu và bao bì', 'Đang tư vấn in logo'] };
export const progressionSuggestions = (groups: string[]) => groups.some(g => normName(g) === normName('Sứ quà tặng')) ? [...QUICK_PROGRESS, GIFT_PROGRESS] : QUICK_PROGRESS;
export const composeProgression = (selected: string[], extra: string) => [...selected, extra.trim()].filter(Boolean).join('\n');
export function progressionState(s: Pick<Signal,'status'|'assigned_at'|'cancelled_at'>, row?: ProgressionRow, now = Date.now()) {
  const open = isOpen(s.status) && !s.cancelled_at;
  const last = row?.last_at ? Date.parse(row.last_at) : null;
  const assigned = s.assigned_at ? Date.parse(s.assigned_at) : null;
  // Reassignment grants a new Sale a fresh window, without erasing lifetime history.
  const baseline = Math.max(last ?? -Infinity, assigned ?? -Infinity);
  const known = Number.isFinite(baseline);
  return { open, total: Number(row?.total ?? 0), recent: open && last != null && last <= now && now-last <= RECENT_DAYS*DAY_MS, stale: open && known && now-baseline > RECENT_DAYS*DAY_MS, below: open && Number(row?.total ?? 0)<INITIAL_PROGRESS, last };
}
export interface ProgressionMetrics { open: number; recent: number; rate: number | null; stale: number; below: number; updates: number }
export function progressionMetrics(signals: Signal[], periodSignals: Signal[], rows: Record<string,ProgressionRow>, now = Date.now(), author?: string): ProgressionMetrics {
  const result: ProgressionMetrics = { open:0,recent:0,rate:null,stale:0,below:0,updates:0 };
  for (const s of signals) {
    if (s.cancelled_at) continue;
    const st = progressionState(s,rows[s.id],now);
    if (st.open) result.open++;
    if (st.recent) result.recent++;
    if (st.stale) result.stale++;
    if (st.below) result.below++;
  }
  for (const s of periodSignals) if (!s.cancelled_at) result.updates += Number(author ? rows[s.id]?.authors[author] ?? 0 : rows[s.id]?.period_updates ?? 0);
  result.rate=result.open ? result.recent/result.open*100 : null;
  return result;
}