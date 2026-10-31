DO $patch$ DECLARE f text; BEGIN
SELECT pg_get_functiondef('private.biz_rolling_basis(uuid)'::regprocedure) INTO f;
f:=replace(f,'''current_plan_id'',p.id,''items'',rows_', '''current_plan_id'',p.id,''sources'',coalesce((SELECT jsonb_agg(jsonb_build_object(''document_id'',d.id,''official_version_id'',d.official_version_id) ORDER BY d.id) FROM public.biz_documents d WHERE d.user_id=g.user_id AND d.kind=''report'' AND coalesce(d.period_start,public.biz_period_start_date(d.period_kind,d.year,d.period))<date_trunc(''month'',today_)::date AND coalesce(d.period_end,public.biz_period_end_date(d.period_kind,d.year,d.period))>=make_date(g.year,1,1)),''[]''::jsonb),''items'',rows_');EXECUTE f;
SELECT pg_get_functiondef('public.biz_rolling_save(uuid,jsonb,text,integer,boolean)'::regprocedure) INTO f;
f:=replace(f,'SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal FOR UPDATE;', 'LOCK TABLE public.biz_documents IN SHARE MODE; SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal FOR UPDATE;');EXECUTE f;
SELECT pg_get_functiondef('public.biz_rolling_decide(uuid,integer,boolean,text)'::regprocedure) INTO f;
f:=replace(f,'SELECT * INTO p FROM public.biz_rolling_plans WHERE id=_id;', 'LOCK TABLE public.biz_documents IN SHARE MODE; SELECT * INTO p FROM public.biz_rolling_plans WHERE id=_id;');EXECUTE f;
END $patch$;