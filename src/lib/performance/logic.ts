import {rangeOf,addDays,vnToday} from '@/lib/kpi/timeframe';
export type Period='week'|'month';
export type WorkState='working'|'waiting'|'done'|'cancelled'|'other';
export type Work={id:string;module:string;title:string;status:string;state:WorkState;due?:string;completed?:string;href:string};
export type ModuleResult={key:string;label:string;href:string;state:'ok'|'error'|'unavailable';items:Work[];ambiguous:number};
export type Extra={state:'ok'|'error'|'unavailable';total:number;done:number;active:number;overdue:number;waiting:number};
export type Report=ReturnType<typeof summarize>;
export function instant(value?:string,end=false):number|null{
 if(!value||!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value))return null;
 const day=value.slice(0,10),dateOnly=value.length===10;
 const text=dateOnly?`${value}T${end?'23:59:59.999':'00:00:00'}+07:00`:/[zZ]|[+-]\d\d:\d\d$/.test(value)?value:value+'+07:00';
 const n=Date.parse(text);if(!Number.isFinite(n))return null;
 if(dateOnly&&vnToday(new Date(n))!==day)return null;
 return n;
}
export function stateFor(module:string,status:string):WorkState{
 if(['Đã hủy','Đã huỷ','cancelled'].includes(status))return 'cancelled';
 if(status==='Hoàn thành'||(['social','video'].includes(module)&&status==='Đã đăng'))return 'done';
 const waiting:Record<string,string[]>={tasks:['Chờ xác nhận'],web:['Chờ duyệt outline','Chờ duyệt bài','Bài đã duyệt','Bài viết đã duyệt','Đang trình bày nháp web','Chờ duyệt bản nháp web','Cần sửa bản nháp web','Bản nháp web đã duyệt','Chờ đăng web','Đã đăng web','Kiểm tra index','Chờ duyệt tối ưu','Đã duyệt tối ưu'],social:['Chờ duyệt','Chờ đăng','Đã lên lịch'],video:['Chờ duyệt kịch bản','Chờ duyệt video','Chờ duyệt','Đã bàn giao'],design:['Chờ duyệt','Đã bàn giao']};
 if(waiting[module]?.includes(status))return 'waiting';
 const working:Record<string,string[]>={tasks:['Mới tạo','Chưa làm','Đã giao','Đang làm','Cần sửa'],web:['Kế hoạch','Đã tạo','Đang tối ưu','Cần sửa tối ưu','Đã giao','Đang làm outline','Cần sửa outline','Outline đã duyệt','Đang viết bài','Cần sửa bài'],social:['Kế hoạch','Ý tưởng','Đang làm','Cần sửa'],video:['Kế hoạch','Ý tưởng','Đã giao','Đang làm kịch bản','Cần sửa kịch bản','Kịch bản đã duyệt','Video đã duyệt','Đang quay / thu tư liệu','Đang dựng','Đang sản xuất','Cần sửa video','Cần sửa'],design:['Chờ phân công','Chờ nhận việc','Đang thực hiện','Đang làm','Cần sửa','Đã duyệt']};
 return working[module]?.includes(status)?'working':'other';
}
export function summarize(modules:ModuleResult[],period:Period,now=new Date(),extras?:{signal:Extra;k3:Extra}){
 const [start,end]=rangeOf(period,vnToday(now));const lo=instant(start)!,hi=Math.min(instant(end,true)!,now.getTime());
 const all=modules.filter(m=>m.state==='ok').flatMap(m=>m.items);
 const active=all.filter(w=>['working','waiting','other'].includes(w.state));
 const working=active.filter(w=>w.state==='working'),waiting=active.filter(w=>w.state==='waiting');
 const late=(w:Work)=>{const due=instant(w.due,true);return due!==null&&due<now.getTime();};
 const done=all.filter(w=>w.state==='done'&&instant(w.completed)!==null&&instant(w.completed)!>=lo&&instant(w.completed)!<=hi);
 const comparable=done.filter(w=>instant(w.due,true)!==null&&!(w.completed?.length===10&&w.due?.length!==10));
 const ontime=comparable.filter(w=>instant(w.completed)!<=instant(w.due,true)!);
 const overdue=working.filter(late),waitingLate=waiting.filter(late);
 const daily=[];for(let day=start;day<=vnToday(now)&&day<=end;day=addDays(day,1))daily.push({day,label:day.slice(8)+'/'+day.slice(5,7),done:done.filter(w=>vnToday(new Date(instant(w.completed)!))===day).length});
 const byModule=modules.map(m=>({key:m.key,label:m.label,href:m.href,state:m.state,owned:m.items.length,active:active.filter(w=>w.module===m.key).length,working:working.filter(w=>w.module===m.key).length,waiting:waiting.filter(w=>w.module===m.key).length,done:done.filter(w=>w.module===m.key).length,overdue:overdue.filter(w=>w.module===m.key).length}));
 const priorities=[...working.filter(w=>instant(w.due,true)!==null).sort((a,b)=>instant(a.due,true)!-instant(b.due,true)!),...waitingLate].slice(0,3).map(w=>({...w,reason:w.state==='waiting'?'Đã qua hạn hồ sơ; cần theo dõi phản hồi, chưa kết luận lỗi của bạn.':late(w)?'Đã quá hạn xử lý; kiểm tra và cập nhật hướng giải quyết.':'Ưu tiên theo deadline gần nhất.'}));
 const result={period,start,end,asOf:now.toISOString(),complete:modules.every(m=>m.state!=='error')&&(!extras||[extras.signal,extras.k3].every(x=>x.state!=='error')),coverage:modules.filter(m=>m.state==='ok').length,modules:byModule,summary:{active:active.length,working:working.length,waiting:waiting.length,other:active.length-working.length-waiting.length,done:done.length,overdue:overdue.length,waitingLate:waitingLate.length,ontime:ontime.length,comparable:comparable.length,ontimeRate:comparable.length?Math.round(ontime.length/comparable.length*100):null,undatedDone:all.filter(w=>w.state==='done'&&instant(w.completed)===null).length,ambiguous:modules.reduce((n,m)=>n+m.ambiguous,0)},daily,priorities,extras};
 return {...result,key:JSON.stringify({period,start,end,modules:byModule,summary:result.summary,priorities:priorities.map(p=>[p.id,p.title,p.status,p.due,p.reason]),extras})};
}
export function uniqueActorNames(people:{id:string;full_name?:string;username?:string}[],uid:string){
 const actor=people.find(p=>p.id===uid);if(!actor)throw new Error('Chưa xác định được tài khoản báo cáo.');
 const normalize=(s?:string)=>(s??'').trim().toLocaleLowerCase('vi');
 return [uid,...[actor.full_name,actor.username].filter((v):v is string=>!!v&&!!normalize(v)&&people.filter(p=>[p.full_name,p.username].some(x=>normalize(x)===normalize(v))).length===1)];
}
export function ownItem(data:Record<string,unknown>,fields:[string,string][],uid:string,names:string[]){
 return fields.some(([id,name])=>data[id]?data[id]===uid:typeof data[name]==='string'&&names.some(n=>n.trim().toLocaleLowerCase('vi')===(data[name] as string).trim().toLocaleLowerCase('vi')));
}
/** PostgREST string values are quoted, including commas and quotes in names. */
export function ownerFilter(fields:[string,string][],uid:string,names:string[]){
 return fields.flatMap(([id,name])=>[`data->>${id}.eq.${JSON.stringify(uid)}`,...names.map(n=>`data->>${name}.eq.${JSON.stringify(n)}`)]).join(',');
}
