-- 2026-11-16: Executive director at org-company has company-wide reporting
-- and workflow-scoped approvals, without system administration privileges.
-- Keep the V2 position role binding and existing personal/HR permissions.
-- Approve permissions never bypass assigned approver/workflow/anti-self-approve guards.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

DO $executive$
DECLARE
  role_before public.app_roles%ROWTYPE;
  desired text[] := ARRAY[
    -- Company leadership and HR visibility
    'overview.view','overview.alerts','overview.all_dept','overview.brand_summary',
    'overview.module_summary','overview.staff_summary',
    'report.view','report.attention','report.attention_all','report.by_brand',
    'report.by_module','report.by_staff','report.growth',
    'org.view','org.view_history','settings.view',
    'att.view_all','att.report','leave.view_unit',
    -- Company-wide business reports and workflow inbox
    'biz.dashboard_public','biz.view_all','biz.view_dept','biz.approval_view',
    'biz.goal_approve','biz.report_approve',
    'k3.view_scope','kpi.view_all','kpi.view_own','kpi.report',
    -- Store/operation figures and financial reports (read-only)
    'finance.incoming.view','finance.incoming.view_totals','finance.incoming.view_unit',
    'fr.advance.report','fr.payment.report','fr.salary.report',
    'fr.advance.approve','fr.payment.approve','fr.salary.approve',
    'oq.view_all','oq.report_all','ot.view_all','ot.report',
    'order.view','order.view_all','order.report_view',
    'order.photo.report_view','order.marketing_design.report_view',
    'order.order_mockup.report_view',
    -- Marketing + brands + content reporting, not write access
    'brand.view','brand.view_all','brand.view_channels',
    'signal.report','signal.view_all',
    'web.view','web.view_all','web.report_view','web.report_alerts',
    'web.report_alerts_all','web.report_by_staff','web.report_by_topic',
    'social.view','social.view_all','social.report',
    'local.view','local.view_all','local.report',
    'video.view','video.view_all',
    'task.view','task.view_all','task.view_history'
  ];
  invalid_keys text[];
  next_permissions text[];
BEGIN
  SELECT * INTO role_before FROM public.app_roles WHERE id='role-v2-executive' FOR UPDATE;
  IF role_before.id IS NULL OR role_before.role_kind<>'position'
     OR role_before.catalog_generation<>2 OR role_before.catalog_state<>'standard'
     OR role_before.is_system
  THEN RAISE EXCEPTION 'Executive V2 role missing/changed'; END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.org_position_roles
    WHERE unit_id='org-company'
    AND title_id='ea700d9c-35a7-4ceb-b1cd-bfb9080b4d08'
    AND role_id='role-v2-executive'
  ) THEN RAISE EXCEPTION 'Executive position-role source changed'; END IF;
  SELECT array_agg(p) INTO invalid_keys FROM unnest(desired) p
   WHERE NOT EXISTS(SELECT 1 FROM public.base_permission_catalog c WHERE c.key=p)
      OR NOT private.grant_source_ready('position',p);
  IF invalid_keys IS NOT NULL THEN
    RAISE EXCEPTION 'Unrecognized/non-grantable executive permission keys: %', invalid_keys;
  END IF;
  SELECT array_agg(DISTINCT p ORDER BY p) INTO next_permissions
  FROM unnest(role_before.permissions||desired) p;
  -- A preexisting explicit DENY in an employee's individual rules still wins.
  PERFORM set_config('app.role_reason',
    'Giám đốc Điều hành: xem báo cáo toàn công ty và duyệt đúng hồ sơ được phân công; không cấp quyền quản trị',true);
  UPDATE public.app_roles SET
    permissions=next_permissions,
    description='Điều hành cấp công ty: xem báo cáo toàn bộ khối/hệ theo phân hệ hiện có, vào Trung tâm Phê duyệt và duyệt theo quy trình; không có quyền Super Admin.',
    catalog_group='Quản trị & Điều hành',
    updated_at=now()
  WHERE id='role-v2-executive';
END
$executive$;
COMMIT;
