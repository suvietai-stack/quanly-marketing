-- Xin nộp bù + chặn nộp theo pha deadline ở server.
-- Kế hoạch/Báo cáo: not_open/closed chặn nộp lần đầu; quá hạn cần yêu cầu nộp bù đã duyệt (dùng một lần); Super Admin can thiệp có nhật ký.

ALTER TABLE public.biz_documents ADD COLUMN late_submitted boolean NOT NULL DEFAULT false;

ALTER TABLE public.notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc','att_witness','att_new','att_result','att_changed','att_submitted','content_assigned','content_review','content_revise','content_approved','content_published','content_remind','order_new','order_assigned','order_taken','order_review','order_revise','order_approved','order_delivered','order_remind','oq_new','oq_accepted','oq_info','oq_answered','oq_published','oq_done','oq_reask','oq_assigned','ot_reschedule','ot_reschedule_result','fin_pending','fin_needs_info','biz_submitted','biz_approved','biz_returned','biz_deadline','biz_late_request','biz_late_approved','biz_late_rejected','biz_late_expired']::text[]));

CREATE TABLE public.biz_late_requests(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  kind text NOT NULL CHECK(kind IN ('plan','report')),
  period_kind text NOT NULL CHECK(period_kind IN ('month','quarter','year')),
  year int NOT NULL CHECK(year BETWEEN 2000 AND 2200),
  period int NOT NULL CHECK(period >= 1),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','used','expired')),
  decided_by uuid REFERENCES public.profiles(id),
  decided_at timestamptz,
  decision_comment text,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX biz_late_one_active ON public.biz_late_requests(user_id,kind,period_kind,year,period) WHERE status IN ('pending','approved');
GRANT SELECT ON public.biz_late_requests TO authenticated;
GRANT ALL ON public.biz_late_requests TO service_role;
ALTER TABLE public.biz_late_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Late requests read own or scoped" ON public.biz_late_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'biz.'||kind||'_approve') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.view_dept'));

-- Tự hết hiệu lực các yêu cầu chưa xử lý khi kỳ đã đóng.
CREATE OR REPLACE FUNCTION public.biz_late_expire_closed() RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n int;
BEGIN
  UPDATE public.biz_late_requests r SET status='expired', decided_at=now()
  WHERE r.status IN ('pending','approved')
    AND public.biz_deadline_phase(r.kind||'_'||r.period_kind, r.year, r.period, now())='closed';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- Gửi yêu cầu nộp bù: chỉ khi đang quá hạn, chưa nộp lần đầu, lý do bắt buộc, một yêu cầu hoạt động / nghĩa vụ.
CREATE OR REPLACE FUNCTION public.biz_late_request_create(_kind text, _period_kind text, _year int, _period int, _reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_phase text; dep uuid; recipient uuid; label text;
BEGIN
  IF _kind NOT IN ('plan','report') OR NOT private.sig_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
  IF btrim(coalesce(_reason,'')) = '' THEN RAISE EXCEPTION 'Cần nhập lý do xin nộp bù.'; END IF;
  PERFORM public.biz_late_expire_closed();
  v_phase:=public.biz_deadline_phase(_kind||'_'||_period_kind,_year,_period,now());
  IF v_phase='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở, chưa cần xin nộp bù.'; END IF;
  IF v_phase='open' THEN RAISE EXCEPTION 'Kỳ nộp đang mở, bạn có thể nộp trực tiếp.'; END IF;
  IF v_phase='closed' THEN RAISE EXCEPTION 'Kỳ nộp đã đóng, không thể xin nộp bù.'; END IF;
  IF v_phase='none' THEN RAISE EXCEPTION 'Kỳ này chưa cấu hình hạn nộp.'; END IF;
  IF EXISTS(SELECT 1 FROM public.biz_documents d WHERE d.user_id=auth.uid() AND d.kind=_kind AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period AND d.first_submitted_at IS NOT NULL) THEN RAISE EXCEPTION 'Bạn đã nộp hồ sơ kỳ này.'; END IF;
  INSERT INTO public.biz_late_requests(user_id,kind,period_kind,year,period,reason)
  VALUES(auth.uid(),_kind,_period_kind,_year,_period,btrim(_reason)) RETURNING id INTO v_id;
  dep:=public.biz_period_department(auth.uid(),_year,_period_kind,_period);
  label:=CASE _kind WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END;
  FOR recipient IN SELECT p.id FROM public.profiles p WHERE p.status='Đang hoạt động' AND p.id<>auth.uid() AND private.sig_can(p.id,'biz.'||_kind||'_approve') AND public.biz_scope_ok(p.id,auth.uid(),dep) LOOP
    INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status)
    VALUES(recipient,'biz_late_request','biz_late:'||v_id||':'||recipient,jsonb_build_object('message',label||' có yêu cầu xin nộp bù cần xử lý.','request_id',v_id,'kind',_kind,'period_kind',_period_kind,'year',_year,'period',_period,'user_id',auth.uid()),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
  END LOOP;
  RETURN v_id;
END $$;

-- Duyệt / từ chối yêu cầu nộp bù: theo quyền duyệt + phạm vi, không tự duyệt; kỳ đã đóng thì hết hiệu lực.
CREATE OR REPLACE FUNCTION public.biz_late_request_decide(_id uuid, _approve boolean, _comment text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.biz_late_requests; dep uuid; label text;
BEGIN
  PERFORM public.biz_late_expire_closed();
  SELECT * INTO r FROM public.biz_late_requests WHERE id=_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy yêu cầu.'; END IF;
  IF r.status='expired' THEN RAISE EXCEPTION 'Yêu cầu hết hiệu lực do kỳ nộp đã đóng.'; END IF;
  IF r.status<>'pending' THEN RAISE EXCEPTION 'Yêu cầu đã được xử lý.'; END IF;
  SELECT department_id INTO dep FROM public.biz_department_members WHERE user_id=r.user_id AND effective_to IS NULL ORDER BY effective_from DESC LIMIT 1;
  IF NOT public.is_super_admin(auth.uid()) AND NOT public.biz_doc_access(r.user_id,dep,r.kind,true) THEN RAISE EXCEPTION 'Không có quyền duyệt hoặc không được tự duyệt.'; END IF;
  IF r.user_id=auth.uid() THEN RAISE EXCEPTION 'Không được tự duyệt yêu cầu của mình.'; END IF;
  IF NOT _approve AND btrim(coalesce(_comment,''))='' THEN RAISE EXCEPTION 'Cần nhập lý do từ chối.'; END IF;
  UPDATE public.biz_late_requests SET status=CASE WHEN _approve THEN 'approved' ELSE 'rejected' END, decided_by=auth.uid(), decided_at=now(), decision_comment=nullif(btrim(coalesce(_comment,'')),'') WHERE id=r.id;
  label:=CASE r.kind WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END;
  INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status)
  VALUES(r.user_id,CASE WHEN _approve THEN 'biz_late_approved' ELSE 'biz_late_rejected' END,'biz_late_decide:'||r.id::text,jsonb_build_object('message',label||': yêu cầu nộp bù '||CASE WHEN _approve THEN 'đã được duyệt, bạn có thể nộp bù.' ELSE 'bị từ chối'||CASE WHEN _comment IS NOT NULL THEN ': '||left(_comment,200) ELSE '' END||'.' END,'request_id',r.id,'kind',r.kind,'period_kind',r.period_kind,'year',r.year,'period',r.period),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
END $$;

-- Đọc yêu cầu nộp bù: cá nhân + phạm vi quản lý, kèm pha kỳ và mốc thời gian.
CREATE OR REPLACE FUNCTION public.biz_late_requests_read(_kind text DEFAULT NULL, _period_kind text DEFAULT NULL, _year int DEFAULT NULL, _period int DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
  PERFORM public.biz_late_expire_closed();
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id',r.id,'user_id',r.user_id,'employee_name',p.full_name,'kind',r.kind,'period_kind',r.period_kind,'year',r.year,'period',r.period,
    'reason',r.reason,'status',r.status,'decided_by',r.decided_by,'decider_name',dp.full_name,'decided_at',r.decided_at,'decision_comment',r.decision_comment,
    'created_at',r.created_at,'used_at',r.used_at,
    'phase',public.biz_deadline_phase(r.kind||'_'||r.period_kind,r.year,r.period,now()),
    'milestones',public.biz_deadline_milestones(r.kind||'_'||r.period_kind,r.year,r.period),
    'can_decide',r.status='pending' AND r.user_id<>auth.uid() AND (public.is_super_admin(auth.uid()) OR public.biz_doc_access(r.user_id,(SELECT department_id FROM public.biz_department_members m WHERE m.user_id=r.user_id AND m.effective_to IS NULL ORDER BY m.effective_from DESC LIMIT 1),r.kind,true))
  ) ORDER BY r.created_at DESC),'[]') INTO result
  FROM public.biz_late_requests r JOIN public.profiles p ON p.id=r.user_id LEFT JOIN public.profiles dp ON dp.id=r.decided_by
  WHERE (_kind IS NULL OR r.kind=_kind) AND (_period_kind IS NULL OR r.period_kind=_period_kind) AND (_year IS NULL OR r.year=_year) AND (_period IS NULL OR r.period=_period)
    AND (r.user_id=auth.uid() OR public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'biz.'||r.kind||'_approve') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.view_dept'));
  RETURN jsonb_build_object('requests',result,'server_now',now());
END $$;

-- Chặn tạo hồ sơ mới khi chưa mở nộp hoặc đã đóng kỳ (điều chỉnh hồ sơ đã nộp không bị chặn).
CREATE OR REPLACE FUNCTION public.biz_document_start(_kind text,_period_kind text,_year int,_period int,_reason text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; v_id uuid; dep uuid; target uuid; vals jsonb; v_phase text;
BEGIN
 IF _kind NOT IN ('plan','report') OR NOT private.sig_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
 PERFORM public.biz_period_start(_year,_period_kind,_period); PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 dep:=public.biz_period_department(auth.uid(),_year,_period_kind,_period); IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng kinh doanh trong kỳ này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period FOR UPDATE;
 IF d.id IS NULL THEN
  v_phase:=public.biz_deadline_phase(_kind||'_'||_period_kind,_year,_period,now());
  IF v_phase='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở. Vui lòng quay lại khi đến ngày mở nộp.'; END IF;
  IF v_phase='closed' AND NOT public.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Kỳ nộp đã đóng, không thể tạo hồ sơ mới.'; END IF;
  INSERT INTO public.biz_documents(user_id,department_id,department_name,kind,period_kind,year,period,deadline) SELECT auth.uid(),id,name,_kind,_period_kind,_year,_period,public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) FROM public.biz_departments WHERE id=dep RETURNING * INTO d;
 END IF;
 SELECT id INTO v_id FROM public.biz_document_versions WHERE document_id=d.id AND status<>'approved'; IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF d.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year;
 vals:='[]';
 IF _kind='report' AND _period_kind='month' AND target IS NOT NULL THEN SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',months[_period]::text,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target; END IF;
 INSERT INTO public.biz_document_versions(document_id,version,reason,target_version_id,items) VALUES(d.id,coalesce((SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id),0)+1,nullif(btrim(_reason),''),CASE WHEN _kind='report' THEN target END,vals) RETURNING id INTO v_id;
 IF d.official_version_id IS NOT NULL THEN UPDATE public.biz_document_versions SET url=old.url,notes=old.notes,attachments=old.attachments,target_version_id=old.target_version_id,items=old.items FROM public.biz_document_versions old WHERE old.id=d.official_version_id AND biz_document_versions.id=v_id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v_id,auth.uid(),'created',jsonb_build_object('reason',_reason)); RETURN v_id;
