CREATE TABLE public.goal_krs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE RESTRICT,
  metric_key text NOT NULL,
  label text,
  target_value numeric NOT NULL DEFAULT 0,
  brand_id text,
  website_id text,
  social_id text,
  deadline date,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_krs TO authenticated;
GRANT ALL ON public.goal_krs TO service_role;
ALTER TABLE public.goal_krs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.employee_kpi_items ADD COLUMN kr_id uuid REFERENCES public.goal_krs(id) ON DELETE RESTRICT;
CREATE INDEX employee_kpi_items_kr_id_idx ON public.employee_kpi_items(kr_id);
CREATE INDEX goal_krs_goal_id_idx ON public.goal_krs(goal_id);

CREATE POLICY goal_krs_select ON public.goal_krs FOR SELECT TO authenticated USING (
  private.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.employee_kpi_items i JOIN public.employee_kpi_periods p ON p.id = i.kpi_period_id
    WHERE i.kr_id = goal_krs.id AND p.user_id = auth.uid()));
CREATE POLICY goal_krs_insert_admin ON public.goal_krs FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY goal_krs_update_admin ON public.goal_krs FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY goal_krs_delete_admin ON public.goal_krs FOR DELETE TO authenticated USING (private.is_admin(auth.uid()));

CREATE TRIGGER set_goal_krs_updated_at BEFORE UPDATE ON public.goal_krs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();