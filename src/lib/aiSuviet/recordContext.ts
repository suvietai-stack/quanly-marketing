export type RecordContext = { kind: 'design' | 'signal' | 'finance'; id: string };
export const RECORD_LABELS = { design: 'Job Thiết kế', signal: 'Tín hiệu', finance: 'Đề nghị tài chính' };
export function validRecordContext(value: unknown): value is RecordContext {
  if (!value || typeof value !== 'object') return false;
  const v = value as RecordContext;
  return ['design','signal','finance'].includes(v.kind) && typeof v.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(v.id);
}
