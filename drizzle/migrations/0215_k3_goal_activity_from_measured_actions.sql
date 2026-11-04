DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('private.k3_entity_metric(text,uuid)'::regprocedure);
 def:=replace(def,'RETURN jsonb_build_object', 'IF _kind=''goal'' AND active=0 THEN SELECT count(*)::int INTO active FROM k3_kpi_results r WHERE r.goal_id=_id AND r.deleted_at IS NULL AND r.review_reason IS NULL AND EXISTS(SELECT 1 FROM private.k3_result_eligible(r.kpi_id,false) e WHERE e.id=r.id); END IF; RETURN jsonb_build_object');
 EXECUTE def;
END$patch$;
COMMENT ON FUNCTION private.k3_entity_metric(text,uuid) IS 'Mandatory own KPIs determine completion; measured child activity can mark a KG in progress but never auto-complete it.';