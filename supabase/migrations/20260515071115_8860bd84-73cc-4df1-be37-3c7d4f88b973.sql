
-- ============= ENUMS =============
CREATE TYPE public.account_status AS ENUM ('Chờ duyệt', 'Đang hoạt động', 'Tạm khóa', 'Từ chối', 'Lưu trữ');

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  desired_position text,
  notes text,
  status public.account_status NOT NULL DEFAULT 'Chờ duyệt',
  is_system_admin boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============= APP_ROLES =============
CREATE TABLE public.app_roles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;

-- ============= USER_ROLES =============
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES public.app_roles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============= USER_PERMISSION_OVERRIDES =============
CREATE TABLE public.user_permission_overrides (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  use_custom boolean NOT NULL DEFAULT false,
  permissions text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;

-- ============= TIMESTAMP TRIGGER =============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_app_roles_updated BEFORE UPDATE ON public.app_roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_overrides_updated BEFORE UPDATE ON public.user_permission_overrides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= SECURITY DEFINER HELPERS =============
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role_id = 'role-super-admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role_id IN ('role-super-admin','role-admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM public.user_permission_overrides WHERE user_id = _user_id AND use_custom = true) THEN
        EXISTS (SELECT 1 FROM public.user_permission_overrides WHERE user_id = _user_id AND _permission = ANY(permissions))
      ELSE
        EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.app_roles r ON r.id = ur.role_id
          WHERE ur.user_id = _user_id AND _permission = ANY(r.permissions)
        )
    END;
$$;

CREATE OR REPLACE FUNCTION public.is_active(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'Đang hoạt động');
$$;

-- ============= NEW USER TRIGGER =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, phone, desired_position, notes, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'desired_position',
    NEW.raw_user_meta_data->>'notes',
    'Chờ duyệt'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= RLS POLICIES =============

-- profiles
CREATE POLICY "Authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "User can update own profile basic fields" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()) AND is_system_admin = false);

-- app_roles
CREATE POLICY "Authenticated can view roles" ON public.app_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin can insert roles" ON public.app_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update non-system roles" ON public.app_roles
  FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete non-system roles" ON public.app_roles
  FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()) AND is_system = false);

-- user_roles
CREATE POLICY "Authenticated can view user_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can assign roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can remove roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid())
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_roles.user_id AND p.is_system_admin = true)
  );

