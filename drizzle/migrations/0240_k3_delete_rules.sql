-- 0240: Chuẩn hóa quy tắc Xóa 3K — chưa có kết quả/lịch sử bảo vệ thì được xóa, đã có kết quả KPI hoặc chốt sổ thì không; RPC k3_deletable cho giao diện ẩn/hiện đúng quy tắc backend.

-- Đã có kết quả KPI thực tế = tồn tại bản ghi kết quả (chưa xóa mềm) gắn KG/KF.
CREATE FUNCTION private.k3_goal_has_results(_goal uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT EXISTS(SELECT 1 FROM public.k3_kpi_results r WHERE r.goal_id=_goal AND r.deleted_at IS NULL)
$fn$;
CREATE FUNCTION private.k3_action_has_results(_action uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT EXISTS(SELECT 1 FROM public.k3_kpi_results r WHERE r.action_id=_action AND r.deleted_at IS NULL)
$fn$;
REVOKE ALL ON FUNCTION private.k3_goal_has_results(uuid), private.k3_action_has_results(uuid) FROM PUBLIC, anon, authenticated;

-- Xóa mềm thống nhất: chặn khi đã có kết quả KPI hoặc chốt sổ; KF duy nhất của KG đang hoạt động không xóa lẻ.
CREATE OR REPLACE FUNCTION public.k3_soft_delete(_kind text, _id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); stamp timestamptz:=now(); g public.k3_goals; a public.k3_actions;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF _kind='goal' THEN
    SELECT * INTO g FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF g.id IS NULL OR g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Không tìm thấy công việc hoặc công việc đã nằm trong Thùng rác.'; END IF;
    IF NOT (g.user_id=uid OR public.biz_admin(uid)) THEN RAISE EXCEPTION 'Chỉ người chủ trì hoặc Admin được xóa công việc này.'; END IF;
    IF private.k3_goal_has_official(g.id) THEN RAISE EXCEPTION 'Công việc đã có kết quả chốt sổ. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    IF private.k3_goal_has_results(g.id) THEN RAISE EXCEPTION 'Công việc đã có kết quả KPI được ghi nhận. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    UPDATE public.k3_tasks t SET deleted_at=stamp, deleted_by=uid, updated_at=now()
      FROM public.k3_actions a WHERE t.action_id=a.id AND a.goal_id=g.id AND t.deleted_at IS NULL
      AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    UPDATE public.k3_actions SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE goal_id=g.id AND deleted_at IS NULL;
    UPDATE public.k3_goals SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE id=g.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,uid,'goal_soft_delete',jsonb_build_object('member_ids',(SELECT coalesce(jsonb_agg(user_id),'[]'::jsonb) FROM public.k3_goal_members WHERE goal_id=g.id AND status IN ('invited','accepted'))));
    RETURN jsonb_build_object('ok',true,'kind','goal','kf_count',(SELECT count(*) FROM public.k3_actions x WHERE x.goal_id=g.id AND x.deleted_at=stamp));
  ELSIF _kind='action' THEN
    SELECT * INTO a FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF a.id IS NULL OR a.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Không tìm thấy KF hoặc KF đã nằm trong Thùng rác.'; END IF;
    SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
    IF g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Công việc chứa KF này đang nằm trong Thùng rác.'; END IF;
    IF NOT private.k3_goal_manage_ok(uid, a.goal_id) THEN
      IF NOT (a.assignee_id=uid AND NOT EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id) AND NOT EXISTS(SELECT 1 FROM public.k3_tasks x WHERE x.action_id=a.id AND x.user_id<>uid AND x.deleted_at IS NULL)) THEN
        RAISE EXCEPTION 'Chỉ người chủ trì hoặc người phụ trách KF chưa có phối hợp được xóa KF này.';
      END IF;
    END IF;
    IF private.k3_action_has_official(a.id) THEN RAISE EXCEPTION 'KF đã có kết quả chốt sổ. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    IF private.k3_action_has_results(a.id) THEN RAISE EXCEPTION 'KF đã có kết quả KPI được ghi nhận. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
    IF g.status<>'draft' AND NOT EXISTS(SELECT 1 FROM public.k3_actions x WHERE x.goal_id=g.id AND x.id<>a.id AND x.deleted_at IS NULL AND x.status<>'cancelled') THEN RAISE EXCEPTION 'Không được xóa KF duy nhất của công việc đang thực hiện. Hãy xóa toàn bộ công việc.'; END IF;
    UPDATE public.k3_tasks t SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE t.action_id=a.id AND t.deleted_at IS NULL
      AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    UPDATE public.k3_actions SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE id=a.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(a.user_id,a.goal_id,a.id,uid,'action_soft_delete','{}'::jsonb);
    RETURN jsonb_build_object('ok',true,'kind','action');
  ELSIF _kind='task' THEN
    PERFORM public.k3_task_delete(_id);
    RETURN jsonb_build_object('ok',true,'kind','task');
  ELSE RAISE EXCEPTION 'Loại dữ liệu không hợp lệ.'; END IF;
END$fn$;

