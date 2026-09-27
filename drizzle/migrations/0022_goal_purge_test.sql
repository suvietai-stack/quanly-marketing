CREATE OR REPLACE FUNCTION public.kpi_guard_locked_items() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE st text;
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('app.kpi_purge', true) = 'on' THEN RETURN OLD; END IF;
  SELECT status INTO st FROM public.employee_kpi_periods WHERE id = COALESCE(NEW.kpi_period_id, OLD.kpi_period_id);
  IF st IN ('locked','closed') THEN
    RAISE EXCEPTION 'Kỳ KPI đã khóa — không thay đổi chỉ tiêu';
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE OR REPLACE FUNCTION public.kpi_guard_period_status() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE o int; n int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('locked','closed') AND coalesce(current_setting('app.kpi_purge', true),'') <> 'on' THEN RAISE EXCEPTION 'Kỳ KPI đã khóa — không xóa'; END IF;
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

-- Xem trước / xóa triệt để mục tiêu THỬ NGHIỆM. _execute=false chỉ trả danh sách + lý do chặn.
CREATE OR REPLACE FUNCTION public.goal_purge_test(_goal uuid, _execute boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pids uuid[]; iids uuid[]; sids uuid[]; why text[] := '{}'; res jsonb;
BEGIN
  IF NOT private.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được dọn dữ liệu thử'; END IF;
  PERFORM 1 FROM goals WHERE id=_goal FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mục tiêu không tồn tại'; END IF;
  SELECT coalesce(array_agg(id),'{}') INTO pids FROM employee_kpi_periods WHERE goal_id=_goal
    OR id IN (SELECT kpi_period_id FROM employee_kpi_items WHERE metadata->>'goalId'=_goal::text);
  SELECT coalesce(array_agg(id),'{}') INTO iids FROM employee_kpi_items WHERE kpi_period_id = ANY(pids);
  SELECT coalesce(array_agg(id),'{}') INTO sids FROM employee_kpi_snapshots WHERE kpi_period_id = ANY(pids);
  IF EXISTS (SELECT 1 FROM goal_krs WHERE goal_id=_goal) THEN why := why || 'Mục tiêu còn KR chung'::text; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_periods WHERE id = ANY(pids) AND goal_id IS DISTINCT FROM _goal AND goal_id IS NOT NULL) THEN why := why || 'Kỳ KPI gắn với mục tiêu khác'::text; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_items WHERE id = ANY(iids) AND (kr_id IS NOT NULL OR metadata->>'goalId' IS DISTINCT FROM _goal::text)) THEN why := why || 'Kỳ có chỉ tiêu không thuộc riêng mục tiêu này'::text; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_adjustments WHERE item_id = ANY(iids)) THEN why := why || 'Có lịch sử điều chỉnh chỉ tiêu'::text; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_items WHERE id = ANY(iids) AND (coalesce((metadata->>'lockedActual')::numeric,0) <> 0 OR coalesce(jsonb_array_length(metadata->'lockedEvidence'),0) > 0)) THEN why := why || 'Chỉ tiêu đã có kết quả/bằng chứng'::text; END IF;
  IF EXISTS (SELECT 1 FROM employee_kpi_snapshots s, jsonb_array_elements(s.data->'items') x WHERE s.id = ANY(sids)
      AND (coalesce((x->>'actual')::numeric,0) <> 0 OR coalesce(jsonb_array_length(x->'evidence'),0) > 0)) THEN why := why || 'Bản chốt có kết quả khác 0'::text; END IF;
  res := jsonb_build_object('blockers', to_jsonb(why),
    'periods', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'user',coalesce(pr.full_name,'—'),'status',p.status,'start',p.period_start,'end',p.period_end)),'[]') FROM employee_kpi_periods p LEFT JOIN profiles pr ON pr.id=p.user_id WHERE p.id = ANY(pids)),
    'items', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',i.id,'metric',i.metric_key,'target',i.target_value)),'[]') FROM employee_kpi_items i WHERE i.id = ANY(iids)),
    'snapshots', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'at',s.locked_at)),'[]') FROM employee_kpi_snapshots s WHERE s.id = ANY(sids)));
  IF NOT _execute THEN RETURN res; END IF;
  IF array_length(why,1) > 0 THEN RAISE EXCEPTION 'Không thể dọn: %', array_to_string(why,'; '); END IF;
  PERFORM set_config('app.kpi_purge','on',true);
  DELETE FROM employee_kpi_snapshots WHERE id = ANY(sids);
  DELETE FROM employee_kpi_items WHERE id = ANY(iids);
  DELETE FROM employee_kpi_periods WHERE id = ANY(pids);
  DELETE FROM goals WHERE id=_goal;
  PERFORM set_config('app.kpi_purge','off',true);
  RETURN res;
END $$;
REVOKE ALL ON FUNCTION public.goal_purge_test(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.goal_purge_test(uuid, boolean) TO authenticated;