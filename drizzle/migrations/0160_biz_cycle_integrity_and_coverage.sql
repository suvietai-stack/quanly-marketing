-- Require full assigned coverage before treating a monthly aggregate as a complete result.
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('private.biz_report_actual_range(uuid,uuid,date,date,text)'::regprocedure) INTO f;
 f:=replace(f,'unsupported_ boolean;','unsupported_ boolean; missing_ boolean;');
 f:=replace(f,'bool_or(coalesce(definition->>''aggregation'',''sum'')<>''sum'') INTO total_,overlap_,unsupported_ FROM bounded;',$coverage$bool_or(coalesce(definition->>'aggregation','sum')<>'sum'),
 EXISTS(SELECT 1 FROM generate_series(_from::timestamp,_to::timestamp,interval '1 day') day_ WHERE public.biz_department_at(_user,day_::date) IS NOT NULL
 AND (public.biz_report_cycle_of(_user,day_::date)<>'day' OR coalesce(public.biz_report_cycle_config_of(_user,day_::date)->'workdays'->>extract(isodow FROM day_),'true')<>'false')
 AND NOT EXISTS(SELECT 1 FROM bounded b WHERE day_::date BETWEEN b.s AND b.e)) INTO total_,overlap_,unsupported_,missing_ FROM bounded;$coverage$);
 f:=replace(f,'IF overlap_ OR unsupported_ THEN','IF overlap_ OR unsupported_ OR missing_ THEN'); EXECUTE f;
 -- Keep legacy monthly average/ratio behavior: canonical additive source only supplements absent monthly actuals.
 FOREACH f IN ARRAY ARRAY['public.biz_dashboard_read(integer,text,integer,uuid,uuid,text)','private.biz_dashboard_global_read(integer,text,integer,uuid,uuid,text)'] LOOP
  DECLARE body_ text;
  BEGIN
   SELECT pg_get_functiondef(f::regprocedure) INTO body_;
   body_:=replace(body_,'private.biz_report_actual_range(r.user_id,i.metric_id,make_date(_year,r.month,1),(make_date(_year,r.month,1)+interval ''1 month - 1 day'')::date,_mode) actual','CASE WHEN i.definition->>''aggregation''=''sum'' THEN private.biz_report_actual_range(r.user_id,i.metric_id,make_date(_year,r.month,1),(make_date(_year,r.month,1)+interval ''1 month - 1 day'')::date,_mode) ELSE (SELECT x->>''actual'' FROM jsonb_array_elements(coalesce(r.items,''[]'')) x WHERE x->>''metric_id''=i.metric_id::text) END actual'); EXECUTE body_;
  END;
 END LOOP;
END $patch$;
-- Never classify a report quarter as late before it ends, regardless of old month-based deadline settings.
CREATE OR REPLACE FUNCTION public.biz_any_phase(_kind text,_pk text,_y int,_p int,_now timestamptz DEFAULT now()) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF _kind='report' AND _pk='quarter' AND (_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<=public.biz_period_end_date(_pk,_y,_p) THEN RETURN 'not_open'; END IF;
 IF _pk IN ('day','week') THEN RETURN public.biz_cycle_phase(_kind||'_'||_pk,public.biz_period_start_date(_pk,_y,_p),_now); END IF;
 RETURN public.biz_deadline_phase(_kind||'_'||_pk,_y,_p,_now);
END $$;
-- Protect completed historical obligations from editing/deleting effective configurations in the past.
CREATE OR REPLACE FUNCTION public.biz_cycle_config_history_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE at_ date;
BEGIN
 at_:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
 IF TG_OP IN ('UPDATE','DELETE') AND OLD.effective_from<at_ THEN RAISE EXCEPTION 'Cấu hình đã có hiệu lực trong quá khứ phải được giữ. Hãy tạo cấu hình mới cho kỳ tiếp theo.'; END IF;
 IF TG_OP<>'DELETE' THEN
  IF NEW.effective_from<at_ THEN RAISE EXCEPTION 'Không tạo nghĩa vụ báo cáo hồi tố.'; END IF;
  IF NEW.cycle='day' AND NEW.workdays IS NOT NULL AND NOT EXISTS(SELECT 1 FROM jsonb_each(NEW.workdays) x WHERE x.value='true'::jsonb) THEN RAISE EXCEPTION 'Cần chọn ít nhất một ngày báo cáo.'; END IF;
  IF NEW.cycle='week' AND extract(isodow FROM NEW.effective_from)<>1 THEN RAISE EXCEPTION 'Chu kỳ Tuần phải bắt đầu vào Thứ Hai.'; END IF;
  IF NEW.cycle='month' AND extract(day FROM NEW.effective_from)<>1 THEN RAISE EXCEPTION 'Chu kỳ Tháng phải bắt đầu ngày đầu tháng.'; END IF;
  IF NEW.cycle='quarter' AND (extract(day FROM NEW.effective_from)<>1 OR extract(month FROM NEW.effective_from) NOT IN (1,4,7,10)) THEN RAISE EXCEPTION 'Chu kỳ Quý phải bắt đầu ngày đầu quý.'; END IF;
 END IF;
 RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
REVOKE ALL ON FUNCTION public.biz_cycle_config_history_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER biz_cycle_config_history_guard BEFORE INSERT OR UPDATE OR DELETE ON public.biz_report_cycle_configs FOR EACH ROW EXECUTE FUNCTION public.biz_cycle_config_history_guard();
-- Allocation tuples are unique, not just equal in count.
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('public.biz_document_save(uuid,integer,text,text,jsonb,boolean,jsonb,jsonb)'::regprocedure) INTO f;
 f:=replace(f,'IF _submit THEN\n   IF jsonb_typeof(_allocations)',$noop$IF _submit THEN
   IF jsonb_typeof(_allocations)$noop$);
 f:=replace(f,'FOR i IN SELECT * FROM jsonb_array_elements(new_items) LOOP',$unique$IF (SELECT count(DISTINCT (x->>'metric_id',x->>'from',x->>'to')) FROM jsonb_array_elements(_allocations) x)<>jsonb_array_length(_allocations) THEN RAISE EXCEPTION 'Phân bổ không được trùng đoạn KR.'; END IF;
    FOR i IN SELECT * FROM jsonb_array_elements(new_items) LOOP$unique$);
 EXECUTE f;
END $patch$;