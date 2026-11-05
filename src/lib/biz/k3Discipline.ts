export interface K3DisciplineDay {
  user_id: string; name: string; department: string | null; date: string;
  obligated: boolean; plan_status: 'on_time' | 'late' | 'none' | 'na' | 'unobserved';
  plan_source: 'self' | 'scheduled' | 'mixed' | null; manual_status: 'none' | 'reviewed' | 'reconfirm';
  summary_late: boolean; confirmed_at: string | null; system_status: string;
}
export const planLabels = { on_time: 'Đúng hạn', late: 'Thiết lập muộn', none: 'Chưa thiết lập', na: 'Không áp dụng', unobserved: 'Chưa có dấu mốc' };
export const sourceLabels = { self: 'Tự tạo', scheduled: 'Theo lộ trình', mixed: 'Kết hợp' };
export function disciplineTotals(rows: K3DisciplineDay[]) {
  const duty = rows.filter(r => r.obligated);
  return {
    required: duty.length,
    planOnTime: duty.filter(r => r.plan_status === 'on_time').length,
    planLate: duty.filter(r => r.plan_status === 'late').length,
    planMissing: duty.filter(r => r.plan_status === 'none').length,
    unobserved: duty.filter(r => r.plan_status === 'unobserved').length,
    reviewOnTime: duty.filter(r => r.manual_status === 'reviewed' && !r.summary_late).length,
    reviewLate: duty.filter(r => r.manual_status === 'reviewed' && r.summary_late).length,
    reviewMissing: duty.filter(r => r.manual_status === 'none').length,
    reconfirm: duty.filter(r => r.manual_status === 'reconfirm').length,
  };
}