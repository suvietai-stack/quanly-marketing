-- 0241: Sửa xung đột tên biến trong k3_soft_delete (biến a/g trùng bí danh bảng) — đổi tên biến khai báo.
CREATE OR REPLACE FUNCTION public.k3_soft_delete(_kind text, _id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); stamp timestamptz:=now(); vg public.k3_goals; va public.k3_actions;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF _kind='goal' THEN
    SELECT * INTO vg FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF vg.id IS NULL OR vg.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Không tìm thấy công việc hoặc công việc đã nằm trong Thùng rác.'; END IF;
    IF NOT (vg.user_id=uid OR public.biz_admin(uid)) THEN RAISE EXCEPTION 'Chỉ người chủ trì hoặc Admin được xóa công việc này.'; END IF;
    IF private.k3_goal_has_official(vg.id) THEN RAISE EXCEPTION 'Công việc đã có kết quả chốt sổ. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    IF private.k3_goal_has_results(vg.id) THEN RAISE EXCEPTION 'Công việc đã có kết quả KPI được ghi nhận. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    UPDATE public.k3_tasks t SET deleted_at=stamp, deleted_by=uid, updated_at=now()
      FROM public.k3_actions a WHERE t.action_id=a.id AND a.goal_id=vg.id AND t.deleted_at IS NULL
      AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    UPDATE public.k3_actions SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE goal_id=vg.id AND deleted_at IS NULL;
    UPDATE public.k3_goals SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE id=vg.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(vg.user_id,vg.id,uid,'goal_soft_delete',jsonb_build_object('member_ids',(SELECT coalesce(jsonb_agg(user_id),'[]'::jsonb) FROM public.k3_goal_members WHERE goal_id=vg.id AND status IN ('invited','accepted'))));
    RETURN jsonb_build_object('ok',true,'kind','goal','kf_count',(SELECT count(*) FROM public.k3_actions x WHERE x.goal_id=vg.id AND x.deleted_at=stamp));
  ELSIF _kind='action' THEN
    SELECT * INTO va FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF va.id IS NULL OR va.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Không tìm thấy KF hoặc KF đã nằm trong Thùng rác.'; END IF;
    SELECT * INTO vg FROM public.k3_goals WHERE id=va.goal_id;
    IF vg.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Công việc chứa KF này đang nằm trong Thùng rác.'; END IF;
    IF NOT private.k3_goal_manage_ok(uid, va.goal_id) THEN
      IF NOT (va.assignee_id=uid AND NOT EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=va.id) AND NOT EXISTS(SELECT 1 FROM public.k3_tasks x WHERE x.action_id=va.id AND x.user_id<>uid AND x.deleted_at IS NULL)) THEN
        RAISE EXCEPTION 'Chỉ người chủ trì hoặc người phụ trách KF chưa có phối hợp được xóa KF này.';
      END IF;
    END IF;
    IF private.k3_action_has_official(va.id) THEN RAISE EXCEPTION 'KF đã có kết quả chốt sổ. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    IF private.k3_action_has_results(va.id) THEN RAISE EXCEPTION 'KF đã có kết quả KPI được ghi nhận. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    IF vg.status<>'draft' AND NOT EXISTS(SELECT 1 FROM public.k3_actions x WHERE x.goal_id=vg.id AND x.id<>va.id AND x.deleted_at IS NULL AND x.status<>'cancelled') THEN RAISE EXCEPTION 'Không được xóa KF duy nhất của công việc đang thực hiện. Hãy xóa toàn bộ công việc.'; END IF;
    UPDATE public.k3_tasks t SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE t.action_id=va.id AND t.deleted_at IS NULL
      AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    UPDATE public.k3_actions SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE id=va.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(va.user_id,va.goal_id,va.id,uid,'action_soft_delete','{}'::jsonb);
    RETURN jsonb_build_object('ok',true,'kind','action');
  ELSIF _kind='task' THEN
    PERFORM public.k3_task_delete(_id);
    RETURN jsonb_build_object('ok',true,'kind','task');
  ELSE RAISE EXCEPTION 'Loại dữ liệu không hợp lệ.'; END IF;
END$fn$;
REVOKE ALL ON FUNCTION public.k3_soft_delete(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_soft_delete(text,uuid) TO authenticated;