CREATE FUNCTION public.k3_goal_activate(_id uuid,_revision bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE g k3_goals;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));SELECT * INTO g FROM k3_goals WHERE id=_id FOR UPDATE;
 IF g.id IS NULL OR g.deleted_at IS NOT NULL OR NOT private.k3_goal_manage_ok(auth.uid(),_id) THEN RAISE EXCEPTION 'Bạn không được lưu công việc này.'; END IF;
 IF g.revision IS DISTINCT FROM _revision THEN RAISE EXCEPTION 'Công việc đã thay đổi. Vui lòng tải lại.'; END IF;
 IF g.status<>'draft' THEN RETURN to_jsonb(g); END IF;
 PERFORM private.k3_write_guard(greatest(g.period_start,coalesce((SELECT effective_from FROM k3_settings WHERE id),g.period_start)));
 IF NOT EXISTS(SELECT 1 FROM k3_actions WHERE goal_id=_id AND deleted_at IS NULL AND status<>'cancelled') OR EXISTS(SELECT 1 FROM k3_actions a WHERE a.goal_id=_id AND a.deleted_at IS NULL AND a.status<>'cancelled' AND NOT EXISTS(SELECT 1 FROM k3_kpis k WHERE k.action_id=a.id AND k.required)) THEN RAISE EXCEPTION 'Công việc cần KF và ít nhất một KPI bắt buộc cho mỗi KF.'; END IF;
 IF EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND (v.record_id=_id OR v.record_id IN(SELECT id FROM k3_actions WHERE goal_id=_id) OR v.record_id IN(SELECT k.id FROM k3_kpis k LEFT JOIN k3_actions a ON a.id=k.action_id WHERE coalesce(k.goal_id,a.goal_id)=_id))) THEN RAISE EXCEPTION 'Công việc đang chờ rà soát.'; END IF;
 UPDATE k3_goals SET status='not_started',revision=revision+1,updated_at=now() WHERE id=_id RETURNING * INTO g;
 UPDATE k3_actions SET status='not_started',revision=revision+1,updated_at=now() WHERE goal_id=_id AND status='draft' AND deleted_at IS NULL;
 INSERT INTO k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'goal_valid_save',jsonb_build_object('revision',g.revision));
 RETURN to_jsonb(g)||jsonb_build_object('status',private.k3_entity_metric('goal',g.id)->>'status');
END $fn$;
REVOKE ALL ON FUNCTION public.k3_goal_activate(uuid,bigint) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.k3_goal_activate(uuid,bigint) TO authenticated;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('private.k3_entity_state(text,uuid,timestamptz)'::regprocedure);
 def:=replace(def,$old$ AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id=k.id)$old$,'');EXECUTE def;
 def:=pg_get_functiondef('public.k3_quick_create(jsonb)'::regprocedure);
 def:=replace(def,$old$start_now boolean:=coalesce((p->>'start_now')::boolean,false)$old$,$new$start_now boolean:=coalesce((p->>'save_valid')::boolean,(p->>'start_now')::boolean,false)$new$);
 def:=replace(def,$old$CASE WHEN start_now THEN 'in_progress' ELSE 'draft' END$old$,$new$'draft'$new$);
 def:=replace(def,$old$IF cardinality(members)>0$old$,$new$IF start_now THEN PERFORM public.k3_goal_activate(gid,(SELECT revision FROM k3_goals WHERE id=gid)); END IF; IF cardinality(members)>0$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_goal_save(jsonb)'::regprocedure);
 def:=replace(def,$old$st:=coalesce(nullif(p->>'status',''),'draft');$old$,$new$IF p ? 'status' AND p->>'status'<>'draft' THEN RAISE EXCEPTION 'Trạng thái thực hiện do hệ thống xác định. Lưu công việc hợp lệ thay vì chọn trạng thái.'; END IF; st:='draft';$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_action_save(jsonb)'::regprocedure);
 def:=replace(def,$old$IF auth.uid() IS NULL THEN$old$,$new$IF nullif(p->>'manual_progress','') IS NOT NULL OR p ? 'status' THEN RAISE EXCEPTION 'Chỉ cập nhật kết quả KPI; trạng thái và tiến độ được tính tự động.'; END IF; IF auth.uid() IS NULL THEN$new$);
 def:=replace(def,$old$IF g.status IN ('done','ended_missed','cancelled')$old$,$new$IF g.status IN ('ended_missed','cancelled')$new$);
 def:=replace(def,$old$INSERT INTO public.k3_plan_events$old$,$new$IF g.status<>'draft' AND a.status='draft' AND EXISTS(SELECT 1 FROM k3_kpis WHERE action_id=a.id AND required) THEN UPDATE k3_actions SET status='not_started' WHERE id=a.id RETURNING * INTO a; END IF; INSERT INTO public.k3_plan_events$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_goal_status(uuid,text,text,bigint)'::regprocedure);
 def:=replace(def,$old$IF auth.uid() IS NULL THEN$old$,$new$IF _status NOT IN ('paused','ended_missed','cancelled') OR nullif(btrim(_note),'') IS NULL THEN RAISE EXCEPTION 'Trạng thái thông thường tự động; quyết định đặc biệt cần lý do.'; END IF; IF auth.uid() IS NULL THEN$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_action_status(uuid,text,text,text,text,bigint)'::regprocedure);
 def:=replace(def,$old$IF auth.uid() IS NULL THEN$old$,$new$IF _status NOT IN ('paused','ended_missed','cancelled') OR nullif(btrim(_problem),'') IS NULL THEN RAISE EXCEPTION 'Trạng thái thông thường tự động; quyết định đặc biệt cần lý do.'; END IF; IF auth.uid() IS NULL THEN$new$);EXECUTE def;
END $patch$;