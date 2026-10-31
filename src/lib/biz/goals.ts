import type { BizAggregation, BizDirection, BizValueKind } from './types';
export interface GoalItem { metric_id: string; definition: { name: string; description: string | null; unit: string; aggregation: BizAggregation; value_kind: BizValueKind; direction: BizDirection }; annual: string | null; months: (string | null)[] }
export interface GoalVersion { id: string; version: number; revision: number; status: 'draft' | 'pending' | 'changes' | 'approved'; reason: string | null; review_comment: string | null; submitted_at: string | null; approved_at: string | null; approved_by: string | null; created_at: string; updated_at: string; items: GoalItem[] }
export interface AnnualGoal { id: string; user_id: string; employee_name: string; department_id: string; department_name: string; year: number; official_version_id: string | null; can_review: boolean; versions: GoalVersion[] }
export const STATUS_LABELS = { draft: 'Bản nháp', pending: 'Chờ duyệt', changes: 'Cần chỉnh sửa', approved: 'Đã duyệt' };
export type GoalState = 'none' | 'draft' | 'pending' | 'changes' | 'approved' | 'adjusting';
export const STATE_LABELS: Record<GoalState, string> = { none: 'Chưa lập', draft: 'Bản nháp', pending: 'Chờ duyệt', changes: 'Cần chỉnh sửa', approved: 'Đã duyệt', adjusting: 'Đang đề nghị điều chỉnh' };
/** Trạng thái tổng hợp của hồ sơ mục tiêu năm: ưu tiên phiên bản mới nhất, phân biệt điều chỉnh trên bản chính thức. */
export function goalState(goal: AnnualGoal): GoalState { const latest = goal.versions[goal.versions.length - 1]; if (!latest) return 'none'; if (latest.status === 'approved') return 'approved'; if (latest.status === 'pending') return 'pending'; if (goal.official_version_id) return 'adjusting'; return latest.status; }
/** Chỉ bản nháp chưa từng gửi duyệt mới được xóa (backend biz_goal_draft_delete kiểm tra lại). */
export function draftDeletable(v: GoalVersion) { return v.status === 'draft' && !v.submitted_at; }
/** Phiên bản đang hiển thị ở bảng tổng quan: ưu tiên bản chính thức, không có thì bản mới nhất. */
export function displayVersion(goal: AnnualGoal) { return goal.versions.find(v => v.id === goal.official_version_id) ?? goal.versions[goal.versions.length - 1]; }
export function validValue(value: string | null) { return value === null || /^[0-9]{1,20}$/.test(value); }
export function total(values: (string | null)[]) { return values.reduce((sum, v) => sum + BigInt(v ?? '0'), 0n); }
export function quarterTotal(item: GoalItem, quarter: number) { const values = item.months.slice(quarter * 3, quarter * 3 + 3); return item.definition.aggregation === 'sum' ? total(values).toString() : averageText(values); }
function averageText(values: (string | null)[]) { const n = BigInt(values.length); const sum = total(values); return `${sum / n}${sum % n ? `,${((sum % n) * 100n / n).toString().padStart(2, '0')}` : ''}`; }
export function allocationMatches(item: GoalItem) { if (item.annual === null || item.months.length !== 12 || item.months.some(v => v === null || !validValue(v)) || !validValue(item.annual)) return false; return item.definition.aggregation === 'sum' ? total(item.months) === BigInt(item.annual) : total(item.months) === BigInt(item.annual) * 12n; }
export function allocatedText(item: GoalItem) { return item.definition.aggregation === 'sum' ? total(item.months).toLocaleString('vi-VN') : averageText(item.months); }
export function differenceText(item: GoalItem) { if (item.annual === null) return '—'; const multiplier = item.definition.aggregation === 'sum' ? 1n : 12n; const difference = BigInt(item.annual) * multiplier - total(item.months); return multiplier === 1n ? difference.toLocaleString('vi-VN') : averageText([difference.toString(), ...Array<string>(11).fill('0')]); }
export function allocationPercent(item: GoalItem) { if (item.annual === null) return '—'; const denominator = BigInt(item.annual) * (item.definition.aggregation === 'sum' ? 1n : 12n); if (denominator === 0n) return total(item.months) === 0n ? '100%' : '—'; return `${total(item.months) * 100n / denominator}%`; }
export function fmtGoal(value: string | null) { return value === null ? '—' : BigInt(value).toLocaleString('vi-VN'); }
export function fmtQuarter(item: GoalItem, quarter: number) { const result = quarterTotal(item, quarter); return /^-?\d+$/.test(result) ? BigInt(result).toLocaleString('vi-VN') : result; }