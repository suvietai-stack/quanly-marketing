-- 1) Extend the verified appointment allowlist with backend-gated permissions:
--    signal.* is enforced by private.sig_can (-> private.has_permission) and RLS via private.sig_scope_ok;
--    biz.crm_* is enforced by public.crm_can (-> private.base_tier1).
CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $function$
SELECT p = ANY (ARRAY[
  'leave.create','leave.view_own','leave.edit_own','leave.recall',
  'leave.view_assigned','leave.view_all','leave.approve','leave.create_for','leave.edit_others','leave.cancel_handle','leave.exception','leave.reassign','leave.report','leave.export','leave.settings',
  'att.create','att.view_own','att.edit_own','att.witness',
  'att.manage','att.reconcile','att.report','att.view_all','att.settings',
  'order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
  'order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.send_request','order.view_all',
  'order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes',
  'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own',
  'oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
  'ot.view_own','ot.task_view','ot.task_update','ot.stage_update',
  'ot.accept','ot.assign','ot.create','ot.manage','ot.report','ot.report_export','ot.reschedule_propose','ot.reschedule_reply','ot.supplier','ot.view_all',
  'finance.incoming.view','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind',
  'signal.sale','signal.report','signal.reassign','signal.view_all','signal.assign',
  'signal.create','signal.edit','signal.manage','signal.delete','signal.catalog',
  'biz.crm_use','biz.crm_access','biz.crm_view_scope','biz.crm_edit_other',
  'biz.crm_transfer','biz.crm_archive','biz.crm_export','biz.crm_settings',
  'kpi.view_own','overview.view','overview.own_only','settings.view'
])
$function$;

-- 2) Signal group scope is also honored from the role linked to the user's active base appointment.
CREATE OR REPLACE FUNCTION private.sig_scope_ok(_uid uuid, _groups text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT _uid IS NOT NULL AND (
    private.is_super_admin(_uid) OR private.is_admin(_uid)
    OR NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid)
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
               WHERE ur.user_id = _uid AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE ur.user_id = _uid
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id AND l.title_source = 'base'
        JOIN public.app_roles r ON r.id = l.role_id
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id AND l.title_source = 'base'
        JOIN public.app_roles r ON r.id = l.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
  );
$function$;

-- 3) Standard roles for the two staff titles that had no default role.
INSERT INTO public.app_roles (id, name, description, is_system, permissions, signal_scope_all, signal_scope, catalog_state, catalog_group)
VALUES
  ('role-standard-sales-staff', 'Nhân viên Kinh doanh',
   'Role chuẩn nhân viên kinh doanh: tín hiệu được giao, CRM cá nhân, hỏi giá, tiền về cá nhân và nghiệp vụ nền.',
   false,
   ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness',
         'kpi.view_own','overview.view','settings.view',
         'signal.sale','signal.report','biz.crm_use',
         'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own',
         'finance.incoming.view','finance.incoming.claim','finance.incoming.manual_view'],
   false, ARRAY['Sứ quà tặng','Sản xuất theo yêu cầu','Nhập sỉ','Xuất khẩu','Bát đĩa nhà hàng','Khác'],
   'standard', 'Kinh doanh'),
  ('role-standard-mkt-staff', 'Nhân viên Marketing',
   'Role chuẩn nhân viên marketing: nghiệp vụ nền; quyền công việc chuyên môn cấp qua nhiệm vụ Marketing.',
   false,
   ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness',
         'kpi.view_own','overview.view','overview.own_only','settings.view'],
   false, '{}',
   'standard', 'Marketing')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    signal_scope_all = EXCLUDED.signal_scope_all,
    signal_scope = EXCLUDED.signal_scope,
    catalog_state = EXCLUDED.catalog_state,
    catalog_group = EXCLUDED.catalog_group;

-- 4) Link every in-use base title that still lacked a default role.
INSERT INTO public.base_title_role_links
  (id, title_source, title_id, role_id, is_primary, scope_kind, active, revision, reason, updated_by, enabled_permissions, permission_signature)
