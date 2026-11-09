import { normName } from './catalog';
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
/** Lưu hợp lệ khi có nội dung diễn biến hoặc đổi trạng thái; đổi trạng thái đơn thuần không tính một lượt note (is_progression=false phía máy chủ). */
export const canSaveProgression = (note: string, statusChanged: boolean) => statusChanged || note.trim().length > 0;