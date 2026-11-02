-- Month coverage states (full/partial/none/na) based on real obligations, plus opening-balance confirmations.
CREATE TABLE public.biz_opening_actuals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES public.profiles(id),metric_id uuid NOT NULL REFERENCES public.biz_kr_metrics(id),period_start date NOT NULL,period_end date NOT NULL,value text NOT NULL,source_note text NOT NULL,confirmed_by uuid NOT NULL REFERENCES public.profiles(id),created_at timestamptz NOT NULL DEFAULT now(),CHECK(period_end>=period_start),CHECK(value ~ '^[0-9]{1,20}$'));
GRANT SELECT ON public.biz_opening_actuals TO authenticated; GRANT ALL ON public.biz_opening_actuals TO service_role;
ALTER TABLE public.biz_opening_actuals ENABLE ROW LEVEL SECURITY;
CREATE POLICY biz_opening_read ON public.biz_opening_actuals FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_super_admin(auth.uid()) OR public.biz_can(auth.uid(),'biz.intervene'));
CREATE TABLE public.biz_opening_actual_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),opening_id uuid NOT NULL,actor_id uuid NOT NULL REFERENCES public.profiles(id),action text NOT NULL,payload jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_opening_actual_events TO authenticated; GRANT ALL ON public.biz_opening_actual_events TO service_role;
ALTER TABLE public.biz_opening_actual_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY biz_opening_events_read ON public.biz_opening_actual_events FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.biz_opening_actuals o WHERE o.id=opening_id AND (o.user_id=auth.uid() OR public.is_super_admin(auth.uid()) OR public.biz_can(auth.uid(),'biz.intervene'))));
-- Coverage of one metric over a date range (normally one month): obligations from the real applied calendar, official fulfillment, partial actuals, opening fallback.
CREATE FUNCTION private.biz_report_month_coverage(_user uuid,_metric uuid,_from date,_to date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE rec_ record; expected_ integer:=0; received_ integer:=0; missing_ jsonb:='[]'; actual_ numeric; opening_ numeric; status_ text; source_ text:='reports';
BEGIN
 FOR rec_ IN
  WITH days AS (
   SELECT d::date AS day_,public.biz_report_cycle_of(_user,d::date) AS cycle FROM generate_series(_from::timestamp,_to::timestamp,interval '1 day') d WHERE public.biz_department_at(_user,d::date) IS NOT NULL
  ), obligs AS (
   SELECT DISTINCT CASE WHEN cycle IN ('day','week') THEN cycle ELSE 'month' END AS pk,
    CASE WHEN cycle='day' THEN (day_-make_date(extract(year FROM day_)::integer,1,1))+1 WHEN cycle='week' THEN to_char(day_,'IW')::integer ELSE extract(month FROM day_)::integer END AS p,
    CASE WHEN cycle='week' THEN to_char(day_,'IYYY')::integer ELSE extract(year FROM day_)::integer END AS y
   FROM days WHERE cycle<>'day' OR coalesce(public.biz_report_cycle_config_of(_user,day_)->'workdays'->>(extract(isodow FROM day_)::integer::text),'true')<>'false'
  ) SELECT * FROM obligs
 LOOP
  expected_:=expected_+1;
  DECLARE d_ public.biz_documents; v_ public.biz_document_versions; covered_ boolean:=false; ps_ date; pe_ date; sf_ date; st_ date;
  BEGIN
   SELECT * INTO d_ FROM public.biz_documents WHERE user_id=_user AND kind='report' AND period_kind=rec_.pk AND year=rec_.y AND period=rec_.p;
   IF d_.official_version_id IS NOT NULL THEN
    SELECT * INTO v_ FROM public.biz_document_versions WHERE id=d_.official_version_id;
    ps_:=coalesce(d_.period_start,public.biz_period_start_date(d_.period_kind,d_.year,d_.period));
    pe_:=coalesce(d_.period_end,public.biz_period_end_date(d_.period_kind,d_.year,d_.period));
    sf_:=greatest(ps_,_from); st_:=least(pe_,_to);
    IF rec_.pk='week' AND to_char(ps_,'YYYY-MM')<>to_char(pe_,'YYYY-MM') THEN
     covered_:=EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(v_.allocations,'[]')) a WHERE a->>'metric_id'=_metric::text AND (a->>'from')::date=sf_ AND (a->>'to')::date=st_ AND a->>'actual' IS NOT NULL);
    ELSE
     covered_:=EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(v_.items,'[]')) x WHERE x->>'metric_id'=_metric::text AND x->>'actual' IS NOT NULL);
    END IF;
   END IF;
   IF covered_ THEN received_:=received_+1;
   ELSE missing_:=missing_||jsonb_build_array(jsonb_build_object('period_kind',rec_.pk,'year',rec_.y,'period',rec_.p,'period_start',public.biz_period_start_date(rec_.pk,rec_.y,rec_.p),'period_end',public.biz_period_end_date(rec_.pk,rec_.y,rec_.p)));
   END IF;
  END;
 END LOOP;
 WITH versions AS (
  SELECT d.*,v.items,v.allocations FROM public.biz_documents d JOIN public.biz_document_versions v ON v.id=d.official_version_id WHERE d.user_id=_user AND d.kind='report' AND d.period_kind<>'year'
 ), fragments AS (
  SELECT d.id,coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period)) s,coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period)) e,x->>'actual' actual
  FROM versions d CROSS JOIN LATERAL jsonb_array_elements(d.items) x WHERE x->>'metric_id'=_metric::text AND NOT(d.period_kind='week' AND to_char(coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period)),'YYYY-MM')<>to_char(coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period)),'YYYY-MM'))
  UNION ALL
  SELECT d.id,(a->>'from')::date,(a->>'to')::date,a->>'actual' FROM versions d CROSS JOIN LATERAL jsonb_array_elements(coalesce(d.allocations,'[]')) a WHERE d.period_kind='week' AND a->>'metric_id'=_metric::text
 ) SELECT sum(actual::numeric) INTO actual_ FROM fragments WHERE s>=_from AND e<=_to AND actual IS NOT NULL;
 IF NOT EXISTS(SELECT 1 FROM public.biz_documents d WHERE d.user_id=_user AND d.kind='report' AND d.official_version_id IS NOT NULL AND coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period))<=_to AND _from<=coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period))) THEN
  SELECT o.value::numeric INTO opening_ FROM public.biz_opening_actuals o WHERE o.user_id=_user AND o.metric_id=_metric AND o.period_start<=_from AND o.period_end>=_to ORDER BY o.created_at DESC LIMIT 1;
 END IF;
 IF opening_ IS NOT NULL THEN actual_:=opening_; status_:='full'; source_:='opening';
 ELSE status_:=CASE WHEN expected_=0 THEN 'na' WHEN received_=0 THEN 'none' WHEN received_<expected_ THEN 'partial' ELSE 'full' END;
 END IF;
 RETURN jsonb_build_object('status',status_,'actual',actual_::text,'expected',expected_,'received',received_,'missing',missing_,'source',source_);
