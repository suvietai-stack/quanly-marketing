-- FIX A–D spec thống nhất 3K: thu hồi thành viên chặn ghi KF cũ; sửa ngày KG lưu thật; KPI cùng đơn vị tách theo kpi_id; KF chưa tới ngày không vào danh sách hôm nay.

-- C. Liên kết bản ghi thực thi với đúng KPI (tránh cộng chung khi một KF có nhiều KPI cùng đơn vị).
ALTER TABLE public.k3_tasks ADD COLUMN kpi_id uuid REFERENCES public.k3_kpis(id) ON DELETE SET NULL;
CREATE INDEX k3_tasks_kpi_id ON public.k3_tasks(kpi_id) WHERE kpi_id IS NOT NULL;

-- C. Thực tế KPI theo đúng chỉ số: bản ghi đã gắn kpi_id chỉ tính cho KPI đó; bản ghi cũ (kpi_id NULL) tính theo đơn vị như trước.
CREATE FUNCTION private.k3_action_kpi_actual(_action uuid, _kpi uuid, _unit text) RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(sum(t.kpi_actual),0) FROM public.k3_tasks t
  WHERE t.action_id=_action AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL
    AND (t.kpi_id=_kpi OR (t.kpi_id IS NULL AND nullif(btrim(coalesce(t.kpi_unit,'')),'') IS NOT DISTINCT FROM nullif(btrim(coalesce(_unit,'')),'')))
$$;
REVOKE ALL ON FUNCTION private.k3_action_kpi_actual(uuid,uuid,text) FROM PUBLIC, anon, authenticated;
DROP FUNCTION private.k3_action_kpi_actual(uuid,text);

-- A. Người thực thi KF: chủ trì KG, hoặc người phụ trách/phối hợp CÒN là thành viên đã chấp nhận (thu hồi = mất quyền ghi).
CREATE OR REPLACE FUNCTION private.k3_action_worker_ok(_user uuid, _action uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
    WHERE a.id=_action AND a.status<>'cancelled' AND g.status NOT IN ('done','ended_missed','cancelled') AND (
      g.user_id=_user
      OR (EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_user AND m.status='accepted')
          AND (a.assignee_id=_user OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id AND c.user_id=_user)))
    )
  )
$$;

-- B. Sửa ngày bắt đầu/hạn hoàn thành KG (custom) lưu thật ở backend.
CREATE OR REPLACE FUNCTION public.k3_goal_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.k3_goals; old public.k3_goals; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; typ text:=coalesce(nullif(p->>'period_type',''),'custom'); dt date:=nullif(p->>'period_start','')::date; de date:=nullif(p->>'period_end','')::date; key uuid:=nullif(p->>'request_key','')::uuid; st text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF old.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), old.id) THEN RAISE EXCEPTION 'Bạn không được sửa mục tiêu này.'; END IF;
    IF (p->>'revision')::bigint IS DISTINCT FROM old.revision THEN RAISE EXCEPTION 'Mục tiêu đã thay đổi. Vui lòng tải lại.'; END IF;
    typ:=old.period_type;
    IF typ='custom' THEN
      dt:=coalesce(dt, old.period_start);
      de:=coalesce(de, old.period_end);
    ELSE
      dt:=old.period_start; de:=old.period_end;
    END IF;
  ELSE
    IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu lưu mục tiêu.'; END IF;
    SELECT * INTO g FROM public.k3_goals WHERE user_id=auth.uid() AND request_key=key;
    IF g.id IS NOT NULL THEN RETURN to_jsonb(g); END IF;
    IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
    IF NOT coalesce((SELECT allow_personal_goal FROM public.k3_settings WHERE id),true) AND NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Quyền tạo KG đang tắt trong Cài đặt 3K.'; END IF;
  END IF;
  IF typ='custom' THEN
    IF dt IS NULL OR de IS NULL OR de < dt THEN RAISE EXCEPTION 'Cần chọn ngày bắt đầu và hạn hoàn thành hợp lệ.'; END IF;
    PERFORM private.k3_write_guard(greatest(dt, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), dt)));
  ELSE
    dt:=public.k3_period_start(typ,dt);
    IF dt IS NULL THEN RAISE EXCEPTION 'Cần chọn kỳ.'; END IF;
    de:=public.k3_period_end(typ,dt);
    PERFORM private.k3_period_write_guard(typ,dt);
  END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên mục tiêu không được trống.'; END IF;
  st:=coalesce(nullif(p->>'status',''),'draft');
  IF st NOT IN ('draft','not_started','in_progress') THEN RAISE EXCEPTION 'Trạng thái khởi tạo không hợp lệ.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.k3_goals(user_id,period_type,period_start,period_end,name,description,expected_result,due_date,department_id,request_key,status,is_key)
    VALUES(auth.uid(),typ,dt,de,btrim(p->>'name'),nullif(btrim(p->>'description'),''),nullif(btrim(p->>'expected_result'),''),coalesce(nullif(p->>'due_date','')::date,de),public.biz_department_at(auth.uid(),greatest(dt,coalesce((SELECT period_effective_from FROM public.k3_settings WHERE id),dt))),key,st,coalesce((p->>'is_key')::boolean,false))
    RETURNING * INTO g;
  ELSE
    UPDATE public.k3_goals SET name=btrim(p->>'name'),description=nullif(btrim(p->>'description'),''),expected_result=nullif(btrim(p->>'expected_result'),''),due_date=nullif(p->>'due_date','')::date,is_key=coalesce((p->>'is_key')::boolean,old.is_key),
      period_start=CASE WHEN old.period_type='custom' THEN dt ELSE old.period_start END,
      period_end=CASE WHEN old.period_type='custom' THEN de ELSE old.period_end END,
      revision=revision+1,updated_at=now()
    WHERE id=_id RETURNING * INTO g;
  END IF;
  INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'goal_save',jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(g)));
  RETURN to_jsonb(g);
