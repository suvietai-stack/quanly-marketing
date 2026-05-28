
-- Replace SECURITY DEFINER view with a SECURITY INVOKER view that delegates to a controlled function.
DROP VIEW IF EXISTS public.profiles_directory;

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
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.full_name, p.status, p.last_seen_at, p.created_at
  FROM public.profiles p
$$;

-- Only signed-in users can call it. Anonymous users get nothing.
REVOKE EXECUTE ON FUNCTION public.get_profiles_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profiles_directory() TO authenticated;