END $$;
REVOKE ALL ON FUNCTION private.biz_report_month_coverage(uuid,uuid,date,date) FROM PUBLIC,anon,authenticated,service_role;
-- Opening confirmations fill ranges without official reports; official data always wins, never double counted.
DO $patch$
DECLARE f text; marker text;
BEGIN
 SELECT pg_get_functiondef('private.biz_report_actual_range(uuid,uuid,date,date,text)'::regprocedure) INTO f;
 marker:=', bounded AS (SELECT * FROM fragments WHERE s>=_from AND e<=_to AND actual IS NOT NULL)';
 IF position(marker IN f)=0 THEN RAISE EXCEPTION 'Actual range shape changed.'; END IF;
 f:=replace(f,marker,$new$, openings AS (
  SELECT o.id,greatest(o.period_start,_from) s,least(o.period_end,_to) e,o.value actual,NULL::jsonb definition FROM public.biz_opening_actuals o
  WHERE o.user_id=_user AND o.metric_id=_metric AND o.period_start<=_to AND o.period_end>=_from
  AND NOT EXISTS(SELECT 1 FROM fragments fr WHERE fr.actual IS NOT NULL AND fr.s<=least(o.period_end,_to) AND greatest(o.period_start,_from)<=fr.e)
 ), bounded AS (SELECT * FROM fragments WHERE s>=_from AND e<=_to AND actual IS NOT NULL UNION ALL SELECT * FROM openings)$new$);
 EXECUTE f;