END$$;

-- A. KF chỉ sửa/đổi trạng thái bởi chủ trì KG hoặc người thực thi còn hiệu lực.
CREATE OR REPLACE FUNCTION public.k3_action_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.k3_actions; old public.k3_actions; g public.k3_goals; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; key uuid:=nullif(p->>'request_key','')::uuid; _assignee uuid; _collab uuid; _collabs uuid[]:=coalesce((SELECT array_agg(value::uuid) FROM jsonb_array_elements_text(coalesce(p->'collaborators','[]'::jsonb))),'{}'::uuid[]);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF old.id IS NULL OR NOT (private.k3_goal_manage_ok(auth.uid(), old.goal_id) OR private.k3_action_worker_ok(auth.uid(), old.id)) THEN RAISE EXCEPTION 'Bạn không được sửa hành động này.'; END IF;
    IF (p->>'revision')::bigint IS DISTINCT FROM old.revision THEN RAISE EXCEPTION 'Hành động đã thay đổi. Vui lòng tải lại.'; END IF;
    IF (p ? 'assignee_id' OR p ? 'collaborators') AND NOT private.k3_goal_manage_ok(auth.uid(), old.goal_id) THEN RAISE EXCEPTION 'Chỉ người chủ trì KG được phân công lại KF.'; END IF;
  ELSE
    IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu lưu hành động.'; END IF;
    SELECT * INTO a FROM public.k3_actions WHERE user_id=auth.uid() AND request_key=key;
    IF a.id IS NOT NULL THEN RETURN to_jsonb(a); END IF;
  END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=coalesce(old.goal_id,nullif(p->>'goal_id','')::uuid) FOR UPDATE;
  IF g.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy mục tiêu.'; END IF;
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
END$$;

