-- Nâng cấp cấu hình deadline: 3 mốc (mở nộp / hạn cuối / đóng nộp bù) + lịch sử thay đổi.
-- Bảo toàn cấu hình cũ: deadline hiện có trở thành mốc "due"; open/late_close để trống = không chặn.

-- Lịch sử thay đổi cấu hình (không xóa).
CREATE TABLE public.biz_deadline_config_log(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id),
  old_data jsonb NOT NULL,
  new_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.biz_deadline_config_log TO authenticated;
GRANT ALL ON public.biz_deadline_config_log TO service_role;
ALTER TABLE public.biz_deadline_config_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deadline config log read" ON public.biz_deadline_config_log FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(),'biz.deadline_manage'));

-- Backfill shape cũ {phase,day,hour,minute,exceptions:{kỳ:"..."}} sang {open,due,late_close,exceptions:{kỳ:{due:"..."}}}.
UPDATE public.biz_deadline_config c SET data = coalesce((
  SELECT jsonb_object_agg(k, CASE
    WHEN v ? 'due' OR v ? 'open' OR v ? 'late_close' THEN v
    ELSE jsonb_build_object(
      'open', null,
      'due', CASE WHEN v ? 'day' THEN jsonb_build_object('phase', coalesce(v->>'phase','during'), 'day', (v->>'day')::int, 'hour', coalesce((v->>'hour')::int,17), 'minute', coalesce((v->>'minute')::int,0)) ELSE null END,
      'late_close', null,
      'exceptions', coalesce((SELECT jsonb_object_agg(ek, jsonb_build_object('due', ev#>>'{}')) FROM jsonb_each(v->'exceptions') e(ek,ev)), '{}'::jsonb)
    )
  END) FROM jsonb_each(c.data) e(k,v)
), '{}'::jsonb) WHERE id = true;

-- Tính một mốc từ rule {phase,day,hour,minute}; rule NULL → NULL (không chặn).
CREATE OR REPLACE FUNCTION public.biz_milestone_at(_rule jsonb, _kind text, _year int, _period int) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE months int; first_month int; base date; day_no int;
BEGIN
  IF _rule IS NULL OR jsonb_typeof(_rule) IS DISTINCT FROM 'object' OR _rule->>'day' IS NULL THEN RETURN NULL; END IF;
  months:=CASE WHEN _kind LIKE '%month' THEN 1 WHEN _kind LIKE '%quarter' THEN 3 ELSE 12 END;
  first_month:=(_period-1)*months+1;
  base:=make_date(_year,first_month,1);
  base:=CASE _rule->>'phase' WHEN 'before' THEN (base-interval '1 month')::date WHEN 'after' THEN (base+make_interval(months=>months))::date ELSE base END;
  day_no:=least((_rule->>'day')::int,extract(day FROM base+interval '1 month - 1 day')::int);
  RETURN ((base+(day_no-1))::timestamp+make_interval(hours=>coalesce((_rule->>'hour')::int,17),mins=>coalesce((_rule->>'minute')::int,0))) AT TIME ZONE 'Asia/Ho_Chi_Minh';
END $$;

-- Trả 3 mốc cho một kỳ: {open, due, late_close}; ngoại lệ kỳ ghi đè từng mốc.
CREATE OR REPLACE FUNCTION public.biz_deadline_milestones(_kind text, _year int, _period int DEFAULT 1) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; ex jsonb; ek text; months int;
BEGIN
  IF NOT (private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.goal_submit') OR private.sig_can(auth.uid(),'biz.plan_submit') OR private.sig_can(auth.uid(),'biz.report_submit') OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.goal_approve')) THEN RAISE EXCEPTION 'Không có quyền xem deadline.'; END IF;
  IF _kind NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year') OR _year NOT BETWEEN 2000 AND 2200 THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  months:=CASE WHEN _kind LIKE '%month' THEN 1 WHEN _kind LIKE '%quarter' THEN 3 ELSE 12 END;
  IF _period<1 OR _period>12/months THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  ek:=_year::text||'-'||lpad(_period::text,2,'0');
  SELECT data->_kind INTO r FROM public.biz_deadline_config WHERE id=true;
  IF r IS NULL THEN RETURN jsonb_build_object('open',null,'due',null,'late_close',null); END IF;
  ex:=r->'exceptions'->ek;
  RETURN jsonb_build_object(
    'open', CASE WHEN ex->>'open' IS NOT NULL THEN ((ex->>'open')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_milestone_at(r->'open',_kind,_year,_period) END,
    'due', CASE WHEN ex->>'due' IS NOT NULL THEN ((ex->>'due')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') WHEN jsonb_typeof(ex)='string' THEN ((ex#>>'{}')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_milestone_at(r->'due',_kind,_year,_period) END,
    'late_close', CASE WHEN ex->>'late_close' IS NOT NULL THEN ((ex->>'late_close')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_milestone_at(r->'late_close',_kind,_year,_period) END);
END $$;

-- Hạn cuối (tương thích ngược): đọc mốc due từ shape mới, fallback shape cũ.
CREATE OR REPLACE FUNCTION public.biz_deadline_at(_kind text, _year int, _period int DEFAULT 1) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; ek text; months int; first_month int; base date; day_no int;
BEGIN
  IF NOT (private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.goal_submit') OR private.sig_can(auth.uid(),'biz.plan_submit') OR private.sig_can(auth.uid(),'biz.report_submit') OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.goal_approve')) THEN RAISE EXCEPTION 'Không có quyền xem deadline.'; END IF;
  IF _kind NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year') OR _year NOT BETWEEN 2000 AND 2200 THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  months:=CASE WHEN _kind LIKE '%month' THEN 1 WHEN _kind LIKE '%quarter' THEN 3 ELSE 12 END;
  IF _period<1 OR _period>12/months THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  ek:=_year::text||'-'||lpad(_period::text,2,'0');
  SELECT data->_kind INTO r FROM public.biz_deadline_config WHERE id=true;
  IF r IS NULL THEN RETURN NULL; END IF;
  IF r ? 'due' OR r ? 'open' OR r ? 'late_close' THEN
    IF r->'exceptions'->ek->>'due' IS NOT NULL THEN RETURN ((r->'exceptions'->ek->>'due')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'); END IF;
    IF jsonb_typeof(r->'exceptions'->ek)='string' THEN RETURN ((r->'exceptions'->ek#>>'{}')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'); END IF;
    RETURN public.biz_milestone_at(r->'due',_kind,_year,_period);
  END IF;
  IF r->'exceptions'->>ek IS NOT NULL THEN RETURN ((r->'exceptions'->>ek)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'); END IF;
  IF r->>'day' IS NULL THEN RETURN NULL; END IF;
  first_month:=(_period-1)*months+1;
  base:=make_date(_year,first_month,1);
  base:=CASE r->>'phase' WHEN 'before' THEN (base-interval '1 month')::date WHEN 'after' THEN (base+make_interval(months=>months))::date ELSE base END;
  day_no:=least((r->>'day')::int,extract(day FROM base+interval '1 month - 1 day')::int);
  RETURN ((base+(day_no-1))::timestamp+make_interval(hours=>coalesce((r->>'hour')::int,17),mins=>coalesce((r->>'minute')::int,0))) AT TIME ZONE 'Asia/Ho_Chi_Minh';
END $$;

-- Pha nộp của một kỳ: not_open | open | overdue | closed (none khi chưa cấu hình hạn cuối).
CREATE OR REPLACE FUNCTION public.biz_deadline_phase(_kind text, _year int, _period int DEFAULT 1, _now timestamptz DEFAULT now()) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE m jsonb; v_open timestamptz; v_due timestamptz; v_close timestamptz;
BEGIN
  m:=public.biz_deadline_milestones(_kind,_year,_period);
  v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
  IF v_due IS NULL THEN RETURN 'none'; END IF;
  IF v_open IS NOT NULL AND _now < v_open THEN RETURN 'not_open'; END IF;
  IF v_close IS NOT NULL AND _now > v_close THEN RETURN 'closed'; END IF;
  IF _now > v_due THEN RETURN 'overdue'; END IF;
  RETURN 'open';
END $$;

-- Lưu cấu hình: chấp nhận shape mới (open/due/late_close) và cũ; kiểm tra thứ tự mốc trên mọi kỳ 2024-2028; ghi lịch sử.
CREATE OR REPLACE FUNCTION public.biz_deadline_save(_data jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k text; r jsonb; ek text; ev jsonb; ms text; mr jsonb; y int; p int; pmax int; m jsonb; v_open timestamptz; v_due timestamptz; v_close timestamptz; old jsonb;
BEGIN
  IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý deadline.'; END IF;
  IF jsonb_typeof(_data) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  FOR k,r IN SELECT * FROM jsonb_each(_data) LOOP
    IF k NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year') OR jsonb_typeof(r)<>'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
    IF r ? 'due' OR r ? 'open' OR r ? 'late_close' THEN
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
      -- Kiểm tra thứ tự mở < hạn cuối < đóng bù trên mọi kỳ mẫu (gồm tháng 2, năm nhuận, chuyển năm).
      pmax:=CASE WHEN k LIKE '%month' THEN 12 WHEN k LIKE '%quarter' THEN 4 ELSE 1 END;
      FOR y IN 2024..2028 LOOP
        FOR p IN 1..pmax LOOP
          m:=jsonb_build_object(
            'open', public.biz_milestone_at(r->'open',k,y,p),
            'due', public.biz_milestone_at(r->'due',k,y,p),
            'late_close', public.biz_milestone_at(r->'late_close',k,y,p));
          v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
          IF v_open IS NOT NULL AND v_due IS NOT NULL AND v_open >= v_due THEN RAISE EXCEPTION 'Ngày mở nộp phải trước hạn cuối (kiểm tra kỳ %-%).', y, p; END IF;
          IF v_due IS NOT NULL AND v_close IS NOT NULL AND v_due >= v_close THEN RAISE EXCEPTION 'Hạn cuối phải trước ngày đóng nộp bù (kiểm tra kỳ %-%).', y, p; END IF;
          IF v_open IS NOT NULL AND v_close IS NOT NULL AND v_open >= v_close THEN RAISE EXCEPTION 'Ngày mở nộp phải trước ngày đóng nộp bù (kiểm tra kỳ %-%).', y, p; END IF;
        END LOOP;
      END LOOP;
    ELSE
      -- Shape cũ: giữ nguyên kiểm tra hiện có.
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
END $$;

REVOKE ALL ON FUNCTION public.biz_milestone_at(jsonb,text,int,int),public.biz_deadline_milestones(text,int,int),public.biz_deadline_phase(text,int,int,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_deadline_milestones(text,int,int),public.biz_deadline_phase(text,int,int,timestamptz) TO authenticated;