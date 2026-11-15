import type {SupabaseClient} from '@supabase/supabase-js';
import {rangeOf,vnToday} from '@/lib/kpi/timeframe';
import {readAllPages} from '@/lib/storeRead';
import {instant,type Period} from './logic';
import {managementAllowed,type DashboardContext} from './context';
import {buildMyPerformance,type DashboardReadAccess} from './report.server';
export async function dashboardContext(db:SupabaseClient,uid:string):Promise<DashboardContext>{
 const {data,error}=await db.rpc('dashboard_scope_context');
 if(error||!data||data.userId!==uid)throw new Error('Chưa đọc được vị trí và phạm vi Dashboard.');
 return data as DashboardContext;
}
export async function dashboardData(db:SupabaseClient,uid:string,period:Period,mode:'personal'|'manage'){
 const [context,navRead,peopleRead]=await Promise.all([dashboardContext(db,uid),db.rpc('base_permissions_navigation'),db.rpc('get_profiles_directory')]);
 if(mode==='manage'&&!managementAllowed(context))throw new Error('Bạn không có quyền xem phạm vi quản lý.');
 const {data:nav,error:navError}=navRead;
 if(peopleRead.error)throw new Error('Chưa xác định được nhân sự cho Dashboard.');
 if(navError||!nav?.permissions?.some((p:{key:string;allowed:boolean})=>p.key==='overview.view'&&p.allowed))throw new Error('Bạn chưa có quyền xem Dashboard.');
 const allowed=new Set(nav.permissions.filter((p:{allowed:boolean})=>p.allowed).map((p:{key:string})=>p.key));
 const access:DashboardReadAccess={context,nav,people:peopleRead.data??[]};
 const now=new Date(),[start,end]=rangeOf(period,vnToday(now));
 const lo=instant(start)!,hi=Math.min(now.getTime(),instant(end,true)!);
 const [work,signal,k3,business]=await Promise.all([
  mode==='personal'||context.capabilities.work?buildMyPerformance(db,uid,period,now,{manage:mode==='manage',withoutExtras:true,access}):Promise.resolve(null),
  (async()=>{
   const eligible=mode==='manage'?context.capabilities.signals:['signal.create','signal.sale','signal.manage','signal.view_all','signal.assign'].some(p=>allowed.has(p));
   if(!eligible)return {state:'unavailable' as const};
   try{
    const rows=await readAllPages<{id:string;status:string;closed_at:string|null;next_contact_at:string|null;next_contact_on:string|null}>((from,to,signal)=>{
     if(from>=5000)throw new Error('Phạm vi tín hiệu vượt giới hạn.');
     let q=db.from('opportunity_signals').select('id,status,closed_at,next_contact_at,next_contact_on').is('cancelled_at',null).order('id').range(from,to);
     if(mode==='personal')q=q.eq('assigned_to',uid);
     return q.abortSignal(signal);
    },250,12000);
    const unique=[...new Map(rows.map(r=>[r.id,r])).values()];
    const open=unique.filter(r=>!['won','lost'].includes(r.status));
    const closed=unique.filter(r=>['won','lost'].includes(r.status)&&instant(r.closed_at??undefined)!==null&&instant(r.closed_at??undefined)!>=lo&&instant(r.closed_at??undefined)!<=hi);
    return {state:'ok' as const,active:open.length,won:closed.filter(r=>r.status==='won').length,lost:closed.filter(r=>r.status==='lost').length,overdue:open.filter(r=>{const d=instant(r.next_contact_at||r.next_contact_on||undefined,true);return d!==null&&d<now.getTime();}).length,stages:['waiting','contacting','consulting','quoted','deposit'].map(status=>({status,count:open.filter(r=>r.status===status).length})),hasData:open.length+closed.length>0};
   }catch{return {state:'error' as const};}
  })(),
  (async()=>{
   const {data:settings,error}=await db.rpc('k3_settings_read');
   if(error)return {state:'error' as const};
   if(!settings?.enabled||!(mode==='manage'?settings.can_view_scope:settings.can_use))return {state:'unavailable' as const};
   const {data,error:readError}=await db.rpc('k3_measured_period_read',{_start:start,_end:vnToday(now),_manage:mode==='manage'});
   if(readError)return {state:'error' as const};
   const people=(data??[]) as {user_id:string;updated:boolean;closes:number;kpis:{metric:{actual:number|null};official_metric:{actual:number|null}}[]}[];
   // Native RPC remains responsible for eligibility, temporal scope and measured KPI rules.
   const withData=people.filter(p=>p.updated||p.closes>0||p.kpis.length>0);
   return {state:'ok' as const,people:withData.length,kpis:withData.reduce((n,p)=>n+p.kpis.length,0),entered:withData.reduce((n,p)=>n+p.kpis.filter(k=>k.metric?.actual!=null).length,0),official:withData.reduce((n,p)=>n+p.kpis.filter(k=>k.official_metric?.actual!=null).length,0),closes:withData.reduce((n,p)=>n+p.closes,0),hasData:withData.length>0};
  })().catch(()=>({state:'error' as const})),
  (async()=>{
   const eligible=mode==='manage'?context.capabilities.business:!!context.canUseBusiness;
   if(!eligible)return {state:'unavailable' as const};
   const today=vnToday(now),year=Number(today.slice(0,4)),month=Number(today.slice(5,7));
   const args:Record<string,unknown>={_year:year,_period_kind:'month',_period:month,_mode:'official'};
   if(mode==='personal')args._user_id=uid;
   const {data,error}=await db.rpc('biz_dashboard_data',args);
   if(error)return {state:'error' as const};
   const metrics=(data?.totals??[]) as {metric_key:string;definition:{name:string;unit:string;aggregation:string};target:string|null;actual:string|null;percent:string|null;complete:boolean}[];
   return {state:'ok' as const,year,month,metrics:metrics.map(m=>({key:m.metric_key,name:m.definition.name,unit:m.definition.unit,target:m.target,actual:m.actual,percent:m.percent,complete:m.complete})),hasData:metrics.some(m=>m.target!==null||m.actual!==null)};
  })().catch(()=>({state:'error' as const})),
 ]);
 const hasWork=!!work&&(work.summary.active+work.summary.done>0);
 const complete=(!work||work.complete)&&[signal,k3,business].every(s=>s.state!=='error');
 const result={context,mode,period,start,end,asOf:now.toISOString(),work,signal,k3,business,hasWork,complete};
 return {...result,key:JSON.stringify({mode,period,start,end,scope:context.units.map(u=>u.id),people:mode==='manage'?context.people.map(p=>p.id):[uid],work:work?.key,signal,k3,business})};
}
export type DashboardData=Awaited<ReturnType<typeof dashboardData>>;
