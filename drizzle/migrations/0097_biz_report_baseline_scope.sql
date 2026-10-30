CREATE FUNCTION public.biz_report_target_version(_user uuid,_year int,_period_kind text,_period int,_mode text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT coalesce((SELECT v.target_version_id FROM public.biz_documents d JOIN public.biz_document_versions v ON v.id=CASE WHEN _mode='provisional' THEN coalesce((SELECT id FROM public.biz_document_versions WHERE document_id=d.id AND status='pending' ORDER BY version DESC LIMIT 1),d.official_version_id) ELSE d.official_version_id END WHERE d.user_id=_user AND d.kind='report' AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period),(SELECT official_version_id FROM public.biz_annual_goals WHERE user_id=_user AND year=_year)) $$;
CREATE FUNCTION public.biz_document_target_integrity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF NEW.target_version_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.biz_goal_versions v JOIN public.biz_annual_goals g ON g.id=v.goal_id WHERE v.id=NEW.target_version_id AND v.status='approved' AND g.user_id=d.user_id AND g.year=d.year) THEN RAISE EXCEPTION 'Phiên bản mục tiêu không thuộc nhân viên/năm hoặc chưa duyệt.';END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER biz_document_target_integrity BEFORE INSERT OR UPDATE ON public.biz_document_versions FOR EACH ROW EXECUTE FUNCTION public.biz_document_target_integrity();
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.biz_documents,public.biz_document_versions,public.biz_document_events FROM authenticated,anon;
REVOKE ALL ON FUNCTION public.biz_report_target_version(uuid,int,text,int,text) FROM PUBLIC,anon;