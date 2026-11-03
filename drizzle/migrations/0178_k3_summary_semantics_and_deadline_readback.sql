CREATE FUNCTION private.k3_task_complete(_target numeric,_actual numeric,_progress integer,_status text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$SELECT _status='done' AND CASE WHEN coalesce(_target,0)>0 THEN coalesce(_actual,0)>=_target ELSE _progress>=100 END$$;
REVOKE ALL ON FUNCTION private.k3_task_complete(numeric,numeric,integer,text) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_period_deadline(_type text,_date date,_phase text,_at timestamptz DEFAULT now()) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE cfg jsonb; dl jsonb; dt date:=public.k3_period_start(_type,_date); BEGIN
 SELECT snapshot->'new' INTO cfg FROM public.k3_settings_log WHERE changed_at<=_at AND snapshot->'new' ? 'period_deadlines' ORDER BY changed_at DESC,id DESC LIMIT 1;
 IF cfg IS NULL THEN SELECT to_jsonb(s) INTO cfg FROM public.k3_settings s WHERE id; END IF;
 dl:=cfg->'period_deadlines'->(_type||'_'||_phase);
 IF dl IS NULL OR nullif(dl->>'effective_from','')::date>dt OR nullif(dl->>'time','') IS NULL OR nullif(dl->>'offset','') IS NULL THEN RETURN NULL; END IF;
 RETURN ((dt+(dl->>'offset')::int)+(dl->>'time')::time) AT TIME ZONE 'Asia/Ho_Chi_Minh'; END$$;
REVOKE ALL ON FUNCTION private.k3_period_deadline(text,date,text,timestamptz) FROM PUBLIC,anon,authenticated;
DO $$DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_summary_confirm(date)'::regprocedure);
 def:=replace(def,'status<>''done'' AND','NOT private.k3_task_complete(kpi_target,kpi_actual,progress,status) AND');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_period_summary_confirm(text,date,text)'::regprocedure);
 def:=replace(def,'NOT (t->>''is_unscheduled'')::boolean AND t->>''status''<>''done'' AND','NOT private.k3_task_complete((t->>''kpi_target'')::numeric,(t->>''kpi_actual'')::numeric,(t->>''progress'')::int,t->>''status'') AND');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_period_read(text,date,uuid)'::regprocedure);
 def:=replace(def,'''goals'',goals,''actions'',actions)::text','''goals'',(SELECT coalesce(jsonb_agg(v-ARRAY[''updated_at'',''revision''] ORDER BY v->>''id''),''[]''::jsonb) FROM jsonb_array_elements(goals) v),''actions'',(SELECT coalesce(jsonb_agg(v-ARRAY[''updated_at'',''revision''] ORDER BY v->>''id''),''[]''::jsonb) FROM jsonb_array_elements(actions) v))::text');
 def:=replace(def,'''period_start'',dt,''period_end'',de','''planned_at'',(SELECT min(created_at) FROM public.k3_goals WHERE user_id=uid AND period_type=_type AND period_start=dt AND (uid=auth.uid() OR public.biz_scope_ok(auth.uid(),uid,department_id,(dt::timestamp AT TIME ZONE ''Asia/Ho_Chi_Minh'')))),''plan_deadline'',private.k3_period_deadline(_type,dt,''plan'',coalesce((SELECT min(created_at) FROM public.k3_goals WHERE user_id=uid AND period_type=_type AND period_start=dt),now())),''summary_deadline'',private.k3_period_deadline(_type,dt,''summary'',coalesce((SELECT min(confirmed_at) FROM public.k3_period_summaries WHERE user_id=uid AND period_type=_type AND period_start=dt),now())),''period_start'',dt,''period_end'',de');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_team_read(date)'::regprocedure);
 def:=replace(def,'WHERE day_id=d.id AND deleted_at IS NULL','WHERE day_id=d.id AND deleted_at IS NULL AND NOT is_unscheduled');
 def:=replace(def,'WHERE status=''done''','WHERE private.k3_task_complete(kpi_target,kpi_actual,progress,status)');
 EXECUTE def;
END$$;
CREATE FUNCTION private.k3_task_link_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE link jsonb; BEGIN
 IF NEW.links IS NOT NULL AND NEW.links<>'null'::jsonb THEN
 IF jsonb_typeof(NEW.links)<>'array' OR jsonb_array_length(NEW.links)>10 THEN RAISE EXCEPTION 'Tối đa 10 link tài liệu hợp lệ.'; END IF;
 FOR link IN SELECT * FROM jsonb_array_elements(NEW.links) LOOP IF coalesce(link->>'url','') !~ '^https://[^[:space:]]+$' THEN RAISE EXCEPTION 'Link tài liệu phải là đường dẫn https hợp lệ.'; END IF; END LOOP; END IF; RETURN NEW; END$$;
CREATE TRIGGER k3_task_link_validation BEFORE INSERT OR UPDATE OF links ON public.k3_tasks FOR EACH ROW EXECUTE FUNCTION private.k3_task_link_guard();
CREATE FUNCTION private.k3_task_comment_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN IF NEW.task_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.k3_tasks WHERE id=NEW.task_id AND day_id=NEW.day_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Nhận xét không khớp công việc và ngày.'; END IF; RETURN NEW; END$$;
CREATE TRIGGER k3_task_comment_integrity BEFORE INSERT OR UPDATE ON public.k3_comments FOR EACH ROW EXECUTE FUNCTION private.k3_task_comment_guard();