import { supabase } from '@/integrations/supabase/client';
import { businessMinutes } from './acceptTime';
import type { ReportFilter, Summary } from './report';
export interface FirstNote {signal_id:string;sale:string;accepted:string;first_note:string|null}
export const firstNoteStat=(rows:FirstNote[])=>{
  const values=rows.map(r=>businessMinutes(r.accepted,r.first_note)).filter((m):m is number=>m!==null&&m>0);
  return {avg:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,valid:values.length,missing:rows.filter(r=>!r.first_note).length,cycles:rows.length};
};
export interface NoteReport {total:number;zero:number;noted:number;notes:number;distribution:{n:number;signals:number}[];portfolio:{sale:string|null;total:number;zero:number;noted:number;notes:number;signal_counts:Record<string,number>}[];activity:{sale:string;notes:number;signals:number}[];trend:{date_key:string;notes:number}[];firsts:FirstNote[]}
export interface SalesReport {summary:Summary;groups:{kind:string;key:string;s:Summary}[];trend:{date_key:string;created:number;won:number}[];accepts:{id:string;assigned_to:string;starts:string|null;accepted:string|null}[];lost:{key:string;n:number}[];stages:{key:string;n:number}[];sales:string[];creators:string[]}
export async function getNoteReport(f:ReportFilter):Promise<NoteReport>{const {data,error}=await supabase.rpc('signal_note_report',{_filter:f as never});if(error)throw error;return data as unknown as NoteReport;}
export async function getSalesReport(f:ReportFilter):Promise<SalesReport>{const {data,error}=await supabase.rpc('signal_sales_report',{_filter:f as never});if(error)throw error;return data as unknown as SalesReport;}