-- Canonical source fragments, private and never directly exposed. Quarter totals cannot be spread to months.
CREATE OR REPLACE FUNCTION private.biz_report_actual_range(_user uuid,_metric uuid,_from date,_to date,_mode text DEFAULT 'official') RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE total_ numeric; overlap_ boolean; unsupported_ boolean;
BEGIN
 WITH versions AS (
 SELECT d.*,v.items,v.allocations FROM public.biz_documents d JOIN public.biz_document_versions v ON v.id=CASE WHEN _mode='provisional' THEN coalesce((SELECT id FROM public.biz_document_versions WHERE document_id=d.id AND status='pending' ORDER BY version DESC LIMIT 1),d.official_version_id) ELSE d.official_version_id END
 WHERE d.user_id=_user AND d.kind='report' AND d.period_kind<>'year'
 ), fragments AS (
 SELECT d.id,coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period)) s,coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period)) e,x->>'actual' actual,x->'definition' definition
 FROM versions d CROSS JOIN LATERAL jsonb_array_elements(d.items) x WHERE x->>'metric_id'=_metric::text AND NOT(d.period_kind='week' AND to_char(coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period)),'YYYY-MM')<>to_char(coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period)),'YYYY-MM'))
 UNION ALL
 SELECT d.id,(a->>'from')::date,(a->>'to')::date,a->>'actual',x->'definition'
 FROM versions d CROSS JOIN LATERAL jsonb_array_elements(coalesce(d.allocations,'[]')) a CROSS JOIN LATERAL jsonb_array_elements(d.items) x
 WHERE d.period_kind='week' AND a->>'metric_id'=_metric::text AND x->>'metric_id'=_metric::text
 ), bounded AS (SELECT * FROM fragments WHERE s>=_from AND e<=_to AND actual IS NOT NULL)
 SELECT sum(actual::numeric),EXISTS(SELECT 1 FROM bounded a JOIN bounded b ON a.id<>b.id AND a.s<=b.e AND b.s<=a.e),bool_or(coalesce(definition->>'aggregation','sum')<>'sum') INTO total_,overlap_,unsupported_ FROM bounded;
 IF overlap_ OR unsupported_ THEN RETURN NULL; END IF;
 RETURN total_::text;
END $$;
REVOKE ALL ON FUNCTION private.biz_report_actual_range(uuid,uuid,date,date,text) FROM PUBLIC,anon,authenticated;
-- Existing report summary reads source ranges instead of only month documents; preserve baselines and access.
DO $patch$
DECLARE f text; old text;
BEGIN
 SELECT pg_get_functiondef('public.biz_report_metrics(uuid,integer,text,integer,text)'::regprocedure) INTO f;
 f:=replace(f,'dep:=public.biz_period_department(_user,_year,_period_kind,_period);','dep:=public.biz_period_department_any(_user,_period_kind,_year,_period);');
 old:='SELECT x INTO item FROM jsonb_array_elements(coalesce(v.items,''[]'')) x WHERE x->>''metric_id''=i.metric_id::text;';
 IF position(old in f)=0 THEN RAISE EXCEPTION 'Report summary shape changed.'; END IF;
 f:=replace(f,old,$new$SELECT x INTO item FROM jsonb_array_elements(coalesce(v.items,'[]')) x WHERE x->>'metric_id'=i.metric_id::text;
   IF item->>'actual' IS NULL THEN item:=jsonb_build_object('actual',private.biz_report_actual_range(_user,i.metric_id,make_date(_year,m,1),(make_date(_year,m,1)+interval '1 month - 1 day')::date,_mode)); END IF;$new$);
 f:=replace(f,'PERFORM public.biz_period_start(_year,_period_kind,_period);',$day$PERFORM public.biz_period_start(_year,_period_kind,_period);
 IF _period_kind IN ('day','week') THEN
  DECLARE d_ public.biz_documents; v_ public.biz_document_versions;
  BEGIN
   SELECT * INTO d_ FROM public.biz_documents WHERE user_id=_user AND kind='report' AND period_kind=_period_kind AND year=_year AND period=_period;
   IF NOT public.biz_doc_access(_user,coalesce(d_.department_id,public.biz_period_department_any(_user,_period_kind,_year,_period)),'report') THEN RAISE EXCEPTION 'Không có quyền xem báo cáo.'; END IF;
   IF _mode NOT IN ('official','provisional') THEN RAISE EXCEPTION 'Chế độ không hợp lệ.'; END IF;
   SELECT * INTO v_ FROM public.biz_document_versions WHERE id=CASE WHEN _mode='provisional' THEN coalesce((SELECT id FROM public.biz_document_versions WHERE document_id=d_.id AND status='pending' ORDER BY version DESC LIMIT 1),d_.official_version_id) ELSE d_.official_version_id END;
   RETURN jsonb_build_object('target_version_id',v_.target_version_id,'items',coalesce(v_.items,'[]'),'no_target',v_.target_version_id IS NULL);
  END;
 END IF;$day$);
 EXECUTE f;
END $patch$;
-- Both detailed and published dashboards keep their existing scope and charts, sharing the same canonical actual source.
DO $patch$
DECLARE f text; signature text; old text;
BEGIN
 FOREACH signature IN ARRAY ARRAY['public.biz_dashboard_read(integer,text,integer,uuid,uuid,text)','private.biz_dashboard_global_read(integer,text,integer,uuid,uuid,text)'] LOOP
  SELECT pg_get_functiondef(signature::regprocedure) INTO f;
  old:='(SELECT x->>''actual'' FROM jsonb_array_elements(coalesce(r.items,''[]'')) x WHERE x->>''metric_id''=i.metric_id::text) actual';
  IF position(old in f)=0 THEN RAISE EXCEPTION 'Dashboard source shape changed: %',signature; END IF;
  f:=replace(f,old,'private.biz_report_actual_range(r.user_id,i.metric_id,make_date(_year,r.month,1),(make_date(_year,r.month,1)+interval ''1 month - 1 day'')::date,_mode) actual');
  EXECUTE f;
 END LOOP;
END $patch$;
-- Attach approved goals for daily/weekly forms without inventing daily targets.
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('public.biz_document_attach_target(uuid,integer)'::regprocedure) INTO f;
 f:=replace(f,'d.period_kind<>''month''','d.period_kind NOT IN (''day'',''week'',''month'',''quarter'')');
 f:=replace(f,'months[d.period]::text','CASE WHEN d.period_kind=''month'' THEN months[d.period]::text ELSE NULL END');
 EXECUTE f;
END $patch$;