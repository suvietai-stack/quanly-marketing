import {managedTargets,type DashboardContext} from './context';
import type {SupabaseClient} from '@supabase/supabase-js';
import {readAllPages} from '@/lib/storeRead';
import {rangeOf,vnToday} from '@/lib/kpi/timeframe';
import {summarize,ownItem,ownerFilter,uniqueActorNames,stateFor,instant,type Period,type ModuleResult,type Extra,type Report} from './logic';
const sources:{key:string;label:string;table:string;href:string;perms:string[];owners:[string,string][];due:string[];completed:string[]}[]=[
 {key:'tasks',label:'Task',table:'tasks',href:'/tasks',perms:['task.view','task.view_mine','task.view_all','task.view_created_by_me'],owners:[['assigneeId','assignee']],due:['deadline'],completed:['completedAt']},
 {key:'web',label:'Content Web',table:'web_contents',href:'/web-contents',perms:['web.content_view'],owners:[['writerId','writer']],due:['deadline','outlineDeadline'],completed:['completedAt']},
 {key:'social',label:'Social',table:'social_posts',href:'/social',perms:['social.post_view'],owners:[['writerId','writer'],['designerId','designer']],due:['scheduledDate'],completed:['publishedDate']},
 {key:'video',label:'Video',table:'videos',href:'/videos',perms:['video.view'],owners:[['ownerId','owner']],due:['deadline','scriptDeadline'],completed:['completedAt']},
 {key:'design',label:'Thiết kế',table:'orders',href:'/orders',perms:['order.view','order.photo.view','order.marketing_design.view','order.order_mockup.view'],owners:[['assigneeId','assignee']],due:['deadline'],completed:['completedAt']},
];
export type DashboardReadAccess={context:DashboardContext;nav:{permissions:{key:string;allowed:boolean}[]};people:{id:string;full_name?:string;username?:string}[]};
const empty=(state:Extra['state']):Extra=>({state,total:0,done:0,active:0,overdue:0,waiting:0});
export async function buildMyPerformance(db:SupabaseClient,uid:string,period:Period,now=new Date(),options:{manage?:boolean;withoutExtras?:boolean;access?:DashboardReadAccess}={}):Promise<Report>{
 const [{data:active,error:activeError},{data:nav,error:navError},{data:people,error:peopleError}]=options.access?[{data:options.access.context.userId===uid,error:null},{data:options.access.nav,error:null},{data:options.access.people,error:null}]:await Promise.all([db.rpc('community_active'),db.rpc('base_permissions_navigation'),db.rpc('get_profiles_directory')]);
 if(activeError||!active)throw new Error('Chỉ tài khoản đang hoạt động được xem báo cáo cá nhân.');
 if(navError||!nav)throw new Error('Chưa kiểm tra được quyền báo cáo.');
 const allowed=new Set((nav.permissions??[]).filter((p:{allowed:boolean})=>p.allowed).map((p:{key:string})=>p.key));
 if(!allowed.has('overview.view'))throw new Error('Bạn chưa có quyền xem Dashboard.');
 if(peopleError)throw new Error('Chưa đọc được định danh nhân viên.');
 let targets=[uid];
 if(options.manage){
  const {data:c,error}=options.access?{data:options.access.context,error:null}:await db.rpc('dashboard_scope_context');
  if(error||!c||c.userId!==uid||!c.canManage)throw new Error('Bạn không có phạm vi quản lý hợp lệ.');
  targets=managedTargets(c as DashboardContext);
 }
 const aliases=targets.map(id=>({id,names:uniqueActorNames(people??[],id)}));
 const names=aliases.flatMap(a=>a.names);
 const actor=(people??[]).find((p:{id:string})=>p.id===uid);
 const ambiguous=actor?.full_name&&!names.includes(actor.full_name)?1:0;
 // Every source is read with the verified caller JWT. Bounded pages fail as a whole, never silently count a partial page.
 const read=<T>(query:(from:number,to:number,signal:AbortSignal)=>PromiseLike<{data:T[]|null;error:unknown}>)=>readAllPages<T>((from,to,signal)=>{if(from>=5000)throw new Error('Nguồn vượt giới hạn đọc của báo cáo cá nhân.');return query(from,to,signal);},250,12000);
 const modules=await Promise.all(sources.map(async s=>{
  const base:ModuleResult={key:s.key,label:s.label,href:s.href,state:'unavailable',items:[],ambiguous};
  if(!s.perms.some(p=>allowed.has(p)))return base;
  try{
   if(!targets.length)return {...base,state:'ok' as const};
   const batches=[];for(let i=0;i<aliases.length;i+=8)batches.push(aliases.slice(i,i+8));
   const pages=await Promise.all(batches.map(batch=>read<{id:string;data:Record<string,unknown>}>((from,to,signal)=>db.from(s.table).select('id,data').eq('is_demo',false).or(batch.map(a=>ownerFilter(s.owners,a.id,a.names)).join(',')).order('id').range(from,to).abortSignal(signal))));
   const rows=[...new Map(pages.flat().map(r=>[r.id,r])).values()];
   if(rows.length>5000)throw new Error('Nguồn vượt giới hạn đọc.');
   const str=(d:Record<string,unknown>,keys:string[])=>keys.map(k=>d[k]).find(v=>typeof v==='string'&&v.length>0) as string|undefined;
   const due=(d:Record<string,unknown>)=>{
    const status=String(d.status||'');
    if(stateFor(s.key,status)==='done'&&s.key!=='social')return str(d,['deadline']);
    if(s.key==='web'&&status.toLowerCase().includes('outline'))return str(d,['outlineDeadline','deadline']);
    if(s.key==='video'&&status.toLowerCase().includes('kịch bản'))return str(d,['scriptDeadline','deadline']);
    return str(d,s.due);
   };
   return {...base,state:'ok' as const,items:rows.filter(r=>aliases.some(a=>ownItem(r.data,s.owners,a.id,a.names))).map(r=>({id:s.key+':'+r.id,module:s.key,title:String(r.data.title||'Chưa có tên'),status:String(r.data.status||'Chưa có trạng thái'),state:stateFor(s.key,String(r.data.status||'')),due:due(r.data),completed:str(r.data,s.completed),href:s.href+(['design','web'].includes(s.key)?'?open='+encodeURIComponent(r.id):'')}))};
  }catch{return {...base,state:'error' as const};}
 }));
 const [start,end]=rangeOf(period,vnToday(now));const lo=instant(start)!,hi=Math.min(now.getTime(),instant(end,true)!);
 const [signal,k3]=options.withoutExtras||options.manage?[empty('unavailable'),empty('unavailable')]:await Promise.all([
  (async()=>{
   if(!['signal.create','signal.view_all','signal.manage','signal.sale','signal.assign'].some(p=>allowed.has(p)))return empty('unavailable');
   try{
    const rows=await read<{status:string;closed_at:string|null;next_contact_at:string|null;next_contact_on:string|null}>((from,to,signal)=>db.from('opportunity_signals').select('status,closed_at,next_contact_at,next_contact_on').eq('assigned_to',uid).is('cancelled_at',null).order('id').range(from,to).abortSignal(signal));
    const open=rows.filter(r=>!['won','lost'].includes(r.status));
    return {...empty('ok'),total:open.length+rows.filter(r=>['won','lost'].includes(r.status)&&instant(r.closed_at??undefined)!==null&&instant(r.closed_at??undefined)!>=lo&&instant(r.closed_at??undefined)!<=hi).length,active:open.length,waiting:open.filter(r=>r.status==='waiting').length,done:rows.filter(r=>['won','lost'].includes(r.status)&&instant(r.closed_at??undefined)!==null&&instant(r.closed_at??undefined)!>=lo&&instant(r.closed_at??undefined)!<=hi).length,overdue:open.filter(r=>{const due=instant(r.next_contact_at||r.next_contact_on||undefined,true);return due!==null&&due<now.getTime();}).length};
   }catch{return empty('error');}
  })(),
  (async()=>{
   try{
    const {data:settings,error}=await db.rpc('k3_settings_read');if(error)return empty('error');if(!settings?.enabled||!settings?.can_use)return empty('unavailable');
    const rows=await read<{status:string}>((from,to,signal)=>db.from('k3_tasks').select('status').eq('user_id',uid).is('deleted_at',null).gte('work_date',start).lte('work_date',vnToday(now)).order('id').range(from,to).abortSignal(signal));
    return {...empty('ok'),total:rows.length,done:rows.filter(r=>r.status==='done').length,active:rows.filter(r=>['todo','doing'].includes(r.status)).length};
   }catch{return empty('error');}
  })(),
 ]);
 return summarize(modules,period,now,{signal,k3});
}
export function reportGuidance(r:Report){
 const s=r.summary;
 const lines=[`Bạn đang có ${s.working} đầu việc cần trực tiếp xử lý và ${s.waiting} việc chờ phản hồi.`,s.done?`Trong kỳ đã ghi nhận ${s.done} việc hoàn thành.`:'Chưa ghi nhận việc hoàn thành có ngày hợp lệ trong kỳ.'];
 if(s.overdue)lines.push(`Ưu tiên kiểm tra ${s.overdue} việc đã qua hạn xử lý; chưa đủ dữ liệu xác định nguyên nhân chậm.`);
 if(s.waitingLate)lines.push(`${s.waitingLate} hồ sơ đang chờ phản hồi đã qua hạn; cần theo dõi, không quy thành lỗi của bạn.`);
 if(!r.complete)lines.push('Một số nguồn đang lỗi; đây chưa phải báo cáo đầy đủ.');
 if(r.priorities[0])lines.push('Gợi ý: mở '+r.priorities[0].title+' để kiểm tra bước tiếp theo.');
 return lines.join('\n');
}
