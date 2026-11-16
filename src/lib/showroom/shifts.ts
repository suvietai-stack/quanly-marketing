import { supabase } from '@/integrations/supabase/client';

export type ShowroomShift = 'early' | 'late' | 'full' | 'off';
export type ShiftPolicy = {
  open_day:number; open_time:string; close_day:number; close_time:string;
  publish_day:number; publish_time:string; rest_days:number;
  min_early:number; min_late:number; open_store:string; close_store:string;
  early_start:string;early_end:string;late_start:string;late_end:string;
  noon_break_start:string;noon_break_end:string;
  allow_full_exception:boolean; allow_cross_week_rest?:boolean; remind:boolean; holidays:string[];
};
export type ShiftPerson = {id:string;name:string;position:string;is_manager:boolean};
export type ShiftEntry = {date:string;staff_id:string;requested:ShowroomShift|null;assigned:ShowroomShift|null;shift:ShowroomShift;updated_at:string};
export type ShiftDay = {date:string;holiday:boolean;early:number;late:number;full:number;working:number;missing_early:number;missing_late:number;has_full_exception:boolean;lunch_needs_confirmation:boolean};
export type ShiftChange = {
  id:string;kind:'swap'|'rest_exchange'|'emergency';requester_id:string;work_date:string;original_shift:ShowroomShift;
  partner_id:string|null;partner_date:string|null;partner_shift:ShowroomShift|null;
  reason:string;status:'pending_peer'|'pending_manager'|'approved'|'rejected'|'cancelled';
  decision_note:string|null;created_at:string;decided_at:string|null;
};
export type ShiftRoster = {
  actor_id:string;store_id:string;week_start:string;server_now:string;
  window:{open_at:string;close_at:string;publish_due:string};policy:ShiftPolicy;policy_version:number;
  week_status:'draft'|'published';published_at:string|null;
  can_register:boolean;can_swap:boolean;can_approve:boolean;can_settings:boolean;
  staff:ShiftPerson[];entries:ShiftEntry[];days:ShiftDay[];changes:ShiftChange[];
  recent_audit:{id:string;action:string;actor_id:string;detail:unknown;created_at:string}[];
};
export const SHIFT_LABELS:Record<ShowroomShift,string>={
  early:'Ca 1 · Sớm',late:'Ca 2 · Muộn',full:'Ca Full',off:'Nghỉ'
};
export const SHIFT_OPTIONS:{value:ShowroomShift;label:string}[]=[
  {value:'early',label:'Ca 1 · Sớm'},{value:'late',label:'Ca 2 · Muộn'},
  {value:'full',label:'Ca Full'},{value:'off',label:'Nghỉ'}
];
const db=supabase as typeof supabase & {rpc: (name:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:{message:string}|null}>};
export async function readShowroomRosterStores():Promise<{stores:{id:string;name:string}[]}>{
  const {data,error}=await db.rpc('showroom_roster_stores_read',{});
  if(error)throw new Error(error.message);
  return data as {stores:{id:string;name:string}[]};
}
export async function readShowroomRoster(store:string,week:string):Promise<ShiftRoster>{
  const {data,error}=await db.rpc('showroom_roster_read',{_store:store,_week:week});
  if(error)throw new Error(error.message);
  return data as ShiftRoster;
}
export async function showroomRosterAction(store:string,week:string,action:string,payload:Record<string,unknown>={}):Promise<{ok:boolean;message:string}>{
  const {data,error}=await db.rpc('showroom_roster_action',{_store:store,_week:week,_action:action,_data:payload});
  if(error)throw new Error(error.message);
  return data as {ok:boolean;message:string};
}

// Dates are computed in UTC; displayed in Vietnam time. Never use the
// browser timezone to decide the week/day of a showroom shift.
export function vnToday():string{
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
export function dateAdd(day:string,days:number):string{
  const d=new Date(day+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
}
export function mondayOf(day:string):string{
  const dow=new Date(day+'T12:00:00Z').getUTCDay();
  return dateAdd(day,-((dow+6)%7));
}
export function upcomingWeek():string{return dateAdd(mondayOf(vnToday()),7);}
export function weekLabel(week:string):string{
  const fmt=(x:string)=>x.slice(8,10)+'/'+x.slice(5,7);
  return fmt(week)+' – '+fmt(dateAdd(week,6));
}
export function staffWeek(entries:ShiftEntry[],staffId:string,week:string):{shifts:(ShowroomShift|null)[];saved:boolean}{
  const list=Array.from({length:7},(_,i)=>entries.find(e=>e.staff_id===staffId && e.date===dateAdd(week,i)));
  return {shifts:list.map(e=>e?.shift??null),saved:list.every(Boolean)};
}
export function restCount(shifts:readonly (ShowroomShift|null)[],week:string,holidays:string[]):number{
  return shifts.filter((s,i)=>s==='off'&&!holidays.includes(dateAdd(week,i))).length;
}
export function shiftDateLabel(date:string):string{
  return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
}
