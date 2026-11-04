DO $patch$ DECLARE def text; fname text; BEGIN
 FOREACH fname IN ARRAY ARRAY['private.k3_goal_has_official(uuid)','private.k3_action_has_official(uuid)'] LOOP
 def:=pg_get_functiondef(fname::regprocedure);
 IF fname LIKE '%goal%' THEN
 def:=replace(def,'SELECT EXISTS(', 'SELECT EXISTS(SELECT 1 FROM public.k3_kpi_results r JOIN public.k3_kpi_day_confirmations c ON c.user_id=r.user_id AND c.work_date=r.work_date WHERE r.goal_id=_goal AND EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>''id''=r.id::text)) OR EXISTS(');
 ELSE
 def:=replace(def,'SELECT EXISTS(', 'SELECT EXISTS(SELECT 1 FROM public.k3_kpi_results r JOIN public.k3_kpi_day_confirmations c ON c.user_id=r.user_id AND c.work_date=r.work_date WHERE r.action_id=_action AND EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>''id''=r.id::text)) OR EXISTS(');
 END IF;
 EXECUTE def;
 END LOOP;
END$patch$;