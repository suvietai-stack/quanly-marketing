-- 0197: Xóa mềm KG/KF/kết quả ngày vào Thùng lưu trữ 15 ngày, khôi phục và tự động xóa vĩnh viễn; bảo vệ dữ liệu đã chốt sổ.

ALTER TABLE public.k3_goals ADD COLUMN deleted_at timestamptz, ADD COLUMN deleted_by uuid;
ALTER TABLE public.k3_actions ADD COLUMN deleted_at timestamptz, ADD COLUMN deleted_by uuid;
ALTER TABLE public.k3_tasks ADD COLUMN deleted_by uuid;
CREATE INDEX k3_goals_trash ON public.k3_goals(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX k3_actions_trash ON public.k3_actions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX k3_tasks_trash ON public.k3_tasks(deleted_at) WHERE deleted_at IS NOT NULL;

-- Đã có kết quả chính thức = có công việc gắn KG/KF trên ngày đã chốt sổ (kể cả bản ghi đã xóa mềm).
CREATE FUNCTION private.k3_goal_has_official(_goal uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT EXISTS(SELECT 1 FROM public.k3_tasks t JOIN public.k3_actions a ON a.id=t.action_id JOIN public.k3_days d ON d.id=t.day_id WHERE a.goal_id=_goal AND d.summarized_at IS NOT NULL)
$fn$;
CREATE FUNCTION private.k3_action_has_official(_action uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT EXISTS(SELECT 1 FROM public.k3_tasks t JOIN public.k3_days d ON d.id=t.day_id WHERE t.action_id=_action AND d.summarized_at IS NOT NULL)
$fn$;
REVOKE ALL ON FUNCTION private.k3_goal_has_official(uuid), private.k3_action_has_official(uuid) FROM PUBLIC, anon, authenticated;

-- Xóa mềm: goal chỉ chủ trì/Admin; action chủ trì KG hoặc người phụ trách chưa có phối hợp; task qua k3_task_delete (có guard chốt sổ).
CREATE FUNCTION public.k3_soft_delete(_kind text, _id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); stamp timestamptz:=now(); g public.k3_goals; a public.k3_actions;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF _kind='goal' THEN
    SELECT * INTO g FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF g.id IS NULL OR g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Không tìm thấy mục tiêu hoặc mục tiêu đã nằm trong Thùng lưu trữ.'; END IF;
    IF NOT (g.user_id=uid OR public.biz_admin(uid)) THEN RAISE EXCEPTION 'Chỉ người chủ trì hoặc Admin được xóa mục tiêu này.'; END IF;
    IF private.k3_goal_has_official(g.id) THEN RAISE EXCEPTION 'Mục tiêu đã có kết quả chốt sổ. Không thể xóa — hãy dùng Kết thúc/Hủy để bảo toàn lịch sử.'; END IF;
    UPDATE public.k3_tasks t SET deleted_at=stamp, deleted_by=uid, updated_at=now()
      FROM public.k3_actions a WHERE t.action_id=a.id AND a.goal_id=g.id AND t.deleted_at IS NULL
      AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    UPDATE public.k3_actions SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE goal_id=g.id AND deleted_at IS NULL;
    UPDATE public.k3_goals SET deleted_at=stamp, deleted_by=uid, updated_at=now() WHERE id=g.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,uid,'goal_soft_delete',jsonb_build_object('member_ids',(SELECT coalesce(jsonb_agg(user_id),'[]'::jsonb) FROM public.k3_goal_members WHERE goal_id=g.id AND status IN ('invited','accepted'))));
    RETURN jsonb_build_object('ok',true,'kind','goal','kf_count',(SELECT count(*) FROM public.k3_actions x WHERE x.goal_id=g.id AND x.deleted_at=stamp));
  ELSIF _kind='action' THEN
    SELECT * INTO a FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF a.id IS NULL OR a.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Không tìm thấy KF hoặc KF đã nằm trong Thùng lưu trữ.'; END IF;
    SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
    IF g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'KG chứa KF này đang nằm trong Thùng lưu trữ.'; END IF;
    IF NOT private.k3_goal_manage_ok(uid, a.goal_id) THEN
      IF NOT (a.assignee_id=uid AND NOT EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id) AND NOT EXISTS(SELECT 1 FROM public.k3_tasks x WHERE x.action_id=a.id AND x.user_id<>uid AND x.deleted_at IS NULL)) THEN
        RAISE EXCEPTION 'Chỉ người chủ trì KG hoặc người phụ trách KF chưa có phối hợp được xóa KF này.';
      END IF;
    END IF;
    IF private.k3_action_has_official(a.id) THEN RAISE EXCEPTION 'KF đã có kết quả chốt sổ. Không thể xóa — hãy dùng Kết thúc/Hủy để bảo toàn lịch sử.'; END IF;
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

-- Khôi phục: kiểm tra quan hệ cha/con và ranh giới chốt sổ trước khi khôi phục.
CREATE FUNCTION public.k3_restore(_kind text, _id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); g public.k3_goals; a public.k3_actions; t public.k3_tasks; stamp timestamptz;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF _kind='goal' THEN
    SELECT * INTO g FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF g.id IS NULL OR g.deleted_at IS NULL THEN RAISE EXCEPTION 'Mục tiêu không nằm trong Thùng lưu trữ.'; END IF;
    IF NOT (g.user_id=uid OR public.biz_admin(uid)) THEN RAISE EXCEPTION 'Chỉ người chủ trì hoặc Admin được khôi phục mục tiêu này.'; END IF;
    stamp:=g.deleted_at;
    UPDATE public.k3_goals SET deleted_at=NULL, deleted_by=NULL, updated_at=now() WHERE id=g.id;
    UPDATE public.k3_actions SET deleted_at=NULL, deleted_by=NULL, updated_at=now() WHERE goal_id=g.id AND deleted_at=stamp AND deleted_by IS NOT DISTINCT FROM g.deleted_by;
    UPDATE public.k3_tasks t SET deleted_at=NULL, deleted_by=NULL, updated_at=now() FROM public.k3_actions a WHERE t.action_id=a.id AND a.goal_id=g.id AND t.deleted_at=stamp AND t.deleted_by IS NOT DISTINCT FROM g.deleted_by AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,uid,'goal_restore','{}'::jsonb);
    RETURN jsonb_build_object('ok',true);
  ELSIF _kind='action' THEN
    SELECT * INTO a FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF a.id IS NULL OR a.deleted_at IS NULL THEN RAISE EXCEPTION 'KF không nằm trong Thùng lưu trữ.'; END IF;
    SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
    IF g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Hãy khôi phục KG chứa KF này trước.'; END IF;
    IF NOT (private.k3_goal_manage_ok(uid,a.goal_id) OR (a.assignee_id=uid AND a.deleted_by=uid)) THEN RAISE EXCEPTION 'Bạn không có quyền khôi phục KF này.'; END IF;
    stamp:=a.deleted_at;
    UPDATE public.k3_actions SET deleted_at=NULL, deleted_by=NULL, updated_at=now() WHERE id=a.id;
    UPDATE public.k3_tasks t SET deleted_at=NULL, deleted_by=NULL, updated_at=now() WHERE t.action_id=a.id AND t.deleted_at=stamp AND t.deleted_by IS NOT DISTINCT FROM a.deleted_by AND NOT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL);
    INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(a.user_id,a.goal_id,a.id,uid,'action_restore','{}'::jsonb);
    RETURN jsonb_build_object('ok',true);
  ELSIF _kind='task' THEN
    SELECT * INTO t FROM public.k3_tasks WHERE id=_id FOR UPDATE;
    IF t.id IS NULL OR t.deleted_at IS NULL THEN RAISE EXCEPTION 'Bản ghi không nằm trong Thùng lưu trữ.'; END IF;
    IF NOT (t.user_id=uid OR public.biz_admin(uid)) THEN RAISE EXCEPTION 'Bạn không có quyền khôi phục bản ghi này.'; END IF;
    IF EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL) THEN RAISE EXCEPTION 'Ngày đã chốt sổ. Không thể khôi phục trực tiếp — hãy điều chỉnh qua cơ chế xác nhận lại.'; END IF;
    IF t.action_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.id=t.action_id AND a.deleted_at IS NOT NULL) THEN RAISE EXCEPTION 'Hãy khôi phục KF chứa công việc này trước.'; END IF;
    UPDATE public.k3_tasks SET deleted_at=NULL, deleted_by=NULL, updated_at=now(), updated_by=uid WHERE id=t.id;
    INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,uid,'restore','{}'::jsonb);
    RETURN jsonb_build_object('ok',true);
  ELSE RAISE EXCEPTION 'Loại dữ liệu không hợp lệ.'; END IF;
