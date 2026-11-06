import { needGroupsOf, normalizePhone, type Signal } from './catalog';
import type { ListFilter } from './report';
import type { DeadlineQuick } from './deadlineFilters';
import type { WorkQuick } from './potential';

export const MOBILE_SIGNAL_BATCH = 30;
export function mobileNeed(s: Signal) {
  return s.need_detail?.trim() || needGroupsOf(s).join(', ') || s.products.join(', ') || null;
}
export function signalContact(phone: string) {
  const normalized = normalizePhone(phone);
  return normalized ? { phone: normalized, tel: `tel:${normalized}` } : null;
}
export function appliedSignalFilters(f: ListFilter, deadline: DeadlineQuick | null, work: WorkQuick) {
  const fields = Object.entries(f).filter(([key, value]) =>
    !['q', 'quick', 'time', 'from', 'to'].includes(key) && !!value).length;
  return fields + (f.quick !== 'all' ? 1 : 0) + (f.time ? 1 : 0) + (deadline ? 1 : 0) + (work !== 'all' ? 1 : 0);
}