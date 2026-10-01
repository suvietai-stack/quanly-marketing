CREATE OR REPLACE FUNCTION private.kpi_can(_uid uuid, _perm text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _uid IS NOT NULL AND (private.is_admin(_uid) OR private.sig_can(_uid, _perm));
$$;

-- goals
DROP POLICY IF EXISTS goals_select_scoped ON public.goals;
DROP POLICY IF EXISTS goals_insert_admin ON public.goals;
DROP POLICY IF EXISTS goals_update_admin ON public.goals;
DROP POLICY IF EXISTS goals_delete_admin ON public.goals;
CREATE POLICY goals_select ON public.goals FOR SELECT TO authenticated USING (
  private.kpi_can(auth.uid(),'kpi.view_all') OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM employee_kpi_periods p WHERE p.goal_id = goals.id AND p.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM goal_krs k JOIN employee_kpi_items i ON i.kr_id = k.id JOIN employee_kpi_periods p ON p.id = i.kpi_period_id WHERE k.goal_id = goals.id AND p.user_id = auth.uid()));
CREATE POLICY goals_insert ON public.goals FOR INSERT TO authenticated WITH CHECK (private.kpi_can(auth.uid(),'kpi.goal_create'));
CREATE POLICY goals_update ON public.goals FOR UPDATE TO authenticated
  USING (private.kpi_can(auth.uid(),'kpi.goal_edit') OR private.kpi_can(auth.uid(),'kpi.goal_archive'))
  WITH CHECK (private.kpi_can(auth.uid(),'kpi.goal_edit') OR private.kpi_can(auth.uid(),'kpi.goal_archive'));
CREATE POLICY goals_delete ON public.goals FOR DELETE TO authenticated USING (private.kpi_can(auth.uid(),'kpi.goal_delete'));

CREATE OR REPLACE FUNCTION public.goal_delete_guard() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
DECLARE r text[] := '{}'; n int;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.kpi_can(auth.uid(),'kpi.goal_delete') THEN RAISE EXCEPTION 'Bạn không có quyền xóa mục tiêu'; END IF;
  SELECT count(*) INTO n FROM goal_krs WHERE goal_id = OLD.id; IF n > 0 THEN r := r || format('còn %s KR (kể cả đã lưu trữ/hủy)', n); END IF;
  SELECT count(*) INTO n FROM employee_kpi_items WHERE metadata->>'goalId' = OLD.id::text; IF n > 0 THEN r := r || format('còn %s dòng phân bổ/chỉ tiêu', n); END IF;
  SELECT count(*) INTO n FROM employee_kpi_periods WHERE goal_id = OLD.id; IF n > 0 THEN r := r || format('còn %s kỳ KPI liên kết', n); END IF;
  IF array_length(r,1) > 0 THEN RAISE EXCEPTION 'Không thể xóa vĩnh viễn mục tiêu: %', array_to_string(r, '; '); END IF;
  RETURN OLD;
END $function$;

-- goal_krs
DROP POLICY IF EXISTS goal_krs_select ON public.goal_krs;
DROP POLICY IF EXISTS goal_krs_insert_admin ON public.goal_krs;
DROP POLICY IF EXISTS goal_krs_update_admin ON public.goal_krs;
DROP POLICY IF EXISTS goal_krs_delete_admin ON public.goal_krs;
CREATE POLICY goal_krs_select ON public.goal_krs FOR SELECT TO authenticated USING (
  private.kpi_can(auth.uid(),'kpi.view_all')
  OR EXISTS (SELECT 1 FROM employee_kpi_items i JOIN employee_kpi_periods p ON p.id = i.kpi_period_id WHERE i.kr_id = goal_krs.id AND p.user_id = auth.uid()));
CREATE POLICY goal_krs_insert ON public.goal_krs FOR INSERT TO authenticated WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_assign'));
CREATE POLICY goal_krs_update ON public.goal_krs FOR UPDATE TO authenticated
  USING (private.kpi_can(auth.uid(),'kpi.kr_adjust') OR private.kpi_can(auth.uid(),'kpi.kr_assign'))
  WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_adjust') OR private.kpi_can(auth.uid(),'kpi.kr_assign'));
CREATE POLICY goal_krs_delete ON public.goal_krs FOR DELETE TO authenticated USING (private.kpi_can(auth.uid(),'kpi.kr_adjust'));

