import { supabase } from '@/integrations/supabase/client';

export type K3TimeStatus = 'on_time' | 'late' | 'work_only' | 'no_record';

export type K3TimingEntry = {
  date: string;
  user_id: string;
  full_name: string;
  unit_id: string;
  unit_name: string;
  block_id: string;
  block_name: string;
  position: string;
  planned_at: string | null;
  work_created_at: string | null;
  summarized_at: string | null;
  summary_source: 'employee_review' | 'legacy_summary' | null;
  plan_deadline: string;
  summary_deadline: string;
  plan_status: K3TimeStatus;
  summary_status: Exclude<K3TimeStatus, 'work_only'>;
  multi_unit: boolean;
};

export type K3TimingReport = {
  start: string;
  end: string;
  unit_id: string;
  server_now: string;
  plan_by: string;
  summary_by: string;
  rows: K3TimingEntry[];
};

export async function k3TimingRead(start: string, end: string, unit: string): Promise<K3TimingReport> {
  const { data, error } = await supabase.rpc('k3hub_timing_read' as never,
    { _start: start, _end: end, _unit: unit } as never);
  if (error) throw new Error(error.message);
  return data as unknown as K3TimingReport;
}

// The same person may hold concurrent appointments. Count each person once
// per date in company/manager totals, without destroying unit-specific rows.
export function uniqueEmployeeDays(rows: K3TimingEntry[]): K3TimingEntry[] {
  const grouped = new Map<string, K3TimingEntry>();
  for (const row of rows) {
    const key = `${row.date}:${row.user_id}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, row);
      continue;
    }
    // Prefer the row containing a real daily plan/summary; never infer or
    // copy clock timestamps across organization units.
    const score = (item: K3TimingEntry) =>
      Number(item.planned_at !== null) * 3 +
      Number(item.summarized_at !== null) * 3 +
      Number(item.work_created_at !== null);
    if (score(row) > score(existing)) grouped.set(key, row);
  }
  return [...grouped.values()];
}

export function timingTotals(rows: K3TimingEntry[]) {
  const unique = uniqueEmployeeDays(rows);
  const recordedPlan = unique.filter(r => r.planned_at !== null);
  const recordedSummary = unique.filter(r => r.summarized_at !== null);
  return {
    peopleDays: unique.length,
    planned: recordedPlan.length,
    planOnTime: recordedPlan.filter(r => r.plan_status === 'on_time').length,
    planLate: recordedPlan.filter(r => r.plan_status === 'late').length,
    hasWorkOnly: unique.filter(r => !r.planned_at && !!r.work_created_at).length,
    summarized: recordedSummary.length,
    summaryOnTime: recordedSummary.filter(r => r.summary_status === 'on_time').length,
    summaryLate: recordedSummary.filter(r => r.summary_status === 'late').length,
    noPlanRecord: unique.filter(r => !r.planned_at && !r.work_created_at).length,
    noSummaryRecord: unique.length - recordedSummary.length,
  };
}

export function timingDaily(rows: K3TimingEntry[]) {
  const dates = [...new Set(rows.map(row => row.date))].sort();
  return dates.map(date => ({
    date,
    ...timingTotals(rows.filter(row => row.date === date)),
  }));
}

export function timeInVietnam(value: string | null): string {
  if (!value) return '—';
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit',
    hour12: false,
  }).format(instant);
}

export function dateInVietnam(date: string): string {
  const [year, month, day] = date.split('-');
  return [day, month, year].join('/');
}
