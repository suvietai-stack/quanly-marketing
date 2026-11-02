CREATE TABLE public.k3_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  enabled boolean NOT NULL DEFAULT false,
  effective_from date,
  plan_by time NOT NULL DEFAULT '08:45',
  summary_by time NOT NULL DEFAULT '18:00',
  max_focus smallint NOT NULL DEFAULT 3 CHECK (max_focus BETWEEN 1 AND 5),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.k3_settings_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  snapshot jsonb NOT NULL
);
CREATE TABLE public.k3_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  work_date date NOT NULL,
  kg text,
  planned_at timestamptz,
  summarized_at timestamptz,
  summary_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, work_date)
);
CREATE TABLE public.k3_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.k3_days(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  work_date date NOT NULL,
  name text NOT NULL,
  start_time time,
  end_time time,
  kpi_target numeric,
  kpi_unit text,
  kpi_actual numeric,
  progress smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done','paused','incomplete')),
  is_focus boolean NOT NULL DEFAULT false,
  how text,
  place text,
  links jsonb,
  note text,
  problem text,
  cause text,
  solution text,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.k3_task_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  day_id uuid NOT NULL REFERENCES public.k3_days(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.k3_tasks(id) ON DELETE SET NULL,
  actor_id uuid,
  action text NOT NULL,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.k3_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.k3_days(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.k3_tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX k3_tasks_day_idx ON public.k3_tasks(day_id);
CREATE INDEX k3_tasks_user_date_idx ON public.k3_tasks(user_id, work_date);
CREATE INDEX k3_task_events_day_idx ON public.k3_task_events(day_id);
CREATE INDEX k3_comments_day_idx ON public.k3_comments(day_id);
GRANT SELECT ON public.k3_settings, public.k3_settings_log, public.k3_days, public.k3_tasks, public.k3_task_events, public.k3_comments TO authenticated;
GRANT ALL ON public.k3_settings, public.k3_settings_log, public.k3_days, public.k3_tasks, public.k3_task_events, public.k3_comments TO service_role;
ALTER TABLE public.k3_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_settings_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_comments ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.k3_can(_actor uuid, _permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$BEGIN
  IF _actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false; END IF;
  IF public.is_super_admin(_actor) THEN RETURN true; END IF;
  IF _permission='k3.use' THEN RETURN private.sig_can(_actor,'k3.use') OR public.biz_participant(_actor); END IF;
  IF _permission IN ('k3.view_scope','k3.comment') THEN RETURN private.sig_can(_actor,_permission) OR public.biz_manager(_actor) OR public.biz_all_scope(_actor); END IF;
  RETURN private.sig_can(_actor,_permission);
END$$;
CREATE FUNCTION public.k3_scope_ok(_actor uuid, _user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT _actor IS NOT NULL AND _user IS NOT NULL AND (
    public.biz_all_scope(_actor)
    OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_user AND public.biz_scope_ok(_actor, _user, m.department_id))
  )$$;
CREATE POLICY k3_settings_select ON public.k3_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY k3_settings_log_select ON public.k3_settings_log FOR SELECT TO authenticated USING (public.k3_can(auth.uid(),'k3.settings'));
CREATE POLICY k3_days_select ON public.k3_days FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY k3_tasks_select ON public.k3_tasks FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY k3_task_events_select ON public.k3_task_events FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=day_id AND d.user_id=auth.uid()));
CREATE POLICY k3_comments_select ON public.k3_comments FOR SELECT TO authenticated USING (author_id=auth.uid() OR EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=day_id AND d.user_id=auth.uid()));
CREATE FUNCTION public.k3_settings_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings;BEGIN
  SELECT * INTO s FROM public.k3_settings WHERE id=true;
  RETURN jsonb_build_object(
    'enabled', coalesce(s.enabled,false),
    'effective_from', s.effective_from,
    'plan_by', coalesce(s.plan_by,'08:45'::time),
    'summary_by', coalesce(s.summary_by,'18:00'::time),
    'max_focus', coalesce(s.max_focus,3),
    'updated_at', s.updated_at,
    'can_use', public.k3_can(auth.uid(),'k3.use'),
    'can_view_scope', public.k3_can(auth.uid(),'k3.view_scope'),
    'can_comment', public.k3_can(auth.uid(),'k3.comment'),
    'can_settings', public.k3_can(auth.uid(),'k3.settings'),
    'today', (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  );
END$$;
CREATE FUNCTION public.k3_settings_save(_enabled boolean, _effective_from date, _plan_by time, _summary_by time, _max_focus smallint) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE old_row public.k3_settings;BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình 3K.'; END IF;
  IF _plan_by IS NULL OR _summary_by IS NULL THEN RAISE EXCEPTION 'Giờ lập 3K và giờ tổng kết không được trống.'; END IF;
  IF _max_focus IS NULL OR _max_focus NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Số mũi khoan tối đa phải từ 1 đến 5.'; END IF;
  IF _enabled AND _effective_from IS NULL THEN RAISE EXCEPTION 'Cần chọn ngày bắt đầu áp dụng trước khi bật 3K.'; END IF;
  SELECT * INTO old_row FROM public.k3_settings WHERE id=true;
  INSERT INTO public.k3_settings(id, enabled, effective_from, plan_by, summary_by, max_focus, updated_by, updated_at)
  VALUES (true, _enabled, _effective_from, _plan_by, _summary_by, _max_focus, auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET enabled=excluded.enabled, effective_from=excluded.effective_from, plan_by=excluded.plan_by, summary_by=excluded.summary_by, max_focus=excluded.max_focus, updated_by=excluded.updated_by, updated_at=excluded.updated_at;
  INSERT INTO public.k3_settings_log(changed_by, snapshot)
  VALUES (auth.uid(), jsonb_build_object('old', to_jsonb(old_row), 'new', jsonb_build_object('enabled',_enabled,'effective_from',_effective_from,'plan_by',_plan_by,'summary_by',_summary_by,'max_focus',_max_focus)));
  RETURN public.k3_settings_read();
END$$;
CREATE FUNCTION public.k3_day_read(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days;BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO d FROM public.k3_days WHERE user_id=auth.uid() AND work_date=_date;
  RETURN jsonb_build_object(
    'settings', public.k3_settings_read(),
    'day', CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
    'tasks', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.is_focus DESC, t.sort_order, t.start_time NULLS LAST, t.created_at) FROM public.k3_tasks t WHERE t.day_id=d.id),'[]'::jsonb) END,
    'comments', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at) FROM public.k3_comments c WHERE c.day_id=d.id),'[]'::jsonb) END
  );