END $patch$;
-- Rolling basis consumes coverage: na months are exempt, partial months keep their partial actual but block completeness.
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('private.biz_rolling_basis(uuid)'::regprocedure) INTO f;
 IF position('actuals_ jsonb; current_ jsonb; a text;' IN f)=0 THEN RAISE EXCEPTION 'Rolling basis declarations changed.'; END IF;
 f:=replace(f,'actuals_ jsonb; current_ jsonb; a text;','actuals_ jsonb; current_ jsonb; a text; cov_ jsonb; covs_ jsonb;');
 f:=replace(f,'actuals_:=''[]'';total_:=0;complete_:=true;','actuals_:=''[]'';covs_:=''[]'';total_:=0;complete_:=true;');
 IF position('IF a IS NULL THEN complete_:=false; ELSE total_:=total_+a::numeric;END IF;' IN f)=0 THEN RAISE EXCEPTION 'Rolling basis month loop changed.'; END IF;
 f:=replace(f,'IF a IS NULL THEN complete_:=false; ELSE total_:=total_+a::numeric;END IF;',$new$cov_:=private.biz_report_month_coverage(g.user_id,i.metric_id,make_date(g.year,m,1),(make_date(g.year,m,1)+interval '1 month - 1 day')::date);
  a:=cov_->>'actual';
  covs_:=covs_||jsonb_build_array(jsonb_build_object('status',cov_->>'status','source',cov_->>'source','expected',cov_->>'expected','received',cov_->>'received','missing',cov_->'missing'));
  IF cov_->>'status' IN ('none','partial') THEN complete_:=false; END IF;
  IF a IS NOT NULL THEN total_:=total_+a::numeric; END IF;$new$);
 f:=replace(f,'''actuals'',actuals_,''complete''','''actuals'',actuals_,''coverage'',covs_,''complete''');
 EXECUTE f;
END $patch$;
-- Opening balance confirmation: privileged, audited, never overlapping official reports or other openings.
CREATE FUNCTION public.biz_opening_actual_save(_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=nullif(_data->>'user_id','')::uuid; mid uuid:=nullif(_data->>'metric_id','')::uuid; ps date:=nullif(_data->>'period_start','')::date; pe date:=nullif(_data->>'period_end','')::date; val text:=btrim(coalesce(_data->>'value','')); note_ text:=btrim(coalesce(_data->>'source_note','')); id_ uuid;
BEGIN
 IF NOT (public.is_super_admin(auth.uid()) OR public.biz_can(auth.uid(),'biz.intervene')) THEN RAISE EXCEPTION 'Chỉ người được cấp quyền mới xác nhận số liệu đầu kỳ.'; END IF;
 IF uid IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND status='Đang hoạt động') THEN RAISE EXCEPTION 'Nhân viên không hợp lệ.'; END IF;
 IF mid IS NULL OR NOT EXISTS(SELECT 1 FROM public.biz_kr_metrics WHERE id=mid) THEN RAISE EXCEPTION 'Chỉ số KR không hợp lệ.'; END IF;
 IF val !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Giá trị phải là số nguyên không âm, không tự tạo số 0.'; END IF;
 IF ps IS NULL OR pe IS NULL OR pe<ps THEN RAISE EXCEPTION 'Khoảng thời gian xác nhận không hợp lệ.'; END IF;
 IF note_='' THEN RAISE EXCEPTION 'Cần nguồn đối chiếu hoặc ghi chú.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_opening:'||uid::text));
 IF EXISTS(SELECT 1 FROM public.biz_opening_actuals o WHERE o.user_id=uid AND o.metric_id=mid AND o.period_start<=pe AND ps<=o.period_end) THEN RAISE EXCEPTION 'Đã có xác nhận đầu kỳ chồng lấn khoảng này.'; END IF;
 IF EXISTS(SELECT 1 FROM public.biz_documents d WHERE d.user_id=uid AND d.kind='report' AND d.official_version_id IS NOT NULL AND coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period))<=pe AND ps<=coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period))) THEN RAISE EXCEPTION 'Khoảng này đã có báo cáo chính thức; không xác nhận đầu kỳ để tránh cộng trùng.'; END IF;
 INSERT INTO public.biz_opening_actuals(user_id,metric_id,period_start,period_end,value,source_note,confirmed_by) VALUES(uid,mid,ps,pe,val,note_,auth.uid()) RETURNING id INTO id_;
 INSERT INTO public.biz_opening_actual_events(opening_id,actor_id,action,payload) VALUES(id_,auth.uid(),'confirmed',_data);
 RETURN id_;
