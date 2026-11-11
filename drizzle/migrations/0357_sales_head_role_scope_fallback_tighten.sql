-- 1) Standard sales-leader role: full signal/CRM/quote management within the module gates,
--    deliberately WITHOUT company-wide HR approvals (leave.approve stays with HCNS/executives).
INSERT INTO public.app_roles (id, name, description, is_system, permissions, signal_scope_all, signal_scope, catalog_state, catalog_group)
VALUES
  ('role-standard-sales-head', 'Trưởng phòng Kinh doanh',
   'Role chuẩn trưởng phòng/nhóm kinh doanh: quản lý tín hiệu trong phạm vi nhóm, CRM trong phạm vi, quản lý hỏi giá và nghiệp vụ nền.',
   false,
   ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness',
         'kpi.view_own','overview.view','settings.view',
         'signal.sale','signal.report','signal.view_all','signal.assign','signal.reassign',
         'biz.crm_use','biz.crm_view_scope','biz.crm_edit_other','biz.crm_transfer','biz.crm_export',
         'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
         'finance.incoming.view','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.manual_view'],
   false, ARRAY['Sứ quà tặng','Sản xuất theo yêu cầu','Nhập sỉ','Xuất khẩu','Bát đĩa nhà hàng','Khác'],
   'standard', 'Kinh doanh')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    signal_scope_all = EXCLUDED.signal_scope_all,
    signal_scope = EXCLUDED.signal_scope,
    catalog_state = EXCLUDED.catalog_state,
    catalog_group = EXCLUDED.catalog_group;

-- 2) Repoint the generic sales-unit leader titles to the sales roles.
UPDATE public.base_title_role_links
SET role_id = 'role-standard-sales-head',
    enabled_permissions = ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','overview.view','settings.view','signal.sale','signal.report','signal.view_all','signal.assign','signal.reassign','biz.crm_use','biz.crm_view_scope','biz.crm_edit_other','biz.crm_transfer','biz.crm_export','oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export','finance.incoming.view','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.manual_view'],
    permission_signature = md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-standard-sales-head')),
    reason = 'ÁP DỤNG PHÂN QUYỀN: Trưởng Phòng đơn vị kinh doanh nhận Role Trưởng phòng Kinh doanh (không gồm duyệt nhân sự toàn công ty)',
    revision = revision + 1,
    updated_at = now()
WHERE title_source = 'biz' AND title_id = '3fac501b-ebb5-4262-8c87-d376a2c18ad8';

UPDATE public.base_title_role_links
SET role_id = 'role-standard-sales-staff',
    enabled_permissions = ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','overview.view','settings.view','signal.sale','signal.report','biz.crm_use','oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','finance.incoming.view','finance.incoming.claim','finance.incoming.manual_view'],
    permission_signature = md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-standard-sales-staff')),
    reason = 'ÁP DỤNG PHÂN QUYỀN: Trưởng Nhóm đơn vị kinh doanh nhận Role Nhân viên Kinh doanh (làm việc cùng nhóm, quản lý theo bổ nhiệm Kinh doanh)',
    revision = revision + 1,
    updated_at = now()
WHERE title_source = 'biz' AND title_id = '9cc8cdff-afcf-41eb-89b3-d8836d86ab84';

-- 3) Tighten the legacy signal-scope fallback: it now applies only to accounts with neither
--    direct roles nor an active appointment-linked role, so appointment scope is authoritative.
CREATE OR REPLACE FUNCTION private.sig_scope_ok(_uid uuid, _groups text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT _uid IS NOT NULL AND (
    private.is_super_admin(_uid) OR private.is_admin(_uid)
    OR (NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid)
        AND NOT EXISTS (SELECT 1 FROM public.org_assignments a
                          JOIN public.base_title_role_links l ON l.title_id = a.title_id
                        WHERE a.user_id = _uid AND a.status = 'active'
                          AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())))
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
               WHERE ur.user_id = _uid AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE ur.user_id = _uid
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id
        JOIN public.app_roles r ON r.id = l.role_id
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id
        JOIN public.app_roles r ON r.id = l.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
  );
$function$;