CREATE OR REPLACE FUNCTION public.k3_action_status(_id uuid, _status text, _problem text, _cause text, _solution text, _revision bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.k3_actions; unmet text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO a FROM public.k3_actions WHERE id=_id FOR UPDATE;
  IF a.id IS NULL OR NOT (private.k3_goal_manage_ok(auth.uid(), a.goal_id) OR private.k3_action_worker_ok(auth.uid(), a.id)) THEN RAISE EXCEPTION 'Bạn không có quyền đổi trạng thái hành động này.'; END IF;
  IF _revision IS NULL OR _revision <> a.revision THEN RAISE EXCEPTION 'Hành động đã thay đổi. Vui lòng tải lại.'; END IF;
  IF _status NOT IN ('draft','not_started','in_progress','paused','done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF _status='done' THEN
    SELECT string_agg(k.name,'; ') INTO unmet FROM public.k3_kpis k WHERE k.action_id=a.id AND k.kind='cumulative' AND coalesce(k.target,0)>0 AND private.k3_action_kpi_actual(a.id,k.id,k.unit) < k.target;
    IF unmet IS NOT NULL THEN RAISE EXCEPTION 'Chưa đạt KPI: %. Hãy ghi nhận Kết thúc chưa đạt nếu dừng hành động này.', unmet; END IF;
  END IF;
  IF _status='ended_missed' AND (btrim(coalesce(_problem,''))='' OR btrim(coalesce(_cause,''))='' OR btrim(coalesce(_solution,''))='') THEN RAISE EXCEPTION 'Kết thúc chưa đạt cần đủ Vấn đề - Nguyên nhân - Giải pháp.'; END IF;
  UPDATE public.k3_actions SET status=_status,
    problem=CASE WHEN _status='ended_missed' THEN btrim(_problem) ELSE problem END,
    cause=CASE WHEN _status='ended_missed' THEN btrim(_cause) ELSE cause END,
    solution=CASE WHEN _status='ended_missed' THEN btrim(_solution) ELSE solution END,
    closed_at=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN now() ELSE NULL END,
    closed_by=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN auth.uid() ELSE NULL END,
    revision=revision+1, updated_at=now()
  WHERE id=a.id RETURNING * INTO a;
  INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(a.user_id,a.goal_id,a.id,auth.uid(),'action_status',jsonb_build_object('status',_status));
  RETURN to_jsonb(a);
END$$;

-- C. Tạo công việc từ KF: cho phép gắn đúng KPI của KF đó.
CREATE OR REPLACE FUNCTION public.k3_plan_task_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE p jsonb:=_payload; a public.k3_actions; g public.k3_goals; t public.k3_tasks; result jsonb; _kpi uuid:=nullif(_payload->>'kpi_id','')::uuid; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF; PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 SELECT * INTO a FROM public.k3_actions WHERE id=nullif(p->>'action_id','')::uuid; SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
 IF a.id IS NULL OR NOT private.k3_action_worker_ok(auth.uid(), a.id) THEN RAISE EXCEPTION 'Bạn không tham gia thực hiện hành động này.'; END IF;
 IF _kpi IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.k3_kpis k WHERE k.id=_kpi AND k.action_id=a.id) THEN RAISE EXCEPTION 'KPI không thuộc hành động này.'; END IF;
 IF g.period_type='custom' THEN PERFORM private.k3_write_guard(greatest(g.period_start, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), g.period_start))); ELSE PERFORM private.k3_period_write_guard(g.period_type,g.period_start); END IF;
 IF nullif(p->>'id','') IS NOT NULL THEN SELECT * INTO t FROM public.k3_tasks WHERE id=(p->>'id')::uuid; IF t.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Bạn không được sửa việc người khác.'; END IF;
 ELSE IF nullif(p->>'request_key','') IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu công việc.'; END IF; SELECT * INTO t FROM public.k3_tasks WHERE user_id=auth.uid() AND request_key=(p->>'request_key')::uuid; IF t.id IS NOT NULL THEN RETURN to_jsonb(t); END IF; END IF;
 IF nullif(p->>'work_date','') IS NULL THEN p:=p||jsonb_build_object('work_date',coalesce(t.work_date,greatest(g.period_start,(SELECT effective_from FROM public.k3_settings WHERE id)))); END IF;
 IF t.id IS NULL AND nullif(_payload->>'work_date','') IS NULL THEN PERFORM set_config('k3.creating_unscheduled','yes',true); END IF; result:=public.k3_task_save(p); PERFORM set_config('k3.creating_unscheduled','',true);
 PERFORM set_config('k3.scheduling','yes',true);
 UPDATE public.k3_tasks SET action_id=a.id,is_unscheduled=CASE WHEN t.id IS NULL THEN nullif(_payload->>'work_date','') IS NULL ELSE t.is_unscheduled END,original_work_date=CASE WHEN t.id IS NULL AND nullif(_payload->>'work_date','') IS NULL THEN NULL ELSE original_work_date END,kpi_id=coalesce(_kpi,kpi_id) WHERE id=(result->>'id')::uuid RETURNING * INTO t;
 PERFORM set_config('k3.scheduling','',true);
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'link',jsonb_build_object('action_id',a.id,'kpi_id',_kpi,'is_unscheduled',t.is_unscheduled)); RETURN to_jsonb(t); END$$;

