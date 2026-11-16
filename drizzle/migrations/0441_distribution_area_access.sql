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

-- Lightweight system-only overview. No full-block published materialization
-- and no staff PII; staff totals are aggregated within the single system.
CREATE OR REPLACE FUNCTION public.biz_area_overview_read(_area text, _year integer DEFAULT (EXTRACT(YEAR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'))::integer)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  target_id uuid;
  access_ jsonb;
  label_ text;
  departments_ integer;
  staff_ integer;
  goals_ integer;
  plans_ integer;
  reports_ integer;
BEGIN
  IF _area NOT IN ('orders','distribution') OR _year NOT BETWEEN 2020 AND 2200 THEN
    RAISE EXCEPTION 'Khu vực hoặc năm không hợp lệ.' USING ERRCODE='22023';
  END IF;
  access_ := public.biz_area_access();
  IF NOT coalesce((access_->>_area)::boolean,false) THEN
    RAISE EXCEPTION 'Không có quyền vào khu vực này.' USING ERRCODE='42501';
  END IF;
  target_id := CASE _area
    WHEN 'orders' THEN '624e6e56-eeab-42d5-85af-6af284e72f34'::uuid
    ELSE '3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid
  END;
  SELECT name INTO label_ FROM public.biz_systems WHERE id=target_id AND active;
  IF label_ IS NULL THEN RAISE EXCEPTION 'Hệ chưa hoạt động.'; END IF;
  SELECT count(*) INTO departments_ FROM public.biz_departments WHERE system_id=target_id AND active;
  SELECT count(DISTINCT m.user_id) INTO staff_
    FROM public.biz_department_members m
    JOIN public.biz_departments d ON d.id=m.department_id AND d.active AND d.system_id=target_id
    JOIN public.profiles p ON p.id=m.user_id AND p.status='Đang hoạt động'
    WHERE m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now());
  SELECT count(*) INTO goals_
    FROM public.biz_annual_goals g
    JOIN public.biz_departments d ON d.id=g.department_id AND d.system_id=target_id
    WHERE g.year=_year;
  SELECT count(*) FILTER(WHERE docs.kind='plan'),
         count(*) FILTER(WHERE docs.kind='report')
    INTO plans_,reports_
    FROM public.biz_documents docs
    JOIN public.biz_departments d ON d.id=docs.department_id AND d.system_id=target_id
    WHERE docs.year=_year AND docs.official_version_id IS NOT NULL;
  RETURN jsonb_build_object('area',_area,'system_id',target_id::text,'system_name',label_,
    'year',_year,'departments',departments_,'staff',staff_,
    'goals',goals_,'submitted_plans',plans_,'official_reports',reports_,
    'server_now',now());
END
$function$;
REVOKE ALL ON FUNCTION public.biz_area_overview_read(text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_area_overview_read(text,integer) TO authenticated;

COMMIT;
