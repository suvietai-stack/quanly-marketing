CREATE OR REPLACE FUNCTION public.biz_goal_draft_delete(_version_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_goal_versions; g public.biz_annual_goals;
BEGIN
 SELECT * INTO v FROM public.biz_goal_versions WHERE id=_version_id FOR UPDATE;
 IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy bản nháp.'; END IF;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=v.goal_id FOR UPDATE;
 IF NOT ((g.user_id=auth.uid() AND private.sig_can(auth.uid(),'biz.goal_submit')) OR public.is_super_admin(auth.uid())) THEN RAISE EXCEPTION 'Không có quyền xóa bản nháp này.'; END IF;
 IF v.status<>'draft' OR v.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'Chỉ xóa được bản nháp chưa gửi duyệt.'; END IF;
 IF g.official_version_id=v.id THEN RAISE EXCEPTION 'Không thể xóa phiên bản chính thức.'; END IF;
 IF EXISTS(SELECT 1 FROM public.biz_goal_events WHERE version_id=v.id AND action IN ('submitted','approved','returned')) THEN RAISE EXCEPTION 'Bản nháp đã từng trình duyệt, không thể xóa cứng.'; END IF;
 IF EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=v.id) THEN RAISE EXCEPTION 'Bản nháp đang nằm trong quy trình duyệt.'; END IF;
 DELETE FROM public.biz_goal_events WHERE version_id=v.id;
 DELETE FROM public.biz_goal_items WHERE version_id=v.id;
 DELETE FROM public.biz_goal_versions WHERE id=v.id;
 IF g.official_version_id IS NULL AND NOT EXISTS(SELECT 1 FROM public.biz_goal_versions WHERE goal_id=g.id) THEN
  DELETE FROM public.biz_annual_goals WHERE id=g.id;
 END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.biz_goal_draft_delete(uuid) TO authenticated;