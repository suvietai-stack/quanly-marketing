CREATE TABLE public.employee_kpi_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.employee_kpi_items(id) ON DELETE CASCADE,
  field text NOT NULL DEFAULT 'targetValue',
  from_value numeric NOT NULL,
  to_value numeric NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.employee_kpi_adjustments TO authenticated;
GRANT ALL ON public.employee_kpi_adjustments TO service_role;
ALTER TABLE public.employee_kpi_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY kpi_adj_select_admin ON public.employee_kpi_adjustments FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
CREATE POLICY kpi_adj_insert_admin ON public.employee_kpi_adjustments FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()) AND created_by = auth.uid());

CREATE TABLE public.employee_kpi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_period_id uuid NOT NULL UNIQUE REFERENCES public.employee_kpi_periods(id) ON DELETE CASCADE,
  engine_version text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  locked_by uuid,
  locked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.employee_kpi_snapshots TO authenticated;
GRANT ALL ON public.employee_kpi_snapshots TO service_role;
ALTER TABLE public.employee_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY kpi_snap_select ON public.employee_kpi_snapshots FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.employee_kpi_periods p WHERE p.id = kpi_period_id AND (p.user_id = auth.uid() OR private.is_admin(auth.uid()))));
CREATE POLICY kpi_snap_insert_admin ON public.employee_kpi_snapshots FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.kpi_guard_locked_items()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE st text;
BEGIN
  SELECT status INTO st FROM public.employee_kpi_periods WHERE id = COALESCE(NEW.kpi_period_id, OLD.kpi_period_id);
  IF st IN ('locked','closed') THEN
    RAISE EXCEPTION 'Kỳ KPI đã khóa — không thay đổi chỉ tiêu';
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER kpi_items_lock_guard BEFORE INSERT OR UPDATE OR DELETE ON public.employee_kpi_items FOR EACH ROW EXECUTE FUNCTION public.kpi_guard_locked_items();

CREATE OR REPLACE FUNCTION public.kpi_guard_period_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE o int; n int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('locked','closed') THEN RAISE EXCEPTION 'Kỳ KPI đã khóa — không xóa'; END IF;
    RETURN OLD;
  END IF;
  o := array_position(ARRAY['draft','active','locked','closed'], OLD.status);
  n := array_position(ARRAY['draft','active','locked','closed'], NEW.status);
  IF n < o THEN RAISE EXCEPTION 'Không mở lại kỳ KPI đã khóa'; END IF;
  IF OLD.status IN ('locked','closed') AND (NEW.user_id <> OLD.user_id OR NEW.period_start <> OLD.period_start OR NEW.period_end <> OLD.period_end) THEN
    RAISE EXCEPTION 'Kỳ KPI đã khóa — không sửa';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER kpi_periods_status_guard BEFORE UPDATE OR DELETE ON public.employee_kpi_periods FOR EACH ROW EXECUTE FUNCTION public.kpi_guard_period_status();