VALUES
  (gen_random_uuid(), 'base', 'e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0', 'role-standard-sales-staff', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: liên kết Role chuẩn Nhân viên Kinh doanh (hoàn thiện phân quyền)',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','overview.view','settings.view','signal.sale','signal.report','biz.crm_use','oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','finance.incoming.view','finance.incoming.claim','finance.incoming.manual_view'],
   md5(ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','overview.view','settings.view','signal.sale','signal.report','biz.crm_use','oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','finance.incoming.view','finance.incoming.claim','finance.incoming.manual_view']::text)),
  (gen_random_uuid(), 'base', 'b5e00000-0000-4000-8000-000000000102', 'role-standard-mkt-staff', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: liên kết Role chuẩn Nhân viên Marketing (hoàn thiện phân quyền)',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','overview.view','overview.own_only','settings.view'],
   md5(ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','overview.view','overview.own_only','settings.view']::text)),
  (gen_random_uuid(), 'base', '60dc2983-c41c-42dc-bcf6-14010beaa3dd', 'role-viewer', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: liên kết Role xem điều hành cho Giám Đốc khối (hoàn thiện phân quyền)',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.approve','leave.create','leave.create_for','leave.view_all','leave.view_assigned','att.create','att.witness','finance.incoming.reconcile','finance.incoming.remind','finance.incoming.view','finance.incoming.view_totals','kpi.view_own','oq.report_all','oq.view_all','order.report_view','order.view','order.view_all','overview.view','signal.report','signal.view_all','settings.view'],
   md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-viewer'))),
  (gen_random_uuid(), 'base', 'ea700d9c-35a7-4ceb-b1cd-bfb9080b4d08', 'role-viewer', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: liên kết Role xem điều hành cho Giám Đốc Điều hành (hoàn thiện phân quyền)',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.approve','leave.create','leave.create_for','leave.view_all','leave.view_assigned','att.create','att.witness','finance.incoming.reconcile','finance.incoming.remind','finance.incoming.view','finance.incoming.view_totals','kpi.view_own','oq.report_all','oq.view_all','order.report_view','order.view','order.view_all','overview.view','signal.report','signal.view_all','settings.view'],
   md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-viewer'))),
  (gen_random_uuid(), 'base', '6faa90f6-1f3f-4974-bf4e-d4e21d529f6c', 'role-viewer', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: liên kết Role xem điều hành cho Phó Giám Đốc Điều hành (hoàn thiện phân quyền)',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.approve','leave.create','leave.create_for','leave.view_all','leave.view_assigned','att.create','att.witness','finance.incoming.reconcile','finance.incoming.remind','finance.incoming.view','finance.incoming.view_totals','kpi.view_own','oq.report_all','oq.view_all','order.report_view','order.view','order.view_all','overview.view','signal.report','signal.view_all','settings.view'],
   md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-viewer'))),
  (gen_random_uuid(), 'base', '3fac501b-ebb5-4262-8c87-d376a2c18ad8', 'role-nhan-su-moi', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: Role nền cho chức vụ Trưởng Phòng chung; quyền quản lý theo bổ nhiệm Kinh doanh hoặc chức vụ chuyên môn tương ứng',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.create','leave.view_own','att.create','att.view_own'],
   md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-nhan-su-moi'))),
  (gen_random_uuid(), 'base', '9cc8cdff-afcf-41eb-89b3-d8836d86ab84', 'role-nhan-su-moi', true, 'own', false, 1,
   'ÁP DỤNG PHÂN QUYỀN: Role nền cho chức vụ Trưởng Nhóm chung; quyền quản lý theo bổ nhiệm Kinh doanh hoặc chức vụ chuyên môn tương ứng',
   '513712ca-d679-41aa-9c68-97c3bb6cd9df',
   ARRAY['leave.create','leave.view_own','att.create','att.view_own'],
   md5((SELECT permissions::text FROM public.app_roles WHERE id = 'role-nhan-su-moi')));

-- 5) Keep title links and specialty signatures valid when a role's permissions change through any editor.
CREATE OR REPLACE FUNCTION private.base_role_links_resign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  WITH upd AS (
    UPDATE public.base_title_role_links l
    SET enabled_permissions = ARRAY(
          SELECT p FROM unnest(coalesce(l.enabled_permissions,'{}'::text[])) p
          WHERE p = ANY (NEW.permissions) AND private.org_role_permission_ready(p)),
        permission_signature = md5(coalesce(NEW.permissions,'{}'::text[])::text),
        revision = l.revision + 1,
        updated_at = now()
    WHERE l.role_id = NEW.id
      AND (l.permission_signature IS DISTINCT FROM md5(coalesce(NEW.permissions,'{}'::text[])::text)
           OR l.enabled_permissions <> ARRAY(
                SELECT p FROM unnest(coalesce(l.enabled_permissions,'{}'::text[])) p
                WHERE p = ANY (NEW.permissions) AND private.org_role_permission_ready(p)))
    RETURNING l.title_source, l.title_id
  )
  INSERT INTO public.base_title_role_events (actor_id, title_source, title_id, reason, before_data, after_data)
  SELECT NULL, u.title_source, u.title_id,
         'Tự đồng bộ chữ ký liên kết sau khi Role thay đổi quyền',
         jsonb_build_object('role_id', OLD.id, 'permissions', OLD.permissions),
         jsonb_build_object('role_id', NEW.id, 'permissions', NEW.permissions)
  FROM upd u;

  UPDATE public.org_assignments a
  SET data = jsonb_set(a.data, '{specialty_signatures}',
             coalesce(a.data->'specialty_signatures','{}'::jsonb) || jsonb_build_object(s.id, md5(coalesce(NEW.permissions,'{}'::text[])::text))),
      revision = a.revision + 1
  FROM public.mkt_specialties s
  WHERE s.role_id = NEW.id
    AND a.data->'specialty_ids' ? s.id
    AND (a.data->'specialty_signatures'->>s.id) IS DISTINCT FROM md5(coalesce(NEW.permissions,'{}'::text[])::text);

  RETURN NEW;
END
$function$;

DROP TRIGGER IF EXISTS app_roles_resign_links ON public.app_roles;
CREATE TRIGGER app_roles_resign_links
AFTER UPDATE OF permissions ON public.app_roles
FOR EACH ROW
WHEN (OLD.permissions IS DISTINCT FROM NEW.permissions)
EXECUTE FUNCTION private.base_role_links_resign();

-- 6) Archive compatibility roles with no remaining references (0 users, no title links, no specialties).
--    role-designer stays compatibility: specialties 'design' and 'photography' still grant through it.
UPDATE public.app_roles
SET catalog_state = 'archived'
WHERE id IN ('role-xim870m3','role-0k2hmw8r','role-leader-marketing','role-standard-mkt-team','role-standard-design-team')
  AND catalog_state = 'compatibility';