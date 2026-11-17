-- Role V2 common is deliberately PERSONAL only. Previous 13-right default
-- leaked leave.approve and unit-wide leave/attendance powers to every employee.
-- Move those rights to the actual manager position roles, not everybody.
DO $$
DECLARE personal text[] := ARRAY[
  'att.create','att.edit_own','att.view_own',
  'leave.create','leave.edit_own','leave.recall','leave.view_own',
  'k3.use','k3.view_scope'
];
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-v2-common' AND role_kind='common' AND catalog_generation=2) THEN
    RAISE EXCEPTION 'Missing common Role V2';
  END IF;
  PERFORM set_config('app.role_reason','Giới hạn quyền chung V2 về thao tác cá nhân; chuyển quyền duyệt nghỉ phép sang cấp quản lý',true);

  UPDATE public.app_roles r SET permissions=personal
    WHERE r.id='role-v2-common' AND r.permissions IS DISTINCT FROM personal;

  UPDATE public.app_roles r SET permissions=ARRAY(
    SELECT DISTINCT x FROM unnest(r.permissions ||
      ARRAY['leave.approve','leave.view_unit','leave.view_assigned','att.witness']) AS x ORDER BY x)
    WHERE r.id IN (
      'role-v2-executive','role-v2-deputy-exec',
      'role-v2-sales-director','role-v2-sales-head',
      'role-v2-b2b-director','role-v2-b2b-head',
      'role-v2-distribution-director','role-v2-distribution-head',
      'role-v2-btc-director','role-v2-showroom-manager',
      'role-v2-mkt-director','role-v2-mkt-head',
      'role-v2-design-head','role-v2-proc-head','role-v2-hr',
      'role-v2-account-chief'
    ) AND NOT (r.permissions @> ARRAY['leave.approve','leave.view_unit','leave.view_assigned','att.witness']::text[]);

  UPDATE public.app_roles r SET permissions=ARRAY(
    SELECT DISTINCT x FROM unnest(r.permissions || ARRAY['leave.view_unit','att.witness']) AS x ORDER BY x)
    WHERE r.id IN ('role-v2-sales-team','role-v2-b2b-team','role-v2-distribution-team')
      AND NOT (r.permissions @> ARRAY['leave.view_unit','att.witness']::text[]);

  -- Deputy CEO should be able to see executive reports, without inheriting
  -- destructive rights, administrative configuration or payment approvals.
  UPDATE public.app_roles deputy SET permissions=ARRAY(
    SELECT DISTINCT x FROM unnest(deputy.permissions ||
      (SELECT ARRAY(
        SELECT p FROM public.app_roles executive CROSS JOIN LATERAL unnest(executive.permissions) p
        WHERE executive.id='role-v2-executive'
          AND (p LIKE ANY(ARRAY['overview.%','report.%','kpi.%'])
            OR p IN ('biz.view_all','biz.view_dept','biz.approval_view',
                     'org.view','org.view_history','signal.view_all','signal.report',
                     'showroom.view_all','order.view_all','order.report_view',
                     'finance.incoming.view_totals','settings.view'))
        ORDER BY p
      ))) AS x ORDER BY x)
    WHERE deputy.id='role-v2-deputy-exec';
END
$$;

CREATE OR REPLACE FUNCTION private.common_role_rules(u uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'permission',p,'effect','ALLOW','source_kind','common','source_id',r.id,
      'role_id',r.id,'source_name',r.name,'scope','own','unit_id',NULL)
  ),'[]'::jsonb)
  FROM public.app_roles r CROSS JOIN LATERAL unnest(r.permissions) p
  WHERE private.is_active(u)
    AND r.id='role-v2-common' AND r.role_kind='common'
    AND r.catalog_generation=2 AND r.catalog_state='standard'
    AND p=ANY(ARRAY[
      'att.create','att.edit_own','att.view_own',
      'leave.create','leave.edit_own','leave.recall','leave.view_own',
      'k3.use','k3.view_scope'
    ])
    AND private.common_permission_ready(p);
$function$;
