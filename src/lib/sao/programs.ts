export type ProgramSource = 'signal' | 'kpi' | 'task';
export interface Program {
  id: string; name: string; source: ProgramSource; field: string; condition: string;
  threshold: number; stars: number; enabled: boolean; enabled_at: string | null;
  starts_at: string | null; ends_at: string | null;
}
export const programSources = { signal: 'Tín hiệu', kpi: 'KPI', task: 'Công việc' };
export const programFields = {
  signal: { field: 'status', label: 'Trạng thái', condition: 'transition', conditionLabel: 'Chuyển sang', value: 'Chốt' },
  kpi: { field: 'verified_task_rate', label: 'Tỷ lệ hoàn thành KR liên kết Task', condition: 'gte', conditionLabel: 'Đạt từ', value: '%' },
  task: { field: 'approved_completion', label: 'Hoàn thành được xác nhận', condition: 'event', conditionLabel: 'Theo sự kiện', value: 'Xác nhận hoàn thành' },
} as const;
export function newProgram(source: ProgramSource = 'signal'): Program {
  return { id: crypto.randomUUID(), name: '', source, field: programFields[source].field, condition: programFields[source].condition, threshold: 100, stars: 30, enabled: false, enabled_at: null, starts_at: null, ends_at: null };
}
export function programDescription(p: Program): string {
  if (p.source === 'signal') return `Tín hiệu chuyển sang Chốt hợp lệ → Sale phụ trách nhận ${p.stars} Sao.`;
  if (p.source === 'task') return `Công việc được xác nhận hoàn thành đúng quy trình → người phụ trách nhận ${p.stars} Sao.`;
  return `KR liên kết Task đạt từ ${p.threshold}% theo số Task đã xác nhận, khi kỳ được khóa → nhân viên nhận ${p.stars} Sao cho mỗi KR đạt.`;
}
export function validProgram(p: Program): boolean {
  const f = programFields[p.source];
  return Boolean(p.name.trim()) && p.name.trim().length <= 150 && p.field === f.field && p.condition === f.condition && Number.isInteger(p.stars) && p.stars > 0 && p.stars <= 100000 && Number.isFinite(p.threshold) && (p.source !== 'kpi' || p.threshold >= 100 && p.threshold <= 1000) && (!p.starts_at || Number.isFinite(Date.parse(p.starts_at))) && (!p.ends_at || Number.isFinite(Date.parse(p.ends_at))) && (!p.starts_at || !p.ends_at || Date.parse(p.ends_at) > Date.parse(p.starts_at));
}
export function toVietnamInput(iso: string | null): string { return iso ? new Date(Date.parse(iso) + 7 * 3600000).toISOString().slice(0, 16) : ''; }
export function fromVietnamInput(value: string): string | null { return value ? new Date(`${value}:00+07:00`).toISOString() : null; }