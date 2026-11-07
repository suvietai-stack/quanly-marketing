import { SIGNAL_STATUSES, STATUS_LABEL, type Signal } from './catalog';

export const SIGNAL_SORT_OPTIONS = [
  ['priority', 'Ưu tiên tiếp nhận'], ['work', 'Ưu tiên công việc'], ['newest', 'Mới nhất'],
  ['oldest', 'Cũ nhất'], ['soonest', 'Cần xử lý sớm'], ['potential', 'Tiềm năng cao trước'],
  ['value', 'Giá trị đã ghi nhận'], ['activity', 'Cập nhật mới nhất'],
] as const;

export function signalStatusTabs(canSeeUnassigned: boolean) {
  return [
    { k: 'all' as const, label: 'Tất cả' },
    ...(canSeeUnassigned ? [{ k: 'unassigned' as const, label: 'Chờ phân công' }] : []),
    ...SIGNAL_STATUSES.map(k => ({ k, label: STATUS_LABEL[k] })),
  ];
}

export const matchesSignalStatus = (s: Signal, key: string) =>
  key === 'all' || (key === 'unassigned' ? !s.assigned_to && !s.status : s.status === key);

export const intakePriority = (s: Signal) => s.cancelled_at || s.status === 'won' || s.status === 'lost' ? 3
  : !s.assigned_to && !s.status ? 0 : s.status === 'waiting' ? 1 : 2;

/** Server-derived waiting start wins; legacy snapshots fall back to real existing fields only. */
export const waitingSince = (s: Signal) => s.list_wait_since ??
  (s.status === 'waiting' ? s.assigned_at ?? s.created_at : s.created_at);

export function compareIntakePriority(a: Signal, b: Signal): number {
  const rank = intakePriority(a) - intakePriority(b);
  if (rank) return rank;
  if (intakePriority(a) < 2) return waitingSince(a).localeCompare(waitingSince(b)) || a.id.localeCompare(b.id);
  return (b.list_activity_at ?? b.updated_at).localeCompare(a.list_activity_at ?? a.updated_at) || a.id.localeCompare(b.id);
}