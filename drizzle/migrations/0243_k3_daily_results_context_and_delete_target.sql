DO $patch$
DECLARE def text; changed text;
BEGIN
 def:=pg_get_functiondef('public.k3_kpi_day_read(date)'::regprocedure);
 changed:=replace(def,'''goal_id'',g.id,''name'',a.name', '''goal_id'',g.id,''delete_kind'',CASE WHEN g.creation_mode=''basic'' AND (SELECT count(*) FROM public.k3_actions sibling WHERE sibling.goal_id=g.id AND sibling.deleted_at IS NULL)=1 THEN ''goal'' ELSE ''action'' END,''name'',a.name');
 IF changed=def THEN RAISE EXCEPTION 'Daily delete target anchor missing'; END IF;
 def:=changed;
 changed:=replace(def,'WHERE private.k3_action_on_date(a.id,_date) AND private.k3_action_worker_ok(uid,a.id)', 'WHERE (private.k3_action_on_date(a.id,_date) OR EXISTS(SELECT 1 FROM jsonb_array_elements(rows) result WHERE result->>''action_id''=a.id::text)) AND private.k3_action_worker_ok(uid,a.id)');
 IF changed=def THEN RAISE EXCEPTION 'Daily result context anchor missing'; END IF;
 EXECUTE changed;
END $patch$;
COMMENT ON FUNCTION public.k3_kpi_day_read(date) IS 'Personal scheduled work plus own valid result activity on the selected day, with unchanged assignment, status and review fences. Simple one-action work deletes through the protected parent RPC; no history or close snapshot is rewritten.';