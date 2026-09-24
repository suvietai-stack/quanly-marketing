DROP POLICY IF EXISTS goals_select_auth ON public.goals;
CREATE POLICY goals_select_scoped ON public.goals FOR SELECT TO authenticated
USING (
  private.is_admin(auth.uid())
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.employee_kpi_periods p WHERE p.goal_id = goals.id AND p.user_id = auth.uid())
);