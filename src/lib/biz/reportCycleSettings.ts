import type {CycleConfig} from './reportCycleQueries';
import {periodOfDate,type ReportCycle} from './periodCycle';
export function effectiveConfig(rows:CycleConfig[],unit:{scope:string;id:string;system_id?:string|null},date:string):CycleConfig|null{
 const latest=(scope:string,id?:string|null)=>rows.filter(r=>r.scope===scope&&r.effective_from<=date&&(scope==='block'||(scope==='system'?r.system_id:r.department_id)===id)).sort((a,b)=>b.effective_from.localeCompare(a.effective_from)||b.created_at.localeCompare(a.created_at))[0];
 const own=(scope:string,id?:string|null)=>{const r=latest(scope,id);return r?.inherit_parent?undefined:r;};
 return (unit.scope==='department'?own('department',unit.id):undefined)??(unit.scope!=='block'?own('system',unit.scope==='system'?unit.id:unit.system_id):undefined)??own('block')??null;
}
/** A transition is scheduled at the first complete new period, never a partial range. */
export function alignedEffectiveDate(cycle:ReportCycle,date:string){const p=periodOfDate(cycle,date);if(p.range.start===date)return date;const next=new Date(`${p.range.end}T00:00:00Z`);next.setUTCDate(next.getUTCDate()+1);return next.toISOString().slice(0,10);}