-- periods
DROP POLICY IF EXISTS kpi_periods_select ON public.employee_kpi_periods;
DROP POLICY IF EXISTS kpi_periods_insert_admin ON public.employee_kpi_periods;
DROP POLICY IF EXISTS kpi_periods_update_admin ON public.employee_kpi_periods;
DROP POLICY IF EXISTS kpi_periods_delete_admin ON public.employee_kpi_periods;
CREATE POLICY kpi_periods_select ON public.employee_kpi_periods FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.kpi_can(auth.uid(),'kpi.view_all'));
CREATE POLICY kpi_periods_insert ON public.employee_kpi_periods FOR INSERT TO authenticated WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_assign'));
CREATE POLICY kpi_periods_update ON public.employee_kpi_periods FOR UPDATE TO authenticated
  USING (private.kpi_can(auth.uid(),'kpi.kr_assign') OR private.kpi_can(auth.uid(),'kpi.kr_adjust') OR private.kpi_can(auth.uid(),'kpi.period_manage'))
  WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_assign') OR private.kpi_can(auth.uid(),'kpi.kr_adjust') OR private.kpi_can(auth.uid(),'kpi.period_manage'));
CREATE POLICY kpi_periods_delete ON public.employee_kpi_periods FOR DELETE TO authenticated USING (private.kpi_can(auth.uid(),'kpi.kr_adjust'));

-- Đổi trạng thái kỳ chỉ với quyền Quản lý kỳ (giữ nguyên trigger khóa/chốt hiện có)
CREATE OR REPLACE FUNCTION private.kpi_period_perm_guard() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.status IS DISTINCT FROM OLD.status
     AND NOT (OLD.status = 'draft' AND NEW.status = 'active' AND private.kpi_can(auth.uid(),'kpi.kr_assign'))
     AND NOT private.kpi_can(auth.uid(),'kpi.period_manage') THEN
    RAISE EXCEPTION 'Bạn không có quyền Quản lý kỳ KPI';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS kpi_period_perm_guard ON public.employee_kpi_periods;
CREATE TRIGGER kpi_period_perm_guard BEFORE UPDATE ON public.employee_kpi_periods FOR EACH ROW EXECUTE FUNCTION private.kpi_period_perm_guard();

-- items
DROP POLICY IF EXISTS kpi_items_select ON public.employee_kpi_items;
DROP POLICY IF EXISTS kpi_items_insert_admin ON public.employee_kpi_items;
DROP POLICY IF EXISTS kpi_items_update_admin ON public.employee_kpi_items;
DROP POLICY IF EXISTS kpi_items_delete_admin ON public.employee_kpi_items;
CREATE POLICY kpi_items_select ON public.employee_kpi_items FOR SELECT TO authenticated USING (
  private.kpi_can(auth.uid(),'kpi.view_all')
  OR EXISTS (SELECT 1 FROM employee_kpi_periods p WHERE p.id = employee_kpi_items.kpi_period_id AND p.user_id = auth.uid()));
CREATE POLICY kpi_items_insert ON public.employee_kpi_items FOR INSERT TO authenticated WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_assign'));
CREATE POLICY kpi_items_update ON public.employee_kpi_items FOR UPDATE TO authenticated
  USING (private.kpi_can(auth.uid(),'kpi.kr_adjust')) WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_adjust'));
CREATE POLICY kpi_items_delete ON public.employee_kpi_items FOR DELETE TO authenticated USING (private.kpi_can(auth.uid(),'kpi.kr_adjust'));

-- snapshots
DROP POLICY IF EXISTS kpi_snap_select ON public.employee_kpi_snapshots;
DROP POLICY IF EXISTS kpi_snap_insert_admin ON public.employee_kpi_snapshots;
CREATE POLICY kpi_snap_select ON public.employee_kpi_snapshots FOR SELECT TO authenticated USING (
  private.kpi_can(auth.uid(),'kpi.view_all')
  OR EXISTS (SELECT 1 FROM employee_kpi_periods p WHERE p.id = employee_kpi_snapshots.kpi_period_id AND p.user_id = auth.uid()));
CREATE POLICY kpi_snap_insert ON public.employee_kpi_snapshots FOR INSERT TO authenticated WITH CHECK (private.kpi_can(auth.uid(),'kpi.period_manage'));

-- adjustments
DROP POLICY IF EXISTS kpi_adj_select_admin ON public.employee_kpi_adjustments;
DROP POLICY IF EXISTS kpi_adj_insert_admin ON public.employee_kpi_adjustments;
CREATE POLICY kpi_adj_select ON public.employee_kpi_adjustments FOR SELECT TO authenticated USING (private.kpi_can(auth.uid(),'kpi.view_all'));
CREATE POLICY kpi_adj_insert ON public.employee_kpi_adjustments FOR INSERT TO authenticated WITH CHECK (private.kpi_can(auth.uid(),'kpi.kr_adjust') AND created_by = auth.uid());

-- Giữ quyền xem KPI cá nhân hiện có cho mọi vai trò
UPDATE public.app_roles SET permissions = array_append(permissions, 'kpi.view_own') WHERE NOT ('kpi.view_own' = ANY(permissions));