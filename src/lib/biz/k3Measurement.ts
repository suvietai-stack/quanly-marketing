import type { K3Condition, K3Measure, K3ResultMetric } from './k3KpiResults';

export interface K3MilestoneConfig { id: string; name: string; condition: string; deadline?: string; weight?: number; required: boolean }
export interface K3MeasureConfig {
  baseline?: number; baseline_source?: string; tolerance?: number; precision?: number;
  cycle?: 'day' | 'week' | 'month'; start_date?: string; end_date?: string; weekdays?: number[];
  valid_condition?: string; evidence_required?: boolean; acceptance_required?: boolean;
  entity_type?: string; identifier_field?: string; normalization?: 'exact' | 'trim_lower';
  duration_unit?: 'minutes' | 'hours'; duration_method?: 'total' | 'intervals';
  sequential?: boolean; milestones?: K3MilestoneConfig[]; daily_target?: number;
}
export interface K3KpiDraft {
  request_key: string; name: string; measure: K3Measure; condition: K3Condition;
  target: string; target_max: string; unit: string; required: boolean; config: K3MeasureConfig;
}
export const newK3KpiDraft = (): K3KpiDraft => ({ request_key: crypto.randomUUID(), name: '', measure: 'cumulative', condition: 'gte', target: '', target_max: '', unit: '', required: true, config: {} });
export function k3KpiPayload(k: K3KpiDraft) {
  return { ...k, target: k.measure === 'binary' ? 1 : k.target === '' ? null : Number(k.target) * (k.measure === 'duration' && k.config.duration_unit === 'hours' ? 60 : 1), target_max: k.target_max === '' ? null : Number(k.target_max), milestones: k.config.milestones?.map((m) => m.id) ?? [] };
}
export interface K3TypedMetric extends K3ResultMetric {
  numerator?: number; denominator?: number; total_actual?: number; longest_streak?: number;
  cycle_start?: string; cycle_end?: string; pending_acceptance?: number; daily_actual?: number | null;
  daily_plan?: number | null; daily_plan_percent?: number | null; milestone_total?: number;
}
const number = (x: number | null | undefined) => x == null ? '—' : Number(x).toLocaleString('vi-VN');
export function k3MetricDisplay(measure: K3Measure, metric: K3TypedMetric, target: number | null, unit = '') {
  if (metric.pending_acceptance && metric.actual == null) return 'Chờ nghiệm thu';
  if (metric.actual == null) return 'Chưa đủ dữ liệu';
  if (measure === 'binary') return metric.pending_acceptance ? 'Chờ nghiệm thu' : metric.attained ? 'Đã đáp ứng điều kiện' : 'Chưa đáp ứng';
  if (measure === 'ratio') return `${number(metric.numerator)}/${number(metric.denominator)} = ${number(metric.actual)}%`;
  if (measure === 'average') return `${number(metric.actual)} ${unit} (${number(metric.numerator)}/${number(metric.denominator)})`;
  if (measure === 'streak') return `Chuỗi ${number(metric.actual)}/${number(target)} ngày · Dài nhất ${number(metric.longest_streak)}`;
  if (measure === 'frequency') return `${number(metric.actual)}/${number(target)} ${unit} · ${metric.cycle_start ?? ''} → ${metric.cycle_end ?? ''}`;
  if (measure === 'milestone') return `${number(metric.actual)}/${number(metric.milestone_total ?? target)} mốc`;
  return `${number(metric.actual)}${target == null ? '' : `/${number(target)}`} ${unit}${metric.progress == null ? '' : ` · ${number(metric.progress)}%`}`;
}