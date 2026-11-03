import { k3Counts, type K3Task, type K3Comment } from './k3';

export type K3PeriodType = 'week' | 'month';
export interface K3Goal {
  id: string; name: string; user_id: string; period_type: K3PeriodType; period_start: string; period_end: string;
  description: string | null; expected_result: string | null; kpi_target: number | null; kpi_unit: string | null; due_date: string | null; revision: number;
}
export interface K3Action {
  id: string; goal_id: string; name: string; kpi_target: number | null; kpi_unit: string | null; start_date: string | null; due_date: string | null;
  note: string | null; manual_progress: number | null; progress_source: string | null; revision: number;
}
export interface K3PeriodTask extends K3Task { action_id: string | null; is_unscheduled: boolean; original_work_date: string | null }
export interface K3PeriodData {
  user_id: string; period_start: string; period_end: string; goals: K3Goal[]; actions: K3Action[]; tasks: K3PeriodTask[];
  summaries: { id: string; confirmed_at: string; fingerprint: string; note: string | null; snapshot: { tasks: K3PeriodTask[] } }[];
  comments: (K3Comment & { goal_id: string | null; action_id: string | null })[];
  fingerprint: string; needs_confirmation: boolean; can_comment: boolean;
  events: { id: number; action: string; created_at: string }[];
}
export interface K3PeriodConfig {
  week_enabled: boolean; month_enabled: boolean; period_effective_from: string | null;
  period_deadlines: Partial<Record<'week_plan' | 'week_summary' | 'month_plan' | 'month_summary', { offset: number; time: string; effective_from: string }>>;
}
const iso = (d: Date) => d.toISOString().slice(0,10);
export function k3AddDays(date: string, amount: number) { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+amount); return iso(d); }
export function k3PeriodBounds(type: K3PeriodType, date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  if (type === 'week') { const start = k3AddDays(date,-((d.getUTCDay()+6)%7)); return { start, end: k3AddDays(start,6) }; }
  const start = `${date.slice(0,7)}-01`;
  return { start, end: iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0,12))) };
}
export function k3ShiftPeriod(type: K3PeriodType, date: string, amount: number) {
  if (type==='week') return k3AddDays(date,amount*7);
  const d=new Date(`${date}T12:00:00Z`); return iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+amount,1,12)));
}
export function k3PeriodCounts(tasks: K3PeriodTask[], today: string) {
  const scheduled=tasks.filter(t=>!t.is_unscheduled);
  return { ...k3Counts(scheduled), incomplete: scheduled.filter(t=>t.status==='incomplete').length, overdue: scheduled.filter(t=>t.work_date<today && t.status!=='done' && t.status!=='incomplete').length, unscheduled:tasks.filter(t=>t.is_unscheduled).length };
}
export function k3UnitActuals(tasks: K3PeriodTask[]) {
  const seen=new Set<string>(); const totals=new Map<string,number>();
  for(const t of tasks) {
    if(seen.has(t.id) || t.is_unscheduled || t.deleted_at || t.kpi_actual==null || !t.kpi_unit?.trim()) continue;
    seen.add(t.id); const unit=t.kpi_unit.trim(); totals.set(unit,(totals.get(unit)??0)+Number(t.kpi_actual));
  }
  return Array.from(totals,([unit,actual])=>({ unit, actual }));
}
export function k3ActionMetrics(action: K3Action, tasks: K3PeriodTask[]) {
  const rows=tasks.filter(t=>t.action_id===action.id && !t.is_unscheduled);
  const counts=k3Counts(rows); const workProgress=counts.total ? Math.round(counts.done/counts.total*100) : 0;
  const actual=rows.filter(t=>t.kpi_unit?.trim()===action.kpi_unit?.trim() && t.kpi_actual!=null).reduce((s,t)=>s+Number(t.kpi_actual),0);
  const kpiProgress=action.kpi_target && action.kpi_target>0 && action.kpi_unit ? Math.round(actual/action.kpi_target*100) : null;
  return { actual,kpiProgress,workProgress,counts,manualProgress:action.manual_progress };
}