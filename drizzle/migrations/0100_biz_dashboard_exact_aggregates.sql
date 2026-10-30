CREATE FUNCTION public.biz_dashboard_aggregate(_facts jsonb,_lo int,_hi int,_axis text DEFAULT 'total') RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 WITH f AS (SELECT x.*,jsonb_build_object('name',definition->>'name','unit',definition->>'unit','aggregation',definition->>'aggregation','direction',definition->>'direction','value_kind',definition->>'value_kind') def FROM jsonb_to_recordset(_facts) x(user_id uuid,employee_name text,department_id uuid,department_name text,month int,definition jsonb,target text,actual text)),g AS (
 SELECT md5(def::text) metric_key,def definition,CASE _axis WHEN 'month' THEN month::text WHEN 'department' THEN department_id::text WHEN 'employee' THEN user_id::text ELSE 'total' END group_id,
 CASE _axis WHEN 'month' THEN 'Tháng '||month WHEN 'department' THEN department_name WHEN 'employee' THEN employee_name ELSE def->>'name' END group_name,
 CASE WHEN def->>'aggregation'='sum' THEN sum(target::numeric) WHEN def->>'aggregation'='avg' THEN avg(target::numeric) END target,
 CASE WHEN def->>'aggregation'='sum' THEN sum(actual::numeric) WHEN def->>'aggregation'='avg' THEN avg(actual::numeric) END actual,
 count(*) expected,count(actual) received,bool_and(actual IS NOT NULL AND target IS NOT NULL) complete,
 jsonb_agg(DISTINCT month) FILTER(WHERE actual IS NULL) missing_months
 FROM f WHERE month BETWEEN _lo AND _hi GROUP BY def,group_id,group_name)
 SELECT coalesce(jsonb_agg(jsonb_build_object('metric_key',metric_key,'definition',definition,'group_id',group_id,'group_name',group_name,'target',target::text,'actual',actual::text,'difference',(actual-target)::text,'percent',CASE WHEN target>0 AND definition->>'direction'='higher' THEN (actual/target*100)::text END,'complete',complete,'expected',expected,'received',received,'missing_months',coalesce(missing_months,'[]'))),'[]') FROM g
 $$;
REVOKE ALL ON FUNCTION public.biz_dashboard_aggregate(jsonb,int,int,text) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.biz_dashboard_data(_year int,_period_kind text DEFAULT 'year',_period int DEFAULT 1,_department_id uuid DEFAULT NULL,_user_id uuid DEFAULT NULL,_mode text DEFAULT 'official') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;lo int;hi int;
BEGIN
 r:=public.biz_dashboard_read(_year,_period_kind,_period,_department_id,_user_id,_mode);lo:=(r->>'lo')::int;hi:=(r->>'hi')::int;
 RETURN r||jsonb_build_object('totals',public.biz_dashboard_aggregate(r->'facts',lo,hi),'months',public.biz_dashboard_aggregate(r->'facts',1,12,'month'),'departments',public.biz_dashboard_aggregate(r->'facts',lo,hi,'department'),'employees',public.biz_dashboard_aggregate(r->'facts',lo,hi,'employee'));
END $$;
REVOKE ALL ON FUNCTION public.biz_dashboard_data(int,text,int,uuid,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_dashboard_data(int,text,int,uuid,uuid,text) TO authenticated;