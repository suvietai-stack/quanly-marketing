ALTER TABLE public.k3_goals ADD COLUMN start_time time, ADD COLUMN due_time time;
ALTER TABLE public.k3_actions ADD COLUMN start_time time, ADD COLUMN due_time time, ADD COLUMN inherit_timeline boolean NOT NULL DEFAULT false, ADD COLUMN execution_schedule jsonb NOT NULL DEFAULT '{"mode":"daily"}';
COMMENT ON COLUMN public.k3_goals.due_time IS 'Optional Vietnam deadline time; NULL means end of due_date, never midnight at its start.';
COMMENT ON COLUMN public.k3_actions.inherit_timeline IS 'New KFs inherit KG timeline explicitly; legacy date meanings remain unchanged.';
CREATE FUNCTION private.k3_timepoint(_date date,_time time,_deadline boolean DEFAULT false) RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$ SELECT (_date+coalesce(_time,CASE WHEN _deadline THEN time '23:59:59.999999' ELSE time '00:00' END)) AT TIME ZONE 'Asia/Ho_Chi_Minh' $$;
REVOKE ALL ON FUNCTION private.k3_timepoint(date,time,boolean) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_action_on_date(_action uuid,_date date) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT _date BETWEEN coalesce(CASE WHEN a.inherit_timeline THEN g.period_start ELSE a.start_date END,g.period_start) AND coalesce(CASE WHEN a.inherit_timeline THEN coalesce(g.due_date,g.period_end) ELSE a.due_date END,g.period_end)
 AND CASE coalesce(a.execution_schedule->>'mode','daily') WHEN 'daily' THEN true WHEN 'dates' THEN a.execution_schedule->'dates' ? _date::text WHEN 'weekdays' THEN EXISTS(SELECT 1 FROM jsonb_array_elements_text(a.execution_schedule->'weekdays') d WHERE d::int=extract(isodow FROM _date)::int) WHEN 'weekly' THEN extract(isodow FROM _date)=extract(isodow FROM coalesce(a.start_date,g.period_start)) ELSE false END
 FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE a.id=_action AND a.deleted_at IS NULL AND g.deleted_at IS NULL $$;
REVOKE ALL ON FUNCTION private.k3_action_on_date(uuid,date) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_timeline_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g k3_goals; s date; e date; st time; et time; mode text;
BEGIN
 IF TG_TABLE_NAME='k3_goals' THEN s:=NEW.period_start;e:=coalesce(NEW.due_date,NEW.period_end);st:=NEW.start_time;et:=NEW.due_time;
 ELSE
 SELECT * INTO g FROM k3_goals WHERE id=NEW.goal_id;
 s:=CASE WHEN NEW.inherit_timeline THEN g.period_start ELSE coalesce(NEW.start_date,g.period_start) END;e:=CASE WHEN NEW.inherit_timeline THEN coalesce(g.due_date,g.period_end) ELSE coalesce(NEW.due_date,g.period_end) END;
 st:=CASE WHEN NEW.inherit_timeline THEN g.start_time ELSE NEW.start_time END;et:=CASE WHEN NEW.inherit_timeline THEN g.due_time ELSE NEW.due_time END;
 IF private.k3_timepoint(s,st,false)<private.k3_timepoint(g.period_start,g.start_time,false) OR private.k3_timepoint(e,et,true)>private.k3_timepoint(coalesce(g.due_date,g.period_end),g.due_time,true) THEN RAISE EXCEPTION 'Thời gian KF nằm ngoài khoảng KG. Hãy chỉnh thời gian KF hoặc KG.'; END IF;
 mode:=coalesce(NEW.execution_schedule->>'mode','daily');
 IF mode NOT IN('daily','dates','weekdays','weekly') THEN RAISE EXCEPTION 'Lộ trình không hợp lệ.'; END IF;
 IF mode='dates' AND (jsonb_typeof(NEW.execution_schedule->'dates') IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.execution_schedule->'dates')=0) THEN RAISE EXCEPTION 'Chọn ít nhất một ngày thực hiện.'; END IF;
 IF mode='dates' AND EXISTS(SELECT 1 FROM jsonb_array_elements_text(NEW.execution_schedule->'dates') d WHERE d::date<s OR d::date>e) THEN RAISE EXCEPTION 'Ngày trong lộ trình nằm ngoài khoảng KF.'; END IF;
 IF mode='weekdays' AND (jsonb_typeof(NEW.execution_schedule->'weekdays') IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.execution_schedule->'weekdays')=0) THEN RAISE EXCEPTION 'Chọn thứ thực hiện.'; END IF;
 IF mode='weekdays' AND EXISTS(SELECT 1 FROM jsonb_array_elements_text(NEW.execution_schedule->'weekdays') d WHERE d::int NOT BETWEEN 1 AND 7) THEN RAISE EXCEPTION 'Thứ thực hiện không hợp lệ.'; END IF;
 IF nullif(NEW.execution_schedule->>'end_time','')::time < nullif(NEW.execution_schedule->>'start_time','')::time THEN RAISE EXCEPTION 'Giờ kết thúc lộ trình không được trước giờ bắt đầu.'; END IF;
 END IF;
 IF private.k3_timepoint(e,et,true)<private.k3_timepoint(s,st,false) THEN RAISE EXCEPTION 'Hạn hoàn thành không được trước thời điểm bắt đầu.'; END IF;
 IF (st IS NOT NULL AND extract(second FROM st)<>0) OR (et IS NOT NULL AND extract(second FROM et)<>0) THEN RAISE EXCEPTION 'Thời gian dự kiến chỉ chọn đến phút.'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.k3_timeline_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER k3_goal_timeline BEFORE INSERT OR UPDATE OF period_start,period_end,due_date,start_time,due_time ON public.k3_goals FOR EACH ROW EXECUTE FUNCTION private.k3_timeline_guard();
