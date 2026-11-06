import type { Catalog, Customer, ReportData } from './types';
import { descendant, ratio } from './logic';

export const FEATURE_KINDS: Record<string, string> = {channel:'Kênh bán hàng',cooperation:'Hình thức hợp tác',output:'Khách đầu ra',product:'Dòng sản phẩm',trait:'Đặc điểm kinh doanh',need:'Nhu cầu mua hàng'};
export function featureInGroup(c: Catalog, group: string) {
  const groups = c.config.group_ids;
  return !Array.isArray(groups) || !groups.length || groups.includes(group);
}
export function segmentOptions(catalogs: Catalog[], group: string, selected = '', activeOnly = false) {
  return catalogs.filter(c => c.kind === 'segment' && !!group && descendant(c.id, group, catalogs) && (!activeOnly || c.active || c.id === selected));
}
export function structureRows(data: ReportData, catalogs: Catalog[], group: string) {
  const customers = [...new Map(data.customers.map(c => [c.id,c])).values()];
  const ids = new Set([...segmentOptions(catalogs,group).map(c=>c.id), ...customers.map(c=>c.segment_id || 'none')]);
  if (!group) for (const c of catalogs.filter(c=>c.kind==='segment')) ids.add(c.id);
  ids.add('none');
  return [...ids].map(id => {
    const own = customers.filter(c=>(c.segment_id || 'none')===id);
    const schedules = data.schedules.filter(s=>own.some(c=>c.id===s.customer_id));
    const due = schedules.filter(s=>Date.parse(s.original_due_at)>=Date.parse(`${data.start}T00:00:00+07:00`) && Date.parse(s.original_due_at)<Date.parse(data.as_of));
    const scheduled = own.filter(c=>schedules.some(s=>s.customer_id===c.id && s.status==='pending')).length;
    const overdue = own.filter(c=>schedules.some(s=>s.customer_id===c.id && s.status==='pending' && Date.parse(s.original_due_at)<Date.parse(data.as_of))).length;
    const untouched = own.filter(c=>!data.interactions.some(i=>i.customer_id===c.id && i.completed));
    const longUntouched = own.filter(c=>c.last_care_at && Date.parse(data.as_of)-Date.parse(c.last_care_at)>30*86400000);
    const priority = (c: Customer)=>catalogs.some(x=>x.id===c.priority_id && x.config.key_customer===true);
    return {id,name:id==='none'?'Chưa phân loại tệp':catalogs.find(c=>c.id===id)?.name || 'Danh mục cũ',count:own.length,share:ratio(own.length,customers.length),new:own.filter(c=>Date.parse(c.created_at)>=Date.parse(`${data.start}T00:00:00+07:00`)).length,priority:own.filter(priority).length,scheduled,unscheduled:own.length-scheduled,overdue,onTime:ratio(due.filter(s=>s.completed_at && Date.parse(s.completed_at)<=Date.parse(s.original_due_at)).length,due.length),untouched:untouched.length,longUntouched:longUntouched.length,priorityUntouched:untouched.filter(priority).length};
  });
}
export function newCustomerTrend(data: ReportData, unit: string) {
  const lo=Date.parse(`${data.start}T00:00:00+07:00`),hi=Date.parse(data.as_of);
  const grouped=new Map<string,number>();
  for(const c of new Map(data.customers.map(c=>[c.id,c])).values()) {
    const at=Date.parse(c.created_at);if(at<lo || at>=hi) continue;
    const d=new Date(at+7*3600000),y=d.getUTCFullYear(),m=d.getUTCMonth();
    const key=unit==='year'?String(y):unit==='quarter'?`${y} Q${Math.floor(m/3)+1}`:`${y}-${String(m+1).padStart(2,'0')}`;
    grouped.set(key,(grouped.get(key)||0)+1);
  }
  return [...grouped].sort(([a],[b])=>a.localeCompare(b)).map(([period,count])=>({period,count}));
}