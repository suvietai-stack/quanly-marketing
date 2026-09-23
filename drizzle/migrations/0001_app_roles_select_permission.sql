DROP POLICY IF EXISTS "Users can view own roles, admins all" ON public.app_roles;

CREATE POLICY "Users can view own roles, managers all"
  ON public.app_roles
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin(auth.uid())
    OR private.has_permission(auth.uid(), 'settings.role_view')
    OR private.has_permission(auth.uid(), 'settings.account_view')
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role_id = app_roles.id
    )
  );