-- A + D. Đọc ngày: KG/KF chỉ hiện với thành viên còn hiệu lực; KF chưa tới ngày bắt đầu không vào danh sách hôm nay.
CREATE OR REPLACE FUNCTION public.k3_user_day_read(_user uuid,_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF; SELECT * INTO d FROM public.k3_days WHERE user_id=_user AND work_date=_date;
 IF (_user=auth.uid() AND NOT public.k3_can(auth.uid(),'k3.use')) OR (_user<>auth.uid() AND NOT (public.k3_can(auth.uid(),'k3.view_scope') AND CASE WHEN d.id IS NOT NULL THEN public.k3_day_scope_ok(auth.uid(),d.id) ELSE public.biz_scope_ok(auth.uid(),_user,public.biz_department_at(_user,_date),(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END)) THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K của nhân viên này.'; END IF;
 RETURN jsonb_build_object('settings',public.k3_settings_read(),'user',(SELECT jsonb_build_object('id',id,'full_name',full_name) FROM public.profiles WHERE id=_user),'day',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
 'tasks',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY is_focus DESC,sort_order,start_time NULLS LAST,created_at) FROM public.k3_tasks t WHERE day_id=d.id AND deleted_at IS NULL AND NOT is_unscheduled),'[]'::jsonb),
 'comments',coalesce((SELECT jsonb_agg(to_jsonb(c)||jsonb_build_object('author_name',p.full_name) ORDER BY c.created_at) FROM public.k3_comments c LEFT JOIN public.profiles p ON p.id=c.author_id WHERE c.day_id=d.id),'[]'::jsonb),
 'events',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM (SELECT * FROM public.k3_task_events WHERE day_id=d.id ORDER BY created_at DESC LIMIT 100) e),'[]'::jsonb),
 'summaries',coalesce((SELECT jsonb_agg(to_jsonb(v) ORDER BY confirmed_at DESC) FROM public.k3_summary_versions v WHERE day_id=d.id),'[]'::jsonb),'can_comment',d.id IS NOT NULL AND public.k3_can(auth.uid(),'k3.comment') AND public.k3_day_scope_ok(auth.uid(),d.id),
 'active_goals',coalesce((SELECT jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'status',g.status,'period_start',g.period_start,'period_end',g.period_end,'due_date',g.due_date,'is_key',g.is_key,'owner_name',(SELECT full_name FROM public.profiles WHERE id=g.user_id),'my_role',CASE WHEN g.user_id=_user THEN 'owner' ELSE m.status END) ORDER BY g.is_key DESC, g.period_end)
   FROM public.k3_goals g LEFT JOIN public.k3_goal_members m ON m.goal_id=g.id AND m.user_id=_user
   WHERE g.status IN ('not_started','in_progress','paused') AND g.period_start<=_date AND g.period_end>=_date
     AND (g.user_id=_user OR m.status='accepted')),'[]'::jsonb),
 'assigned_actions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'goal_id',a.goal_id,'goal_name',g.name,'name',a.name,'status',a.status,'due_date',a.due_date,'is_key',a.is_key,'my_part',CASE WHEN a.assignee_id=_user THEN 'assignee' ELSE 'collaborator' END,'already_today',EXISTS(SELECT 1 FROM public.k3_tasks t WHERE t.action_id=a.id AND t.user_id=_user AND t.work_date=_date AND t.deleted_at IS NULL)) ORDER BY a.is_key DESC, a.due_date NULLS LAST)
   FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
   WHERE a.status IN ('not_started','in_progress','paused') AND g.status IN ('not_started','in_progress','paused')
     AND coalesce(a.start_date, g.period_start) <= _date
     AND (g.user_id=_user OR EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_user AND m.status='accepted'))
     AND (a.assignee_id=_user OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id AND c.user_id=_user))),'[]'::jsonb)); END$$;

