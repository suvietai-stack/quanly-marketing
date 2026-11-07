import type { DesignOrder, OrderStatus } from '@/lib/store';

export const DESIGN_FLOWS = [
  { key: 'photo', label: 'Chụp ảnh', path: '/design/photo' },
  { key: 'marketing_design', label: 'Ấn phẩm Marketing', path: '/design/marketing' },
  { key: 'order_mockup', label: 'Ma-két đơn hàng', path: '/design/mockups' },
] as const;
export type DesignFlow = typeof DESIGN_FLOWS[number]['key'];
export const designLabel = (flow?: DesignFlow) => DESIGN_FLOWS.find(f => f.key === flow)?.label || 'Chưa phân loại luồng';
export function designCan(can: (key: string) => boolean, flow: DesignFlow | undefined, action: string) {
  const restricted = DESIGN_FLOWS.some(f => can(`order.${f.key}.${action}`));
  return restricted ? !!flow && can(`order.${flow}.${action}`) : can(`order.${action}`);
}
export const designAny = (can: (key: string) => boolean, action: string) => can(`order.${action}`) || DESIGN_FLOWS.some(f => can(`order.${f.key}.${action}`));
export const time = (value?: string) => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : undefined;
export function eventTime(o: DesignOrder, status: OrderStatus, field?: string) {
  const explicit = field ? time((o as unknown as Record<string, string>)[field]) : undefined;
  const events = (o.history || []).filter(h => h.toStatus === status).map(h => time(h.at)).filter((x): x is number => x !== undefined);
  return explicit ?? (events.length ? Math.max(...events) : undefined);
}
export const createdTime = (o: DesignOrder) => time(o.recordCreatedAt) ?? time(o.history?.[0]?.at);
export const completionTime = (o: DesignOrder) => eventTime(o, 'Hoàn thành', 'completedAt');
export const deadlineTime = (o: DesignOrder) => o.deadline ? time(`${o.deadline}T23:59:59.999+07:00`) : undefined;
export function statusAt(o: DesignOrder, at: number): OrderStatus | undefined {
  const hs = (o.history || []).filter(h => time(h.at) !== undefined && (time(h.at) ?? Infinity) <= at && h.toStatus).sort((a,b) => (time(a.at) ?? 0) - (time(b.at) ?? 0));
  const last = hs.at(-1)?.toStatus;
  if (last) return last;
  if ((time(o.recordUpdatedAt) ?? Infinity) <= at) return o.status;
  return undefined;
}
export const designOverdue = (o: DesignOrder, at = Date.now()) => {
  const due = deadlineTime(o); const st = statusAt(o, at) ?? (at >= Date.now() - 1000 ? o.status : undefined);
  return due !== undefined && due < at && st !== undefined && st !== 'Hoàn thành' && st !== 'Đã hủy';
};
export type DesignRange = 'all'|'day'|'week'|'month'|'quarter'|'year'|'custom';
export function designRange(key: DesignRange, from = '', to = '', now = Date.now()) {
  const vn = new Date(now + 7*3600000); const y=vn.getUTCFullYear(), m=vn.getUTCMonth(), d=vn.getUTCDate();
  if (key === 'all') return { from: -Infinity, to: now };
  if (key === 'custom') return { from: time(`${from}T00:00:00+07:00`) ?? -Infinity, to: Math.min(time(`${to}T23:59:59.999+07:00`) ?? now, now) };
  const first = key === 'year' ? Date.UTC(y,0,1) : key === 'quarter' ? Date.UTC(y,Math.floor(m/3)*3,1) : key === 'month' ? Date.UTC(y,m,1) : key === 'week' ? Date.UTC(y,m,d-((vn.getUTCDay()+6)%7)) : Date.UTC(y,m,d);
  return { from: first-7*3600000, to: now };
}
export function designStats(input: DesignOrder[], range: {from: number; to: number}) {
  const unique = [...new Map(input.map(o=>[o.id,o])).values()];
  const inRange=(n?:number)=>n!==undefined && n>=range.from && n<=range.to;
  const existing=unique.filter(o => {const n=createdTime(o); return n!==undefined ? n<=range.to : range.from===-Infinity;});
  const created=unique.filter(o=>inRange(createdTime(o)));
  const completed=unique.filter(o=>inRange(completionTime(o)) && statusAt(o,range.to)==='Hoàn thành');
  const eligible=completed.filter(o=>deadlineTime(o)!==undefined);
  const onTime=eligible.filter(o=>(completionTime(o) ?? Infinity)<=(deadlineTime(o) ?? -Infinity));
  const durations=completed.map(o=>{const start=eventTime(o,'Đang thực hiện','takenAt'), end=completionTime(o); return start!==undefined && end!==undefined && end>=start ? (end-start)/1000 : undefined;}).filter((n):n is number=>n!==undefined);
  const overdue=existing.filter(o=>designOverdue(o,range.to));
  return { existing, created, completed, eligible, onTime, overdue, onTimeRate: eligible.length ? onTime.length/eligible.length*100 : undefined, averageSeconds: durations.length ? durations.reduce((a,b)=>a+b,0)/durations.length : undefined, durationCount: durations.length, missingCreated: unique.filter(o=>createdTime(o)===undefined).length };
}
export function formatSeconds(n?: number) { if(n===undefined) return '—'; const s=Math.round(n); return `${Math.floor(s/86400)} ngày ${String(Math.floor(s/3600)%24).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }