-- Plans: submit = recorded (no approval); leaders request revisions; resubmission keeps first-submission deadline.
ALTER TABLE public.biz_document_versions DROP CONSTRAINT IF EXISTS biz_document_versions_status_check;
ALTER TABLE public.biz_document_versions ADD CONSTRAINT biz_document_versions_status_check CHECK (status = ANY (ARRAY['draft','pending','changes','approved','resubmitted']));
UPDATE public.app_roles SET permissions=array_append(permissions,'biz.plan_request_revision') WHERE 'biz.plan_approve'=ANY(permissions) AND NOT 'biz.plan_request_revision'=ANY(permissions);
UPDATE public.user_permission_overrides SET permissions=array_append(permissions,'biz.plan_request_revision') WHERE 'biz.plan_approve'=ANY(permissions) AND NOT 'biz.plan_request_revision'=ANY(permissions);
CREATE OR REPLACE FUNCTION public.biz_doc_access(_user uuid, _dept uuid, _kind text, _review boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT CASE WHEN _kind NOT IN ('plan','report') THEN false WHEN _review THEN _user<>auth.uid() AND (CASE WHEN _kind='plan' THEN private.sig_can(auth.uid(),'biz.plan_request_revision') OR private.sig_can(auth.uid(),'biz.plan_approve') ELSE private.sig_can(auth.uid(),'biz.'||_kind||'_approve') END) AND (private.sig_can(auth.uid(),'biz.view_all') OR EXISTS(SELECT 1 FROM public.biz_department_members WHERE user_id=auth.uid() AND department_id=_dept AND is_manager AND ended_at IS NULL)) ELSE (_user=auth.uid() AND (private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.'||_kind||'_submit'))) OR private.sig_can(auth.uid(),'biz.view_all') OR EXISTS(SELECT 1 FROM public.biz_department_members WHERE user_id=auth.uid() AND department_id=_dept AND is_manager AND ended_at IS NULL AND (private.sig_can(auth.uid(),'biz.view_dept') OR (CASE WHEN _kind='plan' THEN private.sig_can(auth.uid(),'biz.plan_request_revision') OR private.sig_can(auth.uid(),'biz.plan_approve') ELSE private.sig_can(auth.uid(),'biz.'||_kind||'_approve') END))) END $function$;

CREATE OR REPLACE FUNCTION public.biz_document_decide(_id uuid, _revision integer, _approve boolean, _comment text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_document_versions; d public.biz_documents;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF NOT public.biz_doc_access(d.user_id,d.department_id,d.kind,true) THEN RAISE EXCEPTION 'Không có quyền duyệt hoặc không được tự duyệt.'; END IF;
 IF d.kind='plan' AND _approve THEN RAISE EXCEPTION 'Kế hoạch không cần phê duyệt. Chỉ có thể yêu cầu chỉnh sửa.'; END IF;
 IF v.status NOT IN ('pending','resubmitted') OR (d.kind<>'plan' AND v.status<>'pending') OR v.revision<>_revision THEN RAISE EXCEPTION 'Tài liệu đã thay đổi trạng thái. Hãy tải lại.'; END IF;
 IF NOT _approve AND btrim(coalesce(_comment,''))='' THEN RAISE EXCEPTION 'Cần nhập nội dung yêu cầu chỉnh sửa.'; END IF;
 UPDATE public.biz_document_versions SET status=CASE WHEN _approve THEN 'approved' ELSE 'changes' END,review_comment=nullif(btrim(_comment),''),approved_at=CASE WHEN _approve THEN now() END,approved_by=CASE WHEN _approve THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF _approve THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _approve THEN 'approved' ELSE 'returned' END,jsonb_build_object('comment',_comment,'items',v.items,'target_version_id',v.target_version_id));
END $function$;

CREATE OR REPLACE FUNCTION public.biz_document_save(_id uuid, _revision integer, _url text, _notes text, _actuals jsonb, _submit boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT private.sig_can(auth.uid(),'biz.'||d.kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền sửa tài liệu.'; END IF;
 IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Tài liệu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại.'; END IF;
 IF btrim(coalesce(_url,''))<>'' AND NOT public.biz_docs_url_ok(btrim(_url)) THEN RAISE EXCEPTION 'Link phải là Google Docs HTTPS hợp lệ.'; END IF;
 IF _submit AND NOT public.biz_docs_url_ok(btrim(coalesce(_url,''))) THEN RAISE EXCEPTION 'Cần link Google Docs hợp lệ trước khi gửi.'; END IF;
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
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),items=new_items,status=CASE WHEN _submit AND d.kind='plan' AND v.status='changes' THEN 'resubmitted' WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,revision=revision+1 WHERE id=v.id;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items),'target_version_id',v.target_version_id,'resubmitted',_submit AND v.status='changes'));
END $function$;

CREATE OR REPLACE FUNCTION public.biz_document_notify()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE d public.biz_documents;recipient uuid;label text;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF NEW.action NOT IN ('submitted','approved','returned') THEN RETURN NEW;END IF;
 label:=CASE d.kind WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END;
 FOR recipient IN SELECT p.id FROM public.profiles p WHERE CASE WHEN NEW.action='submitted' THEN p.id<>d.user_id AND (private.sig_can(p.id,'biz.'||d.kind||'_approve') OR (d.kind='plan' AND private.sig_can(p.id,'biz.plan_request_revision'))) AND (private.sig_can(p.id,'biz.view_all') OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=p.id AND m.department_id=d.department_id AND m.is_manager AND m.ended_at IS NULL)) ELSE p.id=d.user_id AND (private.sig_can(p.id,'biz.'||d.kind||'_submit') OR private.sig_can(p.id,'biz.view_own')) END LOOP
  INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status) VALUES(recipient,'biz_'||NEW.action,'biz:'||NEW.id||':'||recipient,jsonb_build_object('message',label||CASE WHEN d.kind='plan' AND NEW.action='submitted' THEN CASE WHEN (NEW.payload->>'resubmitted')::boolean THEN ' đã được nộp lại.' ELSE ' đã được nộp.' END WHEN d.kind='plan' AND NEW.action='returned' THEN ' cần chỉnh sửa: '||left(coalesce(NEW.payload->>'comment',''),200) WHEN NEW.action='submitted' THEN ' đang chờ duyệt.' WHEN NEW.action='approved' THEN ' đã được duyệt.' ELSE ' cần chỉnh sửa.' END,'document_id',d.id,'kind',d.kind,'period_kind',d.period_kind,'year',d.year,'period',d.period,'user_id',d.user_id),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
 END LOOP;RETURN NEW;
END $function$;