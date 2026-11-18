-- Save result fast path. Keep existing RPC, locking, validation, RLS guards,
-- immutable versions, history and legacy full-detail response intact.
-- Only callers explicitly setting ack_only=true skip the expensive detail
-- aggregation after the transaction has already saved the result.
DO $patch$
DECLARE
  f text;
  old_duplicate text := 'IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN RETURN public.k3_kpi_result_read(kid,day); END IF;';
  new_duplicate text := 'IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN IF coalesce((p->>''ack_only'')::boolean,false) THEN RETURN jsonb_build_object(''saved'',true,''duplicate'',true,''kpi_id'',kid,''work_date'',day); END IF; RETURN (public.k3_kpi_result_read(kid,day)); END IF;';
  old_success text := 'RETURN public.k3_kpi_result_read(kid,day);';
  new_success text := 'IF coalesce((p->>''ack_only'')::boolean,false) THEN RETURN jsonb_build_object(''saved'',true,''result_id'',r.id,''revision'',r.revision,''kpi_id'',kid,''work_date'',day); END IF; RETURN public.k3_kpi_result_read(kid,day);';
BEGIN
  SELECT pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure) INTO f;
  IF position(old_duplicate IN f)=0 THEN
    RAISE EXCEPTION '3K result save idempotency contract changed; review before optimization.';
  END IF;
  -- Patch retry first so only the single, final full-read RETURN remains.
  f := replace(f,old_duplicate,new_duplicate);
  IF position(old_success IN f)=0 THEN
    RAISE EXCEPTION '3K result save final response contract changed; review before optimization.';
  END IF;
  f := replace(f,old_success,new_success);
  EXECUTE f;
END
$patch$;
