DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_purge_expired(integer)'::regprocedure);def:=replace(def,'AS $function$','AS $function$'||chr(10)||'#variable_conflict use_column');
 def:=replace(def,'DELETE FROM public.k3_actions WHERE goal_id=g.id;', $new$DELETE FROM public.k3_kpi_config_versions WHERE kpi_id IN(SELECT id FROM k3_kpis WHERE goal_id=g.id OR action_id IN(SELECT id FROM k3_actions WHERE goal_id=g.id)); DELETE FROM public.k3_actions WHERE goal_id=g.id;$new$);
 def:=replace(def,'DELETE FROM public.k3_actions WHERE id=a.id;', $new$DELETE FROM public.k3_kpi_config_versions WHERE kpi_id IN(SELECT id FROM k3_kpis WHERE action_id=a.id); DELETE FROM public.k3_actions WHERE id=a.id;$new$);EXECUTE def;
END $patch$;
CREATE FUNCTION private.k3_action_overdue(_action uuid,_at timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT a.status IN('not_started','in_progress','paused') AND private.k3_timepoint(CASE WHEN a.inherit_timeline THEN coalesce(g.due_date,g.period_end) ELSE coalesce(a.due_date,g.period_end) END,CASE WHEN a.inherit_timeline THEN g.due_time ELSE a.due_time END,true)<_at FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE a.id=_action$$;
REVOKE ALL ON FUNCTION private.k3_action_overdue(uuid,timestamptz) FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_goal_detail(uuid)'::regprocedure);
 def:=replace(def,$old$a.status IN ('not_started','in_progress','paused') AND a.due_date IS NOT NULL AND a.due_date < today THEN (today-a.due_date)$old$,$new$private.k3_action_overdue(a.id) THEN greatest(1,today-coalesce(a.due_date,g.period_end))$new$);EXECUTE def;
END $patch$;