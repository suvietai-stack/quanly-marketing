-- Revert only 3K speed RPC changes. No customer/job/KPI rows are modified.
-- Reinstates the original verified 3K hub access implementation.
-- Unit choices follow real position appointments, not legacy Biz grant flags.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';
CREATE OR REPLACE FUNCTION public.k3hub_access_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); is_company boolean;
BEGIN
 IF NOT private.is_active(uid) THEN RAISE EXCEPTION 'Cần đăng nhập.' USING ERRCODE='42501'; END IF;
 is_company:=private.k3hub_exec(uid);
 RETURN jsonb_build_object(
 'can_company',is_company,
 'can_config',private.is_super_admin(uid) OR private.has_permission(uid,'k3hub.config'),
 'can_manage',is_company OR (
     private.has_permission(uid,'k3hub.center') AND
     NOT private.k3_personal_denied(uid,'k3.view_scope')
     AND EXISTS(SELECT 1 FROM public.org_assignments a JOIN public.org_titles t
       ON t.id=a.title_id AND t.kind='manager'
       WHERE a.user_id=uid AND a.status='active'
        AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
        AND private.k3hub_is_enabled(a.unit_id,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date))
    ),
 'can_personal',public.k3_can(uid,'k3.use') AND (
     private.is_super_admin(uid) OR EXISTS(
       SELECT 1 FROM public.org_assignments a
       WHERE a.user_id=uid AND a.status='active'
        AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
        AND private.k3hub_is_enabled(a.unit_id,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)
     )),
 'units',coalesce((SELECT jsonb_agg(jsonb_build_object('id',u.id,'name',
   CASE WHEN u.name LIKE 'Showrom %' THEN replace(u.name,'Showrom ','Showroom ') ELSE u.name END,
   'kind',u.kind,'block_id',b.id,'block_name',b.name) ORDER BY b.name,u.kind,u.name)
  FROM public.org_units u
  JOIN LATERAL (
    SELECT root.id,root.name FROM private.k3hub_path(u.id) p
    JOIN public.org_units root ON root.id=p.id AND root.kind='block'
    WHERE p.id=ANY(private.k3hub_policy_at((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date))
    LIMIT 1
  ) b ON true
  WHERE u.active AND (
    is_company
    OR EXISTS(SELECT 1 FROM public.org_assignments a
      JOIN public.org_titles t ON t.id=a.title_id AND t.kind='manager'
      WHERE a.user_id=uid AND a.status='active'
        AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
        AND EXISTS(SELECT 1 FROM private.k3hub_path(u.id) p WHERE p.id=a.unit_id)
        AND private.has_permission(uid,'k3hub.center')
        AND NOT private.k3_personal_denied(uid,'k3.view_scope')
    )
  )),'[]'::jsonb)
 );
END $fn$;
REVOKE ALL ON FUNCTION public.k3hub_access_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3hub_access_read() TO authenticated;
COMMIT;


-- Revert the opt-in fast acknowledgement branch, preserving all writes/history.
DO $rollback$
DECLARE
  f text;
  old_duplicate text := 'IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN RETURN public.k3_kpi_result_read(kid,day); END IF;';
  new_duplicate text := 'IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN IF coalesce((p->>''ack_only'')::boolean,false) THEN RETURN jsonb_build_object(''saved'',true,''duplicate'',true,''kpi_id'',kid,''work_date'',day); END IF; RETURN (public.k3_kpi_result_read(kid,day)); END IF;';
  old_success text := 'RETURN public.k3_kpi_result_read(kid,day);';
  new_success text := 'IF coalesce((p->>''ack_only'')::boolean,false) THEN RETURN jsonb_build_object(''saved'',true,''result_id'',r.id,''revision'',r.revision,''kpi_id'',kid,''work_date'',day); END IF; RETURN public.k3_kpi_result_read(kid,day);';
BEGIN
  SELECT pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure) INTO f;
  IF position(new_duplicate IN f)=0 OR position(new_success IN f)=0 THEN
    RAISE EXCEPTION 'Current KPI save does not match fast acknowledgement patch; stop manual rollback.';
  END IF;
  f := replace(f,new_success,old_success);
  f := replace(f,new_duplicate,old_duplicate);
  EXECUTE f;
END
$rollback$;
