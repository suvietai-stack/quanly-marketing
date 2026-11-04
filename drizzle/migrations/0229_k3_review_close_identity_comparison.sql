CREATE FUNCTION private.k3_result_identity(_rows jsonb) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=public AS $fn$ SELECT coalesce(jsonb_agg(jsonb_build_object('id',r->>'id','revision',r->>'revision') ORDER BY r->>'id'),'[]') FROM jsonb_array_elements(coalesce(_rows,'[]')) r $fn$;
REVOKE ALL ON FUNCTION private.k3_result_identity(jsonb) FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('private.k3_employee_review_state(uuid,date)'::regprocedure);
 def:=replace(def,$old$c.snapshot->'results' IS DISTINCT FROM s->'results'$old$,$new$private.k3_result_identity(c.snapshot->'results') IS DISTINCT FROM private.k3_result_identity(s->'results') OR (c.snapshot->'review_day' IS NOT NULL AND private.k3_review_fingerprint(c.snapshot->'review_day') IS DISTINCT FROM private.k3_review_fingerprint(s))$new$);EXECUTE def;
END $patch$;