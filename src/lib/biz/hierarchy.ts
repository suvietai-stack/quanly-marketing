import type {DashboardFact,DashboardObligation} from './dashboard';
import {compareDecimal} from './dashboard';

/** Fact enriched by biz_dashboard_data (system/team) — DEMO facts carry the same ids. */
export type HFact=DashboardFact&{employee_name?:string;department_id?:string;department_name?:string;system_id?:string|null;system_name?:string|null;team_id?:string|null;team_name?:string|null};
export type HObligation=DashboardObligation&{system_id?:string|null;team_id?:string|null};
export interface HPath {system?:string;department?:string;team?:string;employee?:string}
export type HLevel='all'|'system'|'department'|'team'|'employee';
export const NO_TEAM='__no_team__';
export interface HMetric {key:string;code:string|null;name:string;unit:string;aggregation:string;direction:string;value_kind:string;target:string|null;actual:string|null;difference:string|null;percent:number|null;complete:boolean;expected:number;received:number}

export function level(p:HPath):HLevel{return p.employee?'employee':p.team?'team':p.department?'department':p.system?'system':'all';}

/** KR được gộp khi cùng mã chuẩn VÀ cùng đơn vị/kiểu/cách tổng hợp/chiều — không gộp theo tên. */
export function metricKey(d:HFact['definition']&{code?:string|null}){return JSON.stringify([d.code??null,d.code?null:d.name,d.unit,d.aggregation,d.direction,d.value_kind]);}

function scaleOf(v:string){return v.split('.')[1]?.length??0;}
function toBig(v:string,s:number){const neg=v.startsWith('-');const [w,f='']=(neg?v.slice(1):v).split('.');const b=BigInt((w||'0')+f.padEnd(s,'0'));return neg?-b:b;}
function fromBig(b:bigint,s:number){const neg=b<0n;let t=(neg?-b:b).toString().padStart(s+1,'0');if(s){t=t.slice(0,-s)+'.'+t.slice(-s);t=t.replace(/\.?0+$/,'');}return (neg&&t!=='0'?'-':'')+t;}
export function sumDec(values:string[]){if(!values.length)return null;const s=Math.max(...values.map(scaleOf));return fromBig(values.reduce((a,v)=>a+toBig(v,s),0n),s);}
export function subDec(a:string,b:string){const s=Math.max(scaleOf(a),scaleOf(b));return fromBig(toBig(a,s)-toBig(b,s),s);}

export function inPath(f:{system_id?:string|null;department_id?:string;team_id?:string|null;user_id:string},p:HPath){
 if(p.system&&f.system_id!==p.system)return false;
 if(p.department&&f.department_id!==p.department)return false;
 if(p.team&&(f.team_id??NO_TEAM)!==p.team)return false;
 if(p.employee&&f.user_id!==p.employee)return false;
 return true;}

/** Mirror of public.biz_dashboard_aggregate: thiếu báo cáo ≠ 0, tỷ lệ = tổng thực tế / tổng mục tiêu. */
export function aggregate(facts:HFact[],lo:number,hi:number):HMetric[]{
 const groups=new Map<string,HFact[]>();
 for(const f of facts){if(f.month<lo||f.month>hi)continue;const k=metricKey(f.definition);groups.set(k,[...(groups.get(k)??[]),f]);}
 return [...groups.entries()].map(([key,rows])=>{const d=rows[0].definition as HFact['definition']&{code?:string|null};
  const t=rows.map(r=>r.target).filter((v):v is string=>v!==null);const a=rows.map(r=>r.actual).filter((v):v is string=>v!==null);
  let target:string|null=null,actual:string|null=null;
  if(d.aggregation==='sum'){target=sumDec(t);actual=sumDec(a);}else if(d.aggregation==='avg'){target=t.length?String(t.reduce((x,v)=>x+Number(v),0)/t.length):null;actual=a.length?String(a.reduce((x,v)=>x+Number(v),0)/a.length):null;}
  const complete=rows.every(r=>r.actual!==null&&r.target!==null);
  const percent=target!==null&&actual!==null&&Number(target)>0&&d.direction==='higher'?Number(actual)/Number(target)*100:null;
  return {key,code:d.code??null,name:d.name,unit:d.unit,aggregation:d.aggregation,direction:d.direction,value_kind:d.value_kind,target,actual,difference:target!==null&&actual!==null?subDec(actual,target):null,percent,complete,expected:rows.length,received:a.length};
 }).sort((x,y)=>(x.value_kind==='money'?0:1)-(y.value_kind==='money'?0:1)||x.name.localeCompare(y.name,'vi'));}

