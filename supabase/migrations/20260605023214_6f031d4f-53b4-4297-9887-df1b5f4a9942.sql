DROP POLICY IF EXISTS "Admins can view roles" ON public.app_roles;

CREATE POLICY "Authenticated can view roles"
  ON public.app_roles
  FOR SELECT
  TO authenticated
  USING (true);