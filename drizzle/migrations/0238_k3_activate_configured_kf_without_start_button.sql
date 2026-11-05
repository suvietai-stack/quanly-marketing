DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_configure(jsonb)'::regprocedure);
 def:=replace(def,$old$RETURN to_jsonb(k);$old$,$new$IF k.action_id IS NOT NULL AND k.required THEN UPDATE k3_actions a SET status='not_started',revision=revision+1,updated_at=now() FROM k3_goals g WHERE a.id=k.action_id AND a.goal_id=g.id AND a.deleted_at IS NULL AND g.deleted_at IS NULL AND a.status='draft' AND g.status NOT IN('draft','paused','cancelled','ended_missed'); END IF; RETURN to_jsonb(k);$new$);EXECUTE def;
END $patch$;