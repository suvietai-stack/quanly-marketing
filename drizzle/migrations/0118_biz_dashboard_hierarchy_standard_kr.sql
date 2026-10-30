ALTER TABLE public.biz_kr_metrics ADD COLUMN IF NOT EXISTS standard_code text, ADD COLUMN IF NOT EXISTS standard_label text;
ALTER TABLE public.biz_kr_metrics ADD CONSTRAINT biz_kr_standard_code_fmt CHECK (standard_code IS NULL OR standard_code ~ '^[a-z][a-z0-9_]{1,40}$');
COMMENT ON COLUMN public.biz_kr_metrics.standard_code IS 'Mã chỉ số chuẩn do Admin xác nhận; Dashboard chỉ gộp các KR cùng mã VÀ cùng đơn vị/kiểu/cách tổng hợp/chiều.';

-- Backfill: các KR hiện có đã đối chiếu cùng mô tả, đơn vị, kiểu giá trị, cách tổng hợp và chiều.
UPDATE public.biz_kr_metrics SET standard_code='revenue',standard_label='Doanh số' WHERE standard_code IS NULL AND lower(btrim(name))='doanh số' AND unit='VNĐ' AND value_kind='money' AND aggregation='sum' AND direction='higher';
UPDATE public.biz_kr_metrics SET standard_code='orders',standard_label='Số đơn hàng' WHERE standard_code IS NULL AND lower(btrim(name))='số đơn hàng' AND unit='Đơn' AND value_kind='count' AND aggregation='sum' AND direction='higher';
UPDATE public.biz_kr_metrics SET standard_code='new_dealers',standard_label='Số đại lý mới' WHERE standard_code IS NULL AND lower(btrim(name))='số đại lý mới' AND value_kind='count' AND aggregation='sum';

