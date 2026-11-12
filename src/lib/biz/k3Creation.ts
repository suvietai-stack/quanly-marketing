import { k3KpiPayload, newK3KpiDraft, type K3KpiDraft } from './k3Measurement';

export interface K3CreationKf {
  key: string; name: string; kpis: K3KpiDraft[]; start_date: string; due_date: string;
  start_time: string; due_time: string; inherit_timeline: boolean;
  execution_schedule: { mode: 'daily' | 'dates' | 'weekdays' | 'weekly'; dates?: string[]; weekdays?: number[]; start_time?: string; end_time?: string };
}
export const newCreationKf = (): K3CreationKf => ({ key: crypto.randomUUID(), name: '', kpis: [{ ...newK3KpiDraft(), measure: 'binary' }], start_date: '', due_date: '', start_time: '', due_time: '', inherit_timeline: true, execution_schedule: { mode: 'daily' } });
export type K3CreationMode = 'basic' | 'advanced';
export function canUseBasicCreation(kfs: K3CreationKf[], name: string, memberCount = 0) {
  const k = kfs[0]; const p = k?.kpis[0];
  return kfs.length === 1 && k?.kpis.length === 1 && k.inherit_timeline
    && k.execution_schedule.mode === 'daily' && !k.execution_schedule.start_time && !k.execution_schedule.end_time
    && (!k.name || k.name === name) && !!p && ['binary','cumulative'].includes(p.measure) && memberCount === 0;
}
export function inheritKpi(kpi: K3KpiDraft, name: string, expected: string, start: string, end: string) {
  return { ...kpi, name: kpi.name.trim() || name, config: { ...kpi.config,
    ...(kpi.measure === 'binary' && !kpi.config.valid_condition?.trim() ? { valid_condition: expected.trim() || name } : {}),
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

export function creationError(name: string, start: string, end: string, kfs: K3CreationKf[], expected = '', startTime = '', dueTime = '') {
  if (!name.trim()) return 'Nhập tên công việc.';
  if (!end) return 'Chưa chọn hạn hoàn thành.';
  const time = timelineError(start, end, startTime, dueTime);
  if (time) return time;
  if (!kfs.length) return 'Thêm ít nhất một bước thực hiện.';
  for (const [i, kf] of kfs.entries()) {
    if (!kf.kpis.length) return `Bước ${i + 1}: chọn cách đo kết quả.`;
    if (!kf.inherit_timeline) {
      const error = timelineError(kf.start_date || start, kf.due_date || end, kf.start_time, kf.due_time);
      if (error) return `Bước ${i + 1}: ${error}`;
    }
    for (const k of kf.kpis) {
      if (!['binary', 'milestone'].includes(k.measure) && (k.target === '' || !Number.isFinite(Number(k.target)) || Number(k.target) < 0)) return `Bước ${i + 1}: nhập mục tiêu hợp lệ.`;
      if (k.measure === 'cumulative' && !k.unit.trim()) return `Bước ${i + 1}: nhập đơn vị đo.`;
      if (['frequency', 'streak'].includes(k.measure) && !k.config.valid_condition?.trim() && !expected.trim()) return `Bước ${i + 1}: bổ sung điều kiện kết quả hợp lệ.`;
    }
  }
  return '';
}