-- user_permission_overrides
CREATE POLICY "Authenticated can view overrides" ON public.user_permission_overrides
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage overrides" ON public.user_permission_overrides
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============= SEED DEFAULT ROLES =============
INSERT INTO public.app_roles (id, name, description, is_system, permissions) VALUES
('role-super-admin', 'Super Admin', 'Toàn quyền hệ thống', true, ARRAY[
  'overview.view',
  'task.view','task.view_all','task.view_mine','task.create','task.edit','task.delete','task.assign','task.update_status',
  'brand.view','brand.create','brand.edit','brand.delete','brand.view_channels','brand.docs',
  'web.view','web.create','web.edit','web.delete','web.tech_view','web.tech_check','web.entity','web.keyword',
  'web.content_create','web.content_edit','web.content_delete','web.content_assign',
  'web.outline_submit','web.outline_approve','web.outline_reject','web.post_submit','web.post_approve','web.post_reject',
  'web.publish','web.update_index','web.update_share','web.backlink','web.checktop','web.reoptimize',
  'web.growth_view','web.growth_edit','web.report_view',
  'social.view','social.create','social.edit','social.delete','social.post_create','social.post_edit','social.post_delete',
  'social.post_submit','social.post_approve','social.schedule','social.publish','social.report',
  'local.view','local.create','local.edit','local.delete','local.post_create','local.post_edit','local.post_delete',
  'local.photo','local.review','local.review_reply','local.report',
  'video.view','video.create','video.edit','video.delete','video.script','video.footage','video.edit_cut',
  'video.submit','video.approve','video.reject','video.publish',
  'order.view','order.create','order.edit','order.delete','order.take','order.deliver',
  'order.submit','order.approve','order.reject','order.update_status',
  'report.view','report.attention','report.attention_all','report.export',
  'settings.view','settings.people','settings.catalog','settings.plan_topic','settings.template',
  'settings.role','settings.permission','settings.account_approve','settings.account_lock'
]),
('role-admin', 'Admin', 'Quản trị toàn bộ app', true, ARRAY[
  'overview.view',
  'task.view','task.view_all','task.view_mine','task.create','task.edit','task.delete','task.assign','task.update_status',
  'brand.view','brand.create','brand.edit','brand.delete','brand.view_channels','brand.docs',
  'web.view','web.create','web.edit','web.delete','web.tech_view','web.tech_check','web.entity','web.keyword',
  'web.content_create','web.content_edit','web.content_delete','web.content_assign',
  'web.outline_submit','web.outline_approve','web.outline_reject','web.post_submit','web.post_approve','web.post_reject',
  'web.publish','web.update_index','web.update_share','web.backlink','web.checktop','web.reoptimize',
  'web.growth_view','web.growth_edit','web.report_view',
  'social.view','social.create','social.edit','social.delete','social.post_create','social.post_edit','social.post_delete',
  'social.post_submit','social.post_approve','social.schedule','social.publish','social.report',
  'local.view','local.create','local.edit','local.delete','local.post_create','local.post_edit','local.post_delete',
  'local.photo','local.review','local.review_reply','local.report',
  'video.view','video.create','video.edit','video.delete','video.script','video.footage','video.edit_cut',
  'video.submit','video.approve','video.reject','video.publish',
  'order.view','order.create','order.edit','order.delete','order.take','order.deliver',
  'order.submit','order.approve','order.reject','order.update_status',
  'report.view','report.attention','report.attention_all','report.export',
  'settings.view','settings.people','settings.catalog','settings.plan_topic','settings.template',
  'settings.role','settings.permission','settings.account_approve','settings.account_lock'
]),
('role-leader', 'Leader Marketing', 'Quản lý toàn bộ team marketing', true, ARRAY[
  'overview.view',
  'task.view','task.view_all','task.create','task.edit','task.assign','task.update_status',
  'brand.view','brand.create','brand.edit','brand.view_channels','brand.docs',
  'web.view','web.create','web.edit','web.tech_view','web.tech_check','web.entity','web.keyword',
  'web.content_create','web.content_edit','web.content_assign','web.outline_approve','web.outline_reject',
  'web.post_approve','web.post_reject','web.publish','web.update_index','web.update_share',
  'web.backlink','web.checktop','web.reoptimize','web.growth_view','web.report_view',
  'social.view','social.create','social.edit','social.post_create','social.post_edit','social.post_approve','social.schedule','social.publish','social.report',
  'local.view','local.create','local.edit','local.post_create','local.post_edit','local.review','local.review_reply','local.report',
  'video.view','video.create','video.edit','video.approve','video.reject','video.publish',
  'order.view','order.create','order.edit','order.approve','order.reject','order.update_status',
  'report.view','report.attention','report.attention_all','report.export',
  'settings.view','settings.people','settings.catalog','settings.plan_topic','settings.template'
]),
('role-seo', 'SEO', 'Phụ trách SEO website', true, ARRAY[
  'overview.view','task.view','task.view_mine','task.update_status',
  'brand.view','brand.view_channels',
  'web.view','web.tech_view','web.tech_check','web.entity','web.keyword',
  'web.content_create','web.content_edit','web.outline_submit','web.post_submit',
  'web.publish','web.update_index','web.update_share','web.backlink','web.checktop','web.reoptimize',
  'web.growth_view','web.growth_edit','web.report_view',
  'report.view','report.attention'
]),
('role-content', 'Content Web', 'Viết content cho website', true, ARRAY[
  'overview.view','task.view','task.view_mine','task.update_status',
  'brand.view','web.view','web.content_create','web.content_edit','web.outline_submit','web.post_submit',
  'report.view','report.attention'
]),
('role-social', 'Social', 'Quản lý kênh và bài social', true, ARRAY[
  'overview.view','task.view','task.view_mine','task.update_status',
  'brand.view','social.view','social.post_create','social.post_edit','social.post_submit','social.publish','social.report',
  'report.view','report.attention'
]),
('role-local', 'Local SEO', 'Quản lý Local Map', true, ARRAY[
  'overview.view','task.view','task.view_mine','task.update_status',
  'brand.view','local.view','local.create','local.edit','local.post_create','local.post_edit',
  'local.photo','local.review','local.review_reply','local.report',
  'report.view','report.attention'
]),
('role-designer', 'Designer / Chụp ảnh', 'Xử lý order thiết kế', true, ARRAY[
  'overview.view','task.view','task.view_mine','task.update_status',
  'order.view','order.take','order.deliver','order.submit','order.update_status',
  'report.view'
]),
('role-video', 'Video', 'Sản xuất video', true, ARRAY[
  'overview.view','task.view','task.view_mine','task.update_status',
  'video.view','video.script','video.footage','video.edit_cut','video.submit','video.publish',
  'report.view'
]),
('role-viewer', 'Viewer / Ban Giám Đốc', 'Chỉ xem báo cáo', true, ARRAY[
  'overview.view','task.view','task.view_all',
  'brand.view','brand.view_channels',
  'web.view','web.report_view','web.growth_view',
  'social.view','social.report','local.view','local.report','video.view','order.view',
  'report.view','report.attention','report.attention_all'
]);

-- ============= SEED ADMIN USER =============
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@local';
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change, email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id, 'authenticated', 'authenticated', 'admin@local',
      crypt('Suviet888@@@', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('username','Admin','full_name','Quản trị hệ thống'),
      '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@local'),
      'email', admin_id::text, now(), now(), now()
    );
  END IF;

  -- Ensure profile exists with correct system flags
  INSERT INTO public.profiles (id, username, full_name, email, status, is_system_admin, must_change_password)
  VALUES (admin_id, 'Admin', 'Quản trị hệ thống', 'admin@local', 'Đang hoạt động', true, true)
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    is_system_admin = true,
    status = 'Đang hoạt động';

  -- Ensure super admin role
  INSERT INTO public.user_roles (user_id, role_id) VALUES (admin_id, 'role-super-admin')
  ON CONFLICT DO NOTHING;
END $$;