CREATE OR REPLACE FUNCTION public.biz_kr_standard_save(_metric_id uuid,_code text,_label text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.kr_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý chỉ số KR.'; END IF;
 _code:=nullif(lower(btrim(coalesce(_code,''))),'');
 IF _code IS NOT NULL AND _code !~ '^[a-z][a-z0-9_]{1,40}$' THEN RAISE EXCEPTION 'Mã chỉ số chỉ gồm chữ thường, số, dấu gạch dưới.'; END IF;
 IF _code IS NOT NULL AND EXISTS(SELECT 1 FROM public.biz_kr_metrics a,public.biz_kr_metrics b WHERE a.id=_metric_id AND b.standard_code=_code AND b.id<>a.id AND (b.unit,b.value_kind,b.aggregation,b.direction) IS DISTINCT FROM (a.unit,a.value_kind,a.aggregation,a.direction)) THEN
  RAISE EXCEPTION 'Mã này đang dùng cho KR khác đơn vị/kiểu/cách tổng hợp — không thể gộp.'; END IF;
 UPDATE public.biz_kr_metrics SET standard_code=_code,standard_label=CASE WHEN _code IS NULL THEN NULL ELSE nullif(btrim(coalesce(_label,'')),'') END,updated_at=now() WHERE id=_metric_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy KR.'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.biz_kr_standard_save(uuid,text,text) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.biz_kr_standard_save(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION private.biz_dash_enrich(_rows jsonb,_year int)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(x
  || jsonb_build_object('system_id',d.system_id,'system_name',s.name,'team_id',t.team_id,'team_name',t.team_name)
  || CASE WHEN x ? 'definition' THEN jsonb_build_object('definition',(x->'definition')||jsonb_build_object('code',k.standard_code,'name',coalesce(CASE WHEN k.standard_code IS NOT NULL THEN k.standard_label END,x->'definition'->>'name'))) ELSE '{}'::jsonb END),'[]')
 FROM jsonb_array_elements(coalesce(_rows,'[]')) x
 LEFT JOIN public.biz_departments d ON d.id=(x->>'department_id')::uuid
 LEFT JOIN public.biz_systems s ON s.id=d.system_id
 LEFT JOIN public.biz_kr_metrics k ON k.id=nullif(x->>'metric_id','')::uuid
 LEFT JOIN LATERAL (SELECT tm.team_id,tt.name team_name FROM public.biz_team_members tm JOIN public.biz_teams tt ON tt.id=tm.team_id
   WHERE tm.user_id=(x->>'user_id')::uuid AND tt.department_id=d.id
     AND tm.started_at < (make_date(_year,coalesce((x->>'month')::int,12),1)+interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh'
     AND (tm.ended_at IS NULL OR tm.ended_at >= (make_date(_year,coalesce((x->>'month')::int,12),1)+interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh' - interval '1 microsecond')
   ORDER BY tm.started_at DESC LIMIT 1) t ON true
$$;
REVOKE ALL ON FUNCTION private.biz_dash_enrich(jsonb,int) FROM public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.biz_dashboard_aggregate(_facts jsonb,_lo integer,_hi integer,_axis text DEFAULT 'total')
RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 WITH f AS (SELECT x.*,jsonb_build_object('code',definition->>'code','name',definition->>'name','unit',definition->>'unit','aggregation',definition->>'aggregation','direction',definition->>'direction','value_kind',definition->>'value_kind') def FROM jsonb_to_recordset(_facts) x(user_id uuid,employee_name text,department_id uuid,department_name text,month int,definition jsonb,target text,actual text)),g AS (
 SELECT md5(def::text) metric_key,def definition,CASE _axis WHEN 'month' THEN month::text WHEN 'department' THEN department_id::text WHEN 'employee' THEN user_id::text ELSE 'total' END group_id,
 CASE _axis WHEN 'month' THEN 'Tháng '||month WHEN 'department' THEN department_name WHEN 'employee' THEN employee_name ELSE def->>'name' END group_name,
 CASE WHEN def->>'aggregation'='sum' THEN sum(target::numeric) WHEN def->>'aggregation'='avg' THEN avg(target::numeric) END target,
 CASE WHEN def->>'aggregation'='sum' THEN sum(actual::numeric) WHEN def->>'aggregation'='avg' THEN avg(actual::numeric) END actual,
 count(*) expected,count(actual) received,bool_and(actual IS NOT NULL AND target IS NOT NULL) complete,
 jsonb_agg(DISTINCT month) FILTER(WHERE actual IS NULL) missing_months
 FROM f WHERE month BETWEEN _lo AND _hi GROUP BY def,group_id,group_name)
 SELECT coalesce(jsonb_agg(jsonb_build_object('metric_key',metric_key,'definition',definition,'group_id',group_id,'group_name',group_name,'target',target::text,'actual',actual::text,'difference',(actual-target)::text,'percent',CASE WHEN target>0 AND definition->>'direction'='higher' THEN (actual/target*100)::text END,'complete',complete,'expected',expected,'received',received,'missing_months',coalesce(missing_months,'[]'))),'[]') FROM g
$$;

CREATE OR REPLACE FUNCTION public.biz_dashboard_data(_year integer,_period_kind text DEFAULT 'year',_period integer DEFAULT 1,_department_id uuid DEFAULT NULL,_user_id uuid DEFAULT NULL,_mode text DEFAULT 'official')
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;opts jsonb;lo int;hi int;m int;current_month int;cum jsonb:='[]';quarters jsonb:='[]';missing jsonb;annual jsonb;current_data jsonb;
BEGIN
 r:=public.biz_dashboard_read(_year,_period_kind,_period,_department_id,_user_id,_mode);lo:=(r->>'lo')::int;hi:=(r->>'hi')::int;
 opts:=public.biz_dashboard_read(_year,_period_kind,_period,NULL,NULL,_mode);
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',x->>'user_id','employee_name',x->>'employee_name','department_id',x->>'department_id','department_name',x->>'department_name','month',(x->>'month')::int,'metric_id',k.id,'baseline_id',NULL,'target_version_id',NULL,'definition',jsonb_build_object('name',k.name,'unit',k.unit,'aggregation',k.aggregation,'direction',k.direction,'value_kind',k.value_kind),'target',NULL,'actual',NULL)),'[]') INTO missing
 FROM jsonb_array_elements(r->'roster') x JOIN public.biz_kr_metrics k ON k.department_id=(x->>'department_id')::uuid AND k.active
 WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(r->'facts') f WHERE f->>'user_id'=x->>'user_id' AND f->>'month'=x->>'month');
 r:=jsonb_set(r,'{facts}',private.biz_dash_enrich((r->'facts')||missing,_year));
 r:=jsonb_set(r,'{obligations}',private.biz_dash_enrich(r->'obligations',_year));
 FOR m IN 1..12 LOOP cum:=cum||coalesce((SELECT jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)) FROM jsonb_array_elements(public.biz_dashboard_aggregate(r->'facts',1,m)) x),'[]');END LOOP;
 FOR m IN 1..4 LOOP quarters:=quarters||coalesce((SELECT jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Quý '||m)) FROM jsonb_array_elements(public.biz_dashboard_aggregate(r->'facts',(m-1)*3+1,m*3)) x),'[]');END LOOP;
 current_month:=CASE WHEN _year<extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 12 WHEN _year>extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 0 ELSE extract(month FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::int END;
 annual:=public.biz_dashboard_aggregate(r->'facts',1,12);current_data:=public.biz_dashboard_aggregate(r->'facts',1,current_month);
 RETURN r||jsonb_build_object('current_month',current_month,'options_roster',opts->'roster','totals',public.biz_dashboard_aggregate(r->'facts',lo,hi),'months',public.biz_dashboard_aggregate(r->'facts',1,12,'month'),'quarters',quarters,'cumulative',cum,'annual',annual,'current',current_data,'remaining',coalesce((SELECT jsonb_agg(jsonb_build_object('metric_key',x->>'metric_key','value',((x->>'target')::numeric-(y->>'actual')::numeric)::text)) FROM jsonb_array_elements(annual) x LEFT JOIN LATERAL (SELECT v FROM jsonb_array_elements(current_data) v WHERE v->>'metric_key'=x->>'metric_key') t ON true CROSS JOIN LATERAL (SELECT t.v y) z),'[]'),'departments',public.biz_dashboard_aggregate(r->'facts',lo,hi,'department'),'employees',public.biz_dashboard_aggregate(r->'facts',lo,hi,'employee'));
END $$;