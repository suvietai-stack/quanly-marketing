import { k3KpiPayload, newK3KpiDraft, type K3KpiDraft } from './k3Measurement';

export interface K3CreationKf {
  key: string; name: string; kpis: K3KpiDraft[]; start_date: string; due_date: string;
  start_time: string; due_time: string; inherit_timeline: boolean;
  execution_schedule: { mode: 'daily' | 'dates' | 'weekdays' | 'weekly'; dates?: string[]; weekdays?: number[]; start_time?: string; end_time?: string };
}
export const newCreationKf = (): K3CreationKf => ({ key: crypto.randomUUID(), name: '', kpis: [{ ...newK3KpiDraft(), measure: 'binary' }], start_date: '', due_date: '', start_time: '', due_time: '', inherit_timeline: true, execution_schedule: { mode: 'daily' } });
export function inheritKpi(kpi: K3KpiDraft, name: string, expected: string, start: string, end: string) {
  return { ...kpi, name: kpi.name.trim() || name, config: { ...kpi.config,
    ...(kpi.measure === 'binary' && !kpi.config.valid_condition?.trim() ? { valid_condition: expected } : {}),
    ...(['frequency', 'streak'].includes(kpi.measure) ? { start_date: kpi.config.start_date || start, end_date: kpi.config.end_date || end } : {}),
  } };
}
export function creationKfPayload(kf: K3CreationKf, name: string, expected: string, start: string, end: string) {
  return { ...kf, request_key: kf.key, name: kf.name.trim() || name,
    kpis: kf.kpis.map((k) => k3KpiPayload(inheritKpi(k, kf.name.trim() || name, expected, start, end))) };
}
export function timelineError(start: string, end: string, startTime = '', endTime = '') {
  if (!start || !end) return 'Chọn ngày bắt đầu và hạn hoàn thành.';
  if (`${end}T${endTime || '23:59'}` < `${start}T${startTime || '00:00'}`) return 'Hạn hoàn thành không được trước thời điểm bắt đầu.';
  return '';
}
export function timelineLabel(date: string | null | undefined, time?: string | null) {
  return `${date ?? '—'}${time ? ` · ${time.slice(0, 5)}` : ''}`;
}