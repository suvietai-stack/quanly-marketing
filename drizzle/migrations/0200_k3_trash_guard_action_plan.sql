CREATE OR REPLACE FUNCTION public.k3_action_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE a public.k3_actions; old public.k3_actions; g public.k3_goals; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; key uuid:=nullif(p->>'request_key','')::uuid; _assignee uuid; _collab uuid; _collabs uuid[]:=coalesce((SELECT array_agg(value::uuid) FROM jsonb_array_elements_text(coalesce(p->'collaborators','[]'::jsonb))),'{}'::uuid[]);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF old.id IS NULL OR NOT (private.k3_goal_manage_ok(auth.uid(), old.goal_id) OR private.k3_action_worker_ok(auth.uid(), old.id)) THEN RAISE EXCEPTION 'Bạn không được sửa hành động này.'; END IF;
    IF old.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'KF đang nằm trong Thùng lưu trữ. Hãy khôi phục trước khi chỉnh sửa.'; END IF;
    IF (p->>'revision')::bigint IS DISTINCT FROM old.revision THEN RAISE EXCEPTION 'Hành động đã thay đổi. Vui lòng tải lại.'; END IF;
    IF (p ? 'assignee_id' OR p ? 'collaborators') AND NOT private.k3_goal_manage_ok(auth.uid(), old.goal_id) THEN RAISE EXCEPTION 'Chỉ người chủ trì KG được phân công lại KF.'; END IF;
  ELSE
    IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu lưu hành động.'; END IF;
    SELECT * INTO a FROM public.k3_actions WHERE user_id=auth.uid() AND request_key=key;
    IF a.id IS NOT NULL THEN RETURN to_jsonb(a); END IF;
  END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=coalesce(old.goal_id,nullif(p->>'goal_id','')::uuid) FOR UPDATE;
  IF g.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy mục tiêu.'; END IF;
  IF g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đang nằm trong Thùng lưu trữ.'; END IF;
  IF _id IS NULL AND NOT private.k3_goal_manage_ok(auth.uid(), g.id) THEN RAISE EXCEPTION 'Chỉ người chủ trì KG được thêm KF.'; END IF;
  IF g.status IN ('done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Mục tiêu đã kết thúc.'; END IF;
  IF g.period_type='custom' THEN PERFORM private.k3_write_guard(greatest(g.period_start, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), g.period_start)));
  ELSE PERFORM private.k3_period_write_guard(g.period_type,g.period_start); END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên hành động không được trống.'; END IF;
  IF nullif(p->>'manual_progress','') IS NOT NULL AND btrim(coalesce(p->>'progress_source',''))='' THEN RAISE EXCEPTION 'Xác nhận tiến độ thủ công cần ghi nguồn.'; END IF;
  IF nullif(p->>'start_date','')::date > nullif(p->>'due_date','')::date THEN RAISE EXCEPTION 'Ngày bắt đầu phải trước hạn hoàn thành.'; END IF;
  _assignee:=coalesce(nullif(p->>'assignee_id','')::uuid, old.assignee_id, g.user_id);
  IF _assignee<>g.user_id AND NOT EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_assignee AND m.status='accepted') THEN RAISE EXCEPTION 'Người phụ trách KF phải là chủ trì hoặc thành viên đã chấp nhận tham gia KG.'; END IF;
  FOREACH _collab IN ARRAY _collabs LOOP
    IF _collab<>g.user_id AND NOT EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_collab AND m.status='accepted') THEN RAISE EXCEPTION 'Người phối hợp phải là thành viên đã chấp nhận tham gia KG.'; END IF;
  END LOOP;
  IF _id IS NULL THEN
    INSERT INTO public.k3_actions(goal_id,user_id,name,start_date,due_date,note,manual_progress,progress_source,request_key,assignee_id,is_key)
    VALUES(g.id,g.user_id,btrim(p->>'name'),nullif(p->>'start_date','')::date,nullif(p->>'due_date','')::date,nullif(btrim(p->>'note'),''),nullif(p->>'manual_progress','')::smallint,nullif(btrim(p->>'progress_source'),''),key,_assignee,coalesce((p->>'is_key')::boolean,false))
    RETURNING * INTO a;
  ELSE
    UPDATE public.k3_actions SET name=btrim(p->>'name'),start_date=nullif(p->>'start_date','')::date,due_date=nullif(p->>'due_date','')::date,note=nullif(btrim(p->>'note'),''),manual_progress=nullif(p->>'manual_progress','')::smallint,progress_source=nullif(btrim(p->>'progress_source'),''),
      assignee_id=_assignee,is_key=coalesce((p->>'is_key')::boolean,old.is_key),revision=revision+1,updated_at=now()
    WHERE id=_id RETURNING * INTO a;
  END IF;
  IF p ? 'collaborators' THEN
    DELETE FROM public.k3_action_collaborators WHERE action_id=a.id AND user_id<>ALL(_collabs);
    INSERT INTO public.k3_action_collaborators(action_id,user_id,added_by) SELECT a.id,c,auth.uid() FROM unnest(_collabs) c ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(g.user_id,g.id,a.id,auth.uid(),'action_save',jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(a)));
  RETURN to_jsonb(a);
