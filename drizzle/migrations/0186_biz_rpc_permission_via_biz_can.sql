-- RPC biz_cycle_milestones: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_cycle_milestones(_kind text, _period_start date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r jsonb; ex jsonb; ek text;
BEGIN
  IF NOT (public.biz_can(auth.uid(),'biz.deadline_manage') OR public.biz_can(auth.uid(),'biz.goal_submit') OR public.biz_can(auth.uid(),'biz.plan_submit') OR public.biz_can(auth.uid(),'biz.report_submit') OR public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.view_all') OR public.biz_can(auth.uid(),'biz.goal_approve')) THEN RAISE EXCEPTION 'Không có quyền xem deadline.'; END IF;
  IF _kind NOT IN ('report_day','report_week') OR _period_start IS NULL OR _period_start < '2000-01-01' OR _period_start > '2200-01-01' THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  IF _kind='report_week' AND extract(isodow FROM _period_start)<>1 THEN RAISE EXCEPTION 'Kỳ tuần phải bắt đầu từ Thứ Hai.'; END IF;
  ek:=to_char(_period_start,'YYYY-MM-DD');
  SELECT data->_kind INTO r FROM public.biz_deadline_config WHERE id=true;
  IF r IS NULL THEN RETURN jsonb_build_object('open',null,'due',null,'late_close',null); END IF;
  ex:=r->'exceptions'->ek;
  RETURN jsonb_build_object(
    'open', CASE WHEN ex->>'open' IS NOT NULL THEN ((ex->>'open')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_cycle_milestone_at(r->'open',_kind,_period_start) END,
    'due', CASE WHEN ex->>'due' IS NOT NULL THEN ((ex->>'due')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') WHEN jsonb_typeof(ex)='string' THEN ((ex#>>'{}')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_cycle_milestone_at(r->'due',_kind,_period_start) END,
    'late_close', CASE WHEN ex->>'late_close' IS NOT NULL THEN ((ex->>'late_close')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_cycle_milestone_at(r->'late_close',_kind,_period_start) END);
END $function$;

-- RPC biz_deadline_save: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_deadline_save(_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE k text; r jsonb; ek text; ev jsonb; ms text; mr jsonb; y int; p int; pmax int; m jsonb; v_open timestamptz; v_due timestamptz; v_close timestamptz; old jsonb;
BEGIN
  IF NOT public.biz_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý deadline.'; END IF;
  IF jsonb_typeof(_data) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  SELECT data INTO old FROM public.biz_deadline_config WHERE id=true FOR UPDATE; FOR k,r IN SELECT * FROM jsonb_each(_data) LOOP IF k IN ('report_day','report_week','report_month','report_quarter') AND r IS DISTINCT FROM old->k THEN FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP IF r->ms IS NULL OR r->ms='null'::jsonb OR (k IN ('report_day','report_week') AND r->ms->>'offset_days' IS NULL) OR (k IN ('report_month','report_quarter') AND r->ms->>'day' IS NULL) THEN RAISE EXCEPTION 'Báo cáo cần đủ ba mốc mở nộp, hạn cuối và đóng nộp bù.'; END IF; END LOOP; END IF;
    IF k NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year','report_day','report_week') OR jsonb_typeof(r)<>'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
    IF k IN ('report_day','report_week') THEN
      FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
        mr:=r->ms;
        IF mr IS NOT NULL AND mr<>'null'::jsonb THEN
          IF jsonb_typeof(mr)<>'object' THEN RAISE EXCEPTION 'Cấu hình mốc không hợp lệ.'; END IF;
          IF mr->>'offset_days' IS NOT NULL AND ((mr->>'offset_days')::numeric<>trunc((mr->>'offset_days')::numeric) OR (mr->>'offset_days')::int NOT BETWEEN 0 AND 62) THEN RAISE EXCEPTION 'Số ngày lùi phải từ 0 đến 62.'; END IF;
          IF coalesce((mr->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((mr->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ không hợp lệ.'; END IF;
        END IF;
      END LOOP;
      IF r ? 'exceptions' THEN
        IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
          IF ek !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
          IF jsonb_typeof(ev)='string' THEN PERFORM (ev#>>'{}')::timestamp;
          ELSIF jsonb_typeof(ev)='object' THEN
            FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
              IF ev->>ms IS NOT NULL THEN PERFORM (ev->>ms)::timestamp; END IF;
            END LOOP;
          ELSE RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        END LOOP;
      END IF;
      m:=jsonb_build_object(
        'open', public.biz_cycle_milestone_at(r->'open',k,'2026-11-02'::date),
        'due', public.biz_cycle_milestone_at(r->'due',k,'2026-11-02'::date),
        'late_close', public.biz_cycle_milestone_at(r->'late_close',k,'2026-11-02'::date));
      v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
      IF v_open IS NOT NULL AND v_due IS NOT NULL AND v_open > v_due THEN RAISE EXCEPTION 'Ngày mở nộp phải trước hạn cuối.'; END IF;
      IF v_due IS NOT NULL AND v_close IS NOT NULL AND v_due >= v_close THEN RAISE EXCEPTION 'Hạn cuối phải trước ngày đóng nộp bù.'; END IF;
      IF v_open IS NOT NULL AND v_close IS NOT NULL AND v_open >= v_close THEN RAISE EXCEPTION 'Ngày mở nộp phải trước ngày đóng nộp bù.'; END IF;
    ELSIF r ? 'due' OR r ? 'open' OR r ? 'late_close' THEN
      FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
        mr:=r->ms;
        IF mr IS NOT NULL AND mr<>'null'::jsonb THEN
          IF jsonb_typeof(mr)<>'object' THEN RAISE EXCEPTION 'Cấu hình mốc không hợp lệ.'; END IF;
          IF mr->>'day' IS NOT NULL AND ((mr->>'day')::numeric<>trunc((mr->>'day')::numeric) OR (mr->>'day')::int NOT BETWEEN 1 AND 31) THEN RAISE EXCEPTION 'Ngày phải từ 1 đến 31.'; END IF;
          IF coalesce(mr->>'phase','during') NOT IN ('before','during','after') OR coalesce((mr->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((mr->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ hoặc kiểu thời điểm không hợp lệ.'; END IF;
        END IF;
      END LOOP;
      IF r ? 'exceptions' THEN
        IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
          IF ek !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
          IF jsonb_typeof(ev)='string' THEN PERFORM (ev#>>'{}')::timestamp;
          ELSIF jsonb_typeof(ev)='object' THEN
            FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
              IF ev->>ms IS NOT NULL THEN PERFORM (ev->>ms)::timestamp; END IF;
            END LOOP;
          ELSE RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        END LOOP;
      END IF;
      pmax:=CASE WHEN k LIKE '%month' THEN 12 WHEN k LIKE '%quarter' THEN 4 ELSE 1 END;
      FOR y IN 2024..2028 LOOP
        FOR p IN 1..pmax LOOP
          m:=jsonb_build_object(
            'open', public.biz_milestone_at(r->'open',k,y,p),
            'due', public.biz_milestone_at(r->'due',k,y,p),
            'late_close', public.biz_milestone_at(r->'late_close',k,y,p));
          v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
          IF v_open IS NOT NULL AND v_due IS NOT NULL AND v_open > v_due THEN RAISE EXCEPTION 'Ngày mở nộp phải trước hạn cuối (kiểm tra kỳ %-%).', y, p; END IF;
          IF v_due IS NOT NULL AND v_close IS NOT NULL AND v_due >= v_close THEN RAISE EXCEPTION 'Hạn cuối phải trước ngày đóng nộp bù (kiểm tra kỳ %-%).', y, p; END IF;
          IF v_open IS NOT NULL AND v_close IS NOT NULL AND v_open >= v_close THEN RAISE EXCEPTION 'Ngày mở nộp phải trước ngày đóng nộp bù (kiểm tra kỳ %-%).', y, p; END IF;
        END LOOP;
      END LOOP;
    ELSE
      IF r->>'day' IS NOT NULL AND ((r->>'day')::numeric<>trunc((r->>'day')::numeric) OR (r->>'day')::int NOT BETWEEN 1 AND 31) THEN RAISE EXCEPTION 'Ngày phải từ 1 đến 31.'; END IF;
      IF coalesce(r->>'phase','during') NOT IN ('before','during','after') OR coalesce((r->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((r->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ hoặc kiểu deadline không hợp lệ.'; END IF;
      IF r ? 'exceptions' THEN
        IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
          IF ek !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' OR jsonb_typeof(ev)<>'string' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
          PERFORM (ev#>>'{}')::timestamp;
        END LOOP;
      END IF;
    END IF;
  END LOOP;
  SELECT data INTO old FROM public.biz_deadline_config WHERE id=true;
  INSERT INTO public.biz_deadline_config(id,data,updated_by,updated_at) VALUES(true,_data,auth.uid(),now()) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_by=excluded.updated_by,updated_at=now();
  INSERT INTO public.biz_deadline_config_log(actor_id,old_data,new_data) VALUES(auth.uid(),coalesce(old,'{}'::jsonb),_data);
END $function$;