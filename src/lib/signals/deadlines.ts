import type { SignalStatus } from './catalog';
export type DeadlineState = 'ok' | 'soon' | 'today' | 'overdue' | 'updated';
export interface DeadlineRow { signal_id: string; sale_id: string; sequence: number; due_on: string; deadline_state: DeadlineState; overdue_days: number; next_due_on: string; calculated_at: string }
export interface DeadlineMetrics { on_time: number; due: number; rate: number | null; tracking: number; overdue: number; today: number; soon: number }
export interface DeadlineReport { total: DeadlineMetrics; sales: (DeadlineMetrics & { sale_id: string })[]; activated_at: string | null; calculated_at: string }
export interface DeadlineHistory {assignment_id:string;sale_id:string;sequence:number;starts_at:string;ends_at:string;due_on:string;outcome:'pending'|'on_time'|'missed'|'exempt';note_id:string|null}
export const DEADLINE_LABEL: Record<DeadlineState,string> = { ok:'Đang ổn',soon:'Sắp đến hạn',today:'Đến hạn hôm nay',overdue:'Quá hạn cập nhật',updated:'Đã cập nhật kỳ này' };
export const deadlineLink = (state: string, sale?: string, group?: string, source?: string) => {
  const q = new URLSearchParams({deadline:state});
  if(sale) q.set('sale',sale); if(group) q.set('group',group); if(source) q.set('source',source);
  return `/signals?${q}`;
};
export function suggestedProgressionStatus(status: SignalStatus | null, selected: string[]): SignalStatus | null {
  if(!status || ['won','lost','deposit'].includes(status)) return null;
  if(selected.some(x=>['Đã gửi báo giá','Khách đang xem báo giá'].includes(x)) && ['waiting','contacting','consulting'].includes(status)) return 'quoted';
  if(selected.some(x=>['Đã kết nối Zalo với khách','Đang tư vấn sản phẩm','Đang thiết kế maket','Đã gửi maket cho khách'].includes(x)) && ['waiting','contacting'].includes(status)) return 'consulting';
  return null;
}
/** Reference calendar for tests only; production metrics come from the database. */
export function periodBoundary(start: string, sequence: number) {
  const day=new Date(Date.parse(start)+7*3600000).toISOString().slice(0,10);
  const days=sequence<=4 ? [6,13,20,27][sequence-1] : 27+30*(sequence-4);
  if(!days) throw new Error('Invalid period');
  return new Date(Date.parse(`${day}T00:00:00+07:00`)+days*86400000).toISOString();
}