-- Save result fast path. Keep existing RPC, locking, validation, RLS guards,
-- immutable versions, history and legacy full-detail response intact.
-- Only callers explicitly setting ack_only=true skip the expensive detail
-- aggregation after the transaction has already saved the result.
DO $patch$
DECLARE
  f text;
  old_duplicate text := 'IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN RETURN public.k3_kpi_result_read(kid,day); END IF;';
  new_duplicate text := 'IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN IF coalesce((p->>''ack_only'')::boolean,false) THEN RETURN jsonb_build_object(''saved'',true,''duplicate'',true,''kpi_id'',kid,''work_date'',day); END IF; RETURN public.k3_kpi_result_read(kid,day); END IF;';
  old_success text := E' RETURN public.k3_kpi_result_read(kid,day);\nEND';
  new_success text := E' IF coalesce((p->>\'ack_only\')::boolean,false) THEN RETURN jsonb_build_object(\'saved\',true,\'result_id\',r.id,\'revision\',r.revision,\'kpi_id\',kid,\'work_date\',day); END IF;\n RETURN public.k3_kpi_result_read(kid,day);\nEND';
BEGIN
  SELECT pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure) INTO f;
  IF position(old_duplicate IN f)=0 OR position(old_success IN f)=0 THEN
    RAISE EXCEPTION '3K result save signature changed; review before speed optimization.';
  END IF;
  f := replace(f,old_duplicate,new_duplicate);
  f := replace(f,old_success,new_success);
  EXECUTE f;
END
$patch$;