END$fn$;

CREATE OR REPLACE FUNCTION public.k3_plan_task_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$DECLARE p jsonb:=_payload; a public.k3_actions; g public.k3_goals; t public.k3_tasks; result jsonb; _kpi uuid:=nullif(_payload->>'kpi_id','')::uuid; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF; PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 SELECT * INTO a FROM public.k3_actions WHERE id=nullif(p->>'action_id','')::uuid; SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
 IF a.id IS NULL OR NOT private.k3_action_worker_ok(auth.uid(), a.id) THEN RAISE EXCEPTION 'Bạn không tham gia thực hiện hành động này.'; END IF;
 IF a.deleted_at IS NOT NULL OR g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'KF/KG đang nằm trong Thùng lưu trữ. Hãy khôi phục trước khi ghi nhận.'; END IF;
 IF _kpi IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.k3_kpis k WHERE k.id=_kpi AND k.action_id=a.id) THEN RAISE EXCEPTION 'KPI không thuộc hành động này.'; END IF;
 IF g.period_type='custom' THEN PERFORM private.k3_write_guard(greatest(g.period_start, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), g.period_start))); ELSE PERFORM private.k3_period_write_guard(g.period_type,g.period_start); END IF;
 IF nullif(p->>'id','') IS NOT NULL THEN SELECT * INTO t FROM public.k3_tasks WHERE id=(p->>'id')::uuid; IF t.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Bạn không được sửa việc người khác.'; END IF;
 ELSE IF nullif(p->>'request_key','') IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu công việc.'; END IF; SELECT * INTO t FROM public.k3_tasks WHERE user_id=auth.uid() AND request_key=(p->>'request_key')::uuid; IF t.id IS NOT NULL THEN RETURN to_jsonb(t); END IF; END IF;
 IF nullif(p->>'work_date','') IS NULL THEN p:=p||jsonb_build_object('work_date',coalesce(t.work_date,greatest(g.period_start,(SELECT effective_from FROM public.k3_settings WHERE id)))); END IF;
 IF t.id IS NULL AND nullif(_payload->>'work_date','') IS NULL THEN PERFORM set_config('k3.creating_unscheduled','yes',true); END IF; result:=public.k3_task_save(p); PERFORM set_config('k3.creating_unscheduled','',true);
 PERFORM set_config('k3.scheduling','yes',true);
 UPDATE public.k3_tasks SET action_id=a.id,is_unscheduled=CASE WHEN t.id IS NULL THEN nullif(_payload->>'work_date','') IS NULL ELSE t.is_unscheduled END,original_work_date=CASE WHEN t.id IS NULL AND nullif(_payload->>'work_date','') IS NULL THEN NULL ELSE original_work_date END,kpi_id=coalesce(_kpi,kpi_id) WHERE id=(result->>'id')::uuid RETURNING * INTO t;
 PERFORM set_config('k3.scheduling','',true);
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'link',jsonb_build_object('action_id',a.id,'kpi_id',_kpi,'is_unscheduled',t.is_unscheduled)); RETURN to_jsonb(t); END$fn$;