END$fn$;

-- Thùng lưu trữ: Admin thấy tất cả; nhân viên thấy dữ liệu của mình; quản lý thấy theo phạm vi tổ chức.
CREATE FUNCTION public.k3_trash_list(_kind text DEFAULT 'all') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); adm boolean; scp boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  adm:=public.biz_admin(uid); scp:=public.k3_can(uid,'k3.view_scope');
  RETURN coalesce((SELECT jsonb_agg(row ORDER BY row->>'deleted_at' DESC) FROM (
    SELECT jsonb_build_object(
      'kind','goal','id',g.id,'name',g.name,'owner_id',g.user_id,'owner_name',po.full_name,
      'deleted_by',g.deleted_by,'deleted_by_name',pd.full_name,'deleted_at',g.deleted_at,
      'purge_at',g.deleted_at+interval '15 days',
      'seconds_left',greatest(0,extract(epoch FROM (g.deleted_at+interval '15 days'-now()))::bigint),
      'kf_count',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.deleted_at IS NOT NULL),
      'restorable',(g.user_id=uid OR adm)
    ) row
    FROM public.k3_goals g JOIN public.profiles po ON po.id=g.user_id LEFT JOIN public.profiles pd ON pd.id=g.deleted_by
    WHERE _kind IN ('all','goal') AND g.deleted_at IS NOT NULL
      AND (adm OR g.user_id=uid OR (scp AND public.biz_scope_ok(uid,g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))))
    UNION ALL
    SELECT jsonb_build_object(
      'kind','action','id',a.id,'name',a.name,'goal_id',a.goal_id,'goal_name',g.name,'owner_id',a.user_id,'owner_name',po.full_name,
      'deleted_by',a.deleted_by,'deleted_by_name',pd.full_name,'deleted_at',a.deleted_at,
      'purge_at',a.deleted_at+interval '15 days',
      'seconds_left',greatest(0,extract(epoch FROM (a.deleted_at+interval '15 days'-now()))::bigint),
      'parent_deleted',(g.deleted_at IS NOT NULL),
      'restorable',(g.deleted_at IS NULL AND (private.k3_goal_manage_ok(uid,a.goal_id) OR (a.assignee_id=uid AND a.deleted_by=uid)))
    )
    FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id JOIN public.profiles po ON po.id=a.user_id LEFT JOIN public.profiles pd ON pd.id=a.deleted_by
    WHERE _kind IN ('all','action') AND a.deleted_at IS NOT NULL
      AND (adm OR a.user_id=uid OR a.assignee_id=uid OR (scp AND public.biz_scope_ok(uid,g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))))
    UNION ALL
    SELECT jsonb_build_object(
      'kind','task','id',t.id,'name',t.name,'work_date',t.work_date,'owner_id',t.user_id,'owner_name',po.full_name,
      'deleted_by',t.deleted_by,'deleted_by_name',pd.full_name,'deleted_at',t.deleted_at,
      'purge_at',t.deleted_at+interval '15 days',
      'seconds_left',greatest(0,extract(epoch FROM (t.deleted_at+interval '15 days'-now()))::bigint),
      'day_summarized',(d.summarized_at IS NOT NULL),
      'parent_deleted',(t.action_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.id=t.action_id AND a.deleted_at IS NOT NULL)),
      'restorable',(d.summarized_at IS NULL AND (t.user_id=uid OR adm) AND NOT (t.action_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.id=t.action_id AND a.deleted_at IS NOT NULL)))
    )
    FROM public.k3_tasks t JOIN public.k3_days d ON d.id=t.day_id JOIN public.profiles po ON po.id=t.user_id LEFT JOIN public.profiles pd ON pd.id=t.deleted_by
    WHERE _kind IN ('all','task') AND t.deleted_at IS NOT NULL
      AND (adm OR t.user_id=uid OR (scp AND public.k3_day_scope_ok(uid,t.day_id)))
  ) rows),'[]'::jsonb);
