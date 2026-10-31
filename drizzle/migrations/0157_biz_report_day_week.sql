-- Bước 2 — Nghĩa vụ nộp theo chu kỳ được giao: hỗ trợ kỳ Ngày/Tuần trong hồ sơ, deadline, nộp bù và Công việc của tôi.
-- Giữ nguyên quy trình phê duyệt/nộp bù; Kế hoạch vẫn Tháng/Quý/Năm; Báo cáo Năm chỉ là tổng hợp xem.

-- ===== biz_period_start chấp nhận day/week (validation dùng chung) =====
CREATE OR REPLACE FUNCTION public.biz_period_start(_year int,_kind text,_period int) RETURNS timestamptz LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
BEGIN
  IF _year NOT BETWEEN 2000 AND 2200 THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  IF _kind='month' AND _period BETWEEN 1 AND 12 THEN RETURN make_date(_year,_period,1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'; END IF;
  IF _kind='quarter' AND _period BETWEEN 1 AND 4 THEN RETURN make_date(_year,(_period-1)*3+1,1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'; END IF;
  IF _kind='year' AND _period=1 THEN RETURN make_date(_year,1,1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'; END IF;
  IF _kind='day' AND _period BETWEEN 1 AND 366 THEN
    IF make_date(_year,1,1)+(_period-1) > make_date(_year,12,31) THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
    RETURN (make_date(_year,1,1)+(_period-1))::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh';
  END IF;
  IF _kind='week' AND _period BETWEEN 1 AND 53 THEN
    RETURN (make_date(_year,1,4)-(extract(isodow FROM make_date(_year,1,4))::int-1)+(_period-1)*7)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh';
  END IF;
  RAISE EXCEPTION 'Kỳ không hợp lệ.';
END $$;

-- ===== Ranh giới ngày của kỳ (mọi cấp) =====
CREATE FUNCTION public.biz_period_start_date(_kind text,_y int,_p int) RETURNS date LANGUAGE sql IMMUTABLE SET search_path=public AS $$
  SELECT (public.biz_period_start(_y,_kind,_p) AT TIME ZONE 'Asia/Ho_Chi_Minh')::date $$;
CREATE FUNCTION public.biz_period_end_date(_kind text,_y int,_p int) RETURNS date LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE s date:=public.biz_period_start_date(_kind,_y,_p);
BEGIN
  RETURN CASE _kind WHEN 'day' THEN s WHEN 'week' THEN s+6 WHEN 'month' THEN (s+interval '1 month - 1 day')::date WHEN 'quarter' THEN (s+interval '3 months - 1 day')::date ELSE make_date(_y,12,31) END;
END $$;

-- ===== Phân phối theo cấp kỳ: phòng, mốc deadline, pha nộp =====
CREATE FUNCTION public.biz_period_department_any(_user uuid,_kind text,_y int,_p int) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT CASE WHEN _kind IN ('day','week') THEN public.biz_department_at(_user, public.biz_period_start_date(_kind,_y,_p)) ELSE public.biz_period_department(_user,_y,_kind,_p) END $$;
CREATE FUNCTION public.biz_any_milestones(_kind text,_pk text,_y int,_p int) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF _pk IN ('day','week') THEN RETURN public.biz_cycle_milestones(_kind||'_'||_pk, public.biz_period_start_date(_pk,_y,_p)); END IF;
  RETURN public.biz_deadline_milestones(_kind||'_'||_pk,_y,_p);
END $$;
CREATE FUNCTION public.biz_any_phase(_kind text,_pk text,_y int,_p int,_now timestamptz DEFAULT now()) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF _pk IN ('day','week') THEN RETURN public.biz_cycle_phase(_kind||'_'||_pk, public.biz_period_start_date(_pk,_y,_p), _now); END IF;
  RETURN public.biz_deadline_phase(_kind||'_'||_pk,_y,_p,_now);
END $$;
CREATE FUNCTION public.biz_any_deadline_at(_kind text,_y int,_p int) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE pk text;
BEGIN
  pk:=regexp_replace(_kind,'^(plan|report)_','');
  IF pk IN ('day','week') THEN RETURN (public.biz_cycle_milestones(_kind, public.biz_period_start_date(pk,_y,_p))->>'due')::timestamptz; END IF;
  RETURN public.biz_deadline_at(_kind,_y,_p);
END $$;
REVOKE ALL ON FUNCTION public.biz_period_start_date(text,int,int),public.biz_period_end_date(text,int,int),public.biz_period_department_any(uuid,text,int,int),public.biz_any_milestones(text,text,int,int),public.biz_any_phase(text,text,int,int,timestamptz),public.biz_any_deadline_at(text,int,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_period_start_date(text,int,int),public.biz_period_end_date(text,int,int),public.biz_period_department_any(uuid,text,int,int),public.biz_any_milestones(text,text,int,int),public.biz_any_phase(text,text,int,int,timestamptz),public.biz_any_deadline_at(text,int,int) TO authenticated;

-- ===== Cấu hình chu kỳ đầy đủ (gồm lịch ngày làm việc) =====
CREATE FUNCTION public.biz_report_cycle_config_of(_user uuid, _at date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE dep uuid; sys uuid; r public.biz_report_cycle_configs%ROWTYPE;
BEGIN
  dep:=public.biz_department_at(_user,_at);
  IF dep IS NOT NULL THEN
    SELECT * INTO r FROM public.biz_report_cycle_configs WHERE scope='department' AND department_id=dep AND effective_from<=_at ORDER BY effective_from DESC, created_at DESC LIMIT 1;
    IF r.id IS NOT NULL THEN RETURN jsonb_build_object('cycle',r.cycle,'workdays',r.workdays,'scope','department'); END IF;
    SELECT system_id INTO sys FROM public.biz_departments WHERE id=dep;
    IF sys IS NOT NULL THEN
      SELECT * INTO r FROM public.biz_report_cycle_configs WHERE scope='system' AND system_id=sys AND effective_from<=_at ORDER BY effective_from DESC, created_at DESC LIMIT 1;
      IF r.id IS NOT NULL THEN RETURN jsonb_build_object('cycle',r.cycle,'workdays',r.workdays,'scope','system'); END IF;
    END IF;
  END IF;
  SELECT * INTO r FROM public.biz_report_cycle_configs WHERE scope='block' AND effective_from<=_at ORDER BY effective_from DESC, created_at DESC LIMIT 1;
  IF r.id IS NOT NULL THEN RETURN jsonb_build_object('cycle',r.cycle,'workdays',r.workdays,'scope','block'); END IF;
  RETURN jsonb_build_object('cycle','month','workdays',null,'scope','default');
END $$;
CREATE OR REPLACE FUNCTION public.biz_report_cycle_of(_user uuid, _at date) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(public.biz_report_cycle_config_of(_user,_at)->>'cycle','month') $$;
REVOKE ALL ON FUNCTION public.biz_report_cycle_config_of(uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_report_cycle_config_of(uuid,date) TO authenticated;

-- ===== Phiên bản hồ sơ: phân bổ tuần giao tháng =====
ALTER TABLE public.biz_document_versions ADD COLUMN allocations jsonb;
COMMENT ON COLUMN public.biz_document_versions.allocations IS 'Phân bổ thực tế theo đoạn tháng/năm cho kỳ Tuần giao tháng: [{metric_id,from,to,actual}]; tổng các đoạn = tổng tuần.';

-- ===== biz_document_start: hỗ trợ day/week + chặn tạo hồ sơ lệch chu kỳ được giao =====
CREATE OR REPLACE FUNCTION public.biz_document_start(_kind text,_period_kind text,_year int,_period int,_reason text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; v_id uuid; dep uuid; target uuid; vals jsonb; pstart date; cyc jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') OR NOT private.sig_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
 PERFORM public.biz_period_start(_year,_period_kind,_period); PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 pstart:=public.biz_period_start_date(_period_kind,_year,_period);
 dep:=public.biz_period_department_any(auth.uid(),_period_kind,_year,_period); IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng kinh doanh trong kỳ này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period FOR UPDATE;
 IF d.id IS NULL AND _kind='report' THEN
   cyc:=public.biz_report_cycle_config_of(auth.uid(),pstart);
   IF coalesce(cyc->>'cycle','month')<>_period_kind THEN RAISE EXCEPTION 'Đơn vị của bạn đang áp dụng chu kỳ báo cáo khác cho kỳ này — không tạo hồ sơ trùng.'; END IF;
   IF _period_kind='day' AND cyc->'workdays' IS NOT NULL AND coalesce(cyc->'workdays'->>extract(isodow FROM pstart),'true')='false' THEN RAISE EXCEPTION 'Ngày này không thuộc lịch báo cáo của đơn vị.'; END IF;
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
 IF d.official_version_id IS NOT NULL THEN UPDATE public.biz_document_versions SET url=old.url,notes=old.notes,attachments=old.attachments,target_version_id=old.target_version_id,items=old.items FROM public.biz_document_versions old WHERE old.id=d.official_version_id AND biz_document_versions.id=v_id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v_id,auth.uid(),'created',jsonb_build_object('reason',_reason)); RETURN v_id;
END $$;

-- ===== biz_document_save: thực tế cho mọi kỳ báo cáo (trừ Năm), phân bổ tuần giao tháng, deadline theo cấp kỳ =====
DROP FUNCTION public.biz_document_save(uuid,int,text,text,jsonb,boolean,jsonb);
CREATE FUNCTION public.biz_document_save(_id uuid,_revision int,_url text,_notes text,_actuals jsonb,_submit boolean DEFAULT false,_attachments jsonb DEFAULT NULL,_allocations jsonb DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb; att jsonb; first_official boolean:=false;
  segs jsonb:='[]'; seg jsonb; al jsonb; tot numeric; wk text; cs date; ce date; mend date;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT private.sig_can(auth.uid(),'biz.'||d.kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền sửa tài liệu.'; END IF;
 IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Tài liệu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại.'; END IF;
 IF btrim(coalesce(_url,''))<>'' AND NOT public.biz_docs_url_ok(btrim(_url)) THEN RAISE EXCEPTION 'Link phải là Google Docs HTTPS hợp lệ.'; END IF;
 IF _submit AND d.kind='plan' AND NOT public.biz_docs_url_ok(btrim(coalesce(_url,''))) THEN RAISE EXCEPTION 'Cần link Google Docs hợp lệ trước khi gửi.'; END IF;
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
 IF _submit AND d.first_submitted_at IS NULL THEN UPDATE public.biz_documents SET deadline=public.biz_any_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now() WHERE id=d.id; END IF;
 IF _submit THEN UPDATE public.biz_documents SET last_submitted_at=now() WHERE id=d.id; END IF;
 first_official:=_submit AND d.kind='report' AND d.official_version_id IS NULL;
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),attachments=coalesce(_attachments,v.attachments),items=new_items,allocations=CASE WHEN _allocations IS NOT NULL THEN _allocations WHEN d.period_kind='week' THEN v.allocations ELSE NULL END,status=CASE WHEN _submit AND d.kind='plan' AND v.status='changes' THEN 'resubmitted' WHEN _submit AND first_official THEN 'approved' WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,approved_at=CASE WHEN first_official THEN now() END,approved_by=CASE WHEN first_official THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF first_official THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items,'attachments',coalesce(_attachments,v.attachments),'allocations',_allocations),'target_version_id',v.target_version_id,'resubmitted',_submit AND v.status='changes','official',first_official));
END $$;
REVOKE ALL ON FUNCTION public.biz_document_save(uuid,int,text,text,jsonb,boolean,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_document_save(uuid,int,text,text,jsonb,boolean,jsonb,jsonb) TO authenticated;

-- ===== Guard gắn mục tiêu áp dụng cho mọi kỳ báo cáo (trừ Năm tổng hợp) =====
CREATE OR REPLACE FUNCTION public.biz_document_save_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; target uuid;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF OLD.status='approved' THEN RAISE EXCEPTION 'Phiên bản đã duyệt không được sửa.'; END IF;
 IF d.kind='report' AND d.period_kind IN ('day','week','month','quarter') AND NEW.status IN ('pending','approved') AND OLD.status IN ('draft','changes') AND OLD.target_version_id IS NULL THEN
  SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=d.user_id AND year=d.year;
  IF target IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đã được duyệt sau khi tạo bản nháp. Hãy gắn mục tiêu chính thức trước khi gửi.'; END IF;
 END IF;
 RETURN NEW;
END $$;

-- ===== Nộp bù & quy trình duyệt chấp nhận kỳ Ngày/Tuần =====
ALTER TABLE public.biz_late_requests DROP CONSTRAINT IF EXISTS biz_late_requests_period_kind_check;
ALTER TABLE public.biz_late_requests ADD CONSTRAINT biz_late_requests_period_kind_check CHECK(period_kind IN ('day','week','month','quarter','year')) NOT VALID;
ALTER TABLE public.biz_late_requests VALIDATE CONSTRAINT biz_late_requests_period_kind_check;
ALTER TABLE public.biz_approval_workflows DROP CONSTRAINT biz_approval_workflows_kind_check;
ALTER TABLE public.biz_approval_workflows ADD CONSTRAINT biz_approval_workflows_kind_check CHECK(kind IN ('goal_year','report_day','report_week','report_month','report_quarter','report_year','late_plan_month','late_plan_quarter','late_plan_year','late_report_day','late_report_week','late_report_month','late_report_quarter','late_report_year'));

CREATE OR REPLACE FUNCTION public.biz_late_expire_closed() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n int;
BEGIN
  UPDATE public.biz_late_requests r SET status='expired', decided_at=now()
  WHERE r.status IN ('pending','approved')
    AND public.biz_any_phase(r.kind, r.period_kind, r.year, r.period, now())='closed';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.biz_late_can_act(_request uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT EXISTS(SELECT 1 FROM public.biz_late_requests l JOIN public.biz_approval_runs r ON r.version_id=l.id AND r.kind='late_'||l.kind||'_'||l.period_kind JOIN public.profiles p ON p.id=auth.uid() WHERE l.id=_request AND l.status='pending' AND r.status='pending' AND p.status='Đang hoạt động' AND r.owner_id<>auth.uid() AND public.biz_run_assigned(l.id,true) AND public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at) AND public.biz_any_phase(l.kind,l.period_kind,l.year,l.period,now())='overdue')$$;

CREATE OR REPLACE FUNCTION public.biz_late_request_create(_kind text,_period_kind text,_year int,_period int,_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE id_ uuid;dep uuid;run_ uuid;BEGIN
IF _kind NOT IN ('plan','report') OR NOT public.biz_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.';END IF;
PERFORM public.biz_period_start(_year,_period_kind,_period);IF btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nhập lý do xin nộp bù.';END IF;
PERFORM public.biz_late_expire_closed();IF public.biz_any_phase(_kind,_period_kind,_year,_period,now())<>'overdue' THEN RAISE EXCEPTION 'Kỳ không ở giai đoạn xin nộp bù.';END IF;
IF EXISTS(SELECT 1 FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period AND first_submitted_at IS NOT NULL) THEN RAISE EXCEPTION 'Bạn đã nộp hồ sơ kỳ này.';END IF;
IF _kind='report' AND NOT EXISTS(SELECT 1 FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period)
   AND coalesce(public.biz_report_cycle_config_of(auth.uid(),public.biz_period_start_date(_period_kind,_year,_period))->>'cycle','month')<>_period_kind THEN RAISE EXCEPTION 'Đơn vị của bạn đang áp dụng chu kỳ báo cáo khác cho kỳ này.';END IF;
dep:=public.biz_period_department_any(auth.uid(),_period_kind,_year,_period);IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng trong kỳ này.';END IF;
INSERT INTO public.biz_late_requests(user_id,kind,period_kind,year,period,reason,department_id) VALUES(auth.uid(),_kind,_period_kind,_year,_period,btrim(_reason),dep) RETURNING id INTO id_;
run_:=public.biz_approval_start(id_,'late_'||_kind||'_'||_period_kind,auth.uid(),dep,jsonb_build_object('request_id',id_,'year',_year,'period_kind',_period_kind,'period',_period,'reason',btrim(_reason),'items','[]'::jsonb));IF run_ IS NULL THEN RAISE EXCEPTION 'Chưa cấu hình quy trình duyệt yêu cầu nộp bù.';END IF;RETURN id_;END$$;

CREATE OR REPLACE FUNCTION public.biz_late_request_adopt(_id uuid,_confirmed boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE l public.biz_late_requests;id_ uuid;dep uuid;BEGIN
IF NOT _confirmed OR NOT public.biz_workflow_manage() THEN RAISE EXCEPTION 'Cần quyền quản trị và xác nhận chuyển luồng.';END IF;
SELECT * INTO l FROM public.biz_late_requests WHERE id=_id FOR UPDATE;IF l.id IS NULL OR l.status<>'pending' THEN RAISE EXCEPTION 'Chỉ chuyển yêu cầu đang chờ.';END IF;
SELECT id INTO id_ FROM public.biz_approval_runs WHERE version_id=_id;IF id_ IS NOT NULL THEN RETURN id_;END IF;
IF public.biz_any_phase(l.kind,l.period_kind,l.year,l.period,now())<>'overdue' THEN RAISE EXCEPTION 'Kỳ không còn cho phép nộp bù.';END IF;
dep:=public.biz_period_department_any(l.user_id,l.period_kind,l.year,l.period);id_:=public.biz_approval_start(_id,'late_'||l.kind||'_'||l.period_kind,l.user_id,dep,jsonb_build_object('request_id',_id,'year',l.year,'period_kind',l.period_kind,'period',l.period,'reason',l.reason,'items','[]'::jsonb));IF id_ IS NULL THEN RAISE EXCEPTION 'Chưa cấu hình quy trình nộp bù.';END IF;
UPDATE public.biz_late_requests SET department_id=dep WHERE id=_id;INSERT INTO public.biz_approval_events(run_id,actor_id,action,step,payload) VALUES(id_,auth.uid(),'adopted',0,jsonb_build_object('original_created_at',l.created_at));RETURN id_;END$$;

-- ===== Công việc của tôi: Báo cáo chỉ liệt kê kỳ thuộc chu kỳ được giao =====
CREATE OR REPLACE FUNCTION public.biz_my_work(_kind text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_now timestamptz:=now();
  v_vn date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  result jsonb:='[]'::jsonb;
  pk text; months int; pmax int; cur_idx int; idx int; y int; p int; phase text;
  m jsonb; dep uuid; dep_name text; d public.biz_documents; v_status text; v_url text; v_id uuid; lr public.biz_late_requests;
  seen text[]:= '{}';
  row_key text;
  rec record;
  pks text[]; cyc jsonb; wd jsonb; dd date; wmon date; off int;
  cands jsonb:='[]'; is_cur boolean; is_nxt boolean;
BEGIN
  IF _kind NOT IN ('plan','report') THEN RAISE EXCEPTION 'Loại tài liệu không hợp lệ.'; END IF;
  IF auth.uid() IS NULL OR NOT (private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.'||_kind||'_submit')) THEN RAISE EXCEPTION 'Không có quyền xem công việc của mình.'; END IF;
  IF _kind='plan' THEN pks:=ARRAY['month','quarter','year'];
  ELSE cyc:=public.biz_report_cycle_config_of(auth.uid(),v_vn); pks:=ARRAY[coalesce(cyc->>'cycle','month')]; END IF;
  FOREACH pk IN ARRAY pks LOOP
    IF pk='day' THEN
      wd:=cyc->'workdays';
      FOR off IN -6..1 LOOP
        dd:=v_vn+off;
        IF wd IS NOT NULL AND coalesce(wd->>extract(isodow FROM dd),'true')='false' THEN CONTINUE; END IF;
        IF coalesce(public.biz_report_cycle_config_of(auth.uid(),dd)->>'cycle','month')<>'day' THEN CONTINUE; END IF;
        y:=extract(year FROM dd)::int; p:=(dd-make_date(y,1,1))+1;
        cands:=cands||jsonb_build_object('pk',pk,'y',y,'p',p,'cur',off=0,'nxt',off=1);
      END LOOP;
    ELSIF pk='week' THEN
      wmon:=v_vn-(extract(isodow FROM v_vn)::int-1);
      FOR off IN -2..1 LOOP
        dd:=wmon+off*7;
        IF coalesce(public.biz_report_cycle_config_of(auth.uid(),dd)->>'cycle','month')<>'week' THEN CONTINUE; END IF;
        y:=to_char(dd,'IYYY')::int; p:=to_char(dd,'IW')::int;
        cands:=cands||jsonb_build_object('pk',pk,'y',y,'p',p,'cur',off=0,'nxt',off=1);
      END LOOP;
    ELSE
      months:=CASE pk WHEN 'month' THEN 1 WHEN 'quarter' THEN 3 ELSE 12 END;
      pmax:=12/months;
      cur_idx:=(extract(month FROM v_vn)::int-1)/months;
      FOR idx IN -1..1 LOOP
        y:=extract(year FROM v_vn)::int+floor((cur_idx+idx)::numeric/pmax)::int;
        p:=((cur_idx+idx)%pmax+pmax)%pmax+1;
        IF _kind='report' AND coalesce(public.biz_report_cycle_config_of(auth.uid(),public.biz_period_start_date(pk,y,p))->>'cycle','month')<>pk THEN CONTINUE; END IF;
        cands:=cands||jsonb_build_object('pk',pk,'y',y,'p',p,'cur',idx=0,'nxt',idx=1);
      END LOOP;
    END IF;
  END LOOP;
  FOR rec IN SELECT (c->>'pk') AS pk,(c->>'y')::int AS y,(c->>'p')::int AS p,(c->>'cur')::boolean AS cur,(c->>'nxt')::boolean AS nxt FROM jsonb_array_elements(cands) c LOOP
    phase:=public.biz_any_phase(_kind,rec.pk,rec.y,rec.p,v_now);
    IF phase IN ('none','closed') THEN CONTINUE; END IF;
    IF phase='not_open' AND NOT rec.nxt THEN CONTINUE; END IF;
    SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=rec.pk AND year=rec.y AND period=rec.p;
    dep:=coalesce(public.biz_period_department_any(auth.uid(),rec.pk,rec.y,rec.p),d.department_id);
    IF dep IS NULL THEN CONTINUE; END IF;
    v_id:=NULL; v_status:=NULL; v_url:=NULL;
    IF d.id IS NOT NULL THEN
      SELECT v.id,v.status,v.url INTO v_id,v_status,v_url FROM public.biz_document_versions v WHERE v.document_id=d.id ORDER BY v.version DESC LIMIT 1;
    END IF;
    SELECT * INTO lr FROM public.biz_late_requests WHERE user_id=auth.uid() AND kind=_kind AND period_kind=rec.pk AND year=rec.y AND period=rec.p ORDER BY created_at DESC LIMIT 1;
    IF phase='open' AND d.first_submitted_at IS NOT NULL AND v_status IS DISTINCT FROM 'changes' AND NOT rec.cur THEN CONTINUE; END IF;
    IF phase='overdue' AND d.first_submitted_at IS NOT NULL AND v_status IS DISTINCT FROM 'changes' THEN CONTINUE; END IF;
    m:=public.biz_any_milestones(_kind,rec.pk,rec.y,rec.p);
    SELECT name INTO dep_name FROM public.biz_departments WHERE id=dep;
    row_key:=rec.pk||'-'||rec.y||'-'||rec.p;
    seen:=seen||row_key;
    result:=result||jsonb_build_object('period_kind',rec.pk,'year',rec.y,'period',rec.p,'phase',phase,'open_at',m->>'open','due_at',m->>'due','late_close_at',m->>'late_close','period_start',public.biz_period_start_date(rec.pk,rec.y,rec.p),'period_end',public.biz_period_end_date(rec.pk,rec.y,rec.p),'department_id',dep,'department_name',dep_name,'document_id',d.id,'first_submitted_at',d.first_submitted_at,'last_submitted_at',d.last_submitted_at,'late_submitted',coalesce(d.late_submitted,false),'version_id',v_id,'version_status',v_status,'version_url',v_url,'late_status',lr.status,'late_request_id',lr.id);
  END LOOP;
  -- Gộp mọi kỳ cũ còn việc dở: đang bị yêu cầu chỉnh sửa hoặc có yêu cầu nộp bù đang chờ/đã duyệt mà chưa nộp.
  FOR rec IN
    SELECT dd.year,dd.period,dd.period_kind,dd.id AS doc_id,dd.department_id AS doc_dept,dd.first_submitted_at,dd.last_submitted_at,dd.late_submitted,vv.id AS ver_id,vv.status AS ver_status,vv.url AS ver_url,ll.status AS lr_status,ll.id AS lr_id FROM public.biz_documents dd
    LEFT JOIN LATERAL (SELECT v.id,v.status,v.url FROM public.biz_document_versions v WHERE v.document_id=dd.id ORDER BY v.version DESC LIMIT 1) vv ON true
    LEFT JOIN LATERAL (SELECT l.status,l.id FROM public.biz_late_requests l WHERE l.user_id=dd.user_id AND l.kind=dd.kind AND l.period_kind=dd.period_kind AND l.year=dd.year AND l.period=dd.period ORDER BY l.created_at DESC LIMIT 1) ll ON true
    WHERE dd.user_id=auth.uid() AND dd.kind=_kind AND (vv.status='changes' OR (ll.status IN ('pending','approved') AND dd.first_submitted_at IS NULL))
  LOOP
    row_key:=rec.period_kind||'-'||rec.year||'-'||rec.period;
    IF row_key=ANY(seen) THEN CONTINUE; END IF;
    phase:=public.biz_any_phase(_kind,rec.period_kind,rec.year,rec.period,v_now);
    IF phase='closed' AND rec.ver_status IS DISTINCT FROM 'changes' THEN CONTINUE; END IF;
    m:=public.biz_any_milestones(_kind,rec.period_kind,rec.year,rec.period);
    dep:=coalesce(public.biz_period_department_any(auth.uid(),rec.period_kind,rec.year,rec.period),rec.doc_dept);
    SELECT name INTO dep_name FROM public.biz_departments WHERE id=dep;
    result:=result||jsonb_build_object('period_kind',rec.period_kind,'year',rec.year,'period',rec.period,'phase',phase,'open_at',m->>'open','due_at',m->>'due','late_close_at',m->>'late_close','period_start',public.biz_period_start_date(rec.period_kind,rec.year,rec.period),'period_end',public.biz_period_end_date(rec.period_kind,rec.year,rec.period),'department_id',dep,'department_name',dep_name,'document_id',rec.doc_id,'first_submitted_at',rec.first_submitted_at,'last_submitted_at',rec.last_submitted_at,'late_submitted',coalesce(rec.late_submitted,false),'version_id',rec.ver_id,'version_status',rec.ver_status,'version_url',rec.ver_url,'late_status',rec.lr_status,'late_request_id',rec.lr_id);
  END LOOP;
  RETURN jsonb_build_object('rows',result,'server_now',v_now);
END $$;