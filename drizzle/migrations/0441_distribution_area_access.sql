-- 0441 — Phân Phối is an independent Base workspace over the SAME canonical Biz records.
-- This stage makes no edits to org units, members, 3K, KR, plans, reports or historical documents.
-- The separate tree cutover is intentionally not included until baseline/live role fences can be verified.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';

CREATE OR REPLACE FUNCTION public.biz_area_access()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  actor uuid := auth.uid();
  elevated boolean;
  orders_access boolean;
  distribution_access boolean;
  distribution_depts jsonb := '[]'::jsonb;
BEGIN
  IF actor IS NULL OR NOT private.is_active(actor) THEN
    RETURN jsonb_build_object('orders',false,'distribution',false,'distribution_units','[]'::jsonb);
  END IF;
  elevated := private.is_super_admin(actor);

  SELECT elevated OR EXISTS (
    SELECT 1 FROM public.org_assignments a
    LEFT JOIN public.biz_departments d ON d.id::text=a.unit_id
    WHERE a.user_id=actor AND a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      AND (
        (a.unit_id IN (SELECT id FROM public.org_units WHERE kind='system'
            AND parent_id='biz-block' AND id<>'3df93c75-8a46-4c2f-bc09-7583aa672b52'))
        OR (d.system_id IS NOT NULL AND d.system_id<>'3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid
            AND EXISTS (SELECT 1 FROM public.org_units su
              WHERE su.id=d.system_id::text AND su.kind='system' AND su.parent_id='biz-block'))
      )
  ) INTO orders_access;

  SELECT elevated OR EXISTS (
    SELECT 1 FROM public.org_assignments a
    LEFT JOIN public.biz_departments d ON d.id::text=a.unit_id
    WHERE a.user_id=actor AND a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      AND (a.unit_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'
        OR d.system_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid)
  ) INTO distribution_access;

  IF distribution_access THEN
    SELECT coalesce(jsonb_agg(id::text ORDER BY sort_order,name),'[]'::jsonb)
      INTO distribution_depts
      FROM public.biz_departments
      WHERE system_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid AND active;
  END IF;

  RETURN jsonb_build_object(
    'orders',orders_access,
    'distribution',distribution_access,
    'distribution_units',distribution_depts
  );
END $function$;
REVOKE ALL ON FUNCTION public.biz_area_access() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_area_access() TO authenticated;

COMMIT;
