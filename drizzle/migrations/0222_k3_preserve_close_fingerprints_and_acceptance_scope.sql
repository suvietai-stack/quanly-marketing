CREATE OR REPLACE FUNCTION private.k3_close_measurements_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE rows jsonb;
BEGIN
 SELECT coalesce(jsonb_agg(r||jsonb_build_object('kpi_snapshot',to_jsonb(k),'day_metric',private.k3_measure_eval(to_jsonb(k),jsonb_build_array(r||jsonb_build_object('acceptance',(SELECT a.decision FROM k3_kpi_acceptances a WHERE a.result_id=(r->>'id')::uuid AND a.result_revision=(r->>'revision')::bigint ORDER BY a.created_at DESC,a.id DESC LIMIT 1))),NEW.work_date))),'[]') INTO rows FROM jsonb_array_elements(NEW.snapshot->'results') r JOIN k3_kpis k ON k.id=(r->>'kpi_id')::uuid;
 NEW.snapshot:=jsonb_set(NEW.snapshot,'{measurements}',rows); RETURN NEW;
END $fn$;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_result_read(uuid,date)'::regprocedure);
 def:=replace(def,$old$'daily_plan',k.config->'daily_target'$old$,$new$'daily_plan',k.config->'daily_target','can_accept',coalesce((k.config->>'acceptance_required')::boolean,false) AND (public.biz_admin(auth.uid()) OR public.k3_can(auth.uid(),'k3.view_scope')),'acceptances',coalesce((SELECT jsonb_agg(to_jsonb(a)) FROM k3_kpi_acceptances a JOIN k3_kpi_results r ON r.id=a.result_id WHERE r.kpi_id=k.id AND private.k3_result_detail_ok(auth.uid(),r.user_id,r.goal_id,r.work_date)),'[]')$new$);
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_accept(uuid,bigint,text,text)'::regprocedure);
 def:=replace(def,'PERFORM private.k3_write_guard(r.work_date);', $new$IF NOT public.k3_goal_visible(auth.uid(),r.goal_id) OR EXISTS(SELECT 1 FROM k3_data_reviews WHERE status='pending' AND record_id IN(r.kpi_id,r.goal_id,r.action_id)) OR EXISTS(SELECT 1 FROM k3_goals WHERE id=r.goal_id AND deleted_at IS NOT NULL) OR EXISTS(SELECT 1 FROM k3_actions WHERE id=r.action_id AND deleted_at IS NOT NULL) THEN RAISE EXCEPTION 'Kết quả ngoài phạm vi hoặc đang lưu trữ/chờ rà soát.'; END IF; PERFORM private.k3_write_guard(r.work_date);$new$);
 EXECUTE def;
END $patch$;