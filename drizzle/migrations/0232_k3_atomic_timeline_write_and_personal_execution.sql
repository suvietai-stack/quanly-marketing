DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_action_save(jsonb)'::regprocedure);
 def:=replace(def,'request_key,assignee_id,is_key)', 'request_key,assignee_id,is_key,start_time,due_time,inherit_timeline,execution_schedule)');
 def:=replace(def,$old$key,_assignee,coalesce((p->>'is_key')::boolean,false))$old$,$new$key,_assignee,coalesce((p->>'is_key')::boolean,false),nullif(p->>'start_time','')::time,nullif(p->>'due_time','')::time,coalesce((p->>'inherit_timeline')::boolean,true),coalesce(p->'execution_schedule','{"mode":"daily"}'::jsonb))$new$);
 def:=replace(def,$old$UPDATE public.k3_actions SET name=$old$,$new$UPDATE public.k3_actions SET start_time=CASE WHEN p ? 'start_time' THEN nullif(p->>'start_time','')::time ELSE start_time END,due_time=CASE WHEN p ? 'due_time' THEN nullif(p->>'due_time','')::time ELSE due_time END,inherit_timeline=coalesce((p->>'inherit_timeline')::boolean,inherit_timeline),execution_schedule=coalesce(p->'execution_schedule',execution_schedule),name=$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_goal_save(jsonb)'::regprocedure);
 def:=replace(def,'request_key,status,is_key)', 'request_key,status,is_key,start_time,due_time)');
 def:=replace(def,$old$key,st,coalesce((p->>'is_key')::boolean,false))$old$,$new$key,st,coalesce((p->>'is_key')::boolean,false),nullif(p->>'start_time','')::time,nullif(p->>'due_time','')::time)$new$);
 def:=replace(def,'UPDATE public.k3_goals SET name=', $new$UPDATE public.k3_goals SET start_time=CASE WHEN p ? 'start_time' THEN nullif(p->>'start_time','')::time ELSE start_time END,due_time=CASE WHEN p ? 'due_time' THEN nullif(p->>'due_time','')::time ELSE due_time END,name=$new$);EXECUTE def;
 def:=pg_get_functiondef('private.k3_action_worker_ok(uuid,uuid)'::regprocedure);
 def:=replace(def,'g.user_id=_user',$new$(g.user_id=_user AND (a.assignee_id=_user OR EXISTS(SELECT 1 FROM k3_action_collaborators cc WHERE cc.action_id=a.id AND cc.user_id=_user)))$new$); EXECUTE def;
END $patch$;
CREATE FUNCTION private.k3_goal_overdue(_goal uuid,_at timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT g.status IN('not_started','in_progress','paused') AND private.k3_timepoint(coalesce(g.due_date,g.period_end),g.due_time,true)<_at FROM k3_goals g WHERE id=_goal$$;
REVOKE ALL ON FUNCTION private.k3_goal_overdue(uuid,timestamptz) FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text;fname text; BEGIN
 FOREACH fname IN ARRAY ARRAY['public.k3_goal_list(text,text)','public.k3_goal_detail(uuid)'] LOOP
 def:=pg_get_functiondef(fname::regprocedure);
 def:=replace(def,$old$g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end))$old$,$new$private.k3_goal_overdue(g.id) THEN greatest(1,today-coalesce(g.due_date,g.period_end))$new$);
 def:=replace(def,$old$(g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today)$old$,$new$private.k3_goal_overdue(g.id)$new$);EXECUTE def;
 END LOOP;
END $patch$;