END$fn$;

-- Tự động xóa vĩnh viễn sau đúng 15 ngày: idempotent, kiểm tra lại bảo vệ chốt sổ, ghi nhật ký tối thiểu.
CREATE FUNCTION public.k3_purge_expired(_batch int DEFAULT 100) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); cutoff timestamptz:=now()-interval '15 days'; g record; a record; n_g int:=0; n_a int:=0; n_t int:=0; n_skip int:=0;
BEGIN
  IF uid IS NOT NULL AND NOT public.biz_admin(uid) THEN RAISE EXCEPTION 'Chỉ Admin hoặc tác vụ hệ thống được dọn Thùng lưu trữ.'; END IF;
  FOR g IN SELECT id,user_id,deleted_by FROM public.k3_goals WHERE deleted_at IS NOT NULL AND deleted_at<=cutoff ORDER BY deleted_at LIMIT _batch LOOP
    IF private.k3_goal_has_official(g.id) THEN n_skip:=n_skip+1; CONTINUE; END IF;
    DELETE FROM public.k3_tasks t USING public.k3_actions a WHERE t.action_id=a.id AND a.goal_id=g.id;
    DELETE FROM public.k3_period_comments c WHERE c.goal_id=g.id OR c.action_id IN (SELECT id FROM public.k3_actions WHERE goal_id=g.id);
    DELETE FROM public.k3_plan_events WHERE goal_id=g.id;
    DELETE FROM public.k3_actions WHERE goal_id=g.id;
    DELETE FROM public.k3_goals WHERE id=g.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,NULL,coalesce(g.deleted_by,g.user_id),'purge',jsonb_build_object('kind','goal','id',g.id));
    n_g:=n_g+1;
  END LOOP;
  FOR a IN SELECT a2.id,a2.user_id,a2.goal_id,a2.deleted_by FROM public.k3_actions a2 JOIN public.k3_goals g2 ON g2.id=a2.goal_id WHERE a2.deleted_at IS NOT NULL AND a2.deleted_at<=cutoff AND g2.deleted_at IS NULL ORDER BY a2.deleted_at LIMIT _batch LOOP
    IF private.k3_action_has_official(a.id) THEN n_skip:=n_skip+1; CONTINUE; END IF;
    DELETE FROM public.k3_tasks WHERE action_id=a.id;
    DELETE FROM public.k3_period_comments WHERE action_id=a.id;
    DELETE FROM public.k3_plan_events WHERE action_id=a.id;
    DELETE FROM public.k3_actions WHERE id=a.id;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(a.user_id,a.goal_id,coalesce(a.deleted_by,a.user_id),'purge',jsonb_build_object('kind','action','id',a.id));
    n_a:=n_a+1;
  END LOOP;
  WITH del AS (
    SELECT t.id FROM public.k3_tasks t JOIN public.k3_days d ON d.id=t.day_id
    WHERE t.deleted_at IS NOT NULL AND t.deleted_at<=cutoff AND d.summarized_at IS NULL
    ORDER BY t.deleted_at LIMIT _batch
  ), gone AS (DELETE FROM public.k3_tasks WHERE id IN (SELECT id FROM del) RETURNING id)
  SELECT count(*) INTO n_t FROM gone;
  RETURN jsonb_build_object('purged_goals',n_g,'purged_actions',n_a,'purged_tasks',n_t,'skipped_protected',n_skip,'cutoff',cutoff);
