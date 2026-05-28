
-- 1) Tighten SELECT policies on sensitive tables
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view overrides" ON public.user_permission_overrides;
DROP POLICY IF EXISTS "Authenticated can view user_roles" ON public.user_roles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own role assignment"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own overrides"
ON public.user_permission_overrides FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all overrides"
ON public.user_permission_overrides FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- 2) Safe directory view exposing only display-safe columns to authenticated users
CREATE OR REPLACE VIEW public.profiles_directory
WITH (security_invoker = false) AS
SELECT id, username, full_name, status, last_seen_at, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_directory TO authenticated;

-- 3) Revoke public EXECUTE on SECURITY DEFINER helper functions.
-- They are still invoked internally by RLS policies/triggers (which run as the function owner).
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_active(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