END $$;

-- Chặn nộp lần đầu theo pha; quá hạn cần yêu cầu nộp bù đã duyệt (đánh dấu used nguyên tử); ghi nhận Nộp muộn.
CREATE OR REPLACE FUNCTION public.biz_document_save(_id uuid,_revision int,_url text,_notes text,_actuals jsonb,_submit boolean DEFAULT false,_attachments jsonb DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb; att jsonb; first_official boolean:=false; v_phase text; lr public.biz_late_requests; v_late boolean:=false; v_intervention boolean:=false;
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
 IF d.kind='report' AND d.period_kind='month' THEN
  IF jsonb_typeof(_actuals) IS DISTINCT FROM 'array' OR jsonb_array_length(_actuals)<>jsonb_array_length(v.items) OR (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_actuals) x)<>jsonb_array_length(_actuals) THEN RAISE EXCEPTION 'Danh sách KR không hợp lệ.'; END IF;
  FOR i IN SELECT * FROM jsonb_array_elements(v.items) LOOP
   SELECT x->'actual' INTO a FROM jsonb_array_elements(_actuals) x WHERE x->>'metric_id'=i->>'metric_id';
   IF a IS NULL THEN RAISE EXCEPTION 'Thiếu KR.'; END IF;
   IF a<>'null'::jsonb AND (a#>>'{}') !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Thực tế phải là số nguyên không âm, tối đa 20 chữ số.'; END IF;
   IF _submit AND a='null'::jsonb THEN RAISE EXCEPTION 'Cần nhập kết quả từng KR, giá trị 0 hợp lệ.'; END IF;
   new_items:=new_items||jsonb_build_array(i||jsonb_build_object('actual',a));
  END LOOP;
 ELSE
  IF coalesce(_actuals,'[]'::jsonb)<>'[]'::jsonb THEN RAISE EXCEPTION 'Không nhập lại thực tế Quý/Năm hoặc số liệu kế hoạch.'; END IF;
  new_items:=v.items;
 END IF;
 IF _submit AND d.first_submitted_at IS NULL THEN
  v_phase:=public.biz_deadline_phase(d.kind||'_'||d.period_kind,d.year,d.period,now());
  IF v_phase='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở. Vui lòng quay lại khi đến ngày mở nộp.'; END IF;
  IF v_phase='closed' AND NOT public.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Kỳ nộp đã đóng. Liên hệ quản trị nếu cần xử lý đặc biệt.'; END IF;
  IF v_phase='overdue' THEN
   SELECT * INTO lr FROM public.biz_late_requests WHERE user_id=auth.uid() AND kind=d.kind AND period_kind=d.period_kind AND year=d.year AND period=d.period AND status='approved' FOR UPDATE;
   IF lr.id IS NULL AND NOT public.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Đã quá hạn nộp trực tiếp. Hãy gửi yêu cầu nộp bù và chờ phê duyệt.'; END IF;
   IF lr.id IS NOT NULL THEN UPDATE public.biz_late_requests SET status='used', used_at=now() WHERE id=lr.id; END IF;
   v_late:=true;
  END IF;
  IF v_phase='closed' THEN v_late:=true; v_intervention:=true; END IF;
  UPDATE public.biz_documents SET deadline=public.biz_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now(),late_submitted=v_late WHERE id=d.id;
 END IF;
 IF _submit THEN UPDATE public.biz_documents SET last_submitted_at=now() WHERE id=d.id; END IF;
 first_official:=_submit AND d.kind='report' AND d.official_version_id IS NULL;
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),attachments=coalesce(_attachments,v.attachments),items=new_items,status=CASE WHEN _submit AND d.kind='plan' AND v.status='changes' THEN 'resubmitted' WHEN _submit AND first_official THEN 'approved' WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,approved_at=CASE WHEN first_official THEN now() END,approved_by=CASE WHEN first_official THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF first_official THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items,'attachments',coalesce(_attachments,v.attachments)),'target_version_id',v.target_version_id,'resubmitted',_submit AND v.status='changes','official',first_official,'late',v_late,'intervention',v_intervention));
END $$;

REVOKE ALL ON FUNCTION public.biz_late_expire_closed(),public.biz_late_request_create(text,text,int,int,text),public.biz_late_request_decide(uuid,boolean,text),public.biz_late_requests_read(text,text,int,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_late_request_create(text,text,int,int,text),public.biz_late_request_decide(uuid,boolean,text),public.biz_late_requests_read(text,text,int,int) TO authenticated;