END$$;
CREATE FUNCTION public.k3_day_save(_date date, _kg text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings; d public.k3_days; today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
  SELECT * INTO s FROM public.k3_settings WHERE id=true;
  IF NOT coalesce(s.enabled,false) THEN RAISE EXCEPTION 'Module 3K chưa được kích hoạt.'; END IF;
  IF _date IS NULL OR (s.effective_from IS NOT NULL AND _date < s.effective_from) THEN RAISE EXCEPTION 'Ngày thực hiện nằm ngoài thời gian áp dụng 3K.'; END IF;
  IF _date > today + 1 THEN RAISE EXCEPTION 'Chỉ lập 3K cho hôm nay hoặc ngày kế tiếp.'; END IF;
  INSERT INTO public.k3_days(user_id, work_date, kg, planned_at)
  VALUES (auth.uid(), _date, nullif(btrim(coalesce(_kg,'')),''), now())
  ON CONFLICT (user_id, work_date) DO UPDATE SET kg=excluded.kg, updated_at=now()
  RETURNING * INTO d;
  INSERT INTO public.k3_task_events(day_id, actor_id, action, detail) VALUES (d.id, auth.uid(), 'plan', jsonb_build_object('kg', d.kg));
  RETURN to_jsonb(d);
END$$;
CREATE FUNCTION public.k3_task_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.k3_settings; d public.k3_days; old public.k3_tasks; new_row public.k3_tasks;
  _id uuid:=nullif(_payload->>'id','')::uuid; _date date:=(_payload->>'work_date')::date;
  _name text:=btrim(coalesce(_payload->>'name','')); _status text:=coalesce(_payload->>'status','todo');
  _target numeric:=nullif(_payload->>'kpi_target','')::numeric; _actual numeric:=nullif(_payload->>'kpi_actual','')::numeric;
  _progress int:=coalesce(nullif(_payload->>'progress','')::int,0); _focus boolean:=coalesce((_payload->>'is_focus')::boolean,false);
  today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
  SELECT * INTO s FROM public.k3_settings WHERE id=true;
  IF NOT coalesce(s.enabled,false) THEN RAISE EXCEPTION 'Module 3K chưa được kích hoạt.'; END IF;
  IF _date IS NULL OR (s.effective_from IS NOT NULL AND _date < s.effective_from) OR _date > today + 1 THEN RAISE EXCEPTION 'Ngày thực hiện không hợp lệ.'; END IF;
  IF _name='' THEN RAISE EXCEPTION 'Tên công việc không được trống.'; END IF;
  IF _status NOT IN ('todo','doing','done','paused','incomplete') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF _target IS NOT NULL AND _target < 0 THEN RAISE EXCEPTION 'Chỉ tiêu không được âm.'; END IF;
  IF _actual IS NOT NULL AND _actual < 0 THEN RAISE EXCEPTION 'Kết quả thực tế không được âm.'; END IF;
  IF _progress NOT BETWEEN 0 AND 100 THEN RAISE EXCEPTION 'Tiến độ phải từ 0 đến 100.'; END IF;
  IF _target IS NOT NULL AND _target > 0 AND _actual IS NOT NULL THEN _progress:=least(100, round(_actual/_target*100)); END IF;
  IF _status='done' THEN _progress:=100; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3task'), hashtext(auth.uid()::text || _date::text));
  INSERT INTO public.k3_days(user_id, work_date, planned_at) VALUES (auth.uid(), _date, now())
  ON CONFLICT (user_id, work_date) DO NOTHING RETURNING * INTO d;
  IF d.id IS NULL THEN SELECT * INTO d FROM public.k3_days WHERE user_id=auth.uid() AND work_date=_date; END IF;
  IF _focus AND (SELECT count(*) FROM public.k3_tasks t WHERE t.day_id=d.id AND t.is_focus AND t.id IS DISTINCT FROM _id) >= coalesce(s.max_focus,3) THEN
    RAISE EXCEPTION 'Mỗi ngày chỉ chọn tối đa % công việc trọng tâm.', coalesce(s.max_focus,3);
  END IF;
  IF _id IS NULL THEN
    INSERT INTO public.k3_tasks(day_id, user_id, work_date, name, start_time, end_time, kpi_target, kpi_unit, kpi_actual, progress, status, is_focus, how, place, links, note, problem, cause, solution, sort_order, created_by, updated_by)
    VALUES (d.id, auth.uid(), _date, _name, nullif(_payload->>'start_time','')::time, nullif(_payload->>'end_time','')::time, _target, nullif(btrim(coalesce(_payload->>'kpi_unit','')),''), _actual, _progress, _status, _focus, nullif(btrim(coalesce(_payload->>'how','')),''), nullif(btrim(coalesce(_payload->>'place','')),''), _payload->'links', nullif(btrim(coalesce(_payload->>'note','')),''), nullif(btrim(coalesce(_payload->>'problem','')),''), nullif(btrim(coalesce(_payload->>'cause','')),''), nullif(btrim(coalesce(_payload->>'solution','')),''), coalesce((_payload->>'sort_order')::int,0), auth.uid(), auth.uid())
    RETURNING * INTO new_row;
    INSERT INTO public.k3_task_events(day_id, task_id, actor_id, action, detail) VALUES (d.id, new_row.id, auth.uid(), 'create', jsonb_build_object('after', to_jsonb(new_row)));
  ELSE
    SELECT * INTO old FROM public.k3_tasks WHERE id=_id;
    IF old.id IS NULL OR old.user_id<>auth.uid() THEN RAISE EXCEPTION 'Bạn không được chỉnh sửa công việc của người khác.'; END IF;
    UPDATE public.k3_tasks SET name=_name, start_time=nullif(_payload->>'start_time','')::time, end_time=nullif(_payload->>'end_time','')::time, kpi_target=_target, kpi_unit=nullif(btrim(coalesce(_payload->>'kpi_unit','')),''), kpi_actual=_actual, progress=_progress, status=_status, is_focus=_focus, how=nullif(btrim(coalesce(_payload->>'how','')),''), place=nullif(btrim(coalesce(_payload->>'place','')),''), links=_payload->'links', note=nullif(btrim(coalesce(_payload->>'note','')),''), problem=nullif(btrim(coalesce(_payload->>'problem','')),''), cause=nullif(btrim(coalesce(_payload->>'cause','')),''), solution=nullif(btrim(coalesce(_payload->>'solution','')),''), updated_by=auth.uid(), updated_at=now()
    WHERE id=_id RETURNING * INTO new_row;
    INSERT INTO public.k3_task_events(day_id, task_id, actor_id, action, detail) VALUES (d.id, _id, auth.uid(), 'update', jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new_row)));
  END IF;
  RETURN to_jsonb(new_row);
