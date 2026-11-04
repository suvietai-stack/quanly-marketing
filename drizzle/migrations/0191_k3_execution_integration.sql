-- Bước 2b: tích hợp thực thi — người phụ trách/phối hợp ghi kết quả vào KF chung, góc nhìn Quý, đọc ngày kèm KG/KF đang thực hiện.

-- Cho phép người phụ trách/phối hợp liên kết công việc ngày của chính họ vào KF chung (thay ràng buộc chủ sở hữu).
CREATE OR REPLACE FUNCTION private.k3_task_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; a public.k3_actions; BEGIN
 SELECT * INTO d FROM public.k3_days WHERE id=NEW.day_id FOR UPDATE; IF d.id IS NULL OR d.user_id<>NEW.user_id OR d.work_date<>NEW.work_date THEN RAISE EXCEPTION 'Công việc không khớp ngày gốc hoặc chủ sở hữu.'; END IF;
 IF TG_OP='UPDATE' AND NEW.user_id<>OLD.user_id THEN RAISE EXCEPTION 'Không được đổi chủ sở hữu.'; END IF;
 IF TG_OP='UPDATE' AND (NEW.day_id<>OLD.day_id OR NEW.work_date<>OLD.work_date OR NEW.is_unscheduled<>OLD.is_unscheduled) AND coalesce(current_setting('k3.scheduling',true),'')<>'yes' THEN RAISE EXCEPTION 'Chỉ được đổi ngày qua thao tác xếp lịch riêng.'; END IF;
 IF NEW.action_id IS NOT NULL AND NOT private.k3_action_worker_ok(NEW.user_id, NEW.action_id) THEN RAISE EXCEPTION 'Bạn không tham gia thực hiện hành động này.'; END IF;
 IF TG_OP='INSERT' THEN NEW.original_work_date:=CASE WHEN NEW.is_unscheduled THEN NULL ELSE NEW.work_date END; END IF;
 IF NEW.kpi_target<0 OR NEW.kpi_actual<0 THEN RAISE EXCEPTION 'KPI không được âm.'; END IF;
 IF TG_OP='INSERT' OR (NEW.kpi_target,NEW.kpi_actual,NEW.progress,NEW.status) IS DISTINCT FROM (OLD.kpi_target,OLD.kpi_actual,OLD.progress,OLD.status) THEN
 IF NEW.kpi_target>0 THEN NEW.progress:=least(100,round(coalesce(NEW.kpi_actual,0)/NEW.kpi_target*100)); END IF;
 IF NEW.status='done' AND ((NEW.kpi_target>0 AND coalesce(NEW.kpi_actual,0)<NEW.kpi_target) OR (coalesce(NEW.kpi_target,0)<=0 AND NEW.progress<100)) THEN RAISE EXCEPTION 'Chưa đạt chỉ tiêu hoàn thành. Hãy ghi nhận Kết thúc – Chưa đạt chỉ tiêu.'; END IF; END IF;
 IF NEW.status='incomplete' AND (TG_OP='INSERT' OR (NEW.status,NEW.problem,NEW.cause,NEW.solution) IS DISTINCT FROM (OLD.status,OLD.problem,OLD.cause,OLD.solution)) AND (btrim(coalesce(NEW.problem,''))='' OR btrim(coalesce(NEW.cause,''))='' OR btrim(coalesce(NEW.solution,''))='') THEN RAISE EXCEPTION 'Kết thúc chưa đạt cần đủ Vấn đề - Nguyên nhân - Giải pháp.'; END IF;
 IF TG_OP='UPDATE' THEN NEW.revision:=OLD.revision+1; END IF; RETURN NEW; END$$;

-- Tạo công việc từ KF: người tham gia thực thi đều tạo bản ghi ngày của chính mình.
CREATE OR REPLACE FUNCTION public.k3_plan_task_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE p jsonb:=_payload; a public.k3_actions; g public.k3_goals; t public.k3_tasks; result jsonb; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF; PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 SELECT * INTO a FROM public.k3_actions WHERE id=nullif(p->>'action_id','')::uuid; SELECT * INTO g FROM public.k3_goals WHERE id=a.goal_id;
 IF a.id IS NULL OR NOT private.k3_action_worker_ok(auth.uid(), a.id) THEN RAISE EXCEPTION 'Bạn không tham gia thực hiện hành động này.'; END IF;
 IF g.period_type='custom' THEN PERFORM private.k3_write_guard(greatest(g.period_start, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), g.period_start))); ELSE PERFORM private.k3_period_write_guard(g.period_type,g.period_start); END IF;
 IF nullif(p->>'id','') IS NOT NULL THEN SELECT * INTO t FROM public.k3_tasks WHERE id=(p->>'id')::uuid; IF t.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Bạn không được sửa việc người khác.'; END IF;
 ELSE IF nullif(p->>'request_key','') IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu công việc.'; END IF; SELECT * INTO t FROM public.k3_tasks WHERE user_id=auth.uid() AND request_key=(p->>'request_key')::uuid; IF t.id IS NOT NULL THEN RETURN to_jsonb(t); END IF; END IF;
 IF nullif(p->>'work_date','') IS NULL THEN p:=p||jsonb_build_object('work_date',coalesce(t.work_date,greatest(g.period_start,(SELECT effective_from FROM public.k3_settings WHERE id)))); END IF;
 IF t.id IS NULL AND nullif(_payload->>'work_date','') IS NULL THEN PERFORM set_config('k3.creating_unscheduled','yes',true); END IF; result:=public.k3_task_save(p); PERFORM set_config('k3.creating_unscheduled','',true);
 PERFORM set_config('k3.scheduling','yes',true);
 UPDATE public.k3_tasks SET action_id=a.id,is_unscheduled=CASE WHEN t.id IS NULL THEN nullif(_payload->>'work_date','') IS NULL ELSE t.is_unscheduled END,original_work_date=CASE WHEN t.id IS NULL AND nullif(_payload->>'work_date','') IS NULL THEN NULL ELSE original_work_date END WHERE id=(result->>'id')::uuid RETURNING * INTO t;
 PERFORM set_config('k3.scheduling','',true);
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'link',jsonb_build_object('action_id',a.id,'is_unscheduled',t.is_unscheduled)); RETURN to_jsonb(t); END$$;

