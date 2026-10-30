CREATE OR REPLACE FUNCTION public.biz_dashboard_data(_year int,_period_kind text DEFAULT 'year',_period int DEFAULT 1,_department_id uuid DEFAULT NULL,_user_id uuid DEFAULT NULL,_mode text DEFAULT 'official') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;lo int;hi int;m int;cum jsonb:='[]';quarters jsonb:='[]';
BEGIN
 r:=public.biz_dashboard_read(_year,_period_kind,_period,_department_id,_user_id,_mode);lo:=(r->>'lo')::int;hi:=(r->>'hi')::int;
 FOR m IN 1..12 LOOP cum:=cum||coalesce((SELECT jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)) FROM jsonb_array_elements(public.biz_dashboard_aggregate(r->'facts',1,m)) x),'[]');END LOOP;
 FOR m IN 1..4 LOOP quarters:=quarters||coalesce((SELECT jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Quý '||m)) FROM jsonb_array_elements(public.biz_dashboard_aggregate(r->'facts',(m-1)*3+1,m*3)) x),'[]');END LOOP;
 RETURN r||jsonb_build_object('totals',public.biz_dashboard_aggregate(r->'facts',lo,hi),'months',public.biz_dashboard_aggregate(r->'facts',1,12,'month'),'quarters',quarters,'cumulative',cum,'departments',public.biz_dashboard_aggregate(r->'facts',lo,hi,'department'),'employees',public.biz_dashboard_aggregate(r->'facts',lo,hi,'employee'));
END $$;