END$$;
CREATE FUNCTION public.k3_task_update(_id uuid, _status text, _kpi_actual numeric, _progress int, _problem text, _cause text, _solution text, _note text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE old public.k3_tasks; new_row public.k3_tasks;BEGIN
  SELECT * INTO old FROM public.k3_tasks WHERE id=_id;
  IF old.id IS NULL OR old.user_id<>auth.uid() THEN RAISE EXCEPTION 'Bạn không được cập nhật công việc của người khác.'; END IF;
  IF _status NOT IN ('todo','doing','done','paused','incomplete') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF _kpi_actual IS NOT NULL AND _kpi_actual < 0 THEN RAISE EXCEPTION 'Kết quả thực tế không được âm.'; END IF;
  IF old.kpi_target IS NOT NULL AND old.kpi_target > 0 AND _kpi_actual IS NOT NULL THEN _progress:=least(100, round(_kpi_actual/old.kpi_target*100));
  ELSIF _progress IS NULL THEN _progress:=old.progress; END IF;
  IF _progress NOT BETWEEN 0 AND 100 THEN RAISE EXCEPTION 'Tiến độ phải từ 0 đến 100.'; END IF;
  IF _status='done' THEN _progress:=100; END IF;
  UPDATE public.k3_tasks SET status=_status, kpi_actual=coalesce(_kpi_actual, kpi_actual), progress=_progress, problem=nullif(btrim(coalesce(_problem,'')),''), cause=nullif(btrim(coalesce(_cause,'')),''), solution=nullif(btrim(coalesce(_solution,'')),''), note=coalesce(nullif(btrim(coalesce(_note,'')),''), note), updated_by=auth.uid(), updated_at=now()
  WHERE id=_id RETURNING * INTO new_row;
  INSERT INTO public.k3_task_events(day_id, task_id, actor_id, action, detail) VALUES (old.day_id, _id, auth.uid(), 'progress', jsonb_build_object('before', jsonb_build_object('status',old.status,'kpi_actual',old.kpi_actual,'progress',old.progress), 'after', jsonb_build_object('status',new_row.status,'kpi_actual',new_row.kpi_actual,'progress',new_row.progress)));
  RETURN to_jsonb(new_row);
END$$;
CREATE FUNCTION public.k3_task_delete(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE old public.k3_tasks;BEGIN
  SELECT * INTO old FROM public.k3_tasks WHERE id=_id;
  IF old.id IS NULL OR old.user_id<>auth.uid() THEN RAISE EXCEPTION 'Bạn không được xóa công việc của người khác.'; END IF;
  INSERT INTO public.k3_task_events(day_id, task_id, actor_id, action, detail) VALUES (old.day_id, old.id, auth.uid(), 'delete', jsonb_build_object('before', to_jsonb(old)));
  DELETE FROM public.k3_tasks WHERE id=_id;
  RETURN true;
END$$;
CREATE FUNCTION public.k3_summary_confirm(_date date) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; missing text; counts jsonb;BEGIN
  SELECT * INTO d FROM public.k3_days WHERE user_id=auth.uid() AND work_date=_date;
  IF d.id IS NULL THEN RAISE EXCEPTION 'Chưa có 3K cho ngày này.'; END IF;
  SELECT string_agg(t.name, '; ') INTO missing FROM public.k3_tasks t WHERE t.day_id=d.id AND t.status<>'done' AND (btrim(coalesce(t.problem,''))='' OR btrim(coalesce(t.cause,''))='' OR btrim(coalesce(t.solution,''))='');
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'Công việc chưa hoàn thành cần đủ Vấn đề - Nguyên nhân - Giải pháp: %', missing; END IF;
  SELECT jsonb_build_object('total', count(*), 'done', count(*) FILTER (WHERE status='done'), 'focus', count(*) FILTER (WHERE is_focus), 'focus_done', count(*) FILTER (WHERE is_focus AND status='done'), 'issues', count(*) FILTER (WHERE status<>'done')) INTO counts FROM public.k3_tasks t WHERE t.day_id=d.id;
  UPDATE public.k3_days SET summarized_at=coalesce(summarized_at, now()), updated_at=now() WHERE id=d.id RETURNING * INTO d;
  INSERT INTO public.k3_task_events(day_id, actor_id, action, detail) VALUES (d.id, auth.uid(), 'summary', counts);
  RETURN to_jsonb(d);
END$$;
CREATE FUNCTION public.k3_team_read(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings;BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K trong phạm vi quản lý.'; END IF;
  SELECT * INTO s FROM public.k3_settings WHERE id=true;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
      'user_id', u.user_id, 'full_name', p.full_name,
      'departments', u.departments,
      'day', CASE WHEN d.id IS NULL THEN NULL ELSE jsonb_build_object('id',d.id,'kg',d.kg,'planned_at',d.planned_at,'summarized_at',d.summarized_at) END,
      'total', coalesce(c.total,0), 'done', coalesce(c.done,0), 'open', coalesce(c.total,0)-coalesce(c.done,0),
      'issues', coalesce(c.issues,0), 'focus', coalesce(c.focus,0)
    ) ORDER BY p.full_name)
    FROM (SELECT DISTINCT m.user_id, array_agg(DISTINCT dep.name) departments FROM public.biz_department_members m JOIN public.biz_departments dep ON dep.id=m.department_id WHERE m.user_id<>auth.uid() AND public.biz_scope_ok(auth.uid(), m.user_id, m.department_id) GROUP BY m.user_id) u
    JOIN public.profiles p ON p.id=u.user_id AND p.status='Đang hoạt động'
    LEFT JOIN public.k3_days d ON d.user_id=u.user_id AND d.work_date=_date
    LEFT JOIN LATERAL (SELECT count(*) total, count(*) FILTER (WHERE t.status='done') done, count(*) FILTER (WHERE t.status<>'done' AND (btrim(coalesce(t.problem,''))<>'' OR btrim(coalesce(t.solution,''))<>'')) issues, count(*) FILTER (WHERE t.is_focus) focus FROM public.k3_tasks t WHERE t.day_id=d.id) c ON true
  ),'[]'::jsonb);
