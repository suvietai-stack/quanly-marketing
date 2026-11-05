DO $patch$ DECLARE def text; sig text; BEGIN
 def:=pg_get_functiondef('public.k3_action_save(jsonb)'::regprocedure);
 def:=replace(def,$old$INSERT INTO public.k3_plan_events$old$,$new$UPDATE k3_actions SET required=coalesce((p->>'required')::boolean,required) WHERE id=a.id RETURNING * INTO a; INSERT INTO public.k3_plan_events$new$);EXECUTE def;
 FOREACH sig IN ARRAY ARRAY['public.k3_goal_status(uuid,text,text,bigint)','public.k3_action_status(uuid,text,text,text,text,bigint)'] LOOP
 def:=pg_get_functiondef(sig::regprocedure);
 IF sig LIKE '%goal_status%' THEN
 def:=replace(def,$old$IF _revision IS NULL$old$,$new$IF g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Công việc đang trong Thùng rác.'; END IF; PERFORM private.k3_write_guard(greatest(g.period_start,coalesce((SELECT effective_from FROM k3_settings WHERE id),g.period_start))); IF _revision IS NULL$new$);
 ELSE
 def:=replace(def,$old$IF _revision IS NULL$old$,$new$IF a.deleted_at IS NOT NULL OR EXISTS(SELECT 1 FROM k3_goals WHERE id=a.goal_id AND deleted_at IS NOT NULL) THEN RAISE EXCEPTION 'Công việc đang trong Thùng rác.'; END IF; PERFORM private.k3_write_guard(greatest((SELECT period_start FROM k3_goals WHERE id=a.goal_id),coalesce((SELECT effective_from FROM k3_settings WHERE id),(SELECT period_start FROM k3_goals WHERE id=a.goal_id)))); IF _revision IS NULL$new$);
 END IF;EXECUTE def;
 END LOOP;
END $patch$;