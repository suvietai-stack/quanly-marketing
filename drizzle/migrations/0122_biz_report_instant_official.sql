-- Báo cáo KR: nộp lần đầu ghi nhận chính thức ngay (không qua phê duyệt); chỉ yêu cầu điều chỉnh mới vào luồng phê duyệt; tài liệu đính kèm tùy chọn.
ALTER TABLE public.biz_document_versions ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]';
COMMENT ON COLUMN public.biz_document_versions.url IS 'DEPRECATED: replaced by optional attachments list; kept for history.';

CREATE OR REPLACE FUNCTION public.biz_document_start(_kind text,_period_kind text,_year int,_period int,_reason text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; v_id uuid; dep uuid; target uuid; vals jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') OR NOT private.sig_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
 PERFORM public.biz_period_start(_year,_period_kind,_period); PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 dep:=public.biz_period_department(auth.uid(),_year,_period_kind,_period); IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng kinh doanh trong kỳ này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period FOR UPDATE;
 IF d.id IS NULL THEN INSERT INTO public.biz_documents(user_id,department_id,department_name,kind,period_kind,year,period,deadline) SELECT auth.uid(),id,name,_kind,_period_kind,_year,_period,public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) FROM public.biz_departments WHERE id=dep RETURNING * INTO d; END IF;
 SELECT id INTO v_id FROM public.biz_document_versions WHERE document_id=d.id AND status<>'approved'; IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF d.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year;
 vals:='[]';
 IF _kind='report' AND _period_kind='month' AND target IS NOT NULL THEN SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',months[_period]::text,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target; END IF;
 INSERT INTO public.biz_document_versions(document_id,version,reason,target_version_id,items) VALUES(d.id,coalesce((SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id),0)+1,nullif(btrim(_reason),''),CASE WHEN _kind='report' THEN target END,vals) RETURNING id INTO v_id;
 IF d.official_version_id IS NOT NULL THEN UPDATE public.biz_document_versions SET url=old.url,notes=old.notes,attachments=old.attachments,target_version_id=old.target_version_id,items=old.items FROM public.biz_document_versions old WHERE old.id=d.official_version_id AND biz_document_versions.id=v_id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v_id,auth.uid(),'created',jsonb_build_object('reason',_reason)); RETURN v_id;
END $$;

DROP FUNCTION public.biz_document_save(uuid,int,text,text,jsonb,boolean);
CREATE FUNCTION public.biz_document_save(_id uuid,_revision int,_url text,_notes text,_actuals jsonb,_submit boolean DEFAULT false,_attachments jsonb DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb; att jsonb; first_official boolean:=false;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT private.sig_can(auth.uid(),'biz.'||d.kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền sửa tài liệu.'; END IF;
 IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Tài liệu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại.'; END IF;
 IF btrim(coalesce(_url,''))<>'' AND NOT public.biz_docs_url_ok(btrim(_url)) THEN RAISE EXCEPTION 'Link phải là Google Docs HTTPS hợp lệ.'; END IF;
 IF _attachments IS NOT NULL THEN
  IF jsonb_typeof(_attachments) IS DISTINCT FROM 'array' OR jsonb_array_length(_attachments)>10 THEN RAISE EXCEPTION 'Tài liệu đính kèm phải là danh sách tối đa 10 mục.'; END IF;
  FOR att IN SELECT * FROM jsonb_array_elements(_attachments) LOOP
   IF btrim(coalesce(att->>'name',''))='' OR length(att->>'name')>200 THEN RAISE EXCEPTION 'Mỗi tài liệu đính kèm cần tên, tối đa 200 ký tự.'; END IF;
   IF coalesce(att->>'url','')!~'^https://[^[:space:]]{1,2000}$' THEN RAISE EXCEPTION 'Liên kết tài liệu đính kèm phải là HTTPS hợp lệ.'; END IF;
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
 IF _submit AND d.first_submitted_at IS NULL THEN UPDATE public.biz_documents SET deadline=public.biz_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now() WHERE id=d.id; END IF;
 IF _submit THEN UPDATE public.biz_documents SET last_submitted_at=now() WHERE id=d.id; END IF;
 first_official:=_submit AND d.kind='report' AND d.official_version_id IS NULL;
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),attachments=coalesce(_attachments,v.attachments),items=new_items,status=CASE WHEN _submit AND d.kind='plan' AND v.status='changes' THEN 'resubmitted' WHEN _submit AND first_official THEN 'approved' WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,approved_at=CASE WHEN first_official THEN now() END,approved_by=CASE WHEN first_official THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF first_official THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items,'attachments',coalesce(_attachments,v.attachments)),'target_version_id',v.target_version_id,'resubmitted',_submit AND v.status='changes','official',first_official));
END $$;

