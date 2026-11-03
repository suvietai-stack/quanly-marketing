ALTER TABLE public.k3_days ADD COLUMN data_revision bigint NOT NULL DEFAULT 0, ADD COLUMN confirmed_revision bigint, ADD COLUMN confirmed_at timestamptz, ADD COLUMN department_id uuid REFERENCES public.biz_departments(id), ADD COLUMN plan_deadline timestamptz, ADD COLUMN summary_deadline timestamptz;
ALTER TABLE public.k3_tasks ADD COLUMN revision bigint NOT NULL DEFAULT 0, ADD COLUMN request_key uuid, ADD COLUMN deleted_at timestamptz;
CREATE UNIQUE INDEX k3_task_request_key ON public.k3_tasks(user_id,request_key) WHERE request_key IS NOT NULL;
UPDATE public.k3_days d SET department_id=public.biz_department_at(d.user_id,d.work_date), confirmed_revision=CASE WHEN summarized_at IS NOT NULL THEN 0 END, confirmed_at=summarized_at, plan_deadline=(d.work_date+coalesce(s.plan_by,'08:45'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh', summary_deadline=(d.work_date+coalesce(s.summary_by,'18:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh' FROM (SELECT coalesce((SELECT plan_by FROM public.k3_settings WHERE id), '08:45'::time) plan_by, coalesce((SELECT summary_by FROM public.k3_settings WHERE id),'18:00'::time) summary_by) s;
CREATE TABLE public.k3_summary_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), day_id uuid NOT NULL REFERENCES public.k3_days(id), revision bigint NOT NULL, confirmed_at timestamptz NOT NULL DEFAULT now(), actor_id uuid NOT NULL, snapshot jsonb NOT NULL, UNIQUE(day_id,revision));
GRANT SELECT ON public.k3_summary_versions TO authenticated;
GRANT ALL ON public.k3_summary_versions TO service_role;
ALTER TABLE public.k3_summary_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_summary_own ON public.k3_summary_versions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=day_id AND d.user_id=auth.uid()));
CREATE FUNCTION private.k3_write_guard(_date date) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings; BEGIN
 IF auth.uid() IS NULL OR NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
 SELECT * INTO s FROM public.k3_settings WHERE id FOR SHARE;
 IF NOT coalesce(s.enabled,false) THEN RAISE EXCEPTION 'Module 3K đang tạm khóa, chỉ được xem lịch sử.'; END IF;
 IF _date IS NULL OR s.effective_from IS NULL OR _date<s.effective_from THEN RAISE EXCEPTION 'Ngày thực hiện nằm ngoài thời gian áp dụng 3K.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 END$$;
