CREATE TABLE public.k3_employee_reviews(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,work_date date NOT NULL,actor_id uuid NOT NULL,revision bigint GENERATED ALWAYS AS IDENTITY,source_version text NOT NULL,snapshot jsonb NOT NULL,missing_acknowledged boolean NOT NULL DEFAULT false,request_key uuid NOT NULL,confirmed_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,request_key));
GRANT SELECT ON public.k3_employee_reviews TO authenticated; GRANT ALL ON public.k3_employee_reviews TO service_role;
ALTER TABLE public.k3_employee_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_employee_review_read ON public.k3_employee_reviews FOR SELECT TO authenticated USING(user_id=auth.uid() OR private.k3_result_detail_ok(auth.uid(),user_id,(snapshot->>'goal_id')::uuid,work_date));
CREATE FUNCTION private.k3_employee_day_source(_user uuid,_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE rows jsonb; acts jsonb; goals jsonb;
BEGIN
 SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id),'[]') INTO rows FROM k3_kpi_results r WHERE user_id=_user AND work_date=_date AND deleted_at IS NULL AND review_reason IS NULL AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN(r.kpi_id,r.action_id,r.goal_id));
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'goal_id',g.id,'name',a.name,'goal_name',to_jsonb(g)->>'name','assignee_id',a.assignee_id,'assignee_name',(SELECT full_name FROM profiles WHERE id=a.assignee_id),'due_date',a.due_date,'revision',to_jsonb(a)->'revision','updated',EXISTS(SELECT 1 FROM jsonb_array_elements(rows) r WHERE r->>'action_id'=a.id::text),'kpis',coalesce((SELECT jsonb_agg(to_jsonb(k) ORDER BY k.id) FROM k3_kpis k WHERE k.action_id=a.id AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id=k.id)),'[]')) ORDER BY g.id,a.id),'[]') INTO acts FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN(a.id,g.id)) AND (EXISTS(SELECT 1 FROM jsonb_array_elements(rows) r WHERE r->>'action_id'=a.id::text) OR (private.k3_action_worker_ok(_user,a.id) AND a.deleted_at IS NULL AND g.deleted_at IS NULL AND a.status NOT IN('draft','paused','cancelled','ended_missed') AND g.status NOT IN('draft','paused','cancelled','ended_missed') AND _date BETWEEN coalesce(a.start_date,g.period_start) AND g.period_end AND (a.start_date=_date OR EXISTS(SELECT 1 FROM k3_tasks t WHERE t.action_id=a.id AND t.user_id=_user AND t.deleted_at IS NULL AND NOT coalesce((to_jsonb(t)->>'is_unscheduled')::boolean,false) AND to_jsonb(t)->>'work_date'=_date::text))));
 SELECT coalesce(jsonb_agg(to_jsonb(k) ORDER BY k.id),'[]') INTO goals FROM k3_kpis k WHERE k.goal_id IS NOT NULL AND EXISTS(SELECT 1 FROM jsonb_array_elements(rows) r WHERE r->>'kpi_id'=k.id::text);
 RETURN jsonb_build_object('results',rows,'actions',acts,'goal_kpis',goals,'missing', (SELECT count(*) FROM jsonb_array_elements(acts) a WHERE NOT (a->>'updated')::boolean),'result_count',jsonb_array_length(rows),'action_count',jsonb_array_length(acts),'goal_count',(SELECT count(DISTINCT a->>'goal_id') FROM jsonb_array_elements(acts) a));
