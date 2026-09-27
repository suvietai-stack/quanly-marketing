CREATE OR REPLACE FUNCTION public.goal_delete_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE r text[] := '{}'; n int;
BEGIN
  IF NOT private.is_admin(auth.uid()) AND auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'Chỉ Admin được xóa mục tiêu'; END IF;
  SELECT count(*) INTO n FROM goal_krs WHERE goal_id = OLD.id; IF n > 0 THEN r := r || format('còn %s KR (kể cả đã lưu trữ/hủy)', n); END IF;
  SELECT count(*) INTO n FROM employee_kpi_items WHERE metadata->>'goalId' = OLD.id::text; IF n > 0 THEN r := r || format('còn %s dòng phân bổ/chỉ tiêu', n); END IF;
  SELECT count(*) INTO n FROM employee_kpi_periods WHERE goal_id = OLD.id; IF n > 0 THEN r := r || format('còn %s kỳ KPI liên kết', n); END IF;
  IF array_length(r,1) > 0 THEN RAISE EXCEPTION 'Không thể xóa vĩnh viễn mục tiêu: %', array_to_string(r, '; '); END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS goals_delete_guard ON public.goals;
CREATE TRIGGER goals_delete_guard BEFORE DELETE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.goal_delete_guard();