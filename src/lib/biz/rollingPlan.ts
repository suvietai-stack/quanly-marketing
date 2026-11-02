import type { GoalItem } from './goals';

export interface RollingCoverage {
 status: 'full' | 'partial' | 'none' | 'na';
 source: 'reports' | 'opening';
 expected: number; received: number;
 missing: { period_kind: string; year: number; period: number; period_start: string; period_end: string }[];
}
export interface RollingMetric extends GoalItem {
 current: (string | null)[];
 actuals: (string | null)[];
 coverage?: (RollingCoverage | null)[];
 complete: boolean;
 actual: string | null;
 remaining: string | null;
}
export interface RollingProposal {
 id: string; goal_id: string; version: number; revision: number;
 status: 'draft' | 'pending' | 'changes' | 'approved'; reason: string;
 base_version_id: string; first_month: number; items: GoalItem[];
 basis: RollingBasis; submitted_at: string | null; approved_at: string | null;
 approved_by: string | null; review_comment: string | null;
}
export interface RollingBasis {
 year: number; first_month: number; official_version_id: string;
 current_plan_id: string | null; items: RollingMetric[];
}
export interface RollingData {
 basis: RollingBasis; proposals: RollingProposal[]; can_propose: boolean;
 needs_review: boolean; server_now: string;
}
export function remainingTarget(annual: string, actual: string) {
 const remaining = BigInt(annual) - BigInt(actual);
 return (remaining > 0n ? remaining : 0n).toString();
}
/** Largest-remainder allocation: exact integers, stable ties in month order. */
export function distributeExact(amount: string, weights: string[]): string[] {
 if (!weights.length) return [];
 const target = BigInt(amount);
 if (target < 0n || weights.some(w => !/^\d+$/.test(w))) throw new Error('Phân bổ không hợp lệ.');
 let values = weights.map(w => BigInt(w));
 let denominator = values.reduce((a, b) => a + b, 0n);
 if (denominator === 0n) { values = values.map(() => 1n); denominator = BigInt(values.length); }
 const result = values.map(w => target * w / denominator);
 const order = values.map((w, index) => ({ index, remainder: target * w % denominator }))
  .sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
 let rest = target - result.reduce((a, b) => a + b, 0n);
 for (const entry of order) { if (rest === 0n) break; result[entry.index] = (result[entry.index] ?? 0n) + 1n; rest--; }
 return result.map(v => v.toString());
}
export function proposeMonths(metric: RollingMetric, firstMonth: number, mode: 'equal' | 'weighted') {
 if (metric.remaining === null || metric.definition.aggregation !== 'sum') return [...metric.current];
 const start = firstMonth - 1;
 const weights = metric.current.slice(start).map(v => mode === 'equal' ? '1' : v ?? '0');
 return [...metric.current.slice(0, start), ...distributeExact(metric.remaining, weights)];
}
/** Rebase a stale draft after month rollover: locked months follow the current plan, still-editable months keep their proposed values. */
export function rebaseMonths(metric: RollingMetric, oldMonths: (string | null)[], firstMonth: number): (string | null)[] {
 return metric.current.map((current, m) => (m < firstMonth - 1 ? current : oldMonths[m] ?? current));
}
/** True when a saved draft was created for an earlier first_month than the live basis allows. */
export function isStaleDraft(proposal: RollingProposal | undefined, basis: RollingBasis): boolean {
 return !!proposal && proposal.status !== 'approved' && proposal.first_month < basis.first_month;
}
const COVERAGE_LABEL: Record<RollingCoverage['status'], string> = { full: 'Đầy đủ', partial: 'Chưa đầy đủ', none: 'Chưa có dữ liệu', na: 'Không áp dụng' };
export function coverageLabel(c: RollingCoverage | null | undefined): string {
 return c ? COVERAGE_LABEL[c.status] : '—';
}
/** Human-readable list of missing obligation periods, e.g. "Tuần 44, Tuần 45". */
export function coverageMissingText(c: RollingCoverage | null | undefined): string {
 if (!c?.missing.length) return '';
 const KIND: Record<string, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng', quarter: 'Quý' };
 return c.missing.map(m => `${KIND[m.period_kind] ?? m.period_kind} ${m.period}`).join(', ');
}
export function rollingError(items: GoalItem[], basis: RollingBasis): string | null {
 if (basis.first_month > 12) return 'Không còn tháng tương lai để điều chỉnh.';
 if (items.length !== basis.items.length) return 'Danh sách KR đã thay đổi.';
 for (const metric of basis.items) {
  const item = items.find(i => i.metric_id === metric.metric_id);
  if (!item || item.annual !== metric.annual || item.months.length !== 12) return 'Không được thay đổi cam kết năm.';
  if (item.months.some(v => v === null || !/^\d{1,20}$/.test(v))) return 'Cần nhập đủ số nguyên không âm cho các tháng.';
  if (item.months.slice(0, basis.first_month - 1).some((v, i) => v !== metric.current[i])) return 'Không được sửa tháng hiện tại hoặc lịch sử.';
  if (metric.definition.aggregation !== 'sum') {
   if (item.months.some((v, i) => v !== metric.current[i])) return 'KR bình quân/tỷ lệ giữ quy tắc hiện hành, không dùng kế hoạch bù cộng dồn.';
  } else {
   if (!metric.complete || metric.remaining === null) return 'Thiếu dữ liệu chính thức của tháng đã kết thúc.';
   const future = item.months.slice(basis.first_month - 1).reduce((s, v) => s + BigInt(v ?? '0'), 0n);
   if (future < BigInt(metric.remaining)) return 'Tổng kế hoạch tương lai chưa đủ phần còn phải đạt.';
  }
 }
 return null;
}