DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure);
 def:=replace(def,'IF EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=uid AND work_date=day) AND', 'IF (EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=uid AND work_date=day) OR EXISTS(SELECT 1 FROM k3_kpi_day_confirmations WHERE user_id=uid AND work_date=day)) AND');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_result_read(uuid,date)'::regprocedure);
 def:=replace(def,'''day_closed'',EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=auth.uid() AND work_date=_date)', '''day_closed'',(EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=auth.uid() AND work_date=_date) OR EXISTS(SELECT 1 FROM k3_kpi_day_confirmations WHERE user_id=auth.uid() AND work_date=_date))');
 def:=replace(def,'EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>''id''=r.id::text AND (s->>''revision'')::bigint=r.revision)', 'EXISTS(SELECT 1 FROM private.k3_result_eligible(r.kpi_id,true) er WHERE er.id=r.id)');
 EXECUTE def;
END$patch$;
COMMENT ON FUNCTION public.k3_kpi_result_save(jsonb) IS 'One current KPI/employee/day total; immutable revisions, idempotency, correction reasons after either manual confirmation or system close.';