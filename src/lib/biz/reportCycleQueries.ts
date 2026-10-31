import {queryOptions,useMutation,useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import type {Database,Json} from '@/integrations/supabase/types';
export type CycleConfig=Database['public']['Tables']['biz_report_cycle_configs']['Row'];
export const cycleConfigsQuery=(uid:string)=>queryOptions({queryKey:['biz_report_cycles',uid],queryFn:async()=>{const {data,error}=await supabase.from('biz_report_cycle_configs').select('*').order('effective_from',{ascending:false});if(error)throw error;return data??[];}});
export const cycleLogQuery=(uid:string)=>queryOptions({queryKey:['biz_report_cycle_log',uid],queryFn:async()=>{const {data,error}=await supabase.from('biz_report_cycle_config_log').select('*').order('created_at',{ascending:false}).limit(50);if(error)throw error;return data??[];}});
export const myCycleQuery=(uid:string,at:string)=>queryOptions({queryKey:['biz_my_cycle',uid,at],queryFn:async()=>{const {data,error}=await supabase.rpc('biz_report_cycle_config_of',{_user:uid,_at:at});if(error)throw error;return data as unknown as {cycle:'day'|'week'|'month'|'quarter';scope:string};}});
type CycleArgs=Database['public']['Functions']['biz_report_cycle_save']['Args'];
export function useCycleAction(){const qc=useQueryClient();return useMutation({mutationFn:async(a:{kind:'save';args:CycleArgs}|{kind:'delete';id:string})=>{const result=a.kind==='save'?await supabase.rpc('biz_report_cycle_save',a.args):await supabase.rpc('biz_report_cycle_delete',{_id:a.id});if(result.error)throw result.error;return result.data;},onSuccess:async()=>{await qc.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith('biz_')});}});}
export const asJson=(value:unknown)=>value as Json;