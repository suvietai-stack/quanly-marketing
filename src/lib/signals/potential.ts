import { isOpen, todayKey, type Signal } from './catalog';
import type { DeadlineRow } from './deadlines';
import { compareWorkPriority } from './listPriority';
export const POTENTIAL_LABEL = { high: '🔥 Cao', medium: 'Trung bình', low: 'Thấp', unrated: 'Chưa đánh giá' } as const;
export type Potential = keyof typeof POTENTIAL_LABEL;
export const potentialOf = (s: Pick<Signal, 'potential'>): Potential => s.potential ?? 'unrated';
export const STAGES = { intake: 'Tiếp nhận', advice: 'Tư vấn', closing: 'Chốt đơn', ended: 'Kết thúc' } as const;
export type Stage = keyof typeof STAGES;
export const stageOf = (s: Signal): Stage => !s.status || ['waiting','contacting'].includes(s.status) ? 'intake' : ['consulting','quoted'].includes(s.status) ? 'advice' : s.status === 'lost' ? 'ended' : 'closing';
export type WorkQuick = 'all' | 'high' | 'action' | 'overdue' | 'won';
export type SignalSort = 'priority' | 'activity' | 'newest' | 'oldest' | 'soonest' | 'potential' | 'value' | 'work';
export interface SignalLabel { id: string; owner_id: string | null; name: string; active: boolean }
export interface LabelLink { signal_id: string; label_id: string }
export function workState(s: Signal, deadline?: DeadlineRow, today = todayKey()): 'overdue' | 'today' | 'other' {
  if (s.cancelled_at || !isOpen(s.status)) return 'other';
  if ((s.next_contact_on && s.next_contact_on < today) || deadline?.deadline_state === 'overdue') return 'overdue';
  if (s.next_contact_on === today || deadline?.deadline_state === 'today') return 'today';
  return 'other';
}
export function matchWork(s: Signal, quick: WorkQuick, deadline?: DeadlineRow, today = todayKey()) {
  const state = workState(s,deadline,today);
  return quick === 'all' || (quick === 'high' && potentialOf(s) === 'high') || (quick === 'won' && s.status === 'won') || (quick === 'overdue' && state === 'overdue') || (quick === 'action' && (state !== 'other' || (isOpen(s.status) && !s.cancelled_at && potentialOf(s) === 'high' && !s.next_contact_on)));
}
export function sortSignals(rows: Signal[], sort: SignalSort, deadlines: Record<string,DeadlineRow> = {}, today = todayKey()) {
  const potentialRank = { high:0, medium:1, low:2, unrated:3 };
  const date = (s: Signal) => s.next_contact_on ?? deadlines[s.id]?.due_on ?? '9999-12-31';
  return [...rows].sort((a,b) => {
    if (sort === 'priority' || sort === 'work') return compareWorkPriority(a, b, deadlines);
    let n=0;
    if(sort==='oldest') n=a.created_at.localeCompare(b.created_at);
    if(sort==='newest') n=b.created_at.localeCompare(a.created_at);
    if(sort==='soonest') n=date(a).localeCompare(date(b));
    if(sort==='potential') n=potentialRank[potentialOf(a)]-potentialRank[potentialOf(b)];
    if(sort==='value') n=(b.revenue??-1)-(a.revenue??-1);
    return n || b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id);
  });
}