export interface HChild {id:string;name:string;path:HPath;facts:HFact[]}
/** Đơn vị con của nút đang chọn; Phòng không có Nhóm hiển thị trực tiếp Nhân viên. */
export function children(facts:HFact[],p:HPath,systems:{id:string;name:string}[]=[]):{axis:HLevel;items:HChild[]}{
 const scoped=facts.filter(f=>inPath(f,p));const lv=level(p);
 const pick=(axis:HLevel,id:(f:HFact)=>string|null|undefined,name:(f:HFact)=>string,next:(id:string)=>HPath)=>{const m=new Map<string,HChild>();for(const f of scoped){const i=id(f);if(!i)continue;const c=m.get(i)??{id:i,name:name(f),path:next(i),facts:[]};c.facts.push(f);m.set(i,c);}return {axis,items:[...m.values()].sort((a,b)=>a.name.localeCompare(b.name,'vi'))};};
 if(lv==='all'){const r=pick('system',f=>f.system_id,f=>f.system_name??'Hệ chưa đặt tên',id=>({system:id}));for(const s of systems)if(!r.items.some(i=>i.id===s.id))r.items.push({id:s.id,name:s.name,path:{system:s.id},facts:[]});return r;}
 if(lv==='system')return pick('department',f=>f.department_id,f=>f.department_name??'Phòng',id=>({...p,department:id}));
 if(lv==='department'){if(scoped.some(f=>f.team_id))return pick('team',f=>f.team_id??NO_TEAM,f=>f.team_name??'Chưa thuộc Nhóm',id=>({...p,team:id}));return pick('employee',f=>f.user_id,f=>f.employee_name??'Nhân viên',id=>({...p,employee:id}));}
 if(lv==='team')return pick('employee',f=>f.user_id,f=>f.employee_name??'Nhân viên',id=>({...p,employee:id}));
 return {axis:'employee',items:[]};}

export type Tone='success'|'warning'|'destructive'|'muted';
/** Kỳ đã kết thúc: ≥100% xanh, ≥90% cam, còn lại đỏ. Năm đang chạy: truyền số liệu lũy kế đến tháng hiện tại. */
export function tone(m:Pick<HMetric,'complete'|'percent'>|undefined):Tone{if(!m||!m.complete||m.percent===null)return 'muted';return m.percent>=100?'success':m.percent>=90?'warning':'destructive';}
export function toneLabel(t:Tone,ongoing:boolean){return t==='muted'?'Chưa đủ dữ liệu':t==='success'?(ongoing?'Đúng/vượt tiến độ':'Đạt mục tiêu'):t==='warning'?(ongoing?'Cần chú ý':'Gần đạt'):(ongoing?'Chậm tiến độ':'Chưa đạt');}

export function rankChildren(items:{id:string;name:string;m?:HMetric}[]){const ready=items.filter(i=>i.m&&i.m.complete&&i.m.percent!==null).sort((a,b)=>b.m!.percent!-a.m!.percent!||compareDecimal(b.m!.actual??'0',a.m!.actual??'0')||a.name.localeCompare(b.name,'vi'));return ready.map((i,idx)=>({...i,rank:idx>0&&ready[idx-1].m!.percent===i.m!.percent?ready.findIndex(r=>r.m!.percent===i.m!.percent)+1:idx+1}));}

/** Chỉ tính người có nghĩa vụ trong phạm vi; đơn vị không có nghĩa vụ không bị tính chưa nộp. */
export function obligationsIn(rows:HObligation[],p:HPath){return rows.filter(r=>inPath(r,p));}
