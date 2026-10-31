-- Preserve save workflow, deadline gates and historical timestamps; normalize plan validation message only.
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('public.biz_document_save(uuid,integer,text,text,jsonb,boolean,jsonb,jsonb)'::regprocedure) INTO f;
 IF position('Cần link Google Docs hợp lệ trước khi gửi.' in f)=0 THEN RAISE EXCEPTION 'Expected plan URL validation not found'; END IF;
 f:=replace(f,'Cần link Google Docs hợp lệ trước khi gửi.','Vui lòng nhập link Google Docs kế hoạch chính thức trước khi nộp.');
 EXECUTE f;
 SELECT pg_get_functiondef('public.biz_documents_read(text,text,integer,integer)'::regprocedure) INTO f;
 IF position('WHEN d.id IS NULL OR NOT EXISTS' in f)=0 THEN RAISE EXCEPTION 'Expected view status expression not found'; END IF;
 f:=replace(f,'WHEN d.id IS NULL OR NOT EXISTS','WHEN (_kind=''plan'' AND NOT EXISTS(SELECT 1 FROM public.biz_document_versions sv WHERE sv.document_id=d.id AND sv.submitted_at IS NOT NULL AND public.biz_docs_url_ok(sv.url))) OR d.id IS NULL OR NOT EXISTS');
 EXECUTE f;
END $patch$;
CREATE OR REPLACE FUNCTION public.biz_document_open(_version_id uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_version_id;
 IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy phiên bản tài liệu.'; END IF;
 IF NOT public.biz_document_access(v.document_id) THEN RAISE EXCEPTION 'Không có quyền xem tài liệu này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id;
 IF d.kind='plan' AND (v.submitted_at IS NULL OR NOT public.biz_docs_url_ok(v.url)) THEN RAISE EXCEPTION 'Kế hoạch chưa có phiên bản Google Docs chính thức đã nộp.'; END IF;
 IF v.url IS NULL OR btrim(v.url)='' THEN RAISE EXCEPTION 'Phiên bản này chưa có liên kết tài liệu.'; END IF;
 INSERT INTO public.biz_document_views(version_id,viewer_id) VALUES(v.id,auth.uid()) ON CONFLICT(version_id,viewer_id) DO UPDATE SET latest_opened_at=now();
 RETURN v.url;
END $$;
REVOKE ALL ON FUNCTION public.biz_document_open(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_document_open(uuid) TO authenticated;