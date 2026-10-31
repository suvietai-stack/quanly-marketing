CREATE FUNCTION private.biz_published_metrics(_facts jsonb,_lo int,_hi int,_year int,_now timestamptz) RETURNS jsonb LANGUAGE sql STABLE SET search_path=public AS $$
WITH f AS (
 SELECT x.*,jsonb_build_array(coalesce(nullif(definition->>'code',''),metric_id),definition->>'unit',definition->>'value_kind',definition->>'aggregation',definition->>'direction') AS ident,
 make_date(_year,month,1)<=date_trunc('month',_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS current_or_past,
 (make_date(_year,month,1)+interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh'<=_now AS ended
 FROM jsonb_to_recordset(_facts) x(metric_id text,month int,definition jsonb,target text,actual text,due_at timestamptz) WHERE month BETWEEN _lo AND _hi
),g AS (
 SELECT ident,md5(ident::text) AS metric_key,(jsonb_agg(definition ORDER BY definition->>'name')->0) AS definition,
 CASE WHEN ident->>3='sum' THEN sum(target::numeric) WHEN ident->>3='avg' THEN avg(target::numeric) END AS target,
 CASE WHEN ident->>3='sum' THEN sum(actual::numeric) FILTER(WHERE current_or_past) WHEN ident->>3='avg' THEN avg(actual::numeric) FILTER(WHERE current_or_past) END AS actual,
 bool_and(target IS NOT NULL) AS target_complete,bool_and(actual IS NOT NULL AND target IS NOT NULL) FILTER(WHERE current_or_past) AS actual_complete,
 bool_and(current_or_past AND actual IS NOT NULL AND target IS NOT NULL) AS complete,
 count(*) AS expected,count(actual) FILTER(WHERE current_or_past) AS received,count(*) FILTER(WHERE current_or_past) AS expected_current,
 count(*) FILTER(WHERE actual IS NULL AND ended AND (due_at IS NULL OR due_at<_now)) AS missing_due,
 count(*) FILTER(WHERE NOT ended OR (actual IS NULL AND due_at>=_now)) AS awaiting,
 coalesce(jsonb_agg(DISTINCT month ORDER BY month) FILTER(WHERE actual IS NULL AND ended AND (due_at IS NULL OR due_at<_now)),'[]') AS missing_months
 FROM f GROUP BY ident
)
SELECT coalesce(jsonb_agg(jsonb_build_object('metric_key',metric_key,'definition',definition,'group_id','total','group_name',definition->>'name','target',target::text,'actual',actual::text,'difference',CASE WHEN target_complete AND actual IS NOT NULL THEN (actual-target)::text END,'percent',CASE WHEN target_complete AND target>0 AND definition->>'direction'='higher' THEN (actual/target*100)::text END,'complete',complete,'target_complete',target_complete,'actual_complete',coalesce(actual_complete,false),'expected',expected,'received',received,'expected_current',expected_current,'missing_due',missing_due,'awaiting',awaiting,'missing_months',missing_months,'data_state',CASE WHEN NOT target_complete OR target IS NULL THEN 'no_target' WHEN missing_due>0 THEN 'missing_report' WHEN awaiting>0 OR NOT complete THEN 'tracking' ELSE 'complete' END) ORDER BY CASE WHEN definition->>'value_kind'='money' THEN 0 ELSE 1 END,definition->>'name'),'[]') FROM g;
$$;
REVOKE ALL ON FUNCTION private.biz_published_metrics(jsonb,int,int,int,timestamptz) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION private.biz_published_facts(_year int) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;result_ jsonb;
BEGIN
r:=private.biz_dashboard_global_data(_year,'year',1,NULL,NULL,'official');
WITH source AS (
 SELECT f,d.official_version_id,v.target_version_id AS official_baseline,g.official_version_id AS goal_baseline,
 coalesce(CASE WHEN d.deadline_frozen THEN d.deadline END,public.biz_deadline_at('report_month',_year,(f->>'month')::int)) AS due_at,
 coalesce(d.first_submitted_at,least(now(),(make_date(_year,(f->>'month')::int,1)+interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh'-interval '1 microsecond')) AS scope_at
 FROM jsonb_array_elements(r->'facts') f
 LEFT JOIN public.biz_documents d ON d.user_id=(f->>'user_id')::uuid AND d.kind='report' AND d.period_kind='month' AND d.year=_year AND d.period=(f->>'month')::int
 LEFT JOIN public.biz_document_versions v ON v.id=d.official_version_id
 LEFT JOIN public.biz_annual_goals g ON g.user_id=(f->>'user_id')::uuid AND g.year=_year
),corrected AS (
 SELECT DISTINCT ON (f->>'user_id',f->>'month',f->>'metric_id') f||jsonb_build_object('target',CASE WHEN official_baseline IS NOT NULL THEN f->>'target' ELSE i.months[(f->>'month')::int]::text END,'actual',CASE WHEN official_version_id IS NOT NULL THEN f->>'actual' END,'due_at',due_at,'system_id',coalesce(h.system_id,dep.system_id)) AS fact
 FROM source s LEFT JOIN public.biz_goal_items i ON i.version_id=goal_baseline AND i.metric_id=(f->>'metric_id')::uuid
 LEFT JOIN public.biz_departments dep ON dep.id=(f->>'department_id')::uuid
 LEFT JOIN LATERAL (SELECT system_id FROM public.biz_department_system_history WHERE department_id=dep.id AND started_at<=scope_at AND (ended_at IS NULL OR ended_at>scope_at) ORDER BY started_at DESC LIMIT 1) h ON true
 ORDER BY f->>'user_id',f->>'month',f->>'metric_id'
) SELECT coalesce(jsonb_agg(fact),'[]') INTO result_ FROM corrected;
RETURN result_;
END $$;
REVOKE ALL ON FUNCTION private.biz_published_facts(int) FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.biz_dashboard_published(_year int,_period_kind text DEFAULT 'year',_period int DEFAULT 1) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE facts_ jsonb;previous_facts jsonb;scoped jsonb;previous_scoped jsonb;groups_ jsonb:='[]';months_ jsonb;cumulative_ jsonb;metrics_ jsonb;node record;m int;lo int;hi int;eval_hi int;current_month int;prev_year int;prev_lo int;prev_hi int;
BEGIN
IF auth.uid() IS NULL OR NOT public.biz_can(auth.uid(),'biz.dashboard_public') THEN RAISE EXCEPTION 'Không có quyền xem Dashboard tổng hợp.';END IF;
PERFORM public.biz_period_start(_year,_period_kind,_period);
lo:=CASE _period_kind WHEN 'month' THEN _period WHEN 'quarter' THEN (_period-1)*3+1 ELSE 1 END;hi:=lo+CASE _period_kind WHEN 'month' THEN 0 WHEN 'quarter' THEN 2 ELSE 11 END;
current_month:=CASE WHEN _year<extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 12 WHEN _year>extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 0 ELSE extract(month FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::int END;eval_hi:=least(hi,current_month);
prev_year:=_year;prev_hi:=lo-1;prev_lo:=prev_hi-(hi-lo);
IF _period_kind='year' THEN prev_year:=_year-1;prev_lo:=1;prev_hi:=12;ELSIF prev_lo<1 THEN prev_year:=_year-1;prev_hi:=12;prev_lo:=12-(hi-lo);END IF;
facts_:=private.biz_published_facts(_year);previous_facts:=CASE WHEN prev_year=_year THEN facts_ WHEN prev_year>=2000 THEN private.biz_published_facts(prev_year) ELSE '[]'::jsonb END;
FOR node IN SELECT 'all'::text AS id,'Toàn Khối'::text AS name,'block'::text AS level,0::bigint AS ord UNION ALL SELECT id::text,name,'system',row_number() OVER(ORDER BY sort_order,created_at,name) FROM public.biz_systems WHERE active ORDER BY ord LOOP
SELECT coalesce(jsonb_agg(f),'[]') INTO scoped FROM jsonb_array_elements(facts_) f WHERE node.id='all' OR f->>'system_id'=node.id;
SELECT coalesce(jsonb_agg(f),'[]') INTO previous_scoped FROM jsonb_array_elements(previous_facts) f WHERE node.id='all' OR f->>'system_id'=node.id;
months_:='[]';cumulative_:='[]';
FOR m IN 1..12 LOOP
metrics_:=private.biz_published_metrics(scoped,m,m,_year,now());SELECT coalesce(jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)),'[]') INTO metrics_ FROM jsonb_array_elements(metrics_) x;months_:=months_||metrics_;
metrics_:=private.biz_published_metrics(scoped,1,m,_year,now());SELECT coalesce(jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)),'[]') INTO metrics_ FROM jsonb_array_elements(metrics_) x;cumulative_:=cumulative_||metrics_;
END LOOP;
groups_:=groups_||jsonb_build_array(jsonb_build_object('level',node.level,'id',node.id,'name',node.name,'metrics',private.biz_published_metrics(scoped,lo,hi,_year,now()),'evaluation_metrics',private.biz_published_metrics(scoped,lo,eval_hi,_year,now()),'months',months_,'cumulative',cumulative_,'previous_metrics',private.biz_published_metrics(previous_scoped,prev_lo,prev_hi,prev_year,now()),'previous_period',jsonb_build_object('year',prev_year,'lo',prev_lo,'hi',prev_hi)));
END LOOP;
RETURN jsonb_build_object('year',_year,'period_kind',_period_kind,'period',_period,'mode','official','lo',lo,'hi',hi,'evaluation_hi',eval_hi,'ongoing',hi>=current_month AND _year>=extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),'groups',groups_,'server_now',now());
END $$;
REVOKE ALL ON FUNCTION public.biz_dashboard_published(int,text,int) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.biz_dashboard_published(int,text,int) TO authenticated;
COMMENT ON FUNCTION public.biz_dashboard_published(int,text,int) IS 'Official aggregate-only semantic KR, monthly/cumulative series and prior period; no employee/document/provenance output or detail permission changes.';