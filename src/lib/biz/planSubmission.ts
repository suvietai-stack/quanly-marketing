import { googleDocsOk, type DocKind, type DocRow } from './documents';
import type { DeadlinePhase } from './deadline';

export function officialLinkValid(kind: DocKind, url: string, submit: boolean) {
  return (!url.trim() && (!submit || kind === 'report')) || googleDocsOk(url);
}
export function hasSubmittedDocument(row: DocRow) {
  return !!row.document?.versions.some(v => v.submitted_at && googleDocsOk(v.url ?? ''));
}
export function canSubmitInPhase(phase: DeadlinePhase | null, first: string | null, lateStatus?: string) {
  if (first) return true;
  return phase === 'open' || phase === 'none' || (phase === 'overdue' && lateStatus === 'approved');
}
export function documentError(error: unknown): string {
  const fields = typeof error === 'object' && error !== null ? error as Record<string, unknown> : {};
  const text = [fields.message, fields.details, fields.hint, fields.code].filter(v => typeof v === 'string').join(' · ') || (typeof error === 'string' ? error : '');
  if (/Google Docs/i.test(text)) return 'Vui lòng nhập link Google Docs kế hoạch chính thức trước khi nộp.';
  if (/chưa mở|chưa đến ngày mở/i.test(text)) return 'Kỳ kế hoạch chưa đến ngày mở nộp.';
  if (/quá hạn|hết hạn/i.test(text)) return 'Đã hết hạn nộp trực tiếp. Vui lòng gửi yêu cầu xin nộp bù.';
  if (/đóng/i.test(text)) return 'Kỳ nộp đã đóng. Không thể nộp mới hoặc xin nộp bù.';
  if (/quyền|42501/i.test(text)) return 'Bạn không có quyền thực hiện thao tác này.';
  return text && text !== '[object Object]' ? text : 'Không thể hoàn tất thao tác. Vui lòng thử lại.';
}