END$fn$;

-- Xóa công việc ngày: chặn ngày đã chốt sổ, ghi người xóa, Admin được xóa thay.
CREATE OR REPLACE FUNCTION public.k3_task_delete(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$DECLARE t public.k3_tasks; BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text)); SELECT * INTO t FROM public.k3_tasks WHERE id=_id FOR UPDATE;
 IF t.id IS NULL OR (t.user_id<>auth.uid() AND NOT public.biz_admin(auth.uid())) THEN RAISE EXCEPTION 'Bạn không được xóa công việc của người khác.'; END IF;
 PERFORM private.k3_write_guard(t.work_date);
 IF t.deleted_at IS NOT NULL THEN RETURN true; END IF;
 IF EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=t.day_id AND d.summarized_at IS NOT NULL) THEN RAISE EXCEPTION 'Ngày đã chốt sổ. Không thể xóa — hãy điều chỉnh qua cơ chế xác nhận lại.'; END IF;
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'delete',jsonb_build_object('before',to_jsonb(t)));
 UPDATE public.k3_tasks SET deleted_at=now(),deleted_by=auth.uid(),updated_at=now(),updated_by=auth.uid() WHERE id=t.id; RETURN true; END$fn$;

-- RLS: bản ghi đã xóa mềm không hiện qua truy vấn trực tiếp (Thùng lưu trữ đọc qua RPC SECURITY DEFINER).
DROP POLICY k3_goal_own ON public.k3_goals;
CREATE POLICY k3_goal_own ON public.k3_goals FOR SELECT TO authenticated USING (deleted_at IS NULL AND public.k3_goal_visible(auth.uid(), id));
DROP POLICY k3_action_own ON public.k3_actions;
CREATE POLICY k3_action_own ON public.k3_actions FOR SELECT TO authenticated USING (deleted_at IS NULL AND public.k3_action_visible(auth.uid(), id));

-- Tác vụ tự động dọn Thùng lưu trữ mỗi ngày 02:30 (server, độc lập phiên đăng nhập).
DO $do$ BEGIN PERFORM cron.unschedule('k3-trash-purge'); EXCEPTION WHEN OTHERS THEN NULL; END $do$;
SELECT cron.schedule('k3-trash-purge','30 2 * * *',$c$SELECT public.k3_purge_expired();$c$);

REVOKE ALL ON FUNCTION public.k3_soft_delete(text,uuid),public.k3_restore(text,uuid),public.k3_trash_list(text),public.k3_purge_expired(int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_soft_delete(text,uuid),public.k3_restore(text,uuid),public.k3_trash_list(text),public.k3_purge_expired(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.k3_purge_expired(int) TO service_role;