/** Preview only. The database is authoritative for saved KPI results. */
export type K3Measure = 'cumulative' | 'distinct' | 'current' | 'ratio' | 'average' | 'milestone' | 'duration';
export type K3Condition = 'gte' | 'lte' | 'eq' | 'range';
export interface K3Measurement {
  measure: K3Measure;
  condition: K3Condition;
  target: number | null;
  target_max?: number | null;
  milestones?: string[];
}
export interface K3DailyValue {
  value?: number | null;
  numerator?: number | null;
  denominator?: number | null;
  objects?: string[];
  completed?: string[];
  evidence?: string;
}
export interface K3ResultMetric {
  actual: number | null;
  progress: number | null;
  attained: boolean | null;
  status: 'not_started' | 'in_progress' | 'done';
}
export const K3_MEASURE_LABELS: Record<K3Measure, string> = {
  cumulative: 'Số lượng cộng dồn', distinct: 'Số lượng không trùng', current: 'Giá trị hiện tại',
  ratio: 'Tỷ lệ phần trăm', average: 'Giá trị trung bình', milestone: 'Mốc hoàn thành', duration: 'Thời lượng (phút)',
};
export const K3_CONDITION_LABELS: Record<K3Condition, string> = {
  gte: '≥ mục tiêu', lte: '≤ mục tiêu', eq: '= mục tiêu', range: 'Trong khoảng',
};

export function k3ResultPreview(kpi: K3Measurement, rows: K3DailyValue[]): K3ResultMetric {
  let actual: number | null = null;
  if (rows.length) {
    if (kpi.measure === 'distinct') actual = new Set(rows.flatMap((r) => r.objects ?? [])).size;
    else if (kpi.measure === 'milestone') {
      const completed = new Set(rows.flatMap((r) => r.completed ?? []));
      actual = kpi.milestones?.length ? kpi.milestones.filter((id) => completed.has(id)).length : null;
    } else if (kpi.measure === 'ratio' || kpi.measure === 'average') {
      const numerator = rows.reduce((n, r) => n + (r.numerator ?? 0), 0);
      const denominator = rows.reduce((n, r) => n + (r.denominator ?? 0), 0);
      actual = denominator > 0 ? numerator / denominator * (kpi.measure === 'ratio' ? 100 : 1) : null;
    } else if (kpi.measure === 'current') actual = rows.at(-1)?.value ?? null;
    else actual = rows.reduce((n, r) => n + (r.value ?? 0), 0);
  }
  const target = kpi.measure === 'milestone' ? kpi.milestones?.length ?? null : kpi.target;
  const attained = actual == null || target == null ? null
    : kpi.condition === 'gte' ? actual >= target
    : kpi.condition === 'lte' ? actual <= target
    : kpi.condition === 'eq' ? actual === target
    : kpi.target_max == null ? null : actual >= target && actual <= kpi.target_max;
  const progress = actual != null && target != null && target > 0 && kpi.condition === 'gte'
    ? Math.round(actual / target * 10000) / 100 : null;
  return { actual, progress, attained, status: !rows.length ? 'not_started' : attained === true ? 'done' : 'in_progress' };
}

/** Replacement, not addition: one current result per performer/date. */
export function k3ReplaceDaily<T extends K3DailyValue & { user_id: string; work_date: string }>(rows: T[], row: T): T[] {
  return [...rows.filter((r) => r.user_id !== row.user_id || r.work_date !== row.work_date), row]
    .sort((a, b) => a.work_date.localeCompare(b.work_date));
}