REVOKE ALL ON FUNCTION private.k3_write_guard(date) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_day_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings; BEGIN
 IF TG_OP='INSERT' THEN SELECT * INTO s FROM public.k3_settings WHERE id; NEW.department_id:=public.biz_department_at(NEW.user_id,NEW.work_date); NEW.plan_deadline:=(NEW.work_date+coalesce(s.plan_by,'08:45'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh'; NEW.summary_deadline:=(NEW.work_date+coalesce(s.summary_by,'18:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh';
 ELSIF NEW.kg IS DISTINCT FROM OLD.kg THEN NEW.data_revision:=OLD.data_revision+1; END IF;
 RETURN NEW; END$$;
CREATE TRIGGER k3_day_integrity BEFORE INSERT OR UPDATE ON public.k3_days FOR EACH ROW EXECUTE FUNCTION private.k3_day_guard();
CREATE FUNCTION private.k3_task_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; BEGIN
 SELECT * INTO d FROM public.k3_days WHERE id=NEW.day_id FOR UPDATE;
 IF d.id IS NULL OR d.user_id<>NEW.user_id OR d.work_date<>NEW.work_date THEN RAISE EXCEPTION 'Công việc không khớp ngày gốc hoặc chủ sở hữu.'; END IF;
 IF TG_OP='UPDATE' AND (NEW.day_id<>OLD.day_id OR NEW.work_date<>OLD.work_date OR NEW.user_id<>OLD.user_id) THEN RAISE EXCEPTION 'Không được đổi ngày hoặc chủ sở hữu qua cập nhật công việc.'; END IF;
 IF NEW.kpi_target<0 OR NEW.kpi_actual<0 THEN RAISE EXCEPTION 'KPI không được âm.'; END IF;
 IF NEW.kpi_target>0 THEN NEW.progress:=least(100,round(coalesce(NEW.kpi_actual,0)/NEW.kpi_target*100)); END IF;
 IF NEW.status='done' AND ((NEW.kpi_target>0 AND coalesce(NEW.kpi_actual,0)<NEW.kpi_target) OR (coalesce(NEW.kpi_target,0)<=0 AND NEW.progress<100)) THEN RAISE EXCEPTION 'Chưa đạt chỉ tiêu hoàn thành. Hãy ghi nhận Kết thúc – Chưa đạt chỉ tiêu.'; END IF;
 IF NEW.status='incomplete' AND (btrim(coalesce(NEW.problem,''))='' OR btrim(coalesce(NEW.cause,''))='' OR btrim(coalesce(NEW.solution,''))='') THEN RAISE EXCEPTION 'Kết thúc chưa đạt cần đủ Vấn đề - Nguyên nhân - Giải pháp.'; END IF;
 IF TG_OP='UPDATE' THEN NEW.revision:=OLD.revision+1; END IF;
 RETURN NEW; END$$;
CREATE TRIGGER k3_task_integrity BEFORE INSERT OR UPDATE ON public.k3_tasks FOR EACH ROW EXECUTE FUNCTION private.k3_task_guard();
CREATE FUNCTION private.k3_task_revision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF TG_OP='INSERT' OR (to_jsonb(NEW)-ARRAY['revision','updated_at','updated_by','note','links','how','place','sort_order']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['revision','updated_at','updated_by','note','links','how','place','sort_order']) THEN UPDATE public.k3_days SET data_revision=data_revision+1 WHERE id=NEW.day_id; END IF;
 RETURN NEW; END$$;
CREATE TRIGGER k3_task_revision AFTER INSERT OR UPDATE ON public.k3_tasks FOR EACH ROW EXECUTE FUNCTION private.k3_task_revision();
CREATE OR REPLACE FUNCTION public.k3_day_save(_date date,_kg text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; BEGIN
 PERFORM private.k3_write_guard(_date);
 INSERT INTO public.k3_days(user_id,work_date,kg,planned_at) VALUES(auth.uid(),_date,nullif(btrim(coalesce(_kg,'')),''),now()) ON CONFLICT(user_id,work_date) DO UPDATE SET kg=excluded.kg,updated_at=now() RETURNING * INTO d;
 INSERT INTO public.k3_task_events(day_id,actor_id,action,detail) VALUES(d.id,auth.uid(),'plan',jsonb_build_object('kg',d.kg)); RETURN to_jsonb(d); END$$;
CREATE OR REPLACE FUNCTION public.k3_task_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings; d public.k3_days; old public.k3_tasks; t public.k3_tasks; _id uuid:=nullif(_payload->>'id','')::uuid; _date date:=nullif(_payload->>'work_date','')::date; _key uuid:=nullif(_payload->>'request_key','')::uuid; p jsonb:=_payload; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 IF _id IS NOT NULL THEN SELECT * INTO old FROM public.k3_tasks WHERE id=_id FOR UPDATE;
  IF old.id IS NULL OR old.user_id<>auth.uid() OR old.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Bạn không được chỉnh sửa công việc của người khác.'; END IF;
  IF _date IS NOT NULL AND _date<>old.work_date THEN RAISE EXCEPTION 'Công việc phải được cập nhật đúng ngày gốc.'; END IF;
  IF p ? 'revision' AND (p->>'revision')::bigint<>old.revision THEN RAISE EXCEPTION 'Công việc đã được cập nhật ở nơi khác. Vui lòng tải lại.'; END IF;
  _date:=old.work_date; p:=to_jsonb(old)||p;
 ELSE IF _key IS NOT NULL THEN SELECT * INTO t FROM public.k3_tasks WHERE user_id=auth.uid() AND request_key=_key; IF t.id IS NOT NULL THEN RETURN to_jsonb(t); END IF; END IF; END IF;
 PERFORM private.k3_write_guard(_date);
 SELECT * INTO s FROM public.k3_settings WHERE id;
 IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên công việc không được trống.'; END IF;
 INSERT INTO public.k3_days(user_id,work_date,planned_at) VALUES(auth.uid(),_date,now()) ON CONFLICT(user_id,work_date) DO NOTHING;
 SELECT * INTO d FROM public.k3_days WHERE user_id=auth.uid() AND work_date=_date FOR UPDATE;
 IF coalesce((p->>'is_focus')::boolean,false) AND (SELECT count(*) FROM public.k3_tasks WHERE day_id=d.id AND is_focus AND deleted_at IS NULL AND id IS DISTINCT FROM _id)>=coalesce(s.max_focus,3) THEN RAISE EXCEPTION 'Mỗi ngày chỉ chọn tối đa % công việc trọng tâm.',coalesce(s.max_focus,3); END IF;
 IF _id IS NULL THEN
 INSERT INTO public.k3_tasks(day_id,user_id,work_date,name,start_time,end_time,kpi_target,kpi_unit,kpi_actual,progress,status,is_focus,how,place,links,note,problem,cause,solution,sort_order,created_by,updated_by,request_key)
 VALUES(d.id,auth.uid(),_date,btrim(p->>'name'),nullif(p->>'start_time','')::time,nullif(p->>'end_time','')::time,nullif(p->>'kpi_target','')::numeric,nullif(btrim(p->>'kpi_unit'),''),nullif(p->>'kpi_actual','')::numeric,coalesce(nullif(p->>'progress','')::int,0),coalesce(p->>'status','todo'),coalesce((p->>'is_focus')::boolean,false),nullif(btrim(p->>'how'),''),nullif(btrim(p->>'place'),''),p->'links',nullif(btrim(p->>'note'),''),nullif(btrim(p->>'problem'),''),nullif(btrim(p->>'cause'),''),nullif(btrim(p->>'solution'),''),coalesce((p->>'sort_order')::int,0),auth.uid(),auth.uid(),_key) RETURNING * INTO t;
 ELSE UPDATE public.k3_tasks SET name=btrim(p->>'name'),start_time=nullif(p->>'start_time','')::time,end_time=nullif(p->>'end_time','')::time,kpi_target=nullif(p->>'kpi_target','')::numeric,kpi_unit=nullif(btrim(p->>'kpi_unit'),''),kpi_actual=nullif(p->>'kpi_actual','')::numeric,progress=coalesce(nullif(p->>'progress','')::int,0),status=p->>'status',is_focus=coalesce((p->>'is_focus')::boolean,false),how=nullif(btrim(p->>'how'),''),place=nullif(btrim(p->>'place'),''),links=p->'links',note=nullif(btrim(p->>'note'),''),problem=nullif(btrim(p->>'problem'),''),cause=nullif(btrim(p->>'cause'),''),solution=nullif(btrim(p->>'solution'),''),updated_at=now(),updated_by=auth.uid() WHERE id=_id RETURNING * INTO t; END IF;
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(d.id,t.id,auth.uid(),CASE WHEN _id IS NULL THEN 'create' ELSE 'update' END,jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(t))); RETURN to_jsonb(t); END$$;
CREATE OR REPLACE FUNCTION public.k3_task_update(_id uuid,_status text,_kpi_actual numeric,_progress int,_problem text,_cause text,_solution text,_note text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE t public.k3_tasks; BEGIN
 SELECT * INTO t FROM public.k3_tasks WHERE id=_id;
 IF t.id IS NULL OR t.user_id<>auth.uid() THEN RAISE EXCEPTION 'Bạn không được cập nhật công việc của người khác.'; END IF;
 RETURN public.k3_task_save(jsonb_build_object('id',_id,'revision',t.revision,'work_date',t.work_date,'status',_status,'kpi_actual',coalesce(_kpi_actual,t.kpi_actual),'progress',coalesce(_progress,t.progress),'problem',_problem,'cause',_cause,'solution',_solution,'note',coalesce(nullif(btrim(_note),''),t.note))); END$$;
CREATE OR REPLACE FUNCTION public.k3_task_delete(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE t public.k3_tasks; BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text)); SELECT * INTO t FROM public.k3_tasks WHERE id=_id FOR UPDATE;
 IF t.id IS NULL OR t.user_id<>auth.uid() THEN RAISE EXCEPTION 'Bạn không được xóa công việc của người khác.'; END IF;
 PERFORM private.k3_write_guard(t.work_date);
 IF t.deleted_at IS NOT NULL THEN RETURN true; END IF;
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(t.day_id,t.id,auth.uid(),'delete',jsonb_build_object('before',to_jsonb(t)));
 UPDATE public.k3_tasks SET deleted_at=now(),updated_at=now(),updated_by=auth.uid() WHERE id=t.id; RETURN true; END$$;
CREATE OR REPLACE FUNCTION public.k3_summary_confirm(_date date) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; missing text; snap jsonb; BEGIN
 PERFORM private.k3_write_guard(_date); IF _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Chưa thể tổng kết ngày tương lai.'; END IF;
 SELECT * INTO d FROM public.k3_days WHERE user_id=auth.uid() AND work_date=_date FOR UPDATE;
 IF d.id IS NULL THEN RAISE EXCEPTION 'Chưa có 3K cho ngày này.'; END IF;
 SELECT string_agg(name,'; ') INTO missing FROM public.k3_tasks WHERE day_id=d.id AND deleted_at IS NULL AND status<>'done' AND (btrim(coalesce(problem,''))='' OR btrim(coalesce(cause,''))='' OR btrim(coalesce(solution,''))='');
 IF missing IS NOT NULL THEN RAISE EXCEPTION 'Công việc chưa hoàn thành cần đủ Vấn đề - Nguyên nhân - Giải pháp: %',missing; END IF;
 IF d.confirmed_revision IS NOT DISTINCT FROM d.data_revision AND EXISTS(SELECT 1 FROM public.k3_summary_versions WHERE day_id=d.id AND revision=d.data_revision) THEN RETURN to_jsonb(d); END IF;
 snap:=jsonb_build_object('kg',d.kg,'tasks',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.k3_tasks t WHERE day_id=d.id AND deleted_at IS NULL),'[]'::jsonb));
 INSERT INTO public.k3_summary_versions(day_id,revision,actor_id,snapshot) VALUES(d.id,d.data_revision,auth.uid(),snap) ON CONFLICT(day_id,revision) DO NOTHING;
 UPDATE public.k3_days SET summarized_at=coalesce(summarized_at,now()),confirmed_at=now(),confirmed_revision=data_revision,updated_at=now() WHERE id=d.id RETURNING * INTO d;
 INSERT INTO public.k3_task_events(day_id,actor_id,action,detail) VALUES(d.id,auth.uid(),'summary',jsonb_build_object('revision',d.data_revision,'snapshot',snap)); RETURN to_jsonb(d); END$$;
