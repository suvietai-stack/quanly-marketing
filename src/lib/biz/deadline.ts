import type { BizDeadlineData } from './types';
/** Mirrors biz_deadline_at: date boundaries in Vietnam, last-day clamping, period override. */
export function deadlinePreview(kind: string, rule: BizDeadlineData[string], year: number, period: number): string | null {
 const key = `${year}-${String(period).padStart(2,'0')}`; if (rule.exceptions?.[key]) return rule.exceptions[key].replace('T',' ');
 if (rule.day === undefined || !Number.isInteger(rule.day) || rule.day < 1 || rule.day > 31) return null;
 const months = kind.endsWith('month') ? 1 : kind.endsWith('quarter') ? 3 : 12;
 const month = (period-1)*months+(rule.phase === 'before' ? -1 : rule.phase === 'after' ? months : 0);
 const base = new Date(Date.UTC(year,month,1)); const y = base.getUTCFullYear(), m = base.getUTCMonth(); const day = Math.min(rule.day,new Date(Date.UTC(y,m+1,0)).getUTCDate());
 return `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(rule.hour ?? 17).padStart(2,'0')}:${String(rule.minute ?? 0).padStart(2,'0')}`;
}