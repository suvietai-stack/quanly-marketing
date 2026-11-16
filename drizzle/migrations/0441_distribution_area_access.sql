-- Stage 1: independent Distribution workspace over existing canonical Biz identities.
-- No org tree move, Role grant, commercial document mutation or duplicate business data.
-- A later cutover must migrate server scopes before reparenting the Distribution system.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='45s';

CREATE OR REPLACE FUNCTION public.biz_area_access()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  actor uuid := auth.uid();
  elevated boolean := false;
  orders_access boolean := false;
  distribution_access boolean := false;
  distribution_depts jsonb := '[]'::jsonb;
BEGIN
  IF actor IS NULL OR NOT private.is_active(actor) THEN
    RETURN jsonb_build_object('orders',false,'distribution',false,'distribution_units','[]'::jsonb);
  END IF;

  elevated := public.is_super_admin(actor) OR public.biz_all_scope(actor);
  SELECT
    elevated OR EXISTS (
      SELECT 1 FROM public.org_assignments a
      LEFT JOIN public.biz_departments d ON d.id::text=a.unit_id
      WHERE a.user_id=actor AND a.status='active'
        AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
        AND (a.unit_id='624e6e56-eeab-42d5-85af-6af284e72f34'
          OR d.system_id='624e6e56-eeab-42d5-85af-6af284e72f34'::uuid)
    ),
    elevated OR EXISTS (
      SELECT 1 FROM public.org_assignments a
      LEFT JOIN public.biz_departments d ON d.id::text=a.unit_id
      WHERE a.user_id=actor AND a.status='active'
        AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
        AND (a.unit_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'
          OR d.system_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid)
    )
  INTO orders_access, distribution_access;

  IF distribution_access THEN
    SELECT coalesce(jsonb_agg(id::text ORDER BY sort_order,name),'[]'::jsonb)
      INTO distribution_depts
      FROM public.biz_departments
      WHERE system_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid AND active;
  END IF;

  RETURN jsonb_build_object('orders',orders_access,'distribution',distribution_access,
    'distribution_units',distribution_depts);
END
$function$;
REVOKE ALL ON FUNCTION public.biz_area_access() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_area_access() TO authenticated;

-- The dashboard RPC returns only one permitted system, never the all-Khối group.
-- Reuses the authoritative published aggregation and all its existing permission checks.
CREATE OR REPLACE FUNCTION public.biz_area_dashboard_read(
  _area text, _year integer, _period_kind text DEFAULT 'year', _period integer DEFAULT 1
)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  target_id text;
  scoped boolean;
  result jsonb;
  target_group jsonb;
  rights jsonb;
BEGIN
  IF _area NOT IN ('orders','distribution') THEN
    RAISE EXCEPTION 'Khu vực không hợp lệ.' USING ERRCODE='22023';
  END IF;
  rights := public.biz_area_access();
  scoped := coalesce((rights->>_area)::boolean,false);
  IF NOT scoped THEN
    RAISE EXCEPTION 'Không có quyền xem khu vực này.' USING ERRCODE='42501';
  END IF;
  target_id := CASE _area
    WHEN 'orders' THEN '624e6e56-eeab-42d5-85af-6af284e72f34'
    ELSE '3df93c75-8a46-4c2f-bc09-7583aa672b52'
  END;
  result := public.biz_dashboard_published(_year,_period_kind,_period);
  SELECT g INTO target_group FROM jsonb_array_elements(result->'groups') g
  WHERE g->>'id'=target_id AND g->>'level'='system' LIMIT 1;
  RETURN jsonb_set(result,'{groups}',
    CASE WHEN target_group IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(target_group) END,true)
    || jsonb_build_object('area',_area,'system_id',target_id);
END
$function$;
REVOKE ALL ON FUNCTION public.biz_area_dashboard_read(text,integer,text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_area_dashboard_read(text,integer,text,integer) TO authenticated;

COMMIT;
