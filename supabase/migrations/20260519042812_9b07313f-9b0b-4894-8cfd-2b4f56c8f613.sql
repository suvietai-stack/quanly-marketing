-- Seed minimal role rows so foreign keys + UI work immediately.
-- Full permission arrays are populated by the client via restoreDefaultRoles().
INSERT INTO public.app_roles (id, name, description, is_system, permissions) VALUES
  ('role-super-admin',      'Super Admin',           'Toàn quyền hệ thống, không thể bị hạn chế.',                           true,  '{}'::text[]),
  ('role-admin',            'Admin',                 'Quản trị app hằng ngày — gần như toàn quyền, không quản lý role.',     true,  '{}'::text[]),
  ('role-leader-marketing', 'Leader Marketing',      'Điều phối, giao việc, duyệt workflow toàn phòng marketing.',           false, '{}'::text[]),
  ('role-seo',              'SEO',                   'Phụ trách SEO website.',                                                false, '{}'::text[]),
  ('role-content-web',      'Content Web',           'Viết & gửi duyệt content website.',                                     false, '{}'::text[]),
  ('role-social',           'Social',                'Sản xuất & vận hành nội dung social.',                                  false, '{}'::text[]),
  ('role-local-seo',        'Local SEO',             'Quản lý Google Map / Local Map.',                                       false, '{}'::text[]),
  ('role-designer',         'Designer / Chụp ảnh',   'Xử lý order thiết kế, chụp ảnh, retouch.',                              false, '{}'::text[]),
  ('role-video',            'Video',                 'Sản xuất video.',                                                       false, '{}'::text[]),
  ('role-viewer',           'Viewer / Ban Giám Đốc', 'Chỉ xem tổng quan, báo cáo, tình hình vận hành.',                       false, '{}'::text[])
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system   = EXCLUDED.is_system;

-- Bootstrap: ensure every system-admin profile is assigned the super-admin role
INSERT INTO public.user_roles (user_id, role_id)
SELECT p.id, 'role-super-admin'
FROM public.profiles p
WHERE p.is_system_admin = true
ON CONFLICT DO NOTHING;