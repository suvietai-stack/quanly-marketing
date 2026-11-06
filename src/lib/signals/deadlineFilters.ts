import type { Signal } from './catalog';
import type { DeadlineRow } from './deadlines';

export type DeadlineQuick = 'today' | 'soon' | 'overdue';
export const DEADLINE_QUICK = [
  { key: null, label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'soon', label: 'Sắp đến hạn' },
  { key: 'overdue', label: 'Quá hạn' },
] as const;

/** Consume authoritative, mutually exclusive states; never recalculate due dates. */
export function deadlineCounts(rows: Pick<Signal, 'id'>[], deadlines: Record<string, DeadlineRow>) {
  const counts = { all: 0, today: 0, soon: 0, overdue: 0 };
  for (const id of new Set(rows.map(s => s.id))) {
    counts.all++;
    const state = deadlines[id]?.deadline_state;
    if (state === 'today' || state === 'soon' || state === 'overdue') counts[state]++;
  }
  return counts;
}