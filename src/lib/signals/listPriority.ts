import { SIGNAL_STATUSES, STATUS_LABEL, type Signal } from './catalog';
import type { DeadlineRow } from './deadlines';

export const SIGNAL_SORT_OPTIONS = [
  ['work', 'Ưu tiên công việc'], ['newest', 'Mới nhất'],
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

/** Work and legacy intake selections share one ordering; progression dates are authoritative. */
export function workPriority(s: Signal, deadline?: DeadlineRow): number {
  const intake = intakePriority(s);
  if (intake === 3) return 6;
  if (intake < 2) return intake;
  // A refreshed deadline response can update the ordering before the list refetch completes.
  if (deadline) return deadline.deadline_state === 'overdue' ? 2 : deadline.deadline_state === 'today' ? 3 : deadline.deadline_state === 'soon' ? 4 : 5;
  return s.list_work_priority ?? 5;
}

export function compareWorkPriority(a: Signal, b: Signal, deadlines: Record<string, DeadlineRow> = {}): number {
  const rank = workPriority(a, deadlines[a.id]);
  const difference = rank - workPriority(b, deadlines[b.id]);
  if (difference) return difference;
  if (rank < 2) return waitingSince(a).localeCompare(waitingSince(b)) || a.id.localeCompare(b.id);
  const due = (s: Signal) => deadlines[s.id]?.due_on ?? s.list_progression_due_on ?? '9999-12-31';
  return (rank < 5 ? due(a).localeCompare(due(b)) : 0)
    || (b.list_activity_at ?? b.updated_at).localeCompare(a.list_activity_at ?? a.updated_at) || a.id.localeCompare(b.id);
}