CREATE TRIGGER k3_action_timeline BEFORE INSERT OR UPDATE OF start_date,due_date,start_time,due_time,inherit_timeline,execution_schedule ON public.k3_actions FOR EACH ROW EXECUTE FUNCTION private.k3_timeline_guard();
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_goal_save(jsonb)'::regprocedure);
 def:=replace(def,'INSERT INTO public.k3_plan_events', $new$UPDATE public.k3_goals SET start_time=CASE WHEN p ? 'start_time' THEN nullif(p->>'start_time','')::time ELSE start_time END,due_time=CASE WHEN p ? 'due_time' THEN nullif(p->>'due_time','')::time ELSE due_time END WHERE id=g.id RETURNING * INTO g;
 INSERT INTO public.k3_plan_events$new$); EXECUTE def;
 def:=pg_get_functiondef('public.k3_action_save(jsonb)'::regprocedure);
 def:=replace(def,'INSERT INTO public.k3_plan_events', $new$UPDATE public.k3_actions SET start_time=CASE WHEN p ? 'start_time' THEN nullif(p->>'start_time','')::time ELSE start_time END,due_time=CASE WHEN p ? 'due_time' THEN nullif(p->>'due_time','')::time ELSE due_time END,inherit_timeline=coalesce((p->>'inherit_timeline')::boolean,CASE WHEN old.id IS NULL THEN true ELSE inherit_timeline END),execution_schedule=coalesce(p->'execution_schedule',execution_schedule) WHERE id=a.id RETURNING * INTO a;
 INSERT INTO public.k3_plan_events$new$); EXECUTE def;
 def:=pg_get_functiondef('public.k3_goal_list(text,text)'::regprocedure);
 def:=replace(def,$old$(_filter IN ('all','active','overdue','done') AND public.k3_goal_visible(auth.uid(),g.id))$old$,$new$(_filter IN ('all','active','overdue','done') AND (g.user_id=auth.uid() OR EXISTS(SELECT 1 FROM k3_actions pa WHERE pa.goal_id=g.id AND pa.deleted_at IS NULL AND private.k3_action_worker_ok(auth.uid(),pa.id))))$new$);
 def:=replace(def,$old$'due_date',g.due_date,$old$,$new$'due_date',g.due_date,'start_time',g.start_time,'due_time',g.due_time,$new$);
 def:=replace(def,$old$(_filter='scope' AND public.k3_can(auth.uid(),'k3.view_scope') AND g.user_id<>auth.uid() AND public.biz_scope_ok(auth.uid(),g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))$old$,$new$(_filter='scope' AND public.k3_can(auth.uid(),'k3.view_scope') AND g.user_id<>auth.uid() AND (public.biz_admin(auth.uid()) OR public.biz_scope_ok(auth.uid(),g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))))$new$); EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_day_read(date)'::regprocedure);
 def:=replace(def,'WHERE private.k3_action_worker_ok(uid,a.id)', 'WHERE private.k3_action_on_date(a.id,_date) AND private.k3_action_worker_ok(uid,a.id)'); EXECUTE def;
 def:=pg_get_functiondef('private.k3_employee_day_source(uuid,date)'::regprocedure);
 def:=replace(def,$old$(a.start_date=_date OR EXISTS(SELECT 1 FROM k3_tasks t WHERE t.action_id=a.id AND t.user_id=_user AND t.deleted_at IS NULL AND NOT coalesce((to_jsonb(t)->>'is_unscheduled')::boolean,false) AND to_jsonb(t)->>'work_date'=_date::text))$old$,$new$private.k3_action_on_date(a.id,_date)$new$); EXECUTE def;
 def:=pg_get_functiondef('public.k3_user_day_read(uuid,date)'::regprocedure);
 def:=replace(def,'AND coalesce(a.start_date, g.period_start) <= _date','AND private.k3_action_on_date(a.id,_date)'); EXECUTE def;
 def:=pg_get_functiondef('public.k3_restore(text,uuid)'::regprocedure);
 def:=replace(def,'stamp:=g.deleted_at;', $new$IF g.deleted_at+interval '15 days'<=now() THEN RAISE EXCEPTION 'Đã hết thời hạn khôi phục 15 ngày.'; END IF; stamp:=g.deleted_at;$new$);
 def:=replace(def,'stamp:=a.deleted_at;', $new$IF a.deleted_at+interval '15 days'<=now() THEN RAISE EXCEPTION 'Đã hết thời hạn khôi phục 15 ngày.'; END IF; stamp:=a.deleted_at;$new$);
 def:=replace(def,'UPDATE public.k3_tasks SET deleted_at=NULL', $new$IF t.deleted_at+interval '15 days'<=now() THEN RAISE EXCEPTION 'Đã hết thời hạn khôi phục 15 ngày.'; END IF; UPDATE public.k3_tasks SET deleted_at=NULL$new$); EXECUTE def;
