import type { DashboardMetric } from './dashboard';
import { subDec } from './hierarchy';
export interface PublishedMetric extends DashboardMetric {
  target_complete: boolean; actual_complete: boolean; expected_current: number;
  missing_due: number; awaiting: number;
  data_state: 'no_target' | 'missing_report' | 'tracking' | 'complete';
}
export interface PublishedGroup { id: string; name: string; level: string; metrics: PublishedMetric[]; evaluation_metrics: PublishedMetric[]; months: PublishedMetric[]; cumulative: PublishedMetric[]; previous_metrics: PublishedMetric[]; previous_period: { year: number; lo: number; hi: number } }
export interface PublishedDashboard { year: number; period_kind: 'month'|'quarter'|'year'; period: number; lo: number; hi: number; evaluation_hi: number; ongoing: boolean; server_now: string; groups: PublishedGroup[] }
export function publishedState(m: PublishedMetric) {
  if (m.data_state === 'no_target') return m.target === null ? 'Chưa có mục tiêu' : 'Chưa có mục tiêu đầy đủ';
  if (m.data_state === 'missing_report') return `Chưa có báo cáo · ${m.missing_months.length} tháng`;
  if (m.data_state === 'tracking') return 'Đang theo dõi tiến độ';
  return m.percent === null ? 'Đủ dữ liệu · Chưa có quy tắc đánh giá' : Number(m.percent) >= 100 ? 'Đạt mục tiêu' : 'Chưa đạt mục tiêu';
}
export function comparable(m: PublishedMetric | undefined) { return !!m && m.target_complete && m.actual_complete && m.expected_current === m.expected && m.actual !== null && m.missing_due === 0; }
export function hasActual(m: PublishedMetric | undefined) { return !!m && m.actual !== null && m.actual !== undefined; }
export function trend(current: PublishedMetric | undefined, previous: PublishedMetric | undefined) {
  if (!hasActual(current) || !hasActual(previous) || !current || !previous || current.actual === null || previous.actual === null || current.metric_key !== previous.metric_key) return null;
  const difference = subDec(current.actual, previous.actual);
  return { difference, percent: Number(previous.actual) === 0 ? null : Number(difference) / Number(previous.actual) * 100, provisional: !comparable(current) || !comparable(previous) };
}
export function chartRows(rows: PublishedMetric[], key: string, lo: number, hi: number, evaluationHi: number) {
  const template=rows.find(m=>m.metric_key===key);
  if(!template)return [];
  return Array.from({length:Math.max(0,hi-lo+1)},(_,i)=>{
    const month=lo+i;
    const m=rows.find(m=>m.metric_key===key&&Number(m.group_id)===month);
    if(!m)return {...template,group_id:String(month),group_name:`Tháng ${month}`,target:null,actual:null,difference:null,percent:null,complete:false,expected:0,received:0};
    return {...m,actual:month>evaluationHi?null:m.actual,complete:month<=evaluationHi&&m.actual_complete&&m.target_complete};
  });
}
export function distribution(groups: PublishedGroup[], key: string) {
  const applicable = groups.filter(g => g.level === 'system').map(g => ({ g, m: g.metrics.find(m => m.metric_key === key) }));
  const rows = applicable.flatMap(({g,m}) => hasActual(m) && m?.actual != null ? [{ name:g.name,value:Number(m.actual) }] : []);
  return { rows, covered: rows.length, total: applicable.length, partial: rows.length > 0 && rows.length < applicable.length };
}