-- A. Danh sách KG: lọc "Tôi phụ trách KF" chỉ tính khi còn là thành viên hợp lệ.
CREATE OR REPLACE FUNCTION public.k3_goal_list(_filter text DEFAULT 'all', _q text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF NOT public.k3_can(auth.uid(),'k3.use') AND NOT public.k3_can(auth.uid(),'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(row) FROM (
    SELECT row FROM (
      SELECT jsonb_build_object(
        'id',g.id,'name',g.name,'status',g.status,'period_type',g.period_type,'period_start',g.period_start,'period_end',g.period_end,'due_date',g.due_date,'is_key',g.is_key,
        'owner_id',g.user_id,'owner_name',p.full_name,'revision',g.revision,
        'my_role',CASE WHEN g.user_id=auth.uid() THEN 'owner' ELSE m.status END,
        'member_count',(SELECT count(*) FROM public.k3_goal_members x WHERE x.goal_id=g.id AND x.status='accepted'),
        'kf_total',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled'),
        'kf_done',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status='done'),
        'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END
      ) row
      FROM public.k3_goals g
      JOIN public.profiles p ON p.id=g.user_id
      LEFT JOIN public.k3_goal_members m ON m.goal_id=g.id AND m.user_id=auth.uid()
      WHERE (coalesce(_q,'')='' OR g.name ILIKE '%'||_q||'%')
        AND (
          (_filter='mine' AND g.user_id=auth.uid())
          OR (_filter='joined' AND m.status='accepted' AND g.user_id<>auth.uid())
          OR (_filter='invited' AND m.status='invited')
          OR (_filter='assigned' AND g.user_id<>auth.uid() AND m.status='accepted' AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.goal_id=g.id AND a.assignee_id=auth.uid() AND a.status<>'cancelled'))
          OR (_filter='scope' AND public.k3_can(auth.uid(),'k3.view_scope') AND g.user_id<>auth.uid() AND public.biz_scope_ok(auth.uid(),g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))
          OR (_filter IN ('all','active','overdue','done') AND public.k3_goal_visible(auth.uid(),g.id))
        )
        AND (_filter<>'active' OR g.status IN ('not_started','in_progress','paused'))
        AND (_filter<>'overdue' OR (g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today))
        AND (_filter<>'done' OR g.status IN ('done','ended_missed'))
    ) unsorted ORDER BY (row->>'is_key')::boolean DESC, row->>'period_end'
  ) sorted),'[]'::jsonb);
END$$;

