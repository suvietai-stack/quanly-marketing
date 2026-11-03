-- RPC biz_document_save: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_document_save(_id uuid, _revision integer, _url text, _notes text, _actuals jsonb, _submit boolean DEFAULT false, _attachments jsonb DEFAULT NULL::jsonb, _allocations jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb; att jsonb; first_official boolean:=false;
  segs jsonb:='[]'; seg jsonb; al jsonb; tot numeric; wk text; cs date; ce date; mend date;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT public.biz_can(auth.uid(),'biz.'||d.kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền sửa tài liệu.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_report_docs:'||d.user_id::text)); IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Tài liệu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại.'; END IF;
 IF btrim(coalesce(_url,''))<>'' AND NOT public.biz_docs_url_ok(btrim(_url)) THEN RAISE EXCEPTION 'Link phải là Google Docs HTTPS hợp lệ.'; END IF;
 IF _submit AND d.kind='plan' AND NOT public.biz_docs_url_ok(btrim(coalesce(_url,''))) THEN RAISE EXCEPTION 'Vui lòng nhập link Google Docs kế hoạch chính thức trước khi nộp.'; END IF;
 IF _attachments IS NOT NULL THEN
  IF jsonb_typeof(_attachments) IS DISTINCT FROM 'array' OR jsonb_array_length(_attachments)>10 THEN RAISE EXCEPTION 'Tài liệu đính kèm phải là danh sách tối đa 10 mục.'; END IF;
  FOR att IN SELECT * FROM jsonb_array_elements(_attachments) LOOP
   IF btrim(coalesce(att->>'name',''))='' OR length(att->>'name')>200 THEN RAISE EXCEPTION 'Mỗi tài liệu đính kèm cần tên, tối đa 200 ký tự.'; END IF;
   IF coalesce(att->>'url','')!~'^https://[^[:space:]]+$' OR length(att->>'url')>2000 THEN RAISE EXCEPTION 'Liên kết tài liệu đính kèm phải là HTTPS hợp lệ.'; END IF;
   IF length(coalesce(att->>'description',''))>500 THEN RAISE EXCEPTION 'Mô tả tài liệu tối đa 500 ký tự.'; END IF;
  END LOOP;
 END IF;
 IF d.kind='report' AND d.period_kind<>'year' THEN
  IF jsonb_typeof(_actuals) IS DISTINCT FROM 'array' OR jsonb_array_length(_actuals)<>jsonb_array_length(v.items) OR (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_actuals) x)<>jsonb_array_length(_actuals) THEN RAISE EXCEPTION 'Danh sách KR không hợp lệ.'; END IF;
  FOR i IN SELECT * FROM jsonb_array_elements(v.items) LOOP
   SELECT x->'actual' INTO a FROM jsonb_array_elements(_actuals) x WHERE x->>'metric_id'=i->>'metric_id';
   IF a IS NULL THEN RAISE EXCEPTION 'Thiếu KR.'; END IF;
   IF a<>'null'::jsonb AND (a#>>'{}') !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Thực tế phải là số nguyên không âm, tối đa 20 chữ số.'; END IF;
   IF _submit AND a='null'::jsonb THEN RAISE EXCEPTION 'Cần nhập kết quả từng KR, giá trị 0 hợp lệ.'; END IF;
   new_items:=new_items||jsonb_build_array(i||jsonb_build_object('actual',a));
  END LOOP;
 ELSE
  IF coalesce(_actuals,'[]'::jsonb)<>'[]'::jsonb THEN RAISE EXCEPTION 'Không nhập lại thực tế kỳ Năm hoặc số liệu kế hoạch.'; END IF;
  new_items:=v.items;
 END IF;
 -- Phân bổ tuần giao tháng/năm: bắt buộc khi nộp, tổng các đoạn = tổng tuần từng KR.
 IF d.kind='report' AND d.period_kind='week' AND d.period_start IS NOT NULL AND to_char(d.period_start,'YYYY-MM')<>to_char(d.period_end,'YYYY-MM') THEN
  cs:=d.period_start; ce:=d.period_end;
  WHILE cs<=ce LOOP
   mend:=(date_trunc('month',cs)+interval '1 month - 1 day')::date;
   segs:=segs||jsonb_build_object('from',cs,'to',least(mend,ce));
   cs:=least(mend,ce)+1;
  END LOOP;
  IF _submit THEN
   IF jsonb_typeof(_allocations) IS DISTINCT FROM 'array' OR (SELECT count(*) FROM jsonb_array_elements(_allocations))<>jsonb_array_length(v.items)*jsonb_array_length(segs) THEN RAISE EXCEPTION 'Tuần giao tháng cần phân bổ thực tế cho từng KR theo từng đoạn tháng.'; END IF;
   IF (SELECT count(DISTINCT (x->>'metric_id',x->>'from',x->>'to')) FROM jsonb_array_elements(_allocations) x)<>jsonb_array_length(_allocations) THEN RAISE EXCEPTION 'Phân bổ không được trùng đoạn KR.'; END IF;
   FOR i IN SELECT * FROM jsonb_array_elements(new_items) LOOP
    FOR seg IN SELECT * FROM jsonb_array_elements(segs) LOOP
     SELECT x INTO al FROM jsonb_array_elements(_allocations) x WHERE x->>'metric_id'=i->>'metric_id' AND x->>'from'=seg->>'from' AND x->>'to'=seg->>'to';
     IF al IS NULL OR al->>'actual' IS NULL OR (al->>'actual')!~'^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Thiếu phân bổ hợp lệ cho KR trong đoạn % đến %.', seg->>'from', seg->>'to'; END IF;
    END LOOP;
    SELECT coalesce(sum((x->>'actual')::numeric),0) INTO tot FROM jsonb_array_elements(_allocations) x WHERE x->>'metric_id'=i->>'metric_id';
    wk:=i->>'actual';
    IF tot<>(wk)::numeric THEN RAISE EXCEPTION 'Tổng phân bổ phải bằng tổng tuần của từng KR.'; END IF;
   END LOOP;
  ELSIF _allocations IS NOT NULL AND jsonb_typeof(_allocations) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Phân bổ không hợp lệ.'; END IF;
 ELSE
  IF _allocations IS NOT NULL AND coalesce(_allocations,'null'::jsonb) NOT IN ('null'::jsonb,'[]'::jsonb) THEN RAISE EXCEPTION 'Chỉ kỳ Tuần giao tháng mới cần phân bổ.'; END IF;
  _allocations:=NULL;
 END IF;
 IF _submit AND d.first_submitted_at IS NULL THEN
  DECLARE phase_ text; late_id uuid;
  BEGIN
   IF d.kind='report' AND NOT public.biz_report_deadline_ready(d.kind,d.period_kind,d.year,d.period) THEN RAISE EXCEPTION 'Cần hoàn tất ba mốc deadline Báo cáo trước khi nộp.'; END IF; phase_:=public.biz_any_phase(d.kind,d.period_kind,d.year,d.period,now());
   IF phase_='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở.'; END IF;
   IF phase_='closed' THEN RAISE EXCEPTION 'Kỳ nộp đã đóng hoàn toàn.'; END IF;
   IF phase_='overdue' THEN
    SELECT id INTO late_id FROM public.biz_late_requests WHERE user_id=d.user_id AND kind=d.kind AND period_kind=d.period_kind AND year=d.year AND period=d.period AND status='approved' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
    IF late_id IS NULL THEN RAISE EXCEPTION 'Đã quá hạn nộp trực tiếp. Cần được duyệt nộp bù.'; END IF;
    UPDATE public.biz_late_requests SET status='used',used_at=now() WHERE id=late_id;
   END IF;
   UPDATE public.biz_documents SET deadline=public.biz_any_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now(),late_submitted=phase_='overdue' WHERE id=d.id;
  END;
 END IF;
 IF _submit THEN UPDATE public.biz_documents SET last_submitted_at=now() WHERE id=d.id; END IF;
 first_official:=_submit AND d.kind='report' AND d.official_version_id IS NULL;
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),attachments=coalesce(_attachments,v.attachments),items=new_items,allocations=CASE WHEN _allocations IS NOT NULL THEN _allocations WHEN d.period_kind='week' THEN v.allocations ELSE NULL END,status=CASE WHEN _submit AND d.kind='plan' AND v.status='changes' THEN 'resubmitted' WHEN _submit AND first_official THEN 'approved' WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,approved_at=CASE WHEN first_official THEN now() END,approved_by=CASE WHEN first_official THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF first_official THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items,'attachments',coalesce(_attachments,v.attachments),'allocations',_allocations),'target_version_id',v.target_version_id,'resubmitted',_submit AND v.status='changes','official',first_official));
END $function$;

