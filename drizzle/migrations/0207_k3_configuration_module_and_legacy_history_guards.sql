DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_configure(jsonb)'::regprocedure);
 def:=replace(def,'IF auth.uid() IS NULL THEN RAISE EXCEPTION ''Chưa đăng nhập.''; END IF;', 'IF auth.uid() IS NULL THEN RAISE EXCEPTION ''Chưa đăng nhập.''; END IF; IF NOT public.k3_can(auth.uid(),''k3.use'') THEN RAISE EXCEPTION ''Bạn không có quyền sử dụng 3K.''; END IF; PERFORM private.k3_write_guard((now() AT TIME ZONE ''Asia/Ho_Chi_Minh'')::date);');
 def:=replace(def,'IF kid IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_kpi_results WHERE kpi_id=kid) THEN','IF kid IS NOT NULL AND (EXISTS(SELECT 1 FROM public.k3_kpi_results WHERE kpi_id=kid) OR EXISTS(SELECT 1 FROM public.k3_tasks t WHERE t.kpi_id=kid OR (t.action_id=aid AND t.kpi_id IS NULL AND t.kpi_actual IS NOT NULL))) THEN');
 EXECUTE def;
END$patch$;