DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.org_change(text,bigint,jsonb,uuid,text,text)'::regprocedure) INTO d;
IF d NOT LIKE '%nullif(x->''data''->>''starts_at'','''') IS NULL%' THEN RAISE EXCEPTION 'Unexpected appointment normalizer'; END IF;
d:=replace(d,$s$x->>'action'='assign' AND nullif(x->'data'->>'starts_at','') IS NULL$s$,$s$x->>'action'='assign' AND (nullif(x->'data'->>'starts_at','') IS NULL OR x->'data'->>'immediate'='true')$s$);
d:=replace(d,$s$x->>'action'='end' AND nullif(x->'data'->>'ends_at','') IS NULL$s$,$s$x->>'action'='end' AND (nullif(x->'data'->>'ends_at','') IS NULL OR x->'data'->>'immediate'='true')$s$);
EXECUTE d;
END $$;
COMMENT ON FUNCTION public.org_change(text,bigint,jsonb,uuid,text,text) IS 'Immediate appointment deltas share the server transaction clock; actor-bound preview retains the exact timestamps for apply. Scheduled and historical intervals remain unchanged.';