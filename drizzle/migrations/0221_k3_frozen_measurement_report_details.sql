CREATE FUNCTION private.k3_close_measurements_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE rows jsonb;
BEGIN
 SELECT coalesce(jsonb_agg(r||jsonb_build_object('kpi_snapshot',to_jsonb(k),'day_metric',private.k3_measure_eval(to_jsonb(k),jsonb_build_array(r||jsonb_build_object('acceptance',(SELECT a.decision FROM k3_kpi_acceptances a WHERE a.result_id=(r->>'id')::uuid AND a.result_revision=(r->>'revision')::bigint ORDER BY a.created_at DESC,a.id DESC LIMIT 1))),NEW.work_date))),'[]') INTO rows FROM jsonb_array_elements(NEW.snapshot->'results') r JOIN k3_kpis k ON k.id=(r->>'kpi_id')::uuid;
 NEW.snapshot:=jsonb_set(NEW.snapshot,'{results}',rows); RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION private.k3_close_measurements_snapshot() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER k3_close_measurements_snapshot BEFORE INSERT ON public.k3_daily_closes FOR EACH ROW EXECUTE FUNCTION private.k3_close_measurements_snapshot();
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('private.k3_result_measure_guard()'::regprocedure);
 def:=replace(def,'RETURN NEW;', $new$IF k.measure='milestone' AND coalesce((k.config->>'sequential')::boolean,false) AND EXISTS(SELECT 1 FROM jsonb_array_elements(k.config->'milestones') WITH ORDINALITY later(m,i) JOIN jsonb_array_elements(k.config->'milestones') WITH ORDINALITY earlier(m,i) ON earlier.i<later.i WHERE NEW.completed ? (later.m->>'id') AND NOT NEW.completed ? (earlier.m->>'id') AND NOT EXISTS(SELECT 1 FROM private.k3_measure_rows(k.id,false) r WHERE (r->>'work_date')::date<=NEW.work_date AND r->>'id'<>NEW.id::text AND r->'completed' ? (earlier.m->>'id') AND (NOT coalesce((k.config->>'acceptance_required')::boolean,false) OR r->>'acceptance'='accepted'))) THEN RAISE EXCEPTION 'Phải hoàn thành các mốc trước theo thứ tự.'; END IF; RETURN NEW;$new$);
 EXECUTE def;
END $patch$;