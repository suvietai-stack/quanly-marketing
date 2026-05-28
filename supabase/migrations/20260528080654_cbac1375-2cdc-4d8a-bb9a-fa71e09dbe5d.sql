CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role_id = 'role-super-admin'
  );
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role_id IN ('role-super-admin','role-admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.user_permission_overrides
        WHERE user_id = _user_id AND use_custom = true
      ) THEN
        EXISTS (
          SELECT 1 FROM public.user_permission_overrides
          WHERE user_id = _user_id AND _permission = ANY(permissions)
        )
      ELSE
        EXISTS (
          SELECT 1
          FROM public.user_roles ur
          JOIN public.app_roles r ON r.id = ur.role_id
          WHERE ur.user_id = _user_id AND _permission = ANY(r.permissions)
        )
    END;
$$;

CREATE OR REPLACE FUNCTION private.is_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND status = 'Đang hoạt động'
  );
$$;

CREATE OR REPLACE FUNCTION private.get_profiles_directory()
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  status account_status,
  last_seen_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.full_name, p.status, p.last_seen_at, p.created_at
  FROM public.profiles p;
$$;

REVOKE ALL ON FUNCTION private.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_active(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.get_profiles_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_profiles_directory() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.is_super_admin(_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.is_admin(_user_id);
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.has_permission(_user_id, _permission);
$$;

CREATE OR REPLACE FUNCTION public.is_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.is_active(_user_id);
$$;

CREATE OR REPLACE FUNCTION public.get_profiles_directory()
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  status account_status,
  last_seen_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT * FROM private.get_profiles_directory();
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_active(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_profiles_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profiles_directory() TO authenticated;