-- Kế hoạch giữ nguyên yêu cầu link Google Docs khi nộp; chỉ Báo cáo được nới tài liệu tùy chọn.
CREATE OR REPLACE FUNCTION public.biz_document_save(_id uuid,_revision int,_url text,_notes text,_actuals jsonb,_submit boolean DEFAULT false,_attachments jsonb DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb; att jsonb; first_official boolean:=false;
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