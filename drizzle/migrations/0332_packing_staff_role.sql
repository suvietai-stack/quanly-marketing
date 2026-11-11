-- Role tối thiểu cho Nhân viên Đóng hàng: chỉ quyền nghiệp vụ Đóng hàng/Theo dõi đơn hàng phạm vi cá nhân.
-- Không cấp quyền Mua hàng, Kế toán, Admin; không gán cho ai; không đổi dữ liệu hiện có.
INSERT INTO app_roles(id, name, description, permissions, is_system, biz_scope, biz_detail_exception, biz_settings_disabled, signal_scope, signal_scope_all)
VALUES ('role-dong-hang', 'Nhân viên Đóng hàng', 'Quyền tối thiểu nghiệp vụ Đóng hàng: xem đơn phụ trách, xem và cập nhật công việc/công đoạn được giao.',
  ARRAY['ot.view_own', 'ot.task_view', 'ot.task_update', 'ot.stage_update'],
  true, 'assigned', false, false, '{}', false)
ON CONFLICT (id) DO NOTHING;

-- Liên kết chức vụ "Nhân viên Đóng hàng" với Role này ở trạng thái chưa kích hoạt (active=false,
-- enabled_permissions rỗng) — chỉ bật sau khi kiểm chứng phạm vi, đúng cơ chế base_title_role_links.
INSERT INTO base_title_role_links(title_source, title_id, role_id, is_primary, scope_kind, active, reason, updated_by, enabled_permissions, permission_signature)
SELECT 'base', t.id, 'role-dong-hang', true, 'own', false,
  'Role tối thiểu nghiệp vụ Đóng hàng — chờ kiểm chứng phạm vi trước khi kích hoạt',
  '513712ca-d679-41aa-9c68-97c3bb6cd9df', '{}',
  (SELECT md5(coalesce(a.permissions, '{}')::text) FROM app_roles a WHERE a.id = 'role-dong-hang')
FROM org_titles t
WHERE t.name = 'Nhân viên Đóng hàng'
  AND NOT EXISTS (SELECT 1 FROM base_title_role_links l WHERE l.title_id = t.id AND l.role_id = 'role-dong-hang');