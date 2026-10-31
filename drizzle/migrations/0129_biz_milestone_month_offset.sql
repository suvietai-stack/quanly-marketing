-- Hỗ trợ chọn tháng tương đối linh hoạt (offset -1..12) cho từng mốc deadline; giữ tương thích phase cũ.
CREATE OR REPLACE FUNCTION public.biz_milestone_at(_rule jsonb, _kind text, _year int, _period int) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE months int; first_month int; base date; day_no int; v_offset int;
BEGIN
  IF _rule IS NULL OR jsonb_typeof(_rule) IS DISTINCT FROM 'object' OR _rule->>'day' IS NULL THEN RETURN NULL; END IF;
  months:=CASE WHEN _kind LIKE '%month' THEN 1 WHEN _kind LIKE '%quarter' THEN 3 ELSE 12 END;
  first_month:=(_period-1)*months+1;
  base:=make_date(_year,first_month,1);
  IF _rule->>'offset' IS NOT NULL THEN
    v_offset:=(_rule->>'offset')::int;
    IF v_offset NOT BETWEEN -1 AND 12 THEN RAISE EXCEPTION 'Tháng tương đối không hợp lệ.'; END IF;
    base:=(base+make_interval(months=>v_offset))::date;
  ELSE
    base:=CASE _rule->>'phase' WHEN 'before' THEN (base-interval '1 month')::date WHEN 'after' THEN (base+make_interval(months=>months))::date ELSE base END;
  END IF;
  day_no:=least((_rule->>'day')::int,extract(day FROM base+interval '1 month - 1 day')::int);
  RETURN ((base+(day_no-1))::timestamp+make_interval(hours=>coalesce((_rule->>'hour')::int,17),mins=>coalesce((_rule->>'minute')::int,0))) AT TIME ZONE 'Asia/Ho_Chi_Minh';
END $$;