END $fn$;
REVOKE ALL ON FUNCTION private.k3_employee_day_source(uuid,date) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_employee_review_state(_user uuid,_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE s jsonb; r k3_employee_reviews; c k3_daily_closes; ver text;
BEGIN
 s:=private.k3_employee_day_source(_user,_date); ver:=md5(s::text);
 SELECT * INTO r FROM k3_employee_reviews WHERE user_id=_user AND work_date=_date ORDER BY revision DESC LIMIT 1;
 SELECT * INTO c FROM k3_daily_closes WHERE user_id=_user AND work_date=_date;
 RETURN s||jsonb_build_object('user_id',_user,'date',_date,'source_version',ver,'manual_status',CASE WHEN r.id IS NULL THEN 'none' WHEN r.source_version=ver THEN 'reviewed' ELSE 'reconfirm' END,'confirmed_at',r.confirmed_at,'confirmation_revision',r.revision,'closed_at',c.closed_at,'system_status',CASE WHEN c.id IS NULL THEN 'open' WHEN c.snapshot->'results' IS DISTINCT FROM s->'results' THEN 'adjusted' WHEN c.source='auto' THEN 'auto_closed' ELSE 'legacy_closed' END,'auto_close_time',(SELECT close_time FROM k3_automation_config WHERE id),'legacy_confirmation',EXISTS(SELECT 1 FROM k3_kpi_day_confirmations WHERE user_id=_user AND work_date=_date));
END $fn$;
REVOKE ALL ON FUNCTION private.k3_employee_review_state(uuid,date) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.k3_employee_review_read(_date date,_user uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=coalesce(_user,auth.uid()); s jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.k3_can(auth.uid(),CASE WHEN uid=auth.uid() THEN 'k3.use' ELSE 'k3.view_scope' END) THEN RAISE EXCEPTION 'Bạn không có quyền xem tổng kết.'; END IF;
 IF uid<>auth.uid() AND NOT public.biz_admin(auth.uid()) AND NOT public.biz_scope_ok(auth.uid(),uid,coalesce((SELECT department_id FROM k3_daily_closes WHERE user_id=uid AND work_date=_date),public.biz_department_at(uid,_date)),_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN RAISE EXCEPTION 'Nhân viên ngoài phạm vi.'; END IF;
 s:=private.k3_employee_review_state(uid,_date);
 RETURN s||jsonb_build_object('history',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'revision',revision,'source_version',source_version,'confirmed_at',confirmed_at,'actor_id',actor_id,'missing',snapshot->'missing') ORDER BY revision DESC) FROM k3_employee_reviews WHERE user_id=uid AND work_date=_date),'[]'));
END $fn$;
REVOKE ALL ON FUNCTION public.k3_employee_review_read(date,uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.k3_employee_review_read(date,uuid) TO authenticated;
CREATE FUNCTION public.k3_employee_review_confirm(_date date,_version text,_request_key uuid,_ack_missing boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); s jsonb; existing k3_employee_reviews;
BEGIN
 IF uid IS NULL OR NOT public.k3_can(uid,'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền tổng kết.'; END IF;
 IF _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date OR _request_key IS NULL THEN RAISE EXCEPTION 'Ngày hoặc mã yêu cầu không hợp lệ.'; END IF;
 PERFORM private.k3_write_guard(_date); PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(uid::text));
 SELECT * INTO existing FROM k3_employee_reviews WHERE user_id=uid AND request_key=_request_key;
 IF existing.id IS NOT NULL THEN IF existing.work_date<>_date THEN RAISE EXCEPTION 'Mã yêu cầu thuộc ngày khác.'; END IF; RETURN public.k3_employee_review_read(_date); END IF;
 s:=private.k3_employee_day_source(uid,_date);
 IF md5(s::text) IS DISTINCT FROM _version THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi ở nơi khác. Vui lòng rà soát lại.'; END IF;
 IF (s->>'missing')::int>0 AND NOT _ack_missing THEN RAISE EXCEPTION 'Cần xác nhận đã xem cảnh báo KF chưa cập nhật.'; END IF;
 INSERT INTO k3_employee_reviews(user_id,work_date,actor_id,source_version,snapshot,missing_acknowledged,request_key) VALUES(uid,_date,uid,_version,s,_ack_missing,_request_key);
 RETURN public.k3_employee_review_read(_date);
END $fn$;
REVOKE ALL ON FUNCTION public.k3_employee_review_confirm(date,text,uuid,boolean) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.k3_employee_review_confirm(date,text,uuid,boolean) TO authenticated;
CREATE FUNCTION private.k3_close_employee_review_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE s jsonb;
BEGIN
 s:=private.k3_employee_review_state(NEW.user_id,NEW.work_date);
 NEW.snapshot:=NEW.snapshot||jsonb_build_object('employee_review',jsonb_build_object('status',s->>'manual_status','confirmed_at',s->'confirmed_at','revision',s->'confirmation_revision','source_version',s->>'source_version'),'review_day',s,'actions',s->'actions'); RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION private.k3_close_employee_review_snapshot() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER k3_close_employee_review_snapshot BEFORE INSERT ON public.k3_daily_closes FOR EACH ROW EXECUTE FUNCTION private.k3_close_employee_review_snapshot();
COMMENT ON TABLE public.k3_employee_reviews IS 'Employee review only: never creates system close or historical KPI confirmations. No legacy records converted.';