-- RPC biz_document_start: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_document_start(_kind text, _period_kind text, _year integer, _period integer, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE d public.biz_documents; v_id uuid; dep uuid; target uuid; vals jsonb; pstart date; cyc jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') OR NOT public.biz_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
 PERFORM public.biz_period_start(_year,_period_kind,_period); PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 pstart:=public.biz_period_start_date(_period_kind,_year,_period);
 dep:=public.biz_period_department_any(auth.uid(),_period_kind,_year,_period); IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng kinh doanh trong kỳ này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period FOR UPDATE;
 IF d.id IS NULL AND _kind='report' THEN IF NOT public.biz_report_period_matches(auth.uid(),_period_kind,_year,_period) THEN RAISE EXCEPTION 'Kỳ xem giao thời điểm đổi chu kỳ; chỉ nộp kỳ nguồn được giao, không tạo nghĩa vụ trùng.'; END IF;
   cyc:=public.biz_report_cycle_config_of(auth.uid(),pstart);
   IF coalesce(cyc->>'cycle','month')<>_period_kind THEN RAISE EXCEPTION 'Đơn vị của bạn đang áp dụng chu kỳ báo cáo khác cho kỳ này — không tạo hồ sơ trùng.'; END IF;
   IF _period_kind='day' AND cyc->'workdays' IS NOT NULL AND coalesce(cyc->'workdays'->>(extract(isodow FROM pstart)::integer::text),'true')='false' THEN RAISE EXCEPTION 'Ngày này không thuộc lịch báo cáo của đơn vị.'; END IF;
 END IF;
 IF d.id IS NULL THEN INSERT INTO public.biz_documents(user_id,department_id,department_name,kind,period_kind,year,period,deadline,period_start,period_end) SELECT auth.uid(),id,name,_kind,_period_kind,_year,_period,public.biz_any_deadline_at(_kind||'_'||_period_kind,_year,_period),pstart,public.biz_period_end_date(_period_kind,_year,_period) FROM public.biz_departments WHERE id=dep RETURNING * INTO d; END IF;
 SELECT id INTO v_id FROM public.biz_document_versions WHERE document_id=d.id AND status<>'approved'; IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF d.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year;
 vals:='[]';
 IF _kind='report' AND target IS NOT NULL THEN
   IF _period_kind='month' THEN
     SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',months[_period]::text,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target;
   ELSIF _period_kind='quarter' THEN
     SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',qt,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals
     FROM (SELECT metric_id,definition,annual,months,
              CASE WHEN (months[(_period-1)*3+1]#>>'{}')~'^[0-9]+$' AND (months[(_period-1)*3+2]#>>'{}')~'^[0-9]+$' AND (months[(_period-1)*3+3]#>>'{}')~'^[0-9]+$'
                  THEN ((months[(_period-1)*3+1]#>>'{}')::numeric+(months[(_period-1)*3+2]#>>'{}')::numeric+(months[(_period-1)*3+3]#>>'{}')::numeric)::text END AS qt
           FROM public.biz_goal_items WHERE version_id=target) g;
   ELSE
     SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',NULL,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target;
   END IF;
 END IF;
 INSERT INTO public.biz_document_versions(document_id,version,reason,target_version_id,items) VALUES(d.id,coalesce((SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id),0)+1,nullif(btrim(_reason),''),CASE WHEN _kind='report' THEN target END,vals) RETURNING id INTO v_id;
 IF d.official_version_id IS NOT NULL THEN UPDATE public.biz_document_versions SET url=old.url,notes=old.notes,attachments=old.attachments,allocations=old.allocations,target_version_id=old.target_version_id,items=old.items FROM public.biz_document_versions old WHERE old.id=d.official_version_id AND biz_document_versions.id=v_id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v_id,auth.uid(),'created',jsonb_build_object('reason',_reason)); RETURN v_id;
END $function$;