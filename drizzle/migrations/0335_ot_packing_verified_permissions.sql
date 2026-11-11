-- Giai đoạn 2.5: kiểm chứng 4 quyền nghiệp vụ cá nhân của Nhân viên Đóng hàng và kích hoạt liên kết chức vụ.
-- Bằng chứng an toàn (backend, 0032):
--  - ot.view_own: chỉ xem đơn mà người dùng là sale/supply/người tạo (private.ot_can_view).
--  - ot.task_view: chỉ xem đơn có công việc giao cho mình (private.ot_can_view).
--  - ot.task_update: chỉ sửa công việc được giao (assignee_id = auth.uid()) và chỉ 4 trường cho phép.
--  - ot.stage_update: chỉ cập nhật công đoạn của đơn mình xem được (private.ot_can_stage -> ot_can_view).
-- Không cấp ot.view_all/manage/assign/supplier/settings/create; không động vào tài chính, Role hay cấu hình.

CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT p=ANY(ARRAY['leave.create','leave.view_own','leave.edit_own','leave.recall','att.create','att.view_own','att.edit_own','att.witness','order.view','order.view_mine','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery','ot.view_own','ot.task_view','ot.task_update','ot.stage_update']) $$;

-- Kích hoạt đúng một liên kết đã kiểm chứng: chức vụ "Nhân viên Đóng hàng" -> role-dong-hang.
-- Cơ chế cấp qua enabled_permissions (scope 'own', chữ ký quyền khớp Role); active=false giữ nguyên hàng rào full-Role.
-- Giữ nguyên updated_by vì migration chạy ngoài phiên đăng nhập.
UPDATE public.base_title_role_links l
SET enabled_permissions = '{ot.view_own,ot.task_view,ot.task_update,ot.stage_update}',
    permission_signature = (SELECT md5(coalesce(a.permissions, '{}')::text) FROM public.app_roles a WHERE a.id = 'role-dong-hang'),
    reason = 'Kích hoạt 4 quyền cá nhân đã kiểm chứng (Giai đoạn 2.5)'
WHERE l.title_source = 'base' AND l.role_id = 'role-dong-hang'
  AND l.scope_kind = 'own'
  AND EXISTS (SELECT 1 FROM public.app_roles a WHERE a.id = 'role-dong-hang'
              AND a.permissions @> '{ot.view_own,ot.task_view,ot.task_update,ot.stage_update}'::text[]);

INSERT INTO public.base_title_role_events (actor_id, title_source, title_id, reason, before_data, after_data)
SELECT l.updated_by, 'base', l.title_id,
       'Kích hoạt 4 quyền cá nhân đã kiểm chứng cho Nhân viên Đóng hàng (Giai đoạn 2.5)',
       '{}'::jsonb, to_jsonb(l)
FROM public.base_title_role_links l
WHERE l.title_source = 'base' AND l.role_id = 'role-dong-hang' AND l.enabled_permissions <> '{}';

COMMENT ON TABLE public.base_title_role_links IS 'Liên kết chức vụ -> Role. enabled_permissions chỉ chứa quyền cá nhân đã kiểm chứng (private.org_role_permission_ready); active=true (full Role) vẫn bị khóa.';