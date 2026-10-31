import type {ReportAllocation,ReportItem} from './documents';
export function allocationsMatch(items:ReportItem[],segments:{from:string;to:string}[],allocations:ReportAllocation[]){
 if(segments.length<2)return true;
 if(allocations.length!==items.length*segments.length)return false;
 return items.every(item=>item.actual!==null&&/^\d{1,20}$/.test(item.actual)&&segments.every(seg=>allocations.filter(a=>a.metric_id===item.metric_id&&a.from===seg.from&&a.to===seg.to&&/^\d{1,20}$/.test(a.actual)).length===1)&&allocations.filter(a=>a.metric_id===item.metric_id).reduce((sum,a)=>sum+BigInt(a.actual||'0'),0n)===BigInt(item.actual));
}