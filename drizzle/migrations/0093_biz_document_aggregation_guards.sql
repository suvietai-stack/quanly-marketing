CREATE FUNCTION public.biz_deadline_status(_deadline timestamptz,_first timestamptz,_now timestamptz DEFAULT now()) RETURNS text LANGUAGE sql STABLE SET search_path=public AS $$ SELECT CASE WHEN _deadline IS NULL THEN 'none' WHEN _first IS NOT NULL THEN CASE WHEN _first<=_deadline THEN 'ontime' ELSE 'late' END WHEN _now>_deadline THEN 'overdue' WHEN _deadline-_now<=interval '24 hours' THEN 'soon' ELSE 'upcoming' END $$;
CREATE FUNCTION public.biz_document_save_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; target uuid;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF OLD.status='approved' THEN RAISE EXCEPTION 'Phiên bản đã duyệt không được sửa.'; END IF;
 IF d.kind='report' AND d.period_kind='month' AND NEW.status='pending' AND OLD.target_version_id IS NULL THEN
  SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=d.user_id AND year=d.year;
  IF target IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đã được duyệt sau khi tạo bản nháp. Hãy gắn mục tiêu chính thức trước khi gửi.'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER biz_document_version_guard BEFORE UPDATE ON public.biz_document_versions FOR EACH ROW EXECUTE FUNCTION public.biz_document_save_guard();
CREATE FUNCTION public.biz_document_attach_target(_id uuid,_revision int) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions;d public.biz_documents;t uuid;vals jsonb;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE;SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT private.sig_can(auth.uid(),'biz.report_submit') OR d.kind<>'report' OR d.period_kind<>'month' THEN RAISE EXCEPTION 'Không có quyền gắn mục tiêu.'; END IF;
 IF v.status NOT IN ('draft','changes') OR v.revision<>_revision OR v.target_version_id IS NOT NULL THEN RAISE EXCEPTION 'Không thể thay mục tiêu đã gắn hoặc bản đã gửi.'; END IF;
 SELECT official_version_id INTO t FROM public.biz_annual_goals WHERE user_id=d.user_id AND year=d.year;IF t IS NULL THEN RAISE EXCEPTION 'Chưa có mục tiêu chính thức.';END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',months[d.period]::text,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=t;
 UPDATE public.biz_document_versions SET target_version_id=t,items=vals,revision=revision+1 WHERE id=v.id;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),'target_attached',jsonb_build_object('target_version_id',t));
