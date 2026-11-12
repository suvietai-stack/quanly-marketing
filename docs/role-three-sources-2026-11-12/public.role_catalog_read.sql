CREATE OR REPLACE FUNCTION public.role_catalog_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE d jsonb; counts jsonb; BEGIN d:=private.slot_catalog_previous_read(); SELECT coalesce(jsonb_object_agg(role_id,stats),'{}') INTO counts FROM (SELECT role_id,jsonb_build_object('total',count(DISTINCT user_id),'slots',count(DISTINCT user_id) FILTER(WHERE source_kind='slot'),'tasks',count(DISTINCT user_id) FILTER(WHERE source_kind IN ('task','specialty')),'direct',count(DISTINCT user_id) FILTER(WHERE source_kind='direct'),'legacy',count(DISTINCT user_id) FILTER(WHERE source_kind='title_legacy')) stats FROM private.role_source_rows(private.base_config()) GROUP BY role_id) x; RETURN jsonb_set(d,'{roles}',(SELECT coalesce(jsonb_agg(r||jsonb_build_object('receivers',coalesce((counts->(r->>'id')->>'total')::int,0),'receiver_counts',coalesce(counts->(r->>'id'),'{}'))),'[]') FROM jsonb_array_elements(d->'roles') r)); END $function$
;
