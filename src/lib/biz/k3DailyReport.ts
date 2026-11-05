import { k3MetricDisplay, type K3TypedMetric } from './k3Measurement';
import type { K3Measurement } from './k3KpiResults';
export interface K3ReportPerson {
  user_id: string;
  department_id: string | null;
  data: {
    name: string; department: string | null; updated: boolean;
    actions: { id: string; goal_id: string; updated: boolean; overdue: boolean; metric: { status: string } }[];
    results: { value?: number | null; numerator?: number | null; denominator?: number | null; objects?: string[]; completed?: string[]; kpi_snapshot?: K3Measurement & { name: string; unit?: string }; day_metric?: K3TypedMetric; kpi_id: string; problem?: string | null; solution?: string | null }[];
    measurements?: K3ReportPerson['data']['results'];
    employee_review?: { status: 'none' | 'reviewed' | 'reconfirm'; confirmed_at?: string };
    discipline?: { obligated: boolean; plan_status: string; source?: string; summary_late?: boolean };
  };
}
export function k3DailyReport(date: string, people: K3ReportPerson[], labels: Record<string, string> = {}) {
  const actions = new Map(people.flatMap((p) => p.data.actions.map((a) => [a.id, a] as const)));
  const active = [...actions.values()].filter((a) => a.metric.status !== 'done');
  const updated = people.filter((p) => p.data.updated).length;
  const issues = people.reduce((n, p) => n + p.data.results.filter((r) => r.problem?.trim() || r.solution?.trim()).length, 0);
  const manual = (p: K3ReportPerson) => ({ none: 'Chưa tổng kết', reviewed: 'Đã tổng kết', reconfirm: 'Cần tổng kết lại' })[p.data.employee_review?.status ?? 'none'];
  const lines = [`3K · CHỐT SỔ NGÀY ${date.split('-').reverse().join('/')}`,
    `Kế hoạch đầu ngày: Đúng hạn ${people.filter(p => p.data.discipline?.obligated && p.data.discipline.plan_status === 'on_time').length}/${people.filter(p => p.data.discipline?.obligated).length} · Thiết lập muộn ${people.filter(p => p.data.discipline?.plan_status === 'late').length} · Chưa thiết lập ${people.filter(p => p.data.discipline?.plan_status === 'none').length} · Chưa có dấu mốc ${people.filter(p => !p.data.discipline || p.data.discipline.plan_status === 'unobserved').length}`,
    `${people.length} nhân viên · Đã cập nhật ${updated} · Chưa cập nhật ${people.length - updated}`,
    `Đã tổng kết thủ công: ${people.filter((p) => p.data.employee_review?.status === 'reviewed').length} · Chưa tổng kết: ${people.filter((p) => !p.data.employee_review || p.data.employee_review.status === 'none').length} · Cần tổng kết lại: ${people.filter((p) => p.data.employee_review?.status === 'reconfirm').length}`,
    `Tổng kết muộn: ${people.filter(p => p.data.employee_review?.status === 'reviewed' && p.data.discipline?.summary_late).length}`,
    `${new Set(active.map((a) => a.goal_id)).size} KG / ${active.length} KF đang thực hiện · ${active.filter((a) => a.overdue).length} KF quá hạn · ${issues} vướng mắc`, ''];
  if (people.length <= 12) {
    for (const p of people) {
      const highlights = (p.data.measurements ?? p.data.results).slice(0, 2).map((r) => r.kpi_snapshot && r.day_metric ? `${r.kpi_snapshot.name}: ${k3MetricDisplay(r.kpi_snapshot.measure, r.day_metric, null, r.kpi_snapshot.unit ?? '')}` : r.numerator != null ? `${r.numerator}/${r.denominator ?? '—'} ${labels[r.kpi_id] ?? 'kết quả'}` : r.objects ? `${new Set(r.objects).size} đối tượng` : r.completed ? `${r.completed.length} mốc` : r.value == null ? 'Chưa đủ dữ liệu' : `${Number(r.value).toLocaleString('vi-VN')} ${labels[r.kpi_id] ?? 'kết quả'}`);
      lines.push(`${p.data.name}: ${manual(p)} · ${p.data.updated ? `${p.data.actions.filter((a) => a.updated).length}/${p.data.actions.length} KF đã cập nhật` : 'Chưa cập nhật'}${highlights.length ? ` · ${highlights.join(' · ')}` : ''}`);
    }
  } else {
    const groups = new Map<string, K3ReportPerson[]>();
    for (const p of people) { const key = p.data.department ?? 'Chưa có phòng'; groups.set(key, [...(groups.get(key) ?? []), p]); }
    for (const [name, rows] of groups) lines.push(`${name}: ${rows.filter((p) => p.data.updated).length}/${rows.length} nhân viên đã cập nhật`);
  }
  const link = 'Chi tiết: https://base.suviet.vn/biz/3k';
  const result: string[] = [];
  for (const line of lines) {
    if ([...result, line, link].join('\n').length > 1800) break;
    result.push(line);
  }
  return [...result, link].join('\n');
}