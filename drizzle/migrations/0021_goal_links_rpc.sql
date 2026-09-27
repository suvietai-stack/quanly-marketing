CREATE OR REPLACE FUNCTION public.goal_links(_goal uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được xem dữ liệu liên kết'; END IF;
  RETURN jsonb_build_object(
    'krs', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',k.id,'label',coalesce(k.label,k.metric_key),'status',k.status,
             'allocs',(SELECT count(*) FROM employee_kpi_items i WHERE i.kr_id=k.id))),'[]') FROM goal_krs k WHERE k.goal_id=_goal),
    'items', (SELECT count(*) FROM employee_kpi_items i WHERE i.metadata->>'goalId'=_goal::text),
    'periods', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'user',coalesce(pr.full_name,'—'),'status',p.status,
             'start',p.period_start,'end',p.period_end,
             'items',(SELECT count(*) FROM employee_kpi_items i WHERE i.kpi_period_id=p.id),
             'adjustments',(SELECT count(*) FROM employee_kpi_adjustments a JOIN employee_kpi_items i ON i.id=a.item_id WHERE i.kpi_period_id=p.id),
             'snapshots',(SELECT count(*) FROM employee_kpi_snapshots s WHERE s.kpi_period_id=p.id)) ORDER BY p.created_at),'[]')
           FROM employee_kpi_periods p LEFT JOIN profiles pr ON pr.id=p.user_id WHERE p.goal_id=_goal));
END $$;

CREATE OR REPLACE FUNCTION public.goal_delete_empty(_goal uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  IF NOT private.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được xóa mục tiêu'; END IF;
  PERFORM 1 FROM goals WHERE id=_goal FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mục tiêu không tồn tại'; END IF;
  PERFORM 1 FROM employee_kpi_periods WHERE goal_id=_goal FOR UPDATE;
  IF EXISTS (SELECT 1 FROM goal_krs WHERE goal_id=_goal) THEN RAISE EXCEPTION 'Không xóa: mục tiêu còn KR'; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_items WHERE metadata->>'goalId'=_goal::text) THEN RAISE EXCEPTION 'Không xóa: còn dòng phân bổ/chỉ tiêu'; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_periods p WHERE p.goal_id=_goal AND (p.status IN ('locked','closed')
      OR EXISTS (SELECT 1 FROM employee_kpi_items i WHERE i.kpi_period_id=p.id)
      OR EXISTS (SELECT 1 FROM employee_kpi_snapshots s WHERE s.kpi_period_id=p.id))) THEN
    RAISE EXCEPTION 'Không xóa: có kỳ KPI đã khóa hoặc đã có chỉ tiêu/kết quả chốt'; END IF;
  DELETE FROM employee_kpi_periods WHERE goal_id=_goal;
  GET DIAGNOSTICS n = ROW_COUNT;
  DELETE FROM goals WHERE id=_goal;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.goal_links(uuid), public.goal_delete_empty(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.goal_links(uuid), public.goal_delete_empty(uuid) TO authenticated;