-- C. Chi tiết KG: KPI tính theo đúng chỉ số (kpi_id), giữ tương thích bản ghi cũ theo đơn vị.
CREATE OR REPLACE FUNCTION public.k3_goal_detail(_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.k3_goals; today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_id;
  IF g.id IS NULL OR NOT public.k3_goal_visible(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền xem mục tiêu này.'; END IF;
  RETURN jsonb_build_object(
    'goal', to_jsonb(g) || jsonb_build_object('owner_name',(SELECT full_name FROM public.profiles WHERE id=g.user_id),'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END),
    'kpis', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
        'actual',CASE WHEN k.kind='cumulative' THEN (SELECT coalesce(sum(t.kpi_actual),0) FROM public.k3_tasks t JOIN public.k3_actions a ON a.id=t.action_id WHERE a.goal_id=g.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL AND (t.kpi_id=k.id OR (t.kpi_id IS NULL AND nullif(btrim(coalesce(t.kpi_unit,'')),'') IS NOT DISTINCT FROM nullif(btrim(coalesce(k.unit,'')),'')))) ELSE k.manual_actual END) row
      FROM public.k3_kpis k WHERE k.goal_id=g.id ORDER BY k.sort_order,k.created_at) sorted),'[]'::jsonb),
    'actions', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('action',to_jsonb(a),'assignee_name',(SELECT full_name FROM public.profiles WHERE id=a.assignee_id),
        'collaborators',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',c.user_id,'full_name',pr.full_name)) FROM public.k3_action_collaborators c JOIN public.profiles pr ON pr.id=c.user_id WHERE c.action_id=a.id),'[]'::jsonb),
        'kpis',coalesce((SELECT jsonb_agg(krow) FROM (SELECT jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
            'actual',CASE WHEN k.kind='cumulative' THEN private.k3_action_kpi_actual(a.id,k.id,k.unit) ELSE k.manual_actual END) krow FROM public.k3_kpis k WHERE k.action_id=a.id ORDER BY k.sort_order,k.created_at) ksorted),'[]'::jsonb),
        'member_actuals',coalesce((SELECT jsonb_agg(mrow) FROM (SELECT jsonb_build_object('user_id',t.user_id,'full_name',pr.full_name,'actual',sum(t.kpi_actual),'days',count(DISTINCT t.work_date)) mrow FROM public.k3_tasks t JOIN public.profiles pr ON pr.id=t.user_id WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL GROUP BY t.user_id,pr.full_name) msorted),'[]'::jsonb),
        'task_total',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled),
        'task_done',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND private.k3_task_complete(t.kpi_target,t.kpi_actual,t.progress,t.status)),
        'overdue_days',CASE WHEN a.status IN ('not_started','in_progress','paused') AND a.due_date IS NOT NULL AND a.due_date < today THEN (today - a.due_date) ELSE 0 END) row
      FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled' ORDER BY a.is_key DESC, a.created_at) sorted),'[]'::jsonb),
    'members', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('user_id',m.user_id,'full_name',p.full_name,'status',m.status,'invited_at',m.invited_at,'responded_at',m.responded_at,
        'departments',coalesce((SELECT array_agg(DISTINCT d.name) FROM public.biz_department_members mm JOIN public.biz_departments d ON d.id=mm.department_id WHERE mm.user_id=m.user_id),'{}'::text[])) row
      FROM public.k3_goal_members m JOIN public.profiles p ON p.id=m.user_id WHERE m.goal_id=g.id ORDER BY m.invited_at) sorted),'[]'::jsonb),
    'executions', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',t.id,'work_date',t.work_date,'name',t.name,'status',t.status,'kpi_actual',t.kpi_actual,'kpi_unit',t.kpi_unit,'kpi_id',t.kpi_id,'progress',t.progress,'action_id',t.action_id,'user_id',t.user_id,'full_name',p.full_name,'problem',t.problem,'solution',t.solution) row
      FROM public.k3_tasks t JOIN public.profiles p ON p.id=t.user_id
      WHERE t.action_id IN (SELECT a.id FROM public.k3_actions a WHERE a.goal_id=g.id) AND t.deleted_at IS NULL AND NOT t.is_unscheduled
      ORDER BY t.work_date DESC, t.id LIMIT 200) sorted),'[]'::jsonb),
    'events', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',e.id,'action',e.action,'detail',e.detail,'created_at',e.created_at,'actor_name',(SELECT full_name FROM public.profiles WHERE id=e.actor_id)) row
      FROM public.k3_plan_events e WHERE e.goal_id=g.id ORDER BY e.created_at DESC LIMIT 100) sorted),'[]'::jsonb),
    'can_manage', private.k3_goal_manage_ok(auth.uid(), g.id),
    'my_member_status', (SELECT status FROM public.k3_goal_members WHERE goal_id=g.id AND user_id=auth.uid()),
    'today', today
  );
END$$;

REVOKE ALL ON FUNCTION public.k3_goal_save(jsonb),public.k3_action_save(jsonb),public.k3_action_status(uuid,text,text,text,text,bigint),public.k3_plan_task_save(jsonb),public.k3_user_day_read(uuid,date),public.k3_goal_list(text,text),public.k3_goal_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_goal_save(jsonb),public.k3_action_save(jsonb),public.k3_action_status(uuid,text,text,text,text,bigint),public.k3_plan_task_save(jsonb),public.k3_user_day_read(uuid,date),public.k3_goal_list(text,text),public.k3_goal_detail(uuid) TO authenticated;
