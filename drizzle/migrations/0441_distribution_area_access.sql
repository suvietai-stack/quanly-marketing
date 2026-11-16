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
  orders_depts jsonb := '[]'::jsonb;
BEGIN
  IF actor IS NULL OR NOT private.is_active(actor) THEN
    RETURN jsonb_build_object('orders',false,'distribution',false,'orders_units','[]'::jsonb,'distribution_units','[]'::jsonb);
  END IF;
  -- Executive position at the company root has scope across both commercial areas.
  -- Use indexed canonical assignments rather than expensive global Role resolution.
  elevated := private.is_super_admin(actor) OR EXISTS(
    SELECT 1 FROM public.org_assignments a
    JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
    WHERE a.user_id=actor AND a.status='active' AND a.unit_id='org-company'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      AND pr.role_id='role-v2-executive'
  );

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

  IF orders_access THEN
    SELECT coalesce(jsonb_agg(d.id::text ORDER BY d.sort_order,d.name),'[]'::jsonb)
      INTO orders_depts
    FROM public.biz_departments d
    JOIN public.org_units u ON u.id=d.system_id::text AND u.kind='system'
      AND u.parent_id='biz-block' AND u.active
    WHERE d.active AND d.system_id<>'3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid;
  END IF;

  IF distribution_access THEN
    SELECT coalesce(jsonb_agg(id::text ORDER BY sort_order,name),'[]'::jsonb)
      INTO distribution_depts
      FROM public.biz_departments
      WHERE system_id='3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid AND active;
  END IF;

  RETURN jsonb_build_object(
    'orders',orders_access,
    'orders_units',orders_depts,
    'distribution',distribution_access,
    'distribution_units',distribution_depts
  );
END $function$;
REVOKE ALL ON FUNCTION public.biz_area_access() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_area_access() TO authenticated;

-- Small, scoped overview — never invokes the costly published cross-company aggregate.
-- Counts reference original Biz rows; no copies or changes to goals/plans/reports.
CREATE OR REPLACE FUNCTION public.biz_area_overview_read(_area text,_year integer)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  system_key uuid;
  has_scope boolean;
  system_name text;
  department_count integer;
  staff_count integer;
  goal_count integer;
  plan_count integer;
  report_count integer;
  rights jsonb;
BEGIN
  IF _area IS NULL OR _area NOT IN ('orders','distribution')
    OR _year IS NULL OR _year NOT BETWEEN 2020 AND 2200
  THEN RAISE EXCEPTION 'Thông số kỳ hoặc khu vực không hợp lệ.' USING ERRCODE='22023'; END IF;
  rights := public.biz_area_access();
  has_scope := coalesce((rights->>_area)::boolean,false);
  IF NOT has_scope THEN RAISE EXCEPTION 'Không có quyền xem khu vực.' USING ERRCODE='42501'; END IF;
  -- Keep Orders dynamically mapped to the active non-Distribution Biz system.
  IF _area='distribution' THEN
    system_key := '3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid;
  ELSE
    SELECT s.id INTO system_key FROM public.biz_systems s
    JOIN public.org_units u ON u.id=s.id::text
    WHERE s.active AND u.kind='system' AND u.parent_id='biz-block'
      AND s.id<>'3df93c75-8a46-4c2f-bc09-7583aa672b52'::uuid
    ORDER BY s.created_at,s.name LIMIT 1;
  END IF;
  IF system_key IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy hệ kinh doanh đang hoạt động.' USING ERRCODE='22023'; END IF;

  SELECT name INTO system_name FROM public.biz_systems WHERE id=system_key;
  SELECT count(*) INTO department_count FROM public.biz_departments
    WHERE system_id=system_key AND active;
  SELECT count(DISTINCT m.user_id) INTO staff_count
    FROM public.biz_department_members m
    JOIN public.biz_departments d ON d.id=m.department_id
    WHERE d.system_id=system_key AND d.active
      AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now());
  SELECT count(*) INTO goal_count FROM public.biz_annual_goals g
    JOIN public.biz_departments d ON d.id=g.department_id
    WHERE d.system_id=system_key AND g.year=_year;
  SELECT count(*) INTO plan_count FROM public.biz_documents b
    JOIN public.biz_departments d ON d.id=b.department_id
    WHERE d.system_id=system_key AND b.kind='plan' AND b.year=_year
      AND b.first_submitted_at IS NOT NULL;
  SELECT count(*) INTO report_count FROM public.biz_documents b
    JOIN public.biz_departments d ON d.id=b.department_id
    WHERE d.system_id=system_key AND b.kind='report' AND b.year=_year
      AND b.official_version_id IS NOT NULL;

  RETURN jsonb_build_object('area',_area,'system_id',system_key::text,
    'system_name',system_name,'year',_year,'departments',department_count,
    'staff',staff_count,'goals',goal_count,'submitted_plans',plan_count,
    'official_reports',report_count,'server_now',now());
END $function$;
REVOKE ALL ON FUNCTION public.biz_area_overview_read(text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_area_overview_read(text,integer) TO authenticated;


COMMIT;
