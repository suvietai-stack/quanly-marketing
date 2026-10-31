DO $patch$ DECLARE f text; BEGIN
SELECT pg_get_functiondef('private.biz_rolling_validate(jsonb,jsonb,boolean)'::regprocedure) INTO f;
f:=replace(f,'count(DISTINCT x->>''metric_id'') FROM jsonb_array_elements(_items) x','count(DISTINCT entry->>''metric_id'') FROM jsonb_array_elements(_items) entry');EXECUTE f;
SELECT pg_get_functiondef('public.biz_rolling_save(uuid,jsonb,text,integer,boolean)'::regprocedure) INTO f;
f:=replace(f,'b:=private.biz_rolling_basis(_goal);','PERFORM 1 FROM public.biz_documents WHERE user_id=g.user_id AND kind=''report'' AND year=g.year ORDER BY id FOR SHARE; b:=private.biz_rolling_basis(_goal);');EXECUTE f;
SELECT pg_get_functiondef('public.biz_rolling_decide(uuid,integer,boolean,text)'::regprocedure) INTO f;
f:=replace(f,'b:=private.biz_rolling_basis(p.goal_id);','PERFORM 1 FROM public.biz_documents WHERE user_id=g.user_id AND kind=''report'' AND year=g.year ORDER BY id FOR SHARE; b:=private.biz_rolling_basis(p.goal_id);');EXECUTE f;
END $patch$;