END$$;
CREATE FUNCTION public.k3_user_day_read(_user uuid, _date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days;BEGIN
  IF _user<>auth.uid() AND NOT (public.k3_can(auth.uid(),'k3.view_scope') AND public.k3_scope_ok(auth.uid(),_user)) THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K của nhân viên này.'; END IF;
  SELECT * INTO d FROM public.k3_days WHERE user_id=_user AND work_date=_date;
  RETURN jsonb_build_object(
    'settings', public.k3_settings_read(),
    'user', (SELECT to_jsonb(p) FROM (SELECT id, full_name FROM public.profiles WHERE id=_user) p),
    'day', CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
    'tasks', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.is_focus DESC, t.sort_order, t.start_time NULLS LAST, t.created_at) FROM public.k3_tasks t WHERE t.day_id=d.id),'[]'::jsonb) END,
    'comments', CASE WHEN d.id IS NULL THEN '[]'::jsonb ELSE coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at) FROM public.k3_comments c WHERE c.day_id=d.id),'[]'::jsonb) END,
    'can_comment', public.k3_can(auth.uid(),'k3.comment') AND (_user=auth.uid() OR public.k3_scope_ok(auth.uid(),_user))
  );
END$$;
CREATE FUNCTION public.k3_comment_save(_day_id uuid, _task_id uuid, _body text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; c public.k3_comments;BEGIN
  SELECT * INTO d FROM public.k3_days WHERE id=_day_id;
  IF d.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy 3K.'; END IF;
  IF btrim(coalesce(_body,''))='' THEN RAISE EXCEPTION 'Nội dung nhận xét không được trống.'; END IF;
  IF d.user_id<>auth.uid() AND NOT (public.k3_can(auth.uid(),'k3.comment') AND public.k3_scope_ok(auth.uid(),d.user_id)) THEN RAISE EXCEPTION 'Bạn không có quyền nhận xét 3K này.'; END IF;
  INSERT INTO public.k3_comments(day_id, task_id, author_id, body) VALUES (_day_id, _task_id, auth.uid(), btrim(_body)) RETURNING * INTO c;
  RETURN to_jsonb(c);
END$$;
REVOKE ALL ON FUNCTION public.k3_can(uuid,text), public.k3_scope_ok(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_settings_read(), public.k3_settings_save(boolean,date,time,time,smallint), public.k3_day_read(date), public.k3_day_save(date,text), public.k3_task_save(jsonb), public.k3_task_update(uuid,text,numeric,int,text,text,text,text), public.k3_task_delete(uuid), public.k3_summary_confirm(date), public.k3_team_read(date), public.k3_user_day_read(uuid,date), public.k3_comment_save(uuid,uuid,text), public.k3_can(uuid,text), public.k3_scope_ok(uuid,uuid) TO authenticated;