END $$;
CREATE OR REPLACE FUNCTION public.biz_report_metrics(_user uuid,_year int,_period_kind text,_period int,_mode text DEFAULT 'official') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE dep uuid; target uuid; lo int; hi int; i public.biz_goal_items; m int; v public.biz_document_versions; chosen uuid; item jsonb; values_ numeric[]; complete_months int[]; missing int[]; excluded int[]; result jsonb:='[]'; target_value numeric; actual_value numeric; percent_value numeric; refs jsonb; target_values numeric[]; year_actual numeric; year_values numeric[]; year_missing int[]; cumulative_target numeric;
BEGIN
 PERFORM public.biz_period_start(_year,_period_kind,_period);dep:=public.biz_period_department(_user,_year,_period_kind,_period);
 IF NOT public.biz_doc_access(_user,dep,'report') THEN RAISE EXCEPTION 'Không có quyền xem báo cáo.';END IF;
 IF _mode NOT IN ('official','provisional') THEN RAISE EXCEPTION 'Chế độ không hợp lệ.';END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=_user AND year=_year;
 IF _period_kind='month' THEN SELECT coalesce((SELECT target_version_id FROM public.biz_document_versions WHERE id=CASE WHEN _mode='official' THEN d.official_version_id ELSE coalesce((SELECT id FROM public.biz_document_versions WHERE document_id=d.id AND status='pending' ORDER BY version DESC LIMIT 1),d.official_version_id) END),target) INTO target FROM public.biz_documents d WHERE user_id=_user AND kind='report' AND period_kind='month' AND year=_year AND period=_period; IF NOT FOUND THEN SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=_user AND year=_year;END IF; END IF;
 IF target IS NULL THEN RETURN jsonb_build_object('target_version_id',NULL,'items','[]'::jsonb,'no_target',true);END IF;
 lo:=CASE _period_kind WHEN 'month' THEN _period WHEN 'quarter' THEN (_period-1)*3+1 ELSE 1 END;hi:=lo+CASE _period_kind WHEN 'month' THEN 0 WHEN 'quarter' THEN 2 ELSE 11 END;
 FOR i IN SELECT * FROM public.biz_goal_items WHERE version_id=target LOOP
  values_:='{}';complete_months:='{}';missing:='{}';excluded:='{}';refs:='[]';target_values:='{}';year_values:='{}';year_missing:='{}';
  FOR m IN 1..hi LOOP
   IF public.biz_period_department(_user,_year,'month',m) IS NULL THEN IF m>=lo THEN excluded:=array_append(excluded,m);END IF;CONTINUE;END IF;
   chosen:=NULL;
   SELECT CASE WHEN _mode='official' THEN d.official_version_id ELSE coalesce((SELECT id FROM public.biz_document_versions WHERE document_id=d.id AND status='pending' ORDER BY version DESC LIMIT 1),d.official_version_id) END INTO chosen FROM public.biz_documents d WHERE user_id=_user AND kind='report' AND period_kind='month' AND year=_year AND period=m;
   SELECT * INTO v FROM public.biz_document_versions WHERE id=chosen;
   SELECT x INTO item FROM jsonb_array_elements(coalesce(v.items,'[]')) x WHERE x->>'metric_id'=i.metric_id::text;
   IF item->>'actual' IS NULL THEN year_missing:=array_append(year_missing,m); ELSE year_values:=array_append(year_values,(item->>'actual')::numeric);END IF;
   IF m>=lo THEN
    target_values:=array_append(target_values,i.months[m]);
    IF item->>'actual' IS NULL THEN missing:=array_append(missing,m); ELSE values_:=array_append(values_,(item->>'actual')::numeric);complete_months:=array_append(complete_months,m);refs:=refs||jsonb_build_array(jsonb_build_object('month',m,'report_version_id',v.id,'target_version_id',v.target_version_id));END IF;
   END IF;
  END LOOP;
  SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO actual_value FROM unnest(values_) x;
  SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO target_value FROM unnest(target_values) x;
  SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO year_actual FROM unnest(year_values) x;
  SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO cumulative_target FROM unnest(i.months[1:hi]) x;
  percent_value:=CASE WHEN target_value>0 AND i.definition->>'direction'='higher' THEN actual_value/target_value*100 ELSE NULL END;
  result:=result||jsonb_build_array(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'target',target_value::text,'annual_target',i.annual::text,'actual',actual_value::text,'percent',percent_value::text,'complete',cardinality(missing)=0 AND cardinality(target_values)>0,'confirmed_months',complete_months,'missing_months',missing,'excluded_months',excluded,'source_versions',refs,'mode',_mode,'difference',(actual_value-target_value)::text,'remaining',(i.annual-year_actual)::text,'ytd_actual',year_actual::text,'ytd_target',cumulative_target::text,'ytd_difference',(year_actual-cumulative_target)::text,'ytd_missing_months',year_missing,'annual_percent',CASE WHEN i.annual>0 AND i.definition->>'direction'='higher' THEN (year_actual/i.annual*100)::text END));
 END LOOP;
 RETURN jsonb_build_object('target_version_id',target,'items',result,'no_target',false);
END $$;
REVOKE ALL ON FUNCTION public.biz_document_attach_target(uuid,int) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.biz_document_attach_target(uuid,int) TO authenticated;