CREATE FUNCTION public.k3_day_scope_ok(_actor uuid,_day uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT EXISTS(SELECT 1 FROM public.k3_days d WHERE d.id=_day AND _actor IS NOT NULL AND ((_actor=d.user_id AND public.k3_can(_actor,'k3.use')) OR (public.k3_can(_actor,'k3.view_scope') AND public.biz_scope_ok(_actor,d.user_id,d.department_id,(d.work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))))$$;
CREATE OR REPLACE FUNCTION public.k3_user_day_read(_user uuid,_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF; SELECT * INTO d FROM public.k3_days WHERE user_id=_user AND work_date=_date;
 IF (_user=auth.uid() AND NOT public.k3_can(auth.uid(),'k3.use')) OR (_user<>auth.uid() AND NOT (public.k3_can(auth.uid(),'k3.view_scope') AND CASE WHEN d.id IS NOT NULL THEN public.k3_day_scope_ok(auth.uid(),d.id) ELSE public.biz_scope_ok(auth.uid(),_user,public.biz_department_at(_user,_date),(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END)) THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K của nhân viên này.'; END IF;
 RETURN jsonb_build_object('settings',public.k3_settings_read(),'user',(SELECT jsonb_build_object('id',id,'full_name',full_name) FROM public.profiles WHERE id=_user),'day',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
 'tasks',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY is_focus DESC,sort_order,start_time NULLS LAST,created_at) FROM public.k3_tasks t WHERE day_id=d.id AND deleted_at IS NULL),'[]'::jsonb),
 'comments',coalesce((SELECT jsonb_agg(to_jsonb(c)||jsonb_build_object('author_name',p.full_name) ORDER BY c.created_at) FROM public.k3_comments c LEFT JOIN public.profiles p ON p.id=c.author_id WHERE c.day_id=d.id),'[]'::jsonb),
 'events',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM (SELECT * FROM public.k3_task_events WHERE day_id=d.id ORDER BY created_at DESC LIMIT 100) e),'[]'::jsonb),
 'summaries',coalesce((SELECT jsonb_agg(to_jsonb(v) ORDER BY confirmed_at DESC) FROM public.k3_summary_versions v WHERE day_id=d.id),'[]'::jsonb),'can_comment',d.id IS NOT NULL AND public.k3_can(auth.uid(),'k3.comment') AND public.k3_day_scope_ok(auth.uid(),d.id)); END$$;
