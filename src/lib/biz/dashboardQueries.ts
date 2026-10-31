import {queryOptions} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import type {DashboardData} from './dashboard';
import type {PeriodKind} from './documents';
export interface DashboardFilters {year:number;kind:PeriodKind;period:number;department:string;employee:string;mode:'official'}
export function dashboardQuery(uid:string,f:DashboardFilters){return queryOptions({queryKey:['biz_dashboard',uid,f],staleTime:15000,queryFn:async()=>{const {data,error}=await supabase.rpc('biz_dashboard_data',{_year:f.year,_period_kind:f.kind,_period:f.period,_department_id:f.department==='all'?undefined:f.department,_user_id:f.employee==='all'?undefined:f.employee,_mode:'official'});if(error)throw error;return data as unknown as DashboardData;}});}