END $patch$;
CREATE FUNCTION public.k3_draft_delete(_kind text,_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g k3_goals;a k3_actions;
BEGIN
 IF auth.uid() IS NULL OR NOT k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền xóa nháp.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 IF _kind='goal' THEN
 SELECT * INTO g FROM k3_goals WHERE id=_id FOR UPDATE;
 IF g.status IS DISTINCT FROM 'draft' THEN RAISE EXCEPTION 'Chỉ áp dụng Xóa bản nháp cho KG Nháp.'; END IF;
 IF EXISTS(SELECT 1 FROM k3_kpi_results WHERE goal_id=_id) OR private.k3_goal_has_official(_id) THEN RAISE EXCEPTION 'KG đã có kết quả hoặc lịch sử được bảo vệ; không thể xóa nháp.'; END IF;
 ELSIF _kind='action' THEN
 SELECT * INTO a FROM k3_actions WHERE id=_id FOR UPDATE;SELECT * INTO g FROM k3_goals WHERE id=a.goal_id FOR UPDATE;
 IF a.status IS DISTINCT FROM 'draft' AND g.status IS DISTINCT FROM 'draft' THEN RAISE EXCEPTION 'KF không thuộc bản nháp.'; END IF;
 IF EXISTS(SELECT 1 FROM k3_kpi_results WHERE action_id=_id) OR private.k3_action_has_official(_id) THEN RAISE EXCEPTION 'KF đã có kết quả hoặc lịch sử được bảo vệ; không thể xóa nháp.'; END IF;
 IF g.status<>'draft' AND NOT EXISTS(SELECT 1 FROM k3_actions WHERE goal_id=g.id AND id<>_id AND deleted_at IS NULL AND status<>'cancelled') THEN RAISE EXCEPTION 'Không được xóa KF duy nhất của KG đang thực hiện.'; END IF;
 ELSE RAISE EXCEPTION 'Loại bản nháp không hợp lệ.'; END IF;
 RETURN public.k3_soft_delete(_kind,_id);
END $$;
REVOKE ALL ON FUNCTION public.k3_draft_delete(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_draft_delete(text,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.k3_quick_create(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p jsonb:=_payload;key uuid:=nullif(p->>'request_key','')::uuid;g jsonb;gid uuid;kf jsonb;kpi jsonb;kid uuid;created_kf int:=0;start_now boolean:=coalesce((p->>'start_now')::boolean,false);members uuid[]:=coalesce((SELECT array_agg(value::uuid) FROM jsonb_array_elements_text(coalesce(p->'member_ids','[]'))),'{}');
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu tạo công việc.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 SELECT id INTO gid FROM k3_goals WHERE user_id=auth.uid() AND request_key=key;
 IF gid IS NOT NULL THEN RETURN jsonb_build_object('goal_id',gid,'duplicated',true); END IF;
 IF p->>'creation_mode'='basic' THEN
 kpi:=coalesce(p->'kpi','{}');kpi:=kpi||jsonb_build_object('name',coalesce(nullif(btrim(kpi->>'name'),''),p->>'name'),'measure',coalesce(kpi->>'measure','binary'));
 IF kpi->>'measure'='binary' AND nullif(btrim(kpi->'config'->>'valid_condition'),'') IS NULL THEN kpi:=kpi||jsonb_build_object('config',coalesce(kpi->'config','{}')||jsonb_build_object('valid_condition',p->>'expected_result')); END IF;
 p:=p||jsonb_build_object('kfs',jsonb_build_array(jsonb_build_object('name',p->>'name','inherit_timeline',true,'kpis',jsonb_build_array(kpi))));
 END IF;
 IF start_now AND jsonb_array_length(coalesce(p->'kfs','[]'))=0 THEN RAISE EXCEPTION 'Công việc bắt đầu cần ít nhất một KF.'; END IF;
 g:=public.k3_goal_save(p||jsonb_build_object('period_type','custom','status',CASE WHEN start_now THEN 'in_progress' ELSE 'draft' END));gid:=(g->>'id')::uuid;
 FOR kf IN SELECT * FROM jsonb_array_elements(coalesce(p->'kfs','[]')) LOOP
 kid:=(public.k3_action_save(kf||jsonb_build_object('request_key',coalesce(nullif(kf->>'request_key','')::uuid,gen_random_uuid()),'goal_id',gid,'name',coalesce(nullif(btrim(kf->>'name'),''),p->>'name'),'inherit_timeline',coalesce((kf->>'inherit_timeline')::boolean,true),'assignee_id',coalesce(nullif(kf->>'assignee_id',''),auth.uid()::text)))->>'id')::uuid;
 FOR kpi IN SELECT * FROM jsonb_array_elements(coalesce(kf->'kpis','[]')) LOOP
 kpi:=kpi||jsonb_build_object('name',coalesce(nullif(btrim(kpi->>'name'),''),kf->>'name',p->>'name'),'action_id',kid,'request_key',coalesce(nullif(kpi->>'request_key','')::uuid,gen_random_uuid()));
 IF kpi->>'measure'='binary' AND nullif(btrim(kpi->'config'->>'valid_condition'),'') IS NULL THEN kpi:=kpi||jsonb_build_object('config',coalesce(kpi->'config','{}')||jsonb_build_object('valid_condition',p->>'expected_result')); END IF;
 PERFORM public.k3_kpi_configure(kpi);
 END LOOP;
 IF start_now AND NOT EXISTS(SELECT 1 FROM k3_kpis WHERE action_id=kid) THEN RAISE EXCEPTION 'KF cần ít nhất một KPI hợp lệ.'; END IF;
 created_kf:=created_kf+1;
 END LOOP;
 IF cardinality(members)>0 THEN PERFORM public.k3_member_invite(gid,members); END IF;
 INSERT INTO k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(auth.uid(),gid,auth.uid(),'quick_create',jsonb_build_object('kf_count',created_kf,'start_now',start_now,'creation_mode',p->>'creation_mode'));
 RETURN jsonb_build_object('goal_id',gid,'kf_count',created_kf,'duplicated',false);
END $$;
DO $patch$ DECLARE def text; BEGIN def:=pg_get_functiondef('private.k3_validate_config(text,jsonb,numeric)'::regprocedure);def:=replace(def,'Cần điều kiện một kết quả hợp lệ.','Chưa có tiêu chí hoàn thành. Hãy bổ sung kết quả cần đạt hoặc điều kiện hoàn thành KPI.');EXECUTE def;END $patch$;