CREATE OR REPLACE FUNCTION public.biz_approval_submit_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE g public.biz_annual_goals; d public.biz_documents; c jsonb; prev jsonb;BEGIN
 IF NEW.status='pending' AND OLD.status IN ('draft','changes') THEN
  IF TG_TABLE_NAME='biz_goal_versions' THEN SELECT * INTO g FROM public.biz_annual_goals WHERE id=NEW.goal_id; SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT x::text FROM unnest(i.months) x))),'[]') INTO c FROM public.biz_goal_items i WHERE i.version_id=NEW.id; PERFORM public.biz_approval_start(NEW.id,'goal_year',g.user_id,g.department_id,jsonb_build_object('year',g.year,'version',NEW.version,'items',c));
  ELSE SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id; IF d.kind='report' AND d.official_version_id IS NOT NULL AND d.official_version_id<>NEW.id THEN SELECT items INTO prev FROM public.biz_document_versions WHERE id=d.official_version_id; PERFORM public.biz_approval_start(NEW.id,'report_'||d.period_kind,d.user_id,d.department_id,jsonb_build_object('year',d.year,'period',d.period,'period_kind',d.period_kind,'url',NEW.url,'attachments',NEW.attachments,'items',NEW.items,'previous_items',coalesce(prev,'[]'::jsonb),'reason',NEW.reason,'version',NEW.version)); END IF; END IF;
 END IF; RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.biz_document_notify() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents;recipient uuid;label text;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=NEW.version_id) THEN RETURN NEW; END IF;
 IF NEW.action NOT IN ('submitted','approved','returned') THEN RETURN NEW;END IF;
 IF NEW.action='submitted' AND d.kind='report' AND d.official_version_id=NEW.version_id THEN RETURN NEW; END IF;
 label:=CASE d.kind WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END;
 FOR recipient IN SELECT p.id FROM public.profiles p WHERE p.status='Đang hoạt động' AND CASE WHEN NEW.action='submitted' THEN p.id<>d.user_id AND (private.sig_can(p.id,'biz.'||d.kind||'_approve') OR (d.kind='plan' AND private.sig_can(p.id,'biz.plan_request_revision'))) AND public.biz_scope_ok(p.id,d.user_id,d.department_id) ELSE p.id=d.user_id AND (private.sig_can(p.id,'biz.'||d.kind||'_submit') OR private.sig_can(p.id,'biz.view_own')) END LOOP
 INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status) VALUES(recipient,'biz_'||NEW.action,'biz:'||NEW.id||':'||recipient,jsonb_build_object('message',label||CASE WHEN d.kind='plan' AND NEW.action='submitted' THEN CASE WHEN (NEW.payload->>'resubmitted')::boolean THEN ' đã được nộp lại.' ELSE ' đã được nộp.' END WHEN d.kind='plan' AND NEW.action='returned' THEN ' cần chỉnh sửa: '||left(coalesce(NEW.payload->>'comment',''),200) WHEN NEW.action='submitted' THEN ' đề nghị điều chỉnh, đang chờ duyệt.' WHEN NEW.action='approved' THEN ' đã được duyệt.' ELSE ' cần chỉnh sửa.' END,'document_id',d.id,'kind',d.kind,'period_kind',d.period_kind,'year',d.year,'period',d.period,'user_id',d.user_id),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
 END LOOP;RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.biz_approvals_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE r jsonb; legacy jsonb;BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('employee_name',p.full_name,'can_act',a.status='pending' AND public.biz_run_assigned(a.version_id,true) AND private.sig_can(auth.uid(),CASE WHEN a.kind='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END),'source_revision',CASE WHEN a.kind='goal_year' THEN (SELECT revision FROM public.biz_goal_versions WHERE id=a.version_id) ELSE (SELECT revision FROM public.biz_document_versions WHERE id=a.version_id) END,'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('actor_name',ep.full_name) ORDER BY e.created_at),'[]') FROM public.biz_approval_events e JOIN public.profiles ep ON ep.id=e.actor_id WHERE e.run_id=a.id)) ORDER BY a.submitted_at DESC),'[]') INTO r FROM public.biz_approval_runs a JOIN public.profiles p ON p.id=a.owner_id WHERE public.biz_run_can_read(a.id);
 SELECT coalesce(jsonb_agg(x ORDER BY x->>'submitted_at' DESC),'[]') INTO legacy FROM (
 SELECT jsonb_build_object('id',v.id,'version_id',v.id,'kind','goal_year','owner_id',g.user_id,'employee_name',p.full_name,'department_id',g.department_id,'org_snapshot',jsonb_build_object('department_name',g.department_name,'workflow_name','Quy trình cũ'),'content_snapshot',jsonb_build_object('year',g.year,'items',(SELECT jsonb_agg(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT z::text FROM unnest(i.months) z))) FROM public.biz_goal_items i WHERE i.version_id=v.id)),'steps','[]'::jsonb,'current_step',0,'status',v.status,'submitted_at',v.submitted_at,'step_started_at',v.submitted_at,'source_revision',v.revision,'can_act',public.biz_goal_can_review(g.user_id,g.department_id),'legacy',true,'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('actor_name',ep.full_name) ORDER BY e.created_at),'[]') FROM public.biz_goal_events e JOIN public.profiles ep ON ep.id=e.actor_id WHERE e.version_id=v.id)) x FROM public.biz_goal_versions v JOIN public.biz_annual_goals g ON g.id=v.goal_id JOIN public.profiles p ON p.id=g.user_id WHERE v.status='pending' AND public.biz_goal_can_read(g.id) AND NOT EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=v.id)
 UNION ALL
 SELECT jsonb_build_object('id',v.id,'version_id',v.id,'kind','report_'||d.period_kind,'owner_id',d.user_id,'employee_name',p.full_name,'department_id',d.department_id,'org_snapshot',jsonb_build_object('department_name',d.department_name,'workflow_name','Quy trình cũ'),'content_snapshot',jsonb_build_object('year',d.year,'period',d.period,'period_kind',d.period_kind,'url',v.url,'attachments',v.attachments,'items',v.items,'previous_items',(SELECT coalesce(ov.items,'[]'::jsonb) FROM public.biz_document_versions ov WHERE ov.id=d.official_version_id),'reason',v.reason),'steps','[]'::jsonb,'current_step',0,'status',v.status,'submitted_at',v.submitted_at,'step_started_at',v.submitted_at,'source_revision',v.revision,'can_act',public.biz_doc_access(d.user_id,d.department_id,'report',true),'legacy',true,'events','[]'::jsonb) FROM public.biz_document_versions v JOIN public.biz_documents d ON d.id=v.document_id JOIN public.profiles p ON p.id=d.user_id WHERE d.kind='report' AND v.status='pending' AND public.biz_doc_access(d.user_id,d.department_id,'report') AND NOT EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=v.id)) q;
 RETURN jsonb_build_object('runs',r||legacy,'server_now',now(),'has_assigned',EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE status='pending' AND public.biz_run_assigned(version_id,true)));
END $$;

REVOKE ALL ON FUNCTION public.biz_document_save(uuid,int,text,text,jsonb,boolean,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_document_save(uuid,int,text,text,jsonb,boolean,jsonb) TO authenticated;