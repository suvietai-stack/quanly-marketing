import type { GoalItem } from './goals';
import { periodLabel as cyclePeriodLabel } from './periodCycle';
export type DocKind = 'plan' | 'report';
export type PeriodKind = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type DocStatus = 'draft' | 'pending' | 'changes' | 'approved' | 'resubmitted';
export interface ReportItem { metric_id: string; definition: GoalItem['definition']; target: string | null; annual_target: string | null; actual: string | null; percent?: string | null; complete?: boolean; confirmed_months?: number[]; missing_months?: number[]; excluded_months?: number[]; difference?: string | null; remaining?: string | null; ytd_actual?: string | null; ytd_target?: string | null; ytd_difference?: string | null; annual_percent?: string | null; ytd_missing_months?: number[] }
export interface DocAttachment { name: string; url: string; description?: string }
export interface ReportAllocation { metric_id: string; from: string; to: string; actual: string }
export interface DocVersion { id: string; version: number; revision: number; status: DocStatus; url: string | null; attachments: DocAttachment[]; notes: string | null; reason: string | null; target_version_id: string | null; items: ReportItem[]; allocations?: ReportAllocation[] | null; submitted_at: string | null; approved_at: string | null; approved_by: string | null; review_comment: string | null }
export interface BizDocument { id: string; user_id: string; kind: DocKind; period_kind: PeriodKind; year: number; period: number; department_name: string; official_version_id: string | null; first_submitted_at: string | null; last_submitted_at: string | null; deadline: string | null; late_submitted?: boolean; versions: DocVersion[] }
export type ViewStatus = 'none' | 'unopened' | 'opened' | 'new_version';
export interface DocRow { user_id: string; employee_name: string; department_id: string; department_name: string; can_review: boolean; my_view: ViewStatus; document: BizDocument | null; deadline: string | null; server_now: string }
/** Một kỳ đang cần xử lý của chính mình — trả từ biz_my_work, pha do server quyết định. */
export interface MyWorkRow { period_kind: PeriodKind; year: number; period: number; phase: 'none' | 'not_open' | 'open' | 'overdue' | 'closed'; open_at: string | null; due_at: string | null; late_close_at: string | null; period_start?: string | null; period_end?: string | null; department_id: string | null; department_name: string | null; document_id: string | null; first_submitted_at: string | null; last_submitted_at: string | null; late_submitted: boolean; version_id: string | null; version_status: string | null; version_url: string | null; late_status: string | null; late_request_id: string | null }
export interface MyWorkResult { rows: MyWorkRow[]; server_now: string }
/** Ưu tiên "Công việc của tôi": cần chỉnh sửa → được duyệt nộp bù → chờ duyệt bù → quá hạn → đang mở chưa nộp → sắp mở → đã nộp. */
export function myWorkRank(row: MyWorkRow) { if (row.version_status === 'changes') return 0; if (row.phase === 'overdue') return row.late_status === 'approved' ? 1 : row.late_status === 'pending' ? 2 : 3; if (row.phase === 'open' && !row.first_submitted_at) return 4; if (row.phase === 'not_open') return 5; return 6; }
/** Trạng thái mở tài liệu — riêng theo từng người xem, tách biệt trạng thái nộp. */
export const VIEW_STATUS: Record<ViewStatus, string> = { none: 'Chưa có tài liệu', unopened: 'Chưa mở', opened: 'Đã mở', new_version: 'Có bản mới' };
export function viewTone(status: ViewStatus) { return status === 'opened' ? 'text-primary border-primary/40' : status === 'none' ? 'text-muted-foreground' : 'text-warning border-warning/40'; }
/** Ưu tiên "Kế hoạch của tôi": cần chỉnh sửa → quá hạn → sắp hạn → chưa nộp → đã nộp → chưa đến hạn. */
export function myPlanRank(row: DocRow) { const status = row.document?.versions.at(-1)?.status; const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now); if (status === 'changes') return 0; if (time === 'overdue') return 1; if (time === 'soon') return 2; if (!row.document?.first_submitted_at) return 3; return time === 'upcoming' || time === 'none' ? 5 : 4; }
/** Ưu tiên danh sách quản lý: đã nộp chưa xem → bản mới chưa mở → đang yêu cầu sửa → quá hạn → còn lại. */
export function manageRank(row: DocRow) { const status = row.document?.versions.at(-1)?.status; const time = deadlineStatus(row.deadline, row.document?.first_submitted_at ?? null, row.server_now); if (row.my_view === 'unopened' && row.document?.first_submitted_at) return 0; if (row.my_view === 'new_version') return 1; if (status === 'changes') return 2; if (time === 'overdue') return 3; return 4; }
export interface MetricsResult { target_version_id: string | null; no_target: boolean; items: ReportItem[] }
/** Reports: first submission is official immediately; only adjustments wait for approval. */
export const DOC_STATUS: Record<string, string> = { draft: 'Bản nháp', pending: 'Đang đề nghị điều chỉnh', changes: 'Điều chỉnh cần bổ sung', approved: 'Đã nộp' };
/** Plans have no approval: submit = recorded; legacy 'approved' plans read as submitted. */
export const PLAN_STATUS: Record<string, string> = { draft: 'Bản nháp', pending: 'Đã nộp', changes: 'Cần chỉnh sửa', resubmitted: 'Đã nộp lại', approved: 'Đã nộp' };
export const PLAN_STATUS_OPTIONS: [string, string][] = [['draft', 'Bản nháp'], ['pending', 'Đã nộp'], ['changes', 'Cần chỉnh sửa'], ['resubmitted', 'Đã nộp lại']];
export function docStatusLabel(kind: DocKind, status: string | null | undefined) { if (!status) return 'Chưa nộp'; return (kind === 'plan' ? PLAN_STATUS : DOC_STATUS)[status] ?? status; }
export const TIME_STATUS = { none: 'Chưa cấu hình deadline', upcoming: 'Chưa đến hạn', soon: 'Sắp đến hạn', ontime: 'Đúng hạn', late: 'Nộp muộn', overdue: 'Quá hạn chưa nộp' };
export function deadlineStatus(deadline: string | null, first: string | null, now: string): keyof typeof TIME_STATUS { if (!deadline) return 'none'; const end = Date.parse(deadline); if (first) return Date.parse(first) <= end ? 'ontime' : 'late'; const left = end - Date.parse(now); return left < 0 ? 'overdue' : left <= 86400000 ? 'soon' : 'upcoming'; }
export function googleDocsOk(url: string) { return /^https:\/\/docs\.google\.com\/document\/d\/[A-Za-z0-9_-]+(\/(edit|view|preview))?(\?[A-Za-z0-9_=&%.-]*)?(#[A-Za-z0-9_=&%.-]*)?$/.test(url.trim()); }
export function attachmentUrlOk(url: string) { return /^https:\/\/\S{1,2000}$/.test(url.trim()); }
export function periodLabel(kind: PeriodKind, year: number, period: number) { return cyclePeriodLabel(kind, year, period); }
export function metricPercent(item: ReportItem): number | null { if (item.actual === null || item.target === null || item.definition.direction !== 'higher' || Number(item.target) <= 0) return null; return Number(item.actual) / Number(item.target) * 100; }
export function numberText(value: string | null | undefined) { if (value === null || value === undefined) return '—'; if (/^-?\d+$/.test(value)) return BigInt(value).toLocaleString('vi-VN'); return Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 2 }); }
export function progressTone(item: ReportItem) { const p = metricPercent(item); return item.actual === null ? 'text-muted-foreground' : !item.complete && item.complete !== undefined ? 'text-warning' : p === null ? 'text-muted-foreground' : p >= 100 ? 'text-success' : 'text-warning'; }
