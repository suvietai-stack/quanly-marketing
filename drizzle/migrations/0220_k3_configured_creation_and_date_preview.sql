DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_quick_create(jsonb)'::regprocedure);
 def:=replace(def,'PERFORM public.k3_kpi_save(jsonb_build_object(', 'PERFORM public.k3_kpi_configure(kpi||jsonb_build_object(');
 def:=replace(def,$old$'kind',coalesce(nullif(kpi->>'kind',''),'cumulative')$old$,$new$'measure',coalesce(nullif(kpi->>'measure',''),nullif(kpi->>'kind',''),'cumulative')$new$);
 def:=replace(def,'created_kf:=created_kf+1;', $new$IF start_now AND NOT EXISTS(SELECT 1 FROM k3_kpis WHERE action_id=kid) THEN RAISE EXCEPTION 'KF bắt đầu thực hiện cần ít nhất một KPI hợp lệ.'; END IF; created_kf:=created_kf+1;$new$);
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_result_read(uuid,date)'::regprocedure);
 def:=replace(def,$old$'metric',private.k3_result_metric(k.id,false)$old$,$new$'metric',private.k3_measure_eval(to_jsonb(k),private.k3_measure_rows(k.id,false),_date)$new$);
 def:=replace(def,$old$'official_metric',private.k3_result_metric(k.id,true)$old$,$new$'official_metric',private.k3_measure_eval(to_jsonb(k),private.k3_measure_rows(k.id,true),_date)$new$);
 def:=replace(def,$old$'can_update',private.k3_result_can_write(auth.uid(),k.id)$old$,$new$'can_update',private.k3_result_can_write(auth.uid(),k.id),'daily_metric',private.k3_measure_eval(to_jsonb(k),coalesce((SELECT jsonb_agg(r) FROM jsonb_array_elements(private.k3_measure_rows(k.id,false)) r WHERE r->>'user_id'=auth.uid()::text AND r->>'work_date'=_date::text),'[]'),_date),'daily_plan',k.config->'daily_target'$new$);
 EXECUTE def;
 def:=pg_get_functiondef('private.k3_measure_eval(jsonb,jsonb,date)'::regprocedure);
 def:=replace(def,'scoped:=rows;', $new$SELECT count(*),sum((r->>'value')::numeric),sum((r->>'numerator')::numeric),sum((r->>'denominator')::numeric) INTO n,total,num,den FROM jsonb_array_elements(rows) r; scoped:=rows;$new$);
 def:=replace(def,'SELECT count(*),sum((r->>', $new$SELECT count(*),sum((r->>$new$);
 def:=replace(def,'BEGIN', $new$BEGIN
 SELECT coalesce(jsonb_agg(r),'[]') INTO rows FROM jsonb_array_elements(rows) r WHERE r->>'deleted_at' IS NULL AND r->>'review_reason' IS NULL AND (r->>'work_date' IS NULL OR (r->>'work_date')::date<=_date);$new$);
 def:=replace(def,'WHEN n=0 THEN', 'WHEN n=0 AND pending=0 THEN');
 EXECUTE def;
END $patch$;
CREATE FUNCTION private.k3_config_revision_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN IF TG_OP='UPDATE' THEN NEW.config_revision:=OLD.config_revision+1; END IF;
 IF NEW.config ? 'milestones' AND NEW.milestones IS DISTINCT FROM (SELECT coalesce(jsonb_agg(m->>'id'),'[]') FROM jsonb_array_elements(NEW.config->'milestones') m) THEN RAISE EXCEPTION 'Danh sách mốc và cấu hình mốc không khớp.'; END IF;
 IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM k3_kpi_results WHERE kpi_id=OLD.id) THEN RAISE EXCEPTION 'KPI đã có kết quả. Không được đổi công thức hồi tố.'; END IF;
 RETURN NEW; END $fn$;
REVOKE ALL ON FUNCTION private.k3_config_revision_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER k3_config_revision_guard BEFORE INSERT OR UPDATE OF config,measure,condition,target,target_max,required,milestones ON public.k3_kpis FOR EACH ROW EXECUTE FUNCTION private.k3_config_revision_guard();
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_result_preview(uuid,date,jsonb)'::regprocedure);
 def:=replace(def,'RETURN private.k3_measure_eval', $new$IF k.measure='duration' AND k.config->>'duration_method'='intervals' THEN p:=p||jsonb_build_object('value',(SELECT sum(extract(epoch FROM (x->>'end')::timestamptz-(x->>'start')::timestamptz)/60) FROM jsonb_array_elements(coalesce(p->'intervals','[]')) x)); END IF; RETURN private.k3_measure_eval$new$);
 EXECUTE def;
END $patch$;