END $$;
CREATE FUNCTION public.biz_opening_actual_delete(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.biz_opening_actuals;
BEGIN
 IF NOT (public.is_super_admin(auth.uid()) OR public.biz_can(auth.uid(),'biz.intervene')) THEN RAISE EXCEPTION 'Chỉ người được cấp quyền mới xóa xác nhận đầu kỳ.'; END IF;
 SELECT * INTO o FROM public.biz_opening_actuals WHERE id=_id FOR UPDATE;
 IF o.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy xác nhận đầu kỳ.'; END IF;
 INSERT INTO public.biz_opening_actual_events(opening_id,actor_id,action,payload) VALUES(o.id,auth.uid(),'deleted',to_jsonb(o));
 DELETE FROM public.biz_opening_actuals WHERE id=o.id;
END $$;
CREATE FUNCTION public.biz_opening_actuals_read(_user uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid()<>_user AND NOT public.is_super_admin(auth.uid()) AND NOT public.biz_can(auth.uid(),'biz.intervene') AND NOT (public.biz_can(auth.uid(),'biz.view_dept') AND public.biz_scope_ok(auth.uid(),_user,public.biz_period_department_any(_user,'month',extract(year FROM now())::integer,extract(month FROM now())::integer),now())) AND NOT public.biz_can(auth.uid(),'biz.view_all') THEN RAISE EXCEPTION 'Không có quyền xem xác nhận đầu kỳ.'; END IF;
 RETURN coalesce((SELECT jsonb_agg(to_jsonb(o)||jsonb_build_object('metric_name',(SELECT name FROM public.biz_kr_metrics m WHERE m.id=o.metric_id),'confirmed_by_name',(SELECT full_name FROM public.profiles p WHERE p.id=o.confirmed_by)) ORDER BY o.period_start) FROM public.biz_opening_actuals o WHERE o.user_id=_user),'[]');
END $$;
-- Per-metric month coverage for UI (self, managers in scope, intervention, view_all).
CREATE FUNCTION public.biz_report_coverage_read(_user uuid,_year integer,_month integer) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.biz_annual_goals; i public.biz_goal_items; out_ jsonb:='[]'; from_ date:=make_date(_year,_month,1); to_ date:=(make_date(_year,_month,1)+interval '1 month - 1 day')::date;
BEGIN
 IF auth.uid()<>_user AND NOT public.is_super_admin(auth.uid()) AND NOT public.biz_can(auth.uid(),'biz.intervene') AND NOT (public.biz_can(auth.uid(),'biz.view_dept') AND public.biz_scope_ok(auth.uid(),_user,public.biz_period_department_any(_user,'month',_year,_month),now())) AND NOT public.biz_can(auth.uid(),'biz.view_all') THEN RAISE EXCEPTION 'Không có quyền xem độ phủ báo cáo.'; END IF;
 SELECT * INTO g FROM public.biz_annual_goals WHERE user_id=_user AND year=_year;
 IF g.id IS NULL OR g.official_version_id IS NULL THEN RETURN '[]'; END IF;
 FOR i IN SELECT * FROM public.biz_goal_items WHERE version_id=g.official_version_id ORDER BY metric_id LOOP
  out_:=out_||jsonb_build_array(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition)||private.biz_report_month_coverage(_user,i.metric_id,from_,to_));
 END LOOP;
 RETURN out_;
END $$;
REVOKE ALL ON FUNCTION public.biz_opening_actual_save(jsonb),public.biz_opening_actual_delete(uuid),public.biz_opening_actuals_read(uuid),public.biz_report_coverage_read(uuid,integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_opening_actual_save(jsonb),public.biz_opening_actual_delete(uuid),public.biz_opening_actuals_read(uuid),public.biz_report_coverage_read(uuid,integer,integer) TO authenticated;