CREATE OR REPLACE FUNCTION public.k3_day_read(_date date) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT public.k3_user_day_read(auth.uid(),_date)$$;
CREATE OR REPLACE FUNCTION public.k3_comment_save(_day_id uuid,_task_id uuid,_body text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE d public.k3_days; c public.k3_comments; BEGIN
 SELECT * INTO d FROM public.k3_days WHERE id=_day_id;
 IF d.id IS NULL OR auth.uid() IS NULL OR NOT public.k3_can(auth.uid(),'k3.comment') OR NOT public.k3_day_scope_ok(auth.uid(),d.id) THEN RAISE EXCEPTION 'Bạn không có quyền nhận xét 3K này.'; END IF;
 IF NOT coalesce((SELECT enabled FROM public.k3_settings WHERE id),false) THEN RAISE EXCEPTION 'Module 3K đang tạm khóa.'; END IF;
 IF _task_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.k3_tasks WHERE id=_task_id AND day_id=d.id AND user_id=d.user_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Công việc nhận xét không thuộc đúng nhân viên và ngày.'; END IF;
 IF btrim(coalesce(_body,''))='' THEN RAISE EXCEPTION 'Nội dung nhận xét không được trống.'; END IF;
 INSERT INTO public.k3_comments(day_id,task_id,author_id,body) VALUES(d.id,_task_id,auth.uid(),btrim(_body)) RETURNING * INTO c; RETURN to_jsonb(c); END$$;
CREATE OR REPLACE FUNCTION public.k3_team_read(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF NOT public.k3_can(auth.uid(),'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K trong phạm vi quản lý.'; END IF;
 RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',p.id,'full_name',p.full_name,'departments',jsonb_build_array(dep.name),'day',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,'total',c.total,'done',c.done,'open',c.total-c.done,'issues',c.issues,'focus',c.focus) ORDER BY p.full_name)
 FROM public.profiles p LEFT JOIN public.k3_days d ON d.user_id=p.id AND d.work_date=_date LEFT JOIN public.biz_departments dep ON dep.id=coalesce(d.department_id,public.biz_department_at(p.id,_date))
 LEFT JOIN LATERAL(SELECT count(*) total,count(*) FILTER(WHERE status='done') done,count(*) FILTER(WHERE status<>'done' AND (btrim(coalesce(problem,''))<>'' OR btrim(coalesce(solution,''))<>'')) issues,count(*) FILTER(WHERE is_focus) focus FROM public.k3_tasks WHERE day_id=d.id AND deleted_at IS NULL) c ON true
 WHERE p.id<>auth.uid() AND CASE WHEN d.id IS NOT NULL THEN public.k3_day_scope_ok(auth.uid(),d.id) ELSE p.status='Đang hoạt động' AND dep.id IS NOT NULL AND public.biz_scope_ok(auth.uid(),p.id,dep.id,(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END),'[]'::jsonb); END$$;
REVOKE ALL ON FUNCTION public.k3_day_scope_ok(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_day_scope_ok(uuid,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.k3_settings_read(),public.k3_settings_save(boolean,date,time,time,smallint),public.k3_day_read(date),public.k3_day_save(date,text),public.k3_task_save(jsonb),public.k3_task_update(uuid,text,numeric,int,text,text,text,text),public.k3_task_delete(uuid),public.k3_summary_confirm(date),public.k3_team_read(date),public.k3_user_day_read(uuid,date),public.k3_comment_save(uuid,uuid,text) FROM PUBLIC,anon;