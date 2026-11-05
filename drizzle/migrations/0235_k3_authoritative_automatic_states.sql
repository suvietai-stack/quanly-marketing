ALTER TABLE public.k3_actions ADD COLUMN required boolean NOT NULL DEFAULT true;
COMMENT ON COLUMN public.k3_actions.required IS 'Required KF completion when KG has no required own result KPI; optional tracking KFs do not block.';
CREATE FUNCTION private.k3_metric_at(_kpi uuid,_at timestamptz) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k k3_kpis; rows jsonb;
BEGIN
 SELECT * INTO k FROM k3_kpis WHERE id=_kpi;
 SELECT coalesce(jsonb_agg(s.row||jsonb_build_object('acceptance',(SELECT a.decision FROM k3_kpi_acceptances a WHERE a.result_id=r.id AND a.result_revision=(s.row->>'revision')::bigint AND a.created_at<=_at ORDER BY a.created_at DESC,a.id DESC LIMIT 1))),'[]') INTO rows FROM private.k3_result_eligible(_kpi,false) r CROSS JOIN LATERAL (SELECT coalesce((SELECT v.snapshot FROM k3_kpi_result_versions v WHERE v.result_id=r.id AND v.created_at<=_at ORDER BY v.revision DESC LIMIT 1),CASE WHEN r.updated_at<=_at THEN to_jsonb(r) END) row) s WHERE s.row IS NOT NULL AND (s.row->>'work_date')::date<=(_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
 RETURN private.k3_measure_eval(to_jsonb(k),rows,(_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date);
END $fn$;
REVOKE ALL ON FUNCTION private.k3_metric_at(uuid,timestamptz) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_entity_state(_kind text,_id uuid,_at timestamptz DEFAULT now()) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE g k3_goals; a k3_actions; lifecycle text; starts timestamptz; deadline timestamptz; total int:=0; met int:=0; children int:=0; child_done int:=0; observations int:=0; result jsonb; state text; basis text;
BEGIN
 IF _kind='goal' THEN SELECT * INTO g FROM k3_goals WHERE id=_id AND deleted_at IS NULL; lifecycle:=g.status; starts:=private.k3_timepoint(g.period_start,g.start_time,false);deadline:=private.k3_timepoint(coalesce(g.due_date,g.period_end),g.due_time,true);
 ELSIF _kind='action' THEN SELECT * INTO a FROM k3_actions WHERE id=_id AND deleted_at IS NULL;SELECT * INTO g FROM k3_goals WHERE id=a.goal_id AND deleted_at IS NULL;lifecycle:=CASE WHEN g.status IN('draft','paused','cancelled','ended_missed') THEN g.status ELSE a.status END;
 starts:=private.k3_timepoint(CASE WHEN a.inherit_timeline THEN g.period_start ELSE coalesce(a.start_date,g.period_start) END,CASE WHEN a.inherit_timeline THEN g.start_time ELSE a.start_time END,false);deadline:=private.k3_timepoint(CASE WHEN a.inherit_timeline THEN coalesce(g.due_date,g.period_end) ELSE coalesce(a.due_date,g.period_end) END,CASE WHEN a.inherit_timeline THEN g.due_time ELSE a.due_time END,true);
 ELSE RAISE EXCEPTION 'Loại công việc không hợp lệ.'; END IF;
 IF g.id IS NULL THEN RETURN jsonb_build_object('status','draft','kpi_total',0,'kpi_met',0,'overdue',false,'review_required',true); END IF;
 FOR result IN SELECT private.k3_metric_at(k.id,_at) FROM k3_kpis k WHERE k.required AND CASE WHEN _kind='goal' THEN k.goal_id=_id ELSE k.action_id=_id END AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id=k.id) LOOP
 total:=total+1;met:=met+CASE WHEN (result->>'attained')::boolean IS TRUE THEN 1 ELSE 0 END;observations:=observations+coalesce((result->>'result_count')::int,0);
 END LOOP;
 basis:='own_kpis';
 IF _kind='goal' THEN
 SELECT count(*)::int,count(*) FILTER(WHERE private.k3_entity_state('action',c.id,_at)->>'status'='done')::int INTO children,child_done FROM k3_actions c WHERE c.goal_id=_id AND c.deleted_at IS NULL AND c.status<>'cancelled' AND c.required;
 IF total=0 THEN basis:='actions'; END IF;
 END IF;
 state:=CASE WHEN lifecycle IN('draft','paused','cancelled','ended_missed') THEN lifecycle WHEN _at<starts THEN 'not_started' WHEN (total>0 AND total=met) OR (_kind='goal' AND total=0 AND children>0 AND children=child_done) THEN 'done' ELSE 'in_progress' END;
 RETURN jsonb_build_object('status',state,'kpi_total',total,'kpi_met',met,'kf_total',children,'kf_done',child_done,'completion_basis',basis,'start_at',starts,'deadline_at',deadline,'result_count',observations,'overdue',state IN('in_progress','paused') AND _at>deadline,'overdue_seconds',CASE WHEN state IN('in_progress','paused') AND _at>deadline THEN floor(extract(epoch FROM _at-deadline)) ELSE 0 END,'review_required',total=0 AND (_kind='action' OR children=0),'state_model','automatic_v1');
END $fn$;
REVOKE ALL ON FUNCTION private.k3_entity_state(text,uuid,timestamptz) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.k3_entity_metric(_kind text,_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.k3_entity_state(_kind,_id,now()) $$;
CREATE OR REPLACE FUNCTION private.k3_goal_overdue(_goal uuid,_at timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT coalesce((private.k3_entity_state('goal',_goal,_at)->>'overdue')::boolean,false)$$;
CREATE OR REPLACE FUNCTION private.k3_action_overdue(_action uuid,_at timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT coalesce((private.k3_entity_state('action',_action,_at)->>'overdue')::boolean,false)$$;
COMMENT ON FUNCTION private.k3_entity_metric(text,uuid) IS 'One automatic KG/KF state: Vietnam timeline, mandatory measured KPIs and revision-specific acceptance, own KG results otherwise required KFs; legacy Done is never evidence.';
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_goal_list(text,text)'::regprocedure);
 def:=replace(def,$old$a.status='done' AND a.deleted_at IS NULL$old$,$new$private.k3_entity_metric('action',a.id)->>'status'='done' AND a.deleted_at IS NULL$new$);
 def:=replace(def,$old$g.status IN ('not_started','in_progress','paused')$old$,$new$private.k3_entity_metric('goal',g.id)->>'status' IN ('not_started','in_progress','paused')$new$);
 def:=replace(def,$old$g.status IN ('done','ended_missed')$old$,$new$private.k3_entity_metric('goal',g.id)->>'status'='done'$new$);
 def:=replace(def,$old$'id',g.id,'name',g.name,$old$,$new$'id',g.id,'name',g.name,'metric',private.k3_entity_metric('goal',g.id),$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_goal_detail(uuid)'::regprocedure);
 def:=replace(def,$old$'status',private.k3_entity_metric('goal',g.id)->>'status'$old$,$new$'owner_id',g.user_id,'metric',private.k3_entity_metric('goal',g.id),'status',private.k3_entity_metric('goal',g.id)->>'status'$new$);
 def:=regexp_replace(def,$re$a.status IN \('not_started','in_progress','paused'\) AND a.due_date IS NOT NULL AND a.due_date < today THEN \(today - a.due_date\)$re$,$new$private.k3_action_overdue(a.id) THEN greatest(1,today-coalesce(a.due_date,g.period_end))$new$);EXECUTE def;
END $patch$;
DO $patch$ DECLARE def text;sig text;BEGIN
 FOREACH sig IN ARRAY ARRAY['public.k3_team_read(date)','public.k3_user_day_read(uuid,date)','public.k3_kpi_day_read(date)','private.k3_employee_day_source(uuid,date)','private.k3_close_one(uuid,date,text)'] LOOP
 IF to_regprocedure(sig) IS NULL THEN CONTINUE; END IF;def:=pg_get_functiondef(sig::regprocedure);
 IF sig LIKE '%k3_close_one%' OR sig LIKE '%employee_day_source%' OR sig LIKE '%kpi_day_read%' THEN
 def:=replace(def,$old$private.k3_entity_metric('action',a.id)$old$,$new$private.k3_entity_state('action',a.id,CASE WHEN _date=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN now() ELSE private.k3_timepoint(_date,(SELECT close_time FROM k3_automation_config WHERE id),true) END)$new$);
 def:=replace(def,$old$a.due_date<_date$old$,$new$private.k3_action_overdue(a.id,CASE WHEN _date=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN now() ELSE private.k3_timepoint(_date,(SELECT close_time FROM k3_automation_config WHERE id),true) END)$new$);
 def:=replace(def,$old$coalesce(a.due_date,g.period_end)<_date$old$,$new$private.k3_action_overdue(a.id,CASE WHEN _date=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN now() ELSE private.k3_timepoint(_date,(SELECT close_time FROM k3_automation_config WHERE id),true) END)$new$);
 IF sig LIKE '%close_one%' THEN def:=replace(def,$old$WHERE private.k3_action_worker_ok(_user,a.id)$old$,$new$WHERE private.k3_action_on_date(a.id,_date) AND private.k3_action_worker_ok(_user,a.id)$new$);END IF;
 ELSE
 def:=replace(def,$old$g.status IN ('not_started','in_progress','paused')$old$,$new$private.k3_entity_metric('goal',g.id)->>'status' IN ('not_started','in_progress','paused')$new$);
 def:=replace(def,$old$a.status IN ('not_started','in_progress','paused')$old$,$new$private.k3_entity_metric('action',a.id)->>'status' IN ('not_started','in_progress','paused')$new$);
 def:=replace(def,$old$g2.status IN ('not_started','in_progress','paused')$old$,$new$private.k3_entity_metric('goal',g2.id)->>'status' IN ('not_started','in_progress','paused')$new$);
 def:=replace(def,$old$a.due_date IS NOT NULL AND a.due_date<today$old$,$new$private.k3_action_overdue(a.id)$new$);
 END IF;EXECUTE def;
 END LOOP;
END $patch$;
COMMENT ON COLUMN public.k3_actions.manual_progress IS 'DEPRECATED: execution progress is calculated from measured KPI results; retained only for historical audit.';
COMMENT ON COLUMN public.k3_goals.status IS 'Lifecycle only: draft and audited special decisions. Normal execution state is derived by private.k3_entity_state; historical values are preserved.';
COMMENT ON COLUMN public.k3_actions.status IS 'Lifecycle only; normal execution state and completion are derived by private.k3_entity_state, never by manual Done.';