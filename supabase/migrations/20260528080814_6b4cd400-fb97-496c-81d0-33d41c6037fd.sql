DO $$
DECLARE
  pol record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        COALESCE(qual, '') LIKE '%is_admin(auth.uid())%'
        OR COALESCE(qual, '') LIKE '%is_super_admin(auth.uid())%'
        OR COALESCE(qual, '') LIKE '%is_active(auth.uid())%'
        OR COALESCE(qual, '') LIKE '%has_permission(auth.uid()%'
        OR COALESCE(with_check, '') LIKE '%is_admin(auth.uid())%'
        OR COALESCE(with_check, '') LIKE '%is_super_admin(auth.uid())%'
        OR COALESCE(with_check, '') LIKE '%is_active(auth.uid())%'
        OR COALESCE(with_check, '') LIKE '%has_permission(auth.uid()%'
      )
  LOOP
    new_qual := pol.qual;
    new_check := pol.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := replace(new_qual, 'public.is_super_admin(', 'private.is_super_admin(');
      new_qual := replace(new_qual, 'public.is_admin(', 'private.is_admin(');
      new_qual := replace(new_qual, 'public.is_active(', 'private.is_active(');
      new_qual := replace(new_qual, 'public.has_permission(', 'private.has_permission(');
      new_qual := replace(new_qual, 'is_super_admin(', 'private.is_super_admin(');
      new_qual := replace(new_qual, 'is_admin(', 'private.is_admin(');
      new_qual := replace(new_qual, 'is_active(', 'private.is_active(');
      new_qual := replace(new_qual, 'has_permission(', 'private.has_permission(');
      new_qual := replace(new_qual, 'private.private.', 'private.');
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := replace(new_check, 'public.is_super_admin(', 'private.is_super_admin(');
      new_check := replace(new_check, 'public.is_admin(', 'private.is_admin(');
      new_check := replace(new_check, 'public.is_active(', 'private.is_active(');
      new_check := replace(new_check, 'public.has_permission(', 'private.has_permission(');
      new_check := replace(new_check, 'is_super_admin(', 'private.is_super_admin(');
      new_check := replace(new_check, 'is_admin(', 'private.is_admin(');
      new_check := replace(new_check, 'is_active(', 'private.is_active(');
      new_check := replace(new_check, 'has_permission(', 'private.has_permission(');
      new_check := replace(new_check, 'private.private.', 'private.');
    END IF;

    stmt := format('ALTER POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    IF new_qual IS NOT NULL THEN
      stmt := stmt || ' USING (' || new_qual || ')';
    END IF;
    IF new_check IS NOT NULL THEN
      stmt := stmt || ' WITH CHECK (' || new_check || ')';
    END IF;
    EXECUTE stmt;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_active(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profiles_directory() TO authenticated;