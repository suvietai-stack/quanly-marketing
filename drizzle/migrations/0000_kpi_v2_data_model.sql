-- ============ KPI V2 data model (independent, additive only) ============

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  brand_id text,
  website_id text,
  social_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_kpi_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type text NOT NULL DEFAULT 'month',
  period_start date NOT NULL,
  period_end date NOT NULL,
  goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_kpi_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_period_id uuid NOT NULL REFERENCES public.employee_kpi_periods(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  label text,
  target_value numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'count',
  target_operator text NOT NULL DEFAULT '>=',
  brand_id text,
  website_id text,
  social_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_kpi_periods_user ON public.employee_kpi_periods(user_id, period_start);
CREATE INDEX idx_kpi_items_period ON public.employee_kpi_items(kpi_period_id);
CREATE INDEX idx_goals_period ON public.goals(period_start, period_end);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_kpi_periods TO authenticated;
GRANT ALL ON public.employee_kpi_periods TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_kpi_items TO authenticated;
GRANT ALL ON public.employee_kpi_items TO service_role;

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_kpi_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_kpi_items ENABLE ROW LEVEL SECURITY;

-- goals: everyone signed-in can read; only admins manage
CREATE POLICY "goals_select_auth" ON public.goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "goals_insert_admin" ON public.goals FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "goals_update_admin" ON public.goals FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "goals_delete_admin" ON public.goals FOR DELETE TO authenticated USING (private.is_admin(auth.uid()));

-- kpi periods: owner reads own, admin reads all; admin manages
CREATE POLICY "kpi_periods_select" ON public.employee_kpi_periods FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "kpi_periods_insert_admin" ON public.employee_kpi_periods FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "kpi_periods_update_admin" ON public.employee_kpi_periods FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "kpi_periods_delete_admin" ON public.employee_kpi_periods FOR DELETE TO authenticated USING (private.is_admin(auth.uid()));

-- kpi items follow their period
CREATE POLICY "kpi_items_select" ON public.employee_kpi_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.employee_kpi_periods p WHERE p.id = kpi_period_id AND (p.user_id = auth.uid() OR private.is_admin(auth.uid()))));
CREATE POLICY "kpi_items_insert_admin" ON public.employee_kpi_items FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "kpi_items_update_admin" ON public.employee_kpi_items FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "kpi_items_delete_admin" ON public.employee_kpi_items FOR DELETE TO authenticated USING (private.is_admin(auth.uid()));

CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_kpi_periods_updated_at BEFORE UPDATE ON public.employee_kpi_periods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_kpi_items_updated_at BEFORE UPDATE ON public.employee_kpi_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Security fix: app_roles no longer fully readable ============
DROP POLICY IF EXISTS "Authenticated can view roles" ON public.app_roles;

CREATE POLICY "Users can view own roles, admins all"
  ON public.app_roles
  FOR SELECT
  TO authenticated
  USING (
    private.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role_id = app_roles.id
    )
  );