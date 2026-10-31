CREATE TABLE public.biz_document_views(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),version_id uuid NOT NULL REFERENCES public.biz_document_versions(id) ON DELETE CASCADE,viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,first_opened_at timestamptz NOT NULL DEFAULT now(),latest_opened_at timestamptz NOT NULL DEFAULT now(),UNIQUE(version_id,viewer_id));
GRANT SELECT ON public.biz_document_views TO authenticated;
GRANT ALL ON public.biz_document_views TO service_role;
ALTER TABLE public.biz_document_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY biz_doc_views_own ON public.biz_document_views FOR SELECT TO authenticated USING(viewer_id=auth.uid());
CREATE FUNCTION public.biz_document_open(_version_id uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_version_id;
 IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy phiên bản tài liệu.'; END IF;
 IF NOT public.biz_document_access(v.document_id) THEN RAISE EXCEPTION 'Không có quyền xem tài liệu này.'; END IF;
 IF v.url IS NULL OR btrim(v.url)='' THEN RAISE EXCEPTION 'Phiên bản này chưa có liên kết tài liệu.'; END IF;
 INSERT INTO public.biz_document_views(version_id,viewer_id) VALUES(v.id,auth.uid()) ON CONFLICT(version_id,viewer_id) DO UPDATE SET latest_opened_at=now();
 RETURN v.url;
END $$;
REVOKE ALL ON FUNCTION public.biz_document_open(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_document_open(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.biz_documents_read(_kind text,_period_kind text,_year int,_period int) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') THEN RAISE EXCEPTION 'Loại tài liệu không hợp lệ.'; END IF; PERFORM public.biz_period_start(_year,_period_kind,_period);
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'employee_name',p.full_name,'department_id',coalesce(d.department_id,dep.id),'department_name',coalesce(d.department_name,dep.name),'can_review',public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind,true),'my_view',CASE WHEN d.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.biz_document_versions x WHERE x.document_id=d.id) THEN 'none' WHEN EXISTS(SELECT 1 FROM public.biz_document_views w JOIN public.biz_document_versions lv ON lv.id=w.version_id WHERE w.viewer_id=auth.uid() AND lv.document_id=d.id AND lv.version=(SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id)) THEN 'opened' WHEN EXISTS(SELECT 1 FROM public.biz_document_views w JOIN public.biz_document_versions ov ON ov.id=w.version_id WHERE w.viewer_id=auth.uid() AND ov.document_id=d.id) THEN 'new_version' ELSE 'unopened' END,'document',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d)||jsonb_build_object('deadline',CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) END,'versions',(SELECT jsonb_agg(to_jsonb(v) ORDER BY version) FROM public.biz_document_versions v WHERE document_id=d.id)) END,'deadline',CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) END,'server_now',now()) ORDER BY p.full_name),'[]') INTO result
 FROM public.profiles p JOIN public.biz_departments dep ON dep.id=public.biz_period_department(p.id,_year,_period_kind,_period) LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind=_kind AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period
 WHERE public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind);
 RETURN result;
END $$;
CREATE FUNCTION public.biz_plans_unviewed(_year int,_period_kind text,_period int) RETURNS int LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE count_ int;
BEGIN
 PERFORM public.biz_period_start(_year,_period_kind,_period);
 SELECT count(*) INTO count_ FROM public.profiles p JOIN public.biz_departments dep ON dep.id=public.biz_period_department(p.id,_year,_period_kind,_period) JOIN public.biz_documents d ON d.user_id=p.id AND d.kind='plan' AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period
 WHERE p.id<>auth.uid() AND public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),'plan') AND EXISTS(SELECT 1 FROM public.biz_document_versions v WHERE v.document_id=d.id AND v.submitted_at IS NOT NULL) AND NOT EXISTS(SELECT 1 FROM public.biz_document_views w JOIN public.biz_document_versions lv ON lv.id=w.version_id WHERE w.viewer_id=auth.uid() AND lv.document_id=d.id AND lv.version=(SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id));
 RETURN count_;
END $$;
REVOKE ALL ON FUNCTION public.biz_plans_unviewed(int,text,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_plans_unviewed(int,text,int) TO authenticated;