-- Góc nhìn Quý (chỉ đọc, không thêm nghiệp vụ nộp tổng kết quý).
CREATE OR REPLACE FUNCTION public.k3_period_start(_type text,_date date) RETURNS date LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$BEGIN IF _type='week' THEN RETURN _date-(extract(isodow FROM _date)::int-1); ELSIF _type='month' THEN RETURN date_trunc('month',_date)::date; ELSIF _type='quarter' THEN RETURN date_trunc('quarter',_date)::date; ELSE RAISE EXCEPTION 'Chu kỳ 3K không hợp lệ.'; END IF; END$$;
CREATE OR REPLACE FUNCTION public.k3_period_end(_type text,_date date) RETURNS date LANGUAGE sql IMMUTABLE SET search_path=public AS $$SELECT CASE WHEN _type='week' THEN public.k3_period_start(_type,_date)+6 WHEN _type='month' THEN (public.k3_period_start(_type,_date)+interval '1 month'-interval '1 day')::date WHEN _type='quarter' THEN (public.k3_period_start(_type,_date)+interval '3 months'-interval '1 day')::date END$$;

-- Đọc ngày kèm KG đang thực hiện và KF được phân công để chọn thực hiện trong ngày.
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
     AND (g.user_id=_user OR m.status='accepted' OR EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled' AND (a.assignee_id=_user OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id AND c.user_id=_user))))),'[]'::jsonb),
 'assigned_actions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'goal_id',a.goal_id,'goal_name',g.name,'name',a.name,'status',a.status,'due_date',a.due_date,'is_key',a.is_key,'my_part',CASE WHEN a.assignee_id=_user THEN 'assignee' ELSE 'collaborator' END,'already_today',EXISTS(SELECT 1 FROM public.k3_tasks t WHERE t.action_id=a.id AND t.user_id=_user AND t.work_date=_date AND t.deleted_at IS NULL)) ORDER BY a.is_key DESC, a.due_date NULLS LAST)
   FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
   WHERE a.status IN ('not_started','in_progress','paused') AND g.status IN ('not_started','in_progress','paused')
     AND (a.assignee_id=_user OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id AND c.user_id=_user))),'[]'::jsonb)); END$$;

-- Cài đặt đọc kèm quyền nghiệp vụ mới.
CREATE OR REPLACE FUNCTION public.k3_settings_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings;BEGIN
  IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản không còn hoạt động.' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM public.k3_settings WHERE id=true;
  RETURN jsonb_build_object(
    'enabled', coalesce(s.enabled,false),
    'effective_from', s.effective_from,
    'plan_by', coalesce(s.plan_by,'08:45'::time),
    'summary_by', coalesce(s.summary_by,'18:00'::time),
    'max_focus', coalesce(s.max_focus,3),
    'allow_personal_goal', coalesce(s.allow_personal_goal,true),
    'allow_team_goal', coalesce(s.allow_team_goal,true),
    'allow_invite', coalesce(s.allow_invite,true),
    'allow_assign', coalesce(s.allow_assign,true),
    'updated_at', s.updated_at,
    'can_use', public.k3_can(auth.uid(),'k3.use'),
    'can_view_scope', public.k3_can(auth.uid(),'k3.view_scope'),
    'can_comment', public.k3_can(auth.uid(),'k3.comment'),
    'can_settings', public.k3_can(auth.uid(),'k3.settings'),
    'today', (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  );
END$$;

REVOKE ALL ON FUNCTION public.k3_plan_task_save(jsonb),public.k3_period_start(text,date),public.k3_period_end(text,date),public.k3_user_day_read(uuid,date),public.k3_settings_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_plan_task_save(jsonb),public.k3_period_start(text,date),public.k3_period_end(text,date),public.k3_user_day_read(uuid,date),public.k3_settings_read() TO authenticated;