-- Xóa công việc ngày: chặn ngày đã chốt sổ và công việc đã có kết quả KPI thực tế.
CREATE OR REPLACE FUNCTION public.k3_task_delete(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$DECLARE t public.k3_tasks; BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text)); SELECT * INTO t FROM public.k3_tasks WHERE id=_id FOR UPDATE;
 IF t.id IS NULL OR (t.user_id<>auth.uid() AND NOT public.biz_admin(auth.uid())) THEN RAISE EXCEPTION 'Bạn không được xóa công việc của người khác.'; END IF;
 PERFORM private.k3_write_guard(t.work_date);
 IF t.deleted_at IS NOT NULL THEN RETURN true; END IF;
 IF EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL) THEN RAISE EXCEPTION 'Ngày đã chốt sổ. Không thể xóa — hãy điều chỉnh qua cơ chế xác nhận lại.'; END IF;
 IF t.kpi_actual IS NOT NULL THEN RAISE EXCEPTION 'Công việc đã có kết quả KPI được ghi nhận. Không thể xóa — dữ liệu thực hiện được bảo toàn.'; END IF;
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'delete',jsonb_build_object('before',to_jsonb(t)));
 UPDATE public.k3_tasks SET deleted_at=now(),deleted_by=auth.uid(),updated_at=now(),updated_by=auth.uid() WHERE id=t.id; RETURN true; END$fn$;

-- Kiểm tra điều kiện xóa cho giao diện: cùng quy tắc với k3_soft_delete/k3_task_delete, chỉ đọc.
CREATE FUNCTION public.k3_deletable(_kind text, _id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); g public.k3_goals; a public.k3_actions; t public.k3_tasks;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','Chưa đăng nhập.'); END IF;
  IF _kind='goal' THEN
    SELECT * INTO g FROM public.k3_goals WHERE id=_id AND deleted_at IS NULL;
    IF g.id IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','Không tìm thấy công việc.'); END IF;
    IF NOT (g.user_id=uid OR public.biz_admin(uid)) THEN RETURN jsonb_build_object('ok',false,'reason','Chỉ người chủ trì hoặc Admin được xóa.'); END IF;
    IF private.k3_goal_has_official(g.id) THEN RETURN jsonb_build_object('ok',false,'reason','Đã có kết quả chốt sổ.'); END IF;
    IF private.k3_goal_has_results(g.id) THEN RETURN jsonb_build_object('ok',false,'reason','Đã có kết quả KPI được ghi nhận.'); END IF;
    RETURN jsonb_build_object('ok',true);
  ELSIF _kind='action' THEN
    SELECT * INTO a FROM public.k3_actions WHERE id=_id AND deleted_at IS NULL;
    IF a.id IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','Không tìm thấy KF.'); END IF;
    SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
    IF g.deleted_at IS NOT NULL THEN RETURN jsonb_build_object('ok',false,'reason','Công việc chứa KF này đang ở Thùng rác.'); END IF;
    IF NOT (private.k3_goal_manage_ok(uid,a.goal_id) OR (a.assignee_id=uid AND NOT EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id) AND NOT EXISTS(SELECT 1 FROM public.k3_tasks x WHERE x.action_id=a.id AND x.user_id<>uid AND x.deleted_at IS NULL))) THEN RETURN jsonb_build_object('ok',false,'reason','Bạn không có quyền xóa KF này.'); END IF;
    IF private.k3_action_has_official(a.id) THEN RETURN jsonb_build_object('ok',false,'reason','Đã có kết quả chốt sổ.'); END IF;
    IF private.k3_action_has_results(a.id) THEN RETURN jsonb_build_object('ok',false,'reason','Đã có kết quả KPI được ghi nhận.'); END IF;
    IF g.status<>'draft' AND NOT EXISTS(SELECT 1 FROM public.k3_actions x WHERE x.goal_id=g.id AND x.id<>a.id AND x.deleted_at IS NULL AND x.status<>'cancelled') THEN RETURN jsonb_build_object('ok',false,'reason','KF duy nhất của công việc đang thực hiện — hãy xóa toàn bộ công việc.'); END IF;
    RETURN jsonb_build_object('ok',true);
  ELSIF _kind='task' THEN
    SELECT * INTO t FROM public.k3_tasks WHERE id=_id AND deleted_at IS NULL;
    IF t.id IS NULL THEN RETURN jsonb_build_object('ok',false,'reason','Không tìm thấy công việc.'); END IF;
    IF t.user_id<>uid AND NOT public.biz_admin(uid) THEN RETURN jsonb_build_object('ok',false,'reason','Bạn không được xóa công việc của người khác.'); END IF;
    IF EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL) THEN RETURN jsonb_build_object('ok',false,'reason','Ngày đã chốt sổ.'); END IF;
    IF t.kpi_actual IS NOT NULL THEN RETURN jsonb_build_object('ok',false,'reason','Đã có kết quả KPI được ghi nhận.'); END IF;
    RETURN jsonb_build_object('ok',true);
  ELSE RETURN jsonb_build_object('ok',false,'reason','Loại dữ liệu không hợp lệ.'); END IF;
END$fn$;

REVOKE ALL ON FUNCTION public.k3_soft_delete(text,uuid), public.k3_task_delete(uuid), public.k3_deletable(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_soft_delete(text,uuid), public.k3_task_delete(uuid), public.k3_deletable(text,uuid) TO authenticated;