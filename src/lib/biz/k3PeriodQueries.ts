import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { K3PeriodConfig, K3PeriodData, K3PeriodType } from './k3Periods';

export const k3PeriodConfigQuery=(uid:string)=>queryOptions({queryKey:['k3_period_config',uid],queryFn:async()=>{
  const {data,error}=await supabase.rpc('k3_period_config_read'); if(error) throw error; return data as unknown as K3PeriodConfig;
}});
export const k3PeriodQuery=(uid:string,type:K3PeriodType,date:string,user?:string)=>queryOptions({queryKey:['k3_period',uid,type,date,user??uid],queryFn:async()=>{
  const {data,error}=await supabase.rpc('k3_period_read',{_type:type,_date:date,_user:user??uid}); if(error) throw error; return data as unknown as K3PeriodData;
}});
export const k3PeriodTeamQuery=(uid:string,type:K3PeriodType,date:string)=>queryOptions({queryKey:['k3_period_team',uid,type,date],queryFn:async()=>{
  const {data,error}=await supabase.rpc('k3_period_team_read',{_type:type,_date:date}); if(error) throw error;
  return data as unknown as {user_id:string;full_name:string;department_id:string|null;department_name:string|null;data:K3PeriodData}[];
}});
export function useK3PeriodMutation() {
  const qc=useQueryClient();
  return useMutation({mutationFn:async(input:
    |{kind:'goal'|'action'|'task'|'settings';payload:Record<string,unknown>}
    |{kind:'schedule';id:string;date:string;revision:number}
    |{kind:'summary';type:K3PeriodType;date:string;note:string}
    |{kind:'comment';type:K3PeriodType;date:string;user:string;body:string;goal?:string;action?:string})=>{
    let result;
    if(input.kind==='schedule') result=await supabase.rpc('k3_task_schedule',{_id:input.id,_date:input.date,_revision:input.revision});
    else if(input.kind==='summary') result=await supabase.rpc('k3_period_summary_confirm',{_type:input.type,_date:input.date,_note:input.note});
    else if(input.kind==='comment') result=await supabase.rpc('k3_period_comment_save',{_user:input.user,_type:input.type,_date:input.date,_body:input.body,_goal:input.goal,_action:input.action});
    else {const names={goal:'k3_goal_save',action:'k3_action_save',task:'k3_plan_task_save',settings:'k3_period_settings_save'} as const;
      result=await supabase.rpc(names[input.kind],{_payload:input.payload as never});}
    if(result.error) throw result.error; return result.data;
  },onSuccess:()=>qc.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith('k3_')})});
}